import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Layout,
  Select,
  Table,
  Checkbox,
  Button,
  Space,
  Typography,
  Input,
  message,
  Empty,
  Spin,
  Modal,
  Tag,
} from 'antd'
import {
  TeamOutlined,
  ReloadOutlined,
  ShopTwoTone,
  CheckSquareTwoTone,
  UploadOutlined,
} from '@ant-design/icons'
import {
  searchEmployeeDropdown, // (q: string)
  empStoreList, // (eCode: string)
  upsertMappings, // ({ mappings:[{eCode, stCodes}], updatedBy })
  getDeptState, // ({ eCode, stCode })
  upsertDeptState, // ({ eCode, stCode, deselectedDeptIds: number[], actor })
  getDesigState, // ({ eCode, stCode, deptId })
  setDesigExceptionsForStoreDept, // ({ eCode, stCode, deptId, deselectedDesigIds, actor })
} from '../../services/Services'
import { useSelector } from 'react-redux'
import EmpStoreAssignmentUploader from './EmpStoreAssignmentUploader'

const { Header, Content } = Layout
const { Title, Text } = Typography

/** Robust tri-state parser: accepts booleans or string state codes */
const parseTriState = (node) => {
  const stateStr = String(node?.state ?? '')
    .trim()
    .toLowerCase()
  const boolChecked = typeof node?.isChecked === 'boolean' ? node.isChecked : undefined
  const boolInd = typeof node?.isIndeterminate === 'boolean' ? node.isIndeterminate : undefined

  const indWords = ['indeterminate', 'partial', 'half', 'partiallyselected', 'partially selected']
  const isIndByState = indWords.includes(stateStr)
  const isCheckedByState = stateStr === 'checked' || stateStr === 'true' || stateStr === 'selected'

  return {
    isChecked: !!(boolChecked ?? isCheckedByState),
    isIndeterminate: !!(boolInd ?? isIndByState),
  }
}

