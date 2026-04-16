import React, { useEffect, useState } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, message, Dropdown } from 'antd'
import { ExportOutlined, UploadOutlined } from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import {
  exportBgtSalaryStructureWithEmpDetailsToExcel,
  exportEmployeeMaster,
  fetchBgtSalaryMaster,
  fetchPaidByBank,
  fetchPayroll,
  fetchWeeklyOffPolicy,
  fetchSalarySummery,
  exportSalarySummeryToExcel,
} from '../services/Services'
import { set } from '../redux/uiSlice'
import Pageheading from '../components/shared/Pageheading'

const { Search } = Input

const SalarySummery = () => {
  const [selectionType, setSelectionType] = useState('checkbox')
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [totalCount, setTotalCount] = useState(0)
  const [importExelModal, setimportExelModal] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [search, setSearch] = useState('')
  const dispatch = useDispatch()
  const { loading, theme } = useSelector((state) => state.ui)
  const [lodingLocal, setlodingLocal] = useState(false)

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchSalarySummery({ search, currentPage, pageSize })
      // console.log('res+++++++++++', response)

      if (response.status === 200) {
        setTotalCount(response?.data?.data?.totalCount)
        setEmployeesListData(response?.data?.data?.data)
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
  }, [search, currentPage, pageSize])

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
  }, [search])

  const columns = [
    {
      title: 'Location Code',
      dataIndex: 'loC_CD',
      key: 'loC_CD',
      width: 120,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: 'Location ECode',
      dataIndex: 'locBasedECode',
      key: 'locBasedECode',
      width: 150,
    },
    {
      title: 'E-Code',
      dataIndex: 'e_CODE',
      key: 'e_CODE',
      width: 100,
    },
    {
      title: 'Employee Name',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      width: 100,
    },
    {
      title: 'Joining Date',
      dataIndex: 'joininG_DATE',
      key: 'joininG_DATE',
      width: 150,
      render: (date) => (date ? new Date(date).toLocaleDateString() : 'N/A'),
    },
    {
      title: 'Mobile No',
      dataIndex: 'mobilE_NO_',
      key: 'mobilE_NO_',
      width: 120,
    },
    {
      title: 'Leaving Date',
      dataIndex: 'leavinG_DT',
      key: 'leavinG_DT',
      width: 150,
      render: (date) => (date ? new Date(date).toLocaleDateString() : 'N/A'),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 150,
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
    },
    // Bank Details Section
    {
      title: 'Bank Name',
      dataIndex: 'banK_NAME',
      key: 'banK_NAME',
      width: 250,
    },
    {
      title: 'Bank IFSC',
      dataIndex: 'banK_IFSC_CODE',
      key: 'banK_IFSC_CODE',
      width: 120,
    },
    {
      title: 'Account No',
      dataIndex: 'a_C_NO',
      key: 'a_C_NO',
      width: 150,
    },
    {
      title: 'UAN No',
      dataIndex: 'uaN_NO',
      key: 'uaN_NO',
      width: 120,
    },
    {
      title: 'PF No',
      dataIndex: 'p_F__No_',
      key: 'p_F__No_',
      width: 120,
    },
    {
      title: 'ESIC No',
      dataIndex: 'esicno',
      key: 'esicno',
      width: 120,
    },
    {
      title: 'PAN No',
      dataIndex: 'paN_NO',
      key: 'paN_NO',
      width: 120,
    },
    {
      title: 'Aadhar No',
      dataIndex: 'aadhaR_NO',
      key: 'aadhaR_NO',
      width: 150,
    },
    // Salary Details Section
    {
      title: 'Basic Salary',
      dataIndex: 'basiC_SALARY',
      key: 'basiC_SALARY',
      width: 120,
      render: (value) => (value == 0 ? 0 : Number(value).toFixed(2)),
    },
    {
      title: 'HRA',
      dataIndex: 'h_R_A_',
      key: 'h_R_A_',
      width: 100,
      render: (value) => (value == 0 ? 0 : Number(value).toFixed(2)),
    },
    {
      title: 'DA',
      dataIndex: 'd_A',
      key: 'd_A',
      width: 100,
      render: (value) => (value == 0 ? 0 : Number(value).toFixed(2)),
    },
    {
      title: 'CCA',
      dataIndex: 'c_C_A_',
      key: 'c_C_A_',
      width: 100,
      render: (value) => (value == 0 ? 0 : Number(value).toFixed(2)),
    },
    {
      title: 'Special Allowance',
      dataIndex: 'speciaL_ALLOWANCE',
      key: 'speciaL_ALLOWANCE',
      width: 150,
      render: (value) => (value == 0 ? 0 : Number(value).toFixed(2)),
    },
    {
      title: 'Fuel & Maintenance',
      dataIndex: 'fuel_and_Maintenance',
      key: 'fuel_and_Maintenance',
      width: 150,
      render: (value) => (value == 0 ? 0 : Number(value).toFixed(2)),
    },
    // ... all other salary components in similar format ...
    {
      title: 'Gross Earned',
      dataIndex: 'grosS_EARNING',
      key: 'grosS_EARNING',
      width: 150,
      render: (value) => (value == 0 ? 0 : Number(value).toFixed(2)),
    },
    {
      title: 'Net Salary',
      dataIndex: 'neT_SALARY_PAYABLE',
      key: 'neT_SALARY_PAYABLE',
      width: 150,
      render: (value) => (value == 0 ? 0 : Number(value).toFixed(2)),
    },
    // Eligibility Flags
    {
      title: 'PF Applicable',
      dataIndex: 'pfApplicable',
      key: 'pfApplicable',
      width: 120,
      render: (value) => (value ? 'Yes' : 'No'),
    },
    {
      title: 'ESIC Applicable',
      dataIndex: 'esicApplicable',
      key: 'esicApplicable',
      width: 120,
      render: (value) => (value ? 'Yes' : 'No'),
    },
    // Add all remaining fields in similar format:
    // ... (OT, Leaves, Attendance, etc.)
    {
      title: 'Present Days',
      dataIndex: 'attendence',
      key: 'attendence',
      width: 120,
    },
    {
      title: 'Payable Days',
      dataIndex: 'payablE_DAYS',
      key: 'payablE_DAYS',
      width: 120,
    },
    {
      title: 'EL Leave',
      dataIndex: 'eL_LEAVE_AVAILED',
      key: 'eL_LEAVE_AVAILED',
      width: 100,
    },
    {
      title: 'CL Leave',
      dataIndex: 'cL_LEAVE_AVAILED',
      key: 'cL_LEAVE_AVAILED',
      width: 100,
    },
    // Include all other leave related fields
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 200,
    },
  ]

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  return (
    <>
      <Pageheading title="Salary Summary" />
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
          scroll={{ x: 'max-contant', y: 450 }}
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
    ])
  }, [selectedRowKeys, totalRecords])

  const downloadStoreDataAsExcel = async () => {
    try {
      setlodingLocal(true)
      const { data, status } = await exportSalarySummeryToExcel()

      if (status === 200) {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `Salary_Summary_${new Date().toISOString()}.xlsx`
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
            <Tooltip placement="top" title={'Export'}>
              <Button
                style={{ marginLeft: 5 }}
                loading={lodingLocal}
                onClick={downloadStoreDataAsExcel}
              >
                <ExportOutlined />
              </Button>
            </Tooltip>
          </Col>
          <Search
            placeholder="Search by ecode..."
            allowClear
            onChange={handleSearch}
            style={{ width: 300, marginLeft: 5 }}
            value={search}
          />
        </Row>
      </div>
    </>
  )
}

export default SalarySummery
