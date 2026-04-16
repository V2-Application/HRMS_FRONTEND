import React, { useEffect, useState } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, message, Grid } from 'antd'
import { ExportOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import useMediaQuery from '../hooks/useMediaQuery'

import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import {
  exportNetPayableToExcel,
  fetchNetPayableBatchList,
  fetchNetPayableCList,
} from '../services/Services'
import { set } from '../redux/uiSlice'
import Pageheading from '../components/shared/Pageheading'
import { useActionsMap } from '../utils/useActionsMap'

const { Search } = Input
const { useBreakpoint } = Grid

const Month = () => {
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

  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  const handleToggleCard = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Mobile expanded row - Payroll breakdown
  const expandedRowRender = (record) => (
    <div style={{ padding: 12, background: '#fafafa', fontSize: 11 }}>
      {/* Section 1: Financial Summary - 4 columns */}
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#666',
            marginBottom: 6,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Financial Summary
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <div>
            <div
              style={{
                color: '#888',
                fontsize: 11,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              Bgt Salary
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#1890ff', textAlign: 'center' }}>
              ₹{money(record.bgt_Salary)}
            </div>
          </div>
          <div>
            <div
              style={{
                color: '#888',
                fontsize: 11,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              Gross Earnings
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#52c41a', textAlign: 'center' }}>
              ₹{money(record.gross_Earnings)}
            </div>
          </div>
          <div>
            <div
              style={{
                color: '#888',
                fontsize: 11,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              Net (w/o Reimb)
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#fa8c16', textAlign: 'center' }}>
              ₹{money(record.net_Payble_Without_Reimbersment_)}
            </div>
          </div>
          <div>
            <div
              style={{
                color: '#888',
                fontsize: 11,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              Reimbursement
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#13c2c2', textAlign: 'center' }}>
              ₹{money(record.reimbersment)}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Additions & Deductions */}
      <div style={{ background: '#fff7e6', padding: 8, borderRadius: 4, marginBottom: 10 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#fa8c16',
            marginBottom: 6,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Additions & Deductions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <div>
            <div
              style={{
                color: '#fa8c16',
                fontsize: 11,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              Additions
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#fa8c16', textAlign: 'center' }}>
              ₹{money(record.additions)}
            </div>
          </div>
          <div>
            <div
              style={{
                color: '#fa8c16',
                fontsize: 11,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              Deductions
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#ff4d4f', textAlign: 'center' }}>
              ₹{money(record.deductions)}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Context Info - 3 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        <div>
          <div
            style={{
              color: '#888',
              fontsize: 11,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            Department
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 10,
              textAlign: 'center',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.2',
            }}
          >
            {record.department || '-'}
          </div>
        </div>
        <div>
          <div
            style={{
              color: '#888',
              fontsize: 11,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            Designation
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 10,
              textAlign: 'center',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.2',
            }}
          >
            {record.designation || '-'}
          </div>
        </div>
        <div>
          <div
            style={{
              color: '#888',
              fontsize: 11,
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
              fontSize: 10,
              textAlign: 'center',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.2',
            }}
          >
            {record.location_Name || '-'}
          </div>
        </div>
      </div>
    </div>
  )

  // Mobile columns - MAIN ROW: Code, Name, Month, Net Payable + Expand (5 columns)
  const mobileColumns = [
    {
      title: 'E-Code',
      dataIndex: 'ecode',
      width: 50,
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
      title: 'Name',
      dataIndex: 'employee_Name',
      width: 90,
      render: (text) => (
        <div
          style={{
            fontsize: 11,
            fontWeight: 600,
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
      render: (text) => (
        <div
          style={{
            fontsize: 11,
            fontWeight: 500,
            textAlign: 'center',
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
      title: 'Net Pay',
      dataIndex: 'net_Payble_After_Deduction_with_Addition_',
      width: 75,
      render: (value) => (
        <div style={{ fontsize: 11, fontWeight: 600, color: '#52c41a', textAlign: 'center' }}>
          ₹{money(value)}
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 35,
      render: (_, record, index) => {
        const uniqueKey = record.storeBudgetId || record.uniqueId || record.ecode || `row_${index}`
        return (
          <Button
            type="text"
            size="small"
            icon={
              expandedCards[uniqueKey] ? (
                <MinusOutlined style={{ fontSize: 10 }} />
              ) : (
                <PlusOutlined style={{ fontSize: 10 }} />
              )
            }
            onClick={(e) => {
              e.stopPropagation()
              handleToggleCard(uniqueKey)
            }}
            style={{ padding: '2px' }}
          />
        )
      },
    },
  ]

  const money = (value) => {
    const num = Number(value)
    return num === 0
      ? '0.00'
      : num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      // const response = await fetchNetPayableCList()
      const response = await fetchNetPayableBatchList()
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
    { title: 'Batch No.', dataIndex: 'batchNo', key: 'batchNo', ellipsis: true, width: 150 },
    { title: 'Id', dataIndex: 'uniqueId', key: 'uniqueId', ellipsis: true, width: 150 },
    {
      title: 'Running Time',
      dataIndex: 'runAt',
      key: 'runAt',
      ellipsis: true,
      width: 180,
      render: (value) => {
        const date = String(value).split('T')[0]
        const time = String(value).split('T')[1].slice(0, 5)

        return `${date} - ${time}`
      },
    },
    { title: 'E Code', dataIndex: 'ecode', key: 'ecode', ellipsis: true, width: 150 },
    {
      title: 'Emp Name',
      dataIndex: 'employeeName',
      key: 'employeeName',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'LOC Code',
      dataIndex: 'locationCode',
      key: 'locationCode',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'LOC Name',
      dataIndex: 'locationName',
      key: 'locationName',
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
    { title: 'Month', dataIndex: 'monthYear', key: 'monthYear', ellipsis: true, width: 150 },
    { title: 'Bgt Salary', dataIndex: 'bgtSalary', key: 'bgtSalary', ellipsis: true, width: 150 },
    {
      title: 'Gross Earning',
      dataIndex: 'grossEarnings',
      key: 'grossEarnings',
      ellipsis: true,
      width: 200,
    },
    { title: 'Additional', dataIndex: 'additions', key: 'additions', ellipsis: true, width: 250 },
    { title: 'Deduction', dataIndex: 'deductions', key: 'deductions', ellipsis: true, width: 250 },
    {
      title: 'Net Payable (Without Reimbursement)',
      dataIndex: 'netPaybleWithoutReimbursement',
      key: 'netPaybleWithoutReimbursement',
      ellipsis: true,
      width: 180,
    },
    {
      title: 'Net Payable (After deduction with addition)',
      dataIndex: 'netPaybleAfterDeductionWithAddition',
      key: 'netPaybleAfterDeductionWithAddition',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Reimbursement',
      dataIndex: 'reimbursement',
      key: 'reimbursement',
      ellipsis: true,
      width: 150,
    },
  ]

  const columns = isMobile ? mobileColumns : desktopColumns
  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  const handleSearch = (e) => setSearch(e.target.value)

  return (
    <>
      <Pageheading title="Net Payable Master" />
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
          rowKey={(r, i) => r?.storeBudgetId || r?.uniqueId || r?.ecode || `row_${i}`}
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
          expandable={
            isMobile
              ? {
                  expandedRowKeys: Object.keys(expandedCards).filter((key) => expandedCards[key]),
                  expandedRowRender: expandedRowRender,
                  showExpandColumn: false,
                }
              : undefined
          }
          scroll={{
            x: isMobile ? 'max-content' : totalWidth,
            y: isMobile ? 420 : 'calc(100vh - 160px)',
          }}
          style={{ whiteSpace: 'nowrap' }}
          className={theme === 'dark' ? 'dark-theme' : ''}
          size={isMobile ? 'small' : 'middle'}
          tableLayout={isMobile ? 'fixed' : undefined}
          sticky
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
      const { data, status } = await fetchNetPayableBatchList(true)
      console.log('status:', status)
      if (status === 200) {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        console.log('blob:', blob)
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
            <Button
              // style={{ width: isMobile ? '100%' : 'auto' }}
              loading={lodingLocal}
              onClick={exportMasterToExcel}
              icon={<ExportOutlined />}
            >
              {!isMobile && 'Export'}
            </Button>
          )}
          {/* </Col>
        <Col xs={24} sm="auto" style={{ flex: isMobile ? '1 1 100%' : '0 0 auto' }}> */}
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

export default Month
