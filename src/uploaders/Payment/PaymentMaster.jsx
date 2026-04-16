// import React, { useEffect, useState, useCallback } from 'react'
// import { Space, Table, Input, Tooltip, Button, message, Checkbox } from 'antd'
// import { ExportOutlined, UploadOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
// import { ToastContainer } from 'react-toastify'
// import { useDispatch, useSelector } from 'react-redux'
// import { fetchPaymentMaster } from '../../services/Services'
// import { set } from '../../redux/uiSlice'
// import PaymentUploader from './PaymentUploader'
// import Pageheading from '../../components/shared/Pageheading'
// import { exportExcelFromFrontend } from '../../components/shared/ExportExceFromFrontend'
// import useMediaQuery from '../../hooks/useMediaQuery'

// const { Search } = Input

// const FilterDropdown = ({ dataIndex, dataList, filterValues, setFilterValues, confirm, title }) => {
//   const [searchText, setSearchText] = useState('')
//   const [selectedOptions, setSelectedOptions] = useState(filterValues || [])

//   const filteredOptions = dataList.filter((item) =>
//     item.toLowerCase().includes(searchText.toLowerCase()),
//   )

//   const handleChange = (checkedValues) => {
//     setSelectedOptions(checkedValues)
//   }

//   const handleFilter = () => {
//     setFilterValues(selectedOptions)
//     confirm()
//   }

//   const handleReset = () => {
//     setSelectedOptions([])
//     setFilterValues([])
//     setSearchText('')
//     confirm()
//   }

//   return (
//     <div style={{ padding: 8, width: 215 }}>
//       <Input
//         placeholder={`Search ${title}`}
//         value={searchText}
//         onChange={(e) => setSearchText(e.target.value)}
//         style={{ marginBottom: 8, display: 'block' }}
//       />

//       <div style={{ maxHeight: 150, overflowY: 'auto', paddingRight: 8 }}>
//         <Checkbox.Group
//           value={selectedOptions}
//           onChange={handleChange}
//           style={{ display: 'flex', flexDirection: 'column' }}
//         >
//           {filteredOptions.map((value) => (
//             <Checkbox key={value} value={value}>
//               {value}
//             </Checkbox>
//           ))}
//         </Checkbox.Group>
//       </div>

//       <Space style={{ marginTop: 8 }}>
//         <Button type="primary" size="small" onClick={handleFilter}>
//           Filter
//         </Button>
//         <Button size="small" onClick={handleReset}>
//           Reset
//         </Button>
//       </Space>
//     </div>
//   )
// }

// const PaymentMaster = () => {
//   const [employeesListData, setEmployeesListData] = useState([])
//   const [filteredData, setFilteredData] = useState([])
//   const [currentPage, setCurrentPage] = useState(1)
//   const [pageSize, setPageSize] = useState('100')
//   const [totalCount, setTotalCount] = useState(0)
//   const [search, setSearch] = useState('')
//   const dispatch = useDispatch()
//   const { theme } = useSelector((state) => state.ui)
//   const [lodingLocal, setlodingLocal] = useState(false)

//   const isMobile = useMediaQuery('(max-width: 768px)')
//   const [expandedCards, setExpandedCards] = useState({})

//   const [empCodeFilterValues, setEmpCodeFilterValues] = useState([])

//   const handleToggleCard = useCallback((id) => {
//     setExpandedCards((prev) => ({
//       ...prev,
//       [id]: !prev[id],
//     }))
//   }, [])

//   const handleTableChange = (page, newPageSize) => {
//     setCurrentPage(page)
//     setPageSize(newPageSize)
//   }

//   const fetchData = async () => {
//     dispatch(set({ loading: true }))
//     try {
//       const response = await fetchPaymentMaster()

//       if (response.status === 200) {
//         setTotalCount(response?.data?.data?.length)
//         setEmployeesListData(response?.data?.data)
//       } else {
//         setEmployeesListData([])
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error.response?.data || error.message || error)
//     } finally {
//       dispatch(set({ loading: false }))
//     }
//   }

