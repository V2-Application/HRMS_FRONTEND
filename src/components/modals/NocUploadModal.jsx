import React, { useEffect, useState } from 'react'
import { Modal, Upload, Button, Typography, Space, message, Spin, Tag, Empty } from 'antd'
import { UploadOutlined, PaperClipOutlined } from '@ant-design/icons'
import { getInactiveEmployeeNoc, uploadInactiveEmployeeNoc } from '../../services/Services'

const { Text, Paragraph } = Typography

// Mirrors the server-side whitelist in UploadInactiveEmployeeNocAsync. Kept in
// sync deliberately: the client check is only to give fast feedback, the server
// is what actually enforces it.
const ACCEPT = '.pdf,.jpg,.jpeg,.png,.doc,.docx'
const MAX_MB = 10

/**
 * NOC attachment for an employee who has already been made inactive.
 *
 * One current NOC per employee. Uploading a replacement soft-deletes the
 * previous one server-side, so the history is retained but this screen only
 * ever shows the current document.
 */
export default function NocUploadModal({ visible, onClose, employee, onUploaded }) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [noc, setNoc] = useState(null)
  const [fileList, setFileList] = useState([])

  const employeeId = employee?.employeeId
  const ecode = employee?.ecode
  const name = employee?.fullName

  const load = async () => {
    if (!employeeId) return
    setLoading(true)
    try {
      const res = await getInactiveEmployeeNoc(employeeId)
      setNoc(res?.data?.data ?? null)
    } catch (e) {
      // An unreachable fetch must not block the upload itself.
      console.error('NOC fetch failed:', e)
      setNoc(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible) {
      setFileList([])
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, employeeId])

  const beforeUpload = (file) => {
    const ext = `.${(file.name.split('.').pop() || '').toLowerCase()}`
    if (!ACCEPT.split(',').includes(ext)) {
      message.error(`Only ${ACCEPT} files are allowed.`)
      return Upload.LIST_IGNORE
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      message.error(`File must be ${MAX_MB} MB or smaller.`)
      return Upload.LIST_IGNORE
    }
    return false // handled manually on submit
  }

  const handleUpload = async () => {
    const file = fileList[0]?.originFileObj
    if (!file) {
      message.warning('Please choose a file first.')
      return
    }
    setSaving(true)
    try {
      const res = await uploadInactiveEmployeeNoc(employeeId, file)
      message.success(res?.data?.message || 'NOC uploaded')
      setFileList([])
      await load()
      onUploaded?.()
    } catch (e) {
      message.error(e?.response?.data?.message || 'NOC upload failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={`NOC — ${ecode || ''}${name ? ` · ${name}` : ''}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={560}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
        </div>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Current NOC</Text>
            <div style={{ marginTop: 8 }}>
              {noc?.hasNoc ? (
                <Space direction="vertical" size={4}>
                  <a href={noc.fileUrl} target="_blank" rel="noreferrer">
                    <PaperClipOutlined /> {noc.fileName}
                  </a>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Uploaded by {noc.uploadedBy || '—'}
                    {noc.uploadedOn ? ` on ${new Date(noc.uploadedOn).toLocaleString()}` : ''}
                  </Text>
                </Space>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<Tag color="orange">No NOC uploaded yet</Tag>}
                  style={{ margin: 0 }}
                />
              )}
            </div>
          </div>

          <div>
            <Text strong>{noc?.hasNoc ? 'Replace NOC' : 'Upload NOC'}</Text>
            <div style={{ marginTop: 8 }}>
              <Upload
                maxCount={1}
                accept={ACCEPT}
                beforeUpload={beforeUpload}
                fileList={fileList}
                onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
                onRemove={() => setFileList([])}
              >
                <Button icon={<UploadOutlined />}>Choose file</Button>
              </Upload>
            </div>
            <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8, marginBottom: 0 }}>
              {ACCEPT} · up to {MAX_MB} MB.
              {noc?.hasNoc
                ? ' Uploading replaces the current NOC. The previous one is kept in history, not deleted.'
                : ''}
            </Paragraph>
          </div>

          <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={onClose}>Close</Button>
            <Button
              type="primary"
              loading={saving}
              disabled={fileList.length === 0}
              onClick={handleUpload}
            >
              {noc?.hasNoc ? 'Replace' : 'Upload'}
            </Button>
          </Space>
        </Space>
      )}
    </Modal>
  )
}
