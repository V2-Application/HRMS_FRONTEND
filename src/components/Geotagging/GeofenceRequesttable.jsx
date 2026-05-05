import React, { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  StepForwardOutlined,
  EditOutlined,
  DownOutlined,
  UpOutlined,
  EyeOutlined,
  LinkOutlined,
} from '@ant-design/icons'
import {
  Table,
  Tag,
  Checkbox,
  Row,
  Input,
  Tooltip,
  Button,
  Modal,
  message,
  Space,
  Col,
  Tabs,
  Skeleton,
  Empty,
  Grid,
} from 'antd'
import {
  GeofenceLists,
  geoFenceSubmit,
  mygeofenceRequestStatusLists,
} from '../../services/Services'
import dayjs from 'dayjs'
import { set } from '../../redux/uiSlice'
import { debounce } from 'lodash'
import AttendanceRequestModal from '../Attandence/AttendanceRequestModal'
import BulkUploadRegularizeFormModal from '../Attandence/BulkUploadRegularizeFormModal'
import axiosInstance from '../../services/axiosInstance'

const { Search, TextArea } = Input
const { useBreakpoint } = Grid

/** ======================= Small helpers for status ======================= */
const getStatusMetaById = (id) => {
  const n = Number(id)
  if (Number.isNaN(n)) return null
  switch (n) {
    case 0:
    case 4:
      return { label: 'Pending', color: 'gold' }
    case 1:
      return { label: 'Approved', color: 'green' }
    case 2:
    case 3:
      return { label: 'Rejected', color: 'red' }
    default:
      return null
  }
}
const getStatusMetaByName = (name) => {
  const s = String(name || '')
    .trim()
    .toLowerCase()
  if (!s) return null
  if (['pending', 'awaiting', 'in review', 'open'].includes(s))
    return { label: 'Pending', color: 'gold' }
  if (['approved', 'accept', 'accepted', 'success', 'completed', 'managerapproved', 'manager approved'].includes(s))
    return { label: 'Approved', color: 'green' }
  if (['rejected', 'declined', 'denied', 'failed', 'cancelled', 'canceled'].includes(s))
    return { label: 'Rejected', color: 'red' }
  return null
}
const coerceStatus = (val) => {
  if (val === undefined || val === null) return null
  const n = Number(val)
  if (!Number.isNaN(n)) {
    const byId = getStatusMetaById(n)
    if (byId) return byId
  }
  const s = String(val).trim()
  if (s) {
    const byName = getStatusMetaByName(s)
    if (byName) return byName
  }
  return null
}
const collectStatusCandidatesDeep = (record) => {
  const out = []
  if (!record || typeof record !== 'object') return out
  const known = [
    record?.historyStatusId,
    record?.geofenceStatusId,
    record?.attendanceRequestStatusId,
    record?.currentStatusId,
    record?.approvalStatusId,
    record?.requestStatusId,
    record?.statusId,
    record?.StatusId,
    record?.statusID,
    record?.StatusID,
    record?.historyStatus,
    record?.geofenceStatus,
    record?.attendanceRequestStatus,
    record?.currentStatus,
    record?.approvalStatus,
    record?.requestStatus,
    record?.status,
    record?.Status,
    record?.state,
  ]
  out.push(...known)
  for (const [k, v] of Object.entries(record)) {
    if (k.toLowerCase().includes('status')) {
      out.push(v)
      if (v && typeof v === 'object') {
        if ('id' in v) out.push(v.id)
        if ('name' in v) out.push(v.name)
        if ('statusId' in v) out.push(v.statusId)
        if ('statusName' in v) out.push(v.statusName)
      }
    }
  }
  const scanNested = (obj, depth = 0) => {
    if (!obj || typeof obj !== 'object' || depth > 2) return
    for (const [k, v] of Object.entries(obj)) {
      if (k.toLowerCase().includes('status')) {
        out.push(v)
        if (v && typeof v === 'object') {
          if ('id' in v) out.push(v.id)
          if ('name' in v) out.push(v.name)
          if ('statusId' in v) out.push(v.statusId)
          if ('statusName' in v) out.push(v.statusName)
        }
      }
      if (v && typeof v === 'object') scanNested(v, depth + 1)
    }
  }
  scanNested(record, 0)
  return out
}
const resolveStatusMeta = (record, activekey) => {
  const candidates = collectStatusCandidatesDeep(record)
  for (const c of candidates) {
    const coerced = coerceStatus(c)
    if (coerced) return coerced
  }
  if (activekey === '1') return { label: 'Pending', color: 'gold' }
  if (activekey === '2') return { label: 'Manager Approved', color: 'blue' }
  if (activekey === '3') return { label: 'Approved', color: 'green' }
  if (activekey === '4') return { label: 'Rejected', color: 'red' }
  return { label: '—', color: 'default' }
}
const resolveApproverRemark = (record) => {
  const fields = [
    'approverRemark',
    'approverRemarks',
    'approvalRemark',
    'approvalRemarks',
    'managerRemark',
    'managerRemarks',
    'approverComment',
    'approverComments',
    'managerComment',
    'managerComments',
    'remarks',
  ]
  for (const f of fields) {
    const v = record?.[f]
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v)
  }
  for (const [, v] of Object.entries(record || {})) {
    if (v && typeof v === 'object') {
      for (const f of fields) {
        const inner = v[f]
        if (inner !== undefined && inner !== null && String(inner).trim() !== '')
          return String(inner)
      }
    }
  }
  return ''
}
const ellipsisCell = (text, width = 220) =>
  text ? (
    <Tooltip title={text}>
      <span
        style={{
          maxWidth: width,
          display: 'inline-block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
    </Tooltip>
  ) : (
    <span style={{ color: '#999' }}>—</span>
  )

const { useBreakpoint: useAntBreakpoints } = Grid
const useIsMobile = () => {
  const screens = useAntBreakpoints()
  return !screens.md
}

/** ======================= Row keys ======================= */
const buildRowKey = (rec, salt = '') => {
  const id = rec?.attendanceRequestId ?? rec?.id ?? rec?.requestId ?? rec?.uuid ?? rec?.key
  if (id !== undefined && id !== null && id !== '') return String(id)
  const eid = rec?.employeeId ?? rec?.ecode ?? 'emp'
  const d =
    (rec?.punchDate && dayjs(rec.punchDate).isValid()
      ? dayjs(rec.punchDate).format('YYYYMMDD')
      : '') ||
    (rec?.requestDate && String(rec.requestDate).slice(0, 10)) ||
    ''
  const composed = `${eid}-${d}`
  return salt ? `${composed}-${salt}` : composed
}
const addRowKeys = (rows = [], saltBase = '') =>
  rows.map((r, i) => ({ ...r, __rk: buildRowKey(r, `${saltBase}-${i}`) }))

/** ======================= PROOF helpers ======================= */
const isAbsoluteUrl = (u) => /^https?:\/\//i.test(u)
const buildProofUrl = (p) => {
  if (!p) return ''
  if (isAbsoluteUrl(p)) return p
  // Prefer the axios baseURL if available
  const base = (axiosInstance?.defaults?.baseURL || '').replace(/\/+$/, '')
  if (base) return `${base}/${String(p).replace(/^\/+/, '')}`
  // Fallback to current origin
  return `${window.location.origin}/${String(p).replace(/^\/+/, '')}`
}

/** Collect proof URLs from a top-level record + details[] */
const collectProofUrls = (record) => {
  const urls = []
  const add = (raw) => {
    if (!raw) return
    const url = buildProofUrl(String(raw))
    if (url && !urls.includes(url)) urls.push(url)
  }
  // row-level proofPath
  add(record?.proofPath)
  // some APIs may expose alternate case/field names
  add(record?.proof) // just in case

  // scan nested details
  if (Array.isArray(record?.details)) {
    for (const d of record.details) add(d?.proofPath)
  }
  return urls
}

/** Proof cell used in parent table */
const ProofCell = ({ record }) => {
  const urls = collectProofUrls(record)
  if (!urls.length) return <span style={{ color: '#999' }}>—</span>
  const label = urls.length > 1 ? `View (${urls.length})` : 'View'
  return (
    <Button
      type="link"
      style={{ padding: 0 }}
      icon={<EyeOutlined />}
      onClick={(e) => {
        e.stopPropagation()
        window.open(urls[0], '_blank', 'noopener,noreferrer')
      }}
    >
      {label}
    </Button>
  )
}

/** ======================= Main component ======================= */
const FilterDropdown = ({ dataIndex, dataList, filterValues, setFilterValues, confirm, title }) => {
  const [searchText, setSearchText] = useState('')
  const [selectedOptions, setSelectedOptions] = useState(filterValues || [])
  const list = Array.isArray(dataList) ? dataList : []
  const normalized = list.map((item) => ({ raw: item ?? '', label: String(item ?? '') }))
  const filteredOptions = normalized.filter(({ label }) =>
    label.toLowerCase().includes(searchText.toLowerCase()),
  )
  const handleChange = (checkedValues) => setSelectedOptions(checkedValues)
  const handleFilter = () => {
    setFilterValues(selectedOptions)
    confirm()
  }
  const handleReset = () => {
    setSelectedOptions([])
    setFilterValues([])
    setSearchText('')
    confirm()
  }

  return (
    <div style={{ padding: 8, width: 215 }}>
      <Input
        placeholder={`Search ${title}`}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 8, display: 'block' }}
      />
      <div style={{ maxHeight: 150, overflowY: 'auto', paddingRight: 8 }}>
        <Checkbox.Group
          value={selectedOptions}
          onChange={handleChange}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          {filteredOptions.map(({ raw, label }) => (
            <Checkbox key={label || '(empty)'} value={raw}>
              {label || <em>(empty)</em>}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>
      <Space style={{ marginTop: 8 }}>
        <Button type="primary" size="small" onClick={handleFilter}>
          Filter
        </Button>
        <Button size="small" onClick={handleReset}>
          Reset
        </Button>
      </Space>
    </div>
  )
}

const GeofenceRequestTable = () => {
  const isMobile = useIsMobile()

  const [initiateModalOpen, setInitiateModalOpen] = useState(false)
  const [regularizeList, setRegularizeList] = useState([])
  const [localloading, setlocalLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState({})
  const [approverRemark, setApproverRemark] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [totalRecords, setTotalRecords] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [currentRecord, setCurrentRecord] = useState({})
  const { employeeId, role } = useSelector((state) => state?.auth?.data)
  const [messageApi, contextHolder] = message.useMessage()
  const [activekey, setActiveKey] = useState('1')
  const [searchText, setsearchText] = useState('')
  const [isAttendanceRequestModalOpen, setIsAttendanceRequestModalOpen] = useState(false)
  const [regulistAttandanceUpdatedData, setregulistAttandanceUpdatedData] = useState({})
  const [requestDateFilterValues, setRequestDateFilterValues] = useState([])
  const [employeeNameFilterValues, setEmployeeNameFilterValues] = useState([])
  const [ecodeFilterValues, setEcodeFilterValues] = useState([])
  const [bulkRegularizeModalOpen, setBulkRegularizeModalOpen] = useState(false)

  const [addressCache, setAddressCache] = useState({})
  const abortRef = React.useRef(null)

  const { theme, loading } = useSelector((state) => state.ui)
  const dispatch = useDispatch()

  // Controlled single-row expansion
  const [expandedRowKeys, setExpandedRowKeys] = useState([])
  const rowKeyFn = (r) => r.__rk

  const latLngKey = (lat, lon) => {
    const la = Number(lat)
    const lo = Number(lon)
    if (Number.isNaN(la) || Number.isNaN(lo)) return ''
    return `${la.toFixed(6)},${lo.toFixed(6)}`
  }

  const reverseGeocode = async (lat, lon, signal) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=1`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'GeofenceRequests/1.0 (contact: your-email@example.com)',
        Accept: 'application/json',
      },
      signal,
    })
    if (!res.ok) throw new Error(`Reverse geocode failed: ${res.status}`)
    const json = await res.json()
    return json?.display_name || ''
  }

  const ensureAddresses = async (details = []) => {
    if (!Array.isArray(details) || details.length === 0) return
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const unique = []
    const seen = new Set()
    for (const d of details) {
      const k = latLngKey(d?.latitude, d?.longitude)
      if (!k || addressCache[k] || seen.has(k)) continue
      seen.add(k)
      unique.push({ k, lat: d.latitude, lon: d.longitude })
    }
    if (unique.length === 0) return

    for (const { k, lat, lon } of unique) {
      try {
        const addr = await reverseGeocode(lat, lon, controller.signal)
        setAddressCache((prev) => ({ ...prev, [k]: addr || '(no address found)' }))
        await new Promise((r) => setTimeout(r, 250))
      } catch (e) {
        if (controller.signal.aborted) break
        setAddressCache((prev) => ({ ...prev, [k]: '(lookup failed)' }))
      }
    }
  }

  const handleCheckboxChange = (option, idKey) => {
    setSelectedOption((prev) => ({ ...prev, [idKey]: option }))
  }
  const handleTableChange = (current, newPageSize) => {
    setCurrentPage(current)
    setPageSize(newPageSize)
    setExpandedRowKeys([])
  }
  const openActionModal = (record) => {
    setCurrentRecord(record)
    setApproverRemark('')
    setSelectedOption((prev) => ({ ...prev, [record?.employeeId]: null }))
    setInitiateModalOpen(true)
  }
  const isValidRemark = (txt) => {
    const t = String(txt || '').trim()
    return t.length >= 3 && t.length <= 500
  }
  const handleRegularize = async (idKey) => {
    const choice = selectedOption[idKey]
    const remarkOk = isValidRemark(approverRemark)
    if (!choice) {
      message.error('Please select Approve or Reject.')
      return
    }
    if (!remarkOk) {
      message.error('Approver remark is required (3–500 characters).')
      return
    }

    const requestBody = {
      statusId: choice,
      employeeId: currentRecord?.employeeId,
      punchDate: currentRecord?.punchDate?.split('T')[0],
      timeZoneId: 'UTC',
      remarks: String(approverRemark).trim(),
    }

    try {
      await dispatch(set({ loading: true }))
      const response = await geoFenceSubmit(requestBody, Number(employeeId))
      if (response?.status === 200) {
        const approved = requestBody.statusId === 1
        message.success(
          response?.data?.message || (approved ? 'Approved successfully' : 'Rejected successfully'),
        )
        if (activekey === '1') await fetchData(4)         // Pending
        if (activekey === '2') await fetchData(1)         // Approved
        if (activekey === '3') await fetchData(2)         // Rejected
        if (activekey === '4') await fetchDataReguliseHistory()
      } else {
        message.error(response?.response?.data?.message || 'Error in submitting data')
      }
    } catch (error) {
      message.error(error?.response?.data?.message || 'Error in submitting data')
    } finally {
      await dispatch(set({ loading: false }))
      setInitiateModalOpen(false)
      setSelectedOption((prev) => ({ ...prev, [idKey]: null }))
      setApproverRemark('')
    }
  }

  const fetchData = async (statusId) => {
    await dispatch(set({ loading: true }))
    setlocalLoading(true)
    try {
      const response = await GeofenceLists(employeeId, currentPage, pageSize, searchText, statusId)
      if (response?.status === 200) {
        const rows = addRowKeys(response?.data?.data || [], `p${currentPage}-tab${activekey}`)
        setRegularizeList(rows)
        setTotalRecords(response?.data?.totalRecords || rows.length || 0)
      } else {
        setRegularizeList([])
        setTotalRecords(0)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setRegularizeList([])
      setTotalRecords(0)
    } finally {
      await dispatch(set({ loading: false }))
      setlocalLoading(false)
      setExpandedRowKeys([])
    }
  }
  const fetchDataReguliseHistory = async () => {
    await dispatch(set({ loading: true }))
    setlocalLoading(true)
    try {
      const response = await mygeofenceRequestStatusLists(employeeId)
      if (response?.status === 200) {
        // Filter to only show records with at least one outside-geofence punch
        const allRows = response?.data?.data || []
        const geoRows = allRows.filter((row) => {
          const details = Array.isArray(row?.details) ? row.details : []
          return details.some((d) => d?.withinGeofence === false)
        })
        const rows = addRowKeys(geoRows, `hist-p${currentPage}`)
        setRegularizeList(rows)
        setTotalRecords(rows.length || 0)
      } else {
        setRegularizeList([])
        setTotalRecords(0)
      }
    } catch (error) {
      message.error(error?.response?.data?.message || 'Failed to load history')
      setRegularizeList([])
      setTotalRecords(0)
    } finally {
      await dispatch(set({ loading: false }))
      setlocalLoading(false)
      setExpandedRowKeys([])
    }
  }

  useEffect(() => {
    if (activekey === '1') fetchData(4)         // Pending (awaiting Manager)
    else if (activekey === '2') fetchData(1)    // Approved
    else if (activekey === '3') fetchData(2)    // Rejected
    else if (activekey === '4') fetchDataReguliseHistory()  // My History
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, activekey, searchText])

  const punchTypeLabel = (t) => (t === 1 ? 'IN' : t === 2 ? 'OUT' : String(t ?? ''))

  /** ======================= Columns (parent) ======================= */
  const isMobileScreen = useIsMobile()
  const baseNameCol = {
    title: 'Name',
    dataIndex: 'employeeName',
    key: 'employeeName',
    fixed: isMobileScreen ? false : 'left',
    width: 150,
    ellipsis: true,
    responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    filteredValue: employeeNameFilterValues.length ? employeeNameFilterValues : null,
    onFilter: () => true,
    filterDropdown: ({ confirm }) => (
      <FilterDropdown
        title="Name"
        dataIndex="employeeName"
        dataList={[...new Set(regularizeList.map((item) => item.employeeName))]}
        filterValues={setEmployeeNameFilterValues ? employeeNameFilterValues : []}
        setFilterValues={setEmployeeNameFilterValues}
        confirm={confirm}
      />
    ),
  }
  const approverRemarkCol = {
    title: 'Approver Remark',
    dataIndex: 'remarks',
    key: 'remarks',
    width: 260,
    ellipsis: true,
    render: (_, record) => ellipsisCell(resolveApproverRemark(record), 240),
    responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
  }
  const managerStatusCol = {
    title: 'Manager Status',
    dataIndex: 'managerApprovalStatusId',
    key: 'managerApprovalStatus',
    width: 140,
    responsive: ['md', 'lg', 'xl'],
    render: (_, record) => {
      const sid = record?.managerApprovalStatusId
      if (!sid || sid === 4) return <Tag color="gold">Pending</Tag>
      if (sid === 1) return <Tag color="green">Approved</Tag>
      if (sid === 2) return <Tag color="red">Rejected</Tag>
      return <Tag color="default">—</Tag>
    },
  }
  const managerRemarksCol = {
    title: 'Manager Remarks',
    dataIndex: 'managerRemarks',
    key: 'managerRemarks',
    width: 200,
    ellipsis: true,
    render: (_, record) => ellipsisCell(record?.managerRemarks, 180),
    responsive: ['lg', 'xl'],
  }
  const masterStatusCol = {
    title: 'Master Status',
    dataIndex: 'masterApprovalStatusId',
    key: 'masterApprovalStatus',
    width: 130,
    responsive: ['md', 'lg', 'xl'],
    render: (_, record) => {
      const sid = record?.masterApprovalStatusId
      if (!sid || sid === 4) return <Tag color="gold">Pending</Tag>
      if (sid === 1) return <Tag color="green">Approved</Tag>
      if (sid === 2) return <Tag color="red">Rejected</Tag>
      return <Tag color="default">—</Tag>
    },
  }
  const masterRemarksCol = {
    title: 'Master Remarks',
    dataIndex: 'masterRemarks',
    key: 'masterRemarks',
    width: 200,
    ellipsis: true,
    render: (_, record) => ellipsisCell(record?.masterRemarks, 180),
    responsive: ['lg', 'xl'],
  }
  /** NEW: Proof column (updated) */
  const proofCol = {
    title: 'Proof',
    dataIndex: 'proofPath',
    key: 'proofPath',
    width: 130,
    align: 'left',
    render: (_v, record) => <ProofCell record={record} />,
    responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
  }

  const columnsDesktop = [
    baseNameCol,
    {
      title: 'E Code',
      dataIndex: 'ecode',
      key: 'ecode',
      fixed: isMobileScreen ? false : 'left',
      width: 100,
      ellipsis: true,
      responsive: ['md'],
      filteredValue: ecodeFilterValues.length ? ecodeFilterValues : null,
      onFilter: () => true,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="E Code"
          dataIndex="ecode"
          dataList={[...new Set(regularizeList.map((item) => item.ecode))]}
          filterValues={ecodeFilterValues}
          setFilterValues={setEcodeFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Date',
      dataIndex: 'punchDate',
      key: 'punchDate',
      width: 150,
      ellipsis: true,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (d) => (d ? dayjs(d).format('YYYY-MM-DD') : '-'),
      sorter: (a, b) => dayjs(a.punchDate).valueOf() - dayjs(b.punchDate).valueOf(),
      defaultSortOrder: 'ascend',
      filteredValue: requestDateFilterValues.length ? requestDateFilterValues : null,
      onFilter: () => true,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Date"
          dataIndex="punchDate"
          dataList={[
            ...new Set(
              (regularizeList || [])
                .map((item) =>
                  item?.punchDate && dayjs(item.punchDate).isValid()
                    ? dayjs(item.punchDate).format('YYYY-MM-DD')
                    : null,
                )
                .filter(Boolean),
            ),
          ]}
          filterValues={requestDateFilterValues}
          setFilterValues={setRequestDateFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'statusId',
      key: 'statusId',
      width: 120,
      ellipsis: true,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (_val, record) => {
        const { label, color } = resolveStatusMeta(record, activekey)
        return <Tag color={color}>{label}</Tag>
      },
    },
    managerStatusCol,
    managerRemarksCol,
    {
      title: 'Total Punches',
      dataIndex: 'punchCount',
      key: 'punchCount',
      width: 130,
      align: 'center',
      ellipsis: true,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (_, record) => record?.punchCount ?? record?.punchcount ?? 0,
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      fixed: isMobileScreen ? false : 'right',
      responsive: ['sm', 'md', 'lg', 'xl'],
      render: (_, record) => {
        const roleLower = (role || '').toLowerCase()
        const isSuperAdmin = roleLower === 'superadmin'
        // Manager, Master, and SuperAdmin can all act on Pending (tab 1)
        const canAct = isSuperAdmin || activekey === '1'

        if (!canAct) return null
        return (
          <Space size="middle">
            {isSuperAdmin && (
              <Tooltip placement="top" title="View">
                <EditOutlined
                  style={{ fontSize: 18 }}
                  onClick={() => {
                    setIsAttendanceRequestModalOpen(true)
                    setregulistAttandanceUpdatedData(record)
                  }}
                />
              </Tooltip>
            )}
            <Tooltip placement="top" title="Manager Action">
              <StepForwardOutlined style={{ fontSize: 18 }} onClick={() => openActionModal(record)} />
            </Tooltip>
          </Space>
        )
      },
    },
  ]

  const columnsHistoryDesktop = [
    baseNameCol,
    {
      title: 'E Code',
      dataIndex: 'ecode',
      key: 'ecode',
      width: 100,
      ellipsis: true,
      responsive: ['md'],
      filteredValue: ecodeFilterValues.length ? ecodeFilterValues : null,
      onFilter: () => true,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="E Code"
          dataIndex="ecode"
          dataList={[...new Set(regularizeList.map((item) => item.ecode))]}
          filterValues={ecodeFilterValues}
          setFilterValues={setEcodeFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Date',
      dataIndex: 'punchDate',
      key: 'punchDate',
      width: 150,
      ellipsis: true,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (d) => (d ? dayjs(d).format('YYYY-MM-DD') : '-'),
      sorter: (a, b) => dayjs(a.punchDate).valueOf() - dayjs(b.punchDate).valueOf(),
      defaultSortOrder: 'ascend',
      filteredValue: requestDateFilterValues.length ? requestDateFilterValues : null,
      onFilter: () => true,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Date"
          dataIndex="punchDate"
          dataList={[
            ...new Set(
              (regularizeList || [])
                .map((item) =>
                  item?.punchDate && dayjs(item.punchDate).isValid()
                    ? dayjs(item.punchDate).format('YYYY-MM-DD')
                    : null,
                )
                .filter(Boolean),
            ),
          ]}
          filterValues={requestDateFilterValues}
          setFilterValues={setRequestDateFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'statusId',
      key: 'statusId',
      width: 120,
      ellipsis: true,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (_val, record) => {
        const { label, color } = resolveStatusMeta(record, activekey)
        return <Tag color={color}>{label}</Tag>
      },
    },
    managerStatusCol,
    managerRemarksCol,
    {
      title: 'Total Punches',
      dataIndex: 'punchcount',
      key: 'punchcount',
      width: 130,
      align: 'center',
      ellipsis: true,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (_, record) => record?.punchCount ?? record?.punchcount ?? 0,
    },
  ]

  /** ======================= Expanded “punches” table ======================= */
  const renderExpandedPunches = (record) => {
    const details = Array.isArray(record?.details) ? record.details : []
    if (details.length === 0) {
      return <Empty style={{ margin: 12 }} description="No punches available" />
    }
    return (
      <Table
        size={isMobile ? 'small' : 'middle'}
        pagination={false}
        rowKey={(_, i) => i}
        dataSource={details.map((d, i) => ({ ...d, key: i }))}
        scroll={{ x: 'max-content' }}
        columns={[
          {
            title: 'Type',
            dataIndex: 'punchType',
            key: 'type',
            width: 90,
            render: (v) => <Tag color={v === 1 ? 'green' : 'blue'}>{punchTypeLabel(v)}</Tag>,
          },
          {
            title: 'Time',
            dataIndex: 'punchTimeUtc',
            key: 'time',
            width: 200,
            render: (t) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm:ss') : '-'),
            sorter: (a, b) => dayjs(a.punchTimeUtc).valueOf() - dayjs(b.punchTimeUtc).valueOf(),
          },
          { title: 'Latitude', dataIndex: 'latitude', key: 'lat', width: 120 },
          { title: 'Longitude', dataIndex: 'longitude', key: 'lon', width: 120 },
          { title: 'Address', dataIndex: 'address', key: 'address', width: 320 },
          {
            title: 'Geofence',
            dataIndex: 'withinGeofence',
            key: 'geo',
            width: 130,
            render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Inside' : 'Outside'}</Tag>,
            filters: [
              { text: 'Inside', value: true },
              { text: 'Outside', value: false },
            ],
            onFilter: (value, rec) => rec.withinGeofence === value,
          },
          { title: 'Device', dataIndex: 'deviceInfo', key: 'device', width: 200, ellipsis: true },
          { title: 'Client IP', dataIndex: 'clientIp', key: 'ip', width: 160 },
          {
            title: 'Proof',
            dataIndex: 'proofPath',
            key: 'proofPath',
            width: 120,
            render: (p) =>
              p ? (
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(buildProofUrl(p), '_blank', 'noopener,noreferrer')
                  }}
                  style={{ padding: 0 }}
                >
                  View
                </Button>
              ) : (
                <span style={{ color: '#999' }}>—</span>
              ),
          },
        ]}
      />
    )
  }

  const stripForMobile = (cols) =>
    Array.isArray(cols)
      ? cols.map((col) => {
          const { responsive, fixed, children, ...rest } = col || {}
          if (Array.isArray(children)) rest.children = stripForMobile(children)
          return rest
        })
      : []

  const columnsPendingAll = isMobile ? stripForMobile(columnsDesktop) : columnsDesktop
  const columnsHistoryAll = isMobile ? stripForMobile(columnsHistoryDesktop) : columnsHistoryDesktop

  const getExpandIndex = (cols) => {
    let i = cols.findIndex((c) => c?.dataIndex === 'punchCount' || c?.dataIndex === 'punchcount')
    if (i < 0) i = cols.findIndex((c) => c?.dataIndex === 'remarks')
    if (i < 0) i = Math.max(0, cols.length - 2)
    return Math.max(0, i + 1)
  }

  const handleSearchh = useCallback(
    debounce((text) => setsearchText(text), 500),
    [],
  )
  const handleSearch = (e) => handleSearchh(e.target.value)

  const tableCommonProps = {
    bordered: true,
    className: theme === 'dark' ? 'dark-theme' : '',
    tableLayout: isMobile ? 'fixed' : undefined,
    size: isMobile ? 'small' : 'middle',
    sticky: { offsetHeader: 0 },
    scroll: { x: isMobile ? 960 : 'max-content', y: isMobile ? 360 : 'calc(100vh - 160px)' },
    locale: { emptyText: <Empty description="No data available" /> },
  }

  const getExpandable = (columnsForThisTable) => ({
    columnTitle: <span style={{ whiteSpace: 'nowrap' }}>Punches</span>,
    expandedRowRender: renderExpandedPunches,
    expandedRowKeys,
    onExpand: async (expanded, record) => {
      const key = rowKeyFn(record)
      if (expanded && key != null) {
        setExpandedRowKeys([key])
        await ensureAddresses(record?.details)
      } else {
        setExpandedRowKeys([])
      }
    },
    onExpandedRowsChange: (keys) => {
      setExpandedRowKeys(Array.isArray(keys) && keys.length ? [keys[keys.length - 1]] : [])
    },
    columnWidth: isMobile ? 84 : 56,
    expandIcon: ({ expanded, onExpand, record }) => (
      <a
        onClick={(e) => onExpand(record, e)}
        aria-label={expanded ? 'Collapse punches' : 'Expand punches'}
        style={{ display: 'inline-flex', alignItems: 'center' }}
      >
        {expanded ? <UpOutlined /> : <DownOutlined />}
      </a>
    ),
    expandIconColumnIndex: getExpandIndex(columnsForThisTable),
  })

  const paginationProps = {
    current: currentPage,
    total: totalRecords,
    position: ['bottomRight'],
    pageSize,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    onChange: (c, s) => {
      setCurrentPage(c)
      setPageSize(s)
      setExpandedRowKeys([])
    },
    responsive: true,
  }

  const renderTable = (columns, showAction = true) => (
    <>
      <TableToolbar
        selectedRowKeys={selectedRowKeys}
        totalRecords={totalRecords}
        handleSearch={handleSearch}
        activekey={activekey}
        showBulkActions={activekey === '1'}
        setBulkRegularizeModalOpen={setBulkRegularizeModalOpen}
        isMobile={isMobile}
      />
      {localloading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <Table
          rowKey={(r) => r.__rk}
          columns={showAction ? columns : columns.filter((c) => c.key !== 'action')}
          expandable={getExpandable(showAction ? columns : columns.filter((c) => c.key !== 'action'))}
          pagination={paginationProps}
          dataSource={regularizeList}
          {...tableCommonProps}
        />
      )}
    </>
  )

  const tabItems = [
    {
      label: <span className="custom-tab-label">Pending</span>,
      key: '1',
      children: renderTable(columnsPendingAll, true),
    },
    {
      label: <span className="custom-tab-label">Approved</span>,
      key: '2',
      children: renderTable(columnsPendingAll, false),
    },
    {
      label: <span className="custom-tab-label">Rejected</span>,
      key: '3',
      children: renderTable(columnsHistoryAll, false),
    },
    {
      label: <span className="custom-tab-label">My History</span>,
      key: '4',
      children: renderTable(columnsHistoryAll, false),
    },
  ]

  const onTabChange = (key) => {
    setActiveKey(key)
    setsearchText('')
    setPageSize(100)
    setCurrentPage(1)
    setExpandedRowKeys([])
  }

  return (
    <>
      {contextHolder}
      <ToastContainer position="top-right" autoClose={2000} />

      <Tabs type="card" activeKey={activekey} items={tabItems} onChange={onTabChange} />

      <Modal
        title="Manager Approval — Geofence Request"
        open={initiateModalOpen}
        onCancel={() => {
          setInitiateModalOpen(false)
          setApproverRemark('')
        }}
        confirmLoading={loading}
        width={isMobile ? '100%' : 520}
        styles={isMobile ? { body: { padding: 12 } } : {}}
        footer={[
          <Button
            key="submit"
            type="primary"
            onClick={() => handleRegularize(currentRecord?.employeeId)}
            disabled={
              loading ||
              !selectedOption[currentRecord?.employeeId] ||
              !isValidRemark(approverRemark)
            }
            block={isMobile}
          >
            Submit
          </Button>,
        ]}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Checkbox
            checked={selectedOption[currentRecord?.employeeId] === 1}
            onChange={() => setSelectedOption((p) => ({ ...p, [currentRecord?.employeeId]: 1 }))}
            disabled={loading}
          >
            Approve
          </Checkbox>
          <Checkbox
            checked={selectedOption[currentRecord?.employeeId] === 2}
            onChange={() => setSelectedOption((p) => ({ ...p, [currentRecord?.employeeId]: 2 }))}
            disabled={loading}
          >
            Reject
          </Checkbox>

          <div>
            <div style={{ marginBottom: 6, fontWeight: 500 }}>
              Manager Remark <span style={{ color: 'red' }}>*</span>
            </div>
            <TextArea
              value={approverRemark}
              onChange={(e) => setApproverRemark(e.target.value)}
              placeholder="Enter your remark (3–500 characters)"
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={500}
              disabled={loading}
              status={!approverRemark || !isValidRemark(approverRemark) ? 'error' : ''}
              allowClear
            />
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: !approverRemark || !isValidRemark(approverRemark) ? '#ff4d4f' : '#999',
              }}
            >
              {approverRemark?.trim().length || 0}/500
              {!isValidRemark(approverRemark) && ' — Please enter at least 3 characters.'}
            </div>
          </div>
        </Space>
      </Modal>

      <AttendanceRequestModal
        isAttendanceRequestModalOpen={isAttendanceRequestModalOpen}
        setIsAttendanceRequestModalOpen={setIsAttendanceRequestModalOpen}
        regulistAttandanceUpdatedData={regulistAttandanceUpdatedData}
      />
    </>
  )
}

const TableToolbar = ({
  selectedRowKeys,
  totalRecords,
  handleSearch,
  activekey,
  showBulkActions,
  setBulkRegularizeModalOpen,
  isMobile,
}) => {
  const { theme } = useSelector((state) => state.ui)
  const [statusSummary, setStatusSummary] = useState([
    { name: 'Total Rows', count: 0, color: 'green' },
    { name: 'Selected Rows', count: 0, color: 'blue' },
  ])
  useEffect(() => {
    setStatusSummary((prev) => [
      { ...prev[0], count: totalRecords },
      { ...prev[1], count: selectedRowKeys?.length },
    ])
  }, [selectedRowKeys, totalRecords])

  return (
    <div
      style={{
        padding: 5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      <Space wrap>
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
            <Tooltip title={label}>
              <span style={{ fontSize: 12, padding: '0 8px' }}>
                {count} {name}
              </span>
            </Tooltip>
          </div>
        ))}
      </Space>
      <Row
        gutter={[8, 8]}
        align="middle"
        style={{ marginLeft: 'auto', width: isMobile ? '100%' : 'auto' }}
      >
        {showBulkActions && (
          <Col xs={24} sm="auto">
            {/* Bulk action placeholder */}
          </Col>
        )}
        <Col xs={24} sm="auto" style={{ width: isMobile ? '100%' : 300 }}>
          <Search
            placeholder="Search in table..."
            allowClear
            onChange={handleSearch}
            style={{ width: '100%' }}
          />
        </Col>
      </Row>
    </div>
  )
}

export default GeofenceRequestTable
