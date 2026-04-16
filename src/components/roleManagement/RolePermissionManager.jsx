import React, { useEffect, useState } from 'react'
import { Checkbox, Button, Typography, message, Table, Space, Select } from 'antd'
import allComponents from './allComponentsList'
import { fetchRBACPermissions, saveRBACPermissions } from '../../services/Services'
import { useDispatch } from 'react-redux'
import { set } from '../../redux/uiSlice'

const { Title } = Typography

const roles = [
  { roleName: 'Admin', roleId: 1 },
  { roleName: 'HR', roleId: 2 },
  { roleName: 'Employee', roleId: 3 },
  { roleName: 'Manager', roleId: 4 },
  { roleName: 'Audit', roleId: 5 },
  { roleName: 'Applicant', roleId: 6 },
  { roleName: 'ClusterManager', roleId: 7 },
  { roleName: 'StoreHR', roleId: 8 },
  { roleName: 'SuperAdmin', roleId: 9 },
  { roleName: 'Master', roleId: 10 },
  { roleName: 'RetailHead', roleId: 11 },
  { roleName: 'Finance', roleId: 12 },
]

// helper to create an empty matrix keyed by roleName -> component -> { read, write }
const createEmptyMatrix = () => {
  const matrix = {}
  roles.forEach((r) => {
    matrix[r?.roleName] = {}
    allComponents.forEach((c) => {
      matrix[r?.roleName][c] = { read: false, write: false }
    })
  })

  return matrix
}

