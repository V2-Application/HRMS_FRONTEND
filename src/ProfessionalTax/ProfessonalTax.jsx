// import React, { useMemo, useState } from 'react'

// // A single-file React component that recreates the UI from the screenshot.
// // TailwindCSS classes are used for styling. No external state mgmt needed.
// // The layout mimics a desktop dialog with a toolbar and a form grid of 14 rows.

// const initialRows = [
//   { from: '', to: '10000', tax: '0' },
//   { from: '10001', to: '15000', tax: '150' },
//   { from: '15001', to: '25000', tax: '180' },
//   { from: '25001', to: '99999999', tax: '208' },
//   { from: '0', to: '0', tax: '0' },
//   { from: '0', to: '0', tax: '0' },
//   { from: '0', to: '0', tax: '0' },
//   { from: '0', to: '0', tax: '0' },
//   { from: '0', to: '0', tax: '0' },
//   { from: '0', to: '0', tax: '0' },
//   { from: '0', to: '0', tax: '0' },
//   { from: '0', to: '0', tax: '0' },
//   { from: '0', to: '0', tax: '0' },
//   { from: '0', to: '0', tax: '0' },
// ]

// export default function ProfessionalTax() {
//   const [rows, setRows] = useState(initialRows)
//   const [stateUT, setStateUT] = useState('Assam')
//   const [mode, setMode] = useState('view') // view | add | edit
//   const [searchText, setSearchText] = useState('')

//   const isDirty = useMemo(() => {
//     return JSON.stringify(rows) !== JSON.stringify(initialRows) || stateUT !== 'Assam'
//   }, [rows, stateUT])

//   const onChangeCell = (index, field, value) => {
//     setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)))
//   }

//   const onAdd = () => {
//     setMode('add')
//     setRows(initialRows.map((r) => ({ from: '', to: '', tax: '' })))
//   }

//   const onEdit = () => setMode('edit')
//   const onDelete = () => {
//     // Mimic delete: clear current grid while staying in edit mode
//     setRows(initialRows.map(() => ({ from: '', to: '', tax: '' })))
//     setMode('edit')
//   }
//   const onSearch = () => {
//     // This is only a visual stub, you can wire it to your backend later
//     alert(`Search requested for: "${searchText}"`)
//   }
//   const onSave = () => {
//     // Replace this with real persistence logic
//     alert('Saved!')
//     setMode('view')
//   }
//   const onCancel = () => {
//     setRows(initialRows)
//     setStateUT('Assam')
//     setMode('view')
//   }

//   return (
//     <div className="min-h-screen w-full bg-slate-200 p-4">
//       <div className="mx-auto max-w-6xl rounded-xl border border-slate-300 bg-slate-50 shadow-sm">
//         {/* Title bar */}
//         <div className="flex items-center justify-between border-b border-slate-300 bg-slate-100 px-4 py-2 rounded-t-xl">
//           <div className="text-sm font-semibold text-slate-700">Professional Tax Slabs</div>
//           <div className="text-xs text-slate-400">Desktop Form · Mock</div>
//         </div>

//         {/* Toolbar */}
//         <div className="flex flex-wrap gap-2 px-4 py-3">
//           <ToolbarButton label="Add" onClick={onAdd} />
//           <ToolbarButton label="Edit" onClick={onEdit} />
//           <ToolbarButton label="Delete" onClick={onDelete} />
//           <div className="ml-2 flex items-center gap-2">
//             <ToolbarButton label="Search" onClick={onSearch} />
//             <input
//               value={searchText}
//               onChange={(e) => setSearchText(e.target.value)}
//               className="h-8 w-56 rounded-md border border-slate-300 bg-white px-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
//               placeholder="Type to search…"
//             />
//           </div>
//           <div className="ml-auto flex gap-2">
//             <ToolbarButton label="Save" onClick={onSave} disabled={!isDirty} />
//             <ToolbarButton
//               label="Cancel"
//               onClick={onCancel}
//               disabled={mode === 'view' && !isDirty}
//             />
//             <ToolbarButton label="Exit" onClick={() => alert('Close window.')} />
//           </div>
//         </div>

