import React, { useEffect, useState } from 'react'
import { Table, Input, Select, Button, Upload, message, Space, Card, Typography } from 'antd'
import { UploadOutlined, SendOutlined, RollbackOutlined } from '@ant-design/icons'
import Pageheading from '../components/shared/Pageheading'
import { useNavigate, useParams } from 'react-router-dom'
import { storeRoutingList } from '../services/Services'
import { useSelector } from 'react-redux'
import axiosInstance from '../services/axiosInstance'

const { TextArea } = Input
const { Option } = Select

const NewStoreRouting = () => {
  const navigate = useNavigate()
  const { locationId } = useParams()
  const [messageApi, contextHolder] = message.useMessage()
  const [dataSource, setDataSource] = useState([])
  const [childRoutingMapping, setChildRoutingMapping] = useState({})
  const [routingData, setRoutingData] = useState([])

  // console.log('data source: ', dataSource)

  // get data from redux store
  const { employeeId } = useSelector((state) => state?.auth?.data || {})

  // Handle input changes for specific rows
  const handleInputChange = (key, field, value) => {
    const newData = dataSource.map((item) => {
      if (item.key === key) {
        return { ...item, [field]: value }
      }
      return item
    })
    setDataSource(newData)
  }

  // Handle file upload
  const handleFileChange = (key, fileList) => {
    handleInputChange(key, 'images', fileList)
  }

  // --- fetch data from API for store checklist
  const fetchRouting = async () => {
    try {
      const response = await storeRoutingList(locationId)
      // console.log('Routing data fetched:', response)

      const apiData = response?.data?.records || []
      setRoutingData(apiData || [])

      if (response.status === 200) {
        if (Array.isArray(apiData) && apiData.length > 0) {
          // --- group routing data by stage name
          const groupedData = apiData.reduce((acc, item) => {
            const staging = item?.stagingName || ''

            if (!acc[staging]) {
              acc[staging] = []
            }

            acc[staging].push(item?.routingName || '')
            return acc
          }, {})

          setChildRoutingMapping(groupedData)

          // console.log('apidata: ', apiData)
          // console.log('grouped: ', groupedData)

          const tableData = Object.keys(groupedData).map((stagingName, index) => ({
            key: index + 1,
            parentRouting: stagingName,
            childRouting: '',
            remarks: '',
            images: [],
            bgtTimeline:
              apiData.find((item) => item.stagingName === stagingName)?.bgtTimeline || '',
            storeRoutingMasterId:
              apiData.find((item) => item.stagingName === stagingName)?.storeRoutingMasterId || '',
          }))

          setDataSource(tableData)
        }
      }
    } catch (error) {
      console.error('Error fetching routing data:', error)
      message.error('Failed to fetch routing data')
    }
  }

  // Submit individual row
  const handleSubmitRow = async (record) => {
    if (!record.childRouting) {
      message.error('Please select a child routing')
      return false
    }

    try {
      const originalData = routingData.find(
        (item) =>
          item.stagingName === record.parentRouting && item.routingName === record.childRouting,
      )

      const newFormData = new FormData()
      newFormData.append('LocationId', locationId)
      newFormData.append('StoreRoutingMasterId', originalData?.storeRoutingMasterId)
      newFormData.append('Remarks', record?.remarks || '')
      newFormData.append('ActionById', employeeId)

      const images = record?.images

      if (Array.isArray(images) && images.length > 0) {
        images.forEach((image) => {
          newFormData.append('Attachments', image?.originFileObj || {})
        })
      }

      const response = await axiosInstance.post('/api/StoreRouting', newFormData)

      // console.log('response: ', response)

      if (response.status === 200) {
        message.success(response?.data?.message || 'Submitted successfully')
        fetchRouting()
      }
    } catch (error) {
      console.error('Error submitting in api: ', error)
      message.error(error?.response?.data?.message || 'Error in submitting data')
    }

    // Reset the specific row after submission
    // const newData = dataSource.map((item) => {
    //   if (item.key === record.key) {
    //     return {
    //       ...item,
    //       childRouting: '',
    //       remarks: '',
    //       images: [],
    //     }
    //   }
    //   return item
    // })
    // setDataSource(newData)
  }

  // Call fetchRouting on component mount
  useEffect(() => {
    fetchRouting()
  }, [locationId])

  const columns = [
    {
      title: 'Parent Routing',
      dataIndex: 'parentRouting',
      key: 'parentRouting',
      width: 200,
      render: (text) => <div style={{ fontSize: '12px', fontWeight: '500' }}>{text}</div>,
    },
    {
      title: 'Child Routing',
      dataIndex: 'childRouting',
      key: 'childRouting',
      width: 200,
      render: (text, record) => {
        const availableOptions = childRoutingMapping[record.parentRouting] || []

        return (
          <Select
            placeholder="Select child routing"
            value={text}
            onChange={(value) => handleInputChange(record.key, 'childRouting', value)}
            style={{ width: 200 }}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {availableOptions.map((option) => (
              <Option key={option} value={option}>
                {option}
              </Option>
            ))}
          </Select>
        )
      },
    },
    {
      title: 'BGT Timeline',
      dataIndex: 'bgtTimeline',
      key: 'bgtTimeline',
      width: 200,
      render: (text) => <div style={{ fontSize: '12px' }}>{text}</div>,
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 250,
      render: (text, record) => (
        <TextArea
          placeholder="Enter remarks"
          value={text}
          onChange={(e) => handleInputChange(record.key, 'remarks', e.target.value)}
          rows={1}
          style={{ resize: 'none' }}
        />
      ),
    },
    {
      title: 'Images',
      dataIndex: 'images',
      key: 'images',
      width: 150,
      render: (fileList, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Upload
            multiple
            beforeUpload={() => false} // Prevent automatic upload
            fileList={fileList}
            onChange={({ fileList }) => handleFileChange(record.key, fileList)}
            showUploadList={false} // Hide the file list preview
          >
            <Button icon={<UploadOutlined />} size="middle">
              Select Files
            </Button>
          </Upload>
          {fileList.length > 0 && (
            <span style={{ fontSize: '11px', color: '#666' }}>
              {fileList.length} file{fileList.length > 1 ? 's' : ''} selected
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => handleSubmitRow(record)}
            size="middle"
            disabled={!record.childRouting}
          >
            Submit
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      {contextHolder}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <Button
          size="small"
          onClick={() => navigate('/new-stores')}
          style={{ marginRight: 16 }}
          type="primary"
        >
          <RollbackOutlined />
        </Button>
        <Pageheading title="Store Checklist" marginBottom="-12px" />
      </div>
      <div style={{ padding: '24px' }}>
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          bordered
          scroll={{ x: 1200 }}
          size="small"
          rowKey="key"
        />
      </div>
    </>
  )
}

export default NewStoreRouting
