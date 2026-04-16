// import { useEffect, useMemo, useState } from 'react'
// import './attendancechangelog.css'
// import groupByColumn from './helpers/groupByColumn'
// import SideBySideDiff from '../EmployeeChangeLog/helpers/SidebySideDiff'
// import getVersionTagColor from '../EmployeeChangeLog/helpers/getVersionTagColor'
// import {
//   getEmployeeMultiPunchesChangeLog, // <-- make sure this exists in Services
//   searchEmployeeDropdown,
// } from '../../services/Services'
// import {
//   message,
//   Space,
//   Typography,
//   Input,
//   Select,
//   Spin,
//   Alert,
//   Empty,
//   Layout,
//   Tag,
//   List,
//   Segmented,
//   Button,
//   Timeline,
//   Card,
//   Modal,
//   Grid,
//   DatePicker,
// } from 'antd'

// const { Title, Text } = Typography
// const { Option } = Select
// const { Sider, Content } = Layout
// const { useBreakpoint } = Grid

// const AttendanceChangeLog = () => {
//   const [empCode, setEmpCode] = useState('')
//   const [entries, setEntries] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [errMsg, setErrMsg] = useState('')

//   const [selectedColumn, setSelectedColumn] = useState(null)
//   const [columnFilter, setColumnFilter] = useState('')
//   const [userFilter, setUserFilter] = useState(undefined)
//   const [sortOrder, setSortOrder] = useState('desc') // latest -> oldest

//   const [searchText, setSearchText] = useState('')
//   const [searchLoading, setSearchLoading] = useState(false)
//   const [employees, setEmployees] = useState([])

//   // month state
//   const [monthValue, setMonthValue] = useState(null) // DatePicker value
//   const [monthParam, setMonthParam] = useState('') // formatted like "Nov-25"

//   const screens = useBreakpoint()
//   const isMobile = !screens.md
//   const isTabletOrDown = !screens.lg

//   // compare modal state
//   const [compareOpen, setCompareOpen] = useState(false)
//   const [compareA, setCompareA] = useState(null)
//   const [compareB, setCompareB] = useState(null)

//   const hasData = entries && entries.length > 0

//   // employee search (same as EmployeeChangeLog)
//   useEffect(() => {
//     if (searchText.length >= 2) {
//       setSearchLoading(true)
//       const debounceTimer = setTimeout(() => {
//         const fetchData = async () => {
//           try {
//             const res = await searchEmployeeDropdown(searchText)
//             if (res?.data?.employees?.length > 0) {
//               setEmployees(res.data.employees)
//             } else {
//               setEmployees([])
//             }
//           } catch (error) {
//             console.error('Error fetching employee list:', error)
//             setEmployees([])
//           } finally {
//             setSearchLoading(false)
//           }
//         }

//         fetchData()
//       }, 800)

//       return () => clearTimeout(debounceTimer)
//     }
//   }, [searchText])

//   const grouped = useMemo(() => groupByColumn(entries), [entries])
//   const allColumns = useMemo(() => Object.keys(grouped), [grouped])

//   const filteredColumns = useMemo(() => {
//     if (!columnFilter) return allColumns
//     const q = columnFilter.toLowerCase()
//     return allColumns.filter((c) => c.toLowerCase().includes(q))
//   }, [allColumns, columnFilter])

//   const allUsers = useMemo(() => {
//     const set = new Set()
//     entries.forEach((e) => {
//       if (e?.changedBy) set.add(e.changedBy)
//     })
//     return Array.from(set)
//   }, [entries])

//   const selectedVersions = useMemo(() => {
//     if (!selectedColumn) return []

//     let versions = grouped[selectedColumn] || []

//     if (userFilter) {
//       versions = versions.filter((v) => v?.changedBy === userFilter)
//     }

//     const sorted = [...versions].sort((a, b) => {
//       const da = new Date(a?.changedOn).getTime()
//       const db = new Date(b?.changedOn).getTime()
//       return sortOrder === 'desc' ? db - da : da - db
//     })

//     return sorted
//   }, [grouped, selectedColumn, userFilter, sortOrder])

//   // ---------- API CALL ----------

//   const fetchAttendanceLogs = async (ecode, monthStr) => {
//     const trimmedCode = (ecode || '').trim()
//     const trimmedMonth = (monthStr || '').trim()

//     if (!trimmedCode || !trimmedMonth) return

//     setErrMsg('')
//     setLoading(true)
//     setSelectedColumn(null)
//     setUserFilter(undefined)
//     setColumnFilter('')
//     setEntries([])
//     setSortOrder('desc')

//     try {
//       const response = await getEmployeeMultiPunchesChangeLog(trimmedCode, trimmedMonth)
//       if (response.status === 200) {
//         const data = response.data?.data || response.data || []
//         setEntries(data)
//         setEmpCode(trimmedCode)

//         if (data?.length > 0) {
//           setSelectedColumn(data[0]?.columnName)
//         } else {
//           setSelectedColumn(null)
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching attendance change log data:', error)
//       const apiErr = error?.response?.data?.message || 'Error fetching attendance change log data'
//       message.error(apiErr)
//       setErrMsg(apiErr)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // ---------- Compare modal helpers ----------

//   const openCompareModal = () => {
//     if (!selectedColumn) return
//     const versions = grouped[selectedColumn] || []
//     if (versions?.length < 2) return

