import { Card, Descriptions, Typography } from 'antd'

const { Text } = Typography

const EmployeeInfoCard = ({ employeeInfo = {} }) => {
  return (
    <Card title="Employee" bordered={false}>
      <Descriptions column={1} size="small">
        <Descriptions.Item label="Employee Id">
          <Text strong>{employeeInfo?.employeeId ?? '-'}</Text>
        </Descriptions.Item>

        <Descriptions.Item label="Employee Code">
          <Text strong>{employeeInfo?.ecode ?? '-'}</Text>
        </Descriptions.Item>

        <Descriptions.Item label="Name">
          <Text strong>{employeeInfo?.fullName ?? '-'}</Text>
        </Descriptions.Item>

        <Descriptions.Item label="Reporting Head">
          <Text strong>{employeeInfo?.reportHeadFullName ?? '-'}</Text>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  )
}

export default EmployeeInfoCard
