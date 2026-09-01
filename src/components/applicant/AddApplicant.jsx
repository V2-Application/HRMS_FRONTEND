import { useEffect, useState, useMemo } from 'react'
import {
  Col,
  Row,
  Form,
  Card,
  Input,
  Select,
  Upload,
  Button,
  Checkbox,
  DatePicker,
  message,
  Grid,
  InputNumber,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import './addapplicant.css'
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../../redux/uiSlice'
import {
  createUpdateCandidate,
  fetchMinWages,
  getApplicantById,
  getStateFromCountryValue,
} from '../../services/Services'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { useWatch } from 'antd/es/form/Form'

const { TextArea } = Input
const { Option } = Select
const { useBreakpoint } = Grid

const LUCKNOW_DESIGNATION_IDS = [11, 27, 58, 89, 91, 1010, 1297, 1406]

function AddApplicant() {
  const location = useLocation()
  const navigate = useNavigate()
  const { designationId, departmentId } = useParams()
  const params = useParams()
  const designationLocked = !!designationId
  const { pathname } = location
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const [form] = Form.useForm()
  const [imageValue, setImageValue] = useState([])
  const dispatch = useDispatch()
  const { Designation, Department } = useSelector((state) => state.dropdown.response || {})
  const param = useParams()
  const [totalExp, setTotalExp] = useState(null)
  const [states, setStates] = useState([])

  const [selectedDesignation, setSelectedDesignation] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState(null)

  console.log('designationId', designationId, 'departmentId', departmentId)

  // watchers
  const source_applicant = useWatch(['source'], form)
  const totalExperience = useWatch(['totalExperience'], form) ?? 0

  // 🔹 Mode inside designation: "filtered" | "all"
  const [designationMode, setDesignationMode] = useState('all') // default: filtered

  const beforeUpload = () => false

  useEffect(() => {
    // if user opened this tab with /appform/:designationId, lock requirement for this tab
    if (designationId) sessionStorage.setItem('appform_requires_designation', '1')
  }, [designationId])

  const requiresDesignation = sessionStorage.getItem('appform_requires_designation') === '1'

  useEffect(() => {
    if (selectedDesignation) {
      form.setFieldsValue({ position: Number(selectedDesignation) })
    }
    if (selectedDepartment) {
      form.setFieldValue('department', Number(selectedDepartment))
    }
  }, [selectedDesignation, selectedDepartment, form])

  // All designations from redux
  const allDesignations = useMemo(
    () => (Array.isArray(Designation) ? Designation : []),
    [Designation],
  )

  // Filtered designations – based on fixed ID list
  const filteredDesignations = useMemo(() => {
    if (!Array.isArray(Designation)) return []
    return Designation.filter((d) => LUCKNOW_DESIGNATION_IDS.includes(Number(d.designationId)))
  }, [Designation])

  // Which list to show in the actual designation dropdown
  const designationOptions = designationMode === 'all' ? allDesignations : filteredDesignations

  const fetchStates = async () => {
    try {
      const response = await fetchMinWages()
      console.log('states:', response)

      if (response.status === 200) {
        setStates(response.data?.data || [])
      }
    } catch (error) {
      console.error('minwages error:', error)
      const msg = error?.response?.data?.message
      if (msg) message.error(msg)
    }
  }

  useEffect(() => {
    if (selectedDesignation && selectedDepartment) {
      navigate(`/appform/${selectedDesignation}/${selectedDepartment}`)
    }
  }, [selectedDepartment, selectedDesignation])

  useEffect(() => {
    fetchStates()
    if (designationId) {
      setSelectedDesignation(designationId)
    }
    if (departmentId) {
      setSelectedDepartment(departmentId)
    }
  }, [])

  const onFinish = async (values) => {
    // if (requiresDesignation && !designationId) {
    //   message.error('Invalid access. Please open the form with Designation link.')
    //   return
    // }

    if (
      values?.resume?.some(
        (f) =>
          ![
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/pdf',
          ].includes(f.type),
      )
    ) {
      return message.error('Please upload valid document formats for CV/Resume')
    }

    const newFormData = new FormData()

    // position = designationId
    newFormData.append('designation', values?.position)
    newFormData.append('CurrentLocation', values?.currentLocation)
    newFormData.append('fullName', values?.fullName)
    newFormData.append('dob', values?.dob?.format('YYYY-MM-DD'))
    newFormData.append('mobile', values?.phone)
    newFormData.append('emailAddress', values?.email)
    // Current employment. These go to the Candidate columns the applicant grid reads
    // (company1 / positionHeldInPreviousCompany / lastCtcAnnual) AND, below, to
    // experienceList so they persist to tblExperience for the Excel export.
    newFormData.append('company1', values?.previousCompany ?? '')
    newFormData.append('positionHeldInPreviousCompany', values?.previousDesignation ?? '')
    newFormData.append('lastCtcAnnual', values?.previousSalary ?? '')
    newFormData.append('TotalExperience', values?.totalExperience)
    // Expected salary is a separate field — it must not overwrite the current salary.
    newFormData.append('SalaryExpectation', values?.salaryExpectation ?? '')

    // Same current-employment values as an experience row, which the API persists to
    // tblExperience — the source the applicant Excel export reads for Current Company /
    // Current Designation / Current Salary. Must be sent as ExperienceListJson: the
    // controller deserializes that into details.experienceList, overwriting anything
    // bound from indexed form fields. Only sent when the applicant actually has
    // experience, so freshers don't get an empty row.
    if (values?.totalExperience > 0 && values?.previousCompany) {
      newFormData.append(
        'ExperienceListJson',
        JSON.stringify([
          {
            nameOfCompany: values.previousCompany,
            positionHeld: values?.previousDesignation ?? '',
            lastCtc: Number(values?.previousSalary) || 0,
            workLocation: null,
            from: null,
            to: null,
          },
        ]),
      )
    }
    newFormData.append('AdditionalInfoApplicant', values?.additionalInfo)
    newFormData.append('Aggreement', values?.agreement)
    newFormData.append('IsApplicant', true)
    newFormData.append('PreferredLocation', values?.preferredLocation)
    newFormData.append('NoticePeriod', values.NoticePeriod ?? 0)
    newFormData.append('department', values.department ?? 0)

    newFormData.append('StateId', values?.preferredState)
    if (values.source === 'person') newFormData.append('ReferenceEmployee', values?.reference)
    newFormData.append('Source', values?.source)

    const qualificationData = (values.qualifications || [])
      .filter((q) => q && q.education && q.yop)
      .map((q) => ({
        education: q.education,
        yop: dayjs(q.yop).format('YYYY'),
      }))

    if (!qualificationData.length) {
      message.error('Please add at least one qualification')
      return
    }

    newFormData.append('QualificationListJson', JSON.stringify(qualificationData))

    if (imageValue.length > 0) {
      newFormData.append('PassportPhoto', imageValue[0].originFileObj)
      newFormData.append('isPassportPhotoUploaded', true)
    }

    if (values.resume?.[0]?.originFileObj) {
      newFormData.append('ResumeAttachment', values.resume[0].originFileObj)
      newFormData.append('isResumeAttachmentUploaded', true)
    }

    try {
      await dispatch(set({ loading: true }))
      await createUpdateCandidate({ ef: newFormData })
      message.success('Applicant created successfully!')
      form.resetFields()
      setImageValue([])
    } catch (error) {
      console.error('Error in Applicant Create', error)
      message.error('Error in Applicant Create. Please try again.')
    } finally {
      await dispatch(set({ loading: false }))
    }
  }

  const onFinishFailed = () => message.error('Please fill all required fields.')

  const getDataByApplicantId = async (id) => {
    try {
      const response = await getApplicantById(id)

      form.setFieldsValue(response)

      if (response.QualificationListJson) {
        try {
          const parsed = JSON.parse(response.QualificationListJson)
          if (Array.isArray(parsed)) {
            form.setFieldsValue({
              qualifications: parsed.map((q) => ({
                education: q.education,
                yop: q.yop ? dayjs(String(q.yop), 'YYYY') : null,
              })),
            })
          }
        } catch (e) {
          console.error('Error parsing QualificationListJson', e)
        }
      }
    } catch (error) {
      console.error('Failed to fetch applicant data:', error)
    }
  }

  useEffect(() => {
    if (param.id) getDataByApplicantId(param.id)
  }, [param.id])

  const handleTotalExpChange = (value) => {
    setTotalExp(value)
    if (value === 0) form.setFieldsValue({ previousSalary: 0 })
    else form.setFieldsValue({ previousSalary: undefined })
  }

  // when user changes mode All/Filtered, clear previous designation selection
  const handleDesignationModeChange = (mode) => {
    setDesignationMode(mode)
    form.setFieldsValue({ position: undefined })
  }

  return (
    <div
      style={{
        margin: 0,
        padding:
          pathname === '/appform' || pathname === `/appform/${designationId}` ? '1.8rem 0.8rem' : 0,
        width: '100%',
      }}
    >
      {/* 🔹 Page Heading */}
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Applicant Form</h2>

      <Card
        bodyStyle={{ padding: 0 }}
        style={{
          margin: 0,
          borderRadius: 0,
          border: 'none',
          boxShadow: 'none',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        <Form
          form={form}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
          size={isMobile ? 'middle' : 'large'}
          style={{
            padding: 0,
            width: '100%',
          }}
        >
          <Row gutter={[12, 12]} style={{ margin: 0, width: '100%' }}>
            {/* 🔹 Current Job Location as INPUT */}
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="Current Job Location" name="currentLocation">
                <Input placeholder="Enter your current job location" size="middle" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Preferred State"
                name="preferredState"
                rules={[{ required: true, message: 'Preferred State is required' }]}
              >
                {/* <Input placeholder="Enter your state" size="middle" /> */}
                <Select
                  placeholder="Select a state"
                  size="middle"
                  showSearch
                  optionFilterProp="children"
                  allowClear
                >
                  {states.map((st) => (
                    <Select.Option value={st?.id}>{st?.stateName}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Preferred Job Location"
                name="preferredLocation"
                rules={[{ required: true, message: 'Preferred Location is required' }]}
              >
                <Input placeholder="Enter preferred location" size="middle" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={6}>
              <Form.Item label="Department" name="department" required>
                <Select
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children?.toLowerCase().includes(input.toLowerCase())
                  }
                  size="medium"
                  placeholder="Select Department"
                  allowClear={!!selectedDepartment}
                  disabled={!!selectedDepartment && !!selectedDesignation}
                  onChange={(val) => {
                    // if (!designationLocked && val) navigate(`/appform/${val}`)
                    setSelectedDepartment(val)
                  }}
                >
                  {Department &&
                    Array.isArray(Department) &&
                    Department.map((item) => {
                      return (
                        <Option key={item?.departmentId} value={item?.departmentId}>
                          {item?.departmentName}
                        </Option>
                      )
                    })}
                </Select>
              </Form.Item>
            </Col>

            {/* 🔹 Combined Designation block: mode + designation dropdown */}
            <Col xs={24} sm={24} md={6}>
              <Form.Item label="Designation" required style={{ marginBottom: 0 }}>
                <Input.Group compact>
                  {/* Left: All / Filtered selector */}
                  <Select
                    value={designationMode}
                    onChange={handleDesignationModeChange}
                    style={{ width: '30%' }}
                    size="middle"
                  >
                    <Option value="all">All</Option>
                    <Option value="filtered">Filtered</Option>
                  </Select>

                  {/* Right: actual designation dropdown, depends on mode */}
                  <Form.Item
                    name="position"
                    noStyle
                    rules={[{ required: true, message: 'Please select job position' }]}
                  >
                    <Select
                      size="middle"
                      style={{ width: '70%' }}
                      placeholder="Select Designation"
                      showSearch
                      optionFilterProp="children"
                      allowClear={!!selectedDesignation}
                      disabled={!!selectedDepartment && !!selectedDesignation}
                      onChange={(val) => {
                        // if (!designationLocked && val) navigate(`/appform/${val}`)
                        setSelectedDesignation(val)
                      }}
                    >
                      {designationOptions.map((val) => (
                        <Option key={val.designationId} value={val.designationId}>
                          {val.designationName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Input.Group>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Full Name"
                name="fullName"
                rules={[
                  { required: true, message: 'Please enter your name' },
                  { pattern: /^[A-Za-z\s]+$/, message: 'Name can only contain letters and spaces' },
                ]}
              >
                <Input placeholder="Enter your full name" size="middle" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[{ required: true, message: 'Please enter your phone' }]}
              >
                <Input
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) e.preventDefault()
                  }}
                  size="middle"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="DOB"
                name="dob"
                rules={[
                  { required: true, message: 'Please enter your DOB' },
                  {
                    validator: (_, value) => {
                      const birthDate = dayjs(value)
                      if (!birthDate.isValid()) return Promise.reject('Invalid date format')
                      return dayjs().diff(birthDate, 'year') >= 18
                        ? Promise.resolve()
                        : Promise.reject('You must be at least 18 years old')
                    },
                  },
                ]}
              >
                <DatePicker size="middle" format="DD-MM-YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', required: true, message: 'Enter a valid email' }]}
              >
                <Input placeholder="name@example.com" size="middle" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Total Experience (Years)"
                name="totalExperience"
                rules={[{ required: true, message: 'Please select total experience' }]}
              >
                <Select onChange={handleTotalExpChange} placeholder="0–30" allowClear size="middle">
                  {Array.from({ length: 31 }, (_, i) => (
                    <Option key={i} value={i}>
                      {i}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* 🔹 Previous Company – now allows any characters */}
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Current Company"
                name="previousCompany"
                rules={[
                  {
                    required: totalExperience > 0 ? true : false,
                    message: 'Please enter your current company',
                  },
                ]}
              >
                <Input
                  placeholder="e.g., Acme Corp / XYZ Pvt Ltd #123"
                  size="middle"
                  disabled={totalExperience === 0}
                />
              </Form.Item>
            </Col>

            {/* 🔹 Previous Designation – now allows any characters */}
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Current Designation"
                name="previousDesignation"
                rules={[
                  {
                    required: totalExperience > 0 ? true : false,
                    message: 'Please enter your current designation',
                  },
                ]}
              >
                <Input
                  placeholder="e.g., Store Manager - L1 @ North"
                  size="middle"
                  disabled={totalExperience === 0}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Current Salary"
                name="previousSalary"
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const exp = getFieldValue('totalExperience')
                      if (exp === 0) return Promise.resolve()
                      if (totalExperience > 0 && (value === '' || value === undefined)) {
                        return Promise.reject(new Error('Please enter current salary'))
                      }
                      const numericValue = Number(value)
                      if (
                        totalExperience &&
                        (isNaN(numericValue) || !Number.isInteger(numericValue) || numericValue < 0)
                      ) {
                        return Promise.reject(new Error('Please enter a valid integer salary'))
                      }
                      return Promise.resolve()
                    },
                  }),
                  { required: totalExperience > 0 ? true : false },
                ]}
              >
                <Input
                  disabled={totalExperience === 0}
                  placeholder="Integer amount"
                  inputMode="numeric"
                  size="middle"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Salary Expectation"
                name="salaryExpectation"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === null || value === '') {
                        return Promise.reject(new Error('Please enter your expected salary'))
                      }
                      if (!/^\d+$/.test(value)) {
                        return Promise.reject(new Error('Please enter a valid integer amount'))
                      }
                      return Promise.resolve()
                    },
                  },
                  { required: true, message: 'Salary expectation is required' },
                ]}
              >
                <Input placeholder="Integer amount" inputMode="numeric" size="middle" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="Source"
                name="source"
                rules={[{ required: true, message: 'Please select a source!' }]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  allowClear
                  placeholder="Select source"
                  size="middle"
                >
                  <Select.Option value="person">By Person</Select.Option>
                  <Select.Option value="newspaper Ad">Newspaper Ad</Select.Option>
                  <Select.Option value="Job Portal">Job Portal</Select.Option>
                  <Select.Option value="Social Media">Social Media</Select.Option>
                  <Select.Option value="Walk In">Walk In</Select.Option>
                  <Select.Option value="Facebook">Facebook</Select.Option>
                  <Select.Option value="LinkedIn">LinkedIn</Select.Option>
                  <Select.Option value="Instagram">Instagram</Select.Option>
                  <Select.Option value="Twitter / X">Twitter / X</Select.Option>
                  <Select.Option value="Snapchat">Snapchat</Select.Option>
                  <Select.Option value="TikTok">TikTok</Select.Option>
                  <Select.Option value="Pinterest">Pinterest</Select.Option>
                  <Select.Option value="Reddit">Reddit</Select.Option>
                  <Select.Option value="Discord">Discord</Select.Option>
                  <Select.Option value="Tumblr">Tumblr</Select.Option>
                  <Select.Option value="Quora">Quora</Select.Option>
                  <Select.Option value="VK">VK (VKontakte)</Select.Option>
                  <Select.Option value="WeChat">WeChat</Select.Option>
                  <Select.Option value="Line">Line</Select.Option>
                  <Select.Option value="Google">Google</Select.Option>
                  <Select.Option value="Bing">Bing</Select.Option>
                  <Select.Option value="Yahoo">Yahoo</Select.Option>
                  <Select.Option value="Baidu">Baidu</Select.Option>
                  <Select.Option value="DuckDuckGo">DuckDuckGo</Select.Option>
                  <Select.Option value="Yandex">Yandex</Select.Option>
                  <Select.Option value="Naver">Naver</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6}>
              {/* <Form.Item
                label="Date of Joining"
                name="dateOfJoining"
                rules={[{ required: true, message: 'Date of Joining is required' }]}
              >
                <DatePicker
                  size="middle"
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item> */}
              <Form.Item
                label="Notice Period (In Days)"
                name="NoticePeriod"
                rules={[{ required: true, message: 'Notice Period is required' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={365}
                  placeholder="Enter notice period in days"
                />
              </Form.Item>
            </Col>

            {source_applicant === 'person' && (
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label="Reference"
                  name="reference"
                  rules={[
                    { required: true, message: 'Please enter your reference' },
                    {
                      pattern: /^[A-Za-z\s]+$/,
                      message: 'Reference can only contain letters and spaces',
                    },
                  ]}
                >
                  <Input placeholder="Referrer name" size="middle" />
                </Form.Item>
              </Col>
            )}

            {/* Qualification list */}
            <Col xs={24}>
              <Form.List
                name="qualifications"
                initialValue={[{ education: undefined, yop: null }]}
                rules={[
                  {
                    validator: async (_, qualifications) => {
                      if (!qualifications || !qualifications.length) {
                        return Promise.reject(
                          new Error('Please add at least one qualification row'),
                        )
                      }
                      const hasEmpty = qualifications.some((q) => !q || !q.education || !q.yop)
                      if (hasEmpty) {
                        return Promise.reject(
                          new Error(
                            'Please fill Higher Qualification and Passing Year in all rows',
                          ),
                        )
                      }
                      return Promise.resolve()
                    },
                  },
                ]}
              >
                {(fields) => (
                  <div className="qualification-table-wrapper">
                    <div className="qualification-table-header" style={{ marginBottom: 8 }}>
                      <Row gutter={8}>
                        <Col span={12}>
                          <strong>
                            Higher Qualification<span style={{ color: 'red' }}>*</span>
                          </strong>
                        </Col>
                        <Col span={12}>
                          <strong>
                            Passing Year<span style={{ color: 'red' }}>*</span>
                          </strong>
                        </Col>
                      </Row>
                    </div>

                    {fields.map((field) => (
                      <Row
                        key={field.key}
                        gutter={8}
                        style={{ marginBottom: 8, alignItems: 'center' }}
                      >
                        <Col span={12}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'education']}
                            fieldKey={[field.fieldKey, 'education']}
                            rules={[{ required: true, message: 'Please select qualification' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Select size="middle" placeholder="Select qualification">
                              <Select.Option value="10th">10th</Select.Option>
                              <Select.Option value="12th">12th</Select.Option>
                              <Select.Option value="Diploma">Diploma</Select.Option>
                              <Select.Option value="B.Tech">B.Tech</Select.Option>
                              <Select.Option value="B.Sc">B.Sc</Select.Option>
                              <Select.Option value="B.Com">B.Com</Select.Option>
                              <Select.Option value="BCA">BCA</Select.Option>
                              <Select.Option value="MBA">MBA</Select.Option>
                              <Select.Option value="MCA">MCA</Select.Option>
                              <Select.Option value="M.Tech">M.Tech</Select.Option>
                              <Select.Option value="PhD">PhD</Select.Option>
                              <Select.Option value="Others">Others</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col span={12}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'yop']}
                            fieldKey={[field.fieldKey, 'yop']}
                            rules={[{ required: true, message: 'Please select passing year' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <DatePicker
                              size="middle"
                              picker="year"
                              style={{ width: '100%' }}
                              placeholder="Select year"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    ))}
                  </div>
                )}
              </Form.List>
            </Col>

            <Col xs={24}>
              <Form.Item label="Cover Letter / Notes" name="additionalInfo">
                <TextArea rows={4} placeholder="Anything else you'd like us to know?" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Upload CV / Resume"
                name="resume"
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList}
                rules={[{ required: true, message: 'Please upload your CV/Resume' }]}
              >
                <Upload beforeUpload={beforeUpload} maxCount={1} accept=".pdf,.doc,.docx">
                  <Button icon={<UploadOutlined />} block>
                    Click to Upload
                  </Button>
                </Upload>
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value ? Promise.resolve() : Promise.reject('You must agree'),
                  },
                ]}
              >
                <Checkbox>
                  By using this form you agree with the storage and handling of your data by this
                  website.
                </Checkbox>
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Submit
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  )
}

export default AddApplicant
