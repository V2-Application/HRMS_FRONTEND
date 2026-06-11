import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react'
import { Select, Button, message, Space } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { getGapReportsList, exportGapReport } from '../../services/Services'

// Gap Reports page: pick a report from the dropdown and export it to Excel for the CURRENT date.
const GapReports = () => {
  const [reports, setReports] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const list = await getGapReportsList()
        setReports(Array.isArray(list) ? list : [])
        if (Array.isArray(list) && list.length) setSelected(list[0].key)
      } catch (err) {
        console.error('Failed to load gap reports list:', err)
        const fallback = [
          { key: 'location', name: 'Location-wise Absconding Report' },
          { key: 'employee', name: 'Employee-wise Absconding Report' },
        ]
        setReports(fallback)
        setSelected('location')
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
      // Always export for the current date (server defaults @AsOfDate to today when omitted).
      const response = await exportGapReport(selected)

      const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
      let fileName = `${selected}_gap_report_${today}.xlsx`
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
              Select a report and export it to Excel. The report is generated live as of the current
              date.
            </p>
            <Space wrap size="middle" align="end">
              <div>
                <div style={{ marginBottom: 4, fontWeight: 500 }}>Report</div>
                <Select
                  style={{ width: 320 }}
                  placeholder="Select a report"
                  value={selected}
                  onChange={setSelected}
                  options={reports.map((r) => ({ value: r.key, label: r.name }))}
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