//   useEffect(() => {
//     fetchData()
//   }, [])

//   useEffect(() => {
//     const new_search = search?.trim().toLowerCase()

//     if (new_search.length > 0) {
//       const new_data =
//         employeesListData.filter((dt) =>
//           Object.values(dt).some((val) => String(val).toLowerCase().includes(new_search)),
//         ) || []

//       setTotalCount(new_data.length)
//       setFilteredData(new_data)
//     } else {
//       setTotalCount(employeesListData.length)
//       setFilteredData(employeesListData)
//     }
//   }, [search, employeesListData])

//   // ✅ Mobile expanded row render
//   const expandedRowRender = (record) => (
//     <div style={{ padding: 12, background: '#fafafa', fontSize: 11 }}>
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
//         <div>
//           <div
//             style={{
//               color: '#666',
//               fontSize: 10,
//               fontWeight: 500,
//               marginBottom: 2,
//               textAlign: 'center',
//             }}
//           >
//             Incentive
//           </div>
//           <div style={{ fontWeight: 500, fontSize: 11, textAlign: 'center' }}>
//             ₹{Number(record.incentive || 0).toLocaleString()}
//           </div>
//         </div>
//         <div>
//           <div
//             style={{
//               color: '#666',
//               fontSize: 10,
//               fontWeight: 500,
//               marginBottom: 2,
//               textAlign: 'center',
//             }}
//           >
//             Arrears
//           </div>
//           <div style={{ fontWeight: 500, fontSize: 11, textAlign: 'center' }}>
//             ₹{Number(record.arrear || 0).toLocaleString()}
//           </div>
//         </div>
//         <div>
//           <div
//             style={{
//               color: '#666',
//               fontSize: 10,
//               fontWeight: 500,
//               marginBottom: 2,
//               textAlign: 'center',
//             }}
//           >
//             Overtime
//           </div>
//           <div style={{ fontWeight: 500, fontSize: 11, textAlign: 'center' }}>
//             ₹{Number(record.overtime || 0).toLocaleString()}
//           </div>
//         </div>
//         <div>
//           <div
//             style={{
//               color: '#666',
//               fontSize: 10,
//               fontWeight: 500,
//               marginBottom: 2,
//               textAlign: 'center',
//             }}
//           >
//             Fooding
//           </div>
//           <div style={{ fontWeight: 500, fontSize: 11, textAlign: 'center' }}>
//             ₹{Number(record.fooding_Allowance || 0).toLocaleString()}
//           </div>
//         </div>
//         <div>
//           <div
//             style={{
//               color: '#666',
//               fontSize: 10,
//               fontWeight: 500,
//               marginBottom: 2,
//               textAlign: 'center',
//             }}
//           >
//             Mobile
//           </div>
//           <div style={{ fontWeight: 500, fontSize: 11, textAlign: 'center' }}>
//             ₹{Number(record.mobile_Bill || 0).toLocaleString()}
//           </div>
//         </div>
//       </div>
//     </div>
//   )

