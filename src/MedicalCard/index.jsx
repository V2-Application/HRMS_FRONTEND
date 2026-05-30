import React, { useEffect, useState } from 'react'
import {
  Table,
  Input,
  Button,
  Space,
  Card,
  message,
  Modal,
  InputNumber,
  Tag,
  Popconfirm,
  Switch,
  Typography,
} from 'antd'
import { ReloadOutlined, SearchOutlined, EditOutlined, FilePdfOutlined } from '@ant-design/icons'
import axiosInstance from '../services/axiosInstance'

const { Title, Text } = Typography

const baseUrl = import.meta.env.VITE_API_URL

const formatDate = (d) => {
  if (!d) return '—'
  // Backend returns DateOnly as "YYYY-MM-DD"
  return d
}

const formatMoney = (v) =>
  v == null || v === '' ? '—' : Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 })

export default function MedicalCardAdmin({ ecodeProp, embedded = false } = {}) {
  // When ecodeProp is supplied (e.g. embedded inside EmployeeProfile), the
  // ecode is pinned to that employee and the search bar / admin controls are
  // hidden — the user just sees that employee's cards.
  const isEmbedded = embedded || !!ecodeProp
  const [ecode, setEcode] = useState(ecodeProp || '')
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState([])
  const [editing, setEditing] = useState(null) // { id, sumAssured }
  const [saving, setSaving] = useState(false)
  const [reparseLoading, setReparseLoading] = useState(false)
  const [reparseAllLoading, setReparseAllLoading] = useState(false)
  const [dryRun, setDryRun] = useState(true)
  const [lastReparse, setLastReparse] = useState(null)

  const fetchByEcode = async (codeArg) => {
    const code = (codeArg ?? ecode).trim()
    if (!code) {
      message.warning('Enter an Ecode to search.')
      return
    }
    setLoading(true)
    try {
      const res = await axiosInstance.get(`/api/MedicalCard/by-ecode/${encodeURIComponent(code)}`)
      const data = res?.data?.data || []
      setRows(data)
      if (data.length === 0) message.info(`No medical cards found for Ecode ${code}.`)
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to fetch medical cards.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  const saveSumAssured = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await axiosInstance.patch(`/api/MedicalCard/${editing.id}/sum-assured`, {
        sumAssured: editing.sumAssured,
      })
      message.success('Sum Assured updated.')
      setEditing(null)
      fetchByEcode()
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to update Sum Assured.')
    } finally {
      setSaving(false)
    }
  }

  const reparseForEcode = async () => {
    const code = ecode.trim()
    if (!code) {
      message.warning('Enter an Ecode first.')
      return
    }
    setReparseLoading(true)
    try {
      const res = await axiosInstance.post(`/api/MedicalCard/reparse/${encodeURIComponent(code)}`)
      setLastReparse(res?.data?.result || null)
      message.success(`Re-parse complete for ${code}.`)
      fetchByEcode(code)
    } catch (err) {
      message.error(err?.response?.data?.message || 'Re-parse failed.')
    } finally {
      setReparseLoading(false)
    }
  }

  const reparseAll = async () => {
    setReparseAllLoading(true)
    try {
      const res = await axiosInstance.post(`/api/MedicalCard/reparse-all`, null, {
        params: { dryRun },
      })
      setLastReparse(res?.data?.result || null)
      message.success(dryRun ? 'Dry-run complete.' : 'Re-parse all complete.')
    } catch (err) {
      message.error(err?.response?.data?.message || 'Re-parse-all failed.')
    } finally {
      setReparseAllLoading(false)
    }
  }

  // Auto-fetch when ecodeProp is supplied (embedded mode), and re-fetch if it changes.
  useEffect(() => {
    if (ecodeProp) {
      setEcode(ecodeProp)
      fetchByEcode(ecodeProp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ecodeProp])

  const openPdf = (path) => {
    if (!path) return
    const url = path.startsWith('http') ? path : `${baseUrl}${path.replace(/^\//, '')}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const columns = [
    { title: '#', dataIndex: 'cardOrder', width: 50 },
    { title: 'Holder', dataIndex: 'holderName', width: 180, render: (v) => v || '—' },
    {
      title: 'Age / Gender',
      width: 110,
      render: (_, r) => `${r.age ?? '—'} / ${r.gender || '—'}`,
    },
    { title: 'UHID', dataIndex: 'uhidNo', width: 140, render: (v) => v || '—' },
    { title: 'Policy No', dataIndex: 'policyNo', width: 160, render: (v) => v || '—' },
    { title: 'Insurer', dataIndex: 'insurer', width: 160, render: (v) => v || '—' },
    { title: 'TPA', dataIndex: 'tpa', width: 140, render: (v) => v || '—' },
    { title: 'Organisation', dataIndex: 'organisation', width: 160, render: (v) => v || '—' },
    {
      title: 'Valid From',
      dataIndex: 'planValidFrom',
      width: 110,
      render: formatDate,
    },
    {
      title: 'Valid To',
      dataIndex: 'planValidTo',
      width: 110,
      render: formatDate,
    },
    {
      title: 'Sum Assured',
      dataIndex: 'sumAssured',
      width: 140,
      render: (v, r) => (
        <Space>
          <span>{formatMoney(v)}</span>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => setEditing({ id: r.id, sumAssured: v ?? null })}
          />
        </Space>
      ),
    },
    {
      title: 'PDF',
      dataIndex: 'sourcePdfUrl',
      width: 70,
      render: (v) =>
        v ? (
          <Button
            size="small"
            type="link"
            icon={<FilePdfOutlined />}
            onClick={() => openPdf(v)}
          />
        ) : (
          '—'
        ),
    },
  ]

  return (
    <div style={{ padding: '0.5rem' }}>
      {!isEmbedded && (
        <Title level={4} style={{ marginTop: 0 }}>
          Medical Cards
        </Title>
      )}

      {!isEmbedded && (
        <Card size="small" style={{ marginBottom: 12 }}>
          <Space wrap>
            <Input
              placeholder="Enter Ecode"
              value={ecode}
              onChange={(e) => setEcode(e.target.value)}
              onPressEnter={() => fetchByEcode()}
              allowClear
              style={{ width: 220 }}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => fetchByEcode()}
              loading={loading}
            >
              Search
            </Button>
            <Popconfirm
              title={`Re-parse the PDF for ${ecode || 'this ecode'}?`}
              onConfirm={reparseForEcode}
              disabled={!ecode.trim()}
            >
              <Button icon={<ReloadOutlined />} loading={reparseLoading} disabled={!ecode.trim()}>
                Re-parse this Ecode
              </Button>
            </Popconfirm>
          </Space>
        </Card>
      )}

      {!isEmbedded && (
        <Card size="small" style={{ marginBottom: 12 }}>
          <Space wrap>
            <Text strong>Admin:</Text>
            <Text type="secondary">Re-parse every employee with a Medical Card URL set.</Text>
            <span>
              Dry run <Switch checked={dryRun} onChange={setDryRun} size="small" />
            </span>
            <Popconfirm
              title={
                dryRun
                  ? 'Run a dry-run across all employees? No changes will be written.'
                  : 'Re-parse ALL employees and write changes to the DB. Continue?'
              }
              onConfirm={reparseAll}
            >
              <Button danger={!dryRun} loading={reparseAllLoading} icon={<ReloadOutlined />}>
                {dryRun ? 'Dry-run all' : 'Re-parse all'}
              </Button>
            </Popconfirm>
            {lastReparse && (
              <Space size="small" wrap>
                <Tag color="blue">Processed: {lastReparse.employeesProcessed}</Tag>
                <Tag color="green">Inserted: {lastReparse.cardsInserted}</Tag>
                <Tag color="orange">Skipped: {lastReparse.cardsSkipped}</Tag>
                {Array.isArray(lastReparse.errors) && lastReparse.errors.length > 0 && (
                  <Tag color="red">Errors: {lastReparse.errors.length}</Tag>
                )}
              </Space>
            )}
          </Space>
        </Card>
      )}

      {isEmbedded && (
        <Space style={{ marginBottom: 12 }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchByEcode()}
            loading={loading}
            disabled={!ecode}
          >
            Refresh
          </Button>
        </Space>
      )}

      <Table
        size="small"
        rowKey="id"
        dataSource={rows}
        columns={columns}
        loading={loading}
        pagination={false}
        scroll={{ x: 'max-content' }}
      />

      <Modal
        open={!!editing}
        title="Edit Sum Assured"
        onCancel={() => setEditing(null)}
        onOk={saveSumAssured}
        confirmLoading={saving}
        okText="Save"
      >
        <InputNumber
          style={{ width: '100%' }}
          placeholder="Sum Assured"
          min={0}
          step={1000}
          value={editing?.sumAssured ?? null}
          onChange={(v) => setEditing((prev) => (prev ? { ...prev, sumAssured: v } : prev))}
        />
      </Modal>
    </div>
  )
}
