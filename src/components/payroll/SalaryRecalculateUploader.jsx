import React, { useEffect, useState } from 'react'
import { Modal, Button, Upload, Typography, message, Row, Col, Grid } from 'antd'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import axiosInstance from '../../services/axiosInstance'

const { Paragraph, Text, Title } = Typography
const { useBreakpoint } = Grid

export default function SalaryRecalculateUploader({ isVisible, setIsVisible, refreshData }) {
  const [fileList, setFileList] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const screens = useBreakpoint()
  const isMobile = !screens.md

  // Validate and add to fileList
  const beforeUpload = (file) => {
    const isXlsx =
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.name.toLowerCase().endsWith('.xlsx')

    if (!isXlsx) {
      message.error('You can only upload .xlsx file!')
      return Upload.LIST_IGNORE
    }
    setUploadError('')
    return false // prevent auto-upload
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

    try {
      const res = await axiosInstance.post(
        '/api/SalaryRecalculate/upload-recalculate-new',
        formData,
        {
          headers: { Accept: '*/*' },
        },
      )

      if (res.status === 200) {
        message.success(res.data?.message || 'File uploaded successfully!')
        refreshData()
        setFileList([])
        setIsVisible(false)
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Error uploading file.'
      setUploadError(errMsg)
      message.error(errMsg || 'Upload failed!')
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
      visible={isVisible}
      onCancel={() => setIsVisible(false)}
      footer={null}
      centered
      width={isMobile ? '100%' : 700}
      bodyStyle={{ padding: isMobile ? 16 : 24 }}
      style={isMobile ? { top: 0, padding: 0 } : {}}
      destroyOnClose
      maskClosable={!isUploading}
      title={
        <div style={{ textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            Bulk Upload
          </Title>
          <Paragraph style={{ margin: 0, fontSize: 12 }}>
            Upload Excel Sheet at once using this feature.
          </Paragraph>
        </div>
      }
    >
      <Row gutter={[24, 16]}>
        {/* Left column */}
        <Col xs={24} md={12}>
          <a
            href="/SalaryRecalculate.xlsx"
            download
            style={{ display: 'inline-block', width: '100%' }}
          >
            <Button
              icon={<DownloadOutlined />}
              type="primary"
              block={isMobile}
              aria-label="Download sample Excel sheet"
            >
              Download Sample Sheet
            </Button>
          </a>

          <Paragraph type="secondary" style={{ fontSize: 14, marginTop: 8 }}>
            * Download, fill out, then upload the sample Excel file.
          </Paragraph>
          <Paragraph style={{ fontWeight: 'bold' }}>
            {'-> '}Only one month must be entered at a time.
          </Paragraph>

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
            <Button icon={<UploadOutlined />} block={isMobile} aria-label="Choose Excel file">
              Choose File
            </Button>
          </Upload>

          <div style={{ marginTop: 16 }}>
            <Button
              type="primary"
              loading={isUploading}
              onClick={handleUpload}
              block={isMobile}
              aria-label="Upload selected Excel file"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </Col>

        {/* Right column */}
        <Col xs={24} md={12}>
          <Text strong>Note:</Text>
          <Paragraph style={{ marginBottom: 6 }}>1. Only .xlsx files are supported.</Paragraph>
          <Paragraph style={{ marginBottom: 6 }}>2. Download the sample sheet above.</Paragraph>
          <Paragraph style={{ marginBottom: 0 }}>
            3. Fill out the downloaded sheet and then upload it here.
          </Paragraph>
        </Col>
      </Row>
    </Modal>
  )
}
