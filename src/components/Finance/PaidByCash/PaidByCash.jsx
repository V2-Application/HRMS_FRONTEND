import { UploadOutlined } from '@ant-design/icons'
import { Space, Input, Table, Button, message, DatePicker } from 'antd'
import PaidByCashColumns from './PaidByCashColumns'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { fetchSalaryStatusList, fetchAttendanceViewSnapshot } from '../../../services/Services'
import dayjs from 'dayjs'
import SalaryInfoModal from '../GivenToBank/SalaryInfoModal'
import Pageheading from '../../shared/Pageheading'

const { Search } = Input

const PaidByCash = () => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filteredData, setFilteredData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [monthVal, setMonthVal] = useState(dayjs())
  const [isEmpSalDataLoading, setIsEmpSalDataLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [salaryInfo, setSalaryInfo] = useState(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)

      const response = await fetchSalaryStatusList(3, monthVal.format('MMM-YY'))

      if (response?.status === 200) {
        setData(response?.data?.data || [])
        message.success(response?.data?.message || 'Data fetched successfully')
      } else {
        message.error(response?.response?.data?.message || 'Failed to fetch data')
        setData([])
      }
    } catch (error) {
      const errMsg = error?.response?.data?.message || 'Failed to fetch data'
      message.error(errMsg)
      console.error('Paid by cash get error:', error)
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

  const handleModalCancel = () => {
    setIsModalVisible(false)
    setSalaryInfo(null)
  }

  const { columns, totalWidth } = PaidByCashColumns({
    fetchSalData: fetchSalData,
    isInfoLoading: isEmpSalDataLoading,
  })

  return (
    <>
      <Pageheading title="Paid by Cash" />
      <Space
        style={{ display: 'flex', justifyContent: 'end', marginBottom: '0.6rem', flexWrap: 'wrap' }}
      >
        <DatePicker picker="month" value={monthVal} onChange={(val) => setMonthVal(val)} />
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

export default PaidByCash
