// import React, { useEffect, useState } from 'react'
// import { Modal, Button, Upload, Typography, message, Row, Col, Grid } from 'antd'
// import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
// import axiosInstance from '../../services/axiosInstance'

// const { Paragraph, Text, Title } = Typography
// const { useBreakpoint } = Grid

// export default function PaymentUploader({ isVisible, setIsVisible, refreshData }) {
//   const [fileList, setFileList] = useState([])
//   const [isUploading, setIsUploading] = useState(false)
//   const [uploadError, setUploadError] = useState('')

//   const screens = useBreakpoint()
//   const isMobile = !screens.md

//   // Validate and add to fileList
//   const beforeUpload = (file) => {
//     const isXlsx =
//       file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
//       file.name.toLowerCase().endsWith('.xlsx')

//     if (!isXlsx) {
//       message.error('You can only upload .xlsx file!')
//       return Upload.LIST_IGNORE
//     }
//     setUploadError('')
//     return false
//   }

//   // Keep the controlled fileList in sync
//   const onChange = ({ fileList: newList }) => {
//     setFileList(newList.slice(-1)) // only last 1 file
//   }

//   const handleUpload = async () => {
//     if (fileList.length === 0) {
//       message.warning('Please choose an .xlsx file first.')
//       return
//     }

//     setIsUploading(true)
//     const formData = new FormData()
//     formData.append('file', fileList[0].originFileObj)

//     try {
//       const res = await axiosInstance.post('/api/Uploader/UploadPayment', formData, {
//         headers: { Accept: '*/*' },
//       })

//       if (res.status === 200) {
//         message.success(res.data?.message || 'File uploaded successfully!')
//         refreshData()
//         setFileList([]) // clear selection
//         setIsVisible(false)
//       }
//     } catch (err) {
//       console.log('error: ', err)
//       const errMsg = err?.response?.data?.message || 'Error uploading file.'
//       setUploadError(errMsg)
//       message.error('Upload failed!')
//     } finally {
//       setIsUploading(false)
//       setFileList([])
//     }
//   }

//   setTimeout(() => {
//     setUploadError('')
//   }, 5000)

//   return (
//     <Modal
//       // antd v5: use `open={isVisible}`
//       visible={isVisible}
//       onCancel={() => setIsVisible(false)}
//       footer={null}
//       centered
//       width={isMobile ? '100%' : 700}
//       bodyStyle={{ padding: isMobile ? 16 : 24 }}
//       style={isMobile ? { top: 0, padding: 0 } : {}}
//       destroyOnClose
//       maskClosable={!isUploading}
//       title={
//         <div style={{ textAlign: 'center' }}>
//           <Title level={4} style={{ margin: 0 }}>
//             Bulk Upload
//           </Title>
//           <Paragraph style={{ margin: 0, fontSize: 12 }}>
//             Upload Excel Sheet at once using this feature.
//           </Paragraph>
//         </div>
//       }
//     >
//       <Row gutter={[24, 16]}>
//         {/* Left column */}
//         <Col xs={24} md={12}>
//           <a
//             href="/PaymentUploader.xlsx"
//             download
//             style={{ display: 'inline-block', width: '100%' }}
//           >
//             <Button
//               icon={<DownloadOutlined />}
//               type="primary"
//               block={isMobile}
//               aria-label="Download sample Excel sheet"
//             >
//               Download Sample Sheet
//             </Button>
//           </a>

//           <Paragraph type="secondary" style={{ fontSize: 14, marginTop: 8 }}>
//             * Download, fill out, then upload the sample Excel file. Month format examples: for June
//             – <Text code>Jun-25</Text>, for August – <Text code>Aug-25</Text>.
//           </Paragraph>

//           {uploadError && (
//             <Paragraph type="danger" style={{ color: 'red' }}>
//               * {uploadError}
//             </Paragraph>
//           )}

//           <Upload
//             multiple={false}
//             accept=".xlsx"
//             beforeUpload={beforeUpload}
//             onChange={onChange}
//             fileList={fileList}
//             onRemove={() => setFileList([])}
//             showUploadList={{ showRemoveIcon: true }}
//             maxCount={1}
//           >
//             <Button icon={<UploadOutlined />} block={isMobile} aria-label="Choose Excel file">
//               Choose File
//             </Button>
//           </Upload>

//           <div style={{ marginTop: 16 }}>
//             <Button
//               type="primary"
//               loading={isUploading}
//               onClick={handleUpload}
//               block={isMobile}
//               aria-label="Upload selected Excel file"
//             >
//               {isUploading ? 'Uploading...' : 'Upload'}
//             </Button>
//           </div>
//         </Col>

//         {/* Right column */}
//         <Col xs={24} md={12}>
//           <Text strong>Note:</Text>
//           <Paragraph style={{ marginBottom: 6 }}>1. Only .xlsx files are supported.</Paragraph>
//           <Paragraph style={{ marginBottom: 6 }}>2. Download the sample sheet above.</Paragraph>
//           <Paragraph style={{ marginBottom: 0 }}>
//             3. Fill out the downloaded sheet and then upload it here.
//           </Paragraph>
//         </Col>
//       </Row>
//     </Modal>
//   )
// }


