import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Row,
  Col,
  Typography,
  Space,
  Skeleton,
  Alert,
  Grid,
  Select,
  Card,
  Table,
  Tag,
  Button,
  Descriptions,
  Divider,
  Empty,
} from 'antd'
import { ReloadOutlined, EditOutlined, UserOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

import AssignmentShiftModal from './AssignmentShiftModal'

import { getEmployeeShiftHistory, GetAllShifts, assignShift } from '../../services/Services'
import axiosInstance from '../../services/axiosInstance'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

const Index = () => {
  const screens = useBreakpoint()
  const { ecode: loggedInEcode, employeeId } = useSelector((state) => state?.auth?.data || {})

  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState('')

  const [pageData, setPageData] = useState(null)
  const [shifts, setShifts] = useState([])
  const [modalOpen, setModalOpen] = useState(false)

  // ✅ Employee dropdown (API: /api/Employee/SearchEmployee?searchTerm=)
  const [employees, setEmployees] = useState([])
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('')
  const searchReqIdRef = useRef(0)
  const searchDebounceRef = useRef(null)

  const layoutGutter = useMemo(() => (screens.xs ? 12 : 16), [screens.xs])

  // which employee we are viewing
  const effectiveEmployeeId = selectedEmployeeId ?? employeeId

  // derive from pageData
  const employeeInfo = pageData?.employeeInfo || {}
  const currentShift = employeeInfo?.currentShift || {}
  const shiftHistory = Array.isArray(pageData?.shiftHistory) ? pageData.shiftHistory : []

  // selected employee from list (for modal display)
  const selectedEmployee = employees.find((e) => String(e.employeeId) === String(effectiveEmployeeId))
  const selectedEcode = selectedEmployee?.ecode ?? employeeInfo?.ecode ?? '-'

  // ✅ pick latest history record (prefer current shiftId, else latest assignedOn)
  const lastAssignRecord = useMemo(() => {
    const list = Array.isArray(shiftHistory) ? [...shiftHistory] : []
    if (!list.length) return null

    list.sort((a, b) => {
      const da = a?.assignedOn ? dayjs(a.assignedOn).valueOf() : 0
      const db = b?.assignedOn ? dayjs(b.assignedOn).valueOf() : 0
      return db - da
    })

    const matchCurrent = list.find((h) => String(h?.shiftId) === String(employeeInfo?.currentShiftId))
    return matchCurrent ?? list[0]
  }, [shiftHistory, employeeInfo?.currentShiftId])

  const lastUpdatedByDisplay = lastAssignRecord?.assignedBy ?? currentShift?.lastUpdatedBy ?? '-'
  const lastUpdatedOnDisplay = lastAssignRecord?.assignedOn
    ? dayjs(lastAssignRecord.assignedOn).format('YYYY-MM-DD')
    : currentShift?.lastUpdatedOn ?? '-'

  // ✅ NEW: Search API for dropdown (matches your response exactly)
  const searchEmployees = async (term) => {
    const q = (term ?? '').trim()

    if (!q) {
      setEmployees([])
      return
    }

    const reqId = ++searchReqIdRef.current
    try {
      setEmployeesLoading(true)

      const res = await axiosInstance.get(
        `/api/Employee/SearchEmployee?searchTerm=${encodeURIComponent(q)}`,
      )

      if (reqId !== searchReqIdRef.current) return

      const list = Array.isArray(res?.data?.employees) ? res.data.employees : []

      const normalized = list
        .map((r) => {
          const empId = r?.employeeId
          const name = (r?.fullName ?? '-').trim()
          const code = (r?.ecode ?? '-').trim()

          return {
            employeeId: empId,
            fullName: name,
            ecode: code,
            displayLabel: `${code} - ${name}`, // ✅ V23375 - NIKHIL
          }
        })
        .filter((e) => e.employeeId != null)

      setEmployees(normalized)
    } catch (e) {
      if (reqId !== searchReqIdRef.current) return
      setEmployees([])
    } finally {
      if (reqId === searchReqIdRef.current) setEmployeesLoading(false)
    }
  }

  // ✅ Debounced search
  const onEmployeeSearch = (val) => {
    setEmployeeSearchTerm(val)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      searchEmployees(val)
    }, 350)
  }

  // --- helper: unwrap shifts response -> array ---
  const unwrapShiftList = (shiftsRes) => {
    let payload = shiftsRes?.data ?? shiftsRes
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.data?.data)) return payload.data.data
    return []
  }

  // --- Load page data (employee shift history + shifts master) ---
  const loadPage = async (empIdToLoad) => {
    const empId = empIdToLoad ?? effectiveEmployeeId

    if (!empId) {
      setError('Employee ID not found')
      return
    }

    setError('')
    setLoading(true)

    try {
      const [historyRes, shiftsRes] = await Promise.all([
        getEmployeeShiftHistory(empId),
        GetAllShifts(),
      ])

      let historyPayload = historyRes?.data ?? historyRes
      if (historyPayload?.status === true && historyPayload?.data) historyPayload = historyPayload.data

      setPageData(historyPayload || null)

      const shiftList = unwrapShiftList(shiftsRes)
      setShifts(shiftList)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'An error occurred while fetching data')
      setPageData(null)
      setShifts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveEmployeeId])

  const handleAssign = async (payload) => {
    try {
      setAssigning(true)
      const res = await assignShift(payload)
      const assignPayload = res?.data ?? res
      if (assignPayload?.status === false) throw new Error(assignPayload?.message || 'Assign shift failed.')
      await loadPage()
      setModalOpen(false)
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to assign shift.')
    } finally {
      setAssigning(false)
    }
  }

  const fullName =
    employeeInfo?.fullName ??
    (`${employeeInfo?.firstName ?? ''} ${employeeInfo?.lastName ?? ''}`.trim() || '-')

  const shiftStatusTag = currentShift?.isActive ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>

  const historyColumns = [
    {
      title: 'Effective From',
      dataIndex: 'effectiveFrom',
      key: 'effectiveFrom',
      width: 130,
      render: (v) => {
        if (!v || v === '-') return '-'
        const d = dayjs(v)
        return d.isValid() ? d.format('YYYY-MM-DD') : String(v)
      },
    },
    { title: 'Shift', dataIndex: 'shiftName', key: 'shiftName', ellipsis: true, width: 180 },
    { title: 'Start', dataIndex: 'startTime', key: 'startTime', width: 110 },
    { title: 'End', dataIndex: 'endTime', key: 'endTime', width: 110 },
    {
      title: 'Shift Status',
      dataIndex: 'shiftStatus',
      key: 'shiftStatus',
      width: 110,
      render: (v) => {
        const val = String(v || '').toLowerCase()
        if (!v) return '-'
        if (val === 'current') return <Tag color="green">Current</Tag>
        if (val === 'future') return <Tag color="blue">Future</Tag>
        if (val === 'past') return <Tag color="default">Past</Tag>
        return <Tag>{String(v)}</Tag>
      },
    },
    {
      title: 'Assigned On',
      dataIndex: 'assignedOn',
      key: 'assignedOn',
      width: 140,
      render: (v) => {
        if (!v || v === '-') return '-'
        const d = dayjs(v)
        return d.isValid() ? d.format('YYYY-MM-DD') : String(v)
      },
    },
    { title: 'Assigned By', dataIndex: 'assignedBy', key: 'assignedBy', width: 130, ellipsis: true },
    { title: 'Remarks', dataIndex: 'remarks', key: 'remarks', ellipsis: true },
  ]

  const historyData = shiftHistory.map((h, idx) => ({
    key: h?.historyId ?? h?.id ?? idx,
    effectiveFrom: h?.effectiveFrom ?? '-',
    assignedOn: h?.assignedOn ?? '-',
    shiftStatus: h?.shiftStatus ?? '-',
    remarks: h?.remarks ?? '-',
    shiftName: h?.shiftName ?? h?.shiftDetails?.shiftName ?? h?.shift?.shiftName ?? '-',
    startTime: h?.startTime ?? h?.shiftDetails?.startTime ?? h?.shift?.startTime ?? '-',
    endTime: h?.endTime ?? h?.shiftDetails?.endTime ?? h?.shift?.endTime ?? '-',
    assignedBy: h?.assignedBy ?? h?.createdBy ?? '-',
  }))

  return (
    <div style={{ padding: screens.xs ? 12 : 20, maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <div>
          <Title level={3} style={{ marginBottom: 2 }}>
            Employee Shift
          </Title>
        </div>

        {error ? <Alert type="error" showIcon message={error} /> : null}

        <Card
          size="small"
          title={
            <Space>
              <UserOutlined />
              <span>Shift Info</span>
            </Space>
          }
          extra={
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => loadPage()} disabled={loading}>
                Refresh
              </Button>

              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setModalOpen(true)}
                disabled={!effectiveEmployeeId}
                loading={assigning}
              >
                Update Shift
              </Button>
            </Space>
          }
        >
          <Row gutter={[layoutGutter, layoutGutter]} align="middle">
            <Col xs={24} md={12}>
              <Text strong>Select Employee</Text>
              <div style={{ marginTop: 6 }}>
                <Select
                  showSearch
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="Type ecode/name…"
                  value={selectedEmployeeId}
                  onChange={(val) => setSelectedEmployeeId(val || null)}
                  onSearch={onEmployeeSearch}
                  loading={employeesLoading}
                  filterOption={false}
                  optionLabelProp="label" // ✅ selected item shows same label
                  notFoundContent={
                    employeesLoading ? 'Searching…' : employeeSearchTerm?.trim() ? 'No employee found' : 'Type to search'
                  }
                >
                  {employees.map((e) => (
                    <Select.Option
                      key={String(e.employeeId)}
                      value={String(e.employeeId)}
                      label={e.displayLabel}  // ✅ shows "V23375 - NIKHIL" when selected
                    >
                      {e.displayLabel}       
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div style={{ display: 'flex', justifyContent: screens.xs ? 'flex-start' : 'flex-end' }}>
                <Space>
                  <Text type="secondary">Status:</Text>
                  {shiftStatusTag}
                </Space>
              </div>
            </Col>
          </Row>

          <Divider style={{ margin: '12px 0 8px' }} />

          <Row gutter={[layoutGutter, layoutGutter]}>
            <Col xs={24} md={16}>
              <Text strong style={{ fontSize: 13 }}>Employee Details</Text>
            </Col>
            <Col xs={24} md={8}>
              <Text strong style={{ fontSize: 13 }}>Current Shift</Text>
            </Col>
          </Row>

          {loading ? (
            <Skeleton active />
          ) : (
            <Row gutter={[layoutGutter, layoutGutter]} style={{ marginTop: 6 }}>
              <Col xs={24} md={16}>
                <Descriptions
                  size="small"
                  column={screens.xs ? 1 : 2}
                  bordered
                  labelStyle={{ width: screens.xs ? 'auto' : 180 }}
                >
                  <Descriptions.Item label="Ecode">{employeeInfo?.ecode ?? '-'}</Descriptions.Item>
                  <Descriptions.Item label="Name">{fullName}</Descriptions.Item>
                  <Descriptions.Item label="Reporting Head">{employeeInfo?.reportHeadFullName ?? '-'}</Descriptions.Item>
                  <Descriptions.Item label="Reporting Head Ecode">{employeeInfo?.reportHeadEcode ?? '-'}</Descriptions.Item>
                </Descriptions>
              </Col>

              <Col xs={24} md={8}>
                <Descriptions size="small" column={1} bordered>
                  <Descriptions.Item label="Shift Name">{currentShift?.shiftName ?? '-'}</Descriptions.Item>
                  <Descriptions.Item label="Start Time">{currentShift?.startTime ?? '-'}</Descriptions.Item>
                  <Descriptions.Item label="End Time">{currentShift?.endTime ?? '-'}</Descriptions.Item>
                  <Descriptions.Item label="Last Updated By">{lastUpdatedByDisplay}</Descriptions.Item>
                  <Descriptions.Item label="Last Updated On">{lastUpdatedOnDisplay}</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          )}
        </Card>

        <Card size="small" title="Shift History">
          <Table
            columns={historyColumns}
            dataSource={historyData}
            size="small"
            bordered
            pagination={{ pageSize: 10, showSizeChanger: true }}
            locale={{
              emptyText: (
                <div style={{ padding: 16 }}>
                  <Empty description="No shift history available" />
                </div>
              ),
            }}
            scroll={{ x: 900 }}
          />
        </Card>
      </Space>

      <AssignmentShiftModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAssign}
        submitting={assigning}
        shifts={shifts}
        employeeId={effectiveEmployeeId}
        assignedBy={loggedInEcode}
        ecode={selectedEcode}
      />
    </div>
  )
}

export default Index
