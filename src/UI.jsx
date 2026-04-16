import React, { useState } from 'react'
import {
  Card,
  Table,
  Button,
  DatePicker,
  Input,
  Space,
  Tag,
  Avatar,
  Typography,
  Row,
  Col,
  Badge,
  Dropdown,
  Modal,
  Form,
  Select,
  message,
  Tooltip,
  Divider,
} from 'antd'
import {
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MoreOutlined,
  EyeOutlined,
  HistoryOutlined,
  FilterOutlined,
  ExportOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

const UI = () => {
  const [searchText, setSearchText] = useState('')
  const [dateRange, setDateRange] = useState(null)
  const [selectedLeaveType, setSelectedLeaveType] = useState('all')
  const [detailsVisible, setDetailsVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)

  const leaveData = [
    {
      key: '1',
      id: 'V30619',
      name: 'RONEY WILSON',
      leaveType: 'Earned Leave',
      period: '2025-09-05',
      duration: 'Full Day',
      reason: 'Some urgent work at home',
      appliedOn: '2025-09-05',
      status: 'pending',
      avatar: null,
      department: 'Engineering',
      manager: 'John Smith',
    },
    {
      key: '2',
      id: 'V31698',
      name: 'AYISHA LODI',
      leaveType: 'Casual Leave',
      period: '2025-09-05',
      duration: 'First Half',
      reason: 'Emergency leave',
      appliedOn: '2025-09-05',
      status: 'pending',
      avatar: null,
      department: 'Marketing',
      manager: 'Sarah Johnson',
    },
    {
      key: '3',
      id: 'V25901',
      name: 'SUDARSHAN MAHANTY',
      leaveType: 'Earned Leave',
      period: '2025-09-07 - 2025-09-10',
      duration: 'Full Day',
      reason: 'Personal work',
      appliedOn: '2025-09-05',
      status: 'pending',
      avatar: null,
      department: 'Finance',
      manager: 'Mike Davis',
    },
  ]

  const getLeaveTypeColor = (type) => {
    const colors = {
      'Earned Leave': 'blue',
      'Casual Leave': 'green',
      'Sick Leave': 'orange',
      'Emergency Leave': 'red',
    }
    return colors[type] || 'default'
  }

  const getStatusColor = (status) => {
    const colors = {
      approved: 'success',
      rejected: 'error',
      pending: 'warning',
    }
    return colors[status] || 'default'
  }

  const handleApprove = (record) => {
    Modal.confirm({
      title: 'Approve Leave Request',
      content: `Are you sure you want to approve ${record.name}'s leave request?`,
      onOk: () => {
        message.success(`Leave request approved for ${record.name}`)
      },
    })
  }

  const handleReject = (record) => {
    Modal.confirm({
      title: 'Reject Leave Request',
      content: `Are you sure you want to reject ${record.name}'s leave request?`,
      onOk: () => {
        message.error(`Leave request rejected for ${record.name}`)
      },
    })
  }

  const showDetails = (record) => {
    setSelectedRecord(record)
    setDetailsVisible(true)
  }

  const menuItems = (record) => [
    {
      key: '1',
      icon: <EyeOutlined />,
      label: 'View Details',
      onClick: () => showDetails(record),
    },
    {
      key: '2',
      icon: <HistoryOutlined />,
      label: 'Leave History',
    },
  ]

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'employee',
      render: (text, record) => (
        <Space>
          <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }}>
            {text
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </Avatar>
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ID: {record.id}
            </Text>
          </div>
        </Space>
      ),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toLowerCase()) ||
        record.id.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Leave Details',
      key: 'leaveDetails',
      render: (_, record) => (
        <div>
          <Tag color={getLeaveTypeColor(record.leaveType)} style={{ marginBottom: 4 }}>
            {record.leaveType}
          </Tag>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Duration: {record.duration}
          </Text>
        </div>
      ),
    },
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      render: (text) => (
        <Space>
          <CalendarOutlined style={{ color: '#1890ff' }} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (text) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 150, display: 'block' }}>
            {text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Applied On',
      dataIndex: 'appliedOn',
      key: 'appliedOn',
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={getStatusColor(status)}
          text={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Approve">
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleApprove(record)}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            />
          </Tooltip>
          <Tooltip title="Reject">
            <Button
              danger
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => handleReject(record)}
            />
          </Tooltip>
          <Dropdown menu={{ items: menuItems(record) }} trigger={['click']} placement="bottomRight">
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ]

  const filteredData = leaveData.filter((item) => {
    if (selectedLeaveType !== 'all' && item.leaveType !== selectedLeaveType) {
      return false
    }
    return true
  })

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
          <Col>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              Leave Requests Management
            </Title>
            <Text type="secondary">Review and manage employee leave requests</Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<ExportOutlined />}>Export</Button>
              <Badge count={3} offset={[10, 0]}>
                <Button type="primary" icon={<FilterOutlined />}>
                  Filters
                </Button>
              </Badge>
            </Space>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Input
              placeholder="Search by name or ID..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={setDateRange}
              placeholder={['Start Date', 'End Date']}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by leave type"
              value={selectedLeaveType}
              onChange={setSelectedLeaveType}
            >
              <Option value="all">All Leave Types</Option>
              <Option value="Earned Leave">Earned Leave</Option>
              <Option value="Casual Leave">Casual Leave</Option>
              <Option value="Sick Leave">Sick Leave</Option>
              <Option value="Emergency Leave">Emergency Leave</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Badge status="warning" text={`${filteredData.length} Pending Requests`} />
              </Space>
            </Col>
            <Col>
              <Text type="secondary">Last updated: {new Date().toLocaleString()}</Text>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            pageSize: 100,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>

      <Modal
        title="Leave Request Details"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            Close
          </Button>,
          <Button
            key="reject"
            danger
            onClick={() => {
              handleReject(selectedRecord)
              setDetailsVisible(false)
            }}
          >
            Reject
          </Button>,
          <Button
            key="approve"
            type="primary"
            onClick={() => {
              handleApprove(selectedRecord)
              setDetailsVisible(false)
            }}
          >
            Approve
          </Button>,
        ]}
        width={600}
      >
        {selectedRecord && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Space size="large">
                  <Avatar size={60} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }}>
                    {selectedRecord.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </Avatar>
                  <div>
                    <Title level={4} style={{ margin: 0 }}>
                      {selectedRecord.name}
                    </Title>
                    <Text type="secondary">ID: {selectedRecord.id}</Text>
                    <br />
                    <Text type="secondary">Department: {selectedRecord.department}</Text>
                  </div>
                </Space>
              </Col>
            </Row>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Leave Type:</Text>
                <br />
                <Tag color={getLeaveTypeColor(selectedRecord.leaveType)}>
                  {selectedRecord.leaveType}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>Duration:</Text>
                <br />
                <Text>{selectedRecord.duration}</Text>
              </Col>
              <Col span={24}>
                <Text strong>Period:</Text>
                <br />
                <Text>{selectedRecord.period}</Text>
              </Col>
              <Col span={24}>
                <Text strong>Reason:</Text>
                <br />
                <Text>{selectedRecord.reason}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Applied On:</Text>
                <br />
                <Text>{selectedRecord.appliedOn}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Reporting Manager:</Text>
                <br />
                <Text>{selectedRecord.manager}</Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default UI
