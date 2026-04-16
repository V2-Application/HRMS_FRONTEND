// import React, { useEffect, useState } from 'react'
// import { Row, Input, Button, Modal, DatePicker, Radio, Select, Card, Form, Spin } from 'antd'
// import TextArea from 'antd/es/input/TextArea'
// import { toast, ToastContainer } from 'react-toastify'
// import ManagerEmpLeaveCard from '../../../components/ManagerEmpLeaveCard'
// import dayjs from 'dayjs'
// import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
// import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
// import Pageheading from '../../../components/shared/Pageheading'
// import axiosInstance from '../../../services/axiosInstance'
// import { useSelector } from 'react-redux'
// import { searchEmployeeDropdown } from '../../../services/Services'

// dayjs.extend(isSameOrAfter)
// dayjs.extend(isSameOrBefore)
// const { Search } = Input
// const { RangePicker } = DatePicker

// const ManagerEmpLeaveList = () => {
//   const [form] = Form.useForm()
//   const [loading, setLoading] = useState(false)
//   const [remarksModalOpen, setRemarksModalOpen] = useState(false)
//   const [remarks, setRemarks] = useState({})
//   const [actionType, setActionType] = useState()
//   const [selectedCandidateId, setSelectedCandidateId] = useState(null)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [leaveData, setLeaveData] = useState([])
//   const [filteredData, setFilteredData] = useState(leaveData)
//   const [selectedRange, setSelectedRange] = useState([])
//   const [requestId, setRequestId] = useState('')
//   const [relieverRequired, setRelieverRequired] = useState(false)
//   const [selectedReliever, setSelectedReliever] = useState(null)
//   const [relieverDateRange, setRelieverDateRange] = useState([])
//   const [relieverRole] = useState('reliever') // readonly field
//   const [searchLoading, setsearchLoading] = useState(false)
//   const [employees, setEmployees] = useState([])
//   const [searchText, setSearchText] = useState('')
//   const [store, setStore] = useState('')
//   const [stDate, setStDate] = useState(null)
//   const [edDate, setEdDate] = useState(null)
//   const [locationId, setLocationId] = useState(null)

//   const { employeeId } = useSelector((state) => state?.auth?.data)

//   const options = [
//     { label: 'Required', value: true },
//     { label: 'Not Required', value: false },
//   ]

//   const empOptions = []
//   for (let i = 10; i < 36; i++) {
//     empOptions.push({
//       value: i.toString(36) + i,
//       label: i.toString(36) + i,
//     })
//   }

//   useEffect(() => {
//     if (searchText.length >= 2) {
//       setsearchLoading(true)
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
//             console.error('Error fetching employee attendance:', error)
//             setEmployees([])
//           } finally {
//             setsearchLoading(false)
//           }
//         }

//         fetchData()
//       }, 800)

//       return () => clearTimeout(debounceTimer)
//     }
//   }, [searchText])

//   const handleRelieverDateChange = (dates) => {
//     setRelieverDateRange(dates || [])
//     console.log('selected date range:', dates)
//   }

//   const applyFilters = (dates, search) => {
//     const filtered = leaveData.filter((item) => {
//       let dateMatch = true
//       let searchMatch = true

//       // apply date filterting if dates are provided
//       if (dates && dates.length === 2) {
//         const [startDate, endDate] = dates
//         const itemStart = item.empLeaveStartDate
//           ? dayjs(item.empLeaveStartDate, 'YYYY-MM-DD')
//           : null
//         const itemEnd = item.empLeaveEndDate ? dayjs(item.empLeaveEndDate, 'YYYY-MM-DD') : null

//         // if no end dateMatch, use start date as actual date
//         const actualEnd = itemEnd && itemEnd.isValid() ? itemEnd : itemStart

//         if (!itemStart || !itemStart.isValid()) {
//           dateMatch = false
//         } else {
//           dateMatch =
//             itemStart.isSameOrAfter(startDate, 'day') && actualEnd.isSameOrBefore(endDate, 'day')
//         }
//       }

//       // apply search filterting if search term is provided
//       if (search && search.trim() !== '') {
//         searchMatch = Object.keys(item).some((key) => {
//           let value = item[key]
//           if (typeof value !== 'string') {
//             value = String(value)
//           }
//           return value.toLowerCase().includes(search.toLowerCase())
//         })
//       }

//       return dateMatch && searchMatch
//     })

