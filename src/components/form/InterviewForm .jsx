import React, { useEffect, useRef, useState } from 'react'
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Typography,
  Card,
  Space,
  Divider,
  Checkbox,
  message,
  Tooltip,
  DatePicker,
} from 'antd'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { DownloadOutlined, RollbackOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../../redux/uiSlice'
import {
  getApplicantByIdForInterewform,
  GetInterviewFormDataById,
  insertInterviewFormData,
} from '../../services/Services'
import dayjs from 'dayjs'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import drawInterviewFormA4 from './InterviewFormTemplate'

const { Option } = Select
const { Title, Text } = Typography

const InterviewForm = () => {
  const { id } = useParams()
  const location = useLocation()
  const { pathname, state } = location
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [data, setData] = useState(null)
  const formRef = useRef()
  const { Designation = [], Location = [] } = useSelector((state) => state.dropdown.response || {})
  const { loading } = useSelector((state) => state.ui)
  const dispatch = useDispatch()
  const viewInterviewForm = pathname.includes('view_interview_form')
  const [apiLoading, setApiLoading] = useState(false)
  const canvasRef = useRef(null)

  function getFormValues() {
    const result = {};
    if (!form) return result;
    const _name = form.getFieldValue("Name");
    console.log(Designation);
    const _positionAppliedFor = Designation.find(
      (position) =>
        position.designationId === form.getFieldValue('PositionAppliedId'),
    )?.designationName || '';
    const _maritalStatus = form.getFieldValue("MaritalStatus");
    if (_name) {
      result.name = _name
    }
    if (_positionAppliedFor) {
      result.positionAppliedFor = _positionAppliedFor;
    }
    if(_maritalStatus) {
      result.maritalStatus = _maritalStatus;
    }
    return result;
  }

  const fetchApplicantById = async () => {
    setApiLoading(true)
    try {
      const res = await getApplicantByIdForInterewform(id)
      // console.log('fetchApplicantById response:', res)
      const finalRes = res.data || {}
      form.setFieldsValue({
        PositionAppliedId: finalRes.designationId,
        PreferredWorkLocationIds: finalRes.locationId,
        Name: finalRes.fullName,
        FamilyInfo: [{}, {}, {}], // Default empty family details
      })
      setData({ familyDetails: [{}, {}, {}] })
    } catch (error) {
      console.error('Error in fetchApplicantById:', error)
      message.error('Failed to fetch applicant data')
    } finally {
      setApiLoading(false)
    }
  }

  const fetchInterviewFormDataById = async () => {
    setApiLoading(true)
    try {
      const res = await GetInterviewFormDataById(id)
      // console.log('fetchInterviewFormDataById response:', res)
      const finalRes = res.data || {}

      // Map experienceInfo
      const experience = finalRes.experienceInfo?.[0] || {}
      const transformedExperience = {
        TotalIndustryExperienceYears: experience.totalIndustryExperienceYears || '',
        TotalRetailExperienceYears: experience.totalRetailExperienceYears || '',
        NoticePeriodDays: experience.noticePeriodDays || '',
        currentCTC: experience.currentCTC || '',
        expectedCTC: experience.expectedCTC || '',
      }

      // Map FamilyInfo to exactly 3 members
      const transformedFamilyInfo = Array.from({ length: 3 }, (_, i) => ({
        Name: finalRes.familyInfo?.[i]?.name || '',
        Relation: finalRes.familyInfo?.[i]?.relation || '',
        Occupation: finalRes.familyInfo?.[i]?.occupation || '',
        Dependent: finalRes.familyInfo?.[i]?.dependent || 'N',
      }))

      // Map KRAKPIInfo to exactly 5 rows
      const transformedKRAKPI = Array.from({ length: 5 }, (_, i) => ({
        KRA: finalRes.krakpiInfo?.[i]?.kra || '',
        KPI: finalRes.krakpiInfo?.[i]?.kpi || '',
      }))

      // Map ReferenceInfo to exactly 3 references
      const transformedReferences = Array.from({ length: 3 }, (_, i) => ({
        fullName: finalRes.referenceInfo?.[i]?.fullName || '',
        company_Designation: finalRes.referenceInfo?.[i]?.company_Designation || '',
        contact_Details: finalRes.referenceInfo?.[i]?.contact_Details || '',
        bussiness_Details: finalRes.referenceInfo?.[i]?.bussiness_Details || '',
      }))

      form.setFieldsValue({
        PositionAppliedId: finalRes.positionAppliedId || '',
        PreferredWorkLocationIds: +finalRes.preferredWorkLocationIds || '', //+ signify to convert any coming value into integer
        Name: finalRes.name || '',
        MaritalStatus: finalRes.maritalStatus || '',
        PresentAddress: finalRes.presentAddress || '',
        FamilyInfo: transformedFamilyInfo,
        ExperienceInfo: transformedExperience,
        KRAKPIInfo: transformedKRAKPI,
        Ques1: finalRes.ques1 || '',
        Ques2: finalRes.ques2 || '',
        Ques3: finalRes.ques3 || '',
        Strength1: finalRes.strength1 || '',
        Strength2: finalRes.strength2 || '',
        Weakness1: finalRes.weakness1 || '',
        Weakness2: finalRes.weakness2 || '',
        BiggestChallenges: finalRes.biggestChallenges || '',
        ReferenceInfo: transformedReferences,
        DeclarationConfirmed: finalRes.declarationConfirmed || false,
        Place: finalRes.place || '',
        DateOfFilling:
          finalRes.dateOfFilling && dayjs(finalRes.dateOfFilling).isValid()
            ? dayjs(finalRes.dateOfFilling)
            : null,
      })
      setData({ familyDetails: transformedFamilyInfo })
    } catch (error) {
      console.error('Error in fetchInterviewFormDataById:', error)
      message.error('Failed to fetch interview form data')
    } finally {
      setApiLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return

    if (viewInterviewForm) {
      fetchInterviewFormDataById()
    } else {
      fetchApplicantById()
    }
  }, [id, viewInterviewForm, form])

  const onFinish = async (values) => {
    if (viewInterviewForm) return // Prevent submission in view mode

    const val = {
      ...values,
      DateOfFilling: values.DateOfFilling ? dayjs(values.DateOfFilling).format('YYYY-MM-DD') : null,
      ApplicantCode: id,
      PreferredWorkLocationIds: `${values.PreferredWorkLocationIds}`,
      ExperienceInfo: [values.ExperienceInfo],
    }

    // console.log('Form values:', val)
    // return

    try {
      dispatch(set({ loading: true }))
      await insertInterviewFormData(val)
      message.success('Form submitted successfully!')
      if (!viewInterviewForm) {
        form.resetFields()
      }
    } catch (error) {
      console.error('Form submission failed:', error)
      message.error('Form submission failed. Please try again.')
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  const handleDownloadPDF = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // IMPORTANT: Set A4 size in pixels
    canvas.width = 1240;   // A4 width at 150 DPI
    canvas.height = 1754;  // A4 height at 150 DPI

    const ctx = canvas.getContext("2d");

    const interviewFormData = getFormValues();

    drawInterviewFormA4(ctx, canvas.width, canvas.height, interviewFormData);

    const imageData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

    const pageW = pdf.internal.pageSize.getWidth();   // 210
    const pageH = pdf.internal.pageSize.getHeight();  // 297

    // Fit image to page while preserving aspect ratio
    // If your canvas is exactly A4 ratio, this will fill perfectly.
    const props = pdf.getImageProperties(imageData);
    const imgW = props.width;
    const imgH = props.height;

    const scale = Math.min(pageW / imgW, pageH / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;

    const x = (pageW - drawW) / 2;
    const y = (pageH - drawH) / 2;

    // If you want full-bleed (no margins) and your image is A4 ratio:
    // pdf.addImage(imageData, "PNG", 0, 0, pageW, pageH, undefined, "FAST");

    pdf.addImage(imageData, "PNG", x, y, drawW, drawH, undefined, "FAST");
    pdf.save('Interview_Form.pdf');
    return;
    document.body.style.zoom = '100%'
    try {
      dispatch(set({ loading: true }))

      const root = formRef.current
      if (!root) throw new Error('formRef is null')

      const page1 = root.querySelector('.page1')
      const page2 = root.querySelector('.page2')

      if (!page1 || !page2) {
        throw new Error('Could not find .page1 or .page2 inside formRef')
      }

      // hide stuff like submit button
      const hiddenElements = root.querySelectorAll('.pdf-hidden')
      hiddenElements.forEach((el) => (el.style.display = 'none'))

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const captureAndAdd = async (el, addNewPage = false) => {
        const canvas = await html2canvas(el, {
          scale: 2 / window.devicePixelRatio,
          useCORS: true,
          backgroundColor: '#ffffff',
          scrollX: 0,
          scrollY: 0,
        })

        const imgData = canvas.toDataURL('image/png')

        // Fit each captured div into ONE A4 page (no cutting)
        const imgWidth = pdfWidth
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        // If content is taller than a page, scale down to fit (so it won't overflow/cut)
        const scale = imgHeight > pdfHeight ? pdfHeight / imgHeight : 1
        const drawW = imgWidth * scale
        const drawH = imgHeight * scale

        // Center horizontally; top aligned
        const x = (pdfWidth - drawW) / 2
        const y = 0

        if (addNewPage) pdf.addPage()
        pdf.addImage(imgData, 'PNG', x, y, drawW, drawH)
      }

      await captureAndAdd(page1, false)
      await captureAndAdd(page2, true)

      hiddenElements.forEach((el) => (el.style.display = ''))
      pdf.save('Interview_Form.pdf')
    } catch (error) {
      console.error('PDF generation failed:', error)
      message.error(error?.message || 'Failed to generate PDF')
    } finally {
      document.body.style.zoom = '80%'
      dispatch(set({ loading: false }))
    }
  }

  return (
    <div style={{ padding: '24px', margin: 'auto' }}>
      <Card loading={apiLoading}>
        <Button
          type="primary"
          style={{ position: 'absolute', top: '10px', left: '10px' }}
          size="middle"
          onClick={() =>
            navigate(
              state?.from
                ? state?.from
                : pathname?.includes('/view_interview_form')
                  ? '/applicant/list'
                  : '/login',
            )
          }
        >
          <RollbackOutlined />
        </Button>
        <Space style={{ position: 'absolute', right: 10, display: 'flex', justifyContent: 'end' }}>
          <Tooltip title="Download Pdf">
            <Button onClick={handleDownloadPDF} disabled={loading}>
              <DownloadOutlined />
            </Button>
          </Tooltip>
        </Space>
        <div ref={formRef} style={{ padding: 16 }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            scrollToFirstError
          // Removed disabled from Form
          >
            <Title level={3} style={{ textAlign: 'center' }}>
              Interview Form
            </Title>
            {/* Basic Info */}
            <Row gutter={16}>
              <Col xs={24} md={12}>
                {/* <Form.Item
                    label="Position Applied For"
                    name="PositionAppliedId"
                    rules={[{ required: !viewInterviewForm, message: 'Please select a position!' }]}
                  >
                    <Select
                      placeholder="Select a position"
                      readOnly={viewInterviewForm}
                      // Prevent selection in read-only mode
                      onChange={viewInterviewForm ? () => {} : undefined}
                    >
                      <Option value={0}>Please select a Position</Option>
                      {Designation.map((position, index) => (
                        <Option key={index} value={position.designationId}>
                          {position.designationName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item> */}
                <Form.Item label="Position Applied For">
                  {viewInterviewForm ? (
                    <Input
                      readOnly
                      value={
                        Designation.find(
                          (position) =>
                            position.designationId === form.getFieldValue('PositionAppliedId'),
                        )?.designationName || ''
                      }
                    />
                  ) : (
                    <Form.Item
                      name="PositionAppliedId"
                      noStyle
                      rules={[{ required: true, message: 'Please select a position!' }]}
                    >
                      <Select placeholder="Select a position">
                        <Option value={0}>Please select a Position</Option>
                        {Designation.map((position, index) => (
                          <Option key={index} value={position.designationId}>
                            {position.designationName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                {/* <Form.Item
                    label="Preferred Work Location"
                    name="PreferredWorkLocationIds"
                    rules={[{ required: !viewInterviewForm, message: 'Please select a location!' }]}
                  >
                    <Select
                      placeholder="Select locations"
                      readOnly={viewInterviewForm}
                      onChange={viewInterviewForm ? () => {} : undefined}
                    >
                      <Option value={0}>Please select a location</Option>
                      {Location.map((location, idx) => (
                        <Option key={idx} value={location.locationId}>
                          {location.locationName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item> */}
                <Form.Item label="Preferred Work Location">
                  {viewInterviewForm ? (
                    <Input
                      readOnly
                      value={
                        Array.isArray(form.getFieldValue('PreferredWorkLocationIds'))
                          ? form
                            .getFieldValue('PreferredWorkLocationIds')
                            .map(
                              (id) =>
                                Location.find((loc) => loc.locationId === id)?.locationName ||
                                `(${id})`,
                            )
                            .join(', ')
                          : (() => {
                            const id = form.getFieldValue('PreferredWorkLocationIds')
                            return (
                              Location.find((loc) => loc.locationId === id)?.locationName ||
                              `(${id})`
                            )
                          })()
                      }
                    />
                  ) : (
                    <Form.Item
                      name="PreferredWorkLocationIds"
                      noStyle
                      rules={[{ required: true, message: 'Please select a location!' }]}
                    >
                      <Select placeholder="Select locations">
                        {Location.map((location) => (
                          <Option key={location.locationId} value={location.locationId}>
                            {location.locationName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Name"
                  name="Name"
                  rules={[{ required: !viewInterviewForm, message: 'Please enter name!' }]}
                >
                  <Input placeholder="Your Name" readOnly={viewInterviewForm} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                {/* <Form.Item
                    label="Marital Status"
                    name="MaritalStatus"
                    rules={[
                      { required: !viewInterviewForm, message: 'Please select marital status!' },
                    ]}
                  >
                    <Select
                      placeholder="Select marital status"
                      readOnly={viewInterviewForm}
                      onChange={viewInterviewForm ? () => {} : undefined}
                    >
                      <Option value="Married">Married</Option>
                      <Option value="Single">Single</Option>
                    </Select>
                  </Form.Item> */}
                <Form.Item
                  label="Marital Status"
                  name="MaritalStatus"
                  rules={[
                    { required: !viewInterviewForm, message: 'Please select marital status!' },
                  ]}
                >
                  {viewInterviewForm ? (
                    <Input
                      readOnly
                      value={
                        form.getFieldValue('MaritalStatus') === 'Married'
                          ? 'Married'
                          : form.getFieldValue('MaritalStatus') === 'Single'
                            ? 'Single'
                            : ''
                      }
                    />
                  ) : (
                    <Select placeholder="Select marital status">
                      <Option value="Married">Married</Option>
                      <Option value="Single">Single</Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="Present Address"
              name="PresentAddress"
              rules={[{ required: !viewInterviewForm, message: 'Please enter address!' }]}
            >
              <Input.TextArea rows={3} readOnly={viewInterviewForm} />
            </Form.Item>

            {/* Family Details */}
            <div style={{ visibility: 'hidden', height: 0 }}>
              <Divider orientation="left">Family Details</Divider>
              <Space direction="vertical" style={{ width: '100%' }}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Row gutter={16} key={index}>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        label={index === 0 ? 'Name' : ''}
                        name={['FamilyInfo', index, 'Name']}
                        rules={[{ required: !viewInterviewForm, message: 'Please enter name!' }]}
                        initialValue={'none'}
                      >
                        <Input placeholder="Name" readOnly={viewInterviewForm} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        label={index === 0 ? 'Relationship' : ''}
                        name={['FamilyInfo', index, 'Relation']}
                        rules={[
                          { required: !viewInterviewForm, message: 'Please enter relation!' },
                        ]}
                        initialValue={'none'}
                      >
                        <Input placeholder="Relationship" readOnly={viewInterviewForm} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        label={index === 0 ? 'Occupation' : ''}
                        name={['FamilyInfo', index, 'Occupation']}
                        rules={[
                          { required: !viewInterviewForm, message: 'Please enter occupation!' },
                        ]}
                        initialValue={'none'}
                      >
                        <Input placeholder="Occupation" readOnly={viewInterviewForm} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        initialValue="N"
                        label={index === 0 ? 'Dependent' : ''}
                        name={['FamilyInfo', index, 'Dependent']}
                        rules={[
                          { required: !viewInterviewForm, message: 'Please select dependent!' },
                        ]}
                      >
                        <Select
                          placeholder="Dependent"
                          readOnly={viewInterviewForm}
                          onChange={viewInterviewForm ? () => { } : undefined}
                        >
                          <Option value="Y">Yes</Option>
                          <Option value="N">No</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                ))}
              </Space>
            </div>

            {/* Work Experience */}
            <Divider orientation="left">Work Experience</Divider>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Total Industry Experience (in yrs)"
                  name={['ExperienceInfo', 'TotalIndustryExperienceYears']}
                  rules={[{ required: !viewInterviewForm, message: 'Please enter experience!' }]}
                >
                  <Input type="number" placeholder="Years" readOnly={viewInterviewForm} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Total Experience (in yrs)"
                  name={['ExperienceInfo', 'TotalRetailExperienceYears']}
                  rules={[{ required: !viewInterviewForm, message: 'Please enter experience!' }]}
                >
                  <Input type="number" placeholder="Years" readOnly={viewInterviewForm} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  label="Notice Period (in days)"
                  name={['ExperienceInfo', 'NoticePeriodDays']}
                  rules={[{ required: !viewInterviewForm, message: 'Please enter notice period!' }]}
                >
                  <Input type="number" placeholder="Days" readOnly={viewInterviewForm} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Current CTC"
                  name={['ExperienceInfo', 'currentCTC']}
                  rules={[{ required: !viewInterviewForm, message: 'Please enter current CTC!' }]}
                >
                  <Input type="number" placeholder="Current CTC" readOnly={viewInterviewForm} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Expected CTC"
                  name={['ExperienceInfo', 'expectedCTC']}
                  rules={[{ required: !viewInterviewForm, message: 'Please enter expected CTC!' }]}
                >
                  <Input type="number" placeholder="Expected CTC" readOnly={viewInterviewForm} />
                </Form.Item>
              </Col>
            </Row>

            {/* KRAs */}
            <div style={{ visibility: 'hidden', height: 0 }}>
              <Divider orientation="left">Please specify your five KRA/KPIs</Divider>
              {Array.from({ length: 5 }).map((_, index) => (
                <Row gutter={16} key={index}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name={['KRAKPIInfo', index, 'KRA']}
                      rules={[{ required: !viewInterviewForm, message: 'Please input KRA!' }]}
                      initialValue={'none'}
                    >
                      <Input placeholder={`KRA ${index + 1}`} readOnly={viewInterviewForm} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name={['KRAKPIInfo', index, 'KPI']}
                      rules={[{ required: !viewInterviewForm, message: 'Please input KPI!' }]}
                      initialValue={'none'}
                    >
                      <Input placeholder={`KPI ${index + 1}`} readOnly={viewInterviewForm} />
                    </Form.Item>
                  </Col>
                </Row>
              ))}
            </div>

            {/* TextAreas */}
            <Form.Item
              label="Q.1. Highlights of your department’s SOP?"
              name="Ques1"
              rules={[{ required: !viewInterviewForm, message: 'Please enter SOP highlights!' }]}
            >
              <Input.TextArea rows={4} readOnly={viewInterviewForm} />
            </Form.Item>
            <Form.Item
              label="Q.2. Reports prepared in your organization (column headers):"
              name="Ques2"
              rules={[{ required: !viewInterviewForm, message: 'Please enter reports!' }]}
            >
              <Input.TextArea rows={3} readOnly={viewInterviewForm} />
            </Form.Item>
            <Form.Item
              label="Q.3. Review process in your current organization:"
              name="Ques3"
              rules={[{ required: !viewInterviewForm, message: 'Please enter review process!' }]}
            >
              <Input.TextArea rows={3} readOnly={viewInterviewForm} />
            </Form.Item>

            {/* Strengths and Weaknesses */}
            <Divider orientation="left">Strengths & Weaknesses</Divider>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Strength 1"
                  name="Strength1"
                  rules={[{ required: !viewInterviewForm, message: 'Please enter strength!' }]}
                >
                  <Input placeholder="Strength 1" readOnly={viewInterviewForm} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Strength 2"
                  name="Strength2"
                  rules={[{ required: !viewInterviewForm, message: 'Please enter strength!' }]}
                >
                  <Input placeholder="Strength 2" readOnly={viewInterviewForm} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Weakness 1"
                  name="Weakness1"
                  rules={[{ required: !viewInterviewForm, message: 'Please enter weakness!' }]}
                >
                  <Input placeholder="Weakness 1" readOnly={viewInterviewForm} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Weakness 2"
                  name="Weakness2"
                  rules={[{ required: !viewInterviewForm, message: 'Please enter weakness!' }]}
                >
                  <Input placeholder="Weakness 2" readOnly={viewInterviewForm} />
                </Form.Item>
              </Col>
            </Row>

            {/* Challenges */}
            <Form.Item
              label="Biggest challenges you've managed:"
              name="BiggestChallenges"
              rules={[{ required: !viewInterviewForm, message: 'Please enter challenges!' }]}
            >
              <Input.TextArea rows={3} readOnly={viewInterviewForm} />
            </Form.Item>



            {/* References */}
            <Divider orientation="left">References (Exclude relatives)</Divider>
            {['O', 'R', 'O'].map((label, index) => (
              <Row gutter={16} key={index}>
                <Col xs={24} md={6}>
                  <Form.Item
                    label={index === 0 ? 'FullName' : ''}
                    name={['ReferenceInfo', index, 'fullName']}
                    rules={[{ required: !viewInterviewForm, message: 'Please enter name!' }]}
                  >
                    <Input placeholder={`Full Name (${label})`} readOnly={viewInterviewForm} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    label={index === 0 ? 'Company & Designation' : ''}
                    name={['ReferenceInfo', index, 'company_Designation']}
                    rules={[
                      {
                        required: !viewInterviewForm,
                        message: 'Please enter company/designation!',
                      },
                    ]}
                  >
                    <Input placeholder="Company & Designation" readOnly={viewInterviewForm} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    label={index === 0 ? 'Contact Details' : ''}
                    name={['ReferenceInfo', index, 'contact_Details']}
                    rules={[
                      { required: !viewInterviewForm, message: 'Please enter contact details!' },
                    ]}
                  >
                    <Input placeholder="Contact Details" readOnly={viewInterviewForm} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    label={index === 0 ? 'Business or Occupation' : ''}
                    name={['ReferenceInfo', index, 'bussiness_Details']}
                    rules={[
                      { required: !viewInterviewForm, message: 'Please enter business details!' },
                    ]}
                  >
                    <Input placeholder="Business or Occupation" readOnly={viewInterviewForm} />
                  </Form.Item>
                </Col>
              </Row>
            ))}

            {/* Certification */}
            <Divider />
            <Form.Item
              name="DeclarationConfirmed"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    viewInterviewForm || value
                      ? Promise.resolve()
                      : Promise.reject(new Error('You must certify the information is true.')),
                },
              ]}
            >
              <Checkbox
                checked={viewInterviewForm ? form.getFieldValue('DeclarationConfirmed') : undefined}
              >
                I certify that the statements made by me are true and correct. I understand that any
                misrepresentation or omission renders me liable to termination by{' '}
                <strong>V2 RETAIL LTD</strong>.
              </Checkbox>
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Place"
                  name="Place"
                  rules={[{ required: !viewInterviewForm, message: 'Please enter place!' }]}
                >
                  <Input placeholder="Enter Place" readOnly={viewInterviewForm} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Date"
                  name="DateOfFilling"
                  rules={[{ required: !viewInterviewForm, message: 'Please select date!' }]}
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD-MM-YYYY"
                    readOnly={viewInterviewForm}
                  // Uncomment if future dates should be disabled
                  // disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Text>Signature: __________________________</Text>

            {!viewInterviewForm && (
              <Form.Item style={{ marginTop: 24 }} className="pdf-hidden">
                <Button type="primary" htmlType="submit" block loading={loading}>
                  Submit
                </Button>
              </Form.Item>
            )}
          </Form>
          <canvas ref={canvasRef} style={{ visibility: "hidden" }}></canvas>
        </div>
      </Card>
    </div>
  )
}

export default InterviewForm
