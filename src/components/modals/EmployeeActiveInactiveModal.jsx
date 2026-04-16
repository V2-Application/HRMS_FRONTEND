import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, DatePicker, Radio, Button, Upload, Select, Col, Row } from 'antd'
import dayjs from 'dayjs'
import { UploadOutlined } from '@ant-design/icons'
import AttachmentCarousel from './AttachmentCarousel'
import { getReasonForLeaving } from '../../services/Services'
import { useWatch } from 'antd/es/form/Form'

const { TextArea } = Input

function EmployeeActiveInactiveModal({
  selectedEmployeeName,
  abscondingList,
  visible,
  onClose,
  onSubmit,
  blackList,
}) {
  const [form] = Form.useForm()
  const [status, setStatus] = useState(true)
  const [options, setOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState('')
  const { id, checked, index, name, dateOfJoining } = selectedEmployeeName
  const status_reg_abs = useWatch(['status_reg_abs'], form)
  const comp_doj = dayjs(dateOfJoining).format('YYYY-MM-DD')
  const comp_dojj = null
  // console.log('comp _ doj ', comp_doj);

  const handleChange = (value) => {
    setSelectedOption(value)
  }

  // normalize upload event to filelist
  const normFile = (e) => {
    if (Array.isArray(e)) return e
    return e?.fileList
  }

  const handleStatusChange = (e) => {
    setStatus(e.target.value)
  }

  const handleFinish = (values) => {
    // console.log('handlefinish - values', values)

    const updatedValues = {
      ...values,
      id: id,
      index: index,
    }
    onSubmit(updatedValues)
    form.resetFields()
  }

  const fetchReasonDrp = async () => {
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
  }

  useEffect(() => {
    fetchReasonDrp()
  }, [])

  useEffect(() => {
    form.setFieldsValue({
      employeeName: name,
    })
    setStatus(!checked)
  }, [selectedEmployeeName, form])

  return (
    <Modal
      title={checked ? 'Employee Status Update' : 'Employee Leaving Reason'}
      visible={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          label="Employee Name"
          name="employeeName"
          rules={[{ required: checked ? true : false }]}
        >
          <Input placeholder="Enter employee name" disabled />
        </Form.Item>
        <Form.Item name="status_reg_abs" initialValue="resignation" rules={[{ required: true }]}>
          <Radio.Group onChange={handleStatusChange}>
            <Radio value="resignation">Resignation</Radio>
            <Radio value="absconding">Absconding</Radio>
            <Radio value="blackList">Blacklist</Radio>
          </Radio.Group>
        </Form.Item>

        <Row gutter={16}>
          {/* {status === false && ( */}
          {/* <Col sm={24} md={12}>
            <Form.Item
              label="Proposed Date of Separation"
              name="leavingDate"
              rules={[{ required: checked ? true : false, message: 'Leaving Date is required!' }]}
            >
              <DatePicker
                disabledDate={(current) => {
                  const today = dayjs()
                  const comp_doj = null
                  const sixtyDaysAgo = today.subtract(60, 'day')
                  const minDate = comp_doj?.isAfter(sixtyDaysAgo)
                    ? comp_doj.startOf('day')
                    : sixtyDaysAgo.startOf('day')

                  return current && (current < minDate || current > today.endOf('day'))
                }}
                disabled={!comp_doj}
                style={{ width: '100%' }}
              />
              {!comp_doj && (
                <span style={{ color: 'red' }}>Please Update Date of Joining First</span>
              )}
            </Form.Item>
          </Col> */}
          {/* <Form.Item label="Reason for Leaving" name="reason" rules={[{ required: true }]}>
              <TextArea placeholder="Enter reason" rows={3} />
            </Form.Item> */}

          {status_reg_abs === 'resignation' && (
            <Col sm={24}>
              <Form.Item
                label="Reason of Separation"
                name="reason"
                rules={[{ required: true, message: 'Reason is required!' }]}
              >
                <Select
                  onChange={handleChange}
                  options={options}
                  style={{ width: '100%' }}
                  placeholder="Select reason"
                />
              </Form.Item>
            </Col>
          )}
          {status_reg_abs === 'absconding' && (
            <Col sm={24}>
              <Form.Item
                label="Reason of Absconding"
                name="abscondingReasonId"
                rules={[{ required: true, message: 'Reason is required!' }]}
              >
                <Select placeholder="Select Position">
                  {abscondingList &&
                    abscondingList?.map((val, index) => (
                      <Option key={index} value={val.abscondingReasonId}>
                        {val.abscondingReasonName}
                      </Option>
                    ))}
                </Select>
                {/* //abscondingList */}
              </Form.Item>
            </Col>
          )}
          {status_reg_abs === 'blackList' && (
            <Col sm={24}>
              <Form.Item
                label="Reason of Black List"
                name="blackListReasonId"
                rules={[{ required: true, message: 'Reason is required!' }]}
              >
                <Select placeholder="Select Position">
                  {blackList &&
                    blackList?.map((val, index) => (
                      <Option key={index} value={val.blackListReasonId}>
                        {val.blacklListReasonName}
                      </Option>
                    ))}
                </Select>
                {/* //abscondingList */}
              </Form.Item>
            </Col>
          )}
        </Row>

        <Form.Item
          label="Remarks"
          name="remarks"
          rules={[{ required: checked ? true : false, message: 'Remarks is required!' }]}
        >
          <TextArea placeholder="Any additional notes" rows={2} disabled={checked === false} />
        </Form.Item>

        <Form.Item
          name="attachments"
          label="Attachments"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          // rules={[{ required: true, message: 'Attachment is required' }]}
        >
          <Upload multiple beforeUpload={() => false} listType="text">
            <Button
              icon={<UploadOutlined />}
              style={{
                height: 32, // match default AntD control height
                lineHeight: '32px', // vertically center the text/icon
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 15px',
              }}
            >
              Click to Upload
            </Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
            Submit
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default EmployeeActiveInactiveModal
