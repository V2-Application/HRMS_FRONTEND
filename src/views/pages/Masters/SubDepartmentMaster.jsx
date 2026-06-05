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
  Select,
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
  getAllDepartments,
  getSubDepartments,
  toggleSubDepartmentActive,
  uploadSubDepartmentsExcel,
  upsertSubDepartment,
} from '../../../services/Services'

const { Paragraph, Text, Title } = Typography
const { useBreakpoint } = Grid

// Manage a 3-level sub-department hierarchy: Department -> L1 -> L2 -> L3.
// A cascading bar (Department / Sub-Dept 1 / Sub-Dept 2) picks the parent; the
// table below lists/manages that parent's children at the next level.
const SubDepartmentMaster = () => {
  const screens = useBreakpoint()
  const isMobile = !screens.md

  // ---- cascading context ----
  const [departments, setDepartments] = useState([])
  const [selectedDept, setSelectedDept] = useState(null)
  const [sub1List, setSub1List] = useState([])
  const [selectedSub1, setSelectedSub1] = useState(null)
  const [sub2List, setSub2List] = useState([])
  const [selectedSub2, setSelectedSub2] = useState(null)

  // Deepest selection determines the level/parent of the rows we manage.
  const currentLevel = selectedSub2 ? 3 : selectedSub1 ? 2 : 1
  const currentParentId = selectedSub2 ?? selectedSub1 ?? null

  // ---- table state ----
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [onlyInactive, setOnlyInactive] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // ---- edit modal ----
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  // ---- upload modal ----
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)
  const [uploading, setUploading] = useState(false)

  const norm = (res) => res?.data?.data ?? res?.data?.Data ?? []

  // Load departments for the first selector.
  useEffect(() => {
    ;(async () => {
      try {
        const res = await getAllDepartments({})
        setDepartments(Array.isArray(norm(res)) ? norm(res) : [])
      } catch (err) {
        message.error(err?.response?.data?.Message || err?.message || 'Failed to load departments')
      }
    })()
  }, [])

  // Load active level-1 children when a department is chosen (for the Sub-Dept 1 selector).
  const loadSub1 = useCallback(async (deptId) => {
    if (!deptId) {
      setSub1List([])
      return
    }
    try {
      const res = await getSubDepartments({ departmentId: deptId, depthLevel: 1 })
      setSub1List(Array.isArray(norm(res)) ? norm(res) : [])
    } catch {
      setSub1List([])
    }
  }, [])

  // Load active level-2 children under the chosen level-1 (for the Sub-Dept 2 selector).
  const loadSub2 = useCallback(async (deptId, sub1Id) => {
    if (!deptId || !sub1Id) {
      setSub2List([])
      return
    }
    try {
      const res = await getSubDepartments({
        departmentId: deptId,
        parentSubDepartmentId: sub1Id,
        depthLevel: 2,
      })
      setSub2List(Array.isArray(norm(res)) ? norm(res) : [])
    } catch {
      setSub2List([])
    }
  }, [])

  const fetchRows = useCallback(async () => {
    if (!selectedDept) {
      setRows([])
      return
    }
    setLoading(true)
    try {
      const res = await getSubDepartments({
        departmentId: selectedDept,
        parentSubDepartmentId: currentParentId,
        depthLevel: currentLevel,
        onlyInactive,
        searchTerm,
      })
      const list = norm(res)
      setRows(Array.isArray(list) ? list : [])
    } catch (err) {
      message.error(err?.response?.data?.Message || err?.message || 'Failed to load sub-departments')
    } finally {
      setLoading(false)
    }
  }, [selectedDept, currentParentId, currentLevel, onlyInactive, searchTerm])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  // Refresh the selector dropdown that matches the level we just mutated, so new
  // nodes become drillable immediately.
  const refreshSelectorsForCurrentLevel = () => {
    if (currentLevel === 1) loadSub1(selectedDept)
    else if (currentLevel === 2) loadSub2(selectedDept, selectedSub1)
  }

  const onDeptChange = (val) => {
    setSelectedDept(val ?? null)
    setSelectedSub1(null)
    setSelectedSub2(null)
    setSub2List([])
    loadSub1(val)
  }

  const onSub1Change = (val) => {
    setSelectedSub1(val ?? null)
    setSelectedSub2(null)
    loadSub2(selectedDept, val)
  }

  const onSub2Change = (val) => {
    setSelectedSub2(val ?? null)
  }

  const levelLabel = `Sub-Department (Level ${currentLevel})`

  const openCreate = () => {
    if (!selectedDept) {
      message.warning('Select a department first.')
      return
    }
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    form.setFieldsValue({
      subDepartmentName: row.subDepartmentName,
      subDepartmentCode: row.subDepartmentCode,
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
        SubDepartmentId: editing?.subDepartmentId ?? null,
        SubDepartmentName: (values.subDepartmentName || '').trim(),
        SubDepartmentCode: (values.subDepartmentCode || '').trim() || null,
        DepartmentId: selectedDept,
        ParentSubDepartmentId: currentParentId,
        DepthLevel: currentLevel,
      }
      const res = await upsertSubDepartment(payload)
      const ok = res?.data?.Status ?? res?.data?.status
      if (ok) {
        message.success(res?.data?.Message || (editing ? 'Sub-department updated' : 'Sub-department created'))
        closeModal()
        fetchRows()
        refreshSelectorsForCurrentLevel()
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
      const res = await toggleSubDepartmentActive({ Id: row.subDepartmentId, IsActive: nextActive })
      const ok = res?.data?.Status ?? res?.data?.status
      if (ok) {
        message.success(res?.data?.Message || (nextActive ? 'Activated' : 'Deactivated'))
        fetchRows()
        refreshSelectorsForCurrentLevel()
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
        dataIndex: 'subDepartmentId',
        key: 'subDepartmentId',
        width: 90,
        sorter: (a, b) => (a.subDepartmentId ?? 0) - (b.subDepartmentId ?? 0),
      },
      {
        title: 'Sub-Department Name',
        dataIndex: 'subDepartmentName',
        key: 'subDepartmentName',
        sorter: (a, b) => (a.subDepartmentName ?? '').localeCompare(b.subDepartmentName ?? ''),
      },
      {
        title: 'Code',
        dataIndex: 'subDepartmentCode',
        key: 'subDepartmentCode',
        width: 120,
        render: (v) => v || '-',
      },
      {
        title: 'Status',
        dataIndex: 'isActive',
        key: 'isActive',
        width: 110,
        render: (v) => (v ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>),
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 140,
        render: (_, row) => {
          const active = row.isActive
          return (
            <Space>
              <Tooltip title="Edit">
                <Button icon={<EditOutlined />} onClick={() => openEdit(row)} size="small" />
              </Tooltip>
              <Popconfirm
                title={active ? 'Deactivate this sub-department?' : 'Activate this sub-department?'}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDept, currentParentId, currentLevel],
  )

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['DEPARTMENT NAME', 'SUB DEPT 1', 'SUB DEPT 2', 'SUB DEPT 3'],
      ['Finance', 'Accounts', 'Payables', 'Vendor Payments'],
      ['Finance', 'Accounts', 'Receivables', ''],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'SubDepartments')
    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([out], { type: 'application/octet-stream' }), 'SubDepartments_Template.xlsx')
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
      const res = await uploadSubDepartmentsExcel(uploadFile)
      const data = res?.data
      setUploadResult({
        ok: data?.Status ?? data?.status,
        message: data?.Message ?? data?.message,
        detail: data?.Data ?? data?.data,
      })
      if (data?.Status ?? data?.status) {
        message.success(data?.Message || 'Upload complete')
        // Refresh whatever the user is currently viewing.
        if (selectedDept) loadSub1(selectedDept)
        if (selectedSub1) loadSub2(selectedDept, selectedSub1)
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
      {/* Cascading context bar */}
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col xs={24} md={8}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>Department</div>
          <Select
            allowClear
            showSearch
            style={{ width: '100%' }}
            placeholder="Select department"
            value={selectedDept}
            onChange={onDeptChange}
            optionFilterProp="children"
            filterOption={(input, option) =>
              String(option?.children || '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {departments.map((d) => (
              <Select.Option key={d.departmentId ?? d.DepartmentId} value={d.departmentId ?? d.DepartmentId}>
                {d.departmentName ?? d.DepartmentName}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} md={8}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>Sub-Department 1</div>
          <Select
            allowClear
            showSearch
            style={{ width: '100%' }}
            placeholder={selectedDept ? 'Drill into a level-1 sub-department' : 'Select a department first'}
            value={selectedSub1}
            onChange={onSub1Change}
            disabled={!selectedDept}
            optionFilterProp="children"
            filterOption={(input, option) =>
              String(option?.children || '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {sub1List.map((s) => (
              <Select.Option key={s.subDepartmentId} value={s.subDepartmentId}>
                {s.subDepartmentName}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} md={8}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>Sub-Department 2</div>
          <Select
            allowClear
            showSearch
            style={{ width: '100%' }}
            placeholder={selectedSub1 ? 'Drill into a level-2 sub-department' : 'Select Sub-Department 1 first'}
            value={selectedSub2}
            onChange={onSub2Change}
            disabled={!selectedSub1}
            optionFilterProp="children"
            filterOption={(input, option) =>
              String(option?.children || '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {sub2List.map((s) => (
              <Select.Option key={s.subDepartmentId} value={s.subDepartmentId}>
                {s.subDepartmentName}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>

      {selectedDept && (
        <Paragraph type="secondary" style={{ marginBottom: 8 }}>
          Managing <Text strong>{levelLabel}</Text> under:{' '}
          {departments.find((d) => (d.departmentId ?? d.DepartmentId) === selectedDept)?.departmentName ||
            departments.find((d) => (d.departmentId ?? d.DepartmentId) === selectedDept)?.DepartmentName}
          {selectedSub1 && ` ▸ ${sub1List.find((s) => s.subDepartmentId === selectedSub1)?.subDepartmentName || ''}`}
          {selectedSub2 && ` ▸ ${sub2List.find((s) => s.subDepartmentId === selectedSub2)?.subDepartmentName || ''}`}
        </Paragraph>
      )}

      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
        <Space wrap>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search name or code"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 260 }}
            disabled={!selectedDept}
          />
          <span>
            Show deactivated only&nbsp;
            <Switch checked={onlyInactive} onChange={setOnlyInactive} size="small" disabled={!selectedDept} />
          </span>
        </Space>
        <Space wrap>
          <Button icon={<UploadOutlined />} onClick={openUpload}>
            Bulk Upload
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate} disabled={!selectedDept}>
            Add {levelLabel}
          </Button>
        </Space>
      </Space>

      <Table
        rowKey={(r) => r.subDepartmentId}
        loading={loading}
        columns={columns}
        dataSource={rows}
        locale={{ emptyText: selectedDept ? 'No sub-departments at this level' : 'Select a department to begin' }}
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
        title={editing ? `Edit ${levelLabel}` : `Add ${levelLabel}`}
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        confirmLoading={submitting}
        okText={editing ? 'Update' : 'Create'}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            label="Sub-Department Name"
            name="subDepartmentName"
            rules={[{ required: true, message: 'Sub-department name is required' }, { max: 200 }]}
          >
            <Input maxLength={200} placeholder="e.g. Accounts" />
          </Form.Item>
          <Form.Item label="Code (optional)" name="subDepartmentCode" rules={[{ max: 10 }]}>
            <Input maxLength={10} placeholder="e.g. ACC" />
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
              Bulk Upload Sub-Departments
            </Title>
            <Paragraph style={{ margin: 0, fontSize: 12 }}>
              Each row defines a full chain: Department ▸ Sub Dept 1 ▸ 2 ▸ 3.
            </Paragraph>
          </div>
        }
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <Button icon={<DownloadOutlined />} type="primary" block={isMobile} onClick={downloadTemplate}>
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
              <Button type="primary" loading={uploading} onClick={handleUpload} disabled={!uploadFile} block={isMobile}>
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Text strong>Note:</Text>
            <Paragraph style={{ marginBottom: 6 }}>1. Only .xlsx files are supported.</Paragraph>
            <Paragraph style={{ marginBottom: 6 }}>
              2. The Department must already exist; missing departments are skipped.
            </Paragraph>
            <Paragraph style={{ marginBottom: 16 }}>
              3. Leave Sub Dept 2 / 3 blank to create a shorter chain.
            </Paragraph>
            <Text strong>Required Columns:</Text>
            <Paragraph style={{ marginBottom: 0, marginTop: 6 }}>
              DEPARTMENT NAME, SUB DEPT 1, SUB DEPT 2, SUB DEPT 3
            </Paragraph>
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

export default SubDepartmentMaster
