import { Space, Table, Input } from 'antd'
const { Search } = Input

const PTMaster = () => {
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
      title: 'Act OP-DT',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Bgt OP-DT',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Area New',
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
      title: 'Emp Gross Salary',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Regis Applic',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Regis Criteria',
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
      title: 'LWF Site CD/Ref',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Deduction Freq',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Deduction Total Amt',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Deduction Emp CNTB %',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Deduction Emp CNTB Amt',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Deduction Empr CNTB %',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Deduction Empr CNTB Amt',
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
    {
      title: 'Screen HL',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Training',
      dataIndex: 'state',
      key: 'code',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Tax Slabs / Income Ranges',
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

export default PTMaster
