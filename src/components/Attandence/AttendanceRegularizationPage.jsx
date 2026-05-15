// import React, { useState, useEffect } from 'react'
// import {
//   Layout,
//   Card,
//   Form,
//   DatePicker,
//   Button,
//   Table,
//   Alert,
//   Typography,
//   Space,
// } from 'antd'
// import dayjs from 'dayjs'
// import 'src/components/Attandence/AttendanceRegularization.css'

// const { Content } = Layout
// const { Title, Text } = Typography

// // Make sure .env has: VITE_API_URL=http://localhost:13000/  (with trailing /)
// const API_BASE_URL = import.meta.env.VITE_API_URL
// const API_URL = `${API_BASE_URL}api/AttendanceRegularization`

// function formatDateTime(value) {
//   if (!value) return '-'
//   const d = new Date(value)
//   if (isNaN(d.getTime())) return value
//   return d.toLocaleString()
// }

// // Helper to build multi-select filters from current data
// const buildColumnFilters = (data, dataIndex) => {
//   const values = Array.from(
//     new Set(
//       data
//         .map((row) => row[dataIndex])
//         .filter((v) => v !== null && v !== undefined && v !== '')
//     )
//   )

//   return values.map((v) => ({
//     text: String(v),
//     value: v,
//   }))
// }

// const AttendanceRegularizationPage = () => {
//   const [form] = Form.useForm()
//   const [data, setData] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [excelLoading, setExcelLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [message, setMessage] = useState('')

//   // Default month = current month
//   const defaultMonth = dayjs()
//   const [selectedMonth, setSelectedMonth] = useState(defaultMonth)

//   const getMonthYearParam = (monthMoment) => {
//     const m = monthMoment || defaultMonth
//     // Format: MMM-YY (e.g., Nov-25)
//     return m.format('MMM-YY')
//   }

//   const fetchData = async (monthMoment) => {
//     setLoading(true)
//     setError('')
//     setMessage('')

//     try {
//       const monthYearParam = getMonthYearParam(monthMoment)
//       const url = `${API_URL}/GetAttendanceRegularization?monthYear=${monthYearParam}`

//       const res = await fetch(url)
//       const json = await res.json()

//       if (!res.ok || !json.status) {
//         throw new Error(json.message || 'Failed to fetch data')
//       }

//       setData(Array.isArray(json.data) ? json.data : [])
//       setMessage(json.message || 'Data loaded successfully')
//     } catch (err) {
//       setError(err.message || 'Something went wrong')
//       setData([])
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     if (!selectedMonth) return
//     fetchData(selectedMonth)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedMonth])

//   const handleDownloadExcel = async () => {
//     setExcelLoading(true)
//     setError('')
//     setMessage('')

//     try {
//       const monthYearParam = getMonthYearParam(selectedMonth)
//       const url = `${API_URL}/GetAttendanceRegularization?monthYear=${monthYearParam}&asExcel=true`

//       const res = await fetch(url)
//       if (!res.ok) {
//         throw new Error(`Excel download failed (${res.status})`)
//       }

//       const blob = await res.blob()
//       const blobUrl = window.URL.createObjectURL(blob)

//       const timestamp = new Date()
//         .toISOString()
//         .replace(/[-:T.Z]/g, '')
//         .slice(0, 14)
//       const filename = `AttendanceRegularization_${monthYearParam}_${timestamp}.xlsx`

//       const link = document.createElement('a')
//       link.href = blobUrl
//       link.download = filename
//       document.body.appendChild(link)
//       link.click()
//       link.remove()
//       window.URL.revokeObjectURL(blobUrl)

//       // we still set message internally, but don't show success bar
//       setMessage('Excel downloaded successfully')
//     } catch (err) {
//       setError(err.message || 'Failed to download Excel')
//     } finally {
//       setExcelLoading(false)
//     }
//   }

