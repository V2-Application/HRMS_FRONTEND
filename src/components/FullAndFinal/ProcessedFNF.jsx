// import React, { useEffect, useState, useMemo } from 'react'
// import { Table, Input, Button, Modal, Form, DatePicker, Select, message } from 'antd'
// import { fnfDoneList } from '../../services/Services'
// import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
// import FNFUploader from './FNFUploader'
// import { useSelector } from 'react-redux'
// import { useActionsMap } from '../../utils/useActionsMap'
// import axiosInstance from '../../services/axiosInstance'
// import dayjs from 'dayjs'

// const { Search } = Input
// const { RangePicker } = DatePicker

// // Tiny responsive hook (no dependency)
// const useIsMobile = (query = '(max-width: 768px)') => {
//   const [isMobile, setIsMobile] = useState(false)
//   useEffect(() => {
//     const mq = window.matchMedia(query)
//     const onChange = (e) => setIsMobile(e.matches)
//     setIsMobile(mq.matches)
//     try {
//       mq.addEventListener('change', onChange)
//       return () => mq.removeEventListener('change', onChange)
//     } catch {
//       mq.addListener(onChange)
//       return () => mq.removeListener(onChange)
//     }
//   }, [query])
//   return isMobile
// }

// const FNFList = () => {
//   const isMobile = useIsMobile()
//   const [pageNumber, setPageNumber] = useState(1)
//   const [pageSize, setPageSize] = useState(100)
//   const [data, setData] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [searchQuery, setSearchQuery] = useState('')
//   const [isUploaderOpen, setIsUploaderOpen] = useState(false)

//   // ✅ NEW: range picker for searching
//   const [dateRange, setDateRange] = useState(null)
//   const [debouncedRange, setDebouncedRange] = useState(null)

//   // Export modal state (UNCHANGED)
//   const [exportOpen, setExportOpen] = useState(false)
//   const [exportLoading, setExportLoading] = useState(false)
//   const [exportForm] = Form.useForm()

//   // Keep last debounced search in state so paging reuses it
//   const [debouncedSearch, setDebouncedSearch] = useState('')

//   const { filteredSideMenu } = useSelector((state) => state?.auth || {})
//   const actionsMap = useActionsMap(filteredSideMenu)

//   const handleTableChange = (pagination) => {
//     const { current, pageSize } = pagination
//     setPageNumber(current)
//     setPageSize(pageSize)
//   }

//   const fetchData = async (search) => {
//     try {
//       setLoading(true)
//       const query = typeof search === 'string' ? search : debouncedSearch

//       // ✅ NEW: send from/to based on selected range
//       const from = debouncedRange?.[0]
//         ? dayjs(debouncedRange[0]).startOf('day').toISOString()
//         : undefined
//       const to = debouncedRange?.[1]
//         ? dayjs(debouncedRange[1]).endOf('day').toISOString()
//         : undefined

//       const response = await fnfDoneList({
//         page: pageNumber,
//         pageSize,
//         search: query,
//         from,
//         to,
//       })

//       if (response?.status === 200) {
//         setData(response?.data?.data?.items || [])
//       } else {
//         setData([])
//       }
//     } catch (e) {
//       setData([])
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Fetch on paging / size changes (using last debounced search + range)
//   useEffect(() => {
//     fetchData()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pageNumber, pageSize])

//   // Debounce search + fetch
//   useEffect(() => {
//     const s = String(searchQuery).trim().toLowerCase()
//     const timer = setTimeout(() => {
//       setDebouncedSearch(s)
//     }, 500)
//     return () => clearTimeout(timer)
//   }, [searchQuery])

//   useEffect(() => {
//     fetchData(debouncedSearch)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [debouncedSearch])

//   // ✅ NEW: Debounce date range
//   useEffect(() => {
//     const t = setTimeout(() => {
//       setDebouncedRange(dateRange)
//     }, 300)
//     return () => clearTimeout(t)
//   }, [dateRange])

//   // ✅ NEW: fetch when debounced range changes (search stays same)
//   useEffect(() => {
//     fetchData(debouncedSearch)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [debouncedRange])

