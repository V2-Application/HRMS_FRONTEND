import { useEffect, useState } from 'react'
import { Table, Input, Tooltip, Button, message } from 'antd'
import { ExportOutlined, UploadOutlined } from '@ant-design/icons'
import { ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEmpAttendanceMaster } from '../../services/Services'
import { set } from '../../redux/uiSlice'
import EmpAttendanceUploader from './EmpAttendanceUploader'
import Pageheading from '../../components/shared/Pageheading'
import { exportExcelFromFrontend } from '../../components/shared/ExportExceFromFrontend'
import useMediaQuery from '../../hooks/useMediaQuery'

const { Search } = Input

const EmpAttendannceMaster = () => {
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)
  const [lodingLocal, setlodingLocal] = useState(false)

  const isMobile = useMediaQuery('(max-width: 768px)')

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchEmpAttendanceMaster()

      if (response.status === 200) {
        setTotalCount(response?.data?.data?.length)
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

  // ✅ Updated Mobile columns - All fields in main row
  const getMobileColumns = () => [
    {
      title: 'E-Code',
      dataIndex: 'e_CODE',
      width: 80,
      render: (text) => <div style={{ fontSize: 10, fontWeight: 500 }}>{text || '-'}</div>,
    },
    {
      title: 'Month',
      dataIndex: 'month',
      width: 70,
      render: (text) => <div style={{ fontSize: 10 }}>{text || '-'}</div>,
    },
    {
      title: 'Machine',
      dataIndex: 'machine',
      width: 70,
      render: (text) => (
        <div style={{ fontSize: 10, fontWeight: 600, color: '#1890ff' }}>{text || 0}</div>
      ),
    },
    {
      title: 'Manual',
      dataIndex: 'manual',
      width: 70,
      render: (text) => (
        <div style={{ fontSize: 10, fontWeight: 600, color: '#52c41a' }}>{text || 0}</div>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totaL_PRESENT',
      width: 60,
      render: (text) => (
        <div style={{ fontSize: 10, fontWeight: 600, color: '#ff4d4f' }}>{text || 0}</div>
      ),
    },
    {
      title: 'W/Off',
      dataIndex: 'presenT_ON_WEEKLYOFF',
      width: 60,
      render: (text) => (
        <div style={{ fontSize: 10, fontWeight: 600, color: '#fa8c16' }}>{text || 0}</div>
      ),
    },
  ]

  const desktopColumns = [
    {
      title: 'Emp Code',
      dataIndex: 'e_CODE',
      key: 'e_CODE',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
      width: 150,
    },
    {
      title: 'Machine',
      dataIndex: 'machine',
      key: 'machine',
      width: 150,
    },
    {
      title: 'Manual',
      dataIndex: 'manual',
      key: 'manual',
      width: 150,
    },
    {
      title: 'Total Present',
      dataIndex: 'totaL_PRESENT',
      key: 'totaL_PRESENT',
      width: 150,
    },
    {
      title: 'Present on Weekly-off',
      dataIndex: 'presenT_ON_WEEKLYOFF',
      key: 'presenT_ON_WEEKLYOFF',
      width: 150,
    },
  ]

  const columns = isMobile ? getMobileColumns() : desktopColumns
  const totalWidth = desktopColumns.reduce((sum, col) => sum + (col.width || 150), 0)

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  return (
    <>
      <Pageheading title="Emp Code Attendance Master Uploader" />
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
          filteredData={filteredData}
          isMobile={isMobile}
        />

        {isMobile ? (
          <Table
            rowKey={(r, i) => r?.storeBudgetId || r?.e_CODE || `row_${i}`}
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
          <Table
            rowKey="storeBudgetId"
            columns={columns}
            pagination={{
              current: currentPage,
              position: ['bottomRight'],
              total: totalCount,
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: handleTableChange,
            }}
            dataSource={filteredData}
            bordered={true}
            scroll={{ x: totalWidth, y: 'calc(100vh - 160px)' }}
            style={{ whiteSpace: 'nowrap' }}
            className={theme === 'dark' ? 'dark-theme' : ''}
          />
        )}
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
  refreshData,
  filteredData,
  isMobile,
}) => {
  const { theme } = useSelector((state) => state.ui)
  const [isEmpUploadVisible, setIsEmpUploadVisible] = useState(false)

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
        count: totalRecords,
        color: 'green',
        id: [1, 2, 3, 4, 5],
      },
    ])
  }, [totalRecords])

  const downloadDataInExcel = () => {
    const columns = [
      { header: 'Emp Code', key: 'e_CODE' },
      { header: 'Month', key: 'month' },
      { header: 'Machine', key: 'machine' },
      { header: 'Manual', key: 'manual' },
      { header: 'Total Present', key: 'totaL_PRESENT' },
      { header: 'Present on Weekly-Off', key: 'presenT_ON_WEEKLYOFF' },
    ]

    setlodingLocal(true)

    const response = exportExcelFromFrontend(columns, filteredData, 'EmpAttendanceMaster.xlsx')

    if (response.success) {
      message.success(response.message)
    } else {
      message.error(response.message)
    }

    setlodingLocal(false)
  }

  return (
    <>
      {isEmpUploadVisible && (
        <EmpAttendanceUploader
          isVisible={isEmpUploadVisible}
          setIsVisible={setIsEmpUploadVisible}
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
          {statusSummary.map(({ name, label, count, color, id }, index) => (
            <div
              key={index}
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
                    textAlign: 'center',
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
                      textAlign: 'center',
                    }}
                  >
                    {count} {name}
                  </span>
                </Tooltip>
              )}
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
          <Tooltip placement="top" title="Upload Employees">
            <Button onClick={() => setIsEmpUploadVisible(true)}>
              <UploadOutlined />
            </Button>
          </Tooltip>

          <Tooltip placement="top" title="Export">
            <Button loading={lodingLocal} onClick={downloadDataInExcel}>
              <ExportOutlined />
            </Button>
          </Tooltip>

          <Search
            placeholder="Search in table..."
            allowClear
            onChange={handleSearch}
            style={{ width: isMobile ? 150 : 300 }}
            value={search}
          />
        </div>
      </div>
    </>
  )
}

export default EmpAttendannceMaster
