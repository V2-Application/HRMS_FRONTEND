import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, DatePicker, Button, message, Row, Col } from 'antd'
import { exportAttendance } from '../../services/Services'
import moment from 'moment'
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../../redux/uiSlice'

const ExportAttendanceModal = ({ isExportAttendanceModalOpen, setIsExportAttendanceModalOpen }) => {
  const [form] = Form.useForm()

  const { role, ecode } = useSelector((state) => state.auth.data)
  const { loading } = useSelector((state) => state.ui)
  const dispatch = useDispatch()

  const onFinish = async (values) => {
    const { eCode, startDate, endDate } = values
    try {
      await dispatch(set({ loading: true }))
      const requestBody = {
        fromDate: startDate.format('YYYY-MM-DD'),
        toDate: endDate.format('YYYY-MM-DD'),
        ...(eCode ? { eCode } : {}),
      }

      const { data: arraybuffer, status } = await exportAttendance(requestBody)
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
      console.error(err)
      message.error('Failed to start export')
    } finally {
      await dispatch(set({ loading: false }))
    }
  }

  const onCancel = () => {
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
      confirmLoading={loading}
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
          <Button style={{ marginRight: 8 }} onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
            Export
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ExportAttendanceModal
