import React, { useEffect } from 'react'
import { Modal, Form, DatePicker, Upload, Button, message, Typography, Space, Row, Col } from 'antd'
import { PaperClipOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { uploadPayrollWithChallan } from '../services/Services'

const { Text } = Typography

const ACCEPT_EXCEL =
  '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
const ACCEPT_PDF = '.pdf,application/pdf'

const isExcelFile = (file) => {
  const name = (file?.name || '').toLowerCase()
  const type = (file?.type || '').toLowerCase()

  const okByExt = name.endsWith('.xlsx') || name.endsWith('.xls')
  const okByMime =
    type.includes('spreadsheetml') || type.includes('ms-excel') || type.includes('vnd.ms-excel')

  return okByExt || okByMime
}

const isPdfFile = (file) => {
  const name = (file?.name || '').toLowerCase()
  const type = (file?.type || '').toLowerCase()
  return name.endsWith('.pdf') || type === 'application/pdf'
}

const singleFileNorm = (e) => {
  if (Array.isArray(e)) return e
  const fl = e?.fileList || []
  return fl.slice(-1)
}

const PfUploaderFormModal = ({
  open,
  onCancel,
  onSubmit, // (payload) => Promise<void>
  submitting = false,
  refetch,
}) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (!open) form.resetFields()
  }, [open, form])

  const beforeUploadExcel = (file) => {
    if (!isExcelFile(file)) {
      message.error('Only Excel files are allowed (.xlsx / .xls)')
      return Upload.LIST_IGNORE
    }
    return false // prevent auto upload
  }

  const beforeUploadPdf = (file) => {
    if (!isPdfFile(file)) {
      message.error('Only PDF files are allowed (.pdf)')
      return Upload.LIST_IGNORE
    }
    return false
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()

      const month = values?.month?.format('MMM-YY') // dayjs
      const excelFile = values?.excel?.[0]?.originFileObj
      const pdfFile = values?.pdf?.[0]?.originFileObj

      const formData = new FormData()
      formData.append('excelFile', excelFile)
      formData.append('challanPdf', pdfFile)

      const response = await uploadPayrollWithChallan(month, formData)

      if (response.status === 200) {
        message.success(response.data?.message || 'Data updated successfully')
        form.resetFields()
        onCancel()
        refetch()
      }
    } catch (err) {
      console.error('Error submitting data:', err)
      message.error(err?.response?.data?.message || 'Something went wrong.')
    }
  }

  return (
    <Modal
      title="Upload PF (Month + Excel + PDF)"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Upload"
      confirmLoading={submitting}
      destroyOnClose
      wrapClassName="pf-upload-modal"
      width={'40vw'}
    >
      <a
        href="/PfWithChallanUploader.xlsx"
        download
        style={{ display: 'inline-block', marginBottom: '0.7rem' }}
      >
        <Button icon={<DownloadOutlined />} type="primary">
          Download sample Excel
        </Button>
      </a>

      <Form form={form} layout="vertical">
        <Form.Item label="Month" name="month" rules={[{ required: true }]}>
          <DatePicker picker="month" style={{ width: '100%' }} />
        </Form.Item>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Upload Excel"
              name="excel"
              valuePropName="fileList"
              getValueFromEvent={singleFileNorm}
              rules={[{ required: true }]}
            >
              <Upload beforeUpload={beforeUploadExcel} maxCount={1} accept={ACCEPT_EXCEL}>
                <Button icon={<UploadOutlined />}>Select Excel (.xlsx/.xls)</Button>
              </Upload>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Upload PDF"
              name="pdf"
              valuePropName="fileList"
              getValueFromEvent={singleFileNorm}
              rules={[{ required: true }]}
            >
              <Upload beforeUpload={beforeUploadPdf} maxCount={1} accept={ACCEPT_PDF}>
                <Button icon={<PaperClipOutlined />}>Select PDF</Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Typography.Text type="secondary" style={{ fontSize: 15 }}>
        <strong>Excel allowed: .xlsx / .xls • PDF allowed: .pdf • Single file each</strong>
      </Typography.Text>
    </Modal>
  )
}

export default PfUploaderFormModal
