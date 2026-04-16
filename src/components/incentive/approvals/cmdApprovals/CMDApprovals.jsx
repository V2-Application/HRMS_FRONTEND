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
  Descriptions,
  Divider,
  Flex,
  Tooltip,
} from 'antd'
import { listIncentives, getIncentive, createIncentive } from '../../../../services/Services'
import Pageheading from '../../../shared/Pageheading'
import dayjs from 'dayjs'

const { TextArea } = Input

const FILE_BASE_URL = import.meta.env.VITE_API_URL

export const fmtMonth = (v) => {
  const d = dayjs(v)
  if (!d.isValid()) return '-'
  return d.format('MMM YYYY')
}

const { Text } = Typography

const statusColor = (label = '') => {
  const s = (label || '').toUpperCase()
  if (s.includes('REJECT')) return 'red'
  if (s.includes('PENDING')) return 'gold'
  return 'green'
}

export const fmtDT = (v) => {
  const d = dayjs(v)
  if (!d.isValid()) return '—'
  return d.format('ddd, D MMM YYYY, h:mm A')
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

export default function CmdApprovalList() {
  // table state
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  1
  // drawer state
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(null)
  const [remarks, setRemarks] = useState('')

  const statusColor = (label = '') => {
    const s = (label || '').toUpperCase()
    if (s.includes('REJECT')) return 'red'
    if (s.includes('PENDING')) return 'gold'
    return 'green'
  }
  const fmtDT = (v) => {
    const d = dayjs(v)
    return d.isValid() ? d.format('ddd, D MMM YYYY, h:mm A') : '—'
  }

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

  const fetchData = async () => {
    const params = { status: 'Pending', pageNumber: page, pageSize }

    const res = await listIncentives(params)
    setRows(res?.incentives || [])
  }

  useEffect(() => {
    fetchData()
  }, [page, pageSize])

  const columns = [
    {
      title: 'Month',
      dataIndex: 'month',
      render: (d) => fmtMonth(d),
    },
    { title: 'Ecode', dataIndex: 'ecode' },
    { title: 'Amount', dataIndex: 'amount' },
    {
      title: 'Status',
      dataIndex: 'statusName',
      render: (value) => <Tag color={statusColor(value)}>{value || '-'}</Tag>,
    },
    {
      title: 'CMD Status',
      dataIndex: 'cmdStatusName',
      render: (value) => {
        const s = value === "Approved" ? 'Approved' : value === "Rejected" ? "Rejected" : 'Pending'
        const color = value === "Rejected" ? 'red' : value === "Pending" ? 'gold' : 'green'
        return <Tag color={color}>{s || '-'}</Tag>
      },
    },
    {
      title: 'HR Status',
      dataIndex: 'hrStatusName',
      render: (value) => {
        const s = value === "Approved" ? 'Approved' : value === "Rejected" ? "Rejected" : 'Pending'
        const color = value === "Rejected" ? 'red' : value === "Pending" ? 'gold' : 'green'
        return <Tag color={color}>{s || '-'}</Tag>
      },
    },
    {
      title: 'Actions',
      render: (_, r) =>
        r.cmdStatusName === "Pending" && (
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
      cmdStatusId: approved,
      cmdRemarks: remarks || '',
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
      <Pageheading title="Incentive - CMD Approvals" />

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
        title="Review Incentive"
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

            <Row gutter={[24, 8]} style={{ marginTop: 8 }}>
              {/* Row 1 */}
              <Col xs={24} md={12}>
                <Field label="Status">
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

              {/* Row 2 */}
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

            {/* CMD Remarks input */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>
                CMD Remarks
              </Text>
              <TextArea
                rows={4}
                placeholder="Optional"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            {/* Attachments (if any) */}
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
                            Attachment {i+1}
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
