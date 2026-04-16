import { ExportOutlined, StepForwardOutlined } from '@ant-design/icons'
import {
  Button,
  Table,
  Input,
  Space,
  InputNumber,
  Col,
  Tooltip,
  message,
  Grid,
  Row,
  Card,
  Pagination,
  Typography,
} from 'antd'
import Pageheading from '../components/shared/Pageheading'
import './style.css'
import { newStoreGetList } from '../services/Services'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../redux/uiSlice'
import { useNavigate } from 'react-router-dom'
import { useActionsMap } from '../utils/useActionsMap'
import dayjs from 'dayjs'
import { exportExcelFromFrontend } from '../components/shared/ExportExceFromFrontend'

const { Search } = Input
const { useBreakpoint } = Grid
const { Text } = Typography

const NewStoresList = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchText, setSearchText] = useState('')

  // permissions
  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)

  // filters
  const [selectedMonth] = useState(dayjs()) // keep for future if you re-enable month filter
  const [range, setRange] = useState('')
  const [lodingLocal, setLodingLocal] = useState(false)

  // pagination (shared)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(isMobile ? 100 : 100) // smaller default on mobile

  // columns (desktop)
  const actionColumn = {
    title: 'Action',
    key: 'action',
    fixed: screens.lg ? 'right' : undefined,
    render: (_, record) => (
      <Button
        aria-label="Open submit page"
        size={isMobile ? 'small' : 'middle'}
        onClick={() => navigate(`/store-details/${record.locationId}`)}
      >
        <StepForwardOutlined />
      </Button>
    ),
  }

  const viewColumn = {
    title: 'View',
    key: 'view',
    fixed: screens.lg ? 'right' : undefined,
    render: (_, record) => (
      <Button
        aria-label="Open view page"
        size={isMobile ? 'small' : 'middle'}
        onClick={() => navigate(`/view-store-details/${record.locationId}`)}
      >
        <StepForwardOutlined />
      </Button>
    ),
  }

  const columns = useMemo(() => {
    const base = [
      {
        title: 'Store Code',
        dataIndex: 'stCode',
        key: 'stCode',
        width: 140,
        ellipsis: true,
      },
      {
        title: 'Store Name',
        dataIndex: 'locationName',
        key: 'locationName',
        width: 280,
        ellipsis: true,
      },
      {
        title: 'Created On',
        dataIndex: 'createdOn',
        key: 'createdOn',
        width: 140,
        render: (date) => (date ? String(date).split('T')[0] : '-'),
      },
    ]

    const canAction = actionsMap?.action?.actionStatus === true
    const canView = actionsMap?.view?.actionStatus === true

    if (canAction && canView) return [...base, actionColumn, viewColumn]
    if (canAction) return [...base, actionColumn]
    if (canView) return [...base, viewColumn]
    return base
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsMap?.action?.actionStatus, actionsMap?.view?.actionStatus, screens.lg, isMobile])

  // --- fetch
  const fetchNewStores = async () => {
    try {
      await dispatch(set({ loading: true }))
      const formattedMonth = selectedMonth.format('MMM-YY')
      const response = await newStoreGetList(formattedMonth, range)

      if (response.status === 200) {
        const updatedData = Array.isArray(response?.data?.data)
          ? response.data.data.map((item, index) => ({
              ...item,
              key: item.locationId ?? index,
            }))
          : []
        setData(updatedData)
      } else {
        setData([])
      }
    } catch (error) {
      console.error('Error fetching new stores:', error)
      setData([])
    } finally {
      await dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchNewStores()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, range])

  // --- search filter
  useEffect(() => {
    const trimmed = String(searchText).trim().toLowerCase()
    if (!trimmed) {
      setFilteredData(data)
      setCurrentPage(1)
      return
    }
    const filtered = data.filter((item) =>
      Object.values(item).some((val) =>
        String(val ?? '')
          .toLowerCase()
          .includes(trimmed),
      ),
    )
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchText, data])

  const handleKeyPress = (e) => {
    if (!/^[0-9]$/.test(e.key)) e.preventDefault()
  }

  const downloadExcel = () => {
    const columnsForExport = [
      { header: 'Store Code', key: 'stCode' },
      { header: 'Store Name', key: 'locationName' },
      { header: 'Created On', key: 'createdOn' },
    ]

    try {
      setLodingLocal(true)
      const response = exportExcelFromFrontend(columnsForExport, filteredData)
      if (response.success) message.success(response.message)
      else message.error(response.message)
    } catch (error) {
      message.error(error?.message || 'Some error occured')
    } finally {
      setLodingLocal(false)
    }
  }

  const handlePaginationChange = (p, ps) => {
    setCurrentPage(p)
    setPageSize(ps)
  }

  const rowKey = (r, i) => r?.locationId || r?.id || r?.key || `${r?.stCode}-${i}`

  // mobile paging slice
  const startIdx = (currentPage - 1) * pageSize
  const endIdx = startIdx + pageSize
  const mobilePageData = filteredData.slice(startIdx, endIdx)

  // --- mobile card
  const renderMobileCard = (item, idx) => {
    const created = item?.createdOn ? String(item.createdOn).split('T')[0] : '-'
    const canAction = actionsMap?.action?.actionStatus === true
    const canView = actionsMap?.view?.actionStatus === true

    return (
      <Card
        key={rowKey(item, idx)}
        size="small"
        style={{
          borderRadius: 10,
        }}
        bodyStyle={{ padding: 12 }}
      >
        <Row gutter={[8, 6]}>
          <Col xs={12}>
            <Text type="secondary">Store Code</Text>
            <div style={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{item?.stCode || '-'}</div>
          </Col>
          <Col xs={12}>
            <Text type="secondary">Created On</Text>
            <div>{created}</div>
          </Col>
          <Col xs={24}>
            <Text type="secondary">Store Name</Text>
            <div style={{ overflowWrap: 'anywhere' }}>{item?.locationName || '-'}</div>
          </Col>

          {(canAction || canView) && (
            <Col xs={24} style={{ marginTop: 4 }}>
              <Space wrap>
                {canAction && (
                  <Button
                    type="primary"
                    size="middle"
                    onClick={() => navigate(`/store-details/${item.locationId}`)}
                  >
                    Open
                  </Button>
                )}
                {canView && (
                  <Button
                    size="middle"
                    onClick={() => navigate(`/view-store-details/${item.locationId}`)}
                  >
                    View
                  </Button>
                )}
              </Space>
            </Col>
          )}
        </Row>
      </Card>
    )
  }

  return (
    <>
      <Pageheading title="New Stores" />

      {/* Toolbar */}
      <Row
        gutter={[10, 10]}
        align="middle"
        justify="space-between"
        style={{ marginBottom: 12 }}
        wrap
      >
        {/* Left block: filters */}
        <Col xs={24} md="auto" style={{ width: isMobile ? '100%' : 'auto' }}>
          <Space
            direction={isMobile ? 'vertical' : 'horizontal'}
            size={isMobile ? 8 : 12}
            style={{ width: '100%' }}
          >
            {/* If you need month back, uncomment:
            <Space size={8} style={{ width: isMobile ? '100%' : 'auto' }}>
              <span style={{ whiteSpace: 'nowrap' }}>Select Month:</span>
              <DatePicker
                picker="month"
                value={selectedMonth}
                onChange={setSelectedMonth}
                format="MMM-YY"
                style={{ width: isMobile ? '100%' : 130 }}
                inputReadOnly
              />
            </Space>
            */}
            <Space size={8} style={{ width: isMobile ? '100%' : 'auto' }}>
              <span style={{ whiteSpace: 'nowrap' }}>Select Range:</span>
              <InputNumber
                style={{ width: isMobile ? '100%' : 100 }}
                onKeyPress={handleKeyPress}
                value={range}
                onChange={(value) => setRange(value)}
                placeholder="Days"
              />
            </Space>
          </Space>
        </Col>

        {/* Right block: search + export */}
        <Col xs={24} md="auto" style={{ width: isMobile ? '100%' : 'auto' }}>
          <Space
            direction={isMobile ? 'vertical' : 'horizontal'}
            size={isMobile ? 8 : 12}
            style={{ width: '100%', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}
          >
            {actionsMap?.export?.actionStatus && (
              <Tooltip placement="top" title="Export">
                <Button
                  loading={lodingLocal}
                  onClick={downloadExcel}
                  icon={<ExportOutlined />}
                  block={isMobile}
                >
                  {!isMobile ? 'Export' : null}
                </Button>
              </Tooltip>
            )}

            <Search
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search in table..."
              allowClear
              size="middle"
              style={{ width: isMobile ? '100%' : 300 }}
            />
          </Space>
        </Col>
      </Row>

      {/* Desktop Table / Mobile Cards */}
      {!isMobile ? (
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey={rowKey}
          size="middle"
          scroll={{ x: 'max-content', y: 'calc(100vh - 220px)' }}
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredData.length,
            onChange: handlePaginationChange,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 30, 40, 50],
            position: ['bottomRight'],
          }}
          className="custom-scrollbar"
        />
      ) : (
        <>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            {mobilePageData.length > 0 ? (
              mobilePageData.map((item, idx) => renderMobileCard(item, idx))
            ) : (
              <Card size="small" style={{ textAlign: 'center' }}>
                No Data
              </Card>
            )}
          </Space>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <Pagination
              current={currentPage}
              total={filteredData.length}
              pageSize={pageSize}
              showSizeChanger
              pageSizeOptions={['5', '8', '10', '20']}
              onChange={handlePaginationChange}
              size="small"
            />
          </div>
        </>
      )}
    </>
  )
}

export default NewStoresList
