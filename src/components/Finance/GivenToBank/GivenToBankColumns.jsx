import { BankOutlined, InfoCircleOutlined, RollbackOutlined } from '@ant-design/icons'
import { Button, Popconfirm, Space, Tooltip, Typography } from 'antd'

const { Text } = Typography

const GivenToBankColumns = ({ onUpdateStatus, isUpdatingId, fetchSalData, isInfoLoading }) => {
  const columns = [
    {
      title: 'Batch Id',
      dataIndex: 'batchId',
      key: 'batchId',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'TransactionId',
      dataIndex: 'formattedId',
      key: 'formattedId',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
      width: 110,
      ellipsis: true,
    },
    {
      title: 'Emp Code',
      dataIndex: 'ecode',
      key: 'ecode',
      width: 100,
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
      title: 'Created On',
      dataIndex: 'createdOn',
      key: 'createdOn',
      width: 130,
      ellipsis: true,
      render: (date) => (date === null ? null : String(date).split('T')[0]),
    },
    {
      title: 'Bank Transfer',
      dataIndex: 'bankTransfer',
      key: 'bankTransfer',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      ellipsis: true,
      render: (_, record) => {
        const loading = isUpdatingId === record?.id

        return (
          <Space>
            <Tooltip title="Paid by Bank" placement="top">
              <Popconfirm
                title="Paid by Bank"
                description="Are you sure you want to perform this operation?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => onUpdateStatus(record?.id, record?.batchId, 4)}
                placement="left"
              >
                <Button loading={loading} icon={<BankOutlined />} />
              </Popconfirm>
            </Tooltip>

            <Tooltip placement="top" title="Return by Bank">
              <Popconfirm
                title="Return by Bank"
                description="Are you sure you want to perform this operation?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => onUpdateStatus(record?.id, record?.batchId, 5)}
                placement="left"
              >
                <Button loading={loading} icon={<RollbackOutlined />} />
              </Popconfirm>
            </Tooltip>

            <Tooltip placement="top" title="Salary Info">
              <Button
                icon={<InfoCircleOutlined />}
                onClick={() => fetchSalData(record?.batchId)}
                loading={isInfoLoading}
              />
            </Tooltip>
          </Space>
        )
      },
    },
  ]

  const totalWidth = columns.reduce((acc, col) => acc + (col.width || 150), 0)
  return { columns, totalWidth }
}

export default GivenToBankColumns
