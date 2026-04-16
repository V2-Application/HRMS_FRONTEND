import { Space, Table, Input } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { fetchEmpFinalData } from '../services/Services'
import { toast } from 'react-toastify'
import { columns as allColumns, columns, totalWidth } from './EmpFinalDataColumns'
import ColumnVisibility from '../components/ColumnVisibility'

const { Search } = Input
const STORAGE_KEY = 'empFinal_visibleColumns'

const EmpFinalData = () => {
  const [tableDataLoading, setTableDataLoading] = useState(false)
  const [tableData, setTableData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleKeys, setVisibleKeys] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY || '[]'))
      const all = allColumns.map((c) => c.key)
      return Array.isArray(saved) && saved.length ? saved : all
    } catch (error) {
      return allColumns.map((c) => c.key)
    }
  })

  const fetchData = async () => {
    setTableDataLoading(true)
    const response = await fetchEmpFinalData()
    if (response?.status === 200) {
      setTableData(response?.data?.data)
    } else {
      toast.error(response?.response?.data?.message || 'Error in fetching details')
    }
    setTableDataLoading(false)
  }

  useEffect(() => {
    if (tableData.length === 0) fetchData()
  }, [])

  const filteredData = useMemo(() => {
    const search = searchQuery.toLowerCase().trim()
    if (!search) return tableData
    return tableData.filter((row) =>
      Object.values(row ?? {}).some((val) =>
        String(val ?? '')
          .toLowerCase()
          .includes(search),
      ),
    )
  }, [searchQuery, tableData])

  const visibleColumns = useMemo(() => {
    const set = new Set(visibleKeys)
    return allColumns.filter((col) => set.has(col.key))
  }, [visibleKeys])

  const totalVisibleWidth = useMemo(
    () => visibleColumns.reduce((acc, col) => acc + (col.width || 150), 0),
    [visibleColumns],
  )

  return (
    <>
      <Space
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'end',
          marginBottom: '0.6rem',
          gap: 8,
        }}
      >
        {/* <ColumnVisibility
          columns={allColumns}
          value={visibleKeys}
          onChange={(keys) => {
            if (keys?.length === 0) return
            setVisibleKeys(keys)
          }}
          storageKey={STORAGE_KEY}
          buttonText="Columns"
          minSelected={1}
          isDisabled={tableData.length === 0}
        /> */}
        <Search
          placeholder="Search in table..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          disabled={tableData.length === 0}
          allowClear
        />
      </Space>

      <Table
        rowKey={(r) => `${r?.ecode}-${r?.month}-${r.batchNo}`}
        loading={tableDataLoading}
        dataSource={filteredData}
        columns={columns}
        scroll={{ x: totalWidth, y: 'calc(100vh - 80px)' }}
        pagination={{
          pageSize: 100,
          showSizeChanger: false,
        }}
      />
    </>
  )
}

export default EmpFinalData
