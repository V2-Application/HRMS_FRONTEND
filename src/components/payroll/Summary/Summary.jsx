// import React, { useEffect, useState } from 'react'
// import { Grid, message } from 'antd'
// import dayjs from 'dayjs'
// import { useDispatch } from 'react-redux'

// import Filters from './Filters'
// import Card from './Card'
// import DataTable from './DataTable'
// import Pageheading from '../../shared/Pageheading'

// import axiosInstance from '../../../services/axiosInstance'
// import { set } from '../../../redux/uiSlice'

// import styles from './Summary.module.css'
// import CardInRow from '../../shared/CardInRow/CardInRow'

// const { useBreakpoint } = Grid

// // Safely coerce numbers (handles "0", "0.00", null, undefined, comma strings)
// const coerceNumber = (v) => {
//   if (v === null || v === undefined) return 0
//   const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, '').trim())
//   return Number.isFinite(n) ? n : 0
// }

// const Summary = () => {
//   const screens = useBreakpoint()
//   const isMobile = !screens.md

//   const dispatch = useDispatch()
//   const [messageApi, contextHolder] = message.useMessage()

//   const [search, setSearch] = useState('')
//   const [selectedMonth, setSelectedMonth] = useState(dayjs()) // default = current month

//   const [data, setData] = useState([])
//   const [filteredData, setFilteredData] = useState([])
//   console.log('data:', data)
//   console.log('filtereddata:', filteredData)

//   // Cards expect [{label, value}]
//   const [cardData, setCardData] = useState([
//     { label: 'Payable Salary', value: 0 },
//     { label: 'Given To Bank', value: 0 },
//     { label: 'Paid By Bank', value: 0 },
//     { label: 'Return By Bank', value: 0 },
//     { label: 'Difference', value: 0 },
//   ])

//   // Fallback (only used if summary is missing)
//   const buildCardsFromRows = (rows) => {
//     const sum = (key) => rows.reduce((acc, r) => acc + coerceNumber(r[key]), 0)
//     return [
//       { label: 'Payable Salary', value: sum('payableSalary') },
//       { label: 'Given To Bank', value: sum('givenToBankAmount') },
//       { label: 'Paid By Bank', value: sum('paidByBankAmount') },
//       { label: 'Return By Bank', value: sum('returnByBankAmount') },
//       { label: 'Difference', value: sum('difference') },
//     ]
//   }

//   // Fetch payroll summary for the selected month
//   const fetchData = async (monthDayjs) => {
//     try {
//       dispatch(set({ loading: true }))

//       // month as MMM-YY, e.g., "Oct-25"
//       const monthParam = dayjs(monthDayjs).format('MMM-YY')

//       const url = `api/EmpAttendanceViewSnapshot/get-comprehensive-salary-status-list`
//       const response = await axiosInstance.get(url, { params: { month: monthParam } })

//       if (response.status === 200) {
//         const payload = response?.data?.data ?? {}
//         const rows = Array.isArray(payload?.data) ? payload.data : []

//         // console.log("qqqqqq", payload);
//         // Normalize numeric fields for table math/sorting
//         const normalized = rows.map((r) => ({
//           ...r,
//           payableSalary: coerceNumber(r.payableSalary),
//           givenToBankAmount: coerceNumber(r.givenToBankAmount),
//           paidByBankAmount: coerceNumber(r.paidByBankAmount),
//           returnByBankAmount: coerceNumber(r.returnByBankAmount),
//           difference: coerceNumber(r.difference),
//         }))

//         setData(normalized)
//         // setFilteredData(normalized)

//         // Prefer server summary if provided; fallback to computing from rows
//         if (payload?.summary && typeof payload.summary === 'object') {
//           const s = payload.summary
//           setCardData([
//             { label: 'Payable Salary', value: coerceNumber(s.totalPayableSalary) },
//             { label: 'Given To Bank', value: coerceNumber(s.totalGivenToBank) },
//             { label: 'Paid By Bank', value: coerceNumber(s.totalPaidByBank) },
//             { label: 'Return By Bank', value: coerceNumber(s.totalReturnByBank) },
//             { label: 'Difference', value: coerceNumber(s.totalDifference) },
//           ])
//         } else {
//           setCardData(buildCardsFromRows(normalized))
//         }

