import React, { useState } from 'react'
import { Modal, Button, Upload, Typography, message, Radio } from 'antd'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import axiosInstance from '../services/axiosInstance'

const { Paragraph, Text, Title } = Typography

export default function EmployeesUploadModal({ isVisible, setIsVisible, refreshData }) {
  const [fileList, setFileList] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [mode, setMode] = useState('update') // 'update' or 'insert'

  // Validate and add to fileList
  const beforeUpload = (file) => {
    const isXlsx =
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.name.toLowerCase().endsWith('.xlsx')

    if (!isXlsx) {
      message.error('You can only upload .xlsx file!')
      return Upload.LIST_IGNORE // this prevents it from being added
    }
    // Clear any previous error
    setUploadError('')
    // We return false to prevent auto-upload; we handle it ourselves
    return false
  }

  // Keep the controlled fileList in sync
  const onChange = ({ fileList: newList }) => {
    setFileList(newList.slice(-1)) // only last 1 file
  }

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Please choose an .xlsx file first.')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', fileList[0].originFileObj)

    const endpoint =
      mode === 'insert'
        ? '/api/EmployeeNew/BulkInsertEmployees'
        : '/api/EmployeeNew/UpdateEmployeeWithExcel'

    try {
      const res = await axiosInstance.post(endpoint, formData, {
        headers: { Accept: '*/*' },
      })

      if (res.status === 200) {
        message.success(res.data?.message || 'File uploaded successfully!')
        refreshData()
        setFileList([])
        setIsVisible(false)
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Error uploading file.'
      setUploadError(errMsg)
      message.error('Upload failed!')
    } finally {
      setIsUploading(false)
      setFileList([])
    }
  }

  setTimeout(() => {
    setUploadError('')
  }, 5000)

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            Bulk Upload
          </Title>
          <Paragraph style={{ margin: 0, fontSize: 12 }}>
            Upload the Employees Excel Sheet at once using this feature.
          </Paragraph>
        </div>
      }
      visible={isVisible}
      onCancel={() => setIsVisible(false)}
      footer={null}
      centered
      width={700}
    >
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Upload Mode:
            </Text>
            <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
              <Radio.Button value="update">Update Existing</Radio.Button>
              <Radio.Button value="insert">Create New</Radio.Button>
            </Radio.Group>
          </div>

          <a href="/employee_upload_sample1.xlsx" download>
            <Button icon={<DownloadOutlined />} type="primary">
              Download Sample Sheet
            </Button>
          </a>

          <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
            * Download, fill out, then upload the sample Excel file.
          </Paragraph>

          {mode === 'insert' && (
            <Paragraph type="secondary" style={{ fontSize: 12 }}>
              * For new employees, leave "Employee Code" column empty. It will be auto-generated
              based on the Company column.
            </Paragraph>
          )}

          {uploadError && (
            <Paragraph type="danger" style={{ color: 'red' }}>
              * {uploadError}
            </Paragraph>
          )}

          <Upload
            multiple={false}
            accept=".xlsx"
            beforeUpload={beforeUpload}
            onChange={onChange}
            fileList={fileList}
            onRemove={() => setFileList([])}
            showUploadList={{ showRemoveIcon: true }}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Choose File</Button>
          </Upload>

          <div style={{ marginTop: 20 }}>
            <Button type="primary" loading={isUploading} onClick={handleUpload}>
              {isUploading ? 'Uploading...' : mode === 'insert' ? 'Create Employees' : 'Upload'}
            </Button>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <Text strong>Note:</Text>
          <Paragraph style={{ marginBottom: 4 }}>1. Only .xlsx files are supported.</Paragraph>
          <Paragraph style={{ marginBottom: 4 }}>2. Download the sample sheet above.</Paragraph>
          <Paragraph style={{ marginBottom: 4 }}>
            3. Fill out the downloaded sheet and then upload it here.
          </Paragraph>
          {mode === 'insert' && (
            <>
              <Paragraph style={{ marginBottom: 4 }}>
                4. Company and Mobile columns are required for new employees.
              </Paragraph>
              <Paragraph style={{ marginBottom: 4 }}>
                5. Employee Code will be auto-generated (e.g., E0001 for Aquatica).
              </Paragraph>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
