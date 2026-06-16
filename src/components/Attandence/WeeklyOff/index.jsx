// import {
//   Space,
//   DatePicker,
//   Table,
//   message,
//   Input,
//   Button,
//   Select,
//   Checkbox,
//   Typography,
//   Tooltip,
// } from 'antd'
// import dayjs from 'dayjs'
// import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
// import {
//   getAllLocations,
//   getDesignations,
//   getWeeklyOffByMonthYear,
//   toggleActive,
//   upsertPolicyDesignation,
// } from '../../../services/Services'
// import { ExportOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
// import { getApiError } from '../../../VendorModule/helpers'
// import { maxDaysInMonth } from '../../../VendorModule/constants'
// import PolicyUploader from './Uploader'
// import axiosInstance from '../../../services/axiosInstance'
// import { useActionsMap } from '../../../utils/useActionsMap'
// import { useSelector } from 'react-redux'
// import CopyToForm from './CopyToForm'

// const { MonthPicker } = DatePicker
// const { Search } = Input

// const DEBOUNCE_MS = 450

// // helpers
// const getLocationCode = (locationName) => String(locationName || '').slice(0, 4)

// const normalizeDecimal2 = (raw) => {
//   let v = String(raw ?? '').replace(/[^\d.]/g, '')
//   v = v.replace(/^\.*/, '')
//   const [intPart = '', ...rest] = v.split('.')
//   const decPart = rest.join('')
//   if (!rest.length) return intPart
//   return `${intPart}.${decPart.slice(0, 2)}`
// }

// const normalizeInteger = (raw) => String(raw ?? '').replace(/[^\d]/g, '')
// const isIntegerString = (v) => /^\d+$/.test(String(v ?? '').trim())

// const hasMax2dp = (s) => {
//   const parts = String(s ?? '').split('.')
//   return parts.length === 1 || parts[1].length <= 2
// }

// const DIRTY_FIELDS = [
//   'locationCategoryId',
//   'designationId',
//   'totalAttendanceFrom',
//   'totalAttendanceTo',
//   'weeklyOff',
// ]

// const WeeklyOff = () => {
//   const [filteredData, setFilteredData] = useState([])

//   const [currentMonth, setCurrentMonth] = useState(dayjs())
//   const monthYear = useMemo(() => currentMonth.format('MMM-YY'), [currentMonth])

//   const [searchText, setSearchText] = useState('')
//   const [debouncedSearch, setDebouncedSearch] = useState('')
//   const debounceRef = useRef(null)

//   const [locations, setLocations] = useState([])
//   const [designations, setDesignations] = useState([])

//   const [tableData, setTableData] = useState([])
//   const [loadingTable, setLoadingTable] = useState(false)

//   const [togglingIds, setTogglingIds] = useState(() => new Set())

//   const [isUploaderOpen, setIsUploaderOpen] = useState(false)
//   const [isExcelDownloading, setIsExcelDownloading] = useState(false)
//   const [submitting, setSubmitting] = useState(false)

//   const [selectedLoc, setSelectedLoc] = useState(null)
//   const [selectedDesg, setSelectedDesg] = useState(null)

//   const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
//   const actionsMap = useActionsMap(filteredSideMenu)

//   const requiredTitle = (title) => (
//     <>
//       {title} <span style={{ color: 'red' }}>*</span>
//     </>
//   )

//   const getMaxDaysForMonth = useCallback(
//     (d) => {
//       const mmm = (d || currentMonth).format('MMM')
//       const max = Number(maxDaysInMonth?.[mmm])
//       return Number.isFinite(max) ? max : 31
//     },
//     [currentMonth],
//   )

//   const setRowLoading = useCallback((setter, id, on) => {
//     setter((prev) => {
//       const next = new Set(prev)
//       if (on) next.add(id)
//       else next.delete(id)
//       return next
//     })
//   }, [])

//   const computeDirty = useCallback((row) => {
//     if (row.__isNew) return true
//     const o = row.__original || {}
//     return DIRTY_FIELDS.some((k) => String(row[k] ?? '') !== String(o[k] ?? ''))
//   }, [])

//   const updateRow = useCallback(
//     (id, patch) => {
//       setTableData((prev) =>
//         prev.map((r) => {
//           if (r.id !== id) return r
//           const next = { ...r, ...patch }
//           next.__dirty = computeDirty(next)
//           return next
//         }),
//       )
//     },
//     [computeDirty],
//   )

//   const isRowComplete = useCallback((row) => {
//     const loc = String(row.locationCategoryId ?? '').trim()
//     const from = String(row.totalAttendanceFrom ?? '').trim()
//     const to = String(row.totalAttendanceTo ?? '').trim()
//     const wo = String(row.weeklyOff ?? '').trim()
//     return !!(loc && from && to && wo)
//   }, [])

//   const validateRow = useCallback(
//     (row, forMonth = currentMonth) => {
//       if (!isRowComplete(row)) return { ok: false, msg: 'Please fill all required columns.' }

//       const fromStr = String(row.totalAttendanceFrom ?? '').trim()
//       const toStr = String(row.totalAttendanceTo ?? '').trim()

//       if (!hasMax2dp(fromStr) || !hasMax2dp(toStr)) {
//         return { ok: false, msg: 'Total Attendance supports maximum 2 decimal places.' }
//       }

