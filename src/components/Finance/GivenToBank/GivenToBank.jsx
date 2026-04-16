import { UploadOutlined } from '@ant-design/icons'
import { Space, Input, Table, Button, message, DatePicker } from 'antd'
import { useEffect, useState } from 'react'
import GivenToBankUploader from './GivenToBankUploader'
import { useActionsMap } from '../../../utils/useActionsMap'
import { useSelector } from 'react-redux'
import {
  fetchAttendanceViewSnapshot,
  fetchSalaryStatusList,
  updatePaidByBankorReturnByBank,
} from '../../../services/Services'
import GivenToBankColumns from './GivenToBankColumns'
import dayjs from 'dayjs'
import Pageheading from '../../shared/Pageheading'
import SalaryInfoModal from './SalaryInfoModal'

const { Search } = Input

const GivenToBank = () => {
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

  const fetchData = async () => {
    try {
      setIsLoading(true)

      const response = await fetchSalaryStatusList(2, monthVal.format('MMM-YY'))

      if (response?.status === 200) {
        setData(response?.data?.data || [])
        message.success(response?.data?.message || 'Data fetched successfully')
      } else {
        setData([])
        message.error(response?.response?.data?.message || 'Failed to fetch data')
      }
    } catch (error) {
      const errMsg = error?.response?.data?.message || 'Failed to fetch data'
      message.error(errMsg)
      console.error('Given to bank get error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [monthVal])

  useEffect(() => {
    const searchText = searchQuery.toLowerCase().trim()

    if (searchQuery.length === 0) {
      setFilteredData(data)
    } else {
      const filtered = data.filter((item) => {
        return Object.values(item).some((value) => String(value).toLowerCase().includes(searchText))
      })
      setFilteredData(filtered)
    }
  }, [searchQuery, data])

  const handleUpdateStatus = async (id, batchId, statusId) => {
    if (statusId !== 4 && statusId !== 5) {
      // 4: Paid By Bank, 5: Return By Bank
      message.error('Invalid operation!')
      return
    }

    try {
      setUpdatingId(id)
      const res = await updatePaidByBankorReturnByBank({ id, batchId, statusId })

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

  const fetchSalData = async (batchId) => {
    try {
      setIsEmpSalDataLoading(true)

      const response = await fetchAttendanceViewSnapshot(monthVal.format('MMM-YY'), batchId)

      if (response?.status === 200) {
        setSalaryInfo(response?.data?.data[0])
        setIsModalVisible(true)
      } else {
        message.error(response?.response?.data?.message || 'Failed to fetch salary info')
      }
    } catch (error) {
      const errMrg = error?.response?.data?.message || 'Failed to fetch data'
      message.error(errMrg)
      console.log(`error fetching data: ${error}`)
    } finally {
      setIsEmpSalDataLoading(false)
    }
  }

  const { columns, totalWidth } = GivenToBankColumns({
    onUpdateStatus: handleUpdateStatus,
    isUpdatingId: updatingId,
    fetchSalData: fetchSalData,
    isInfoLoading: isEmpSalDataLoading,
  })

  const handleModalCancel = () => {
    setIsModalVisible(false)
    setSalaryInfo(null)
  }

  return (
    <>
      <Pageheading title="Given to Bank" />
      <GivenToBankUploader
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
        loading={isLoading}
        scroll={{ x: totalWidth, y: 'calc(100vh - 160px)' }}
      />

      <SalaryInfoModal isVisible={isModalVisible} onCancel={handleModalCancel} data={salaryInfo} />
    </>
  )
}

export default GivenToBank
