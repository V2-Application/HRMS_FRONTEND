import React from 'react'
// import { AppContent, AppSidebar, AppFooter, AppHeader, AppBreadcrumb } from '../components/index'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import { useSelector } from 'react-redux'
import IdleLogoutHandler from '../components/modals/IdleLogoutHandler '
import PermissionUpdateNotification from '../components/PermissionUpdateNotification'

const DefaultLayout = ({ userdata, menus, auth, ...props }) => {
  const { data } = useSelector((state) => state.auth)

  return (
    <div>
      <IdleLogoutHandler />
      <PermissionUpdateNotification />
      <AppSidebar userdata={data} menus={menus} />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader userdata={data} auth={auth} />
        {/* <AppBreadcrumb/> */}
        <div
          className="body flex-grow-1"
          style={{ display: 'flex', flexDirection: 'row', gap: 10 }}
        >
          <AppContent userdata={data} />
        </div>
      </div>
    </div>
  )
}

export default DefaultLayout
