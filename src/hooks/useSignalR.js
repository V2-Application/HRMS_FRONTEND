import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import signalRService from '../services/signalRService'

export const useSignalR = () => {
  const userdata = useSelector((state) => state.auth.data)
  const permissions = useSelector((state) => state.auth.permissions)
  const connectionRef = useRef(null)

  useEffect(() => {
    // Only start connection if user is authenticated and has permissions
    if (userdata && permissions && permissions.length > 0) {
      console.log('useSignalR: Starting SignalR connection')

      // Start the connection
      signalRService.startConnection()
      connectionRef.current = signalRService

      // Cleanup function
      return () => {
        console.log('useSignalR: Cleaning up SignalR connection')
        if (connectionRef.current) {
          connectionRef.current.stopConnection()
        }
      }
    }
  }, [userdata, permissions])

  // Return the service instance for manual operations
  return signalRService
}
