import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import {
  Space,
  Table,
  Row,
  Col,
  Input,
  Tooltip,
  Button,
  message,
  Grid,
  Card,
  Pagination,
  Typography,
  Checkbox,
} from 'antd'
import { ExportOutlined } from '@ant-design/icons'
import { ToastContainer } from 'react-toastify'
import { fetchGeoFencingData, postGeoFencingdata } from '../../services/Services'
import { useSelector } from 'react-redux'
import { exportExcelFromFrontend } from '../shared/ExportExceFromFrontend'
import { useActionsMap } from '../../utils/useActionsMap'
import Pageheading from '../shared/Pageheading'

const { Search } = Input
const { useBreakpoint } = Grid
const { Text, Title } = Typography

const getRowId = (row = {}) =>
  row.locationId ?? row.LocationId ?? row.id ?? row.key ?? row.locationName

/* ---------------- Latitude/Longitude helpers ---------------- */
const isLatLike = (val) =>
  /^-?\d{0,2}(\.\d{0,15})?$/.test(val) || val === '' || val === '-' || val === '.'
const isLngLike = (val) =>
  /^-?\d{0,3}(\.\d{0,15})?$/.test(val) || val === '' || val === '-' || val === '.'

const clamp = (n, min, max) => (Number.isFinite(n) ? Math.min(Math.max(n, min), max) : n)
const normalizeLatOnBlur = (val) => {
  const n = parseFloat(val)
  if (!Number.isFinite(n)) return ''
  return String(clamp(n, -90, 90))
}
const normalizeLngOnBlur = (val) => {
  const n = parseFloat(val)
  if (!Number.isFinite(n)) return ''
  return String(clamp(n, -180, 180))
}

/* ---------------- Reverse geocoding (OSM / Nominatim) ---------------- */
const reverseGeocode = async (lat, lng) => {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse')
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('lat', String(lat))
    url.searchParams.set('lon', String(lng))
    url.searchParams.set('zoom', '18')
    url.searchParams.set('addressdetails', '1')

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        // (Optional) Identify your app/email per Nominatim usage policy
        // 'User-Agent': 'YourAppName/1.0 (youremail@example.com)'
      },
    })
    if (!res.ok) throw new Error(`Reverse geocode failed: ${res.status}`)
    const json = await res.json()
    return json?.display_name || ''
  } catch (e) {
    console.error('reverseGeocode error:', e)
    return ''
  }
}

