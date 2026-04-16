import React, { useEffect, useMemo, useState } from 'react'
import {
  Modal,
  Button,
  Input,
  Segmented,
  Typography,
  Descriptions,
  Space,
  Divider,
  DatePicker,
} from 'antd'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Text } = Typography

function ResignationActionModal({
  initiateModalOpen,
  handleInitializeCandidate,
  setInitiateModalOpen,
  isRevoked,
  label = 'Resignation Action',
  record = null,
  setRecord,
}) {
  const [selectedOption, setSelectedOption] = useState(null) // 1 approve, 2 reject, 3 revoke
  const [remarks, setRemarks] = useState('')
  const [lastWorkingDay, setLastWorkingDay] = useState(null) // dayjs object
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initiateModalOpen) {
      setLastWorkingDay(record?.lastDay ? dayjs(record.lastDay) : null)
      setRemarks('') // keep fresh on open (optional)
    } else {
      setSelectedOption(null)
      setRecord?.(null)
      setRemarks('')
      setLastWorkingDay(null)
      setLoading(false)
    }
  }, [initiateModalOpen, record, setRecord])

  const actionOptions = useMemo(() => {
    if (isRevoked) return [{ label: 'Revoke', value: 3 }]
    return [
      { label: 'Approve', value: 1 },
      { label: 'Reject', value: 2 },
    ]
  }, [isRevoked])

  const fullName = record?.fullName || '-'
  const ecode = record?.ecode || record?.reportHeadEcode || '-'

  const lastDay = useMemo(() => {
    if (!record?.lastDay) return '-'
    const d = new Date(record.lastDay)
    if (Number.isNaN(d.getTime())) return String(record.lastDay)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }, [record?.lastDay])

  // ✅ Remarks always mandatory
  const remarksInvalid = !remarks.trim()
  const lwdInvalid = !lastWorkingDay

  const onSubmit = async () => {
    try {
      setLoading(true)
      await handleInitializeCandidate?.({
        selectedOption,
        remarks: remarks.trim(),
        lastWorkingDay,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={label}
      centered
      open={initiateModalOpen}
      onCancel={() => setInitiateModalOpen(false)}
      confirmLoading={loading}
      destroyOnClose
      footer={
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button onClick={() => setInitiateModalOpen(false)} disabled={loading}>
            Cancel
          </Button>

          <Button
            type="primary"
            onClick={onSubmit}
            disabled={loading || selectedOption === null || remarksInvalid || lwdInvalid}
            loading={loading}
          >
            Submit
          </Button>
        </Space>
      }
    >
      <Descriptions
        size="small"
        column={1}
        bordered
        style={{ background: '#fff', borderRadius: 8 }}
        labelStyle={{ width: 140, fontWeight: 600 }}
      >
        <Descriptions.Item label="Full Name">{fullName}</Descriptions.Item>
        <Descriptions.Item label="E-Code">{ecode}</Descriptions.Item>
        <Descriptions.Item label="Last Day (Record)">{lastDay}</Descriptions.Item>
      </Descriptions>

      <Divider style={{ margin: '12px 0' }} />

      <Space direction="vertical" style={{ width: '100%', marginBottom: '15px' }} size={12}>
        <div>
          <Text strong>Action</Text>
          <div style={{ marginTop: 8 }}>
            <Segmented
              block
              options={actionOptions}
              value={selectedOption}
              onChange={(val) => setSelectedOption(val)}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <Text strong>
            Last Working Day <Text type="danger">*</Text>
          </Text>
          <div style={{ marginTop: 8 }}>
            <DatePicker
              style={{ width: '100%' }}
              value={lastWorkingDay}
              onChange={(d) => setLastWorkingDay(d)}
              disabled={loading}
              status={lwdInvalid ? 'error' : undefined}
              placeholder="Select last working day"
            />
          </div>
          {lwdInvalid ? (
            <Text type="danger" style={{ display: 'block', marginTop: 6 }}>
              Last working day is required.
            </Text>
          ) : null}
        </div>

        <div>
          <Text strong>
            Remarks <Text type="danger">*</Text>
          </Text>
          <TextArea
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter remarks here..."
            style={{ marginTop: 8 }}
            disabled={loading}
            status={remarksInvalid ? 'error' : undefined}
            showCount
            maxLength={300}
          />
          {remarksInvalid ? (
            <Text type="danger" style={{ display: 'block', marginTop: 6 }}>
              Remarks are required.
            </Text>
          ) : null}
        </div>
      </Space>
    </Modal>
  )
}

export default ResignationActionModal
