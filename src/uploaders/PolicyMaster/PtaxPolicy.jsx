import React from 'react'
import PolicyMasterPage from './PolicyMasterPage'

const num = (v) => (v === null || v === undefined || v === '' ? '-' : v)

const columns = [
  { title: 'State', dataIndex: 'state', key: 'state', width: 200, ellipsis: true, fixed: 'left' },
  { title: 'Slab Min', dataIndex: 'slabMin', key: 'slabMin', width: 120, align: 'right', render: num },
  { title: 'Slab Max', dataIndex: 'slabMax', key: 'slabMax', width: 120, align: 'right', render: num },
  { title: 'PT Rate', dataIndex: 'ptRate', key: 'ptRate', width: 120, align: 'right', render: num },
  { title: 'Frequency', dataIndex: 'frequency', key: 'frequency', width: 130 },
  { title: 'Gender', dataIndex: 'gender', key: 'gender', width: 120, render: (v) => v || '-' },
]

const editFields = [
  { key: 'state', label: 'State', type: 'text', required: true, full: true },
  { key: 'slabMin', label: 'Slab Min (₹)', type: 'number', precision: 2, required: true },
  { key: 'slabMax', label: 'Slab Max (₹)', type: 'number', precision: 2, required: true },
  { key: 'ptRate', label: 'PT Rate (₹)', type: 'number', precision: 2, required: true },
  {
    key: 'frequency',
    label: 'Frequency',
    type: 'select',
    required: true,
    options: ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly'],
  },
  // Gender is optional / can be blank
  { key: 'gender', label: 'Gender', type: 'select', required: false, options: ['Male', 'Female', 'Transgender'] },
]

const PtaxPolicy = () => (
  <PolicyMasterPage
    title="Professional Tax (PTax) Policy"
    subtitle="State-wise PT slabs — each state has its own income ranges (Slab Min–Max) and tax amounts."
    apiBase="PtaxPolicy"
    accent="#4f46e5"
    columns={columns}
    editFields={editFields}
    addLabel="Add Slab / Range"
    templateName="PTax_Policy_UploadTemplate.xlsx"
    exportName="PTax_Policy.xlsx"
    uploadNotes={[
      'Only .xlsx files are supported.',
      'Columns: State, Slab Min, Slab Max, PT Rate, Frequency, Gender.',
      'Uploads only UPDATE existing rows (matched by State + Slab Min + Slab Max + Gender). No new rows are inserted.',
      'Frequency is mandatory. Gender can be left blank.',
    ]}
  />
)

export default PtaxPolicy