//   const columns = [
//     {
//       title: 'Emp Code',
//       dataIndex: 'ecode',
//       key: 'ecode',
//       fixed: 'left',
//       width: 100,
//       filters: buildColumnFilters(data, 'ecode'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (value, record) => record.ecode === value,
//     },
//     {
//       title: 'Employee Name',
//       dataIndex: 'empName',
//       key: 'empName',
//       width: 160,
//       filters: buildColumnFilters(data, 'empName'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (value, record) => record.empName === value,
//     },
//     {
//       title: 'Store Code',
//       dataIndex: 'stCode',
//       key: 'stCode',
//       width: 100,
//       filters: buildColumnFilters(data, 'stCode'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (value, record) => record.stCode === value,
//     },
//     {
//       title: 'Location',
//       dataIndex: 'locationName',
//       key: 'locationName',
//       width: 140,
//       filters: buildColumnFilters(data, 'locationName'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (value, record) => record.locationName === value,
//     },
//     {
//       title: 'Department',
//       dataIndex: 'departmentName',
//       key: 'departmentName',
//       width: 140,
//       filters: buildColumnFilters(data, 'departmentName'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (value, record) => record.departmentName === value,
//     },
//     {
//       title: 'Designation',
//       dataIndex: 'designationName',
//       key: 'designationName',
//       width: 160,
//       filters: buildColumnFilters(data, 'designationName'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (value, record) => record.designationName === value,
//     },
//     {
//       title: 'Request Date',
//       dataIndex: 'requestDate',
//       key: 'requestDate',
//       width: 180,
//       render: (val) => formatDateTime(val),
//       filters: buildColumnFilters(data, 'requestDate'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (value, record) => record.requestDate === value,
//     },
//     {
//       title: 'Reason',
//       dataIndex: 'reason',
//       key: 'reason',
//       width: 200,
//       ellipsis: true,
//       filters: buildColumnFilters(data, 'reason'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (value, record) => record.reason === value,
//     },
//     {
//       title: 'Punch In',
//       dataIndex: 'punchIn',
//       key: 'punchIn',
//       width: 100,
//       filters: buildColumnFilters(data, 'punchIn'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (value, record) => record.punchIn === value,
//     },
//     {
//       title: 'Punch Out',
//       dataIndex: 'punchOut',
//       key: 'punchOut',
//       width: 100,
//       filters: buildColumnFilters(data, 'punchOut'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (value, record) => record.punchOut === value,
//     },
//     {
//       title: 'Status',
//       dataIndex: 'statusName',
//       key: 'statusName',
//       width: 120,
//       filters: buildColumnFilters(data, 'statusName'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (value, record) => record.statusName === value,
//     },
//     {
//       title: 'Request Type',
//       dataIndex: 'requestTypeName',
//       key: 'requestTypeName',
//       width: 140,
//       filters: buildColumnFilters(data, 'requestTypeName'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (value, record) => record.requestTypeName === value,
//     },
//     {
//       title: 'Manager Status',
//       dataIndex: 'managerStatus',
//       key: 'managerStatus',
//       width: 140,
//       filters: buildColumnFilters(data, 'managerStatus'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (value, record) => record.managerStatus === value,
//     },
//     {
//       title: 'Manager Approval On',
//       dataIndex: 'managerApprovalOn',
//       key: 'managerApprovalOn',
//       width: 180,
//       render: (val) => formatDateTime(val),
//       filters: buildColumnFilters(data, 'managerApprovalOn'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (value, record) => record.managerApprovalOn === value,
//     },
//     {
//       title: 'File',
//       dataIndex: 'fileUrl',
//       key: 'fileUrl',
//       width: 100,
//       render: (val) =>
//         val ? (
//           <a href={val} target="_blank" rel="noopener noreferrer">
//             View
//           </a>
//         ) : (
//           '-'
//         ),
//     },
//   ]

