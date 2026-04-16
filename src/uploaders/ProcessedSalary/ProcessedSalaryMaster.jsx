import React, { useEffect, useState, useCallback } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, message, Grid } from 'antd'
import { ExportOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { exportNetPayableToExcel, fetchNetPayableCList } from '../../services/Services'
import { set } from '../../redux/uiSlice'
import Pageheading from '../../components/shared/Pageheading'
import { useActionsMap } from '../../utils/useActionsMap'
import useMediaQuery from '../../hooks/useMediaQuery'

const { Search } = Input
const { useBreakpoint } = Grid

const ProcessedSalaryMaster = () => {
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [search, setSearch] = useState('')
  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)
  const [lodingLocal, setlodingLocal] = useState(false)

  const { filteredSideMenu } = useSelector((state) => state?.auth || {})
  const actionsMap = useActionsMap(filteredSideMenu)

  const screens = useBreakpoint()
  const isMobile = useMediaQuery('(max-width: 768px)')

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
      {/* Row 1: Location, Dept/Designation, Without Reimburse, Reimbursement - 4 columns */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 8 }}
      >
        <div>
          <div
            style={{
              color: '#666',
              fontSize: 8,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            Location
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 9,
              wordBreak: 'break-word',
              lineHeight: '1.2',
              textAlign: 'center',
            }}
          >
            {record.location_Name || '-'}
          </div>
        </div>
        <div>
          <div
            style={{
              color: '#666',
              fontSize: 8,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            Dept/Desig
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 9,
              wordBreak: 'break-word',
              lineHeight: '1.2',
              textAlign: 'center',
            }}
          >
            {record.department || '-'} / {record.designation || '-'}
          </div>
        </div>
        <div style={{ background: '#fff7e6', padding: 4, borderRadius: 4 }}>
          <div
            style={{
              color: '#fa8c16',
              fontSize: 8,
              fontWeight: 600,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            W/O Reimb
          </div>
          <div style={{ fontWeight: 600, fontSize: 9, color: '#fa8c16', textAlign: 'center' }}>
            ₹{Number(record.net_Payble_Without_Reimbersment_ || 0).toLocaleString()}
          </div>
        </div>
        <div style={{ background: '#fff1f0', padding: 4, borderRadius: 4 }}>
          <div
            style={{
              color: '#cf1322',
              fontSize: 8,
              fontWeight: 600,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            Reimburse
          </div>
          <div style={{ fontWeight: 600, fontSize: 9, color: '#cf1322', textAlign: 'center' }}>
            ₹{Number(record.reimbersment || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Row 2: Salary Breakdown - 4 columns */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 8 }}
      >
        <div>
          <div
            style={{
              color: '#666',
              fontSize: 8,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            Bgt Salary
          </div>
          <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
            ₹{Number(record.bgt_Salary || 0).toLocaleString()}
          </div>
        </div>
        <div>
          <div
            style={{
              color: '#666',
              fontSize: 8,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            Gross
          </div>
          <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
            ₹{Number(record.gross_Earnings || 0).toLocaleString()}
          </div>
        </div>
        <div>
          <div
            style={{
              color: '#1890ff',
              fontSize: 8,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            Additions
          </div>
          <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center', color: '#1890ff' }}>
            +{Number(record.additions || 0).toLocaleString()}
          </div>
        </div>
        <div>
          <div
            style={{
              color: '#ff4d4f',
              fontSize: 8,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            Deductions
          </div>
          <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center', color: '#ff4d4f' }}>
            -{Number(record.deductions || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Row 3: Final Net Payable - Full width, highlighted */}
      <div
        style={{
          background: '#f6ffed',
          padding: 8,
          borderRadius: 4,
          textAlign: 'center',
          border: '1px solid #b7eb8f',
        }}
      >
        <div style={{ color: '#389e0d', fontSize: 9, fontWeight: 600, marginBottom: 2 }}>
          Final Net Payable
        </div>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#389e0d' }}>
          ₹{Number(record.net_Payble_After_Deduction_with_Addition_ || 0).toLocaleString()}
        </div>
      </div>
    </div>
  )

  // ✅ Mobile columns with expand button
  const getMobileColumns = () => [
    {
      title: 'E-Code',
      dataIndex: 'ecode',
      width: 70,
      render: (text) => <div style={{ fontSize: 11, fontWeight: 500 }}>{text || '-'}</div>,
    },
    {
      title: 'Employee',
      dataIndex: 'employee_Name',
      width: 120,
      render: (text) => (
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            wordBreak: 'break-word',
            whiteSpace: 'normal',
            lineHeight: '1.2',
          }}
        >
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'Month',
      dataIndex: 'month_Year',
      width: 70,
      render: (text) => <div style={{ fontSize: 10, fontWeight: 500 }}>{text || '-'}</div>,
    },
    {
      title: 'Net Pay',
      dataIndex: 'net_Payble_After_Deduction_with_Addition_',
      width: 70,
      render: (amount) => (
        <div style={{ fontSize: 11, fontWeight: 600, color: '#52c41a' }}>
          ₹{Number(amount || 0).toLocaleString()}
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 40,
      render: (_, record, index) => {
        const uniqueKey = record.storeBudgetId || `row_${index}`
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
      const response = await fetchNetPayableCList()
      console.log('Net Payable api res:', response)
      if (response?.status) {
        const list = response?.data?.data || []
        setEmployeesListData(list)
        setTotalCount(list.length)
        setFilteredData(list)
      } else {
        setEmployeesListData([])
        setFilteredData([])
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Error fetching data:', error || error.response?.data || error.message)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const new_search = search?.trim().toLowerCase()
    if (new_search.length > 0) {
      const new_data =
        employeesListData.filter((dt) =>
          Object.values(dt).some((val) => String(val).toLowerCase().includes(new_search)),
        ) || []
      setTotalCount(new_data.length)
      setFilteredData(new_data)
    } else {
      setTotalCount(employeesListData.length)
      setFilteredData(employeesListData)
    }
  }, [search, employeesListData])

  // ===== Columns =====
  const desktopColumns = [
    { title: 'E-Code', dataIndex: 'ecode', key: 'ecode', ellipsis: true, width: 150 },
    {
      title: 'Emp Name',
      dataIndex: 'employee_Name',
      key: 'employee_Name',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'LOC Code',
      dataIndex: 'location_Code',
      key: 'location_Code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'LOC Name',
      dataIndex: 'location_Name',
      key: 'location_Name',
      ellipsis: true,
      width: 150,
    },
    { title: 'Department', dataIndex: 'department', key: 'department', ellipsis: true, width: 150 },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      ellipsis: true,
      width: 150,
    },
    { title: 'Month', dataIndex: 'month_Year', key: 'month_Year', ellipsis: true, width: 150 },
    { title: 'Bgt Salary', dataIndex: 'bgt_Salary', key: 'bgt_Salary', ellipsis: true, width: 150 },
    {
      title: 'Gross Earning',
      dataIndex: 'gross_Earnings',
      key: 'gross_Earnings',
      ellipsis: true,
      width: 200,
    },
    { title: 'Additional', dataIndex: 'additions', key: 'additions', ellipsis: true, width: 250 },
    { title: 'Deduction', dataIndex: 'deductions', key: 'deductions', ellipsis: true, width: 250 },
    {
      title: 'Net Payable (Without Reimbursement)',
      dataIndex: 'net_Payble_Without_Reimbersment_',
      key: 'net_Payble_Without_Reimbersment_',
      ellipsis: true,
      width: 180,
    },
    {
      title: 'Net Payable (After deduction with addition)',
      dataIndex: 'net_Payble_After_Deduction_with_Addition_',
      key: 'net_Payble_After_Deduction_with_Addition_',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Reimbursement',
      dataIndex: 'reimbersment',
      key: 'reimbersment',
      ellipsis: true,
      width: 150,
    },
  ]

  const columns = isMobile ? getMobileColumns() : desktopColumns
  const totalWidth = desktopColumns.reduce((sum, col) => sum + (col.width || 150), 0)

  const handleSearch = (e) => setSearch(e.target.value)

  return (
    <>
      <Pageheading title="Processed Salary" />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      <div className="def" style={{ paddingBottom: 10 }}>
        <TableBulkActionIcons
          totalRecords={totalCount}
          selectedRowKeys={selectedRowKeys}
          handleSearch={handleSearch}
          lodingLocal={lodingLocal}
          setlodingLocal={setlodingLocal}
          refreshData={fetchData}
          actionsMap={actionsMap}
          search={search}
          isMobile={isMobile}
        />

        <Table
          rowKey={(record, index) => record.storeBudgetId || `row_${index}`}
          columns={columns}
          dataSource={filteredData}
          bordered
          pagination={{
            current: currentPage,
            position: ['bottomRight'],
            total: totalCount,
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handleTableChange,
          }}
          scroll={isMobile ? undefined : { x: totalWidth, y: 'calc(100vh - 160px)' }}
          style={{ whiteSpace: 'nowrap' }}
          className={theme === 'dark' ? 'dark-theme' : ''}
          size={isMobile ? 'small' : 'middle'}
          tableLayout={isMobile ? undefined : undefined}
          sticky={!isMobile}
          expandable={
            isMobile
              ? {
                  expandedRowKeys: Object.keys(expandedCards)
                    .filter((key) => expandedCards[key])
                    .map((key) => (isNaN(key) ? key : parseInt(key))),
                  expandedRowRender: expandedRowRender,
                  showExpandColumn: false,
                }
              : undefined
          }
        />
      </div>
    </>
  )
}

const TableBulkActionIcons = ({
  totalRecords,
  selectedRowKeys,
  handleSearch,
  search,
  lodingLocal,
  setlodingLocal,
  refreshData,
  actionsMap,
  isMobile,
}) => {
  const { theme } = useSelector((state) => state.ui)

  const exportMasterToExcel = async () => {
    try {
      setlodingLocal(true)
      const { data, status } = await exportNetPayableToExcel()
      if (status === 200) {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `Net_Payable_${new Date().toISOString()}.xlsx`
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('api error', error)
      message.error('Export failed')
    } finally {
      setlodingLocal(false)
    }
  }

  return (
    <div
      style={{
        padding: 5,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Left: total rows */}
      <Space wrap>
        <div
          style={{
            border: '2px solid #ccc',
            padding: 6,
            borderRadius: 10,
            display: 'flex',
            justifyContent: 'center',
            minWidth: 130,
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
            }}
          >
            {totalRecords} Total Rows
          </span>
        </div>
      </Space>

      {/* Right: export + search */}
      <Row gutter={[8, 8]} align="middle">
        <Col xs={24} sm="auto" style={{ display: 'flex', gap: 8 }}>
          {actionsMap?.export?.actionStatus && (
            <Button loading={lodingLocal} onClick={exportMasterToExcel} icon={<ExportOutlined />}>
              {!isMobile && 'Export'}
            </Button>
          )}
          <Search
            placeholder="Search in table..."
            allowClear
            onChange={handleSearch}
            style={{ width: isMobile ? 150 : 300 }}
            value={search}
          />
        </Col>
      </Row>
    </div>
  )
}

export default ProcessedSalaryMaster