//     setFilteredData(filtered)
//   }

//   useEffect(() => {
//     applyFilters()
//   }, [leaveData])

//   // onChange now calls filterData immediately.
//   const onRangeChange = (dates) => {
//     setSelectedRange(dates || [])
//     applyFilters(dates, searchTerm)
//   }

//   const onSearchChange = (e) => {
//     const value = e.target.value
//     setSearchTerm(value)
//     applyFilters(selectedRange, value)
//   }

//   const handleRemarksChange = (e) => {
//     setRemarks((prev) => ({
//       ...prev,
//       [parseInt(selectedCandidateId)]: e.target.value,
//     }))
//   }

//   const fetchData = async () => {
//     try {
//       const response = await axiosInstance.get(
//         `/api/Leave/LeaveRequestsformanager?statusId=${4}&pageNumber=1&pageSize=10000`,
//       )

//       console.log('leave request for manager api res: ', response)

//       if (response.status === 200) {
//         const data = response.data?.data || []
//         const formatted_data =
//           Array.isArray(data) &&
//           data.map((dt) => ({
//             empName: dt?.employeeName,
//             empCode: dt?.ecode,
//             empLeaveType: dt?.leaveTypeName,
//             empLeaveStartDate: dt?.startDate === null ? null : dt?.startDate?.split('T')[0],
//             empLeaveEndDate: dt?.endDate === null ? null : dt?.endDate?.split('T')[0],
//             reason: dt?.reason,
//             appliedOn: dt?.createdOn === null ? null : dt?.createdOn?.split('T')[0],
//             requestId: dt?.leaveRequestId,
//             storeCodeName: `${dt?.stCode} - ${dt?.locationName}`,
//             locId: dt?.locationId,
//             leaveDayType: dt?.firstHalf
//               ? 'First Half'
//               : dt?.secondHalf
//                 ? 'Second Half'
//                 : dt?.fullDay
//                   ? 'Full Day'
//                   : '-',
//           }))

//         console.log('formatted_data: ', formatted_data)

//         // const formatted_data = [
//         //   {
//         //     empName: 'Rohit',
//         //     empCode: 'RTNR92',
//         //     empLeaveType: 'Casual',
//         //     empLeaveStartDate: '2025-01-01',
//         //     empLeaveEndDate: '2025-02-02',
//         //     reason: 'Winter and spring break',
//         //     appliedOn: '2024-12-29',
//         //     requestId: 1,
//         //   },
//         // ]

//         setLeaveData(formatted_data)
//       }
//     } catch (error) {
//       console.error('api error: ', error)
//     }
//   }

//   useEffect(() => {
//     fetchData()
//   }, [])

//   const handleApproveRejectRequest = async () => {
//     try {
//       const values = await form.validateFields()
//       const { selectedReliever } = values

//       const body1 = {
//         statusId: actionType,
//         remarks: values?.remarks,
//       }

//       const body2 = {
//         statusId: actionType,
//         remarks: values?.remarks,
//         relieverEmployeeId: selectedReliever,
//         assignLocations: [
//           {
//             candidateId: selectedReliever,
//             assignedLocation: locationId,
//             assignedReason: 'Reliever',
//             isActive: true,
//             assignedOnDate: stDate,
//             releasedOnDate: edDate,
//           },
//         ],
//       }

//       setLoading(true)
//       const response = await axiosInstance.post(
//         `/api/Leave/UpdateLeaveRequestStatus/${parseInt(requestId)}`,
//         actionType === 1 ? body2 : actionType === 2 ? body1 : null,
//       )

//       console.log('post app/rej api res: ', response)

//       if (response.status === 200) {
//         toast.success(response.data?.message || 'Updated successfully!')
//         fetchData()
//         setRemarksModalOpen(false)
//         // Reset form and state
//         form.resetFields()
//         setRelieverRequired(false)
//         setSelectedReliever(null)
//         setRelieverDateRange([])
//       }
//     } catch (error) {
//       if (error.errorFields) {
//         console.log('Form validation failed:', error.errorFields)
//         return
//       }
//       console.error('error leave app/rej api: ', error)
//       toast.error('Something went wrong. Please try again.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const resetModalState = () => {
//     setRemarksModalOpen(false)
//     form.resetFields()
//     setRelieverRequired(false)
//     setSelectedReliever(null)
//     setRelieverDateRange([])
//   }

