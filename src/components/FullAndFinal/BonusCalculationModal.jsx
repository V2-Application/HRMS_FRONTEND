import { Button, Col, DatePicker, Form, Input, Modal, Row, Table, message } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import SalaryComponentList from './SalaryComponentList'
import { calculateBonus } from '../../services/Services'

const BonusCalculationModal = ({ open, setOpen, employee, totalBonus, setTotalBonus }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState([])

  // ---- numeric sanitizer (allows one decimal point) ----
  const digitsOnly = (field, { decimals = 2 } = {}) => ({
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

  // ---- checkbox flags (controlled) ----
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
      // reset when closing
      form.resetFields()
      setFlags((f) => ({ ...f })) // keep same selections unless you want to reset to defaults
    }
  }, [open, form])

  const handleToggle = (key, checked) => {
    setFlags((prev) => ({ ...prev, [key]: checked }))
  }

  const handleCalculate = async () => {
    const values = await form.validateFields()
    if (!employee?.employeeId) {
      message.warning('Select an employee first.')
      return
    }

    const isAllFlagsFalse = Object.values(flags).every((e) => e === false)

    if (isAllFlagsFalse) {
      message.warning('Atleast 1 salary component is mandatory')
    }

    const payload = {
      employeeId: Number(employee.employeeId),
      fromDate: values?.bonusFrom ? dayjs(values.bonusFrom).format('YYYY-MM-DD') : null,
      toDate: values?.bonusTo ? dayjs(values.bonusTo).format('YYYY-MM-DD') : null,
      bonusRatePct: values?.bonusRate ? Number(values.bonusRate) : 0,
      minWorkedDays: values?.minDays ? Number(values.minDays) : 0,
      // flags
      ...flags,
    }
    setLoading(true)

    const response = await calculateBonus(payload)

    if (response?.status === 200) {
      setTableData(response?.data?.data?.rows)
      setTotalBonus(response?.data?.data?.totals?.TotalBonus || 0)
    } else {
      message.error(response?.response?.data?.message || 'Error occuring while calculating')
    }

    setLoading(false)
  }

  const columns = [
    {
      title: 'Bonus For Month',
      dataIndex: 'BonusForMonth',
      key: 'BonusForMonth',
      ellipsis: true,
    },
    {
      title: 'Days Worked',
      dataIndex: 'DaysWorked',
      key: 'DaysWorked',
      ellipsis: true,
    },
    {
      title: 'Month',
      dataIndex: 'Month',
      key: 'Month',
      ellipsis: true,
    },
    {
      title: 'Year',
      dataIndex: 'Year',
      key: 'Year',
      ellipsis: true,
    },
    {
      title: 'Paid',
      dataIndex: 'Paid',
      key: 'Paid',
      ellipsis: true,
    },
    {
      title: 'Payable Days',
      dataIndex: 'PayableDays',
      key: 'PayableDays',
      ellipsis: true,
    },
    {
      title: 'Rate',
      dataIndex: 'Rate',
      key: 'Rate',
      ellipsis: true,
    },
  ]

  const title = (
    <div
      style={{
        display: 'flex',
        gap: '0.8rem',
        alignItems: 'center',
      }}
    >
      <span>Bonus Calculation</span>
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
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item label="Bonus Period">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    label="From"
                    name="bonusFrom"
                    noStyle
                    rules={[{ required: true, message: 'From Date is mandatory' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="To"
                    name="bonusTo"
                    noStyle
                    dependencies={['bonusFrom']}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const from = getFieldValue('bonusFrom')
                          if (!value || !from) return Promise.resolve()
                          return value.isBefore(from, 'day')
                            ? Promise.reject(new Error('To date must be on/after From date'))
                            : Promise.resolve()
                        },
                      }),
                      {
                        required: true,
                        message: 'To Date is mandatory',
                      },
                    ]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Form.Item
              label="Bonus Rate"
              name="bonusRate"
              rules={[
                {
                  validator: (_, v) => {
                    if (!v) return Promise.resolve()
                    return /^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(String(v))
                      ? Promise.resolve()
                      : Promise.reject(new Error('Enter a valid % (up to 2 decimals)'))
                  },
                },
                {
                  required: true,
                  message: 'Bonus Rate is mandatory',
                },
              ]}
            >
              <Input suffix="%" {...digitsOnly('bonusRate', { decimals: 2 })} />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Form.Item
              label="Min. Worked Days in Period"
              name="minDays"
              rules={[
                {
                  validator: (_, v) => {
                    if (!v) return Promise.resolve()
                    return /^\d+$/.test(String(v))
                      ? Promise.resolve()
                      : Promise.reject(new Error('Integers only'))
                  },
                },
                {
                  required: true,
                  message: 'Field is mandatory',
                },
              ]}
            >
              <Input suffix="30 or 26 days" {...digitsOnly('minDays', { decimals: 0 })} />
            </Form.Item>
          </Col>
        </Row>

        <Row style={{ width: '100%' }}>
          <Col span={24}>
            <SalaryComponentList flags={flags} onToggle={handleToggle} />
          </Col>
        </Row>
      </Form>

      <Table dataSource={tableData} columns={columns} />
      <span style={{ fontSize: '1.1rem' }}>
        <b>Total Bonus: </b>
        {totalBonus}
      </span>
    </Modal>
  )
}

export default BonusCalculationModal
