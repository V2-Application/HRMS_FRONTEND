import { useEffect, useMemo, useState } from 'react'
import './employeechangelog.css'
import groupByColumn from './helpers/groupByColumn'
import { getEmployeeChangeLog, searchEmployeeDropdown } from '../../services/Services'
import {
  message,
  Space,
  Typography,
  Input,
  Select,
  Spin,
  Alert,
  Empty,
  Layout,
  Tag,
  List,
  Segmented,
  Button,
  Timeline,
  Card,
  Modal,
  Grid,
} from 'antd'
import SideBySideDiff from './helpers/SidebySideDiff'
import getVersionTagColor from './helpers/getVersionTagColor'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select
const { Sider, Content } = Layout
const { useBreakpoint } = Grid

const EmployeeChangeLog = () => {
  const [empCodeInput, setEmpCodeInput] = useState('')
  const [empCode, setEmpCode] = useState('')
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [columnFilter, setColumnFilter] = useState('')
  const [userFilter, setUserFilter] = useState(undefined)
  const [sortOrder, setSortOrder] = useState('desc') // latest -> oldest
  const [searchText, setSearchText] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [employees, setEmployees] = useState([])
  const screens = useBreakpoint()
  const isMobile = !screens.md // true for xs + sm (< 768px by default)
  const isTabletOrDown = !screens.lg // true for < 992px

  // compare modal state
  const [compareOpen, setCompareOpen] = useState(false)
  const [compareA, setCompareA] = useState(null)
  const [compareB, setCompareB] = useState(null)

  const hasData = entries && entries.length > 0

  useEffect(() => {
    if (searchText.length >= 2) {
      setSearchLoading(true)
      const debounceTimer = setTimeout(() => {
        const fetchData = async () => {
          try {
            const res = await searchEmployeeDropdown(searchText)
            // console.log('emp api res: ', res)
            if (res?.data?.employees?.length > 0) {
              setEmployees(res.data.employees)
            } else {
              setEmployees([])
            }
          } catch (error) {
            console.error('Error fetching employee attendance:', error)
            setEmployees([])
          } finally {
            setSearchLoading(false)
          }
        }

        fetchData()
      }, 800)

      return () => clearTimeout(debounceTimer)
    }
  }, [searchText])

  const grouped = useMemo(() => groupByColumn(entries), [entries])
  const allColumns = useMemo(() => Object.keys(grouped), [grouped])

  const filteredColumns = useMemo(() => {
    if (!columnFilter) return allColumns

    const q = columnFilter.toLowerCase()
    return allColumns.filter((c) => c.toLowerCase().includes(q))
  }, [allColumns, columnFilter])

  const allUsers = useMemo(() => {
    const set = new Set()
    entries.forEach((e) => {
      if (e?.changedBy) set.add(e.changedBy)
    })

    return Array.from(set)
  }, [entries])

  const selectedVersions = useMemo(() => {
    if (!selectedColumn) return []

    let versions = grouped[selectedColumn] || []

    if (userFilter) {
      versions = versions.filter((v) => v?.changedBy === userFilter)
    }

    const sorted = [...versions].sort((a, b) => {
      const da = new Date(a?.changedOn).getTime()
      const db = new Date(b?.changedOn).getTime()
      return sortOrder === 'desc' ? db - da : da - db
    })

    return sorted
  }, [grouped, selectedColumn, userFilter, sortOrder])

  const handleSearch = async (value = '') => {
    const trimmed = value.trim()
    if (!trimmed) return

    setErrMsg('')
    setLoading(true)
    setSelectedColumn(null)
    setUserFilter(undefined)
    setColumnFilter('')
    setEntries([])
    setSortOrder('desc')

    try {
      setLoading(true)

      const response = await getEmployeeChangeLog(trimmed)

      if (response.status === 200) {
        const data = response.data?.data || []
        setEntries(data)
        setEmpCode(trimmed)

        if (data?.length > 0) {
          setSelectedColumn(data[0]?.columnName)
        } else {
          setSelectedColumn(null)
        }
      }
    } catch (error) {
      console.error(`Error fetching employee change log data: ${error}`)

      const apiErr = error?.response?.data?.message || 'Error fetching employee change log data'
      message.error(apiErr)
      setErrMsg(apiErr)
    } finally {
      setLoading(false)
    }
  }

  const openCompareModal = () => {
    if (!selectedColumn) return

    const versions = grouped[selectedColumn] || []
    if (versions?.length < 2) return

    // default: latest & previous based on current sort
    const sorted = [...versions].sort((a, b) => {
      const da = new Date(a?.changedOn).getDate()
      const db = new Date(b?.changedOn).getDate()
      return db - da
    })

    setCompareA(sorted[0])
    setCompareB(sorted[1])
    setCompareOpen(true)
  }

  const renderCompareOptions = () => {
    const versions = grouped[selectedColumn] || []
    const sorted = [...versions].sort((a, b) => {
      const da = new Date(a?.changedOn).getDate()
      const db = new Date(b?.changedOn).getDate()
      return db - da
    })

    return sorted.map((v, i) => {
      const label = `${v?.versionLabel} • ${v?.changedBy} • ${new Date(v?.changedOn).toLocaleString()}`
      return (
        <Option key={i} value={i}>
          {label}
        </Option>
      )
    })
  }

  const getVersionByIndex = (idx) => {
    const versions = grouped[selectedColumn] || []
    const sorted = [...versions].sort((a, b) => {
      const da = new Date(a?.changedOn).getTime()
      const db = new Date(b?.changedOn).getTime()
      return db - da
    })

    return sorted[idx]
  }

  const compareBody =
    compareA && compareB ? (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <div>
          <Text strong>{compareA?.versionLabel}</Text>
          <div>
            <Text type="secondary">{compareA?.changedBy}</Text>
          </div>

          <div>
            <Text type="secondary">{new Date(compareA?.changedOn).toLocaleString()}</Text>
          </div>

          <SideBySideDiff oldValue={compareA?.oldValue} newValue={compareA?.newValue} />
        </div>

        <div>
          <Text strong>{compareB?.versionLabel}</Text>

          <div>
            <Text type="secondary">{compareB?.changedBy}</Text>
          </div>

          <div>
            <Text type="secondary">{new Date(compareB?.changedOn).toLocaleString()}</Text>
          </div>

          <SideBySideDiff oldValue={compareB?.oldValue} newValue={compareB?.newValue} />
        </div>
      </div>
    ) : (
      <Text type="Secondary">Select two versions to compare them side by side</Text>
    )

  return (
    <div
      className="employee-changelog-page"
      style={{ padding: 24, height: '100%', boxSizing: 'border-box' }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={'large'}>
        {/* header + ecode input */}
        <div
          className="employee-changelog-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>
              Employee Change Log
            </Title>

            <Text type="secondary">
              Type an employee code to inspect who changed what &amp; when.
            </Text>
          </div>

          <div
            className="employee-changelog-search"
            style={{
              minWidth: 260,
              flex: 1,
              maxWidth: 360,
              display: 'flex',
              justifyContent: 'end',
            }}
          >
            <Select
              style={{ width: '15rem' }}
              onSearch={setSearchText}
              notFoundContent={searchLoading ? <Spin size="small" /> : 'No employees found'}
              showSearch
              allowClear
              filterOption={false}
              placeholder="Search employee"
              onChange={(value) => {
                if (!value) {
                  // cleared
                  setEmpCodeInput('')
                  setEmpCode('')
                  setEntries([])
                  setEmployees([])
                  return
                }

                // keep input in sync (optional)
                setEmpCodeInput(value)

                // reuse the same logic as the Search input
                handleSearch(value)
              }}
            >
              {employees?.length > 0
                ? employees.map((e) => (
                    <Select.Option key={e.ecode} value={e.ecode}>
                      {e.ecode} - {e.fullName}
                    </Select.Option>
                  ))
                : -(<Select.Option>No Employee Found</Select.Option>) +
                  (
                    <Select.Option disabled key="no-emp">
                      No Employee Found
                    </Select.Option>
                  )}
            </Select>

            {/* <Search
              placeholder="Enter employee code"
              allowClear
              enterButton="Load"
              value={empCodeInput}
              onChange={(e) => setEmpCodeInput(e.target.value)}
              onSearch={handleSearch}
            /> */}
          </div>
        </div>

        {/* loading / error */}
        {loading && (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Spin size="large" />
          </div>
        )}

        {!loading && errMsg && <Alert type="error" message={errMsg} showIcon />}

        {!loading && !errMsg && !hasData && empCode && (
          <Empty
            description={
              <span>
                No change log found for <Text code>{empCode}</Text>
              </span>
            }
          />
        )}

        {/* main layout */}
        {!loading && !errMsg && hasData && (
          <Layout
            className="employee-changelog-layout"
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
              minHeight: 480,
              flexDirection: isTabletOrDown ? 'column' : 'row',
            }}
          >
            <Sider
              className="employee-changelog-sider"
              width={isTabletOrDown ? '100%' : 300}
              style={{
                background: '#fff',
                // borderRadius: '1px solid #f0f0f0',
                padding: 16,
                borderRight: isTabletOrDown ? 'none' : '1px solid #f0f0f0',
                borderBottom: isTabletOrDown ? '1px solid #f0f0f0' : 'none',
                flex: isTabletOrDown ? '0 0 auto' : '0 0 300px',
                maxWidth: isTabletOrDown ? '100%' : 300,
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">Employee Code</Text>

                  <div>
                    <Tag color="blue" style={{ marginTop: 4 }}>
                      {empCode}
                    </Tag>

                    <Tag style={{ marginTop: 4 }}>
                      {entries.length} change record
                      {entries.length !== 1 ? 's' : ''}
                    </Tag>
                  </div>
                </div>

                <Input
                  placeholder="Filter fields (column names)"
                  allowClear
                  value={columnFilter}
                  onChange={(e) => setColumnFilter(e.target.value)}
                />

                <div
                  style={{
                    maxHeight: isMobile ? '25vh' : isTabletOrDown ? '40vh' : '70vh',
                    overflow: 'auto',
                    marginTop: 4,
                    paddingRight: 4,
                  }}
                >
                  <List
                    size="small"
                    dataSource={filteredColumns}
                    locale={{
                      emptyText: 'No columns match the filter',
                    }}
                    renderItem={(columnName) => {
                      const versionCount = grouped[columnName]?.length || 0
                      const isSelected = selectedColumn === columnName

                      return (
                        <List.Item
                          style={{
                            cursor: 'pointer',
                            borderRadius: 8,
                            padding: '8px 10px',
                            background: isSelected ? '#e6f4ff' : undefined,
                            transition: 'background 0.15s ease',
                          }}
                          onClick={() => setSelectedColumn(columnName)}
                        >
                          <div style={{ width: '100%' }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <Text
                                strong={isSelected}
                                style={{
                                  maxWidth: '75%',
                                  whiteSpace: 'nowrap',
                                  textOverflow: 'ellipsis',
                                  overflow: 'hidden',
                                }}
                              >
                                {columnName}
                              </Text>

                              <Tag
                                color={isSelected ? 'blue' : 'default'}
                                style={{ marginLeft: 0 }}
                              >
                                {versionCount} version
                                {versionCount !== 1 ? 's' : ''}
                              </Tag>
                            </div>
                          </div>
                        </List.Item>
                      )
                    }}
                  />
                </div>
              </Space>
            </Sider>

            <Content
              className="employee-changelog-content"
              style={{
                background: '#fafafa',
                padding: 16,
                width: '100%',
              }}
            >
              {selectedColumn ? (
                <Space direction="vertical" size={'large'} style={{ width: '100%' }}>
                  {/* column header + filters + sort + compare button */}
                  <div
                    className="employee-changelog-toolbar"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 16,
                      flexWrap: 'wrap',
                      flexDirection: isTabletOrDown ? 'column' : 'row',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <Title level={4} style={{ marginBottom: 0 }}>
                        {selectedColumn}
                      </Title>

                      <Text type="secondary">
                        Showing history for this field ({selectedVersions.length} version{' '}
                        {selectedVersions.length !== 1 ? 's' : ''} after filters)
                      </Text>

                      <div style={{ marginTop: 0 }}>
                        <Segmented
                          size="small"
                          value={sortOrder}
                          onChange={(val) => setSortOrder(val)}
                          options={[
                            {
                              label: 'Latest -> Oldest',
                              value: 'desc',
                            },
                            {
                              label: 'Oldest -> Latest',
                              value: 'asc',
                            },
                          ]}
                        />
                      </div>
                    </div>

                    <Space
                      direction="vertical"
                      size={'small'}
                      style={{
                        minWidth: 220,
                        width: isTabletOrDown ? '100%' : 260,
                        maxWidth: 320,
                      }}
                    >
                      <div>
                        <Text type="secondary">Filter by user</Text>

                        <Select
                          style={{ width: '100%', marginTop: 4 }}
                          allowClear
                          showSearch
                          placeholder="All users"
                          value={userFilter}
                          onChange={(val) => setUserFilter(val)}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                        >
                          {allUsers.map((u) => (
                            <Option key={u} value={u}>
                              {u}
                            </Option>
                          ))}
                        </Select>
                      </div>

                      {/* <Button
                        size="small"
                        type="default"
                        onClick={openCompareModal}
                        disabled={!selectedColumn || (grouped[selectedColumn] || []).length < 2}
                      >
                        Compare versions
                      </Button> */}
                    </Space>
                  </div>

                  {/* timeline */}
                  {selectedVersions.length === 0 ? (
                    <Empty description="No versions for this field (after filters)" />
                  ) : (
                    <div
                      className="timeline-scroll-wrapper"
                      style={{
                        // maxHeight: '70vh',
                        maxHeight: isTabletOrDown ? 'none' : '70vh',
                        overflow: 'auto',
                        // paddingRight: 20,
                        paddingTop: 10,
                      }}
                    >
                      <Timeline mode="right">
                        {selectedVersions.map((v, index) => {
                          const isLatest = v?.versionLabel === 'vLatest'
                          const isChanged = v?.oldValue !== v?.newValue
                          const formattedDate = new Date(v?.changedOn).toLocaleString()
                          const formattedDateMob = v?.changedOn?.split('T')[0]

                          return (
                            <Timeline.Item
                              key={`${v?.versionLabel}-${v?.changedOn}-${index}`}
                              color={isLatest ? 'green' : isChanged ? 'blue' : 'gray'}
                              label={
                                !isMobile ? (
                                  <Text type="secondary">{formattedDate}</Text>
                                ) : (
                                  formattedDateMob
                                )
                              }
                            >
                              <Card
                                size="small"
                                style={{
                                  borderRadius: 10,
                                  borderColor: isLatest ? '#52c41a' : undefined,
                                }}
                              >
                                <Space
                                  direction="vertical"
                                  style={{ width: '100%' }}
                                  size={'small'}
                                >
                                  <Space
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                    }}
                                  >
                                    <Space size={'small'} wrap>
                                      <Tag color={getVersionTagColor(v?.versionLabel, isLatest)}>
                                        {v?.versionLabel}
                                      </Tag>

                                      <Tag>{v?.changedBy}</Tag>

                                      {!isChanged && <Tag color="default">no value change</Tag>}
                                    </Space>
                                  </Space>

                                  {/* side by side diff */}
                                  <SideBySideDiff oldValue={v?.oldValue} newValue={v?.newValue} />
                                </Space>
                              </Card>
                            </Timeline.Item>
                          )
                        })}
                      </Timeline>
                    </div>
                  )}
                </Space>
              ) : (
                <Empty description="Select a field from the left to see history" />
              )}
            </Content>
          </Layout>
        )}

        {/* compare versions modal */}
        <Modal
          title={`Compare versions – ${selectedColumn || ''}`}
          open={compareOpen}
          onCancel={() => setCompareOpen(false)}
          footer={[
            <Button key="close" onClick={() => setCompareOpen(false)}>
              Close
            </Button>,
          ]}
          width={900}
        >
          {selectedColumn && (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space style={{ width: '100%' }}>
                <div style={{ flex: 1 }}>
                  <Text type="secondary">Version A</Text>
                  <Select
                    style={{ width: '100%', marginTop: 4 }}
                    value={compareA ? (grouped[selectedColumn] || []).indexOf(compareA) : undefined}
                    onChange={(idx) => setCompareA(getVersionByIndex(idx))}
                  >
                    {renderCompareOptions()}
                  </Select>
                </div>
                <div style={{ flex: 1 }}>
                  <Text type="secondary">Version B</Text>
                  <Select
                    style={{ width: '100%', marginTop: 4 }}
                    value={compareB ? (grouped[selectedColumn] || []).indexOf(compareB) : undefined}
                    onChange={(idx) => setCompareB(getVersionByIndex(idx))}
                  >
                    {renderCompareOptions()}
                  </Select>
                </div>
              </Space>

              {compareBody}
            </Space>
          )}
        </Modal>
      </Space>
    </div>
  )
}

export default EmployeeChangeLog