//         {/* Content area */}
//         <div className="px-4 pb-6">
//           <div className="rounded-xl border border-slate-300 bg-white p-4">
//             {/* Grid header */}
//             <div className="grid grid-cols-[32px,1fr,1fr,1fr,240px] items-center gap-3 border-b border-slate-200 pb-2 text-xs font-medium text-slate-600">
//               <div />
//               <div>From</div>
//               <div>To</div>
//               <div>P.Tax Amount</div>
//               <div className="pl-4">State / Union Territory</div>
//             </div>

//             {/* Rows */}
//             <div className="grid grid-cols-[32px,1fr,1fr,1fr,240px] gap-x-3 gap-y-2 pt-3">
//               {rows.map((row, idx) => (
//                 <React.Fragment key={idx}>
//                   <div className="flex h-9 items-center justify-end pr-1 text-xs text-slate-500">
//                     {idx + 1}.
//                   </div>

//                   <InputCell
//                     value={row.from}
//                     onChange={(v) => onChangeCell(idx, 'from', v)}
//                     placeholder={idx === 0 ? '' : '0'}
//                   />
//                   <InputCell value={row.to} onChange={(v) => onChangeCell(idx, 'to', v)} />
//                   <InputCell value={row.tax} onChange={(v) => onChangeCell(idx, 'tax', v)} />

//                   {/* Only show the State/UT selector on the first row to match the screenshot's alignment */}
//                   {idx === 0 ? (
//                     <select
//                       className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
//                       value={stateUT}
//                       onChange={(e) => setStateUT(e.target.value)}
//                     >
//                       {[
//                         'Assam',
//                         'Andhra Pradesh',
//                         'Arunachal Pradesh',
//                         'Bihar',
//                         'Chhattisgarh',
//                         'Delhi',
//                         'Goa',
//                         'Gujarat',
//                         'Haryana',
//                         'Himachal Pradesh',
//                         'Jammu & Kashmir',
//                         'Jharkhand',
//                         'Karnataka',
//                         'Kerala',
//                         'Madhya Pradesh',
//                         'Maharashtra',
//                         'Manipur',
//                         'Meghalaya',
//                         'Mizoram',
//                         'Nagaland',
//                         'Odisha',
//                         'Punjab',
//                         'Rajasthan',
//                         'Sikkim',
//                         'Tamil Nadu',
//                         'Telangana',
//                         'Tripura',
//                         'Uttar Pradesh',
//                         'Uttarakhand',
//                         'West Bengal',
//                         'Puducherry',
//                         'Chandigarh',
//                         'Andaman & Nicobar Islands',
//                         'Lakshadweep',
//                         'Dadra & Nagar Haveli and Daman & Diu',
//                         'Ladakh',
//                       ].map((opt) => (
//                         <option key={opt} value={opt}>
//                           {opt}
//                         </option>
//                       ))}
//                     </select>
//                   ) : (
//                     <div />
//                   )}
//                 </React.Fragment>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// function ToolbarButton({ label, onClick, disabled }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       disabled={disabled}
//       className={[
//         'h-8 rounded-md border px-3 text-sm font-medium shadow-sm',
//         disabled
//           ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
//           : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:scale-[.99]',
//       ].join(' ')}
//     >
//       {label}
//     </button>
//   )
// }

// function InputCell({ value, onChange, placeholder }) {
//   return (
//     <input
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//       placeholder={placeholder}
//       className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
//       inputMode="numeric"
//     />
//   )
// }




// import React, { useState } from 'react'
// import './ProfessionalTax.css'

// const ProfessionalTax = () => {
//   const [slabs, setSlabs] = useState([
//     { id: 1, from: 1, to: 10000, ptaxAmount: 0 },
//     { id: 2, from: 10001, to: 15000, ptaxAmount: 150 },
//     { id: 3, from: 15001, to: 25000, ptaxAmount: 180 },
//     { id: 4, from: 25001, to: 9999999, ptaxAmount: 208 },
//     { id: 5, from: 0, to: 0, ptaxAmount: 0 },
//     { id: 6, from: 0, to: 0, ptaxAmount: 0 },
//     { id: 7, from: 0, to: 0, ptaxAmount: 0 },
//     { id: 8, from: 0, to: 0, ptaxAmount: 0 },
//     { id: 9, from: 0, to: 0, ptaxAmount: 0 },
//     { id: 10, from: 0, to: 0, ptaxAmount: 0 },
//     { id: 11, from: 0, to: 0, ptaxAmount: 0 },
//     { id: 12, from: 0, to: 0, ptaxAmount: 0 },
//     { id: 13, from: 0, to: 0, ptaxAmount: 0 },
//     { id: 14, from: 0, to: 0, ptaxAmount: 0 },
//   ])