//         if (response?.data?.message) messageApi.success(response.data.message)
//       } else {
//         messageApi.error(response?.response?.data?.message || 'Failed to fetch data')
//       }
//     } catch (error) {
//       console.error('summary api error: ', error)
//       messageApi.error(error?.response?.data?.message || 'Failed to fetch data')
//     } finally {
//       dispatch(set({ loading: false }))
//     }
//   }

//   // Search filter for table
//   useEffect(() => {
//     let q = search.trim().toLowerCase()
//     if (q) {
//       let filtered = (data || []).filter((row) =>
//         Object.values(row).some((v) => String(v).toLowerCase().trim().includes(q)),
//       )
//       setFilteredData(filtered)
//     } else {
//       setFilteredData(data || [])
//     }
//   }, [search, data])

//   // Hit API on mount and whenever month changes
//   useEffect(() => {
//     fetchData(selectedMonth)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedMonth])

//   return (
//     <>
//       {contextHolder}

//       <div className={styles.pageWrap}>
//         <Pageheading title="Payroll Summary" />

//         {/* Cards */}
//         <section className={styles.cardsSection} aria-label="Summary cards">
//           <CardInRow data={cardData} />
//         </section>

//         {/* Filters (month picker + search) */}
//         <section className={styles.filtersSection} aria-label="Filters">
//           <Filters
//             selectedMonth={selectedMonth}
//             setSelectedMonth={setSelectedMonth}
//             search={search}
//             setSearch={setSearch}
//           />
//         </section>

//         {/* Table */}
//         <section className={styles.tableSection} aria-label="Payroll summary table">
//           <div className={styles.tableContainer}>
//             <DataTable
//               data={filteredData}
//               scroll={{ x: isMobile ? 720 : 'max-content' }}
//               size={isMobile ? 'small' : 'middle'}
//               bordered
//               sticky
//             />
//           </div>
//         </section>
//       </div>
//     </>
//   )
// }

// export default Summary


// import React, { useEffect, useState } from 'react'
// import { Grid, message, Pagination } from 'antd'
// import dayjs from 'dayjs'
// import { useDispatch } from 'react-redux'

// import Filters from './Filters'
// import DataTable from './DataTable'
// import Pageheading from '../../shared/Pageheading'

// import axiosInstance from '../../../services/axiosInstance'
// import { set } from '../../../redux/uiSlice'

// import styles from './Summary.module.css'
// import CardInRow from '../../shared/CardInRow/CardInRow'

// const { useBreakpoint } = Grid

// // Safely coerce numbers (handles "0", "0.00", null, undefined, comma strings)
// const coerceNumber = (v) => {
//   if (v === null || v === undefined) return 0
//   const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, '').trim())
//   return Number.isFinite(n) ? n : 0
// }

// const Summary = () => {
//   const screens = useBreakpoint()
//   const isMobile = !screens.md

//   const dispatch = useDispatch()
//   const [messageApi, contextHolder] = message.useMessage()

//   // 🔍 this will be passed to API as ecode
//   const [search, setSearch] = useState('')
//   const [selectedMonth, setSelectedMonth] = useState(dayjs()) // default = current month

//   const [data, setData] = useState([])

//   // 🔢 server-side pagination state
//   const [pageNumber, setPageNumber] = useState(1)
//   const [pageSize, setPageSize] = useState(100)
//   const [totalRecords, setTotalRecords] = useState(0)

//   // Cards expect [{label, value}]
//   const [cardData, setCardData] = useState([
//     { label: 'Payable Salary', value: 0 },
//     { label: 'Given To Bank', value: 0 },
//     { label: 'Paid By Bank', value: 0 },
//     { label: 'Return By Bank', value: 0 },
//     { label: 'Difference', value: 0 },
//   ])

//   // Fallback (only used if summary is missing)
//   const buildCardsFromRows = (rows) => {
//     const sum = (key) => rows.reduce((acc, r) => acc + coerceNumber(r[key]), 0)
//     return [
//       { label: 'Payable Salary', value: sum('payableSalary') },
//       { label: 'Given To Bank', value: sum('givenToBankAmount') },
//       { label: 'Paid By Bank', value: sum('paidByBankAmount') },
//       { label: 'Return By Bank', value: sum('returnByBankAmount') },
//       { label: 'Difference', value: sum('difference') },
//     ]
//   }

