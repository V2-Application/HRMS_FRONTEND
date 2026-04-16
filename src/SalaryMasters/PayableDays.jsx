import { useEffect, useState } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, message, Grid } from 'antd'
import { ExportOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import useMediaQuery from '../hooks/useMediaQuery'

import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { exportPayableDaysToExcel, fetchPayableDays } from '../services/Services'
import { set } from '../redux/uiSlice'
import Pageheading from '../components/shared/Pageheading'
import { useActionsMap } from '../utils/useActionsMap'

const { Search } = Input

const PayableDays = () => {
  const [employeesListData, setEmployeesListData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)
  const [lodingLocal, setlodingLocal] = useState(false)

  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  const handleToggleCard = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Mobile expanded row - Attendance & calculation details
  const expandedRowRender = (record) => (
    <div style={{ padding: 12, background: '#fafafa', fontSize: 11 }}>
      {/* Section 1: Attendance Breakdown - 5 columns in ONE row */}
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
          Attendance Details
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
          <div>
            <div
              style={{
                color: '#888',
                fontSize: 8,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              Bgt Days
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#666', textAlign: 'center' }}>
              {record.totalDaysInMonth || 0}
            </div>
          </div>
          <div>
            <div
              style={{
                color: '#888',
                fontSize: 8,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              Present
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#52c41a', textAlign: 'center' }}>
              {record.attendance || 0}
            </div>
          </div>
          <div>
            <div
              style={{
                color: '#888',
                fontSize: 8,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              WO
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#1890ff', textAlign: 'center' }}>
              {record.actual_Weekly_Off || 0}
            </div>
          </div>
          <div>
            <div
              style={{
                color: '#888',
                fontSize: 8,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              WO Pres
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#13c2c2', textAlign: 'center' }}>
              {record.weeklyoffpresent || 0}
            </div>
          </div>
          <div>
            <div
              style={{
                color: '#888',
                fontSize: 8,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              Leaves
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#fa8c16', textAlign: 'center' }}>
              {record.leave_availed || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Calculations - 2 columns */}
      <div style={{ background: '#e6f7ff', padding: 8, borderRadius: 4, marginBottom: 10 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#1890ff',
            marginBottom: 6,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Calculations
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <div>
            <div
              style={{
                color: '#1890ff',
                fontSize: 9,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              Extra Days
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#1890ff', textAlign: 'center' }}>
              {record.extrA_DAYS || 0}
            </div>
          </div>
          <div>
            <div
              style={{
                color: '#1890ff',
                fontSize: 9,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              Absent
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#ff4d4f', textAlign: 'center' }}>
              {record.absent || 0}
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
              fontSize: 9,
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
            {record.locationName || '-'}
          </div>
        </div>
        <div>
          <div
            style={{
              color: '#888',
              fontSize: 9,
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
            {record.departmentName || '-'}
          </div>
        </div>
        <div>
          <div
            style={{
              color: '#888',
              fontSize: 9,
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
            {record.designationName || '-'}
          </div>
        </div>
      </div>
    </div>
  )

  // Mobile columns - MAIN ROW: Code, Name, Month, Payable Days + Expand (5 columns)
  const mobileColumns = [
    {
      title: 'Code',
      dataIndex: 'ecode',
      width: 50,
      render: (text) => (
        <div
          style={{
            fontSize: 9,
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
      dataIndex: 'fulL_NAME',
      width: 85,
      render: (text) => (
        <div
          style={{
            fontSize: 9,
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
      dataIndex: 'month',
      width: 70,
      render: (text) => (
        <div
          style={{
            fontSize: 9,
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
      title: 'Pay Days',
      dataIndex: 'payble_Days',
      width: 65,
      render: (value) => (
        <div style={{ fontSize: 10, fontWeight: 600, color: '#52c41a', textAlign: 'center' }}>
          {value || 0}
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 35,
      render: (_, record, index) => {
        const uniqueKey = record.storeBudgetId || record.ecode || `row_${index}`
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

  const { filteredSideMenu } = useSelector((state) => state?.auth || {})
  const actionsMap = useActionsMap(filteredSideMenu)

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchPayableDays({
        pageNumber: currentPage,
        pageSize,
        search,
      })

      if (response?.status) {
        setTotalCount(response?.data?.totalCount || 0)
        setEmployeesListData(response?.data?.data)
      } else {
        setEmployeesListData([])
      }
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData()
    }, 500)

    return () => clearTimeout(timer)
  }, [pageSize, currentPage])

  const columns = [
    {
      title: 'E-CODE',
      dataIndex: 'ecode',
      key: 'ecode',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'LOC CODE',
      dataIndex: 'stCode',
      key: 'stCode',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'LOCATION',
      dataIndex: 'locationName',
      ellipsis: true,
      key: 'locationName',
      width: 150,
    },
    {
      title: 'EMP NAME',
      ellipsis: true,
      dataIndex: 'fulL_NAME',
      key: 'fulL_NAME',
      width: 150,
    },
    {
      title: 'DEPARTMENT',
      ellipsis: true,
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 150,
    },
    {
      title: 'DESIGNATION',
      ellipsis: true,
      dataIndex: 'designationName',
      key: 'designationName',
      width: 150,
    },
    {
      title: 'MTH-YEAR',
      ellipsis: true,
      dataIndex: 'month',
      key: 'month',
      width: 150,
    },
    {
      title: 'BGT DAYS',
      ellipsis: true,
      dataIndex: 'totalDaysInMonth',
      key: 'totalDaysInMonth',
      width: 150,
    },
    {
      title: 'PRESENT',
      ellipsis: true,
      dataIndex: 'attendance',
      key: 'attendance',
      width: 150,
    },
    {
      title: 'WEEKLY-OFF',
      ellipsis: true,
      dataIndex: 'actual_Weekly_Off',
      key: 'actual_Weekly_Off',
      width: 150,
    },
    {
      title: 'PRESENT IN WEEKLY-OFF',
      ellipsis: true,
      dataIndex: 'weeklyoffpresent',
      key: 'weeklyoffpresent',
      width: 150,
    },
    {
      title: 'LEAVES AVAILED',
      ellipsis: true,
      dataIndex: 'leave_availed',
      key: 'leave_availed',
      width: 150,
    },
    {
      title: 'PAYABLE DAYS',
      ellipsis: true,
      dataIndex: 'payble_Days',
      key: 'payble_Days',
      width: 150,
    },
    {
      ellipsis: true,
      title: 'EXTRA DAYS',
      dataIndex: 'extrA_DAYS',
      key: 'extrA_DAYS',
      width: 150,
    },
    {
      title: 'ABSENT',
      ellipsis: true,
      dataIndex: 'absent',
      key: 'absent',
      width: 150,
    },
  ]

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  return (
    <>
      <Pageheading title="Payable Days" />
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
          handleSearch={handleSearch}
          lodingLocal={lodingLocal}
          setlodingLocal={setlodingLocal}
          refreshData={fetchData}
          actionsMap={actionsMap}
          search={search}
        />
        <Table
          rowKey={(r, i) => r?.storeBudgetId || r?.ecode || `row_${i}`}
          columns={isMobile ? mobileColumns : columns}
          pagination={{
            current: currentPage,
            position: ['bottomRight'],
            total: totalCount,
            pageSize: pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handleTableChange,
          }}
          dataSource={employeesListData}
          bordered={true}
          expandable={
            isMobile
              ? {
                  expandedRowKeys: Object.keys(expandedCards).filter((key) => expandedCards[key]),
                  expandedRowRender: expandedRowRender,
                  showExpandColumn: false,
                }
              : undefined
          }
          scroll={
            isMobile
              ? { x: 'max-content' } // ✅ Only horizontal scroll
              : { x: totalWidth, y: 'calc(100vh - 160px)' }
          }
          style={{ whiteSpace: 'nowrap' }}
          className={theme === 'dark' ? 'dark-theme' : ''}
          size={isMobile ? 'small' : 'middle'}
          sticky
        />
      </div>
    </>
  )
}

const TableBulkActionIcons = ({
  totalRecords,
  handleSearch,
  search,
  lodingLocal,
  setlodingLocal,
  actionsMap,
}) => {
  const { theme } = useSelector((state) => state.ui)

  const { useBreakpoint } = Grid
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const [statusSummary, setstatusSummary] = useState([
    {
      name: 'Total Rows',
      label: 'Pending Interview Schedule',
      count: 0,
      color: 'green',
      id: [1, 2, 3, 4, 5],
    },
    { name: 'Selected Rows', label: 'Rejected', count: 0, color: 'blue', id: [7] },
  ])

  useEffect(() => {
    setstatusSummary([
      {
        name: 'Total Rows',
        label: 'Pending Interview Schedule',
        count: 0,
        color: 'green',
        id: [1, 2, 3, 4, 5],
      },
    ])
  }, [totalRecords])

  const downloadStoreDataAsExcel = async ({ isActive, allEmployee, companyId, lodingLocal }) => {
    try {
      setlodingLocal(true)
      const { data, status } = await exportPayableDaysToExcel()

      if (status === 200) {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `Payable_Days_${new Date().toISOString()}.xlsx`
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Export initiated successfully')
      }
    } catch (error) {
      console.error('api eror', error)
      message.error('Export failed')
    } finally {
      setlodingLocal(false)
    }
  }

  return (
    <>
      <div
        style={{
          padding: 5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space>
          {statusSummary.map(({ name, label, count, id }, index) => (
            <div
              key={index}
              style={{
                border: '2px solid #ccc',
                padding: 3,
                borderRadius: 10,
                display: 'flex',
                justifyContent: 'center',
              }}
              onClick={() => {
                filterByStatus(id)
              }}
              className={theme === 'dark' ? 'dark-theme' : ''}
            >
              {name === 'Total Rows' || name === 'Selected Rows' ? (
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
                  {count} {name}
                </span>
              ) : (
                <Tooltip placement="top" title={label}>
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
                    {count} {name}
                  </span>
                </Tooltip>
              )}
            </div>
          ))}
        </Space>

        <Row>
          <Col style={{ display: 'flex', gap: 8 }}>
            {actionsMap?.export?.actionStatus && (
              <Button
                loading={lodingLocal}
                onClick={downloadStoreDataAsExcel}
                icon={<ExportOutlined />}
              >
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
    </>
  )
}

export default PayableDays
