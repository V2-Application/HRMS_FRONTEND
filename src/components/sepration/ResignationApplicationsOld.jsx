import React, { useEffect, useState, useMemo } from 'react'
import { Space, Table, Tag, Row, Input, Tooltip, Button, message, Tabs, Col, Card } from 'antd'
import {
  ImportOutlined,
  ExportOutlined,
  UserSwitchOutlined,
  EditOutlined,
  StepForwardOutlined,
  PlusOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  VideoCameraOutlined,
  MailOutlined,
} from '@ant-design/icons'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import InterviewScheduleModal from '../modals/InterviewScheduleModal'
import OfferLetterModal from '../modals/OfferLetterModal'
import offerletter from '../../assets/images/Jane Smith_OfferLetter.pdf'
import './ResignationApplications.css'

import { getApplicantList, resignationLists } from '../../services/Services'
import ExcelImportModal from '../modals/ExcelimportModal'
import ApproveModel from '../modals/ApproveModel'


const { Search } = Input

const ResignationApplications = () => {
  const [selectionType, setSelectionType] = useState('checkbox')
  const [initiateModalOpen, setInitiateModalOpen] = useState(false)
  const [offerLetterModels, setofferLetterModels] = useState(false)
  const [loading, setloading] = useState(false)
  const [remarks, setRemarks] = useState({})
  const [selectedCandidateId, setSelectedCandidateId] = useState(null)
  const [firstname, setfirstname] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [selectedOption, setSelectedOption] = useState(null)
  const [totalRecords, setTotalRecords] = useState(0)
  const [AllApplicationList, setAllApplicationList] = useState([])
  const [currentTabData, setcurrentTabData] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)
  const [callModalPreData, setCallModalPreData] = useState(null)
  const [importExelModal, setimportExelModal] = useState(false)

  const intStatusColors = {
    Cancelled: 'red',
    'Awaiting Confirmation': 'orange',
    'Reshedule requested': 'blue',
  }

  const [designations, setDesignations] = useState([])

  const fetchMasterData = async () => {
    const res = await getApplicantList()
    if (res.status === 200) setDesignations(res.data?.data)
  }

  useEffect(() => {
    fetchMasterData()
  }, [])

  const handleCheckboxChange = (option) => {
    setSelectedOption(option)
  }

  const handleTableChange = (current, newPageSize) => {
    setCurrentPage(current)
    setPageSize(newPageSize)
  }

  const handleInitiateClick = (record) => {
    setSelectedCandidateId(record.id)
    setfirstname(record.firstName)
    setInitiateModalOpen(true)
  }

  const handleRemarksChange = (e) => {
    setRemarks((prev) => ({
      ...prev,
      [parseInt(selectedCandidateId)]: e.target.value,
    }))
  }

  const handleCallFormModal = (record) => {
    setCallModalPreData(record)
    setIsCallModalOpen(true)
  }

  const handleView = (record) => {
    // setProductViewModel(true)
  }

  const title_fields = [
    {
      label: 'First Name',
      key: 'firstName',
      alternateMatches: ['FIRST NAME'],
      fieldType: { type: 'input' },
      example: 'John',
      validations: [{ rule: 'required', errorMessage: 'First Name is required' }],
    },
    {
      label: 'Middle Name',
      key: 'middleName',
      alternateMatches: ['MIDDLE NAME'],
      fieldType: { type: 'input' },
      example: 'Alan',
    },
    {
      label: 'Last Name',
      key: 'lastName',
      alternateMatches: ['LAST NAME'],
      fieldType: { type: 'input' },
      example: 'Doe',
      validations: [{ rule: 'required', errorMessage: 'Last Name is required' }],
    },
    {
      label: 'Email',
      key: 'email',
      alternateMatches: ['EMAIL ADDRESS'],
      fieldType: { type: 'input' },
      example: 'john@example.com',
      validations: [
        { rule: 'required', errorMessage: 'Email is required' },
        { rule: 'email', errorMessage: 'Invalid email format' },
      ],
    },
    {
      label: 'Mobile',
      key: 'mobile',
      alternateMatches: ['MOBILE'],
      fieldType: { type: 'input' },
      example: '9876543210',
      validations: [{ rule: 'required', errorMessage: 'Mobile number is required' }],
    },
    {
      label: 'Date of Birth',
      key: 'dob',
      alternateMatches: ['DOB'],
      fieldType: { type: 'date' },
      example: '1990-01-01',
    },
    {
      label: 'Gender',
      key: 'gender',
      fieldType: { type: 'select', options: ['Male', 'Female', 'Other'] },
      example: 'Male',
    },
    {
      label: 'Designation',
      key: 'designation',
      fieldType: { type: 'input' },
      example: 'Software Engineer',
    },
    {
      label: 'Department',
      key: 'department',
      fieldType: { type: 'input' },
      example: 'Engineering',
    },
    {
      label: 'Joining Date',
      key: 'joiningDate',
      fieldType: { type: 'date' },
      example: '2023-08-15',
    },
    {
      label: 'Gross Salary',
      key: 'grossSalary',
      fieldType: { type: 'input' },
      example: '50000.00',
    },
    {
      label: 'PAN Number',
      key: 'panNumber',
      fieldType: { type: 'input' },
      example: 'ABCDE1234F',
    },
    {
      label: 'Aadhar Number',
      key: 'aadharNumber',
      fieldType: { type: 'input' },
      example: '123412341234',
    },
    {
      label: 'Marital Status',
      key: 'maritalStatus',
      alternateMatches: ['MARITIAL STATUS'],
      fieldType: { type: 'select', options: ['Single', 'Married', 'Divorced', 'Widowed'] },
      example: 'Single',
    },
    {
      label: 'Nationality',
      key: 'nationality',
      fieldType: { type: 'input' },
      example: 'Indian',
    },
  ]

  const columnTemplates = {
    name: {
      title: 'Name',
      fixed: 'left',
      dataIndex: 'firstName',
      key: 'firstName',
      render: (text) => (
        <Tooltip title={text}>
          <a>{text}</a>
        </Tooltip>
      ),
      extraInfo: 'Works in finance department',
    },
    email: {
      title: 'Email id',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
      render: (email) => (
        <Tooltip title={email}>
          <span>{email}</span>
        </Tooltip>
      ),
    },
    designation: {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      ellipsis: true,
      render: (designation) => {
        const result = designationss.find((desg) => desg?.designationId == designation)
        const title = result?.designationName || 'N/A'
        return (
          <Tooltip title={title}>
            <span>{title}</span>
          </Tooltip>
        )
      },
    },
    phone: {
      title: 'Mobile',
      dataIndex: 'phone',
      key: 'phone',
      ellipsis: true,
      render: (phone) => (
        <Tooltip title={phone}>
          <span>{phone}</span>
        </Tooltip>
      ),
    },
    statusid: {
      title: 'Status',
      key: 'statusId',
      dataIndex: 'statusId',
      ellipsis: true,
      render: (statusId, record, index) => {
        ;<Tooltip title={'lable'}>
          <Tag color={'green'}>abc</Tag>
        </Tooltip>
      },
    },
    inv_status: {
      title: 'Invite Status',
      dataIndex: 'inv_status',
      key: 'inv_status',
      ellipsis: true,
      filters: [
        { text: 'Cancelled', value: 'Cancelled' },
        { text: 'Awaiting Confirmation', value: 'Awaiting Confirmation' },
        { text: 'Reschedule requested', value: 'Reschedule requested' },
        { text: 'Schedule Pending', value: 'Schedule Pending' },
        { text: 'Scheduled', value: 'Scheduled' },
      ],
      onFilter: (value, record) => {
        return (record.int_status || '').trim().toLowerCase() === value.trim().toLowerCase()
      },

      render: (int_status) => (
        <Tooltip title={int_status}>
          <span style={{ color: intStatusColors[int_status] || 'gray', fontWeight: 500 }}>
            {int_status}
          </span>
        </Tooltip>
      ),
    },
    type: {
      title: 'Type',
      key: 'type',
      dataIndex: 'type',
      ellipsis: true,
      render: (type, record, index) => {
        const { statusId } = record
        const statusInfo = statusMapp[statusId] || { color: 'default', label: 'Unknown' }
        const { icon, color, displayText, link } = getTypeIconAndColor(type)
        return (
          <Tooltip title={type}>
            {link ? (
              <a href={link} target="_blank" rel="noopener noreferrer">
                <Tag icon={icon} color={color} style={{ cursor: 'pointer' }}>
                  {displayText}
                </Tag>
              </a>
            ) : (
              <Tag icon={icon} color={color}>
                {displayText}
              </Tag>
            )}
          </Tooltip>
        )
      },
    },
    resume: {
      title: 'Resume',
      key: 'cv',
      dataIndex: 'cv',
      ellipsis: true,
      render: (cv) => (
        <Tooltip title={'Resume'}>
          <Tag style={{ cursor: 'pointer', fontSize: 18 }} color="yellow">
            <a href={offerletter} target="_blank">
              <LinkOutlined />
            </a>
          </Tag>
        </Tooltip>
      ),
    },
    offer_letter: {
      title: 'Offer Letter',
      key: 'offer_letter',
      dataIndex: 'offer_letter',
      ellipsis: true,
      render: (offer_letter, record) => (
        <Tooltip title={`Offer Letter - ${record.offer_letter_sent}`}>
          {offer_letter && (
            <Tag
              style={{ cursor: 'pointer', fontSize: 18 }}
              color={record.offer_letter_sent > 0 ? '#006400' : '#8B8000'}
            >
              <a href={offer_letter} target="_blank">
                <LinkOutlined />
              </a>
            </Tag>
          )}
        </Tooltip>
      ),
    },
    action: {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip placement="top" title="View/Edit">
            <Link to={`/employee/add_new/${record.id}`} onClick={() => handleView(record)}>
              <EditOutlined style={{ fontSize: 18 }} />
            </Link>
          </Tooltip>
          <Tooltip placement="top" title="Action">
            <Link to="" onClick={() => handleInitiateClick(record)}>
              <StepForwardOutlined style={{ fontSize: 18 }} />
            </Link>
          </Tooltip>
        </Space>
      ),
    },
  }

  const columns = [
    columnTemplates.name,
    columnTemplates.email,
    columnTemplates.designation,
    columnTemplates.phone,
    columnTemplates.statusid,
    // columnTemplates.resume,
    columnTemplates.action,
  ]

  const designationss = [
    { designationId: 1, designationName: 'Software Engineer' },
    { designationId: 2, designationName: 'Product Manager' },
    { designationId: 3, designationName: 'UI/UX Designer' },
  ]

  const statusMapp = {
    21: { label: 'Resignation Applied', color: 'gold', decision: 'Pending' },
    22: { label: 'Resignation Approved', color: 'gold', decision: 'Pending' },
    23: { label: 'Resignation Revoked', color: 'gold', decision: 'Pending' },
  }

  const tempData = [
    {
      key: 98,
      firstName: 'John doe',
      email: 'alicAlicee@example.com',
      dob: '1990-05-15T00:00:00Z',
      designation: 1,
      phone: '9876543210',
      statusId: 21,
      offer_letter: '',
      offer_letter_sent: 0,
      cv: offerletter,
      position: 'Frontend Developer',
      interviewRounds: [
        { round: 'HR Round', status: 'Completed', remark: 'Good communication' },
        { round: 'Technical Round', status: 'Completed', remark: 'Strong React skills' },
        { round: 'Manager Round', status: 'Pending', remark: '' },
      ],
      finalResult: 'Selected',
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 99,
      firstName: 'Amir Khan',
      email: 'alicAlicee@example.com',
      dob: '1990-05-15T00:00:00Z',
      designation: 1,
      phone: '9876543210',
      statusId: 21,
      offer_letter: '',
      offer_letter_sent: 0,
      cv: offerletter,
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 100,
      firstName: 'JohnsonAlice',
      email: 'alicAlicee@example.com',
      dob: '1990-05-15T00:00:00Z',
      designation: 1,
      phone: '9876543210',
      statusId: 21,
      offer_letter: '',
      offer_letter_sent: 0,
      cv: offerletter,
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 101,
      firstName: 'Alice Johnson',
      email: 'alice@example.com',
      dob: '1990-05-15T00:00:00Z',
      designation: 2,
      phone: '9876543210',
      statusId: 22,
      offer_letter: '',
      offer_letter_sent: 0,
      cv: offerletter,
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 102,
      firstName: 'Bob Smith',
      email: 'bob@example.com',
      dob: '1988-11-23T00:00:00Z',
      designation: 2,
      phone: '9123456780',
      statusId: 22,
      offer_letter: '',
      offer_letter_sent: 0,
      cv: offerletter,
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 103,
      firstName: 'Carol Williams',
      email: 'carol@example.com',
      dob: '1992-03-10T00:00:00Z',
      designation: 2,
      phone: '9988776655',
      statusId: 22,
      offer_letter: '',
      offer_letter_sent: 0,
      cv: offerletter,
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 104,
      firstName: 'David Brown',
      email: 'david@example.com',
      dob: '1995-07-08T00:00:00Z',
      designation: 1,
      phone: '9001122334',
      statusId: 22,
      offer_letter: '',
      offer_letter_sent: 0,
      cv: offerletter,
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 105,
      firstName: 'Eva Green',
      email: 'eva@example.com',
      dob: '1991-12-19T00:00:00Z',
      designation: 2,
      phone: '8112233445',
      statusId: 22,
      offer_letter: '',
      offer_letter_sent: 0,
      cv: offerletter,
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 106,
      firstName: 'Frank Martin',
      email: 'frank@example.com',
      dob: '1987-09-03T00:00:00Z',
      designation: 3,
      phone: '7009988776',
      statusId: 23,
      offer_letter: offerletter,
      offer_letter_sent: 0,
      cv: offerletter,
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 107,
      firstName: 'David Brown',
      email: 'david@example.com',
      dob: '1995-07-08T00:00:00Z',
      designation: 1,
      phone: '9001122334',
      statusId: 23,
      offer_letter: '',
      offer_letter_sent: 0,
      cv: offerletter,
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 108,
      firstName: 'Eva Green',
      email: 'eva@example.com',
      dob: '1991-12-19T00:00:00Z',
      designation: 2,
      phone: '8112233445',
      statusId: 23,
      offer_letter: '',
      offer_letter_sent: 0,
      cv: offerletter,
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 109,
      firstName: 'Frank Martin',
      email: 'frank@example.com',
      dob: '1987-09-03T00:00:00Z',
      designation: 3,
      phone: '7009988776',
      statusId: 23,
      offer_letter: offerletter,
      offer_letter_sent: 0,
      cv: offerletter,
      interviewRounds: [
        {
          round: 'HR Screening / HR Round',
          interviewer: [
            { name: 'Ankit Sharma', feedback: '' },
            { name: 'Awadhesh Kumar', feedback: '' },
          ],
          level: 'Round 1',
          status: 'Qualified',
          remark: 'Good communication',
        },
        {
          round: 'Telephonic Interview',
          interviewer: [{ name: 'lalit Mohan', feedback: '' }],
          level: 'Round 1',
          status: 'Qualified',
          remark: 'Good communication but low technical skills',
        },
        {
          round: 'Technical Round / Technical Interview',
          interviewer: [
            { name: 'lalit Mohan', feedback: '' },
            { name: 'Ram Kishan', feedback: '' },
          ],
          status: 'Qualified',
          remark: 'Strong React skills',
        },
        {
          round: 'Coding Round / Programming Round',
          interviewer: [
            { name: 'Om Singh', feeback: '' },
            { name: 'Ram Avatar', feedback: '' },
          ],
          status: 'Pending',
          remark: '',
        },
      ],
      finalResult: 'Pending',
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 110,
      firstName: 'David Brown',
      email: 'david@example.com',
      dob: '1995-07-08T00:00:00Z',
      designation: 1,
      phone: '9001122334',
      statusId: 23,
      offer_letter: '',
      cv: '',
      offer_letter_sent: 0,
      type: '7009988776',
      position: 'Frontend Developer',
      interviewRounds: [
        {
          round: 'HR Screening / HR Round',
          interviewer: [
            { name: 'Ankit Sharma', feedback: '' },
            { name: 'Awadhesh Kumar', feedback: '' },
          ],
          level: 'Round 1',
          status: 'Qualified',
          remark: 'Good communication',
        },
        {
          round: 'Telephonic Interview',
          interviewer: [{ name: 'lalit Mohan', feedback: '' }],
          level: 'Round 1',
          status: 'Qualified',
          remark: 'Good communication but low technical skills',
        },
        {
          round: 'Technical Round / Technical Interview',
          interviewer: [
            { name: 'lalit Mohan', feedback: '' },
            { name: 'Ram Kishan', feedback: '' },
          ],
          status: 'Qualified',
          remark: 'Strong React skills',
        },
        {
          round: 'Coding Round / Programming Round',
          interviewer: [
            { name: 'Om Singh', feeback: '' },
            { name: 'Ram Avatar', feedback: '' },
          ],
          status: 'Pending',
          remark: '',
        },
      ],
      finalResult: 'Pending',
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 111,
      firstName: 'Eva Green',
      email: 'eva@example.com',
      dob: '1991-12-19T00:00:00Z',
      designation: 2,
      phone: '8112233445',
      statusId: 23,
      offer_letter: '',
      cv: offerletter,
      offer_letter_sent: 0,
      type: 'In-Office',
      position: 'Frontend Developer',
      interviewRounds: [
        {
          round: 'HR Screening / HR Round',
          interviewer: [
            { name: 'Ankit Sharma', feedback: '' },
            { name: 'Awadhesh Kumar', feedback: '' },
          ],
          level: 'Round 1',
          status: 'Qualified',
          remark: 'Good communication',
        },
        {
          round: 'Telephonic Interview',
          interviewer: [{ name: 'lalit Mohan', feedback: '' }],
          level: 'Round 1',
          status: 'Qualified',
          remark: 'Good communication but low technical skills',
        },
        {
          round: 'Technical Round / Technical Interview',
          interviewer: [
            { name: 'lalit Mohan', feedback: '' },
            { name: 'Ram Kishan', feedback: '' },
          ],
          status: 'Qualified',
          remark: 'Strong React skills',
        },
        {
          round: 'Coding Round / Programming Round',
          interviewer: [
            { name: 'Om Singh', feeback: '' },
            { name: 'Ram Avatar', feedback: '' },
          ],
          status: 'Pending',
          remark: '',
        },
      ],
      finalResult: 'Pending',
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 112,
      firstName: 'Frank Martin_',
      email: 'frank@example.com',
      dob: '1987-09-03T00:00:00Z',
      designation: 3,
      phone: '7009988776',
      statusId: 23,
      offer_letter: offerletter,
      offer_letter_sent: 0,
      cv: offerletter,
      type: 'https://meet.google.com/abc-mnop-xyz',
      position: 'Frontend Developer',
      interviewRounds: [
        {
          round: 'HR Screening / HR Round',
          interviewer: [
            { name: 'Ankit Sharma', feedback: '' },
            { name: 'Awadhesh Kumar', feedback: '' },
          ],
          level: 'Round 1',
          status: 'Qualified',
          remark: 'Good communication',
        },
        {
          round: 'Telephonic Interview',
          interviewer: [{ name: 'lalit Mohan', feedback: '' }],
          level: 'Round 1',
          status: 'Qualified',
          remark: 'Good communication but low technical skills',
        },
        {
          round: 'Technical Round / Technical Interview',
          interviewer: [
            { name: 'lalit Mohan', feedback: '' },
            { name: 'Ram Kishan', feedback: '' },
          ],
          status: 'Qualified',
          remark: 'Strong React skills',
        },
        {
          round: 'Coding Round / Programming Round',
          interviewer: [
            { name: 'Om Singh', feeback: '' },
            { name: 'Ram Avatar', feedback: '' },
          ],
          status: 'Pending',
          remark: '',
        },
      ],
      finalResult: 'Pending',
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
    {
      key: 116.1,
      firstName: 'Frank Martin_',
      email: 'frank@example.com',
      dob: '1987-09-03T00:00:00Z',
      designation: 3,
      phone: '7009988776',
      statusId: 20,
      offer_letter: offerletter,
      offer_letter_sent: 0,
      cv: offerletter,
      type: 'https://meet.google.com/abc-mnop-xyz',
      position: 'Frontend Developer',
      interviewRounds: [
        {
          round: 'HR Screening / HR Round',
          interviewer: [
            { name: 'Ankit Sharma', feedback: '' },
            { name: 'Awadhesh Kumar', feedback: '' },
          ],
          level: 'Round 1',
          status: 'Qualified',
          remark: 'Good communication',
        },
        {
          round: 'Telephonic Interview',
          interviewer: [{ name: 'lalit Mohan', feedback: '' }],
          level: 'Round 1',
          status: 'Qualified',
          remark: 'Good communication but low technical skills',
        },
        {
          round: 'Technical Round / Technical Interview',
          interviewer: [
            { name: 'lalit Mohan', feedback: '' },
            { name: 'Ram Kishan', feedback: '' },
          ],
          status: 'Qualified',
          remark: 'Strong React skills',
        },
        {
          round: 'Coding Round / Programming Round',
          interviewer: [
            { name: 'Om Singh', feeback: '' },
            { name: 'Ram Avatar', feedback: '' },
          ],
          status: 'Pending',
          remark: '',
        },
      ],
      finalResult: 'Pending',
      resignationReason: 'Personal Reasons',
      additionalComments: 'Looking for better opportunities.',
    },
  ]

  useEffect(() => {
    setAllApplicationList(tempData)
    handleTabChange(21)
  }, [])

  // rowSelection object indicates the need for row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys)
    },
  }

  const handleTabChange = (activeKey) => {
    const key = parseInt(activeKey)
    let filteredData = tempData.filter((item) => item.statusId === key)

    setcurrentTabData(filteredData)
    setTotalRecords(filteredData.length)
    setSelectedRowKeys([])
  }

  const handleSearch = (e) => {
    const a = e.target.value
    if (a.length > 0) {
      const searchText = a
      // console.log('search text', searchText)
      const filteredData = currentTabData.filter((val) =>
        val.firstName.toLowerCase().includes(searchText.toLowerCase()),
      )
      // Now do something with filteredData, like updating state
      setcurrentTabData(filteredData)
    }
  }

  const expandedRowRender = (record) => {
    return (
      <Card style={{ margin: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Card title="Resignation Reason" bordered={false}>
              <p>{record.resignationReason || 'N/A'}</p>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Additional Comments" bordered={false}>
              <p>{record.additionalComments || 'N/A'}</p>
            </Card>
          </Col>
        </Row>
      </Card>
    )
  }

  const handleInitializeCandidate = () => {
    setInitiateModalOpen(false)
    message.success('Action Completed Successfully')
  }

  const tabConfigs = [
    { key: '21', label: 'Resignation Applicantions', columns, expandedRowRender },
    { key: '22', label: 'Resignation Approved', columns, expandedRowRender },
    { key: '24', label: 'Resignation Rejected', columns, expandedRowRender },
    { key: '23', label: 'Resignation Revoked', columns, expandedRowRender },
  ]

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      <div className="abc_vp" style={{ padding: 16 }}>
        <Tabs
          defaultActiveKey="1"
          onChange={handleTabChange}
           type="card"
          items={tabConfigs.map(({ key, label, columns, expandedRowRender }) => ({
            key,
            label,
            children: (
              <>
                <TableBulkActionIcons
                  setimportExelModal={setimportExelModal}
                  totalRecords={totalRecords}
                  selectedRowKeys={selectedRowKeys}
                  handleSearch={handleSearch}
                />
                <Table
                  rowSelection={{ type: selectionType, ...rowSelection }}
                  columns={columns}
                  pagination={{
                    current: currentPage,
                    total: totalRecords,
                    position: ['bottomRight'],
                    pageSize,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    onChange: handleTableChange,
                  }}
                  dataSource={currentTabData}
                  bordered
                  loading={loading}
                  expandedRowRender={expandedRowRender}
                  scroll={{ x: 'max-content', y: 'calc(100vh - 160px)' }}
                />
              </>
            ),
          }))}
        />
      </div>

      <ExcelImportModal
        importExelModal={importExelModal}
        setimportExelModal={setimportExelModal}
        title_fields={title_fields}
      />
      <ApproveModel
        initiateModalOpen={initiateModalOpen}
        setInitiateModalOpen={setInitiateModalOpen}
        handleInitializeCandidate={handleInitializeCandidate}
      />
    </>
  )
}
const TableBulkActionIcons = ({
  setimportExelModal,
  totalRecords,
  selectedRowKeys,
  handleSearch,
}) => {
  // console.log('>>>>>>>>>selectedRowKeys', selectedRowKeys)

  const [statusSummary, setstatusSummary] = useState([
    {
      name: 'Total Rows',
      label: 'Pending Interview Schedule',
      count: 0,
      color: 'green',
      id: [1, 2, 3, 4, 5],
    },
    { name: 'Selected Rows', label: 'Rejected', count: 0, color: 'blue', id: [7] },
    // { name: 'Completed', label: 'Completed', count: 15, color: 'red', id: [6] },
  ])

  useEffect(() => {
    setstatusSummary([
      {
        name: 'Total Rows',
        label: 'Pending Interview Schedule',
        count: totalRecords,
        color: 'green',
        id: [1, 2, 3, 4, 5],
      },
      {
        name: 'Selected Rows',
        label: 'Rejected',
        count: selectedRowKeys.length,
        color: 'blue',
        id: [7],
      },
    ])
  }, [selectedRowKeys, totalRecords])

  return (
    <div
      style={{
        padding: 5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Space>
        {statusSummary.map(({ name, label, count, color, id }, index) => (
          <div
            key={index}
            style={{
              border: '2px solid #ccc',
              padding: 3,
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'center',
            }}
            onClick={() => {
              filterByStatus(id)
            }}
          >
            <Tooltip placement="top" title={label}>
              <span
                style={{
                  display: 'inline-block',
                  width: '100%',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  fontSize: 12,
                  padding: '0 8px', // Optional: adds some spacing inside
                }}
              >
                {count} {name}{' '}
              </span>
            </Tooltip>
          </div>
        ))}
      </Space>
      <Row>
        <Col>
          <Tooltip placement="top" title={'Send Email'} style={{ marginLeft: 5 }}>
            <Button
              onClick={() => {
                message.success('Email Sent Successfully')
              }}
            >
              <MailOutlined />
            </Button>
          </Tooltip>
          <Tooltip placement="top" title={'Add Candidate'}>
            <Link to={'/employee/add_new'} style={{ marginLeft: 5 }}>
              <Button>
                <PlusOutlined />
              </Button>
            </Link>
          </Tooltip>

          <Tooltip placement="top" title={'Import'}>
            <Button style={{ marginLeft: 5 }} onClick={() => setimportExelModal(true)}>
              <ImportOutlined />
            </Button>
          </Tooltip>
          <Tooltip placement="top" title={'Export'}>
            <Button style={{ marginLeft: 5 }}>
              <ExportOutlined />
            </Button>
          </Tooltip>
          <Tooltip placement="top" title={'Approval Action'}>
            <Button disabled={false} style={{ marginLeft: 5 }}>
              <UserSwitchOutlined />
            </Button>
          </Tooltip>
        </Col>
        <Search
          //   placeholder="Search by name, role, or tags"
          placeholder="Search in table..."
          allowClear
          onChange={handleSearch}
          style={{ width: 300, marginLeft: 5 }}
        />
      </Row>
    </div>
  )
}

export default ResignationApplications
