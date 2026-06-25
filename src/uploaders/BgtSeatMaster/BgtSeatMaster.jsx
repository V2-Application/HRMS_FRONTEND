import React, { useEffect, useMemo, useRef, useState, startTransition, useCallback } from 'react'
import {
  Space,
  Table,
  Row,
  Input,
  Tooltip,
  Button,
  Col,
  message,
  Popconfirm,
  Checkbox,
  Tabs,
  Grid,
  Select,
  Modal,
} from 'antd'
import {
  DeleteOutlined,
  ExportOutlined,
  UploadOutlined,
  PlusOutlined,
  MinusOutlined,
  FilterFilled,
} from '@ant-design/icons'
import { ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBgtSeatMaster, filterBgtSeatMaster } from '../../services/Services'
import { set } from '../../redux/uiSlice'
import BgtSeatUploader from './BgtSeatUploader'
import Pageheading from '../../components/shared/Pageheading'
import { useActionsMap } from '../../utils/useActionsMap'
import axiosInstance from '../../services/axiosInstance'
import { createFilterWorker } from '../../utils/createFilterWorker'
import CardInRow from '../../components/shared/CardInRow/CardInRow'
import useColumnSearch from '../../components/shared/columnSearch'
import useMediaQuery from '../../hooks/useMediaQuery'

const { Search } = Input

/** Debounce hook for global search */
const useDebounced = (value, delay = 400) => {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return v
}

