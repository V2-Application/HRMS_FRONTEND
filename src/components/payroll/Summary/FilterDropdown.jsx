import { Button, Checkbox, Input, Space } from 'antd'
import { useState } from 'react'

const FilterDropdown = ({ dataIndex, dataList, filterValues, setFilterValues, confirm, title }) => {
  const [searchText, setSearchText] = useState('')

  const filteredOptions = dataList.filter((item) =>
    item?.toLowerCase()?.includes(searchText.toLowerCase()),
  )

  const handleChange = (checkedValues) => {
    setFilterValues(checkedValues)
  }

  const handleReset = () => {
    setFilterValues([])
    setSearchText('')
    confirm()
  }

  return (
    <div style={{ padding: 8, width: 215 }}>
      <Input
        placeholder={`Search ${title}`}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 8, display: 'block' }}
      />

      <div style={{ maxHeight: 150, overflowY: 'auto', paddingRight: 8 }}>
        <Checkbox.Group
          value={filterValues}
          onChange={handleChange}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          {filteredOptions.map((value) => (
            <Checkbox key={value} value={value}>
              {value}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>

      <Space style={{ marginTop: 8 }}>
        <Button type="primary" size="small" onClick={() => confirm()}>
          Filter
        </Button>
        <Button size="small" onClick={handleReset}>
          Reset
        </Button>
      </Space>
    </div>
  )
}

export default FilterDropdown
