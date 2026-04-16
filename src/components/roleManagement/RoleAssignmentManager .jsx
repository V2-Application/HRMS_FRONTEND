import React, { useState } from 'react'
import { Table, Select, Typography, Button } from 'antd'

const { Option } = Select
const { Title } = Typography

const allRoles = ['Admin', 'HR', 'StoreHR', 'Audit', 'ClusterManager', 'Employee', 'Applicant']

const initialEmployees = [
  { id: 1, name: 'Alice', roles: ['Employee'] },
  { id: 2, name: 'Bob', roles: ['HR', 'Admin'] },
  { id: 3, name: 'Charlie', roles: ['StoreHR', 'Employee'] },
  { id: 4, name: 'David', roles: ['Audit'] },
]

const RoleAssignmentManager = () => {
  const [employees, setEmployees] = useState(initialEmployees)

  const handleRoleChange = (employeeId, selectedRoles) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === employeeId ? { ...emp, roles: selectedRoles } : emp)),
    )
  }

  const columns = [
    {
      title: 'Employee Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Roles',
      key: 'roles',
      render: (_, record) => (
        <Select
          mode="multiple"
          allowClear
          placeholder="Select roles"
          value={record.roles}
          onChange={(value) => handleRoleChange(record.id, value)}
          style={{ width: '100%' }}
        >
          {allRoles.map((role) => (
            <Option key={role} value={role}>
              {role}
            </Option>
          ))}
        </Select>
      ),
    },
  ]

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <Title level={3}>Super Admin: Assign or Remove Roles</Title>
      <Table
        dataSource={employees}
        columns={columns}
        rowKey="id"
        pagination={false}
        bordered
        style={{ marginTop: '20px' }}
      />
      <Button
        type="primary"
        style={{ marginTop: '20px', backgroundColor: '#1890ff', borderColor: '#1890ff' }}
        // onClick={() => console.log('Updated employee roles:', employees)}
      >
        Save Role Changes
      </Button>
    </div>
  )
}

export default RoleAssignmentManager
