import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Card,
  Typography,
  Spin,
  Modal,
  Carousel,
  Image,
  message,
  Tag,
  Empty,
  Input,
} from 'antd'
import {
  EyeOutlined,
  RollbackOutlined,
  DownloadOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  FileOutlined,
} from '@ant-design/icons'
import Pageheading from '../components/shared/Pageheading'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../services/axiosInstance'

const { Text, Title } = Typography
const { Search } = Input

const StoreChecklistView = () => {
  const navigate = useNavigate()
  const { locationId } = useParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [dataSource, setDataSource] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [attachmentModal, setAttachmentModal] = useState({
    visible: false,
    attachments: [],
    title: '',
  })

  // Sample data for testing
  //   const sampleData = [
  //     {
  //       key: 1,
  //       storeRoutingMasterId: 1,
  //       parentRouting: 'MANPOWER PLANNING',
  //       childRouting: 'RECRUITMENT ALIGN WITH STORE BUSINESS PLAN',
  //       bgtTimeline: '75 Days before Store Opening',
  //       remarks: 'Completed initial planning phase with HR team',
  //       attachments: [
  //         {
  //           id: 1,
  //           name: 'business-plan.jpg',
  //           url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=400&fit=crop',
  //           fileName: 'business-plan.jpg',
  //         },
  //         {
  //           id: 2,
  //           name: 'recruitment-doc.pdf',
  //           url: 'https://www.example.com/sample.pdf',
  //           fileName: 'recruitment-doc.pdf',
  //         },
  //       ],
  //       actionDate: '2024-01-15T10:30:00Z',
  //       actionById: 'user123',
  //       transactionId: 'TXN001',
  //     },
  //     {
  //       key: 2,
  //       storeRoutingMasterId: 2,
  //       parentRouting: 'MANPOWER PLANNING',
  //       childRouting: 'DEFINE STORE SEAT MASTER',
  //       bgtTimeline: '75 Days before Store Opening',
  //       remarks: 'Store seating plan finalized and approved',
  //       attachments: [
  //         {
  //           id: 3,
  //           name: 'store-layout.jpg',
  //           url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=400&fit=crop',
  //           fileName: 'store-layout.jpg',
  //         },
  //       ],
  //       actionDate: '2024-01-16T14:20:00Z',
  //       actionById: 'user456',
  //       transactionId: 'TXN002',
  //     },
  //     {
  //       key: 3,
  //       storeRoutingMasterId: 3,
  //       parentRouting: 'JOB REQUISITION APPROVAL',
  //       childRouting: 'CONFIRM STORE HEADCOUNT PLAN',
  //       bgtTimeline: '70 Days before Store Opening',
  //       remarks: 'Headcount approved for all departments',
  //       attachments: [
  //         {
  //           id: 4,
  //           name: 'headcount-video.mp4',
  //           url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  //           fileName: 'headcount-video.mp4',
  //         },
  //         {
  //           id: 5,
  //           name: 'approval-letter.docx',
  //           url: 'https://www.example.com/approval.docx',
  //           fileName: 'approval-letter.docx',
  //         },
  //       ],
  //       actionDate: '2024-01-18T09:15:00Z',
  //       actionById: 'user789',
  //       transactionId: 'TXN003',
  //     },
  //     {
  //       key: 4,
  //       storeRoutingMasterId: 4,
  //       parentRouting: 'APPLICATION SCREENING',
  //       childRouting: 'COLLECT APPLICATIONS',
  //       bgtTimeline: '60 Days before Store Opening',
  //       remarks: 'Collected 150+ applications for various positions',
  //       attachments: [
  //         {
  //           id: 6,
  //           name: 'applications-summary.png',
  //           url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&h=400&fit=crop',
  //           fileName: 'applications-summary.png',
  //         },
  //       ],
  //       actionDate: '2024-01-20T11:45:00Z',
  //       actionById: 'user101',
  //       transactionId: 'TXN004',
  //     },
  //     {
  //       key: 5,
  //       storeRoutingMasterId: 5,
  //       parentRouting: 'INITIAL INTERVIEW (PHONE/VIRTUAL)',
  //       childRouting: 'SCHEDULE INTERVIEW WITH SHORTLISTED CANDIDATES',
  //       bgtTimeline: '55 Days before Store Opening',
  //       remarks: 'Scheduled interviews for 45 shortlisted candidates',
  //       attachments: [
  //         {
  //           id: 7,
  //           name: 'interview-schedule.xlsx',
  //           url: 'https://www.example.com/schedule.xlsx',
  //           fileName: 'interview-schedule.xlsx',
  //         },
  //         {
  //           id: 8,
  //           name: 'candidate-photos.jpg',
  //           url: 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=500&h=400&fit=crop',
  //           fileName: 'candidate-photos.jpg',
  //         },
  //       ],
  //       actionDate: '2024-01-22T16:30:00Z',
  //       actionById: 'user202',
  //       transactionId: 'TXN005',
  //     },
  //     {
  //       key: 6,
  //       storeRoutingMasterId: 6,
  //       parentRouting: 'IN-PERSON INTERVIEW',
  //       childRouting: 'PREPARE INTERVIEW PANEL AND QUESTIONS',
  //       bgtTimeline: '50 Days before Store Opening',
  //       remarks: null,
  //       attachments: [],
  //       actionDate: '2024-01-25T08:00:00Z',
  //       actionById: 'user303',
  //       transactionId: 'TXN006',
  //     },
  //   ]

  // Simulate loading and set sample data
  //   useEffect(() => {
  //     setLoading(true)
  //     // Simulate API call delay
  //     setTimeout(() => {
  //       setDataSource(sampleData)
  //       setLoading(false)
  //     }, 1000)
  //   }, [])

  //   Commented out API code for future use
  const fetchRouting = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(
        `/api/StoreRouting/GetStoreRoutingsByLocationId/${parseInt(locationId)}`,
      )
      //   console.log('Routing data fetched:', response)

      if (response.status === 200) {
        setDataSource(response?.data?.details || [])
      } else {
        setDataSource([])
      }

      // Filter only completed items (items with data)
      //   const completedItems = response.filter(
      //     (item) =>
      //       item.remarks || (item.attachments && item.attachments.length > 0) || item.actionDate,
      //   )

      //   setDataSource(
      //     completedItems.map((item, index) => ({
      //       key: index + 1,
      //       storeRoutingMasterId: item.storeRoutingMasterId,
      //       parentRouting: item.stagingName,
      //       childRouting: item.routingName,
      //       bgtTimeline: item.bgtTimeline,
      //       remarks: item.remarks,
      //       attachments: item.attachments || [],
      //       actionDate: item.actionDate,
      //       actionById: item.actionById,
      //       transactionId: item.transactionId,
      //     })),
      //   )
    } catch (error) {
      console.error('Error fetching routing data:', error)
      message.error('Failed to fetch routing data')
    } finally {
      setLoading(false)
    }
  }

  //   Load data on component mount
  useEffect(() => {
    fetchRouting()
  }, [locationId])

  // Handle view attachments
  const handleViewAttachments = (record) => {
    // console.log('record: ', record)
    if (!record.attachments || record.attachments.length === 0) {
      message.info('No attachments available for this item')
      return
    }

    setAttachmentModal({
      visible: true,
      attachments: record.attachments,
      title: `${record.routingName}`,
    })
  }

  // Close attachment modal
  const handleCloseModal = () => {
    setAttachmentModal({
      visible: false,
      attachments: [],
      title: '',
    })
  }

  // Get file type for preview
  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase()

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return 'image'
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)) {
      return 'video'
    } else {
      return 'other'
    }
  }

  // Handle file download
  const handleDownload = (file) => {
    const baseUrl = import.meta.env.VITE_API_URL

    // console.log('file: ', file)
    // Create a download link
    const link = document.createElement('a')
    // link.href = file.url || file.src
    link.href = `${baseUrl}/${file.attachment}`
    link.download = file.name || 'download'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Render attachment content
  const renderAttachmentContent = (attachment) => {
    const fileType = getFileType(attachment.name || attachment.fileName || '')
    const baseUrl = import.meta.env.VITE_API_URL

    switch (fileType) {
      case 'image':
        return (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Image
              src={`${baseUrl}/attachment.url` || attachment.src}
              alt={attachment.name || 'Image'}
              style={{ maxWidth: '100%', maxHeight: '400px' }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />

            <div style={{ marginTop: '16px' }}>
              <Button icon={<DownloadOutlined />} onClick={() => handleDownload(attachment)}>
                Download
              </Button>
            </div>
          </div>
        )

      case 'video':
        return (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <video
              controls
              style={{ maxWidth: '100%', maxHeight: '400px' }}
              src={attachment.url || attachment.src}
            >
              Your browser does not support the video tag.
            </video>
            <div style={{ marginTop: '16px' }}>
              <Button icon={<DownloadOutlined />} onClick={() => handleDownload(attachment)}>
                Download
              </Button>
            </div>
          </div>
        )

      default:
        return (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <FileOutlined style={{ fontSize: '64px', color: '#ccc', marginBottom: '16px' }} />
            <div style={{ marginBottom: '16px' }}>
              <Text type="secondary">No preview available</Text>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>{attachment.name || attachment.fileName || 'Unknown file'}</Text>
            </div>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(attachment)}
            >
              Download File
            </Button>
          </div>
        )
    }
  }

  const columns = [
    {
      title: 'Parent Routing',
      dataIndex: 'stagingName',
      key: 'stagingName',
      width: 200,
    },
    {
      title: 'Child Routing',
      dataIndex: 'routingName',
      key: 'routingName',
      width: 300,
    },
    {
      title: 'BGT Timeline',
      dataIndex: 'bgtTimeline',
      key: 'bgtTimeline',
      width: 200,
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 250,
      render: (text) => (
        <div style={{ fontSize: '12px', maxWidth: '250px', wordWrap: 'break-word' }}>
          {text || <Text type="secondary">No remarks</Text>}
        </div>
      ),
    },
    {
      title: 'Attachments',
      dataIndex: 'attachments',
      key: 'attachments',
      width: 150,
      render: (attachments, record) => (
        <div style={{ textAlign: 'center' }}>
          {attachments && attachments.length > 0 ? (
            <div>
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => handleViewAttachments(record)}
                size="small"
              >
                View ({attachments.length})
              </Button>
              {/* <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                {attachments.map((att) => {
                  const fileType = getFileType(att.name || att.fileName || '')
                  return (
                    <Tag
                      key={att.id || att.name}
                      size="small"
                      color={
                        fileType === 'image' ? 'blue' : fileType === 'video' ? 'green' : 'default'
                      }
                      style={{ margin: '1px' }}
                    >
                      {fileType === 'image' ? (
                        <FileImageOutlined />
                      ) : fileType === 'video' ? (
                        <VideoCameraOutlined />
                      ) : (
                        <FileOutlined />
                      )}
                    </Tag>
                  )
                })}
              </div> */}
            </div>
          ) : (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              No attachments
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Action Date',
      dataIndex: 'actionDate',
      key: 'actionDate',
      width: 150,
      render: (text) => (
        <div style={{ fontSize: '11px' }}>
          {text ? String(text).split('T')[0] : <Text type="secondary">-</Text>}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const name = status === 'Completed' ? 'green' : 'Pending' ? 'yellow' : 'red'
        return <Tag color={name}>{status}</Tag>
      },
    },
  ]

  useEffect(() => {
    const lowerTrimmedSearch = String(searchTerm).trim().toLowerCase()

    if (lowerTrimmedSearch.length === 0) {
      setFilteredData(dataSource)
    } else {
      const filtered = dataSource.filter((item) =>
        Object.values(item).some((value) =>
          String(value).trim().toLowerCase().includes(lowerTrimmedSearch),
        ),
      )

      setFilteredData(filtered)
    }
  }, [searchTerm, dataSource])

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <Button
          size="small"
          onClick={() => navigate('/new-stores')}
          style={{ marginRight: 16 }}
          type="primary"
        >
          <RollbackOutlined />
        </Button>
        <Pageheading title="Store Checklist - View" marginBottom="-12px" />
      </div>

      <div style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Loading checklist data...</div>
          </div>
        ) : (
          <>
            <Space
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%',
                marginBottom: '10px',
              }}
            >
              <Search
                allowClear
                style={{ width: '20rem' }}
                placeholder="Search in table..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Space>
            <Table
              dataSource={filteredData}
              columns={columns}
              pagination={{
                pageSize: 100,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              }}
              bordered
              scroll={{ x: 1200 }}
              size="small"
              rowKey="key"
              locale={{
                emptyText: (
                  <Empty
                    description="No completed checklist items found"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
            />
          </>
        )}
      </div>

      {/* Attachment Modal */}
      <Modal
        // title={
        //   <div>
        //     <EyeOutlined style={{ marginRight: '8px' }} />
        //     Attachments - {attachmentModal.title}
        //   </div>
        // }
        open={attachmentModal.visible}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
        centered
      >
        {attachmentModal.attachments.length > 0 ? (
          <Carousel
            dots={true}
            arrows={true}
            infinite={false}
            style={{ background: '#f5f5f5', borderRadius: '8px' }}
          >
            {attachmentModal.attachments.map((attachment, index) => (
              <div key={index}>
                {renderAttachmentContent(attachment)}
                <div style={{ textAlign: 'center', padding: '16px', background: '#fff' }}>
                  <Text strong>
                    {attachment.name || attachment.fileName || `File ${index + 1}`}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {index + 1} of {attachmentModal.attachments.length}
                  </Text>
                </div>
              </div>
            ))}
          </Carousel>
        ) : (
          <Empty description="No attachments to display" />
        )}
      </Modal>
    </>
  )
}

export default StoreChecklistView
