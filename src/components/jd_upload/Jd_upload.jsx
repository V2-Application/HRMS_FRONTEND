import {
  Form,
  Input,
  InputNumber,
  Upload,
  Button,
  Row,
  Col,
  Card,
  Select,
  Spin,
  Checkbox,
  message,
  Typography,
  Space,
} from 'antd'

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons'
import { useState, useEffect } from 'react'
import '../../employees/application_form.css'
import logo from '../../assets/images/V2-Logo-1.png'
import { Link, useLocation } from 'react-router-dom'
const { Title } = Typography

const { TextArea } = Input
const { Option } = Select

const jobDescriptions = {
  Developer: {
    position: 'Frontend Developer (React)',
    experience: '2-4 years',
    budget: '₹6 LPA – ₹10 LPA',
    location: 'Bangalore / Remote',
    keyResponsibilities: [
      'Develop and maintain scalable React applications.',
      'Collaborate with backend developers and UI/UX designers.',
      'Write clean, maintainable, and reusable code.',
      'Optimize application performance and responsiveness.',
      'Participate in code reviews and technical discussions.',
    ],
    qualification: 'Bachelor’s degree in Computer Science or related field',
    preferredSkills: [
      'Proficiency in React.js and JavaScript (ES6+)',
      'Familiarity with Redux, REST APIs, Webpack',
      'Understanding of version control systems like Git',
      'Experience with testing frameworks like Jest',
      'Knowledge of UI libraries like Ant Design or Material UI',
    ],
  },
  Designer: {
    position: 'UI/UX Designer',
    experience: '1-3 years',
    budget: '₹4 LPA – ₹8 LPA',
    location: 'Mumbai / Hybrid',
    keyResponsibilities: [
      'Create user-centered designs for web and mobile applications.',
      'Translate business requirements into wireframes and mockups.',
      'Collaborate closely with developers and product teams.',
      'Conduct user research and usability testing.',
      'Maintain design consistency across all products.',
    ],
    qualification: 'Bachelor’s degree in Design, Fine Arts or relevant field',
    preferredSkills: [
      'Proficiency in tools like Figma, Adobe XD, or Sketch',
      'Understanding of design systems and responsive design',
      'Experience with prototyping and design testing',
      'Strong visual design and communication skills',
      'Ability to manage multiple projects',
    ],
  },
  QAEngineer: {
    position: 'Quality Assurance Engineer',
    experience: '2-5 years',
    budget: '₹5 LPA – ₹9 LPA',
    location: 'Chennai / Remote',
    keyResponsibilities: [
      'Design and implement comprehensive test plans and test cases.',
      'Perform manual and automated testing for web and mobile apps.',
      'Identify, document, and track software defects.',
      'Collaborate with developers to resolve issues.',
      'Ensure product quality before every release.',
    ],
    qualification: 'Bachelor’s degree in Computer Science or equivalent',
    preferredSkills: [
      'Experience with Selenium, Cypress, or Playwright',
      'Familiarity with CI/CD pipelines',
      'Understanding of Agile methodologies',
      'Knowledge of performance and security testing',
      'Strong problem-solving and analytical skills',
    ],
  },
  ProductManager: {
    position: 'Product Manager',
    experience: '3-6 years',
    budget: '₹10 LPA – ₹18 LPA',
    location: 'Delhi / Onsite',
    keyResponsibilities: [
      'Define product roadmap and prioritize features.',
      'Work closely with design, development, and QA teams.',
      'Conduct market research and user interviews.',
      'Translate business needs into technical requirements.',
      'Ensure timely delivery of product features.',
    ],
    qualification: 'Bachelor’s degree in Business, Engineering or related field',
    preferredSkills: [
      'Excellent communication and leadership skills',
      'Experience with Agile project management tools',
      'Strong analytical and problem-solving mindset',
      'Understanding of UI/UX principles',
      'Knowledge of product lifecycle management',
    ],
  },
  DevOpsEngineer: {
    position: 'DevOps Engineer',
    experience: '3-5 years',
    budget: '₹8 LPA – ₹14 LPA',
    location: 'Hyderabad / Hybrid',
    keyResponsibilities: [
      'Manage CI/CD pipelines and automate deployment processes.',
      'Monitor infrastructure and ensure high availability.',
      'Implement security and compliance best practices.',
      'Collaborate with development teams for efficient delivery.',
      'Troubleshoot system issues and perform root cause analysis.',
    ],
    qualification: 'Bachelor’s degree in IT or related field',
    preferredSkills: [
      'Proficiency with AWS, Azure, or GCP',
      'Knowledge of Docker, Kubernetes, and Terraform',
      'Experience with Jenkins, GitLab CI, or similar tools',
      'Understanding of scripting languages like Bash or Python',
      'Familiarity with system monitoring tools like Prometheus/Grafana',
    ],
  },
}

