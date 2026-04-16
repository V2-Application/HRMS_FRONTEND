import { UploadOutlined } from '@ant-design/icons'
import { Button, Form, Image, Modal, Tabs, Upload } from 'antd'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getEmployeeById } from '../services/Services'
import { useDispatch } from 'react-redux'
import { set } from '../redux/uiSlice'

const UpdateEmployeeDocs = () => {
  const [form] = Form.useForm()
  const params = useParams()
  const dispatch = useDispatch()
  const { empId } = params
  const [fileLists, setFileLists] = useState({})
  const [previewImage, setPreviewImage] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    if (empId) fetchData()
  }, [empId])

  const fetchData = async () => {
    dispatch(set({ loading: true }))
    try {
      const response = await getEmployeeById(empId)
      if (response.status === 200) {
        const docs = response.data.data.documents || []
        const baseUrl = 'https://v2parivar.v2retail.com:9987/'
        const grouped = docs.reduce((acc, doc) => {
          const type = doc.documentType
          if (!acc[type]) acc[type] = []
          acc[type].push({
            ...doc,
            uid: doc.id.toString(),
            name: doc.fileName || doc.filePath.split('\\').pop(),
            status: 'done',
            url: baseUrl + doc.filePath.replace(/\\/g, '/'),
          })
          return acc
        }, {})
        setFileLists(grouped)
        form.setFieldsValue(grouped)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    dispatch(set({ loading: false }))
  }

  const attachmentLabels = [
    { value: 'Pan', label: 'PAN Card Attachment', maxCount: 3 },
    { value: 'Aadhar', label: 'Aadhar Card Attachment', maxCount: 3 },
    { value: 'SalarySlip', label: 'Salary Slip Attachment', maxCount: 3 },
    { value: 'BankPassbook', label: 'Passbook/Cancel Cheque', maxCount: 3 },
    { value: 'BankStatement', label: 'Bank Statement', maxCount: 3 },
    { value: 'PrevOfferLetter', label: 'Prev Company Offer Letter', maxCount: 1 },
    { value: 'Education', label: 'Education Attachment', maxCount: 10 },
    { value: 'Resume', label: 'Resume Attachment', maxCount: 1 },
    { value: 'OfferLetter', label: 'Current Offer Letter', maxCount: 1 },
  ]

  const handleUploadChange =
    (field) =>
    ({ fileList }) => {
      setFileLists((prev) => ({ ...prev, [field]: fileList }))
      form.setFieldValue(field, fileList)
    }

  const handlePreview = async (file) => {
    const url = file.url || file.preview || file.thumbUrl
    if (/\.(png|jpe?g|gif)$/i.test(url)) {
      if (!file.url && file.originFileObj) {
        file.preview = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.readAsDataURL(file.originFileObj)
          reader.onload = () => resolve(reader.result)
        })
      }
      setPreviewImage(url || file.preview)
      setPreviewOpen(true)
    } else {
      window.open(url, '_blank')
    }
  }

  const onFinish = (values) => {
    // values contains file lists per document type
    // console.log('Submitted:', values)
    // dispatch or API call to save uploads
  }

  return (
    <Tabs>
      <Tabs.TabPane tab="Attachments" key="docs">
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={fileLists}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {attachmentLabels.map((att) => (
              <Form.Item
                key={att.value}
                name={att.value}
                label={att.label}
                valuePropName="fileList"
                getValueFromEvent={(e) => e.fileList}
              >
                <Upload
                  listType="picture-card"
                  accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                  beforeUpload={() => false}
                  maxCount={att.maxCount}
                  onChange={handleUploadChange(att.value)}
                  onPreview={handlePreview}
                  multiple={att.maxCount > 1}
                >
                  <div>
                    <UploadOutlined />
                    <div>Upload</div>
                  </div>
                </Upload>
              </Form.Item>
            ))}
          </div>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
        <Image
          style={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            src: previewImage,
            onVisibleChange: (vis) => setPreviewOpen(vis),
          }}
          src={previewImage}
        />
      </Tabs.TabPane>
    </Tabs>
  )
}

export default UpdateEmployeeDocs

// import { UploadOutlined } from '@ant-design/icons'
// import { Button, Image, Tabs, Upload } from 'antd'
// import React, { useEffect, useState } from 'react'
// import { useParams } from 'react-router-dom'
// import { getEmployeeById } from '../services/Services'
// import { useDispatch } from 'react-redux'
// import { set } from '../redux/uiSlice'

// const UpdateEmployeeDocs = () => {
//   const params = useParams()
//   const dispatch = useDispatch()
//   const { empId } = params
//   const [fileLists, setFileLists] = useState({})
//   const [previewImage, setPreviewImage] = useState('')

//   const fetchData = async () => {
//     await dispatch(set({ loading: true }))

//     try {
//       const response = await getEmployeeById(empId)
//       if (response.status === 200) {
//         console.log('response: ', response)

//         const attachdocuments = response?.data?.data?.documents || []
//         const groupedDocuments = attachdocuments.reduce((acc, doc) => {
//           const documentType = doc.documentType
//           if (!acc[documentType]) {
//             acc[documentType] = []
//           }
//           acc[documentType].push(doc)
//           return acc
//         }, {})

//         function addUrlToDocuments(data) {
//           const baseUrl = 'https://v2parivar.v2retail.com:9987/'
//           for (const docType in data) {
//             if (Array.isArray(data[docType])) {
//               data[docType] = data[docType].map((item) => ({
//                 ...item,
//                 url: baseUrl + item.filePath.replace(/\\/g, '/'),
//               }))
//             }
//           }

