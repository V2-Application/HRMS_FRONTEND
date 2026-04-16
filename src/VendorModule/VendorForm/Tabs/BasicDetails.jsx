import { Button, Col, DatePicker, Form, Input, Row, Space } from 'antd'
import { basicDetailsRequiredFields } from '../../constants'
import { useEffect, useRef } from 'react'

const BasicDetails = ({ form, isActive, onNext }) => {
  const firstRef = useRef(null)

  const isRequired = (name) => basicDetailsRequiredFields.includes(name)
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
          label="Contractor Name"
          name="contractorName"
          rules={reqRule('contractorName', 'Contractor name is required')}
        >
          <Input
            ref={firstRef}
            placeholder="Enter contractor name"
            onBlur={(e) => handleBlur(e, 'contractorName')}
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Contractor Code"
          name="contractorCode"
          rules={reqRule('contractorCode', 'Contractor code is required')}
        >
          <Input
            placeholder="Enter contractor code"
            onBlur={(e) => handleBlur(e, 'contractorCode')}
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Service Category"
          name="serviceCategory"
          rules={reqRule('serviceCategory', 'Service category is required')}
        >
          <Input
            placeholder="Enter service category"
            onBlur={(e) => handleBlur(e, 'serviceCategory')}
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Contract Start Date"
          name="contractStartDate"
          rules={reqRule('contractStartDate', 'Contract start date is required')}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Contract End Date"
          name="contractEndDate"
          rules={[
            ...reqRule('contractEndDate', 'Contract end date is required'),
            ({ getFieldValue }) => ({
              validator(_, value) {
                const start = getFieldValue('contractStartDate')

                if (!start || !value) return Promise.resolve()

                if (value.isBefore(start, 'day')) {
                  return Promise.reject(
                    new Error('End date must be greater than or equal to start date'),
                  )
                }

                return Promise.resolve()
              },
            }),
          ]}
          dependencies={['contractStartDate']}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="Contract Status"
          name="contractStatus"
          rules={reqRule('contractStatus', 'Contract status is required')}
        >
          <Input
            placeholder="Enter contractor status"
            onBlur={(e) => handleBlur(e, 'contractStatus')}
          />
        </Form.Item>
      </Col>

      <Space style={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
        <Button type="primary" onClick={onNext}>
          Next
        </Button>
      </Space>
    </Row>
  )
}

export default BasicDetails
