import {
  Space,
  Table,
  Input,
  message,
  Button,
  Grid,
  Row,
  Col,
  Card,
  Typography,
  Pagination,
} from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { getHolidayList } from '../../services/Services'
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../../redux/uiSlice'
import UpsertHolidayFormModal from './UpsertHolidayFormModal'
import axiosInstance from '../../services/axiosInstance'
import Uploader from './Uploader'
import { useActionsMap } from '../../utils/useActionsMap'

const { Search } = Input
const { useBreakpoint } = Grid
const { Text } = Typography

const Holiday = () => {
  const dispatch = useDispatch()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const [search, setSearch] = useState('')
  const [groupsList, setGroupsList] = useState([])
  const [filteredList, setFilteredList] = useState([])
  const [editingRow, setEditingRow] = useState(null)
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(null)
  const [isUploaderOpen, setIsUploaderOpen] = useState(false)

  // mobile pagination
  const [mPage, setMPage] = useState(1)
  const [mPageSize, setMPageSize] = useState(100)

  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)

  // ------- Effects -------
  useEffect(() => {
    fetchHolidayData()
  }, [])

  useEffect(() => {
    const q = String(search).trim().toLowerCase()
    if (!q) {
      setFilteredList(groupsList)
    } else {
      const filtered = groupsList?.filter((group) =>
        Object.values(group || {}).some((g) =>
          String(g ?? '')
            .trim()
            .toLowerCase()
            .includes(q),
        ),
      )
      setFilteredList(filtered)
    }
    setMPage(1) // reset mobile page on filter
  }, [search, groupsList])

  // ------- API -------
  const fetchHolidayData = async () => {
    try {
      dispatch(set({ loading: true }))
      const response = await getHolidayList()

      const items = (response?.data?.data || []).map((item, idx) => ({
        ...item,
        key: item.id ?? item._id ?? `row-${idx}`,
      }))

      if (response?.status === 200) {
        setGroupsList(items || [])
      } else {
        setGroupsList([])
        message.error(response?.response?.data?.message || 'Error in fetching data')
      }
    } catch (error) {
      console.error('fetch err: ', error)
      message.error(error?.response?.data?.message || 'Error in fetching data')
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  // ------- Handlers -------
  const handleEditClick = (row) => setEditingRow(row)
  const handleEditCancel = () => setEditingRow(null)
  const handleEditSuccess = () => {
    setEditingRow(null)
    fetchHolidayData()
  }

  const handleDeleteCancel = () => setDeleteConfirmationOpen(null)
  const handleDeleteClick = (row) => setDeleteConfirmationOpen(row?.id)

  const handleDeleteRow = async (row) => {
    try {
      const response = await axiosInstance.get(
        `/api/HolidayMaster/DeleteHoliday?id=${parseInt(row?.id)}`,
      )
      if (response?.status === 200) {
        await fetchHolidayData()
        setDeleteConfirmationOpen(null)
        message.success('Deleted')
      }
    } catch (error) {
      console.error(`error deleting for id: ${row?.id} -> `, error)
      message.error(error?.response?.data?.message || 'Error deleting data')
    }
  }

  // ------- Columns (desktop) -------
  const columns = useMemo(
    () => [
      {
        title: 'Location Type',
        dataIndex: 'locationTypeName',
        key: 'locationTypeName',
        width: 200,
        ellipsis: true,
      },
      {
        title: 'Location / Group',
        dataIndex: 'locationValueName',
        key: 'locationValueName',
        width: 220,
        ellipsis: true,
      },
      {
        title: 'Holiday',
        dataIndex: 'holidayName',
        key: 'holidayName',
        width: 220,
        ellipsis: true,
      },
      {
        title: 'Holiday Date',
        dataIndex: 'holidayDate',
        key: 'holidayDate',
        width: 150,
        render: (date) => (date == null ? '-' : String(date).split('T')[0]),
      },
      {
        title: 'Created On',
        dataIndex: 'createdOn',
        key: 'createdOn',
        width: 150,
        render: (date) => (date == null ? '-' : String(date).split('T')[0]),
      },
      {
        title: 'Action',
        key: 'action',
        width: 160,
        fixed: 'right',
        render: (row) => {
          const isDeleteConfirmOpen = deleteConfirmationOpen === row?.id
          return (
            <Space style={{ position: 'relative' }}>
              {actionsMap?.delete?.actionStatus && (
                <div style={{ position: 'relative' }}>
                  <Button
                    icon={<DeleteOutlined />}
                    title="Delete Holiday"
                    onClick={() => handleDeleteClick(row)}
                  />
                  {isDeleteConfirmOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        zIndex: 1000,
                        top: 0,
                        right: 45,
                        backgroundColor: '#fff',
                        padding: 8,
                        display: 'flex',
                        gap: 6,
                        alignItems: 'center',
                        borderRadius: 6,
                        boxShadow: '0 4px 12px rgba(0,0,0,.15)',
                        border: '1px solid #e5e7eb',
                        minWidth: 80,
                      }}
                    >
                      <span style={{ fontSize: 14, color: '#595959', whiteSpace: 'nowrap' }}>
                        Delete?
                      </span>
                      <Button
                        type="text"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={() => handleDeleteRow(row)}
                        style={{ color: '#52c41a', padding: '2px 4px', minWidth: 24, height: 24 }}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={handleDeleteCancel}
                        style={{ color: '#ff4d4f', padding: '2px 4px', minWidth: 24, height: 24 }}
                      />
                    </div>
                  )}
                </div>
              )}

              {actionsMap?.edit?.actionStatus && (
                <Button
                  icon={<EditOutlined />}
                  title="Edit Holiday"
                  onClick={() => handleEditClick(row)}
                />
              )}
            </Space>
          )
        },
      },
    ],
    [deleteConfirmationOpen, actionsMap],
  )

  // ------- Mobile Card helpers -------
  const Field = ({ label, value }) => (
    <div style={{ marginBottom: 6 }}>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {label}
      </Text>
      <div style={{ fontWeight: 500, overflowWrap: 'anywhere' }}>{value ?? '-'}</div>
    </div>
  )

  const renderMobileCard = (item) => {
    const isDeleteConfirmOpen = deleteConfirmationOpen === item?.id
    return (
      <Card
        key={item.key}
        size="small"
        bodyStyle={{ padding: 12 }}
        style={{ borderRadius: 10 }}
        actions={[
          <Space key="actions" wrap>
            {actionsMap?.edit?.actionStatus && (
              <Button size="small" icon={<EditOutlined />} onClick={() => handleEditClick(item)}>
                Edit
              </Button>
            )}
            {actionsMap?.delete?.actionStatus && (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Button
                  size="small"
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => handleDeleteClick(item)}
                >
                  Delete
                </Button>
                {isDeleteConfirmOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      zIndex: 1000,
                      top: -6,
                      left: '100%',
                      marginLeft: 8,
                      backgroundColor: '#ffffff',
                      padding: 8,
                      display: 'flex',
                      gap: 6,
                      alignItems: 'center',
                      borderRadius: 6,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <span style={{ fontSize: 14, color: '#595959' }}>Delete?</span>
                    <Button
                      type="text"
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={() => handleDeleteRow(item)}
                      style={{ color: '#52c41a', padding: '2px 4px', minWidth: 24, height: 24 }}
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={handleDeleteCancel}
                      style={{ color: '#ff4d4f', padding: '2px 4px', minWidth: 24, height: 24 }}
                    />
                  </div>
                )}
              </div>
            )}
          </Space>,
        ]}
      >
        <Row gutter={[8, 4]}>
          <Col span={12}>
            <Field label="Location Type" value={item?.locationTypeName} />
          </Col>
          <Col span={12}>
            <Field label="Location / Group" value={item?.locationValueName} />
          </Col>
          <Col span={12}>
            <Field label="Holiday" value={item?.holidayName} />
          </Col>
          <Col span={12}>
            <Field
              label="Holiday Date"
              value={item?.holidayDate ? String(item.holidayDate).split('T')[0] : '-'}
            />
          </Col>
          <Col span={12}>
            <Field
              label="Created On"
              value={item?.createdOn ? String(item.createdOn).split('T')[0] : '-'}
            />
          </Col>
        </Row>
      </Card>
    )
  }

  // mobile data slice
  const mStart = (mPage - 1) * mPageSize
  const mData = filteredList.slice(mStart, mStart + mPageSize)

  return (
    <div>
      <Uploader
        isVisible={isUploaderOpen}
        setIsVisible={setIsUploaderOpen}
        refreshData={fetchHolidayData}
      />

      {/* Toolbar */}
      {!isMobile ? (
        // ---------- Desktop: Buttons then Search (Search LAST) ----------
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}
        >
          {actionsMap?.upload?.actionStatus && (
            <Button icon={<UploadOutlined />} onClick={() => setIsUploaderOpen(true)}>
              Upload
            </Button>
          )}

          {actionsMap?.addholiday?.actionStatus && (
            <UpsertHolidayFormModal onSuccess={fetchHolidayData} />
          )}

          <Search
            placeholder="Search holidays..."
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 260 }}
          />
        </div>
      ) : (
        // ---------- Mobile: Search on top, then two buttons side-by-side ----------
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <Search
              placeholder="Search holidays..."
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {actionsMap?.upload?.actionStatus && (
              <Button
                icon={<UploadOutlined />}
                onClick={() => setIsUploaderOpen(true)}
                style={{ flex: 1 }}
              >
                Upload
              </Button>
            )}

            {actionsMap?.addholiday?.actionStatus && (
              <div style={{ flex: 1 }}>
                <UpsertHolidayFormModal
                  onSuccess={fetchHolidayData}
                  buttonProps={{
                    style: { width: '100%' }, // fill half row
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Table / Mobile Cards */}
      {!isMobile ? (
        <Table
          dataSource={filteredList}
          columns={columns}
          rowKey="key"
          size="small"
          bordered
          scroll={{ x: 'max-content', y: 'calc(100vh - 240px)' }}
        />
      ) : (
        <>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            {mData.length ? (
              mData.map((item) => renderMobileCard(item))
            ) : (
              <Card size="small" style={{ textAlign: 'center' }}>
                No Data
              </Card>
            )}
          </Space>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <Pagination
              current={mPage}
              total={filteredList.length}
              pageSize={mPageSize}
              onChange={(p, ps) => {
                setMPage(p)
                setMPageSize(ps)
              }}
              showSizeChanger
              pageSizeOptions={['5', '8', '10', '15', '20']}
              size="small"
            />
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editingRow && (
        <UpsertHolidayFormModal
          editData={editingRow}
          onSuccess={handleEditSuccess}
          onCancel={handleEditCancel}
        />
      )}
    </div>
  )
}

export default Holiday
