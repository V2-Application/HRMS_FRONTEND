import React, { useEffect, useState, useCallback } from 'react'
import { Space, Table, Row, Input, Tooltip, Button, Col, message, Tag } from 'antd'
import { ExportOutlined, StepForwardOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { getEmployeeTransferList } from '../services/Services'
import { set } from '../redux/uiSlice'
import Pageheading from '../components/shared/Pageheading'
import ApproveModel from '../components/modals/ApproveModel'
import axiosInstance from '../services/axiosInstance'
import { useLocation } from 'react-router-dom'
import { exportExcelFromFrontend } from '../components/shared/ExportExceFromFrontend'
import EmpTransferApprovalModal from './EmpTransferApprovalModal'

const { Search } = Input

// --- Small responsive hook (no external deps) ---
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

const EmployeeTansferApprovals = () => {
  const isMobile = useIsMobile()
  const [expandedCards, setExpandedCards] = useState({})
  const { pathname } = useLocation()
  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [search, setSearch] = useState('')
  const dispatch = useDispatch()
  const { loading, theme } = useSelector((state) => state.ui)
  const { Location } = useSelector((state) => state?.dropdown?.response || {})
  const [lodingLocal, setlodingLocal] = useState(false)
  const [approveModel, setapproveModel] = useState(false)
  const [approvalContext, setApprovalContext] = useState({})
  const { filteredSideMenu } = useSelector((state) => state?.auth || {})
  const [actionsMap, setActionsMap] = useState({})
  const { employeeId, role } = useSelector((state) => state?.auth?.data)

  const handleToggleCard = useCallback((id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const openApprovalModal = (record, roleName) => {
    setApprovalContext({ record, role: roleName })
    setapproveModel(true)
  }

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await getEmployeeTransferList(employeeId, role)
      if (response?.status === 200) {
        setTotalCount(response?.data?.data?.length || 0)
        setEmployeesListData(response?.data?.data || [])
      } else {
        setEmployeesListData([])
      }
    } catch (error) {
      console.error('Error fetching transfer data:', error)
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
      setTotalCount(employeesListData?.length || 0)
      setFilteredData(employeesListData || [])
    }
  }, [search, employeesListData])

  // Build actions map from side menu (same logic as your original, condensed)
  useEffect(() => {
    if (!Array.isArray(filteredSideMenu) || filteredSideMenu.length === 0) return
    const items = filteredSideMenu.flatMap((g) => g.items || []).filter((i) => i?.to === pathname)
    const norm = (s = '') => (s + '').trim().toLowerCase()
    const temp = new Map()
    for (const it of items) {
      for (const a of it?.actions || []) {
        const k = norm(a?.actionName || String(a?.actionIds?.[0] || ''))
        if (!k) continue
        if (!temp.has(k)) {
          temp.set(k, {
            actionName: a.actionName || '',
            actionIds: new Set(a.actionIds || []),
            actionStatus: !!a.actionStatus,
            fps: new Map(),
          })
          for (const fp of a.furtherParts || []) {
            const id = fp?.actionFurtherPartId ?? null
            const nm = fp?.actionFurtherPartName ?? (typeof fp === 'string' ? fp : null)
            const key = id !== null ? String(id) : nm ? nm.trim().toLowerCase() : JSON.stringify(fp)
            temp.get(k).fps.set(key, fp)
          }
        } else {
          const ex = temp.get(k)
          for (const id of a.actionIds || []) ex.actionIds.add(id)
          ex.actionStatus = ex.actionStatus || !!a.actionStatus
          for (const fp of a.furtherParts || []) {
            const id = fp?.actionFurtherPartId ?? null
            const nm = fp?.actionFurtherPartName ?? (typeof fp === 'string' ? fp : null)
            const key = id !== null ? String(id) : nm ? nm.trim().toLowerCase() : JSON.stringify(fp)
            if (!ex.fps.has(key)) ex.fps.set(key, fp)
            else {
              const old = ex.fps.get(key)
              if (
                old &&
                typeof old.furtherPartStatus !== 'undefined' &&
                typeof fp.furtherPartStatus !== 'undefined'
              ) {
                old.furtherPartStatus = old.furtherPartStatus || fp.furtherPartStatus
                ex.fps.set(key, old)
              }
            }
          }
        }
      }
    }
    const map = {}
    for (const [k, v] of temp) {
      map[k] = {
        actionName: v.actionName,
        actionIds: Array.from(v.actionIds),
        actionStatus: !!v.actionStatus,
        furtherParts: Array.from(v.fps.values()),
      }
    }
    setActionsMap(map)
  }, [filteredSideMenu, pathname])

  const columns = [
    { title: 'E Code', dataIndex: 'ecode', key: 'ecode', width: 140, ellipsis: true },
    {
      title: 'Employee Name',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 180,
      ellipsis: true,
    },
    {
      title: 'From Location',
      dataIndex: 'baseLocation',
      key: 'baseLocation',
      width: 180,
      ellipsis: true,
    },
    {
      title: 'To Location',
      dataIndex: 'assignLocationName',
      key: 'assignLocationName',
      width: 180,
      ellipsis: true,
    },
    {
      title: 'From Date',
      dataIndex: 'assignedOnDate',
      key: 'assignedOnDate',
      width: 150,
      ellipsis: true,
      render: (date) => (date ? String(date).split('T')[0] : null),
    },
    {
      title: 'To Date',
      dataIndex: 'releasedOnDate',
      key: 'releasedOnDate',
      width: 150,
      ellipsis: true,
      render: (date) => (date ? String(date).split('T')[0] : null),
    },
    {
      title: 'Category',
      key: 'category',
      width: 180,
      ellipsis: true,
      render: (_, r) =>
        r?.permanentTransfer === true
          ? 'Permanent Transfer'
          : r?.temporaryTransfer === true
            ? 'Temporary Transfer'
            : '-',
    },
    {
      title: 'Reason',
      dataIndex: 'assignedReason',
      key: 'assignedReason',
      width: 200,
      ellipsis: true,
    },
    { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy', width: 200, ellipsis: true },
    {
      title: 'Created On',
      dataIndex: 'createdOn',
      key: 'createdOn',
      width: 150,
      ellipsis: true,
      render: (date) => (date ? String(date).split('T')[0] : null),
    },
    { title: 'Updated By', dataIndex: 'updatedBy', key: 'updatedBy', width: 200, ellipsis: true },
    {
      title: 'Updated On',
      dataIndex: 'updatedOn',
      key: 'updatedOn',
      width: 150,
      ellipsis: true,
      render: (date) => (date ? String(date).split('T')[0] : null),
    },
    {
      title: 'Report Head',
      key: 'isReportingHeadApproval',
      width: 150,
      ellipsis: true,
      render: (_, r) =>
        r?.isReportingHeadApproval === 1 ? (
          <Tag color="green">Approved</Tag>
        ) : r?.isReportingHeadApproval === 2 ? (
          <Tag color="red">Rejected</Tag>
        ) : (
          <Tag color="orange">Pending</Tag>
        ),
    },
    {
      title: 'HR Approval',
      key: 'isHRApproval',
      width: 150,
      ellipsis: true,
      render: (_, r) =>
        r?.isHRApproval === 1 ? (
          <Tag color="green">Approved</Tag>
        ) : r?.isHRApproval === 2 ? (
          <Tag color="red">Rejected</Tag>
        ) : (
          <Tag color="orange">Pending</Tag>
        ),
    },
  ]

  actionsMap?.approval?.actionStatus &&
    columns.push({
      title: 'Action',
      key: 'action',
      width: 120,
      ellipsis: true,
      fixed: 'right',
      render: (_, record) => {
        if (
          role !== 'HR' &&
          (record?.isReportingHeadApproval === 4 || record?.isReportingHeadApproval === null)
        ) {
          return (
            <Button
              danger
              icon={<StepForwardOutlined />}
              onClick={() => openApprovalModal(record, 'reportingHead')}
            />
          )
        }
        if (
          role === 'HR' &&
          record?.isReportingHeadApproval === 1 &&
          (record?.isHRApproval === 4 || record?.isHRApproval === null)
        ) {
          return (
            <Button
              danger
              icon={<StepForwardOutlined />}
              onClick={() => openApprovalModal(record, 'hr')}
            />
          )
        }
        return null
      },
    })

  const handleSearch = (e) => setSearch(e.target.value)

  const handleInitializeCandidate = async ({ selectedOption }) => {
    const { record, role: approverRole } = approvalContext
    const requestBody = {
      assignLocationHistoryId: parseInt(record?.assignLocationHistoryId),
      isReportingHeadApproval:
        approverRole === 'reportingHead' ? selectedOption : record?.isReportingHeadApproval,
      isHRApproval: approverRole === 'hr' ? selectedOption : record?.isHRApproval,
    }

    try {
      await dispatch(set({ loading: true }))
      const response = await axiosInstance.post(
        '/api/AssignLocation/Approveassignlocation',
        requestBody,
        {
          headers: { 'X-Updated-By': String(employeeId) },
        },
      )
      if (response?.status === 200) {
        message.success(response?.data?.message || 'Action Completed Successfully')
        fetchData()
      }
    } catch (error) {
      console.error('Error', error)
      message.error(error?.response?.data?.message || 'Action Failed')
    } finally {
      setapproveModel(false)
      dispatch(set({ loading: false }))
    }
  }

  return (
    <>
      <Pageheading title="Employee Transfer Approval List" />

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
          totalRecords={totalCount}
          selectedRowKeys={selectedRowKeys}
          handleSearch={handleSearch}
          lodingLocal={lodingLocal}
          setlodingLocal={setlodingLocal}
          search={search}
          data={filteredData}
          isMobile={isMobile}
        />

        {!isMobile ? (
          <Table
            rowKey="assignLocationHistoryId" // FIXED: was storeBudgetId
            columns={columns}
            dataSource={filteredData}
            bordered
            pagination={{
              current: currentPage,
              position: ['bottomRight'],
              total: totalCount,
              pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: handleTableChange,
            }}
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
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '30%' }} />
                  <col style={{ width: '30%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      E Code
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Employee
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Category
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
                const isExpanded = expandedCards[record.assignLocationHistoryId]
                const category = record?.permanentTransfer
                  ? 'Permanent Transfer'
                  : record?.temporaryTransfer
                    ? 'Temporary Transfer'
                    : '-'

                return (
                  <div
                    key={record.assignLocationHistoryId}
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
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '30%' }} />
                        <col style={{ width: '30%' }} />
                        <col style={{ width: '20%' }} />
                      </colgroup>
                      <tbody>
                        <tr>
                          <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                            {record.ecode || '-'}
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
                            {record.employeeName || '-'}
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
                            {category}
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
                            {actionsMap?.approval?.actionStatus &&
                              (role !== 'HR' &&
                              (record?.isReportingHeadApproval === 4 ||
                                record?.isReportingHeadApproval === null) ? (
                                <Button
                                  danger
                                  size="small"
                                  icon={<StepForwardOutlined />}
                                  onClick={() => openApprovalModal(record, 'reportingHead')}
                                />
                              ) : role === 'HR' &&
                                record?.isReportingHeadApproval === 1 &&
                                (record?.isHRApproval === 4 || record?.isHRApproval === null) ? (
                                <Button
                                  danger
                                  size="small"
                                  icon={<StepForwardOutlined />}
                                  onClick={() => openApprovalModal(record, 'hr')}
                                />
                              ) : null)}
                            <Button
                              type="text"
                              size="small"
                              icon={isExpanded ? <MinusOutlined /> : <PlusOutlined />}
                              onClick={() => handleToggleCard(record.assignLocationHistoryId)}
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
                          {/* Row 1 - 3 columns */}
                          <Col span={8}>
                            <div
                              style={{
                                color: '#8c8c8c',
                                marginBottom: 2,
                                fontSize: 9,
                                textAlign: 'center',
                              }}
                            >
                              From Location
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
                              {record.baseLocation || '-'}
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
                              To Location
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
                              {record.assignLocationName || '-'}
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
                              From Date
                            </div>
                            <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
                              {record.assignedOnDate
                                ? String(record.assignedOnDate).split('T')[0]
                                : '-'}
                            </div>
                          </Col>

                          {/* Row 2 - 3 columns */}
                          <Col span={8}>
                            <div
                              style={{
                                color: '#8c8c8c',
                                marginBottom: 2,
                                fontSize: 9,
                                textAlign: 'center',
                              }}
                            >
                              To Date
                            </div>
                            <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
                              {record.releasedOnDate
                                ? String(record.releasedOnDate).split('T')[0]
                                : '-'}
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
                              Report Head
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              {record?.isReportingHeadApproval === 1 ? (
                                <Tag color="green" style={{ fontSize: 9 }}>
                                  Approved
                                </Tag>
                              ) : record?.isReportingHeadApproval === 2 ? (
                                <Tag color="red" style={{ fontSize: 9 }}>
                                  Rejected
                                </Tag>
                              ) : (
                                <Tag color="orange" style={{ fontSize: 9 }}>
                                  Pending
                                </Tag>
                              )}
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
                              HR Approval
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              {record?.isHRApproval === 1 ? (
                                <Tag color="green" style={{ fontSize: 9 }}>
                                  Approved
                                </Tag>
                              ) : record?.isHRApproval === 2 ? (
                                <Tag color="red" style={{ fontSize: 9 }}>
                                  Rejected
                                </Tag>
                              ) : (
                                <Tag color="orange" style={{ fontSize: 9 }}>
                                  Pending
                                </Tag>
                              )}
                            </div>
                          </Col>

                          {/* Row 3 - Full width Reason */}
                          <Col span={24}>
                            <div
                              style={{
                                color: '#8c8c8c',
                                marginBottom: 2,
                                fontSize: 9,
                                textAlign: 'center',
                              }}
                            >
                              Reason
                            </div>
                            <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
                              {record.assignedReason || '-'}
                            </div>
                          </Col>

                          {/* Row 4 - 3 columns for audit info */}
                          <Col span={8}>
                            <div
                              style={{
                                color: '#8c8c8c',
                                marginBottom: 2,
                                fontSize: 9,
                                textAlign: 'center',
                              }}
                            >
                              Created By
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
                              {record.createdBy || '-'}
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
                              Created On
                            </div>
                            <div style={{ fontWeight: 500, fontSize: 9, textAlign: 'center' }}>
                              {record.createdOn ? String(record.createdOn).split('T')[0] : '-'}
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
                              Updated By
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
                              {record.updatedBy || '-'}
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

      <EmpTransferApprovalModal
        initiateModalOpen={approveModel}
        setInitiateModalOpen={setapproveModel}
        handleInitializeCandidate={handleInitializeCandidate}
        approvalContext={approvalContext}
        label="Approval Action"
      />
    </>
  )
}

const TableBulkActionIcons = ({
  totalRecords,
  selectedRowKeys,
  handleSearch,
  search,
  lodingLocal,
  setlodingLocal,
  data,
  isMobile,
}) => {
  const { theme } = useSelector((state) => state.ui)

  const [statusSummary, setstatusSummary] = useState([
    { name: 'Total Rows', label: 'Rows', count: 0, color: 'green' },
  ])

  useEffect(() => {
    setstatusSummary([{ name: 'Total Rows', label: 'Rows', count: totalRecords, color: 'green' }])
  }, [selectedRowKeys, totalRecords])

  const downloadStoreDataAsExcel = async () => {
    const columns = [
      { header: 'E Code', key: 'ecode' },
      { header: 'Employee Name', key: 'employeeName' },
      { header: 'From Location', key: 'baseLocation' },
      { header: 'To Location', key: 'assignLocationName' },
      { header: 'From Date', key: 'assignedOnDate' },
      { header: 'To Date', key: 'releasedOnDate' },
      { header: 'Category', key: 'category' },
      { header: 'Reason', key: 'assignedReason' },
      { header: 'Report Head Approval', key: 'isReportingHeadApproval' },
      { header: 'HR Approval', key: 'isHRApproval' },
    ]

    const formattedData = (data || []).map((d) => ({
      ecode: d?.ecode,
      ...d,
      assignedOnDate: d?.assignedOnDate ? d.assignedOnDate.split('T')[0] : '',
      releasedOnDate: d?.releasedOnDate ? d.releasedOnDate.split('T')[0] : '',
      category:
        d?.permanentTransfer === true
          ? 'Permanent Transfer'
          : d?.temporaryTransfer === true
            ? 'Temporary Transfer'
            : '',
      isReportingHeadApproval:
        d?.isReportingHeadApproval === 1
          ? 'Approved'
          : d?.isReportingHeadApproval === 2
            ? 'Rejected'
            : 'Pending',
      isHRApproval:
        d?.isHRApproval === 1 ? 'Approved' : d?.isHRApproval === 2 ? 'Rejected' : 'Pending',
    }))

    try {
      setlodingLocal(true)
      const res = exportExcelFromFrontend(columns, formattedData, 'EmployeeTransferApprovals.xlsx')
      if (res.success) message.success(res.message)
      else message.error(res.message)
    } catch (error) {
      console.error('export error', error)
      message.error('Export failed')
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
        {statusSummary.map(({ name, count }, idx) => (
          <div
            key={idx}
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
          <Tooltip placement="top" title="Export">
            <Button
              style={{ marginLeft: isMobile ? 0 : 5 }}
              loading={lodingLocal}
              onClick={downloadStoreDataAsExcel}
              block={isMobile}
            >
              <ExportOutlined />
            </Button>
          </Tooltip>
        </Col>
        <Col flex={isMobile ? '1 1 auto' : undefined}>
          <Search
            placeholder="Search in table..."
            allowClear
            onChange={handleSearch}
            value={search}
            style={{ width: isMobile ? '100%' : 300, marginLeft: isMobile ? 0 : 5 }}
          />
        </Col>
      </Row>
    </div>
  )
}

export default EmployeeTansferApprovals
