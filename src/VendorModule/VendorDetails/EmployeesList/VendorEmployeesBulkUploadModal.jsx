import React, { useEffect, useState } from 'react'
import { Modal, Button, Upload, Typography, message, Row, Col, Grid } from 'antd'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import axiosInstance from '../../../services/axiosInstance'
import { HardDriveUpload } from 'lucide-react'
import {
  getAllLocations,
  GetAllShifts,
  getDepartments,
  getDesignations,
} from '../../../services/Services'
import * as XLSX from 'xlsx'

const { Paragraph, Text, Title } = Typography
const { useBreakpoint } = Grid

export default function VendorEmployeesBulkUploadModal({ contractorCode, refreshData }) {
  console.log(contractorCode)
  const [fileList, setFileList] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dropdowns, setDropdowns] = useState({
    locations: [],
    departments: [],
    designations: [],
    shifts: [],
  })
  const [isDownloadingMasters, setIsDownloadingMasters] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const screens = useBreakpoint()
  const isMobile = !screens.md

  // Validate and add to fileList
  const beforeUpload = (file) => {
    const isXlsx =
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.name.toLowerCase().endsWith('.xlsx')

    if (!isXlsx) {
      message.error('You can only upload .xlsx file!')
      return Upload.LIST_IGNORE
    }
    setUploadError('')
    return false // prevent auto-upload
  }

  // Keep the controlled fileList in sync
  const onChange = ({ fileList: newList }) => {
    setFileList(newList.slice(-1)) // only last 1 file
  }

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Please choose an .xlsx file first.')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', fileList[0].originFileObj)
    formData.append('contractorCode', contractorCode)

    try {
      const res = await axiosInstance.post('/api/Vendor/ImportVendorEmployeesBulk', formData, {
        headers: { Accept: '*/*' },
      })

      if (res.status === 200) {
        message.success(res.data?.message || 'File uploaded successfully!')
        setIsModalOpen(false)
        setFileList([])
        // window.location.reload()
        refreshData()
      }
    } catch (err) {
      let errMsg = err?.response?.data?.message || 'Error uploading file.'
      errMsg += '\n' + err?.response?.data?.error
      setUploadError(errMsg)
      message.error(err?.response?.data?.message || 'Upload failed!')
    } finally {
      setIsUploading(false)
      setFileList([])
      setTimeout(() => {
        setUploadError('')
      }, 5000)
    }
  }

  const fetchDataForRefExcel = async () => {
    try {
      setIsDownloadingMasters(true)

      const locRes = await getAllLocations()
      const depRes = await getDepartments()
      const desRes = await getDesignations()
      const shiftsRes = await GetAllShifts()

      if (locRes.status === 200) {
        setDropdowns((prev) => ({
          ...prev,
          locations: locRes.data?.data || [],
        }))
      }

      if (depRes.status === 200) {
        setDropdowns((prev) => ({
          ...prev,
          departments: depRes.data?.data || [],
        }))
      }

      if (desRes.status === 200) {
        setDropdowns((prev) => ({
          ...prev,
          designations: desRes.data?.data || [],
        }))
      }

      if (shiftsRes.status === 200) {
        setDropdowns((prev) => ({
          ...prev,
          shifts: shiftsRes.data?.data || [],
        }))
      }
    } catch (error) {
      console.error('Error fetching dropdown:', error)
    } finally {
      setIsDownloadingMasters(false)
    }
  }

  useEffect(() => {
    fetchDataForRefExcel()
  }, [])

  const handleDownloadRefExcel = () => {
    const wb = XLSX.utils.book_new()

    const locationRows = (dropdowns.locations || []).map((x) => ({
      'Location Name': x.locationName ?? '',
    }))

    const departmentRows = (dropdowns.departments || []).map((x) => ({
      'Department Name': x.departmentName ?? '',
    }))

    const designationRows = (dropdowns.designations || []).map((x) => ({
      'Designation Name': x.designationName ?? '',
    }))

    const shiftRows = (dropdowns.shifts || []).map((x) => ({
      'Shift Name': x.shiftName ?? '',
      'Start Time': x?.startTime ?? '',
      'End Time': x?.endTime ?? '',
    }))

    const wsLocations =
      locationRows.length > 0
        ? XLSX.utils.json_to_sheet(locationRows)
        : XLSX.utils.aoa_to_sheet([['Locations'], ['No data found']])

    const wsDepartments =
      departmentRows.length > 0
        ? XLSX.utils.json_to_sheet(departmentRows)
        : XLSX.utils.aoa_to_sheet([['Departments'], ['No data found']])

    const wsDesignations =
      designationRows.length > 0
        ? XLSX.utils.json_to_sheet(designationRows)
        : XLSX.utils.aoa_to_sheet([['Designations'], ['No data found']])

    const wsShifts =
      shiftRows.length > 0
        ? XLSX.utils.json_to_sheet(shiftRows)
        : XLSX.utils.aoa_to_sheet([['Shifts'], ['No data found']])

    XLSX.utils.book_append_sheet(wb, wsLocations, 'Location master')
    XLSX.utils.book_append_sheet(wb, wsDesignations, 'Designation master')
    XLSX.utils.book_append_sheet(wb, wsDepartments, 'Department master')
    XLSX.utils.book_append_sheet(wb, wsShifts, 'Shift master')

    XLSX.writeFile(wb, 'ReferenceData.xlsx')
  }

  return (
    <>
      <Button onClick={showModal} icon={<HardDriveUpload size={16} />}>
        Bulk Upload
      </Button>

      <Modal
        open={isModalOpen}
        onCancel={() => handleCancel(false)}
        footer={null}
        centered
        width={isMobile ? '100%' : 700}
        style={isMobile ? { top: 0, padding: 0 } : {}}
        maskClosable={!isUploading}
        title={
          <div style={{ textAlign: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>
              Bulk Upload
            </Title>
            <Paragraph style={{ margin: 0, fontSize: 12 }}>
              Upload Excel Sheet at once using this feature.
            </Paragraph>
          </div>
        }
      >
        <Row gutter={[24, 16]}>
          {/* Left column */}
          <Col xs={24} md={12}>
            <a
              href="/VendorEmployeesBulkUploadSample.xlsx"
              download
              style={{ display: 'inline-block', width: '100%' }}
            >
              <Button
                icon={<DownloadOutlined />}
                type="primary"
                block={isMobile}
                aria-label="Download sample Excel sheet"
              >
                Download Sample Sheet
              </Button>
            </a>

            <Paragraph type="secondary" style={{ fontSize: 14, marginTop: 8 }}>
              * Download, fill out, then upload the sample Excel file.
            </Paragraph>

            {uploadError && (
              <Paragraph type="danger" style={{ color: 'red' }}>
                * {uploadError}
              </Paragraph>
            )}

            <Upload
              multiple={false}
              accept=".xlsx"
              beforeUpload={beforeUpload}
              onChange={onChange}
              fileList={fileList}
              onRemove={() => setFileList([])}
              showUploadList={{ showRemoveIcon: true }}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />} block={isMobile} aria-label="Choose Excel file">
                Choose File
              </Button>
            </Upload>

            <div style={{ marginTop: 16 }}>
              <Button
                type="primary"
                loading={isUploading}
                onClick={handleUpload}
                block={isMobile}
                aria-label="Upload selected Excel file"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </Col>
          {/* Right column */}
          <Col xs={24} md={12}>
            <Text strong>Note:</Text>
            <Paragraph style={{ marginBottom: 6 }}>1. Only .xlsx files are supported.</Paragraph>
            <Paragraph style={{ marginBottom: 6 }}>2. Download the sample sheet above.</Paragraph>
            <Paragraph style={{ marginBottom: 0 }}>
              3. Fill out the downloaded sheet and then upload it here.
            </Paragraph>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadRefExcel}
              // style={{ marginTop: '0.5rem' }}
              type="primary"
              loading={isDownloadingMasters}
            >
              Download Masters Reference Excel
            </Button>

            <strong style={{ marginBlock: '0.4rem', display: 'inline-block' }}>
              Required Columns in Excel:
            </strong>
            <Row gutter={[6, 6]}>
              <Col span={12}>1. Work Location</Col>
              <Col span={12}>2. Department</Col>
              <Col span={12}>3. Designation</Col>
              <Col span={12}>4. Date of Joining</Col>
              <Col span={12}>5. Shift</Col>
              <Col span={12}>6. First Name</Col>
              <Col span={12}>7. D.O.B.</Col>
              <Col span={12}>8. Gender</Col>
            </Row>
          </Col>
        </Row>
      </Modal>
    </>
  )
}
