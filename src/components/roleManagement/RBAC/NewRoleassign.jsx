import React, { useEffect, useState } from 'react'
import { Table, Button, Space, Card, Typography, Input, message, Select } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import {
  fetchRoles,
  getEmpRole,
  postEmpRoleMap,
  getRBACHierarchy,
} from '../../../services/Services'
import axiosInstance from '../../../services/axiosInstance'
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../../../redux/uiSlice'
import EmpRoleMap from './EmpRoleMap'
import { useActionsMap } from '../../../utils/useActionsMap'

const { Title } = Typography

const NewRoleassign = () => {
  const dispatch = useDispatch()

  // Roles for inline dropdown
  const [roles, setRoles] = useState([])
  const [rolesLoading, setRolesLoading] = useState(false)

  // RBAC structures (kept for your page)
  const [hierarchy, setHierarchy] = useState([])
  const [initialHierarchy, setInitialHierarchy] = useState([])
  const [modules, setModules] = useState([])

  // Employee ↔ Role table
  const [empRoleRows, setEmpRoleRows] = useState([])
  const [empRoleLoading, setEmpRoleLoading] = useState(false)
  const [empRoleSearch, setEmpRoleSearch] = useState('')

  // Inline editing
  const [editingRowId, setEditingRowId] = useState(null)
  const [editingRoleId, setEditingRoleId] = useState(null)
  const [submitLoadingId, setSubmitLoadingId] = useState(null)

  // Table pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100) // default 100 rows

  const { filteredSideMenu } = useSelector((state) => state?.auth)
  const actionsMap = useActionsMap(filteredSideMenu)

  const normalizeRoles = (list) =>
    (list || [])
      .map((r) => ({
        id: String(r.id ?? r.roleId ?? r.value ?? r.key),
        roleName: r.roleName ?? r.name ?? r.label ?? String(r.roleId ?? r.id ?? ''),
      }))
      .filter((r) => r?.roleName?.trim()?.toLowerCase() !== 'it superadmin')
      .filter((r) => r.id && r.roleName)

  const loadRoles = async () => {
    try {
      setRolesLoading(true)
      const response = await fetchRoles()
      setRoles(response?.status === 200 ? normalizeRoles(response?.data?.data || []) : [])
    } catch {
      setRoles([])
    } finally {
      setRolesLoading(false)
    }
  }

  const getRBAC = async () => {
    try {
      await dispatch(set({ loading: true }))
      const response = await getRBACHierarchy()
      if (response?.status === 200) {
        const data = response?.data?.data?.data || []
        setHierarchy(JSON.parse(JSON.stringify(data)))
        setInitialHierarchy(JSON.parse(JSON.stringify(data)))
        const allModules = []
        data.forEach((roleData) =>
          roleData?.modules?.forEach((m) => {
            if (!allModules.find((x) => x.moduleName === m.moduleName)) allModules.push(m)
          }),
        )
        setModules(allModules)
      } else {
        setHierarchy([])
        setInitialHierarchy([])
        setModules([])
      }
    } finally {
      await dispatch(set({ loading: false }))
    }
  }

  // used by the RBAC effect below to refresh after upsert
  const fetchUpdatedRBAC = async () => {
    try {
      await dispatch(set({ loading: true }))
      const response = await getRBACHierarchy()
      if (response?.status === 200) {
        const data = response?.data?.data?.data || []
        setHierarchy(JSON.parse(JSON.stringify(data)))
        setInitialHierarchy(JSON.parse(JSON.stringify(data)))
        const allModules = []
        data.forEach((roleData) =>
          roleData?.modules?.forEach((m) => {
            if (!allModules.find((x) => x.moduleName === m.moduleName)) allModules.push(m)
          }),
        )
        setModules(allModules)
      }
    } finally {
      await dispatch(set({ loading: false }))
    }
  }

  const loadEmpRoles = async () => {
    try {
      setEmpRoleLoading(true)
      const res = await getEmpRole()
      const raw = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : []
      const rows = raw.map((r, idx) => ({
        _id:
          r.id ?? r.employeeRoleId ?? r.employeeId ?? r.empId ?? r.ecode ?? r.employeeCode ?? idx,
        employeeId: r.employeeId ?? r.empId ?? r.id ?? null,
        employeeName: r.employeeName ?? r.name ?? r.fullName ?? r.empName ?? '-',
        ecode: r.ecode ?? r.employeeCode ?? r.empCode ?? '-',
        roleId: r.roleId != null ? String(r.roleId) : r.role_id != null ? String(r.role_id) : null,
        roleName: r.roleName ?? r.role ?? r.role_title ?? '-',
        _raw: r,
      }))
      setEmpRoleRows(rows)
      setCurrentPage(1) // reset to first page on fresh data
    } catch {
      setEmpRoleRows([])
    } finally {
      setEmpRoleLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'Role Assignment'
    ;(async () => {
      await dispatch(set({ loading: true }))
      try {
        await Promise.all([loadRoles(), getRBAC(), loadEmpRoles()])
      } finally {
        await dispatch(set({ loading: false }))
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const deepEqual = (a, b) => {
    if (a === b) return true
    if (a == null || b == null) return false
    if (typeof a !== 'object' || typeof b !== 'object') return a === b
    const ak = Object.keys(a)
    const bk = Object.keys(b)
    if (ak.length !== bk.length) return false
    for (const k of ak) {
      if (!bk.includes(k)) return false
      if (!deepEqual(a[k], b[k])) return false
    }
    return true
  }

  const getChangedRoles = () => {
    const out = []
    hierarchy.forEach((curr) => {
      const init = initialHierarchy.find((r) => r.roleName === curr.roleName)
      if (init && !deepEqual(curr, init)) out.push(curr)
    })
    return out
  }

  const getModuleCheckState = (roleName, moduleName) => {
    const roleData = hierarchy.find((h) => h.roleName === roleName)
    const moduleData = roleData?.modules?.find((m) => m.moduleName === moduleName)
    if (!moduleData?.subModules?.length) return { checked: false, indeterminate: false }
    let allChecked = true
    let someChecked = false
    moduleData.subModules.forEach((sm) => {
      if (sm.subModuleStatus) someChecked = true
      else allChecked = false
      sm.actions?.forEach((a) => {
        if (a.actionStatus) someChecked = true
        else allChecked = false
        a.furtherParts?.forEach((p) => {
          if (p.furtherPartStatus) someChecked = true
          else allChecked = false
        })
      })
    })
    return { checked: allChecked && someChecked, indeterminate: someChecked && !allChecked }
  }

  const toggleAllRights = (roleName, moduleName, checked) => {
    setHierarchy((prev) =>
      prev.map((roleData) =>
        roleData.roleName === roleName
          ? {
              ...roleData,
              modules: roleData.modules.map((module) =>
                module.moduleName === moduleName
                  ? {
                      ...module,
                      moduleStatus: checked,
                      subModules: module.subModules.map((sm) => ({
                        ...sm,
                        subModuleStatus: checked,
                        actions:
                          sm.actions?.length > 0
                            ? sm.actions.map((a) => ({
                                ...a,
                                actionStatus: checked,
                                furtherParts:
                                  a.furtherParts?.map((p) => ({
                                    ...p,
                                    furtherPartStatus: checked,
                                  })) || [],
                              }))
                            : sm.actions,
                      })),
                    }
                  : module,
              ),
            }
          : roleData,
      ),
    )
  }

  useEffect(() => {
    const changed = getChangedRoles()
    if (changed.length > 0) {
      ;(async () => {
        try {
          await axiosInstance.post('/api/RBAC/upsert-rbac-nodes', changed)
          await fetchUpdatedRBAC()
        } catch {}
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleAllRights])

  // Submit via postEmpRoleMap (bulk-upsert) with just the edited row
  const submitEdit = async (row) => {
    if (!editingRoleId) {
      message.warning('Please select a role')
      return
    }
    const selected = roles.find((r) => r.id === String(editingRoleId))
    if (!selected) {
      message.error('Invalid role selected')
      return
    }
    const payload = {
      employeeRoles: [
        {
          ecode: row.ecode,
          roleName: selected.roleName,
        },
      ],
    }
    try {
      setSubmitLoadingId(row._id)
      await postEmpRoleMap(payload)
      message.success(`Role mapped: ${row.ecode} → ${selected.roleName}`)
      setEditingRowId(null)
      setEditingRoleId(null)
      await loadEmpRoles()
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed to map role')
    } finally {
      setSubmitLoadingId(null)
    }
  }

  const startEdit = (row) => {
    const matchedByName = roles.find(
      (r) => String(r.roleName || '').toLowerCase() === String(row.roleName || '').toLowerCase(),
    )
    setEditingRowId(row._id)
    setEditingRoleId(
      row.roleId != null ? String(row.roleId) : (matchedByName?.id ?? roles[0]?.id ?? null),
    )
  }

  const cancelEdit = () => {
    setEditingRowId(null)
    setEditingRoleId(null)
  }

  // --- Refresh button handler: clears input and reloads ---
  const handleRefresh = () => {
    setEmpRoleSearch('') // clear the search input
    setCurrentPage(1) // optional: reset to first page
    loadEmpRoles() // reload data
  }

  const empRoleColumns = [
    { title: 'Employee Name', dataIndex: 'employeeName', key: 'employeeName', ellipsis: true },
    { title: 'Ecode', dataIndex: 'ecode', key: 'ecode', width: 140, ellipsis: true },
    {
      title: 'Role Name',
      dataIndex: 'roleName',
      key: 'roleName',
      ellipsis: true,
      render: (text, row) => {
        const isEditing = editingRowId === row._id
        if (!isEditing) return <span>{text}</span>
        return (
          <Select
            showSearch
            loading={rolesLoading}
            value={editingRoleId}
            onChange={setEditingRoleId}
            placeholder="Select role"
            style={{ width: 260 }}
            optionFilterProp="children"
            filterOption={(input, option) =>
              String(option?.children || '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {roles.map((r) => (
              <Select.Option key={r.id} value={r.id}>
                {r.roleName}
              </Select.Option>
            ))}
          </Select>
        )
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 260,
      render: (_, row) => {
        const isEditing = editingRowId === row._id
        if (!isEditing) {
          return (
            <Space>
              <Button size="small" icon={<EditOutlined />} onClick={() => startEdit(row)}>
                Edit
              </Button>
              <Button size="small" type="primary" onClick={() => startEdit(row)}>
                Submit
              </Button>
            </Space>
          )
        }
        return (
          <Space>
            <Button
              size="small"
              type="primary"
              onClick={() => submitEdit(row)}
              loading={submitLoadingId === row._id}
            >
              Submit
            </Button>
            <Button size="small" onClick={cancelEdit}>
              Cancel
            </Button>
          </Space>
        )
      },
    },
  ]

  // Filtered data for table
  const filteredData = empRoleRows.filter((r) =>
    `${r.employeeName} ${r.ecode} ${r.roleName}`
      .toLowerCase()
      .includes(empRoleSearch.trim().toLowerCase()),
  )

  return (
    <div>
      {/* PAGE HEADING */}
      <Title level={3} style={{ marginTop: 4, marginLeft: 7, marginRight: 7, marginBottom: 33 }}>
        Role Assignment
      </Title>

      <style>
        {`
          .ant-checkbox-inner { border: 2px solid #333 !important; border-radius: 4px; }
          .ant-checkbox-checked .ant-checkbox-inner { background-color: #1890ff; border-color: #1890ff !important; }
          .ant-checkbox-indeterminate .ant-checkbox-inner { background-color: #1890ff; border-color: #1890ff !important; }
          .ant-checkbox-indeterminate .ant-checkbox-inner::after { background-color: #fff; }
        `}
      </style>

      {/* Optional top controls */}
      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        {actionsMap?.emproleform?.actionStatus && <EmpRoleMap roles={roles} />}
      </Space>

      <Card
        title="Employee Roles"
        size="small"
        extra={
          <Space>
            <Input.Search
              placeholder="Search by name, ecode or role…"
              allowClear
              value={empRoleSearch}
              onChange={(e) => setEmpRoleSearch(e.target.value)}
              style={{ width: 260 }}
            />
            <Button onClick={handleRefresh}>Refresh</Button>
          </Space>
        }
        style={{ marginTop: 8, marginBottom: 16 }}
      >
        <Table
          rowKey={(row) => row._id}
          columns={empRoleColumns}
          dataSource={filteredData}
          loading={empRoleLoading}
          size="small"
          bordered
          // Fixed height / scroll
          scroll={{ y: 500, x: 400 }}
          // Fully controlled pagination so size changes reflect immediately
          pagination={{
            current: currentPage,
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100', '200'],
            onChange: (page, size) => {
              setCurrentPage(page)
              setPageSize(size)
            },
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </Card>
    </div>
  )
}

export default NewRoleassign
