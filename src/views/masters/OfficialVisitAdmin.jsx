import React, { useEffect, useMemo, useState } from 'react'
import {
  Table,
  Button,
  Upload,
  message,
  Space,
  Input,
  Select,
  Tooltip,
  Row,
  Col,
  Modal,
  Divider,
  Typography,
  Tag,
  DatePicker,
  Checkbox,
  Spin,
  Empty,
} from 'antd'
import {
  UploadOutlined,
  ExportOutlined,
  DownloadOutlined,
  ReloadOutlined,
  InboxOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import Pageheading from '../../components/shared/Pageheading'
import {
  getOfficialVisitAdminList,
  uploadOfficialVisitExcel,
  downloadOfficialVisitTemplate,
  exportOfficialVisit,
  searchEmployeeDropdown,
} from '../../services/Services'

const { Search } = Input
const { Text } = Typography
const { RangePicker } = DatePicker

const statusTag = (statusId) => {
  switch (statusId) {
    case 1:
      return <Tag color="green">Approved</Tag>
    case 2:
      return <Tag color="red">Rejected</Tag>
    case 4:
      return <Tag color="orange">Pending</Tag>
    default:
      return <Tag>-</Tag>
  }
}

// Official Visit admin: list + Excel uploader + export -- IT Superadmin only.
// Rows HR uploads here are auto-approved (no manager step). Mirrors LeaveClosingBalance.jsx's
// toolbar/upload-modal/blob-download pattern.
const OfficialVisitAdmin = () => {
  const { theme } = useSelector((state) => state.ui)
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusId, setStatusId] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [importOpen, setImportOpen] = useState(false)
  const [fileList, setFileList] = useState([])

  // ---- Export modal state: range + custom dates + ecodes + "export all" ----
  const [exportOpen, setExportOpen] = useState(false)
  const [exportRange, setExportRange] = useState(null)
  const [exportCustomDates, setExportCustomDates] = useState([])
  const [exportPickDate, setExportPickDate] = useState(null)
  const [exportEcodes, setExportEcodes] = useState([])
  const [exportApplyAll, setExportApplyAll] = useState(false)
  const [empOptions, setEmpOptions] = useState([])
  const [empSearching, setEmpSearching] = useState(false)
  const [exporting, setExporting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getOfficialVisitAdminList({ page: currentPage, pageSize, search, statusId })
      setRows(Array.isArray(res?.data) ? res.data : [])
      setTotal(Number(res?.total) || 0)
    } catch (e) {
      message.error('Failed to load Official Visit requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, search, statusId])

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(String(newPageSize))
  }

  const handleSearch = (e) => {
    setCurrentPage(1)
    setSearch(e.target.value.trim())
  }

  const handleDownloadTemplate = async () => {
    try {
      const res = await downloadOfficialVisitTemplate()
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'OfficialVisit_Template.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      message.error('Failed to download template.')
    }
  }

  const doUpload = async (file) => {
    setUploading(true)
    try {
      const res = await uploadOfficialVisitExcel(file)
      if (res?.status) {
        message.success(res.message || 'Uploaded.')
        if (Array.isArray(res.errors) && res.errors.length) {
          message.warning(`${res.errors.length} row(s) skipped. First: ${res.errors[0]}`, 7)
          console.warn('Upload row errors:', res.errors)
        }
        setImportOpen(false)
        setFileList([])
        setCurrentPage(1)
        load()
      } else {
        message.error(res?.message || 'Upload failed.')
      }
    } catch (e) {
      message.error('Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmitUpload = () => {
    const file = fileList[0]?.originFileObj || fileList[0]
    if (!file) {
      message.warning('Please choose an Excel file first.')
      return
    }
    doUpload(file)
  }

  const closeImport = () => {
    if (uploading) return
    setImportOpen(false)
    setFileList([])
  }

  // ---- Export modal handlers ----
  const debouncedEmpSearch = useMemo(() => {
    let t
    return (text) => {
      clearTimeout(t)
      setEmpSearching(true)
      t = setTimeout(async () => {
        try {
          const res = await searchEmployeeDropdown(text || '')
          setEmpOptions(
            (res?.data?.employees || []).map((e) => ({
              value: e.ecode,
              label: `${e.ecode} — ${e.fullName}`,
            })),
          )
        } catch (e) {
          /* non-fatal */
        } finally {
          setEmpSearching(false)
        }
      }, 350)
    }
  }, [])

  const addExportCustomDate = () => {
    if (!exportPickDate) return
    if (exportCustomDates.some((d) => d.isSame(exportPickDate, 'day'))) {
      setExportPickDate(null)
      return
    }
    setExportCustomDates([...exportCustomDates, exportPickDate])
    setExportPickDate(null)
  }

  const resetExportForm = () => {
    setExportRange(null)
    setExportCustomDates([])
    setExportPickDate(null)
    setExportEcodes([])
    setExportApplyAll(false)
  }

  const handleExport = async () => {
    if (
      !exportApplyAll &&
      !exportRange &&
      exportCustomDates.length === 0 &&
      exportEcodes.length === 0
    ) {
      message.warning('Pick a date range/custom date(s), select ecode(s), or choose "Export All".')
      return
    }
    setExporting(true)
    try {
      const payload = {
        ecodes: exportApplyAll ? [] : exportEcodes,
        applyAll: exportApplyAll,
        fromDate: !exportApplyAll && exportRange?.[0] ? exportRange[0].format('YYYY-MM-DD') : null,
        toDate: !exportApplyAll && exportRange?.[1] ? exportRange[1].format('YYYY-MM-DD') : null,
        customDates: exportApplyAll ? [] : exportCustomDates.map((d) => d.format('YYYY-MM-DD')),
      }
      const res = await exportOfficialVisit(payload)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      const today = new Date().toISOString().slice(0, 10)
      a.download = `OfficialVisit_${today}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      setExportOpen(false)
    } catch (e) {
      message.error('Export failed.')
    } finally {
      setExporting(false)
    }
  }

  const columns = [
    { title: 'Ecode', dataIndex: 'Ecode', key: 'Ecode', width: 110 },
    { title: 'Name', dataIndex: 'EmployeeName', key: 'EmployeeName', width: 170, ellipsis: true },
    {
      title: 'Department',
      dataIndex: 'DepartmentName',
      key: 'DepartmentName',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Sub Dept 1',
      dataIndex: 'SubDepartment1',
      key: 'SubDepartment1',
      width: 130,
      ellipsis: true,
    },
    {
      title: 'Sub Dept 2',
      dataIndex: 'SubDepartment2',
      key: 'SubDepartment2',
      width: 130,
      ellipsis: true,
    },
    {
      title: 'Sub Dept 3',
      dataIndex: 'SubDepartment3',
      key: 'SubDepartment3',
      width: 130,
      ellipsis: true,
    },
    {
      title: 'Designation',
      dataIndex: 'DesignationName',
      key: 'DesignationName',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'From Date',
      dataIndex: 'FromDate',
      key: 'FromDate',
      width: 120,
      render: (v) => (v ? dayjs(v).format('DD-MMM-YY') : ''),
    },
    {
      title: 'To Date',
      dataIndex: 'ToDate',
      key: 'ToDate',
      width: 120,
      render: (v) => (v ? dayjs(v).format('DD-MMM-YY') : ''),
    },
    { title: 'Purpose of Visit', dataIndex: 'Purpose', key: 'Purpose', width: 200, ellipsis: true },
    {
      title: 'Recommended By',
      key: 'recommendedBy',
      width: 180,
      ellipsis: true,
      render: (_, r) =>
        r.RecommendedByEcode ? `${r.RecommendedByEcode} — ${r.RecommendedByName || ''}` : '-',
    },
    {
      title: 'Manager Approval',
      dataIndex: 'ManagerApprovalStatusId',
      key: 'ManagerApprovalStatusId',
      width: 140,
      render: statusTag,
    },
    {
      title: 'Remarks',
      dataIndex: 'EmployeeRemarks',
      key: 'EmployeeRemarks',
      width: 180,
      ellipsis: true,
    },
    {
      title: 'Manager Remarks',
      dataIndex: 'ManagerRemarks',
      key: 'ManagerRemarks',
      width: 180,
      ellipsis: true,
    },
    { title: 'Source', dataIndex: 'sourceLabel', key: 'sourceLabel', width: 160 },
    {
      title: 'Created On',
      dataIndex: 'CreatedOn',
      key: 'CreatedOn',
      width: 150,
      render: (v) => (v ? dayjs(v).format('DD-MMM-YY hh:mm A') : ''),
    },
    {
      title: 'Updated On',
      dataIndex: 'UpdatedOn',
      key: 'UpdatedOn',
      width: 150,
      render: (v) => (v ? dayjs(v).format('DD-MMM-YY hh:mm A') : '-'),
    },
  ]
  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  return (
    <>
      <Pageheading title="Official Visit Admin" />

      <div className="def" style={{ paddingBottom: 10 }}>
        <div
          style={{
            padding: 5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <Space>
            <div
              style={{
                border: '2px solid #ccc',
                padding: 3,
                borderRadius: 10,
                display: 'flex',
                justifyContent: 'center',
              }}
              className={theme === 'dark' ? 'dark-theme' : ''}
            >
              <span style={{ fontSize: 12, padding: '0 8px' }}>
                {total.toLocaleString()} Total Rows
              </span>
            </div>
          </Space>

          <Row align="middle" gutter={[8, 8]}>
            <Col>
              <Tooltip placement="top" title="Refresh">
                <Button style={{ marginLeft: 5 }} onClick={load}>
                  <ReloadOutlined />
                </Button>
              </Tooltip>
              <Tooltip placement="top" title="Upload Official Visit Data">
                <Button style={{ marginLeft: 5 }} onClick={() => setImportOpen(true)}>
                  <UploadOutlined />
                </Button>
              </Tooltip>
              <Tooltip placement="top" title="Export">
                <Button style={{ marginLeft: 5 }} onClick={() => setExportOpen(true)}>
                  <ExportOutlined />
                </Button>
              </Tooltip>
            </Col>
            <Select
              value={statusId}
              onChange={(v) => {
                setCurrentPage(1)
                setStatusId(v)
              }}
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'Pending', value: 4 },
                { label: 'Approved', value: 1 },
                { label: 'Rejected', value: 2 },
              ]}
              style={{ width: 150, marginLeft: 5 }}
            />
            <Search
              placeholder="Search ecode / name..."
              allowClear
              onChange={handleSearch}
              style={{ width: 260, marginLeft: 5 }}
            />
          </Row>
        </div>

        <Table
          rowKey="OfficialVisitRequestId"
          columns={columns}
          dataSource={rows}
          loading={loading}
          bordered
          pagination={{
            current: currentPage,
            position: ['bottomRight'],
            total,
            pageSize: Number(pageSize),
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (t, range) => `${range[0]}-${range[1]} of ${t.toLocaleString()}`,
            onChange: handleTableChange,
          }}
          scroll={{ x: totalWidth, y: 'calc(100vh - 160px)' }}
          style={{ whiteSpace: 'nowrap' }}
          className={theme === 'dark' ? 'dark-theme' : ''}
        />
      </div>

      {/* Import modal */}
      <Modal
        title={
          <Space>
            <UploadOutlined style={{ color: '#1d3557' }} />
            Import Official Visit Data
          </Space>
        }
        open={importOpen}
        onCancel={closeImport}
        maskClosable={!uploading}
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={closeImport} disabled={uploading}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<UploadOutlined />}
            loading={uploading}
            disabled={fileList.length === 0}
            onClick={handleSubmitUpload}
          >
            {uploading ? 'Uploading…' : 'Submit'}
          </Button>,
        ]}
      >
        <Text type="secondary" style={{ display: 'block' }}>
          <b>Step 1:</b> Download the template — required columns <b>ECODE</b>, <b>FROM DATE</b>,{' '}
          <b>TO DATE</b> (optional: Purpose, Visit Location Store Code, Recommended By Ecode,
          Remarks).
        </Text>
        <div style={{ margin: '10px 0' }}>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate} block>
            Download Template
          </Button>
        </div>
        <Divider style={{ margin: '10px 0' }} />
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
          <b>Step 2:</b> Choose your file, then click <b>Submit</b>. Rows are upserted by{' '}
          <b>Ecode + From Date + To Date</b> — uploaded rows are auto-approved, no manager step, and
          nothing is ever deleted.
        </Text>
        <Upload.Dragger
          className="ov-dragger"
          accept=".xlsx,.xls"
          multiple={false}
          maxCount={1}
          fileList={fileList}
          disabled={uploading}
          beforeUpload={(file) => {
            setFileList([file])
            return false
          }}
          onRemove={() => setFileList([])}
        >
          <p className="ant-upload-drag-icon" style={{ margin: 0 }}>
            <InboxOutlined style={{ color: '#1d3557' }} />
          </p>
          <p className="ant-upload-text" style={{ margin: '4px 0 0' }}>
            Click or drag the Excel file here
          </p>
          <p className="ant-upload-hint" style={{ margin: 0 }}>
            .xlsx or .xls
          </p>
        </Upload.Dragger>
      </Modal>

      {/* Export modal: date range / custom dates / ecode(s) / export-all */}
      <Modal
        title="Export Official Visit Report"
        open={exportOpen}
        onCancel={() => setExportOpen(false)}
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={() => setExportOpen(false)} disabled={exporting}>
            Cancel
          </Button>,
          <Button key="reset" onClick={resetExportForm} disabled={exporting}>
            Reset
          </Button>,
          <Button
            key="export"
            type="primary"
            icon={<ExportOutlined />}
            loading={exporting}
            onClick={handleExport}
          >
            Export
          </Button>,
        ]}
      >
        <Row gutter={[16, 12]}>
          <Col xs={24}>
            <Checkbox
              checked={exportApplyAll}
              onChange={(e) => setExportApplyAll(e.target.checked)}
            >
              <b>Export All</b> — ignore all filters below, download the full report
            </Checkbox>
          </Col>

          <Col xs={24}>
            <Text strong>Date Range</Text>
            <RangePicker
              value={exportRange}
              onChange={setExportRange}
              format="DD-MMM-YY"
              allowClear
              disabled={exportApplyAll}
              style={{ width: '100%', marginTop: 4 }}
            />
          </Col>
          <Col xs={24}>
            <Text strong>Custom Dates</Text>
            <Space.Compact style={{ width: '100%', marginTop: 4 }}>
              <DatePicker
                value={exportPickDate}
                onChange={setExportPickDate}
                format="DD-MMM-YY"
                style={{ width: '100%' }}
                placeholder="Pick a date to add"
                disabled={exportApplyAll}
              />
              <Button
                icon={<PlusOutlined />}
                onClick={addExportCustomDate}
                disabled={!exportPickDate || exportApplyAll}
              >
                Add
              </Button>
            </Space.Compact>
            <div style={{ marginTop: 6 }}>
              {exportCustomDates.map((d) => (
                <Tag
                  key={d.format('YYYY-MM-DD')}
                  closable
                  onClose={() =>
                    setExportCustomDates(exportCustomDates.filter((x) => !x.isSame(d, 'day')))
                  }
                  style={{ marginBottom: 4 }}
                >
                  {d.format('DD-MMM-YY')}
                </Tag>
              ))}
            </div>
          </Col>
          <Col xs={24}>
            <Text strong>Ecode(s)</Text>
            <Select
              mode="multiple"
              allowClear
              showSearch
              filterOption={false}
              loading={empSearching}
              disabled={exportApplyAll}
              value={exportEcodes}
              onSearch={debouncedEmpSearch}
              onChange={setExportEcodes}
              placeholder="Search & select ecode(s) -- leave empty for all"
              style={{ width: '100%', marginTop: 4 }}
              options={empOptions}
              notFoundContent={
                empSearching ? (
                  <Spin size="small" />
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )
              }
            />
          </Col>
        </Row>
      </Modal>

      <style>{`
        .ov-dragger.ant-upload-drag { border-radius: 12px !important; }
        .ov-dragger .ant-upload-btn { padding: 16px 12px !important; }
        .ov-dragger .ant-upload-drag-icon .anticon { font-size: 34px; }
      `}</style>
    </>
  )
}

export default OfficialVisitAdmin
