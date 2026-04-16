import React, { useEffect, useMemo, useState } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, message, Grid } from 'antd'
import { ExportOutlined, UploadOutlined } from '@ant-design/icons'
import { ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { fetchReturnByBank } from '../../services/Services'
import { set } from '../../redux/uiSlice'
import ReturnByBankUploader from './ReturnByBankUploader'
import Pageheading from '../shared/Pageheading'
import { useActionsMap } from '../../utils/useActionsMap'
import { exportExcelFromFrontend } from '../shared/ExportExceFromFrontend'
import useMediaQuery from '../../hooks/useMediaQuery'
import 'react-toastify/dist/ReactToastify.css'

const { Search } = Input
const { useBreakpoint } = Grid

const ReturnByBank = () => {
  const screens = useBreakpoint()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const [rows, setRows] = useState([])
  const [filteredRows, setFilteredRows] = useState([])

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [totalCount, setTotalCount] = useState(0)

  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [lodingLocal, setlodingLocal] = useState(false)

  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)
  const { data: empData, filteredSideMenu } = useSelector((state) => state?.auth || {})
  const actionsMap = useActionsMap(filteredSideMenu)

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchReturnByBank({
        pageNumber: currentPage,
        pageSize,
        eCode: empData?.ecode,
        search: debouncedSearch,
      })
      if (response) {
        const recs = response?.records || []
        setRows(recs)
        setFilteredRows(recs)
        setTotalCount(response?.totalRecords ?? recs.length)
      } else {
        setRows([])
        setFilteredRows([])
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message)
      message.error('Failed to fetch records')
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, debouncedSearch])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    const q = (search || '').trim().toLowerCase()
    if (!q) {
      setFilteredRows(rows)
      setTotalCount(rows.length)
      return
    }
    const f =
      rows.filter((r) =>
        Object.values(r).some((v) =>
          String(v ?? '')
            .toLowerCase()
            .includes(q),
        ),
      ) || []
    setFilteredRows(f)
    setTotalCount(f.length)
  }, [search, rows])

  // ✅ Desktop columns
  const desktopColumns = useMemo(
    () => [
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        render: (date) => (date !== null ? String(date).split('T')[0] : ''),
        width: 140,
      },
      {
        title: 'Emp Code',
        dataIndex: 'ecode',
        key: 'ecode',
        width: 130,
      },
      {
        title: 'Account Number',
        dataIndex: 'ac',
        key: 'ac',
        width: 200,
      },
      {
        title: 'Return By Bank',
        dataIndex: 'returnByBank',
        key: 'returnByBank',
        width: 160,
      },
    ],
    [],
  )

  // ✅ Mobile columns (compact, all data visible)
  const mobileColumns = useMemo(
    () => [
      {
        title: 'Date',
        dataIndex: 'date',
        width: 70,
        render: (date) => (
          <div style={{ fontSize: 11, fontWeight: 500 }}>
            {date ? String(date).split('T')[0] : '-'}
          </div>
        ),
      },
      {
        title: 'E-Code',
        dataIndex: 'ecode',
        width: 60,
        render: (text) => <div style={{ fontSize: 11, fontWeight: 500 }}>{text || '-'}</div>,
      },
      {
        title: 'Account',
        dataIndex: 'ac',
        width: 110,
        render: (text) => (
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              wordBreak: 'break-all',
              lineHeight: '1.2',
            }}
          >
            {text || '-'}
          </div>
        ),
      },
      {
        title: 'Return',
        dataIndex: 'returnByBank',
        width: 80,
        render: (text) => (
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: text ? '#52c41a' : '#ff4d4f',
            }}
          >
            {text || '-'}
          </div>
        ),
      },
    ],
    [],
  )

  const columns = isMobile ? mobileColumns : desktopColumns

  const totalWidth = useMemo(
    () =>
      Math.max(
        desktopColumns.reduce((sum, c) => sum + (c.width || 150), 0),
        640,
      ),
    [desktopColumns],
  )

  return (
    <>
      <Pageheading title="Return By Bank" />
      <ToastContainer position="top-right" autoClose={2000} />

      <Toolbar
        totalRecords={totalCount}
        selectedRowKeys={selectedRowKeys}
        search={search}
        setSearch={setSearch}
        lodingLocal={lodingLocal}
        setlodingLocal={setlodingLocal}
        refreshData={fetchData}
        actionsMap={actionsMap}
        filteredData={filteredRows}
        isMobile={isMobile}
      />

      {isMobile ? (
        // ✅ Mobile view - simple table, no expansion
        <Table
          rowKey={(r, i) => r?.storeBudgetId || r?.ecode || `row_${i}`}
          columns={columns}
          dataSource={filteredRows}
          bordered
          size="small"
          pagination={{
            current: currentPage,
            position: ['bottomRight'],
            total: totalCount,
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handleTableChange,
          }}
          scroll={{ x: 'max-content' }}
          className={theme === 'dark' ? 'dark-theme' : ''}
        />
      ) : (
        // ✅ Desktop view
        <div style={{ overflowX: 'hidden' }}>
          <Table
            rowKey={(r, i) => r?.id || r?.storeBudgetId || `${r?.ecode || 'row'}_${i}`}
            columns={columns}
            dataSource={filteredRows}
            bordered
            sticky
            size="middle"
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
              y: 'calc(100vh - 160px)',
            }}
            style={{ whiteSpace: 'nowrap', width: '100%' }}
            className={theme === 'dark' ? 'dark-theme' : ''}
          />
        </div>
      )}
    </>
  )
}

const Toolbar = ({
  totalRecords,
  selectedRowKeys,
  search,
  setSearch,
  lodingLocal,
  setlodingLocal,
  refreshData,
  actionsMap,
  filteredData,
  isMobile,
}) => {
  const { theme } = useSelector((state) => state.ui)
  const [isUploadVisible, setIsUploadVisible] = useState(false)

  const chips = [
    { name: 'Total Rows', count: totalRecords },
    { name: 'Selected Rows', count: selectedRowKeys?.length || 0 },
  ]

  const downloadDataInExcel = () => {
    const columns = [
      { header: 'Date', key: 'date', transform: (v) => (v ? String(v).split('T')[0] : '') },
      { header: 'Emp Code', key: 'ecode' },
      { header: 'Account Number', key: 'ac' },
      { header: 'Return By Bank', key: 'returnByBank' },
    ]
    setlodingLocal(true)
    const res = exportExcelFromFrontend(columns, filteredData, 'ReturnByBank.xlsx')
    if (res.success) message.success(res.message)
    else message.error(res.message)
    setlodingLocal(false)
  }

  return (
    <>
      {isUploadVisible && (
        <ReturnByBankUploader
          isVisible={isUploadVisible}
          setIsVisible={setIsUploadVisible}
          refreshData={refreshData}
        />
      )}

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
            <Tooltip placement="top" title="Upload Return By Bank">
              <Button onClick={() => setIsUploadVisible(true)}>
                <UploadOutlined />
              </Button>
            </Tooltip>
          )}

          {actionsMap?.export?.actionStatus && (
            <Tooltip placement="top" title="Export">
              <Button loading={lodingLocal} disabled={lodingLocal} onClick={downloadDataInExcel}>
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
    </>
  )
}

export default ReturnByBank
