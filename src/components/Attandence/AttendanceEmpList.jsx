import React, { useEffect, useState, useCallback } from 'react'
import axiosInstance from '../../services/axiosInstance'
import { useDispatch, useSelector } from 'react-redux'
import { Button, message, Table, Input, Row, Col, Space } from 'antd'
import { set } from '../../redux/uiSlice'
import { RightOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { setSelectedAttendanceEmpCode } from '../../redux/authSlice'
import useMediaQuery from '../../hooks/useMediaQuery'

const { Search } = Input

const AttendanceEmpList = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { employeeId, role, firstName, lastName, ecode } = useSelector((state) => state?.auth?.data)
  const allEmployeesAllowed = ['master', 'hr', 'superadmin', 'it superadmin']
  const [messageApi, contextHolder] = message.useMessage()
  const fullName = `${firstName} ${lastName}`

  const isMobile = useMediaQuery('(max-width: 768px)') // ADD THIS
  const [expandedCards, setExpandedCards] = useState({}) // ADD THIS

  const handleToggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  // states
  const [empData, setEmpData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1) // ADD THIS
  const [pageSize, setPageSize] = useState(100) // ADD THIS

  const handleSelectEmpCode = (ecode, fullName) => {
    dispatch(setSelectedAttendanceEmpCode({ ecode, fullName }))
    navigate('/attandance/track', { state: { from: location.pathname } })
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'fullName',
    },
    {
      title: 'E code',
      dataIndex: 'ecode',
    },
    {
      title: 'Store Name',
      dataIndex: 'locationName',
    },
    {
      title: 'Store Code',
      dataIndex: 'stCode',
    },
    {
      title: 'View',
      render: (_, record) => (
        <Button
          type="default"
          size="small"
          onClick={() => handleSelectEmpCode(record?.ecode, record?.fullName)}
        >
          <RightOutlined />
        </Button>
      ),
    },
  ]

  const fetchAllEmployees = async () => {
    try {
      dispatch(set({ loading: true }))

      const response = await axiosInstance.get(
        `api/EmployeeNew/GetEmployeeDetailsWithCards?pageNumber=1&pageSize=1000000&mode=all`,
      )
      // console.log('response emp: ', response)

      if (response.status === 200) {
        const employees =
          response.data?.employees
            // ?.filter((data) => data?.isActive === true)
            ?.map((emp, index) => ({
              ...emp,
              key: index,
            })) || []

        setEmpData(employees)
      }
    } catch (error) {
      console.error('Error fetching all employees:', error)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  const fetchReporteeData = async () => {
    try {
      dispatch(set({ loading: true }))

      const response = await axiosInstance.get(
        `/api/EmployeeNew/employeesbymanager?managerId=${employeeId}&pageNumber=1&pageSize=10000`,
      )

      if (response.status === 200) {
        const employees =
          response.data?.employees
            ?.filter((data) => data?.isActive === true)
            ?.map((emp, index) => ({
              ...emp,
              key: index,
            })) || []

        setEmpData(employees)
      }
    } catch (error) {
      console.error('Error fetching reportee data:', error)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
  }

  useEffect(() => {
    allEmployeesAllowed.includes(String(role).toLowerCase())
      ? fetchAllEmployees()
      : fetchReporteeData()
  }, [])

  useEffect(() => {
    if (String(search).length > 2) {
      const filteredData = empData.filter((emp) =>
        Object.values(emp).some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase()),
        ),
      )

      setFilteredData(filteredData)
    } else {
      setFilteredData(empData)
    }
  }, [search, empData])

  return (
    <>
      {contextHolder}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: isMobile ? 'flex-start' : 'end',
          marginBottom: '10px',
          gap: '10px',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <Button onClick={() => handleSelectEmpCode(ecode, fullName)} block={isMobile}>
          My Attendance
        </Button>
        <Search
          allowClear
          value={search}
          onChange={handleSearchChange}
          style={{ width: isMobile ? '100%' : '20rem' }}
          placeholder="Search in table"
        />
      </div>

      {!isMobile ? (
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey={(record, idx) => record?.employeeId || record?.ecode || idx}
          scroll={{ x: 'max-content', y: 'calc(100vh - 160px)' }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredData.length,
            onChange: (page, size) => {
              setCurrentPage(page)
              setPageSize(size)
            },
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
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
                <col style={{ width: '35%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th
                    style={{
                      padding: '10px 4px',
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: 10,
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      padding: '10px 4px',
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: 10,
                    }}
                  >
                    E-Code
                  </th>
                  <th
                    style={{
                      padding: '10px 4px',
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: 10,
                    }}
                  >
                    Store Name
                  </th>
                  <th
                    style={{
                      padding: '10px 4px',
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: 10,
                    }}
                  >
                    Store Code
                  </th>
                  <th
                    style={{
                      padding: '10px 4px',
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: 10,
                    }}
                  >
                    View
                  </th>
                </tr>
              </thead>
            </table>
          </div>

          {filteredData
            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
            .map((record, idx) => {
              const recordId = record?.employeeId || record?.ecode || idx

              return (
                <div
                  key={recordId}
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
                      <col style={{ width: '35%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '30%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '10%' }} />
                    </colgroup>
                    <tbody>
                      <tr>
                        <td
                          style={{
                            padding: '8px 4px',
                            textAlign: 'center',
                            fontSize: 9,
                            maxWidth: '100px', // Control max width
                            wordWrap: 'break-word', // Force wrap
                            whiteSpace: 'normal', // Allow multiline
                            lineHeight: '1.3',
                          }}
                        >
                          {record?.fullName || '-'}
                        </td>
                        <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: 9 }}>
                          {record?.ecode || '-'}
                        </td>
                        <td
                          style={{
                            padding: '8px 4px',
                            textAlign: 'center',
                            fontSize: 8,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '100px', // Control max width
                            wordWrap: 'break-word', // Force wrap
                            whiteSpace: 'normal', // Allow multiline
                          }}
                        >
                          {record?.locationName || '-'}
                        </td>
                        <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: 9 }}>
                          {record?.stCode || '-'}
                        </td>
                        <td
                          style={{
                            padding: '8px 4px',
                            textAlign: 'center',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Button
                            type="default"
                            size="small"
                            icon={<RightOutlined />}
                            onClick={() => handleSelectEmpCode(record?.ecode, record?.fullName)}
                            style={{ fontSize: 10, padding: '2px 8px' }}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
                {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length}{' '}
                items
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
                  Page {currentPage} of {Math.ceil(filteredData.length / pageSize)}
                </span>
                <Button
                  size="small"
                  disabled={currentPage >= Math.ceil(filteredData.length / pageSize)}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </Space>
            </Space>
          </div>
        </div>
      )}
    </>
  )
}

export default AttendanceEmpList
