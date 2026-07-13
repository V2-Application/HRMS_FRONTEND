import React, { useEffect, useMemo, useState } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Upload,
  message,
  Space,
  Popconfirm,
  Tag,
  Input,
  Typography,
  Empty,
  Modal,
  Divider,
  Form,
} from 'antd'
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  InboxOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  ClusterOutlined,
  FileExcelOutlined,
} from '@ant-design/icons'
import {
  getBiomaxAttendanceLocationMappings,
  uploadBiomaxAttendanceLocationMap,
  addBiomaxAttendanceLocationMap,
  updateBiomaxAttendanceLocationMap,
  deleteBiomaxAttendanceLocationMap,
  downloadBiomaxAttendanceLocationMapTemplate,
  exportBiomaxAttendanceLocationMap,
} from '../../services/Services'

const { Title, Text } = Typography

// Manage the Biomax attendance DEVICE LOCATION -> store ST-CODE mapping.
const BiomaxAttendanceLocationMap = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [importOpen, setImportOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState(null) // null = add, object = edit
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [form] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      const res = await getBiomaxAttendanceLocationMappings()
      setRows(Array.isArray(res?.data) ? res.data : [])
    } catch (e) {
      console.error(e)
      message.error('Failed to load mappings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDownloadTemplate = async () => {
    try {
      const res = await downloadBiomaxAttendanceLocationMapTemplate()
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'BiomaxAttendanceLocationMap_Template.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      message.error('Failed to download template.')
    }
  }

  const handleExport = async () => {
    if (!rows.length) {
      message.info('No mappings to export yet.')
      return
    }
    try {
      const res = await exportBiomaxAttendanceLocationMap()
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      const today = new Date().toISOString().slice(0, 10)
      a.download = `BiomaxAttendanceLocationMap_${today}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      message.error('Export failed.')
    }
  }

  const doUpload = async (file) => {
    setUploading(true)
    try {
      const res = await uploadBiomaxAttendanceLocationMap(file)
      if (res?.status) {
        message.success(res.message || 'Uploaded.')
        if (Array.isArray(res.errors) && res.errors.length) {
          message.warning(`${res.errors.length} row(s) skipped. First: ${res.errors[0]}`, 7)
          console.warn('Upload row errors:', res.errors)
        }
        setImportOpen(false)
        load()
      } else {
        message.error(res?.message || 'Upload failed.')
      }
    } catch (e) {
      message.error('Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const openAdd = () => {
    setEditing(null)
    form.resetFields()
    setEditOpen(true)
  }

  const openEdit = (record) => {
    setEditing(record)
    form.setFieldsValue({ DeviceLocation: record.DeviceLocation, STCode: record.STCode })
    setEditOpen(true)
  }

  const submitEdit = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      const payload = {
        DeviceLocation: (values.DeviceLocation || '').trim(),
        STCode: (values.STCode || '').trim(),
      }
      const res = editing
        ? await updateBiomaxAttendanceLocationMap({ ...payload, Id: editing.Id })
        : await addBiomaxAttendanceLocationMap(payload)
      if (res?.status) {
        message.success(res.message || 'Saved.')
        setEditOpen(false)
        load()
      } else {
        message.error(res?.message || 'Save failed.')
      }
    } catch (e) {
      if (e?.errorFields) return // validation error
      message.error('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await deleteBiomaxAttendanceLocationMap(id)
      if (res?.status) {
        message.success('Mapping removed.')
        load()
      } else {
        message.error(res?.message || 'Delete failed.')
      }
    } catch (e) {
      message.error('Delete failed.')
    }
  }

  // ---- derived ----
  const stats = useMemo(() => {
    const devices = new Set()
    const stores = new Set()
    rows.forEach((r) => {
      if (r.DeviceLocation) devices.add(r.DeviceLocation)
      if (r.STCode) stores.add(r.STCode)
    })
    return { total: rows.length, devices: devices.size, stores: stores.size }
  }, [rows])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      [r.DeviceLocation, r.STCode].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)),
    )
  }, [rows, search])

  const columns = [
    {
      title: 'Device Location',
      dataIndex: 'DeviceLocation',
      key: 'device',
      render: (v) => <Text strong>{v || '—'}</Text>,
      sorter: (a, b) =>
        String(a.DeviceLocation || '').localeCompare(String(b.DeviceLocation || '')),
    },
    {
      title: 'ST Code',
      dataIndex: 'STCode',
      key: 'stcode',
      render: (v) => (v ? <Tag color="geekblue">{v}</Tag> : <Text type="secondary">—</Text>),
      sorter: (a, b) => String(a.STCode || '').localeCompare(String(b.STCode || '')),
    },
    {
      title: 'Status',
      dataIndex: 'IsActive',
      key: 'active',
      width: 100,
      render: (v) => (v ? <Tag color="green">Active</Tag> : <Tag color="default">Inactive</Tag>),
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_, r) => (
        <Space size={4}>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
          <Popconfirm
            title="Remove this mapping?"
            okText="Remove"
            onConfirm={() => handleDelete(r.Id)}
          >
            <Button danger type="text" size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const statCard = (title, value, icon, color) => (
    <Card
      bordered={false}
      style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      bodyStyle={{ padding: 16 }}
    >
      <Space size="middle">
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 10,
            display: 'grid',
            placeItems: 'center',
            fontSize: 22,
            color: '#fff',
            background: color,
          }}
        >
          {icon}
        </div>
        <Statistic title={title} value={value} />
      </Space>
    </Card>
  )

  return (
    <div style={{ padding: 4 }}>
      {/* Header banner */}
      <div
        style={{
          borderRadius: 14,
          padding: '20px 26px',
          marginBottom: 18,
          background: 'linear-gradient(120deg, #0f2027 0%, #2c5364 100%)',
          color: '#fff',
          boxShadow: '0 6px 18px rgba(44,83,100,0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Title level={3} style={{ color: '#fff', margin: 0 }}>
            <EnvironmentOutlined style={{ marginRight: 10 }} />
            Biomax Attendance Location Mapping
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.88)' }}>
            Map each biometric <b>Device Location</b> to its store <b>ST Code</b>. Upload the Biomax
            export or add / edit mappings manually.
          </Text>
        </div>
        <Space>
          <Button
            size="large"
            icon={<PlusOutlined />}
            onClick={openAdd}
            style={{ fontWeight: 600 }}
          >
            Add Mapping
          </Button>
          <Button
            size="large"
            icon={<UploadOutlined />}
            onClick={() => setImportOpen(true)}
            style={{ fontWeight: 600 }}
          >
            Import
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          {statCard(
            'Total Mappings',
            stats.total,
            <ClusterOutlined />,
            'linear-gradient(135deg,#2c5364,#203a43)',
          )}
        </Col>
        <Col xs={24} sm={8}>
          {statCard(
            'Device Locations',
            stats.devices,
            <EnvironmentOutlined />,
            'linear-gradient(135deg,#11998e,#38ef7d)',
          )}
        </Col>
        <Col xs={24} sm={8}>
          {statCard(
            'Stores (ST Codes)',
            stats.stores,
            <ShopOutlined />,
            'linear-gradient(135deg,#f7971e,#ffd200)',
          )}
        </Col>
      </Row>

      {/* Grid */}
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        title={
          <Space>
            <span>Existing Mappings</span>
            <Tag color="blue">{filtered.length}</Tag>
          </Space>
        }
        extra={
          <Space>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search device / ST code…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              style={{ width: 240 }}
            />
            <Button icon={<ReloadOutlined />} onClick={load} />
            <Button icon={<FileExcelOutlined />} onClick={handleExport}>
              Export
            </Button>
            <Button icon={<PlusOutlined />} onClick={openAdd}>
              Add
            </Button>
            <Button type="primary" icon={<UploadOutlined />} onClick={() => setImportOpen(true)}>
              Import
            </Button>
          </Space>
        }
      >
        <Table
          size="small"
          rowKey="Id"
          loading={loading}
          columns={columns}
          dataSource={filtered}
          scroll={{ x: 'max-content', y: 'calc(100vh - 380px)' }}
          locale={{
            emptyText: (
              <Empty description="No mappings yet — Add one or Import the Biomax export" />
            ),
          }}
          pagination={{
            current: page,
            pageSize,
            total: filtered.length,
            showSizeChanger: true,
            size: 'small',
            pageSizeOptions: ['10', '25', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps)
            },
            onShowSizeChange: (p, ps) => {
              setPage(1)
              setPageSize(ps)
            },
          }}
          rowClassName={(_, i) => (i % 2 ? 'balm-row-alt' : '')}
        />
      </Card>

      {/* Add / Edit modal */}
      <Modal
        title={
          <Space>
            {editing ? (
              <EditOutlined style={{ color: '#2c5364' }} />
            ) : (
              <PlusOutlined style={{ color: '#2c5364' }} />
            )}
            {editing ? 'Edit Mapping' : 'Add Mapping'}
          </Space>
        }
        open={editOpen}
        onCancel={() => !saving && setEditOpen(false)}
        onOk={submitEdit}
        confirmLoading={saving}
        okText={editing ? 'Update' : 'Add'}
        destroyOnClose
        maskClosable={!saving}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            label="Device Location"
            name="DeviceLocation"
            rules={[{ required: true, message: 'Device Location is required' }]}
          >
            <Input placeholder="e.g. Hub patna" prefix={<EnvironmentOutlined />} />
          </Form.Item>
          <Form.Item
            label="ST Code"
            name="STCode"
            rules={[{ required: true, message: 'ST Code is required' }]}
          >
            <Input placeholder="e.g. DB03" prefix={<ShopOutlined />} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Import modal */}
      <Modal
        title={
          <Space>
            <UploadOutlined style={{ color: '#2c5364' }} />
            Import Biomax Location Mappings
          </Space>
        }
        open={importOpen}
        onCancel={() => !uploading && setImportOpen(false)}
        footer={null}
        maskClosable={!uploading}
        destroyOnClose
      >
        <Text type="secondary">
          <b>Step 1:</b> Download the template, or use the raw Biomax export directly — it only
          needs a <b>Device Location</b> (or <b>Device Name</b>) column and a <b>ST Code</b> (
          <b>ST-CODE</b>) column; other columns are ignored.
        </Text>
        <div style={{ margin: '14px 0' }}>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate} block>
            Download Template
          </Button>
        </div>
        <Divider style={{ margin: '12px 0' }} />
        <Text type="secondary">
          <b>Step 2:</b> Click or drag your Excel file below to import. Existing device locations
          are updated; new ones are added.
        </Text>
        <div style={{ marginTop: 12 }}>
          <Upload.Dragger
            accept=".xlsx,.xls"
            multiple={false}
            showUploadList={false}
            disabled={uploading}
            beforeUpload={(file) => {
              doUpload(file)
              return false
            }}
          >
            <p className="ant-upload-drag-icon" style={{ marginBottom: 6 }}>
              <InboxOutlined style={{ color: '#2c5364' }} />
            </p>
            <p className="ant-upload-text">
              {uploading ? 'Uploading…' : 'Click or drag the Excel file here'}
            </p>
            <p className="ant-upload-hint" style={{ marginBottom: 0 }}>
              .xlsx / .xls — device locations are upserted by name.
            </p>
          </Upload.Dragger>
        </div>
      </Modal>

      <style>{`
        .balm-row-alt td { background: #f7fbfc; }
        .ant-upload-drag { border-radius: 12px !important; }
      `}</style>
    </div>
  )
}

export default BiomaxAttendanceLocationMap
