import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import { Select, Button, message, Space, DatePicker } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { getGapReportsList, exportGapReport } from '../../services/Services'

// Complete list of gap reports (kept in sync with GapReportsController). Used as the dropdown's
// base so every option shows even if the running backend's /GapReports/List is older; the live
// API response is merged on top (overrides names / adds any extra keys).
const ALL_REPORTS = [
  { key: 'location', name: 'Location-wise Absconding Report' },
  { key: 'employee', name: 'Employee-wise Absconding Report' },
  { key: 'mispunch', name: 'TD/MTD Mis-Punch Gap Report (Employee-wise)' },
  { key: 'mispunch-loc', name: 'TD/MTD Mis-Punch Gap Report (Location-wise)' },
  { key: 'geofence-loc', name: 'TD/MTD Geo-Fencing Gap Report (Location-wise)' },
  { key: 'geofence-emp', name: 'TD/MTD Geo-Fencing Gap Report (Employee-wise)' },
  { key: 'regularization-loc', name: 'TD/MTD Regularization Gap Report (Location-wise)' },
  { key: 'regularization-emp', name: 'TD/MTD Regularization Gap Report (Employee-wise)' },
  { key: 'lastpunch-sep', name: 'Last Punch vs Separation High Ageing Gap Report' },
  { key: 'lastpunch-after-sep', name: 'Last Punching Shows After Separation Gap Report' },
  { key: 'sep-fnf-pending', name: 'Separated But F&F Pending Gap Report' },
  { key: 'sep-lastpunch-missing', name: 'Separated But Last Punch Date Missing Gap Report' },
  { key: 'sep-resignation-missing', name: 'Separated But Resignation Missing Gap Report' },
  { key: 'rm-geofence-pending', name: 'TD/MTD RM Geo-Fencing Approval Pending Gap Report' },
  { key: 'rm-regularization-pending', name: 'TD/MTD RM Regularization Approval Pending Gap Report' },
  { key: 'audit-regularization-pending', name: 'TD/MTD Audit Regularization Approval Pending Gap Report' },
  { key: 'absent-loc', name: 'Location-wise Absent TD/MTD Gap Report' },
  { key: 'actemp-vs-attend-loc', name: 'Location-wise Act Emp vs Act Attendance Gap Report' },
  { key: 'bgtemp-vs-attend-loc', name: 'Location-wise Bgt Emp vs Act Emp Gap Report' },
  { key: 'bgtemp-vs-actattend-loc', name: 'Location-wise Bgt Emp vs Act Attendance Gap Report' },
  { key: 'deptbgt-vs-actemp-loc', name: 'Location-Dept-wise Bgt Emp vs Act Emp Gap Report' },
  { key: 'absent-emp', name: 'Employee-wise Absent TD/MTD Gap Report' },
  { key: 'subdeptbgt-vs-actemp-loc', name: 'Location-SubDept-wise Bgt Emp vs Act Emp Gap Report' },
]

// Gap Reports page: pick a report from the dropdown and export it to Excel for the CURRENT date.
const GapReports = () => {
  const [reports, setReports] = useState(ALL_REPORTS)
  const [selected, setSelected] = useState(ALL_REPORTS[0].key)
  // Default to YESTERDAY (the last complete day). User can pick any date to download that day's report.
  const [selectedDate, setSelectedDate] = useState(dayjs().subtract(1, 'day'))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const list = await getGapReportsList()
        const apiList = Array.isArray(list) ? list : []
        // Base = complete local list (preserves order); merge live API entries on top.
        const byKey = new Map(ALL_REPORTS.map((r) => [r.key, r]))
        apiList.forEach((r) => {
          if (r && r.key) byKey.set(r.key, r)
        })
        setReports([...byKey.values()])
      } catch (err) {
        console.error('Failed to load gap reports list, using local list:', err)
        setReports(ALL_REPORTS)
      }
    }
    load()
  }, [])

  const handleExport = async () => {
    if (!selected) {
      message.warning('Please select a report first.')
      return
    }
    setLoading(true)
    try {
      // Export for the selected date (defaults to yesterday). Sent as @AsOfDate to the proc.
      const dateStr = selectedDate ? selectedDate.format('YYYY-MM-DD') : null
      const response = await exportGapReport(selected, dateStr)

      const stamp = dateStr || new Date().toISOString().slice(0, 10) // YYYY-MM-DD
      let fileName = `${selected}_gap_report_${stamp}.xlsx`
      const cd = response.headers?.['content-disposition']
      if (cd) {
        const match = cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)
        if (match && match[1]) fileName = decodeURIComponent(match[1])
      }

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      message.success('Report exported successfully.')
    } catch (err) {
      console.error('Error exporting report:', err)
      message.error('Failed to export the report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Gap Reports</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-medium-emphasis">
              Select a report and a date, then export it to Excel. The date defaults to yesterday (the
              last complete day); TD = the selected day, MTD = the 26th&ndash;25th cycle through it.
            </p>
            <Space wrap size="middle" align="end">
              <div>
                <div style={{ marginBottom: 4, fontWeight: 500 }}>Report</div>
                <Select
                  style={{ width: 460 }}
                  placeholder="Select a report"
                  value={selected}
                  onChange={setSelected}
                  popupMatchSelectWidth={false}
                  listHeight={420}
                  optionLabelProp="label"
                  options={reports.map((r) => ({ value: r.key, label: r.name, title: r.name }))}
                />
              </div>
              <div>
                <div style={{ marginBottom: 4, fontWeight: 500 }}>Date</div>
                <DatePicker
                  style={{ width: 170 }}
                  value={selectedDate}
                  onChange={setSelectedDate}
                  format="DD-MMM-YYYY"
                  allowClear={false}
                  disabledDate={(d) => d && d > dayjs().endOf('day')}
                />
              </div>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                loading={loading}
                onClick={handleExport}
              >
                Export to Excel
              </Button>
            </Space>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default GapReports
