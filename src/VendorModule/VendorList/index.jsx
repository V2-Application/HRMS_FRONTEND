import { StepForwardOutlined } from '@ant-design/icons'
import { Button, Input, message, Pagination, Table, Tag, Tooltip } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRandomColorForTag } from '../helpers'
import { getContractorsList } from '../../services/Services'

const { Search } = Input

const Index = () => {
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(false)
  const [vendors, setVendors] = useState([])

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
    total: 0,
  })

  const hasTableRecords = vendors.length > 0

  // ✅ Search input change (only updates local state)
  const handleSearchChange = (e) => {
    setSearch(e.target.value)
  }

  // ✅ Debounce search + reset page to 1 when search changes
  useEffect(() => {
    const handler = setTimeout(() => {
      const term = search.trim()
      setDebouncedSearch(term)
      setPagination((prev) => ({ ...prev, current: 1 })) // IMPORTANT
    }, 800)

    return () => clearTimeout(handler)
  }, [search])

  // ✅ Fetch Vendors (includes searchTerm in API call)
  const fetchVendors = async (page = 1, pageSize = 100, searchTerm = '') => {
    try {
      setIsLoading(true)

      // ✅ hits api with searchTerm
      const response = await getContractorsList(searchTerm, page, pageSize)

      if (response?.status === 200) {
        const {
          currentPage,
          pageSize: serverPageSize,
          totalRecords,
          contractors = [],
        } = response.data?.data || {}

        const normalized = contractors.map((c) => ({
          ...c,
          employeeCount: c.employeeCount ?? 0,
          statusText: c.statusText ?? '-',
        }))

        setVendors(normalized)

        setPagination((prev) => ({
          ...prev,
          current: currentPage || page,
          pageSize: serverPageSize || pageSize,
          total: totalRecords || 0,
        }))
      } else {
        setVendors([])
        setPagination((prev) => ({ ...prev, total: 0 }))
      }
    } catch (error) {
      message.error(error?.response?.data?.message || 'Error fetching vendors')
      setVendors([])
      setPagination((prev) => ({ ...prev, total: 0 }))
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ API call whenever page/pageSize OR debouncedSearch changes
  useEffect(() => {
    fetchVendors(pagination.current, pagination.pageSize, debouncedSearch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, debouncedSearch])

  const columns = useMemo(
    () => [
      {
        title: 'Vendor Name',
        dataIndex: 'contractorName',
        key: 'contractorName',
        ellipsis: true,
        width: 220,
      },
      {
        title: 'Vendor Code',
        dataIndex: 'contractorCode',
        key: 'contractorCode',
        ellipsis: true,
        width: 160,
      },
      {
        title: 'Employees',
        dataIndex: 'employeeCount',
        key: 'employeeCount',
        ellipsis: true,
        width: 120,
        render: (count) => <Tag color={getRandomColorForTag()}>{count ?? 0}</Tag>,
      },
      {
        title: 'Status',
        dataIndex: 'statusText',
        key: 'statusText',
        ellipsis: true,
        width: 140,
        render: (val) => <Tag>{val ?? '-'}</Tag>,
      },
      {
        title: 'View',
        key: 'actions',
        align: 'center',
        width: 90,
        fixed: 'right',
        render: (_, record) => (
          <Tooltip title={`View Details for ${record.contractorName}`}>
            <Button
              size="small"
              icon={<StepForwardOutlined />}
              onClick={() => navigate(`/details/vendor/master-form/${record.contractorCode}`)}
            />
          </Tooltip>
        ),
      },
    ],
    [navigate],
  )

  const TABLE_BODY_HEIGHT = 500

  return (
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: 26, fontWeight: 600, marginBottom: 10 }}>VENDOR MASTER</div>

      <div
        style={{
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          background: '#fff',
          overflow: 'hidden',
        }}
      >
        {/* Top toolbar */}
        <div
          style={{
            padding: '10px 12px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <Search
            allowClear
            placeholder="Search in table..."
            value={search}
            onChange={handleSearchChange}
            style={{ width: 220 }}
          />
        </div>

        {/* Table + Sticky pagination */}
        <div style={{ position: 'relative' }}>
          <Table
            loading={isLoading}
            columns={columns}
            dataSource={vendors}
            rowKey="contractorCode"
            pagination={false}
            sticky
            scroll={hasTableRecords ? { y: TABLE_BODY_HEIGHT, x: 'max-content' } : undefined}
            size="middle"
          />

          <div
            style={{
              position: 'sticky',
              bottom: 0,
              zIndex: 5,
              background: '#fff',
              borderTop: '1px solid #f0f0f0',
              padding: '8px 12px',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              showSizeChanger
              pageSizeOptions={['10', '20', '50', '100', '200']}
              onChange={(page, pageSize) => {
                setPagination((prev) => ({ ...prev, current: page, pageSize }))
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Index
