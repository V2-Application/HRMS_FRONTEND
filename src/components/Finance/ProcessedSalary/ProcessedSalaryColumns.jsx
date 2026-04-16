import { BankOutlined, MoneyCollectOutlined } from '@ant-design/icons'
import { Button, Popconfirm, Space, Tooltip } from 'antd'

const ProcessedSalaryColumns = ({ onUpdateStatus, isUpdatingId }) => {
  const columns = [
    {
      title: 'Process Id',
      dataIndex: 'batchNo',
      key: 'batchNo',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Month-Year',
      dataIndex: 'month_Year',
      key: 'month_Year',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Run At',
      dataIndex: 'runAt',
      key: 'runAt',
      width: 150,
      ellipsis: true,
      render: (date) => String(date).split('T')[0],
    },
    {
      title: 'Loc Code',
      dataIndex: 'location_Code',
      key: 'location_Code',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Loc Name',
      dataIndex: 'location_Name',
      key: 'location_Name',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Emp Code',
      dataIndex: 'ecode',
      key: 'ecode',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Emp Name',
      dataIndex: 'employee_Name',
      key: 'employee_Name',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Payable Days',
      dataIndex: 'payble_Days',
      key: 'payble_Days',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Penalty',
      dataIndex: 'penality',
      key: 'penality',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Present Weekly Off',
      dataIndex: 'presentweeklyoff',
      key: 'presentweeklyoff',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Absent',
      dataIndex: 'absent',
      key: 'absent',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Machine',
      dataIndex: 'machine',
      key: 'machine',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Manual',
      dataIndex: 'manual',
      key: 'manual',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Holidays Off',
      dataIndex: 'holidayOff',
      key: 'holidayOff',
      width: 110,
      ellipsis: true,
    },
    {
      title: 'Incentive',
      dataIndex: 'incentive',
      key: 'incentive',
      width: 110,
      ellipsis: true,
    },
    {
      title: 'Leave Used',
      dataIndex: 'leave_Used',
      key: 'leave_Used',
      width: 110,
      ellipsis: true,
    },
    {
      title: 'Loan',
      dataIndex: 'loan',
      key: 'loan',
      width: 110,
      ellipsis: true,
    },
    {
      title: 'LWF',
      dataIndex: 'lwf',
      key: 'lwf',
      width: 110,
      ellipsis: true,
    },
    {
      title: 'LWP',
      dataIndex: 'lwp',
      key: 'lwp',
      width: 110,
      ellipsis: true,
    },
    {
      title: 'Overtime',
      dataIndex: 'overtime',
      key: 'overtime',
      width: 110,
      ellipsis: true,
    },
    {
      title: 'Act Ttl Days',
      dataIndex: 'actualttl_days',
      key: 'actualttl_days',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Basic Sal Act',
      dataIndex: 'basicSalary_Actual_',
      key: 'basicSalary_Actual_',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Mobile Bill',
      dataIndex: 'mobile_Bill',
      key: 'mobile_Bill',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Basic Sal Bgt',
      dataIndex: 'basicSalary_Bud__',
      key: 'basicSalary_Bud__',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Books & Period Act',
      dataIndex: 'books_and_Periodicals_Actual_',
      key: 'books_and_Periodicals_Actual_',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Books & Period Bgt',
      dataIndex: 'books_and_Periodicals_Bud__',
      key: 'books_and_Periodicals_Bud__',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'CCA Act',
      dataIndex: 'ccA_Actual_',
      key: 'ccA_Actual_',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'CCA Bgt',
      dataIndex: 'ccA_Bud__',
      key: 'ccA_Bud__',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'DA Act',
      dataIndex: 'dA_Actual_',
      key: 'dA_Actual_',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'DA Bgt',
      dataIndex: 'dA_Bud__',
      key: 'dA_Bud__',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Driver Wages Act',
      dataIndex: 'driver_Wages_Actual_',
      key: 'driver_Wages_Actual_',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Driver Wages Bgt',
      dataIndex: 'driver_Wages_Bud__',
      key: 'driver_Wages_Bud__',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Fuel & Maint Act',
      dataIndex: 'fuel_and_Maintenance_Actual_',
      key: 'fuel_and_Maintenance_Actual_',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Fuel & Maint Bgt',
      dataIndex: 'fuel_and_Maintenance_Bud__',
      key: 'fuel_and_Maintenance_Bud__',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Driver Wages Act',
      dataIndex: 'driver_Wages_Actual_',
      key: 'driver_Wages_Actual_',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Driver Wages Bgt',
      dataIndex: 'driver_Wages_Bud__',
      key: 'driver_Wages_Bud__',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'HRA Act',
      dataIndex: 'hrA_Actual_',
      key: 'hrA_Actual_',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'HRA Bgt',
      dataIndex: 'hrA_Bud__',
      key: 'hrA_Bud__',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Meal Voucher Act',
      dataIndex: 'meal_Voucher_Actual_',
      key: 'meal_Voucher_Actual_',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Meal Voucher Bgt',
      dataIndex: 'meal_Voucher_Bud__',
      key: 'hrA_Bud__',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Mobile Bill Act',
      dataIndex: 'mobile_Bill_Actual_',
      key: 'mobile_Bill_Actual_',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Mobile Bill Bgt',
      dataIndex: 'mobile_Bill_Bud__',
      key: 'mobile_Bill_Bud__',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Monthly Gross CTC Act',
      dataIndex: 'monthly_Gross_CTC_Actual_',
      key: 'monthly_Gross_CTC_Actual_',
      width: 180,
      ellipsis: true,
    },
    {
      title: 'Monthly Gross CTC Bgt',
      dataIndex: 'monthly_Gross_CTC_Bud__',
      key: 'monthly_Gross_CTC_Bud__',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Prof Attire Act',
      dataIndex: 'professional_Attire_Actual_',
      key: 'professional_Attire_Actual_',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Prof Attire Bgt',
      dataIndex: 'professional_Attire_Bud__',
      key: 'professional_Attire_Bud__',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Reim Act',
      dataIndex: 'reimbersment_Actual_',
      key: 'reimbersment_Actual_',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Reim Bgt',
      dataIndex: 'reimbersment_Bud__',
      key: 'reimbersment_Bud__',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Special Allow Act',
      dataIndex: 'specialAllowance_Actual_',
      key: 'specialAllowance_Actual_',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Special Allow Bgt',
      dataIndex: 'specialAllowance_Bud__',
      key: 'specialAllowance_Bud__',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Reim Bgt',
      dataIndex: 'reimbersment_Bud__',
      key: 'reimbersment_Bud__',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Monthly Gross CTC Act (After Deduction & Add-ons)',
      dataIndex: 'monthly_Gross_CTC_Actual_After_Deduction_AND_AddONS_',
      key: 'monthly_Gross_CTC_Actual_After_Deduction_AND_AddONS_',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Arrear',
      dataIndex: 'arrear',
      key: 'arrear',
      width: 80,
      ellipsis: true,
    },
    {
      title: 'Cash Short',
      dataIndex: 'cashShort',
      key: 'cashShort',
      width: 80,
      ellipsis: true,
    },
    {
      title: 'Extra Allow',
      dataIndex: 'extraDayAllowance',
      key: 'extraDayAllowance',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Extra Days',
      dataIndex: 'extradays',
      key: 'extradays',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Fooding Allow',
      dataIndex: 'fooding_Allowance',
      key: 'fooding_Allowance',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Diesel Deduc',
      dataIndex: 'dieselDeduction',
      key: 'dieselDeduction',
      width: 80,
      ellipsis: true,
    },
    {
      title: 'Opening CL',
      dataIndex: 'opening_CL',
      key: 'opening_CL',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'CL Acq',
      dataIndex: 'casualLeaveAcquired',
      key: 'casualLeaveAcquired',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'CL Bal',
      dataIndex: 'casualLeaveBalance',
      key: 'casualLeaveBalance',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'CL Used',
      dataIndex: 'casualLeaveUsed',
      key: 'casualLeaveUsed',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Opening EL',
      dataIndex: 'opening_EL',
      key: 'opening_EL',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'EL Acq',
      dataIndex: 'earnedLeaveAcquired',
      key: 'earnedLeaveAcquired',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'EL Bal',
      dataIndex: 'earnedLeaveBalance',
      key: 'earnedLeaveBalance',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'EL Used',
      dataIndex: 'earnedLeaveUsed',
      key: 'earnedLeaveUsed',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Opening CompOff',
      dataIndex: 'opening_CompoOff',
      key: 'opening_CompoOff',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'CompOff Acq',
      dataIndex: 'compoOffAcquired',
      key: 'compoOffAcquired',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'CompOff Bal',
      dataIndex: 'compoOffBalance',
      key: 'compoOffBalance',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'CompOff Used',
      dataIndex: 'compoOffUsed',
      key: 'compoOffUsed',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'ESIC Emp',
      dataIndex: 'esiC_Employee_',
      key: 'esiC_Employee_',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'ESIC Empr',
      dataIndex: 'esiC_Employeer_',
      key: 'esiC_Employeer_',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'ESIC Total',
      dataIndex: 'esiC_Total_',
      key: 'esiC_Total_',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'PF Emp',
      dataIndex: 'pF_Employee_',
      key: 'pF_Employee_',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'PF Empr',
      dataIndex: 'pF_Employeer_',
      key: 'pF_Employeer_',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'PF Total',
      dataIndex: 'pF_Total_',
      key: 'pF_Total_',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'P Tax',
      dataIndex: 'pTax',
      key: 'pTax',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'TDS',
      dataIndex: 'tds',
      key: 'tds',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Total Deductions',
      dataIndex: 'totalDeductions',
      key: 'totalDeductions',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Ttl Bgt Days',
      dataIndex: 'ttl_bgt_days',
      key: 'ttl_bgt_days',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      ellipsis: true,
      render: (_, record) => {
        const loading = isUpdatingId === record?.id

        return (
          <Space>
            <Tooltip title="Given to Bank" placement="top">
              <Popconfirm
                title="Given to Bank"
                description="Are you sure you want to perform this operation?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => onUpdateStatus(record?.id, 2)}
                placement="left"
              >
                <Button loading={loading} icon={<BankOutlined />} />
              </Popconfirm>
            </Tooltip>

            <Tooltip title="Paid by Cash" placement="top">
              <Popconfirm
                title="Paid by Cash"
                description="Are you sure you want to perform this operation?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => onUpdateStatus(record?.id, 3)}
                placement="left"
              >
                <Button loading={loading} icon={<MoneyCollectOutlined />} />
              </Popconfirm>
            </Tooltip>
          </Space>
        )
      },
    },
  ]

  const totalWidth = columns.reduce((acc, col) => acc + (col.width || 150), 0)

  return { columns, totalWidth }
}

export default ProcessedSalaryColumns