//   return (
//     <Layout className="ar-layout">
//       <Content className="ar-content">
//         <Card className="ar-card-ant" bordered={false}>
//           <Space direction="vertical" size="middle" style={{ width: '100%' }}>
//             <div>
//               <Title level={3} style={{ marginBottom: 4 }}>
//                 Attendance Regularization
//               </Title>
//               <Text type="secondary">
//                 View and export attendance regularization data by month.
//               </Text>
//             </div>

//             {/* Filters */}
//             <Card size="small" className="ar-filter-card" bordered>
//               <Form
//                 form={form}
//                 layout="inline"
//                 initialValues={{ month: defaultMonth }}
//               >
//                 <Form.Item
//                   label="Month"
//                   name="month"
//                   rules={[{ required: true, message: 'Please select month' }]}
//                 >
//                   <DatePicker
//                     picker="month"
//                     format="MMM-YY"
//                     allowClear={false}
//                     onChange={(value) => {
//                       setSelectedMonth(value || defaultMonth)
//                     }}
//                   />
//                 </Form.Item>

//                 <Form.Item>
//                   <Space>
//                     <Button
//                       loading={excelLoading}
//                       onClick={handleDownloadExcel}
//                     >
//                       Download Excel
//                     </Button>
//                   </Space>
//                 </Form.Item>
//               </Form>

//               <div style={{ marginTop: 8 }}>
//                 <Text type="secondary">
//                   Selected Month-Year:&nbsp;
//                   <Text strong>{getMonthYearParam(selectedMonth)}</Text>
//                 </Text>
//               </div>
//             </Card>

//             {/* Only error bar now */}
//             {/* {error && (
//               <Alert
//                 type="error"
//                 message="Error"
//                 description={error}
//                 showIcon
//               />
//             )} */}

//             {/* Table */}
//             <Card size="small" bodyStyle={{ padding: 0 }}>
//               <Table
//                 size="small"
//                 rowKey={(row, idx) => row.id || row.ecode + idx}
//                 columns={columns}
//                 dataSource={data}
//                 loading={loading}
//                 scroll={{ x: 1400, y: 500 }}
//                 pagination={{
//                   pageSize: 20,
//                   showSizeChanger: true,
//                   showTotal: (total) => `Total ${total} records`,
//                 }}
//               />
//               {(!data || data.length === 0) && !loading && !error && (
//                 <div className="ar-empty-ant">
//                   <Text type="secondary">
//                     No data loaded for this month.
//                   </Text>
//                 </div>
//               )}
//             </Card>
//           </Space>
//         </Card>
//       </Content>
//     </Layout>
//   )
// }

// export default AttendanceRegularizationPage


// import React, { useState, useEffect } from 'react'
// import { Layout, Form, DatePicker, Button, Table, Typography, Space } from 'antd'
// import dayjs from 'dayjs'
// import 'src/components/Attandence/AttendanceRegularization.css'

// const { Content } = Layout
// const { Title, Text } = Typography

// const API_BASE_URL = import.meta.env.VITE_API_URL
// const API_URL = `${API_BASE_URL}api/AttendanceRegularization`

// function formatDateTime(value) {
//   if (!value) return '-'
//   const d = new Date(value)
//   if (isNaN(d.getTime())) return value
//   return d.toLocaleString()
// }

// const buildColumnFilters = (data, dataIndex) => {
//   const values = Array.from(
//     new Set(
//       data.map((row) => row[dataIndex]).filter((v) => v !== null && v !== undefined && v !== ''),
//     ),
//   )

//   return values.map((v) => ({ text: String(v), value: v }))
// }

// const AttendanceRegularizationPage = () => {
//   const [form] = Form.useForm()
//   const [data, setData] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [excelLoading, setExcelLoading] = useState(false)
//   const [error, setError] = useState('')
//   const defaultMonth = dayjs()
//   const [selectedMonth, setSelectedMonth] = useState(defaultMonth)

//   const getMonthYearParam = (m) => (m || defaultMonth).format('MMM-YY')

