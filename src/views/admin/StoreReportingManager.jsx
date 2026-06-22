import { useEffect, useMemo, useRef, useState } from 'react'
import { Table, Select, Button, Input, message, Spin, Tag, Space } from 'antd'
import {
  getStoreAccounts,
  updateStoreReportingManager,
  searchEmployeeDropdown,
} from '../../services/Services'

// Page: change the Reporting Manager of STORE-ID login accounts (employees whose ECode = a store STCode).
// Supports per-row edit and bulk (assign one RM to many selected stores).
const StoreReportingManager = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  // shared RM search (active employees) used by both the bulk picker and per-row pickers
  const [rmOptions, setRmOptions] = useState([])
  const [rmSearching, setRmSearching] = useState(false)
  const debounceRef = useRef(null)

  const [bulkRm, setBulkRm] = useState(undefined)
  const [rowRm, setRowRm] = useState({}) // { [storeEcode]: rmEcode }
  const [savingKey, setSavingKey] = useState(null)
  const [bulkSaving, setBulkSaving] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getStoreAccounts('')
      setData(Array.isArray(res?.data) ? res.data : [])
      setSelectedRowKeys([])
      setRowRm({})
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed to load store accounts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // instant client-side filter as you type (list is small ~450 rows)
  const filteredData = useMemo(() => {
    const q = (search || '').trim().toLowerCase()
    if (!q) return data
    return data.filter(
      (r) =>
        (r.storeEcode || '').toLowerCase().includes(q) ||
        (r.storeName || '').toLowerCase().includes(q) ||
        (r.currentRmEcode || '').toLowerCase().includes(q) ||
        (r.currentRmName || '').toLowerCase().includes(q),
    )
  }, [data, search])

  // debounced active-employee search for the RM pickers
  const handleRmSearch = (text) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!text || text.length < 2) {
      setRmOptions([])
      return
    }
    setRmSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchEmployeeDropdown(text)
        const emps = res?.data?.employees || []
        setRmOptions(
          emps.map((e) => ({ value: e.ecode, label: `${e.ecode} - ${e.fullName || ''}`.trim() })),
        )
      } catch {
        setRmOptions([])
      } finally {
        setRmSearching(false)
      }
    }, 500)
  }

  const saveRow = async (record) => {
    const rm = rowRm[record.storeEcode]
    if (!rm) {
      message.warning('Pick a reporting manager first')
      return
    }
    setSavingKey(record.storeEcode)
    try {
      const res = await updateStoreReportingManager([record.storeEcode], rm)
      message.success(res?.message || 'Updated')
      await fetchData(search)
    } catch (e) {
      message.error(e?.response?.data?.message || 'Update failed')
    } finally {
      setSavingKey(null)
    }
  }

  const saveBulk = async () => {
    if (!selectedRowKeys.length) {
      message.warning('Select at least one store')
      return
    }
    if (!bulkRm) {
      message.warning('Pick a reporting manager to assign')
      return
    }
    setBulkSaving(true)
    try {
      const res = await updateStoreReportingManager(selectedRowKeys, bulkRm)
      message.success(res?.message || `Updated ${selectedRowKeys.length} store(s)`)
      setBulkRm(undefined)
      await fetchData(search)
    } catch (e) {
      message.error(e?.response?.data?.message || 'Bulk update failed')
    } finally {
      setBulkSaving(false)
    }
  }

  const columns = useMemo(
    () => [
      { title: 'Store Code', dataIndex: 'storeEcode', key: 'storeEcode', width: 110, fixed: 'left' },
      { title: 'Store Name', dataIndex: 'storeName', key: 'storeName' },
      {
        title: 'Loc Status',
        dataIndex: 'locStatus',
        key: 'locStatus',
        width: 100,
        render: (v) => <Tag color={v === 'Active' ? 'green' : 'orange'}>{v}</Tag>,
      },
      {
        title: 'Account',
        dataIndex: 'accountStatus',
        key: 'accountStatus',
        width: 100,
        render: (v) => <Tag color={v === 'Active' ? 'green' : 'red'}>{v}</Tag>,
      },
      {
        title: 'Current Reporting Manager',
        key: 'currentRm',
        render: (_, r) =>
          r.currentRmEcode ? (
            <span>
              {r.currentRmEcode}
              {r.currentRmName ? ` - ${r.currentRmName}` : ''}
            </span>
          ) : (
            <span style={{ color: '#aaa' }}>— none —</span>
          ),
      },
      {
        title: 'New Reporting Manager',
        key: 'newRm',
        width: 320,
        render: (_, r) => (
          <Space.Compact style={{ width: '100%' }}>
            <Select
              showSearch
              allowClear
              placeholder="Search employee (code / name)"
              style={{ width: 230 }}
              filterOption={false}
              notFoundContent={rmSearching ? <Spin size="small" /> : null}
              onSearch={handleRmSearch}
              options={rmOptions}
              value={rowRm[r.storeEcode]}
              onChange={(val) => setRowRm((prev) => ({ ...prev, [r.storeEcode]: val }))}
            />
            <Button
              type="primary"
              loading={savingKey === r.storeEcode}
              disabled={!rowRm[r.storeEcode]}
              onClick={() => saveRow(r)}
            >
              Save
            </Button>
          </Space.Compact>
        ),
      },
    ],
    [rmOptions, rmSearching, rowRm, savingKey],
  )

  return (
    <div style={{ padding: 16 }}>
      <h4 style={{ marginBottom: 4 }}>Store Reporting Manager</h4>
      <div style={{ color: '#666', marginBottom: 12 }}>
        Change the reporting manager of store-ID login accounts. Edit a single store inline, or select
        multiple stores and assign one manager to all of them.
      </div>

      <Space wrap style={{ marginBottom: 12 }}>
        <Input
          placeholder="Search store code / name / current RM"
          allowClear
          style={{ width: 320 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span style={{ color: '#888' }}>|</span>
        <span>Bulk assign to {selectedRowKeys.length} selected:</span>
        <Select
          showSearch
          allowClear
          placeholder="Pick reporting manager"
          style={{ width: 280 }}
          filterOption={false}
          notFoundContent={rmSearching ? <Spin size="small" /> : null}
          onSearch={handleRmSearch}
          options={rmOptions}
          value={bulkRm}
          onChange={setBulkRm}
        />
        <Button
          type="primary"
          loading={bulkSaving}
          disabled={!selectedRowKeys.length || !bulkRm}
          onClick={saveBulk}
        >
          Assign to selected
        </Button>
      </Space>

      <Table
        size="small"
        rowKey="storeEcode"
        loading={loading}
        dataSource={filteredData}
        columns={columns}
        scroll={{ x: 1000 }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={{ pageSize: 50, showSizeChanger: true, pageSizeOptions: [50, 100, 200] }}
      />
    </div>
  )
}

export default StoreReportingManager