//   const [state, setState] = useState('Assam')

//   const handleInputChange = (id, field, value) => {
//     setSlabs(slabs.map((slab) => (slab.id === id ? { ...slab, [field]: value } : slab)))
//   }

//   const handleAdd = () => {
//     const newId = Math.max(...slabs.map((s) => s.id)) + 1
//     setSlabs([...slabs, { id: newId, from: 0, to: 0, ptaxAmount: 0 }])
//   }

//   const handleEdit = () => {
//     // Edit functionality
//     alert('Edit mode enabled')
//   }

//   const handleDelete = () => {
//     // Delete selected row
//     alert('Delete functionality')
//   }

//   const handleSearch = () => {
//     // Search functionality
//     alert('Search functionality')
//   }

//   const handleSave = () => {
//     console.log('Saving slabs:', slabs)
//     alert('Data saved successfully!')
//   }

//   const handleCancel = () => {
//     // Reset or cancel changes
//     alert('Changes cancelled')
//   }

//   const handleExit = () => {
//     window.close()
//   }

//   return (
//     <div className="professional-tax-container">
//       <div className="header">
//         <div className="title">
//           <span className="icon">📊</span>
//           Professional Tax Slabs
//         </div>
//         <button className="close-btn" onClick={handleExit}>
//           ×
//         </button>
//       </div>

//       <div className="toolbar">
//         <button className="btn btn-add" onClick={handleAdd}>
//           <span className="btn-icon">➕</span> Add
//         </button>
//         <button className="btn btn-edit" onClick={handleEdit}>
//           <span className="btn-icon">✏️</span> Edit
//         </button>
//         <button className="btn btn-delete" onClick={handleDelete}>
//           <span className="btn-icon">✖</span> Delete
//         </button>
//         <button className="btn btn-search" onClick={handleSearch}>
//           <span className="btn-icon">🔍</span> Search
//         </button>

//         <div className="toolbar-right">
//           <button className="btn btn-save" onClick={handleSave}>
//             <span className="btn-icon">💾</span> Save
//           </button>
//           <button className="btn btn-cancel" onClick={handleCancel}>
//             <span className="btn-icon">✖</span> Cancel
//           </button>
//           <button className="btn btn-exit" onClick={handleExit}>
//             <span className="btn-icon">🚪</span> Exit
//           </button>
//         </div>
//       </div>

//       <div className="content">
//         <div className="table-container">
//           <table className="tax-table">
//             <thead>
//               <tr>
//                 <th></th>
//                 <th>From</th>
//                 <th>To</th>
//                 <th>P.Tax Amount</th>
//                 <th>State / Union Territory</th>
//               </tr>
//             </thead>
//             <tbody>
//               {slabs.map((slab, index) => (
//                 <tr key={slab.id}>
//                   <td className="row-number">{index + 1}.</td>
//                   <td>
//                     <input
//                       type="number"
//                       value={slab.from}
//                       onChange={(e) => handleInputChange(slab.id, 'from', e.target.value)}
//                       className="input-field"
//                     />
//                   </td>
//                   <td>
//                     <input
//                       type="number"
//                       value={slab.to}
//                       onChange={(e) => handleInputChange(slab.id, 'to', e.target.value)}
//                       className="input-field"
//                     />
//                   </td>
//                   <td>
//                     <input
//                       type="number"
//                       value={slab.ptaxAmount}
//                       onChange={(e) => handleInputChange(slab.id, 'ptaxAmount', e.target.value)}
//                       className="input-field"
//                     />
//                   </td>
//                   {index === 0 && (
//                     <td rowSpan={slabs.length} className="state-cell">
//                       <input
//                         type="text"
//                         value={state}
//                         onChange={(e) => setState(e.target.value)}
//                         className="input-field state-input"
//                       />
//                     </td>
//                   )}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ProfessionalTax


