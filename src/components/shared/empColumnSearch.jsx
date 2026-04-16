// components/shared/columnSearch.js
import React from 'react'
import { Input, Space, Button } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

function escapeRegExp(str = '') {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function Highlight({ text, query }) {
  const t = text == null ? '' : String(text)
  const q = (query ?? '').trim()
  if (!q) return <span>{t}</span>
  const re = new RegExp(`(${escapeRegExp(q)})`, 'ig')
  const parts = t.split(re)
  return (
    <span>
      {parts.map((part, i) =>
        re.test(part) ? (
          <mark key={i} style={{ padding: 0 }}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  )
}

/**
 * Controlled text search for AntD columns, without using AntD's internal filtering.
 * We only set filteredValue/Filter UI + render highlighting; actual filtering
 * should be done by the parent component reading `textFilters`.
 */
export default function useColumnSearch(textFilters, setTextFilters) {
  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => {
      const value = selectedKeys[0]
      return (
        <div style={{ padding: 8 }}>
          <Input
            allowClear
            placeholder={`Search ${title || dataIndex}`}
            value={value}
            onChange={(e) => {
              const v = e.target.value
              setSelectedKeys(v ? [v] : [])
            }}
            onPressEnter={() => {
              confirm()
              setTextFilters((prev) => ({ ...prev, [dataIndex]: value || '' }))
            }}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={() => {
                confirm()
                setTextFilters((prev) => ({ ...prev, [dataIndex]: value || '' }))
              }}
              icon={<SearchOutlined />}
            >
              Search
            </Button>
            <Button
              size="small"
              onClick={() => {
                setSelectedKeys([])
                // keep AntD happy, but real filtering is controlled by our state:
                clearFilters?.()
                setTextFilters((prev) => ({ ...prev, [dataIndex]: '' }))
                confirm()
              }}
            >
              Reset
            </Button>
            <Button type="link" size="small" onClick={() => close()}>
              Close
            </Button>
          </Space>
        </div>
      )
    },
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    // Do NOT provide `onFilter` here—parent computes filtering from `textFilters`
    filteredValue: textFilters && textFilters[dataIndex] ? [textFilters[dataIndex]] : null,
    render: (text) => <Highlight text={text} query={textFilters?.[dataIndex]} />,
  })

  return getColumnSearchProps
}
