import { useEffect, useState, useCallback } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, message } from 'antd'
import { PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLocationMaster } from '../services/Services'
import { set } from '../redux/uiSlice'
import Pageheading from '../components/shared/Pageheading'

import useMediaQuery from '../hooks/useMediaQuery'

const { Search } = Input

const LocationMasterView = () => {
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFiltereData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)
  const [lodingLocal, setlodingLocal] = useState(false)

  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchLocationMaster()

      if (response.status === 200) {
        setTotalCount(response?.totalRecords)
        setEmployeesListData(response?.data?.data)
      } else {
        setEmployeesListData([])
      }
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message)
      message.error(error?.response?.data?.message || 'Error fetching location master data')
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleToggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const expandedRowRender = (record) => (
    <div style={{ padding: 12, background: '#fafafa', fontSize: 12 }}>
      <Row gutter={[8, 8]}>
        <Col span={6}>
          <div
            style={{
              color: '#666',
              marginBottom: 4,
              fontSize: 10,
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            Zone
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 11,
              textAlign: 'center',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              overflow: 'hidden',
              lineHeight: '1.2',
              minHeight: '20px',
            }}
          >
            {record?.zoneName || '-'}
          </div>
        </Col>
        <Col span={6}>
          <div
            style={{
              color: '#666',
              marginBottom: 4,
              fontSize: 10,
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            Region
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 11,
              textAlign: 'center',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              overflow: 'hidden',
              lineHeight: '1.2',
              minHeight: '20px',
            }}
          >
            {record?.regionName || '-'}
          </div>
        </Col>
        <Col span={6}>
          <div
            style={{
              color: '#666',
              marginBottom: 4,
              fontSize: 10,
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            Cluster
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 11,
              textAlign: 'center',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              overflow: 'hidden',
              lineHeight: '1.2',
              minHeight: '20px',
            }}
          >
            {record?.clusterName || '-'}
          </div>
        </Col>
        <Col span={6}>
          <div
            style={{
              color: '#666',
              marginBottom: 4,
              fontSize: 10,
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            State
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 11,
              textAlign: 'center',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              overflow: 'hidden',
              lineHeight: '1.2',
              minHeight: '20px',
            }}
          >
            {record?.stateName || '-'}
          </div>
        </Col>
      </Row>
    </div>
  )

  const getMobileColumns = () => [
    {
      title: 'Loc-Code',
      dataIndex: 'stCode',
      key: 'stCode',
      width: 80,
      render: (text) => <div style={{ fontSize: 12, fontWeight: 500 }}>{text || '-'}</div>,
    },
    {
      title: 'Location',
      dataIndex: 'locationName',
      key: 'locationName',
      width: 120,
      render: (text) => (
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            wordBreak: 'break-word',
            whiteSpace: 'normal',
            lineHeight: '1.3',
          }}
        >
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 60,
      render: (isActive) => (
        <span
          style={{
            fontSize: 10,
            padding: '2px 6px',
            borderRadius: '4px',
            background: isActive ? '#52c41a' : '#ff4d4f',
            color: 'white',
            fontWeight: 500,
          }}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 40,
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={
            expandedCards[record.stCode] ? (
              <MinusOutlined style={{ fontSize: 12 }} />
            ) : (
              <PlusOutlined style={{ fontSize: 12 }} />
            )
          }
          onClick={(e) => {
            e.stopPropagation()
            handleToggleCard(record.stCode)
          }}
          style={{ padding: '4px' }}
        />
      ),
    },
  ]

  const columns = [
    {
      title: 'Location Code',
      dataIndex: 'stCode',
      key: 'stCode',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Location',
      dataIndex: 'locationName',
      key: 'locationName',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Zone',
      dataIndex: 'zoneName',
      key: 'zoneName',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Region',
      dataIndex: 'regionName',
      key: 'regionName',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Cluster',
      dataIndex: 'clusterName',
      key: 'clusterName',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'State',
      dataIndex: 'stateName',
      key: 'stateName',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      ellipsis: true,
      width: 150,
      render: (isActive) => (isActive ? 'Active' : 'InActive'),
    },
  ]

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  useEffect(() => {
    const s = search.trim().toLowerCase()
    if (s.length === 0) setFiltereData(employeesListData)
    else {
      const filtered = employeesListData.filter((dt) =>
        Object.values(dt).some((d) => String(d).trim().toLowerCase().includes(s)),
      )
      setFiltereData(filtered)
    }
  }, [search, employeesListData])

  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  return (
    <>
      <Pageheading title="Location Master" />
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
          totalRecords={totalCount}
          handleSearch={handleSearch}
          lodingLocal={lodingLocal}
          setlodingLocal={setlodingLocal}
          refreshData={fetchData}
          search={search}
        />
        <Table
          rowKey="stCode"
          columns={isMobile ? getMobileColumns() : columns}
          pagination={{
            current: currentPage,
            position: ['bottomRight'],
            total: totalCount,
            pageSize: pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handleTableChange,
          }}
          dataSource={filteredData}
          bordered={true}
          scroll={isMobile ? undefined : { x: totalWidth, y: 450 }}
          style={{ whiteSpace: 'nowrap' }}
          className={theme === 'dark' ? 'dark-theme' : ''}
          expandable={
            isMobile
              ? {
                  expandedRowKeys: Object.keys(expandedCards).filter((key) => expandedCards[key]),
                  expandedRowRender: expandedRowRender,
                  showExpandColumn: false,
                }
              : undefined
          }
        />
      </div>
    </>
  )
}

const TableBulkActionIcons = ({ totalRecords, handleSearch, search, setlodingLocal }) => {
  const { theme } = useSelector((state) => state.ui)

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
        count: 0,
        color: 'green',
        id: [1, 2, 3, 4, 5],
      },
    ])
  }, [totalRecords])

  return (
    <>
      <div
        style={{
          padding: 5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space>
          {statusSummary.map(({ name, label, count, id }, index) => (
            <div
              key={index}
              style={{
                border: '2px solid #ccc',
                padding: 3,
                borderRadius: 10,
                display: 'flex',
                justifyContent: 'center',
              }}
              onClick={() => {
                filterByStatus(id)
              }}
              className={theme === 'dark' ? 'dark-theme' : ''}
            >
              {name === 'Total Rows' || name === 'Selected Rows' ? (
                <span
                  style={{
                    display: 'inline-block',
                    width: '100%',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    fontSize: 12,
                    padding: '0 8px',
                  }}
                >
                  {count} {name}
                </span>
              ) : (
                <Tooltip placement="top" title={label}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '100%',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      fontSize: 12,
                      padding: '0 8px',
                    }}
                  >
                    {count} {name}
                  </span>
                </Tooltip>
              )}
            </div>
          ))}
        </Space>
        <Row>
          <Search
            placeholder="Search in table..."
            allowClear
            onChange={handleSearch}
            style={{ width: 300, marginLeft: 5 }}
            value={search}
          />
        </Row>
      </div>
    </>
  )
}

export default LocationMasterView