//   const handleOpenUploader = () => setIsUploaderOpen(true)

//   // ---------- Export helpers (UNCHANGED) ----------
//   const getFileNameFromDisposition = (disposition) => {
//     if (!disposition) return null

//     // filename*=UTF-8''FNF_Accounts_List_20260108_095916.xlsx
//     const utfMatch = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)
//     if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1].replace(/"/g, ''))

//     // filename=FNF_Accounts_List_20260108_095916.xlsx
//     const match = disposition.match(/filename\s*=\s*("?)([^";]+)\1/i)
//     return match?.[2] || null
//   }

//   const downloadBlob = (blob, filename = 'FNF_Export.xlsx') => {
//     const url = window.URL.createObjectURL(blob)
//     const a = document.createElement('a')
//     a.href = url
//     a.download = filename
//     document.body.appendChild(a)
//     a.click()
//     a.remove()
//     window.URL.revokeObjectURL(url)
//   }

//   const openExportModal = () => {
//     exportForm.resetFields()
//     setExportOpen(true)
//   }

//   const handleExportSubmit = async () => {
//     try {
//       const values = await exportForm.validateFields()

//       const range = values?.dateRange || []
//       const from = range?.[0] ? dayjs(range[0]).startOf('day').toISOString() : undefined
//       const to = range?.[1] ? dayjs(range[1]).endOf('day').toISOString() : undefined

//       // Swagger params: search, from, to, paymentStatus
//       const params = {
//         search: values?.ecode?.trim() || undefined,
//         from,
//         to,
//         paymentStatus: values?.paymentStatus || undefined,
//       }

//       setExportLoading(true)

//       const res = await axiosInstance.get('/api/Fnf/export-excel', {
//         params,
//         responseType: 'blob',
//       })

//       const disposition = res?.headers?.['content-disposition']
//       const filename = getFileNameFromDisposition(disposition) || 'FNF_Export.xlsx'

//       downloadBlob(res.data, filename)
//       message.success('Export downloaded')
//       setExportOpen(false)
//     } catch (err) {
//       if (err?.errorFields) return
//       message.error(err?.response?.data?.message || 'Export failed')
//     } finally {
//       setExportLoading(false)
//     }
//   }
//   // ---------- Export helpers end ----------

//   const columns = useMemo(
//     () => [
//       { title: 'Emp Code', dataIndex: 'ecode', key: 'ecode', ellipsis: true, width: 120 },
//       {
//         title: 'Emp Name',
//         dataIndex: 'employeeName',
//         key: 'employeeName',
//         ellipsis: true,
//         width: 180,
//       },
//       {
//         title: 'Amount Paid',
//         dataIndex: 'amountPaid',
//         key: 'amountPaid',
//         ellipsis: true,
//         width: 140,
//       },
//       {
//         title: 'Cheque Date',
//         dataIndex: 'chequeDate',
//         key: 'chequeDate',
//         ellipsis: true,
//         width: 140,
//         render: (date) => (date ? String(date).split('T')[0] : null),
//       },
//       { title: 'Cheque No.', dataIndex: 'chequeNo', key: 'chequeNo', ellipsis: true, width: 160 },
//       {
//         title: 'Leaving Date',
//         dataIndex: 'dateOfLeaving',
//         key: 'dateOfLeaving',
//         ellipsis: true,
//         width: 140,
//         render: (date) => (date ? String(date).split('T')[0] : null),
//       },
//       {
//         title: 'FNF Date',
//         dataIndex: 'fnfDate',
//         key: 'fnfDate',
//         ellipsis: true,
//         width: 140,
//         render: (date) => (date ? String(date).split('T')[0] : null),
//       },
//       {
//         title: 'Net Amount',
//         dataIndex: 'netAmount',
//         key: 'netAmount',
//         ellipsis: true,
//         width: 140,
//         render: (val) => (val ?? val === 0 ? String(val) : '-'),
//       },
//       {
//         title: 'Payment Remarks',
//         dataIndex: 'paymentRemarks',
//         key: 'paymentRemarks',
//         ellipsis: true,
//         width: 220,
//       },
//       {
//         title: 'Payment Status',
//         dataIndex: 'paymentStatus',
//         key: 'paymentStatus',
//         ellipsis: true,
//         width: 160,
//       },
//       {
//         title: 'Payment Voucher No.',
//         dataIndex: 'paymentVoucherNo',
//         key: 'paymentVoucherNo',
//         ellipsis: true,
//         width: 180,
//       },
//       {
//         title: 'Send for Payment Amount',
//         dataIndex: 'sendForPaymentAmount',
//         key: 'sendForPaymentAmount',
//         ellipsis: true,
//         width: 220,
//       },
//       {
//         title: 'Total Additions',
//         dataIndex: 'totalAdditions',
//         key: 'totalAdditions',
//         ellipsis: true,
//         width: 160,
//       },
//       {
//         title: 'Total Deductions',
//         dataIndex: 'totalDeductions',
//         key: 'totalDeductions',
//         ellipsis: true,
//         width: 160,
//       },
//     ],
//     [],
//   )

