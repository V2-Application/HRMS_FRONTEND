import { useEffect, useState } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  Button,
  Checkbox,
  Tag,
  Space,
  Divider,
  message,
  Typography,
} from 'antd'
import { UploadOutlined, InboxOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import {
  resignationTypesList,
  bulkInactivateEmployees,
} from '../../services/Services'

const { TextArea } = Input
const { Text } = Typography

const CHECKLIST_ITEMS = [
  { masterId: 1, label: 'Assets Received' },
  { masterId: 2, label: 'Last working Day attendance updated' },
  { masterId: 3, label: 'Email id Inactive' },
  { masterId: 4, label: 'Finger registration removed' },
  { masterId: 5, label: 'No Dues form submitted' },
  { masterId: 6, label: 'Resignation Processed in V2parivar' },
]

const BulkInactivateModal = ({
  open,
  onClose,
  preselectedEmployees = [],
  onSuccess,
}) => {
  const [form] = Form.useForm()
  const auth = useSelector((s) => s?.auth?.data) || {}

  const [resignationTypes, setResignationTypes] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [manualEcodes, setManualEcodes] = useState('')
  const [excelEcodes, setExcelEcodes] = useState([])
  const [excelFile, setExcelFile] = useState(null)
  const [attachment, setAttachment] = useState(null)
  const [checklist, setChecklist] = useState(
    CHECKLIST_ITEMS.reduce((acc, c) => ({ ...acc, [c.masterId]: false }), {}),
  )

  useEffect(() => {
    if (!open) return
    resignationTypesList()
      .then((res) => {
        const list = res?.data?.data || res?.data?.Data || res?.data || []
        setResignationTypes(Array.isArray(list) ? list : [])
      })
      .catch(() => setResignationTypes([]))
  }, [open])

  useEffect(() => {
    if (!open) {
      form.resetFields()
      setManualEcodes('')
      setExcelEcodes([])
      setExcelFile(null)
      setAttachment(null)
      setChecklist(
        CHECKLIST_ITEMS.reduce((acc, c) => ({ ...acc, [c.masterId]: false }), {}),
      )
    }
  }, [open, form])

  const handleExcelFile = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const wb = XLSX.read(data, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })
        const ecodes = rows
          .slice(1)
          .map((r) => (r && r[0] != null ? String(r[0]).trim() : ''))
          .filter(Boolean)
        if (ecodes.length === 0) {
          message.warning('No Ecodes found in the uploaded file (column A from row 2).')
        }
        setExcelEcodes(ecodes)
        setExcelFile(file)
      } catch (err) {
        console.error(err)
        message.error('Could not read the Excel file')
      }
    }
    reader.readAsArrayBuffer(file)
    return false
  }

  const allEcodes = (() => {
    const fromManual = manualEcodes
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    const fromGrid = preselectedEmployees.map((e) => e.ecode || e.Ecode).filter(Boolean)
    const set = new Set([...fromGrid, ...fromManual, ...excelEcodes])
    return [...set]
  })()

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (allEcodes.length === 0) {
        message.error('Select at least one employee, paste Ecodes, or upload an Ecode Excel.')
        return
      }
      if (!attachment) {
        message.error('Attachment is mandatory.')
        return
      }

      const fd = new FormData()
      fd.append('EcodesCsv', allEcodes.join(','))
      fd.append('ResignationTypeId', values.resignationTypeId)
      if (values.abscondingReasonId) fd.append('AbscondingReasonId', values.abscondingReasonId)
      if (values.blackListReasonId) fd.append('BlackListReasonId', values.blackListReasonId)
      if (values.leavingDate) fd.append('LeavingDate', values.leavingDate.toISOString())
      fd.append('Remarks', values.remarks)
      if (auth.employeeId) fd.append('LastUpdatedBy', auth.employeeId)

      const checklistPayload = CHECKLIST_ITEMS.map((c) => ({
        masterId: c.masterId,
        response: !!checklist[c.masterId],
      }))
      fd.append('ChecklistResponsesJson', JSON.stringify(checklistPayload))
      fd.append('Attachment', attachment)

      setSubmitting(true)
      const res = await bulkInactivateEmployees(fd)
      if (res?.status) {
        message.success(res?.message || 'Bulk inactivate completed')
        onSuccess && onSuccess()
        onClose()
      } else {
        message.error(res?.message || 'Bulk inactivate failed')
      }
    } catch (err) {
      if (err?.errorFields) return
      const apiMsg = err?.response?.data?.message || err?.message
      message.error(apiMsg || 'Bulk inactivate failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Bulk Inactivate Employees"
      open={open}
      onCancel={onClose}
      width={720}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={handleSubmit}
        >
          Inactivate {allEcodes.length || ''} {allEcodes.length === 1 ? 'employee' : 'employees'}
        </Button>,
      ]}
    >
      <Form layout="vertical" form={form} initialValues={{ leavingDate: dayjs() }}>
        <Form.Item label="Selected employees">
          {preselectedEmployees.length > 0 ? (
            <Space wrap>
              {preselectedEmployees.map((e) => (
                <Tag color="blue" key={e.id || e.EmployeeId || e.ecode}>
                  {e.ecode || e.Ecode}{e.name ? ` — ${e.name}` : ''}
                </Tag>
              ))}
            </Space>
          ) : (
            <Text type="secondary">No grid selection. Use the fields below to provide Ecodes.</Text>
          )}
        </Form.Item>

        <Form.Item
          label="Paste Ecodes (comma/space/newline separated)"
          extra="Combined with grid selection and Excel upload."
        >
          <TextArea
            rows={3}
            placeholder="e.g. V41797, RTNR63, ..."
            value={manualEcodes}
            onChange={(e) => setManualEcodes(e.target.value)}
          />
        </Form.Item>

        <Form.Item label="Or upload an Excel of Ecodes (column A, header in row 1)">
          <Upload
            beforeUpload={handleExcelFile}
            maxCount={1}
            accept=".xlsx,.xls,.csv"
            onRemove={() => {
              setExcelFile(null)
              setExcelEcodes([])
            }}
            fileList={excelFile ? [{ uid: '-1', name: excelFile.name, status: 'done' }] : []}
          >
            <Button icon={<UploadOutlined />}>Upload Ecode file</Button>
          </Upload>
          {excelEcodes.length > 0 && (
            <Text type="secondary">{excelEcodes.length} Ecodes loaded from file.</Text>
          )}
        </Form.Item>

        <Divider>Inactivation details (shared)</Divider>

        <Form.Item
          name="resignationTypeId"
          label="Resignation Type"
          rules={[{ required: true, message: 'Select resignation type' }]}
        >
          <Select
            placeholder="Select resignation type"
            options={resignationTypes.map((r) => ({
              value: r.resignationTypeId ?? r.ResignationTypeId,
              label: r.resignationTypeName ?? r.ResignationTypeName ?? r.name ?? r.Name,
            }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          name="leavingDate"
          label="Last Working Date"
          rules={[{ required: true, message: 'Pick last working date' }]}
        >
          <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
        </Form.Item>

        <Form.Item
          name="remarks"
          label="Remarks"
          rules={[{ required: true, message: 'Enter remarks' }]}
        >
          <TextArea rows={2} placeholder="Reason / notes (saved for every employee)" />
        </Form.Item>

        <Divider>Checklist (applied to every employee)</Divider>

        <Form.Item>
          <Space direction="vertical">
            {CHECKLIST_ITEMS.map((c) => (
              <Checkbox
                key={c.masterId}
                checked={!!checklist[c.masterId]}
                onChange={(e) =>
                  setChecklist({ ...checklist, [c.masterId]: e.target.checked })
                }
              >
                {c.label}
              </Checkbox>
            ))}
          </Space>
        </Form.Item>

        <Form.Item
          label="Mandatory attachment (single file, applied to all)"
          required
        >
          <Upload.Dragger
            beforeUpload={(file) => {
              if (file.size > 10 * 1024 * 1024) {
                message.error('File exceeds 10MB limit')
                return Upload.LIST_IGNORE
              }
              setAttachment(file)
              return false
            }}
            onRemove={() => setAttachment(null)}
            maxCount={1}
            fileList={attachment ? [{ uid: '-1', name: attachment.name, status: 'done' }] : []}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag the inactivation document</p>
            <p className="ant-upload-hint">PDF / image / doc, up to 10MB</p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default BulkInactivateModal
