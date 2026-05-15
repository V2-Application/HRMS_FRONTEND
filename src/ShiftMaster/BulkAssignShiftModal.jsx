import { useEffect, useState } from 'react'
import { Modal, Form, Select, DatePicker, Input, Upload, Button, message, Alert, Space } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { bulkAssignShift, GetAllShifts } from '../services/Services'

const { TextArea } = Input

const BulkAssignShiftModal = ({ isOpen, setIsOpen, refreshShifts }) => {
  const [form] = Form.useForm()
  const [shifts, setShifts] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [excelFile, setExcelFile] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    ;(async () => {
      try {
        const res = await GetAllShifts()
        if (res.status === 200) {
          const activeShifts = (res.data?.data || []).filter((s) => s.isActive)
          setShifts(activeShifts)
        }
      } catch (err) {
        message.error('Could not load shifts')
      }
    })()
  }, [isOpen])

  const handleClose = () => {
    setIsOpen(false)
    form.resetFields()
    setExcelFile(null)
    setResult(null)
  }

  const handleSubmit = async () => {
    let values
    try {
      values = await form.validateFields()
    } catch {
      return
    }

    const hasCsv = values.ecodesCsv && values.ecodesCsv.trim().length > 0
    if (!hasCsv && !excelFile) {
      message.error('Provide ecodes (paste or Excel upload).')
      return
    }

    const formData = new FormData()
    formData.append('ShiftId', values.shiftId)
    formData.append('EffectiveFrom', values.effectiveFrom.format('YYYY-MM-DD'))
    if (values.ecodesCsv) formData.append('EcodesCsv', values.ecodesCsv)
    if (values.remarks) formData.append('Remarks', values.remarks)
    if (excelFile) formData.append('EcodeExcel', excelFile)

    setSubmitting(true)
    setResult(null)
    try {
      const res = await bulkAssignShift(formData)
      if (res.status === 200) {
        const r = res.data?.data
        setResult(r)
        message.success(res.data?.message || 'Bulk assignment processed')
        refreshShifts?.()
      } else {
        message.error(res.data?.message || 'Bulk assignment failed')
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Bulk assignment failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Bulk Assign Employees to a Shift"
      open={isOpen}
      onCancel={handleClose}
      width={680}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Close
        </Button>,
        <Button key="submit" type="primary" loading={submitting} onClick={handleSubmit}>
          Assign
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" initialValues={{ effectiveFrom: dayjs() }}>
        <Form.Item
          label="Target Shift"
          name="shiftId"
          rules={[{ required: true, message: 'Pick a target shift' }]}
        >
          <Select
            placeholder="Select shift"
            showSearch
            optionFilterProp="label"
            options={shifts.map((s) => ({
              value: s.shiftID,
              label: `${s.shiftName} (${s.startTime} - ${s.endTime})`,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Effective From"
          name="effectiveFrom"
          rules={[{ required: true, message: 'Pick effective date' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          label="Ecodes (paste comma/newline separated)"
          name="ecodesCsv"
          extra="Either paste here OR upload an Excel file below (or both)."
        >
          <TextArea
            rows={5}
            placeholder="V25415, V25659, V00025&#10;V26191&#10;V00498 ..."
          />
        </Form.Item>

        <Form.Item label="Or upload Excel (column 'Ecode')">
          <Upload
            beforeUpload={(file) => {
              setExcelFile(file)
              return false
            }}
            onRemove={() => setExcelFile(null)}
            maxCount={1}
            accept=".xlsx,.xls"
          >
            <Button icon={<UploadOutlined />}>
              {excelFile ? excelFile.name : 'Choose Excel file'}
            </Button>
          </Upload>
        </Form.Item>

        <Form.Item label="Remarks" name="remarks">
          <Input placeholder="Optional note saved on each EmployeeShiftHistory row" />
        </Form.Item>
      </Form>

      {result && (
        <Alert
          type={result.errors?.length || result.notFoundEcodes?.length ? 'warning' : 'success'}
          style={{ marginTop: 8 }}
          message={
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <div>
                <strong>Submitted:</strong> {result.totalSubmitted} &nbsp;
                <strong>Processed:</strong> {result.processed} &nbsp;
                <strong>Already on shift:</strong> {result.alreadyOnShift} &nbsp;
                <strong>Not found:</strong> {result.notFoundEcodes?.length || 0} &nbsp;
                <strong>Errors:</strong> {result.errors?.length || 0}
              </div>
              {result.notFoundEcodes?.length > 0 && (
                <div>
                  <strong>Not found ecodes:</strong> {result.notFoundEcodes.join(', ')}
                </div>
              )}
              {result.errors?.length > 0 && (
                <div>
                  <strong>Errors:</strong>
                  <ul style={{ margin: 0 }}>
                    {result.errors.map((e, i) => (
                      <li key={i}>
                        {e.ecode}: {e.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Space>
          }
        />
      )}
    </Modal>
  )
}

export default BulkAssignShiftModal
