import React from 'react'
import { Button, DatePicker, Input, Space } from 'antd'
import dayjs from 'dayjs'

const { Search } = Input
const { MonthPicker } = DatePicker

const Filters = ({ selectedMonth, setSelectedMonth, search, setSearch }) => {
  const handleClearFilters = () => {
    setSearch('')
    setSelectedMonth(dayjs()) // reset to current month
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
      }}
    >
      <Space>
        <label style={{ fontWeight: 500, fontSize: '15px' }}>Select month:</label>
        <MonthPicker
          value={selectedMonth} // dayjs instance
          onChange={(val) => setSelectedMonth(val || dayjs())}
          format="YYYY-MM"
          placeholder="Select month"
          allowClear={false} // keep a month always selected
        />
      </Space>

      <Space>
        <Button type="default" onClick={handleClearFilters}>
          Clear filters
        </Button>
        <Search
          placeholder="input search text"
          allowClear
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Space>
    </div>
  )
}

export default Filters
