import React, { useEffect, useMemo, useState } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, message } from 'antd'
import {
  ExportOutlined,
  PlusOutlined,
  MinusOutlined,
  UploadOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import useMediaQuery from '../hooks/useMediaQuery'

import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { exportEsiMasterToExcel, fetchESICListNew } from '../services/Services'
import Pageheading from '../components/shared/Pageheading'
import { useActionsMap } from '../utils/useActionsMap'
import 'react-toastify/dist/ReactToastify.css'
import ESICUploader from './ESICUploader'
import { downloadAttachment } from '../VendorModule/helpers'

const { Search } = Input

const ESI = () => {
  const [employeesListData, setEmployeesListData] = useState([])

  // ✅ Debounced search
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('') // debounced value used for API

  const [lodingLocal, setlodingLocal] = useState(false)
  const [isEsicLoading, setIsEsicLoading] = useState(false)
  const [isUploaderOpen, setIsUploaderOpen] = useState(false)

  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)
  const { filteredSideMenu } = useSelector((state) => state?.auth || {})
  const actionsMap = useActionsMap(filteredSideMenu)

  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  // ✅ Controlled pagination (server-side)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // ✅ Debounce effect (change delay as you like)
  useEffect(() => {
    const t = setTimeout(() => {
      const v = (searchInput || '').trim()
      setSearch(v)
      // whenever search changes, restart from page 1
      setPagination((p) => ({ ...p, current: 1 }))
    }, 500)

    return () => clearTimeout(t)
  }, [searchInput])

  const handleToggleCard = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const money = (value) => {
    const num = Number(value || 0)
    return num === 0 ? '0' : num.toLocaleString('en-IN')
  }

  const expandedRowRender = (record) => (
    <div style={{ padding: 1, background: '#fafafa', fontSize: 10 }}>
      {/* ... keep your existing expanded UI exactly as-is ... */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 6 }}
      >
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
            Location
          </div>
          <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
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
            Department
          </div>
          <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
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
            Designation
          </div>
          <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
            {record.designationName || '-'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
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
            Loc Code
          </div>
          <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
            {record.stCode || '-'}
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
            Pay Days
          </div>
          <div style={{ fontWeight: 600, fontSize: 10, color: '#1890ff', textAlign: 'center' }}>
            {record.payabledays || 0}
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
            Empr ESIC
          </div>
          <div style={{ fontWeight: 600, fontSize: 10, color: '#52c41a', textAlign: 'center' }}>
            ₹{money(record.emprESIC)}
          </div>
        </div>
      </div>
    </div>
  )

  // ✅ Fetch with pagination + debounced search
  const fetchData = async (pageNumber, pageSize, searchValue) => {
    setIsEsicLoading(true)
    try {
      const res = await fetchESICListNew({ pageNumber, pageSize, search: searchValue })

      // handle both "direct json" and "axios response"
      const payload = res?.data?.status !== undefined ? res.data : res

      if (payload?.status) {
        setEmployeesListData(payload?.data || [])
        setPagination((p) => ({
          ...p,
          current: payload?.pageNumber ?? pageNumber,
          pageSize: payload?.pageSize ?? pageSize,
          total: payload?.totalCount ?? p.total,
        }))
      } else {
        setEmployeesListData([])
        setPagination((p) => ({ ...p, total: 0 }))
      }
    } catch (error) {
      console.error('Error fetching data:', error?.response?.data || error?.message)
      setEmployeesListData([])
    } finally {
      setIsEsicLoading(false)
    }
  }

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize, search)
  }, [pagination.current, pagination.pageSize, search])

  // ✅ Table pagination change handler
  const handleTableChange = (pager) => {
    setPagination((p) => ({
      ...p,
      current: pager.current,
      pageSize: pager.pageSize,
    }))
  }

  // columns ... keep yours
  const mobileColumns = [
    {
      title: 'Code',
      dataIndex: 'ecode',
      width: 50,
      render: (text) => <div style={{ fontSize: 9, fontWeight: 500 }}>{text || '-'}</div>,
    },
    {
      title: 'Name',
      dataIndex: 'fulL_NAME',
      width: 85,
      render: (text) => <div style={{ fontSize: 9, fontWeight: 600 }}>{text || '-'}</div>,
    },
    {
      title: 'Month',
      dataIndex: 'month',
      width: 65,
      render: (text) => (
        <div style={{ fontSize: 9, textAlign: 'center', fontWeight: 500 }}>{text || '-'}</div>
      ),
    },
    {
      title: 'Emp ESIC',
      dataIndex: 'empESIC',
      width: 65,
      render: (value) => (
        <div style={{ fontSize: 9, fontWeight: 600, color: '#1890ff', textAlign: 'center' }}>
          ₹{money(value)}
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 35,
      render: (_, record, index) => {
        const uniqueKey = record.id || record.ecode || `row_${index}`
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

  const desktopColumns = [
    { title: 'E-CODE', dataIndex: 'eCode', key: 'eCode', ellipsis: true, width: 100 },
    { title: 'LOC CODE', dataIndex: 'locCode', key: 'locCode', ellipsis: true, width: 100 },
    {
      title: 'LOCATION',
      dataIndex: 'location',
      key: 'location',
      ellipsis: true,
      width: 120,
    },
    { title: 'EMP NAME', dataIndex: 'empName', key: 'empName', ellipsis: true, width: 170 },
    {
      title: 'DEPARTMENT',
      dataIndex: 'department',
      key: 'department',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'DESIGNATION',
      dataIndex: 'designation',
      key: 'designation',
      ellipsis: true,
      width: 150,
    },
    { title: 'MTH-YEAR', dataIndex: 'monthYear', key: 'monthYear', ellipsis: true, width: 130 },
    {
      title: 'Payable Days',
      dataIndex: 'payableDays',
      key: 'payableDays',
      ellipsis: true,
      width: 120,
    },
    { title: 'Emp ESIC', dataIndex: 'empESIC', key: 'empESIC', ellipsis: true, width: 130 },
    { title: 'Empr ESIC', dataIndex: 'emprESIC', key: 'emprESIC', ellipsis: true, width: 130 },
    {
      title: 'Deposited ESIC',
      dataIndex: 'depositedESIC',
      key: 'depositedESIC',
      ellipsis: true,
      width: 130,
    },
    {
      title: 'Challan No.',
      dataIndex: 'challanNumber',
      key: 'challanNumber',
      ellipsis: true,
      width: 130,
    },
    {
      title: 'Challan No.',
      dataIndex: 'challanNumber',
      key: 'challanNumber',
      ellipsis: true,
      width: 130,
    },
    {
      title: 'Attachment',
      dataIndex: 'challanPdfPath',
      key: 'challanPdfPath',
      render: (challanPdfPath, row) =>
        challanPdfPath ? (
          <Button icon={<DownloadOutlined />} onClick={() => downloadAttachment(row)}></Button>
        ) : (
          '-'
        ),
    },
  ]

  const columns = isMobile ? mobileColumns : desktopColumns
  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  return (
    <>
      <ESICUploader isVisible={isUploaderOpen} setIsVisible={setIsUploaderOpen} />
      <Pageheading title="ESIC" />
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="def" style={{ paddingBottom: 10 }}>
        <TopBar
          totalRecords={pagination.total} // ✅ show total from API
          search={searchInput} // ✅ immediate input value
          onSearchChange={(v) => setSearchInput(v)} // ✅ debounced through effect
          lodingLocal={lodingLocal}
          setlodingLocal={setlodingLocal}
          actionsMap={actionsMap}
          isMobile={isMobile}
          setIsUploaderOpen={setIsUploaderOpen}
        />

        <Table
          rowKey={(r, i) => r?.id || r?.ecode || `row_${i}`}
          loading={isEsicLoading}
          columns={columns}
          dataSource={employeesListData} // ✅ server data only
          bordered
          onChange={handleTableChange} // ✅ pagination callback
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (t, range) => `${range[0]}-${range[1]} of ${t}`,
          }}
          expandable={
            isMobile
              ? {
                  expandedRowKeys: Object.keys(expandedCards).filter((key) => expandedCards[key]),
                  expandedRowRender,
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

const TopBar = ({
  totalRecords,
  search,
  onSearchChange,
  lodingLocal,
  setlodingLocal,
  actionsMap,
  isMobile,
  setIsUploaderOpen,
}) => {
  const { theme } = useSelector((state) => state.ui)

  const exportMasterToExcel = async () => {
    try {
      setlodingLocal(true)
      const { data, status } = await exportEsiMasterToExcel()
      if (status === 200) {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `Esic_${new Date().toISOString()}.xlsx`
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

      <Row gutter={[8, 8]} align="middle">
        <Col xs={24} sm="auto" style={{ display: 'flex', gap: 8 }}>
          {actionsMap?.upload?.actionStatus && (
            <Button icon={<UploadOutlined />} onClick={() => setIsUploaderOpen(true)} />
          )}
          {actionsMap?.export?.actionStatus && (
            <Button loading={lodingLocal} onClick={exportMasterToExcel} icon={<ExportOutlined />} />
          )}

          <Search
            placeholder="Search (debounced)..."
            allowClear
            value={search}
            onChange={(e) => onSearchChange(e.target.value)} // ✅ debounced upstream
            style={{ width: isMobile ? 150 : 300 }}
          />
        </Col>
      </Row>
    </div>
  )
}

export default ESI
