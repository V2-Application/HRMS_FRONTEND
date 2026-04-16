import { Button, Col, DatePicker, Form, Input, Row, Select, Space } from 'antd'
import { useEffect, useRef, useState } from 'react'
import {
  ADDRESS,
  DATE_OF_BIRTH,
  FATHER_SPOUSE_NAME,
  FULL_NAME,
  GENDER,
  MOBILE_NUMBER,
  personalDetailsRequiredFields,
  RELATION_TYPE,
  EMAIL,
} from '../../constants'
import dayjs from 'dayjs'

const PersonalDetails = ({ form, isActive, onNext, onPrev }) => {
  const relationType = Form.useWatch(RELATION_TYPE, form) || 'father'

  const firstRef = useRef(null)

  const isRequired = (name) => personalDetailsRequiredFields.includes(name)
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
          label="Full Name"
          name={FULL_NAME}
          rules={[...reqRule(FULL_NAME, 'Full name is required')]}
        >
          <Input
            placeholder="Enter your name"
            onBlur={(e) => handleBlur(e, FULL_NAME)}
            ref={firstRef}
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Father/Spouse Name"
          name={FATHER_SPOUSE_NAME}
          rules={[
            ...reqRule(
              FATHER_SPOUSE_NAME,
              `${relationType === 'father' ? 'Father' : relationType === 'spouse' ? 'Spouse' : ''} name is required`,
            ),
          ]}
        >
          <Input.Group compact>
            <Form.Item
              name={RELATION_TYPE}
              noStyle
              initialValue="father"
              rules={[...reqRule(RELATION_TYPE, 'Select father/spouse')]}
            >
              <Select style={{ width: '35%' }} placeholder="Select">
                <Select.Option value="father">Father</Select.Option>
                <Select.Option value="spouse">Spouse</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name={FATHER_SPOUSE_NAME}
              noStyle
              // rules={[
              //   ...reqRule(
              //     FATHER_SPOUSE_NAME,
              //     `${relationType === 'father' ? 'Father' : relationType === 'spouse' ? 'Spouse' : ''} name is required`,
              //   ),
              // ]}
            >
              <Input
                style={{ width: '65%' }}
                placeholder="Enter name"
                onBlur={(e) => handleBlur(e, FATHER_SPOUSE_NAME)}
              />
            </Form.Item>
          </Input.Group>
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Date of Birth"
          name={DATE_OF_BIRTH}
          rules={[
            ...reqRule(DATE_OF_BIRTH, 'Date of Birth is required'),
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve()

                const birthDate = dayjs(value)
                if (!birthDate.isValid()) {
                  return Promise.reject(new Error('Invalid date'))
                }

                const isAtLeast18 = dayjs().diff(birthDate, 'year') >= 18
                return isAtLeast18
                  ? Promise.resolve()
                  : Promise.reject(new Error('You must be at least 18 years old'))
              },
            },
          ]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item label="Gender" name={GENDER} rules={[...reqRule(GENDER, 'Gender is required')]}>
          <Select placeholder="Select your gender">
            <Select.Option value="Male">Male</Select.Option>
            <Select.Option value="Female">Female</Select.Option>
            <Select.Option value="Others">Others</Select.Option>
          </Select>
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Mobile Number"
          name={MOBILE_NUMBER}
          rules={[
            ...reqRule(MOBILE_NUMBER, 'Mobile no. is required'),
            { pattern: /^[0-9]+$/, message: 'Mobile number must contain digits only' },
            { len: 10, message: 'Mobile number must be exactly 10 digits' },
          ]}
        >
          <Input
            placeholder="Enter mobile number"
            maxLength={10}
            onBlur={(e) => handleBlur(e, MOBILE_NUMBER)}
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Email"
          name={EMAIL}
          rules={[
            ...reqRule(EMAIL, 'Email is required'),
            { type: 'email', message: 'Enter valid email' },
          ]}
        >
          <Input placeholder="Enter your email" onBlur={(e) => handleBlur(e, EMAIL)} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Address"
          name={ADDRESS}
          rules={[...reqRule(ADDRESS, 'Address is required')]}
        >
          <Input
            placeholder="Enter your address"
            onBlur={() => handleBlur(ADDRESS, 'Address is required')}
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

export default PersonalDetails
