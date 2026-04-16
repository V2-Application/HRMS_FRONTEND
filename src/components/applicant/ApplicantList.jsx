import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react' // ADD useCallback
import {
  Radio,
  Space,
  Table,
  Tag,
  Checkbox,
  Row,
  Input,
  Tooltip,
  Button,
  Modal,
  message,
  Tabs,
  Col,
  Form,
  Select,
} from 'antd'
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
  CopyOutlined,
  InfoCircleOutlined,
  MobileOutlined,
  ScheduleOutlined,
  LikeOutlined,
  MinusOutlined, // ADD THIS
  UploadOutlined,
  TableOutlined,
  HistoryOutlined, // ✅ NEW
} from '@ant-design/icons'
import useMediaQuery from '../../hooks/useMediaQuery'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import TextArea from 'antd/es/input/TextArea'
import { toast, ToastContainer } from 'react-toastify'
import InterviewScheduleModal from '../modals/InterviewScheduleModal'
import OfferLetterModal from '../modals/OfferLetterModal'
import './applicantList.css'
import CallFormModal from './CallFormModal'
import ApplicantBulkUpload from '../../components/modals/ApplicantBulkUpload'
import {
  applicantApproval,
  getApplicantList,
  getApplicantListData,
  sendMailOfferLetter,
  updateApplicantStatusById,
  interviewerApprovalforApplicantInterview,
  exportApplicantDataByStatus,
reopenApplicant
} from '../../services/Services'
import ExcelImportModal from '../modals/ExcelimportModal'
import ApproveModel from '../modals/ApproveModel'
import { set } from '../../redux/uiSlice'
import dayjs from 'dayjs'
import ConfirmModal from '../modals/ConfirmModal'
import ReviewModal from '../Interviewer/ReviewModal'
import { useActionsMap } from '../../utils/useActionsMap' // ✅ NEW
import ApplicantOfferLetterModal from './ApplicantOfferLetterModal/ApplicantOfferLetterModal'
import ShortListedApplicantListModal from './ShortListedApplicantsListModal'
import ApplicantInterviewActionHistoryModal from './ApplicantInterviewActionHistoryModal'

const baseUrl = import.meta.env.VITE_API_URL
const { Search } = Input

// ---------- SAFE JSON PARSER ----------
const safeJsonParse = (value) => {
  if (!value || typeof value !== 'string') return null
  const trimmed = value.trim()
  // if it's clearly not JSON, don't try parsing
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return null
  try {
    return JSON.parse(trimmed)
  } catch (e) {
    console.warn('Failed to parse JSON:', value, e)
    return null
  }
}
// -------------------------------------

const getTypeIconAndColor = (typeValue) => {
  if (!typeValue) return { icon: null, color: 'default', displayText: typeValue, link: null }

  const value = String(typeValue).toLowerCase()

  if (/^\d{10}$/.test(typeValue)) {
    return {
      icon: <PhoneOutlined style={{ marginRight: 4 }} />,
      color: 'green',
      displayText: typeValue,
      link: `tel:${typeValue}`,
    }
  } else if (value.includes('http') || value.includes('meet') || value.includes('zoom')) {
    return {
      icon: <VideoCameraOutlined style={{ marginRight: 4 }} />,
      color: 'volcano',
      displayText: 'Meeting Link',
      link: typeValue,
    }
  } else if (value.includes('office') || value.includes('in-office')) {
    return {
      icon: <EnvironmentOutlined style={{ marginRight: 4 }} />,
      color: 'geekblue',
      displayText: 'In-office',
      link: null,
    }
  } else {
    return { icon: null, color: 'default', displayText: typeValue, link: null }
  }
}

const ApplicantList = () => {
  const location = useLocation()
  const { pathname } = location
  const [selectionType, setSelectionType] = useState('checkbox')
  const [initiateModalOpen, setInitiateModalOpen] = useState(false)
  const [offerLetterModels, setofferLetterModels] = useState(false)
  const [approveModel, setapproveModel] = useState(false)

  const userRole = useSelector((state) => state?.auth?.data?.role) || 'employee'
  const employeeId = useSelector((state) => state?.auth?.data?.employeeId) || 0
  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu) // ✅ NEW
  const actionsMap = useActionsMap(filteredSideMenu) // ✅ NEW

  const { loading, theme } = useSelector((state) => state?.ui)
  const { Designation } = useSelector((state) => state?.dropdown?.response || [])
  const [candidateListData, setcandidateListData] = useState([])
  const [remarks, setRemarks] = useState({})
  // ✅ REOPEN MODAL STATES
