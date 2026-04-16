import { useEffect, useState } from 'react'
import { Space, Table, Row, Input, Button, Col, message, Grid } from 'antd'
import { ExportOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import useMediaQuery from '../hooks/useMediaQuery'

import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { exportLeaveMasterToExcel, fetchLeaveMaster } from '../services/Services'
import { set } from '../redux/uiSlice'
import Pageheading from '../components/shared/Pageheading'
import { useActionsMap } from '../utils/useActionsMap'

const { Search } = Input

const Leave = () => {
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  console.log(
    'filteredData: ',
    filteredData.find((dt) => dt?.ecode === 'V24565'),
  )

  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)
  const [lodingLocal, setlodingLocal] = useState(false)

  const { filteredSideMenu } = useSelector((state) => state?.auth || {})
  const actionsMap = useActionsMap(filteredSideMenu)

  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  const handleToggleCard = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Mobile expanded row - COMPACT: Only closing balances for each leave type
  const expandedRowRender = (record) => (
    <div style={{ padding: 1, background: '#fafafa', fontSize: 11 }}>
      {/* Single row with all closing balances - 3 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <div style={{ background: '#e6f7ff', padding: 6, borderRadius: 4 }}>
          <div
            style={{
              color: '#1890ff',
              fontSize: 9,
              fontWeight: 500,
              marginBottom: 3,
              textAlign: 'center',
            }}
          >
            Comp Off
          </div>
          <div style={{ fontWeight: 600, fontSize: 11, color: '#1890ff', textAlign: 'center' }}>
            {record.compOff_CLS_Leave || 0}
          </div>
        </div>

        <div style={{ background: '#fff7e6', padding: 6, borderRadius: 4 }}>
          <div
            style={{
              color: '#fa8c16',
              fontSize: 9,
              fontWeight: 500,
              marginBottom: 3,
              textAlign: 'center',
            }}
          >
            CL Balance
          </div>
          <div style={{ fontWeight: 600, fontSize: 11, color: '#fa8c16', textAlign: 'center' }}>
            {record.casualLeaveBalance || 0}
          </div>
        </div>

        <div style={{ background: '#f6ffed', padding: 6, borderRadius: 4 }}>
          <div
            style={{
              color: '#52c41a',
              fontSize: 9,
              fontWeight: 500,
              marginBottom: 3,
              textAlign: 'center',
            }}
          >
            EL Balance
          </div>
          <div style={{ fontWeight: 600, fontSize: 11, color: '#52c41a', textAlign: 'center' }}>
            {record.eL_CLS_Leave || 0}
          </div>
        </div>
      </div>
    </div>
  )

  // Mobile columns - MAIN ROW: Code, Name, Month, Total Cls Bal + Expand (5 columns)
  const mobileColumns = [
    {
      title: 'Code',
      dataIndex: 'ecode',
      width: 50,
      render: (text) => (
        <div
          style={{
            fontSize: 9,
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
      title: 'Name',
      dataIndex: 'fulL_NAME',
      width: 85,
      render: (text) => (
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
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
      title: 'Month',
      dataIndex: 'month',
      width: 70,
      render: (text) => (
        <div
          style={{
            fontSize: 9,
            fontWeight: 500,
            textAlign: 'center',
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
      title: 'Total Bal',
      dataIndex: 'ttL_CLS_Leave',
      width: 65,
      render: (value) => (
        <div style={{ fontSize: 10, fontWeight: 600, color: '#52c41a', textAlign: 'center' }}>
          {value || 0}
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 35,
      render: (_, record, index) => {
        const uniqueKey = record.storeBudgetId || record.ecode || `row_${index}`
        return (
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
        )
      },
    },
  ]

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchLeaveMaster()
      console.log('leaves res:', response)
      if (response?.status) {
        const list = response?.data?.data || []
        setTotalCount(list.length)
        setEmployeesListData(list)
      } else {
        setEmployeesListData([])
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Error fetching data:', error?.response?.data || error?.message)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    if (employeesListData.length === 0) fetchData()
  }, [])

  useEffect(() => {
    let new_search = String(search).trim().toLowerCase()

    if (new_search.length > 0) {
      let new_data = employeesListData.filter((dt) =>
        Object.values(dt).some((val) => String(val).toLowerCase().trim().includes(new_search)),
      )
      setFilteredData(new_data)
    } else {
      setFilteredData(employeesListData)
    }
  }, [search, employeesListData])

  const desktopColumns = [
    { title: 'E-CODE', dataIndex: 'ecode', key: 'ecode', ellipsis: true, width: 150 },
    { title: 'LOC CODE', dataIndex: 'stCode', key: 'stCode', ellipsis: true, width: 150 },
    {
      title: 'LOCATION',
      dataIndex: 'locationName',
      key: 'locationName',
      ellipsis: true,
      width: 150,
    },
    { title: 'EMP NAME', dataIndex: 'fulL_NAME', key: 'fulL_NAME', width: 150, ellipsis: true },
    {
      title: 'DEPARTMENT',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'DESIGNATION',
      dataIndex: 'designationName',
      key: 'designationName',
      width: 150,
      ellipsis: true,
    },
    { title: 'MTH-YEAR', dataIndex: 'month', key: 'month', width: 150, ellipsis: true },
    {
      title: 'TTL_OP_BAL',
      dataIndex: 'ttL_OPN_Leave',
      key: 'ttL_OPN_Leave',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'TTL_CLS_BAL',
      dataIndex: 'ttL_CLS_Leave',
      key: 'ttL_CLS_Leave',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'LEAVE_EARNED',
      dataIndex: 'ttL_EARN_Leave',
      key: 'ttL_EARN_Leave',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'LEAVE_AVAILED',
      dataIndex: 'ttL_AVAIL_Leave',
      key: 'ttL_AVAIL_Leave',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'COMP OFF OP BAL',
      dataIndex: 'compOffBalance',
      key: 'compOffBalance',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'COMP OFF CLS BAL',
      dataIndex: 'compOff_CLS_Leave',
      key: 'compOff_CLS_Leave',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'COMP OFF EARNED',
      dataIndex: 'compOffAcquired',
      key: 'compOffAcquired',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'COMP OFF AVAILED',
      dataIndex: 'compOffUsed',
      key: 'compOffUsed',
      width: 150,
      ellipsis: true,
    },
    { title: 'CL OP BAL', dataIndex: 'cL_Opening', key: 'cL_Opening', width: 150, ellipsis: true },
    {
      title: 'CL CLS BAL',
      dataIndex: 'casualLeaveBalance',
      key: 'casualLeaveBalance',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'CL EARNED',
      dataIndex: 'casualLeaveAcquired',
      key: 'casualLeaveAcquired',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'CL AVAILED',
      dataIndex: 'casualLeaveUsed',
      key: 'casualLeaveUsed',
      width: 150,
      ellipsis: true,
    },
    { title: 'EL OP BAL', dataIndex: 'eL_Opening', key: 'eL_Opening', width: 150, ellipsis: true },
    {
      title: 'EL CLS BAL',
      dataIndex: 'eL_CLS_Leave',
      key: 'eL_CLS_Leave',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'EL EARNED',
      dataIndex: 'earnedLeaveAcquired',
      key: 'earnedLeaveAcquired',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'EL AVAILED',
      dataIndex: 'earnedLeaveUsed',
      key: 'earnedLeaveUsed',
      width: 150,
      ellipsis: true,
    },
  ]

  const columns = isMobile ? mobileColumns : desktopColumns
  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  const handleSearch = (e) => setSearch(e.target.value)

  return (
    <>
      <Pageheading title="Leaves" />
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
          actionsMap={actionsMap}
          isMobile={isMobile}
        />

        <Table
          rowKey={(r, i) => r?.storeBudgetId || r?.ecode || `row_${i}`}
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 100 }}
          bordered
          expandable={
            isMobile
              ? {
                  expandedRowKeys: Object.keys(expandedCards).filter((key) => expandedCards[key]),
                  expandedRowRender: expandedRowRender,
                  showExpandColumn: false,
                }
              : undefined
          }
          scroll={isMobile ? { x: 'max-content' } : { x: totalWidth, y: 'calc(100vh - 160px)' }}
          style={{ whiteSpace: 'nowrap' }}
          className={theme === 'dark' ? 'dark-theme' : ''}
          size={isMobile ? 'small' : 'middle'}
          sticky
        />
      </div>
    </>
  )
}

const TableBulkActionIcons = ({
  totalRecords,
  handleSearch,
  search,
  lodingLocal,
  setlodingLocal,
  actionsMap,
  isMobile,
}) => {
  const { theme } = useSelector((state) => state.ui)

  const downloadStoreDataAsExcel = async () => {
    try {
      setlodingLocal(true)
      const { data, status } = await exportLeaveMasterToExcel()
      if (status === 200) {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `Leave_Master_${new Date().toISOString()}.xlsx`
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Export initiated successfully')
      }
    } catch (error) {
      console.error('api error', error)
      message.error('Export failed')
    } finally {
      setlodingLocal(false)
    }
  }

  return (
    <div
      style={{
        padding: 5,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Left: total rows */}
      <Space wrap>
        <div
          style={{
            border: '2px solid #ccc',
            padding: 6,
            borderRadius: 10,
            display: 'flex',
            justifyContent: 'center',
            minWidth: 130,
          }}
          className={theme === 'dark' ? 'dark-theme' : ''}
        >
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
            {totalRecords} Total Rows
          </span>
        </div>
      </Space>

      {/* Right: export + search */}
      <Row gutter={[8, 8]} align="middle">
        <Col xs={24} sm="auto" style={{ display: 'flex', gap: 8 }}>
          {actionsMap?.export?.actionStatus && (
            <Button
              loading={lodingLocal}
              onClick={downloadStoreDataAsExcel}
              icon={<ExportOutlined />}
            >
              {!isMobile && 'Export'}
            </Button>
          )}
          <Search
            placeholder="Search in table..."
            allowClear
            onChange={handleSearch}
            style={{ width: isMobile ? 150 : 300 }}
            value={search}
          />
        </Col>
      </Row>
    </div>
  )
}

export default Leave
