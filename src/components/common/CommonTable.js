// Line 1 - Update imports
import React, { useEffect, useState, useCallback } from 'react' // ADD useCallback
import {
  Space,
  Table,
  Tag,
  Row,
  Input,
  Tooltip,
  Button,
  Modal,
  Col,
  Switch,
  message,
  Dropdown,
  Checkbox,
} from 'antd'
import {
  ImportOutlined,
  ExportOutlined,
  UserSwitchOutlined,
  MailOutlined,
  PlusOutlined,
  EditOutlined,
  StepForwardOutlined,
  UploadOutlined,
  EyeOutlined,
  MinusOutlined, // ADD THIS
} from '@ant-design/icons'

// Add this import for your hook
import useMediaQuery from '../../hooks/useMediaQuery' // Adjust path as needed

import { toast, ToastContainer } from 'react-toastify'
import { Link } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { useDispatch, useSelector } from 'react-redux'
import dayjs from 'dayjs'
import EmployeesUploadModal from '../../employees/EmployeesUploadModal'
import ExcelImportModal from '../modals/ExcelimportModal'
import {
  exportEmployeeMaster,
  fetchJobOpenings,
  getEmployeeList,
  markEmployeeActiveStatus,
} from '../../services/Services'
import { set } from '../../redux/uiSlice'
import EmployeeActiveInactiveModal from '../modals/EmployeeActiveInactiveModal'
import Pageheading from '../shared/Pageheading'
import { useActionsMap } from '../../utils/useActionsMap'

const { Search } = Input