//   // ✅ Mobile columns
//   const getMobileColumns = () => [
//     {
//       title: 'E-Code',
//       dataIndex: 'e_CODE',
//       width: 70,
//       render: (text) => <div style={{ fontSize: 11, fontWeight: 500 }}>{text || '-'}</div>,
//     },
//     {
//       title: 'Month',
//       dataIndex: 'month',
//       width: 80,
//       render: (text) => <div style={{ fontSize: 11, fontWeight: 500 }}>{text || '-'}</div>,
//     },
//     {
//       title: 'Total',
//       width: 80,
//       render: (_, record) => {
//         const total =
//           (Number(record.incentive) || 0) +
//           (Number(record.arrear) || 0) +
//           (Number(record.overtime) || 0) +
//           (Number(record.fooding_Allowance) || 0) +
//           (Number(record.mobile_Bill) || 0)
//         return (
//           <div style={{ fontSize: 11, fontWeight: 600, color: '#52c41a' }}>
//             ₹{total.toLocaleString()}
//           </div>
//         )
//       },
//     },
//     {
//       title: '',
//       key: 'action',
//       width: 40,
//       render: (_, record, index) => {
//         const uniqueKey = record.storeBudgetId || record.e_CODE || `row_${index}`
//         return (
//           <Button
//             type="text"
//             size="small"
//             icon={
//               expandedCards[uniqueKey] ? (
//                 <MinusOutlined style={{ fontSize: 12 }} />
//               ) : (
//                 <PlusOutlined style={{ fontSize: 12 }} />
//               )
//             }
//             onClick={(e) => {
//               e.stopPropagation()
//               handleToggleCard(uniqueKey)
//             }}
//             style={{ padding: '4px' }}
//           />
//         )
//       },
//     },
//   ]

//   const desktopColumns = [
//     {
//       title: 'Emp Code',
//       dataIndex: 'e_CODE',
//       key: 'e_CODE',
//       ellipsis: true,
//       width: 125,
//       filteredValue: empCodeFilterValues.length ? empCodeFilterValues.length : null,
//       onFilter: (value, record) => empCodeFilterValues.includes(record?.e_CODE),
//       filterDropdown: ({ confirm }) => (
//         <FilterDropdown
//           title={'Emp Code'}
//           dataIndex={'e_CODE'}
//           dataList={[...new Set(employeesListData?.map((item) => item?.e_CODE))]}
//           filterValues={empCodeFilterValues}
//           setFilterValues={setEmpCodeFilterValues}
//           confirm={confirm}
//         />
//       ),
//     },
//     {
//       title: 'Month',
//       dataIndex: 'month',
//       key: 'month',
//       width: 100,
//       ellipsis: true,
//     },
//     {
//       title: 'Incentive',
//       dataIndex: 'incentive',
//       key: 'incentive',
//       width: 90,
//       ellipsis: true,
//     },
//     {
//       title: 'Arrers',
//       dataIndex: 'arrear',
//       key: 'arrear',
//       width: 90,
//       ellipsis: true,
//     },
//     {
//       title: 'Overtime',
//       dataIndex: 'overtime',
//       key: 'overtime',
//       width: 90,
//       ellipsis: true,
//     },
//     {
//       title: 'Fooding Allowance',
//       dataIndex: 'fooding_Allowance',
//       key: 'fooding_Allowance',
//       width: 140,
//       ellipsis: true,
//     },
//     {
//       title: 'Bonus',
//       dataIndex: 'bonus',
//       key: 'bonus',
//       width: 90,
//       ellipsis: true,
//     },
//     {
//       title: 'Mobile Bill',
//       dataIndex: 'mobile_Bill',
//       key: 'mobile_Bill',
//       width: 100,
//       ellipsis: true,
//     },
//   ]

//   const columns = isMobile ? getMobileColumns() : desktopColumns
//   const totalWidth = desktopColumns.reduce((sum, col) => sum + (col.width || 150), 0)

//   const handleSearch = (e) => {
//     setSearch(e.target.value)
//   }

//   return (
//     <>
//       <Pageheading title="Additional Payment Uploader" />
//       <ToastContainer
//         position="top-right"
//         autoClose={2000}
//         hideProgressBar={false}
//         closeOnClick
//         pauseOnHover
//         draggable
//       />
//       <div className="def" style={{ paddingBottom: 10 }}>
//         <TableBulkActionIcons
//           totalRecords={totalCount}
//           handleSearch={handleSearch}
//           lodingLocal={lodingLocal}
//           setlodingLocal={setlodingLocal}
//           refreshData={fetchData}
//           filteredData={filteredData}
//           isMobile={isMobile}
//         />

