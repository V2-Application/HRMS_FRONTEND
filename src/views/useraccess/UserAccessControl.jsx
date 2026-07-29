import React, { useEffect, useMemo, useState } from 'react'
import {
  Card,
  Row,
  Col,
  Select,
  Button,
  Tree,
  Typography,
  Space,
  message,
  Spin,
  Empty,
  Tag,
  Table,
  Input,
  Popconfirm,
  Alert,
} from 'antd'
import {
  SaveOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { useSelector } from 'react-redux'
import Pageheading from '../../components/shared/Pageheading'
import {
  getUacModules,
  getUacEmployees,
  getUacAccess,
  getUacEffectiveAccess,
  saveUacAccess,
  getUacFeatures,
  stopUacFeature,
  restoreUacFeature,
} from '../../services/Services'

const { Text } = Typography
const { Search } = Input

// Per-employee (Ecode) custom access grants + a per-feature global kill switch.
// (IT Superadmin only.)
//  A) User section: pick employee(s); when one is picked the module tree is
//     pre-checked with their CURRENT access (per-user override if any, else what
//     their role grants in RBAC) so you can see and adjust it, plus store codes &
//     allowed ecodes. Save REPLACES that employee's grants.
//  B) Feature section: stop a feature (submodule) for ALL roles in one click; the
//     roles that had it are remembered and re-granted exactly on Restore.
const UserAccessControl = () => {
  const { theme } = useSelector((state) => state.ui)

  const [modules, setModules] = useState([])
  const [empOptions, setEmpOptions] = useState([])
  const [allowedOptions, setAllowedOptions] = useState([])

  const [selEcodes, setSelEcodes] = useState([])
  const [checkedSubs, setCheckedSubs] = useState([]) // tree keys: `sub-<id>`
  const [selAllowed, setSelAllowed] = useState([])
  const [roleInfo, setRoleInfo] = useState(null) // { roleNames, hasOverride }

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [empSearching, setEmpSearching] = useState(false)

  // feature kill-switch
  const [features, setFeatures] = useState([])
  const [featLoading, setFeatLoading] = useState(false)
  const [featSearch, setFeatSearch] = useState('')
  const [featBusyId, setFeatBusyId] = useState(null)

  // ---- load catalog (modules) ----
  const loadCatalog = async () => {
    setLoading(true)
    try {
      const m = await getUacModules()
      setModules(Array.isArray(m?.data) ? m.data : [])
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed to load modules.')
    } finally {
      setLoading(false)
    }
  }

  const loadFeatures = async () => {
    setFeatLoading(true)
    try {
      const res = await getUacFeatures()
      setFeatures(Array.isArray(res?.data) ? res.data : [])
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed to load features.')
    } finally {
      setFeatLoading(false)
    }
  }

  useEffect(() => {
    loadCatalog()
    loadFeatures()
  }, [])

  // ---- employee search (debounced) ----
  const searchEmployees = async (text, setter) => {
    try {
      const res = await getUacEmployees(text || '')
      const opts = (Array.isArray(res?.data) ? res.data : []).map((e) => ({
        value: e.ecode,
        label: e.name ? `${e.ecode} — ${e.name}` : e.ecode,
      }))
      setter(opts)
    } catch (e) {
      // non-fatal
    }
  }

  const debouncedEmp = useMemo(() => {
    let t
    return (text) => {
      clearTimeout(t)
      setEmpSearching(true)
      t = setTimeout(async () => {
        await searchEmployees(text, setEmpOptions)
        setEmpSearching(false)
      }, 350)
    }
  }, [])

  const debouncedAllowed = useMemo(() => {
    let t
    return (text) => {
      clearTimeout(t)
      t = setTimeout(() => searchEmployees(text, setAllowedOptions), 350)
    }
  }, [])

  useEffect(() => {
    searchEmployees('', setEmpOptions)
    searchEmployees('', setAllowedOptions)
  }, [])

  // ---- when exactly one employee is selected, prefill with current access ----
  useEffect(() => {
    const fill = async () => {
      if (selEcodes.length !== 1) {
        setRoleInfo(null)
        return
      }
      try {
        const [acc, eff] = await Promise.all([
          getUacAccess(selEcodes[0]),
          getUacEffectiveAccess(selEcodes[0]),
        ])
        const a = acc?.data || {}
        const e = eff?.data || {}
        // tree baseline: per-user override if it exists, else the role's RBAC grants
        const effSubs = e.effectiveSubModuleIds || []
        setCheckedSubs(effSubs.map((x) => `sub-${x}`))
        setSelAllowed(a.allowedEcodes || [])
        setRoleInfo({ roleNames: e.roleNames || [], hasOverride: !!e.hasOverride })
      } catch (e) {
        // non-fatal
      }
    }
    fill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selEcodes])

  // ---- module tree (checkable) ----
  const treeData = useMemo(
    () =>
      modules.map((m) => ({
        title: m.moduleName,
        key: `mod-${m.moduleId}`,
        children: (m.subModules || []).map((s) => ({
          title: s.subModuleName,
          key: `sub-${s.subModuleId}`,
        })),
      })),
    [modules],
  )

  const subModuleIdsFromChecked = () =>
    checkedSubs
      .filter((k) => String(k).startsWith('sub-'))
      .map((k) => parseInt(String(k).replace('sub-', ''), 10))

  const handleSave = async () => {
    if (selEcodes.length === 0) return message.warning('Select at least one employee (ecode).')
    setSaving(true)
    try {
      const res = await saveUacAccess({
        ecodes: selEcodes,
        subModuleIds: subModuleIdsFromChecked(),
        allowedEcodes: selAllowed,
      })
      if (res?.status) message.success(res.message || 'Access saved.')
      else message.error(res?.message || 'Save failed.')
    } catch (e) {
      message.error(e?.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setSelEcodes([])
    setCheckedSubs([])
    setSelAllowed([])
    setRoleInfo(null)
  }

  // ---- feature stop / restore ----
  const featKey = (r) => `${r.nodeType}-${r.refId}`

  const doStop = async (row) => {
    setFeatBusyId(featKey(row))
    try {
      const res = await stopUacFeature(row.nodeType, row.refId)
      if (res?.status) message.success(res.message || 'Stopped.')
      else message.warning(res?.message || 'Nothing to stop.')
      await loadFeatures()
    } catch (e) {
      message.error(e?.response?.data?.message || 'Stop failed.')
    } finally {
      setFeatBusyId(null)
    }
  }

  const doRestore = async (row) => {
    setFeatBusyId(featKey(row))
    try {
      const res = await restoreUacFeature(row.nodeType, row.refId)
      if (res?.status) message.success(res.message || 'Restored.')
      else message.warning(res?.message || 'Nothing to restore.')
      await loadFeatures()
    } catch (e) {
      message.error(e?.response?.data?.message || 'Restore failed.')
    } finally {
      setFeatBusyId(null)
    }
  }

  const filteredFeatures = useMemo(() => {
    const q = featSearch.trim().toLowerCase()
    if (!q) return features
    return features.filter(
      (f) =>
        (f.name || '').toLowerCase().includes(q) ||
        (f.parentName || '').toLowerCase().includes(q) ||
        (f.moduleName || '').toLowerCase().includes(q),
    )
  }, [features, featSearch])

  const featureColumns = [
    { title: 'Module', dataIndex: 'moduleName', key: 'moduleName', width: 160, ellipsis: true },
    {
      title: 'Feature',
      key: 'feature',
      width: 300,
      ellipsis: true,
      render: (_, r) => (
        <Space size={4}>
          <Tag color={r.nodeType === 'Action' ? 'purple' : 'geekblue'}>{r.nodeType}</Tag>
          {r.parentName ? <Text type="secondary">{r.parentName} ›</Text> : null}
          <Text strong>{r.name}</Text>
        </Space>
      ),
    },
    {
      title: 'Roles with access',
      dataIndex: 'activeRoleCount',
      key: 'activeRoleCount',
      width: 150,
      align: 'center',
      render: (v) => <Tag color={v > 0 ? 'blue' : 'default'}>{v} role(s)</Tag>,
    },
    {
      title: 'Status',
      key: 'status',
      width: 170,
      render: (_, r) =>
        r.isStopped ? (
          <Tag color="red">Stopped ({r.stoppedRoleCount} remembered)</Tag>
        ) : (
          <Tag color="green">Active</Tag>
        ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 140,
      render: (_, r) =>
        r.isStopped ? (
          <Button
            size="small"
            type="primary"
            ghost
            icon={<CheckCircleOutlined />}
            loading={featBusyId === featKey(r)}
            onClick={() => doRestore(r)}
          >
            Restore
          </Button>
        ) : (
          <Popconfirm
            title={`Stop "${r.name}" for all ${r.activeRoleCount} role(s)?`}
            description="Roles are remembered and can be restored."
            okText="Stop"
            okButtonProps={{ danger: true }}
            onConfirm={() => doStop(r)}
            disabled={r.activeRoleCount === 0}
          >
            <Button
              size="small"
              danger
              icon={<StopOutlined />}
              loading={featBusyId === featKey(r)}
              disabled={r.activeRoleCount === 0}
            >
              Stop All
            </Button>
          </Popconfirm>
        ),
    },
  ]

  return (
    <>
      <Pageheading title="User Access Control" />
      <div className="def" style={{ padding: 10 }}>
        <Spin spinning={loading}>
          {/* ============ A) Per-user access ============ */}
          <Card
            size="small"
            bordered
            className={theme === 'dark' ? 'dark-theme' : ''}
            style={{ marginBottom: 12 }}
          >
            <Space style={{ marginBottom: 8 }}>
              <SafetyCertificateOutlined style={{ color: '#1d3557' }} />
              <Text strong>Grant / edit custom access for employee(s)</Text>
            </Space>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Text strong>Employee(s) — by Ecode / Name</Text>
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  filterOption={false}
                  loading={empSearching}
                  value={selEcodes}
                  onSearch={debouncedEmp}
                  onChange={setSelEcodes}
                  placeholder="Search and select employee(s)"
                  style={{ width: '100%', marginTop: 4 }}
                  options={empOptions}
                  notFoundContent={
                    empSearching ? <Spin size="small" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  }
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Select one to see &amp; edit their current access; select many to apply the same grants to all.
                </Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Allowed Ecodes (whose data they may access)</Text>
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  filterOption={false}
                  value={selAllowed}
                  onSearch={debouncedAllowed}
                  onChange={setSelAllowed}
                  placeholder="Search and select ecode(s)"
                  style={{ width: '100%', marginTop: 4 }}
                  options={allowedOptions}
                />
              </Col>
            </Row>

            {roleInfo && (
              <Alert
                style={{ marginTop: 12 }}
                type={roleInfo.hasOverride ? 'warning' : 'info'}
                showIcon
                message={
                  roleInfo.hasOverride
                    ? 'Showing this employee’s saved custom (override) access below.'
                    : `Showing access inherited from role(s): ${
                        roleInfo.roleNames.length ? roleInfo.roleNames.join(', ') : '—'
                      }. Saving will store these as a custom override for this employee.`
                }
              />
            )}
          </Card>

          {/* Modules tree */}
          <Card
            size="small"
            bordered
            title="Modules & SubModules access"
            className={theme === 'dark' ? 'dark-theme' : ''}
            style={{ marginBottom: 12 }}
          >
            {treeData.length === 0 ? (
              <Empty description="No modules found" />
            ) : (
              <Tree
                checkable
                selectable={false}
                checkedKeys={checkedSubs}
                onCheck={(keys) => setCheckedSubs(keys)}
                treeData={treeData}
                height={420}
              />
            )}
          </Card>

          <Space style={{ marginBottom: 20 }}>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
              Save Access
            </Button>
            <Button icon={<ReloadOutlined />} onClick={resetForm} disabled={saving}>
              Reset
            </Button>
          </Space>

          {/* ============ B) Feature kill switch ============ */}
          <Card
            size="small"
            bordered
            className={theme === 'dark' ? 'dark-theme' : ''}
            title={
              <Space>
                <StopOutlined style={{ color: '#cf1322' }} />
                <span>Feature Access (all roles) — one-click Stop / Restore</span>
              </Space>
            }
            extra={
              <Space>
                <Search
                  placeholder="Search feature / module…"
                  allowClear
                  onChange={(e) => setFeatSearch(e.target.value)}
                  style={{ width: 240 }}
                />
                <Button icon={<ReloadOutlined />} onClick={loadFeatures} />
              </Space>
            }
          >
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              Stopping a feature sets it OFF for every role that currently has it (admin/superadmin
              roles always bypass). The exact set of roles is remembered, so Restore re-grants it to
              the same roles. Changes apply immediately for API access; sidebar refreshes on next login.
            </Text>
            <Table
              rowKey={(r) => `${r.nodeType}-${r.refId}`}
              size="small"
              bordered
              loading={featLoading}
              columns={featureColumns}
              dataSource={filteredFeatures}
              pagination={{ pageSize: 20, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
              scroll={{ x: 860, y: 'calc(100vh - 320px)' }}
              className={theme === 'dark' ? 'dark-theme' : ''}
            />
          </Card>
        </Spin>
      </div>
    </>
  )
}

export default UserAccessControl
