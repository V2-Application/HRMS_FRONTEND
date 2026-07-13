import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
  CNavGroup,
  CNavItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMoney, cilCash, cilLocationPin } from '@coreui/icons'

import { AppSidebarNav } from './AppSidebarNav'

import { logo } from 'src/assets/brand/logo'
import { sygnet } from 'src/assets/brand/sygnet'
import logo_chhota from '../assets/images/v2logo.jpg'
import logo_bada from '../assets/images/studio.png'
import logo_bada_new from '../assets/images/V2-Logo-1.png'
import logo_bada_new_new from '../assets/images/V2-Logo-2.png'
// import { adminNav, hrNav, employeeNav, userNav, clusterNav, fullMenuList } from '../_nav'
import { buildMenuFromPermissions, fullMenuList } from '../_nav'
import { set } from '../redux/uiSlice'
import { setFilteredSideMenu } from '../redux/authSlice'
import { Image } from 'antd'
import { fetchRBACPermissions } from '../services/Services'
import { useLocation } from 'react-router-dom'
import signalRService from '../services/signalRService'

const AppSidebar = ({ menus, userdata, ...props }) => {
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const { sidebarShow, unfoldable, theme } = useSelector((state) => state.ui)
  const [components, setComponents] = useState([])
  // const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  // const sidebarShow = useSelector((state) => state.sidebarShow)
  const [imgeffect, setimgeffect] = useState(false)
  const excludeMenus = ['Leave', 'View Attendance', 'Payroll', 'Separation']
  // console.log('components: ', components)

  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const storedPermissions = useSelector((state) => state?.auth?.permissions || [])

  // console.log('filteredSideMenu: ', filteredSideMenu)
  // console.log('filteredSideMenu type:', typeof filteredSideMenu)
  // console.log('filteredSideMenu length:', filteredSideMenu.length)
  // console.log('filteredSideMenu is array:', Array.isArray(filteredSideMenu))
  // console.log('storedPermissions: ', storedPermissions)

  // Rebuild filtered menu from stored permissions if needed
  useEffect(() => {
    if (
      storedPermissions &&
      storedPermissions.length > 0 &&
      (!filteredSideMenu || filteredSideMenu.length === 0)
    ) {
      // console.log('Rebuilding filtered menu from stored permissions')
      const rebuiltMenu = buildMenuFromPermissions(fullMenuList, storedPermissions)
      dispatch(setFilteredSideMenu(rebuiltMenu))
    }
  }, [storedPermissions, filteredSideMenu, dispatch])

  // Start SignalR connection for real-time permission updates
  useEffect(() => {
    // console.log('🔍 SignalR useEffect triggered with:', {
    //   userdata: !!userdata,
    //   storedPermissions: !!storedPermissions,
    //   permissionsLength: storedPermissions?.length,
    //   userdataKeys: userdata ? Object.keys(userdata) : [],
    //   permissionsKeys: storedPermissions?.[0] ? Object.keys(storedPermissions[0]) : [],
    // })

    if (userdata && storedPermissions && storedPermissions.length > 0) {
      console.log('✅ Starting SignalR connection for real-time permission updates')
      console.log('User data:', userdata)
      console.log('Stored permissions:', storedPermissions)

      // Add a small delay to ensure everything is loaded
      setTimeout(() => {
        console.log('🚀 Delayed SignalR connection start...')
        signalRService.startConnection()
      }, 1000)
    } else {
      // console.log('❌ Cannot start SignalR connection:', {
      //   hasUserData: !!userdata,
      //   hasPermissions: !!storedPermissions,
      //   permissionsLength: storedPermissions?.length,
      // })
    }

    // Cleanup function to stop SignalR connection
    return () => {
      // console.log('🧹 Cleaning up SignalR connection')
      signalRService.stopConnection()
    }
  }, [userdata, storedPermissions])

  // Use the permissions-based filtered menu if available, otherwise fall back to role-based
  const getMenuList = () => {
    // console.log('getMenuList called')
    // console.log(
    //   'filteredSideMenu exists and has length:',
    //   filteredSideMenu && filteredSideMenu.length > 0,
    // )

    if (filteredSideMenu && filteredSideMenu.length > 0) {
      // console.log('Using permissions-based filtered menu')
      return filteredSideMenu
    }

    // console.log('Falling back to role-based filtering')
    // Fallback to role-based filtering if no permissions-based menu
    const allowedMenus = getNewMenuslistRole()
    return filterMenus(fullMenuList, allowedMenus)
  }

  const filterMenus = (fullMenuList, allowedMenus) => {
    return (
      fullMenuList
        // .filter((menu) => {
        //   if (isStore && excludeMenus.includes(menu?.name)) {
        //     return false
        //   }
        //   return true
        // })
        .map((menu) => {
          if (menu?.items) {
            const filteredItems = menu.items
              // .filter((item) => allowedMenus.includes(item.name))
              .map((item) => {
                // if (item?.name === 'Attendance') {
                //   return {
                //     ...item,
                //     to: hasReports ? '/emp-attandance-list' : '/attandance/track',
                //   }
                // }
                return item
              })
            // .map((item) =>
            //   item?.name === 'Attendance' && hasReports === true
            //     ? '/emp-attandance-list'
            //     : '/attandance/track',
            // )
            if (filteredItems.length > 0) {
              return { ...menu, items: filteredItems }
            }
          }
          //  else if (allowedMenus.includes(menu.name)) {
          //   return menu
          // }
          return null
        })
        .filter(Boolean)
    )
  }

  const getNewMenuslistRole = () => {
    switch (userdata.role) {
      case 'Audit':
        return [
          'Dashboard',
          'Requested Leaves',
          'Interviews',
          'Candidate List',
          // 'Leave',
          'View Attendance',
          'Team Attendance',
          'Regularize Request',
          'Resignation',
          'Resignation Applications',
          'Employees Master',
          'Salary Slips',
          'Leaves Status',
          'My Leaves',
          // 'Profile Update Application'
          'My Profile',
          'Employees Transfer',
          'Applicant List',
        ]
      case 'ClusterManager':
        return [
          'Dashboard',
          'Requested Leaves',
          'Interviews',
          'Candidate List',
          // 'Leave',
          'View Attendance',
          'Team Attendance',
          'Regularize Request',
          'Resignation',
          'Resignation Applications',
          'Employees Master',
          'Salary Slips',
          'Leaves Status',
          'My Leaves',
          // 'Profile Update Application'
          'My Profile',
          'Employees Transfer',
          'Applicant List',
        ]
      case 'Master':
        return [
          'RBAC Panel',
          'Role Assignment',
          'Dashboard',
          'Access Assignment',
          'Access Management',
          'Openings',
          'Employees Master',
          'Requested Leaves',
          'Interviews',
          'Candidate List',
          'Leave',
          'View Attendance',
          'Team Attendance',
          'Regularize Request',
          'Add Location',
          'Locations',
          'Designations',
          'Departments',
          'Seat',
          'Resignation',
          'Resignation Applications',
          'Applicant List',
          'Add Applicant',
          'OnBoard Form',
          'Interview Form',
          'Openings List View',
          'JD',
          'jdupload',
          'Payroll',
          'Paid By Bank',
          'Given To Bank',
          'Return By Bank',
          'Weekly-off Holiday',
          'Weekly-off Policy',
          'Employee Salary Add-ons',
          'Employee Deduction',
          'Employee Leaves',
          'Resignation Status',
          'Resignation (Self)',
          'Resignation (Others)',
          'Summary',
          'Location Master',
          'Bgt Seat Master',
          'Emp Code Seat Master',
          'Location Master',
          'Store-State Linking',
          'Bgt Seat Master',
          'Emp Code Seat Master',
          'Emp Attendnace',
          'Emp Deduction',
          'Applicability',
          'Emp Salary Structure',
          'Salary',
          'Month Salary',
          'Payable Days',
          'Leave',
          'Comp Off',
          'Earned Leaves',
          'Casual Leaves',
          'Gross Earning',
          'Deduction',
          'PF',
          'ESI',
          'Gratuity & Bonus',
          'Leave Opening Balance',
          'Emp Personal Details',
          'Emp Statutory Details',
          'Emp Degree Qualifications',
          'Emp Past Experience',
          'Emp Joining Releaving',
          'Emp Revised Dept-Desg-Loc',
          'Salary Slips',
          'LOC & EMP',
          'Salary Paid Status',
          'Leave Master',
          'Bgt Salary Structure',
          'Gross Earning Details',
          'Deduction Details',
          'Gratuity & Bonus',
          'Leaves Status',
          'Additional Payment',
          'Net Payable',
          'Gratutiy & Bonus',
          'Emp Salary Status',
          'My Leaves',
          'Comp Off',
          'Salary Recalculate',
          'Salary Summery',
          'Employees Transfer',
          'Profile Update Application',
          'My Profile',
          'New Stores',
          'Shift Alignment',
          'Paid By Cash',
          'Salary Recalculate',
          'Document Generate',
          'F&F',
          'Groups',
          'Holidays',
          'Employee-Role List',
        ]
      case 'Finance':
        return [
          'Requested Leaves',
          'View Attendance',
          'Team Attendance',
          'Regularize Request',
          'Resignation',
          'Paid By Bank',
          'Given To Bank',
          'Return By Bank',
          'Salary Slips',
          'My Leaves',
          'My Profile',
          'Resignation Status',
          'Resignation (Self)',
          'Resignation (Others)',
        ]
      case 'SuperAdmin':
        return [
          'Dashboard',
          'Access Assignment',
          'Access Management',
          'Openings',
          'Employees Master',
          'Requested Leaves',
          'Interviews',
          'Candidate List',
          // 'Leave',
          'View Attendance',
          'Team Attendance',
          'Regularize Request',
          'Add Location',
          'Locations',
          'Designations',
          'Departments',
          'Seat',
          'Resignation',
          'Resignation Applications',
          'Applicant List',
          'Add Applicant',
          'OnBoard Form',
          'Interview Form',
          'Openings List View',
          'JD',
          'jdupload',
          'Resignation Status',
          'Resignation (Self)',
          'Resignation (Others)',
          'View Interview Form',
          'Salary Slips',
          'Leaves Status',
          'My Leaves',
          'Employees Transfer',
          // 'Profile Update Application'
          'My Profile',
          'New Stores',
          'Store Routing',
          'Store Routing View',
          'Incentive',
        ]
      case 'HR':
        return [
          'Dashboard',
          'Access Assignment',
          'Access Management',
          'Openings',
          'Employees Master',
          'Requested Leaves',
          'Interviews',
          'Candidate List',
          // 'Leave',
          'View Attendance',
          'Team Attendance',
          'Regularize Request',
          'Locations',
          'Designations',
          'Departments',
          'Seat',
          'Resignation',
          'Resignation Applications',
          'Applicant List',
          'Add Applicant',
          'OnBoard Form',
          'Interview Form',
          'Salary Slips',
          'Leaves Status',
          'My Leaves',
          'Salary Controll Panel',
          // 'Profile Update Application'
          'My Profile',
          'Employees Transfer',
          'Resignation (Self)',
          'Salary Recalculate',
          'Document Generate',
          'New Stores',
          'Store Routing',
          'Store Routing View',
        ]
      case 'Employee':
        return [
          'Dashboard',
          'Requested Leaves',
          // 'Leave',
          'Interviews',
          'View Attendance',
          'Team Attendance',
          'Regularize Request',
          'Resignation (Self)',
          'Resignation (Others)',
          'Resignation Status',
          'Salary Slips',
          'Leaves Status',
          'My Leaves',
          // 'Profile Update Application'
          'My Profile',
          'Details',
          'Applicant List',
        ]
      // case 'NSO HR-EXE':
      // case 'LP':
      // case 'L&D':
      // case 'HR-HEAD':
      // case 'RETAIL ZM':
      // case 'NSO-HR Mgr':
      // case 'NSO HR HEAD':
      // case 'RETAIL CM/RM':
      //   return [
      //     'Dashboard',
      //     'Requested Leaves',
      //     // 'Leave',
      //     'Interviews',
      //     'Attendance',
      //     'Team Attendance',
      //     'Regularize Request',
      //     'Resignation (Self)',
      //     'Resignation (Others)',
      //     'Resignation Status',
      //     'Salary Slips',
      //     'Leaves Status',
      //     'My Leaves',
      //     // 'Profile Update Application'
      //     'My Profile',
      //     'Details',
      //     'Applicant List',
      //   ]
      case 'RetailHead':
        return [
          'Dashboard',
          'Requested Leaves',
          // 'Leave',
          'Interviews',
          'View Attendance',
          'Team Attendance',
          'Regularize Request',
          'Resignation (Self)',
          'Resignation (Others)',
          'Resignation Status',
          'Salary Slips',
          'Leaves Status',
          'My Leaves',
          'Employees Master',
          // 'Profile Update Application'
          'My Profile',
          'Employees Transfer',
          'Candidate List',
          'Applicant List',
        ]
      case 'RegionalManager':
        return [
          'Dashboard',
          'Requested Leaves',
          // 'Leave',
          'Interviews',
          'View Attendance',
          'Team Attendance',
          'Regularize Request',
          'Resignation (Self)',
          'Resignation (Others)',
          'Resignation Status',
          'Salary Slips',
          'Leaves Status',
          'My Leaves',
          'Employees Master',
          // 'Profile Update Application'
          'My Profile',
          'Employees Transfer',
          'Candidate List',
          'Applicant List',
        ]
      case 'Zone':
        return [
          'Dashboard',
          'Requested Leaves',
          // 'Leave',
          'Interviews',
          'View Attendance',
          'Team Attendance',
          'Regularize Request',
          'Resignation (Self)',
          'Resignation (Others)',
          'Resignation Status',
          'Salary Slips',
          'Leaves Status',
          'My Leaves',
          'Employees Master',
          // 'Profile Update Application'
          'My Profile',
          'Employees Transfer',
          'Candidate List',
          'Applicant List',
        ]
      case 'Applicant':
        return ['OnBoard Form']
      case 'StoreHR':
        return [
          'Dashboard',
          'Requested Leaves',
          'Candidate List',
          // 'Leave',
          'View Attendance',
          'Team Attendance',
          'Regularize Request',
          'Resignation',
          'Resignation Applications',
          'Employees Master',
          'Salary Slips',
          'Leaves Status',
          'My Leaves',
          // 'Profile Update Application'
          'My Profile',
          'Employees Transfer',
          'New Employee',
          'Resignation (Self)',
          'Applicant List',
          'Add Applicant',
        ]
      default:
        return []
    }
  }

  // Example usage
  const allowedMenus = getNewMenuslistRole()
  // const filteredMenuList = filterMenus(fullMenuList, allowedMenus)
  const filteredMenuList = getMenuList()

  // Statutory Policy (PTax / LWF) masters — visible to IT SuperAdmin only.
  const isItSuperAdmin = (userdata?.role || '').trim().toLowerCase() === 'it superadmin'
  const statutoryPolicyGroup = {
    component: CNavGroup,
    name: 'Statutory Policy',
    to: '/statutory-policy',
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'PTax Policy',
        to: '/ptax-policy',
        icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'LWF Policy',
        to: '/lwf-policy',
        icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
      },
    ],
  }
  // Biomax attendance device-location -> ST code mapping — IT SuperAdmin only.
  const biomaxLocationMappingItem = {
    component: CNavItem,
    name: 'Biomax Attendance Location Mapping',
    to: '/master/biomax-attendance-location-mapping',
    icon: <CIcon icon={cilLocationPin} customClassName="nav-icon" />,
  }
  const roleMenus = isItSuperAdmin
    ? [...filteredMenuList, statutoryPolicyGroup, biomaxLocationMappingItem]
    : filteredMenuList

  const checkSidebarColor = () => {
    const toggler = document.querySelector('.sidebar-toggler')

    if (toggler) {
      const bgColor = window.getComputedStyle(toggler).backgroundColor

      if (bgColor === 'red') {
        // Red in RGB format
        // console.log('>>>>>>>>>>>>>>>>>>>>>>>>.false')

        setimgeffect(false)
      } else {
        // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>.. true')

        setimgeffect(false)
      }
    }
  }

  useEffect(() => {
    checkSidebarColor()
  }, [unfoldable])

  const fetchComponents = async () => {
    try {
      const response = await fetchRBACPermissions()

      if (response?.status === 200) setComponents(response?.data?.data || [])
      else setComponents([])
    } catch (error) {
      console.error('error fetching component api: ', error)
    }
  }

  useEffect(() => {
    fetchComponents()
  }, [pathname])
  // const result = buildMenuFromPermissions(fullMenuList, permissions)

  // console.log('result: ', result)
  return (
    <CSidebar
      className="border-end"
      colorScheme="light"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch(set({ sidebarShow: visible }))
      }}
    >
      <CSidebarHeader>
        <CSidebarBrand to="/">
          {!unfoldable ? (
            <div className="vv">
              <Image
                className="ab"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '60%',
                }}
                preview={false}
                // src={logo_bada_new}
                src={theme === 'dark' ? logo_bada_new_new : logo_bada_new}
              />
            </div>
          ) : (
            <div
              className="cd"
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <Image style={{ maxWidth: '50px', height: 'auto' }} src={logo_chhota} />
            </div>
          )}

          {/* <CIcon customClassName="sidebar-brand-full" icon={logos} height={32} />
          <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} /> */}
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch(set({ sidebarShow: false }))}
        />
      </CSidebarHeader>
      <AppSidebarNav items={roleMenus} menus={menus} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler onClick={() => dispatch(set({ unfoldable: !unfoldable }))} />
        {/* <button
          onClick={() => signalRService.handlePermissionChange({ changeType: 'manual' })}
          style={{
            marginLeft: '10px',
            padding: '5px 10px',
            fontSize: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
          title="Refresh Permissions"
        >
          🔄
        </button> */}

        {/* <button
          onClick={async () => {
            // console.log('🌐 Testing backend connectivity...')
            const isReachable = await signalRService.testBackendConnectivity()
            if (isReachable) {
              // console.log('✅ Backend is reachable, trying SignalR connection...')
              await signalRService.startConnection()
            }
          }}
          style={{
            marginLeft: '10px',
            padding: '5px 10px',
            fontSize: '12px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
          title="Test Backend Connectivity"
        >
          🌐
        </button> */}

        {/* <button
          onClick={async () => {
            // console.log('🚀 Manually starting SignalR connection...')
            await signalRService.startConnection()
          }}
          style={{
            marginLeft: '10px',
            padding: '5px 10px',
            fontSize: '12px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
          title="Start SignalR Connection"
        >
          ��
        </button> */}

        {/* <button
          onClick={() => {
            // console.log('📊 SignalR Connection Status:')
            // console.log('Is Connected:', signalRService.isConnectionActive())
            // console.log('Connection Object:', signalRService.connection)
            if (signalRService.connection) {
              // console.log('Connection State:', signalRService.connection.state)
            }
          }}
          style={{
            marginLeft: '10px',
            padding: '5px 10px',
            fontSize: '12px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
          }}
          title="Check Connection Status"
        >
          ��
        </button> */}
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
