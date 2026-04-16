import React, { useEffect, useState } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, message, Dropdown, Grid } from 'antd'
import { ExportOutlined, FileDoneOutlined, UploadOutlined } from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { GetAllEcodeZoneRegionClusterMapping } from '../../services/Services'
import { set } from '../../redux/uiSlice'
import EmpZoneRegionClusterMappingUploader from './EmpZoneRegionClusterUploader'
import Pageheading from '../../components/shared/Pageheading'
import { exportExcelFromFrontend } from '../../components/shared/ExportExceFromFrontend'
import useMediaQuery from '../../hooks/useMediaQuery'

const { Search } = Input
const { useBreakpoint } = Grid

const EmpZoneRegionClusterMapping = () => {
  const [selectionType, setSelectionType] = useState('checkbox')
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [totalCount, setTotalCount] = useState(0)
  const [importExelModal, setimportExelModal] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [search, setSearch] = useState('')
  const dispatch = useDispatch()
  const { loading, theme } = useSelector((state) => state.ui)
  const [lodingLocal, setlodingLocal] = useState(false)

  const isMobile = useMediaQuery('(max-width: 768px)')

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    try {
      await dispatch(set({ loading: true }))
      const response = await GetAllEcodeZoneRegionClusterMapping()
      console.log('emp-zone-region-cluster response: ', response)

      if (response?.status === 200) {
        setEmployeesListData(response?.data?.data || [])
      } else {
        message.error(response?.response?.data?.message || 'Failed to fetch data')
      }
    } catch (error) {
      console.log('error:', error)
      message.error(error?.response?.data?.message || 'Failed to fetch data')
    } finally {
      await dispatch(set({ loading: false }))
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

  // ✅ Desktop columns
  const desktopColumns = [
    {
      title: 'Emp Code',
      dataIndex: 'ecode',
      key: 'ecode',
      ellipsis: true,
      width: 90,
    },
    {
      title: 'Zone',
      dataIndex: 'zone',
      key: 'zone',
      ellipsis: true,
      width: 90,
    },
    {
      title: 'Cluster',
      dataIndex: 'cluster',
      key: 'cluster',
      ellipsis: true,
      width: 90,
    },
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
      ellipsis: true,
      width: 90,
    },
  ]

  // ✅ Mobile columns (compact, all 4 fields visible)
  const mobileColumns = [
    {
      title: 'E-Code',
      dataIndex: 'ecode',
      width: 70,
      render: (text) => <div style={{ fontSize: 11, fontWeight: 500 }}>{text || '-'}</div>,
    },
    {
      title: 'Zone',
      dataIndex: 'zone',
      width: 80,
      render: (text) => <div style={{ fontSize: 11, fontWeight: 500 }}>{text || '-'}</div>,
    },
    {
      title: 'Cluster',
      dataIndex: 'cluster',
      width: 80,
      render: (text) => <div style={{ fontSize: 11, fontWeight: 500 }}>{text || '-'}</div>,
    },
    {
      title: 'Region',
      dataIndex: 'region',
      width: 80,
      render: (text) => <div style={{ fontSize: 11, fontWeight: 500 }}>{text || '-'}</div>,
    },
  ]

  const columns = isMobile ? mobileColumns : desktopColumns
  const totalWidth = desktopColumns.reduce((sum, col) => sum + (col.width || 150), 0)

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  return (
    <>
      <Pageheading title="Emp-Zone-Region-Cluster Uploader" />
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
          setimportExelModal={setimportExelModal}
          totalRecords={totalCount}
          selectedRowKeys={selectedRowKeys}
          handleSearch={handleSearch}
          lodingLocal={lodingLocal}
          setlodingLocal={setlodingLocal}
          refreshData={fetchData}
          filteredData={filteredData}
          isMobile={isMobile}
        />

        {isMobile ? (
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
          <Table
            rowKey="storeBudgetId"
            columns={columns}
            dataSource={filteredData}
            bordered
            pagination={{
              current: currentPage,
              position: ['bottomRight'],
              total: totalCount,
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: handleTableChange,
            }}
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
  setimportExelModal,
  totalRecords,
  selectedRowKeys,
  handleSearch,
  search,
  lodingLocal,
  setlodingLocal,
  refreshData,
  filteredData,
  isMobile,
}) => {
  const dispatch = useDispatch()
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
  }, [selectedRowKeys, totalRecords])

  const downloadDataInExcel = () => {
    const columns = [
      { header: 'Emp Code', key: 'ecode' },
      { header: 'Zone', key: 'zone' },
      { header: 'Cluster', key: 'cluster' },
      { header: 'Region', key: 'region' },
    ]

    setlodingLocal(true)

    const response = exportExcelFromFrontend(columns, filteredData, 'EmpZoneRegionCluster.xlsx')

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
        <EmpZoneRegionClusterMappingUploader
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

export default EmpZoneRegionClusterMapping