//           return data
//         }

//         const updatedData = addUrlToDocuments(groupedDocuments)

//         setFileLists(updatedData)
//       }
//     } catch (error) {
//       console.error('error fetching employee data: ', error)
//     }

//     await dispatch(set({ loading: false }))
//   }

//   const attachmentLabels = [
//     { value: 'Pan', lable: 'PAN Card Attachment', maxCount: 3 },
//     { value: 'Aadhar', lable: 'Aadhar Card Attachment', maxCount: 3 },
//     { value: 'SalarySlip', lable: 'Salary Slip Attachment', maxCount: 3 },
//     { value: 'BankPassbook', lable: 'Passbook Attachment/ Cancel Cheque', maxCount: 3 },
//     { value: 'BankStatement', lable: 'Bank Statement', maxCount: 3 },
//     { value: 'PrevOfferLetter', lable: 'Prv Company Offer Letter', maxCount: 1 },
//     { value: 'Education', lable: 'Education Attachment', maxCount: 10 },
//     { value: 'Resume', lable: 'Resume Attachment', maxCount: 1 },
//     { value: 'OfferLetter', lable: 'Current Offer Letter', maxCount: 1 },
//   ]

//   const attachmentKeyToFlagMap = {
//     Pan: 'isPanAttachmentUploaded',
//     Aadhar: 'isAadharAttachmentUploaded',
//     SalarySlip: 'isSalarySlipUploaded',
//     BankPassbook: 'isBankPassbookAttachmentUploaded',
//     BankStatement: 'isBankStatementUploaded',
//     PrevOfferLetter: 'isPrevOfferLetterUploaded',
//     Education: 'isEducationAttachmentUploaded',
//     PassportPhoto: 'isPassportPhotoUploaded',
//     Resume: 'isResumeAttachmentUploaded',
//     OfferLetter: 'isOfferLetterAttachmentUploaded',
//   }

//   const handleUploadChanges = (documentType, info) => {
//     const { file, fileList } = info
//     // Handle deletion
//     if (file.status === 'removed') {
//       setDeletedFiles((prev) => [...prev, file])
//     }

//     setFileLists((prev) => ({
//       ...prev,
//       [documentType]: fileList,
//     }))
//   }

//   const handlePreview = async (file) => {
//     const fileUrl = file.url || file.preview || file.thumbUrl || file.filePath

//     if (isImageFile(fileUrl)) {
//       if (!file.url && !file.preview && file.originFileObj) {
//         file.preview = await getBase64(file.originFileObj)
//       }
//       setPreviewImage(file.url || file.preview || file.filePath)
//       setPreviewOpen(true)
//     } else if (isPdfFile(fileUrl) || isExcelFile(fileUrl) || isWordFile(fileUrl)) {
//       // Open document files in new tab
//       window.open(fileUrl, '_blank')
//     } else {
//       Modal.info({
//         title: 'Unsupported File',
//         content: 'This file type is not supported for preview. Please download it to view.',
//       })
//     }
//   }

//   useEffect(() => {
//     if (empId) fetchData()
//   }, [empId])

//   return (
//     <Tabs>
//       <Tabs.TabPane>
//         <div>
//           {/* <div style={{ marginBottom: 16 }}>
//             <h4 style={{ marginBottom: 4 }}>📎 Document Attachments</h4>
//             <p style={{ color: '#888', fontSize: 14 }}>
//               Upload related documents or images. Each section supports multiple files, limited by
//               type.
//             </p>
//           </div> */}

//           <div
//             style={{
//               display: 'flex',
//               flexWrap: 'wrap',
//               gap: 24,
//               justifyContent: 'flex-start',
//             }}
//           >
//             {attachmentLabels.map((attachment) => {
//               const currentFileList = fileLists[attachment.value] || []
//               const isMaxReached = currentFileList.length >= attachment.maxCount

//               return (
//                 <div
//                   className="upload-card"
//                   key={attachment.value}
//                   style={{
//                     flex: '1 1 250px',
//                     maxWidth: 300,
//                     border: '1px solid #f0f0f0',
//                     borderRadius: 12,
//                     padding: 16,
//                     background: '#fafafa',
//                     boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
//                   }}
//                 >
//                   <h6 style={{ marginBottom: 12 }}>{attachment.lable}</h6>

//                   <Upload
//                     maxCount={attachment.maxCount}
//                     className="custom-upload-attachements"
//                     listType="picture-card"
//                     multiple
//                     onChange={(info) => handleUploadChanges(attachment.value, info)}
//                     beforeUpload={() => false}
//                     fileList={currentFileList}
//                     onPreview={handlePreview}
//                     accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
//                   >
//                     {!isMaxReached && (
//                       <div style={{ textAlign: 'center' }}>
//                         <UploadOutlined style={{ fontSize: 20 }} />
//                         <div style={{ fontSize: 12 }}>Upload</div>
//                       </div>
//                     )}
//                   </Upload>

//                   {previewImage && (
//                     <Image
//                       wrapperStyle={{ display: 'none' }}
//                       preview={{
//                         visible: previewOpen,
//                         onVisibleChange: (visible) => setPreviewOpen(visible),
//                         afterOpenChange: (visible) => !visible && setPreviewImage(''),
//                       }}
//                       src={previewImage}
//                     />
//                   )}
//                 </div>
//               )
//             })}
//           </div>
//         </div>

//         <Button type="primary" htmlType="submit">
//           Submit
//         </Button>
//       </Tabs.TabPane>
//     </Tabs>
//   )
// }

// export default UpdateEmployeeDocs
