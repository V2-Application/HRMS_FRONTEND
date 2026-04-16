import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import {
  Select,
  DatePicker,
  Table,
  Badge,
  message,
  Spin,
  Button,
  Input,
  Row,
  Col,
  Statistic,
  Tag,
  Checkbox,
  Space,
  Card,
  Typography,
  Popover,
  Tooltip,
  Modal,
  Upload,
  Radio,
  Divider,
  Descriptions,
} from 'antd'
import dayjs from 'dayjs'
import AttendanceRequestModal from './AttendanceRequestModal'
import ExportAttendanceModal from './ExportAttendanceModal'
import {
  employeeAttandanceData,
  searchEmployeeDropdown,
  mygeofenceRequestStatusLists,
  getLocations,
  fetchLocationBasedEmployees,
} from '../../services/Services'
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../../redux/uiSlice'
import './Attendance.css'
import axiosInstance from '../../services/axiosInstance'
import {
  InfoCircleOutlined,
  CameraOutlined,
  UploadOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import useMediaQuery from '../../hooks/useMediaQuery'
import { punchKeyMap } from '../../VendorModule/constants'

const { MonthPicker, RangePicker } = DatePicker
const { Text } = Typography

/* --------------------- API error helper (ONLY MESSAGE, NO STATUS) --------------------- */
const getApiErrorMessage = (err, fallback = 'Request failed') => {
  const data = err?.response?.data

  const msg =
    data?.message ||
    data?.Message ||
    data?.error ||
    data?.Error ||
    data?.errorMessage ||
    data?.msg ||
    data?.detail ||
    data?.title ||
    (Array.isArray(data?.errors) ? data.errors.join(', ') : null) ||
    (typeof data === 'string' ? data : null)

  const fieldErrors =
    !msg && data?.errors && typeof data.errors === 'object'
      ? Object.values(data.errors).flat().filter(Boolean).join(', ')
      : ''

  return msg || fieldErrors || err?.message || fallback
}

/* --------------------- Filter Dropdown --------------------- */
const FilterDropdown = ({ dataList, filterValues, setFilterValues, confirm, title }) => {
  const [searchText, setSearchText] = useState('')
  const [selectedOptions, setSelectedOptions] = useState(filterValues || [])

  const filteredOptions = (dataList || [])
    .map((x) => (x ?? '').toString())
    .filter((item) => item.toLowerCase().includes(searchText.toLowerCase()))

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
          onChange={setSelectedOptions}
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
        <Button
          type="primary"
          size="small"
          onClick={() => {
            setFilterValues(selectedOptions)
            confirm()
          }}
        >
          Filter
        </Button>
        <Button
          size="small"
          onClick={() => {
            setSelectedOptions([])
            setFilterValues([])
            setSearchText('')
            confirm()
          }}
        >
          Reset
        </Button>
      </Space>
    </div>
  )
}

/* --------------------- Status helpers --------------------- */
const statusColors = {
  Present: 'green',
  'Manual Present': 'green',
  Absent: 'red',
  Leave: 'orange',
  'Half Day': 'blue',
  'Work From Home': 'purple',
  Holiday: 'cyan',
  'On Duty': 'magenta',
  'Quarter Day Absent': 'blue',
  default: 'gray',
}

const statusMap = {
  Present: 'P',
  Absent: 'A',
  'Half Day Absent': 'H',
  'Half Day Present': 'HP',
  Mispunch: 'MIS',
  'Manual Present': 'MP',
  'Weekly Off': 'WO',
  'Quarter Day Absent': 'QA',
}

const resolveApproverRemarkFromRow = (record) => {
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
    'remark',
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

/* -------- Total hours (frontend) helpers -------- */
const parseMinutesFromString = (val) => {
  if (val == null) return 0
  const str = String(val).trim()
  const m1 = str.match(/(\d+)\s*hours?\s*and\s*(\d+)\s*minutes?/i)
  if (m1) return Number(m1[1]) * 60 + Number(m1[2])
  const m2 = str.match(/^(\d{1,2}):(\d{1,2})$/)
  if (m2) return Number(m2[1]) * 60 + Number(m2[2])
  const n = Number(str)
  return Number.isFinite(n) ? n : 0
}

const getRowMinutes = (rec) => {
  if (typeof rec?.totalWorkingMinutes === 'number') return rec.totalWorkingMinutes
  if (rec?.totalWorkingMinutes != null) return parseMinutesFromString(rec.totalWorkingMinutes)
  if (rec?.totalWorkingHours != null) return parseMinutesFromString(rec.totalWorkingHours)
  if (rec?.punchIn && rec?.punchOut) {
    const inT = dayjs(rec.punchIn, 'HH:mm:ss')
    const outT = dayjs(rec.punchOut, 'HH:mm:ss')
    if (outT.isAfter(inT)) return outT.diff(inT, 'minute')
  }
  return 0
}

const computeMonthlyTotalMinutes = (list) =>
  Array.isArray(list) ? list.reduce((sum, r) => sum + getRowMinutes(r), 0) : 0

const formatHHmm = (mins) => {
  const h = Math.floor(mins / 60)
  const m = Math.max(0, mins % 60)
  const hh = String(h).padStart(2, '0')
  const mm = String(m).padStart(2, '0')
  return `${hh}:${mm}`
}

/** Reverse geocode latitude/longitude -> address (best-effort) */
const reverseGeocode = async (lat, lon) => {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse')
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('lat', String(lat))
    url.searchParams.set('lon', String(lon))
    url.searchParams.set('zoom', '18')
    url.searchParams.set('addressdetails', '1')
    const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`Reverse geocode failed: ${res.status}`)
    const json = await res.json()
    return json?.display_name || ''
  } catch {
    return ''
  }
}

/* --------------------- Permissions helpers --------------------- */
async function getPermissionState(name) {
  if (!('permissions' in navigator) || !navigator.permissions?.query) return null
  try {
    const status = await navigator.permissions.query({ name })
    return status.state
  } catch {
    return null
  }
}

async function getCameraPermissionState() {
  const cam = await getPermissionState('camera')
  if (cam) return cam
  const mic = await getPermissionState('microphone')
  return mic
}

function requestGeolocationOnce() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation not supported'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    })
  })
}

async function requestCameraOnce() {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera API not supported')
  return navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
}

