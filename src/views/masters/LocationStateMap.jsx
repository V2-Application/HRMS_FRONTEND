import React, { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Upload,
  message,
  Space,
  Input,
  Select,
  Tooltip,
  Row,
  Col,
  Modal,
  Divider,
  Typography,
  Card,
} from 'antd'
import {
  UploadOutlined,
  ExportOutlined,
  DownloadOutlined,
  ReloadOutlined,
  InboxOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { useSelector } from 'react-redux'
import Pageheading from '../../components/shared/Pageheading'
import {
  getLocationStates,
  getStoreList,
  getStateList,
  updateStoreState,
  uploadStoreState,
  downloadStoreStateTemplate,
  exportStoreState,
} from '../../services/Services'

const { Search } = Input
const { Text } = Typography

// Store (STCode) -> State mapping (dbo.tblLocation.StateId). Pick an STCode + a State
// (names from tblState) and Update; the StateId is resolved from tblState. Plus uploader + export.
const LocationStateMap = () => {
  const { theme } = useSelector((state) => state.ui)
  const [rows, setRows] = useState([])
  const [stores, setStores] = useState([])
  const [states, setStates] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const [selStore, setSelStore] = useState(undefined)
  const [selState, setSelState] = useState(undefined)
  const [saving, setSaving] = useState(false)

  const [importOpen, setImportOpen] = useState(false)
  const [fileList, setFileList] = useState([])
  const [uploading, setUploading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getLocationStates(search)
      setRows(Array.isArray(res?.data) ? res.data : [])
    } catch (e) {
      message.error('Failed to load store-state mapping.')
    } finally {
      setLoading(false)
    }
  }

  const loadDropdowns = async () => {
    try {
      const [st, stt] = await Promise.all([getStoreList(), getStateList()])
      setStores(Array.isArray(st?.data) ? st.data : [])
      setStates(Array.isArray(stt?.data) ? stt.data : [])
    } catch (e) {
      // non-fatal
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  useEffect(() => {
    loadDropdowns()
  }, [])

  const handleUpdate = async () => {
    if (!selStore) return message.warning('Please select a Store Code.')
    if (selState == null) return message.warning('Please select a State.')
    setSaving(true)
    try {
      const res = await updateStoreState({ sTCode: selStore, stateId: selState })
      if (res?.status) {
        message.success(res.message || 'State updated.')
        load()
        loadDropdowns()
      } else {
        message.error(res?.message || 'Update failed.')
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Update failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const res = await downloadStoreStateTemplate()
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'StoreState_Template.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      message.error('Failed to download template.')
    }
  }

  const handleExport = async () => {
    if (!rows.length) return message.info('No data to export.')
    setExporting(true)
    try {
      const res = await exportStoreState(search)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      const today = new Date().toISOString().slice(0, 10)
      a.download = `StoreState_${today}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      message.error('Export failed.')
    } finally {
      setExporting(false)
    }
  }

  const doUpload = async (file) => {
    setUploading(true)
    try {
      const res = await uploadStoreState(file)
      if (res?.status) {
        message.success(res.message || 'Uploaded.')
        if (Array.isArray(res.errors) && res.errors.length) {
          message.warning(`${res.errors.length} row(s) skipped. First: ${res.errors[0]}`, 7)
          console.warn('Upload row errors:', res.errors)
        }
        setImportOpen(false)
        setFileList([])
        load()
        loadDropdowns()
      } else {
        message.error(res?.message || 'Upload failed.')
      }
    } catch (e) {
      message.error(e?.response?.data?.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmitUpload = () => {
    const file = fileList[0]?.originFileObj || fileList[0]
    if (!file) return message.warning('Please choose an Excel file first.')
    doUpload(file)
  }

  const closeImport = () => {
    if (uploading) return
    setImportOpen(false)
    setFileList([])
  }

  const columns = [
    { title: 'STCode', dataIndex: 'STCode', key: 'STCode', width: 140 },
    { title: 'Store Name', dataIndex: 'LocationName', key: 'LocationName', width: 260, ellipsis: true },
    {
      title: 'State',
      dataIndex: 'StateName',
      key: 'StateName',
      width: 200,
      render: (v) => v || <Text type="secondary">—</Text>,
    },
  ]
  const totalWidth = columns.reduce((s, c) => s + (c.width || 150), 0)

  return (
    <>
      <Pageheading title="Store State Mapping" />

      <div className="def" style={{ padding: 10 }}>
        {/* Update panel: STCode + State dropdowns */}
        <Card size="small" bordered className={theme === 'dark' ? 'dark-theme' : ''} style={{ marginBottom: 12 }}>
          <Row gutter={[12, 12]} align="bottom">
            <Col xs={24} md={8}>
              <Text strong>Store Code</Text>
              <Select
                showSearch
                allowClear
                value={selStore}
                onChange={setSelStore}
                placeholder="Select STCode"
                style={{ width: '100%', marginTop: 4 }}
                optionFilterProp="label"
                options={stores.map((s) => ({
                  value: s.STCode,
                  label: s.LocationName ? `${s.STCode} — ${s.LocationName}` : s.STCode,
                }))}
              />
            </Col>
            <Col xs={24} md={8}>
              <Text strong>State</Text>
              <Select
                showSearch
                allowClear
                value={selState}
                onChange={setSelState}
                placeholder="Select State"
                style={{ width: '100%', marginTop: 4 }}
                optionFilterProp="label"
                options={states.map((s) => ({ value: s.StateId, label: s.StateName }))}
              />
            </Col>
            <Col xs={24} md={8}>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleUpdate}
                disabled={!selStore || selState == null}
              >
                Update State
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Toolbar */}
        <div style={{ padding: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <div
              style={{ border: '2px solid #ccc', padding: 3, borderRadius: 10, display: 'flex', justifyContent: 'center' }}
              className={theme === 'dark' ? 'dark-theme' : ''}
            >
              <span style={{ fontSize: 12, padding: '0 8px' }}>{rows.length.toLocaleString()} Stores</span>
            </div>
          </Space>
          <Row>
            <Col>
              <Tooltip title="Refresh">
                <Button style={{ marginLeft: 5 }} onClick={load}>
                  <ReloadOutlined />
                </Button>
              </Tooltip>
              <Tooltip title="Upload Store-State">
                <Button style={{ marginLeft: 5 }} onClick={() => setImportOpen(true)}>
                  <UploadOutlined />
                </Button>
              </Tooltip>
              <Tooltip title="Export">
                <Button style={{ marginLeft: 5 }} loading={exporting} onClick={handleExport}>
                  <ExportOutlined />
                </Button>
              </Tooltip>
            </Col>
            <Search
              placeholder="Search STCode / store / state..."
              allowClear
              onChange={(e) => setSearch(e.target.value.trim())}
              style={{ width: 280, marginLeft: 5 }}
            />
          </Row>
        </div>

        <Table
          rowKey={(r) => r.LocationId ?? r.STCode}
          columns={columns}
          dataSource={rows}
          loading={loading}
          bordered
          size="small"
          pagination={{ pageSize: 50, showSizeChanger: true, pageSizeOptions: ['20', '50', '100'], showTotal: (t) => `${t} stores` }}
          scroll={{ x: totalWidth, y: 'calc(100vh - 300px)' }}
          className={theme === 'dark' ? 'dark-theme' : ''}
        />
      </div>

      {/* Import modal */}
      <Modal
        title={
          <Space>
            <UploadOutlined style={{ color: '#1d3557' }} />
            Import Store-State Mapping
          </Space>
        }
        open={importOpen}
        onCancel={closeImport}
        maskClosable={!uploading}
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={closeImport} disabled={uploading}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<UploadOutlined />}
            loading={uploading}
            disabled={fileList.length === 0}
            onClick={handleSubmitUpload}
          >
            {uploading ? 'Uploading…' : 'Submit'}
          </Button>,
        ]}
      >
        <Text type="secondary" style={{ display: 'block' }}>
          <b>Step 1:</b> Download the template — columns <b>STCode</b> and <b>StateName</b> (state
          must exist in the state master).
        </Text>
        <div style={{ margin: '10px 0' }}>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate} block>
            Download Template
          </Button>
        </div>
        <Divider style={{ margin: '10px 0' }} />
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
          <b>Step 2:</b> Choose your file, then click <b>Submit</b>. Each row updates that store's
          state (matched by STCode) — nothing is deleted.
        </Text>
        <Upload.Dragger
          accept=".xlsx,.xls"
          multiple={false}
          maxCount={1}
          fileList={fileList}
          disabled={uploading}
          beforeUpload={(file) => {
            setFileList([file])
            return false
          }}
          onRemove={() => setFileList([])}
        >
          <p className="ant-upload-drag-icon" style={{ margin: 0 }}>
            <InboxOutlined style={{ color: '#1d3557' }} />
          </p>
          <p className="ant-upload-text" style={{ margin: '4px 0 0' }}>
            Click or drag the Excel file here
          </p>
          <p className="ant-upload-hint" style={{ margin: 0 }}>
            .xlsx or .xls
          </p>
        </Upload.Dragger>
      </Modal>
    </>
  )
}

export default LocationStateMap
