import { useEffect, useState, useCallback } from 'react'
import { Table, Input, Tooltip, Button, message } from 'antd'
import { ExportOutlined, UploadOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEmpTDSMaster } from '../../services/Services'
import { set } from '../../redux/uiSlice'
import EmpTDSUploader from './EmpTDSUploader'
import Pageheading from '../../components/shared/Pageheading'
import { useActionsMap } from '../../utils/useActionsMap'
import { exportExcelFromFrontend } from '../../components/shared/ExportExceFromFrontend'
import useMediaQuery from '../../hooks/useMediaQuery'

const { Search } = Input

const EmpTDSMaster = () => {
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)
  const [lodingLocal, setlodingLocal] = useState(false)

  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  const handleToggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)

  // ✅ Mobile expanded row render
  const expandedRowRender = (record) => (
    <div style={{ padding: 12, background: '#fafafa', fontSize: 12 }}>
      {/* Section 1: Primary Deductions - 4 columns */}
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#666',
            marginBottom: 8,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Primary Deductions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          <div>
            <div
              style={{
                color: '#888',
                fontSize: 10,
                fontWeight: 500,
                marginBottom: 3,
                textAlign: 'center',
              }}
            >
              TDS
            </div>
            <div style={{ fontWeight: 600, fontSize: 12, color: '#ff4d4f', textAlign: 'center' }}>
              ₹{Number(record.tds || 0).toLocaleString()}
            </div>
          </div>
          <div>
            <div
              style={{
                color: '#888',
                fontSize: 10,
                fontWeight: 500,
                marginBottom: 3,
                textAlign: 'center',
              }}
            >
              P-Tax
            </div>
            <div style={{ fontWeight: 600, fontSize: 12, color: '#ff4d4f', textAlign: 'center' }}>
              ₹{Number(record.pTax || 0).toLocaleString()}
            </div>
          </div>
          <div>
            <div
              style={{
                color: '#888',
                fontSize: 10,
                fontWeight: 500,
                marginBottom: 3,
                textAlign: 'center',
              }}
            >
              Loan
            </div>
            <div style={{ fontWeight: 600, fontSize: 12, color: '#ff4d4f', textAlign: 'center' }}>
              ₹{Number(record.loan || 0).toLocaleString()}
            </div>
          </div>
          <div>
            <div
              style={{
                color: '#888',
                fontSize: 10,
                fontWeight: 500,
                marginBottom: 3,
                textAlign: 'center',
              }}
            >
              Cash Short
            </div>
            <div style={{ fontWeight: 600, fontSize: 12, color: '#ff4d4f', textAlign: 'center' }}>
              ₹{Number(record.cashShort || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Other Deductions - 3 columns */}
      <div style={{ background: '#fff7e6', padding: 8, borderRadius: 4 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#fa8c16',
            marginBottom: 8,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Other Deductions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          <div>
            <div
              style={{
                color: '#fa8c16',
                fontSize: 10,
                fontWeight: 500,
                marginBottom: 3,
                textAlign: 'center',
              }}
            >
              Diesel
            </div>
            <div style={{ fontWeight: 600, fontSize: 12, color: '#fa8c16', textAlign: 'center' }}>
              ₹{Number(record.dieselDeduction || 0).toLocaleString()}
            </div>
          </div>
          <div>
            <div
              style={{
                color: '#fa8c16',
                fontSize: 10,
                fontWeight: 500,
                marginBottom: 3,
                textAlign: 'center',
              }}
            >
              Penalty
            </div>
            <div style={{ fontWeight: 600, fontSize: 12, color: '#fa8c16', textAlign: 'center' }}>
              ₹{Number(record.penality || 0).toLocaleString()}
            </div>
          </div>
          <div>
            <div
              style={{
                color: '#fa8c16',
                fontSize: 10,
                fontWeight: 500,
                marginBottom: 3,
                textAlign: 'center',
              }}
            >
              LWF
            </div>
            <div style={{ fontWeight: 600, fontSize: 12, color: '#fa8c16', textAlign: 'center' }}>
              ₹{Number(record.lwf || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchEmpTDSMaster()

      if (response.status === 200) {
        setTotalCount(response?.data?.data?.length)
        setEmployeesListData(response?.data?.data)
      } else {
        setEmployeesListData([])
      }
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message || error)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const new_search = search?.trim().toLowerCase()

    if (new_search.length > 0) {
      const new_data =
        employeesListData.filter((dt) =>
          Object.values(dt).some((val) => String(val).toLowerCase().includes(new_search)),
        ) || []

      setTotalCount(new_data.length)
      setFilteredData(new_data)
    } else {
      setTotalCount(employeesListData.length)
      setFilteredData(employeesListData)
    }
  }, [search, employeesListData])

  // ✅ Mobile columns
  const getMobileColumns = () => [
    {
      title: 'E-Code',
      dataIndex: 'e_CODE',
      width: 70,
      render: (text) => <div style={{ fontSize: 11, fontWeight: 500 }}>{text || '-'}</div>,
    },
    {
      title: 'Month',
      dataIndex: 'mth',
      width: 80,
      render: (text) => <div style={{ fontSize: 11, fontWeight: 500 }}>{text || '-'}</div>,
    },
    {
      title: 'Total',
      width: 70,
      render: (_, record) => {
        const total =
          (Number(record.tds) || 0) +
          (Number(record.pTax) || 0) +
          (Number(record.loan) || 0) +
          (Number(record.cashShort) || 0) +
          (Number(record.dieselDeduction) || 0) +
          (Number(record.penality) || 0) +
          (Number(record.lwf) || 0)
        return (
          <div style={{ fontSize: 11, fontWeight: 600, color: '#ff4d4f' }}>
            ₹{total.toLocaleString()}
          </div>
        )
      },
    },
    {
      title: '',
      key: 'action',
      width: 40,
      render: (_, record, index) => {
        const uniqueKey = record.storeBudgetId || record.e_CODE || `row_${index}`
        return (
          <Button
            type="text"
            size="small"
            icon={
              expandedCards[uniqueKey] ? (
                <MinusOutlined style={{ fontSize: 12 }} />
              ) : (
                <PlusOutlined style={{ fontSize: 12 }} />
              )
            }
            onClick={(e) => {
              e.stopPropagation()
              handleToggleCard(uniqueKey)
            }}
            style={{ padding: '4px' }}
          />
        )
      },
    },
  ]

  const desktopColumns = [
    {
      title: 'Emp Code',
      dataIndex: 'e_CODE',
      key: 'e_CODE',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Month',
      dataIndex: 'mth',
      key: 'mth',
      width: 150,
    },
    {
      title: 'TDS',
      dataIndex: 'tds',
      key: 'tds',
      width: 150,
    },
    {
      title: 'P-Tax',
      dataIndex: 'pTax',
      key: 'pTax',
      width: 150,
    },
    {
      title: 'Loan',
      dataIndex: 'loan',
      key: 'loan',
      width: 150,
    },
    {
      title: 'Cash Short',
      dataIndex: 'cashShort',
      key: 'cashShort',
      width: 150,
    },
    {
      title: 'Diesel Deduction',
      dataIndex: 'dieselDeduction',
      key: 'dieselDeduction',
      width: 150,
    },
    {
      title: 'Penalty',
      dataIndex: 'penality',
      key: 'penality',
      width: 150,
    },
    {
      title: 'LWF',
      dataIndex: 'lwf',
      key: 'lwf',
      width: 150,
    },
  ]

  const columns = isMobile ? getMobileColumns() : desktopColumns
  const totalWidth = desktopColumns.reduce((sum, col) => sum + (col.width || 150), 0)

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  return (
    <>
      <Pageheading title="Emp Deduction Master Uploader" />
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
          actionsMap={actionsMap}
          totalRecords={totalCount}
          handleSearch={handleSearch}
          lodingLocal={lodingLocal}
          setlodingLocal={setlodingLocal}
          refreshData={fetchData}
          filteredData={filteredData}
          isMobile={isMobile}
        />

        {isMobile ? (
          <Table
            rowKey={(r, i) => r?.storeBudgetId || r?.e_CODE || `row_${i}`}
            columns={columns}
            dataSource={filteredData}
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
              expandedRowKeys: Object.keys(expandedCards).filter((key) => expandedCards[key]),
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
            dataSource={filteredData}
            bordered={true}
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
  totalRecords,
  handleSearch,
  search,
  lodingLocal,
  setlodingLocal,
  refreshData,
  actionsMap,
  filteredData,
  isMobile,
}) => {
  const { theme } = useSelector((state) => state.ui)
  const [isEmpUploadVisible, setIsEmpUploadVisible] = useState(false)

  const [statusSummary, setstatusSummary] = useState([
    {
      name: 'Total Rows',
      label: 'Pending Interview Schedule',
      count: 0,
      color: 'green',
      id: [1, 2, 3, 4, 5],
    },
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
  }, [totalRecords])

  const downloadDataInExcel = () => {
    const columns = [
      { header: 'Emp Code', key: 'e_CODE' },
      { header: 'Month', key: 'mth' },
      { header: 'TDS', key: 'tds' },
      { header: 'P-Tax', key: 'pTax' },
      { header: 'Loan', key: 'loan' },
      { header: 'Cash Short', key: 'cashShort' },
      { header: 'Diesel Deduction', key: 'dieselDeduction' },
      { header: 'Penalty', key: 'penality' },
      { header: 'LWF', key: 'lwf' },
    ]

    setlodingLocal(true)

    const response = exportExcelFromFrontend(columns, filteredData, 'EmpTDSMaster.xlsx')

    if (response.success) {
      message.success(response.message)
    } else {
      message.error(response.message)
    }

    setlodingLocal(false)
  }

  return (
    <>
      {isEmpUploadVisible && (
        <EmpTDSUploader
          isVisible={isEmpUploadVisible}
          setIsVisible={setIsEmpUploadVisible}
          refreshData={refreshData}
        />
      )}
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
          {statusSummary.map(({ name, count }, index) => (
            <div
              key={index}
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
            <Tooltip placement="top" title="Upload Emp Deduction Master">
              <Button onClick={() => setIsEmpUploadVisible(true)}>
                <UploadOutlined />
              </Button>
            </Tooltip>
          )}

          {actionsMap?.export?.actionStatus && (
            <Tooltip placement="top" title="Export">
              <Button loading={lodingLocal} onClick={downloadDataInExcel}>
                <ExportOutlined />
              </Button>
            </Tooltip>
          )}

          <Search
            placeholder="Search in table..."
            allowClear
            onChange={handleSearch}
            style={{ width: isMobile ? 150 : 300 }}
            value={search}
          />
        </div>
      </div>
    </>
  )
}

export default EmpTDSMaster
