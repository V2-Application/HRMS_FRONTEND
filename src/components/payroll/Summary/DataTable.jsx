// import React, { useRef, useState } from 'react'
// import { Input, Button, Space, Table } from 'antd'
// import { SearchOutlined } from '@ant-design/icons'
// import Highlighter from 'react-highlight-words'
// import FilterDropdown from './FilterDropdown'

// const DataTable = ({ data }) => {
//   const [locationFilterValues, setLocationFilterValues] = useState([])
//   const [storeCodeFilterValues, setStoreCodeFilterValues] = useState([])
//   const [monthYearFilterValues, setMonthYearFilterValues] = useState([])

//   // ✅ Control pagination via state so pageSize changes take effect
//   const [pagination, setPagination] = useState({
//     current: 1,
//     pageSize: 100,
//     showSizeChanger: true,
//     pageSizeOptions: ['50', '100', '200'],
//   })

//   const handleTableChange = (pag, filters, sorter, extra) => {
//     setPagination((prev) => ({ ...prev, ...pag }))
//   }

//   const columns = [
//     {
//       title: 'St Code',
//       dataIndex: 'location_Code',
//       key: 'location_Code',
//       width: 90,
//       ellipsis: true,
//       render: (text) => <a>{text}</a>,
//       filteredValue: storeCodeFilterValues.length ? storeCodeFilterValues : [],
//       onFilter: (value, record) => storeCodeFilterValues.includes(record?.location_Code),
//       filterDropdown: ({ confirm }) => (
//         <FilterDropdown
//           title="Store Code"
//           dataIndex="location_Code"
//           dataList={[...new Set(data.map((item) => item?.location_Code))]}
//           filterValues={storeCodeFilterValues}
//           setFilterValues={setStoreCodeFilterValues}
//           confirm={confirm}
//         />
//       ),
//     },
//     {
//       title: 'St Name',
//       dataIndex: 'location_Name',
//       key: 'location_Name',
//       render: (text) => <a>{text}</a>,
//       width: 90,
//       ellipsis: true,
//       filteredValue: locationFilterValues.length ? locationFilterValues : [],
//       onFilter: (value, record) => locationFilterValues.includes(record?.location_Name),
//       filterDropdown: ({ confirm }) => (
//         <FilterDropdown
//           title="Store Name"
//           dataIndex="location_Name"
//           dataList={[...new Set(data.map((item) => item?.location_Name))]}
//           filterValues={locationFilterValues}
//           setFilterValues={setLocationFilterValues}
//           confirm={confirm}
//         />
//       ),
//     },
//     {
//       title: 'Emp Code',
//       dataIndex: 'ecode',
//       key: 'ecode',
//       width: 100,
//       ellipsis: true,
//     },
//     {
//       title: 'Emp Name',
//       dataIndex: 'employee_Name',
//       key: 'employee_Name',
//       width: 120,
//       ellipsis: true,
//     },
//     {
//       title: 'Month-Year',
//       dataIndex: 'month_Year',
//       key: 'month_Year',
//       width: 100,
//       ellipsis: true,
//       filteredValue: monthYearFilterValues.length ? monthYearFilterValues : null,
//       onFilter: (value, record) => monthYearFilterValues?.includes(record?.month_Year),
//       filterDropdown: ({ confirm }) => (
//         <FilterDropdown
//           title="Month-Year"
//           dataIndex="month_Year"
//           dataList={[...new Set(data.map((item) => item?.month_Year))]}
//           filterValues={monthYearFilterValues}
//           setFilterValues={setMonthYearFilterValues}
//           confirm={confirm}
//         />
//       ),
//     },
//     {
//       title: 'Payable Salary',
//       dataIndex: 'payableSalary',
//       key: 'payableSalary',
//       sorter: (a, b) => a.payableSalary - b.payableSalary,
//       width: 120,
//       ellipsis: true,
//     },
//     {
//       title: 'Given to Bank',
//       dataIndex: 'givenToBankAmount',
//       key: 'givenToBankAmount',
//       sorter: (a, b) => a.givenToBankAmount - b.givenToBankAmount,
//       width: 120,
//       ellipsis: true,
//     },
//     {
//       title: 'Paid By Bank',
//       dataIndex: 'paidByBankAmount',
//       key: 'paidByBankAmount',
//       sorter: (a, b) => a.paidByBankAmount - b.paidByBankAmount,
//       width: 120,
//       ellipsis: true,
//     },
//     {
//       title: 'Return By Bank',
//       dataIndex: 'returnByBankAmount',
//       key: 'returnByBankAmount',
//       sorter: (a, b) => a.returnByBankAmount - b.returnByBankAmount,
//       width: 120,
//       ellipsis: true,
//     },
//     {
//       title: 'Difference',
//       dataIndex: 'difference',
//       key: 'difference',
//       sorter: (a, b) => a.difference - b.difference,
//       width: 100,
//       ellipsis: true,
//     },
//   ]

