import React, { useEffect, useState } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, message } from 'antd'
import {
  ExportOutlined,
  UploadOutlined,
  EditOutlined, // ✅ NEW
} from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom' // ✅ NEW
import {
  exportBgtSalaryStructureWithEmpDetailsToExcel,
  fetchFullandFinal,
} from '../services/Services'
import { set } from '../redux/uiSlice'
import Pageheading from '../components/shared/Pageheading'
import dayjs from 'dayjs'

const { Search } = Input

const FullandFinal = () => {
  /* ---------------------- state & hooks ---------------------- */
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [totalCount, setTotalCount] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [search, setSearch] = useState('')
  const [lodingLocal, setlodingLocal] = useState(false)

  const dispatch = useDispatch()
  const { loading, theme } = useSelector((state) => state.ui)
  const navigate = useNavigate() // ✅ NEW

  /* ---------------------- data fetch ------------------------- */
  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const { data } = await fetchFullandFinal({
        search: search.trim(),
        pageNumber: currentPage,
        pageSize: Number(pageSize),
      })
      const rows = data?.employees || []
      setEmployeesListData(rows)
      // setTotalCount(data?.totalCount || rows.length)
    } catch (err) {
      console.error(err)
      setEmployeesListData([])
      // setTotalCount(0)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchData()
  }, [])
  useEffect(() => {
    const q = search.trim().toLowerCase()
    if (q) {
      const rows = employeesListData.filter((obj) =>
        Object.values(obj).some((v) => String(v).toLowerCase().includes(q)),
      )
      setFilteredData(rows)
      setTotalCount(rows.length)
    } else {
      setFilteredData(employeesListData)
      setTotalCount(employeesListData.length)
    }
  }, [search, employeesListData])

  /* ---------------------- column helper ---------------------- */
  // const handleEdit = (recordd) => {
  //   // 👉 route to EmployeeProfile; adjust path/params as required
  //   navigate(`/employee/update/view/${recordd?.employeeId}`, { fromFullAndFinal: true })

  // }

  const handleEdit = (recordd) => {
    navigate(`/employee/update/view/${recordd?.employeeId}`, {
      state: { fromFullAndFinal: true },
    })
  }

  const columns = [
    { title: 'E‑CODE', dataIndex: 'ecode', key: 'ecode', width: 150, ellipsis: true },
    { title: 'LOC CODE', dataIndex: 'stCode', key: 'stCode', width: 150, ellipsis: true },
    {
      title: 'LOCATION',
      dataIndex: 'locationName',
      key: 'locationName',
      width: 150,
      ellipsis: true,
    },
    { title: 'EMP NAME', dataIndex: 'fullName', key: 'fullName', width: 150, ellipsis: true },
    {
      title: 'DEPARTMENT',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'DESIGNATION',
      dataIndex: 'designationName',
      key: 'designationName',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'DATE OF RESIGNATION',
      dataIndex: 'dateOfResignation',
      key: 'dateOfResignation',
      width: 200,
      ellipsis: true,
      render: (d) => (d ? dayjs(d).format('DD‑MM‑YYYY') : '-'),
    },
    {
      title: 'LAST WORKING DAY',
      dataIndex: 'dateOfLeft',
      key: 'dateOfLeft',
      width: 175,
      ellipsis: true,
      render: (d) => (d ? dayjs(d).format('DD‑MM‑YYYY') : '-'),
    },
    { title: 'RESIGNATION STATUS', dataIndex: '', key: 'status', width: 190, ellipsis: true },

    /* ------------ DETAILS column with Edit icon -------------- */
    {
      title: 'DETAILS',
      key: 'details',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Edit">
          <EditOutlined
            style={{ color: '#1890ff', cursor: 'pointer' }}
            onClick={() => handleEdit(record)}
          />
        </Tooltip>
      ),
    },
    // {
    //   title: 'DETAILS',
    //   key: 'details',
    //   width: 100,
    //   align: 'center',
    //   render: (_, record) => (
    //     <Tooltip title="Edit">
    //       <Link
    //         to={`/employee/update/view/${record.employeeId}`}
    //          // fast render when state available
    //       >

    //         <EditOutlined style={{ color: '#1890ff' }} />
    //       </Link>
    //     </Tooltip>
    //   ),
    // },
  ]

  const totalWidth = columns.reduce((s, c) => s + (c.width || 150), 0)

  /* ---------------------- handlers --------------------------- */
  const handleSearch = (e) => {
    setCurrentPage(1)
    setSearch(e.target.value)
  }

  return (
    <>
      <Pageheading title="Full & Final Settlement" />
      <ToastContainer position="top-right" autoClose={2000} pauseOnHover />
      {/* Bulk action / search bar */}
      <TableBulkActionIcons
        totalRecords={totalCount}
        selectedRowKeys={selectedRowKeys}
        handleSearch={handleSearch}
        lodingLocal={lodingLocal}
        setlodingLocal={setlodingLocal}
        refreshData={fetchData}
        search={search}
      />
      {/* Main table */}
      <div style={{ paddingBottom: 10 }}>
        <Table
          rowKey="employeeId"
          columns={columns}
          dataSource={filteredData}
          bordered
          scroll={{ x: totalWidth, y: 450 }}
          className={theme === 'dark' ? 'dark-theme' : ''}
          pagination={{
            current: currentPage,
            total: totalCount,
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (p, ps) => {
              setCurrentPage(p)
              setPageSize(ps)
            },
          }}
        />
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
      const { data, status } = await exportBgtSalaryStructureWithEmpDetailsToExcel()

      if (status === 200) {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `Salary_Structure_${new Date().toISOString()}.xlsx`
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

export default FullandFinal
