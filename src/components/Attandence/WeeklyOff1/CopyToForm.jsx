import { Form, DatePicker, Button, message, Space, Typography } from 'antd'
import { useCallback, useMemo, useState } from 'react'
import { getWeeklyOffByMonthYear, upsertPolicyDesignation } from '../../../services/Services'
import { getApiError } from '../../../VendorModule/helpers'

const { MonthPicker } = DatePicker

// local payload builder (same shape as your index.jsx)
const toUpsertPayloadLocal = (row, overrideMonthYear) => ({
  // always insert in target month
  locationDesignationPolicyId: 0,

  // keep what backend expects
  locationCategoryId: row.locationCategoryId,
  designationId: row.designationId ?? null,
  weeklyOff: Number(row.weeklyOff),
  monthYear: overrideMonthYear,

  totalAttendanceFrom: Number(row.totalAttendanceFrom),
  totalAttendanceTo: String(row.totalAttendanceTo),
})

const CopyToForm = ({ validateRow }) => {
  const [form] = Form.useForm()

  const [copyFromMonth, setCopyFromMonth] = useState(null)
  const [copySourceRows, setCopySourceRows] = useState([])
  const [copyFetchLoading, setCopyFetchLoading] = useState(false)
  const [copying, setCopying] = useState(false)

  const loadedCount = copySourceRows.length

  const fetchCopySource = useCallback(async (fromMonth) => {
    try {
      if (!fromMonth) return

      setCopyFetchLoading(true)
      const fromMY = fromMonth.format('MMM-YY')

      const res = await getWeeklyOffByMonthYear({
        pageNumber: 1,
        pageSize: 10000,
        searchTerm: '',
        monthYear: fromMY,
      })

      if (res.status === 200) {
        const list = res.data?.data || []

        const normalized = list.map((r) => ({
          ...r,
          totalAttendanceFrom: r.totalAttendanceFrom ?? '',
          totalAttendanceTo: r.totalAttendanceTo ?? '',
          weeklyOff: r.weeklyOff ?? '',
          designationId: r.designationId ?? null,
          locationCategoryId: r.locationCategoryId ?? '',
        }))

        setCopyFromMonth(fromMonth)
        setCopySourceRows(normalized)
        message.success(`Loaded ${normalized.length} rows from ${fromMY}`)
      }
    } catch (e) {
      message.error(getApiError(e, 'Error fetching copy source data'))
      setCopySourceRows([])
      setCopyFromMonth(null)
    } finally {
      setCopyFetchLoading(false)
    }
  }, [])

  const handleCopySave = useCallback(
    async ({ toMonth }) => {
      try {
        if (!copyFromMonth) return message.error('Please select From month first.')
        if (!toMonth) return message.error('Please select To month.')
        if (!copySourceRows.length) return message.error('No data loaded from From month.')

        const fromMY = copyFromMonth.format('MMM-YY')
        const toMY = toMonth.format('MMM-YY')
        if (fromMY === toMY) return message.error('From and To month cannot be same.')

        // validate rows against target month (max days etc.)
        for (const r of copySourceRows) {
          const chk = validateRow?.(r, toMonth)
          if (chk && !chk.ok) return message.error(chk.msg)
        }

        const payload = copySourceRows.map((r) => toUpsertPayloadLocal(r, toMY))

        setCopying(true)
        const res = await upsertPolicyDesignation(payload)

        if (res.status === 200) {
          message.success(res.data?.message || `Set data into ${toMY}`)
          // optional: clear To month after success
          form.setFieldsValue({ toMonth: null })
        }
      } catch (e) {
        message.error(getApiError(e, 'Error setting data'))
      } finally {
        setCopying(false)
      }
    },
    [copyFromMonth, copySourceRows, validateRow, form],
  )

  return (
    <Form form={form} layout="inline" onFinish={handleCopySave}>
      {/* <Form.Item
        label="From"
        name="fromMonth"
        rules={[{ required: true, message: 'From month is required' }]}
      >
        <MonthPicker
          onChange={(val) => {
            form.setFieldsValue({ fromMonth: val })
            // optional: reset To month when From changes
            form.setFieldsValue({ toMonth: null })
            fetchCopySource(val) // fetch + store only
          }}
        />
      </Form.Item> */}

      <Form.Item
        label="To"
        name="toMonth"
        rules={[{ required: true, message: 'To month is required' }]}
      >
        <MonthPicker style={{ width: '8rem' }} />
      </Form.Item>

      <Space>
        <Button type="primary" htmlType="submit" loading={copying} disabled={copyFetchLoading}>
          Save
        </Button>

        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {copyFetchLoading ? 'Loading...' : `Loaded: ${loadedCount}`}
        </Typography.Text>
      </Space>
    </Form>
  )
}

export default CopyToForm
