import { Table } from 'antd'
import React from 'react'

const EmployeeRoleList = () => {
  const columns = [
    {
      title: 'Employee',
      key: 'employee',
      dataIndex: 'employee',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Role',
      key: 'role',
      dataIndex: 'role',
      width: 150,
      ellipsis: true,
    },
  ]
  return (
    <div>
      <Table columns={columns} />
    </div>
  )
}

export default EmployeeRoleList
