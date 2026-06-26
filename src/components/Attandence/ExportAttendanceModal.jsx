import React, { useEffect, useRef, useState } from 'react'
import { Modal, Form, Input, DatePicker, Button, message, Row, Col } from 'antd'
import { StopOutlined } from '@ant-design/icons'
import { exportAttendance } from '../../services/Services'
import moment from 'moment'
import { useSelector } from 'react-redux'

// True when a request error is just a user-initiated abort (Stop), not a real failure.
const isCancelError = (error) =>
  error?.code === 'ERR_CANCELED' ||
  error?.name === 'CanceledError' ||
  error?.name === 'AbortError'

const ExportAttendanceModal = ({ isExportAttendanceModalOpen, setIsExportAttendanceModalOpen }) => {
  const [form] = Form.useForm()

  const { role, ecode } = useSelector((state) => state.auth.data)
  // Local (non-blocking) export state + abort controller so the Stop button can cancel the export.
  const [isExporting, setIsExporting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const exportAbortRef = useRef(null)

  const onFinish = async (values) => {
    if (isExporting) return
    const { eCode, startDate, endDate } = values

    const controller = new AbortController()
    exportAbortRef.current = controller

    try {
      setIsExporting(true)
      const requestBody = {
        fromDate: startDate.format('YYYY-MM-DD'),
        toDate: endDate.format('YYYY-MM-DD'),
        ...(eCode ? { eCode } : {}),
      }

      const { data: arraybuffer, status } = await exportAttendance(requestBody, controller.signal)
      if (status === 200) {
        const blob = new Blob([arraybuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `Attendance_${startDate.format('YYYYMMDD')}_${endDate.format('YYYYMMDD')}.xlsx`
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        window.URL.revokeObjectURL(url)
        message.success('Export initiated successfully')
        form.resetFields()
        setIsExportAttendanceModalOpen(false)
      }
    } catch (err) {
      if (isCancelError(err)) {
        message.warning('Attendance export stopped.')
      } else {
        console.error(err)
        message.error('Failed to start export')
      }
    } finally {
      setIsExporting(false)
      setIsStopping(false)
      exportAbortRef.current = null
    }
  }

  // Abort the in-flight export -> backend cancels the running query -> then close the modal.
  const stopExport = () => {
    if (exportAbortRef.current) {
      setIsStopping(true)
      exportAbortRef.current.abort()
    }
    form.resetFields()
    setIsExportAttendanceModalOpen(false)
  }

  const onCancel = () => {
    if (isExporting) {
      message.warning('Stop the running export first.')
      return
    }
    form.resetFields()
    setIsExportAttendanceModalOpen(false)
  }

  const disabledFutureDates = (current) => {
    return current && current > moment().endOf('day')
  }

  useEffect(() => {
    if (role === 'Employee') {
      form.setFieldsValue({ eCode: ecode })
    }
  }, [isExportAttendanceModalOpen, role, ecode, form])

  return (
    <Modal
      title="Export Attendance"
      centered
      open={isExportAttendanceModalOpen}
      onCancel={onCancel}
      footer={null}
      width={400}
      maskClosable={!isExporting}
      closable={!isExporting}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="eCode" label="Employee Code">
          <Input placeholder="E-code" readOnly={role === 'Employee'} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[
                { required: true, message: 'Please select start date' },
                {
                  validator: (_, value) =>
                    value && value > moment().endOf('day')
                      ? Promise.reject('Start date cannot be in the future')
                      : Promise.resolve(),
                },
              ]}
            >
              <DatePicker style={{ width: '100%' }} disabledDate={disabledFutureDates} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="endDate"
              label="End Date"
              rules={[
                { required: true, message: 'Please select end date' },
                {
                  validator: (_, value) =>
                    value && value > moment().endOf('day')
                      ? Promise.reject('End date cannot be in the future')
                      : Promise.resolve(),
                },
              ]}
            >
              <DatePicker style={{ width: '100%' }} disabledDate={disabledFutureDates} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ textAlign: 'right' }}>
          <Button style={{ marginRight: 8 }} onClick={onCancel} disabled={isExporting}>
            Cancel
          </Button>
          {isExporting && (
            <Button
              danger
              icon={<StopOutlined />}
              loading={isStopping}
              style={{ marginRight: 8 }}
              onClick={stopExport}
            >
              Stop
            </Button>
          )}
          <Button type="primary" htmlType="submit" loading={isExporting} disabled={isExporting}>
            Export
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ExportAttendanceModal