//   const fetchData = async (monthMoment) => {
//     setLoading(true)
//     setError('')

//     try {
//       const monthYearParam = getMonthYearParam(monthMoment)
//       const url = `${API_URL}/GetAttendanceRegularization?monthYear=${monthYearParam}`

//       const res = await fetch(url)
//       const json = await res.json()

//       if (!res.ok || !json.status) {
//         throw new Error(json.message || 'Failed to fetch data')
//       }

//       setData(json.data || [])
//     } catch (err) {
//       setError(err.message)
//       setData([])
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchData(selectedMonth)
//   }, [selectedMonth])

//   const handleDownloadExcel = async () => {
//     setExcelLoading(true)
//     setError('')

//     try {
//       const monthYearParam = getMonthYearParam(selectedMonth)
//       const url = `${API_URL}/GetAttendanceRegularization?monthYear=${monthYearParam}&asExcel=true`

//       const res = await fetch(url)
//       if (!res.ok) throw new Error('Excel download failed')

//       const blob = await res.blob()
//       const blobUrl = window.URL.createObjectURL(blob)

//       const timestamp = new Date()
//         .toISOString()
//         .replace(/[-:T.Z]/g, '')
//         .slice(0, 14)

//       const filename = `AttendanceRegularization_${monthYearParam}_${timestamp}.xlsx`

//       const link = document.createElement('a')
//       link.href = blobUrl
//       link.download = filename
//       link.click()

//       window.URL.revokeObjectURL(blobUrl)
//     } catch (err) {
//       setError(err.message)
//     } finally {
//       setExcelLoading(false)
//     }
//   }

//   const columns = [
//     {
//       title: 'Emp Code',
//       dataIndex: 'ecode',
//       width: 100,
//       filters: buildColumnFilters(data, 'ecode'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (v, r) => r.ecode === v,
//     },
//     {
//       title: 'Employee Name',
//       dataIndex: 'empName',
//       width: 160,
//       filters: buildColumnFilters(data, 'empName'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (v, r) => r.empName === v,
//     },
//     {
//       title: 'Store Code',
//       dataIndex: 'stCode',
//       width: 100,
//       filters: buildColumnFilters(data, 'stCode'),
//       filterSearch: true,
//       filterMultiple: true,
//       onFilter: (v, r) => r.stCode === v,
//     },
//     {
//       title: 'Location',
//       dataIndex: 'locationName',
//       width: 140,
//       filters: buildColumnFilters(data, 'locationName'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (v, r) => r.locationName === v,
//     },
//     {
//       title: 'Department',
//       dataIndex: 'departmentName',
//       width: 140,
//       filters: buildColumnFilters(data, 'departmentName'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (v, r) => r.departmentName === v,
//     },
//     {
//       title: 'Designation',
//       dataIndex: 'designationName',
//       width: 160,
//       filters: buildColumnFilters(data, 'designationName'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (v, r) => r.designationName === v,
//     },
//     {
//       title: 'Request Date',
//       dataIndex: 'requestDate',
//       width: 180,
//       render: (val) => formatDateTime(val),
//       filters: buildColumnFilters(data, 'requestDate'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (v, r) => r.requestDate === v,
//     },
//     {
//       title: 'Reason',
//       dataIndex: 'reason',
//       width: 200,
//       ellipsis: true,
//       filters: buildColumnFilters(data, 'reason'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (v, r) => r.reason === v,
//     },
//     {
//       title: 'Punch In',
//       dataIndex: 'punchIn',
//       width: 100,
//       filters: buildColumnFilters(data, 'punchIn'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (v, r) => r.punchIn === v,
//     },
//     {
//       title: 'Punch Out',
//       dataIndex: 'punchOut',
//       width: 100,
//       filters: buildColumnFilters(data, 'punchOut'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (v, r) => r.punchOut === v,
//     },
//     {
//       title: 'Status',
//       dataIndex: 'statusName',
//       width: 120,
//       filters: buildColumnFilters(data, 'statusName'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (v, r) => r.statusName === v,
//     },
//     {
//       title: 'Request Type',
//       dataIndex: 'requestTypeName',
//       width: 140,
//       filters: buildColumnFilters(data, 'requestTypeName'),
//       filterSearch: true,
//       filterMultiple: true,
//       onFilter: (v, r) => r.requestTypeName === v,
//     },
//     {
//       title: 'Manager Status',
//       dataIndex: 'managerStatus',
//       width: 140,
//       filters: buildColumnFilters(data, 'managerStatus'),
//       filterSearch: true,
//       filterMultiple: true,
//       onFilter: (v, r) => r.managerStatus === v,
//     },
//     {
//       title: 'Manager Approval On',
//       dataIndex: 'managerApprovalOn',
//       width: 180,
//       render: (val) => formatDateTime(val),
//       filters: buildColumnFilters(data, 'managerApprovalOn'),
//       filterMultiple: true,
//       filterSearch: true,
//       onFilter: (v, r) => r.managerApprovalOn === v,
//     },
//     {
//       title: 'File',
//       dataIndex: 'fileUrl',
//       width: 100,
//       render: (val) =>
//         val ? (
//           <a href={val} target="_blank" rel="noopener noreferrer">
//             View
//           </a>
//         ) : (
//           '-'
//         ),
//     },
//   ]