// import React, { useState } from 'react'
// import './ProfessionalTax.css'

// const ProfessionalTax = () => {
//   const [slabs, setSlabs] = useState([
//     { id: 1, from: 1, to: 10000, ptaxAmount: 0 },
//     { id: 2, from: 10001, to: 15000, ptaxAmount: 150 },
//     { id: 3, from: 15001, to: 25000, ptaxAmount: 180 },
//     { id: 4, from: 25001, to: 9999999, ptaxAmount: 208 },
//     { id: 5, from: 0, to: 0, ptaxAmount: 0 },
//     { id: 6, from: 0, to: 0, ptaxAmount: 0 },
//     { id: 7, from: 0, to: 0, ptaxAmount: 0 },
//     { id: 8, from: 0, to: 0, ptaxAmount: 0 },
//     { id: 9, from: 0, to: 0, ptaxAmount: 0 },
//     { id: 10, from: 0, to: 0, ptaxAmount: 0 },
//     { id: 11, from: 0, to: 0, ptaxAmount: 0 },
//     { id: 12, from: 0, to: 0, ptaxAmount: 0 },
//     { id: 13, from: 0, to: 0, ptaxAmount: 0 },
//     { id: 14, from: 0, to: 0, ptaxAmount: 0 },
//   ])

//   const [state, setState] = useState('Assam')

//   // List of Indian States and Union Territories
//   const statesAndUTs = [
//     'Andhra Pradesh',
//     'Arunachal Pradesh',
//     'Assam',
//     'Bihar',
//     'Chhattisgarh',
//     'Goa',
//     'Gujarat',
//     'Haryana',
//     'Himachal Pradesh',
//     'Jharkhand',
//     'Karnataka',
//     'Kerala',
//     'Madhya Pradesh',
//     'Maharashtra',
//     'Manipur',
//     'Meghalaya',
//     'Mizoram',
//     'Nagaland',
//     'Odisha',
//     'Punjab',
//     'Rajasthan',
//     'Sikkim',
//     'Tamil Nadu',
//     'Telangana',
//     'Tripura',
//     'Uttar Pradesh',
//     'Uttarakhand',
//     'West Bengal',
//     'Andaman and Nicobar Islands',
//     'Chandigarh',
//     'Dadra and Nagar Haveli and Daman and Diu',
//     'Delhi',
//     'Jammu and Kashmir',
//     'Ladakh',
//     'Lakshadweep',
//     'Puducherry',
//   ]

//   const handleInputChange = (id, field, value) => {
//     setSlabs(slabs.map((slab) => (slab.id === id ? { ...slab, [field]: value } : slab)))
//   }

//   const handleAdd = () => {
//     const newId = Math.max(...slabs.map((s) => s.id)) + 1
//     setSlabs([...slabs, { id: newId, from: 0, to: 0, ptaxAmount: 0 }])
//   }

//   const handleEdit = () => {
//     alert('Edit mode enabled')
//   }

//   const handleDelete = () => {
//     alert('Delete functionality')
//   }

//   const handleSearch = () => {
//     alert('Search functionality')
//   }

//   const handleSave = () => {
//     console.log('Saving slabs:', slabs)
//     console.log('Selected State:', state)
//     alert('Data saved successfully!')
//   }

//   const handleCancel = () => {
//     alert('Changes cancelled')
//   }

//   const handleExit = () => {
//     window.close()
//   }

//   return (
//     <div className="professional-tax-container">
//       <div className="header">
//         <div className="title">
//           <span className="icon">📊</span>
//           Professional Tax Slabs
//         </div>
//         <button className="close-btn" onClick={handleExit}>
//           ×
//         </button>
//       </div>

