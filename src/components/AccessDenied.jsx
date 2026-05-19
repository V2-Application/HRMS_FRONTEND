import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Result } from 'antd'

const AccessDenied = ({ message }) => {
  const navigate = useNavigate()
  return (
    <Result
      status="403"
      title="Access Denied"
      subTitle={message || 'You do not have access to this page.'}
      extra={
        <Button type="primary" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      }
    />
  )
}

export default AccessDenied
