import { Button, Col, Form, Input, Row, Space } from 'antd'
import { statCompDetailsRequiredFields } from '../../constants'
import { useEffect, useRef } from 'react'

const StatCompDetails = ({ form, isActive, onNext, onPrev }) => {
  const firstRef = useRef(null)

  const isRequired = (name) => statCompDetailsRequiredFields.includes(name)
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
          label="PAN No."
          name="pan"
          rules={[
            ...reqRule('pan', 'PAN is required'),
            {
              pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i,
              message: 'Please enter a valid PAN No. (e.g. ABCDE1234F)',
            },
          ]}
        >
          <Input placeholder="Enter your PAN" onBlur={(e) => handleBlur(e, 'pan')} ref={firstRef} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="GSTIN"
          name="gstin"
          rules={[
            ...reqRule('gstin', 'GSTIN is required'),
            {
              pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i,
              message: 'Please enter a valid GSTIN (e.g. 27AAPFU0939F1ZV)',
            },
          ]}
        >
          <Input placeholder="Enter GSTIN" onBlur={(e) => handleBlur(e, 'gstin')} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="PF Number"
          name="pfNumber"
          rules={[
            ...reqRule('pfNumber', 'PF number is required'),
            {
              pattern: /^[A-Z]{2}\/[A-Z0-9]{3,10}\/[0-9]{1,7}\/[0-9]{1,10}$/i,
              message: 'Enter a valid PF number (e.g. DL/CPM/12345/1234567)',
            },
          ]}
        >
          <Input placeholder="Enter your PF" onBlur={(e) => handleBlur(e, 'pfNumber')} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="ESIC Number"
          name="esicNumber"
          rules={[
            ...reqRule('esicNumber', 'ESIC is required'),
            { pattern: /^[0-9]{10}$/, message: 'ESIC number must be exactly 10 digits' },
          ]}
        >
          <Input
            placeholder="Enter ESIC number"
            maxLength={10}
            onBlur={(e) => handleBlur(e, 'esicNumber')}
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Labour License No."
          name="labourLicenseNumber"
          rules={[...reqRule('labourLicenseNumber', 'Labour License Number is required')]}
        >
          <Input
            placeholder="Enter labour license no."
            onBlur={(e) => handleBlur(e, 'labourLicenseNumber')}
          />
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

export default StatCompDetails
