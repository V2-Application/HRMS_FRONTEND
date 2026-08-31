import React from 'react'
import PolicyMasterPage from './PolicyMasterPage'

const isPercent = (record) => String(record?.calcType || '').toLowerCase() === 'percent'

// Employee / Employer hold either a rupee amount or a percentage of gross, depending on
// Calc Type. Show the unit so a value like 0.2 is never mistaken for 20 paise.
const contribution = (v, record) =>
  v === null || v === undefined || v === '' ? '-' : isPercent(record) ? `${v} %` : `₹ ${v}`

const cap = (v) => (v === null || v === undefined || v === '' ? '-' : `₹ ${v}`)

const columns = [
  { title: 'State', dataIndex: 'state', key: 'state', width: 200, ellipsis: true, fixed: 'left' },
  { title: 'Frequency', dataIndex: 'frequency', key: 'frequency', width: 140 },
  {
    title: 'Calc Type',
    dataIndex: 'calcType',
    key: 'calcType',
    width: 120,
    render: (v) => v || 'Flat',
  },
  {
    title: 'Employee',
    dataIndex: 'employee',
    key: 'employee',
    width: 130,
    align: 'right',
    render: contribution,
  },
  { title: 'Employee Max', dataIndex: 'employeeMax', key: 'employeeMax', width: 140, align: 'right', render: cap },
  {
    title: 'Employer',
    dataIndex: 'employer',
    key: 'employer',
    width: 130,
    align: 'right',
    render: contribution,
  },
  { title: 'Employer Max', dataIndex: 'employerMax', key: 'employerMax', width: 140, align: 'right', render: cap },
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
  {
    // Decides how payroll reads Employee / Employer below.
    //   Flat    -> a rupee amount
    //   Percent -> a percentage of earned gross, capped by the Max fields
    //              (Haryana: 0.2 % capped at ₹35, 0.4 % capped at ₹70)
    key: 'calcType',
    label: 'Calc Type',
    type: 'select',
    required: true,
    options: ['Flat', 'Percent'],
  },
  { key: 'employee', label: 'Employee (₹ or %)', type: 'number', precision: 3 },
  { key: 'employeeMax', label: 'Employee Max (₹)', type: 'number', precision: 2 },
  { key: 'employer', label: 'Employer (₹ or %)', type: 'number', precision: 3 },
  { key: 'employerMax', label: 'Employer Max (₹)', type: 'number', precision: 2 },
]

const LwfPolicy = () => (
  <PolicyMasterPage
    title="Labour Welfare Fund (LWF) Policy"
    subtitle="State-wise LWF contributions. Calc Type decides whether Employee/Employer is a flat ₹ amount or a % of gross capped by the Max column."
    apiBase="LwfPolicy"
    accent="#0e7490"
    columns={columns}
    editFields={editFields}
    addLabel="Add Entry"
    templateName="LWF_Policy_UploadTemplate.xlsx"
    exportName="LWF_Policy.xlsx"
    uploadNotes={[
      'Only .xlsx files are supported.',
      'Columns: State, Frequency, Employee, Employee Max, Employer, Employer Max, Calc Type.',
      '"Calc Type" is optional and must be Flat or Percent. Flat = a ₹ amount; Percent = a % of gross capped by the Max column (e.g. Haryana 0.2% capped at ₹35). Leave the column out and each row keeps its current Calc Type.',
      'Uploads only UPDATE existing rows (matched by State + Frequency). No new rows are inserted.',
      'Frequency is mandatory.',
    ]}
  />
)

export default LwfPolicy
