import { ExportOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Space, Table, Input, message, Tooltip, Select } from 'antd'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import LastMonthSalaryUploader from './Uploader'
import { exportProcessedSalary, getLastMonthSalaryList } from '../../services/Services'
import { getApiError } from '../../VendorModule/helpers'
import { getLastMonthSalaryColumns } from './columns'

const { Search } = Input
const DEBOUNCE_MS = 500

// flatten leaf columns (supports grouped columns)
const flattenColumns = (cols = []) =>
  cols.flatMap((c) => (c?.children?.length ? flattenColumns(c.children) : [c]))

const LastMonthSalary = () => {
  // -----------------------------
  // State
  // -----------------------------
  const [tableData, setTableData] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [isExcelDownloading, setIsExcelDownloading] = useState(false)
  const [isUploaderModalOpen, setIsUploaderModalOpen] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  // Column finder
  const tableWrapRef = useRef(null)
  const [colSearch, setColSearch] = useState('')
  const [selectedColKey, setSelectedColKey] = useState(null)

  // Debounce timer
  const debounceRef = useRef(null)

  // -----------------------------
  // Data fetch
  // -----------------------------
  const fetchData = useCallback(
    async ({
      page = pagination.current,
      pageSize = pagination.pageSize,
      searchTerm = search,
    } = {}) => {
      try {
        setLoading(true)
        const response = await getLastMonthSalaryList({ page, pageSize, searchTerm })

        if (response.status === 200) {
          const { data, page: resPage, pageSize: resPageSize, totalRecords } = response.data || {}
          setTableData(data || [])
          setPagination((prev) => ({
            ...prev,
            current: resPage ?? page,
            pageSize: resPageSize ?? pageSize,
            total: totalRecords ?? 0,
          }))
        }
      } catch (error) {
        message.error(getApiError(error, 'Error fetching data'))
        setTableData([])
        setPagination((prev) => ({ ...prev, total: 0 }))
      } finally {
        setLoading(false)
      }
    },
    [pagination.current, pagination.pageSize, search],
  )

  useEffect(() => {
    fetchData({ page: pagination.current, pageSize: pagination.pageSize, searchTerm: search })
  }, [fetchData, pagination.current, pagination.pageSize, search])

  // -----------------------------
  // Debounced backend search
  // -----------------------------
  const onSearchChange = useCallback(
    (e) => {
      const value = e.target.value

      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        setPagination((prev) => ({ ...prev, current: 1 }))
        setSearch(value || '')
        fetchData({ page: 1, pageSize: pagination.pageSize, searchTerm: value || '' })
      }, DEBOUNCE_MS)
    },
    [fetchData, pagination.pageSize],
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // -----------------------------
  // Download Excel
  // -----------------------------
  const downloadExcel = useCallback(async () => {
    try {
      setIsExcelDownloading(true)
      const response = await exportProcessedSalary(search)

      if (response.status === 200) {
        const data = response.data
        const blob = new Blob([data])
        const url = window.URL.createObjectURL(blob)

        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `Last_Month_Salary_Processed_${new Date().toISOString()}.xlsx`
        anchor.click()
        anchor.remove()

        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      message.error(getApiError(error, 'Error downloading Excel'))
    } finally {
      setIsExcelDownloading(false)
    }
  }, [search])

  // -----------------------------
  // Columns
  // -----------------------------
  const columns = useMemo(
    () => getLastMonthSalaryColumns({ search, pagination, tableData }),
    [search, pagination, tableData],
  )

  const totalWidth = useMemo(
    () =>
      (columns || []).reduce((sum, col) => {
        const w = Number(col?.width || 150)
        return sum + w
      }, 0),
    [columns],
  )

  const leafColumns = useMemo(() => flattenColumns(columns), [columns])

  // -----------------------------
  // Column Finder: scroll to column
  // -----------------------------
  const getColumnLeftOffset = useCallback(
    (targetKey) => {
      let left = 0
      for (const c of leafColumns) {
        const key = c.key ?? c.dataIndex
        if (String(key) === String(targetKey)) return left
        left += Number(c.width || 150)
      }
      return 0
    },
    [leafColumns],
  )

  const scrollToColumn = useCallback(
    (targetKey) => {
      // AntD Table body scroll container
      const wrapper =
        tableWrapRef.current?.querySelector('.ant-table-body') ||
        tableWrapRef.current?.querySelector('.ant-table-content')

      if (!wrapper) return

      const left = getColumnLeftOffset(targetKey)
      wrapper.scrollTo({ left, behavior: 'smooth' })
    },
    [getColumnLeftOffset],
  )

  const columnOptions = useMemo(() => {
    const q = colSearch.trim().toLowerCase()
    return (leafColumns || [])
      .map((c) => ({
        label: typeof c.title === 'string' ? c.title : String(c.title ?? ''),
        value: String(c.key ?? c.dataIndex ?? ''),
      }))
      .filter((o) => o.value && o.label)
      .filter((o) => (q ? o.label.toLowerCase().includes(q) : true))
  }, [leafColumns, colSearch])

  // -----------------------------
  // Pagination
  // -----------------------------
  const onTableChange = useCallback(
    (page, pageSize) => {
      setPagination((prev) => ({ ...prev, current: page, pageSize }))
      fetchData({ page, pageSize, searchTerm: search })
    },
    [fetchData, search],
  )

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <>
      <LastMonthSalaryUploader
        isVisible={isUploaderModalOpen}
        setIsVisible={setIsUploaderModalOpen}
        refreshData={fetchData}
      />

      <Space
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.6rem',
        }}
      >
        <Select
          showSearch
          allowClear
          placeholder="Find column..."
          style={{ width: '14rem' }}
          options={columnOptions}
          value={selectedColKey}
          searchValue={colSearch}
          onSearch={(v) => setColSearch(v)}
          onSelect={(key) => {
            setSelectedColKey(key)
            scrollToColumn(key)
          }}
          onClear={() => {
            setSelectedColKey(null)
            setColSearch('')
          }}
          onDropdownVisibleChange={(open) => {
            if (!open) setColSearch('')
          }}
          filterOption={false}
        />

        <Space
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'end',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Tooltip title="Export data">
            <Button
              icon={<ExportOutlined />}
              onClick={downloadExcel}
              loading={isExcelDownloading}
              disabled={isExcelDownloading}
            />
          </Tooltip>

          <Tooltip title="Upload Excel">
            <Button icon={<UploadOutlined />} onClick={() => setIsUploaderModalOpen(true)} />
          </Tooltip>

          <Search placeholder="Search in table..." allowClear onChange={onSearchChange} />
        </Space>
      </Space>

      <div ref={tableWrapRef}>
        <Table
          loading={loading}
          columns={columns}
          dataSource={tableData}
          scroll={{ y: 'calc(100vh - 160px)', x: totalWidth }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            onChange: onTableChange,
          }}
        />
      </div>
    </>
  )
}

export default LastMonthSalary
