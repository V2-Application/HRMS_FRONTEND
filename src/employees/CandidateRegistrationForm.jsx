import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Typography,
  Card,
  Divider,
  Checkbox,
  message,
  DatePicker,
  Upload,
} from 'antd'
import { UploadOutlined, RollbackOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import dayjs from 'dayjs'
import { submitCandidateRegistration } from '../services/Services'

const { Option } = Select
const { Title, Text } = Typography

const PROGRAMS = [
  'Retail Foundation Program',
  'Store Management Program',
  'Leadership Development Program',
  'Corporate Functional Program',
]
const QUALIFICATIONS = ['12th', 'Diploma', 'Graduate', 'Post Graduate', 'Other']

// antd Upload helper: keep the file locally (don't auto-upload), single file each.
const singleFileProps = (onFile) => ({
  beforeUpload: (file) => {
    onFile(file)
    return false // prevent auto upload; we send it with the form
  },
  maxCount: 1,
  onRemove: () => onFile(null),
})

// evaluate a media query reactively (for small responsive tweaks)
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )
  useEffect(() => {
    const media = window.matchMedia(query)
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])
  return matches
}

const CandidateRegistrationForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  // In-app (IT Superadmin) opens this at /v2-pathshala/registration-form -> go back to the
  // registrations list. The public pre-login form (/candidate-registration) goes back to login.
  const isInApp = location.pathname.startsWith('/v2-pathshala')
  const backTo = isInApp ? '/v2-pathshala/registrations' : '/login'
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const isMobile = useMediaQuery('(max-width: 576px)')
  const [filesState, setFilesState] = useState({
    Photo: null,
    Resume: null,
    Aadhaar: null,
    Marksheet: null,
  })

  const setFile = (key) => (file) => setFilesState((s) => ({ ...s, [key]: file }))

  const onFinish = async (values) => {
    const fd = new FormData()
    fd.append('ProgramApplyingFor', values.ProgramApplyingFor || '')
    fd.append('ModeOfTraining', values.ModeOfTraining || '')
    fd.append('FullName', values.FullName || '')
    fd.append('MobileNumber', values.MobileNumber || '')
    fd.append('WhatsAppNumber', values.WhatsAppNumber || '')
    fd.append('Email', values.Email || '')
    fd.append(
      'DateOfBirth',
      values.DateOfBirth ? dayjs(values.DateOfBirth).format('YYYY-MM-DD') : '',
    )
    fd.append('Gender', values.Gender || '')
    fd.append('HighestQualification', values.HighestQualification || '')
    fd.append('Specialization', values.Specialization || '')
    fd.append('CollegeUniversity', values.CollegeUniversity || '')
    fd.append('PassingYear', values.PassingYear ? String(values.PassingYear) : '')
    fd.append('PreferredLearningMode', values.PreferredLearningMode || '')
    fd.append('AgreedToTerms', values.AgreedToTerms ? 'true' : 'false')

    if (filesState.Photo) fd.append('Photo', filesState.Photo)
    if (filesState.Resume) fd.append('Resume', filesState.Resume)
    if (filesState.Aadhaar) fd.append('Aadhaar', filesState.Aadhaar)
    if (filesState.Marksheet) fd.append('Marksheet', filesState.Marksheet)

    try {
      setSubmitting(true)
      const res = await submitCandidateRegistration(fd)
      if (res?.status === false) {
        message.error(res?.message || 'Submission failed.')
      } else {
        message.success(res?.message || 'Registration submitted successfully!')
        form.resetFields()
        setFilesState({ Photo: null, Resume: null, Aadhaar: null, Marksheet: null })
      }
    } catch (error) {
      console.error('Candidate registration failed:', error)
      message.error(
        error?.response?.data?.message || 'Submission failed. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: isMobile ? 12 : 24, maxWidth: 980, margin: 'auto' }}>
      <Card styles={{ body: { padding: isMobile ? 16 : 24 } }}>
        {/* Header: back button + centered title (flows instead of overlapping on small screens) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 8,
          }}
        >
          <Button type="primary" onClick={() => navigate(backTo)}>
            <RollbackOutlined />
          </Button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
              V2 Pathshala Registration Form
            </Title>
            <Text type="secondary">V2 Pathshala</Text>
          </div>
          {/* spacer to keep the title visually centered opposite the back button */}
          <div style={{ width: 40, visibility: 'hidden' }} />
        </div>
        <Divider style={{ marginTop: 8 }} />

        <Form form={form} layout="vertical" onFinish={onFinish} scrollToFirstError>
          {/* Link 1 + Link 2 */}
          <Divider orientation="left">Program</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Program Applying For"
                name="ProgramApplyingFor"
                rules={[{ required: true, message: 'Please select a program!' }]}
              >
                <Select placeholder="Select a program">
                  {PROGRAMS.map((p) => (
                    <Option key={p} value={p}>
                      {p}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Mode of Training"
                name="ModeOfTraining"
                rules={[{ required: true, message: 'Please select mode of training!' }]}
              >
                <Select placeholder="Select mode">
                  <Option value="Online">Online</Option>
                  <Option value="Offline/Classroom">Offline/Classroom</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Personal Details */}
          <Divider orientation="left">Personal Details</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Full Name"
                name="FullName"
                rules={[{ required: true, message: 'Please enter full name!' }]}
              >
                <Input placeholder="Full Name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Mobile Number"
                name="MobileNumber"
                rules={[
                  { required: true, message: 'Please enter mobile number!' },
                  { pattern: /^[0-9]{10}$/, message: 'Enter a valid 10-digit number' },
                ]}
              >
                <Input placeholder="Mobile Number" maxLength={10} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="WhatsApp Number"
                name="WhatsAppNumber"
                rules={[{ pattern: /^[0-9]{10}$/, message: 'Enter a valid 10-digit number' }]}
              >
                <Input placeholder="WhatsApp Number" maxLength={10} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email ID"
                name="Email"
                rules={[
                  { required: true, message: 'Please enter email!' },
                  { type: 'email', message: 'Enter a valid email' },
                ]}
              >
                <Input placeholder="Email ID" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Date of Birth"
                name="DateOfBirth"
                rules={[{ required: true, message: 'Please select date of birth!' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD-MM-YYYY"
                  disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Gender"
                name="Gender"
                rules={[{ required: true, message: 'Please select gender!' }]}
              >
                <Select placeholder="Select gender">
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Educational Details */}
          <Divider orientation="left">Educational Details</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Highest Qualification"
                name="HighestQualification"
                rules={[{ required: true, message: 'Please select qualification!' }]}
              >
                <Select placeholder="Select qualification">
                  {QUALIFICATIONS.map((q) => (
                    <Option key={q} value={q}>
                      {q}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Specialization" name="Specialization">
                <Input placeholder="Specialization" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="College/University" name="CollegeUniversity">
                <Input placeholder="College/University" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Passing Year"
                name="PassingYear"
                rules={[{ pattern: /^[0-9]{4}$/, message: 'Enter a valid 4-digit year' }]}
              >
                <Input placeholder="e.g. 2023" maxLength={4} />
              </Form.Item>
            </Col>
          </Row>

          {/* Training Preference */}
          <Divider orientation="left">Training Preference</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Preferred Learning Mode"
                name="PreferredLearningMode"
                rules={[{ required: true, message: 'Please select learning mode!' }]}
              >
                <Select placeholder="Select learning mode">
                  <Option value="Online">Online</Option>
                  <Option value="Classroom">Classroom</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Upload Documents */}
          <Divider orientation="left">Upload Documents</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Passport Size Photograph">
                <Upload {...singleFileProps(setFile('Photo'))} accept="image/*">
                  <Button icon={<UploadOutlined />}>Upload Photo</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Resume (CV)">
                <Upload {...singleFileProps(setFile('Resume'))} accept=".pdf,.doc,.docx">
                  <Button icon={<UploadOutlined />}>Upload Resume</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Aadhaar Card / Government ID">
                <Upload {...singleFileProps(setFile('Aadhaar'))} accept="image/*,.pdf">
                  <Button icon={<UploadOutlined />}>Upload ID</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Latest Marksheet / Certificate">
                <Upload {...singleFileProps(setFile('Marksheet'))} accept="image/*,.pdf">
                  <Button icon={<UploadOutlined />}>Upload Marksheet</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          {/* Declaration */}
          <Divider />
          <Form.Item
            name="AgreedToTerms"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error('You must agree to the Terms & Conditions.')),
              },
            ]}
          >
            <Checkbox>
              I certify that the information provided by me is true and correct. I agree to abide by
              the rules and regulations of <strong>V2 Pathshala</strong>. I understand that
              admission, certification, and employment opportunities are subject to eligibility,
              successful completion of the program, assessment results, and business requirements.
            </Checkbox>
          </Form.Item>

          <Form.Item style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit" block loading={submitting}>
              Apply Now
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default CandidateRegistrationForm
