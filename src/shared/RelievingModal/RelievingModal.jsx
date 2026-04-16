import { ArrowRightOutlined } from '@ant-design/icons'
import RelievingModalTemplate from './RelievingModalTemplate'
import {
  Button,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Typography,
} from 'antd'
import { hrNames } from '../../VendorModule/constants'
import { useState } from 'react'
import dayjs from 'dayjs'

const { Text } = Typography

const RelievingModal = ({
  isModalOpen,
  handleCancel,
  empDetails = {},
  setIsIncrementModalOpen,
}) => {
  const [templateDetails, setTemplateDetails] = useState(null)
  const [isRelievingTemplateModalOpen, setIsRelievingTemplateModalOpen] = useState(false)

  const handleModalOpen = (details = {}) => {
    setTemplateDetails(details)
    setIsRelievingTemplateModalOpen(true)
    // handleCancel()
  }

  const handleModalClose = () => {
    setTemplateDetails(null)
    setIsRelievingTemplateModalOpen(false)
  }

  const onFinish = (values) => {
    const fullDetails = {
      ...empDetails,
      ...values,
      expGenerationDate: dayjs(values.expGenerationDate).format('YYYY-MM-DD'),
    }

    handleModalOpen(fullDetails)
  }

  return (
    <>
      {isRelievingTemplateModalOpen && (
        <RelievingModalTemplate
          isModalOpen={isRelievingTemplateModalOpen}
          handleCancel={handleModalClose}
          details={templateDetails}
          setIsIncrementModalOpen={setIsIncrementModalOpen}
        />
      )}

      <Modal
        title="Relieving Letter Details"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
        width={640}
        destroyOnClose
        bodyStyle={{ paddingTop: 20 }}
      >
        <Descriptions
          bordered
          size="small"
          column={2}
          labelStyle={{ width: 150, background: '#fafafa', fontWeight: 600 }}
          contentStyle={{ background: '#fff' }}
        >
          <Descriptions.Item label="Emp Code">
            <Text>{empDetails?.empCode}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Emp Name">
            <Text>{empDetails?.empName}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Department">
            <Text>{empDetails?.department}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Designation">
            <Text>{empDetails?.designation}</Text>
          </Descriptions.Item>
        </Descriptions>

        <Divider style={{ margin: '14px 0' }} />

        <Form layout="vertical" onFinish={onFinish}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Date"
                name="expGenerationDate"
                rules={[{ required: true, message: 'Date is required' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="HR Name"
                name="hrName"
                rules={[{ required: true, message: 'HR Name is required' }]}
              >
                <Select placeholder="Select HR" allowClear optionFilterProp="children">
                  <Select.Option>Select Name</Select.Option>
                  {hrNames.map((hr) => (
                    <Select.Option value={hr.value}>{hr.label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Space style={{ width: '100%', display: 'flex', justifyContent: 'end' }}>
            <Button type="primary" htmlType="submit" icon={<ArrowRightOutlined />} />
          </Space>
        </Form>
      </Modal>
    </>
  )
}

export default RelievingModal
