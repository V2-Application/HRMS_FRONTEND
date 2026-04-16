import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axiosInstance from '../../services/axiosInstance'
import { useDispatch, useSelector } from 'react-redux'
import {
  Button,
  message,
  Table,
  Input,
  Checkbox,
  Space,
  Upload,
  InputNumber,
  Tooltip,
  Tag,
  DatePicker,
  Row,
  Col,
} from 'antd'
import { set } from '../../redux/uiSlice'
import {
  RightOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  PaperClipOutlined,
  DownloadOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { setSelectedAttendanceEmpCode } from '../../redux/authSlice'
import { filterBgtSeatMaster } from '../../services/Services'
import CardInRow from '../shared/CardInRow/CardInRow'
import Pageheading from '../shared/Pageheading'
import './Attendance.css'
import dayjs from 'dayjs'
import useMediaQuery from '../../hooks/useMediaQuery'

const { Search } = Input

const STATUS_COLORS = {
  pending: 'gold',
  approved: 'green',
  rejected: 'red',
  null: 'default',
}

const FilterDropdown = ({ dataIndex, dataList, filterValues, setFilterValues, confirm, title }) => {
  const [searchText, setSearchText] = useState('')
  const [selectedOptions, setSelectedOptions] = useState(filterValues || [])

  useEffect(() => {
    setSelectedOptions(filterValues || [])
  }, [filterValues])

  const filteredOptions = (dataList || []).filter((item) =>
    (item ?? '').toLowerCase().includes(searchText.toLowerCase()),
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
          {filteredOptions.map((value) => (
            <Checkbox key={value} value={value}>
              {value}
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

const StoreTeamAttendance = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { employeeId, role, firstName, lastName, ecode } = useSelector((state) => state?.auth?.data)
  const allEmployeesAllowed = ['master', 'hr', 'superadmin', 'it superadmin', 'retail hierarchy']
  const [messageApi, contextHolder] = message.useMessage()
  const [zoneFilterValues, setZoneFilterValues] = useState([])
  const [regionFilterValues, setRegionFilterValues] = useState([])
  const [clusterFilterValues, setClusterFilterValues] = useState([])
  const [stCodeFilterValues, setStCodeFilterValues] = useState([])
  const [stNameFilterValues, setStNameFilterValues] = useState([])
  const [departmentFilterValues, setDepartmentFilterValues] = useState([])
  const [designationFilterValues, setDesignationFilterValues] = useState([])
  const [cardData, setCardData] = useState([
    { label: 'Active', value: 0 },
    { label: 'Left', value: 0 },
    { label: 'Absconded', value: 0 },
    { label: 'Total', value: 0 },
    { label: 'Current Month Join', value: 0 },
    { label: 'Current Month Left', value: 0 },
  ])
  const fullName = `${firstName} ${lastName}`
  const [selectedMonth, setSelectedMonth] = useState(dayjs())

  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  const handleToggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  // states
  const [empData, setEmpData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)

  // per-row edit state (not persisted until submit)
  // key: record.key or ecode -> { attendanceWaiting, remark, localFiles: File[], uploadAntdList: UploadFile[] }
  const [rowDrafts, setRowDrafts] = useState({})

  const getLevelFromRole = (r) => {
    const R = String(r || '').toLowerCase()
    if (R.includes('cm')) return 1
    if (R.includes('rm') || R.includes('rhr') || R === 'hr') return 2
    return 0 // viewer/others
  }
  const userLevel = getLevelFromRole(role)

  const canActOnRow = (record) => {
    // Level 1 (CM) can act only if CM status pending and RM/RHR not yet final.
    if (userLevel === 1) return (record?.cmStatus ?? 'pending').toLowerCase() === 'pending'
    // Level 2 (RM/RHR) can act iff CM approved and RM pending.
    if (userLevel === 2) {
      const cmApproved = String(record?.cmStatus || '').toLowerCase() === 'approved'
      const rmPending = String(record?.rmStatus || 'pending').toLowerCase() === 'pending'
      return cmApproved && rmPending
    }
    return false
  }

  const handleSelectEmpCode = (ecode, fullName) => {
    dispatch(setSelectedAttendanceEmpCode({ ecode, fullName }))
    navigate('/attandance/track', { state: { from: location.pathname } })
  }

  const norm = (v) => (v == null ? '' : String(v).trim())
  const keyOf = (v) => norm(v).toLowerCase()

  const applyColumnFilters = useCallback(
    (rows, excludeKey = null) => {
      const zSel = new Set(zoneFilterValues.map(keyOf))
      const regSel = new Set(regionFilterValues.map(keyOf))
      const clusSel = new Set(clusterFilterValues.map(keyOf))
      const stCodeSel = new Set(stCodeFilterValues.map(keyOf))
      const stNameSel = new Set(stNameFilterValues.map(keyOf))
      const deptSel = new Set(departmentFilterValues.map(keyOf))
      const desgSel = new Set(designationFilterValues.map(keyOf))

      return (rows || []).filter((row) => {
        if (excludeKey !== 'zoneName' && zSel.size && !zSel.has(keyOf(row?.zoneName))) return false
        if (excludeKey !== 'regionName' && regSel.size && !regSel.has(keyOf(row?.regionName)))
          return false
        if (excludeKey !== 'clusterName' && clusSel.size && !clusSel.has(keyOf(row?.clusterName)))
          return false
        if (excludeKey !== 'stCode' && stCodeSel.size && !stCodeSel.has(keyOf(row?.stCode)))
          return false
        if (
          excludeKey !== 'locationName' &&
          stNameSel.size &&
          !stNameSel.has(keyOf(row?.locationName))
        )
          return false
        if (
          excludeKey !== 'departmentName' &&
          deptSel.size &&
          !deptSel.has(keyOf(row?.departmentName))
        )
          return false
        if (
          excludeKey !== 'designationName' &&
          desgSel.size &&
          !desgSel.has(keyOf(row?.designationName))
        )
          return false
        return true
      })
    },
    [
      zoneFilterValues,
      regionFilterValues,
      clusterFilterValues,
      stCodeFilterValues,
      stNameFilterValues,
      departmentFilterValues,
      designationFilterValues,
    ],
  )

  const zoneOptions = useMemo(() => {
    return Array.from(
      new Set(
        applyColumnFilters(filteredData, 'zoneName')
          .map((r) => norm(r?.zoneName))
          .filter(Boolean),
      ),
    ).sort()
  }, [filteredData, applyColumnFilters])

  const regionOptions = useMemo(() => {
    return Array.from(
      new Set(
        applyColumnFilters(filteredData, 'regionName')
          .map((r) => norm(r?.regionName))
          .filter(Boolean),
      ),
    ).sort()
  }, [filteredData, applyColumnFilters])

  const clusterOptions = useMemo(() => {
    return Array.from(
      new Set(
        applyColumnFilters(filteredData, 'clusterName')
          .map((r) => norm(r?.clusterName))
          .filter(Boolean),
      ),
    ).sort()
  }, [filteredData, applyColumnFilters])

  const stCodeOptions = useMemo(() => {
    return Array.from(
      new Set(
        applyColumnFilters(filteredData, 'stCode')
          .map((r) => norm(r?.stCode))
          .filter(Boolean),
      ),
    ).sort()
  }, [filteredData, applyColumnFilters])

  const stNameOptions = useMemo(() => {
    return Array.from(
      new Set(
        applyColumnFilters(filteredData, 'locationName')
          .map((r) => norm(r?.locationName))
          .filter(Boolean),
      ),
    ).sort()
  }, [filteredData, applyColumnFilters])

  const deptOptions = useMemo(() => {
    return Array.from(
      new Set(
        applyColumnFilters(filteredData, 'departmentName')
          .map((r) => norm(r?.departmentName))
          .filter(Boolean),
      ),
    ).sort()
  }, [filteredData, applyColumnFilters])

  const desgOptions = useMemo(() => {
    return Array.from(
      new Set(
        applyColumnFilters(filteredData, 'designationName')
          .map((r) => norm(r?.designationName))
          .filter(Boolean),
      ),
    ).sort()
  }, [filteredData, applyColumnFilters])

  // data after all column filters
  const displayData = useMemo(
    () => applyColumnFilters(filteredData),
    [filteredData, applyColumnFilters],
  )

  const getAllEmployees = async () => {
    const response = await axiosInstance.get(
      `api/EmpAttendance/GetEmployeeAttendanceDetails?pageNumber=1&pageSize=1000000&mode=all&month=${selectedMonth.month() + 1}&year=${selectedMonth.year()}`,
    )

    if (response.status === 200) {
      const employees =
        response.data?.employees?.map((emp, index) => ({
          ...emp,
          key: emp?.ecode || index,
        })) || []
      return employees
    }
    return []
  }

  const getAllEmployeesWithManagerId = async () => {
    const response = await axiosInstance.get(
      `api/EmpAttendance/GetEmployeeAttendanceDetails?pageNumber=1&pageSize=1000000&mode=all&managerId=${String(ecode)}&month=${selectedMonth.month() + 1}&year=${selectedMonth.year()}`,
    )

    if (response.status === 200) {
      const employees =
        response.data?.employees?.map((emp, index) => ({
          ...emp,
          key: emp?.ecode || index,
        })) || []
      setEmpData(employees)
    }
    return []
  }

  // --- Main decision logic ---
  const decideAndFetch = async () => {
    const norm = (v) => (v === null || v === undefined ? '' : String(v).trim())
    const roleAllowed = allEmployeesAllowed.includes(String(role).toLowerCase())

    try {
      dispatch(set({ loading: true }))
      const seatResp = await filterBgtSeatMaster({ eCode: ecode })
      const allowedList = seatResp?.data?.data?.allowedStores ?? []
      const hasAllowedStores = Array.isArray(allowedList) && allowedList.length > 0

      if (hasAllowedStores || roleAllowed) {
        const allEmployees = await getAllEmployees()
        if (hasAllowedStores) {
          const allowedCodes = new Set(allowedList.map((a) => norm(a.stCode)))
          const filtered = (allEmployees ?? []).filter((item) =>
            allowedCodes.has(norm(item?.stCode)),
          )
          setEmpData(filtered)
        } else {
          setEmpData(allEmployees)
        }
        return
      }
      await getAllEmployeesWithManagerId()
    } catch (error) {
      console.error('Error loading employees:', error)
      messageApi.error('Failed to load employees')
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    const rows = displayData || []
    const total = rows.length

    const isActiveTrue = (val) => {
      if (val === true || val === 1) return true
      const s = String(val).toLowerCase().trim()
      return s === 'true' || s === '1' || s === 'yes' || s === 'active'
    }

    const stripToDate = (val) => {
      if (!val) return null
      const d = new Date(String(val).split('T')[0])
      return Number.isNaN(d.getTime()) ? null : d
    }

    const now = new Date()
    const curY = now.getFullYear()
    const curM = now.getMonth()
    const isCurrentMonth = (d) => d && d.getFullYear() === curY && d.getMonth() === curM

    let active = 0
    let absconded = 0
    let cmJoin = 0
    let cmLeft = 0

    for (const e of rows) {
      if (isActiveTrue(e?.isActive)) active += 1
      const resignType = String(e?.resignationTypeName || '').toLowerCase()
      if (resignType.includes('abscond')) absconded += 1

      const doj = stripToDate(e?.dateOfJoining)
      const dol = stripToDate(e?.dateOfLeft)
      if (isCurrentMonth(doj)) cmJoin += 1
      if (isCurrentMonth(dol)) cmLeft += 1
    }

    const left = total - active

    setCardData((prev) =>
      prev.map((c) => {
        if (c.label === 'Active') return { ...c, value: active }
        if (c.label === 'Left') return { ...c, value: left }
        if (c.label === 'Absconded') return { ...c, value: absconded }
        if (c.label === 'Total') return { ...c, value: total }
        if (c.label === 'Current Month Join') return { ...c, value: cmJoin }
        if (c.label === 'Current Month Left') return { ...c, value: cmLeft }
        return c
      }),
    )
  }, [displayData])

  const handleSearchChange = (e) => setSearch(e.target.value)

  useEffect(() => {
    decideAndFetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, selectedMonth])

  useEffect(() => {
    if (String(search).length > 2) {
      const filtered = empData.filter((emp) =>
        Object.values(emp).some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase()),
        ),
      )
      setFilteredData(filtered)
    } else {
      setFilteredData(empData)
    }
  }, [search, empData])

  const handleClearFilters = () => {
    setZoneFilterValues([])
    setRegionFilterValues([])
    setClusterFilterValues([])
    setStCodeFilterValues([])
    setStNameFilterValues([])
    setDepartmentFilterValues([])
    setDesignationFilterValues([])
  }

  // ---------- Upload helpers (frontend-only) ----------
  const uploadPropsForRow = (record) => ({
    multiple: true,
    showUploadList: false, // hide list completely; show only count below
    fileList: rowDrafts[record.key]?.uploadAntdList || [],

    // 🔄 Clear previous selection the moment user opens the picker,
    // so the next selection replaces old files entirely.
    onClick: () => {
      setRowDrafts((prev) => {
        const prevRow = prev[record.key] || {}
        // if already empty, no-op
        if (
          (prevRow.localFiles?.length || 0) === 0 &&
          (prevRow.uploadAntdList?.length || 0) === 0
        ) {
          return prev
        }
        return {
          ...prev,
          [record.key]: { ...prevRow, localFiles: [], uploadAntdList: [] },
        }
      })
    },

    beforeUpload: (file) => {
      // add only the currently selected files (since we cleared on click)
      setRowDrafts((prev) => {
        const prevRow = prev[record.key] || {}
        const nextFiles = [...(prevRow.localFiles || []), file]
        const nextAntd = [
          ...(prevRow.uploadAntdList || []),
          { uid: String(Date.now()) + Math.random(), name: file.name, status: 'done' },
        ]
        return {
          ...prev,
          [record.key]: { ...prevRow, localFiles: nextFiles, uploadAntdList: nextAntd },
        }
      })
      return false // block network request; keep file locally
    },

    onRemove: (f) => {
      setRowDrafts((prev) => {
        const prevRow = prev[record.key] || {}
        const remainingAntd = (prevRow.uploadAntdList || []).filter((x) => x.uid !== f.uid)
        const remainingFiles = (prevRow.localFiles || []).filter((x) => x.name !== f.name)
        return {
          ...prev,
          [record.key]: { ...prevRow, uploadAntdList: remainingAntd, localFiles: remainingFiles },
        }
      })
    },
  })

  const handleDownloadAttachments = async (record) => {
    const raw = String(record?.attachmentFilePaths || '').trim()
    if (!raw || raw.length === 0) {
      messageApi.warning('No attachments available.')
      return
    }

    const base = import.meta.env.VITE_API_URL || ''
    const paths = raw
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)

    if (!paths.length || paths.length === 0) {
      messageApi.warning('No attachments available.')
      return
    }

    try {
      dispatch(set({ loading: true }))

      const results = await Promise.allSettled(
        paths.map(async (p) => {
          const url = `${base}/${p}`

          // try fetch -> blob -> download
          const res = await fetch(url, { credentials: 'include' })
          if (!res.ok) throw new Error(`HTTP ${res?.status}`)
          const blob = await res.blob()

          const objUrl = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = objUrl
          const nameFromPath = p.split('/').pop() || 'attachment'
          a.download = nameFromPath
          document.body.appendChild(a)
          a.click()
          a.remove()
          // give the browser a beat before revoking
          setTimeout(() => window.URL.revokeObjectURL(objUrl), 1000)

          return { path: p }
        }),
      )

      const failed = results
        .map((r, i) => ({ r, p: paths[i] }))
        .filter(({ r }) => r.status === 'rejected')
        .map(({ p }) => p)

      if (failed.length === 0) {
        messageApi.success(`Downloaded ${paths.length} attachment${paths.length > 1 ? 's' : ''}.`)
      } else if (failed.length === paths.length) {
        messageApi.error('Failed to download all attachments.')
      } else {
        messageApi.warning(
          `Downloaded ${paths.length - failed.length}/${paths.length}. Failed: ${failed.join(', ')}`,
        )
      }
    } catch (e) {
      console.error(e)
      messageApi.error('Download failed.')
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  // --------- Draft setters ----------
  const getDraft = (key) => rowDrafts[key] || {}
  const setDraft = (key, patch) => {
    setRowDrafts((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), ...patch },
    }))
  }
  const handleAttendanceWaitingChange = (record, v) => {
    const num = v === null || v === undefined ? undefined : Number(v)
    if (Number.isNaN(num)) return
    setDraft(record.key, { attendanceWaiting: num })
  }
  const handleRemarkChange = (record, e) => {
    setDraft(record.key, { remark: e.target.value })
  }

  // ---------- Validation (mandatory for user submit and approver submit) ----------
  const validateMandatory = (record, forUserSubmit = false) => {
    const d = getDraft(record.key)
    const attendanceWaiting = d.attendanceWaiting ?? record.attendanceWaiting
    const remark = (d.remark ?? '').trim()
    const files = d.localFiles || []

    if (
      attendanceWaiting === undefined ||
      attendanceWaiting === null ||
      String(attendanceWaiting) === ''
    ) {
      messageApi.error('Attendance Waiting is mandatory')
      return false
    }
    if (!remark) {
      messageApi.error('Remarks are mandatory')
      return false
    }
    if (!files.length) {
      messageApi.error('At least one attachment is mandatory')
      return false
    }
    return { attendanceWaiting, remark, files }
  }

  // ---------- New: user submit (initial submission) ----------
  const submitUserEntry = async (record) => {
    // Validate mandatory fields (attendance waiting, remarks, attachments)
    const payload = validateMandatory(record, true)
    if (!payload) return

    try {
      // dispatch(set({ loading: true }))

      const newform = new FormData()
      newform.append('ECode', record?.ecode ?? '')
      newform.append('MonthYear', selectedMonth.format('MMM-YY')) // e.g., "Oct-25"
      const attendanceInt = Math.trunc(Number(payload.attendanceWaiting))
      newform.append('AttendanceCount', String(attendanceInt))

      newform.append('EmployeeRemarks', payload.remark)

      payload?.files?.forEach((file, idx) => {
        newform.append('Files', file)
      })
      return
      const res = await axiosInstance.post(
        '/api/EmpAttendance/attendance-count-approval',
        newform,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      )
      console.log('approval count api res:', res)

      if (res.status === 200) {
        messageApi.success(res?.data?.message || 'Submitted successfully.')
        // await decideAndFetch()
      } else {
        messageApi.error('Failed to submit')
      }
    } catch (e) {
      console.error('appval count api err:', e)
      messageApi.error(e?.response?.data?.message || 'Submission failed')
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  // ---------- Approver submit (unchanged; CM/RM flow) ----------
  const submitReview = async (record, action /* 'approve' | 'reject' */) => {
    if (!canActOnRow(record)) return
    const payload = validateMandatory(record)
    if (!payload) return

    try {
      dispatch(set({ loading: true }))
      const base = userLevel === 1 ? '/api/Attendance/cm-review' : '/api/Attendance/rm-review'
      const form = new FormData()
      form.append('ecode', record?.ecode || '')
      form.append('attendanceWaiting', String(payload.attendanceWaiting))
      form.append('remark', payload.remark)
      form.append('action', action)
      payload.files.forEach((file, idx) =>
        form.append('attachments', file, file.name || `file_${idx}`),
      )

      const res = await axiosInstance.post(base, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (res.status === 200) {
        messageApi.success(
          userLevel === 1
            ? action === 'approve'
              ? 'CM approved. Sent to RM/RHR.'
              : 'CM rejected.'
            : action === 'approve'
              ? 'RM/RHR approved.'
              : 'RM/RHR rejected.',
        )
        await decideAndFetch()
      } else {
        messageApi.error('Failed to submit review')
      }
    } catch (e) {
      console.error(e)
      messageApi.error('Submission failed')
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  const renderStatusTag = (value) => {
    const v = String(value ?? 'pending').toLowerCase()
    const color = STATUS_COLORS[v] || 'default'
    const label = v.charAt(0).toUpperCase() + v.slice(1)
    return <Tag color={color}>{label}</Tag>
  }

  const columns = [
    {
      title: 'Zone',
      dataIndex: 'zoneName',
      key: 'zoneName',
      width: 100,
      ellipsis: true,
      filteredValue: zoneFilterValues.length ? zoneFilterValues : null,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title={'Zone'}
          dataIndex={'zoneName'}
          dataList={zoneOptions}
          filterValues={zoneFilterValues}
          setFilterValues={setZoneFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Region',
      dataIndex: 'regionName',
      key: 'regionName',
      ellipsis: true,
      width: 150,
      filteredValue: regionFilterValues.length ? regionFilterValues : null,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title={'Region'}
          dataIndex={'regionName'}
          dataList={regionOptions}
          filterValues={regionFilterValues}
          setFilterValues={setRegionFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Cluster',
      dataIndex: 'clusterName',
      key: 'clusterName',
      ellipsis: true,
      width: 120,
      filteredValue: clusterFilterValues.length ? clusterFilterValues : null,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title={'Cluster'}
          dataIndex={'clusterName'}
          dataList={clusterOptions}
          filterValues={clusterFilterValues}
          setFilterValues={setClusterFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Store Code',
      dataIndex: 'stCode',
      key: 'stCode',
      ellipsis: true,
      width: 120,
      filteredValue: stCodeFilterValues.length ? stCodeFilterValues : null,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title={'Store Code'}
          dataIndex={'stCode'}
          dataList={stCodeOptions}
          filterValues={stCodeFilterValues}
          setFilterValues={setStCodeFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Store Name',
      dataIndex: 'locationName',
      key: 'locationName',
      ellipsis: true,
      width: 140,
      filteredValue: stNameFilterValues.length ? stNameFilterValues : null,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title={'Store Name'}
          dataIndex={'locationName'}
          dataList={stNameOptions}
          filterValues={stNameFilterValues}
          setFilterValues={setStNameFilterValues}
          confirm={confirm}
        />
      ),
    },
    { title: 'Emp code', dataIndex: 'ecode', key: 'ecode', ellipsis: true, width: 110 },
    { title: 'Emp Name', dataIndex: 'fullName', key: 'fullName', ellipsis: true, width: 160 },
    {
      title: 'Department',
      dataIndex: 'departmentName',
      key: 'departmentName',
      ellipsis: true,
      width: 150,
      filteredValue: departmentFilterValues.length ? departmentFilterValues : null,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title={'Department'}
          dataIndex={'departmentName'}
          dataList={deptOptions}
          filterValues={departmentFilterValues}
          setFilterValues={setDepartmentFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Designation',
      dataIndex: 'designationName',
      key: 'designationName',
      ellipsis: true,
      width: 150,
      filteredValue: designationFilterValues.length ? designationFilterValues : null,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title={'Designation'}
          dataIndex={'designationName'}
          dataList={desgOptions}
          filterValues={designationFilterValues}
          setFilterValues={setDesignationFilterValues}
          confirm={confirm}
        />
      ),
    },
    { title: 'Present', dataIndex: 'presentDays', key: 'presentDays', width: 80, ellipsis: true },
    { title: 'Absent', dataIndex: 'absentDays', key: 'absentDays', width: 80, ellipsis: true },
    { title: 'Leaves', dataIndex: 'leaveDays', key: 'leaveDays', width: 80, ellipsis: true },
    { title: 'Half Days', dataIndex: 'halfDays', key: 'halfDays', width: 100, ellipsis: true },
    {
      title: 'Regularization',
      dataIndex: 'regularisationDays',
      key: 'regularisationDays',
      key: 'regularisationDays',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Miss Punch',
      dataIndex: 'misPunchDays',
      key: 'misPunchDays',
      width: 110,
      ellipsis: true,
    },

    // -------------------- NEW COLUMNS START --------------------
    // {
    //   title: 'Attendance Waiting',
    //   dataIndex: 'attendanceWaiting',
    //   key: 'attendanceWaiting',
    //   width: 150,
    //   render: (_, record) => {
    //     const draft = getDraft(record.key)
    //     return (
    //       <InputNumber
    //         style={{ width: '100%' }}
    //         placeholder="0.00"
    //         stringMode
    //         step="0.01"
    //         value={draft.attendanceWaiting ?? record.attendanceWaiting}
    //         onChange={(v) => handleAttendanceWaitingChange(record, v)}
    //         disabled={
    //           record?.employeeRemarks !== null &&
    //           String(record?.employeeRemarks || '').trim() !== ''
    //         }
    //         onKeyDown={(e) => {
    //           const allowed = [
    //             'Backspace',
    //             'Delete',
    //             'ArrowLeft',
    //             'ArrowRight',
    //             'Tab',
    //             'Home',
    //             'End',
    //             '.',
    //           ]
    //           if (!/[0-9]/.test(e.key) && !allowed.includes(e.key)) e.preventDefault()
    //         }}
    //       />
    //     )
    //   },
    // },
    // {
    //   title: 'Attachments Upload',
    //   dataIndex: 'attachmentsUpload',
    //   key: 'attachmentsUpload',
    //   width: 200,
    //   render: (_, record) => {
    //     const draft = getDraft(record.key)
    //     const count = (draft.localFiles || []).length
    //     return (
    //       <div>
    //         <Upload
    //           {...uploadPropsForRow(record)}
    //           className="upload-compact"
    //           disabled={
    //             record?.employeeRemarks !== null &&
    //             String(record?.employeeRemarks || '').trim() !== ''
    //           }
    //         >
    //           <Button icon={<PaperClipOutlined />}>Upload</Button>
    //         </Upload>
    //         <div style={{ fontSize: 12, marginTop: 6 }}>
    //           Uploaded: <b>{count}</b>
    //         </div>
    //       </div>
    //     )
    //   },
    // },
    // {
    //   title: 'Attachment',
    //   dataIndex: 'attachmentsDownload',
    //   key: 'attachmentsDownload',
    //   width: 140,
    //   render: (_, record) => {
    //     const draft = getDraft(record.key)
    //     const files = draft.uploadServerFiles || record.uploadServerFiles || []
    //     if (!files.length) return <span style={{ color: '#999' }}>No attachment</span>
    //     return (
    //       <Button
    //         size="small"
    //         icon={<DownloadOutlined />}
    //         onClick={() => handleDownloadAttachments(record)}
    //       >
    //         Download
    //       </Button>
    //     )
    //   },
    // },
    // {
    //   title: 'Store Remarks',
    //   dataIndex: 'remark',
    //   key: 'remark',
    //   width: 240,
    //   render: (_, record) => {
    //     const draft = getDraft(record.key)
    //     const value = draft.remark ?? ''
    //     return (
    //       <Input.TextArea
    //         value={value}
    //         onChange={(e) => handleRemarkChange(record, e)}
    //         placeholder="Enter remarks (mandatory)"
    //         autoSize={{ minRows: 1, maxRows: 3 }}
    //         maxLength={500}
    //         showCount
    //         disabled={
    //           record?.employeeRemarks !== null &&
    //           String(record?.employeeRemarks || '').trim() !== ''
    //         }
    //       />
    //     )
    //   },
    // },
    // {
    //   title: 'Store Submit',
    //   dataIndex: 'userSubmit',
    //   key: 'userSubmit',
    //   width: 140,
    //   fixed: false,
    //   render: (_, record) => (
    //     <Button
    //       type="primary"
    //       onClick={() => submitUserEntry(record)}
    //       disabled={
    //         record?.employeeRemarks !== null && String(record?.employeeRemarks || '').trim() !== ''
    //       }
    //     >
    //       Submit
    //     </Button>
    //   ),
    // },
    // {
    //   title: 'Entered Remarks',
    //   dataIndex: 'employeeRemarks',
    //   key: 'employeeRemarks',
    //   width: 160,
    //   ellipsis: true,
    //   render: (val) => <span>{val || '-'}</span>,
    // },
    // {
    //   title: 'CM Status',
    //   dataIndex: 'cmStatus',
    //   key: 'cmStatus',
    //   width: 110,
    //   render: (val) => renderStatusTag(val),
    // },
    // {
    //   title: 'RM/RHR Status',
    //   dataIndex: 'rmStatus',
    //   key: 'rmStatus',
    //   width: 120,
    //   render: (val) => renderStatusTag(val),
    // },
    // {
    //   title: 'Final Attendance',
    //   dataIndex: 'finalAttendance',
    //   key: 'finalAttendance',
    //   width: 140,
    //   render: (val) => <b>{val ?? '-'}</b>,
    // },
    // {
    //   title: 'Submit (CM/RM)',
    //   dataIndex: 'actions',
    //   key: 'actions',
    //   width: 120,
    //   fixed: 'right',
    //   render: (_, record) => {
    //     const disabled = !canActOnRow(record) // approver-only actions
    //     return (
    //       <Space>
    //         <Tooltip
    //           title={
    //             userLevel === 1 ? 'CM Approve' : userLevel === 2 ? 'RM/RHR Approve' : 'Approve'
    //           }
    //         >
    //           <Button
    //             disabled={disabled}
    //             type="text"
    //             onClick={() => submitReview(record, 'approve')}
    //             icon={<CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 20 }} />}
    //           />
    //         </Tooltip>
    //         <Tooltip
    //           title={userLevel === 1 ? 'CM Reject' : userLevel === 2 ? 'RM/RHR Reject' : 'Reject'}
    //         >
    //           <Button
    //             disabled={disabled}
    //             type="text"
    //             onClick={() => submitReview(record, 'reject')}
    //             icon={<CloseCircleTwoTone twoToneColor="#ff4d4f" style={{ fontSize: 20 }} />}
    //           />
    //         </Tooltip>
    //       </Space>
    //     )
    //   },
    // },
    // -------------------- NEW COLUMNS END --------------------

    {
      title: 'Emp Status',
      dataIndex: 'empstatus',
      key: 'empstatus',
      ellipsis: true,
      render: (_, record) =>
        String(record?.resignationTypeName).toLowerCase().includes('abscond')
          ? 'Absconded'
          : record?.isActive
            ? 'Active'
            : 'Left',
      width: 100,
    },
    {
      title: 'View',
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="default"
          size="small"
          onClick={() => handleSelectEmpCode(record?.ecode, record?.fullName)}
        >
          <RightOutlined />
        </Button>
      ),
      width: 80,
    },
  ]

  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 80), 0)

  return (
    <>
      {contextHolder}
      <Pageheading
        title={`${lastName !== undefined && lastName !== null && lastName !== 'null' && String(lastName).trim() !== '' ? fullName : firstName} - Attendance`}
      />
      <CardInRow data={cardData} />
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'end',
          marginBottom: '10px',
          gap: '10px',
        }}
      >
        <DatePicker
          picker="month"
          allowClear
          value={selectedMonth}
          onChange={(value) => setSelectedMonth(value || dayjs())}
          format={'MMM YYYY'}
          style={{ width: '10rem' }}
        />

        <Button onClick={handleClearFilters}>Clear Filters</Button>
        <Button onClick={() => handleSelectEmpCode(ecode, fullName)}>My Attendance</Button>
        <Search
          allowClear
          value={search}
          onChange={handleSearchChange}
          style={{ width: '20rem', alignSelf: 'end' }}
          placeholder="Search in table"
        />
      </div>
      {!isMobile ? (
        <Table
          dataSource={displayData}
          columns={columns}
          scroll={{ x: Math.max(totalWidth, 1450), y: 'calc(100vh - 160px)' }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            pageSizeOptions: ['50', '100', '200'],
            onChange: (page, size) => {
              setCurrentPage(page)
              setPageSize(size)
            },
          }}
          rowKey={(r) => r.key}
          size="small"
        />
      ) : (
        <div style={{ padding: '0 8px' }}>
          {' '}
          {/* ADD PADDING TO CONTAINER */}
          {/* Header */}
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
                fontSize: 10,
              }}
            >
              <colgroup>
                <col style={{ width: '15%' }} /> {/* REDUCED from 20% */}
                <col style={{ width: '30%' }} /> {/* SAME */}
                <col style={{ width: '10%' }} /> {/* SAME */}
                <col style={{ width: '30%' }} /> {/* INCREASED from 25% */}
                <col style={{ width: '10%' }} /> {/* SAME */}
              </colgroup>
              <thead>
                <tr>
                  <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                    E-Code
                  </th>
                  <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                    Name
                  </th>
                  <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                    Present
                  </th>
                  <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                    Designation
                  </th>
                  <th style={{ padding: '10px 0px', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
            </table>
          </div>
          {/* Rows */}
          {displayData.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((record) => {
            const recordId = record.key
            const isExpanded = expandedCards[recordId]

            return (
              <div
                key={recordId}
                style={{ border: '1px solid #d9d9d9', borderTop: 'none', background: '#fff' }}
              >
                <table
                  style={{
                    width: '100%',
                    tableLayout: 'fixed',
                    borderCollapse: 'collapse',
                    fontSize: 10,
                  }}
                >
                  <colgroup>
                    <col style={{ width: '15%' }} /> {/* REDUCED from 20% */}
                    <col style={{ width: '30%' }} /> {/* SAME */}
                    <col style={{ width: '10%' }} /> {/* SAME */}
                    <col style={{ width: '30%' }} /> {/* INCREASED from 25% */}
                    <col style={{ width: '10%' }} /> {/* SAME */}
                  </colgroup>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                        {record?.ecode || '-'}
                      </td>
                      <td
                        style={{
                          padding: '8px 4px',
                          textAlign: 'center',
                          wordBreak: 'break-word',
                          whiteSpace: 'normal',
                          lineHeight: '1.3',
                          wordWrap: 'break-word', // Force wrap
                          lineHeight: '1.3',
                          fontSize: 10,
                        }}
                      >
                        {record?.fullName || '-'}
                      </td>
                      <td style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 600 }}>
                        {record?.presentDays || 0}
                      </td>
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
                        {record?.designationName || '-'}
                      </td>
                      <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                        <div
                          style={{
                            display: 'flex',
                            gap: 1, // Increased from 2 to 4
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Button
                            type="text"
                            size="small"
                            icon={<RightOutlined />}
                            onClick={() => handleSelectEmpCode(record?.ecode, record?.fullName)}
                            style={{
                              fontSize: 10, // Increased from '2px 4px'
                              // minWidth: 24, // Add minimum width
                              // height: 24, // Add fixed height
                            }}
                          />
                          <Button
                            type="text"
                            size="small"
                            icon={isExpanded ? <MinusOutlined /> : <PlusOutlined />}
                            onClick={() => handleToggleCard(recordId)}
                            style={{
                              fontSize: 12, // Increased from 10 to 12
                              padding: '4px 6px', // Increased from '2px 4px'
                              minWidth: 24, // Add minimum width
                              height: 24, // Add fixed height
                            }}
                          />
                        </div>
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
                      {/* Row 1 - 3 columns (Store info) */}
                      <Col span={8}>
                        <div
                          style={{
                            color: '#8c8c8c',
                            marginBottom: 2,
                            fontSize: 10,
                            textAlign: 'center',
                          }}
                        >
                          Store
                        </div>
                        <div
                          style={{
                            fontWeight: 500,
                            fontSize: 10,
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {record?.stCode} - {record?.locationName || '-'}
                        </div>
                      </Col>
                      <Col span={8}>
                        <div
                          style={{
                            color: '#8c8c8c',
                            marginBottom: 2,
                            fontSize: 10,
                            textAlign: 'center',
                          }}
                        >
                          Cluster
                        </div>
                        <div style={{ fontWeight: 500, fontSize: 10, textAlign: 'center' }}>
                          {record?.clusterName || '-'}
                        </div>
                      </Col>
                      <Col span={8}>
                        <div
                          style={{
                            color: '#8c8c8c',
                            marginBottom: 2,
                            fontSize: 10,
                            textAlign: 'center',
                          }}
                        >
                          Department
                        </div>
                        <div
                          style={{
                            fontWeight: 500,
                            fontSize: 10,
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {record?.departmentName || '-'}
                        </div>
                      </Col>

                      {/* Row 2 - 4 columns (Attendance Stats) */}
                      <Col span={6}>
                        <div
                          style={{
                            color: '#8c8c8c',
                            marginBottom: 2,
                            fontSize: 10,
                            textAlign: 'center',
                          }}
                        >
                          Absent
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 10, textAlign: 'center' }}>
                          {record?.absentDays || 0}
                        </div>
                      </Col>
                      <Col span={6}>
                        <div
                          style={{
                            color: '#8c8c8c',
                            marginBottom: 2,
                            fontSize: 10,
                            textAlign: 'center',
                          }}
                        >
                          Leaves
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 10, textAlign: 'center' }}>
                          {record?.leaveDays || 0}
                        </div>
                      </Col>
                      <Col span={6}>
                        <div
                          style={{
                            color: '#8c8c8c',
                            marginBottom: 2,
                            fontSize: 10,
                            textAlign: 'center',
                          }}
                        >
                          Half
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 10, textAlign: 'center' }}>
                          {record?.halfDays || 0}
                        </div>
                      </Col>
                      <Col span={6}>
                        <div
                          style={{
                            color: '#8c8c8c',
                            marginBottom: 2,
                            fontSize: 10,
                            textAlign: 'center',
                          }}
                        >
                          Miss
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 10, textAlign: 'center' }}>
                          {record?.misPunchDays || 0}
                        </div>
                      </Col>

                      {/* Row 3 - 4 columns (Zone, Region, Regularization, +1 more) */}
                      <Col span={6}>
                        <div
                          style={{
                            color: '#8c8c8c',
                            marginBottom: 2,
                            fontSize: 10,
                            textAlign: 'center',
                          }}
                        >
                          Zone
                        </div>
                        <div style={{ fontWeight: 500, fontSize: 10, textAlign: 'center' }}>
                          {record?.zoneName || '-'}
                        </div>
                      </Col>
                      <Col span={6}>
                        <div
                          style={{
                            color: '#8c8c8c',
                            marginBottom: 2,
                            fontSize: 10,
                            textAlign: 'center',
                          }}
                        >
                          Region
                        </div>
                        <div
                          style={{
                            fontWeight: 500,
                            fontSize: 10,
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {record?.regionName || '-'}
                        </div>
                      </Col>
                      <Col span={6}>
                        <div
                          style={{
                            color: '#8c8c8c',
                            marginBottom: 2,
                            fontSize: 10,
                            textAlign: 'center',
                          }}
                        >
                          Regular.
                        </div>
                        <div style={{ fontWeight: 500, fontSize: 10, textAlign: 'center' }}>
                          {record?.regularisationDays || 0}
                        </div>
                      </Col>
                      <Col span={6}>
                        <div
                          style={{
                            color: '#8c8c8c',
                            marginBottom: 2,
                            fontSize: 10,
                            textAlign: 'center',
                          }}
                        >
                          Status
                        </div>
                        <div style={{ fontWeight: 500, fontSize: 10, textAlign: 'center' }}>
                          {String(record?.resignationTypeName).toLowerCase().includes('abscond')
                            ? 'Absconded'
                            : record?.isActive
                              ? 'Active'
                              : 'Left'}
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}
              </div>
            )
          })}
          {/* Pagination */}
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
                {Math.min(currentPage * pageSize, displayData.length)} of {displayData.length} items
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
                  Page {currentPage} of {Math.ceil(displayData.length / pageSize)}
                </span>
                <Button
                  size="small"
                  disabled={currentPage >= Math.ceil(displayData.length / pageSize)}
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
  )
}

export default StoreTeamAttendance
