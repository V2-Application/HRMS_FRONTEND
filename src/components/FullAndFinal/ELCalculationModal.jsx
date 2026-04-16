import { Button, Col, DatePicker, Form, Input, Modal, Row, message } from 'antd'
import dayjs from 'dayjs'
import { useMemo, useState, useEffect } from 'react'
import SalaryComponentList from './SalaryComponentList'
import { calculateEL } from '../../services/Services'

const ELCalculationModal = ({ open, setOpen, employee, totalEL, setTotalEL }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({})

  // simple numeric sanitizer (0 decimals by default)
  const digitsOnly = (field, { decimals = 0 } = {}) => ({
    inputMode: 'decimal',
    pattern: '^[0-9]*\\.?[0-9]*$',
    onChange: (e) => {
      let v = e.target.value || ''
      v = v.replace(/[^0-9.]/g, '')
      const i = v.indexOf('.')
      if (i !== -1) {
        const head = v.slice(0, i + 1)
        let tail = v.slice(i + 1).replace(/\./g, '')
        if (typeof decimals === 'number') tail = tail.slice(0, decimals)
        v = head + tail
      }
      form.setFieldsValue({ [field]: v })
    },
  })

  // controlled flags for salary components
  const [flags, setFlags] = useState({
    basic: false,
    da: false,
    hra: false,
    conveyance: false,
    cca: false,
    medicalAllowance: false,
    incentive: false,
    foodingAllowance: false,
    specialAllowance: false,
    extraAllowance: false,
    leaveEncashment: false,
    medicalReim: false,
    lta: false,
    bonusExGratia: false,
    arrears: false,
  })

  useEffect(() => {
    if (!open) {
      form.resetFields()
      // keep selections; if you want to reset, uncomment:
      // setFlags({ ...all keys false... })
    }
  }, [open, form])

  const handleToggle = (key, checked) => setFlags((p) => ({ ...p, [key]: checked }))

  const handleCalculate = async () => {
    try {
      const values = await form.validateFields()

      if (!employee?.employeeId) {
        message.warning('Select an employee first.')
        return
      }

      if (!Object.values(flags).some(Boolean)) {
        message.error('Select at least one salary component.')
        return
      }

      // ===== Request body for EL calculation =====
      const payload = {
        ecode: employee?.employeeCode,
        fromDate: values.leaveFrom ? dayjs(values.leaveFrom).toISOString() : null,
        toDate: values.leaveTo ? dayjs(values.leaveTo).toISOString() : null,
        oneLeaveNumberOfDays: Number(values.oneLeaveOnDays), // mandatory
        divideByDays: Number(values.perDayRateDays), // mandatory
        elDaysOverride: Number(values.elDaysOverride || 0),
        ...flags, // at least one must be true
      }

      const response = await calculateEL(payload)
      console.log('el post response:', response)

      if (response?.status === 200) {
        setData(response?.data?.data || {})
        setTotalEL(response?.data?.data?.ELDays)
      } else {
        message.error(response?.response?.data?.message || 'Error in calculating')
      }
    } catch (err) {
      if (err?.errorFields) return // antd shows field errors
      message.error(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const title = (
    <div style={{ display: 'flex', gap: '.8rem', alignItems: 'center' }}>
      <span>Earned Leave Calculation</span>
      <Button
        type="primary"
        onClick={handleCalculate}
        loading={loading}
        disabled={!employee?.employeeId}
      >
        Calculate
      </Button>
    </div>
  )

  return (
    <Modal
      title={title}
      centered
      open={open}
      onCancel={() => setOpen(false)}
      width={1000}
      destroyOnClose
    >
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} layout="horizontal">
        {/* Leave Period (required) */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item label="Leave Period" required>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    label="From"
                    name="leaveFrom"
                    noStyle
                    rules={[{ required: true, message: 'From date is required' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="To"
                    name="leaveTo"
                    noStyle
                    dependencies={['leaveFrom']}
                    rules={[
                      { required: true, message: 'To date is required' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const from = getFieldValue('leaveFrom')
                          if (!value || !from) return Promise.resolve()
                          return value.isBefore(from, 'day')
                            ? Promise.reject(new Error('To date must be on/after From date'))
                            : Promise.resolve()
                        },
                      }),
                    ]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          </Col>
        </Row>

        {/* Required numbers */}
        <Row>
          <Col span={24}>
            <Form.Item
              label="One Leave On no. of Days?"
              name="oneLeaveOnDays"
              rules={[
                { required: true, message: 'Required' },
                {
                  validator: (_, v) =>
                    v && /^\d+$/.test(String(v))
                      ? Promise.resolve()
                      : Promise.reject(new Error('Integers only')),
                },
              ]}
            >
              <Input suffix="days" {...digitsOnly('oneLeaveOnDays', { decimals: 0 })} />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Form.Item
              label="Per Day Rate/No. of Days?"
              name="perDayRateDays"
              rules={[
                { required: true, message: 'Required' },
                {
                  validator: (_, v) =>
                    v && /^\d+$/.test(String(v))
                      ? Promise.resolve()
                      : Promise.reject(new Error('Integers only')),
                },
              ]}
            >
              <Input suffix="30 or 26 days" {...digitsOnly('perDayRateDays', { decimals: 0 })} />
            </Form.Item>
          </Col>
        </Row>

        {/* Salary components (at least one required -> enforced in handleCalculate) */}
        <Row style={{ width: '100%' }}>
          <Col span={24}>
            <SalaryComponentList
              title="Salary Component for EL Calculation"
              flags={flags}
              onToggle={handleToggle}
            />
          </Col>
        </Row>
      </Form>

      <div style={{ fontSize: '1.05rem', marginTop: '10px' }}>
        <b>Balance Earned Leave Days: </b>
        {data?.ELDays}
      </div>
      <div style={{ fontSize: '1.05rem' }}>
        <b>Earned Leave Amount: </b>
        {data?.LeaveEncashmentAmount}
      </div>
    </Modal>
  )
}

export default ELCalculationModal