const [reopenModalOpen, setReopenModalOpen] = useState(false)
const [reopenRemarks, setReopenRemarks] = useState('')
const [reopenLoading, setReopenLoading] = useState(false)
const [reopenCandidateId, setReopenCandidateId] = useState(null)

  const [selectedCandidateId, setSelectedCandidateId] = useState(null)
  const [firstname, setfirstname] = useState('')
  const params = useParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [totalRecords, setTotalRecords] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)
  const [callModalPreData, setCallModalPreData] = useState(null)
  const [importExelModal, setimportExelModal] = useState(false)
  const [apiApplicantListData, setapiApplicantListData] = useState([])
  const [searchTextt, setsearchTextt] = useState('')
  const [defaultModelData, setdefaultModelData] = useState({})
  const [activeKey, setactiveKey] = useState(
    userRole === 'HR' || userRole === 'Master' || userRole === 'IT Superadmin' ? 4 : 14,
  )
  const [currentRecord, setcurrentRecord] = useState({})
  const [confirmModal, setconfirmModal] = useState(false)
  const [confirmMdalHeader, setconfirmMdalHeader] = useState('')
  const [openResponsive, setopenResponsive] = useState(false)
  const dispatch = useDispatch()
  const searchInput = useRef(null)

  const isMobile = useMediaQuery('(max-width: 768px)') // USE YOUR EXISTING HOOK
  const [expandedCards, setExpandedCards] = useState({})





  const handleToggleCard = useCallback((empCode) => {
    setExpandedCards((prev) => ({
      ...prev,
      [empCode]: !prev[empCode],
    }))
  }, [])

  useEffect(() => {
    fetchMasterData()
  }, [])

  useEffect(() => {
    ApplicationListData()
  }, [pageSize, currentPage, searchTextt, activeKey])

  const intStatusColors = {
    Cancelled: 'red',
    'Awaiting Confirmation': 'orange',
    'Reshedule requested': 'blue',
  }

  const [designations, setDesignations] = useState([])

  const fetchMasterData = async () => {
    const res = await getApplicantList()
    if (res?.status === 200) setDesignations(res.data?.data)
  }

  const ApplicationListData = async () => {
    dispatch(set({ loading: true }))
    try {
      const res = await getApplicantListData({ currentPage, pageSize, searchTextt, activeKey })
      const candidateData = res?.data?.data?.candidates || []
      const totalData = res?.data?.data?.totalRecords || 0
      setcurrentTabData(candidateData)
      setTotalRecords(totalData)
    } catch (error) {
      if (error?.response?.status === 404) {
        setcurrentTabData([])
        setTotalRecords(0)
      } else {
        setcurrentTabData([])
        setTotalRecords(0)
      }
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  const [currentTabData, setcurrentTabData] = useState([])

  const handleInitiateClick = async (record) => {
    setSelectedCandidateId(record.id)
    setfirstname(record.firstName)
    setapproveModel(true)
  }

  const handleInitiateClickInterviewerAction = async (record) => {
    setSelectedCandidateId(record.id)
    setfirstname(record.firstName)
    setcurrentRecord(record)
    setopenResponsive(true)
  }

  const handleInitiateScheduleInterview = async (record) => {
    setSelectedCandidateId(record.id)
    setfirstname(record.firstName)
    setcurrentRecord(record)
    setInitiateModalOpen(true)
  }

  const handleCallFormModal = (record) => {
    setCallModalPreData(record)
    setIsCallModalOpen(true)
  }


// ✅ Open Reopen Modal
const handleOpenReopenModal = (record) => {
  setReopenCandidateId(record?.id)
  setReopenRemarks('')
  setReopenModalOpen(true)
}

// // ✅ Submit Reopen API
// const handleSubmitReopen = async () => {
//   if (!reopenRemarks.trim()) {
//     message.error('Remarks are mandatory')
//     return
//   }

//   try {
//     setReopenLoading(true)

//     // ✅ API call (adjust URL if your backend expects a different base)
//     // const res = await fetch(`${baseUrl}api/Applicant/reopen`, {
//     //   method: 'POST',
//     //   headers: { 'Content-Type': 'application/json' },
//     //   body: JSON.stringify({
//     //     candidateId: reopenCandidateId,
//     //     remarks: reopenRemarks,
//     //   }),
//     // })

// //     const token = localStorage.getItem('token') // change this if your token key differs

// // const res = await fetch(`${baseUrl}api/Applicant/reopen`, {
// //   method: 'POST',
// //   headers: {
// //     'Content-Type': 'application/json',
// //     Authorization: `Bearer ${token}`,
// //   },
// //   body: JSON.stringify({
// //     candidateId: reopenCandidateId,
// //     remarks: reopenRemarks,
// //   }),
// // })


// const res = await reopenApplicant({
//   candidateId: reopenCandidateId,
//   remarks: reopenRemarks,
// })

// message.success(res?.data?.message || 'Applicant reopened successfully')
// setReopenModalOpen(false)
// await ApplicationListData()


//     const data = await res.json()

//     // If your API returns different shape, adjust this condition
//     if (res.ok) {
//       message.success(data?.message || 'Applicant reopened successfully')
//       setReopenModalOpen(false)
//       setReopenCandidateId(null)
//       setReopenRemarks('')
//       await ApplicationListData()
//     } else {
//       message.error(data?.message || 'Failed to reopen applicant')
//     }
//   } catch (err) {
//     message.error('Error reopening applicant')
//   } finally {
//     setReopenLoading(false)
//   }
// }


// ✅ Submit Reopen API
// const handleSubmitReopen = async () => {
// if (!reopenCandidateId) {
//     message.error('Candidate not selected')
//     return
//   }


//   if (!reopenRemarks.trim()) {
//     message.error('Remarks are mandatory')
//     return
//   }

//   try {
//     setReopenLoading(true)

//     // ✅ axios service call
//     const res = await reopenApplicant({
//       candidateId: reopenCandidateId,
//       remarks: reopenRemarks,
//     })

//     // ✅ axios response handling
//     message.success(res?.data?.message || 'Applicant reopened successfully')

//     setReopenModalOpen(false)
//     setReopenCandidateId(null)
//     setReopenRemarks('')

//     await ApplicationListData()
//   } catch (err) {
//     // ✅ show backend message if available
//     message.error(err?.response?.data?.message || err?.message || 'Error reopening applicant')
//     console.error('Reopen error:', err)
//   } finally {
//     setReopenLoading(false)
//   }
// }


const handleSubmitReopen = async () => {
  if (!reopenCandidateId) {
    message.error('Candidate not selected')
    return
  }

  if (!reopenRemarks.trim()) {
    message.error('Remarks are mandatory')
    return
  }

  try {
    setReopenLoading(true)

    const res = await reopenApplicant({
      candidateId: reopenCandidateId,
      remarks: reopenRemarks,
    })

    message.success(res?.data?.message || 'Applicant reopened successfully')
    setReopenModalOpen(false)
    setReopenCandidateId(null)
    setReopenRemarks('')
    await ApplicationListData()
  } catch (err) {
    message.error(err?.response?.data?.message || 'Error reopening applicant')
    console.log('Reopen error:', err)
  } finally {
    setReopenLoading(false)
  }
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

  const getDesignationFilterDropdown = (Designation, currentTabData) => {
    return ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
      const [searchText, setSearchText] = useState('')

      const filteredOptions = [...new Set(currentTabData.map((item) => item.designation))]
        .map((id) => {
          const des = Designation.find((d) => Number(d.designationId) === Number(id))
          return {
            text: des?.designationName || `ID: ${id}`,
            value: id,
          }
        })
        .filter((opt) => opt.text.toLowerCase().includes(searchText.toLowerCase()))

      return (
        <div style={{ padding: 8, width: 250 }}>
          <Input
            placeholder="Search Designation"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {Array.isArray(filteredOptions) && filteredOptions.map((option) => (
              <div key={option.value}>
                <Checkbox
                  checked={selectedKeys.includes(option.value)}
                  onChange={(e) => {
                    const checked = e.target.checked
                    const nextSelectedKeys = checked
                      ? [...selectedKeys, option.value]
                      : selectedKeys.filter((k) => k !== option.value)
                    setSelectedKeys(nextSelectedKeys)
                  }}
                >
                  {option.text}
                </Checkbox>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, textAlign: 'right' }}>
            <Button onClick={() => clearFilters()} size="small">
              Reset
            </Button>
            <Button type="primary" size="small" onClick={() => confirm()} style={{ marginLeft: 8 }}>
              Filter
            </Button>
          </div>
        </div>
      )
    }
  }

  const getPhoneFilterDropdown = (currentTabData) => {
    return ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
      const [searchText, setSearchText] = useState('')

      const filteredPhones = [...new Set(currentTabData.map((item) => item.phone))]
        .filter((phone) =>
          String(phone || '')
            .toLowerCase()
            .includes(searchText.toLowerCase()),
        )
        .map((phone) => ({
          text: phone,
          value: phone,
        }))

      return (
        <div style={{ padding: 8, width: 250 }}>
          <Input
            placeholder="Search phone"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {Array.isArray(filteredPhones) && filteredPhones.map((option) => (
              <div key={option.value}>
                <Checkbox
                  checked={selectedKeys.includes(option.value)}
                  onChange={(e) => {
                    const nextSelectedKeys = e.target.checked
                      ? [...selectedKeys, option.value]
                      : selectedKeys.filter((k) => k !== option.value)
                    setSelectedKeys(nextSelectedKeys)
                  }}
                >
                  {option.text}
                </Checkbox>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, textAlign: 'right' }}>
            <Button onClick={() => clearFilters()} size="small">
              Reset
            </Button>
            <Button onClick={() => confirm()} style={{ marginLeft: 8 }} size="small" type="primary">
              Filter
            </Button>
          </div>
        </div>
      )
    }
  }

  const getStringFilterDropdown = (data, dataIndex) => {
    return ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
      const [searchText, setSearchText] = useState('')

      const uniqueOptions = [...new Set(data.map((item) => item[dataIndex]))]
        .filter((val) =>
          String(val || '')
            .toLowerCase()
            .includes(searchText.toLowerCase()),
        )
        .map((val) => ({
          text: val,
          value: val,
        }))

      return (
        <div style={{ padding: 8, width: 250 }}>
          <Input
            placeholder={`Search ${dataIndex}`}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {Array.isArray(uniqueOptions) && uniqueOptions.map((option) => (
              <div key={option.value}>
                <Checkbox
                  checked={selectedKeys.includes(option.value)}
                  onChange={(e) => {
                    const nextSelectedKeys = e.target.checked
                      ? [...selectedKeys, option.value]
                      : selectedKeys.filter((k) => k !== option.value)
                    setSelectedKeys(nextSelectedKeys)
                  }}
                >
                  {option.text}
                </Checkbox>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, textAlign: 'right' }}>
            <Button onClick={() => clearFilters()} size="small">
              Reset
            </Button>
            <Button onClick={() => confirm()} style={{ marginLeft: 8 }} size="small" type="primary">
              Filter
            </Button>
          </div>
        </div>
      )
    }
  }

  const columnTemplates = {
    storeCode: {
      title: 'Store Code',
      dataIndex: 'locationName',
      key: 'locationName',
      filterDropdown: getStringFilterDropdown(currentTabData, 'locationName'),
      onFilter: (value, record) => record.locationName === value,
      render: (text) => (
        <Tooltip title={text}>
          <a>{text}</a>
        </Tooltip>
      ),
      width: 200,
    },
    name: {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'firstName',
      filterDropdown: getStringFilterDropdown(currentTabData, 'firstName'),
      onFilter: (value, record) => record.firstName === value,
      render: (text) => (
        <Tooltip title={text}>
          <a>{text}</a>
        </Tooltip>
      ),
      width: 150,
    },
    InterviewData: {
      title: 'Interview Date',
      dataIndex: 'lastInterviewDateTime',
      key: 'lastInterviewDateTime',
      filterDropdown: getStringFilterDropdown(currentTabData, 'lastInterviewDateTime'),
      onFilter: (value, record) => record.lastInterviewDateTime === value,
      ellipsis: true,
      render: (lastInterviewDateTime) => (
        <Tooltip title={lastInterviewDateTime}>
          <span>{dayjs(lastInterviewDateTime).format('DD-MM-YYYY HH:mm')}</span>
        </Tooltip>
      ),
      width: 160,
    },
    email: {
      title: 'Email id',
      dataIndex: 'email',
      key: 'email',
      filterDropdown: getStringFilterDropdown(currentTabData, 'email'),
      onFilter: (value, record) => record.email === value,
      ellipsis: true,
      render: (email) => (
        <Tooltip title={email}>
          <span>{email}</span>
        </Tooltip>
      ),
      width: 220,
    },
    designation: {
      title: 'Designation',
      dataIndex: 'designation', // designationId
      key: 'designation',
      filterDropdown: getDesignationFilterDropdown(Designation, currentTabData),
      onFilter: (value, record) => Number(record.designation) === Number(value),
      ellipsis: true,
      render: (designationId) => {
        const result = Designation.find(
          (desg) => Number(desg.designationId) === Number(designationId),
        )
        const title = result?.designationName || 'N/A'
        return (
          <Tooltip title={title}>
            <span>{title}</span>
          </Tooltip>
        )
      },
      width: 180,
    },
    phone: {
      title: 'Mobile',
      dataIndex: 'phone',
      key: 'phone',
      filterDropdown: getPhoneFilterDropdown(currentTabData),
      onFilter: (value, record) => record.phone === value,
      ellipsis: true,
      render: (phone) => (
        <Tooltip title={phone}>
          <span>{phone}</span>
        </Tooltip>
      ),
      width: 140,
    },
    // appliedDate: {
    //   title: 'Applied Date',
    //   dataIndex: 'dateOfApply',
    //   key: 'dateOfApply',
    //   width: 140,
    //   render: (date) => (date === null ? null : String(date).split('T')[0]),
    // },

    appliedDate: {
      title: 'Applied Date',
      dataIndex: 'dateOfApply',
      key: 'dateOfApply',
      width: 140,
      render: (date) => (date ? String(date).split('T')[0] : null),

      // 👇 enable sorting on applied date
      sorter: (a, b) => {
        const da = a.dateOfApply ? new Date(a.dateOfApply).getTime() : 0
        const db = b.dateOfApply ? new Date(b.dateOfApply).getTime() : 0
        return da - db
      },
      sortDirections: ['ascend', 'descend'],

      // 👇 default sort = latest applied on top
      defaultSortOrder: 'descend',
    },

    currentCompany: {
      title: 'Current Company',
      dataIndex: 'company1',
      key: 'company1',
      width: 140,
    },
    experience: {
      title: 'Experience',
      dataIndex: 'experience',
      key: 'experience',
      width: 140,
      render: (_, record) => {
        let key1 =
          record?.totalIndustryExperienceYrs === null ||
          record?.totalIndustryExperienceYrs === undefined ||
          record?.totalIndustryExperienceYrs === ''
            ? 0
            : parseInt(record?.totalIndustryExperienceYrs)

        let key2 =
          record?.totalRetailExperienceYrs === null ||
          record?.totalRetailExperienceYrs === undefined ||
          record?.totalRetailExperienceYrs === ''
            ? 0
            : parseInt(record?.totalRetailExperienceYrs)

        return key1 + key2
      },
    },
    currentSalary: {
      title: 'Current Salary',
      dataIndex: 'lastCTCAnnual',
      key: 'lastCTCAnnual',
      width: 140,
    },
    currentLocation: {
      title: 'Current Location',
      dataIndex: 'currentLocation',
      key: 'currentLocation',
      width: 140,
      render: (text) => {
        const formattedText =
          text === null || text === undefined || text?.trim() === '' ? '-' : text?.trim()

        return (
          <Tooltip title={formattedText}>
            <span>{formattedText}</span>
          </Tooltip>
        )
      },
    },
    preferredLocation: {
      title: 'Preferred Location',
      dataIndex: 'preferredLocation',
      key: 'preferredLocation',
      width: 140,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    preferredState: {
      title: 'Preferred State',
      dataIndex: 'stateName',
      key: 'stateName',
      width: 140,
      render: (text) => {
        const formattedText =
          text === null || text === undefined || text?.trim() === '' ? '-' : text?.trim()

        return (
          <Tooltip title={formattedText}>
            <span>{formattedText}</span>
          </Tooltip>
        )
      },
    },
    postAppliedFor: {
      title: 'Post Applied For',
      dataIndex: 'designationName',
      key: 'designationName',
      width: 140,
    },

    noticePeriod: {
  title: 'Notice Period',
  dataIndex: 'noticePeriod',
  key: 'noticePeriod',
  width: 140,
  // sorter: (a, b) => Number(a?.Noticeperiod || 0) - Number(b?.Noticeperiod || 0),
  render: (val) => {
    const n = val === null || val === undefined || val === '' ? '-' : val
    return (
      <Tooltip title={n === '-' ? '-' : `${n} days`}>
        <span>{n === '-' ? '-' : `${n} Days`}</span>
      </Tooltip>
    )
  },
},

    
    statusid: {
      title: 'Status',
      key: 'statusId',
      dataIndex: 'statusId',
      ellipsis: true,
      render: (statusId, record) => {
        const { id } = record
        if ([4, 6, 2, 9, 12].includes(statusId)) {
          return (
            <Select
              value={statusId}
              style={{ width: 160 }}
              onChange={(v) => UpdateApplicant(id, v)}
            >
              <Select.Option value={4}>Pending</Select.Option>
              <Select.Option value={2}>Rejected</Select.Option>
              <Select.Option value={12}>Resume Shortlisted</Select.Option>
              <Select.Option value={6}>Hold</Select.Option>
              <Select.Option value={9}>Not Interested</Select.Option>
            </Select>
          )
        } else {
          const statusInfo = statusMapp[statusId] || { color: 'default', label: 'Unknown' }
          return (
            <Tooltip title={statusInfo.label}>
              <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
            </Tooltip>
          )
        }
      },
      width: 180,
    },
    createdBy: {
      title: 'Created By',
      key: 'createdBy',
      dataIndex: 'createdBy',
      width: 150,
      ellipsis: true,
    },
    createdOn: {
      title: 'Created On',
      key: 'createdOn',
      dataIndex: 'createdOn',
      render: (date) => (date === null ? null : String(date).split('T')[0]),
      width: 150,
      ellipsis: true,
    },
    updatedBy: {
      title: 'Updated By',
      key: 'updatedBy',
      dataIndex: 'updatedBy',
      width: 150,
      ellipsis: true,
    },
    updatedOn: {
      title: 'Updated On',
      key: 'updatedOn',
      dataIndex: 'updatedOn',
      render: (date) => (date === null ? null : String(date).split('T')[0]),
      width: 150,
      ellipsis: true,
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
      onFilter: (value, record) =>
        (record.int_status || '').trim().toLowerCase() === value.trim().toLowerCase(),
      render: (int_status) => (
        <Tooltip title={int_status}>
          <span style={{ color: intStatusColors[int_status] || 'gray', fontWeight: 500 }}>
            {int_status}
          </span>
        </Tooltip>
      ),
      width: 180,
    },
    interview_mode: {
      title: 'Interview Mode',
      key: 'type',
      dataIndex: 'type',
      ellipsis: true,
      render: (type, record) => {
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
      width: 180,
    },
    resume: {
      title: 'Resume',
      key: 'resumeLink',
      dataIndex: 'resumeLink',
      ellipsis: true,
      render: (cv) =>
        cv ? (
          <Tooltip title="Resume">
            <Tag style={{ cursor: 'pointer', fontSize: 18 }} color="yellow">
              <a href={`${baseUrl}${cv}`} target="_blank" rel="noopener noreferrer">
                <LinkOutlined />
              </a>
            </Tag>
          </Tooltip>
        ) : null,
      width: 100,
    },
    interview_form_link: {
      title: <Tooltip title="Interview Form Link">Interview Form Link</Tooltip>,
      key: 'interview_form_link',
      width: 180,
      render: (_, record) => {
        const interviewLink = `${window.location.origin}/interview-form/${record?.key}`
        const handleCopy = async () => {
          try {
            await navigator.clipboard.writeText(interviewLink)
            message.success('Interview Form link copied!')
          } catch {
            message.error('Failed to copy link')
          }
        }
        return (
          <Tooltip title="Copy Interview Form Link">
            <Tag color="blue" style={{ cursor: 'pointer', fontSize: 16 }} onClick={handleCopy}>
              <CopyOutlined />
            </Tag>
          </Tooltip>
        )
      },
    },
    offer_letter_action: {
      title: 'Offer Letter',
      key: 'offerLetterLink',
      index: 'offerLetterLink',
      width: 180,
      render: (row, record) => {
        return (
          <>
            {record?.offerLetterLink?.length > 0 ? (
              <Tooltip title="View Offer Letter">
                <a
                  href={`${baseUrl}${record?.offerLetterLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'blue', textDecoration: 'underline' }}
                >
                  View
                </a>
              </Tooltip>
            ) : (
              <Tooltip title="Generate Offer Letter">
                <span
                  onClick={() => {
                    setofferLetterModels(true)
                    setdefaultModelData(record)
                  }}
                  style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Generate
                </span>
              </Tooltip>
            )}
          </>
        )
      },
    },
    action: {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      render: (_, record) => {
        const handleCopy = async () => {
          const interviewLink = `${window.location.origin}/interview-form/${record?.id}`
          if (navigator.clipboard && window.isSecureContext) {
            try {
              await navigator.clipboard.writeText(interviewLink)
              message.success('Interview Form link copied!')
              return
            } catch {}
          }
          try {
            const textArea = document.createElement('textarea')
            textArea.value = interviewLink
            textArea.style.position = 'fixed'
            textArea.style.top = '0'
            textArea.style.left = '0'
            textArea.style.opacity = '0'
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            const successful = document.execCommand('copy')
            document.body.removeChild(textArea)
            if (successful) {
              message.success('Interview Form link copied!')
            } else {
              throw new Error('execCommand failed')
            }
          } catch {
            message.error('Failed to copy link')
          }
        }

        return (
          <Space size="middle">
            {/* ✅ Show Reopen only when "Rejected" tab is selected */}
{Number(activeKey) === 2 && (
  <Tooltip placement="top" title="Reopen">
    <Button size="small" onClick={() => handleOpenReopenModal(record)}>
      Reopen
    </Button>
  </Tooltip>
)}

            {(record?.statusId == 12 || record?.statusId == 15 || record?.statusId == 14) && (
              <Tooltip title="Copy Interview Form Link">
                <Tag color="blue" style={{ cursor: 'pointer', fontSize: 16 }} onClick={handleCopy}>
                  <CopyOutlined />
                </Tag>
              </Tooltip>
            )}
            {record?.statusId == 12 && (
              <Tooltip placement="top" title="Schedule Interview">
                <Link to="" onClick={() => handleInitiateScheduleInterview(record)}>
                  <ScheduleOutlined style={{ fontSize: 18 }} />
                </Link>
              </Tooltip>
            )}
            {record?.statusId == 11 && (
              <Tooltip placement="top" title={'Approve and Move to Candidate'}>
                <StepForwardOutlined
                  style={{ fontSize: 18 }}
                  onClick={() => handleInitiateClick(record)}
                />
              </Tooltip>
            )}
            {(record?.statusId == 14 || record?.statusId == 13) && (
              <Tooltip
                placement="top"
                title={
                  record.isStatus ? 'Already Action Taken By You' : 'Approve This Interview Round'
                }
              >
                <Button disabled={record?.isStatus}>
                  <LikeOutlined
                    style={{ fontSize: 18, color: 'red' }}
                    onClick={() => handleInitiateClickInterviewerAction(record)}
                    disabled={true}
                  />
                </Button>
              </Tooltip>
            )}
            <Tooltip placement="top" title={'Go to Interview Form'}>
              <Link to={`/applicant/view_interview_form/${record?.id}`} state={{ from: pathname }}>
                <InfoCircleOutlined style={{ color: 'blue', fontSize: 22 }} />
              </Link>
            </Tooltip>
          </Space>
        )
      },
      width: 120,
    },
  }

  const columns = [
    columnTemplates.appliedDate,
    columnTemplates.currentLocation,
    columnTemplates.preferredLocation,
    columnTemplates.preferredState,
    columnTemplates.storeCode,
    columnTemplates.name,
    columnTemplates.email,
    columnTemplates.designation,
    columnTemplates.phone,
    columnTemplates.experience,
    columnTemplates.currentCompany,
    columnTemplates.currentSalary,
    columnTemplates.postAppliedFor,
    columnTemplates.noticePeriod,
    columnTemplates.statusid,
    columnTemplates.resume,
    columnTemplates.createdBy,
    columnTemplates.createdOn,
    columnTemplates.updatedBy,
    columnTemplates.updatedOn,
    columnTemplates.action,
  ]

  const columns_ = [
    columnTemplates.appliedDate,
    columnTemplates.currentLocation,
    columnTemplates.preferredLocation,
    columnTemplates.preferredState,
    columnTemplates.storeCode,
    columnTemplates.name,
    columnTemplates.email,
    columnTemplates.designation,
    columnTemplates.phone,
    columnTemplates.experience,
    columnTemplates.currentCompany,
    columnTemplates.currentSalary,
    columnTemplates.postAppliedFor,
    columnTemplates.noticePeriod,
    columnTemplates.interview_mode,
    columnTemplates.InterviewData,
    columnTemplates.resume,
    columnTemplates.createdBy,
    columnTemplates.createdOn,
    columnTemplates.updatedBy,
    columnTemplates.updatedOn,
    columnTemplates.action,
  ]

  const columns__ = [
    columnTemplates.appliedDate,
    columnTemplates.currentLocation,
    columnTemplates.preferredLocation,
    columnTemplates.preferredState,
    columnTemplates.storeCode,
    columnTemplates.name,
    columnTemplates.email,
    columnTemplates.designation,
    columnTemplates.phone,
    columnTemplates.resume,
    columnTemplates.createdBy,
    columnTemplates.createdOn,
    columnTemplates.updatedBy,
    columnTemplates.updatedOn,
    columnTemplates.offer_letter_action,
    columnTemplates.action,
  ]

  const statusMapp = {
    1: { label: 'Approved', color: 'blue', decision: 'Approved' },
    2: { label: 'Rejected', color: 'red', decision: 'Pending' },
    3: { label: 'Round 3', color: 'orange', decision: 'Pending' },
    4: { label: 'Pending', color: 'purple', decision: 'Pending' },
    5: { label: 'Round 5', color: 'blue', decision: 'Pending' },
    6: { label: 'Round 6', color: 'cyan', decision: 'Pending' },
    7: { label: 'Round 7', color: 'orange', decision: 'Pending' },
    8: { label: 'Round 8', color: 'purple', decision: 'Pending' },
    9: { label: 'Round 9', color: 'blue', decision: 'Pending' },
    10: { label: 'Round 10', color: 'cyan', decision: 'Pending' },
    11: { label: 'Round 4', color: 'volcano', decision: 'Pending' },
    12: { label: 'Completed', color: 'green', decision: 'Pending' },
    13: { label: 'Rejected', color: 'red', decision: 'Pending' },
    14: { label: 'Resume Shortlisted', color: 'gold', decision: 'Pending' },
    15: { label: 'Hold', color: 'gold', decision: 'Pending' },
    16: { label: 'Schedule Pending', color: 'gold', decision: 'Pending' },
    17: { label: 'Cancelled', color: 'gold', decision: 'Pending' },
    18: { label: 'Awaiting Confirmation', color: 'gold', decision: 'Pending' },
    19: { label: 'Reschedule requested', color: 'gold', decision: 'Pending' },
    20: { label: 'Scheduled', color: 'gold', decision: 'Pending' },
  }

  const visibleTabs = [
    { key: 4, label: 'Pending Applicant List', columns },
    { key: 6, label: 'On Hold', columns },
    { key: 9, label: 'Not Intrested', columns },
    { key: 2, label: 'Rejected', columns },
    { key: 12, label: 'Resume Shorlisted', columns },
    {
      key: 13,
      label: 'Schedule Pending',
      columns: columns_,
      expandedRowRender: (record) => {
        const rounds = safeJsonParse(record?.interviewRounds) || []
        return (
          <div className="horizontal-timeline-container">
            <div className="timeline-actions">
              <h4 className="timeline-title">Final Result: {record?.finalResult}</h4>
              <div>
                <button
                  className="schedule-btn"
                  onClick={() => {
                    setcurrentRecord(record)
                    setconfirmModal(true)
                    setconfirmMdalHeader('Move In Complete Interview')
                  }}
                >
                  Move In Complete Interview
                </button>
                <button
                  className="schedule-btn"
                  onClick={() => {
                    setcurrentRecord(record)
                    setconfirmModal(true)
                    setconfirmMdalHeader('Move In Negotaition')
                  }}
                  style={{ marginLeft: 8 }}
                >
                  Move In Negotaition
                </button>
                <button
                  className="schedule-btn"
                  onClick={() => {
                    handleInitiateScheduleInterview(record)
                  }}
                  style={{ marginLeft: 8 }}
                >
                  Schedule Next Round Interview
                </button>
              </div>
            </div>

            <div className="horizontal-timeline">
              {rounds && Array.isArray(rounds) && rounds.map((round, index) => (
                <div className="timeline-step" key={index}>
                  <div
                    className={`circle ${round?.Status === 'Qualified' ? 'completed' : 'pending'}`}
                  />
                  {index !== rounds.length - 1 && <div className="timeline-line" />}{' '}
                  {dayjs(round.InterviewDateTime).format('DD/MM/YYYY HH:mm')}
                  <div
                    className="step-content"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}
                  >
                    <div className="round-name">Round {round.RoundId}</div>
                    {round?.interviewers && Array.isArray(round?.interviewers) && round?.interviewers.map((elem, idx) => {
                      const feedbackData = safeJsonParse(elem?.feedback)
                      return (
                        <div
                          key={idx}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}
                        >
                          <span> By {elem?.name}</span>
                          <span>
                            Remarks:{' '}
                            <Tooltip
                              overlayInnerStyle={{ width: 'fit-content' }}
                              title={
                                feedbackData ? (
                                  <>
                                    <div>
                                      <strong>Decision:</strong> {feedbackData.decision || 'N/A'}
                                    </div>
                                    <br />
                                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                      <thead>
                                        <tr>
                                          <th
                                            style={{ border: '1px solid #ccc', padding: '2px 4px' }}
                                          >
                                            Category
                                          </th>
                                          <th
                                            style={{ border: '1px solid #ccc', padding: '2px 4px' }}
                                          >
                                            Rating
                                          </th>
                                          <th
                                            style={{ border: '1px solid #ccc', padding: '2px 4px' }}
                                          >
                                            Remarks
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {feedbackData?.reviews && Array.isArray(feedbackData.reviews) &&
                                          feedbackData.reviews.map((review, index) => (
                                            <tr key={index}>
                                              <td
                                                style={{
                                                  border: '1px solid #ccc',
                                                  padding: '2px 4px',
                                                  whiteSpace: 'nowrap',
                                                }}
                                              >
                                                {review.category}
                                              </td>
                                              <td
                                                style={{
                                                  border: '1px solid #ccc',
                                                  padding: '2px 4px',
                                                }}
                                              >
                                                {review.rating}
                                              </td>
                                              <td
                                                style={{
                                                  border: '1px solid #ccc',
                                                  padding: '2px 4px',
                                                  whiteSpace: 'nowrap',
                                                }}
                                              >
                                                {review.remarks}
                                              </td>
                                            </tr>
                                          ))}
                                      </tbody>
                                    </table>
                                    <br />
                                    <div style={{ whiteSpace: 'nowrap' }}>
                                      <strong>Final Remarks:</strong>{' '}
                                      {feedbackData.finalRemarks || 'N/A'}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    Decision: {elem.status || 'N/A'}
                                    <br />
                                    Feedback: N/A
                                  </>
                                )
                              }
                            >
                              <ExclamationCircleOutlined
                                style={{ fontSize: 18, backgroundColor: 'yellow' }}
                              />
                            </Tooltip>
                          </span>
                        </div>
                      )
                    })}
                    <div>
                      Status:{' '}
                      <strong style={{ color: round?.Status === 'Qualified' ? 'green' : 'red' }}>
                        {!round?.Status ? 'Pending' : round?.Status}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      },
    },
    {
      key: 14,
      label: 'Upcoming Interviews',
      columns: columns_,
      expandedRowRender: (record) => {
        const rounds = safeJsonParse(record?.interviewRounds) || []
        return (
          <div className="horizontal-timeline-container">
            <div className="timeline-actions">
              <h4 className="timeline-title">Final Result: {record?.finalResult}</h4>
            </div>
            <div className="horizontal-timeline">
              {rounds && Array.isArray(rounds) && rounds.map((round, index) => (
                <div className="timeline-step" key={index}>
                  <div
                    className={`circle ${round?.Status === 'Qualified' ? 'completed' : 'pending'}`}
                  />
                  {index !== rounds.length - 1 && <div className="timeline-line" />}{' '}
                  {round.InterviewDateTime &&
                    dayjs(round?.InterviewDateTime).format('DD/MM/YYYY HH:mm A')}
                  <div
                    className="step-content"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}
                  >
                    <div className="round-name">Round {round.RoundId}</div>
                    {round?.interviewers && Array.isArray(round?.interviewers) && round?.interviewers.map((elem, idx) => {
                      const feedbackData = safeJsonParse(elem?.feedback)
                      return (
                        <div key={idx}>
                          By {elem?.name}: Remarks:{' '}
                          <Tooltip
                            overlayInnerStyle={{ width: 'fit-content' }}
                            title={
                              feedbackData ? (
                                <>
                                  <div>
                                    <strong>Decision:</strong> {feedbackData.decision || 'N/A'}
                                  </div>
                                  <br />
                                  <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                    <thead>
                                      <tr>
                                        <th
                                          style={{ border: '1px solid #ccc', padding: '2px 4px' }}
                                        >
                                          Category
                                        </th>
                                        <th
                                          style={{ border: '1px solid #ccc', padding: '2px 4px' }}
                                        >
                                          Rating
                                        </th>
                                        <th
                                          style={{ border: '1px solid #ccc', padding: '2px 4px' }}
                                        >
                                          Remarks
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {Array.isArray(feedbackData.reviews) &&
                                        feedbackData.reviews.map((review, index) => (
                                          <tr key={index}>
                                            <td
                                              style={{
                                                border: '1px solid #ccc',
                                                padding: '2px 4px',
                                                whiteSpace: 'nowrap',
                                              }}
                                            >
                                              {review.category}
                                            </td>
                                            <td
                                              style={{
                                                border: '1px solid #ccc',
                                                padding: '2px 4px',
                                              }}
                                            >
                                              {review.rating}
                                            </td>
                                            <td
                                              style={{
                                                border: '1px solid #ccc',
                                                padding: '2px 4px',
                                                whiteSpace: 'nowrap',
                                              }}
                                            >
                                              {review.remarks}
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                  <br />
                                  <div style={{ whiteSpace: 'nowrap' }}>
                                    <strong>Final Remarks:</strong>{' '}
                                    {feedbackData.finalRemarks || 'N/A'}
                                  </div>
                                </>
                              ) : (
                                <>
                                  Decision: {elem.status || 'N/A'}
                                  <br />
                                  Feedback: N/A
                                </>
                              )
                            }
                          >
                            <ExclamationCircleOutlined
                              style={{ fontSize: 18, backgroundColor: 'yellow' }}
                            />
                          </Tooltip>
                        </div>
                      )
                    })}
                    <div>
                      Status:{' '}
                      <strong style={{ color: round?.Status === 'Qualified' ? 'green' : 'red' }}>
                        {!round?.Status ? 'Pending' : round?.Status}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      },
    },
    {
      key: 15,
      label: 'Interview Completed',
      columns: columns_,
      expandedRowRender: (record) => {
        const rounds = safeJsonParse(record?.interviewRounds) || []
        return (
          <div className="horizontal-timeline-container">
            <div className="timeline-actions">
              <h4 className="timeline-title">Final Result: {record?.finalResult}</h4>
              <div>
                <button
                  className="schedule-btn"
                  onClick={() => {
                    setcurrentRecord(record)
                    setconfirmModal(true)
                    setconfirmMdalHeader('Move In Negotaition')
                  }}
                  style={{ marginLeft: 8 }}
                >
                  Move In Negotaition
                </button>
              </div>
            </div>
            <div className="horizontal-timeline">
              {rounds && Array.isArray(rounds) && rounds.map((round, index) => (
                <div className="timeline-step" key={index}>
                  <div
                    className={`circle ${round?.Status === 'Qualified' ? 'completed' : 'pending'}`}
                  />
                  {index !== rounds.length - 1 && <div className="timeline-line" />}
                  <div
                    className="step-content"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}
                  >
                    <div className="round-name">Round {round.RoundId}</div>
                    {rounds?.interviewers && Array.isArray(rounds?.interviewers) && round?.interviewers.map((elem, idx) => {
                      const feedbackData = safeJsonParse(elem?.feedback)
                      return (
                        <div key={idx}>
                          By {elem?.name}: Remarks:{' '}
                          <Tooltip
                            overlayInnerStyle={{ width: 'fit-content' }}
                            title={
                              feedbackData ? (
                                <>
                                  <div>
                                    <strong>Decision:</strong> {feedbackData.decision || 'N/A'}
                                  </div>
                                  <br />
                                  <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                    <thead>
                                      <tr>
                                        <th
                                          style={{ border: '1px solid #ccc', padding: '2px 4px' }}
                                        >
                                          Category
                                        </th>
                                        <th
                                          style={{ border: '1px solid #ccc', padding: '2px 4px' }}
                                        >
                                          Rating
                                        </th>
                                        <th
                                          style={{ border: '1px solid #ccc', padding: '2px 4px' }}
                                        >
                                          Remarks
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {Array.isArray(feedbackData.reviews) &&
                                        feedbackData.reviews.map((review, index) => (
                                          <tr key={index}>
                                            <td
                                              style={{
                                                border: '1px solid #ccc',
                                                padding: '2px 4px',
                                                whiteSpace: 'nowrap',
                                              }}
                                            >
                                              {review.category}
                                            </td>
                                            <td
                                              style={{
                                                border: '1px solid #ccc',
                                                padding: '2px 4px',
                                              }}
                                            >
                                              {review.rating}
                                            </td>
                                            <td
                                              style={{
                                                border: '1px solid #ccc',
                                                padding: '2px 4px',
                                                whiteSpace: 'nowrap',
                                              }}
                                            >
                                              {review.remarks}
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                  <br />
                                  <div style={{ whiteSpace: 'nowrap' }}>
                                    <strong>Final Remarks:</strong>{' '}
                                    {feedbackData.finalRemarks || 'N/A'}
                                  </div>
                                </>
                              ) : (
                                <>
                                  Decision: {elem.status || 'N/A'}
                                  <br />
                                  Feedback: N/A
                                </>
                              )
                            }
                          >
                            <ExclamationCircleOutlined
                              style={{ fontSize: 18, backgroundColor: 'yellow' }}
                            />
                          </Tooltip>
                        </div>
                      )
                    })}
                    <div>
                      Status:{' '}
                      <strong style={{ color: round?.Status === 'Qualified' ? 'green' : 'red' }}>
                        {!round?.Status ? 'Pending' : round?.Status}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      },
    },
    {
      key: 11,
      label: 'Negotiation',
      columns: columns__,
      expandedRowRender: (record) => {
        const rounds = safeJsonParse(record?.interviewRounds) || []
        return (
          <div className="horizontal-timeline-container">
            <div className="timeline-actions">
              <h4 className="timeline-title">Final Result: {record?.finalResult}</h4>
            </div>
            <div className="horizontal-timeline">
              {rounds && Array.isArray(rounds) &&  rounds.map((round, index) => (
                <div className="timeline-step" key={index}>
                  <div
                    className={`circle ${round?.Status === 'Qualified' ? 'completed' : 'pending'}`}
                  />
                  {index !== rounds.length - 1 && <div className="timeline-line" />}
                  <div
                    className="step-content"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}
                  >
                    <div className="round-name">Round {round.RoundId}</div>
                    {rounds?.interviewers && Array.isArray(rounds?.interviewers) && round?.interviewers.map((elem, idx) => {
                      const feedbackData = safeJsonParse(elem?.feedback)
                      return (
                        <div key={idx}>
                          By {elem?.name}: Remarks:{' '}
                          <Tooltip
                            overlayInnerStyle={{ width: 'fit-content' }}
                            title={
                              feedbackData ? (
                                <>
                                  <div>
                                    <strong>Decision:</strong> {feedbackData.decision || 'N/A'}
                                  </div>
                                  <br />
                                  <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                    <thead>
                                      <tr>
                                        <th
                                          style={{ border: '1px solid #ccc', padding: '2px 4px' }}
                                        >
                                          Category
                                        </th>
                                        <th
                                          style={{ border: '1px solid #ccc', padding: '2px 4px' }}
                                        >
                                          Rating
                                        </th>
                                        <th
                                          style={{ border: '1px solid #ccc', padding: '2px 4px' }}
                                        >
                                          Remarks
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {Array.isArray(feedbackData.reviews) &&
                                        feedbackData.reviews.map((review, index) => (
                                          <tr key={index}>
                                            <td
                                              style={{
                                                border: '1px solid #ccc',
                                                padding: '2px 4px',
                                                whiteSpace: 'nowrap',
                                              }}
                                            >
                                              {review.category}
                                            </td>
                                            <td
                                              style={{
                                                border: '1px solid #ccc',
                                                padding: '2px 4px',
                                              }}
                                            >
                                              {review.rating}
                                            </td>
                                            <td
                                              style={{
                                                border: '1px solid #ccc',
                                                padding: '2px 4px',
                                                whiteSpace: 'nowrap',
                                              }}
                                            >
                                              {review.remarks}
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                  <br />
                                  <div style={{ whiteSpace: 'nowrap' }}>
                                    <strong>Final Remarks:</strong>{' '}
                                    {feedbackData.finalRemarks || 'N/A'}
                                  </div>
                                </>
                              ) : (
                                <>
                                  Decision: {elem.status || 'N/A'}
                                  <br />
                                  Feedback: N/A
                                </>
                              )
                            }
                          >
                            <ExclamationCircleOutlined
                              style={{ fontSize: 18, backgroundColor: 'yellow' }}
                            />
                          </Tooltip>
                        </div>
                      )
                    })}
                    <div>
                      Status:{' '}
                      <strong style={{ color: round?.Status === 'Qualified' ? 'green' : 'red' }}>
                        {!round?.Status ? 'Pending' : round?.Status}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      },
    },
  ]

  const roleBasedTabVisibility = {
    Audit: [14],
    HR: [4, 6, 9, 2, 10, 11, 12, 13, 14, 15],
    Employee: [14],
    ClusterManager: [14],
    StoreHR: [14],
    SuperAdmin: [4, 6, 9, 2, 10, 11, 12, 13, 14, 15],
    Master: [4, 6, 9, 2, 10, 11, 12, 13, 14, 15],
    'IT Superadmin': [4, 6, 9, 2, 10, 11, 12, 13, 14, 15],
    RetailHead: [14],
    RegionalManager: [14],
    Zone: [14],
    Finance: [14],
  }

  const tabConfigs = visibleTabs.filter((tab) =>
    roleBasedTabVisibility[userRole]?.includes(tab.key),
  )

  const handleSearch = (e) => {
    setsearchTextt(e.target.value)
  }

  const handleTabChange = (key) => setactiveKey(key)

  const UpdateApplicant = async (id, value) => {
    try {
      const payload = { applicantId: id, statusId: value }
      await updateApplicantStatusById(payload)
      await ApplicationListData()
      message.success('Status Updated Successfully')
    } catch (error) {
      message.error('Update Applicant Error')
    }
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
  }

  const handleInitializeCandidate = async (val) => {
    try {
      await dispatch(set({ loading: true }))
      await applicantApproval({
        candidateId: selectedCandidateId,
        statusId: val.selectedOption,
        isApplicant: true,
        isApplicantApproved: val.selectedOption === 1,
      })
      await ApplicationListData()
      message.success('Action Completed Successfully')
    } catch (error) {
      message.error('Action Failed')
    } finally {
      setapproveModel(false)
      dispatch(set({ loading: false }))
    }
  }

  const handleInitializeReviewFormSubmit = async (val) => {
    try {
      await dispatch(set({ loading: true }))
      await interviewerApprovalforApplicantInterview({
        scheduleId: currentRecord?.lastScheduleId,
        feedback: await JSON.stringify(val),
        statusName: val.decision,
      })
      await ApplicationListData()
      message.success('Action Completed Successfully')
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Action Failed'
      message.error(errorMsg)
    } finally {
      setopenResponsive(false)
      dispatch(set({ loading: false }))
    }
  }

  const handleInitializeConfirmModal = async () => {
    try {
      let statusId = 0
      if (confirmMdalHeader === 'Move In Complete Interview') statusId = 15
      else if (confirmMdalHeader === 'Move In Negotaition') statusId = 11
      else return

      await updateApplicantStatusById({ applicantId: currentRecord?.id, statusId })
      await ApplicationListData()
      message.success('Status Updated Successfully')
    } catch (error) {
      message.error('Update Applicant Error')
    } finally {
      setconfirmModal(false)
      setSelectedRowKeys([])
      setcurrentRecord(null)
    }
  }

  const sendOfferLetterEmail = async () => {
    try {
      await sendMailOfferLetter(selectedRowKeys)
      message.success('Offer Letter Send by Mail Successfully')
    } catch (error) {
      message.error(error.response?.data?.message || 'Error In Email Sent')
    }
    setSelectedRowKeys([])
  }

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
      <div className="abc_vp">
        <Tabs
          activeKey={activeKey}
          onChange={handleTabChange}
          type="card"
          items={tabConfigs.map(({ key, label, columns, expandedRowRender }) => {
            const tableColumns = columns
            const mobileExpanded = expandedRowRender

            return {
              key,
              label,
              children: (
                <>
                  <TableBulkActionIcons
                    totalRecords={totalRecords}
                    selectedRowKeys={selectedRowKeys}
                    handleSearch={handleSearch}
                    sendOfferLetterEmail={sendOfferLetterEmail}
                    searchText={searchTextt}
                    activeKey={activeKey}
                    actionsMap={actionsMap} // ✅ pass actions map
                    setimportExelModal={setimportExelModal} // ✅ open upload modal
                  />
                  {!isMobile ? (
                    <Table
                      rowKey="id"
                      size={isMobile ? 'small' : 'middle'}
                      rowSelection={{ type: selectionType, ...rowSelection }}
                      columns={tableColumns}
                      pagination={{
                        current: currentPage,
                        total: totalRecords,
                        position: ['bottomRight'],
                        pageSize,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        onChange: (p, ps) => {
                          setCurrentPage(p)
                          setPageSize(ps)
                        },
                      }}
                      dataSource={currentTabData}
                      bordered
                      expandedRowRender={mobileExpanded}
                      scroll={{
                        x: 'max-content',
                        y: 'calc(100vh - 160px)',
                      }}
                      className={theme === 'dark' ? 'dark-theme' : ''}
                    />
                  ) : (
                    <div>
                      <div
                        style={{
                          backgroundColor: '#fafafa',
                          borderRadius: '8px 8px 0 0',
                          border: '1px solid #d9d9d9',
                          borderBottom: '2px solid #1890ff',
                          position: 'sticky',
                          top: 0,
                          zIndex: 100,
                        }}
                      >
                        <table
                          style={{
                            width: '100%',
                            tableLayout: 'fixed',
                            borderCollapse: 'collapse',
                            fontSize: 11,
                          }}
                        >
                          <colgroup>
                            <col style={{ width: '30%' }} />
                            <col style={{ width: '25%' }} />
                            <col style={{ width: '25%' }} />
                            <col style={{ width: '20%' }} />
                          </colgroup>
                          <thead>
                            <tr>
                              <th
                                style={{
                                  padding: '10px 4px',
                                  textAlign: 'center',
                                  fontWeight: 600,
                                }}
                              >
                                Name
                              </th>
                              <th
                                style={{
                                  padding: '10px 4px',
                                  textAlign: 'center',
                                  fontWeight: 600,
                                }}
                              >
                                Email
                              </th>
                              <th
                                style={{
                                  padding: '10px 4px',
                                  textAlign: 'center',
                                  fontWeight: 600,
                                }}
                              >
                                Phone
                              </th>
                              <th
                                style={{
                                  padding: '10px 4px',
                                  textAlign: 'center',
                                  fontWeight: 600,
                                }}
                              >
                                Action
                              </th>
                            </tr>
                          </thead>
                        </table>
                      </div>

                      {currentTabData
                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                        .map((record) => {
                          const isExpanded = expandedCards[record.id]
                          const designation = Designation.find(
                            (d) => Number(d.designationId) === Number(record.designation),
                          )

                          return (
                            <div
                              key={record.id}
                              style={{
                                border: '1px solid #d9d9d9',
                                borderTop: 'none',
                                background: '#fff',
                              }}
                            >
                              <table
                                style={{
                                  width: '100%',
                                  tableLayout: 'fixed',
                                  borderCollapse: 'collapse',
                                  fontSize: 11,
                                }}
                              >
                                <colgroup>
                                  <col style={{ width: '25%' }} />
                                  <col style={{ width: '30%' }} />
                                  <col style={{ width: '25%' }} />
                                  <col style={{ width: '20%' }} />
                                </colgroup>
                                <tbody>
                                  <tr>
                                    <td
                                      style={{
                                        padding: '8px 4px',
                                        textAlign: 'center',
                                        fontSize: 10,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {record.firstName || '-'}
                                    </td>
                                    <td
                                      style={{
                                        padding: '8px 4px',
                                        textAlign: 'center',
                                        fontSize: 9,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {record.email || '-'}
                                    </td>
                                    <td
                                      style={{
                                        padding: '8px 4px',
                                        textAlign: 'center',
                                        fontSize: 10,
                                      }}
                                    >
                                      {record.phone || '-'}
                                    </td>
                                    <td
                                      style={{
                                        padding: '8px 4px',
                                        textAlign: 'center',
                                        display: 'flex',
                                        gap: 2,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <Space size="small">
                                        {record?.statusId == 12 && (
                                          <Tooltip title="Schedule">
                                            <ScheduleOutlined
                                              style={{ fontSize: 14 }}
                                              onClick={() =>
                                                handleInitiateScheduleInterview(record)
                                              }
                                            />
                                          </Tooltip>
                                        )}
                                        {record?.statusId == 11 && (
                                          <Tooltip title="Approve">
                                            <StepForwardOutlined
                                              style={{ fontSize: 14 }}
                                              onClick={() => handleInitiateClick(record)}
                                            />
                                          </Tooltip>
                                        )}
                                        <Link to={`/applicant/view_interview_form/${record?.id}`}>
                                          <InfoCircleOutlined style={{ fontSize: 14 }} />
                                        </Link>
                                      </Space>
                                      <Button
                                        type="text"
                                        size="small"
                                        icon={isExpanded ? <MinusOutlined /> : <PlusOutlined />}
                                        onClick={() => handleToggleCard(record.id)}
                                        style={{ padding: '2px 4px', fontSize: 10 }}
                                      />
                                    </td>
                                  </tr>
                                </tbody>
                              </table>

                              {isExpanded && (
                                <div
                                  style={{
                                    padding: 8,
                                    background: '#fafafa',
                                    borderTop: '1px solid #e8e8e8',
                                    fontSize: 10,
                                  }}
                                >
                                  <Row gutter={[4, 6]}>
                                    <Col span={6}>
                                      <div
                                        style={{
                                          color: '#8c8c8c',
                                          marginBottom: 2,
                                          fontSize: 9,
                                          textAlign: 'center',
                                        }}
                                      >
                                        Resume
                                      </div>
                                      <div style={{ textAlign: 'center' }}>
                                        {record.resumeLink ? (
                                          <a
                                            href={`${baseUrl}${record.resumeLink}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            <Tag color="blue" style={{ fontSize: 9 }}>
                                              <LinkOutlined /> View
                                            </Tag>
                                          </a>
                                        ) : (
                                          <span style={{ fontSize: 9 }}>-</span>
                                        )}
                                      </div>
                                    </Col>
                                    <Col span={6}>
                                      <div
                                        style={{
                                          color: '#8c8c8c',
                                          marginBottom: 2,
                                          fontSize: 9,
                                          textAlign: 'center',
                                        }}
                                      >
                                        Store Code
                                      </div>
                                      <div
                                        style={{
                                          fontWeight: 500,
                                          fontSize: 9,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          textAlign: 'center',
                                        }}
                                      >
                                        {record.locationName || '-'}
                                      </div>
                                    </Col>
                                    <Col span={6}>
                                      <div
                                        style={{
                                          color: '#8c8c8c',
                                          marginBottom: 2,
                                          fontSize: 9,
                                          textAlign: 'center',
                                        }}
                                      >
                                        Designation
                                      </div>
                                      <div
                                        style={{
                                          fontWeight: 500,
                                          fontSize: 9,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                          textAlign: 'center',
                                        }}
                                      >
                                        {designation?.designationName || '-'}
                                      </div>
                                    </Col>
                                    <Col span={6}>
                                      <div
                                        style={{
                                          color: '#8c8c8c',
                                          marginBottom: 2,
                                          fontSize: 9,
                                          textAlign: 'center',
                                        }}
                                      >
                                        Status
                                      </div>
                                      <div
                                        style={{
                                          textAlign: 'center',
                                          display: 'flex',
                                          justifyContent: 'center',
                                        }}
                                      >
                                        {[4, 6, 2, 9, 12].includes(record.statusId) ? (
                                          <Select
                                            value={record.statusId}
                                            style={{
                                              width: '90px',
                                              fontSize: '7px',
                                            }}
                                            size="small"
                                            onChange={(v) => UpdateApplicant(record.id, v)}
                                            dropdownMatchSelectWidth={85}
                                            popupClassName="mobile-status-compact"
                                          >
                                            <Select.Option value={4}>Pending</Select.Option>
                                            <Select.Option value={2}>Rejected</Select.Option>
                                            <Select.Option value={12}>
                                              Resume Shortlisted
                                            </Select.Option>
                                            <Select.Option value={6}>Hold</Select.Option>
                                            <Select.Option value={9}>Not Interested</Select.Option>
                                          </Select>
                                        ) : (
                                          <Tag
                                            color={statusMapp[record.statusId]?.color}
                                            style={{ fontSize: 7, padding: '0 3px', margin: 0 }}
                                          >
                                            {statusMapp[record.statusId]?.label}
                                          </Tag>
                                        )}
                                      </div>
                                    </Col>
                                  </Row>
                                </div>
                              )}
                            </div>
                          )
                        })}

                      <div
                        style={{
                          marginTop: 16,
                          textAlign: 'center',
                          padding: 12,
                          background: '#fafafa',
                          border: '1px solid #d9d9d9',
                          borderRadius: 4,
                        }}
                      >
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <div style={{ fontSize: 12 }}>
                            Showing {(currentPage - 1) * pageSize + 1} -{' '}
                            {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} items
                          </div>
                          <Space>
                            <Button
                              size="small"
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(currentPage - 1)}
                            >
                              Previous
                            </Button>
                            <span style={{ fontSize: 12 }}>
                              Page {currentPage} of {Math.ceil(totalRecords / pageSize)}
                            </span>
                            <Button
                              size="small"
                              disabled={currentPage >= Math.ceil(totalRecords / pageSize)}
                              onClick={() => setCurrentPage(currentPage + 1)}
                            >
                              Next
                            </Button>
                          </Space>
                        </Space>
                      </div>
                    </div>
                  )}
                </>
              ),
            }
          })}
        />
      </div>

      {/* ✅ REOPEN MODAL */}