import React, { useEffect, useState } from 'react'
import { Modal, Button, Upload, Typography, message, Row, Col, Grid } from 'antd'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import axiosInstance from '../../services/axiosInstance'
import * as XLSX from 'xlsx'

const { Paragraph, Text, Title } = Typography
const { useBreakpoint } = Grid

// ✅ Convert "NOV-25" -> "NOV-2025" (keeps it as TEXT)
// This prevents backend excel parser from treating "25" as a day and picking current year (2026)
const expandMonthYYToYYYY = (val) => {
  if (val === null || val === undefined) return val
  const s = String(val).trim().toUpperCase()

  const m = s.match(/^([A-Z]{3})-(\d{2})$/)
  if (!m) return val

  const mon = m[1]
  const yy = m[2]
  const validMonths = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
  if (!validMonths.includes(mon)) return val

  // Assumption: payroll years are 20xx
  return `${mon}-20${yy}`
}

// ✅ Read XLSX, find MONTH column, rewrite cells and return a new File
const rewriteMonthColumnInXlsx = async (file) => {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array' })

  const sheetName = wb.SheetNames[0]
  const ws = wb.Sheets[sheetName]
  if (!ws || !ws['!ref']) return file

  const range = XLSX.utils.decode_range(ws['!ref'])

  // find MONTH column from header row (row 1 => r = 0)
  let monthCol = null
  for (let c = range.s.c; c <= range.e.c; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c })
    const cell = ws[addr]
    const header = String(cell?.v ?? '').trim().toUpperCase()
    if (header === 'MONTH') {
      monthCol = c
      break
    }
  }

  // If MONTH header not found, upload original file
  if (monthCol === null) return file

  // Rewrite values in MONTH column (from row 2 onward => r = 1..)
  for (let r = 1; r <= range.e.r; r++) {
    const addr = XLSX.utils.encode_cell({ r, c: monthCol })
    const cell = ws[addr]
    if (!cell) continue

    // Only rewrite string cells like "NOV-25"
    const oldVal = cell.v
    const newVal = expandMonthYYToYYYY(oldVal)

    if (newVal !== oldVal) {
      ws[addr] = { t: 's', v: newVal } // force TEXT cell
    } else {
      // Also force text if it is already string (helps some parsers)
      if (typeof oldVal === 'string') {
        ws[addr] = { t: 's', v: String(oldVal).trim().toUpperCase() }
      }
    }
  }

  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([out], {
    type:
      file.type ||
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  return new File([blob], file.name, { type: blob.type })
}

export default function PaymentUploader({ isVisible, setIsVisible, refreshData }) {
  const [fileList, setFileList] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

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
    return false
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
    setUploadError('')

    try {
      const originalFile = fileList[0].originFileObj

      // ✅ Rewrite month column before upload (NOV-25 -> NOV-2025)
      const fixedFile = await rewriteMonthColumnInXlsx(originalFile)

      const formData = new FormData()
      formData.append('file', fixedFile)

      const res = await axiosInstance.post('/api/Uploader/UploadPayment', formData, {
        headers: { Accept: '*/*' },
      })

      if (res.status === 200) {
        message.success(res.data?.message || 'File uploaded successfully!')
        refreshData()
        setFileList([])
        setIsVisible(false)
      }
    } catch (err) {
      console.log('error: ', err)
      const errMsg = err?.response?.data?.message || 'Error uploading file.'
      setUploadError(errMsg)
      message.error('Upload failed!')
    } finally {
      setIsUploading(false)
      setFileList([])
    }
  }

  useEffect(() => {
    if (!uploadError) return
    const t = setTimeout(() => setUploadError(''), 5000)
    return () => clearTimeout(t)
  }, [uploadError])

  return (
    <Modal
      // antd v4 uses `visible`, v5 uses `open`
      visible={isVisible}
      onCancel={() => setIsVisible(false)}
      footer={null}
      centered
      width={isMobile ? '100%' : 700}
      bodyStyle={{ padding: isMobile ? 16 : 24 }}
      style={isMobile ? { top: 0, padding: 0 } : {}}
      destroyOnClose
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
          <a href="/PaymentUploader.xlsx" download style={{ display: 'inline-block', width: '100%' }}>
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
            * Download, fill out, then upload the sample Excel file. Month format examples: for
            June – <Text code>Jun-25</Text>, for August – <Text code>Aug-25</Text>.
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

          <Paragraph style={{ marginTop: 12, marginBottom: 0 }} type="secondary">
            ✅ Upload fix applied: Month like <Text code>NOV-25</Text> is converted to{' '}
            <Text code>NOV-2025</Text> before uploading to avoid backend parsing bug.
          </Paragraph>
        </Col>
      </Row>
    </Modal>
  )
}
