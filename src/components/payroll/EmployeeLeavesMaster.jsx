import React, { useEffect, useState } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, message, Dropdown } from 'antd'
import { ExportOutlined, UploadOutlined } from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import {
  exportEmployeeMaster,
  fetchPaidByBank,
  fetchPayroll,
  fetchWeeklyOffHolidays,
} from '../../services/Services'
import { set } from '../../redux/uiSlice'
import EmployeeLeavesUploader from './EmployeeLeavesUploader'

const { Search } = Input

const EmployeeLeavesMaster = () => {
  const [selectionType, setSelectionType] = useState('checkbox')
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [searchTerm, setSerachTerm] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [importExelModal, setimportExelModal] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [search, setSearch] = useState('')
  const dispatch = useDispatch()
  const { loading, theme } = useSelector((state) => state.ui)
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [lodingLocal, setlodingLocal] = useState(false)

  const { data: empData } = useSelector((state) => state.auth)

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const token = localStorage.getItem('token') // Retrieve token from localStorage

      // console.log('search:', search)
      const response = await fetchWeeklyOffHolidays({
        pageNumber: currentPage,
        pageSize,
        eCode: empData?.ecode,
        search,
      })
      // console.log('fetchWeeklyOffHolidays api res:', response)

      if (response) {
        setTotalCount(response?.totalRecords)
        setEmployeesListData(response?.records)
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
  }, [currentPage, pageSize, debouncedSearch])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      sessionStorage.setItem('applicant-search', search)
    }, 500) // 500ms delay

    return () => clearTimeout(handler) // Clean up previous timeout
  }, [search])

  const columns = [
    {
      title: 'Emp Code',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: 'Store Code',
      dataIndex: 'locationCategoryName',
      key: 'locationCategoryName',
      ellipsis: true,
    },
    {
      title: 'Month',
      dataIndex: 'designationName',
      key: 'designationName',
    },
    {
      title: 'PF',
      dataIndex: 'budgetWeeklyOff',
      key: 'budgetWeeklyOff',
    },
    {
      title: 'ESIC',
      dataIndex: 'budgetHoliday',
      key: 'budgetHoliday',
    },
    {
      title: 'TDS',
      dataIndex: 'budgetHoliday',
      key: 'budgetHoliday',
    },
    {
      title: 'PTAX',
      dataIndex: 'budgetHoliday',
      key: 'budgetHoliday',
    },
    {
      title: 'Loan',
      dataIndex: 'budgetHoliday',
      key: 'budgetHoliday',
    },
    {
      title: 'Cash Short',
      dataIndex: 'budgetHoliday',
      key: 'budgetHoliday',
    },
    {
      title: 'Diesel Deduction',
      dataIndex: 'budgetHoliday',
      key: 'budgetHoliday',
    },
    {
      title: 'Penalty',
      dataIndex: 'budgetHoliday',
      key: 'budgetHoliday',
    },
    {
      title: 'LWF',
      dataIndex: 'budgetHoliday',
      key: 'budgetHoliday',
    },
  ]

  const applyFilters = (search) => {
    let filtered = employeesListData.filter((item) => {
      let searchMatch = true

      if (search && search?.trim() !== '') {
        searchMatch = Object.keys(item)?.some((key) => {
          let value = item[key]
          if (typeof value !== 'string') {
            value = String(value)
          }

          return value.toLowerCase().includes(search.toLowerCase())
        })
      }

      return searchMatch
    })

    setFilteredData(filtered)
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSerachTerm(value)
    applyFilters(value)
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  return (
    <>
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
        />
        <Table
          rowKey="storeBudgetId"
          // rowSelection={{
          //   type: selectionType,
          //   ...rowSelection,
          // }}
          columns={columns}
          pagination={{
            current: currentPage,
            position: ['bottomRight'],
            total: totalCount,
            pageSize: pageSize, // Set the number of items per page
            showSizeChanger: true, // Allow users to change page size
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handleTableChange,
          }}
          dataSource={employeesListData}
          bordered={true}
          scroll={{ x: 'max-content', y: 'calc(100vh - 160px)' }}
          style={{ whiteSpace: 'nowrap' }}
          className={theme === 'dark' ? 'dark-theme' : ''}
          // expandable={{
          //   expandedRowRender: (record) => (<>
          //     <p style={{ margin: 0 }}> <span style={{fontWeight:700}}>keyResponsibility : </span><br/>{record.keyResponsibility || 'No keyResponsibility details'}</p>
          //     <p style={{ margin: 0 }}><span style={{fontWeight:700}}>keySkill : </span><br/>{record.keySkill || 'No keySkill details'}</p>
          //     </>
          //   ),
          //   rowExpandable: (record) => true, // or add conditions
          // }}
        />
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
      {
        name: 'Selected Rows',
        label: 'Rejected',
        count: selectedRowKeys.length,
        color: 'blue',
        id: [7],
      },
    ])
  }, [selectedRowKeys, totalRecords])

  const downloadStoreDataAsExcel = async ({ isActive, allEmployee, companyId, lodingLocal }) => {
    try {
      setlodingLocal(true)
      // await dispatch(set({ loading: true }))
      // message.info('Export is in queue, you will get an alert once the download is completed');
      toast.info('Export is in queue, you will get an alert once the download is completed')
      const { data, status } = await exportEmployeeMaster({ isActive, allEmployee, companyId })

      if (status === 200) {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `Employee_${new Date().toISOString()}.xlsx`
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Export initiated successfully')
        // form.resetFields()
        // setIsExportAttendanceModalOpen(false)
      }
    } catch (error) {
      console.error('api eror', error)
      message.error('Export failed')
    } finally {
      // await dispatch(set({ loading: true }))
      setlodingLocal(false)
    }
  }

  const items = [
    {
      key: '11',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: true, allEmployee: true, companyId: 0 })
          }
        >
          Export All Employees
        </div>
      ),
    },
    {
      key: '12',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: true, allEmployee: false, companyId: 0 })
          }
        >
          Export All Active Employees
        </div>
      ),
    },
    {
      key: '13',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: false, allEmployee: false, companyId: 0 })
          }
        >
          Export All InActive Employees
        </div>
      ),
    },
    {
      key: '1',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: true, allEmployee: true, companyId: 1 })
          }
        >
          Export All V2R Employees
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: true, allEmployee: true, companyId: 2 })
          }
        >
          Export All V2S Employees
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: true, allEmployee: true, companyId: 3 })
          }
        >
          Export All PT Employees
        </div>
      ),
    },
    {
      key: '4',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: true, allEmployee: false, companyId: 1 })
          }
        >
          Export Active V2R Employees
        </div>
      ),
    },
    {
      key: '5',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: false, allEmployee: false, companyId: 1 })
          }
        >
          Export InActive V2R Employees
        </div>
      ),
    },
    {
      key: '6',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: true, allEmployee: false, companyId: 2 })
          }
        >
          Export Active V2S Employees
        </div>
      ),
    },
    {
      key: '7',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: false, allEmployee: false, companyId: 2 })
          }
        >
          Export InActive V2S Employees
        </div>
      ),
    },
    {
      key: '8',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: true, allEmployee: false, companyId: 3 })
          }
        >
          Export Active PT Employees
        </div>
      ),
    },
    {
      key: '9',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: false, allEmployee: false, companyId: 3 })
          }
        >
          Export InActive PT Employees
        </div>
      ),
    },
  ]

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
        <EmployeeLeavesUploader
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

        {/* <Space>
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
          >
            <Tooltip placement="top" title={label}>
              <span
                style={{
                  display: 'inline-block',
                  width: '100%',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  fontSize: 12,
                  padding: '0 8px', // Optional: adds some spacing inside
                }}
              >
                {count} {name}{' '}
              </span>
            </Tooltip>
          </div>
        ))}
      </Space> */}
        <Row>
          <Col>
            {/* <Tooltip placement="top" title={'Send Email'} style={{ marginLeft: 5 }}>
            <Button
              onClick={() => {
                message.success('Email Sent Successfully')
              }}
            >
              <MailOutlined />
            </Button>
          </Tooltip>
          <Tooltip placement="top" title={'Add Candidate'}>
            <Link to={'/employee/add_new'} style={{ marginLeft: 5 }}>
              <Button>
                <PlusOutlined />
              </Button>
            </Link>
          </Tooltip> */}

            {/* <Tooltip placement="top" title={'Import'} >
            <Button style={{ marginLeft: 5 }} onClick={() => setimportExelModal(true)} disabled>
              <ImportOutlined />
            </Button>
          </Tooltip> */}
            {/* <Tooltip placement="top" title={'Export'}>
            <Button style={{ marginLeft: 5 }} onClick={downloadStoreDataAsExcel} >
              <ExportOutlined />
            </Button>
          </Tooltip> */}
            <Tooltip placement="top" title={'Upload Employees'}>
              <Button style={{ marginLeft: 5 }} onClick={() => setIsEmpUploadVisible(true)}>
                <UploadOutlined />
              </Button>
            </Tooltip>

            <Tooltip placement="top" title={'Export'}>
              <Dropdown menu={{ items }} trigger={['click']} disabled>
                <Button style={{ marginLeft: 5 }} loading={lodingLocal}>
                  <ExportOutlined />
                </Button>
              </Dropdown>
            </Tooltip>
          </Col>
          <Search
            //   placeholder="Search by name, role, or tags"
            placeholder="Search in table..."
            allowClear
            onChange={handleSearch}
            // onBlur={(e) => sessionStorage.setItem('employee-search', e.target.value)}
            style={{ width: 300, marginLeft: 5 }}
            value={search}
          />
        </Row>
      </div>
    </>
  )
}

export default EmployeeLeavesMaster
