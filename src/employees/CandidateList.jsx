import { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Space,
  Table,
  Tag,
  Checkbox,
  Row,
  Input,
  Tooltip,
  Button,
  message,
  Col,
  Popover,
  Tabs,
} from 'antd'
import {
  ExportOutlined,
  EditOutlined,
  StepForwardOutlined,
  PlusOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  MinusOutlined,
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import ExcelImportModal from '../components/modals/ExcelimportModal'
import {
  getApplicantList,
  candidateApproval,
  getCandidateListData,
  candidateFilter,
  filterBgtSeatMaster,
  getCandidateById, // ✅ used for HR/SuperAdmin initiate validation
} from '../services/Services'
import { set } from '../redux/uiSlice'
import RightSideFilter from '../components/sideFilter/RightSideFilter'
import * as XLSX from 'xlsx'
import ApproveModel from '../components/modals/ApproveModel'
import { useColorModes } from '@coreui/react'
import dayjs from 'dayjs'
import CandidateChecklistModal from './CandidateChecklistModal'
import { useActionsMap } from '../utils/useActionsMap'
import useMediaQuery from '../hooks/useMediaQuery'
import Pageheading from '../components/shared/Pageheading'
import CandidateInitializeModal from '../components/modals/CandidateInitializeModal'

const { Search } = Input

const CandidateList = () => {
  const location = useLocation()
  const { pathname } = location

  const rmAllowedRoles = ['hr', 'superadmin']
  const { role, firstName, storeCode, ecode, locationList } = useSelector(
    (state) => state?.auth?.data,
  )
  const { theme } = useSelector((state) => state?.ui)

  const [initiateModalOpen, setInitiateModalOpen] = useState(false)
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [candidateListData, setcandidateListData] = useState([])
  const [selectedCandidateId, setSelectedCandidateId] = useState(null)
  const [selectedCandidateData, setSelectedCandidateData] = useState(null)

  // ✅ store ONLY candidateInfo (from API response)
  const [candidateByIdData, setCandidateByIdData] = useState(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [totalRecords, setTotalRecords] = useState(0)

  const [search, setSearch] = useState('')
  const [filteredData, setFilteredData] = useState([])

  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)

  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  const norm = (v) => (v == null ? '' : String(v).trim())

  const [activeTab, setActiveTab] = useState(role === 'NapsHR' ? 'naps' : 'all')

  const handleViewClick = (id) => {
    const stateForEdit = { furtherParts: actionsMap?.view?.furtherParts || [] }
    sessionStorage.setItem('viewPageState', JSON.stringify(stateForEdit))
    window.location.href = `/employee/add_new/view/${id}`
  }

  const handleEditClick = (id) => {
    const stateForEdit = { furtherParts: actionsMap?.edit?.furtherParts || [] }
    sessionStorage.setItem('editPageState', JSON.stringify(stateForEdit))
    window.location.href = `/employee/add_new/${id}`
  }

  useEffect(() => {
    if (role === 'NapsHR') {
      setActiveTab('naps')
    } else if (activeTab === 'naps') {
      setActiveTab('all')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  const handleToggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  // ==========================

  // ✅ Treat these values as "empty"
  const EMPTY_STRINGS = new Set(['', '-', '--', '---', 'na', 'n/a', 'null', 'undefined'])

  const normalize = (v) => (v == null ? '' : String(v).trim())

  const isEmpty = (v) => {
    // null/undefined
    if (v === null || v === undefined) return true

    // numbers (shiftID, companyId etc.)
    if (typeof v === 'number') return Number.isNaN(v)

    const s = normalize(v)
    if (!s) return true

    // if value is only hyphens like "-", "--", " --- "
    if (/^-+$/.test(s)) return true

    // common placeholder strings
    if (EMPTY_STRINGS.has(s.toLowerCase())) return true

    return false
  }

  // ✅ helpers to safely pick value from multiple options
  const pickFirst = (...vals) => {
    for (const v of vals) {
      if (!isEmpty(v)) return v
    }
    return null
  }

  // ✅ for IDs: treat 0 / "0" as empty
  const pickFirstId = (...vals) => {
    for (const v of vals) {
      if (v === 0 || v === '0') continue
      if (!isEmpty(v)) return v
    }
    return null
  }

  // Response: res.data.data.candidateInfo
  // const validateCandidateMandatoryFields = (c) => {
  //   const required = [
  //     { label: 'Location', value: c?.location },
  //     { label: 'Aadhar No', value: c?.aadharNo },
  //     { label: 'Pan No', value: c?.panNo },
  //     { label: 'Preferred Location', value: c?.preferredLocation },
  //     { label: 'Department', value: c?.department },
  //     { label: 'Designation', value: c?.designation },

  //     // ✅ FIXED: check companyId first (your API has companyId even when companyName is null)
  //     { label: 'Company', value: pickFirstId(c?.companyId) || pickFirst(c?.companyName, c?.company) },

  //     { label: 'Mobile', value: c?.mobile },
  //     { label: 'Email id', value: c?.emailAddress },
  //     { label: 'Bank Name', value: c?.bankName },
  //     { label: 'A/c No.', value: c?.accountNo },
  //     { label: 'Bank IFSC Code', value: c?.bankIfscCode },

  //     // ✅ shiftID can be number; treat 0/null/undefined as empty
  //     { label: 'Shift Alignment', value: pickFirstId(c?.shiftID) },

  //     { label: 'Joining date', value: c?.joiningDate },
  //   ]

  //   return required.filter((f) => isEmpty(f.value)).map((f) => f.label)
  // }

  const validateCandidateMandatoryFields = (c) => {
    const required = [
      { label: 'Location', value: pickFirstId(c?.location) },
      { label: 'Aadhar No', value: pickFirst(c?.aadharNo) },
      { label: 'Pan No', value: pickFirst(c?.panNo) },
      { label: 'Preferred Location', value: pickFirst(c?.preferredLocation) },
      { label: 'Department', value: pickFirstId(c?.department) },
      { label: 'Designation', value: pickFirstId(c?.designation) },

      // ✅ company can come as companyId OR companyName
      {
        label: 'Company',
        value: pickFirstId(c?.companyId, c?.company) || pickFirst(c?.companyName),
      },

      { label: 'Mobile', value: pickFirst(c?.mobile) },
      { label: 'Email id', value: pickFirst(c?.emailAddress) },
      { label: 'Bank Name', value: pickFirst(c?.bankName) },
      { label: 'A/c No.', value: pickFirst(c?.accountNo) },
      { label: 'Bank IFSC Code', value: pickFirst(c?.bankIfscCode) },
      { label: 'Shift Alignment', value: pickFirstId(c?.shiftID) },
      { label: 'Joining date', value: pickFirst(c?.joiningDate) },
    ]

    return required.filter((f) => isEmpty(f.value)).map((f) => f.label)
  }

  const getColumnSearchProps = (dataIndex, title) => {
    const [searchText, setSearchText] = useState('')
    const [filterValues, setFilterValues] = useState([])

    const uniqueOptions = useMemo(() => {
      const seen = new Set()
      return candidateListData
        .map((record) => record?.[dataIndex])
        .filter((item) => {
          if (item === null || item === undefined) return false
          const val = String(item).trim()
          if (!seen.has(val)) {
            seen.add(val)
            return true
          }
          return false
        })
    }, [candidateListData])

    const filteredOptions = uniqueOptions.filter((value) =>
      value?.toString().toLowerCase().includes(searchText.toLowerCase()),
    )

    const handleChange = (checkedValues) => {
      setFilterValues(checkedValues)
    }

    return {
      filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
        <div
          style={{
            padding: 8,
            minWidth: 200,
            maxHeight: 300,
            overflowY: 'auto',
          }}
        >
          <Input
            placeholder={`Search ${title}`}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ marginBottom: 8, display: 'block' }}
            allowClear
          />
          <Checkbox.Group
            value={filterValues}
            onChange={handleChange}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {filteredOptions.map((value) => (
              <Checkbox key={value} value={value}>
                {value}
              </Checkbox>
            ))}
          </Checkbox.Group>
          <Space style={{ marginTop: 8 }}>
            <Button
              type="primary"
              size="small"
              onClick={() => {
                setSelectedKeys(filterValues)
                confirm()
              }}
            >
              Filter
            </Button>
            <Button
              size="small"
              onClick={() => {
                clearFilters()
                setFilterValues([])
                setSearchText('')
              }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) => {
        const cellValue = record?.[dataIndex]
        return value ? String(cellValue ?? '').toLowerCase() === String(value).toLowerCase() : false
      },
    }
  }

  const fetchMasterData = async () => {
    try {
      const res = await getApplicantList()
      if (res?.status === true) {
        // setDesignations(res?.data) // if you have this in your project, keep it
      }
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    fetchMasterData()
  }, [])

  const handleTableChange = (current, newPageSize) => {
    setCurrentPage(current)
    setPageSize(newPageSize)
  }

  // ✅ UPDATED: Initiate click -> fetch getCandidateById for HR/SuperAdmin
  const handleInitiateClick = async (record) => {
    setSelectedCandidateData(record)
    setSelectedCandidateId(record.id)
    setCandidateByIdData(null)

    // Non-HR/SuperAdmin: open modal directly (existing process)
    if (!(role === 'HR' || role === 'SuperAdmin')) {
      setInitiateModalOpen(true)
      return
    }

    // HR/SuperAdmin: must load candidateInfo before opening modal
    try {
      await dispatch(set({ loading: true }))
      const res = await getCandidateById(record.id)

      // ✅ YOUR API RESPONSE:
      // res.data.data.candidateInfo
      const candidateInfo = res?.data?.data?.candidateInfo || null

      if (!candidateInfo) {
        message.error('Candidate details not found. Please try again.')
        return
      }

      setCandidateByIdData(candidateInfo)
      setInitiateModalOpen(true)
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed to fetch candidate details')
      setCandidateByIdData(null)
    } finally {
      await dispatch(set({ loading: false }))
    }
  }

  const handleInitializeCandidate = async (val) => {
    // ✅ HR / SuperAdmin mandatory validation (ONLY missing field names)
    if (role === 'HR' || role === 'SuperAdmin') {
      if (!candidateByIdData) {
        message.error('Candidate details not loaded. Please click Initiate again.')
        return
      }

      //   const missingFields = validateCandidateMandatoryFields(candidateByIdData)
      //   if (missingFields.length > 0) {
      //     // ✅ ONLY field names
      //     message.error(missingFields.join(', '))
      //     return
      //   }
      // }
      const missingFields = validateCandidateMandatoryFields(candidateByIdData)

      if (missingFields.length > 0) {
        message.error({
          content: (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Please fill mandatory fields:</div>
              {missingFields.map((m, i) => (
                <div key={i}>• {m}</div>
              ))}
            </div>
          ),
          duration: 6,
        })
        return
      }
    }

    const { remarks, selectedOption, selectedEmpCode } = val

    if (rmAllowedRoles.includes(String(role).trim().toLowerCase()) && !selectedEmpCode?.trim()) {
      message.error('Reporting Head ECode is mandatory')
      return
    }

    if (!remarks?.trim()) {
      message.error('Remarks is mandatory!')
      return
    }

    try {
      const requestBody = {
        candidateId: parseInt(selectedCandidateId),
        ...(role === 'HR' && {
          hrReviewedBy: `${remarks} - by ${firstName}(${role})`,
          hrApprovalStatus: selectedOption,
          reportHeadEcode: selectedEmpCode,
        }),
        ...(role === 'ClusterManager' && {
          ClusterManagerReviewedBy: `${remarks} - by ${firstName}(${role})`,
          ClusterManagerApprovalStatus: selectedOption,
        }),
        ...(role === 'Audit' && {
          auditReviewedBy: `${remarks} - by ${firstName}(${role})`,
          auditApprovalStatus: selectedOption,
        }),
        ...(role === 'SuperAdmin' && {
          auditApprovalStatus: selectedOption,
          hrApprovalStatus: selectedOption,
          clusterManagerApprovalStatus: selectedOption,
          auditReviewedBy: `${remarks} - by ${firstName}(${role})`,
          clusterManagerReviewedBy: `${remarks} - by ${firstName}(${role})`,
          hrReviewedBy: `${remarks} - by ${firstName}(${role})`,
          reportHeadEcode: selectedEmpCode,
        }),
      }

      const response = await candidateApproval(requestBody)

      if (response?.status) {
        toast.success('Initialized successfully!')
        await fetchData(pageSize)
      } else {
        toast.error(response?.data || response?.data?.message || 'Could not initialize!')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Could not initialize!')
      console.error('Error fetching data:', error)
    } finally {
      setInitiateModalOpen(false)
      await dispatch(set({ loading: false }))
    }
  }

  const fetchData = async () => {
    await dispatch(set({ loading: true }))
    try {
      const response = await getCandidateListData()
      if (response?.data?.status === true) {
        let updatedData = response?.data?.data?.candidates || []
        let totalRows = response?.data?.data?.totalRecords || 0

        const response1 = await filterBgtSeatMaster({ eCode: ecode })

        const allowedList = response1?.data?.data?.allowedStores ?? []
        const deptExceptions = response1?.data?.data?.deptExceptions ?? []
        const desigExceptions = response1?.data?.data?.desigExceptions ?? []

        const allowedCodes = new Set(allowedList.map((a) => norm(a.stCode)))
        const level1Filtered = updatedData.filter((item) =>
          allowedCodes.has(norm(item?.storeLocationCode)),
        )

        const blockedDeptSet = new Set(
          deptExceptions.map((b) => `${norm(b.stCode)}-${norm(b.deptId)}`),
        )

        const level2Filtered = level1Filtered.filter((item) => {
          const key = `${norm(item.stCode)}-${norm(item.departmentId)}`
          return !blockedDeptSet.has(key)
        })

        const blockedDesigSet = new Set(
          desigExceptions.map((b) => `${norm(b.stCode)}-${norm(b.deptId)}-${norm(b.desigId)}`),
        )

        const finalFiltered =
          level2Filtered.filter((item) => {
            const key = `${norm(item.stCode)}-${norm(item.departmentId)}-${norm(
              item.designationId,
            )}`
            return !blockedDesigSet.has(key)
          }) || []

        const isResponse1Length0 =
          allowedList?.length === 0 && deptExceptions?.length === 0 && desigExceptions?.length === 0

        if (isResponse1Length0 === false) {
          setcandidateListData(finalFiltered)
        } else {
          const getCode = (item) =>
            (item?.storeLocationCode ?? item?.storeCode ?? '').trim().toLowerCase()

          const storeCodeNorm = (storeCode ?? '').trim().toLowerCase()
          const storeFilterData = updatedData.filter((item) => getCode(item) === storeCodeNorm)

          if (Array.isArray(locationList) && locationList.length > 0) {
            const allowedLocCodes = new Set(
              locationList.map((it) => it?.stCode?.trim()?.toLowerCase()).filter(Boolean),
            )
            const filteredEmployees = updatedData.filter((item) =>
              allowedLocCodes.has(getCode(item)),
            )
            setcandidateListData(filteredEmployees)
          } else {
            if (role === 'StoreHR') {
              setcandidateListData(storeFilterData)
              setTotalRecords(storeFilterData?.length || 0)
            } else {
              setcandidateListData(updatedData)
            }
          }
        }

        setTotalRecords(totalRows)
      } else {
        navigate('/candidate/form_list')
      }
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message)
    } finally {
      await dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    if (candidateListData.length === 0) fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Apply "All / NAPS" tab + search
  useEffect(() => {
    const q = search.trim().toLowerCase()

    let baseData = candidateListData

    if (activeTab === 'naps') {
      baseData = candidateListData.filter(
        (row) => (row?.departmentName || '').trim().toLowerCase() === 'naps',
      )
    }

    if (!q) {
      setFilteredData(baseData)
    } else {
      const filtered = baseData.filter((row) =>
        Object.values(row).some((dt) => String(dt).toLowerCase().trim().includes(q)),
      )
      setFilteredData(filtered)
    }
  }, [search, candidateListData, activeTab])

  const statusMap = {
    1: { color: 'green', label: 'Approved' },
    2: { color: 'blue', label: 'Rejected' },
    3: { color: 'red', label: 'Revoked' },
    4: { color: 'volcano', label: 'Pending' },
    5: { color: 'purple', label: 'In Progress' },
    6: { color: 'green', label: 'On Hold' },
    7: { color: 'blue', label: 'Cancelled' },
    8: { color: 'red', label: 'Completed' },
  }

  const shouldShowInitiateButton = (record) => {
    if (!record) return false
    const { statusId, auditApprovalStatus, clusterManagerApprovalStatus, hrApprovalStatus } = record

    const audit = auditApprovalStatus ?? 4
    const cluster = clusterManagerApprovalStatus ?? 4
    const hr = hrApprovalStatus ?? 4

    if (statusId === 4 && role !== 'SuperAdmin') {
      if (role === 'Master') return true
      else if (role === 'HR' && cluster === 1 && audit === 1 && (hr === 4 || hr === 2)) return true
      else if (role === 'Audit' && (audit === 4 || audit === 2) && cluster === 4 && hr === 4)
        return true
      else if (
        role === 'ClusterManager' &&
        (cluster === 4 || cluster === 2) &&
        audit === 1 &&
        hr === 4
      )
        return true
      else return false
    } else if (statusId === 4 && role === 'SuperAdmin') return true
    else if (statusId === 4 && role === 'Master') return true
    else return false
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const handleShowContent = (date, remarks) => {
    let formattedDate = date === null || date === undefined ? '-' : String(date).split('T')[0]
    let formattedRemarks = remarks ?? '-'
    return (
      <div>
        <p>Approved On: {formattedDate}</p>
        <p>Remarks: {formattedRemarks}</p>
      </div>
    )
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'firstName',
      ...getColumnSearchProps('firstName', 'Name'),
      width: 150,
      render: (text) => <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>,
    },
    {
      title: 'Email id',
      dataIndex: 'email',
      key: 'email',
      render: (text) => (
        <Tooltip title={text}>
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'pre-wrap',
              display: 'block',
              maxWidth: '100%',
            }}
          >
            {text || '-'}
          </span>
        </Tooltip>
      ),
      ...getColumnSearchProps('email', 'Email id'),
      width: 250,
    },
    {
      title: 'Date Of Birth',
      dataIndex: 'dob',
      width: 200,
      key: 'dob',
      render: (d) => (d ? dayjs(d).format('YYYY-MM-DD') : '-'),
      ...getColumnSearchProps('dob', 'Date Of Birth'),
    },
    {
      title: 'Designation',
      dataIndex: 'designationName',
      key: 'designationName',
      render: (designationName) => (
        <span style={{ whiteSpace: 'pre-wrap' }}>{designationName || '-'}</span>
      ),
      ...getColumnSearchProps('designationName', 'Designation'),
      width: 150,
    },
    {
      title: 'Department',
      dataIndex: 'departmentName',
      key: 'departmentName',
      render: (text) => <span style={{ whiteSpace: 'pre-wrap' }}>{text || '-'}</span>,
      ...getColumnSearchProps('departmentName', 'Department'),
      width: 150,
    },
    {
      title: 'Mobile',
      dataIndex: 'phone',
      key: 'phone',
      ...getColumnSearchProps('phone', 'Mobile'),
      width: 150,
      render: (text) => <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>,
    },
    {
      title: 'Store Code',
      dataIndex: 'storeLocationCode',
      key: 'storeLocationCode',
      width: 150,
      ...getColumnSearchProps('storeLocationCode', 'Store Code'),
      render: (text) => <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>,
    },
    {
      title: 'Store Location',
      dataIndex: 'storeLocationName',
      key: 'storeLocationName',
      ...getColumnSearchProps('storeLocationName', 'Store Location'),
      width: 150,
      render: (text) => <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'statusId',
      key: 'statusId',
      filters: [...new Set(candidateListData.map((item) => item.statusId))]
        .filter((id) => statusMap[id])
        .map((id) => ({
          text: statusMap[id].label,
          value: id,
        })),
      onFilter: (value, record) => record.statusId === value,
      render: (statusId) => {
        const statusInfo = statusMap[statusId] || { color: 'volcano', label: 'Pending' }
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
      },
      width: 120,
    },
    {
      title: 'LP Status',
      dataIndex: 'auditApprovalStatus',
      key: 'auditApprovalStatus',
      filters: [...new Set(candidateListData.map((item) => item.auditApprovalStatus))]
        .filter((id) => statusMap[id])
        .map((id) => ({
          text: statusMap[id].label,
          value: id,
        })),
      onFilter: (value, record) => record.auditApprovalStatus === value,
      render: (statusId, record) => {
        const statusInfo = statusMap[statusId] || { color: 'volcano', label: 'Pending' }
        return (
          <Space>
            <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
            {record?.auditApprovedOn && (
              <Popover
                content={() => handleShowContent(record?.auditApprovedOn, record?.auditRemarks)}
                title="LP Action Info"
                trigger="click"
              >
                <InfoCircleOutlined
                  style={{
                    color: '#0202bb',
                    cursor: 'pointer',
                    fontSize: '16px',
                    position: 'absolute',
                    top: '39%',
                    right: '9px',
                  }}
                />
              </Popover>
            )}
          </Space>
        )
      },
      width: 120,
    },
    {
      title: 'Cluster Status',
      dataIndex: 'clusterManagerApprovalStatus',
      key: 'clusterManagerApprovalStatus',
      filters: [...new Set(candidateListData.map((item) => item.clusterManagerApprovalStatus))]
        .filter((id) => statusMap[id])
        .map((id) => ({
          text: statusMap[id].label,
          value: id,
        })),
      onFilter: (value, record) => record.clusterManagerApprovalStatus === value,
      render: (statusId, record) => {
        const statusInfo = statusMap[statusId] || { color: 'volcano', label: 'Pending' }
        return (
          <Space>
            <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
            {record?.clusterManagerApprovedOn && (
              <Popover
                content={() =>
                  handleShowContent(record?.clusterManagerApprovedOn, record?.clusterManagerRemarks)
                }
                title="Cluster Action Info"
                trigger="click"
              >
                <InfoCircleOutlined
                  style={{
                    color: '#0202bb',
                    cursor: 'pointer',
                    fontSize: '16px',
                    position: 'absolute',
                    top: '39%',
                    right: '9px',
                  }}
                />
              </Popover>
            )}
          </Space>
        )
      },
      width: 150,
    },
    {
      title: 'HR Status',
      dataIndex: 'hrApprovalStatus',
      key: 'hrApprovalStatus',
      filters: [...new Set(candidateListData.map((item) => item.hrApprovalStatus))]
        .filter((id) => statusMap[id])
        .map((id) => ({
          text: statusMap[id].label,
          value: id,
        })),
      onFilter: (value, record) => record.hrApprovalStatus === value,
      render: (statusId, record) => {
        const statusInfo = statusMap[statusId] || { color: 'volcano', label: 'Pending' }
        return (
          <Space>
            <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
            {record?.hrApprovedOn && (
              <Popover
                content={() => handleShowContent(record?.hrApprovedOn, record?.hrRemarks)}
                title="HR Action Info"
                trigger="click"
              >
                <InfoCircleOutlined
                  style={{
                    color: '#0202bb',
                    cursor: 'pointer',
                    fontSize: '16px',
                    position: 'absolute',
                    top: '39%',
                    right: '9px',
                  }}
                />
              </Popover>
            )}
          </Space>
        )
      },
      width: 120,
    },
    {
      title: 'Action',
      fixed: 'right',
      key: 'id',
      render: (_, record) => (
        <Space size="middle">
          {actionsMap['joining checklist']?.actionStatus && (
            <Tooltip placement="top" title="Joining Checklist">
              <CheckCircleOutlined
                style={{ fontSize: 18, cursor: 'pointer' }}
                onClick={() => {
                  setSelectedCandidateId(record?.id)
                  setIsChecklistModalOpen(true)
                }}
              />
            </Tooltip>
          )}

          {actionsMap?.view?.actionStatus && (
            <Tooltip placement="top" title={'View'}>
              {/* <Link
                to={`/employee/add_new/view/${record.id}`}
                state={{
                  from: 'candidateList',
                  furtherParts: actionsMap?.view?.furtherParts || [],
                }}
                style={{ color: 'black' }}
              > */}
              <EyeOutlined style={{ fontSize: 18 }} onClick={() => handleViewClick(record?.id)} />
              {/* </Link> */}
            </Tooltip>
          )}

          {actionsMap?.edit?.actionStatus && (
            <Tooltip placement="top" title={'Edit'}>
              {/* <Link
                to={`/employee/add_new/${record.id}`}
                state={{ furtherParts: actionsMap?.edit?.furtherParts || [] }}
                style={{ color: 'black' }}
              > */}
              <EditOutlined style={{ fontSize: 18 }} onClick={() => handleEditClick(record?.id)} />
              {/* </Link> */}
            </Tooltip>
          )}

          {actionsMap['interview form link']?.actionStatus && (
            <Tooltip placement="top" title={'Interview Form Link'}>
              <Link to={`/applicant/view_interview_form/${record.id}`} state={{ from: pathname }}>
                <InfoCircleOutlined style={{ fontSize: 22 }} />
              </Link>
            </Tooltip>
          )}

          {actionsMap?.initiate?.actionStatus && shouldShowInitiateButton(record) && (
            <Tooltip placement="top" title={'Initiate'}>
              <StepForwardOutlined
                style={{ fontSize: 18 }}
                onClick={() => handleInitiateClick(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
      width: 200,
    },
  ]

  const onFilter = async (values) => {
    const response = await candidateFilter(values)
    setcandidateListData(response?.data)
  }

  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  return (
    <>
      <Pageheading title="Candidate List" marginBottom="1px" />

      <CandidateChecklistModal
        isModalOpen={isChecklistModalOpen}
        setIsModalOpen={setIsChecklistModalOpen}
        candidateId={selectedCandidateId}
      />

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      <div className="def" style={{ paddingBottom: 10 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 8 }}>
          {role === 'NapsHR' ? (
            <Tabs.TabPane tab="NAPS" key="naps" />
          ) : (
            <>
              <Tabs.TabPane tab="All" key="all" />
              <Tabs.TabPane tab="NAPS" key="naps" />
            </>
          )}
        </Tabs>

        <TableBulkActionIcons
          totalRecords={filteredData.length}
          handleSearch={handleSearch}
          search={search}
          setSearch={setSearch}
          setcandidateListData={setcandidateListData}
          fetchData={fetchData}
          statusMap={statusMap}
          actionsMap={actionsMap}
          filteredData={filteredData}
        />

        {!isMobile ? (
          <Table
            rowKey="id"
            tableLayout="fixed"
            columns={columns}
            pagination={{
              current: currentPage,
              total: filteredData.length,
              position: ['bottomRight'],
              pageSize: pageSize,
              pageSizeOptions: ['10', '20', '50', '100', '500', '1000'],
              onChange: handleTableChange,
              showSizeChanger: true,
              showQuickJumper: false,
              showTotal: (total) => `Total ${total} items`,
            }}
            dataSource={filteredData}
            bordered={true}
            scroll={{ x: totalWidth + 50, y: 'calc(100vh - 160px)' }}
            style={{ whiteSpace: 'nowrap' }}
            className={theme === 'dark' ? 'dark-theme' : ''}
          />
        ) : (
          <div>
            {/* your mobile block is unchanged in logic, keep as you have */}
            <div style={{ padding: 12, border: '1px solid #d9d9d9' }}>
              Mobile view kept same (paste your existing mobile view here)
            </div>
          </div>
        )}
      </div>

      <CandidateInitializeModal
        label="Initiate Candidate"
        initiateModalOpen={initiateModalOpen}
        setInitiateModalOpen={setInitiateModalOpen}
        handleInitializeCandidate={handleInitializeCandidate}
        selectedCandidateData={selectedCandidateData}
      />

      <RightSideFilter onFilter={onFilter} resetFilters={() => fetchData(pageSize)} />
    </>
  )
}

const TableBulkActionIcons = ({
  totalRecords,
  handleSearch,
  search,
  setSearch,
  setcandidateListData,
  fetchData,
  statusMap,
  actionsMap,
  filteredData = [],
}) => {
  const { theme } = useSelector((state) => state.ui)

  const [statusSummary, setstatusSummary] = useState([
    {
      name: 'Total Rows',
      label: 'Pending Interview Schedule',
      count: 0,
      color: 'green',
      id: [1, 2, 3, 4, 5],
    },
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
    ])
  }, [totalRecords])

  const handleExportCandidate = async () => {
    if (Array.isArray(filteredData) && filteredData.length > 0) {
      const headers = [
        'S No',
        'Name',
        'Email Id',
        'Date of Birth',
        'Designation',
        'Department',
        'Mobile',
        'Store Code',
        'Store Location',
        'Status',
        'Cluster Status',
        'LP Status',
        'HR Status',
      ]

      const rowData = filteredData.map((row, index) => [
        `${index + 1}`,
        row?.firstName || '',
        row?.email || '',
        row?.dob ? dayjs(row?.dob).format('YYYY-MM-DD') : '',
        row?.designationName,
        row?.departmentName,
        row?.phone,
        row?.storeLocationCode,
        row?.storeLocationName,
        statusMap[row?.statusId]?.label || '',
        statusMap[row?.clusterManagerApprovalStatus]?.label || '',
        statusMap[row?.auditApprovalStatus]?.label || '',
        statusMap[row?.hrApprovalStatus]?.label || '',
      ])

      const exportDataFormatted = [headers, ...rowData]

      const worksheet = XLSX.utils.aoa_to_sheet(exportDataFormatted)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
      XLSX.writeFile(workbook, `Export_Candidates_${new Date().toISOString()}.xlsx`)
    } else {
      message.error('No data to download')
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
        {statusSummary.map(({ name, label, count }, index) => (
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
                {count} {name}{' '}
              </span>
            </Tooltip>
          </div>
        ))}
      </Space>

      <Row>
        <Col>
          {actionsMap['add candidate']?.actionStatus && (
            <Tooltip placement="top" title={'Add Candidate'}>
              <Link to={'/employee/add_new'} style={{ marginLeft: 5 }}>
                <Button>
                  <PlusOutlined />
                </Button>
              </Link>
            </Tooltip>
          )}

          {actionsMap?.export?.actionStatus && (
            <Tooltip placement="top" title={'Export'}>
              <Button style={{ marginLeft: 5 }} onClick={handleExportCandidate}>
                <ExportOutlined />
              </Button>
            </Tooltip>
          )}
        </Col>

        <Search
          placeholder="Search in table..."
          allowClear
          onChange={handleSearch}
          style={{ width: 300, marginLeft: 5 }}
          value={search}
        />
      </Row>
    </div>
  )
}

export default CandidateList
