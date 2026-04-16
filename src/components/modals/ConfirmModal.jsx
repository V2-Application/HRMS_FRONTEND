import React from 'react'
import { Modal, Button } from 'antd'

function ConfirmModal({
  open,
  onSubmit,
  onCancel,
  loading = false,
  title = 'Are you sure',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) {
  return (
    <Modal
      title={title}
      centered
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>,
        <Button key="submit" type="primary" onClick={onSubmit} loading={loading}>
          {confirmText}
        </Button>,
      ]}
    >
      <p>Please confirm you action on this.</p>
    </Modal>
  )
}

export default ConfirmModal
