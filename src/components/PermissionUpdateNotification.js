import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { message } from 'antd'

const PermissionUpdateNotification = () => {
  const [lastUpdate, setLastUpdate] = useState(null)
  const permissions = useSelector((state) => state.auth.permissions)

  useEffect(() => {
    // Show notification when permissions change
    if (permissions && permissions.length > 0) {
      const currentTime = Date.now()
      
      if (lastUpdate && currentTime - lastUpdate > 1000) {
        // Only show notification if it's been more than 1 second since last update
        message.success('Permissions updated successfully!', 3)
      }
      
      setLastUpdate(currentTime)
    }
  }, [permissions, lastUpdate])

  // This component doesn't render anything visible
  // It just handles the notification logic
  return null
}

export default PermissionUpdateNotification 