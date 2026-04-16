import React, { useEffect } from 'react'
import classNames from 'classnames'
import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilUser, cilUserFemale, cilCalendar, cilMoney } from '@coreui/icons'
import avatar1 from 'src/assets/images/avatars/1.jpg'
import avatar2 from 'src/assets/images/avatars/2.jpg'
import avatar3 from 'src/assets/images/avatars/3.jpg'
import avatar4 from 'src/assets/images/avatars/4.jpg'
import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'

import {
  PieChart,
  Pie,
  Cell,
  Bar,
  LineChart,
  BarChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import EmployeeWidgetsDropdown from '../widgets/EmployeeWidgetsDropdown'

const Dashboard = ({ userdata, ...props }) => {
  // const employeeStats = [
  //   { title: 'Total Employees', value: 120, percent: 100, color: 'success' },
  //   { title: 'Active', value: 98, percent: 82, color: 'info' },
  //   { title: 'On Leave', value: 12, percent: 10, color: 'warning' },
  //   { title: 'Resigned', value: 10, percent: 8, color: 'danger' },
  // ];

  const role = userdata.role

  const employeeStats = [
    { title: 'Total Leaves', value: 120, percent: 100, color: 'success' },
    { title: 'Available Leave ', value: 98, percent: 82, color: 'info' },
    { title: 'lapsed Leave', value: 12, percent: 10, color: 'warning' },
    { title: 'Revoked Leave', value: 10, percent: 8, color: 'danger' },
  ]

  const barData = [
    { name: 'Active', count: 98, color: '#20a8d8' },
    { name: 'On Leave', count: 12, color: '#f9b115' },
    { name: 'Resigned', count: 10, color: '#f86c6b' },
    { name: 'WFH', count: 200, color: '#f86c6b' },
  ]

  const lineData = [
    { month: 'Jan', 'New Candidate': 10, 'Converted To Employee': 2 },
    { month: 'Feb', 'New Candidate': 15, 'Converted To Employee': 3 },
    { month: 'Mar', 'New Candidate': 12, 'Converted To Employee': 5 },
    { month: 'Apr', 'New Candidate': 18, 'Converted To Employee': 7 },
    { month: 'May', 'New Candidate': 20, 'Converted To Employee': 6 },
    { month: 'Jun', 'New Candidate': 22, 'Converted To Employee': 4 },
  ]

  const departmentData = [
    { department: 'HR', employees: 15, color: '#20a8d8' },
    { department: 'Engineering', employees: 45, color: '#f86c6b' },
    { department: 'Sales', employees: 30, color: '#ffc107' },
    { department: 'Marketing', employees: 20, color: '#4dbd74' },
    { department: 'Finance', employees: 10, color: '#6610f2' },
  ]

  const teamPerformanceData = [
    { team: 'Develop', rating: 9 },
    { team: 'Mrket', rating: 7.5 },
    { team: 'Sales', rating: 8.2 },
    { team: 'HR', rating: 6.8 },
    { team: 'Finance', rating: 8.5 },
  ]

  // Project Performance Data (Completion %)
  const projectPerformanceData = [
    { project: 'Project A', completion: 95 },
    { project: 'Project B', completion: 85 },
    { project: 'Project C', completion: 75 },
    { project: 'Project D', completion: 90 },
    { project: 'Project E', completion: 80 },
  ]

  const attendanceData = [
    { name: 'Present', value: 80, color: '#28a745' },
    { name: 'Absent', value: 10, color: '#dc3545' },
    { name: 'On Leave', value: 10, color: '#ffc107' },
  ]

  const taskCompletionData = [
    { name: 'Completed Tasks', count: 15, color: '#20a8d8' },
    { name: 'Pending Tasks', count: 5, color: '#f86c6b' },
  ]

  const performanceData = [
    { month: 'Jan', performance: 75 },
    { month: 'Feb', performance: 80 },
    { month: 'Mar', performance: 78 },
    { month: 'Apr', performance: 85 },
    { month: 'May', performance: 90 },
    { month: 'Jun', performance: 88 },
    { month: 'Jul', performance: 92 },
    { month: 'Aug', performance: 87 },
    { month: 'Sep', performance: 85 },
    { month: 'Oct', performance: 89 },
    { month: 'Nov', performance: 91 },
    { month: 'Dec', performance: 93 },
  ]

  return (
    <>
      {role === 'Employee' ? <EmployeeWidgetsDropdown /> : <WidgetsDropdown className="mb-4" />}
      <CCard className="mb-4">
        {role === 'HR' && (
          <CCardBody>
            <h4 className="card-title mb-2">HR Dashboard Overview</h4>
            <CRow>
              <CCol xl={6}>
                <CCard className="mb-4">
                  <CCardHeader>Employee Distribution</CCardHeader>
                  <CCardBody>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={departmentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="employees" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol xl={6}>
                <CCard className="mb-4">
                  <CCardHeader>Monthly Hiring & Resignation Trend</CCardHeader>
                  <CCardBody>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="New Candidate" stroke="#20a8d8" />
                        <Line type="monotone" dataKey="Converted To Employee" stroke="#f86c6b" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </CCardBody>
        )}
        {role === 'Audit' && (
          <CCardBody>
            <h4 className="card-title mb-2">
              {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard Overview
            </h4>
            <CRow>
              {/* Team Performance Chart */}
              <CCol xl={6}>
                <CCard className="mb-4">
                  <CCardHeader>Team Performance</CCardHeader>
                  <CCardBody>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={teamPerformanceData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 10]} />
                        <YAxis dataKey="team" type="category" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="rating" fill="#20a8d8">
                          <LabelList
                            dataKey="rating"
                            position="insideRight"
                            fill="#fff"
                            fontSize={14}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CCardBody>
                </CCard>
              </CCol>

              {/* Project Performance Chart */}
              <CCol xl={6}>
                <CCard className="mb-4">
                  <CCardHeader>Project Performance</CCardHeader>
                  <CCardBody>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={projectPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="project" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completion" fill="#28a745" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </CCardBody>
        )}

        {role === 'Employee' && (
          <CCardBody>
            <h4 className="card-title mb-2">Employee Dashboard Overview</h4>
            <CRow>
              <CCol xl={6}>
                <CCard className="mb-4">
                  <CCardHeader>Attendance Overview</CCardHeader>
                  <CCardBody>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={attendanceData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {attendanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CCardBody>
                </CCard>
              </CCol>

              <CCol xl={6}>
                <CCard className="mb-4">
                  <CCardHeader>Performance Over the Year</CCardHeader>
                  <CCardBody>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[70, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="performance" stroke="#20a8d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </CCardBody>
        )}
      </CCard>
      <CRow>
        <CCol xl={12}>
          <CCard className="mb-4">
            <CCardHeader>Announcements</CCardHeader>
            <CCardBody>
              <ul>
                <li>Annual Performance Review starts next week.</li>
                <li>Company offsite scheduled for next month.</li>
                <li>Updated HR policies are now available.</li>
              </ul>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow>
        {employeeStats.map((item, index) => (
          <CCol md={3} key={index}>
            <CCard>
              <CCardBody className="text-center">
                <div className="fw-semibold">{item.title}</div>
                <div className="fs-5">{item.value}</div>
                <CProgress thin color={item.color} value={item.percent} className="mt-2" />
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
    </>
  )
}

const abc = () => {
  return <h3>Coming Soon</h3>
}

export default abc
