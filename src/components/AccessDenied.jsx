import React from 'react'
import { Result } from 'antd'

const AccessDenied = ({ message }) => {
  return (
    <Result
      status="403"
      title="Access Denied"
      subTitle={message || 'You do not have access to this page.'}
    />
  )
}

export default AccessDenied
