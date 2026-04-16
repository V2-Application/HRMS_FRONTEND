import { Space, Table, Input } from 'antd'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { columns, totalWidth } from './LeaveMasterColumns'

const { Search } = Input

const LeaveMaster = () => {
  const [tableDataLoading, setTableDataLoading] = useState(false)
  const [tableData, setTableData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  //   const fetchData = async () => {
  //     setTableDataLoading(true)
  //     const response = await fetchEmpFinalData()
  //     if (response?.status === 200) {
  //       setTableData(response?.data?.data)
  //     } else {
  //       toast.error(response?.response?.data?.message || 'Error in fetching details')
  //     }
  //     setTableDataLoading(false)
  //   }

  //   useEffect(() => {
  //     if (tableData.length === 0) fetchData()
  //   }, [])

  useEffect(() => {
    const search = searchQuery.toString().toLowerCase().trim()

    if (search.length === 0) setFilteredData(tableData)
    else {
      const filtered = tableData.filter((data) =>
        Object.values(data).some((dt) => String(dt).toLowerCase().trim().includes(search)),
      )

      setFilteredData(filtered)
    }
  }, [searchQuery, tableData])

  return (
    <>
      <Space
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'end',
          marginBottom: '0.6rem',
        }}
      >
        <Search
          placeholder="Search in table..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          disabled={tableData.length === 0}
          allowClear
        />
      </Space>

      <Table
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

export default LeaveMaster