export default function EmpStoreAssignmentPage() {
  // ------- Employee search + selection ------- //
  const [employee, setEmployee] = useState(null)
  const [empOpts, setEmpOpts] = useState([])
  const [empLoading, setEmpLoading] = useState(false)
  const [empQuery, setEmpQuery] = useState('')
  const empReqIdRef = useRef(0)
  const empDebounceRef = useRef(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // From Redux (for updatedBy / actor)
  const { employeeId } = useSelector((state) => state?.auth?.data || {})

  // ------- Stores for selected employee ------- //
  const [rows, setRows] = useState([]) // [{ stCode, storeName, isChecked, isIndeterminate }]
  const [storeQuery, setStoreQuery] = useState('')
  const [isTableLoading, setIsTableLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  // ------- Department MODAL (per store) ------- //
  const [deptOpen, setDeptOpen] = useState(false)
  const [deptLoading, setDeptLoading] = useState(false)
  const [deptSubmitLoading, setDeptSubmitLoading] = useState(false)
  const [deptRows, setDeptRows] = useState([]) // [{ departmentId, departmentName, isChecked, isIndeterminate, state }]
  const [deptQuery, setDeptQuery] = useState('')
  const [activeStore, setActiveStore] = useState(null) // { stCode, storeName }

  // ------- Designation MODAL (per department) ------- //
  const [desigOpen, setDesigOpen] = useState(false)
  const [desigLoading, setDesigLoading] = useState(false)
  const [desigSubmitLoading, setDesigSubmitLoading] = useState(false)
  const [desigRows, setDesigRows] = useState([]) // [{ desigId, desigName, isChecked, isIndeterminate, state }]
  const [desigQuery, setDesigQuery] = useState('')
  const [activeDept, setActiveDept] = useState(null) // { deptId, departmentName }

  // ---------- Helpers ---------- //
  const normalizeEmployees = (items) =>
    (items || []).map((e) => {
      const code = e?.empCode ?? e?.ecode ?? e?.value ?? String(e ?? '')
      const name = e?.empName ?? e?.fullName ?? e?.label ?? ''
      return { value: String(code), label: name ? `${code} - ${name}` : String(code) }
    })

  const normalizeRows = (items) =>
    (items || []).map((it) => {
      const stCode = String(it?.stCode ?? it?.code ?? it?.key ?? '')
      const storeName = it?.storeName ?? it?.stName ?? it?.name ?? stCode
      const { isChecked, isIndeterminate } = parseTriState(it)
      return { stCode, storeName, isChecked, isIndeterminate }
    })

  const normalizeDeptRows = (items) =>
    (items || []).map((d) => {
      const { isChecked, isIndeterminate } = parseTriState(d)
      return {
        departmentId: Number(d?.departmentId),
        departmentName: d?.departmentName ?? String(d?.name ?? d?.departmentId),
        isChecked,
        isIndeterminate,
        state: d?.state,
      }
    })

  const normalizeDesigRows = (items) =>
    (items || []).map((d) => {
      const { isChecked, isIndeterminate } = parseTriState(d)
      return {
        desigId: Number(d?.desigId ?? d?.designationId ?? d?.id),
        desigName: d?.desigName ?? d?.designationName ?? String(d?.name ?? d?.desigId),
        isChecked,
        isIndeterminate,
        state: d?.state,
      }
    })

  const safeCodes = (arr) =>
    Array.from(
      new Set(
        (arr || [])
          .map(String)
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    )

  const makeMappingBody = (pairs, updatedBy) => ({
    mappings: (pairs || []).map(({ eCode, stCodesArray }) => ({
      eCode: String(eCode),
      stCodes: safeCodes(stCodesArray).join(','), // comma-separated
    })),
    updatedBy: String(updatedBy),
  })

  // ---------- Employee search ---------- //
  const onEmpSearch = (q) => {
    setEmpQuery(q)
    if (!q || q.trim().length < 2) {
      clearTimeout(empDebounceRef.current)
      setEmpOpts([])
      setEmpLoading(false)
      return
    }
    clearTimeout(empDebounceRef.current)
    empDebounceRef.current = setTimeout(async () => {
      const reqId = ++empReqIdRef.current
      setEmpLoading(true)
      try {
        const res = await searchEmployeeDropdown(q)
        const payload = res?.data?.employees ?? res?.data?.data ?? res?.data ?? []
        if (reqId === empReqIdRef.current) setEmpOpts(normalizeEmployees(payload))
      } catch {
        if (reqId === empReqIdRef.current) setEmpOpts([])
      } finally {
        if (reqId === empReqIdRef.current) setEmpLoading(false)
      }
    }, 400)
  }
  useEffect(() => () => clearTimeout(empDebounceRef.current), [])

  // ---------- Fetch stores when employee changes ---------- //
  const fetchStores = async (eCode) => {
    try {
      setIsTableLoading(true)
      const res = await empStoreList(eCode)
      const raw = res?.data?.data ?? res?.data ?? []
      setRows(normalizeRows(raw))
    } catch {
      message.error('Failed to fetch stores data')
      setRows([])
    } finally {
      setIsTableLoading(false)
    }
  }

  useEffect(() => {
    if (employee) fetchStores(employee)
    else setRows([])
  }, [employee])

  // ---------- Store table actions ---------- //
  const toggleRow = (stCode) =>
    setRows((prev) =>
      prev.map((r) =>
        r.stCode === stCode ? { ...r, isChecked: !r.isChecked, isIndeterminate: false } : r,
      ),
    )

  const selectAll = () =>
    setRows((prev) => prev.map((r) => ({ ...r, isChecked: true, isIndeterminate: false })))

  const clearAll = () =>
    setRows((prev) => prev.map((r) => ({ ...r, isChecked: false, isIndeterminate: false })))

  const filteredRows = useMemo(() => {
    const q = storeQuery.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) => (r.storeName || '').toLowerCase().includes(q) || r.stCode.toLowerCase().includes(q),
    )
  }, [rows, storeQuery])

  const selectedCount = useMemo(() => rows.filter((r) => r.isChecked).length, [rows])

  const submitSelected = async () => {
    // if (!employee) return
    const stCodesArray = rows.filter((r) => r.isChecked).map((r) => r.stCode)
    // if (stCodesArray.length === 0) return
    const body = makeMappingBody([{ eCode: employee, stCodesArray }], String(employeeId))

    try {
      setSubmitLoading(true)
      const res = await upsertMappings(body)
      if (res?.status >= 200 && res?.status < 300) {
        message.success(
          res?.data?.message || `${stCodesArray.length} store(s) submitted for ${employee}`,
        )
      } else {
        message.error(res?.response?.data?.message || 'Failed to save mappings')
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to save mappings')
    } finally {
      setSubmitLoading(false)
    }
  }

  // ---------- Department MODAL ---------- //
  const openDepartments = async (store) => {
    if (!employee) {
      message.warning('Select an employee first.')
      return
    }
    setActiveStore(store)
    setDeptOpen(true)
    setDeptQuery('')
    setDeptLoading(true)
    try {
      const res = await getDeptState({ eCode: employee, stCode: store.stCode })
      const raw = res?.data?.data ?? res?.data ?? []
      const nextRows = normalizeDeptRows(raw)
      setDeptRows(nextRows)
    } catch {
      setDeptRows([])
      message.error('Failed to fetch department visibility')
    } finally {
      setDeptLoading(false)
    }
  }

  const toggleDept = (departmentId) =>
    setDeptRows((prev) =>
      prev.map((d) =>
        d.departmentId === departmentId
          ? { ...d, isChecked: !d.isChecked, isIndeterminate: false }
          : d,
      ),
    )

  const selectAllDepts = () => setDeptRows((prev) => prev.map((d) => ({ ...d, isChecked: true })))
  const clearAllDepts = () => setDeptRows((prev) => prev.map((d) => ({ ...d, isChecked: false })))

  const filteredDeptRows = useMemo(() => {
    const q = deptQuery.trim().toLowerCase()
    if (!q) return deptRows
    return deptRows.filter((d) => (d.departmentName || '').toLowerCase().includes(q))
  }, [deptRows, deptQuery])

  const deptSelectedCount = useMemo(() => deptRows.filter((d) => d.isChecked).length, [deptRows])

  const submitDeptVisibility = async () => {
    if (!employee || !activeStore) return

    // ✅ EXCLUDE indeterminate from deselections
    const deselectedDeptIds = Array.from(
      new Set(
        (deptRows || [])
          .filter((d) => !d.isChecked && !d.isIndeterminate)
          .map((d) => d.departmentId),
      ),
    )

    const payload = {
      eCode: String(employee),
      stCode: String(activeStore?.stCode),
      deselectedDeptIds,
      actor: String(employeeId),
    }

    try {
      setDeptSubmitLoading(true)
      const res = await upsertDeptState(payload)
      if (res?.status >= 200 && res?.status < 300) {
        message.success(res?.data?.message || 'Department visibility saved')
        setDeptOpen(false)
      } else {
        message.error(res?.response?.data?.message || 'Failed to save department visibility')
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to save department visibility')
    } finally {
      setDeptSubmitLoading(false)
    }
  }

  // ---------- Designation MODAL ---------- //
  const openDesignations = async (dept) => {
    if (!employee || !activeStore) return
    setActiveDept({ deptId: String(dept.departmentId), departmentName: dept.departmentName })
    setDesigQuery('')
    setDesigOpen(true)
    setDesigLoading(true)
    try {
      const res = await getDesigState({
        eCode: employee,
        stCode: activeStore.stCode,
        deptId: String(dept.departmentId),
      })
      const raw = res?.data?.data ?? res?.data ?? []
      setDesigRows(normalizeDesigRows(raw))
    } catch {
      setDesigRows([])
      message.error('Failed to fetch designation visibility')
    } finally {
      setDesigLoading(false)
    }
  }

  const toggleDesig = (desigId) =>
    setDesigRows((prev) =>
      prev.map((d) =>
        d.desigId === desigId ? { ...d, isChecked: !d.isChecked, isIndeterminate: false } : d,
      ),
    )

  const selectAllDesigs = () =>
    setDesigRows((prev) => prev.map((d) => ({ ...d, isChecked: true, isIndeterminate: false })))

  const clearAllDesigs = () =>
    setDesigRows((prev) => prev.map((d) => ({ ...d, isChecked: false, isIndeterminate: false })))

  const filteredDesigRows = useMemo(() => {
    const q = desigQuery.trim().toLowerCase()
    if (!q) return desigRows
    return desigRows.filter((d) => (d.desigName || '').toLowerCase().includes(q))
  }, [desigRows, desigQuery])

  const desigSelectedCount = useMemo(() => desigRows.filter((d) => d.isChecked).length, [desigRows])

  const submitDesigVisibility = async () => {
    if (!employee || !activeStore || !activeDept) return

    // ✅ EXCLUDE indeterminate from deselections
    const deselectedDesigIds = Array.from(
      new Set(
        (desigRows || []).filter((d) => !d.isChecked && !d.isIndeterminate).map((d) => d.desigId),
      ),
    )

    const payload = {
      eCode: String(employee),
      stCode: String(activeStore.stCode),
      deptId: String(activeDept.deptId),
      deselectedDesigIds,
      actor: String(employeeId),
    }

    try {
      setDesigSubmitLoading(true)
      const res = await setDesigExceptionsForStoreDept(payload)
      if (res?.status >= 200 && res?.status < 300) {
        message.success(res?.data?.message || 'Designation visibility saved')
        setDesigOpen(false)
      } else {
        message.error(res?.response?.data?.message || 'Failed to save designation visibility')
      }
    } catch (err) {
      message.error(err?.response?.data?.message || 'Failed to save designation visibility')
    } finally {
      setDesigSubmitLoading(false)
    }
  }

  // ---------- Table columns ---------- //
  const columns = [
    {
      title: (
        <Space size={8}>
          <CheckSquareTwoTone />
          <span>Status</span>
        </Space>
      ),
      dataIndex: 'isChecked',
      width: 200,
      render: (_, record) => (
        <Checkbox
          checked={record.isChecked}
          indeterminate={!record.isChecked && record.isIndeterminate}
          onChange={() => toggleRow(record.stCode)}
        />
      ),
    },
    {
      title: (
        <Space>
          <ShopTwoTone />
          <span>Store</span>
        </Space>
      ),
      dataIndex: 'storeName',
      ellipsis: true,
      width: 500,
      render: (text, record) => (
        <Space>
          {/* <Text strong>{text}</Text> */}
          <Tag color="blue">{record.stCode}</Tag>
        </Space>
      ),
    },
    {
      title: 'Departments',
      key: 'depts',
      align: 'left',
      width: 500,
      render: (_, record) => (
        <Button
          size="small"
          onClick={() => openDepartments(record)}
          disabled={!record?.isChecked && !record?.isIndeterminate}
        >
          Configure
        </Button>
      ),
    },
  ]

  // ---------- Render ---------- //
  return (
    <Layout style={{ background: 'transparent' }}>
      <Header style={{ background: 'transparent', padding: 0 }}>
        <Title level={3} style={{ margin: 0 }}>
          Emp → Store Assignment
        </Title>
      </Header>

      {isModalOpen && (
        <EmpStoreAssignmentUploader isVisible={isModalOpen} setIsVisible={setIsModalOpen} />
      )}

      <Content>
        <Space direction="horizontal" size={4} style={{ marginRight: 6, marginBottom: 8 }}>
          <Text type="secondary">Employee</Text>
          <Select
            allowClear
            showSearch
            placeholder="Select employee"
            style={{ minWidth: 260 }}
            value={employee}
            onChange={setEmployee}
            onClear={() => setEmployee(null)}
            filterOption={false}
            onSearch={onEmpSearch}
            options={empOpts}
            suffixIcon={<TeamOutlined />}
            notFoundContent={
              empLoading ? (
                <div style={{ textAlign: 'center', padding: 6 }}>
                  <Spin size="small" />
                </div>
              ) : empQuery?.trim()?.length < 2 ? (
                <span style={{ color: '#999' }}>Type at least 2 characters…</span>
              ) : (
                <span style={{ color: '#999' }}>No results</span>
              )
            }
          />
        </Space>

        <Space direction="horizontal" size={4} style={{ marginRight: 6, marginBottom: 12 }}>
          <Text type="secondary">Search stores</Text>
          <Input.Search
            allowClear
            placeholder="Type store code or name"
            onChange={(e) => setStoreQuery(e.target.value)}
            style={{ minWidth: 280 }}
          />
        </Space>

        <Space align="end" style={{ marginBottom: 12 }}>
          <Button onClick={selectAll}>Select all</Button>
          <Button icon={<ReloadOutlined />} onClick={clearAll}>
            Clear
          </Button>
          <Button
            type="primary"
            // disabled={!employee || selectedCount === 0}
            disabled={!employee}
            loading={submitLoading}
            onClick={submitSelected}
          >
            Submit Selected ({selectedCount})
          </Button>
          <Button
            type="default"
            icon={<UploadOutlined />}
            onClick={() => setIsModalOpen(true)}
          ></Button>
        </Space>

        {filteredRows.length === 0 ? (
          <Empty
            description={
              employee ? 'No stores for this employee' : 'Select an employee to view stores'
            }
          />
        ) : (
          <Table
            rowKey={(r) => r?.stCode}
            columns={columns}
            dataSource={filteredRows}
            pagination={false}
            size="small"
            bordered
            scroll={{ y: '70vh' }}
            loading={isTableLoading}
          />
        )}
      </Content>

      {/* Department Modal */}
      <Modal
        title={
          <Space direction="vertical" size={0}>
            <Text strong>Department visibility</Text>
            <Text type="secondary">
              Emp Code: <Tag>{employee || '—'}</Tag> Store Code:
              {/* {activeStore?.storeName || '—'}{' '} */}{' '}
              {activeStore?.stCode ? <Tag>{activeStore.stCode}</Tag> : null}
            </Text>
          </Space>
        }
        open={deptOpen}
        destroyOnClose
        onCancel={() => setDeptOpen(false)}
        width={720}
        footer={
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text type="secondary">
              Selected: <b>{deptSelectedCount}</b> / {deptRows.length}
            </Text>
            <Space>
              <Button onClick={selectAllDepts}>Select all</Button>
              <Button onClick={clearAllDepts}>Clear</Button>
              <Button onClick={() => setDeptOpen(false)}>Cancel</Button>
              <Button type="primary" loading={deptSubmitLoading} onClick={submitDeptVisibility}>
                Save
              </Button>
            </Space>
          </Space>
        }
      >
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Input.Search
            allowClear
            placeholder="Search departments"
            onChange={(e) => setDeptQuery(e.target.value)}
          />
          {deptLoading ? (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <Spin />
            </div>
          ) : filteredDeptRows.length === 0 ? (
            <Empty description="No departments" />
          ) : (
            <div
              style={{
                maxHeight: '60vh',
                overflow: 'auto',
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                padding: 8,
              }}
            >
              {filteredDeptRows.map((d) => (
                <div
                  key={d.departmentId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 8px',
                    borderRadius: 8,
                    marginBottom: 4,
                    background: '#fff',
                    gap: 8,
                  }}
                >
                  <Checkbox
                    checked={d.isChecked}
                    indeterminate={!d.isChecked && d.isIndeterminate}
                    onChange={() => toggleDept(d.departmentId)}
                  >
                    {d.departmentName}
                  </Checkbox>

                  <div style={{ marginLeft: 'auto' }}>
                    <Button
                      size="small"
                      onClick={() => openDesignations(d)}
                      disabled={!d?.isChecked && !d?.isIndeterminate}
                    >
                      Designations
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Space>
      </Modal>

      {/* Designation Modal */}
      <Modal
        title={
          <Space direction="vertical" size={0}>
            <Text strong>Designation visibility</Text>
            <Text type="secondary">
              Emp Code: <Tag>{employee || '—'}</Tag> Store Code:
              {/* {activeStore?.storeName || '—'} */}{' '}
              {activeStore?.stCode ? <Tag>{activeStore.stCode}</Tag> : null}
            </Text>
            <Text type="secondary">
              Department:
              {/* {activeDept?.departmentName || '—'} */}{' '}
              {activeDept?.deptId ? <Tag>{activeDept.departmentName}</Tag> : null}
            </Text>
          </Space>
        }
        open={desigOpen}
        destroyOnClose
        onCancel={() => setDesigOpen(false)}
        width={720}
        footer={
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text type="secondary">
              Selected: <b>{desigSelectedCount}</b> / {desigRows.length}
            </Text>
            <Space>
              <Button onClick={selectAllDesigs}>Select all</Button>
              <Button onClick={clearAllDesigs}>Clear</Button>
              <Button onClick={() => setDesigOpen(false)}>Cancel</Button>
              <Button type="primary" loading={desigSubmitLoading} onClick={submitDesigVisibility}>
                Save
              </Button>
            </Space>
          </Space>
        }
      >
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Input.Search
            allowClear
            placeholder="Search designations"
            onChange={(e) => setDesigQuery(e.target.value)}
          />
          {desigLoading ? (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <Spin />
            </div>
          ) : filteredDesigRows.length === 0 ? (
            <Empty description="No designations" />
          ) : (
            <div
              style={{
                maxHeight: '60vh',
                overflow: 'auto',
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                padding: 8,
              }}
            >
              {filteredDesigRows.map((d) => (
                <div
                  key={d.desigId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px 8px',
                    borderRadius: 8,
                    marginBottom: 4,
                    background: '#fff',
                  }}
                >
                  <Checkbox
                    checked={d.isChecked}
                    indeterminate={!d.isChecked && d.isIndeterminate}
                    onChange={() => toggleDesig(d.desigId)}
                  >
                    {d.desigName}
                  </Checkbox>
                </div>
              ))}
            </div>
          )}
        </Space>
      </Modal>
    </Layout>
  )
}
