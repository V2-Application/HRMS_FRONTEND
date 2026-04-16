import React from 'react'
import axios from 'axios'
import { Form, Input, DatePicker, Select, Upload, Button, Row, Col, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

const { Option } = Select

const CandidateForm = () => {
  const [form] = Form.useForm()

  const onReset = () => {
    form.resetFields()
  }

  // Default upload props for most fields
  const uploadProps = {
    beforeUpload: () => false,
    multiple: false,
  }

  // Salary Slip: allow multiple file selection, up to 3 files
  const salarySlipUploadProps = {
    beforeUpload: () => false,
    multiple: true,
    maxCount: 3,
  }

  // Passport Photo: allow only one file
  const passportUploadProps = {
    beforeUpload: () => false,
    multiple: false,
    maxCount: 1,
  }

  // PAN Attachment: allow multiple if needed (or change maxCount accordingly)
  const panUploadProps = {
    beforeUpload: () => false,
    multiple: true,
  }

  // Norm function to bind fileList properly
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e
    }
    return e && e.fileList
  }

  // Custom validator for exactly 3 files
  const validateThreeFiles = (_, value, fileName = '') => {
    if (!value || value.length === 0) {
      return Promise.resolve()
    }
    if (value.length !== 3) {
      return Promise.reject(new Error(`Please upload exactly 3 ${fileName} files!`))
    }
    return Promise.resolve()
  }

  // Regex rules for validations
  const numericRule = {
    pattern: /^[0-9]+$/,
    message: 'This field must be numeric',
  }
  const mobileRule = {
    pattern: /^[0-9]{10}$/,
    message: 'Mobile number must be exactly 10 digits',
  }
  const aadhaarRule = {
    pattern: /^[0-9]{12}$/,
    message: 'Aadhaar number must be exactly 12 digits',
  }
  const pinCodeRule = {
    pattern: /^[0-9]{6}$/,
    message: 'Pin Code must be exactly 6 digits',
  }

  // onFinish: Build FormData and submit using axios
  const onFinish = async (values) => {
    const formData = new FormData()

    // Append text fields
    formData.append('Title', values.title || '')
    formData.append('FullName', values.fullName || '')
    formData.append('FathersName', values.fatherName || '')
    formData.append('MothersName', values.motherName || '')
    formData.append('Designation', values.designation || '')
    formData.append('Dob', values.dob ? values.dob.format('YYYY-MM-DD') : '')
    formData.append('Gender', values.gender || '')
    formData.append('PanNo', values.panNumber || '')
    formData.append('AadharNo', values.aadharNumber || '')
    formData.append('NameOnAadhar', values.aadharName || '')
    formData.append('PlaceOfBirth', values.birthPlace || '')
    formData.append('PresentAddress', values.presentAddress || '')
    formData.append('PresentAddressPinCode', values.pinCode || '')
    formData.append('PermanentAddress', values.permanentAddress || '')
    formData.append('MaritalStatus', values.maritalStatus || '')
    formData.append('Mobile', values.mobile || '')
    formData.append('EmailAddress', values.email || '')
    formData.append('Nationality', values.nationality || '')
    formData.append('Religion', values.religion || '')
    formData.append('BankName', values.bankName || '')
    formData.append('AccountNo', values.accountNo || '')
    formData.append('BankIfscCode', values.ifsc || '')
    formData.append('FamilyMemberName', values.familyMember || '')
    formData.append('Company1', values.companyName || '')
    formData.append('WorkLocation', values.workLocation || '')
    formData.append('PositionHeldInPreviousCompany', values.prevComPosition || '')
    formData.append('From', values.fromDate ? values.fromDate.format('YYYY-MM-DD') : '')
    formData.append('To', values.toDate ? values.toDate.format('YYYY-MM-DD') : '')
    formData.append('InHandSalary', values.inHandSalary || '')
    formData.append('LastCtcAnnual', values.lastCTC || '')
    formData.append('HighestQualification', values.education || '')

    // Append file fields (only if a file list exists and is an array)
    if (
      values.passportPhoto &&
      Array.isArray(values.passportPhoto) &&
      values.passportPhoto.length > 0
    ) {
      formData.append('PassportSizePhoto', values.passportPhoto[0].originFileObj)
    }
    if (values.salarySlip && Array.isArray(values.salarySlip) && values.salarySlip.length === 3) {
      values.salarySlip.forEach((file) => {
        formData.append('Last3SalarySlip', file.originFileObj)
      })
    }
    if (
      values.bankStatement &&
      Array.isArray(values.bankStatement) &&
      values.bankStatement.length === 3
    ) {
      values.bankStatement.forEach((file) => {
        formData.append('Last3BankStatement', file.originFileObj)
      })
    }
    if (values.offerLetter && Array.isArray(values.offerLetter) && values.offerLetter.length > 0) {
      formData.append('PrevOfferLetter', values.offerLetter[0].originFileObj)
    }
    if (
      values.panAttachment &&
      Array.isArray(values.panAttachment) &&
      values.panAttachment.length > 0
    ) {
      values.panAttachment.forEach((file) => {
        formData.append('PanAttachment', file.originFileObj)
      })
    }
    if (
      values.aadharAttachment &&
      Array.isArray(values.aadharAttachment) &&
      values.aadharAttachment.length > 0
    ) {
      values.aadharAttachment.forEach((file) => {
        formData.append('AadharAttachment', file.originFileObj)
      })
    }
    if (
      values.bankPassbook &&
      Array.isArray(values.bankPassbook) &&
      values.bankPassbook.length > 0
    ) {
      values.bankPassbook.forEach((file) => {
        formData.append('BankPassbookAttachment', file.originFileObj)
      })
    }
    if (
      values.educationAttachment &&
      Array.isArray(values.educationAttachment) &&
      values.educationAttachment.length > 0
    ) {
      values.educationAttachment.forEach((file) => {
        formData.append('EducationAttachment', file.originFileObj)
      })
    }
    formData.append('CreatedBy', 'user')

    const token = localStorage.getItem('token')

    try {
      const response = await axios.post(
        'https://v2parivar.v2retail.com:9987/api/Candidate/InsertCandidateWithDocs',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } },
      )
      message.success(response.data.message || 'Form submitted successfully!')
      form.resetFields()
    } catch (error) {
      console.error(error)
      if (error.response && error.response.data && error.response.data.errors) {
        const errors = Object.values(error.response.data.errors).flat().join(', ')
        message.error(errors)
      } else {
        message.error('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <div
      style={{
        padding: 24,
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        margin: '20px auto',
        maxWidth: '1200px',
      }}
    >
      <h2 style={{ marginBottom: 24 }}>Candidate Form</h2>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          {/* Basic Details */}
          <Col span={8}>
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: 'Please select title' }]}
            >
              <Select placeholder="Select">
                <Option value="mr">Mr.</Option>
                <Option value="ms">Ms.</Option>
                <Option value="mrs">Mrs.</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[{ required: true, message: 'Please enter full name' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Father's Name"
              name="fatherName"
              rules={[{ required: true, message: "Please enter father's name" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Mother's Name"
              name="motherName"
              rules={[{ required: true, message: "Please enter mother's name" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Department"
              name="department"
              rules={[{ required: true, message: 'Please enter department' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Designation"
              name="designation"
              rules={[{ required: true, message: 'Please enter designation' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          {/* Photo Upload */}
          <Col span={8}>
            <Form.Item
              label="Passport Photo"
              name="passportPhoto"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload {...passportUploadProps}>
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </Form.Item>
          </Col>
          {/* DOB and Gender */}
          <Col span={8}>
            <Form.Item
              label="DOB"
              name="dob"
              rules={[{ required: true, message: 'Please select date of birth' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Gender"
              name="gender"
              rules={[{ required: true, message: 'Please select gender' }]}
            >
              <Select placeholder="Select">
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="trans">Trans</Option>
              </Select>
            </Form.Item>
          </Col>
          {/* PAN and Aadhar */}
          <Col span={8}>
            <Form.Item
              label="PAN Number"
              name="panNumber"
              rules={[{ required: true, message: 'Please enter PAN number' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="PAN Attachment"
              name="panAttachment"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload {...panUploadProps}>
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Aadhar Number"
              name="aadharNumber"
              rules={[{ required: true, message: 'Please enter Aadhar number' }, aadhaarRule]}
            >
              <Input maxLength={12} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Name on Aadhar"
              name="aadharName"
              rules={[{ required: true, message: 'Please enter name on Aadhar' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Pin Code in Aadhar"
              name="pinCode"
              rules={[{ required: true, message: 'Please enter pin code' }, pinCodeRule]}
            >
              <Input maxLength={6} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Aadhar Attachment"
              name="aadharAttachment"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </Form.Item>
          </Col>
          {/* Address */}
          <Col span={8}>
            <Form.Item label="Birth Place" name="birthPlace">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Present Address"
              name="presentAddress"
              rules={[{ required: true, message: 'Please enter present address' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Permanent Address"
              name="permanentAddress"
              rules={[{ required: true, message: 'Please enter permanent address' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          {/* Marital, Mobile, Email */}
          <Col span={8}>
            <Form.Item label="Marital Status" name="maritalStatus">
              <Select placeholder="Select">
                <Option value="single">Single</Option>
                <Option value="married">Married</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Mobile"
              name="mobile"
              rules={[{ required: true, message: 'Please enter mobile number' }, mobileRule]}
            >
              <Input maxLength={10} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: 'Please enter email address' },
                { type: 'email', message: 'Enter a valid email' },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          {/* Nationality and Religion */}
          <Col span={8}>
            <Form.Item label="Nationality" name="nationality">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Religion" name="religion">
              <Input />
            </Form.Item>
          </Col>
          {/* Bank Details */}
          <Col span={8}>
            <Form.Item
              label="Bank Name"
              name="bankName"
              rules={[{ required: true, message: 'Please enter bank name' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="A/C No"
              name="accountNo"
              rules={[{ required: true, message: 'Please enter account number' }, numericRule]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Bank IFSC Code"
              name="ifsc"
              rules={[{ required: true, message: 'Please enter IFSC code' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          {/* File Uploads: Salary Slips, Bank Passbook, Bank Statement, Offer Letter */}
          <Col span={8}>
            <Form.Item
              label="Last 3 Months Salary Slips"
              name="salarySlip"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[
                {
                  validator: (_, value) => {
                    if (!value || value.length === 0) {
                      return Promise.resolve()
                    }
                    if (value.length !== 3) {
                      return Promise.reject(new Error('Please upload exactly 3 salary slip files!'))
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <Upload {...salarySlipUploadProps} accept="application/pdf">
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Bank Passbook"
              name="bankPassbook"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Bank Statement Last 3 Months"
              name="bankStatement"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[
                {
                  validator: (_, value) => {
                    if (!value || value.length === 0) {
                      return Promise.resolve()
                    }
                    if (value.length !== 3) {
                      return Promise.reject(
                        new Error('Please upload exactly 3 bank statement files!'),
                      )
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <Upload {...salarySlipUploadProps}>
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Previous Company Offer Letter"
              name="offerLetter"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </Form.Item>
          </Col>
          {/* Company Contacts and References */}
          <Col span={8}>
            <Form.Item
              label="Company 1 Contact No"
              name="comp1Contact"
              rules={[
                {
                  pattern: /^[0-9]{10}$/,
                  message: 'Contact number must be exactly 10 digits',
                },
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Company 1 Reference" name="comp1Reference">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Company 2 Contact No"
              name="comp2Contact"
              rules={[
                {
                  pattern: /^[0-9]{10}$/,
                  message: 'Contact number must be exactly 10 digits',
                },
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Company 2 Reference" name="comp2Reference">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Company 3 Contact No"
              name="comp3Contact"
              rules={[
                {
                  pattern: /^[0-9]{10}$/,
                  message: 'Contact number must be exactly 10 digits',
                },
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Company 3 Reference" name="comp3Reference">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Company 4 Contact No"
              name="comp4Contact"
              rules={[
                {
                  pattern: /^[0-9]{10}$/,
                  message: 'Contact number must be exactly 10 digits',
                },
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Company 4 Reference" name="comp4Reference">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Company 5 Contact No"
              name="comp5Contact"
              rules={[
                {
                  pattern: /^[0-9]{10}$/,
                  message: 'Contact number must be exactly 10 digits',
                },
              ]}
            >
              <Input maxLength={10} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Company 5 Reference" name="comp5Reference">
              <Input />
            </Form.Item>
          </Col>
          {/* Family Member Details */}
          <Col span={8}>
            <Form.Item label="Family Member Name" name="familyMember">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Family Member DOB" name="familyMemberDob">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Relation to Family Member" name="familyMemberRelation">
              <Input />
            </Form.Item>
          </Col>
          {/* Company Details */}
          <Col span={8}>
            <Form.Item
              label="Name of Company"
              name="companyName"
              rules={[{ required: true, message: 'Please enter company name' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Work Location"
              name="workLocation"
              rules={[{ required: true, message: 'Please enter work location' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Position held in Previous Company"
              name="prevComPosition"
              rules={[{ required: true, message: 'Please enter previous company position' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="From Date"
              name="fromDate"
              rules={[{ required: true, message: 'Please select from date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="To Date"
              name="toDate"
              rules={[{ required: true, message: 'Please select to date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          {/* Salary and Education */}
          <Col span={8}>
            <Form.Item
              label="In-hand Salary"
              name="inHandSalary"
              rules={[{ required: true, message: 'Please enter in-hand salary' }, numericRule]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Last CTC (Annual)"
              name="lastCTC"
              rules={[{ required: true, message: 'Please enter last CTC' }, numericRule]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Joining Date of Current Company" name="currentCompanyJoinDate">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Education"
              name="education"
              rules={[{ required: true, message: 'Please enter education' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Education Attachment"
              name="educationAttachment"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Grade in Highest Qualification (%)"
              name="grade"
              rules={[
                numericRule,
                {
                  validator: (_, value) => {
                    if (!value || Number(value) <= 100) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Grade must not exceed 100'))
                  },
                },
              ]}
            >
              <Input maxLength={3} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
            Submit
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default CandidateForm
