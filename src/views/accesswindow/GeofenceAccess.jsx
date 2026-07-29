import React from 'react'
import AccessWindowPage from './AccessWindowPage'

const GeofenceAccess = () => (
  <AccessWindowPage
    base="GeofenceAccess"
    title="Geofence Access"
    note="Records geofence access windows per ecode / store / date. Note: geofence approvals are not date-restricted today, so 'Open approvals' is stored for record; geofence eligibility itself is still driven by the store's geofence-enabled flag."
  />
)

export default GeofenceAccess
