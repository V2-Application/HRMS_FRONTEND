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

const DECLARATION_TEXT = `V2 PATHSHALA
RETAIL FOUNDATION CERTIFICATION PROGRAM (RFCP)
Declaration, Consent & Undertaking by Applicant

I, the undersigned, hereby voluntarily apply for admission to the V2 Pathshala – Retail Foundation Certification Program (RFCP) conducted by V2 Retail Limited.
By submitting my application, I declare, understand, and agree to the following terms and conditions:

1. Accuracy of Information
I declare that all information, documents, certificates, and details submitted by me during registration are true, complete, and correct to the best of my knowledge.
I understand that if any information or document submitted by me is found to be false, misleading, forged, or suppressed at any stage, V2 Retail Limited reserves the right to reject my application, cancel my admission, discontinue my participation in the training program, or withdraw any employment offer without any notice or liability.

2. Voluntary Participation
I understand that my participation in the Retail Foundation Certification Program is entirely voluntary and based on my own decision.
I confirm that I have carefully read and understood the program details before applying.

3. Nature of the Training Program
I acknowledge that V2 Pathshala is a skill development and retail training initiative intended to enhance my employability and retail knowledge.
The program is designed for educational and training purposes only.

4. No Guarantee of Employment
I clearly understand and agree that:
Registration in the program does not guarantee admission.
Admission into the program does not guarantee certification.
Certification does not guarantee employment.
Participation in training does not create any employer-employee relationship with V2 Retail Limited.
Completion of the program does not create any legal right, vested interest, or claim for appointment.
I understand that any future employment opportunity with V2 Retail Limited shall be subject to: organizational manpower requirements; position availability; performance during training; assessment and interview; background verification; medical fitness (where applicable); management approval; and applicable company policies prevailing at the time of recruitment.
The decision of V2 Retail Limited regarding selection or employment shall be final and binding.

5. Equal Opportunity
I understand that V2 Retail Limited follows an Equal Opportunity Employment Policy.
Selection shall be based solely on merit, capability, performance, organizational requirements, and eligibility criteria without discrimination based on religion, caste, race, gender, marital status, disability, language, place of birth, or any other legally protected characteristic, subject to applicable laws.

6. Code of Conduct
During the training program, I agree to maintain discipline and professional behaviour; respect trainers, fellow participants, employees, and company property; follow all safety, security, and organizational guidelines; maintain confidentiality regarding any information shared during training; and avoid misconduct, harassment, discrimination, violence, abusive language, or any behaviour detrimental to the organization.
Violation of the Code of Conduct may result in immediate removal from the program.

7. Attendance Requirement
I understand that attendance is mandatory. I agree to maintain the minimum attendance prescribed by V2 Retail Limited.
Failure to meet attendance requirements may result in disqualification from assessment, non-issuance of certificate, or removal from the program.

8. Assessment & Evaluation
I understand that certification shall be based upon successful completion of attendance requirements, assignments, practical exercises, assessments, behavioural evaluation, and overall performance.
The evaluation methodology shall be determined solely by V2 Retail Limited.

9. Confidentiality
During the course of training, I may receive access to company information, operational processes, business practices, documents, software, systems, customer information, or proprietary materials.
I undertake not to disclose, reproduce, copy, distribute, publish, or misuse any confidential information obtained during the program. This obligation shall survive completion or discontinuation of the training.

10. Intellectual Property
All study material, presentations, manuals, videos, documents, assessments, trademarks, logos, software, and other content provided during the program shall remain the exclusive property of V2 Retail Limited.
I shall not copy, distribute, upload, record, or commercially use any training material without prior written permission.

11. Photography & Media Consent
I authorize V2 Retail Limited to photograph, audio record, or video record me during training sessions, assessments, events, or certification ceremonies.
I consent to the use of such photographs or recordings for training, educational, promotional, recruitment, website, social media, or corporate communication purposes without any monetary compensation.

12. Data Privacy Consent
I voluntarily provide my personal information for the purpose of registration, verification, communication, training administration, assessment, placement consideration, and compliance with legal and regulatory requirements.
I authorize V2 Retail Limited to collect, store, process, verify, and use my personal information solely for legitimate business purposes in accordance with applicable laws.

13. Background Verification
I authorize V2 Retail Limited to verify my educational qualifications, identity documents, employment history (where applicable), and any other information submitted by me.

14. Medical Fitness
I confirm that I am medically fit to attend the training program. If I have any medical condition that may affect my participation, I shall disclose the same voluntarily.

15. Limitation of Liability
I understand that V2 Retail Limited shall not be responsible for personal belongings, personal expenses, travel expenses (unless specifically approved), or any indirect or consequential losses arising from my participation.
The company shall not be liable for any expectation of employment, salary, stipend, or future benefits unless expressly communicated through a written employment offer.

16. Right to Modify or Cancel
I understand that V2 Retail Limited reserves the right, at its sole discretion, to modify the curriculum, change trainers, revise schedules, alter batch size, postpone or cancel the program, withdraw admission, or suspend or discontinue the program, without creating any obligation or liability.

17. Compliance with Company Policies
I agree to comply with all applicable policies, rules, procedures, safety instructions, and directions issued by V2 Retail Limited from time to time.

18. Governing Law & Jurisdiction
This declaration shall be governed by the laws of India. Any dispute arising out of or relating to this declaration or the training program shall be subject to the exclusive jurisdiction of the competent courts located in Gurugram, Haryana, unless otherwise required by applicable law.

Applicant Declaration
I confirm that: I have carefully read and understood all the terms and conditions; I voluntarily accept and agree to abide by them; I understand that completion of this registration does not create any contractual employment relationship with V2 Retail Limited; I understand that any employment opportunity shall be entirely at the discretion of the Company and subject to its recruitment process and business requirements; and I shall not raise any claim for employment, compensation, damages, or other benefits solely on the basis of my participation in this training program.`

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
      message.error(error?.response?.data?.message || 'Submission failed. Please try again.')
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
          <Title level={5}>Declaration, Consent & Undertaking</Title>
          <div
            style={{
              maxHeight: 260,
              overflowY: 'auto',
              padding: 12,
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              marginBottom: 16,
              whiteSpace: 'pre-line',
              fontSize: 13,
              lineHeight: 1.6,
              background: '#fafafa',
            }}
          >
            {DECLARATION_TEXT}
          </div>
          <Form.Item
            name="AgreedToTerms"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error('You must agree to the Declaration to proceed.')),
              },
            ]}
          >
            <Checkbox>
              I have read, understood, and agree to the Declaration, Privacy Consent, Terms &
              Conditions, and understand that participation in the V2 Pathshala Retail Foundation
              Certification Program does not guarantee admission, certification, or employment with
              V2 Retail Limited. I voluntarily consent to the processing of my personal information
              for training and recruitment-related purposes in accordance with applicable laws.
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
