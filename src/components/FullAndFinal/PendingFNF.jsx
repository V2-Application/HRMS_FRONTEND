import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Button, Input, message, Table, Pagination, Space, Tag } from 'antd'
import dayjs from 'dayjs'
import axiosInstance from '../../services/axiosInstance'
import { ArrowRight } from 'lucide-react'

const PendingFNF = ({ onProcess }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const [searchText, setSearchText] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  })

  // holds latest abort controller
  const abortRef = useRef(null)

  // tracks latest request to avoid stale loading/data updates
  const requestIdRef = useRef(0)

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch((searchText || '').trim())
    }, 1000)

    return () => clearTimeout(t)
  }, [searchText])

  const fetchPendingEmployees = useCallback(async ({ search = '', page = 1, pageSize = 20 } = {}) => {
    const requestId = ++requestIdRef.current

    // cancel previous request
    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)

    try {
      const res = await axiosInstance.get(
        'https://v2parivar.v2retail.com:9987/api/Fnf/FetchEmployeesForFNF',
        {
          params: {
            search,
            page,
            pageSize,
          },
          signal: controller.signal,
        }
      )

      // ignore stale response
      if (requestId !== requestIdRef.current) return

      if (res?.status === 200 && res?.data?.status) {
        const rows = Array.isArray(res?.data?.data?.data) ? res.data.data.data : []
        const totalRecords = Number(res?.data?.data?.totalRecords || 0)

        setData(rows)
        setPagination((prev) => ({
          ...prev,
          total: totalRecords,
          current: Number(res?.data?.data?.pageNumber || page),
          pageSize: Number(res?.data?.data?.pageSize || pageSize),
        }))
      } else {
        setData([])
        setPagination((prev) => ({
          ...prev,
          total: 0,
          current: page,
          pageSize,
        }))
        message.error(res?.data?.message || 'Failed to fetch pending employees')
      }
    } catch (err) {
      // ignore canceled requests
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return

      // ignore stale request errors
      if (requestId !== requestIdRef.current) return

      console.error('FetchEmployeesForFNF error:', err)
      message.error(err?.response?.data?.message || 'Failed to fetch pending employees')
    } finally {
      // only latest request can stop loader
      if (requestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [])

  // fetch when page/pageSize/search changes
  useEffect(() => {
    fetchPendingEmployees({
      search: debouncedSearch,
      page: pagination.current,
      pageSize: pagination.pageSize,
    })
  }, [pagination.current, pagination.pageSize, debouncedSearch, fetchPendingEmployees])

  // abort on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort()
      }
    }
  }, [])

  const handleSearchChange = (e) => {
    const value = e.target.value || ''
    setSearchText(value)

    // reset to first page on search
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }))
  }

  const handleSelect = (record) => {
    if (typeof onProcess === 'function') {
      onProcess(record)
    }
  }

  const columns = useMemo(
    () => [
      {
        title: 'Employee Code',
        dataIndex: 'employeeCode',
        key: 'employeeCode',
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Department',
        dataIndex: 'department',
        key: 'department',
      },
      {
        title: 'Designation',
        dataIndex: 'designation',
        key: 'designation',
      },
      {
        title: 'Date of Joining',
        dataIndex: 'dateOfJoining',
        key: 'dateOfJoining',
        render: (value) => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
      },
      {
        title: 'Date of Leaving',
        dataIndex: 'dateOfLeaving',
        key: 'dateOfLeaving',
        render: (value) => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
      },
      {
        title: 'Action',
        key: 'action',
        width: 130,
        render: (_, record) => (
          <Button
            type="primary"
            size="middle"
            onClick={() => handleSelect(record)}
            icon={<ArrowRight size={14} />}
            iconPosition="end"
          />
        ),
      },
    ],
    []
  )

  return (
    <div style={{ paddingInline: '0.8rem', paddingTop: 8, height: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ marginTop: 8 }}>
          <Tag
            style={{
              borderRadius: 14,
              paddingInline: 10,
              paddingBlock: 2,
              fontSize: 12,
            }}
          >
            {pagination.total || 0} Total Rows
          </Tag>
        </div>

        <Space
          align="center"
          size={8}
          style={{ marginTop: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}
        >
          <Input
            placeholder="Search in table..."
            value={searchText}
            onChange={handleSearchChange}
            allowClear
            style={{ width: 280, maxWidth: '100%' }}
          />
        </Space>
      </div>

      <div style={{ marginTop: 12 }}>
        <Table
          rowKey={(record, index) => `${record.employeeId}-${index}`}
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
          bordered
          scroll={{ y: 'calc(100vh - 220px)', x: 'max-content' }}
        />

        <Pagination
          style={{
            textAlign: 'right',
            marginTop: 12,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={(page, pageSize) =>
            setPagination((prev) => ({
              ...prev,
              current: page,
              pageSize,
            }))
          }
          showSizeChanger
          pageSizeOptions={['10', '20', '30', '50', '100']}
        />
      </div>
    </div>
  )
}

export default PendingFNF