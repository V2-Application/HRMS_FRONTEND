import React, { useEffect, useState } from 'react'
import { Table, Row, Input, Col, DatePicker } from 'antd'
import { ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLeaveMaster, fetchSalarySlipDetails } from '../services/Services'
import { set } from '../redux/uiSlice'
import Pageheading from '../components/shared/Pageheading'
import moment from 'moment'
const { MonthPicker } = DatePicker

const { Search } = Input

const MonthSalary = () => {
  const monthKeyMap = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Aug',
    '09': 'Sep',
    10: 'Oct',
    11: 'Nov',
    12: 'Dec',
  }

  const today = new Date()
  const curMonth = String(today.getMonth() + 1).padStart(2, '0')
  const curYear = String(today.getFullYear()).slice(-2)
  const curMonthyear = `${monthKeyMap[curMonth]}-${curYear}`

  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(null)
  const dispatch = useDispatch()

  const { loading, theme } = useSelector((state) => state.ui)

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchSalarySlipDetails({
        month: curMonthyear,
        pageNumber: currentPage,
        pageSize,
        search,
      })

      if (response?.status) {
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

      setTotalCount(new_data?.length)
      setFilteredData(new_data)
    } else {
      setTotalCount(employeesListData?.length)
      setFilteredData(employeesListData)
    }
  }, [search, employeesListData])

  const columns = [
    {
      title: 'E Code',
      dataIndex: 'ecode',
      key: 'ecode',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Emp Name',
      dataIndex: 'stCode',
      key: 'stCode',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Designation',
      dataIndex: 'locationName',
      ellipsis: true,
      key: 'locationName',
      width: 150,
    },
    {
      title: 'Date of Joining',
      dataIndex: 'fulL_NAME',
      key: 'fulL_NAME',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Location Name',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Department',
      dataIndex: 'designationName',
      ellipsis: true,
      key: 'designationName',
      width: 150,
    },
    {
      title: 'Bank A/C No.',
      dataIndex: 'month',
      key: 'month',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'PAN No.',
      ellipsis: true,
      dataIndex: 'ttL_OPN_Leave',
      key: 'ttL_OPN_Leave',
      width: 150,
    },
    {
      title: 'Bank Name',
      ellipsis: true,
      dataIndex: 'ttL_CLS_Leave',
      key: 'ttL_CLS_Leave',
      width: 150,
    },
    {
      title: 'No. of Days',
      ellipsis: true,
      dataIndex: 'ttL_EARN_Leave',
      key: 'ttL_EARN_Leave',
      width: 150,
    },
    {
      title: 'IFSC Code',
      dataIndex: 'ttL_AVAIL_Leave',
      ellipsis: true,
      key: 'ttL_AVAIL_Leave',
      width: 150,
    },
    {
      title: 'Universal A/C No.',
      ellipsis: true,
      dataIndex: 'compOffBalance',
      key: 'compOffBalance',
      width: 150,
    },
    {
      title: 'ESIC No.',
      ellipsis: true,
      dataIndex: 'compOff_CLS_Leave',
      key: 'compOff_CLS_Leave',
      width: 150,
    },
    {
      title: 'Basic Salary',
      ellipsis: true,
      dataIndex: 'compOffAcquired',
      key: 'compOffAcquired',
      width: 150,
    },
    {
      title: 'CCA',
      ellipsis: true,
      dataIndex: 'compOffUsed',
      key: 'compOffUsed',
      width: 150,
    },
    {
      title: 'DA',
      ellipsis: true,
      dataIndex: 'cL_Opening',
      key: 'cL_Opening',
      width: 150,
    },
    {
      title: 'HRA',
      ellipsis: true,
      dataIndex: 'casualLeaveBalance',
      key: 'casualLeaveBalance',
      width: 150,
    },
    {
      title: 'Incentive',
      ellipsis: true,
      dataIndex: 'casualLeaveAcquired',
      key: 'casualLeaveAcquired',
      width: 150,
    },
    {
      title: 'Special Allowance',
      ellipsis: true,
      dataIndex: 'casualLeaveUsed',
      key: 'casualLeaveUsed',
      width: 150,
    },
    {
      title: 'Extra Allowance',
      ellipsis: true,
      dataIndex: 'eL_Opening',
      key: 'eL_Opening',
      width: 150,
    },
    {
      title: 'EPF',
      ellipsis: true,
      dataIndex: 'eL_CLS_Leave',
      key: 'eL_CLS_Leave',
      width: 150,
    },
    {
      title: 'ESIC',
      ellipsis: true,
      dataIndex: 'earnedLeaveAcquired',
      key: 'earnedLeaveAcquired',
      width: 150,
    },
    {
      title: 'TDS',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'P-Tax',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'Loan',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'Cash Short',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'Diesel Deduction',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'Penalty',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'LWF',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'Fuel & Maint.',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'Books & Period.',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'Prof. Attire',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'Driver Wages',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'Mobile Bill',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'Meal Voucher',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'Gross Earnings',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'Gross Deduction',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'Final Gross Earnings Netpay',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'EC PF',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'EC EPS',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'ERC PF',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'E VPF',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'Payable Days',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'Earned Leave Bal.',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'Earned Leave Used',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'Casual Leave Bal.',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'Casual Leave Used',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
    {
      title: 'Month',
      dataIndex: 'earnedLeaveUsed',
      ellipsis: true,
      key: 'earnedLeaveUsed',
      width: 150,
    },
  ]

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  return (
    <>
      <Pageheading title="Month Salary" />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      <div className="def" style={{ paddingBottom: 10 }}>
        <div
          style={{
            padding: 5,
            display: 'flex',
            justifyContent: 'end',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <Row>
            <Col>
              {' '}
              <MonthPicker
                value={selectedMonth}
                onChange={(date) => setSelectedMonth(date)}
                placeholder="Select month"
              />
            </Col>
            <Search
              placeholder="Search in table..."
              allowClear
              onChange={handleSearch}
              style={{ width: 300, marginLeft: 5 }}
              value={search}
            />
          </Row>
        </div>
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
          scroll={{ x: totalWidth, y: 450 }}
          style={{ whiteSpace: 'nowrap' }}
          className={theme === 'dark' ? 'dark-theme' : ''}
        />
      </div>
    </>
  )
}

export default MonthSalary
