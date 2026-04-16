import React, { useEffect, useState } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, message, Dropdown } from 'antd'
import { ExportOutlined, UploadOutlined } from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { exportEmployeeMaster, fetchBgtSalaryMaster } from '../services/Services'
import { set } from '../redux/uiSlice'
import Pageheading from '../components/shared/Pageheading'

const { Search } = Input

const LocEmp = () => {
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

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      // const response = await fetchBgtSalaryMaster({ search })
      const response = {}

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
      title: 'E-CODE',
      dataIndex: 'ecode',
      key: 'ecode',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Name',
      dataIndex: 'stCode',
      key: 'stCode',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Joining Date',
      dataIndex: 'locationName',
      ellipsis: true,
      key: 'locationName',
      width: 150,
    },
    {
      title: 'Leaving Date',
      ellipsis: true,
      dataIndex: 'fulL_NAME',
      key: 'fulL_NAME',
      width: 150,
    },
    {
      title: 'Designation',
      ellipsis: true,
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 150,
    },
    {
      title: 'Status',
      ellipsis: true,
      dataIndex: 'designationName',
      key: 'designationName',
      width: 150,
    },
    {
      title: 'Name of Bank',
      ellipsis: true,
      dataIndex: 'basicSalary',
      key: 'basicSalary',
      width: 150,
    },
    {
      title: 'IFSC Code',
      ellipsis: true,
      dataIndex: 'hra',
      key: 'hra',
      width: 150,
    },
    {
      title: 'A/C No.',
      ellipsis: true,
      dataIndex: 'cca',
      key: 'cca',
      width: 150,
    },
    {
      title: 'UAN No.',
      ellipsis: true,
      dataIndex: 'da',
      key: 'da',
      width: 150,
    },
    {
      title: 'PF No.',
      ellipsis: true,
      dataIndex: 'specialAllowance',
      key: 'specialAllowance',
      width: 150,
    },
    {
      title: 'ESI No.',
      ellipsis: true,
      dataIndex: 'reimbersment',
      key: 'reimbersment',
      width: 150,
    },
    {
      title: 'PAN No.',
      ellipsis: true,
      dataIndex: 'fuel_and_Maintainence',
      key: 'fuel_and_Maintainence',
      width: 150,
    },
    {
      title: 'Aadhar No.',
      ellipsis: true,
      dataIndex: 'books_and_Periodicals',
      key: 'books_and_Periodicals',
      width: 150,
    },
    {
      title: 'PF Applicable',
      ellipsis: true,
      dataIndex: 'professional_Attire',
      key: 'professional_Attire',
      width: 150,
    },
    {
      title: 'ESI Applicable',
      ellipsis: true,
      dataIndex: 'driver_Wages',
      key: 'driver_Wages',
      width: 150,
    },
    {
      title: 'FPF Applicable',
      ellipsis: true,
      dataIndex: 'mobilE_BIll',
      key: 'mobilE_BIll',
      width: 150,
    },
    {
      title: 'Q.T. Applicable',
      dataIndex: 'meal_Voucher',
      key: 'meal_Voucher',
      width: 150,
    },
    {
      title: 'P-TAX Applicable',
      ellipsis: true,
      dataIndex: 'monthlyGrossCTC',
      key: 'monthlyGrossCTC',
      width: 200,
    },
    {
      title: 'Bonus Applicable',
      ellipsis: true,
      dataIndex: 'monthlyGrossCTC',
      key: 'monthlyGrossCTC',
      width: 200,
    },
    {
      title: 'Week-off Pay Applicable',
      ellipsis: true,
      dataIndex: 'monthlyGrossCTC',
      key: 'monthlyGrossCTC',
      width: 200,
    },
  ]

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  return (
    <>
      <Pageheading title="LOC & EMP" />
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
          dataSource={filteredData}
          bordered={true}
          scroll={{ x: totalWidth, y: 450 }}
          style={{ whiteSpace: 'nowrap' }}
          className={theme === 'dark' ? 'dark-theme' : ''}
        />
      </div>
    </>
  )
}

const TableBulkActionIcons = ({
  totalRecords,
  selectedRowKeys,
  handleSearch,
  search,
  lodingLocal,
  setlodingLocal,
}) => {
  const { theme } = useSelector((state) => state.ui)

  const [statusSummary, setstatusSummary] = useState([
    {
      name: 'Total Rows',
      label: 'Pending Interview Schedule',
      count: 0,
      color: 'green',
      id: [1, 2, 3, 4, 5],
    },
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

export default LocEmp
