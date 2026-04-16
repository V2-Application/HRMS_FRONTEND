import React, { useEffect, useState, useCallback } from 'react' // ADD useCallback
import {
  Space,
  Table,
  Row,
  Input,
  Tooltip,
  Button,
  Col,
  message,
  Dropdown,
  Modal,
  Descriptions,
  Checkbox,
} from 'antd'
import { ExportOutlined, UploadOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import Pageheading from '../../components/shared/Pageheading'
import 'antd/dist/reset.css'
import { getProfileUpdateApplications, profileUpdateDifferenceView } from '../../services/Services'
import { set } from '../../redux/uiSlice'
import { useLocation } from 'react-router-dom'

const { Search } = Input

// Simple responsive hook
const useIsMobile = (query = '(max-width: 768px)') => {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e) => setIsMobile(e.matches)
    setIsMobile(mq.matches)
    try {
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } catch {
      mq.addListener(handler)
      return () => mq.removeListener(handler)
    }
  }, [query])
  return isMobile
}

const SalarySummery = () => {
  const isMobile = useIsMobile()
  const { pathname } = useLocation()
  const [selectionType, setSelectionType] = useState('checkbox')
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [totalCount, setTotalCount] = useState(0)
  const [importExelModal, setimportExelModal] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [search, setSearch] = useState('')
  const dispatch = useDispatch()
  const { loading, theme } = useSelector((state) => state.ui)
  const [lodingLocal, setlodingLocal] = useState(false)
  const [visible, setVisible] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState([])
  const { filteredSideMenu } = useSelector((state) => state?.auth || {})
  const [actionsMap, setActionsMap] = useState({})
  const [expandedCards, setExpandedCards] = useState({})

  const handleToggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const columns = [
    {
      title: 'Employee Name',
      dataIndex: 'firstName',
      key: 'firstName',
      render: (text, record) => (
        <span>
          {record.firstName} {record.middleName} {record.lastName}
        </span>
      ),
      width: 220,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 160,
    },
    {
      title: 'Reporting Head',
      dataIndex: 'reportingHeadName',
      key: 'reportingHeadName',
      width: 180,
    },
    {
      title: 'Current Email',
      dataIndex: 'emailAddress',
      key: 'emailAddress',
      width: 220,
    },
    {
      title: 'Current Phone',
      dataIndex: 'mobile',
      key: 'mobile',
      width: 160,
    },
  ]

  actionsMap?.view?.actionStatus &&
    columns.push({
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Button type="primary" onClick={() => showModal(record)} disabled>
          View Update
        </Button>
      ),
      width: 150,
      fixed: 'right',
    })

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const handleOk = () => setVisible(false)
  const handleCancel = () => setVisible(false)

  const showModal = async (record) => {
    const response = await profileUpdateDifferenceView(record.employeeId)
    if (response.status === 200) {
      setSelectedRequest({ ...record, updatedFields: response?.data?.data })
      setVisible(true)
    } else {
      toast.error('Failed to fetch profile update details')
    }
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await getProfileUpdateApplications()
      if (response.status === 200) {
        setTotalCount(response?.data?.data?.length || 0)
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

  const handleSearch = (e) => setSearch(e.target.value)

  useEffect(() => {
    if (!Array.isArray(filteredSideMenu) || filteredSideMenu.length === 0) return
    const data = filteredSideMenu
      .flatMap((group) => group.items || [])
      .filter((item) => item?.to === pathname)

    const norm = (s = '') => (s + '').trim().toLowerCase()
    const actionsDetailTemp = new Map()

    for (const item of data) {
      for (const a of item?.actions || []) {
        const key = norm(a?.actionName || String(a?.actionIds?.[0] || ''))
        if (!key) continue

        if (!actionsDetailTemp.has(key)) {
          actionsDetailTemp.set(key, {
            actionName: a.actionName || '',
            actionIds: new Set(a.actionIds || []),
            actionStatus: !!a.actionStatus,
            furtherPartsMap: new Map(),
          })
          for (const fp of a.furtherParts || []) {
            const fpId = fp?.actionFurtherPartId ?? null
            const fpName = fp?.actionFurtherPartName ?? (typeof fp === 'string' ? fp : null)
            const fpKey =
              fpId !== null
                ? String(fpId)
                : fpName
                  ? String(fpName).trim().toLowerCase()
                  : JSON.stringify(fp)
            actionsDetailTemp.get(key).furtherPartsMap.set(fpKey, fp)
          }
        } else {
          const existing = actionsDetailTemp.get(key)
          for (const id of a.actionIds || []) existing.actionIds.add(id)
          existing.actionStatus = existing.actionStatus || !!a.actionStatus
          for (const fp of a.furtherParts || []) {
            const fpId = fp?.actionFurtherPartId ?? null
            const fpName = fp?.actionFurtherPartName ?? (typeof fp === 'string' ? fp : null)
            const fpKey =
              fpId !== null
                ? String(fpId)
                : fpName
                  ? String(fpName).trim().toLowerCase()
                  : JSON.stringify(fp)
            if (!existing.furtherPartsMap.has(fpKey)) existing.furtherPartsMap.set(fpKey, fp)
            else {
              const exFp = existing.furtherPartsMap.get(fpKey)
              if (
                exFp &&
                typeof exFp.furtherPartStatus !== 'undefined' &&
                typeof fp.furtherPartStatus !== 'undefined'
              ) {
                exFp.furtherPartStatus = exFp.furtherPartStatus || fp.furtherPartStatus
                existing.furtherPartsMap.set(fpKey, exFp)
              }
            }
          }
        }
      }
    }

    const actionsDetailMap = {}
    for (const [k, v] of actionsDetailTemp) {
      actionsDetailMap[k] = {
        actionName: v.actionName,
        actionIds: Array.from(v.actionIds),
        actionStatus: !!v.actionStatus,
        furtherParts: Array.from(v.furtherPartsMap.values()),
      }
    }
    setActionsMap(actionsDetailMap)
  }, [filteredSideMenu, pathname])

  return (
    <>
      <Pageheading title="Profile Update Applications" />

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      <div
        className="def"
        style={{
          paddingBottom: 10,
          paddingLeft: isMobile ? 8 : 0,
          paddingRight: isMobile ? 8 : 0,
        }}
      >
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
          isMobile={isMobile}
        />

        {!isMobile ? (
          <Table
            rowKey="employeeId"
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
            bordered
            scroll={{ x: 'max-content', y: 'calc(100vh - 160px)' }}
            style={{ whiteSpace: 'nowrap' }}
            className={theme === 'dark' ? 'dark-theme' : ''}
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
                  <col style={{ width: '40%' }} />
                  <col style={{ width: '30%' }} />
                  <col style={{ width: '30%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Employee
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Department
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Action
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            {filteredData
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((record) => {
                const isExpanded = expandedCards[record.employeeId]
                const fullName =
                  `${record.firstName || ''} ${record.middleName || ''} ${record.lastName || ''}`.trim()

                return (
                  <div
                    key={record.employeeId}
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
                        <col style={{ width: '40%' }} />
                        <col style={{ width: '30%' }} />
                        <col style={{ width: '30%' }} />
                      </colgroup>
                      <tbody>
                        <tr>
                          <td
                            style={{
                              padding: '8px 4px',
                              textAlign: 'center',
                              fontSize: 10,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {fullName || '-'}
                          </td>
                          <td
                            style={{
                              padding: '8px 4px',
                              textAlign: 'center',
                              fontSize: 10,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {record.department || '-'}
                          </td>
                          <td
                            style={{
                              padding: '8px 4px',
                              textAlign: 'center',
                              display: 'flex',
                              gap: 4,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            {actionsMap?.view?.actionStatus && (
                              <Button
                                type="primary"
                                size="small"
                                onClick={() => showModal(record)}
                                disabled
                              >
                                View
                              </Button>
                            )}
                            <Button
                              type="text"
                              size="small"
                              icon={isExpanded ? <MinusOutlined /> : <PlusOutlined />}
                              onClick={() => handleToggleCard(record.employeeId)}
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
                          <Col span={8}>
                            <div
                              style={{
                                color: '#8c8c8c',
                                marginBottom: 2,
                                fontSize: 9,
                                textAlign: 'center',
                              }}
                            >
                              Reporting Head
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
                              {record.reportingHeadName || '-'}
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
                              Email
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
                              {record.emailAddress || '-'}
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
                              Phone
                            </div>
                            <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
                              {record.mobile || '-'}
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
                  Showing {(currentPage - 1) * pageSize + 1} -{' '}
                  {Math.min(currentPage * pageSize, totalCount)} of {totalCount} items
                </div>
                <Space>
                  <Button
                    size="small"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span style={{ fontSize: 12 }}>
                    Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                  </span>
                  <Button
                    size="small"
                    disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </Space>
              </Space>
            </div>
          </div>
        )}
      </div>

      <Modal
        title="Field Value Comparison"
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={isMobile ? '95vw' : 1200}
        centered
        bodyStyle={{ padding: isMobile ? 12 : 24 }}
      >
        <DynamicFieldComparison selectedRequest={selectedRequest} isMobile={isMobile} />
      </Modal>
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
  isMobile,
}) => {
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

  const downloadStoreDataAsExcel = async () => {
    // wire up your export here
    try {
      setlodingLocal(true)
    } catch (error) {
    } finally {
      setlodingLocal(false)
    }
  }

  return (
    <div
      style={{
        padding: isMobile ? 4 : 5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        flexWrap: 'wrap',
        gap: isMobile ? 8 : 10,
        flexDirection: isMobile ? 'column' : 'row',
      }}
    >
      <Space wrap>
        {statusSummary.map(({ name, label, count }, index) => (
          <div
            key={index}
            style={{
              border: '2px solid #ccc',
              padding: 3,
              borderRadius: 10,
              display: 'flex',
              justifyContent: 'center',
            }}
            className={theme === 'dark' ? 'dark-theme' : ''}
          >
            <span
              style={{
                display: 'inline-block',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                fontSize: 12,
                padding: '0 8px',
              }}
            >
              {count} {name}
            </span>
          </div>
        ))}
      </Space>

      <Row
        gutter={[8, 8]}
        style={{ width: isMobile ? '100%' : 'auto' }}
        align="middle"
        justify={isMobile ? 'space-between' : 'end'}
      >
        <Col>
          {actionsMap?.export?.actionStatus && (
            <Tooltip placement="top" title={'Export'}>
              <Button
                style={{ marginLeft: isMobile ? 0 : 5 }}
                loading={lodingLocal}
                onClick={downloadStoreDataAsExcel}
                block={isMobile}
              >
                <ExportOutlined />
              </Button>
            </Tooltip>
          )}
        </Col>
        <Col flex={isMobile ? '1 1 auto' : undefined}>
          <Search
            placeholder="Search by ecode..."
            allowClear
            onChange={handleSearch}
            value={search}
            style={{ width: isMobile ? '100%' : 300, marginLeft: isMobile ? 0 : 5 }}
            size={isMobile ? 'middle' : 'large'}
          />
        </Col>
      </Row>
    </div>
  )
}

const DynamicFieldComparison = ({ selectedRequest, isMobile }) => {
  const dataz = selectedRequest?.updatedFields?.employeeDetailsForUpdate || []
  const documentDetails = selectedRequest?.updatedFields?.documentsDetailsForUpdate || []

  const initialData = dataz?.map((item, index) => ({
    ...item,
    key: item.key || index,
    selected: false,
  }))

  const [data, setData] = useState(initialData)

  const onSelectChange = (key, checked) => {
    const newData = data.map((item) => (item.key === key ? { ...item, selected: checked } : item))
    setData(newData)
  }

  const handleSelectAll = (checked) => {
    const newData = data.map((item) => ({ ...item, selected: checked }))
    setData(newData)
  }

  const handleBulkAction = (type) => {
    // implement your bulk approve/reject here using `data.filter(d => d.selected)`
    message.success(
      type === 'approve' ? 'Selected fields approved (demo).' : 'Selected fields rejected (demo).',
    )
  }

  const columns = [
    {
      title: (
        <Checkbox
          checked={data.length > 0 && data.every((item) => item.selected)}
          indeterminate={data.some((item) => item.selected) && !data.every((item) => item.selected)}
          onChange={(e) => handleSelectAll(e.target.checked)}
          aria-label="Select all fields"
        />
      ),
      dataIndex: 'selected',
      key: 'selected',
      width: 70,
      render: (selected, record) => (
        <Checkbox
          checked={selected}
          onChange={(e) => onSelectChange(record.key, e.target.checked)}
          aria-label={`Select field ${record.fieldName}`}
        />
      ),
      align: 'center',
      fixed: 'left',
    },
    {
      title: 'Field Name',
      dataIndex: 'fieldName',
      key: 'fieldName',
      width: 200,
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Old Value',
      dataIndex: 'oldValue',
      key: 'oldValue',
      width: 240,
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'New Value',
      dataIndex: 'newValue',
      key: 'newValue',
      width: 240,
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'isApproved',
      key: 'isApproved',
      width: 140,
      render: (isApproved) => (
        <span style={{ color: isApproved ? 'green' : 'red' }}>
          {isApproved ? 'Approved' : 'Pending'}
        </span>
      ),
    },
    {
      title: 'Action',
      dataIndex: '',
      key: 'rowAction',
      width: 200,
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <span style={{ color: 'green', cursor: 'pointer' }}>
            <pre style={{ fontSize: 16, margin: 0 }}>&#x2713; Approve</pre>
          </span>
          <span style={{ color: 'red', cursor: 'pointer' }}>
            <pre style={{ fontSize: 16, margin: 0 }}>&#x292C; Reject</pre>
          </span>
        </div>
      ),
    },
  ]

  return (
    <div
      style={{
        margin: isMobile ? '8px auto' : '20px auto',
        padding: isMobile ? '0 8px' : '0 20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: isMobile ? 'stretch' : 'flex-end',
          gap: '10px',
          marginBottom: '10px',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <Button
          onClick={() => handleBulkAction('approve')}
          style={{ background: 'green', color: 'white' }}
          block={isMobile}
          size={isMobile ? 'middle' : 'large'}
        >
          ✓ Bulk Approve
        </Button>
        <Button
          onClick={() => handleBulkAction('reject')}
          style={{ background: 'red', color: 'white' }}
          block={isMobile}
          size={isMobile ? 'middle' : 'large'}
        >
          ✘ Bulk Reject
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        bordered={!isMobile}
        rowKey="key"
        aria-label="Field comparison table"
        // Keep ALL columns visible on mobile via horizontal scroll
        scroll={{ x: 'max-content', y: isMobile ? undefined : 'calc(100vh - 260px)' }}
        size={isMobile ? 'small' : 'middle'}
        style={{ whiteSpace: 'nowrap' }}
      />
    </div>
  )
}

export default SalarySummery
