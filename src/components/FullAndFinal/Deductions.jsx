import React, { useEffect, useState } from 'react'
import { Button, Col, DatePicker, Form, Input, Row, Select, message } from 'antd'
import dayjs from 'dayjs'
import axios from 'axios'
import axiosInstance from '../../services/axiosInstance'
import { useSelector } from 'react-redux'

const { Option } = Select

/** Simple responsive hook (no external deps) */
const useIsMobile = (query = '(max-width: 768px)') => {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = (e) => setIsMobile(e.matches)
    setIsMobile(mq.matches)
    try {
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    } catch {
      mq.addListener(onChange)
      return () => mq.removeListener(onChange)
    }
  }, [query])
  return isMobile
}

const Deductions = ({ employee, fetchFNFEmployees, setSelectedEmployee, additionsData = {} }) => {
  const isMobile = useIsMobile()
  const [form] = Form.useForm()
  const authData = useSelector((state) => state?.auth?.data);

  // Decimal validation rule for form fields
  const decimalRule = (decimals = null, { allowNegative = false } = {}) => ({
    validator: (_, value) => {
      if (value === undefined || value === null || value === '') return Promise.resolve()
      const str = String(value)

      if (decimals === 0) {
        const re = allowNegative ? /^-?\d+$/ : /^\d+$/;
        return re.test(str)
          ? Promise.resolve()
          : Promise.reject(new Error(allowNegative ? 'Integers only (±)' : 'Integers only'))
      }

      const sign = allowNegative ? '-?' : ''
      if (decimals === null) {
        const re = new RegExp(`^(?:${sign}\\d+|${sign}\\d+\\.\\d*|${sign}\\.\\d+)$`)
        return re.test(str) ? Promise.resolve() : Promise.reject(new Error('Enter a valid number'))
      }
      const re = new RegExp(
        `^(?:${sign}\\d+(?:\\.\\d{0,${decimals}})?|${sign}\\.\\d{1,${decimals}})$`,
      )
      return re.test(str)
        ? Promise.resolve()
        : Promise.reject(
            new Error(`Up to ${decimals} decimal places${allowNegative ? ' (±)' : ''}`),
          )
    },
  })

  const num = (v) => {
    if (v === undefined || v === null || v === '') return 0
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }

  const computeTotalPayable = (values) => {
    // From Additions tab
    const unpaidSalaryAmount = num(additionsData?.unpaidSalaryAmount)
    const bonus = num(additionsData?.bonus)
    const gratuity = num(additionsData?.gratuity)
    const noticeSalary = num(additionsData?.noticeSalary)
    const elAmount = num(additionsData?.elAmount)

    // Other Additions 1-4 from Additions tab
    const add1 = num(additionsData?.otherAddition1)
    const add2 = num(additionsData?.otherAddition2)
    const add3 = num(additionsData?.otherAddition3)
    const add4 = num(additionsData?.otherAddition4)

    // Deductions entered here
    const loanBalance = num(values?.loanBalance)
    const advanceBalance = num(values?.advanceBalance)

    const other1 = num(values?.otherDeduction?.[1]?.amount)
    const other2 = num(values?.otherDeduction?.[2]?.amount)
    const other3 = num(values?.otherDeduction?.[3]?.amount)
    const other4 = num(values?.otherDeduction?.[4]?.amount)

    return (
      unpaidSalaryAmount +
      bonus +
      gratuity +
      noticeSalary +
      elAmount +
      add1 +
      add2 +
      add3 +
      add4 - 
      loanBalance - 
      advanceBalance - 
      other1 - 
      other2 - 
      other3 - 
      other4
    )
  }

  const computeNetPayable = (values, totalPayable) => {
    const tds = num(values?.tds)
    return totalPayable - tds
  }

  const watched = Form.useWatch([], form)

  useEffect(() => {
    const values = form.getFieldsValue(true)
    const totalPayable = computeTotalPayable(values)
    const netPayable = computeNetPayable(values, totalPayable)

    form.setFieldsValue({
      totalPayable: totalPayable.toFixed(2),
      netPayable: netPayable.toFixed(2),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watched,
    additionsData?.unpaidSalaryAmount,
    additionsData?.bonus,
    additionsData?.gratuity,
    additionsData?.noticeSalary,
    additionsData?.elAmount,
    additionsData?.otherAddition1,
    additionsData?.otherAddition2,
    additionsData?.otherAddition3,
    additionsData?.otherAddition4,
  ])

  // const onSubmit = async (values) => {
  //   const payload = {
  //     employeeId: employee?.id || 0, // Replace with your employee ID
  //     user: "string", // Replace with user from context or form if needed
  //     fnfDate: dayjs().toISOString(), // Current date (can be from form as well)
  //     dateOfLeaving: dayjs(values?.dateOfLeaving).toISOString(),
  //     unpaidSalaryAmount: additionsData?.unpaidSalaryAmount || 0,
  //     rate: values?.rate || 0, // Assuming this value is input in the form
  //     days: values?.days || 0,  // Assuming this value is input in the form
  //     salaryMonth: values?.salaryMonth || "string", // Assuming this value is input in the form
  //     bonus: additionsData?.bonus || 0,
  //     bonusPeriodFrom: dayjs(values?.bonusPeriodFrom).toISOString(),
  //     bonusPeriodTill: dayjs(values?.bonusPeriodTill).toISOString(),
  //     gratuity: additionsData?.gratuity || 0,
  //     calculatedAs: values?.calculatedAs || "string", // Replace if needed
  //     e_LeaveAmount: additionsData?.elAmount || 0,
  //     elDays: values?.elDays || 0,
  //     noticeSalary: additionsData?.noticeSalary || 0,
  //     otherAddition1: additionsData?.otherAddition1 || 0,
  //     otherAddition2: additionsData?.otherAddition2 || 0,
  //     otherAddition3: additionsData?.otherAddition3 || 0,
  //     otherAddition4: additionsData?.otherAddition4 || 0,
  //     loanBalance: values?.loanBalance || 0,
  //     advanceBalance: values?.advanceBalance || 0,
  //     otherDeduction1: values?.otherDeduction?.[1]?.amount || 0,
  //     otherDeduction2: values?.otherDeduction?.[2]?.amount || 0,
  //     otherDeduction3: values?.otherDeduction?.[3]?.amount || 0,
  //     otherDeduction4: values?.otherDeduction?.[4]?.amount || 0,
  //     totalPayable: values?.totalPayable || 0,
  //     tds: values?.tds || 0,
  //     netPayable: values?.netPayable || 0,
  //     depositOn: dayjs(values?.depositOn).toISOString(),
  //     sendForPaymentAmount: values?.sendForPaymentAmount || 0,
  //     remarks: values?.remarks || "string",
  //     chequeNo: values?.chequeNo || "string",
  //     chequeDate: dayjs(values?.chequeDate).toISOString(),
  //     status: values?.status || "string",
  //     amountPaid: values?.amountPaid || 0,
  //     paymentVoucherNo: values?.voucherNo || "string",
  //   }

  //   console.log("Payload:", payload)

  //   // Submit the payload to the API
  //   try {
  //     const response = await axios.post('http://192.168.151.28:9985/api/Fnf/save', payload, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${localStorage.getItem('token')}`,
  //       },
  //     })
      
  //     if (response.status === 200) {
  //       message.success("FNF data saved successfully.")
  //       form.resetFields()  // Reset the form after successful submission
  //       if (typeof fetchFNFEmployees === 'function') fetchFNFEmployees()
  //       if (typeof setSelectedEmployee === 'function') setSelectedEmployee(null)
  //     } else {
  //       message.error("Error saving FNF data.")
  //     }
  //   } catch (error) {
  //     message.error("Error saving FNF data.")
  //     console.error("Error:", error)
  //   }
  // }

const onSubmit = async (values) => {
  const payload = {
    // employeeId: employee?.id || 0, 
    employeeId: Number(employee?.employeeId || 0),
    user: Number(authData?.employeeId || 0).toString(), 
    fnfDate: dayjs().toISOString(), // Current date
    dateOfLeaving: dayjs(values?.dateOfLeaving).toISOString(),
    unpaidSalaryAmount: additionsData?.unpaidSalaryAmount || 0,
    rate: values?.rate || 0,
    days: values?.days || 0,
    salaryMonth: values?.salaryMonth || "",
    bonus: additionsData?.bonus || 0,
    bonusPeriodFrom: dayjs(values?.bonusPeriodFrom).toISOString(),
    bonusPeriodTill: dayjs(values?.bonusPeriodTill).toISOString(),
    gratuity: additionsData?.gratuity || 0,
    calculatedAs: values?.calculatedAs || "",
    e_LeaveAmount: additionsData?.elAmount || 0,
    elDays: values?.elDays || 0,
    noticeSalary: additionsData?.noticeSalary || 0,
    otherAddition1: additionsData?.otherAddition1 || 0,
    otherAddition2: additionsData?.otherAddition2 || 0,
    otherAddition3: additionsData?.otherAddition3 || 0,
    otherAddition4: additionsData?.otherAddition4 || 0,
    loanBalance: values?.loanBalance || 0,
    advanceBalance: values?.advanceBalance || 0,
    otherDeduction1: values?.otherDeduction?.[1]?.amount || 0,
    otherDeduction2: values?.otherDeduction?.[2]?.amount || 0,
    otherDeduction3: values?.otherDeduction?.[3]?.amount || 0,
    otherDeduction4: values?.otherDeduction?.[4]?.amount || 0,
    totalPayable: values?.totalPayable || 0,
    tds: values?.tds || 0,
    netPayable: values?.netPayable || 0,
    depositOn: values?.depositOn ? Number(dayjs(values.depositOn).format('YYYYMMDD')) : null, // Converting depositOn to a numeric value
    sendForPaymentAmount: values?.sendForPaymentAmount || 0,
    remarks: values?.remarks || "",
    chequeNo: values?.chequeNo || "",
    chequeDate: dayjs(values?.chequeDate).toISOString(),
    status: values?.status || "",
    amountPaid: values?.amountPaid || 0,
    paymentVoucherNo: values?.voucherNo || "",
  }

  // Submit the payload to the API
  try {
    const response = await axiosInstance.post('/api/Fnf/save', payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    
    if (response.status === 200) {
      message.success("FNF data saved successfully.")
      form.resetFields()  // Reset the form after successful submission
      if (typeof fetchFNFEmployees === 'function') fetchFNFEmployees()
      if (typeof setSelectedEmployee === 'function') setSelectedEmployee(null)
    } else {
      message.error("Error saving FNF data.")
    }
  } catch (error) {
    message.error("Error saving FNF data.")
    console.error("Error:", error)
  }
}



  return (
    <div style={{ paddingInline: '1rem', paddingBottom: isMobile ? 12 : 20 }}>
      <Form
        form={form}
        layout={isMobile ? 'vertical' : 'horizontal'}
        labelCol={isMobile ? undefined : { span: 8 }}
        wrapperCol={isMobile ? undefined : { span: 16 }}
        onFinish={onSubmit}
        size={isMobile ? 'middle' : 'large'}
        initialValues={{
          totalPayable: '0.00',
          netPayable: '0.00',
        }}
      >
        {/* Form fields go here */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="Less: Loan Balance" name="loanBalance" rules={[decimalRule(2)]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Less: Advance Bal." name="advanceBalance" rules={[decimalRule(2)]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {[1, 2, 3, 4].map((n) => (
          <Row gutter={[16, 16]} key={n} align="middle">
            <Col xs={24} md={10} lg={8}>
              <Form.Item
                label={`Other Deduction ${n}`}
                name={['otherDeduction', n, 'amount']}
                rules={[decimalRule(2)]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={14} lg={16}>
              <Form.Item
                label="Against"
                name={['otherDeduction', n, 'against']}
                labelCol={isMobile ? undefined : { span: 6 }}
                wrapperCol={isMobile ? undefined : { span: 18 }}
              >
                <Input placeholder={`Against (Other Deduction ${n})`} />
              </Form.Item>
            </Col>
          </Row>
        ))}

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="Total Payable" name="totalPayable">
              <Input readOnly />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Deposit On"
                  name="depositOn"
                  labelCol={isMobile ? undefined : { span: 10 }}
                  wrapperCol={isMobile ? undefined : { span: 14 }}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label={isMobile ? 'Deposit Amount' : ' '}
                  colon={isMobile ? true : false}
                  name="depositAmount"
                  labelCol={{ span: isMobile ? 24 : 0 }}
                  wrapperCol={{ span: 24 }}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="Less: T.D.S." name="tds" rules={[decimalRule(2)]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Net Payable" name="netPayable">
              <Input readOnly />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Form.Item label="Sent for Payment" name="sentForPayment" rules={[decimalRule(2)]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Amount Paid"
              name="amountPaid"
              labelCol={isMobile ? undefined : { span: 10 }}
              wrapperCol={isMobile ? undefined : { span: 14 }}
              rules={[decimalRule(2)]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Pymt. Vchr. No."
              name="voucherNo"
              labelCol={isMobile ? undefined : { span: 12 }}
              wrapperCol={isMobile ? undefined : { span: 12 }}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Form.Item
              label="Remarks/Payment Details"
              name="remarks"
              labelCol={isMobile ? undefined : { span: 6 }}
              wrapperCol={isMobile ? undefined : { span: 18 }}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Form.Item label="Cheque No." name="chequeNo">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Chq. Date" name="chequeDate">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Status" name="status">
              <Select allowClear placeholder="Select status">
                <Option value="pending">Pending</Option>
                <Option value="processed">Processed</Option>
                <Option value="reconciled">Reconciled</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Row justify="end">
            <Col xs={24} sm="auto">
              <Button type="primary" htmlType="submit" disabled={!employee} block={isMobile}>
                Submit
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </div>
  )
}

export default Deductions
