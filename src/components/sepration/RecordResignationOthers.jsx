// import {
//   Card,
//   Form,
//   Input,
//   Row,
//   Col,
//   Divider,
//   DatePicker,
//   Select,
//   Button,
//   message,
//   Spin,
//   Grid,
// } from 'antd'
// import dayjs from 'dayjs'
// import { useState, useEffect } from 'react'
// import { useSelector } from 'react-redux'
// import './RecordResignation.css'
// import {
//   getReporteeList,
//   postResignation,
//   resignationTypesList,
//   searchEmployeeDropdown,
// } from '../../services/Services'

// const { Option } = Select

// // Small “label : value” item that wraps well
// const InfoItem = ({ label, children }) => (
//   <div className="rr-info-item">
//     <div className="rr-info-label">{label}</div>
//     <div className="rr-info-value">{children ?? '-'}</div>
//   </div>
// )

// const RecordResignationOthers = () => {
//   const [form] = Form.useForm()
//   const screens = Grid.useBreakpoint()
//   const isMobile = !screens.md
//   const controlSize = isMobile ? 'middle' : 'large'
//   const gutter = isMobile ? [12, 12] : [16, 16]

//   const resignationDate = Form.useWatch('resignationDate', form)
//   const [formValues] = useState({})
//   const [resinationTypelists, setresinationTypelists] = useState([])
//   const { employeeId, role } = useSelector((state) => state.auth.data)
//   const [selectedEmpCode, setSelectedEmpCode] = useState(null)
//   const [searchText, setSearchText] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [searchLoading, setsearchLoading] = useState(false)
//   const [employees, setEmployees] = useState([])
//   const [reporteeList, setreporteeList] = useState([])
//   const [currentPage] = useState(1)
//   const [pageSize] = useState(50)
//   const [selectedObj, setselectedObj] = useState({})
//   const [values] = useState({
//     noticePeriod: 30,
//   })

//   useEffect(() => {
//     const foundEmployee = reporteeList.find((emp) => emp.employeeId === selectedEmpCode)
//     setselectedObj(foundEmployee)
//   }, [selectedEmpCode, reporteeList])

//   useEffect(() => {
//     if (searchText.length >= 2) {
//       setsearchLoading(true)
//       const debounceTimer = setTimeout(() => {
//         ;(async () => {
//           try {
//             const res = await searchEmployeeDropdown(searchText)
//             if (res?.data?.employees?.length > 0) {
//               const emps = res.data.employees
//               setEmployees(emps)
//               setreporteeList(emps)
//             } else {
//               setEmployees([])
//             }
//           } catch {
//             setEmployees([])
//           } finally {
//             setsearchLoading(false)
//           }
//         })()
//       }, 600)
//       return () => clearTimeout(debounceTimer)
//     }
//   }, [searchText])

//   const getResignationType = async () => {
//     try {
//       const [types, reportees] = await Promise.all([
//         resignationTypesList(),
//         getReporteeList(currentPage, pageSize, searchText, employeeId),
//       ])
//       if (reportees?.status === 200) setreporteeList(reportees.data.employees || [])
//       setresinationTypelists(types?.data?.data || [])
//     } catch (error) {
//       console.error('Error in fetching lists ', error)
//     }
//   }

//   useEffect(() => {
//     getResignationType()
//   }, [])

//   const handleFormChange = (_changedValues, allValues) => {
//     const { resignationDate: rd } = allValues
//     if (rd && values.noticePeriod) {
//       const calculatedLastDay = dayjs(rd).add(Number(values.noticePeriod - 1), 'day')
//       form.setFieldsValue({ lastDay: calculatedLastDay })
//     }
//   }

//   const lastDayy =
//     resignationDate && values.noticePeriod
//       ? dayjs(resignationDate)
//           .add(values.noticePeriod - 1, 'day')
//           .format('YYYY-MM-DD')
//       : '-'

//   const handleSubmit = async (vals) => {
//     const val = {
//       ...vals,
//       employeeId,
//       joinDate: vals.joinDate ? dayjs(vals.joinDate).format('YYYY-MM-DD') : null,
//       lastDay: lastDayy !== '-' ? lastDayy : null,
//       remarks: vals.reason,
//       resignationDate: vals.resignationDate
//         ? dayjs(vals.resignationDate).format('YYYY-MM-DD')
//         : null,
//       resignationTypeId: vals.type ?? 1,
//       isApprovedByManager: true,
//     }

