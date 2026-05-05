// import React, { useEffect, useState, useCallback } from 'react'
// import { useSelector, useDispatch } from 'react-redux'
// import { ToastContainer, toast } from 'react-toastify'
// import 'react-toastify/dist/ReactToastify.css'
// import {
//   LinkOutlined,
//   StepForwardOutlined,
//   EditOutlined,
//   PlusOutlined,
//   MinusOutlined,
// } from '@ant-design/icons'

// import {
//   Table,
//   Tag,
//   Checkbox,
//   Row,
//   Input,
//   Tooltip,
//   Button,
//   Modal,
//   message,
//   Space,
//   Col,
//   Tabs,
//   Skeleton,
//   Empty,
//   Grid, // for breakpoints
// } from 'antd'
// import {
//   myregularizeRequestStatusLists,
//   regularizeLists,
//   regularizeSubmit,
// } from '../../services/Services'
// import dayjs from 'dayjs'
// import { set } from '../../redux/uiSlice'
// import { debounce } from 'lodash'
// import AttendanceRequestModal from './AttendanceRequestModal'
// import Pageheading from '../shared/Pageheading'
// import BulkUploadRegularizeFormModal from './BulkUploadRegularizeFormModal'

// import useMediaQuery from '../../hooks/useMediaQuery'
// import { useActionsMap } from '../../utils/useActionsMap'

// const { Search } = Input
// const { TextArea } = Input
// const { useBreakpoint } = Grid

// // Helper: on mobile, drop fixed/responsive so every column shows,
// // and nothing gets clipped by sticky columns. Also handle nested column groups.
// const stripForMobile = (cols) =>
//   Array.isArray(cols)
//     ? cols.map((col) => {
//         const { responsive, fixed, children, ...rest } = col || {}
//         if (Array.isArray(children)) {
//           rest.children = stripForMobile(children)
//         }
//         return rest
//       })
//     : []

// const FilterDropdown = ({ dataIndex, dataList, filterValues, setFilterValues, confirm, title }) => {
//   const [searchText, setSearchText] = useState('')
//   const [selectedOptions, setSelectedOptions] = useState(filterValues || []) // keep raw values here

//   // Normalize to strings for searching, preserve raw for selection
//   const list = Array.isArray(dataList) ? dataList : []
//   const normalized = list.map((item) => ({ raw: item ?? '', label: String(item ?? '') }))
//   const filteredOptions = normalized.filter(({ label }) =>
//     label.toLowerCase().includes(searchText.toLowerCase()),
//   )

//   const handleChange = (checkedValues) => setSelectedOptions(checkedValues)
//   const handleFilter = () => {
//     setFilterValues(selectedOptions)
//     confirm()
//   }
//   const handleReset = () => {
//     setSelectedOptions([])
//     setFilterValues([])
//     setSearchText('')
//     confirm()
//   }

//   return (
//     <div style={{ padding: 8, width: 215 }}>
//       <Input
//         placeholder={`Search ${title}`}
//         value={searchText}
//         onChange={(e) => setSearchText(e.target.value)}
//         style={{ marginBottom: 8, display: 'block' }}
//       />

//       <div style={{ maxHeight: 150, overflowY: 'auto', paddingRight: 8 }}>
//         <Checkbox.Group
//           value={selectedOptions}
//           onChange={handleChange}
//           style={{ display: 'flex', flexDirection: 'column' }}
//         >
//           {filteredOptions.map(({ raw, label }) => (
//             <Checkbox key={label || '(empty)'} value={raw}>
//               {label || <em>(empty)</em>}
//             </Checkbox>
//           ))}
//         </Checkbox.Group>
//       </div>

//       <Space style={{ marginTop: 8 }}>
//         <Button type="primary" size="small" onClick={handleFilter}>
//           Filter
//         </Button>
//         <Button size="small" onClick={handleReset}>
//           Reset
//         </Button>
//       </Space>
//     </div>
//   )
// }

// const RegularizeRequestTable = () => {
//   const isMobile = useMediaQuery('(max-width: 768px)')
//   const [expandedCards, setExpandedCards] = useState({})

//   const [initiateModalOpen, setInitiateModalOpen] = useState(false)
//   const [regularizeList, setRegularizeList] = useState([])
//   const [localloading, setlocalLoading] = useState(false)
//   const [remarks, setRemarks] = useState({})
//   const [currentPage, setCurrentPage] = useState(1)
//   const [pageSize, setPageSize] = useState(100)
//   const [selectedOption, setSelectedOption] = useState({})
//   const [totalRecords, setTotalRecords] = useState(0)
//   const [selectedRowKeys, setSelectedRowKeys] = useState([])
//   const [currentRecord, setCurrentRecord] = useState({})
//   const [selectionType] = useState('checkbox')
//   const { employeeId, role } = useSelector((state) => state.auth.data)
//   const [messageApi, contextHolder] = message.useMessage()
//   const [activekey, setActiveKey] = useState('1')
//   const [searchText, setsearchText] = useState('')
//   const [isAttendanceRequestModalOpen, setIsAttendanceRequestModalOpen] = useState(false)
//   const [regulistAttandanceUpdatedData, setregulistAttandanceUpdatedData] = useState({})
//   const [requestDateFilterValues, setRequestDateFilterValues] = useState([])
//   const [employeeNameFilterValues, setEmployeeNameFilterValues] = useState([])
//   const [ecodeFilterValues, setEcodeFilterValues] = useState([])
//   const [reportHeadNameFilterValues, setReportHeadNameFilterValues] = useState([])
//   const [punchInFilterValues, setPunchInFilterValues] = useState([])
//   const [punchOutFilterValues, setPunchOutFilterValues] = useState([])
//   const [reasonFilterValues, setReasonFilterValues] = useState([])
//   const [empRemarkFilterValues, setEmpRemarkFilterValues] = useState([])
//   const [approverRemarkFilterValues, setApproverRemarkFilterValues] = useState([])
//   const [bulkRegularizeModalOpen, setBulkRegularizeModalOpen] = useState(false)
//   const showBulkActions = activekey === '1' || activekey === '2'

//   const { filteredSideMenu } = useSelector((state) => state?.auth || {})
//   const actionsMap = useActionsMap(filteredSideMenu)

//   const handleToggleCard = useCallback((id) => {
//     setExpandedCards((prev) => ({
//       ...prev,
//       [id]: !prev[id],
//     }))
//   }, [])

//   const expandedRowRender = (record, showBulkActions = true) => (
//     <div style={{ padding: 12, background: '#fafafa', fontSize: 12 }}>
//       {/* Row 1: 4 Columns (RM, Reason, Clock In, Clock Out) */}
//       <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
//         <Col span={6}>
//           <div
//             style={{
//               color: '#666',
//               marginBottom: 4,
//               fontSize: 10,
//               fontWeight: 500,
//               textAlign: 'center',
//             }}
//           >
//             RM
//           </div>
//           <div
//             style={{
//               fontWeight: 500,
//               fontSize: 11,
//               textAlign: 'center',
//               wordBreak: 'break-word',
//               whiteSpace: 'normal',
//               lineHeight: '1.4',
//             }}
//           >
//             {record?.reportHeadName || '-'}
//           </div>
//         </Col>
//         <Col span={6}>
//           <div
//             style={{
//               color: '#666',
//               marginBottom: 4,
//               fontSize: 10,
//               fontWeight: 500,
//               textAlign: 'center',
//             }}
//           >
//             Reason
//           </div>
//           <div
//             style={{
//               fontWeight: 500,
//               fontSize: 11,
//               textAlign: 'center',
//               wordBreak: 'break-word',
//               whiteSpace: 'normal',
//               lineHeight: '1.4',
//             }}
//           >
//             {record?.reason || '-'}
//           </div>
//         </Col>
//         <Col span={6}>
//           <div
//             style={{
//               color: '#666',
//               marginBottom: 4,
//               fontSize: 10,
//               fontWeight: 500,
//               textAlign: 'center',
//             }}
//           >
//             Clock In
//           </div>
//           <div style={{ fontWeight: 500, fontSize: 11, textAlign: 'center' }}>
//             {formatTime(record?.punchIn)}
//           </div>
//         </Col>
//         <Col span={6}>
//           <div
//             style={{
//               color: '#666',
//               marginBottom: 4,
//               fontSize: 10,
//               fontWeight: 500,
//               textAlign: 'center',
//             }}
//           >
//             Clock Out
//           </div>
//           <div style={{ fontWeight: 500, fontSize: 11, textAlign: 'center' }}>
//             {formatTime(record?.punchOut)}
//           </div>
//         </Col>
//       </Row>

//       {/* Row 2: Remarks (Full Width) */}
//       <Row style={{ marginBottom: 12 }}>
//         <Col span={24}>
//           <div
//             style={{
//               color: '#666',
//               marginBottom: 4,
//               fontSize: 10,
//               fontWeight: 500,
//               textAlign: 'center',
//             }}
//           >
//             Employee Remarks
//           </div>
//           <div
//             style={{
//               fontWeight: 500,
//               fontSize: 12,
//               textAlign: 'center',
//               wordBreak: 'break-word',
//               whiteSpace: 'normal',
//               lineHeight: '1.4',
//               padding: '6px 8px',
//               background: '#fff',
//               borderRadius: '4px',
//               border: '1px solid #f0f0f0',
//               minHeight: '24px',
//             }}
//           >
//             {record?.employeeRemarks || '-'}
//           </div>
//         </Col>
//       </Row>

//       {/* Row 3: Action Buttons */}
//       {showBulkActions && (
//         <Row>
//           <Col span={24}>
//             <div style={{ textAlign: 'center' }}>
//               <Space size="small">
//                 {role === 'SuperAdmin' && (
//                   <Button
//                     size="small"
//                     icon={<EditOutlined />}
//                     onClick={() => {
//                       setIsAttendanceRequestModalOpen(true)
//                       setregulistAttandanceUpdatedData(record)
//                     }}
//                     style={{ fontSize: 11 }}
//                   >
//                     View
//                   </Button>
//                 )}
//                 <Button
//                   size="small"
//                   type="primary"
//                   icon={<StepForwardOutlined />}
//                   onClick={() => handleInitiateClick(record)}
//                   style={{ fontSize: 11 }}
//                 >
//                   Action
//                 </Button>
//                 {record?.attachment && (
//                   <a href={record.attachment} target="_blank" rel="noopener noreferrer">
//                     <Button size="small" icon={<LinkOutlined />} style={{ fontSize: 11 }}>
//                       Proof
//                     </Button>
//                   </a>
//                 )}
//               </Space>
//             </div>
//           </Col>
//         </Row>
//       )}
//     </div>
//   )

//   const getMobileColumns = () => [
//     {
//       title: 'Name',
//       dataIndex: 'employeeName',
//       key: 'employeeName',
//       width: 65,
//       render: (text) => (
//         <div
//           style={{
//             fontSize: 12,
//             wordBreak: 'break-word',
//             whiteSpace: 'normal',
//             lineHeight: '1.3',
//             maxWidth: '100%',
//           }}
//         >
//           {text || '-'}
//         </div>
//       ),
//     },
//     {
//       title: 'E-Code',
//       dataIndex: 'ecode',
//       key: 'ecode',
//       width: 65,
//       render: (text) => <div style={{ fontSize: 12 }}>{text || '-'}</div>,
//     },
//     {
//       title: 'Date',
//       dataIndex: 'requestDate',
//       key: 'requestDate',
//       width: 65,
//       render: (d) => <div style={{ fontSize: 12 }}>{d ? dayjs(d).format('YYYY-MM-DD') : '-'}</div>,
//     },
//     {
//       title: 'Status',
//       dataIndex: 'statusId',
//       key: 'statusId',
//       width: 50,
//       render: (statusId) => (
//         <Tag
//           color={statusId === 4 ? 'red' : statusId === 1 ? 'green' : 'brown'}
//           style={{ fontSize: 10, padding: '0 3px' }}
//         >
//           {statusId === 4 ? 'Pending' : statusId === 1 ? 'Approved' : 'Rej'}
//         </Tag>
//       ),
//     },
//     ...(showBulkActions
//       ? [
//           {
//             title: 'Action',
//             key: 'action',
//             width: 50,
//             render: (_, record) => (
//               <div
//                 style={{ display: 'flex', justifyContent: 'center', gap: 2 }}
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <Button
//                   type="text"
//                   size="small"
//                   icon={
//                     expandedCards[record.attendanceRequestId] ? <MinusOutlined /> : <PlusOutlined />
//                   }
//                   onClick={(e) => {
//                     e.stopPropagation()
//                     handleToggleCard(record.attendanceRequestId)
//                   }}
//                   style={{ fontSize: 10, padding: '2px 4px' }}
//                 />
//               </div>
//             ),
//           },
//         ]
//       : []),
//   ]