//   return (
//     <React.Fragment>
//       <FNFUploader isVisible={isUploaderOpen} setIsVisible={setIsUploaderOpen} />

//       {/* Export Modal (UNCHANGED) */}
//       <Modal
//         title="Export FNF Excel"
//         open={exportOpen}
//         onCancel={() => setExportOpen(false)}
//         okText="Submit"
//         onOk={handleExportSubmit}
//         confirmLoading={exportLoading}
//       >
//         <Form form={exportForm} layout="vertical">
//           <Form.Item name="dateRange" label="From - To Date">
//             <RangePicker style={{ width: '100%' }} />
//           </Form.Item>

//           <Form.Item name="ecode" label="Employee Code">
//             <Input placeholder="Enter employee code (optional)" />
//           </Form.Item>

//           <Form.Item name="paymentStatus" label="Payment Status">
//             <Select
//               allowClear
//               placeholder="Select payment status (optional)"
//               options={[
//                 { value: 'Paid', label: 'Paid' },
//                 { value: 'Unpaid', label: 'Unpaid' },
//                 { value: 'Pending', label: 'Pending' },
//               ]}
//             />
//           </Form.Item>
//         </Form>
//       </Modal>

//       <div style={{ padding: isMobile ? '8px 8px 0' : '0' }}>
//         <div
//           style={{
//             display: 'flex',
//             justifyContent: isMobile ? 'stretch' : 'flex-end',
//             marginBottom: 8,
//             gap: '0.8rem',
//             flexWrap: isMobile ? 'wrap' : 'nowrap',
//           }}
//         >
//           {actionsMap?.uploadfnf?.actionStatus && (
//             <Button icon={<UploadOutlined />} onClick={handleOpenUploader}>
//               Upload
//             </Button>
//           )}

//           <Button icon={<DownloadOutlined />} onClick={openExportModal}>
//             Export
//           </Button>

//           {/* ✅ NEW: RangePicker for SEARCH only */}
//           <RangePicker
//             value={dateRange}
//             onChange={(val) => setDateRange(val)}
//             allowClear
//             style={{ width: isMobile ? '100%' : '16rem' }}
//           />

//           <Search
//             placeholder="Search..."
//             allowClear
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             style={{ width: isMobile ? '100%' : '18rem' }}
//           />
//         </div>

//         <Table
//           rowKey={(r) => r.id ?? `${r.ecode || 'row'}-${r.chequeNo || Math.random()}`}
//           columns={columns}
//           dataSource={data}
//           loading={loading}
//           onChange={handleTableChange}
//           bordered={!isMobile}
//           size={isMobile ? 'small' : 'middle'}
//           pagination={{
//             current: pageNumber,
//             pageSize,
//             total: undefined,
//             showSizeChanger: !isMobile,
//             pageSizeOptions: ['10', '20', '50', '100'],
//           }}
//           scroll={{ x: 'max-content', y: isMobile ? undefined : 'calc(100vh - 220px)' }}
//           style={{ whiteSpace: 'nowrap' }}
//         />
//       </div>
//     </React.Fragment>
//   )
// }

