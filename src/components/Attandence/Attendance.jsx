import React, { useEffect, useState } from 'react'
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import {
  Card,
  Descriptions,
  Badge,
  Select,
  Button,
  Form,
  message,
  Tooltip,
  Spin,
  Row,
  Col,
  Space,
  Grid,
  Popover,
} from 'antd'
import { GiTireIronCross } from 'react-icons/gi'
import AttendanceRequestModal from './AttendanceRequestModal'
import dayjs from 'dayjs'
import ExportAttendanceModal from './ExportAttendanceModal'
import { AppstoreOutlined, BarsOutlined, RollbackOutlined } from '@ant-design/icons'
import AttendanceTableView from './AttendanceTableView'
import { employeeAttandanceData, searchEmployeeDropdown } from '../../services/Services'
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../../redux/uiSlice'
import Pageheading from '../shared/Pageheading'
import { useLocation, useNavigate } from 'react-router-dom'
import { useActionsMap } from '../../utils/useActionsMap'

const localizer = momentLocalizer(moment)
const { useBreakpoint } = Grid

const Attendance = () => {
  const [form] = Form.useForm()
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const {
    ecode: defaultECode,
    firstName: defaultName,
    role,
  } = useSelector((state) => state.auth.data)

  const { filteredSideMenu } = useSelector((state) => state?.auth)
  const actionsMap = useActionsMap(filteredSideMenu)

  const [selectedPeriod, setSelectedPeriod] = useState(moment())
  const [selectedEmpCode, setSelectedEmpCode] = useState(defaultECode || '')
  const [attendanceData, setAttendanceData] = useState([])
  const [isAttendanceRequestModalOpen, setIsAttendanceRequestModalOpen] = useState(false)
  const [isExportAttendanceModalOpen, setIsExportAttendanceModalOpen] = useState(false)
  const [searchLoading, setsearchLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedEmp, setSelectedEmp] = useState('')
  const [employees, setEmployees] = useState([])
  const [searchText, setSearchText] = useState('')
  const [isGrid, setIsGrid] = useState(false)

  // -------- Current Location (for header line) ----------
  const [locationSource, setLocationSource] = useState('')
  const [shortLocation, setShortLocation] = useState('')
  const [isLocationTruncated, setIsLocationTruncated] = useState(false)
  const [locError, setLocError] = useState('')

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

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setLocError('Location not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const addr = await reverseGeocode(latitude, longitude)
        const src = addr || `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`
        setLocationSource(src)

        const MAX_LEN = 45
        if (src.length > MAX_LEN) {
          setShortLocation(src.slice(0, MAX_LEN))
          setIsLocationTruncated(true)
        } else {
          setShortLocation(src)
          setIsLocationTruncated(false)
        }
      },
      (err) => {
        setLocError(err?.message || 'Unable to fetch location')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }, [])

  const handleToggle = () => setIsGrid((v) => !v)

  // Employee search (debounced)
  useEffect(() => {
    if (searchText.length >= 2) {
      const debounceTimer = setTimeout(() => {
        const fetchData = async () => {
          try {
            const res = await searchEmployeeDropdown(searchText)
            setEmployees(res?.data?.employees || [])
          } catch (error) {
            console.error('Error fetching employee attendance:', error)
            setEmployees([])
          } finally {
            setsearchLoading(false)
          }
        }
        fetchData()
      }, 800)
      return () => clearTimeout(debounceTimer)
    }
  }, [searchText])

  const handleSearch = (value) => {
    setSearchText(value)
    if (value.length >= 2) setsearchLoading(true)
  }

  const handleSelectEvent = (event) => {
    const clickedDate = moment(event.start).format('YYYY-MM-DD')
    setSelectedDate(event.start)
    const record = attendanceData.find(
      (item) => moment(item.attendanceDate).format('YYYY-MM-DD') === clickedDate,
    )
    setSelectedEmp(record ? record.employeeName || record.eCode || '' : '')
  }

  const statusColors = {
    Present: 'green',
    ManualPresent: 'green',
    Absent: 'red',
    Leave: 'orange',
    'Weekly Off': 'red',
  }

  const getEvents = () => {
    const unique = {}
    const today = moment().startOf('day')

    attendanceData.forEach((item) => {
      const dateKey = item?.attendanceDate
      if (moment(dateKey).isAfter(today)) return

      if (!unique[dateKey]) {
        let title = ''
        if (item?.punchIn) {
          const formattedIn = moment(item?.punchIn, 'HH:mm:ss')?.format('HH:mm')
          if (item?.punchOut) {
            const formattedOut = moment(item?.punchOut, 'HH:mm:ss')?.format('HH:mm')
            title = formattedIn === formattedOut ? formattedIn : `${formattedIn}–${formattedOut}`
          } else {
            title = `${formattedIn} (MIS)`
          }
        } else {
          title = 'Absent'
        }
        unique[dateKey] = {
          title,
          start: new Date(dateKey),
          end: new Date(dateKey),
          allDay: true,
          status: item?.status,
          raw: item,
        }
      }
    })
    return Object.values(unique)
  }

  const getAttendanceDetails = (date) => {
    const formattedDate = moment(date).format('YYYY-MM-DD')
    const today = moment().startOf('day')
    if (moment(formattedDate).isAfter(today)) return null

    const record = attendanceData.find(
      (item) => moment(item.attendanceDate).format('YYYY-MM-DD') === formattedDate,
    )
    if (!record) return { status: 'A', checkIn: '--', checkOut: '--', totalHours: '--' }

    return {
      status: record?.status || '',
      checkIn: record?.punchIn ? moment(record?.punchIn, 'HH:mm:ss').format('hh:mm A') : '--',
      checkOut: record?.punchOut ? moment(record?.punchOut, 'HH:mm:ss').format('hh:mm A') : 'MIS',
      totalHours: `${record.totalWorkingMinutes}` || '--',
      eCode: record?.eCode || '',
      totalPunches: record?.validPunchCount || '',
    }
  }

  const details = selectedDate ? getAttendanceDetails(selectedDate) : null

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: statusColors[event.status],
      color: 'white',
      borderRadius: 5,
      padding: 4,
    },
  })

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    if (!selectedPeriod || !selectedEmpCode) return
    await dispatch(set({ loading: true }))
    try {
      const attendaceBody = {
        year: moment(selectedPeriod).year(),
        month: moment(selectedPeriod).month() + 1,
        eCode: selectedEmpCode,
      }
      const response = await employeeAttandanceData(attendaceBody)
      if (response.status === 200) setAttendanceData(response.data)
    } catch (error) {
      console.error('Error from attendance fetch api:', error)
    } finally {
      await dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchAttendanceData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, selectedEmpCode])

  const handleNavigate = (newDate) => setSelectedPeriod(moment(newDate))

  const onExportFailed = ({ errorFields }) => form.scrollToField(errorFields[0].name)
  const onExport = (values) => {
    const [from, to] = values.exportRange
    message.success(
      `Exporting data from ${from.format('YYYY-MM-DD')} to ${to.format('YYYY-MM-DD')}`,
    )
  }

  return (
    <>
      {/* Header line with page title + current location on the same row */}
      <div
        style={{
          display: 'flex',
          gap: 15,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left side: back + heading */}
        <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
          {location?.state !== null && (
            <Button
              type="primary"
              icon={<RollbackOutlined />}
              onClick={() => navigate(location?.state?.from)}
            />
          )}
          <Pageheading title="Attendance" marginBottom="-11px" />
        </div>

        {/* Right side: current location */}
        {/* <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            maxWidth: isMobile ? '55%' : 420,
          }}
        >
          <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>Current Location</span>

          {locationSource ? (
            <Popover
              trigger="hover"
              placement="bottomRight"
              content={
                <div style={{ maxWidth: 360, wordBreak: 'break-word' }}>{locationSource}</div>
              }
            >
              <span
                style={{
                  fontSize: 13,
                  cursor: 'pointer',
                  textDecoration: 'underline dotted',
                  whiteSpace: 'nowrap',
                }}
              >
                {shortLocation}
                {isLocationTruncated && '...'}
              </span>
            </Popover>
          ) : (
            <span style={{ fontSize: 13 }}>{locError || '-'}</span>
          )}
        </div> */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            maxWidth: isMobile ? '55%' : 420,
          }}
        >
          <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>Current Location</span>

          <span
            style={{
              fontSize: 13,
              whiteSpace: 'normal', // allow wrapping
              wordBreak: 'break-word', // break long words
              textAlign: 'right', // right align
            }}
          >
            {locationSource || locError || '-'}
          </span>
        </div>
      </div>

      {/* View toggle button */}
      <div style={{ width: '100%', position: 'relative', height: 40, marginTop: 4 }}>
        <Tooltip title={isGrid ? 'Switch to Table View' : 'Switch to Grid View'}>
          <Button
            icon={isGrid ? <BarsOutlined /> : <AppstoreOutlined />}
            onClick={handleToggle}
            shape="circle"
            size={isMobile ? 'middle' : 'large'}
            style={{ position: 'absolute', right: 0, top: 0, zIndex: 1 }}
          />
        </Tooltip>
      </div>

      {isGrid ? (
        <Row gutter={[16, 16]} align="stretch">
          {/* Left: Calendar Card */}
          <Col xs={24} lg={selectedDate && details ? 16 : 24}>
            <Card
              title="Employee Attendance"
              extra={
                <Space wrap>
                  {actionsMap?.export?.actionStatus && (
                    <Button onClick={() => setIsExportAttendanceModalOpen(true)}>Export</Button>
                  )}
                  {actionsMap?.regularize?.actionStatus && (
                    <Button type="primary" onClick={() => setIsAttendanceRequestModalOpen(true)}>
                      Regularize
                    </Button>
                  )}
                </Space>
              }
              bodyStyle={{ paddingTop: 12 }}
            >
              {/* Selector */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                {role === 'Employee' ? (
                  <div
                    style={{
                      minWidth: isMobile ? '100%' : 320,
                      padding: '6px 11px',
                      border: '1px solid #d9d9d9',
                      borderRadius: 6,
                      backgroundColor: '#f5f5f5',
                    }}
                  >
                    {`${defaultECode} - ${defaultName}`}
                  </div>
                ) : (
                  <Select
                    showSearch
                    style={{ width: isMobile ? '100%' : 280 }}
                    placeholder="Employee"
                    value={selectedEmpCode || undefined}
                    onChange={(value) => setSelectedEmpCode(value)}
                    onSearch={handleSearch}
                    filterOption={false}
                    allowClear
                    optionFilterProp="children"
                  >
                    {defaultECode && (
                      <Select.Option value={defaultECode}>
                        {`${defaultECode} - ${defaultName}`}
                      </Select.Option>
                    )}
                    {!searchLoading ? (
                      employees.map((emp) => (
                        <Select.Option key={emp.ecode} value={emp.ecode}>
                          {`${emp.ecode} - ${emp.fullName}`}
                        </Select.Option>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <Spin size="small" />
                      </div>
                    )}
                  </Select>
                )}
              </div>

              {/* Calendar (responsive) */}
              {selectedEmpCode ? (
                <div style={{ width: '100%', overflowX: 'auto' }}>
                  <div style={{ minWidth: 320 }}>
                    <BigCalendar
                      localizer={localizer}
                      events={getEvents()}
                      date={
                        selectedPeriod
                          ? moment(selectedPeriod).startOf('month').toDate()
                          : new Date()
                      }
                      startAccessor="start"
                      endAccessor="end"
                      style={{
                        height: isMobile ? 420 : 650,
                        width: '100%',
                        fontSize: isMobile ? '0.75rem' : '0.9rem',
                      }}
                      eventPropGetter={eventStyleGetter}
                      onSelectEvent={handleSelectEvent}
                      toolbar={true}
                      onNavigate={handleNavigate}
                      views={['month', 'week']}
                    />
                  </div>
                </div>
              ) : (
                <div>Please select an employee.</div>
              )}
            </Card>
          </Col>

          {/* Right: Day Details Card (stacks under on mobile) */}
          {selectedDate && details && (
            <Col xs={24} lg={8}>
              <Card
                title={
                  <span>
                    Details for {selectedEmp} {details?.eCode ? `- ${details.eCode}` : ''}
                  </span>
                }
                bodyStyle={{ paddingTop: 12 }}
                extra={
                  <Tooltip title="Close">
                    <GiTireIronCross
                      style={{
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedDate(null)}
                    />
                  </Tooltip>
                }
              >
                <Descriptions column={1} bordered size={isMobile ? 'small' : 'middle'}>
                  <Descriptions.Item label="Status">
                    <Badge color={statusColors[details?.status]} text={details?.status} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Check-In Time">{details?.checkIn}</Descriptions.Item>
                  <Descriptions.Item label="Check-Out Time">{details?.checkOut}</Descriptions.Item>
                  <Descriptions.Item label="Total Work Hours">
                    {details?.totalHours}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Punches">
                    {details?.totalPunches}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
          )}

          {/* Modals */}
          <AttendanceRequestModal
            isAttendanceRequestModalOpen={isAttendanceRequestModalOpen}
            setIsAttendanceRequestModalOpen={setIsAttendanceRequestModalOpen}
          />

          <ExportAttendanceModal
            isExportAttendanceModalOpen={isExportAttendanceModalOpen}
            setIsExportAttendanceModalOpen={setIsExportAttendanceModalOpen}
          />
        </Row>
      ) : (
        <AttendanceTableView actionsMap={actionsMap} />
      )}
    </>
  )
}

export default Attendance