//     try {
//       await postResignation(val)
//       form.resetFields()
//       message.success('Form submitted successfully')
//     } catch (error) {
//       console.error('submit error', error)
//       message.error(error?.response?.data?.message || 'Submission failed')
//     }
//   }

//   return (
//     <Card
//       className="record-resignation-card"
//       bodyStyle={{ padding: isMobile ? 12 : 20 }}
//       style={{ margin: isMobile ? 8 : 16 }}
//     >
//       <Form
//         form={form}
//         layout="vertical"
//         onFinish={handleSubmit}
//         initialValues={formValues}
//         onValuesChange={handleFormChange}
//       >
//         <Divider orientation="left" style={{ marginTop: 0, marginBottom: isMobile ? 8 : 12 }}>
//           Resignation (Others)
//         </Divider>

//         {/* SUMMARY (no table → no overlap) */}
//         <Row gutter={gutter}>
//           <Col xs={24} md={12}>
//             <div className="rr-info-grid">
//               <InfoItem label="Employee">
//                 {role === 'SuperAdmin' || role === 'Master' ? (
//                   <Select
//                     showSearch
//                     style={{ width: '100%' }}
//                     placeholder="Employee"
//                     value={selectedEmpCode}
//                     onChange={setSelectedEmpCode}
//                     onSearch={setSearchText}
//                     filterOption={false}
//                     allowClear
//                     loading={loading}
//                     notFoundContent={searchLoading ? <Spin size="small" /> : null}
//                     optionFilterProp="children"
//                     size={controlSize}
//                   >
//                     {employees.map((emp) => (
//                       <Option key={emp.employeeId} value={emp.employeeId}>
//                         {emp.fullName}
//                       </Option>
//                     ))}
//                   </Select>
//                 ) : (
//                   <Select
//                     showSearch
//                     style={{ width: '100%' }}
//                     placeholder="Employee"
//                     value={selectedEmpCode}
//                     onChange={setSelectedEmpCode}
//                     onSearch={setSearchText}
//                     allowClear
//                     loading={loading}
//                     filterOption={(input, option) =>
//                       String(option?.children)?.toLowerCase()?.includes(input.toLowerCase())
//                     }
//                     size={controlSize}
//                   >
//                     {reporteeList.map((emp) => (
//                       <Option key={emp.employeeId} value={emp.employeeId}>
//                         {`${emp.fullName}-${emp.ecode}` }
//                       </Option>
//                     ))}
//                   </Select>
//                 )}
//               </InfoItem>

//               <InfoItem label="Department">{selectedObj?.departmentName || '-'}</InfoItem>

//               <InfoItem label="Reporting Manager">
//                 {selectedObj
//                   ? `${selectedObj?.reportHeadName || '-'} (${selectedObj?.reportHeadEcode || '-'})`
//                   : '-'}
//               </InfoItem>

//               <InfoItem label="Reporting HR">-</InfoItem>
//             </div>
//           </Col>

//           <Col xs={24} md={12}>
//             <div className="rr-info-grid">
//               <InfoItem label="Join Date">
//                 {selectedObj?.dateOfJoining
//                   ? dayjs(selectedObj?.dateOfJoining).format('DD/MM/YYYY')
//                   : '-'}
//               </InfoItem>
//               <InfoItem label="Last Day of Working">{lastDayy}</InfoItem>
//               <InfoItem label="Notice Period (Days)">{values.noticePeriod}</InfoItem>
//             </div>
//           </Col>
//         </Row>

//         {/* FORM CONTROLS */}
//         <Row gutter={gutter} style={{ marginTop: isMobile ? 12 : 20 }}>
//           <Col xs={24} md={12}>
//             <Form.Item
//               label="Reason of Resignation"
//               name="type"
//               rules={[{ required: true, message: 'Please select type' }]}
//               style={{ marginBottom: isMobile ? 12 : 16 }}
//             >
//               <Select
//                 placeholder="Select Resignation Type"
//                 style={{ width: '100%' }}
//                 size={controlSize}
//               >
//                 {resinationTypelists?.map((val) => (
//                   <Option key={val.resignationTypeId} value={val.resignationTypeId}>
//                     {val.resignationTypeName}
//                   </Option>
//                 ))}
//               </Select>
//             </Form.Item>
//           </Col>

