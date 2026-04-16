import { useMemo } from 'react'
import { Card, Timeline, Tag, Typography, Space, Empty } from 'antd'
import dayjs from 'dayjs'

const { Text } = Typography

function statusTag(status) {
  const s = (status || '').toLowerCase()

  if (s === 'future') return <Tag color="blue">Future</Tag>
  if (s === 'current') return <Tag color="green">Current</Tag>
  if (s === 'past') return <Tag color="default">Past</Tag>
}

const ShiftHistoryTimeline = ({ shiftHistory }) => {
  const items = useMemo(() => {
    const arr = Array.isArray(shiftHistory) ? [...shiftHistory] : []
    arr.sort((a, b) => new Date(b?.effectiveFrom || 0) - new Date(a?.effectiveFrom || 0))

    return arr.map((h) => {
      const from = h?.effectiveFrom ? dayjs(h.effectiveFrom).format('DD MM YYYY') : '-'
      const to = h?.effectiveTo ? dayjs(h.effectiveTo).format('DD MM YYYY') : 'Present'
      const shift = h?.shiftDetails

      return {
        label: from,
        children: (
          <div>
            <Space wrap>
              <Text strong>{shift?.shiftName ?? `Shift #${h?.shiftId ?? '-'}`}</Text>
              {statusTag(h?.shiftStatus)}
            </Space>

            <div style={{ marginTop: 6 }}>
              <Text type="secondary">
                {shift?.startTime ?? '--:--'} - {shift?.endTime ?? '--:--'} • {from} {'->'} {to}
              </Text>
            </div>

            <div style={{ marginTop: 6 }}>
              <Text type="secondary">
                Assigned on:{' '}
                {h?.assignedOn ? dayjs(h.assignedOn).format('DD MMM YYYY, hh:mm A') : '-'}
                {' • '}
                By: {h?.assignedBy ?? '-'}
              </Text>
            </div>

            {h?.remarks ? (
              <div style={{ marginTop: 6 }}>
                <Text>Remarks: {h.remarks}</Text>
              </div>
            ) : null}
          </div>
        ),
      }
    })
  }, [shiftHistory])

  return (
    <Card title="Shift History" bordered={false}>
      {items.length === 0 ? (
        <Empty description="No shift history available" />
      ) : (
        <Timeline mode="left" items={items} />
      )}
    </Card>
  )
}

export default ShiftHistoryTimeline
