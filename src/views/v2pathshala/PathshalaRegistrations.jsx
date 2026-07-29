import React, { useEffect, useMemo, useState } from 'react'
import { Card, Table, Input, Button, DatePicker, Space, Typography, message, Tag } from 'antd'
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getPathshalaRegistrations,
  exportPathshalaRegistrations,
} from '../../services/Services'

const { Title } = Typography
const { RangePicker } = DatePicker
const { Search } = Input

// Backend gives ISO date strings; render everything in dd-MMM-yy.
const fmtDate = (v) => (v ? dayjs(v).format('DD-MMM-YY') : '-')
const fmtDateTime = (v) => (v ? dayjs(v).format('DD-MMM-YY HH:mm:ss') : '-')

const PathshalaRegistrations = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [search, setSearch] = useState('')
  const [range, setRange] = useState(null) // [dayjs, dayjs] | null

  const filters = useMemo(
    () => ({
      search: search || '',
      fromDate: range?.[0] ? range[0].format('YYYY-MM-DD') : '',
      toDate: range?.[1] ? range[1].format('YYYY-MM-DD') : '',
    }),
    [search, range],
  )

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getPathshalaRegistrations(filters)
      setRows(Array.isArray(res?.data) ? res.data : [])
    } catch (e) {
      console.error('Failed to load registrations:', e)
      message.error('Failed to load registrations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.fromDate, filters.toDate])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await exportPathshalaRegistrations(filters)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `V2Pathshala_Registrations_${dayjs().format('DD-MMM-YY')}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Export failed:', e)
      message.error('Failed to export report.')
    } finally {
      setExporting(false)
    }
  }

  const columns = [
    { title: 'S.No', key: 'sno', width: 60, render: (_t, _r, i) => i + 1, fixed: 'left' },
    { title: 'Full Name', dataIndex: 'FullName', key: 'FullName', width: 160, fixed: 'left' },
    { title: 'Mobile', dataIndex: 'MobileNumber', key: 'MobileNumber', width: 120 },
    { title: 'WhatsApp', dataIndex: 'WhatsAppNumber', key: 'WhatsAppNumber', width: 120 },
    { title: 'Email', dataIndex: 'Email', key: 'Email', width: 200 },
    { title: 'DOB', dataIndex: 'DateOfBirth', key: 'DateOfBirth', width: 110, render: fmtDate },
    { title: 'Gender', dataIndex: 'Gender', key: 'Gender', width: 90 },
    { title: 'Program', dataIndex: 'ProgramApplyingFor', key: 'ProgramApplyingFor', width: 200 },
    { title: 'Mode', dataIndex: 'ModeOfTraining', key: 'ModeOfTraining', width: 130 },
    { title: 'Qualification', dataIndex: 'HighestQualification', key: 'HighestQualification', width: 130 },
    { title: 'Specialization', dataIndex: 'Specialization', key: 'Specialization', width: 140 },
    { title: 'College/University', dataIndex: 'CollegeUniversity', key: 'CollegeUniversity', width: 180 },
    { title: 'Passing Year', dataIndex: 'PassingYear', key: 'PassingYear', width: 100 },
    { title: 'Learning Mode', dataIndex: 'PreferredLearningMode', key: 'PreferredLearningMode', width: 130 },
    {
      title: 'Docs',
      key: 'docs',
      width: 200,
      render: (_t, r) => (
        <Space size={4} wrap>
          {r.PhotoPath && <Tag color="blue">Photo</Tag>}
          {r.ResumePath && <Tag color="green">Resume</Tag>}
          {r.AadhaarPath && <Tag color="orange">ID</Tag>}
          {r.MarksheetPath && <Tag color="purple">Marksheet</Tag>}
        </Space>
      ),
    },
    {
      title: 'Form Filled On',
      dataIndex: 'CreatedOn',
      key: 'CreatedOn',
      width: 170,
      render: fmtDateTime,
      fixed: 'right',
    },
  ]

  return (
    <div style={{ padding: 16 }}>
      <Card>
        <Title level={4} style={{ marginTop: 0 }}>
          V2 Pathshala Registrations
        </Title>

        <Space wrap style={{ marginBottom: 16 }}>
          <Search
            placeholder="Search name / email / mobile / program"
            allowClear
            onSearch={(v) => setSearch(v)}
            onChange={(e) => {
              if (!e.target.value) setSearch('')
            }}
            style={{ width: 320 }}
          />
          <RangePicker
            format="DD-MMM-YY"
            value={range}
            onChange={(v) => setRange(v)}
            allowClear
          />
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            loading={exporting}
            disabled={rows.length === 0}
          >
            Export Report
          </Button>
        </Space>

        <Table
          rowKey={(r) => r.Id}
          columns={columns}
          dataSource={rows}
          loading={loading}
          size="small"
          scroll={{ x: 1900 }}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} registrations` }}
        />
      </Card>
    </div>
  )
}

export default PathshalaRegistrations
