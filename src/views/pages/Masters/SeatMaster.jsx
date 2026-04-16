import React, { useEffect, useState, useCallback } from 'react'
import {
  Space,
  Table,
  Checkbox,
  Row,
  Input,
  Tooltip,
  Button,
  Modal,
  Tabs,
  Col,
  Card,
  Grid,
  Pagination,
  Typography,
  message,
} from 'antd'
import {
  ImportOutlined,
  ExportOutlined,
  UserSwitchOutlined,
  EditOutlined,
  StepForwardOutlined,
  PlusOutlined,
  MailOutlined,
  MinusOutlined, // ADD THIS
} from '@ant-design/icons'

// ADD THIS IMPORT
import useMediaQuery from '../../../hooks/useMediaQuery'
import { Link, useNavigate } from 'react-router-dom'
import TextArea from 'antd/es/input/TextArea'
import { toast, ToastContainer } from 'react-toastify'
import { getStoreLocationMaster, storeLocationMasterList } from '../../../services/Services'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { useActionsMap } from '../../../utils/useActionsMap'
import { useSelector } from 'react-redux'

const { Search } = Input
const { useBreakpoint } = Grid
const { Text } = Typography

const SeatMaster = () => {
  const navigate = useNavigate()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({}) // ADD THIS

  const [selectionType] = useState('checkbox')
  const [locations, setLocations] = useState([])
  const [filteredLocations, setFilteredLocations] = useState([])
  const [loading, setloading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [totalRecords, setTotalRecords] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [importExelModal, setimportExelModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleToggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  // permissions
  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu || [])
  const actionsMap = useActionsMap(filteredSideMenu)

  const handleTableChange = (current, newPageSize) => {
    setCurrentPage(current)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    setloading(true)
    try {
      const response = await storeLocationMasterList({ currentPage, pageSize })
      if (response?.status === 200) {
        setTotalRecords(response?.data?.data?.totalRecords)
        const updatedData = response?.data?.data?.data || []
        setLocations(updatedData)
      } else {
        navigate('/candidate/form_list')
      }
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message)
    } finally {
      setloading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentPage, pageSize])

  useEffect(() => {
    const query = String(searchQuery).toLowerCase().trim()
    if (query.length === 0) {
      setFilteredLocations(locations)
    } else {
      const filtered = locations?.filter((loc) =>
        Object.values(loc).some((l) =>
          String(l ?? '')
            .toLowerCase()
            .trim()
            .includes(query),
        ),
      )
      setFilteredLocations(filtered)
    }
  }, [searchQuery, locations])

  // ----- Filter dropdown (string) -----
  const getStringFilterDropdown = (data, dataIndex) => {
    return ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
      const [searchText, setSearchText] = useState('')

      const uniqueOptions = [...new Set(data.map((item) => item[dataIndex]))]
        .filter((val) =>
          String(val ?? '')
            .toLowerCase()
            .includes(searchText.toLowerCase()),
        )
        .map((val) => ({
          text: val,
          value: val,
        }))

      return (
        <div style={{ padding: 8, width: 250 }}>
          <Input
            placeholder={`Search ${dataIndex}`}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {uniqueOptions.map((option) => (
              <div key={option.value}>
                <Checkbox
                  checked={selectedKeys.includes(option.value)}
                  onChange={(e) => {
                    const nextSelectedKeys = e.target.checked
                      ? [...selectedKeys, option.value]
                      : selectedKeys.filter((k) => k !== option.value)
                    setSelectedKeys(nextSelectedKeys)
                  }}
                >
                  {option.text || <em>(empty)</em>}
                </Checkbox>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, textAlign: 'right' }}>
            <Button onClick={() => clearFilters()} size="small">
              Reset
            </Button>
            <Button onClick={() => confirm()} style={{ marginLeft: 8 }} size="small" type="primary">
              Filter
            </Button>
          </div>
        </div>
      )
    }
  }

  // ----- Table columns (desktop) -----
  const columns = [
    {
      title: 'Employee Name',
      dataIndex: 'name_of_Employee',
      key: 'name_of_Employee',
      width: 300,
      ellipsis: true,
      filterDropdown: getStringFilterDropdown(locations, 'name_of_Employee'),
      onFilter: (value, record) => record.name_of_Employee === value,
      render: (text) => <span style={{ overflowWrap: 'anywhere' }}>{text}</span>,
    },
    {
      title: 'Employee Code',
      dataIndex: 'emp_Code',
      key: 'emp_Code',
      filterDropdown: getStringFilterDropdown(locations, 'emp_Code'),
      onFilter: (value, record) => record.emp_Code === value,
      width: 300,
      ellipsis: true,
    },
    {
      title: 'Employee Email ID',
      dataIndex: 'e_MAIL_ID',
      key: 'e_MAIL_ID',
      filterDropdown: getStringFilterDropdown(locations, 'e_MAIL_ID'),
      onFilter: (value, record) => record.e_MAIL_ID === value,
      width: 300,
      ellipsis: true,
      render: (t) => <span style={{ overflowWrap: 'anywhere' }}>{t}</span>,
    },
    {
      title: 'Mobile',
      dataIndex: 'contacT_NO',
      key: 'contacT_NO',
      filterDropdown: getStringFilterDropdown(locations, 'contacT_NO'),
      onFilter: (value, record) => record.contacT_NO === value,
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Date Of Joining',
      dataIndex: 'd_O_J_',
      key: 'd_O_J_',
      filterDropdown: getStringFilterDropdown(locations, 'd_O_J_'),
      onFilter: (value, record) => record.d_O_J_ === value,
      render: (date) => <span>{date ? String(date).split('T')[0] : '-'}</span>,
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Designation',
      dataIndex: 'desG_',
      key: 'desG_',
      filterDropdown: getStringFilterDropdown(locations, 'desG_'),
      onFilter: (value, record) => record.desG_ === value,
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Department',
      dataIndex: 'deptsno',
      key: 'deptsno',
      filterDropdown: getStringFilterDropdown(locations, 'deptsno'),
      onFilter: (value, record) => record.deptsno === value,
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      filters: [...new Set(locations.map((item) => item.company))].map((company) => ({
        text: company,
        value: company,
      })),
      onFilter: (value, record) => record.company === value,
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Location',
      dataIndex: 'loc',
      key: 'loc',
      width: 150,
      ellipsis: true,
      filters: [...new Set(locations.map((item) => item.loc))].map((loc) => ({
        text: loc,
        value: loc,
      })),
      onFilter: (value, record) => record.loc === value,
    },
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
      width: 130,
      ellipsis: true,
      filters: [...new Set(locations.map((item) => item.region))].map((region) => ({
        text: region,
        value: region,
      })),
      onFilter: (value, record) => record.region === value,
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      width: 100,
      ellipsis: true,
      filters: [...new Set(locations.map((item) => item.grade))].map((grade) => ({
        text: grade,
        value: grade,
      })),
      onFilter: (value, record) => record.grade === value,
    },
    {
      title: 'Reporting Mng Name',
      dataIndex: 'reportinG_MANAGER_NM',
      key: 'reportinG_MANAGER_NM',
      width: 300,
      ellipsis: true,
      filterDropdown: getStringFilterDropdown(locations, 'reportinG_MANAGER_NM'),
      onFilter: (value, record) => record.reportinG_MANAGER_NM === value,
      render: (t) => <span style={{ overflowWrap: 'anywhere' }}>{t}</span>,
    },
    {
      title: 'Reporting Mng Email',
      dataIndex: 'reportinG_MANAGER_MAIL_ID',
      key: 'reportinG_MANAGER_MAIL_ID',
      width: 300,
      filterDropdown: getStringFilterDropdown(locations, 'reportinG_MANAGER_MAIL_ID'),
      onFilter: (value, record) => record.reportinG_MANAGER_MAIL_ID === value,
      ellipsis: true,
      render: (t) => <span style={{ overflowWrap: 'anywhere' }}>{t}</span>,
    },
    {
      title: 'Reporting Mng Mobile',
      dataIndex: 'reportinG_MANAGER_CONTACT_NO',
      key: 'reportinG_MANAGER_CONTACT_NO',
      width: 300,
      ellipsis: true,
      filterDropdown: getStringFilterDropdown(locations, 'reportinG_MANAGER_CONTACT_NO'),
      onFilter: (value, record) => record.reportinG_MANAGER_CONTACT_NO === value,
    },
    {
      title: 'Reporting Mng Desg',
      dataIndex: 'reporting_MANAGER_DESG',
      key: 'reporting_MANAGER_DESG',
      width: 300,
      ellipsis: true,
      filterDropdown: getStringFilterDropdown(locations, 'reporting_MANAGER_DESG'),
      onFilter: (value, record) => record.reporting_MANAGER_DESG === value,
    },
  ]

  const columnWidth = columns.reduce((acc, row) => acc + (row.width || 120), 0)

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
  }

  const handleSearch = (e) => setSearchQuery(e.target.value)

  // ---------- Mobile card rendering ----------
  const rowKey = (r, i) => r?.emp_Code || r?.e_MAIL_ID || r?.name_of_Employee || r?.loc || `${i}`

  const [mobilePage, setMobilePage] = useState(1)
  const [mobilePageSize, setMobilePageSize] = useState(8)
  useEffect(() => setMobilePage(1), [filteredLocations])

  const mobileStart = (mobilePage - 1) * mobilePageSize
  const mobileData = filteredLocations.slice(mobileStart, mobileStart + mobilePageSize)

  const Field = ({ label, value }) => (
    <div style={{ marginBottom: 6 }}>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {label}
      </Text>
      <div style={{ fontWeight: 500, overflowWrap: 'anywhere' }}>{value || '-'}</div>
    </div>
  )

  const MobileCard = (item, idx) => (
    <Card
      key={rowKey(item, idx)}
      size="small"
      bodyStyle={{ padding: 12 }}
      style={{ borderRadius: 10 }}
    >
      <Row gutter={[8, 6]}>
        <Col span={24}>
          <Field label="Employee Name" value={item?.name_of_Employee} />
        </Col>
        <Col span={12}>
          <Field label="E-Code" value={item?.emp_Code} />
        </Col>
        <Col span={12}>
          <Field label="Mobile" value={item?.contacT_NO} />
        </Col>
        <Col span={24}>
          <Field label="Email" value={item?.e_MAIL_ID} />
        </Col>
        <Col span={12}>
          <Field label="DOJ" value={item?.d_O_J_ ? String(item.d_O_J_)?.split('T')[0] : '-'} />
        </Col>
        <Col span={12}>
          <Field label="Designation" value={item?.desG_} />
        </Col>
        <Col span={12}>
          <Field label="Department" value={item?.deptsno} />
        </Col>
        <Col span={12}>
          <Field label="Company" value={item?.company} />
        </Col>
        <Col span={12}>
          <Field label="Location" value={item?.loc} />
        </Col>
        <Col span={12}>
          <Field label="Region" value={item?.region} />
        </Col>
        <Col span={12}>
          <Field label="Grade" value={item?.grade} />
        </Col>
        <Col span={24}>
          <Field label="RM Name" value={item?.reportinG_MANAGER_NM} />
        </Col>
        <Col span={24}>
          <Field label="RM Email" value={item?.reportinG_MANAGER_MAIL_ID} />
        </Col>
        <Col span={12}>
          <Field label="RM Mobile" value={item?.reportinG_MANAGER_CONTACT_NO} />
        </Col>
        <Col span={12}>
          <Field label="RM Desg" value={item?.reporting_MANAGER_DESG} />
        </Col>
      </Row>
    </Card>
  )

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      <div className="def" style={{ paddingBottom: 10 }}>
        <TableBulkActionIcons
          setimportExelModal={setimportExelModal}
          totalRecords={totalRecords}
          selectedRowKeys={selectedRowKeys}
          handleSearch={handleSearch}
          actionsMap={actionsMap}
          searchQuery={searchQuery}
          isMobile={isMobile}
        />

        {!isMobile ? (
          <Table
            rowKey={(record, index) => rowKey(record, index)}
            rowSelection={{ type: selectionType, ...rowSelection }}
            tableLayout="auto"
            columns={columns}
            pagination={{
              current: currentPage,
              total: totalRecords,
              position: ['bottomRight'],
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '35', '50', '100'],
              onChange: handleTableChange,
            }}
            dataSource={filteredLocations}
            bordered
            loading={loading}
            scroll={{ x: columnWidth, y: 'calc(100vh - 100px)' }}
            style={{ whiteSpace: 'nowrap' }}
            className="custom-scrollbar"
          />
        ) : (
          <div>
            <div
              style={{
                backgroundColor: '#fafafa',
                borderRadius: '8px 8px 0 0',
                border: '1px solid #d9d9d9',
                borderBottom: '2px solid #1890ff',
                position: 'sticky',
                top: 0,
                zIndex: 100,
              }}
            >
              <table
                style={{
                  width: '100%',
                  tableLayout: 'fixed',
                  borderCollapse: 'collapse',
                  fontSize: 11,
                }}
              >
                <colgroup>
                  <col style={{ width: '30%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Name
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      E-Code
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Mobile
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Action
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            {mobileData.map((record, idx) => {
              const recordId = rowKey(record, idx)
              const isExpanded = expandedCards[recordId]

              return (
                <div
                  key={recordId}
                  style={{ border: '1px solid #d9d9d9', borderTop: 'none', background: '#fff' }}
                >
                  <table
                    style={{
                      width: '100%',
                      tableLayout: 'fixed',
                      borderCollapse: 'collapse',
                      fontSize: 11,
                    }}
                  >
                    <colgroup>
                      <col style={{ width: '30%' }} />
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '20%' }} />
                    </colgroup>
                    <tbody>
                      <tr>
                        <td
                          style={{
                            padding: '8px 4px',
                            textAlign: 'center',
                            fontSize: 9,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {record?.name_of_Employee || '-'}
                        </td>
                        <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: 10 }}>
                          {record?.emp_Code || '-'}
                        </td>
                        <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: 10 }}>
                          {record?.contacT_NO || '-'}
                        </td>
                        <td
                          style={{
                            padding: '8px 4px',
                            textAlign: 'center',
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Button
                            type="text"
                            size="small"
                            icon={isExpanded ? <MinusOutlined /> : <PlusOutlined />}
                            onClick={() => handleToggleCard(recordId)}
                            style={{ padding: '2px 4px', fontSize: 10 }}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {isExpanded && (
                    <div
                      style={{
                        padding: 8,
                        background: '#fafafa',
                        borderTop: '1px solid #e8e8e8',
                        fontSize: 10,
                      }}
                    >
                      <Row gutter={[4, 6]}>
                        {/* Row 1 */}
                        <Col span={24}>
                          <div
                            style={{
                              color: '#8c8c8c',
                              marginBottom: 2,
                              fontSize: 9,
                              textAlign: 'center',
                            }}
                          >
                            Email
                          </div>
                          <div
                            style={{
                              fontWeight: 500,
                              fontSize: 8,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              textAlign: 'center',
                            }}
                          >
                            {record?.e_MAIL_ID || '-'}
                          </div>
                        </Col>

                        {/* Row 2 */}
                        <Col span={8}>
                          <div
                            style={{
                              color: '#8c8c8c',
                              marginBottom: 2,
                              fontSize: 9,
                              textAlign: 'center',
                            }}
                          >
                            DOJ
                          </div>
                          <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
                            {record?.d_O_J_ ? String(record.d_O_J_).split('T')[0] : '-'}
                          </div>
                        </Col>
                        <Col span={8}>
                          <div
                            style={{
                              color: '#8c8c8c',
                              marginBottom: 2,
                              fontSize: 9,
                              textAlign: 'center',
                            }}
                          >
                            Designation
                          </div>
                          <div
                            style={{
                              fontWeight: 500,
                              fontSize: 9,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              textAlign: 'center',
                            }}
                          >
                            {record?.desG_ || '-'}
                          </div>
                        </Col>
                        <Col span={8}>
                          <div
                            style={{
                              color: '#8c8c8c',
                              marginBottom: 2,
                              fontSize: 9,
                              textAlign: 'center',
                            }}
                          >
                            Department
                          </div>
                          <div
                            style={{
                              fontWeight: 500,
                              fontSize: 9,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              textAlign: 'center',
                            }}
                          >
                            {record?.deptsno || '-'}
                          </div>
                        </Col>

                        {/* Row 3 */}
                        <Col span={8}>
                          <div
                            style={{
                              color: '#8c8c8c',
                              marginBottom: 2,
                              fontSize: 9,
                              textAlign: 'center',
                            }}
                          >
                            Company
                          </div>
                          <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
                            {record?.company || '-'}
                          </div>
                        </Col>
                        <Col span={8}>
                          <div
                            style={{
                              color: '#8c8c8c',
                              marginBottom: 2,
                              fontSize: 9,
                              textAlign: 'center',
                            }}
                          >
                            Location
                          </div>
                          <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
                            {record?.loc || '-'}
                          </div>
                        </Col>
                        <Col span={8}>
                          <div
                            style={{
                              color: '#8c8c8c',
                              marginBottom: 2,
                              fontSize: 9,
                              textAlign: 'center',
                            }}
                          >
                            Region
                          </div>
                          <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
                            {record?.region || '-'}
                          </div>
                        </Col>

                        {/* Row 4 - RM Details */}
                        <Col span={24}>
                          <div
                            style={{
                              color: '#8c8c8c',
                              marginBottom: 2,
                              fontSize: 9,
                              textAlign: 'center',
                            }}
                          >
                            RM Name
                          </div>
                          <div
                            style={{
                              fontWeight: 500,
                              fontSize: 9,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              textAlign: 'center',
                            }}
                          >
                            {record?.reportinG_MANAGER_NM || '-'}
                          </div>
                        </Col>
                        <Col span={12}>
                          <div
                            style={{
                              color: '#8c8c8c',
                              marginBottom: 2,
                              fontSize: 9,
                              textAlign: 'center',
                            }}
                          >
                            RM Mobile
                          </div>
                          <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
                            {record?.reportinG_MANAGER_CONTACT_NO || '-'}
                          </div>
                        </Col>
                        <Col span={12}>
                          <div
                            style={{
                              color: '#8c8c8c',
                              marginBottom: 2,
                              fontSize: 9,
                              textAlign: 'center',
                            }}
                          >
                            RM Desg
                          </div>
                          <div
                            style={{
                              fontWeight: 500,
                              fontSize: 9,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              textAlign: 'center',
                            }}
                          >
                            {record?.reporting_MANAGER_DESG || '-'}
                          </div>
                        </Col>
                      </Row>
                    </div>
                  )}
                </div>
              )
            })}

            <div
              style={{
                marginTop: 16,
                textAlign: 'center',
                padding: 12,
                background: '#fafafa',
                border: '1px solid #d9d9d9',
                borderRadius: 4,
              }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ fontSize: 12 }}>
                  Showing {mobileStart + 1} -{' '}
                  {Math.min(mobileStart + mobilePageSize, filteredLocations.length)} of{' '}
                  {filteredLocations.length} items
                </div>
                <Space>
                  <Button
                    size="small"
                    disabled={mobilePage === 1}
                    onClick={() => setMobilePage(mobilePage - 1)}
                  >
                    Previous
                  </Button>
                  <span style={{ fontSize: 12 }}>
                    Page {mobilePage} of {Math.ceil(filteredLocations.length / mobilePageSize)}
                  </span>
                  <Button
                    size="small"
                    disabled={mobilePage >= Math.ceil(filteredLocations.length / mobilePageSize)}
                    onClick={() => setMobilePage(mobilePage + 1)}
                  >
                    Next
                  </Button>
                </Space>
              </Space>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const TableBulkActionIcons = ({
  setimportExelModal,
  totalRecords,
  selectedRowKeys,
  handleSearch,
  actionsMap,
  searchQuery,
  isMobile,
}) => {
  const [statusSummary, setstatusSummary] = useState([
    {
      name: 'Total Rows',
      label: 'Total Records',
      count: 0,
      color: 'green',
      id: [1, 2, 3, 4, 5],
    },
    { name: 'Selected Rows', label: 'Selected', count: 0, color: 'blue', id: [7] },
  ])

  useEffect(() => {
    setstatusSummary((prev) => [
      { ...prev[0], count: totalRecords },
      { ...prev[1], count: selectedRowKeys.length },
    ])
  }, [selectedRowKeys, totalRecords])

  const downloadStoreDataAsExcel = async () => {
    const res = await getStoreLocationMaster()
    const storeData = res?.data?.data

    if (!storeData || !Array.isArray(storeData)) {
      message.error('No data to export')
      return
    }

    const worksheet = XLSX.utils.json_to_sheet(storeData)

    // Auto width by content
    const objectMaxLength = []
    storeData.forEach((row) => {
      Object.values(row).forEach((val, i) => {
        const length = val ? val.toString().length : 0
        objectMaxLength[i] = Math.max(objectMaxLength[i] || 10, length + 2)
      })
    })
    worksheet['!cols'] = objectMaxLength.map((width) => ({ wch: width }))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Seat Data')

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(file, 'Seat.xlsx')
  }

  return (
    <div
      style={{
        padding: 5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      {/* <Space wrap>
        {statusSummary.map(({ name, label, count }, index) => (
          <div
            key={index}
            style={{
              border: '2px solid #ccc',
              padding: '4px 8px',
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'center',
              maxWidth: isMobile ? 140 : 'none',
            }}
          >
            <Tooltip placement="top" title={label}>
              <span
                style={{
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {count} {name}
              </span>
            </Tooltip>
          </div>
        ))}
      </Space> */}

      <Space
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'end' }}
      >
        {actionsMap?.export?.actionStatus && (
          <Tooltip placement="top" title={'Export'}>
            <Button onClick={downloadStoreDataAsExcel} icon={<ExportOutlined />} block={isMobile}>
              {!isMobile ? 'Export' : null}
            </Button>
          </Tooltip>
        )}
        <Search
          placeholder="Search in table..."
          allowClear
          onChange={handleSearch}
          style={{ width: '100%' }}
          value={searchQuery}
        />
      </Space>
    </div>
  )
}

export default SeatMaster
