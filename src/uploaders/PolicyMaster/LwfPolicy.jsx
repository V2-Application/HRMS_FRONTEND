import React from 'react'
import PolicyMasterPage from './PolicyMasterPage'

const num = (v) => (v === null || v === undefined || v === '' ? '-' : v)

const columns = [
  { title: 'State', dataIndex: 'state', key: 'state', width: 200, ellipsis: true, fixed: 'left' },
  { title: 'Frequency', dataIndex: 'frequency', key: 'frequency', width: 140 },
  { title: 'Employee', dataIndex: 'employee', key: 'employee', width: 130, align: 'right', render: num },
  { title: 'Employee Max', dataIndex: 'employeeMax', key: 'employeeMax', width: 140, align: 'right', render: num },
  { title: 'Employer', dataIndex: 'employer', key: 'employer', width: 130, align: 'right', render: num },
  { title: 'Employer Max', dataIndex: 'employerMax', key: 'employerMax', width: 140, align: 'right', render: num },
]

const editFields = [
  { key: 'state', label: 'State', type: 'text', required: true, full: true },
  {
    key: 'frequency',
    label: 'Frequency',
    type: 'select',
    required: true,
    options: ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly'],
  },
  { key: 'employee', label: 'Employee (₹)', type: 'number', precision: 3 },
  { key: 'employeeMax', label: 'Employee Max (₹)', type: 'number', precision: 2 },
  { key: 'employer', label: 'Employer (₹)', type: 'number', precision: 3 },
  { key: 'employerMax', label: 'Employer Max (₹)', type: 'number', precision: 2 },
]

const LwfPolicy = () => (
  <PolicyMasterPage
    title="Labour Welfare Fund (LWF) Policy"
    subtitle="State-wise LWF contributions — employee & employer amounts per state and frequency."
    apiBase="LwfPolicy"
    accent="#0e7490"
    columns={columns}
    editFields={editFields}
    addLabel="Add Entry"
    templateName="LWF_Policy_UploadTemplate.xlsx"
    exportName="LWF_Policy.xlsx"
    uploadNotes={[
      'Only .xlsx files are supported.',
      'Columns: State, Frequency, Employee, Employee Max, Employer, Employer Max.',
      'Uploads only UPDATE existing rows (matched by State + Frequency). No new rows are inserted.',
      'Frequency is mandatory.',
    ]}
  />
)

export default LwfPolicy