//       <div className="toolbar">
//         <button className="btn btn-add" onClick={handleAdd}>
//           <span className="btn-icon">➕</span> Add
//         </button>
//         <button className="btn btn-edit" onClick={handleEdit}>
//           <span className="btn-icon">✏️</span> Edit
//         </button>
//         <button className="btn btn-delete" onClick={handleDelete}>
//           <span className="btn-icon">✖</span> Delete
//         </button>
//         <button className="btn btn-search" onClick={handleSearch}>
//           <span className="btn-icon">🔍</span> Search
//         </button>

//         <div className="toolbar-right">
//           <button className="btn btn-save" onClick={handleSave}>
//             <span className="btn-icon">💾</span> Save
//           </button>
//           <button className="btn btn-cancel" onClick={handleCancel}>
//             <span className="btn-icon">✖</span> Cancel
//           </button>
//           <button className="btn btn-exit" onClick={handleExit}>
//             <span className="btn-icon">🚪</span> Exit
//           </button>
//         </div>
//       </div>

//       <div className="content">
//         <div className="table-container">
//           <table className="tax-table">
//             <thead>
//               <tr>
//                 <th></th>
//                 <th>From</th>
//                 <th>To</th>
//                 <th>P.Tax Amount</th>
//                 <th>State / Union Territory</th>
//               </tr>
//             </thead>
//             <tbody>
//               {slabs.map((slab, index) => (
//                 <tr key={slab.id}>
//                   <td className="row-number">{index + 1}.</td>
//                   <td>
//                     <input
//                       type="number"
//                       value={slab.from}
//                       onChange={(e) => handleInputChange(slab.id, 'from', e.target.value)}
//                       className="input-field"
//                     />
//                   </td>
//                   <td>
//                     <input
//                       type="number"
//                       value={slab.to}
//                       onChange={(e) => handleInputChange(slab.id, 'to', e.target.value)}
//                       className="input-field"
//                     />
//                   </td>
//                   <td>
//                     <input
//                       type="number"
//                       value={slab.ptaxAmount}
//                       onChange={(e) => handleInputChange(slab.id, 'ptaxAmount', e.target.value)}
//                       className="input-field"
//                     />
//                   </td>
//                   {index === 0 && (
//                     <td rowSpan={slabs.length} className="state-cell">
//                       <select
//                         value={state}
//                         onChange={(e) => setState(e.target.value)}
//                         className="input-field state-dropdown"
//                       >
//                         {statesAndUTs.map((stateOption) => (
//                           <option key={stateOption} value={stateOption}>
//                             {stateOption}
//                           </option>
//                         ))}
//                       </select>
//                     </td>
//                   )}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ProfessionalTax



import React, { useState } from 'react'
import { Layout, Card, Button, Table, InputNumber, Select, Typography, Space, message } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import './ProfessionalTax.css'

const { Header, Content } = Layout
const { Title, Text } = Typography
const { Option } = Select