const RolePermissionManager = () => {
  const dispatch = useDispatch()
  const [selectedComponent, setSelectedComponent] = useState([])
  // initial snapshot (to detect differences)
  const [initialAccessMatrix, setInitialAccessMatrix] = useState(createEmptyMatrix())
  // editable matrix bound to UI
  const [accessMatrix, setAccessMatrix] = useState(createEmptyMatrix())
  // map key: `${roleId}|${componentName}` -> roleComponentId (if exists from backend)
  const [rcIdMap, setRcIdMap] = useState({})
  const [filteredData, setFilteredData] = useState([])

  // build an array payload of changed permissions in the shape required by backend
  // uses role?.roleId from roles array of objects
  const buildPayload = () => {
    const payload = []

    roles.forEach((r) => {
      const roleName = r?.roleName
      const rId = r?.roleId

      if (rId === null) {
        message.error(`RoleId missing for role ${roleName}`)
      }

      allComponents.forEach((component) => {
        const initial = initialAccessMatrix[roleName]?.[component] || { read: false, write: false }
        const current = accessMatrix[roleName]?.[component] || { read: false, write: false }

        // only include if changed (keeps payload minimal)
        if (initial?.read !== current?.read || initial?.write !== current?.write) {
          if (rId === null) return // skip entries with no roleId
          payload.push({
            roleId: rId,
            componentName: component,
            isRead: !!current?.read,
            isWrite: !!current?.write,
          })
        }
      })
    })

    return payload
  }

  const updateAccess = (roleName, component, type, checked) => {
    setAccessMatrix((prev) => ({
      ...prev,
      [roleName]: {
        ...prev[roleName],
        [component]: {
          // keep other permissions intact
          ...(prev[roleName]?.[component] || { read: false, write: false }),
          [type]: checked,
        },
      },
    }))
  }

  const fetchRBACData = async () => {
    try {
      dispatch(set({ loading: true }))
      const response = await fetchRBACPermissions()
      // console.log('fetch rbac api res: ', response)

      if (response?.status === 200) {
        const rows = response?.data?.data ?? []

        // if (Array.isArray(rows)) {
        //   message.error('Unexpected Api response format')
        // }

        // create fresh matrices
        const baseMatrix = createEmptyMatrix()
        const baseRcIdMap = {}

        rows?.forEach((item) => {
          const componentName = item?.componentName
          const roleId = item?.roleId
          const roleNameFromItem = item?.roleName

          // prefer roleName from item, otherwise find it from roles array using roleId
          let roleName = roleNameFromItem

          if (!roleName) {
            const roleObj = roles?.find((r) => r?.roleId === roleId)
            roleName = roleObj?.roleName ?? null
          }

          if (!baseMatrix[roleName]) {
            // defensive: if roles list doesn't include this reoleName, initialize it
            baseMatrix[roleName] = {}
            allComponents.forEach((c) => {
              baseMatrix[roleName][c] = { read: false, write: false }
            })
          }

          baseMatrix[roleName][componentName] = {
            read: !!item?.isRead,
            write: !!item?.isWrite,
          }

          if (item?.roleComponentId !== null) {
            baseRcIdMap[`${roleId}|${componentName}`] = item?.roleComponentId
          }
        })

        // hydrate both initial snapshot and editable matrix
        setInitialAccessMatrix(JSON.parse(JSON.stringify(baseMatrix)))
        setAccessMatrix(JSON.parse(JSON.stringify(baseMatrix)))
        setRcIdMap(baseRcIdMap)
      }
    } catch (error) {
      console.error('fetch api error: ', error)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchRBACData()
  }, [])

  const handleSave = async () => {
    const changedData = buildPayload()
    // console.log('Changed Access Payload:', changedData)

    if (changedData?.length === 0) {
      message.info('No data to save')
      return false
    }

    try {
      dispatch(set({ loading: true }))
      const response = await saveRBACPermissions(changedData)
      // console.log('post RBAC api response: ', response)

      if (response?.status === 200) {
        message.success(response?.data?.message)
        setInitialAccessMatrix(JSON.parse(JSON.stringify(accessMatrix)))

        // if backend returns created/updated roleComponentIds, merge them into rcIdMap
      } else {
        message.error(response?.response?.data?.message || 'Error in saving changes')
      }
    } catch (error) {
      console.error('error submitting api: ', error)
      message.error(error?.response?.data?.message || 'Error in saving changes')
    } finally {
      dispatch(set({ loading: false }))
      fetchRBACData()
    }
  }

  // prepare dataSource for antd Table
  const dataSource = allComponents.map((comp) => ({
    key: comp,
    component: comp,
  }))

  // columns: first column is Component name, then one column per role
  const columns = [
    {
      title: 'Component',
      dataIndex: 'component',
      key: 'component',
      fixed: 'left',
      width: 100,
      render: (text) => <div style={{ paddingLeft: 8 }}>{text}</div>,
    },
    // dynamic role columns
    ...roles.map((role) => ({
      title: role.roleName,
      dataIndex: role.roleName,
      key: `${role.roleName}`,
      align: 'center',
      width: 50,
      // render receives (_, record) where record.component is the component name
      render: (_, record) => {
        const component = record.component
        const value = accessMatrix[role.roleName]?.[component] || { read: false, write: false }
        return (
          <div>
            <Space direction="horizontal" size="small" wrap>
              <Checkbox
                checked={!!value.read}
                onChange={(e) => updateAccess(role.roleName, component, 'read', e.target.checked)}
              >
                Read
              </Checkbox>
              <Checkbox
                checked={!!value.write}
                onChange={(e) => updateAccess(role.roleName, component, 'write', e.target.checked)}
              >
                Write
              </Checkbox>
            </Space>
          </div>
        )
      },
    })),
  ]

  const handleComponentChange = (value) => {
    // console.log('value: ', value)
    // console.log('datasource: ', dataSource)

    const filtered = dataSource.filter((item) => item?.component === value)

    // console.log('filtered: ', filtered)

    if (filtered?.length > 0) setFilteredData(filtered)
    else setFilteredData(dataSource)
  }

  useEffect(() => {
    // console.log('selected component: ', selectedComponent)
    // const filtered = dataSource.filter((item) => item?.component === selectedComponent)
    const filtered = dataSource.filter((item) => selectedComponent?.includes(item?.component))

    if (filtered?.length > 0) setFilteredData(filtered)
    else setFilteredData(dataSource)
  }, [selectedComponent])

  const tableWidth = columns.reduce((sum, col) => sum + (col.width || 50), 0)

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3}>Component Access Management</Title>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Select
            mode="multiple"
            showSearch
            optionFilterProp="children"
            allowClear
            placeholder="Select component"
            style={{ width: '18rem', maxWidth: '22rem' }}
            value={selectedComponent}
            onChange={(value) => setSelectedComponent(value)}
          >
            <Select.Option value="__placeholder" disabled>
              Select Component
            </Select.Option>
            {allComponents.map((comp) => (
              <Select.Option value={comp} key={comp}>
                {comp}
              </Select.Option>
            ))}
          </Select>

          <Button type="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <Table
          dataSource={filteredData}
          columns={columns}
          scroll={{ x: tableWidth, y: 'calc(100vh - 100px)' }}
          sticky
          bordered
          rowKey="key"
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </div>
    </>
  )
}

export default RolePermissionManager
