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
  Divider,
  Radio,
  Typography,
  Flex,
} from 'antd'
import {
  PlusOutlined,
  RollbackOutlined,
  UploadOutlined,
  DeleteRowOutlined,
} from '@ant-design/icons'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './employee.css'
import dayjs from 'dayjs'
import { fmtDate } from '../utils/dateFormat'
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
  getDesignationByDepartment,
  getMappedDesignations,
  deleteDocument,
  validateMinwage,
} from '../services/Services'
import { useWatch } from 'antd/es/form/Form'
import SalarySlips from '../components/payroll/SalarySlips'
import SubDepartmentCascade from '../components/shared/SubDepartmentCascade'
import MedicalCardAdmin from '../MedicalCard'
const { Text } = Typography
import LabelWithPhotoButtons from './LabelWithPhotoButtons'
import axiosInstance from '../services/axiosInstance'
import axios from 'axios'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

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

const EmployeeProfile = () => {
  const deptsForStore = ['ST-FLR-OP', 'ST-SECURITY', 'ST-ADMIN', 'ST-MGMT', 'ST-BILLING']
  const { theme } = useSelector((state) => state.ui)
  const role = useSelector((state) => state.auth.data?.role)
  const isStoreHR =
    String(role || '')
      .trim()
      .toLowerCase() === 'storehr'
  const { employeeId, isStore, ecode } = useSelector((state) => state?.auth?.data ?? {})
  const { pathname, state = {} } = useLocation()
  const isEmployeeUpdateRoute = pathname.includes('/employee/update')
  const disableDeptDesgUanForStoreHrOnUpdate = isStoreHR && isEmployeeUpdateRoute
  // const { furtherParts = [] } = state || {}
  const navigate = useNavigate()
  const [imageValue, setImageValue] = useState([])
  const [loading, setLoading] = useState(false)
  const params = useParams()
  const showShiftAlignment = pathname.startsWith('/employee/add_new/') && !!params?.id
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
  const [activeTab, setActiveTab] = useState('1') // Track active tab index
  const [profilePhoto, setProfilePhoto] = useState([])
  const [visible, setVisible] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [deletedFiles, setDeletedFiles] = useState([])
  const [assignments, setAssignments] = useState([])
  const [transferType, setTransferType] = useState('')
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [assignedOnDate, setassignedOnDate] = useState(null)
  const [releasedOnDate, setreleasedOnDate] = useState(null)
  const [assignedLocation, setassignedLocation] = useState()
  const [assignedDepartment, setAssignmentDepartment] = useState()
  const [assignedDesignation, setAssignedDesignation] = useState()
  const [assignedReason, setassignedReason] = useState()
  const [searchText, setsearchText] = useState('')
  const [Employees, setEmployees] = useState([])
  const [selectedEmpCode, setSelectedEmpCode] = useState('')
  const [searchLoading, setsearchLoading] = useState(false)
  const [isCandidate, setIsCandidate] = useState(false)
  const [ocrData, setOcrData] = useState({})
  const [shiftList, setShiftList] = useState([])
  const [currentStCode, setCurrentStCode] = useState('')
  const [isMinwageLoading, setIsMinwageLoading] = useState(false)
  const isActive = form.getFieldValue(['user', 'isActive'])
  const isRelativeInCompany = useWatch(['user', 'isRelativeInCompany'], form)
  const esicApplicable = useWatch(['user', 'ESICApplicable'], form)
  const isDifferentlyAbled = useWatch(['user', 'differentlyAbled'], form)
  const differentlyAbledReason = useWatch(['user', 'differentlyAbledReason'], form)
  // Watch values of contributing fields
  const watch_basicSalary = Form.useWatch(['user', 'basicSalary'], form)
  const watch_cca = Form.useWatch(['user', 'cca'], form)
  const watch_da = Form.useWatch(['user', 'da'], form)
  const watch_extraAllowance = Form.useWatch(['user', 'extraAllowance'], form)
  const watch_specialAllowance = Form.useWatch(['user', 'specialAllowance'], form)
  const watch_hra = Form.useWatch(['user', 'hra'], form)
  const watch_PFApplicable = Form.useWatch(['user', 'PFApplicable'], form)
  const watch_UANRegistered = Form.useWatch(['user', 'isUANRegistered'], form)
  const watch_department = Form.useWatch(['user', 'department'], form)
  const watch_location = Form.useWatch(['user', 'location'], form)
  const watch_joiningDate = Form.useWatch(['user', 'joiningDate'], form)
  const watch_monthlyGrossCTC = Form.useWatch(['user', 'monthlyGrossCTC'], form)
  const watch_designation = Form.useWatch(['user', 'designation'], form)
  const watch_subDept1 = Form.useWatch(['user', 'subDepartmentId1'], form)
  const watch_subDept2 = Form.useWatch(['user', 'subDepartmentId2'], form)
  const watch_subDept3 = Form.useWatch(['user', 'subDepartmentId3'], form)
  const filterOutDesigFromStoreHr = ['dc executive', 'bench-dc executive', 'naps dc executive']
  console.log('watch_designation:', watch_designation)

  const [furtherParts, setFurtherParts] = useState(() => {
    if (location.state?.furtherParts) return location.state.furtherParts

    const stored = sessionStorage.getItem('editPageState')
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
      sessionStorage.removeItem('editPageState')
    }
  }, [])

  // const isApprenticeDesignation = (() => {
  //   if (!watch_designation || !designations?.length) return false
  //   const selected = designations.find((d) => d.designationId === watch_designation)
  //   return selected?.designationName?.toUpperCase() === 'APPRENTICE'
  // })()

  //   const downloadFile = async (url, filename = 'file') => {
  //   try {
  //     const res = await fetch(url)
  //     const blob = await res.blob()
  //     const blobUrl = window.URL.createObjectURL(blob)

  //     const a = document.createElement('a')
  //     a.href = blobUrl
  //     a.download = filename
  //     document.body.appendChild(a)
  //     a.click()
  //     a.remove()

  //     window.URL.revokeObjectURL(blobUrl)
  //   } catch (e) {
  //     message.error(`Failed to download ${filename}`)
  //   }
  // }

  const sanitizeFileName = (name = 'file') => {
    let n = name
    try {
      n = decodeURIComponent(name)
    } catch (_) {}
    // Windows-invalid chars like ":" break files
    return n.replace(/[\\/:*?"<>|]/g, '_').trim()
  }

  const forceDownloadByLink = (url, filename) => {
    // NOTE: for cross-origin, browser may ignore `download` and open in new tab
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener'
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const downloadFile = async (url, filename = 'file') => {
    const safeName = sanitizeFileName(filename)
    const safeUrl = encodeURI(url) // helps if url has spaces etc.

    try {
      const res = await fetch(safeUrl, {
        credentials: 'include', // important if your files need cookies
        cache: 'no-store',
      })

      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status} ${txt.slice(0, 120)}`)
      }

      const ct = (res.headers.get('content-type') || '').toLowerCase()
      if (ct.includes('text/html') || ct.includes('application/json')) {
        const txt = await res.text().catch(() => '')
        throw new Error(`Not a file response: ${ct}. ${txt.slice(0, 120)}`)
      }

      const blob = await res.blob()
      if (!blob || blob.size < 200) throw new Error('File too small (likely error response)')

      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = safeName
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (e) {
      // If fetch fails due to CORS (common for jpeg), fallback:
      forceDownloadByLink(safeUrl, safeName)
    }
  }

  const handleDownloadAllAttachments = async () => {
    // fileLists can be in 2 shapes in your code:
    // A) grouped backend: { Pan: [{url,fileName...}], Aadhar: [...] }
    // B) Upload fileList: { Pan: [{url,name...}], ... }
    const all = []

    // ✅ collect from fileLists
    Object.entries(fileLists || {}).forEach(([docType, list]) => {
      ;(list || []).forEach((f) => {
        const url = f?.url || f?.thumbUrl || f?.filePath
        const name =
          f?.name ||
          f?.fileName ||
          (typeof url === 'string' ? url.split('/').pop() : `${docType}.file`)

        if (url) all.push({ url, name })
      })
    })

    // ✅ optional: include profile photo also
    ;(imageValue || []).forEach((f) => {
      const url = f?.url || f?.thumbUrl || f?.filePath || getImageUrl(f)
      const name =
        f?.name || f?.fileName || (typeof url === 'string' ? url.split('/').pop() : `ProfilePhoto`)
      if (url) all.push({ url, name })
    })

    if (all.length === 0) {
      message.info('No attachments found to download.')
      return
    }

    // download one by one (browser will show multiple downloads)
    for (const item of all) {
      await downloadFile(item.url, item.name)
    }

    message.success(`Started downloading ${all.length} file(s).`)
  }

  const isNapsDepartment = (() => {
    if (!watch_department || !departments?.length) return false
    const selectedDept = departments.find(
      (d) => String(d.departmentId) === String(watch_department),
    )
    return selectedDept?.departmentName?.toUpperCase() === 'NAPS'
  })()

  const isNapsDesignation = (() => {
    if (!watch_designation || !designations?.length) return false
    const selectedDesg = designations.find(
      (d) => String(d.designationId) === String(watch_designation),
    )
    return selectedDesg?.designationName?.toUpperCase()?.includes('NAPS')
  })()

  const shouldRequireEsic =
    !isNapsDepartment && !isNapsDesignation && Number(watch_monthlyGrossCTC || 0) <= 21000

  const baseLocation = 'Mumbai'
  const dispatch = useDispatch()
  let user = form.getFieldValue('user') || {}
  const [actionMap, setActionMap] = useState({})
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const [joiningDateMonth, setJoiningDateMonth] = useState()
  const [joiningDateYear, setJoiningDateYear] = useState()
  const [videoPreviewOpen, setVideoPreviewOpen] = useState(false)
  const [videoPreviewSrc, setVideoPreviewSrc] = useState('')

  console.log('actionMap:', actionMap)

  useEffect(() => {
    if (watch_location) {
      const location = locations.find((loc) => loc.locationId === watch_location)
      const storeCode = location?.locationName?.split('-')
      if (storeCode) setCurrentStCode(storeCode[0])
    }
  }, [watch_location])

  useEffect(() => {
    if (watch_joiningDate) {
      console.log(`joiningDate: ${watch_joiningDate}`)
      const month = new Date(watch_joiningDate).getMonth() + 1
      const year = new Date(watch_joiningDate).getFullYear()
      setJoiningDateMonth(month)
      setJoiningDateYear(year)
    }
  }, [watch_joiningDate])

  const isImageFile = (fileName) => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName)
  const isPdfFile = (fileName) => /\.pdf$/i.test(fileName)
  const isExcelFile = (fileName) => /\.(xls|xlsx)$/i.test(fileName)
  const isWordFile = (fileName) => /\.(doc|docx)$/i.test(fileName)
  const isVideoFile = (fileName = '') =>
    /\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i.test(fileName.toLowerCase()) || /^video\//i.test(fileName)
  const rolesToCheck = ['Master']

  useEffect(() => {
    if (typeof furtherParts !== null && Array.isArray(furtherParts) && furtherParts?.length > 0) {
      const states = furtherParts?.reduce((acc, fp) => {
        acc[fp.actionFurtherPartName] = fp?.furtherPartStatus
        return acc
      }, {})

      setActionMap(states)
    }
  }, [furtherParts])

  useEffect(() => {
    // --- Getting data from ocr and setting into fields
    if ('aadhaar_front' in ocrData) {
      const frontObj = ocrData?.aadhaar_front

      // setting aadhar no
      if (
        frontObj?.aadhaar_number &&
        (String(frontObj?.aadhaar_number).trim() !== '' || frontObj?.aadhaar_number !== null)
      ) {
        user.aadharNo = String(frontObj?.aadhaar_number)?.split(' ').join('').trim()
      }

      // setting dob
      if (frontObj?.dob && (String(frontObj?.dob).trim() !== '' || frontObj?.dob !== null)) {
        const dob = String(frontObj?.dob).trim()
        // Normalize to YYYY-MM-DD so DatePicker's getValueProps dayjs(value) parses correctly
        let parsedDOB = dayjs(dob, 'DD/MM/YYYY', true)
        if (!parsedDOB.isValid()) parsedDOB = dayjs(dob, 'DD-MM-YYYY', true)
        if (!parsedDOB.isValid()) parsedDOB = dayjs(dob, 'YYYY-MM-DD', true)

        if (parsedDOB.isValid()) {
          user.dob = parsedDOB.format('YYYY-MM-DD')
        }
      }

      // setting gender
      if (
        frontObj?.gender &&
        (String(frontObj?.gender).trim() !== '' || frontObj?.gender !== null)
      ) {
        const s = frontObj?.gender
        const result = String(s).charAt(0).toUpperCase() + String(s).slice(1).toLowerCase()

        user.gender = result
      }

      // setting fullname
      if (frontObj?.name && (String(frontObj?.name).trim() !== '' || frontObj?.name !== null)) {
        const fullName = frontObj?.name
        user.fullName = fullName
        user.nameOnAadhar = fullName

        const splittedFullName = String(fullName).split(' ')
        if (Array.isArray(splittedFullName) && splittedFullName.length > 0) {
          if (splittedFullName.length === 0) {
            user.fullName = ''
            user.firstName = ''
            user.middleName = ''
            user.lastName = ''
          } else if (splittedFullName.length === 1) {
            user.firstName = splittedFullName[0]
          } else if (splittedFullName.length === 2) {
            user.firstName = splittedFullName[0]
            user.lastName = splittedFullName[1]
          } else if (splittedFullName.length === 3) {
            user.firstName = splittedFullName[0]
            user.middleName = splittedFullName[1]
            user.lastName = splittedFullName[2]
          } else {
            user.firstName = splittedFullName[0]
            user.middleName = splittedFullName[1]
            user.lastName = splittedFullName.slice(2).join(' ')
          }
        }
      }
    }

    // setting aadhar back fields
    if ('aadhaar_back' in ocrData) {
      // setting present address and pincode
      if (
        ocrData?.aadhaar_back?.address &&
        (String(ocrData?.aadhaar_back?.address).trim() !== '' ||
          ocrData?.aadhaar_back?.address !== null)
      ) {
        user.presentAddress = ocrData?.aadhaar_back?.address

        const pinCode = String(ocrData?.aadhaar_back?.address)?.slice(-6)
        user.presentAddressPinCode = pinCode
      }
    }

    // setting data for pan card
    if ('pan' in ocrData) {
      const pan = ocrData?.pan

      if (String(pan).trim() !== '' && pan !== null) {
        user.panNo = pan['PAN Number']
      }
    }
  }, [ocrData])

  // --- fetch shift api
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
    if (!showShiftAlignment) {
      form.setFieldsValue({
        user: {
          ...form.getFieldValue('user'),
          shiftID: undefined,
        },
      })
      form.setFields([{ name: ['user', 'shiftID'], errors: [] }])
    }
  }, [showShiftAlignment, form])

  // --- call shift api on page moount
  useEffect(() => {
    fetchShiftData()
  }, [])

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

  const fetchDesignationByDepartment = async (deptId, s1, s2, s3) => {
    if (!deptId) {
      setDesignations([])
      return
    }
    // Prefer the Department + Sub-Department -> Designation mapping.
    try {
      const mapRes = await getMappedDesignations(deptId, s1, s2, s3)
      const mapped = mapRes?.data || []
      if (Array.isArray(mapped) && mapped.length > 0) {
        setDesignations(mapped)
        return
      }
    } catch (e) {
      // fall through to the department-based list
    }
    // Fallback: department-based designations (e.g. when no mapping exists yet).
    const response = await getDesignationByDepartment(deptId)
    if (response?.status === 200) {
      const data = response.data?.data || []
      const desigs = isStoreHR
        ? data.filter(
            (d) =>
              !filterOutDesigFromStoreHr.includes(
                String(d.designationName || '')
                  .toLowerCase()
                  .trim(),
              ),
          )
        : data
      setDesignations(desigs)
    } else {
      setDesignations([])
    }
  }

  useEffect(() => {
    fetchDesignationByDepartment(watch_department, watch_subDept1, watch_subDept2, watch_subDept3)
  }, [watch_department, watch_subDept1, watch_subDept2, watch_subDept3])

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

  useEffect(() => {
    const shouldRequireEsic =
      !isNapsDepartment && !isNapsDesignation && Number(watch_monthlyGrossCTC || 0) <= 21000

    if (shouldRequireEsic) {
      // trigger validation immediately so empty field shows error
      form.validateFields([['user', 'prevEstNo']]).catch(() => {})
    } else {
      // clear previous errors when it becomes not-required / hidden
      form.setFields([{ name: ['user', 'prevEstNo'], errors: [] }])
    }
  }, [isNapsDepartment, isNapsDesignation, watch_monthlyGrossCTC, form])

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
      dataIndex: 'assignedLocationName',
      key: 'assignedLocationName',
    },
    {
      title: 'Location Code',
      dataIndex: 'assignedLocationSTCode',
      key: 'assignedLocationSTCode',
    },
    {
      title: 'From',
      dataIndex: ['assignedOnDate', 0],
      render: (date) => fmtDate(date),
    },
    {
      title: 'To',
      dataIndex: ['releasedOnDate', 1],
      render: (date) => fmtDate(date),
    },
    {
      title: 'Status',
      dataIndex: 'transferApprovalStatus',
      key: 'transferApprovalStatus',
      render: (val) => (val === 1 ? 'Approved' : val === 2 ? 'Rejected' : ''),
    },
    {
      title: 'Type',
      dataIndex: 'permanentTransfer',
      key: 'permanentTransfer',
      render: (_, record) =>
        record?.permanentTransfer === true
          ? 'Permanent Transfer'
          : record?.temporaryTransfer === true
            ? 'Temporary Transfer'
            : 'temporaryTransfer',
    },
    {
      title: 'Reason',
      dataIndex: 'assignedReason',
      render: (assignedReason) => <span>{assignedReason}</span>,
    },
  ]

  const totalTabs = 6

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
    1: [], // Tab 1 (Attachments) - no required fields
    2: [
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
      ['user', 'preferredLocation'],
      ['user', 'grossSalary'],
      ['user', 'aadharNo'],
      ['user', 'nameOnAadhar'],
      ['user', 'permanentAddress'],
      ['user', 'permanentAddressPinCode'],
      ['user', 'presentAddress'],
      ['user', 'presentAddressPinCode'],
      ['user', 'CompanyId'],
      ['user', 'panNo'],
      ['user', 'esicno'],
    ],
    3: [
      ['user', 'maritalStatus'],
      ['user', 'mobile'],
      ['user', 'isRelativeInCompany'],
      ['user', 'emailAddress'],
      ['user', 'bankIfscCode'],
      ['user', 'bankName'],
      ['user', 'accountNo'],
    ],
    4: [], // Experience
    5: [], // Qualification
    6: [], // Location Assignment
    7: [], // Salary Slip
  }

  watch_UANRegistered && validateTabFields[2]?.push(['user', 'uanNo'])
  watch_PFApplicable && validateTabFields[2]?.push(['user', 'isUANRegistered'])

  if (pathname !== '/candidate-form' || pathname !== '/employee/add_new') {
    validateTabFields[2]?.push(
      ['user', 'basicSalary'],
      ['user', 'hra'],
      ['user', 'cca'],
      ['user', 'da'],
      ['user', 'extraAllowance'],
      ['user', 'specialAllowance'],
      ['user', 'monthlyGrossCTC'],
      ['user', 'annuallyNetCTC'],
    )
  }

  async function checkMinWages() {
    if (!(currentStCode && watch_basicSalary)) {
      message.error('Location and basic salary are mandatory!')
      return false
    } else {
      try {
        setIsMinwageLoading(true)
        const response = await validateMinwage({
          stCode: currentStCode,
          salary: Number(watch_basicSalary),
        })

        if (response?.status === 200) {
          message.success(response?.data?.message || response?.data?.data?.message || 'Success')
          return true
        } else {
          message.error(
            response?.response?.data?.message ||
              response?.response?.data?.data?.message ||
              extractFirstErrorMessage(response) ||
              'Error getting minwage data',
          )
          return false
        }
      } catch (error) {
        console.error(`Error submitting minwage: ${error}`)
        message.error(
          error?.response?.data?.message ||
            extractFirstErrorMessage(error) ||
            'Error getting minwage data',
        )
        return false
      } finally {
        setIsMinwageLoading(false)
      }
    }
  }

  const handleTabChange = async (newActiveKey) => {
    if (newActiveKey < activeTab) {
      setActiveTab(newActiveKey)
      return
    }

    if (newActiveKey > activeTab) {
      try {
        for (let tabIndex = Number(activeTab); tabIndex < Number(newActiveKey); tabIndex++) {
          const fieldsToValidate = validateTabFields[tabIndex] || []

          if (fieldsToValidate.length > 0) {
            const formValues = form.getFieldValue()

            const emptyFields = fieldsToValidate.filter((field) => {
              const value = formValues[field[0]]?.[field[1]]
              return value === undefined || value === null || value === '' || value === 'none'
            })

            if (tabIndex === 2 && shouldRequireEsic) {
              fieldsToValidate.push(['user', 'prevEstNo'])
            }

            if (fieldsToValidate.length > 0) {
              await form.validateFields(fieldsToValidate)
            }

            if (emptyFields.length > 0) {
              throw new Error(
                `Tab ${tabIndex} has empty required fields: ${emptyFields.map((f) => f[1]).join(', ')}`,
              )
            }

            await form.validateFields(fieldsToValidate)
          }
        }

        // if (activeTab == 2) {
        //   const isValid = await checkMinWages()
        //   if (!isValid) {
        //     return
        //   }
        // }

        setActiveTab(newActiveKey)
      } catch (errorInfo) {
        console.error('Validation failed:', errorInfo)

        if (errorInfo.message && errorInfo.message.includes('has empty required fields')) {
          const tabMatch = errorInfo.message.match(/Tab (\d+)/)
          const failedTab = tabMatch ? tabMatch[1] : activeTab
          messageApi.error(`Please fill all required fields in tab ${failedTab}.`)
          return
        }

        let failedTab = activeTab
        if (errorInfo.errorFields && errorInfo.errorFields.length > 0) {
          const firstError = errorInfo.errorFields[0]

          for (let tabIndex = Number(activeTab); tabIndex < Number(newActiveKey); tabIndex++) {
            const fieldsToValidate = validateTabFields[tabIndex] || []
            if (
              fieldsToValidate.some(
                (field) => field[0] === firstError.name[0] && field[1] === firstError.name[1],
              )
            ) {
              failedTab = tabIndex
              break
            }
          }
        }

        messageApi.error(`Please fill all required fields in tab ${failedTab}.`)
        return
      }
    }
  }

  const handleNext = async () => {
    try {
      let fieldsToValidate = [...(validateTabFields[activeTab] || [])]

      // ✅ ensure ESIC No is validated on Next
      if (activeTab === '2' && shouldRequireEsic) {
        fieldsToValidate.push(['user', 'prevEstNo'])
      }

      if (fieldsToValidate.length > 0) {
        await form.validateFields(fieldsToValidate)

        // if (activeTab == 2) {
        //   const isValid = await checkMinWages()
        //   if (!isValid) {
        //     return
        //   }
        // }
      }

      setActiveTab((prev) => (Number(prev) < totalTabs ? String(Number(prev) + 1) : prev))
    } catch (errorInfo) {
      messageApi.error(`Please fill all required fields in tab ${activeTab}.`)
    }
  }

  function extractFirstErrorMessage(errors) {
    if (!errors || typeof errors !== 'object') return null

    const keys = Object.keys(errors)
    if (keys.length === 0) return null

    const firstKey = keys[0]
    const val = errors[firstKey]

    if (Array.isArray(val) && val.length > 0) {
      return String(val[0])
    }

    if (typeof val === 'string') {
      return val
    }

    // Common fallbacks
    if (data?.message) return data.message
    if (data?.title) return data.title
    if (data?.data?.message) return data.data.message
    return err?.message || 'Something went wrong'
  }

  const handleBack = () => {
    setActiveTab((prev) => (Number(prev) > 1 ? String(Number(prev) - 1) : prev))
  }

  const locat = useLocation()
  const loc = locat.pathname

  const attachmentLabels = [
    { value: 'Pan', lable: 'PAN Card Attachment', maxCount: 1 },
    { value: 'Aadhar', lable: 'Aadhar Attachment (Front)', maxCount: 1 },
    { value: 'AadharBack', lable: 'Aadhar Attachment (Back)', maxCount: 1 },
    { value: 'SalarySlip', lable: 'Salary Slip Attachment', maxCount: 3 },
    { value: 'BankPassbook', lable: 'Passbook Attachment/ Cancel Cheque', maxCount: 3 },
    { value: 'BankStatement', lable: 'Bank Statement', maxCount: 3 },
    { value: 'BankStatementVideo', lable: 'Bank Statement Video', maxCount: 1 },
    { value: 'PrevOfferLetter', lable: 'Prv Company Offer Letter', maxCount: 1 },
    { value: 'Education', lable: 'Education Attachment', maxCount: 10 },
    { value: 'Resume', lable: 'Resume Attachment', maxCount: 1 },
    { value: 'OfferLetter', lable: 'Current Offer Letter', maxCount: 1 },
    { value: 'Form11', lable: 'Form 11', maxCount: 1, hasSample: true, sampleFile: 'form_11.xlsx' },
    {
      value: 'GratuityForm',
      lable: 'Gratuity Form',
      maxCount: 1,
      hasSample: true,
      sampleFile: 'form_f_gratuity.doc',
    },
    {
      value: 'Form2',
      lable: 'Form 2 (EPF & EPS Nomination Form)',
      maxCount: 1,
      hasSample: true,
      sampleFile: 'form_2-EPF_and_EPS_nomination_form.doc',
    },
    { value: 'MedicalCard', lable: 'Medical Card Attachment', maxCount: 1 },
    { value: 'UanCard', lable: 'UAN Card Attachment', maxCount: 1 },
  ]

  const attachmentLabelsMapFrontend = [
    { value: 'pan', lable: 'PAN Card Attachment', maxCount: 1 },
    { value: 'aadhaar_front', lable: 'Aadhar Front Attachment', maxCount: 1 },
    { value: 'aadhaar_back', lable: 'Aadhar Back Attachment', maxCount: 1 },
    { value: 'SalarySlip', lable: 'Salary Slip Attachment', maxCount: 3 },
    { value: 'BankPassbook', lable: 'Passbook Attachment/ Cancel Cheque', maxCount: 3 },
    { value: 'BankStatement', lable: 'Bank Statement', maxCount: 3 },
    { value: 'BankStatementVideo', lable: 'Bank Statement Video', maxCount: 1 },
    { value: 'PrevOfferLetter', lable: 'Prv Company Offer Letter', maxCount: 1 },
    { value: 'Education', lable: 'Education Attachment', maxCount: 10 },
    { value: 'Resume', lable: 'Resume Attachment', maxCount: 1 },
    { value: 'OfferLetter', lable: 'Current Offer Letter', maxCount: 1 },
    { value: 'UanCard', lable: 'UAN Card Attachment', maxCount: 1 },
  ]

  // frontend key -> backend documentType
  const attachmentFrontendToBackend = {
    pan: 'Pan',
    aadhaar_front: 'Aadhar',
    aadhaar_back: 'Aadhar',
    SalarySlip: 'SalarySlip',
    BankPassbook: 'BankPassbook',
    BankStatement: 'BankStatement',
    BankStatementVideo: 'BankStatementVideo',
    PrevOfferLetter: 'PrevOfferLetter',
    Education: 'Education',
    Resume: 'Resume',
    OfferLetter: 'OfferLetter',
    PassportPhoto: 'PassportPhoto',
    UanCard: 'UanCard',
  }

  // backend documentType -> preferred frontend key(s) - used in reverse mapping
  const attachmentBackendToFrontend = {
    Pan: ['pan'],
    Aadhar: ['aadhaar_front', 'aadhaar_back'],
    SalarySlip: ['SalarySlip'],
    BankPassbook: ['BankPassbook'],
    BankStatement: ['BankStatement'],
    BankStatementVideo: ['BankStatementVideo'],
    PrevOfferLetter: ['PrevOfferLetter'],
    Education: ['Education'],
    Resume: ['Resume'],
    OfferLetter: ['OfferLetter'],
    PassportPhoto: ['PassportPhoto'],
    UanCard: ['UanCard'],
  }

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
    switch (pathname) {
      case '/register':
        navigate('/login')
        break
      case `/employee/add_new/${params.id}`:
        navigate('/candidate/form_list')
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

  const dropdowns = ['department', 'designation', 'location']
  const districts = ['Delhi', 'Mumbai', 'Kolkata', 'Chennai']

  const fetchDropdowns = async () => {
    try {
      const response = await getDropdownLocDesDep(dropdowns.join(', '))

      if (response.status) {
        let deptArr = response.data?.Department
        const desgArr = response.data?.Designation
        const locArr = response.data?.Location

        // StoreHR sees the same full (active) department list as everyone else (e.g. IT Superadmin),
        // so they can assign any department/sub-department when onboarding new candidates.
        setDepartments(deptArr)

        setLocations(locArr)
      }
    } catch (error) {
      // console.error('dropdowns api error:', error)
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
        const compArr = response?.data?.filter((c) => c?.companyId !== 2)
        setcompanys(compArr)
      }
    } catch (error) {
      // console.error('dropdowns api error:', error)
    }
  }

  useEffect(() => {
    fetchDropdownsComp()
    if (pathname.startsWith('/applicant')) {
      setVisible(true)
    }
  }, [])

  // Max total size of all attachments (18 MB)
  const MAX_TOTAL_ATTACHMENT_SIZE = 25 * 1024 * 1024 // 25 MB in bytes

  const getFileSize = (file) => {
    if (file?.originFileObj) return file.originFileObj.size || 0
    if (typeof file?.size === 'number') return file.size
    return 0
  }

  // Calculate total size of all new files (attachments + profile photo)
  const getAllAttachmentsTotalSize = (allFileLists = {}, profileFiles = []) => {
    let total = 0

    // attachments from fileLists
    Object.values(allFileLists).forEach((list = []) => {
      list.forEach((f) => {
        total += getFileSize(f)
      })
    })

    // profile photo
    ;(profileFiles || []).forEach((f) => {
      total += getFileSize(f)
    })

    return total
  }

  // const handleUploadChanges = async (documentType, info) => {
  //   const { file, fileList } = info
  //   let newDocType =
  //     documentType === 'Aadhar'
  //       ? 'aadhaar_front'
  //       : documentType === 'Pan'
  //         ? 'pan'
  //         : documentType === 'AadharBack'
  //           ? 'aadhaar_back'
  //           : ''

  //   if (file.status === 'removed') {
  //     setDeletedFiles((prev) => [...prev, file])
  //   }

  //   setFileLists((prev) => ({
  //     ...prev,
  //     [documentType]: fileList,
  //   }))

  //   if (file.status === 'removed') {
  //     return
  //   }

  //   const ocrDocTypes = ['Aadhar', 'Pan', 'AadharBack']
  //   if (!ocrDocTypes.includes(documentType)) {
  //     return
  //   }

  //   const newFormData = new FormData()

  //   if (Array.isArray(fileList) && fileList.length > 0)
  //     newFormData.append(newDocType, fileList[0]?.originFileObj)

  //   try {
  //     dispatch(set({ loading: true }))
  //     const response = await axios.post('http://103.29.220.152:8778/ocr/combined', newFormData)
  //     if (response.status === 200) {
  //       setOcrData(response.data)
  //     }
  //   } catch (error) {
  //     console.error('OCR API error:', error)
  //   } finally {
  //     dispatch(set({ loading: false }))
  //   }
  // }

  const handleUploadChanges = async (documentType, info) => {
    console.log('doctype', documentType)
    const { file, fileList } = info

    // When user removes a file
    if (file.status === 'removed') {
      setDeletedFiles((prev) => [...prev, file])
      setFileLists((prev) => ({
        ...prev,
        [documentType]: fileList,
      }))
      return
    }

    // Build a "next" state with this upload's new fileList
    const nextFileLists = {
      ...fileLists,
      [documentType]: fileList,
    }

    const totalSize = getAllAttachmentsTotalSize(nextFileLists, imageValue)

    if (totalSize > MAX_TOTAL_ATTACHMENT_SIZE) {
      message.error('Upload failed due to file size too large (max 25 MB for all attachments).')
      // Do NOT update fileLists → keeps UI at previous valid state
      return
    }

    // ✅ within limit → persist new fileList
    setFileLists(nextFileLists)

    // Medical Card flow is special: tblEmployee.MedicalCardUrl is updated
    // via a dedicated endpoint (the bulk attachment save path doesn't carry
    // this column). Upload immediately when a file is dropped here.
    if (documentType === 'MedicalCard' && file?.status !== 'removed' && file?.originFileObj) {
      if (!selectedEmpCode) {
        message.error('Save the employee first, then attach a medical card.')
        return
      }
      try {
        dispatch(set({ loading: true }))
        const fd = new FormData()
        fd.append('file', file.originFileObj)
        await axiosInstance.post(
          `/api/MedicalCard/upload/${encodeURIComponent(selectedEmpCode)}`,
          fd,
          { headers: { 'Content-Type': 'multipart/form-data' } },
        )
        message.success('Medical card uploaded.')
      } catch (err) {
        message.error(err?.response?.data?.message || 'Medical card upload failed.')
      } finally {
        dispatch(set({ loading: false }))
      }
      return
    }

    // OCR-related mapping
    let newDocType =
      documentType === 'Aadhar'
        ? 'aadhaar_front'
        : documentType === 'Pan'
          ? 'pan'
          : documentType === 'AadharBack'
            ? 'aadhaar_back'
            : ''

    const ocrDocTypes = ['Aadhar', 'Pan', 'AadharBack']

    if (!ocrDocTypes.includes(documentType)) {
      return
    }

    const newFormData = new FormData()
    if (Array.isArray(fileList) && fileList.length > 0) {
      newFormData.append(newDocType, fileList[0]?.originFileObj)
    }

    try {
      dispatch(set({ loading: true }))
      const response = await axios.post('http://103.29.220.152:8778/ocr/combined', newFormData)
      if (response.status === 200) {
        setOcrData(response.data)
      }
    } catch (error) {
      console.error('OCR API error:', error)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  // const handleUploadChange = ({ fileList }) => {
  //   if (fileList.length > 0) {
  //     setImageValue([fileList[fileList.length - 1]])
  //   }
  // }

  const handleUploadChange = ({ file, fileList }) => {
    // remove case
    if (file?.status === 'removed') {
      setImageValue([])
      return
    }

    const newImageList = fileList.length > 0 ? [fileList[fileList.length - 1]] : []

    const totalSize = getAllAttachmentsTotalSize(fileLists, newImageList)

    if (totalSize > MAX_TOTAL_ATTACHMENT_SIZE) {
      message.error('Upload failed due to file size too large (max 25 MB for all attachments).')
      // do not update imageValue → keep previous valid image
      return
    }

    setImageValue(newImageList)
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

  const fetchData = async (id) => {
    await dispatch(set({ loading: true }))

    try {
      let response

      if (pathname.includes('/employee/update')) {
        response = await getEmployeeById(id)
      } else if (pathname.includes('/employee/add_new')) {
        response = await getCandidateById(id)
      } else {
        response = await getCandidateById(id)
      }
      console.log('emp profile api response:', response)

      const attachdocuments = response?.data?.data?.documents || []
      const rawApiData = response?.data?.data?.candidateInfo || {}

      if (rawApiData?.empCode === 'NA' || rawApiData?.empCode?.trim() === '') {
        setIsCandidate(true)
      } else {
        setIsCandidate(false)
      }
      const apiData = cleanFields(rawApiData)

      setSelectedEmpCode(apiData?.empCode)

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

      const passportPhoto = attachdocuments.filter((doc) => doc.documentType === 'PassportPhoto')
      setProfilePhoto(passportPhoto)
      setSelectedEmpCode(apiData?.empCode)
      setStatusId(apiData?.statusId)
      setApplicantCode(apiData?.applicantCode)

      console.log('qqqqqqqqqqqq', selectedEmpCode)

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
        subDepartmentId1: apiData?.subDepartmentId1 ?? undefined,
        subDepartmentId2: apiData?.subDepartmentId2 ?? undefined,
        subDepartmentId3: apiData?.subDepartmentId3 ?? undefined,
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
        AOCode: apiData?.aoCode || '',
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
        PFApplicable: apiData?.pfApplicable ?? false,
        ESICApplicable: apiData?.esicApplicable ?? false,
        bonusApplicable:
          apiData?.bonusApplicable === true ||
          ['ctc', 'yes', 'true', '1'].includes(String(apiData?.bonusApplicable).toLowerCase())
            ? 'Ctc'
            : String(apiData?.bonusApplicable).toLowerCase() === 'stat'
              ? 'Stat'
              : 'No',
        CompanyId: apiData?.companyId || '',
        reportingHeadId: apiData?.reportingHeadId,
        isActive: apiData?.isActive,
        lastWorkingDay: apiData?.lastWorkingDay
          ? dayjs(apiData?.lastWorkingDay).format('YYYY-MM-DD')
          : '',
        differentlyAbled: apiData?.differentlyAbled || false,
        differentlyAbledReason: apiData?.differentlyAbledReason,
        differentlyAbledRemarks: apiData?.differentlyAbledRemarks || '',
        shiftID: apiData?.shiftID || 1,
        isUANRegistered: apiData?.isUANRegistered || false,

        // NEW: map reference fields into user object too (optional but neat)
        reference1LastCompany: apiData?.reference1LastCompany || '',
        contact1LastCompany: apiData?.contact1LastCompany || '',
        reference2LastCompany: apiData?.reference2LastCompany || '',
        contact2LastCompany: apiData?.contact2LastCompany || '',
        preferredLocation: apiData?.preferredLocation || '',
      }

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
        const baseUrl = import.meta.env.VITE_API_URL
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
      // not in the candidate documents list, so the loop above never sees it.
      // Hydrate the MedicalCard slot manually from apiData.medicalCardUrl.
      if (apiData?.medicalCardUrl) {
        const mcBase = import.meta.env.VITE_API_URL
        const mcRel = apiData.medicalCardUrl.replace(/\\/g, '/').replace(/^\//, '')
        const mcUrl = mcBase + mcRel
        updatedData['MedicalCard'] = [
          {
            uid: 'mc-' + mcRel,
            name: mcRel.split('/').pop(),
            status: 'done',
            url: mcUrl,
          },
        ]
      }

      setFileLists(updatedData)

      const formattedDatas = {
        ...new_res,
      }

      form.setFieldsValue({ user: formattedDatas })

      setFamilyMemberDataSource(familyDatas)
      setExperienceData(experienceDatas)
      setQualificationData(educationDatas)
      setAssignments(assignLocation)

      // NEW: populate referenceData from apiData
      // const referenceRow = {
      //   key: Date.now(),
      //   reference1LastCompany: apiData?.reference1LastCompany || '',
      //   contact1LastCompany: apiData?.contact1LastCompany || '',
      //   reference2LastCompany: apiData?.reference2LastCompany || '',
      //   contact2LastCompany: apiData?.contact2LastCompany || '',
      // }
      // setReferenceData([referenceRow])
    } catch (error) {
      console.error('Error fetching data emp:', error)
    }
    await dispatch(set({ loading: false }))
  }

  // convert grouped (documentType -> array of docs with url) to frontend fileLists
  function convertApiDocumentsToFileListsFromGrouped(grouped) {
    const result = {}
    const baseUrl = import.meta.env.VITE_API_URL

    for (const docType in grouped) {
      const docs = grouped[docType] || []

      if (docType === 'Aadhar') {
        const frontArr = []
        const backArr = []

        docs.forEach((doc) => {
          const filename = (doc.fileName || doc.filePath || '').toLowerCase()
          const url = doc.url || (baseUrl + (doc.filePath || '')).replace(/\\/g, '/')
          const fileObj = {
            uid: doc.id || url || Math.random(),
            name: doc.fileName || url.split('/').pop(),
            status: 'done',
            url,
            __meta: doc,
          }

          if (filename.includes('front') || filename.includes('frnt')) frontArr.push(fileObj)
          else if (filename.includes('back') || filename.includes('bak')) backArr.push(fileObj)
          else frontArr.push(fileObj)
        })

        if (frontArr.length && backArr.length === 0 && frontArr.length > 1) {
          result['aadhaar_front'] = [frontArr[0]]
          result['aadhaar_back'] = frontArr.slice(1)
        } else {
          if (frontArr.length) result['aadhaar_front'] = frontArr
          if (backArr.length) result['aadhaar_back'] = backArr
        }
      } else {
        const frontendKeys = attachmentBackendToFrontend[docType] || []
        const frontendKey = frontendKeys[0] || docType

        result[frontendKey] = docs.map((doc) => {
          const url = doc.url || (baseUrl + (doc.filePath || '')).replace(/\\/g, '/')
          return {
            uid: doc.id || url || Math.random(),
            name: doc.fileName || url.split('/').pop(),
            status: 'done',
            url,
            __meta: doc,
          }
        })
      }
    }

    return result
  }

  useEffect(() => {
    if (params?.id) fetchData(params?.id)
  }, [params?.id])

  useEffect(() => {
    if (role === 'Employee') fetchData()
  }, [employeeId])

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
    OfferLetter: 'OfferLetterAttachment',
    AadharBack: 'AadharBackAttachment',
    Form11: 'Form11Attachment',
    Form2: 'Form2Attachment',
    GratuityForm: 'GratuityFormAttachment',
    UanCard: 'UanCardAttachment',
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

  const handlePreview = async (file) => {
    console.log('file:', file)
    const fileUrl = file.url || file.preview || file.thumbUrl || file.filePath
    const fileName = file.name || file.fileName || fileUrl || ''
    const fileType = file.type || file.originFileObj?.type || ''

    if (isVideoFile(fileName) || fileType.startsWith('video/')) {
      let previewSrc = fileUrl
      if (!previewSrc && file.originFileObj) {
        previewSrc = URL.createObjectURL(file.originFileObj)
      }

      if (previewSrc) {
        setPreviewImage('')
        setVideoPreviewSrc(previewSrc)
        setVideoPreviewOpen(true)
      } else {
        Modal.info({
          title: 'Preview Not Available',
          content: 'Cannot generate preview for this video file.',
        })
      }
      return
    }

    if (isImageFile(fileUrl)) {
      if (!file.url && !file.preview && file.originFileObj) {
        file.preview = await getBase64(file.originFileObj)
      }
      setPreviewImage(file.url || file.preview || file.filePath)
      setPreviewOpen(true)
    } else if (isPdfFile(fileUrl) || isExcelFile(fileUrl) || isWordFile(fileUrl)) {
      window.open(fileUrl, '_blank')
    } else {
      Modal.info({
        title: 'Unsupported File',
        content: 'This file type is not supported for preview. Please download it to view.',
      })
    }
  }

  // 1. Initialize imageValue with profilePhoto (if available)
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

  const handleRemove = (file) => {
    setImageValue((prev) => prev.filter((item) => item.uid !== file.uid))
  }

  const handleRemoveAttachment = async (value, file) => {
    const requestBody = {
      id: Number(file?.id),
      cId: Number(file?.candidateId),
      isHardDelete: false,
      deletedBy: ecode,
    }

    dispatch(set({ loading: true }))
    const response = await deleteDocument(requestBody)

    // console.log('delete response:', response)

    if (response?.status === 200) {
      message.success(response?.data?.message || 'Document Deleted Successfully')
      await fetchData(params?.id)
    } else {
      message.error(response?.response?.data?.message || 'Document Deletion Failed')
    }

    dispatch(set({ loading: false }))
  }

  // const onFinish = async (values) => {
  //   await dispatch(set({ loading: true }))

  //   const ef = new FormData()
  const onFinish = async (values) => {
    await dispatch(set({ loading: true }))

    const ef = new FormData()

    // PF / ESIC Applicable are now driven by the user's Yes/No selection on the form.
    // Yes -> true (stored as bit 1), No -> false (stored as bit 0).
    const PFApplicablePayload = Boolean(values?.user?.PFApplicable)
    const ESICApplicablePayload = Boolean(values?.user?.ESICApplicable)

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

    // NEW: append last company references (taking first row)
    // if (referenceData && referenceData.length > 0) {
    //   const ref = referenceData[0]
    //   ef.append('reference1LastCompany', ref.reference1LastCompany || '')
    //   ef.append('contact1LastCompany', ref.contact1LastCompany || '')
    //   ef.append('reference2LastCompany', ref.reference2LastCompany || '')
    //   ef.append('contact2LastCompany', ref.contact2LastCompany || '')
    // }

    const AssignLocations = {
      assignedLocation: assignedLocation,
      assignedReason: assignedReason,
      isActive: true,
      assignedOnDate: dayjs(assignedOnDate).format('YYYY-MM-DD'),
      releasedOnDate: dayjs(releasedOnDate).format('YYYY-MM-DD'),
      permanentTransfer: transferType === 'permanent' ? true : false,
      temporaryTransfer: transferType === 'temporary' ? true : false,
      departmentId: assignedDepartment,
      designationId: assignedDesignation,
      transferApprovalStatus: 4,
      isReportingHeadApproval: 4,
      isHrApproval: 4,
    }

    ef.append('AssignLocationsListJson', JSON.stringify(AssignLocations))

    // if (values.user && typeof values.user === 'object') {
    //   Object.entries(values.user).forEach(([key, value]) => {
    //     if (value !== undefined && value !== null) {
    //       ef.append(`${key}`, value)
    //     }
    //   })
    // }
    // if (values.user && typeof values.user === 'object') {
    //   Object.entries(values.user).forEach(([key, value]) => {
    //     // Skip PF / ESIC form keys – we will send canonical names below
    //     if (key === 'PFApplicable' || key === 'ESICApplicable') return

    //     if (value !== undefined && value !== null) {
    //       ef.append(`${key}`, value)
    //     }
    //   })
    // }

    // // Always send PF as true
    // ef.append('pfApplicable', pfApplicablePayload)

    // // ESIC: true when Monthly Gross CTC ≤ 21000, else false
    // ef.append('esicApplicable', esicApplicablePayload)

    if (values.user && typeof values.user === 'object') {
      Object.entries(values.user).forEach(([key, value]) => {
        // We will control PFApplicable & ESICApplicable ourselves below
        if (key === 'PFApplicable' || key === 'ESICApplicable') return
        // Sub-department ids are appended explicitly below (always, so clearing persists).
        if (key === 'subDepartmentId1' || key === 'subDepartmentId2' || key === 'subDepartmentId3')
          return

        if (value !== undefined && value !== null) {
          ef.append(`${key}`, value)
        }
      })
    }

    // Sub-department chain selections (optional). Sent even when blank so unsetting persists.
    ef.append('subDepartmentId1', values?.user?.subDepartmentId1 ?? '')
    ef.append('subDepartmentId2', values?.user?.subDepartmentId2 ?? '')
    ef.append('subDepartmentId3', values?.user?.subDepartmentId3 ?? '')

    // Backend expects PFApplicable & ESICApplicable (camel-case)
    ef.append('PFApplicable', PFApplicablePayload) // always true
    ef.append('ESICApplicable', ESICApplicablePayload) // true if monthlyGrossCTC <= 21000

    Object.entries(values).forEach(([key, value]) => {
      if (key !== 'user' && value !== undefined && value !== null) {
        ef.append(key, value)
      }
    })

    if (params?.id) {
      ef.append('id', params?.id)
    }

    // for (const [key, value] of ef.entries()) {
    //   console.log(`key: ${key} and value: ${value}`)
    // }

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
      message_error(error.response?.data?.message || 'Upload Failed')
    } finally {
      await dispatch(set({ loading: false }))
    }
  }

  const runUpdateFunction = async (values) => {
    try {
      const allRequiredFields = []
      Object.values(validateTabFields).forEach((fields) => {
        allRequiredFields.push(...fields)
      })

      if (allRequiredFields.length > 0) {
        await form.validateFields(allRequiredFields)
      }

      await onFinish(values)
    } catch (errorInfo) {
      messageApi.error('Please fill all required fields before submitting.')
      return
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

  // NEW: reference table handlers
  // const addRowReferenceData = () => {
  //   setReferenceData([
  //     ...referenceData,
  //     {
  //       key: Date.now(),
  //       reference1LastCompany: '',
  //       contact1LastCompany: '',
  //       reference2LastCompany: '',
  //       contact2LastCompany: '',
  //     },
  //   ])
  // }

  // const deleteReferenceRow = (key) => {
  //   const updated = referenceData.filter((item) => item.key !== key)
  //   setReferenceData(updated)
  // }

  // const handleReferenceInputChange = (id, field, value) => {
  //   const newData = referenceData.map((item) => {
  //     if (item.key === id) {
  //       return { ...item, [field]: value }
  //     }
  //     return item
  //   })
  //   setReferenceData(newData)
  // }

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
          {loc !== '/register' && loc !== '/employee/add_new' && loc !== '/employee-form' && (
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
          name="user"
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
                    const acceptFileTypes =
                      attachment.value === 'BankStatementVideo'
                        ? 'video/*,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv'
                        : '.pdf,.doc,.docx,.txt,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.jfif'

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
                        <Flex
                          style={{ marginBottom: 12 }}
                          align="center"
                          justify="space-between"
                          gap={8}
                          wrap
                        >
                          <h6>{attachment.lable}</h6>
                          {attachment?.hasSample && (
                            <Link target="_blank" to={`/${attachment.sampleFile}`}>
                              Sample
                            </Link>
                          )}
                        </Flex>
                        <Upload
                          maxCount={attachment.maxCount}
                          className="custom-upload-attachements"
                          listType="picture-card"
                          multiple
                          onChange={(info) => handleUploadChanges(attachment.value, info)}
                          beforeUpload={() => false}
                          fileList={currentFileList}
                          onPreview={handlePreview}
                          // onRemove={(file) => handleRemoveAttachment(attachment.value, file)}
                          onRemove={(file) =>
                            new Promise((resolve) => {
                              Modal.confirm({
                                title: 'Delete this file?',
                                content: file.name,
                                okText: 'Delete',
                                cancelText: 'Cancel',
                                okButtonProps: { danger: true },
                                onOk: () => {
                                  // EITHER let Upload remove:
                                  // resolve(true)

                                  // OR do it yourself and prevent Upload from removing:
                                  handleRemoveAttachment(attachment.value, file)
                                  resolve(false)
                                },
                                onCancel: () => resolve(false),
                              })
                            })
                          }
                          accept={acceptFileTypes}
                        >
                          {!isMaxReached && (
                            <div style={{ textAlign: 'center' }}>
                              <UploadOutlined style={{ fontSize: 20 }} />
                              <div style={{ fontSize: 12 }}>Upload</div>
                            </div>
                          )}
                        </Upload>

                        {previewImage && (
                          <Image
                            wrapperStyle={{ display: 'none' }}
                            preview={{
                              visible: previewOpen,
                              onVisibleChange: (visible) => setPreviewOpen(visible),
                              afterOpenChange: (visible) => !visible && setPreviewImage(''),
                            }}
                            src={previewImage}
                          />
                        )}
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
                    valuePropName="fileList"
                    getValueFromEvent={(e) => e?.fileList}
                    labelCol={{ span: 24 }}
                    style={{ textAlign: 'center' }}
                    rules={[{ required: true, message: 'Profile photo is mandatory' }]}
                  >
                    <Upload
                      className="custom profile-photo"
                      listType="picture-card"
                      maxCount={1}
                      fileList={imageValue}
                      onChange={handleUploadChange}
                      beforeUpload={beforeUpload}
                      showUploadList={false}
                      onRemove={handleRemove}
                    >
                      {imageValue.length > 0 ? (
                        <div className="upload-image-wrapper">
                          <img
                            src={getImageUrl(imageValue[0])}
                            alt="avatar"
                            className="uploaded-image"
                          />
                          <div className="upload-hover-overlay">
                            <PlusOutlined style={{ fontSize: 24, color: '#fff' }} />
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center' }}>
                          <PlusOutlined style={{ fontSize: 24, color: '#999' }} />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} name={['user', 'empCode']} label="Emp. Code">
                    <Input
                      disabled={loc !== '/employee-form'}
                      tabIndex={1}
                      onBlur={handleTrimOnBlur(form, ['user', 'empCode'])}
                    />
                  </Form.Item>

                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'firstName']}
                    label="First Name"
                    rules={[{ required: true, message: 'First name is required' }]}
                  >
                    <Input tabIndex={3} onBlur={handleTrimOnBlur(form, ['user', 'firstName'])} />
                  </Form.Item>

                  <Form.Item labelCol={{ span: 24 }} name={['user', 'lastName']} label="Last Name">
                    <Input tabIndex={5} onBlur={handleTrimOnBlur(form, ['user', 'lastName'])} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
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
                    <Select tabIndex={2}>
                      <Select.Option value="none">Select</Select.Option>
                      <Select.Option value="Mr">Mr</Select.Option>
                      <Select.Option value="Ms">Ms</Select.Option>
                      <Select.Option value="Mrs">Mrs</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'middleName']}
                    label="Middle Name"
                  >
                    <Input tabIndex={4} onBlur={handleTrimOnBlur(form, ['user', 'middleName'])} />
                  </Form.Item>

                  <Form.Item labelCol={{ span: 24 }} name={['user', 'fullName']} label="Full Name">
                    <Input tabIndex={6} onBlur={handleTrimOnBlur(form, ['user', 'fullName'])} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                <Col xs={24} sm={12} md={8}>
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
                    <Select tabIndex={7}>
                      <Select.Option value="none">Select</Select.Option>
                      <Select.Option value="Male">Male</Select.Option>
                      <Select.Option value="Female">Female</Select.Option>
                      <Select.Option value="Other">Others</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'husbandName']}
                    label="Spouse Name"
                  >
                    <Input tabIndex={10} onBlur={handleTrimOnBlur(form, ['user', 'husbandName'])} />
                  </Form.Item>

                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'aadharNo']}
                    // label={
                    //   <LabelWithPhotoButtons
                    //     label="Aadhar No."
                    //     form={form}
                    //     uploads={[
                    //       { fieldKey: 'aadhaarFront', name: 'Aadhar Front' },
                    //       { fieldKey: 'aadhaarBack', name: 'Aadhar Back' },
                    //     ]}
                    //     setOcrData={setOcrData}
                    //   />
                    // }
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
                    <Input
                      maxLength={12}
                      tabIndex={13}
                      onBlur={handleTrimOnBlur(form, ['user', 'aadharNo'])}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'fathersName']}
                    label="Father's Name"
                    rules={[{ required: true, message: 'Father name is required' }]}
                  >
                    <Input tabIndex={8} onBlur={handleTrimOnBlur(form, ['user', 'fathersName'])} />
                  </Form.Item>

                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'placeOfBirth']}
                    label="Place of Birth"
                  >
                    <Input
                      tabIndex={11}
                      onBlur={handleTrimOnBlur(form, ['user', 'placeOfBirth'])}
                    />
                  </Form.Item>

                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'nameOnAadhar']}
                    label="Name on Aadhar"
                    rules={[{ required: true, message: 'Name on aadhaar is required' }]}
                  >
                    <Input
                      tabIndex={14}
                      onBlur={handleTrimOnBlur(form, ['user', 'nameOnAadhar'])}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'mothersName']}
                    label="Mother's Name"
                    rules={[{ required: true, message: 'Mother name is required' }]}
                  >
                    <Input tabIndex={9} onBlur={handleTrimOnBlur(form, ['user', 'mothersName'])} />
                  </Form.Item>

                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'panNo']}
                    rules={[
                      { required: true, message: 'Please enter PAN No.' },
                      {
                        pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i,
                        message: 'Please enter a valid PAN No. (e.g. ABCDE1234F)',
                      },
                    ]}
                    label="PAN No."
                  >
                    <Input
                      maxLength={10}
                      style={{ textTransform: 'uppercase' }}
                      tabIndex={12}
                      onBlur={handleTrimOnBlur(form, ['user', 'panNo'])}
                    />
                  </Form.Item>

                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'dob']}
                    label="Date of Birth"
                    getValueProps={(value) => ({
                      value: value ? dayjs(value) : null,
                    })}
                    getValueFromEvent={(date) => (date ? date.format('YYYY-MM-DD') : null)}
                    rules={[
                      {
                        required: true,
                        message: 'Please select your date of birth',
                      },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve()

                          const birthDate = dayjs(value)
                          if (!birthDate.isValid()) {
                            return Promise.reject(new Error('Invalid date'))
                          }

                          const isAtLeast18 = dayjs().diff(birthDate, 'year') >= 18
                          return isAtLeast18
                            ? Promise.resolve()
                            : Promise.reject(new Error('You must be at least 18 years old'))
                        },
                      },
                    ]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD-MM-YYYY"
                      tabIndex={15}
                      disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <>
                {/* {(rolesToCheck.includes(role) ||
                  (role === 'StoreHR' && isCandidate === true && isStore === false) ||
                  (role === 'HR' && isCandidate === true) ||
                  pathname === '/employee/add_new' ||
                  pathname === '/candidate-form') && (
                  // || pathname === '/candidate-form'
                  )} */}
                {actionMap?.Salary && <Divider orientation="left">Salary Details</Divider>}

                <Row
                  gutter={24}
                  style={{
                    flexWrap: 'wrap',
                    // display: !(
                    //   rolesToCheck.includes(role) ||
                    //   (role === 'StoreHR' && isCandidate === true && isStore === false) ||
                    //   (role === 'HR' && isCandidate === true) ||
                    //   pathname === '/employee/add_new' ||
                    //   pathname === '/candidate-form'
                    // )
                    //   ? 'none'
                    //   : '',
                    display: actionMap?.Salary ? '' : 'none',
                  }}
                >
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'basicSalary']}
                      label="Basic Salary"
                      rules={[
                        { required: actionMap?.Salary ? true : false },
                        { pattern: /^\d+(\.\d+)?$/, message: 'Enter a valid decimal number' },
                      ]}
                    >
                      <Input
                        tabIndex={19}
                        onBlur={handleTrimOnBlur(form, ['user', 'basicSalary'])}
                      />
                    </Form.Item>

                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'cca']}
                      label="C.C.A."
                      rules={[
                        { required: actionMap?.Salary ? true : false },
                        { pattern: /^\d+(\.\d+)?$/, message: 'Enter a valid decimal number' },
                      ]}
                    >
                      <Input tabIndex={22} onBlur={handleTrimOnBlur(form, ['user', 'cca'])} />
                    </Form.Item>

                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'specialAllowance']}
                      label="Special Allowance"
                      rules={[
                        { required: actionMap?.Salary ? true : false },
                        { pattern: /^\d+(\.\d+)?$/, message: 'Enter a valid decimal number' },
                      ]}
                    >
                      <Input
                        tabIndex={23}
                        onBlur={handleTrimOnBlur(form, ['user', 'specialAllowance'])}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'grossSalary']}
                      label="Gross Salary"
                      rules={[
                        { required: actionMap?.Salary ? true : false },
                        { pattern: /^\d+(\.\d+)?$/, message: 'Enter a valid decimal number' },
                      ]}
                    >
                      <Input
                        tabIndex={17}
                        onBlur={handleTrimOnBlur(form, ['user', 'grossSalary'])}
                        readOnly
                      />
                    </Form.Item>

                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'da']}
                      label="D.A."
                      rules={[
                        { required: actionMap?.Salary ? true : false },
                        { pattern: /^\d+(\.\d+)?$/, message: 'Enter a valid decimal number' },
                      ]}
                    >
                      <Input tabIndex={20} onBlur={handleTrimOnBlur(form, ['user', 'da'])} />
                    </Form.Item>

                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'monthlyGrossCTC']}
                      label="Monthly Gross CTC"
                      rules={[
                        { required: actionMap?.Salary ? true : false },
                        { pattern: /^\d+(\.\d+)?$/, message: 'Enter a valid decimal number' },
                      ]}
                    >
                      <Input
                        tabIndex={27}
                        onBlur={handleTrimOnBlur(form, ['user', 'monthlyGrossCTC'])}
                        readOnly
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'hra']}
                      label="H.R.A."
                      rules={[
                        { required: actionMap?.Salary ? true : false },
                        { pattern: /^\d+(\.\d+)?$/, message: 'Enter a valid decimal number' },
                      ]}
                    >
                      <Input tabIndex={18} onBlur={handleTrimOnBlur(form, ['user', 'hra'])} />
                    </Form.Item>

                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'extraAllowance']}
                      label="Extra Allowance"
                      rules={[
                        { required: actionMap?.Salary ? true : false },
                        { pattern: /^\d+(\.\d+)?$/, message: 'Enter a valid decimal number' },
                      ]}
                    >
                      <Input
                        tabIndex={21}
                        onBlur={handleTrimOnBlur(form, ['user', 'extraAllowance'])}
                      />
                    </Form.Item>

                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'annuallyNetCTC']}
                      label="Annually Net CTC"
                      rules={[
                        { required: actionMap?.Salary ? true : false },
                        { pattern: /^\d+(\.\d+)?$/, message: 'Enter a valid decimal number' },
                      ]}
                    >
                      <Input
                        tabIndex={32}
                        onBlur={handleTrimOnBlur(form, ['user', 'annuallyNetCTC'])}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Divider orientation="left"></Divider>
              </>

              <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                <Col xs={24} sm={12} md={8}>
                  {!pathname.includes('/candidate-form') && (
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'joiningDate']}
                      label="Joining Date"
                      rules={[
                        {
                          required: true,
                          // Field is read-only here, so it cannot be corrected on this
                          // screen - point the user at the form that owns the value.
                          message: 'Joining date is missing - set it on the candidate form',
                        },
                      ]}
                      getValueProps={(value) => ({
                        value: value ? dayjs(value) : null,
                      })}
                      getValueFromEvent={(date) => (date ? date.format('YYYY-MM-DD') : null)}
                    >
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD-MM-YYYY"
                        tabIndex={16}
                        // Joining date is set on the candidate form only; it is read-only
                        // everywhere in employee master (edit and view).
                        disabled
                      />
                    </Form.Item>
                  )}
                </Col>

                <Col xs={24} sm={12} md={8}>
                  {!pathname.includes('/candidate-form') && (
                    // <Form.Item
                    //   labelCol={{ span: 24 }}
                    //   name={['user', 'department']}
                    //   label="Department"
                    //   rules={[
                    //     { required: true, message: 'Department is required' },
                    //     {
                    //       validator: (_, value) =>
                    //         value === 'none'
                    //           ? Promise.reject(new Error('Please select a valid designation'))
                    //           : Promise.resolve(),
                    //     },
                    //   ]}
                    // >
                    //   <Select showSearch optionFilterProp="children" tabIndex={26} disabled>
                    //     <Select.Option value="none" data-id={null} key={Date.now()}>
                    //       Select department
                    //     </Select.Option>
                    //     {departments.map((comp) => (
                    //       <Select.Option value={comp.departmentId} key={comp.departmentId}>
                    //         {comp.departmentName}
                    //       </Select.Option>
                    //     ))}
                    //   </Select>
                    // </Form.Item>
                    <Form.Item
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
                      <Select
                        showSearch
                        optionFilterProp="children"
                        tabIndex={26}
                        disabled={disableDeptDesgUanForStoreHrOnUpdate}
                      >
                        <Select.Option value="none" data-id={null} key={Date.now()}>
                          Select department
                        </Select.Option>
                        {departments.map((comp) => (
                          <Select.Option value={comp.departmentId} key={comp.departmentId}>
                            {comp.departmentName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}
                </Col>

                {/* 3 cascading sub-department selects (optional), tied to Department */}
                {!pathname.includes('/candidate-form') && (
                  <SubDepartmentCascade
                    form={form}
                    departmentName={['user', 'department']}
                    namePrefix={['user']}
                    disabled={disableDeptDesgUanForStoreHrOnUpdate}
                    requiredLevel1
                  />
                )}

                <Col xs={24} sm={12} md={8}>
                  {!pathname.includes('/candidate-form') && (
                    // <Form.Item
                    //   labelCol={{ span: 24 }}
                    //   name={['user', 'designation']}
                    //   label="Designation"
                    //   rules={[
                    //     { required: true, message: 'Designation is required' },
                    //     {
                    //       validator: (_, value) =>
                    //         value === 'none'
                    //           ? Promise.reject(new Error('Please select a valid designation'))
                    //           : Promise.resolve(),
                    //     },
                    //   ]}
                    // >
                    //   <Select showSearch optionFilterProp="children" tabIndex={24} disabled>
                    //     <Select.Option value="none">Select designation</Select.Option>
                    //     {designations.map((desg) => (
                    //       <Select.Option value={desg.designationId} key={desg.designationId}>
                    //         {desg.designationName}
                    //       </Select.Option>
                    //     ))}
                    //   </Select>
                    // </Form.Item>
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
                      <Select
                        showSearch
                        optionFilterProp="children"
                        tabIndex={24}
                        disabled={disableDeptDesgUanForStoreHrOnUpdate}
                      >
                        <Select.Option value="none">Select designation</Select.Option>
                        {designations.map((desg) => (
                          <Select.Option value={desg.designationId} key={desg.designationId}>
                            {desg.designationName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}
                </Col>
              </Row>

              <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                <Col xs={24} sm={12} md={6}>
                  {!pathname.includes('/candidate-form') && (
                    <Form.Item
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
                      <Select
                        showSearch
                        optionFilterProp="children"
                        tabIndex={25}
                        disabled={isStoreHR && !actionMap?.CanStoreHrEditLocation}
                      >
                        <Select.Option value="none">Select Location</Select.Option>
                        {locations.map((loc) => (
                          <Select.Option value={loc.locationId} key={loc.locationId}>
                            {loc.locationName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}
                </Col>

                <Col xs={24} sm={12} md={6}>
                  {!pathname.includes('/candidate-form') && (
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'preferredLocation']}
                      label="Preferred Location"
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
                      {/* <Select showSearch optionFilterProp="children" tabIndex={25}>
                        <Select.Option value="none">Select Location</Select.Option>
                        {locations.map((loc) => (
                          <Select.Option value={loc.locationId} key={loc.locationId}>
                            {loc.locationName}
                          </Select.Option>
                        ))}
                      </Select> */}
                      <Input placeholder="Enter preferred location" />
                    </Form.Item>
                  )}
                </Col>

                <Col xs={24} sm={12} md={6}>
                  {!pathname.includes('/candidate-form') && (
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'CompanyId']}
                      label="Company"
                      rules={[
                        { required: true, message: 'Company is required' },
                        {
                          validator: (_, value) =>
                            value === 'none'
                              ? Promise.reject(new Error('Please select a valid company'))
                              : Promise.resolve(),
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        optionFilterProp="children"
                        tabIndex={26}
                        disabled={pathname.includes('/employee/update')}
                      >
                        <Select.Option value="none" data-id={null}>
                          Select Company
                        </Select.Option>
                        {companys.map((comp) => (
                          <Select.Option value={comp.companyId} key={comp.companyId}>
                            {comp.companyName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}
                </Col>

                <Col xs={24} sm={12} md={6}>
                  {!pathname.includes('/candidate-form') && (
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'bonusApplicable']}
                      label="Bonus Applicable"
                    >
                      <Select placeholder="Select">
                        <Select.Option value="Stat">Stat</Select.Option>
                        <Select.Option value="Ctc">Ctc</Select.Option>
                        <Select.Option value="No">No</Select.Option>
                      </Select>
                    </Form.Item>
                  )}
                </Col>
                <Col xs={24} sm={12} md={6}>
                  {!pathname.includes('/candidate-form') && (
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'PFApplicable']}
                      label="PF Applicable"
                    >
                      <Select placeholder="Select">
                        <Select.Option value={true}>Yes</Select.Option>
                        <Select.Option value={false}>No</Select.Option>
                      </Select>
                    </Form.Item>
                  )}
                </Col>
                <Col xs={24} sm={12} md={6}>
                  {!pathname.includes('/candidate-form') && (
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'ESICApplicable']}
                      label="ESIC Applicable"
                    >
                      <Select placeholder="Select">
                        <Select.Option value={true}>Yes</Select.Option>
                        <Select.Option value={false}>No</Select.Option>
                      </Select>
                    </Form.Item>
                  )}
                </Col>
              </Row>

              <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                <Col xs={24} sm={12} md={12}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'presentAddress']}
                    label="Present Address"
                    rules={[{ required: true, message: 'Present address is required' }]}
                  >
                    <Input.TextArea
                      rows={5}
                      tabIndex={28}
                      onBlur={handleTrimOnBlur(form, ['user', 'presentAddress'])}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={12}>
                  <Form.Item
                    label={
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>Permanent Address</span>
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
                          style={{ fontSize: '0.75rem' }}
                        >
                          Same as Present
                        </Checkbox>
                      </div>
                    }
                    labelCol={{ span: 24 }}
                    name={['user', 'permanentAddress']}
                    rules={[{ required: true, message: 'Permanent address is required' }]}
                  >
                    <Input.TextArea
                      rows={5}
                      tabIndex={30}
                      onBlur={handleTrimOnBlur(form, ['user', 'permanentAddress'])}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                <Col xs={24} sm={12} md={12}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'presentAddressPinCode']}
                    label="Present Address Pin Code"
                    rules={[
                      { required: true, message: 'Present address pin code is required' },
                      { pattern: /^[1-9][0-9]{5}$/, message: 'Enter a valid 6-digit pin code' },
                    ]}
                  >
                    <Input
                      maxLength={6}
                      tabIndex={29}
                      onBlur={handleTrimOnBlur(form, ['user', 'presentAddressPinCode'])}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={12}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'permanentAddressPinCode']}
                    label="Permanent Address Pin Code"
                    rules={[
                      { required: true, message: 'Permanent address pin code is required' },
                      { pattern: /^[1-9][0-9]{5}$/, message: 'Enter a valid 6-digit pin code' },
                    ]}
                  >
                    <Input
                      maxLength={6}
                      tabIndex={31}
                      onBlur={handleTrimOnBlur(form, ['user', 'permanentAddressPinCode'])}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                {/* <Col xs={24} sm={12} md={8}>
                  {!pathname.includes('/candidate-form') && (
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'PFApplicable']}
                      label="PF Applicable"
                    >
                      <Select placeholder="Select">
                        <Select.Option value={true}>Yes</Select.Option>
                        <Select.Option value={false}>No</Select.Option>
                      </Select>
                    </Form.Item>
                  )}
                </Col> */}

                {/* {watch_PFApplicable && (
                  <Col xs={24} sm={12} md={8}>
                    {!pathname.includes('/candidate-form') && (
                      <Form.Item
                        labelCol={{ span: 24 }}
                        name={['user', 'isUANRegistered']}
                        // label="UAN Registered"
                        rules={[{ required: watch_PFApplicable === true ? true : false }]}
                        label={
                          <>
                            UAN Registered &nbsp;
                            <span>
                              {!watch_UANRegistered ? (
                                <a href="/uan_no_registration.mp4" target="_blank">
                                  Register UAN
                                </a>
                              ) : (
                                ''
                              )}
                            </span>
                          </>
                        }
                      >
                        <Select placeholder="Select">
                          <Select.Option value={true}>Yes</Select.Option>
                          <Select.Option value={false}>No</Select.Option>
                        </Select>
                      </Form.Item>
                    )}
                  </Col>
                )} */}

                {/* {watch_PFApplicable && ( */}
                {/* <Col xs={24} sm={12} md={8}>
                  {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'uanNo']}
                      label="UAN No."
                      rules={[
                        {
                          pattern: /^\d{1,12}$/,
                          message: 'UAN No. must be up to 12 digits only',
                        },
                        {
                          required: watch_UANRegistered ? true : false,
                          message: 'UAN No. is required',
                        },
                      ]}
                    >
                      <Input
                        maxLength={12}
                        inputMode="numeric"
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault()
                          }
                        }}
                        placeholder="Enter UAN No."
                        // disabled={
                        //   actionMap?.UANUpdate === false || joiningDateMonth === currentMonth
                        //   // ? false
                        //   // : true
                        // }
                        disabled={!actionMap?.UANUpdate && joiningDateMonth !== currentMonth}
                      />
                    </Form.Item> */}
                {/* 
                <Form.Item
                  labelCol={{ span: 24 }}
                  name={['user', 'uanNo']}
                  label="UAN No."
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const isUANRegistered = getFieldValue(['user', 'isUANRegistered'])
                        const v = (value ?? '').toString().trim()

                        // If UAN is required, enforce exactly 12 digits
                        if (isUANRegistered) {
                          if (!v) return Promise.reject(new Error('UAN No. is required'))
                          if (!/^\d{12}$/.test(v)) {
                            return Promise.reject(new Error('UAN No. must be exactly 12 digits'))
                          }
                          return Promise.resolve()
                        }

                        // If not required: allow empty; if provided, still enforce exactly 12
                        if (!v) return Promise.resolve()
                        return /^\d{12}$/.test(v)
                          ? Promise.resolve()
                          : Promise.reject(new Error('UAN No. must be exactly 12 digits'))
                      },
                    }),
                  ]}
                >
                  <Input
                    maxLength={12}
                    inputMode="numeric"
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) e.preventDefault()
                    }}
                    placeholder="Enter UAN No."
                    disabled={joiningDateMonth === currentMonth ? false : true}
                  />
                </Form.Item> */}
                {/* </Col> */}

                {/* Show UAN No. when designation is NOT Apprentice */}
                {!isNapsDepartment && !isNapsDesignation && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'uanNo']}
                      label="UAN No."
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const isUANRegistered = getFieldValue(['user', 'isUANRegistered'])
                            const v = (value ?? '').toString().trim()

                            if (isUANRegistered) {
                              if (!v) return Promise.reject(new Error('UAN No. is required'))
                              if (!/^\d{12}$/.test(v)) {
                                return Promise.reject(
                                  new Error('UAN No. must be exactly 12 digits'),
                                )
                              }
                              return Promise.resolve()
                            }

                            if (!v) return Promise.resolve()
                            return /^\d{12}$/.test(v)
                              ? Promise.resolve()
                              : Promise.reject(new Error('UAN No. must be exactly 12 digits'))
                          },
                        }),
                      ]}
                    >
                      <Input
                        maxLength={12}
                        inputMode="numeric"
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) e.preventDefault()
                        }}
                        placeholder="Enter UAN No."
                        disabled={disableDeptDesgUanForStoreHrOnUpdate}
                      />
                    </Form.Item>
                  </Col>
                )}

                {/* Show AO Code when designation IS Apprentice */}
                {(isNapsDepartment || isNapsDesignation) && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'AOCode']}
                      label="AO Code"
                      // rules={[{ required: true, message: 'AO Code is required for Apprentice' }]}
                    >
                      <Input
                        placeholder="Enter AO Code"
                        onBlur={handleTrimOnBlur(form, ['user', 'aoCode'])}
                      />
                    </Form.Item>
                  </Col>
                )}

                {/* )} */}

                {/* <Col xs={24} sm={12} md={8}>
                  {!pathname.includes('/candidate-form') && (
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'ESICApplicable']}
                      label="ESIC Applicable"
                    >
                      <Select placeholder="Select">
                        <Select.Option value={true}>Yes</Select.Option>
                        <Select.Option value={false}>No</Select.Option>
                      </Select>
                    </Form.Item>
                  )}
                </Col> */}

                {/* {esicApplicable && ( */}
                {/* <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'prevEstNo']}
                      label="ESIC No."
                      rules={[
                        {
                          pattern: /^\d+$/,
                          message: 'Only integer values are allowed',
                        },
                      ]}
                    >
                      <Input
                        onBlur={handleTrimOnBlur(form, ['user', 'prevEstNo'])}
                        onChange={(e) => {
                          const value = e.target.value
                          // Allow only digits
                          if (/^\d*$/.test(value)) {
                            form.setFieldValue(['user', 'prevEstNo'], value)
                          }
                        }}
                      />
                    </Form.Item>
                  </Col> */}
                {/* {Number(watch_monthlyGrossCTC || 0) <= 21000 && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'prevEstNo']}
                      label="ESIC No."
                      rules={[
                        {
                          required: true,
                          message: 'ESIC No. is required when Monthly Gross Salary ≤ 21000',
                        },
                        {
                          pattern: /^\d+$/,
                          message: 'Only integer values are allowed',
                        },
                      ]}
                    >
                      <Input
                        onBlur={handleTrimOnBlur(form, ['user', 'prevEstNo'])}
                        onChange={(e) => {
                          const value = e.target.value
                          // Allow only digits
                          if (/^\d*$/.test(value)) {
                            form.setFieldValue(['user', 'prevEstNo'], value)
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                )} */}

                {/* {!isApprenticeDesignation && Number(watch_monthlyGrossCTC || 0) <= 21000 && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'prevEstNo']}
                      label="ESIC No."
                      rules={[
                        {
                          required: true,
                          message: 'ESIC No. is required when Monthly Gross Salary ≤ 21000',
                        },
                        {
                          pattern: /^\d+$/,
                          message: 'Only integer values are allowed',
                        },
                      ]}
                    >
                      <Input
                        onBlur={handleTrimOnBlur(form, ['user', 'prevEstNo'])}
                        onChange={(e) => {
                          const value = e.target.value
                          if (/^\d*$/.test(value)) {
                            form.setFieldValue(['user', 'prevEstNo'], value)
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                )} */}
                {/* )} */}

                {/* ESIC No. - Only show if NOT Apprentice AND Gross CTC ≤ 21000 */}
                {!isNapsDepartment &&
                  !isNapsDesignation &&
                  Number(watch_monthlyGrossCTC || 0) <= 21000 && (
                    <Col xs={24} sm={12} md={8}>
                      {/* <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'prevEstNo']}
                      label="ESIC No."
                      rules={[
                        {
                          required: true,
                          message: 'ESIC No. is required when Monthly Gross Salary ≤ 21000',
                        },
                        {
                          pattern: /^\d+$/,
                          message: 'Only integer values are allowed',
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter ESIC No."
                        onBlur={handleTrimOnBlur(form, ['user', 'prevEstNo'])}
                        onChange={(e) => {
                          const value = e.target.value
                          if (/^\d*$/.test(value)) {
                            form.setFieldValue(['user', 'prevEstNo'], value)
                          }
                        }}
                      />
                    </Form.Item> */}

                      <Form.Item
                        labelCol={{ span: 24 }}
                        name={['user', 'prevEstNo']}
                        label="ESIC No."
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[
                          {
                            required: true,
                            message: 'ESIC No. is required when Monthly Gross Salary ≤ 21000',
                          },
                          {
                            pattern: /^\d+$/,
                            message: 'Only integer values are allowed',
                          },
                        ]}
                      >
                        <Input
                          placeholder="Enter ESIC No."
                          onBlur={handleTrimOnBlur(form, ['user', 'prevEstNo'])}
                          onChange={(e) => {
                            const value = e.target.value
                            if (/^\d*$/.test(value)) {
                              form.setFieldValue(['user', 'prevEstNo'], value)
                            }
                            // optional: live validate while typing
                            form.validateFields([['user', 'prevEstNo']]).catch(() => {})
                          }}
                        />
                      </Form.Item>
                    </Col>
                  )}

                {pathname.includes('/employee/update') && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'lastWorkingDay']}
                      label="Last Working Day"
                      getValueProps={(value) => ({ value: fmtDate(value) })}
                    >
                      <Input disabled />
                    </Form.Item>
                  </Col>
                )}

                {/* {(pathname.includes('employee/update') ||
                  pathname.includes('employee/add_new')) && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'reportingHeadId']}
                      label="Reporting Manager"
                      rules={[
                        {
                          validator: (_, value) =>
                            value === 'none'
                              ? Promise.reject(new Error('Please select a valid Reporting Manager'))
                              : Promise.resolve(),
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        placeholder="Type employee name or code"
                        value={selectedEmpCode || undefined}
                        onChange={(value) => setSelectedEmpCode(value)}
                        onSearch={handleSearch}
                        filterOption={false}
                        notFoundContent={false}
                      >
                        {!searchLoading ? (
                          Employees?.map((emp, index) => (
                            <Select.Option key={index} value={emp?.employeeId}>
                              {`${emp?.fullName} - ${emp?.ecode}`}
                            </Select.Option>
                          ))
                        ) : (
                          <div style={{ textAlign: 'center' }}>
                            <Spin />
                          </div>
                        )}
                      </Select>
                    </Form.Item>
                  </Col>
                )} */}

                {(pathname.includes('employee/update') ||
                  pathname.includes('employee/add_new')) && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'reportingHeadId']}
                      label="Reporting Manager"
                      rules={[
                        {
                          validator: (_, value) =>
                            value === 'none'
                              ? Promise.reject(new Error('Please select a valid Reporting Manager'))
                              : Promise.resolve(),
                        },
                      ]}
                    >
                      {/* IMPORTANT: no value / onChange with selectedEmpCode here */}
                      <Select
                        showSearch
                        placeholder="Type employee name or code"
                        onSearch={handleSearch}
                        filterOption={false}
                        notFoundContent={searchLoading ? <Spin size="small" /> : null}
                      >
                        {Employees?.map((emp, index) => (
                          <Select.Option key={index} value={emp?.employeeId}>
                            {`${emp?.fullName} - ${emp?.ecode}`}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Personal" key="3">
              <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'maritalStatus']}
                    label="Marital Status"
                    rules={[{ required: true, message: 'Marital status is required' }]}
                  >
                    <Select>
                      <Select.Option value="none">Select</Select.Option>
                      <Select.Option value="married">Married</Select.Option>
                      <Select.Option value="unmarried">Unmarried</Select.Option>
                      <Select.Option value="divorced">Divorced</Select.Option>
                    </Select>
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
                    <Input maxLength={10} onBlur={handleTrimOnBlur(form, ['user', 'mobile'])} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'emailAddress']}
                    label="Email Id"
                    rules={[{ type: 'email', message: 'Enter a valid email', required: true }]}
                  >
                    <Input onBlur={handleTrimOnBlur(form, ['user', 'emailAddress'])} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'beneficiaryAddress']}
                    label="Beneficiary Address"
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
                    <Input onBlur={handleTrimOnBlur(form, ['user', 'nationality'])} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} name={['user', 'religion']} label="Religion">
                    <Input onBlur={handleTrimOnBlur(form, ['user', 'religion'])} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'bankName']}
                    label="Bank Name"
                    rules={[
                      {
                        required: true,
                        message: 'Bank Name is Required',
                      },
                    ]}
                  >
                    <Input onBlur={handleTrimOnBlur(form, ['user', 'bankName'])} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'accountNo']}
                    label="A/c No."
                    rules={[
                      {
                        required: true,
                        pattern: /^\d{9,18}$/,
                        message: 'Account number should be between 9 and 18 digits',
                      },
                    ]}
                  >
                    <Input maxLength={18} onBlur={handleTrimOnBlur(form, ['user', 'accountNo'])} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'bankIfscCode']}
                    label="Bank IFSC Code"
                    rules={[{ required: true, message: 'Bank IFSC is required' }]}
                  >
                    <Input
                      maxLength={11}
                      style={{ textTransform: 'uppercase' }}
                      onBlur={handleTrimOnBlur(form, ['user', 'bankIfscCode'])}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'isRelativeInCompany']}
                    label="Relative in Company"
                    rules={[{ required: true, message: 'Relative Company is Required' }]}
                  >
                    <Select>
                      <Select.Option value={true}>Yes</Select.Option>
                      <Select.Option value={false}>No</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

                {isRelativeInCompany && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'reference']}
                      label="Reference"
                    >
                      <Input onBlur={handleTrimOnBlur(form, ['user', 'reference'])} />
                    </Form.Item>
                  </Col>
                )}

                {pathname !== '/employee/add_new' && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'fingerprintRegistered']}
                      label="Fingerprint Registered"
                      initialValue="false"
                      rules={[
                        {
                          required: true,
                          message: 'Please select fingerprint registration status',
                        },
                      ]}
                    >
                      <Select placeholder="Select Yes or No">
                        <Select.Option value="true">Yes</Select.Option>
                        <Select.Option value="false">No</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                )}
                {showShiftAlignment && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name={['user', 'shiftID']}
                      rules={[{ required: true, message: 'Shift alignment is required' }]}
                      label="Shift Alignment"
                    >
                      <Select placeholder="Select shift">
                        <Select.Option>Select</Select.Option>
                        {shiftList.map((shift) => (
                          <Select.Option key={shift?.shiftID} value={shift?.shiftID}>
                            {shift?.shiftName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                )}
              </Row>

              <Form.Item labelCol={{ span: 24 }} label="Family Member Detail">
                <Table
                  dataSource={familyMemberdataSource}
                  className="custom-table"
                  columns={[
                    {
                      title: (
                        <p>
                          Family Member Name <span style={{ color: 'red' }}></span>
                        </p>
                      ),
                      dataIndex: 'familyMemberName',
                      key: 'familyMemberName',
                      onCell: () => ({ 'data-label': 'Family Member Name' }),
                      render: (text, record) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleFamilyInputChange(record.key, 'familyMemberName', e.target.value)
                          }
                          onBlur={handleTrimOnBlur(form, ['user', 'familyMemberName'])}
                          required
                        />
                      ),
                    },
                    {
                      title: (
                        <p>
                          Relation <span style={{ color: 'red' }}></span>
                        </p>
                      ),
                      dataIndex: 'relation',
                      key: 'relation',
                      onCell: () => ({ 'data-label': 'Action' }),
                      render: (text, record) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleFamilyInputChange(record.key, 'relation', e.target.value)
                          }
                          onBlur={handleTrimOnBlur(form, ['user', 'relation'])}
                        />
                      ),
                    },
                    {
                      title: 'DOB',
                      dataIndex: 'dob',
                      key: 'dob',
                      onCell: () => ({ 'data-label': 'DOB' }),
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
                          disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
                        />
                      ),
                    },
                    {
                      title: 'Action',
                      key: 'action',
                      onCell: () => ({ 'data-label': 'Action' }),
                      render: (_, record) => (
                        <Button danger onClick={() => deleteFamilyRow(record.key)}>
                          <DeleteRowOutlined />
                        </Button>
                      ),
                    },
                  ]}
                  pagination={false}
                  bordered
                />
                <Button type="dashed" onClick={addRowFamilyData} style={{ marginTop: 10 }}>
                  + Add More
                </Button>
              </Form.Item>

              {/* NEW: Last Company References table */}
              {/* <Form.Item labelCol={{ span: 24 }} label="Last Company References">
                <Table
                  dataSource={referenceData}
                  className="custom-table"
                  pagination={false}
                  bordered
                  columns={[
                    {
                      title: 'Reference 1 (Name)',
                      dataIndex: 'reference1LastCompany',
                      key: 'reference1LastCompany',
                      onCell: () => ({ 'data-label': 'Reference 1 (Name)' }),
                      render: (text, record) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleReferenceInputChange(
                              record.key,
                              'reference1LastCompany',
                              e.target.value,
                            )
                          }
                          onBlur={handleTrimOnBlur(form, ['user', 'reference1LastCompany'])}
                        />
                      ),
                    },
                    {
                      title: 'Contact 1',
                      dataIndex: 'contact1LastCompany',
                      key: 'contact1LastCompany',
                      onCell: () => ({ 'data-label': 'Contact 1' }),
                      render: (text, record) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleReferenceInputChange(
                              record.key,
                              'contact1LastCompany',
                              e.target.value,
                            )
                          }
                          onBlur={handleTrimOnBlur(form, ['user', 'contact1LastCompany'])}
                        />
                      ),
                    },
                    {
                      title: 'Reference 2 (Name)',
                      dataIndex: 'reference2LastCompany',
                      key: 'reference2LastCompany',
                      onCell: () => ({ 'data-label': 'Reference 2 (Name)' }),
                      render: (text, record) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleReferenceInputChange(
                              record.key,
                              'reference2LastCompany',
                              e.target.value,
                            )
                          }
                          onBlur={handleTrimOnBlur(form, ['user', 'reference2LastCompany'])}
                        />
                      ),
                    },
                    {
                      title: 'Contact 2',
                      dataIndex: 'contact2LastCompany',
                      key: 'contact2LastCompany',
                      onCell: () => ({ 'data-label': 'Contact 2' }),
                      render: (text, record) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleReferenceInputChange(
                              record.key,
                              'contact2LastCompany',
                              e.target.value,
                            )
                          }
                          onBlur={handleTrimOnBlur(form, ['user', 'contact2LastCompany'])}
                        />
                      ),
                    },
                    {
                      title: 'Action',
                      key: 'action',
                      onCell: () => ({ 'data-label': 'Action' }),
                      render: (_, record) => (
                        <Button danger onClick={() => deleteReferenceRow(record.key)}>
                          <DeleteRowOutlined />
                        </Button>
                      ),
                    },
                  ]}
                />
                <Button type="dashed" onClick={addRowReferenceData} style={{ marginTop: 10 }}>
                  + Add More
                </Button>
              </Form.Item> */}
              <Form.Item labelCol={{ span: 24 }} label="Last Company References">
                <Row gutter={16}>
                  {/* <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name={['user', 'reference1LastCompany']}
                      label="Reference 1 (Name)"
                      labelCol={{ span: 24 }}
                      style={{ marginBottom: 16 }}
                    >
                      <Input
                        onBlur={handleTrimOnBlur(form, ['user', 'reference1LastCompany'])}
                        placeholder="Optional"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name={['user', 'contact1LastCompany']}
                      label="Contact 1"
                      labelCol={{ span: 24 }}
                      style={{ marginBottom: 16 }}
                    >
                      <Input
                        onBlur={handleTrimOnBlur(form, ['user', 'contact1LastCompany'])}
                        placeholder="Optional"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name={['user', 'reference2LastCompany']}
                      label="Reference 2 (Name)"
                      labelCol={{ span: 24 }}
                      style={{ marginBottom: 16 }}
                    >
                      <Input
                        onBlur={handleTrimOnBlur(form, ['user', 'reference2LastCompany'])}
                        placeholder="Optional"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name={['user', 'contact2LastCompany']}
                      label="Contact 2"
                      labelCol={{ span: 24 }}
                      style={{ marginBottom: 16 }}
                    >
                      <Input
                        onBlur={handleTrimOnBlur(form, ['user', 'contact2LastCompany'])}
                        placeholder="Optional"
                      />
                    </Form.Item>
                  </Col> */}
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name={['user', 'reference1LastCompany']}
                      label="Reference 1 (Name)"
                      labelCol={{ span: 24 }}
                      style={{ marginBottom: 16 }}
                    >
                      <Input
                        onBlur={handleTrimOnBlur(form, ['user', 'reference1LastCompany'])}
                        placeholder="Optional"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name={['user', 'contact1LastCompany']}
                      label="Contact 1"
                      labelCol={{ span: 24 }}
                      style={{ marginBottom: 16 }}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const ref1 = getFieldValue(['user', 'reference1LastCompany'])

                            // if reference is filled, contact is mandatory
                            if (ref1 && !value) {
                              return Promise.reject(
                                new Error('Contact 1 is required when Reference 1 is filled'),
                              )
                            }
                            return Promise.resolve()
                          },
                        }),
                      ]}
                    >
                      <Input
                        onBlur={handleTrimOnBlur(form, ['user', 'contact1LastCompany'])}
                        placeholder="Optional"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name={['user', 'reference2LastCompany']}
                      label="Reference 2 (Name)"
                      labelCol={{ span: 24 }}
                      style={{ marginBottom: 16 }}
                    >
                      <Input
                        onBlur={handleTrimOnBlur(form, ['user', 'reference2LastCompany'])}
                        placeholder="Optional"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name={['user', 'contact2LastCompany']}
                      label="Contact 2"
                      labelCol={{ span: 24 }}
                      style={{ marginBottom: 16 }}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const ref2 = getFieldValue(['user', 'reference2LastCompany'])

                            // if reference is filled, contact is mandatory
                            if (ref2 && !value) {
                              return Promise.reject(
                                new Error('Contact 2 is required when Reference 2 is filled'),
                              )
                            }
                            return Promise.resolve()
                          },
                        }),
                      ]}
                    >
                      <Input
                        onBlur={handleTrimOnBlur(form, ['user', 'contact2LastCompany'])}
                        placeholder="Optional"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Experience" key="4">
              <Table
                className="custom-table"
                columns={[
                  {
                    title: 'Company Name',
                    dataIndex: 'nameOfCompany',
                    key: 'nameOfCompany',
                    onCell: () => ({ 'data-label': 'Company Name' }),
                    render: (text, record) => (
                      <Input
                        value={text}
                        onChange={(e) =>
                          handleInputChange(record.key, 'nameOfCompany', e.target.value)
                        }
                        onBlur={handleTrimOnBlur(form, ['user', 'nameOfCompany'])}
                      />
                    ),
                  },
                  {
                    title: 'Work Location',
                    dataIndex: 'workLocation',
                    key: 'workLocation',
                    onCell: () => ({ 'data-label': 'Work Location' }),
                    render: (text, record) => (
                      <Input
                        value={text}
                        onChange={(e) =>
                          handleInputChange(record.key, 'workLocation', e.target.value)
                        }
                        onBlur={handleTrimOnBlur(form, ['user', 'workLocation'])}
                      />
                    ),
                  },
                  {
                    title: 'Position',
                    dataIndex: 'positionHeld',
                    key: 'positionHeld',
                    onCell: () => ({ 'data-label': 'Position' }),
                    render: (text, record) => (
                      <Input
                        value={text}
                        onChange={(e) =>
                          handleInputChange(record.key, 'positionHeld', e.target.value)
                        }
                        onBlur={handleTrimOnBlur(form, ['user', 'positionHeld'])}
                      />
                    ),
                  },
                  {
                    title: 'From',
                    dataIndex: 'from',
                    key: 'from',
                    onCell: () => ({ 'data-label': 'From' }),
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
                        disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
                      />
                    ),
                  },
                  {
                    title: 'To',
                    dataIndex: 'to',
                    key: 'to',
                    onCell: () => ({ 'data-label': 'To' }),
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
                        disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
                      />
                    ),
                  },
                  {
                    title: 'Last CTC',
                    dataIndex: 'lastCtc',
                    key: 'lastCtc',
                    onCell: () => ({ 'data-label': 'Last CTC' }),
                    render: (text, record) => (
                      <InputNumber
                        value={text}
                        onChange={(value) => handleInputChange(record.key, 'lastCtc', value)}
                        onBlur={handleTrimOnBlur(form, ['user', 'lastCtc'])}
                      />
                    ),
                  },
                  {
                    title: 'Action',
                    key: 'action',
                    onCell: () => ({ 'data-label': 'Action' }),
                    render: (_, record) => (
                      <Button danger onClick={() => deleteExperienceRow(record.key)}>
                        <DeleteRowOutlined />
                      </Button>
                    ),
                  },
                ]}
                dataSource={experienceData}
                pagination={false}
                bordered
              />
              <Button type="dashed" onClick={addRowExperienceData} style={{ marginTop: 10 }}>
                + Add More
              </Button>
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
                    render: (_, record) => (
                      <Select
                        style={{ width: '100%' }}
                        value={record.education}
                        onChange={(value) => handleChange('education', value, record)}
                      >
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
                    ),
                  },
                  {
                    title: 'Year of Passing',
                    dataIndex: 'yop',
                    key: 'yop',
                    onCell: () => ({ 'data-label': 'Year of Passing' }),
                    render: (_, record) => (
                      <DatePicker
                        picker="year"
                        style={{ width: '100%' }}
                        value={record.yop ? dayjs(record.yop, 'YYYY') : null}
                        onChange={(date) =>
                          handleChange('yop', date ? date.format('YYYY') : null, record)
                        }
                        disabledDate={(current) => current && current > dayjs()}
                      />
                    ),
                  },
                  {
                    title: 'Grade',
                    dataIndex: 'grade',
                    key: 'grade',
                    onCell: () => ({ 'data-label': 'Grade' }),
                    render: (_, record) => (
                      <Input
                        style={{ width: '100%' }}
                        value={record.grade}
                        onChange={(e) => handleChange('grade', e.target.value, record)}
                        onBlur={handleTrimOnBlur(form, ['user', 'grade'])}
                      />
                    ),
                  },
                  {
                    title: 'Type',
                    dataIndex: 'type',
                    key: 'type',
                    onCell: () => ({ 'data-label': 'Type' }),
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
                  {
                    title: 'Action',
                    key: 'action',
                    render: (_, record) => (
                      <Button danger onClick={() => deleteQualificationRow(record.key)}>
                        <DeleteRowOutlined />
                      </Button>
                    ),
                  },
                ]}
                dataSource={qualificationData}
                pagination={false}
                bordered
              />
              <Button type="dashed" onClick={addRowQualificationData} style={{ marginTop: 10 }}>
                + Add More
              </Button>
            </Tabs.TabPane>

            {actionMap?.Location_Assignment && (
              <Tabs.TabPane
                tab="Location Assignment"
                key="6"
                className={theme === 'dark' ? 'dark-theme' : ''}
              >
                <Card className="abcde">
                  <p>
                    <strong>Base Location:</strong>{' '}
                    {getLocationNameById(form.getFieldValue(['user', 'location']))}
                  </p>
                  <Divider />

                  <Radio.Group
                    value={transferType}
                    onChange={(e) => {
                      const value = e.target.value
                      setTransferType(value)
                      if (value === 'permanent') {
                        setassignedReason('Permanent Transfer')
                      } else {
                        setassignedReason(null)
                      }
                    }}
                    style={{ marginBottom: '16px' }}
                  >
                    <Radio value="temporary">Temporary Transfer</Radio>
                    {/* <Radio value="permanent">Permanent Transfer</Radio> */}
                  </Radio.Group>

                  {transferType === 'temporary' && (
                    <Row gutter={[4, 0]}>
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item
                          label="Location"
                          rules={[
                            {
                              required: transferType !== '' ? true : false,
                              message: transferType !== '' ? 'Location is required' : '',
                            },
                          ]}
                        >
                          <Select
                            placeholder="Select Location"
                            showSearch
                            optionFilterProp="children"
                            value={assignedLocation}
                            onChange={(value) => setassignedLocation(value)}
                            style={{ width: '100%' }}
                            tabIndex={25}
                            className={theme === 'dark' ? 'dark-theme' : ''}
                          >
                            <Select.Option value={null}>Select Location</Select.Option>
                            {locations.map((loc) => (
                              <Select.Option value={loc.locationId} key={loc.locationId}>
                                {loc.locationName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12} md={6}>
                        <Form.Item label="Department">
                          <Select
                            placeholder="Select Department"
                            showSearch
                            optionFilterProp="children"
                            value={assignedDepartment}
                            onChange={(value) => setAssignmentDepartment(value)}
                            style={{ width: '100%' }}
                            tabIndex={25}
                            className={theme === 'dark' ? 'dark-theme' : ''}
                          >
                            <Select.Option value={null}>Select Department</Select.Option>
                            {departments.map((dep) => (
                              <Select.Option value={dep.departmentId} key={dep.departmentId}>
                                {dep.departmentName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12} md={6}>
                        <Form.Item label="Designation">
                          <Select
                            placeholder="Select Designation"
                            showSearch
                            optionFilterProp="children"
                            value={assignedDesignation}
                            onChange={(value) => setAssignedDesignation(value)}
                            style={{ width: '100%' }}
                            tabIndex={25}
                            className={theme === 'dark' ? 'dark-theme' : ''}
                          >
                            <Select.Option value={null}>Select Department</Select.Option>
                            {designations.map((des) => (
                              <Select.Option value={des?.designationId} key={des?.designationId}>
                                {des?.designationName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>

                      {transferType === 'temporary' && (
                        <Col xs={24} sm={12} md={6}>
                          <Form.Item label="Select Date">
                            <RangePicker
                              style={{ width: '100%' }}
                              value={
                                assignedOnDate && releasedOnDate
                                  ? [dayjs(assignedOnDate || null), dayjs(releasedOnDate || null)]
                                  : [null, null]
                              }
                              onChange={(dates) => {
                                if (dates) {
                                  setassignedOnDate(dates[0])
                                  setreleasedOnDate(dates[1])
                                } else {
                                  setassignedOnDate(null)
                                  setreleasedOnDate(null)
                                }
                              }}
                            />
                          </Form.Item>
                        </Col>
                      )}

                      {transferType === 'permanent' && (
                        <Col xs={24} sm={12} md={6}>
                          <Form.Item label="Start Date">
                            <DatePicker
                              placeholder="Select Start Date"
                              style={{ width: '100%' }}
                              value={assignedOnDate ? dayjs(assignedOnDate) : null}
                              onChange={(date) => {
                                setassignedOnDate(date)
                                setreleasedOnDate(null)
                              }}
                            />
                          </Form.Item>
                        </Col>
                      )}

                      {transferType === 'temporary' && (
                        <Col xs={24} sm={12} md={6}>
                          <Form.Item label="Reason">
                            <Select
                              placeholder="Choose Reason"
                              value={assignedReason}
                              onChange={(value) => setassignedReason(value)}
                              style={{ width: '100%' }}
                            >
                              <Select.Option value="reliever">Reliever</Select.Option>
                              <Select.Option value="training">Training</Select.Option>
                              <Select.Option value="traning-reliever">
                                Training Reliever
                              </Select.Option>
                              <Select.Option value="support/commando">
                                Support/Commando
                              </Select.Option>
                              <Select.Option value="review">Review</Select.Option>
                              <Select.Option value="visit">Visit</Select.Option>
                              <Select.Option value="temporary transfer">
                                Temporary Transfer
                              </Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      )}
                    </Row>
                  )}

                  <Divider />
                  <Table
                    columns={columns}
                    dataSource={assignments}
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: 'max-content', y: 'calc(100vh - 160px)' }}
                    bordered
                  />
                </Card>
              </Tabs.TabPane>
            )}

            {/* {actionMap?.Salary_Slip && (
              <Tabs.TabPane
                tab="Salary Slip"
                key="7"
                className={theme === 'dark' ? 'dark-theme' : ''}
              >
                <SalarySlips emp_pro={true} ecodes={selectedEmpCode} />
              </Tabs.TabPane>



            )} */}

            {/* {actionMap?.Salary_Slip && (
  <Tabs.TabPane
    tab="Salary Slip"
    key="7"
    className={theme === 'dark' ? 'dark-theme' : ''}
  >
    {/* selectedEmpCode is the EMPLOYEE empCode from API */}
            {/* <SalarySlips emp_pro={true} ecodes={selectedEmpCode} />
  </Tabs.TabPane>
)} */}

            {actionMap?.Salary_Slip && (
              <Tabs.TabPane
                tab="Salary Slip"
                key="7"
                className={theme === 'dark' ? 'dark-theme' : ''}
              >
                {/* Force SalarySlips to use the passed emp code, not logged-in user */}
                <SalarySlips
                  emp_pro={false} // 🔴 changed from true → false
                  ecodes={selectedEmpCode}
                  empCodeReadOnly={true}
                  hideEmployeeSelect={true}
                  key={selectedEmpCode || 'no-ecode'} // 🔁 force remount when employee changes
                />
              </Tabs.TabPane>
            )}

            <Tabs.TabPane
              tab="Medical Card"
              key="8"
              className={theme === 'dark' ? 'dark-theme' : ''}
            >
              <MedicalCardAdmin ecodeProp={selectedEmpCode} key={selectedEmpCode || 'no-ecode'} />
            </Tabs.TabPane>
          </Tabs>
          <Row justify="end" style={{ marginTop: 20, gap: '0.6rem' }}>
            {pathname.includes('/employee/update') && (
              <>
                <Row style={{ gap: 5 }}>
                  {activeTab > 1 && (
                    <Button type="primary" onClick={handleBack} disabled={activeTab === 0}>
                      Back
                    </Button>
                  )}
                  {activeTab < 6 && (
                    <Button
                      type="primary"
                      onClick={handleNext}
                      disabled={(activeTab == 2 && isMinwageLoading) || activeTab === totalTabs - 1}
                    >
                      Next
                    </Button>
                  )}
                  {activeTab === '6' && (
                    <Button type="primary" htmlType="submit">
                      {params.id ? 'Update' : 'Submit'}
                    </Button>
                  )}
                </Row>
              </>
            )}
            {pathname.includes('/employee/add_new') && (
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
                </Row>
              </>
            )}
            {pathname.includes('/candidate-form') && (
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
                </Row>
              </>
            )}
          </Row>
        </Form>
      </Card>
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
      <AcceptOfferModal
        visible={visible}
        offerDetails={offerDetails}
        onAccept={handleAccept}
        onCancel={() => setVisible(false)}
      />
      <Modal
        open={videoPreviewOpen}
        title="Video Preview"
        footer={null}
        onCancel={() => {
          if (videoPreviewSrc && videoPreviewSrc.startsWith('blob:')) {
            URL.revokeObjectURL(videoPreviewSrc)
          }
          setVideoPreviewOpen(false)
          setVideoPreviewSrc('')
        }}
        width={800}
      >
        {videoPreviewSrc ? (
          <video
            controls
            style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
            src={videoPreviewSrc}
          >
            Your browser does not support the video tag.
          </video>
        ) : null}
      </Modal>
    </>
  )
}

export default EmployeeProfile
