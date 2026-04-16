import React, { useEffect, useState } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, message, Dropdown, Grid } from 'antd'
import { ExportOutlined, UploadOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import useMediaQuery from '../../hooks/useMediaQuery'

import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import {
  exportEmployeeMaster,
  fetchEmpAttendanceMaster,
  fetchEmpCodeSeatMaster,
  fetchEmpDegreeQualification,
  fetchEmpJoiningReleavingDetails,
  fetchEmpStatutoryDetails,
  fetchPaidByBank,
  fetchPayroll,
  fetchWeeklyOffPolicy,
} from '../../services/Services'
import { set } from '../../redux/uiSlice'
import EmpJoiningReleavingUploader from './EmpJoiningReleavingUploader'
import Pageheading from '../../components/shared/Pageheading'
import { useActionsMap } from '../../utils/useActionsMap'
import { exportExcelFromFrontend } from '../../components/shared/ExportExceFromFrontend'

const { Search } = Input

const EmpJoiningReleavingMaster = () => {
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

  const { filteredSideMenu } = useSelector((state) => state?.auth)
  const actionsMap = useActionsMap(filteredSideMenu)
  console.log('>>>>actionsMap', actionsMap)

  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  const handleToggleCard = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Mobile expanded row - Joining details (3 columns)
  const expandedRowRender = (record) => (
    <div style={{ padding: 12, background: '#fafafa', fontSize: 11 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <div>
          <div
            style={{
              color: '#888',
              fontSize: 11,
              fontWeight: 500,
              marginBottom: 3,
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
            {record.joineD_LOCATION || '-'}
          </div>
        </div>
        <div>
          <div
            style={{
              color: '#888',
              fontSize: 11,
              fontWeight: 500,
              marginBottom: 3,
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
            {record.joineD_DEPARTMENT || '-'}
          </div>
        </div>
        <div>
          <div
            style={{
              color: '#888',
              fontSize: 11,
              fontWeight: 500,
              marginBottom: 3,
              textAlign: 'center',
            }}
          >
            Designation
          </div>
          <div
            style={{
              fontWeight: 600,
              fontSize: 10,
              color: '#1890ff',
              textAlign: 'center',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.2',
            }}
          >
            {record.joineD_DESIGNATION || '-'}
          </div>
        </div>
      </div>
    </div>
  )

  // Mobile columns - MAIN ROW: Code, Join Date, Relieve Date, Store + Expand (5 columns)
  const mobileColumns = [
    {
      title: 'Code',
      dataIndex: 'e_CODE',
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
      title: 'Join',
      dataIndex: 'joininG_DATE',
      width: 70,
      render: (date) => (
        <div style={{ fontSize: 11, fontWeight: 600, color: '#52c41a', textAlign: 'center' }}>
          {date ? date.split('T')[0] : '-'}
        </div>
      ),
    },
    {
      title: 'Relieve',
      dataIndex: 'releavinG_DATE',
      width: 70,
      render: (date) => (
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: date ? '#ff4d4f' : '#999',
            textAlign: 'center',
          }}
        >
          {date ? date.split('T')[0] : 'Active'}
        </div>
      ),
    },
    {
      title: 'Store',
      dataIndex: 'storE_CODE',
      width: 55,
      render: (text) => (
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#1890ff',
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
      title: '',
      key: 'action',
      width: 35,
      render: (_, record, index) => {
        const uniqueKey = record.storeBudgetId || record.e_CODE || `row_${index}`
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
      const response = await fetchEmpJoiningReleavingDetails()

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

  const columns = [
    {
      title: 'Emp Code',
      dataIndex: 'e_CODE',
      key: 'e_CODE',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Joining Date',
      dataIndex: 'joininG_DATE',
      key: 'joininG_DATE',
      width: 150,
      render: (date) => (date === null ? null : date?.split('T')[0]),
    },
    {
      title: 'Releaving Date',
      dataIndex: 'releavinG_DATE',
      key: 'releavinG_DATE',
      width: 150,
      render: (date) => (date === null ? null : date?.split('T')[0]),
    },
    {
      title: 'Joined Location',
      dataIndex: 'joineD_LOCATION',
      key: 'joineD_LOCATION',
      width: 150,
    },
    {
      title: 'Joined Department',
      dataIndex: 'joineD_DEPARTMENT',
      key: 'joineD_DEPARTMENT',
      width: 150,
    },
    {
      title: 'Joined Designation',
      dataIndex: 'joineD_DESIGNATION',
      key: 'joineD_DESIGNATION',
      width: 150,
    },
    {
      title: 'Store Code',
      dataIndex: 'storE_CODE',
      key: 'storE_CODE',
      width: 150,
    },
  ]

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  return (
    <>
      <Pageheading title="Emp Joining Releaving Uploader" />
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
          search={search}
          actionsMap={actionsMap}
          filteredData={filteredData}
        />
        {isMobile ? (
          <Table
            rowKey={(r, i) => r?.storeBudgetId || r?.e_CODE || `row_${i}`}
            columns={mobileColumns}
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
              expandedRowKeys: Object.keys(expandedCards).filter((key) => expandedCards[key]),
              expandedRowRender: expandedRowRender,
              showExpandColumn: false,
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
      {/* <ExcelImportModal
        importExelModal={importExelModal}
        setimportExelModal={setimportExelModal}
        title_fields={title_fields}
      /> */}
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
  actionsMap,
  filteredData,
}) => {
  // console.log('>>>>>>>>>selectedRowKeys', selectedRowKeys);
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
    // { name: 'Completed', label: 'Completed', count: 15, color: 'red', id: [6] },
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
      { header: 'Emp Code', key: 'e_CODE' },
      { header: 'Joining Date', key: 'joininG_DATE' },
      { header: 'Releaving Date', key: 'releavinG_DATE' },
      { header: 'Joined Location', key: 'joineD_LOCATION' },
      { header: 'Joined Department', key: 'joineD_DEPARTMENT' },
      { header: 'Joined Designation', key: 'joineD_DESIGNATION' },
      { header: 'Store Code', key: 'storE_CODE' },
    ]

    setlodingLocal(true)

    const response = exportExcelFromFrontend(
      columns,
      filteredData,
      'EmpJoiningReleavingMaster.xlsx',
    )

    if (response.success) {
      message.success(response.message)
    } else {
      message.error(response.message)
    }

    setlodingLocal(false)
  }

  const { useBreakpoint } = Grid
  const screens = useBreakpoint()
  const isMobile = !screens.md

  return (
    <>
      {/* {isEmpUploadVisible && (
        <EmployeesUploadModal
          isVisible={isEmpUploadVisible}
          setIsVisible={setIsEmpUploadVisible}
          refreshData={refreshData}
        />
      )} */}
      {isEmpUploadVisible && (
        <EmpJoiningReleavingUploader
          isVisible={isEmpUploadVisible}
          setIsVisible={setIsEmpUploadVisible}
          refreshData={refreshData}
        />
      )}
      <div
        style={{
          padding: 5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space>
          {statusSummary.map(({ name, label, count, color, id }, index) => (
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
                // ✅ No tooltip
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
                // ✅ Tooltip for other statuses (if any)
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
          <Col>
            {actionsMap?.upload?.actionStatus && (
              <Tooltip placement="top" title={'Upload Emp Joining Releaving'}>
                <Button style={{ marginLeft: 5 }} onClick={() => setIsEmpUploadVisible(true)}>
                  <UploadOutlined />
                </Button>
              </Tooltip>
            )}

            {actionsMap?.export?.actionStatus && (
              <Tooltip placement="top" title={'Export'}>
                <Button style={{ marginLeft: 5 }} loading={lodingLocal}>
                  <ExportOutlined />
                </Button>
              </Tooltip>
            )}
          </Col>
          <Search
            //   placeholder="Search by name, role, or tags"
            placeholder="Search in table..."
            allowClear
            onChange={handleSearch}
            // onBlur={(e) => sessionStorage.setItem('employee-search', e.target.value)}
            style={isMobile ? { width: 150, marginLeft: 5 } : { width: 300, marginLeft: 5 }}
            value={search}
          />
        </Row>
      </div>
    </>
  )
}

export default EmpJoiningReleavingMaster
