/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Card, Row, Col, Form, Select, DatePicker, InputNumber, Input, Upload,
  Button, Space, message, Spin, Modal
} from 'antd'
import { UploadOutlined, InboxOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useDispatch, useSelector } from 'react-redux'
import Pageheading from '../../shared/Pageheading'
import { set as setUi } from '../../../redux/uiSlice'
import {
  searchEmployees, createIncentive, getIncentive, submitIncentive, uploadIncentivesBulk
} from '../../../services/Services'
import { useNavigate, useLocation } from 'react-router-dom'

const { TextArea } = Input
const { MonthPicker } = DatePicker
const { Dragger } = Upload

const MAX_FILES = 5

const CreateIncentive = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const editId = location.state?.editId || null

  const { theme } = useSelector((s) => s.ui)
  const { data: auth } = useSelector((s) => s.auth)

  const [form] = Form.useForm()
  const [empOptions, setEmpOptions] = useState([])
  const [fetching, setFetching] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const timerRef = useRef(null)

  // Upload state
  const [fileList, setFileList] = useState([])
  const [removedExistingIds, setRemovedExistingIds] = useState(new Set())

  const [loadingDetails, setLoadingDetails] = useState(false)

  // ======= BULK UPLOAD MODAL STATE =======
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkFile, setBulkFile] = useState(null)
  const [bulkUploading, setBulkUploading] = useState(false)

  const FILE_BASE_URL = import.meta.env.VITE_API_URL

  const reset = () => {
    form.resetFields()
    setFileList([])
    setRemovedExistingIds(new Set())
  }

  // ---- Employee Search ----
  const fetchOptions = async (q = '') => {
    setFetching(true)
    try {
      const res = await searchEmployees({ searchTerm: q })
      const list = Array.isArray(res?.employees) ? res.employees : []
      setEmpOptions(
        list.map((e) => ({
          value: e.ecode,
          label: `${e.ecode} - ${e.fullName ?? e.name ?? 'Employee'}`,
          data: e,
        })),
      )
    } finally {
      setFetching(false)
    }
  }

  const onSearch = (q) => {
    setSearchTerm(q)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => fetchOptions(q), 300)
  }

  const mergedOptions = useMemo(() => {
    const ecode = form.getFieldValue('ecode')
    if (!ecode) return empOptions
    const hasSelected = empOptions.some((o) => o.value === ecode)
    if (hasSelected) return empOptions
    return [{ value: ecode, label: String(ecode), data: null }, ...empOptions]
  }, [empOptions, form])

  useEffect(() => {
    fetchOptions('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Edit mode: load record and prefill (including existing attachments) ----
  useEffect(() => {
    const load = async () => {
      if (!editId) return
      try {
        setLoadingDetails(true)
        const rec = await getIncentive(editId)

        if (rec?.ecode && !empOptions.some((o) => o.value === rec.ecode)) {
          setEmpOptions((prev) => [
            { value: rec.ecode, label: `${rec.ecode} - ${rec.empName || 'Employee'}`, data: null },
            ...prev,
          ])
        }

        form.setFieldsValue({
          ecode: rec.ecode,
          month: rec.month ? dayjs(rec.month) : dayjs(),
          amount: rec.amount,
          remarks: rec.remarks || '',
        })

        const existingFiles = Array.isArray(rec.attachments)
          ? rec.attachments.map((a, idx) => {
              const existingId = a.id ?? a.attachmentId ?? a.fileId
              const safeUid =
                existingId != null
                  ? `ex-${existingId}`
                  : `ex-${idx}-${Date.now()}-${Math.random().toString(36).slice(2)}`
              return {
                uid: safeUid,
                name: a.name || `Attachment-${existingId ?? idx + 1}`,
                status: 'done',
                url: `${FILE_BASE_URL}${a.filePath}`,
                isExisting: true,
                existingId,
              }
            })
          : []

        setFileList(existingFiles)
        setRemovedExistingIds(new Set())
      } catch {
        message.error('Failed to load incentive')
      } finally {
        setLoadingDetails(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId])

  const disabledMonth = (current) => {
    const currentMonth = dayjs().startOf('month')
    const lastMonth = dayjs().subtract(1, 'month').startOf('month')
    return current && (current < lastMonth.startOf('month') || current > currentMonth.endOf('month'))
  }

  // ---- Save (create/update) ----
  const save = async (values, { autoSubmit = false } = {}) => {
    try {
      dispatch(setUi({ loading: true }))

      const formData = new FormData()
      formData.append('ecode', values.ecode)
      const firstOfMonth = dayjs(values.month).startOf('month').format('YYYY-MM-DD')
      formData.append('month', firstOfMonth)
      formData.append('amount', String(values.amount))
      formData.append('remarks', values.remarks || '')
      formData.append('createdBy', auth?.ecode || '')

      if (editId) formData.append('incentiveId', String(editId))

      // Send all files currently in list (existing re-uploaded as new is fine if your API accepts)
      fileList.forEach((f) => {
        const file = f.originFileObj || f
        if (file instanceof File) {
          formData.append('attachments', file, file.name || 'attachment')
        }
      })

      const res = await createIncentive(formData)

      if (res?.incentiveId) {
        message.success(editId ? 'Incentive updated' : 'Incentive created')

        if (autoSubmit) {
          const submitRes = await submitIncentive(res.incentiveId)
          if (submitRes?.success) message.success('Submitted for approval')
          else message.warning('Saved, but submit failed')
        }

        reset()
        setTimeout(() => navigate('/incentive/requests'), 300)
      } else {
        message.error(res?.message || 'Failed to save incentive')
      }
    } catch (err) {
      console.error(err)
      message.error(err?.message || 'Something went wrong')
    } finally {
      dispatch(setUi({ loading: false }))
    }
  }

  const onFinish = async (values) => {
    await save(values)
  }

  // ======= BULK UPLOAD HANDLERS =======
  const bulkProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    maxCount: 1,
    beforeUpload: (file) => {
      const isExcel =
        file.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel' ||
        /\.xlsx?$/i.test(file.name)
      if (!isExcel) {
        message.error('Please select a .xlsx or .xls file')
        return Upload.LIST_IGNORE
      }
      setBulkFile(file)
      return false // prevent auto upload
    },
    onRemove: () => {
      setBulkFile(null)
    },
    fileList: bulkFile ? [bulkFile] : [],
  }

  const submitBulk = async () => {
    if (!bulkFile) {
      message.warning('Please select a file')
      return
    }
    try {
      setBulkUploading(true)
      const fd = new FormData()
      fd.append('file', bulkFile)
      fd.append('createdBy', auth?.ecode || '')
      const res = await uploadIncentivesBulk(fd)
      if (res?.success) {
        message.success(res?.message || 'Bulk upload completed')
        setBulkOpen(false)
        setBulkFile(null)
        // optional: navigate or refresh
        // navigate('/incentive/requests')
      } else {
        message.error(res?.message || 'Bulk upload failed')
      }
    } catch (e) {
      console.error(e)
      message.error('Bulk upload failed')
    } finally {
      setBulkUploading(false)
    }
  }

  // ---- layout memo ----
  const formItemLayout = useMemo(
    () => ({ labelCol: { span: 24 }, wrapperCol: { span: 24 } }),
    [],
  )

  return (
    <div className={theme === 'dark' ? 'dark-theme' : ''}>
      <Pageheading title={editId ? 'Edit Incentive' : 'Create Incentive'} />

      <Card style={{ margin: 8 }} bodyStyle={{ padding: 16 }}>
        {loadingDetails ? (
          <Spin />
        ) : (
          <Form
            {...formItemLayout}
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ month: dayjs(), amount: undefined, remarks: '' }}
          >
            <Row gutter={[16, 12]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="ecode"
                  label="Employee"
                  rules={[{ required: true, message: 'Please select employee' }]}
                >
                  <Select
                    showSearch
                    allowClear
                    placeholder="Search by name / ecode"
                    filterOption={false}
                    onSearch={onSearch}
                    options={mergedOptions}
                    loading={fetching}
                    notFoundContent={fetching ? <Spin size="small" /> : 'No employees found'}
                    optionFilterProp="label"
                    optionLabelProp="label"
                    onDropdownVisibleChange={(open) => {
                      if (open && !searchTerm) fetchOptions('')
                    }}
                    disabled={!!editId}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="month"
                  label="Month"
                  rules={[{ required: true, message: 'Please choose month' }]}
                >
                  <MonthPicker
                    style={{ width: '100%' }}
                    disabledDate={disabledMonth}
                    format="YYYY-MM"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="amount"
                  label="Amount"
                  rules={[
                    { required: true, message: 'Please enter amount' },
                    {
                      validator: (_, v) =>
                        v && Number(v) > 0 ? Promise.resolve() : Promise.reject('Amount must be > 0'),
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    step={100}
                    parser={(value) => String(value ?? '').replace(/[^0-9.]/g, '')}
                    formatter={(value) => `${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="remarks" label="Remarks">
                  <TextArea rows={4} maxLength={500} showCount placeholder="Optional notes" />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item label="Attachments (optional, max 5 files, 5MB each)">
                  <Upload
                    multiple
                    maxCount={MAX_FILES}
                    fileList={fileList}
                    className="tight-upload"
                    beforeUpload={(file) => {
                      const okType = [
                        'image/png',
                        'image/jpeg',
                        'application/pdf',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'application/msword',
                        'text/plain',
                        'application/vnd.ms-excel',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                      ].includes(file.type)
                      if (!okType) {
                        message.error('Only images, PDF, Word, Text or Excel files allowed')
                        return Upload.LIST_IGNORE
                      }
                      const isLt5M = file.size / 1024 / 1024 < 5
                      if (!isLt5M) {
                        message.error('File must be smaller than 5MB')
                        return Upload.LIST_IGNORE
                      }
                      return true
                    }}
                    onRemove={(file) => true}
                    onChange={({ fileList: incoming }) => {
                      if (incoming.length > MAX_FILES) {
                        message.error(`Maximum ${MAX_FILES} attachments allowed`)
                      }
                      const normalized = incoming.slice(0, MAX_FILES)
                      setFileList(normalized)
                    }}
                    customRequest={({ onSuccess }) => setTimeout(() => onSuccess?.('ok'), 0)}
                    showUploadList={{ showRemoveIcon: true }}
                    accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.txt,.xls,.xlsx"
                  >
                    <Button icon={<UploadOutlined />}>Add files</Button>
                  </Upload>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {editId ? 'Update & Submit' : 'Create Incentive'}
                  </Button>
                  <Button onClick={reset}>Reset</Button>

                  {/* ======= BULK UPLOAD TRIGGER ======= */}
                  {/* <Button onClick={() => setBulkOpen(true)}>Bulk upload (.xlsx)</Button> */}
                </Space>
              </Col>
            </Row>
          </Form>
        )}
      </Card>

      {/* ======= BULK UPLOAD MODAL ======= */}
      {/* <Modal
        title="Bulk upload incentives"
        open={bulkOpen}
        onCancel={() => {
          if (!bulkUploading) {
            setBulkOpen(false)
            setBulkFile(null)
          }
        }}
        footer={
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => { setBulkOpen(false); setBulkFile(null) }} disabled={bulkUploading}>
              Cancel
            </Button>
            <Button type="primary" onClick={submitBulk} loading={bulkUploading} disabled={!bulkFile}>
              Upload
            </Button>
          </Space>
        }
      >
        <p style={{ marginBottom: 8 }}>
          Upload a single Excel file (<code>.xlsx</code> / <code>.xls</code>) with columns:
          <br />
          <b>ecode</b>, <b>month</b> (YYYY-MM or YYYY-MM-DD), <b>amount</b>, <b>remarks</b> (optional)
        </p>

        <Dragger {...bulkProps} disabled={bulkUploading}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">Only one Excel file is allowed.</p>
        </Dragger>
      </Modal> */}
    </div>
  )
}

export default CreateIncentive
