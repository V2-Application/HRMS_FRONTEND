import React, { useEffect, useState } from 'react'
import {
  Table,
  Checkbox,
  Button,
  Space,
  Modal,
  Card,
  Row,
  Col,
  Typography,
  Input,
  Form,
  message,
} from 'antd'
import { fetchRoles, getRBACHierarchy } from '../../../services/Services'
import {
  DownOutlined,
  EditOutlined,
  UpOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExportOutlined,
} from '@ant-design/icons'
import axiosInstance from '../../../services/axiosInstance'
import NewRole from './NewRole'
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../../../redux/uiSlice'
import EmpRoleMap from './EmpRoleMap'
import { useActionsMap } from '../../../utils/useActionsMap'
import { exportExcelFromFrontend } from '../../shared/ExportExceFromFrontend'

const { Title, Text } = Typography

const RBAC = () => {
  const dispatch = useDispatch()
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedModule, setSelectedModule] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const [hierarchy, setHierarchy] = useState([])
  const [initialHierarchy, setInitialHierarchy] = useState([])
  const [modules, setModules] = useState([])

  // Role management states
  const [roleModalVisible, setRoleModalVisible] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [roleForm] = Form.useForm()
  const [expandedActions, setExpandedActions] = useState({}) // New state for tracking expanded actions

  const { filteredSideMenu } = useSelector((state) => state?.auth)
  const actionsMap = useActionsMap(filteredSideMenu)
  console.log('actionsMap: ', actionsMap)

  // fetch roles from API
  const getRoles = async () => {
    // setLoading(true)

    try {
      const response = await fetchRoles()
      if (response?.status === 200) {
        const fetched = response?.data?.data || []
        console.log('Fetched roles:', fetched)
        console.log('First role structure:', fetched[0])
        setRoles(fetched)
      } else {
        console.error('Unexpected response while fetching roles:', response)
        setRoles([])
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err)
      setRoles([])
    }
    // finally {
    //   setLoading(false)
    // }
  }

  const fetchRBAC = async () => {
    try {
      await dispatch(set({ loading: true }))
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
    } finally {
      await dispatch(set({ loading: false }))
    }
  }

  const fetchUpdatedRBAC = async () => {
    try {
      // Show loader when updating RBAC data
      await dispatch(set({ loading: true }))

      console.log('Fetching updated RBAC data...')
      const response = await getRBACHierarchy()

      if (response?.status === 200) {
        const hierarchyData = response?.data?.data?.data || []
        console.log('Updated hierarchy data received:', hierarchyData)

        // Update the hierarchy state with fresh data
        setHierarchy(JSON.parse(JSON.stringify(hierarchyData))) // Deep clone

        // Update the initial hierarchy for future comparisons
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

        console.log('RBAC data updated successfully with new IDs')
      } else {
        console.log('Failed to fetch updated RBAC data')
      }
    } catch (error) {
      console.log('Error fetching updated RBAC data: ', error)
    } finally {
      // Always hide loader when done (success or error)
      await dispatch(set({ loading: false }))
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
  // const getModuleCheckState = (roleName, moduleName) => {
  //   const roleData = hierarchy.find((h) => h.roleName === roleName)
  //   const moduleData = roleData?.modules?.find((m) => m.moduleName === moduleName)

  //   if (!moduleData?.subModules || moduleData.subModules.length === 0) {
  //     return { checked: false, indeterminate: false }
  //   }

  //   let allChecked = true
  //   let someChecked = false

  //   moduleData.subModules.forEach((subModule) => {
  //     if (subModule.actions && subModule.actions.length > 0) {
  //       subModule.actions.forEach((action) => {
  //         if (action.actionStatus) someChecked = true
  //         if (!action.actionStatus) allChecked = false

  //         // Check further parts
  //         if (action.furtherParts && action.furtherParts.length > 0) {
  //           action.furtherParts.forEach((part) => {
  //             if (part.furtherPartStatus) someChecked = true
  //             if (!part.furtherPartStatus) allChecked = false
  //           })
  //         }
  //       })
  //     }
  //   })

  //   return {
  //     checked: allChecked && someChecked,
  //     indeterminate: someChecked && !allChecked,
  //   }
  // }

  // Updated getModuleCheckState function to handle modules with submodules but no actions
  const getModuleCheckState = (roleName, moduleName) => {
    const roleData = hierarchy.find((h) => h.roleName === roleName)
    const moduleData = roleData?.modules?.find((m) => m.moduleName === moduleName)

    if (!moduleData?.subModules || moduleData.subModules.length === 0) {
      return { checked: false, indeterminate: false }
    }

    let allChecked = true
    let someChecked = false

    moduleData.subModules.forEach((subModule) => {
      // Check submodule status first
      if (subModule.subModuleStatus) {
        someChecked = true
      } else {
        allChecked = false
      }

      // Then check actions if they exist
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
      // If no actions exist, the submodule status determines the state
      else {
        // For submodules without actions, subModuleStatus determines the checked state
        // This is already handled above in the subModuleStatus check
      }
    })

    return {
      checked: allChecked && someChecked,
      indeterminate: someChecked && !allChecked,
    }
  }

  // const toggleAllRights = async (roleName, moduleName, checked) => {
  //   // console.log('roleName, moduleName, checked: ', roleName, moduleName, checked)
  //   // return
  //   setHierarchy((prevHierarchy) => {
  //     return prevHierarchy.map((roleData) => {
  //       if (roleData.roleName === roleName) {
  //         return {
  //           ...roleData,
  //           modules: roleData.modules.map((module) => {
  //             if (module.moduleName === moduleName) {
  //               return {
  //                 ...module,
  //                 moduleStatus: checked,
  //                 subModules: module.subModules.map((subModule) => ({
  //                   ...subModule,
  //                   subModuleStatus: checked,
  //                   actions: subModule.actions.map((action) => ({
  //                     ...action,
  //                     actionStatus: checked,
  //                     furtherParts: action.furtherParts.map((part) => ({
  //                       ...part,
  //                       furtherPartStatus: checked,
  //                     })),
  //                   })),
  //                 })),
  //               }
  //             }
  //             return module
  //           }),
  //         }
  //       }
  //       return roleData
  //     })
  //   })

  //   // Auto-save when toggling from main table
  //   const changedRoles = getChangedRoles()
  //   // setTimeout(() => {
  //   //   if (changedRoles.length > 0) {
  //   //     saveRBACData(changedRoles)
  //   //   }
  //   // }, 0)
  // }

  // Updated toggleAllRights function to handle modules with submodules but no actions
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
                    // Only update actions if they exist
                    actions:
                      subModule.actions?.length > 0
                        ? subModule.actions.map((action) => ({
                            ...action,
                            actionStatus: checked,
                            furtherParts:
                              action.furtherParts?.map((part) => ({
                                ...part,
                                furtherPartStatus: checked,
                              })) || [],
                          }))
                        : subModule.actions, // Keep empty array as is
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
    // Uncomment if you want auto-save
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
                              // if unchecking the main action, also uncheck all its further parts
                              furtherParts: checked
                                ? action?.furtherParts
                                : action?.furtherParts?.map((part) => ({
                                    ...part,
                                    furtherPartStatus: false,
                                  })),
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
    id: r.id || r.roleId, // Include the id field for updates
  }))

  const saveRBACData = async (changedData) => {
    try {
      // console.log('Sending changed data to API:', changedData)
      const response = await axiosInstance.post('/api/RBAC/upsert-rbac-nodes', changedData)
      // console.log('submit rbac api response: ', response)

      // Update initial hierarchy after successful save
      if (response?.status === 200) {
        // window.location.reload()
        await fetchUpdatedRBAC()
        // setInitialHierarchy(JSON.parse(JSON.stringify(hierarchy)))
        // fetchRBAC()
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

  // Updated getSubModuleCheckStatus to use subModuleStatus directly
  const getSubModuleCheckStatus = (roleName, moduleName, subModuleName) => {
    const roleData = hierarchy.find((h) => h.roleName === roleName)
    const moduleData = roleData?.modules?.find((m) => m.moduleName === moduleName)
    const subModuleData = moduleData?.subModules?.find((sm) => sm.subModuleName === subModuleName)

    if (!subModuleData) return false

    // Always return subModuleStatus - independent of action states
    return subModuleData.subModuleStatus || false
  }

  // Updated handleSubModuleToggle - only changes subModuleStatus, doesn't automatically change actions
  const handleSubModuleToggle = (roleName, moduleName, subModuleName, checked) => {
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
                        subModuleStatus: checked,
                        // Keep actions as they are - don't automatically change them
                        // Actions should be managed independently through their own checkboxes
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

  // Role management functions
  const openRoleModal = (role = null) => {
    // console.log('openRoleModal called with role:', role)
    // console.log('Role id:', role?.id)
    // console.log('Role id type:', typeof role?.id)

    if (role) {
      setEditingRole(role)
      roleForm.setFieldsValue({
        roleName: role.roleName,
        description: role.description || '',
        // createdBy: role.createdBy || '',
      })
    } else {
      setEditingRole(null)
      roleForm.resetFields()
    }
    setRoleModalVisible(true)
  }

  const closeRoleModal = () => {
    setRoleModalVisible(false)
    setEditingRole(null)
    roleForm.resetFields()
  }

  const handleRoleSave = async () => {
    try {
      const values = await roleForm.validateFields()
      const date = new Date()
      const formattedDate = `${date.getDate() / date.getMonth() + 1 / date.getFullYear()}`

      const payload = {
        id: editingRole ? editingRole.id : 0,
        roleName: values.roleName.trim(),
        description: values.description?.trim() || '',
        createdBy: formattedDate,
      }

      console.log('Final payload:', payload)
      console.log('Payload id type:', typeof payload.id)

      // await dispatch(set({ loading: true }))
      setLoading(true)
      const response = await axiosInstance.post('/api/RBAC/upsert-role', payload)

      if (response?.status === 200) {
        message.success(editingRole ? 'Role updated successfully' : 'Role created successfully')
        closeRoleModal()
        await getRoles() // Refresh roles list
      } else {
        message.error('Failed to save role')
      }
    } catch (err) {
      console.error('Role save failed:', err)
      message.error(err?.response?.data?.message || 'Failed to save role')
    } finally {
      // await dispatch(set({ loading: false }))
      setLoading(false)
    }
  }

  const handleRoleDelete = (role) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete the role "${role.roleName}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(set({ loading: true }))
          const response = await axiosInstance.get(`/api/RBAC/role/${role.id}`)

          if (response?.status === 200) {
            message.success('Role deleted successfully')
            await getRoles() // Refresh roles list
          } else {
            message.error('Failed to delete role')
          }
        } catch (err) {
          console.error('Role delete failed:', err)
          message.error(err?.response?.data?.message || 'Failed to delete role')
        } finally {
          await dispatch(set({ loading: false }))
        }
      },
    })
  }

  const [exportLoading, setExportLoading] = useState(false)

  const handleExportRBAC = () => {
    setExportLoading(true)
    try {
      const rows = []
      hierarchy.forEach((roleData) => {
        roleData?.modules?.forEach((module) => {
          module?.subModules?.forEach((subModule) => {
            const checkedActions = (subModule?.actions || [])
              .filter((a) => a.actionStatus)
              .map((a) => a.actionName)
              .join(', ')
            const checkedFurtherParts = (subModule?.actions || [])
              .flatMap((a) => a?.furtherParts || [])
              .filter((p) => p.furtherPartStatus)
              .map((p) => p.actionFurtherPartName)
              .join(', ')

            if (subModule?.subModuleStatus || checkedActions || checkedFurtherParts) {
              rows.push({
                roleName: roleData.roleName,
                moduleName: module.moduleName,
                subModuleName: subModule.subModuleName,
                checkedActions,
                checkedFurtherParts,
              })
            }
          })
        })
      })

      const cols = [
        { header: 'Role Name', key: 'roleName' },
        { header: 'Module', key: 'moduleName' },
        { header: 'Sub Module', key: 'subModuleName' },
        { header: 'Checked Actions', key: 'checkedActions' },
        { header: 'Checked Further Parts', key: 'checkedFurtherParts' },
      ]

      const response = exportExcelFromFrontend(cols, rows, 'RBAC_Role_Permissions.xlsx', {
        sheetName: 'Role Permissions',
      })
      if (response.success) message.success(response.message)
      else message.error(response.message)
    } finally {
      setExportLoading(false)
    }
  }

  // columns: first column Roles, then one column per module
  const columns = [
    {
      title: 'Roles',
      dataIndex: 'roleName',
      key: 'role',
      fixed: 'left',
      width: 150,
      render: (text, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <span style={{ fontWeight: 600 }}>{text}</span>
          <Space size="small">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openRoleModal(record)}
              title="Edit Role"
            />
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRoleDelete(record)}
              title="Delete Role"
            />
          </Space>
        </Space>
      ),
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
              disabled={module?.subModules?.length <= 0}
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
      <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        {actionsMap?.emproleform?.actionStatus && <EmpRoleMap roles={roles} />}

        <Space>
          <Button loading={exportLoading} icon={<ExportOutlined />} onClick={handleExportRBAC}>
            Export
          </Button>
          {actionsMap?.newrole?.actionStatus && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openRoleModal()}>
              New Role
            </Button>
          )}
        </Space>
        {/* <NewRole getRoles={getRoles} /> */}
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
        footer={null}
        maskClosable={false} // cannot close by clicking outside
        closable={true} // allow close with cross
        closeIcon={<span style={{ color: 'red', fontSize: '20px' }}>x</span>} // 3️⃣ Red cross
      >
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {selectedModule?.subModules?.map((subModule, index) => {
            const isSubModuleChecked = getSubModuleCheckStatus(
              selectedRole,
              selectedModule?.moduleName,
              subModule.subModuleName,
            )

            return (
              <Card
                key={index}
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Checkbox
                      checked={isSubModuleChecked}
                      onChange={(e) =>
                        handleSubModuleToggle(
                          selectedRole,
                          selectedModule?.moduleName,
                          subModule.subModuleName,
                          e.target.checked,
                        )
                      }
                    />
                    <span>{subModule.subModuleName}</span>
                  </div>
                }
                style={{ marginBottom: 16 }}
                size="small"
              >
                {/* Only show actions if submodule is checked */}
                {isSubModuleChecked && subModule.actions && subModule.actions.length > 0 ? (
                  <div>
                    <Row gutter={[16, 8]}>
                      {subModule.actions.map((action, actionIndex) => {
                        const isActionChecked = getActionStatus(
                          selectedRole,
                          selectedModule?.moduleName,
                          subModule?.subModuleName,
                          action?.actionName,
                          false,
                        )

                        return (
                          <Col span={8} key={actionIndex}>
                            <Checkbox
                              checked={isActionChecked}
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

                            {/* <span>
                              <DownOutlined />
                              <UpOutlined />
                            </span> */}

                            {/* Render further parts only if action is checked */}
                            {isActionChecked &&
                              action.furtherParts &&
                              action.furtherParts.length > 0 &&
                              action.furtherParts.some((part) => part.actionFurtherPartName) && (
                                <div style={{ marginLeft: 24, marginTop: 8 }}>
                                  {action.furtherParts
                                    .filter((part) => part.actionFurtherPartName)
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
                        )
                      })}
                    </Row>
                  </div>
                ) : !isSubModuleChecked ? (
                  <Text type="secondary">Check the submodule to see actions</Text>
                ) : (
                  <Text type="secondary">No actions available</Text>
                )}
              </Card>
            )
          })}
        </div>
      </Modal>

      <Modal
        title={editingRole ? 'Edit Role' : 'New Role'}
        open={roleModalVisible}
        onOk={handleRoleSave}
        onCancel={closeRoleModal}
        width={500}
        footer={[
          <Button key="cancel" onClick={closeRoleModal}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleRoleSave} loading={loading}>
            Save
          </Button>,
        ]}
      >
        <Form form={roleForm} layout="vertical">
          <Form.Item
            label="Role Name"
            name="roleName"
            rules={[{ required: true, message: 'Please enter role name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea />
          </Form.Item>
          {/* <Form.Item label="Created By" name="createdBy">
            <Input />
          </Form.Item> */}
        </Form>
      </Modal>
    </div>
  )
}

export default RBAC