<Modal
  title="Reopen Applicant"
  open={reopenModalOpen}
  onCancel={() => {
    setReopenModalOpen(false)
    setReopenRemarks('')
    setReopenCandidateId(null)
  }}
  footer={[
    <Button
      key="cancel"
      onClick={() => {
        setReopenModalOpen(false)
        setReopenRemarks('')
        setReopenCandidateId(null)
      }}
    >
      Cancel
    </Button>,
    <Button
      key="submit"
      type="primary"
      loading={reopenLoading}
      onClick={handleSubmitReopen}
    >
      Submit
    </Button>,
  ]}
>
  <div style={{ marginBottom: 6, fontWeight: 600 }}>
    Remarks <span style={{ color: 'red' }}>*</span>
  </div>

  <TextArea
    rows={4}
    value={reopenRemarks}
    onChange={(e) => setReopenRemarks(e.target.value)}
    placeholder="Enter remarks..."
  />
</Modal>


      <ApproveModel
        initiateModalOpen={approveModel}
        setInitiateModalOpen={setapproveModel}
        handleInitializeCandidate={handleInitializeCandidate}
      />

      <InterviewScheduleModal
        initiateModalOpen={initiateModalOpen}
        setInitiateModalOpen={() => setInitiateModalOpen(false)}
        firstname={firstname}
        currentRecord={currentRecord}
        ApplicationListData={ApplicationListData}
      />

      <ApplicantOfferLetterModal
        offerLetterModel={offerLetterModels}
        setofferLetterModel={setofferLetterModels}
        defaultModelData={defaultModelData}
        ApplicationListData={ApplicationListData}
      />

      <CallFormModal
        isCallModalOpen={isCallModalOpen}
        setIsCallModalOpen={setIsCallModalOpen}
        callModalPreData={callModalPreData !== null && callModalPreData}
      />

      {/* <ExcelImportModal
        importExelModal={importExelModal}
        setimportExelModal={setimportExelModal}
        title_fields={title_fields}
      /> */}

      <ApplicantBulkUpload
        isVisible={importExelModal}
        setIsVisible={setimportExelModal}
        refreshData={ApplicationListData}
      />

      <ConfirmModal
        open={confirmModal}
        onCancel={() => setconfirmModal(false)}
        onSubmit={handleInitializeConfirmModal}
        title={confirmMdalHeader}
      />

      <ReviewModal
        openResponsive={openResponsive}
        setOpenResponsive={() => setopenResponsive(false)}
        onSubmit={handleInitializeReviewFormSubmit}
      />
    </>
  )
}

