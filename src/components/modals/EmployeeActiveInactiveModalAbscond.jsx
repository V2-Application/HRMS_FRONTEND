// import React, { useEffect, useState } from 'react'
// import { Modal, Form, Input, DatePicker, Radio, Button, Upload, Select, Col, Row } from 'antd'
// import dayjs from 'dayjs'
// import { UploadOutlined } from '@ant-design/icons'
// import AttachmentCarousel from './AttachmentCarousel'
// import { getReasonForLeaving } from '../../services/Services'
// import { useWatch } from 'antd/es/form/Form'

// const { TextArea } = Input

// function EmployeeActiveInactiveModalAbscond({
//   selectedEmployeeName,
//   abscondingList,
//   visible,
//   onClose,
//   onSubmit,
//   blackList,
// }) {
//   const [form] = Form.useForm()
//   const [status, setStatus] = useState(true)
//   const [options, setOptions] = useState([])
//   const [selectedOption, setSelectedOption] = useState('')
//   const { id, checked, index, name, dateOfJoining } = selectedEmployeeName
//   const status_reg_abs = useWatch(['status_reg_abs'], form)
//   const comp_doj = dayjs(dateOfJoining).format('YYYY-MM-DD')
//   const comp_dojj = null
//   // console.log('comp _ doj ', comp_doj);

//   const handleChange = (value) => {
//     setSelectedOption(value)
//   }

//   // normalize upload event to filelist
//   const normFile = (e) => {
//     if (Array.isArray(e)) return e
//     return e?.fileList
//   }

//   const handleStatusChange = (e) => {
//     setStatus(e.target.value)
//   }

//   const handleFinish = (values) => {
//     // console.log('handlefinish - values', values)

//     const updatedValues = {
//       ...values,
//       id: id,
//       index: index,
//     }
//     onSubmit(updatedValues)
//     form.resetFields()
//   }

//   const fetchReasonDrp = async () => {
//     const response = await getReasonForLeaving()

//     if (response.status === 200) {
//       const data = response.data?.data || []
//       const formattedData = Array.isArray(data)
//         ? data.map((dt) => ({
//             label: dt?.reasonForLeaving,
//             value: dt?.reasonID,
//           }))
//         : []

//       setOptions(formattedData)
//     }
//   }

//   useEffect(() => {
//     fetchReasonDrp()
//   }, [])

//   useEffect(() => {
//     form.setFieldsValue({
//       employeeName: name,
//     })
//     setStatus(!checked)
//   }, [selectedEmployeeName, form])

//   return (
//     <Modal
//       title={checked ? 'Employee Status Update' : 'Employee Leaving Reason'}
//       visible={visible}
//       onCancel={onClose}
//       footer={null}
//       destroyOnClose
//     >
//       <Form form={form} layout="vertical" onFinish={handleFinish}>
//         <Form.Item
//           label="Employee Name"
//           name="employeeName"
//           rules={[{ required: checked ? true : false }]}
//         >
//           <Input placeholder="Enter employee name" disabled />
//         </Form.Item>
//         <Form.Item name="status_reg_abs" initialValue="resignation" rules={[{ required: true }]}>
//           <Radio.Group onChange={handleStatusChange}>
//             <Radio value="resignation">Resignation</Radio>
//             <Radio value="active">Active</Radio>
//             <Radio value="blackList">Blacklist</Radio>
//           </Radio.Group>
//         </Form.Item>

//         <Row gutter={16}>
//           {/* {status === false && ( */}
//           <Col sm={24} md={12}>
//             <Form.Item
//               label="Proposed Date of Separation"
//               name="leavingDate"
//               rules={[{ required: checked ? true : false, message: 'Leaving Date is required!' }]}
//             >
//               <DatePicker
//                 disabledDate={(current) => {
//                   const today = dayjs()
//                   const comp_doj = null
//                   const sixtyDaysAgo = today.subtract(60, 'day')
//                   const minDate = comp_doj?.isAfter(sixtyDaysAgo)
//                     ? comp_doj.startOf('day')
//                     : sixtyDaysAgo.startOf('day')

//                   return current && (current < minDate || current > today.endOf('day'))
//                 }}
//                 disabled={!comp_doj}
//                 style={{ width: '100%' }}
//               />
//               {!comp_doj && (
//                 <span style={{ color: 'red' }}>Please Update Date of Joining First</span>
//               )}
//             </Form.Item>
//           </Col>
//           {/* <Form.Item label="Reason for Leaving" name="reason" rules={[{ required: true }]}>
//               <TextArea placeholder="Enter reason" rows={3} />
//             </Form.Item> */}

