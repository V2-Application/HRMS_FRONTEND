import {
  Space,
  DatePicker,
  Table,
  message,
  Input,
  Button,
  Select,
  Checkbox,
  Typography,
  Popconfirm,
  Form,
} from 'antd'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  getAllLocations,
  getDesignations,
  getWeeklyOffByMonthYear,
  toggleActive,
  upsertPolicyDesignation,
} from '../../../services/Services'
import {
  ArrowRightOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  ExportOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { getApiError } from '../../../VendorModule/helpers'
import { maxDaysInMonth } from '../../../VendorModule/constants'
import PolicyUploader from './Uploader'
import axiosInstance from '../../../services/axiosInstance'
import { useActionsMap } from '../../../utils/useActionsMap'
import { useSelector } from 'react-redux'
import CopyToForm from './CopyToForm'

const { MonthPicker } = DatePicker
const { Search } = Input

const DEBOUNCE_MS = 450

// -----------------------------
// helpers (NEW, standalone)
// -----------------------------
const getLocationCode = (locationName) => String(locationName || '').slice(0, 4)

const normalizeDecimal2 = (raw) => {
  let v = String(raw ?? '').replace(/[^\d.]/g, '')
  v = v.replace(/^\.*/, '')
  const [intPart = '', ...rest] = v.split('.')
  const decPart = rest.join('')
  if (!rest.length) return intPart
  return `${intPart}.${decPart.slice(0, 2)}`
}

const normalizeInteger = (raw) => String(raw ?? '').replace(/[^\d]/g, '')

const isIntegerString = (v) => /^\d+$/.test(String(v ?? '').trim())

const hasMax2dp = (s) => {
  const parts = String(s ?? '').split('.')
  return parts.length === 1 || parts[1].length <= 2
}

const WeeklyOff = () => {
  const [filteredData, setFilteredData] = useState([])

  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const [copyToMonth, setCopyToMonth] = useState(null)

  const [searchText, setSearchText] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const debounceRef = useRef(null)

  const [locations, setLocations] = useState([])
  const [designations, setDesignations] = useState([])

  const [tableData, setTableData] = useState([])
  const [loadingTable, setLoadingTable] = useState(false)

  const [savingRowIds, setSavingRowIds] = useState(() => new Set())
  const [togglingIds, setTogglingIds] = useState(() => new Set())
  const [copying, setCopying] = useState(false)

  const [isUploaderOpen, setIsUploaderOpen] = useState(false)
  const [isExcelDownloading, setIsExcelDownloading] = useState(false)

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const [uniqueLoc, setUniqueLoc] = useState([]) // array of { value, label }
  const [uniqueDesg, setUniqueDesg] = useState([]) // array of { value, label }

  const [selectedLoc, setSelectedLoc] = useState(null) // locationCategoryId (code) OR locationId (your choice)
  const [selectedDesg, setSelectedDesg] = useState(null) // designationI

  const monthYear = useMemo(() => currentMonth.format('MMM-YY'), [currentMonth])

  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)

  const requiredTitle = (title) => (
    <>
      {title} <span style={{ color: 'red' }}>*</span>
    </>
  )

  const getMaxDaysForMonth = useCallback(
    (d) => {
      const mmm = (d || currentMonth).format('MMM')
      const max = Number(maxDaysInMonth?.[mmm])
      return Number.isFinite(max) ? max : 31
    },
    [currentMonth],
  )

  const setRowLoading = useCallback((setter, id, on) => {
    setter((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const updateRow = useCallback((id, patch) => {
    setTableData((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }, [])

  const isRowComplete = useCallback((row) => {
    const loc = String(row.locationCategoryId ?? '').trim()
    const from = String(row.totalAttendanceFrom ?? '').trim()
    const to = String(row.totalAttendanceTo ?? '').trim()
    const wo = String(row.weeklyOff ?? '').trim()
    return !!(loc && from && to && wo)
  }, [])

  const validateRow = useCallback(
    (row, forMonth = currentMonth) => {
      if (!isRowComplete(row)) return { ok: false, msg: 'Please fill all required columns.' }

      const fromStr = String(row.totalAttendanceFrom ?? '').trim()
      const toStr = String(row.totalAttendanceTo ?? '').trim()

      if (!hasMax2dp(fromStr) || !hasMax2dp(toStr)) {
        return { ok: false, msg: 'Total Attendance supports maximum 2 decimal places.' }
      }

      const from = Number(fromStr)
      const to = Number(toStr)
      if (!Number.isFinite(from) || !Number.isFinite(to)) {
        return { ok: false, msg: 'Total Attendance From/To must be valid numbers.' }
      }

      const maxDays = getMaxDaysForMonth(forMonth)
      if (from < 0 || to <= 0) return { ok: false, msg: 'Total Attendance must be greater than 0.' }
      if (from > maxDays || to > maxDays) {
        return {
          ok: false,
          msg: `Total Attendance cannot be more than ${maxDays} for selected month.`,
        }
      }
      if (from >= to) return { ok: false, msg: 'Total Attendance: From must be less than To.' }

      if (!isIntegerString(row.weeklyOff))
        return { ok: false, msg: 'Weekly Off must be an integer value.' }

      return { ok: true }
    },
    [currentMonth, getMaxDaysForMonth, isRowComplete],
  )

  const availableLocOptions = useMemo(() => {
    // base is your full fetched list (already respects month + backend searchTerm)
    let rows = tableData

    // if designation chosen, restrict locations to that designation
    if (selectedDesg) {
      rows = rows.filter((r) => String(r.designationId ?? '') === String(selectedDesg))
    }

    const locMap = new Map()
    for (const r of rows) {
      const code =
        String(r.locationCategoryId ?? '').trim() ||
        getLocationCode(r.locationCategoryName || r.locationName)

      const label = r.locationCategoryName || r.locationName || code
      if (code) locMap.set(code, label)
    }

    return Array.from(locMap, ([value, label]) => ({ value, label }))
  }, [tableData, selectedDesg])

  const availableDesgOptions = useMemo(() => {
    let rows = tableData

    // if location chosen, restrict designations to that location
    if (selectedLoc) {
      rows = rows.filter((r) => String(r.locationCategoryId ?? '').trim() === String(selectedLoc))
    }

    const desgMap = new Map()
    for (const r of rows) {
      if (r.designationId) {
        desgMap.set(r.designationId, r.designationName || String(r.designationId))
      }
    }

    return Array.from(desgMap, ([value, label]) => ({ value, label }))
  }, [tableData, selectedLoc])

  const getLocationIdFromRow = useCallback(
    (row) => {
      if (row.locationId) return row.locationId
      const code = String(row.locationCategoryId || '').trim()
      if (!code) return undefined
      const match = (locations || []).find((l) => getLocationCode(l.locationName) === code)
      return match?.locationId
    },
    [locations],
  )

  // API payload builder (NO isActive, NO forWhichWeeks)
  const toUpsertPayload = useCallback(
    (row, overrideMonthYear) => ({
      locationDesignationPolicyId: row.__isNew ? 0 : Number(row.locationDesignationPolicyId ?? 0), // 0 for insert
      locationCategoryId: row.locationCategoryId,
      designationId: row.designationId ?? null, // allowed null as you said
      weeklyOff: Number(row.weeklyOff),
      monthYear: overrideMonthYear ?? monthYear,
      totalAttendanceFrom: Number(row.totalAttendanceFrom),
      totalAttendanceTo: row.totalAttendanceTo,
    }),
    [monthYear],
  )

  // -----------------------------
  // Debounced backend search
  // -----------------------------
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchText.trim())
      setPagination((p) => ({ ...p, current: 1 }))
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchText])

  // -----------------------------
  // Fetchers
  // -----------------------------
  const fetchLocations = useCallback(async () => {
    try {
      const res = await getAllLocations()
      if (res.status === 200) setLocations(res.data?.data || [])
    } catch (e) {
      message.error(e?.response?.data?.message || 'Error fetching locations')
    }
  }, [])

  const fetchDesignations = useCallback(async () => {
    try {
      const res = await getDesignations()
      if (res.status === 200) setDesignations(res.data?.data || [])
    } catch (e) {
      message.error(e?.response?.data?.message || 'Error fetching designations')
    }
  }, [])

  const fetchData = useCallback(async () => {
    try {
      setLoadingTable(true)
      const res = await getWeeklyOffByMonthYear({
        // pageNumber: pagination.current,
        // pageSize: pagination.pageSize,
        searchTerm: debouncedSearch,
        monthYear,
      })

      if (res.status === 200) {
        const { data: list, pageNumber, pageSize, totalCount } = res.data || {}
        const normalized = (list || []).map((r) => ({
          ...r,
          id: r.locationDesignationPolicyId,
          isEditing: false,
          __isNew: false,

          // Ensure fields exist to avoid "undefined" later
          totalAttendanceFrom: r.totalAttendanceFrom ?? '',
          totalAttendanceTo: r.totalAttendanceTo ?? '',
        }))

        const locMap = new Map()
        for (const r of normalized) {
          const code =
            String(r.locationCategoryId ?? '').trim() ||
            getLocationCode(r.locationCategoryName || r.locationName)

          const label = r.locationCategoryName || r.locationName || code
          if (code) locMap.set(code, label)
        }
        setUniqueLoc(Array.from(locMap, ([value, label]) => ({ value, label })))

        const desgMap = new Map()
        for (const r of normalized) {
          if (r.designationId)
            desgMap.set(r.designationId, r.designationName || String(r.designationId))
        }
        setUniqueDesg(Array.from(desgMap, ([value, label]) => ({ value, label })))

        setTableData(normalized)
        setPagination((p) => ({ ...p, current: pageNumber, pageSize, total: totalCount }))
      }
    } catch (e) {
      message.error(getApiError(e, 'Error fetching weekly off master data'))
    } finally {
      setLoadingTable(false)
    }
  }, [pagination.current, pagination.pageSize, debouncedSearch, monthYear])

  useEffect(() => {
    fetchLocations()
    fetchDesignations()
  }, [fetchLocations, fetchDesignations])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    let rows = [...tableData]

    if (selectedLoc) {
      rows = rows.filter((r) => String(r.locationCategoryId ?? '').trim() === String(selectedLoc))
    }

    if (selectedDesg) {
      rows = rows.filter((r) => String(r.designationId ?? '') === String(selectedDesg))
    }

    setFilteredData(rows)
  }, [tableData, selectedLoc, selectedDesg])

  useEffect(() => {
    if (!selectedLoc) return
    const ok = availableLocOptions.some((o) => String(o.value) === String(selectedLoc))
    if (!ok) setSelectedLoc(null)
  }, [availableLocOptions, selectedLoc])

  useEffect(() => {
    if (!selectedDesg) return
    const ok = availableDesgOptions.some((o) => String(o.value) === String(selectedDesg))
    if (!ok) setSelectedDesg(null)
  }, [availableDesgOptions, selectedDesg])

  // -----------------------------
  // Handlers
  // -----------------------------
  const handleMonthChange = (d) => {
    setCurrentMonth(d || dayjs())
    setPagination((p) => ({ ...p, current: 1 }))
  }

  const handleAdd = () => {
    const editingRow = tableData.find((r) => r.isEditing)
    if (editingRow) {
      const chk = validateRow(editingRow)
      if (!chk.ok) return message.error('Please save/cancel the current editing row first.')
    }

    const newRow = {
      id: `tmp-${Date.now()}`,
      __isNew: true,
      isEditing: true,

      locationDesignationPolicyId: 0,
      locationId: undefined,
      locationName: undefined,
      locationCategoryId: undefined,
      locationCategoryName: undefined,

      designationId: null,
      designationName: undefined,

      totalAttendanceFrom: '',
      totalAttendanceTo: '',
      weeklyOff: '',
    }

    setTableData((prev) => [newRow, ...prev])
  }

  const handleEdit = (row) => {
    const editingRow = tableData.find((r) => r.isEditing)
    if (editingRow && editingRow.id !== row.id)
      return message.error('Please save/cancel current editing row first.')

    updateRow(row.id, { isEditing: true, __backup: { ...row } })
  }

  const handleCancel = (row) => {
    if (row.__isNew) {
      setTableData((prev) => prev.filter((r) => r.id !== row.id))
      return
    }
    updateRow(row.id, { ...row.__backup, isEditing: false, __backup: undefined })
  }

  const handleToggle = async (row, next) => {
    if (!row.locationDesignationPolicyId) return
    try {
      setRowLoading(setTogglingIds, row.id, true)
      await toggleActive({
        locationDesignationPolicyIds: [row.locationDesignationPolicyId],
        isActive: next,
      })
      updateRow(row.id, { isActive: next })
      message.success('Status updated')
    } catch (e) {
      message.error(getApiError(e, 'Error updating status'))
    } finally {
      setRowLoading(setTogglingIds, row.id, false)
    }
  }

  const handleSave = async (row) => {
    const chk = validateRow(row)
    if (!chk.ok) return message.error(chk.msg)

    try {
      setRowLoading(setSavingRowIds, row.id, true)
      await upsertPolicyDesignation([toUpsertPayload(row)])
      message.success('Row saved successfully')
      fetchData()
    } catch (e) {
      message.error(getApiError(e, 'Error saving row'))
    } finally {
      setRowLoading(setSavingRowIds, row.id, false)
    }
  }

  const handleCopyToMonth = async () => {
    try {
      if (!copyToMonth) return message.error('Please select month to copy data into.')

      const copyMY = copyToMonth.format('MMM-YY')

      // You can choose to copy even temp/new rows; here we copy ALL non-editing rows
      const rows = tableData.filter((r) => !r.isEditing)
      if (!rows.length) return message.info('No rows to copy.')

      for (const r of rows) {
        const chk = validateRow(r, copyToMonth) // validate vs target month max days
        if (!chk.ok) return message.error(chk.msg)
      }

      const payload = rows.map((r) => ({
        ...toUpsertPayload({ ...r, __isNew: true }, copyMY), // force insert in target month
      }))

      setCopying(true)
      const res = await upsertPolicyDesignation(payload)
      if (res.status === 200) {
        message.success(res.data?.message || `Set data into ${copyMY}`)
        setCopyToMonth(null)
      }
    } catch (e) {
      message.error(getApiError(e, 'Error setting data'))
    } finally {
      setCopying(false)
    }
  }

  const handleDownloadExcel = async () => {
    try {
      setIsExcelDownloading(true)
      const response = await axiosInstance.get(
        '/api/HolidayMaster/GetPolicyDesignationByMonthYear',
        {
          responseType: 'blob',
          params: { isExcel: true, monthYear: currentMonth.format('MMM-YY') },
        },
      )

      if (response.status === 200) {
        const data = response.data
        const blob = new Blob([data])
        const url = window.URL.createObjectURL(blob)

        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `WeeklyOffData_${new Date().toISOString()}.xlsx`
        anchor.click()
        anchor.remove()

        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      const msg = getApiError(error, 'Error downloading excel')
      message.error(msg)
    } finally {
      setIsExcelDownloading(false)
    }
  }

  const submitDataToMonth = () => {
    console.log('filtered data:', filteredData)
  }

  // -----------------------------
  // Columns
  // -----------------------------
  const columns = useMemo(
    () => [
      {
        title: 'Status',
        dataIndex: 'isActive',
        width: 90,
        render: (_, row) => {
          if (row.__isNew) return null
          const loading = togglingIds.has(row.id)
          return (
            <Checkbox
              checked={!!row.isActive}
              disabled={loading}
              onChange={(e) => handleToggle(row, e.target.checked)}
            />
          )
        },
      },
      {
        title: requiredTitle('Location'),
        dataIndex: 'locationCategoryName',
        width: 190,
        render: (_, row) => {
          // if (!row.isEditing) return row.locationCategoryName ?? row.locationName ?? '-'
          return (
            <Select
              style={{ width: '100%' }}
              placeholder="Select location"
              value={getLocationIdFromRow(row)}
              onChange={(locationId) => {
                const selected = locations.find((l) => l.locationId === locationId)
                const locationName = selected?.locationName
                const code = getLocationCode(locationName)

                updateRow(row.id, {
                  locationId,
                  locationName,
                  locationCategoryId: code,
                  locationCategoryName: locationName,
                })
              }}
              showSearch
              optionFilterProp="children"
            >
              {(locations || [])
                .filter((l) => l?.locationId && l?.locationName)
                .map((l) => (
                  <Select.Option key={l.locationId} value={l.locationId}>
                    {l.locationName}
                  </Select.Option>
                ))}
            </Select>
          )
        },
      },
      {
        title: 'Designation',
        dataIndex: 'designationName',
        width: 220,
        render: (_, row) => {
          // if (!row.isEditing) return row.designationName ?? '-'
          return (
            <Select
              style={{ width: '100%' }}
              placeholder="Select designation"
              value={row.designationId}
              onChange={(designationId) => {
                const selected = designations.find((d) => d.designationId === designationId)
                updateRow(row.id, { designationId, designationName: selected?.designationName })
              }}
              showSearch
              optionFilterProp="children"
              allowClear
            >
              {(designations || [])
                .filter((d) => d?.designationId && d?.designationName)
                .map((d) => (
                  <Select.Option key={d.designationId} value={d.designationId}>
                    {d.designationName}
                  </Select.Option>
                ))}
            </Select>
          )
        },
      },
      // {
      //   title: requiredTitle('Total Attendance'),
      //   dataIndex: 'totalAttendanceRange',
      //   width: 260,
      //   render: (_, row) => {
      //     // if (!row.isEditing) {
      //     //   const from = row.totalAttendanceFrom ?? '-'
      //     //   const to = row.totalAttendanceTo ?? '-'
      //     //   return `${from} → ${to}`
      //     // }

      //     return (
      //       <Space>
      //         <Input
      //           inputMode="decimal"
      //           placeholder="From: e.g. 2"
      //           value={row.totalAttendanceFrom}
      //           onChange={(e) =>
      //             updateRow(row.id, { totalAttendanceFrom: normalizeDecimal2(e.target.value) })
      //           }
      //         />
      //         <ArrowRightOutlined style={{ fontSize: '0.7rem' }} />
      //         <Input
      //           inputMode="decimal"
      //           placeholder="To: e.g. 4"
      //           value={row.totalAttendanceTo}
      //           onChange={(e) =>
      //             updateRow(row.id, { totalAttendanceTo: normalizeDecimal2(e.target.value) })
      //           }
      //         />
      //       </Space>
      //     )
      //   },
      // },
      {
        title: (
          <div style={{ textAlign: 'center' }}>
            {requiredTitle('Total Attendance')}
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginTop: 4,
                fontSize: 14,
                color: '#8c8c8c',
                fontWeight: 400,
              }}
            >
              <div style={{ flex: 1, textAlign: 'center' }}>From</div>
              <div style={{ width: 16 }} /> {/* same visual space as ArrowRight */}
              <div style={{ flex: 1, textAlign: 'center' }}>To</div>
            </div>
          </div>
        ),
        dataIndex: 'totalAttendanceRange',
        width: 260,
        render: (_, row) => (
          <Space style={{ width: '100%' }}>
            <Input
              style={{ flex: 1 }}
              inputMode="decimal"
              placeholder="From: e.g. 2"
              value={row.totalAttendanceFrom}
              onChange={(e) =>
                updateRow(row.id, { totalAttendanceFrom: normalizeDecimal2(e.target.value) })
              }
            />
            <ArrowRightOutlined style={{ fontSize: '0.7rem' }} />
            <Input
              style={{ flex: 1 }}
              inputMode="decimal"
              placeholder="To: e.g. 4"
              value={row.totalAttendanceTo}
              onChange={(e) =>
                updateRow(row.id, { totalAttendanceTo: normalizeDecimal2(e.target.value) })
              }
            />
          </Space>
        ),
      },
      {
        title: requiredTitle('Weekly Off'),
        dataIndex: 'weeklyOff',
        width: 140,
        render: (_, row) => {
          // if (!row.isEditing) return row.weeklyOff ?? '-'
          return (
            <Input
              inputMode="numeric"
              placeholder="e.g. 4"
              value={row.weeklyOff}
              onChange={(e) => updateRow(row.id, { weeklyOff: normalizeInteger(e.target.value) })}
            />
          )
        },
      },
      // {
      //   title: 'Actions',
      //   key: 'actions',
      //   width: 150,
      //   render: (_, row) => {
      //     // if (row.isEditing) {
      //     //   return (
      //     //     <Space>
      //     //       <Button
      //     //         icon={<CheckOutlined />}
      //     //         loading={savingRowIds.has(row.id)}
      //     //         onClick={() => handleSave(row)}
      //     //       />
      //     //       <Button icon={<CloseOutlined />} onClick={() => handleCancel(row)} />
      //     //     </Space>
      //     //   )
      //     // }
      //     return (
      //       <Popconfirm
      //         title="Delete the task"
      //         description="Are you sure to add/update this task?"
      //         okText="Yes"
      //         cancelText="No"
      //         onConfirm={() => handleSave(row)}
      //         // disabled={savingRowIds.has(row.id)}
      //         placement="left"
      //       >
      //         <Button
      //           icon={<CheckOutlined />}
      //           loading={savingRowIds.has(row.id)}
      //           // onClick={() => handleSave(row)}
      //         />
      //       </Popconfirm>
      //     )
      //     // <Button icon={<EditOutlined />} onClick={() => handleEdit(row)} />
      //   },
      // },
    ],
    [
      designations,
      getLocationIdFromRow,
      handleSave,
      locations,
      savingRowIds,
      togglingIds,
      updateRow,
    ],
  )

  const totalWidth = useMemo(() => columns.reduce((sum, c) => sum + (c.width || 150), 0), [columns])

  return (
    <>
      <PolicyUploader
        isVisible={isUploaderOpen}
        setIsVisible={setIsUploaderOpen}
        refreshData={fetchData}
      />
      <Space
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <Typography.Text type="secondary">
          Total Records: <b>{filteredData.length}</b>
        </Typography.Text>

        <Space>
          <MonthPicker
            value={currentMonth}
            onChange={handleMonthChange}
            style={{ width: '6.6rem' }}
          />
          <Button icon={<PlusOutlined />} onClick={handleAdd}>
            Add New
          </Button>
          {actionsMap?.upload?.actionStatus && (
            <Button icon={<UploadOutlined />} onClick={() => setIsUploaderOpen(true)} />
          )}
          <Button
            icon={<ExportOutlined />}
            onClick={handleDownloadExcel}
            loading={isExcelDownloading}
          />
          <Search
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 240 }}
          />
        </Space>
      </Space>

      <Space
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '0.6rem',
          justifyContent: 'space-between',
        }}
      >
        <Space>
          <Select
            style={{ width: 220 }}
            placeholder="Filter Location"
            value={selectedLoc}
            allowClear
            showSearch
            optionFilterProp="children"
            options={availableLocOptions}
            onChange={(val) => setSelectedLoc(val || null)}
          />

          <Select
            style={{ width: 220 }}
            placeholder="Filter Designation"
            value={selectedDesg}
            allowClear
            showSearch
            optionFilterProp="children"
            options={availableDesgOptions}
            onChange={(val) => setSelectedDesg(val || null)}
          />
        </Space>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CopyToForm validateRow={validateRow} />
          <span style={{ fontSize: '0.89rem' }}>(Copy to selected month)</span>
        </div>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredData}
        loading={loadingTable}
        scroll={tableData.length ? { y: 'calc(100vh - 210px)', x: totalWidth } : undefined}
        // pagination={{
        //   current: pagination.current,
        //   pageSize: pagination.pageSize,
        //   total: pagination.total,
        //   onChange: (page, pageSize) => setPagination((p) => ({ ...p, current: page, pageSize })),
        // }}
        pagination={false}
      />
      <Space style={{ width: '100%', display: 'flex', justifyContent: 'end', marginTop: '0.6rem' }}>
        <Button type="primary" onClick={submitDataToMonth}>
          Submit
        </Button>
      </Space>
    </>
  )
}

export default WeeklyOff