//   const totalWidth = columns.reduce((acc, col) => acc + (col.width || 150), 0)

//   return (
//     <Table
//       columns={columns}
//       dataSource={data}
//       scroll={{ y: 'calc(100vh - 200px)', x: totalWidth }}
//       pagination={{
//         // ...pagination,
//         // onShowSizeChange: (current, pageSize) =>
//         //   setPagination((prev) => ({ ...prev, current: 1, pageSize })),
//         // showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
//         pageSize: 100,
//       }}
//       onChange={handleTableChange} // 👈 keeps pagination state in sync (page/pageSize)
//       rowKey={(row) => row.id ?? `${row.ecode}-${row.month_Year}-${row.location_Code}`}
//     />
//   )
// }

// export default DataTable



import React, { useRef, useState } from 'react'
import { Input, Button, Space, Table } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import Highlighter from 'react-highlight-words'
import FilterDropdown from './FilterDropdown'

const DataTable = ({ data }) => {
  const [locationFilterValues, setLocationFilterValues] = useState([])
  const [storeCodeFilterValues, setStoreCodeFilterValues] = useState([])
  const [monthYearFilterValues, setMonthYearFilterValues] = useState([])

  const columns = [
    {
      title: 'St Code',
      dataIndex: 'location_Code',
      key: 'location_Code',
      width: 90,
      ellipsis: true,
      render: (text) => <a>{text}</a>,
      filteredValue: storeCodeFilterValues.length ? storeCodeFilterValues : [],
      onFilter: (value, record) => storeCodeFilterValues.includes(record?.location_Code),
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Store Code"
          dataIndex="location_Code"
          dataList={[...new Set(data.map((item) => item?.location_Code))]}
          filterValues={storeCodeFilterValues}
          setFilterValues={setStoreCodeFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'St Name',
      dataIndex: 'location_Name',
      key: 'location_Name',
      width: 90,
      ellipsis: true,
      filteredValue: locationFilterValues.length ? locationFilterValues : [],
      onFilter: (value, record) => locationFilterValues.includes(record?.location_Name),
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Store Name"
          dataIndex="location_Name"
          dataList={[...new Set(data.map((item) => item?.location_Name))]}
          filterValues={locationFilterValues}
          setFilterValues={setLocationFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Emp Code',
      dataIndex: 'ecode',
      key: 'ecode',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Emp Name',
      dataIndex: 'employee_Name',
      key: 'employee_Name',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Month-Year',
      dataIndex: 'month_Year',
      key: 'month_Year',
      width: 100,
      ellipsis: true,
      filteredValue: monthYearFilterValues.length ? monthYearFilterValues : null,
      onFilter: (value, record) => monthYearFilterValues.includes(record?.month_Year),
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Month-Year"
          dataIndex="month_Year"
          dataList={[...new Set(data.map((item) => item?.month_Year))]}
          filterValues={monthYearFilterValues}
          setFilterValues={setMonthYearFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Payable Salary',
      dataIndex: 'payableSalary',
      key: 'payableSalary',
      sorter: (a, b) => a.payableSalary - b.payableSalary,
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Given to Bank',
      dataIndex: 'givenToBankAmount',
      key: 'givenToBankAmount',
      sorter: (a, b) => a.givenToBankAmount - b.givenToBankAmount,
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Paid By Bank',
      dataIndex: 'paidByBankAmount',
      key: 'paidByBankAmount',
      sorter: (a, b) => a.paidByBankAmount - b.paidByBankAmount,
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Return By Bank',
      dataIndex: 'returnByBankAmount',
      key: 'returnByBankAmount',
      sorter: (a, b) => a.returnByBankAmount - b.returnByBankAmount,
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Difference',
      dataIndex: 'difference',
      key: 'difference',
      sorter: (a, b) => a.difference - b.difference,
      width: 100,
      ellipsis: true,
    },
  ]

  const totalWidth = columns.reduce((acc, col) => acc + (col.width || 150), 0)

  return (
    <Table
      columns={columns}
      dataSource={data}
      scroll={{ y: 'calc(100vh - 200px)', x: totalWidth }}
      pagination={false}  
      rowKey={(row) => row.id ?? `${row.ecode}-${row.month_Year}-${row.location_Code}`}
    />
  )
}

export default DataTable
