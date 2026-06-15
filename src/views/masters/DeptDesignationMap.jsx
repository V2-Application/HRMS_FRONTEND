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
} from 'antd'
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  InboxOutlined,
  ApartmentOutlined,
  ClusterOutlined,
  IdcardOutlined,
  FileExcelOutlined,
} from '@ant-design/icons'
import {
  getDeptDesignationMappings,
  uploadDeptDesignationMap,
  downloadDeptDesignationMapTemplate,
  deleteDeptDesignationMap,
  exportDeptDesignationMap,
} from '../../services/Services'

const { Title, Text } = Typography

// Manage the Department + Sub-Department(1/2/3) -> Designation mapping that drives the designation dropdown.
const DeptDesignationMap = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [importOpen, setImportOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getDeptDesignationMappings()
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
      const res = await downloadDeptDesignationMapTemplate()
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'DeptDesignationMap_Template.xlsx'
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
      const res = await exportDeptDesignationMap()
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      const today = new Date().toISOString().slice(0, 10)
      a.download = `DeptDesignationMap_${today}.xlsx`
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
      const res = await uploadDeptDesignationMap(file)
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

  const handleDelete = async (id) => {
    try {
      const res = await deleteDeptDesignationMap(id)
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
    const depts = new Set()
    const desigs = new Set()
    rows.forEach((r) => {
      if (r.DepartmentName) depts.add(r.DepartmentName)
      if (r.DesignationName) desigs.add(r.DesignationName)
    })
    return { total: rows.length, depts: depts.size, desigs: desigs.size }
  }, [rows])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      [r.DepartmentName, r.SubDepartment1, r.SubDepartment2, r.SubDepartment3, r.DesignationName]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    )
  }, [rows, search])

  const dash = (v) =>
    v === null || v === undefined || v === '' ? <Text type="secondary">—</Text> : v

  const columns = [
    {
      title: 'Department',
      dataIndex: 'DepartmentName',
      key: 'dept',
      render: (v) => <Text strong>{v || '—'}</Text>,
      sorter: (a, b) => String(a.DepartmentName || '').localeCompare(String(b.DepartmentName || '')),
    },
    { title: 'Sub-Dept 1', dataIndex: 'SubDepartment1', key: 's1', render: dash },
    { title: 'Sub-Dept 2', dataIndex: 'SubDepartment2', key: 's2', render: dash },
    { title: 'Sub-Dept 3', dataIndex: 'SubDepartment3', key: 's3', render: dash },
    {
      title: 'Designation',
      dataIndex: 'DesignationName',
      key: 'desig',
      render: (v) => (v ? <Tag color="geekblue">{v}</Tag> : dash(v)),
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
      width: 80,
      render: (_, r) => (
        <Popconfirm title="Remove this mapping?" okText="Remove" onConfirm={() => handleDelete(r.Id)}>
          <Button danger type="text" size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
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
          background: 'linear-gradient(120deg, #6a11cb 0%, #2575fc 100%)',
          color: '#fff',
          boxShadow: '0 6px 18px rgba(37,117,252,0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Title level={3} style={{ color: '#fff', margin: 0 }}>
            <ApartmentOutlined style={{ marginRight: 10 }} />
            Designation Mapping
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.88)' }}>
            Map <b>Department + Sub‑Department (1/2/3)</b> to valid <b>Designations</b> — drives the
            Designation dropdown on the candidate / employee form.
          </Text>
        </div>
        <Button
          size="large"
          icon={<UploadOutlined />}
          onClick={() => setImportOpen(true)}
          style={{ fontWeight: 600 }}
        >
          Import Mappings
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>{statCard('Total Mappings', stats.total, <ClusterOutlined />, 'linear-gradient(135deg,#2575fc,#6a11cb)')}</Col>
        <Col xs={24} sm={8}>{statCard('Departments Covered', stats.depts, <ApartmentOutlined />, 'linear-gradient(135deg,#11998e,#38ef7d)')}</Col>
        <Col xs={24} sm={8}>{statCard('Designations Mapped', stats.desigs, <IdcardOutlined />, 'linear-gradient(135deg,#f7971e,#ffd200)')}</Col>
      </Row>

      {/* Grid (full width) */}
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
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 220 }}
            />
            <Button icon={<ReloadOutlined />} onClick={load} />
            <Button icon={<FileExcelOutlined />} onClick={handleExport}>
              Export
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
          locale={{ emptyText: <Empty description="No mappings yet — click Import to get started" /> }}
          pagination={{ pageSize: 25, showSizeChanger: true, size: 'small' }}
          rowClassName={(_, i) => (i % 2 ? 'ddm-row-alt' : '')}
        />
      </Card>

      {/* Import modal */}
      <Modal
        title={
          <Space>
            <UploadOutlined style={{ color: '#2575fc' }} />
            Import Designation Mappings
          </Space>
        }
        open={importOpen}
        onCancel={() => !uploading && setImportOpen(false)}
        footer={null}
        maskClosable={!uploading}
        destroyOnClose
      >
        <Text type="secondary">
          <b>Step 1:</b> Download the template and fill in the Department, Sub‑Department (levels 1/2/3)
          and Designation <b>names</b>.
        </Text>
        <div style={{ margin: '14px 0' }}>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate} block>
            Download Template
          </Button>
        </div>
        <Divider style={{ margin: '12px 0' }} />
        <Text type="secondary">
          <b>Step 2:</b> Click or drag your filled Excel file below to import.
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
              <InboxOutlined style={{ color: '#2575fc' }} />
            </p>
            <p className="ant-upload-text">
              {uploading ? 'Uploading…' : 'Click or drag the Excel file here'}
            </p>
            <p className="ant-upload-hint" style={{ marginBottom: 0 }}>
              .xlsx / .xls — duplicates are skipped, invalid rows reported.
            </p>
          </Upload.Dragger>
        </div>
      </Modal>

      <style>{`
        .ddm-row-alt td { background: #fafcff; }
        .ant-upload-drag { border-radius: 12px !important; }
      `}</style>
    </div>
  )
}

export default DeptDesignationMap