// export default FNFList

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Table, Input, Button, Modal, Form, DatePicker, Select, message } from 'antd'
import { fnfDoneList, fnfProcessedList } from '../../services/Services'
import { UploadOutlined, DownloadOutlined, FilePdfOutlined } from '@ant-design/icons'
import FNFUploader from './FNFUploader'
import { useSelector } from 'react-redux'
import { useActionsMap } from '../../utils/useActionsMap'
import axiosInstance from '../../services/axiosInstance'
import dayjs from 'dayjs'
import FNF_Pdf from './FNF_Pdf'
import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import FNFUploaderProcessed from './FNFUploaderProcessed'

const { Search } = Input
const { RangePicker } = DatePicker

// Tiny responsive hook (no dependency)
const useIsMobile = (query = '(max-width: 768px)') => {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = (e) => setIsMobile(e.matches)
    setIsMobile(mq.matches)
    try {
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    } catch {
      mq.addListener(onChange)
      return () => mq.removeListener(onChange)
    }
  }, [query])
  return isMobile
}

const ProcessedFNF = () => {
  const isMobile = useIsMobile()
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(100)

  const [data, setData] = useState([])
  const [totalCount, setTotalCount] = useState(0) // ✅ NEW: total for pagination

  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isUploaderOpen, setIsUploaderOpen] = useState(false)
  const [isFNFPdfOpen, setIsFNFPdfOpen] = useState(false)
  const [fnfDetails, setFnfDetails] = useState(null)

  // range picker for searching
  const [dateRange, setDateRange] = useState(null)
  const [debouncedRange, setDebouncedRange] = useState(null)

  // Export modal state (UNCHANGED)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [exportForm] = Form.useForm()

  // Keep last debounced search in state so paging reuses it
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const { filteredSideMenu } = useSelector((state) => state?.auth || {})
  const actionsMap = useActionsMap(filteredSideMenu)
  const navigate = useNavigate();

  // ✅ FIX: make fetchData always use the latest values (no stale closure)
  const fetchData = useCallback(
    async ({ page, size, search, range } = {}) => {
      try {
        setLoading(true)

        const p = page ?? pageNumber
        const s = size ?? pageSize
        const q = typeof search === 'string' ? search : debouncedSearch
        const r = range ?? debouncedRange

        const from = r?.[0] ? dayjs(r[0]).startOf('day').toISOString() : undefined
        const to = r?.[1] ? dayjs(r[1]).endOf('day').toISOString() : undefined

        const response = await fnfProcessedList({
          page: p,
          pageSize: s,
          search: q,
          from,
          to,
        })

        if (response?.status === 200) {
          const items = response?.data?.data?.items || []
          const total = response?.data?.data?.totalCount ?? response?.data?.data?.total ?? 0 // ✅ supports both keys
          setData(items)
          setTotalCount(total)
        } else {
          setData([])
          setTotalCount(0)
        }
      } catch (e) {
        setData([])
        setTotalCount(0)
      } finally {
        setLoading(false)
      }
    },
    [pageNumber, pageSize, debouncedSearch, debouncedRange],
  )

  const handleTableChange = (pagination) => {
    const { current, pageSize: newSize } = pagination

    // ✅ when pageSize changes, reset to page 1
    if (newSize !== pageSize) {
      setPageNumber(1)
      setPageSize(newSize)
      fetchData({ page: 1, size: newSize })
      return
    }

    setPageNumber(current)
    fetchData({ page: current, size: newSize })
  }

  const handleFnfDetail = (a, b) => {
    const _ecode = a?.ecode;
    if(!_ecode) return;
    navigate(`/fnf/detail/${_ecode}`);
  }

  // Debounce search
  useEffect(() => {
    const s = String(searchQuery).trim().toLowerCase()
    const timer = setTimeout(() => setDebouncedSearch(s), 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Debounce date range
  useEffect(() => {
    const t = setTimeout(() => setDebouncedRange(dateRange), 300)
    return () => clearTimeout(t)
  }, [dateRange])

  // ✅ FIX: whenever search or range changes, reset page to 1 and refetch
  useEffect(() => {
    setPageNumber(1)
    fetchData({ page: 1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, debouncedRange])

  // ✅ initial fetch + when pageSize changes (pageNumber handled via handleTableChange)
  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize])

  const handleOpenUploader = () => setIsUploaderOpen(true)

  // ---------- Export helpers (UNCHANGED) ----------
  const getFileNameFromDisposition = (disposition) => {
    if (!disposition) return null
    const utfMatch = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)
    if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1].replace(/"/g, ''))
    const match = disposition.match(/filename\s*=\s*("?)([^";]+)\1/i)
    return match?.[2] || null
  }

  const downloadBlob = (blob, filename = 'FNF_Export.xlsx') => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  const openExportModal = () => {
    exportForm.resetFields()
    setExportOpen(true)
  }

  const handleExportSubmit = async () => {
    try {
      const values = await exportForm.validateFields()

      const range = values?.dateRange || []
      const from = range?.[0] ? dayjs(range[0]).startOf('day').toISOString() : undefined
      const to = range?.[1] ? dayjs(range[1]).endOf('day').toISOString() : undefined

      const params = {
        search: values?.ecode?.trim() || undefined,
        from,
        to,
        paymentStatus: values?.paymentStatus || undefined,
      }

      setExportLoading(true)

      const res = await axiosInstance.get('/api/Fnf/export-processed-excel', {
        params,
        responseType: 'blob',
      })

      const disposition = res?.headers?.['content-disposition']
      const filename = getFileNameFromDisposition(disposition) || 'FNF_Export.xlsx'

      downloadBlob(res.data, filename)
      message.success('Export downloaded')
      setExportOpen(false)
    } catch (err) {
      if (err?.errorFields) return
      message.error(err?.response?.data?.message || 'Export failed')
    } finally {
      setExportLoading(false)
    }
  }
  // ---------- Export helpers end ----------

  const columns = useMemo(
    () => [
      { title: 'Emp Code', dataIndex: 'ecode', key: 'ecode', ellipsis: true, width: 120 },
      {
        title: 'Emp Name',
        dataIndex: 'employeeName',
        key: 'employeeName',
        ellipsis: true,
        width: 120,
      },
    //   {
    //     title: 'Amount Paid',
    //     dataIndex: 'amountPaid',
    //     key: 'amountPaid',
    //     ellipsis: true,
    //     width: 110,
    //   },
    //   {
    //     title: 'Cheque Date',
    //     dataIndex: 'chequeDate',
    //     key: 'chequeDate',
    //     ellipsis: true,
    //     width: 110,
    //     render: (date) => (date ? String(date).split('T')[0] : null),
    //   },
    //   { title: 'Cheque No.', dataIndex: 'chequeNo', key: 'chequeNo', ellipsis: true, width: 110 },
      {
        title: 'Leaving Date',
        dataIndex: 'dateOfLeaving',
        key: 'dateOfLeaving',
        ellipsis: true,
        width: 110,
        render: (date) => (date ? String(date).split('T')[0] : null),
      },
      {
        title: 'FNF Date',
        dataIndex: 'fnfDate',
        key: 'fnfDate',
        ellipsis: true,
        width: 110,
        render: (date) => (date ? String(date).split('T')[0] : null),
      },
      {
        title: 'Net Amount',
        dataIndex: 'netAmount',
        key: 'netAmount',
        ellipsis: true,
        width: 110,
        render: (val) => ((val ?? val === 0) ? String(val) : '-'),
      },
    //   {
    //     title: 'Payment Remarks',
    //     dataIndex: 'paymentRemarks',
    //     key: 'paymentRemarks',
    //     ellipsis: true,
    //     width: 130,
    //   },
    //   {
    //     title: 'Payment Status',
    //     dataIndex: 'paymentStatus',
    //     key: 'paymentStatus',
    //     ellipsis: true,
    //     width: 120,
    //   },
    //   {
    //     title: 'Pay. Voucher No.',
    //     dataIndex: 'paymentVoucherNo',
    //     key: 'paymentVoucherNo',
    //     ellipsis: true,
    //     width: 140,
    //   },
    //   {
    //     title: 'Send for Payment Amount',
    //     dataIndex: 'sendForPaymentAmount',
    //     key: 'sendForPaymentAmount',
    //     ellipsis: true,
    //     width: 160,
    //   },
      {
        title: 'Total Additions',
        dataIndex: 'totalAdditions',
        key: 'totalAdditions',
        ellipsis: true,
        width: 120,
      },
      {
        title: 'Total Deductions',
        dataIndex: 'totalDeductions',
        key: 'totalDeductions',
        ellipsis: true,
        width: 120,
      },
    //   {
    //     title: 'PDF',
    //     fixed: 'right',
    //     dataIndex: 'pdf',
    //     ellipsis: true,
    //     width: 60,
    //     render: (_, row) => (
    //       <Button
    //         icon={<FilePdfOutlined />}
    //         onClick={() => {
    //           setFnfDetails(row)
    //           setIsFNFPdfOpen(true)
    //         }}
    //       />
    //     ),
    //   },
    {
        title: "Action",
        width: 60,
        render: (_, row) => {
            return (
                <Button onClick={() => handleFnfDetail(_, row)} title='FNF Detail' type="primary" variant='filled' size="medium" icon={<ArrowRight size={14}/>} iconPosition='end'></Button>
            )
        }
    }
    ],
    [],
  )

  const totalWidth = columns.reduce((col, sum) => sum + col.width || 150, 0)

  return (
    <React.Fragment>
      {isFNFPdfOpen && (
        <FNF_Pdf
          handleCancel={() => {
            setFnfDetails(null)
            setIsFNFPdfOpen(false)
          }}
          isModalOpen={isFNFPdfOpen}
          details={fnfDetails}
        />
      )}
      <FNFUploaderProcessed isVisible={isUploaderOpen} setIsVisible={setIsUploaderOpen} />

      {/* Export Modal (UNCHANGED) */}
      <Modal
        title="Export FNF Excel"
        open={exportOpen}
        onCancel={() => setExportOpen(false)}
        okText="Submit"
        onOk={handleExportSubmit}
        confirmLoading={exportLoading}
      >
        <Form form={exportForm} layout="vertical">
          <Form.Item name="dateRange" label="From - To Date">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="ecode" label="Employee Code">
            <Input placeholder="Enter employee code (optional)" />
          </Form.Item>

          {/* <Form.Item name="paymentStatus" label="Payment Status">
            <Select
              allowClear
              placeholder="Select payment status (optional)"
              options={[
                { value: 'Paid', label: 'Paid' },
                { value: 'Unpaid', label: 'Unpaid' },
                { value: 'Pending', label: 'Pending' },
              ]}
            />
          </Form.Item> */}
        </Form>
      </Modal>

      <div style={{ padding: isMobile ? '8px 8px 0' : '0' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: isMobile ? 'stretch' : 'flex-end',
            marginBottom: 8,
            gap: '0.8rem',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}
        >
          {actionsMap?.uploadfnf?.actionStatus && (
            <Button icon={<UploadOutlined />} onClick={handleOpenUploader}>
              Upload
            </Button>
          )}

          <Button icon={<DownloadOutlined />} onClick={openExportModal}>
            Export
          </Button>

          <RangePicker
            value={dateRange}
            onChange={(val) => setDateRange(val)}
            allowClear
            style={{ width: isMobile ? '100%' : '16rem' }}
          />

          <Search
            placeholder="Search..."
            allowClear
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: isMobile ? '100%' : '18rem' }}
          />
        </div>

        <Table
          rowKey={(r) => r.id ?? r.fnfId ?? r.employeeId ?? r.ecode} // ✅ stable rowKey
          columns={columns}
          dataSource={data}
          loading={loading}
          onChange={handleTableChange}
          bordered={!isMobile}
          size={isMobile ? 'small' : 'middle'}
          pagination={{
            current: pageNumber,
            pageSize,
            total: totalCount, // ✅ IMPORTANT
            showSizeChanger: !isMobile,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (t) => `Total ${t} records`,
          }}
          scroll={{ x: totalWidth, y: 'calc(100vh - 220px)' }}
          style={{ whiteSpace: 'nowrap' }}
        />
      </div>
    </React.Fragment>
  )
}

export default ProcessedFNF
