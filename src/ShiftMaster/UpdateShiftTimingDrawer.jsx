import { useEffect, useState } from 'react'
import {
  Drawer,
  Form,
  TimePicker,
  DatePicker,
  Input,
  Space,
  Typography,
  Button,
  message,
} from 'antd'
import dayjs from 'dayjs'
import { updateShift } from '../services/Services'

const { Text } = Typography

/**
 * Update the timing of one shift. Deliberately the same shape as the Emp Shift
 * Alignment drawer (AssignmentShiftModal): right-hand drawer, the subject named
 * at the top, effective-from required and defaulted to today, effective-to
 * optional/open-ended, free-text remarks, primary action bottom-right.
 *
 * The difference is the subject: there is no employee here, so the fields that
 * change are the shift's own start/end times.
 */
const UpdateShiftTimingDrawer = ({ open, onClose, shift, onUpdated }) => {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open || !shift) return

    form.setFieldsValue({
      startTime: shift?.startTime ? dayjs(shift.startTime, 'HH:mm:ss') : null,
      endTime: shift?.endTime ? dayjs(shift.endTime, 'HH:mm:ss') : null,
      // shifts created before the effective-date fields existed have none, so
      // fall back to today the way the alignment drawer does
      effectiveFrom: shift?.effectiveFrom ? dayjs(shift.effectiveFrom) : dayjs(),
      effectiveTo: shift?.effectiveTo ? dayjs(shift.effectiveTo) : null,
      remarks: '',
    })
  }, [open, shift, form])

  const handleSubmit = async () => {
    let values
    try {
      values = await form.validateFields()
    } catch (err) {
      return // field-level messages are already on screen
    }

    const payload = {
      shiftID: shift?.shiftID,
      shiftName: shift?.shiftName,
      startTime: values.startTime.format('HH:mm:ss'),
      endTime: values.endTime.format('HH:mm:ss'),
      effectiveFrom: values.effectiveFrom ? dayjs(values.effectiveFrom).format('YYYY-MM-DD') : null,
      effectiveTo: values.effectiveTo ? dayjs(values.effectiveTo).format('YYYY-MM-DD') : null,
      remarks: values.remarks?.trim() || null,
      isActive: shift?.isActive ?? true,
    }

    try {
      setSubmitting(true)
      const response = await updateShift(payload, shift?.shiftID)
      if (response.status === 200) {
        message.success(response.data?.message || 'Shift timing updated successfully')
        form.resetFields()
        onUpdated?.()
        onClose()
      }
    } catch (error) {
      // model-validation failures arrive as { errors: { Field: [msg] } }
      const data = error?.response?.data
      const fieldError = data?.errors ? Object.values(data.errors).flat()[0] : null

      message.error(data?.message || fieldError || 'Unable to update shift timing')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width={420}
      destroyOnClose
      closable
      title="Update Shift Timing"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit}>
            Update
          </Button>
        </div>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Text type="secondary">
          Shift: <Text strong>{shift?.shiftName ?? '-'}</Text>
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          The previous timing is kept in this shift&apos;s history, closed off the day before the
          new one starts.
        </Text>

        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            label="Start Time"
            name="startTime"
            rules={[{ required: true, message: 'Start time is required' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="End Time"
            name="endTime"
            rules={[{ required: true, message: 'End time is required' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Effective From"
            name="effectiveFrom"
            rules={[{ required: true, message: 'Please select effective date' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
          </Form.Item>

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
              style={{ width: '100%' }}
              format="DD MMM YYYY"
              placeholder="Leave blank for open-ended"
              allowClear
            />
          </Form.Item>

          <Form.Item label="Remarks" name="remarks">
            <Input.TextArea rows={3} placeholder="Why is the timing changing?" maxLength={200} />
          </Form.Item>
        </Form>
      </Space>
    </Drawer>
  )
}

export default UpdateShiftTimingDrawer
