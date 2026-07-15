import {
  Col,
  Row,
  Form,
  Card,
  Input,
  Select,
  Upload,
  InputNumber,
  Button,
  Checkbox,
  DatePicker,
  message,
} from 'antd'
import React, { useEffect, useState } from 'react'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import './addapplicant.css'
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../../redux/uiSlice'
import {
  createUpdateCandidate,
  fetchCities,
  fetchStates,
  getApplicantById,
  getDropdownLocDesDep,
} from '../../services/Services'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select

function AddApplicant() {
  const [form] = Form.useForm()
  const [selectedJob, setSelectedJob] = useState(null)
  const [imageValue, setImageValue] = useState([])
  const [resumeValue, setresumeValue] = useState([])
  const dispatch = useDispatch()
  const { Designation } = useSelector((state) => state.dropdown.response)
  const param = useParams()
  const [locations, setLocations] = useState([])
  const [statesList, setStatessList] = useState([])
  const dropdowns = ['department', 'designation', 'location']

  // - watch the state field
  const selectedState = Form.useWatch('state', form)
  // console.log('selectedState: ', selectedState)

  const fetchStoresList = async () => {
    const response = await fetchStates()
    // console.log('stores api res: ', response)

    if (response.status === 200) {
      setStatessList(response.data)
    } else {
      setStatessList([])
    }
  }

  useEffect(() => {
    fetchStoresList()
  }, [])

  const fetchCititesList = async (stateId) => {
    try {
      const res = await fetchCities(stateId)
      // console.log('res: ', res)
    } catch (error) {
      console.error('error fetching city: ', error)
    }
  }

  useEffect(() => {
    if (selectedState) fetchCititesList(selectedState)
  }, [selectedState])

  const handleUploadChange = ({ fileList }) => {
    const validImageExtns = ['png', 'jpg', 'jpeg', 'webp', 'heif']
    const fileType = fileList[0]['type']?.split('/')[1]

    if (!validImageExtns.includes(fileType)) {
      message.error('Invalid image!')
      setImageValue([])
      return false
    } else {
      setImageValue(fileList)
    }
  }

  const beforeUpload = () => false

  const handleRemove = (file) => {
    setImageValue((prev) => prev.filter((item) => item.uid !== file.uid))
  }

  const onFinish = async (values) => {
    await dispatch(set({ loading: true }))
    // console.log('Form Submitted:', values)
    const newFormData = new FormData()

    newFormData.append('designation', values.position)
    newFormData.append('location', values.currentLocation)
    newFormData.append('fullName', values.fullName)
    newFormData.append('dob', values.dob.format('YYYY-MM-DD'))
    newFormData.append('mobile', values.phone)
    newFormData.append('emailAddress', values.email)
    newFormData.append('company1', values.previousCompany)
    newFormData.append('positionHeldInPreviousCompany', values.previousDesignation)
    newFormData.append('SalaryExpectation', values.previousSalary)
    newFormData.append('TotalExperience', values.totalExperience)
    newFormData.append('SalaryExpectation', values.salaryExpectation)
    newFormData.append('AdditionalInfoApplicant', values.additionalInfo)
    newFormData.append('Aggreement', values.agreement)
    newFormData.append('IsApplicant', true)

    if (imageValue.length > 0) {
      newFormData.append('PassportPhoto', imageValue[0].originFileObj)
      newFormData.append('isPassportPhotoUploaded', true)
    }

    // Append single uploaded image (if exists)
    if (values.resume) {
      newFormData.append('ResumeAttachment', values.resume[0].originFileObj)
      newFormData.append(
        'isResumeAttachmentUploaded',
        values.resume[0].originFileObj ? true : false,
      )
    }

    try {
      const response = await createUpdateCandidate({ ef: newFormData })
      message.success('Applicant Created successfully!')
      form.resetFields()
      setImageValue([])
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

  const getDataByApplicantId = async (id) => {
    try {
      const response = await getApplicantById(id)
      form.setFieldsValue(response)
    } catch (error) {
      console.error('Failed to fetch applicant data:', error)
    }
  }

  useEffect(() => {
    if (param.id) {
      getDataByApplicantId(param.id)
    }
  }, [])

  const fetchDropdowns = async () => {
    try {
      const response = await getDropdownLocDesDep(dropdowns.join(', '))
      // console.log('response', response)

      if (response.status) {
        let deptArr = response.data?.Department
        const desgArr = response.data?.Designation
        const locArr = response.data?.Location

        setLocations(locArr)
      }
    } catch (error) {
      console.error('dropdowns api error:', error)
    }
  }

  useEffect(() => {
    fetchDropdowns()
  }, [])

  return (
    <Card>
      <Form
        form={form}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        layout="vertical"
        style={{ backgroundColor: '#fff', padding: 20 }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="photo"
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
              rules={[{ required: true, message: 'Please upload your photo' }]}
              label="Profile Photo"
            >
              <Upload
                className="custom-profile-photo"
                listType="picture-card"
                fileList={imageValue || []}
                onChange={handleUploadChange}
                beforeUpload={beforeUpload}
                onRemove={handleRemove}
                maxCount={1}
                showUploadList={false}
                accept="image/png, image/jpg, image, jpeg, image/webp, image/heif"
              >
                {imageValue.length >= 1 ? (
                  <div className="profile_img" style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={
                        imageValue[0]?.thumbUrl ||
                        imageValue[0]?.url ||
                        (imageValue[0]?.originFileObj &&
                          URL.createObjectURL(imageValue[0]?.originFileObj))
                      }
                      alt="avatar"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <div className="upload-overlay">
                      <PlusOutlined style={{ color: '#fff', fontSize: '24px' }} />
                    </div>
                  </div>
                ) : (
                  <button type="button" className="upload-button">
                    <PlusOutlined />
                  </button>
                )}
              </Upload>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Job Position"
              name="position"
              rules={[{ required: true, message: 'Please select job position' }]}
            >
              <Select placeholder="Select Position">
                {Designation?.map((val, index) => (
                  <Option key={index} value={val.designationId}>
                    {val.designationName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="DOB"
              name="dob"
              rules={[{ required: true, message: 'Please enter your age' }]}
            >
              <DatePicker
                format="DD-MM-YYYY"
                style={{ width: '100%' }}
                disabledDate={(current) => current && current > dayjs().startOf('day')}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>

            <Form.Item
              label="Phone"
              name="phone"
              rules={[
                { required: true, message: 'Please enter your phone' },
                {
                  validator: (_, value) => {
                    if (value && /^[0-9]+$/.test(value)) {
                      return Promise.reject(new Error('Only digits are allowed'))
                    }
                    if (value && !/^\d{10}$/.test(value)) {
                      return Promise.reject(new Error('Phone number must be exactly 10 digits'))
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <Input maxLength={10} placeholder="Enter phone number" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ type: 'email', required: true, message: 'Enter a valid email' }]}
            >
              <Input placeholder="Enter your email" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="State"
              name="state"
              rules={[{ required: true, message: 'State is mandatory' }]}
            >
              <Select placeholder="Select State" showSearch optionFilterProp="children">
                {statesList.map((state) => (
                  <Select.Option value={state?.stateId} key={state?.stateId}>
                    {state.stateName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="City"
              name="city"
              rules={[{ required: true, message: 'State is mandatory' }]}
            >
              <Select placeholder="Select City" showSearch optionFilterProp="children">
                {statesList.map((state) => (
                  <Select.Option value={state?.stateId} key={state?.stateId}>
                    {state.stateName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Current Company" name="previousCompany">
              <Input placeholder="Enter current company" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Current Designation" name="previousDesignation">
              <Input placeholder="Enter current designation" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Current Salary"
              name="previousSalary"
              rules={[
                { required: true, message: 'Please enter current salary' },
                {
                  validator: (_, value) => {
                    // If the field is empty, skip this validator (let 'required' handle it)
                    if (!value) {
                      return Promise.resolve() // Let the 'required' rule trigger instead
                    }

                    if (!/^\d+$/.test(value)) {
                      return Promise.reject('Only digits are allowed')
                    }

                    if (Number(value) < 0) {
                      return Promise.reject('Value cannot be negative')
                    }

                    return Promise.resolve()
                  },
                },
              ]}
            >
              <Input placeholder="Enter Current salary" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Total Experience (Years)"
              name="totalExperience"
              rules={[
                { required: true, message: 'Please enter total experience' },
                {
                  validator: (_, value) => {
                    // If the field is empty, skip this validator (let 'required' handle it)
                    if (!value) {
                      return Promise.resolve() // Let the 'required' rule trigger instead
                    }

                    if (!/^\d+$/.test(value)) {
                      return Promise.reject('Only digits are allowed')
                    }

                    if (Number(value) < 0) {
                      return Promise.reject('Value cannot be negative')
                    }

                    return Promise.resolve()
                  },
                },
              ]}
            >
              <Input placeholder="Etner total experience" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Salary Expectation"
              name="salaryExpectation"
              rules={[
                { required: true, message: 'Please enter salary expectation' },
                {
                  validator: (_, value) => {
                    // If the field is empty, skip this validator (let 'required' handle it)
                    if (!value) {
                      return Promise.resolve() // Let the 'required' rule trigger instead
                    }

                    if (!/^\d+$/.test(value)) {
                      return Promise.reject('Only digits are allowed')
                    }

                    if (Number(value) < 0) {
                      return Promise.reject('Value cannot be negative')
                    }

                    return Promise.resolve()
                  },
                },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={0}
                placeholder="Your salary expectation"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Upload CV / Resume"
              name="resume"
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList}
              rules={[{ required: true, message: 'Upload your CV / Resume' }]}
              style={{ width: '100%' }}
            >
              <Upload beforeUpload={beforeUpload} style={{ width: '100%' }}>
                <Button>Click to Upload</Button>
              </Upload>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Cover Letter / Notes" name="additionalInfo">
              <TextArea rows={4} placeholder="Enter cover letteer" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[
                // { required: true },
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject('It is required to check the condition'),
                },
              ]}
            >
              <Checkbox>
                <span style={{ color: 'red' }}>*</span> By using this form you agree with the
                storage and handling of your data by this website.
              </Checkbox>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Submit
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  )
}

export default AddApplicant
