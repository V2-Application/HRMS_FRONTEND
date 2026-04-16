import React, { useEffect, useMemo, useState } from 'react'
import {
  Space,
  Table,
  Row,
  Input,
  Button,
  Col,
  message,
  Form,
  Modal,
  Upload,
  Typography,
  DatePicker,
} from 'antd'
import {
  ExportOutlined,
  PlusOutlined,
  MinusOutlined,
  EyeOutlined,
  StepForwardOutlined,
  DownloadOutlined,
  PaperClipOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'

import useMediaQuery from '../hooks/useMediaQuery'
import Pageheading from '../components/shared/Pageheading'
import { useActionsMap } from '../utils/useActionsMap'
import { exportPfMasterToExcel, fetchPFList, submitPFChallan } from '../services/Services'
import { set } from '../redux/uiSlice'
import PfUploaderFormModal from './PfUploaderFormModal'
import dayjs from 'dayjs'

const { Search } = Input
const { MonthPicker } = DatePicker
const BASE_URL = import.meta.env.VITE_API_URL

const Deduction = () => {
  const BASE_URL = import.meta.env.VITE_API_URL || ''
  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.ui)
  const {
    filteredSideMenu,
    data: { employeeId },
  } = useSelector((state) => state?.auth || {})
  const actionsMap = useActionsMap(filteredSideMenu)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const [employeesListData, setEmployeesListData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [lodingLocal, setlodingLocal] = useState(false)
  const [expandedCards, setExpandedCards] = useState({})
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // View modal
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [viewModalRecord, setViewModalRecord] = useState(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)

  // Submit modal
  const [submitModalVisible, setSubmitModalVisible] = useState(false)
  const [submitModalRecord, setSubmitModalRecord] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(dayjs())

  const [form] = Form.useForm()

  const money = (value) => {
    const num = Number(value || 0)
    return num === 0 ? '0' : num.toLocaleString('en-IN')
  }

  const normalizeFileUrl = (url) => {
    if (!url) return ''
    if (/^https?:\/\//i.test(url)) return url
    return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
  }

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const monthYear = currentMonth ? currentMonth.format('MMM-YY') : dayjs().format('MMM-YY')

      const res = await fetchPFList({
        search,
        monthYear,
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
      })

      if (res?.status === 200) {
        // ✅ adapt safely depending on backend response structure
        const apiData = res?.data || {}
        const list =
          apiData?.data?.data || // if nested
          apiData?.data || // if direct array in data
          []

        const total =
          apiData?.totalCount ??
          apiData?.total ??
          apiData?.data?.totalCount ??
          apiData?.data?.total ??
          (Array.isArray(list) ? list.length : 0)

        setEmployeesListData(Array.isArray(list) ? list : [])
        setPagination((prev) => ({ ...prev, total }))
      } else {
        setEmployeesListData([])
        setPagination((prev) => ({ ...prev, total: 0 }))
      }
    } catch (error) {
      console.error('Error fetching data:', error?.response?.data || error?.message)
      setEmployeesListData([])
      setPagination((prev) => ({ ...prev, total: 0 }))
      message.error('Failed to fetch PF list')
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  // Fetch when pagination/month changes
  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, pagination.current, pagination.pageSize, currentMonth])

  // useEffect(() => {
  //   const q = search?.trim().toLowerCase()
  //   if (q) {
  //     const newData =
  //       employeesListData.filter((row) =>
  //         Object.values(row).some((val) => String(val).toLowerCase().includes(q)),
  //       ) || []
  //     setFilteredData(newData)
  //   } else {
  //     setFilteredData(employeesListData)
  //   }
  // }, [search, employeesListData])

  // const handleSearch = (e) => setSearch(e.target.value)

  useEffect(() => {
    const t = setTimeout(() => {
      setPagination((p) => ({ ...p, current: 1 })) // reset page
      // fetch will be triggered by pagination.current change
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  const handleSearch = (e) => setSearchInput(e.target.value)

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch((searchInput || '').trim())
      setPagination((p) => ({ ...p, current: 1 }))
    }, 400)

    return () => clearTimeout(t)
  }, [searchInput])

  const handleTableChange = (pag) => {
    setPagination((prev) => ({
      ...prev,
      current: pag.current,
      pageSize: pag.pageSize,
    }))
  }

  // Month change -> reset page 1
  const handleMonthChange = (val) => {
    setCurrentMonth(val || dayjs())
    setPagination((p) => ({ ...p, current: 1 }))
  }

  const handleToggleCard = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // ====== VIEW ======
  const handleView = (row) => {
    setViewModalRecord(row)
    setViewModalVisible(true)
  }

  const handleCloseView = () => {
    setViewModalVisible(false)
    setViewModalRecord(null)
  }

  const downloadAttachment = (row) => {
    const url = normalizeFileUrl(row?.challanPdfPath)
    if (!url) {
      message.warning('No attachment found for this row')
      return
    }
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.download = row?.attachmentName || 'PF_Attachment'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  // ====== SUBMIT ======
  const handleOpenSubmit = (row) => {
    setSubmitModalRecord(row)
    form.resetFields()
    setSubmitModalVisible(true)
  }

  const handleCloseSubmit = () => {
    setSubmitModalVisible(false)
    setSubmitModalRecord(null)
    form.resetFields()
  }

  const normFile = (e) => {
    if (Array.isArray(e)) return e
    const fl = e?.fileList || []
    return fl.slice(-1) // single file
  }

  const handleSubmitPF = async () => {
    try {
      const values = await form.validateFields()
      const challanNo = values?.challanNo?.trim()
      const fileObj = values?.attachment?.[0]?.originFileObj

      if (!fileObj) {
        message.error('Please upload an attachment')
        return
      }

      // setUploading(true)

      const fd = new FormData()
      // use identifiers your backend expects
      fd.append('E_Code', submitModalRecord?.ecode || '')
      fd.append('_Month', submitModalRecord?.month || '')
      fd.append('Challan_No', challanNo)
      fd.append('Attachment', fileObj)
      fd.append('CreatedBy', employeeId)

      const res = await submitPFChallan(fd)

      if (res?.status === 200) {
        message.success(res.data?.message || 'Submitted successfully')
        toast.success('PF submitted successfully')
        handleCloseSubmit()
        fetchData()
      }
    } catch (err) {
      if (err?.errorFields) return
      console.error(err)
      message.error(err?.response?.data?.message || 'Submit failed')
    } finally {
      setUploading(false)
    }
  }

  // Expandable row for mobile
  const expandedRowRender = (record) => (
    <div style={{ padding: 10, background: '#fafafa', fontSize: 10, overflowX: 'auto' }}>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, minWidth: 300 }}
      >
        <div>
          <div
            style={{
              color: '#888',
              fontSize: 9,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            Location
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 10,
              textAlign: 'center',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.2',
            }}
          >
            {record.locationName || '-'}
          </div>
        </div>
        <div>
          <div
            style={{
              color: '#888',
              fontSize: 9,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            Department
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 10,
              textAlign: 'center',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.2',
            }}
          >
            {record.departmentName || '-'}
          </div>
        </div>
        <div>
          <div
            style={{
              color: '#888',
              fontSize: 9,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            Designation
          </div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 10,
              textAlign: 'center',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              lineHeight: '1.2',
            }}
          >
            {record.designationName || '-'}
          </div>
        </div>

        <div>
          <div
            style={{
              color: '#888',
              fontSize: 9,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            Loc Code
          </div>
          <div style={{ fontWeight: 500, fontSize: 10, textAlign: 'center' }}>
            {record.stCode || '-'}
          </div>
        </div>

        <div>
          <div
            style={{
              color: '#888',
              fontSize: 9,
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
              fontSize: 9,
              fontWeight: 500,
              marginBottom: 2,
              textAlign: 'center',
            }}
          >
            Empr PF
          </div>
          <div style={{ fontWeight: 600, fontSize: 10, color: '#fa8c16', textAlign: 'center' }}>
            ₹{money(record.emprPF)}
          </div>
        </div>
      </div>
    </div>
  )

  // Mobile columns
  const mobileColumns = [
    {
      title: 'Code',
      dataIndex: 'ecode',
      width: 60,
      render: (text) => <div style={{ fontSize: 10, fontWeight: 500 }}>{text || '-'}</div>,
    },
    {
      title: 'Name',
      dataIndex: 'fulL_NAME',
      width: 100,
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
      width: 80,
      render: (text) => (
        <div style={{ fontSize: 10, textAlign: 'center', fontWeight: 500 }}>{text || '-'}</div>
      ),
    },
    {
      title: 'Deducted Emp PF',
      dataIndex: 'empPF',
      width: 70,
      render: (value) => (
        <div style={{ fontSize: 10, fontWeight: 600, color: '#52c41a', textAlign: 'center' }}>
          ₹{money(value)}
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 40,
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

  // Desktop columns
  const desktopColumns = [
    { title: 'E-CODE', dataIndex: 'eCode', key: 'eCode', ellipsis: true, width: 140 },
    { title: 'LOC CODE', dataIndex: 'locCode', key: 'locCode', ellipsis: true, width: 140 },
    {
      title: 'LOCATION',
      dataIndex: 'location',
      key: 'location',
      ellipsis: true,
      width: 200,
    },
    { title: 'EMP NAME', dataIndex: 'empName', key: 'empName', ellipsis: true, width: 180 },
    {
      title: 'DEPARTMENT',
      dataIndex: 'department',
      key: 'department',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'DESIGNATION',
      dataIndex: 'designation',
      key: 'designation',
      ellipsis: true,
      width: 160,
    },
    { title: 'MTH-YEAR', dataIndex: 'monthYear', key: 'monthYear', ellipsis: true, width: 130 },
    {
      title: 'Payable Days',
      dataIndex: 'payableDays',
      key: 'payableDays',
      ellipsis: true,
      width: 140,
    },
    { title: 'Deducted Emp PF', dataIndex: 'empPF', key: 'empPF', ellipsis: true, width: 130 },
    { title: 'Deducted Empr PF', dataIndex: 'emprPF', key: 'emprPF', ellipsis: true, width: 130 },
    {
      title: 'Total Deposited PF',
      dataIndex: 'depositedPF',
      key: 'depositedPF',
      ellipsis: true,
      width: 130,
    },
    {
      title: 'Difference',
      dataIndex: 'difference',
      width: 100,
      ellipsis: true,
      render: (_, row) => {
        const value =
          Number(row?.depositedPF || 0) - (Number(row?.empPF || 0) + Number(row?.emprPF) || 0)
        return value
      },
    },
    {
      title: 'Challan No.',
      dataIndex: 'challanNumber',
      key: 'challanNumber',
      ellipsis: true,
      width: 100,
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
    // {
    //   title: 'Action',
    //   dataIndex: 'action',
    //   key: 'action',
    //   ellipsis: true,
    //   width: 100,
    //   render: (_, row) => {
    //     const isPFPaid = row?.isPfPaid
    //     return (
    //       <>
    //         {isPFPaid ? (
    //           <Button
    //             icon={<EyeOutlined />}
    //             onClick={() => {
    //               handleView(row)
    //             }}
    //             size="small"
    //           />
    //         ) : (
    //           <Button
    //             icon={<StepForwardOutlined />}
    //             onClick={() => handleOpenSubmit(row)}
    //             size="small"
    //           />
    //         )}
    //       </>
    //     )
    //   },
    // },
  ]

  const columns = isMobile ? mobileColumns : desktopColumns
  const totalWidth = useMemo(
    () => columns.reduce((sum, col) => sum + (col.width || 150), 0),
    [columns],
  )

  return (
    <>
      <PfUploaderFormModal
        open={isFormModalOpen}
        onCancel={() => setIsFormModalOpen(false)}
        refetch={fetchData}
      />
      <Pageheading title="PF" />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      <div className="def" style={{ paddingBottom: 10 }}>
        {/* <TableBulkActionIcons
          totalRecords={filteredData.length || 0}
          handleSearch={handleSearch}
          lodingLocal={lodingLocal}
          setlodingLocal={setlodingLocal}
          actionsMap={actionsMap}
          search={search}
          isMobile={isMobile}
          setIsFormModalOpen={setIsFormModalOpen}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
        /> */}

        <TableBulkActionIcons
          totalRecords={pagination.total || 0}
          lodingLocal={lodingLocal}
          setlodingLocal={setlodingLocal}
          actionsMap={actionsMap}
          isMobile={isMobile}
          setIsFormModalOpen={setIsFormModalOpen}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          handleSearch={handleSearch}
          search={searchInput}
        />

        {/* <Table
          rowKey={(r, i) => r?.storeBudgetId || r?.ecode || `row_${i}`}
          columns={columns}
          pagination={{ pageSize: 100 }}
          dataSource={filteredData}
          bordered
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
        /> */}

        <Table
          rowKey={(r, i) => r?.storeBudgetId || r?.ecode || `row_${i}`}
          columns={columns}
          dataSource={employeesListData}
          bordered
          onChange={handleTableChange}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
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

      {/* ================= VIEW MODAL ================= */}
      <Modal
        title="PF Submission"
        open={viewModalVisible}
        onCancel={handleCloseView}
        footer={[
          <Button key="close" onClick={handleCloseView}>
            Close
          </Button>,
        ]}
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <Typography.Text type="secondary">Challan No.</Typography.Text>
            <div style={{ fontWeight: 600, marginTop: 4 }}>
              {viewModalRecord?.challan_No || '-'}
            </div>
          </div>

          <div>
            <Typography.Text type="secondary">Attachment</Typography.Text>
            <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
              {/* <PaperClipOutlined />
              <span style={{ flex: 1, wordBreak: 'break-word' }}>
                {viewModalRecord?.attachment || 'Attachment'}
              </span> */}

              <Button
                icon={<DownloadOutlined />}
                onClick={() => downloadAttachment(viewModalRecord)}
                disabled={!viewModalRecord?.attachment}
              >
                Download
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ================= SUBMIT MODAL ================= */}
      <Modal
        title="Submit PF"
        open={submitModalVisible}
        onCancel={handleCloseSubmit}
        footer={[
          <Button key="cancel" onClick={handleCloseSubmit} disabled={uploading}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" loading={uploading} onClick={handleSubmitPF}>
            Submit
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Challan No. (TRRN)"
            name="challanNo"
            rules={[
              { required: true, message: 'Please enter challan number' },
              { pattern: /^\d{17}$/, message: 'Enter valid 17-digit challan number (TRRN)' },
            ]}
          >
            <Input placeholder="e.g. 12345678901234567" maxLength={17} />
          </Form.Item>

          <Form.Item
            label="Attachment"
            name="attachment"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: 'Please upload an attachment' }]}
          >
            <Upload beforeUpload={() => false} maxCount={1} accept=".pdf,.png,.jpg,.jpeg">
              <Button icon={<PaperClipOutlined />}>Select file</Button>
            </Upload>
          </Form.Item>
        </Form>

        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Allowed: PDF / PNG / JPG (single file)
        </Typography.Text>
      </Modal>
    </>
  )
}

const TableBulkActionIcons = ({
  totalRecords,
  handleSearch,
  search,
  lodingLocal,
  setlodingLocal,
  actionsMap,
  isMobile,
  setIsFormModalOpen,
  currentMonth,
  setCurrentMonth,
}) => {
  const { theme } = useSelector((state) => state.ui)

  const downloadStoreDataAsExcel = async () => {
    try {
      setlodingLocal(true)
      const { data, status } = await exportPfMasterToExcel()
      if (status === 200) {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `PF_${new Date().toISOString()}.xlsx`
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
            {totalRecords} Total Rows
          </span>
        </div>
      </Space>

      <Row gutter={[8, 8]} align="middle">
        <Col xs={24} sm="auto" style={{ display: 'flex', gap: 8 }}>
          <Button icon={<UploadOutlined />} onClick={() => setIsFormModalOpen(true)} />
          {actionsMap?.export?.actionStatus && (
            <Button
              loading={lodingLocal}
              onClick={downloadStoreDataAsExcel}
              icon={<ExportOutlined />}
            />
          )}
          <MonthPicker
            value={currentMonth}
            onChange={(val) => {
              setCurrentMonth(val || dayjs())
              setPagination((p) => ({ ...p, current: 1 }))
            }}
          />
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
