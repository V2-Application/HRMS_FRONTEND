import { Tooltip, Typography } from 'antd'

const { Text } = Typography

const DetailItem = ({ label, value }) => {
  const display = value ?? '-'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        // gap: 4,
        minWidth: 0,
      }}
    >
      <Text type="secondary">{label}</Text>

      <Tooltip title={display} placement="topLeft">
        <Text strong ellipsis={{ tooltip: false }} style={{ minWidth: 0 }}>
          {display}
        </Text>
      </Tooltip>
    </div>
  )
}

export default DetailItem
