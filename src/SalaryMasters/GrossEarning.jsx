import { useEffect, useState } from 'react'
import { Space, Table, Row, Input, Button, Col, message, Grid } from 'antd'
import { ExportOutlined } from '@ant-design/icons'
import { ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { exportEmpAttendanceFormatToExcel, fetchGrossEarningMaster } from '../services/Services'
import { set } from '../redux/uiSlice'
import Pageheading from '../components/shared/Pageheading'
import { useActionsMap } from '../utils/useActionsMap'

const { Search } = Input
const { useBreakpoint } = Grid

const GrossEarning = () => {
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [lodingLocal, setlodingLocal] = useState(false)

  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)

  const { filteredSideMenu } = useSelector((state) => state?.auth || {})
  const actionsMap = useActionsMap(filteredSideMenu)

  const screens = useBreakpoint()
  const isMobile = !screens.md

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchGrossEarningMaster()
      if (response.status === 200) {
        const list = response?.data?.data || []
        setTotalCount(list.length)
        setEmployeesListData(list)
        setFilteredData(list)
      } else {
        setEmployeesListData([])
        setFilteredData([])
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Error fetching data:', error?.response?.data || error?.message)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const s = search?.trim().toLowerCase()
    if (s) {
      const newData =
        employeesListData.filter((row) =>
          Object.values(row).some((val) => String(val).toLowerCase().includes(s)),
        ) || []
      setFilteredData(newData)
      setTotalCount(newData.length)
    } else {
      setFilteredData(employeesListData)
      setTotalCount(employeesListData.length)
    }
  }, [search, employeesListData])

  // ========= Columns =========
  const desktopColumns = [
    { title: 'E-CODE', dataIndex: 'ecode', key: 'ecode', ellipsis: true, width: 150 },
    {
      title: 'LOC CODE',
      dataIndex: 'location_Code',
      key: 'location_Code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'EMP NAME',
      dataIndex: 'employee_Name',
      key: 'employee_Name',
      ellipsis: true,
      width: 170,
    },
    { title: 'DEPARTMENT', dataIndex: 'department', key: 'department', ellipsis: true, width: 150 },
    {
      title: 'DESIGNATION',
      dataIndex: 'designation',
      key: 'designation',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'BASIC',
      dataIndex: 'basicSalary_Actual_',
      key: 'basicSalary_Actual_',
      ellipsis: true,
      width: 150,
    },
    { title: 'HRA', dataIndex: 'hrA_Actual_', key: 'hrA_Actual_', ellipsis: true, width: 150 },
    { title: 'DA', dataIndex: 'dA_Actual_', key: 'dA_Actual_', ellipsis: true, width: 150 },
    { title: 'CCA', dataIndex: 'ccA_Actual_', key: 'ccA_Actual_', ellipsis: true, width: 150 },
    {
      title: 'SPECIAL ALLOWANCE',
      dataIndex: 'specialAllowance_Actual_',
      key: 'specialAllowance_Actual_',
      ellipsis: true,
      width: 180,
    },
    {
      title: 'EXTRA DAYS ALLOWANCE',
      dataIndex: 'extraDayAllowance',
      key: 'extraDayAllowance',
      ellipsis: true,
      width: 180,
    },
    {
      title: 'REIMBURSEMENT',
      dataIndex: 'reimbersment_Actual_',
      key: 'reimbersment_Actual_',
      ellipsis: true,
      width: 170,
    },
    {
      title: 'FUEL & MAINTENANCE',
      dataIndex: 'fuel_and_Maintenance_Actual_',
      key: 'fuel_and_Maintenance_Actual_',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'BOOKS & PERIODICALS',
      dataIndex: 'books_and_Periodicals_Actual_',
      key: 'books_and_Periodicals_Actual_',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'PROFESSIONAL ATTIRE',
      dataIndex: 'professional_Attire_Actual_',
      key: 'professional_Attire_Actual_',
      ellipsis: true,
      width: 180,
    },
    {
      title: 'DRIVER WAGES',
      dataIndex: 'driver_Wages_Actual_',
      key: 'driver_Wages_Actual_',
      ellipsis: true,
      width: 160,
    },
    {
      title: 'MOBILE BILL',
      dataIndex: 'mobile_Bill_Actual_',
      key: 'mobile_Bill_Actual_',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'MEAL VOUCHER',
      dataIndex: 'meal_Voucher_Actual_',
      key: 'meal_Voucher_Actual_',
      ellipsis: true,
      width: 160,
    },
    {
      title: 'MONTHLY GROSS CTC',
      dataIndex: 'monthly_Gross_CTC_Actual_',
      key: 'monthly_Gross_CTC_Actual_',
      ellipsis: true,
      width: 180,
    },
  ]

  // Compact subset for mobile (most relevant)
  const mobileColumns = [
    { title: 'E-CODE', dataIndex: 'ecode', key: 'ecode', ellipsis: true, width: 100 },
    { title: 'NAME', dataIndex: 'employee_Name', key: 'employee_Name', ellipsis: true, width: 160 },
    { title: 'LOC', dataIndex: 'location_Code', key: 'location_Code', ellipsis: true, width: 100 },
    {
      title: 'BASIC',
      dataIndex: 'basicSalary_Actual_',
      key: 'basicSalary_Actual_',
      ellipsis: true,
      width: 120,
    },
    { title: 'HRA', dataIndex: 'hrA_Actual_', key: 'hrA_Actual_', ellipsis: true, width: 110 },
    {
      title: 'GROSS CTC',
      dataIndex: 'monthly_Gross_CTC_Actual_',
      key: 'monthly_Gross_CTC_Actual_',
      ellipsis: true,
      width: 140,
    },
  ]

  const columns = isMobile ? mobileColumns : desktopColumns
  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  const handleSearch = (e) => setSearch(e.target.value)

  return (
    <>
      <Pageheading title="Gross Earning" />
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
          actionsMap={actionsMap}
          search={search}
          isMobile={isMobile}
        />

        <Table
          rowKey="storeBudgetId"
          columns={columns}
          pagination={{
            current: currentPage,
            position: ['bottomRight'],
            total: totalCount,
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handleTableChange,
          }}
          dataSource={filteredData}
          bordered
          scroll={{ x: totalWidth, y: isMobile ? 420 : 'calc(100vh - 160px)' }}
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
      const { data, status } = await exportEmpAttendanceFormatToExcel()
      if (status === 200) {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `Gross_${new Date().toISOString()}.xlsx`
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
      {/* Left: total rows pill */}
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
      <Row
        gutter={[8, 8]}
        align="middle"
        // style={{ marginLeft: isMobile ? 0 : 'auto', width: isMobile ? '100%' : 'auto' }}
      >
        <Col xs={24} sm="auto" style={{ display: 'flex', gap: 8 }}>
          {actionsMap?.export?.actionStatus && (
            <Button
              // style={{ width: isMobile ? '100%' : 'auto' }}
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
  )
}

export default GrossEarning
