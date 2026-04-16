import React, { useEffect, useState } from 'react'
import { Space, Table, Tag, Row, Input, Tooltip, Button, Col, message, Dropdown } from 'antd'
import { ExportOutlined, UploadOutlined } from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import Uploader from './Uploader'
import TableBulkActionIcons from './TableBulkActionIcons'
import { fetchPayroll } from '../../../services/Services'
import { set } from '../../../redux/uiSlice'

const { Search } = Input

const TableList = ({ columns }) => {
  const dispatch = useDispatch()
  const { loading, theme } = useSelector((state) => state.ui)
  const [lodingLocal, setlodingLocal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [search, setSearch] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [data, setData] = useState([])

  const fetchData = async () => {
    dispatch(set({ loading: true }))

    try {
      const response = await fetchPayroll({ pageNumber: currentPage, pageSize, search })

      if (response) {
        setTotalCount(response?.totalRecords)
        setData(response?.data)
      } else {
        setData([])
      }
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentPage, pageSize, search])

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      <div className="def" style={{ paddingBottom: 10 }}>
        <TableBulkActionIcons
          lodingLocal={lodingLocal}
          setlodingLocal={setlodingLocal}
          setSearch={setSearch}
          totalRecords={totalCount}
        />
        <Table
          rowKey="storeBudgetId"
          columns={columns}
          pagination={{
            current: currentPage,
            position: ['bottomRight'],
            total: totalCount,
            pageSize: pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handleTableChange,
          }}
          dataSource={data}
          bordered={true}
          scroll={{ x: 'max-content', y: 'calc(100vh - 160px)' }}
          style={{ whiteSpace: 'nowrap' }}
          className={theme === 'dark' ? 'dark-theme' : ''}
        />
      </div>
    </>
  )
}

export default TableList