//   const { theme, loading } = useSelector((state) => state.ui)
//   const dispatch = useDispatch()

//   const handleCheckboxChange = (option, attendanceRequestId) => {
//     setSelectedOption((prev) => ({ ...prev, [attendanceRequestId]: option }))
//   }

//   const handleTableChange = (current, newPageSize) => {
//     setCurrentPage(current)
//     setPageSize(newPageSize)
//   }

//   const handleInitiateClick = (record) => {
//     setCurrentRecord(record)
//     setInitiateModalOpen(true)
//   }

//   const handleRemarksChange = (e, attendanceRequestId) => {
//     setRemarks((prev) => ({
//       ...prev,
//       [attendanceRequestId]: e.target.value,
//     }))
//   }

//   const handleRegularize = async (attendanceRequestId) => {
//     if (!remarks[attendanceRequestId]?.trim()) {
//       toast.error('Remarks is mandatory!')
//       return
//     }

//     const requestBody = {
//       statusId: selectedOption[attendanceRequestId],
//       remarks: remarks[attendanceRequestId],
//       attendanceRequestId: attendanceRequestId,
//     }

//     try {
//       await dispatch(set({ loading: true }))
//       const response = await regularizeSubmit(attendanceRequestId, requestBody, role)

//       if (response?.status === 200) {
//         activekey === '1' ? await fetchData(4) : await fetchData(1)
//         messageApi.success(response?.data?.message)
//       } else {
//         messageApi.error('Could not regularize request')
//       }
//     } catch (error) {
//       messageApi.error('Could not regularize request')
//     } finally {
//       await dispatch(set({ loading: false }))
//       setInitiateModalOpen(false)
//       setRemarks((prev) => ({ ...prev, [attendanceRequestId]: '' }))
//       setSelectedOption((prev) => ({ ...prev, [attendanceRequestId]: null }))
//     }
//   }

//   const fetchData = async (statusId) => {
//     await dispatch(set({ loading: true }))
//     setlocalLoading(true)
//     try {
//       const effectiveEmployeeId = String(role).toLowerCase().trim() === 'audit' ? 0 : employeeId

//       const response = await regularizeLists(
//         effectiveEmployeeId,
//         currentPage,
//         pageSize,
//         searchText,
//         statusId,
//       )

//       if (response?.status === 200) {
//         setRegularizeList(response?.data?.data || [])
//         setTotalRecords(response?.data?.totalRecords || 0)
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error)
//     } finally {
//       await dispatch(set({ loading: false }))
//       setlocalLoading(false)
//     }
//   }

//   const fetchDataReguliseHistory = async () => {
//     await dispatch(set({ loading: true }))
//     setlocalLoading(true)
//     try {
//       const response = await myregularizeRequestStatusLists(employeeId)
//       console.log('my history:', response)
//       if (response?.status === 200) {
//         setRegularizeList(response?.data?.data || [])
//         setTotalRecords(response?.data?.data?.length || 0)
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error)
//     } finally {
//       await dispatch(set({ loading: false }))
//       setlocalLoading(false)
//     }
//   }

//   useEffect(() => {
//     if (activekey === '1') {
//       fetchData(4)
//     } else if (activekey === '2') {
//       fetchData(1)
//     } else if (activekey === '3') {
//       fetchData(2)
//     } else if (activekey === '4') {
//       fetchDataReguliseHistory()
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentPage, pageSize, activekey, searchText])

//   const formatTime = (value) => (value ? dayjs(`2000-01-01T${value}`).format('hh:mm A') : '-')

//   // -------------------- Columns (desktop defaults) --------------------
//   const baseNameCol = {
//     title: 'Name',
//     dataIndex: 'employeeName',
//     key: 'employeeName',
//     fixed: 'left', // sticky on desktop; stripped on mobile by stripForMobile
//     width: 150,
//     filteredValue: employeeNameFilterValues.length ? employeeNameFilterValues : null,
//     onFilter: () => true, // we'll handle filtering via the includes below
//     filterDropdown: ({ confirm }) => (
//       <FilterDropdown
//         title="Name"
//         dataIndex="employeeName"
//         dataList={[...new Set(regularizeList.map((item) => item.employeeName))]}
//         filterValues={employeeNameFilterValues}
//         setFilterValues={setEmployeeNameFilterValues}
//         confirm={confirm}
//       />
//     ),
//   }

//   const columnsDesktop = [
//     baseNameCol,
//     {
//       title: 'E Code',
//       dataIndex: 'ecode',
//       key: 'ecode',
//       fixed: 'left',
//       width: 100,
//       filteredValue: ecodeFilterValues.length ? ecodeFilterValues : null,
//       onFilter: () => true,
//       filterDropdown: ({ confirm }) => (
//         <FilterDropdown
//           title="E Code"
//           dataIndex="ecode"
//           dataList={[...new Set(regularizeList.map((item) => item.ecode))]}
//           filterValues={ecodeFilterValues}
//           setFilterValues={setEcodeFilterValues}
//           confirm={confirm}
//         />
//       ),
//     },
//     {
//       title: 'St Code',
//       dataIndex: 'stCode',
//       key: 'stCode',
//       width: 90,
//       ellipsis: true,
//     },
//     {
//       title: 'St Name',
//       dataIndex: 'locationName',
//       key: 'locationName',
//       width: 120,
//       ellipsis: true,
//     },
//     {
//       title: 'RM',
//       dataIndex: 'reportHeadName',
//       key: 'reportHeadName',
//       width: 200,
//       filteredValue: reportHeadNameFilterValues.length ? reportHeadNameFilterValues : null,
//       onFilter: () => true,
//       filterDropdown: ({ confirm }) => (
//         <FilterDropdown
//           title="RM"
//           dataIndex="reportHeadName"
//           dataList={[...new Set(regularizeList.map((item) => item.reportHeadName))]}
//           filterValues={reportHeadNameFilterValues}
//           setFilterValues={setReportHeadNameFilterValues}
//           confirm={confirm}
//         />
//       ),
//     },
//     {
//       title: 'Reason',
//       dataIndex: 'reason',
//       key: 'reason',
//       width: 150,
//       filteredValue: reasonFilterValues.length ? reasonFilterValues : null,
//       onFilter: () => true,
//       filterDropdown: ({ confirm }) => (
//         <FilterDropdown
//           title="Reason"
//           dataIndex="reason"
//           dataList={[...new Set(regularizeList.map((item) => item.reason))]}
//           filterValues={reasonFilterValues}
//           setFilterValues={setReasonFilterValues}
//           confirm={confirm}
//         />
//       ),
//     },
//     {
//       title: 'Date',
//       dataIndex: 'requestDate',
//       key: 'requestDate',
//       width: 150,
//       render: (d) => dayjs(d).format('YYYY-MM-DD'),
//       sorter: (a, b) => dayjs(a.requestDate).unix() - dayjs(b.requestDate).unix(),
//       defaultSortOrder: 'ascend',
//       filteredValue: requestDateFilterValues.length ? requestDateFilterValues : null,
//       onFilter: () => true,
//       filterDropdown: ({ confirm }) => (
//         <FilterDropdown
//           title="Date"
//           dataIndex="requestDate"
//           dataList={[
//             ...new Set(regularizeList.map((item) => dayjs(item.requestDate).format('YYYY-MM-DD'))),
//           ]}
//           filterValues={requestDateFilterValues}
//           setFilterValues={setRequestDateFilterValues}
//           confirm={confirm}
//         />
//       ),
//     },
//     {
//       title: 'Clock In',
//       dataIndex: 'punchIn',
//       key: 'punchIn',
//       width: 120,
//       filteredValue: punchInFilterValues.length ? punchInFilterValues : null,
//       onFilter: () => true,
//       filterDropdown: ({ confirm }) => (
//         <FilterDropdown
//           title="Clock In"
//           dataIndex="punchIn"
//           dataList={[...new Set(regularizeList.map((item) => item.punchIn))]}
//           filterValues={punchInFilterValues}
//           setFilterValues={setPunchInFilterValues}
//           confirm={confirm}
//         />
//       ),
//       render: (t) => formatTime(t),
//     },
//     {
//       title: 'Clock Out',
//       dataIndex: 'punchOut',
//       key: 'punchOut',
//       width: 120,
//       filteredValue: punchOutFilterValues.length ? punchOutFilterValues : null,
//       onFilter: () => true,
//       filterDropdown: ({ confirm }) => (
//         <FilterDropdown
//           title="Clock Out"
//           dataIndex="punchOut"
//           dataList={[...new Set(regularizeList.map((item) => item.punchOut))]}
//           filterValues={punchOutFilterValues}
//           setFilterValues={setPunchOutFilterValues}
//           confirm={confirm}
//         />
//       ),
//       render: (t) => formatTime(t),
//     },
//     {
//       title: 'Proof',
//       dataIndex: 'attachment',
//       key: 'attachment',
//       width: 100,
//       render: (url) =>
//         url ? (
//           <a href={url} target="_blank" rel="noopener noreferrer">
//             <LinkOutlined />
//           </a>
//         ) : (
//           ''
//         ),
//     },
//     {
//       title: 'Emp. Remark',
//       dataIndex: 'employeeRemarks',
//       key: 'employeeRemarks',
//       width: 200,
//       filteredValue: empRemarkFilterValues.length ? empRemarkFilterValues : null,
//       onFilter: () => true,
//       filterDropdown: ({ confirm }) => (
//         <FilterDropdown
//           title="Emp. Remark"
//           dataIndex="employeeRemarks"
//           dataList={[...new Set(regularizeList.map((item) => item.employeeRemarks || ''))]}
//           filterValues={empRemarkFilterValues}
//           setFilterValues={setEmpRemarkFilterValues}
//           confirm={confirm}
//         />
//       ),
//       render: (text) => {
//         const shortText = text?.length > 15 ? text.slice(0, 15) + '...' : text
//         return (
//           <Tooltip title={text}>
//             <span>{shortText}</span>
//           </Tooltip>
//         )
//       },
//     },
//     {
//       title: 'Status',
//       dataIndex: 'statusId',
//       key: 'statusId',
//       width: 120,
//       render: (statusId) => (
//         <Tag color={statusId === 4 ? 'red' : statusId === 1 ? 'green' : 'brown'}>
//           {statusId === 4 ? 'Pending' : statusId === 1 ? 'Approved' : 'Rejected'}
//         </Tag>
//       ),
//     },
//     {
//       title: 'RM Status',
//       dataIndex: 'managerApprovalStatusId',
//       key: 'managerApprovalStatusId',
//       width: 120,
//       render: (statusId) => (
//         <Tag color={statusId === 4 ? 'red' : statusId === 1 ? 'green' : 'brown'}>
//           {statusId === 4 ? 'Pending' : statusId === 1 ? 'Approved' : 'Rejected'}
//         </Tag>
//       ),
//     },
//     {
//       title: 'RM Remarks',
//       dataIndex: 'managerRemarks',
//       key: 'managerRemarks',
//       width: 200,
//       render: (text) => {
//         const shortText = text?.length > 15 ? text.slice(0, 15) + '...' : text
//         return (
//           <Tooltip title={text}>
//             <span>{shortText}</span>
//           </Tooltip>
//         )
//       },
//     },
//     {
//       title: 'RM Status Updated By',
//       dataIndex: 'managerEcode',
//       key: 'managerEcode',
//       width: 180,
//       render: (text) => {
//         const shortText = text?.length > 15 ? text.slice(0, 15) + '...' : text
//         return (
//           <Tooltip title={text}>
//             <span>{shortText}</span>
//           </Tooltip>
//         )
//       },
//     },
//     {
//       title: 'LP Status',
//       dataIndex: 'lpApprovalStatusId',
//       key: 'lpApprovalStatusId',
//       width: 120,
//       render: (statusId) => (
//         <Tag color={statusId === 4 ? 'red' : statusId === 1 ? 'green' : 'brown'}>
//           {statusId === 4 ? 'Pending' : statusId === 1 ? 'Approved' : 'Rejected'}
//         </Tag>
//       ),
//     },
//     {
//       title: 'LP Remarks',
//       dataIndex: 'lpRemarks',
//       key: 'lpRemarks',
//       width: 200,
//       render: (text) => {
//         const shortText = text?.length > 15 ? text.slice(0, 15) + '...' : text
//         return (
//           <Tooltip title={text}>
//             <span>{shortText}</span>
//           </Tooltip>
//         )
//       },
//     },
//     {
//       title: 'LP Status Updated By',
//       dataIndex: 'lpEcode',
//       key: 'lpEcode',
//       width: 180,
//       render: (text) => {
//         const shortText = text?.length > 15 ? text.slice(0, 15) + '...' : text
//         return (
//           <Tooltip title={text}>
//             <span>{shortText}</span>
//           </Tooltip>
//         )
//       },
//     },
//     {
//       title: 'Action',
//       key: 'action',
//       width: 120,
//       fixed: 'right', // sticky on desktop; stripped on mobile
//       render: (_, record) => (
//         <Space size="middle">
//           {role === 'SuperAdmin' && (
//             <Tooltip placement="top" title="View">
//               <EditOutlined
//                 style={{ fontSize: 18 }}
//                 onClick={() => {
//                   setIsAttendanceRequestModalOpen(true)
//                   setregulistAttandanceUpdatedData(record)
//                 }}
//               />
//             </Tooltip>
//           )}