const TableBulkActionIcons = ({
  totalRecords,
  selectedRowKeys,
  handleSearch,
  sendOfferLetterEmail,
  searchText,
  activeKey,
  actionsMap, // ✅ NEW
  setimportExelModal, // ✅ NEW
}) => {
  const { theme } = useSelector((state) => state.ui)
  const [statusSummary, setstatusSummary] = useState([
    { name: 'Total Rows', label: 'Pending Interview Schedule', count: 0, color: 'green' },
    { name: 'Selected Rows', label: 'Rejected', count: 0, color: 'blue' },
  ])
  const [isApplicantTabExporting, setIsApplicantTabExporting] = useState(false)
  const [isApplicantAllExporting, setIsApplicantAllExporting] = useState(false)

  useEffect(() => {
    setstatusSummary([
      {
        name: 'Total Rows',
        label: 'Pending Interview Schedule',
        count: totalRecords,
        color: 'green',
      },
      { name: 'Selected Rows', label: 'Rejected', count: selectedRowKeys.length, color: 'blue' },
    ])
  }, [selectedRowKeys, totalRecords])

  const emailButton = selectedRowKeys.length < 1 || activeKey != 11

  const handleDownloadExcel = async (e, statusId) => {
    const currentStatusId = statusId !== null && statusId !== undefined ? statusId : activeKey
    const isAllDataExporting = statusId !== null && statusId !== undefined

    try {
      isAllDataExporting ? setIsApplicantAllExporting(true) : setIsApplicantTabExporting(true)

      const response = await exportApplicantDataByStatus(parseInt(currentStatusId))
      // console.log('applicant excel response:', response)

      if (response.status === 200) {
        // build a blob and get the filename from header if present
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })

        const newDate = new Date()

        // create dodument link and click it
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.setAttribute('download', `Applicant_List_Data_${newDate}`)
        document.body.appendChild(link)
        link.click()
        link.remove()
      }
    } catch (error) {
      message.error(
        error?.response?.data?.message || error?.response?.data?.error || 'Error downloading excel',
      )
      console.error('applicant download error:', error)
    } finally {
      isAllDataExporting ? setIsApplicantAllExporting(false) : setIsApplicantTabExporting(false)
    }
  }

  return (
    <div
      style={{
        padding: 5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
      }}
    >
      <Space>
        {Array.isArray(statusSummary) && statusSummary.map(({ name, label, count }, index) => (
          <div
            key={index}
            style={{
              border: '2px solid #ccc',
              padding: 3,
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'center',
            }}
            className={theme === 'dark' ? 'dark-theme' : ''}
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
                  padding: '0 8px',
                }}
              >
                {count} {name}
              </span>
            </Tooltip>
          </div>
        ))}
      </Space>
      <Row>
        <Col>
          {/* <Tooltip placement="top" title={'Send Email'} style={{ marginLeft: 5 }}>
            <Button onClick={sendOfferLetterEmail} disabled={emailButton}>
              <MailOutlined />
            </Button>
          </Tooltip> */}
          {
            activeKey === 12 
            &&
            <Tooltip placement="top" title={'Show Scheduled'}>
                <ShortListedApplicantListModal />
            </Tooltip>
          }

          {
            activeKey === 14 
            &&
            <Tooltip placement="top" title={'Action History'}>
                <ApplicantInterviewActionHistoryModal />
            </Tooltip>
          }


          <Tooltip placement="top" title={'Export'}>
            <Button
              style={{ marginLeft: 5 }}
              onClick={(e) => handleDownloadExcel(e, 0)}
              loading={isApplicantAllExporting}
            >
              <ExportOutlined /> All Data
            </Button>
          </Tooltip>

          <Tooltip placement="top" title={'Export'}>
            <Button
              style={{ marginLeft: 5 }}
              onClick={handleDownloadExcel}
              loading={isApplicantTabExporting}
            >
              <ExportOutlined /> Current Tab
            </Button>
          </Tooltip>

          {/* ✅ Upload icon – opens ApplicantBulkUpload */}
          <Tooltip placement="top" title="Upload Applicants">
            <Button style={{ marginLeft: 5 }} onClick={() => setimportExelModal(true)}>
              <UploadOutlined />
            </Button>
          </Tooltip>
        </Col>

        <Search
          value={searchText}
          placeholder="Search in table..."
          allowClear
          onChange={handleSearch}
          style={{ width: 300, marginLeft: 5 }}
        />
      </Row>
    </div>
  )
}

export default ApplicantList
