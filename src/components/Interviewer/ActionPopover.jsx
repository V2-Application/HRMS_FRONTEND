import React, { useState } from 'react'
import { Popover } from 'antd'
import { Link } from 'react-router-dom'
import { StepForwardOutlined } from '@ant-design/icons'
import RemarksContent from './RemarksContent'

const ActionPopover = () => {
  const [visible, setVisible] = useState(false)

  const handleVisibleChange = (newVisible) => {
    setVisible(newVisible)
  }

  const handleRemarksSubmit = (remarks) => {
    // console.log('Submitted remarks:', remarks)
    setVisible(false)
  }
  return (
    <Popover
      placement="left"
      content={<RemarksContent onSubmit={handleRemarksSubmit} />}
      trigger={'click'}
      visible={visible}
      onVisibleChange={handleVisibleChange}
    >
      <Link>
        <StepForwardOutlined style={{ fontSize: '18px' }} />
      </Link>
    </Popover>
  )
}

export default ActionPopover
