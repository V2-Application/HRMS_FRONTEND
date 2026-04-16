import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { Table, Tooltip, Button, Input, message, Grid, Space, Tag } from 'antd'
import { ExportOutlined, UploadOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import PayrollUploadModal from '../../employees/PayrollUploadModal'
import ExcelImportModal from '../modals/ExcelimportModal'
import Pageheading from '../shared/Pageheading'
import { exportEmployeeMaster, fetchPayroll, downloadPayrollExcel } from '../../services/Services'
import { set } from '../../redux/uiSlice'
import { useActionsMap } from '../../utils/useActionsMap'
import useMediaQuery from '../../hooks/useMediaQuery'
import 'react-toastify/dist/ReactToastify.css'

const { Search } = Input
const { useBreakpoint } = Grid

const CommonTable = () => {
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
  const [importExelModal, setimportExelModal] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [lodingLocal, setlodingLocal] = useState(false)

  // ✅ Mobile state
  const [expandedCards, setExpandedCards] = useState({})

  const handleToggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  // ✅ Expanded row render for mobile
  const expandedRowRender = (record) => (
    <div style={{ padding: 12, background: '#fafafa', fontSize: 11 }}>
      {/* Row 1: 4 columns */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8 }}
      >
        <div>
          <div style={{ color: '#666', fontSize: 9, fontWeight: 500, marginBottom: 2 }}>
            BGT Salary
          </div>
          <div style={{ fontWeight: 500, fontSize: 10 }}>
            ₹{Number(record.bgT_Salary || 0).toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ color: '#666', fontSize: 9, fontWeight: 500, marginBottom: 2 }}>
            Pay Days
          </div>
          <div style={{ fontWeight: 500, fontSize: 10 }}>{record.payable_Days || '-'}</div>
        </div>
        <div>
          <div style={{ color: '#666', fontSize: 9, fontWeight: 500, marginBottom: 2 }}>OT AMT</div>
          <div style={{ fontWeight: 500, fontSize: 10 }}>
            ₹{Number(record.oT_AMT || 0).toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ color: '#666', fontSize: 9, fontWeight: 500, marginBottom: 2 }}>
            Incentive
          </div>
          <div style={{ fontWeight: 500, fontSize: 10 }}>
            ₹{Number(record.incentivE_AMT || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Row 2: 4 columns */}
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8 }}
      >
        <div>
          <div style={{ color: '#666', fontSize: 9, fontWeight: 500, marginBottom: 2 }}>PF</div>
          <div style={{ fontWeight: 500, fontSize: 10 }}>
            ₹{Number(record.pf || 0).toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ color: '#666', fontSize: 9, fontWeight: 500, marginBottom: 2 }}>ESI</div>
          <div style={{ fontWeight: 500, fontSize: 10 }}>
            ₹{Number(record.esi || 0).toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ color: '#666', fontSize: 9, fontWeight: 500, marginBottom: 2 }}>TDS</div>
          <div style={{ fontWeight: 500, fontSize: 10 }}>
            ₹{Number(record.tds || 0).toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ color: '#666', fontSize: 9, fontWeight: 500, marginBottom: 2 }}>
            Penalty
          </div>
          <div style={{ fontWeight: 500, fontSize: 10 }}>
            ₹{Number(record.penalty || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Row 3: 2 columns - Gross & Total Deduction */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        <div style={{ background: '#e6f7ff', padding: 6, borderRadius: 4 }}>
          <div style={{ color: '#1890ff', fontSize: 9, fontWeight: 600, marginBottom: 2 }}>
            Gross Salary
          </div>
          <div style={{ fontWeight: 600, fontSize: 11, color: '#1890ff' }}>
            ₹{Number(record.gross_Salary || 0).toLocaleString()}
          </div>
        </div>
        <div style={{ background: '#fff1f0', padding: 6, borderRadius: 4 }}>
          <div style={{ color: '#ff4d4f', fontSize: 9, fontWeight: 600, marginBottom: 2 }}>
            Total Deduction
          </div>
          <div style={{ fontWeight: 600, fontSize: 11, color: '#ff4d4f' }}>
            ₹{Number(record.total_Deduction || 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )

  // ✅ Mobile columns
  const getMobileColumns = () => [
    {
      title: 'E-Code',
      dataIndex: 'ecode',
      width: 65,
      render: (text) => <div style={{ fontSize: 11, fontWeight: 500 }}>{text || '-'}</div>,
    },
    {
      title: 'Month',
      dataIndex: 'monthYear',
      width: 70,
      render: (data) => (
        <div style={{ fontSize: 11, fontWeight: 500 }}>
          {data ? data.split('T')[0].slice(0, 7) : '-'}
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      width: 80,
      render: (text) => (
        <div
          style={{
            fontSize: 11,
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
      title: 'Payable',
      dataIndex: 'payable_Salary',
      width: 70,
      render: (amount) => (
        <div style={{ fontSize: 11, fontWeight: 600, color: '#52c41a' }}>
          ₹{Number(amount || 0).toLocaleString()}
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 40,
      render: (_, record, index) => {
        // Use a unique identifier - try storeBudgetId first, fallback to index
        const uniqueKey = record.storeBudgetId || `row_${index}`

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

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchPayroll({ pageNumber: currentPage, pageSize, search })
      if (response) {
        setTotalCount(response?.totalRecords)
        setEmployeesListData(response?.data || [])
      } else {
        setEmployeesListData([])
      }
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message)
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

  const columns = useMemo(
    () => [
      { title: 'Location', dataIndex: 'location', key: 'location', width: 120 },
      { title: 'Emp Code', dataIndex: 'ecode', key: 'ecode', width: 120 },
      {
        title: 'Month-Year',
        dataIndex: 'monthYear',
        key: 'monthYear',
        render: (data) => data?.split('T')[0],
        width: 130,
      },
      { title: 'BGT Salary', dataIndex: 'bgT_Salary', key: 'bgT_Salary', width: 130 },
      { title: 'Payable Days', dataIndex: 'payable_Days', key: 'payable_Days', width: 140 },
      { title: 'OT AMT', dataIndex: 'oT_AMT', key: 'oT_AMT', width: 110 },
      { title: 'Incentive', dataIndex: 'incentivE_AMT', key: 'incentivE_AMT', width: 130 },
      { title: 'Fooding All', dataIndex: 'foodinG_ALL', key: 'foodinG_ALL', width: 130 },
      { title: 'Arrers', dataIndex: 'arrers', key: 'arrers', width: 110 },
      {
        title: 'Extra Days Allowance',
        dataIndex: 'extrA_DAYS_ALLOWANCE',
        key: 'extrA_DAYS_ALLOWANCE',
        width: 200,
      },
      { title: 'Gross Salary', dataIndex: 'gross_Salary', key: 'gross_Salary', width: 150 },
      { title: 'PF', dataIndex: 'pf', key: 'pf', width: 100 },
      { title: 'ESI', dataIndex: 'esi', key: 'esi', width: 100 },
      { title: 'TDS', dataIndex: 'tds', key: 'tds', width: 100 },
      { title: 'P-Tax', dataIndex: 'p_TAX', key: 'p_TAX', width: 110 },
      { title: 'Cash Short', dataIndex: 'casH_SHORT', key: 'casH_SHORT', width: 130 },
      { title: 'Diesel', dataIndex: 'diesel', key: 'diesel', width: 110 },
      { title: 'Penalty', dataIndex: 'penalty', key: 'penalty', width: 110 },
      { title: 'Loan', dataIndex: 'loan', key: 'loan', width: 110 },
      { title: 'Payable Salary', dataIndex: 'payable_Salary', key: 'payable_Salary', width: 170 },
      {
        title: 'Total Deduction',
        dataIndex: 'total_Deduction',
        key: 'total_Deduction',
        width: 170,
      },
    ],
    [],
  )

  const totalWidth = useMemo(
    () =>
      Math.max(
        columns.reduce((sum, c) => sum + (c.width || 150), 0),
        720,
      ),
    [columns],
  )

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />

      <Toolbar
        totalRecords={totalCount}
        selectedRowKeys={selectedRowKeys}
        search={search}
        setSearch={setSearch}
        lodingLocal={lodingLocal}
        setlodingLocal={setlodingLocal}
        refreshData={fetchData}
        actionsMap={actionsMap}
        isMobile={isMobile}
      />

      {isMobile ? (
        // ✅ Mobile view with expansion
        <Table
          rowKey={(record, index) => record.storeBudgetId || `row_${index}`}
          columns={getMobileColumns()}
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
          expandable={{
            expandedRowKeys: Object.keys(expandedCards)
              .filter((key) => expandedCards[key])
              .map((key) => (isNaN(key) ? key : parseInt(key))),
            expandedRowRender: expandedRowRender,
            showExpandColumn: false,
          }}
          className={theme === 'dark' ? 'dark-theme' : undefined}
        />
      ) : (
        // ✅ Desktop view with horizontal scroll
        <Table
          rowKey="storeBudgetId"
          columns={columns}
          dataSource={employeesListData}
          bordered
          size="middle"
          sticky
          pagination={{
            current: currentPage,
            position: ['bottomRight'],
            total: totalCount,
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100', '10000'],
            onChange: handleTableChange,
          }}
          scroll={{
            x: totalWidth,
            y: 'calc(100vh - 160px)',
          }}
          style={{ whiteSpace: 'nowrap' }}
          className={theme === 'dark' ? 'dark-theme' : undefined}
        />
      )}

      <ExcelImportModal
        importExelModal={importExelModal}
        setimportExelModal={setimportExelModal}
        title_fields={title_fields}
      />
    </>
  )
}

/* Toolbar component remains unchanged */
const Toolbar = ({
  totalRecords,
  selectedRowKeys,
  search,
  setSearch,
  lodingLocal,
  setlodingLocal,
  refreshData,
  actionsMap,
  isMobile,
}) => {
  const { theme } = useSelector((state) => state.ui)
  const [isEmpUploadVisible, setIsEmpUploadVisible] = useState(false)

  const statusSummary = [
    { name: 'Total Rows', count: totalRecords },
    { name: 'Selected Rows', count: selectedRowKeys.length },
  ]

  const handleDownloadPayrollExcel = async () => {
    try {
      setlodingLocal(true)
      const response = await downloadPayrollExcel()
      if (response.status === 200) {
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Employee_Payroll_${new Date().toISOString()}.xlsx`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Export initiated successfully')
      }
    } catch (e) {
      console.error('export error', e)
    } finally {
      setlodingLocal(false)
    }
  }

  return (
    <>
      {isEmpUploadVisible && (
        <PayrollUploadModal
          isVisible={isEmpUploadVisible}
          setIsVisible={setIsEmpUploadVisible}
          refreshData={refreshData}
        />
      )}

      <Pageheading title="Payroll" />

      <div
        style={{
          padding: 6,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
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
          {statusSummary.map(({ name, count }, i) => (
            <div
              key={i}
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
            <Tooltip placement="top" title="Upload Payroll">
              <Button onClick={() => setIsEmpUploadVisible(true)}>
                <UploadOutlined />
              </Button>
            </Tooltip>
          )}
          {actionsMap?.export?.actionStatus && (
            <Tooltip placement="top" title="Export">
              <Button
                loading={lodingLocal}
                disabled={lodingLocal}
                onClick={handleDownloadPayrollExcel}
              >
                <ExportOutlined />
              </Button>
            </Tooltip>
          )}
          <Search
            placeholder="Search in table..."
            allowClear
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            style={{ width: isMobile ? '100%' : 280 }}
          />
        </div>
      </div>
    </>
  )
}

/* keep if ExcelImportModal needs it; otherwise remove */
const title_fields = [
  {
    label: 'Designation',
    key: 'firstName',
    alternateMatches: ['FIRST NAME'],
    fieldType: { type: 'input' },
    example: 'John',
    validations: [{ rule: 'required', errorMessage: 'First Name is required' }],
  },
  {
    label: 'Middle Name',
    key: 'middleName',
    alternateMatches: ['MIDDLE NAME'],
    fieldType: { type: 'input' },
    example: 'Alan',
  },
  {
    label: 'Last Name',
    key: 'lastName',
    alternateMatches: ['LAST NAME'],
    fieldType: { type: 'input' },
    example: 'Doe',
    validations: [{ rule: 'required', errorMessage: 'Last Name is required' }],
  },
  {
    label: 'Email',
    key: 'email',
    alternateMatches: ['EMAIL ADDRESS'],
    fieldType: { type: 'input' },
    example: 'john@example.com',
    validations: [
      { rule: 'required', errorMessage: 'Email is required' },
      { rule: 'email', errorMessage: 'Invalid email format' },
    ],
  },
  {
    label: 'Mobile',
    key: 'mobile',
    alternateMatches: ['MOBILE'],
    fieldType: { type: 'input' },
    example: '9876543210',
    validations: [{ rule: 'required', errorMessage: 'Mobile number is required' }],
  },
  {
    label: 'Date of Birth',
    key: 'dob',
    alternateMatches: ['DOB'],
    fieldType: { type: 'date' },
    example: '1990-01-01',
  },
  {
    label: 'Gender',
    key: 'gender',
    fieldType: { type: 'select', options: ['Male', 'Female', 'Other'] },
    example: 'Male',
  },
  {
    label: 'Designation',
    key: 'designation',
    fieldType: { type: 'input' },
    example: 'Software Engineer',
  },
  { label: 'Department', key: 'department', fieldType: { type: 'input' }, example: 'Engineering' },
  { label: 'Joining Date', key: 'joiningDate', fieldType: { type: 'date' }, example: '2023-08-15' },
  { label: 'Gross Salary', key: 'grossSalary', fieldType: { type: 'input' }, example: '50000.00' },
  { label: 'PAN Number', key: 'panNumber', fieldType: { type: 'input' }, example: 'ABCDE1234F' },
  {
    label: 'Aadhar Number',
    key: 'aadharNumber',
    fieldType: { type: 'input' },
    example: '123412341234',
  },
  {
    label: 'Marital Status',
    key: 'maritalStatus',
    alternateMatches: ['MARITIAL STATUS'],
    fieldType: { type: 'select', options: ['Single', 'Married', 'Divorced', 'Widowed'] },
    example: 'Single',
  },
  { label: 'Nationality', key: 'nationality', fieldType: { type: 'input' }, example: 'Indian' },
]

export default CommonTable
