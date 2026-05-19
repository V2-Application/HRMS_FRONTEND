import React, { useEffect, useRef, useState } from 'react'
import { CSpinner } from '@coreui/react'
import AccessDenied from './AccessDenied'
import { checkPageAccess } from '../services/Services'

// Wraps a route's element. On mount, asks the backend whether the current
// employee can access this route pattern. The route PATTERN is what's
// stored in tblPageRouteMap (e.g. "/employee/update/:id"), so we pass
// `routePath` from the route definition, NOT window.location.pathname.
//
// If the route is not gated (no row, or IsActive=0 in tblPageRouteMap), the
// backend replies allowed=true. So this guard is cheap to apply to every
// route — the rollout is controlled server-side.
const RoutePermissionGuard = ({ routePath, children }) => {
  const [state, setState] = useState({ status: 'loading', reason: '' })
  const cancelled = useRef(false)

  useEffect(() => {
    cancelled.current = false
    setState({ status: 'loading', reason: '' })

    checkPageAccess(routePath)
      .then((res) => {
        if (cancelled.current) return
        setState({
          status: res?.allowed ? 'allowed' : 'denied',
          reason: res?.reason || '',
        })
      })
      .catch((err) => {
        if (cancelled.current) return
        // Fail-open on network/server errors so a flaky backend doesn't
        // brick the UI. The backend still enforces on the data APIs once
        // those are hardened (separate pass).
        // eslint-disable-next-line no-console
        console.warn('checkPageAccess failed; allowing render:', err?.message)
        setState({ status: 'allowed', reason: 'check-failed-failopen' })
      })

    return () => {
      cancelled.current = true
    }
  }, [routePath])

  if (state.status === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  if (state.status === 'denied') {
    return <AccessDenied message={state.reason} />
  }

  return children
}

export default RoutePermissionGuard
