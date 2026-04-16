import React, { useEffect, useState } from 'react'
import { Button, Col, DatePicker, Flex, Form, Input, message, Modal, Row, TimePicker } from 'antd'
import dayjs from 'dayjs'
const { TextArea } = Input
import CallHistoryTimeline from './CallHistoryTimeline'

const CallFormModal = ({ isCallModalOpen, setIsCallModalOpen, callModalPreData }) => {
  const format = 'HH:mm'
  const [form] = Form.useForm()
  const [isCallLogModalOpen, setIsCallLogModalOpen] = useState(false)
  const [callLogs, setCallLogs] = useState([])

  const onChange = (date, dateString) => {
    // console.log(date, dateString)
  }

  useEffect(() => {
    form.setFieldsValue({
      applicantEmail: callModalPreData?.email,
      applicantName: callModalPreData?.firstName,
      applicantMobile: callModalPreData?.phone,
    })
  }, [callModalPreData])

  useEffect(() => {
    if (!callModalPreData) {
      form.resetFields()
    }
  }, [callModalPreData])

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (values?.callStartTime > values?.callEndTime) {
          message.error('Call start time must be less than call end time')
          return
        }

        const payload = {
          ...values,
          callDate: values?.callDate.format('DD-MM-YYYY'),
          callStartTime: values?.callStartTime.format('HH:mm'),
          callEndTime: values?.callEndTime.format('HH:mm'),
        }
        setCallLogs((prevLogs) => [payload, ...prevLogs])
        form.resetFields(['hrName', 'callDate', 'callStartTime', 'callEndTime', 'callResponse'])
        message.success('Call reviewed successfully')
        setIsCallModalOpen(false)
      })
      .catch((err) => {
        console.error('Validation err:', err)
      })
  }

  return (
    <>
      <Modal
        title="Call Status"
        open={isCallModalOpen}
        onOk={handleOk}
        onCancel={() => {
          setIsCallModalOpen(false)
          form.resetFields()
        }}
      >
        <Button
          type="primary"
          style={{ position: 'absolute', zIndex: 1, top: '10px', right: '45px' }}
          onClick={() => setIsCallLogModalOpen(true)}
        >
          History
        </Button>
        <Form layout="vertical" form={form}>
          <Form.Item
            name={'applicantName'}
            label="Applicant Name"
            rules={[{ required: true, message: 'Please enter applicant name' }]}
          >
            <Input placeholder="Applicant name" readOnly style={{ cursor: 'not-allowed' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={'applicantEmail'}
                label="Applicant Email"
                rules={[
                  { required: true, message: 'Please enter applicant email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input placeholder="Appicant email" readOnly style={{ cursor: 'not-allowed' }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name={'applicantMobile'}
                label="Applicant Mobile No."
                rules={[
                  { required: true, message: 'Please enter mobile no.' },
                  { pattern: /^\d+$/, message: 'Only numbers are allowed' },
                ]}
              >
                <Input
                  placeholder="Applicant mobile no."
                  maxLength={10}
                  readOnly
                  style={{ cursor: 'not-allowed' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name={'hrName'}
            label="HR Name"
            rules={[{ required: true, message: 'Please enter hr name' }]}
          >
            <Input placeholder="HR name" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name={'callDate'}
                label="Call Date"
                rules={[{ required: true, message: 'Please enter call date' }]}
              >
                {/* <Input placeholder="Appicant email" /> */}
                <DatePicker onChange={onChange} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name={'callStartTime'}
                label="Call Start Time"
                rules={[{ required: true, message: 'Please enter call start time' }]}
              >
                <TimePicker format={format} />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name={'callEndTime'}
                label="Call End Time"
                rules={[{ required: true, message: 'Please enter call end time' }]}
              >
                <TimePicker format={format} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name={'callResponse'}
            label="Call Response"
            rules={[{ required: true, message: 'Please enter call response' }]}
          >
            <TextArea placeholder="Enter call response" />
          </Form.Item>
        </Form>
      </Modal>

      <CallHistoryTimeline
        isCallLogModalOpen={isCallLogModalOpen}
        setIsCallLogModalOpen={setIsCallLogModalOpen}
        logs={callLogs}
      />
    </>
  )
}
export default CallFormModal
