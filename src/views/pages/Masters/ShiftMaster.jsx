import { Space, Table, Input } from 'antd'
const { Search } = Input

const ShiftMaster = () => {
  const columns = [
    {
      title: 'State',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Name',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Zone',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Reg',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Cluster',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Emp Code',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Emp Name',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Emp Gross Sal',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Regis App',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Regis Site',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Regis Emp',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'ESIC Site CD/Ref',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Deduc Freq',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Deduc Amount',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Deposit Auth',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Deposit Amt',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Deposit Freq',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Deposit Due Dt',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'H Link Auth',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'H Link TTRL',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Diff',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Remarks',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
  ]

  const ttlWidth = columns.reduce((acc, col) => acc + col.width, 0)
  return (
    <>
      <Space
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'end',
          marginBottom: '0.6rem',
        }}
      >
        <Search placeholder="Search in table..." />
      </Space>
      <Table columns={columns} scroll={{ x: ttlWidth }} />
    </>
  )
}

export default ShiftMaster