//   // 🔁 Fetch payroll summary for given month + page + size + optional ecode
//   const fetchData = async (monthDayjs, page, size, ecode) => {
//     try {
//       dispatch(set({ loading: true }))

//       const monthParam = dayjs(monthDayjs).format('MMM-YY') // e.g. "Oct-25"
//       const url = `api/EmpAttendanceViewSnapshot/get-comprehensive-salary-status-list`

//       const params = {
//         month: monthParam,
//         pageNumber: page,
//         pageSize: size,
//       }

//       // send ecode to API only if something is entered
//       if (ecode && ecode.trim()) {
//         params.ecode = ecode.trim()
//       }

//       const response = await axiosInstance.get(url, { params })

//       if (response.status === 200) {
//         const payload = response?.data?.data ?? {}

//         // ⚠️ Your API keeps paginated rows under data.pagination.data
//         const pagination = payload.pagination || {}
//         const rows = Array.isArray(pagination.data)
//           ? pagination.data
//           : Array.isArray(payload.data)
//             ? payload.data
//             : []

//         // Normalize numeric fields for table math/sorting
//         const normalized = rows.map((r) => ({
//           ...r,
//           payableSalary: coerceNumber(r.payableSalary),
//           givenToBankAmount: coerceNumber(r.givenToBankAmount),
//           paidByBankAmount: coerceNumber(r.paidByBankAmount),
//           returnByBankAmount: coerceNumber(r.returnByBankAmount),
//           difference: coerceNumber(r.difference),
//         }))

//         setData(normalized)

//         // ✅ use pagination info from API
//         setTotalRecords(
//           typeof pagination.totalRecords === 'number' ? pagination.totalRecords : normalized.length,
//         )

//         // (optional) keep local page/pageSize in sync with API response
//         if (typeof pagination.pageNumber === 'number') {
//           setPageNumber(pagination.pageNumber)
//         }
//         if (typeof pagination.pageSize === 'number') {
//           setPageSize(pagination.pageSize)
//         }

//         // Prefer server summary if provided; fallback to computing from rows
//         if (payload?.summary && typeof payload.summary === 'object') {
//           const s = payload.summary
//           setCardData([
//             { label: 'Payable Salary', value: coerceNumber(s.totalPayableSalary) },
//             { label: 'Given To Bank', value: coerceNumber(s.totalGivenToBank) },
//             { label: 'Paid By Bank', value: coerceNumber(s.totalPaidByBank) },
//             { label: 'Return By Bank', value: coerceNumber(s.totalReturnByBank) },
//             { label: 'Difference', value: coerceNumber(s.totalDifference) },
//           ])
//         } else {
//           setCardData(buildCardsFromRows(normalized))
//         }

//         if (response?.data?.message) messageApi.success(response.data.message)
//       } else {
//         messageApi.error(response?.response?.data?.message || 'Failed to fetch data')
//       }
//     } catch (error) {
//       console.error('summary api error: ', error)
//       messageApi.error(error?.response?.data?.message || 'Failed to fetch data')
//     } finally {
//       dispatch(set({ loading: false }))
//     }
//   }

//   // 🔁 When month or search (ecode) changes, reset to page 1
//   useEffect(() => {
//     setPageNumber(1)
//   }, [selectedMonth, search])

//   // 🔁 Call API whenever month, page, size, or search changes
//   useEffect(() => {
//     fetchData(selectedMonth, pageNumber, pageSize, search)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedMonth, pageNumber, pageSize, search])

//   return (
//     <>
//       {contextHolder}

//       <div className={styles.pageWrap}>
//         <Pageheading title="Payroll Summary" />

//         {/* Cards */}
//         <section className={styles.cardsSection} aria-label="Summary cards">
//           <CardInRow data={cardData} />
//         </section>

//         {/* Filters (month picker + search-as-ecode) */}
//         <section className={styles.filtersSection} aria-label="Filters">
//           <Filters
//             selectedMonth={selectedMonth}
//             setSelectedMonth={setSelectedMonth}
//             search={search}
//             setSearch={setSearch} // passes ecode string to state
//           />
//         </section>