//           <Col xs={24} md={12}>
//             <Form.Item
//               label="Requested Relieving Date"
//               name="resignationDate"
//               getValueProps={(value) => ({ value: value ? dayjs(value) : null })}
//               style={{ marginBottom: isMobile ? 12 : 16 }}
//             >
//               <DatePicker style={{ width: '100%' }} placeholder="Select date" size={controlSize} />
//             </Form.Item>
//           </Col>
//         </Row>

//         <Row gutter={gutter}>
//           <Col span={24}>
//             <Form.Item label="Comments" name="reason">
//               <Input.TextArea
//                 rows={isMobile ? 4 : 5}
//                 placeholder="Write reason..."
//                 maxLength={200}
//                 showCount
//                 style={{ width: '100%' }}
//               />
//             </Form.Item>
//           </Col>
//         </Row>

//         <Form.Item
//           style={{ textAlign: isMobile ? 'stretch' : 'end', marginTop: isMobile ? 8 : 16 }}
//         >
//           <Button type="primary" htmlType="submit" size={controlSize} block={isMobile}>
//             Submit
//           </Button>
//         </Form.Item>
//       </Form>
//     </Card>
//   )
// }

// export default RecordResignationOthers


import {
  Card,
  Form,
  Input,
  Row,
  Col,
  Divider,
  DatePicker,
  Select,
  Button,
  message,
  Spin,
  Grid,
} from 'antd'
import dayjs from 'dayjs'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import './RecordResignation.css'
import { getReporteeList, postResignation, resignationTypesList } from '../../services/Services'

const { Option } = Select

// Small “label : value” item that wraps well
const InfoItem = ({ label, children }) => (
  <div className="rr-info-item">
    <div className="rr-info-label">{label}</div>
    <div className="rr-info-value">{children ?? '-'}</div>
  </div>
)