const ProfessionalTax = () => {
  const [slabs, setSlabs] = useState([
    { id: 1, from: 1, to: 10000, ptaxAmount: 0 },
    { id: 2, from: 10001, to: 15000, ptaxAmount: 150 },
    { id: 3, from: 15001, to: 25000, ptaxAmount: 180 },
    { id: 4, from: 25001, to: 9999999, ptaxAmount: 208 },
    { id: 5, from: 0, to: 0, ptaxAmount: 0 },
    { id: 6, from: 0, to: 0, ptaxAmount: 0 },
    { id: 7, from: 0, to: 0, ptaxAmount: 0 },
    { id: 8, from: 0, to: 0, ptaxAmount: 0 },
    { id: 9, from: 0, to: 0, ptaxAmount: 0 },
    { id: 10, from: 0, to: 0, ptaxAmount: 0 },
    { id: 11, from: 0, to: 0, ptaxAmount: 0 },
    { id: 12, from: 0, to: 0, ptaxAmount: 0 },
    { id: 13, from: 0, to: 0, ptaxAmount: 0 },
    { id: 14, from: 0, to: 0, ptaxAmount: 0 },
  ])

  const [state, setState] = useState('Assam')
  const [isEditMode, setIsEditMode] = useState(false)

  const statesAndUTs = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Lakshadweep',
    'Puducherry',
  ]

  const handleInputChange = (id, field, value) => {
    if (!isEditMode) return
    setSlabs((prev) =>
      prev.map((slab) => (slab.id === id ? { ...slab, [field]: value ?? 0 } : slab)),
    )
  }

  const handleAdd = () => {
    if (!isEditMode) {
      message.warning('Enable Edit mode to add slabs.')
      return
    }
    const newId = slabs.length ? Math.max(...slabs.map((s) => s.id)) + 1 : 1
    setSlabs([...slabs, { id: newId, from: 0, to: 0, ptaxAmount: 0 }])
  }

  const handleEdit = () => {
    setIsEditMode(true)
    message.info('Edit mode enabled')
  }

  const handleDelete = () => {
    if (!isEditMode) {
      message.warning('Enable Edit mode to delete slabs.')
      return
    }
    if (slabs.length <= 1) {
      message.warning('At least one slab must remain.')
      return
    }
    const maxId = Math.max(...slabs.map((s) => s.id))
    setSlabs(slabs.filter((s) => s.id !== maxId))
  }

  const handleSearch = () => {
    message.info('Search functionality can be implemented here.')
  }

  const handleSave = () => {
    console.log('Saving slabs:', slabs)
    console.log('Selected State:', state)
    message.success('Professional tax slabs saved successfully!')
    setIsEditMode(false)
  }

  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      width: 60,
      render: (_, __, index) => `${index + 1}.`,
    },
    {
      title: 'From',
      dataIndex: 'from',
      render: (value, record) => (
        <InputNumber
          min={0}
          className={`pt-input ${!isEditMode ? 'pt-input-readonly' : ''}`}
          value={value}
          controls={false}
          readOnly={!isEditMode}
          onChange={(val) => handleInputChange(record.id, 'from', val)}
        />
      ),
    },
    {
      title: 'To',
      dataIndex: 'to',
      render: (value, record) => (
        <InputNumber
          min={0}
          className={`pt-input ${!isEditMode ? 'pt-input-readonly' : ''}`}
          value={value}
          controls={false}
          readOnly={!isEditMode}
          onChange={(val) => handleInputChange(record.id, 'to', val)}
        />
      ),
    },
    {
      title: 'P.Tax Amount',
      dataIndex: 'ptaxAmount',
      render: (value, record) => (
        <InputNumber
          min={0}
          className={`pt-input ${!isEditMode ? 'pt-input-readonly' : ''}`}
          value={value}
          controls={false}
          readOnly={!isEditMode}
          onChange={(val) => handleInputChange(record.id, 'ptaxAmount', val)}
        />
      ),
    },
  ]

  return (
    <Layout className="pt-layout">
      <Header className="pt-header">
        <div className="pt-header-inner">
          <div className="pt-header-left">
            {/* <span className="pt-header-icon">📊</span> */}
            <div>
              <Title level={5} style={{ margin: 0 }}>
                Professional Tax Slabs
              </Title>
              {/* <Text type="secondary" style={{ fontSize: 12 }}>
                {isEditMode ? 'Edit Mode' : 'View Mode'}
              </Text> */}
            </div>
          </div>

          <Space>
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              disabled={!isEditMode}
            >
              Add
            </Button>
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={handleEdit}
              disabled={isEditMode}
            >
              Edit
            </Button>
            <Button
              danger
              type="default"
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              disabled={!isEditMode}
            >
              Delete
            </Button>
            <Button type="default" icon={<SearchOutlined />} onClick={handleSearch}>
              Search
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              disabled={!isEditMode}
            >
              Save
            </Button>
          </Space>
        </div>
      </Header>

      <Content className="pt-content">
        <Card className="pt-card" bordered>
          <div className="pt-state-row">
            <Text strong>State / Union Territory:&nbsp;</Text>
            <Select
              className={`pt-state-select ${!isEditMode ? 'pt-select-readonly' : ''}`}
              value={state}
              onChange={(value) => {
                if (!isEditMode) return
                setState(value)
              }}
              showSearch
              optionFilterProp="children"
            >
              {statesAndUTs.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Select>
          </div>

          <Table
            className="pt-table"
            columns={columns}
            dataSource={slabs}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      </Content>
    </Layout>
  )
}

export default ProfessionalTax
