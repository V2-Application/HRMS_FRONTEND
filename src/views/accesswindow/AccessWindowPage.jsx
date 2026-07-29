import React, { useEffect, useMemo, useState } from 'react'
import {
  Card, Row, Col, Select, Button, Checkbox, DatePicker, Typography, Space, Tag,
  Table, message, Spin, Empty, Divider, Alert, Popconfirm,
} from 'antd'
import { SaveOutlined, ReloadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import Pageheading from '../../components/shared/Pageheading'
import {
  getAccessWindowEmployees,
  getAccessWindowStores,
  getAccessWindowList,
  saveAccessWindow,
  removeAccessWindow,
} from '../../services/Services'

const { Text } = Typography
const { RangePicker } = DatePicker

// Shared admin page for "Regularize Access" and "Geofence Access" windows.
// Opens a window (per ecode / STCode / all, over a date range and/or custom dates)
// so those requests surface in the Manager & LP approval queues (Open Approvals).
const AccessWindowPage = ({ base, title, note }) => {
  const { theme } = useSelector((state) => state.ui)

  const [empOptions, setEmpOptions] = useState([])
  const [stores, setStores] = useState([])
  const [rows, setRows] = useState([])

  const [selEcodes, setSelEcodes] = useState([])
  const [selStores, setSelStores] = useState([])
  const [applyAll, setApplyAll] = useState(false)
  const [range, setRange] = useState(null)
  const [customDates, setCustomDates] = useState([]) // array of dayjs
  const [pickDate, setPickDate] = useState(null)
  const [openApprovals, setOpenApprovals] = useState(true)

  const [empSearching, setEmpSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [removing, setRemoving] = useState(false)

  const searchEmployees = async (text) => {
    try {
      const res = await getAccessWindowEmployees(base, text || '')
      setEmpOptions(
        (Array.isArray(res?.data) ? res.data : []).map((e) => ({
          value: e.ecode,
          label: e.name ? `${e.ecode} — ${e.name}` : e.ecode,
        })),
      )
    } catch (e) {
      /* non-fatal */
    }
  }

  const debouncedEmp = useMemo(() => {
    let t
    return (text) => {
      clearTimeout(t)
      setEmpSearching(true)
      t = setTimeout(async () => {
        await searchEmployees(text)
        setEmpSearching(false)
      }, 350)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base])

  const loadStores = async () => {
    try {
      const res = await getAccessWindowStores(base)
      setStores(Array.isArray(res?.data) ? res.data : [])
    } catch (e) {
      /* non-fatal */
    }
  }

  const loadList = async () => {
    setLoading(true)
    try {
      const res = await getAccessWindowList(base)
      setRows(Array.isArray(res?.data) ? res.data : [])
    } catch (e) {
      message.error(e?.response?.data?.message || 'Failed to load windows.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    searchEmployees('')
    loadStores()
    loadList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base])

  const addCustomDate = () => {
    if (!pickDate) return
    if (customDates.some((d) => d.isSame(pickDate, 'day'))) {
      setPickDate(null)
      return
    }
    setCustomDates([...customDates, pickDate])
    setPickDate(null)
  }

  const handleSave = async () => {
    if (!applyAll && selEcodes.length === 0 && selStores.length === 0)
      return message.warning('Select employee(s), store(s), or tick "Apply to all".')
    if (!range && customDates.length === 0)
      return message.warning('Pick a date range and/or add custom dates.')

    setSaving(true)
    try {
      const payload = {
        ecodes: applyAll ? [] : selEcodes,
        stCodes: applyAll ? [] : selStores,
        applyAll,
        fromDate: range?.[0] ? range[0].format('YYYY-MM-DD') : null,
        toDate: range?.[1] ? range[1].format('YYYY-MM-DD') : null,
        customDates: customDates.map((d) => d.format('YYYY-MM-DD')),
        openApprovals,
      }
      const res = await saveAccessWindow(base, payload)
      if (res?.status) {
        message.success(res.message || 'Saved.')
        loadList()
      } else message.error(res?.message || 'Save failed.')
    } catch (e) {
      message.error(e?.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setSelEcodes([])
    setSelStores([])
    setApplyAll(false)
    setRange(null)
    setCustomDates([])
    setPickDate(null)
    setOpenApprovals(true)
  }

  const handleRemove = async () => {
    if (selectedIds.length === 0) return
    setRemoving(true)
    try {
      const res = await removeAccessWindow(base, selectedIds)
      if (res?.status) {
        message.success(res.message || 'Removed.')
        setSelectedIds([])
        loadList()
      } else message.error(res?.message || 'Remove failed.')
    } catch (e) {
      message.error(e?.response?.data?.message || 'Remove failed.')
    } finally {
      setRemoving(false)
    }
  }

  const columns = [
    { title: 'Target', dataIndex: 'target', key: 'target', width: 200, ellipsis: true },
    {
      title: 'Date',
      dataIndex: 'accessDate',
      key: 'accessDate',
      width: 130,
      render: (v) => (v ? dayjs(v).format('DD-MMM-YY') : ''),
    },
    {
      title: 'Approvals Open',
      dataIndex: 'openApprovals',
      key: 'openApprovals',
      width: 140,
      align: 'center',
      render: (v) => (v ? <Tag color="green">Open</Tag> : <Tag>Closed</Tag>),
    },
    { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy', width: 120 },
    { title: 'Created On', dataIndex: 'createdOn', key: 'createdOn', width: 150 },
  ]

  return (
    <>
      <Pageheading title={title} />
      <div className="def" style={{ padding: 10 }}>
        {note && <Alert type="info" showIcon message={note} style={{ marginBottom: 12 }} />}

        <Card size="small" bordered className={theme === 'dark' ? 'dark-theme' : ''} style={{ marginBottom: 12 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Text strong>Employee(s) — by Ecode / Name</Text>
              <Select
                mode="multiple"
                allowClear
                showSearch
                filterOption={false}
                loading={empSearching}
                disabled={applyAll}
                value={selEcodes}
                onSearch={debouncedEmp}
                onChange={setSelEcodes}
                placeholder="Search & select employee(s)"
                style={{ width: '100%', marginTop: 4 }}
                options={empOptions}
                notFoundContent={empSearching ? <Spin size="small" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
              />
            </Col>
            <Col xs={24} md={12}>
              <Text strong>Store Code(s)</Text>
              <Select
                mode="multiple"
                allowClear
                showSearch
                optionFilterProp="label"
                disabled={applyAll}
                value={selStores}
                onChange={setSelStores}
                placeholder="Select store code(s)"
                style={{ width: '100%', marginTop: 4 }}
                maxTagCount="responsive"
                options={stores.map((s) => ({
                  value: s.storeCode,
                  label: s.locationName ? `${s.storeCode} — ${s.locationName}` : s.storeCode,
                }))}
              />
            </Col>
            <Col xs={24}>
              <Checkbox checked={applyAll} onChange={(e) => setApplyAll(e.target.checked)}>
                Apply to <b>all</b> employees (org-wide)
              </Checkbox>
            </Col>

            <Col xs={24} md={12}>
              <Text strong>Date Range</Text>
              <RangePicker
                value={range}
                onChange={setRange}
                format="DD-MMM-YY"
                allowClear
                style={{ width: '100%', marginTop: 4 }}
              />
            </Col>
            <Col xs={24} md={12}>
              <Text strong>Custom Dates</Text>
              <Space.Compact style={{ width: '100%', marginTop: 4 }}>
                <DatePicker
                  value={pickDate}
                  onChange={setPickDate}
                  format="DD-MMM-YY"
                  style={{ width: '100%' }}
                  placeholder="Pick a date to add"
                />
                <Button icon={<PlusOutlined />} onClick={addCustomDate} disabled={!pickDate}>
                  Add
                </Button>
              </Space.Compact>
              <div style={{ marginTop: 6 }}>
                {customDates.map((d) => (
                  <Tag
                    key={d.format('YYYY-MM-DD')}
                    closable
                    onClose={() => setCustomDates(customDates.filter((x) => !x.isSame(d, 'day')))}
                    style={{ marginBottom: 4 }}
                  >
                    {d.format('DD-MMM-YY')}
                  </Tag>
                ))}
              </div>
            </Col>

            <Col xs={24}>
              <Checkbox checked={openApprovals} onChange={(e) => setOpenApprovals(e.target.checked)}>
                <b>Open approvals</b> — make these requests appear in the Manager &amp; LP approval queues
              </Checkbox>
            </Col>
          </Row>

          <Divider style={{ margin: '12px 0' }} />
          <Space>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
              Save Access Window
            </Button>
            <Button icon={<ReloadOutlined />} onClick={resetForm} disabled={saving}>
              Reset
            </Button>
          </Space>
        </Card>

        <Card
          size="small"
          bordered
          title="Open access windows"
          className={theme === 'dark' ? 'dark-theme' : ''}
          extra={
            <Space>
              <Popconfirm
                title={`Remove ${selectedIds.length} selected window row(s)?`}
                onConfirm={handleRemove}
                disabled={selectedIds.length === 0}
              >
                <Button danger icon={<DeleteOutlined />} disabled={selectedIds.length === 0} loading={removing}>
                  Remove selected
                </Button>
              </Popconfirm>
              <Button icon={<ReloadOutlined />} onClick={loadList} />
            </Space>
          }
        >
          <Table
            rowKey="id"
            size="small"
            bordered
            loading={loading}
            columns={columns}
            dataSource={rows}
            rowSelection={{ selectedRowKeys: selectedIds, onChange: setSelectedIds }}
            pagination={{ pageSize: 20, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] }}
            scroll={{ x: 760, y: 'calc(100vh - 430px)' }}
            className={theme === 'dark' ? 'dark-theme' : ''}
          />
        </Card>
      </div>
    </>
  )
}

export default AccessWindowPage
