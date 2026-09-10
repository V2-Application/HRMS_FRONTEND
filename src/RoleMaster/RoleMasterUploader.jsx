import { useState } from 'react'
import { Alert, Button, Modal, Space, Table, Tag, Typography, Upload, message } from 'antd'
import { DownloadOutlined, InboxOutlined } from '@ant-design/icons'
import { bulkUploadRoles, downloadRoleTemplate } from '../services/Services'

const { Text } = Typography
const { Dragger } = Upload

const outcomeTag = (outcome) => {
  const v = String(outcome || '').toLowerCase()
  if (v === 'created') return <Tag color="green">Created</Tag>
  if (v === 'updated') return <Tag color="blue">Updated</Tag>
  if (v === 'skipped') return <Tag color="orange">Skipped</Tag>
  if (v === 'error') return <Tag color="red">Error</Tag>
  return <Tag>{String(outcome ?? '-')}</Tag>
}

/**
 * Bulk upload for the HR Role Master. Matches on role name, so re-uploading the
 * same sheet updates instead of duplicating, and an upload never deletes a role
 * that is missing from the sheet.
 */
const RoleMasterUploader = ({ isOpen, setIsOpen, refreshData }) => {
  const [fileList, setFileList] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isTemplateLoading, setIsTemplateLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [errorText, setErrorText] = useState('')

  const reset = () => {
    setFileList([])
    setResult(null)
    setErrorText('')
  }

  const handleClose = () => {
    reset()
    setIsOpen(false)
  }

  const handleTemplate = async () => {
    try {
      setIsTemplateLoading(true)
      const res = await downloadRoleTemplate()

      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'RoleMaster_Template.xlsx'
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      message.error(error?.response?.data?.message || 'Could not download the template')
    } finally {
      setIsTemplateLoading(false)
    }
  }

  const handleUpload = async () => {
    const file = fileList[0]?.originFileObj
    if (!file) {
      message.error('Please choose a file first')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setIsUploading(true)
      setErrorText('')
      setResult(null)

      const res = await bulkUploadRoles(formData)

      if (res?.status === 200 && res?.data?.status !== false) {
        setResult(res.data?.data ?? null)
        message.success(res.data?.message || 'Upload complete')
        await refreshData()
      } else {
        setErrorText(res?.data?.message || 'Upload failed')
      }
    } catch (error) {
      // The API reports row-level problems in `data` even when it rejects the
      // sheet, so show both the message and any rows it managed to evaluate.
      const data = error?.response?.data
      setErrorText(data?.message || 'Upload failed')
      if (data?.data) setResult(data.data)
    } finally {
      setIsUploading(false)
    }
  }

  const columns = [
    { title: 'Row', dataIndex: 'row', key: 'row', width: 70 },
    { title: 'Role Name', dataIndex: 'roleName', key: 'roleName', width: 220, ellipsis: true },
    { title: 'Outcome', dataIndex: 'outcome', key: 'outcome', width: 110, render: outcomeTag },
    { title: 'Detail', dataIndex: 'message', key: 'message', ellipsis: true },
  ]

  return (
    <Modal
      title="Bulk Upload Roles"
      open={isOpen}
      onCancel={handleClose}
      width={760}
      footer={[
        <Button
          key="template"
          icon={<DownloadOutlined />}
          loading={isTemplateLoading}
          onClick={handleTemplate}
        >
          Download Template
        </Button>,
        <Button key="cancel" onClick={handleClose}>
          Close
        </Button>,
        <Button
          key="upload"
          type="primary"
          loading={isUploading}
          disabled={!fileList.length}
          onClick={handleUpload}
        >
          Upload
        </Button>,
      ]}
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Alert
          type="info"
          showIcon
          message="Role Name is required; Description and Active (Yes/No) are optional."
          description="A role name that already exists is updated rather than duplicated, and roles missing from the sheet are left untouched — an upload never deletes a role."
        />

        <Dragger
          accept=".xlsx,.xls"
          maxCount={1}
          fileList={fileList}
          beforeUpload={() => false} // upload happens on the button, not on drop
          onChange={({ fileList: fl }) => {
            setFileList(fl.slice(-1))
            setResult(null)
            setErrorText('')
          }}
          onRemove={() => reset()}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag the roles sheet here</p>
          <p className="ant-upload-hint">.xlsx or .xls, one sheet</p>
        </Dragger>

        {errorText ? <Alert type="error" showIcon message={errorText} /> : null}

        {result ? (
          <>
            <Space size={16}>
              <Text>
                Created: <Text strong>{result.created ?? 0}</Text>
              </Text>
              <Text>
                Updated: <Text strong>{result.updated ?? 0}</Text>
              </Text>
              <Text>
                Skipped: <Text strong>{result.skipped ?? 0}</Text>
              </Text>
            </Space>

            <Table
              rowKey={(r) => `${r.row}-${r.roleName}`}
              size="small"
              bordered
              columns={columns}
              dataSource={Array.isArray(result.rows) ? result.rows : []}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              scroll={{ y: 260 }}
            />
          </>
        ) : null}
      </Space>
    </Modal>
  )
}

export default RoleMasterUploader
