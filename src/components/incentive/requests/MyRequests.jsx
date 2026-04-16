/* eslint-disable prettier/prettier */
// components/incentive/RequestsList.jsx
import React, { useEffect, useState, useCallback } from 'react'
import { Table, Row, Col, Input, Select, Button, Drawer, Space, Tag, message, Divider } from 'antd'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { listIncentives, submitIncentive, getIncentive } from '../../../services/Services'
import Pageheading from '../../shared/Pageheading'
import { PlusOutlined, MinusOutlined, EyeOutlined } from '@ant-design/icons'
import useMediaQuery from '../../../hooks/useMediaQuery'

const FILE_BASE_URL = import.meta.env.VITE_API_URL

const fmtDT = (v) => {
  const d = dayjs(v)
  return d.isValid() ? d.format('ddd, D MMM YYYY, h:mm A') : '—'
}
const statusColor = (label = '') => {
  const s = (label || '').toUpperCase()
  if (s.includes('REJECT')) return 'red'
  if (s.includes('PENDING')) return 'gold'
  return 'green'
}

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', gap: 12 }}>
    <div style={{ width: 110, opacity: 0.75, whiteSpace: 'nowrap' }}>{label}</div>
    <div style={{ fontWeight: 500, minWidth: 0 }}>{children}</div>
  </div>
)

