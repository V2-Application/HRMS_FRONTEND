import { Button, Form, Input, Select, Space } from 'antd'
import React, { useEffect, useState } from 'react'
import { getDropdownLocDesDep } from '../../services/Services'

const JDForm = ({ initialValues, onFinish, loading }) => {
  const [form] = Form.useForm()
  const [designations, setDesignations] = useState([])

  useEffect(() => {
    console.log('initialValues:', initialValues)
    if (initialValues) {
      form.setFieldsValue({
        designationName: initialValues.designationName || undefined,
        keyResponsibility: initialValues.keyResponsibility || '',
        keySkills: initialValues.keySkills || '',
      })
    } else {
      form.resetFields()
      form.setFieldsValue({
        designationName: undefined,
        keyResponsibility: '',
        keySkills: '',
      })
    }
  }, [initialValues, form])

  const handleFinish = (values) => {
    const formattedData = {
      jdId: initialValues?.jdId ?? 0,
      designationName: values.designationName,
      keyResponsibility: values.keyResponsibility,
      keySkills: values.keySkills,
    }
    onFinish(formattedData)
  }

  const fetchDesignations = async () => {
    const response = await getDropdownLocDesDep('designation')
    if (response?.status) {
      setDesignations(response?.data?.Designation || [])
    } else {
      setDesignations([])
    }
  }

  useEffect(() => {
    fetchDesignations()
  }, [])

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        designationName: undefined,
        keyResponsibility: '',
        keySkills: '',
      }}
    >
      <Form.Item
        label="Designation"
        name="designationName"
        // rules={[{ required: true, message: 'Please select a designation!' }]}
      >
        <Select placeholder="Select designation" showSearch optionFilterProp="children">
          {designations?.map((des) => (
            <Select.Option key={des?.designationId} value={des?.designationName}>
              {des?.designationName}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Key Responsibility"
        name="keyResponsibility"
        rules={[{ required: true, message: 'Please enter a key responsibility' }]}
      >
        <Input.TextArea placeholder="Enter key responsibility" autoSize={{ minRows: 3 }} />
      </Form.Item>

      <Form.Item
        label="Key Skills"
        name="keySkills"
        rules={[{ required: true, message: 'Please enter key skills' }]}
      >
        <Input.TextArea placeholder="Enter key skills" autoSize={{ minRows: 3 }} />
      </Form.Item>

      <Form.Item>
        <Space style={{ float: 'right' }}>
          <Button htmlType="submit" type="primary" loading={loading}>
            {initialValues ? 'Update' : 'Create'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export default JDForm
