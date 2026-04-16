import {
  Form,
  Input,
  Upload,
  Button,
  Row,
  Col,
  Card,
  Select,
  Spin,
  Checkbox,
  message,
  DatePicker,
  Table,
  Typography,
} from 'antd'

// Import Ant Design Icons
import { LoginOutlined, PaperClipOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'

import { useState, useEffect } from 'react'
import './application_form.css'
import logo from '../assets/images/V2-Logo-1.png'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createUpdateCandidate, fetchJobOpenings, getDropdownLocDesDep } from '../services/Services'
import { set } from '../redux/uiSlice'
import dayjs from 'dayjs'
import { useWatch } from 'antd/es/form/Form'

const { TextArea } = Input
const { Option } = Select

const layout = { labelCol: { span: 24 }, wrapperCol: { span: 24 } }

const ApplicationForm = () => {
  const [form] = Form.useForm()
  const [selectedJob, setSelectedJob] = useState(null)
  const [locations, setLocations] = useState([])
  const [jobList, setjobList] = useState(true)
  const [selectedDescription, setSelectedDescription] = useState(null)
  const { loading } = useSelector((state) => state?.ui)
  const { Designation, Location } = useSelector((state) => state?.dropdown.response || {})

  const [jobOpeningsList, setJobOpeningsList] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedType, setSelectedType] = useState(null)
  const dropdowns = ['department', 'designation', 'location']
  const dispatch = useDispatch()
  const [jobsLoading, setJobsLoading] = useState(false)
  const [filtersLoading, setFiltersLoading] = useState(false)

  const [isPrevSalaryDisabled, setIsPrevSalaryDisabled] = useState(false)
  const source_applicant = useWatch(['source'], form)
  const totalExperience = useWatch(['totalExperience'], form) ?? 0

  const fetchOpenings = async () => {
    setJobsLoading(true)
    try {
      const res = await fetchJobOpenings()
      if (res.status && Array.isArray(res.data) && res.data.length > 0) {
        setJobOpeningsList(res.data)
        setFilteredJobs(res.data)
      } else {
        console.log('No job openings available')
      }
    } catch (e) {
      console.error('Error while loading the data : ', e)
    } finally {
      setJobsLoading(false)
    }
  }

  useEffect(() => {
    fetchOpenings()
  }, [])

  useEffect(() => {
    const applyFilters = async () => {
      await dispatch(set({ loading: true }))

      let filtered = jobOpeningsList

      if (selectedLocation) {
        // Extract location code from dropdown format (e.g., "HB10-ARA" -> "HB10")
        const locationCode = selectedLocation.split('-')[0]

        filtered = filtered.filter((job) => {
          // Extract location code from job format (e.g., "ARA(HB10)" -> "HB10")
          const jobLocationCode = job.location?.match(/\(([^)]+)\)/)?.[1] || job.location
          return jobLocationCode?.trim().toLowerCase() === locationCode?.trim().toLowerCase()
        })
      }

      if (selectedCategory) {
        filtered = filtered.filter(
          (job) =>
            job.departmentName?.trim().toLowerCase() === selectedCategory?.trim().toLowerCase(),
        )
      }

      setFilteredJobs(filtered)

      await dispatch(set({ loading: false }))
    }

    applyFilters()
  }, [selectedLocation, selectedCategory, jobOpeningsList, dispatch])

  useEffect(() => {
    const experience = form.getFieldValue('totalExperience')
    if (experience === 0) {
      setIsPrevSalaryDisabled(true)
      form.setFieldsValue({ previousSalary: '0' })
    } else {
      setIsPrevSalaryDisabled(false)
    }
  }, [form.getFieldValue('totalExperience')])

  const beforeUpload = () => false

  const onFinish = async (values) => {
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

    newFormData.append('designation', selectedDescription?.designationId)
    newFormData.append('location', selectedDescription?.loC_CODE)
    newFormData.append('fullName', values.fullName)
    newFormData.append('dob', values.dob.format('YYYY-MM-DD'))
    newFormData.append('mobile', values.phone)
    newFormData.append('emailAddress', values.email)
    newFormData.append('company1', values.previousCompany || '')
    newFormData.append('positionHeldInPreviousCompany', values.previousDesignation || '')
    newFormData.append('PreviousSalary', values.previousSalary)
    newFormData.append('TotalExperience', values.totalExperience)
    newFormData.append('SalaryExpectation', values.salaryExpectation)
    newFormData.append('AdditionalInfoApplicant', values.additionalInfo || '')
    newFormData.append('Source', values.source)
    newFormData.append('PreferredLocation', values?.preferredLocation)
    newFormData.append('NoticePeriod', values.NoticePeriod ?? 0)

    
    if (values.source === 'person') {
      newFormData.append('ReferenceEmployee', values.reference)
    }
    newFormData.append('Aggreement', values.agreement)
    newFormData.append('IsApplicant', true)
    newFormData.append('isResumeAttachmentUploaded', values.resume[0].originFileObj ? true : false)
    newFormData.append('ResumeAttachment', values.resume[0]?.originFileObj)

    // ===== QualificationListJson =====
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
    // =================================

    for (const [key, value] of newFormData.entries()) {
      console.log(`key: ${key} and value: ${value}`)
    }

    return

    try {
      await dispatch(set({ loading: true }))
      const response = await createUpdateCandidate({ ef: newFormData })
      message.success('Form submitted successfully!')
      form.resetFields()
      setSelectedJob(null)
      setjobList(true)
    } catch (error) {
      console.error('Error in Applicant Create', error)
      message.error('Error in Applicant Create. Please try again.')
    } finally {
      await dispatch(set({ loading: false }))
    }
  }

  const onFinishFailed = () => {
    message.error('Please fill all required fields.')
  }

  const handleJobSelect = (jobKey) => {
    setSelectedDescription(jobKey)
    setSelectedJob(jobKey)
    form.resetFields()
  }

  const fetchDropdowns = async () => {
    setFiltersLoading(true)
    try {
      const response = await getDropdownLocDesDep(dropdowns.join(', '))
      if (response.status) {
        const locArr = response.data?.Location
        setLocations(locArr)
      }
    } catch (error) {
      console.error('dropdowns api error:', error)
    } finally {
      setFiltersLoading(false)
    }
  }

  useEffect(() => {
    fetchDropdowns()
  }, [])

  const uniqueDepartments = [...new Set(jobOpeningsList.map((job) => job.departmentName))]

  const columns = [
    {
      title: 'Designation',
      dataIndex: 'designationName',
      key: 'designationName',
      sorter: (a, b) => a.designationName.localeCompare(b.designationName),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      ellipsis: true,
    },
    {
      title: 'Department',
      dataIndex: 'departmentName',
      key: 'departmentName',
      sorter: (a, b) => a.departmentName.localeCompare(b.departmentName),
      responsive: ['sm', 'md', 'lg', 'xl'],
      ellipsis: true,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      sorter: (a, b) => a.location.localeCompare(b.location),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      ellipsis: true,
    },
    {
      title: 'Store Code',
      dataIndex: 'loC_CODE',
      key: 'loC_CODE',
      responsive: ['md', 'lg', 'xl'],
      width: 120,
    },
    {
      title: 'Seat Budget',
      dataIndex: 'seatBudget',
      key: 'seatBudget',
      align: 'center',
      responsive: ['md', 'lg', 'xl'],
      width: 120,
    },
    {
      title: 'Emp Count',
      dataIndex: 'empCount',
      key: 'empCount',
      align: 'center',
      responsive: ['md', 'lg', 'xl'],
      width: 120,
    },
    {
      title: 'Vacancy',
      dataIndex: 'vacancy',
      key: 'vacancy',
      align: 'center',
      render: (vacancy) => (
        <span className={vacancy > 0 ? 'vacancy-text-positive' : 'vacancy-text-zero'}>
          {vacancy}
        </span>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      width: 110,
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            handleJobSelect(record)
            setjobList(false)
          }}
          disabled={record.vacancy === 0}
          style={{ minWidth: 88 }}
        >
          Apply
        </Button>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      width: 120,
    },
  ]

  return (
    <Spin spinning={loading}>
      <Card className="custom-card" bordered={false} style={{ minHeight: '100vh' }}>
        {/* Header Card */}
        <Card className="header-card" bordered={false}>
          <Row justify="space-between" align="middle">
            <Col>
              <img src={logo} alt="Logo" className="form-logo" style={{ height: 50 }} />
            </Col>
            <Col>
              <Link to="/login">
                <Button className="login-button" type="primary" icon={<LoginOutlined />}>
                  Back
                </Button>
              </Link>
            </Col>
          </Row>
        </Card>

        <Row gutter={24}>
          {/* Job List Table */}
          {jobList && (
            <Col xs={24}>
              <Card
                className="jobs-card"
                title="Available Jobs"
                extra={
                  <Row className="filters-row" gutter={[12, 12]} wrap>
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Select
                        placeholder="Job Category"
                        style={{ width: '100%' }}
                        onChange={(value) => setSelectedCategory(value)}
                        allowClear
                        onClear={() => setSelectedCategory(null)}
                        loading={filtersLoading}
                      >
                        {uniqueDepartments.map((dept) => (
                          <Option key={dept} value={dept}>
                            {dept}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Select
                        placeholder="Job Location"
                        style={{ width: '100%' }}
                        onChange={(value) => setSelectedLocation(value)}
                        showSearch
                        optionFilterProp="children"
                        filterOption
                        allowClear
                        onClear={() => setSelectedLocation(null)}
                        loading={filtersLoading}
                      >
                        {Location?.map((loc) => (
                          <Option key={loc?.locationId} value={loc?.locationName}>
                            {loc?.locationName}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                  </Row>
                }
              >
                {/* Desktop Table View */}
                <div className="desktop-table-view">
                  <Table
                    columns={columns}
                    dataSource={filteredJobs}
                    rowKey={(record) => `${record.designationId}-${record.loC_CODE}`}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} jobs`,
                    }}
                    size="middle"
                    scroll={{ x: 'max-content' }}
                    bordered
                    loading={jobsLoading}
                  />
                </div>

                {/* Mobile Card View */}
                <div className="mobile-cards-view">
                  {jobsLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <Spin />
                    </div>
                  ) : (
                    filteredJobs.map((job) => (
                      <Card
                        key={`${job.designationId}-${job.loC_CODE}`}
                        className="job-mobile-card"
                      >
                        <div className="job-mobile-content">
                          <div className="job-field">
                            <span className="job-label">Designation</span>
                            <span className="job-value job-value-strong">
                              {job.designationName}
                            </span>
                          </div>

                          <div className="job-field">
                            <span className="job-label">Department</span>
                            <span className="job-value">{job.departmentName}</span>
                          </div>

                          <div className="job-field">
                            <span className="job-label">Location</span>
                            <span className="job-value">{job.location}</span>
                          </div>

                          <Row gutter={[12, 12]} className="job-grid-info">
                            <Col span={12}>
                              <div className="job-field">
                                <span className="job-label">Store Code</span>
                                <span className="job-value">{job.loC_CODE}</span>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div className="job-field">
                                <span className="job-label">Seat Budget</span>
                                <span className="job-value">{job.seatBudget}</span>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div className="job-field">
                                <span className="job-label">Emp Count</span>
                                <span className="job-value">{job.empCount}</span>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div className="job-field">
                                <span className="job-label">Vacancy</span>
                                <span
                                  className={
                                    job.vacancy > 0 ? 'vacancy-text-positive' : 'vacancy-text-zero'
                                  }
                                >
                                  {job.vacancy}
                                </span>
                              </div>
                            </Col>
                          </Row>

                          <Button
                            type="primary"
                            block
                            className="mobile-apply-button"
                            onClick={() => {
                              handleJobSelect(job)
                              setjobList(false)
                            }}
                            disabled={job.vacancy === 0}
                          >
                            Apply
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </Card>
            </Col>
          )}

          {/* Application Form */}
          {!jobList && selectedJob && (
            <Col xs={24}>
              <Card
                className="application-form-card"
                title={`Apply for ${selectedDescription?.designationName}`}
                extra={
                  <Button onClick={() => setjobList(true)} type="default" className="back-button">
                    ← Back to Jobs
                  </Button>
                }
              >
                {/* Job Details Summary */}
                <div className="job-details-summary">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <strong>Department:</strong> {selectedDescription?.departmentName}
                    </Col>
                    <Col xs={24} sm={8}>
                      <strong>Location:</strong> {selectedDescription?.location}
                    </Col>
                    <Col xs={24} sm={8}>
                      <strong>Vacancies:</strong> {selectedDescription?.vacancy}
                    </Col>
                  </Row>
                </div>

                <Form
                  {...layout}
                  form={form}
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                  layout="vertical"
                  onValuesChange={(changedValues) => {
                    if ('totalExperience' in changedValues) {
                      if (changedValues.totalExperience === 0) {
                        setIsPrevSalaryDisabled(true)
                        form.setFieldsValue({ previousSalary: '0' })
                      } else {
                        setIsPrevSalaryDisabled(false)
                      }
                    }
                  }}
                >
                  <Row gutter={[16, 16]}>
                    <Col span={24}>
                      <Form.Item
                        label="Full Name"
                        name="fullName"
                        rules={[
                          { required: true, message: 'Please enter your name' },
                          // {
                          //   pattern: /^[A-Za-z\s]+$/,
                          //   message: 'Name can only contain letters and spaces',
                          // },
                        ]}
                      >
                        <Input placeholder="Enter your full name" />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Preferred Location + Qualification Table + DoJ */}
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Preferred Job Location"
                        name="preferredLocation"
                        rules={[{ required: true, message: 'Preferred Location is required' }]}
                      >
                        <Select
                          showSearch
                          optionFilterProp="children"
                          allowClear
                          placeholder="Select Location"
                        >
                          {(locations || []).map((loc) => (
                            <Select.Option key={loc.locationId} value={loc.locationId}>
                              {loc.locationName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      {/* <Form.Item
                        label="Notice Period (In Days)"
                        name="NoticePeriod"
                        rules={[{ required: true, message: 'Notice Period is required' }]}
                      >
                        {/* <DatePicker
                          style={{ width: '100%' }}
                          disabledDate={(current) => current && current < dayjs().startOf('day')}
                        /> */}
                      {/* </Form.Item>  */}

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
                  </Row>

                  <Row gutter={[16, 16]}>
                    {[
                      {
                        label: 'Date of Birth',
                        name: 'dob',
                        component: (
                          <DatePicker
                            format="DD-MM-YYYY"
                            style={{ width: '100%' }}
                            disabledDate={(current) => current && current > dayjs().endOf('day')}
                          />
                        ),
                        rules: [
                          { required: true, message: 'Please select date of birth' },
                          {
                            validator: (_, value) => {
                              const birthDate = dayjs(value)
                              if (!birthDate.isValid()) {
                                return Promise.reject('Invalid date format')
                              }
                              const isAtLeast18 = dayjs().diff(birthDate, 'year') >= 18
                              return isAtLeast18
                                ? Promise.resolve()
                                : Promise.reject('You must be at least 18 years old')
                            },
                          },
                        ],
                      },
                      {
                        label: 'Phone Number',
                        name: 'phone',
                        component: (
                          <Input
                            maxLength={10}
                            placeholder="10-digit mobile number"
                            onKeyPress={(e) => {
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault()
                              }
                            }}
                          />
                        ),
                        rules: [
                          { required: true, message: 'Please enter phone' },
                          { pattern: /^\d{10}$/, message: 'Phone must be exactly 10 digits' },
                        ],
                      },
                      {
                        label: 'Email Address',
                        name: 'email',
                        component: <Input placeholder="your.email@example.com" />,
                        rules: [
                          { required: true, message: 'Please enter your email' },
                          { type: 'email', message: 'Please enter a valid email address' },
                        ],
                      },
                      {
                        label: 'Total Experience (Years)',
                        name: 'totalExperience',
                        component: (
                          <Select placeholder="Select experience">
                            {Array.from({ length: 31 }, (_, i) => (
                              <Select.Option key={i} value={i}>
                                {i} {i === 1 || i === 0 ? 'Year' : 'Years'}
                              </Select.Option>
                            ))}
                          </Select>
                        ),
                        rules: [{ required: true, message: 'Total Experience is required' }],
                      },
                      {
                        label: 'Previous Designation',
                        name: 'previousDesignation',
                        component: (
                          <Input
                            placeholder="Enter previous designation"
                            disabled={totalExperience === 0}
                          />
                        ),
                        rules: [
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              const exp = getFieldValue('totalExperience')
                              if (exp === 0) return Promise.resolve()
                              if (totalExperience > 0 && (!value || !value.trim())) {
                                return Promise.reject(
                                  new Error('Please enter your previous designation'),
                                )
                              }
                              if (!/^[A-Za-z\s]+$/.test(value)) {
                                return Promise.reject(
                                  new Error('Designation can only contain letters and spaces'),
                                )
                              }
                              return Promise.resolve()
                            },
                          }),
                          { required: totalExperience > 0 ? true : false },
                        ],
                      },
                      {
                        label: 'Previous Salary (₹)',
                        name: 'previousSalary',
                        component: (
                          <Input
                            placeholder="Enter previous salary"
                            disabled={totalExperience === 0}
                          />
                        ),
                        rules: [
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              const exp = getFieldValue('totalExperience')
                              if (exp === 0) return Promise.resolve()
                              if (
                                totalExperience > 0 &&
                                (value === '' || value === undefined || value === null)
                              ) {
                                return Promise.reject(new Error('Please enter previous salary'))
                              }
                              if (totalExperience > 0 && !/^\d+$/.test(String(value))) {
                                return Promise.reject(
                                  new Error('Please enter a valid integer salary'),
                                )
                              }
                              return Promise.resolve()
                            },
                          }),
                          { required: totalExperience > 0 ? true : false },
                        ],
                      },

                      {
                        label: 'Previous Company',
                        name: 'previousCompany',
                        component: (
                          <Input
                            placeholder="Enter previous company name"
                            disabled={totalExperience === 0}
                          />
                        ),
                        rules: [
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              const exp = getFieldValue('totalExperience')
                              if (exp === 0) return Promise.resolve()
                              if (totalExperience > 0 && (!value || !value.trim())) {
                                return Promise.reject(
                                  new Error('Please enter your previous company'),
                                )
                              }
                              if (totalExperience > 0 && !/^[A-Za-z\s]+$/.test(value)) {
                                return Promise.reject(
                                  new Error('Company can only contain letters and spaces'),
                                )
                              }
                              return Promise.resolve()
                            },
                          }),
                          { required: totalExperience > 0 ? true : false },
                        ],
                      },
                      {
                        label: 'Salary Expectation (₹)',
                        name: 'salaryExpectation',
                        component: <Input placeholder="Enter expected salary" />,
                        rules: [
                          { required: true, message: 'Salary expectation is required' },
                          { pattern: /^\d+$/, message: 'Value must be a number' },
                        ],
                      },
                      {
                        label: 'How did you hear about us?',
                        name: 'source',
                        component: (
                          <Select placeholder="Select source">
                            <Select.Option value="person">By Person</Select.Option>
                            <Select.Option value="newspaper Ad">Newspaper Ad</Select.Option>
                            <Select.Option value="Job Portal">Job Portal</Select.Option>
                            <Select.Option value="Social Media">Social Media</Select.Option>
                            <Select.Option value="Walk In">Walk In</Select.Option>
                            <Select.Option value="LinkedIn">LinkedIn</Select.Option>
                            <Select.Option value="Facebook">Facebook</Select.Option>
                            <Select.Option value="Instagram">Instagram</Select.Option>
                            <Select.Option value="Google">Google</Select.Option>
                          </Select>
                        ),
                        rules: [{ required: true, message: 'Source is required' }],
                      },
                      source_applicant === 'person' && {
                        label: 'Reference Employee Name',
                        name: 'reference',
                        component: <Input placeholder="Enter reference employee name" />,
                        rules: [{ required: true, message: 'Reference Employee is required' }],
                      },
                    ]
                      .filter(Boolean)
                      .map((field, index) => (
                        <Col xs={24} md={12} key={index}>
                          <Form.Item label={field.label} name={field.name} rules={field.rules}>
                            {field.component}
                          </Form.Item>
                        </Col>
                      ))}

                    {/* Qualification table (Higher Qualification + Passing Year) */}
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
                              const hasEmpty = qualifications.some(
                                (q) => !q || !q.education || !q.yop,
                              )
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
                        {(fields, { add, remove }) => (
                          <div className="qualification-table-wrapper">
                            <div className="qualification-table-header" style={{ marginBottom: 8 }}>
                              <Row gutter={8}>
                                <Col span={10}>
                                  <strong>Higher Qualification</strong>
                                </Col>
                                <Col span={10}>
                                  <strong>Passing Year</strong>
                                </Col>
                                <Col span={4}>
                                  <strong>Action</strong>
                                </Col>
                              </Row>
                            </div>

                            {fields.map((field) => (
                              <Row
                                key={field.key}
                                gutter={8}
                                style={{ marginBottom: 8, alignItems: 'center' }}
                              >
                                <Col span={10}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'education']}
                                    fieldKey={[field.fieldKey, 'education']}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Please select qualification',
                                      },
                                    ]}
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

                                <Col span={10}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'yop']}
                                    fieldKey={[field.fieldKey, 'yop']}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Please select passing year',
                                      },
                                    ]}
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

                                <Col span={4}>
                                  <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    type="text"
                                    onClick={() => {
                                      if (fields.length === 1) return
                                      remove(field.name)
                                    }}
                                    disabled={fields.length === 1}
                                  >
                                    Remove
                                  </Button>
                                </Col>
                              </Row>
                            ))}

                            <Button
                              type="dashed"
                              onClick={() => add()}
                              block
                              icon={<PlusOutlined />}
                            >
                              Add More
                            </Button>
                          </div>
                        )}
                      </Form.List>
                    </Col>

                    <Col span={24}>
                      <Form.Item
                        label="Cover Letter / Additional Information"
                        name="additionalInfo"
                      >
                        <TextArea
                          rows={4}
                          placeholder="Tell us why you're a great fit for this role..."
                        />
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Form.Item
                        label="Upload CV / Resume"
                        name="resume"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => e?.fileList}
                        rules={[
                          { required: true, message: 'Please upload your resume' },
                          {
                            validator: (_, value) =>
                              value && value.length > 0
                                ? Promise.resolve()
                                : Promise.reject(new Error('Please upload your resume')),
                          },
                        ]}
                      >
                        <Upload beforeUpload={beforeUpload} maxCount={1} accept=".pdf,.doc,.docx">
                          <Button icon={<PaperClipOutlined />}>Click to Upload Resume</Button>
                        </Upload>
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Form.Item
                        name="agreement"
                        valuePropName="checked"
                        rules={[
                          {
                            validator: (_, value) =>
                              value
                                ? Promise.resolve()
                                : Promise.reject('You must agree to continue'),
                          },
                        ]}
                      >
                        <Checkbox>
                          I agree to the storage and handling of my data by this organization for
                          recruitment purposes.
                        </Checkbox>
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block>
                          Submit Application
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Col>
          )}
        </Row>
      </Card>
    </Spin>
  )
}

export default ApplicationForm
