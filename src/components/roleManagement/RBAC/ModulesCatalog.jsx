import React, { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Card,
  Col,
  Collapse,
  Input,
  Modal,
  Row,
  Space,
  Tag,
  Typography,
  message,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import axiosInstance from '../../../services/axiosInstance'
import { useDispatch } from 'react-redux'
import { set } from '../../../redux/uiSlice'

const { Title, Text } = Typography

// Shapes
// Module: { id, moduleName, createdBy, subModules: SubModule[] }
// SubModule: { id, subModuleName, createdBy, actions: Action[] }
// Action: { id, actionName, createdBy, furtherParts: FurtherPart[] }
// FurtherPart: { id, actionFurtherPartName, createdBy }

const emptyFurtherPart = { id: 0, actionFurtherPartName: '' }
const emptyAction = { id: 0, actionName: '', furtherParts: [] }
const emptySubModule = { id: 0, subModuleName: '', actions: [] }
const emptyModule = { id: 0, moduleName: '', subModules: [] }

const ModulesCatalog = () => {
  const dispatch = useDispatch()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [level, setLevel] = useState(null) // 'module' | 'submodule' | 'action' | 'further'
  const [context, setContext] = useState({ moduleIdx: -1, subIdx: -1, actIdx: -1, furtherIdx: -1 })
  const [formValues, setFormValues] = useState({ name: '' })

  const loadData = async () => {
    try {
      await dispatch(set({ loading: true }))
      setLoading(true)
      const res = await axiosInstance.get('/api/RBAC/modules-catalog')
      const data = res?.data?.data || []
      setModules(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load modules catalog', err)
      message.error('Failed to load modules catalog')
    } finally {
      setLoading(false)
      await dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreate = (lvl, indices = {}) => {
    setLevel(lvl)
    setContext({
      moduleIdx: indices.moduleIdx ?? -1,
      subIdx: indices.subIdx ?? -1,
      actIdx: indices.actIdx ?? -1,
      furtherIdx: -1,
    })
    setFormValues({ name: '' })
    setEditorOpen(true)
  }

  const openEdit = (lvl, indices = {}, currentName = '') => {
    setLevel(lvl)
    setContext({
      moduleIdx: indices.moduleIdx ?? -1,
      subIdx: indices.subIdx ?? -1,
      actIdx: indices.actIdx ?? -1,
      furtherIdx: indices.furtherIdx ?? -1,
    })
    setFormValues({ name: currentName })
    setEditorOpen(true)
  }

  const closeEditor = () => {
    setEditorOpen(false)
    setLevel(null)
    setContext({ moduleIdx: -1, subIdx: -1, actIdx: -1, furtherIdx: -1 })
    setFormValues({ name: '' })
  }

  const upsertModules = async (payloadModules) => {
    // API expects array; id 0 => create, otherwise update
    return axiosInstance.post('/api/RBAC/upsert-modules', payloadModules)
  }

  const handleSave = async () => {
    try {
      const name = (formValues.name || '').trim()
      if (!name) return message.warning('Name is required')

      // Build minimal payload with one module branch to upsert
      let payloadModule
      if (level === 'module') {
        if (context.moduleIdx >= 0) {
          // edit existing module
          const m = modules[context.moduleIdx]
          if (!m) return message.error('Invalid module context')
          payloadModule = JSON.parse(JSON.stringify(m))
          payloadModule.moduleName = name
        } else {
          // create new module
          payloadModule = { ...emptyModule, moduleName: name }
        }
      } else {
        // clone selected module tree
        const m = modules[context.moduleIdx]
        if (!m) return message.error('Invalid module context')
        payloadModule = JSON.parse(JSON.stringify(m))
        // convert children ids to ensure 0 for new nodes handled below
        if (level === 'submodule') {
          if (context.subIdx >= 0) {
            // edit
            payloadModule.subModules[context.subIdx].subModuleName = name
          } else {
            payloadModule.subModules = payloadModule.subModules || []
            payloadModule.subModules.push({ ...emptySubModule, subModuleName: name })
          }
        }
        if (level === 'action') {
          if (context.subIdx < 0) return message.error('Select a submodule context')
          const sm = payloadModule.subModules[context.subIdx]
          if (!sm) return message.error('Invalid submodule context')
          sm.actions = sm.actions || []
          if (context.actIdx >= 0) {
            sm.actions[context.actIdx].actionName = name
          } else {
            sm.actions.push({ ...emptyAction, actionName: name })
          }
        }
        if (level === 'further') {
          if (context.subIdx < 0 || context.actIdx < 0)
            return message.error('Select an action context')
          const sm = payloadModule.subModules[context.subIdx]
          const ac = sm?.actions?.[context.actIdx]
          if (!ac) return message.error('Invalid action context')
          ac.furtherParts = ac.furtherParts || []
          if (context.furtherIdx >= 0) {
            // edit existing further part; preserve id
            const fp = ac.furtherParts[context.furtherIdx]
            if (!fp) return message.error('Invalid further part context')
            ac.furtherParts[context.furtherIdx] = { ...fp, actionFurtherPartName: name }
          } else {
            ac.furtherParts.push({ ...emptyFurtherPart, actionFurtherPartName: name })
          }
        }
      }

      await dispatch(set({ loading: true }))
      await upsertModules([payloadModule])
      message.success('Saved successfully')
      closeEditor()
      await loadData()
    } catch (err) {
      console.error('Save failed', err)
      message.error('Save failed')
    } finally {
      await dispatch(set({ loading: false }))
    }
  }

  const handleDelete = (lvl, ids) => {
    Modal.confirm({
      title: 'Confirm delete',
      content: 'This will permanently delete the selected item.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await dispatch(set({ loading: true }))
          // Backend exposes these as GET endpoints for delete
          if (lvl === 'module') await axiosInstance.get(`/api/RBAC/module/${ids.moduleId}`)
          if (lvl === 'submodule') await axiosInstance.get(`/api/RBAC/submodule/${ids.subModuleId}`)
          if (lvl === 'action') await axiosInstance.get(`/api/RBAC/action/${ids.actionId}`)
          if (lvl === 'further')
            await axiosInstance.get(`/api/RBAC/further-part/${ids.furtherPartId}`)
          message.success('Deleted')
          await loadData()
        } catch (err) {
          console.error('Delete failed', err)
          const apiMsg = err?.response?.data?.message || err?.message || 'Delete failed'
          message.error(apiMsg)
        } finally {
          await dispatch(set({ loading: false }))
        }
      },
    })
  }

  // UI helpers
  const renderActions = (idxs, item, lvl) => (
    <Space>
      <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(lvl, idxs, item)} />
      <Button
        size="small"
        danger
        icon={<DeleteOutlined />}
        onClick={() => handleDelete(lvl, idxs)}
      />
    </Space>
  )

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 12 }}>
        <Title level={4} style={{ margin: 0 }}>
          Modules Catalog
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate('module')}>
            New Module
          </Button>
        </Space>
      </Space>

      <Collapse defaultActiveKey={[]} bordered>
        {modules.map((m, mi) => (
          <Collapse.Panel
            key={m.id || `m-${mi}`}
            header={
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>
                  {m.moduleName}
                  {m.createdBy && (
                    <Tag color="blue" style={{ marginLeft: 6 }}>
                      by {m.createdBy}
                    </Tag>
                  )}
                </span>
                <Space onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="small"
                    onClick={() => openCreate('submodule', { moduleIdx: mi })}
                    icon={<PlusOutlined />}
                  >
                    Submodule
                  </Button>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => openEdit('module', { moduleIdx: mi }, m.moduleName)}
                  />
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete('module', { moduleId: m.id })}
                  />
                </Space>
              </div>
            }
          >
            {(m.subModules || []).length === 0 && <Text type="secondary">No submodules</Text>}
            <Collapse defaultActiveKey={[]} bordered={false} style={{ background: 'transparent' }}>
              {(m.subModules || []).map((sm, si) => (
                <Collapse.Panel
                  key={sm.id || `sm-${mi}-${si}`}
                  header={
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>{sm.subModuleName}</span>
                      <Space onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="small"
                          onClick={() => openCreate('action', { moduleIdx: mi, subIdx: si })}
                          icon={<PlusOutlined />}
                        >
                          Action
                        </Button>
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() =>
                            openEdit('submodule', { moduleIdx: mi, subIdx: si }, sm.subModuleName)
                          }
                        />
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete('submodule', { subModuleId: sm.id })}
                        />
                      </Space>
                    </div>
                  }
                >
                  {(sm.actions || []).length === 0 && <Text type="secondary">No actions</Text>}
                  {(sm.actions || []).map((ac, ai) => (
                    <Card
                      key={ac.id || `ac-${mi}-${si}-${ai}`}
                      size="small"
                      style={{ marginBottom: 8 }}
                      title={
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span>{ac.actionName}</span>
                          <Space>
                            <Button
                              size="small"
                              onClick={() =>
                                openCreate('further', { moduleIdx: mi, subIdx: si, actIdx: ai })
                              }
                              icon={<PlusOutlined />}
                            >
                              Further Part
                            </Button>
                            <Button
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() =>
                                openEdit(
                                  'action',
                                  { moduleIdx: mi, subIdx: si, actIdx: ai },
                                  ac.actionName,
                                )
                              }
                            />
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDelete('action', { actionId: ac.id })}
                            />
                          </Space>
                        </div>
                      }
                    >
                      {(ac.furtherParts || []).length === 0 && (
                        <Text type="secondary">No further parts</Text>
                      )}
                      <Row gutter={[8, 8]}>
                        {(ac.furtherParts || []).map((fp) => (
                          <Col key={fp.id || fp.actionFurtherPartName} span={8}>
                            <Card size="small" bodyStyle={{ padding: 8 }}>
                              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                                <span>{fp.actionFurtherPartName}</span>
                                <Space>
                                  <Button
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={() =>
                                      openEdit(
                                        'further',
                                        {
                                          moduleIdx: mi,
                                          subIdx: si,
                                          actIdx: ai,
                                          furtherIdx: (ac.furtherParts || []).findIndex(
                                            (x) => x === fp,
                                          ),
                                        },
                                        fp.actionFurtherPartName,
                                      )
                                    }
                                  />
                                  <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() =>
                                      handleDelete('further', { furtherPartId: fp.id })
                                    }
                                  />
                                </Space>
                              </Space>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </Card>
                  ))}
                </Collapse.Panel>
              ))}
            </Collapse>
          </Collapse.Panel>
        ))}
      </Collapse>

      <Modal
        open={editorOpen}
        title={
          level
            ? ` ${level === 'further' ? 'Further Part' : level.charAt(0).toUpperCase() + level.slice(1)} `
            : ''
        }
        onCancel={closeEditor}
        onOk={handleSave}
        okText="Save"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>Name</Text>
          <Input
            value={formValues.name}
            placeholder={
              level === 'module'
                ? 'Module name'
                : level === 'submodule'
                  ? 'Submodule name'
                  : level === 'action'
                    ? 'Action name'
                    : 'Further part name'
            }
            onChange={(e) => setFormValues({ name: e.target.value })}
          />
          <Text type="secondary">IDs are handled automatically. Leave blank to create new.</Text>
        </Space>
      </Modal>
    </div>
  )
}

export default ModulesCatalog
