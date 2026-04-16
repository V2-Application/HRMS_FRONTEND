import { Button, Col, Form, Input, Row, Space } from 'antd'
import {
  ANNUAL_NET_CTC,
  BASIC_SALARY,
  CCA,
  DA,
  EXTRA_ALLOWANCE,
  GROSS_SALARY,
  HRA,
  MONTHLY_GROSS_CTC,
  RATE,
  salaryDetailsRequiredFields,
  SPECIAL_ALLOWANCE,
  validDecimalPattern,
} from '../../constants'
import { useEffect, useRef } from 'react'

const SalaryDetails = ({ onPrev, isForUpdate, form, isActive, Form, loading }) => {
  const firstRef = useRef(null)

  const watch_basic = Form.useWatch(BASIC_SALARY, form)
  const watch_hra = Form.useWatch(HRA, form)
  const watch_da = Form.useWatch(DA, form)
  const watch_cca = Form.useWatch(CCA, form)
  const watch_special_allowance = Form.useWatch(SPECIAL_ALLOWANCE, form)
  const watch_extra_allowance = Form.useWatch(EXTRA_ALLOWANCE, form)

  const isRequired = (name) => salaryDetailsRequiredFields.includes(name)
  const reqRule = (name, msg) => (isRequired(name) ? [{ required: true, message: msg }] : [])

  const handleBlur = (e, name) => {
    const v = e.target.value
    const t = v.trim()
    if (t !== v) {
      form.setFieldsValue({ [name]: t })
    }
  }

  useEffect(() => {
    // GROSS SALARY
    if (watch_basic && watch_hra && watch_da && watch_cca && watch_special_allowance) {
      let total =
        parseFloat(watch_basic || 0) +
        parseFloat(watch_hra || 0) +
        parseFloat(watch_da || 0) +
        parseFloat(watch_cca || 0) +
        parseFloat(watch_special_allowance || 0)

      form.setFieldsValue({
        [GROSS_SALARY]: total,
      })
    }

    // MONTHLY GROSS CTC & ANNUAL NET CTC
    if (
      (watch_basic && watch_hra && watch_da && watch_cca && watch_special_allowance,
      EXTRA_ALLOWANCE)
    ) {
      let total =
        parseFloat(watch_basic || 0) +
        parseFloat(watch_hra || 0) +
        parseFloat(watch_da || 0) +
        parseFloat(watch_cca || 0) +
        parseFloat(watch_special_allowance || 0) +
        parseFloat(watch_extra_allowance || 0)

      form.setFieldsValue({
        [MONTHLY_GROSS_CTC]: total,
        [ANNUAL_NET_CTC]: total * 12,
      })
    }
  }, [watch_basic, watch_hra, watch_da, watch_cca, watch_special_allowance, EXTRA_ALLOWANCE])

  useEffect(() => {
    if (isActive) {
      setTimeout(() => {
        firstRef.current?.focus?.()
      }, 0)
    }
  }, [isActive])

  return (
    <Row gutter={[16, 16]}>
      {/* <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Basic Salary"
          name={BASIC_SALARY}
          rules={[...reqRule(BASIC_SALARY, 'Basic Salary is required'), validDecimalPattern]}
        >
          <Input ref={firstRef} onBlur={(e) => handleBlur(e, BASIC_SALARY)} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Gross Salary"
          name={GROSS_SALARY}
          rules={[...reqRule(GROSS_SALARY, 'Gross Salary is required'), validDecimalPattern]}
        >
          <Input onBlur={(e) => handleBlur(e, GROSS_SALARY)} readOnly />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="H.R.A."
          name={HRA}
          rules={[...reqRule(HRA, 'HRA is required'), validDecimalPattern]}
        >
          <Input onBlur={(e) => handleBlur(e, HRA)} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="C.C.A."
          name={CCA}
          rules={[...reqRule(CCA, 'CCA is required'), validDecimalPattern]}
        >
          <Input onBlur={(e) => handleBlur(e, CCA)} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="D.A."
          name={DA}
          rules={[...reqRule(DA, 'DA is required'), validDecimalPattern]}
        >
          <Input onBlur={(e) => handleBlur(e, DA)} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Extra Allowance"
          name={EXTRA_ALLOWANCE}
          rules={[...reqRule(EXTRA_ALLOWANCE, 'Extra Allowance is required'), validDecimalPattern]}
        >
          <Input onBlur={(e) => handleBlur(e, EXTRA_ALLOWANCE)} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Special Allowance"
          name={SPECIAL_ALLOWANCE}
          rules={[
            ...reqRule(SPECIAL_ALLOWANCE, 'Special Allowance is required'),
            validDecimalPattern,
          ]}
        >
          <Input onBlur={(e) => handleBlur(e, SPECIAL_ALLOWANCE)} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Monthly Gross CTC"
          name={MONTHLY_GROSS_CTC}
          rules={[
            ...reqRule(MONTHLY_GROSS_CTC, 'Monthly Gross CTC is required'),
            validDecimalPattern,
          ]}
        >
          <Input onBlur={(e) => handleBlur(e, MONTHLY_GROSS_CTC)} readOnly />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Annual Net CTC"
          name={ANNUAL_NET_CTC}
          rules={[...reqRule(ANNUAL_NET_CTC, 'Annual Net CTC is required'), validDecimalPattern]}
        >
          <Input onBlur={(e) => handleBlur(e, ANNUAL_NET_CTC)} readOnly />
        </Form.Item>
      </Col> */}
      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="RATE (PER DAY)"
          name={RATE}
          rules={[...reqRule(RATE, 'Rate is required'), validDecimalPattern]}
        >
          <Input onBlur={(e) => handleBlur(e, RATE)} />
        </Form.Item>
      </Col>

      <Space style={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
        <Button onClick={onPrev}>Previous</Button>

        <Button type="primary" htmlType="submit" loading={loading}>
          {isForUpdate ? 'Update' : 'Submit'}
        </Button>
      </Space>
    </Row>
  )
}

export default SalaryDetails
