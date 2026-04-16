import { message, Space, Table, Input, Button, Popconfirm, Checkbox, Tag, Switch } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { deleteShift, GetAllShifts, toggleShift } from '../services/Services'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import AddShiftModal from './AddShiftModal'

const { Search } = Input

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

  useEffect(() => {
    fetchData()
  }, [])

  let filteredData = useMemo(() => {
    let q = searchTerm.toLowerCase().trim()

    if (!q) return shifts

    return shifts.filter((shift) => {
      return (
        shift?.shiftName?.trim()?.toLowerCase()?.includes(q) ||
        shift.startTime?.toLowerCase().includes(q) ||
        shift.endTime?.toLowerCase().includes(q) ||
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
      }
    } catch (error) {
      console.error('Error updating shift status:', error)
      message.error(error?.response?.data?.message || 'Unable to update status!')
    } finally {
      setIsStatusToggling(false)
      setTogglingShiftId(null)
    }
  }

  const columns = useMemo(() => {
    return [
      {
        title: 'Shift Name',
        dataIndex: 'shiftName',
        key: 'shiftName',
        width: 100,
        ellipsis: true,
      },
      {
        title: 'Start Time',
        dataIndex: 'startTime',
        key: 'startTime',
        width: 100,
        ellipsis: true,
      },
      {
        title: 'End Time',
        dataIndex: 'endTime',
        key: 'endTime',
        width: 100,
        ellipsis: true,
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
        refreshData={fetchData}
        editingShift={editingShift}
      />

      <Space
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'end',
          marginBottom: '0.6rem',
        }}
      >
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
        loading={isShiftsLoading}
        dataSource={filteredData}
        columns={columns}
        pagination={{ pageSize: 100 }}
        scroll={{ x: totalWidth, y: 'calc(100vh - 100px)' }}
      />
    </>
  )
}

export default ShiftMasterCrud
