import React, { useEffect, useMemo, useState, useCallback } from 'react'
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
  Grid,
} from 'antd'
import {
  DeleteOutlined,
  ExportOutlined,
  StepForwardOutlined,
  UploadOutlined,
  PlusOutlined,
  MinusOutlined,
} from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import {
  deleteLocation,
  exportEmployeeMaster,
  fetchLocationMaster,
  toggleLocation,
} from '../../services/Services'
import { set } from '../../redux/uiSlice'
import LocationCodeUploader from './LocationCodeUploader'
import Pageheading from '../../components/shared/Pageheading'
import * as XLSX from 'xlsx'
import { useActionsMap } from '../../utils/useActionsMap'
import CardInRow from '../../components/shared/CardInRow/CardInRow'

import useMediaQuery from '../../hooks/useMediaQuery'

const { Search } = Input

/** Reusable checkbox filter dropdown */
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

const LocationCodeMaster = () => {
  const [employeesListData, setEmployeesListData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [totalCount, setTotalCount] = useState(0)
  const [importExelModal, setimportExelModal] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [search, setSearch] = useState('')

  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)

  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  const handleToggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const expandedRowRender = (record) => (
    <div style={{ padding: 12, background: '#fafafa', fontSize: 11 }}>
      {/* Row 1: Zone, Region, Cluster, State - 4 columns */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 8 }}
      >
        <div>
          <div
            style={{
              color: '#666',
              fontSize: 10,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            Zone
          </div>
          <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
            {record.zoneName || '-'}
          </div>
        </div>
        <div>
          <div
            style={{
              color: '#666',
              fontSize: 10,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            Region
          </div>
          <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
            {record.regionName || '-'}
          </div>
        </div>
        <div>
          <div
            style={{
              color: '#666',
              fontSize: 10,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            Cluster
          </div>
          <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
            {record.clusterName || '-'}
          </div>
        </div>
        <div>
          <div
            style={{
              color: '#666',
              fontSize: 10,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            State
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 9,
              textAlign: 'center',
              wordBreak: 'break-word',
              lineHeight: '1.2',
            }}
          >
            {record.stateName || '-'}
          </div>
        </div>
      </div>

      {/* Row 2: Opening Date - full width */}
      <div style={{ background: '#e6f7ff', padding: 6, borderRadius: 4, textAlign: 'center' }}>
        <div style={{ color: '#1890ff', fontSize: 10, fontWeight: 600, marginBottom: 2 }}>
          Opening Date
        </div>
        <div style={{ fontWeight: 600, fontSize: 10, color: '#1890ff' }}>
          {normDate(record.openingDate) || '-'}
        </div>
      </div>
    </div>
  )

  // ✅ Mobile columns
  const getMobileColumns = () => [
    {
      title: 'Code',
      dataIndex: 'stCode',
      width: 60,
      render: (text) => <div style={{ fontSize: 10, fontWeight: 500 }}>{text || '-'}</div>,
    },
    {
      title: 'Location',
      dataIndex: 'locationName',
      width: 150,
      render: (text) => (
        <div
          style={{
            fontSize: 10,
            fontWeight: 500,
            wordBreak: 'break-word',
            whiteSpace: 'normal',
            lineHeight: '1.2',
          }}
        >
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 60,
      render: (val) => (
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: val ? '#52c41a' : '#ff4d4f',
          }}
        >
          {statusLabel(val)}
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 40,
      render: (_, record, index) => {
        const uniqueKey = record.storeBudgetId || record.locationId || `row_${index}`
        return (
          <div style={{ display: 'flex', gap: 2 }}>
            <Popconfirm
              title="Toggle"
              description="Move this location?"
              onConfirm={() => confirmToggle(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                size="small"
                icon={<StepForwardOutlined style={{ fontSize: 11 }} />}
                style={{ padding: '2px' }}
              />
            </Popconfirm>

            <Popconfirm
              title="Delete"
              description="Delete this location?"
              onConfirm={() => confirmDelete(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined style={{ fontSize: 11 }} />}
                style={{ padding: '2px' }}
              />
            </Popconfirm>

            <Button
              type="text"
              size="small"
              icon={
                expandedCards[uniqueKey] ? (
                  <MinusOutlined style={{ fontSize: 11 }} />
                ) : (
                  <PlusOutlined style={{ fontSize: 11 }} />
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

  const [lodingLocal, setlodingLocal] = useState(false)
  const [cards, setCards] = useState([
    { label: 'Total Stores', value: 0 },
    { label: 'Active Stores', value: 0 },
    { label: 'UPC Stores', value: 0 },
  ])

  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)

  // facet filter states
  const [locCodeFilterValues, setLocCodeFilterValues] = useState([])
  const [locNameFilterValues, setLocNameFilterValues] = useState([])
  const [zoneFilterValues, setZoneFilterValues] = useState([])
  const [regionFilterValues, setRegionFilterValues] = useState([])
  const [clusterFilterValues, setClusterFilterValues] = useState([])
  const [stateFilterValues, setStateFilterValues] = useState([])
  const [openingFilterValues, setOpeningFilterValues] = useState([]) // YYYY-MM-DD strings
  const [statusFilterValues, setStatusFilterValues] = useState([]) // booleans
  const [monthFilterValues, setMonthFilterValues] = useState([]) // numbers 1..12

  const normDate = (d) => (d == null ? null : String(d).split(/[T ]/)[0])

  // Status helpers
  const statusLabel = (v) => (v === true ? 'Active' : 'UPC')
  const labelToBool = (label) => label === 'Active'

  const buildCardData = (list = []) => {
    const total = list.length
    const active = list.filter((x) => x?.isActive === true).length
    const upc = list.filter((x) => x?.isActive === false || x?.isActive == null).length
    return [
      { label: 'Total Stores', value: total },
      { label: 'Active Stores', value: active },
      { label: 'UPC Stores', value: upc },
    ]
  }

  // Month helpers
  const MONTH_NAMES = [
    null,
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const monthNum = (d) => {
    if (!d) return null
    const iso = normDate(d)
    if (!iso) return null
    const m = new Date(iso).getMonth()
    return Number.isNaN(m) ? null : m + 1
  }
  const monthLabel = (n) => (n == null ? null : MONTH_NAMES[n] || null)
  const labelToMonth = (label) => {
    if (!label) return null
    const i = MONTH_NAMES.findIndex((m) => m?.toLowerCase() === String(label).toLowerCase())
    return i > 0 ? i : null
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchLocationMaster()
      if (response.status === 200) {
        const rows = response?.data?.data || []
        const withMonth = rows.map((r) => ({
          ...r,
          openingMonth: monthNum(r?.openingDate), // 1..12 or null
        }))
        setEmployeesListData(withMonth)
      } else {
        setEmployeesListData([])
      }
    } catch (error) {
      console.error('Error fetching data:', error?.response?.data || error?.message)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  /** Apply all filters + text search; optionally exclude one facet key (for dependent dropdown options) */
  const applyFilters = (rows, { excludeKey = null } = {}) => {
    let out = rows || []

    // text search
    const q = (search || '').trim().toLowerCase()
    if (q) {
      out = out.filter((dt) =>
        Object.values(dt ?? {}).some((val) =>
          String(val ?? '')
            .toLowerCase()
            .includes(q),
        ),
      )
    }

    // helper to apply facet filter unless excluded
    const applyFacet = (key, values) => {
      if (excludeKey === key) return
      if (!values?.length) return
      out = out.filter((r) => values.includes(r?.[key]))
    }

    applyFacet('stCode', locCodeFilterValues)
    applyFacet('locationName', locNameFilterValues)
    applyFacet('zoneName', zoneFilterValues)
    applyFacet('regionName', regionFilterValues)
    applyFacet('clusterName', clusterFilterValues)
    applyFacet('stateName', stateFilterValues)
    applyFacet('openingMonth', monthFilterValues)

    if (excludeKey !== 'isActive') {
      if (statusFilterValues?.length) {
        out = out.filter((r) => statusFilterValues.includes(r?.isActive))
      }
    }

    if (excludeKey !== 'openingDate') {
      if (openingFilterValues?.length) {
        out = out.filter((r) => openingFilterValues.includes(normDate(r?.openingDate)))
      }
    }

    return out
  }

  /** Rows after applying ALL filters */
  const filteredRows = useMemo(
    () => applyFilters(employeesListData),
    [
      employeesListData,
      search,
      locCodeFilterValues,
      locNameFilterValues,
      zoneFilterValues,
      regionFilterValues,
      clusterFilterValues,
      stateFilterValues,
      openingFilterValues,
      statusFilterValues,
      monthFilterValues,
    ],
  )

  /** Keep total + cards in sync */
  useEffect(() => {
    setTotalCount(filteredRows.length)
    setCards(buildCardData(filteredRows))
  }, [filteredRows])

  /** Dependent options: for each facet, compute unique values from rows filtered by all OTHER facets */
  const facetOptions = useMemo(() => {
    const uniques = (rows, key, map = (x) => x, numeric = false) => {
      const s = new Set()
      for (const r of rows) s.add(map(r?.[key]))
      const arr = Array.from(s).filter((v) => v !== undefined && v !== null)
      return numeric
        ? arr.sort((a, b) => Number(a) - Number(b))
        : arr.sort((a, b) => String(a).localeCompare(String(b)))
    }

    const baseFor = (excludeKey) => applyFilters(employeesListData, { excludeKey })

    const baseOpeningDate = baseFor('openingDate')
    const baseIsActive = baseFor('isActive')
    const baseMonth = baseFor('openingMonth')

    return {
      stCode: uniques(baseFor('stCode'), 'stCode'),
      locationName: uniques(baseFor('locationName'), 'locationName'),
      zoneName: uniques(baseFor('zoneName'), 'zoneName'),
      regionName: uniques(baseFor('regionName'), 'regionName'),
      clusterName: uniques(baseFor('clusterName'), 'clusterName'),
      stateName: uniques(baseFor('stateName'), 'stateName'),
      openingDate: uniques(baseOpeningDate, 'openingDate', normDate),
      isActiveLabels: uniques(baseIsActive, 'isActive').map(statusLabel),
      openingMonthNums: uniques(baseMonth, 'openingMonth', (x) => x, true), // [1..12]
    }
  }, [
    employeesListData,
    search,
    locCodeFilterValues,
    locNameFilterValues,
    zoneFilterValues,
    regionFilterValues,
    clusterFilterValues,
    stateFilterValues,
    openingFilterValues,
    statusFilterValues,
    monthFilterValues,
  ])

  const confirmDelete = async (record) => {
    const response = await deleteLocation({ locationId: record?.locationId })
    if (response?.status === 200) {
      fetchData()
      setSearch('')
    } else {
      message.error(response?.response?.data?.message || 'Error in deleting data')
    }
  }

  const confirmToggle = async (record) => {
    const response = await toggleLocation({ locationId: record?.locationId })
    if (response?.status === 200) {
      fetchData()
      setSearch('')
      message.success(response?.data?.message || 'Updated successfully')
    } else {
      message.error(response?.response?.data?.message || 'Error in toggling data')
    }
  }

  // Export currently visible rows
  const exportToExcel = () => {
    if (!filteredRows || filteredRows.length === 0) {
      message.error('No data available to export')
      return
    }
    const ws = XLSX.utils.json_to_sheet(filteredRows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'LocationData')
    XLSX.writeFile(wb, `LocationData_${new Date().toISOString()}.xlsx`)
    message.success('Exported successfully!')
  }

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const handleSearch = (e) => setSearch(e.target.value)

  const handleClearFilter = () => {
    setLocCodeFilterValues([])
    setLocNameFilterValues([])
    setZoneFilterValues([])
    setRegionFilterValues([])
    setClusterFilterValues([])
    setStateFilterValues([])
    setOpeningFilterValues([])
    setStatusFilterValues([])
    setMonthFilterValues([])
  }

  const desktopColumns = [
    {
      title: 'Location Code',
      dataIndex: 'stCode',
      key: 'stCode',
      ellipsis: true,
      width: 100,
      filteredValue: locCodeFilterValues?.length ? locCodeFilterValues : null,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Location Code"
          dataIndex="stCode"
          dataList={facetOptions.stCode}
          filterValues={locCodeFilterValues}
          setFilterValues={setLocCodeFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Location',
      dataIndex: 'locationName',
      key: 'locationName',
      ellipsis: true,
      width: 120,
      filteredValue: locNameFilterValues?.length ? locNameFilterValues : null,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Location Name"
          dataIndex="locationName"
          dataList={facetOptions.locationName}
          filterValues={locNameFilterValues}
          setFilterValues={setLocNameFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Zone',
      dataIndex: 'zoneName',
      key: 'zoneName',
      width: 80,
      filteredValue: zoneFilterValues?.length ? zoneFilterValues : null,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Zone"
          dataIndex="zoneName"
          dataList={facetOptions.zoneName}
          filterValues={zoneFilterValues}
          setFilterValues={setZoneFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Region',
      dataIndex: 'regionName',
      key: 'regionName',
      width: 100,
      filteredValue: regionFilterValues?.length ? regionFilterValues : null,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Region"
          dataIndex="regionName"
          dataList={facetOptions.regionName}
          filterValues={regionFilterValues}
          setFilterValues={setRegionFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Cluster',
      dataIndex: 'clusterName',
      key: 'clusterName',
      width: 100,
      filteredValue: clusterFilterValues?.length ? clusterFilterValues : null,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Cluster"
          dataIndex="clusterName"
          dataList={facetOptions.clusterName}
          filterValues={clusterFilterValues}
          setFilterValues={setClusterFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'State',
      dataIndex: 'stateName',
      key: 'stateName',
      width: 150,
      filteredValue: stateFilterValues?.length ? stateFilterValues : null,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="State"
          dataIndex="stateName"
          dataList={facetOptions.stateName}
          filterValues={stateFilterValues}
          setFilterValues={setStateFilterValues}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Opening Date',
      dataIndex: 'openingDate',
      key: 'openingDate',
      width: 120,
      render: (date) => (date == null ? null : normDate(date)),
      filteredValue: openingFilterValues?.length ? openingFilterValues : null,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Opening Date"
          dataIndex="openingDate"
          dataList={facetOptions.openingDate}
          filterValues={openingFilterValues}
          setFilterValues={setOpeningFilterValues}
          confirm={confirm}
        />
      ),
    },
    // {
    //   title: 'Opening Month',
    //   dataIndex: 'openingMonth',
    //   key: 'openingMonth',
    //   width: 140,
    //   render: (n) => monthLabel(n),
    //   // show labels in the filter icon state
    //   filteredValue: monthFilterValues?.length ? monthFilterValues.map(monthLabel) : null,
    //   filterDropdown: ({ confirm }) => (
    //     <FilterDropdown
    //       title="Opening Month"
    //       // present month labels from dependent options
    //       dataIndex="openingMonth"
    //       dataList={(facetOptions.openingMonthNums || []).map(monthLabel).filter(Boolean)}
    //       // dropdown holds labels; convert labels -> numbers for filtering
    //       filterValues={monthFilterValues.map(monthLabel).filter(Boolean)}
    //       setFilterValues={(labels) => {
    //         const nums = labels.map(labelToMonth).filter((x) => x != null)
    //         setMonthFilterValues(nums)
    //       }}
    //       confirm={confirm}
    //     />
    //   ),
    // },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (val) => statusLabel(val),
      filteredValue: statusFilterValues?.length ? statusFilterValues.map(statusLabel) : null,
      filterDropdown: ({ confirm }) => (
        <FilterDropdown
          title="Status"
          dataIndex="isActive"
          dataList={facetOptions.isActiveLabels} // dependent list
          filterValues={statusFilterValues.map(statusLabel)}
          setFilterValues={(labels) => setStatusFilterValues(labels.map(labelToBool))}
          confirm={confirm}
        />
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Toggle location"
            description="Are you sure to move this location?"
            onConfirm={() => confirmToggle(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<StepForwardOutlined />} />
          </Popconfirm>

          {/* <Popconfirm
            title="Delete location"
            description="Are you sure to delete this location?"
            onConfirm={() => confirmDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} />
          </Popconfirm> */}
        </Space>
      ),
    },
  ]

  const columns = isMobile ? getMobileColumns() : desktopColumns

  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  return (
    <>
      <Pageheading title="Location Master Uploader" />

      <div style={{ width: '100%' }}>
        <CardInRow data={cards} />
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
          setimportExelModal={setimportExelModal}
          totalRecords={totalCount}
          selectedRowKeys={selectedRowKeys}
          handleSearch={handleSearch}
          lodingLocal={lodingLocal}
          setlodingLocal={setlodingLocal}
          refreshData={fetchData}
          exportToExcel={exportToExcel}
          actionsMap={actionsMap}
          search={search}
          handleClearFilter={handleClearFilter}
        />

        {isMobile ? (
          <Table
            rowKey={(r, i) => r?.storeBudgetId || r?.locationId || `row_${i}`}
            columns={columns}
            dataSource={filteredRows}
            bordered
            size="small"
            pagination={{
              current: currentPage,
              position: ['bottomRight'],
              total: totalCount,
              pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: handleTableChange,
            }}
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
            rowKey="storeBudgetId"
            columns={columns}
            pagination={{
              current: currentPage,
              position: ['bottomRight'],
              total: totalCount,
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: handleTableChange,
            }}
            dataSource={filteredRows}
            bordered
            scroll={{ x: totalWidth, y: 'calc(100vh - 160px)' }}
            style={{ whiteSpace: 'nowrap' }}
            className={theme === 'dark' ? 'dark-theme' : ''}
          />
        )}
      </div>
    </>
  )
}

const TableBulkActionIcons = ({
  setimportExelModal,
  totalRecords,
  selectedRowKeys,
  handleSearch,
  search,
  lodingLocal,
  setlodingLocal,
  refreshData,
  exportToExcel,
  actionsMap,
  handleClearFilter,
}) => {
  const { theme } = useSelector((state) => state.ui)
  const [isEmpUploadVisible, setIsEmpUploadVisible] = useState(false)

  const { useBreakpoint } = Grid
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const [statusSummary, setstatusSummary] = useState([
    {
      name: 'Total Rows',
      label: 'Pending Interview Schedule',
      count: 0,
      color: 'green',
      id: [1, 2, 3, 4, 5],
    },
    { name: 'Selected Rows', label: 'Rejected', count: 0, color: 'blue', id: [7] },
  ])

  useEffect(() => {
    setstatusSummary([
      {
        name: 'Total Rows',
        label: 'Pending Interview Schedule',
        count: totalRecords,
        color: 'green',
        id: [1, 2, 3, 4, 5],
      },
    ])
  }, [selectedRowKeys, totalRecords])

  const downloadStoreDataAsExcel = async ({ isActive, allEmployee, companyId }) => {
    try {
      setlodingLocal(true)
      toast.info('Export is in queue, you will get an alert once the download is completed')
      const { data, status } = await exportEmployeeMaster({ isActive, allEmployee, companyId })
      if (status === 200) {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `Employee_${new Date().toISOString()}.xlsx`
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Export initiated successfully')
      }
    } catch (error) {
      console.error('api eror', error)
      message.error('Export failed')
    } finally {
      setlodingLocal(false)
    }
  }

  return (
    <>
      {isEmpUploadVisible && (
        <LocationCodeUploader
          isVisible={isEmpUploadVisible}
          setIsVisible={setIsEmpUploadVisible}
          refreshData={refreshData}
        />
      )}

      <div
        style={{
          padding: 5,
          display: 'flex',
          justifyContent: 'end',
          alignItems: 'center',
        }}
      >
        <Row>
          <Col>
            <Button onClick={handleClearFilter}>Clear Filters</Button>

            {actionsMap?.upload?.actionStatus && (
              <Tooltip placement="top" title={'Upload Location Master'}>
                <Button style={{ marginLeft: 5 }} onClick={() => setIsEmpUploadVisible(true)}>
                  <UploadOutlined />
                </Button>
              </Tooltip>
            )}

            {actionsMap?.export?.actionStatus && (
              <Tooltip placement="top" title={'Export'}>
                <Button style={{ marginLeft: 5 }} loading={lodingLocal} onClick={exportToExcel}>
                  <ExportOutlined />
                </Button>
              </Tooltip>
            )}
          </Col>

          <Search
            placeholder="Search in table..."
            allowClear
            onChange={handleSearch}
            style={isMobile ? { width: 200, marginLeft: 5 } : { width: 300, marginLeft: 5 }}
            value={search}
          />
        </Row>
      </div>
    </>
  )
}

export default LocationCodeMaster
