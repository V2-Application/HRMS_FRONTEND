import React, { useEffect, useMemo, useState } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, message, Grid } from 'antd'
import { ExportOutlined, UploadOutlined } from '@ant-design/icons'
import { ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import ExcelImportModal from '../components/modals/ExcelimportModal'
import { fetchGivenToBankDetails } from '../services/Services'
import { set } from '../redux/uiSlice'
import GivenToBankUploadModal from './GivenToBankUploadModal'
import Pageheading from '../components/shared/Pageheading'
import { useActionsMap } from '../utils/useActionsMap'
import { exportExcelFromFrontend } from '../components/shared/ExportExceFromFrontend'
import useMediaQuery from '../hooks/useMediaQuery'
import 'react-toastify/dist/ReactToastify.css'

const { Search } = Input
const { useBreakpoint } = Grid

const GivenToBank = () => {
  const screens = useBreakpoint()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const [givenToBankData, setGivenToBankData] = useState([])
  const [filteredData, setFilteredData] = useState([])

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [totalCount, setTotalCount] = useState(0)

  const [importExelModal, setimportExelModal] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [lodingLocal, setlodingLocal] = useState(false)

  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)
  const { filteredSideMenu } = useSelector((state) => state?.auth)
  const actionsMap = useActionsMap(filteredSideMenu)

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchGivenToBankDetails({
        pageNumber: currentPage,
        pageSize,
        search: debouncedSearch,
      })

      console.log('given to bank res:', response)
      console.log('response?.totalRecords', response?.totalRecords)
      if (response) {
        const rows = response?.records || []
        setGivenToBankData(rows)
        setFilteredData(rows)
        setTotalCount(response?.totalRecords ?? rows.length)
      } else {
        setGivenToBankData([])
        setFilteredData([])
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Error fetching data:', error?.response?.data || error?.message)
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

  // useEffect(() => {
  //   const q = (search || '').trim().toLowerCase()
  //   if (!q) {
  //     setFilteredData(givenToBankData)
  //     // setTotalCount(givenToBankData.length)
  //     return
  //   }
  //   const f =
  //     givenToBankData.filter((row) =>
  //       Object.values(row).some((v) =>
  //         String(v ?? '')
  //           .toLowerCase()
  //           .includes(q),
  //       ),
  //     ) || []
  //   setFilteredData(f)
  //   // setTotalCount(f.length)
  // }, [search, givenToBankData])

  // ✅ Desktop columns (unchanged)
  const desktopColumns = useMemo(
    () => [
      {
        title: 'Date',
        key: 'date',
        dataIndex: 'date',
        render: (date) => (date == null ? '' : String(date).split('T')[0]),
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
        key: 'accountNumber',
        width: 200,
      },
      {
        title: 'Bank Transfer',
        dataIndex: 'bankTransfer',
        key: 'bankTransfer',
        width: 160,
      },
    ],
    [],
  )

  // ✅ Mobile columns (no expand button, all data visible)
  const mobileColumns = useMemo(
    () => [
      {
        title: 'Date',
        dataIndex: 'date',
        width: 90,
        render: (date) => (
          <div style={{ fontSize: 11, fontWeight: 500 }}>
            {date ? String(date).split('T')[0] : '-'}
          </div>
        ),
      },
      {
        title: 'E-Code',
        dataIndex: 'ecode',
        width: 70,
        render: (text) => <div style={{ fontSize: 11, fontWeight: 500 }}>{text || '-'}</div>,
      },
      {
        title: 'Account',
        dataIndex: 'ac',
        width: 110,
        render: (text) => (
          <div
            style={{
              fontSize: 10,
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
        title: 'Transfer',
        dataIndex: 'bankTransfer',
        width: 80,
        render: (text) => (
          <div
            style={{
              fontSize: 10,
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

  const title_fields = [
    {
      label: 'Emp Code',
      key: 'eCode',
      alternateMatches: ['ECODE'],
      fieldType: { type: 'input' },
      example: '123',
    },
    {
      label: 'Account Number',
      key: 'accountNumber',
      alternateMatches: ['ACCOUNT NUMBER'],
      fieldType: { type: 'input' },
      example: '',
    },
    {
      label: 'Bank Transfer',
      key: 'bankTransfer',
      alternateMatches: ['BANK TRANSFER', 'TRANSFER'],
      fieldType: { type: 'input' },
      example: 'Yes/No',
    },
  ]

  return (
    <>
      <Pageheading title="Given to Bank" />
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
        filteredData={filteredData}
        isMobile={isMobile}
      />

      {isMobile ? (
        // ✅ Mobile view - simple table, no expansion needed
        <Table
          rowKey={(r, i) => r?.storeBudgetId || r?.ecode || `row_${i}`}
          columns={columns}
          dataSource={filteredData}
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
            dataSource={filteredData}
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

      <ExcelImportModal
        importExelModal={importExelModal}
        setimportExelModal={setimportExelModal}
        title_fields={title_fields}
      />
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

  const handleExport = () => {
    const cols = [
      { header: 'Date', key: 'date', transform: (v) => (v ? String(v).split('T')[0] : '') },
      { header: 'Emp Code', key: 'ecode' },
      { header: 'Account Number', key: 'ac' },
      { header: 'Bank Transfer', key: 'bankTransfer' },
    ]
    setlodingLocal(true)
    const res = exportExcelFromFrontend(cols, filteredData, 'GivenToBank.xlsx')
    if (res.success) message.success(res.message)
    else message.error(res.message)
    setlodingLocal(false)
  }

  return (
    <>
      {isUploadVisible && (
        <GivenToBankUploadModal
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
            <Tooltip placement="top" title="Upload Given to Bank">
              <Button onClick={() => setIsUploadVisible(true)}>
                <UploadOutlined />
              </Button>
            </Tooltip>
          )}

          {actionsMap?.export?.actionStatus && (
            <Tooltip placement="top" title="Export">
              <Button loading={lodingLocal} disabled={lodingLocal} onClick={handleExport}>
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

export default GivenToBank
