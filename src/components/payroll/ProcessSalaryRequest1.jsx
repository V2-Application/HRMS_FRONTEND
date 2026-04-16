import { UploadOutlined } from '@ant-design/icons'
import { Space, Input, Table, Button, message, DatePicker } from 'antd'
import { useEffect, useState } from 'react'
import ProcessSalaryRequestUploader from './ProcessSalaryRequestUploader'
import { useActionsMap } from '../../utils/useActionsMap'
import { useSelector } from 'react-redux'
import axiosInstance from '../../services/axiosInstance'
import ProcessSalaryRequestColumns from './ProcessSalaryRequestColumns'
import dayjs from 'dayjs'
import Pageheading from '../shared/Pageheading'

const { Search } = Input

const ProcessSalaryRequest1 = () => {
  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)

  const [isUploaderOpen, setIsUploaderOpen] = useState(false)
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [filteredData, setFilteredData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [monthVal, setMonthVal] = useState(dayjs())
  const [isEmpSalDataLoading, setIsEmpSalDataLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [salaryInfo, setSalaryInfo] = useState(null)

  // 🔵 Fetch list snapshots for month
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const monthStr = monthVal.format('MMM-YY')

      const res = await axiosInstance.get('/api/EmpAttendanceViewSnapshot/get-snapshots', {
        params: {
          month: monthStr,
          status: 0, // 0 = all active salary requests
        },
      })

      if (res?.status === 200) {
        const list = res?.data?.data || []
        const withKeys = list.map((row) => ({
          ...row,
          key: row.id ?? row.batchNo ?? `${row.ecode}-${row.month_Year}`,
        }))
        setData(withKeys)
        setFilteredData(withKeys)
      } else {
        setData([])
        setFilteredData([])
        message.error(res?.data?.message || 'Failed to fetch data')
      }
    } catch (err) {
      setData([])
      setFilteredData([])
      message.error(err?.response?.data?.message || 'Error fetching data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthVal])

  // 🔍 Search in table
  useEffect(() => {
    const searchText = searchQuery.toLowerCase().trim()

    if (!searchText) {
      setFilteredData(data)
    } else {
      const filtered = data.filter((item) =>
        Object.values(item || {}).some((v) =>
          String(v ?? '')
            .toLowerCase()
            .includes(searchText),
        ),
      )
      setFilteredData(filtered)
    }
  }, [searchQuery, data])

  // 🔵 Fetch salary info for modal (if you use it)
  const fetchSalData = async (batchNo) => {
    try {
      setIsEmpSalDataLoading(true)

      const res = await axiosInstance.get('/api/EmpAttendanceViewSnapshot/get-snapshots', {
        params: {
          month: monthVal.format('MMM-YY'),
          status: 0,
          batch: batchNo,
        },
      })

      if (res?.status === 200 && res?.data?.data?.length > 0) {
        setSalaryInfo(res.data.data[0])
        setIsModalVisible(true)
      } else {
        message.error('No salary info found for this batch')
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to fetch salary info')
    } finally {
      setIsEmpSalDataLoading(false)
    }
  }

  // ✅/❌ Approve / Reject
  // Columns will call: onUpdateStatus(record.id, 1) or onUpdateStatus(record.id, -1)
  const handleUpdateStatus = async (id, status) => {
    const sid = Number(status)
    const finalStatus = sid === 1 ? 1 : sid === -1 ? -1 : 0

    console.log('handleUpdateStatus ->', { id, status, sid, finalStatus })

    if (finalStatus === 0) {
      message.error('Frontend error: status is 0, cannot call API.')
      return
    }

    try {
      setUpdatingId(id)

      // Build URL exactly as backend expects
      const url = `/api/EmpAttendanceViewSnapshot/update-status/${id}?status=${finalStatus}`
      console.log('Calling URL:', url)

      const res = await axiosInstance.post(url)

      if (res?.status === 200) {
        message.success(res?.data?.message || 'Status updated successfully')
        fetchData()
      } else {
        message.error(res?.data?.message || 'Failed to update status')
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Error while updating status')
    } finally {
      setUpdatingId(null)
    }
  }

  const { columns, totalWidth } = ProcessSalaryRequestColumns({
    onUpdateStatus: handleUpdateStatus,
    isUpdatingId: updatingId,
    fetchSalData,
    isInfoLoading: isEmpSalDataLoading,
  })

  return (
    <>
      <Pageheading title="Processed Salary Requests" />

      <ProcessSalaryRequestUploader
        isVisible={isUploaderOpen}
        setIsVisible={setIsUploaderOpen}
        refreshData={fetchData}
      />

      <Space
        style={{
          display: 'flex',
          justifyContent: 'end',
          marginBottom: '0.6rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <DatePicker
          picker="month"
          value={monthVal}
          onChange={(val) => {
            if (val) setMonthVal(val)
          }}
        />

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
          style={{ maxWidth: 260 }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filteredData}
        loading={isLoading}
        scroll={{ x: totalWidth, y: 'calc(100vh - 160px)' }}
      />
    </>
  )
}

export default ProcessSalaryRequest1
