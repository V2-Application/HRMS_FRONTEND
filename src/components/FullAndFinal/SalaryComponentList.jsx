import { Checkbox } from 'antd'
import React from 'react'

// keys match the /api/Fnf/bonus request body
const ITEMS = [
  { key: 'basic', label: 'Basic' },
  { key: 'da', label: 'DA' },
  { key: 'hra', label: 'HRA' },
  { key: 'conveyance', label: 'Conveyance' },
  { key: 'cca', label: 'CCA' },
  { key: 'medicalAllowance', label: 'Medical Allowance' },

  { key: 'incentive', label: 'Incentive' },
  { key: 'foodingAllowance', label: 'Fooding Allowance' },
  { key: 'specialAllowance', label: 'Special Allowance' },
  { key: 'extraAllowance', label: 'Extra Allowance' },
  { key: 'leaveEncashment', label: 'Leave Encashment' },
  { key: 'medicalReim', label: 'Medical Reim' },

  { key: 'lta', label: 'LTA' },
  { key: 'bonusExGratia', label: 'Bonus/Ex-Gratia' },
  { key: 'arrears', label: 'Arrears' },
]

const SalaryComponentList = ({ flags = {}, onToggle = () => {} }) => {
  return (
    <div>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>Salary Component for Bonus Calculation</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {ITEMS.map(({ key, label }) => (
          <Checkbox
            key={key}
            checked={!!flags[key]}
            onChange={(e) => onToggle(key, e.target.checked)}
          >
            {label}
          </Checkbox>
        ))}
      </div>
    </div>
  )
}

export default SalaryComponentList
