import React, { useEffect, useState, useRef, useReducer, useMemo } from 'react'
import {
  Space,
  Table,
  Tag,
  Row,
  Input,
  Tooltip,
  Button,
  Col,
  Card,
  Checkbox,
  Modal,
  Upload,
  Spin,
  List,
  Divider,
  Grid,
  message,
} from 'antd'
import {
  StepForwardOutlined,
  PlusOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  DownOutlined,
  UpOutlined,
  UploadOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  ImportOutlined,
} from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import ApproveModel from '../modals/ApproveModel'
import ResignationActionModal from './ResignationActionModal'
import {
  employeeResignationApprove,
  getMyResignationStatus,
  resignationLists,
  resignationListsExcel,
} from '../../services/Services'
import './ResignationApplications.css'
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../../redux/uiSlice'
import { Modal as AntdModal } from 'antd'
import { useActionsMap } from '../../utils/useActionsMap'
import { getApiError } from '../../VendorModule/helpers'

let debounceTimer
const { Search } = Input

const FilterDropdown = ({ dataIndex, dataList, filterValues, setFilterValues, confirm, title }) => {
  const [searchText, setSearchText] = useState('')
  const filteredOptions = dataList.filter((item) =>
    String(item).toLowerCase().includes(searchText.toLowerCase()),
  )
  const handleChange = (checkedValues) => setFilterValues(checkedValues)
  const handleReset = () => {
    setFilterValues([])
    setSearchText('')
    confirm()
  }

  return (
    <div style={{ padding: 8, width: 240 }}>
      <Input
        placeholder={`Search ${title}`}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 8, display: 'block' }}
      />
      <div style={{ maxHeight: 180, overflowY: 'auto', paddingRight: 8 }}>
        <Checkbox.Group
          value={filterValues}
          onChange={handleChange}
          style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          {filteredOptions.map((value) => (
            <Checkbox key={value} value={value}>
              {value}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>
      <Space style={{ marginTop: 8 }}>
        <Button type="primary" size="small" onClick={() => confirm()}>
          Filter
        </Button>
        <Button size="small" onClick={handleReset}>
          Reset
        </Button>
      </Space>
    </div>
  )
}

const ResignationStatus = () => {
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md

  const { employeeId, role } = useSelector((state) => state.auth.data)
  const addMorePdfInputRef = useRef(null)
  const [selectionType] = useState('checkbox')
  const [initiateModalOpen, setInitiateModalOpen] = useState(false)
  const [initiateModalOpen1, setInitiateModalOpen1] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [allApplicationList, setAllApplicationList] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [myfullResignationStatus, setmyfullResignationStatus] = useState([])
  const [myResignationStatus, setmyResignationStatus] = useState({})
  const [seprationid, setseprationid] = useState(null)
  const [isHistoryVisible, setIsHistoryVisible] = useState(false)
  const [searchText, setsearchText] = useState('')
  const [currentRowData, setCurrentRowData] = useState(null)

  const [ecodeFilterValues, setEcodeFilterValues] = useState([])
  const [nameFilterValues, setNameFilterValues] = useState([])
  const [emailFilterValues, setEmailFilterValues] = useState([])
  const [resignationTypeFilterValues, setResignationTypeFilterValues] = useState([])
  const [lastDayFilterValues, setLastDayFilterValues] = useState([])
  const [reportHeadEcodeFilterValues, setReportHeadEcodeFilterValues] = useState([])
  const [statusFilterValues, setStatusFilterValues] = useState([])

  const [fileList, setFileList] = useState([])
  const [previewVisible, setPreviewVisible] = useState(false)
  const [currentRow, setCurrentRow] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [uploadedRows, setUploadedRows] = useState({})
  const [modalPdfFile, setModalPdfFile] = useState(null)
  const [removeConfirm, setRemoveConfirm] = useState({ visible: false, fileIdx: null })
  const [_, forceUpdate] = useReducer((x) => x + 1, 0)
  const [pdfLoading, setPdfLoading] = useState(false)

  const { filteredSideMenu } = useSelector((state) => state?.auth)
  const actionsMap = useActionsMap(filteredSideMenu)
  const dispatch = useDispatch()
  const location = useLocation()

  useEffect(() => {
    localStorage.setItem('uploadedRows', JSON.stringify(uploadedRows))
  }, [uploadedRows])
  useEffect(() => {
    const saved = localStorage.getItem('uploadedRows')
    if (saved) setUploadedRows(JSON.parse(saved))
  }, [])

  const fetchMasterData = async (employeeId, pageSize, currentPage, searchText) => {
    try {
      setLoading(true)
      const res = await resignationLists(
        role === 'Master' ? '' : employeeId,
        pageSize,
        currentPage,
        searchText,
        role,
      )
      if (res?.status === 200) {
        const final_res = res.data.resignations
        setAllApplicationList(final_res || [])
        setTotalRecords(res.data.totalRecords || 0)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getMyresigStatus = async () => {
    try {
      const res = await getMyResignationStatus(employeeId)
      const final_res = res.data.data || []
      setmyfullResignationStatus(final_res)
      setmyResignationStatus(final_res[final_res.length - 1] || {})
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchMasterData(employeeId, pageSize, currentPage, searchText)
    getMyresigStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize, currentPage, searchText])

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const handleSearch = (e) => {
    const s = e.target.value.toLowerCase()
    setsearchText(s)
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      fetchMasterData(employeeId, pageSize, 1, s)
      setCurrentPage(1)
    }, 300)
  }

  // Upload logic
  const handleBeforeUpload = (files, record) => {
    setCurrentRow(record)
    setPreviewVisible(true)
    const pdfFiles = Array.isArray(files)
      ? files.filter((file) => file.type === 'application/pdf')
      : files?.type === 'application/pdf'
        ? [files]
        : []
    setFileList((prev) => {
      const newList = [...prev, ...pdfFiles]
      if (newList.length > 0) setModalPdfFile(newList[0])
      return newList
    })
    if (pdfFiles.length > 0) setPdfUrl(URL.createObjectURL(pdfFiles[0]))
    else setPdfUrl(null)
  }

  const handleOk = () => {
    if (currentRow && currentRow.employeeSeprationId && fileList.length > 0) {
      setUploadedRows((prev) => ({
        ...prev,
        [currentRow.employeeSeprationId]: {
          uploaded: true,
          pdfUrls: [
            ...(prev[currentRow.employeeSeprationId]?.pdfUrls || []),
            ...fileList
              .filter((f) => f.type === 'application/pdf')
              .map((f) => URL.createObjectURL(f)),
          ],
          fileList: [
            ...(prev[currentRow.employeeSeprationId]?.fileList || []),
            ...fileList.filter((f) => f.type === 'application/pdf'),
          ],
        },
      }))
    }
    // reset
    setFileList([])
    setPreviewVisible(false)
    setCurrentRow(null)
    setPdfUrl(null)
    setModalPdfFile(null)
  }

  const handleReopenPdf = (record) => {
    setCurrentRow(record)
    setPreviewVisible(true)
    setModalPdfFile(null)
    setFileList([])
  }

  const handleUploadCancel = () => {
    setFileList([])
    setPreviewVisible(false)
    setCurrentRow(null)
  }

  const handleRemoveUploadedFile = (employeeSeprationId) => {
    setUploadedRows((prev) => {
      const updated = { ...prev }
      delete updated[employeeSeprationId]
      return updated
    })
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // ===== Columns (kept on mobile; rely on horizontal scroll) =====
  const columns = useMemo(
    () => [
      {
        title: 'Ecode',
        dataIndex: 'ecode',
        key: 'ecode',
        render: (text) => (
          <Tooltip title={text}>
            <span>{text}</span>
          </Tooltip>
        ),
        filteredValue: ecodeFilterValues.length ? ecodeFilterValues : null,
        onFilter: () => true,
        filterDropdown: ({ confirm }) => (
          <FilterDropdown
            title="Ecode"
            dataIndex="reportHeadEcode"
            dataList={[...new Set(allApplicationList.map((i) => i.reportHeadEcode))].filter(
              Boolean,
            )}
            filterValues={ecodeFilterValues}
            setFilterValues={setEcodeFilterValues}
            confirm={confirm}
          />
        ),
        width: 150,
        ellipsis: true,
      },
      {
        title: 'Name',
        dataIndex: 'fullName',
        key: 'fullName',
        render: (text) => (
          <Tooltip title={text}>
            <span>{text}</span>
          </Tooltip>
        ),
        filteredValue: nameFilterValues.length ? nameFilterValues : null,
        onFilter: () => true,
        filterDropdown: ({ confirm }) => (
          <FilterDropdown
            title="Name"
            dataIndex="fullName"
            dataList={[...new Set(allApplicationList.map((i) => i.fullName))].filter(Boolean)}
            filterValues={setNameFilterValues}
            setFilterValues={setNameFilterValues}
            confirm={confirm}
          />
        ),
        width: 180,
        ellipsis: true,
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        render: (email) => (
          <Tooltip title={email}>
            <span>{email}</span>
          </Tooltip>
        ),
        filteredValue: emailFilterValues.length ? emailFilterValues : null,
        onFilter: () => true,
        filterDropdown: ({ confirm }) => (
          <FilterDropdown
            title="Email"
            dataIndex="email"
            dataList={[...new Set(allApplicationList.map((i) => i.email))].filter(Boolean)}
            filterValues={emailFilterValues}
            setFilterValues={setEmailFilterValues}
            confirm={confirm}
          />
        ),
        width: 220,
        ellipsis: true,
      },
      {
        title: 'Resignation Type',
        dataIndex: 'resignationType',
        key: 'resignationType',
        render: (resignationType) => (
          <Tooltip title={resignationType}>
            <span>{resignationType}</span>
          </Tooltip>
        ),
        filteredValue: resignationTypeFilterValues.length ? resignationTypeFilterValues : null,
        onFilter: () => true,
        filterDropdown: ({ confirm }) => (
          <FilterDropdown
            title="Resignation Type"
            dataIndex="resignationType"
            dataList={[...new Set(allApplicationList.map((i) => i.resignationType))].filter(
              Boolean,
            )}
            filterValues={resignationTypeFilterValues}
            setFilterValues={setResignationTypeFilterValues}
            confirm={confirm}
          />
        ),
        width: 170,
        ellipsis: true,
      },
      {
        title: 'Last Day',
        dataIndex: 'lastDay',
        key: 'lastDay',
        render: (lastDay) => (
          <Tooltip title={lastDay}>
            <span>{lastDay}</span>
          </Tooltip>
        ),
        filteredValue: lastDayFilterValues.length ? lastDayFilterValues : null,
        onFilter: () => true,
        filterDropdown: ({ confirm }) => (
          <FilterDropdown
            title="Last Day"
            dataIndex="lastDay"
            dataList={[...new Set(allApplicationList.map((i) => i.lastDay))].filter(Boolean)}
            filterValues={lastDayFilterValues}
            setFilterValues={setLastDayFilterValues}
            confirm={confirm}
          />
        ),
        width: 140,
        ellipsis: true,
      },
      {
        title: 'Report Head',
        dataIndex: 'reportHeadEcode',
        key: 'reportHeadEcode1',
        render: (val) => (
          <Tooltip title={val}>
            <span>{val}</span>
          </Tooltip>
        ),
        filteredValue: reportHeadEcodeFilterValues.length ? reportHeadEcodeFilterValues : null,
        onFilter: () => true,
        filterDropdown: ({ confirm }) => (
          <FilterDropdown
            title="R Head"
            dataIndex="reportHeadEcode"
            dataList={[...new Set(allApplicationList.map((i) => i.reportHeadEcode))].filter(
              Boolean,
            )}
            filterValues={reportHeadEcodeFilterValues}
            setFilterValues={setReportHeadEcodeFilterValues}
            confirm={confirm}
          />
        ),
        width: 140,
        ellipsis: true,
      },
      {
        title: 'Report Head Status',
        dataIndex: 'reportingHeadStatus',
        key: 'reportingHeadStatus',
        render: (s) => (
          <Tag
            color={
              s === 'Revoked'
                ? 'gold'
                : s === 'Approved'
                  ? 'green'
                  : s === 'Pending'
                    ? 'yellow'
                    : 'red'
            }
          >
            {s || '-'}
          </Tag>
        ),
        width: 170,
        ellipsis: true,
      },
      // {
      //   title: 'HR Status',
      //   dataIndex: 'reportHeadStatus',
      //   key: 'hrStatus',
      //   render: (s) => (
      //     <Tag
      //       color={
      //         s === 'Revoked'
      //           ? 'gold'
      //           : s === 'Approved'
      //             ? 'green'
      //             : s === 'Pending'
      //               ? 'yellow'
      //               : 'red'
      //       }
      //     >
      //       {s || '-'}
      //     </Tag>
      //   ),
      //   width: 130,
      //   ellipsis: true,
      // },
      {
        title: 'Status',
        dataIndex: 'reportingHeadStatus',
        key: 'reportingHeadStatus',
        render: (s) => (
          <Tag
            color={
              s === 'Revoked'
                ? 'gold'
                : s === 'Approved'
                  ? 'green'
                  : s === 'Pending'
                    ? 'yellow'
                    : 'red'
            }
          >
            {s || '-'}
          </Tag>
        ),
        filteredValue: statusFilterValues.length ? statusFilterValues : null,
        onFilter: () => true,
        filterDropdown: ({ confirm }) => (
          <FilterDropdown
            title="Status"
            dataIndex="status"
            dataList={[...new Set(allApplicationList.map((i) => i.status))].filter(Boolean)}
            filterValues={statusFilterValues}
            setFilterValues={setStatusFilterValues}
            confirm={confirm}
          />
        ),
        width: 130,
        ellipsis: true,
      },
      {
        title: 'Action',
        key: 'action',
        fixed: isMobile ? false : 'right',
        width: 140,
        render: (_, record) => (
          <Space size={isMobile ? 8 : 'middle'} wrap>
            {actionsMap?.view?.actionStatus && (
              <Tooltip title="View">
                <Link to={`/sepration/record_resignation/${record.employeeSeprationId}`}>
                  <EyeOutlined style={{ fontSize: 18 }} />
                </Link>
              </Tooltip>
            )}

            {actionsMap?.actions?.actionStatus &&
              location.pathname.includes('/sepration/resignation_applications') &&
              !record?.isApprovedByManager && (
                <Tooltip title="Initiate Action">
                  <StepForwardOutlined
                    style={{ fontSize: 18 }}
                    onClick={() => {
                      setInitiateModalOpen1(true)
                      setseprationid(record.employeeSeprationId)
                      setCurrentRowData(record)
                    }}
                  />
                </Tooltip>
              )}

            {/* {actionsMap?.upload?.actionStatus &&
              (uploadedRows[record.employeeSeprationId]?.uploaded ? (
                <Tooltip title="Uploaded">
                  <Button
                    className="upload-btn"
                    icon={<CheckOutlined />}
                    style={{ minWidth: 32, padding: 0 }}
                    onClick={() => handleReopenPdf(record)}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Upload">
                  <Upload
                    beforeUpload={() => false}
                    onChange={(info) =>
                      handleBeforeUpload(
                        info.fileList.map((f) => f.originFileObj),
                        record,
                      )
                    }
                    fileList={[]}
                    showUploadList={false}
                    id={`upload-input-${record.employeeSeprationId}`}
                    multiple
                  >
                    <Button
                      className="upload-btn"
                      icon={<UploadOutlined />}
                      style={{ minWidth: 32, padding: 0 }}
                    />
                  </Upload>
                </Tooltip>
              ))} */}
          </Space>
        ),
      },
    ],
    [
      allApplicationList,
      ecodeFilterValues,
      nameFilterValues,
      emailFilterValues,
      resignationTypeFilterValues,
      lastDayFilterValues,
      reportHeadEcodeFilterValues,
      statusFilterValues,
      uploadedRows,
      actionsMap,
      location.pathname,
      isMobile,
    ],
  )

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys),
  }

  const handleInitializeCandidate = async (val) => {
    const actionTypeMap = { 1: 'Approve', 2: 'Rejected', 3: 'Revoke' }
    try {
      await dispatch(set({ loading: true }))
      await employeeResignationApprove({
        employeeSeprationId: myResignationStatus.employeeSeprationId,
        actionType: actionTypeMap[val.selectedOption],
        userId: employeeId,
        remarks: val.remarks,
      })
      fetchMasterData(employeeId, pageSize, currentPage, searchText)
      getMyresigStatus()
    } catch (error) {
      console.error('Error', error)
    } finally {
      setInitiateModalOpen(false)
      dispatch(set({ loading: false }))
    }
  }

  // const handleInitializeCandidate1 = async (val) => {
  //   const actionTypeMap = { 1: 'Approve', 2: 'Rejected', 3: 'Revoke' }
  //   try {
  //     await dispatch(set({ loading: true }))
  //     await employeeResignationApprove({
  //       employeeSeprationId: seprationid,
  //       actionType: actionTypeMap[val.selectedOption],
  //       userId: employeeId,
  //       remarks: val.remarks,
  //     })
  //     fetchMasterData(employeeId, pageSize, currentPage, searchText)
  //   } catch (error) {
  //     console.error('Error', error?.response?.data)
  //   } finally {
  //     setInitiateModalOpen1(false)
  //     dispatch(set({ loading: false }))
  //   }
  // }

  const handleInitializeCandidate1 = async (val) => {
    const lastWorkingDay = val?.lastWorkingDay ? val?.lastWorkingDay?.format('YYYY-MM-DD') : null
    const actionTypeMap = { 1: 'Approve', 2: 'Rejected', 3: 'Revoke' }

    try {
      await dispatch(set({ loading: true }))
      const response = await employeeResignationApprove({
        employeeSeprationId: seprationid,
        actionType: actionTypeMap[val.selectedOption],
        userId: employeeId,
        remarks: val.remarks,
        lastDay: lastWorkingDay,
      })

      if (response.status === 200) {
        fetchMasterData(employeeId, pageSize, currentPage, searchText)
        setInitiateModalOpen1(false)
      }
    } catch (error) {
      console.error('Error', error)
      message.error(error?.response?.data || error?.response?.data?.message || 'An error occurred')
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  const totalWidth = useMemo(
    () => columns.reduce((sum, col) => sum + (col.width || 150), 0),
    [columns],
  )

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
      />

      <div className="abc_vp" style={{ padding: isMobile ? 8 : 16 }}>
        {/* My Status card */}
        {location.pathname.includes('/sepration/resignation_status') && (
          <Card
            size="small"
            style={{
              marginBottom: isMobile ? 12 : 24,
              borderRadius: 8,
            }}
            bodyStyle={{ padding: isMobile ? 12 : 16 }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 8 : 0,
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ marginBottom: 0 }}>Your Resignation Status</h3>
                <Tooltip title="Click to view full resignation details">
                  <Link to="/sepration/record_resignation">
                    <InfoCircleOutlined
                      style={{ fontSize: 18, color: '#1890ff', cursor: 'pointer' }}
                    />
                  </Link>
                </Tooltip>
              </div>

              {actionsMap['revoke me']?.actionStatus && (
                <Button
                  type="primary"
                  onClick={() => setInitiateModalOpen(true)}
                  disabled={myResignationStatus?.isRevoked}
                  block={isMobile}
                >
                  Revoke Me
                </Button>
              )}
            </div>

            <p style={{ marginTop: isMobile ? 8 : 12 }}>
              You submitted your resignation on{' '}
              <strong>
                {myResignationStatus?.resignationDate
                  ? new Date(myResignationStatus.resignationDate).toLocaleDateString()
                  : '-'}
              </strong>
              . Type: <strong>{myResignationStatus?.resignationType || '-'}</strong>. Current
              status: <strong>{myResignationStatus?.status || '-'}</strong>.
            </p>

            <div
              style={{
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                color: '#1890ff',
                gap: 6,
              }}
              onClick={() => setIsHistoryVisible((prev) => !prev)}
            >
              {isHistoryVisible ? <UpOutlined /> : <DownOutlined />}
              <span>{isHistoryVisible ? 'Hide' : 'Show'} Resignation History</span>
            </div>

            {myfullResignationStatus && isHistoryVisible && (
              <div style={{ marginTop: 12 }}>
                {myfullResignationStatus.length > 0 ? (
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {myfullResignationStatus.map((entry, i) => (
                      <li key={i} style={{ marginBottom: 6 }}>
                        <strong>Last Date:</strong>{' '}
                        {entry?.lastDay ? new Date(entry.lastDay).toLocaleDateString() : '-'} |{' '}
                        <strong>Type:</strong> {entry?.resignationType || '-'} |{' '}
                        <strong>Status:</strong> {entry?.status || '-'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontStyle: 'italic', color: '#888', margin: 0 }}>
                    No past resignation history.
                  </p>
                )}
              </div>
            )}
          </Card>
        )}

        <TableBulkActionIcons
          totalRecords={totalRecords}
          selectedRowKeys={selectedRowKeys}
          handleSearch={handleSearch}
          employeeId={employeeId}
          role={role}
        />

        <Table
          rowKey="employeeSeprationId"
          rowSelection={{ type: selectionType, selectedRowKeys, onChange: setSelectedRowKeys }}
          columns={columns}
          pagination={{
            current: currentPage,
            total: totalRecords,
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handleTableChange,
            size: isMobile ? 'small' : 'default',
          }}
          dataSource={allApplicationList}
          bordered
          loading={loading}
          // Keep all columns on mobile (horizontal scroll)
          scroll={{ x: Math.max(totalWidth, 800), y: 'calc(100vh - 220px)' }}
          size={isMobile ? 'small' : 'middle'}
        />
      </div>

      {/* Approve modals */}
      <ApproveModel
        initiateModalOpen={initiateModalOpen}
        setInitiateModalOpen={setInitiateModalOpen}
        handleInitializeCandidate={handleInitializeCandidate}
        isRevoked={true}
      />
      <ResignationActionModal
        initiateModalOpen={initiateModalOpen1}
        setInitiateModalOpen={setInitiateModalOpen1}
        handleInitializeCandidate={handleInitializeCandidate1}
        isRevoked={false}
        record={currentRowData}
        setRecord={setCurrentRowData}
      />

      {/* PDF Modal */}
      <Modal
        title={
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              gap: isMobile ? 8 : 0,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, fontSize: 18 }}>PDF Details</span>
              <span style={{ fontSize: 12, color: '#888' }}>
                Preview, download, or manage PDFs.
              </span>
            </div>
            <Button onClick={handleOk} type="primary">
              Done
            </Button>
          </div>
        }
        open={previewVisible}
        onCancel={() => {
          setPreviewVisible(false)
          setRemoveConfirm({ visible: false, fileIdx: null })
          setCurrentRow(null)
        }}
        footer={null}
        width={isMobile ? '100%' : 900}
        style={{ top: isMobile ? 0 : 10, padding: isMobile ? '0 8px' : undefined }}
        bodyStyle={{ padding: isMobile ? 8 : 0 }}
        destroyOnClose
      >
        {currentRow && uploadedRows[currentRow.employeeSeprationId]?.fileList?.length > 0 && (
          <div style={{ width: '100%', padding: isMobile ? 8 : 24 }}>
            <Card size="small" style={{ width: '100%', marginBottom: 16 }}>
              <List
                itemLayout="horizontal"
                dataSource={uploadedRows[currentRow.employeeSeprationId].fileList}
                renderItem={(file, idx) => (
                  <List.Item
                    style={{
                      background: modalPdfFile === file ? '#e6f7ff' : '#fafafa',
                      borderRadius: 8,
                      marginBottom: 8,
                      padding: isMobile ? '6px 8px' : '8px 16px',
                      cursor: 'pointer',
                    }}
                    actions={[
                      <Tooltip title="Preview" key="preview">
                        <Button
                          size="small"
                          type={modalPdfFile === file ? 'primary' : 'default'}
                          onClick={() => setModalPdfFile(file)}
                          icon={<EyeOutlined />}
                        />
                      </Tooltip>,
                      <Tooltip title="Download" key="download">
                        <Button
                          size="small"
                          onClick={() => {
                            const url = URL.createObjectURL(file)
                            const link = document.createElement('a')
                            link.href = url
                            link.download = file.name
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                          }}
                          icon={<DownloadOutlined />}
                        />
                      </Tooltip>,
                      <Tooltip title="Remove" key="remove">
                        <Button
                          size="small"
                          danger
                          onClick={() => setRemoveConfirm({ visible: true, fileIdx: idx })}
                          icon={<DeleteOutlined />}
                        />
                      </Tooltip>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<FilePdfOutlined style={{ color: '#d4380d', fontSize: 22 }} />}
                      title={<span style={{ fontWeight: 500 }}>{file.name}</span>}
                      description={
                        <span style={{ color: '#888', fontSize: 12 }}>
                          {formatBytes(file.size)}
                          {file.lastModified
                            ? ` | ${new Date(file.lastModified).toLocaleDateString()}`
                            : ''}
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>

            {modalPdfFile ? (
              <Card size="small" bodyStyle={{ padding: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: isMobile ? '8px 12px' : '12px 16px',
                    borderBottom: '1px solid #eee',
                    background: '#fafafa',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: isMobile ? 14 : 16,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                      marginRight: 8,
                    }}
                  >
                    {modalPdfFile.name}
                  </span>
                  <Space size={8}>
                    <Tooltip title="Download">
                      <Button
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => {
                          const url = URL.createObjectURL(modalPdfFile)
                          const link = document.createElement('a')
                          link.href = url
                          link.download = modalPdfFile.name
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Open in New Tab">
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => window.open(URL.createObjectURL(modalPdfFile), '_blank')}
                      />
                    </Tooltip>
                  </Space>
                </div>

                <div
                  style={{
                    width: '100%',
                    minHeight: isMobile ? 300 : 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fff',
                    position: 'relative',
                  }}
                >
                  {pdfLoading && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255,255,255,0.7)',
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Spin size="large" />
                    </div>
                  )}
                  <object
                    data={URL.createObjectURL(modalPdfFile)}
                    type="application/pdf"
                    width="100%"
                    height={isMobile ? '360px' : '500px'}
                    style={{ border: 'none', background: '#fff', width: '100%' }}
                    onLoad={() => setPdfLoading(false)}
                  >
                    <p style={{ padding: 12 }}>
                      PDF preview not supported.{' '}
                      <a
                        href={URL.createObjectURL(modalPdfFile)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open PDF
                      </a>
                    </p>
                  </object>
                </div>
              </Card>
            ) : (
              <div
                style={{
                  width: '100%',
                  textAlign: 'center',
                  color: '#888',
                  fontStyle: 'italic',
                  margin: '16px 0',
                }}
              >
                No PDF selected for preview.
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: isMobile ? 'stretch' : 'flex-end',
                gap: 12,
                width: '100%',
                marginTop: 12,
              }}
            >
              <Button
                onClick={() => addMorePdfInputRef.current?.click()}
                type="dashed"
                icon={<PlusOutlined />}
                style={{ minWidth: 120 }}
                block={isMobile}
              >
                Add More PDF
              </Button>
            </div>

            <input
              ref={addMorePdfInputRef}
              type="file"
              multiple
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={(e) => {
                const files = Array.from(e.target.files)
                if (files.length > 0) handleBeforeUpload(files, currentRow)
                e.target.value = null
              }}
            />
          </div>
        )}

        {fileList.length > 0 && fileList[0].type === 'application/pdf' && pdfUrl ? (
          <div
            style={{ width: '100%', maxWidth: 900, padding: isMobile ? 8 : 24, margin: '0 auto' }}
          >
            <div style={{ marginBottom: 8, width: '100%' }}>
              <strong>File Name:</strong> {fileList[0].name}
            </div>
            <object
              data={pdfUrl}
              type="application/pdf"
              width="100%"
              height={isMobile ? '420px' : '600px'}
              style={{ border: '1px solid #eee', background: '#fff', width: '100%' }}
            >
              <p style={{ padding: 12 }}>
                PDF preview not supported.{' '}
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  Open PDF
                </a>
              </p>
            </object>
          </div>
        ) : null}
      </Modal>

      {/* Remove PDF Modal */}
      <AntdModal
        open={removeConfirm.visible}
        onCancel={() => setRemoveConfirm({ visible: false, fileIdx: null })}
        onOk={() => {
          const idxToRemove = removeConfirm.fileIdx
          const empId = currentRow?.employeeSeprationId
          setRemoveConfirm({ visible: false, fileIdx: null })
          setUploadedRows((prev) => {
            const prevRowState = prev[empId]
            if (!prevRowState) return prev
            const newFileList = prevRowState.fileList.filter((_, i) => i !== idxToRemove)
            const newPdfUrls = (prevRowState.pdfUrls || []).filter((_, i) => i !== idxToRemove)
            if (modalPdfFile === prevRowState.fileList[idxToRemove]) {
              setModalPdfFile(newFileList[0] || null)
            }
            if (newFileList.length === 0) {
              setPreviewVisible(false)
              setCurrentRow(null)
              setFileList([])
            }
            forceUpdate()
            return {
              ...prev,
              [empId]: {
                ...prevRowState,
                fileList: newFileList,
                pdfUrls: newPdfUrls,
                uploaded: newFileList.length > 0,
              },
            }
          })
        }}
        okText="Remove"
        cancelText="Cancel"
        centered
        title="Remove PDF"
        icon={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
      >
        <div style={{ fontSize: 16, fontWeight: 500 }}>
          Are you sure you want to remove this PDF?
        </div>
      </AntdModal>
    </>
  )
}

const TableBulkActionIcons = ({
  totalRecords,
  selectedRowKeys,
  handleSearch,
  employeeId,
  role,
}) => {
  const screens = Grid.useBreakpoint()
  const isMobile = !screens.md
  const [statusSummary, setstatusSummary] = useState([
    { name: 'Total Rows', label: 'Total', count: 0, color: 'green', id: [1, 2, 3, 4, 5] },
    { name: 'Selected Rows', label: 'Selected', count: 0, color: 'blue', id: [7] },
  ])
  const [isExcelDownloading, setIsExcelDownloading] = useState(false)

  const downloadExcel = async () => {
    try {
      setIsExcelDownloading(true)

      const { data, status } = await resignationListsExcel(employeeId, role)

      if (status === 200) {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `Separation_Report_${new Date().toISOString()}.xlsx`
        anchor.click()
        anchor.remove()
        window.URL.revokeObjectURL(url)
        message.success('Excel downloaded successfully')
      }
    } catch (error) {
      const msg = getApiError(error, 'Error downloading excel')
      message.error(msg)
    } finally {
      setIsExcelDownloading(false)
    }
  }

  useEffect(() => {
    setstatusSummary((prev) => [
      { ...prev[0], count: totalRecords },
      { ...prev[1], count: selectedRowKeys?.length || 0 },
    ])
  }, [selectedRowKeys, totalRecords])

  return (
    <div
      style={{
        padding: isMobile ? 6 : 8,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 8 : 0,
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        marginBottom: isMobile ? 8 : 12,
      }}
    >
      <Space wrap size={6}>
        {statusSummary.map(({ name, label, count }, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #ddd',
              padding: '4px 8px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Tooltip placement="top" title={label}>
              <span style={{ fontSize: 12 }}>
                {count} {name}
              </span>
            </Tooltip>
          </div>
        ))}
      </Space>

      <Row style={{ width: isMobile ? '100%' : 'auto' }}>
        <Col flex="auto">
          <Button
            icon={<ImportOutlined />}
            onClick={downloadExcel}
            loading={isExcelDownloading}
            disabled={isExcelDownloading}
          ></Button>
          <Search
            placeholder="Search in table..."
            allowClear
            onChange={handleSearch}
            style={{ width: isMobile ? '100%' : 320, marginLeft: isMobile ? 0 : 8 }}
          />
        </Col>
      </Row>
    </div>
  )
}

export default ResignationStatus