export default function MyRequest() {
  const navigate = useNavigate()

  // table & filters
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState()

  // drawer
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(null)

  // ✅ MOBILE ADDITIONS
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  const handleToggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const expandedRowRender = (record) => (
    <div style={{ padding: 12, background: '#fafafa', fontSize: 12 }}>
      <Row gutter={[8, 8]}>
        <Col span={6}>
          <div
            style={{
              color: '#666',
              marginBottom: 4,
              fontSize: 10,
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            CMD Status
          </div>
          <div style={{ textAlign: 'center' }}>
            <Tag
              color={statusColor(record.cmdStatusName)}
              style={{ fontSize: 10, fontWeight: 500 }}
            >
              {record.cmdStatusName || '-'}
            </Tag>
          </div>
        </Col>
        <Col span={6}>
          <div
            style={{
              color: '#666',
              marginBottom: 4,
              fontSize: 10,
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            HR Status
          </div>
          <div style={{ textAlign: 'center' }}>
            <Tag color={statusColor(record.hrStatusName)} style={{ fontSize: 10, fontWeight: 500 }}>
              {record.hrStatusName || '-'}
            </Tag>
          </div>
        </Col>
        <Col span={6}>
          <div
            style={{
              color: '#666',
              marginBottom: 4,
              fontSize: 10,
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            Created
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 10,
              textAlign: 'center',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.2',
            }}
          >
            {record.createdAt ? dayjs(record.createdAt).format('DD/MM/YY') : '-'}
          </div>
        </Col>
        <Col span={6}>
          <div
            style={{
              color: '#666',
              marginBottom: 4,
              fontSize: 10,
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            Updated
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 10,
              textAlign: 'center',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.2',
            }}
          >
            {record.updatedAt ? dayjs(record.updatedAt).format('DD/MM/YY') : '-'}
          </div>
        </Col>
      </Row>
    </div>
  )

  const getMobileColumns = () => [
    {
      title: 'E-Code',
      dataIndex: 'ecode',
      width: 60,
      render: (text) => <div style={{ fontSize: 12, fontWeight: 500 }}>{text || '-'}</div>,
    },
    {
      title: 'Month',
      dataIndex: 'month',
      width: 60,
      render: (d) => (
        <div style={{ fontSize: 12, fontWeight: 500 }}>{d ? d.split('T')[0].slice(0, 7) : '-'}</div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      width: 60,
      render: (amount) => (
        <div style={{ fontSize: 12, fontWeight: 500 }}>₹{Number(amount || 0).toLocaleString()}</div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'statusName',
      width: 70,
      render: (value) => (
        <Tag color={statusColor(value)} style={{ fontSize: 10, fontWeight: 500 }}>
          {value || '-'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined style={{ fontSize: 12 }} />}
            onClick={async (e) => {
              e.stopPropagation()
              const details = await getIncentive(record.incentiveId)
              setCurrent(details)
              setOpen(true)
            }}
            style={{ padding: '4px' }}
          />
          <Button
            type="text"
            size="small"
            icon={
              expandedCards[record.incentiveId] ? (
                <MinusOutlined style={{ fontSize: 12 }} />
              ) : (
                <PlusOutlined style={{ fontSize: 12 }} />
              )
            }
            onClick={(e) => {
              e.stopPropagation()
              handleToggleCard(record.incentiveId)
            }}
            style={{ padding: '4px' }}
          />
        </Space>
      ),
    },
  ]

  // Debounce search 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search])

  // Client-side UI status filter (fallback)
  const filterByUiStatus = (list, uiStatus) => {
    if (!uiStatus) return list
    const S = uiStatus.toUpperCase()
    return list.filter((r) => {
      const name = (r.statusName || '').toUpperCase()
      const cmd = r.cmdApproved
      const hr = r.hrApproved
      switch (S) {
        case 'DRAFT':
          return name === 'DRAFT'
        case 'PENDING':
          return name.includes('PENDING')
        case 'REJECTED':
          return name.includes('REJECT')
        case 'APPROVED':
          return name === 'APPROVED' || (cmd === true && hr === true)
        default:
          return true
      }
    })
  }

  const fetchData = async () => {
    const params = {
      pageNumber: page,
      pageSize,
      search: debouncedSearch || undefined,
      mine: true,
    }
    const res = await listIncentives(params)
    const base = Array.isArray(res?.incentives) ? res.incentives : []
    const filtered = filterByUiStatus(base, status)
    setRows(filtered)
    setTotal(res?.totalCount ?? filtered.length)
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, debouncedSearch, status])

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status])

  const canEdit = (row) => {
    const s = (row.statusName || '').toUpperCase()
    return s === 'PENDING' || s.includes('REJECT')
  }

  const columns = [
    {
      title: 'Month',
      dataIndex: 'month',
      render: (d) => (d ? d.split('T')[0].slice(0, 7) : '-'),
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
      render: (value) => <Tag color={statusColor(value)}>{value || '-'}</Tag>,
    },
    {
      title: 'HR Status',
      dataIndex: 'hrStatusName',
      render: (value) => <Tag color={statusColor(value)}>{value || '-'}</Tag>,
    },
    {
      title: 'Actions',
      render: (_, r) => (
        <Space>
          <Button
            onClick={async () => {
              const details = await getIncentive(r.incentiveId)
              setCurrent(details)
              setOpen(true)
            }}
          >
            View
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Pageheading title="Incentive - My Requests" />

      <Row gutter={[8, 8]} style={{ marginBottom: 8 }}>
        <Col>
          <Input
            placeholder="Search..."
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col>
          <Select
            allowClear
            placeholder="Status"
            style={{ minWidth: 160 }}
            value={status}
            onChange={setStatus}
            options={['Pending', 'Approved', 'Rejected'].map((s) => ({
              label: s,
              value: s,
            }))}
          />
        </Col>
        <Col>
          <Button
            onClick={() => {
              setSearch('')
              setStatus(undefined)
            }}
          >
            Clear
          </Button>
        </Col>
      </Row>

      <Table
        rowKey="incentiveId"
        columns={isMobile ? getMobileColumns() : columns}
        dataSource={rows}
        pagination={{
          current: page,
          total,
          pageSize,
          showSizeChanger: true,
          onChange: (p, ps) => {
            setPage(p)
            setPageSize(ps)
          },
        }}
        bordered
        scroll={isMobile ? undefined : { x: 'max-content', y: 'calc(100vh - 220px)' }}
        expandable={
          isMobile
            ? {
                expandedRowKeys: rows
                  .map((record) => record.incentiveId)
                  .filter((id) => expandedCards[id]),
                expandedRowRender: expandedRowRender,
                showExpandColumn: false,
              }
            : undefined
        }
        // ✅ Remove onRow for mobile, keep for desktop only
        onRow={
          !isMobile
            ? (record) => ({
                onClick: async () => {
                  const details = await getIncentive(record.incentiveId)
                  setCurrent(details)
                  setOpen(true)
                },
              })
            : undefined
        }
      />

      <Drawer
        width={640}
        open={open}
        onClose={() => setOpen(false)}
        title="Incentive Details"
        styles={{
          body: { paddingTop: 12, paddingBottom: 12 },
          header: { borderBottom: '1px solid var(--ant-border-color-split)' },
          footer: { borderTop: '1px solid var(--ant-border-color-split)' },
        }}
        footer={
          current && (current.statusName || '').toUpperCase() === 'DRAFT' ? (
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setOpen(false)}>Close</Button>
              <Button
                type="primary"
                onClick={async () => {
                  const res = await submitIncentive(current.incentiveId)
                  if (res?.success) {
                    message.success('Submitted')
                    setOpen(false)
                    fetchData()
                  } else {
                    message.error(res?.message || 'Failed')
                  }
                }}
              >
                Submit for Approval
              </Button>
            </Space>
          ) : (
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="primary" onClick={() => setOpen(false)}>
                Close
              </Button>
            </Space>
          )
        }
      >
        {current && (
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* Summary card */}
            <div
              style={{
                border: '1px solid var(--ant-border-color-split)',
                borderRadius: 8,
                padding: 12,
                background: 'rgba(0,0,0,0.02)',
              }}
            >
              <Row gutter={[12, 12]}>
                <Col xs={24} md={12}>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>Employee</div>
                  <div style={{ fontWeight: 600 }}>
                    {current.empName || ''} ({current.ecode})
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>Month</div>
                  <div style={{ fontWeight: 600 }}>
                    {current.month ? current.month.split('T')[0].slice(0, 7) : '-'}
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div style={{ fontSize: 12, opacity: 0.75 }}>Amount</div>
                  <div style={{ fontWeight: 600 }}>
                    {Number(current.amount || 0).toLocaleString()}
                  </div>
                </Col>
              </Row>
            </div>

            {/* Details grid */}
            <Row gutter={[24, 8]} style={{ marginTop: 8 }}>
              <Col xs={24} md={12}>
                <Field label="Status">
                  <Tag color={statusColor(current.statusName)}>{current.statusName || '-'}</Tag>
                </Field>
              </Col>
              <Col xs={24} md={12}>
                <Field label="Created By">
                  <span style={{ whiteSpace: 'nowrap' }}>{current.createdBy || '-'}</span>
                </Field>
              </Col>
              <Col xs={24} md={12}>
                <Field label="Created At">
                  <span style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                    {fmtDT(current.createdAt)}
                  </span>
                </Field>
              </Col>
              <Col xs={24} md={12}>
                <Field label="Updated At">
                  <span style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                    {fmtDT(current.updatedAt)}
                  </span>
                </Field>
              </Col>
            </Row>

            <Divider style={{ margin: '8px 0' }} />

            {/* Remarks */}
            <div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Remarks</div>
              <div
                style={{
                  padding: 12,
                  border: '1px solid var(--ant-border-color-split)',
                  borderRadius: 6,
                  whiteSpace: 'pre-wrap',
                  background: 'rgba(0,0,0,0.02)',
                }}
              >
                {current.remarks || '—'}
              </div>
            </div>

            {current?.cmdRemarks && (
              <div>
                <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>CMD Remarks</div>
                <div
                  style={{
                    padding: 12,
                    border: '1px solid var(--ant-border-color-split)',
                    borderRadius: 6,
                    whiteSpace: 'pre-wrap',
                    background: 'rgba(0,0,0,0.02)',
                  }}
                >
                  {current.cmdRemarks || '—'}
                </div>
              </div>
            )}

            {current?.hrRemarks && (
              <div>
                <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>HR Remarks</div>
                <div
                  style={{
                    padding: 12,
                    border: '1px solid var(--ant-border-color-split)',
                    borderRadius: 6,
                    whiteSpace: 'pre-wrap',
                    background: 'rgba(0,0,0,0.02)',
                  }}
                >
                  {current.hrRemarks || '—'}
                </div>
              </div>
            )}

            {/* Attachments */}
            {Array.isArray(current.attachments) && current.attachments.length > 0 && (
              <>
                <Divider style={{ margin: '8px 0' }} />
                <div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 6 }}>Attachments</div>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {current.attachments.map((a, i) => {
                      const href = a.url?.startsWith('http')
                        ? a.url
                        : `${FILE_BASE_URL}${a.filePath || a.url || ''}`
                      return (
                        <li key={i} style={{ marginBottom: 6 }}>
                          <a href={href} target="_blank" rel="noopener noreferrer">
                            {a.name || `Attachment ${i + 1}`}
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