//   return (
//     <Layout className="ar-layout">
//       <Content className="ar-content">
//         {/* HEADER */}
//         <div style={{ marginBottom: 20 }}>
//           <Title level={3}>Attendance Regularization</Title>
//           {/* <Text type="secondary">View and export attendance regularization data by month.</Text> */}
//         </div>

//         {/* FILTER AREA */}
//         <div className="month-filter-bar">
//           <Form form={form} layout="inline" initialValues={{ month: defaultMonth }}>
//             <Form.Item label="Month" name="month" rules={[{ required: true }]}>
//               <DatePicker
//                 picker="month"
//                 format="MMM-YY"
//                 allowClear={false}
//                 onChange={(value) => setSelectedMonth(value || defaultMonth)}
//               />
//             </Form.Item>

//             <Form.Item>
//               <Button loading={excelLoading} onClick={handleDownloadExcel}>
//                 Download Excel
//               </Button>
//             </Form.Item>
//           </Form>
//         </div>

//         {/* TABLE */}
//         <div style={{ marginTop: 20 }}>
//           <Table
//             size="small"
//             rowKey={(row, idx) => row.id || row.ecode + idx}
//             columns={columns}
//             dataSource={data}
//             loading={loading}
//             scroll={{ x: 1400, y: 500 }}
//             pagination={{
//               pageSize: 20,
//               showSizeChanger: true,
//               showTotal: (total) => `Total ${total} records`,
//             }}
//           />

//           {(!data || data.length === 0) && !loading && (
//             <div className="ar-empty-ant">
//               <Text type="secondary">No data loaded for this month.</Text>
//             </div>
//           )}
//         </div>
//       </Content>
//     </Layout>
//   )
// }

// export default AttendanceRegularizationPage


import React, { useState, useEffect } from 'react'
import { Layout, Form, DatePicker, Button, Table, Typography, Select, Space, Modal } from 'antd'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import axiosInstance from 'src/services/axiosInstance'
import 'src/components/Attandence/AttendanceRegularization.css'

const { Content } = Layout
const { Title, Text } = Typography
const { RangePicker } = DatePicker

const API_BASE_URL = import.meta.env.VITE_API_URL
const API_URL = `${API_BASE_URL}api/AttendanceRegularization`

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Rejected', value: 'Rejected' },
]

const SUPER_ADMIN_ROLES = ['superadmin', 'it superadmin', 'master']

function formatDateTime(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  return d.toLocaleString()
}

