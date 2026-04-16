import React, { useEffect, useState } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, message, Dropdown, Grid } from 'antd'
import { ExportOutlined, UploadOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import {
  exportEmployeeMaster,
  fetchApplicabilityMaster,
  fetchEmpAttendanceMaster,
  fetchEmpCodeSeatMaster,
  fetchEmpSalaryStructure,
  fetchEmpTDSMaster,
  fetchPaidByBank,
  fetchPayroll,
  fetchWeeklyOffPolicy,
} from '../../services/Services'
import { set } from '../../redux/uiSlice'
import EmpSalaryStructureUploader from './EmpSalaryStructureUploader'
import Pageheading from '../../components/shared/Pageheading'
import { useActionsMap } from '../../utils/useActionsMap'
import { exportExcelFromFrontend } from '../../components/shared/ExportExceFromFrontend'
import useMediaQuery from '../../hooks/useMediaQuery'

const { Search } = Input

const EmpSalaryStructureMaster = () => {
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

  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)
  console.log('>>>actionsMap', actionsMap)

  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  const handleToggleCard = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const expandedRowRender = (record) => (
    <div style={{ padding: 12, background: '#fafafa', fontSize: 11 }}>
      {/* Section 1: Allowances - 3 columns per row */}
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
          Additional Allowances
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
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
              SPL Allow
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#52c41a', textAlign: 'center' }}>
              ₹{Number(record.spL_ALLOWANCE_RATE || 0).toLocaleString()}
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
              Reimb
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#52c41a', textAlign: 'center' }}>
              ₹{Number(record.reimB_RATE || 0).toLocaleString()}
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
              CCA
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#52c41a', textAlign: 'center' }}>
              ₹{Number(record.ccA_RATE || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Perks - 3 columns per row */}
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
          Perks & Benefits
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            marginBottom: 8,
          }}
        >
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
              Fuel & Maint
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#1890ff', textAlign: 'center' }}>
              ₹{Number(record.fuel_and_Maintainence || 0).toLocaleString()}
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
              Books
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#1890ff', textAlign: 'center' }}>
              ₹{Number(record.books_and_Periodicals || 0).toLocaleString()}
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
              Prof Attire
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#1890ff', textAlign: 'center' }}>
              ₹{Number(record.professionalAttire || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
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
              Driver Wages
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#1890ff', textAlign: 'center' }}>
              ₹{Number(record.driverWages || 0).toLocaleString()}
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
              Mobile Bill
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#1890ff', textAlign: 'center' }}>
              ₹{Number(record.mobilE_BILL || 0).toLocaleString()}
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
              Meal Voucher
            </div>
            <div style={{ fontWeight: 600, fontSize: 10, color: '#1890ff', textAlign: 'center' }}>
              ₹{Number(record.mealVoucher || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Mobile columns - Main salary components
  const mobileColumns = [
    {
      title: 'Code',
      dataIndex: 'e_CODE',
      width: 60,
      render: (text) => <div style={{ fontSize: 10, fontWeight: 500 }}>{text || '-'}</div>,
    },
    {
      title: 'Basic',
      dataIndex: 'basiC_RATE',
      width: 65,
      render: (val) => (
        <div style={{ fontSize: 10, fontWeight: 600, color: '#52c41a', textAlign: 'center' }}>
          ₹{Number(val || 0).toLocaleString()}
        </div>
      ),
    },
    {
      title: 'HRA',
      dataIndex: 'hrA_RATE',
      width: 60,
      render: (val) => (
        <div style={{ fontSize: 10, fontWeight: 600, color: '#52c41a', textAlign: 'center' }}>
          ₹{Number(val || 0).toLocaleString()}
        </div>
      ),
    },
    {
      title: 'DA',
      dataIndex: 'dA_RATE',
      width: 55,
      render: (val) => (
        <div style={{ fontSize: 10, fontWeight: 600, color: '#52c41a', textAlign: 'center' }}>
          ₹{Number(val || 0).toLocaleString()}
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 40,
      render: (_, record, index) => {
        const uniqueKey = record.storeBudgetId || record.e_CODE || `row_${index}`
        return (
          <Button
            type="text"
            size="small"
            icon={
              expandedCards[uniqueKey] ? (
                <MinusOutlined style={{ fontSize: 11 }} />
              ) : (
                <PlusOutlined style={{ fontSize: 11 }} />
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
      const response = await fetchEmpSalaryStructure({
        // pageNumber: currentPage,
        // pageSize,
        // eCode: empData?.ecode,
        // search,
      })
      // console.log('emp salary structure api res:', response)

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
      title: 'Basic Rate',
      dataIndex: 'basiC_RATE',
      key: 'basiC_RATE',
      width: 150,
    },
    {
      title: 'HRA Rate',
      dataIndex: 'hrA_RATE',
      key: 'hrA_RATE',
      width: 150,
    },
    {
      title: 'DA Rate',
      dataIndex: 'dA_RATE',
      key: 'dA_RATE',
      width: 150,
    },
    {
      title: 'CCA Rate',
      dataIndex: 'ccA_RATE',
      key: 'ccA_RATE',
      width: 150,
    },
    {
      title: 'SPL Allowance Rate',
      dataIndex: 'spL_ALLOWANCE_RATE',
      key: 'spL_ALLOWANCE_RATE',
      width: 150,
    },
    {
      title: 'Reimbursement Rate',
      dataIndex: 'reimB_RATE',
      key: 'reimB_RATE',
      width: 150,
    },
    {
      title: 'Fuel & Maintenance',
      dataIndex: 'fuel_and_Maintainence',
      key: 'fuel_and_Maintainence',
      width: 150,
    },
    {
      title: 'Books & Periodicals',
      dataIndex: 'books_and_Periodicals',
      key: 'books_and_Periodicals',
      width: 150,
    },
    {
      title: 'Professional Attire',
      dataIndex: 'professionalAttire',
      key: 'professionalAttire',
      width: 150,
    },
    {
      title: 'Driver Wages',
      dataIndex: 'driverWages',
      key: 'driverWages',
      width: 150,
    },
    {
      title: 'Mobile Bill',
      dataIndex: 'mobilE_BILL',
      key: 'mobilE_BILL',
      width: 150,
    },
    {
      title: 'Meal Voucher',
      dataIndex: 'mealVoucher',
      key: 'mealVoucher',
      width: 150,
    },
  ]

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  return (
    <>
      <Pageheading title="Emp Salary Structure Uploader" />
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
      { header: 'Basic Rate', key: 'basiC_RATE' },
      { header: 'HRA Rate', key: 'hrA_RATE' },
      { header: 'DA Rate', key: 'dA_RATE' },
      { header: 'CCA Rate', key: 'ccA_RATE' },
      { header: 'SPL Allowance Rate', key: 'spL_ALLOWANCE_RATE' },
      { header: 'Reimbursement Rate', key: 'reimB_RATE' },
      { header: 'Fuel & Maintenance', key: 'fuel_and_Maintainence' },
      { header: 'Books & Periodicals', key: 'books_and_Periodicals' },
      { header: 'Professional Attire', key: 'professionalAttire' },
      { header: 'Driver Wages', key: 'driverWages' },
      { header: 'Mobile Bill', key: 'mobilE_BILL' },
      { header: 'Mobile Voucher', key: 'mealVoucher' },
    ]

    setlodingLocal(true)

    const response = exportExcelFromFrontend(columns, filteredData, 'EmpSalaryStructureMaster.xlsx')

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
        <EmpSalaryStructureUploader
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
              <Tooltip placement="top" title={'Upload Emp Salary Structure'}>
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

export default EmpSalaryStructureMaster
