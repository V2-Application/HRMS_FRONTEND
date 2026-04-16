import React, { useState } from 'react'
import { useIdleTimer } from 'react-idle-timer'
import { Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../../redux/authSlice'
import { useDispatch } from 'react-redux'

const IdleLogoutHandler = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isWarningVisible, setIsWarningVisible] = useState(false)

  const handlePrompt = () => {
    setIsWarningVisible(true)
    // console.log("User is about to become idle");
  }

  const handleIdle = () => {
    setIsWarningVisible(false)
    // console.log("User is idle - logging out");
    dispatch(logoutUser())
    window.location.href = '/login'
    localStorage.removeItem('data')
  }

  const handleAction = () => {
    if (isWarningVisible) {
      // console.log("User became active again, hiding warning");
      setIsWarningVisible(false)
      reset() // reset timer since user is active
    }
  }

  const { reset } = useIdleTimer({
    timeout: 1000 * 60 * 15, // 15 minutes
    promptBeforeIdle: 1000 * 60 * 1, // Show warning 1 min before
    onPrompt: handlePrompt,
    onIdle: handleIdle,
    onAction: handleAction,
    debounce: 500,
  })

  return (
    <Modal
      title="Inactivity Warning"
      open={isWarningVisible}
      onCancel={() => {
        setIsWarningVisible(false)
        reset() // allow manual dismissal to count as interaction
      }}
      footer={null}
    >
      <p>You will be logged out in 1 minute due to inactivity.</p>
      <p>Please interact with the app to remain signed in.</p>
    </Modal>
  )
}

export default IdleLogoutHandler
