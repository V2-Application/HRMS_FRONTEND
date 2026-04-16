import { Button, Col, Form, Input, Row, Space } from 'antd'
import { contactDetailsRequiredFields } from '../../constants'
import { useEffect, useRef } from 'react'

const ContactDetails = ({ form, isActive, onNext, onPrev }) => {
  const firstRef = useRef(null)

  const isRequired = (name) => contactDetailsRequiredFields.includes(name)
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
          label="Registered Address"
          name="registeredAddress"
          rules={reqRule('registeredAddress', 'Registered Address is required')}
        >
          <Input
            placeholder="Enter registered address"
            onBlur={(e) => handleBlur(e, 'registeredAddress')}
            ref={firstRef}
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Site Address"
          name="siteAddress"
          rules={reqRule('siteAddress', 'Site Address is required')}
        >
          <Input placeholder="Enter site address" onBlur={(e) => handleBlur(e, 'siteAddress')} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Contact Person Name"
          name="contactPersonName"
          rules={reqRule('contactPersonName', 'Contact person name is required')}
        >
          <Input
            placeholder="Enter contact person name"
            onBlur={(e) => handleBlur(e, 'contactPersonName')}
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Mobile Number"
          name="mobileNumber"
          rules={[
            ...reqRule('mobileNumber', 'Mobile number is required'),
            { pattern: /^[0-9]+$/, message: 'Mobile number must contain digits only' },
            { len: 10, message: 'Mobile number must be exactly 10 digits' },
          ]}
        >
          <Input
            placeholder="Enter mobile number"
            maxLength={10}
            onBlur={(e) => handleBlur(e, 'mobileNumber')}
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Email ID"
          name="emailId"
          rules={[
            ...reqRule('emailId', 'Email is required'),
            { type: 'email', message: 'Enter a valid email address' },
          ]}
        >
          <Input placeholder="Enter your email" onBlur={(e) => handleBlur(e, 'emailId')} />
        </Form.Item>
      </Col>

      <Space style={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
        <Button type="default" onClick={onPrev}>
          Previous
        </Button>
        <Button type="primary" onClick={onNext}>
          Next
        </Button>
      </Space>
    </Row>
  )
}

export default ContactDetails
