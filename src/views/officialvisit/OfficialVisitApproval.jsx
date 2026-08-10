import React, { useEffect, useState } from 'react'
import { Tabs, Table, Tag, Button, Space, Modal, Input, message } from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import Pageheading from '../../components/shared/Pageheading'
import {
  getOfficialVisitPendingForManager,
  approveOfficialVisitRequest,
} from '../../services/Services'

const { TextArea } = Input

const statusTag = (statusId) => {
  switch (statusId) {
    case 1:
      return <Tag color="green">Approved</Tag>
    case 2:
      return <Tag color="red">Rejected</Tag>
    default:
      return <Tag color="orange">Pending</Tag>
  }
}

// Separate, dedicated page for managers to approve/reject their reportees' Official Visit
// requests -- mirrors the existing Geofence feature's split between the self-service page
// (/official-visit) and this request-management page. Anyone can open this; the query itself
// scopes to "requests where I am the reporting manager", so a non-manager simply sees nothing.
const OfficialVisitApproval = () => {
  const { theme } = useSelector((state) => state.ui)
  const { employeeId } = useSelector((state) => state?.auth?.data) || {}

  const [pending, setPending] = useState([])
  const [decided, setDecided] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState(null) // { id, statusId }
  const [remarks, setRemarks] = useState('')
  const [deciding, setDeciding] = useState(false)

  const load = async () => {
    if (!employeeId) return
    setLoading(true)
    try {
      const [pendingRes, allRes] = await Promise.all([
        getOfficialVisitPendingForManager(employeeId, false),
        getOfficialVisitPendingForManager(employeeId, true),
      ])
      setPending(Array.isArray(pendingRes?.data) ? pendingRes.data : [])
      const all = Array.isArray(allRes?.data) ? allRes.data : []
      setDecided(
        all.filter((r) => r.ManagerApprovalStatusId === 1 || r.ManagerApprovalStatusId === 2),
      )
    } catch (e) {
      message.error('Failed to load approval queue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId])

  const openDecisionModal = (record, statusId) => {
    setModalAction({ id: record.OfficialVisitRequestId, statusId })
    setRemarks('')
    setModalOpen(true)
  }

  const submitDecision = async () => {
    if (!modalAction) return
    setDeciding(true)
    try {
      const res = await approveOfficialVisitRequest(modalAction.id, {
        statusId: modalAction.statusId,
        remarks,
      })
      if (res?.status) {
        message.success(res.message || 'Decision recorded.')
        setModalOpen(false)
        load()
      } else {
        message.error(res?.message || 'Action failed.')
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Action failed.')
    } finally {
      setDeciding(false)
    }
  }

  const baseColumns = [
    { title: 'Ecode', dataIndex: 'Ecode', key: 'Ecode', width: 110 },
    { title: 'Name', dataIndex: 'EmployeeName', key: 'EmployeeName', ellipsis: true },
    {
      title: 'Dates',
      key: 'dates',
      width: 200,
      render: (_, r) =>
        `${dayjs(r.FromDate).format('DD-MMM-YY')} – ${dayjs(r.ToDate).format('DD-MMM-YY')}`,
    },
    { title: 'Purpose', dataIndex: 'Purpose', key: 'Purpose', ellipsis: true },
    {
      title: 'Visit Location',
      key: 'visitLocation',
      width: 180,
      render: (_, r) =>
        r.VisitStoreCode ? `${r.VisitStoreCode} — ${r.VisitLocationName || ''}` : '-',
    },
    { title: 'Remarks', dataIndex: 'EmployeeRemarks', key: 'EmployeeRemarks', ellipsis: true },
  ]

  const pendingColumns = [
    ...baseColumns,
    {
      title: 'Action',
      key: 'action',
      width: 200,
      render: (_, r) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => openDecisionModal(r, 1)}
          >
            Approve
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseOutlined />}
            onClick={() => openDecisionModal(r, 2)}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ]

  const decidedColumns = [
    ...baseColumns,
    {
      title: 'Status',
      dataIndex: 'ManagerApprovalStatusId',
      key: 'status',
      width: 110,
      render: statusTag,
    },
    {
      title: 'Manager Remarks',
      dataIndex: 'ManagerRemarks',
      key: 'ManagerRemarks',
      ellipsis: true,
    },
    {
      title: 'Decided On',
      dataIndex: 'ManagerApprovalOn',
      key: 'ManagerApprovalOn',
      width: 150,
      render: (v) => (v ? dayjs(v).format('DD-MMM-YY hh:mm A') : '-'),
    },
  ]

  return (
    <>
      <Pageheading title="Official Visit Approval" />
      <div className="def" style={{ padding: 10 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'pending',
              label: (
                <span>
                  <ClockCircleOutlined /> Pending ({pending.length})
                </span>
              ),
              children: (
                <Table
                  rowKey="OfficialVisitRequestId"
                  columns={pendingColumns}
                  dataSource={pending}
                  loading={loading}
                  bordered
                  pagination={{ pageSize: 20 }}
                  className={theme === 'dark' ? 'dark-theme' : ''}
                />
              ),
            },
            {
              key: 'decided',
              label: (
                <span>
                  <CheckSquareOutlined /> Approved / Rejected ({decided.length})
                </span>
              ),
              children: (
                <Table
                  rowKey="OfficialVisitRequestId"
                  columns={decidedColumns}
                  dataSource={decided}
                  loading={loading}
                  bordered
                  pagination={{ pageSize: 20 }}
                  className={theme === 'dark' ? 'dark-theme' : ''}
                />
              ),
            },
          ]}
        />
      </div>

      <Modal
        title={modalAction?.statusId === 1 ? 'Approve Request' : 'Reject Request'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={submitDecision}
        confirmLoading={deciding}
        okText={modalAction?.statusId === 1 ? 'Approve' : 'Reject'}
        okButtonProps={{ danger: modalAction?.statusId === 2 }}
      >
        <TextArea
          rows={3}
          placeholder="Remarks (optional)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </Modal>
    </>
  )
}

export default OfficialVisitApproval
