/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Drawer,
  Input,
  Space,
  Tag,
  message,
  Typography,
  Row,
  Col,
  Divider,
  Tooltip,
} from 'antd'
import { listIncentives, getIncentive, createIncentive } from '../../../../services/Services'
import Pageheading from '../../../shared/Pageheading'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Text } = Typography

const FILE_BASE_URL = import.meta.env.VITE_API_URL

// --- shared helpers (same as your CMD page) ---
const statusColor = (label = '') => {
  const s = (label || '').toUpperCase()
  if (s.includes('REJECT')) return 'red'
  if (s.includes('PENDING')) return 'gold'
  return 'green'
}
const fmtMonth = (v) => {
  const d = dayjs(v)
  return d.isValid() ? d.format('MMM YYYY') : '-'
}
const fmtDT = (v) => {
  const d = dayjs(v)
  return d.isValid() ? d.format('ddd, D MMM YYYY, h:mm A') : '—'
}

// tiny label-value pair (same as earlier)
const Field = ({ label, children }) => (
  <Space size={8} style={{ display: 'flex' }}>
    <Text type="secondary" style={{ minWidth: 110, whiteSpace: 'nowrap' }}>
      {label}
    </Text>
    <Text strong style={{ whiteSpace: 'nowrap' }}>
      {children}
    </Text>
  </Space>
)

