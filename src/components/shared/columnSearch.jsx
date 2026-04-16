import React from 'react'
import { Button, Input, Space } from 'antd'

/**
 * Controlled column text-search helper for AntD Table.
 * We only control the UI & header state. Actual filtering is done in the parent
 * (so pagination totals, counters, etc. stay in sync).
 *
 * Parent usage:
 *   const [textFilters, setTextFilters] = useState({});
 *   const getColumnSearchProps = useColumnSearch(textFilters, setTextFilters);
 */
const useColumnSearch = (textFilters, setTextFilters) => {
  const getProps = (dataIndex, title) => ({
    // Controlled filter value (for the icon state & showing the current text)
    filteredValue:
      textFilters?.[dataIndex] !== undefined && textFilters?.[dataIndex] !== null
        ? [textFilters[dataIndex]]
        : null,

    // Custom dropdown
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${title}`}
          value={selectedKeys?.[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => {
            const v = selectedKeys?.[0] ?? ''
            setTextFilters((prev) => ({ ...prev, [dataIndex]: v }))
            confirm({ closeDropdown: true })
          }}
          style={{ marginBottom: 8, display: 'block' }}
          autoFocus
        />
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              const v = selectedKeys?.[0] ?? ''
              setTextFilters((prev) => ({ ...prev, [dataIndex]: v }))
              confirm({ closeDropdown: true })
            }}
          >
            Search
          </Button>
          <Button
            size="small"
            onClick={() => {
              clearFilters?.()
              setSelectedKeys([])
              setTextFilters((prev) => {
                const next = { ...prev }
                delete next[dataIndex]
                return next
              })
              confirm({ closeDropdown: true })
            }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),

    // We DO NOT use onFilter here. Parent filters the rows and passes a filtered dataSource.
    filterIcon: (filtered) => (
      <span style={{ color: filtered ? '#1890ff' : undefined }}>🔍</span>
    ),
  })

  return getProps
}

export default useColumnSearch
