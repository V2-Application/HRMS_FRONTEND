import React, { useEffect, useState } from 'react'
import {
  Space,
  Table,
  Row,
  Input,
  Tooltip,
  Button,
  Col,
  message,
  Dropdown,
  DatePicker,
  Grid,
} from 'antd'
import { ExportOutlined, UploadOutlined } from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { exportEmployeeMaster, fetchCompOff, fetchEmpBonus } from '../../services/Services'
import { set } from '../../redux/uiSlice'
import BonusUploader from './BonusUploader'
import Pageheading from '../../components/shared/Pageheading'
import { exportExcelFromFrontend } from '../../components/shared/ExportExceFromFrontend'
import { useActionsMap } from '../../utils/useActionsMap'
import useMediaQuery from '../../hooks/useMediaQuery'

const { Search } = Input

const BonusList = () => {
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

  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)
  console.log('>>>actionsMap grouplist:', actionsMap)

  // Mobile columns - ALL 3 fields in single row (no expansion needed)
  const mobileColumns = [
    {
      title: 'E-Code',
      dataIndex: 'ecode',
      width: 60,
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
      title: 'Month-Year',
      dataIndex: 'monthYear',
      width: 90,
      render: (date) => (
        <div style={{ fontSize: 11, fontWeight: 600, color: '#1890ff', textAlign: 'center' }}>
          {date ? date.split('T')[0] : '-'}
        </div>
      ),
    },
    {
      title: 'CO Earned',
      dataIndex: 'compOffEarn',
      width: 70,
      render: (text) => (
        <div style={{ fontSize: 11, fontWeight: 600, color: '#52c41a', textAlign: 'center' }}>
          {text || '0'} {text === 1 || text === '1' ? 'day' : 'days'}
        </div>
      ),
    },
  ]

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchEmpBonus()
      console.log('response emp bonus: ', response)

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
      dataIndex: 'e_Code',
      key: 'e_Code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Emp Name',
      dataIndex: 'fullName',
      key: 'fullName',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Date',
      dataIndex: 'bonusDate',
      key: 'bonusDate',
      ellipsis: true,
      width: 150,
      render: (date) => (date ? String(date).split('T')[0] : '-'),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Account No.',
      dataIndex: 'acc_Number',
      key: 'acc_Number',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'UTR',
      dataIndex: 'utr',
      key: 'utr',
      ellipsis: true,
      width: 150,
    },
  ]

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  return (
    <>
      <Pageheading title="Bonus Uploader" />
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
          filteredData={filteredData}
          actionsMap={actionsMap}
        />
        {isMobile ? (
          <Table
            rowKey={(r, i) => r?.storeBudgetId || r?.ecode || `row_${i}`}
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
  filteredData,
  actionsMap,
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
      { header: 'Emp Code', key: 'ecode' },
      { header: 'Month-Year', key: 'monthYear' },
      { header: 'Comp Off Earn', key: 'compOffEarn' },
    ]

    setlodingLocal(true)

    const response = exportExcelFromFrontend(columns, filteredData, 'CompOffMaster.xlsx')

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
        <BonusUploader
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
              <Tooltip placement="top" title={'Upload Employees'}>
                <Button style={{ marginLeft: 5 }} onClick={() => setIsEmpUploadVisible(true)}>
                  <UploadOutlined />
                </Button>
              </Tooltip>
            )}

            {actionsMap?.export?.actionStatus && (
              <Tooltip placement="top" title={'Export'}>
                <Button
                  style={{ marginLeft: 5 }}
                  loading={lodingLocal}
                  onClick={downloadDataInExcel}
                >
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

export default BonusList
