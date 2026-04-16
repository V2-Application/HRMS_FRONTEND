import { Col, Form, Input, message, Modal, Radio, Row, TimePicker } from 'antd'
import { useEffect, useState } from 'react'
import { createShift, updateShift } from '../services/Services'
import dayjs from 'dayjs'

const options = [
  { label: 'Day', value: 'day' },
  { label: 'Night', value: 'night' },
]

const AddShiftModal = ({ isModalOpen, setIsModalOpen, refreshData, editingShift }) => {
  const [form] = Form.useForm()
  const [shiftType, setShiftType] = useState('day')
  const [isLoading, setIsLoading] = useState(false)

  // fill data in fields in edit case
  useEffect(() => {
    if (isModalOpen && editingShift) {
      form.setFieldsValue({
        shiftName: editingShift?.shiftName,
        startTime: editingShift?.startTime ? dayjs(editingShift?.startTime, 'HH:mm:ss') : null,
        endTime: editingShift?.endTime ? dayjs(editingShift?.endTime, 'HH:mm:ss') : null,
      })
    } else if (isModalOpen && !editingShift) {
      form.resetFields()
    }
  }, [editingShift, isModalOpen, form])

  const handleOk = () => {
    form.submit()
  }
  const handleCancel = () => {
    form.resetFields()
    setIsModalOpen(false)
  }

  const handleShiftChange = (e) => {
    setShiftType(e.target.value)
  }

  const handleFinish = async (values) => {
    const { shiftName, startTime, endTime } = values ?? {}
    const formattedStartTime = startTime.format('HH:mm:ss')
    const formattedEndTime = endTime.format('HH:mm:ss')
    const isEdit = !!editingShift
    const shiftID = editingShift?.shiftID

    if (isEdit && typeof shiftID !== 'number') {
      message.error('Invalid operation!')
      return false
    }

    if (shiftType === 'day' && formattedEndTime < formattedStartTime) {
      message.error('End time must be greater than start time')
      return false
    }

    try {
      setIsLoading(true)
      setIsModalOpen(true)

      const payload = {
        shiftName,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        ...(isEdit && { shiftID }),
      }

      const response = isEdit ? await updateShift(payload, shiftID) : await createShift(payload)

      if (response.status === 200) {
        message.success(response.data?.message || 'Shift created successfully')
        form.resetFields()
        setIsModalOpen(false)
        await refreshData()
      }
    } catch (error) {
      message.error(error?.response?.data?.message || 'Error in creating shift')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      title="Create Shift"
      closable={{ 'aria-label': 'Custom Close Button' }}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={isLoading}
    >
      <Form
        name="createShift"
        autoComplete="off"
        layout="vertical"
        form={form}
        onFinish={handleFinish}
      >
        <Col span={24}>
          <Form.Item
            label="Shift Name"
            name="shiftName"
            rules={[{ required: true, message: 'Shift name is requierd' }]}
          >
            <Input placeholder="Enter shift time" />
          </Form.Item>
        </Col>

        <Row style={{ marginBlock: '0.6rem' }}>
          <Radio.Group block options={options} defaultValue="day" onChange={handleShiftChange} />
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              label="Start Time"
              name="startTime"
              rules={[{ required: true, message: 'Start time is required' }]}
            >
              <TimePicker format="HH:mm" style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="End Time"
              name="endTime"
              rules={[{ required: true, message: 'End time is required' }]}
            >
              <TimePicker format="HH:mm" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default AddShiftModal