//           {actionsMap?.action?.actionStatus && (
//             <Tooltip placement="top" title={'Action'}>
//               <StepForwardOutlined
//                 style={{ fontSize: 18 }}
//                 onClick={() => handleInitiateClick(record)}
//               />
//             </Tooltip>
//           )}
//         </Space>
//       ),
//     },
//   ]

//   const columnsHistoryDesktop = [
//     baseNameCol,
//     {
//       title: 'E Code',
//       dataIndex: 'ecode',
//       key: 'ecode',
//       width: 100,
//       filteredValue: ecodeFilterValues.length ? ecodeFilterValues : null,
//       onFilter: () => true,
//       filterDropdown: ({ confirm }) => (
//         <FilterDropdown
//           title="E Code"
//           dataIndex="ecode"
//           dataList={[...new Set(regularizeList.map((item) => item.ecode))]}
//           filterValues={ecodeFilterValues}
//           setFilterValues={setEcodeFilterValues}
//           confirm={confirm}
//         />
//       ),
//     },
//     {
//       title: 'Reason',
//       dataIndex: 'reason',
//       key: 'reason',
//       width: 150,
//       filteredValue: reasonFilterValues.length ? reasonFilterValues : null,
//       onFilter: () => true,
//       filterDropdown: ({ confirm }) => (
//         <FilterDropdown
//           title="Reason"
//           dataIndex="reason"
//           dataList={[...new Set(regularizeList.map((item) => item.reason))]}
//           filterValues={reasonFilterValues} // fixed
//           setFilterValues={setReasonFilterValues}
//           confirm={confirm}
//         />
//       ),
//     },
//     {
//       title: 'Date',
//       dataIndex: 'requestDate',
//       key: 'requestDate',
//       width: 150,
//       render: (d) => dayjs(d).format('YYYY-MM-DD'),
//       sorter: (a, b) => dayjs(a.requestDate).unix() - dayjs(b.requestDate).unix(),
//       defaultSortOrder: 'ascend',
//       filteredValue: requestDateFilterValues.length ? requestDateFilterValues : null,
//       onFilter: () => true,
//       filterDropdown: ({ confirm }) => (
//         <FilterDropdown
//           title="Date"
//           dataIndex="requestDate"
//           dataList={[
//             ...new Set(regularizeList.map((item) => dayjs(item.requestDate).format('YYYY-MM-DD'))),
//           ]}
//           filterValues={requestDateFilterValues}
//           setFilterValues={setRequestDateFilterValues}
//           confirm={confirm}
//         />
//       ),
//     },
//     {
//       title: 'Clock In',
//       dataIndex: 'punchIn',
//       key: 'punchIn',
//       width: 120,
//       filteredValue: punchInFilterValues.length ? punchInFilterValues : null,
//       onFilter: () => true,
//       filterDropdown: ({ confirm }) => (
//         <FilterDropdown
//           title="Clock In"
//           dataIndex="punchIn"
//           dataList={[...new Set(regularizeList.map((item) => item.punchIn))]}
//           filterValues={punchInFilterValues}
//           setFilterValues={setPunchInFilterValues}
//           confirm={confirm}
//         />
//       ),
//       render: (t) => formatTime(t),
//     },
//     {
//       title: 'Clock Out',
//       dataIndex: 'punchOut',
//       key: 'punchOut',
//       width: 120,
//       filteredValue: punchOutFilterValues.length ? punchOutFilterValues : null,
//       onFilter: () => true,
//       filterDropdown: ({ confirm }) => (
//         <FilterDropdown
//           title="Clock Out"
//           dataIndex="punchOut"
//           dataList={[...new Set(regularizeList.map((item) => item.punchOut))]}
//           filterValues={punchOutFilterValues}
//           setFilterValues={setPunchOutFilterValues}
//           confirm={confirm}
//         />
//       ),
//       render: (t) => formatTime(t),
//     },
//     {
//       title: 'Proof',
//       dataIndex: 'attachment',
//       key: 'attachment',
//       width: 100,
//       render: (url) =>
//         url ? (
//           <a href={url} target="_blank" rel="noopener noreferrer">
//             <LinkOutlined />
//           </a>
//         ) : (
//           ''
//         ),
//     },
//     {
//       title: 'Message',
//       dataIndex: 'employeeRemarks',
//       key: 'employeeRemarks',
//       width: 200,
//       filteredValue: empRemarkFilterValues.length ? empRemarkFilterValues : null,
//       onFilter: () => true,
//       filterDropdown: ({ confirm }) => (
//         <FilterDropdown
//           title="Message"
//           dataIndex="employeeRemarks"
//           dataList={[...new Set(regularizeList.map((item) => item.employeeRemarks || ''))]}
//           filterValues={empRemarkFilterValues}
//           setFilterValues={setEmpRemarkFilterValues}
//           confirm={confirm}
//         />
//       ),
//       render: (text) => {
//         const shortText = text?.length > 15 ? text.slice(0, 15) + '...' : text
//         return (
//           <Tooltip title={text}>
//             <span>{shortText}</span>
//           </Tooltip>
//         )
//       },
//     },
//     {
//       title: 'Status',
//       dataIndex: 'statusId',
//       key: 'statusId',
//       width: 120,
//       render: (statusId) => (
//         <Tag color={statusId === 4 ? 'red' : statusId === 1 ? 'green' : 'brown'}>
//           {statusId === 4 ? 'Pending' : statusId === 1 ? 'Approved' : 'Rejected'}
//         </Tag>
//       ),
//     },
//     {
//       title: 'RM Status',
//       dataIndex: 'managerApprovalStatusId',
//       key: 'managerApprovalStatusId',
//       width: 120,
//       render: (statusId) => (
//         <Tag
//           color={statusId === 4 || statusId === null ? 'yellow' : statusId === 1 ? 'green' : 'red'}
//         >
//           {statusId === 4 || statusId === null
//             ? 'Pending'
//             : statusId === 1
//               ? 'Approved'
//               : 'Rejected'}
//         </Tag>
//       ),
//     },
//     {
//       title: 'RM Remarks',
//       dataIndex: 'managerRemarks',
//       key: 'managerRemarks',
//       width: 200,
//       render: (text) => {
//         const shortText = text?.length > 15 ? text.slice(0, 15) + '...' : text
//         return (
//           <Tooltip title={text}>
//             <span>{shortText}</span>
//           </Tooltip>
//         )
//       },
//     },
//     {
//       title: 'LP Status',
//       dataIndex: 'lpApprovalStatusId',
//       key: 'lpApprovalStatusId',
//       width: 120,
//       render: (statusId) => (
//         <Tag
//           color={statusId === 4 || statusId === null ? 'yellow' : statusId === 1 ? 'green' : 'red'}
//         >
//           {statusId === 4 || statusId === null
//             ? 'Pending'
//             : statusId === 1
//               ? 'Approved'
//               : 'Rejected'}
//         </Tag>
//       ),
//     },
//     {
//       title: 'LP Remarks',
//       dataIndex: 'lpRemarks',
//       key: 'lpRemarks',
//       width: 200,
//       render: (text) => {
//         const shortText = text?.length > 15 ? text.slice(0, 15) + '...' : text
//         return (
//           <Tooltip title={text}>
//             <span>{shortText}</span>
//           </Tooltip>
//         )
//       },
//     },
//   ]

//   // Use full columns everywhere; on mobile we strip fixed/responsive only
//   const columnsPendingAll = isMobile ? stripForMobile(columnsDesktop) : columnsDesktop
//   const columnsHistoryAll = isMobile ? stripForMobile(columnsHistoryDesktop) : columnsHistoryDesktop

//   const rowSelection = {
//     selectedRowKeys,
//     onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
//   }

//   const handleSearchh = useCallback(
//     debounce((text) => setsearchText(text), 500),
//     [],
//   )

//   const handleSearch = (e) => {
//     const text = e.target.value
//     handleSearchh(text)
//   }

//   const tableCommonProps = {
//     bordered: true,
//     className: theme === 'dark' ? 'dark-theme' : '',
//     tableLayout: isMobile ? 'fixed' : undefined,
//     size: isMobile ? 'small' : 'middle',
//     scroll: {
//       x: 'max-content', // allow sideways scroll to show all columns on mobile
//       y: isMobile ? 360 : 'calc(100vh - 160px)',
//     },
//     locale: {
//       emptyText: <Empty description="No data available" />,
//     },
//   }