//     const sorted = [...versions].sort((a, b) => {
//       const da = new Date(a?.changedOn).getTime()
//       const db = new Date(b?.changedOn).getTime()
//       return db - da
//     })

//     setCompareA(sorted[0])
//     setCompareB(sorted[1])
//     setCompareOpen(true)
//   }

//   const renderCompareOptions = () => {
//     const versions = grouped[selectedColumn] || []
//     const sorted = [...versions].sort((a, b) => {
//       const da = new Date(a?.changedOn).getTime()
//       const db = new Date(b?.changedOn).getTime()
//       return db - da
//     })

//     return sorted.map((v, i) => {
//       const label = `${v?.versionLabel} • ${v?.changedBy} • ${new Date(
//         v?.changedOn,
//       ).toLocaleString()}`
//       return (
//         <Option key={i} value={i}>
//           {label}
//         </Option>
//       )
//     })
//   }

//   const getVersionByIndex = (idx) => {
//     const versions = grouped[selectedColumn] || []
//     const sorted = [...versions].sort((a, b) => {
//       const da = new Date(a?.changedOn).getTime()
//       const db = new Date(b?.changedOn).getTime()
//       return db - da
//     })
//     return sorted[idx]
//   }

//   const compareBody =
//     compareA && compareB ? (
//       <div
//         style={{
//           display: 'grid',
//           gridTemplateColumns: '1fr 1fr',
//           gap: 16,
//         }}
//       >
//         <div>
//           <Text strong>{compareA?.versionLabel}</Text>
//           <div>
//             <Text type="secondary">{compareA?.changedBy}</Text>
//           </div>
//           <div>
//             <Text type="secondary">{new Date(compareA?.changedOn).toLocaleString()}</Text>
//           </div>
//           <SideBySideDiff oldValue={compareA?.oldValue} newValue={compareA?.newValue} />
//         </div>

//         <div>
//           <Text strong>{compareB?.versionLabel}</Text>
//           <div>
//             <Text type="secondary">{compareB?.changedBy}</Text>
//           </div>
//           <div>
//             <Text type="secondary">{new Date(compareB?.changedOn).toLocaleString()}</Text>
//           </div>
//           <SideBySideDiff oldValue={compareB?.oldValue} newValue={compareB?.newValue} />
//         </div>
//       </div>
//     ) : (
//       <Text type="secondary">Select two versions to compare them side by side</Text>
//     )

//   // ---------- Render ----------

//   return (
//     <div
//       className="attendance-changelog-page"
//       style={{ padding: 24, height: '100%', boxSizing: 'border-box' }}
//     >
//       <Space direction="vertical" style={{ width: '100%' }} size="large">
//         {/* header + filters */}
//         <div
//           className="attendance-changelog-header"
//           style={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             gap: 16,
//             flexWrap: 'wrap',
//           }}
//         >
//           <div>
//             <Title level={3} style={{ marginBottom: 4 }}>
//               Attendance Change Log
//             </Title>
//             <Text type="secondary">
//               Select an employee and month to inspect who changed what &amp; when for attendance
//               punches.
//             </Text>
//           </div>

//           <Space
//             className="attendance-changelog-search"
//             style={{
//               minWidth: 260,
//               flex: 1,
//               maxWidth: 480,
//               justifyContent: 'flex-end',
//               flexWrap: 'wrap',
//             }}
//             size="middle"
//           >
//             {/* Employee search dropdown */}
//             <Select
//               style={{ width: 220 }}
//               onSearch={setSearchText}
//               notFoundContent={searchLoading ? <Spin size="small" /> : 'No employees found'}
//               showSearch
//               allowClear
//               filterOption={false}
//               placeholder="Search employee"
//               value={empCode || undefined}
//               onChange={(value) => {
//                 if (!value) {
//                   setEmpCode('')
//                   setEntries([])
//                   setEmployees([])
//                   return
//                 }
//                 setEmpCode(value)
//                 if (monthParam) {
//                   fetchAttendanceLogs(value, monthParam)
//                 }
//               }}
//             >
//               {employees?.length > 0 ? (
//                 employees.map((e) => (
//                   <Select.Option key={e.ecode} value={e.ecode}>
//                     {e.ecode} - {e.fullName}
//                   </Select.Option>
//                 ))
//               ) : (
//                 <Select.Option disabled key="no-emp">
//                   No Employee Found
//                 </Select.Option>
//               )}
//             </Select>

//             {/* Month picker */}
//             <DatePicker
//               picker="month"
//               style={{ width: 150 }}
//               value={monthValue}
//               placeholder="Select month"
//               onChange={(value) => {
//                 setMonthValue(value)
//                 if (!value) {
//                   setMonthParam('')
//                   setEntries([])
//                   return
//                 }
//                 const formatted = value.format('MMM-YY') // e.g. "Nov-25"
//                 setMonthParam(formatted)
//                 if (empCode) {
//                   fetchAttendanceLogs(empCode, formatted)
//                 }
//               }}
//             />
//           </Space>
//         </div>

//         {/* loading / error / empty states */}
//         {loading && (
//           <div style={{ padding: 48, textAlign: 'center' }}>
//             <Spin size="large" />
//           </div>
//         )}

//         {!loading && errMsg && <Alert type="error" message={errMsg} showIcon />}

