import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Col,
  Form,
  Grid,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from 'antd'
import {
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import {
  getAllDesignations,
  toggleDesignationActive,
  uploadDesignationsExcel,
  upsertDesignation,
} from '../../../services/Services'

const { Paragraph, Text, Title } = Typography
const { useBreakpoint } = Grid

const DesignationMaster = () => {
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [onlyInactive, setOnlyInactive] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)
  const [uploading, setUploading] = useState(false)

  const fetchRows = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAllDesignations({ onlyInactive, searchTerm })
      const list = res?.data?.data ?? res?.data?.Data ?? []
      setRows(Array.isArray(list) ? list : [])
    } catch (err) {
      message.error(err?.response?.data?.Message || err?.message || 'Failed to load designations')
    } finally {
      setLoading(false)
    }
  }, [onlyInactive, searchTerm])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    form.setFieldsValue({
      designationName: row.designationName ?? row.DesignationName,
      designationCode: row.designationCode ?? row.DesignationCode,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    form.resetFields()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      const payload = {
        DesignationId: editing?.designationId ?? editing?.DesignationId ?? null,
        DesignationName: (values.designationName || '').trim(),
      }
      const res = await upsertDesignation(payload)
      const ok = res?.data?.Status ?? res?.data?.status
      if (ok) {
        message.success(res?.data?.Message || (editing ? 'Designation updated' : 'Designation created'))
        closeModal()
        fetchRows()
      } else {
        message.error(res?.data?.Message || 'Failed')
      }
    } catch (err) {
      if (err?.errorFields) return
      message.error(err?.response?.data?.Message || err?.message || 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (row, nextActive) => {
    try {
      const res = await toggleDesignationActive({
        Id: row.designationId ?? row.DesignationId,
        IsActive: nextActive,
      })
      const ok = res?.data?.Status ?? res?.data?.status
      if (ok) {
        message.success(res?.data?.Message || (nextActive ? 'Activated' : 'Deactivated'))
        fetchRows()
      } else {
        message.error(res?.data?.Message || 'Failed')
      }
    } catch (err) {
      message.error(err?.response?.data?.Message || err?.message || 'Failed')
    }
  }

  const columns = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'designationId',
        key: 'designationId',
        width: 90,
        render: (v, r) => v ?? r.DesignationId,
        sorter: (a, b) =>
          (a.designationId ?? a.DesignationId ?? 0) - (b.designationId ?? b.DesignationId ?? 0),
      },
      {
        title: 'Designation Name',
        dataIndex: 'designationName',
        key: 'designationName',
        render: (v, r) => v ?? r.DesignationName,
        sorter: (a, b) =>
          (a.designationName ?? a.DesignationName ?? '').localeCompare(
            b.designationName ?? b.DesignationName ?? '',
          ),
      },
      {
        title: 'Status',
        dataIndex: 'isActive',
        key: 'isActive',
        render: (v, r) => {
          const active = v ?? r.IsActive
          return active ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>
        },
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, row) => {
          const active = row.isActive ?? row.IsActive
          return (
            <Space>
              <Tooltip title="Edit">
                <Button icon={<EditOutlined />} onClick={() => openEdit(row)} size="small" />
              </Tooltip>
              <Popconfirm
                title={active ? 'Deactivate this designation?' : 'Activate this designation?'}
                onConfirm={() => handleToggle(row, !active)}
                okText="Yes"
                cancelText="No"
              >
                <Switch checked={active} size="small" />
              </Popconfirm>
            </Space>
          )
        },
      },
    ],
    [],
  )

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['DESIGNATION NAME'],
      ['Store Manager'],
      ['Cashier'],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Designations')
    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([out], { type: 'application/octet-stream' }), 'Designations_Template.xlsx')
  }

  const openUpload = () => {
    setUploadFile(null)
    setUploadResult(null)
    setUploadModalOpen(true)
  }

  const closeUpload = () => {
    setUploadModalOpen(false)
    setUploadFile(null)
    setUploadResult(null)
  }

  const handleUpload = async () => {
    if (!uploadFile) {
      message.warning('Pick an .xlsx file first.')
      return
    }
    try {
      setUploading(true)
      const res = await uploadDesignationsExcel(uploadFile)
      const data = res?.data
      setUploadResult({
        ok: data?.Status ?? data?.status,
        message: data?.Message ?? data?.message,
        detail: data?.Data ?? data?.data,
      })
      if (data?.Status ?? data?.status) {
        message.success(data?.Message || 'Upload complete')
        fetchRows()
      } else {
        message.error(data?.Message || 'Upload failed')
      }
    } catch (err) {
      const msg = err?.response?.data?.Message || err?.message || 'Upload failed'
      setUploadResult({ ok: false, message: msg })
      message.error(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
        <Space wrap>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search name or code"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 260 }}
          />
          <span>
            Show deactivated only&nbsp;
            <Switch checked={onlyInactive} onChange={setOnlyInactive} size="small" />
          </span>
        </Space>
        <Space wrap>
          <Button icon={<UploadOutlined />} onClick={openUpload}>
            Bulk Upload
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Add Designation
          </Button>
        </Space>
      </Space>

      <Table
        rowKey={(r) => r.designationId ?? r.DesignationId}
        loading={loading}
        columns={columns}
        dataSource={rows}
        pagination={{
          defaultPageSize: 25,
          pageSizeOptions: ['10', '25', '50', '100', '200'],
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
          position: ['bottomRight'],
        }}
        size="small"
      />

      <Modal
        title={editing ? 'Edit Designation' : 'Add Designation'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText={editing ? 'Update' : 'Create'}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            label="Designation Name"
            name="designationName"
            rules={[{ required: true, message: 'Designation name is required' }, { max: 200 }]}
          >
            <Input maxLength={200} placeholder="e.g. Store Manager" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={uploadModalOpen}
        onCancel={closeUpload}
        footer={null}
        centered
        width={isMobile ? '100%' : 700}
        destroyOnClose
        maskClosable={!uploading}
        title={
          <div style={{ textAlign: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>
              Bulk Upload
            </Title>
            <Paragraph style={{ margin: 0, fontSize: 12 }}>
              Upload Excel Sheet at once using this feature.
            </Paragraph>
          </div>
        }
      >
        <Row gutter={[24, 16]}>
          {/* Left column */}
          <Col xs={24} md={12}>
            <Button
              icon={<DownloadOutlined />}
              type="primary"
              block={isMobile}
              onClick={downloadTemplate}
            >
              Download Sample Sheet
            </Button>

            <Paragraph type="secondary" style={{ fontSize: 14, marginTop: 8 }}>
              * Download, fill out, then upload the sample Excel file.
            </Paragraph>

            <Upload
              multiple={false}
              accept=".xlsx,.xls"
              beforeUpload={(file) => {
                setUploadFile(file)
                return false
              }}
              fileList={uploadFile ? [{ uid: '-1', name: uploadFile.name, status: 'done' }] : []}
              onRemove={() => setUploadFile(null)}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />} block={isMobile}>
                Choose File
              </Button>
            </Upload>

            <div style={{ marginTop: 16 }}>
              <Button
                type="primary"
                loading={uploading}
                onClick={handleUpload}
                disabled={!uploadFile}
                block={isMobile}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </Col>

          {/* Right column */}
          <Col xs={24} md={12}>
            <Text strong>Note:</Text>
            <Paragraph style={{ marginBottom: 6 }}>1. Only .xlsx files are supported.</Paragraph>
            <Paragraph style={{ marginBottom: 6 }}>2. Download the sample sheet above.</Paragraph>
            <Paragraph style={{ marginBottom: 16 }}>
              3. Fill out the downloaded sheet and then upload it here.
            </Paragraph>

            <Text strong>Required Columns in Excel:</Text>
            <Paragraph style={{ marginBottom: 0, marginTop: 6 }}>1. DESIGNATION NAME</Paragraph>
          </Col>
        </Row>

        {uploadResult && (
          <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
            <Tag color={uploadResult.ok ? 'green' : 'red'}>{uploadResult.message}</Tag>
            {uploadResult.detail?.errors?.length > 0 && (
              <ul style={{ maxHeight: 160, overflowY: 'auto', marginTop: 8, fontSize: 12 }}>
                {uploadResult.detail.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default DesignationMaster
