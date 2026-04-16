import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import store from '../redux/store'
import { setPermissions, setFilteredSideMenu } from '../redux/authSlice'
import { buildMenuFromPermissions, fullMenuList } from '../_nav'

class SignalRService {
  constructor() {
    this.connection = null
    this.isConnected = false
  }

  // Method to test basic backend connectivity
  async testBackendConnectivity() {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

      // Try to connect to the SignalR hub directly instead of testing a health endpoint
      console.log('🧪 Testing SignalR hub connectivity directly...')

      // Create a temporary connection to test if the hub is accessible
      const testConnection = new HubConnectionBuilder()
        .withUrl(`${baseUrl}permissionHub`)
        .configureLogging(LogLevel.Warning)
        .build()

      try {
        await testConnection.start()
        console.log('✅ SignalR hub is accessible!')
        await testConnection.stop()
        return true
      } catch (hubError) {
        console.log('⚠️ SignalR hub test failed:', hubError.message)
        // Don't fail completely - let the main connection attempt proceed
        return true
      }
    } catch (error) {
      console.log('❌ Backend connectivity test failed:', error.message)
      // Don't fail completely - let the main connection attempt proceed
      return true
    }
  }

  async startConnection() {
    try {
      console.log('=== Starting SignalR Connection ===')

      // Get the base URL from .env file
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const hubUrl = `${baseUrl}permissionHub`

      console.log('Environment API URL:', import.meta.env.VITE_API_URL)
      console.log('Base URL:', baseUrl)
      console.log('Hub URL:', hubUrl)
      console.log('Connecting to SignalR hub:', hubUrl)

      this.connection = new HubConnectionBuilder()
        .withUrl(hubUrl)
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build()

      console.log('HubConnectionBuilder created successfully')
      console.log('Setting up event handlers...')

      // Set up event handlers
      this.setupEventHandlers()

      console.log('Event handlers set up, starting connection...')

      //USe await
      await this.connection.start()
      this.isConnected = true
      console.log('✅ SignalR Connected Successfully!')

      // Join user-specific groups
      console.log('Joining user groups...')
      await this.joinUserGroups()
      console.log('=== SignalR Connection Complete ===')
    } catch (error) {
      console.error('❌ SignalR Connection Error:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
      this.isConnected = false

      // Provide specific error guidance
      if (error.message.includes('Failed to start the connection')) {
        console.log('🔄 Connection failed - possible issues:')
        console.log('1. Backend SignalR hub not running at:', hubUrl)
        console.log('2. CORS not configured properly on backend')
        console.log('3. Network/firewall blocking connection')
        console.log('4. Backend service not started')
        console.log('🔧 Check your backend SignalR configuration')
      } else if (error.message.includes('Failed to complete negotiation')) {
        console.log('🔄 Negotiation failed - possible issues:')
        console.log('1. SignalR hub endpoint not found')
        console.log('2. Backend routing not configured')
        console.log('3. Hub class not properly registered')
        console.log('🔧 Verify your backend has: app.MapHub<PermissionHub>("/permissionHub")')
      }
    }
  }

  setupEventHandlers() {
    if (!this.connection) return

    // Handle permission changes for the user's role
    this.connection.on('PermissionChanged', async (data) => {
      console.log('Permission changed for role:', data)
      await this.handlePermissionChange(data, 'role')
    })

    // Handle user-specific permission changes
    this.connection.on('UserPermissionChanged', async (data) => {
      console.log('User permission changed:', data)
      await this.handlePermissionChange(data, 'user')
    })

    // Handle global permission changes
    this.connection.on('GlobalPermissionChanged', async (data) => {
      console.log('Global permission changed:', data)
      await this.handlePermissionChange(data, 'global')
    })

    // Handle group joining confirmation
    this.connection.on('GroupJoined', (groupType, id) => {
      console.log(`✅ Successfully joined ${groupType} group: ${id}`)
    })

    // Handle connection state changes
    this.connection.onreconnecting(() => {
      console.log('SignalR reconnecting...')
      this.isConnected = false
    })

    this.connection.onreconnected(() => {
      console.log('SignalR reconnected!')
      this.isConnected = true
      this.joinUserGroups()
    })

    this.connection.onclose(() => {
      console.log('SignalR connection closed')
      this.isConnected = false
    })
  }

  async joinUserGroups() {
    if (!this.connection || !this.isConnected) return

    try {
      const state = store.getState()
      const userData = state.auth.data
      const permissions = state.auth.permissions

      console.log('Joining user groups with data:', { userData, permissions })

      if (userData && permissions.length > 0) {
        const roleId = permissions[0]?.roleId
        const userId = userData.employeeId || userData.id

        console.log('User details for group joining:', {
          roleId,
          userId,
          roleName: permissions[0]?.roleName,
        })

        if (roleId) {
          try {
            console.log(`Attempting to join role group: Role_${roleId}`)
            //use await
            await this.connection.invoke('JoinRoleGroup', roleId)
            console.log(`✅ Successfully invoked JoinRoleGroup(${roleId})`)
          } catch (error) {
            console.error(`❌ Failed to join role group ${roleId}:`, error)
            console.error('Error details:', {
              message: error.message,
              name: error.name,
              stack: error.stack,
            })
          }
        } else {
          console.error('⚠️ No roleId found in permissions, cannot join role group')
        }

        if (userId) {
          try {
            console.log(`Attempting to join user group: User_${userId}`)
            await this.connection.invoke('JoinUserGroup', userId)
            console.log(`✅ Successfully invoked JoinUserGroup(${userId})`)
          } catch (error) {
            console.error(`❌ Failed to join user group ${userId}:`, error)
            console.error('Error details:', {
              message: error.message,
              name: error.name,
              stack: error.stack,
            })
          }
        } else {
          console.log('⚠️ No userId found, cannot join user group')
        }

        console.log('🎯 Group joining attempts completed')
      } else {
        // console.log('⚠️ No user data or permissions available for group joining')
      }
    } catch (error) {
      console.error('❌ Error in joinUserGroups:', error)
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      })
    }
  }

  async handlePermissionChange(data, changeType) {
    console.log('data.roleId: ', data)
    try {
      const state = store.getState()
      const userData = state.auth.data
      const currentPermissions = state.auth.permissions

      if (!userData || !currentPermissions || currentPermissions.length === 0) {
        // console.log('No user data or permissions, skipping permission refresh')
        return
      }

      // Determine if this change affects the current user
      let shouldRefetch = false
      const currentRoleId = currentPermissions[0]?.roleId
      const currentUserId = userData.employeeId || userData.id
      console.log('currentRoleId: ', currentRoleId)

      switch (changeType) {
        case 'role':
          // Only refetch if the change affects the current user's role
          if (data.roleId === currentRoleId) {
            // console.log(`Role ${data.roleId} changed - affects current user, will refetch permissions`)
            shouldRefetch = true
          } else {
            console.error(
              `Role ${data.roleId} changed - does not affect current user (role ${currentRoleId}), skipping`,
            )
            return
          }
          break

        case 'user':
          // Only refetch if the change affects the current user
          if (data.UserId === currentUserId) {
            // console.log(`User ${data.UserId} permissions changed - affects current user, will refetch permissions`)
            shouldRefetch = true
          } else {
            console.error(
              `User ${data.UserId} permissions changed - does not affect current user (${currentUserId}), skipping`,
            )
            return
          }
          break

        case 'global':
          // Always refetch for global changes
          // console.log('Global permission change - will refetch permissions for all users')
          shouldRefetch = true
          break

        default:
          // console.log('Unknown change type, skipping permission refresh')
          return
      }

      if (!shouldRefetch) {
        // console.log('Change does not affect current user, skipping permission refresh')
        return
      }

      // console.log('Refreshing permissions due to change:', data)

      // Fetch updated permissions from backend
      //use await
      const updatedPermissions = await this.fetchUpdatedPermissions()

      if (updatedPermissions && updatedPermissions.length > 0) {
        // Update permissions in Redux
        store.dispatch(setPermissions(updatedPermissions))

        // Rebuild filtered menu with new permissions
        const newFilteredMenu = buildMenuFromPermissions(fullMenuList, updatedPermissions)

        // Update filtered menu in Redux
        store.dispatch(setFilteredSideMenu(newFilteredMenu))

        // console.log('Permissions and sidebar updated successfully')

        // Show notification to the user
        this.showPermissionUpdateNotification(data, changeType)
      }
    } catch (error) {
      console.error('Error handling permission change:', error)
    }
  }

  async fetchUpdatedPermissions() {
    try {
      // Get the base URL from .env file
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

      // Get userId from Redux state
      const state = store.getState()
      const userData = state.auth.data
      const userId = userData?.employeeId || userData?.id

      if (!userId) {
        console.error('❌ No userId found in auth state')
        return null
      }

      const apiUrl = `${baseUrl}api/auth/refresh-permissions?userId=${userId}`

      // console.log('Fetching updated permissions from:', apiUrl)
      // console.log('User ID:', userId)

      // Call your backend API endpoint
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        // console.log('✅ Permissions fetched successfully:', data)
        return data?.data?.permissions || []
      } else {
        console.error(
          '❌ Failed to fetch updated permissions:',
          response.status,
          response.statusText,
        )
        return null
      }
    } catch (error) {
      console.error('❌ Error fetching updated permissions:', error)
      return null
    }
  }

  showPermissionUpdateNotification(data, changeType) {
    let message = ''

    switch (changeType) {
      case 'role':
        message = `Your role permissions have been updated. The sidebar has been refreshed.`
        break
      case 'user':
        message = `Your user permissions have been updated. The sidebar has been refreshed.`
        break
      case 'global':
        message = `System permissions have been updated. The sidebar has been refreshed.`
        break
      default:
        message = `Your permissions have been updated. The sidebar has been refreshed.`
    }

    // You can use any notification library here (Toast, Antd message, etc.)
    if (window.toast) {
      window.toast.info(message, {
        position: 'top-right',
        autoClose: 5000,
      })
    } else {
      // Fallback to browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Permissions Updated', {
          body: message,
          icon: '/favicon.ico',
        })
      }
    }
  }

  async stopConnection() {
    if (this.connection) {
      try {
        //use await
        await this.connection.stop()
        this.isConnected = false
        // console.log('SignalR connection stopped')
      } catch (error) {
        console.error('Error stopping SignalR connection:', error)
      }
    }
  }

  isConnectionActive() {
    return this.isConnected && this.connection?.state === 'Connected'
  }
}

// Create a singleton instance
const signalRService = new SignalRService()

export default signalRService
