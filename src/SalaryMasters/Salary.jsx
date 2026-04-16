import { useEffect, useState } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, message } from 'antd'
import { ExportOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import useMediaQuery from '../hooks/useMediaQuery'
import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import {
  exportBgtSalaryStructureWithEmpDetailsToExcel,
  fetchBgtSalaryMaster,
} from '../services/Services'
import { set } from '../redux/uiSlice'
import Pageheading from '../components/shared/Pageheading'
import { useActionsMap } from '../utils/useActionsMap'
import { Grid } from 'antd'

const { Search } = Input

const Salary = () => {
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [totalCount, setTotalCount] = useState(0)
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

  // Mobile expanded row - Salary breakdown
  const expandedRowRender = (record) => (
    <div style={{ padding: 12, background: '#fafafa', fontSize: 11 }}>
      {/* Section 1: Primary Salary Components - 4 columns */}
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
          Primary Components
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
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
              Basic
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#52c41a', textAlign: 'center' }}>
              ₹{money(record.basicSalary)}
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
              HRA
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#52c41a', textAlign: 'center' }}>
              ₹{money(record.hra)}
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
              DA
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#52c41a', textAlign: 'center' }}>
              ₹{money(record.da)}
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
              Sp. Allow
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#52c41a', textAlign: 'center' }}>
              ₹{money(record.specialAllowance)}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Other Allowances - 4 columns per row */}
      <div style={{ background: '#e6f7ff', padding: 8, borderRadius: 4 }}>
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
          Other Allowances
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 6,
            marginBottom: 6,
          }}
        >
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
              CCA
            </div>
            <div style={{ fontWeight: 600, fontSize: 9, color: '#1890ff', textAlign: 'center' }}>
              ₹{money(record.cca)}
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
              Reimb
            </div>
            <div style={{ fontWeight: 600, fontSize: 9, color: '#1890ff', textAlign: 'center' }}>
              ₹{money(record.reimbersment)}
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
              Fuel
            </div>
            <div style={{ fontWeight: 600, fontSize: 9, color: '#1890ff', textAlign: 'center' }}>
              ₹{money(record.fuel_and_Maintainence)}
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
              Books
            </div>
            <div style={{ fontWeight: 600, fontSize: 9, color: '#1890ff', textAlign: 'center' }}>
              ₹{money(record.books_and_Periodicals)}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
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
              Attire
            </div>
            <div style={{ fontWeight: 600, fontSize: 9, color: '#1890ff', textAlign: 'center' }}>
              ₹{money(record.professional_Attire)}
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
              Driver
            </div>
            <div style={{ fontWeight: 600, fontSize: 9, color: '#1890ff', textAlign: 'center' }}>
              ₹{money(record.driver_Wages)}
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
              Mobile
            </div>
            <div style={{ fontWeight: 600, fontSize: 9, color: '#1890ff', textAlign: 'center' }}>
              ₹{money(record.mobilE_BIll)}
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
              Meal
            </div>
            <div style={{ fontWeight: 600, fontSize: 9, color: '#1890ff', textAlign: 'center' }}>
              ₹{money(record.meal_Voucher)}
            </div>
          </div>
        </div>
      </div>

      {/* Location & Department info */}
      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
        <div>
          <div style={{ color: '#888', fontSize: 9, fontWeight: 500, marginBottom: 2 }}>
            Location
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 10,
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.2',
            }}
          >
            {record.locationName || '-'}
          </div>
        </div>
        <div>
          <div style={{ color: '#888', fontSize: 9, fontWeight: 500, marginBottom: 2 }}>
            Department
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 10,
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.2',
            }}
          >
            {record.departmentName || '-'}
          </div>
        </div>
      </div>
    </div>
  )

  // Mobile columns - MAIN ROW: Code, Name, Designation, Gross + Expand (5 columns)
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
      width: 90,
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
      title: 'Designation',
      dataIndex: 'designationName',
      width: 85,
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
      title: 'Gross',
      dataIndex: 'monthlyGrossCTC',
      width: 75,
      render: (value) => (
        <div style={{ fontSize: 9, fontWeight: 600, color: '#52c41a', textAlign: 'center' }}>
          ₹{money(value)}
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

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchBgtSalaryMaster({ search })
      if (response.status === 200) {
        setTotalCount(response?.data?.data?.length || 0)
        setEmployeesListData(response?.data?.data || [])
      } else {
        setEmployeesListData([])
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchData()
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

  // common number renderer
  const money = (value) => (Number(value) === 0 ? 0 : Number(value).toFixed(2))

  // Full (desktop) columns
  const desktopColumns = [
    { title: 'E-CODE', dataIndex: 'ecode', key: 'ecode', ellipsis: true, width: 100 },
    { title: 'LOC CODE', dataIndex: 'stCode', key: 'stCode', ellipsis: true, width: 100 },
    {
      title: 'LOCATION',
      dataIndex: 'locationName',
      key: 'locationName',
      ellipsis: true,
      width: 150,
    },
    { title: 'EMP NAME', dataIndex: 'fulL_NAME', key: 'fulL_NAME', ellipsis: true, width: 150 },
    {
      title: 'DEPARTMENT',
      dataIndex: 'departmentName',
      key: 'departmentName',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'DESIGNATION',
      dataIndex: 'designationName',
      key: 'designationName',
      ellipsis: true,
      width: 150,
    },
    { title: 'BASIC', dataIndex: 'basicSalary', key: 'basicSalary', width: 100, render: money },
    { title: 'HRA', dataIndex: 'hra', key: 'hra', width: 100, render: money },
    { title: 'CCA', dataIndex: 'cca', key: 'cca', width: 100, render: money },
    { title: 'DA', dataIndex: 'da', key: 'da', width: 100, render: money },
    {
      title: 'SP. ALLOW.',
      dataIndex: 'specialAllowance',
      key: 'specialAllowance',
      width: 150,
      render: money,
    },
    { title: 'REIMB.', dataIndex: 'reimbersment', key: 'reimbersment', width: 100, render: money },
    {
      title: 'FUEL & MAINT.',
      dataIndex: 'fuel_and_Maintainence',
      key: 'fuel_and_Maintainence',
      width: 150,
      render: money,
    },
    {
      title: 'BOOKS & PERIODICALS',
      dataIndex: 'books_and_Periodicals',
      key: 'books_and_Periodicals',
      width: 150,
      render: money,
    },
    {
      title: 'PROF. ATTIRE',
      dataIndex: 'professional_Attire',
      key: 'professional_Attire',
      width: 120,
      render: money,
    },
    {
      title: 'DRIVER WAGES',
      dataIndex: 'driver_Wages',
      key: 'driver_Wages',
      width: 120,
      render: money,
    },
    {
      title: 'MOBILE BILL',
      dataIndex: 'mobilE_BIll',
      key: 'mobilE_BIll',
      width: 120,
      render: money,
    },
    {
      title: 'MEAL VOUCHER',
      dataIndex: 'meal_Voucher',
      key: 'meal_Voucher',
      width: 120,
      render: money,
    },
    {
      title: 'MONTHLY GROSS CTC (BGT)',
      dataIndex: 'monthlyGrossCTC',
      key: 'monthlyGrossCTC',
      ellipsis: true,
      width: 200,
      render: money,
    },
  ]

  const handleSearch = (e) => setSearch(e.target.value)

  const totalWidth = (isMobile ? mobileColumns : desktopColumns).reduce(
    (sum, col) => sum + (col.width || 150),
    0,
  )

  const columns = isMobile ? mobileColumns : desktopColumns

  return (
    <>
      <Pageheading title="Salary Master" />

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      {/* Toolbar */}
      <div className="def" style={{ paddingBottom: 10 }}>
        <TableBulkActionIcons
          totalRecords={totalCount}
          handleSearch={handleSearch}
          lodingLocal={lodingLocal}
          setlodingLocal={setlodingLocal}
          refreshData={fetchData}
          search={search}
          actionsMap={actionsMap}
          isMobile={isMobile}
        />

        <Table
          rowKey={(r, i) => r?.storeBudgetId || r?.ecode || `row_${i}`}
          columns={columns}
          dataSource={filteredData}
          bordered
          pagination={{
            current: currentPage,
            total: totalCount,
            position: ['bottomRight'],
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
          scroll={isMobile ? { x: 'max-content' } : { x: totalWidth, y: 'calc(100vh - 160px)' }}
          size={isMobile ? 'small' : 'middle'}
          tableLayout={isMobile ? 'fixed' : undefined}
          style={{ whiteSpace: 'nowrap' }}
          className={theme === 'dark' ? 'dark-theme' : ''}
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
  isMobile,
}) => {
  const { theme } = useSelector((state) => state.ui)

  const downloadStoreDataAsExcel = async () => {
    try {
      setlodingLocal(true)
      const { data, status } = await exportBgtSalaryStructureWithEmpDetailsToExcel()
      if (status === 200) {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `Budgeted_Salary_${new Date().toISOString()}.xlsx`
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

      <Row gutter={[8, 8]} align="middle">
        <Col xs={24} sm="auto" style={{ display: 'flex', gap: 8 }}>
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
            placeholder="Search by any field…"
            allowClear
            onChange={handleSearch}
            value={search}
            style={{ width: isMobile ? 150 : 300 }}
          />
        </Col>
      </Row>
    </div>
  )
}

export default Salary
