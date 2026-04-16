import { Table } from "antd";

const columns = [
    {
        title: 'Month_Year',
        dataIndex: 'Month_Year',
        key: 'Month_Year',
    },
    // {
    //     title: 'ARREAR',
    //     dataIndex: 'ARREAR',
    //     key: 'ARREAR',
    // },
    {
        title: 'Absent',
        dataIndex: 'Absent',
        key: 'Absent',
    },
    // {
    //     title: 'Adjusted Days',
    //     dataIndex: 'AdjustedDays',
    //     key: 'AdjustedDays',
    // },
    // {
    //     title: 'BasicSalary_Actual_',
    //     dataIndex: 'BasicSalary_Actual_',
    //     key: 'BasicSalary_Actual_',
    // },
    // {
    //     title: 'BasicSalary_Bud_',
    //     dataIndex: 'BasicSalary_Bud_',
    //     key: 'BasicSalary_Bud_',
    // },
    // {
    //     title: 'BatchNo',
    //     dataIndex: 'BatchNo',
    //     key: 'BatchNo',
    // },
    // {
    //     title: 'Books_and_Periodicals_Actual_',
    //     dataIndex: 'Books_and_Periodicals_Actual_',
    //     key: 'Books_and_Periodicals_Actual_',
    // },
    // {
    //     title: 'Books_and_Periodicals_Bud_',
    //     dataIndex: 'Books_and_Periodicals_Bud_',
    //     key: 'Books_and_Periodicals_Bud_',
    // },
    // {
    //     title: 'CCA_Actual_',
    //     dataIndex: 'CCA_Actual_',
    //     key: 'CCA_Actual_',
    // },
    // {
    //     title: 'CCA_Bud_',
    //     dataIndex: 'CCA_Bud_',
    //     key: 'CCA_Bud_',
    // },
    // {
    //     title: 'CashShort',
    //     dataIndex: 'CashShort',
    //     key: 'CashShort',
    // },
    // {
    //     title: 'CasualLeaveAcquired',
    //     dataIndex: 'CasualLeaveAcquired',
    //     key: 'CasualLeaveAcquired',
    // },
    // {
    //     title: 'CasualLeaveBalance',
    //     dataIndex: 'CasualLeaveBalance',
    //     key: 'CasualLeaveBalance',
    // },
    // {
    //     title: 'CasualLeaveUsed',
    //     dataIndex: 'CasualLeaveUsed',
    //     key: 'CasualLeaveUsed',
    // },
    // {
    //     title: 'CompoOffAcquired',
    //     dataIndex: 'CompoOffAcquired',
    //     key: 'CompoOffAcquired',
    // },
    // {
    //     title: 'CompoOffBalance',
    //     dataIndex: 'CompoOffBalance',
    //     key: 'CompoOffBalance',
    // },
    // {
    //     title: 'CompoOffUsed',
    //     dataIndex: 'CompoOffUsed',
    //     key: 'CompoOffUsed',
    // },
    // {
    //     title: 'DA_Actual_',
    //     dataIndex: 'DA_Actual_',
    //     key: 'DA_Actual_',
    // },
    // {
    //     title: 'DA_Bud_',
    //     dataIndex: 'DA_Bud_',
    //     key: 'DA_Bud_',
    // },
    // {
    //     title: 'DieselDeduction',
    //     dataIndex: 'DieselDeduction',
    //     key: 'DieselDeduction',
    // },
    // {
    //     title: 'Driver_Wages_Actual_',
    //     dataIndex: 'Driver_Wages_Actual_',
    //     key: 'Driver_Wages_Actual_',
    // },
    // {
    //     title: 'Driver_Wages_Bud_',
    //     dataIndex: 'Driver_Wages_Bud_',
    //     key: 'Driver_Wages_Bud_',
    // },
    // {
    //     title: 'ESIC_Employee_',
    //     dataIndex: 'ESIC_Employee_',
    //     key: 'ESIC_Employee_',
    // },
    // {
    //     title: 'ESIC_Employeer_',
    //     dataIndex: 'ESIC_Employeer_',
    //     key: 'ESIC_Employeer_',
    // },
    // {
    //     title: 'ESIC_Total_',
    //     dataIndex: 'ESIC_Total_',
    //     key: 'ESIC_Total_',
    // },
    // {
    //     title: 'EarnedLeaveAcquired',
    //     dataIndex: 'EarnedLeaveAcquired',
    //     key: 'EarnedLeaveAcquired',
    // },
    {
        title: 'EarnedLeaveBalance',
        dataIndex: 'EarnedLeaveBalance',
        key: 'EarnedLeaveBalance',
    },
    // {
    //     title: 'EarnedLeaveUsed',
    //     dataIndex: 'EarnedLeaveUsed',
    //     key: 'EarnedLeaveUsed',
    // },
    // {
    //     title: 'Ecode',
    //     dataIndex: 'Ecode',
    //     key: 'Ecode',
    // },
    // {
    //     title: 'Employee_Name',
    //     dataIndex: 'Employee_Name',
    //     key: 'Employee_Name',
    // },
    // {
    //     title: 'ExtraDayAllowance',
    //     dataIndex: 'ExtraDayAllowance',
    //     key: 'ExtraDayAllowance',
    // },
    // {
    //     title: 'Fooding_Allowance',
    //     dataIndex: 'Fooding_Allowance',
    //     key: 'Fooding_Allowance',
    // },
    // {
    //     title: 'Fuel_and_Maintenance_Actual_',
    //     dataIndex: 'Fuel_and_Maintenance_Actual_',
    //     key: 'Fuel_and_Maintenance_Actual_',
    // },
    // {
    //     title: 'Fuel_and_Maintenance_Bud_',
    //     dataIndex: 'Fuel_and_Maintenance_Bud_',
    //     key: 'Fuel_and_Maintenance_Bud_',
    // },
    // {
    //     title: 'GF',
    //     dataIndex: 'GF',
    //     key: 'GF',
    // },
    // {
    //     title: 'HRA_Actual_',
    //     dataIndex: 'HRA_Actual_',
    //     key: 'HRA_Actual_',
    // },
    // {
    //     title: 'HRA_Bud_',
    //     dataIndex: 'HRA_Bud_',
    //     key: 'HRA_Bud_',
    // },
    // {
    //     title: 'HolidayOff',
    //     dataIndex: 'HolidayOff',
    //     key: 'HolidayOff',
    // },
    // {
    //     title: 'ID',
    //     dataIndex: 'ID',
    //     key: 'ID',
    // },
    // {
    //     title: 'Incentive',
    //     dataIndex: 'Incentive',
    //     key: 'Incentive',
    // },
    // {
    //     title: 'LWP',
    //     dataIndex: 'LWP',
    //     key: 'LWP',
    // },
    // {
    //     title: 'Leave_Used',
    //     dataIndex: 'Leave_Used',
    //     key: 'Leave_Used',
    // },
    // {
    //     title: 'Loan',
    //     dataIndex: 'Loan',
    //     key: 'Loan',
    // },
    // {
    //     title: 'Location_Code',
    //     dataIndex: 'Location_Code',
    //     key: 'Location_Code',
    // },
    // {
    //     title: 'Location_Name',
    //     dataIndex: 'Location_Name',
    //     key: 'Location_Name',
    // },
    // {
    //     title: 'Lwf',
    //     dataIndex: 'Lwf',
    //     key: 'Lwf',
    // },
    // {
    //     title: 'MANUAL',
    //     dataIndex: 'MANUAL',
    //     key: 'MANUAL',
    // },
    // {
    //     title: 'MONTH',
    //     dataIndex: 'MONTH',
    //     key: 'MONTH',
    // },
    // {
    //     title: 'Machine',
    //     dataIndex: 'Machine',
    //     key: 'Machine',
    // },
    // {
    //     title: 'MachineWP',
    //     dataIndex: 'MachineWP',
    //     key: 'MachineWP',
    // },
    // {
    //     title: 'Meal_Voucher_Actual_',
    //     dataIndex: 'Meal_Voucher_Actual_',
    //     key: 'Meal_Voucher_Actual_',
    // },
    // {
    //     title: 'Meal_Voucher_Bud_',
    //     dataIndex: 'Meal_Voucher_Bud_',
    //     key: 'Meal_Voucher_Bud_',
    // },
    // {
    //     title: 'Mobile_Bill',
    //     dataIndex: 'Mobile_Bill',
    //     key: 'Mobile_Bill',
    // },
    // {
    //     title: 'Mobile_Bill_Actual_',
    //     dataIndex: 'Mobile_Bill_Actual_',
    //     key: 'Mobile_Bill_Actual_',
    // },
    // {
    //     title: 'Mobile_Bill_Bud_',
    //     dataIndex: 'Mobile_Bill_Bud_',
    //     key: 'Mobile_Bill_Bud_',
    // },
    
    {
        title: 'Monthly Gross CTC Actual',
        dataIndex: 'Monthly_Gross_CTC_Actual_',
        key: 'Monthly_Gross_CTC_Actual_',
    },
    {
        title: 'Monthly Gross CTC Actual (After Deduction AND AddONS)',
        dataIndex: 'Monthly_Gross_CTC_Actual_After_Deduction_AND_AddONS_',
        key: 'Monthly_Gross_CTC_Actual_After_Deduction_AND_AddONS_',
    },
    // {
    //     title: 'Monthly_Gross_CTC_Bud_',
    //     dataIndex: 'Monthly_Gross_CTC_Bud_',
    //     key: 'Monthly_Gross_CTC_Bud_',
    // },
    // {
    //     title: 'Opening_CL',
    //     dataIndex: 'Opening_CL',
    //     key: 'Opening_CL',
    // },
    // {
    //     title: 'Opening_CompoOff',
    //     dataIndex: 'Opening_CompoOff',
    //     key: 'Opening_CompoOff',
    // },
    // {
    //     title: 'Opening_EL',
    //     dataIndex: 'Opening_EL',
    //     key: 'Opening_EL',
    // },
    // {
    //     title: 'Overtime',
    //     dataIndex: 'Over',
    //     key: 'Overtime'
    // },
    // {
    //     title: 'PF_Employee_',
    //     dataIndex: 'PF_Employee_',
    //     key: 'PF_Employee_',
    // },
    // {
    //     title: 'PF_Employeer_',
    //     dataIndex: 'PF_Employeer_',
    //     key: 'PF_Employeer_',
    // },
    // {
    //     title: 'PF_Total_',
    //     dataIndex: 'PF_Total_',
    //     key: 'PF_Total_',
    // },
    // {
    //     title: 'PTax',
    //     dataIndex: 'PTax',
    //     key: 'PTax',
    // },
    {
        title: 'Payble Days',
        dataIndex: 'Payble_Days',
        key: 'Payble_Days',
    },
    {
        title: 'Penality',
        dataIndex: 'Penality',
        key: 'Penality',
    },
    // {
    //     title: 'Professional_Attire_Actual_',
    //     dataIndex: 'Professional_Attire_Actual_',
    //     key: 'Professional_Attire_Actual_',
    // },
    // {
    //     title: 'Professional_Attire_Bud_',
    //     dataIndex: 'Professional_Attire_Bud_',
    //     key: 'Professional_Attire_Bud_',
    // },
    // {
    //     title: 'Reimbersment_Actual_',
    //     dataIndex: 'Reimbersment_Actual_',
    //     key: 'Reimbersment_Actual_',
    // },
    // {
    //     title: 'Reimbersment_Bud_',
    //     dataIndex: 'Reimbersment_Bud_',
    //     key: 'Reimbersment_Bud_',
    // },
    // {
    //     title: 'RunAt',
    //     dataIndex: 'RunAt',
    //     key: 'RunAt',
    // },
    // {
    //     title: 'SalaryStatus',
    //     dataIndex: 'SalaryStatus',
    //     key: 'SalaryStatus',
    // },
    // {
    //     title: 'SpecialAllowance_Actual_',
    //     dataIndex: 'SpecialAllowance_Actual_',
    //     key: 'SpecialAllowance_Actual_',
    // },
    // {
    //     title: 'SpecialAllowance_Bud_',
    //     dataIndex: 'SpecialAllowance_Bud_',
    //     key: 'SpecialAllowance_Bud_',
    // },
    // {
    //     title: 'Status',
    //     dataIndex: 'Status',
    //     key: 'Status',
    // },
    // {
    //     title: 'TDS',
    //     dataIndex: 'TDS',
    //     key: 'TDS',
    // },
    // {
    //     title: 'TotalDeductions',
    //     dataIndex: 'TotalDeductions',
    //     key: 'TotalDeductions',
    // },
    // {
    //     title: 'actualttl_days',
    //     dataIndex: 'actualttl_days',
    //     key: 'actualttl_days',
    // },
    // {
    //     title: 'actualweekly',
    //     dataIndex: 'actualweekly',
    //     key: 'actualweekly',
    // },
    // {
    //     title: 'department',
    //     dataIndex: 'department',
    //     key: 'department',
    // },
    // {
    //     title: 'designation',
    //     dataIndex: 'designation',
    //     key: 'designation',
    // },
    // {
    //     title: 'extradays',
    //     dataIndex: 'extradays',
    //     key: 'extradays',
    // },
    // {
    //     title: 'paybledays',
    //     dataIndex: 'paybledays',
    //     key: 'paybledays',
    // },
    // {
    //     title: 'presentweeklyoff',
    //     dataIndex: 'presentweeklyoff',
    //     key: 'presentweeklyoff',
    // },
    // {
    //     title: 'ttl_bgt_days',
    //     dataIndex: 'ttl_bgt_days',
    //     key: 'ttl_bgt_days',
    // },
];


const TableUnpaidSalaryData = ({data}) => {
    return (
        <Table columns={columns} dataSource={data} scroll={{ x: 'max-content' }} styles={{title: {backgroundImage: "linear-gradient(to right, black, black)", color: "white"}}}></Table>
    )
}

export default TableUnpaidSalaryData;