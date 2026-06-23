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
        useCycle: true, // pay cycle: 26th prev month -> 25th selected month (same as Table View)
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

  // ---- Pay-cycle calendar (26th prev month -> 25th selected month), react-big-calendar look ----
  const cycleStart = selectedPeriod
    ? moment(selectedPeriod).subtract(1, 'month').date(26).startOf('day')
    : null
  const cycleEnd = selectedPeriod ? moment(selectedPeriod).date(25).startOf('day') : null

  // week-aligned full weeks covering the cycle, so the grid lays out like a month calendar
  const cycleWeeks = (() => {
    if (!cycleStart || !cycleEnd) return []
    const gridStart = moment(cycleStart).startOf('week')
    const gridEnd = moment(cycleEnd).endOf('week')
    const days = []
    let d = gridStart.clone()
    while (d.isSameOrBefore(gridEnd, 'day')) {
      days.push(d.clone())
      d = d.add(1, 'day')
    }
    const weeks = []
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
    return weeks
  })()
  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const recordByDate = (() => {
    const map = {}
    attendanceData.forEach((it) => {
      map[moment(it.attendanceDate).format('YYYY-MM-DD')] = it
    })
    return map
  })()

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
                    {/* Pay-cycle calendar: react-big-calendar look, scoped 26th(prev) -> 25th(selected) */}
                    <div className="rbc-calendar" style={{ width: '100%' }}>
                      {/* Toolbar (RBC styling) */}
                      <div className="rbc-toolbar">
                        <span className="rbc-btn-group">
                          <button type="button" onClick={() => setSelectedPeriod(moment())}>
                            Today
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedPeriod(moment(selectedPeriod).subtract(1, 'month'))
                            }
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            disabled={moment(selectedPeriod).isSameOrAfter(moment(), 'month')}
                            onClick={() => setSelectedPeriod(moment(selectedPeriod).add(1, 'month'))}
                          >
                            Next
                          </button>
                        </span>
                        <span className="rbc-toolbar-label">
                          {cycleStart && cycleEnd
                            ? `${cycleStart.format('DD MMM')} – ${cycleEnd.format('DD MMM YYYY')} (cycle)`
                            : ''}
                        </span>
                        <span className="rbc-btn-group" />
                      </div>

                      {/* Weekday header */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(7, 1fr)',
                          borderLeft: '1px solid #ddd',
                          borderTop: '1px solid #ddd',
                          fontWeight: 600,
                          color: '#333',
                        }}
                      >
                        {weekdayLabels.map((w) => (
                          <div
                            key={w}
                            style={{
                              textAlign: 'center',
                              padding: '8px 0',
                              borderRight: '1px solid #ddd',
                              borderBottom: '1px solid #ddd',
                              background: '#fff',
                              fontSize: isMobile ? '0.72rem' : '0.9rem',
                            }}
                          >
                            {w}
                          </div>
                        ))}
                      </div>

                      {/* Week rows */}
                      <div style={{ borderLeft: '1px solid #ddd' }}>
                        {cycleWeeks.map((week, wi) => (
                          <div
                            key={wi}
                            style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}
                          >
                            {week.map((d) => {
                              const key = d.format('YYYY-MM-DD')
                              const rec = recordByDate[key]
                              const inCycle =
                                d.isSameOrAfter(cycleStart, 'day') && d.isSameOrBefore(cycleEnd, 'day')
                              const isFuture = d.isAfter(moment().endOf('day'))
                              const status = rec?.status || (inCycle && !isFuture ? 'Absent' : '')
                              const inT = rec?.punchIn
                                ? moment(rec.punchIn, 'HH:mm:ss').format('HH:mm')
                                : ''
                              const outT = rec?.punchOut
                                ? moment(rec.punchOut, 'HH:mm:ss').format('HH:mm')
                                : ''
                              const punchTxt = inT
                                ? outT && outT !== inT
                                  ? `${inT}–${outT}`
                                  : `${inT} (MIS)`
                                : ''
                              const isSel =
                                selectedDate && moment(selectedDate).format('YYYY-MM-DD') === key
                              const clickable = inCycle && !isFuture
                              const barColor =
                                statusColors[status] ||
                                (status ? '#3174ad' : 'transparent')
                              return (
                                <div
                                  key={key}
                                  onClick={() => {
                                    if (!clickable) return
                                    setSelectedDate(d.toDate())
                                    setSelectedEmp(rec ? rec.employeeName || rec.eCode || '' : '')
                                  }}
                                  style={{
                                    position: 'relative',
                                    minHeight: isMobile ? 70 : 130,
                                    borderRight: '1px solid #ddd',
                                    borderBottom: '1px solid #ddd',
                                    background: !inCycle ? '#f4f4f4' : isSel ? '#eaf4ff' : '#fff',
                                    cursor: clickable ? 'pointer' : 'default',
                                    boxShadow: isSel ? 'inset 0 0 0 2px #1890ff' : 'none',
                                    padding: '2px 4px 4px',
                                  }}
                                >
                                  <div
                                    style={{
                                      textAlign: 'right',
                                      fontSize: isMobile ? '0.72rem' : '0.85rem',
                                      color: inCycle ? '#666' : '#bbb',
                                      padding: '2px 4px',
                                    }}
                                  >
                                    {d.date() === 1 ? d.format('D MMM') : d.format('DD')}
                                  </div>
                                  {inCycle && !isFuture && status && (
                                    <div
                                      title={`${status}${punchTxt ? ' • ' + punchTxt : ''}`}
                                      style={{
                                        background: barColor,
                                        color: '#fff',
                                        borderRadius: 4,
                                        padding: isMobile ? '2px 4px' : '3px 8px',
                                        margin: '2px 2px 0',
                                        fontSize: isMobile ? '0.66rem' : '0.8rem',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      }}
                                    >
                                      {punchTxt || status}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
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
