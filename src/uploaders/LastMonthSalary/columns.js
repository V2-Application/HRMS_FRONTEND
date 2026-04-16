export const getLastMonthSalaryColumns = () => [
  // A. Employee & Context (FIRST)
  { title: 'Emp Code', dataIndex: 'ecode', width: 100, ellipsis: true },
  { title: 'Emp Name', dataIndex: 'employeeName', width: 150, ellipsis: true },
  { title: 'Department', dataIndex: 'department', width: 120, ellipsis: true },
  { title: 'Designation', dataIndex: 'designation', width: 120, ellipsis: true },
  { title: 'Loc Code', dataIndex: 'location_Code', width: 100, ellipsis: true },
  { title: 'Loc Name', dataIndex: 'locationName', width: 140, ellipsis: true },
  { title: 'Month', dataIndex: 'month', width: 100, ellipsis: true },
  { title: 'Month-Year', dataIndex: 'monthYear', width: 120, ellipsis: true },
  { title: 'Salary Status', dataIndex: 'salaryStatus', width: 120, ellipsis: true },
  { title: 'Status', dataIndex: 'status', width: 100, ellipsis: true },

  // B. Attendance & Days
  { title: 'Total Bgt. Days', dataIndex: 'ttlBgtDays', width: 100, ellipsis: true },
  { title: 'Act. Ttl. Days', dataIndex: 'actualTtlDays', width: 100, ellipsis: true },
  { title: 'Payable Days', dataIndex: 'paybleDays', width: 100, ellipsis: true },
  { title: 'Payable Days 2', dataIndex: 'payble_Days2', width: 120, ellipsis: true },
  { title: 'Adjusted Days', dataIndex: 'adjustedDays', width: 100, ellipsis: true },
  { title: 'Absent', dataIndex: 'absent', width: 100, ellipsis: true },
  { title: 'Extra Days', dataIndex: 'extraDays', width: 100, ellipsis: true },
  { title: 'Extra Day Allow.', dataIndex: 'extraDayAllowance', width: 120, ellipsis: true },
  { title: 'Holiday Off', dataIndex: 'holidayOff', width: 110, ellipsis: true },
  { title: 'Act. Weekly Off', dataIndex: 'actualWeekly', width: 120, ellipsis: true },
  { title: 'Present Weekly Off', dataIndex: 'presentWeeklyOff', width: 130, ellipsis: true },
  { title: 'LWP', dataIndex: 'lwp', width: 100, ellipsis: true },

  // C. Leave Summary
  { title: 'Opening CL', dataIndex: 'openingCL', width: 110, ellipsis: true },
  { title: 'Acquired CL', dataIndex: 'casualLeaveAcquired', width: 120, ellipsis: true },
  { title: 'Used CL', dataIndex: 'casualLeaveUsed', width: 100, ellipsis: true },
  { title: 'Bal CL', dataIndex: 'casualLeaveBalance', width: 100, ellipsis: true },

  { title: 'Opening EL', dataIndex: 'openingEL', width: 110, ellipsis: true },
  { title: 'Acquired EL', dataIndex: 'earnedLeaveAcquired', width: 120, ellipsis: true },
  { title: 'Used EL', dataIndex: 'earnedLeaveUsed', width: 100, ellipsis: true },
  { title: 'Bal. EL', dataIndex: 'earnedLeaveBalance', width: 100, ellipsis: true },

  { title: 'Opening Comp Off', dataIndex: 'openingCompoOff', width: 140, ellipsis: true },
  { title: 'Acquired Comp Off', dataIndex: 'compoOffAcquired', width: 140, ellipsis: true },
  { title: 'Used Comp Off', dataIndex: 'compoOffUsed', width: 120, ellipsis: true },
  { title: 'Bal Comp Off', dataIndex: 'compoOffBalance', width: 120, ellipsis: true },

  // D. Core Salary (Actual & Budget side-by-side)
  { title: 'Act. Basic Sal.', dataIndex: 'basicSalaryActual', width: 120, ellipsis: true },
  { title: 'Bgt. Basic Sal.', dataIndex: 'basicSalaryBud', width: 120, ellipsis: true },

  { title: 'Act. DA', dataIndex: 'daActual', width: 100, ellipsis: true },
  { title: 'Bgt. DA', dataIndex: 'daBud', width: 100, ellipsis: true },

  { title: 'Act. HRA', dataIndex: 'hraActual', width: 120, ellipsis: true },
  { title: 'Bgt. HRA', dataIndex: 'hraBud', width: 120, ellipsis: true },

  { title: 'Act. Spec. Allow.', dataIndex: 'specialAllowanceActual', width: 150, ellipsis: true },
  { title: 'Bgt. Spec. Allow.', dataIndex: 'specialAllowanceBud', width: 150, ellipsis: true },

  { title: 'Used CCA', dataIndex: 'ccaActual', width: 100, ellipsis: true },
  { title: 'Bgt CCA', dataIndex: 'ccaBud', width: 100, ellipsis: true },

  { title: 'Incentive', dataIndex: 'incentive', width: 100, ellipsis: true },
  { title: 'Overtime', dataIndex: 'overtime', width: 100, ellipsis: true },

  // E. Gross Salary
  {
    title: 'Act. Monthly Gross CTC',
    dataIndex: 'monthlyGrossCTCActual',
    width: 180,
    ellipsis: true,
  },
  {
    title: 'Bgt. Monthly Gross CTC',
    dataIndex: 'monthlyGrossCTCBud',
    width: 180,
    ellipsis: true,
  },
  {
    title: 'Act. Monthly Gross CTC After Deduc. Addons',
    dataIndex: 'monthlyGrossCTCActualAfterDeductionAndAddOns',
    width: 260,
    ellipsis: true,
  },

  // F. Reimbursements & Allowances
  { title: 'Fooding Allow.', dataIndex: 'foodingAllowance', width: 120, ellipsis: true },
  {
    title: 'Act. Fuel & Maint.',
    dataIndex: 'fuelAndMaintenanceActual',
    width: 160,
    ellipsis: true,
  },

  { title: 'Act. Meal Voucher', dataIndex: 'mealVoucherActual', width: 140, ellipsis: true },
  { title: 'Bgt. Meal Voucher', dataIndex: 'mealVoucherBud', width: 140, ellipsis: true },

  { title: 'Act Mobile Bill', dataIndex: 'mobileBillActual', width: 130, ellipsis: true },
  { title: 'Bgt. Mobile Bill', dataIndex: 'mobileBillBud', width: 130, ellipsis: true },
  { title: 'Mobile Bill', dataIndex: 'mobileBill', width: 120, ellipsis: true },

  {
    title: 'Act. Books & Period.',
    dataIndex: 'booksAndPeriodicalsActual',
    width: 170,
    ellipsis: true,
  },
  {
    title: 'Bgt. Books & Period.',
    dataIndex: 'booksAndPeriodicalsBud',
    width: 170,
    ellipsis: true,
  },

  {
    title: 'Act. Prof. Attire',
    dataIndex: 'professionalAttireActual',
    width: 150,
    ellipsis: true,
  },
  { title: 'Bgt. Prof. Attire', dataIndex: 'professionalAttireBud', width: 150, ellipsis: true },

  { title: 'Act. Reim.', dataIndex: 'reimbersmentActual', width: 120, ellipsis: true },
  { title: 'Bgt. Reim.', dataIndex: 'reimbersmentBud', width: 120, ellipsis: true },

  // G. Deductions
  { title: 'Emp PF', dataIndex: 'pfEmployee', width: 100, ellipsis: true },
  { title: 'Empr PF', dataIndex: 'pfEmployer', width: 100, ellipsis: true },
  { title: 'Total PF', dataIndex: 'pfTotal', width: 120, ellipsis: true },

  { title: 'Emp ESIC', dataIndex: 'esicEmployee', width: 110, ellipsis: true },
  { title: 'Empr ESIC', dataIndex: 'esicEmployer', width: 110, ellipsis: true },
  { title: 'Total ESIC', dataIndex: 'esicTotal', width: 120, ellipsis: true },

  { title: 'LWF', dataIndex: 'lwf', width: 80, ellipsis: true },
  { title: 'P-Tax', dataIndex: 'pTax', width: 80, ellipsis: true },
  { title: 'TDS', dataIndex: 'tds', width: 100, ellipsis: true },
  { title: 'Loan', dataIndex: 'loan', width: 100, ellipsis: true },
  { title: 'Penalty', dataIndex: 'penality', width: 100, ellipsis: true },
  { title: 'Diesel Deduc.', dataIndex: 'dieselDeduction', width: 130, ellipsis: true },
  { title: 'Cash Short', dataIndex: 'cashShort', width: 100, ellipsis: true },
  { title: 'Total Deduc.', dataIndex: 'totalDeductions', width: 130, ellipsis: true },

  // H. Operational / System (LAST)
  { title: 'Batch No.', dataIndex: 'batchNo', width: 100, ellipsis: true },
  { title: 'Machine', dataIndex: 'machine', width: 100, ellipsis: true },
  { title: 'Machine WP', dataIndex: 'machineWP', width: 120, ellipsis: true },
  { title: 'Manual', dataIndex: 'manual', width: 100, ellipsis: true },

  { title: 'Run At', dataIndex: 'runAt', width: 140, ellipsis: true },
  { title: 'Created By', dataIndex: 'createdBy', width: 120, ellipsis: true },
  {
    title: 'Created On',
    dataIndex: 'createdOn',
    width: 120,
    ellipsis: true,
    render: (date) =>
      date === null || date === undefined ? '-' : String(date || '').split('T')[0],
  },
  { title: 'ID', dataIndex: 'id', width: 100, ellipsis: true },
]
