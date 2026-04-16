// import React, { useState, useEffect } from 'react'
// import { Modal, Button, Upload, Typography, message } from 'antd'
// import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
// import axiosInstance from '../../services/axiosInstance' // adjust path if needed

// const { Paragraph, Text, Title } = Typography

// export default function ApplicantBulkUpload({ isVisible, setIsVisible, refreshData }) {
//   const [fileList, setFileList] = useState([])
//   const [isUploading, setIsUploading] = useState(false)
//   const [uploadError, setUploadError] = useState('')

//   const beforeUpload = (file) => {
//     const isXlsx =
//       file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
//       file.name.toLowerCase().endsWith('.xlsx')

//     if (!isXlsx) {
//       message.error('You can only upload .xlsx file!')
//       return Upload.LIST_IGNORE
//     }
//     setUploadError('')
//     return false // manual upload
//   }

//   const onChange = ({ fileList: newList }) => {
//     // keep only last file
//     setFileList(newList.slice(-1))
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
//       // 🔁 change URL to your actual applicant upload endpoint
//       const res = await axiosInstance.post('/api/Applicant/upload', formData, {
//         headers: { Accept: '*/*' },
//       })

//       if (res.status === 200) {
//         message.success(res.data?.message || 'File uploaded successfully!')
//         refreshData && refreshData()
//         setFileList([])
//         setIsVisible(false)
//       }
//     } catch (err) {
//       console.error('Applicant upload error: ', err)
//       const errMsg = err?.response?.data?.message || 'Error uploading file.'
//       setUploadError(errMsg)
//       message.error('Upload failed!')
//     } finally {
//       setIsUploading(false)
//       setFileList([])
//     }
//   }

//   // auto clear error after 5s
//   useEffect(() => {
//     if (!uploadError) return
//     const t = setTimeout(() => setUploadError(''), 5000)
//     return () => clearTimeout(t)
//   }, [uploadError])

//   return (
//     <Modal
//       title={
//         <div style={{ textAlign: 'center' }}>
//           <Title level={4} style={{ margin: 0 }}>
//             Applicant Bulk Upload
//           </Title>
//           <Paragraph style={{ margin: 0, fontSize: 12 }}>
//             Upload applicant Excel sheet using this feature.
//           </Paragraph>
//         </div>
//       }
//       visible={isVisible}
//       onCancel={() => {
//         setIsVisible(false)
//         setFileList([])
//         setUploadError('')
//       }}
//       footer={null}
//       centered
//       width={700}
//     >
//       <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
//         <div style={{ flex: 1 }}>
//           {/* 🔁 Put your sample file in /public and name it accordingly */}
//           <a href="/applicant_bulk_upload_sample.xlsx" download>
//             <Button icon={<DownloadOutlined />} type="primary">
//               Download Sample Sheet
//             </Button>
//           </a>

//           <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
//             * Download, fill out, then upload the sample Excel file.
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
//             <Button icon={<UploadOutlined />}>Choose File</Button>
//           </Upload>

//           <div style={{ marginTop: 20 }}>
//             <Button type="primary" loading={isUploading} onClick={handleUpload}>
//               {isUploading ? 'Uploading...' : 'Upload'}
//             </Button>
//           </div>
//         </div>

//         <div style={{ flex: 1 }}>
//           <Text strong>Note:</Text>
//           <Paragraph style={{ marginBottom: 4 }}>1. Only .xlsx files are supported.</Paragraph>
//           <Paragraph style={{ marginBottom: 4 }}>2. Download the sample sheet above.</Paragraph>
//           <Paragraph style={{ marginBottom: 4 }}>
//             3. Fill out the downloaded sheet and then upload it here.
//           </Paragraph>
//         </div>
//       </div>
//     </Modal>
//   )
// }



import React, { useState, useEffect } from 'react'
import { Modal, Button, Upload, Typography, message } from 'antd'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import axiosInstance from '../../services/axiosInstance'

const { Paragraph, Text, Title } = Typography

export default function ApplicantBulkUpload({ isVisible, setIsVisible, refreshData }) {
  const [fileList, setFileList] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

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

  const onChange = ({ fileList: newList }) => {
    setFileList(newList.slice(-1))
  }

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Please choose an .xlsx file first.')
      return
    }

    setIsUploading(true)
    const formData = new FormData()

    // 🔴 IMPORTANT: backend expects key "File" (capital F)
    formData.append('File', fileList[0].originFileObj)

    try {
      const res = await axiosInstance.post('/api/ApplicantUpload/upload', formData, {
        headers: {
          // axios will set correct boundary; this is just explicit
          'Content-Type': 'multipart/form-data',
          Accept: '*/*',
        },
      })

      if (res.status === 200) {
        message.success(res.data?.message || 'File uploaded successfully!')
        refreshData && refreshData()
        setFileList([])
        setIsVisible(false)
      }
    } catch (err) {
      console.error('Applicant upload error: ', err)
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
      title={
        <div style={{ textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            Applicant Bulk Upload
          </Title>
          <Paragraph style={{ margin: 0, fontSize: 12 }}>
            Upload applicant Excel sheet using this feature.
          </Paragraph>
        </div>
      }
      open={isVisible} // if you're on antd v5; if v4 keep `visible={isVisible}`
      onCancel={() => {
        setIsVisible(false)
        setFileList([])
        setUploadError('')
      }}
      footer={null}
      centered
      width={700}
    >
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <a href="/applicant_bulk_upload_sample.xlsx" download>
            <Button icon={<DownloadOutlined />} type="primary">
              Download Sample Sheet
            </Button>
          </a>

          <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
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
            <Button icon={<UploadOutlined />}>Choose File</Button>
          </Upload>

          <div style={{ marginTop: 20 }}>
            <Button type="primary" loading={isUploading} onClick={handleUpload}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <Text strong>Note:</Text>
          <Paragraph style={{ marginBottom: 4 }}>1. Only .xlsx files are supported.</Paragraph>
          <Paragraph style={{ marginBottom: 4 }}>2. Download the sample sheet above.</Paragraph>
          <Paragraph style={{ marginBottom: 4 }}>
            3. Fill out the downloaded sheet and then upload it here.
          </Paragraph>
        </div>
      </div>
    </Modal>
  )
}

