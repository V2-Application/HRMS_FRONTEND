import React, { useEffect, useState } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, message, Dropdown, Grid } from 'antd'
import { ExportOutlined, UploadOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import useMediaQuery from '../../hooks/useMediaQuery'

import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import {
  exportEmployeeMaster,
  fetchEmpAttendanceMaster,
  fetchEmpCodeSeatMaster,
  fetchEmpStatutoryDetails,
  fetchPaidByBank,
  fetchPayroll,
  fetchWeeklyOffPolicy,
} from '../../services/Services'
import { set } from '../../redux/uiSlice'
import EmployeeStatutoryDetailsUploader from './EmployeeSatutoryDetailsUploader'
import Pageheading from '../../components/shared/Pageheading'
import { useActionsMap } from '../../utils/useActionsMap'
import { exportExcelFromFrontend } from '../../components/shared/ExportExceFromFrontend'

const { Search } = Input

const EmployeeStatutoryDetailsMaster = () => {
  const [selectionType, setSelectionType] = useState('checkbox')
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [searchTerm, setSerachTerm] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [importExelModal, setimportExelModal] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [search, setSearch] = useState('')
  const dispatch = useDispatch()
  const { loading, theme } = useSelector((state) => state.ui)
  const [lodingLocal, setlodingLocal] = useState(false)

  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  const handleToggleCard = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Mobile expanded row - 2 sections with remaining fields
  const expandedRowRender = (record) => (
    <div style={{ padding: 12, background: '#fafafa', fontSize: 11 }}>
      {/* Section 1: Banking & PF Details - 3 columns */}
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#666',
            marginBottom: 6,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Banking & PF Details
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
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
              IFSC Code
            </div>
            <div
              style={{
                fontWeight: 600,
                fontSize: 10,
                color: '#1890ff',
                textAlign: 'center',
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                lineHeight: '1.2',
              }}
            >
              {record.ifsC_Code || '-'}
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
              UAN No.
            </div>
            <div
              style={{
                fontWeight: 600,
                fontSize: 10,
                color: '#52c41a',
                textAlign: 'center',
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                lineHeight: '1.2',
              }}
            >
              {record.uaN_NO || '-'}
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
              PF No.
            </div>
            <div
              style={{
                fontWeight: 600,
                fontSize: 10,
                color: '#52c41a',
                textAlign: 'center',
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                lineHeight: '1.2',
              }}
            >
              {record.pF_NO || '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Other IDs - 2 columns */}
      <div style={{ background: '#fff7e6', padding: 8, borderRadius: 4 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#fa8c16',
            marginBottom: 6,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Government IDs
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
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
              ESI No.
            </div>
            <div
              style={{
                fontWeight: 600,
                fontSize: 10,
                color: '#fa8c16',
                textAlign: 'center',
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                lineHeight: '1.2',
              }}
            >
              {record.esI_NO || '-'}
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
              Aadhar No.
            </div>
            <div
              style={{
                fontWeight: 600,
                fontSize: 10,
                color: '#fa8c16',
                textAlign: 'center',
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                lineHeight: '1.2',
              }}
            >
              {record.aadhaR_NO || '-'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Mobile columns - MAIN ROW: Code, Bank, A/C No, PAN + Expand (5 columns)
  const mobileColumns = [
    {
      title: 'E-Code',
      dataIndex: 'e_CODE',
      width: 55,
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
      title: 'Bank',
      dataIndex: 'name_of_Bank',
      width: 80,
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
      title: 'A/C No',
      dataIndex: 'aC_NO',
      width: 75,
      render: (text) => (
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#1890ff',
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
      title: 'PAN',
      dataIndex: 'paN_NO',
      width: 70,
      render: (text) => (
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#52c41a',
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
      title: '',
      key: 'action',
      width: 35,
      render: (_, record, index) => {
        const uniqueKey = record.storeBudgetId || record.e_CODE || `row_${index}`
        return (
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
        )
      },
    },
  ]

  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)
  console.log('>>>actionsMap', actionsMap)

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await fetchEmpStatutoryDetails()

      if (response.status === 200) {
        setTotalCount(response?.data?.data?.length)
        setEmployeesListData(response?.data?.data)
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

  const columns = [
    {
      title: 'Emp Code',
      dataIndex: 'e_CODE',
      key: 'e_CODE',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Name of Bank',
      dataIndex: 'name_of_Bank',
      key: 'name_of_Bank',
      width: 150,
    },
    {
      title: 'IFSC',
      dataIndex: 'ifsC_Code',
      key: 'ifsC_Code',
      width: 150,
    },
    {
      title: 'A/C No.',
      dataIndex: 'aC_NO',
      key: 'aC_NO',
      width: 150,
    },
    {
      title: 'UAN No.',
      dataIndex: 'uaN_NO',
      key: 'uaN_NO',
      width: 150,
    },
    {
      title: 'PF No.',
      dataIndex: 'pF_NO',
      key: 'pF_NO',
      width: 150,
    },
    {
      title: 'ESI No.',
      dataIndex: 'esI_NO',
      key: 'esI_NO',
      width: 150,
    },
    {
      title: 'PAN No.',
      dataIndex: 'paN_NO',
      key: 'paN_NO',
      width: 150,
    },
    {
      title: 'Aadhar No.',
      dataIndex: 'aadhaR_NO',
      key: 'aadhaR_NO',
      width: 150,
    },
  ]

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  return (
    <>
      <Pageheading title="Emp Statutory Details Uploader" />
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
          search={search}
          actionsMap={actionsMap}
          filteredData={filteredData}
        />
        {isMobile ? (
          <Table
            rowKey={(r, i) => r?.storeBudgetId || r?.e_CODE || `row_${i}`}
            columns={mobileColumns}
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
            scroll={{ x: 'max-content' }}
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
      {/* <ExcelImportModal
        importExelModal={importExelModal}
        setimportExelModal={setimportExelModal}
        title_fields={title_fields}
      /> */}
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
  actionsMap,
  filteredData,
}) => {
  // console.log('>>>>>>>>>selectedRowKeys', selectedRowKeys);
  const dispatch = useDispatch()
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
    { name: 'Selected Rows', label: 'Rejected', count: 0, color: 'blue', id: [7] },
    // { name: 'Completed', label: 'Completed', count: 15, color: 'red', id: [6] },
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

  const downloadDataInExcel = () => {
    const columns = [
      { header: 'Emp Code', key: 'e_CODE' },
      { header: 'Name of Bank', key: 'name_of_Bank' },
      { header: 'IFSC', key: 'ifsC_Code' },
      { header: 'A/C No.', key: 'aC_NO' },
      { header: 'UAN No.', key: 'uaN_NO' },
      { header: 'PF No.', key: 'pF_NO' },
      { header: 'ESI No.', key: 'esI_NO' },
      { header: 'PAN No.', key: 'paN_NO' },
      { header: 'Aadhar No.', key: 'aadhaR_NO' },
    ]

    setlodingLocal(true)

    const response = exportExcelFromFrontend(
      columns,
      filteredData,
      'EmployeeStatutoryDetailsMaster.xlsx',
    )

    if (response.success) {
      message.success(response.message)
    } else {
      message.error(response.message)
    }

    setlodingLocal(false)
  }

  const { useBreakpoint } = Grid
  const screens = useBreakpoint()
  const isMobile = !screens.md

  return (
    <>
      {/* {isEmpUploadVisible && (
        <EmployeesUploadModal
          isVisible={isEmpUploadVisible}
          setIsVisible={setIsEmpUploadVisible}
          refreshData={refreshData}
        />
      )} */}
      {isEmpUploadVisible && (
        <EmployeeStatutoryDetailsUploader
          isVisible={isEmpUploadVisible}
          setIsVisible={setIsEmpUploadVisible}
          refreshData={refreshData}
        />
      )}
      <div
        style={{
          padding: 5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space>
          {statusSummary.map(({ name, label, count, color, id }, index) => (
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
                // ✅ No tooltip
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
                // ✅ Tooltip for other statuses (if any)
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
          <Col>
            {actionsMap?.upload?.actionStatus && (
              <Tooltip placement="top" title={'Upload Emp Statutory Details'}>
                <Button style={{ marginLeft: 5 }} onClick={() => setIsEmpUploadVisible(true)}>
                  <UploadOutlined />
                </Button>
              </Tooltip>
            )}

            {actionsMap?.export?.actionStatus && (
              <Tooltip placement="top" title={'Export'}>
                <Button style={{ marginLeft: 5 }} loading={lodingLocal}>
                  <ExportOutlined />
                </Button>
              </Tooltip>
            )}
          </Col>
          <Search
            //   placeholder="Search by name, role, or tags"
            placeholder="Search in table..."
            allowClear
            onChange={handleSearch}
            // onBlur={(e) => sessionStorage.setItem('employee-search', e.target.value)}
            style={isMobile ? { width: 150, marginLeft: 5 } : { width: 300, marginLeft: 5 }}
            value={search}
          />
        </Row>
      </div>
    </>
  )
}

export default EmployeeStatutoryDetailsMaster
