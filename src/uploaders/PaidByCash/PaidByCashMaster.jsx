import React, { useEffect, useMemo, useState } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, Grid } from 'antd'
import { ExportOutlined, UploadOutlined } from '@ant-design/icons'
import { ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPaidByCashMaster } from '../../services/Services'
import { set } from '../../redux/uiSlice'
import PaidByCashUploader from './PaidByCashUploader'
import Pageheading from '../../components/shared/Pageheading'
import { useActionsMap } from '../../utils/useActionsMap'
import useMediaQuery from '../../hooks/useMediaQuery'
import 'react-toastify/dist/ReactToastify.css'

const { Search } = Input
const { useBreakpoint } = Grid

const PaidbyCashMaster = () => {
  const screens = useBreakpoint()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)
  const { filteredSideMenu } = useSelector((state) => state?.auth)
  const actionsMap = useActionsMap(filteredSideMenu)

  const [employeesListData, setEmployeesListData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchPaidByCashMaster({
        pageNumber: currentPage,
        pageSize,
        searchTerm: debouncedSearch,
      })

      if (response?.status === 200) {
        setTotalCount(response?.data?.totalRecords ?? 0)
        setEmployeesListData(response?.data?.records ?? [])
      } else {
        setTotalCount(0)
        setEmployeesListData([])
      }
    } catch (error) {
      console.error('Paid By Cash fetch error:', error?.response?.data || error?.message || error)
      setTotalCount(0)
      setEmployeesListData([])
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, debouncedSearch])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(t)
  }, [search])

  // ✅ Desktop columns
  const desktopColumns = useMemo(
    () => [
      {
        title: 'Emp Code',
        dataIndex: 'eCode',
        key: 'eCode',
        ellipsis: true,
        width: 160,
      },
      {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        width: 140,
      },
      {
        title: 'Month',
        dataIndex: 'month',
        key: 'month',
        width: 140,
      },
      {
        title: 'Location',
        dataIndex: 'location',
        key: 'location',
        width: 180,
      },
    ],
    [],
  )

  // ✅ Mobile columns (compact)
  const mobileColumns = useMemo(
    () => [
      {
        title: 'E-Code',
        dataIndex: 'eCode',
        width: 70,
        render: (text) => <div style={{ fontSize: 12, fontWeight: 500 }}>{text || '-'}</div>,
      },
      {
        title: 'Amount',
        dataIndex: 'amount',
        width: 80,
        render: (amount) => (
          <div style={{ fontSize: 12, fontWeight: 600, color: '#52c41a' }}>
            ₹{Number(amount || 0).toLocaleString()}
          </div>
        ),
      },
      {
        title: 'Month',
        dataIndex: 'month',
        width: 80,
        render: (text) => <div style={{ fontSize: 12, fontWeight: 500 }}>{text || '-'}</div>,
      },
      {
        title: 'Location',
        dataIndex: 'location',
        width: 120,
        render: (text) => (
          <div
            style={{
              fontSize: 12,
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
    ],
    [],
  )

  const columns = isMobile ? mobileColumns : desktopColumns

  const totalWidth = useMemo(
    () =>
      Math.max(
        desktopColumns.reduce((sum, c) => sum + (c.width || 150), 0),
        640,
      ),
    [desktopColumns],
  )

  return (
    <>
      <Pageheading title="Paid By Cash" />
      <ToastContainer position="top-right" autoClose={2000} />

      <Toolbar
        totalRecords={totalCount}
        search={search}
        setSearch={setSearch}
        actionsMap={actionsMap}
        isMobile={isMobile}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {isUploadOpen && (
        <PaidByCashUploader
          isVisible={isUploadOpen}
          setIsVisible={setIsUploadOpen}
          refreshData={fetchData}
        />
      )}

      {isMobile ? (
        // ✅ Mobile view - simple table
        <Table
          rowKey={(r, i) => r?.id || r?.storeBudgetId || `${r?.eCode || 'row'}_${i}`}
          columns={columns}
          dataSource={employeesListData}
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
          scroll={{ x: 'max-content' }}
          className={theme === 'dark' ? 'dark-theme' : ''}
        />
      ) : (
        // ✅ Desktop view
        <div style={{ overflowX: 'hidden' }}>
          <Table
            rowKey={(r, i) => r?.id || r?.storeBudgetId || `${r?.eCode || 'row'}_${i}`}
            columns={columns}
            dataSource={employeesListData}
            bordered
            sticky
            size="middle"
            tableLayout="fixed"
            pagination={{
              current: currentPage,
              position: ['bottomRight'],
              total: totalCount,
              pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: handleTableChange,
            }}
            scroll={{
              x: totalWidth,
              y: 'calc(100vh - 160px)',
            }}
            style={{ whiteSpace: 'nowrap', width: '100%' }}
            className={theme === 'dark' ? 'dark-theme' : ''}
          />
        </div>
      )}
    </>
  )
}

const Toolbar = ({ totalRecords, search, setSearch, actionsMap, isMobile, onOpenUpload }) => {
  const { theme } = useSelector((state) => state.ui)

  const chips = [{ name: 'Total Rows', count: totalRecords }]

  return (
    <div
      style={{
        padding: 6,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          flex: isMobile ? '1 1 100%' : '0 1 auto',
        }}
      >
        {chips.map(({ name, count }, idx) => (
          <div
            key={idx}
            style={{
              border: '2px solid #ccc',
              padding: 4,
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'center',
              minWidth: 120,
              maxWidth: 160,
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
                textAlign: 'center',
              }}
            >
              {count} {name}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
          flex: isMobile ? '1 1 100%' : '0 1 auto',
        }}
      >
        {actionsMap?.upload?.actionStatus && (
          <Tooltip placement="top" title="Upload Paid By Cash">
            <Button onClick={onOpenUpload}>
              <UploadOutlined />
            </Button>
          </Tooltip>
        )}

        {actionsMap?.export?.actionStatus && (
          <Tooltip placement="top" title="Export">
            <Button>
              <ExportOutlined />
            </Button>
          </Tooltip>
        )}

        <Search
          placeholder="Search in table..."
          allowClear
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: isMobile ? '100%' : 300 }}
          value={search}
        />
      </div>
    </div>
  )
}

export default PaidbyCashMaster
