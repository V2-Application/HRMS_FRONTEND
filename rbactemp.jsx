import React, { useEffect, useState } from 'react'
import { Table, Checkbox, Button, Space, Modal, Card, Row, Col, Typography } from 'antd'
import { fetchRoles, getRBACHierarchy } from '../../../services/Services'
import { EditOutlined } from '@ant-design/icons'
import axiosInstance from '../../../services/axiosInstance'
import NewRole from './NewRole'

const { Title, Text } = Typography

const RBAC = () => {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedModule, setSelectedModule] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const [hierarchy, setHierarchy] = useState([])
  const [initialHierarchy, setInitialHierarchy] = useState([])
  const [modules, setModules] = useState([])

  console.log('hierarchy: ', hierarchy)

  // fetch roles from API
  const getRoles = async () => {
    setLoading(true)
    try {
      const response = await fetchRoles()
      if (response?.status === 200) {
        const fetched = response?.data?.data || []
        setRoles(fetched)
      } else {
        console.error('Unexpected response while fetching roles:', response)
        setRoles([])
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err)
      setRoles([])
    } finally {
      setLoading(false)
    }
  }

  const fetchRBAC = async () => {
    try {
      const response = await getRBACHierarchy()

      if (response?.status === 200) {
        const hierarchyData = response?.data?.data?.data || []
        setHierarchy(JSON.parse(JSON.stringify(hierarchyData))) // Deep clone
        setInitialHierarchy(JSON.parse(JSON.stringify(hierarchyData))) // Deep clone

        // Extract unique modules from hierarchy data
        const allModules = []
        hierarchyData.forEach((roleData) => {
          if (roleData.modules) {
            roleData.modules.forEach((module) => {
              const existingModule = allModules.find((m) => m.moduleName === module.moduleName)
              if (!existingModule) {
                allModules.push(module)
              }
            })
          }
        })
        setModules(allModules)
      } else {
        setHierarchy([])
        setInitialHierarchy([])
        setModules([])
      }
    } catch (error) {
      console.log('error fetching api: ', error)
    }
  }

  useEffect(() => {
    getRoles()
    fetchRBAC()
  }, [])

  // Helper function to deep compare two objects
  const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true
    if (obj1 == null || obj2 == null) return false
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2

    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    if (keys1.length !== keys2.length) return false

    for (let key of keys1) {
      if (!keys2.includes(key)) return false
      if (!deepEqual(obj1[key], obj2[key])) return false
    }

    return true
  }

  // Function to detect changed role data
  const getChangedRoles = () => {
    const changedRoles = []

    hierarchy.forEach((currentRole) => {
      const initialRole = initialHierarchy.find((r) => r.roleName === currentRole.roleName)
      if (initialRole && !deepEqual(currentRole, initialRole)) {
        changedRoles.push(currentRole)
      }
    })

    return changedRoles
  }

  // Helper function to check if all actions are selected for a module
  const getModuleCheckState = (roleName, moduleName) => {
    const roleData = hierarchy.find((h) => h.roleName === roleName)
    const moduleData = roleData?.modules?.find((m) => m.moduleName === moduleName)

    if (!moduleData?.subModules || moduleData.subModules.length === 0) {
      return { checked: false, indeterminate: false }
    }

    let allChecked = true
    let someChecked = false

    moduleData.subModules.forEach((subModule) => {
      if (subModule.actions && subModule.actions.length > 0) {
        subModule.actions.forEach((action) => {
          if (action.actionStatus) someChecked = true
          if (!action.actionStatus) allChecked = false

          // Check further parts
          if (action.furtherParts && action.furtherParts.length > 0) {
            action.furtherParts.forEach((part) => {
              if (part.furtherPartStatus) someChecked = true
              if (!part.furtherPartStatus) allChecked = false
            })
          }
        })
      }
    })

    return {
      checked: allChecked && someChecked,
      indeterminate: someChecked && !allChecked,
    }
  }

  const toggleAllRights = async (roleName, moduleName, checked) => {
    setHierarchy((prevHierarchy) => {
      return prevHierarchy.map((roleData) => {
        if (roleData.roleName === roleName) {
          return {
            ...roleData,
            modules: roleData.modules.map((module) => {
              if (module.moduleName === moduleName) {
                return {
                  ...module,
                  moduleStatus: checked,
                  subModules: module.subModules.map((subModule) => ({
                    ...subModule,
                    subModuleStatus: checked,
                    actions: subModule.actions.map((action) => ({
                      ...action,
                      actionStatus: checked,
                      furtherParts: action.furtherParts.map((part) => ({
                        ...part,
                        furtherPartStatus: checked,
                      })),
                    })),
                  })),
                }
              }
              return module
            }),
          }
        }
        return roleData
      })
    })

    // Auto-save when toggling from main table
    const changedRoles = getChangedRoles()
    // setTimeout(() => {
    //   if (changedRoles.length > 0) {
    //     saveRBACData(changedRoles)
    //   }
    // }, 0)
  }

  const handleView = (roleName, moduleName) => {
    const roleData = hierarchy.find((h) => h.roleName === roleName)
    const moduleData = roleData?.modules?.find((m) => m.moduleName === moduleName)

    setSelectedModule(moduleData)
    setSelectedRole(roleName)
    setModalVisible(true)
  }

  const handleActionToggle = (
    roleName,
    moduleName,
    subModuleName,
    actionName,
    checked,
    isActionFurtherPart = false,
  ) => {
    setHierarchy((prevHierarchy) => {
      return prevHierarchy.map((roleData) => {
        if (roleData.roleName === roleName) {
          return {
            ...roleData,
            modules: roleData.modules.map((module) => {
              if (module.moduleName === moduleName) {
                return {
                  ...module,
                  subModules: module.subModules.map((subModule) => {
                    if (subModule.subModuleName === subModuleName) {
                      return {
                        ...subModule,
                        actions: subModule.actions.map((action) => {
                          // If toggling a main action
                          if (!isActionFurtherPart && action.actionName === actionName) {
                            return {
                              ...action,
                              actionStatus: checked,
                            }
                          }
                          // If toggling a further part
                          if (isActionFurtherPart) {
                            return {
                              ...action,
                              furtherParts: action.furtherParts.map((part) => {
                                if (part.actionFurtherPartName === actionName) {
                                  return {
                                    ...part,
                                    furtherPartStatus: checked,
                                  }
                                }
                                return part
                              }),
                            }
                          }
                          return action
                        }),
                      }
                    }
                    return subModule
                  }),
                }
              }
              return module
            }),
          }
        }
        return roleData
      })
    })
  }

  const handleModalOk = () => {
    // Get only the changed role data and send to API
    const changedRoles = getChangedRoles()

    if (changedRoles.length > 0) {
      console.log('Changed roles to send to API:', changedRoles)
      saveRBACData(changedRoles)
    } else {
      console.log('No changes detected')
    }

    setModalVisible(false)
  }

  const handleModalCancel = () => {
    setModalVisible(false)
  }

  // table data source built from fetched roles
  const dataSource = roles.map((r) => ({
    key: r.roleId ?? r.roleName,
    roleName: r.roleName,
  }))

  const saveRBACData = async (changedData) => {
    try {
      console.log('Sending changed data to API:', changedData)
      const response = await axiosInstance.post('/api/RBAC/upsert-rbac-nodes', changedData)
      console.log('submit rbac api response: ', response)

      // Update initial hierarchy after successful save
      if (response?.status === 200) {
        setInitialHierarchy(JSON.parse(JSON.stringify(hierarchy)))
      }
    } catch (error) {
      console.error('error submitting rbac api: ', error)
    }
  }

  useEffect(() => {
    const changedData = getChangedRoles()
    if (changedData?.length > 0) saveRBACData(changedData)
  }, [toggleAllRights])

  // Helper function to get action status from hierarchy
  const getActionStatus = (
    roleName,
    moduleName,
    subModuleName,
    actionName,
    isActionFurtherPart = false,
  ) => {
    const roleData = hierarchy.find((h) => h.roleName === roleName)
    const moduleData = roleData?.modules?.find((m) => m.moduleName === moduleName)
    const subModuleData = moduleData?.subModules?.find((sm) => sm.subModuleName === subModuleName)

    if (!subModuleData) return false

    if (isActionFurtherPart) {
      // Look for the action name in furtherParts
      for (const action of subModuleData.actions || []) {
        const part = action.furtherParts?.find((p) => p.actionFurtherPartName === actionName)
        if (part) return part.furtherPartStatus || false
      }
    } else {
      // Look for the action directly
      const action = subModuleData.actions?.find((a) => a.actionName === actionName)
      return action?.actionStatus || false
    }

    return false
  }

  // columns: first column Roles, then one column per module
  const columns = [
    {
      title: 'Roles',
      dataIndex: 'roleName',
      key: 'role',
      width: 100,
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    ...modules.map((module) => ({
      title: module.moduleName,
      dataIndex: module.moduleName,
      key: module.moduleName,
      align: 'center',
      width: 150,
      render: (_text, record) => {
        const roleName = record.roleName
        const checkState = getModuleCheckState(roleName, module.moduleName)
        return (
          <Space
            direction="vertical"
            size="small"
            style={{
              width: '100%',
              display: 'flex',
              gap: '10px',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Checkbox
              checked={checkState.checked}
              indeterminate={checkState.indeterminate}
              onChange={(e) => toggleAllRights(roleName, module.moduleName, e.target.checked)}
            ></Checkbox>

            {(checkState.checked || checkState.indeterminate) && (
              <Button
                size="small"
                onClick={() => handleView(roleName, module.moduleName)}
                icon={<EditOutlined />}
              ></Button>
            )}
          </Space>
        )
      },
    })),
  ]

  return (
    <div>
      <style>
        {`
          .ant-checkbox-inner {
            border: 2px solid #333 !important;
            border-radius: 4px;
          }
          .ant-checkbox-checked .ant-checkbox-inner {
            background-color: #1890ff;
            border-color: #1890ff !important;
          }
          .ant-checkbox-indeterminate .ant-checkbox-inner {
            background-color: #1890ff;
            border-color: #1890ff !important;
          }
          .ant-checkbox-indeterminate .ant-checkbox-inner::after {
            background-color: #fff;
          }
        `}
      </style>
      <Space style={{ display: 'flex', justifyContent: 'end', marginBottom: '10px' }}>
        <NewRole />
      </Space>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        rowKey="key"
        loading={loading}
        scroll={{ y: '95vh', x: 'max-content' }}
      />

      <Modal
        title={`${selectedModule?.moduleName} - ${selectedRole} Permissions`}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        // okText="Save"
        // cancelText="Cancel"
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
        ]}
      >
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {selectedModule?.subModules?.map((subModule, index) => (
            <Card
              key={index}
              title={subModule.subModuleName}
              style={{ marginBottom: 16 }}
              size="small"
            >
              {subModule.actions && subModule.actions.length > 0 ? (
                <div>
                  <Row gutter={[16, 8]}>
                    {subModule.actions.map((action, actionIndex) => (
                      <Col span={8} key={actionIndex}>
                        <Checkbox
                          checked={getActionStatus(
                            selectedRole,
                            selectedModule?.moduleName,
                            subModule.subModuleName,
                            action.actionName,
                            false,
                          )}
                          onChange={(e) =>
                            handleActionToggle(
                              selectedRole,
                              selectedModule?.moduleName,
                              subModule.subModuleName,
                              action.actionName,
                              e.target.checked,
                              false,
                            )
                          }
                        >
                          {action.actionName}
                        </Checkbox>

                        {/* Render further parts only if they exist and have data */}
                        {action.furtherParts &&
                          action.furtherParts.length > 0 &&
                          action.furtherParts.some((part) => part.actionFurtherPartName) && (
                            <div style={{ marginLeft: 24, marginTop: 8 }}>
                              {action.furtherParts
                                .filter((part) => part.actionFurtherPartName) // Filter out empty parts
                                .map((part, partIndex) => (
                                  <div key={partIndex} style={{ marginBottom: 4 }}>
                                    <Checkbox
                                      checked={getActionStatus(
                                        selectedRole,
                                        selectedModule?.moduleName,
                                        subModule.subModuleName,
                                        part.actionFurtherPartName,
                                        true,
                                      )}
                                      onChange={(e) =>
                                        handleActionToggle(
                                          selectedRole,
                                          selectedModule?.moduleName,
                                          subModule.subModuleName,
                                          part.actionFurtherPartName,
                                          e.target.checked,
                                          true,
                                        )
                                      }
                                    >
                                      {part.actionFurtherPartName}
                                    </Checkbox>
                                  </div>
                                ))}
                            </div>
                          )}
                      </Col>
                    ))}
                  </Row>
                </div>
              ) : (
                <Text type="secondary">No actions available</Text>
              )}
            </Card>
          ))}
        </div>
      </Modal>
    </div>
  )
}

export default RBAC
