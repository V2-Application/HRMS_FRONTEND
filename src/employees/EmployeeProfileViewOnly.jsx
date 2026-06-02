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
  Image,
  Tag,
  Divider,
  Radio,
  Typography,
} from 'antd'
import {
  PlusOutlined,
  RollbackOutlined,
  UploadOutlined,
  CloseOutlined,
  DeleteRowOutlined,
} from '@ant-design/icons'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './employee_view_mode.css'
import dayjs from 'dayjs'
import TextArea from 'antd/es/input/TextArea'
import AcceptOfferModal from '../components/modals/AcceptOfferModal '
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../redux/uiSlice'
import {
  getDropdownLocDesDep,
  getDropdownComp,
  getCandidateById,
  createUpdateCandidate,
  getEmployeeById,
  searchEmployeeDropdown,
} from '../services/Services'
import { useWatch } from 'antd/es/form/Form'
import SalarySlips from '../components/payroll/SalarySlips'
import MedicalCardAdmin from '../MedicalCard'
import axiosInstance from '../services/axiosInstance'
import axios from 'axios'
const { Title, Text } = Typography
import { Grid } from 'antd'

const baseUrl = import.meta.env.VITE_API_URL

const { RangePicker } = DatePicker

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

/** ✅ NAPS CONDITION (Department OR Designation) */
const NAPS_DEPARTMENT_ID = 35
const NAPS_DESIGNATION_IDS = new Set([
  1445, 1446, 1447, 1448, 1449, 1450, 1451, 1474, 1475, 1477, 1479, 1480,
])

