import React, { useEffect, useMemo, useState, useCallback } from 'react' // ADD useCallback
import {
  Space,
  Table,
  Row,
  Col,
  Input,
  Tag,
  Tabs,
  Card,
  Grid,
  Pagination,
  Typography,
  Button,
} from 'antd' // ADD Button
import { PlusOutlined, MinusOutlined } from '@ant-design/icons' // ADD THIS LINE
import { ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../../../redux/uiSlice'
import Pageheading from '../../../components/shared/Pageheading'
import { fetchLeaveStatusList } from '../../../services/Services'
import useMediaQuery from '../../../hooks/useMediaQuery'

const { Search } = Input
const { useBreakpoint } = Grid
const { Text } = Typography

const EmployeeLeaveStatusList = () => {
  const screens = useBreakpoint()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  const [employeesListData, setEmployeesListData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('1')

  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)
  const { data: empData } = useSelector((state) => state.auth)

  const handleToggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchLeaveStatusList(empData?.employeeId)
      if (response.status === 200) {
        setEmployeesListData(response?.data || [])
      } else {
        setEmployeesListData([])
      }
    } catch (error) {
      console.error('Error fetching data:', error?.response?.data || error?.message)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Counts for tabs (not affected by search)
  const statusCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 }
    counts[1] = employeesListData.length
    counts[2] = employeesListData.filter((e) => e.statusName === 'Pending').length
    counts[3] = employeesListData.filter((e) => e.statusName === 'Approved').length
    counts[4] = employeesListData.filter((e) => e.statusName === 'Rejected').length
    return counts
  }, [employeesListData])

  // Filter by tab
  const tabFiltered = useMemo(() => {
    switch (activeTab) {
      case '2':
        return employeesListData.filter((e) => e.statusName === 'Pending')
      case '3':
        return employeesListData.filter((e) => e.statusName === 'Approved')
      case '4':
        return employeesListData.filter((e) => e.statusName === 'Rejected')
      default:
        return employeesListData
    }
  }, [employeesListData, activeTab])

  // Optional search filtering (local)
  const filteredData = useMemo(() => {
    if (!search?.trim()) return tabFiltered
    const q = search.toLowerCase()
    return tabFiltered.filter((r) => {
      const fields = [
        r?.leaveTypeName,
        r?.reason,
        r?.remarks,
        r?.relieverName,
        r?.relieverEcode,
        r?.statusName,
        r?.startDate,
        r?.endDate,
      ]
      return fields.map((v) => String(v ?? '').toLowerCase()).some((txt) => txt.includes(q))
    })
  }, [tabFiltered, search])

  // Tab change
  const handleTabChange = (key) => {
    setActiveTab(key)
    setCurrentPage(1)
  }

  // Base columns
  const baseColumns = [
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      ellipsis: true,
      render: (date) => (date === null ? '-' : String(date).split('T')[0]),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      ellipsis: true,
      render: (date) => (date === null ? '-' : String(date).split('T')[0]),
    },
    // {
    //   title: 'Leave Type',
    //   dataIndex: 'leaveTypeName',
    //   key: 'leaveTypeName',
    //   width: 140,
    //   ellipsis: true,
    //   render: (value) => (String(value ?? '').trim() === '' ? '-' : value),
    // },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: 180,
      ellipsis: true,
      render: (value) => (String(value ?? '').trim() === '' ? '-' : value),
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 180,
      ellipsis: true,
      render: (value) => (String(value ?? '').trim() === '' ? '-' : value),
    },
  ]

  // Reliever columns
  const relieverColumn = [
    {
      title: 'Reliever Name',
      dataIndex: 'relieverName',
      key: 'relieverName',
      width: 160,
      ellipsis: true,
      render: (value) => (String(value ?? '').trim() === '' ? '-' : value),
    },
    {
      title: 'Reliever E-Code',
      dataIndex: 'relieverEcode',
      key: 'relieverEcode',
      width: 160,
      ellipsis: true,
      render: (value) => (String(value ?? '').trim() === '' ? '-' : value),
    },
  ]

  // Status column
  const statusColumn = {
    title: 'Status',
    dataIndex: 'statusName',
    key: 'statusName',
    width: 120,
    ellipsis: true,
    render: (status) => {
      const color =
        status === 'Pending'
          ? 'gold'
          : status === 'Approved'
            ? 'blue'
            : status === 'Rejected'
              ? 'red'
              : 'purple'
      return <Tag color={color}>{status}</Tag>
    },
  }

  const getRelieverPosition = (tabKey) => {
    // Position after "Remarks" for All & Approved
    switch (tabKey) {
      case '1': // All
      case '3': // Approved
        return 5
      default:
        return -1 // don't insert
    }
  }

  // Desktop columns (with conditional reliever)
  const columns = useMemo(() => {
    const cols = [...baseColumns]
    const pos = getRelieverPosition(activeTab)
    if (pos >= 0) cols.splice(pos, 0, ...relieverColumn)
    cols.push(statusColumn)
    return cols
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  // Pagination slice for mobile cards
  const startIdx = (currentPage - 1) * pageSize
  const endIdx = startIdx + pageSize
  const mobilePageData = filteredData.slice(startIdx, endIdx)

  // Helper: show reliever info on mobile only when needed (All/Approved)
  const showReliever = activeTab === '1' || activeTab === '3'

  const renderMobileCard = (item, idx) => {
    const sd = item?.startDate ? String(item.startDate).split('T')[0] : '-'
    const ed = item?.endDate ? String(item.endDate).split('T')[0] : '-'
    const reason = String(item?.reason ?? '').trim() || '-'
    const remarks = String(item?.remarks ?? '').trim() || '-'
    const status = item?.statusName
    const color =
      status === 'Pending'
        ? 'gold'
        : status === 'Approved'
          ? 'blue'
          : status === 'Rejected'
            ? 'red'
            : 'purple'

    return (
      <Card
        key={item?.leaveRequestId || item?.id || `${sd}-${ed}-${idx}`}
        size="small"
        style={{ borderRadius: 8 }}
        bodyStyle={{ padding: 12 }}
      >
        <Row gutter={[8, 8]}>
          <Col xs={12}>
            <Text type="secondary">Start</Text>
            <div>{sd}</div>
          </Col>
          <Col xs={12}>
            <Text type="secondary">End</Text>
            <div>{ed}</div>
          </Col>
          <Col xs={12}>
            <Text type="secondary">Leave Type</Text>
            <div>{item?.leaveTypeName || '-'}</div>
          </Col>
          <Col xs={12}>
            <Text type="secondary">Status</Text>
            <div>
              <Tag color={color}>{status}</Tag>
            </div>
          </Col>
          <Col xs={24}>
            <Text type="secondary">Reason</Text>
            <div>{reason}</div>
          </Col>
          <Col xs={24}>
            <Text type="secondary">Remarks</Text>
            <div>{remarks}</div>
          </Col>

          {showReliever && (
            <>
              <Col xs={12}>
                <Text type="secondary">Reliever</Text>
                <div>{item?.relieverName || '-'}</div>
              </Col>
              <Col xs={12}>
                <Text type="secondary">Reliever E-Code</Text>
                <div>{item?.relieverEcode || '-'}</div>
              </Col>
            </>
          )}
        </Row>
      </Card>
    )
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />
      <div className="def" style={{ paddingBottom: 10 }}>
        {/* Header + Actions */}
        <Row gutter={[8, 8]} align="middle" justify="space-between" style={{ marginBottom: 8 }}>
          <Col xs={24} sm={12}>
            <Pageheading title="Leaves Status" />
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: isMobile ? 'left' : 'right' }}>
            <Search
              placeholder="Search…"
              allowClear
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              style={{ width: isMobile ? '100%' : 300 }}
              size={isMobile ? 'middle' : 'large'}
            />
          </Col>
        </Row>

        <Space direction="vertical" style={{ display: 'block', marginBottom: 8 }}>
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={[
              { key: '1', label: `All (${statusCounts[1]})` },
              { key: '2', label: `Pending (${statusCounts[2]})` },
              { key: '3', label: `Approved (${statusCounts[3]})` },
              { key: '4', label: `Rejected (${statusCounts[4]})` },
            ]}
          />
        </Space>

        {/* Desktop: Table; Mobile: Card list */}
        {!isMobile ? (
          <Table
            rowKey={(record, idx) => record?.leaveRequestId || record?.id || idx}
            columns={columns}
            dataSource={filteredData}
            pagination={{
              current: currentPage,
              total: filteredData.length,
              pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: handleTableChange,
              position: ['bottomRight'],
            }}
            bordered
            size="middle"
            scroll={{ x: 'max-content', y: 'calc(100vh - 200px)' }}
            className={theme === 'dark' ? 'dark-theme' : ''}
          />
        ) : (
          <div>
            <div
              style={{
                backgroundColor: '#fafafa',
                borderRadius: '8px 8px 0 0',
                border: '1px solid #d9d9d9',
                borderBottom: '2px solid #1890ff',
                position: 'sticky',
                top: 0,
                zIndex: 100,
              }}
            >
              <table
                style={{
                  width: '100%',
                  tableLayout: 'fixed',
                  borderCollapse: 'collapse',
                  fontSize: 11,
                }}
              >
                <colgroup>
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Start Date
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      End Date
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Leave Type
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Status
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Action
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            {mobilePageData.map((record, idx) => {
              const recordId = record?.leaveRequestId || record?.id || `${record.startDate}-${idx}`
              const isExpanded = expandedCards[recordId]
              const sd = record?.startDate ? String(record.startDate).split('T')[0] : '-'
              const ed = record?.endDate ? String(record.endDate).split('T')[0] : '-'
              const status = record?.statusName
              const color =
                status === 'Pending'
                  ? 'gold'
                  : status === 'Approved'
                    ? 'blue'
                    : status === 'Rejected'
                      ? 'red'
                      : 'purple'

              return (
                <div
                  key={recordId}
                  style={{ border: '1px solid #d9d9d9', borderTop: 'none', background: '#fff' }}
                >
                  <table
                    style={{
                      width: '100%',
                      tableLayout: 'fixed',
                      borderCollapse: 'collapse',
                      fontSize: 11,
                    }}
                  >
                    <colgroup>
                      <colgroup>
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '20%' }} />
                      </colgroup>
                    </colgroup>
                    <tbody>
                      <tr>
                        <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: 10 }}>
                          {sd}
                        </td>
                        <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: 10 }}>
                          {ed}
                        </td>
                        <td
                          style={{
                            padding: '8px 4px',
                            textAlign: 'center',
                            fontSize: 9,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {record?.leaveTypeName || '-'}
                        </td>
                        <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: 10 }}>
                          <Tag color={color} style={{ fontSize: 8, padding: '0 4px' }}>
                            {status}
                          </Tag>
                        </td>
                        <td
                          style={{
                            padding: '8px 4px',
                            textAlign: 'center',
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Button
                            type="text"
                            size="small"
                            icon={isExpanded ? <MinusOutlined /> : <PlusOutlined />}
                            onClick={() => handleToggleCard(recordId)}
                            style={{ padding: '2px 4px', fontSize: 10 }}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {isExpanded && (
                    <div
                      style={{
                        padding: 8,
                        background: '#fafafa',
                        borderTop: '1px solid #e8e8e8',
                        fontSize: 10,
                      }}
                    >
                      <Row gutter={[4, 6]}>
                        {/* Single Row - Reason, Remarks, Reliever Name, Reliever E-Code */}
                        <Col span={showReliever ? 6 : 12}>
                          <div
                            style={{
                              color: '#8c8c8c',
                              marginBottom: 2,
                              fontSize: 9,
                              textAlign: 'center',
                            }}
                          >
                            Reason
                          </div>
                          <div
                            style={{
                              fontWeight: 500,
                              fontSize: 9,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              textAlign: 'center',
                            }}
                          >
                            {record?.reason || '-'}
                          </div>
                        </Col>
                        <Col span={showReliever ? 6 : 12}>
                          <div
                            style={{
                              color: '#8c8c8c',
                              marginBottom: 2,
                              fontSize: 9,
                              textAlign: 'center',
                            }}
                          >
                            Remarks
                          </div>
                          <div
                            style={{
                              fontWeight: 500,
                              fontSize: 9,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              textAlign: 'center',
                            }}
                          >
                            {record?.remarks || '-'}
                          </div>
                        </Col>

                        {/* Reliever info (conditionally shown) */}
                        {showReliever && (
                          <>
                            <Col span={6}>
                              <div
                                style={{
                                  color: '#8c8c8c',
                                  marginBottom: 2,
                                  fontSize: 9,
                                  textAlign: 'center',
                                }}
                              >
                                Reliever Name
                              </div>
                              <div
                                style={{
                                  fontWeight: 500,
                                  fontSize: 9,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  textAlign: 'center',
                                }}
                              >
                                {record?.relieverName || '-'}
                              </div>
                            </Col>
                            <Col span={6}>
                              <div
                                style={{
                                  color: '#8c8c8c',
                                  marginBottom: 2,
                                  fontSize: 9,
                                  textAlign: 'center',
                                }}
                              >
                                Reliever E-Code
                              </div>
                              <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
                                {record?.relieverEcode || '-'}
                              </div>
                            </Col>
                          </>
                        )}
                      </Row>
                    </div>
                  )}
                </div>
              )
            })}

            <div
              style={{
                marginTop: 16,
                textAlign: 'center',
                padding: 12,
                background: '#fafafa',
                border: '1px solid #d9d9d9',
                borderRadius: 4,
              }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ fontSize: 12 }}>
                  Showing {startIdx + 1} - {Math.min(endIdx, filteredData.length)} of{' '}
                  {filteredData.length} items
                </div>
                <Space>
                  <Button
                    size="small"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span style={{ fontSize: 12 }}>
                    Page {currentPage} of {Math.ceil(filteredData.length / pageSize)}
                  </span>
                  <Button
                    size="small"
                    disabled={currentPage >= Math.ceil(filteredData.length / pageSize)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </Space>
              </Space>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default EmployeeLeaveStatusList
