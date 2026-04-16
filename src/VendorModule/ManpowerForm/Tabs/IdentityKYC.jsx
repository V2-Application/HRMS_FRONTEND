import { Button, Col, Form, Input, Row, Space } from 'antd'
import React, { useEffect, useRef } from 'react'
import {
  AADHAAR_NUMBER,
  ESIC_IP_NUMBER,
  identityKYCRequiredFields,
  PAN,
  PF_UAN,
} from '../../constants'

const IdentityKYC = ({ form, isActive, onPrev, onNext }) => {
  const firstRef = useRef(null)

  const isRequired = (name) => identityKYCRequiredFields.includes(name)
  const reqRule = (name, msg) => (isRequired(name) ? [{ required: true, message: msg }] : [])

  const handleBlur = (e, name) => {
    const v = e.target.value
    const t = v.trim()
    if (t !== v) {
      form.setFieldsValue({ [name]: t })
    }
  }

  useEffect(() => {
    if (isActive) {
      setTimeout(() => {
        firstRef.current?.focus?.()
      }, 0)
    }
  }, [isActive])

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Aadhar Number"
          name={AADHAAR_NUMBER}
          rules={[
            ...reqRule(AADHAAR_NUMBER, 'Aadhaar No. is required'),
            {
              pattern: /^[2-9]\d{11}$/,
              message: 'Enter a valid 12-digit Aadhaar number and must not start with 0 or 1',
            },
          ]}
        >
          <Input
            placeholder="Enter your aadhaar"
            onBlur={(e) => handleBlur(e, AADHAAR_NUMBER)}
            ref={firstRef}
            maxLength={12}
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="PAN"
          name={PAN}
          rules={[
            ...reqRule(PAN, 'PAN is required'),
            {
              pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i,
              message: 'Please enter a valid PAN No. (e.g. ABCDE1234F)',
            },
          ]}
        >
          <Input placeholder="Enter your PAN" onBlur={(e) => handleBlur(e, PAN)} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="PF UAN"
          name={PF_UAN}
          rules={[{ pattern: /^[0-9]{12}$/, message: 'PF UAN must be of 12 digits' }]}
        >
          <Input
            placeholder="Enter your PF UAN"
            onBlur={(e) => handleBlur(e, PF_UAN)}
            maxLength={12}
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="ESIC IP No."
          name={ESIC_IP_NUMBER}
          rules={[{ pattern: /^[0-9]{10}$/, message: 'ESIC IP No. must be of 10 digits' }]}
        >
          <Input
            placeholder="Enter your ESIC IP No."
            onBlur={(e) => handleBlur(e, ESIC_IP_NUMBER)}
            maxLength={10}
          />
        </Form.Item>
      </Col>

      <Space style={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
        <Button onClick={onPrev}>Previous</Button>

        <Button type="primary" onClick={onNext}>
          Next
        </Button>
      </Space>
    </Row>
  )
}

export default IdentityKYC