//           {status_reg_abs === 'resignation' && (
//             <Col sm={24} md={12}>
//               <Form.Item
//                 label="Reason of Separation"
//                 name="reason"
//                 rules={[{ required: true, message: 'Reason is required!' }]}
//               >
//                 <Select
//                   onChange={handleChange}
//                   options={options}
//                   style={{ width: '100%' }}
//                   placeholder="Select reason"
//                 />
//               </Form.Item>
//             </Col>
//           )}
//           {status_reg_abs === 'absconding' && (
//             <Col sm={24} md={12}>
//               <Form.Item
//                 label="Reason of Absconding"
//                 name="abscondingReasonId"
//                 rules={[{ required: true, message: 'Reason is required!' }]}
//               >
//                 <Select placeholder="Select Position">
//                   {abscondingList &&
//                     abscondingList?.map((val, index) => (
//                       <Option key={index} value={val.abscondingReasonId}>
//                         {val.abscondingReasonName}
//                       </Option>
//                     ))}
//                 </Select>
//                 {/* //abscondingList */}
//               </Form.Item>
//             </Col>
//           )}
//           {status_reg_abs === 'blackList' && (
//             <Col sm={24} md={12}>
//               <Form.Item
//                 label="Reason of Black List"
//                 name="blackListReasonId"
//                 rules={[{ required: true, message: 'Reason is required!' }]}
//               >
//                 <Select placeholder="Select Position">
//                   {blackList &&
//                     blackList?.map((val, index) => (
//                       <Option key={index} value={val.blackListReasonId}>
//                         {val.blacklListReasonName}
//                       </Option>
//                     ))}
//                 </Select>
//                 {/* //abscondingList */}
//               </Form.Item>
//             </Col>
//           )}
//         </Row>

//         <Form.Item
//           label="Remarks"
//           name="remarks"
//           rules={[{ required: checked ? true : false, message: 'Remarks is required!' }]}
//         >
//           <TextArea placeholder="Any additional notes" rows={2} disabled={checked === false} />
//         </Form.Item>

//         <Form.Item
//           name="attachments"
//           label="Attachments"
//           valuePropName="fileList"
//           getValueFromEvent={normFile}
//           // rules={[{ required: true, message: 'Attachment is required' }]}
//         >
//           <Upload multiple beforeUpload={() => false} listType="text">
//             <Button
//               icon={<UploadOutlined />}
//               style={{
//                 height: 32, // match default AntD control height
//                 lineHeight: '32px', // vertically center the text/icon
//                 display: 'inline-flex',
//                 alignItems: 'center',
//                 padding: '0 15px',
//               }}
//             >
//               Click to Upload
//             </Button>
//           </Upload>
//         </Form.Item>

//         <Form.Item>
//           <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
//             Submit
//           </Button>
//           <Button onClick={onClose}>Cancel</Button>
//         </Form.Item>
//       </Form>
//     </Modal>
//   )
// }

// export default EmployeeActiveInactiveModalAbscond

import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, DatePicker, Radio, Button, Upload, Select, Col, Row } from 'antd'
import dayjs from 'dayjs'
import { UploadOutlined } from '@ant-design/icons'
import { getReasonForLeaving } from '../../services/Services'
import { useWatch } from 'antd/es/form/Form'

const { TextArea } = Input
const { Option } = Select

