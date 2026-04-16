import React, { useState, useEffect } from 'react'
import { Modal, Button, Form, Input, Select, DatePicker, Tabs, message } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getDropdownLocDesDep, getGroupList, upsertHoliday } from '../../services/Services'

const { Option } = Select
const { TabPane } = Tabs

const UpsertHolidayFormModal = ({ editData = null, onSuccess, onCancel }) => {
  console.log('editdata:', editData)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('1') // '1' for store, '2' for group
  const [loading, setLoading] = useState(false)
  const [storeOptions, setStoreOptions] = useState([])
  const [groupOptions, setGroupOptions] = useState([])
  const dropdowns = ['location']

  // console.log('storeOptions: ', storeOptions)
  // console.log('groupOptions: ', groupOptions)

  const fetchLocations = async () => {
    try {
      const response = await getDropdownLocDesDep(dropdowns.join(', '))
      // console.log('locations: ', locations)

      if (response?.status) {
        setStoreOptions(response?.data?.Location || [])
      } else {
        setStoreOptions([])
      }
    } catch (error) {
      console.error('err fetching locations api: ', error)
    }
  }

  const fetchGroups = async () => {
    try {
      const response = await getGroupList()
      // console.log('group api response: ', response)

      if (response?.status === 200) {
        setGroupOptions(response?.data?.data || [])
      } else {
        setGroupOptions([])
      }
    } catch (error) {
      console.error('Err fetching group api: ', error)
    }
  }

  useEffect(() => {
    fetchLocations()
    fetchGroups()
  }, [])

  useEffect(() => {
    if (editData) {
      setIsModalOpen(true)
      // Set tab based on locationType
      const tabKey = editData.locationType === 2 ? '2' : '1'
      setActiveTab(tabKey)

      // Populate form with edit data
      form.setFieldsValue({
        locationValue: editData.locationValue,
        holidayName: editData.holidayName,
        holidayDate: editData.holidayDate ? dayjs(editData.holidayDate) : null,
      })
    }
  }, [editData, form])

  const showModal = () => {
    setIsModalOpen(true)
    setActiveTab('1') // Default to store tab
    form.resetFields()
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
    setActiveTab('1')
    if (onCancel) onCancel()
  }

  const handleSubmit = async (values) => {
    try {
      setLoading(true)

      const payload = {
        id: editData?.id || 0,
        locationType: parseInt(activeTab),
        locationValue: String(values.locationValue),
        holidayName: values.holidayName,
        // holidayDate: values.holidayDate ? values.holidayDate.toISOString() : null,
        holidayDate: values.holidayDate ? values.holidayDate.format('YYYY-MM-DD') : null,
      }

      const response = await upsertHoliday(payload)
      // console.log('response: ', response)

      if (response?.status === 200) {
        onSuccess()
        setIsModalOpen(false)
      } else {
        message.error(response?.response?.data?.message || 'Error in submitting form')
      }
    } catch (error) {
      console.error('Error submitting holiday:', error)
      message.error('Failed to save holiday. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onTabChange = (key) => {
    setActiveTab(key)
    // Clear the location/group field when switching tabs
    form.setFieldValue('locationValue', undefined)
  }

  const renderLocationField = () => {
    if (activeTab === '1') {
      return (
        <Form.Item
          name="locationValue"
          label="Location"
          rules={[{ required: true, message: 'Please select a location!' }]}
        >
          <Select
            placeholder="Select a store"
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase()?.includes(input?.toLowerCase())
            }
          >
            {storeOptions?.map((store) => (
              <Option key={store?.locationId} value={store?.locationId}>
                {store?.locationName}
              </Option>
            ))}
          </Select>
        </Form.Item>
      )
    } else {
      return (
        <Form.Item
          name="locationValue"
          label="Group"
          rules={[{ required: true, message: 'Please select a group!' }]}
        >
          <Select
            placeholder="Select a group"
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.children ?? '')?.toLowerCase()?.includes(input?.toLowerCase())
            }
          >
            {groupOptions?.map((group) => (
              <Option key={group?.id} value={group?.id}>
                {group?.groupName}
              </Option>
            ))}
          </Select>
        </Form.Item>
      )
    }
  }

  return (
    <>
      {!editData && (
        <Button icon={<PlusOutlined />} onClick={showModal}>
          Add Holiday
        </Button>
      )}

      <Modal
        title={editData ? 'Edit Holiday' : 'Add New Holiday'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Tabs activeKey={activeTab} onChange={onTabChange}>
          <TabPane tab="Store" key="1">
            <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={loading}>
              {renderLocationField()}

              <Form.Item
                name="holidayName"
                label="Holiday Name"
                rules={[{ required: true, message: 'Please enter holiday name!' }]}
              >
                <Input placeholder="Enter holiday name" />
              </Form.Item>

              <Form.Item
                name="holidayDate"
                label="Holiday Date"
                rules={[{ required: true, message: 'Please select holiday date!' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Select holiday date"
                  format="YYYY-MM-DD"
                />
              </Form.Item>

              <Form.Item style={{ marginTop: '24px', marginBottom: 0 }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <Button onClick={handleCancel}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {editData ? 'Update' : 'Create'}
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Group" key="2">
            <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={loading}>
              {renderLocationField()}

              <Form.Item
                name="holidayName"
                label="Holiday Name"
                rules={[{ required: true, message: 'Please enter holiday name!' }]}
              >
                <Input placeholder="Enter holiday name" />
              </Form.Item>

              <Form.Item
                name="holidayDate"
                label="Holiday Date"
                rules={[{ required: true, message: 'Please select holiday date!' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="Select holiday date"
                  format="YYYY-MM-DD"
                />
              </Form.Item>

              <Form.Item style={{ marginTop: '24px', marginBottom: 0 }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <Button onClick={handleCancel}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {editData ? 'Update' : 'Create'}
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Modal>
    </>
  )
}

export default UpsertHolidayFormModal