export default function HRApprovalList() {
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)

  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(null)
  const [remarks, setRemarks] = useState('')

  const fetchData = async () => {
    const params = { status: 'Pending', pageNumber: page, pageSize }
    const res = await listIncentives(params)

    const data = Array.isArray(res?.incentives) ? res.incentives : []

    const filtered = data.filter((r) => r.cmdStatusName === "Approved")

    setRows(filtered)
  }

  const attHref = (a) => {
    if (a?.url) return a.url
    const fp = String(a?.filePath || '').trim()
    if (!fp) return ''
    const path = fp.startsWith('/') ? fp : `/${fp}`
    return `${FILE_BASE_URL}${path}`
  }

  const attName = (a, i) => {
    if (a?.name) return a.name
    if (a?.originalName) return a.originalName
    const fp = String(a?.filePath || '')
    const base = fp.split(/[\\/]/).pop() || ''
    return base || `Attachment ${i + 1}`
  }

  useEffect(() => {
    fetchData()
  }, [page, pageSize])

  const columns = [
    { title: 'Month', dataIndex: 'month', render: fmtMonth },
    { title: 'Ecode', dataIndex: 'ecode' },
    { title: 'Amount', dataIndex: 'amount' },
    {
      title: 'Status',
      dataIndex: 'statusName',
      render: (v) => <Tag color={statusColor(v)}>{v || '-'}</Tag>,
    },
    {
      title: 'CMD Status',
      dataIndex: 'cmdStatusName',
      render: (v) => <Tag color={v === "Approved" ? 'green' : v === "Rejected" ? 'red': "gold"}>{v === "Approved" ? 'Approved' : v === "Rejected" ? 'Rejected': 'Pending'}</Tag>,
    },
    {
      title: 'HR Status',
      dataIndex: 'hrStatusName',
      render: (v) =>
        v === "Approved" ? (
          <Tag color="green">Approved</Tag>
        ) : v === "Rejected" ? (
          <Tag color="red">Rejected</Tag>
        ) : (
          <Tag color="gold">Pending</Tag>
        ),
    },
    {
      title: 'Actions',
      render: (_, r) =>
        r.cmdStatusName === "Approved" &&
        r.hrStatusName === "Pending" && (
          <Button
            onClick={async () => {
              const details = await getIncentive(r.incentiveId)
              setCurrent(details)
              setRemarks('')
              setOpen(true)
            }}
          >
            Review
          </Button>
        ),
    },
  ]

  const decide = async (approved) => {
    const payload = {
      incentiveId: current.incentiveId,
      hrStatusId: approved,
      hrRemarks: remarks || '',
    }

    const res = await createIncentive(payload)
    if (res?.incentiveId) {
      message.success(approved ? 'Approved' : 'Rejected')
      setOpen(false)
      fetchData()
    } else {
      message.error(res?.message || 'Failed to save decision')
    }
  }

  return (
    <>
      <Pageheading title="Incentive - HR Approvals" />

      <Table
        rowKey="incentiveId"
        columns={columns}
        dataSource={rows}
        bordered
        pagination={{
          current: page,
          pageSize,
          onChange: (p, ps) => {
            setPage(p)
            setPageSize(ps)
          },
          showSizeChanger: true,
          position: ['bottomRight'],
        }}
        scroll={{ x: 'max-content', y: 'calc(100vh - 220px)' }}
      />

      <Drawer
        width={640}
        open={open}
        onClose={() => setOpen(false)}
        title="Review Incentive (HR)"
        styles={{
          body: { paddingTop: 12, paddingBottom: 12 },
          header: { borderBottom: '1px solid var(--ant-border-color-split)' },
          footer: { borderTop: '1px solid var(--ant-border-color-split)' },
        }}
        footer={
          current ? (
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setOpen(false)}>Close</Button>
              <Button danger onClick={() => decide(2)}>
                Reject
              </Button>
              <Button type="primary" onClick={() => decide(1)}>
                Approve
              </Button>
            </Space>
          ) : null
        }
      >
        {current && (
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            {/* Summary card */}
            <div
              style={{
                border: '1px solid var(--ant-border-color-split)',
                borderRadius: 10,
                padding: 12,
                background: 'var(--ant-color-bg-container-disabled, rgba(0,0,0,0.02))',
              }}
            >
              <Row gutter={[12, 12]}>
                <Col xs={24} md={10}>
                  <Text type="secondary" style={{ display: 'block' }}>
                    Employee
                  </Text>
                  <Text strong>
                    {current.empName || ''} ({current.ecode})
                  </Text>
                </Col>
                <Col xs={12} md={6}>
                  <Text type="secondary" style={{ display: 'block' }}>
                    Month
                  </Text>
                  <Text strong>{fmtMonth(current.month)}</Text>
                </Col>
                <Col xs={12} md={6}>
                  <Text type="secondary" style={{ display: 'block' }}>
                    Amount
                  </Text>
                  <Text strong>{Number(current.amount || 0).toLocaleString()}</Text>
                </Col>
              </Row>
            </div>

            {/* Two neat rows */}
            <Row gutter={[24, 8]} style={{ marginTop: 8 }}>
              <Col xs={24} md={12}>
                <Field label="Workflow Status">
                  <Tag color={statusColor(current.statusName)} style={{ marginRight: 0 }}>
                    {current.statusName || '—'}
                  </Tag>
                </Field>
              </Col>
              <Col xs={24} md={12}>
                <Field label="Created By">
                  <span style={{ whiteSpace: 'nowrap' }}>{current.createdBy || '—'}</span>
                </Field>
              </Col>

              <Col xs={24} md={12}>
                <Field label="Created At">
                  <Tooltip title={dayjs(current.createdAt).format('YYYY-MM-DD HH:mm:ss')}>
                    <span style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                      {fmtDT(current.createdAt)}
                    </span>
                  </Tooltip>
                </Field>
              </Col>
              <Col xs={24} md={12}>
                <Field label="Updated At">
                  <Tooltip title={dayjs(current.updatedAt).format('YYYY-MM-DD HH:mm:ss')}>
                    <span style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                      {fmtDT(current.updatedAt)}
                    </span>
                  </Tooltip>
                </Field>
              </Col>
            </Row>

            <Divider style={{ margin: '8px 0' }} />

            {/* HOD Remarks */}
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>
                HOD Remarks
              </Text>
              <div
                style={{
                  padding: 10,
                  border: '1px solid var(--ant-border-color-split)',
                  borderRadius: 6,
                  background: 'var(--ant-color-bg-container-disabled, rgba(0,0,0,0.02))',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {current.remarks || '—'}
              </div>
            </div>

            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>
                CMD Remarks
              </Text>
              <div
                style={{
                  padding: 10,
                  border: '1px solid var(--ant-border-color-split)',
                  borderRadius: 6,
                  background: 'var(--ant-color-bg-container-disabled, rgba(0,0,0,0.02))',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {current.cmdRemarks || '—'}
              </div>
            </div>

            {/* HR Remarks input */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>
                HR Remarks
              </Text>
              <TextArea
                rows={4}
                placeholder="Optional"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            {/* Attachments */}
            {Array.isArray(current.attachments) && current.attachments.length > 0 && (
              <>
                <Divider style={{ margin: '8px 0' }} />
                <div>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 6 }}>
                    Attachments
                  </Text>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {current.attachments.map((a, i) => {
                      const href = attHref(a)
                      const name = attName(a, i)
                      if (!href) return null // skip broken items
                      return (
                        <li key={a.id ?? i} style={{ marginBottom: 6 }}>
                          <a href={encodeURI(href)} target="_blank" rel="noopener noreferrer">
                            Attachment {i + 1}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </>
            )}
          </Space>
        )}
      </Drawer>
    </>
  )
}