//         {/* Table + Pagination */}
//         <section className={styles.tableSection} aria-label="Payroll summary table">
//           <div className={styles.tableContainer}>
//             <DataTable
//               data={data}
//               scroll={{ x: isMobile ? 720 : 'max-content' }}
//               size={isMobile ? 'small' : 'middle'}
//               bordered
//               sticky
//             />

//             {/* Pagination controls */}
//             <div style={{ marginTop: 16, textAlign: 'right' }}>
//               <Pagination
//                 current={pageNumber}
//                 pageSize={pageSize}
//                 total={totalRecords}
//                 showSizeChanger
//                 pageSizeOptions={['10', '20', '50', '100']}
//                 onChange={(page, size) => {
//                   setPageNumber(page)
//                   setPageSize(size)
//                 }}
//               />
//             </div>
//           </div>
//         </section>
//       </div>
//     </>
//   )
// }

// export default Summary



import React, { useEffect, useState } from 'react'
import { Grid, message, Pagination } from 'antd'
import dayjs from 'dayjs'
import { useDispatch } from 'react-redux'

import Filters from './Filters'
import DataTable from './DataTable'
import Pageheading from '../../shared/Pageheading'

import axiosInstance from '../../../services/axiosInstance'
import { set } from '../../../redux/uiSlice'

import styles from './Summary.module.css'
import CardInRow from '../../shared/CardInRow/CardInRow'

const { useBreakpoint } = Grid

// Safely coerce numbers (handles "0", "0.00", null, undefined, comma strings)
const coerceNumber = (v) => {
  if (v === null || v === undefined) return 0
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, '').trim())
  return Number.isFinite(n) ? n : 0
}

// ⭐ NEW: group same ecode rows and keep latest (by runAt) as parent
const groupByEcodeWithLatest = (rows) => {
  const result = []
  const byEcode = new Map()

  // separate rows that have ecode + runAt and those that don't
  rows.forEach((r) => {
    if (!r.ecode || !r.runAt) {
      result.push(r) // cannot group – push as-is
      return
    }
    if (!byEcode.has(r.ecode)) {
      byEcode.set(r.ecode, [])
    }
    byEcode.get(r.ecode).push(r)
  })

  // for each ecode group, sort by runAt desc and make children
  byEcode.forEach((list) => {
    list.sort(
      (a, b) => dayjs(b.runAt).valueOf() - dayjs(a.runAt).valueOf(), // latest first
    )
    const [latest, ...older] = list
    if (older.length) {
      latest.children = older // antd Table uses "children" for accordion rows
    }
    result.push(latest)
  })

  return result
}