//   const handleRelieverRequiredChange = (e) => {
//     const value = e.target.value
//     setRelieverRequired(value)
//     if (!value) {
//       // Clear reliever fields when not required
//       form.setFieldsValue({
//         selectedReliever: undefined,
//         relieverDateRange: undefined,
//       })
//       setSelectedReliever(null)
//       setRelieverDateRange([])
//     }
//   }

//   return (
//     <>
//       <Pageheading title="Requested Leaves" />

//       <ToastContainer
//         position="top-right"
//         autoClose={1000}
//         hideProgressBar={false}
//         closeOnClick
//         pauseOnHover
//         draggable
//       />

//       <div className="def" style={{ paddingBottom: 10 }}>
//         <div
//           style={{
//             padding: 5,
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//           }}
//         >
//           <RangePicker onChange={onRangeChange} format="DD MMM YYYY" />
//           <Row style={{ gap: 10 }}>
//             <Search
//               placeholder="Search in table..."
//               allowClear
//               style={{ width: 300 }}
//               onChange={onSearchChange}
//             />
//           </Row>
//         </div>
//         <div
//           style={{
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '0.5rem',
//             maxHeight: '70vh',
//             marginTop: '0.8rem',
//             overflow: 'auto',
//             boxShadow: '0 0 2px gray',
//             paddingInline: '0.5rem',
//             paddingBlock: '0.5rem',
//           }}
//         >
//           {filteredData.length > 0 ? (
//             filteredData.map((dt, idx) => (
//               <ManagerEmpLeaveCard
//                 key={idx}
//                 empName={dt?.empName}
//                 empCode={dt?.empCode}
//                 empLeaveType={dt?.empLeaveType}
//                 empLeaveStartDate={dt?.empLeaveStartDate}
//                 empLeaveEndDate={dt?.empLeaveEndDate}
//                 leaveDayType={dt?.leaveDayType}
//                 noOfDays={dt?.noOfDays}
//                 reason={dt?.reason}
//                 remarks={dt?.remarks}
//                 appliedOn={dt?.appliedOn}
//                 storeCodeName={dt?.storeCodeName}
//                 locId={dt?.locId}
//                 setStore={setStore}
//                 remarksModalOpen={remarksModalOpen}
//                 setRemarksModalOpen={setRemarksModalOpen}
//                 idx={idx}
//                 requestId={dt?.requestId}
//                 setRequestId={setRequestId}
//                 setActionType={setActionType}
//                 setSelectedCandidateId={setSelectedCandidateId}
//                 setStDate={setStDate}
//                 setEdDate={setEdDate}
//                 setLocationId={setLocationId}
//               />
//             ))
//           ) : (
//             <div style={{ textAlign: 'center' }}>No Data</div>
//           )}
//         </div>
//       </div>

//       <Modal
//         title={
//           <div
//             style={{
//               fontSize: '18px',
//               fontWeight: '600',
//               color: '#1f2937',
//               marginBottom: '8px',
//             }}
//           >
//             Leave Request Action
//           </div>
//         }
//         open={remarksModalOpen}
//         onCancel={resetModalState}
//         width={600}
//         style={{ top: 50 }}
//         footer={[
//           <Button
//             key="cancel"
//             size="middle"
//             onClick={resetModalState}
//             style={{
//               borderRadius: '6px',
//             }}
//           >
//             Cancel
//           </Button>,
//           <Button
//             key="ok"
//             type="primary"
//             size="middle"
//             disabled={loading}
//             onClick={handleApproveRejectRequest}
//             style={{
//               borderRadius: '6px',
//               background: '#1890ff',
//             }}
//           >
//             {loading ? 'Processing...' : 'Submit'}
//           </Button>,
//         ]}
//       >
//         <Form form={form} layout="vertical">
//           <div>
//             {/* base location */}
//             {actionType === 1 && (
//               <div style={{ marginBottom: '5px' }}>
//                 <strong>Location:</strong> {store}
//               </div>
//             )}

//             {/* Reliever Section */}
//             {actionType === 1 && (
//               <Card
//                 size="small"
//                 style={{
//                   marginBottom: '20px',
//                   borderRadius: '8px',
//                   boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
//                 }}
//               >
//                 <div style={{ marginBottom: '16px' }}>
//                   <div
//                     style={{
//                       fontSize: '16px',
//                       fontWeight: '600',
//                       color: '#374151',
//                       marginBottom: '12px',
//                     }}
//                   >
//                     Reliever Assignment
//                   </div>

