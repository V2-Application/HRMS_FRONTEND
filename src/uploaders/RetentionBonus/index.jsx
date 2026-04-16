import { ImportOutlined, UploadOutlined } from '@ant-design/icons'
import { Space, Table, Input, Button, Tooltip, message } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'
import RetentionUploader from './Uploader'
import { getRetentionData } from '../../services/Services'
import { getApiError } from '../../VendorModule/helpers'

const { Search } = Input

const RetentionBonus = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [isExcelDownloading, setIsExcelDownloading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [isUploaderModalOpen, setIsUploaderModalOpen] = useState(false)

  const debounce = (fn, delay = 500) => {
    let timer
    return (...args) => {
      clearTimeout(timer)
      timer = setTimeout(() => fn(...args), delay)
    }
  }

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setPagination((prev) => ({ ...prev, current: 1 }))
        setSearchTerm(value)
        fetchData({ page: 1, search: value })
      }, 500),
    [],
  )

  const handleOpenModal = () => setIsUploaderModalOpen(true)

  const fetchData = async ({
    page = pagination.current,
    size = pagination.pageSize,
    search = searchTerm,
  } = {}) => {
    try {
      setLoading(true)

      const res = await getRetentionData({
        pageNumber: page,
        pageSize: size,
        searchTerm: search,
      })

      if (res.status === 200) {
        const { retentions, totalCount } = res.data
        setData(retentions || [])
        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize: size,
          total: totalCount,
        }))
      }
    } catch (err) {
      console.error('error fetching data:', err)
      const msg = getApiError(err, 'Error fetching retention data')
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [pagination.current, pagination.pageSize, searchTerm])

  const downloadExcel = async () => {
    try {
      setIsExcelDownloading(true)

      const response = await getRetentionData({ isExcel: true })

      if (response.status === 200) {
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `Retention_${new Date().toISOString()}.xlsx`
        anchor.click()
        anchor.remove()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      const msg = getApiError(error, 'Error downloading excel')
      message.error(msg)
    } finally {
      setIsExcelDownloading(false)
    }
  }

  const columns = useMemo(
    () => [
      {
        title: 'Loc Code',
        dataIndex: 'locCode',
        width: 90,
        ellipsis: true,
      },
      {
        title: 'Location',
        dataIndex: 'location',
        width: 100,
        ellipsis: true,
      },
      {
        title: 'Emp Code',
        dataIndex: 'ecode',
        width: 100,
        ellipsis: true,
      },
      {
        title: 'Emp Name',
        dataIndex: 'name',
        width: 120,
        ellipsis: true,
      },
      {
        title: 'Joining Date',
        dataIndex: 'joiningDate',
        width: 90,
        ellipsis: true,
        render: (date) =>
          date === null || date === undefined ? '-' : String(date || '').split('T')[0],
      },
      {
        title: 'Emp Status',
        dataIndex: 'empStatus',
        width: 90,
        ellipsis: true,
      },
      {
        title: 'Reten. App.',
        dataIndex: 'retentionApplicable',
        width: 90,
        ellipsis: true,
        render: (isApplicable) => <span>{isApplicable ? 'Yes' : 'No'}</span>,
      },
      {
        title: 'Reten. Bonus %',
        dataIndex: 'retBonus',
        width: 100,
        ellipsis: true,
      },
      {
        title: 'Reten. St. Date',
        dataIndex: 'retentionStartDate',
        width: 100,
        ellipsis: true,
        render: (date) =>
          date === null || date === undefined ? '-' : String(date || '').split('T')[0],
      },
      {
        title: 'Comple. Date',
        dataIndex: 'dateOfComplition',
        width: 100,
        ellipsis: true,
        render: (date) =>
          date === null || date === undefined ? '-' : String(date || '').split('T')[0],
      },
    ],
    [data],
  )

  const totalWidth = columns.reduce((col, sum) => sum + (col.width || 150), 0)

  return (
    <>
      <RetentionUploader
        isVisible={isUploaderModalOpen}
        setIsVisible={setIsUploaderModalOpen}
        refreshData={fetchData}
      />

      <Space
        style={{
          width: '100%',
          marginBottom: '0.6rem',
          display: 'flex',
          justifyContent: 'end',
          alignItems: 'center',
        }}
      >
        <Tooltip title="Upload retention bonus">
          <Button icon={<UploadOutlined />} onClick={handleOpenModal} />
        </Tooltip>

        <Tooltip title="Export data">
          <Button
            icon={<ImportOutlined />}
            onClick={downloadExcel}
            loading={isExcelDownloading}
            disabled={isExcelDownloading}
          />
        </Tooltip>

        <Search
          placeholder="Search in table..."
          allowClear
          onChange={(e) => debouncedSearch(e.target.value)}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="ecode"
        loading={loading}
        scroll={data.length > 0 ? { y: 'calc(100vh - 150px)', x: totalWidth } : undefined}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          onChange: (page, pageSize) => {
            setPagination({ ...pagination, current: page, pageSize })
          },
        }}
      />
    </>
  )
}

export default RetentionBonus