function EmployeeActiveInactiveModalAbscond({
  selectedEmployeeName,
  abscondingList,
  visible,
  onClose,
  onSubmit,
  blackList,
}) {
  const [form] = Form.useForm()
  const [options, setOptions] = useState([])
  const { id, checked, index, name, dateOfJoining } = selectedEmployeeName || {}

  // Watch the status radio group
  const status_reg_abs = useWatch('status_reg_abs', form) || 'resignation'
  const isActive = status_reg_abs === 'active'

  const comp_doj = dateOfJoining ? dayjs(dateOfJoining).format('YYYY-MM-DD') : null

  // Normalize upload file list
  const normFile = (e) => {
    if (Array.isArray(e)) return e
    return e?.fileList
  }

  // const handleFinish = (values) => {
  //   const updatedValues = {
  //     ...values,
  //     id,
  //     index,
  //     status: isActive ? 'true' : 'false', // true = reactivate
  //   }
  //   onSubmit(updatedValues)
  //   form.resetFields()
  //   onClose()
  // }

  // inside EmployeeActiveInactiveModalAbscond
  const handleFinish = (values) => {
    const isActive = (form.getFieldValue('status_reg_abs') || 'resignation') === 'active'
    const leavingDateStr = values.leavingDate
      ? dayjs(values.leavingDate).format('YYYY-MM-DD')
      : undefined

    const updatedValues = {
      ...values,
      leavingDate: leavingDateStr,
      id,
      index,
      status: isActive ? 'true' : 'false',
    }

    if (isActive) {
      delete updatedValues.leavingDate
      delete updatedValues.reason
      delete updatedValues.abscondingReasonId
      delete updatedValues.blackListReasonId
    }

    onSubmit(updatedValues)
    form.resetFields()
    onClose()
  }

  const fetchReasonDrp = async () => {
    try {
      const response = await getReasonForLeaving()
      if (response.status === 200) {
        const data = response.data?.data || []
        const formattedData = Array.isArray(data)
          ? data.map((dt) => ({
              label: dt?.reasonForLeaving,
              value: dt?.reasonID,
            }))
          : []
        setOptions(formattedData)
      }
    } catch (error) {
      console.error('Failed to fetch reasons:', error)
    }
  }

  useEffect(() => {
    fetchReasonDrp()
  }, [])

  useEffect(() => {
    if (selectedEmployeeName) {
      form.setFieldsValue({
        employeeName: name,
        status_reg_abs: 'resignation',
      })
    }
  }, [selectedEmployeeName, form, name])

  return (
    <Modal
      title={checked ? 'Employee Status Update' : 'Employee Leaving Reason'}
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={700}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {/* Employee Name - Always shown */}
        <Form.Item
          label="Employee Name"
          name="employeeName"
          rules={[{ required: true, message: 'Employee name is required' }]}
        >
          <Input disabled />
        </Form.Item>

        {/* Status Radio Group */}
        <Form.Item name="status_reg_abs" initialValue="resignation" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio value="resignation">Resignation</Radio>
            <Radio value="active">Active</Radio>
            <Radio value="blackList">Blacklist1</Radio>
          </Radio.Group>
        </Form.Item>

        {/* -------------------------------------------------------------
            ONLY SHOW BELOW WHEN NOT "active"
         ------------------------------------------------------------- */}
        {!isActive && (
          <Row gutter={16}>
            {/* Proposed Date of Separation */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Proposed Date of Separation"
                name="leavingDate"
                rules={[
                  { required: true, message: 'Leaving Date is required!' },
                  {
                    validator: (_, value) => {
                      if (!value || !comp_doj) return Promise.resolve()
                      const doj = dayjs(comp_doj)
                      const sixtyDaysAgo = dayjs().subtract(60, 'day')
                      const minDate = doj.isAfter(sixtyDaysAgo) ? doj : sixtyDaysAgo
                      if (value.isBefore(minDate, 'day')) {
                        return Promise.reject(
                          new Error('Date cannot be more than 60 days before DOJ or today'),
                        )
                      }
                      if (value.isAfter(dayjs(), 'day')) {
                        return Promise.reject(new Error('Date cannot be in the future'))
                      }
                      return Promise.resolve()
                    },
                  },
                ]}
              >
                <DatePicker disabled={!comp_doj} style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
              {!comp_doj && (
                <div style={{ color: 'red', fontSize: 12, marginTop: -8, marginBottom: 8 }}>
                  Please update Date of Joining first.
                </div>
              )}
            </Col>

            {/* Resignation Reason */}
            {status_reg_abs === 'resignation' && (
              <Col xs={24} md={12}>
                <Form.Item
                  label="Reason of Separation"
                  name="reason"
                  rules={[{ required: true, message: 'Reason is required!' }]}
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={options}
                    placeholder="Select reason"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            )}

            {/* Absconding Reason */}
            {status_reg_abs === 'absconding' && (
              <Col xs={24} md={12}>
                <Form.Item
                  label="Reason of Absconding"
                  name="abscondingReasonId"
                  rules={[{ required: true, message: 'Reason is required!' }]}
                >
                  <Select placeholder="Select reason" style={{ width: '100%' }}>
                    {abscondingList?.map((val) => (
                      <Option key={val.abscondingReasonId} value={val.abscondingReasonId}>
                        {val.abscondingReasonName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}

            {/* Blacklist Reason */}
            {status_reg_abs === 'blackList' && (
              <Col xs={24} md={12}>
                <Form.Item
                  label="Reason of Blacklist"
                  name="blackListReasonId"
                  rules={[{ required: true, message: 'Reason is required!' }]}
                >
                  <Select placeholder="Select reason" style={{ width: '100%' }}>
                    {blackList?.map((val) => (
                      <Option key={val.blackListReasonId} value={val.blackListReasonId}>
                        {val.blackListReasonName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>
        )}

        {/* -------------------------------------------------------------
            REMARKS & ATTACHMENTS: 
            - Show ALWAYS when "active"
            - Show ONLY when NOT "active" (i.e. resignation/blacklist)
         ------------------------------------------------------------- */}
        <Form.Item
          label="Remarks"
          name="remarks"
          rules={[{ required: true, message: 'Remarks are required!' }]}
        >
          <TextArea placeholder="Any additional notes" rows={2} />
        </Form.Item>

        <Form.Item
          name="attachments"
          label="Attachments"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload multiple beforeUpload={() => false} listType="text">
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Form.Item>

        {/* Submit & Cancel */}
        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
            Submit
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default EmployeeActiveInactiveModalAbscond