//         {isMobile ? (
//           <Table
//             rowKey={(r, i) => r?.storeBudgetId || r?.e_CODE || `row_${i}`}
//             columns={columns}
//             dataSource={filteredData}
//             bordered
//             size="small"
//             pagination={{
//               current: currentPage,
//               position: ['bottomRight'],
//               total: totalCount,
//               pageSize,
//               showSizeChanger: true,
//               pageSizeOptions: ['10', '20', '50', '100'],
//               onChange: handleTableChange,
//             }}
//             expandable={{
//               expandedRowKeys: Object.keys(expandedCards)
//                 .filter((key) => expandedCards[key])
//                 .map((key) => (isNaN(key) ? key : parseInt(key))),
//               expandedRowRender: expandedRowRender,
//               showExpandColumn: false,
//             }}
//             className={theme === 'dark' ? 'dark-theme' : ''}
//           />
//         ) : (
//           <Table
//             rowKey="storeBudgetId"
//             columns={columns}
//             pagination={{
//               current: currentPage,
//               position: ['bottomRight'],
//               total: totalCount,
//               pageSize: pageSize,
//               showSizeChanger: true,
//               pageSizeOptions: ['10', '20', '50', '100'],
//               onChange: handleTableChange,
//             }}
//             dataSource={filteredData}
//             bordered={true}
//             scroll={{ x: totalWidth, y: 'calc(100vh - 160px)' }}
//             style={{ whiteSpace: 'nowrap' }}
//             className={theme === 'dark' ? 'dark-theme' : ''}
//           />
//         )}
//       </div>
//     </>
//   )
// }

// const TableBulkActionIcons = ({
//   totalRecords,
//   selectedRowKeys,
//   handleSearch,
//   search,
//   refreshData,
//   lodingLocal,
//   setlodingLocal,
//   filteredData,
//   isMobile,
// }) => {
//   const { theme } = useSelector((state) => state.ui)
//   const [isEmpUploadVisible, setIsEmpUploadVisible] = useState(false)

//   const [statusSummary, setstatusSummary] = useState([
//     {
//       name: 'Total Rows',
//       label: 'Pending Interview Schedule',
//       count: 0,
//       color: 'green',
//       id: [1, 2, 3, 4, 5],
//     },
//     { name: 'Selected Rows', label: 'Rejected', count: 0, color: 'blue', id: [7] },
//   ])

//   useEffect(() => {
//     setstatusSummary([
//       {
//         name: 'Total Rows',
//         label: 'Pending Interview Schedule',
//         count: totalRecords,
//         color: 'green',
//         id: [1, 2, 3, 4, 5],
//       },
//     ])
//   }, [selectedRowKeys, totalRecords])

//   const downloadDataInExcel = () => {
//     const columns = [
//       { header: 'Emp Code', key: 'e_CODE' },
//       { header: 'Month', key: 'month' },
//       { header: 'Incentive', key: 'incentive' },
//       { header: 'Arrers', key: 'arrear' },
//       { header: 'Overtime', key: 'overtime' },
//       { header: 'Fooding Allowance', key: 'fooding_Allowance' },
//       { header: 'Bonus', key: 'bonus' },
//       { header: 'Mobile Bill', key: 'mobile_Bill' },
//     ]

//     setlodingLocal(true)

//     const response = exportExcelFromFrontend(columns, filteredData, 'PaymentMaster.xlsx')

//     if (response.success) {
//       message.success(response.message)
//     } else {
//       message.error(response.message)
//     }

//     setlodingLocal(false)
//   }