//         {!loading && !errMsg && !hasData && empCode && monthParam && (
//           <Empty
//             description={
//               <span>
//                 No attendance change log found for <Text code>{empCode}</Text> in{' '}
//                 <Text code>{monthParam}</Text>
//               </span>
//             }
//           />
//         )}

//         {/* main layout */}
//         {!loading && !errMsg && hasData && (
//           <Layout
//             className="attendance-changelog-layout"
//             style={{
//               borderRadius: 12,
//               overflow: 'hidden',
//               boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
//               minHeight: 480,
//               flexDirection: isTabletOrDown ? 'column' : 'row',
//             }}
//           >
//             {/* left: columns list */}
//             <Sider
//               className="attendance-changelog-sider"
//               width={isTabletOrDown ? '100%' : 300}
//               style={{
//                 background: '#fff',
//                 padding: 16,
//                 borderRight: isTabletOrDown ? 'none' : '1px solid #f0f0f0',
//                 borderBottom: isTabletOrDown ? '1px solid #f0f0f0' : 'none',
//                 flex: isTabletOrDown ? '0 0 auto' : '0 0 300px',
//                 maxWidth: isTabletOrDown ? '100%' : 300,
//               }}
//             >
//               <Space direction="vertical" style={{ width: '100%' }}>
//                 <div>
//                   <Text type="secondary">Employee / Month</Text>
//                   <div>
//                     {empCode && (
//                       <Tag color="blue" style={{ marginTop: 4 }}>
//                         {empCode}
//                       </Tag>
//                     )}
//                     {monthParam && <Tag style={{ marginTop: 4, marginLeft: 4 }}>{monthParam}</Tag>}
//                     <Tag style={{ marginTop: 4, marginLeft: 4 }}>
//                       {entries.length} change record
//                       {entries.length !== 1 ? 's' : ''}
//                     </Tag>
//                   </div>
//                 </div>

//                 <Input
//                   placeholder="Filter fields (column names)"
//                   allowClear
//                   value={columnFilter}
//                   onChange={(e) => setColumnFilter(e.target.value)}
//                 />

//                 <div
//                   style={{
//                     maxHeight: isMobile ? '25vh' : isTabletOrDown ? '40vh' : '70vh',
//                     overflow: 'auto',
//                     marginTop: 4,
//                     paddingRight: 4,
//                   }}
//                 >
//                   <List
//                     size="small"
//                     dataSource={filteredColumns}
//                     locale={{
//                       emptyText: 'No columns match the filter',
//                     }}
//                     renderItem={(columnName) => {
//                       const versionCount = grouped[columnName]?.length || 0
//                       const isSelected = selectedColumn === columnName

//                       return (
//                         <List.Item
//                           style={{
//                             cursor: 'pointer',
//                             borderRadius: 8,
//                             padding: '8px 10px',
//                             background: isSelected ? '#e6f4ff' : undefined,
//                             transition: 'background 0.15s ease',
//                           }}
//                           onClick={() => setSelectedColumn(columnName)}
//                         >
//                           <div style={{ width: '100%' }}>
//                             <div
//                               style={{
//                                 display: 'flex',
//                                 justifyContent: 'space-between',
//                                 alignItems: 'center',
//                               }}
//                             >
//                               <Text
//                                 strong={isSelected}
//                                 style={{
//                                   maxWidth: '75%',
//                                   whiteSpace: 'nowrap',
//                                   textOverflow: 'ellipsis',
//                                   overflow: 'hidden',
//                                 }}
//                               >
//                                 {columnName}
//                               </Text>

//                               <Tag
//                                 color={isSelected ? 'blue' : 'default'}
//                                 style={{ marginLeft: 0 }}
//                               >
//                                 {versionCount} version
//                                 {versionCount !== 1 ? 's' : ''}
//                               </Tag>
//                             </div>
//                           </div>
//                         </List.Item>
//                       )
//                     }}
//                   />
//                 </div>
//               </Space>
//             </Sider>

//             {/* right: timeline */}
//             <Content
//               className="attendance-changelog-content"
//               style={{
//                 background: '#fafafa',
//                 padding: 16,
//                 width: '100%',
//               }}
//             >
//               {selectedColumn ? (
//                 <Space direction="vertical" size="large" style={{ width: '100%' }}>
//                   {/* toolbar */}
//                   <div
//                     className="attendance-changelog-toolbar"
//                     style={{
//                       display: 'flex',
//                       justifyContent: 'space-between',
//                       alignItems: 'flex-start',
//                       gap: 16,
//                       flexWrap: 'wrap',
//                       flexDirection: isTabletOrDown ? 'column' : 'row',
//                     }}
//                   >
//                     <div style={{ flex: 1, minWidth: 220 }}>
//                       <Title level={4} style={{ marginBottom: 0 }}>
//                         {selectedColumn}
//                       </Title>

//                       <Text type="secondary">
//                         Showing history for this field ({selectedVersions.length} version{' '}
//                         {selectedVersions.length !== 1 ? 's' : ''} after filters)
//                       </Text>

//                       <div style={{ marginTop: 0 }}>
//                         <Segmented
//                           size="small"
//                           value={sortOrder}
//                           onChange={(val) => setSortOrder(val)}
//                           options={[
//                             { label: 'Latest -> Oldest', value: 'desc' },
//                             { label: 'Oldest -> Latest', value: 'asc' },
//                           ]}
//                         />
//                       </div>
//                     </div>