//   const tabItems = [
//     {
//       label: <span className="custom-tab-label">Pending Regularize Requests</span>,
//       key: '1',
//       children: (
//         <>
//           <TableBulkActionIcons
//             selectedRowKeys={selectedRowKeys}
//             totalRecords={totalRecords}
//             handleSearch={handleSearch}
//             activekey={activekey}
//             showBulkActions={showBulkActions}
//             setBulkRegularizeModalOpen={setBulkRegularizeModalOpen}
//             isMobile={isMobile}
//           />
//           {localloading ? (
//             <Skeleton active paragraph={{ rows: 10 }} />
//           ) : !isMobile ? (
//             <Table
//               rowKey="attendanceRequestId"
//               rowSelection={showBulkActions ? { type: selectionType, ...rowSelection } : undefined}
//               columns={columnsPendingAll}
//               pagination={{
//                 current: currentPage,
//                 total: totalRecords,
//                 position: ['bottomRight'],
//                 pageSize,
//                 showSizeChanger: true,
//                 pageSizeOptions: ['10', '20', '50', '100'],
//                 onChange: handleTableChange,
//               }}
//               dataSource={regularizeList}
//               {...tableCommonProps}
//             />
//           ) : (
//             <div style={{ padding: '0 8px' }}>
//               <Table
//                 rowKey="attendanceRequestId"
//                 columns={getMobileColumns()}
//                 dataSource={regularizeList}
//                 pagination={{
//                   current: currentPage,
//                   total: totalRecords,
//                   pageSize,
//                   onChange: handleTableChange,
//                   showSizeChanger: true,
//                   pageSizeOptions: ['10', '20', '50'],
//                   size: 'small',
//                 }}
//                 expandable={{
//                   expandedRowKeys: Object.keys(expandedCards)
//                     .filter((key) => expandedCards[key])
//                     .map((key) => parseInt(key)), // Convert strings to numbers
//                   expandedRowRender: (record) => expandedRowRender(record, showBulkActions),
//                   showExpandColumn: false,
//                 }}
//                 size="small"
//                 bordered
//                 tableLayout="fixed"
//               />
//             </div>
//           )}
//         </>
//       ),
//     },
//     {
//       label: <span className="custom-tab-label">Approved Regularize Requests</span>,
//       key: '2',
//       children: (
//         <>
//           <TableBulkActionIcons
//             selectedRowKeys={selectedRowKeys}
//             totalRecords={totalRecords}
//             handleSearch={handleSearch}
//             activekey={activekey}
//             showBulkActions={showBulkActions}
//             setBulkRegularizeModalOpen={setBulkRegularizeModalOpen}
//             isMobile={isMobile}
//           />
//           {localloading ? (
//             <Skeleton active paragraph={{ rows: 10 }} />
//           ) : !isMobile ? (
//             <Table
//               rowKey="attendanceRequestId"
//               rowSelection={{ type: selectionType, ...rowSelection }}
//               columns={columnsPendingAll}
//               pagination={{
//                 current: currentPage,
//                 total: totalRecords,
//                 position: ['bottomRight'],
//                 pageSize,
//                 showSizeChanger: true,
//                 pageSizeOptions: ['10', '20', '50', '100'],
//                 onChange: handleTableChange,
//               }}
//               dataSource={regularizeList}
//               {...tableCommonProps}
//             />
//           ) : (
//             <div style={{ padding: '0 8px' }}>
//               <Table
//                 rowKey="attendanceRequestId"
//                 columns={getMobileColumns()}
//                 dataSource={regularizeList}
//                 pagination={{
//                   current: currentPage,
//                   total: totalRecords,
//                   pageSize,
//                   onChange: handleTableChange,
//                   showSizeChanger: true,
//                   pageSizeOptions: ['10', '20', '50'],
//                   size: 'small',
//                 }}
//                 expandable={{
//                   expandedRowKeys: Object.keys(expandedCards)
//                     .filter((key) => expandedCards[key])
//                     .map((key) => parseInt(key)), // Convert strings to numbers
//                   expandedRowRender: (record) => expandedRowRender(record, showBulkActions),
//                   showExpandColumn: false,
//                 }}
//                 size="small"
//                 bordered
//                 tableLayout="fixed"
//               />
//             </div>
//           )}
//         </>
//       ),
//     },
//     {
//       label: <span className="custom-tab-label">Rejected Regularize Requests</span>,
//       key: '3',
//       children: (
//         <>
//           <TableBulkActionIcons
//             selectedRowKeys={selectedRowKeys}
//             totalRecords={totalRecords}
//             handleSearch={handleSearch}
//             activekey={activekey}
//             showBulkActions={showBulkActions}
//             setBulkRegularizeModalOpen={setBulkRegularizeModalOpen}
//             isMobile={isMobile}
//           />
//           {localloading ? (
//             <Skeleton active paragraph={{ rows: 10 }} />
//           ) : !isMobile ? (
//             <Table
//               rowKey="attendanceRequestId"
//               columns={columnsHistoryAll}
//               pagination={{
//                 current: currentPage,
//                 total: totalRecords,
//                 position: ['bottomRight'],
//                 pageSize,
//                 showSizeChanger: true,
//                 pageSizeOptions: ['10', '20', '50', '100'],
//                 onChange: handleTableChange,
//               }}
//               dataSource={regularizeList}
//               {...tableCommonProps}
//             />
//           ) : (
//             <div style={{ padding: '0 8px' }}>
//               {/* Header */}
//               <div
//                 style={{
//                   backgroundColor: '#fafafa',
//                   borderRadius: '8px 8px 0 0',
//                   border: '1px solid #d9d9d9',
//                   borderBottom: '2px solid #1890ff',
//                   position: 'sticky',
//                   top: 0,
//                   zIndex: 100,
//                 }}
//               >
//                 <table
//                   style={{
//                     width: '100%',
//                     tableLayout: 'fixed',
//                     borderCollapse: 'collapse',
//                     fontSize: 10,
//                   }}
//                 >
//                   <colgroup>
//                     <col style={{ width: '25%' }} />
//                     <col style={{ width: '20%' }} />
//                     <col style={{ width: '20%' }} />
//                     <col style={{ width: '20%' }} />
//                     <col style={{ width: '15%' }} />
//                   </colgroup>
//                   <thead>
//                     <tr>
//                       <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
//                         Name
//                       </th>
//                       <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
//                         E-Code
//                       </th>
//                       <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
//                         Date
//                       </th>
//                       <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
//                         Status
//                       </th>
//                       <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
//                         Action
//                       </th>
//                     </tr>
//                   </thead>
//                 </table>
//               </div>

//               {/* Rows */}
//               {regularizeList
//                 .slice(
//                   (currentPage - 1) * pageSize,
//                   Math.min(currentPage * pageSize, regularizeList.length),
//                 )
//                 .map((record, idx) => {
//                   const recordId = record?.attendanceRequestId || idx
//                   const isExpanded = expandedCards[recordId]

//                   return (
//                     <div
//                       key={recordId}
//                       style={{ border: '1px solid #d9d9d9', borderTop: 'none', background: '#fff' }}
//                     >
//                       <table
//                         style={{
//                           width: '100%',
//                           tableLayout: 'fixed',
//                           borderCollapse: 'collapse',
//                           fontSize: 9,
//                         }}
//                       >
//                         <colgroup>
//                           <col style={{ width: '25%' }} />
//                           <col style={{ width: '20%' }} />
//                           <col style={{ width: '20%' }} />
//                           <col style={{ width: '20%' }} />
//                           <col style={{ width: '15%' }} />
//                         </colgroup>
//                         <tbody>
//                           <tr>
//                             <td
//                               style={{
//                                 padding: '8px 4px',
//                                 textAlign: 'center',
//                                 wordBreak: 'break-word',
//                                 whiteSpace: 'normal',
//                                 lineHeight: '1.3',
//                               }}
//                             >
//                               {record?.employeeName || '-'}
//                             </td>
//                             <td style={{ padding: '8px 4px', textAlign: 'center' }}>
//                               {record?.ecode || '-'}
//                             </td>
//                             <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: 8 }}>
//                               {record?.requestDate
//                                 ? dayjs(record.requestDate).format('YYYY-MM-DD')
//                                 : '-'}
//                             </td>
//                             <td style={{ padding: '8px 4px', textAlign: 'center' }}>
//                               <Tag
//                                 color={
//                                   record.statusId === 4
//                                     ? 'red'
//                                     : record.statusId === 1
//                                       ? 'green'
//                                       : 'brown'
//                                 }
//                                 style={{ fontSize: 8, padding: '0 3px' }}
//                               >
//                                 {record.statusId === 4
//                                   ? 'Pend'
//                                   : record.statusId === 1
//                                     ? 'Appr'
//                                     : 'Rej'}
//                               </Tag>
//                             </td>
//                             <td style={{ padding: '8px 4px', textAlign: 'center' }}>
//                               <Button
//                                 type="text"
//                                 size="small"
//                                 icon={isExpanded ? <MinusOutlined /> : <PlusOutlined />}
//                                 onClick={() => handleToggleCard(recordId)}
//                                 style={{ fontSize: 10, padding: '2px 4px' }}
//                               />
//                             </td>
//                           </tr>
//                         </tbody>
//                       </table>

//                       {isExpanded && expandedRowRender(record, false)}
//                     </div>
//                   )
//                 })}

//               {/* Pagination */}
//               <div
//                 style={{
//                   marginTop: 16,
//                   textAlign: 'center',
//                   padding: 12,
//                   background: '#fafafa',
//                   border: '1px solid #d9d9d9',
//                   borderRadius: 4,
//                 }}
//               >
//                 <Space direction="vertical" size="small" style={{ width: '100%' }}>
//                   <div style={{ fontSize: 12 }}>
//                     Showing {(currentPage - 1) * pageSize + 1} -{' '}
//                     {Math.min(currentPage * pageSize, regularizeList.length)} of{' '}
//                     {regularizeList.length} items
//                   </div>
//                   <Space>
//                     <Button
//                       size="small"
//                       disabled={currentPage === 1}
//                       onClick={() => setCurrentPage(currentPage - 1)}
//                     >
//                       Previous
//                     </Button>
//                     <span style={{ fontSize: 12 }}>
//                       Page {currentPage} of {Math.ceil(regularizeList.length / pageSize)}
//                     </span>
//                     <Button
//                       size="small"
//                       disabled={currentPage >= Math.ceil(regularizeList.length / pageSize)}
//                       onClick={() => setCurrentPage(currentPage + 1)}
//                     >
//                       Next
//                     </Button>
//                   </Space>
//                 </Space>
//               </div>
//             </div>
//           )}
//         </>
//       ),
//     },

//     {
//       label: <span className="custom-tab-label">My History</span>,
//       key: '4',
//       children: (
//         <>
//           <TableBulkActionIcons
//             selectedRowKeys={selectedRowKeys}
//             totalRecords={totalRecords}
//             handleSearch={handleSearch}
//             activekey={activekey}
//             showBulkActions={showBulkActions}
//             setBulkRegularizeModalOpen={setBulkRegularizeModalOpen}
//             isMobile={isMobile}
//           />
//           {localloading ? (
//             <Skeleton active paragraph={{ rows: 10 }} />
//           ) : !isMobile ? (
//             <Table
//               rowKey="attendanceRequestId"
//               columns={columnsHistoryAll}
//               pagination={{
//                 current: currentPage,
//                 total: totalRecords,
//                 position: ['bottomRight'],
//                 pageSize,
//                 showSizeChanger: true,
//                 pageSizeOptions: ['10', '20', '50', '100'],
//                 onChange: handleTableChange,
//               }}
//               dataSource={regularizeList}
//               {...tableCommonProps}
//             />
//           ) : (
//             <div style={{ padding: '0 8px' }}>
//               {/* Header */}
//               <div
//                 style={{
//                   backgroundColor: '#fafafa',
//                   borderRadius: '8px 8px 0 0',
//                   border: '1px solid #d9d9d9',
//                   borderBottom: '2px solid #1890ff',
//                   position: 'sticky',
//                   top: 0,
//                   zIndex: 100,
//                 }}
//               >
//                 <table
//                   style={{
//                     width: '100%',
//                     tableLayout: 'fixed',
//                     borderCollapse: 'collapse',
//                     fontSize: 10,
//                   }}
//                 >
//                   <colgroup>
//                     <col style={{ width: '25%' }} />
//                     <col style={{ width: '20%' }} />
//                     <col style={{ width: '20%' }} />
//                     <col style={{ width: '20%' }} />
//                     <col style={{ width: '15%' }} />
//                   </colgroup>
//                   <thead>
//                     <tr>
//                       <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
//                         Name
//                       </th>
//                       <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
//                         E-Code
//                       </th>
//                       <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
//                         Date
//                       </th>
//                       <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
//                         Status
//                       </th>
//                       <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
//                         Action
//                       </th>
//                     </tr>
//                   </thead>
//                 </table>
//               </div>

