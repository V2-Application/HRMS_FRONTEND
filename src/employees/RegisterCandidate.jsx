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
  Tabs,
  DatePicker,
  Table,
  message,
  Modal,
  Checkbox,
  List,
} from 'antd'
import {
  PlusOutlined,
  RollbackOutlined,
  UploadOutlined,
  EyeOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import './employee.css'
import dayjs from 'dayjs'
import { Alert } from 'antd'
import profile_pic from '../assets/images/profile_pic.jpg'
import TextArea from 'antd/es/input/TextArea'
import { getDropdownLocDesDep } from '../services/Services'

const layout = { labelCol: { span: 24 }, wrapperCol: { span: 24 } }

const validateMessages = {
  required: '${label} is required!',
  types: {
    email: '${label} is not a valid email!',
    number: '${label} must be a number!',
  },
  number: {
    min: '${label} must be at least ${min}',
    max: '${label} cannot exceed ${max}',
  },
}

const RegisterCandidate = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const role = localStorage.getItem('role')
  const username = localStorage.getItem('username')
  const token = localStorage.getItem('token')
  const [imageValue, setImageValue] = useState([])
  const [loading, setLoading] = useState(false)
  const params = useParams()
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const [experienceData, setExperienceData] = useState([])
  const [familyMemberdataSource, setFamilyMemberDataSource] = useState([])
  const [qualificationData, setQualificationData] = useState([])
  const [initiateModalOpen, setInitiateModalOpen] = useState(false)
  const [remarks, setRemarks] = useState('')
  const [designations, setDesignations] = useState([])
  const [departments, setDepartments] = useState([{ value: '', label: '' }])
  const [locations, setLocations] = useState([])
  const [fileLists, setFileLists] = useState({})
  const [statusId, setStatusId] = useState(0)
  const [applicantCode, setApplicantCode] = useState('')
  const [activeTab, setActiveTab] = useState('1') // Track active tab index
  const [profilePhoto, setProfilePhoto] = useState([])

  const totalTabs = 5 // Total number of tabs

  const validateTabFields = {
    1: [
      ['user', 'title'],
      ['user', 'firstName'],
      ['user', 'dob'],
      ['user', 'gender'],
      ['user', 'joiningDate'],
      ['user', 'designation'],
      ['user', 'fathersName'],
      ['user', 'department'],
      ['user', 'mothersName'],
      ['user', 'location'],
      ['user', 'grossSalary'],
      ['user', 'aadharNo'],
      ['user', 'nameOnAadhar'],
      ['user', 'permanentAddress'],
      ['user', 'permanentAddressPinCode'],
      ['user', 'presentAddress'],
      ['user', 'presentAddressPinCode'],
    ],
    2: [
      ['user', 'maritalStatus'],
      ['user', 'mobile'],
      ['user', 'isRelativeInCompany'],
      ['user', 'emailAddress'],
    ],
    // Define tabs 3, 4, 5 if needed...
  }

  const handleTabChange = async (newActiveKey) => {
    try {
      // Validate fields for the current tab; if validation fails, this throws an error.
      await form.validateFields(validateTabFields[activeTab])
      // If successful, move to the next tab (if available)
      setActiveTab(newActiveKey)
    } catch (errorInfo) {
      console.error('Validation failed:', errorInfo)
      messageApi.error(`Please fill all required fields in tab ${activeTab}.`)
    }
  }

  const handleNext = async () => {
    try {
      // Validate fields for the current tab; if validation fails, this throws an error.
      await form.validateFields(validateTabFields[activeTab])
      // If successful, move to the next tab (if available)
      setActiveTab((prev) => (Number(prev) < totalTabs ? String(Number(prev) + 1) : prev))
    } catch (errorInfo) {
      console.error('Validation failed:', errorInfo)
      messageApi.error(`Please fill all required fields in tab ${activeTab}.`)
    }
  }

  const handleBack = () => {
    setActiveTab((prev) => (Number(prev) > 1 ? String(Number(prev) - 1) : prev))
  }

  const locat = useLocation()
  const loc = locat.pathname

  const attachmentLabels = [
    { value: 'Pan', lable: 'PAN Card Attachment', maxCount: 3 },
    { value: 'Aadhar', lable: 'Aadhar Card Attachment', maxCount: 3 },
    { value: 'SalarySlip', lable: 'Salary Slip Attachment', maxCount: 3 },
    { value: 'BankPassbook', lable: 'Passbook Attachment', maxCount: 3 },
    { value: 'BankStatement', lable: 'Bank Statement', maxCount: 3 },
    { value: 'PrevOfferLetter', lable: 'Prv Company Offer Letter', maxCount: 1 },
    { value: 'Education', lable: 'Education Attachment', maxCount: 10 },
  ]

  const attachmentKeyToFlagMap = {
    Pan: 'isPanAttachmentUploaded',
    Aadhar: 'isAadharAttachmentUploaded',
    SalarySlip: 'isSalarySlipUploaded',
    BankPassbook: 'isBankPassbookAttachmentUploaded',
    BankStatement: 'isBankStatementUploaded',
    PrevOfferLetter: 'isPrevOfferLetterUploaded',
    Education: 'isEducationAttachmentUploaded',
    PassportPhoto: 'isPassportPhotoUploaded',
  }

  // const old_attach = {
  //   Pan: [
  //     {
  //       uid: '1',
  //       name: 'pan_card.pdf',
  //       status: 'done',
  //       url: 'https://example.com/pan_card.pdf',
  //     },
  //   ],
  //   Aadhar: [
  //     {
  //       uid: '2',
  //       name: 'aadhar_front.jpg',
  //       status: 'done',
  //       url: 'https://example.com/aadhar_front.jpg',
  //     },
  //     {
  //       uid: '3',
  //       name: 'aadhar_back.jpg',
  //       status: 'done',
  //       url: 'https://example.com/aadhar_back.jpg',
  //     },
  //   ],
  //   SalarySlip: [
  //     {
  //       uid: '4',
  //       name: 'salary_march.pdf',
  //       status: 'done',
  //       url: 'https://example.com/salary_march.pdf',
  //     },
  //   ],
  //   BankPassbook: [
  //     {
  //       uid: '5',
  //       name: 'passbook.jpg',
  //       status: 'done',
  //       url: 'https://example.com/passbook.jpg',
  //     },
  //   ],
  //   BankStatement: [
  //     {
  //       uid: '6',
  //       name: 'bank_statement_apr.pdf',
  //       status: 'done',
  //       url: 'https://example.com/bank_statement_apr.pdf',
  //     },
  //   ],
  //   PrevOfferLetter: [
  //     {
  //       uid: '7',
  //       name: 'offer_letter.pdf',
  //       status: 'done',
  //       url: 'https://example.com/offer_letter.pdf',
  //     },
  //   ],
  //   Education: [
  //     {
  //       uid: '8',
  //       name: 'degree_certificate.pdf',
  //       status: 'done',
  //       url: 'https://example.com/degree_certificate.pdf',
  //     },
  //     {
  //       uid: '9',
  //       name: 'marksheet.pdf',
  //       status: 'done',
  //       url: 'https://example.com/marksheet.pdf',
  //     },
  //   ],
  // }

  // useEffect(() => {
  //   setFileLists(old_attach)
  // }, [])

  const handleGoBack = () => {
    switch (pathname) {
      case '/register':
        navigate('/login')
        break
      case `/employee/add_new/${params.id}`:
        navigate('/candidate/form_list')
        break
      case '/employee/add_new':
        navigate('/candidate/form_list')
    }
  }

  const beforeUpload = (file) => {
    // console.log('File upload is stopped:', file)
    return false // Stops the upload
  }

  const fetchDropdowns = async () => {
    try {
      const response = await getDropdownLocDesDep(dropdowns.join(', '))

      if (response.status === 200) {
        let deptArr = response.data?.data?.Department
        const desgArr = response.data?.data?.Designation
        const locArr = response.data?.data?.Location
        
        setDepartments(deptArr)
        setDesignations(desgArr)
        setLocations(locArr)
      }
    } catch (error) {
      console.error('dropdowns api error:', error)
    }
  }

  useEffect(() => {
    fetchDropdowns()
  }, [])

  // const handleUploadChanges = (index, info) => {
  //   const { fileList } = info
  //   setFileLists((prev) => ({
  //     ...prev,
  //     [index]: fileList,
  //   }))
  // }

  const handleUploadChanges = (documentType, info) => {
    const { fileList } = info
    // Optionally, add or update a documentType field on each file (if needed)
    const updatedFiles = fileList.map((file) => ({
      ...file,
      documentType,
    }))

    setFileLists((prev) => ({
      ...prev,
      [documentType]: [...updatedFiles],
    }))
  }

  const dropdowns = ['department', 'designation', 'location']
  const districts = ['Delhi', 'Mumbai', 'Kolkata', 'Chennai']

  const handleUploadChange = ({ fileList }) => {
    setImageValue(fileList)
  }

  useEffect(() => {
    if (params.id) fetchData()
  }, [params.id])

  const success = (data) => {
    messageApi.open({
      type: 'success',
      content: data,
    })
  }
  const message_error = (data) => {
    messageApi.open({
      type: 'error',
      content: data,
    })
  }
  const warning = (data) => {
    messageApi.open({
      type: 'warning',
      content: data,
    })
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `https://v2parivar.v2retail.com:9987/api/Candidate/GetCandidateDetails?candidateid=${params.id}`,
        { headers: { Authorization: `Bearer ${token}`, accept: '*/*' } },
      )
      // console.log('fetch api res:', response)

      const attachdocuments = response?.data?.data?.documents || []
      const apiData = response?.data?.data?.candidateInfo || {}
      const educationDatas = response?.data?.data?.qualificationList?.map((item) => ({
        ...item,
        key: new Date(),
      }))

      const experienceDatas = response?.data?.data?.experienceList?.map((item) => ({
        ...item,
        key: Math.random(),
      }))

      const familyDatas = response?.data?.data?.familyMembersList?.map((item) => ({
        ...item,
        key: new Date(),
      }))

      const passportPhoto = attachdocuments.filter((doc) => doc.documentType === 'PassportPhoto')
      setProfilePhoto(passportPhoto)

      setStatusId(apiData?.statusId)
      setApplicantCode(apiData?.applicantCode)

      const new_res = {
        title: apiData?.title || '',
        reference: apiData?.reference || '',
        designation: parseInt(apiData?.designation) || '',
        //department : { value: apiData?.department, label: "LEGAL" },
        department: parseInt(apiData?.department) || '',
        // department : await findDepartmentNameById(apiData?.department),
        // location: await findLocationNameById(apiData?.location),
        firstName: apiData?.firstName || '',
        middleName: apiData?.middleName || '',
        lastName: apiData?.lastName || '',
        husbandName: apiData?.husbandName || '',
        fathersName: apiData?.fathersName || '',
        mothersName: apiData?.mothersName || '',
        fullName: apiData?.fullName || '',
        dob: apiData?.dob || '',
        gender: apiData?.gender || '',
        joiningDate: apiData?.joiningDate || '',
        weeklyOff: apiData?.weeklyOff || '',
        statusId: apiData?.statusId || '',
        location: parseInt(apiData?.location) || '',
        uanNo: apiData?.uanNo || '',
        panNo: apiData?.panNo || '',
        empCode: apiData?.empCode || '',
        permanentAddress: apiData?.permanentAddress || '',
        permanentAddressPinCode: apiData?.permanentAddressPinCode || '', // Corrected key
        grossSalary: apiData?.grossSalary || '',
        aadharNo: apiData?.aadharNo || '',
        nameOnAadhar: apiData?.nameOnAadhar || '',
        applicantCode: apiData?.applicantCode || '',
        presentAddress: apiData?.presentAddress || '',
        presentAddressPinCode: apiData?.presentAddressPinCode || '', // Corrected key
        maritalStatus: apiData?.maritalStatus || '',
        mobile: apiData?.mobile || '',
        emailAddress: apiData?.emailAddress || '', // Corrected key
        isRelativeInCompany: apiData?.isRelativeInCompany || '', // Corrected key
        nationality: apiData?.nationality || '',
        religion: apiData?.religion || '',
        bankName: apiData?.bankName || '',
        accountNo: apiData?.accountNo || '', // Corrected key
        bankIfscCode: apiData?.bankIfscCode || '', // Corrected key
        beneficiaryAddress: apiData?.beneficiaryAddress || '',
        // prevEstNo: apiData?.prevEstNo || '',
        prevEstNo: apiData?.prevEstNo || '', // Corrected key
        placeOfBirth: apiData?.placeOfBirth || '',
      }

      // const transformedData = {}
      // attachdocuments.forEach((item) => {
      //   transformedData[item.documentType] = [
      //     {
      //       uid: item.documentType,
      //       name: item.documentType,
      //       status: 'done',
      //       url: `https://v2parivar.v2retail.com:9987/${item.filePath}`,
      //     },
      //   ]
      // })

      const groupedDocuments = attachdocuments.reduce((acc, doc) => {
        const documentType = doc.documentType
        if (!acc[documentType]) {
          acc[documentType] = []
        }
        acc[documentType].push(doc)
        return acc
      }, {})
      setFileLists(groupedDocuments)
      // setFileLists(attachdocuments)

      const formattedDatas = {
        ...new_res,
        dob: new_res.dob ? dayjs(new_res.dob, 'YYYY-MM-DD') : null,
        joiningDate: new_res.joiningDate ? dayjs(new_res.joiningDate, 'YYYY-MM-DD') : null,
      }

      form.setFieldsValue({ user: formattedDatas })

      setFamilyMemberDataSource(familyDatas)
      setExperienceData(experienceDatas)
      setQualificationData(educationDatas)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  const onFinishFailed = ({ errorFields }) => {
    if (errorFields && errorFields.length > 0) {
      message_error('Required fields missing!')
      // Scrolls to the first error field automatically (if scrollToFirstError is set)
      // Now, attempt to focus the input of the first error field.
      const firstErrorFieldName = errorFields[0].name
      const fieldInstance = form.getFieldInstance(firstErrorFieldName)
      if (fieldInstance && fieldInstance.focus) {
        // Delay a bit to ensure scrolling is complete.
        setTimeout(() => {
          fieldInstance.focus()
        }, 100)
      }
    }
  }

  const onFinish = async (values) => {
    const token = localStorage.getItem('token')
    // console.log('>>>>>vlaues-----', values)

    const ab = values?.user
    if (ab) {
      ab.statusId = '4'
    }
    // console.log('Received values actual:', ab, 'length', ab.length)

    const ef = new FormData()
    if (params.id) {
      ef.append('id', params.id)
    }

    Object.keys(ab).forEach((key) => {
      ef.append(key, ab[key])
    })

    ef.append('familyMembersList', JSON.stringify(familyMemberdataSource))
    ef.append('FamilyMembersListJson', JSON.stringify(familyMemberdataSource))
    ef.append('experienceList', JSON.stringify(experienceData))
    ef.append('ExperienceListJson', JSON.stringify(experienceData))
    ef.append('qualificationList', JSON.stringify(qualificationData))
    ef.append('QualificationListJson', JSON.stringify(qualificationData))

    // Object.keys(fileLists).forEach((key) => {
    //   fileLists[key].forEach((file) => {
    //     ef.append(key, file.originFileObj)
    //     ef.append(`${key}_status`, "true")  // Use the same key as the form field
    //   })

    // })
    // console.log('filelists', fileLists)
    const attachmentKeyToUploadMapping = {
      Pan: 'PanAttachment',
      Aadhar: 'AadharAttachment',
      SalarySlip: 'Last3SalarySlip',
      BankPassbook: 'BankPassbookAttachment',
      BankStatement: 'Last3BankStatement',
      PrevOfferLetter: 'PrevOfferLetter',
      Education: 'EducationAttachment',
      PassportPhoto: 'PassportPhoto',
    }

    // for (const category in fileLists) {
    //   const fileList = fileLists[category]
    //   const fileKey = attachmentKeyToUploadMapping[category] || category

    //   fileList.forEach((file, index) => {
    //     ef.append(fileKey, JSON.stringify(file))
    //     // console.log(`filekey: ${fileKey} and file: ${JSON.stringify(file)}\n`)
    //   })
    //   ef.append(`${attachmentKeyToFlagMap[category]}`, true)
    // }

    for (const category in fileLists) {
      const fileList = fileLists[category]
      const fileKey = attachmentKeyToUploadMapping[category] || category

      fileList.forEach((file) => {
        ef.append(fileKey, file.originFileObj) // Append the actual file object
      })

      ef.append(`${attachmentKeyToFlagMap[category]}`, true)
    }

    // if (profilePhoto && profilePhoto.length > 0) {
    //   ef.append('PassportPhoto', profilePhoto[0].originFileObj)
    // }

    // for (const [key, value] of ef.entries()) {
    //   console.log(key, value)
    // }
    // return
    ef.append('PassportPhoto', profilePhoto[0])

    // console.log('Received values:', ef)

    try {
      const create_url = 'https://v2parivar.v2retail.com:9987/api/Candidate/Insertnewcandidate'
      const update_url = 'https://v2parivar.v2retail.com:9987/api/Candidate/Updatecandidate'
      const url = params.id ? update_url : create_url
      const response = await axios.post(url, ef, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          accept: '*/*',
        },
      })

      // console.log('updated list after post request >>>>>>>>>>>>>>>>...', response)
      success(params.id ? 'Updated Successfully' : 'Created Successfully')
      navigate('/candidate/form_list')
    } catch (error) {
      message_error('Updated Failed')
    }
  }

  const addRowExperienceData = () => {
    setExperienceData([
      ...experienceData,
      {
        key: Date.now(),
        nameOfCompany: '',
        workLocation: '',
        positionHeld: '',
        from: new Date(Date.now()).toISOString(),
        to: new Date(Date.now()).toISOString(),
        lastCtc: '',
      },
    ])
  }

  const addRowFamilyData = () => {
    setFamilyMemberDataSource([
      ...familyMemberdataSource,
      {
        key: new Date(Date.now()).toISOString(),
        familyMemberName: '',
        relation: '',
        dob: new Date(Date.now()).toISOString(),
      },
    ])
  }

  const addRowQualificationData = () => {
    setQualificationData([
      ...qualificationData,
      { key: Date.now(), education: '', yop: '', grade: '', type: '' },
    ])
  }

  const handleInputChange = (id, field, value) => {
    const newData = experienceData.map((item) => {
      if (item.key === id) {
        return { ...item, [field]: value }
      }
      return item
    })
    setExperienceData(newData)
  }

  const handleFamilyInputChange = (id, field, value) => {
    const newData = familyMemberdataSource.map((item) => {
      if (item.key === id) {
        return { ...item, [field]: value }
      }
      return item
    })
    setFamilyMemberDataSource(newData)
  }

  const handleChange = (field, value, record) => {
    const newData = qualificationData.map((item) => {
      if (item.key === record.key) {
        return { ...item, [field]: value }
      }
      return item
    })
    setQualificationData(newData)
  }

  const handleInitializeCandidate = async (type) => {
    let currRemarks = remarks[parseInt(selectedCandidateId)] || ''

    if (!currRemarks?.trim()) {
      toast.error('Remarks is mandatory!')
      return
    }
    try {
      setLoading(true)
      const requestBody = {
        candidateId: params.id,
        hrApprovalStatus: role === 'HR' ? (type === 'reject' ? 'Rejected' : 'Approved') : '',
        hrReviewedBy: role === 'HR' && currRemarks?.trim() + ` - by ${username}`,
        auditReviewedBy: role === 'AUDIT' && currRemarks?.trim() + ` - by ${username}`,
        auditApprovalStatus: role === 'AUDIT' ? (type === 'reject' ? 'Rejected' : 'Approved') : '',
      }
      // console.log('requestbody', requestBody)

      const token = localStorage.getItem('token')

      const response = await axios.post(
        'https://v2parivar.v2retail.com:9987/api/Candidate/CandidateApproval',
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: '*/*',
          },
        },
      )

      // console.log('response initialise:', response)

      if (response?.data?.status === true) {
        setLoading(false)
        setInitiateModalOpen(false)
        toast.success(response?.data || 'Initialized successfully!')
        setRemarks('')
      } else {
        setInitiateModalOpen(false)
        toast.error(response?.data || 'Could not initialize!')
      }
    } catch (error) {
      setRemarks((prev) => ({
        ...prev,
        [parseInt(selectedCandidateId)]: '',
      }))
      setLoading(false)
      toast.error(error.response?.data?.message || 'Could not initialize!')
      setInitiateModalOpen(false)
      console.error('Error fetching data:', error)
    }
  }

  const handleRemove = (file) => {
    setImageValue((prev) => prev.filter((item) => item.uid !== file.uid))
  }

  return (
    <>
      <Spin spinning={loading}>
        {contextHolder}
        <Card className="custom-card" style={{ minHeight: '100vh', position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              position: 'absolute',
              top: '15px',
              right: '20px',
              gap: '2rem',
              alignItems: 'center',
            }}
          >
            {loc !== '/register' && loc !== '/employee/add_new' && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span>
                  <b>Status:</b> {statusId == 4 && 'Pending'}
                </span>
                <span>
                  <b>Application Code:</b> {applicantCode}
                </span>
              </div>
            )}
          </div>
          <Button
            type="primary"
            shape="circle"
            icon={<RollbackOutlined />}
            size={'middle'}
            onClick={handleGoBack}
            style={{ position: 'absolute', top: '15px', left: '20px' }}
          />
          <Form
            form={form}
            onFinishFailed={onFinishFailed}
            {...layout}
            name="user-form"
            onFinish={onFinish}
            validateMessages={validateMessages}
            layout="vertical"
          >
            <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={handleTabChange}>
              <Tabs.TabPane tab="General" key="1">
                <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      label="Profile Photo"
                      valuePropName="fileList"
                      getValueFromEvent={(e) => e?.fileList}
                      labelCol={{ span: 24 }}
                      // rules={[{ required: true, message: 'Profile photo is required' }]}
                      style={{ textAlign: 'center' }}
                    >
                      <Upload
                        className="custom profile-photo"
                        listType="picture-card"
                        maxCount={1}
                        fileList={imageValue || []}
                        onChange={handleUploadChange}
                        beforeUpload={beforeUpload}
                        showUploadList={false}
                        onRemove={handleRemove}
                      >
                        {profilePhoto && profilePhoto.length >= 1 ? (
                          <div
                            className="profile_img"
                            style={{ position: 'relative', overflow: 'hidden' }}
                          >
                            <img
                              src={
                                imageValue[0]?.filePath
                                  ? `https://v2parivar.v2retail.com:9987/${imageValue[0]?.filePath}`
                                  : imageValue[0]?.thumbUrl ||
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
                            {/* Overlay edit icon */}
                            <div
                              style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                bottom: 0,
                                left: 0,
                                background: 'rgba(0, 0, 0, 0.3)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                transition: 'opacity 0.3s',
                                cursor: 'pointer',
                              }}
                              className="upload-overlay"
                            >
                              <PlusOutlined style={{ color: '#fff', fontSize: '24px' }} />
                            </div>
                          </div>
                        ) : (
                          <button type="button" className="upload-button">
                            <PlusOutlined /> Upload
                          </button>
                        )}
                      </Upload>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'firstName']}
                      label="First Name"
                      rules={[{ required: true, message: 'First name is required' }]}
                    >
                      <Input />
                    </Form.Item> */}
                    {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'lastName']}
                      label="Last Name"
                    >
                      <Input />
                    </Form.Item> */}
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'title']}
                      label="Title"
                      rules={[
                        { required: true },
                        {
                          validator: (_, value) =>
                            value === 'none'
                              ? Promise.reject(new Error('Please select a valid title'))
                              : Promise.resolve(),
                        },
                      ]}
                    >
                      <Select>
                        <Select.Option value="none">Select</Select.Option>
                        <Select.Option value="Mr">Mr</Select.Option>
                        <Select.Option value="Ms">Ms</Select.Option>
                        <Select.Option value="Mrs">Mrs</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'dob']}
                      label="Date of Birth"
                      rules={[{ required: true, message: 'Date of birth is required' }]}
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'fathersName']}
                      label="Father's Name"
                      rules={[{ required: true, message: 'Father name is required' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'middleName']}
                      label="Middle Name"
                    >
                      <Input />
                    </Form.Item> */}
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'fullName']}
                      label="Full Name"
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'gender']}
                      label="Gender"
                      rules={[
                        { required: true, message: 'Gender is required' },
                        {
                          validator: (_, value) =>
                            value === 'none'
                              ? Promise.reject(new Error('Please select a valid gender'))
                              : Promise.resolve(),
                        },
                      ]}
                    >
                      <Select>
                        <Select.Option value="none">Select</Select.Option>
                        <Select.Option value="Male">Male</Select.Option>
                        <Select.Option value="Female">Female</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'mothersName']}
                      label="Mother's Name"
                      rules={[{ required: true, message: 'Mother name is required' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                  <Col xs={24} sm={12} md={8}>
                    {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'title']}
                      label="Title"
                      rules={[
                        { required: true },
                        {
                          validator: (_, value) =>
                            value === 'none'
                              ? Promise.reject(new Error('Please select a valid title'))
                              : Promise.resolve(),
                        },
                      ]}
                    >
                      <Select>
                        <Select.Option value="none">Select</Select.Option>
                        <Select.Option value="Mr">Mr</Select.Option>
                        <Select.Option value="Ms">Ms</Select.Option>
                        <Select.Option value="Mrs">Mrs</Select.Option>
                      </Select>
                    </Form.Item> */}
                    {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'fathersName']}
                      label="Father's Name"
                      rules={[{ required: true, message: 'Father name is required' }]}
                    >
                      <Input />
                    </Form.Item> */}

                    {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'designation']}
                      label="Designation"
                      rules={[
                        { required: true, message: 'Designation is required' },
                        {
                          validator: (_, value) =>
                            value === 'none'
                              ? Promise.reject(new Error('Please select a valid designation'))
                              : Promise.resolve(),
                        },
                      ]}
                    >
                      <Select showSearch optionFilterProp="children">
                        <Select.Option value="none">Select designation</Select.Option>
                        {designations.map((desg) => (
                          <Select.Option value={desg.designationId} key={desg.designationId}>
                            {desg.designationName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item> */}

                    {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'department']}
                      label="Department"
                      rules={[
                        { required: true, message: 'Department is required' },
                        {
                          validator: (_, value) =>
                            value === 'none'
                              ? Promise.reject(new Error('Please select a valid designation'))
                              : Promise.resolve(),
                        },
                      ]}
                    >
                      <Select showSearch optionFilterProp="children">
                        <Select.Option value="none" data-id={null}>
                          Select department
                        </Select.Option>
                        {departments.map((dept) => (
                          <Select.Option value={dept.departmentId} key={dept.departmentId}>
                            {dept.departmentName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item> */}
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'husbandName']}
                      label="Husband's Name"
                    >
                      <Input />
                    </Form.Item> */}
                    {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'fathersName']}
                      label="Father's Name"
                      rules={[{ required: true, message: 'Father name is required' }]}
                    >
                      <Input />
                    </Form.Item> */}
                    {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'mothersName']}
                      label="Mother's Name"
                      rules={[{ required: true, message: 'Mother name is required' }]}
                    >
                      <Input />
                    </Form.Item> */}
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'joiningDate']}
                      label="Joining Date"
                      rules={[{ required: true }]}
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item> */}
                    {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'placeOfBirth']}
                      label="Place of Birth"
                    >
                      <Input />
                    </Form.Item> */}
                    {/* {loc !== '/register' && (
                      <Form.Item
                        labelCol={{ span: 24 }}
                        name={['user', 'empCode']}
                        label="Emp. Code"
                      >
                        <Input disabled />
                      </Form.Item>
                    )} */}
                    {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'designation']}
                      label="Designation"
                      rules={[
                        { required: true, message: 'Designation is required' },
                        {
                          validator: (_, value) =>
                            value === 'none'
                              ? Promise.reject(new Error('Please select a valid designation'))
                              : Promise.resolve(),
                        },
                      ]}
                    >
                      <Select showSearch optionFilterProp="children">
                        <Select.Option value="none">Select designation</Select.Option>
                        {designations.map((desg) => (
                          <Select.Option value={desg.designationId} key={desg.designationId}>
                            {desg.designationName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item> */}
                  </Col>
                </Row>

                <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                  <Col xs={24} sm={12} md={8}>
                    {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'location']}
                      label="Location"
                      rules={[
                        { required: true, message: 'Location is required' },
                        {
                          validator: (_, value) =>
                            value === 'none'
                              ? Promise.reject(new Error('Please select a valid location'))
                              : Promise.resolve(),
                        },
                      ]}
                    >
                      <Select showSearch optionFilterProp="children">
                        <Select.Option value="none">Select Location</Select.Option>
                        {locations.map((loc) => (
                          <Select.Option value={loc.locationId} key={loc.locationId}>
                            {loc.locationName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item> */}

                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'panNo']}
                      label="PAN No."
                      rules={[
                        {
                          pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                          message: 'Enter a valid PAN number (e.g., ABCDE1234F)',
                        },
                      ]}
                    >
                      <Input maxLength={10} style={{ textTransform: 'uppercase' }} />
                    </Form.Item>

                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'presentAddress']}
                      label="Present Address"
                      rules={[{ required: true, message: 'Present address is required' }]}
                    >
                      <Input.TextArea rows={5} />
                    </Form.Item>

                    {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'presentAddressPinCode']}
                      label="Present Address Pin Code"
                      rules={[
                        { required: true, message: 'Present address pin code is required' },
                        { pattern: /^[1-9][0-9]{5}$/, message: 'Enter a valid 6-digit pin code' },
                      ]}
                    >
                      <Input maxLength={6} />
                    </Form.Item> */}
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'grossSalary']}
                      label="In-hand Salary"
                      rules={[
                        { required: true, message: 'Gross salary is required' },
                        { pattern: /^\d+(\.\d+)?$/, message: 'Enter a valid decimal number' },
                      ]}
                    >
                      <Input />
                    </Form.Item>

                    <Checkbox
                      onChange={(e) => {
                        if (e.target.checked) {
                          form.setFieldsValue({
                            user: {
                              permanentAddress: form.getFieldValue(['user', 'presentAddress']),
                              permanentAddressPinCode: form.getFieldValue([
                                'user',
                                'presentAddressPinCode',
                              ]),
                            },
                          })
                        } else {
                          form.setFieldsValue({
                            user: {
                              permanentAddress: '',
                              permanentAddressPinCode: '',
                            },
                          })
                        }
                      }}
                      style={{
                        fontSize: '0.4rem',
                        position: 'absolute',
                        top: '10.3rem',
                        left: '9rem',
                      }}
                    >
                      Same as Present Address
                    </Checkbox>

                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'permanentAddress']}
                      label="Permanent Address"
                      rules={[{ required: true, message: 'Permanent address is required' }]}
                    >
                      <Input.TextArea rows={5} />
                    </Form.Item>
                    {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'permanentAddressPinCode']}
                      label="Permanent Address Pin Code"
                      rules={[
                        { required: true, message: 'Permanent address pin code is required' },
                        { pattern: /^[1-9][0-9]{5}$/, message: 'Enter a valid 6-digit pin code' },
                      ]}
                    >
                      <Input maxLength={6} />
                    </Form.Item> */}
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'uanNo']}
                      label="UAN No."
                      rules={[
                        {
                          pattern: /^[0-9]{12}$/,
                          message: 'UAN number must be exactly 12 digits',
                        },
                      ]}
                    >
                      <Input maxLength={12} />
                    </Form.Item> */}
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'nameOnAadhar']}
                      label="Name on Aadhar"
                      rules={[{ required: true, message: 'Name on aadhaar is required' }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'aadharNo']}
                      label="Aadhar No."
                      rules={[
                        { required: true, message: 'Aadhar No. is required' },
                        {
                          pattern: /^[2-9]\d{11}$/,
                          message:
                            'Enter a valid 12-digit Aadhaar number and must not start with 0 or 1',
                        },
                      ]}
                    >
                      <Input maxLength={12} />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'designation']}
                      label="Designation"
                      rules={[
                        { required: true, message: 'Designation is required' },
                        {
                          validator: (_, value) =>
                            value === 'none'
                              ? Promise.reject(new Error('Please select a valid designation'))
                              : Promise.resolve(),
                        },
                      ]}
                    >
                      <Select showSearch optionFilterProp="children">
                        <Select.Option value="none">Select designation</Select.Option>
                        {designations.map((desg) => (
                          <Select.Option value={desg.designationId} key={desg.designationId}>
                            {desg.designationName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Tabs.TabPane>

              <Tabs.TabPane tab="Personal" key="2">
                <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'maritalStatus']}
                      label="Marital Status"
                      rules={[{ required: true, message: 'Marital status is required' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name={['user', 'mobile']}
                      label="Mobile"
                      labelCol={{ span: 24 }}
                      rules={[
                        {
                          required: true,
                          pattern: /^[0-9]{10}$/,
                          message: 'Enter a valid 10-digit number',
                        },
                      ]}
                    >
                      <Input maxLength={10} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'emailAddress']}
                      label="Email Id"
                      rules={[{ type: 'email', message: 'Enter a valid email', required: true }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'isRelativeInCompany']}
                      label="Relative in Company"
                      rules={[{ required: true, message: 'Relative Company is Required' }]}
                    >
                      <Select>
                        <Select.Option value={true}>Yes</Select.Option>
                        <Select.Option value={false}>No</Select.Option>
                      </Select>
                    </Form.Item> */}
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'reference']}
                      label="Reference"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'nationality']}
                      label="Nationality"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item labelCol={{ span: 24 }} name={['user', 'religion']} label="Religion">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'bankName']}
                      label="Bank Name"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'accountNo']}
                      label="A/c No."
                      rules={[
                        {
                          pattern: /^\d{9,18}$/,
                          message: 'Account number should be between 9 and 18 digits',
                        },
                      ]}
                    >
                      <Input maxLength={18} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'bankIfscCode']}
                      label="Bank IFSC Code"
                      rules={[
                        {
                          pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                          message: 'Invalid IFSC code. Format: ABCD0XXXXXX',
                        },
                      ]}
                    >
                      <Input maxLength={11} style={{ textTransform: 'uppercase' }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'beneficiaryAddress']}
                      label="Beneficiary Address"
                    >
                      <Select placeholder="Select District">
                        {districts.map((d) => (
                          <Select.Option key={d} value={d}>
                            {d}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'prevEstNo']}
                      label="Previous ESI No."
                      
                    >
                      <Input maxLength={10} />
                    </Form.Item> */}
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'reference']}
                      label="Reference"
                    >
                      <Input />
                    </Form.Item> */}
                  </Col>
                </Row>
                <Form.Item labelCol={{ span: 24 }} label="Family Member Detail">
                  <Table
                    dataSource={familyMemberdataSource}
                    columns={[
                      {
                        title: 'Family Member Name',
                        dataIndex: 'familyMemberName',
                        key: 'familyMemberName',
                        render: (text, record) => (
                          <Input
                            value={text}
                            onChange={(e) =>
                              handleFamilyInputChange(
                                record.key,
                                'familyMemberName',
                                e.target.value,
                              )
                            }
                          />
                        ),
                      },
                      {
                        title: 'Relation',
                        dataIndex: 'relation',
                        key: 'relation',
                        render: (text, record) => (
                          <Input
                            value={text}
                            onChange={(e) =>
                              handleFamilyInputChange(record.key, 'relation', e.target.value)
                            }
                          />
                        ),
                      },
                      {
                        title: 'DOB',
                        dataIndex: 'dob',
                        key: 'dob',
                        render: (text, record) => (
                          <DatePicker
                            format="DD-MM-YYYY"
                            value={text ? dayjs(text, 'YYYY-MM-DDTHH:mm:ss') : null}
                            onChange={(date) =>
                              handleFamilyInputChange(
                                record.key,
                                'dob',
                                date ? date.format('YYYY-MM-DDTHH:mm:ss') : null,
                              )
                            }
                          />
                        ),
                      },
                    ]}
                    pagination={false}
                  />
                  <Button type="dashed" onClick={addRowFamilyData} style={{ marginTop: 10 }}>
                    + Add More
                  </Button>
                </Form.Item>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Experience" key="3">
                <Table
                  columns={[
                    {
                      title: 'Company Name',
                      dataIndex: 'nameOfCompany',
                      key: 'nameOfCompany',
                      render: (text, record) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleInputChange(record.key, 'nameOfCompany', e.target.value)
                          }
                        />
                      ),
                    },
                    {
                      title: 'Work Location',
                      dataIndex: 'workLocation',
                      key: 'workLocation',
                      render: (text, record) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleInputChange(record.key, 'workLocation', e.target.value)
                          }
                        />
                      ),
                    },
                    {
                      title: 'Position',
                      dataIndex: 'positionHeld',
                      key: 'positionHeld',
                      render: (text, record) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleInputChange(record.key, 'positionHeld', e.target.value)
                          }
                        />
                      ),
                    },
                    {
                      title: 'From',
                      dataIndex: 'from',
                      key: 'from',
                      render: (text, record) => (
                        <DatePicker
                          format="DD-MM-YYYY"
                          value={text ? dayjs(text, 'YYYY-MM-DDTHH:mm:ss') : null}
                          onChange={(date) =>
                            handleInputChange(
                              record.key,
                              'from',
                              date ? date.format('YYYY-MM-DDTHH:mm:ss') : null,
                            )
                          }
                        />
                      ),
                    },
                    {
                      title: 'To',
                      dataIndex: 'to',
                      key: 'to',
                      render: (text, record) => (
                        <DatePicker
                          format="DD-MM-YYYY"
                          value={text ? dayjs(text, 'YYYY-MM-DDTHH:mm:ss') : null}
                          onChange={(date) =>
                            handleInputChange(
                              record.key,
                              'to',
                              date ? date.format('YYYY-MM-DDTHH:mm:ss') : null,
                            )
                          }
                        />
                      ),
                    },
                    {
                      title: 'Last CTC',
                      dataIndex: 'lastCtc',
                      key: 'lastCtc',
                      render: (text, record) => (
                        <InputNumber
                          value={text}
                          onChange={(value) => handleInputChange(record.key, 'lastCtc', value)}
                        />
                      ),
                    },
                  ]}
                  dataSource={experienceData}
                  pagination={false}
                />
                <Button type="dashed" onClick={addRowExperienceData} style={{ marginTop: 10 }}>
                  + Add More
                </Button>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Qualification" key="4">
                <Table
                  columns={[
                    {
                      title: 'Education',
                      dataIndex: 'education',
                      key: 'education',
                      render: (_, record) => (
                        <Select
                          style={{ width: '100%' }}
                          value={record.education}
                          onChange={(value) => handleChange('education', value, record)}
                        >
                          <Select.Option value="B.Tech">B.Tech</Select.Option>
                          <Select.Option value="MBA">MBA</Select.Option>
                          <Select.Option value="AWS Certification">AWS Certification</Select.Option>
                        </Select>
                      ),
                    },
                    {
                      title: 'Year of Passing',
                      dataIndex: 'yop',
                      key: 'yop',
                      render: (_, record) => (
                        <Select
                          style={{ width: '100%' }}
                          value={record.yop}
                          onChange={(value) => handleChange('yop', value, record)}
                        >
                          <Select.Option value="2020">2020</Select.Option>
                          <Select.Option value="2021">2021</Select.Option>
                          <Select.Option value="2022">2022</Select.Option>
                          <Select.Option value="2023">2023</Select.Option>
                        </Select>
                      ),
                    },
                    {
                      title: 'Grade',
                      dataIndex: 'grade',
                      key: 'grade',
                      render: (_, record) => (
                        <Input
                          style={{ width: '100%' }}
                          value={record.grade}
                          onChange={(e) => handleChange('grade', e.target.value, record)}
                        />
                      ),
                    },
                    {
                      title: 'Type',
                      dataIndex: 'type',
                      key: 'type',
                      render: (_, record) => (
                        <Select
                          style={{ width: '100%' }}
                          value={record.type}
                          onChange={(value) => handleChange('type', value, record)}
                        >
                          <Select.Option value="Full-Time">Full-Time</Select.Option>
                          <Select.Option value="Part-Time">Part-Time</Select.Option>
                          <Select.Option value="Online">Online</Select.Option>
                        </Select>
                      ),
                    },
                  ]}
                  dataSource={qualificationData}
                  pagination={false}
                />
                <Button type="dashed" onClick={addRowQualificationData} style={{ marginTop: 10 }}>
                  + Add More
                </Button>
                {/* <Form.Item
                  labelCol={{ span: 24 }}
                  name="technicalCertificate"
                  label="Technical Certificate"
                >
                  <Input.TextArea rows={5} />
                </Form.Item> */}
              </Tabs.TabPane>

              {/* <Tabs.TabPane tab="Attachments" key="5">
                <Row>
                  {attachmentLabels.map((label, index) => (
                    <Col key={index} xs={24} sm={12} md={8} xl={6}>
                      <Form.Item
                        label={label.lable}
                      >
                        <Upload
                          className="attachment-upload"
                          maxCount={label.maxCount}
                          multiple
                          onChange={(info) => handleUploadChanges(label.value, info)}
                          fileList={fileLists[label.value] || []}
                          beforeUpload={beforeUpload}
                        >
                          <Button icon={<UploadOutlined />}>Upload</Button>
                        </Upload>
                      </Form.Item>
                    </Col>
                  ))}
                </Row>
              </Tabs.TabPane> */}

              <Tabs.TabPane tab="Attachments" key="5">
                <div style={{ padding: 20 }}>
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ marginBottom: 4 }}>📎 Document Attachments</h4>
                    <p style={{ color: '#888', fontSize: 14 }}>
                      Upload related documents or images. Each section supports multiple files,
                      limited by type.
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 24,
                      justifyContent: 'flex-start',
                    }}
                  >
                    {/* {attachmentLabels.map((attachment) => {
                      // const currentFileList = fileLists[attachment.value] || []
                      const currentFileList = fileLists.filter(
                        (fileList) => fileList?.documentType === attachment.value,
                      )
                      const isMaxReached = currentFileList.length >= attachment.maxCount

                      return (
                        <div
                          className="upload-card"
                          key={attachment.value}
                          style={{
                            flex: '1 1 250px',
                            maxWidth: 300,
                            border: '1px solid #f0f0f0',
                            borderRadius: 12,
                            padding: 16,
                            background: '#fafafa',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          }}
                        >
                          <h8 style={{ marginBottom: 12 }}>{attachment.lable}</h8>
                          <Upload
                            maxCount={attachment.maxCount}
                            className="custom-upload-attachements"
                            listType="picture-card"
                            multiple
                            onChange={(info) => handleUploadChanges(attachment.value, info)}
                            beforeUpload={() => false}
                            fileList={currentFileList}
                          >
                            {!isMaxReached && (
                              <div style={{ textAlign: 'center' }}>
                                <UploadOutlined style={{ fontSize: 20 }} />
                                <div style={{ fontSize: 12 }}>Upload</div>
                              </div>
                            )}
                          </Upload>
                        </div>
                      )
                    })} */}

                    {attachmentLabels.map((attachment) => {
                      // Access the file list directly by its document type
                      const currentFileList = fileLists[attachment.value] || []
                      const isMaxReached = currentFileList.length >= attachment.maxCount

                      return (
                        <div
                          className="upload-card"
                          key={attachment.value}
                          style={{
                            flex: '1 1 250px',
                            maxWidth: 300,
                            border: '1px solid #f0f0f0',
                            borderRadius: 12,
                            padding: 16,
                            background: '#fafafa',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          }}
                        >
                          <h8 style={{ marginBottom: 12 }}>{attachment.lable}</h8>
                          <Upload
                            maxCount={attachment.maxCount}
                            className="custom-upload-attachements"
                            listType="picture-card"
                            multiple
                            onChange={(info) => handleUploadChanges(attachment.value, info)}
                            beforeUpload={() => false}
                            fileList={currentFileList}
                          >
                            {!isMaxReached && (
                              <div style={{ textAlign: 'center' }}>
                                <UploadOutlined style={{ fontSize: 20 }} />
                                <div style={{ fontSize: 12 }}>Upload</div>
                              </div>
                            )}
                          </Upload>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Tabs.TabPane>
            </Tabs>
            <Row justify="end" style={{ marginTop: 20, gap: '0.6rem' }}>
              {/* {params.id ? (
                <Button type="primary" htmlType="submit">
                  Update
                </Button>
              ) : ( */}
              <>
                <Row style={{ gap: 5 }}>
                  {activeTab > 1 && (
                    <Button type="primary" onClick={handleBack} disabled={activeTab === 0}>
                      Back
                    </Button>
                  )}
                  {activeTab < 5 && (
                    <Button
                      type="primary"
                      onClick={handleNext}
                      disabled={activeTab === totalTabs - 1}
                    >
                      Next
                    </Button>
                  )}
                  {activeTab === '5' && (
                    <Button type="primary" htmlType="submit">
                      {params.id ? 'Update' : 'Submit'}
                    </Button>
                  )}
                  {/* <Button onClick={() => {
                  console.log("test uploaded file list>>>>>>>>>>>", fileLists);
                  console.log("test uploaded image url profile photo>>>>>>>>>>>", imageValue[0]);

                }}>test button </Button> */}
                </Row>
              </>
            </Row>
          </Form>
        </Card>
      </Spin>
      <Modal
        title="Initialize Candidate"
        style={{ top: 100 }}
        open={initiateModalOpen}
        onCancel={() => setInitiateModalOpen(false)}
        footer={[
          <Button
            key="reject"
            onClick={() => handleInitializeCandidate('reject')}
            disabled={loading}
          >
            {loading ? 'Rejectting' : 'Reject'}
          </Button>,
          <Button
            key="approve"
            type="primary"
            onClick={() => handleInitializeCandidate('approve')}
            disabled={loading}
          >
            {loading ? 'Approving' : 'Approve'}
          </Button>,
        ]}
      >
        <TextArea
          rows={4}
          value={remarks || ''}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Enter remarks here..."
        />
      </Modal>
    </>
  )
}

export default RegisterCandidate