//                     <Space
//                       direction="vertical"
//                       size="small"
//                       style={{
//                         minWidth: 220,
//                         width: isTabletOrDown ? '100%' : 260,
//                         maxWidth: 320,
//                       }}
//                     >
//                       <div>
//                         <Text type="secondary">Filter by user</Text>
//                         <Select
//                           style={{ width: '100%', marginTop: 4 }}
//                           allowClear
//                           showSearch
//                           placeholder="All users"
//                           value={userFilter}
//                           onChange={(val) => setUserFilter(val)}
//                           optionFilterProp="children"
//                           filterOption={(input, option) =>
//                             (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
//                           }
//                         >
//                           {allUsers.map((u) => (
//                             <Option key={u} value={u}>
//                               {u}
//                             </Option>
//                           ))}
//                         </Select>
//                       </div>

//                       <Button
//                         size="small"
//                         type="default"
//                         onClick={openCompareModal}
//                         disabled={!selectedColumn || (grouped[selectedColumn] || []).length < 2}
//                       >
//                         Compare versions
//                       </Button>
//                     </Space>
//                   </div>

//                   {/* timeline */}
//                   {selectedVersions.length === 0 ? (
//                     <Empty description="No versions for this field (after filters)" />
//                   ) : (
//                     <div
//                       className="timeline-scroll-wrapper"
//                       style={{
//                         maxHeight: isTabletOrDown ? 'none' : '70vh',
//                         overflow: 'auto',
//                         paddingTop: 10,
//                       }}
//                     >
//                       <Timeline mode="right">
//                         {selectedVersions.map((v, index) => {
//                           const isLatest = v?.versionLabel === 'vLatest'
//                           const isChanged = v?.oldValue !== v?.newValue
//                           const formattedChangedOn = new Date(v?.changedOn).toLocaleString()
//                           const formattedChangedOnMob = v?.changedOn?.split('T')[0]
//                           const formattedPunchDate = v?.punchDate
//                             ? new Date(v.punchDate).toLocaleDateString()
//                             : null

//                           return (
//                             <Timeline.Item
//                               key={`${v?.versionLabel}-${v?.changedOn}-${index}`}
//                               color={isLatest ? 'green' : isChanged ? 'blue' : 'gray'}
//                               label={
//                                 !isMobile ? (
//                                   <Text type="secondary">{formattedChangedOn}</Text>
//                                 ) : (
//                                   formattedChangedOnMob
//                                 )
//                               }
//                             >
//                               <Card
//                                 size="small"
//                                 style={{
//                                   borderRadius: 10,
//                                   borderColor: isLatest ? '#52c41a' : undefined,
//                                 }}
//                               >
//                                 <Space direction="vertical" style={{ width: '100%' }} size="small">
//                                   <Space
//                                     style={{
//                                       display: 'flex',
//                                       justifyContent: 'space-between',
//                                     }}
//                                   >
//                                     <Space size="small" wrap>
//                                       <Tag color={getVersionTagColor(v?.versionLabel, isLatest)}>
//                                         {v?.versionLabel}
//                                       </Tag>

//                                       <Tag>{v?.changedBy}</Tag>

//                                       {formattedPunchDate && (
//                                         <Tag color="geekblue">Punch Date: {formattedPunchDate}</Tag>
//                                       )}

//                                       {!isChanged && <Tag color="default">no value change</Tag>}
//                                     </Space>
//                                   </Space>

//                                   <SideBySideDiff oldValue={v?.oldValue} newValue={v?.newValue} />
//                                 </Space>
//                               </Card>
//                             </Timeline.Item>
//                           )
//                         })}
//                       </Timeline>
//                     </div>
//                   )}
//                 </Space>
//               ) : (
//                 <Empty description="Select a field from the left to see history" />
//               )}
//             </Content>
//           </Layout>
//         )}

//         {/* compare versions modal */}
//         <Modal
//           title={`Compare versions – ${selectedColumn || ''}`}
//           open={compareOpen}
//           onCancel={() => setCompareOpen(false)}
//           footer={[
//             <Button key="close" onClick={() => setCompareOpen(false)}>
//               Close
//             </Button>,
//           ]}
//           width={900}
//         >
//           {selectedColumn && (
//             <Space direction="vertical" size="middle" style={{ width: '100%' }}>
//               <Space style={{ width: '100%' }}>
//                 <div style={{ flex: 1 }}>
//                   <Text type="secondary">Version A</Text>
//                   <Select
//                     style={{ width: '100%', marginTop: 4 }}
//                     value={compareA ? (grouped[selectedColumn] || []).indexOf(compareA) : undefined}
//                     onChange={(idx) => setCompareA(getVersionByIndex(idx))}
//                   >
//                     {renderCompareOptions()}
//                   </Select>
//                 </div>
//                 <div style={{ flex: 1 }}>
//                   <Text type="secondary">Version B</Text>
//                   <Select
//                     style={{ width: '100%', marginTop: 4 }}
//                     value={compareB ? (grouped[selectedColumn] || []).indexOf(compareB) : undefined}
//                     onChange={(idx) => setCompareB(getVersionByIndex(idx))}
//                   >
//                     {renderCompareOptions()}
//                   </Select>
//                 </div>
//               </Space>

