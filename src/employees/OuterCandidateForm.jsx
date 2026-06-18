import {
  Form,
  Input,
  InputNumber,
  Upload,
  Button,
  Row,
  Col,
  Card,
  Select,
  Spin,
  Tabs,
  DatePicker,
  Table,
  message,
  Modal,
  Checkbox,
  Image,
  Divider,
  Radio,
  Typography,
} from 'antd'
import {
  PlusOutlined,
  RollbackOutlined,
  UploadOutlined,
  DeleteRowOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import './employee.css'
import dayjs from 'dayjs'
import TextArea from 'antd/es/input/TextArea'
import AcceptOfferModal from '../components/modals/AcceptOfferModal '
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../redux/uiSlice'
import {
  getDropdownLocDesDep,
  getDropdownComp,
  getCandidateById,
  createUpdateCandidate,
  getEmployeeById,
  searchEmployeeDropdown,
  getOcrKey,
} from '../services/Services'
import { useWatch } from 'antd/es/form/Form'
import SalarySlips from '../components/payroll/SalarySlips'
const { Text } = Typography
import LabelWithPhotoButtons from './LabelWithPhotoButtons'
import axiosInstance from '../services/axiosInstance'
import axios from 'axios'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

import { PROMPT_MAP } from '../utils/documentPrompts'

const { RangePicker } = DatePicker

const layout = { labelCol: { span: 24 }, wrapperCol: { span: 24 } }

const validateMessages = {
  required: '${label} is required!',
  types: {
    email: '${label} is not a valid email!',
    number: '${label} must be a number!',
  },
  number: {
    min: '${label} must be at least ${min}',
    max: '${label} cannot exceed ${max}',
  },
}

import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

const OuterCandidateForm = () => {
  const { theme } = useSelector((state) => state.ui)
  const role = useSelector((state) => state.auth.data?.role)
  const { employeeId, isStore } = useSelector((state) => state?.auth?.data ?? {})
  const { pathname, state = {} } = useLocation()
  const { furtherParts = [] } = state || {}
  const navigate = useNavigate()
  const [imageValue, setImageValue] = useState([])
  const [loading, setLoading] = useState(false)
  const params = useParams()
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const [experienceData, setExperienceData] = useState([])
  const [familyMemberdataSource, setFamilyMemberDataSource] = useState([])
  const [referenceData, setReferenceData] = useState([
    {
      key: 'reference_1',
      reference1LastCompany: '',
      contact1LastCompany: '',
      reference2LastCompany: '',
      contact2LastCompany: '',
    },
  ])
  const [qualificationData, setQualificationData] = useState([])
  const [initiateModalOpen, setInitiateModalOpen] = useState(false)
  const [remarks, setRemarks] = useState('')
  const [designations, setDesignations] = useState([])
  const [departments, setDepartments] = useState([{ value: '', label: '' }])
  const [companys, setcompanys] = useState([{ value: '', label: '' }])
  const [locations, setLocations] = useState([])
  const [fileLists, setFileLists] = useState({})
  const [statusId, setStatusId] = useState(0)
  const [applicantCode, setApplicantCode] = useState('')
  const [activeTab, setActiveTab] = useState('1') // Track active tab index
  const [profilePhoto, setProfilePhoto] = useState([])
  const [visible, setVisible] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [previewVideo, setPreviewVideo] = useState('')
  const [isVideoPreview, setIsVideoPreview] = useState(false)
  const [deletedFiles, setDeletedFiles] = useState([])
  const [assignments, setAssignments] = useState([])
  const [transferType, setTransferType] = useState('')
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [assignedOnDate, setassignedOnDate] = useState(null)
  const [releasedOnDate, setreleasedOnDate] = useState(null)
  const [assignedLocation, setassignedLocation] = useState()
  const [assignedDepartment, setAssignmentDepartment] = useState()
  const [assignedDesignation, setAssignedDesignation] = useState()
  const [assignedReason, setassignedReason] = useState()
  const [searchText, setsearchText] = useState('')
  const [Employees, setEmployees] = useState([])
  const [selectedEmpCode, setSelectedEmpCode] = useState('')
  const [searchLoading, setsearchLoading] = useState(false)
  const [isCandidate, setIsCandidate] = useState(false)
  const [ocrData, setOcrData] = useState({})
  const [shiftList, setShiftList] = useState([])
  const isActive = form.getFieldValue(['user', 'isActive'])
  const isRelativeInCompany = useWatch(['user', 'isRelativeInCompany'], form)
  const esicApplicable = useWatch(['user', 'ESICApplicable'], form)
  const isDifferentlyAbled = useWatch(['user', 'differentlyAbled'], form)
  const differentlyAbledReason = useWatch(['user', 'differentlyAbledReason'], form)
  // Watch values of contributing fields
  const watch_basicSalary = Form.useWatch(['user', 'basicSalary'], form)
  const watch_cca = Form.useWatch(['user', 'cca'], form)
  const watch_da = Form.useWatch(['user', 'da'], form)
  const watch_extraAllowance = Form.useWatch(['user', 'extraAllowance'], form)
  const watch_specialAllowance = Form.useWatch(['user', 'specialAllowance'], form)
  const watch_hra = Form.useWatch(['user', 'hra'], form)
  const watch_PFApplicable = Form.useWatch(['user', 'PFApplicable'], form)
  const watch_UANRegistered = Form.useWatch(['user', 'isUANRegistered'], form)
  const watch_location = Form.useWatch(['user', 'location'], form)
  const watchMonthlyGrossCTC = Form.useWatch(['user', 'monthlyGrossCTC'], form)
  const baseLocation = 'Mumbai'
  const dispatch = useDispatch()
  let user = form.getFieldValue('user') || {}
  const [actionMap, setActionMap] = useState({})
  const [openAIOcrResults, setOpenAIOcrResults] = useState({})
  const [ocrProcessing, setOcrProcessing] = useState({})
  const [manuallyDeletedRelations, setManuallyDeletedRelations] = useState([])

  const [fieldTouched, setFieldTouched] = useState(new Set())
  const EDUCATION_DATA_KEY = 'education_qualification_data'
  const [OPENAI_API_KEY, SET_OPENAI_API_KEY] = useState(null)

  // Add this useEffect to sync mother's name to family table

  useEffect(() => {
    localStorage.removeItem(EDUCATION_DATA_KEY)
  }, [])

  const isImageFile = (fileName) => {
    if (!fileName) return false
    const lowerName = fileName.toLowerCase()
    return /\.(jpg|jpeg|png|gif|bmp|webp|jfif)$/i.test(lowerName)
  }
  const isPdfFile = (fileName) => /\.pdf$/i.test(fileName)
  const isExcelFile = (fileName) => /\.(xls|xlsx)$/i.test(fileName)
  const isWordFile = (fileName) => /\.(doc|docx)$/i.test(fileName)
  const isVideoFile = (fileName = '') =>
    /\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i.test(fileName.toLowerCase()) || /^video\//i.test(fileName)
  const rolesToCheck = ['Master']

  // const validateExperienceData = () => {
  //   // If no experience entries, that's okay - skip validation
  //   if (!experienceData || experienceData.length === 0) {
  //     return {
  //       isValid: true, // Allow empty experience list
  //     }
  //   }

  //   // If there are experience entries, validate that they're complete
  //   const invalidEntries = experienceData.filter(
  //     (exp) => !exp.nameOfCompany || !exp.positionHeld || !exp.from || !exp.to || !exp.workLocation,
  //   )

  //   if (invalidEntries.length > 0) {
  //     return {
  //       isValid: false,
  //       message:
  //         'Please fill all required fields in experience entries (Company Name, Position, Work Location, From Date, To Date).',
  //     }
  //   }

  //   return {
  //     isValid: true,
  //   }
  // }

  const showOcrFailureModal = (fileName) => {
    Modal.warning({
      title: 'OCR Processing Failed',
      content: `Unable to process "${fileName}". Please delete and re-upload that file or click on submit button and fill the form manually.`,
      okText: 'OK',
      icon: <ExclamationCircleOutlined />,
    })
  }

  const markFieldTouched = (fieldName) => {
    setFieldTouched((prev) => new Set([...prev, fieldName]))
  }

  const saveEducationDataToLocalStorage = (data) => {
    try {
      localStorage.setItem(EDUCATION_DATA_KEY, JSON.stringify(data))
      console.log('Education data saved to localStorage:', data)
    } catch (error) {
      console.error('Failed to save education data to localStorage:', error)
    }
  }

  const loadEducationDataFromLocalStorage = () => {
    try {
      const data = localStorage.getItem(EDUCATION_DATA_KEY)
      if (data) {
        const parsedData = JSON.parse(data)
        console.log('Education data loaded from localStorage:', parsedData)
        return parsedData
      }
      return []
    } catch (error) {
      console.error('Failed to load education data from localStorage:', error)
      return []
    }
  }

  // const removeEducationDataByFileUID = (fileUID) => {
  //   try {
  //     const currentData = loadEducationDataFromLocalStorage()
  //     const filteredData = currentData.filter((item) => item.file_uid !== fileUID)
  //     saveEducationDataToLocalStorage(filteredData)
  //     console.log(`Removed education data for file UID: ${fileUID}`)
  //     return filteredData
  //   } catch (error) {
  //     console.error('Failed to remove education data:', error)
  //     return []
  //   }
  // }

  const clearAllEducationData = () => {
    try {
      localStorage.removeItem(EDUCATION_DATA_KEY)
      console.log('All education data cleared from localStorage')
    } catch (error) {
      console.error('Failed to clear education data:', error)
    }
  }

  useEffect(() => {
    console.log('Component mounted - loading education data from localStorage')

    // Load education data from localStorage on component mount
    const savedEducationData = loadEducationDataFromLocalStorage()

    if (savedEducationData && savedEducationData.length > 0) {
      setQualificationData(savedEducationData)
      console.log('Loaded education data from localStorage on mount:', savedEducationData)
    } else {
      console.log('No education data found in localStorage on mount')
      // Optionally set empty array to ensure state is initialized
      setQualificationData([])
    }
  }, [])

  useEffect(() => {
    console.log('Qualification data changed, saving to localStorage:', qualificationData)

    // Only save if there's actual data to prevent overwriting with empty arrays
    if (qualificationData && qualificationData.length > 0) {
      saveEducationDataToLocalStorage(qualificationData)
      console.log('Successfully saved education data to localStorage')
    } else if (qualificationData && qualificationData.length === 0) {
      // Handle case where all education data is removed
      console.log('Education data is empty, clearing localStorage')
      clearAllEducationData()
    }
  }, [qualificationData])

  const clearEducationLocalStorageOnSubmit = () => {
    try {
      clearAllEducationData()
      console.log('Education localStorage cleared after form submission')

      // Optional: Also clear the React state to ensure UI is clean
      setQualificationData([])
    } catch (error) {
      console.error('Error clearing education localStorage:', error)
      // Handle error gracefully - don't let localStorage issues break form submission
    }
  }

  // const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
  const fetchOcrKey = async () => {
    try {
      const response = await getOcrKey()

      if (response.status === 200) {
        const key = response.data?.data?.[0]?.key
        SET_OPENAI_API_KEY(key)
      }
    } catch (error) {
      const msg = getApiError(error, 'Error getting ocr key')
      message.error(msg)
      SET_OPENAI_API_KEY(null)
    }
  }

  useEffect(() => {
    fetchOcrKey()
  }, [])

  const convertPDFToImages = async (pdfFile) => {
    try {
      const fileToProcess = pdfFile.originFileObj || pdfFile
      if (!fileToProcess.arrayBuffer) {
        throw new Error('Invalid file object')
      }

      const arrayBuffer = await fileToProcess.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const images = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)

        // SLIGHTLY INCREASED SCALE: 1.3 (was 1.0, original was 2.0)
        const viewport = page.getViewport({ scale: 1.7 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const context = canvas.getContext('2d')

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise

        const imageFile = await new Promise((resolve) => {
          canvas.toBlob(
            (blob) => resolve(new File([blob], `page-${i}.jpg`, { type: 'image/jpeg' })),
            'image/jpeg',
            0.8, // ALSO INCREASED QUALITY: 80% (was 70%)
          )
        })

        images.push(imageFile)
      }

      return images
    } catch (error) {
      console.error('PDF conversion error:', error)
      throw new Error(`Failed to convert PDF: ${error.message}`)
    }
  }

  const getFilteredQualificationData = () => {
    // Remove duplicates based ONLY on education name (case-insensitive)
    const uniqueQualifications = qualificationData.filter(
      (qualification, index, self) =>
        index ===
        self.findIndex(
          (q) => q.education.toLowerCase().trim() === qualification.education.toLowerCase().trim(),
        ),
    )

    return uniqueQualifications
  }

  // Add OpenAI OCR processing function
  const processWithOpenAI = async (file, documentType) => {
    // Safety check: don't process in development
    if (!import.meta.env.PROD) {
      console.log('OCR skipped in development mode')
      return null
    }

    if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('YOUR-API-KEY')) {
      throw new Error('Please configure your OpenAI API key')
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result.split(',')[1]
          const prompt =
            PROMPT_MAP[documentType] || 'Extract all information from this image as JSON.'

          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: prompt },
                    {
                      type: 'image_url',
                      image_url: { url: `data:${file.type};base64,${base64Image}` },
                    },
                  ],
                },
              ],
              max_tokens: 2000,
              temperature: 0.1,
            }),
          })

          if (!response.ok) {
            const errorText = await response.text()
            console.error('OpenAI API Error:', errorText)
            throw new Error(`OpenAI API error: ${response.status}`)
          }

          const data = await response.json()
          const extractedText = data.choices[0].message.content

          // Clean and parse JSON response
          let cleanedText = extractedText.replace(/```json|```/g, '').trim()

          // Remove any trailing commas before closing brackets
          cleanedText = cleanedText.replace(/,(\s*[}\]])/g, '$1')

          const parsedData = JSON.parse(cleanedText)
          resolve(parsedData)
        } catch (error) {
          console.error('OCR processing error:', error)
          resolve({
            error: true,
            message: error.message,
            timestamp: new Date().toISOString(),
          })
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const MAX_TOTAL_SIZE_BYTES = 18 * 1024 * 1024 // 18 MB

  const getSingleFileSize = (file) => {
    // Priority: fresh upload (originFileObj)
    if (file?.originFileObj?.size) return file.originFileObj.size

    // If your backend gives file size in meta, try that too (optional)
    if (file?.__meta?.fileSize) return file.__meta.fileSize

    return 0
  }

  const calculateTotalAttachmentsSize = (
    candidateFileLists = fileLists,
    candidateImageValue = imageValue,
  ) => {
    let total = 0

    // Sum sizes of all attachment files
    Object.values(candidateFileLists || {}).forEach((list) => {
      if (!Array.isArray(list)) return
      list.forEach((file) => {
        total += getSingleFileSize(file)
      })
    })

    // Add profile photo
    if (candidateImageValue && candidateImageValue.length) {
      candidateImageValue.forEach((file) => {
        total += getSingleFileSize(file)
      })
    }

    return total
  }

  // MAIN ENTRY POINT
  const handleUploadChanges = async (attachmentKey, info) => {
    const newFileList = info.fileList || []

    const candidateFileLists = {
      ...fileLists,
      [attachmentKey]: newFileList,
    }

    const totalSize = calculateTotalAttachmentsSize(candidateFileLists, imageValue)

    if (totalSize > MAX_TOTAL_SIZE_BYTES) {
      message.error('Total attachment size (including profile photo) cannot exceed 18 MB.')
      return
    }

    // Delegate to OCR logic
    await processUploadWithOCR(attachmentKey, info)
  }

  const processUploadWithOCR = async (documentType, info) => {
    const { file, fileList } = info

    let newDocType = getDocumentTypeMapping(documentType)

    const skipOcrDocTypes = ['SalarySlip', 'BankStatement', 'BankStatementVideo', 'PrevOfferLetter']
    if (skipOcrDocTypes.includes(documentType)) {
      // Handle file deletion
      if (file.status === 'removed') {
        handleFileRemove(file, documentType)
        return
      }

      // Just update file lists without OCR processing
      setFileLists((prev) => ({ ...prev, [documentType]: fileList }))
      return // Exit early, skip all OCR processing
    }

    // Handle file deletion with corrected logic
    if (file.status === 'removed') {
      handleFileRemove(file, documentType)
      return
    }

    // ✅ ADD THIS BLOCK - Environment Check for OCR
    // Skip OCR processing in development mode
    if (!import.meta.env.PROD) {
      console.log(`Development mode: OCR disabled for ${documentType}`)
      // Still update file lists to show uploaded files
      const updatedFileList = fileList.map((fileItem) => ({
        ...fileItem,
        isOcrProcessed: false, // Mark as not processed
        devMode: true, // Optional: flag to indicate dev mode
      }))
      setFileLists((prev) => ({ ...prev, [documentType]: updatedFileList }))
      return // Exit - no OCR processing
    }
    // ✅ END OF NEW BLOCK

    // Add OCR processing flags to all files
    const updatedFileList = fileList.map((fileItem) => ({
      ...fileItem,
      isOcrProcessed: fileItem.isOcrProcessed || false,
    }))

    // Update file lists state
    setFileLists((prev) => ({ ...prev, [documentType]: updatedFileList }))

    // Filter only files that haven't been OCR processed
    if (Array.isArray(fileList) && fileList.length > 0) {
      const newFiles = updatedFileList.filter(
        (fileItem) =>
          fileItem.originFileObj &&
          !fileItem.isOcrProcessed &&
          fileItem.status !== 'uploading' &&
          fileItem.status !== 'error',
      )

      if (newFiles.length === 0) {
        console.log(`No new files to process for ${documentType} - all already OCR processed`)
        return
      }

      console.log(`Processing ${newFiles.length} new ${documentType} file(s) with OCR...`)
      setOcrProcessing((prev) => ({ ...prev, [newDocType]: true }))

      try {
        // Get existing OCR data
        const existingOcrData = openAIOcrResults[newDocType]?.data || {}
        let combinedExtractedData = { ...existingOcrData }
        const existingProcessedUids = openAIOcrResults[newDocType]?.data?.processed_file_uids || []
        const newProcessedUids = [...existingProcessedUids]

        // Process each new file with file tracking
        for (const uploadedFileItem of newFiles) {
          const uploadedFile = uploadedFileItem.originFileObj
          if (!uploadedFile) continue

          console.log(
            `Processing file: ${uploadedFile.name} (UID: ${uploadedFileItem.uid}) for ${documentType}`,
          )

          let extractedData = {}

          if (uploadedFile.type === 'application/pdf') {
            const images = await convertPDFToImages(uploadedFile)
            let hadPageError = false

            if (newDocType === 'education') {
              const allPagesData = []
              let combinedEducationDetails = []

              for (let i = 0; i < images.length; i++) {
                const pageData = await processWithOpenAI(images[i], newDocType)

                // Check for OCR failure
                if (pageData?.error || !pageData || Object.keys(pageData).length === 0) {
                  hadPageError = true
                  continue // Skip this page but try others
                }

                if (!pageData.error && pageData) {
                  allPagesData.push({
                    page: i + 1,
                    data: pageData,
                    fileName: uploadedFile.name,
                    fileUID: uploadedFileItem.uid,
                  })

                  if (pageData.education_details && Array.isArray(pageData.education_details)) {
                    combinedEducationDetails = [
                      ...combinedEducationDetails,
                      ...pageData.education_details.map((edu) => ({
                        ...edu,
                        source_file: uploadedFile.name,
                        file_uid: uploadedFileItem.uid,
                        _sourceFileUID: uploadedFileItem.uid,
                      })),
                    ]
                  }
                }
              }

              // If any page failed, show modal and mark file as error
              if (hadPageError) {
                showOcrFailureModal(uploadedFile.name)
                setFileLists((prev) => ({
                  ...prev,
                  [documentType]: (prev[documentType] || []).map((item) =>
                    item.uid === uploadedFileItem.uid
                      ? { ...item, status: 'error', isOcrProcessed: false, ocrError: true }
                      : item,
                  ),
                }))
                continue // Skip to next file
              }

              extractedData = {
                all_pages_data: allPagesData,
                education_details: combinedEducationDetails,
                file_name: uploadedFile.name,
                file_uid: uploadedFileItem.uid,
              }
            } else {
              // Handle other PDF types
              for (let i = 0; i < images.length; i++) {
                const pageData = await processWithOpenAI(images[i], newDocType)

                if (pageData?.error || !pageData || Object.keys(pageData).length === 0) {
                  hadPageError = true
                  continue
                }

                if (!pageData.error && pageData) {
                  extractedData = { ...extractedData, ...pageData }
                }
              }

              // Show error for non-education PDFs too
              if (hadPageError) {
                showOcrFailureModal(uploadedFile.name)
                setFileLists((prev) => ({
                  ...prev,
                  [documentType]: (prev[documentType] || []).map((item) =>
                    item.uid === uploadedFileItem.uid
                      ? { ...item, status: 'error', isOcrProcessed: false, ocrError: true }
                      : item,
                  ),
                }))
                continue
              }
            }
          } else if (uploadedFile.type.startsWith('image/')) {
            extractedData = await processWithOpenAI(uploadedFile, newDocType)

            // Check for OCR failure on images
            if (!extractedData || extractedData.error || Object.keys(extractedData).length === 0) {
              showOcrFailureModal(uploadedFile.name)
              setFileLists((prev) => ({
                ...prev,
                [documentType]: (prev[documentType] || []).map((item) =>
                  item.uid === uploadedFileItem.uid
                    ? { ...item, status: 'error', isOcrProcessed: false, ocrError: true }
                    : item,
                ),
              }))
              continue // Skip to next file
            }
          }

          // Mark file as processed after successful OCR
          if (extractedData && !extractedData.error && Object.keys(extractedData).length > 0) {
            setFileLists((prev) => ({
              ...prev,
              [documentType]: prev[documentType].map((fileItem) =>
                fileItem.uid === uploadedFileItem.uid
                  ? { ...fileItem, isOcrProcessed: true }
                  : fileItem,
              ),
            }))

            console.log(`File ${uploadedFile.name} marked as OCR processed`)
            newProcessedUids.push(uploadedFileItem.uid)

            // Merge data based on document type with file tracking
            if (newDocType === 'education') {
              // CORRECTED: Append education data instead of replacing
              if (
                combinedExtractedData.education_details &&
                Array.isArray(combinedExtractedData.education_details)
              ) {
                combinedExtractedData.education_details = [
                  ...combinedExtractedData.education_details,
                  ...(extractedData.education_details || []),
                ]
              } else {
                combinedExtractedData.education_details = extractedData.education_details || []
              }

              if (
                combinedExtractedData.all_pages_data &&
                Array.isArray(combinedExtractedData.all_pages_data)
              ) {
                combinedExtractedData.all_pages_data = [
                  ...combinedExtractedData.all_pages_data,
                  ...(extractedData.all_pages_data || []),
                ]
              } else {
                combinedExtractedData.all_pages_data = extractedData.all_pages_data || []
              }
            } else {
              // General data merging for other document types
              combinedExtractedData = {
                ...combinedExtractedData,
                ...extractedData,
              }
            }
          }
        }

        // Save combined results
        if (Object.keys(combinedExtractedData).length > 0) {
          combinedExtractedData.processed_file_uids = newProcessedUids

          const newResults = {
            ...openAIOcrResults,
            [newDocType]: {
              data: combinedExtractedData,
              timestamp: new Date().toISOString(),
              documentType: newDocType,
            },
          }

          setOpenAIOcrResults(newResults)
          setOcrData((prev) => ({ ...prev, [newDocType]: combinedExtractedData }))
        }
      } catch (error) {
        console.error('OCR processing error:', error)
        message.error(`Error processing ${documentType}: ${error.message}`)
      } finally {
        setOcrProcessing((prev) => ({ ...prev, [newDocType]: false }))
      }
    }
  }

  useEffect(() => {
    if (typeof furtherParts !== null && Array.isArray(furtherParts) && furtherParts?.length > 0) {
      const states = furtherParts?.reduce((acc, fp) => {
        acc[fp.actionFurtherPartName] = fp?.furtherPartStatus
        return acc
      }, {})

      setActionMap(states)
    }
  }, [furtherParts])

  const mapQualificationType = (ocrType) => {
    if (!ocrType) return 'Full-Time' // Default value

    const type = ocrType.toLowerCase().trim()

    // Mapping dictionary
    const typeMapping = {
      regular: 'Full-Time',
      'full-time': 'Full-Time',
      fulltime: 'Full-Time',
      'full time': 'Full-Time',
      'part-time': 'Part-Time',
      parttime: 'Part-Time',
      'part time': 'Part-Time',
      online: 'Online',
      distance: 'Online',
      correspondence: 'Online',
      open: 'Online',
    }

    return typeMapping[type] || 'Full-Time' // Return mapped value or default to Full-Time
  }

  useEffect(() => {
    console.log('Processing OpenAI OCR results', openAIOcrResults)
    if (Object.keys(openAIOcrResults).length === 0) return

    const currentFormData = form.getFieldsValue()
    let updatedData = { ...currentFormData }

    if (!updatedData.user) updatedData.user = {}

    // Initialize variables to track data sources for prioritization
    let panData = null
    let aadhaarData = null

    // Extract PAN and Aadhaar data
    if (openAIOcrResults.pan?.data) {
      panData = openAIOcrResults.pan.data
    }

    if (openAIOcrResults.aadhaarFront?.data) {
      aadhaarData = openAIOcrResults.aadhaarFront.data
    }

    // Process common fields with PAN priority over Aadhaar

    // Date of Birth - PAN takes priority
    if (!fieldTouched.has('dob')) {
      let dobValue = null
      if (panData?.date_of_birth) {
        dobValue = dayjs(panData.date_of_birth, ['YYYY-MM-DD', 'DD-MM-YYYY', 'DD/MM/YYYY']).format(
          'YYYY-MM-DDTHH:mm:ss',
        )
      } else if (aadhaarData?.date_of_birth) {
        dobValue = dayjs(aadhaarData.date_of_birth, [
          'YYYY-MM-DD',
          'DD-MM-YYYY',
          'DD/MM/YYYY',
        ]).format('YYYY-MM-DDTHH:mm:ss')
      }

      if (dobValue && dayjs(dobValue).isValid()) {
        updatedData.user.dob = dobValue
        console.log('DOB set from OCR:', dobValue)
      }
    }

    // Gender - PAN takes priority (if available)
    if (!fieldTouched.has('gender')) {
      let genderValue = null
      if (panData?.gender && panData.gender.trim()) {
        genderValue = panData.gender.charAt(0).toUpperCase() + panData.gender.slice(1).toLowerCase()
      } else if (aadhaarData?.gender) {
        genderValue =
          aadhaarData.gender.charAt(0).toUpperCase() + aadhaarData.gender.slice(1).toLowerCase()
      }

      if (genderValue) {
        updatedData.user.gender = genderValue

        // Auto-set title based on gender if not manually touched
        if (!fieldTouched.has('title')) {
          if (genderValue === 'Male') {
            updatedData.user.title = 'Mr'
          } else if (genderValue === 'Female') {
            updatedData.user.title = 'Ms'
          }
        }
      }
    }

    // Father's Name - PAN takes priority
    if (!fieldTouched.has('fathersName')) {
      if (panData?.father_name) {
        updatedData.user.fathersName = panData.father_name
      } else if (aadhaarData?.father_name) {
        updatedData.user.fathersName = aadhaarData.father_name
      }
    }

    // Name fields - PAN takes priority
    // Full Name - PAN ONLY
    if (!fieldTouched.has('fullName')) {
      if (panData?.name_on_card) {
        updatedData.user.fullName = panData.name_on_card
        console.log('Full name set from PAN:', panData.name_on_card)
      }
    }

    // First Name - PAN ONLY
    if (!fieldTouched.has('firstName')) {
      if (panData?.name_on_card) {
        const nameParts = panData.name_on_card.split(' ')
        updatedData.user.firstName = nameParts[0]
        console.log('First name set from PAN:', nameParts[0])
      }
    }

    // Last Name - PAN ONLY
    if (!fieldTouched.has('lastName')) {
      if (panData?.name_on_card) {
        const nameParts = panData.name_on_card.split(' ')
        if (nameParts.length > 1) {
          updatedData.user.lastName = nameParts[nameParts.length - 1] // Take the last part as last name
          console.log('Last name set from PAN:', nameParts[nameParts.length - 1])
        }
      }
    }

    // Middle Name - PAN ONLY
    if (!fieldTouched.has('middleName')) {
      if (panData?.name_on_card) {
        const nameParts = panData.name_on_card.split(' ')
        if (nameParts.length > 2) {
          // If there are more than 2 name parts, middle parts are middle names
          const middleNames = nameParts.slice(1, -1).join(' ')
          if (middleNames) {
            updatedData.user.middleName = middleNames
            console.log('Middle name set from PAN:', middleNames)
          }
        }
      }
    }

    // Process PAN-specific fields
    if (panData) {
      if (!fieldTouched.has('panNo')) {
        updatedData.user.panNo = panData.pan_number
      }
    }

    // Process Aadhaar-specific fields
    if (aadhaarData) {
      if (!fieldTouched.has('aadharNo')) {
        updatedData.user.aadharNo = aadhaarData.aadhaar_number?.replace(/\s/g, '')
      }

      if (!fieldTouched.has('mobile')) {
        updatedData.user.mobile = aadhaarData.mobile_number
      }

      if (!fieldTouched.has('nameOnAadhar')) {
        const fullName = [
          aadhaarData.title,
          aadhaarData.first_name,
          aadhaarData.middle_name,
          aadhaarData.last_name,
        ]
          .filter(Boolean)
          .join(' ')
        if (fullName) {
          updatedData.user.nameOnAadhar = fullName
        }
      }

      // Extract place of birth from Aadhaar state
      if (!fieldTouched.has('placeOfBirth') && aadhaarData.state) {
        updatedData.user.placeOfBirth = aadhaarData.state
        console.log('Place of birth set from Aadhaar state:', aadhaarData.state)
      }

      // Set nationality as Indian for Aadhaar holders
      if (!fieldTouched.has('nationality')) {
        if (aadhaarData.aadhaar_number && aadhaarData.aadhaar_number.length === 12) {
          updatedData.user.nationality = 'Indian'
        }
      }
    }

    // Process Aadhaar Back data
    if (openAIOcrResults.aadhaarBack?.data) {
      const aadhaarBackData = openAIOcrResults.aadhaarBack.data

      if (!fieldTouched.has('presentAddress')) {
        updatedData.user.presentAddress = aadhaarBackData.complete_address
      }

      if (!fieldTouched.has('presentAddressPinCode')) {
        updatedData.user.presentAddressPinCode = aadhaarBackData.pin_code
      }

      // Try to extract place of birth from back side address if not already set
      if (
        !fieldTouched.has('placeOfBirth') &&
        !updatedData.user.placeOfBirth &&
        aadhaarBackData.complete_address
      ) {
        const address = aadhaarBackData.complete_address.toLowerCase()

        if (address.includes('delhi')) {
          updatedData.user.placeOfBirth = 'Delhi'
        } else if (address.includes('mumbai') || address.includes('maharashtra')) {
          updatedData.user.placeOfBirth = 'Maharashtra'
        } else if (
          address.includes('bangalore') ||
          address.includes('bengaluru') ||
          address.includes('karnataka')
        ) {
          updatedData.user.placeOfBirth = 'Karnataka'
        } else if (address.includes('chennai') || address.includes('tamil nadu')) {
          updatedData.user.placeOfBirth = 'Tamil Nadu'
        } else if (address.includes('kolkata') || address.includes('west bengal')) {
          updatedData.user.placeOfBirth = 'West Bengal'
        } else if (address.includes('hyderabad') || address.includes('telangana')) {
          updatedData.user.placeOfBirth = 'Telangana'
        } else if (address.includes('gujarat')) {
          updatedData.user.placeOfBirth = 'Gujarat'
        } else if (address.includes('rajasthan')) {
          updatedData.user.placeOfBirth = 'Rajasthan'
        }

        if (updatedData.user.placeOfBirth) {
          console.log(
            'Place of birth set from Aadhaar back address:',
            updatedData.user.placeOfBirth,
          )
        }
      }
    }

    // Process Bank Passbook data
    if (openAIOcrResults.passbook?.data) {
      const passbookData = openAIOcrResults.passbook.data

      if (!fieldTouched.has('bankName')) {
        updatedData.user.bankName = passbookData.bank_name
      }
      if (!fieldTouched.has('accountNo')) {
        updatedData.user.accountNo = passbookData.account_number
      }
      if (!fieldTouched.has('bankIfscCode')) {
        updatedData.user.bankIfscCode = passbookData.ifsc_code
      }

      if (passbookData.beneficiary_address && !fieldTouched.has('beneficiaryAddress')) {
        updatedData.user.beneficiaryAddress = passbookData.beneficiary_address.full_address
      }
    }

    // Process Resume data - APPEND to existing experience data
    if (openAIOcrResults.resume?.data) {
      const resumeData = openAIOcrResults.resume.data

      if (resumeData.contact_info && !fieldTouched.has('emailAddress')) {
        updatedData.user.emailAddress = resumeData.contact_info.email
      }

      // Process work experience - append to existing data
      if (resumeData.work_experience && Array.isArray(resumeData.work_experience)) {
        const newWorkExperience = resumeData.work_experience.map((exp, index) => ({
          key: Date.now() + index,
          nameOfCompany: exp.company_name || '',
          workLocation: exp.work_location || '',
          positionHeld: exp.position || '',
          from: exp.from_date
            ? dayjs(exp.from_date).isValid()
              ? dayjs(exp.from_date).format('YYYY-MM-DD')
              : null
            : null,
          to: exp.to_date
            ? dayjs(exp.to_date).isValid()
              ? dayjs(exp.to_date).format('YYYY-MM-DD')
              : null
            : null,
          lastCtc: exp.ctc || 0,
        }))

        // Combine with existing experience data
        const existingExperience = experienceData || []
        const combinedExperience = [...existingExperience, ...newWorkExperience]

        // Remove duplicates based on company name and position
        const uniqueExperience = combinedExperience.filter(
          (exp, index, self) =>
            index ===
            self.findIndex(
              (e) =>
                e.nameOfCompany === exp.nameOfCompany &&
                e.positionHeld === exp.positionHeld &&
                e.from === exp.from,
            ),
        )

        setExperienceData(uniqueExperience)
        console.log('Updated experience data with new entries:', uniqueExperience)
      }
    }

    // Process Education data - APPEND to existing qualification data
    if (openAIOcrResults.education?.data) {
      const educationResults = openAIOcrResults.education.data
      let allEducationData = []

      // Extract from main education_details WITH FILE TRACKING
      if (educationResults.education_details && Array.isArray(educationResults.education_details)) {
        allEducationData = educationResults.education_details.map((edu) => ({
          ...edu,
          file_uid: edu.file_uid || edu.source_file_uid, // Preserve file tracking
        }))
      }

      // Extract from all_pages_data WITH FILE TRACKING
      if (educationResults.all_pages_data && Array.isArray(educationResults.all_pages_data)) {
        educationResults.all_pages_data.forEach((pageData) => {
          if (
            pageData.data &&
            pageData.data.education_details &&
            Array.isArray(pageData.data.education_details)
          ) {
            const pageEducationData = pageData.data.education_details.map((edu) => ({
              ...edu,
              file_uid: pageData.fileUID || edu.file_uid, // Use page file UID as fallback
            }))
            allEducationData = [...allEducationData, ...pageEducationData]
          }
        })
      }

      if (allEducationData.length > 0) {
        // Convert OCR data to formatted qualifications WITH FILE TRACKING
        const newQualifications = allEducationData.map((edu, index) => ({
          key: edu.key || `edu_${Date.now()}_${index}`,
          education: edu.education || edu.degree || edu.qualification || '',
          yop: edu.yop || edu.year_of_passing || edu.graduation_year || edu.year || '',
          grade: edu.grade || edu.marks || edu.percentage || edu.cgpa || '',
          type: mapQualificationType(edu.type || edu.mode),
          source_file: edu.source_file,
          file_uid: edu.file_uid, // PRESERVE FILE TRACKING FOR REMOVAL
        }))

        // Load existing qualifications from localStorage
        const existingQualifications = loadEducationDataFromLocalStorage()
        const uniqueQualifications = [...existingQualifications]

        // Add new qualifications with deduplication and file tracking preservation
        newQualifications.forEach((newQual) => {
          const isDuplicate = uniqueQualifications.some(
            (existing) =>
              existing.education.toLowerCase() === newQual.education.toLowerCase() &&
              existing.yop === newQual.yop,
          )

          if (!isDuplicate) {
            uniqueQualifications.push(newQual)
          }
        })

        // Save to localStorage
        saveEducationDataToLocalStorage(uniqueQualifications)

        // Update React state
        setQualificationData(uniqueQualifications)

        console.log('Updated qualification data with localStorage:', uniqueQualifications)
      }
    }

    // Auto-populate Family Table with OCR data (prioritizing PAN for father's name)
    if (familyMemberdataSource.length === 0) {
      const familyMembers = []

      // Add Father - PAN takes priority, but check for alternate sources
      const fatherName =
        panData?.fathername ||
        aadhaarData?.fathername ||
        // Try alternate field names in case OCR uses different keys
        panData?.father_name ||
        aadhaarData?.father_name ||
        panData?.fatherName ||
        aadhaarData?.fatherName

      if (fatherName && !fieldTouched.hasfamilyFather) {
        familyMembers.push({
          key: `father${Date.now()}`,
          familyMemberName: fatherName,
          relation: 'Father',
          dob: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
        })
      }

      // Add Mother - check form field first, then OCR
      const motherName =
        form.getFieldValue(['user', 'mothersName']) ||
        updatedData.user.mothersName ||
        panData?.mothername ||
        aadhaarData?.mothername ||
        // Try alternate field names
        panData?.mother_name ||
        aadhaarData?.mother_name ||
        panData?.motherName ||
        aadhaarData?.motherName

      if (motherName && !fieldTouched.hasfamilyMother) {
        familyMembers.push({
          key: `mother${Date.now()}`,
          familyMemberName: motherName,
          relation: 'Mother',
          dob: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
        })
      }

      // Add Spouse from form if available
      const spouseName = updatedData.user.husbandName || form.getFieldValue(['user', 'husbandName'])
      if (spouseName && !fieldTouched.hasfamilySpouse) {
        const userGender = updatedData.user.gender || form.getFieldValue(['user', 'gender'])
        const spouseRelation =
          userGender === 'Male' ? 'Wife' : userGender === 'Female' ? 'Husband' : 'Spouse'

        familyMembers.push({
          key: `spouse${Date.now()}`,
          familyMemberName: spouseName,
          relation: spouseRelation,
          dob: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
        })
      }

      if (familyMembers.length > 0) {
        setFamilyMemberDataSource((prev) => [...prev, ...familyMembers])
        console.log('Auto-populated family members from OCR', familyMembers)
      }
    }

    // Process Current Offer data
    if (openAIOcrResults.currentOffer?.data) {
      const offerData = openAIOcrResults.currentOffer.data

      // Map salary fields with default value of 0 if not in OCR data
      // ✅ FIXED: Only set if field hasn't been manually touched
      if (!fieldTouched.has('basicSalary')) {
        updatedData.user.basicSalary = parseFloat(
          offerData.basicSalary || offerData.compensation?.basicSalary || 0,
        )
      }

      if (!fieldTouched.has('hra')) {
        updatedData.user.hra = parseFloat(offerData.hra || offerData.compensation?.hra || 0)
      }

      if (!fieldTouched.has('cca')) {
        updatedData.user.cca = parseFloat(offerData.cca || offerData.compensation?.cca || 0)
      }

      if (!fieldTouched.has('da')) {
        updatedData.user.da = parseFloat(offerData.da || offerData.compensation?.da || 0)
      }

      if (!fieldTouched.has('extraAllowance')) {
        updatedData.user.extraAllowance = parseFloat(
          offerData.extraAllowance || offerData.compensation?.extraAllowance || 0,
        )
      }

      if (!fieldTouched.has('specialAllowance')) {
        updatedData.user.specialAllowance = parseFloat(
          offerData.specialAllowance || offerData.compensation?.specialAllowance || 0,
        )
      }

      if (!fieldTouched.has('monthlyGrossCTC')) {
        updatedData.user.monthlyGrossCTC = parseFloat(
          offerData.monthlyGrossCTC || offerData.compensation?.monthlyGrossCTC || 0,
        )
      }

      if (!fieldTouched.has('annuallyNetCTC')) {
        updatedData.user.annuallyNetCTC = parseFloat(
          offerData.annuallyNetCTC || offerData.compensation?.annuallyNetCTC || 0,
        )
      }

      if (!fieldTouched.has('grossSalary')) {
        updatedData.user.grossSalary = parseFloat(
          offerData.grossSalary || offerData.compensation?.grossSalary || 0,
        )
      }

      // Handle boolean fields with default false
      // ✅ FIXED: Only set if field hasn't been manually touched
      if (!fieldTouched.has('PFApplicable') && offerData.benefits?.pfApplicable !== undefined) {
        updatedData.user.PFApplicable = Boolean(offerData.benefits.pfApplicable)
      }

      if (
        !fieldTouched.has('bonusApplicable') &&
        offerData.benefits?.bonusApplicable !== undefined
      ) {
        updatedData.user.bonusApplicable = Boolean(offerData.benefits.bonusApplicable)
      }

      if (!fieldTouched.has('ESICApplicable') && offerData.benefits?.esicApplicable !== undefined) {
        updatedData.user.ESICApplicable = Boolean(offerData.benefits.esicApplicable)
      }

      // Handle other fields
      // ✅ CRITICAL FIX: Only set designation/department if not manually touched
      if (!fieldTouched.has('designation') && offerData.otherDetails?.designation) {
        updatedData.user.designation = offerData.otherDetails.designation
      }

      if (!fieldTouched.has('department') && offerData.otherDetails?.department) {
        updatedData.user.department = offerData.otherDetails.department
      }

      if (!fieldTouched.has('joiningDate') && offerData.otherDetails?.joiningDate) {
        const joiningDate = dayjs(offerData.otherDetails.joiningDate, 'YYYY-MM-DD')
        if (joiningDate.isValid()) {
          updatedData.user.joiningDate = joiningDate.format('YYYY-MM-DDTHH:mm:ss')
        }
      }
    }

    // Update form with processed data
    form.setFieldsValue(updatedData)
    console.log('Final updated form data with PAN priority and auto title:', updatedData)
  }, [openAIOcrResults, familyMemberdataSource.length])

  // --- fetch shift api
  const fetchShiftData = async () => {
    try {
      const response = await axiosInstance.get('/api/DropDown/GetShiftMaster')

      if (response.status === 200) {
        setShiftList(response.data?.data)
      }
    } catch (error) {
      // console.error('shift api err: ', error)
    }
  }

  // --- call shift api on page moount
  useEffect(() => {
    fetchShiftData()
  }, [])

  useEffect(() => {
    const total =
      (parseFloat(watch_basicSalary) || 0) +
      (parseFloat(watch_cca) || 0) +
      (parseFloat(watch_da) || 0) +
      (parseFloat(watch_extraAllowance) || 0) +
      (parseFloat(watch_specialAllowance) || 0) +
      (parseFloat(watch_hra) || 0)

    form.setFieldsValue({
      user: {
        ...form.getFieldValue('user'),
        monthlyGrossCTC: total.toFixed(2),
      },
    })
  }, [
    watch_basicSalary,
    watch_cca,
    watch_da,
    watch_extraAllowance,
    watch_specialAllowance,
    watch_hra,
  ])

  useEffect(() => {
    const total =
      (parseFloat(watch_basicSalary) || 0) +
      (parseFloat(watch_hra) || 0) +
      (parseFloat(watch_cca) || 0) +
      (parseFloat(watch_da) || 0) +
      (parseFloat(watch_specialAllowance) || 0)

    form.setFieldsValue({
      user: {
        ...form.getFieldValue('user'),
        grossSalary: total.toFixed(2),
      },
    })
  }, [watch_basicSalary, watch_hra, watch_cca, watch_da, watch_specialAllowance])

  useEffect(() => {
    if (searchText.length >= 2) {
      setsearchLoading(true)
      const debounceTimer = setTimeout(() => {
        const fetchData = async () => {
          try {
            const res = await searchEmployeeDropdown(searchText)
            if (res?.data?.employees?.length > 0) {
              setEmployees(res.data.employees)
            } else {
              setEmployees([])
            }
          } catch (error) {
            // console.error('Error fetching employee attendance:', error)
            setEmployees([])
          } finally {
            setsearchLoading(false)
          }
        }

        fetchData()
      }, 1000)

      return () => clearTimeout(debounceTimer)
    }
  }, [searchText])

  const handleSearch = (value) => {
    setsearchText(value)
  }

  const handleRegionChange = (value) => {
    setSelectedRegion(value)
    form.setFieldsValue({ store: undefined })
  }

  function getLocationNameById(id) {
    const location = locations.find((loc) => loc.locationId === id)
    return location ? location.locationName : null // or return a default value like "Unknown"
  }

  const handleCancel = (key) => {
    setAssignments((prev) =>
      prev.map((item) => (item.key === key ? { ...item, status: 'Cancelled' } : item)),
    )
    message.info('Assignment cancelled')
  }

  const columns = [
    {
      title: 'Location',
      dataIndex: 'assignedLocationName',
      key: 'assignedLocationName',
      // render: (val) => <span>{getLocationNameById(val)}</span>,
    },
    {
      title: 'Location Code',
      dataIndex: 'assignedLocationSTCode',
      key: 'assignedLocationSTCode',
      // render: (val) => <span>{getLocationNameById(val)}</span>,
    },
    {
      title: 'From',
      dataIndex: ['assignedOnDate', 0],
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'To',
      dataIndex: ['releasedOnDate', 1],
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Status',
      dataIndex: 'transferApprovalStatus',
      key: 'transferApprovalStatus',
      render: (val) => (val === 1 ? 'Approved' : val === 2 ? 'Rejected' : ''),
    },
    {
      title: 'Type',
      dataIndex: 'permanentTransfer',
      key: 'permanentTransfer',
      render: (_, record) =>
        record?.permanentTransfer === true
          ? 'Permanent Transfer'
          : record?.temporaryTransfer === true
            ? 'Temporary Transfer'
            : 'temporaryTransfer',
    },
    {
      title: 'Reason',
      dataIndex: 'assignedReason',
      render: (assignedReason) => <span>{assignedReason}</span>,
    },
    // {
    //   title: 'Status',
    //   dataIndex: 'isActive',
    //   render: (isActive) => <Tag color={'blue'}>{isActive ? 'Active' : 'Deactive'}</Tag>,
    // },
    // {
    //   title: 'Action',
    //   render: (_, record) =>
    //     record.isActive === 'true' ? (
    //       <Button danger onClick={() => handleCancel(record.key)} icon={<CloseOutlined />} />
    //     ) : (
    //       <span>—</span>
    //     ),
    // },
  ]

  const totalTabs = 6

  const offerDetails = {
    position: 'Store Incharge',
    company: 'V2 Retails Ltd',
    startDate: 'May 1, 2025',
    location: 'Remote',
  }

  const handleAccept = () => {
    setVisible(false)
  }

  const validateTabFields = {
    1: [], // Tab 1 (Attachments) - no required fields
    2: [
      ['user', 'title'],
      ['user', 'firstName'],
      ['user', 'dob'],
      ['user', 'gender'],

      ['user', 'fathersName'],

      ['user', 'mothersName'],

      ['user', 'aadharNo'],
      ['user', 'nameOnAadhar'],
      ['user', 'permanentAddress'],
      ['user', 'permanentAddressPinCode'],
      ['user', 'presentAddress'],
      ['user', 'presentAddressPinCode'],
      // ['user', 'CompanyId'],

      ['user', 'panNo'],
    ],
    3: [
      ['user', 'maritalStatus'],
      ['user', 'mobile'],
      ['user', 'isRelativeInCompany'],
      ['user', 'emailAddress'],
      ['user', 'bankIfscCode'],
      ['user', 'bankName'],
      ['user', 'accountNo'],
      // ['user', 'skillType'],
      // ['user', 'differentlyAbledReason'],
      // ['user', 'differentlyAbled'],
      // ['user', 'differentlyAbledRemarks'],
    ],
    4: [], // Tab 4 (Experience) - no required fields
    5: [], // Tab 5 (Qualification) - no required fields
    6: [], // Tab 6 (Location Assignment) - no required fields
    7: [], // Tab 7 (Salary Slip) - no required fields
  }

  watch_UANRegistered && validateTabFields[2]?.push(['user', 'uanNo'])
  watch_PFApplicable && validateTabFields[2]?.push(['user', 'isUANRegistered'])

  // if (pathname !== '/candidate-form') {
  //   validateTabFields[2]?.push(
  //     ['user', 'basicSalary'],
  //     ['user', 'hra'],
  //     ['user', 'cca'],
  //     ['user', 'da'],
  //     ['user', 'extraAllowance'],
  //     ['user', 'specialAllowance'],
  //     ['user', 'monthlyGrossCTC'],
  //     ['user', 'annuallyNetCTC'],
  //   )
  // }

  const validateTabFields_new = {
    2: [
      ['user', 'title'],
      ['user', 'firstName'],
      ['user', 'dob'],
      ['user', 'gender'],
      ['user', 'joiningDate'],
      ['user', 'designation'],
      ['user', 'fathersName'],
      ['user', 'department'],
      ['user', 'mothersName'],
      ['user', 'location'],
      // ['user', 'grossSalary'],
      ['user', 'aadharNo'],
      ['user', 'nameOnAadhar'],
      ['user', 'permanentAddress'],
      ['user', 'permanentAddressPinCode'],
      ['user', 'presentAddress'],
      ['user', 'presentAddressPinCode'],
      ['user', 'CompanyId'],
      // ['user', 'basicSalary'],
      // ['user', 'hra'],
      // ['user', 'cca'],
      // ['user', 'da'],
      // ['user', 'extraAllowance'],
      // ['user', 'specialAllowance'],
      // ['user', 'monthlyGrossCTC'],
      // ['user', 'annuallyNetCTC'],
    ],
    3: [
      ['user', 'maritalStatus'],
      ['user', 'mobile'],
      ['user', 'isRelativeInCompany'],
      ['user', 'emailAddress'],
      ['user', 'bankIfscCode'],
    ],
    // Define tabs 3, 4, 5 if needed...
  }

  const validateProfilePhoto = () => {
    const hasPhoto =
      Array.isArray(imageValue) &&
      imageValue.length > 0 &&
      (imageValue[0]?.originFileObj || imageValue[0]?.url || imageValue[0]?.thumbUrl)
    return {
      isValid: Boolean(hasPhoto),
      message: 'Please upload a profile photo.',
    }
  }

  const handleTabChange = async (newActiveKey) => {
    if (newActiveKey < activeTab) {
      setActiveTab(newActiveKey)
      setTimeout(() => {
        form.validateFields().catch(() => {})
      }, 0)
      return
    }

    if (newActiveKey > activeTab) {
      try {
        for (let tabIndex = Number(activeTab); tabIndex < Number(newActiveKey); tabIndex++) {
          if (activeTab === '1') {
            const attachmentValidation = validateMandatoryAttachments()
            if (!attachmentValidation.isValid) {
              message.error(
                `Please upload the following mandatory attachments: ${attachmentValidation.missingAttachments.join(', ')}`,
              )
              return
            }
          }

          // Enforce Profile Photo on General tab (tab "2")
          if (activeTab === '2') {
            const { isValid, message: msg } = validateProfilePhoto()
            if (!isValid) {
              message.error(msg)
              return
            }
          }

          if (activeTab === '3') {
            const familyValidation = validateFamilyMembersData()
            if (!familyValidation.isValid) {
              return
            }
            const referenceValidation = validateReferenceData()
            if (!referenceValidation.isValid) {
              return
            }
          }

          if (activeTab === '4') {
            const experienceValidation = validateExperienceData()
            if (!experienceValidation.isValid) {
              message.error(experienceValidation.message)
              return
            }
          }

          if (activeTab === '5') {
            const qualificationValidation = validateQualificationData()
            if (!qualificationValidation.isValid) {
              message.error(qualificationValidation.message)
              return
            }
          }

          const fieldsToValidate = validateTabFields[tabIndex] || []
          if (fieldsToValidate.length > 0) {
            const formValues = form.getFieldValue()
            const emptyFields = fieldsToValidate.filter((field) => {
              const value = formValues[field[0]]?.[field[1]]
              return value === undefined || value === null || value === '' || value === 'none'
            })
            if (emptyFields.length > 0) {
              throw new Error(
                `Tab ${tabIndex} has empty required fields: ${emptyFields.map((f) => f[1]).join(', ')}`,
              )
            }
            await form.validateFields(fieldsToValidate)
          }
        }

        setActiveTab(newActiveKey)
      } catch (errorInfo) {
        console.error('Validation failed:', errorInfo)
        messageApi.error(`Please fill all required fields in tab ${activeTab}.`)
        return
      }
    }
  }

  const handleNext = async () => {
    try {
      if (activeTab === '1') {
        const attachmentValidation = validateMandatoryAttachments()
        if (!attachmentValidation.isValid) {
          message.error(
            `Please upload the following mandatory attachments: ${attachmentValidation.missingAttachments.join(', ')}`,
          )
          return
        }
      }

      // Enforce Profile Photo on General tab (tab "2")
      if (activeTab === '2') {
        const { isValid, message: msg } = validateProfilePhoto()
        if (!isValid) {
          message.error(msg)
          return
        }
      }

      if (activeTab === '3') {
        const familyValidation = validateFamilyMembersData()
        if (!familyValidation.isValid) {
          return
        }
        const referenceValidation = validateReferenceData()
        if (!referenceValidation.isValid) {
          return
        }
      }

      if (activeTab === '4') {
        const experienceValidation = validateExperienceData()
        if (!experienceValidation.isValid) {
          message.error(experienceValidation.message)
          return
        }
      }

      if (activeTab === '5') {
        const qualificationValidation = validateQualificationData()
        if (!qualificationValidation.isValid) {
          message.error(qualificationValidation.message)
          return
        }
      }

      const fieldsToValidate = validateTabFields[activeTab]
      if (fieldsToValidate && fieldsToValidate.length > 0) {
        await form.validateFields(fieldsToValidate)
      }

      setActiveTab((prev) => (Number(prev) < totalTabs ? String(Number(prev) + 1) : prev))
    } catch (errorInfo) {
      console.error('Validation failed:', errorInfo)
      messageApi.error(`Please fill all required fields in tab ${activeTab}.`)
    }
  }

  const handleBack = () => {
    setActiveTab((prev) => (Number(prev) > 1 ? String(Number(prev) - 1) : prev))
  }

  const locat = useLocation()
  const loc = locat.pathname

  const attachmentLabels = [
    { value: 'Pan', lable: 'PAN Card Attachment', maxCount: 1 },
    { value: 'Aadhar', lable: 'Aadhar Attachment (Front)', maxCount: 1 },
    { value: 'AadharBack', lable: 'Aadhar Attachment (Back)', maxCount: 1 },
    { value: 'SalarySlip', lable: 'Salary Slip Attachment', maxCount: 3 },
    { value: 'BankPassbook', lable: 'Passbook Attachment/ Cancel Cheque', maxCount: 3 },
    { value: 'BankStatement', lable: 'Bank Statement', maxCount: 3 },
    { value: 'BankStatementVideo', lable: 'Bank Statement Video', maxCount: 1 },
    { value: 'PrevOfferLetter', lable: 'Prv Company Offer Letter', maxCount: 1 },
    { value: 'Education', lable: 'Education Attachment', maxCount: 10 },
    { value: 'Resume', lable: 'Resume Attachment', maxCount: 1 },
    { value: 'OfferLetter', lable: 'Current Offer Letter', maxCount: 1 },
    // { value: 'OtherAttachment', lable: 'Others', maxCount: 3 },
  ]

  const attachmentLabelsMapFrontend = [
    { value: 'pan', lable: 'PAN Card Attachment', maxCount: 1 },
    { value: 'aadhaar_front', lable: 'Aadhar Front Attachment', maxCount: 1 },
    { value: 'aadhaar_back', lable: 'Aadhar Back Attachment', maxCount: 1 },
    { value: 'SalarySlip', lable: 'Salary Slip Attachment', maxCount: 3 },
    { value: 'BankPassbook', lable: 'Passbook Attachment/ Cancel Cheque', maxCount: 3 },
    { value: 'BankStatement', lable: 'Bank Statement', maxCount: 3 },
    { value: 'BankStatementVideo', lable: 'Bank Statement Video', maxCount: 1 },
    { value: 'PrevOfferLetter', lable: 'Prv Company Offer Letter', maxCount: 1 },
    { value: 'Education', lable: 'Education Attachment', maxCount: 10 },
    { value: 'Resume', lable: 'Resume Attachment', maxCount: 1 },
    { value: 'OfferLetter', lable: 'Current Offer Letter', maxCount: 1 },
    // { value: 'OtherAttachment', lable: 'Others', maxCount: 3 },
  ]

  // frontend key -> backend documentType
  const attachmentFrontendToBackend = {
    pan: 'Pan',
    aadhaar_front: 'Aadhar',
    aadhaar_back: 'Aadhar',
    SalarySlip: 'SalarySlip',
    BankPassbook: 'BankPassbook',
    BankStatement: 'BankStatement',
    BankStatementVideo: 'BankStatementVideo',
    PrevOfferLetter: 'PrevOfferLetter',
    Education: 'Education',
    Resume: 'Resume',
    OfferLetter: 'OfferLetter',
    PassportPhoto: 'PassportPhoto',
    // add any other mappings
  }

  // backend documentType -> preferred frontend key(s) - used in reverse mapping
  const attachmentBackendToFrontend = {
    Pan: ['pan'],
    Aadhar: ['aadhaar_front', 'aadhaar_back'],
    SalarySlip: ['SalarySlip'],
    BankPassbook: ['BankPassbook'],
    BankStatement: ['BankStatement'],
    BankStatementVideo: ['BankStatementVideo'],
    PrevOfferLetter: ['PrevOfferLetter'],
    Education: ['Education'],
    Resume: ['Resume'],
    OfferLetter: ['OfferLetter'],
    PassportPhoto: ['PassportPhoto'],
  }

  const attachmentKeyToFlagMap = {
    Pan: 'isPanAttachmentUploaded',
    Aadhar: 'isAadharAttachmentUploaded',
    AadharBack: 'isAadharBackAttachmentUploaded',
    SalarySlip: 'isSalarySlipUploaded',
    BankPassbook: 'isBankPassbookAttachmentUploaded',
    BankStatement: 'isBankStatementUploaded',
    BankStatementVideo: 'isBankStatementVideoUploaded',
    PrevOfferLetter: 'isPrevOfferLetterUploaded',
    Education: 'isEducationAttachmentUploaded',
    PassportPhoto: 'isPassportPhotoUploaded',
    Resume: 'isResumeAttachmentUploaded',
    OfferLetter: 'isOfferLetterAttachmentUploaded',
    // OtherAttachment: 'isOtherAttachmenttUploaded',
  }

  const validateMandatoryAttachments = () => {
    const mandatoryAttachments = [
      { key: 'Pan', label: 'PAN Card Attachment' },
      { key: 'Aadhar', label: 'Aadhar Attachment (Front)' },
      { key: 'AadharBack', label: 'Aadhar Attachment (Back)' },
      { key: 'BankPassbook', label: 'Passbook Attachment/Cancel Cheque' },
      { key: 'BankStatementVideo', label: 'Bank Statement Video' },
      { key: 'Education', label: 'Education Attachment' },
      { key: 'Resume', label: 'Resume Attachment' },
    ]

    const missingAttachments = []

    mandatoryAttachments.forEach((attachment) => {
      const fileList = fileLists[attachment.key] || []
      if (fileList.length === 0) {
        missingAttachments.push(attachment.label)
      }
    })

    return {
      isValid: missingAttachments.length === 0,
      missingAttachments,
    }
  }

  const handleGoBack = () => {
    switch (pathname) {
      case '/register':
        navigate('/login')
        break
      case `/employee/add_new/${params.id}`:
        navigate('/candidate/form_list')
        break
      case `/employee/update/${params.id}`:
        navigate('/employees/list')
        break
      case '/employee/add_new':
        navigate('/candidate/form_list')
        break
      case '/candidate-form':
        navigate('/login')
        break
    }
  }

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('You can only upload image files!')
      return Upload.LIST_IGNORE
    }

    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!')
      return Upload.LIST_IGNORE
    }

    return false
  }

  const fetchDropdowns = async () => {
    try {
      const response = await getDropdownLocDesDep(dropdowns.join(', '))

      if (response.status) {
        let deptArr = response.data?.Department
        const desgArr = response.data?.Designation
        const locArr = response.data?.Location

        setDepartments(deptArr)
        setDesignations(desgArr)
        setLocations(locArr)
      }
    } catch (error) {
      // console.error('dropdowns api error:', error)
    }
  }

  useEffect(() => {
    fetchDropdowns()
    if (pathname.startsWith('/applicant')) {
      setVisible(true)
    }
  }, [])

  const fetchDropdownsComp = async () => {
    try {
      const response = await getDropdownComp(dropdowns.join(', '))

      if (response.status) {
        const compArr = response.data

        setcompanys(compArr)
      }
    } catch (error) {
      // console.error('dropdowns api error:', error)
    }
  }

  useEffect(() => {
    fetchDropdownsComp()
    if (pathname.startsWith('/applicant')) {
      setVisible(true)
    }
  }, [])

  const dropdowns = ['department', 'designation', 'location']
  const districts = ['Delhi', 'Mumbai', 'Kolkata', 'Chennai']

  // const handleUploadChange = ({ fileList }) => {
  //   if (fileList.length > 0) {
  //     setImageValue([fileList[fileList.length - 1]])
  //   }
  // }

  const handleUploadChange = ({ fileList }) => {
    if (!fileList.length) {
      setImageValue([])
      return
    }

    const latestFile = fileList[fileList.length - 1]
    const candidateImageValue = [latestFile]

    const totalSize = calculateTotalAttachmentsSize(fileLists, candidateImageValue)

    if (totalSize > MAX_TOTAL_SIZE_BYTES) {
      message.error('Total attachment size (including profile photo) cannot exceed 18 MB.')
      return // don’t accept this new photo
    }

    setImageValue(candidateImageValue)
  }

  const success = (data) => {
    messageApi.open({
      type: 'success',
      content: data,
    })
  }
  const message_error = (data) => {
    messageApi.open({
      type: 'error',
      content: data,
    })
  }
  const warning = (data) => {
    messageApi.open({
      type: 'warning',
      content: data,
    })
  }

  const cleanFields = (data) => {
    const cleanedData = {}
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null || value === 'undefined') {
        cleanedData[key] = ''
      } else {
        cleanedData[key] = value
      }
    })
    return cleanedData
  }

  const fetchData = async () => {
    // ============= VALIDATE ALL TABLES BEFORE SUBMISSION =============

    // Validate Family Members
    const familyValidation = validateFamilyMembersData()
    if (!familyValidation.isValid) {
      message.error(familyValidation.message)
      setActiveTab('3') // Navigate to Personal 2 tab
      await dispatch(set({ loading: false }))
      return
    }

    // Validate Experience
    const experienceValidation = validateExperienceData()
    if (!experienceValidation.isValid) {
      message.error(experienceValidation.message)
      setActiveTab('4') // Navigate to Experience tab
      await dispatch(set({ loading: false }))
      return
    }

    // Validate Qualification
    const qualificationValidation = validateQualificationData()
    if (!qualificationValidation.isValid) {
      message.error(qualificationValidation.message)
      setActiveTab('5') // Navigate to Qualification tab
      await dispatch(set({ loading: false }))
      return
    }

    await dispatch(set({ loading: true }))

    try {
      let response

      if (pathname.includes('/employee/update')) {
        response = await getEmployeeById(params.id)
      } else if (pathname.includes('/employee/add_new')) {
        response = await getCandidateById(params.id)
      } else {
        response = await getCandidateById(params.id) // fallback if neither path matches
      }
      // console.log('emp api response:', response)

      const attachdocuments = response?.data?.data?.documents || []
      // const apiData = response?.data?.data?.candidateInfo || {}
      const rawApiData = response?.data?.data?.candidateInfo || {}

      if (rawApiData?.empCode === 'NA' || rawApiData?.empCode?.trim() === '') {
        setIsCandidate(true)
      } else {
        setIsCandidate(false)
      }
      const apiData = cleanFields(rawApiData)
      // console.log('apiData', apiData)
      const educationDatas = response?.data?.data?.qualificationList?.map((item) => ({
        ...item,
        key: new Date(),
      }))

      const experienceDatas = response?.data?.data?.experienceList?.map((item) => ({
        ...item,
        key: Math.random(),
        from: item.from ? dayjs(item.from).format('YYYY-MM-DD') : null,
        to: item.to ? dayjs(item.to).format('YYYY-MM-DD') : null,
      }))

      const familyDatas = response?.data?.data?.familyMembersList?.map((item) => ({
        ...item,
        key: new Date(),
      }))

      const apiReferences = response?.data?.data?.referenceList || []
      const mappedSingleReference =
        apiReferences.length > 0
          ? {
              key: 'reference_1',
              reference1LastCompany: apiReferences[0]?.reference1LastCompany || '',
              contact1LastCompany: apiReferences[0]?.contact1LastCompany || '',
              reference2LastCompany: apiReferences[0]?.reference2LastCompany || '',
              contact2LastCompany: apiReferences[0]?.contact2LastCompany || '',
            }
          : {
              key: 'reference_1',
              reference1LastCompany: '',
              contact1LastCompany: '',
              reference2LastCompany: '',
              contact2LastCompany: '',
            }

      const assignLocation = response?.data?.data?.assignLocations?.map((item, index) => ({
        ...item,
        key: index,
      }))
      // console.log('assignLocation: ', assignLocation)

      const passportPhoto = attachdocuments.filter((doc) => doc.documentType === 'PassportPhoto')
      // console.log('passportphoto', passportPhoto)
      // console.log('attachdocuments', attachdocuments)
      setProfilePhoto(passportPhoto)
      setSelectedEmpCode(apiData?.empCode)
      setStatusId(apiData?.statusId)
      setApplicantCode(apiData?.applicantCode)

      const new_res = {
        monthlyGrossCTC: apiData?.monthlyGrossCTC || 0,
        // annuallyNetCTC: apiData?.annuallyNetCTC || 0,
        // da: apiData?.da || 0,
        // hra: apiData?.hra || 0,
        // basicSalary: apiData?.basicSalary || 0,
        // extraAllowance: apiData?.extraAllowance || 0,
        // annualy_net_ctc: apiData?.annualy_net_ctc || 0,
        // monthly_gross_ctc: apiData?.monthly_gross_ctc || 0,
        // cca: apiData?.cca || 0,
        // specialAllowance: apiData?.specialAllowance || 0,
        title: apiData?.title || '',
        reference: apiData?.reference || '',
        designation: parseInt(apiData?.designation) || '',
        department: parseInt(apiData?.department) || '',
        firstName: apiData?.firstName || '',
        middleName: apiData?.middleName || '',
        lastName: apiData?.lastName || '',
        husbandName: apiData?.husbandName || '',
        fathersName: apiData?.fathersName || '',
        mothersName: apiData?.mothersName || '',
        fullName: apiData?.fullName || '',
        dob: apiData?.dob || '',
        gender: apiData?.gender || '',
        joiningDate: apiData?.joiningDate || '',
        weeklyOff: apiData?.weeklyOff || '',
        statusId: apiData?.statusId || '',
        location: parseInt(apiData?.location) || '',
        uanNo: apiData?.uanNo || '',
        panNo: apiData?.panNo || '',
        empCode: apiData?.empCode || '',
        permanentAddress: apiData?.permanentAddress || '',
        permanentAddressPinCode: apiData?.permanentAddressPinCode || '',
        grossSalary: apiData?.grossSalary || '',
        aadharNo: apiData?.aadharNo || '',
        nameOnAadhar: apiData?.nameOnAadhar || '',
        applicantCode: apiData?.applicantCode || '',
        presentAddress: apiData?.presentAddress || '',
        presentAddressPinCode: apiData?.presentAddressPinCode || '', // Corrected key
        maritalStatus: apiData?.maritalStatus || '',
        mobile: apiData?.mobile || '',
        emailAddress: apiData?.emailAddress || '', // Corrected key
        isRelativeInCompany: apiData?.isRelativeInCompany || false, // Corrected key
        nationality: apiData?.nationality || '',
        religion: apiData?.religion || '',
        bankName: apiData?.bankName || '',
        accountNo: apiData?.accountNo || '', // Corrected key
        bankIfscCode: apiData?.bankIfscCode || '', // Corrected key
        beneficiaryAddress: apiData?.beneficiaryAddress || '',
        // prevEstNo: apiData?.prevEstNo || '',
        prevEstNo: apiData?.prevEstNo || '', // Corrected key
        placeOfBirth: apiData?.placeOfBirth || '',
        PFApplicable: apiData?.pfApplicable || true,
        ESICApplicable: apiData?.esicApplicable || false,
        bonusApplicable: apiData?.bonusApplicable || false,
        CompanyId: apiData?.companyId || '',
        reportingHeadId: apiData?.reportingHeadId,
        isActive: apiData?.isActive,
        // lastWorkingDay: apiData?.lastWorkingDay
        //   ? dayjs(apiData?.lastWorkingDay).format('DD/MM/YYYY')
        //   : '',
        lastWorkingDay: apiData?.lastWorkingDay
          ? dayjs(apiData?.lastWorkingDay).format('YYYY-MM-DD')
          : '',
        differentlyAbled: apiData?.differentlyAbled || false,
        differentlyAbledReason: apiData?.differentlyAbledReason,
        differentlyAbledRemarks: apiData?.differentlyAbledRemarks || '',
        shiftID: apiData?.shiftID || 1,
        isUANRegistered: apiData?.isUANRegistered || false,
      }

      const empDropDownData = [
        {
          employeeId: apiData?.reportingHeadId,
          fullName: apiData?.reportingHeadName,
          ecode: apiData?.reportinHeadEcode,
        },
      ]

      setEmployees(empDropDownData)

      const groupedDocuments = attachdocuments.reduce((acc, doc) => {
        const documentType = doc.documentType
        if (!acc[documentType]) {
          acc[documentType] = []
        }
        // console.log('testt************', acc)
        // console.log('testt************', documentType)

        acc[documentType].push(doc)

        return acc
      }, {})

      function addUrlToDocuments(data) {
        // const baseUrl = 'https://v2parivar.v2retail.com:9987/'
        const baseUrl = import.meta.env.VITE_API_URL
        for (const docType in data) {
          if (Array.isArray(data[docType])) {
            data[docType] = data[docType].map((item) => ({
              ...item,
              url: baseUrl + item.filePath.replace(/\\/g, '/'),
            }))
          }
        }

        return data
      }

      const updatedData = addUrlToDocuments(groupedDocuments)

      const convertedFileLists = {}
      for (const docType in updatedData) {
        const docs = updatedData[docType] || []
        const baseUrl = import.meta.env.VITE_API_URL
        const frontendKeys = attachmentBackendToFrontend[docType] || [docType]
        const frontendKey = frontendKeys[0] || docType

        if (docType === 'Aadhar') {
          const frontArr = []
          const backArr = []

          docs.forEach((doc) => {
            const url = doc.url || `${baseUrl}${doc.filePath.replace(/\\/g, '/')}`
            const fileName =
              doc.fileName ||
              (doc.filePath ? doc.filePath.split(/[/\\]/).pop() : url.split('/').pop())
            const filename = (fileName || '').toLowerCase()
            const fileObj = {
              uid: doc.id || url || Math.random(),
              name: fileName,
              status: 'done',
              url,
              isOcrProcessed: true,
              __meta: doc,
            }

            if (filename.includes('front') || filename.includes('frnt')) {
              frontArr.push(fileObj)
            } else if (filename.includes('back') || filename.includes('bak')) {
              backArr.push(fileObj)
            } else {
              frontArr.push(fileObj)
            }
          })

          if (frontArr.length) convertedFileLists['aadhaar_front'] = frontArr
          if (backArr.length) convertedFileLists['aadhaar_back'] = backArr
        } else {
          convertedFileLists[frontendKey] = docs.map((doc) => {
            const url = doc.url || `${baseUrl}${doc.filePath.replace(/\\/g, '/')}`
            const fileName =
              doc.fileName ||
              (doc.filePath ? doc.filePath.split(/[/\\]/).pop() : url.split('/').pop())
            return {
              uid: doc.id || url || Math.random(),
              name: fileName,
              status: 'done',
              url,
              isOcrProcessed: true,
              __meta: doc,
            }
          })
        }
      }

      setFileLists(convertedFileLists)

      const formattedDatas = {
        ...new_res,
        // dob: new_res.dob ? dayjs(new_res.dob, 'YYYY-MM-DD') : null,
        // joiningDate: new_res.joiningDate ? dayjs(new_res.joiningDate, 'YYYY-MM-DD') : null,
      }

      form.setFieldsValue({ user: formattedDatas })

      setFamilyMemberDataSource(familyDatas)
      setReferenceData([mappedSingleReference])
      setExperienceData(experienceDatas)
      setQualificationData(educationDatas)
      setAssignments(assignLocation)
      // console.log('assigned-----locations---------', assignLocation);
    } catch (error) {
      console.error('Error fetching data emp:', error)
    }
    await dispatch(set({ loading: false }))
  }

  // convert grouped (documentType -> array of docs with url) to frontend fileLists
  function convertApiDocumentsToFileListsFromGrouped(grouped) {
    const result = {}

    for (const docType in grouped) {
      const docs = grouped[docType] || []

      if (docType === 'Aadhar') {
        const frontArr = []
        const backArr = []

        docs.forEach((doc) => {
          const filename = (doc.fileName || doc.filePath || '').toLowerCase()
          const url = doc.url || (baseUrl + (doc.filePath || '')).replace(/\\/g, '/')
          const fileObj = {
            uid: doc.id || url || Math.random(),
            name: doc.fileName || url.split('/').pop(),
            status: 'done',
            url,
            __meta: doc,
          }

          if (filename.includes('front') || filename.includes('frnt')) frontArr.push(fileObj)
          else if (filename.includes('back') || filename.includes('bak')) backArr.push(fileObj)
          else frontArr.push(fileObj)
        })

        if (frontArr.length && backArr.length === 0 && frontArr.length > 1) {
          result['aadhaar_front'] = [frontArr[0]]
          result['aadhaar_back'] = frontArr.slice(1)
        } else {
          if (frontArr.length) result['aadhaar_front'] = frontArr
          if (backArr.length) result['aadhaar_back'] = backArr
        }
      } else {
        const frontendKeys = attachmentBackendToFrontend[docType] || []
        const frontendKey = frontendKeys[0] || docType

        result[frontendKey] = docs.map((doc) => {
          const url = doc.url || (baseUrl + (doc.filePath || '')).replace(/\\/g, '/')
          return {
            uid: doc.id || url || Math.random(),
            name: doc.fileName || url.split('/').pop(),
            status: 'done',
            url,
            __meta: doc,
          }
        })
      }
    }

    return result
  }

  useEffect(() => {
    if (params?.id) fetchData()
  }, [params?.id])

  useEffect(() => {
    if (role === 'Employee') fetchData()
  }, [employeeId])

  const onFinishFailed = ({ errorFields }) => {
    if (errorFields && errorFields.length > 0) {
      message_error('Required fields missing!')
      const firstErrorFieldName = errorFields[0].name
      const fieldInstance = form.getFieldInstance(firstErrorFieldName)
      if (fieldInstance && fieldInstance.focus) {
        setTimeout(() => {
          fieldInstance.focus()
        }, 100)
      }
    }
  }

  const attachmentKeyToUploadMapping = {
    Pan: 'PanAttachment',
    Aadhar: 'AadharAttachment',
    SalarySlip: 'Last3SalarySlip',
    BankPassbook: 'BankPassbookAttachment',
    BankStatement: 'Last3BankStatement',
    BankStatementVideo: 'BankStatementVideo',
    PrevOfferLetter: 'PrevOfferLetter',
    Education: 'EducationAttachment',
    PassportPhoto: 'PassportPhoto',
    Resume: 'ResumeAttachment',
    OfferLetter: 'OfferLetterAttachment',
    AadharBack: 'AadharBackAttachment',
  }

  // ============= TABLE VALIDATION FUNCTIONS =============

  // Validate Family Members Table
  const validateFamilyMembersData = () => {
    // If no family member entries, that's okay
    if (!familyMemberdataSource || familyMemberdataSource.length === 0) {
      return {
        isValid: true,
      }
    }

    // If there are family member entries, validate that they're complete
    const invalidEntries = familyMemberdataSource.filter(
      (member) =>
        !member.familyMemberName ||
        !member.relation ||
        !member.dob ||
        member.dob === '' ||
        member.dob === null,
    )

    if (invalidEntries.length > 0) {
      return {
        isValid: false,
        message: 'Please fill all required fields in Family Members (Name, Relation, DOB).',
      }
    }

    return { isValid: true }
  }

  // Validate Reference (single row) - contact required if reference is filled
  const validateReferenceData = () => {
    if (!referenceData || referenceData.length === 0) {
      return { isValid: true }
    }
    const ref = referenceData[0] || {}
    const isFilled = (v) => v !== undefined && v !== null && String(v).trim() !== ''
    if (isFilled(ref.reference1LastCompany) && !isFilled(ref.contact1LastCompany)) {
      return {
        isValid: false,
        message: 'Contact 1 Last Company is required when Reference 1 Last Company is filled.',
      }
    }
    if (isFilled(ref.reference2LastCompany) && !isFilled(ref.contact2LastCompany)) {
      return {
        isValid: false,
        message: 'Contact 2 Last Company is required when Reference 2 Last Company is filled.',
      }
    }
    return { isValid: true }
  }

  // Validate Experience Table
  const validateExperienceData = () => {
    // If no experience entries, that's okay
    if (!experienceData || experienceData.length === 0) {
      return {
        isValid: true,
      }
    }

    // If there are experience entries, validate that they're complete
    const invalidEntries = experienceData.filter(
      (exp) =>
        !exp.nameOfCompany ||
        !exp.positionHeld ||
        !exp.from ||
        !exp.to ||
        !exp.workLocation ||
        exp.lastCtc === undefined ||
        exp.lastCtc === null ||
        exp.lastCtc === '',
    )

    if (invalidEntries.length > 0) {
      return {
        isValid: false,
        message:
          'Please fill all required fields in Experience entries (Company Name, Position, Work Location, From Date, To Date).',
      }
    }

    return {
      isValid: true,
    }
  }

  // Validate Qualification Table
  const validateQualificationData = () => {
    // If no qualification entries, that's okay
    if (!qualificationData || qualificationData.length === 0) {
      return { isValid: true }
    }

    // If there are qualification entries, validate that ALL required fields are complete
    const invalidEntries = qualificationData.filter(
      (qual) =>
        !qual.education ||
        qual.education === '' ||
        !qual.yop ||
        qual.yop === '' ||
        !qual.grade ||
        qual.grade === '' ||
        !qual.type ||
        qual.type === '',
    )

    if (invalidEntries.length > 0) {
      return {
        isValid: false,
        message:
          'Please fill all required fields in Qualification entries (Education, Year of Passing, Grade, Type).',
      }
    }

    return { isValid: true }
  }

  const onFinish = async (values) => {
    const { isValid, message: msg } = validateProfilePhoto()
    if (!isValid) {
      message.error(msg)
      setActiveTab('2')
      return
    }
    console.log('values: ', values)
    await dispatch(set({ loading: true }))

    // VALIDATE ALL TABLES BEFORE SUBMISSION

    // Validate Family Members
    const familyValidation = validateFamilyMembersData()
    if (!familyValidation.isValid) {
      message.error(familyValidation.message)
      setActiveTab('3') // Navigate to Personal 2 tab
      await dispatch(set({ loading: false }))
      return
    }

    // Validate Experience
    const experienceValidation = validateExperienceData()
    if (!experienceValidation.isValid) {
      message.error(experienceValidation.message)
      setActiveTab('4') // Navigate to Experience tab
      await dispatch(set({ loading: false }))
      return
    }

    // Validate Reference (Personal tab)
    const referenceValidation = validateReferenceData()
    if (!referenceValidation.isValid) {
      message.error(referenceValidation.message)
      setActiveTab('3') // Navigate to Personal tab
      await dispatch(set({ loading: false }))
      return
    }

    // **ADD THIS: Validate Qualification**
    const qualificationValidation = validateQualificationData()
    if (!qualificationValidation.isValid) {
      message.error(qualificationValidation.message)
      setActiveTab('5') // Navigate to Qualification tab
      await dispatch(set({ loading: false }))
      return
    }

    const ef = new FormData()

    // ============= FILE ATTACHMENTS =============
    for (const category in fileLists) {
      const fileList = fileLists[category]
      const fileKey = attachmentKeyToUploadMapping[category] || category

      if (fileList && fileList.length > 0) {
        fileList.forEach((file) => {
          if (file?.originFileObj) {
            ef.append(fileKey, file.originFileObj)
          }
        })
        ef.append(`${attachmentKeyToFlagMap[category]}`, true)
      }
    }

    // ============= GET ALL FORM VALUES =============
    const allFormValues = form.getFieldsValue(true)
    console.log('ALL form values:', allFormValues)
    console.log('User section:', allFormValues.user)

    // ============= APPEND ALL USER FIELDS FIRST =============
    // This ensures ALL fields from the form are sent, not just specific ones
    const userFields = allFormValues.user || {}

    // List of ALL user fields that should be sent
    const fieldNames = [
      'empCode',
      'firstName',
      'middleName',
      'lastName',
      'title',
      'fullName',
      'gender',
      'husbandName',
      'fathersName',
      'mothersName',
      'dob',
      'placeOfBirth',
      'nameOnAadhar',
      'aadharNo',
      'panNo',
      'presentAddress',
      'presentAddressPinCode',
      'permanentAddress',
      'permanentAddressPinCode',
      'maritalStatus',
      'mobile',
      'emailAddress',
      'beneficiaryAddress',
      'nationality',
      'religion',
      'bankName',
      'accountNo',
      'bankIfscCode',
      'isRelativeInCompany',
      'reference',
      'fingerprintRegistered',
      'skillType',
      'differentlyAbled',
      'differentlyAbledReason',
      'differentlyAbledRemarks',
      'prevEstNo',
      'reportingHeadId',
      'isActive',
      'lastWorkingDay',
      'weeklyOff',
      'statusId',
      'applicantCode',
      'CompanyId',
      'shiftID',
      'isUANRegistered',
      'uanNo',
    ]

    // Append all basic user fields
    fieldNames.forEach((fieldName) => {
      const value = userFields[fieldName]

      // Append if value exists (including empty strings, 0, false)
      // Only skip if explicitly undefined or null
      if (value !== undefined && value !== null) {
        ef.append(fieldName, value)
        console.log(`Appended ${fieldName}:`, value)
      }
    })

    // ============= SALARY FIELDS - OVERRIDE IF PRESENT =============
    const salaryFields = [
      'basicSalary',
      'hra',
      'cca',
      'specialAllowance',
      'da',
      'extraAllowance',
      'monthlyGrossCTC',
      'annuallyNetCTC',
      'grossSalary',
    ]

    salaryFields.forEach((field) => {
      let value =
        values.user?.[field] ??
        allFormValues.user?.[field] ??
        form.getFieldValue(['user', field]) ??
        0

      const numValue = Number(value) || 0
      ef.append(field, numValue)
      console.log(`Appended ${field} with value:`, numValue)
    })

    // ============= BOOLEAN SALARY FIELDS =============
    const booleanSalaryFields = ['PFApplicable', 'ESICApplicable', 'bonusApplicable']

    booleanSalaryFields.forEach((field) => {
      let value =
        values.user?.[field] ??
        allFormValues.user?.[field] ??
        form.getFieldValue(['user', field]) ??
        false

      ef.append(field, Boolean(value))
      console.log(`Appended ${field} with value:`, value)
    })

    // ============= DESIGNATION FIELD =============
    const designationValue =
      values.user?.designation ??
      allFormValues.user?.designation ??
      form.getFieldValue(['user', 'designation'])

    if (designationValue !== undefined && designationValue !== null && designationValue !== '') {
      if (typeof designationValue === 'string' && isNaN(designationValue)) {
        const foundDesignation = designations.find(
          (des) =>
            des.designationName.toLowerCase().trim() === designationValue.toLowerCase().trim(),
        )

        if (foundDesignation) {
          ef.append('designation', foundDesignation.designationId)
          console.log('Appended designation with ID:', foundDesignation.designationId)
        }
      } else {
        ef.append('designation', designationValue)
        console.log('Appended designation with value:', designationValue)
      }
    }

    // ============= DEPARTMENT FIELD =============
    const departmentValue =
      values.user?.department ??
      allFormValues.user?.department ??
      form.getFieldValue(['user', 'department'])

    if (
      departmentValue !== undefined &&
      departmentValue !== null &&
      departmentValue !== '' &&
      departmentValue !== 0
    ) {
      if (typeof departmentValue === 'string' && isNaN(departmentValue)) {
        const foundDepartment = departments.find(
          (dep) => dep.departmentName.toLowerCase().trim() === departmentValue.toLowerCase().trim(),
        )

        if (foundDepartment) {
          ef.append('department', foundDepartment.departmentId)
          console.log('Appended department with ID:', foundDepartment.departmentId)
        }
      } else {
        ef.append('department', departmentValue)
        console.log('Appended department with value:', departmentValue)
      }
    }

    // ============= JOINING DATE FIELD =============
    const joiningDateValue =
      values.user?.joiningDate ??
      allFormValues.user?.joiningDate ??
      form.getFieldValue(['user', 'joiningDate'])

    if (
      joiningDateValue !== undefined &&
      joiningDateValue !== null &&
      joiningDateValue !== '' &&
      joiningDateValue !== 0
    ) {
      ef.append('joiningDate', joiningDateValue)
      console.log('Appended joiningDate with value:', joiningDateValue)
    }

    // ============= LOCATION FIELD =============
    const locationValue =
      values.user?.location ??
      allFormValues.user?.location ??
      form.getFieldValue(['user', 'location'])

    if (
      locationValue !== undefined &&
      locationValue !== null &&
      locationValue !== '' &&
      locationValue !== 0
    ) {
      ef.append('location', locationValue)
      console.log('Appended location with value:', locationValue)
    }

    // ============= PROFILE PHOTO =============
    if (imageValue && imageValue.length > 0 && imageValue[0]?.originFileObj) {
      ef.append('PassportPhoto', imageValue[0].originFileObj)
    }

    // ============= ASSIGNMENT DATES =============
    if (assignedOnDate && releasedOnDate) {
      ef.append('assignedOnDate', assignedOnDate)
      ef.append('releasedOnDate', releasedOnDate)
    }

    // ============= EXPERIENCE DATA =============
    const formattedExperienceData = experienceData.map((exp) => ({
      ...exp,
      from: exp.from
        ? dayjs(exp.from).isValid()
          ? dayjs(exp.from).format('YYYY-MM-DD')
          : null
        : null,
      to: exp.to ? (dayjs(exp.to).isValid() ? dayjs(exp.to).format('YYYY-MM-DD') : null) : null,
    }))

    ef.append('FamilyMembersListJson', JSON.stringify(familyMemberdataSource))
    // ============= REFERENCE DATA (single, optional) =============
    const singleReference = (referenceData && referenceData[0]) || {
      reference1LastCompany: '',
      contact1LastCompany: '',
      reference2LastCompany: '',
      contact2LastCompany: '',
    }
    const hasAnyReferenceValue = [
      singleReference.reference1LastCompany,
      singleReference.contact1LastCompany,
      singleReference.reference2LastCompany,
      singleReference.contact2LastCompany,
    ].some((v) => (typeof v === 'string' ? v.trim() !== '' : v !== undefined && v !== null))
    const referencePayload = hasAnyReferenceValue ? [singleReference] : []
    ef.append('ReferenceListJson', JSON.stringify(referencePayload))
    ef.append('ExperienceListJson', JSON.stringify(formattedExperienceData))

    // ============= QUALIFICATION DATA =============
    const getFilteredQualificationData = () => {
      console.log('qualificationData in filter:', qualificationData)

      if (!qualificationData || !Array.isArray(qualificationData)) {
        console.warn('qualificationData is not available or not an array:', qualificationData)
        return []
      }

      return qualificationData.filter(
        (qualification, index, self) =>
          index ===
          self.findIndex(
            (q) =>
              q.education?.toLowerCase()?.trim() === qualification.education?.toLowerCase()?.trim(),
          ),
      )
    }

    const filteredQualifications = getFilteredQualificationData()
    console.log('Filtered qualifications:', filteredQualifications)

    ef.append('QualificationListJson', JSON.stringify(filteredQualifications))

    // ============= ASSIGNMENT LOCATIONS =============
    const AssignLocations = {
      assignedLocation: assignedLocation,
      assignedReason: assignedReason,
      isActive: true,
      assignedOnDate: assignedOnDate ? dayjs(assignedOnDate).format('YYYY-MM-DD') : null,
      releasedOnDate: releasedOnDate ? dayjs(releasedOnDate).format('YYYY-MM-DD') : null,
      permanentTransfer: transferType === 'permanent' ? true : false,
      temporaryTransfer: transferType === 'temporary' ? true : false,
      departmentId: assignedDepartment,
      designationId: assignedDesignation,
      transferApprovalStatus: 4,
      isReportingHeadApproval: 4,
      isHrApproval: 4,
    }

    console.log('Assignment location data:', AssignLocations)
    ef.append('AssignLocationsListJson', JSON.stringify(AssignLocations))

    // ============= APPEND ID FOR UPDATE =============
    if (params?.id) {
      ef.append('id', params?.id)
    }

    // ============= DEBUG: LOG ALL FORMDATA ENTRIES =============
    console.log('=== FormData Contents ===')
    for (let [key, value] of ef.entries()) {
      console.log(`${key}:`, value)
    }

    // ============= API CALL =============
    try {
      await dispatch(set({ loading: true }))
      const id = params.id

      const response = await createUpdateCandidate({ ef, id, pathname })

      console.log('response', response)

      if (response.status === 200) {
        message.success(params.id ? 'Updated Successfully' : 'Created Successfully')
        clearEducationLocalStorageOnSubmit()
        navigate('/login')
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      message.error(error.response?.data?.message || 'Upload Failed')
    } finally {
      await dispatch(set({ loading: false }))
    }
  }

  const runUpdateFunction = async (values) => {
    // Validate all required fields before submission
    try {
      const allRequiredFields = []

      // Collect all required fields from all tabs
      Object.values(validateTabFields).forEach((fields) => {
        allRequiredFields.push(...fields)
      })

      if (allRequiredFields.length > 0) {
        await form.validateFields(allRequiredFields)
      }

      await onFinish(values)
    } catch (errorInfo) {
      // console.error('Form validation failed:', errorInfo)
      messageApi.error('Please fill all required fields before submitting.')
      return
    }
  }

  const addRowExperienceData = () => {
    setExperienceData([
      ...experienceData,
      {
        key: Date.now(),
        nameOfCompany: '',
        workLocation: '',
        positionHeld: '',
        from: null, // Set to null instead of formatted date
        to: null, // Set to null instead of formatted date
        lastCtc: 0,
      },
    ])
  }

  const deleteExperienceRow = (key) => {
    const updatedData = experienceData.filter((item) => item.key !== key)
    setExperienceData(updatedData)
  }

  const addRowQualificationData = () => {
    setQualificationData([
      ...qualificationData,
      { key: Date.now(), education: '', yop: '', grade: '', type: '' },
    ])
  }

  const deleteQualificationRow = (key) => {
    const updatedData = qualificationData.filter((item) => item.key !== key)
    setQualificationData(updatedData)
  }

  const handleInputChange = (id, field, value) => {
    const newData = experienceData.map((item) => {
      if (item.key === id) {
        return { ...item, [field]: value }
      }
      return item
    })
    setExperienceData(newData)
  }

  // ============= FAMILY MEMBER FUNCTIONS =============

  const addRowFamilyData = () => {
    setFamilyMemberDataSource([
      ...familyMemberdataSource,
      {
        key: `family_${Date.now()}_${Math.random()}`, // Unique key
        familyMemberName: '',
        relation: '',
        dob: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      },
    ])
  }

  const deleteFamilyRow = (key) => {
    console.log('Deleting family member with key:', key)

    // Find the relation being deleted
    const memberToDelete = familyMemberdataSource.find((item) => item.key === key)

    if (memberToDelete && memberToDelete.relation) {
      // Track this relation as manually deleted
      setManuallyDeletedRelations((prev) => [...prev, memberToDelete.relation.toLowerCase()])
    }

    const updatedData = familyMemberdataSource.filter((item) => item.key !== key)
    setFamilyMemberDataSource(updatedData)
    message.success('Family member removed successfully')
  }

  const handleFamilyInputChange = (id, field, value) => {
    const newData = familyMemberdataSource.map((item) => {
      if (item.key === id) {
        return { ...item, [field]: value }
      }
      return item
    })
    setFamilyMemberDataSource(newData)
  }

  // ============= REFERENCE TABLE FUNCTIONS =============

  const addRowReferenceData = () => {
    setReferenceData([
      ...referenceData,
      {
        key: `reference_${Date.now()}_${Math.random()}`,
        reference1LastCompany: '',
        contact1LastCompany: '',
        reference2LastCompany: '',
        contact2LastCompany: '',
      },
    ])
  }

  const deleteReferenceRow = (key) => {
    const updatedData = referenceData.filter((item) => item.key !== key)
    setReferenceData(updatedData)
    message.success('Reference removed successfully')
  }

  const handleReferenceInputChange = (id, field, value) => {
    const newData = referenceData.map((item) => {
      if (item.key === id) {
        return { ...item, [field]: value }
      }
      return item
    })
    setReferenceData(newData)
  }

  // ============= SYNC DATA FROM GENERAL TAB TO FAMILY TABLE =============

  useEffect(() => {
    console.log('=== Family Member Sync useEffect Triggered ===')

    const wasManuallyDeleted = (relation) => {
      return manuallyDeletedRelations.includes(relation.toLowerCase())
    }

    // Get current form values
    const currentFormValues = form.getFieldsValue()
    const userValues = currentFormValues.user || {}

    console.log('Current user values:', userValues)
    console.log('Current family members:', familyMemberdataSource)

    // Get names from form
    const fatherName = userValues.fathersName
    const motherName = userValues.mothersName
    const spouseName = userValues.husbandName
    const userGender = userValues.gender

    console.log('Names from form:', { fatherName, motherName, spouseName, userGender })

    // Create a copy of current family members
    let updatedFamilyMembers = [...familyMemberdataSource]

    // Helper function to check if a family member with a specific relation exists
    const hasFamilyMember = (relation) => {
      return updatedFamilyMembers.some(
        (member) => member.relation?.toLowerCase() === relation.toLowerCase(),
      )
    }

    // Helper function to update existing family member
    const updateFamilyMember = (relation, newName) => {
      const index = updatedFamilyMembers.findIndex(
        (member) => member.relation?.toLowerCase() === relation.toLowerCase(),
      )

      if (index !== -1) {
        // Update existing member
        updatedFamilyMembers[index] = {
          ...updatedFamilyMembers[index],
          familyMemberName: newName,
        }
        console.log(`Updated ${relation}:`, updatedFamilyMembers[index])
        return true
      }
      return false
    }

    // Helper function to add new family member
    const addFamilyMember = (relation, name) => {
      const newMember = {
        key: `${relation.toLowerCase()}_${Date.now()}`,
        familyMemberName: name,
        relation: relation,
        dob: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      }
      updatedFamilyMembers.push(newMember)
      console.log(`Added ${relation}:`, newMember)
    }

    // Helper function to remove family member if name is cleared
    const removeFamilyMember = (relation) => {
      updatedFamilyMembers = updatedFamilyMembers.filter(
        (member) => member.relation?.toLowerCase() !== relation.toLowerCase(),
      )
      console.log(`Removed ${relation} from family members`)
    }

    // Handle Father
    if (fatherName && fatherName.trim()) {
      // Only add/update if NOT manually deleted
      if (!wasManuallyDeleted('Father')) {
        if (hasFamilyMember('Father')) {
          updateFamilyMember('Father', fatherName)
        } else {
          addFamilyMember('Father', fatherName)
        }
      }
    } else {
      // If father name is cleared, remove from family table AND deletion tracking
      if (hasFamilyMember('Father')) {
        removeFamilyMember('Father')
      }
      setManuallyDeletedRelations((prev) => prev.filter((r) => r !== 'father'))
    }

    // Handle Mother
    if (motherName && motherName.trim()) {
      // Only add/update if NOT manually deleted
      if (!wasManuallyDeleted('Mother')) {
        if (hasFamilyMember('Mother')) {
          updateFamilyMember('Mother', motherName)
        } else {
          addFamilyMember('Mother', motherName)
        }
      }
    } else {
      // If mother name is cleared, remove from family table AND deletion tracking
      if (hasFamilyMember('Mother')) {
        removeFamilyMember('Mother')
      }
      setManuallyDeletedRelations((prev) => prev.filter((r) => r !== 'mother'))
    }

    // Handle Spouse (Husband/Wife based on gender)
    if (spouseName && spouseName.trim()) {
      // Determine spouse relation based on user's gender
      let spouseRelation = 'Spouse'
      if (userGender === 'Male') {
        spouseRelation = 'Wife'
      } else if (userGender === 'Female') {
        spouseRelation = 'Husband'
      }

      // Check if any spouse-related entry exists (Husband, Wife, or Spouse)
      const hasSpouse =
        hasFamilyMember('Husband') || hasFamilyMember('Wife') || hasFamilyMember('Spouse')

      if (hasSpouse) {
        // Update existing spouse entry
        updateFamilyMember('Husband', spouseName) ||
          updateFamilyMember('Wife', spouseName) ||
          updateFamilyMember('Spouse', spouseName)
      } else {
        // Add new spouse entry
        addFamilyMember(spouseRelation, spouseName)
      }
    } else {
      // If spouse name is cleared, remove all spouse-related entries
      if (hasFamilyMember('Husband')) removeFamilyMember('Husband')
      if (hasFamilyMember('Wife')) removeFamilyMember('Wife')
      if (hasFamilyMember('Spouse')) removeFamilyMember('Spouse')
    }

    // Check if there were any changes
    const hasChanges =
      JSON.stringify(updatedFamilyMembers) !== JSON.stringify(familyMemberdataSource)

    if (hasChanges) {
      console.log('Family members updated:', updatedFamilyMembers)
      setFamilyMemberDataSource(updatedFamilyMembers)
    } else {
      console.log('No changes in family members')
    }

    // Dependencies: watch for changes in these fields
  }, [
    form.getFieldValue(['user', 'fathersName']),
    form.getFieldValue(['user', 'mothersName']),
    form.getFieldValue(['user', 'husbandName']),
    form.getFieldValue(['user', 'gender']),
  ])

  const handleChange = (field, value, record) => {
    const newData = qualificationData.map((item) => {
      if (item.key === record.key) {
        return { ...item, [field]: value }
      }
      return item
    })
    setQualificationData(newData)
  }

  const handleRemove = (file) => {
    setImageValue((prev) => prev.filter((item) => item.uid !== file.uid))
  }

  const getImageUrl = (file) => {
    if (file?.filePath) return `https://v2parivar.v2retail.com:9987/${file.filePath}`
    if (file?.thumbUrl) return file.thumbUrl
    if (file?.url) return file.url
    if (file?.originFileObj) return URL.createObjectURL(file.originFileObj)
    return null
  }

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const img = new Image()
        img.src = reader.result

        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          // Set canvas to exactly 800x800 pixels
          canvas.width = 800
          canvas.height = 800

          // Enable high-quality image smoothing
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          // Calculate scaling to fit image within 800x800 while maintaining aspect ratio
          const scale = Math.min(800 / img.width, 800 / img.height)
          const scaledWidth = img.width * scale
          const scaledHeight = img.height * scale

          // Center the image on canvas
          const x = (800 - scaledWidth) / 2
          const y = (800 - scaledHeight) / 2

          // Fill background with white (optional, remove for transparent)
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, 800, 800)

          // Draw the image scaled and centered
          ctx.drawImage(img, x, y, scaledWidth, scaledHeight)

          // Convert to base64 with maximum quality (1.0 = 100%)
          const highQualityDataUrl = canvas.toDataURL('image/jpeg', 1.0)
          resolve(highQualityDataUrl)
        }

        img.onerror = (error) => reject(error)
      }
      reader.onerror = (error) => reject(error)
    })

  const handlePreview = async (file) => {
    let previewUrl = file.url || file.preview || file.thumbUrl
    const fileName = file.name || file.fileName || previewUrl
    const fileType = file.type || file.originFileObj?.type || ''

    if (isVideoFile(fileName) || fileType.startsWith('video/')) {
      if (!previewUrl && file.originFileObj) {
        previewUrl = URL.createObjectURL(file.originFileObj)
      }
      if (previewUrl) {
        setPreviewVideo(previewUrl)
        setIsVideoPreview(true)
        setPreviewImage('')
        setPreviewOpen(true)
        return
      }
      Modal.info({
        title: 'Preview Not Available',
        content: 'Cannot generate preview for this video file.',
      })
      return
    }

    // Generate preview for new uploads without URLs (images)
    if (!previewUrl && file.originFileObj) {
      try {
        previewUrl = await getBase64(file.originFileObj)
        file.preview = previewUrl
      } catch (error) {
        console.error('Error generating preview:', error)
        Modal.info({
          title: 'Preview Not Available',
          content: 'Cannot generate preview for this file.',
        })
        return
      }
    }

    if (!previewUrl) {
      Modal.info({
        title: 'Preview Not Available',
        content: 'Cannot generate preview for this file.',
      })
      return
    }

    if (isImageFile(fileName)) {
      setPreviewImage(previewUrl)
      setPreviewVideo('')
      setIsVideoPreview(false)
      setPreviewOpen(true)
    } else if (isPdfFile(fileName)) {
      window.open(previewUrl, '_blank')
    } else if (isExcelFile(fileName) || isWordFile(fileName)) {
      window.open(previewUrl, '_blank')
    } else {
      Modal.info({
        title: 'Unsupported File',
        content: 'This file type is not supported for preview. Please download it to view.',
      })
    }
  }

  // 1. Initialize imageValue with profilePhoto (if available)
  useEffect(() => {
    if (profilePhoto && profilePhoto.length > 0 && imageValue.length === 0) {
      setImageValue(profilePhoto)
    }
  }, [profilePhoto, imageValue.length])

  const handleTrimOnBlur = (form, name) => (e) => {
    const value = e.target.value?.trim()
    const [fieldGroup, fieldName] = name

    form.setFieldsValue({
      [fieldGroup]: {
        ...form.getFieldValue(fieldGroup),
        [fieldName]: value,
      },
    })
  }

  const getDocumentTypeMapping = (documentType) => {
    const mapping = {
      Pan: 'pan',
      Aadhar: 'aadhaarFront',
      AadharBack: 'aadhaarBack',
      Resume: 'resume',
      Education: 'education',
      BankPassbook: 'passbook',
      BankStatement: 'bankStatement',
      BankStatementVideo: 'bankStatementVideo',
      OfferLetter: 'currentOffer',
      PrevOfferLetter: 'prevOfferLetter',
      SalarySlip: 'salarySlip',
    }
    return mapping[documentType] || documentType.toLowerCase()
  }

  const handleFileRemove = (file, documentType) => {
    // Track deleted files for backend
    setDeletedFiles((prev) => [...prev, file])

    // Mapping helper
    const getDocumentTypeMapping = (docType) => {
      const mapping = {
        Pan: 'pan',
        Aadhar: 'aadhaarFront',
        AadharBack: 'aadhaarBack',
        Resume: 'resume',
        Education: 'education',
        BankPassbook: 'passbook',
        BankStatement: 'bankStatement',
        BankStatementVideo: 'bankStatementVideo',
        OfferLetter: 'currentOffer',
        PrevOfferLetter: 'prevOfferLetter',
        SalarySlip: 'salarySlip',
      }
      return mapping[docType] || docType.toLowerCase()
    }

    // Update file lists and perform all dependent cleanups atomically
    setFileLists((prev) => {
      const currentList = prev[documentType] || []
      const updatedList = currentList.filter((item) => item.uid !== file.uid)
      const next = { ...prev, [documentType]: updatedList }

      const newDocType = getDocumentTypeMapping(documentType)
      const noneLeft = updatedList.length === 0

      // EDUCATION
      if (documentType === 'Education') {
        if (noneLeft) {
          // All education files removed: clear arrays + localStorage + OCR caches
          clearAllEducationData()
          setQualificationData([])
          setOpenAIOcrResults((prevOcr) => {
            const u = { ...prevOcr }
            delete u.education
            return u
          })
          setOcrData((prevOcrData) => {
            const u = { ...prevOcrData }
            delete u.education
            return u
          })
        } else {
          // Single education file removed: prune only entries contributed by this file
          setQualificationData((prevQuals) => {
            const filtered = (prevQuals || []).filter((q) => q.file_uid !== file.uid)
            saveEducationDataToLocalStorage(filtered)
            return filtered
          })

          // Also prune OCR cache for that education file UID
          setOpenAIOcrResults((prevOcr) => {
            const u = { ...prevOcr }
            if (u.education?.data) {
              const data = { ...u.education.data }

              if (Array.isArray(data.education_details)) {
                data.education_details = data.education_details.filter(
                  (edu) => edu.file_uid !== file.uid,
                )
              }
              if (Array.isArray(data.all_pages_data)) {
                data.all_pages_data = data.all_pages_data.filter((p) => p.fileUID !== file.uid)
              }
              if (Array.isArray(data.processed_file_uids)) {
                data.processed_file_uids = data.processed_file_uids.filter(
                  (uid) => uid !== file.uid,
                )
              }

              const hasDetails =
                Array.isArray(data.education_details) && data.education_details.length > 0
              const hasPages = Array.isArray(data.all_pages_data) && data.all_pages_data.length > 0

              if (!hasDetails && !hasPages) {
                delete u.education
              } else {
                u.education = { ...u.education, data }
              }
            }
            return u
          })

          // Keep ocrData mirror in sync
          setOcrData((prevOcrData) => {
            const u = { ...prevOcrData }
            if (u.education) {
              const data = { ...u.education }

              if (Array.isArray(data.education_details)) {
                data.education_details = data.education_details.filter(
                  (edu) => edu.file_uid !== file.uid,
                )
              }
              if (Array.isArray(data.all_pages_data)) {
                data.all_pages_data = data.all_pages_data.filter((p) => p.fileUID !== file.uid)
              }

              const hasDetails =
                Array.isArray(data.education_details) && data.education_details.length > 0
              const hasPages = Array.isArray(data.all_pages_data) && data.all_pages_data.length > 0

              if (!hasDetails && !hasPages) {
                delete u.education
              } else {
                u.education = data
              }
            }
            return u
          })
        }
      }

      // RESUME (Experience)
      else if (documentType === 'Resume') {
        if (noneLeft) {
          // All resumes removed: empty experience list and clear related OCR cache
          setExperienceData([])

          setOpenAIOcrResults((prevOcr) => {
            const u = { ...prevOcr }
            delete u.resume
            return u
          })
          setOcrData((prevOcrData) => {
            const u = { ...prevOcrData }
            delete u.resume
            return u
          })

          // Optional: clear resume-derived email if not manually touched
          const current = form.getFieldsValue()
          if (!fieldTouched.has('emailAddress')) {
            form.setFieldsValue({
              user: { ...(current?.user || {}), emailAddress: undefined },
            })
          }
        }
        // If a single resume file is removed but some remain, keep experience as-is (no file UID tracking for entries)
      }

      // OFFER LETTER clean-up (retain existing behavior)
      else if (documentType === 'OfferLetter' && noneLeft) {
        const currentFormData = form.getFieldsValue()
        const fieldsToReset = {
          basicSalary: 0,
          hra: 0,
          cca: 0,
          da: 0,
          specialAllowance: 0,
          extraAllowance: 0,
          monthlyGrossCTC: 0,
          annuallyNetCTC: 0,
          grossSalary: 0,
          PFApplicable: false,
          ESICApplicable: false,
          bonusApplicable: false,
        }

        const updatedUser = { ...(currentFormData.user || {}) }
        Object.keys(fieldsToReset).forEach((field) => {
          if (!fieldTouched.has(field)) {
            updatedUser[field] = fieldsToReset[field]
          }
        })

        if (!fieldTouched.has('designation')) updatedUser.designation = undefined
        if (!fieldTouched.has('department')) updatedUser.department = undefined
        if (!fieldTouched.has('joiningDate')) updatedUser.joiningDate = undefined

        form.setFieldsValue({ user: updatedUser })

        // Clear OCR cache for current offer
        setOpenAIOcrResults((prevOcr) => {
          const u = { ...prevOcr }
          delete u.currentOffer
          return u
        })
        setOcrData((prevOcrData) => {
          const u = { ...prevOcrData }
          delete u.currentOffer
          return u
        })
      }

      // Generic OCR cache cleanup for single-file categories when none left
      if (noneLeft && !['Education', 'Resume', 'OfferLetter'].includes(documentType)) {
        setOpenAIOcrResults((prevOcr) => {
          const u = { ...prevOcr }
          delete u[newDocType]
          return u
        })
        setOcrData((prevOcrData) => {
          const u = { ...prevOcrData }
          delete u[newDocType]
          return u
        })
      }

      return next
    })

    return true // allow removal
  }

  return (
    <>
      {contextHolder}
      <Card className="custom-card" style={{ minHeight: '100vh', position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            position: 'absolute',
            top: '15px',
            right: '20px',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          {loc !== '/register' && loc !== '/employee/add_new' && loc !== '/employee-form' && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? 'green' : 'red',
                  }}
                />
                <Text>{isActive ? 'Active' : 'Inactive'}</Text>
              </span>

              <span>
                <b>Status:</b> {statusId == 4 && 'Pending'}
              </span>
              <span>
                <b>Application Code:</b> {applicantCode}
              </span>
            </div>
          )}
        </div>
        <Button
          type="primary"
          shape="circle"
          icon={<RollbackOutlined />}
          size={'middle'}
          onClick={handleGoBack}
          style={{ position: 'absolute', top: '15px', left: '20px' }}
        />

        <Form
          className={theme === 'dark' ? 'dark-theme' : ''}
          form={form}
          onFinishFailed={onFinishFailed}
          {...layout}
          // name="user-form"
          name="user"
          onFinish={runUpdateFunction}
          validateMessages={validateMessages}
          layout="vertical"
        >
          <Tabs
            defaultActiveKey="1"
            activeKey={activeTab}
            onChange={handleTabChange}
            key={activeTab}
          >
            <Tabs.TabPane tab="Attachments" key="1">
              <div style={{ padding: 20 }}>
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ marginBottom: 4 }}>📎 Document Attachments</h4>
                  <p style={{ color: '#888', fontSize: 14 }}>
                    Upload related documents or images. Each section supports multiple files,
                    limited by type.{'\n'}
                    <span style={{ color: '#e22329', fontSize: 16 }}>
                      Upload one file at a time
                    </span>
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 24,
                    justifyContent: 'flex-start',
                  }}
                >
                  {attachmentLabels.map((attachment) => {
                    const currentFileList = fileLists[attachment.value] || []
                    const isMaxReached = currentFileList.length >= attachment.maxCount
                    const documentType =
                      attachment.value === 'Aadhar'
                        ? 'aadhaarFront'
                        : attachment.value === 'Pan'
                          ? 'pan'
                          : attachment.value === 'AadharBack'
                            ? 'aadhaarBack'
                            : attachment.value === 'SalarySlip'
                              ? 'salarySlip'
                              : attachment.value === 'BankPassbook'
                                ? 'passbook'
                                : attachment.value === 'BankStatement'
                                  ? 'bankStatement'
                                  : attachment.value === 'BankStatementVideo'
                                    ? 'bankStatementVideo'
                                    : attachment.value === 'PrevOfferLetter'
                                      ? 'prevOfferLetter'
                                      : attachment.value === 'Education'
                                        ? 'education'
                                        : attachment.value === 'Resume'
                                          ? 'resume'
                                          : attachment.value === 'OfferLetter'
                                            ? 'currentOffer'
                                            : attachment.value

                    const isProcessing = ocrProcessing[documentType]
                    const hasOCRResult = openAIOcrResults[documentType]

                    const mandatoryAttachments = [
                      'Pan',
                      'Aadhar',
                      'AadharBack',
                      'BankPassbook',
                      'BankStatementVideo',
                      'Education',
                      'Resume',
                    ]
                    const isMandatory = mandatoryAttachments.includes(attachment.value)
                    const isEmpty = currentFileList.length === 0
                    const acceptFileTypes =
                      attachment.value === 'BankStatementVideo'
                        ? 'video/*,.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv'
                        : '.pdf,.doc,.docx,.txt,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.jfif'

                    return (
                      <div
                        className="upload-card"
                        key={attachment.value}
                        style={{
                          flex: '1 1 250px',
                          maxWidth: 300,
                          border: '1px solid #f0f0f0',
                          borderRadius: 12,
                          padding: 16,
                          background: '#fafafa',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        }}
                      >
                        <h6 style={{ marginBottom: 12 }}>
                          {attachment.lable}
                          {isMandatory && <span style={{ color: 'red' }}> *</span>}
                        </h6>
                        <Image.PreviewGroup>
                          <Upload
                            maxCount={attachment.maxCount}
                            className="custom-upload-attachements"
                            listType="picture-card"
                            multiple
                            fileList={fileLists[attachment.value] || []}
                            onChange={(info) => handleUploadChanges(attachment.value, info)}
                            onRemove={(file) => handleFileRemove(file, attachment.value)}
                            beforeUpload={() => false}
                            onPreview={handlePreview}
                            accept={acceptFileTypes}
                          >
                            {!isMaxReached && (
                              <div style={{ textAlign: 'center' }}>
                                {isProcessing ? (
                                  <Spin size="small" />
                                ) : (
                                  <UploadOutlined style={{ fontSize: 20 }} />
                                )}
                                <div style={{ fontSize: 12 }}>
                                  {isProcessing ? 'Processing...' : 'Upload'}
                                </div>
                              </div>
                            )}
                          </Upload>
                          {currentFileList.some((file) => file.ocrError) && (
                            <div style={{ marginTop: 8, color: '#ff4d4f', fontSize: '12px' }}>
                              ⚠️ OCR processing failed. Please re-upload.
                            </div>
                          )}
                        </Image.PreviewGroup>

                        {/* {isMandatory && isEmpty && (
                          <div style={{ marginTop: 8, color: '#ff4d4f', fontSize: '12px' }}>
                            ⚠️ This attachment is mandatory
                          </div>
                        )} */}

                        {/* OCR Processing status */}
                        {/* {isProcessing && (
                          <div style={{ marginTop: 8, color: '#1890ff', fontSize: '12px' }}>
                            🔄 Processing with OCR in background...
                          </div>
                        )} */}

                        {/* OCR Success status */}
                        {/* {hasOCRResult && !isProcessing && (
                          <div style={{ marginTop: 8, color: '#52c41a', fontSize: '12px' }}>
                            ✅ OCR completed - Data extracted successfully
                          </div>
                        )} */}
                      </div>
                    )
                  })}
                </div>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="General" key="2" className={theme === 'dark' ? 'dark-theme' : ''}>
              <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    label="Profile Photo"
                    required
                    valuePropName="fileList"
                    getValueFromEvent={(e) => e?.fileList}
                    labelCol={{ span: 24 }}
                    style={{ textAlign: 'center' }}
                  >
                    <Upload
                      className="custom profile-photo"
                      listType="picture-card"
                      maxCount={1}
                      fileList={imageValue}
                      onChange={handleUploadChange}
                      beforeUpload={beforeUpload}
                      showUploadList={false}
                      onRemove={handleRemove}
                    >
                      {imageValue.length > 0 ? (
                        <div className="upload-image-wrapper">
                          <img
                            src={getImageUrl(imageValue[0])}
                            alt="avatar"
                            className="uploaded-image"
                          />
                          <div className="upload-hover-overlay">
                            <PlusOutlined style={{ fontSize: 24, color: '#fff' }} />
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center' }}>
                          <PlusOutlined style={{ fontSize: 24, color: '#999' }} />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} name={['user', 'empCode']} label="Emp. Code">
                    <Input
                      disabled={loc !== '/employee-form'}
                      tabIndex={1}
                      onChange={() => markFieldTouched('empCode')}
                      onBlur={handleTrimOnBlur(form, ['user', 'empCode'])}
                    />
                  </Form.Item>

                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'firstName']}
                    label="First Name"
                    rules={[{ required: true, message: 'First name is required' }]}
                  >
                    <Input
                      tabIndex={3}
                      onChange={() => markFieldTouched('firstName')}
                      onBlur={handleTrimOnBlur(form, ['user', 'firstName'])}
                    />
                  </Form.Item>

                  <Form.Item labelCol={{ span: 24 }} name={['user', 'lastName']} label="Last Name">
                    <Input
                      tabIndex={5}
                      onChange={() => markFieldTouched('lastName')}
                      onBlur={handleTrimOnBlur(form, ['user', 'lastName'])}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'title']}
                    label="Title"
                    rules={[
                      { required: true },
                      {
                        validator: (_, value) =>
                          value === 'none'
                            ? Promise.reject(new Error('Please select a valid title'))
                            : Promise.resolve(),
                      },
                    ]}
                  >
                    <Select tabIndex={2} onChange={() => markFieldTouched('title')}>
                      <Select.Option value="none">Select</Select.Option>
                      <Select.Option value="Mr">Mr</Select.Option>
                      <Select.Option value="Ms">Ms</Select.Option>
                      <Select.Option value="Mrs">Mrs</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'middleName']}
                    label="Middle Name"
                  >
                    <Input
                      tabIndex={4}
                      onChange={() => markFieldTouched('middleName')}
                      onBlur={handleTrimOnBlur(form, ['user', 'middleName'])}
                    />
                  </Form.Item>

                  <Form.Item labelCol={{ span: 24 }} name={['user', 'fullName']} label="Full Name">
                    <Input
                      tabIndex={6}
                      onChange={() => markFieldTouched('fullName')}
                      onBlur={handleTrimOnBlur(form, ['user', 'fullName'])}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'gender']}
                    label="Gender"
                    rules={[
                      { required: true, message: 'Gender is required' },
                      {
                        validator: (_, value) =>
                          value === 'none'
                            ? Promise.reject(new Error('Please select a valid gender'))
                            : Promise.resolve(),
                      },
                    ]}
                  >
                    <Select tabIndex={7} onChange={() => markFieldTouched('gender')}>
                      <Select.Option value="none">Select</Select.Option>
                      <Select.Option value="Male">Male</Select.Option>
                      <Select.Option value="Female">Female</Select.Option>
                      <Select.Option value="Other">Others</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'husbandName']}
                    label="Spouse Name"
                  >
                    <Input
                      tabIndex={10}
                      onChange={() => markFieldTouched('husbandName')}
                      onBlur={handleTrimOnBlur(form, ['user', 'husbandName'])}
                    />
                  </Form.Item>

                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'aadharNo']}
                    label="Aadhar No."
                    rules={[
                      { required: true, message: 'Aadhar No. is required' },
                      {
                        pattern: /^[2-9]\d{11}$/,
                        message:
                          'Enter a valid 12-digit Aadhaar number and must not start with 0 or 1',
                      },
                    ]}
                  >
                    <Input
                      maxLength={12}
                      tabIndex={13}
                      onChange={() => markFieldTouched('aadharNo')}
                      onBlur={handleTrimOnBlur(form, ['user', 'aadharNo'])}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'fathersName']}
                    label="Father's Name"
                    rules={[{ required: true, message: 'Father name is required' }]}
                  >
                    <Input
                      tabIndex={8}
                      onChange={() => markFieldTouched('fathersName')}
                      onBlur={handleTrimOnBlur(form, ['user', 'fathersName'])}
                    />
                  </Form.Item>

                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'placeOfBirth']}
                    label="Place of Birth"
                  >
                    <Input
                      tabIndex={11}
                      onChange={() => markFieldTouched('placeOfBirth')}
                      onBlur={handleTrimOnBlur(form, ['user', 'placeOfBirth'])}
                    />
                  </Form.Item>

                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'nameOnAadhar']}
                    label="Name on Aadhar"
                    rules={[{ required: true, message: 'Name on aadhaar is required' }]}
                  >
                    <Input
                      tabIndex={14}
                      onChange={() => markFieldTouched('nameOnAadhar')}
                      onBlur={handleTrimOnBlur(form, ['user', 'nameOnAadhar'])}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'mothersName']}
                    label="Mother's Name"
                    rules={[{ required: true, message: 'Mother name is required' }]}
                  >
                    <Input
                      tabIndex={9}
                      onChange={() => markFieldTouched('mothersName')}
                      onBlur={handleTrimOnBlur(form, ['user', 'mothersName'])}
                    />
                  </Form.Item>

                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'panNo']}
                    rules={[
                      { required: true, message: 'Please enter PAN No.' },
                      {
                        pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i,
                        message: 'Please enter a valid PAN No. (e.g. ABCDE1234F)',
                      },
                    ]}
                    label="PAN No."
                  >
                    <Input
                      maxLength={10}
                      style={{ textTransform: 'uppercase' }}
                      tabIndex={12}
                      onChange={() => markFieldTouched('panNo')}
                      onBlur={handleTrimOnBlur(form, ['user', 'panNo'])}
                    />
                  </Form.Item>

                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'dob']}
                    label="Date of Birth"
                    getValueProps={(value) => ({
                      value: value ? dayjs(value, ['YYYY-MM-DD', 'YYYY-MM-DDTHH:mm:ss']) : null,
                    })}
                    getValueFromEvent={(date) => (date ? date.format('YYYY-MM-DDTHH:mm:ss') : null)}
                    rules={[
                      {
                        required: true,
                        message: 'Please select your date of birth',
                      },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve()

                          const birthDate = dayjs(value, ['YYYY-MM-DD', 'YYYY-MM-DDTHH:mm:ss'])
                          if (!birthDate.isValid()) {
                            return Promise.reject(new Error('Invalid date'))
                          }

                          const isAtLeast18 = dayjs().diff(birthDate, 'year') >= 18
                          return isAtLeast18
                            ? Promise.resolve()
                            : Promise.reject(new Error('You must be at least 18 years old'))
                        },
                      },
                    ]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD-MM-YYYY"
                      tabIndex={15}
                      onChange={() => markFieldTouched('dob')}
                      disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                <Col xs={24} sm={12} md={12}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'presentAddress']}
                    label="Present Address"
                    rules={[{ required: true, message: 'Present address is required' }]}
                  >
                    <Input.TextArea
                      rows={5}
                      tabIndex={28}
                      onChange={() => markFieldTouched('presentAddress')}
                      onBlur={handleTrimOnBlur(form, ['user', 'presentAddress'])}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={12}>
                  <Form.Item
                    label={
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>Permanent Address</span>
                        <Checkbox
                          onChange={(e) => {
                            if (e.target.checked) {
                              form.setFieldsValue({
                                user: {
                                  permanentAddress: form.getFieldValue(['user', 'presentAddress']),
                                  permanentAddressPinCode: form.getFieldValue([
                                    'user',
                                    'presentAddressPinCode',
                                  ]),
                                },
                              })
                            } else {
                              form.setFieldsValue({
                                user: {
                                  permanentAddress: '',
                                  permanentAddressPinCode: '',
                                },
                              })
                            }
                          }}
                          style={{ fontSize: '0.75rem' }}
                        >
                          Same as Present
                        </Checkbox>
                      </div>
                    }
                    labelCol={{ span: 24 }}
                    name={['user', 'permanentAddress']}
                    rules={[{ required: true, message: 'Permanent address is required' }]}
                  >
                    <Input.TextArea
                      rows={5}
                      tabIndex={30}
                      onChange={() => markFieldTouched('permanentAddress')}
                      onBlur={handleTrimOnBlur(form, ['user', 'permanentAddress'])}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                <Col xs={24} sm={12} md={12}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'presentAddressPinCode']}
                    label="Present Address Pin Code"
                    rules={[
                      { required: true, message: 'Present address pin code is required' },
                      { pattern: /^[1-9][0-9]{5}$/, message: 'Enter a valid 6-digit pin code' },
                    ]}
                  >
                    <Input
                      maxLength={6}
                      tabIndex={29}
                      onChange={() => markFieldTouched('presentAddressPinCode')}
                      onBlur={handleTrimOnBlur(form, ['user', 'presentAddressPinCode'])}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={12}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'permanentAddressPinCode']}
                    label="Permanent Address Pin Code"
                    rules={[
                      { required: true, message: 'Permanent address pin code is required' },
                      { pattern: /^[1-9][0-9]{5}$/, message: 'Enter a valid 6-digit pin code' },
                    ]}
                  >
                    <Input
                      maxLength={6}
                      tabIndex={31}
                      onChange={() => markFieldTouched('permanentAddressPinCode')}
                      onBlur={handleTrimOnBlur(form, ['user', 'permanentAddressPinCode'])}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                {watch_PFApplicable && (
                  <Col xs={24} sm={12} md={8}>
                    {!pathname.includes('/candidate-form') && (
                      <Form.Item
                        labelCol={{ span: 24 }}
                        name={['user', 'isUANRegistered']}
                        rules={[{ required: watch_PFApplicable === true ? true : false }]}
                        label={
                          <>
                            UAN Registered &nbsp;
                            <span>
                              {!watch_UANRegistered ? (
                                <a href="/uan_no_registration.mp4" target="_blank">
                                  Register UAN
                                </a>
                              ) : (
                                ''
                              )}
                            </span>
                          </>
                        }
                      >
                        <Select
                          placeholder="Select"
                          onChange={() => markFieldTouched('isUANRegistered')}
                        >
                          <Select.Option value={true}>Yes</Select.Option>
                          <Select.Option value={false}>No</Select.Option>
                        </Select>
                      </Form.Item>
                    )}
                  </Col>
                )}

                {watch_PFApplicable && watch_UANRegistered && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'uanNo']}
                      label="UAN No."
                      rules={[
                        {
                          pattern: /^\d{1,12}$/,
                          message: 'UAN No. must be up to 12 digits only',
                        },
                        {
                          required: watch_UANRegistered ? true : false,
                          message: 'UAN No. is required',
                        },
                      ]}
                    >
                      <Input
                        maxLength={12}
                        inputMode="numeric"
                        onChange={() => markFieldTouched('uanNo')}
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault()
                          }
                        }}
                        placeholder="Enter UAN No."
                      />
                    </Form.Item>
                  </Col>
                )}

                {pathname.includes('/employee/update') && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'lastWorkingDay']}
                      label="Last Working Day"
                    >
                      <Input disabled />
                    </Form.Item>
                  </Col>
                )}

                {(pathname.includes('employee/update') ||
                  pathname.includes('employee/add_new')) && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'reportingHeadId']}
                      label="Reporting Manager"
                      rules={[
                        {
                          validator: (_, value) =>
                            value === 'none'
                              ? Promise.reject(new Error('Please select a valid Reporting Manager'))
                              : Promise.resolve(),
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        placeholder="Type employee name or code"
                        value={selectedEmpCode || undefined}
                        onChange={(value) => {
                          setSelectedEmpCode(value)
                          markFieldTouched('reportingHeadId')
                        }}
                        onSearch={handleSearch}
                        filterOption={false}
                        notFoundContent={false}
                      >
                        {!searchLoading ? (
                          Employees?.map((emp, index) => (
                            <Select.Option key={index} value={emp?.employeeId}>
                              {`${emp?.fullName} - ${emp?.ecode}`}
                            </Select.Option>
                          ))
                        ) : (
                          <div style={{ textAlign: 'center' }}>
                            <Spin />
                          </div>
                        )}
                      </Select>
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Personal" key="3">
              <Row gutter={24} style={{ flexWrap: 'wrap' }}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'maritalStatus']}
                    label="Marital Status"
                    rules={[{ required: true, message: 'Marital status is required' }]}
                  >
                    {/* <Input /> */}
                    <Select>
                      <Select.Option value="none">Select</Select.Option>
                      <Select.Option value="married">Married</Select.Option>
                      <Select.Option value="unmarried">Unmarried</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name={['user', 'mobile']}
                    label="Mobile"
                    labelCol={{ span: 24 }}
                    rules={[
                      {
                        required: true,
                        pattern: /^[0-9]{10}$/,
                        message: 'Enter a valid 10-digit number',
                      },
                    ]}
                  >
                    <Input maxLength={10} onBlur={handleTrimOnBlur(form, ['user', 'mobile'])} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'emailAddress']}
                    label="Email Id"
                    rules={[{ type: 'email', message: 'Enter a valid email', required: true }]}
                  >
                    <Input onBlur={handleTrimOnBlur(form, ['user', 'emailAddress'])} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'beneficiaryAddress']}
                    label="Beneficiary Address"
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'nationality']}
                    label="Nationality"
                  >
                    <Input onBlur={handleTrimOnBlur(form, ['user', 'nationality'])} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item labelCol={{ span: 24 }} name={['user', 'religion']} label="Religion">
                    <Input onBlur={handleTrimOnBlur(form, ['user', 'religion'])} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'bankName']}
                    label="Bank Name"
                    rules={[
                      {
                        required: true,
                        message: 'Bank Name is Required',
                      },
                    ]}
                  >
                    <Input onBlur={handleTrimOnBlur(form, ['user', 'bankName'])} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'accountNo']}
                    label="A/c No."
                    rules={[
                      {
                        required: true,
                        pattern: /^\d{9,18}$/,
                        message: 'Account number should be between 9 and 18 digits',
                      },
                    ]}
                  >
                    <Input maxLength={18} onBlur={handleTrimOnBlur(form, ['user', 'accountNo'])} />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'bankIfscCode']}
                    label="Bank IFSC Code"
                    rules={[{ required: true, message: 'Bank IFSC is required' }]}
                  >
                    <Input
                      maxLength={11}
                      style={{ textTransform: 'uppercase' }}
                      onBlur={handleTrimOnBlur(form, ['user', 'bankIfscCode'])}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    name={['user', 'isRelativeInCompany']}
                    label="Relative in Company"
                    rules={[{ required: true, message: 'Relative Company is Required' }]}
                  >
                    <Select>
                      <Select.Option value={true}>Yes</Select.Option>
                      <Select.Option value={false}>No</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>

                {isRelativeInCompany && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'reference']}
                      label="Reference"
                    >
                      <Input onBlur={handleTrimOnBlur(form, ['user', 'reference'])} />
                    </Form.Item>
                  </Col>
                )}

                {pathname !== '/employee/add_new' && (
                  <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      labelCol={{ span: 24 }}
                      name={['user', 'fingerprintRegistered']}
                      label="Fingerprint Registered"
                      initialValue="false"
                      rules={[
                        {
                          required: true,
                          message: 'Please select fingerprint registration status',
                        },
                      ]}
                    >
                      <Select placeholder="Select Yes or No">
                        <Select.Option value="true">Yes</Select.Option>
                        <Select.Option value="false">No</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                )}

                {/* <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name={['user', 'skillType']}
                      label="Skill Type"
                      rules={[{ required: true, message: 'Skill type is required' }]}
                    >
                      <Select placeholder="Select skill">
                        <Select.Option key={'Skilled'} value="Skilled">
                          Skilled
                        </Select.Option>
  
                        <Select.Option key={'Semi Skilled'} value="Semi Skilled">
                          Semi Skilled
                        </Select.Option>
  
                        <Select.Option key={'Unskilled'} value="Skilled">
                          Unskilled
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </Col> */}

                {/* <Col xs={24} sm={12} md={8}>
                    <Form.Item
                      name={['user', 'differentlyAbled']}
                      label="Differently Abled"
                      rules={[{ required: true, message: 'Field is required' }]}
                    >
                      <Select placeholder="Select">
                        <Select.Option value={true}>Yes</Select.Option>
                        <Select.Option value={false}>No</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col> */}

                {/* {isDifferentlyAbled && (
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        name={['user', 'differentlyAbledReason']}
                        rules={[{ required: true, message: 'Field is required' }]}
                        label="Differently Abled Reason"
                      >
                        <Select placeholder="Select Reason">
                          <Select.Option value="Genetic Conditions">Genetic Conditions</Select.Option>
                          <Select.Option value="Birth Complications">
                            Birth Complications
                          </Select.Option>
                          <Select.Option value="Illness">Illness</Select.Option>
                          <Select.Option value="Injuries">Injuries</Select.Option>
                          <Select.Option value="Others">Others</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  )} */}

                {/* {differentlyAbledReason === 'Others' && (
                    <Col xs={24} sm={12} md={8}>
                      <Form.Item
                        name={['user', 'differentlyAbledRemarks']}
                        rules={[{ required: true, message: 'Field is required' }]}
                        label="Differently Abled Remarks"
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  )} */}

                {/* <Col xs={24} sm={12} md={8}>
                  <Form.Item
                    name={['user', 'shiftID']}
                    rules={[{ required: true, message: 'Shift alignment is required' }]}
                    label="Shift Alignment"
                  >
                    <Select placeholder="Select shift">
                      <Select.Option>Select</Select.Option>
                      {shiftList.map((shift) => (
                        <Select.Option key={shift?.shiftID} value={shift?.shiftID}>
                          {shift?.shiftName}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col> */}
              </Row>

              <Form.Item labelCol={{ span: 24 }} label="Family Member Detail">
                <Table
                  className="custom-table"
                  dataSource={familyMemberdataSource}
                  columns={[
                    {
                      title: (
                        <p>
                          Family Member Name <span style={{ color: 'red' }}>*</span>
                        </p>
                      ),
                      dataIndex: 'familyMemberName',
                      key: 'familyMemberName',
                      onCell: () => ({ 'data-label': 'Family Member Name' }),
                      render: (text, record) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleFamilyInputChange(record.key, 'familyMemberName', e.target.value)
                          }
                          onBlur={() => handleTrimOnBlur(form, ['user', 'familyMemberName'])}
                          required
                        />
                      ),
                    },
                    {
                      title: (
                        <p>
                          Relation <span style={{ color: 'red' }}>*</span>
                        </p>
                      ),
                      dataIndex: 'relation',
                      key: 'relation',
                      onCell: () => ({ 'data-label': 'Relation' }),
                      render: (text, record) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleFamilyInputChange(record.key, 'relation', e.target.value)
                          }
                          onBlur={() => handleTrimOnBlur(form, ['user', 'relation'])}
                        />
                      ),
                    },
                    {
                      title: (
                        <p>
                          DOB <span style={{ color: 'red' }}>*</span>
                        </p>
                      ),
                      dataIndex: 'dob',
                      key: 'dob',
                      onCell: () => ({ 'data-label': 'DOB' }),
                      render: (text, record) => (
                        <DatePicker
                          format="DD-MM-YYYY"
                          value={text ? dayjs(text, 'YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DD') : null}
                          onChange={(date) =>
                            handleFamilyInputChange(
                              record.key,
                              'dob',
                              date ? date.format('YYYY-MM-DDTHH:mm:ss') : null,
                            )
                          }
                          disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
                        />
                      ),
                    },
                    {
                      title: 'Action',
                      key: 'action',
                      onCell: () => ({ 'data-label': 'Action' }),
                      render: (_, record) => (
                        <Button
                          danger
                          onClick={() => {
                            console.log('Delete button clicked for key:', record.key)
                            deleteFamilyRow(record.key)
                          }}
                        >
                          <DeleteRowOutlined />
                        </Button>
                      ),
                    },
                  ]}
                  pagination={false}
                  bordered
                />
                <Button type="dashed" onClick={addRowFamilyData} style={{ marginTop: 10 }}>
                  + Add More
                </Button>
              </Form.Item>

              <Form.Item labelCol={{ span: 24 }} label="Reference Detail">
                <Table
                  className="custom-table"
                  dataSource={referenceData}
                  columns={[
                    {
                      title: <p>Reference 1 Last Company</p>,
                      dataIndex: 'reference1LastCompany',
                      key: 'reference1LastCompany',
                      onCell: () => ({ 'data-label': 'Reference 1 Last Company' }),
                      render: (text, record) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleReferenceInputChange(
                              record.key,
                              'reference1LastCompany',
                              e.target.value,
                            )
                          }
                          onBlur={handleTrimOnBlur(form, ['user', 'reference1LastCompany'])}
                        />
                      ),
                    },
                    {
                      title: <p>Contact 1 Last Company</p>,
                      dataIndex: 'contact1LastCompany',
                      key: 'contact1LastCompany',
                      onCell: () => ({ 'data-label': 'Contact 1 Last Company' }),
                      render: (text, record, index) => {
                        const row = referenceData[0] || {}
                        const needsContact1 =
                          row.reference1LastCompany &&
                          String(row.reference1LastCompany).trim() !== '' &&
                          (!row.contact1LastCompany ||
                            String(row.contact1LastCompany).trim() === '')
                        return (
                          <div>
                            <Input
                              value={text}
                              onChange={(e) =>
                                handleReferenceInputChange(
                                  record.key,
                                  'contact1LastCompany',
                                  e.target.value,
                                )
                              }
                              onBlur={handleTrimOnBlur(form, ['user', 'contact1LastCompany'])}
                              style={{ borderColor: needsContact1 ? '#ff4d4f' : undefined }}
                              placeholder={needsContact1 ? 'Required' : undefined}
                            />
                            {needsContact1 && (
                              <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>
                                Required
                              </div>
                            )}
                          </div>
                        )
                      },
                    },
                    {
                      title: <p>Reference 2 Last Company</p>,
                      dataIndex: 'reference2LastCompany',
                      key: 'reference2LastCompany',
                      onCell: () => ({ 'data-label': 'Reference 2 Last Company' }),
                      render: (text, record) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            handleReferenceInputChange(
                              record.key,
                              'reference2LastCompany',
                              e.target.value,
                            )
                          }
                          onBlur={handleTrimOnBlur(form, ['user', 'reference2LastCompany'])}
                        />
                      ),
                    },
                    {
                      title: <p>Contact 2 Last Company</p>,
                      dataIndex: 'contact2LastCompany',
                      key: 'contact2LastCompany',
                      onCell: () => ({ 'data-label': 'Contact 2 Last Company' }),
                      render: (text, record, index) => {
                        const row = referenceData[0] || {}
                        const needsContact2 =
                          row.reference2LastCompany &&
                          String(row.reference2LastCompany).trim() !== '' &&
                          (!row.contact2LastCompany ||
                            String(row.contact2LastCompany).trim() === '')
                        return (
                          <div>
                            <Input
                              value={text}
                              onChange={(e) =>
                                handleReferenceInputChange(
                                  record.key,
                                  'contact2LastCompany',
                                  e.target.value,
                                )
                              }
                              onBlur={handleTrimOnBlur(form, ['user', 'contact2LastCompany'])}
                              style={{ borderColor: needsContact2 ? '#ff4d4f' : undefined }}
                              placeholder={needsContact2 ? 'Required' : undefined}
                            />
                            {needsContact2 && (
                              <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>
                                Required
                              </div>
                            )}
                          </div>
                        )
                      },
                    },
                  ]}
                  pagination={false}
                  bordered
                />
              </Form.Item>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Experience" key="4">
              <Table
                className="custom-table"
                columns={[
                  {
                    title: (
                      <div>
                        Company Name <span style={{ color: 'red' }}>*</span>
                      </div>
                    ),
                    dataIndex: 'nameOfCompany',
                    key: 'nameOfCompany',
                    onCell: () => ({ 'data-label': 'Company Name' }),
                    render: (text, record) => (
                      <Input
                        value={text}
                        onChange={(e) =>
                          handleInputChange(record.key, 'nameOfCompany', e.target.value)
                        }
                        onBlur={handleTrimOnBlur(form, ['user', 'nameOfCompany'])}
                        placeholder="Enter company name"
                        style={{
                          borderColor: !text ? '#ff4d4f' : undefined,
                        }}
                      />
                    ),
                  },
                  {
                    title: (
                      <div>
                        Work Location <span style={{ color: 'red' }}>*</span>
                      </div>
                    ),
                    dataIndex: 'workLocation',
                    key: 'workLocation',
                    onCell: () => ({ 'data-label': 'Work Location' }),
                    render: (text, record) => (
                      <Input
                        value={text}
                        onChange={(e) =>
                          handleInputChange(record.key, 'workLocation', e.target.value)
                        }
                        onBlur={handleTrimOnBlur(form, ['user', 'workLocation'])}
                        placeholder="Enter work location"
                        style={{
                          borderColor: !text ? '#ff4d4f' : undefined,
                        }}
                      />
                    ),
                  },
                  {
                    title: (
                      <div>
                        Position <span style={{ color: 'red' }}>*</span>
                      </div>
                    ),
                    dataIndex: 'positionHeld',
                    key: 'positionHeld',
                    onCell: () => ({ 'data-label': 'Position' }),
                    render: (text, record) => (
                      <Input
                        value={text}
                        onChange={(e) =>
                          handleInputChange(record.key, 'positionHeld', e.target.value)
                        }
                        onBlur={handleTrimOnBlur(form, ['user', 'positionHeld'])}
                        placeholder="Enter position"
                        style={{
                          borderColor: !text ? '#ff4d4f' : undefined,
                        }}
                      />
                    ),
                  },
                  {
                    title: (
                      <div>
                        From <span style={{ color: 'red' }}>*</span>
                      </div>
                    ),
                    dataIndex: 'from',
                    key: 'from',
                    onCell: () => ({ 'data-label': 'From' }),
                    render: (text, record) => (
                      <DatePicker
                        format="DD-MM-YYYY"
                        value={text ? (dayjs(text).isValid() ? dayjs(text) : null) : null}
                        onChange={(date) =>
                          handleInputChange(
                            record.key,
                            'from',
                            date ? date.format('YYYY-MM-DD') : null,
                          )
                        }
                        disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
                        style={{
                          width: '100%',
                          borderColor: !text ? '#ff4d4f' : undefined,
                        }}
                        placeholder="Select start date"
                      />
                    ),
                  },
                  {
                    title: (
                      <div>
                        To <span style={{ color: 'red' }}>*</span>
                      </div>
                    ),
                    dataIndex: 'to',
                    key: 'to',
                    onCell: () => ({ 'data-label': 'To' }),
                    render: (text, record) => (
                      <DatePicker
                        format="DD-MM-YYYY"
                        value={text ? (dayjs(text).isValid() ? dayjs(text) : null) : null}
                        onChange={(date) =>
                          handleInputChange(
                            record.key,
                            'to',
                            date ? date.format('YYYY-MM-DD') : null,
                          )
                        }
                        disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
                        style={{
                          width: '100%',
                          borderColor: !text ? '#ff4d4f' : undefined,
                        }}
                        placeholder="Select end date"
                      />
                    ),
                  },
                  {
                    title: (
                      <div>
                        Last CTC <span style={{ color: 'red' }}>*</span>
                      </div>
                    ),
                    dataIndex: 'lastCtc',
                    key: 'lastCtc',
                    onCell: () => ({ 'data-label': 'Last CTC' }),
                    render: (text, record) => (
                      <InputNumber
                        value={text}
                        onChange={(value) => handleInputChange(record.key, 'lastCtc', value)}
                        onBlur={handleTrimOnBlur(form, ['user', 'lastCtc'])}
                        style={{
                          width: '100%',
                          borderColor: !text && text !== 0 ? '#ff4d4f' : undefined,
                        }}
                        placeholder="Enter CTC"
                        min={0}
                      />
                    ),
                  },
                  {
                    title: 'Action',
                    key: 'action',
                    onCell: () => ({ 'data-label': 'Action' }),
                    render: (_, record) => (
                      <Button
                        danger
                        onClick={() => deleteExperienceRow(record.key)}
                        icon={<DeleteRowOutlined />}
                      />
                    ),
                  },
                ]}
                dataSource={experienceData}
                pagination={false}
                bordered
                locale={{
                  emptyText: (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                      <div style={{ marginBottom: '8px' }}>No work experience added</div>
                      <div style={{ fontSize: '12px' }}>
                        Please add at least one work experience entry
                      </div>
                    </div>
                  ),
                }}
              />
              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Button type="dashed" onClick={addRowExperienceData} icon={<PlusOutlined />}>
                  Add Work Experience
                </Button>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab="Qualification" key="5">
              <Table
                className="custom-table"
                columns={[
                  {
                    title: (
                      <div>
                        Education <span style={{ color: 'red' }}>*</span>
                      </div>
                    ),
                    dataIndex: 'education',
                    key: 'education',
                    onCell: () => ({ 'data-label': 'Education' }),
                    render: (_, record) => (
                      <Select
                        style={{ width: '100%' }}
                        value={record.education}
                        onChange={(value) => handleChange('education', value, record)}
                      >
                        <Select.Option value="10th">10th</Select.Option>
                        <Select.Option value="12th">12th</Select.Option>
                        <Select.Option value="Diploma">Diploma</Select.Option>
                        <Select.Option value="B.Tech">B.Tech</Select.Option>
                        <Select.Option value="B.Sc">B.Sc</Select.Option>
                        <Select.Option value="B.Com">B.Com</Select.Option>
                        <Select.Option value="BCA">BCA</Select.Option>
                        <Select.Option value="MBA">MBA</Select.Option>
                        <Select.Option value="MCA">MCA</Select.Option>
                        <Select.Option value="M.Tech">M.Tech</Select.Option>
                        <Select.Option value="PhD">PhD</Select.Option>
                        <Select.Option value="Others">Others</Select.Option>
                      </Select>
                    ),
                  },
                  {
                    title: (
                      <div>
                        Year of Passing <span style={{ color: 'red' }}>*</span>
                      </div>
                    ),
                    dataIndex: 'yop',
                    key: 'yop',
                    onCell: () => ({ 'data-label': 'Year of Passing' }),
                    render: (_, record) => (
                      <DatePicker
                        picker="year"
                        style={{ width: '100%' }}
                        value={record.yop ? dayjs(record.yop, 'YYYY') : null}
                        onChange={(date) =>
                          handleChange('yop', date ? date.format('YYYY') : null, record)
                        }
                        disabledDate={(current) => current && current > dayjs()}
                      />
                    ),
                  },
                  {
                    title: (
                      <div>
                        Grade <span style={{ color: 'red' }}>*</span>
                      </div>
                    ),
                    dataIndex: 'grade',
                    key: 'grade',
                    onCell: () => ({ 'data-label': 'Grade' }),
                    render: (_, record) => (
                      <Input
                        style={{ width: '100%' }}
                        value={record.grade}
                        onChange={(e) => handleChange('grade', e.target.value, record)}
                        onBlur={handleTrimOnBlur(form, ['user', 'grade'])}
                      />
                    ),
                  },
                  {
                    title: (
                      <div>
                        Type <span style={{ color: 'red' }}>*</span>
                      </div>
                    ),
                    dataIndex: 'type',
                    key: 'type',
                    onCell: () => ({ 'data-label': 'Type' }),
                    render: (_, record) => (
                      <Select
                        style={{ width: '100%' }}
                        value={record.type}
                        onChange={(value) => handleChange('type', value, record)}
                      >
                        <Select.Option value="Full-Time">Full-Time</Select.Option>
                        <Select.Option value="Part-Time">Part-Time</Select.Option>
                        <Select.Option value="Online">Online</Select.Option>
                      </Select>
                    ),
                  },
                  {
                    title: 'Action',
                    key: 'action',
                    onCell: () => ({ 'data-label': 'Action' }),
                    render: (_, record) => (
                      <Button danger onClick={() => deleteQualificationRow(record.key)}>
                        <DeleteRowOutlined />
                      </Button>
                    ),
                  },
                ]}
                dataSource={getFilteredQualificationData()} // Use filtered data here
                pagination={false}
                bordered
              />
              <Button type="dashed" onClick={addRowQualificationData} style={{ marginTop: 10 }}>
                Add More
              </Button>
            </Tabs.TabPane>

            {/* {pathname.includes('/employee/update') && ( */}
            {actionMap?.Location_Assignment && (
              <Tabs.TabPane
                tab="Location Assignment"
                key="6"
                className={theme === 'dark' ? 'dark-theme' : ''}
              >
                <Card className="abcde">
                  <p>
                    <strong>Base Location:</strong>{' '}
                    {getLocationNameById(form.getFieldValue(['user', 'location']))}
                  </p>
                  <Divider />

                  <Radio.Group
                    value={transferType}
                    onChange={(e) => {
                      const value = e.target.value
                      setTransferType(value)
                      if (value === 'permanent') {
                        setassignedReason('Permanent Transfer')
                      } else {
                        setassignedReason(null) // Clear if switching to temporary
                      }
                    }}
                    style={{ marginBottom: '16px' }}
                  >
                    <Radio value="temporary">Temporary Transfer</Radio>
                    <Radio value="permanent">Permanent Transfer</Radio>
                  </Radio.Group>

                  <Row gutter={[4, 0]}>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item
                        label="Location"
                        // name={['user', 'transferLocation']}
                        rules={[
                          {
                            required: transferType !== '' ? true : false,
                            message: transferType !== '' ? 'Location is required' : '',
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select Location"
                          showSearch
                          optionFilterProp="children"
                          value={assignedLocation}
                          onChange={(value) => setassignedLocation(value)}
                          style={{ width: '100%' }}
                          tabIndex={25}
                          className={theme === 'dark' ? 'dark-theme' : ''}
                        >
                          <Select.Option value={null}>Select Location</Select.Option>
                          {locations.map((loc) => (
                            <Select.Option value={loc.locationId} key={loc.locationId}>
                              {loc.locationName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label="Department">
                        <Select
                          placeholder="Select Department"
                          showSearch
                          optionFilterProp="children"
                          value={assignedDepartment}
                          onChange={(value) => setAssignmentDepartment(value)}
                          style={{ width: '100%' }}
                          tabIndex={25}
                          className={theme === 'dark' ? 'dark-theme' : ''}
                        >
                          <Select.Option value={null}>Select Department</Select.Option>
                          {departments.map((dep) => (
                            <Select.Option value={dep.departmentId} key={dep.departmentId}>
                              {dep.departmentName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label="Designation">
                        <Select
                          placeholder="Select Designation"
                          showSearch
                          optionFilterProp="children"
                          value={assignedDesignation}
                          onChange={(value) => setAssignedDesignation(value)}
                          style={{ width: '100%' }}
                          tabIndex={25}
                          className={theme === 'dark' ? 'dark-theme' : ''}
                        >
                          <Select.Option value={null}>Select Department</Select.Option>
                          {designations.map((des) => (
                            <Select.Option value={des?.designationId} key={des?.designationId}>
                              {des?.designationName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    {/* Temporary Transfer: show RangePicker */}
                    {transferType === 'temporary' && (
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item label="Select Date">
                          <RangePicker
                            style={{ width: '100%' }}
                            value={
                              assignedOnDate && releasedOnDate
                                ? [dayjs(assignedOnDate || null), dayjs(releasedOnDate || null)]
                                : [null, null]
                            }
                            onChange={(dates) => {
                              if (dates) {
                                setassignedOnDate(dates[0])
                                setreleasedOnDate(dates[1])
                              } else {
                                setassignedOnDate(null)
                                setreleasedOnDate(null)
                              }
                            }}
                          />
                        </Form.Item>
                      </Col>
                    )}

                    {/* Permanent Transfer: show single DatePicker */}
                    {transferType === 'permanent' && (
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item label="Start Date">
                          <DatePicker
                            placeholder="Select Start Date"
                            style={{ width: '100%' }}
                            value={assignedOnDate ? dayjs(assignedOnDate) : null}
                            onChange={(date) => {
                              setassignedOnDate(date)
                              setreleasedOnDate(null) // optional: clear end date
                            }}
                          />
                        </Form.Item>
                      </Col>
                    )}

                    {transferType === 'temporary' && (
                      <Col xs={24} sm={12} md={6}>
                        <Form.Item label="Reason">
                          <Select
                            placeholder="Choose Reason"
                            value={assignedReason}
                            onChange={(value) => setassignedReason(value)}
                            style={{ width: '100%' }}
                          >
                            <Select.Option value="reliever">Reliever</Select.Option>
                            <Select.Option value="training">Training</Select.Option>
                            <Select.Option value="traning-reliever">
                              Training Reliever
                            </Select.Option>
                            <Select.Option value="support/commando">Support/Commando</Select.Option>
                            <Select.Option value="review">Review</Select.Option>
                            <Select.Option value="visit">Visit</Select.Option>
                            <Select.Option value="temporary transfer">
                              Temporary Transfer
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    )}
                  </Row>

                  <Divider />
                  <Table
                    columns={columns}
                    dataSource={assignments}
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: 'max-content', y: 'calc(100vh - 160px)' }}
                    bordered
                  />
                </Card>
              </Tabs.TabPane>
            )}

            {/* {pathname.includes('/employee/update') && ( */}
            {actionMap?.Salary_Slip && (
              <Tabs.TabPane
                tab="Salary Slip"
                key="7"
                className={theme === 'dark' ? 'dark-theme' : ''}
              >
                <SalarySlips emp_pro={true} ecodes={selectedEmpCode} />
              </Tabs.TabPane>
            )}

            {/* <Tabs.TabPane tab="F&F" key="8" className={theme === 'dark' ? 'dark-theme' : ''}>
              <FullFinalSettlementModal />
            </Tabs.TabPane> */}
          </Tabs>
          <Row justify="end" style={{ marginTop: 20, gap: '0.6rem' }}>
            {pathname.includes('/employee/update') && (
              <>
                <Row style={{ gap: 5 }}>
                  {activeTab > 1 && (
                    <Button type="primary" onClick={handleBack} disabled={activeTab === 0}>
                      Back
                    </Button>
                  )}
                  {activeTab < 6 && (
                    <Button
                      type="primary"
                      onClick={handleNext}
                      disabled={activeTab === totalTabs - 1}
                    >
                      Next
                    </Button>
                  )}
                  {activeTab === '6' && (
                    <Button type="primary" htmlType="submit">
                      {params.id ? 'Update' : 'Submit'}
                    </Button>
                  )}
                </Row>
              </>
            )}
            {pathname.includes('/employee/add_new') && (
              <>
                <Row style={{ gap: 5 }}>
                  {activeTab > 1 && (
                    <Button type="primary" onClick={handleBack} disabled={activeTab === 0}>
                      Back
                    </Button>
                  )}
                  {activeTab < 5 && (
                    <Button
                      type="primary"
                      onClick={handleNext}
                      disabled={activeTab === totalTabs - 1}
                    >
                      Next
                    </Button>
                  )}
                  {activeTab === '5' && (
                    <Button type="primary" htmlType="submit">
                      {params.id ? 'Update' : 'Submit'}
                    </Button>
                  )}
                </Row>
              </>
            )}
            {pathname.includes('/candidate-form') && (
              <>
                <Row style={{ gap: 5 }}>
                  {activeTab > 1 && (
                    <Button type="primary" onClick={handleBack} disabled={activeTab === 0}>
                      Back
                    </Button>
                  )}

                  {activeTab < 5 && (
                    <Button
                      type="primary"
                      onClick={() => {
                        // Check if we're on attachments tab and validate mandatory attachments
                        if (activeTab === '1') {
                          const attachmentValidation = validateMandatoryAttachments()
                          if (!attachmentValidation.isValid) {
                            message.error(
                              `Please upload the following mandatory attachments: ${attachmentValidation.missingAttachments.join(', ')}`,
                            )
                            return
                          }
                        }
                        handleNext()
                      }}
                      disabled={
                        activeTab >= totalTabs - 1 ||
                        (activeTab === '1' && Object.values(ocrProcessing).some((v) => v))
                      }
                    >
                      {activeTab === '1' && Object.values(ocrProcessing).some((v) => v)
                        ? 'Processing...'
                        : 'Next'}
                    </Button>
                  )}
                  {activeTab === '5' && (
                    <Button type="primary" htmlType="submit">
                      {params.id ? 'Update' : 'Submit'}
                    </Button>
                  )}
                </Row>
              </>
            )}

            {pathname.includes('/candidateform') && (
              <>
                <Row style={{ gap: 5 }}>
                  {activeTab > 1 && (
                    <Button type="primary" onClick={handleBack} disabled={activeTab === 0}>
                      Back
                    </Button>
                  )}
                  {activeTab < 5 && (
                    <Button
                      type="primary"
                      onClick={handleNext}
                      disabled={activeTab === totalTabs - 1}
                    >
                      Next
                    </Button>
                  )}
                  {activeTab === '5' && (
                    <Button type="primary" htmlType="submit">
                      {params.id ? 'Update' : 'Submit'}
                    </Button>
                  )}
                </Row>
              </>
            )}
          </Row>
        </Form>
      </Card>
      <Modal
        title="Initialize Candidate"
        style={{ top: 100 }}
        open={initiateModalOpen}
        onCancel={() => setInitiateModalOpen(false)}
        footer={[
          <Button
            key="reject"
            onClick={() => handleInitializeCandidate('reject')}
            disabled={loading}
          >
            {loading ? 'Rejectting' : 'Reject'}
          </Button>,
          <Button
            key="approve"
            type="primary"
            onClick={() => handleInitializeCandidate('approve')}
            disabled={loading}
          >
            {loading ? 'Approving' : 'Approve'}
          </Button>,
        ]}
      >
        <TextArea
          rows={4}
          value={remarks || ''}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Enter remarks here..."
        />
      </Modal>
      <AcceptOfferModal
        visible={visible}
        offerDetails={offerDetails}
        onAccept={handleAccept}
        onCancel={() => setVisible(false)}
      />
      <Modal
        open={previewOpen}
        title={isVideoPreview ? 'Video Preview' : 'Image Preview'}
        footer={null}
        onCancel={() => {
          setPreviewOpen(false)
          if (isVideoPreview && previewVideo && previewVideo.startsWith('blob:')) {
            URL.revokeObjectURL(previewVideo)
          }
          if (isVideoPreview) setPreviewVideo('')
          setIsVideoPreview(false)
        }}
        style={{ top: 20 }}
        width={isVideoPreview ? 800 : undefined}
      >
        {isVideoPreview ? (
          <video
            controls
            style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
            src={previewVideo}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            alt="preview"
            style={{
              width: '100%',
              height: 'auto',
              maxWidth: '100%',
              objectFit: 'contain',
            }}
            src={previewImage}
          />
        )}
      </Modal>
    </>
  )
}

export default OuterCandidateForm