//       const from = Number(fromStr)
//       const to = Number(toStr)
//       if (!Number.isFinite(from) || !Number.isFinite(to)) {
//         return { ok: false, msg: 'Total Attendance From/To must be valid numbers.' }
//       }

//       const maxDays = getMaxDaysForMonth(forMonth)
//       if (from <= 0 || to <= 0)
//         return { ok: false, msg: 'Total Attendance must be greater than 0.' }
//       if (from > maxDays || to > maxDays) {
//         return {
//           ok: false,
//           msg: `Total Attendance cannot be more than ${maxDays} for selected month.`,
//         }
//       }
//       if (from >= to) return { ok: false, msg: 'Total Attendance: From must be less than To.' }

//       if (!isIntegerString(row.weeklyOff))
//         return { ok: false, msg: 'Weekly Off must be an integer value.' }

//       return { ok: true }
//     },
//     [currentMonth, getMaxDaysForMonth, isRowComplete],
//   )

//   const getLocationIdFromRow = useCallback(
//     (row) => {
//       if (row.locationId) return row.locationId
//       const code = String(row.locationCategoryId || '').trim()
//       if (!code) return undefined
//       const match = (locations || []).find((l) => getLocationCode(l.locationName) === code)
//       return match?.locationId
//     },
//     [locations],
//   )

//   const toUpsertPayload = useCallback(
//     (row, overrideMonthYear) => ({
//       locationDesignationPolicyId: row.__isNew ? 0 : Number(row.locationDesignationPolicyId ?? 0),
//       locationCategoryId: row.locationCategoryId,
//       designationId: row.designationId ?? null,
//       weeklyOff: Number(row.weeklyOff),
//       monthYear: overrideMonthYear ?? monthYear,
//       totalAttendanceFrom: Number(row.totalAttendanceFrom),
//       totalAttendanceTo: String(row.totalAttendanceTo),
//     }),
//     [monthYear],
//   )

//   // debounce search
//   useEffect(() => {
//     if (debounceRef.current) clearTimeout(debounceRef.current)
//     debounceRef.current = setTimeout(() => {
//       setDebouncedSearch(searchText.trim())
//     }, DEBOUNCE_MS)

//     return () => debounceRef.current && clearTimeout(debounceRef.current)
//   }, [searchText])

//   // fetch locations/designations
//   const fetchLocations = useCallback(async () => {
//     try {
//       const res = await getAllLocations()
//       if (res.status === 200) setLocations(res.data?.data || [])
//     } catch (e) {
//       message.error(e?.response?.data?.message || 'Error fetching locations')
//     }
//   }, [])

//   const fetchDesignations = useCallback(async () => {
//     try {
//       const res = await getDesignations()
//       if (res.status === 200) setDesignations(res.data?.data || [])
//     } catch (e) {
//       message.error(e?.response?.data?.message || 'Error fetching designations')
//     }
//   }, [])

//   const fetchData = useCallback(async () => {
//     try {
//       setLoadingTable(true)
//       const res = await getWeeklyOffByMonthYear({
//         searchTerm: debouncedSearch,
//         monthYear,
//       })

//       if (res.status === 200) {
//         const list = res.data?.data || res.data?.data?.data || res.data?.data || []

//         const normalized = (list || []).map((r) => {
//           const row = {
//             ...r,
//             id: r.locationDesignationPolicyId,
//             __isNew: false,
//             __dirty: false,

//             totalAttendanceFrom: r.totalAttendanceFrom ?? '',
//             totalAttendanceTo: r.totalAttendanceTo ?? '',
//             weeklyOff: r.weeklyOff ?? '',
//             designationId: r.designationId ?? null,
//             locationCategoryId: r.locationCategoryId ?? '',
//           }

//           return {
//             ...row,
//             __original: {
//               locationCategoryId: row.locationCategoryId,
//               designationId: row.designationId,
//               totalAttendanceFrom: String(row.totalAttendanceFrom),
//               totalAttendanceTo: String(row.totalAttendanceTo),
//               weeklyOff: String(row.weeklyOff),
//             },
//           }
//         })

//         setTableData(normalized)
//       }
//     } catch (e) {
//       message.error(getApiError(e, 'Error fetching weekly off master data'))
//     } finally {
//       setLoadingTable(false)
//     }
//   }, [debouncedSearch, monthYear])

//   useEffect(() => {
//     fetchLocations()
//     fetchDesignations()
//   }, [fetchLocations, fetchDesignations])

//   useEffect(() => {
//     fetchData()
//   }, [fetchData])

//   // apply filters to tableData -> filteredData
//   useEffect(() => {
//     let rows = [...tableData]

//     if (selectedLoc) {
//       rows = rows.filter((r) => String(r.locationCategoryId ?? '').trim() === String(selectedLoc))
//     }

//     if (selectedDesg) {
//       rows = rows.filter((r) => String(r.designationId ?? '') === String(selectedDesg))
//     }

//     setFilteredData(rows)
//   }, [tableData, selectedLoc, selectedDesg])

//   // dropdown options should depend on current tableData + other filter
//   const availableLocOptions = useMemo(() => {
//     let rows = tableData
//     if (selectedDesg)
//       rows = rows.filter((r) => String(r.designationId ?? '') === String(selectedDesg))