//               {/* Rows */}
//               {regularizeList
//                 .slice(
//                   (currentPage - 1) * pageSize,
//                   Math.min(currentPage * pageSize, regularizeList.length),
//                 )
//                 .map((record, idx) => {
//                   const recordId = record?.attendanceRequestId || idx
//                   const isExpanded = expandedCards[recordId]

//                   return (
//                     <div
//                       key={recordId}
//                       style={{ border: '1px solid #d9d9d9', borderTop: 'none', background: '#fff' }}
//                     >
//                       <table
//                         style={{
//                           width: '100%',
//                           tableLayout: 'fixed',
//                           borderCollapse: 'collapse',
//                           fontSize: 9,
//                         }}
//                       >
//                         <colgroup>
//                           <col style={{ width: '25%' }} />
//                           <col style={{ width: '20%' }} />
//                           <col style={{ width: '20%' }} />
//                           <col style={{ width: '20%' }} />
//                           <col style={{ width: '15%' }} />
//                         </colgroup>
//                         <tbody>
//                           <tr>
//                             <td
//                               style={{
//                                 padding: '8px 4px',
//                                 textAlign: 'center',
//                                 wordBreak: 'break-word',
//                                 whiteSpace: 'normal',
//                                 lineHeight: '1.3',
//                                 fontSize: 9,
//                               }}
//                             >
//                               {record?.employeeName || '-'}
//                             </td>
//                             <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: 9 }}>
//                               {record?.ecode || '-'}
//                             </td>
//                             <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: 8 }}>
//                               {record?.requestDate
//                                 ? dayjs(record.requestDate).format('YYYY-MM-DD')
//                                 : '-'}
//                             </td>
//                             <td style={{ padding: '8px 4px', textAlign: 'center' }}>
//                               <Tag
//                                 color={
//                                   record.statusId === 4
//                                     ? 'red'
//                                     : record.statusId === 1
//                                       ? 'green'
//                                       : 'brown'
//                                 }
//                                 style={{ fontSize: 8, padding: '0 3px' }}
//                               >
//                                 {record.statusId === 4
//                                   ? 'Pend'
//                                   : record.statusId === 1
//                                     ? 'Appr'
//                                     : 'Rej'}
//                               </Tag>
//                             </td>
//                             <td style={{ padding: '8px 4px', textAlign: 'center' }}>
//                               <Button
//                                 type="text"
//                                 size="small"
//                                 icon={isExpanded ? <MinusOutlined /> : <PlusOutlined />}
//                                 onClick={() => handleToggleCard(recordId)}
//                                 style={{ fontSize: 10, padding: '2px 4px' }}
//                               />
//                             </td>
//                           </tr>
//                         </tbody>
//                       </table>

//                       {isExpanded && expandedRowRender(record, false)}
//                     </div>
//                   )
//                 })}

//               {/* Pagination */}
//               <div
//                 style={{
//                   marginTop: 16,
//                   textAlign: 'center',
//                   padding: 12,
//                   background: '#fafafa',
//                   border: '1px solid #d9d9d9',
//                   borderRadius: 4,
//                 }}
//               >
//                 <Space direction="vertical" size="small" style={{ width: '100%' }}>
//                   <div style={{ fontSize: 12 }}>
//                     Showing {(currentPage - 1) * pageSize + 1} -{' '}
//                     {Math.min(currentPage * pageSize, regularizeList.length)} of{' '}
//                     {regularizeList.length} items
//                   </div>
//                   <Space>
//                     <Button
//                       size="small"
//                       disabled={currentPage === 1}
//                       onClick={() => setCurrentPage(currentPage - 1)}
//                     >
//                       Previous
//                     </Button>
//                     <span style={{ fontSize: 12 }}>
//                       Page {currentPage} of {Math.ceil(regularizeList.length / pageSize)}
//                     </span>
//                     <Button
//                       size="small"
//                       disabled={currentPage >= Math.ceil(regularizeList.length / pageSize)}
//                       onClick={() => setCurrentPage(currentPage + 1)}
//                     >
//                       Next
//                     </Button>
//                   </Space>
//                 </Space>
//               </div>
//             </div>
//           )}
//         </>
//       ),
//     },
//   ]

//   const onTabChange = (key) => {
//     setActiveKey(key)
//     setsearchText('')
//     setPageSize(100)
//     setCurrentPage(1)
//   }

//   return (
//     <>
//       <BulkUploadRegularizeFormModal
//         bulkRegularizeModalOpen={bulkRegularizeModalOpen}
//         setBulkRegularizeModalOpen={setBulkRegularizeModalOpen}
//         loading={loading}
//         selectedRowKeys={selectedRowKeys}
//         setSelectedRowKeys={setSelectedRowKeys}
//         activekey={activekey}
//         fetchData={fetchData}
//       />
//       {/* <Pageheading title="Regularize Requests" /> */}
//       {contextHolder}
//       <ToastContainer position="top-right" autoClose={2000} />
//       <Tabs type="card" activeKey={activekey} items={tabItems} onChange={onTabChange} />
//       <Modal
//         title="Regularize Request"
//         open={initiateModalOpen}
//         onCancel={() => setInitiateModalOpen(false)}
//         confirmLoading={loading}
//         width={isMobile ? '95%' : 520}
//         footer={[
//           <Button
//             key="submit"
//             type="primary"
//             onClick={() => handleRegularize(currentRecord?.attendanceRequestId)}
//             disabled={loading || !selectedOption[currentRecord?.attendanceRequestId]}
//             block={isMobile}
//           >
//             Submit
//           </Button>,
//         ]}
//       >
//         <Checkbox
//           checked={selectedOption[currentRecord?.attendanceRequestId] === 1}
//           onChange={() => handleCheckboxChange(1, currentRecord?.attendanceRequestId)}
//           disabled={loading}
//         >
//           Approve
//         </Checkbox>
//         <Checkbox
//           checked={selectedOption[currentRecord?.attendanceRequestId] === 2}
//           onChange={() => handleCheckboxChange(2, currentRecord?.attendanceRequestId)}
//           disabled={loading}
//         >
//           Reject
//         </Checkbox>
//         <TextArea
//           rows={4}
//           value={remarks[currentRecord?.attendanceRequestId]}
//           onChange={(e) => handleRemarksChange(e, currentRecord?.attendanceRequestId)}
//           placeholder="Enter remarks here..."
//           style={{ marginTop: 5 }}
//         />
//       </Modal>
//       <AttendanceRequestModal
//         isAttendanceRequestModalOpen={isAttendanceRequestModalOpen}
//         setIsAttendanceRequestModalOpen={setIsAttendanceRequestModalOpen}
//         regulistAttandanceUpdatedData={regulistAttandanceUpdatedData}
//       />
//     </>
//   )
// }

// const TableBulkActionIcons = ({
//   selectedRowKeys,
//   totalRecords,
//   handleSearch,
//   activekey,
//   showBulkActions,
//   setBulkRegularizeModalOpen,
//   isMobile,
//   ...props
// }) => {
//   const { theme } = useSelector((state) => state.ui)
//   const [statusSummary, setStatusSummary] = useState([
//     { name: 'Total Rows', count: 0, color: 'green' },
//     { name: 'Selected Rows', count: 0, color: 'blue' },
//   ])

//   useEffect(() => {
//     setStatusSummary((prev) => [
//       { ...prev[0], count: totalRecords },
//       { ...prev[1], count: selectedRowKeys?.length },
//     ])
//   }, [selectedRowKeys, totalRecords])

//   return (
//     <div
//       style={{
//         padding: 5,
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         flexWrap: 'wrap',
//         gap: 8,
//       }}
//     >
//       <Space wrap>
//         {statusSummary.map(({ name, label, count }, index) => (
//           <div
//             key={index}
//             style={{
//               border: '2px solid #ccc',
//               padding: 3,
//               borderRadius: 10,
//               display: 'flex',
//               justifyContent: 'center',
//             }}
//             className={theme === 'dark' ? 'dark-theme' : ''}
//           >
//             <Tooltip title={label}>
//               <span style={{ fontSize: 12, padding: '0 8px' }}>
//                 {count} {name}
//               </span>
//             </Tooltip>
//           </div>
//         ))}
//       </Space>
//       <Row gutter={[8, 8]} align="middle" style={{ marginLeft: 'auto' }}>
//         {showBulkActions && (
//           <Col xs={24} sm="auto">
//             <Button
//               onClick={() => setBulkRegularizeModalOpen(true)}
//               disabled={selectedRowKeys?.length === 0}
//               block={isMobile}
//             >
//               Bulk Approve/Reject
//             </Button>
//           </Col>
//         )}
//         <Col xs={24} sm="auto" style={{ minWidth: isMobile ? '100%' : 300 }}>
//           <Search
//             placeholder="Search in table..."
//             allowClear
//             onChange={handleSearch}
//             style={{ width: '100%' }}
//           />
//         </Col>
//       </Row>
//     </div>
//   )
// }

// export default RegularizeRequestTable




import React, { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  LinkOutlined,
  StepForwardOutlined,
  EditOutlined,
  PlusOutlined,
  MinusOutlined,
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
  myregularizeRequestStatusLists,
  regularizeLists,
  regularizeSubmit,
} from '../../services/Services'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { set } from '../../redux/uiSlice'
import { debounce } from 'lodash'
import AttendanceRequestModal from './AttendanceRequestModal'
import Pageheading from '../shared/Pageheading'
import BulkUploadRegularizeFormModal from './BulkUploadRegularizeFormModal'

import useMediaQuery from '../../hooks/useMediaQuery'
import { useActionsMap } from '../../utils/useActionsMap'

dayjs.extend(isBetween)

const { Search } = Input
const { TextArea } = Input
const { useBreakpoint } = Grid

const stripForMobile = (cols) =>
  Array.isArray(cols)
    ? cols.map((col) => {
        const { responsive, fixed, children, ...rest } = col || {}
        if (Array.isArray(children)) {
          rest.children = stripForMobile(children)
        }
        return rest
      })
    : []

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

