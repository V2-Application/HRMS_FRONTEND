import React, { useState } from 'react'
import { Form, Input, Button, Select, Upload, Row, Col, message, Card, DatePicker } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import './employee.css'

const { Option } = Select

const EmployeeForm = () => {
  const [form] = Form.useForm()
  const [profilePic, setProfilePic] = useState(null)

  const handleUpload = ({ file }) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('You can only upload image files!  ')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setProfilePic(reader.result)
      message.success(`${file.name} uploaded successfully`)
    }
    reader.readAsDataURL(file)
  }

  const onFinish = (values) => {
    // console.log('Form Data:', values)
    message.success('Application Submitted!')
  }

  return (
    <Card title="Employee Application Form" style={{ width: '100%', margin: 'auto' }}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={24} style={{ flexWrap: 'wrap' }}>
          <Col xs={24} sm={12} md={8}>
            <Upload
              className="custom profile-photo"
              listType="picture-card"
              maxCount={1}
              showUploadList={false}
              customRequest={({ file, onSuccess }) => {
                setTimeout(() => {
                  handleUpload({ file })
                  onSuccess('ok')
                }, 0)
              }}
            >
              {profilePic ? (
                <div className="profile_img" style={{ position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={profilePic}
                    alt="avatar"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              ) : (
                <div>
                  <UploadOutlined />
                  <p>Upload</p>
                </div>
              )}
            </Upload>
          </Col>

          {/* Personal Information */}
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true, message: 'Enter your full name' }]}
            >
              <Input placeholder="John Doe" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
            >
              <Input placeholder="john.doe@example.com" />
            </Form.Item>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: 'Select gender' }]}
            >
              <Select placeholder="Select Gender">
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[{ required: true, message: 'Enter phone number' }]}
            >
              <Input placeholder="+91 9876543210" />
            </Form.Item>
            <Form.Item
              name="dob"
              label="Date of Birth"
              rules={[{ required: true, message: 'Select your birth date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="maritalStatus"
              label="Marital Status"
              rules={[{ required: true, message: 'Select marital status' }]}
            >
              <Select placeholder="Select">
                <Option value="single">Single</Option>
                <Option value="married">Married</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="address"
          label="Address"
          rules={[{ required: true, message: 'Enter address' }]}
        >
          <Input.TextArea rows={2} placeholder="Enter your full address" />
        </Form.Item>

        {/* Job Information */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="position"
              label="Position Applied"
              rules={[{ required: true, message: 'Select position' }]}
            >
              <Select placeholder="Select Position">
                <Option value="developer">Developer</Option>
                <Option value="designer">Designer</Option>
                <Option value="manager">Manager</Option>
                <Option value="hr">HR</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="experience"
              label="Years of Experience"
              rules={[{ required: true, message: 'Enter experience' }]}
            >
              <Input placeholder="e.g. 5 years" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="expectedSalary"
              label="Expected Salary"
              rules={[{ required: true, message: 'Enter expected salary' }]}
            >
              <Input placeholder="₹ 50000" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="availableJoinDate"
              label="Available Join Date"
              rules={[{ required: true, message: 'Select join date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        {/* Education Information */}
        <Form.Item
          name="highestQualification"
          label="Highest Qualification"
          rules={[{ required: true, message: 'Enter qualification' }]}
        >
          <Input placeholder="e.g. B.Tech in Computer Science" />
        </Form.Item>

        <Form.Item
          name="university"
          label="University/College"
          rules={[{ required: true, message: 'Enter university' }]}
        >
          <Input placeholder="e.g. IIT Delhi" />
        </Form.Item>

        <Form.Item
          name="skills"
          label="Technical Skills (comma separated)"
          rules={[{ required: true, message: 'Enter skills' }]}
        >
          <Input placeholder="e.g. React, Node.js, SQL" />
        </Form.Item>

        {/* Reference Information */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="referenceName" label="Reference Name">
              <Input placeholder="Enter reference name" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="referenceContact" label="Reference Contact">
              <Input placeholder="Enter reference contact" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="additionalNotes" label="Additional Notes">
          <Input.TextArea rows={3} placeholder="Any extra information..." />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Submit Application
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default EmployeeForm