const Summary = () => {
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const dispatch = useDispatch()
  const [messageApi, contextHolder] = message.useMessage()

  // 🔍 this will be passed to API as ecode
  const [search, setSearch] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(dayjs()) // default = current month

  const [data, setData] = useState([])

  // 🔢 server-side pagination state
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [totalRecords, setTotalRecords] = useState(0)

  // Cards expect [{label, value}]
  const [cardData, setCardData] = useState([
    { label: 'Payable Salary', value: 0 },
    { label: 'Given To Bank', value: 0 },
    { label: 'Paid By Bank', value: 0 },
    { label: 'Return By Bank', value: 0 },
    { label: 'Difference', value: 0 },
  ])

  // Fallback (only used if summary is missing)
  const buildCardsFromRows = (rows) => {
    const sum = (key) => rows.reduce((acc, r) => acc + coerceNumber(r[key]), 0)
    return [
      { label: 'Payable Salary', value: sum('payableSalary') },
      { label: 'Given To Bank', value: sum('givenToBankAmount') },
      { label: 'Paid By Bank', value: sum('paidByBankAmount') },
      { label: 'Return By Bank', value: sum('returnByBankAmount') },
      { label: 'Difference', value: sum('difference') },
    ]
  }

  // 🔁 Fetch payroll summary for given month + page + size + optional ecode
  const fetchData = async (monthDayjs, page, size, ecode) => {
    try {
      dispatch(set({ loading: true }))

      const monthParam = dayjs(monthDayjs).format('MMM-YY') // e.g. "Oct-25"
      const url = `api/EmpAttendanceViewSnapshot/get-comprehensive-salary-status-list`

      const params = {
        month: monthParam,
        pageNumber: page,
        pageSize: size,
      }

      // send ecode to API only if something is entered
      if (ecode && ecode.trim()) {
        params.ecode = ecode.trim()
      }

      const response = await axiosInstance.get(url, { params })

      if (response.status === 200) {
        const payload = response?.data?.data ?? {}

        // your API keeps paginated rows under data.pagination.data
        const pagination = payload.pagination || {}
        const rows = Array.isArray(pagination.data)
          ? pagination.data
          : Array.isArray(payload.data)
            ? payload.data
            : []

        // Normalize numeric fields for table math/sorting
        const normalized = rows.map((r) => ({
          ...r,
          payableSalary: coerceNumber(r.payableSalary),
          givenToBankAmount: coerceNumber(r.givenToBankAmount),
          paidByBankAmount: coerceNumber(r.paidByBankAmount),
          returnByBankAmount: coerceNumber(r.returnByBankAmount),
          difference: coerceNumber(r.difference),
        }))

        // ⭐ group same ecode rows; latest (by runAt) is main row, others as children
        const grouped = groupByEcodeWithLatest(normalized)
        setData(grouped)

        // ✅ use pagination info from API
        setTotalRecords(
          typeof pagination.totalRecords === 'number' ? pagination.totalRecords : grouped.length,
        )

        if (typeof pagination.pageNumber === 'number') {
          setPageNumber(pagination.pageNumber)
        }
        if (typeof pagination.pageSize === 'number') {
          setPageSize(pagination.pageSize)
        }

        // Prefer server summary if provided; fallback to computing from rows
        if (payload?.summary && typeof payload.summary === 'object') {
          const s = payload.summary
          setCardData([
            { label: 'Payable Salary', value: coerceNumber(s.totalPayableSalary) },
            { label: 'Given To Bank', value: coerceNumber(s.totalGivenToBank) },
            { label: 'Paid By Bank', value: coerceNumber(s.totalPaidByBank) },
            { label: 'Return By Bank', value: coerceNumber(s.totalReturnByBank) },
            { label: 'Difference', value: coerceNumber(s.totalDifference) },
          ])
        } else {
          // if you prefer cards based only on *latest per ecode*, use grouped here
          setCardData(buildCardsFromRows(grouped))
        }

        if (response?.data?.message) messageApi.success(response.data.message)
      } else {
        messageApi.error(response?.response?.data?.message || 'Failed to fetch data')
      }
    } catch (error) {
      console.error('summary api error: ', error)
      messageApi.error(error?.response?.data?.message || 'Failed to fetch data')
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  // 🔁 When month or search (ecode) changes, reset to page 1
  useEffect(() => {
    setPageNumber(1)
  }, [selectedMonth, search])

  // 🔁 Call API whenever month, page, size, or search changes
  useEffect(() => {
    fetchData(selectedMonth, pageNumber, pageSize, search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, pageNumber, pageSize, search])

  return (
    <>
      {contextHolder}

      <div className={styles.pageWrap}>
        <Pageheading title="Payroll Summary" />

        {/* Cards */}
        <section className={styles.cardsSection} aria-label="Summary cards">
          <CardInRow data={cardData} />
        </section>

        {/* Filters (month picker + search-as-ecode) */}
        <section className={styles.filtersSection} aria-label="Filters">
          <Filters
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            search={search}
            setSearch={setSearch}
          />
        </section>

        {/* Table + Pagination */}
        <section className={styles.tableSection} aria-label="Payroll summary table">
          <div className={styles.tableContainer}>
            <DataTable
              data={data} // 👈 grouped data with children for same ecode
              scroll={{ x: isMobile ? 720 : 'max-content' }}
              size={isMobile ? 'small' : 'middle'}
              bordered
              sticky
            />

            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Pagination
                current={pageNumber}
                pageSize={pageSize}
                total={totalRecords}
                showSizeChanger
                pageSizeOptions={['10', '20', '50', '100']}
                onChange={(page, size) => {
                  setPageNumber(page)
                  setPageSize(size)
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Summary
