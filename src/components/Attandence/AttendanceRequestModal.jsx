import React, { useEffect, useState } from 'react'
import {
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Upload,
  Button,
  Spin,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import moment from 'moment'
import './AttendanceRequestModal.css'
import {
  AttendanceRegularization,
  searchEmployeeDropdown,
  getReporteeList,
} from '../../services/Services'
import { useSelector } from 'react-redux'
import dayjs from 'dayjs'

const AttendanceRequestModal = ({
  isAttendanceRequestModalOpen,
  setIsAttendanceRequestModalOpen,
  regulistAttandanceUpdatedData,
}) => {
  // const reportingManagerId = localStorage.getItem('reportingManagerId')
  const {
    ecode: defaultECode,
    firstName: defaultName,
    employeeId,
    reportHeadEcode,
    reportheadid,
  } = useSelector((state) => state.auth.data)
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const [selectedReason, setSelectedReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEmpCode, setSelectedEmpCode] = useState(defaultECode || '')
  const [searchText, setSearchText] = useState('')
  const [employees, setEmployees] = useState([])
  const { role, reportHeadName, storeCode, ecode, designationName } = useSelector(
    (state) => state?.auth?.data || {},
  )
  const [searchLoading, setsearchLoading] = useState(false)
  const [reporteeList, setreporteeList] = useState([])
  const regularizeOpenForLastMonth = ['rh01', 'rh02']
  const allowedEcodes = [
    'V47732',
    'V47249',
    'V48164',
    'V46823',
    'V47965',
    'V47829',
    'V46015',
    'V48013',
    'V47252',
    'V47574',
    'V46822',
    'V46643',
    'V48208',
    'V48474',
    'V46372',
    'V47996',
    'V47230',
    'V48107',
    'V48066',
    'V46450',
    'V48416',
    'V48456',
    'V48391',
    'V48473',
    'V48620',
    'V48560',
    'V47677',
    'V48213',
    'V48108',
    'V48392',
    'V48526',
    'V48856',
    'V48854',
    'V47041',
    'V48765',
    'V48925',
  ]

  const regularizeOpenForLastMonthForDesignations = [
    'site supervisor',
    'ac technician',
    'ac tecnician',
  ]

  // 🔹 Custom validator: Punch Out cannot be before Punch In
  const validatePunchOutTime = (_, value) => {
    const punchIn = form.getFieldValue(['attendanceRequest', 'punchInTime'])

    // If either is not set yet, don't block the user
    if (!value || !punchIn) {
      return Promise.resolve()
    }

    // value & punchIn are moment objects
    if (value.isBefore(punchIn)) {
      return Promise.reject(new Error('Punch Out Time cannot be earlier than Punch In Time'))
    }

    return Promise.resolve()
  }

  const onFinish = async (values) => {
    setIsLoading(true)
    try {
      const finalValues = values.attendanceRequest
      const { date, punchInTime, punchOutTime, reason, message, proof, empid } = finalValues

      const punchIn = moment(date)
        .set({
          hour: punchInTime.hour(),
          minute: punchInTime.minute(),
          second: punchInTime.second(),
        })
        .format('HH:mm')

      const punchOut = moment(date)
        .set({
          hour: punchOutTime.hour(),
          minute: punchOutTime.minute(),
          second: punchOutTime.second(),
        })
        .format('HH:mm')

      const requestBody = {
        EmployeeId: empid || employeeId,
        RequestDate: dayjs(date).format('YYYY-MM-DDTHH:mm:ss'),
        Reason: reason,
        PunchIn: punchIn,
        PunchOut: punchOut,
        Remarks: message,
        StatusId: 4,
      }

      const formData = new FormData()

      formData.append('RequestDate', dayjs(date).format('YYYY-MM-DDTHH:mm:ss'))
      formData.append('Reason', reason)
      formData.append('PunchIn', punchIn)
      formData.append('PunchOut', punchOut)
      formData.append('Remarks', message)
      formData.append('StatusId', 4)

      if (proof?.file) {
        formData.append('attachment', proof?.file)
      }

      if (empid) {
        formData.append('EmployeeId', empid)
      }

      const response = await AttendanceRegularization(formData)

      if (response.data?.status) {
        setSelectedReason('')
        messageApi.success(response.data?.message)
        form.resetFields()
        setIsAttendanceRequestModalOpen(false)
      } else {
        messageApi.error(response?.response?.data?.message || 'Error in Submit')
      }
    } catch (error) {
      messageApi.error(error?.response?.data?.message || 'Error in Submit')
    } finally {
      setIsLoading(false)
    }
  }

  const getReporteeListData = async () => {
    try {
      const currentPage = 1
      const pageSize = 100
      const lists = await getReporteeList(currentPage, pageSize, searchText, employeeId)
      const final_Data = lists?.data?.employees
      setreporteeList(final_Data)
    } catch (error) {}
  }

  useEffect(() => {
    getReporteeListData()
  }, [])

  // Debounced employee search
  useEffect(() => {
    if (searchText.length >= 2) {
      setsearchLoading(true)
      const debounceTimer = setTimeout(() => {
        const fetchData = async () => {
          try {
            const currentPage = 1
            const pageSize = 100
            const res = await searchEmployeeDropdown(searchText)
            setEmployees(res?.data?.employees)
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

  const enableDateForCurrentMonth = (current) => {
    const today = dayjs().startOf('day')
    const startOfMonth = dayjs().startOf('month')
    const lastOfMonth = dayjs().endOf('month').startOf('day')
    const yesterday = today.subtract(1, 'day')

    // If today is the last day of the month, allow dates from 1st to today
    if (today.isSame(lastOfMonth, 'day')) {
      return current < startOfMonth || current > today
    }

    // Else allow dates from 1st to yesterday only
    return current < startOfMonth || current > yesterday
  }

  const enableDateFromAugustLastMonthTillPreviousDay = (current) => {
    if (!current) return false

    const start = dayjs().subtract(3, 'month').startOf('month').startOf('day')
    const end = dayjs().subtract(1, 'day').endOf('day')

    return current.isBefore(start, 'day') || current.isAfter(end, 'day')
  }

  const enableDateFromSecondLastMonthTillPreviousDay = (current) => {
    if (!current) return false

    const start = dayjs().subtract(2, 'month').startOf('month').startOf('day')
    const end = dayjs().subtract(1, 'day').endOf('day')

    return current.isBefore(start, 'day') || current.isAfter(end, 'day')
  }

  const enableDateFromLastMonthTillPreviousDay = (current) => {
    if (!current) return false

    const start = dayjs().subtract(1, 'month').startOf('month').startOf('day')
    const end = dayjs().subtract(1, 'day').endOf('day')

    return current.isBefore(start, 'day') || current.isAfter(end, 'day')
  }

  const enableDateFromJanMonth26ToCurrentMonthEnd = (current) => {
    if (!current) return false

    const start = dayjs().subtract(2, 'month').date(26).startOf('day')

    const end = dayjs().subtract(1, 'day').endOf('day')

    // disable dates before start OR after end
    return current.isBefore(start, 'day') || current.isAfter(end, 'day')
  }

  const enableDateFromLastMonth26ToCurrentMonthEnd = (current) => {
    if (!current) return false

    const start = dayjs().subtract(1, 'month').date(26).startOf('day')

    const end = dayjs().subtract(1, 'day').endOf('day')

    // disable dates before start OR after end
    return current.isBefore(start, 'day') || current.isAfter(end, 'day')
  }

  if (regulistAttandanceUpdatedData) {
    const {
      attachment,
      attendanceRequestId,
      ecode,
      employeeId,
      employeeName,
      punchIn,
      punchOut,
      reason,
      remarks,
      reportHeadEcode,
      reportHeadName,
      requestDate,
      statusId,
      punchTypeId,
    } = regulistAttandanceUpdatedData
    form.setFieldsValue({
      attendanceRequest: {
        requestType: 'attendance-request',
        reason: reason,
        date: moment(requestDate),
        punchInTime: moment(punchIn, 'hh:mm A'),
        punchOutTime: moment(punchOut, 'hh:mm A'),
        message: remarks,
        punchTypeId: punchTypeId,
      },
    })
  }

  useEffect(() => {
    form.setFieldsValue({
      attendanceRequest: {
        empid: employeeId,
      },
    })
  })

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginRight: 20,
            }}
          >
            <span>Attendance Request</span>
            <span>
              RM:{' '}
              {regulistAttandanceUpdatedData
                ? regulistAttandanceUpdatedData.reportHeadName
                : reportHeadName}
            </span>
          </div>
        }
        centered
        open={isAttendanceRequestModalOpen}
        onCancel={() => setIsAttendanceRequestModalOpen(false)}
        footer={null}
        width={800}
        className="custom-scrollbar-modal"
        bodyStyle={{ padding: '24px' }}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              {role === 'SuperAdmin' || role === 'Master' || role === 'HR' ? (
                <Form.Item
                  name={['attendanceRequest', 'empid']}
                  label={
                    <span style={{ fontWeight: 'bold', color: '#1890ff' }}>Search Employee</span>
                  }
                  rules={[{ required: true, message: 'Request type is mandatory' }]}
                >
                  <Select
                    showSearch
                    placeholder="Employee"
                    value={selectedEmpCode || undefined}
                    onChange={setSelectedEmpCode}
                    onSearch={setSearchText}
                    filterOption={false}
                    notFoundContent={null}
                    allowClear
                  >
                    {defaultECode && (
                      <Select.Option
                        key={employeeId}
                        value={employeeId}
                      >{`${defaultECode} - ${defaultName}`}</Select.Option>
                    )}
                    {!searchLoading ? (
                      employees.map((emp) => (
                        <Select.Option key={emp.employeeId} value={emp.employeeId}>
                          {`${emp.ecode} - ${emp.fullName}`}
                        </Select.Option>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <Spin />
                      </div>
                    )}
                  </Select>
                </Form.Item>
              ) : (
                <Form.Item
                  name={['attendanceRequest', 'empid']}
                  label={<span style={{ fontWeight: 'bold', color: '#1890ff' }}>Employee</span>}
                  rules={[{ required: true, message: 'Request type is mandatory' }]}
                >
                  <Select
                    showSearch
                    placeholder="Employee"
                    value={selectedEmpCode || undefined}
                    onChange={setSelectedEmpCode}
                    onSearch={setSearchText}
                    filterOption={(input, option) =>
                      option?.children?.toLowerCase().includes(input.toLowerCase())
                    }
                    allowClear
                    notFoundContent={false}
                  >
                    {defaultECode && (
                      <Select.Option
                        key={employeeId}
                        value={employeeId}
                      >{`${defaultECode} - ${defaultName}`}</Select.Option>
                    )}

                    {reporteeList.map((emp) => (
                      <Select.Option key={emp.employeeId} value={emp.employeeId}>
                        {`${emp.ecode} - ${emp.fullName}`}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name={['attendanceRequest', 'reason']}
                label="Reason"
                rules={[{ required: true, message: 'Reason is mandatory' }]}
              >
                <Select placeholder="Select reason" onChange={(value) => setSelectedReason(value)}>
                  <Select.Option value="missed-punch-in">Missed Punch-in</Select.Option>
                  <Select.Option value="missed-punch-out">Missed Punch-out</Select.Option>
                  <Select.Option value="on-duty">On Duty</Select.Option>
                </Select>
              </Form.Item>
              {selectedReason === 'on-duty' && (
                <div style={{ fontSize: '12px', color: 'red', marginTop: '-12px' }}>
                  On Duty is only applicable when the machine is not available.
                </div>
              )}
            </Col>

            {/* 🔒 DATE FIELD – COMPLETELY DISABLED */}
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name={['attendanceRequest', 'date']}
                label="Date"
                rules={[{ required: true, message: 'Date is mandatory' }]}
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  // disabledDate={enableDateFromLastMonth26ToCurrentMonthEnd}
                  disabledDate={
                    allowedEcodes.includes(ecode)
                      ? enableDateFromJanMonth26ToCurrentMonthEnd
                      : enableDateFromLastMonth26ToCurrentMonthEnd
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            {/* 🔒 PUNCH IN – COMPLETELY DISABLED */}
            <Col xs={24} sm={12}>
              <Form.Item
                name={['attendanceRequest', 'punchInTime']}
                label="Punch In Time"
                rules={[{ required: true, message: 'Punch in time is mandatory' }]}
              >
                <DatePicker.TimePicker format="hh:mm A" use12Hours style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            {/* 🔒 PUNCH OUT – COMPLETELY DISABLED */}
            <Col xs={24} sm={12}>
              <Form.Item
                name={['attendanceRequest', 'punchOutTime']}
                label="Punch Out Time"
                dependencies={[['attendanceRequest', 'punchInTime']]}
                rules={[
                  { required: true, message: 'Punch out time is mandatory' },
                  { validator: validatePunchOutTime },
                ]}
              >
                <DatePicker.TimePicker format="hh:mm A" use12Hours style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name={['attendanceRequest', 'message']}
                label="Message"
                rules={[{ required: true, message: 'Message is required' }]}
              >
                <Input.TextArea rows={3} placeholder="Enter your message..." />
              </Form.Item>
            </Col>
          </Row>

          {!regulistAttandanceUpdatedData && (
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name={['attendanceRequest', 'proof']}
                  label="Proof"
                  rules={[
                    {
                      required: role !== 'SuperAdmin',
                      validator: (_, value) => {
                        if (role === 'SuperAdmin') return Promise.resolve()

                        if (value && Array.isArray(value.fileList) && value.fileList.length > 0) {
                          return Promise.resolve()
                        }

                        return Promise.reject(new Error('Please upload document or media file'))
                      },
                    },
                  ]}
                >
                  <Upload
                    className="abcd"
                    beforeUpload={() => false}
                    maxCount={1}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.mp4,.avi,.mov,.mkv"
                  >
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          )}

          {regulistAttandanceUpdatedData?.attachment && (
            <a
              href={regulistAttandanceUpdatedData.attachment}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Attachment
            </a>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading} block>
              Submit Request
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default AttendanceRequestModal
