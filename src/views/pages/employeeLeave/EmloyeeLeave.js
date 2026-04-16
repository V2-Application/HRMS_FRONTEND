import React, { useEffect, useState, useMemo } from 'react'
import debounce from 'lodash/debounce'
import EmployeeLeaveCard from '../../../components/EmployeeLeaveCard'
import { Col, Row, Button, Spin, Select, Grid, Space, Card, message } from 'antd'
import EmployeeLeaveModal from '../../../components/EmployeeLeaveModal'
import { useDispatch, useSelector } from 'react-redux'
import {
  checkLeaveLockStatus,
  fetchEmpLeaveData,
  fetchLeaveOpeningBal,
  fetchLeaveStatusList,
} from '../../../services/Services'
import { set } from '../../../redux/uiSlice'
import Pageheading from '../../../components/shared/Pageheading'
import axiosInstance from '../../../services/axiosInstance'
import { useActionsMap } from '../../../utils/useActionsMap'

const { useBreakpoint } = Grid

const EmloyeeLeave = () => {
  const dispatch = useDispatch()
  const screens = useBreakpoint()
  const isMobile = !screens.md
  const [leaveDataVisible, setLeaveDataVisible] = useState({ isLocked: false, message: '' })

  const globalSearchAllowed = ['master', 'hr', 'superadmin']

  const { employeeId, role } = useSelector((state) => state?.auth?.data) || {}
  const { loading } = useSelector((state) => state.ui)

  const [reporteeEmployees, setReporteeEmployees] = useState([])
  const [allEmployees, setAllEmployees] = useState([])
  const [openLeaveModal, setOpenLeaveModal] = useState(false)
  const [leaveData, setLeaveData] = useState([])
  const [totalBln, setTotalBln] = useState([])
  const [leavePending, setLeavePending] = useState({})
  const [selectedEmpId, setSelectedEmpId] = useState('')

  const { filteredSideMenu } = useSelector((state) => state?.auth || {})
  const actionsMap = useActionsMap(filteredSideMenu)

  // Debounced fetch for global search
  const debouncedFetch = useMemo(
    () =>
      debounce(async (search) => {
        if (search.length < 3) {
          setAllEmployees([])
          return false
        }
        try {
          const { status, data } = await axiosInstance.get(
            `/api/Employee/SearchEmployee?searchTerm=${encodeURIComponent(search)}`,
          )
          if (status === 200) {
            const formatted = (data.employees || []).map((emp) => ({
              label: `${emp.fullName} - ${emp.ecode}`,
              value: emp.employeeId,
            }))
            setAllEmployees(formatted)
          }
        } catch (err) {
          console.error('Global search error:', err)
        }
      }, 500),
    [],
  )

  const handleGlobalSearch = (value) => {
    debouncedFetch(value || '')
  }

  const handleGlobalSelect = (value) => {
    setSelectedEmpId(value)
    fetchLeaveData(value)
  }

  const fetchLeaveData = async (empId) => {
    try {
      const res = await fetchEmpLeaveData(empId)
      const res2 = await fetchLeaveOpeningBal() // kept here if you use it elsewhere
      if (res.status === 200) {
        const data = res.data || []
        const formatted = data
          .map((dt) => ({
            leaveType: dt.leaveType,
            currentBalance: Number(dt.availableBalance).toFixed(2),
            acquiredThisYear: Number(dt.availableBalance + dt.utilized).toFixed(2),
            utilizedThisYear: Number(dt.utilized).toFixed(2),
            annualAllotment: Number(dt.annualAllotment).toFixed(2),
            order: +dt.leaveTypeId,
          }))
          .sort((a, b) => a.order - b.order)
        setLeaveData(formatted)
        setTotalBln(formatted.map((dt) => ({ type: dt.leaveType, balance: dt.currentBalance })))
      }
    } catch (err) {
      console.error('fetchLeaveData error:', err)
    }
  }

  const fetchReporteeEmployees = async () => {
    try {
      const res = await axiosInstance.get(
        `/api/EmployeeNew/employeesbymanager?managerId=${employeeId}&pageNumber=1&pageSize=10000`,
      )
      if (res.status === 200) {
        const list = res.data.employees || []
        setReporteeEmployees(
          list.map((emp) => ({ label: `${emp.fullName} - ${emp.ecode}`, value: emp.employeeId })),
        )
      }
    } catch (err) {
      console.error('fetchReporteeEmployees error:', err)
    }
  }

  const fetchLeaveStatus = async () => {
    dispatch(set({ loading: true }))
    try {
      const res = await fetchLeaveStatusList(employeeId)
      if (res.status === 200) {
        const pending = (res.data || [])
          .filter((dt) => dt.statusId === 4)
          .reduce((acc, cur) => {
            const days =
              (new Date(cur.endDate) - new Date(cur.startDate)) / (1000 * 60 * 60 * 24) + 1
            acc[cur.leaveTypeName] = (acc[cur.leaveTypeName] || 0) + days
            return acc
          }, {})
        setLeavePending(pending)
      }
    } catch (err) {
      console.error('fetchLeaveStatus error:', err)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    if (!employeeId) return
    fetchReporteeEmployees()
    fetchLeaveStatus()
    fetchLeaveData(employeeId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId])

  useEffect(() => {
    if (selectedEmpId) fetchLeaveData(selectedEmpId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmpId])

  const fetchCheckLeaveStatus = async () => {
    try {
      const response = await checkLeaveLockStatus()
      if (response.status === 200) {
        console.log('res: ', response)
        setLeaveDataVisible({
          isLocked: response.data?.data?.isLeavesLocked,
          message: response.data?.data?.message,
        })
      }
    } catch (error) {
      console.error('Error checking leave lock status:', error)
      message.error(error?.response?.data?.message || 'Failed to check leave status')
    }
  }

  useEffect(() => {
    fetchCheckLeaveStatus()
  }, [])

  // Refresh function for modal to reload current employee (selected or self)
  const refreshCurrent = () => fetchLeaveData(selectedEmpId || employeeId)

  const roleLower = String(role || '').toLowerCase()
  const canGlobalSearch = globalSearchAllowed.includes(roleLower)

  return (
    <>
      {/* Header with responsive CTA */}
      <Row gutter={[8, 8]} align="middle" justify="space-between" style={{ marginBottom: 12 }}>
        <Col xs={24} sm={12}>
          <Pageheading title="Leave Balance" />
        </Col>
        {!leaveDataVisible.isLocked && (
          <Col xs={24} sm={12} style={{ textAlign: isMobile ? 'left' : 'right' }}>
            <Button type="primary" onClick={() => setOpenLeaveModal(true)} block={isMobile}>
              Apply Leave
            </Button>
          </Col>
        )}
      </Row>

      {!leaveDataVisible.isLocked && (
        <Spin spinning={loading}>
          {/* Employee selector (responsive) */}
          {actionsMap['employee search']?.actionStatus &&
            (canGlobalSearch || (reporteeEmployees?.length ?? 0) > 0) && (
              <Card
                size="small"
                style={{ marginBottom: 16, borderRadius: 8 }}
                bodyStyle={{ padding: 12 }}
              >
                <Row gutter={[12, 12]} align="middle">
                  <Col xs={24} md={6}>
                    <span style={{ fontWeight: 600 }}>Select Employee:</span>
                  </Col>

                  <Col xs={24} md={12}>
                    {canGlobalSearch ? (
                      <Select
                        style={{ width: '100%' }}
                        showSearch
                        placeholder="Search employees"
                        onSearch={handleGlobalSearch}
                        onSelect={handleGlobalSelect}
                        filterOption={false}
                        options={allEmployees}
                        allowClear
                        onClear={() => setAllEmployees([])}
                      />
                    ) : (
                      <Select
                        style={{ width: '100%' }}
                        placeholder="Select employee"
                        options={reporteeEmployees}
                        value={selectedEmpId || undefined}
                        onChange={(id) => setSelectedEmpId(id)}
                        allowClear
                        showSearch
                        filterOption={(input, option) =>
                          String(option?.label ?? '')
                            .toLowerCase()
                            .includes(String(input ?? '').toLowerCase())
                        }
                      />
                    )}
                  </Col>

                  <Col xs={24} md={6} style={{ textAlign: isMobile ? 'left' : 'right' }}>
                    <Button
                      onClick={() => {
                        setSelectedEmpId('')
                        fetchLeaveData(employeeId)
                        setAllEmployees([])
                      }}
                      block={isMobile}
                    >
                      My Leaves
                    </Button>
                  </Col>
                </Row>
              </Card>
            )}

          {/* Cards grid (responsive) */}
          <Row gutter={[16, 16]}>
            {leaveData.map((leave, idx) => (
              <Col key={idx} xs={24} sm={12} md={12} lg={8} xl={6}>
                <EmployeeLeaveCard
                  leaveType={leave.leaveType}
                  currentBalance={leave.currentBalance}
                  acquiredThisYear={leave.acquiredThisYear}
                  utilizedThisYear={leave.utilizedThisYear}
                  annualAllotment={leave.annualAllotment}
                />
              </Col>
            ))}
          </Row>

          {openLeaveModal && (
            <EmployeeLeaveModal
              openLeaveModal={openLeaveModal}
              setOpenLeaveModal={setOpenLeaveModal}
              totalBalance={totalBln}
              fetchData={refreshCurrent}
            />
          )}
        </Spin>
      )}

      {leaveDataVisible.isLocked && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.15rem',
            fontWeight: 600,
          }}
        >
          {leaveDataVisible.message}
        </div>
      )}
    </>
  )
}

export default EmloyeeLeave
