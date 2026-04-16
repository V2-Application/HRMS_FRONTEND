// import { Form, DatePicker, Button, message, Space, Typography } from 'antd'
// import { useCallback, useMemo, useState } from 'react'
// import { upsertPolicyDesignation } from '../../../services/Services'
// import { getApiError } from '../../../VendorModule/helpers'

// const { MonthPicker } = DatePicker

// const toUpsertPayloadLocal = (row, overrideMonthYear) => ({
//   // force insert into target month
//   locationDesignationPolicyId: 0,

//   locationCategoryId: row.locationCategoryId,
//   designationId: row.designationId ?? null,
//   weeklyOff: Number(row.weeklyOff),
//   monthYear: overrideMonthYear,

//   totalAttendanceFrom: Number(row.totalAttendanceFrom),
//   totalAttendanceTo: String(row.totalAttendanceTo),
// })

// const CopyToForm = ({ validateRow, rowsToCopy = [], currentMonth }) => {
//   const [form] = Form.useForm()
//   const [copying, setCopying] = useState(false)

//   const loadedCount = rowsToCopy.length
//   const currentMY = useMemo(() => currentMonth?.format('MMM-YY'), [currentMonth])

//   const handleCopySave = useCallback(
//     async ({ toMonth }) => {
//       try {
//         if (!toMonth) return message.error('Please select To month.')
//         if (!rowsToCopy.length) return message.error('No filtered data to copy.')

//         const toMY = toMonth.format('MMM-YY')
//         if (currentMY && currentMY === toMY) {
//           return message.error('To month cannot be same as current month.')
//         }

//         for (const r of rowsToCopy) {
//           const chk = validateRow?.(r, toMonth)
//           if (chk && !chk.ok) return message.error(chk.msg)
//         }

//         const payload = rowsToCopy.map((r) => toUpsertPayloadLocal(r, toMY))

//         setCopying(true)
//         const res = await upsertPolicyDesignation(payload)

//         if (res?.status === 200) {
//           message.success(res.data?.message || `Saved into ${toMY}`)
//           form.setFieldsValue({ toMonth: null })
//         }
//       } catch (e) {
//         message.error(getApiError(e, 'Error setting data'))
//       } finally {
//         setCopying(false)
//       }
//     },
//     [rowsToCopy, validateRow, form, currentMY],
//   )

//   return (
//     <Form form={form} layout="inline" onFinish={handleCopySave}>
//       <Form.Item
//         label="To"
//         name="toMonth"
//         rules={[{ required: true, message: 'To month is required' }]}
//       >
//         <MonthPicker style={{ width: '8rem' }} />
//       </Form.Item>

//       <Space>
//         <Button type="primary" htmlType="submit" loading={copying}>
//           Save
//         </Button>

//         {/* <Typography.Text type="secondary" style={{ fontSize: 12 }}>
//           Loaded: {loadedCount}
//         </Typography.Text> */}
//       </Space>
//     </Form>
//   )
// }

// export default CopyToForm

import { Form, DatePicker, Button, message, Space } from 'antd'
import { useCallback, useMemo, useState } from 'react'
import { upsertPolicyDesignation } from '../../../services/Services'
import { getApiError } from '../../../VendorModule/helpers'

const { MonthPicker } = DatePicker

const toUpsertPayloadLocal = (row, overrideMonthYear) => ({
  locationDesignationPolicyId: 0,
  locationCategoryId: row.locationCategoryId,
  designationId: Number(row.designationId) || 0,
  totalAttendanceTo: String(row.totalAttendanceTo),
  weeklyOff: Number(row.weeklyOff),
  forWhichWeeks: Number(row.forWhichWeeks) || 0, // ✅ NEW
  monthYear: overrideMonthYear,
  totalAttendanceFrom: Number(row.totalAttendanceFrom),
  isActive: true,
})

const CopyToForm = ({ validateRow, rowsToCopy = [], currentMonth }) => {
  const [form] = Form.useForm()
  const [copying, setCopying] = useState(false)

  const currentMY = useMemo(() => currentMonth?.format('MMM-YY'), [currentMonth])

  const handleCopySave = useCallback(
    async ({ toMonth }) => {
      try {
        if (!toMonth) return message.error('Please select To month.')
        if (!rowsToCopy.length) return message.error('No filtered data to copy.')

        const toMY = toMonth.format('MMM-YY')
        if (currentMY && currentMY === toMY) {
          return message.error('To month cannot be same as current month.')
        }

        for (const r of rowsToCopy) {
          const chk = validateRow?.(r, toMonth)
          if (chk && !chk.ok) return message.error(chk.msg)
        }

        const payload = rowsToCopy.map((r) => toUpsertPayloadLocal(r, toMY))

        setCopying(true)
        const res = await upsertPolicyDesignation(payload)

        if (res?.status === 200) {
          message.success(res.data?.message || `Saved into ${toMY}`)
          form.setFieldsValue({ toMonth: null })
        }
      } catch (e) {
        message.error(getApiError(e, 'Error setting data'))
      } finally {
        setCopying(false)
      }
    },
    [rowsToCopy, validateRow, form, currentMY],
  )

  return (
    <Form form={form} layout="inline" onFinish={handleCopySave}>
      <Form.Item
        label="To"
        name="toMonth"
        rules={[{ required: true, message: 'To month is required' }]}
      >
        <MonthPicker style={{ width: '8rem' }} />
      </Form.Item>

      <Space>
        <Button type="primary" htmlType="submit" loading={copying}>
          Save
        </Button>
      </Space>
    </Form>
  )
}

export default CopyToForm
