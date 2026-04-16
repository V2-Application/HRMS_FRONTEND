// import React, { useEffect, useState } from 'react'
// import {
//   Modal,
//   Button,
//   DatePicker,
//   TimePicker,
//   Select,
//   Input,
//   Form,
//   Upload,
//   message,
//   Row,
//   Col,
//   Spin,
// } from 'antd'
// import { UploadOutlined } from '@ant-design/icons'
// import dayjs from 'dayjs'
// import {
//   getDesignations,
//   insertScheduleInterviewData,
//   interViewSchedule,
//   searchEmployeeDropdown,
// } from '../../services/Services'
// import { useSelector } from 'react-redux'
// import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
// import utc from 'dayjs/plugin/utc'

// dayjs.extend(utc)
// dayjs.extend(isSameOrBefore)

// const { TextArea } = Input

// const interviewers = [
//   { label: 'John Doe', value: 'john' },
//   { label: 'Jane Smith', value: 'jane' },
//   { label: 'Rahul Verma', value: 'rahul' },
//   { label: 'Sara Khan', value: 'sara' },
// ]

// const InterviewScheduleModal = ({
//   initiateModalOpen,
//   setInitiateModalOpen,
//   firstname,
//   currentRecord, // Added to receive the current record
//   ApplicationListData,
//   ...props
// }) => {
//   const [visible, setVisible] = useState(false)
//   const [form] = Form.useForm()
//   const [mode, setMode] = useState('In-Person')
//   const [selectedEmpCode, setSelectedEmpCode] = useState([])
//   const [searchText, setSearchText] = useState('')
//   const { loading } = useSelector((state) => state.ui)
//   const [searchLoading, setsearchLoading] = useState(false)
//   const [employees, setEmployees] = useState([])
//   const [designations, setDesignations] = useState([])
//   const [selectedDesignation, setSelectedDesignation] = useState(null)
//   const [modalFirstName, setmodalFirstName] = useState('')
//   const [modalCurrentRound, setmodalCurrentRound] = useState([])
//   const watch_interviewMode = Form.useWatch(['interviewMode'], form)
//   const lastInterviewDateTime = currentRecord?.lastInterviewDateTime || null
//   const lastInterviewMoment = lastInterviewDateTime ? dayjs(lastInterviewDateTime) : null

//   const fetchDesignations = async () => {
//     try {
//       const response = await getDesignations()
//       if (response.status === 200) {
//         const data = response.data?.data || []
//         setDesignations(data)
//       }
//     } catch (error) {
//       console.error('designation err:', error)
//       message.error(error?.response?.data?.message || 'Error fetching designations')
//     }
//   }

//   useEffect(() => {
//     fetchDesignations()
//   }, [])

//   const fetchEmployeeData = async (designation) => {
//     try {
//       const designationToUse = designation ?? selectedDesignation
//       let res

//       designationToUse
//         ? (res = await searchEmployeeDropdown(searchText, designationToUse))
//         : (res = await searchEmployeeDropdown(searchText))
//       // const res = await searchEmployeeDropdown(searchText, designation)
//       if (res?.data?.employees?.length > 0) {
//         setEmployees(res.data.employees)
//       } else {
//         setEmployees([])
//       }
//     } catch (error) {
//       console.error('Error fetching employee attendance:', error)
//       setEmployees([])
//     } finally {
//       setsearchLoading(false)
//     }
//   }

//   // Debounced employee search
//   useEffect(() => {
//     if (searchText.length >= 2) {
//       setsearchLoading(true)
//       const debounceTimer = setTimeout(() => {
//         fetchEmployeeData(selectedDesignation)
//       }, 800)

//       return () => clearTimeout(debounceTimer)
//     }
//   }, [searchText, selectedDesignation])

//   useEffect(() => {
//     const scheduleRound = currentRecord?.currentRound || 0
//     form.setFieldsValue({
//       candidateName: firstname,
//       interviewMode: 'In-Person',
//       round: scheduleRound + 1,
//     })
//   }, [currentRecord, form])

//   const handleOk = async () => {
//     try {
//       const values = await form.validateFields()

//       // console.log('schchedule values ->', values);
//       const payload = {
//         ...values,
//         applicantId: currentRecord?.id || null,
//         interviewDateTime: dayjs(values.interviewDateTime).format('YYYY-MM-DD HH:mm:ss'),
//       }