//   return (
//     <>
//       {isEmpUploadVisible && (
//         <PaymentUploader
//           isVisible={isEmpUploadVisible}
//           setIsVisible={setIsEmpUploadVisible}
//           refreshData={refreshData}
//         />
//       )}
//       <div
//         style={{
//           padding: 6,
//           display: 'flex',
//           flexWrap: 'wrap',
//           gap: 10,
//           alignItems: isMobile ? 'stretch' : 'center',
//           justifyContent: 'space-between',
//           marginBottom: 6,
//         }}
//       >
//         <div
//           style={{
//             display: 'flex',
//             flexWrap: 'wrap',
//             gap: 8,
//             flex: isMobile ? '1 1 100%' : '0 1 auto',
//           }}
//         >
//           {statusSummary.map(({ name, label, count, color, id }, index) => (
//             <div
//               key={index}
//               style={{
//                 border: '2px solid #ccc',
//                 padding: 4,
//                 borderRadius: 10,
//                 display: 'flex',
//                 justifyContent: 'center',
//                 minWidth: 120,
//                 maxWidth: 160,
//               }}
//               className={theme === 'dark' ? 'dark-theme' : ''}
//             >
//               {name === 'Total Rows' || name === 'Selected Rows' ? (
//                 <span
//                   style={{
//                     display: 'inline-block',
//                     width: '100%',
//                     overflow: 'hidden',
//                     whiteSpace: 'nowrap',
//                     textOverflow: 'ellipsis',
//                     fontSize: 12,
//                     padding: '0 8px',
//                     textAlign: 'center',
//                   }}
//                 >
//                   {count} {name}
//                 </span>
//               ) : (
//                 <Tooltip placement="top" title={label}>
//                   <span
//                     style={{
//                       display: 'inline-block',
//                       width: '100%',
//                       overflow: 'hidden',
//                       whiteSpace: 'nowrap',
//                       textOverflow: 'ellipsis',
//                       fontSize: 12,
//                       padding: '0 8px',
//                       textAlign: 'center',
//                     }}
//                   >
//                     {count} {name}
//                   </span>
//                 </Tooltip>
//               )}
//             </div>
//           ))}
//         </div>

//         <div
//           style={{
//             display: 'flex',
//             flexWrap: 'wrap',
//             gap: 8,
//             alignItems: 'center',
//             flex: isMobile ? '1 1 100%' : '0 1 auto',
//           }}
//         >
//           <Tooltip placement="top" title="Upload Employees">
//             <Button onClick={() => setIsEmpUploadVisible(true)}>
//               <UploadOutlined />
//             </Button>
//           </Tooltip>

//           <Tooltip placement="top" title="Export">
//             <Button loading={lodingLocal} onClick={downloadDataInExcel}>
//               <ExportOutlined />
//             </Button>
//           </Tooltip>

//           <Search
//             placeholder="Search in table..."
//             allowClear
//             onChange={handleSearch}
//             style={{ width: isMobile ? 150 : 300 }}
//             value={search}
//           />
//         </div>
//       </div>
//     </>
//   )
// }

// export default PaymentMaster


import React, { useEffect, useState, useCallback } from 'react'
import { Space, Table, Input, Tooltip, Button, message, Checkbox } from 'antd'
import { ExportOutlined, UploadOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPaymentMaster } from '../../services/Services'
import { set } from '../../redux/uiSlice'
import PaymentUploader from './PaymentUploader'
import Pageheading from '../../components/shared/Pageheading'
import { exportExcelFromFrontend } from '../../components/shared/ExportExceFromFrontend'
import useMediaQuery from '../../hooks/useMediaQuery'

const { Search } = Input

// ✅ No library required: strict month normalizer (prevents NOV-25 → NOV-26)
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

const excelSerialToDate = (serial) => {
  const ms = Math.round((Number(serial) - 25569) * 86400 * 1000)
  return new Date(ms)
}

