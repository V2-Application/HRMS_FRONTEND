import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Table,
  Button,
  Tooltip,
  message,
  Modal,
  Upload,
  Typography,
  Input,
  InputNumber,
  Select,
  Tag,
} from 'antd'
import {
  UploadOutlined,
  DownloadOutlined,
  ExportOutlined,
  ReloadOutlined,
  EditOutlined,
  SearchOutlined,
  SaveOutlined,
  DownOutlined,
  RightOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { useSelector } from 'react-redux'
import axiosInstance from '../../services/axiosInstance'

const { Paragraph, Text, Title } = Typography

const renderField = (f, value, onChange) => {
  if (f.type === 'number')
    return (
      <InputNumber
        value={value}
        onChange={onChange}
        precision={f.precision ?? 2}
        controls={false}
        style={{ width: '100%' }}
        placeholder={f.label}
      />
    )
  if (f.type === 'select')
    return (
      <Select
        value={value || undefined}
        onChange={onChange}
        allowClear={!f.required}
        showSearch
        style={{ width: '100%' }}
        placeholder={f.required ? f.label : `${f.label} (optional)`}
        options={(f.options || []).map((o) => ({ value: o, label: o }))}
      />
    )
  return <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={f.label} />
}

/** Inline editor for all entries of ONE state: edit existing, add new (+), single Submit. */
const StateEditor = ({ stateName, rows, entryFields, apiBase, accent, addLabel, onSaved }) => {
  const tempRef = useRef(-1)
  const init = () => rows.map((r) => ({ ...r, __key: `e${r.id}` }))
  const [draft, setDraft] = useState(init)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(rows.map((r) => ({ ...r, __key: `e${r.id}` })))
  }, [rows])

  const setCell = (key, field, val) =>
    setDraft((prev) => prev.map((r) => (r.__key === key ? { ...r, [field]: val } : r)))

  const addRow = () => {
    const blank = { __key: `n${tempRef.current--}`, id: null, state: stateName }
    entryFields.forEach((f) => (blank[f.key] = undefined))
    setDraft((prev) => [...prev, blank])
  }

  const removeRow = (key) => setDraft((prev) => prev.filter((r) => r.__key !== key))

  const submit = async () => {
    for (let i = 0; i < draft.length; i++) {
      for (const f of entryFields) {
        if (f.required) {
          const v = draft[i][f.key]
          if (v === null || v === undefined || String(v).trim() === '') {
            message.warning(`Entry ${i + 1}: ${f.label} is required`)
            return
          }
        }
      }
    }
    setSaving(true)
    try {
      await Promise.all(
        draft.map((r) => {
          const { __key, ...rest } = r
          const payload = { ...rest, state: stateName }
          // Existing row (has id) -> Update; new row -> Create
          const url = r.id ? `/api/${apiBase}/Update` : `/api/${apiBase}/Create`
          return axiosInstance.post(url, payload)
        }),
      )
      message.success(`Saved ${draft.length} entr${draft.length === 1 ? 'y' : 'ies'} for ${stateName}`)
      onSaved?.()
    } catch (err) {
      message.error(err?.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const cols = [
    { title: '#', key: 'idx', width: 48, align: 'center', render: (_, __, i) => i + 1 },
    ...entryFields.map((f) => ({
      title: (
        <span>
          {f.label}
          {f.required && <span style={{ color: '#ff4d4f' }}> *</span>}
        </span>
      ),
      dataIndex: f.key,
      key: f.key,
      width: f.width || 150,
      render: (val, record) => renderField(f, record[f.key], (v) => setCell(record.__key, f.key, v)),
    })),
    {
      title: '',
      key: 'rm',
      width: 44,
      align: 'center',
      render: (_, record) =>
        record.id ? null : (
          <Tooltip title="Remove this new row">
            <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeRow(record.__key)} />
          </Tooltip>
        ),
    },
  ]

  return (
    <div style={{ padding: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 6 }}>
        <Tooltip title={addLabel || 'Add Row'}>
          <Button
            type="primary"
            shape="circle"
            size="small"
            icon={<PlusOutlined />}
            onClick={addRow}
            style={{ background: accent, borderColor: accent }}
          />
        </Tooltip>
      </div>
      <Table
        size="small"
        rowKey={(r) => r.__key}
        columns={cols}
        dataSource={draft}
        pagination={false}
        bordered
        scroll={{ x: 'max-content' }}
      />
      <div style={{ textAlign: 'right', marginTop: 8 }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={submit}
          style={{ background: accent, borderColor: accent }}
        >
          Submit {stateName}
        </Button>
      </div>
    </div>
  )
}

/**
 * Grouped policy-master page: one row per STATE; click "View / Edit" to expand that state's
 * entries as editable fields + Submit. Update-only (no inserts). Plus Excel upload/export.
 */
const PolicyMasterPage = ({
  title,
  subtitle,
  apiBase,
  accent = '#4f46e5',
  editFields = [],
  addLabel = 'Add Row',
  templateName,
  exportName,
  uploadNotes = [],
}) => {
  const { theme } = useSelector((state) => state.ui)
  const isDark = theme === 'dark'
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [expandedKeys, setExpandedKeys] = useState([])

  const [uploadOpen, setUploadOpen] = useState(false)
  const [fileList, setFileList] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const entryFields = useMemo(() => editFields.filter((f) => f.key !== 'state'), [editFields])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get(`/api/${apiBase}/GetAll`)
      const rows = res?.data?.data || res?.data?.Data || []
      setData(Array.isArray(rows) ? rows : [])
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to load data')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------- group by state ----------
  const groups = useMemo(() => {
    const m = new Map()
    for (const r of data) {
      const k = (r.state ?? '—').toString()
      if (!m.has(k)) m.set(k, [])
      m.get(k).push(r)
    }
    return Array.from(m.entries())
      .map(([state, rows]) => ({ state, rows, count: rows.length }))
      .sort((a, b) => a.state.localeCompare(b.state))
  }, [data])

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups
    const n = search.toLowerCase()
    return groups.filter(
      (g) =>
        g.state.toLowerCase().includes(n) ||
        g.rows.some((r) => Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(n))),
    )
  }, [groups, search])

  const toggle = (state) =>
    setExpandedKeys((prev) => (prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]))

  // ---------- export / template / upload ----------
  const downloadBlob = (blob, name) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    try {
      const res = await axiosInstance.get(`/api/${apiBase}/GetAll?isExcel=true`, { responseType: 'blob' })
      downloadBlob(
        new Blob([res.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        exportName || `${apiBase}.xlsx`,
      )
    } catch (err) {
      message.error(err?.response?.data?.message || 'Export failed')
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const res = await axiosInstance.get(`/api/${apiBase}/DownloadTemplate`, {
        responseType: 'blob',
        headers: { Accept: '*/*' },
      })
      downloadBlob(new Blob([res.data]), templateName || `${apiBase}_Template.xlsx`)
    } catch (e) {
      message.error('Failed to download template.')
    }
  }

  const beforeUpload = (file) => {
    const isXlsx =
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.name.toLowerCase().endsWith('.xlsx')
    if (!isXlsx) {
      message.error('You can only upload .xlsx file!')
      return Upload.LIST_IGNORE
    }
    setUploadError('')
    return false
  }

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Please choose an .xlsx file first.')
      return
    }
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', fileList[0].originFileObj)
    try {
      const res = await axiosInstance.post(`/api/${apiBase}/UploadExcel`, formData, {
        headers: { Accept: '*/*' },
      })
      if (res.status === 200) {
        message.success(res.data?.message || 'Uploaded successfully!')
        setUploadOpen(false)
        setFileList([])
        fetchData()
      }
    } catch (err) {
      setUploadError(err?.response?.data?.message || 'Error uploading file.')
      message.error('Upload failed!')
    } finally {
      setIsUploading(false)
    }
  }

  const stateCount = groups.length

  const mainColumns = [
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      render: (s, g) => (
        <span style={{ cursor: 'pointer', fontWeight: 600 }} onClick={() => toggle(g.state)}>
          {expandedKeys.includes(g.state) ? (
            <DownOutlined style={{ fontSize: 11, marginRight: 8, color: accent }} />
          ) : (
            <RightOutlined style={{ fontSize: 11, marginRight: 8, color: '#9ca3af' }} />
          )}
          {s}
        </span>
      ),
    },
    {
      title: 'Entries',
      dataIndex: 'count',
      key: 'count',
      width: 120,
      align: 'center',
      render: (c) => <Tag color={accent} style={{ borderRadius: 10 }}>{c}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 170,
      align: 'center',
      render: (_, g) => (
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => toggle(g.state)}
          style={{ borderRadius: 8, borderColor: accent, color: accent }}
        >
          {expandedKeys.includes(g.state) ? 'Hide entries' : 'View / Edit'}
        </Button>
      ),
    },
  ]

  return (
    <div style={{ padding: 16 }}>
      {/* Header banner */}
      <div
        style={{
          background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 60%, ${accent}99 100%)`,
          borderRadius: 14,
          padding: '18px 22px',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
        }}
      >
        <div>
          <Title level={3} style={{ color: '#fff', margin: 0 }}>
            {title}
          </Title>
          {subtitle && <Text style={{ color: 'rgba(255,255,255,0.9)' }}>{subtitle}</Text>}
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <Stat label="States" value={stateCount} />
          <Stat label="Total Entries" value={data.length} />
        </div>
      </div>

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          margin: '16px 0 12px',
        }}
      >
        <Input
          allowClear
          prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
          placeholder="Search by state…"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          style={{ width: 320, borderRadius: 8 }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title="Refresh">
            <Button icon={<ReloadOutlined />} onClick={fetchData} style={{ borderRadius: 8 }} />
          </Tooltip>
          <Button
            icon={<UploadOutlined />}
            type="primary"
            onClick={() => setUploadOpen(true)}
            style={{ borderRadius: 8, background: accent, borderColor: accent }}
          >
            Upload
          </Button>
          <Button icon={<ExportOutlined />} onClick={handleExport} style={{ borderRadius: 8 }}>
            Export
          </Button>
        </div>
      </div>

      <style>{`
        .pm-grouped .ant-table-expanded-row > .ant-table-cell { padding: 8px 12px !important; background: ${isDark ? 'transparent' : '#f7f8fc'}; }
        .pm-grouped .ant-table-expanded-row .ant-table-cell { vertical-align: middle; }
      `}</style>
      <div
        className="pm-grouped"
        style={{
          background: isDark ? 'transparent' : '#fff',
          borderRadius: 12,
          boxShadow: isDark ? 'none' : '0 1px 8px rgba(0,0,0,0.06)',
          padding: 6,
        }}
      >
        <Table
          size="middle"
          rowKey={(g) => g.state}
          columns={mainColumns}
          dataSource={filteredGroups}
          loading={loading}
          bordered
          pagination={{ pageSize: 25, showSizeChanger: true, pageSizeOptions: ['10', '25', '50'], showTotal: (t) => `${t} states` }}
          expandable={{
            expandedRowKeys: expandedKeys,
            onExpand: (_, g) => toggle(g.state),
            showExpandColumn: false,
            expandedRowRender: (g) => (
              <StateEditor
                stateName={g.state}
                rows={g.rows}
                entryFields={entryFields}
                apiBase={apiBase}
                accent={accent}
                addLabel={addLabel}
                onSaved={fetchData}
              />
            ),
          }}
          className={isDark ? 'dark-theme' : ''}
        />
      </div>

      {/* Upload modal (update-only) */}
      <Modal
        title={`Upload ${title}`}
        open={uploadOpen}
        onCancel={() => setUploadOpen(false)}
        footer={null}
        destroyOnClose
        centered
      >
        <Button
          icon={<DownloadOutlined />}
          type="primary"
          block
          onClick={handleDownloadTemplate}
          style={{ background: accent, borderColor: accent }}
        >
          Download Sample Sheet
        </Button>
        <Paragraph type="secondary" style={{ fontSize: 13, marginTop: 8 }}>
          * Uploads only <b>update existing rows</b> (matched by key) — new rows are never inserted.
        </Paragraph>
        {uploadError && (
          <Paragraph type="danger" style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
            * {uploadError}
          </Paragraph>
        )}
        <Upload
          multiple={false}
          accept=".xlsx"
          beforeUpload={beforeUpload}
          onChange={({ fileList: nl }) => setFileList(nl.slice(-1))}
          fileList={fileList}
          onRemove={() => setFileList([])}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Choose File</Button>
        </Upload>
        <div style={{ marginTop: 16 }}>
          <Button
            type="primary"
            loading={isUploading}
            onClick={handleUpload}
            block
            style={{ background: accent, borderColor: accent }}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
        {uploadNotes.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text strong>Note:</Text>
            {uploadNotes.map((n, i) => (
              <Paragraph key={i} style={{ marginBottom: 4 }}>
                {i + 1}. {n}
              </Paragraph>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

const Stat = ({ label, value }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontSize: 12, opacity: 0.9 }}>{label}</div>
  </div>
)

export default PolicyMasterPage