const EmployeeProfile = () => {
  const locat = useLocation()
  const loc = locat.pathname
  const { theme } = useSelector((state) => state.ui)
  const role = useSelector((state) => state.auth.data?.role)
  const { employeeId, isStore } = useSelector((state) => state?.auth?.data)
  const { pathname, state } = useLocation()
  // const { furtherParts } = state || {}
  const navigate = useNavigate()
  const username = localStorage.getItem('username')
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
  const [companys, setcompanys] = useState([{ value: '', label: '' }])
  const [locations, setLocations] = useState([])
  const [fileLists, setFileLists] = useState({})
  const [statusId, setStatusId] = useState(0)
  const [applicantCode, setApplicantCode] = useState('')
  const [activeTab, setActiveTab] = useState('1')
  const [profilePhoto, setProfilePhoto] = useState([])
  const [visible, setVisible] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [previewVideo, setPreviewVideo] = useState('')
  const [isVideoPreview, setIsVideoPreview] = useState(false)

  // ✅ NEW: AntD Image preview controller (gives zoom in/out, rotate, drag)
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false)

  const [deletedFiles, setDeletedFiles] = useState([])
  const [assignments, setAssignments] = useState([])
  const [transferType, setTransferType] = useState('temporary')
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [assignedOnDate, setassignedOnDate] = useState(null)
  const [releasedOnDate, setreleasedOnDate] = useState(null)
  const [assignedLocation, setassignedLocation] = useState()
  const [assignedReason, setassignedReason] = useState()
  const [isCandidate, setIsCandidate] = useState(false)
  const [searchText, setsearchText] = useState('')
  const [Employees, setEmployees] = useState([])
  const [selectedEmpCode, setSelectedEmpCode] = useState('')
  const [searchLoading, setsearchLoading] = useState(false)
  const [shiftList, setShiftList] = useState([])
  const isActive = form.getFieldValue(['user', 'isActive'])
  const isRelativeInCompany = useWatch(['user', 'isRelativeInCompany'], form)

  const watch_basicSalary = Form.useWatch(['user', 'basicSalary'], form)
  const watch_cca = Form.useWatch(['user', 'cca'], form)
  const watch_da = Form.useWatch(['user', 'da'], form)
  const watch_extraAllowance = Form.useWatch(['user', 'extraAllowance'], form)
  const watch_specialAllowance = Form.useWatch(['user', 'specialAllowance'], form)
  const watch_hra = Form.useWatch(['user', 'hra'], form)
  const watch_monthlyGrossCTC = Form.useWatch(['user', 'monthlyGrossCTC'], form)

  // ✅ NAPS based on Department OR Designation
  const [isNapsDept, setIsNapsDept] = useState(false)
  const watch_department = Form.useWatch(['user', 'department'], form)
  const watch_designation = Form.useWatch(['user', 'designation'], form)

  const [furtherParts, setFurtherParts] = useState(() => {
    if (location.state?.furtherParts) return location.state.furtherParts

    const stored = sessionStorage.getItem('viewPageState')
    if (!stored) return []
    try {
      return JSON.parse(stored).furtherParts || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    // optional: clean up so it doesn't leak
    return () => {
      sessionStorage.removeItem('viewPageState')
    }
  }, [])

  useEffect(() => {
    const deptIsNaps = String(watch_department || '') === String(NAPS_DEPARTMENT_ID)
    const desgIsNaps = NAPS_DESIGNATION_IDS.has(Number(watch_designation))
    setIsNapsDept(deptIsNaps || desgIsNaps)
  }, [watch_department, watch_designation])

  const baseLocation = 'Mumbai'
  const dispatch = useDispatch()
  const rolesToCheck = ['Master']
  const isImageFile = (fileName) => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)
  const isPdfFile = (fileName) => /\.pdf$/i.test(fileName)
  const isExcelFile = (fileName) => /\.(xls|xlsx)$/i.test(fileName)
  const isWordFile = (fileName) => /\.(doc|docx)$/i.test(fileName)
  const isVideoFile = (fileName = '') =>
    /\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i.test(fileName.toLowerCase()) || /^video\//i.test(fileName)
  const [actionMap, setActionMap] = useState({})
  const [isSalarySlipVisible, setIsSalarySlipVisible] = useState(false)
  const [isSalaryDetailsVisible, setIsSalaryDetailsVisible] = useState(false)
  const [isLocationTabVisible, setIsLocationTabVisible] = useState(false)

  const { useBreakpoint } = Grid
  const screens = useBreakpoint()

  const FILE_HOST = 'https://v2parivar.v2retail.com:9987'

  const normalizeUrl = (u) => {
    if (!u) return null
    u = String(u).replace(/\\/g, '/')

    // If backend gave only a path, prefix host
    if (!/^https?:\/\//i.test(u)) {
      u = `${FILE_HOST.replace(/\/$/, '')}/${u.replace(/^\/+/, '')}`
    }

    // Fix double encoding like %2520 -> %20
    try {
      u = decodeURI(u)
    } catch (e) {}

    return encodeURI(u)
  }

  const bustCache = (u) => {
    if (!u) return u
    const sep = u.includes('?') ? '&' : '?'
    return `${u}${sep}t=${Date.now()}`
  }

  const getDocUrl = (f) => {
    const urlRaw = f?.url || f?.thumbUrl || (f?.filePath ? f.filePath : null)
    const url = urlRaw ? normalizeUrl(urlRaw) : null
    return url ? bustCache(url) : null
  }

  const downloadFile = async (url, filename = 'file') => {
    const finalUrl = url ? normalizeUrl(url) : null
    if (!finalUrl) return

    try {
      const res = await fetch(finalUrl, {
        method: 'GET',
        cache: 'no-store', // ✅ avoid 304
        mode: 'cors',
        // credentials: 'include', // ✅ keep ONLY if server uses cookie auth
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()

      URL.revokeObjectURL(blobUrl)
    } catch (e) {
      // ✅ fallback that does NOT require CORS (opens the file; user can save/download)
      const a = document.createElement('a')
      a.href = finalUrl
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      a.remove()
    }
  }

  const handleDownloadAllAttachments = async () => {
    const all = []

    Object.entries(fileLists || {}).forEach(([docType, list]) => {
      ;(list || []).forEach((f, idx) => {
        const url = getDocUrl(f)

        const name =
          f?.name ||
          f?.fileName ||
          (typeof url === 'string'
            ? decodeURIComponent(url.split('/').pop()?.split('?')[0] || '')
            : `${docType}_${idx + 1}`)

        if (url) all.push({ url, name })
      })
    })

    if (all.length === 0) {
      message.info('No attachments found to download.')
      return
    }

    for (const item of all) {
      await downloadFile(item.url, item.name)
    }

    message.success(`Downloading ${all.length} file(s)...`)
  }

  const isFromCandidatePage =
    pathname.includes('/employee/add_new/view/') ||
    document.referrer.includes('/candidate') ||
    state?.from === 'candidateList'

  const showSalaryFields = rolesToCheck.includes(role)

  const dropdowns = ['department', 'designation', 'location']
  const districts = ['Delhi', 'Mumbai', 'Kolkata', 'Chennai']

  useEffect(() => {
    if (Array.isArray(furtherParts) && furtherParts.length > 0) {
      furtherParts.forEach((actions) => {
        if (actions?.actionFurtherPartName === 'Salary_V') {
          setIsSalaryDetailsVisible(actions?.furtherPartStatus)
        }

        if (actions?.actionFurtherPartName === 'Salary_Slip_V') {
          setIsSalarySlipVisible(actions?.furtherPartStatus)
        }

        if (actions?.actionFurtherPartName === 'Location_Assignment_V') {
          setIsLocationTabVisible(actions?.furtherPartStatus)
        }
      })
    }
  }, [furtherParts])

  useEffect(() => {
    const total =
      (parseFloat(watch_basicSalary) || 0) +
      (parseFloat(watch_cca) || 0) +
      (parseFloat(watch_da) || 0) +
      (parseFloat(watch_extraAllowance) || 0) +
      (parseFloat(watch_specialAllowance) || 0) +
      (parseFloat(watch_hra) || 0)

    form.setFieldsValue({
      user: {
        ...form.getFieldValue('user'),
        monthlyGrossCTC: total.toFixed(2),
      },
    })
  }, [
    watch_basicSalary,
    watch_cca,
    watch_da,
    watch_extraAllowance,
    watch_specialAllowance,
    watch_hra,
    form,
  ])

  useEffect(() => {
    const total =
      (parseFloat(watch_basicSalary) || 0) +
      (parseFloat(watch_hra) || 0) +
      (parseFloat(watch_cca) || 0) +
      (parseFloat(watch_da) || 0) +
      (parseFloat(watch_specialAllowance) || 0)

    form.setFieldsValue({
      user: {
        ...form.getFieldValue('user'),
        grossSalary: total.toFixed(2),
      },
    })
  }, [watch_basicSalary, watch_hra, watch_cca, watch_da, watch_specialAllowance])

  useEffect(() => {
    if (searchText.length >= 2) {
      setsearchLoading(true)
      const debounceTimer = setTimeout(() => {
        const fetchData = async () => {
          try {
            const res = await searchEmployeeDropdown(searchText)
            if (res?.data?.employees?.length > 0) {
              setEmployees(res.data.employees)
            } else {
              setEmployees([])
            }
          } catch (error) {
            console.error('Error fetching employee attendance:', error)
            setEmployees([])
          } finally {
            setsearchLoading(false)
          }
        }
        fetchData()
      }, 1000)
      return () => clearTimeout(debounceTimer)
    }
  }, [searchText])

  const handleSearch = (value) => {
    setsearchText(value)
  }

  const handleRegionChange = (value) => {
    setSelectedRegion(value)
    form.setFieldsValue({ store: undefined })
  }

  function getLocationNameById(id) {
    const location = locations.find((loc) => loc.locationId === id)
    return location ? location.locationName : null
  }

  const handleCancel = (key) => {
    setAssignments((prev) =>
      prev.map((item) => (item.key === key ? { ...item, status: 'Cancelled' } : item)),
    )
    message.info('Assignment cancelled')
  }

  const columns = [
    {
      title: 'Location',
      dataIndex: 'assignedLocation',
      render: (val) => <span>{getLocationNameById(val)}</span>,
    },
    {
      title: 'From',
      dataIndex: ['assignedOnDate', 0],
      render: (date, record) => {
        return record?.assignedOnDate ? dayjs(record?.assignedOnDate).format('YYYY-MM-DD') : null
      },
    },
    {
      title: 'To',
      dataIndex: ['releasedOnDate', 1],
      render: (date, record) => {
        return record?.releasedOnDate ? dayjs(record?.releasedOnDate).format('YYYY-MM-DD') : null
      },
    },
    {
      title: 'Reason',
      dataIndex: 'assignedReason',
      render: (assignedReason) => <span>{assignedReason}</span>,
    },
  ]

  const totalTabs = loc === '/employee/details' ? 5 : 7

  const offerDetails = {
    position: 'Store Incharge',
    company: 'V2 Retails Ltd',
    startDate: 'May 1, 2025',
    location: 'Remote',
  }

  const handleAccept = () => {
    setVisible(false)
  }

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
      ...(showSalaryFields
        ? [
            ['user', 'hra'],
            ['user', 'basicSalary'],
            ['user', 'da'],
            ['user', 'extraAllowance'],
            ['user', 'cca'],
            ['user', 'specialAllowance'],
            ['user', 'monthlyGrossCTC'],
            ['user', 'annuallyNetCTC'],
            ['user', 'CompanyId'],
          ]
        : [['user', 'CompanyId']]),
    ],
    2: [
      ['user', 'maritalStatus'],
      ['user', 'mobile'],
      ['user', 'isRelativeInCompany'],
      ['user', 'emailAddress'],
      ['user', 'bankIfscCode'],
    ],
  }

  const handleTabChange = async (newActiveKey) => {
    if (newActiveKey > activeTab) {
      try {
        await form.validateFields(validateTabFields[activeTab])
        setActiveTab(newActiveKey)
      } catch (errorInfo) {
        console.error('Validation failed:', errorInfo)
        messageApi.error(`Please fill all required fields in tab ${activeTab}.`)
      }
    } else if (newActiveKey < activeTab) {
      setActiveTab(newActiveKey)
    }
  }

  const handleNext = () => {
    setActiveTab((prev) => (Number(prev) < totalTabs ? String(Number(prev) + 1) : prev))
  }

  const handleBack = () => {
    setActiveTab((prev) => (Number(prev) > 1 ? String(Number(prev) - 1) : prev))
  }

  const attachmentLabels = [
    { value: 'Pan', lable: 'PAN Card Attachment', maxCount: 1 },
    { value: 'Aadhar', lable: 'Aadhar Attachment (Front)', maxCount: 1 },
    { value: 'AadharBack', lable: 'Aadhar Attachment (Back)', maxCount: 1 },
    { value: 'SalarySlip', lable: 'Salary Slip Attachment', maxCount: 3 },
    { value: 'BankPassbook', lable: 'Passbook Attachment', maxCount: 3 },
    { value: 'BankStatement', lable: 'Bank Statement', maxCount: 3 },
    { value: 'BankStatementVideo', lable: 'Bank Statement Video', maxCount: 1 },
    { value: 'PrevOfferLetter', lable: 'Prv Company Offer Letter', maxCount: 1 },
    { value: 'Education', lable: 'Education Attachment', maxCount: 10 },
    { value: 'Resume', lable: 'Resume Attachment', maxCount: 1 },
    { value: 'OfferLetter', lable: 'Current Offer Letter', maxCount: 1 },
    { value: 'MedicalCard', lable: 'Medical Card Attachment', maxCount: 1 },
    { value: 'UanCard', lable: 'UAN Card Attachment', maxCount: 1 },
  ]

  const attachmentKeyToFlagMap = {
    Pan: 'isPanAttachmentUploaded',
    Aadhar: 'isAadharAttachmentUploaded',
    AadharBack: 'isAadharBackAttachmentUploaded',
    SalarySlip: 'isSalarySlipUploaded',
    BankPassbook: 'isBankPassbookAttachmentUploaded',
    BankStatement: 'isBankStatementUploaded',
    BankStatementVideo: 'isBankStatementVideoUploaded',
    PrevOfferLetter: 'isPrevOfferLetterUploaded',
    Education: 'isEducationAttachmentUploaded',
    PassportPhoto: 'isPassportPhotoUploaded',
    Resume: 'isResumeAttachmentUploaded',
    OfferLetter: 'isOfferLetterAttachmentUploaded',
  }

  const handleGoBack = () => {
    // navigate(-1)
    // return
    switch (pathname) {
      case '/register':
        navigate('/login')
        break
      case `/employee/add_new/${params.id}`:
        navigate('/candidate/form_list')
        break
      case `/employee/add_new/view/${params.id}`:
        navigate('/candidate/form_list')
        break
      case `/employee/update/view/${params.id}`:
        navigate('/employees/list')
        break
      case `/employee/update/${params.id}`:
        navigate('/employees/list')
        break
      case '/employee/add_new':
        navigate('/candidate/form_list')
        break
      case '/candidate-form':
        navigate('/login')
        break
    }
  }

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('You can only upload image files!')
      return Upload.LIST_IGNORE
    }

    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!')
      return Upload.LIST_IGNORE
    }

    return false
  }

  const fetchDropdowns = async () => {
    try {
      const response = await getDropdownLocDesDep(dropdowns.join(', '))

      if (response.status) {
        let deptArr = response.data?.Department
        const desgArr = response.data?.Designation
        const locArr = response.data?.Location

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
    if (pathname.startsWith('/applicant')) {
      setVisible(true)
    }
  }, [])

  const fetchDropdownsComp = async () => {
    try {
      const response = await getDropdownComp(dropdowns.join(', '))

      if (response.status) {
        const compArr = response.data?.filter((c) => c?.companyId !== 2)
        setcompanys(compArr)
      }
    } catch (error) {
      console.error('dropdowns api error:', error)
    }
  }

  useEffect(() => {
    fetchDropdownsComp()
    if (pathname.startsWith('/applicant')) {
      setVisible(true)
    }
  }, [])

  const handleUploadChanges = (documentType, info) => {
    const { file, fileList } = info
    if (file.status === 'removed') {
      setDeletedFiles((prev) => [...prev, file])
    }

    setFileLists((prev) => ({
      ...prev,
      [documentType]: fileList,
    }))
  }

  const handleUploadChange = ({ fileList }) => {
    if (fileList.length > 0) {
      setImageValue([fileList[fileList.length - 1]])
    }
  }

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

  const cleanFields = (data) => {
    const cleanedData = {}
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null || value === 'undefined') {
        cleanedData[key] = ''
      } else {
        cleanedData[key] = value
      }
    })
    return cleanedData
  }

  const fetchData = async () => {
    await dispatch(set({ loading: true }))

    try {
      let response

      if (pathname.includes('/employee/update')) {
        response = await getEmployeeById(params.id)
      } else if (pathname.includes('/employee/add_new')) {
        response = await getCandidateById(params.id)
      } else if (role === 'Employee') {
        response = await getEmployeeById(employeeId)
      } else {
        response = await getCandidateById(params.id)
      }

      const attachdocuments = response?.data?.data?.documents || []
      const rawApiData = response?.data?.data?.candidateInfo || {}
      const apiData = cleanFields(rawApiData)
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

      const assignLocation = response?.data?.data?.assignLocations?.map((item, index) => ({
        ...item,
        key: index,
      }))

      if (rawApiData?.empCode === 'NA' || rawApiData?.empCode?.trim() === '') {
        setIsCandidate(true)
      } else {
        setIsCandidate(false)
      }

      const passportPhoto = attachdocuments.filter((doc) => doc.documentType === 'PassportPhoto')
      setProfilePhoto(passportPhoto)
      setSelectedEmpCode(apiData?.empCode)
      setStatusId(apiData?.statusId)
      setApplicantCode(apiData?.applicantCode)

      const new_res = {
        monthlyGrossCTC: apiData?.monthlyGrossCTC || 0,
        annuallyNetCTC: apiData?.annuallyNetCTC || 0,
        da: apiData?.da || 0,
        hra: apiData?.hra || 0,
        basicSalary: apiData?.basicSalary || 0,
        extraAllowance: apiData?.extraAllowance || 0,
        annualy_net_ctc: apiData?.annualy_net_ctc || 0,
        monthly_gross_ctc: apiData?.monthly_gross_ctc || 0,
        cca: apiData?.cca || 0,
        specialAllowance: apiData?.specialAllowance || 0,
        title: apiData?.title || '',
        reference: apiData?.reference || '',
        designation: parseInt(apiData?.designation) || '',
        department: parseInt(apiData?.department) || '',
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
        permanentAddressPinCode: apiData?.permanentAddressPinCode || '',
        grossSalary: apiData?.grossSalary || '',
        aadharNo: apiData?.aadharNo || '',
        nameOnAadhar: apiData?.nameOnAadhar || '',
        applicantCode: apiData?.applicantCode || '',
        presentAddress: apiData?.presentAddress || '',
        presentAddressPinCode: apiData?.presentAddressPinCode || '',
        maritalStatus: apiData?.maritalStatus || '',
        mobile: apiData?.mobile || '',
        emailAddress: apiData?.emailAddress || '',
        isRelativeInCompany: apiData?.isRelativeInCompany || false,
        nationality: apiData?.nationality || '',
        religion: apiData?.religion || '',
        bankName: apiData?.bankName || '',
        accountNo: apiData?.accountNo || '',
        bankIfscCode: apiData?.bankIfscCode || '',
        beneficiaryAddress: apiData?.beneficiaryAddress || '',
        prevEstNo: apiData?.prevEstNo || '',
        placeOfBirth: apiData?.placeOfBirth || '',
        PFApplicable: apiData?.pfApplicable || true,
        ESICApplicable: apiData?.esicApplicable || false,
        bonusApplicable:
          apiData?.bonusApplicable === true || apiData?.bonusApplicable === 'Ctc'
            ? 'Ctc'
            : apiData?.bonusApplicable === 'Stat'
              ? 'Stat'
              : 'No',
        CompanyId: apiData?.companyId || '',
        reportingHeadId: apiData?.reportingHeadId,
        isActive: apiData?.isActive,
        lastWorkingDay: apiData?.lastWorkingDay
          ? dayjs(apiData?.lastWorkingDay).format('DD/MM/YYYY')
          : '',
        shiftID: apiData?.shiftID,
        isUANRegistered: apiData?.isUANRegistered || false,
        preferredLocation: apiData?.preferredLocation || '',
        aoCode: apiData?.aoCode || '',
      }

      /** ✅ NAPS check based on Department OR Designation (API-loaded) */
      const deptIsNaps = String(apiData?.department || '') === String(NAPS_DEPARTMENT_ID)
      const desgIsNaps = NAPS_DESIGNATION_IDS.has(Number(apiData?.designation))
      setIsNapsDept(deptIsNaps || desgIsNaps)

      const empDropDownData = [
        {
          employeeId: apiData?.reportingHeadId,
          fullName: apiData?.reportingHeadName,
          ecode: apiData?.reportinHeadEcode,
        },
      ]

      setEmployees(empDropDownData)

      const groupedDocuments = attachdocuments.reduce((acc, doc) => {
        const documentType = doc.documentType
        if (!acc[documentType]) {
          acc[documentType] = []
        }
        acc[documentType].push(doc)
        return acc
      }, {})

      function addUrlToDocuments(data) {
        const baseUrl = 'https://v2parivar.v2retail.com:9987/'
        for (const docType in data) {
          if (Array.isArray(data[docType])) {
            data[docType] = data[docType].map((item) => ({
              ...item,
              url: baseUrl + item.filePath.replace(/\\/g, '/'),
            }))
          }
        }
        return data
      }

      const updatedData = addUrlToDocuments(groupedDocuments)

      // Medical Card is stored on tblEmployee.MedicalCardUrl (a single string),
      // not in the candidate documents list — hydrate the slot from apiData.
      if (apiData?.medicalCardUrl) {
        const mcBase = import.meta.env.VITE_API_URL
        const mcRel = apiData.medicalCardUrl.replace(/\\/g, '/').replace(/^\//, '')
        updatedData['MedicalCard'] = [
          {
            uid: 'mc-' + mcRel,
            name: mcRel.split('/').pop(),
            status: 'done',
            url: mcBase + mcRel,
          },
        ]
      }

      setFileLists(updatedData)

      const formattedDatas = { ...new_res }
      form.setFieldsValue({ user: formattedDatas })
      setFamilyMemberDataSource(familyDatas)
      setExperienceData(experienceDatas)
      setQualificationData(educationDatas)
      setAssignments(assignLocation)
    } catch (error) {
      console.error('Error fetching emp data:', error)
    }
    await dispatch(set({ loading: false }))
  }

  useEffect(() => {
    if (role === 'Employee') fetchData()
  }, [employeeId])

  useEffect(() => {
    fetchData()
  }, [params.id])

  const onFinishFailed = ({ errorFields }) => {
    if (errorFields && errorFields.length > 0) {
      message_error('Required fields missing!')
      const firstErrorFieldName = errorFields[0].name
      const fieldInstance = form.getFieldInstance(firstErrorFieldName)
      if (fieldInstance && fieldInstance.focus) {
        setTimeout(() => {
          fieldInstance.focus()
        }, 100)
      }
    }
  }

  const attachmentKeyToUploadMapping = {
    Pan: 'PanAttachment',
    Aadhar: 'AadharAttachment',
    SalarySlip: 'Last3SalarySlip',
    BankPassbook: 'BankPassbookAttachment',
    BankStatement: 'Last3BankStatement',
    BankStatementVideo: 'BankStatementVideo',
    PrevOfferLetter: 'PrevOfferLetter',
    Education: 'EducationAttachment',
    PassportPhoto: 'PassportPhoto',
    Resume: 'ResumeAttachment',
    AadharBack: 'AadharBackAttachment',
  }

  const experienceColumns = [
    {
      title: 'Company Name',
      dataIndex: 'nameOfCompany',
      key: 'nameOfCompany',
      ellipsis: true,
      onCell: () => ({ 'data-label': 'Company Name' }),
      render: (text) => <Typography.Text>{text}</Typography.Text>,
    },
    {
      title: 'Work Location',
      dataIndex: 'workLocation',
      key: 'workLocation',
      ellipsis: true,
      onCell: () => ({ 'data-label': 'Work Location' }),
      render: (text) => <Typography.Text>{text}</Typography.Text>,
    },
    {
      title: 'Position',
      dataIndex: 'positionHeld',
      key: 'positionHeld',
      ellipsis: true,
      onCell: () => ({ 'data-label': 'Position' }),
      render: (text) => <Typography.Text>{text}</Typography.Text>,
    },
    {
      title: 'From',
      dataIndex: 'from',
      key: 'from',
      onCell: () => ({ 'data-label': 'From' }),
      render: (val) => (
        <Typography.Text>{val ? dayjs(val).format('DD-MM-YYYY') : 'Not Specified'}</Typography.Text>
      ),
    },
    {
      title: 'To',
      dataIndex: 'to',
      key: 'to',
      onCell: () => ({ 'data-label': 'To' }),
      render: (val) => (
        <Typography.Text>{val ? dayjs(val).format('DD-MM-YYYY') : 'Not Specified'}</Typography.Text>
      ),
    },
    {
      title: 'Last CTC',
      dataIndex: 'lastCtc',
      key: 'lastCtc',
      onCell: () => ({ 'data-label': 'Last CTC' }),
      render: (text) => <Typography.Text>{text ?? 'Not Specified'}</Typography.Text>,
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      onCell: () => ({ 'data-label': 'Action' }),
      render: (_, record) => (
        <Button danger onClick={() => deleteExperienceRow(record.key)} disabled>
          <DeleteRowOutlined />
        </Button>
      ),
    },
  ]

  const onFinish = async (values) => {
    await dispatch(set({ loading: true }))

    const ef = new FormData()
    for (const category in fileLists) {
      const fileList = fileLists[category]
      const fileKey = attachmentKeyToUploadMapping[category] || category

      if (fileList && fileList.length > 0) {
        fileList.forEach((file) => {
          if (file?.originFileObj) {
            ef.append(fileKey, file.originFileObj)
          }
        })
        ef.append(`${attachmentKeyToFlagMap[category]}`, true)
      }
    }

    if (imageValue && imageValue.length > 0 && imageValue[0]?.originFileObj) {
      ef.append('PassportPhoto', imageValue[0].originFileObj)
    }

    if (deletedFiles.length > 0) {
      deletedFiles.forEach((val, indx) => {
        ef.append('deleted_files', JSON.stringify(val))
      })
    }

    if (assignedOnDate && releasedOnDate) {
      ef.append('assignedOnDate', assignedOnDate)
      ef.append('releasedOnDate', releasedOnDate)
    }

    ef.append('FamilyMembersListJson', JSON.stringify(familyMemberdataSource))
    ef.append('ExperienceListJson', JSON.stringify(experienceData))
    ef.append('QualificationListJson', JSON.stringify(qualificationData))

    const AssignLocations = {
      assignedLocation: assignedLocation,
      assignedReason: assignedReason,
      isActive: true,
      assignedOnDate: dayjs(assignedOnDate).format('YYYY-MM-DD'),
      releasedOnDate: dayjs(releasedOnDate).format('YYYY-MM-DD'),
    }

    ef.append('AssignLocationsListJson', JSON.stringify(AssignLocations))

    if (values.user && typeof values.user === 'object') {
      if (values.user.aoCode !== undefined && values.user.aoCode !== null) {
        ef.append('AOCode', values.user.aoCode)
      }

      Object.entries(values.user).forEach(([key, value]) => {
        if (key === 'aoCode') return
        if (value !== undefined && value !== null) {
          ef.append(`${key}`, value)
        }
      })
    }

    Object.entries(values).forEach(([key, value]) => {
      if (key !== 'user' && value !== undefined && value !== null) {
        ef.append(key, value)
      }
    })

    if (params?.id) {
      ef.append('id', params?.id)
    }

    try {
      const id = params.id
      const response = await createUpdateCandidate({ ef, id, pathname })

      if (response.status === 200) {
        message.success(params.id ? 'Updated Successfully' : 'Created Successfully')
        if (pathname.includes('/employee-form')) {
          navigate('/login')
        } else if (pathname.includes('/employee/update')) {
          navigate('/employees/list')
        } else {
          navigate('/candidate/form_list')
        }
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      message_error(error.response?.data?.message || 'Upload Failed')
    } finally {
      await dispatch(set({ loading: false }))
    }
  }

  const onFinishEmployeeMaster = async (valuess) => {
    const { user } = valuess

    const values = {
      ...user,
      FatherName: user.fathersName,
      MotherName: user.mothersName,
    }

    await dispatch(set({ loading: true }))

    const ef = new FormData()
    for (const category in fileLists) {
      const fileList = fileLists[category]
      const fileKey = attachmentKeyToUploadMapping[category] || category

      if (fileList && fileList.length > 0) {
        fileList.forEach((file) => {
          if (file?.originFileObj) {
            ef.append(fileKey, file.originFileObj)
          }
        })
        ef.append(`${attachmentKeyToFlagMap[category]}`, true)
      }
    }

    if (imageValue && imageValue.length > 0 && imageValue[0]?.originFileObj) {
      ef.append('PassportPhoto', imageValue[0].originFileObj)
    }

    if (deletedFiles.length > 0) {
      deletedFiles.forEach((val, indx) => {
        ef.append('deleted_files', JSON.stringify(val))
      })
    }

    if (assignedOnDate && releasedOnDate) {
      ef.append('assignedOnDate', assignedOnDate)
      ef.append('releasedOnDate', releasedOnDate)
    }

    const AssignLocations = {
      assignedLocation: assignedLocation,
      assignedReason: assignedReason,
      isActive: true,
      assignedOnDate: assignedOnDate,
      releasedOnDate: releasedOnDate,
    }

    if (values.user && typeof values.user === 'object') {
      Object.entries(values.user).forEach(([key, value]) => {
        if (key === 'aoCode') return
        if (value !== undefined && value !== null) {
          ef.append(`${key}`, value)
        }
      })
    }

    if (values.aoCode !== undefined && values.aoCode !== null) {
      ef.append('AOCode', values.aoCode)
    }

    Object.entries(values).forEach(([key, value]) => {
      if (key === 'aoCode') return
      if (key !== 'user' && value !== undefined && value !== null) {
        ef.append(key, value)
      }
    })

    if (params?.id) {
      ef.append('EmployeeId', params?.id)
    }

    await dispatch(set({ loading: false }))

    return
  }

  const runUpdateFunction = async (values) => {
    await onFinish(values)
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

  const deleteExperienceRow = (key) => {
    const updatedData = experienceData.filter((item) => item.key !== key)
    setExperienceData(updatedData)
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

  const deleteFamilyRow = (key) => {
    const updatedData = familyMemberdataSource.filter((item) => item.key !== key)
    setFamilyMemberDataSource(updatedData)
  }

  const addRowQualificationData = () => {
    setQualificationData([
      ...qualificationData,
      { key: Date.now(), education: '', yop: '', grade: '', type: '' },
    ])
  }

  const deleteQualificationRow = (key) => {
    const updatedData = qualificationData.filter((item) => item.key !== key)
    setQualificationData(updatedData)
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

  const handleRemove = (file) => {
    setImageValue((prev) => prev.filter((item) => item.uid !== file.uid))
  }

  const getImageUrl = (file) => {
    if (file?.filePath) return `https://v2parivar.v2retail.com:9987/${file.filePath}`
    if (file?.thumbUrl) return file.thumbUrl
    if (file?.url) return file.url
    if (file?.originFileObj) return URL.createObjectURL(file.originFileObj)
    return null
  }

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })

  // ✅ UPDATED: Images open AntD preview (zoom in/out). Video stays in Modal.
  const handlePreview = async (file) => {
    const baseUrl = 'https://v2parivar.v2retail.com:9987/'
    const fileName = file.name || file.fileName || ''
    const fileType = file.type || file.originFileObj?.type || ''
    let previewUrl = file.url || file.preview || file.thumbUrl || ''

    if (!previewUrl && file.filePath) {
      previewUrl = `${baseUrl}${file.filePath.replace(/\\/g, '/')}`
    }

    if (!previewUrl && file.originFileObj) {
      previewUrl = URL.createObjectURL(file.originFileObj)
    }
    if (previewUrl && !previewUrl.startsWith('blob:')) {
      previewUrl = normalizeUrl(previewUrl)
    }

    const isVideo = isVideoFile(fileName) || isVideoFile(fileType) || isVideoFile(previewUrl)
    if (isVideo) {
      if (!previewUrl) {
        Modal.info({
          title: 'Preview Not Available',
          content: 'Cannot generate preview for this video file.',
        })
        return
      }
      setPreviewVideo(previewUrl)
      setPreviewImage('')
      setIsVideoPreview(true)
      setPreviewOpen(true)
      return
    }

    const isImage = isImageFile(fileName) || isImageFile(previewUrl)
    if (isImage) {
      if (!file.url && !file.preview && file.originFileObj && !previewUrl.startsWith('blob:')) {
        file.preview = await getBase64(file.originFileObj)
        previewUrl = file.preview
      }
      setPreviewImage(previewUrl)
      setPreviewVideo('')
      setIsVideoPreview(false)

      // ✅ Open AntD image preview overlay (zoom controls included)
      setImagePreviewVisible(true)
      return
    }

    if (isPdfFile(previewUrl) || isPdfFile(fileName) || isPdfFile(fileType)) {
      window.open(previewUrl, '_blank')
      return
    }

    if (isExcelFile(previewUrl) || isExcelFile(fileName)) {
      window.open(previewUrl, '_blank')
      return
    }

    if (isWordFile(previewUrl) || isWordFile(fileName)) {
      window.open(previewUrl, '_blank')
      return
    }

    Modal.info({
      title: 'Unsupported File',
      content: 'This file type is not supported for preview. Please download it to view.',
    })
  }

  useEffect(() => {
    if (profilePhoto && profilePhoto.length > 0 && imageValue.length === 0) {
      setImageValue(profilePhoto)
    }
  }, [profilePhoto, imageValue.length])

  const handleTrimOnBlur = (form, name) => (e) => {
    const value = e.target.value?.trim()
    const [fieldGroup, fieldName] = name

    form.setFieldsValue({
      [fieldGroup]: {
        ...form.getFieldValue(fieldGroup),
        [fieldName]: value,
      },
    })
  }

  const fetchShiftData = async () => {
    try {
      const response = await axiosInstance.get('/api/DropDown/GetShiftMaster')

      if (response.status === 200) {
        setShiftList(response.data?.data)
      }
    } catch (error) {
      // console.error('shift api err: ', error)
    }
  }

  useEffect(() => {
    fetchShiftData()
  }, [])

  const isEsicVisible = () => {
    const val = Number(form.getFieldValue(['user', 'monthlyGrossCTC']) || 0)
    return val > 0 && val <= 21000
  }

  return (
    <>
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
          {loc !== '/register' &&
            loc !== '/employee/add_new' &&
            loc !== '/employee-form' &&
            loc !== '/employee/details' && (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? 'green' : 'red',
                    }}
                  />
                  <Text>{isActive ? 'Active' : 'Inactive'}</Text>
                </span>
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
          className={theme === 'dark' ? 'dark-theme' : ''}
          form={form}
          onFinishFailed={onFinishFailed}
          {...layout}
          name="user-form"
          onFinish={runUpdateFunction}
          validateMessages={validateMessages}
          layout="vertical"
        >
          <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={handleTabChange}>
            <Tabs.TabPane tab="Attachments" key="1">
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <Button type="primary" onClick={handleDownloadAllAttachments}>
                    Download All
                  </Button>
                </div>

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
                  {attachmentLabels.map((attachment) => {
                    const currentFileList = fileLists[attachment.value] || []
                    const isMaxReached = currentFileList.length >= attachment.maxCount
                    const isVideoAttachment = attachment.value === 'BankStatementVideo'
                    const acceptFileTypes = isVideoAttachment
                      ? 'video/*,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv'
                      : '.pdf,.doc,.docx,.txt,.xls,.xlsx'

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
                        <h6 style={{ marginBottom: 12 }}>{attachment.lable}</h6>

                        <Upload
                          maxCount={attachment.maxCount}
                          className="custom-upload-attachements"
                          listType="picture-card"
                          multiple
                          onChange={(info) => handleUploadChanges(attachment.value, info)}
                          beforeUpload={() => false}
                          fileList={currentFileList}
                          onPreview={handlePreview}
                          accept={acceptFileTypes}
                          disabled={!isVideoAttachment}
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

            <Tabs.TabPane tab="General" key="2" className={theme === 'dark' ? 'dark-theme' : ''}>
              <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Profile Photo"
                    labelCol={{ span: 24 }}
                    style={{ textAlign: 'center' }}
                  >
                    {imageValue.length > 0 ? (
                      <div className="upload-image-wrapper">
                        <Image
                          src={getImageUrl(imageValue[0])}
                          alt="avatar"
                          className="uploaded-image "
                        />
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', height: 188 }}>
                        <PlusOutlined style={{ fontSize: 24, color: '#999', marginTop: 32 }} />
                        <div style={{ marginTop: 8 }}>No Photo Uploaded</div>
                      </div>
                    )}
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Emp. Code">
                    <Typography.Text>
                      &nbsp;&nbsp;{form.getFieldValue(['user', 'empCode'])}
                    </Typography.Text>
                  </Form.Item>

                  <Form.Item labelCol={{ span: 24 }} label="First Name">
                    <Typography.Text className="abcdd">
                      &nbsp;&nbsp;
                      {form.getFieldValue(['user', 'firstName'])}
                    </Typography.Text>
                  </Form.Item>

                  <Form.Item labelCol={{ span: 24 }} label="Last Name">
                    <Typography.Text>
                      &nbsp;&nbsp;{form.getFieldValue(['user', 'lastName'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Title">
                    <Typography.Text>
                      &nbsp;&nbsp;{form.getFieldValue(['user', 'title'])}
                    </Typography.Text>
                  </Form.Item>

                  <Form.Item labelCol={{ span: 24 }} label="Middle Name">
                    <Typography.Text>
                      &nbsp;&nbsp;{form.getFieldValue(['user', 'middleName'])}
                    </Typography.Text>
                  </Form.Item>

                  <Form.Item labelCol={{ span: 24 }} label="Full Name">
                    <Typography.Text>
                      &nbsp;&nbsp;{form.getFieldValue(['user', 'fullName'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Gender">
                    <Typography.Text>
                      &nbsp;&nbsp;{form.getFieldValue(['user', 'gender'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Spouse Name">
                    <Typography.Text>
                      &nbsp;&nbsp;{form.getFieldValue(['user', 'husbandName'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Aadhar No.">
                    <Typography.Text>
                      &nbsp;&nbsp;{form.getFieldValue(['user', 'aadharNo'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Father's Name">
                    <Typography.Text>
                      &nbsp;&nbsp;{form.getFieldValue(['user', 'fathersName'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Place of Birth">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {form.getFieldValue(['user', 'placeOfBirth'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Name on Aadhar">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {form.getFieldValue(['user', 'nameOnAadhar'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Mother's Name">
                    <Typography.Text>
                      &nbsp;&nbsp;{form.getFieldValue(['user', 'mothersName'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="PAN No.">
                    <Typography.Text>
                      &nbsp;&nbsp;{form.getFieldValue(['user', 'panNo'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Date of Birth">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {dayjs(form.getFieldValue(['user', 'dob'])).format('DD-MM-YYYY')}
                    </Typography.Text>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Joining Date">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {dayjs(form.getFieldValue(['user', 'joiningDate'])).format('DD-MM-YYYY')}
                    </Typography.Text>
                  </Form.Item>
                </Col>

                {isSalaryDetailsVisible && (
                  <>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        name={['user', 'basicSalary']}
                        labelCol={{ span: 24 }}
                        label="Basic Salary"
                      >
                        <Typography.Text>
                          &nbsp;&nbsp;
                          {form.getFieldValue(['user', 'basicSalary'])}
                        </Typography.Text>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name={['user', 'cca']} labelCol={{ span: 24 }} label="C.C.A.">
                        <Typography.Text>
                          &nbsp;&nbsp;{form.getFieldValue(['user', 'cca'])}
                        </Typography.Text>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        name={['user', 'grossSalary']}
                        labelCol={{ span: 24 }}
                        label="Gross Salary"
                      >
                        <Typography.Text>
                          &nbsp;&nbsp;
                          {form.getFieldValue(['user', 'grossSalary'])}
                        </Typography.Text>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name={['user', 'da']} labelCol={{ span: 24 }} label="D.A.">
                        <Typography.Text>
                          &nbsp;&nbsp;{form.getFieldValue(['user', 'da'])}
                        </Typography.Text>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        name={['user', 'specialAllowance']}
                        labelCol={{ span: 24 }}
                        label="Special Allowance"
                      >
                        <Typography.Text>
                          &nbsp;&nbsp;
                          {form.getFieldValue(['user', 'specialAllowance'])}
                        </Typography.Text>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item name={['user', 'hra']} labelCol={{ span: 24 }} label="H.R.A.">
                        <Typography.Text>
                          &nbsp;&nbsp;{form.getFieldValue(['user', 'hra'])}
                        </Typography.Text>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        name={['user', 'extraAllowance']}
                        labelCol={{ span: 24 }}
                        label="Extra Allowance"
                      >
                        <Typography.Text>
                          &nbsp;&nbsp;
                          {form.getFieldValue(['user', 'extraAllowance'])}
                        </Typography.Text>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        name={['user', 'monthlyGrossCTC']}
                        labelCol={{ span: 24 }}
                        label="Monthly Gross CTC"
                      >
                        <Typography.Text>
                          &nbsp;&nbsp;
                          {form.getFieldValue(['user', 'monthlyGrossCTC'])}
                        </Typography.Text>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        name={['user', 'annuallyNetCTC']}
                        labelCol={{ span: 24 }}
                        label="Annually Net CTC"
                      >
                        <Typography.Text>
                          &nbsp;&nbsp;
                          {form.getFieldValue(['user', 'annuallyNetCTC'])}
                        </Typography.Text>
                      </Form.Item>
                    </Col>
                  </>
                )}

                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Location">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {
                        locations.find(
                          (loc) => loc.locationId === form.getFieldValue(['user', 'location']),
                        )?.locationName
                      }
                    </Typography.Text>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Preferred Location">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {
                        locations.find(
                          (loc) =>
                            loc.locationId === form.getFieldValue(['user', 'preferredLocation']),
                        )?.locationName
                      }
                    </Typography.Text>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Present Address">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {form.getFieldValue(['user', 'presentAddress'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Present Address Pin Code">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {form.getFieldValue(['user', 'presentAddressPinCode'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Department">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {
                        departments.find(
                          (dep) => dep.departmentId === form.getFieldValue(['user', 'department']),
                        )?.departmentName
                      }
                    </Typography.Text>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Permanent Address">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {form.getFieldValue(['user', 'permanentAddress'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Permanent Address Pin Code">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {form.getFieldValue(['user', 'permanentAddressPinCode'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Designation">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {
                        designations.find(
                          (desg) =>
                            desg.designationId === form.getFieldValue(['user', 'designation']),
                        )?.designationName
                      }
                    </Typography.Text>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Bonus Applicable">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {(() => {
                        const v = form.getFieldValue(['user', 'bonusApplicable'])
                        if (v === 'Ctc') return 'Ctc'
                        if (v === 'Stat') return 'Stat'
                        return 'No'
                      })()}
                    </Typography.Text>
                  </Form.Item>
                </Col>

                {/* ESIC No — show only when ESIC visible AND department/designation is NOT NAPS */}
                {isEsicVisible() && !isNapsDept && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name={['user', 'prevEstNo']}
                      labelCol={{ span: 24 }}
                      label="ESIC Number"
                    >
                      <Typography.Text>
                        &nbsp;&nbsp;
                        {form.getFieldValue(['user', 'prevEstNo'])}
                      </Typography.Text>
                    </Form.Item>
                  </Col>
                )}

                {/* UAN No – hidden when department OR designation is NAPS */}
                {!isNapsDept && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name={['user', 'uanNo']} labelCol={{ span: 24 }} label="UAN No.">
                      <Typography.Text>
                        &nbsp;&nbsp;{form.getFieldValue(['user', 'uanNo'])}
                      </Typography.Text>
                    </Form.Item>
                  </Col>
                )}

                {/* AO Code – show when department OR designation is NAPS */}
                {isNapsDept && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item name={['user', 'aoCode']} labelCol={{ span: 24 }} label="AO Code">
                      <Typography.Text>
                        &nbsp;&nbsp;{form.getFieldValue(['user', 'aoCode'])}
                      </Typography.Text>
                    </Form.Item>
                  </Col>
                )}

                <Col xs={24} sm={24} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Company">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {
                        companys.find(
                          (comp) => comp.companyId === form.getFieldValue(['user', 'CompanyId']),
                        )?.companyName
                      }
                    </Typography.Text>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name={['user', 'lastWorkingDay']}
                    labelCol={{ span: 24 }}
                    label="Last Working Day"
                  >
                    <Typography.Text>
                      &nbsp;&nbsp;{form.getFieldValue(['user', 'lastWorkingDay'])}{' '}
                    </Typography.Text>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Reporting Manager">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {
                        Employees.find(
                          (emp) =>
                            emp.employeeId === form.getFieldValue(['user', 'reportingHeadId']),
                        )?.fullName
                      }
                    </Typography.Text>
                  </Form.Item>
                </Col>
              </Row>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Personal" key="3">
              <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Marital Status">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {form.getFieldValue(['user', 'maritalStatus']) === 'none'
                        ? 'Not Specified'
                        : form.getFieldValue(['user', 'maritalStatus'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Mobile">
                    <Typography.Text>
                      &nbsp;&nbsp;{form.getFieldValue(['user', 'mobile'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Email Id">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {form.getFieldValue(['user', 'emailAddress'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Beneficiary Address">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {form.getFieldValue(['user', 'beneficiaryAddress'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Nationality">
                    <Typography.Text>
                      &nbsp;&nbsp;{form.getFieldValue(['user', 'nationality'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Religion">
                    <Typography.Text>
                      &nbsp;&nbsp;{form.getFieldValue(['user', 'religion'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Bank Name">
                    <Typography.Text>
                      &nbsp;&nbsp;{form.getFieldValue(['user', 'bankName'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="A/c No.">
                    <Typography.Text>
                      &nbsp;&nbsp;{form.getFieldValue(['user', 'accountNo'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Bank IFSC Code">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {form.getFieldValue(['user', 'bankIfscCode'])}
                    </Typography.Text>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Relative in Company">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {form.getFieldValue(['user', 'isRelativeInCompany']) ? 'Yes' : 'No'}
                    </Typography.Text>
                  </Form.Item>
                </Col>

                {form.getFieldValue(['user', 'isRelativeInCompany']) && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item labelCol={{ span: 24 }} label="Reference">
                      <Typography.Text>
                        &nbsp;&nbsp;{form.getFieldValue(['user', 'reference'])}
                      </Typography.Text>
                    </Form.Item>
                  </Col>
                )}

                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Fingerprint Registered">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {form.getFieldValue(['user', 'fingerprintRegistered']) ? 'Yes' : 'No'}
                    </Typography.Text>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} label="Shift Alignment">
                    <Typography.Text>
                      &nbsp;&nbsp;
                      {
                        shiftList.find((shift) => {
                          return shift.shiftID === form.getFieldValue(['user', 'shiftID'])
                        })?.shiftName
                      }
                    </Typography.Text>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item labelCol={{ span: 24 }} label="Family Member Detail">
                <Table
                  className="custom-table"
                  dataSource={familyMemberdataSource}
                  columns={[
                    {
                      title: 'Family Member Name',
                      dataIndex: 'familyMemberName',
                      key: 'familyMemberName',
                      onCell: () => ({ 'data-label': 'Family Member Name' }),
                      render: (text) => <Typography.Text>&nbsp;&nbsp;{text}</Typography.Text>,
                    },
                    {
                      title: 'Relation',
                      dataIndex: 'relation',
                      key: 'relation',
                      onCell: () => ({ 'data-label': 'Relation' }),
                      render: (text) => <Typography.Text>&nbsp;&nbsp;{text}</Typography.Text>,
                    },
                    {
                      title: 'DOB',
                      dataIndex: 'dob',
                      key: 'dob',
                      onCell: () => ({ 'data-label': 'DOB' }),
                      render: (text) => (
                        <Typography.Text>
                          &nbsp;&nbsp;
                          {text ? dayjs(text).format('DD-MM-YYYY') : 'Not Specified'}
                        </Typography.Text>
                      ),
                    },
                    {
                      title: 'Action',
                      key: 'action',
                      onCell: () => ({ 'data-label': 'Action' }),
                      render: (_, record) => (
                        <Button danger onClick={() => deleteFamilyRow(record.key)} disabled>
                          <DeleteRowOutlined />
                        </Button>
                      ),
                    },
                  ]}
                  pagination={false}
                  bordered
                />
              </Form.Item>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Experience" key="4">
              <Table
                className="custom-table"
                rowKey="key"
                columns={experienceColumns}
                dataSource={experienceData}
                pagination={false}
                bordered
              />
            </Tabs.TabPane>

            <Tabs.TabPane tab="Qualification" key="5">
              <Table
                className="custom-table"
                columns={[
                  {
                    title: 'Education',
                    dataIndex: 'education',
                    key: 'education',
                    onCell: () => ({ 'data-label': 'Education' }),
                    render: (text) => <Typography.Text>&nbsp;&nbsp;{text}</Typography.Text>,
                  },
                  {
                    title: 'Year of Passing',
                    dataIndex: 'yop',
                    key: 'yop',
                    onCell: () => ({ 'data-label': 'Year of Passing' }),
                    render: (text) => (
                      <Typography.Text>
                        &nbsp;&nbsp;
                        {text ? dayjs(text).format('YYYY') : 'Not Specified'}
                      </Typography.Text>
                    ),
                  },
                  {
                    title: 'Grade',
                    dataIndex: 'grade',
                    key: 'grade',
                    onCell: () => ({ 'data-label': 'Grade' }),
                    render: (text) => <Typography.Text>&nbsp;&nbsp;{text}</Typography.Text>,
                  },
                  {
                    title: 'Type',
                    dataIndex: 'type',
                    key: 'type',
                    onCell: () => ({ 'data-label': 'Type' }),
                    render: (text) => <Typography.Text>&nbsp;&nbsp;{text}</Typography.Text>,
                  },
                  {
                    title: 'Action',
                    key: 'action',
                    onCell: () => ({ 'data-label': 'Action' }),
                    render: (_, record) => (
                      <Button danger onClick={() => deleteQualificationRow(record.key)} disabled>
                        <DeleteRowOutlined />
                      </Button>
                    ),
                  },
                ]}
                dataSource={qualificationData}
                pagination={false}
                bordered
              />
            </Tabs.TabPane>

            {isLocationTabVisible && (
              <Tabs.TabPane
                tab="Location Assignment"
                key="6"
                className={theme === 'dark' ? 'dark-theme' : ''}
              >
                <Table
                  columns={columns}
                  dataSource={assignments}
                  pagination={{ pageSize: 5 }}
                  scroll={{ x: 'max-content', y: 'calc(100vh - 160px)' }}
                  bordered
                />
              </Tabs.TabPane>
            )}

            {isSalarySlipVisible && (
              <Tabs.TabPane
                tab="Salary Slip"
                key="7"
                className={theme === 'dark' ? 'dark-theme' : ''}
              >
                <div className="salary-slip-tab">
                  <div className="salary-slip-scroll-x">
                    {/* 🔒 View-only salary slips, using the same ecode logic & props as updated component */}
                    <SalarySlips emp_pro={true} ecodes={selectedEmpCode} empCodeReadOnly />
                  </div>
                </div>
              </Tabs.TabPane>
            )}

            <Tabs.TabPane
              tab="Medical Card"
              key="8"
              className={theme === 'dark' ? 'dark-theme' : ''}
            >
              <MedicalCardAdmin
                ecodeProp={selectedEmpCode}
                key={selectedEmpCode || 'no-ecode'}
              />
            </Tabs.TabPane>
          </Tabs>

          <Row justify="end" style={{ marginTop: 20, gap: '0.6rem' }}>
            <>
              <Row style={{ gap: 5 }}>
                {activeTab > 1 && (
                  <Button type="primary" onClick={handleBack} disabled={activeTab === '1'}>
                    Back
                  </Button>
                )}
                {activeTab < totalTabs && (
                  <Button
                    type="primary"
                    onClick={handleNext}
                    disabled={activeTab === String(totalTabs)}
                  >
                    Next
                  </Button>
                )}
              </Row>
            </>
          </Row>
        </Form>
      </Card>

      {/* ✅ NEW: Invisible Image component used ONLY for zoomable preview overlay */}
      {previewImage && (
        <Image
          src={previewImage}
          style={{ display: 'none' }}
          preview={{
            visible: imagePreviewVisible,
            onVisibleChange: (vis) => {
              setImagePreviewVisible(vis)
              if (!vis) {
                if (previewImage.startsWith('blob:')) {
                  URL.revokeObjectURL(previewImage)
                }
                setPreviewImage('')
              }
            },
          }}
        />
      )}

      <Modal
        title="Initialize Candidate"
        style={{ top: 100 }}
        open={initiateModalOpen}
        onCancel={() => setInitiateModalOpen(false)}
        footer={[
          <Button key="reject" onClick={() => {}} disabled={loading}>
            {loading ? 'Rejectting' : 'Reject'}
          </Button>,
          <Button key="approve" type="primary" onClick={() => {}} disabled={loading}>
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

      <AcceptOfferModal
        visible={visible}
        offerDetails={offerDetails}
        onAccept={handleAccept}
        onCancel={() => setVisible(false)}
      />

      {/* ✅ Keep Modal for VIDEO preview only (image preview is handled by AntD Image overlay) */}
      <Modal
        open={previewOpen}
        title="Video Preview"
        footer={null}
        onCancel={() => {
          if (isVideoPreview && previewVideo && previewVideo.startsWith('blob:')) {
            URL.revokeObjectURL(previewVideo)
          }
          setPreviewOpen(false)
          setPreviewVideo('')
          setPreviewImage('')
          setIsVideoPreview(false)
        }}
        width={800}
        style={{ top: 20 }}
      >
        {isVideoPreview ? (
          <video
            controls
            style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
            src={previewVideo}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <Typography.Text>No preview available.</Typography.Text>
        )}
      </Modal>
    </>
  )
}

export default EmployeeProfile
