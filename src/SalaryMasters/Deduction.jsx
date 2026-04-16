import React, { useEffect, useState } from 'react'
import { Space, Table, Row, Input, Button, Col, message, Grid } from 'antd'
import { ExportOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import useMediaQuery from '../hooks/useMediaQuery'

import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { exportTotalDeductionToExcel, fetchDeductionList } from '../services/Services'
import { set } from '../redux/uiSlice'
import Pageheading from '../components/shared/Pageheading'
import { useActionsMap } from '../utils/useActionsMap'

const { Search } = Input

const Deduction = () => {
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [search, setSearch] = useState('')
  const [lodingLocal, setlodingLocal] = useState(false)

  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)

  const { filteredSideMenu } = useSelector((state) => state?.auth || {})
  const actionsMap = useActionsMap(filteredSideMenu)

  // responsiveness
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  const money = (value) => {
    const num = Number(value || 0)
    return num === 0
      ? '0'
      : num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  const handleToggleCard = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchDeductionList({ search })
      if (response?.status) {
        const list = response?.data?.data || []
        setEmployeesListData(list)
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

  useEffect(() => {
    let s = search?.trim().toLowerCase()
    if (s) {
      let newData = employeesListData.filter((row) =>
        Object.values(row).some((val) => String(val).toLowerCase().includes(s)),
      )
      setFilteredData(newData)
    } else {
      setFilteredData(employeesListData)
    }
  }, [search, employeesListData])

  const desktopColumns = [
    { title: 'E-CODE', dataIndex: 'ecode', key: 'ecode', ellipsis: true, width: 140 },
    { title: 'LOC CODE', dataIndex: 'stCode', key: 'stCode', ellipsis: true, width: 140 },
    {
      title: 'LOCATION',
      dataIndex: 'locationName',
      key: 'locationName',
      ellipsis: true,
      width: 160,
    },
    { title: 'EMP NAME', dataIndex: 'fulL_NAME', key: 'fulL_NAME', ellipsis: true, width: 260 },
    {
      title: 'DEPARTMENT',
      dataIndex: 'departmentName',
      key: 'departmentName',
      ellipsis: true,
      width: 160,
    },
    {
      title: 'DESIGNATION',
      dataIndex: 'designationName',
      key: 'designationName',
      ellipsis: true,
      width: 160,
    },
    { title: 'MTH-YEAR', dataIndex: 'month', key: 'month', ellipsis: true, width: 140 },
    { title: 'PF', dataIndex: 'pf', key: 'pf', ellipsis: true, width: 120 },
    { title: 'ESIC', dataIndex: 'esic', key: 'esic', ellipsis: true, width: 120 },
    { title: 'TDS', dataIndex: 'tds', key: 'tds', ellipsis: true, width: 120 },
    { title: 'P TAX', dataIndex: 'pTax', key: 'pTax', ellipsis: true, width: 120 },
    { title: 'LOAN', dataIndex: 'loan', key: 'loan', ellipsis: true, width: 120 },
    { title: 'CASH SHORT', dataIndex: 'cashShort', key: 'cashShort', ellipsis: true, width: 140 },
    {
      title: 'DIESEL DEDUCTION',
      dataIndex: 'dieselDeduction',
      key: 'dieselDeduction',
      ellipsis: true,
      width: 170,
    },
    { title: 'PENALITY', dataIndex: 'penality', key: 'penality', ellipsis: true, width: 130 },
    { title: 'LWF', dataIndex: 'lwf', key: 'lwf', ellipsis: true, width: 120 },
    {
      title: 'TOTAL DEDUCTION',
      dataIndex: 'totalDeductions',
      key: 'totalDeductions',
      ellipsis: true,
      width: 170,
    },
  ]

  const expandedRowRender = (record) => (
    <div style={{ padding: 1, background: '#fafafa', fontSize: 10 }}>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, marginBottom: 4 }}
      >
        <div style={{ background: '#e6f7ff', padding: 4, borderRadius: 3 }}>
          <div
            style={{
              color: '#1890ff',
              fontSize: 10,
              fontWeight: 500,
              marginBottom: 1,
              textAlign: 'center',
            }}
          >
            PF
          </div>
          <div style={{ fontWeight: 600, fontSize: 10, color: '#1890ff', textAlign: 'center' }}>
            ₹{money(record.pf)}
          </div>
        </div>
        <div style={{ background: '#e6f7ff', padding: 4, borderRadius: 3 }}>
          <div
            style={{
              color: '#1890ff',
              fontSize: 10,
              fontWeight: 500,
              marginBottom: 1,
              textAlign: 'center',
            }}
          >
            ESIC
          </div>
          <div style={{ fontWeight: 600, fontSize: 10, color: '#1890ff', textAlign: 'center' }}>
            ₹{money(record.esic)}
          </div>
        </div>
        <div style={{ background: '#fff7e6', padding: 4, borderRadius: 3 }}>
          <div
            style={{
              color: '#fa8c16',
              fontSize: 10,
              fontWeight: 500,
              marginBottom: 1,
              textAlign: 'center',
            }}
          >
            TDS
          </div>
          <div style={{ fontWeight: 600, fontSize: 10, color: '#fa8c16', textAlign: 'center' }}>
            ₹{money(record.tds)}
          </div>
        </div>
        <div style={{ background: '#fff7e6', padding: 4, borderRadius: 3 }}>
          <div
            style={{
              color: '#fa8c16',
              fontSize: 10,
              fontWeight: 500,
              marginBottom: 1,
              textAlign: 'center',
            }}
          >
            P Tax
          </div>
          <div style={{ fontWeight: 600, fontSize: 10, color: '#fa8c16', textAlign: 'center' }}>
            ₹{money(record.pTax)}
          </div>
        </div>
        <div style={{ background: '#fff1f0', padding: 4, borderRadius: 3 }}>
          <div
            style={{
              color: '#ff4d4f',
              fontSize: 10,
              fontWeight: 500,
              marginBottom: 1,
              textAlign: 'center',
            }}
          >
            Loan
          </div>
          <div style={{ fontWeight: 600, fontSize: 10, color: '#ff4d4f', textAlign: 'center' }}>
            ₹{money(record.loan)}
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
        <div style={{ background: '#fff1f0', padding: 4, borderRadius: 3 }}>
          <div
            style={{
              color: '#ff4d4f',
              fontSize: 10,
              fontWeight: 500,
              marginBottom: 1,
              textAlign: 'center',
            }}
          >
            Cash Short
          </div>
          <div style={{ fontWeight: 600, fontSize: 10, color: '#ff4d4f', textAlign: 'center' }}>
            ₹{money(record.cashShort)}
          </div>
        </div>
        <div style={{ background: '#f6ffed', padding: 4, borderRadius: 3 }}>
          <div
            style={{
              color: '#52c41a',
              fontSize: 10,
              fontWeight: 500,
              marginBottom: 1,
              textAlign: 'center',
            }}
          >
            Diesel
          </div>
          <div style={{ fontWeight: 600, fontSize: 10, color: '#52c41a', textAlign: 'center' }}>
            ₹{money(record.dieselDeduction)}
          </div>
        </div>
        <div style={{ background: '#f6ffed', padding: 4, borderRadius: 3 }}>
          <div
            style={{
              color: '#52c41a',
              fontSize: 10,
              fontWeight: 500,
              marginBottom: 1,
              textAlign: 'center',
            }}
          >
            Penalty
          </div>
          <div style={{ fontWeight: 600, fontSize: 10, color: '#52c41a', textAlign: 'center' }}>
            ₹{money(record.penality)}
          </div>
        </div>
        <div style={{ background: '#f6ffed', padding: 4, borderRadius: 3 }}>
          <div
            style={{
              color: '#52c41a',
              fontSize: 10,
              fontWeight: 500,
              marginBottom: 1,
              textAlign: 'center',
            }}
          >
            LWF
          </div>
          <div style={{ fontWeight: 600, fontSize: 10, color: '#52c41a', textAlign: 'center' }}>
            ₹{money(record.lwf)}
          </div>
        </div>
      </div>
    </div>
  )

  const mobileColumns = [
    {
      title: 'Code',
      dataIndex: 'ecode',
      width: 50,
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
      title: 'Name',
      dataIndex: 'fulL_NAME',
      width: 90,
      render: (text) => (
        <div
          style={{
            fontSize: 10,
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
      width: 65,
      render: (text) => (
        <div
          style={{
            fontSize: 10,
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
      title: 'Total Ded',
      dataIndex: 'totalDeductions',
      width: 70,
      render: (value) => (
        <div style={{ fontSize: 10, fontWeight: 600, color: '#ff4d4f', textAlign: 'center' }}>
          ₹{money(value)}
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

  const columns = isMobile ? mobileColumns : desktopColumns
  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  const handleSearch = (e) => setSearch(e.target.value)

  return (
    <>
      <Pageheading title="Deduction" />
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
          handleSearch={handleSearch}
          lodingLocal={lodingLocal}
          setlodingLocal={setlodingLocal}
          actionsMap={actionsMap}
          search={search}
          isMobile={isMobile}
          filteredData={filteredData}
        />
        <Table
          rowKey={(r, i) => r?.storeBudgetId || r?.ecode || `row_${i}`}
          columns={columns}
          pagination={{ pageSize: 100 }}
          dataSource={filteredData}
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
          scroll={
            isMobile
              ? { x: 'max-content' } // ✅ Only horizontal scroll
              : { x: totalWidth, y: 'calc(100vh - 160px)' }
          }
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
  handleSearch,
  search,
  lodingLocal,
  setlodingLocal,
  actionsMap,
  isMobile,
  filteredData,
}) => {
  const { theme } = useSelector((state) => state.ui)

  const downloadStoreDataAsExcel = async () => {
    try {
      setlodingLocal(true)
      const { data, status } = await exportTotalDeductionToExcel()
      if (status === 200) {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `Total_Deduction_${new Date().toISOString()}.xlsx`
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
            {filteredData?.length} Total Rows
          </span>
        </div>
      </Space>

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

export default Deduction