//               {compareBody}
//             </Space>
//           )}
//         </Modal>
//       </Space>
//     </div>
//   )
// }

// export default AttendanceChangeLog

import { useEffect, useMemo, useState } from 'react'
import './attendancechangelog.css'
import SideBySideDiff from '../EmployeeChangeLog/helpers/SidebySideDiff'
import getVersionTagColor from '../EmployeeChangeLog/helpers/getVersionTagColor'
import { getEmployeeMultiPunchesChangeLog, searchEmployeeDropdown } from '../../services/Services'
import {
  message,
  Space,
  Typography,
  Input,
  Select,
  Spin,
  Alert,
  Empty,
  Layout,
  Tag,
  List,
  Segmented,
  Button,
  Timeline,
  Card,
  Modal,
  Grid,
  DatePicker,
  Collapse,
} from 'antd'

const { Title, Text } = Typography
const { Option } = Select
const { Sider, Content } = Layout
const { useBreakpoint } = Grid
const { Panel } = Collapse

const AttendanceChangeLog = () => {
  const [empCode, setEmpCode] = useState('')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  const [selectedDate, setSelectedDate] = useState(null) // yyyy-mm-dd
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [columnFilter, setColumnFilter] = useState('')
  const [userFilter, setUserFilter] = useState(undefined)
  const [sortOrder, setSortOrder] = useState('desc') // latest -> oldest

  const [searchText, setSearchText] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [employees, setEmployees] = useState([])

  // month state
  const [monthValue, setMonthValue] = useState(null) // DatePicker value
  const [monthParam, setMonthParam] = useState('') // formatted like "Nov-25"

  const screens = useBreakpoint()
  const isMobile = !screens.md
  const isTabletOrDown = !screens.lg

  // compare modal state
  const [compareOpen, setCompareOpen] = useState(false)
  const [compareA, setCompareA] = useState(null)
  const [compareB, setCompareB] = useState(null)

  const hasData = entries && entries.length > 0

  const sortColumns = (cols = []) => {
    const re = /^Punch(\d+)$/i

    return [...cols].sort((a, b) => {
      const ma = a.match(re)
      const mb = b.match(re)

      // both are PunchN -> sort by number
      if (ma && mb) {
        return Number(ma[1]) - Number(mb[1])
      }

      // only a is PunchN -> keep Punch fields first (optional)
      if (ma && !mb) return -1
      if (!ma && mb) return 1

      // fallback: normal alphabetical
      return a.localeCompare(b)
    })
  }

  // employee search (same as EmployeeChangeLog)
  useEffect(() => {
    if (searchText.length >= 2) {
      setSearchLoading(true)
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
            console.error('Error fetching employee list:', error)
            setEmployees([])
          } finally {
            setSearchLoading(false)
          }
        }

        fetchData()
      }, 800)

      return () => clearTimeout(debounceTimer)
    }
  }, [searchText])

  // group entries by punchDate -> columnName
  const groupedByDateAndColumn = useMemo(() => {
    const map = {}
    entries.forEach((e) => {
      const dateKey = e.punchDate ? e.punchDate.split('T')[0] : 'Unknown'
      if (!map[dateKey]) map[dateKey] = {}
      if (!map[dateKey][e.columnName]) map[dateKey][e.columnName] = []
      map[dateKey][e.columnName].push(e)
    })
    return map
  }, [entries])

  const dateKeys = useMemo(
    () =>
      Object.keys(groupedByDateAndColumn).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime(),
      ),
    [groupedByDateAndColumn],
  )

  const allUsers = useMemo(() => {
    const set = new Set()
    entries.forEach((e) => {
      if (e?.changedBy) set.add(e.changedBy)
    })
    return Array.from(set)
  }, [entries])

  const selectedVersions = useMemo(() => {
    if (!selectedDate || !selectedColumn) return []

    let versions = groupedByDateAndColumn[selectedDate]?.[selectedColumn] || []

    if (userFilter) {
      versions = versions.filter((v) => v?.changedBy === userFilter)
    }

    const sorted = [...versions].sort((a, b) => {
      const da = new Date(a?.changedOn).getTime()
      const db = new Date(b?.changedOn).getTime()
      return sortOrder === 'desc' ? db - da : da - db
    })

    return sorted
  }, [groupedByDateAndColumn, selectedDate, selectedColumn, userFilter, sortOrder])

  // ---------- API CALL ----------

  const fetchAttendanceLogs = async (ecode, monthStr) => {
    const trimmedCode = (ecode || '').trim()
    const trimmedMonth = (monthStr || '').trim()

    if (!trimmedCode || !trimmedMonth) return

    setErrMsg('')
    setLoading(true)
    setSelectedDate(null)
    setSelectedColumn(null)
    setUserFilter(undefined)
    setColumnFilter('')
    setEntries([])
    setSortOrder('desc')

    try {
      const response = await getEmployeeMultiPunchesChangeLog(trimmedCode, trimmedMonth)
      if (response.status === 200) {
        const data = response.data?.data || response.data || []
        setEntries(data)
        setEmpCode(trimmedCode)

        if (data?.length > 0) {
          const first = data[0]
          const firstDate = first.punchDate ? first.punchDate.split('T')[0] : null
          const firstCol = first.columnName
          setSelectedDate(firstDate)
          setSelectedColumn(firstCol)
        } else {
          setSelectedDate(null)
          setSelectedColumn(null)
        }
      }
    } catch (error) {
      console.error('Error fetching attendance change log data:', error)
      const apiErr = error?.response?.data?.message || 'Error fetching attendance change log data'
      message.error(apiErr)
      setErrMsg(apiErr)
    } finally {
      setLoading(false)
    }
  }

  // ---------- Compare modal helpers ----------

  const openCompareModal = () => {
    if (!selectedDate || !selectedColumn) return
    const versions = groupedByDateAndColumn[selectedDate]?.[selectedColumn] || []
    if (versions.length < 2) return

    const sorted = [...versions].sort((a, b) => {
      const da = new Date(a?.changedOn).getTime()
      const db = new Date(b?.changedOn).getTime()
      return db - da
    })

    setCompareA(sorted[0])
    setCompareB(sorted[1])
    setCompareOpen(true)
  }

  const renderCompareOptions = () => {
    const versions = groupedByDateAndColumn[selectedDate]?.[selectedColumn] || []

    const sorted = [...versions].sort((a, b) => {
      const da = new Date(a?.changedOn).getTime()
      const db = new Date(b?.changedOn).getTime()
      return db - da
    })

    return sorted.map((v, i) => {
      const label = `${v?.versionLabel} • ${v?.changedBy} • ${new Date(
        v?.changedOn,
      ).toLocaleString()}`
      return (
        <Option key={i} value={i}>
          {label}
        </Option>
      )
    })
  }

  const getVersionByIndex = (idx) => {
    const versions = groupedByDateAndColumn[selectedDate]?.[selectedColumn] || []

    const sorted = [...versions].sort((a, b) => {
      const da = new Date(a?.changedOn).getTime()
      const db = new Date(b?.changedOn).getTime()
      return db - da
    })
    return sorted[idx]
  }

  const compareBody =
    compareA && compareB ? (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <div>
          <Text strong>{compareA?.versionLabel}</Text>
          <div>
            <Text type="secondary">{compareA?.changedBy}</Text>
          </div>
          <div>
            <Text type="secondary">{new Date(compareA?.changedOn).toLocaleString()}</Text>
          </div>
          <SideBySideDiff oldValue={compareA?.oldValue} newValue={compareA?.newValue} />
        </div>

        <div>
          <Text strong>{compareB?.versionLabel}</Text>
          <div>
            <Text type="secondary">{compareB?.changedBy}</Text>
          </div>
          <div>
            <Text type="secondary">{new Date(compareB?.changedOn).toLocaleString()}</Text>
          </div>
          <SideBySideDiff oldValue={compareB?.oldValue} newValue={compareB?.newValue} />
        </div>
      </div>
    ) : (
      <Text type="secondary">Select two versions to compare them side by side</Text>
    )

  // ---------- Render ----------

  return (
    <div
      className="attendance-changelog-page"
      style={{ padding: 24, height: '100%', boxSizing: 'border-box' }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* header + filters */}
        <div
          className="attendance-changelog-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>
              Attendance Change Log
            </Title>
            <Text type="secondary">
              Select an employee and month to inspect who changed what &amp; when for attendance
              punches.
            </Text>
          </div>

          <Space
            className="attendance-changelog-search"
            style={{
              minWidth: 260,
              flex: 1,
              maxWidth: 480,
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
            }}
            size="middle"
          >
            {/* Employee search dropdown */}
            <Select
              style={{ width: 220 }}
              onSearch={setSearchText}
              notFoundContent={searchLoading ? <Spin size="small" /> : 'No employees found'}
              showSearch
              allowClear
              filterOption={false}
              placeholder="Search employee"
              value={empCode || undefined}
              onChange={(value) => {
                if (!value) {
                  setEmpCode('')
                  setEntries([])
                  setEmployees([])
                  setSelectedDate(null)
                  setSelectedColumn(null)
                  return
                }
                setEmpCode(value)
                if (monthParam) {
                  fetchAttendanceLogs(value, monthParam)
                }
              }}
            >
              {employees?.length > 0 ? (
                employees.map((e) => (
                  <Select.Option key={e.ecode} value={e.ecode}>
                    {e.ecode} - {e.fullName}
                  </Select.Option>
                ))
              ) : (
                <Select.Option disabled key="no-emp">
                  No Employee Found
                </Select.Option>
              )}
            </Select>

            {/* Month picker */}
            <DatePicker
              picker="month"
              style={{ width: 150 }}
              value={monthValue}
              placeholder="Select month"
              onChange={(value) => {
                setMonthValue(value)
                if (!value) {
                  setMonthParam('')
                  setEntries([])
                  setSelectedDate(null)
                  setSelectedColumn(null)
                  return
                }
                const formatted = value.format('MMM-YY') // e.g. "Nov-25"
                setMonthParam(formatted)
                if (empCode) {
                  fetchAttendanceLogs(empCode, formatted)
                }
              }}
            />
          </Space>
        </div>

        {/* loading / error / empty states */}
        {loading && (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Spin size="large" />
          </div>
        )}

        {!loading && errMsg && <Alert type="error" message={errMsg} showIcon />}

        {!loading && !errMsg && !hasData && empCode && monthParam && (
          <Empty
            description={
              <span>
                No attendance change log found for <Text code>{empCode}</Text> in{' '}
                <Text code>{monthParam}</Text>
              </span>
            }
          />
        )}

        {/* main layout */}
        {!loading && !errMsg && hasData && (
          <Layout
            className="attendance-changelog-layout"
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
              minHeight: 480,
              flexDirection: isTabletOrDown ? 'column' : 'row',
            }}
          >
            {/* left: date-wise accordion */}
            <Sider
              className="attendance-changelog-sider"
              width={isTabletOrDown ? '100%' : 300}
              style={{
                background: '#fff',
                padding: 16,
                borderRight: isTabletOrDown ? 'none' : '1px solid #f0f0f0',
                borderBottom: isTabletOrDown ? '1px solid #f0f0f0' : 'none',
                flex: isTabletOrDown ? '0 0 auto' : '0 0 300px',
                maxWidth: isTabletOrDown ? '100%' : 300,
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Employee / Month</Text>
                  <div>
                    {empCode && (
                      <Tag color="blue" style={{ marginTop: 4 }}>
                        {empCode}
                      </Tag>
                    )}
                    {monthParam && <Tag style={{ marginTop: 4, marginLeft: 4 }}>{monthParam}</Tag>}
                    <Tag style={{ marginTop: 4, marginLeft: 4 }}>
                      {entries.length} change record
                      {entries.length !== 1 ? 's' : ''}
                    </Tag>
                  </div>
                </div>

                <Input
                  placeholder="Filter fields (column names)"
                  allowClear
                  value={columnFilter}
                  onChange={(e) => setColumnFilter(e.target.value)}
                />

                <div
                  style={{
                    maxHeight: isMobile ? '25vh' : isTabletOrDown ? '40vh' : '70vh',
                    overflow: 'auto',
                    marginTop: 4,
                    paddingRight: 4,
                  }}
                >
                  <Collapse
                    accordion
                    bordered={false}
                    defaultActiveKey={selectedDate ? [selectedDate] : undefined}
                    activeKey={selectedDate ? [selectedDate] : undefined}
                    onChange={(key) => {
                      // key can be string or array; we store a single date string
                      const k = Array.isArray(key) ? key[0] : key
                      setSelectedDate(k || null)
                      // when only date changes and column not set for that date,
                      // reset selectedColumn so user must click a field
                      setSelectedColumn((prevCol) => {
                        const colsForDate = Object.keys(groupedByDateAndColumn[k] || {})
                        return colsForDate.includes(prevCol) ? prevCol : null
                      })
                    }}
                  >
                    {dateKeys.map((dateKey) => {
                      const columnsMap = groupedByDateAndColumn[dateKey] || {}
                      let columnNames = sortColumns(Object.keys(columnsMap))

                      if (columnFilter) {
                        const q = columnFilter.toLowerCase()
                        columnNames = columnNames.filter((c) => c.toLowerCase().includes(q))
                      }

                      if (columnNames.length === 0) return null

                      return (
                        <Panel header={dateKey} key={dateKey}>
                          <List
                            size="small"
                            dataSource={columnNames}
                            locale={{
                              emptyText: 'No fields for this date',
                            }}
                            renderItem={(columnName) => {
                              const versionCount = columnsMap[columnName]?.length || 0
                              const isSelected =
                                selectedDate === dateKey && selectedColumn === columnName

                              return (
                                <List.Item
                                  style={{
                                    cursor: 'pointer',
                                    borderRadius: 8,
                                    padding: '8px 10px',
                                    background: isSelected ? '#e6f4ff' : undefined,
                                    transition: 'background 0.15s ease',
                                  }}
                                  onClick={() => {
                                    setSelectedDate(dateKey)
                                    setSelectedColumn(columnName)
                                  }}
                                >
                                  <div style={{ width: '100%' }}>
                                    <div
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <Text
                                        strong={isSelected}
                                        style={{
                                          maxWidth: '75%',
                                          whiteSpace: 'nowrap',
                                          textOverflow: 'ellipsis',
                                          overflow: 'hidden',
                                        }}
                                      >
                                        {columnName}
                                      </Text>

                                      <Tag
                                        color={isSelected ? 'blue' : 'default'}
                                        style={{ marginLeft: 0 }}
                                      >
                                        {versionCount} version
                                        {versionCount !== 1 ? 's' : ''}
                                      </Tag>
                                    </div>
                                  </div>
                                </List.Item>
                              )
                            }}
                          />
                        </Panel>
                      )
                    })}
                  </Collapse>
                </div>
              </Space>
            </Sider>

            {/* right: timeline */}
            <Content
              className="attendance-changelog-content"
              style={{
                background: '#fafafa',
                padding: 16,
                width: '100%',
              }}
            >
              {selectedDate && selectedColumn ? (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {/* toolbar */}
                  <div
                    className="attendance-changelog-toolbar"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 16,
                      flexWrap: 'wrap',
                      flexDirection: isTabletOrDown ? 'column' : 'row',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <Title level={4} style={{ marginBottom: 0 }}>
                        {selectedColumn} <Text type="secondary">({selectedDate})</Text>
                      </Title>

                      <Text type="secondary">
                        Showing history for this field ({selectedVersions.length} version{' '}
                        {selectedVersions.length !== 1 ? 's' : ''} after filters)
                      </Text>

                      <div style={{ marginTop: 0 }}>
                        <Segmented
                          size="small"
                          value={sortOrder}
                          onChange={(val) => setSortOrder(val)}
                          options={[
                            { label: 'Latest -> Oldest', value: 'desc' },
                            { label: 'Oldest -> Latest', value: 'asc' },
                          ]}
                        />
                      </div>
                    </div>

                    <Space
                      direction="vertical"
                      size="small"
                      style={{
                        minWidth: 220,
                        width: isTabletOrDown ? '100%' : 260,
                        maxWidth: 320,
                      }}
                    >
                      <div>
                        <Text type="secondary">Filter by user</Text>
                        <Select
                          style={{ width: '100%', marginTop: 4 }}
                          allowClear
                          showSearch
                          placeholder="All users"
                          value={userFilter}
                          onChange={(val) => setUserFilter(val)}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                        >
                          {allUsers.map((u) => (
                            <Option key={u} value={u}>
                              {u}
                            </Option>
                          ))}
                        </Select>
                      </div>

                      <Button
                        size="small"
                        type="default"
                        onClick={openCompareModal}
                        disabled={
                          !selectedDate ||
                          !selectedColumn ||
                          (groupedByDateAndColumn[selectedDate]?.[selectedColumn] || []).length < 2
                        }
                      >
                        Compare versions
                      </Button>
                    </Space>
                  </div>

                  {/* timeline */}
                  {selectedVersions.length === 0 ? (
                    <Empty description="No versions for this field (after filters)" />
                  ) : (
                    <div
                      className="timeline-scroll-wrapper"
                      style={{
                        maxHeight: isTabletOrDown ? 'none' : '70vh',
                        overflow: 'auto',
                        paddingTop: 10,
                      }}
                    >
                      <Timeline mode="right">
                        {selectedVersions.map((v, index) => {
                          const isLatest = v?.versionLabel === 'vLatest'
                          const isChanged = v?.oldValue !== v?.newValue
                          const formattedChangedOn = new Date(v?.changedOn).toLocaleString()
                          const formattedChangedOnMob = v?.changedOn?.split('T')[0]
                          const formattedPunchDate = v?.punchDate
                            ? new Date(v.punchDate).toLocaleDateString()
                            : null

                          return (
                            <Timeline.Item
                              key={`${v?.versionLabel}-${v?.changedOn}-${index}`}
                              color={isLatest ? 'green' : isChanged ? 'blue' : 'gray'}
                              label={
                                !isMobile ? (
                                  <Text type="secondary">{formattedChangedOn}</Text>
                                ) : (
                                  formattedChangedOnMob
                                )
                              }
                            >
                              <Card
                                size="small"
                                style={{
                                  borderRadius: 10,
                                  borderColor: isLatest ? '#52c41a' : undefined,
                                }}
                              >
                                <Space direction="vertical" style={{ width: '100%' }} size="small">
                                  <Space
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                    }}
                                  >
                                    <Space size="small" wrap>
                                      <Tag color={getVersionTagColor(v?.versionLabel, isLatest)}>
                                        {v?.versionLabel}
                                      </Tag>

                                      <Tag>{v?.changedBy}</Tag>

                                      {formattedPunchDate && (
                                        <Tag color="geekblue">Punch Date: {formattedPunchDate}</Tag>
                                      )}

                                      {!isChanged && <Tag color="default">no value change</Tag>}
                                    </Space>
                                  </Space>

                                  <SideBySideDiff oldValue={v?.oldValue} newValue={v?.newValue} />
                                </Space>
                              </Card>
                            </Timeline.Item>
                          )
                        })}
                      </Timeline>
                    </div>
                  )}
                </Space>
              ) : (
                <Empty description="Select a date and field from the left to see history" />
              )}
            </Content>
          </Layout>
        )}

        {/* compare versions modal */}
        <Modal
          title={`Compare versions – ${
            selectedColumn ? `${selectedColumn} (${selectedDate})` : ''
          }`}
          open={compareOpen}
          onCancel={() => setCompareOpen(false)}
          footer={[
            <Button key="close" onClick={() => setCompareOpen(false)}>
              Close
            </Button>,
          ]}
          width={900}
        >
          {selectedDate && selectedColumn && (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space style={{ width: '100%' }}>
                <div style={{ flex: 1 }}>
                  <Text type="secondary">Version A</Text>
                  <Select
                    style={{ width: '100%', marginTop: 4 }}
                    value={
                      compareA
                        ? (groupedByDateAndColumn[selectedDate]?.[selectedColumn] || []).indexOf(
                            compareA,
                          )
                        : undefined
                    }
                    onChange={(idx) => setCompareA(getVersionByIndex(idx))}
                  >
                    {renderCompareOptions()}
                  </Select>
                </div>
                <div style={{ flex: 1 }}>
                  <Text type="secondary">Version B</Text>
                  <Select
                    style={{ width: '100%', marginTop: 4 }}
                    value={
                      compareB
                        ? (groupedByDateAndColumn[selectedDate]?.[selectedColumn] || []).indexOf(
                            compareB,
                          )
                        : undefined
                    }
                    onChange={(idx) => setCompareB(getVersionByIndex(idx))}
                  >
                    {renderCompareOptions()}
                  </Select>
                </div>
              </Space>

              {compareBody}
            </Space>
          )}
        </Modal>
      </Space>
    </div>
  )
}

export default AttendanceChangeLog