//     const locMap = new Map()
//     for (const r of rows) {
//       const code =
//         String(r.locationCategoryId ?? '').trim() ||
//         getLocationCode(r.locationCategoryName || r.locationName)
//       const label = r.locationCategoryName || r.locationName || code
//       if (code) locMap.set(code, label)
//     }
//     return Array.from(locMap, ([value, label]) => ({ value, label }))
//   }, [tableData, selectedDesg])

//   const availableDesgOptions = useMemo(() => {
//     let rows = tableData
//     if (selectedLoc)
//       rows = rows.filter((r) => String(r.locationCategoryId ?? '').trim() === String(selectedLoc))

//     const desgMap = new Map()
//     for (const r of rows) {
//       if (r.designationId)
//         desgMap.set(r.designationId, r.designationName || String(r.designationId))
//     }
//     return Array.from(desgMap, ([value, label]) => ({ value, label }))
//   }, [tableData, selectedLoc])

//   // keep selected filters valid
//   useEffect(() => {
//     if (!selectedLoc) return
//     const ok = availableLocOptions.some((o) => String(o.value) === String(selectedLoc))
//     if (!ok) setSelectedLoc(null)
//   }, [availableLocOptions, selectedLoc])

//   useEffect(() => {
//     if (!selectedDesg) return
//     const ok = availableDesgOptions.some((o) => String(o.value) === String(selectedDesg))
//     if (!ok) setSelectedDesg(null)
//   }, [availableDesgOptions, selectedDesg])

//   const handleMonthChange = (d) => {
//     setCurrentMonth(d || dayjs())
//     // reset filters when month changes (optional; remove if you want to keep)
//     setSelectedLoc(null)
//     setSelectedDesg(null)
//   }

//   const handleAdd = () => {
//     const newRow = {
//       id: `tmp-${Date.now()}`,
//       __isNew: true,
//       __dirty: true,
//       __original: {},

//       locationDesignationPolicyId: 0,
//       locationId: undefined,
//       locationName: undefined,
//       locationCategoryId: undefined,
//       locationCategoryName: undefined,

//       designationId: null,
//       designationName: undefined,

//       totalAttendanceFrom: '',
//       totalAttendanceTo: '',
//       weeklyOff: '',
//     }
//     setTableData((prev) => [newRow, ...prev])
//   }

//   const handleToggle = async (row, next) => {
//     if (!row.locationDesignationPolicyId) return
//     try {
//       setRowLoading(setTogglingIds, row.id, true)
//       await toggleActive({
//         locationDesignationPolicyIds: [row.locationDesignationPolicyId],
//         isActive: next,
//       })
//       updateRow(row.id, { isActive: next })
//       message.success('Status updated')
//     } catch (e) {
//       message.error(getApiError(e, 'Error updating status'))
//     } finally {
//       setRowLoading(setTogglingIds, row.id, false)
//     }
//   }

//   const handleSubmit = async () => {
//     const rowsToSubmit = tableData.filter((r) => r.__isNew || r.__dirty)
//     if (!rowsToSubmit.length) return message.info('No changes to submit.')

//     for (const r of rowsToSubmit) {
//       const chk = validateRow(r, currentMonth)
//       if (!chk.ok) return message.error(chk.msg)
//     }