//                   <div
//                     style={{
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '12px',
//                       flexWrap: 'wrap',
//                     }}
//                   >
//                     <span
//                       style={{
//                         fontWeight: '500',
//                         color: '#6b7280',
//                         minWidth: '70px',
//                       }}
//                     >
//                       Status:
//                     </span>
//                     <Form.Item
//                       name="relieverRequired"
//                       rules={[{ required: true, message: 'Please select reliever status' }]}
//                       style={{ margin: 0, flex: 1 }}
//                     >
//                       <Radio.Group
//                         options={options}
//                         value={relieverRequired}
//                         onChange={handleRelieverRequiredChange}
//                         optionType="button"
//                         buttonStyle="solid"
//                         size="middle"
//                         style={{ flex: 1 }}
//                       />
//                     </Form.Item>
//                   </div>
//                 </div>

//                 {relieverRequired && (
//                   <div
//                     style={{
//                       marginTop: '16px',
//                       padding: '16px',
//                       backgroundColor: '#f8fafc',
//                       borderRadius: '6px',
//                       border: '1px solid #e2e8f0',
//                     }}
//                   >
//                     <div
//                       style={{
//                         display: 'flex',
//                         flexDirection: 'column',
//                         gap: '10px',
//                       }}
//                     >
//                       {/* Employee Selection */}
//                       <Form.Item
//                         label="Select Employee"
//                         name="selectedReliever"
//                         rules={[{ required: true, message: 'Please select a reliever employee' }]}
//                         style={{ margin: 0 }}
//                       >
//                         <Select
//                           showSearch
//                           style={{ minWidth: 320 }}
//                           placeholder="Select Employee"
//                           onSearch={setSearchText}
//                           filterOption={false}
//                           allowClear
//                           loading={loading || searchLoading}
//                           notFoundContent={
//                             searchLoading ? <Spin size="small" /> : 'No employees found'
//                           }
//                         >
//                           {!searchLoading
//                             ? employees.map((emp) => (
//                                 <Select.Option key={emp?.employeeId} value={emp?.employeeId}>
//                                   {`${emp.ecode} - ${emp.fullName}`}
//                                 </Select.Option>
//                               ))
//                             : [
//                                 <div key="spinner" style={{ textAlign: 'center' }}>
//                                   <Spin size="small" />
//                                 </div>,
//                               ]}
//                         </Select>
//                       </Form.Item>

//                       {/* Date Range Selection */}
//                       <Form.Item
//                         label="Reliever Period"
//                         name="relieverDateRange"
//                         style={{ margin: 0 }}
//                         initialValue={[dayjs(stDate), dayjs(edDate)]}
//                       >
//                         <RangePicker
//                           style={{ width: '100%' }}
//                           size="middle"
//                           format="DD MMM YYYY"
//                           onChange={handleRelieverDateChange}
//                           disabled
//                           placeholder={['Start Date', 'End Date']}
//                         />
//                       </Form.Item>

//                       {/* Role Selection (Readonly) */}
//                       <Form.Item
//                         label="Reason"
//                         name="relieverRole"
//                         initialValue={relieverRole}
//                         style={{ margin: 0 }}
//                       >
//                         <Select
//                           style={{ width: '100%' }}
//                           size="middle"
//                           disabled
//                           options={[{ value: 'reliever', label: 'Reliever' }]}
//                         />
//                       </Form.Item>
//                     </div>
//                   </div>
//                 )}
//               </Card>
//             )}

//             {/* Remarks Section */}
//             <Form.Item
//               label="Remarks"
//               name="remarks"
//               rules={[{ required: true, message: 'Please enter remarks' }]}
//               style={{ margin: 0 }}
//             >
//               <TextArea
//                 rows={4}
//                 placeholder="Enter your remarks for this leave request..."
//                 style={{
//                   borderRadius: '6px',
//                   fontSize: '14px',
//                   resize: 'vertical',
//                 }}
//               />
//             </Form.Item>
//             {/* </Card> */}
//           </div>
//         </Form>
//       </Modal>
//     </>
//   )
// }

// export default ManagerEmpLeaveList


