import { Button, Col, Form, Input, Row, Space } from 'antd'
import { bankPaymentDetails } from '../../constants'
import { useEffect, useRef } from 'react'

const BankPaymentDetails = ({ form, isActive, onPrev, isSubmitting }) => {
  const BANK_NAME = 'bankName'
  const BRANCH_NAME = 'branchName'
  const ACCOUNT_HOLDER_NAME = 'accountHolderName'
  const ACCOUNT_NUMBER = 'accountNumber'

  const firstRef = useRef(null)

  const isRequired = (name) => bankPaymentDetails.includes(name)
  const reqRule = (name, msg) => (isRequired(name) ? [{ required: true, message: msg }] : [])

  useEffect(() => {
    if (isActive) {
      setTimeout(() => {
        firstRef.current?.focus?.()
      }, 0)
    }
  }, [isActive])

  const handleBlur = (e, name) => {
    const v = e.target.value
    const t = v.trim()
    if (t !== v) {
      form.setFieldsValue({ [name]: t })
    }
  }

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Bank Name"
          name={BANK_NAME}
          rules={[...reqRule(BANK_NAME, 'Bank name is required')]}
        >
          <Input
            placeholder="Enter bank name"
            onBlur={(e) => handleBlur(e, BANK_NAME)}
            ref={firstRef}
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Branch Name"
          name={BRANCH_NAME}
          rules={[...reqRule(BRANCH_NAME, 'Branch Name is required')]}
        >
          <Input placeholder="Enter Branch Name" onBlur={(e) => handleBlur(e, BRANCH_NAME)} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Account Holder Name"
          name={ACCOUNT_HOLDER_NAME}
          rules={[...reqRule(ACCOUNT_HOLDER_NAME, 'Account Holder is required')]}
        >
          <Input
            placeholder="Enter account holder name"
            onBlur={(e) => handleBlur(e, ACCOUNT_HOLDER_NAME)}
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Account Number"
          name={ACCOUNT_NUMBER}
          rules={[
            ...reqRule(ACCOUNT_NUMBER, 'Account Number is required'),
            { pattern: /^[0-9]+$/, message: 'Account number must contain digits only' },
            { min: 9, max: 18, message: 'Account number must be 9 to 18 digits' },
          ]}
        >
          <Input
            placeholder="Enter account number"
            maxLength={18}
            onBlur={(e) => handleBlur(e, ACCOUNT_NUMBER)}
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="IFSC Code"
          name="ifscCode"
          rules={[
            ...reqRule('ifscCode', 'IFSC Code is required'),
            {
              pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/i,
              message: 'Enter a valid IFSC (e.g. HDFC0001234)',
            },
          ]}
        >
          <Input placeholder="Enter IFSC Code" onBlur={(e) => handleBlur(e, 'ifscCode')} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Account Type"
          name="accountType"
          rules={[...reqRule('accountType', 'Account Type is required')]}
        >
          <Input placeholder="Enter account type" onBlur={(e) => handleBlur(e, 'accountType')} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Payment Mode"
          name="paymentMode"
          rules={[...reqRule('paymentMode', 'Payment mode is required')]}
        >
          <Input placeholder="Enter payment mode" onBlur={(e) => handleBlur(e, 'paymentMode')} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Beneficiary Name"
          name="beneficiaryName"
          rules={[...reqRule('beneficiaryName', 'Beneficiary name is required')]}
        >
          <Input
            placeholder="Enter beneficiary name"
            onBlur={(e) => handleBlur(e, 'beneficiaryName')}
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="GST Applicability"
          name="gstApplicability"
          rules={[...reqRule('gstApplicability', 'GST Applicability is required')]}
        >
          <Input
            placeholder="Enter GST Applicability"
            onBlur={(e) => handleBlur(e, 'gstApplicability')}
          />
        </Form.Item>
      </Col>

      <Space style={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
        <Button type="default" onClick={onPrev} disabled={isSubmitting} loading={isSubmitting}>
          Previous
        </Button>

        <Button type="primary" htmlType="submit" disabled={isSubmitting} loading={isSubmitting}>
          Submit
        </Button>
      </Space>
    </Row>
  )
}

export default BankPaymentDetails