const RecordResignationOthers = () => {
  const [form] = Form.useForm()
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const controlSize = isMobile ? 'middle' : 'large'
  const gutter = isMobile ? [12, 12] : [16, 16]

  const resignationDate = Form.useWatch('resignationDate', form)

  const [formValues] = useState({})
  const [resinationTypelists, setresinationTypelists] = useState([])

  const { employeeId } = useSelector((state) => state.auth.data)

  const [selectedEmpCode, setSelectedEmpCode] = useState(null)
  const [searchText, setSearchText] = useState('')

  const [loading, setLoading] = useState(false) // initial loads
  const [searchLoading, setsearchLoading] = useState(false) // dropdown search
  const [reporteeList, setreporteeList] = useState([])
  const [selectedObj, setselectedObj] = useState({})

  const [currentPage] = useState(1)
  const [pageSize] = useState(50)

  const [values] = useState({
    noticePeriod: 30,
  })

  // Keep selected employee object in sync
  useEffect(() => {
    const foundEmployee = reporteeList.find((emp) => emp.employeeId === selectedEmpCode)
    setselectedObj(foundEmployee || {})
  }, [selectedEmpCode, reporteeList])

  // Initial load: resignation types + initial team list (no search)
  const getInitialData = async () => {
    try {
      setLoading(true)
      const [types, reportees] = await Promise.all([
        resignationTypesList(),
        getReporteeList(currentPage, pageSize, '', employeeId),
      ])

      setresinationTypelists(types?.data?.data || [])
      if (reportees?.status === 200) setreporteeList(reportees.data.employees || [])
      else setreporteeList([])
    } catch (error) {
      console.error('Error in fetching lists ', error)
      setreporteeList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Team-only search (debounced): uses getReporteeList instead of global searchEmployeeDropdown
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      try {
        setsearchLoading(true)
        const reportees = await getReporteeList(currentPage, pageSize, searchText, employeeId)
        if (reportees?.status === 200) setreporteeList(reportees.data.employees || [])
        else setreporteeList([])
      } catch (e) {
        console.error('Team search failed', e)
        setreporteeList([])
      } finally {
        setsearchLoading(false)
      }
    }, 600)

    return () => clearTimeout(debounceTimer)
  }, [searchText, employeeId, currentPage, pageSize])

  const handleFormChange = (_changedValues, allValues) => {
    const { resignationDate: rd } = allValues
    if (rd && values.noticePeriod) {
      const calculatedLastDay = dayjs(rd).add(Number(values.noticePeriod - 1), 'day')
      form.setFieldsValue({ lastDay: calculatedLastDay })
    }
  }

  const lastDayy =
    resignationDate && values.noticePeriod
      ? dayjs(resignationDate).add(values.noticePeriod - 1, 'day').format('YYYY-MM-DD')
      : '-'

  const handleSubmit = async (vals) => {
    const payload = {
      ...vals,
      employeeId, // NOTE: if resignation is for selectedEmpCode, change this to selectedEmpCode
      joinDate: vals.joinDate ? dayjs(vals.joinDate).format('YYYY-MM-DD') : null,
      lastDay: lastDayy !== '-' ? lastDayy : null,
      remarks: vals.reason,
      resignationDate: vals.resignationDate ? dayjs(vals.resignationDate).format('YYYY-MM-DD') : null,
      resignationTypeId: vals.type ?? 1,
      isApprovedByManager: true,
    }

    try {
      setLoading(true)
      await postResignation(payload)
      form.resetFields()
      setSelectedEmpCode(null)
      message.success('Form submitted successfully')
    } catch (error) {
      console.error('submit error', error)
      message.error(error?.response?.data?.message || 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      className="record-resignation-card"
      bodyStyle={{ padding: isMobile ? 12 : 20 }}
      style={{ margin: isMobile ? 8 : 16 }}
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={formValues}
          onValuesChange={handleFormChange}
        >
          <Divider orientation="left" style={{ marginTop: 0, marginBottom: isMobile ? 8 : 12 }}>
            Resignation (Others)
          </Divider>

          {/* SUMMARY */}
          <Row gutter={gutter}>
            <Col xs={24} md={12}>
              <div className="rr-info-grid">
                <InfoItem label="Employee">
                  <Select
                    showSearch
                    style={{ width: '100%' }}
                    placeholder="Search employee (name / ecode)"
                    value={selectedEmpCode}
                    onChange={setSelectedEmpCode}
                    onSearch={setSearchText}
                    filterOption={false} // IMPORTANT: server-side filtering (team-only API)
                    allowClear
                    notFoundContent={searchLoading ? <Spin size="small" /> : null}
                    optionFilterProp="children"
                    size={controlSize}
                  >
                    {reporteeList.map((emp) => (
                      <Option key={emp.employeeId} value={emp.employeeId}>
                        {`${emp.fullName}-${emp.ecode}`}
                      </Option>
                    ))}
                  </Select>
                </InfoItem>

                <InfoItem label="Department">{selectedObj?.departmentName || '-'}</InfoItem>

                <InfoItem label="Reporting Manager">
                  {selectedObj?.reportHeadName || selectedObj?.reportHeadEcode
                    ? `${selectedObj?.reportHeadName || '-'} (${selectedObj?.reportHeadEcode || '-'})`
                    : '-'}
                </InfoItem>

                <InfoItem label="Reporting HR">-</InfoItem>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="rr-info-grid">
                <InfoItem label="Join Date">
                  {selectedObj?.dateOfJoining
                    ? dayjs(selectedObj?.dateOfJoining).format('DD/MM/YYYY')
                    : '-'}
                </InfoItem>
                <InfoItem label="Last Day of Working">{lastDayy}</InfoItem>
                <InfoItem label="Notice Period (Days)">{values.noticePeriod}</InfoItem>
              </div>
            </Col>
          </Row>

          {/* FORM CONTROLS */}
          <Row gutter={gutter} style={{ marginTop: isMobile ? 12 : 20 }}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Reason of Resignation"
                name="type"
                rules={[{ required: true, message: 'Please select type' }]}
                style={{ marginBottom: isMobile ? 12 : 16 }}
              >
                <Select placeholder="Select Resignation Type" style={{ width: '100%' }} size={controlSize}>
                  {resinationTypelists?.map((val) => (
                    <Option key={val.resignationTypeId} value={val.resignationTypeId}>
                      {val.resignationTypeName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Requested Relieving Date"
                name="resignationDate"
                getValueProps={(value) => ({ value: value ? dayjs(value) : null })}
                style={{ marginBottom: isMobile ? 12 : 16 }}
              >
                <DatePicker style={{ width: '100%' }} placeholder="Select date" size={controlSize} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={gutter}>
            <Col span={24}>
              <Form.Item label="Comments" name="reason">
                <Input.TextArea
                  rows={isMobile ? 4 : 5}
                  placeholder="Write reason..."
                  maxLength={200}
                  showCount
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ textAlign: isMobile ? 'stretch' : 'end', marginTop: isMobile ? 8 : 16 }}>
            <Button type="primary" htmlType="submit" size={controlSize} block={isMobile}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Card>
  )
}

export default RecordResignationOthers