/** Checkbox filter dropdown for facet columns (Loc/Desg/Dept) */
const FilterDropdown = ({ dataIndex, dataList, filterValues, setFilterValues, confirm, title }) => {
  const [searchText, setSearchText] = useState('')
  const [selectedOptions, setSelectedOptions] = useState(filterValues || [])

  useEffect(() => {
    setSelectedOptions(filterValues || [])
  }, [filterValues])

  const filteredOptions = useMemo(() => {
    const needle = (searchText || '').toLowerCase()
    if (!needle) return dataList || []
    return (dataList || []).filter((item) =>
      String(item ?? '')
        .toLowerCase()
        .includes(needle),
    )
  }, [dataList, searchText])

  return (
    <div style={{ padding: 8, width: 240 }}>
      <Input
        placeholder={`Search ${title}`}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 8, display: 'block' }}
      />
      <div style={{ maxHeight: 220, overflowY: 'auto', paddingRight: 8 }}>
        <Checkbox.Group
          value={selectedOptions}
          onChange={(vals) => setSelectedOptions(vals)}
          style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
        >
          {filteredOptions.map((value) => (
            <Checkbox key={String(value)} value={value}>
              {String(value)}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>
      <Space style={{ marginTop: 8 }}>
        <Button
          type="primary"
          size="small"
          onClick={() => {
            setFilterValues(selectedOptions)
            confirm()
          }}
        >
          Filter
        </Button>
        <Button
          size="small"
          onClick={() => {
            setSelectedOptions([])
            setFilterValues([])
            setSearchText('')
            confirm()
          }}
        >
          Reset
        </Button>
      </Space>
    </div>
  )
}

const BgtSeatMaster = () => {
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([]) // result from worker (facet + global)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [totalCount, setTotalCount] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [selectedRows, setSelectedRows] = useState([])
  const [search, setSearch] = useState('')

  // ✅ ADDED HUB/DC tab key
  const TAB_KEYS = { RH: 'rh', ACTIVE: 'active', HUBDC: 'hubdc', INACTIVE: 'inactive' }
  const [activeTab, setActiveTab] = useState(TAB_KEYS.RH)

  const ecode = useSelector((row) => row?.auth?.data?.ecode)
  const [cardData, setCardData] = useState([
    { label: 'Locs', value: 0 },
    { label: 'Bgt Manpower', value: 0 },
    { label: 'Act Manpower', value: 0 },
    { label: 'Short', value: 0 },
    { label: 'Excess', value: 0 },
    { label: 'Desg. Excess', value: 0 },
    { label: 'Desg. Short', value: 0 },
    { label: 'Bgt Sal', value: 0 },
    { label: 'Act Sal', value: 0 },
    { label: 'ZM-V', value: 0 },
    { label: 'RM-V', value: 0 },
    { label: 'CM-V', value: 0 },
  ])

  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)
  const [lodingLocal, setlodingLocal] = useState(false)

  // Facet filter state (Excel-like)
  const [locCodeFilterValues, setLocCodeFilterValues] = useState([])
  const [locNameFilterValues, setLocNameFilterValues] = useState([])
  const [deptNameValues, setDeptNameValues] = useState([])
  const [desgNameValues, setDesgNameValues] = useState([])
  const [subDept1Values, setSubDept1Values] = useState([])
  const [subDept2Values, setSubDept2Values] = useState([])
  const [subDept3Values, setSubDept3Values] = useState([])
  const [openingDateValues, setOpeningDateValues] = useState([])

  // Column text-search filters (controlled)
  const [textFilters, setTextFilters] = useState({})

  // Auth/user
  const data = useSelector((state) => state?.auth?.data)
  const { locationList, firstName, lastName } = data || {}

  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)

  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  const handleToggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  // ✅ Mobile expanded row render - reorganized layout
  const expandedRowRender = (record) => (
    <div style={{ padding: 12, background: '#fafafa', fontSize: 10 }}>
      {/* Section 1: Core Details - SINGLE ROW (4 columns) - CENTERED */}
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: '#666',
            marginBottom: 6,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Core Details
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          <div>
            <div
              style={{
                color: '#888',
                fontSize: 8,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              Loc Name
            </div>
            <div
              style={{
                fontWeight: 500,
                fontSize: 9,
                wordBreak: 'break-word',
                lineHeight: '1.2',
                textAlign: 'center',
              }}
            >
              {record.locationName || '-'}
            </div>
          </div>
          <div>
            <div
              style={{
                color: '#888',
                fontSize: 8,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              Dept Name
            </div>
            <div
              style={{
                fontWeight: 500,
                fontSize: 9,
                wordBreak: 'break-word',
                lineHeight: '1.2',
                textAlign: 'center',
              }}
            >
              {record.departmentName || '-'}
            </div>
          </div>
          <div>
            <div
              style={{
                color: '#888',
                fontSize: 8,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              Emp Name
            </div>
            <div
              style={{
                fontWeight: 500,
                fontSize: 9,
                wordBreak: 'break-word',
                lineHeight: '1.2',
                textAlign: 'center',
              }}
            >
              {record.fullName || '-'}
            </div>
          </div>
          <div>
            <div
              style={{
                color: '#888',
                fontSize: 8,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              Report Head Code
            </div>
            <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
              {record.reportEcode || '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Financial & Reporting - CENTERED */}
      <div style={{ background: '#e6f7ff', padding: 8, borderRadius: 4 }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: '#1890ff',
            marginBottom: 6,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Financial & Reporting
        </div>

        {/* Row 1: Salary Bgt, Salary Act, Active Status, Opening Date - FULLY CENTERED */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 6,
            marginBottom: 8,
            justifyItems: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ width: '100%' }}>
            <div
              style={{
                color: '#1890ff',
                fontSize: 8,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              Salary Bgt
            </div>
            <div style={{ fontWeight: 600, fontSize: 9, color: '#52c41a', textAlign: 'center' }}>
              ₹{Number(record.salarY_BGT || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ width: '100%' }}>
            <div
              style={{
                color: '#1890ff',
                fontSize: 8,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              Salary Act
            </div>
            <div style={{ fontWeight: 600, fontSize: 9, color: '#52c41a', textAlign: 'center' }}>
              ₹{Number(record.actualSalary || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ width: '100%' }}>
            <div
              style={{
                color: '#1890ff',
                fontSize: 8,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              Active Status
            </div>
            <div
              style={{
                fontWeight: 600,
                fontSize: 9,
                color: record.storeStatus === true ? '#52c41a' : '#ff4d4f',
                textAlign: 'center',
              }}
            >
              {record.storeStatus === true ? 'Active' : 'UPC'}
            </div>
          </div>
          {activeTab === TAB_KEYS.INACTIVE && record.openingDate && (
            <div style={{ width: '100%' }}>
              <div
                style={{
                  color: '#1890ff',
                  fontSize: 8,
                  fontWeight: 500,
                  marginBottom: 2,
                  textAlign: 'center',
                }}
              >
                Opening Date
              </div>
              <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
                {record.openingDate || '-'}
              </div>
            </div>
          )}
        </div>

        {/* Row 2: Report Head Name, Report Mngr Desg */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          <div>
            <div
              style={{
                color: '#1890ff',
                fontSize: 8,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              Report Head Name
            </div>
            <div
              style={{
                fontWeight: 500,
                fontSize: 9,
                wordBreak: 'break-word',
                lineHeight: '1.2',
                textAlign: 'center',
              }}
            >
              {record.reportFullName || '-'}
            </div>
          </div>
          <div>
            <div
              style={{
                color: '#1890ff',
                fontSize: 8,
                fontWeight: 500,
                marginBottom: 2,
                textAlign: 'center',
              }}
            >
              Report Mngr Desg
            </div>
            <div
              style={{
                fontWeight: 500,
                fontSize: 9,
                wordBreak: 'break-word',
                lineHeight: '1.2',
                textAlign: 'center',
              }}
            >
              {record.bgtReportingDesig || '-'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const getMobileColumns = () => [
    {
      title: 'Loc',
      dataIndex: 'stCode',
      width: 50,
      render: (text) => <div style={{ fontSize: 10, fontWeight: 500 }}>{text || '-'}</div>,
    },
    {
      title: 'Desg',
      dataIndex: 'designationName',
      width: 90,
      render: (text) => (
        <div
          style={{
            fontSize: 9,
            fontWeight: 500,
            wordBreak: 'break-word',
            whiteSpace: 'normal',
            lineHeight: '1.1',
          }}
        >
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'E-Code',
      dataIndex: 'ecode',
      width: 60,
      render: (text) => <div style={{ fontSize: 10, fontWeight: 500 }}>{text || '-'}</div>,
    },
    {
      title: 'Seat',
      dataIndex: 'seatOrStatus',
      width: 50,
      render: (text) => (
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: String(text || '')
              .toLowerCase()
              .includes('excess')
              ? '#ff4d4f'
              : String(text || '')
                    .toLowerCase()
                    .includes('vacant')
                ? '#faad14'
                : '#52c41a',
          }}
        >
          {text || '-'}
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 70,
      render: (_, record, index) => {
        const uniqueKey = record.storeBudgetId || record.id || `row_${index}`
        const isExcess = String(record?.seatOrStatus).toLowerCase().trim() === 'excess'

        return (
          <div style={{ display: 'flex', gap: 2 }}>
            {!isExcess && (
              <Popconfirm
                title="Delete?"
                description="Delete this record?"
                onConfirm={() => handleDeleteRow(record)}
                okText="Yes"
                cancelText="No"
                placement="left"
              >
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined style={{ fontSize: 10 }} />}
                  style={{ padding: '2px' }}
                />
              </Popconfirm>
            )}

            <Button
              type="text"
              size="small"
              icon={
                expandedCards[uniqueKey] ? (
                  <MinusOutlined style={{ fontSize: 10 }} />
                ) : (
                  <PlusOutlined style={{ fontSize: 10 }} />
                )
              }
              onClick={(e) => {
                e.stopPropagation()
                handleToggleCard(uniqueKey)
              }}
              style={{ padding: '2px' }}
            />
          </div>
        )
      },
    },
  ]

  // Normalizes strings for robust, human-friendly matching
  const normalize = (s) =>
    String(s ?? '')
      .toLowerCase()
      .replace(/\u00a0/g, ' ')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  /** ---------- Web Worker setup ---------- */
  const workerRef = useRef(null)

  useEffect(() => {
    const w = createFilterWorker()
    workerRef.current = w
    const onMsg = (e) => {
      const { type, rows } = e.data || {}
      if (type === 'RESULT') {
        startTransition(() => {
          setFilteredData(rows || [])
          setTotalCount(rows?.length || 0)
          setCurrentPage(1)
        })
      }
    }
    w.addEventListener('message', onMsg)
    return () => {
      w.removeEventListener('message', onMsg)
      w.terminate()
    }
  }, [])

  /** Card builder */
  const buildCardData = (rows = []) => {
    let bgtManpower = 0,
      actManpower = 0,
      excess = 0,
      short = 0,
      actSal = 0,
      bgtSal = 0,
      rm = 0,
      cm = 0,
      zm = 0
    const isExcess = (v) =>
      String(v ?? '')
        .trim()
        .toLowerCase() === 'excess'
    const isVacant = (v) =>
      String(v ?? '')
        .trim()
        .toLowerCase() === 'vacant'
    const isRM = (v) =>
      String(v ?? '')
        .trim()
        .toLowerCase() === 'regional manager'
    const isCM = (v) =>
      String(v ?? '')
        .trim()
        .toLowerCase() === 'cluster manager'
    const isZM = (v) =>
      String(v ?? '')
        .trim()
        .toLowerCase() === 'zonal manager'
    const toNum = (v) => {
      const n = Number(String(v ?? 0).replace(/[^0-9.-]/g, ''))
      return Number.isFinite(n) ? n : 0
    }
    const normCode = (v) =>
      String(v ?? '')
        .toLowerCase()
        .trim()

    const uniqueLocs = new Set()

    for (const r of rows) {
      const code = normCode(r?.stCode)
      if (code) uniqueLocs.add(code)

      const ex = isExcess(r?.seatOrStatus)
      const vac = isVacant(r?.ecode)
      if (!ex) bgtManpower++
      if (ex || (!ex && !vac)) actManpower++
      if (ex) excess++
      if (vac) short++
      if (isRM(r?.designationName) && vac) rm++
      if (isCM(r?.designationName) && vac) cm++
      if (isZM(r?.designationName) && vac) zm++
      actSal += toNum(r?.actualSalary)
      bgtSal += toNum(r?.salarY_BGT)
    }

    // Bgt - Act: positive => Short (fewer people than budget), negative => Excess (more people than budget).
    const manpowerDiff = bgtManpower - actManpower
    const shortExcessValue = Math.abs(manpowerDiff)

    return [
      { label: 'Locs', value: uniqueLocs.size },
      { label: 'Bgt Manpower', value: bgtManpower },
      { label: 'Act Manpower', value: actManpower },
      { label: manpowerDiff < 0 ? 'Excess' : 'Short', value: shortExcessValue },
      { label: 'Desg. Excess', value: excess },
      { label: 'Desg. Short', value: short },
      { label: 'Bgt Sal', value: bgtSal },
      { label: 'Act Sal', value: actSal },
      { label: 'ZM-V', value: zm },
      { label: 'RM-V', value: rm },
      { label: 'CM-V', value: cm },
    ]
  }

  /** Fetch + scope data by allowed stCodes (from locationList) */
  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchBgtSeatMaster()
      if (response.status === 200) {
        const records = response.data?.data || []

        const response1 = await filterBgtSeatMaster({ eCode: ecode })

        const norm = (v) => (v === null || v === undefined ? '' : String(v).trim())

        const allowedList = response1?.data?.data?.allowedStores ?? []
        const deptExceptions = response1?.data?.data?.deptExceptions ?? []
        const desigExceptions = response1?.data?.data?.desigExceptions ?? []

        const allowedCodes = new Set(allowedList.map((a) => norm(a.stCode)))
        const level1Filtered = (records ?? []).filter((item) => allowedCodes.has(norm(item.stCode)))

        const blockedDeptSet = new Set(
          deptExceptions.map((b) => `${norm(b.stCode)}-${norm(b.deptId)}`),
        )
        const level2Filtered = level1Filtered.filter((item) => {
          const key = `${norm(item.stCode)}-${norm(item.departmentId)}`
          return !blockedDeptSet.has(key)
        })

        const blockedDesigSet = new Set(
          desigExceptions.map((b) => `${norm(b.stCode)}-${norm(b.deptId)}-${norm(b.desigId)}`),
        )
        const desigFiltered = level2Filtered.filter((item) => {
          const key = `${norm(item.stCode)}-${norm(item.departmentId)}-${norm(item.designationId)}`
          return !blockedDesigSet.has(key)
        })

        // Fallback (mirrors Employee Master): if the logged-in user has NO visibility scoping
        // at all (empty allowedStores + no dept/desig exceptions — e.g. admins / unscoped users),
        // show all rows instead of blanking the grid.
        const isIndexEmpty =
          allowedList.length === 0 && deptExceptions.length === 0 && desigExceptions.length === 0
        const finalFiltered = isIndexEmpty ? records ?? [] : desigFiltered

        setEmployeesListData(finalFiltered)
        setCardData(buildCardData(finalFiltered))

        workerRef.current?.postMessage({
          type: 'BUILD',
          payload: {
            data: finalFiltered,
            colKeys: [
              'stCode',
              'locationName',
              'designationName',
              'departmentName',
              'openingDate',
              'seatOrStatus',
              'salarY_BGT',
              'actualSalary',
              'ecode',
              'fullName',
              'reportEcode',
              'reportFullName',
              'bgtReportingDesig',
              'active',
              'subDepartment1',
              'subDepartment2',
              'subDepartment3',
            ],
          },
        })

        workerRef.current?.postMessage({
          type: 'FILTER',
          payload: { filters: {}, searchTerm: '' },
        })
      } else {
        setEmployeesListData([])
        setFilteredData([])
        setTotalCount(0)
        setCardData(buildCardData([]))
      }
    } catch (error) {
      console.error('Error fetching data:', error?.response?.data || error?.message)
      setEmployeesListData([])
      setFilteredData([])
      setTotalCount(0)
      setCardData(buildCardData([]))
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Debounced global search */
  const debouncedSearch = useDebounced(search, 400)
  const handleSearch = (e) => setSearch(e.target.value)

  /** Tell worker to apply facet filters + global search */
  useEffect(() => {
    const filters = {
      stCode: locCodeFilterValues,
      locationName: locNameFilterValues,
      designationName: desgNameValues,
      departmentName: deptNameValues,
      subDepartment1: subDept1Values,
      subDepartment2: subDept2Values,
      subDepartment3: subDept3Values,
      openingDate: openingDateValues,
    }
    workerRef.current?.postMessage({
      type: 'FILTER',
      payload: { filters, searchTerm: debouncedSearch },
    })
  }, [
    locCodeFilterValues,
    locNameFilterValues,
    openingDateValues,
    desgNameValues,
    deptNameValues,
    subDept1Values,
    subDept2Values,
    subDept3Values,
    debouncedSearch,
  ])

  /** Column text-search (controlled) */
  const getColumnSearchProps = useColumnSearch(textFilters, setTextFilters)

  // Shared filter icon so EVERY column (dropdown + search) shows the same default funnel icon.
  const facetFilterIcon = (filtered) => (
    <FilterFilled style={{ color: filtered ? '#1890ff' : undefined }} />
  )
  // Search-column props but with the same funnel icon as the dropdown columns.
  const searchCol = (key, label) => ({
    ...getColumnSearchProps(key, label),
    filterIcon: facetFilterIcon,
  })

  /** Apply textFilters on top of worker output so pagination reflects it */
  const finalData = useMemo(() => {
    let data = [...filteredData]
    Object.entries(textFilters).forEach(([key, val]) => {
      if (val != null && String(val).length > 0) {
        const needle = normalize(val)
        data = data.filter((r) => normalize(r?.[key]).includes(needle))
      }
    })
    return data
  }, [filteredData, textFilters])

  /** ====== TAB SPLIT ====== */
  // HO tab covers RH01 + RH02; both are excluded from Active/HUB-DC/UPC tabs (which use !codeIsRH).
  const RH_CODES = new Set(['RH01', 'RH02'])
  const codeIsRH = (v) =>
    RH_CODES.has(
      String(v ?? '')
        .trim()
        .toUpperCase(),
    )

  // ✅ HUB/DC definitions
  const HUB_DC_CODES = useMemo(
    () =>
      new Set([
        'DH24',
        'DW01',
        'DB03',
        'DB05',
        'DD04',
        'DJ02',
        'DK02',
        'DM01',
        'DN01',
        'DN02',
        'DO01',
        'DO02',
        'DP01',
        'DR01',
        'DU05',
        'DU06',
        'DU07',
        'DW02',
        'DX01',
      ]),
    [],
  )

  const isHubDcCode = useCallback(
    (v) =>
      HUB_DC_CODES.has(
        String(v ?? '')
          .trim()
          .toUpperCase(),
      ),
    [HUB_DC_CODES],
  )

  const rhRows = useMemo(() => finalData.filter((r) => codeIsRH(r?.stCode)), [finalData])

  // ✅ HUB/DC tab: only Active + HUB/DC codes (not RH01)
  const hubdcRows = useMemo(
    () =>
      finalData.filter(
        (r) => r?.storeStatus === true && !codeIsRH(r?.stCode) && isHubDcCode(r?.stCode),
      ),
    [finalData, isHubDcCode],
  )

  // ✅ Active Stores tab: Active but NOT RH01 and NOT HUB/DC
  const activeRows = useMemo(
    () =>
      finalData.filter(
        (r) => r?.storeStatus === true && !codeIsRH(r?.stCode) && !isHubDcCode(r?.stCode),
      ),
    [finalData, isHubDcCode],
  )

  // ✅ UPC Stores tab: UPC but NOT RH01 and NOT HUB/DC
  const inactiveRows = useMemo(
    () =>
      finalData.filter(
        (r) => r?.storeStatus !== true && !codeIsRH(r?.stCode) && !isHubDcCode(r?.stCode),
      ),
    [finalData, isHubDcCode],
  )

  const visibleRows = useMemo(() => {
    if (activeTab === TAB_KEYS.RH) return rhRows
    if (activeTab === TAB_KEYS.ACTIVE) return activeRows
    if (activeTab === TAB_KEYS.HUBDC) return hubdcRows
    return inactiveRows
  }, [activeTab, rhRows, activeRows, hubdcRows, inactiveRows, TAB_KEYS])

  /** Keep cards in sync with *visible* rows on the active tab */
  useEffect(() => {
    setCardData(buildCardData(visibleRows))
  }, [visibleRows])

  /** Dropdown lists built from current facet-filtered view */
  const uniqueValues = useMemo(() => {
    const source = visibleRows
    const getUniques = (key) => {
      const s = new Set()
      for (const r of source) s.add(r?.[key])
      return Array.from(s)
        .filter((v) => v !== undefined && v !== null)
        .sort((a, b) => String(a).localeCompare(String(b)))
    }
    return {
      stCode: getUniques('stCode'),
      designationName: getUniques('designationName'),
      departmentName: getUniques('departmentName'),
      seatOrStatus: getUniques('seatOrStatus'),
      locationName: getUniques('locationName'),
      openingDate: getUniques('openingDate'),
      subDepartment1: getUniques('subDepartment1'),
      subDepartment2: getUniques('subDepartment2'),
      subDepartment3: getUniques('subDepartment3'),
    }
  }, [visibleRows])

  /** Clear ALL filters (facet + text + global) */
  const clearAllFilters = () => {
    setLocCodeFilterValues([])
    setDeptNameValues([])
    setDesgNameValues([])
    setSubDept1Values([])
    setSubDept2Values([])
    setSubDept3Values([])
    setLocNameFilterValues([])
    setOpeningDateValues([])
    setTextFilters({})
    setSearch('')
    setCurrentPage(1)
    workerRef.current?.postMessage({
      type: 'FILTER',
      payload: { filters: {}, searchTerm: '' },
    })
  }

  // Build the precise delete identifier for a seat row.
  const toSeatDeleteItem = (r) => ({
    stCode: r?.stCode,
    deptSno: String(r?.departmentId ?? ''),
    desgSno: String(r?.designationId ?? ''),
    seatNo: r?.seatOrStatus,
  })
  const isExcessRow = (r) => String(r?.seatOrStatus).toLowerCase().trim() === 'excess'

  /** Delete a single seat entry (precise: this exact seat, not the whole series) */
  const handleDeleteRow = async (record) => {
    try {
      const response = await axiosInstance.post('/api/BgtSeatMaster/DeleteSeats', [
        toSeatDeleteItem(record),
      ])
      if (response?.status === 200) {
        message.success(response?.data?.message || 'Deleted successfully')
        fetchData()
        setSelectedRowKeys([])
        setSelectedRows([])
        setLocCodeFilterValues([])
        setLocNameFilterValues([])
        setDesgNameValues([])
        setDeptNameValues([])
      }
    } catch (error) {
      console.error('error deleting bgt seat: ', error)
      message.error(error?.response?.data?.message || 'Error deleting bgt seat')
    }
  }

  /** Delete ALL budget seats for one or more stores (LOC_CODE list). Server backs up the rows first. */
  const handleDeleteByStore = async (locCodes) => {
    const codes = (Array.isArray(locCodes) ? locCodes : [locCodes]).filter(Boolean)
    if (codes.length === 0) {
      message.warning('Select at least one store first.')
      return
    }
    try {
      const response = await axiosInstance.post('/api/BgtSeatMaster/DeleteByStore', codes)
      if (response?.status === 200) {
        message.success(
          response?.data?.message || `Deleted all budget seats for ${codes.length} store(s)`,
        )
        fetchData()
        setSelectedRowKeys([])
        setSelectedRows([])
      }
    } catch (error) {
      console.error('error deleting store bgt: ', error)
      message.error(error?.response?.data?.message || 'Error deleting store budget seats')
    }
  }

  /** Delete EVERY budget seat (whole table). Server backs up the full table first. */
  const handleDeleteAll = async () => {
    try {
      const response = await axiosInstance.post(`/api/BgtSeatMaster/DeleteAll?confirm=DELETEALL`)
      if (response?.status === 200) {
        message.success(response?.data?.message || 'Deleted all budget seats')
        fetchData()
        setSelectedRowKeys([])
        setSelectedRows([])
      }
    } catch (error) {
      console.error('error deleting all bgt: ', error)
      message.error(error?.response?.data?.message || 'Error deleting all budget seats')
    }
  }

  /** Unique store list (Loc Code — Loc Name) for the "Delete by Store" picker */
  const storeOptions = useMemo(() => {
    const m = new Map()
    for (const r of employeesListData) {
      const code = r?.stCode
      if (code && !m.has(code)) m.set(code, r?.locationName || '')
    }
    return Array.from(m.entries())
      .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
      .map(([code, name]) => ({ value: code, label: name ? `${code} — ${name}` : code }))
  }, [employeesListData])

  /** Bulk delete the selected seat entries */
  const handleBulkDelete = async () => {
    const items = (selectedRows || []).map(toSeatDeleteItem)
    if (items.length === 0) {
      message.warning('Select one or more rows to delete.')
      return
    }
    try {
      const response = await axiosInstance.post('/api/BgtSeatMaster/DeleteSeats', items)
      if (response?.status === 200) {
        message.success(response?.data?.message || `Deleted ${items.length} seat(s) successfully`)
        setSelectedRowKeys([])
        setSelectedRows([])
        fetchData()
      }
    } catch (error) {
      console.error('error bulk deleting bgt seats: ', error)
      message.error(error?.response?.data?.message || 'Error deleting selected seats')
    }
  }

  // Stable unique key per row + checkbox selection (every row selectable, incl. EXCESS).
  const seatRowKey = (r, i) =>
    `${r?.stCode || ''}|${r?.departmentId || ''}|${r?.designationId || ''}|${r?.seatOrStatus || ''}|${i}`
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys)
      setSelectedRows(rows)
    },
    // EXCESS rows are employees with no budgeted seat -> nothing to delete, so not selectable.
    getCheckboxProps: (record) => ({ disabled: isExcessRow(record) }),
  }

  /** Table columns */
  const columns = [
    {
      title: 'Loc Code',
      dataIndex: 'stCode',
      key: 'stCode',
      ellipsis: true,
      width: 120,
      filteredValue: locCodeFilterValues?.length ? locCodeFilterValues : null,
      onFilter: () => true,
      filterIcon: facetFilterIcon,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Loc Code"
          dataIndex="stCode"
          dataList={uniqueValues.stCode}
          filterValues={locCodeFilterValues}
          setFilterValues={setLocCodeFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Loc Name',
      dataIndex: 'locationName',
      key: 'locationName',
      ellipsis: true,
      width: 120,
      filteredValue: locNameFilterValues?.length ? locNameFilterValues : null,
      onFilter: () => true,
      filterIcon: facetFilterIcon,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Loc Name"
          dataIndex="locationName"
          dataList={uniqueValues.locationName}
          filterValues={locNameFilterValues}
          setFilterValues={setLocNameFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Desg Name',
      dataIndex: 'designationName',
      key: 'designationName',
      width: 150,
      ellipsis: true,
      filteredValue: desgNameValues?.length ? desgNameValues : null,
      onFilter: () => true,
      filterIcon: facetFilterIcon,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Desg Name"
          dataIndex="designationName"
          dataList={uniqueValues.designationName}
          filterValues={desgNameValues}
          setFilterValues={setDesgNameValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Dept Name',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 150,
      ellipsis: true,
      filteredValue: deptNameValues?.length ? deptNameValues : null,
      onFilter: () => true,
      filterIcon: facetFilterIcon,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Dept Name"
          dataIndex="departmentName"
          dataList={uniqueValues.departmentName}
          filterValues={setDeptNameValues}
          setFilterValues={setDeptNameValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Sub Dept 1',
      dataIndex: 'subDepartment1',
      key: 'subDepartment1',
      width: 130,
      ellipsis: true,
      render: (v) => v || '-',
      filteredValue: subDept1Values?.length ? subDept1Values : null,
      onFilter: () => true,
      filterIcon: facetFilterIcon,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Sub Dept 1"
          dataIndex="subDepartment1"
          dataList={uniqueValues.subDepartment1}
          filterValues={subDept1Values}
          setFilterValues={setSubDept1Values}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Sub Dept 2',
      dataIndex: 'subDepartment2',
      key: 'subDepartment2',
      width: 130,
      ellipsis: true,
      render: (v) => v || '-',
      filteredValue: subDept2Values?.length ? subDept2Values : null,
      onFilter: () => true,
      filterIcon: facetFilterIcon,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Sub Dept 2"
          dataIndex="subDepartment2"
          dataList={uniqueValues.subDepartment2}
          filterValues={subDept2Values}
          setFilterValues={setSubDept2Values}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Sub Dept 3',
      dataIndex: 'subDepartment3',
      key: 'subDepartment3',
      width: 130,
      ellipsis: true,
      render: (v) => v || '-',
      filteredValue: subDept3Values?.length ? subDept3Values : null,
      onFilter: () => true,
      filterIcon: facetFilterIcon,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Sub Dept 3"
          dataIndex="subDepartment3"
          dataList={uniqueValues.subDepartment3}
          filterValues={subDept3Values}
          setFilterValues={setSubDept3Values}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Seat Master No.',
      dataIndex: 'seatOrStatus',
      key: 'seatOrStatus',
      width: 140,
      ellipsis: true,
      ...searchCol('seatOrStatus', 'Seat Master No.'),
    },
    {
      title: 'Salary Bgt',
      dataIndex: 'salarY_BGT',
      key: 'salarY_BGT',
      width: 120,
      ellipsis: true,
      ...searchCol('salarY_BGT', 'Salary Bgt'),
    },
    {
      title: 'Salary Act.',
      dataIndex: 'actualSalary',
      key: 'actualSalary',
      width: 120,
      ellipsis: true,
      ...searchCol('actualSalary', 'Salary Act.'),
    },
    {
      title: 'Emp Code',
      dataIndex: 'ecode',
      key: 'ecode',
      width: 120,
      ellipsis: true,
      ...searchCol('ecode', 'Emp Code'),
    },
    {
      title: 'Emp Name',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 160,
      ellipsis: true,
      ...searchCol('fullName', 'Emp Name'),
    },
    {
      title: 'Report Head Code',
      dataIndex: 'reportEcode',
      key: 'reportEcode',
      width: 140,
      ellipsis: true,
      ...searchCol('reportEcode', 'Report Head Code'),
    },
    {
      title: 'Report Head Name',
      dataIndex: 'reportFullName',
      key: 'reportFullName',
      width: 160,
      ellipsis: true,
      ...searchCol('reportFullName', 'Report Head Name'),
    },
    {
      title: 'Report Mngr. Desg.',
      dataIndex: 'bgtReportingDesig',
      key: 'bgtReportingDesig',
      width: 180,
      ellipsis: true,
      ...searchCol('bgtReportingDesig', 'Report Mngr. Desg.'),
    },
    {
      title: 'Active',
      dataIndex: 'storeStatus',
      key: 'storeStatus',
      width: 90,
      ellipsis: true,
      render: (val) => (val === true ? 'Active' : 'UPC'),
      ...searchCol('storeStatus', 'Active'),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 90,
      ellipsis: true,
      render: (_, record) => (
        <Space style={{ position: 'relative' }}>
          <Popconfirm
            title="Are you sure you want to delete this record?"
            onConfirm={() => handleDeleteRow(record)}
            okText="Yes"
            cancelText="No"
            placement="left"
          >
            <Button icon={<DeleteOutlined />} title="Delete" />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // Column shown only on Tab 3 (UPC)
  const openingMonthCol = {
    title: 'Opening Month',
    dataIndex: 'openingDate',
    key: 'openingDate',
    width: 140,
    ellipsis: true,
    filteredValue: openingDateValues?.length ? openingDateValues : null,
    onFilter: () => true,
    filterIcon: facetFilterIcon,
    filterDropdown: ({ confirm }) => (
      <FilterDropdown
        title="Opening Date"
        dataIndex="openingDate"
        dataList={uniqueValues.openingDate}
        filterValues={openingDateValues}
        setFilterValues={setOpeningDateValues}
        confirm={confirm}
      />
    ),
  }

  // Put "Opening Month" right AFTER "Dept Name" (only on Tab 3 / UPC)
  const columnsToRender = useMemo(() => {
    if (isMobile) return getMobileColumns()
    if (activeTab !== TAB_KEYS.INACTIVE) return columns

    const idx = columns.findIndex((c) => c.dataIndex === 'departmentName')
    if (idx === -1) return [...columns, openingMonthCol]

    return [...columns.slice(0, idx + 1), openingMonthCol, ...columns.slice(idx + 1)]
  }, [activeTab, columns, isMobile])

  const totalWidth = useMemo(
    () => columns.reduce((sum, col) => sum + (col.width || 150), 0),
    [columns],
  )

  // ✅ Added HUB/DC tab here
  const tabItems = [
    { key: TAB_KEYS.RH, label: `HO` },
    { key: TAB_KEYS.ACTIVE, label: `Active Stores` },
    { key: TAB_KEYS.HUBDC, label: `HUB/DC` },
    { key: TAB_KEYS.INACTIVE, label: `UPC Stores` },
  ]

  // Pick which columns to export (skip "action" or any column without a dataIndex)
  const exportableColumns = useMemo(
    () => columns.filter((c) => c.dataIndex && c.key !== 'action'),
    [columns],
  )

  // Build CSV from current view
  const toCSV = (rows, cols) => {
    const escape = (val) => {
      const s = String(val ?? '')
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
      return s
    }

    const header = cols.map((c) => escape(c.title)).join(',')
    const body = rows
      .map((r) =>
        cols
          .map((c) => {
            const v = r[c.dataIndex]
            return escape(v)
          })
          .join(','),
      )
      .join('\n')

    return [header, body].join('\n')
  }

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  // Use the *currently visible* rows
  const handleDownloadFiltered = () => {
    if (!visibleRows?.length) {
      message.info('No rows to export for the current view.')
      return
    }
    const csv = toCSV(visibleRows, exportableColumns)

    // ✅ Added HUB/DC export label
    const tabName =
      activeTab === TAB_KEYS.RH
        ? 'HO'
        : activeTab === TAB_KEYS.ACTIVE
          ? 'Active'
          : activeTab === TAB_KEYS.HUBDC
            ? 'HUBDC'
            : 'UPC'

    const filename = `BgtSeatMaster_${tabName}_${new Date().toISOString()}.csv`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    downloadBlob(blob, filename)
  }

  /** Rename "Locs" per tab and keep RM/CM/ZM hidden on tabs 2, 3, 4 */
  const cardsForTab = useMemo(() => {
    const base = cardData || []

    // Tab 1 (RH): keep as-is (or hide anything you already chose to hide here)
    if (activeTab === TAB_KEYS.RH) {
      const HIDE_TAB1 = new Set(['Locs'])
      return base.filter((c) => !HIDE_TAB1.has(c.label))
    }

    // Tabs 2/3/4: hide RM/CM/ZM and rename "Locs"
    const renamed = base.map((c) =>
      c.label === 'Locs'
        ? {
            ...c,
            label:
              activeTab === TAB_KEYS.ACTIVE
                ? 'Active Stores'
                : activeTab === TAB_KEYS.HUBDC
                  ? 'HUB/DC'
                  : 'UPC Stores',
          }
        : c,
    )

    const HIDE = new Set(['RM-V', 'CM-V', 'ZM-V'])
    return renamed.filter((c) => !HIDE.has(c.label))
  }, [cardData, activeTab, TAB_KEYS])

  const shouldShowDesig = ecode === 'V00362' ? true : false

  return (
    <>
      <Pageheading
        title={`SEAT MASTER (${firstName} ${lastName}${shouldShowDesig ? ' - RH' : ''})`}
        fontSize="1.5rem"
      />

      <div style={{ width: '100%', overflow: 'auto' }}>
        <CardInRow data={cardsForTab} />
      </div>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      <div className="def" style={{ paddingBottom: 10 }}>
        <TableBulkActionIcons
          totalRecords={visibleRows.length}
          selectedRowKeys={selectedRowKeys}
          handleSearch={(e) => setSearch(e.target.value)}
          lodingLocal={lodingLocal}
          setlodingLocal={setlodingLocal}
          refreshData={fetchData}
          actionsMap={actionsMap}
          filteredData={visibleRows}
          search={search}
          clearAllFilters={clearAllFilters}
          isMobile={isMobile}
          storeOptions={storeOptions}
          handleDeleteByStore={handleDeleteByStore}
          handleDeleteAll={handleDeleteAll}
        />

        {/* Tabs for HO / Active / HUBDC / UPC */}
        <Tabs
          items={tabItems}
          activeKey={activeTab}
          onChange={(k) => {
            setActiveTab(k)
            setCurrentPage(1)
          }}
          style={{ marginBottom: 8 }}
          tabBarExtraContent={
            <Space>
              {selectedRowKeys.length > 0 && (
                <Popconfirm
                  title={`Delete ${selectedRowKeys.length} selected seat entr${
                    selectedRowKeys.length === 1 ? 'y' : 'ies'
                  }?`}
                  onConfirm={handleBulkDelete}
                  okText="Yes"
                  cancelText="No"
                  placement="bottomRight"
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Delete Selected ({selectedRowKeys.length})
                  </Button>
                </Popconfirm>
              )}
              <Tooltip title="Download the current (filtered) table view">
                <Button onClick={handleDownloadFiltered} icon={<ExportOutlined />}>
                  Download (Filtered)
                </Button>
              </Tooltip>
            </Space>
          }
        />

        {isMobile ? (
          <Table
            size="small"
            rowKey={(r, i) => r?.storeBudgetId || r?.id || `row_${i}`}
            columns={columnsToRender}
            dataSource={visibleRows}
            pagination={{
              current: currentPage,
              position: ['bottomRight'],
              total: visibleRows.length,
              pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: handleTableChange,
            }}
            bordered
            expandable={{
              expandedRowKeys: Object.keys(expandedCards)
                .filter((key) => expandedCards[key])
                .map((key) => (isNaN(key) ? key : parseInt(key))),
              expandedRowRender: expandedRowRender,
              showExpandColumn: false,
            }}
            className={theme === 'dark' ? 'dark-theme' : ''}
          />
        ) : (
          <Table
            size="small"
            rowKey={seatRowKey}
            rowSelection={rowSelection}
            columns={columnsToRender}
            dataSource={visibleRows}
            pagination={{
              current: currentPage,
              position: ['bottomRight'],
              total: visibleRows.length,
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: handleTableChange,
            }}
            bordered
            scroll={{ x: totalWidth, y: 'calc(100vh - 180px)' }}
            style={{ whiteSpace: 'nowrap' }}
            className={theme === 'dark' ? 'dark-theme' : ''}
          />
        )}
      </div>
    </>
  )
}

const TableBulkActionIcons = ({
  totalRecords,
  selectedRowKeys,
  handleSearch,
  search,
  lodingLocal,
  setlodingLocal,
  refreshData,
  actionsMap,
  clearAllFilters,
  isMobile,
  storeOptions = [],
  handleDeleteByStore,
  handleDeleteAll,
}) => {
  const { theme } = useSelector((state) => state.ui)
  const [isEmpUploadVisible, setIsEmpUploadVisible] = useState(false)
  const [deleteStores, setDeleteStores] = useState([])
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [deleteAllText, setDeleteAllText] = useState('')

  const [statusSummary, setstatusSummary] = useState([
    {
      name: 'Total Rows',
      label: 'Total rows in current view',
      count: 0,
      color: 'green',
      id: [1, 2, 3, 4, 5],
    },
  ])

  useEffect(() => {
    setstatusSummary([
      {
        name: 'Total Rows',
        label: 'Total rows in current view',
        count: totalRecords,
        color: 'green',
        id: [1, 2, 3, 4, 5],
      },
    ])
  }, [selectedRowKeys, totalRecords])

  const exportExcel = async () => {
    try {
      setlodingLocal(true)
      const response = await axiosInstance.get(`/api/BgtSeatMaster/GetAll?isExcel=true`, {
        responseType: 'blob',
      })
      const blob = new Blob([response?.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `BgtSeatMaster_${new Date().toISOString()}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      message.error(error?.response?.data?.message || 'Error occured')
    } finally {
      setlodingLocal(false)
    }
  }

  return (
    <>
      {isEmpUploadVisible && (
        <BgtSeatUploader
          isVisible={isEmpUploadVisible}
          setIsVisible={setIsEmpUploadVisible}
          refreshData={refreshData}
        />
      )}

      <div style={{ padding: 5, display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
        <Space
          style={{
            width: '100%',
            display: 'flex',
            gap: '0.2rem !important',
            alignItems: 'center',
            justifyContent: 'end',
          }}
        >
          <Tooltip placement="top" title={'Clear All Filters'}>
            <Button style={{ marginLeft: 5 }} onClick={clearAllFilters}>
              Clear Filters
            </Button>
          </Tooltip>

          {actionsMap?.upload?.actionStatus && (
            <Tooltip placement="top" title={'Upload Bgt Seat Master'}>
              <Button style={{ marginLeft: 5 }} onClick={() => setIsEmpUploadVisible(true)}>
                <UploadOutlined />
              </Button>
            </Tooltip>
          )}

          {actionsMap?.export?.actionStatus && (
            <Tooltip placement="top" title={'Export'}>
              <Button style={{ marginLeft: 5 }} loading={lodingLocal} onClick={exportExcel}>
                <ExportOutlined />
              </Button>
            </Tooltip>
          )}

          {/* Delete all budget seats of one or more chosen stores */}
          <Select
            mode="multiple"
            showSearch
            allowClear
            maxTagCount="responsive"
            placeholder="Delete by store(s)…"
            style={{ minWidth: 260, maxWidth: 420, marginLeft: 5 }}
            value={deleteStores}
            onChange={setDeleteStores}
            options={storeOptions}
            optionFilterProp="label"
          />
          <Popconfirm
            title="Delete these stores' budget?"
            description={
              deleteStores.length
                ? `All budget seats for ${deleteStores.length} store(s) will be deleted (a backup is saved first).`
                : 'Select one or more stores first.'
            }
            okText="Yes, delete"
            okButtonProps={{ danger: true }}
            cancelText="No"
            placement="bottomRight"
            disabled={!deleteStores.length}
            onConfirm={async () => {
              await handleDeleteByStore?.(deleteStores)
              setDeleteStores([])
            }}
          >
            <Button danger disabled={!deleteStores.length}>
              Delete Store BGT ({deleteStores.length})
            </Button>
          </Popconfirm>

          {/* Delete EVERYTHING (typed confirmation) */}
          <Tooltip placement="top" title={'Delete ALL budget seats (every line item)'}>
            <Button
              danger
              type="primary"
              icon={<DeleteOutlined />}
              onClick={() => {
                setDeleteAllText('')
                setDeleteAllOpen(true)
              }}
            >
              Delete All BGT
            </Button>
          </Tooltip>

          <Search
            placeholder="Search in table..."
            allowClear
            onChange={handleSearch}
            style={isMobile ? { width: 150, marginLeft: 5 } : { width: 300, marginLeft: 5 }}
            value={search}
          />
        </Space>
      </div>

      <Modal
        title="Delete ALL budget seats?"
        open={deleteAllOpen}
        okText="Delete everything"
        okButtonProps={{ danger: true, disabled: deleteAllText.trim().toUpperCase() !== 'DELETE ALL' }}
        cancelText="Cancel"
        onCancel={() => setDeleteAllOpen(false)}
        onOk={async () => {
          await handleDeleteAll?.()
          setDeleteAllOpen(false)
          setDeleteAllText('')
        }}
      >
        <p style={{ marginBottom: 8 }}>
          This permanently deletes <b>every</b> line item in BGT Seat Master. A full backup table is
          saved first, but this affects all stores.
        </p>
        <p style={{ marginBottom: 8 }}>
          Type <b>DELETE ALL</b> to confirm:
        </p>
        <Input
          value={deleteAllText}
          onChange={(e) => setDeleteAllText(e.target.value)}
          placeholder="DELETE ALL"
        />
      </Modal>
    </>
  )
}

export default BgtSeatMaster
