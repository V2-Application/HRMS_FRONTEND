import { useEffect, useMemo } from 'react'
import { Drawer, Form, Select, DatePicker, Input, Space, Typography, Button, message } from 'antd'
import dayjs from 'dayjs'

const { Text } = Typography

const AssignmentShiftModal = ({
  open,
  onClose,
  onSubmit,
  submitting,
  shifts,
  employeeId,
  assignedBy,
  ecode,
}) => {
  const [form] = Form.useForm()

  // ✅ unwrap shifts if somehow you pass {status:true, data:[...]} here
  const shiftList = useMemo(() => {
    if (Array.isArray(shifts)) return shifts
    if (Array.isArray(shifts?.data)) return shifts.data
    if (Array.isArray(shifts?.data?.data)) return shifts.data.data
    return []
  }, [shifts])

  // ✅ build dropdown from API fields (shiftID, shiftName, startTime, endTime)
  const shiftOptions = useMemo(() => {
    return shiftList
      .map((s) => {
        const id = s?.shiftID ?? s?.shiftId
        if (id == null) return null
        return {
          label: `${s?.shiftName ?? '-'} (${s?.startTime ?? '-'} - ${s?.endTime ?? '-'})`,
          value: String(id),
        }
      })
      .filter(Boolean)
  }, [shiftList])

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        shiftId: undefined,
        effectiveFrom: dayjs(), // default today
        remarks: '',
      })
    }
  }, [open, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      const effectiveDate = values?.effectiveFrom
        ? dayjs(values.effectiveFrom).format('YYYY-MM-DD') // ✅ date only
        : null

      const payload = {
        employeeId,
        shiftId: values?.shiftId, // string shiftID
        effectiveFrom: effectiveDate, // ✅ send only date
        assignedBy,
        remarks: values?.remarks,
      }

      await onSubmit(payload)
      onClose()
    } catch (err) {
      if (err?.errorFields?.length) return
      message.error(err?.message || 'Something went wrong')
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
      title="Update Current Shift"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit}>
            Assign
          </Button>
        </div>
      }
    >
      {/* Header inside Drawer body */}
      <div style={{ marginBottom: 12 }}>
        <Text strong style={{ fontSize: 16 }}>
          Update Shift
        </Text>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <Text type="secondary">
          Employee: <Text strong>{ecode ?? '-'}</Text>
        </Text>

        <Form form={form} layout="vertical">
          <Form.Item
            label="Select shift"
            name="shiftId"
            rules={[{ required: true, message: 'Please select a shift' }]}
          >
            <Select
              showSearch
              placeholder="Choose a shift"
              options={shiftOptions}
              optionFilterProp="label"
              // optional: show loading if shifts not loaded yet
              loading={!shiftOptions.length}
            />
          </Form.Item>

          <Form.Item
            label="Effective from"
            name="effectiveFrom"
            rules={[{ required: true, message: 'Please select effective date' }]}
          >
            {/* <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" /> */}
            <DatePicker
              style={{ width: '100%' }}
              format="DD MMM YYYY"
              // disabledDate={(current) => {
              //   return current && current <= dayjs().endOf('day')
              // }}
            />
          </Form.Item>

          <Form.Item label="Remarks" name="remarks">
            <Input.TextArea rows={3} placeholder="Optional remarks..." />
          </Form.Item>
        </Form>
      </Space>
    </Drawer>
  )
}

export default AssignmentShiftModal
