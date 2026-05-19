import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'
import routes from '../routes'
import Page404 from '../views/pages/page404/Page404'
import NotFoundPage from '../views/pages/notAuthroised/NotFoundPage'
import { useSelector } from 'react-redux'
import RoutePermissionGuard from './RoutePermissionGuard'

const AppContent = ({ userdata, ...props }) => {
  const userRole = userdata?.role
  const { theme } = useSelector((state) => state.ui)

  return (
    <div
      style={{
        width: '100%',
        padding: '1rem',
        marginRight: 'auto',
        marginLeft: 'auto',
      }}
      className={theme === 'dark' ? 'px-4 dark-theme' : 'px-4'}
    >
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => {
            const isAllowed = route.roles?.includes(userRole)
            // console.log('isAllowed>>>>>>>>>>>',isAllowed);

            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={
                    <RoutePermissionGuard routePath={route.path}>
                      <route.element userdata={userdata} />
                    </RoutePermissionGuard>
                  }
                />
              )
            )
          })}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default React.memo(AppContent)
