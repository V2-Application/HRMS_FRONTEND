import React, { useEffect, useMemo, useState } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, message, Grid } from 'antd'
import { ExportOutlined, UploadOutlined } from '@ant-design/icons'
import { ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { fetchWeeklyOffHolidays } from '../../services/Services'
import { set } from '../../redux/uiSlice'
import WeeklyOffHolidayUploader from './WeeklyOffHolidayUploader'
import Pageheading from '../shared/Pageheading'
import { useActionsMap } from '../../utils/useActionsMap'
import 'react-toastify/dist/ReactToastify.css'

const { Search } = Input
const { useBreakpoint } = Grid

const WeeklyOffHolidayMaster = () => {
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)
  const { data: empData } = useSelector((state) => state.auth)
  const { filteredSideMenu } = useSelector((state) => state?.auth)
  const actionsMap = useActionsMap(filteredSideMenu)

  const [records, setRecords] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [totalCount, setTotalCount] = useState(0)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchWeeklyOffHolidays({
        pageNumber: currentPage,
        pageSize,
        eCode: empData?.ecode,
        search: debouncedSearch,
      })

      if (response) {
        setTotalCount(response?.totalRecords ?? 0)
        setRecords(response?.records ?? [])
      } else {
        setTotalCount(0)
        setRecords([])
      }
    } catch (error) {
      console.error('Error fetching Weekly-off Holiday:', error?.response?.data || error?.message)
      message.error('Failed to fetch data')
      setTotalCount(0)
      setRecords([])
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, debouncedSearch])

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(t)
  }, [search])

  // Columns with explicit widths so the table scrolls horizontally on mobile (single scrollbar)
  const columns = useMemo(
    () => [
      { title: 'Month', dataIndex: 'month', key: 'month', width: 140 },
      {
        title: 'Location',
        dataIndex: 'locationCategoryName',
        key: 'locationCategoryName',
        ellipsis: true,
        width: 220,
      },
      { title: 'Designation', dataIndex: 'designationName', key: 'designationName', width: 200 },
      { title: 'Bgt Weekly-off', dataIndex: 'budgetWeeklyOff', key: 'budgetWeeklyOff', width: 160 },
      { title: 'Bgt Holidays', dataIndex: 'budgetHoliday', key: 'budgetHoliday', width: 160 },
    ],
    [],
  )

  const totalWidth = useMemo(
    () =>
      Math.max(
        columns.reduce((sum, c) => sum + (c.width || 150), 0),
        640,
      ),
    [columns],
  )

  return (
    <>
      <Pageheading title="Weekly-off Holiday" />
      <ToastContainer position="top-right" autoClose={2000} />

      <Toolbar
        totalRecords={totalCount}
        search={search}
        setSearch={setSearch}
        isMobile={isMobile}
        actionsMap={actionsMap}
        exporting={exporting}
        onExport={async () => {
          try {
            setExporting(true)
            // If you later add API export, call it here. For now, just simulate UX:
            message.info('Export is in queue, you will get an alert once the download is completed')
            // await someExportFunction(...)
          } catch (e) {
            message.error('Export failed')
          } finally {
            setExporting(false)
          }
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {isUploadOpen && (
        <WeeklyOffHolidayUploader
          isVisible={isUploadOpen}
          setIsVisible={setIsUploadOpen}
          refreshData={fetchData}
        />
      )}

      {/* Let AntD Table control horizontal scroll — avoid outer overflow containers to prevent double scrollers */}
      <div style={{ overflowX: 'hidden' }}>
        <Table
          rowKey={(r, i) =>
            r?.id ||
            r?.storeBudgetId ||
            `${r?.month || 'm'}_${r?.locationCategoryName || 'loc'}_${r?.designationName || 'des'}_${i}`
          }
          columns={columns}
          dataSource={records}
          bordered
          sticky
          size={isMobile ? 'small' : 'middle'}
          tableLayout="fixed"
          pagination={{
            current: currentPage,
            position: ['bottomRight'],
            total: totalCount,
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handleTableChange,
          }}
          scroll={{
            x: totalWidth,
            y: isMobile ? 360 : 'calc(100vh - 160px)',
          }}
          style={{ whiteSpace: 'nowrap', width: '100%' }}
          className={theme === 'dark' ? 'dark-theme' : ''}
        />
      </div>
    </>
  )
}

const Toolbar = ({
  totalRecords,
  search,
  setSearch,
  isMobile,
  actionsMap,
  exporting,
  onExport,
  onOpenUpload,
}) => {
  const { theme } = useSelector((state) => state.ui)

  const chips = [{ name: 'Total Rows', count: totalRecords }]

  return (
    <div
      style={{
        padding: 6,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
      }}
    >
      {/* Left: status chips */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          flex: isMobile ? '1 1 100%' : '0 1 auto',
        }}
      >
        {chips.map(({ name, count }, idx) => (
          <div
            key={idx}
            style={{
              border: '2px solid #ccc',
              padding: 4,
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'center',
              minWidth: 120,
              maxWidth: 160,
            }}
            className={theme === 'dark' ? 'dark-theme' : ''}
          >
            <span
              style={{
                display: 'inline-block',
                width: '100%',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                fontSize: 12,
                padding: '0 8px',
                textAlign: 'center',
              }}
            >
              {count} {name}
            </span>
          </div>
        ))}
      </div>

      {/* Right: actions + search */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
          flex: isMobile ? '1 1 100%' : '0 1 auto',
        }}
      >
        {actionsMap?.upload?.actionStatus && (
          <Tooltip placement="top" title="Upload Weekly-off Holiday">
            <Button onClick={onOpenUpload}>
              <UploadOutlined />
            </Button>
          </Tooltip>
        )}

        {actionsMap?.export?.actionStatus && (
          <Tooltip placement="top" title="Export">
            <Button loading={exporting} disabled={exporting} onClick={onExport}>
              <ExportOutlined />
            </Button>
          </Tooltip>
        )}

        <Search
          placeholder="Search in table..."
          allowClear
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          style={{ width: isMobile ? '100%' : 300 }}
        />
      </div>
    </div>
  )
}

export default WeeklyOffHolidayMaster
