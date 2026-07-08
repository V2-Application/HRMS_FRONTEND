import React, { useEffect, useState } from 'react'
import { Modal, Button, Upload, Typography, message, Row, Col, Grid, Table, Alert } from 'antd'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'
import axiosInstance from '../../services/axiosInstance'

const { Paragraph, Text, Title } = Typography
const { useBreakpoint } = Grid

export default function FNFUploader({ isVisible, setIsVisible, refreshData }) {
  const [fileList, setFileList] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [duplicates, setDuplicates] = useState([])
  const [resultMsg, setResultMsg] = useState('')

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
    setUploadError('')
    setDuplicates([])
    setResultMsg('')
    const formData = new FormData()
    formData.append('file', fileList[0].originFileObj)

    try {
      // Fast completed-FNF upload: stores sheet values as-is. Only Ecode & Remarks are mandatory.
      const res = await axiosInstance.post('/api/Fnf/upload-completed-fnf-excel', formData, {
        headers: { Accept: '*/*' },
      })

      if (res.status === 200) {
        const dupRows = res.data?.duplicateRows ?? []
        const msg = res.data?.message || 'File uploaded successfully!'
        setDuplicates(dupRows)

        if (res.data?.status === false) {
          // Nothing processed (e.g. all rows were duplicates / missing Ecode/Remarks)
          setUploadError(msg)
          message.error(msg)
          // If there are duplicates to review, keep the modal open so the user can see/download them.
          if (dupRows.length === 0) setFileList([])
          else setFileList([])
        } else {
          message.success(msg)
          setResultMsg(msg)
          refreshData?.()
          setFileList([]) // clear selection
          // Keep modal open when there are duplicates so the user can review/download them.
          if (dupRows.length === 0) setIsVisible(false)
        }
      }
    } catch (err) {
      let errMsg

      if (err?.response?.data?.message?.includes('bulk upload error')) {
        errMsg = err?.response?.data?.error
      } else {
        errMsg = err?.response?.data?.message || 'Error uploading file.'
      }

      setUploadError(errMsg)
      message.error(errMsg)
    } finally {
      setIsUploading(false)
      setFileList([])
    }
  }

  // Download the skipped/duplicate rows as an .xlsx so the user can review them.
  const downloadDuplicates = () => {
    if (!duplicates.length) return
    const rows = duplicates.map((d) => ({
      Ecode: d.ecode,
      Reason: d.reason,
      'Total Payable': d.totalPayable ?? '',
      'Net Payable': d.netPayable ?? '',
      'Payment Status': d.paymentStatus ?? '',
      'Cheque No/UTR No': d.chequeNo ?? '',
      'Voucher No': d.paymentVoucherNo ?? '',
      Remarks: d.paymentRemarks ?? '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Duplicates')
    XLSX.writeFile(
      wb,
      `FNF_Duplicates_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.xlsx`,
    )
  }

  const handleClose = () => {
    setDuplicates([])
    setResultMsg('')
    setUploadError('')
    setFileList([])
    setIsVisible(false)
  }

  const duplicateColumns = [
    { title: 'Ecode', dataIndex: 'ecode', key: 'ecode', width: 110 },
    { title: 'Reason', dataIndex: 'reason', key: 'reason' },
    { title: 'Cheque No/UTR No', dataIndex: 'chequeNo', key: 'chequeNo', width: 140 },
    { title: 'Remarks', dataIndex: 'paymentRemarks', key: 'paymentRemarks' },
  ]

  return (
    <Modal
      // antd v5: use `open={isVisible}`
      visible={isVisible}
      onCancel={handleClose}
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
            href="/FNFUploader_final.xlsx"
            download
            style={{ display: 'inline-block', width: '100%' }}
          >
            <Button
              icon={<DownloadOutlined />}
              type="primary"
              block={isMobile}
              aria-label="Download sample Excel sheet"
              style={{ marginBottom: '1rem' }}
            >
              Download Sample Sheet
            </Button>
          </a>

          <Paragraph type="secondary" style={{ fontSize: 18, fontWeight: 'bolder' }}>
            Please remove sample data before uploding actual data.
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
          <Paragraph style={{ marginBottom: 6 }}>
            3. Fill out the downloaded sheet and then upload it here.
          </Paragraph>
          <Paragraph style={{ marginBottom: 0 }}>
            4. <Text strong>Ecode</Text> and <Text strong>Remarks</Text> are mandatory; all other
            fields are optional.
          </Paragraph>
          <Paragraph style={{ marginBottom: 0, marginTop: 6 }}>
            5. Uploading an ecode that is in <Text strong>Processed</Text> will move it to{' '}
            <Text strong>Completed</Text>. Already-completed & duplicate rows are skipped and listed
            below.
          </Paragraph>
        </Col>
      </Row>

      {/* Skipped / duplicate rows: shown after an upload, with a download button */}
      {duplicates.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
            message={`${duplicates.length} row(s) were skipped (already completed / duplicate / unknown ecode).`}
            description={resultMsg || undefined}
          />
          <div style={{ marginBottom: 8, textAlign: 'right' }}>
            <Button icon={<DownloadOutlined />} onClick={downloadDuplicates}>
              Download Duplicates
            </Button>
          </div>
          <Table
            size="small"
            rowKey={(r, i) => `${r.ecode}-${i}`}
            dataSource={duplicates}
            columns={duplicateColumns}
            pagination={{ pageSize: 5, size: 'small' }}
            scroll={{ y: 240 }}
          />
        </div>
      )}
    </Modal>
  )
}
