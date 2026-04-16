import React, { useEffect, useState } from 'react'
import TableList from './TableList'

const columns = [
  {
    title: 'Location',
    dataIndex: 'location',
    key: 'location',
    ellipsis: true,
    width: 100,
  },
  {
    title: 'Emp Code',
    dataIndex: 'ecode',
    key: 'ecode',
    ellipsis: true,
    width: 120,
  },
  {
    title: 'Month-Year',
    dataIndex: 'monthYear',
    key: 'monthYear',
    render: (data) => data?.split('T')[0],
    width: 120,
  },
  {
    title: 'BGT Salary',
    dataIndex: 'bgT_Salary',
    key: 'bgT_Salary',
    width: 120,
  },
  {
    title: 'Payable Days',
    dataIndex: 'payable_Days',
    key: 'payable_Days',
    width: 120,
  },
  {
    title: 'OT AMT',
    dataIndex: 'oT_AMT',
    key: 'oT_AMT',
    width: 120,
  },
  {
    title: 'Incentive',
    dataIndex: 'incentivE_AMT',
    key: 'incentivE_AMT',
    width: 120,
  },
  {
    title: 'Fooding All',
    dataIndex: 'foodinG_ALL',
    key: 'foodinG_ALL',
    width: 120,
  },
  {
    title: 'Arrers',
    dataIndex: 'arrers',
    key: 'arrers',
    width: 120,
  },
  {
    title: 'Extra Days Allowance',
    dataIndex: 'extrA_DAYS_ALLOWANCE',
    key: 'extrA_DAYS_ALLOWANCE',
    width: 170,
  },
  {
    title: 'Gross Salary',
    dataIndex: 'gross_Salary',
    key: 'gross_Salary',
    width: 150,
  },
  {
    title: 'PF',
    dataIndex: 'pf',
    key: 'pf',
    width: 120,
  },
  {
    title: 'ESI',
    dataIndex: 'esi',
    key: 'esi',
    width: 120,
  },
  {
    title: 'TDS',
    dataIndex: 'tds',
    key: 'tds',
    width: 120,
  },
  {
    title: 'P-Tax',
    dataIndex: 'p_TAX',
    key: 'p_TAX',
    width: 120,
  },
  {
    title: 'Cash Short',
    dataIndex: 'casH_SHORT',
    key: 'casH_SHORT',
    width: 120,
  },
  {
    title: 'Diesel',
    dataIndex: 'diesel',
    key: 'diesel',
    width: 120,
  },
  {
    title: 'Penalty',
    dataIndex: 'penalty',
    key: 'penalty',
    width: 120,
  },

  {
    title: 'Loan',
    dataIndex: 'loan',
    key: 'loan',
    width: 120,
  },

  {
    title: 'Payable Salary',
    dataIndex: 'payable_Salary',
    key: 'payable_Salary',
    width: 150,
  },
  {
    title: 'Total Deduction',
    dataIndex: 'total_Deduction',
    key: 'total_Deduction',
    width: 150,
  },
]

const SamplePage = () => {
  return <TableList columns={columns} />
}

export default SamplePage
