const columns = [
  {
    title: 'Shift Code',
    dataIndex: '',
    key: '',
    width: 100,
    ellipsis: true,
  },
  {
    title: 'Shift Name',
    dataIndex: '',
    key: '',
    width: 120,
    ellipsis: true,
  },
  {
    title: 'Shift Type',
    dataIndex: '',
    key: '',
    width: 100,
    ellipsis: true,
  },
  {
    title: 'Shift State Time',
    dataIndex: '',
    key: '',
    width: 150,
    ellipsis: true,
  },
  {
    title: 'Shift End Time',
    dataIndex: '',
    key: '',
    width: 150,
    ellipsis: true,
  },
  {
    title: 'Shift Duration',
    dataIndex: '',
    key: '',
    width: 150,
    ellipsis: true,
  },
  {
    title: 'Remarks',
    dataIndex: '',
    key: '',
    width: 120,
    ellipsis: true,
  },
  {
    title: 'Parameter',
    dataIndex: '',
    key: '',
    width: 120,
    ellipsis: true,
  },
  {
    title: 'Description',
    dataIndex: '',
    key: '',
    width: 120,
    ellipsis: true,
  },
]

const totalWidth = columns.reduce((acc, col) => acc + (col.width || 150), 0)

export { columns, totalWidth }