function showHowToEnableModal(kind) {
  Modal.info({
    title: `Enable ${kind === 'camera' ? 'Camera' : 'Location'} Access`,
    width: 520,
    content: (
      <div style={{ lineHeight: 1.6 }}>
        <p>Your browser is blocking {kind}. Please enable it for this site and try again.</p>
        <ul style={{ paddingLeft: 18 }}>
          <li>
            <b>Chrome:</b> Click the lock icon in the address bar → <i>Site settings</i> → Allow{' '}
            {kind === 'camera' ? 'Camera' : 'Location'}.
          </li>
          <li>
            <b>Edge/Brave:</b> Similar steps to Chrome.
          </li>
          <li>
            <b>Firefox:</b> Use the permissions icon in the address bar → Allow.
          </li>
          <li>
            <b>Safari:</b> Settings → Safari → Websites →{' '}
            {kind === 'camera' ? 'Camera' : 'Location'} → Allow.
          </li>
        </ul>
        <p>Then come back and click “Try again”.</p>
      </div>
    ),
    okText: 'Got it',
  })
}
/* --------------------- Main Component --------------------- */
const AttendanceTableView = ({ actionsMap = {} }) => {
  const allEmployeesAllowed = ['master', 'hr', 'superadmin', 'it superadmin', 'retail hierarchy']
  const [ip, setIp] = useState('')
  const { ecode, firstName, role, employeeId, hasReports, storeCode } =
    useSelector((state) => state?.auth?.data) || {}
  const { selectedAttendanceEmpCode: empCodeObj } = useSelector((state) => state?.auth)
  const { isGeofenceEnabled } = useSelector((state) => state?.auth?.data || {})
  const dispatch = useDispatch()
  const is_HO_Or_Central = storeCode === 'RH01' || storeCode === 'RH02'

  const defaultECode = ecode
  const defaultName = firstName

  const [employees, setEmployees] = useState([])
  const [searchText, setSearchText] = useState('')
  const [selectedEmpCode, setSelectedEmpCode] = useState(defaultECode || null)
  const [selectedEmpName, setSelectedEmpName] = useState(defaultName || '')
  const [selectedEmpId, setSelectedEmpId] = useState(null)

  const [selectedMonth, setSelectedMonth] = useState(dayjs())
  const [tableSearch, setTableSearch] = useState('')
  const [apiType, setApiType] = useState('table')

  const [attendanceData, setAttendanceData] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setsearchLoading] = useState(false)
  const [expandedCards, setExpandedCards] = useState(() => ({
    [dayjs().format('YYYY-MM-DD')]: true,
  }))

  const [employeeDetail, setEmployeeDetail] = useState({
    ecode: defaultECode,
    fullName: defaultName,
    paycode: defaultECode,
    department: '-',
  })

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  const [attendanceDateFilterValues, setAttendanceDateFilterValues] = useState([])
  const [statusFilterValues, setStatusFilterValues] = useState([])
  const [punchInFilterValues, setPunchInFilterValues] = useState([])
  const [punchOutFilterValues, setPunchOutFilterValues] = useState([])
  const [dayFilterValues, setDayFilterValues] = useState([])
  const [empData, setEmpData] = useState([])

  const [clockInLoading] = useState(false)
  const [clockOutLoading] = useState(false)

  const [clockInInfo, setClockInInfo] = useState(null)
  const [clockOutInfo, setClockOutInfo] = useState(null)

  const [currentAddress, setCurrentAddress] = useState('')
  const [locError, setLocError] = useState('')

  const isMobile = useMediaQuery('(max-width: 767px)')

  const [gfOpenKey, setGfOpenKey] = useState(null)
  const [gfLoadingKey, setGfLoadingKey] = useState(null)
  const [gfDataMap, setGfDataMap] = useState({})

  const [camPermState, setCamPermState] = useState(null)
  const [geoPermState, setGeoPermState] = useState(null)
  const [showPermBanner, setShowPermBanner] = useState(false)

  // NEW: refresh range modal state
  const [refreshModalOpen, setRefreshModalOpen] = useState(false)
  const [refreshRange, setRefreshRange] = useState([
    dayjs().startOf('month'),
    dayjs().endOf('month'),
  ])
  const [refreshSubmitting, setRefreshSubmitting] = useState(false)

  // ✅ keeps "start pick" while calendar is open
  const [rangeDraft, setRangeDraft] = useState([])

  // ✅ max date allowed (selected month end OR today, whichever is earlier)
  const maxSelectableDate = useMemo(() => {
    const today = dayjs().endOf('day')
    if (!selectedMonth) return today
    const endOfSelectedMonth = selectedMonth.endOf('month').endOf('day')
    return endOfSelectedMonth.isAfter(today) ? today : endOfSelectedMonth
  }, [selectedMonth])
  const [selectedPunchRow, setSelectedPunchRow] = useState(null)
  console.log('actionsMap:', actionsMap)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('https://api64.ipify.org?format=json')
        const data = await res.json()
        setIp(data.ip)
      } catch {
        const res = await fetch('https://api.ipify.org?format=json')
        const data = await res.json()
        setIp(data.ip)
      }
    })()
  }, [])

  const handleToggleCard = (date) => {
    const formattedDate = dayjs(date).format('YYYY-MM-DD')
    setExpandedCards((prev) => ({ ...prev, [formattedDate]: !prev[formattedDate] }))
  }

  useEffect(() => {
    if (empCodeObj && typeof empCodeObj === 'object' && Object.keys(empCodeObj).length > 0) {
      setSelectedEmpCode(empCodeObj?.ecode)
      setSelectedEmpName(empCodeObj?.fullName)
    }
  }, [empCodeObj])

  useEffect(() => {
    if (searchText.length >= 2) {
      setsearchLoading(true)
      const debounceTimer = setTimeout(() => {
        ;(async () => {
          try {
            const res = await searchEmployeeDropdown(searchText)
            setEmployees(res?.data?.employees?.length ? res.data.employees : [])
          } catch {
            setEmployees([])
          } finally {
            setsearchLoading(false)
          }
        })()
      }, 800)
      return () => clearTimeout(debounceTimer)
    }
  }, [searchText])

  useEffect(() => {
    const detail = employees.find((emp) => emp.ecode === selectedEmpCode)
    if (detail) {
      setEmployeeDetail({ ...detail, paycode: detail?.ecode })
    } else {
      setEmployeeDetail({
        ecode: defaultECode,
        fullName: defaultName,
        paycode: defaultECode,
        department: '-',
      })
    }
  }, [selectedEmpCode, employees, defaultECode, defaultName])

  const allowedStoreCodes = [
    'RH02',
    'HO46',
    'HY01',
    'HX15',
    'HR24',
    'HR25',
    'HC05',
    'HX51',
    'HM42',
    'HR20',
    'HH20',
    'U113',
    'HP07',
  ]

  // NOTE: kept as-is (long list)
  const allowedEcodes = [
    'V15759',
    'V25541',
    'V2S292',
    'V2669',
    'V09157',
    'V12071',
    'V08591',
    'V30858',
    'V26553',
    'V00577',
    'V36231',
    'V36215',
    'V01668',
    'V03952',
    'V36217',
    'V30839',
    'V16380',
    'V2S176',
    'V2S1702',
    'V2S267',
    'V38638',
    'V09740',
    'V2S209',
    'V2S263',
    'V19992',

    'V29329',
    'V42282',
    'V17324',
    'V40072',
    'V37151',
    'V34978',
    'V29193',
    'V02450',
    'V13573',
    'V39880',
    'V30568',
    'V42095',
    'V32040',
    'V29601',
    'V21670',
    'V43453',
    'V29607',
    'V42096',
    'V31591',
    'V36054',
    'V42163',
    'V43016',
    'V30797',
    'V17283',
    'V31290',
    'V29501',
    'V30077',
    'V40053',
    'V27344',
    'V30569',
    'V42208',
    'V08695',
    'V43455',
    'V29530',
    'V28817',
    'V26308',
    'V30687',
    'V23898',
    'V42284',
    'V44059',
    'V33942',
    'V2S365',
    'V14156',
    'V41010',
    'V29157',
    'V41008',
    'V30349',
    'V26394',
    'V21320',
    'V18974',
    'V29203',
    'V32035',
    'V22163',
    'V42098',
    'V41834',
    'V14122',
    'V40025',
    'V30079',
    'V41835',
    'V28320',
    'V35561',
    'V08637',
    'V32047',
    'V14659',
    'V14805',
    'V10253',
    'V22216',
    'V29225',
    'V40091',
    'V14803',
    'V29726',
    'V42283',
    'V42409',
    'V41012',
    'V37936',
    'V22310',
    'V20698',
    'V12016',
    'V43017',
    'V41011',
    'V27693',
    'V29476',
    'V21006',
    'V09819',
    'V43452',
    'V35942',
    'V08605',
    'V29288',
    'V39881',
    'V16451',
    'V29606',
    'V40857',
    'V43454',
    'V41838',
    'V40090',
    'V29328',
    'V26711',
    'V33742',
    'V13959',
    'V16581',
    'V17212',
    'V14684',
    'V2S214',
    'V41833',
    'V25654',
    'V42162',
    'V08150',
    'V08696',
    'V10213',
    'V42842',
    'V15288',
    'V23901',
    'V25229',
    'V36785',
    'V34543',
    'V32031',
    'V30688',
    'V35579',
    'V39883',
    'V43451',
    'V35580',
    'V30078',
    'V37150',
    'V36064',
    'V44058',
    'V37149',
    'V34544',
    'V39882',
    'V37944',
    'V33944',
    'V37406',
    'V39879',
    'V34542',
    'V42281',
    'V42560',
    'V41836',
    'V42561',
    'V41832',
    'V41857',
    'V41858',
    'V42052',
    'V42639',
    'V43456',
    'V18224',
    'V02335',
    'V43441',
    'V15109',
    'V44127',
    'V44083',
    'V23574',
  ]
  const fetchReporteeData = async () => {
    try {
      dispatch(set({ loading: true }))
      const response = await axiosInstance.get(
        `/api/EmployeeNew/employeesbymanager?managerId=${employeeId}&pageNumber=1&pageSize=10000`,
      )
      if (response.status === 200) {
        const list =
          response.data?.employees
            ?.filter((d) => d?.isActive === true)
            ?.filter(
              (d) => Object.keys(empCodeObj ?? {})?.length > 0 && empCodeObj?.ecode !== d?.ecode,
            )
            ?.map((emp, index) => ({ ...emp, key: index })) || []
        setEmpData(list)
      } else {
        setEmpData([])
      }
    } catch (error) {
      console.error('Error fetching reportee data:', error)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchReporteeData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAttendance = useCallback(async () => {
    if (!selectedEmpCode || !selectedMonth) return
    await dispatch(set({ loading: true }))
    try {
      const body = {
        year: selectedMonth.year(),
        month: selectedMonth.month() + 1,
        eCode: selectedEmpCode,
      }
      const response = await employeeAttandanceData(body)
      if (response?.status === 200) {
        setAttendanceData(response.data || [])
      }
    } catch (error) {
      console.error('Attendance fetch error:', error)
      message.error('Could not load attendance data.')
    } finally {
      await dispatch(set({ loading: false }))
    }
  }, [selectedEmpCode, selectedMonth, dispatch])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance, empCodeObj, selectedEmpCode])

  // ✅ keep refresh range in sync with selected month, but cap future dates
  useEffect(() => {
    if (!selectedMonth) return
    const start = selectedMonth.startOf('month')
    const end = selectedMonth.endOf('month').endOf('day')
    setRefreshRange([start, end.isAfter(maxSelectableDate) ? maxSelectableDate : end])
  }, [selectedMonth, maxSelectableDate])

  useEffect(() => {
    ;(async () => {
      const geoState = await getPermissionState('geolocation')
      const camState = await getCameraPermissionState()
      setGeoPermState(geoState)
      setCamPermState(camState)
      setShowPermBanner(geoState === 'denied' || camState === 'denied')
    })()

    const onVis = async () => {
      if (document.visibilityState === 'visible') {
        const geoState = await getPermissionState('geolocation')
        const camState = await getCameraPermissionState()
        setGeoPermState(geoState)
        setCamPermState(camState)
        setShowPermBanner(geoState === 'denied' || camState === 'denied')
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  const refreshCurrentLocation = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setLocError('Geolocation is not supported by this browser.')
      return
    }
    try {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }),
      )
      const { latitude, longitude } = position.coords
      const address = await reverseGeocode(latitude, longitude)
      setCurrentAddress(address || '')
      setGeoPermState('granted')
    } catch (err) {
      const msg =
        err?.code === 1
          ? 'Location blocked. Please allow access.'
          : err?.message || 'Failed to fetch current location'
      setLocError(msg)
      const state = await getPermissionState('geolocation')
      setGeoPermState(state)
      setShowPermBanner(state === 'denied' || camPermState === 'denied')
      setCurrentAddress('')
    }
  }, [camPermState])

  useEffect(() => {
    refreshCurrentLocation()
    const id = setInterval(refreshCurrentLocation, 10 * 60 * 1000)
    return () => clearInterval(id)
  }, [refreshCurrentLocation])

  const presentCount = attendanceData.filter((rec) => rec.status === 'Present').length
  const manualpresentCount = attendanceData.filter((rec) => rec.status === 'Manual Present').length

  const monthlyTotalMinutes = computeMonthlyTotalMinutes(attendanceData)
  const totalHours = formatHHmm(monthlyTotalMinutes)

  const FULL_DAY_MINUTES = 8.5 * 60
  const HALF_DAY_MINUTES = 4.5 * 60

  const totalattendancecount = attendanceData.reduce((total, rec) => {
    const statusRaw = String(rec.status || '').trim()
    const status = statusRaw.toLowerCase()

    const isHolidayOrWeeklyOff =
      status === 'holiday' ||
      status === 'holiday' ||
      status === 'weekly off' ||
      status === 'weeklyoff'

    if (isHolidayOrWeeklyOff) {
      const mins = getRowMinutes(rec)

      if (mins <= 0) {
        return total
      }

      if (mins >= HALF_DAY_MINUTES && mins < FULL_DAY_MINUTES) {
        return total + 0.5
      }

      if (mins >= FULL_DAY_MINUTES) {
        return total + 1
      }

      return total
    }

    if (statusRaw === 'Present' || statusRaw === 'Manual Present') {
      return total + 1
    }

    if (
      statusRaw === 'Half Day Absent' ||
      statusRaw === 'Half Day Present' ||
      statusRaw === 'Half Day'
    ) {
      return total + 0.5
    }

    // Quarter day absent → 0.75
    if (status === 'quarter day absent') {
      return total + 0.75
    }

    if (statusRaw === 'Geofencing' || statusRaw === 'GF') {
      return total + 1
    }

    return total
  }, 0)

  const absentCount = attendanceData.filter((rec) => rec.status === 'Absent').length
  const leaveCount = attendanceData.filter((rec) => rec.status === 'On Leave').length
  const halfDayCount = attendanceData.filter(
    (rec) => rec.status === 'Half Day Absent' || rec.status === 'Half Day Present',
  ).length
  const HoliDay = attendanceData.filter(
    (rec) => rec.status === 'Holiday' || rec.status === 'HoliDay',
  ).length
  const geofenceCount = attendanceData.filter(
    (rec) =>
      String(rec.status || '')
        .trim()
        .toLowerCase() === 'geofencing' ||
      String(rec.status || '')
        .trim()
        .toLowerCase() === 'gf',
  ).length

  const quarterDayAbsentCount = attendanceData.filter(
    (rec) =>
      String(rec.status || '')
        .trim()
        .toLowerCase() === 'quarter day absent',
  ).length

  const locationSource = currentAddress || locError || ''

  const shortLocation = useMemo(() => {
    if (!locationSource) return ''
    const words = locationSource.split(' ')
    if (words.length <= 6) return locationSource
    return words.slice(0, 6).join(' ')
  }, [locationSource])

  const isLocationTruncated = useMemo(() => {
    if (!locationSource) return false
    return locationSource.split(' ').length > 6
  }, [locationSource])

  const weekoffcount = attendanceData.filter((rec) => rec.status === 'Weekly Off').length
  /* ========= Clock modal & camera ========= */
  const [clockModalOpen, setClockModalOpen] = useState(false)
  const [clockModalType, setClockModalType] = useState(null)
  const [uploadList, setUploadList] = useState([])
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const [submittingClock, setSubmittingClock] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraError, setCameraError] = useState('')
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedStcode, setSelectedStcode] = useState('') // ✅ NEW
  const [locEmployees, setLocEmployees] = useState([])
  const [selectedLocEmployees, setSelectedLocEmployees] = useState([])

  const isExactlyOneAttachment = useMemo(
    () => (capturedPhoto ? 1 : 0) + ((uploadList?.length ?? 0) > 0 ? 1 : 0) === 1,
    [capturedPhoto, uploadList],
  )

  const startCamera = async () => {
    try {
      setCameraError('')
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera API not supported in this browser.')
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCamPermState('granted')
    } catch (err) {
      setCameraError('Unable to access camera. Please allow access or check permissions.')
      const state = await getCameraPermissionState()
      setCamPermState(state)
      setShowPermBanner(geoPermState === 'denied' || state === 'denied')
      if (state === 'denied') showHowToEnableModal('camera')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause()
      } catch {}
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }

  const handleOpenClockModal = async (type) => {
    setClockModalType(type)
    setClockModalOpen(true)
    setCapturedPhoto(null)
    setUploadList([])
    setCameraError('')

    setTimeout(async () => {
      try {
        const state = await getCameraPermissionState()
        setCamPermState(state)
        if (state === 'granted' || state === 'prompt' || state === null) {
          await startCamera()
        } else if (state === 'denied') {
          setCameraError(
            'Camera access is blocked. Use "Restart Camera" or enable in site settings.',
          )
        }
      } catch {
        try {
          await startCamera()
        } catch {}
      }
    }, 80)
  }

  const handleCloseClockModal = () => {
    setClockModalOpen(false)
    stopCamera()
  }

  const handleCapturePhoto = () => {
    try {
      if ((uploadList?.length ?? 0) > 0) {
        message.error('Remove the uploaded file to capture a live photo instead.')
        return
      }
      const video = videoRef.current
      if (!video) return
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            message.error('Failed to capture photo.')
            return
          }
          let file
          try {
            file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' })
          } catch {
            file = blob
            file.name = `camera_${Date.now()}.jpg`
            file.type = 'image/jpeg'
          }
          setCapturedPhoto(file)
          message.success('Photo captured.')
        },
        'image/jpeg',
        0.92,
      )
    } catch {
      message.error('Failed to capture photo.')
    }
  }

  const removeCapturedPhoto = () => setCapturedPhoto(null)

  const onClockInClick = () => handleOpenClockModal('in')
  const onClockOutClick = () => handleOpenClockModal('out')

  const submitClock = async () => {
    if (!clockModalType) return
    if (!isExactlyOneAttachment) {
      message.error('Attach exactly one proof: either a live photo OR a single file.')
      return
    }

    const isIn = clockModalType === 'in'
    try {
      setSubmittingClock(true)
      if (!('geolocation' in navigator)) {
        message.error('Geolocation is not supported by this browser.')
        return
      }

      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }),
      )

      const { latitude, longitude } = position.coords
      const time = dayjs().format('YYYY-MM-DD HH:mm:ss')
      const address = await reverseGeocode(latitude, longitude)

      if (isIn) {
        setClockInInfo({ time, latitude, longitude, address })
        sessionStorage.setItem(
          'clockInData',
          JSON.stringify({ ecode: ecode ?? defaultECode, time, latitude, longitude, address }),
        )
      } else {
        setClockOutInfo({ time, latitude, longitude, address })
        sessionStorage.setItem(
          'clockOutData',
          JSON.stringify({ ecode: ecode ?? defaultECode, time, latitude, longitude, address }),
        )
      }

      const form = new FormData()
      form.append('EmployeeCode', ecode ?? defaultECode)
      form.append('Type', isIn ? '1' : '2')
      form.append('Lat', String(latitude))
      form.append('Lon', String(longitude))
      form.append('Device', ip || 'browser')
      form.append('Address', address)

      let fileToSend = null
      if (capturedPhoto) fileToSend = capturedPhoto
      else if ((uploadList?.length ?? 0) === 1) {
        const raw = uploadList[0].originFileObj || uploadList[0]
        if (raw instanceof File) fileToSend = raw
        else if (raw) {
          try {
            fileToSend = new File([raw], raw?.name || 'proof.jpg', {
              type: raw?.type || 'application/octet-stream',
            })
          } catch {
            fileToSend = raw
            fileToSend.name = raw?.name || 'proof.jpg'
            fileToSend.type = raw?.type || 'application/octet-stream'
          }
        }
      }
      if (!fileToSend) {
        message.error('Could not read the attachment to send.')
        return
      }
      form.append('Proof', fileToSend, fileToSend.name || 'proof.jpg')

      const res = await axiosInstance.post('/api/EmpAttendance/GeoLocationAttendance', form, {
        transformRequest: [(data) => data],
        withCredentials: true,
      })

      if (res?.status === 200) {
        message.success(
          res?.data?.message ||
            (isIn ? 'Clock In recorded successfully!' : 'Clock Out recorded successfully!'),
        )
        handleCloseClockModal()
      } else {
        message.error(res?.data?.message || `Failed to clock ${isIn ? 'in' : 'out'}`)
      }
    } catch (err) {
      message.error(
        getApiErrorMessage(err, `Failed to clock ${clockModalType === 'in' ? 'in' : 'out'}`),
      )
    } finally {
      setSubmittingClock(false)
    }
  }

  /* ---------------- GF: API integration on click ---------------- */
  const [clickingKey, setClickingKey] = useState(null)

  const shouldShowPopover = (record) => {
    const s = String(record?.status || '')
      .trim()
      .toLowerCase()
    return s === 'geofencing' || s === 'gf'
  }

  const getEmployeeIdForRow = (record) => {
    const raw = record?.employeeId ?? empCodeObj?.employeeId ?? employeeId
    if (raw == null) return undefined
    if (typeof raw === 'number') return raw
    if (typeof raw === 'string' && raw.trim() !== '' && !isNaN(Number(raw))) return Number(raw)
    if (typeof raw === 'object') {
      if (typeof raw.employeeId === 'number') return raw.employeeId
      if (typeof raw.id === 'number') return raw.id
      if (typeof raw.employeeId === 'string' && !isNaN(Number(raw.employeeId)))
        return Number(raw.employeeId)
    }
    return raw
  }

  const extractGFInfoFromResponse = (apiRes, type) => {
    const first = apiRes?.data?.[0]
    if (!first) return { info: null, remark: '' }
    const typeNum = type === 'in' ? 1 : 2
    const list = Array.isArray(first.details) ? first.details : []
    const filtered = list.filter((d) => d?.punchType === typeNum)
    filtered.sort((a, b) => new Date(b.punchTimeUtc) - new Date(a.punchTimeUtc))
    const best = filtered[0] || {}
    const info = {
      time: best?.punchTimeUtc ? dayjs(best.punchTimeUtc).format('YYYY-MM-DD HH:mm:ss') : '-',
      latitude: best?.latitude ?? '-',
      longitude: best?.longitude ?? '-',
      address: best?.address ?? first?.address ?? '-',
      date: first?.punchDate ? dayjs(first.punchDate).format('YYYY-MM-DD') : '-',
    }
    const remark = best?.remarks || first?.remarks || best?.statusName || ''
    return { info, remark }
  }

  const fetchGFAndOpen = async (record, type) => {
    try {
      const date = dayjs(record?.attendanceDate).format('YYYY-MM-DD')
      const key = `${date}-${type}`
      if (clickingKey === key) return
      setClickingKey(key)
      const empId = getEmployeeIdForRow(record)
      if (!empId || isNaN(Number(empId))) {
        message.error('Employee ID not available for this row.')
        setClickingKey(null)
        return
      }
      setGfOpenKey(key)
      setGfLoadingKey(key)
      const res = await mygeofenceRequestStatusLists(empId, date)
      if (res?.status === 200 && res?.data?.success) {
        const mapped = extractGFInfoFromResponse(res?.data, type)
        setGfDataMap((prev) => ({ ...prev, [key]: mapped }))
      } else {
        message.error(res?.data?.message || 'Failed to fetch geofence details')
      }
    } catch (err) {
      console.error('GF API error:', err)
      message.error(err?.response?.data?.message || 'Error fetching geofence details')
    } finally {
      setGfLoadingKey(null)
      setClickingKey(null)
    }
  }

  const ClockPopover = ({ title, info, remark }) => (
    <div style={{ width: 280 }}>
      <Card
        size="small"
        title={title}
        bordered={false}
        style={{ boxShadow: 'none' }}
        extra={
          <Popover
            trigger="click"
            placement="left"
            overlayInnerStyle={{ maxWidth: 320 }}
            content={
              <div style={{ maxWidth: 300 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Approver Remark</div>
                {remark && remark.trim() ? (
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{remark}</div>
                ) : (
                  <Text type="secondary">No remark available.</Text>
                )}
              </div>
            }
          >
            <Tooltip title="View approver remark">
              <Button
                type="text"
                shape="circle"
                aria-label="Approver remark"
                icon={<InfoCircleOutlined />}
              />
            </Tooltip>
          </Popover>
        }
      >
        {info ? (
          <div style={{ lineHeight: 1.6 }}>
            <div>
              <Text type="secondary">Date:</Text> {info.date || '-'}
            </div>
            <div>
              <Text type="secondary">Time:</Text> {info.time || '-'}
            </div>
            <div>
              <Text type="secondary">Latitude:</Text> {info.latitude}
            </div>
            <div>
              <Text type="secondary">Longitude:</Text> {info.longitude}
            </div>
            <div style={{ wordBreak: 'break-word' }}>
              <Text type="secondary">Address:</Text> {info.address || '-'}
            </div>
          </div>
        ) : (
          <Text type="secondary">No data available yet.</Text>
        )}
      </Card>
    </div>
  )

  const getPopoverContent = (record, type) => {
    const date = dayjs(record?.attendanceDate).format('YYYY-MM-DD')
    const key = `${date}-${type}`

    if (gfLoadingKey === key) {
      return (
        <div style={{ padding: 12 }}>
          <Spin size="small" /> <span style={{ marginLeft: 8 }}>Loading…</span>
        </div>
      )
    }

    const data = gfDataMap[key]
    const fallbackRemark = resolveApproverRemarkFromRow(record)
    return (
      <ClockPopover
        title={type === 'in' ? 'Last Clock In' : 'Last Clock Out'}
        info={data?.info || null}
        remark={data?.remark || fallbackRemark}
      />
    )
  }

  const fetchLocations = async () => {
    try {
      const response = await getLocations()
      if (response.status === 200) {
        setLocations(response.data?.data || [])
      }
    } catch (error) {
      message.error(error?.message?.data?.message || 'Error fetching location')
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  const punchesContent = (row) => {
    const punchKeys = Array.from({ length: 12 }, (_, i) => `punch${i + 1}`)

    const items = punchKeys
      .map((k) => {
        let raw = row?.[k]

        if ((raw === null || raw === undefined || raw === '') && k === 'punch1') raw = row?.punchIn
        if ((raw === null || raw === undefined || raw === '') && k === 'punch2') raw = row?.punchOut

        const val = raw
          ? dayjs(raw, 'HH:mm:ss', true).isValid()
            ? dayjs(raw, 'HH:mm:ss').format('hh:mm A')
            : String(raw)
          : '--'

        return { key: k, label: punchKeyMap[k], children: val }
      })
      .filter((key) => key.children !== '--')

    return (
      <Space style={{ display: 'flex', flexDirection: 'column' }}>
        <Typography.Text>
          {row?.attendanceDate ? String(row?.attendanceDate || '').split('T')[0] : '-'}
        </Typography.Text>
        <Descriptions size="small" bordered column={1} items={items} style={{ minWidth: 220 }} />
      </Space>
    )
  }

  /* ---------------- Table columns ---------------- */
  const columns = [
    {
      title: 'Date',
      dataIndex: 'attendanceDate',
      key: 'attendanceDate',
      width: 200,
      render: (d) => (d === null ? '-' : dayjs(d).format('YYYY-MM-DD')),
      sorter: (a, b) => dayjs(a.attendanceDate).unix() - dayjs(b.attendanceDate).unix(),
      defaultSortOrder: 'ascend',
      filteredValue: attendanceDateFilterValues.length ? attendanceDateFilterValues : null,
      onFilter: (value, record) =>
        attendanceDateFilterValues.includes(dayjs(record.attendanceDate).format('YYYY-MM-DD')),
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Date"
          dataList={[
            ...new Set(attendanceData.map((i) => dayjs(i.attendanceDate).format('YYYY-MM-DD'))),
          ]}
          filterValues={attendanceDateFilterValues}
          setFilterValues={setAttendanceDateFilterValues}
          confirm={confirm}
        />
      ),
      className: 'center-header',
    },
    {
      title: 'Day',
      dataIndex: 'attendanceDate',
      key: 'day',
      render: (date) => (date === null ? '-' : dayjs(date).format('dddd')),
      filteredValue: dayFilterValues.length ? dayFilterValues : null,
      onFilter: (value, record) =>
        dayFilterValues.includes(dayjs(record.attendanceDate).format('dddd')),
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Day"
          dataList={[...new Set(attendanceData.map((i) => dayjs(i.attendanceDate).format('dddd')))]}
          filterValues={dayFilterValues}
          setFilterValues={setDayFilterValues}
          confirm={confirm}
        />
      ),
      className: 'center-header',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => {
        const map = {
          Present: 'P',
          Absent: 'A',
          'Half Day Absent': 'HD',
          'Half Day Present': 'HP',
          Mispunch: 'MIS',
          'Manual Present': 'MP',
          'Weekly Off': 'WO',
          'Missed Punch': 'MIS',
          'On Leave': 'L',
          Geofencing: 'GF',
          GF: 'GF',
          HoliDay: 'HoliDay',
          'Quarter Day Absent': 'QA',
        }
        return <Badge color={statusColors[s] || statusColors.default} text={map[s] || s} />
      },
      filteredValue: statusFilterValues.length ? statusFilterValues : null,
      onFilter: (value, record) => statusFilterValues.includes(record.status),
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Status"
          dataList={[...new Set(attendanceData.map((i) => i.status))]}
          filterValues={statusFilterValues}
          setFilterValues={setStatusFilterValues}
          confirm={confirm}
        />
      ),
      className: 'center-header',
    },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    {
      title: 'Check-In',
      dataIndex: 'punchIn',
      key: 'punchIn',
      render: (t, record) => {
        const label = t ? dayjs(t, 'HH:mm:ss').format('hh:mm A') : '--'
        const canPopover = shouldShowPopover(record)
        const date = dayjs(record?.attendanceDate).format('YYYY-MM-DD')
        const key = `${date}-in`

        const inner = (
          <span
            onClick={() => {
              if (canPopover) fetchGFAndOpen(record, 'in')
            }}
            style={{
              cursor: canPopover ? 'pointer' : 'default',
              textDecoration: canPopover ? 'underline dotted' : 'none',
            }}
          >
            {label}
          </span>
        )

        return canPopover ? (
          <Popover
            trigger="click"
            open={gfOpenKey === key}
            onOpenChange={(open) => {
              if (open) fetchGFAndOpen(record, 'in')
              else setGfOpenKey(null)
            }}
            placement="right"
            content={getPopoverContent(record, 'in')}
          >
            {inner}
          </Popover>
        ) : (
          inner
        )
      },
      filteredValue: punchInFilterValues.length ? punchInFilterValues : null,
      onFilter: (value, record) => punchInFilterValues.includes(record.punchIn),
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Office-In"
          dataList={[...new Set(attendanceData.map((i) => i.punchIn))].filter(Boolean)}
          filterValues={punchInFilterValues}
          setFilterValues={setPunchInFilterValues}
          confirm={confirm}
        />
      ),
      className: 'center-header',
    },
    {
      title: 'Check-Out',
      dataIndex: 'punchOut',
      key: 'punchOut',
      render: (t, record) => {
        const canPopover = shouldShowPopover(record)
        const date = dayjs(record?.attendanceDate).format('YYYY-MM-DD')
        const key = `${date}-out`

        let label
        if (!record?.punchIn && !record?.punchOut) {
          label = '--'
        } else if (!record.punchIn || !record.punchOut) {
          label = (
            <Tag color="orange" style={{ margin: 0 }}>
              MIS
            </Tag>
          )
        } else {
          const inT = dayjs(record.punchIn, 'HH:mm:ss').format('HH:mm')
          const outT = dayjs(record.punchOut, 'HH:mm:ss').format('HH:mm')
          label = inT === outT ? '-' : dayjs(t, 'HH:mm:ss').format('hh:mm A')
        }

        const inner = (
          <span
            onClick={() => {
              if (canPopover) fetchGFAndOpen(record, 'out')
            }}
            style={{
              cursor: canPopover ? 'pointer' : 'default',
              textDecoration: canPopover && typeof label === 'string' ? 'underline dotted' : 'none',
            }}
          >
            {label}
          </span>
        )

        return canPopover ? (
          <Popover
            trigger="click"
            open={gfOpenKey === key}
            onOpenChange={(open) => {
              if (open) fetchGFAndOpen(record, 'out')
              else setGfOpenKey(null)
            }}
            placement="right"
            content={getPopoverContent(record, 'out')}
          >
            {inner}
          </Popover>
        ) : (
          inner
        )
      },
      filteredValue: punchOutFilterValues.length ? punchOutFilterValues : null,
      onFilter: (value, record) => punchOutFilterValues.includes(record.punchOut),
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Check-Out"
          dataList={[...new Set(attendanceData.map((i) => i.punchOut))].filter(Boolean)}
          filterValues={punchOutFilterValues}
          setFilterValues={setPunchOutFilterValues}
          confirm={confirm}
        />
      ),
      className: 'center-header',
    },
    {
      title: 'Valid Punches',
      dataIndex: 'validPunchCount',
      key: 'validPunchCount',
      className: 'center-header',
      render: (noOfPunches, row) => {
        const isPunchesMoreThan4 = Number(noOfPunches) > 0
        return (
          <Space>
            {noOfPunches}
            {!is_HO_Or_Central && isPunchesMoreThan4 ? (
              <span>
                <Popover trigger={'hover'} content={() => punchesContent(row)}>
                  <InfoCircleOutlined style={{ color: 'blue', cursor: 'pointer' }} />
                </Popover>
              </span>
            ) : null}
          </Space>
        )
      },
    },
    {
      title: 'Late',
      dataIndex: 'lateMinutes',
      key: 'lateMinutes',
      render: (v) => <Tag color="red">{v} min</Tag>,
      className: 'center-header',
    },
    {
      title: 'Early',
      dataIndex: 'earlyMinutes',
      key: 'earlyMinutes',
      render: (v) => <Tag color="green">{v} min</Tag>,
      className: 'center-header',
    },
    {
      title: 'Total Hours (HH:mm)',
      dataIndex: 'totalWorkingMinutes',
      key: 'hrs',
      width: 180,
      ellipsis: true,
      render: (h) => {
        if (typeof h === 'string' && h.includes('-')) return <span>0 hrs</span>
        return <span>{String(h).replace(' hours and ', ':').replace(' minutes', '')}</span>
      },
      className: 'center-header',
    },
  ]

  const filteredData = attendanceData.filter((item) => {
    const sText = statusMap[item.status] || item.status || ''
    let totalHoursText = '0 hrs'
    if (item.totalWorkingHours && !item.totalWorkingHours.includes('-')) {
      const [hours, minutes] = item.totalWorkingHours.split(':').map(Number)
      if (!isNaN(hours) && !isNaN(minutes))
        totalHoursText = `${(hours + minutes / 60).toFixed(2)} hrs`
    }
    const text = `
      ${dayjs(item.attendanceDate).format('YYYY-MM-DD')}
      ${dayjs(item.attendanceDate).format('dddd')}
      ${sText}
      ${item.punchIn ? dayjs(item.punchIn, 'HH:mm:ss').format('hh:mm A') : ''}
      ${
        item.punchOut && item.punchIn !== item.punchOut
          ? dayjs(item.punchOut, 'HH:mm:ss').format('hh:mm A')
          : ''
      }
      ${totalHoursText}
    `
    return text.toLowerCase().includes(tableSearch.trim().toLowerCase())
  })

  /* -------- Refresh range handlers -------- */
  const handleOpenRefreshModal = () => {
    if (!selectedMonth) {
      message.warning('Please select a month first.')
      return
    }
    const start = selectedMonth.startOf('month')
    const end = selectedMonth.endOf('month').endOf('day')
    setRefreshRange([start, end.isAfter(maxSelectableDate) ? maxSelectableDate : end])
    setRangeDraft([])
    setRefreshModalOpen(true)
  }

  // ✅ FIXED SUBMIT (full)
  async function handleRefreshSubmit() {
    try {
      if (!refreshRange || refreshRange.length !== 2 || !refreshRange[0] || !refreshRange[1]) {
        message.error('Please select a valid date range.')
        return
      }

      const [from, to] = refreshRange

      // ✅ enforce same month + same year
      if (from.month() !== to.month() || from.year() !== to.year()) {
        message.error('Start date and end date must be in the same month and year.')
        return
      }

      // ✅ no future dates
      if (to.isAfter(dayjs().endOf('day'), 'day')) {
        message.error('Future dates are not allowed.')
        return
      }

      const ecodeToSend =
        typeof selectedEmpCode === 'object' ? selectedEmpCode?.value : selectedEmpCode

      setRefreshSubmitting(true)

      let payload
      let res

      // 1) STORE-based refresh
      if (selectedLocEmployees.length > 0) {
        if (!selectedStcode) {
          message.error('Store code (stcode) not available. Please re-select store.')
          return
        }

        payload = {
          mode: apiType,
          stcode: selectedStcode,
          ecodes: selectedLocEmployees,
          fromDate: `${from.format('YYYY-MM-DD')}T00:00:00.000Z`,
          toDate: `${to.format('YYYY-MM-DD')}T00:00:00.000Z`,
        }

        res = await axiosInstance.post(
          '/api/EmpAttendance/refreshattendanceemployeebasedonecodelist',
          payload,
        )
      } else {
        // store selected but no employees selected
        if (selectedLocation && selectedLocation.length > 0 && selectedLocEmployees.length === 0) {
          message.error('Please select at least one employee for the selected location.')
          return
        }

        if (!ecodeToSend) {
          message.error('Please select an employee (ecode) first.')
          return
        }

        payload = {
          fromDate: `${from.format('YYYY-MM-DD')}T00:00:00.000Z`,
          toDate: `${to.format('YYYY-MM-DD')}T00:00:00.000Z`,
          ecode: String(ecodeToSend),
        }

        res =
          apiType === 'machine'
            ? await axiosInstance.get(
                `/api/EmpAttendance/refreshmultipunchattendacebyecode?fromDate=${from.format(
                  'YYYY-MM-DD',
                )}&toDate=${to.format('YYYY-MM-DD')}&ecode=${encodeURIComponent(String(ecodeToSend))}`,
              )
            : apiType === 'table'
              ? await axiosInstance.post('/api/EmpAttendance/merge-monthly-punches-range', payload)
              : null
      }

      if (res?.status === 200) {
        message.success(res?.data?.message || 'Attendance refreshed successfully.')
        setRefreshModalOpen(false)

        setSelectedLocation('')
        setSelectedStcode('')
        setLocEmployees([])
        setSelectedLocEmployees([])

        fetchAttendance()
      } else {
        message.error(res?.data?.message || 'Failed to refresh attendance.')
      }
    } catch (err) {
      message.error(
        err?.response?.data?.message || 'Error while refreshing attendance for the selected range.',
      )
    } finally {
      setRefreshSubmitting(false)
    }
  }

  // ✅ FIXED: handle clear + storeCode extraction
  const handleLocationChange = async (value) => {
    if (!value || value === 'None' || value === '') {
      setSelectedLocation('')
      setSelectedStcode('')
      setLocEmployees([])
      setSelectedLocEmployees([])
      return
    }

    setSelectedLocation(value)

    const formattedStoreCode = String(value).split('-')[0]
    setSelectedStcode(formattedStoreCode)

    const fd = new FormData()
    fd.append('stcode', formattedStoreCode)

    try {
      const response = await fetchLocationBasedEmployees(fd)

      if (response.status === 200) {
        setLocEmployees(response.data?.data || [])
        setSelectedLocEmployees([])
      } else {
        setLocEmployees([])
        setSelectedLocEmployees([])
      }
    } catch (error) {
      console.error('error fetching location based employees:', error)
      const errMsg = error?.response?.data?.message || 'Failed to fetch employees'
      message.error(errMsg)
      setLocEmployees([])
      setSelectedLocEmployees([])
    }
  }

  return (
    <div style={{ gap: 4, flexWrap: 'wrap', padding: 8 }}>
      <div style={{ whiteSpace: 'nowrap', width: '100%', paddingBottom: 5 }}>
        <Row gutter={[12, 8]} style={{ marginBottom: '15px' }}>
          <Col xs={12} sm={12} md={8} lg={3} xl={3}>
            <Statistic
              title="Hours Worked"
              value={`${totalHours} (HH:mm)` || '-'}
              valueStyle={{ fontSize: '12px' }}
            />
          </Col>

          <Col xs={12} sm={12} md={8} lg={3} xl={3}>
            <Statistic
              title={<span style={{ color: '#000', fontWeight: 600 }}>Total Attendance</span>}
              value={totalattendancecount || '-'}
              valueStyle={{ fontSize: '12px', color: '#000', fontWeight: 700 }}
            />
          </Col>

          <Col xs={12} sm={8} md={6} lg={2} xl={2}>
            <Statistic title="P" value={presentCount || '-'} valueStyle={{ fontSize: '12px' }} />
          </Col>

          <Col xs={12} sm={8} md={6} lg={2} xl={2}>
            <Statistic
              title="MP"
              value={manualpresentCount || '-'}
              valueStyle={{ fontSize: '12px' }}
            />
          </Col>

          <Col xs={12} sm={8} md={6} lg={2} xl={2}>
            <Statistic title="A" value={absentCount || '-'} valueStyle={{ fontSize: '12px' }} />
          </Col>

          <Col xs={12} sm={8} md={6} lg={2} xl={2}>
            <Statistic title="HD" value={halfDayCount || '-'} valueStyle={{ fontSize: '12px' }} />
          </Col>

          <Col xs={12} sm={8} md={6} lg={2} xl={2}>
            <Statistic title="Holiday" value={HoliDay || '-'} valueStyle={{ fontSize: '12px' }} />
          </Col>

          <Col xs={12} sm={8} md={6} lg={2} xl={2}>
            <Statistic title="GF" value={geofenceCount || '-'} valueStyle={{ fontSize: '12px' }} />
          </Col>

          <Col xs={12} sm={8} md={6} lg={2} xl={2}>
            <Statistic
              title="QA"
              value={quarterDayAbsentCount || '-'}
              valueStyle={{ fontSize: '12px' }}
            />
          </Col>
        </Row>
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          gap: 16,
          marginBottom: 8,
        }}
      >
        {/* LEFT: Employee selector + Month */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* {role !== 'Employee' || hasReports === true ? (
            // allEmployeesAllowed.includes(String(role).toLowerCase())
            actionsMap?.allemployeesallowed?.actionStatus ? (
              <Select
                showSearch
                style={{ minWidth: 250 }}
                placeholder="Select Employee"
                value={
                  selectedEmpCode ? { value: selectedEmpCode, label: selectedEmpName } : undefined
                }
                onChange={(val) => {
                  // ✅ FIXED: allowClear can pass null/undefined
                  if (!val) {
                    setSelectedEmpCode(null)
                    setSelectedEmpName('')
                    return
                  }
                  setSelectedEmpCode(val?.value || null)
                  setSelectedEmpName(val?.label || '')
                  // setSelectedEmpId(val?.)
                }}
                onSearch={setSearchText}
                filterOption={false}
                allowClear
                loading={loading || searchLoading}
                notFoundContent={searchLoading ? <Spin size="small" /> : 'No employees found'}
                labelInValue
              >
                {(() => {
                  const selectedInList = employees.some((emp) => emp.ecode === selectedEmpCode)
                  const filteredEmployees = employees.filter((emp) => emp.ecode !== selectedEmpCode)
                  return [
                    !selectedInList && selectedEmpCode && (
                      <Select.Option key={selectedEmpCode} value={selectedEmpCode}>
                        {empCodeObj && Object.keys(empCodeObj).length > 0
                          ? `${empCodeObj?.ecode} - ${empCodeObj?.fullName}`
                          : `${defaultECode} - ${defaultName}`}
                      </Select.Option>
                    ),
                    ...filteredEmployees.map((emp) => (
                      <Select.Option key={emp.ecode} value={emp.ecode}>
                        {`${emp.ecode} - ${emp.fullName}`}
                      </Select.Option>
                    )),
                  ]
                })()}
              </Select>
            ) : (
              <Select
                style={{ width: 250 }}
                placeholder="Select Employee"
                showSearch
                value={selectedEmpCode}
                onChange={setSelectedEmpCode}
                onSearch={setSearchText}
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
                allowClear
              >
                {empCodeObj !== null && empCodeObj?.ecode !== defaultECode && (
                  <Select.Option
                    value={defaultECode}
                  >{`${defaultECode} - ${defaultName}`}</Select.Option>
                )}
                {empCodeObj && (
                  <Select.Option value={empCodeObj?.ecode}>
                    {`${empCodeObj?.ecode} - ${empCodeObj?.fullName}`}
                  </Select.Option>
                )}
                {empData.map((emp) => (
                  <Select.Option key={emp.ecode} value={emp.ecode}>
                    {`${emp?.ecode} - ${emp?.fullName}`}
                  </Select.Option>
                ))}
              </Select>
            )
          ) : (
            <div
              style={{
                minWidth: 320,
                padding: '6px 11px',
                border: '1px solid #d9d9d9',
                borderRadius: 6,
                backgroundColor: '#f5f5f5',
              }}
            >
              {`${defaultECode} - ${defaultName}`}
            </div>
          )} */}

          {actionsMap?.allemployeesallowed?.actionStatus ? (
            <Select
              showSearch
              style={{ minWidth: 250 }}
              placeholder="Select Employee"
              value={
                selectedEmpCode ? { value: selectedEmpCode, label: selectedEmpName } : undefined
              }
              onChange={(val) => {
                // ✅ FIXED: allowClear can pass null/undefined
                if (!val) {
                  setSelectedEmpCode(null)
                  setSelectedEmpName('')
                  return
                }
                setSelectedEmpCode(val?.value || null)
                setSelectedEmpName(val?.label || '')
                // setSelectedEmpId(val?.)
              }}
              onSearch={setSearchText}
              filterOption={false}
              allowClear
              loading={loading || searchLoading}
              notFoundContent={searchLoading ? <Spin size="small" /> : 'No employees found'}
              labelInValue
            >
              {(() => {
                const selectedInList = employees.some((emp) => emp.ecode === selectedEmpCode)
                const filteredEmployees = employees.filter((emp) => emp.ecode !== selectedEmpCode)
                return [
                  !selectedInList && selectedEmpCode && (
                    <Select.Option key={selectedEmpCode} value={selectedEmpCode}>
                      {empCodeObj && Object.keys(empCodeObj).length > 0
                        ? `${empCodeObj?.ecode} - ${empCodeObj?.fullName}`
                        : `${defaultECode} - ${defaultName}`}
                    </Select.Option>
                  ),
                  ...filteredEmployees.map((emp) => (
                    <Select.Option key={emp.ecode} value={emp.ecode}>
                      {`${emp.ecode} - ${emp.fullName}`}
                    </Select.Option>
                  )),
                ]
              })()}
            </Select>
          ) : hasReports ? (
            <Select
              style={{ width: 250 }}
              placeholder="Select Employee"
              showSearch
              value={selectedEmpCode}
              onChange={setSelectedEmpCode}
              onSearch={setSearchText}
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
              allowClear
            >
              {empCodeObj !== null && empCodeObj?.ecode !== defaultECode && (
                <Select.Option
                  value={defaultECode}
                >{`${defaultECode} - ${defaultName}`}</Select.Option>
              )}
              {empCodeObj && (
                <Select.Option value={empCodeObj?.ecode}>
                  {`${empCodeObj?.ecode} - ${empCodeObj?.fullName}`}
                </Select.Option>
              )}
              {empData.map((emp) => (
                <Select.Option key={emp.ecode} value={emp.ecode}>
                  {`${emp?.ecode} - ${emp?.fullName}`}
                </Select.Option>
              ))}
            </Select>
          ) : (
            <div
              style={{
                minWidth: 320,
                padding: '6px 11px',
                border: '1px solid #d9d9d9',
                borderRadius: 6,
                backgroundColor: '#f5f5f5',
              }}
            >
              {`${defaultECode} - ${defaultName}`}
            </div>
          )}

          <MonthPicker
            value={selectedMonth}
            onChange={setSelectedMonth}
            format="YYYY-MM"
            placeholder="Select month"
            disabledDate={(current) => current && current.isAfter(dayjs(), 'month')}
          />
        </div>

        {/* RIGHT SIDE: action buttons + refresh */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <>
            <Button
              type="primary"
              onClick={onClockInClick}
              style={{ marginRight: 8 }}
              loading={clockInLoading || submittingClock}
            >
              Clock In
            </Button>
            <Button
              type="primary"
              onClick={onClockOutClick}
              style={{ marginRight: 8 }}
              loading={submittingClock}
            >
              Clock Out
            </Button>
          </>
          {actionsMap?.export?.actionStatus && (
            <Button onClick={() => setIsExportModalOpen(true)} style={{ marginRight: 8 }}>
              Export
            </Button>
          )}
          {actionsMap?.regularize?.actionStatus && (
            <Button onClick={() => setIsRequestModalOpen(true)}>Regularize</Button>
          )}

          {actionsMap?.refetch?.actionStatus && (
            <Tooltip title="Refresh by date range (previous months + selected month, no future)">
              <Button icon={<ReloadOutlined />} onClick={handleOpenRefreshModal} />
            </Tooltip>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
        </div>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 10 }}>
          {[...filteredData]
            .sort((a, b) => dayjs(a.attendanceDate).unix() - dayjs(b.attendanceDate).unix())
            .map((record, index) => (
              <Card
                key={record.attendanceDate}
                size="small"
                style={{
                  borderRadius: index === filteredData.length - 1 ? '0 0 8px 8px' : 0,
                  marginBottom: 0,
                  border: 'none',
                  borderBottom: '1px solid #f0f0f0',
                }}
                bodyStyle={{ padding: 0 }}
              >
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 600 }}>
                    {dayjs(record.attendanceDate).format('YYYY-MM-DD (dddd)')}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <Badge
                      color={statusColors[record.status] || statusColors.default}
                      text={statusMap[record.status] || record.status}
                    />
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 12 }}>
                    <div>
                      In:{' '}
                      {record.punchIn ? dayjs(record.punchIn, 'HH:mm:ss').format('hh:mm A') : '--'}
                    </div>
                    <div>
                      Out:{' '}
                      {(() => {
                        if (!record?.punchIn && !record?.punchOut) return '--'
                        if (!record.punchIn || !record.punchOut) return 'MIS'
                        const inT = dayjs(record.punchIn, 'HH:mm:ss').format('HH:mm')
                        const outT = dayjs(record.punchOut, 'HH:mm:ss').format('HH:mm')
                        return inT === outT
                          ? '-'
                          : dayjs(record.punchOut, 'HH:mm:ss').format('hh:mm A')
                      })()}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="attendanceDate"
          pagination={false}
          size="small"
          style={{ fontSize: '12px', marginTop: 10 }}
          scroll={{ x: 'max-content' }}
          rowClassName={() => 'dark-row'}
          className="strong-ui-table"
          bordered
        />
      )}

      {/* ======= Refresh range modal ======= */}
      <Modal
        width={'50rem'}
        title="Refresh Attendance by Range"
        open={refreshModalOpen}
        onCancel={() => {
          setRefreshModalOpen(false)
          setRangeDraft([])
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setRefreshModalOpen(false)
              setRangeDraft([])
            }}
            disabled={refreshSubmitting}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleRefreshSubmit}
            loading={refreshSubmitting}
          >
            Submit
          </Button>,
        ]}
        destroyOnClose
      >
        {actionsMap?.storeattendance?.actionStatus && (
          <React.Fragment>
            <Col span={24}>
              <label>Store Code:</label>
              <Select
                style={{ width: '100%' }}
                placeholder="Select store code"
                showSearch
                optionFilterProp="children"
                allowClear
                value={selectedLocation || ''}
                onChange={handleLocationChange}
              >
                <Select.Option value="">None</Select.Option>
                {locations.map((loc) => (
                  <Select.Option key={loc?.locationName} value={loc?.locationName}>
                    {loc?.locationName}
                  </Select.Option>
                ))}
              </Select>
            </Col>

            <Col span={24} style={{ marginBlock: '0.6rem' }}>
              <label>Employees (select store first)</label>
              <Select
                style={{ width: '100%' }}
                placeholder="Select employees for selected store"
                mode="multiple"
                showSearch
                allowClear
                optionFilterProp="children"
                value={selectedLocEmployees}
                maxTagCount={6}
                maxTagPlaceholder={(omitted) => `+${omitted.length} more`}
                onChange={(val) => setSelectedLocEmployees(val)}
                dropdownRender={(menu) => {
                  const allEcodes = (locEmployees || []).map((e) => e?.ecode).filter(Boolean)
                  const isAllSelected =
                    allEcodes.length > 0 && (selectedLocEmployees || []).length === allEcodes.length
                  const isIndeterminate =
                    (selectedLocEmployees || []).length > 0 &&
                    (selectedLocEmployees || []).length < allEcodes.length

                  return (
                    <>
                      <div style={{ padding: 8 }}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Checkbox
                            indeterminate={isIndeterminate}
                            checked={isAllSelected}
                            onChange={(e) =>
                              setSelectedLocEmployees(e.target.checked ? allEcodes : [])
                            }
                          >
                            Select all ({allEcodes.length})
                          </Checkbox>

                          <Button size="small" onClick={() => setSelectedLocEmployees([])}>
                            Clear
                          </Button>
                        </Space>
                      </div>
                      <Divider style={{ margin: 0 }} />
                      {menu}
                    </>
                  )
                }}
              >
                {locEmployees.map((emp) => (
                  <Select.Option key={emp?.ecode} value={emp?.ecode}>
                    {`${emp?.stcode || '-'} - ${emp?.ecode || '-'} - ${emp?.fulL_NAME}`}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </React.Fragment>
        )}

        <Space direction="vertical" size={12}>
          {actionsMap?.apitype?.actionStatus && (
            <Radio.Group value={apiType} onChange={(e) => setApiType(e.target.value)}>
              <Radio value={'table'}>Table</Radio>
              <Radio value={'machine'}>Machine</Radio>
            </Radio.Group>
          )}

          <div style={{ fontWeight: 500 }}>
            Select date range (Start & End must be SAME month + SAME year, no future)
          </div>

          <RangePicker
            value={refreshRange}
            format="YYYY-MM-DD"
            onOpenChange={(open) => {
              if (open) setRangeDraft([])
            }}
            onCalendarChange={(vals) => {
              const start = vals?.[0]
              const end = vals?.[1]
              if (start && !end) setRangeDraft(vals || [])
              else setRangeDraft([])
            }}
            onChange={(vals) => {
              setRefreshRange(vals || [])
              setRangeDraft([])
            }}
            disabledDate={(current) => {
              if (!current) return false
              if (current.isAfter(dayjs().endOf('day'), 'day')) return true
              const start = rangeDraft?.[0]
              if (start) {
                const sameMonth = current.month() === start.month()
                const sameYear = current.year() === start.year()
                return !(sameMonth && sameYear)
              }
              return false
            }}
          />

          <Text type="secondary">
            Month: {selectedMonth ? selectedMonth.format('YYYY-MM') : '-'}
          </Text>
        </Space>
      </Modal>

      <AttendanceRequestModal
        isAttendanceRequestModalOpen={isRequestModalOpen}
        setIsAttendanceRequestModalOpen={setIsRequestModalOpen}
      />
      <ExportAttendanceModal
        isExportAttendanceModalOpen={isExportModalOpen}
        setIsExportAttendanceModalOpen={setIsExportModalOpen}
      />

      <Modal
        title={
          clockModalType === 'in' ? 'Clock In' : clockModalType === 'out' ? 'Clock Out' : 'Clock'
        }
        open={clockModalOpen}
        onCancel={handleCloseClockModal}
        footer={[
          <Button key="cancel" onClick={handleCloseClockModal} disabled={submittingClock}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={submitClock}
            loading={submittingClock}
            icon={<InfoCircleOutlined />}
            disabled={!isExactlyOneAttachment || submittingClock}
          >
            Submit
          </Button>,
        ]}
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Upload
              multiple={false}
              maxCount={1}
              fileList={uploadList}
              disabled={Boolean(capturedPhoto)}
              beforeUpload={(file) => {
                if (capturedPhoto) {
                  message.error('Remove the captured photo to upload a file instead.')
                  return Upload.LIST_IGNORE
                }
                setUploadList([file])
                return false
              }}
              onRemove={() => setUploadList([])}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              listType="picture"
            >
              {/* <Button icon={<UploadOutlined />} disabled={Boolean(capturedPhoto)}>
                Add file
              </Button> */}
            </Upload>
            {capturedPhoto && (
              <div style={{ marginTop: 6 }}>
                <Text type="secondary">
                  Upload is disabled because a live photo is selected. Remove it to upload a file.
                </Text>
              </div>
            )}
          </div>

          <div>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>Live Camera</div>
            {cameraError ? (
              <Text type="danger">{cameraError}</Text>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <video
                    ref={videoRef}
                    style={{
                      width: 240,
                      height: 180,
                      background: '#000',
                      borderRadius: 6,
                      objectFit: 'cover',
                    }}
                    muted
                    playsInline
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Tooltip
                      title={
                        (uploadList?.length ?? 0) > 0
                          ? 'Remove the uploaded file to capture a photo instead.'
                          : ''
                      }
                    >
                      <Button
                        icon={<CameraOutlined />}
                        onClick={handleCapturePhoto}
                        disabled={(uploadList?.length ?? 0) > 0}
                      >
                        Capture Photo
                      </Button>
                    </Tooltip>
                    <Button onClick={startCamera}>Restart Camera</Button>
                    <Button onClick={stopCamera}>Stop Camera</Button>
                  </div>
                </div>
                {capturedPhoto && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ marginBottom: 6, fontWeight: 500 }}>Captured</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img
                        src={URL.createObjectURL(capturedPhoto)}
                        alt="captured"
                        style={{
                          width: 160,
                          height: 120,
                          objectFit: 'cover',
                          borderRadius: 6,
                          border: '1px solid #eee',
                        }}
                      />
                      <Button danger icon={<DeleteOutlined />} onClick={removeCapturedPhoto}>
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Submit exactly one proof with your{' '}
                {clockModalType === 'in' ? 'Clock In' : 'Clock Out'}.
              </Text>
              {!isExactlyOneAttachment && (
                <div style={{ marginTop: 6 }}>
                  <Text type="danger">
                    Required: choose <b>one</b> — either capture a live photo or upload one file.
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AttendanceTableView
