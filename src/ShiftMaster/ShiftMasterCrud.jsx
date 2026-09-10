import {
  message,
  Space,
  Table,
  Input,
  Button,
  Popconfirm,
  Checkbox,
  Tag,
  Switch,
  Card,
  Descriptions,
  Empty,
  Skeleton,
  Typography,
  Alert,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { deleteShift, GetAllShifts, toggleShift, getShiftTimingHistory } from '../services/Services'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  HistoryOutlined,
} from '@ant-design/icons'
import AddShiftModal from './AddShiftModal'
import BulkAssignShiftModal from './BulkAssignShiftModal'
import UpdateShiftTimingDrawer from './UpdateShiftTimingDrawer'
import dayjs from 'dayjs'

const { Search } = Input
const { Text } = Typography

const fmtDate = (v) => (v && dayjs(v).isValid() ? dayjs(v).format('DD MMM YYYY') : '-')
const fmtTime = (v) => (v ? String(v).slice(0, 5) : '-')

const statusTag = (v) => {
  const val = String(v || '').toLowerCase()
  if (val === 'current') return <Tag color="green">Current</Tag>
  if (val === 'future') return <Tag color="blue">Future</Tag>
  if (val === 'past') return <Tag color="default">Past</Tag>
  return '-'
}

const ShiftMasterCrud = () => {
  const [shifts, setShifts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isShiftsLoading, setIsShiftsLoading] = useState(false)
  const [isShiftDeleting, setIsShiftDeleting] = useState(false)
  const [deletingShiftId, setDeletingShiftId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingShift, setEditingShift] = useState(null)
  const [isStatusToggling, setIsStatusToggling] = useState(false)
  const [togglingShiftId, setTogglingShiftId] = useState(null)
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false)

  // detail panel: the shift whose timing + history is on screen
  const [selectedShiftId, setSelectedShiftId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [isTimingDrawerOpen, setIsTimingDrawerOpen] = useState(false)

  const fetchData = async () => {
    try {
      setIsShiftsLoading(true)

      const response = await GetAllShifts()

      if (response.status === 200) {
        const apiData = response.data?.data || []
        setShifts(apiData)
      }
    } catch (error) {
      console.error('shift api error:', error)
      message.error(error?.response?.data?.message || 'Error in fetching data')
    } finally {
      setIsShiftsLoading(false)
    }
  }

  const fetchDetail = async (shiftID) => {
    if (!shiftID) return

    try {
      setIsDetailLoading(true)
      setDetailError('')

      const response = await getShiftTimingHistory(shiftID)

      if (response.status === 200) {
        setDetail(response.data?.data || null)
      }
    } catch (error) {
      setDetail(null)
      setDetailError(error?.response?.data?.message || "Unable to load this shift's timing history")
    } finally {
      setIsDetailLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedShiftId) fetchDetail(selectedShiftId)
  }, [selectedShiftId])

  // keep both views in step after a create/edit/toggle
  const refreshAll = async () => {
    await fetchData()
    if (selectedShiftId) await fetchDetail(selectedShiftId)
  }

  let filteredData = useMemo(() => {
    let q = searchTerm.toLowerCase().trim()

    if (!q) return shifts

    return shifts.filter((shift) => {
      return (
        shift?.shiftName?.trim()?.toLowerCase()?.includes(q) ||
        shift.startTime?.toLowerCase().includes(q) ||
        shift.endTime?.toLowerCase().includes(q) ||
        // match what the effective columns actually show, e.g. "10 sep 2026"
        (shift?.effectiveFrom
          ? dayjs(shift.effectiveFrom).format('DD MMM YYYY').toLowerCase().includes(q)
          : false) ||
        (shift?.effectiveTo
          ? dayjs(shift.effectiveTo).format('DD MMM YYYY').toLowerCase().includes(q)
          : 'open ended'.includes(q)) ||
        (shift?.isActive ? 'active' : 'inactive') === q
      )
    })
  }, [searchTerm, shifts])

  const handleDeleteShift = async (shiftID) => {
    if (typeof shiftID !== 'number') {
      message.error('Invalid operation!')
      return false
    }

    try {
      setIsShiftDeleting(true)
      setDeletingShiftId(shiftID)

      const response = await deleteShift(shiftID)

      if (response.status === 200) {
        message.success(response.data?.message || 'Shift deleted successfully')

        const filtered = shifts.filter((shift) => shift.shiftID !== shiftID)
        setShifts(filtered)

        // the detail panel was showing the shift that just went away
        if (selectedShiftId === shiftID) {
          setSelectedShiftId(null)
          setDetail(null)
        }
      }
    } catch (error) {
      console.error('Error deleting shift:', error)
      message.error(error?.response?.data?.message || 'Unable to delete shift!')
    } finally {
      setIsShiftDeleting(false)
      setDeletingShiftId(null)
    }
  }

  const handleToggleStatus = async (shiftID) => {
    if (typeof shiftID !== 'number') {
      message.error('Invalid operation!')
      return false
    }

    try {
      setIsStatusToggling(true)
      setTogglingShiftId(shiftID)

      const response = await toggleShift(shiftID)

      if (response.status === 200) {
        message.success(response.data?.message)
        setShifts((prev) =>
          prev.map((shift) =>
            shift?.shiftID === shiftID ? { ...shift, isActive: !shift?.isActive } : shift,
          ),
        )

        // keep the Status shown in the detail panel in step
        if (selectedShiftId === shiftID) await fetchDetail(shiftID)
      }
    } catch (error) {
      console.error('Error updating shift status:', error)
      message.error(error?.response?.data?.message || 'Unable to update status!')
    } finally {
      setIsStatusToggling(false)
      setTogglingShiftId(null)
    }
  }

  // detail payload: { shift, timingHistory }
  const currentShift = detail?.shift ?? null
  const timingHistory = Array.isArray(detail?.timingHistory) ? detail.timingHistory : []

  const historyColumns = useMemo(
    () => [
      {
        title: 'Effective From',
        dataIndex: 'effectiveFrom',
        key: 'effectiveFrom',
        width: 130,
        render: fmtDate,
      },
      {
        title: 'Effective To',
        dataIndex: 'effectiveTo',
        key: 'effectiveTo',
        width: 130,
        render: (v) => (v ? fmtDate(v) : 'Open ended'),
      },
      { title: 'Start', dataIndex: 'startTime', key: 'startTime', width: 90, render: fmtTime },
      { title: 'End', dataIndex: 'endTime', key: 'endTime', width: 90, render: fmtTime },
      {
        title: 'Shift Status',
        dataIndex: 'shiftStatus',
        key: 'shiftStatus',
        width: 110,
        render: statusTag,
      },
      {
        title: 'Change',
        dataIndex: 'changeType',
        key: 'changeType',
        width: 100,
        render: (v) => v || '-',
      },
      {
        title: 'Changed On',
        dataIndex: 'changedOn',
        key: 'changedOn',
        width: 130,
        render: fmtDate,
      },
      {
        title: 'Changed By',
        dataIndex: 'changedBy',
        key: 'changedBy',
        width: 120,
        ellipsis: true,
        render: (v) => v || '-',
      },
      {
        title: 'Remarks',
        dataIndex: 'remarks',
        key: 'remarks',
        width: 240,
        ellipsis: true,
        render: (v) => v || '-',
      },
    ],
    [],
  )

  const columns = useMemo(() => {
    return [
      {
        title: 'Shift Name',
        dataIndex: 'shiftName',
        key: 'shiftName',
        width: 140,
        ellipsis: true,
      },
      {
        title: 'Start Time',
        dataIndex: 'startTime',
        key: 'startTime',
        width: 100,
        ellipsis: true,
        render: fmtTime,
      },
      {
        title: 'End Time',
        dataIndex: 'endTime',
        key: 'endTime',
        width: 100,
        ellipsis: true,
        render: fmtTime,
      },
      {
        title: 'Effective From',
        dataIndex: 'effectiveFrom',
        key: 'effectiveFrom',
        width: 120,
        ellipsis: true,
        render: fmtDate,
      },
      {
        title: 'Effective To',
        dataIndex: 'effectiveTo',
        key: 'effectiveTo',
        width: 120,
        ellipsis: true,
        // blank means the shift has no end date, same as Emp Shift Alignment
        render: (value) => (value ? fmtDate(value) : 'Open ended'),
      },
      {
        title: 'Status',
        dataIndex: 'isActive',
        key: 'isActive',
        width: 90,
        ellipsis: true,
        render: (isActive) => {
          return (
            <Space>
              <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag>
            </Space>
          )
        },
      },
      {
        title: 'Actions',
        dataIndex: 'actions',
        key: 'actions',
        width: 100,
        render: (_, record) => {
          const { isActive } = record
          const isLoading = deletingShiftId === record?.shiftID
          const rowLoading = isStatusToggling && togglingShiftId === record.shiftID

          return (
            <Space style={{ gap: '1rem' }}>
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setEditingShift(record)
                  setIsModalOpen(true)
                }}
                loading={isLoading}
              />

              <Popconfirm
                title="Delete shift"
                description="Are you sure to delete this shift?"
                onConfirm={() => handleDeleteShift(record?.shiftID)}
                okText="Delete"
                cancelText="Cancel"
                disabled={isLoading}
              >
                <Button icon={<DeleteOutlined />} danger loading={isLoading} />
              </Popconfirm>

              <Popconfirm
                title={isActive ? 'Deactivate shift?' : 'Activate shift?'}
                description={`Are you sure you want to ${
                  isActive ? 'deactivate' : 'activate'
                } this shift?`}
                onConfirm={() => handleToggleStatus(record.shiftID)}
                okText="Yes"
                cancelText="No"
              >
                {/* prevent immediate visual toggle; change only after API success */}
                <Switch
                  checked={isActive}
                  loading={rowLoading}
                  onClick={(e) => e.preventDefault()}
                />
              </Popconfirm>
            </Space>
          )
        },
      },
    ]
  }, [shifts])

  const totalWidth = columns.reduce((acc, item) => acc + item.width, 0)

  return (
    <>
      {/* Add Shift Modal */}
      <AddShiftModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        refreshData={refreshAll}
        editingShift={editingShift}
      />

      <BulkAssignShiftModal
        isOpen={isBulkAssignOpen}
        setIsOpen={setIsBulkAssignOpen}
        refreshShifts={fetchData}
      />

      <Space
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'end',
          marginBottom: '0.6rem',
        }}
      >
        <Button icon={<TeamOutlined />} type="primary" onClick={() => setIsBulkAssignOpen(true)}>
          Bulk Assign Employees
        </Button>

        <Button
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingShift(null)
            setIsModalOpen(true)
          }}
        >
          Add New
        </Button>

        <Search
          allowClear
          placeholder="Search in table"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Space>

      <Table
        rowKey="shiftID"
        loading={isShiftsLoading}
        dataSource={filteredData}
        columns={columns}
        pagination={{ pageSize: 100 }}
        scroll={{ x: totalWidth, y: 340 }}
        // clicking a row opens the detail panel below, the way Emp Shift
        // Alignment shows one subject at a time
        onRow={(record) => ({
          onClick: () => setSelectedShiftId(record?.shiftID ?? null),
          style: { cursor: 'pointer' },
        })}
        rowClassName={(record) =>
          record?.shiftID === selectedShiftId ? 'ant-table-row-selected' : ''
        }
      />

      {/* ---------------- detail panel ---------------- */}
      <div style={{ marginTop: '1rem' }}>
        {!selectedShiftId ? (
          <Card size="small">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Select a shift above to see its timing and history"
            />
          </Card>
        ) : (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {detailError ? <Alert type="error" showIcon message={detailError} /> : null}

            <Card
              size="small"
              title={
                <Space>
                  <ClockCircleOutlined />
                  <span>Shift Info</span>
                  {currentShift?.shiftName ? <Text strong>— {currentShift.shiftName}</Text> : null}
                </Space>
              }
              extra={
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchDetail(selectedShiftId)}
                    disabled={isDetailLoading}
                  >
                    Refresh
                  </Button>

                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => setIsTimingDrawerOpen(true)}
                    disabled={!currentShift?.shiftID}
                  >
                    Update Timing
                  </Button>
                </Space>
              }
            >
              {isDetailLoading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
              ) : (
                <Descriptions size="small" column={{ xs: 1, sm: 2, md: 3 }} bordered>
                  <Descriptions.Item label="Shift Name">
                    {currentShift?.shiftName ?? '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Start Time">
                    {fmtTime(currentShift?.startTime)}
                  </Descriptions.Item>
                  <Descriptions.Item label="End Time">
                    {fmtTime(currentShift?.endTime)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Effective From">
                    {fmtDate(currentShift?.effectiveFrom)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Effective To">
                    {currentShift?.effectiveTo ? fmtDate(currentShift.effectiveTo) : 'Open ended'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={currentShift?.isActive ? 'green' : 'red'}>
                      {currentShift?.isActive ? 'Active' : 'Inactive'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Created By">
                    {currentShift?.createdBy ?? '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Updated By">
                    {currentShift?.lastUpdatedBy ?? '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Updated On">
                    {currentShift?.lastUpdatedOn ? fmtDate(currentShift.lastUpdatedOn) : '-'}
                  </Descriptions.Item>
                </Descriptions>
              )}
            </Card>

            <Card
              size="small"
              title={
                <Space>
                  <HistoryOutlined />
                  <span>Timing History</span>
                </Space>
              }
            >
              <Table
                rowKey="shiftHistoryId"
                size="small"
                bordered
                loading={isDetailLoading}
                columns={historyColumns}
                dataSource={timingHistory}
                pagination={{ pageSize: 10, showSizeChanger: true }}
                scroll={{ x: 1180 }}
                locale={{
                  emptyText: (
                    <div style={{ padding: 16 }}>
                      <Empty description="No timing history for this shift yet" />
                    </div>
                  ),
                }}
              />
            </Card>
          </Space>
        )}
      </div>

      <UpdateShiftTimingDrawer
        open={isTimingDrawerOpen}
        onClose={() => setIsTimingDrawerOpen(false)}
        shift={currentShift}
        onUpdated={refreshAll}
      />
    </>
  )
}

export default ShiftMasterCrud
