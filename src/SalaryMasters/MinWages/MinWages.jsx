import { Space, Input, Table, message, Button } from 'antd'
import React, { useEffect, useState } from 'react'
import { fetchMinWages, submitNewMinWage } from '../../services/Services'
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons'
import Pageheading from '../../components/shared/Pageheading'

const { Search } = Input

const MinWages = () => {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isDataLoading, setIsDataLoading] = useState(false)
  const [rowToEdit, setRowToEdit] = useState({})
  const [rowToUpdate, setRowToUpdate] = useState({})
  const [isRowUpdating, setIsRowUpdating] = useState(false)

  const fetchData = async () => {
    try {
      setIsDataLoading(true)
      const response = await fetchMinWages()

      if (response.status === 200) {
        setData(response.data?.data || [])
        setSearchQuery('')
      }
    } catch (error) {
      console.error('minwages error:', error)
      message.error(error?.response?.data?.message || 'Error getting data')
    } finally {
      setIsDataLoading(false)
    }
  }

  useEffect(() => {
    if (data.length <= 0) fetchData()
  }, [])

  useEffect(() => {
    const search = searchQuery.toLowerCase().trim()

    if (search.length === 0) {
      setFilteredData(data)
    } else {
      const filtered = data.filter((dt) =>
        Object.values(dt ?? {}).some((val) =>
          String(val ?? '')
            .toLowerCase()
            .includes(search),
        ),
      )
      setFilteredData(filtered)
    }
  }, [searchQuery, data])

  const handleRemoveRow = (id) => {
    setRowToEdit((prev) => {
      // if nothing to remove, return previous object
      if (!prev || !prev[id]) return prev

      // create a new object without the 'id' key
      const { [id]: _removed, ...rest } = prev
      return rest
    })
  }

  const handleRemoveRowValue = (id) => {
    setRowToUpdate((prev) => {
      if (!prev || !prev[id]) return prev
      const { [id]: _removed, ...rest } = prev
      return rest
    })
  }

  const handleEditRow = (id) => {
    setRowToEdit((prev) => ({ ...prev, [id]: true }))
  }

  const handleInputChange = (e, id) => {
    const value = e.target.value
    // Allow only numbers and up to one decimal point
    const numericRegex = /^\d*\.?\d*$/
    if (numericRegex.test(value)) {
      setRowToUpdate((prev) => ({
        ...prev,
        [id]: value,
      }))
    }
  }

  const handleSubmitRow = async (_, id) => {
    const inputValue = Number(rowToUpdate[id] ?? 0)

    if (inputValue <= 0) {
      message.error('Min wage must be greater than 0')
    } else {
      try {
        setIsRowUpdating(true)
        const response = await submitNewMinWage({ id, minWages: inputValue })

        if (response.status === 200) {
          message.success(response.data?.message || 'Updated successfully')
          handleRemoveRow(id)
          handleRemoveRowValue(id)
          fetchData()
        }
      } catch (error) {
        console.error('error:', error)
        message.error(error?.response?.data?.message || 'Error submitting min wage')
      } finally {
        setIsRowUpdating(false)
      }
    }
  }

  const columns = [
    {
      title: 'State',
      dataIndex: 'stateName',
      key: 'stateName',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Min Wage (INR)',
      dataIndex: 'minWages',
      key: 'minWages',
      width: 200,
      ellipsis: true,
      render: (val, record) => {
        return rowToEdit[record?.id] ? (
          <Input
            placeholder="Enter new minwage"
            style={{ width: '100%' }}
            value={rowToUpdate[record?.id] ?? ''}
            onChange={(e) => handleInputChange(e, record?.id)}
          />
        ) : (
          val
        )
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 200,
      ellipsis: true,
      render: (_, record) => {
        return rowToEdit[record?.id] ? (
          <Space>
            <Button
              icon={<CheckOutlined />}
              onClick={() => handleSubmitRow(_, record?.id)}
              loading={isRowUpdating}
            />
            <Button
              icon={<CloseOutlined />}
              onClick={() => handleRemoveRow(record?.id)}
              loading={isRowUpdating}
            />
          </Space>
        ) : (
          <Button icon={<EditOutlined />} onClick={() => handleEditRow(record?.id)} />
        )
      },
    },
  ]

  const columnWidth = columns.reduce((acc, row) => acc + (row.width || 150), 0)

  return (
    <div>
      <Space
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.6rem',
        }}
      >
        <Pageheading title="State-Wise Minimum Wages" marginBottom="0px" />
        <Search
          placeholder="Search in table"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Space>

      <Table
        dataSource={filteredData}
        columns={columns}
        pagination={{ size: 30 }}
        loading={isDataLoading}
        scroll={{ x: columnWidth, y: 'calc(100vh - 100px)' }}
      />
    </div>
  )
}

export default MinWages