const FilterDropdown = ({ dataIndex, dataList, filterValues, setFilterValues, confirm, title }) => {
  const [searchText, setSearchText] = useState('')

  const filteredOptions = dataList.filter((item) =>
    item.toLowerCase().includes(searchText.toLowerCase()),
  )

  const handleChange = (checkedValues) => {
    setFilterValues(checkedValues)
  }

  const handleReset = () => {
    setFilterValues([])
    setSearchText('')
    confirm()
  }

  return (
    <div style={{ padding: 8, width: 215 }}>
      <Input
        placeholder={`Search ${title}`}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 8, display: 'block' }}
      />

      <div style={{ maxHeight: 150, overflowY: 'auto', paddingRight: 8 }}>
        <Checkbox.Group
          value={filterValues}
          onChange={handleChange}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          {filteredOptions.map((value) => (
            <Checkbox key={value} value={value}>
              {value}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>

      <Space style={{ marginTop: 8 }}>
        <Button type="primary" size="small" onClick={() => confirm()}>
          Filter
        </Button>
        <Button size="small" onClick={handleReset}>
          Reset
        </Button>
      </Space>
    </div>
  )
}

const CommonTable = () => {
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
  const [designationNameFilterValues, setDesignationNameFilterValues] = useState([])
  const [locationNameFilterValues, setLocationNameFilterValues] = useState([])
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  // console.log('filteredData:', filteredData)

  const handleToggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const filteredSideMenu = useSelector((state) => state.auth.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const token = localStorage.getItem('token') // Retrieve token from localStorage

      // console.log('search:', search)
      const response = await fetchJobOpenings()
      // console.log('employees api res:', response)

      if (response) {
        const formattedData = response?.data?.map((dt, idx) => ({
          ...dt,
          rowId: idx,
        }))
        setTotalCount(response?.length)
        setEmployeesListData(formattedData)
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
    // }, [currentPage, pageSize, debouncedSearch])
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
      sessionStorage.setItem('applicant-search', search)
    }, 500) // 500ms delay

    return () => clearTimeout(handler) // Clean up previous timeout
  }, [search])

  const title_fields = [
    {
      label: 'Designation',
      key: 'firstName',
      alternateMatches: ['FIRST NAME'],
      fieldType: { type: 'input' },
      example: 'John',
      validations: [{ rule: 'required', errorMessage: 'First Name is required' }],
    },
    {
      label: 'Middle Name',
      key: 'middleName',
      alternateMatches: ['MIDDLE NAME'],
      fieldType: { type: 'input' },
      example: 'Alan',
    },
    {
      label: 'Last Name',
      key: 'lastName',
      alternateMatches: ['LAST NAME'],
      fieldType: { type: 'input' },
      example: 'Doe',
      validations: [{ rule: 'required', errorMessage: 'Last Name is required' }],
    },
    {
      label: 'Email',
      key: 'email',
      alternateMatches: ['EMAIL ADDRESS'],
      fieldType: { type: 'input' },
      example: 'john@example.com',
      validations: [
        { rule: 'required', errorMessage: 'Email is required' },
        { rule: 'email', errorMessage: 'Invalid email format' },
      ],
    },
    {
      label: 'Mobile',
      key: 'mobile',
      alternateMatches: ['MOBILE'],
      fieldType: { type: 'input' },
      example: '9876543210',
      validations: [{ rule: 'required', errorMessage: 'Mobile number is required' }],
    },
    {
      label: 'Date of Birth',
      key: 'dob',
      alternateMatches: ['DOB'],
      fieldType: { type: 'date' },
      example: '1990-01-01',
    },
    {
      label: 'Gender',
      key: 'gender',
      fieldType: { type: 'select', options: ['Male', 'Female', 'Other'] },
      example: 'Male',
    },
    {
      label: 'Designation',
      key: 'designation',
      fieldType: { type: 'input' },
      example: 'Software Engineer',
    },
    {
      label: 'Department',
      key: 'department',
      fieldType: { type: 'input' },
      example: 'Engineering',
    },
    {
      label: 'Joining Date',
      key: 'joiningDate',
      fieldType: { type: 'date' },
      example: '2023-08-15',
    },
    {
      label: 'Gross Salary',
      key: 'grossSalary',
      fieldType: { type: 'input' },
      example: '50000.00',
    },
    {
      label: 'PAN Number',
      key: 'panNumber',
      fieldType: { type: 'input' },
      example: 'ABCDE1234F',
    },
    {
      label: 'Aadhar Number',
      key: 'aadharNumber',
      fieldType: { type: 'input' },
      example: '123412341234',
    },
    {
      label: 'Marital Status',
      key: 'maritalStatus',
      alternateMatches: ['MARITIAL STATUS'],
      fieldType: { type: 'select', options: ['Single', 'Married', 'Divorced', 'Widowed'] },
      example: 'Single',
    },
    {
      label: 'Nationality',
      key: 'nationality',
      fieldType: { type: 'input' },
      example: 'Indian',
    },
  ]

  const columns = [
    {
      title: 'Designation',
      dataIndex: 'designationName',
      key: 'designationName',
      // width: 200,
      filteredValue: designationNameFilterValues.length ? designationNameFilterValues : null,
      onFilter: (value, record) => designationNameFilterValues.includes(record.designationName),
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Designation"
          dataIndex="designationName"
          dataList={[...new Set(employeesListData?.map((item) => item?.designationName))]}
          filterValues={designationNameFilterValues}
          setFilterValues={setDesignationNameFilterValues}
          confirm={confirm}
        />
      ),
      width: 200,
      ellipsis: true,
      // filterIcon: (filtered) => (
      //   <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      // ),
    },
    {
      title: 'Designation',
      dataIndex: 'departmentName',
      key: 'departmentName',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      // width: 200,
      ellipsis: true,
      filteredValue: locationNameFilterValues.length ? locationNameFilterValues : null,
      onFilter: (value, record) => locationNameFilterValues.includes(record.location),
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Location"
          dataIndex="locationName"
          dataList={[...new Set(employeesListData.map((item) => item.location))]}
          filterValues={locationNameFilterValues}
          setFilterValues={setLocationNameFilterValues}
          confirm={confirm}
        />
      ),
      width: 200,
      // filterIcon: (filtered) => (
      //   <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      // ),
    },
    {
      title: 'Store Code',
      dataIndex: 'loC_CODE',
      key: 'loC_CODE',
    },
    {
      title: 'Seat Budget',
      dataIndex: 'seatBudget',
      key: 'seatBudget',
    },
    {
      title: 'Emp Count',
      dataIndex: 'empCount',
      key: 'empCount',
    },
    {
      title: 'Vacancy',
      dataIndex: 'vacancy',
      key: 'vacancy',
    },
  ]

  actionsMap?.edit?.actionStatus &&
    columns.push({
      title: 'Action',
      fixed: 'right',
      key: 'id',
      render: (_, record, index) => (
        <Space size="middle">
          {/* <Link to={`/employee/update/${record.employeeId}`}> */}
          <Tooltip placement="top" title={'Disabled'}>
            <EditOutlined style={{ fontSize: 18 }} />
          </Tooltip>
          {/* </Link> */}
        </Space>
      ),
      width: 100,
    })

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  useEffect(() => {
    const new_search = String(search).toLowerCase().trim()

    if (new_search.length === 0) {
      setFilteredData(employeesListData)
    } else {
      const filtered = employeesListData?.filter((dt) =>
        Object.values(dt)?.some((d) => String(d).toLowerCase().trim().includes(new_search)),
      )

      setFilteredData(filtered)
    }
  }, [search, employeesListData])

  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  return (
    <>
      <Pageheading title="Openings" />
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
          actionsMap={actionsMap}
        />
        {!isMobile ? (
          <Table
            rowKey="rowId"
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
            expandable={{
              expandedRowRender: (record) => (
                <>
                  <p style={{ margin: 0 }}>
                    <span style={{ fontWeight: 700 }}>keyResponsibility : </span>
                    <br />
                    {record.keyResponsibility || 'Not Available'}
                  </p>
                  <p style={{ margin: 0 }}>
                    <span style={{ fontWeight: 700 }}>keySkill : </span>
                    <br />
                    {record.keySkills || 'Not Available'}
                  </p>
                </>
              ),
              rowExpandable: (record) => true,
            }}
          />
        ) : (
          <div>
            <div
              style={{
                backgroundColor: '#fafafa',
                borderRadius: '8px 8px 0 0',
                border: '1px solid #d9d9d9',
                borderBottom: '2px solid #1890ff',
                position: 'sticky',
                top: 0,
                zIndex: 100,
              }}
            >
              <table
                style={{
                  width: '100%',
                  tableLayout: 'fixed',
                  borderCollapse: 'collapse',
                  fontSize: 11,
                }}
              >
                <colgroup>
                  <col style={{ width: '30%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Designation
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Location
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Vacancy
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Action
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            {filteredData
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((record) => {
                const isExpanded = expandedCards[record.rowId]

                return (
                  <div
                    key={record.rowId}
                    style={{ border: '1px solid #d9d9d9', borderTop: 'none', background: '#fff' }}
                  >
                    <table
                      style={{
                        width: '100%',
                        tableLayout: 'fixed',
                        borderCollapse: 'collapse',
                        fontSize: 11,
                      }}
                    >
                      <colgroup>
                        <col style={{ width: '30%' }} />
                        <col style={{ width: '25%' }} />
                        <col style={{ width: '25%' }} />
                        <col style={{ width: '20%' }} />
                      </colgroup>
                      <tbody>
                        <tr>
                          <td
                            style={{
                              padding: '8px 4px',
                              textAlign: 'center',
                              fontSize: 10,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {record.designationName || '-'}
                          </td>
                          <td
                            style={{
                              padding: '8px 4px',
                              textAlign: 'center',
                              fontSize: 10,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {record.location || '-'}
                          </td>
                          <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: 10 }}>
                            {record.vacancy || '-'}
                          </td>
                          <td
                            style={{
                              padding: '8px 4px',
                              textAlign: 'center',
                              display: 'flex',
                              gap: 4,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            {actionsMap?.edit?.actionStatus && (
                              <Tooltip title="Edit">
                                <EditOutlined style={{ fontSize: 14 }} />
                              </Tooltip>
                            )}
                            <Button
                              type="text"
                              size="small"
                              icon={isExpanded ? <MinusOutlined /> : <PlusOutlined />}
                              onClick={() => handleToggleCard(record.rowId)}
                              style={{ padding: '2px 4px', fontSize: 10 }}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {isExpanded && (
                      <div
                        style={{
                          padding: 8,
                          background: '#fafafa',
                          borderTop: '1px solid #e8e8e8',
                          fontSize: 10,
                        }}
                      >
                        <Row gutter={[4, 6]}>
                          <Col span={6}>
                            <div
                              style={{
                                color: '#8c8c8c',
                                marginBottom: 2,
                                fontSize: 9,
                                textAlign: 'center',
                              }}
                            >
                              Department
                            </div>
                            <div
                              style={{
                                fontWeight: 500,
                                fontSize: 9,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                textAlign: 'center',
                              }}
                            >
                              {record.departmentName || '-'}
                            </div>
                          </Col>
                          <Col span={6}>
                            <div
                              style={{
                                color: '#8c8c8c',
                                marginBottom: 2,
                                fontSize: 9,
                                textAlign: 'center',
                              }}
                            >
                              Store Code
                            </div>
                            <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
                              {record.loC_CODE || '-'}
                            </div>
                          </Col>
                          <Col span={6}>
                            <div
                              style={{
                                color: '#8c8c8c',
                                marginBottom: 2,
                                fontSize: 9,
                                textAlign: 'center',
                              }}
                            >
                              Seat Budget
                            </div>
                            <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
                              {record.seatBudget || '-'}
                            </div>
                          </Col>
                          <Col span={6}>
                            <div
                              style={{
                                color: '#8c8c8c',
                                marginBottom: 2,
                                fontSize: 9,
                                textAlign: 'center',
                              }}
                            >
                              Emp Count
                            </div>
                            <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
                              {record.empCount || '-'}
                            </div>
                          </Col>
                        </Row>
                      </div>
                    )}
                  </div>
                )
              })}

            <div
              style={{
                marginTop: 16,
                textAlign: 'center',
                padding: 12,
                background: '#fafafa',
                border: '1px solid #d9d9d9',
                borderRadius: 4,
              }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ fontSize: 12 }}>
                  Showing {(currentPage - 1) * pageSize + 1} -{' '}
                  {Math.min(currentPage * pageSize, totalCount)} of {totalCount} items
                </div>
                <Space>
                  <Button
                    size="small"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span style={{ fontSize: 12 }}>
                    Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                  </span>
                  <Button
                    size="small"
                    disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </Space>
              </Space>
            </div>
          </div>
        )}
      </div>
      <ExcelImportModal
        importExelModal={importExelModal}
        setimportExelModal={setimportExelModal}
        title_fields={title_fields}
      />
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
      {isEmpUploadVisible && (
        <EmployeesUploadModal
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
          flexWrap: 'wrap',
          gap: 10,
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
            {actionsMap?.upload?.actionStatus && (
              <Tooltip placement="top" title={'Upload Openings'}>
                <Button
                  style={{ marginLeft: 5 }}
                  onClick={() => setIsEmpUploadVisible(true)}
                  disabled
                >
                  <UploadOutlined />
                </Button>
              </Tooltip>
            )}

            {actionsMap?.export?.actionStatus && (
              <Tooltip placement="top" title={'Export'}>
                <Button style={{ marginLeft: 5 }} loading={lodingLocal} disabled>
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
            style={{ width: 300, marginLeft: 5 }}
            value={search}
          />
        </Row>
      </div>
    </>
  )
}

export default CommonTable
