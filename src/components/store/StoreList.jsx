import React, { useEffect, useState, useMemo } from 'react'
import {
  Space,
  Table,
  Row,
  Col,
  Input,
  Tooltip,
  Button,
  message,
  Grid,
  Card,
  Pagination,
  Typography,
} from 'antd'
import { ExportOutlined } from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import BudgetHistoryModal from './BudgetHistoryModal'
import { getDropdownLocDesDep } from '../../services/Services'
import { useSelector } from 'react-redux'
import { exportExcelFromFrontend } from '../shared/ExportExceFromFrontend'
import { useActionsMap } from '../../utils/useActionsMap'

const { Search } = Input
const { useBreakpoint } = Grid
const { Text } = Typography

const StoreList = () => {
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const [storesList, setStoresList] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false) // 👈 table loader only
  const [lodingLocal, setlodingLocal] = useState(false) // for export button

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [searchTerm, setSearchTerm] = useState('')

  const [isBudgetHistoryModalOpen, setIsBudgetHistoryModalOpen] = useState(false)
  const [budgetHistoryData, setBudgetHistoryData] = useState([])

  const dropdowns = ['location']
  const { filteredSideMenu } = useSelector((state) => state?.auth || {})
  const actionsMap = useActionsMap(filteredSideMenu)

  // 🔹 Fetch dropdown data (locations)
  const fetchDropdowns = async () => {
    try {
      setLoading(true)
      const response = await getDropdownLocDesDep(dropdowns.join(', '))
      if (response.status) {
        const locArr = response.data?.Location || []
        setStoresList(locArr)
        setFilteredData(locArr)
      }
    } catch (error) {
      console.error('dropdowns api error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDropdowns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 🔹 Live search filter
  useEffect(() => {
    const lowerTrimmedSearch = String(searchTerm).trim().toLowerCase()
    if (!lowerTrimmedSearch) {
      setFilteredData(storesList)
      setCurrentPage(1)
      return
    }
    const filtered = (storesList || []).filter((item) =>
      Object.values(item || {}).some((value) =>
        String(value ?? '')
          .trim()
          .toLowerCase()
          .includes(lowerTrimmedSearch),
      ),
    )
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, storesList])

  // 🔹 Columns
  const columns = useMemo(
    () => [
      {
        title: 'Location',
        dataIndex: 'locationName',
        key: 'locationName',
      },
    ],
    [],
  )

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const handleSearchChange = (e) => setSearchTerm(e.target.value)

  // 🔹 Excel Export
  const downloadExcel = () => {
    const cols = [{ header: 'Location', key: 'locationName' }]
    try {
      setlodingLocal(true)
      const response = exportExcelFromFrontend(cols, filteredData)
      if (response.success) {
        message.success(response.message)
      } else {
        message.error(response.message)
      }
    } catch (error) {
      message.error(error?.message || 'Some error occurred')
    } finally {
      setlodingLocal(false)
    }
  }

  // 🔹 Pagination slice for mobile
  const startIdx = (currentPage - 1) * pageSize
  const endIdx = startIdx + pageSize
  const mobilePageData = filteredData.slice(startIdx, endIdx)

  const rowKey = (r, i) => r?.locationId || r?.LocationId || r?.id || r?.key || r?.locationName || i

  const renderMobileCard = (item, idx) => {
    const title = item?.locationName || '-'
    return (
      <Card
        key={rowKey(item, idx)}
        size="small"
        style={{ borderRadius: 8 }}
        bodyStyle={{ padding: 12 }}
      >
        <Row gutter={[8, 6]} align="middle">
          <Col xs={24}>
            <Text type="secondary">Location</Text>
            <div style={{ fontWeight: 600 }}>{title}</div>
          </Col>
        </Row>
      </Card>
    )
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      <div className="def" style={{ paddingBottom: 10 }}>
        {/* Toolbar */}
        <Row
          gutter={[10, 10]}
          justify="space-between"
          align="middle"
          style={{ padding: 5, marginBottom: 8 }}
          wrap
        >
          {/* 🔍 Search */}
          <Col
            xs={24}
            md="auto"
            style={{ order: isMobile ? 2 : 1, width: isMobile ? '100%' : 'auto' }}
          >
            <Search
              placeholder="Search in table..."
              allowClear
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ width: isMobile ? '100%' : 300 }}
            />
          </Col>

          {/* 📤 Export */}
          {actionsMap?.export?.actionStatus && (
            <Col
              xs={24}
              md="auto"
              style={{ order: isMobile ? 1 : 2, textAlign: isMobile ? 'left' : 'right' }}
            >
              <Tooltip placement="top" title={'Export'}>
                <Button
                  loading={lodingLocal}
                  onClick={downloadExcel}
                  icon={<ExportOutlined />}
                  block={isMobile}
                >
                  {!isMobile ? 'Export' : null}
                </Button>
              </Tooltip>
            </Col>
          )}
        </Row>

        {/* 💻 Desktop Table / 📱 Mobile Cards */}
        {!isMobile ? (
          <Table
            rowKey={rowKey}
            columns={columns}
            dataSource={filteredData}
            bordered
            loading={loading} // 👈 Table shows inline loader here
            pagination={{
              current: currentPage,
              total: filteredData.length,
              pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '15', '20', '50', '100'],
              onChange: handleTableChange,
              position: ['bottomRight'],
            }}
            scroll={{ y: 'calc(100vh - 220px)', x: 'max-content' }}
            size="middle"
            style={{ whiteSpace: 'nowrap' }}
          />
        ) : (
          <>
            {loading ? (
              <Card size="small" style={{ textAlign: 'center' }}>
                Loading...
              </Card>
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
                    pageSizeOptions={['5', '10', '15', '20']}
                    onChange={(p, ps) => handleTableChange(p, ps)}
                    size="small"
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Budget History Modal */}
      <BudgetHistoryModal
        isBudgetHistoryModalOpen={isBudgetHistoryModalOpen}
        setIsBudgetHistoryModalOpen={setIsBudgetHistoryModalOpen}
        budgetHistoryData={budgetHistoryData}
      />
    </>
  )
}

export default StoreList