// -------------------------------- Main Component --------------------------------
const Geofence = () => {
  const screens = useBreakpoint()
  const isMobile = !screens.md

  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false) // table loader only
  const [savingAll, setSavingAll] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [searchTerm, setSearchTerm] = useState('')
  const [storesList, setStoresList] = useState([])
  const [lodingLocal, setLodingLocal] = useState(false)
  const [locationStatus, setLocationStatus] = useState({})

  const { filteredSideMenu } = useSelector((state) => state?.auth || {})
  const actionsMap = useActionsMap(filteredSideMenu)

  // keep per-row debounce timers for reverse geocode
  const timersRef = useRef({}) // { [rowId]: timeoutId }

  // ---------- Fetch geo-fencing data ----------
  const loadGeoFencingData = async () => {
    try {
      setLoading(true)
      const response = await fetchGeoFencingData()
      if (response?.status && Array.isArray(response?.data)) {
        const mapped = response.data.map((item) => ({
          isGeofenceEnabled: item?.isGeofenceEnabled,
          locationId: item.locationId,
          locationName: item.stCode,
          location: item?.locationName,
          allowedRadius: item.allowedRadiusMeters ?? '',
          longitude: item.storeLong,
          latitude: item.storeLat,
          address: item.address,
        }))
        setStoresList(mapped)
        setFilteredData(mapped)

        const initialStatus = mapped.reduce((acc, it) => {
          acc[it.locationId] = !!it.isGeofenceEnabled
          return acc
        }, {})

        setLocationStatus(initialStatus)
      } else {
        message.info('No geofence data found')
        setStoresList([])
        setFilteredData([])
      }
    } catch (error) {
      console.error('GeoFencing API error:', error)
      message.error('Failed to load geo-fencing data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGeoFencingData()
  }, [])

  // ---------- Search filter ----------
  useEffect(() => {
    const q = String(searchTerm).trim().toLowerCase()
    if (!q) {
      setFilteredData(storesList)
      setCurrentPage(1)
      return
    }
    const filtered = (storesList || []).filter((item) =>
      Object.values(item || {}).some((value) =>
        String(value ?? '')
          .trim()
          .toLowerCase()
          .includes(q),
      ),
    )
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, storesList])

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  // ---------- Unified row updater (updates both lists) ----------
  const saveRowValues = useCallback((id, patch) => {
    setStoresList((prev) => (prev || []).map((r) => (getRowId(r) === id ? { ...r, ...patch } : r)))
    setFilteredData((prev) =>
      (prev || []).map((r) => (getRowId(r) === id ? { ...r, ...patch } : r)),
    )
  }, [])

  // Schedule (debounced) reverse geocoding when both lat/lng are valid numeric strings
  const scheduleReverse = useCallback(
    (id, latStr, lngStr, immediate = false) => {
      const lat = parseFloat(latStr)
      const lng = parseFloat(lngStr)
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

      // Clear any existing timer for this row
      if (timersRef.current[id]) {
        clearTimeout(timersRef.current[id])
      }

      const run = async () => {
        const addr = await reverseGeocode(lat, lng)
        if (addr) {
          saveRowValues(id, { address: addr })
        }
      }

      if (immediate) {
        run()
      } else {
        timersRef.current[id] = setTimeout(run, 600)
      }
    },
    [saveRowValues],
  )

  // ---------- Save Row ----------
  const handleSaveRow = async (record) => {
    try {
      const payload = {
        locationId: record.locationId,
        stCode: record.locationName,
        allowedRadiusMeters: parseInt(record.allowedRadius, 10) || null,
        storeLong: record.longitude,
        storeLat: record.latitude,
        address: record.address,
        isGeofenceEnabled: locationStatus[record?.locationId],
      }

      const res = await postGeoFencingdata(payload)
      if (res?.status) {
        message.success(res?.message || 'Location saved successfully')
        loadGeoFencingData()
      } else {
        message.error(res?.message || 'Failed to save row')
      }
    } catch (err) {
      console.error('Error saving row:', err)
      message.error('Error saving row')
    }
  }

  // ---------- Save All ----------
  const handleSaveAll = async () => {
    const rows = storesList || []
    if (!rows.length) {
      message.info('Nothing to save.')
      return
    }

    try {
      setSavingAll(true)
      let okCount = 0
      for (const row of rows) {
        const payload = {
          locationId: row.locationId,
          stCode: row.locationName,
          allowedRadiusMeters: parseInt(row.allowedRadius, 10) || null,
          storeLong: row.longitude,
          storeLat: row.latitude,
          address: row.address,
        }
        const res = await postGeoFencingdata(payload)
        if (res?.status) okCount++
      }
      if (okCount) {
        message.success(`Saved ${okCount} locations`)
        loadGeoFencingData()
      } else {
        message.error('Failed to save locations')
      }
    } catch (err) {
      console.error('Error saving all:', err)
      message.error('Failed to save locations')
    } finally {
      setSavingAll(false)
    }
  }

  // ---------- Columns ----------
  const columns = useMemo(
    () => [
      {
        title: 'Status',
        dataIndex: 'isGeofenceEnabled',
        key: 'isGeofenceEnabled',
        width: 80,
        render: (_, record) => {
          let id = record?.locationId
          return (
            <Checkbox
              checked={!!locationStatus[id]}
              onChange={(e) =>
                setLocationStatus((prev) => ({
                  ...prev,
                  [id]: e.target.checked,
                }))
              }
            />
          )
        },
      },
      {
        title: 'Location Name',
        dataIndex: 'location',
        key: 'location',
        width: 140,
      },
      {
        title: 'Location',
        dataIndex: 'locationName',
        key: 'locationName',
        width: 100,
      },
      {
        title: 'Allowed Radius (m)',
        dataIndex: 'allowedRadius',
        key: 'allowedRadius',
        width: 160,
        render: (_, record) => {
          const id = getRowId(record)
          return (
            <Input
              value={record.allowedRadius ?? ''}
              placeholder="e.g. 500"
              inputMode="numeric"
              onChange={(e) => saveRowValues(id, { allowedRadius: e.target.value })}
            />
          )
        },
      },
      {
        title: 'Latitude',
        dataIndex: 'latitude',
        key: 'latitude',
        width: 170,
        render: (_, record) => {
          const id = getRowId(record)
          const value = record.latitude ?? ''
          return (
            <Tooltip title="Enter latitude (-90 to 90)">
              <Input
                value={value}
                placeholder="e.g. 28.6139"
                inputMode="decimal"
                onChange={(e) => {
                  const v = e.target.value
                  if (!isLatLike(v)) return // let user type partials, but block illegal chars
                  saveRowValues(id, { latitude: v })
                  const lngStr = (record.longitude ?? '').toString()
                  if (isLngLike(lngStr) && v && lngStr && v !== '-' && v !== '.') {
                    scheduleReverse(id, v, lngStr, false) // debounce
                  }
                }}
                onBlur={(e) => {
                  const fixed = normalizeLatOnBlur(e.target.value)
                  saveRowValues(id, { latitude: fixed })
                  const lngStr = (record.longitude ?? '').toString()
                  if (fixed && lngStr) scheduleReverse(id, fixed, lngStr, true) // immediate
                }}
              />
            </Tooltip>
          )
        },
      },
      {
        title: 'Longitude',
        dataIndex: 'longitude',
        key: 'longitude',
        width: 170,
        render: (_, record) => {
          const id = getRowId(record)
          const value = record.longitude ?? ''
          return (
            <Tooltip title="Enter longitude (-180 to 180)">
              <Input
                value={value}
                placeholder="e.g. 77.2090"
                inputMode="decimal"
                onChange={(e) => {
                  const v = e.target.value
                  if (!isLngLike(v)) return
                  saveRowValues(id, { longitude: v })
                  const latStr = (record.latitude ?? '').toString()
                  if (isLatLike(latStr) && latStr && v && v !== '-' && v !== '.') {
                    scheduleReverse(id, latStr, v, false)
                  }
                }}
                onBlur={(e) => {
                  const fixed = normalizeLngOnBlur(e.target.value)
                  saveRowValues(id, { longitude: fixed })
                  const latStr = (record.latitude ?? '').toString()
                  if (fixed && latStr) scheduleReverse(id, latStr, fixed, true)
                }}
              />
            </Tooltip>
          )
        },
      },
      {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        width: 420,
        render: (_, record) => {
          const id = getRowId(record)
          return (
            <Input
              value={record.address ?? ''}
              placeholder="Auto-filled from lat/lng (editable)"
              onChange={(e) => saveRowValues(id, { address: e.target.value })}
            />
          )
        },
      },
      {
        title: 'Save',
        key: 'save',
        fixed: 'right',
        width: 100,
        render: (_, record) => (
          <Button type="primary" onClick={() => handleSaveRow(record)}>
            Save
          </Button>
        ),
      },
    ],
    [saveRowValues, scheduleReverse, locationStatus],
  )

  const handleSearchChange = (e) => setSearchTerm(e.target.value)

  // ---------- Export Excel ----------
  const downloadExcel = () => {
    const cols = [
      { header: 'Location', key: 'locationName' },
      { header: 'Allowed Radius', key: 'allowedRadius' },
      { header: 'Latitude', key: 'latitude' },
      { header: 'Longitude', key: 'longitude' },
      { header: 'Address', key: 'address' },
    ]
    try {
      setLodingLocal(true)
      const response = exportExcelFromFrontend(cols, filteredData)
      if (response.success) message.success(response.message)
      else message.error(response.message)
    } catch (error) {
      message.error(error?.message || 'Some error occurred')
    } finally {
      setLodingLocal(false)
    }
  }

  // ---------- Pagination (Mobile) ----------
  const startIdx = (currentPage - 1) * pageSize
  const endIdx = startIdx + pageSize
  const mobilePageData = (filteredData || []).slice(startIdx, endIdx)

  return (
    <>
      <ToastContainer position="top-right" autoClose={1000} hideProgressBar />

      <div className="def" style={{ paddingBottom: 10 }}>
        {/* Heading */}
        <Space
          style={{
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Pageheading
            title="GeoFence"
            fontSize={isMobile ? '1.4rem' : '1.8rem'}
            marginBottom="0px"
            marginTop="0"
          />
          <Search
            placeholder="Search in table..."
            allowClear
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ width: isMobile ? '100%' : 300 }}
          />
        </Space>

        {/* Toolbar */}
        <Row gutter={[10, 10]} justify="space-between" align="middle" style={{ padding: 5 }}>
          <Col
            xs={24}
            md="auto"
            style={{ order: isMobile ? 2 : 1, width: isMobile ? '100%' : 'auto' }}
          ></Col>

          {actionsMap?.export?.actionStatus && (
            <Col xs={24} md="auto" style={{ order: isMobile ? 1 : 2, textAlign: 'right' }}>
              <Tooltip title="Export">
                <Button
                  loading={lodingLocal}
                  onClick={downloadExcel}
                  icon={<ExportOutlined />}
                  block={isMobile}
                >
                  {!isMobile ? 'Export' : null}
                </Button>
              </Tooltip>
            </Col>
          )}
        </Row>

        {/* Table / Mobile view */}
        {!isMobile ? (
          <Table
            rowKey={(r, i) => getRowId(r) ?? i}
            columns={columns}
            dataSource={filteredData}
            bordered
            loading={loading}
            pagination={{
              current: currentPage,
              total: filteredData.length,
              pageSize,
              showSizeChanger: true,
              onChange: handleTableChange,
              position: ['bottomRight'],
            }}
            scroll={{ y: 'calc(100vh - 120px)', x: 'max-content' }}
            size="middle"
          />
        ) : loading ? (
          <Card size="small" style={{ textAlign: 'center' }}>
            Loading...
          </Card>
        ) : (
          <>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {mobilePageData.length > 0 ? (
                mobilePageData.map((item) => {
                  const id = getRowId(item)
                  return (
                    <Card key={id} size="small" bodyStyle={{ padding: 12 }}>
                      <Row gutter={[8, 8]}>
                        <Col span={24}>
                          <Text type="secondary">Location</Text>
                          <div style={{ fontWeight: 600 }}>{item.locationName}</div>
                        </Col>
                        <Col span={24}>
                          <Text type="secondary">Allowed Radius</Text>
                          <Input
                            value={item.allowedRadius ?? ''}
                            onChange={(e) => saveRowValues(id, { allowedRadius: e.target.value })}
                          />
                        </Col>
                        <Col span={24}>
                          <Text type="secondary">Latitude</Text>
                          <Input
                            value={item.latitude ?? ''}
                            onChange={(e) => {
                              const v = e.target.value
                              if (!isLatLike(v)) return
                              saveRowValues(id, { latitude: v })
                              const lngStr = (item.longitude ?? '').toString()
                              if (isLngLike(lngStr) && v && lngStr && v !== '-' && v !== '.') {
                                scheduleReverse(id, v, lngStr, false)
                              }
                            }}
                            onBlur={(e) => {
                              const fixed = normalizeLatOnBlur(e.target.value)
                              saveRowValues(id, { latitude: fixed })
                              const lngStr = (item.longitude ?? '').toString()
                              if (fixed && lngStr) scheduleReverse(id, fixed, lngStr, true)
                            }}
                          />
                        </Col>
                        <Col span={24}>
                          <Text type="secondary">Longitude</Text>
                          <Input
                            value={item.longitude ?? ''}
                            onChange={(e) => {
                              const v = e.target.value
                              if (!isLngLike(v)) return
                              saveRowValues(id, { longitude: v })
                              const latStr = (item.latitude ?? '').toString()
                              if (isLatLike(latStr) && latStr && v && v !== '-' && v !== '.') {
                                scheduleReverse(id, latStr, v, false)
                              }
                            }}
                            onBlur={(e) => {
                              const fixed = normalizeLngOnBlur(e.target.value)
                              saveRowValues(id, { longitude: fixed })
                              const latStr = (item.latitude ?? '').toString()
                              if (fixed && latStr) scheduleReverse(id, latStr, fixed, true)
                            }}
                          />
                        </Col>
                        <Col span={24}>
                          <Text type="secondary">Address</Text>
                          <Input
                            value={item.address ?? ''}
                            onChange={(e) => saveRowValues(id, { address: e.target.value })}
                            placeholder="Auto-filled from lat/lng (editable)"
                          />
                        </Col>
                        <Col span={24}>
                          <Button type="primary" block onClick={() => handleSaveRow(item)}>
                            Save
                          </Button>
                        </Col>
                      </Row>
                    </Card>
                  )
                })
              ) : (
                <Card size="small" style={{ textAlign: 'center' }}>
                  No Data
                </Card>
              )}
            </Space>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <Pagination
                current={currentPage}
                total={filteredData.length}
                pageSize={pageSize}
                showSizeChanger
                onChange={handleTableChange}
                size="small"
              />
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default Geofence