const layout = { labelCol: { span: 24 }, wrapperCol: { span: 24 } }

const Jd_upload = () => {
  const [form] = Form.useForm()
  const location = useLocation().pathname
  const [imageValue, setImageValue] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [loading, setLoading] = useState(false)
  const [jobList, setjobList] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [applieMode, setapplieMode] = useState(false)
  const selectedDescription = jobDescriptions[selectedJob]
  const [editedDescription, setEditedDescription] = useState({ ...selectedDescription })

  const handleUploadChange = ({ fileList }) => {
    setImageValue(fileList)
  }

  const beforeUpload = () => false

  const handleRemove = (file) => {
    setImageValue((prev) => prev.filter((item) => item.uid !== file.uid))
  }

  const onFinish = (values) => {
    // console.log('Form Submitted:', values);
    message.success('Form submitted successfully!')
    form.resetFields()
    setImageValue([])
  }

  const onFinishFailed = () => {
    message.error('Please fill all required fields.')
  }

  const handleJobSelect = (jobKey) => {
    setSelectedJob(jobKey)
    const data = jobDescriptions[jobKey]
    if (data) {
      form.setFieldsValue({
        jobCategory: jobKey,
        ...data,
      })
    }
  }

  const handleSave = () => {
    // You can update the backend here or trigger a callback
    // console.log('Updated Data:', editedDescription);
    setEditMode(false)
  }

  const handleChange = (field, value) => {
    setEditedDescription((prev) => ({ ...prev, [field]: value }))
  }

  const jobCategories = [
    'Engineering',
    'Marketing',
    'Design',
    'Sales',
    'Finance',
    'HR',
    'Operations',
    'Customer Support',
    'IT',
    'Legal',
  ]

  const jobTypes = [
    'Full-Time',
    'Part-Time',
    'Contract',
    'Internship',
    'Freelance',
    'Remote',
    'Temporary',
    'On-site',
    'Consultant',
    'Volunteer',
  ]

  const jobLocations = [
    'Maharashtra',
    'Karnataka',
    'Tamil Nadu',
    'Delhi',
    'Telangana',
    'West Bengal',
    'Uttar Pradesh',
    'Gujarat',
    'Rajasthan',
    'Punjab',
  ]

  return (
    <Spin spinning={loading}>
      <Row gutter={24}>
        {/* // show job list //////////// */}
        {!selectedJob && !editMode && (
          <Col xs={24} md={24}>
            <Card
              title="Available Jobs"
              extra={
                <Row gutter={[6, 6]}>
                  <Col span={6}>
                    <Select
                      placeholder="Job Category"
                      style={{ width: '100%' }}
                      //  onChange={(value) => console.log('Category:', value)}
                    >
                      {jobCategories.map((category) => (
                        <Option key={category} value={category}>
                          {category}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="Job Type"
                      style={{ width: '100%' }}
                      // onChange={(value) => console.log('Type:', value)}
                    >
                      {jobTypes.map((type) => (
                        <Option key={type} value={type}>
                          {type}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Select
                      placeholder="Job Location"
                      style={{ width: '100%' }}
                      // onChange={(value) => console.log('Location:', value)}
                    >
                      {jobLocations.map((location) => (
                        <Option key={location} value={location}>
                          {location}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={6}>
                    <Button
                      type="primary"
                      onClick={() => {
                        form.resetFields()
                        setEditMode(true)
                        setSelectedJob('New Job Post')
                      }}
                    >
                      Add New
                    </Button>
                  </Col>
                </Row>
              }
            >
              <ul style={{ marginTop: 16, listStyle: 'none', padding: 0 }}>
                {Object.keys(jobDescriptions).map((key) => (
                  <li
                    key={key}
                    onClick={() => handleJobSelect(key)}
                    style={{
                      cursor: 'pointer',
                      color: '#007bff',
                      padding: '10px 0',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>{jobDescriptions[key].position}</div>
                      <div
                        style={{ fontSize: 13, color: '#007bff', marginTop: 4 }}
                        onClick={() => handleJobSelect(key)}
                      >
                        More details <span style={{ marginLeft: 4 }}>→</span>
                      </div>
                    </div>
                    <div style={{ color: '#555', fontSize: 14 }}>
                      📍 {jobDescriptions[key].location}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </Col>
        )}

        {/* //job description///////////// */}
        {selectedJob && (
          <Col xs={24} md={24}>
            <Card
              title={selectedDescription?.position || 'Job Description'}
              extra={
                <div style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
                  <div style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
                    {editMode ? (
                      <Button type="primary">
                        <SaveOutlined />
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        onClick={() => {
                          setEditMode(true)
                        }}
                      >
                        <EditOutlined />
                      </Button>
                    )}
                  </div>

                  <Button
                    type="primary"
                    onClick={() => {
                      setjobList(false)
                      setEditMode(false)
                      setSelectedJob(null)
                    }}
                  >
                    {'Back'}
                  </Button>
                </div>
              }
            >
              {!editMode && (
                <>
                  <p>
                    <strong>Experience:</strong> {selectedDescription.experience}
                  </p>
                  <p>
                    <strong>Budget:</strong> {selectedDescription.budget}
                  </p>
                  <p>
                    <strong>Location:</strong> {selectedDescription.location}
                  </p>
                  <p>
                    <strong>Qualification:</strong> {selectedDescription.qualification}
                  </p>
                  <p>
                    <strong>Key Responsibilities:</strong>
                  </p>
                  <ul>
                    {selectedDescription.keyResponsibilities.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                  <p>
                    <strong>Preferred Skills:</strong>
                  </p>
                  <ul>
                    {selectedDescription.preferredSkills.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
              {editMode && (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  initialValues={{
                    experience: '',
                    budget: '',
                    location: '',
                    qualification: '',
                    jobCategory: '',
                    position: '',
                    keyResponsibilities: [''],
                    preferredSkills: [''],
                  }}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        label="Job Category"
                        name="jobCategory"
                        rules={[{ required: true, message: 'Please select job category' }]}
                      >
                        <Select placeholder="Select category">
                          <Option value="Developer">Developer</Option>
                          <Option value="Designer">Designer</Option>
                          <Option value="QAEngineer">QAEngineer</Option>
                          <Option value="ProductManager">ProductManager</Option>
                          <Option value="DevOpsEngineer">DevOpsEngineer</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        label="Position"
                        name="position"
                        rules={[{ required: true, message: 'Please enter position' }]}
                      >
                        <Input placeholder="Job position (e.g. Frontend Developer)" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        label="Experience"
                        name="experience"
                        rules={[{ required: true, message: 'Please select experience' }]}
                      >
                        <Select placeholder="Select experience">
                          <Option value="Fresher">Fresher</Option>
                          <Option value="1-2 Years">1-2 Years</Option>
                          <Option value="3-5 Years">3-5 Years</Option>
                          <Option value="5+ Years">5+ Years</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        label="Budget"
                        name="budget"
                        rules={[{ required: true, message: 'Please select budget' }]}
                      >
                        <Select placeholder="Select budget">
                          <Option value="10,000 - 20,000">10,000 - 20,000</Option>
                          <Option value="20,000 - 40,000">20,000 - 40,000</Option>
                          <Option value="40,000 - 60,000">40,000 - 60,000</Option>
                          <Option value="60,000+">60,000+</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        label="Location"
                        name="location"
                        rules={[{ required: true, message: 'Please select location' }]}
                      >
                        <Select placeholder="Select location">
                          <Option value="Remote">Remote</Option>
                          <Option value="Delhi">Delhi</Option>
                          <Option value="Mumbai">Mumbai</Option>
                          <Option value="Bangalore">Bangalore</Option>
                          <Option value="Hyderabad">Hyderabad</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        label="Qualification"
                        name="qualification"
                        rules={[{ required: true, message: 'Please select qualification' }]}
                      >
                        <Select placeholder="Select qualification">
                          <Option value="10th">10th</Option>
                          <Option value="12th">12th</Option>
                          <Option value="Diploma">Diploma</Option>
                          <Option value="Graduate">Graduate</Option>
                          <Option value="Post Graduate">Post Graduate</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Title level={5}>Key Responsibilities</Title>
                  <Form.List name="keyResponsibilities">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Row key={key} gutter={16}>
                            <Col span={24}>
                              <Form.Item
                                {...restField}
                                name={name}
                                rules={[{ required: true, message: 'Enter responsibility' }]}
                                style={{ width: '100%' }}
                              >
                                <Input
                                  placeholder="Responsibility"
                                  addonAfter={<MinusCircleOutlined onClick={() => remove(name)} />}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        ))}
                        <Form.Item>
                          <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                            Add Responsibility
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>

                  <Title level={5}>Preferred Skills</Title>
                  <Form.List name="preferredSkills">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Row key={key} gutter={16}>
                            <Col span={24}>
                              <Form.Item
                                {...restField}
                                name={name}
                                rules={[{ required: true, message: 'Enter skill' }]}
                                style={{ width: '100%' }}
                              >
                                <Input
                                  placeholder="Skill"
                                  addonAfter={<MinusCircleOutlined onClick={() => remove(name)} />}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        ))}
                        <Form.Item>
                          <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                            Add Skill
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" style={{ marginTop: 16 }}>
                      Submit
                    </Button>
                  </Form.Item>
                </Form>
              )}
            </Card>
          </Col>
        )}
      </Row>
    </Spin>
  )
}

export default Jd_upload
