import { Col, DatePicker, Form, Input, message, Modal, Radio, Row, TimePicker } from 'antd'
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
        // shifts created before the effective-date fields existed have none, so
        // fall back to today the way Emp Shift Alignment does
        effectiveFrom: editingShift?.effectiveFrom ? dayjs(editingShift.effectiveFrom) : dayjs(),
        effectiveTo: editingShift?.effectiveTo ? dayjs(editingShift.effectiveTo) : null,
      })
    } else if (isModalOpen && !editingShift) {
      form.resetFields()
      form.setFieldsValue({ effectiveFrom: dayjs(), effectiveTo: null })
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
    const { shiftName, startTime, endTime, effectiveFrom, effectiveTo } = values ?? {}
    const formattedStartTime = startTime.format('HH:mm:ss')
    const formattedEndTime = endTime.format('HH:mm:ss')
    const formattedEffectiveFrom = effectiveFrom ? dayjs(effectiveFrom).format('YYYY-MM-DD') : null
    const formattedEffectiveTo = effectiveTo ? dayjs(effectiveTo).format('YYYY-MM-DD') : null
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
        effectiveFrom: formattedEffectiveFrom,
        effectiveTo: formattedEffectiveTo,
        ...(isEdit && { shiftID }),
      }

      const response = isEdit ? await updateShift(payload, shiftID) : await createShift(payload)

      if (response.status === 200) {
        message.success(
          response.data?.message || `Shift ${isEdit ? 'updated' : 'created'} successfully`,
        )
        form.resetFields()
        setIsModalOpen(false)
        await refreshData()
      }
    } catch (error) {
      // A model-validation failure comes back as { errors: { Field: [msg] } }
      // with no `message`, so without this the real reason is swallowed and the
      // user only sees the generic fallback.
      const data = error?.response?.data
      const fieldError = data?.errors ? Object.values(data.errors).flat()[0] : null

      message.error(
        data?.message || fieldError || `Error in ${isEdit ? 'updating' : 'creating'} shift`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      title={editingShift ? 'Edit Shift' : 'Create Shift'}
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

        {/* Effective window - same pair, labels and rules as the Emp Shift
            Alignment drawer: from is required, to is optional/open-ended. */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item
              label="Effective From"
              name="effectiveFrom"
              rules={[{ required: true, message: 'Please select effective date' }]}
            >
              <DatePicker format="DD MMM YYYY" style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Effective To"
              name="effectiveTo"
              dependencies={['effectiveFrom']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value) return Promise.resolve()
                    const from = getFieldValue('effectiveFrom')
                    if (from && dayjs(value).isBefore(dayjs(from), 'day')) {
                      return Promise.reject(
                        new Error('Effective to must be on or after Effective from'),
                      )
                    }
                    return Promise.resolve()
                  },
                }),
              ]}
            >
              <DatePicker
                format="DD MMM YYYY"
                style={{ width: '100%' }}
                placeholder="Leave blank for open-ended"
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default AddShiftModal