const normalizeMonth = (value) => {
  if (value === null || value === undefined || value === '') return '-'

  if (value instanceof Date && !isNaN(value.getTime())) {
    const mon = MONTHS[value.getMonth()]
    const yy = String(value.getFullYear()).slice(-2)
    return `${mon}-${yy}`
  }

  if (typeof value === 'number' && isFinite(value)) {
    const d = excelSerialToDate(value)
    if (!isNaN(d.getTime())) {
      const mon = MONTHS[d.getMonth()]
      const yy = String(d.getFullYear()).slice(-2)
      return `${mon}-${yy}`
    }
    return String(value)
  }

  const str = String(value).trim().toUpperCase()
  const m = str.match(/^([A-Z]{3})[-/ ]?(\d{2}|\d{4})$/)
  if (m) {
    const mon = m[1]
    const yearRaw = m[2]
    if (!MONTHS.includes(mon)) return str
    const yy = yearRaw.length === 4 ? yearRaw.slice(-2) : yearRaw
    return `${mon}-${yy}`
  }

  return str
}

const FilterDropdown = ({ dataList, filterValues, setFilterValues, confirm, title }) => {
  const [searchText, setSearchText] = useState('')
  const [selectedOptions, setSelectedOptions] = useState(filterValues || [])

  const filteredOptions = (dataList || []).filter((item) =>
    String(item || '').toLowerCase().includes(searchText.toLowerCase()),
  )

  const handleFilter = () => {
    setFilterValues(selectedOptions)
    confirm()
  }

  const handleReset = () => {
    setSelectedOptions([])
    setFilterValues([])
    setSearchText('')
    confirm()
  }

  return (
    <div style={{ padding: 8, width: 215 }}>
      <Input
        placeholder={`Search ${title}`}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 8, display: 'block' }}
      />

      <div style={{ maxHeight: 150, overflowY: 'auto', paddingRight: 8 }}>
        <Checkbox.Group
          value={selectedOptions}
          onChange={(checkedValues) => setSelectedOptions(checkedValues)}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          {filteredOptions.map((value) => (
            <Checkbox key={value} value={value}>
              {value}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>

      <Space style={{ marginTop: 8 }}>
        <Button type="primary" size="small" onClick={handleFilter}>
          Filter
        </Button>
        <Button size="small" onClick={handleReset}>
          Reset
        </Button>
      </Space>
    </div>
  )
}

const PaymentMaster = () => {
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)
  const [lodingLocal, setlodingLocal] = useState(false)

  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  const [empCodeFilterValues, setEmpCodeFilterValues] = useState([])

  const handleToggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchPaymentMaster()
      if (response.status === 200) {
        const rows = response?.data?.data || []
        setTotalCount(rows.length)
        setEmployeesListData(rows)
      } else {
        setEmployeesListData([])
      }
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message || error)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const new_search = search?.trim().toLowerCase()

    if (new_search.length > 0) {
      const new_data =
        employeesListData.filter((dt) =>
          Object.values(dt).some((val) => String(val).toLowerCase().includes(new_search)),
        ) || []
      setTotalCount(new_data.length)
      setFilteredData(new_data)
    } else {
      setTotalCount(employeesListData.length)
      setFilteredData(employeesListData)
    }
  }, [search, employeesListData])

  const expandedRowRender = (record) => (
    <div style={{ padding: 12, background: '#fafafa', fontSize: 11 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
        {[
          ['Incentive', record.incentive],
          ['Arrears', record.arrear],
          ['Overtime', record.overtime],
          ['Fooding', record.fooding_Allowance],
          ['Mobile', record.mobile_Bill],
        ].map(([label, val]) => (
          <div key={label}>
            <div
              style={{
                color: '#666',
                fontSize: 10,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              {label}
            </div>
            <div style={{ fontWeight: 500, fontSize: 11, textAlign: 'center' }}>
              ₹{Number(val || 0).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const getMobileColumns = () => [
    {
      title: 'E-Code',
      dataIndex: 'e_CODE',
      width: 70,
      render: (text) => <div style={{ fontSize: 11, fontWeight: 500 }}>{text || '-'}</div>,
    },
    {
      title: 'Month',
      dataIndex: 'month',
      width: 80,
      render: (text) => (
        <div style={{ fontSize: 11, fontWeight: 500 }}>{normalizeMonth(text)}</div>
      ),
    },
    {
      title: 'Total',
      width: 80,
      render: (_, record) => {
        const total =
          (Number(record.incentive) || 0) +
          (Number(record.arrear) || 0) +
          (Number(record.overtime) || 0) +
          (Number(record.fooding_Allowance) || 0) +
          (Number(record.mobile_Bill) || 0)
        return (
          <div style={{ fontSize: 11, fontWeight: 600, color: '#52c41a' }}>
            ₹{total.toLocaleString()}
          </div>
        )
      },
    },
    {
      title: '',
      key: 'action',
      width: 40,
      render: (_, record, index) => {
        const uniqueKey = record.storeBudgetId || record.e_CODE || `row_${index}`
        return (
          <Button
            type="text"
            size="small"
            icon={
              expandedCards[uniqueKey] ? (
                <MinusOutlined style={{ fontSize: 12 }} />
              ) : (
                <PlusOutlined style={{ fontSize: 12 }} />
              )
            }
            onClick={(e) => {
              e.stopPropagation()
              handleToggleCard(uniqueKey)
            }}
            style={{ padding: '4px' }}
          />
        )
      },
    },
  ]

  const desktopColumns = [
    {
      title: 'Emp Code',
      dataIndex: 'e_CODE',
      key: 'e_CODE',
      ellipsis: true,
      width: 125,
      filteredValue: empCodeFilterValues.length ? empCodeFilterValues : null,
      onFilter: (_, record) => empCodeFilterValues.includes(record?.e_CODE),
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title={'Emp Code'}
          dataList={[
            ...new Set((employeesListData || []).map((item) => item?.e_CODE).filter(Boolean)),
          ]}
          filterValues={empCodeFilterValues}
          setFilterValues={setEmpCodeFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
      width: 100,
      ellipsis: true,
      render: (text) => normalizeMonth(text),
    },
    { title: 'Incentive', dataIndex: 'incentive', key: 'incentive', width: 90, ellipsis: true },
    { title: 'Arrers', dataIndex: 'arrear', key: 'arrear', width: 90, ellipsis: true },
    { title: 'Overtime', dataIndex: 'overtime', key: 'overtime', width: 90, ellipsis: true },
    {
      title: 'Fooding Allowance',
      dataIndex: 'fooding_Allowance',
      key: 'fooding_Allowance',
      width: 140,
      ellipsis: true,
    },
    { title: 'Bonus', dataIndex: 'bonus', key: 'bonus', width: 90, ellipsis: true },
    { title: 'Mobile Bill', dataIndex: 'mobile_Bill', key: 'mobile_Bill', width: 100, ellipsis: true },
  ]

  const columns = isMobile ? getMobileColumns() : desktopColumns
  const totalWidth = desktopColumns.reduce((sum, col) => sum + (col.width || 150), 0)

  const handleSearch = (e) => setSearch(e.target.value)

  return (
    <>
      <Pageheading title="Additional Payment Uploader" />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      <div className="def" style={{ paddingBottom: 10 }}>
        <TableBulkActionIcons
          totalRecords={totalCount}
          handleSearch={handleSearch}
          lodingLocal={lodingLocal}
          setlodingLocal={setlodingLocal}
          refreshData={fetchData}
          filteredData={filteredData}
          isMobile={isMobile}
        />

        {isMobile ? (
          <Table
            rowKey={(r, i) => r?.storeBudgetId || r?.e_CODE || `row_${i}`}
            columns={columns}
            dataSource={filteredData}
            bordered
            size="small"
            pagination={{
              current: currentPage,
              position: ['bottomRight'],
              total: totalCount,
              pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: handleTableChange,
            }}
            expandable={{
              expandedRowKeys: Object.keys(expandedCards)
                .filter((key) => expandedCards[key])
                .map((key) => (isNaN(key) ? key : parseInt(key))),
              expandedRowRender,
              showExpandColumn: false,
            }}
            className={theme === 'dark' ? 'dark-theme' : ''}
          />
        ) : (
          <Table
            rowKey="storeBudgetId"
            columns={columns}
            pagination={{
              current: currentPage,
              position: ['bottomRight'],
              total: totalCount,
              pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: handleTableChange,
            }}
            dataSource={filteredData}
            bordered
            scroll={{ x: totalWidth, y: 'calc(100vh - 160px)' }}
            style={{ whiteSpace: 'nowrap' }}
            className={theme === 'dark' ? 'dark-theme' : ''}
          />
        )}
      </div>
    </>
  )
}

const TableBulkActionIcons = ({
  totalRecords,
  selectedRowKeys,
  handleSearch,
  search,
  refreshData,
  lodingLocal,
  setlodingLocal,
  filteredData,
  isMobile,
}) => {
  const { theme } = useSelector((state) => state.ui)
  const [isEmpUploadVisible, setIsEmpUploadVisible] = useState(false)

  const [statusSummary, setstatusSummary] = useState([
    {
      name: 'Total Rows',
      label: 'Pending Interview Schedule',
      count: 0,
      color: 'green',
      id: [1, 2, 3, 4, 5],
    },
  ])

  useEffect(() => {
    setstatusSummary([
      {
        name: 'Total Rows',
        label: 'Pending Interview Schedule',
        count: totalRecords,
        color: 'green',
        id: [1, 2, 3, 4, 5],
      },
    ])
  }, [selectedRowKeys, totalRecords])

  const downloadDataInExcel = () => {
    const columns = [
      { header: 'Emp Code', key: 'e_CODE' },
      { header: 'Month', key: 'month' },
      { header: 'Incentive', key: 'incentive' },
      { header: 'Arrers', key: 'arrear' },
      { header: 'Overtime', key: 'overtime' },
      { header: 'Fooding Allowance', key: 'fooding_Allowance' },
      { header: 'Bonus', key: 'bonus' },
      { header: 'Mobile Bill', key: 'mobile_Bill' },
    ]

    setlodingLocal(true)

    const exportData = (filteredData || []).map((row) => ({
      ...row,
      month: normalizeMonth(row.month),
    }))

    const response = exportExcelFromFrontend(columns, exportData, 'PaymentMaster.xlsx')

    if (response.success) message.success(response.message)
    else message.error(response.message)

    setlodingLocal(false)
  }

  return (
    <>
      {isEmpUploadVisible && (
        <PaymentUploader
          isVisible={isEmpUploadVisible}
          setIsVisible={setIsEmpUploadVisible}
          refreshData={refreshData}
          normalizeMonth={normalizeMonth}
        />
      )}

      <div
        style={{
          padding: 6,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            flex: isMobile ? '1 1 100%' : '0 1 auto',
          }}
        >
          {statusSummary.map(({ name, count }, index) => (
            <div
              key={index}
              style={{
                border: '2px solid #ccc',
                padding: 4,
                borderRadius: 10,
                display: 'flex',
                justifyContent: 'center',
                minWidth: 120,
                maxWidth: 160,
              }}
              className={theme === 'dark' ? 'dark-theme' : ''}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '100%',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  fontSize: 12,
                  padding: '0 8px',
                  textAlign: 'center',
                }}
              >
                {count} {name}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
            flex: isMobile ? '1 1 100%' : '0 1 auto',
          }}
        >
          <Tooltip placement="top" title="Upload Employees">
            <Button onClick={() => setIsEmpUploadVisible(true)}>
              <UploadOutlined />
            </Button>
          </Tooltip>

          <Tooltip placement="top" title="Export">
            <Button loading={lodingLocal} onClick={downloadDataInExcel}>
              <ExportOutlined />
            </Button>
          </Tooltip>

          <Search
            placeholder="Search in table..."
            allowClear
            onChange={handleSearch}
            style={{ width: isMobile ? 150 : 300 }}
            value={search}
          />
        </div>
      </div>
    </>
  )
}

export default PaymentMaster