//       // console.log('schchedule payload ->', payload);

//       const response = await insertScheduleInterviewData(payload)
//       await ApplicationListData()
//       message.success('Interview scheduled successfully!')
//       setVisible(false)
//       form.resetFields()
//       setInitiateModalOpen(false)
//     } catch (error) {
//       //Handle validation or API errors here
//       console.error('Validation or scheduling failed:', error)
//     }
//   }

//   // const handleDesignationChange = (val) => {
//   //   const value = val || null
//   //   setSelectedDesignation(value)
//   //   setSelectedEmpCode([])
//   //   fetchEmployeeData(value)

//   //   // if user has already typed something, refetch with new designation
//   //   if (searchText.length > 2) {
//   //     setsearchLoading(true)
//   //     fetchEmployeeData()
//   //   }
//   // }

//   const handleDesignationChange = (val) => {
//     const value = val || null // undefined / '' -> null

//     // 1) store designation (or null on allowClear)
//     setSelectedDesignation(value)

//     // 2) clear selected interviewers
//     setSelectedEmpCode([])
//     form.setFieldsValue({ interviewers: [] })

//     // 3) optional: clear previous employee list
//     setEmployees([])

//     // 4) if user already typed something, refetch employees with new designation
//     if (searchText.length >= 2) {
//       setsearchLoading(true)
//       fetchEmployeeData(value)
//     }
//   }

//   return (
//     <>
//       <Modal
//         title="Schedule Interview"
//         open={initiateModalOpen}
//         onOk={handleOk}
//         centered
//         onCancel={() => {
//           setInitiateModalOpen(false)
//         }}
//         okText="Schedule"
//         confirmLoading={loading}
//       >
//         <Form layout="vertical" form={form}>
//           <Form.Item
//             name="candidateName"
//             label="Candidate Name"
//             rules={[{ required: true, message: 'Please enter candidate name' }]}
//           >
//             <Input placeholder="Enter candidate name" readOnly />
//           </Form.Item>

//           <Row gutter={16}>
//             <Col span={12}>
//               {/* <Form.Item
//                 name="interviewDateTime"
//                 label="Interview Date"
//                 rules={[{ required: true, message: 'Please pick a date' }]}
//               >
//                 <DatePicker
//                   style={{ width: '100%' }}
//                   disabledDate={(d) => d && d < dayjs().startOf('day')}
//                   showTime={{ format: 'hh:mm A', use12Hours: true }}
//                   format="YYYY-MM-DD hh:mm A"
//                 />
//               </Form.Item> */}
//               <Form.Item
//                 name="interviewDateTime"
//                 label="Interview Date"
//                 rules={[{ required: true, message: 'Please pick a date' }]}
//               >
//                 <DatePicker
//                   style={{ width: '100%' }}
//                   showTime={{ format: 'hh:mm A', use12Hours: true }}
//                   format="YYYY-MM-DD hh:mm A"
//                   // disabledDate={(current) => {
//                   //   const today = dayjs().startOf('day');

//                   //   if (!current) return true;

//                   //   const currentDayjs = dayjs(current);

//                   //   // Disable today and past
//                   //   if (currentDayjs.isBefore(today, 'day')) return true;

//                   //   // Disable date if it's same or before lastInterviewDate
//                   //   if (lastInterviewMoment) {
//                   //     return currentDayjs.isSameOrBefore(lastInterviewMoment, 'day');
//                   //   }

//                   //   return false;
//                   // }}
//                   disabledDate={(current) => {
//                     const today = dayjs().startOf('day')

//                     if (!current) return true

//                     const currentDayjs = dayjs(current)

//                     // Disable today and past
//                     if (currentDayjs.isBefore(today, 'day')) return true

//                     // Disable date if it's before lastInterviewDate
//                     if (lastInterviewMoment) {
//                       return currentDayjs.isBefore(lastInterviewMoment, 'day')
//                     }

//                     return false
//                   }}
//                   disabledTime={() => ({})}
//                 />
//               </Form.Item>
//             </Col>

//             <Col span={12}>
//               <Form.Item
//                 name="round"
//                 label="Scheduling Round"
//                 rules={[{ required: true, message: 'Please select interview mode' }]}
//               >
//                 {/* <Select
//                   options={[
//                     { label: 'round1', value: 1 },
//                     { label: 'round2', value: 2 },
//                     { label: 'round3', value: 3 },
//                     { label: 'round4', value: 4 },
//                     { label: 'round5', value: 5 },
//                     { label: 'round6', value: 6 },
//                   ]}
//                   onChange={setMode}
//                 /> */}
//                 <Input prefix="Round" readOnly />
//               </Form.Item>
//             </Col>
//           </Row>