const RegularizeRequestTable = () => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  const [initiateModalOpen, setInitiateModalOpen] = useState(false)
  const [regularizeList, setRegularizeList] = useState([])
  const [localloading, setlocalLoading] = useState(false)
  const [remarks, setRemarks] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [selectedOption, setSelectedOption] = useState({})
  const [totalRecords, setTotalRecords] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [currentRecord, setCurrentRecord] = useState({})
  const [selectionType] = useState('checkbox')
  const { employeeId, role } = useSelector((state) => state.auth.data)
  const [messageApi, contextHolder] = message.useMessage()
  const [activekey, setActiveKey] = useState('1')
  const [searchText, setsearchText] = useState('')
  const [isAttendanceRequestModalOpen, setIsAttendanceRequestModalOpen] = useState(false)
  const [regulistAttandanceUpdatedData, setregulistAttandanceUpdatedData] = useState({})
  const [requestDateFilterValues, setRequestDateFilterValues] = useState([])
  const [employeeNameFilterValues, setEmployeeNameFilterValues] = useState([])
  const [ecodeFilterValues, setEcodeFilterValues] = useState([])
  const [reportHeadNameFilterValues, setReportHeadNameFilterValues] = useState([])
  const [punchInFilterValues, setPunchInFilterValues] = useState([])
  const [punchOutFilterValues, setPunchOutFilterValues] = useState([])
  const [reasonFilterValues, setReasonFilterValues] = useState([])
  const [empRemarkFilterValues, setEmpRemarkFilterValues] = useState([])
  const [approverRemarkFilterValues, setApproverRemarkFilterValues] = useState([])
  const [bulkRegularizeModalOpen, setBulkRegularizeModalOpen] = useState(false)
  const showBulkActions = activekey === '1' || activekey === '2'

  const { filteredSideMenu } = useSelector((state) => state?.auth || {})
  const actionsMap = useActionsMap(filteredSideMenu)

  const getRequestCycleRange = () => {
    const now = dayjs()
    const cycleStart = now.subtract(1, 'month').date(26).startOf('day')
    const cycleEnd = now.date(25).endOf('day')
    return { cycleStart, cycleEnd }
  }

  const filterByRequestCycle = (list = []) => {
    const { cycleStart, cycleEnd } = getRequestCycleRange()

    return list.filter((item) => {
      if (!item?.requestDate) return false
      const requestDate = dayjs(item.requestDate)
      return requestDate.isValid() && requestDate.isBetween(cycleStart, cycleEnd, null, '[]')
    })
  }

  const handleToggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const formatTime = (value) => (value ? dayjs(`2000-01-01T${value}`).format('hh:mm A') : '-')

  const expandedRowRender = (record, showBulkActions = true) => (
    <div style={{ padding: 12, background: '#fafafa', fontSize: 12 }}>
      <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
        <Col span={6}>
          <div
            style={{
              color: '#666',
              marginBottom: 4,
              fontSize: 10,
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            RM
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 11,
              textAlign: 'center',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.4',
            }}
          >
            {record?.reportHeadName || '-'}
          </div>
        </Col>
        <Col span={6}>
          <div
            style={{
              color: '#666',
              marginBottom: 4,
              fontSize: 10,
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            Reason
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 11,
              textAlign: 'center',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.4',
            }}
          >
            {record?.reason || '-'}
          </div>
        </Col>
        <Col span={6}>
          <div
            style={{
              color: '#666',
              marginBottom: 4,
              fontSize: 10,
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            Clock In
          </div>
          <div style={{ fontWeight: 500, fontSize: 11, textAlign: 'center' }}>
            {formatTime(record?.punchIn)}
          </div>
        </Col>
        <Col span={6}>
          <div
            style={{
              color: '#666',
              marginBottom: 4,
              fontSize: 10,
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            Clock Out
          </div>
          <div style={{ fontWeight: 500, fontSize: 11, textAlign: 'center' }}>
            {formatTime(record?.punchOut)}
          </div>
        </Col>
      </Row>

      <Row style={{ marginBottom: 12 }}>
        <Col span={24}>
          <div
            style={{
              color: '#666',
              marginBottom: 4,
              fontSize: 10,
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            Employee Remarks
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 12,
              textAlign: 'center',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.4',
              padding: '6px 8px',
              background: '#fff',
              borderRadius: '4px',
              border: '1px solid #f0f0f0',
              minHeight: '24px',
            }}
          >
            {record?.employeeRemarks || '-'}
          </div>
        </Col>
      </Row>

      {showBulkActions && (
        <Row>
          <Col span={24}>
            <div style={{ textAlign: 'center' }}>
              <Space size="small">
                {role === 'SuperAdmin' && (
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setIsAttendanceRequestModalOpen(true)
                      setregulistAttandanceUpdatedData(record)
                    }}
                    style={{ fontSize: 11 }}
                  >
                    View
                  </Button>
                )}
                <Button
                  size="small"
                  type="primary"
                  icon={<StepForwardOutlined />}
                  onClick={() => handleInitiateClick(record)}
                  style={{ fontSize: 11 }}
                >
                  Action
                </Button>
                {record?.attachment && (
                  <a href={record.attachment} target="_blank" rel="noopener noreferrer">
                    <Button size="small" icon={<LinkOutlined />} style={{ fontSize: 11 }}>
                      Proof
                    </Button>
                  </a>
                )}
              </Space>
            </div>
          </Col>
        </Row>
      )}
    </div>
  )

  const getMobileColumns = () => [
    {
      title: 'Name',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 65,
      render: (text) => (
        <div
          style={{
            fontSize: 12,
            wordBreak: 'break-word',
            whiteSpace: 'normal',
            lineHeight: '1.3',
            maxWidth: '100%',
          }}
        >
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'E-Code',
      dataIndex: 'ecode',
      key: 'ecode',
      width: 65,
      render: (text) => <div style={{ fontSize: 12 }}>{text || '-'}</div>,
    },
    {
      title: 'Date',
      dataIndex: 'requestDate',
      key: 'requestDate',
      width: 65,
      render: (d) => <div style={{ fontSize: 12 }}>{d ? dayjs(d).format('YYYY-MM-DD') : '-'}</div>,
    },
    {
      title: 'Status',
      dataIndex: 'statusId',
      key: 'statusId',
      width: 50,
      render: (statusId) => (
        <Tag
          color={statusId === 4 ? 'red' : statusId === 1 ? 'green' : 'brown'}
          style={{ fontSize: 10, padding: '0 3px' }}
        >
          {statusId === 4 ? 'Pending' : statusId === 1 ? 'Approved' : 'Rej'}
        </Tag>
      ),
    },
    ...(showBulkActions
      ? [
          {
            title: 'Action',
            key: 'action',
            width: 50,
            render: (_, record) => (
              <div
                style={{ display: 'flex', justifyContent: 'center', gap: 2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  type="text"
                  size="small"
                  icon={
                    expandedCards[record.attendanceRequestId] ? <MinusOutlined /> : <PlusOutlined />
                  }
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleCard(record.attendanceRequestId)
                  }}
                  style={{ fontSize: 10, padding: '2px 4px' }}
                />
              </div>
            ),
          },
        ]
      : []),
  ]

  const { theme, loading } = useSelector((state) => state.ui)
  const dispatch = useDispatch()

  const handleCheckboxChange = (option, attendanceRequestId) => {
    setSelectedOption((prev) => ({ ...prev, [attendanceRequestId]: option }))
  }

  const handleTableChange = (current, newPageSize) => {
    setCurrentPage(current)
    setPageSize(newPageSize)
  }

  const handleInitiateClick = (record) => {
    setCurrentRecord(record)
    setInitiateModalOpen(true)
  }

  const handleRemarksChange = (e, attendanceRequestId) => {
    setRemarks((prev) => ({
      ...prev,
      [attendanceRequestId]: e.target.value,
    }))
  }

  const handleRegularize = async (attendanceRequestId) => {
    if (!remarks[attendanceRequestId]?.trim()) {
      toast.error('Remarks is mandatory!')
      return
    }

    const requestBody = {
      statusId: selectedOption[attendanceRequestId],
      remarks: remarks[attendanceRequestId],
      attendanceRequestId: attendanceRequestId,
    }

    try {
      await dispatch(set({ loading: true }))
      const response = await regularizeSubmit(attendanceRequestId, requestBody, role)

      if (response?.status === 200) {
        activekey === '1' ? await fetchData(4) : await fetchData(1)
        messageApi.success(response?.data?.message)
      } else {
        messageApi.error('Could not regularize request')
      }
    } catch (error) {
      const serverMsg = error?.response?.data?.message
      messageApi.error(serverMsg || 'Could not regularize request')
    } finally {
      await dispatch(set({ loading: false }))
      setInitiateModalOpen(false)
      setRemarks((prev) => ({ ...prev, [attendanceRequestId]: '' }))
      setSelectedOption((prev) => ({ ...prev, [attendanceRequestId]: null }))
    }
  }

  const fetchData = async (statusId) => {
    await dispatch(set({ loading: true }))
    setlocalLoading(true)
    try {
      const effectiveEmployeeId = String(role).toLowerCase().trim() === 'audit' ? 0 : employeeId

      const response = await regularizeLists(
        effectiveEmployeeId,
        currentPage,
        pageSize,
        searchText,
        statusId,
      )

      if (response?.status === 200) {
        const filteredData = filterByRequestCycle(response?.data?.data || [])
        setRegularizeList(filteredData)
        setTotalRecords(filteredData.length)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      await dispatch(set({ loading: false }))
      setlocalLoading(false)
    }
  }

  const fetchDataReguliseHistory = async () => {
    await dispatch(set({ loading: true }))
    setlocalLoading(true)
    try {
      const response = await myregularizeRequestStatusLists(employeeId)
      console.log('my history:', response)
      if (response?.status === 200) {
        const filteredData = filterByRequestCycle(response?.data?.data || [])
        setRegularizeList(filteredData)
        setTotalRecords(filteredData.length)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      await dispatch(set({ loading: false }))
      setlocalLoading(false)
    }
  }

  useEffect(() => {
    if (activekey === '1') {
      fetchData(4)
    } else if (activekey === '2') {
      fetchData(1)
    } else if (activekey === '3') {
      fetchData(2)
    } else if (activekey === '4') {
      fetchDataReguliseHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, activekey, searchText])

  const baseNameCol = {
    title: 'Name',
    dataIndex: 'employeeName',
    key: 'employeeName',
    fixed: 'left',
    width: 150,
    filteredValue: employeeNameFilterValues.length ? employeeNameFilterValues : null,
    onFilter: () => true,
    filterDropdown: ({ confirm }) => (
      <FilterDropdown
        title="Name"
        dataIndex="employeeName"
        dataList={[...new Set(regularizeList.map((item) => item.employeeName))]}
        filterValues={employeeNameFilterValues}
        setFilterValues={setEmployeeNameFilterValues}
        confirm={confirm}
      />
    ),
  }

  const columnsDesktop = [
    baseNameCol,
    {
      title: 'E Code',
      dataIndex: 'ecode',
      key: 'ecode',
      fixed: 'left',
      width: 100,
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
      title: 'St Code',
      dataIndex: 'stCode',
      key: 'stCode',
      width: 90,
      ellipsis: true,
    },
    {
      title: 'St Name',
      dataIndex: 'locationName',
      key: 'locationName',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'RM',
      dataIndex: 'reportHeadName',
      key: 'reportHeadName',
      width: 200,
      filteredValue: reportHeadNameFilterValues.length ? reportHeadNameFilterValues : null,
      onFilter: () => true,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="RM"
          dataIndex="reportHeadName"
          dataList={[...new Set(regularizeList.map((item) => item.reportHeadName))]}
          filterValues={reportHeadNameFilterValues}
          setFilterValues={setReportHeadNameFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: 150,
      filteredValue: reasonFilterValues.length ? reasonFilterValues : null,
      onFilter: () => true,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Reason"
          dataIndex="reason"
          dataList={[...new Set(regularizeList.map((item) => item.reason))]}
          filterValues={reasonFilterValues}
          setFilterValues={setReasonFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Date',
      dataIndex: 'requestDate',
      key: 'requestDate',
      width: 150,
      render: (d) => dayjs(d).format('YYYY-MM-DD'),
      sorter: (a, b) => dayjs(a.requestDate).unix() - dayjs(b.requestDate).unix(),
      defaultSortOrder: 'ascend',
      filteredValue: requestDateFilterValues.length ? requestDateFilterValues : null,
      onFilter: () => true,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Date"
          dataIndex="requestDate"
          dataList={[
            ...new Set(regularizeList.map((item) => dayjs(item.requestDate).format('YYYY-MM-DD'))),
          ]}
          filterValues={requestDateFilterValues}
          setFilterValues={setRequestDateFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Clock In',
      dataIndex: 'punchIn',
      key: 'punchIn',
      width: 120,
      filteredValue: punchInFilterValues.length ? punchInFilterValues : null,
      onFilter: () => true,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Clock In"
          dataIndex="punchIn"
          dataList={[...new Set(regularizeList.map((item) => item.punchIn))]}
          filterValues={punchInFilterValues}
          setFilterValues={setPunchInFilterValues}
          confirm={confirm}
        />
      ),
      render: (t) => formatTime(t),
    },
    {
      title: 'Clock Out',
      dataIndex: 'punchOut',
      key: 'punchOut',
      width: 120,
      filteredValue: punchOutFilterValues.length ? punchOutFilterValues : null,
      onFilter: () => true,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Clock Out"
          dataIndex="punchOut"
          dataList={[...new Set(regularizeList.map((item) => item.punchOut))]}
          filterValues={punchOutFilterValues}
          setFilterValues={setPunchOutFilterValues}
          confirm={confirm}
        />
      ),
      render: (t) => formatTime(t),
    },
    {
      title: 'Proof',
      dataIndex: 'attachment',
      key: 'attachment',
      width: 100,
      render: (url) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            <LinkOutlined />
          </a>
        ) : (
          ''
        ),
    },
    {
      title: 'Emp. Remark',
      dataIndex: 'employeeRemarks',
      key: 'employeeRemarks',
      width: 200,
      filteredValue: empRemarkFilterValues.length ? empRemarkFilterValues : null,
      onFilter: () => true,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Emp. Remark"
          dataIndex="employeeRemarks"
          dataList={[...new Set(regularizeList.map((item) => item.employeeRemarks || ''))]}
          filterValues={empRemarkFilterValues}
          setFilterValues={setEmpRemarkFilterValues}
          confirm={confirm}
        />
      ),
      render: (text) => {
        const shortText = text?.length > 15 ? text.slice(0, 15) + '...' : text
        return (
          <Tooltip title={text}>
            <span>{shortText}</span>
          </Tooltip>
        )
      },
    },
    {
      title: 'Status',
      dataIndex: 'statusId',
      key: 'statusId',
      width: 120,
      render: (statusId) => (
        <Tag color={statusId === 4 ? 'red' : statusId === 1 ? 'green' : 'brown'}>
          {statusId === 4 ? 'Pending' : statusId === 1 ? 'Approved' : 'Rejected'}
        </Tag>
      ),
    },
    {
      title: 'RM Status',
      dataIndex: 'managerApprovalStatusId',
      key: 'managerApprovalStatusId',
      width: 120,
      render: (statusId) => (
        <Tag color={statusId === 4 ? 'red' : statusId === 1 ? 'green' : 'brown'}>
          {statusId === 4 ? 'Pending' : statusId === 1 ? 'Approved' : 'Rejected'}
        </Tag>
      ),
    },
    {
      title: 'RM Remarks',
      dataIndex: 'managerRemarks',
      key: 'managerRemarks',
      width: 200,
      render: (text) => {
        const shortText = text?.length > 15 ? text.slice(0, 15) + '...' : text
        return (
          <Tooltip title={text}>
            <span>{shortText}</span>
          </Tooltip>
        )
      },
    },
    {
      title: 'RM Status Updated By',
      dataIndex: 'managerEcode',
      key: 'managerEcode',
      width: 180,
      render: (text) => {
        const shortText = text?.length > 15 ? text.slice(0, 15) + '...' : text
        return (
          <Tooltip title={text}>
            <span>{shortText}</span>
          </Tooltip>
        )
      },
    },
    {
      title: 'LP Status',
      dataIndex: 'lpApprovalStatusId',
      key: 'lpApprovalStatusId',
      width: 120,
      render: (statusId) => (
        <Tag color={statusId === 4 ? 'red' : statusId === 1 ? 'green' : 'brown'}>
          {statusId === 4 ? 'Pending' : statusId === 1 ? 'Approved' : 'Rejected'}
        </Tag>
      ),
    },
    {
      title: 'LP Remarks',
      dataIndex: 'lpRemarks',
      key: 'lpRemarks',
      width: 200,
      render: (text) => {
        const shortText = text?.length > 15 ? text.slice(0, 15) + '...' : text
        return (
          <Tooltip title={text}>
            <span>{shortText}</span>
          </Tooltip>
        )
      },
    },
    {
      title: 'LP Status Updated By',
      dataIndex: 'lpEcode',
      key: 'lpEcode',
      width: 180,
      render: (text) => {
        const shortText = text?.length > 15 ? text.slice(0, 15) + '...' : text
        return (
          <Tooltip title={text}>
            <span>{shortText}</span>
          </Tooltip>
        )
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          {role === 'SuperAdmin' && (
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

          {actionsMap?.action?.actionStatus && (
            <Tooltip placement="top" title={'Action'}>
              <StepForwardOutlined
                style={{ fontSize: 18 }}
                onClick={() => handleInitiateClick(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  const columnsHistoryDesktop = [
    baseNameCol,
    {
      title: 'E Code',
      dataIndex: 'ecode',
      key: 'ecode',
      width: 100,
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
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: 150,
      filteredValue: reasonFilterValues.length ? reasonFilterValues : null,
      onFilter: () => true,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Reason"
          dataIndex="reason"
          dataList={[...new Set(regularizeList.map((item) => item.reason))]}
          filterValues={reasonFilterValues}
          setFilterValues={setReasonFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Date',
      dataIndex: 'requestDate',
      key: 'requestDate',
      width: 150,
      render: (d) => dayjs(d).format('YYYY-MM-DD'),
      sorter: (a, b) => dayjs(a.requestDate).unix() - dayjs(b.requestDate).unix(),
      defaultSortOrder: 'ascend',
      filteredValue: requestDateFilterValues.length ? requestDateFilterValues : null,
      onFilter: () => true,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Date"
          dataIndex="requestDate"
          dataList={[
            ...new Set(regularizeList.map((item) => dayjs(item.requestDate).format('YYYY-MM-DD'))),
          ]}
          filterValues={requestDateFilterValues}
          setFilterValues={setRequestDateFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Clock In',
      dataIndex: 'punchIn',
      key: 'punchIn',
      width: 120,
      filteredValue: punchInFilterValues.length ? punchInFilterValues : null,
      onFilter: () => true,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Clock In"
          dataIndex="punchIn"
          dataList={[...new Set(regularizeList.map((item) => item.punchIn))]}
          filterValues={punchInFilterValues}
          setFilterValues={setPunchInFilterValues}
          confirm={confirm}
        />
      ),
      render: (t) => formatTime(t),
    },
    {
      title: 'Clock Out',
      dataIndex: 'punchOut',
      key: 'punchOut',
      width: 120,
      filteredValue: punchOutFilterValues.length ? punchOutFilterValues : null,
      onFilter: () => true,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Clock Out"
          dataIndex="punchOut"
          dataList={[...new Set(regularizeList.map((item) => item.punchOut))]}
          filterValues={punchOutFilterValues}
          setFilterValues={setPunchOutFilterValues}
          confirm={confirm}
        />
      ),
      render: (t) => formatTime(t),
    },
    {
      title: 'Proof',
      dataIndex: 'attachment',
      key: 'attachment',
      width: 100,
      render: (url) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer">
            <LinkOutlined />
          </a>
        ) : (
          ''
        ),
    },
    {
      title: 'Message',
      dataIndex: 'employeeRemarks',
      key: 'employeeRemarks',
      width: 200,
      filteredValue: empRemarkFilterValues.length ? empRemarkFilterValues : null,
      onFilter: () => true,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Message"
          dataIndex="employeeRemarks"
          dataList={[...new Set(regularizeList.map((item) => item.employeeRemarks || ''))]}
          filterValues={empRemarkFilterValues}
          setFilterValues={setEmpRemarkFilterValues}
          confirm={confirm}
        />
      ),
      render: (text) => {
        const shortText = text?.length > 15 ? text.slice(0, 15) + '...' : text
        return (
          <Tooltip title={text}>
            <span>{shortText}</span>
          </Tooltip>
        )
      },
    },
    {
      title: 'Status',
      dataIndex: 'statusId',
      key: 'statusId',
      width: 120,
      render: (statusId) => (
        <Tag color={statusId === 4 ? 'red' : statusId === 1 ? 'green' : 'brown'}>
          {statusId === 4 ? 'Pending' : statusId === 1 ? 'Approved' : 'Rejected'}
        </Tag>
      ),
    },
    {
      title: 'RM Status',
      dataIndex: 'managerApprovalStatusId',
      key: 'managerApprovalStatusId',
      width: 120,
      render: (statusId) => (
        <Tag
          color={statusId === 4 || statusId === null ? 'yellow' : statusId === 1 ? 'green' : 'red'}
        >
          {statusId === 4 || statusId === null
            ? 'Pending'
            : statusId === 1
              ? 'Approved'
              : 'Rejected'}
        </Tag>
      ),
    },
    {
      title: 'RM Remarks',
      dataIndex: 'managerRemarks',
      key: 'managerRemarks',
      width: 200,
      render: (text) => {
        const shortText = text?.length > 15 ? text.slice(0, 15) + '...' : text
        return (
          <Tooltip title={text}>
            <span>{shortText}</span>
          </Tooltip>
        )
      },
    },
    {
      title: 'LP Status',
      dataIndex: 'lpApprovalStatusId',
      key: 'lpApprovalStatusId',
      width: 120,
      render: (statusId) => (
        <Tag
          color={statusId === 4 || statusId === null ? 'yellow' : statusId === 1 ? 'green' : 'red'}
        >
          {statusId === 4 || statusId === null
            ? 'Pending'
            : statusId === 1
              ? 'Approved'
              : 'Rejected'}
        </Tag>
      ),
    },
    {
      title: 'LP Remarks',
      dataIndex: 'lpRemarks',
      key: 'lpRemarks',
      width: 200,
      render: (text) => {
        const shortText = text?.length > 15 ? text.slice(0, 15) + '...' : text
        return (
          <Tooltip title={text}>
            <span>{shortText}</span>
          </Tooltip>
        )
      },
    },
  ]

  const columnsPendingAll = isMobile ? stripForMobile(columnsDesktop) : columnsDesktop
  const columnsHistoryAll = isMobile ? stripForMobile(columnsHistoryDesktop) : columnsHistoryDesktop

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
  }

  const handleSearchh = useCallback(
    debounce((text) => setsearchText(text), 500),
    [],
  )

  const handleSearch = (e) => {
    const text = e.target.value
    handleSearchh(text)
  }

  const tableCommonProps = {
    bordered: true,
    className: theme === 'dark' ? 'dark-theme' : '',
    tableLayout: isMobile ? 'fixed' : undefined,
    size: isMobile ? 'small' : 'middle',
    scroll: {
      x: 'max-content',
      y: isMobile ? 360 : 'calc(100vh - 160px)',
    },
    locale: {
      emptyText: <Empty description="No data available" />,
    },
  }

  const tabItems = [
    {
      label: <span className="custom-tab-label">Pending Regularize Requests</span>,
      key: '1',
      children: (
        <>
          <TableBulkActionIcons
            selectedRowKeys={selectedRowKeys}
            totalRecords={totalRecords}
            handleSearch={handleSearch}
            activekey={activekey}
            showBulkActions={showBulkActions}
            setBulkRegularizeModalOpen={setBulkRegularizeModalOpen}
            isMobile={isMobile}
          />
          {localloading ? (
            <Skeleton active paragraph={{ rows: 10 }} />
          ) : !isMobile ? (
            <Table
              rowKey="attendanceRequestId"
              rowSelection={showBulkActions ? { type: selectionType, ...rowSelection } : undefined}
              columns={columnsPendingAll}
              pagination={{
                current: currentPage,
                total: totalRecords,
                position: ['bottomRight'],
                pageSize,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                onChange: handleTableChange,
              }}
              dataSource={regularizeList}
              {...tableCommonProps}
            />
          ) : (
            <div style={{ padding: '0 8px' }}>
              <Table
                rowKey="attendanceRequestId"
                columns={getMobileColumns()}
                dataSource={regularizeList}
                pagination={{
                  current: currentPage,
                  total: totalRecords,
                  pageSize,
                  onChange: handleTableChange,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50'],
                  size: 'small',
                }}
                expandable={{
                  expandedRowKeys: Object.keys(expandedCards)
                    .filter((key) => expandedCards[key])
                    .map((key) => parseInt(key)),
                  expandedRowRender: (record) => expandedRowRender(record, showBulkActions),
                  showExpandColumn: false,
                }}
                size="small"
                bordered
                tableLayout="fixed"
              />
            </div>
          )}
        </>
      ),
    },
    {
      label: <span className="custom-tab-label">Approved Regularize Requests</span>,
      key: '2',
      children: (
        <>
          <TableBulkActionIcons
            selectedRowKeys={selectedRowKeys}
            totalRecords={totalRecords}
            handleSearch={handleSearch}
            activekey={activekey}
            showBulkActions={showBulkActions}
            setBulkRegularizeModalOpen={setBulkRegularizeModalOpen}
            isMobile={isMobile}
          />
          {localloading ? (
            <Skeleton active paragraph={{ rows: 10 }} />
          ) : !isMobile ? (
            <Table
              rowKey="attendanceRequestId"
              rowSelection={{ type: selectionType, ...rowSelection }}
              columns={columnsPendingAll}
              pagination={{
                current: currentPage,
                total: totalRecords,
                position: ['bottomRight'],
                pageSize,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                onChange: handleTableChange,
              }}
              dataSource={regularizeList}
              {...tableCommonProps}
            />
          ) : (
            <div style={{ padding: '0 8px' }}>
              <Table
                rowKey="attendanceRequestId"
                columns={getMobileColumns()}
                dataSource={regularizeList}
                pagination={{
                  current: currentPage,
                  total: totalRecords,
                  pageSize,
                  onChange: handleTableChange,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50'],
                  size: 'small',
                }}
                expandable={{
                  expandedRowKeys: Object.keys(expandedCards)
                    .filter((key) => expandedCards[key])
                    .map((key) => parseInt(key)),
                  expandedRowRender: (record) => expandedRowRender(record, showBulkActions),
                  showExpandColumn: false,
                }}
                size="small"
                bordered
                tableLayout="fixed"
              />
            </div>
          )}
        </>
      ),
    },
    {
      label: <span className="custom-tab-label">Rejected Regularize Requests</span>,
      key: '3',
      children: (
        <>
          <TableBulkActionIcons
            selectedRowKeys={selectedRowKeys}
            totalRecords={totalRecords}
            handleSearch={handleSearch}
            activekey={activekey}
            showBulkActions={showBulkActions}
            setBulkRegularizeModalOpen={setBulkRegularizeModalOpen}
            isMobile={isMobile}
          />
          {localloading ? (
            <Skeleton active paragraph={{ rows: 10 }} />
          ) : !isMobile ? (
            <Table
              rowKey="attendanceRequestId"
              columns={columnsHistoryAll}
              pagination={{
                current: currentPage,
                total: totalRecords,
                position: ['bottomRight'],
                pageSize,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                onChange: handleTableChange,
              }}
              dataSource={regularizeList}
              {...tableCommonProps}
            />
          ) : (
            <div style={{ padding: '0 8px' }}>
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
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '15%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                        Name
                      </th>
                      <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                        E-Code
                      </th>
                      <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                        Date
                      </th>
                      <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                        Status
                      </th>
                      <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              {regularizeList
                .slice(
                  (currentPage - 1) * pageSize,
                  Math.min(currentPage * pageSize, regularizeList.length),
                )
                .map((record, idx) => {
                  const recordId = record?.attendanceRequestId || idx
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
                          fontSize: 9,
                        }}
                      >
                        <colgroup>
                          <col style={{ width: '25%' }} />
                          <col style={{ width: '20%' }} />
                          <col style={{ width: '20%' }} />
                          <col style={{ width: '20%' }} />
                          <col style={{ width: '15%' }} />
                        </colgroup>
                        <tbody>
                          <tr>
                            <td
                              style={{
                                padding: '8px 4px',
                                textAlign: 'center',
                                wordBreak: 'break-word',
                                whiteSpace: 'normal',
                                lineHeight: '1.3',
                              }}
                            >
                              {record?.employeeName || '-'}
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                              {record?.ecode || '-'}
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: 8 }}>
                              {record?.requestDate
                                ? dayjs(record.requestDate).format('YYYY-MM-DD')
                                : '-'}
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                              <Tag
                                color={
                                  record.statusId === 4
                                    ? 'red'
                                    : record.statusId === 1
                                      ? 'green'
                                      : 'brown'
                                }
                                style={{ fontSize: 8, padding: '0 3px' }}
                              >
                                {record.statusId === 4
                                  ? 'Pend'
                                  : record.statusId === 1
                                    ? 'Appr'
                                    : 'Rej'}
                              </Tag>
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                              <Button
                                type="text"
                                size="small"
                                icon={isExpanded ? <MinusOutlined /> : <PlusOutlined />}
                                onClick={() => handleToggleCard(recordId)}
                                style={{ fontSize: 10, padding: '2px 4px' }}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {isExpanded && expandedRowRender(record, false)}
                    </div>
                  )
                })}

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
                    {Math.min(currentPage * pageSize, regularizeList.length)} of{' '}
                    {regularizeList.length} items
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
                      Page {currentPage} of {Math.ceil(regularizeList.length / pageSize)}
                    </span>
                    <Button
                      size="small"
                      disabled={currentPage >= Math.ceil(regularizeList.length / pageSize)}
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
      ),
    },
    {
      label: <span className="custom-tab-label">My History</span>,
      key: '4',
      children: (
        <>
          <TableBulkActionIcons
            selectedRowKeys={selectedRowKeys}
            totalRecords={totalRecords}
            handleSearch={handleSearch}
            activekey={activekey}
            showBulkActions={showBulkActions}
            setBulkRegularizeModalOpen={setBulkRegularizeModalOpen}
            isMobile={isMobile}
          />
          {localloading ? (
            <Skeleton active paragraph={{ rows: 10 }} />
          ) : !isMobile ? (
            <Table
              rowKey="attendanceRequestId"
              columns={columnsHistoryAll}
              pagination={{
                current: currentPage,
                total: totalRecords,
                position: ['bottomRight'],
                pageSize,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                onChange: handleTableChange,
              }}
              dataSource={regularizeList}
              {...tableCommonProps}
            />
          ) : (
            <div style={{ padding: '0 8px' }}>
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
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '15%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                        Name
                      </th>
                      <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                        E-Code
                      </th>
                      <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                        Date
                      </th>
                      <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                        Status
                      </th>
                      <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              {regularizeList
                .slice(
                  (currentPage - 1) * pageSize,
                  Math.min(currentPage * pageSize, regularizeList.length),
                )
                .map((record, idx) => {
                  const recordId = record?.attendanceRequestId || idx
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
                          fontSize: 9,
                        }}
                      >
                        <colgroup>
                          <col style={{ width: '25%' }} />
                          <col style={{ width: '20%' }} />
                          <col style={{ width: '20%' }} />
                          <col style={{ width: '20%' }} />
                          <col style={{ width: '15%' }} />
                        </colgroup>
                        <tbody>
                          <tr>
                            <td
                              style={{
                                padding: '8px 4px',
                                textAlign: 'center',
                                wordBreak: 'break-word',
                                whiteSpace: 'normal',
                                lineHeight: '1.3',
                                fontSize: 9,
                              }}
                            >
                              {record?.employeeName || '-'}
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: 9 }}>
                              {record?.ecode || '-'}
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: 8 }}>
                              {record?.requestDate
                                ? dayjs(record.requestDate).format('YYYY-MM-DD')
                                : '-'}
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                              <Tag
                                color={
                                  record.statusId === 4
                                    ? 'red'
                                    : record.statusId === 1
                                      ? 'green'
                                      : 'brown'
                                }
                                style={{ fontSize: 8, padding: '0 3px' }}
                              >
                                {record.statusId === 4
                                  ? 'Pend'
                                  : record.statusId === 1
                                    ? 'Appr'
                                    : 'Rej'}
                              </Tag>
                            </td>
                            <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                              <Button
                                type="text"
                                size="small"
                                icon={isExpanded ? <MinusOutlined /> : <PlusOutlined />}
                                onClick={() => handleToggleCard(recordId)}
                                style={{ fontSize: 10, padding: '2px 4px' }}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {isExpanded && expandedRowRender(record, false)}
                    </div>
                  )
                })}

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
                    {Math.min(currentPage * pageSize, regularizeList.length)} of{' '}
                    {regularizeList.length} items
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
                      Page {currentPage} of {Math.ceil(regularizeList.length / pageSize)}
                    </span>
                    <Button
                      size="small"
                      disabled={currentPage >= Math.ceil(regularizeList.length / pageSize)}
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
      ),
    },
  ]

  const onTabChange = (key) => {
    setActiveKey(key)
    setsearchText('')
    setPageSize(100)
    setCurrentPage(1)
  }

  return (
    <>
      <BulkUploadRegularizeFormModal
        bulkRegularizeModalOpen={bulkRegularizeModalOpen}
        setBulkRegularizeModalOpen={setBulkRegularizeModalOpen}
        loading={loading}
        selectedRowKeys={selectedRowKeys}
        setSelectedRowKeys={setSelectedRowKeys}
        activekey={activekey}
        fetchData={fetchData}
      />
      {/* <Pageheading title="Regularize Requests" /> */}
      {contextHolder}
      <ToastContainer position="top-right" autoClose={2000} />
      <Tabs type="card" activeKey={activekey} items={tabItems} onChange={onTabChange} />
      <Modal
        title="Regularize Request"
        open={initiateModalOpen}
        onCancel={() => setInitiateModalOpen(false)}
        confirmLoading={loading}
        width={isMobile ? '95%' : 520}
        footer={[
          <Button
            key="submit"
            type="primary"
            onClick={() => handleRegularize(currentRecord?.attendanceRequestId)}
            disabled={loading || !selectedOption[currentRecord?.attendanceRequestId]}
            block={isMobile}
          >
            Submit
          </Button>,
        ]}
      >
        <Checkbox
          checked={selectedOption[currentRecord?.attendanceRequestId] === 1}
          onChange={() => handleCheckboxChange(1, currentRecord?.attendanceRequestId)}
          disabled={loading}
        >
          Approve
        </Checkbox>
        <Checkbox
          checked={selectedOption[currentRecord?.attendanceRequestId] === 2}
          onChange={() => handleCheckboxChange(2, currentRecord?.attendanceRequestId)}
          disabled={loading}
        >
          Reject
        </Checkbox>
        <TextArea
          rows={4}
          value={remarks[currentRecord?.attendanceRequestId]}
          onChange={(e) => handleRemarksChange(e, currentRecord?.attendanceRequestId)}
          placeholder="Enter remarks here..."
          style={{ marginTop: 5 }}
        />
      </Modal>
      <AttendanceRequestModal
        isAttendanceRequestModalOpen={isAttendanceRequestModalOpen}
        setIsAttendanceRequestModalOpen={setIsAttendanceRequestModalOpen}
        regulistAttandanceUpdatedData={regulistAttandanceUpdatedData}
      />
    </>
  )
}

const TableBulkActionIcons = ({
  selectedRowKeys,
  totalRecords,
  handleSearch,
  activekey,
  showBulkActions,
  setBulkRegularizeModalOpen,
  isMobile,
  ...props
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
      <Row gutter={[8, 8]} align="middle" style={{ marginLeft: 'auto' }}>
        {showBulkActions && (
          <Col xs={24} sm="auto">
            <Button
              onClick={() => setBulkRegularizeModalOpen(true)}
              disabled={selectedRowKeys?.length === 0}
              block={isMobile}
            >
              Bulk Approve/Reject
            </Button>
          </Col>
        )}
        <Col xs={24} sm="auto" style={{ minWidth: isMobile ? '100%' : 300 }}>
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

export default RegularizeRequestTable