//     try {
//       setSubmitting(true)
//       const res = await upsertPolicyDesignation(rowsToSubmit.map((r) => toUpsertPayload(r)))
//       if (res?.status === 200) {
//         message.success(res.data?.message || 'Submitted successfully')
//         fetchData()
//       }
//     } catch (e) {
//       message.error(getApiError(e, 'Error submitting data'))
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   const handleDownloadExcel = async () => {
//     try {
//       setIsExcelDownloading(true)
//       const response = await axiosInstance.get(
//         '/api/HolidayMaster/GetPolicyDesignationByMonthYear',
//         {
//           responseType: 'blob',
//           params: { isExcel: true, monthYear: currentMonth.format('MMM-YY') },
//         },
//       )

//       if (response.status === 200) {
//         const blob = new Blob([response.data])
//         const url = window.URL.createObjectURL(blob)

//         const anchor = document.createElement('a')
//         anchor.href = url
//         anchor.download = `WeeklyOffData_${new Date().toISOString()}.xlsx`
//         anchor.click()
//         anchor.remove()

//         window.URL.revokeObjectURL(url)
//       }
//     } catch (error) {
//       message.error(getApiError(error, 'Error downloading excel'))
//     } finally {
//       setIsExcelDownloading(false)
//     }
//   }

//   const columns = useMemo(
//     () => [
//       {
//         title: 'Status',
//         dataIndex: 'isActive',
//         width: 90,
//         render: (_, row) => {
//           if (row.__isNew) return null
//           const loading = togglingIds.has(row.id)
//           return (
//             <Checkbox
//               checked={!!row.isActive}
//               disabled={loading}
//               onChange={(e) => handleToggle(row, e.target.checked)}
//             />
//           )
//         },
//       },
//       {
//         title: requiredTitle('Location'),
//         dataIndex: 'locationCategoryName',
//         width: 200,
//         render: (_, row) => (
//           <Select
//             style={{ width: '100%' }}
//             placeholder="Select location"
//             value={getLocationIdFromRow(row)}
//             onChange={(locationId) => {
//               const selected = locations.find((l) => l.locationId === locationId)
//               const locationName = selected?.locationName
//               const code = getLocationCode(locationName)

//               updateRow(row.id, {
//                 locationId,
//                 locationName,
//                 locationCategoryId: code,
//                 locationCategoryName: locationName,
//               })
//             }}
//             showSearch
//             optionFilterProp="children"
//           >
//             {(locations || [])
//               .filter((l) => l?.locationId && l?.locationName)
//               .map((l) => (
//                 <Select.Option key={l.locationId} value={l.locationId}>
//                   {l.locationName}
//                 </Select.Option>
//               ))}
//           </Select>
//         ),
//       },
//       {
//         title: 'Designation',
//         dataIndex: 'designationName',
//         width: 220,
//         render: (_, row) => (
//           <Select
//             style={{ width: '100%' }}
//             placeholder="Select designation"
//             value={row.designationId}
//             onChange={(designationId) => {
//               const selected = designations.find((d) => d.designationId === designationId)
//               updateRow(row.id, { designationId, designationName: selected?.designationName })
//             }}
//             showSearch
//             optionFilterProp="children"
//             allowClear
//           >
//             {(designations || [])
//               .filter((d) => d?.designationId && d?.designationName)
//               .map((d) => (
//                 <Select.Option key={d.designationId} value={d.designationId}>
//                   {d.designationName}
//                 </Select.Option>
//               ))}
//           </Select>
//         ),
//       },
//       {
//         title: (
//           <div style={{ textAlign: 'center' }}>
//             {requiredTitle('Total Attendance')}
//             <div
//               style={{
//                 display: 'flex',
//                 gap: 8,
//                 marginTop: 4,
//                 fontSize: 14,
//                 color: '#8c8c8c',
//                 fontWeight: 400,
//               }}
//             >
//               <div style={{ flex: 1, textAlign: 'center' }}>From</div>
//               <div style={{ width: 16 }} />
//               <div style={{ flex: 1, textAlign: 'center' }}>To</div>
//             </div>
//           </div>
//         ),
//         dataIndex: 'totalAttendanceRange',
//         width: 260,
//         render: (_, row) => (
//           <Space style={{ width: '100%' }}>
//             <Input
//               style={{ flex: 1 }}
//               inputMode="decimal"
//               placeholder="From: e.g. 2"
//               value={row.totalAttendanceFrom}
//               onChange={(e) =>
//                 updateRow(row.id, { totalAttendanceFrom: normalizeDecimal2(e.target.value) })
//               }
//             />
//             <Input
//               style={{ flex: 1 }}
//               inputMode="decimal"
//               placeholder="To: e.g. 4"
//               value={row.totalAttendanceTo}
//               onChange={(e) =>
//                 updateRow(row.id, { totalAttendanceTo: normalizeDecimal2(e.target.value) })
//               }
//             />
//           </Space>
//         ),
//       },
//       {
//         title: requiredTitle('Weekly Off'),
//         dataIndex: 'weeklyOff',
//         width: 140,
//         render: (_, row) => (
//           <Input
//             inputMode="numeric"
//             placeholder="e.g. 4"
//             value={row.weeklyOff}
//             onChange={(e) => updateRow(row.id, { weeklyOff: normalizeInteger(e.target.value) })}
//           />
//         ),
//       },
//     ],
//     [designations, getLocationIdFromRow, locations, togglingIds, updateRow],
//   )

//   const totalWidth = useMemo(() => columns.reduce((sum, c) => sum + (c.width || 150), 0), [columns])

//   return (
//     <>
//       <PolicyUploader
//         isVisible={isUploaderOpen}
//         setIsVisible={setIsUploaderOpen}
//         refreshData={fetchData}
//       />

//       <Space
//         style={{
//           width: '100%',
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           marginBottom: '1rem',
//         }}
//       >
//         <Typography.Text type="secondary">
//           Total Records: <b>{filteredData.length}</b>
//         </Typography.Text>

//         <Space>
//           <MonthPicker
//             value={currentMonth}
//             onChange={handleMonthChange}
//             style={{ width: '6.6rem' }}
//           />
//           <Button icon={<PlusOutlined />} onClick={handleAdd}>
//             Add New
//           </Button>

//           {actionsMap?.upload?.actionStatus && (
//             <Tooltip title="Upload Data">
//               <Button icon={<UploadOutlined />} onClick={() => setIsUploaderOpen(true)} />
//             </Tooltip>
//           )}

//           <Tooltip title="Export all data for the month">
//             <Button
//               icon={<ExportOutlined />}
//               onClick={handleDownloadExcel}
//               loading={isExcelDownloading}
//             />
//           </Tooltip>

//           <Search
//             placeholder="Search..."
//             value={searchText}
//             onChange={(e) => setSearchText(e.target.value)}
//             allowClear
//             style={{ width: 240 }}
//           />
//         </Space>
//       </Space>

//       <Space
//         style={{
//           display: 'flex',
//           alignItems: 'center',
//           marginBottom: '0.6rem',
//           justifyContent: 'space-between',
//         }}
//       >
//         <Space>
//           <Select
//             style={{ width: 220 }}
//             placeholder="Filter Location"
//             value={selectedLoc}
//             allowClear
//             showSearch
//             optionFilterProp="label"
//             options={availableLocOptions}
//             onChange={(val) => setSelectedLoc(val || null)}
//           />

//           <Select
//             style={{ width: 220 }}
//             placeholder="Filter Designation"
//             value={selectedDesg}
//             allowClear
//             showSearch
//             optionFilterProp="label"
//             options={availableDesgOptions}
//             onChange={(val) => setSelectedDesg(val || null)}
//           />
//         </Space>

//         <div style={{ display: 'flex', alignItems: 'center' }}>
//           <CopyToForm
//             validateRow={validateRow}
//             rowsToCopy={filteredData}
//             currentMonth={currentMonth}
//           />
//           <span style={{ fontSize: '0.89rem', marginLeft: 8 }}>
//             (Copy filtered data to selected month)
//           </span>
//         </div>
//       </Space>

//       <Table
//         rowKey="id"
//         columns={columns}
//         dataSource={filteredData}
//         loading={loadingTable}
//         scroll={tableData.length ? { y: 'calc(100vh - 210px)', x: totalWidth } : undefined}
//         pagination={false}
//       />

//       <Space style={{ width: '100%', display: 'flex', justifyContent: 'end', marginTop: '0.6rem' }}>
//         <Button type="primary" onClick={handleSubmit} loading={submitting}>
//           Submit
//         </Button>
//       </Space>
//     </>
//   )
// }

// export default WeeklyOff

import {
  Space,
  DatePicker,
  Table,
  message,
  Input,
  Button,
  Select,
  Checkbox,
  Typography,
  Tooltip,
} from 'antd'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  getDesignations,
  getWeeklyOffByMonthYear,
  toggleActive,
  upsertPolicyDesignation,
  getLocDesgPolicyCat, // ✅ NEW
} from '../../../services/Services'
import { ExportOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { getApiError } from '../../../VendorModule/helpers'
import { maxDaysInMonth } from '../../../VendorModule/constants'
import PolicyUploader from './Uploader'
import axiosInstance from '../../../services/axiosInstance'
import { useActionsMap } from '../../../utils/useActionsMap'
import { useSelector } from 'react-redux'
import CopyToForm from './CopyToForm'

const { MonthPicker } = DatePicker
const { Search } = Input

const DEBOUNCE_MS = 450

// helpers
const normalizeDecimal2 = (raw) => {
  let v = String(raw ?? '').replace(/[^\d.]/g, '')
  v = v.replace(/^\.*/, '')
  const [intPart = '', ...rest] = v.split('.')
  const decPart = rest.join('')
  if (!rest.length) return intPart
  return `${intPart}.${decPart.slice(0, 2)}`
}

const normalizeInteger = (raw) => String(raw ?? '').replace(/[^\d]/g, '')
const isIntegerString = (v) => /^\d+$/.test(String(v ?? '').trim())

const hasMax2dp = (s) => {
  const parts = String(s ?? '').split('.')
  return parts.length === 1 || parts[1].length <= 2
}

const DIRTY_FIELDS = [
  'locationCategoryId',
  'designationId',
  'totalAttendanceFrom',
  'totalAttendanceTo',
  'weeklyOff',
  'forWhichWeeks', // ✅ NEW
]

const WeeklyOff = () => {
  const [filteredData, setFilteredData] = useState([])

  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const monthYear = useMemo(() => currentMonth.format('MMM-YY'), [currentMonth])

  const [searchText, setSearchText] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const debounceRef = useRef(null)

  // ✅ ONLY use getLocDesgPolicyCat() for Location options
  const [locPolicyCats, setLocPolicyCats] = useState([])

  const [designations, setDesignations] = useState([])

  const [tableData, setTableData] = useState([])
  const [loadingTable, setLoadingTable] = useState(false)

  const [togglingIds, setTogglingIds] = useState(() => new Set())

  const [isUploaderOpen, setIsUploaderOpen] = useState(false)
  const [isExcelDownloading, setIsExcelDownloading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [selectedLoc, setSelectedLoc] = useState(null)
  const [selectedDesg, setSelectedDesg] = useState(null)

  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)

  const requiredTitle = (title) => (
    <>
      {title} <span style={{ color: 'red' }}>*</span>
    </>
  )

  const getMaxDaysForMonth = useCallback(
    (d) => {
      const mmm = (d || currentMonth).format('MMM')
      const max = Number(maxDaysInMonth?.[mmm])
      return Number.isFinite(max) ? max : 31
    },
    [currentMonth],
  )

  const setRowLoading = useCallback((setter, id, on) => {
    setter((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const computeDirty = useCallback((row) => {
    if (row.__isNew) return true
    const o = row.__original || {}
    return DIRTY_FIELDS.some((k) => String(row[k] ?? '') !== String(o[k] ?? ''))
  }, [])

  const updateRow = useCallback(
    (id, patch) => {
      setTableData((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r
          const next = { ...r, ...patch }
          next.__dirty = computeDirty(next)
          return next
        }),
      )
    },
    [computeDirty],
  )

  const isRowComplete = useCallback((row) => {
    const loc = String(row.locationCategoryId ?? '').trim()
    const desg = String(row.designationId ?? '').trim()
    const from = String(row.totalAttendanceFrom ?? '').trim()
    const to = String(row.totalAttendanceTo ?? '').trim()
    const wo = String(row.weeklyOff ?? '').trim()
    const wks = String(row.forWhichWeeks ?? '').trim()

    return !!(loc && desg && from && to && wo && wks)
  }, [])

  const validateRow = useCallback(
    (row, forMonth = currentMonth) => {
      if (!isRowComplete(row)) return { ok: false, msg: 'Please fill all required columns.' }

      const fromStr = String(row.totalAttendanceFrom ?? '').trim()
      const toStr = String(row.totalAttendanceTo ?? '').trim()

      if (!hasMax2dp(fromStr) || !hasMax2dp(toStr)) {
        return { ok: false, msg: 'Total Attendance supports maximum 2 decimal places.' }
      }

      const from = Number(fromStr)
      const to = Number(toStr)
      if (!Number.isFinite(from) || !Number.isFinite(to)) {
        return { ok: false, msg: 'Total Attendance From/To must be valid numbers.' }
      }

      const maxDays = getMaxDaysForMonth(forMonth)
      if (from <= 0 || to <= 0)
        return { ok: false, msg: 'Total Attendance must be greater than 0.' }
      if (from > maxDays || to > maxDays) {
        return {
          ok: false,
          msg: `Total Attendance cannot be more than ${maxDays} for selected month.`,
        }
      }
      if (from >= to) return { ok: false, msg: 'Total Attendance: From must be less than To.' }

      if (!isIntegerString(row.weeklyOff))
        return { ok: false, msg: 'Weekly Off must be an integer value.' }

      if (!isIntegerString(row.forWhichWeeks))
        return { ok: false, msg: 'For Which Weeks must be an integer value.' }

      return { ok: true }
    },
    [currentMonth, getMaxDaysForMonth, isRowComplete],
  )

  const toUpsertPayload = useCallback(
    (row, overrideMonthYear) => ({
      locationDesignationPolicyId: row.__isNew ? 0 : Number(row.locationDesignationPolicyId ?? 0),
      locationCategoryId: row.locationCategoryId, // ✅ send categoryCode
      designationId: Number(row.designationId) || 0,
      totalAttendanceTo: String(row.totalAttendanceTo),
      weeklyOff: Number(row.weeklyOff),
      forWhichWeeks: Number(row.forWhichWeeks), // ✅ NEW
      monthYear: overrideMonthYear ?? monthYear,
      totalAttendanceFrom: Number(row.totalAttendanceFrom),
      isActive: row.__isNew ? true : !!row.isActive,
    }),
    [monthYear],
  )

  // debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchText.trim())
    }, DEBOUNCE_MS)

    return () => debounceRef.current && clearTimeout(debounceRef.current)
  }, [searchText])

  // ✅ fetch location policy categories
  const fetchLocPolicyCats = useCallback(async () => {
    try {
      const res = await getLocDesgPolicyCat()
      const list = res?.data?.data || res?.data || []
      setLocPolicyCats(Array.isArray(list) ? list : [])
    } catch (e) {
      message.error(getApiError(e, 'Error fetching location categories'))
    }
  }, [])

  // fetch designations
  const fetchDesignations = useCallback(async () => {
    try {
      const res = await getDesignations()
      if (res.status === 200) setDesignations(res.data?.data || [])
    } catch (e) {
      message.error(e?.response?.data?.message || 'Error fetching designations')
    }
  }, [])

  const fetchData = useCallback(async () => {
    try {
      setLoadingTable(true)
      const res = await getWeeklyOffByMonthYear({
        searchTerm: debouncedSearch,
        monthYear,
      })

      if (res.status === 200) {
        const list = res.data?.data || res.data?.data?.data || res.data?.data || []

        const normalized = (list || []).map((r) => {
          const row = {
            ...r,
            id: r.locationDesignationPolicyId,
            __isNew: false,
            __dirty: false,

            totalAttendanceFrom: r.totalAttendanceFrom ?? '',
            totalAttendanceTo: r.totalAttendanceTo ?? '',
            weeklyOff: r.weeklyOff ?? '',
            forWhichWeeks: r.forWhichWeeks ?? '', // ✅ NEW

            designationId: r.designationId ?? null,
            designationName: r.designationName ?? '',

            // API gives categoryCode directly in locationCategoryId
            locationCategoryId: r.locationCategoryId ?? '',
          }

          return {
            ...row,
            __original: {
              locationCategoryId: String(row.locationCategoryId ?? ''),
              designationId: String(row.designationId ?? ''),
              totalAttendanceFrom: String(row.totalAttendanceFrom),
              totalAttendanceTo: String(row.totalAttendanceTo),
              weeklyOff: String(row.weeklyOff),
              forWhichWeeks: String(row.forWhichWeeks ?? ''), // ✅ NEW
            },
          }
        })

        setTableData(normalized)
      }
    } catch (e) {
      message.error(getApiError(e, 'Error fetching weekly off master data'))
    } finally {
      setLoadingTable(false)
    }
  }, [debouncedSearch, monthYear])

  useEffect(() => {
    fetchLocPolicyCats()
    fetchDesignations()
  }, [fetchLocPolicyCats, fetchDesignations])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // apply filters to tableData -> filteredData
  useEffect(() => {
    let rows = [...tableData]

    if (selectedLoc) {
      rows = rows.filter((r) => String(r.locationCategoryId ?? '').trim() === String(selectedLoc))
    }

    if (selectedDesg) {
      rows = rows.filter((r) => String(r.designationId ?? '') === String(selectedDesg))
    }

    setFilteredData(rows)
  }, [tableData, selectedLoc, selectedDesg])

  // ✅ Location dropdown options ONLY from getLocDesgPolicyCat()
  const locPolicyCatOptions = useMemo(() => {
    return (locPolicyCats || [])
      .filter((x) => x?.categoryCode)
      .map((x) => {
        const code = String(x.categoryCode).trim()
        const name = x.categoryName ? String(x.categoryName).trim() : ''
        const label = name ? `${code} - ${name}` : code
        return { value: code, label }
      })
  }, [locPolicyCats])

  const desgOptions = useMemo(() => {
    return (designations || [])
      .filter((d) => d?.designationId && d?.designationName)
      .map((d) => ({ value: d.designationId, label: d.designationName }))
  }, [designations])

  // keep selected filters valid (now based on service lists)
  useEffect(() => {
    if (!selectedLoc) return
    const ok = locPolicyCatOptions.some((o) => String(o.value) === String(selectedLoc))
    if (!ok) setSelectedLoc(null)
  }, [locPolicyCatOptions, selectedLoc])

  useEffect(() => {
    if (!selectedDesg) return
    const ok = desgOptions.some((o) => String(o.value) === String(selectedDesg))
    if (!ok) setSelectedDesg(null)
  }, [desgOptions, selectedDesg])

  const handleMonthChange = (d) => {
    setCurrentMonth(d || dayjs())
    setSelectedLoc(null)
    setSelectedDesg(null)
  }

  const handleAdd = () => {
    const newRow = {
      id: `tmp-${Date.now()}`,
      __isNew: true,
      __dirty: true,
      __original: {},

      locationDesignationPolicyId: 0,
      locationCategoryId: '',

      designationId: null,
      designationName: '',

      totalAttendanceFrom: '',
      totalAttendanceTo: '',
      weeklyOff: '',
      forWhichWeeks: '', // ✅ NEW
      isActive: true,
    }
    setTableData((prev) => [newRow, ...prev])
  }

  const handleToggle = async (row, next) => {
    if (!row.locationDesignationPolicyId) return
    try {
      setRowLoading(setTogglingIds, row.id, true)
      await toggleActive({
        locationDesignationPolicyIds: [row.locationDesignationPolicyId],
        isActive: next,
      })
      updateRow(row.id, { isActive: next })
      message.success('Status updated')
    } catch (e) {
      message.error(getApiError(e, 'Error updating status'))
    } finally {
      setRowLoading(setTogglingIds, row.id, false)
    }
  }

  const handleSubmit = async () => {
    const rowsToSubmit = tableData.filter((r) => r.__isNew || r.__dirty)
    if (!rowsToSubmit.length) return message.info('No changes to submit.')

    for (const r of rowsToSubmit) {
      const chk = validateRow(r, currentMonth)
      if (!chk.ok) return message.error(chk.msg)
    }

    try {
      setSubmitting(true)
      const res = await upsertPolicyDesignation(rowsToSubmit.map((r) => toUpsertPayload(r)))
      if (res?.status === 200) {
        message.success(res.data?.message || 'Submitted successfully')
        fetchData()
      }
    } catch (e) {
      message.error(getApiError(e, 'Error submitting data'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadExcel = async () => {
    try {
      setIsExcelDownloading(true)
      const response = await axiosInstance.get(
        '/api/HolidayMaster/GetPolicyDesignationByMonthYear',
        {
          responseType: 'blob',
          params: { isExcel: true, monthYear: currentMonth.format('MMM-YY') },
        },
      )

      if (response.status === 200) {
        const blob = new Blob([response.data])
        const url = window.URL.createObjectURL(blob)

        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `WeeklyOffData_${new Date().toISOString()}.xlsx`
        anchor.click()
        anchor.remove()

        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      message.error(getApiError(error, 'Error downloading excel'))
    } finally {
      setIsExcelDownloading(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        title: requiredTitle('Location'),
        dataIndex: 'locationCategoryId',
        width: 220,
        render: (_, row) => (
          <Select
            style={{ width: '100%' }}
            placeholder="Select location"
            value={row.locationCategoryId || undefined}
            onChange={(val) => updateRow(row.id, { locationCategoryId: val })}
            showSearch
            optionFilterProp="label"
            options={locPolicyCatOptions}
          />
        ),
      },
      {
        title: requiredTitle('Designation'),
        dataIndex: 'designationId',
        width: 240,
        render: (_, row) => {
          // Always show the stored name: if the row's designation isn't in the loaded
          // dropdown options (still loading, type mismatch, or an inactive designation),
          // prepend a fallback option built from the row's own designationName.
          const hasOption =
            row.designationId != null &&
            desgOptions.some((o) => String(o.value) === String(row.designationId))
          const rowDesgOptions =
            row.designationId != null && !hasOption
              ? [
                  {
                    value: row.designationId,
                    label: row.designationName || String(row.designationId),
                  },
                  ...desgOptions,
                ]
              : desgOptions
          return (
            <Select
              style={{ width: '100%' }}
              placeholder="Select designation"
              value={row.designationId ?? undefined}
              onChange={(designationId) => {
                const selected = (designations || []).find((d) => d.designationId === designationId)
                updateRow(row.id, { designationId, designationName: selected?.designationName })
              }}
              showSearch
              optionFilterProp="label"
              allowClear
              options={rowDesgOptions}
            />
          )
        },
      },
      {
        title: (
          <div style={{ textAlign: 'center' }}>
            {requiredTitle('Total Attendance')}
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 4,
                fontSize: 14,
                color: '#8c8c8c',
                fontWeight: 400,
              }}
            >
              <div style={{ flex: 1, textAlign: 'center' }}>From</div>
              <div style={{ width: 16 }} />
              <div style={{ flex: 1, textAlign: 'center' }}>To</div>
            </div>
          </div>
        ),
        dataIndex: 'totalAttendanceRange',
        width: 260,
        render: (_, row) => (
          <Space style={{ width: '100%' }}>
            <Input
              style={{ flex: 1 }}
              inputMode="decimal"
              placeholder="From: e.g. 2"
              value={row.totalAttendanceFrom}
              onChange={(e) =>
                updateRow(row.id, { totalAttendanceFrom: normalizeDecimal2(e.target.value) })
              }
            />
            <Input
              style={{ flex: 1 }}
              inputMode="decimal"
              placeholder="To: e.g. 4"
              value={row.totalAttendanceTo}
              onChange={(e) =>
                updateRow(row.id, { totalAttendanceTo: normalizeDecimal2(e.target.value) })
              }
            />
          </Space>
        ),
      },
      {
        title: requiredTitle('Weekly Off'),
        dataIndex: 'weeklyOff',
        width: 140,
        render: (_, row) => (
          <Input
            inputMode="numeric"
            placeholder="e.g. 4"
            value={row.weeklyOff}
            onChange={(e) => updateRow(row.id, { weeklyOff: normalizeInteger(e.target.value) })}
          />
        ),
      },
      {
        title: requiredTitle('For Which Weeks'),
        dataIndex: 'forWhichWeeks',
        width: 170,
        render: (_, row) => (
          <Input
            inputMode="numeric"
            placeholder="e.g. 1"
            value={row.forWhichWeeks}
            onChange={(e) => updateRow(row.id, { forWhichWeeks: normalizeInteger(e.target.value) })}
          />
        ),
      },
    ],
    [
      desgOptions,
      designations,
      handleToggle,
      locPolicyCatOptions,
      requiredTitle,
      togglingIds,
      updateRow,
    ],
  )

  const totalWidth = useMemo(() => columns.reduce((sum, c) => sum + (c.width || 150), 0), [columns])

  return (
    <>
      <PolicyUploader
        isVisible={isUploaderOpen}
        setIsVisible={setIsUploaderOpen}
        refreshData={fetchData}
      />

      <Space
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <Typography.Text type="secondary">
          Total Records: <b>{filteredData.length}</b>
        </Typography.Text>

        <Space>
          <MonthPicker
            value={currentMonth}
            onChange={handleMonthChange}
            style={{ width: '6.6rem' }}
          />
          <Button icon={<PlusOutlined />} onClick={handleAdd}>
            Add New
          </Button>

          {actionsMap?.upload?.actionStatus && (
            <Tooltip title="Upload Data">
              <Button icon={<UploadOutlined />} onClick={() => setIsUploaderOpen(true)} />
            </Tooltip>
          )}

          <Tooltip title="Export all data for the month">
            <Button
              icon={<ExportOutlined />}
              onClick={handleDownloadExcel}
              loading={isExcelDownloading}
            />
          </Tooltip>

          <Search
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 240 }}
          />
        </Space>
      </Space>

      <Space
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '0.6rem',
          justifyContent: 'space-between',
        }}
      >
        <Space>
          {/* ✅ Filter Location now ONLY from getLocDesgPolicyCat() */}
          <Select
            style={{ width: 260 }}
            placeholder="Filter Location"
            value={selectedLoc}
            allowClear
            showSearch
            optionFilterProp="label"
            options={locPolicyCatOptions}
            onChange={(val) => setSelectedLoc(val || null)}
          />

          <Select
            style={{ width: 260 }}
            placeholder="Filter Designation"
            value={selectedDesg}
            allowClear
            showSearch
            optionFilterProp="label"
            options={desgOptions}
            onChange={(val) => setSelectedDesg(val || null)}
          />
        </Space>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CopyToForm
            validateRow={validateRow}
            rowsToCopy={filteredData}
            currentMonth={currentMonth}
          />
          <span style={{ fontSize: '0.89rem', marginLeft: 8 }}>
            (Copy filtered data to selected month)
          </span>
        </div>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        loading={loadingTable}
        scroll={tableData.length ? { y: 'calc(100vh - 210px)', x: totalWidth } : undefined}
        pagination={false}
      />

      <Space style={{ width: '100%', display: 'flex', justifyContent: 'end', marginTop: '0.6rem' }}>
        <Button type="primary" onClick={handleSubmit} loading={submitting}>
          Submit
        </Button>
      </Space>
    </>
  )
}

export default WeeklyOff