//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item
//                 name="interviewMode"
//                 label="Interview Mode"
//                 rules={[{ required: true, message: 'Please select interview mode' }]}
//               >
//                 <Select
//                   options={[
//                     { label: 'In-Person', value: 'In-Person' },
//                     { label: 'Online', value: 'Online' },
//                     { label: 'Telephonic', value: 'Phone' },
//                   ]}
//                   // onChange={setMode}
//                 />
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               {watch_interviewMode === 'In-Person' && (
//                 <Form.Item
//                   name="interviewLocation"
//                   label="Interview At"
//                   rules={[{ required: true, message: 'Please provide link/contact' }]}
//                 >
//                   <Input placeholder="Interview Medium" />
//                 </Form.Item>
//               )}
//               {watch_interviewMode === 'Online' && (
//                 <Form.Item
//                   name="interviewLocation"
//                   label="Interview Link"
//                   rules={[{ required: true, message: 'Please provide link/contact' }]}
//                 >
//                   <Input placeholder="Interview Medium" />
//                 </Form.Item>
//               )}
//               {watch_interviewMode === 'Phone' && (
//                 <Form.Item
//                   name="interviewLocation"
//                   label="Phone Number"
//                   rules={[{ required: true, message: 'Please provide link/contact' }]}
//                 >
//                   <Input placeholder="Interview Medium" prefix="+91" />
//                 </Form.Item>
//               )}

//               {/* {mode === 'In-Person' && (
//                 <Form.Item
//                   name="interviewLocation"
//                   label="Interview Location"
//                   rules={[{ required: true, message: 'Please enter location' }]}
//                 >
//                   <Input placeholder="Office address or venue" />
//                 </Form.Item>
//               )} */}
//             </Col>
//           </Row>

//           <Form.Item name="designation" label="Select designation">
//             <Select
//               showSearch
//               style={{ minWidth: 320 }}
//               placeholder="Search designation"
//               onChange={(val) => handleDesignationChange(val)}
//               allowClear
//             >
//               <Select.Option value="">Select from dropdown</Select.Option>
//               {designations.map((des) => {
//                 return (
//                   <Select.Option value={des?.designationName} key={des?.designationId}>
//                     {des?.designationName}
//                   </Select.Option>
//                 )
//               })}
//             </Select>
//           </Form.Item>

//           <Form.Item
//             name="interviewers"
//             label="Select Interviewer(s)"
//             rules={[{ required: true, message: 'Please select interviewers' }]}
//           >
//             <Select
//               mode="multiple"
//               showSearch
//               style={{ minWidth: 320 }}
//               placeholder="Select Employee"
//               value={selectedEmpCode}
//               onChange={setSelectedEmpCode}
//               onSearch={setSearchText}
//               filterOption={false}
//               allowClear
//               loading={loading || searchLoading}
//               notFoundContent={searchLoading ? <Spin size="small" /> : 'Start typing to search...'}
//             >
//               {!searchLoading
//                 ? employees.map((emp) => (
//                     <Select.Option key={emp.ecode} value={emp.employeeId}>
//                       {`${emp.ecode} - ${emp.fullName}`}
//                     </Select.Option>
//                   ))
//                 : [
//                     <div key="spinner" style={{ textAlign: 'center' }}>
//                       <Spin size="small" />
//                     </div>,
//                   ]}
//             </Select>
//           </Form.Item>

//           <Form.Item
//             name="notes"
//             label="Important Notes"
//             rules={[{ required: true, message: 'Please enter notes' }]}
//           >
//             <TextArea placeholder="Any special instructions or focus areas..." rows={3} />
//           </Form.Item>
//         </Form>
//       </Modal>
//     </>
//   )
// }

// export default InterviewScheduleModal



import React, { useEffect, useState } from 'react'
import { Modal, DatePicker, Select, Input, Form, message, Row, Col, Spin } from 'antd'
import dayjs from 'dayjs'
import {
  getDesignations,
  insertScheduleInterviewData,
  interViewSchedule,
  searchEmployeeDropdown,
  // ✅ NEW: make sure this exists in Services.js
  getLocations,
} from '../../services/Services'
import { useSelector } from 'react-redux'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(isSameOrBefore)

const { TextArea } = Input

const InterviewScheduleModal = ({
  initiateModalOpen,
  setInitiateModalOpen,
  firstname,
  currentRecord,
  ApplicationListData,
  ...props
}) => {
  const [form] = Form.useForm()
  const { loading } = useSelector((state) => state.ui)

  const [selectedEmpCode, setSelectedEmpCode] = useState([])
  const [searchText, setSearchText] = useState('')
  const [searchLoading, setsearchLoading] = useState(false)
  const [employees, setEmployees] = useState([])

  const [designations, setDesignations] = useState([])
  const [selectedDesignation, setSelectedDesignation] = useState(null)

  // ✅ NEW: locations state
  const [locations, setLocations] = useState([])

  const watch_interviewMode = Form.useWatch(['interviewMode'], form)
  const lastInterviewDateTime = currentRecord?.lastInterviewDateTime || null
  const lastInterviewMoment = lastInterviewDateTime ? dayjs(lastInterviewDateTime) : null

  // ============= MASTER DATA FETCHES =============

  const fetchDesignations = async () => {
    try {
      const response = await getDesignations()
      if (response.status === 200) {
        const data = response.data?.data || []
        setDesignations(data)
      }
    } catch (error) {
      console.error('designation err:', error)
      message.error(error?.response?.data?.message || 'Error fetching designations')
    }
  }

  // ✅ NEW: fetch locations from /api/DropDown/GetLocation
  const fetchLocations = async () => {
    try {
      const res = await getLocations()
      if (res?.status === 200 || res?.data?.status === true) {
        const apiData = res.data?.data || res.data || []
        setLocations(Array.isArray(apiData) ? apiData : [])
      } else {
        setLocations([])
        message.error(res?.data?.message || 'Error fetching locations')
      }
    } catch (error) {
      console.error('location err:', error)
      setLocations([])
      message.error(error?.response?.data?.message || 'Error fetching locations')
    }
  }

  useEffect(() => {
    fetchDesignations()
    fetchLocations() // ✅ also load locations on mount
  }, [])

  // ============= EMPLOYEE SEARCH =============

  const fetchEmployeeData = async (designation) => {
    try {
      const designationToUse = designation ?? selectedDesignation
      let res

      if (designationToUse) {
        res = await searchEmployeeDropdown(searchText, designationToUse)
      } else {
        res = await searchEmployeeDropdown(searchText)
      }

      if (res?.data?.employees?.length > 0) {
        setEmployees(res.data.employees)
      } else {
        setEmployees([])
      }
    } catch (error) {
      console.error('Error fetching employee attendance:', error)
      setEmployees([])
    } finally {
      setsearchLoading(false)
    }
  }

  // Debounced employee search
  useEffect(() => {
    if (searchText.length >= 2) {
      setsearchLoading(true)
      const debounceTimer = setTimeout(() => {
        fetchEmployeeData(selectedDesignation)
      }, 800)

      return () => clearTimeout(debounceTimer)
    }
  }, [searchText, selectedDesignation])

  useEffect(() => {
    const scheduleRound = currentRecord?.currentRound || 0
    form.setFieldsValue({
      candidateName: firstname,
      interviewMode: 'In-Person',
      round: scheduleRound + 1,
    })
  }, [currentRecord, form, firstname])

  // ============= HANDLERS =============

  const handleOk = async () => {
    try {
      const values = await form.validateFields()

      // values now includes: locationId, candidateName, interviewDateTime, interviewMode,
      // interviewLocation, designation, interviewers, notes, round, etc.
      const payload = {
        ...values,
        applicantId: currentRecord?.id || null,
        interviewDateTime: dayjs(values.interviewDateTime).format('YYYY-MM-DD HH:mm:ss'),
      }

      await insertScheduleInterviewData(payload)
      await ApplicationListData()
      message.success('Interview scheduled successfully!')
      form.resetFields()
      setInitiateModalOpen(false)
    } catch (error) {
      console.error('Validation or scheduling failed:', error)
      if (error?.errorFields) return // form validation error already shown
      message.error(error?.response?.data?.message || 'Failed to schedule interview')
    }
  }

  const handleDesignationChange = (val) => {
    const value = val || null
    setSelectedDesignation(value)
    setSelectedEmpCode([])
    form.setFieldsValue({ interviewers: [] })
    setEmployees([])

    if (searchText.length >= 2) {
      setsearchLoading(true)
      fetchEmployeeData(value)
    }
  }

  return (
    <>
      <Modal
        title="Schedule Interview"
        open={initiateModalOpen}
        onOk={handleOk}
        centered
        onCancel={() => {
          setInitiateModalOpen(false)
        }}
        okText="Schedule"
        confirmLoading={loading}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="candidateName"
            label="Candidate Name"
            rules={[{ required: true, message: 'Please enter candidate name' }]}
          >
            <Input placeholder="Enter candidate name" readOnly />
          </Form.Item>

          {/* ✅ NEW: Location field (required) */}
          <Form.Item
            name="locationId"
            label="Location"
            rules={[{ required: true, message: 'Please select location' }]}
          >
            <Select
              showSearch
              placeholder="Select Location"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase())
              }
            >
              {locations.map((loc) => (
                <Select.Option key={loc.locationId} value={loc.locationId}>
                  {loc.locationName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="interviewDateTime"
                label="Interview Date"
                rules={[{ required: true, message: 'Please pick a date' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  showTime={{ format: 'hh:mm A', use12Hours: true }}
                  format="YYYY-MM-DD hh:mm A"
                  disabledDate={(current) => {
                    const today = dayjs().startOf('day')
                    if (!current) return true
                    const currentDayjs = dayjs(current)
                    if (currentDayjs.isBefore(today, 'day')) return true
                    if (lastInterviewMoment) {
                      return currentDayjs.isBefore(lastInterviewMoment, 'day')
                    }
                    return false
                  }}
                  disabledTime={() => ({})}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="round"
                label="Scheduling Round"
                rules={[{ required: true, message: 'Please select interview mode' }]}
              >
                <Input prefix="Round" readOnly />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="interviewMode"
                label="Interview Mode"
                rules={[{ required: true, message: 'Please select interview mode' }]}
              >
                <Select
                  options={[
                    { label: 'In-Person', value: 'In-Person' },
                    { label: 'Online', value: 'Online' },
                    { label: 'Telephonic', value: 'Phone' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              {watch_interviewMode === 'In-Person' && (
                <Form.Item
                  name="interviewLocation"
                  label="Interview At"
                  rules={[{ required: true, message: 'Please provide location/address' }]}
                >
                  <Input placeholder="Interview location" />
                </Form.Item>
              )}

              {watch_interviewMode === 'Online' && (
                <Form.Item
                  name="interviewLocation"
                  label="Interview Link"
                  rules={[{ required: true, message: 'Please provide meeting link' }]}
                >
                  <Input placeholder="Meeting link" />
                </Form.Item>
              )}

              {watch_interviewMode === 'Phone' && (
                <Form.Item
                  name="interviewLocation"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please provide phone number' }]}
                >
                  <Input placeholder="Phone number" prefix="+91" />
                </Form.Item>
              )}
            </Col>
          </Row>

          <Form.Item name="designation" label="Select designation">
            <Select
              showSearch
              style={{ minWidth: 320 }}
              placeholder="Search designation"
              onChange={handleDesignationChange}
              allowClear
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase())
              }
            >
              <Select.Option value="">Select from dropdown</Select.Option>
              {designations.map((des) => (
                <Select.Option value={des?.designationName} key={des?.designationId}>
                  {des?.designationName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="interviewers"
            label="Select Interviewer(s)"
            rules={[{ required: true, message: 'Please select interviewers' }]}
          >
            <Select
              mode="multiple"
              showSearch
              style={{ minWidth: 320 }}
              placeholder="Select Employee"
              value={selectedEmpCode}
              onChange={setSelectedEmpCode}
              onSearch={setSearchText}
              filterOption={false}
              allowClear
              loading={loading || searchLoading}
              notFoundContent={searchLoading ? <Spin size="small" /> : 'Start typing to search...'}
            >
              {!searchLoading
                ? employees.map((emp) => (
                    <Select.Option key={emp.ecode} value={emp.employeeId}>
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
            name="notes"
            label="Important Notes"
            rules={[{ required: true, message: 'Please enter notes' }]}
          >
            <TextArea placeholder="Any special instructions or focus areas..." rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default InterviewScheduleModal
