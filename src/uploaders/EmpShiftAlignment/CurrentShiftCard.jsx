import { Card, Descriptions, Tag, Space, Button, Typography } from 'antd'

const { Text } = Typography

const CurrentShiftCard = ({ currentShift, onUpdateClick, loading }) => {
  const activeTag = currentShift?.isActive ? (
    <Tag color="green">Active</Tag>
  ) : (
    <Tag color="red">Inactive</Tag>
  )

  return (
    <Card
      title={<Space>Current Shift {currentShift?.shiftName ? activeTag : null}</Space>}
      bordered={false}
      extra={
        <Button type="primary" onClick={onUpdateClick} loading={loading}>
          Update Shift
        </Button>
      }
    >
      {!currentShift ? (
        <Text type="secondary">No current shift found.</Text>
      ) : (
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Shift Name">
            {<Text strong>{currentShift?.shiftName ?? '-'}</Text>}
          </Descriptions.Item>

          <Descriptions.Item label="Shift ID">
            {<Text strong>{currentShift?.shiftID ?? '-'}</Text>}
          </Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  )
}

export default CurrentShiftCard