import React, { useEffect, useState } from 'react'
import {
  Row,
  Col,
  Input,
  Button,
  Modal,
  DatePicker,
  Radio,
  Select,
  Card,
  Form,
  Spin,
  Grid,
  Space,
} from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { toast, ToastContainer } from 'react-toastify'
import ManagerEmpLeaveCard from '../../../components/ManagerEmpLeaveCard'
import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import Pageheading from '../../../components/shared/Pageheading'
import axiosInstance from '../../../services/axiosInstance'
import { useSelector } from 'react-redux'
import { searchEmployeeDropdown } from '../../../services/Services'

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
const { Search } = Input
const { RangePicker } = DatePicker
const { useBreakpoint } = Grid

const ManagerEmpLeaveList = () => {
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [remarksModalOpen, setRemarksModalOpen] = useState(false)
  const [remarks, setRemarks] = useState({})
  const [actionType, setActionType] = useState()
  const [selectedCandidateId, setSelectedCandidateId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [leaveData, setLeaveData] = useState([])
  const [filteredData, setFilteredData] = useState(leaveData)
  const [selectedRange, setSelectedRange] = useState([])
  const [requestId, setRequestId] = useState('')
  const [relieverRequired, setRelieverRequired] = useState(false)
  const [selectedReliever, setSelectedReliever] = useState(null)
  const [relieverDateRange, setRelieverDateRange] = useState([])
  const [relieverRole] = useState('reliever') // readonly
  const [searchLoading, setsearchLoading] = useState(false)
  const [employees, setEmployees] = useState([])
  const [searchText, setSearchText] = useState('')
  const [store, setStore] = useState('')
  const [stDate, setStDate] = useState(null)
  const [edDate, setEdDate] = useState(null)
  const [locationId, setLocationId] = useState(null)

  const { employeeId } = useSelector((state) => state?.auth?.data)

  const options = [
    { label: 'Required', value: true },
    { label: 'Not Required', value: false },
  ]

  // 🔎 Employee search (debounced)
  useEffect(() => {
    if (searchText.length >= 2) {
      setsearchLoading(true)
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

  const handleRelieverDateChange = (dates) => {
    setRelieverDateRange(dates || [])
  }

  const applyFilters = (dates, search) => {
    const filtered = leaveData.filter((item) => {
      let dateMatch = true
      let searchMatch = true

      // Date filter
      if (dates && dates.length === 2) {
        const [startDate, endDate] = dates
        const itemStart = item.empLeaveStartDate
          ? dayjs(item.empLeaveStartDate, 'YYYY-MM-DD')
          : null
        const itemEnd = item.empLeaveEndDate ? dayjs(item.empLeaveEndDate, 'YYYY-MM-DD') : null

        const actualEnd = itemEnd && itemEnd.isValid() ? itemEnd : itemStart

        if (!itemStart || !itemStart.isValid()) {
          dateMatch = false
        } else {
          dateMatch =
            itemStart.isSameOrAfter(startDate, 'day') && actualEnd.isSameOrBefore(endDate, 'day')
        }
      }

      // Search filter
      if (search && search.trim() !== '') {
        searchMatch = Object.keys(item).some((key) => {
          let value = item[key]
          if (typeof value !== 'string') value = String(value ?? '')
          return value.toLowerCase().includes(search.toLowerCase())
        })
      }

      return dateMatch && searchMatch
    })

    setFilteredData(filtered)
  }

  useEffect(() => {
    applyFilters()
  }, [leaveData])

  const onRangeChange = (dates) => {
    setSelectedRange(dates || [])
    applyFilters(dates, searchTerm)
  }

  const onSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    applyFilters(selectedRange, value)
  }

  const handleRemarksChange = (e) => {
    setRemarks((prev) => ({
      ...prev,
      [parseInt(selectedCandidateId)]: e.target.value,
    }))
  }

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/Leave/LeaveRequestsformanager?statusId=${4}&pageNumber=1&pageSize=10000`,
      )
      if (response.status === 200) {
        const data = response.data?.data || []
        const formatted_data =
          Array.isArray(data) &&
          data.map((dt) => ({
            empName: dt?.employeeName,
            empCode: dt?.ecode,
            empLeaveType: dt?.leaveTypeName,
            empLeaveStartDate: dt?.startDate === null ? null : dt?.startDate?.split('T')[0],
            empLeaveEndDate: dt?.endDate === null ? null : dt?.endDate?.split('T')[0],
            reason: dt?.reason,
            appliedOn: dt?.createdOn === null ? null : dt?.createdOn?.split('T')[0],
            requestId: dt?.leaveRequestId,
            storeCodeName: `${dt?.stCode} - ${dt?.locationName}`,
            locId: dt?.locationId,
            leaveDayType: dt?.firstHalf
              ? 'First Half'
              : dt?.secondHalf
                ? 'Second Half'
                : dt?.fullDay
                  ? 'Full Day'
                  : '-',
          }))
        setLeaveData(formatted_data)
      }
    } catch (error) {
      console.error('api error: ', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleApproveRejectRequest = async () => {
    try {
      const values = await form.validateFields()
      const body1 = {
        statusId: actionType,
        remarks: values?.remarks,
      }
      const body2 = {
        statusId: actionType,
        remarks: values?.remarks,
        relieverEmployeeId: values?.selectedReliever,
        assignLocations: [
          {
            candidateId: values?.selectedReliever,
            assignedLocation: locationId,
            assignedReason: 'Reliever',
            isActive: true,
            assignedOnDate: stDate,
            releasedOnDate: edDate,
          },
        ],
      }

      setLoading(true)
      const response = await axiosInstance.post(
        `/api/Leave/UpdateLeaveRequestStatus/${parseInt(requestId)}`,
        actionType === 1 ? body2 : actionType === 2 ? body1 : null,
      )

      if (response.status === 200) {
        toast.success(response.data?.message || 'Updated successfully!')
        fetchData()
        setRemarksModalOpen(false)
        form.resetFields()
        setRelieverRequired(false)
        setSelectedReliever(null)
        setRelieverDateRange([])
      }
    } catch (error) {
      if (error.errorFields) return
      console.error('error leave app/rej api: ', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetModalState = () => {
    setRemarksModalOpen(false)
    form.resetFields()
    setRelieverRequired(false)
    setSelectedReliever(null)
    setRelieverDateRange([])
  }

  const handleRelieverRequiredChange = (e) => {
    const value = e.target.value
    setRelieverRequired(value)
    if (!value) {
      form.setFieldsValue({
        selectedReliever: undefined,
        relieverDateRange: undefined,
      })
      setSelectedReliever(null)
      setRelieverDateRange([])
    }
  }

  return (
    <>
      <Pageheading title="Requested Leaves" />

      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      {/* Toolbar - responsive */}
      <div style={{ paddingBottom: 10 }}>
        <Row gutter={[12, 12]} align="middle" justify="space-between" style={{ marginBottom: 8 }}>
          <Col xs={24} md={12}>
            <RangePicker
              onChange={onRangeChange}
              format="DD MMM YYYY"
              style={{ width: '100%' }}
              size={isMobile ? 'middle' : 'large'}
            />
          </Col>

          <Col xs={24} md={12}>
            <Search
              placeholder="Search in list..."
              allowClear
              onChange={onSearchChange}
              style={{ width: '100%' }}
              size={isMobile ? 'middle' : 'large'}
            />
          </Col>
        </Row>
      </div>

      {/* Cards list container - responsive height/scroll */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          height: isMobile ? 'auto' : 'calc(100vh - 260px)',
          maxHeight: isMobile ? 'none' : 'calc(100vh - 260px)',
          marginTop: '0.8rem',
          overflowY: isMobile ? 'visible' : 'auto',
          boxShadow: '0 0 2px rgba(0,0,0,0.2)',
          padding: isMobile ? '0.5rem 0' : '0.5rem',
          borderRadius: 8,
          background: '#fff',
        }}
      >
        {filteredData.length > 0 ? (
          <Row gutter={[12, 12]}>
            {filteredData.map((dt, idx) => (
              <Col key={idx} xs={24} sm={24} md={24} lg={24}>
                <ManagerEmpLeaveCard
                  empName={dt?.empName}
                  empCode={dt?.empCode}
                  empLeaveType={dt?.empLeaveType}
                  empLeaveStartDate={dt?.empLeaveStartDate}
                  empLeaveEndDate={dt?.empLeaveEndDate}
                  leaveDayType={dt?.leaveDayType}
                  noOfDays={dt?.noOfDays}
                  reason={dt?.reason}
                  remarks={dt?.remarks}
                  appliedOn={dt?.appliedOn}
                  storeCodeName={dt?.storeCodeName}
                  locId={dt?.locId}
                  setStore={setStore}
                  remarksModalOpen={remarksModalOpen}
                  setRemarksModalOpen={setRemarksModalOpen}
                  idx={idx}
                  requestId={dt?.requestId}
                  setRequestId={setRequestId}
                  setActionType={setActionType}
                  setSelectedCandidateId={setSelectedCandidateId}
                  setStDate={setStDate}
                  setEdDate={setEdDate}
                  setLocationId={setLocationId}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem' }}>No Data</div>
        )}
      </div>

      {/* Action Modal - responsive width */}
      <Modal
        title={
          <div
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#1f2937',
              marginBottom: 8,
            }}
          >
            Leave Request Action
          </div>
        }
        open={remarksModalOpen}
        onCancel={resetModalState}
        width={isMobile ? '95%' : 600}
        style={{ top: isMobile ? 16 : 50 }}
        footer={[
          <Button key="cancel" size="middle" onClick={resetModalState} style={{ borderRadius: 6 }}>
            Cancel
          </Button>,
          <Button
            key="ok"
            type="primary"
            size="middle"
            disabled={loading}
            onClick={handleApproveRejectRequest}
            style={{ borderRadius: 6, background: '#1890ff' }}
            block={isMobile}
          >
            {loading ? 'Processing...' : 'Submit'}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          {/* Location (approve only) */}
          {actionType === 1 && (
            <div style={{ marginBottom: 8 }}>
              <strong>Location:</strong> {store}
            </div>
          )}

          {/* Reliever Section (approve only) */}
          {actionType === 1 && (
            <Card
              size="small"
              style={{
                marginBottom: 20,
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
              bodyStyle={{ padding: 12 }}
            >
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: 10,
                  }}
                >
                  Reliever Assignment
                </div>

                <Row gutter={[8, 8]} align="middle">
                  <Col xs={24} sm={8}>
                    <span style={{ fontWeight: 500, color: '#6b7280' }}>Status:</span>
                  </Col>
                  <Col xs={24} sm={16}>
                    <Form.Item
                      name="relieverRequired"
                      rules={[{ required: true, message: 'Please select reliever status' }]}
                      style={{ margin: 0 }}
                    >
                      <Radio.Group
                        options={options}
                        value={relieverRequired}
                        onChange={handleRelieverRequiredChange}
                        optionType="button"
                        buttonStyle="solid"
                        size="middle"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {relieverRequired && (
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <Form.Item
                    label="Select Employee"
                    name="selectedReliever"
                    rules={[{ required: true, message: 'Please select a reliever employee' }]}
                    style={{ margin: 0 }}
                  >
                    <Select
                      showSearch
                      style={{ width: '100%' }}
                      placeholder="Select Employee"
                      onSearch={setSearchText}
                      filterOption={false}
                      allowClear
                      loading={loading || searchLoading}
                      notFoundContent={searchLoading ? <Spin size="small" /> : 'No employees found'}
                    >
                      {!searchLoading
                        ? employees.map((emp) => (
                            <Select.Option key={emp?.employeeId} value={emp?.employeeId}>
                              {`${emp.ecode} - ${emp.fullName}`}
                            </Select.Option>
                          ))
                        : [
                            <div key="spinner" style={{ textAlign: 'center' }}>
                              <Spin size="small" />
                            </div>,
                          ]}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="Reliever Period"
                    name="relieverDateRange"
                    style={{ margin: 0 }}
                    initialValue={[dayjs(stDate), dayjs(edDate)]}
                  >
                    <RangePicker
                      style={{ width: '100%' }}
                      size="middle"
                      format="DD MMM YYYY"
                      onChange={handleRelieverDateChange}
                      disabled
                      placeholder={['Start Date', 'End Date']}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Reason"
                    name="relieverRole"
                    initialValue={relieverRole}
                    style={{ margin: 0 }}
                  >
                    <Select
                      style={{ width: '100%' }}
                      size="middle"
                      disabled
                      options={[{ value: 'reliever', label: 'Reliever' }]}
                    />
                  </Form.Item>
                </Space>
              )}
            </Card>
          )}

          {/* Remarks */}
          <Form.Item
            label="Remarks"
            name="remarks"
            rules={[{ required: true, message: 'Please enter remarks' }]}
            style={{ margin: 0 }}
          >
            <TextArea
              rows={4}
              placeholder="Enter your remarks for this leave request..."
              style={{ borderRadius: 6, fontSize: 14, resize: 'vertical' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default ManagerEmpLeaveList
