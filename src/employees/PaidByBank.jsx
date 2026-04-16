import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, message, Grid, DatePicker } from 'antd'
import { ExportOutlined, UploadOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPaidByBank } from '../services/Services'
import { set } from '../redux/uiSlice'
import PaidByBankBulkUpload from './PaidByBankBulkUpload'
import Pageheading from '../components/shared/Pageheading'
import { useActionsMap } from '../utils/useActionsMap'
import { exportExcelFromFrontend } from '../components/shared/ExportExceFromFrontend'
import useMediaQuery from '../hooks/useMediaQuery'
import 'react-toastify/dist/ReactToastify.css'
import dayjs from 'dayjs'

const { Search } = Input
const { useBreakpoint } = Grid
const { MonthPicker } = DatePicker

const CommonTable = () => {
  const screens = useBreakpoint()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)
  const { data: empData, filteredSideMenu } = useSelector((state) => state?.auth)
  const actionsMap = useActionsMap(filteredSideMenu)

  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [totalCount, setTotalCount] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [lodingLocal, setlodingLocal] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(dayjs())

  // ✅ Mobile state
  const [expandedCards, setExpandedCards] = useState({})

  const handleToggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  // ✅ Mobile expanded row render
  const expandedRowRender = (record) => (
    <div style={{ padding: 12, background: '#fafafa', fontSize: 11 }}>
      {/* Row 1: Account & UTR - 2 columns */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 8 }}
      >
        <div>
          <div style={{ color: '#666', fontSize: 9, fontWeight: 500, marginBottom: 2 }}>
            Account No
          </div>
          <div style={{ fontWeight: 500, fontSize: 10, wordBreak: 'break-all', lineHeight: '1.2' }}>
            {record.ac || '-'}
          </div>
        </div>
        <div>
          <div style={{ color: '#666', fontSize: 9, fontWeight: 500, marginBottom: 2 }}>UTR</div>
          <div style={{ fontWeight: 500, fontSize: 10, wordBreak: 'break-all', lineHeight: '1.2' }}>
            {record.utr || '-'}
          </div>
        </div>
      </div>

      {/* Row 2: Paid By Bank - Full width, highlighted */}
      <div
        style={{
          background: '#e6f7ff',
          padding: 8,
          borderRadius: 4,
          textAlign: 'center',
          border: '1px solid #91d5ff',
        }}
      >
        <div style={{ color: '#1890ff', fontSize: 9, fontWeight: 600, marginBottom: 2 }}>
          Paid By Bank
        </div>
        <div style={{ fontWeight: 700, fontSize: 12, color: '#1890ff' }}>
          ₹{Number(record.paidByBank || 0).toLocaleString()}
        </div>
      </div>
    </div>
  )

  // ✅ Mobile columns
  const getMobileColumns = () => [
    {
      title: 'Paid Id',
      dataIndex: 'tblPaidByBankId',
      width: 70,
      render: (text) => <div style={{ fontSize: 11, fontWeight: 500 }}>{text || '-'}</div>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      width: 80,
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
      title: 'Amount',
      dataIndex: 'paidByBank',
      width: 70,
      render: (amount) => (
        <div style={{ fontSize: 11, fontWeight: 600, color: '#1890ff' }}>
          ₹{Number(amount || 0).toLocaleString()}
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 40,
      render: (_, record, index) => {
        const uniqueKey = record.tblPaidByBankId || `row_${index}`
        return (
          <Button
            type="text"
            size="small"
            icon={
              expandedCards[uniqueKey] ? (
                <MinusOutlined style={{ fontSize: 12 }} />
              ) : (
                <PlusOutlined style={{ fontSize: 12 }} />
              )
            }
            onClick={(e) => {
              e.stopPropagation()
              handleToggleCard(uniqueKey)
            }}
            style={{ padding: '4px' }}
          />
        )
      },
    },
  ]

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchPaidByBank({
        pageNumber: currentPage,
        pageSize,
        eCode: empData?.ecode,
        search: debouncedSearch,
        monthYear: currentMonth.format('MMM-YY'),
      })
      console.log('employees api res:', response)

      if (response.status === 200) {
        setTotalCount(response?.data?.data?.totalCount || 0)
        setEmployeesListData(response?.data?.data?.data || [])
      } else {
        setEmployeesListData([])
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Error fetching data:', error?.response?.data || error?.message)
      message.error(error?.response?.data?.message || 'Failed to fetch records')
      setEmployeesListData([])
      setTotalCount(0)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, debouncedSearch, currentMonth])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(t)
  }, [search])

  const columns = useMemo(
    () => [
      { title: 'Paid Id', dataIndex: 'tblPaidByBankId', key: 'tblPaidByBankId', width: 130 },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        render: (date) => (date == null ? '' : String(date).split('T')[0]),
        width: 140,
      },
      { title: 'Emp Code', dataIndex: 'ecode', key: 'ecode', width: 130 },
      { title: 'Account No', dataIndex: 'ac', key: 'ac', width: 180 },
      { title: 'Amount', dataIndex: 'paidByBank', key: 'paidByBank', width: 160 },
      { title: 'UTR', dataIndex: 'utr', key: 'utr', width: 160 },
      { title: 'Remarks', dataIndex: 'remarks', key: 'remarks', width: 160, ellipsis: true },
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

  // useEffect(() => {
  //   const q = (search || '').trim().toLowerCase()
  //   if (q) {
  //     const f =
  //       employeesListData.filter((row) =>
  //         Object.values(row).some((v) =>
  //           String(v ?? '')
  //             .toLowerCase()
  //             .includes(q),
  //         ),
  //       ) || []
  //     setFilteredData(f)
  //   } else {
  //     setFilteredData(employeesListData)
  //   }
  // }, [search, employeesListData])

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <Toolbar
        totalRecords={filteredData?.length || 0}
        selectedRowKeys={selectedRowKeys}
        search={search}
        setSearch={setSearch}
        lodingLocal={lodingLocal}
        setlodingLocal={setlodingLocal}
        refreshData={fetchData}
        actionsMap={actionsMap}
        filteredData={filteredData}
        isMobile={isMobile}
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
      />

      {isMobile ? (
        // ✅ Mobile view with expansion
        <Table
          rowKey={(r, i) => r?.tblPaidByBankId || `row_${i}`}
          columns={getMobileColumns()}
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
          expandable={{
            expandedRowKeys: Object.keys(expandedCards)
              .filter((key) => expandedCards[key])
              .map((key) => (isNaN(key) ? key : parseInt(key))),
            expandedRowRender: expandedRowRender,
            showExpandColumn: false,
          }}
          className={theme === 'dark' ? 'dark-theme' : ''}
        />
      ) : (
        // ✅ Desktop view with horizontal scroll
        <div
          style={{
            width: '100%',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            background: '#fff',
            borderRadius: 8,
          }}
        >
          <div style={{ minWidth: totalWidth }}>
            <Table
              rowKey={(r, i) => r?.id || r?.storeBudgetId || `${r?.ecode || 'row'}_${i}`}
              columns={columns}
              // dataSource={filteredData}
              dataSource={employeesListData}
              bordered
              size="middle"
              sticky
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
              style={{ whiteSpace: 'nowrap' }}
              className={theme === 'dark' ? 'dark-theme' : ''}
            />
          </div>
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
  currentMonth,
  setCurrentMonth,
}) => {
  const { theme } = useSelector((state) => state.ui)
  const [isUploadVisible, setIsUploadVisible] = useState(false)

  const statusChips = [
    { name: 'Total Rows', count: totalRecords },
    { name: 'Selected Rows', count: selectedRowKeys?.length || 0 },
  ]

  const handleExport = async () => {
    try {
      const response = await fetchPaidByBank({
        pageNumber: 1,
        pageSize: 10,
        search: '',
        monthYear: currentMonth.format('MMM-YY'),
        isExcel: true,
      })

      if (response.status === 200) {
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Employee_Payroll_${new Date().toISOString()}.xlsx`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
        message.success('Export initiated successfully')
      }
    } catch (error) {
      console.error('Error downloading excel:', error)
      const errMsg = error?.response?.data?.message || 'Error downloading excel'
      message.error(errMsg)
    }
  }

  return (
    <>
      <Pageheading title="Paid By Bank" />

      {isUploadVisible && (
        <PaidByBankBulkUpload
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
          justifyContent: 'end',
        }}
      >
        {/* <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            flex: isMobile ? '1 1 100%' : '0 1 auto',
          }}
        >
          {statusChips.map(({ name, count }, idx) => (
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
        </div> */}

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
            <Tooltip placement="top" title="Upload Paid By Bank">
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

          <MonthPicker
            value={currentMonth}
            onChange={(val) => setCurrentMonth(val)}
            disabledDate={(current) => current && current.isAfter(dayjs(), 'month')}
          />

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

export default CommonTable