const buildColumnFilters = (data, dataIndex) => {
  const values = Array.from(
    new Set(
      data.map((row) => row[dataIndex]).filter((v) => v !== null && v !== undefined && v !== ''),
    ),
  )

  return values.map((v) => ({ text: String(v), value: v }))
}

const AttendanceRegularizationPage = () => {
  const [form] = Form.useForm()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [excelLoading, setExcelLoading] = useState(false)
  const [error, setError] = useState('')
  const defaultMonth = dayjs()
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth)

  const role = useSelector((state) => state?.auth?.data?.role) || ''
  const isSuperAdmin = SUPER_ADMIN_ROLES.includes(role.trim().toLowerCase())

  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportRange, setExportRange] = useState([
    defaultMonth.subtract(1, 'month').startOf('month'),
    defaultMonth,
  ])
  const [exportStatus, setExportStatus] = useState('')
  const [exportManagerStatus, setExportManagerStatus] = useState('')
  const [exportLpStatus, setExportLpStatus] = useState('')
  const [superAdminExportLoading, setSuperAdminExportLoading] = useState(false)

  const getMonthYearParam = (m) => (m || defaultMonth).format('MMM-YY')

  const fetchData = async (monthMoment) => {
    setLoading(true)
    setError('')

    try {
      const monthYearParam = getMonthYearParam(monthMoment)
      const url = `${API_URL}/GetAttendanceRegularization?monthYear=${monthYearParam}`

      const res = await fetch(url)
      const json = await res.json()

      if (!res.ok || !json.status) {
        throw new Error(json.message || 'Failed to fetch data')
      }

      setData(json.data || [])
    } catch (err) {
      setError(err.message)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(selectedMonth)
  }, [selectedMonth])

  const handleSuperAdminExport = async () => {
    if (!exportRange || !exportRange[0] || !exportRange[1]) {
      setError('Please select a date range')
      return
    }

    setSuperAdminExportLoading(true)
    setError('')

    try {
      const startDate = exportRange[0].format('YYYY-MM-DD')
      const endDate = exportRange[1].format('YYYY-MM-DD')

      const params = { startDate, endDate }
      if (exportStatus) params.status = exportStatus
      if (exportManagerStatus) params.managerStatus = exportManagerStatus
      if (exportLpStatus) params.lpStatus = exportLpStatus

      const res = await axiosInstance.get(
        'api/AttendanceRegularization/ExportAttendanceRegularization',
        { params, responseType: 'blob' },
      )

      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const blobUrl = window.URL.createObjectURL(blob)

      const timestamp = new Date()
        .toISOString()
        .replace(/[-:T.Z]/g, '')
        .slice(0, 14)
      const filename = `AttendanceRegularization_${startDate}_${endDate}_${timestamp}.xlsx`

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      link.click()
      window.URL.revokeObjectURL(blobUrl)
      setExportModalOpen(false)
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 403
          ? 'Only SuperAdmin can export regularize requests.'
          : 'Export failed')
      setError(msg)
    } finally {
      setSuperAdminExportLoading(false)
    }
  }

  const handleDownloadExcel = async () => {
    setExcelLoading(true)
    setError('')

    try {
      const monthYearParam = getMonthYearParam(selectedMonth)
      const url = `${API_URL}/GetAttendanceRegularization?monthYear=${monthYearParam}&asExcel=true`

      const res = await fetch(url)
      if (!res.ok) throw new Error('Excel download failed')

      const blob = await res.blob()
      const blobUrl = window.URL.createObjectURL(blob)

      const timestamp = new Date()
        .toISOString()
        .replace(/[-:T.Z]/g, '')
        .slice(0, 14)

      const filename = `AttendanceRegularization_${monthYearParam}_${timestamp}.xlsx`

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      link.click()

      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      setError(err.message)
    } finally {
      setExcelLoading(false)
    }
  }

  const columns = [
    {
      title: 'Emp Code',
      dataIndex: 'ecode',
      width: 100,
      filters: buildColumnFilters(data, 'ecode'),
      filterMultiple: true,
      filterSearch: true,
      onFilter: (v, r) => r.ecode === v,
    },
    {
      title: 'Employee Name',
      dataIndex: 'empName',
      width: 160,
      filters: buildColumnFilters(data, 'empName'),
      filterMultiple: true,
      filterSearch: true,
      onFilter: (v, r) => r.empName === v,
    },
    {
      title: 'Store Code',
      dataIndex: 'stCode',
      width: 100,
      filters: buildColumnFilters(data, 'stCode'),
      filterSearch: true,
      filterMultiple: true,
      onFilter: (v, r) => r.stCode === v,
    },
    {
      title: 'Location',
      dataIndex: 'locationName',
      width: 140,
      filters: buildColumnFilters(data, 'locationName'),
      filterMultiple: true,
      filterSearch: true,
      onFilter: (v, r) => r.locationName === v,
    },
    {
      title: 'Department',
      dataIndex: 'departmentName',
      width: 140,
      filters: buildColumnFilters(data, 'departmentName'),
      filterMultiple: true,
      filterSearch: true,
      onFilter: (v, r) => r.departmentName === v,
    },
    {
      title: 'Designation',
      dataIndex: 'designationName',
      width: 160,
      filters: buildColumnFilters(data, 'designationName'),
      filterMultiple: true,
      filterSearch: true,
      onFilter: (v, r) => r.designationName === v,
    },
    {
      title: 'Request Date',
      dataIndex: 'requestDate',
      width: 180,
      render: (val) => formatDateTime(val),
      filters: buildColumnFilters(data, 'requestDate'),
      filterMultiple: true,
      filterSearch: true,
      onFilter: (v, r) => r.requestDate === v,
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      width: 200,
      ellipsis: true,
      filters: buildColumnFilters(data, 'reason'),
      filterMultiple: true,
      filterSearch: true,
      onFilter: (v, r) => r.reason === v,
    },
    {
      title: 'Punch In',
      dataIndex: 'punchIn',
      width: 100,
      filters: buildColumnFilters(data, 'punchIn'),
      filterMultiple: true,
      filterSearch: true,
      onFilter: (v, r) => r.punchIn === v,
    },
    {
      title: 'Punch Out',
      dataIndex: 'punchOut',
      width: 100,
      filters: buildColumnFilters(data, 'punchOut'),
      filterMultiple: true,
      filterSearch: true,
      onFilter: (v, r) => r.punchOut === v,
    },
    {
      title: 'Status',
      dataIndex: 'statusName',
      width: 120,
      filters: buildColumnFilters(data, 'statusName'),
      filterMultiple: true,
      filterSearch: true,
      onFilter: (v, r) => r.statusName === v,
    },
    {
      title: 'Request Type',
      dataIndex: 'requestTypeName',
      width: 140,
      filters: buildColumnFilters(data, 'requestTypeName'),
      filterSearch: true,
      filterMultiple: true,
      onFilter: (v, r) => r.requestTypeName === v,
    },
    {
      title: 'Manager Status',
      dataIndex: 'managerStatus',
      width: 140,
      filters: buildColumnFilters(data, 'managerStatus'),
      filterSearch: true,
      filterMultiple: true,
      onFilter: (v, r) => r.managerStatus === v,
    },
    {
      title: 'Manager Approval On',
      dataIndex: 'managerApprovalOn',
      width: 180,
      render: (val) => formatDateTime(val),
      filters: buildColumnFilters(data, 'managerApprovalOn'),
      filterMultiple: true,
      filterSearch: true,
      onFilter: (v, r) => r.managerApprovalOn === v,
    },
    {
      title: 'File',
      dataIndex: 'fileUrl',
      width: 100,
      render: (val) =>
        val ? (
          <a href={val} target="_blank" rel="noopener noreferrer">
            View
          </a>
        ) : (
          '-'
        ),
    },
  ]

  return (
    <Layout className="ar-layout">
      <Content className="ar-content">
        <div className="ar-main">
          {/* HEADER */}
          <div className="ar-header">
            <Title level={3} className="ar-title">
              Attendance Regularization
            </Title>
          </div>

          {/* FILTER AREA */}
          <div className="month-filter-bar">
            <Form form={form} layout="inline" initialValues={{ month: defaultMonth }}>
              <Form.Item label="Month" name="month" rules={[{ required: true }]}>
                <DatePicker
                  picker="month"
                  format="MMM-YY"
                  allowClear={false}
                  onChange={(value) => setSelectedMonth(value || defaultMonth)}
                />
              </Form.Item>

              <Form.Item>
                <Button loading={excelLoading} onClick={handleDownloadExcel}>
                  Download Excel
                </Button>
              </Form.Item>
            </Form>

            {error && (
              <div className="ar-error">
                <Text type="danger">{error}</Text>
              </div>
            )}
          </div>

          {isSuperAdmin && (
            <div style={{ marginBottom: 8, textAlign: 'right' }}>
              <Button type="primary" onClick={() => setExportModalOpen(true)}>
                Export Reports
              </Button>
            </div>
          )}

          <Modal
            title="Export Regularize Requests"
            open={exportModalOpen}
            onCancel={() => setExportModalOpen(false)}
            width={640}
            footer={[
              <Button key="cancel" onClick={() => setExportModalOpen(false)}>
                Cancel
              </Button>,
              <Button
                key="download"
                type="primary"
                loading={superAdminExportLoading}
                onClick={handleSuperAdminExport}
              >
                Download Report
              </Button>,
            ]}
          >
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div>
                <div style={{ marginBottom: 4, fontWeight: 500 }}>Date Range</div>
                <RangePicker
                  style={{ width: '100%' }}
                  value={exportRange}
                  onChange={(v) => setExportRange(v || [null, null])}
                  format="YYYY-MM-DD"
                  allowClear={false}
                />
              </div>
              <div>
                <div style={{ marginBottom: 4, fontWeight: 500 }}>Status</div>
                <Select
                  style={{ width: '100%' }}
                  placeholder="All"
                  value={exportStatus}
                  onChange={setExportStatus}
                  options={STATUS_OPTIONS}
                />
              </div>
              <div>
                <div style={{ marginBottom: 4, fontWeight: 500 }}>Manager Status</div>
                <Select
                  style={{ width: '100%' }}
                  placeholder="All"
                  value={exportManagerStatus}
                  onChange={setExportManagerStatus}
                  options={STATUS_OPTIONS}
                />
              </div>
              <div>
                <div style={{ marginBottom: 4, fontWeight: 500 }}>LP Status</div>
                <Select
                  style={{ width: '100%' }}
                  placeholder="All"
                  value={exportLpStatus}
                  onChange={setExportLpStatus}
                  options={STATUS_OPTIONS}
                />
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Tip: For &quot;Approved by Manager, Pending by LP&quot; — set Manager Status =
                Approved and LP Status = Pending.
              </Text>
            </Space>
          </Modal>

          {/* TABLE – ONLY THIS SCROLLS (via scroll.y) */}
          <div className="ar-table-container">
            <Table
              size="small"
              rowKey={(row, idx) => row.id || row.ecode + idx}
              columns={columns}
              dataSource={data}
              loading={loading}
              scroll={{
                x: 'max-content',
                // table body height = viewport height minus header + filter area
                y: 'calc(100vh - 220px)',
              }}
              pagination={{
                pageSize: 100,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} records`,
              }}
            />

            {(!data || data.length === 0) && !loading && !error && (
              <div className="ar-empty-ant">
                <Text type="secondary">No data loaded for this month.</Text>
              </div>
            )}
          </div>
        </div>
      </Content>
    </Layout>
  )
}

export default AttendanceRegularizationPage
