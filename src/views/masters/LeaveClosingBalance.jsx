import React, { useEffect, useState } from 'react'
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
} from 'antd'
import {
  UploadOutlined,
  ExportOutlined,
  DownloadOutlined,
  ReloadOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import { useSelector } from 'react-redux'
import Pageheading from '../../components/shared/Pageheading'
import {
  getLeaveClosingBalances,
  getLeaveClosingBalanceMonths,
  uploadLeaveClosingBalance,
  downloadLeaveClosingBalanceTemplate,
  exportLeaveClosingBalance,
} from '../../services/Services'

const { Search } = Input
const { Text } = Typography

// Leave CLOSING balance uploader/viewer (dbo.EmpLeaveClosingBalance) — IT Superadmin only.
// Server-side paged (the table holds ~500k rows). UI mirrors the Leave Opening Bal Uploader.
const LeaveClosingBalance = () => {
  const { theme } = useSelector((state) => state.ui)
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState('')
  const [months, setMonths] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState('100')
  const [importOpen, setImportOpen] = useState(false)
  const [fileList, setFileList] = useState([])
  const [exporting, setExporting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getLeaveClosingBalances({ page: currentPage, pageSize, search, month })
      setRows(Array.isArray(res?.data) ? res.data : [])
      setTotal(Number(res?.total) || 0)
    } catch (e) {
      console.error(e)
      message.error('Failed to load closing balances.')
    } finally {
      setLoading(false)
    }
  }

  const loadMonths = async () => {
    try {
      const res = await getLeaveClosingBalanceMonths()
      setMonths(Array.isArray(res?.data) ? res.data : [])
    } catch (e) {
      // non-fatal
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, search, month])

  useEffect(() => {
    loadMonths()
  }, [])

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
      const res = await downloadLeaveClosingBalanceTemplate()
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'LeaveClosingBalance_Template.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      message.error('Failed to download template.')
    }
  }

  const handleExport = async () => {
    if (!total) {
      message.info('No data to export.')
      return
    }
    setExporting(true)
    try {
      const res = await exportLeaveClosingBalance({ search, month })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      const today = new Date().toISOString().slice(0, 10)
      a.download = `LeaveClosingBalance_${today}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      message.error('Export failed.')
    } finally {
      setExporting(false)
    }
  }

  const doUpload = async (file) => {
    setUploading(true)
    try {
      const res = await uploadLeaveClosingBalance(file)
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
        loadMonths()
      } else {
        message.error(res?.message || 'Upload failed.')
      }
    } catch (e) {
      message.error('Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  // Upload only when the user clicks Submit (not on file drop/select).
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

  const columns = [
    { title: 'Emp Code', dataIndex: 'ECode', key: 'ECode', ellipsis: true, width: 150 },
    { title: 'Month', dataIndex: 'Month', key: 'Month', width: 150 },
    { title: 'EL', dataIndex: 'ElClosing', key: 'ElClosing', width: 150 },
    { title: 'CL', dataIndex: 'ClClosing', key: 'ClClosing', width: 150 },
    { title: 'Comp Off', dataIndex: 'CompoOffClosing', key: 'CompoOffClosing', width: 150 },
  ]
  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 150), 0)

  return (
    <>
      <Pageheading title="Leave Closing Bal Uploader" />

      <div className="def" style={{ paddingBottom: 10 }}>
        {/* Toolbar: total-rows pill (left) + upload / export / search (right) */}
        <div
          style={{
            padding: 5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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

          <Row>
            <Col>
              <Tooltip placement="top" title="Refresh">
                <Button style={{ marginLeft: 5 }} onClick={load}>
                  <ReloadOutlined />
                </Button>
              </Tooltip>
              <Tooltip placement="top" title="Upload Leave Closing Bal">
                <Button style={{ marginLeft: 5 }} onClick={() => setImportOpen(true)}>
                  <UploadOutlined />
                </Button>
              </Tooltip>
              <Tooltip placement="top" title="Export">
                <Button style={{ marginLeft: 5 }} loading={exporting} onClick={handleExport}>
                  <ExportOutlined />
                </Button>
              </Tooltip>
            </Col>
            <Select
              value={month}
              onChange={(v) => {
                setCurrentPage(1)
                setMonth(v)
              }}
              options={[
                { label: 'All Months', value: '' },
                ...months.map((m) => ({ label: m, value: m })),
              ]}
              showSearch
              placeholder="Month"
              style={{ width: 150, marginLeft: 5 }}
            />
            <Search
              placeholder="Search in table..."
              allowClear
              onChange={handleSearch}
              style={{ width: 260, marginLeft: 5 }}
            />
          </Row>
        </div>

        <Table
          rowKey={(r, i) => `${r.ECode}-${r.Month}-${i}`}
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

      {/* Import modal — select then Submit */}
      <Modal
        title={
          <Space>
            <UploadOutlined style={{ color: '#1d3557' }} />
            Import Leave Closing Balances
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
          <b>Step 1:</b> Download the template — required columns <b>ECODE</b>, <b>MONTH</b>{' '}
          (optional: EL / Cl / CompoOff Closing).
        </Text>
        <div style={{ margin: '10px 0' }}>
          <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate} block>
            Download Template
          </Button>
        </div>
        <Divider style={{ margin: '10px 0' }} />
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
          <b>Step 2:</b> Choose your file, then click <b>Submit</b>. Rows are upserted by{' '}
          <b>Employee Code + Month</b> — nothing is deleted.
        </Text>
        <Upload.Dragger
          className="lcb-dragger"
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

      <style>{`
        .lcb-dragger.ant-upload-drag { border-radius: 12px !important; }
        .lcb-dragger .ant-upload-btn { padding: 16px 12px !important; }
        .lcb-dragger .ant-upload-drag-icon .anticon { font-size: 34px; }
      `}</style>
    </>
  )
}

export default LeaveClosingBalance
