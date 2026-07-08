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
  Upload,
  Alert,
  Progress,
} from 'antd'
import {
  ReloadOutlined,
  SearchOutlined,
  EditOutlined,
  FilePdfOutlined,
  UploadOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons'
import axiosInstance from '../services/axiosInstance'
import JSZip from 'jszip'

const { Title, Text } = Typography

// Upload PDFs in small batches (multiple requests) instead of one giant request.
// Keeps every request well under the IIS request-size limit, so a ZIP/selection
// of 1000+ medical cards never triggers HTTP 413 (Content Too Large).
const BULK_BATCH_SIZE = 10

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
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkFiles, setBulkFiles] = useState([])
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkResult, setBulkResult] = useState(null)
  const [bulkSkipReparse, setBulkSkipReparse] = useState(true)
  const [bulkProgress, setBulkProgress] = useState(null) // { done, total, phase }

  // Expand the user's selection into a flat list of PDF File objects.
  // Loose PDFs pass through; ZIPs are unzipped in the browser (JSZip) so their
  // PDFs can be re-batched into small requests instead of one huge upload.
  const expandToPdfFiles = async (rawFiles) => {
    const pdfs = []
    for (const f of rawFiles) {
      const name = (f.name || '').toLowerCase()
      if (name.endsWith('.zip')) {
        const zip = await JSZip.loadAsync(f)
        const entries = Object.values(zip.files).filter(
          (e) => !e.dir && /\.pdf$/i.test(e.name),
        )
        for (const entry of entries) {
          const blob = await entry.async('blob')
          // Strip any folder path inside the zip — filename (basename) = Ecode.
          const base = entry.name.split('/').pop()
          pdfs.push(new File([blob], base, { type: 'application/pdf' }))
        }
      } else if (name.endsWith('.pdf')) {
        pdfs.push(f)
      }
    }
    return pdfs
  }

  const submitBulkUpload = async () => {
    if (bulkFiles.length === 0) {
      message.warning('Pick one or more PDFs (or a ZIP) first.')
      return
    }
    setBulkLoading(true)
    setBulkResult(null)
    setBulkProgress({ done: 0, total: 0, phase: 'Reading files…' })

    try {
      // 1) Flatten selection (unzip any ZIPs client-side) into individual PDFs.
      const rawFiles = bulkFiles.map((f) => f.originFileObj || f)
      const pdfFiles = await expandToPdfFiles(rawFiles)

      if (pdfFiles.length === 0) {
        message.warning('No PDF files found in the selection / ZIP.')
        setBulkProgress(null)
        return
      }

      // 2) Split into batches of BULK_BATCH_SIZE and upload sequentially.
      const batches = []
      for (let i = 0; i < pdfFiles.length; i += BULK_BATCH_SIZE) {
        batches.push(pdfFiles.slice(i, i + BULK_BATCH_SIZE))
      }

      // Aggregate the per-batch results into one combined summary.
      const agg = {
        totalFiles: 0,
        savedCount: 0,
        skippedCount: 0,
        cardsParsed: 0,
        errors: [],
        items: [],
      }

      setBulkProgress({ done: 0, total: pdfFiles.length, phase: 'Uploading…' })

      for (let b = 0; b < batches.length; b++) {
        const batch = batches[b]
        const fd = new FormData()
        batch.forEach((file) => fd.append('files', file))

        try {
          const res = await axiosInstance.post(
            `/api/MedicalCard/bulk-upload?skipReparse=${bulkSkipReparse}`,
            fd,
            {
              headers: { 'Content-Type': 'multipart/form-data' },
              timeout: 0,
              maxContentLength: Infinity,
              maxBodyLength: Infinity,
            },
          )
          const r = res?.data?.result
          if (r) {
            agg.totalFiles += r.totalFiles || 0
            agg.savedCount += r.savedCount || 0
            agg.skippedCount += r.skippedCount || 0
            agg.cardsParsed += r.cardsParsed || 0
            if (Array.isArray(r.errors)) agg.errors.push(...r.errors)
            if (Array.isArray(r.items)) agg.items.push(...r.items)
          }
        } catch (err) {
          // Don't abort the whole import if one batch fails — record and move on.
          const msg = err?.response?.data?.message || err?.message || 'Batch failed'
          batch.forEach((file) =>
            agg.items.push({ fileName: file.name, ecode: '', saved: false, error: msg }),
          )
          agg.errors.push(`Batch ${b + 1}/${batches.length}: ${msg}`)
        }

        setBulkProgress({
          done: Math.min((b + 1) * BULK_BATCH_SIZE, pdfFiles.length),
          total: pdfFiles.length,
          phase: `Uploading… (batch ${b + 1}/${batches.length})`,
        })
        // Reflect progress live in the result panel as batches complete.
        setBulkResult({ ...agg })
      }

      setBulkResult(agg)
      message.success(`Uploaded ${agg.savedCount} / ${agg.totalFiles} file(s) in ${batches.length} batch(es).`)
    } catch (err) {
      message.error(err?.message || 'Bulk upload failed.')
    } finally {
      setBulkLoading(false)
      setBulkProgress(null)
    }
  }

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
            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              onClick={() => {
                setBulkFiles([])
                setBulkResult(null)
                setBulkOpen(true)
              }}
            >
              Bulk Upload PDFs
            </Button>
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

      <Modal
        open={bulkOpen}
        title="Bulk Upload Medical Card PDFs"
        width={720}
        onCancel={() => {
          if (bulkLoading) return
          setBulkOpen(false)
        }}
        footer={[
          <Button key="close" onClick={() => setBulkOpen(false)} disabled={bulkLoading}>
            Close
          </Button>,
          <Button
            key="upload"
            type="primary"
            icon={<UploadOutlined />}
            loading={bulkLoading}
            onClick={submitBulkUpload}
            disabled={bulkFiles.length === 0}
          >
            Upload {bulkFiles.length > 0 ? `(${bulkFiles.length})` : ''}
          </Button>,
        ]}
        destroyOnClose
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
          message="Drop loose PDFs or a ZIP containing PDFs. Each PDF's filename (without extension) must be the employee Ecode — e.g. V00362.pdf → V00362."
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
            flexWrap: 'wrap',
          }}
        >
          <Text strong>Skip parse phase</Text>
          <Switch
            checked={bulkSkipReparse}
            onChange={setBulkSkipReparse}
            size="small"
            disabled={bulkLoading}
          />
          <Text type="secondary" style={{ fontSize: 12, flex: '1 1 240px' }}>
            {bulkSkipReparse
              ? 'Files saved + URLs updated. Click Re-parse all afterwards. Recommended for 1000+ files.'
              : 'Files parsed inline. Slower; OK for small batches.'}
          </Text>
        </div>

        <style>{`
          .mc-bulk-dragger,
          .mc-bulk-dragger .ant-upload-wrapper,
          .mc-bulk-dragger .ant-upload,
          .mc-bulk-dragger .ant-upload-drag {
            width: 100% !important;
            display: block !important;
            box-sizing: border-box;
          }
          .mc-bulk-dragger .ant-upload-drag {
            padding: 20px 16px;
          }
        `}</style>
        <div className="mc-bulk-dragger">
          <Upload.Dragger
            multiple
            accept=".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed"
            beforeUpload={() => false}
            fileList={bulkFiles}
            onChange={({ fileList }) => setBulkFiles(fileList)}
            onRemove={(f) => setBulkFiles((prev) => prev.filter((x) => x.uid !== f.uid))}
          >
            <p className="ant-upload-drag-icon" style={{ marginBottom: 8 }}>
              <CloudUploadOutlined />
            </p>
            <p className="ant-upload-text" style={{ margin: 0 }}>
              Click or drag PDFs or a ZIP here
            </p>
            <p
              className="ant-upload-hint"
              style={{ marginTop: 4, paddingInline: 16, fontSize: 12 }}
            >
              PDF filename = Ecode. Unknown ecodes are skipped, not failed. ZIPs are unpacked server-side.
            </p>
          </Upload.Dragger>
        </div>

        {bulkProgress && (
          <div style={{ marginTop: 16 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {bulkProgress.phase}
            </Text>
            <Progress
              percent={
                bulkProgress.total > 0
                  ? Math.round((bulkProgress.done / bulkProgress.total) * 100)
                  : 0
              }
              status="active"
              format={() => `${bulkProgress.done}/${bulkProgress.total}`}
            />
          </div>
        )}

        {bulkResult && (
          <div style={{ marginTop: 16 }}>
            <Space wrap style={{ marginBottom: 8 }}>
              <Tag color="blue">Total: {bulkResult.totalFiles}</Tag>
              <Tag color="green">Saved: {bulkResult.savedCount}</Tag>
              <Tag color="orange">Skipped: {bulkResult.skippedCount}</Tag>
              <Tag color="purple">Cards parsed: {bulkResult.cardsParsed}</Tag>
              {bulkResult.errors?.length > 0 && (
                <Tag color="red">Errors: {bulkResult.errors.length}</Tag>
              )}
            </Space>
            <Table
              size="small"
              rowKey={(r, i) => `${r.fileName}-${i}`}
              dataSource={bulkResult.items || []}
              pagination={{ pageSize: 8 }}
              scroll={{ y: 240 }}
              columns={[
                { title: 'File', dataIndex: 'fileName' },
                { title: 'Ecode', dataIndex: 'ecode', width: 120, render: (v) => v || '—' },
                {
                  title: 'Status',
                  dataIndex: 'saved',
                  width: 100,
                  render: (v) => (v ? <Tag color="green">Saved</Tag> : <Tag color="orange">Skipped</Tag>),
                },
                { title: 'Note', dataIndex: 'error', render: (v) => v || '' },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
