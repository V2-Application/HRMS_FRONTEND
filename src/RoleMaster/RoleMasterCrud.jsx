import { Button, Input, message, Popconfirm, Space, Switch, Table, Tag, Tooltip } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { EditOutlined, PlusOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { GetAllRoles, toggleRole } from '../services/Services'
import AddRoleModal from './AddRoleModal'
import RoleMasterUploader from './RoleMasterUploader'

const { Search } = Input

/**
 * Masters -> Role Master. The HR-maintained role list (dbo.tblRoleMaster) that
 * the Role field on the employee profile and the candidate page picks from.
 *
 * This is NOT the V2 Parivar portal/RBAC role list (tblRole) - those drive page
 * access and the approval layers and are managed under Settings. Nothing here
 * touches them.
 *
 * Create, rename, and switch active/inactive. Deliberately no delete: employees
 * and candidates reference these rows, so retiring one means deactivating it,
 * which removes it from the dropdowns while leaving existing holders alone.
 *
 * Page visibility is RBAC-driven (submodule "Role Master", granted to
 * IT Superadmin only), so there is no role check in here.
 */
const RoleMasterCrud = () => {
  const [roles, setRoles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [togglingRoleId, setTogglingRoleId] = useState(null)
  const [isUploaderOpen, setIsUploaderOpen] = useState(false)

  const fetchData = async () => {
    try {
      setIsLoading(true)

      const response = await GetAllRoles()

      if (response.status === 200) {
        setRoles(response.data?.data || [])
      }
    } catch (error) {
      console.error('role api error:', error)
      message.error(error?.response?.data?.message || 'Error in fetching roles')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    const q = searchTerm.toLowerCase().trim()
    if (!q) return roles

    return roles.filter(
      (r) =>
        r?.roleName?.toLowerCase().includes(q) ||
        r?.description?.toLowerCase().includes(q) ||
        (r?.isActive ? 'active' : 'inactive') === q,
    )
  }, [searchTerm, roles])

  const handleToggleStatus = async (roleId) => {
    if (typeof roleId !== 'number') {
      message.error('Invalid operation!')
      return false
    }

    try {
      setTogglingRoleId(roleId)

      const response = await toggleRole(roleId)

      if (response.status === 200) {
        message.success(response.data?.message)
        setRoles((prev) =>
          prev.map((r) => (r?.roleId === roleId ? { ...r, isActive: !r?.isActive } : r)),
        )
      }
    } catch (error) {
      console.error('Error updating role status:', error)
      message.error(error?.response?.data?.message || 'Unable to update status!')
    } finally {
      setTogglingRoleId(null)
    }
  }

  const columns = useMemo(
    () => [
      {
        title: 'Role Name',
        dataIndex: 'roleName',
        key: 'roleName',
        width: 220,
        ellipsis: true,
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        width: 320,
        ellipsis: true,
        render: (text) => (
          <Tooltip title={text}>
            <span>{text || '-'}</span>
          </Tooltip>
        ),
      },
      {
        title: 'Employees',
        dataIndex: 'employeeCount',
        key: 'employeeCount',
        width: 110,
        sorter: (a, b) => (a.employeeCount ?? 0) - (b.employeeCount ?? 0),
        render: (count) => count ?? 0,
      },
      {
        title: 'Candidates',
        dataIndex: 'candidateCount',
        key: 'candidateCount',
        width: 110,
        sorter: (a, b) => (a.candidateCount ?? 0) - (b.candidateCount ?? 0),
        render: (count) => count ?? 0,
      },
      {
        title: 'Status',
        dataIndex: 'isActive',
        key: 'isActive',
        width: 100,
        render: (isActive) => (
          <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag>
        ),
      },
      {
        title: 'Created By',
        dataIndex: 'createdBy',
        key: 'createdBy',
        width: 130,
        ellipsis: true,
        render: (text) => text || '-',
      },
      {
        title: 'Created On',
        dataIndex: 'createdOn',
        key: 'createdOn',
        width: 130,
        render: (v) => (v && dayjs(v).isValid() ? dayjs(v).format('DD MMM YYYY') : '-'),
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 130,
        fixed: 'right',
        render: (_, record) => {
          const rowLoading = togglingRoleId === record?.roleId

          return (
            <Space style={{ gap: '1rem' }}>
              <Tooltip title="Edit role">
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingRole(record)
                    setIsModalOpen(true)
                  }}
                />
              </Tooltip>

              <Popconfirm
                title={record?.isActive ? 'Deactivate role?' : 'Activate role?'}
                description={
                  record?.isActive
                    ? `${record?.employeeCount ?? 0} employee(s) and ${
                        record?.candidateCount ?? 0
                      } candidate(s) carry this role. They keep it — it just stops being offered in the Role dropdowns.`
                    : 'This role will be offered in the Role dropdowns again.'
                }
                onConfirm={() => handleToggleStatus(record?.roleId)}
                okText="Yes"
                cancelText="No"
              >
                {/* no optimistic flip: the switch moves only after the API succeeds */}
                <Switch
                  checked={record?.isActive}
                  loading={rowLoading}
                  onClick={(_checked, e) => e.preventDefault()}
                />
              </Popconfirm>
            </Space>
          )
        },
      },
    ],
    [togglingRoleId],
  )

  const totalWidth = columns.reduce((acc, c) => acc + (c.width || 0), 0)

  return (
    <>
      <AddRoleModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        refreshData={fetchData}
        editingRole={editingRole}
      />

      <RoleMasterUploader
        isOpen={isUploaderOpen}
        setIsOpen={setIsUploaderOpen}
        refreshData={fetchData}
      />

      <Space
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'end',
          marginBottom: '0.6rem',
        }}
      >
        <Button icon={<ReloadOutlined />} onClick={fetchData} disabled={isLoading}>
          Refresh
        </Button>

        <Button icon={<UploadOutlined />} onClick={() => setIsUploaderOpen(true)}>
          Bulk Upload
        </Button>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingRole(null)
            setIsModalOpen(true)
          }}
        >
          Add New Role
        </Button>

        <Search
          allowClear
          placeholder="Search in table"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Space>

      <Table
        rowKey="roleId"
        loading={isLoading}
        dataSource={filteredData}
        columns={columns}
        pagination={{ pageSize: 50, showSizeChanger: true }}
        scroll={{ x: totalWidth, y: 'calc(100vh - 260px)' }}
      />
    </>
  )
}

export default RoleMasterCrud
