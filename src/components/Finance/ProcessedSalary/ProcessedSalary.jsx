import { UploadOutlined } from '@ant-design/icons'
import { Space, Input, Table, Button, message, DatePicker } from 'antd'
import SalaryProcessColumns from './ProcessedSalaryColumns'
import { useEffect, useState } from 'react'
import SalaryProcessUploader from './ProcessedSalaryUploader'
import { useActionsMap } from '../../../utils/useActionsMap'
import { useSelector } from 'react-redux'
import {
  fetchAttendanceViewSnapshot,
  updateGivenToBankorPaidByCash,
} from '../../../services/Services'
import Pageheading from '../../shared/Pageheading'
import dayjs from 'dayjs'

const { Search } = Input

const ProcessedSalary = () => {
  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)
  const [isUploaderOpen, setIsUploaderOpen] = useState(false)
  const [tableData, setTableData] = useState([])
  const [isTableLoading, setIsTableLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [filteredData, setFilteredData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [monthVal, setMonthVal] = useState(dayjs())

  const fetchData = async () => {
    try {
      setIsTableLoading(true)

      const response = await fetchAttendanceViewSnapshot(monthVal.format('MMM-YY'))

      if (response?.status === 200) {
        setTableData(response?.data?.data || [])
        message.success(response?.data?.message || 'Data fetched successfully')
      } else {
        setTableData([])
      }
    } catch (error) {
      const errMsg = error?.response?.data?.message || 'Failed to fetch data'
      message.error(errMsg)
      console.error('salary process get error:', error)
    } finally {
      setIsTableLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [monthVal])

  useEffect(() => {
    const searchText = searchQuery.toLowerCase().trim()

    if (searchQuery.length === 0) {
      setFilteredData(tableData)
    } else {
      const filtered = tableData.filter((item) => {
        return Object.values(item).some((value) => String(value).toLowerCase().includes(searchText))
      })
      setFilteredData(filtered)
    }
  }, [searchQuery, tableData])

  const handleUpdateStatus = async (id, status) => {
    if (status !== 2 && status !== 3) {
      // 2: Given to Bank, 3: Paid by Cash
      message.error('Invalid operation!')
      return
    }

    try {
      setUpdatingId(id)
      const res = await updateGivenToBankorPaidByCash({ id, status })

      if (res?.status === 200) {
        message.success(res?.data?.message || 'Status updated successfully')
        await fetchData()
      } else {
        message.error(res?.response?.data?.message || 'Failed to update status')
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Something went wrong while updating status')
    } finally {
      setUpdatingId(null)
    }
  }

  const { columns, totalWidth } = SalaryProcessColumns({
    onUpdateStatus: handleUpdateStatus,
    isUpdatingId: updatingId,
  })

  return (
    <>
      <Pageheading title="Processed Salary" />
      <SalaryProcessUploader
        isVisible={isUploaderOpen}
        setIsVisible={setIsUploaderOpen}
        refreshData={fetchData}
      />

      <Space
        style={{ display: 'flex', justifyContent: 'end', marginBottom: '0.6rem', flexWrap: 'wrap' }}
      >
        <DatePicker picker="month" value={monthVal} onChange={(val) => setMonthVal(val)} />
        {actionsMap?.upload?.actionStatus && (
          <Button icon={<UploadOutlined />} onClick={() => setIsUploaderOpen(true)}>
            Upload
          </Button>
        )}
        <Search
          placeholder="Search in table..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filteredData}
        loading={isTableLoading}
        scroll={{ x: totalWidth, y: 'calc(100vh - 160px)' }}
      />
    </>
  )
}

export default ProcessedSalary
