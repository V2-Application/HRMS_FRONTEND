import React from 'react'
import { Select } from 'antd'

const EmployeeDropdown = ({
  defaultECode,
  defaultName,
  role,
  employees,
  selectedEmpCode,
  onSearch,
  onChange,
}) => {
  return (
    <Select
      showSearch
      placeholder="Search with employee name or code"
      style={{ width: 200 }}
      value={selectedEmpCode || undefined}
      onChange={onChange}
      onSearch={onSearch}
      filterOption={false}
      disabled={role === 'Employee'}
    >
      {defaultECode && (
        <Select.Option key="default" value={defaultECode}>
          {defaultName} - {defaultECode}
        </Select.Option>
      )}
      {employees.map((emp) => (
        <Select.Option key={emp.ecode} value={emp.ecode}>
          {emp.fullName} - {emp.ecode}
        </Select.Option>
      ))}
    </Select>
  )
}

export default EmployeeDropdown
