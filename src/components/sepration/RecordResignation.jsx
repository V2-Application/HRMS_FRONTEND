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
  Descriptions,
  message,
} from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import './RecordResignation.css' // We'll add a little CSS separately
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import {
  fetchEmpLeaveData,
  getDetailbySeprationId,
  postResignation,
  resignationTypesList,
} from '../../services/Services'
import { useParams } from 'react-router-dom'

const { Option } = Select

const RecordResignation = () => {
  const { employeeId, firstName, lastName, reportHeadName, departmentName, joiningdate } =
    useSelector((state) => state?.auth?.data)
  const [form] = Form.useForm()
  const params = useParams()
  const resignationDate = Form.useWatch('resignationDate', form)
  const [formValues, setFormValues] = useState({})
  const [resinationTypelists, setresinationTypelists] = useState([])
  const [currentEl, setCurrentEl] = useState('')
  const [values, setvalues] = useState({
    employee: `${firstName} ${lastName === null ? '' : lastName}`,
    department: departmentName,
    r_manager: reportHeadName,
    r_hr: '-',
    joinDate: joiningdate,
    lastDay: '-',
    noticePeriod: 30,
  })

  const fetchEl = async () => {
    const response = await fetchEmpLeaveData(employeeId)
    // console.log('response el:', response)

    if (response?.status === 200) {
      const el = response?.data?.find((dt) => dt?.leaveType === 'Earned Leave')
      console.log('el:', el)
      setCurrentEl(el?.availableBalance)
    }
  }

  useEffect(() => {
    fetchEl()
  }, [])

  const getResignationType = async () => {
    try {
      const list = await resignationTypesList()
      // console.log('list--------->', list.data.data);
      const finalList = list.data.data || []
      setresinationTypelists(finalList)
    } catch (error) {
      console.error('error in fetching list ', error)
    }
  }

  const getDataBySeprationID = async (id) => {
    try {
      const result = await getDetailbySeprationId(id)
      console.log('rsult:', result)
      const final_result = result.data.data
      // console.log('getDataBySeprationID', result);
      form.setFieldsValue({
        resignationTypeId: final_result.resignationTypeId,
        resignationDate: final_result.resignationDate,
        remarks: final_result.remarks,
      })

      const val = {
        employee: final_result?.fullName,
        department: final_result?.departmentName,
        r_manager: final_result?.reportingHeadName,
        r_hr: '-',
        joinDate: final_result?.joinDate,
        // lastDay: final_result.joinDate,
        noticePeriod: 30,
      }

      setvalues(val)
    } catch (error) {}
  }

  useEffect(() => {
    getResignationType()
    if (params?.id) {
      getDataBySeprationID(params?.id)
    }
  }, [])

  const handleFormChange = (changedValues, allValues) => {
    const { supposedLastDay, noticePeriod } = allValues
    // console.log("changedValues", changedValues);
    // console.log("supposedLastDay", supposedLastDay);
    // console.log("noticePeriod", noticePeriod);

    if (resignationDate && noticePeriod) {
      const calculatedLastDay = dayjs(resignationDate).add(Number(noticePeriod), 'day')
      // console.log("calculatedLastDay", calculatedLastDay);
      form.setFieldsValue({
        lastDay: calculatedLastDay,
      })
    }
  }

  // const values = {
  //   employee: `${firstName} ${lastName === null ? "" : lastName}`,
  //   department: "-",
  //   r_manager: reportHeadName,
  //   r_hr: "-",
  //   joinDate: "2021-04-15",
  //   lastDay: "-",
  //   noticePeriod: 30,
  // };

  // 👇 calculate last day dynamically
  const lastDayy =
    resignationDate && values.noticePeriod
      ? dayjs(resignationDate).add(29, 'day').format('YYYY-MM-DD')
      : '-'

  const handleSubmit = async (values) => {
    const val = {
      ...values,
      employeeId: employeeId,
      joinDate: dayjs(values.joinDate).format('YYYY-MM-DD'),
      lastDay: lastDayy,
      // remarks: values.reason,
      resignationDate: dayjs(values.resignationDate).format('YYYY-MM-DD'),
      // resignationTypeId: dayjs(values.resignationTypeId).format('YYYY-MM-DD'),
      isApprovedByManager: null,
    }
    console.log('Form Submitted with values: ', val)
    try {
      const response = await postResignation(val)
      console.log('response submitting resignation', response)

      if (response.status === 200) {
        form.resetFields()
        message.success(response.data?.message || 'form submitted successfully')
      }
    } catch (error) {
      console.error('error submitting resignation', error)
      message.error(
        error?.response?.data?.error || 'An error occurred while submitting resignation',
      )
    }
  }

  return (
    <Card className="record-resignation-card">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={formValues}
        onValuesChange={handleFormChange}
      >
        <Row gutter={[24, 24]}>
          {/* Left Column */}
          <Col xs={24} md={12}>
            <Divider orientation="left">{'Resignation (Self)'}</Divider>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Employee">{values?.employee}</Descriptions.Item>
              <Descriptions.Item label="Department">{values?.department}</Descriptions.Item>
              <Descriptions.Item label="Reporting Manager">{values?.r_manager}</Descriptions.Item>
              <Descriptions.Item label="Reporting HR">{values?.r_hr}</Descriptions.Item>
            </Descriptions>
          </Col>

          {/* Right Column */}
          <Col xs={24} md={12} style={{ marginTop: 5 }}>
            <Divider orientation="left"></Divider>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Join Date">
                {values.joinDate ? dayjs(values.joinDate).format('DD/MM/YYYY') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Last Day of Working">
                {/* {values.lastDay ? dayjs(values.lastDay).format('DD/MM/YYYY') : '-'} */}
                {lastDayy}
              </Descriptions.Item>
              <Descriptions.Item label="Notice Period (Days)">
                {values.noticePeriod}
              </Descriptions.Item>
              <Descriptions.Item label="Balance EL">{currentEl}</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        {/* Resignation Details Section */}
        {/* <Divider orientation="right">Resignation Details</Divider> */}
        {!params.id && (
          <>
            <Row gutter={[24, 24]} style={{ marginTop: 30 }}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="
              Reason of Resignation"
                  name="resignationTypeId"
                  rules={[{ required: true, message: 'Please select type' }]}
                >
                  <Select placeholder="Select Resignation Type">
                    {resinationTypelists?.map((val, ind) => (
                      <Select.Option key={val.resignationTypeId} value={val.resignationTypeId}>
                        {val.resignationTypeName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Requested Relieving Date"
                  name="resignationDate"
                  getValueProps={(value) => ({ value: value ? dayjs(value) : null })}
                >
                  <DatePicker style={{ width: '100%' }} placeholder="Select Supposed Last Day" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 24]}>
              <Col xs={24} md={24}>
                <Form.Item label="Comments" name="remarks">
                  <Input.TextArea
                    rows={5}
                    placeholder="Write reason..."
                    maxLength={200}
                    showCount
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {params.id && (
          <>
            <Row gutter={[24, 24]} style={{ marginTop: 30 }}>
              <Col xs={24} md={12}>
                <Form.Item label="Reason of Resignation" name="resignationTypeId">
                  <Input
                    value={
                      resinationTypelists?.find(
                        (val) => val.resignationTypeId === form.getFieldValue('resignationTypeId'),
                      )?.resignationTypeName || ''
                    }
                    readOnly
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Requested Relieving Date" name="resignationDate">
                  <Input
                    value={
                      form.getFieldValue('resignationDate')
                        ? dayjs(form.getFieldValue('resignationDate')).format('YYYY-MM-DD')
                        : ''
                    }
                    readOnly
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 24]}>
              <Col xs={24} md={24}>
                <Form.Item label="Comments" name="remarks">
                  <Input.TextArea rows={5} value={form.getFieldValue('remarks')} readOnly />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {!params.id && (
          <Form.Item style={{ textAlign: 'end', marginTop: '30px' }}>
            <Button type="primary" htmlType="submit" size="large">
              Submit
            </Button>
          </Form.Item>
        )}
      </Form>
    </Card>
  )
}

export default RecordResignation
