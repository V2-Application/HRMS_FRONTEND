import { Space, Table, Input, Button } from 'antd'
import { columns, ttlWidth } from './PFMasterColumns'
import PFMasterUploader from './PFMasterUploader'
import { useEffect, useState } from 'react'
import { UploadOutlined } from '@ant-design/icons'
import { fetchPFMasterData } from '../../../services/Services'

const { Search } = Input

const PFMaster = () => {
  const [isUploaderOpen, setIsUploaderOpen] = useState(false)
  const [isTableLoading, setIsTableLoading] = useState(false)
  const [tableData, setTableData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [searchQuery, setSearchQuery] = useState('')
  const [totalRecords, setTotalRecords] = useState('0')

  const fetchData = async () => {
    setIsTableLoading(true)
    const response = await fetchPFMasterData({
      currentPage,
      pageSize,
      searchQuery,
    })

    if (response?.status === 200) {
      setTableData(response?.data?.data?.records)
      setTotalRecords(response?.data?.data?.totalRecords)
    }

    setIsTableLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [searchQuery])

  return (
    <>
      {/* PF Uploader */}
      <PFMasterUploader
        isVisible={isUploaderOpen}
        setIsVisible={setIsUploaderOpen}
        refreshData={fetchData}
      />

      <Space
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'end',
          marginBottom: '0.6rem',
          gap: 8,
        }}
      >
        <Button onClick={() => setIsUploaderOpen(true)}>
          <UploadOutlined />
        </Button>
        <Search
          placeholder="Search in table..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={tableData}
        scroll={{ x: ttlWidth, y: 'calc(100vh - 150px)' }}
        loading={isTableLoading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalRecords,
          onChange: (pageNumber) => {
            setCurrentPage(pageNumber)
          },
        }}
      />
    </>
  )
}

export default PFMaster
