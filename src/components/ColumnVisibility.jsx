import { Button, Checkbox, Divider, Input, Popover, Space, Typography, Badge } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import { SettingOutlined } from '@ant-design/icons'

const { Text } = Typography

/**
 * Props:
 * - columns: AntD columns (must include unique `key`, `title`, optional `width`)
 * - value: array of visible column keys (controlled)
 * - onChange: (keys) => void
 * - storageKey?: string (persist selection)
 * - buttonText?: string (default: "Columns")
 * - minSelected?: number (default: 1)
 * - isDisabled?: boolean
 */
const ColumnVisibility = ({
  columns = [],
  value,
  onChange,
  storageKey,
  buttonText = 'Columns',
  minSelected = 1,
  isDisabled,
}) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const allKeys = useMemo(() => {
    return columns.map((c) => c?.key).filter(Boolean)
  }, [columns])

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = columns.map((c) => ({ label: c?.title, value: c?.key }))
    if (!q) return base
    return base.filter((o) => String(o.label).toLowerCase().includes(q))
  }, [columns, query])

  // Hydrate from storage (only if parent doesn’t provide an initial value)
  useEffect(() => {
    if (!storageKey || !onChange) return
    if (!value || value.length === 0) {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || '[]')
        if (Array.isArray(saved) && saved.length > 0) onChange(saved)
        else onChange(allKeys)
      } catch {
        onChange(allKeys)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, onChange])

  // Persist whenever selection changes
  useEffect(() => {
    if (!storageKey) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(value ?? []))
    } catch {}
  }, [value, storageKey])

  const handleChange = (keys) => {
    if (keys.length < minSelected) return
    onChange?.(keys)
  }

  const selectAll = () => onChange?.(allKeys)
  const clearAll = () => onChange?.(allKeys.slice(0, minSelected)) // keep first N

  const count = value?.length ?? 0
  const total = allKeys.length

  const content = (
    <div style={{ width: 300 }}>
      {/* Sticky header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: '#fff',
          zIndex: 1,
          paddingBottom: 8,
        }}
      >
        <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
          <Text strong>Show / Hide Columns</Text>
          <Badge count={`${count}/${total}`} style={{ backgroundColor: '#1677ff' }} />
        </Space>
        <Input
          size="small"
          allowClear
          placeholder="Filter columns…"
          style={{ marginTop: 8 }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* Options */}
      <div style={{ maxHeight: 320, overflow: 'auto', paddingRight: 4 }}>
        <Checkbox.Group
          style={{ width: '100%', display: 'block' }}
          options={filteredOptions}
          value={value}
          onChange={handleChange}
        />
      </div>

      <Divider style={{ margin: '8px 8px' }} />

      {/* Footer actions */}
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Button size="small" onClick={clearAll}>
          Clear
        </Button>
        <Button size="small" type="primary" onClick={selectAll}>
          Select all
        </Button>
      </Space>
    </div>
  )

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      content={content}
    >
      <Button icon={<SettingOutlined />} disabled={isDisabled}>
        {buttonText}
      </Button>
    </Popover>
  )
}

export default ColumnVisibility
