import { UploadOutlined, ExportOutlined, DownOutlined } from '@ant-design/icons'
import { Space, Input, Table, Button, message, DatePicker, Dropdown } from 'antd'
import { useEffect, useRef, useState } from 'react'
import ProcessSalaryRequestUploader from './ProcessSalaryRequestUploader'
import { useActionsMap } from '../../utils/useActionsMap'
import { useSelector } from 'react-redux'
import axiosInstance from '../../services/axiosInstance'
import ProcessSalaryRequestColumns from './ProcessSalaryRequestColumns'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import Pageheading from '../shared/Pageheading'

const { Search } = Input

const ProcessSalaryRequest1 = () => {
  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)

  const [isUploaderOpen, setIsUploaderOpen] = useState(false)
  const [filteredData, setFilteredData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  // Debounced copy of searchQuery that is actually sent to the server.
  const [appliedSearch, setAppliedSearch] = useState('')
  const [monthVal, setMonthVal] = useState(dayjs())
  const [isEmpSalDataLoading, setIsEmpSalDataLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [salaryInfo, setSalaryInfo] = useState(null)
  const [isExporting, setIsExporting] = useState(false)
  // Pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [total, setTotal] = useState(0)
  // True when the backend honored paging (returned a TotalCount). When false (older backend that
  // returns the whole month at once), we paginate/search on the client so ALL rows stay visible.
  const [serverPaged, setServerPaged] = useState(true)
  // Last fetched month, and the full month's rows kept for the client-side fallback so
  // page/search changes filter locally instead of re-hitting the (slow) backend.
  const lastFetchedMonthRef = useRef(null)
  const clientAllRef = useRef([])

  const addKeys = (list) =>
    (list || []).map((row) => ({
      ...row,
      key: row.id ?? row.batchNo ?? `${row.ecode}-${row.month_Year}`,
    }))

  // Sort newest-run-first (RunAt descending), so today's run — being the most recent — is on top.
  const sortNewestFirst = (list) =>
    [...(list || [])].sort((a, b) => {
      const ta = a?.runAt ? new Date(a.runAt).getTime() : 0
      const tb = b?.runAt ? new Date(b.runAt).getTime() : 0
      return tb - ta
    })

  // Client-side filter (used only in the non-server-paged fallback) across all column values.
  const clientFilter = (list, q) => {
    const s = (q || '').toLowerCase().trim()
    if (!s) return list
    return list.filter((item) =>
      Object.values(item || {}).some((v) =>
        String(v ?? '')
          .toLowerCase()
          .includes(s),
      ),
    )
  }

  // 🔵 Fetch snapshots for the selected month.
  // - New backend: returns ONE page + TotalCount  -> fast server-side paging.
  // - Old backend: returns the WHOLE month, no TotalCount -> we paginate/search on the client
  //   so every run/row is still shown (fixes "only today's run is coming").
  const fetchData = async () => {
    const monthStr = monthVal.format('MMM-YY')

    // Client-paged fallback: page/search changes are handled locally over the month already loaded,
    // so we don't re-hit the (slow) backend. Only a month change triggers a new request here.
    if (!serverPaged && lastFetchedMonthRef.current === monthStr && clientAllRef.current.length) {
      const filtered = clientFilter(clientAllRef.current, appliedSearch)
      setFilteredData(filtered)
      setTotal(filtered.length)
      return
    }

    try {
      setIsLoading(true)

      const res = await axiosInstance.get('/api/EmpAttendanceViewSnapshot/get-snapshots', {
        params: {
          month: monthStr,
          status: 0, // 0 = all active salary requests
          page,
          pageSize,
          search: appliedSearch || undefined,
        },
      })

      if (res?.status === 200) {
        const list = sortNewestFirst(addKeys(res?.data?.data))
        const serverTotal = res?.data?.totalCount
        const isServerPaged = typeof serverTotal === 'number' && serverTotal > 0
        setServerPaged(isServerPaged)
        lastFetchedMonthRef.current = monthStr

        if (isServerPaged) {
          // Backend already returned just this page.
          clientAllRef.current = []
          setFilteredData(list)
          setTotal(serverTotal)
        } else {
          // Backend returned the full month (or none) -> keep it and filter/paginate on the client
          // so ALL rows (every run) stay visible.
          clientAllRef.current = list
          const filtered = clientFilter(list, appliedSearch)
          setFilteredData(filtered)
          setTotal(filtered.length)
        }
      } else {
        setFilteredData([])
        setTotal(0)
        message.error(res?.data?.message || 'Failed to fetch data')
      }
    } catch (err) {
      setFilteredData([])
      setTotal(0)
      message.error(err?.response?.data?.message || 'Error fetching data')
    } finally {
      setIsLoading(false)
    }
  }

  // Refetch whenever month / page / pageSize / applied search changes.
  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthVal, page, pageSize, appliedSearch])

  // Reset to page 1 when the month changes.
  useEffect(() => {
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthVal])

  // 🔍 Debounce the search box -> server search (and jump back to page 1).
  useEffect(() => {
    const t = setTimeout(() => {
      setAppliedSearch(searchQuery.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(t)
  }, [searchQuery])

  // 🔵 Fetch salary info for modal (if you use it)
  const fetchSalData = async (batchNo) => {
    try {
      setIsEmpSalDataLoading(true)

      const res = await axiosInstance.get('/api/EmpAttendanceViewSnapshot/get-snapshots', {
        params: {
          month: monthVal.format('MMM-YY'),
          status: 0,
          batch: batchNo,
        },
      })

      if (res?.status === 200 && res?.data?.data?.length > 0) {
        setSalaryInfo(res.data.data[0])
        setIsModalVisible(true)
      } else {
        message.error('No salary info found for this batch')
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to fetch salary info')
    } finally {
      setIsEmpSalDataLoading(false)
    }
  }

  // ✅/❌ Approve / Reject
  // Columns will call: onUpdateStatus(record.id, 1) or onUpdateStatus(record.id, -1)
  const handleUpdateStatus = async (id, status) => {
    const sid = Number(status)
    const finalStatus = sid === 1 ? 1 : sid === -1 ? -1 : 0

    console.log('handleUpdateStatus ->', { id, status, sid, finalStatus })

    if (finalStatus === 0) {
      message.error('Frontend error: status is 0, cannot call API.')
      return
    }

    try {
      setUpdatingId(id)

      // Build URL exactly as backend expects
      const url = `/api/EmpAttendanceViewSnapshot/update-status/${id}?status=${finalStatus}`
      console.log('Calling URL:', url)

      const res = await axiosInstance.post(url)

      if (res?.status === 200) {
        message.success(res?.data?.message || 'Status updated successfully')
        fetchData()
      } else {
        message.error(res?.data?.message || 'Failed to update status')
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Error while updating status')
    } finally {
      setUpdatingId(null)
    }
  }

  const { columns, totalWidth } = ProcessSalaryRequestColumns({
    onUpdateStatus: handleUpdateStatus,
    isUpdatingId: updatingId,
    fetchSalData,
    isInfoLoading: isEmpSalDataLoading,
  })

  const buildExportRows = (rows) => {
    const exportCols = columns.filter(
      (c) => c?.dataIndex && c.dataIndex !== 'actions' && c.title !== 'Actions',
    )
    return rows.map((r) => {
      const out = {}
      for (const c of exportCols) {
        let v = r[c.dataIndex]
        if (c.dataIndex === 'runAt' && v) v = String(v).split('T')[0]
        out[c.title] = v ?? ''
      }
      return out
    })
  }

  const downloadXlsx = (rows, suffix) => {
    if (!rows.length) {
      message.warning('No rows to export')
      return
    }
    const ws = XLSX.utils.json_to_sheet(buildExportRows(rows))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Salaries')
    const monthStr = monthVal.format('MMM-YY')
    const ts = dayjs().format('YYYYMMDD_HHmmss')
    XLSX.writeFile(wb, `Processed_Salary_${suffix}_${monthStr}_${ts}.xlsx`)
  }

  // Export must cover the WHOLE month (not just the current page), so it fetches all matching
  // rows from the server (pageSize omitted = no paging) honoring the current search.
  const fetchAllForExport = async () => {
    const monthStr = monthVal.format('MMM-YY')
    const res = await axiosInstance.get('/api/EmpAttendanceViewSnapshot/get-snapshots', {
      params: {
        month: monthStr,
        status: 0,
        search: appliedSearch || undefined,
      },
    })
    if (res?.status !== 200) throw new Error(res?.data?.message || 'Failed to fetch data for export')
    return addKeys(res?.data?.data)
  }

  const runExport = async (compute) => {
    if (isExporting) return
    setIsExporting(true)
    try {
      const rows = await fetchAllForExport()
      // yield so the spinner paints before xlsx blocks the main thread
      await new Promise((r) => setTimeout(r, 0))
      compute(rows)
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Failed to export')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportAll = () => runExport((rows) => downloadXlsx(rows, 'All'))

  const handleExportLatest = () =>
    runExport((rows) => {
      const latestByEcode = new Map()
      for (const r of rows) {
        const key = r.ecode ?? r.key
        const tsNew = r.runAt ? new Date(r.runAt).getTime() : 0
        const existing = latestByEcode.get(key)
        const tsOld = existing?.runAt ? new Date(existing.runAt).getTime() : -1
        if (!existing || tsNew >= tsOld) latestByEcode.set(key, r)
      }
      downloadXlsx([...latestByEcode.values()], 'Latest')
    })

  // NEW report: download the LOC-WISE EMP-WISE SALARY REPORT in the 148-column PAYROLL FORMAT
  // (latest run per employee for the selected month). Built server-side, streamed as .xlsx.
  // Leaves the existing All/Latest exports untouched.
  const handleExportPayrollFormat = async () => {
    if (isExporting) return
    setIsExporting(true)
    try {
      const monthStr = monthVal.format('MMM-YY')
      const res = await axiosInstance.get(
        `/api/EmpAttendanceViewSnapshot/payroll-format-export?month=${encodeURIComponent(monthStr)}`,
        { responseType: 'blob' },
      )
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `LOC_EMP_Salary_Report_${monthStr}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      message.error(err?.response?.data?.message || err?.message || 'Failed to export payroll format')
    } finally {
      setIsExporting(false)
    }
  }

  const exportMenuItems = [
    { key: 'all', label: 'All salaries', onClick: handleExportAll },
    { key: 'latest', label: 'Latest salaries', onClick: handleExportLatest },
    { key: 'payroll-format', label: 'Payroll format (LOC & EMP)', onClick: handleExportPayrollFormat },
  ]

  return (
    <>
      <Pageheading title="Processed Salary Requests" />

      <ProcessSalaryRequestUploader
        isVisible={isUploaderOpen}
        setIsVisible={setIsUploaderOpen}
        refreshData={fetchData}
      />

      <Space
        style={{
          display: 'flex',
          justifyContent: 'end',
          marginBottom: '0.6rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <DatePicker
          picker="month"
          value={monthVal}
          onChange={(val) => {
            if (val) setMonthVal(val)
          }}
        />

        {actionsMap?.upload?.actionStatus && (
          <Button icon={<UploadOutlined />} onClick={() => setIsUploaderOpen(true)}>
            Upload
          </Button>
        )}

        <Dropdown menu={{ items: exportMenuItems }} trigger={['click']} disabled={isExporting}>
          <Button icon={<ExportOutlined />} loading={isExporting}>
            Export <DownOutlined />
          </Button>
        </Dropdown>

        <Search
          placeholder="Search in table..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          style={{ maxWidth: 260 }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filteredData}
        loading={isLoading}
        scroll={{ x: totalWidth, y: 'calc(100vh - 160px)' }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: ['25', '50', '100', '200'],
          showTotal: (t) => `${t} records`,
        }}
        onChange={(pag) => {
          if (pag?.current) setPage(pag.current)
          if (pag?.pageSize && pag.pageSize !== pageSize) {
            setPageSize(pag.pageSize)
            setPage(1)
          }
        }}
      />
    </>
  )
}

export default ProcessSalaryRequest1
