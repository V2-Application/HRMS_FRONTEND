import React, { useEffect, useState } from 'react'
import { Modal, Form, DatePicker, Radio, Switch, Input, Typography, Row, Col, Button } from 'antd'
import useMessage from 'antd/es/message/useMessage'
import { applyLeave } from '../services/Services'
import { useSelector } from 'react-redux'
import dayjs from 'dayjs'
import { ToastContainer } from 'react-toastify'

const { Text } = Typography
const { TextArea } = Input

export default function EmployeeLeaveModal({ openLeaveModal, setOpenLeaveModal, fetchData }) {
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = useMessage()
  const isHalfDay = Form.useWatch('isHalfDay', form)

  // pull required user info
  const { employeeId, reportheadid, firstName, lastName, ecode, reportHeadEcode, reportHeadName } =
    useSelector((state) => state.auth.data)

  const handleApply = async (values) => {
    const { fromDate, toDate, date, isHalfDay, halfDayOption, message: msg } = values

    // derive start/end based on half-day toggle
    const start = isHalfDay ? date : fromDate
    const end = isHalfDay ? date : toDate

    // sanity checks
    if (!isHalfDay && end && end.isBefore(start, 'day')) {
      messageApi.error('End date cannot be earlier than start date')
      return
    }

    const leaveDuration = isHalfDay
      ? halfDayOption === 'firstHalf'
        ? 'First Half'
        : 'Second Half'
      : 'Full Day'

    const payload = {
      employeeId,
      statusId: 4,
      statusName: 'Pending',
      startDate: start?.format('YYYY-MM-DD'),
      endDate: end ? end.format('YYYY-MM-DD') : null,
      reason: msg,
      reportingManagerId: reportheadid,
      createdBy: `${employeeId}`,
      lastUpdatedBy: `${employeeId}`,
      employeeName: `${firstName} ${lastName}`,
      isRevoked: false,
      ecode,
      reportHeadEcode,
      reportHeadName,
      firstHalf: leaveDuration === 'First Half',
      secondHalf: leaveDuration === 'Second Half',
      fullDay: leaveDuration === 'Full Day',
    }

    try {
      const response = await applyLeave(payload)
      if (response.status === 200) {
        messageApi.success(response?.data?.message || 'Leave applied successfully')
        form.resetFields()
        setOpenLeaveModal(false)
        fetchData?.()
      }
    } catch (error) {
      messageApi.error('Failed to apply leave')
    }
  }

  return (
    <>
      {contextHolder}
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      <Modal
        title="Apply for Leave"
        open={openLeaveModal}
        onCancel={() => setOpenLeaveModal(false)}
        footer={null}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleApply}
          initialValues={{ isHalfDay: false, halfDayOption: 'firstHalf' }}
          style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          {/* Half-day toggle + option */}
          <Row align="middle" gutter={12} style={{ marginBottom: 0 }}>
            <Col>
              <Form.Item name="isHalfDay" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Switch />
              </Form.Item>
            </Col>
            <Col>
              <Text>Half Day</Text>
            </Col>

            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.isHalfDay !== cur.isHalfDay}>
              {({ getFieldValue }) =>
                getFieldValue('isHalfDay') && (
                  <Col flex="auto">
                    <Form.Item
                      name="halfDayOption"
                      rules={[{ required: true, message: 'Please select half day option' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Radio.Group>
                        <Radio value="firstHalf">First Half</Radio>
                        <Radio value="secondHalf">Second Half</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                )
              }
            </Form.Item>
          </Row>

          {/* Full day: From/To */}
          {isHalfDay === false && (
            <Row gutter={12} style={{ marginBottom: 0 }}>
              <Col span={12}>
                <Form.Item
                  name="fromDate"
                  label="From"
                  rules={[{ required: true, message: 'Please select start date' }]}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="toDate"
                  label="To"
                  dependencies={['isHalfDay']}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (getFieldValue('isHalfDay') || value) return Promise.resolve()
                        return Promise.reject(new Error('Please select end date'))
                      },
                    }),
                  ]}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker
                    disabled={form.getFieldValue('isHalfDay')}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* Half day: single date */}
          {isHalfDay === true && (
            <Row gutter={12} style={{ marginBottom: 0 }}>
              <Col span={24}>
                <Form.Item
                  name="date"
                  label="Select Date"
                  rules={[{ required: true, message: 'Please select date' }]}
                  style={{ marginBottom: 0 }}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* Reason */}
          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: 'Please enter a message' }]}
            style={{ marginBottom: 0 }}
          >
            <TextArea rows={3} placeholder="Enter reason for leave" />
          </Form.Item>

          <Form.Item style={{ marginTop: 8 }}>
            <Button type="primary" htmlType="submit" block>
              Apply
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

