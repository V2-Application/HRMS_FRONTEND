import { Space, Table, Input, Button, Tooltip, message, Tag } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { filterBySearch, getApiError } from '../../helpers'
import Pageheading from '../../../components/shared/Pageheading'
import { EditOutlined, PlusOutlined, StepForwardOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { getVendorEmployeesByContractorCode } from '../../../services/Services'
import VendorEmployeesBulkUploadModal from './VendorEmployeesBulkUploadModal'

const { Search } = Input

const Index = () => {
  const navigate = useNavigate()

  // ✅ FIX: support both param names
  const { vendorCode, contractorCode: routeContractorCode } = useParams()
  const contractorCode = routeContractorCode || vendorCode

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [employees, setEmployees] = useState([])

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  const employeeColumns = [
    { title: 'Name', dataIndex: 'fullName' },
    { title: 'Emp Code', dataIndex: 'ecode' },
    {
      title: 'D.O.J.',
      dataIndex: 'doj',
      render: (date) => (date ? String(date).split('T')[0] : '-'),
    },
    {
      title: 'Contract Start Date',
      dataIndex: 'contractStartDate',
      render: (date) => (date ? String(date).split('T')[0] : '-'),
    },
    {
      title: 'Contract End Date',
      dataIndex: 'contractEndDate',
      render: (date) => (date ? String(date).split('T')[0] : '-'),
    },
    { title: 'Department', dataIndex: 'departmentName' },
    {
      title: 'Sub-Department',
      key: 'subDepartment',
      render: (_, row) =>
        [row.subDepartmentName1, row.subDepartmentName2, row.subDepartmentName3]
          .filter(Boolean)
          .join(' ▸ ') || '-',
    },
    { title: 'Designation', dataIndex: 'designationName' },
    { title: 'Shift', dataIndex: 'shiftName' },
    {
      title: 'Status',
      dataIndex: 'isActive',
      render: (status) => (
        <Tag color={status ? 'green' : 'red'}>{status ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: "Rate/Day",
      dataIndex: "contractorRatePerDay",
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, row) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              size="small"
              icon={<StepForwardOutlined />}
              onClick={() =>
                navigate(`/vendor/manpower/master-form/view/${contractorCode}/${row?.ecode}`)
              }
            />
          </Tooltip>

          <Tooltip title="Edit Details">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() =>
                navigate(`/vendor/manpower/master-form/update/${contractorCode}/${row?.ecode}`)
              }
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPagination((prev) => ({ ...prev, current: 1 }))
  }

  const filteredData = useMemo(() => filterBySearch(search, employees), [search, employees])

  const fetchEmployees = async (code, searchTerm, page = 1, pageSize = 10) => {
    try {
      const response = await getVendorEmployeesByContractorCode(
        code,
        searchTerm,
        null,
        page,
        pageSize,
      )

      if (response?.status === 200) {
        const {
          currentPage,
          pageSize: serverPageSize,
          totalRecords,
          employees: list = [],
        } = response.data?.data || {}

        setEmployees(list)

        setPagination((prev) => ({
          ...prev,
          current: currentPage || page,
          pageSize: serverPageSize || pageSize,
          total: totalRecords || 0,
        }))
      }
    } catch (error) {
      const errMsg = getApiError(error, 'Error fetching employees data')
      message.error(errMsg)
      setEmployees([])
      setPagination((prev) => ({ ...prev, total: 0 }))
    }
  }

  useEffect(() => {
    if (contractorCode) {
      fetchEmployees(contractorCode, debouncedSearch, pagination.current, pagination.pageSize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractorCode, debouncedSearch, pagination.current, pagination.pageSize])

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search.trim()), 800)
    return () => clearTimeout(handler)
  }, [search])

  return (
    <>
      <Space
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.6rem',
        }}
      >
        <Pageheading title="Vendor Resources" fontSize="1.5rem" marginBottom="0" marginTop="0" />
        <Space>
          <VendorEmployeesBulkUploadModal
            contractorCode={contractorCode}
            refreshData={() => fetchEmployees(contractorCode, debouncedSearch, 1, 10)}
          />
          <Tooltip title="Create new employee">
            <Button
              icon={<PlusOutlined />}
              onClick={() => navigate(`/vendor/manpower/master-form/${contractorCode}`)}
            />
          </Tooltip>

          <Search placeholder="Search in table..." value={search} onChange={handleSearchChange} />
        </Space>
      </Space>

      <Table
        size="small"
        rowKey="employeeId"
        columns={employeeColumns}
        dataSource={filteredData}
        scroll={{ y: '55vh' }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            setPagination((prev) => ({ ...prev, current: page, pageSize }))
          },
        }}
      />
    </>
  )
}

export default Index
