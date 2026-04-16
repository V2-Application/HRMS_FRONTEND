import { InfoCircleOutlined } from '@ant-design/icons'
import { Button, Tooltip, Typography } from 'antd'

const { Text } = Typography

const PaidByBankColumns = ({ fetchSalData, isInfoLoading }) => {
  const columns = [
    {
      title: 'Batch Id',
      dataIndex: 'batchId',
      key: 'batchId',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Emp Code',
      dataIndex: 'ecode',
      key: 'ecode',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Emp Name',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'A/C No.',
      dataIndex: 'a_C',
      key: 'a_C',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Bank Transfer',
      dataIndex: 'bankTransfer',
      key: 'bankTransfer',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Created By',
      dataIndex: 'createdByNameEcode',
      key: 'createdByNameEcode',
      width: 200,
      ellipsis: true,
      render: (_, record) => <Text>{`${record?.createdByName} (${record?.createdByEcode})`}</Text>,
    },
    {
      title: 'createdOn',
      dataIndex: 'createdOn',
      key: 'createdOn',
      width: 150,
      ellipsis: true,
      render: (date) => (date === null ? '' : String(date).split('T')[0]),
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      ellipsis: true,
      render: (_, record) => {
        return (
          <Tooltip placement="top" title="Salary Info">
            <Button
              icon={<InfoCircleOutlined />}
              onClick={() => fetchSalData(record?.batchId)}
              loading={isInfoLoading}
            />
          </Tooltip>
        )
      },
    },
  ]

  const totalWidth = columns.reduce((acc, col) => acc + (col.width || 150), 0)
  return { columns, totalWidth }
}

export default PaidByBankColumns
