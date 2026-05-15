// import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
// import useMediaQuery from '../hooks/useMediaQuery'
// import EmployeesUploadModal from './EmployeesUploadModal'
// import {
//   Space,
//   Table,
//   Row,
//   Input,
//   Tooltip,
//   Button,
//   Col,
//   Switch,
//   message,
//   Dropdown,
//   Checkbox,
//   Tabs,
//   Popconfirm,
//   Modal,
//   Spin,
//   Empty,
//   Upload,
//   Tag,
//   Typography,
//   Divider,
// } from 'antd'
// import {
//   ExportOutlined,
//   EditOutlined,
//   UploadOutlined,
//   EyeOutlined,
//   PlusOutlined,
//   MinusOutlined,
//   UnlockOutlined,
//   DeleteOutlined,
//   PaperClipOutlined,
//   FileTextOutlined,
// } from '@ant-design/icons'
// import { toast, ToastContainer } from 'react-toastify'
// import ExcelImportModal from '../components/modals/ExcelimportModal'
// import { Link, useLocation, useNavigate } from 'react-router-dom'
// import {
//   exportEmployeeMaster,
//   filterBgtSeatMaster,
//   getAbscondingReasonList,
//   getBlacklistReasonList,
//   getEmployeeList,
//   getEmployeeListOld,
//   markEmployeeActiveStatus,
//   resetEmployeePsd,
// } from '../services/Services'
// import { useDispatch, useSelector } from 'react-redux'
// import { set } from '../redux/uiSlice'
// import EmployeeActiveInactiveModal from '../components/modals/EmployeeActiveInactiveModal'
// import EmployeeActiveInactiveModalAbscond from '../components/modals/EmployeeActiveInactiveModalAbscond'
// import Pageheading from '../components/shared/Pageheading'
// import { IoIosRefresh } from 'react-icons/io'
// import axiosInstance from '../services/axiosInstance'
// import EmployeeInactiveModal from '../components/modals/EmployeeInactiveModal'
// import CardInRow from '../components/shared/CardInRow/CardInRow'
// import useColumnSearch from '../components/shared/columnSearch'
// import styles from './EmployeesList.module.css'

// const { Search } = Input

// const FilterDropdown = ({ dataIndex, dataList, filterValues, setFilterValues, confirm, title }) => {
//   const [searchText, setSearchText] = useState('')
//   const [selectedOptions, setSelectedOptions] = useState(filterValues || [])

//   useEffect(() => {
//     setSelectedOptions(filterValues || [])
//   }, [filterValues])

//   const filteredOptions = (dataList || []).filter((item) =>
//     (item ?? '').toString().toLowerCase().includes(searchText.toLowerCase()),
//   )

//   const handleChange = (checkedValues) => setSelectedOptions(checkedValues)
//   const handleFilter = () => {
//     setFilterValues(selectedOptions)
//     confirm()
//   }
//   const handleReset = () => {
//     setSelectedOptions([])
//     setFilterValues([])
//     setSearchText('')
//     confirm()
//   }

//   return (
//     <div style={{ padding: 8, width: 215 }}>
//       <Input
//         placeholder={`Search ${title}`}
//         value={searchText}
//         onChange={(e) => setSearchText(e.target.value)}
//         style={{ marginBottom: 8, display: 'block' }}
//       />
//       <div style={{ maxHeight: 150, overflowY: 'auto', paddingRight: 8 }}>
//         <Checkbox.Group
//           value={selectedOptions}
//           onChange={handleChange}
//           style={{ display: 'flex', flexDirection: 'column' }}
//         >
//           {filteredOptions.map((value) => (
//             <Checkbox key={value} value={value}>
//               {value}
//             </Checkbox>
//           ))}
//         </Checkbox.Group>
//       </div>
//       <Space style={{ marginTop: 30 }}>
//         <Button type="primary" size="small" onClick={handleFilter}>
//           Filter
//         </Button>
//         <Button size="small" onClick={handleReset}>
//           Reset
//         </Button>
//       </Space>
//     </div>
//   )
// }

// const InactiveChecklistModal = ({ open, onClose, onSubmit, loading, ecode, employeeId }) => {
//   const [employeeChecklist, setEmployeeChecklist] = useState([])
//   const [isLoading, setIsLoading] = useState(false)
//   const [isSaving, setIsSaving] = useState(false)
//   const initialRef = useRef([])

//   const { Dragger } = Upload
//   const { Text } = Typography

//   const unwrapChecklist = (res) => {
//     let payload = res?.data ?? res
//     if (payload?.status === true && payload?.data != null) payload = payload.data
//     if (Array.isArray(payload)) return payload
//     if (Array.isArray(payload?.data)) return payload.data
//     if (Array.isArray(payload?.data?.data)) return payload.data.data
//     return []
//   }

//   const normalizeChecklist = (list) => {
//     return (list || []).map((x, idx) => {
//       const id =
//         x?.employeeResignationChecklistMasterId ?? x?.checkListId ?? x?.checklistId ?? x?.id ?? idx
//       const name = x?.checkListName ?? x?.checklistName ?? x?.name ?? '-'
//       const checked = x?.isChecked ?? x?.checked ?? x?.isSelected ?? false
//       const disabled = x?.isDisabled ?? false

//       // ✅ attachment requirement from API
//       const isAttachmentRequired =
//         x?.isAttachmentRequired ??
//         x?.attachmentRequired ??
//         x?.isAttachementRequired ?? // (in case backend typo)
//         false

//       // ✅ existing attachment label/path if backend sends it
//       const attachment =
//         x?.attachment ?? x?.attachmentName ?? x?.attachmentPath ?? x?.fileName ?? x?.file ?? ''

//       return {
//         checkListId: id,
//         checkListName: name,
//         isChecked: !!checked,
//         isDisabled: !!disabled,
//         isAttachmentRequired: !!isAttachmentRequired,
//         attachment: attachment || '',
//         attachmentFile: null, // newly selected file
//       }
//     })
//   }

//   const fetchChecklist = async () => {
//     if (!ecode) {
//       setEmployeeChecklist([])
//       initialRef.current = []
//       return
//     }

//     try {
//       setIsLoading(true)
//       const res = await axiosInstance.get(
//         `/api/Employee/GetEmployeeResignationChecklist?ECode=${encodeURIComponent(ecode)}`,
//       )

//       const normalized = normalizeChecklist(unwrapChecklist(res))
//       setEmployeeChecklist(normalized)

//       initialRef.current = normalized.map((x) => ({
//         checkListId: x.checkListId,
//         isChecked: !!x.isChecked,
//         attachment: (x.attachment || '').trim(),
//         isAttachmentRequired: !!x.isAttachmentRequired,
//       }))
//     } catch (error) {
//       console.error('Error fetching resignation checklist:', error)
//       message.error(error?.response?.data?.message || 'Error fetching resignation checklist')
//       setEmployeeChecklist([])
//       initialRef.current = []
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   useEffect(() => {
//     if (open) fetchChecklist()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [open, ecode])

//   const toggle = (checkListId, checked) => {
//     setEmployeeChecklist((prev) =>
//       prev.map((item) => {
//         if (item.checkListId !== checkListId) return item

//         // if unchecked, clear newly picked attachment file (cleaner UI)
//         if (!checked) return { ...item, isChecked: false, attachmentFile: null }

//         return { ...item, isChecked: true }
//       }),
//     )
//   }

//   const updateAttachment = (checkListId, fileOrNull) => {
//     setEmployeeChecklist((prev) =>
//       prev.map((item) =>
//         item.checkListId === checkListId ? { ...item, attachmentFile: fileOrNull } : item,
//       ),
//     )
//   }

//   // ✅ compute required items that are missing attachment
//   const missingRequiredAttachments = useMemo(() => {
//     return (employeeChecklist || [])
//       .filter((x) => x.isAttachmentRequired && x.isChecked)
//       .filter((x) => {
//         const hasExisting = !!(x.attachment && String(x.attachment).trim())
//         const hasNew = !!x.attachmentFile
//         return !(hasExisting || hasNew)
//       })
//   }, [employeeChecklist])

//   const isAnyRequiredAttachmentMissing = missingRequiredAttachments.length > 0

//   const handleSubmit = async () => {
//     let isAllFilled = employeeChecklist.every((c) => c.isChecked === true)
//     if (!isAllFilled) return message.error('All check items are required')

//     if (!employeeId) {
//       message.error('EmployeeId is missing. Please reopen the checklist from employee row.')
//       return
//     }

//     if (isAnyRequiredAttachmentMissing) {
//       const names = missingRequiredAttachments.map((x) => x.checkListName).join(', ')
//       message.error(`Attachment is mandatory for: ${names}`)
//       return
//     }

//     const itemsJson = (employeeChecklist || []).map((item) => ({
//       EmployeeResignationChecklistMasterId: item.checkListId,
//       EmployeeId: String(employeeId),
//       IsChecked: !!item.isChecked,
//       // if backend expects only IsAttachment, keep it true when attachment is required & checked
//       IsAttachment: !!(item.isAttachmentRequired && item.isChecked),
//     }))

//     const formData = new FormData()
//     formData.append('ItemsJson', JSON.stringify(itemsJson))

//     // Attach only newly picked files (existing attachments remain on backend)
//     let attachmentIdx = 0
//     for (const item of employeeChecklist || []) {
//       if (item.isAttachmentRequired && item.isChecked && item.attachmentFile) {
//         formData.append(`Attachment[${attachmentIdx}]`, item.attachmentFile)
//         attachmentIdx += 1
//       }
//     }

//     try {
//       setIsSaving(true)
//       const res = await axiosInstance.post('/api/Employee/SaveChecklistResponse', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       })

//       message.success(res?.data?.message || 'Checklist saved successfully')

//       onSubmit?.({
//         ecode,
//         employeeId,
//         checklist: itemsJson,
//         apiResponse: res?.data,
//       })
//     } catch (error) {
//       console.error('Error saving checklist:', error)
//       message.error(error?.response?.data?.message || 'Error saving checklist')
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   const submitLoading = !!loading || isSaving

//   return (
//     <Modal
//       title={`Resignation Checklist (${ecode || '-'})`}
//       open={open}
//       destroyOnClose
//       onCancel={onClose}
//       footer={[
//         <Button key="cancel" onClick={onClose} disabled={submitLoading}>
//           Cancel
//         </Button>,
//         <Button
//           key="submit"
//           type="primary"
//           onClick={handleSubmit}
//           loading={submitLoading}
//           disabled={isAnyRequiredAttachmentMissing || submitLoading}
//         >
//           Submit
//         </Button>,
//       ]}
//     >
//       {isLoading ? (
//         <Spin />
//       ) : employeeChecklist.length === 0 ? (
//         <Empty description="No checklist found" />
//       ) : (
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//           {employeeChecklist.map((item) => {
//             const required = !!item.isAttachmentRequired
//             const checked = !!item.isChecked
//             const existingAttachmentLabel = (item.attachment || '').trim()
//             const missingThis =
//               required && checked && !existingAttachmentLabel && !item.attachmentFile

//             const selectedFile = item.attachmentFile
//             const selectedFileName = selectedFile?.name || ''

//             return (
//               <div
//                 key={item.checkListId}
//                 style={{
//                   border: '1px solid #f0f0f0',
//                   borderRadius: 10,
//                   padding: 12,
//                   background: '#fff',
//                 }}
//               >
//                 <div
//                   style={{
//                     display: 'flex',
//                     alignItems: 'flex-start',
//                     justifyContent: 'space-between',
//                     gap: 12,
//                   }}
//                 >
//                   <Checkbox
//                     checked={checked}
//                     disabled={!!item.isDisabled}
//                     onChange={(e) => toggle(item.checkListId, e.target.checked)}
//                     style={{ flex: 1 }}
//                   >
//                     <span style={{ fontWeight: 500 }}>{item.checkListName}</span>
//                   </Checkbox>

//                   {required ? <Tag color="red">Attachment Required</Tag> : null}
//                 </div>

//                 {required ? (
//                   <>
//                     <Divider style={{ margin: '10px 0' }} />
//                     <div style={{ paddingLeft: 24 }}>
//                       <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//                         {/* Existing / selected attachment badges */}
//                         <div
//                           style={{
//                             display: 'flex',
//                             flexWrap: 'wrap',
//                             gap: 8,
//                             alignItems: 'center',
//                           }}
//                         >
//                           {existingAttachmentLabel ? (
//                             <Tag icon={<PaperClipOutlined />} style={{ marginRight: 0 }}>
//                               {existingAttachmentLabel}
//                             </Tag>
//                           ) : (
//                             <Text type="secondary">No attachment uploaded yet.</Text>
//                           )}

//                           {selectedFileName ? (
//                             <Tag icon={<FileTextOutlined />} style={{ marginRight: 0 }}>
//                               {selectedFileName}
//                             </Tag>
//                           ) : null}

//                           {selectedFile ? (
//                             <Button
//                               type="link"
//                               icon={<DeleteOutlined />}
//                               onClick={() => updateAttachment(item.checkListId, null)}
//                               style={{ padding: 0, height: 'auto' }}
//                             >
//                               Remove
//                             </Button>
//                           ) : null}
//                         </div>

//                         {/* Upload area */}
//                         <div
//                           style={{
//                             opacity: checked ? 1 : 0.5,
//                             pointerEvents: checked ? 'auto' : 'none',
//                           }}
//                         >
//                           <Dragger
//                             multiple={false}
//                             maxCount={1}
//                             accept=".pdf,image/*"
//                             showUploadList={false}
//                             beforeUpload={() => false}
//                             onChange={(info) => {
//                               const file = info.fileList?.[0]?.originFileObj || null
//                               updateAttachment(item.checkListId, file)
//                             }}
//                           >
//                             <p className="ant-upload-drag-icon">
//                               <UploadOutlined />
//                             </p>
//                             <p className="ant-upload-text" style={{ marginBottom: 0 }}>
//                               {existingAttachmentLabel ? 'Replace attachment' : 'Upload attachment'}
//                             </p>
//                             <p className="ant-upload-hint" style={{ marginTop: 4 }}>
//                               PDF or image files only
//                             </p>
//                           </Dragger>
//                         </div>

//                         {!checked ? (
//                           <Text type="secondary">Check this item to enable upload.</Text>
//                         ) : null}

//                         {missingThis ? (
//                           <Text type="danger">
//                             Attachment is mandatory for this checklist item.
//                           </Text>
//                         ) : null}
//                       </div>
//                     </div>
//                   </>
//                 ) : null}
//               </div>
//             )
//           })}
//         </div>
//       )}
//     </Modal>
//   )
// }

// const EmployeesList = () => {
//   const { pathname } = useLocation()
//   const navigate = useNavigate()
//   const [isEmployeeInactiveModalOpen, setIsEmployeeInactiveModalOpen] = useState(false)
//   const [selectedEmpId, setSelectedEmpId] = useState('')
//   const [selectedEmpName, setSelectedEmpName] = useState('')
//   const [employeesListData, setEmployeesListData] = useState([])
//   const [currentPage, setCurrentPage] = useState(1)
//   const [pageSize, setPageSize] = useState(100)
//   const [totalCount, setTotalCount] = useState(0)
//   const [importExelModal, setimportExelModal] = useState(false)
//   const [selectedRowKeys, setSelectedRowKeys] = useState([])
//   const [search, setSearch] = useState(() => {
//     try {
//       const s = sessionStorage.getItem('employeeListSearch')
//       return s && s.trim() !== '' ? s.trim() : ''
//     } catch {
//       return ''
//     }
//   })

//   // ✅ add this helper near your other helpers (where keyOf exists)
//   const isNapsRow = (r) => {
//     const dept = keyOf(r?.departmentName) // already lowercased by keyOf
//     const desg = keyOf(r?.designationName)

//     const deptIsNaps = dept === 'naps'
//     const desgIsNaps = desg === 'naps'
//     const desgHasNaps = desg.includes('naps') // handles: "NAPS Trainee", "naps - xyz", etc.

//     // ✅ requirement: (dept=naps AND desg=naps) OR (naps coming in designation)
//     return (deptIsNaps && desgIsNaps) || desgHasNaps
//   }

//   // ✅ CHANGE: safe auth selector (prevents crash on first navigation)
//   const authData = useSelector((state) => state?.auth?.data) || {}
//   const { storeCode, role, ecode, locationList } = authData

//   // ✅ CHANGE: safe UI + other selectors
//   const theme = useSelector((state) => state?.ui?.theme)
//   const empData = useSelector((state) => state?.auth?.data)
//   const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu) || []

//   const [activeTab, setActiveTab] = useState(() => (role === 'NapsHR' ? 'naps' : 'ho'))

//   const isMobile = useMediaQuery('(max-width: 768px)')
//   const [expandedCards, setExpandedCards] = useState({})

//   const handleToggleCard = useCallback((empCode) => {
//     setExpandedCards((prev) => ({
//       ...prev,
//       [empCode]: !prev[empCode],
//     }))
//   }, [])

//   const dispatch = useDispatch()

//   const [lodingLocal, setlodingLocal] = useState(false)
//   const [modalVisible, setModalVisible] = useState(false)
//   const [modalVisibleAbscond, setModalVisibleAbscond] = useState(false)
//   const [selectedEmployeeName, setselectedEmployeeName] = useState({})

//   const [storeCodeFilterValues, setStoreCodeFilterValues] = useState([])
//   const [locationNameFilterValues, setLocationNameFilterValues] = useState([])
//   const [zoneFilterValues, setZoneFilterValues] = useState([])
//   const [regionFilterValues, setRegionFilterValues] = useState([])
//   const [clusterFilterValues, setClusterFilterValues] = useState([])
//   const [deptFilterValues, setDeptFilterValues] = useState([])
//   const [desgFilterValues, setDesgFilterValues] = useState([])

//   const [textFilters, setTextFilters] = useState({})
//   const getColumnSearchProps = useColumnSearch(textFilters, setTextFilters)

//   const [abscondingList, setabscondingList] = useState([])
//   const [blackList, setblackList] = useState([])
//   // const [subCardData, setSubCardData] = useState([
//   //   { label: 'Locs', value: 0 },
//   //   { label: 'Active', value: 0 },
//   //   { label: 'Left', value: 0 },
//   //   { label: 'Absconded', value: 0 },
//   //   { label: 'Total', value: 0 },
//   //   { label: 'Current Month Joining', value: 0 },
//   //   { label: 'Current Month Left', value: 0 },
//   // ])
//   const latestRequestIdRef = useRef(0)

//   const [actionsMap, setActionsMap] = useState({})

//   // ✅ checklist state
//   const [inactiveChecklistOpen, setInactiveChecklistOpen] = useState(false)
//   const [inactiveChecklistLoading, setInactiveChecklistLoading] = useState(false)
//   const [pendingInactiveModalType, setPendingInactiveModalType] = useState('normal')
//   const [currentEcode, setCurrentEcode] = useState('')
//   const [currentEmployeeId, setCurrentEmployeeId] = useState(null)

//   const handleViewClick = (id) => {
//     const stateForEdit = { furtherParts: actionsMap?.view?.furtherParts || [] }
//     sessionStorage.setItem('viewPageState', JSON.stringify(stateForEdit))
//     window.location.href = `/employee/update/view/${id}`
//   }

//   const handleEditClick = (id) => {
//     const stateForEdit = { furtherParts: actionsMap?.edit?.furtherParts || [] }
//     sessionStorage.setItem('editPageState', JSON.stringify(stateForEdit))
//     window.location.href = `/employee/update/${id}`
//   }

//   // ✅ IMPORTANT: now accepts selected employee ecode
//   const openChecklistThenInactiveModal = useCallback(
//     (empEcode, empId) => {
//       setPendingInactiveModalType(activeTab === 'abscond' ? 'abscond' : 'normal')
//       setCurrentEcode(empEcode || '')
//       setCurrentEmployeeId(empId ?? null)
//       setInactiveChecklistOpen(true)
//     },
//     [activeTab],
//   )

//   const handleChecklistSubmit = async () => {
//     try {
//       setInactiveChecklistLoading(true)

//       // close checklist modal
//       setInactiveChecklistOpen(false)

//       if (pendingInactiveModalType === 'abscond') {
//         setModalVisibleAbscond(true)
//       } else {
//         setModalVisible(true)
//       }
//     } catch (err) {
//       message.error('Something went wrong')
//     } finally {
//       setInactiveChecklistLoading(false)
//     }
//   }

//   const norm = (v) => (v == null ? '' : String(v).trim())
//   const keyOf = (v) => norm(v).toLowerCase()
//   const getSt = (r) => (r?.stCode).toString().trim().toUpperCase()

//   // ✅ HUB/DC codes + helper
//   const HUB_DC_CODES = useMemo(
//     () =>
//       new Set([
//         'DH24',
//         'DW01',
//         'DB03',
//         'DB05',
//         'DD04',
//         'DJ02',
//         'DK02',
//         'DM01',
//         'DN01',
//         'DN02',
//         'DO01',
//         'DO02',
//         'DP01',
//         'DR01',
//         'DU05',
//         'DU06',
//         'DU07',
//         'DW02',
//         'DX01',
//       ]),
//     [],
//   )

//   const isHubDcRow = useCallback((r) => HUB_DC_CODES.has(getSt(r)), [HUB_DC_CODES])

//   const toBool = (v) => {
//     const s = String(v).trim().toLowerCase()
//     return v === true || v === 1 || s === 'true' || s === '1' || s === 'yes'
//   }
//   const getLocStatus = (r) => toBool(r?.locStatus ?? r?.locationStatus ?? r?.isLocationActive)

//   const isRH01 = (row) => getSt(row) === 'RH01'

//   const isAbscondedRow = (r) => {
//     const name = String(r?.resignationTypeName || '').toLowerCase()
//     return r?.abscondingReasonId != null || name.includes('abscond')
//   }

//   // ✅ UPDATED tabRows (Abscond has NO HUB/DC exclusion)
//   const tabRows = useMemo(() => {
//     const rows = employeesListData || []

//     if (activeTab === 'hubdc') {
//       return rows.filter((r) => r?.isActive === true).filter(isHubDcRow)
//     }

//     if (activeTab === 'inactive') {
//       return rows.filter((r) => !toBool(r?.isActive))
//     }

//     if (activeTab === 'abscond') {
//       return rows.filter(isAbscondedRow) // ✅ only abscond rule
//     }

//     if (activeTab === 'naps') {
//       return rows.filter((r) => r?.isActive === true).filter(isNapsRow) // ✅ allowed as-is
//     }

//     // ✅ exclude HUB/DC for HO / Stores / UPC
//     const nonHubDcRows = rows.filter((r) => !isHubDcRow(r))

//     if (activeTab === 'ho') {
//       return nonHubDcRows.filter((r) => r?.isActive === true).filter(isRH01)
//     }

//     if (activeTab === 'upc') {
//       return nonHubDcRows
//         .filter((r) => r?.isActive === true)
//         .filter((r) => getSt(r) !== 'RH01' && getLocStatus(r) === false)
//     }

//     // default: Active Stores (excluding HUB/DC)
//     return nonHubDcRows
//       .filter((r) => r?.isActive === true)
//       .filter((r) => getSt(r) !== 'RH01' && getLocStatus(r) === true)
//   }, [employeesListData, activeTab, isHubDcRow, isNapsRow])

//   const applyColumnFilters = useCallback(
//     (rows, excludeKey = null) => {
//       const zSel = new Set(zoneFilterValues.map(keyOf))
//       const rSel = new Set(regionFilterValues.map(keyOf))
//       const cSel = new Set(clusterFilterValues.map(keyOf))
//       const sSel = new Set(storeCodeFilterValues.map(keyOf))
//       const lSel = new Set(locationNameFilterValues.map(keyOf))
//       const deptSel = new Set(deptFilterValues.map(keyOf))
//       const desgSel = new Set(desgFilterValues.map(keyOf))

//       return (rows || []).filter((row) => {
//         if (excludeKey !== 'zoneName' && zSel.size && !zSel.has(keyOf(row.zoneName))) return false
//         if (excludeKey !== 'regionName' && rSel.size && !rSel.has(keyOf(row.regionName)))
//           return false
//         if (excludeKey !== 'clusterName' && cSel.size && !cSel.has(keyOf(row.clusterName)))
//           return false

//         const code = row.storeCode ?? row.stCode
//         if (excludeKey !== 'storeCode' && sSel.size && !sSel.has(keyOf(code))) return false

//         if (excludeKey !== 'locationName' && lSel.size && !lSel.has(keyOf(row.locationName)))
//           return false

//         if (
//           excludeKey !== 'departmentName' &&
//           deptSel.size &&
//           !deptSel.has(keyOf(row.departmentName))
//         )
//           return false

//         if (
//           excludeKey !== 'designationName' &&
//           desgSel.size &&
//           !desgSel.has(keyOf(row.designationName))
//         )
//           return false

//         return true
//       })
//     },
//     [
//       zoneFilterValues,
//       regionFilterValues,
//       clusterFilterValues,
//       storeCodeFilterValues,
//       locationNameFilterValues,
//       deptFilterValues,
//       desgFilterValues,
//     ],
//   )

//   const applyTextFilters = useCallback(
//     (rows) => {
//       const activeKeys = Object.keys(textFilters).filter(
//         (k) => (textFilters[k] ?? '').toString().trim() !== '',
//       )
//       if (!activeKeys.length) return rows
//       return (rows || []).filter((row) =>
//         activeKeys.every((k) =>
//           (row?.[k] ?? '')
//             .toString()
//             .toLowerCase()
//             .includes(textFilters[k].toString().toLowerCase()),
//         ),
//       )
//     },
//     [textFilters],
//   )

//   const cascadedData = useMemo(() => applyColumnFilters(tabRows), [tabRows, applyColumnFilters])
//   const displayData = useMemo(
//     () => applyTextFilters(cascadedData),
//     [cascadedData, applyTextFilters],
//   )

//   const zoneOptions = useMemo(() => {
//     return Array.from(
//       new Set(
//         applyColumnFilters(tabRows, 'zoneName')
//           .map((r) => norm(r.zoneName))
//           .filter(Boolean),
//       ),
//     ).sort()
//   }, [tabRows, applyColumnFilters])

//   const regionOptions = useMemo(() => {
//     return Array.from(
//       new Set(
//         applyColumnFilters(tabRows, 'regionName')
//           .map((r) => norm(r.regionName))
//           .filter(Boolean),
//       ),
//     ).sort()
//   }, [tabRows, applyColumnFilters])

//   const clusterOptions = useMemo(() => {
//     return Array.from(
//       new Set(
//         applyColumnFilters(tabRows, 'clusterName')
//           .map((r) => norm(r.clusterName))
//           .filter(Boolean),
//       ),
//     ).sort()
//   }, [tabRows, applyColumnFilters])

//   const storeCodeOptions = useMemo(() => {
//     return Array.from(
//       new Set(
//         applyColumnFilters(tabRows, 'storeCode')
//           .map((r) => norm(r.storeCode ?? r.stCode))
//           .filter(Boolean),
//       ),
//     ).sort()
//   }, [tabRows, applyColumnFilters])

//   const locationOptions = useMemo(() => {
//     return Array.from(
//       new Set(
//         applyColumnFilters(tabRows, 'locationName')
//           .map((r) => norm(r.locationName))
//           .filter(Boolean),
//       ),
//     ).sort()
//   }, [tabRows, applyColumnFilters])

//   const deptOptions = useMemo(() => {
//     return Array.from(
//       new Set(
//         applyColumnFilters(tabRows, 'departmentName')
//           .map((r) => norm(r.departmentName))
//           .filter(Boolean),
//       ),
//     ).sort()
//   }, [tabRows, applyColumnFilters])

//   const desgOptions = useMemo(() => {
//     return Array.from(
//       new Set(
//         applyColumnFilters(tabRows, 'designationName')
//           .map((r) => norm(r.designationName))
//           .filter(Boolean),
//       ),
//     ).sort()
//   }, [tabRows, applyColumnFilters])

//   const toBoolActive = (v) => {
//     const s = String(v).trim().toLowerCase()
//     return v === true || v === 1 || s === 'true' || s === '1' || s === 'yes' || s === 'active'
//   }
//   const toBoolInactive = (v) => {
//     const s = String(v).trim().toLowerCase()
//     return v === false || v === 0 || s === 'false' || s === '0' || s === 'no' || s === 'inactive'
//   }

//   const locKeyOf = (r) => {
//     const parts = [r?.stCode, r?.storeCode, r?.locationCode, r?.locationName, r?.locationId].map(
//       (v) => (v == null ? '' : String(v).trim().toLowerCase()),
//     )
//     const [st, store, locCode, locName, locId] = parts
//     return st || store || locCode || (locId ? `id:${locId}` : locName)
//   }

//   const parseDateOnly = (val) => {
//     if (!val) return null
//     const s = String(val).trim()
//     const d = new Date(s.includes('T') ? s.split('T')[0] : s)
//     return Number.isNaN(d.getTime()) ? null : d
//   }

//   const isSameYearMonth = (d, y, m) => d && d.getFullYear() === y && d.getMonth() === m

//   const buildCardsFromRows = (rows = []) => {
//     const uniqLocs = new Set()
//     let active = 0
//     let inactive = 0
//     let absconded = 0
//     let cmj = 0
//     let cml = 0

//     const now = new Date()
//     const curY = now.getFullYear()
//     const curM = now.getMonth()

//     for (const r of rows) {
//       const locKey = locKeyOf(r)
//       uniqLocs.add(locKey)

//       if (toBoolActive(r?.isActive)) active++
//       else if (toBoolInactive(r?.isActive)) inactive++

//       if (isAbscondedRow(r)) absconded++

//       const doj = parseDateOnly(r?.dateOfJoining)
//       const dol = parseDateOnly(r?.dateOfLeft)
//       if (isSameYearMonth(doj, curY, curM)) cmj++
//       if (isSameYearMonth(dol, curY, curM)) cml++
//     }

//     const locCount = uniqLocs.has('') ? uniqLocs.size - 1 : uniqLocs.size

//     return [
//       { label: 'Locs', value: locCount },
//       { label: 'Active', value: active },
//       { label: 'Left', value: inactive },
//       { label: 'Absconded', value: absconded },
//       { label: 'Total', value: rows.length },
//       { label: 'Current Month Joining', value: cmj },
//       { label: 'Current Month Left', value: cml },
//     ]
//   }

//   useEffect(() => {
//     if (role === 'NapsHR') {
//       setActiveTab('naps')
//     }
//   }, [role])

//   // useEffect(() => {
//   //   setSubCardData(buildCardsFromRows(displayData))
//   // }, [displayData])

//   const subCardData = useMemo(() => {
//     return buildCardsFromRows(displayData)
//   }, [displayData])

//   const fetchData = async () => {
//     // ✅ CHANGE: guard so this page doesn't break before auth is hydrated
//     if (!ecode) return

//     dispatch(set({ loading: true }))
//     const requestId = ++latestRequestIdRef.current
//     try {
//       const response = await getEmployeeList({ currentPage, pageSize, search })
//       if (requestId !== latestRequestIdRef.current) return

//       if (response) {
//         const records = response?.employees ?? []

//         const response1 = await filterBgtSeatMaster({ eCode: ecode })
//         const allowedList = response1?.data?.data?.allowedStores ?? []
//         const deptExceptions = response1?.data?.data?.deptExceptions ?? []
//         const desigExceptions = response1?.data?.data?.desigExceptions ?? []

//         const allowedCodes = new Set(allowedList.map((a) => norm(a.stCode)))
//         const level1Filtered = records.filter((item) => allowedCodes.has(norm(item?.stCode)))

//         const blockedDeptSet = new Set(
//           deptExceptions.map((b) => `${norm(b.stCode)}-${norm(b.deptId)}`),
//         )
//         const level2Filtered = level1Filtered.filter((item) => {
//           const key = `${norm(item.stCode)}-${norm(item.departmentId)}`
//           return !blockedDeptSet.has(key)
//         })

//         const blockedDesigSet = new Set(
//           desigExceptions.map((b) => `${norm(b.stCode)}-${norm(b.deptId)}-${norm(b.desigId)}`),
//         )
//         const finalFiltered =
//           level2Filtered.filter((item) => {
//             const key = `${norm(item.stCode)}-${norm(item.departmentId)}-${norm(
//               item.designationId,
//             )}`
//             return !blockedDesigSet.has(key)
//           }) || []

//         const isResponse1Length0 =
//           allowedList?.length === 0 && deptExceptions?.length === 0 && desigExceptions?.length === 0

//         if (isResponse1Length0 === false) {
//           setEmployeesListData(finalFiltered)
//           setTotalCount(finalFiltered?.length || 0)
//         } else {
//           const getCode = (item) => (item?.stCode ?? item?.storeCode ?? '').trim().toLowerCase()
//           const storeCodeNorm = (storeCode ?? '').trim().toLowerCase()
//           const storeFilterData = records.filter((item) => getCode(item) === storeCodeNorm)

//           if (Array.isArray(locationList) && locationList.length > 0) {
//             const allowedLocCodes = new Set(
//               locationList.map((it) => it?.stCode?.trim()?.toLowerCase()).filter(Boolean),
//             )
//             const filteredEmployees = records.filter((item) => allowedLocCodes.has(getCode(item)))
//             setEmployeesListData(filteredEmployees)
//             setTotalCount(filteredEmployees?.length || 0)
//           } else {
//             if (role === 'StoreHR') {
//               setEmployeesListData(storeFilterData)
//               setTotalCount(storeFilterData?.length || 0)
//             } else {
//               setEmployeesListData(records)
//               setTotalCount(response?.totalCount ?? records?.length ?? 0)
//             }
//           }
//         }
//       }

//       const absList = await getAbscondingReasonList()
//       const blackList = await getBlacklistReasonList()
//       if (requestId !== latestRequestIdRef.current) return
//       setabscondingList(absList)
//       setblackList(blackList)
//     } catch (error) {
//       console.error('Error fetching data:', error.response?.data || error.message)
//       message.error(error?.response?.data?.message || 'Error fetching data')
//     } finally {
//       if (requestId === latestRequestIdRef.current) {
//         dispatch(set({ loading: false }))
//       }
//     }
//   }

//   const fetchInactiveData = async () => {
//     // ✅ CHANGE: guard
//     if (!ecode) return

//     dispatch(set({ loading: true }))
//     const requestId = ++latestRequestIdRef.current
//     try {
//       const response = await getEmployeeListOld({ currentPage, pageSize, search, mode: 'inactive' })
//       if (requestId !== latestRequestIdRef.current) return

//       const records = Array.isArray(response?.employees) ? response.employees : response || []
//       setEmployeesListData(records)
//       setTotalCount(
//         typeof response?.totalCount === 'number' ? response.totalCount : records.length || 0,
//       )
//     } catch (error) {
//       console.error('Error fetching inactive data:', error?.response?.data || error?.message)
//       message.error(error?.response?.data?.message || 'Error fetching inactive employees')
//     } finally {
//       if (requestId === latestRequestIdRef.current) {
//         dispatch(set({ loading: false }))
//       }
//     }
//   }

//   const fetchAbscondedData = async () => {
//     // ✅ CHANGE: guard
//     if (!ecode) return

//     dispatch(set({ loading: true }))
//     const requestId = ++latestRequestIdRef.current
//     try {
//       const absList = await getAbscondingReasonList()
//       if (requestId !== latestRequestIdRef.current) return
//       setabscondingList(absList)
//     } catch (error) {
//       console.error('Error fetching absconded data:', error.response?.data || error.message)
//       message.error(error?.response?.data?.message || 'Error fetching absconded employees')
//     } finally {
//       if (requestId === latestRequestIdRef.current) {
//         dispatch(set({ loading: false }))
//       }
//     }
//   }

//   useEffect(() => {
//     if (activeTab === 'inactive') {
//       const t = setTimeout(() => fetchInactiveData(), 400)
//       return () => clearTimeout(t)
//     } else if (activeTab === 'abscond') {
//       const t = setTimeout(() => fetchAbscondedData(), 400)
//       return () => clearTimeout(t)
//     } else {
//       const t = setTimeout(() => fetchData(), 400)
//       return () => clearTimeout(t)
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [search, activeTab])

//   const prevTabRef = useRef(activeTab)
//   useEffect(() => {
//     if (prevTabRef.current === 'inactive' && activeTab !== 'inactive') {
//       fetchData()
//     }
//     prevTabRef.current = activeTab
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [activeTab])

//   useEffect(() => {
//     setCurrentPage(1)
//   }, [
//     activeTab,
//     zoneFilterValues,
//     regionFilterValues,
//     clusterFilterValues,
//     storeCodeFilterValues,
//     locationNameFilterValues,
//     textFilters,
//     search,
//   ])

//   useEffect(() => {
//     const maxPage = Math.max(1, Math.ceil(displayData.length / pageSize))
//     if (currentPage > maxPage) setCurrentPage(1)
//   }, [displayData.length, pageSize])

//   useEffect(() => {
//     if (!Array.isArray(filteredSideMenu) || filteredSideMenu.length === 0) return
//     const data = filteredSideMenu
//       .flatMap((group) => group.items || [])
//       .filter((item) => item?.to === pathname)

//     const perItemActions = data.map((item) => ({
//       itemName: item?.name || null,
//       to: item?.to || null,
//       actions: (item?.actions || []).map((a) => ({
//         actionName: a?.actionName || '',
//         actionStatus: !!a?.actionStatus,
//       })),
//     }))

//     const flatActions = perItemActions.flatMap((p) => p.actions)
//     const dedupMap = new Map()
//     for (const act of flatActions) {
//       const key = (act.actionName || '').trim().toLowerCase()
//       if (!key) continue
//       if (!dedupMap.has(key)) {
//         dedupMap.set(key, { actionName: act.actionName, actionStatus: act.actionStatus })
//       } else {
//         const ex = dedupMap.get(key)
//         ex.actionStatus = ex.actionStatus || act.actionStatus
//       }
//     }

//     const normKey = (s = '') => (s + '').trim().toLowerCase()
//     const actionsDetailTemp = new Map()
//     for (const item of data) {
//       for (const a of item?.actions || []) {
//         const key = normKey(a?.actionName || String(a?.actionIds?.[0] || ''))
//         if (!key) continue
//         if (!actionsDetailTemp.has(key)) {
//           actionsDetailTemp.set(key, {
//             actionName: a.actionName || '',
//             actionIds: new Set(a.actionIds || []),
//             actionStatus: !!a.actionStatus,
//             furtherPartsMap: new Map(),
//           })
//           for (const fp of a.furtherParts || []) {
//             const fpId = fp?.actionFurtherPartId ?? null
//             const fpName = fp?.actionFurtherPartName ?? (typeof fp === 'string' ? fp : null)
//             const fpKey =
//               fpId !== null
//                 ? String(fpId)
//                 : fpName
//                   ? String(fpName).trim().toLowerCase()
//                   : JSON.stringify(fp)
//             actionsDetailTemp.get(key).furtherPartsMap.set(fpKey, fp)
//           }
//         } else {
//           const ex = actionsDetailTemp.get(key)
//           for (const id of a.actionIds || []) ex.actionIds.add(id)
//           ex.actionStatus = ex.actionStatus || !!a.actionStatus
//           for (const fp of a.furtherParts || []) {
//             const fpId = fp?.actionFurtherPartId ?? null
//             const fpName = fp?.actionFurtherPartName ?? (typeof fp === 'string' ? fp : null)
//             const fpKey =
//               fpId !== null
//                 ? String(fpId)
//                 : fpName
//                   ? String(fpName).trim().toLowerCase()
//                   : JSON.stringify(fp)
//             if (!ex.furtherPartsMap.has(fpKey)) ex.furtherPartsMap.set(fpKey, fp)
//           }
//         }
//       }
//     }

//     const actionsDetailMap = {}
//     for (const [k, v] of actionsDetailTemp) {
//       actionsDetailMap[k] = {
//         actionName: v.actionName,
//         actionIds: Array.from(v.actionIds),
//         actionStatus: !!v.actionStatus,
//         furtherParts: Array.from(v.furtherPartsMap.values()),
//       }
//     }
//     setActionsMap(actionsDetailMap)
//   }, [filteredSideMenu, pathname])

//   const handleTableChange = (page, newPageSize) => {
//     setCurrentPage(page)
//     setPageSize(newPageSize)
//   }

//   const handleToggle = async (
//     id,
//     leavingDate,
//     remarks,
//     status,
//     attachments = [],
//     reasonid,
//     abscondingReasonId,
//     blackListReasonId,
//   ) => {
//     const newFormData = new FormData()
//     newFormData.append('id', id)
//     newFormData.append('isactive', status === 'true')
//     newFormData.append('remarks', remarks ?? '')
//     newFormData.append('lastUpdatedBy', ecode)
//     newFormData.append('leavingDate', '2025-01-01') // this is a static field which does not affect backend

//     const isActivatingInAbscond = activeTab === 'abscond' && status === 'true'

//     if (!isActivatingInAbscond) {
//       if (status !== 'true') {
//         if (leavingDate) newFormData.append('leavingDate', leavingDate)
//         if (reasonid) newFormData.append('reasonid', reasonid)

//         if (abscondingReasonId) {
//           newFormData.append('abscondingReasonId', abscondingReasonId)
//           newFormData.append('resignationTypeId', 10)
//         }

//         if (blackListReasonId) {
//           newFormData.append('blackListReasonId', blackListReasonId)
//           newFormData.append('resignationTypeId', 10)
//         }
//       }
//     }

//     // ✅ SAFETY: attachments must always be an array
//     const safeAttachments = Array.isArray(attachments) ? attachments : []
//     if (safeAttachments.length > 0) {
//       safeAttachments.forEach((att) => newFormData.append('inactiveattachment', att?.originFileObj))
//     }

//     try {
//       await markEmployeeActiveStatus(newFormData)
//       await fetchData()
//       setSearch('')
//       message.success('Employee Status Updated')
//     } catch (error) {
//       console.error('Employee Status Update Failed', error)
//       message.error('Employee Status Update Failed')
//       throw error
//     }
//   }

//   const refreshPage = async (ecode) => {
//     try {
//       dispatch(set({ loading: true }))
//       const res = await axiosInstance.get(`/api/EmployeeNew/RefreshEmpDetails?eCode=${ecode}`)
//       if (res.status === 200) message.success(res.data?.message || 'Executed Successfully')
//     } catch (error) {
//       console.error('error refreshing data: ', error)
//     } finally {
//       dispatch(set({ loading: false }))
//     }
//   }

//   const resetPassword = async (record) => {
//     const { ecode } = record
//     const payload = { ecode }

//     try {
//       const response = await resetEmployeePsd(payload)

//       if (response.status === 200) {
//         message.success(response.data?.message || 'Password resetted successfully!')
//       }
//     } catch (error) {
//       console.error('error:', error)
//       message.error(error?.response?.data?.message || 'Error resetting password!')
//     }
//   }

//   const cancel = (e) => {
//     console.log(e)
//   }
//   const columns = useMemo(() => {
//     return [
//       {
//         title: 'Zone',
//         dataIndex: 'zoneName',
//         key: 'zoneName',
//         width: 100,
//         ellipsis: true,
//         filteredValue: zoneFilterValues.length ? zoneFilterValues : null,
//         filterDropdown: ({ confirm }) => (
//           <FilterDropdown
//             title={'Zone'}
//             dataIndex={'zoneName'}
//             dataList={zoneOptions}
//             filterValues={zoneFilterValues}
//             setFilterValues={setZoneFilterValues}
//             confirm={confirm}
//           />
//         ),
//       },
//       {
//         title: 'Region',
//         dataIndex: 'regionName',
//         key: 'regionName',
//         ellipsis: true,
//         width: 100,
//         filteredValue: regionFilterValues.length ? regionFilterValues : null,
//         filterDropdown: ({ confirm }) => (
//           <FilterDropdown
//             title={'Region'}
//             dataIndex={'regionName'}
//             dataList={regionOptions}
//             filterValues={regionFilterValues}
//             setFilterValues={setRegionFilterValues}
//             confirm={confirm}
//           />
//         ),
//       },
//       {
//         title: 'Cluster',
//         dataIndex: 'clusterName',
//         key: 'clusterName',
//         ellipsis: true,
//         width: 100,
//         filteredValue: clusterFilterValues.length ? clusterFilterValues : null,
//         filterDropdown: ({ confirm }) => (
//           <FilterDropdown
//             title={'Cluster'}
//             dataIndex={'clusterName'}
//             dataList={clusterOptions}
//             filterValues={setClusterFilterValues ? clusterFilterValues : []}
//             setFilterValues={setClusterFilterValues}
//             confirm={confirm}
//           />
//         ),
//       },
//       {
//         title: 'St Code',
//         dataIndex: 'stCode',
//         key: 'stCode',
//         width: 100,
//         ellipsis: true,
//         filteredValue: storeCodeFilterValues.length ? storeCodeFilterValues : null,
//         filterDropdown: ({ confirm }) => (
//           <FilterDropdown
//             title="St Code"
//             dataIndex="stCode"
//             dataList={storeCodeOptions}
//             filterValues={storeCodeFilterValues}
//             setFilterValues={setStoreCodeFilterValues}
//             confirm={confirm}
//           />
//         ),
//       },
//       {
//         title: 'St Loc',
//         dataIndex: 'locationName',
//         key: 'locationName',
//         width: 120,
//         ellipsis: true,
//         filteredValue: locationNameFilterValues.length ? locationNameFilterValues : null,
//         filterDropdown: ({ confirm }) => (
//           <FilterDropdown
//             title="St Loc"
//             dataIndex="locationName"
//             dataList={locationOptions}
//             filterValues={setLocationNameFilterValues ? locationNameFilterValues : []}
//             setFilterValues={setLocationNameFilterValues}
//             confirm={confirm}
//           />
//         ),
//       },
//       {
//         title: 'Loc Emp Code',
//         dataIndex: 'locBasedECode',
//         key: 'locBasedECode',
//         width: 160,
//         ellipsis: true,
//         ...getColumnSearchProps('locBasedECode', 'Loc Emp Code'),
//       },
//       {
//         title: 'Emp Code',
//         dataIndex: 'ecode',
//         key: 'ecode',
//         width: 120,
//         ellipsis: true,
//         ...getColumnSearchProps('ecode', 'Emp Code'),
//       },
//       {
//         title: 'Emp Name',
//         dataIndex: 'fullName',
//         key: 'fullName',
//         width: 130,
//         ellipsis: true,
//         ...getColumnSearchProps('fullName', 'Emp Name'),
//       },
//       {
//         title: 'Gender',
//         dataIndex: 'gender',
//         key: 'gender',
//         width: 90,
//         ellipsis: true,
//       },
//       {
//         title: 'D.O.B.',
//         dataIndex: 'dob',
//         key: 'dob',
//         width: 110,
//         ellipsis: true,
//         render: (date) => (date === null ? null : String(date).trim().split('T')[0]),
//       },
//       {
//         title: 'Age',
//         dataIndex: 'ageInYears',
//         key: 'ageInYears',
//         width: 80,
//         ellipsis: true,
//       },
//       {
//         title: 'Department',
//         dataIndex: 'departmentName',
//         key: 'departmentName',
//         width: 140,
//         ellipsis: true,
//         filteredValue: deptFilterValues.length ? deptFilterValues : null,
//         filterDropdown: ({ confirm }) => (
//           <FilterDropdown
//             title={'Department'}
//             dataIndex={'departmentName'}
//             dataList={deptOptions}
//             filterValues={deptFilterValues}
//             setFilterValues={setDeptFilterValues}
//             confirm={confirm}
//           />
//         ),
//       },
//       {
//         title: 'Current Desg',
//         dataIndex: 'designationName',
//         key: 'designationName',
//         width: 150,
//         ellipsis: true,
//         filteredValue: desgFilterValues.length ? desgFilterValues : null,
//         filterDropdown: ({ confirm }) => (
//           <FilterDropdown
//             title={'Designation'}
//             dataIndex={'designationName'}
//             dataList={desgOptions}
//             filterValues={desgFilterValues}
//             setFilterValues={setDesgFilterValues}
//             confirm={confirm}
//           />
//         ),
//       },
//       {
//         title: 'D.O.J.',
//         dataIndex: 'dateOfJoining',
//         key: 'dateOfJoining',
//         width: 110,
//         ellipsis: true,
//         render: (date) => (date === null ? null : String(date).trim().split('T')[0]),
//         ...getColumnSearchProps('dateOfJoining', 'D.O.J.'),
//       },
//       {
//         title: 'Emp Status',
//         dataIndex: 'isActive',
//         key: 'isActive',
//         width: 100,
//         ellipsis: true,
//         render: (value, record) =>
//           String(record?.resignationTypeName).trim() !== ''
//             ? record?.resignationTypeName
//             : record?.isActive
//               ? 'Active'
//               : 'Left',
//       },
//       {
//         title: 'D.O.L.',
//         dataIndex: 'dateOfLeft',
//         key: 'dateOfLeft',
//         width: 110,
//         ellipsis: true,
//         render: (date) => (date === null ? null : String(date).trim().split('T')[0]),
//         ...getColumnSearchProps('dateOfLeft', 'D.O.L.'),
//       },
//       {
//         title: 'Abscond Reason',
//         dataIndex: 'abscondingReasonName',
//         key: 'abscondingReasonName',
//         width: 150,
//         ellipsis: true,
//         render: (text) => text || '-',
//         filteredValue: textFilters.abscondingReasonName ? [textFilters.abscondingReasonName] : null,
//         ...getColumnSearchProps('abscondingReasonName', 'Abscond Reason'),
//       },
//       {
//         title: 'Created By',
//         key: 'createdBy',
//         dataIndex: 'createdBy',
//         width: 125,
//         ellipsis: true,
//       },
//       {
//         title: 'Created On',
//         key: 'createdOn',
//         dataIndex: 'createdOn',
//         width: 150,
//         ellipsis: true,
//         render: (datetime) => {
//           const date = String(datetime).split('T')[0]
//           const time = String(datetime).split('T')[1]
//           return `${date} - ${time}`
//         },
//       },
//       {
//         title: 'Updated By',
//         key: 'updatedBy',
//         dataIndex: 'updatedBy',
//         width: 125,
//         ellipsis: true,
//       },
//       {
//         title: 'Updated On',
//         key: 'updatedOn',
//         dataIndex: 'updatedOn',
//         width: 150,
//         ellipsis: true,
//         render: (datetime) => {
//           const date = String(datetime).split('T')[0]
//           const time = String(datetime).split('T')[1]
//           return `${date} - ${time}`
//         },
//       },
//       {
//         title: 'Action',
//         fixed: 'right',
//         key: 'id',
//         width: 200,
//         render: (_, record, index) => (
//           <Space size="middle">
//             {actionsMap?.resetpassword?.actionStatus && (
//               <Popconfirm
//                 title="Password reset"
//                 description="Are you sure want to reset password?"
//                 onConfirm={() => resetPassword(record)}
//                 onCancel={cancel}
//                 okText="Yes"
//                 cancelText="No"
//               >
//                 <UnlockOutlined style={{ fontSize: 18 }} />
//               </Popconfirm>
//             )}

//             {actionsMap?.refresh?.actionStatus && (
//               <Link>
//                 <Tooltip placement="top" title={'Refresh'}>
//                   <IoIosRefresh
//                     style={{ fontSize: 18 }}
//                     onClick={() => refreshPage(record?.ecode)}
//                   />
//                 </Tooltip>
//               </Link>
//             )}

//             {actionsMap?.view?.actionStatus && (
//               // <Link
//               //   to={`/employee/update/view/${record?.employeeId}`}
//               //   state={{ furtherParts: actionsMap?.view?.furtherParts || [] }}
//               // >
//               <Tooltip placement="top" title={'View'}>
//                 <EyeOutlined
//                   style={{ fontSize: 18 }}
//                   onClick={() => handleViewClick(record?.employeeId)}
//                 />
//               </Tooltip>
//               // </Link>
//             )}

//             {actionsMap?.edit?.actionStatus && (
//               // <Link
//               //   to={`/employee/update/${record?.employeeId}`}
//               //   state={{ furtherParts: actionsMap?.edit?.furtherParts || [] }}
//               // >
//               <Tooltip placement="top" title={'Edit'}>
//                 <EditOutlined
//                   style={{ fontSize: 18 }}
//                   onClick={() => handleEditClick(record?.employeeId)}
//                 />
//               </Tooltip>
//               // {/* </Link> */}
//             )}

//             {actionsMap?.active?.actionStatus && record?.isActive && (
//               <Switch
//                 checked={record.isActive}
//                 onChange={(checked) => {
//                   const data = {
//                     id: record.employeeId,
//                     checked: record.isActive,
//                     index,
//                     name: record.fullName,
//                     dateOfJoining: record?.dateOfJoining,
//                     ecode: record?.ecode || '',
//                   }
//                   setselectedEmployeeName(data)

//                   if (activeTab === 'abscond') {
//                     if (!checked) {
//                       openChecklistThenInactiveModal(record?.ecode, record?.employeeId)
//                     } else {
//                       setModalVisibleAbscond(true)
//                     }
//                     return
//                   }

//                   if (!checked) {
//                     openChecklistThenInactiveModal(record?.ecode, record?.employeeId)
//                   } else {
//                     setIsEmployeeInactiveModalOpen(true)
//                     setSelectedEmpId(record?.employeeId)
//                     setSelectedEmpName(record?.fullName || '')
//                   }
//                 }}
//                 size="small"
//               />
//             )}

//             {actionsMap?.inactive?.actionStatus && !record?.isActive && (
//               <Switch
//                 checked={record.isActive}
//                 onChange={(checked) => {
//                   const data = {
//                     id: record.employeeId,
//                     checked: record.isActive,
//                     index,
//                     name: record.fullName,
//                     dateOfJoining: record?.dateOfJoining,
//                     ecode: record?.ecode || '',
//                   }
//                   setselectedEmployeeName(data)

//                   if (activeTab === 'abscond') {
//                     if (!checked) {
//                       openChecklistThenInactiveModal(record?.ecode, record?.employeeId)
//                     } else {
//                       setModalVisibleAbscond(true)
//                     }
//                     return
//                   }

//                   if (!checked) {
//                     openChecklistThenInactiveModal(record?.ecode, record?.employeeId)
//                   } else {
//                     setIsEmployeeInactiveModalOpen(true)
//                     setSelectedEmpId(record?.employeeId)
//                     setSelectedEmpName(record?.fullName || '')
//                   }
//                 }}
//                 size="small"
//               />
//             )}
//           </Space>
//         ),
//       },
//     ]
//   }, [
//     zoneFilterValues,
//     regionFilterValues,
//     clusterFilterValues,
//     storeCodeFilterValues,
//     locationNameFilterValues,
//     deptFilterValues,
//     desgFilterValues,
//     textFilters,
//     actionsMap,
//     activeTab,
//     zoneOptions,
//     regionOptions,
//     clusterOptions,
//     storeCodeOptions,
//     locationOptions,
//     deptOptions,
//     desgOptions,
//     openChecklistThenInactiveModal,
//   ])

//   const tableColumns = useMemo(() => {
//     if (activeTab !== 'inactive') return columns

//     const keep = new Set([
//       'stCode',
//       'locationName',
//       'locBasedECode',
//       'ecode',
//       'fullName',
//       'departmentName',
//       'designationName',
//       'dateOfJoining',
//       'createdBy',
//       'createdOn',
//       'updatedBy',
//       'updatedOn',
//     ])

//     return columns.filter((col) => col.key === 'id' || keep.has(col.dataIndex))
//   }, [columns, activeTab])

//   const totalWidth = useMemo(
//     () => tableColumns.reduce((sum, col) => sum + (col.width || 150), 0),
//     [tableColumns],
//   )

//   const handleSearchChange = (e) => setSearch(e.target.value)

//   const handleClearFilters = () => {
//     setZoneFilterValues([])
//     setRegionFilterValues([])
//     setClusterFilterValues([])
//     setStoreCodeFilterValues([])
//     setLocationNameFilterValues([])
//     setDeptFilterValues([])
//     setDesgFilterValues([])
//     setTextFilters({})
//     setSearch('')
//     setCurrentPage(1)
//   }

//   const exportableColumns = useMemo(
//     () =>
//       (columns || [])
//         .filter((c) => !!c.dataIndex)
//         .map((c) => ({
//           title: c.title,
//           dataIndex: c.dataIndex,
//         })),
//     [columns],
//   )

//   const getCellValue = (row, colKey) => {
//     const v = row?.[colKey]
//     if (v == null) return ''
//     if (
//       colKey === 'createdOn' ||
//       colKey === 'updatedOn' ||
//       colKey === 'dob' ||
//       colKey === 'dateOfJoining' ||
//       colKey === 'dateOfLeft'
//     ) {
//       return String(v).includes('T') ? String(v).split('T')[0] : String(v)
//     }
//     if (colKey === 'isActive') {
//       return v === true ? 'Active' : 'Left'
//     }
//     return String(v)
//   }

//   const csvEscape = (val) => {
//     const s = String(val ?? '')
//     return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
//   }

//   const rowsToCommaSeparatedValues = (rows, cols) => {
//     const header = cols.map((c) => csvEscape(c.title)).join(',')
//     const body = rows
//       .map((r) => cols.map((c) => csvEscape(getCellValue(r, c.dataIndex))).join(','))
//       .join('\n')
//     return `${header}\n${body}`
//   }

//   const downloadBlob = (blob, filename) => {
//     const url = window.URL.createObjectURL(blob)
//     const a = document.createElement('a')
//     a.href = url
//     a.download = filename
//     document.body.appendChild(a)
//     a.click()
//     a.remove()
//     window.URL.revokeObjectURL(url)
//   }

//   const handleDownloadFiltered = () => {
//     const filteredRows = displayData || []
//     if (!filteredRows.length) {
//       message.info('No rows to export for the current view.')
//       return
//     }

//     const csv = rowsToCommaSeparatedValues(filteredRows, exportableColumns)

//     const tabNameMap = {
//       ho: 'HO',
//       stores: 'Stores',
//       upc: 'UPC',
//       hubdc: 'HUBDC', // ✅ NEW
//       naps: 'NAPS',
//       abscond: 'Absconded',
//     }
//     const tabName = tabNameMap[activeTab] || 'All'

//     const ts = new Date().toISOString().replace(/[:]/g, '-')
//     const filename = `Employees_${tabName}_${ts}.csv`
//     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
//     downloadBlob(blob, filename)
//   }

//   // ✅ CHANGE: render guard to prevent blank/crash on first SPA navigation
//   if (!ecode) {
//     return (
//       <>
//         <Pageheading title="Employees Master" />
//         <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
//           <Spin />
//         </div>
//       </>
//     )
//   }

//   return (
//     <>
//       <Pageheading title="Employees Master" />

//       <Tabs
//         activeKey={activeTab}
//         onChange={(key) => {
//           setActiveTab(key)
//           setZoneFilterValues([])
//           setRegionFilterValues([])
//           setClusterFilterValues([])
//           setStoreCodeFilterValues([])
//           setLocationNameFilterValues([])
//           setTextFilters({})
//         }}
//         items={
//           role === 'NapsHR'
//             ? [{ key: 'naps', label: 'NAPS' }]
//             : [
//                 { key: 'ho', label: 'HO' },
//                 { key: 'stores', label: 'Active Stores' },
//                 { key: 'upc', label: 'UPC Stores' },

//                 // ✅ NEW TAB
//                 { key: 'hubdc', label: 'HUB/DC' },

//                 { key: 'naps', label: 'NAPS' },
//                 { key: 'inactive', label: 'Inactive' },
//                 { key: 'abscond', label: 'Abscond' },
//               ]
//         }
//         style={{ marginBottom: 8 }}
//         tabBarExtraContent={
//           <Button onClick={handleDownloadFiltered} icon={<ExportOutlined />}>
//             Download (Filtered)
//           </Button>
//         }
//       />

//       {activeTab !== 'inactive' && activeTab !== 'abscond' && <CardInRow data={subCardData} />}

//       <ToastContainer
//         position="top-right"
//         autoClose={2000}
//         hideProgressBar={false}
//         closeOnClick
//         pauseOnHover
//         draggable
//       />

//       <EmployeeInactiveModal
//         isModalOpen={isEmployeeInactiveModalOpen}
//         setIsModalOpen={setIsEmployeeInactiveModalOpen}
//         empID={selectedEmpId}
//         empName={selectedEmpName}
//         fetchData={fetchData}
//       />

//       <InactiveChecklistModal
//         open={inactiveChecklistOpen}
//         onClose={() => setInactiveChecklistOpen(false)}
//         onSubmit={handleChecklistSubmit}
//         loading={inactiveChecklistLoading}
//         ecode={currentEcode}
//         employeeId={currentEmployeeId}
//       />

//       <div className="def" style={{ paddingBottom: 10 }}>
//         <TableBulkActionIcons
//           totalRecords={displayData.length}
//           selectedRowKeys={selectedRowKeys}
//           handleSearch={handleSearchChange}
//           lodingLocal={lodingLocal}
//           setlodingLocal={setlodingLocal}
//           refreshData={fetchData}
//           empData={empData}
//           search={search}
//           cardsData={subCardData}
//           actionsMap={actionsMap}
//           ecode={ecode}
//           handleClearFilters={handleClearFilters}
//         />

//         {!isMobile ? (
//           <Table
//             rowKey="employeeId"
//             columns={tableColumns}
//             dataSource={displayData}
//             bordered
//             scroll={{ x: totalWidth, y: 'calc(100vh - 160px)' }}
//             style={{ whiteSpace: 'nowrap' }}
//             className={theme === 'dark' ? 'dark-theme' : ''}
//             pagination={{
//               current: currentPage,
//               position: ['bottomRight'],
//               total: displayData.length,
//               pageSize,
//               showSizeChanger: true,
//               pageSizeOptions: [10, 20, 50, 100],
//               onChange: handleTableChange,
//             }}
//           />
//         ) : (
//           <div>
//             <div
//               style={{
//                 backgroundColor: '#fafafa',
//                 borderRadius: '8px 8px 0 0',
//                 border: '1px solid #d9d9d9',
//                 borderBottom: '2px solid #1890ff',
//                 position: 'sticky',
//                 top: 0,
//                 zIndex: 100,
//               }}
//             >
//               <table
//                 style={{
//                   width: '100%',
//                   tableLayout: 'fixed',
//                   borderCollapse: 'collapse',
//                   fontSize: 11,
//                 }}
//               >
//                 <colgroup>
//                   <col style={{ width: '15%' }} />
//                   <col style={{ width: '25%' }} />
//                   <col style={{ width: '25%' }} />
//                   <col style={{ width: '15%' }} />
//                   <col style={{ width: '20%' }} />
//                 </colgroup>
//                 <thead>
//                   <tr>
//                     <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
//                       St Code
//                     </th>
//                     <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
//                       Emp Code
//                     </th>
//                     <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
//                       Name
//                     </th>
//                     <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
//                       Gender
//                     </th>
//                     <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
//                       Action
//                     </th>
//                   </tr>
//                 </thead>
//               </table>
//             </div>

//             {displayData
//               .slice((currentPage - 1) * pageSize, currentPage * pageSize)
//               .map((record) => {
//                 const isExpanded = expandedCards[record.employeeId]

//                 return (
//                   <div
//                     key={record.employeeId}
//                     style={{
//                       border: '1px solid #d9d9d9',
//                       borderTop: 'none',
//                       background: '#fff',
//                     }}
//                   >
//                     <table
//                       style={{
//                         width: '100%',
//                         tableLayout: 'fixed',
//                         borderCollapse: 'collapse',
//                         fontSize: 11,
//                       }}
//                     >
//                       <colgroup>
//                         <col style={{ width: '15%' }} />
//                         <col style={{ width: '25%' }} />
//                         <col style={{ width: '25%' }} />
//                         <col style={{ width: '15%' }} />
//                         <col style={{ width: '20%' }} />
//                       </colgroup>
//                       <tbody>
//                         <tr>
//                           <td style={{ padding: '8px 4px', textAlign: 'center' }}>
//                             {record.stCode || '-'}
//                           </td>
//                           <td
//                             style={{
//                               padding: '8px 4px',
//                               textAlign: 'center',
//                               color: '#1890ff',
//                               fontWeight: 500,
//                             }}
//                           >
//                             {record.ecode || '-'}
//                           </td>
//                           <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: 10 }}>
//                             {record.fullName || '-'}
//                           </td>
//                           <td style={{ padding: '8px 4px', textAlign: 'center' }}>
//                             {record.gender || '-'}
//                           </td>
//                           <td
//                             style={{
//                               padding: '8px 4px',
//                               textAlign: 'center',
//                               display: 'flex',
//                               gap: 4,
//                               justifyContent: 'center',
//                               alignItems: 'center',
//                             }}
//                           >
//                             {actionsMap?.refresh?.actionStatus && (
//                               <Tooltip title="Refresh">
//                                 <IoIosRefresh
//                                   style={{ fontSize: 16 }}
//                                   onClick={() => refreshPage(record?.ecode)}
//                                 />
//                               </Tooltip>
//                             )}
//                             {actionsMap?.view?.actionStatus && (
//                               <Link
//                                 to={`/employee/update/view/${record?.employeeId}`}
//                                 state={{ furtherParts: actionsMap?.view?.furtherParts || [] }}
//                               >
//                                 <EyeOutlined style={{ fontSize: 14 }} />
//                               </Link>
//                             )}
//                             {actionsMap?.edit?.actionStatus && (
//                               <Link
//                                 to={`/employee/update/${record?.employeeId}`}
//                                 state={{ furtherParts: actionsMap?.edit?.furtherParts || [] }}
//                               >
//                                 <EditOutlined style={{ fontSize: 14 }} />
//                               </Link>
//                             )}
//                             <Button
//                               type="text"
//                               size="small"
//                               icon={isExpanded ? <MinusOutlined /> : <PlusOutlined />}
//                               onClick={() => handleToggleCard(record.employeeId)}
//                               style={{ padding: '2px 4px', fontSize: 10 }}
//                             />
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>

//                     {isExpanded && (
//                       <div
//                         style={{
//                           padding: 8,
//                           background: '#fafafa',
//                           borderTop: '1px solid #e8e8e8',
//                           fontSize: 10,
//                         }}
//                       >
//                         <Row gutter={[4, 6]}>
//                           <Col span={8}>
//                             <div style={{ color: '#8c8c8c', marginBottom: 2, fontSize: 9 }}>
//                               DOB
//                             </div>
//                             <div style={{ fontWeight: 500, fontSize: 9 }}>
//                               {record.dob ? String(record.dob).split('T')[0] : '-'}
//                             </div>
//                           </Col>
//                           <Col span={8}>
//                             <div style={{ color: '#8c8c8c', marginBottom: 2, fontSize: 9 }}>
//                               DOJ
//                             </div>
//                             <div style={{ fontWeight: 500, fontSize: 9 }}>
//                               {record.dateOfJoining
//                                 ? String(record.dateOfJoining).split('T')[0]
//                                 : '-'}
//                             </div>
//                           </Col>
//                           <Col span={8}>
//                             <div style={{ color: '#8c8c8c', marginBottom: 2, fontSize: 9 }}>
//                               Loc Code
//                             </div>
//                             <div style={{ fontWeight: 500, fontSize: 9 }}>
//                               {record.locBasedECode || '-'}
//                             </div>
//                           </Col>

//                           <Col span={8}>
//                             <div style={{ color: '#8c8c8c', marginBottom: 2, fontSize: 9 }}>
//                               Zone
//                             </div>
//                             <div
//                               style={{
//                                 fontWeight: 500,
//                                 fontSize: 9,
//                                 overflow: 'hidden',
//                                 textOverflow: 'ellipsis',
//                                 whiteSpace: 'nowrap',
//                               }}
//                             >
//                               {record.zoneName || '-'}
//                             </div>
//                           </Col>
//                           <Col span={8}>
//                             <div style={{ color: '#8c8c8c', marginBottom: 2, fontSize: 9 }}>
//                               Region
//                             </div>
//                             <div
//                               style={{
//                                 fontWeight: 500,
//                                 fontSize: 9,
//                                 overflow: 'hidden',
//                                 textOverflow: 'ellipsis',
//                                 whiteSpace: 'nowrap',
//                               }}
//                             >
//                               {record.regionName || '-'}
//                             </div>
//                           </Col>
//                           <Col span={8}>
//                             <div style={{ color: '#8c8c8c', marginBottom: 2, fontSize: 9 }}>
//                               Location
//                             </div>
//                             <div
//                               style={{
//                                 fontWeight: 500,
//                                 fontSize: 9,
//                                 overflow: 'hidden',
//                                 textOverflow: 'ellipsis',
//                                 whiteSpace: 'nowrap',
//                               }}
//                             >
//                               {record.locationName || '-'}
//                             </div>
//                           </Col>

//                           <Col span={8}>
//                             <div style={{ color: '#8c8c8c', marginBottom: 2, fontSize: 9 }}>
//                               Dept
//                             </div>
//                             <div
//                               style={{
//                                 fontWeight: 500,
//                                 fontSize: 9,
//                                 overflow: 'hidden',
//                                 textOverflow: 'ellipsis',
//                                 whiteSpace: 'nowrap',
//                               }}
//                             >
//                               {record.departmentName || '-'}
//                             </div>
//                           </Col>
//                           <Col span={8}>
//                             <div style={{ color: '#8c8c8c', marginBottom: 2, fontSize: 9 }}>
//                               Desig
//                             </div>
//                             <div
//                               style={{
//                                 fontWeight: 500,
//                                 fontSize: 9,
//                                 overflow: 'hidden',
//                                 textOverflow: 'ellipsis',
//                                 whiteSpace: 'nowrap',
//                               }}
//                             >
//                               {record.designationName || '-'}
//                             </div>
//                           </Col>

//                           {actionsMap?.activeinactive?.actionStatus && (
//                             <Col span={8}>
//                               <div style={{ color: '#8c8c8c', marginBottom: 2, fontSize: 9 }}>
//                                 Status
//                               </div>
//                               <Switch
//                                 checked={record.isActive}
//                                 onChange={(checked) => {
//                                   const data = {
//                                     id: record.employeeId,
//                                     checked: record.isActive,
//                                     name: record.fullName,
//                                     dateOfJoining: record?.dateOfJoining,
//                                     ecode: record?.ecode || '',
//                                   }
//                                   setselectedEmployeeName(data)

//                                   if (activeTab === 'abscond') {
//                                     if (!checked) {
//                                       openChecklistThenInactiveModal(
//                                         record?.ecode,
//                                         record?.employeeId,
//                                       )
//                                     } else {
//                                       setModalVisibleAbscond(true)
//                                     }
//                                     return
//                                   }

//                                   if (!checked) {
//                                     openChecklistThenInactiveModal(
//                                       record?.ecode,
//                                       record?.employeeId,
//                                     )
//                                   } else {
//                                     setIsEmployeeInactiveModalOpen(true)
//                                     setSelectedEmpId(record?.employeeId)
//                                     setSelectedEmpName(record?.fullName || '')
//                                   }
//                                 }}
//                                 size="small"
//                               />
//                             </Col>
//                           )}

//                           {activeTab === 'abscond' && (
//                             <Col span={24}>
//                               <div style={{ color: '#8c8c8c', marginBottom: 2, fontSize: 9 }}>
//                                 Abscond Reason
//                               </div>
//                               <div style={{ fontWeight: 500, fontSize: 9 }}>
//                                 {record.abscondingReasonName || '-'}
//                               </div>
//                             </Col>
//                           )}
//                         </Row>
//                       </div>
//                     )}
//                   </div>
//                 )
//               })}

//             <div
//               style={{
//                 marginTop: 16,
//                 textAlign: 'center',
//                 padding: 12,
//                 background: '#fafafa',
//                 border: '1px solid #d9d9d9',
//                 borderRadius: 4,
//               }}
//             >
//               <Space direction="vertical" size="small" style={{ width: '100%' }}>
//                 <div style={{ fontSize: 12 }}>
//                   Showing {(currentPage - 1) * pageSize + 1} -{' '}
//                   {Math.min(currentPage * pageSize, displayData.length)} of {displayData.length}{' '}
//                   items
//                 </div>
//                 <Space>
//                   <Button
//                     size="small"
//                     disabled={currentPage === 1}
//                     onClick={() => setCurrentPage(currentPage - 1)}
//                   >
//                     Previous
//                   </Button>
//                   <span style={{ fontSize: 12 }}>
//                     Page {currentPage} of {Math.ceil(displayData.length / pageSize)}
//                   </span>
//                   <Button
//                     size="small"
//                     disabled={currentPage >= Math.ceil(displayData.length / pageSize)}
//                     onClick={() => setCurrentPage(currentPage + 1)}
//                   >
//                     Next
//                   </Button>
//                 </Space>
//               </Space>
//             </div>
//           </div>
//         )}
//       </div>

//       <ExcelImportModal
//         importExelModal={importExelModal}
//         setimportExelModal={setimportExelModal}
//         title_fields={[]}
//       />

//       <EmployeeActiveInactiveModal
//         selectedEmployeeName={selectedEmployeeName}
//         abscondingList={abscondingList}
//         blackList={blackList}
//         visible={modalVisible}
//         onClose={() => setModalVisible(false)}
//         onSubmit={async (data) => {
//           try {
//             await handleToggle(
//               data.id,
//               data.leavingDate,
//               data.remarks,
//               data.status,
//               data?.attachments || [], // ✅ attachments in correct position
//               data?.reason, // ✅ reasonid in correct position
//               data?.abscondingReasonId,
//               data?.blackListReasonId,
//             )
//             setModalVisible(false) // ✅ close ONLY after success
//           } catch (e) {
//             // ✅ keep modal open if API fails
//           }
//         }}
//       />

//       <EmployeeActiveInactiveModalAbscond
//         selectedEmployeeName={selectedEmployeeName}
//         abscondingList={abscondingList}
//         blackList={blackList}
//         visible={modalVisibleAbscond}
//         onClose={() => setModalVisibleAbscond(false)}
//         onSubmit={async (data) => {
//           try {
//             await handleToggle(
//               data.id,
//               data.leavingDate,
//               data.remarks,
//               data.status,
//               data?.attachments || [], // ✅ correct
//               data?.reason, // ✅ correct
//               data?.abscondingReasonId,
//               data?.blackListReasonId,
//             )
//             setModalVisibleAbscond(false) // ✅ close only after success
//           } catch (e) {
//             // ✅ keep modal open if API fails
//           }
//         }}
//       />
//     </>
//   )
// }
// const TableBulkActionIcons = ({
//   totalRecords,
//   selectedRowKeys,
//   handleSearch,
//   search,
//   lodingLocal,
//   setlodingLocal,
//   refreshData,
//   cardsData,
//   actionsMap,
//   ecode,
//   handleClearFilters,
// }) => {
//   // ✅ CHANGE: safe selector
//   const theme = useSelector((state) => state?.ui?.theme)
//   const [isEmpUploadVisible, setIsEmpUploadVisible] = useState(false)

//   const [statusSummary, setstatusSummary] = useState([
//     { name: 'ActiveEmployees', label: 'Active Employees', count: 0, color: 'green', id: [1] },
//     { name: 'LeftEmployees', label: 'Left Employees', count: 0, color: 'blue', id: [7] },
//     { name: 'TotalEmployees', label: 'Total Employees', count: 0, color: 'blue', id: [7] },
//   ])

//   useEffect(() => {
//     const activeVal = cardsData.find((i) => i.label === 'Active')?.value || 0
//     const leftVal =
//       cardsData.find((i) => i.label === 'Left')?.value ??
//       cardsData.find((i) => i.label === 'Inactive')?.value ??
//       0
//     const totalVal = cardsData.find((i) => i.label === 'Total')?.value || 0

//     setstatusSummary([
//       {
//         name: 'Active Employees',
//         label: 'Active Employees',
//         count: activeVal,
//         color: 'green',
//         id: [1],
//       },
//       { name: 'Left Employees', label: 'Left Employees', count: leftVal, color: 'blue', id: [7] },
//       {
//         name: 'Total Employees',
//         label: 'Total Employees',
//         count: totalVal,
//         color: 'blue',
//         id: [7],
//       },
//     ])
//   }, [selectedRowKeys, totalRecords, cardsData])

//   const downloadStoreDataAsExcel = async ({ isActive, allEmployee, companyId }) => {
//     try {
//       setlodingLocal(true)
//       toast.info('Export is in queue, you will get an alert once the download is completed')
//       const { data, status } = await exportEmployeeMaster({ isActive, allEmployee, companyId })
//       if (status === 200) {
//         const blob = new Blob([data], {
//           type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//         })
//         const url = window.URL.createObjectURL(blob)
//         const anchor = document.createElement('a')
//         anchor.href = url
//         anchor.download = `Employee_${new Date().toISOString()}.xlsx`
//         document.body.appendChild(anchor)
//         anchor.click()
//         anchor.remove()
//         window.URL.revokeObjectURL(url)
//         toast.success('Export initiated successfully')
//       }
//     } catch (error) {
//       console.error('api error', error)
//       message.error('Export failed')
//     } finally {
//       setlodingLocal(false)
//     }
//   }

//   const items = [
//     {
//       key: '11',
//       label: (
//         <div
//           onClick={() =>
//             downloadStoreDataAsExcel({ isActive: true, allEmployee: true, companyId: 0 })
//           }
//         >
//           Export All Employees
//         </div>
//       ),
//     },
//     {
//       key: '12',
//       label: (
//         <div
//           onClick={() =>
//             downloadStoreDataAsExcel({ isActive: true, allEmployee: false, companyId: 0 })
//           }
//         >
//           Export All Active Employees
//         </div>
//       ),
//     },
//     {
//       key: '13',
//       label: (
//         <div
//           onClick={() =>
//             downloadStoreDataAsExcel({ isActive: false, allEmployee: false, companyId: 0 })
//           }
//         >
//           Export All InActive Employees
//         </div>
//       ),
//     },
//     {
//       key: '1',
//       label: (
//         <div
//           onClick={() =>
//             downloadStoreDataAsExcel({ isActive: true, allEmployee: true, companyId: 1 })
//           }
//         >
//           Export All V2R Employees
//         </div>
//       ),
//     },
//     {
//       key: '2',
//       label: (
//         <div
//           onClick={() =>
//             downloadStoreDataAsExcel({ isActive: true, allEmployee: true, companyId: 2 })
//           }
//         >
//           Export All V2S Employees
//         </div>
//       ),
//     },
//     {
//       key: '3',
//       label: (
//         <div
//           onClick={() =>
//             downloadStoreDataAsExcel({ isActive: true, allEmployee: true, companyId: 3 })
//           }
//         >
//           Export All PT Employees
//         </div>
//       ),
//     },
//     {
//       key: '4',
//       label: (
//         <div
//           onClick={() =>
//             downloadStoreDataAsExcel({ isActive: true, allEmployee: false, companyId: 1 })
//           }
//         >
//           Export Active V2R Employees
//         </div>
//       ),
//     },
//     {
//       key: '5',
//       label: (
//         <div
//           onClick={() =>
//             downloadStoreDataAsExcel({ isActive: false, allEmployee: false, companyId: 1 })
//           }
//         >
//           Export InActive V2R Employees
//         </div>
//       ),
//     },
//     {
//       key: '6',
//       label: (
//         <div
//           onClick={() =>
//             downloadStoreDataAsExcel({ isActive: true, allEmployee: false, companyId: 2 })
//           }
//         >
//           Export Active V2S Employees
//         </div>
//       ),
//     },
//     {
//       key: '7',
//       label: (
//         <div
//           onClick={() =>
//             downloadStoreDataAsExcel({ isActive: false, allEmployee: false, companyId: 2 })
//           }
//         >
//           Export InActive V2S Employees
//         </div>
//       ),
//     },
//     {
//       key: '8',
//       label: (
//         <div
//           onClick={() =>
//             downloadStoreDataAsExcel({ isActive: true, allEmployee: false, companyId: 3 })
//           }
//         >
//           Export Active PT Employees
//         </div>
//       ),
//     },
//     {
//       key: '9',
//       label: (
//         <div
//           onClick={() =>
//             downloadStoreDataAsExcel({ isActive: false, allEmployee: false, companyId: 3 })
//           }
//         >
//           Export InActive PT Employees
//         </div>
//       ),
//     },
//   ]

//   const handleOnBlur = () => {
//     sessionStorage.setItem('employeeListSearch', search)
//   }

//   const isRetailHierarchy = String(ecode).trim().toLowerCase() === 'v00362'

//   return (
//     <>
//       {isEmpUploadVisible && (
//         <EmployeesUploadModal
//           isVisible={isEmpUploadVisible}
//           setIsVisible={setIsEmpUploadVisible}
//           refreshData={refreshData}
//         />
//       )}
//       <div
//         style={{
//           padding: 5,
//           display: 'flex',
//           justifyContent: isRetailHierarchy ? 'end' : 'space-between',
//           alignItems: 'center',
//           flexWrap: 'wrap',
//           gap: 10,
//         }}
//       >
//         {!isRetailHierarchy && (
//           <Space wrap>
//             {statusSummary.map(({ name, label, count }, index) => (
//               <div
//                 key={index}
//                 style={{
//                   border: '2px solid #ccc',
//                   padding: 3,
//                   borderRadius: 10,
//                   display: 'flex',
//                   justifyContent: 'center',
//                 }}
//                 className={theme === 'dark' ? 'dark-theme' : ''}
//               >
//                 <Tooltip placement="top" title={label}>
//                   <span
//                     style={{
//                       display: 'inline-block',
//                       width: 100,
//                       overflow: 'hidden',
//                       whiteSpace: 'nowrap',
//                       textOverflow: 'ellipsis',
//                       fontSize: 12,
//                       padding: '0 8px',
//                     }}
//                   >
//                     {count} {name}
//                   </span>
//                 </Tooltip>
//               </div>
//             ))}
//           </Space>
//         )}

//         <Row>
//           <Col style={{ display: 'flex', alignItems: 'center' }}>
//             <Button onClick={handleClearFilters}>Clear Filters</Button>

//             {actionsMap?.upload_employees?.actionStatus && (
//               <Tooltip placement="top" title={'Upload Employees'}>
//                 <Button style={{ marginLeft: 5 }} onClick={() => setIsEmpUploadVisible(true)}>
//                   <UploadOutlined />
//                 </Button>
//               </Tooltip>
//             )}

//             {actionsMap?.export?.actionStatus && (
//               <Tooltip placement="top" title={'Export'}>
//                 <Dropdown menu={{ items }} trigger={['click']}>
//                   <Button style={{ marginLeft: 5 }} loading={lodingLocal}>
//                     <ExportOutlined />
//                   </Button>
//                 </Dropdown>
//               </Tooltip>
//             )}
//           </Col>

//           <Search
//             placeholder="Search in table..."
//             allowClear
//             onChange={handleSearch}
//             className={styles.tableSearch}
//             value={search}
//             onBlur={handleOnBlur}
//           />
//         </Row>
//       </div>
//     </>
//   )
// }

// export default EmployeesList



import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import useMediaQuery from '../hooks/useMediaQuery'
import EmployeesUploadModal from './EmployeesUploadModal'
import {
  Space,
  Table,
  Row,
  Input,
  Tooltip,
  Button,
  Col,
  Switch,
  message,
  Dropdown,
  Checkbox,
  Tabs,
  Popconfirm,
  Modal,
  Spin,
  Empty,
  Upload,
  Tag,
  Typography,
  Divider,
  DatePicker,
} from 'antd'
import {
  ExportOutlined,
  EditOutlined,
  UploadOutlined,
  EyeOutlined,
  PlusOutlined,
  MinusOutlined,
  UnlockOutlined,
  DeleteOutlined,
  PaperClipOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { toast, ToastContainer } from 'react-toastify'
import ExcelImportModal from '../components/modals/ExcelimportModal'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  exportEmployeeMaster,
  filterBgtSeatMaster,
  getAbscondingReasonList,
  getBlacklistReasonList,
  getEmployeeList,
  getEmployeeListOld,
  markEmployeeActiveStatus,
  resetEmployeePsd,
} from '../services/Services'
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../redux/uiSlice'
import EmployeeActiveInactiveModal from '../components/modals/EmployeeActiveInactiveModal'
import EmployeeActiveInactiveModalAbscond from '../components/modals/EmployeeActiveInactiveModalAbscond'
import Pageheading from '../components/shared/Pageheading'
import { IoIosRefresh } from 'react-icons/io'
import axiosInstance from '../services/axiosInstance'
import EmployeeInactiveModal from '../components/modals/EmployeeInactiveModal'
import BulkInactivateModal from '../components/modals/BulkInactivateModal'
import CardInRow from '../components/shared/CardInRow/CardInRow'
import useColumnSearch from '../components/shared/columnSearch'
import styles from './EmployeesList.module.css'

const { Search } = Input
const { RangePicker } = DatePicker

const FilterDropdown = ({ dataIndex, dataList, filterValues, setFilterValues, confirm, title }) => {
  const [searchText, setSearchText] = useState('')
  const [selectedOptions, setSelectedOptions] = useState(filterValues || [])

  useEffect(() => {
    setSelectedOptions(filterValues || [])
  }, [filterValues])

  const filteredOptions = (dataList || []).filter((item) =>
    (item ?? '').toString().toLowerCase().includes(searchText.toLowerCase()),
  )

  const handleChange = (checkedValues) => setSelectedOptions(checkedValues)
  const handleFilter = () => {
    setFilterValues(selectedOptions)
    confirm()
  }
  const handleReset = () => {
    setSelectedOptions([])
    setFilterValues([])
    setSearchText('')
    confirm()
  }

  return (
    <div style={{ padding: 8, width: 215 }}>
      <Input
        placeholder={`Search ${title}`}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 8, display: 'block' }}
      />
      <div style={{ maxHeight: 150, overflowY: 'auto', paddingRight: 8 }}>
        <Checkbox.Group
          value={selectedOptions}
          onChange={handleChange}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          {filteredOptions.map((value) => (
            <Checkbox key={value} value={value}>
              {value}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>
      <Space style={{ marginTop: 30 }}>
        <Button type="primary" size="small" onClick={handleFilter}>
          Filter
        </Button>
        <Button size="small" onClick={handleReset}>
          Reset
        </Button>
      </Space>
    </div>
  )
}

const InactiveChecklistModal = ({ open, onClose, onSubmit, loading, ecode, employeeId }) => {
  const [employeeChecklist, setEmployeeChecklist] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const initialRef = useRef([])

  const { Dragger } = Upload
  const { Text } = Typography

  const unwrapChecklist = (res) => {
    let payload = res?.data ?? res
    if (payload?.status === true && payload?.data != null) payload = payload.data
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.data?.data)) return payload.data.data
    return []
  }

  const normalizeChecklist = (list) => {
    return (list || []).map((x, idx) => {
      const id =
        x?.employeeResignationChecklistMasterId ?? x?.checkListId ?? x?.checklistId ?? x?.id ?? idx
      const name = x?.checkListName ?? x?.checklistName ?? x?.name ?? '-'
      const checked = x?.isChecked ?? x?.checked ?? x?.isSelected ?? false
      const disabled = x?.isDisabled ?? false

      const isAttachmentRequired =
        x?.isAttachmentRequired ??
        x?.attachmentRequired ??
        x?.isAttachementRequired ??
        false

      const attachment =
        x?.attachment ?? x?.attachmentName ?? x?.attachmentPath ?? x?.fileName ?? x?.file ?? ''

      return {
        checkListId: id,
        checkListName: name,
        isChecked: !!checked,
        isDisabled: !!disabled,
        isAttachmentRequired: !!isAttachmentRequired,
        attachment: attachment || '',
        attachmentFile: null,
      }
    })
  }

  const fetchChecklist = async () => {
    if (!ecode) {
      setEmployeeChecklist([])
      initialRef.current = []
      return
    }

    try {
      setIsLoading(true)
      const res = await axiosInstance.get(
        `/api/Employee/GetEmployeeResignationChecklist?ECode=${encodeURIComponent(ecode)}`,
      )

      const normalized = normalizeChecklist(unwrapChecklist(res))
      setEmployeeChecklist(normalized)

      initialRef.current = normalized.map((x) => ({
        checkListId: x.checkListId,
        isChecked: !!x.isChecked,
        attachment: (x.attachment || '').trim(),
        isAttachmentRequired: !!x.isAttachmentRequired,
      }))
    } catch (error) {
      console.error('Error fetching resignation checklist:', error)
      message.error(error?.response?.data?.message || 'Error fetching resignation checklist')
      setEmployeeChecklist([])
      initialRef.current = []
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) fetchChecklist()
  }, [open, ecode])

  const toggle = (checkListId, checked) => {
    setEmployeeChecklist((prev) =>
      prev.map((item) => {
        if (item.checkListId !== checkListId) return item
        if (!checked) return { ...item, isChecked: false, attachmentFile: null }
        return { ...item, isChecked: true }
      }),
    )
  }

  const updateAttachment = (checkListId, fileOrNull) => {
    setEmployeeChecklist((prev) =>
      prev.map((item) =>
        item.checkListId === checkListId ? { ...item, attachmentFile: fileOrNull } : item,
      ),
    )
  }

  const missingRequiredAttachments = useMemo(() => {
    return (employeeChecklist || [])
      .filter((x) => x.isAttachmentRequired && x.isChecked)
      .filter((x) => {
        const hasExisting = !!(x.attachment && String(x.attachment).trim())
        const hasNew = !!x.attachmentFile
        return !(hasExisting || hasNew)
      })
  }, [employeeChecklist])

  const isAnyRequiredAttachmentMissing = missingRequiredAttachments.length > 0

  const handleSubmit = async () => {
    let isAllFilled = employeeChecklist.every((c) => c.isChecked === true)
    if (!isAllFilled) return message.error('All check items are required')

    if (!employeeId) {
      message.error('EmployeeId is missing. Please reopen the checklist from employee row.')
      return
    }

    if (isAnyRequiredAttachmentMissing) {
      const names = missingRequiredAttachments.map((x) => x.checkListName).join(', ')
      message.error(`Attachment is mandatory for: ${names}`)
      return
    }

    const itemsJson = (employeeChecklist || []).map((item) => ({
      EmployeeResignationChecklistMasterId: item.checkListId,
      EmployeeId: String(employeeId),
      IsChecked: !!item.isChecked,
      IsAttachment: !!(item.isAttachmentRequired && item.isChecked),
    }))

    const formData = new FormData()
    formData.append('ItemsJson', JSON.stringify(itemsJson))

    let attachmentIdx = 0
    for (const item of employeeChecklist || []) {
      if (item.isAttachmentRequired && item.isChecked && item.attachmentFile) {
        formData.append(`Attachment[${attachmentIdx}]`, item.attachmentFile)
        attachmentIdx += 1
      }
    }

    try {
      setIsSaving(true)
      const res = await axiosInstance.post('/api/Employee/SaveChecklistResponse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      message.success(res?.data?.message || 'Checklist saved successfully')

      onSubmit?.({
        ecode,
        employeeId,
        checklist: itemsJson,
        apiResponse: res?.data,
      })
    } catch (error) {
      console.error('Error saving checklist:', error)
      message.error(error?.response?.data?.message || 'Error saving checklist')
    } finally {
      setIsSaving(false)
    }
  }

  const submitLoading = !!loading || isSaving

  return (
    <Modal
      title={`Resignation Checklist (${ecode || '-'})`}
      open={open}
      destroyOnClose
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={submitLoading}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={submitLoading}
          disabled={isAnyRequiredAttachmentMissing || submitLoading}
        >
          Submit
        </Button>,
      ]}
    >
      {isLoading ? (
        <Spin />
      ) : employeeChecklist.length === 0 ? (
        <Empty description="No checklist found" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {employeeChecklist.map((item) => {
            const required = !!item.isAttachmentRequired
            const checked = !!item.isChecked
            const existingAttachmentLabel = (item.attachment || '').trim()
            const missingThis =
              required && checked && !existingAttachmentLabel && !item.attachmentFile

            const selectedFile = item.attachmentFile
            const selectedFileName = selectedFile?.name || ''

            return (
              <div
                key={item.checkListId}
                style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: 10,
                  padding: 12,
                  background: '#fff',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <Checkbox
                    checked={checked}
                    disabled={!!item.isDisabled}
                    onChange={(e) => toggle(item.checkListId, e.target.checked)}
                    style={{ flex: 1 }}
                  >
                    <span style={{ fontWeight: 500 }}>{item.checkListName}</span>
                  </Checkbox>

                  {required ? <Tag color="red">Attachment Required</Tag> : null}
                </div>

                {required ? (
                  <>
                    <Divider style={{ margin: '10px 0' }} />
                    <div style={{ paddingLeft: 24 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 8,
                            alignItems: 'center',
                          }}
                        >
                          {existingAttachmentLabel ? (
                            <Tag icon={<PaperClipOutlined />} style={{ marginRight: 0 }}>
                              {existingAttachmentLabel}
                            </Tag>
                          ) : (
                            <Text type="secondary">No attachment uploaded yet.</Text>
                          )}

                          {selectedFileName ? (
                            <Tag icon={<FileTextOutlined />} style={{ marginRight: 0 }}>
                              {selectedFileName}
                            </Tag>
                          ) : null}

                          {selectedFile ? (
                            <Button
                              type="link"
                              icon={<DeleteOutlined />}
                              onClick={() => updateAttachment(item.checkListId, null)}
                              style={{ padding: 0, height: 'auto' }}
                            >
                              Remove
                            </Button>
                          ) : null}
                        </div>

                        <div
                          style={{
                            opacity: checked ? 1 : 0.5,
                            pointerEvents: checked ? 'auto' : 'none',
                          }}
                        >
                          <Dragger
                            multiple={false}
                            maxCount={1}
                            accept=".pdf,image/*"
                            showUploadList={false}
                            beforeUpload={() => false}
                            onChange={(info) => {
                              const file = info.fileList?.[0]?.originFileObj || null
                              updateAttachment(item.checkListId, file)
                            }}
                          >
                            <p className="ant-upload-drag-icon">
                              <UploadOutlined />
                            </p>
                            <p className="ant-upload-text" style={{ marginBottom: 0 }}>
                              {existingAttachmentLabel ? 'Replace attachment' : 'Upload attachment'}
                            </p>
                            <p className="ant-upload-hint" style={{ marginTop: 4 }}>
                              PDF or image files only
                            </p>
                          </Dragger>
                        </div>

                        {!checked ? (
                          <Text type="secondary">Check this item to enable upload.</Text>
                        ) : null}

                        {missingThis ? (
                          <Text type="danger">
                            Attachment is mandatory for this checklist item.
                          </Text>
                        ) : null}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}

const EmployeesList = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [isEmployeeInactiveModalOpen, setIsEmployeeInactiveModalOpen] = useState(false)
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [selectedEmpName, setSelectedEmpName] = useState('')
  const [employeesListData, setEmployeesListData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [totalCount, setTotalCount] = useState(0)
  const [importExelModal, setimportExelModal] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [search, setSearch] = useState(() => {
    try {
      const s = sessionStorage.getItem('employeeListSearch')
      return s && s.trim() !== '' ? s.trim() : ''
    } catch {
      return ''
    }
  })

  const isNapsRow = (r) => {
    const dept = keyOf(r?.departmentName)
    const desg = keyOf(r?.designationName)

    const deptIsNaps = dept === 'naps'
    const desgIsNaps = desg === 'naps'
    const desgHasNaps = desg.includes('naps')

    return (deptIsNaps && desgIsNaps) || desgHasNaps
  }

  const authData = useSelector((state) => state?.auth?.data) || {}
  const { storeCode, role, ecode, locationList } = authData

  const theme = useSelector((state) => state?.ui?.theme)
  const empData = useSelector((state) => state?.auth?.data)
  const filteredSideMenu = useSelector((state) => state?.auth?.filteredSideMenu) || []

  const [activeTab, setActiveTab] = useState(() => (role === 'NapsHR' ? 'naps' : 'ho'))

  const isMobile = useMediaQuery('(max-width: 768px)')
  const [expandedCards, setExpandedCards] = useState({})

  const handleToggleCard = useCallback((empCode) => {
    setExpandedCards((prev) => ({
      ...prev,
      [empCode]: !prev[empCode],
    }))
  }, [])

  const dispatch = useDispatch()

  const [lodingLocal, setlodingLocal] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalVisibleAbscond, setModalVisibleAbscond] = useState(false)
  const [selectedEmployeeName, setselectedEmployeeName] = useState({})

  const [storeCodeFilterValues, setStoreCodeFilterValues] = useState([])
  const [locationNameFilterValues, setLocationNameFilterValues] = useState([])
  const [zoneFilterValues, setZoneFilterValues] = useState([])
  const [regionFilterValues, setRegionFilterValues] = useState([])
  const [clusterFilterValues, setClusterFilterValues] = useState([])
  const [deptFilterValues, setDeptFilterValues] = useState([])
  const [desgFilterValues, setDesgFilterValues] = useState([])

  const [textFilters, setTextFilters] = useState({})
  const getColumnSearchProps = useColumnSearch(textFilters, setTextFilters)

  const [abscondingList, setabscondingList] = useState([])
  const [blackList, setblackList] = useState([])
  const latestRequestIdRef = useRef(0)

  const [actionsMap, setActionsMap] = useState({})

  const [inactiveChecklistOpen, setInactiveChecklistOpen] = useState(false)
  const [inactiveChecklistLoading, setInactiveChecklistLoading] = useState(false)
  const [pendingInactiveModalType, setPendingInactiveModalType] = useState('normal')
  const [currentEcode, setCurrentEcode] = useState('')
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null)

  const handleViewClick = (id) => {
    const stateForEdit = { furtherParts: actionsMap?.view?.furtherParts || [] }
    sessionStorage.setItem('viewPageState', JSON.stringify(stateForEdit))
    window.location.href = `/employee/update/view/${id}`
  }

  const handleEditClick = (id) => {
    const stateForEdit = { furtherParts: actionsMap?.edit?.furtherParts || [] }
    sessionStorage.setItem('editPageState', JSON.stringify(stateForEdit))
    window.location.href = `/employee/update/${id}`
  }

  const openChecklistThenInactiveModal = useCallback(
    (empEcode, empId) => {
      setPendingInactiveModalType(activeTab === 'abscond' ? 'abscond' : 'normal')
      setCurrentEcode(empEcode || '')
      setCurrentEmployeeId(empId ?? null)
      setInactiveChecklistOpen(true)
    },
    [activeTab],
  )

  const handleChecklistSubmit = async () => {
    try {
      setInactiveChecklistLoading(true)
      setInactiveChecklistOpen(false)

      if (pendingInactiveModalType === 'abscond') {
        setModalVisibleAbscond(true)
      } else {
        setModalVisible(true)
      }
    } catch (err) {
      message.error('Something went wrong')
    } finally {
      setInactiveChecklistLoading(false)
    }
  }

  const norm = (v) => (v == null ? '' : String(v).trim())
  const keyOf = (v) => norm(v).toLowerCase()
  const getSt = (r) => (r?.stCode).toString().trim().toUpperCase()

  const HUB_DC_CODES = useMemo(
    () =>
      new Set([
        'DH24',
        'DW01',
        'DB03',
        'DB05',
        'DD04',
        'DJ02',
        'DK02',
        'DM01',
        'DN01',
        'DN02',
        'DO01',
        'DO02',
        'DP01',
        'DR01',
        'DU05',
        'DU06',
        'DU07',
        'DW02',
        'DX01',
      ]),
    [],
  )

  const isHubDcRow = useCallback((r) => HUB_DC_CODES.has(getSt(r)), [HUB_DC_CODES])

  const toBool = (v) => {
    const s = String(v).trim().toLowerCase()
    return v === true || v === 1 || s === 'true' || s === '1' || s === 'yes'
  }
  const getLocStatus = (r) => toBool(r?.locStatus ?? r?.locationStatus ?? r?.isLocationActive)

  const isRH01 = (row) => getSt(row) === 'RH01'

  const isAbscondedRow = (r) => {
    const name = String(r?.resignationTypeName || '').toLowerCase()
    return r?.abscondingReasonId != null || name.includes('abscond')
  }

  const tabRows = useMemo(() => {
    const rows = employeesListData || []

    if (activeTab === 'hubdc') {
      return rows.filter((r) => r?.isActive === true).filter(isHubDcRow)
    }

    if (activeTab === 'inactive') {
      return rows.filter((r) => !toBool(r?.isActive))
    }

    if (activeTab === 'abscond') {
      return rows.filter(isAbscondedRow)
    }

    if (activeTab === 'naps') {
      return rows.filter((r) => r?.isActive === true).filter(isNapsRow)
    }

    const nonHubDcRows = rows.filter((r) => !isHubDcRow(r))

    if (activeTab === 'ho') {
      return nonHubDcRows.filter((r) => r?.isActive === true).filter(isRH01)
    }

    if (activeTab === 'upc') {
      return nonHubDcRows
        .filter((r) => r?.isActive === true)
        .filter((r) => getSt(r) !== 'RH01' && getLocStatus(r) === false)
    }

    return nonHubDcRows
      .filter((r) => r?.isActive === true)
      .filter((r) => getSt(r) !== 'RH01' && getLocStatus(r) === true)
  }, [employeesListData, activeTab, isHubDcRow, isNapsRow])

  const applyColumnFilters = useCallback(
    (rows, excludeKey = null) => {
      const zSel = new Set(zoneFilterValues.map(keyOf))
      const rSel = new Set(regionFilterValues.map(keyOf))
      const cSel = new Set(clusterFilterValues.map(keyOf))
      const sSel = new Set(storeCodeFilterValues.map(keyOf))
      const lSel = new Set(locationNameFilterValues.map(keyOf))
      const deptSel = new Set(deptFilterValues.map(keyOf))
      const desgSel = new Set(desgFilterValues.map(keyOf))

      return (rows || []).filter((row) => {
        if (excludeKey !== 'zoneName' && zSel.size && !zSel.has(keyOf(row.zoneName))) return false
        if (excludeKey !== 'regionName' && rSel.size && !rSel.has(keyOf(row.regionName)))
          return false
        if (excludeKey !== 'clusterName' && cSel.size && !cSel.has(keyOf(row.clusterName)))
          return false

        const code = row.storeCode ?? row.stCode
        if (excludeKey !== 'storeCode' && sSel.size && !sSel.has(keyOf(code))) return false

        if (excludeKey !== 'locationName' && lSel.size && !lSel.has(keyOf(row.locationName)))
          return false

        if (
          excludeKey !== 'departmentName' &&
          deptSel.size &&
          !deptSel.has(keyOf(row.departmentName))
        )
          return false

        if (
          excludeKey !== 'designationName' &&
          desgSel.size &&
          !desgSel.has(keyOf(row.designationName))
        )
          return false

        return true
      })
    },
    [
      zoneFilterValues,
      regionFilterValues,
      clusterFilterValues,
      storeCodeFilterValues,
      locationNameFilterValues,
      deptFilterValues,
      desgFilterValues,
    ],
  )

  const applyTextFilters = useCallback(
    (rows) => {
      const activeKeys = Object.keys(textFilters).filter(
        (k) => (textFilters[k] ?? '').toString().trim() !== '',
      )
      if (!activeKeys.length) return rows
      return (rows || []).filter((row) =>
        activeKeys.every((k) =>
          (row?.[k] ?? '')
            .toString()
            .toLowerCase()
            .includes(textFilters[k].toString().toLowerCase()),
        ),
      )
    },
    [textFilters],
  )

  const cascadedData = useMemo(() => applyColumnFilters(tabRows), [tabRows, applyColumnFilters])
  const displayData = useMemo(
    () => applyTextFilters(cascadedData),
    [cascadedData, applyTextFilters],
  )

  const zoneOptions = useMemo(() => {
    return Array.from(
      new Set(
        applyColumnFilters(tabRows, 'zoneName')
          .map((r) => norm(r.zoneName))
          .filter(Boolean),
      ),
    ).sort()
  }, [tabRows, applyColumnFilters])

  const regionOptions = useMemo(() => {
    return Array.from(
      new Set(
        applyColumnFilters(tabRows, 'regionName')
          .map((r) => norm(r.regionName))
          .filter(Boolean),
      ),
    ).sort()
  }, [tabRows, applyColumnFilters])

  const clusterOptions = useMemo(() => {
    return Array.from(
      new Set(
        applyColumnFilters(tabRows, 'clusterName')
          .map((r) => norm(r.clusterName))
          .filter(Boolean),
      ),
    ).sort()
  }, [tabRows, applyColumnFilters])

  const storeCodeOptions = useMemo(() => {
    return Array.from(
      new Set(
        applyColumnFilters(tabRows, 'storeCode')
          .map((r) => norm(r.storeCode ?? r.stCode))
          .filter(Boolean),
      ),
    ).sort()
  }, [tabRows, applyColumnFilters])

  const locationOptions = useMemo(() => {
    return Array.from(
      new Set(
        applyColumnFilters(tabRows, 'locationName')
          .map((r) => norm(r.locationName))
          .filter(Boolean),
      ),
    ).sort()
  }, [tabRows, applyColumnFilters])

  const deptOptions = useMemo(() => {
    return Array.from(
      new Set(
        applyColumnFilters(tabRows, 'departmentName')
          .map((r) => norm(r.departmentName))
          .filter(Boolean),
      ),
    ).sort()
  }, [tabRows, applyColumnFilters])

  const desgOptions = useMemo(() => {
    return Array.from(
      new Set(
        applyColumnFilters(tabRows, 'designationName')
          .map((r) => norm(r.designationName))
          .filter(Boolean),
      ),
    ).sort()
  }, [tabRows, applyColumnFilters])

  const toBoolActive = (v) => {
    const s = String(v).trim().toLowerCase()
    return v === true || v === 1 || s === 'true' || s === '1' || s === 'yes' || s === 'active'
  }
  const toBoolInactive = (v) => {
    const s = String(v).trim().toLowerCase()
    return v === false || v === 0 || s === 'false' || s === '0' || s === 'no' || s === 'inactive'
  }

  const locKeyOf = (r) => {
    const parts = [r?.stCode, r?.storeCode, r?.locationCode, r?.locationName, r?.locationId].map(
      (v) => (v == null ? '' : String(v).trim().toLowerCase()),
    )
    const [st, store, locCode, locName, locId] = parts
    return st || store || locCode || (locId ? `id:${locId}` : locName)
  }

  const parseDateOnly = (val) => {
    if (!val) return null
    const s = String(val).trim()
    const d = new Date(s.includes('T') ? s.split('T')[0] : s)
    return Number.isNaN(d.getTime()) ? null : d
  }

  const isSameYearMonth = (d, y, m) => d && d.getFullYear() === y && d.getMonth() === m

  const buildCardsFromRows = (rows = []) => {
    const uniqLocs = new Set()
    let active = 0
    let inactive = 0
    let absconded = 0
    let cmj = 0
    let cml = 0

    const now = new Date()
    const curY = now.getFullYear()
    const curM = now.getMonth()

    for (const r of rows) {
      const locKey = locKeyOf(r)
      uniqLocs.add(locKey)

      if (toBoolActive(r?.isActive)) active++
      else if (toBoolInactive(r?.isActive)) inactive++

      if (isAbscondedRow(r)) absconded++

      const doj = parseDateOnly(r?.dateOfJoining)
      const dol = parseDateOnly(r?.dateOfLeft)
      if (isSameYearMonth(doj, curY, curM)) cmj++
      if (isSameYearMonth(dol, curY, curM)) cml++
    }

    const locCount = uniqLocs.has('') ? uniqLocs.size - 1 : uniqLocs.size

    return [
      { label: 'Locs', value: locCount },
      { label: 'Active', value: active },
      { label: 'Left', value: inactive },
      { label: 'Absconded', value: absconded },
      { label: 'Total', value: rows.length },
      { label: 'Current Month Joining', value: cmj },
      { label: 'Current Month Left', value: cml },
    ]
  }

  useEffect(() => {
    if (role === 'NapsHR') {
      setActiveTab('naps')
    }
  }, [role])

  const subCardData = useMemo(() => {
    return buildCardsFromRows(displayData)
  }, [displayData])

  const fetchData = async () => {
    if (!ecode) return

    dispatch(set({ loading: true }))
    const requestId = ++latestRequestIdRef.current
    try {
      const response = await getEmployeeList({ currentPage, pageSize, search })
      if (requestId !== latestRequestIdRef.current) return

      if (response) {
        const records = response?.employees ?? []

        const response1 = await filterBgtSeatMaster({ eCode: ecode })
        const allowedList = response1?.data?.data?.allowedStores ?? []
        const deptExceptions = response1?.data?.data?.deptExceptions ?? []
        const desigExceptions = response1?.data?.data?.desigExceptions ?? []

        const allowedCodes = new Set(allowedList.map((a) => norm(a.stCode)))
        const level1Filtered = records.filter((item) => allowedCodes.has(norm(item?.stCode)))

        const blockedDeptSet = new Set(
          deptExceptions.map((b) => `${norm(b.stCode)}-${norm(b.deptId)}`),
        )
        const level2Filtered = level1Filtered.filter((item) => {
          const key = `${norm(item.stCode)}-${norm(item.departmentId)}`
          return !blockedDeptSet.has(key)
        })

        const blockedDesigSet = new Set(
          desigExceptions.map((b) => `${norm(b.stCode)}-${norm(b.deptId)}-${norm(b.desigId)}`),
        )
        const finalFiltered =
          level2Filtered.filter((item) => {
            const key = `${norm(item.stCode)}-${norm(item.departmentId)}-${norm(
              item.designationId,
            )}`
            return !blockedDesigSet.has(key)
          }) || []

        const isResponse1Length0 =
          allowedList?.length === 0 && deptExceptions?.length === 0 && desigExceptions?.length === 0

        if (isResponse1Length0 === false) {
          setEmployeesListData(finalFiltered)
          setTotalCount(finalFiltered?.length || 0)
        } else {
          const getCode = (item) => (item?.stCode ?? item?.storeCode ?? '').trim().toLowerCase()
          const storeCodeNorm = (storeCode ?? '').trim().toLowerCase()
          const storeFilterData = records.filter((item) => getCode(item) === storeCodeNorm)

          if (Array.isArray(locationList) && locationList.length > 0) {
            const allowedLocCodes = new Set(
              locationList.map((it) => it?.stCode?.trim()?.toLowerCase()).filter(Boolean),
            )
            const filteredEmployees = records.filter((item) => allowedLocCodes.has(getCode(item)))
            setEmployeesListData(filteredEmployees)
            setTotalCount(filteredEmployees?.length || 0)
          } else {
            if (role === 'StoreHR') {
              setEmployeesListData(storeFilterData)
              setTotalCount(storeFilterData?.length || 0)
            } else {
              setEmployeesListData(records)
              setTotalCount(response?.totalCount ?? records?.length ?? 0)
            }
          }
        }
      }

      const absList = await getAbscondingReasonList()
      const blackList = await getBlacklistReasonList()
      if (requestId !== latestRequestIdRef.current) return
      setabscondingList(absList)
      setblackList(blackList)
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message)
      message.error(error?.response?.data?.message || 'Error fetching data')
    } finally {
      if (requestId === latestRequestIdRef.current) {
        dispatch(set({ loading: false }))
      }
    }
  }

  const fetchInactiveData = async () => {
    if (!ecode) return

    dispatch(set({ loading: true }))
    const requestId = ++latestRequestIdRef.current
    try {
      const response = await getEmployeeListOld({ currentPage, pageSize, search, mode: 'inactive' })
      if (requestId !== latestRequestIdRef.current) return

      const records = Array.isArray(response?.employees) ? response.employees : response || []
      setEmployeesListData(records)
      setTotalCount(
        typeof response?.totalCount === 'number' ? response.totalCount : records.length || 0,
      )
    } catch (error) {
      console.error('Error fetching inactive data:', error?.response?.data || error?.message)
      message.error(error?.response?.data?.message || 'Error fetching inactive employees')
    } finally {
      if (requestId === latestRequestIdRef.current) {
        dispatch(set({ loading: false }))
      }
    }
  }

  const fetchAbscondedData = async () => {
    if (!ecode) return

    dispatch(set({ loading: true }))
    const requestId = ++latestRequestIdRef.current
    try {
      const absList = await getAbscondingReasonList()
      if (requestId !== latestRequestIdRef.current) return
      setabscondingList(absList)
    } catch (error) {
      console.error('Error fetching absconded data:', error.response?.data || error.message)
      message.error(error?.response?.data?.message || 'Error fetching absconded employees')
    } finally {
      if (requestId === latestRequestIdRef.current) {
        dispatch(set({ loading: false }))
      }
    }
  }

  useEffect(() => {
    if (activeTab === 'inactive') {
      const t = setTimeout(() => fetchInactiveData(), 400)
      return () => clearTimeout(t)
    } else if (activeTab === 'abscond') {
      const t = setTimeout(() => fetchAbscondedData(), 400)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => fetchData(), 400)
      return () => clearTimeout(t)
    }
  }, [search, activeTab])

  const prevTabRef = useRef(activeTab)
  useEffect(() => {
    if (prevTabRef.current === 'inactive' && activeTab !== 'inactive') {
      fetchData()
    }
    prevTabRef.current = activeTab
  }, [activeTab])

  useEffect(() => {
    setCurrentPage(1)
  }, [
    activeTab,
    zoneFilterValues,
    regionFilterValues,
    clusterFilterValues,
    storeCodeFilterValues,
    locationNameFilterValues,
    textFilters,
    search,
  ])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(displayData.length / pageSize))
    if (currentPage > maxPage) setCurrentPage(1)
  }, [displayData.length, pageSize])

  useEffect(() => {
    if (!Array.isArray(filteredSideMenu) || filteredSideMenu.length === 0) return
    const data = filteredSideMenu
      .flatMap((group) => group.items || [])
      .filter((item) => item?.to === pathname)

    const perItemActions = data.map((item) => ({
      itemName: item?.name || null,
      to: item?.to || null,
      actions: (item?.actions || []).map((a) => ({
        actionName: a?.actionName || '',
        actionStatus: !!a?.actionStatus,
      })),
    }))

    const flatActions = perItemActions.flatMap((p) => p.actions)
    const dedupMap = new Map()
    for (const act of flatActions) {
      const key = (act.actionName || '').trim().toLowerCase()
      if (!key) continue
      if (!dedupMap.has(key)) {
        dedupMap.set(key, { actionName: act.actionName, actionStatus: act.actionStatus })
      } else {
        const ex = dedupMap.get(key)
        ex.actionStatus = ex.actionStatus || act.actionStatus
      }
    }

    const normKey = (s = '') => (s + '').trim().toLowerCase()
    const actionsDetailTemp = new Map()
    for (const item of data) {
      for (const a of item?.actions || []) {
        const key = normKey(a?.actionName || String(a?.actionIds?.[0] || ''))
        if (!key) continue
        if (!actionsDetailTemp.has(key)) {
          actionsDetailTemp.set(key, {
            actionName: a.actionName || '',
            actionIds: new Set(a.actionIds || []),
            actionStatus: !!a.actionStatus,
            furtherPartsMap: new Map(),
          })
          for (const fp of a.furtherParts || []) {
            const fpId = fp?.actionFurtherPartId ?? null
            const fpName = fp?.actionFurtherPartName ?? (typeof fp === 'string' ? fp : null)
            const fpKey =
              fpId !== null
                ? String(fpId)
                : fpName
                  ? String(fpName).trim().toLowerCase()
                  : JSON.stringify(fp)
            actionsDetailTemp.get(key).furtherPartsMap.set(fpKey, fp)
          }
        } else {
          const ex = actionsDetailTemp.get(key)
          for (const id of a.actionIds || []) ex.actionIds.add(id)
          ex.actionStatus = ex.actionStatus || !!a.actionStatus
          for (const fp of a.furtherParts || []) {
            const fpId = fp?.actionFurtherPartId ?? null
            const fpName = fp?.actionFurtherPartName ?? (typeof fp === 'string' ? fp : null)
            const fpKey =
              fpId !== null
                ? String(fpId)
                : fpName
                  ? String(fpName).trim().toLowerCase()
                  : JSON.stringify(fp)
            if (!ex.furtherPartsMap.has(fpKey)) ex.furtherPartsMap.set(fpKey, fp)
          }
        }
      }
    }

    const actionsDetailMap = {}
    for (const [k, v] of actionsDetailTemp) {
      actionsDetailMap[k] = {
        actionName: v.actionName,
        actionIds: Array.from(v.actionIds),
        actionStatus: !!v.actionStatus,
        furtherParts: Array.from(v.furtherPartsMap.values()),
      }
    }
    setActionsMap(actionsDetailMap)
  }, [filteredSideMenu, pathname])

  const handleTableChange = (page, newPageSize) => {
    setCurrentPage(page)
    setPageSize(newPageSize)
  }

  const handleToggle = async (
    id,
    leavingDate,
    remarks,
    status,
    attachments = [],
    reasonid,
    abscondingReasonId,
    blackListReasonId,
  ) => {
    const newFormData = new FormData()
    newFormData.append('id', id)
    newFormData.append('isactive', status === 'true')
    newFormData.append('remarks', remarks ?? '')
    newFormData.append('lastUpdatedBy', ecode)
    newFormData.append('leavingDate', '2025-01-01')

    const isActivatingInAbscond = activeTab === 'abscond' && status === 'true'

    if (!isActivatingInAbscond) {
      if (status !== 'true') {
        if (leavingDate) newFormData.append('leavingDate', leavingDate)
        if (reasonid) newFormData.append('reasonid', reasonid)

        if (abscondingReasonId) {
          newFormData.append('abscondingReasonId', abscondingReasonId)
          newFormData.append('resignationTypeId', 10)
        }

        if (blackListReasonId) {
          newFormData.append('blackListReasonId', blackListReasonId)
          newFormData.append('resignationTypeId', 10)
        }
      }
    }

    const safeAttachments = Array.isArray(attachments) ? attachments : []
    if (safeAttachments.length > 0) {
      safeAttachments.forEach((att) => newFormData.append('inactiveattachment', att?.originFileObj))
    }

    try {
      await markEmployeeActiveStatus(newFormData)
      await fetchData()
      setSearch('')
      message.success('Employee Status Updated')
    } catch (error) {
      console.error('Employee Status Update Failed', error)
      message.error('Employee Status Update Failed')
      throw error
    }
  }

  const refreshPage = async (ecode) => {
    try {
      dispatch(set({ loading: true }))
      const res = await axiosInstance.get(`/api/EmployeeNew/RefreshEmpDetails?eCode=${ecode}`)
      if (res.status === 200) message.success(res.data?.message || 'Executed Successfully')
    } catch (error) {
      console.error('error refreshing data: ', error)
    } finally {
      dispatch(set({ loading: false }))
    }
  }

  const resetPassword = async (record) => {
    const { ecode } = record
    const payload = { ecode }

    try {
      const response = await resetEmployeePsd(payload)

      if (response.status === 200) {
        message.success(response.data?.message || 'Password resetted successfully!')
      }
    } catch (error) {
      console.error('error:', error)
      message.error(error?.response?.data?.message || 'Error resetting password!')
    }
  }

  const cancel = (e) => {
    console.log(e)
  }
  const columns = useMemo(() => {
    return [
      {
        title: 'Zone',
        dataIndex: 'zoneName',
        key: 'zoneName',
        width: 100,
        ellipsis: true,
        filteredValue: zoneFilterValues.length ? zoneFilterValues : null,
        filterDropdown: ({ confirm }) => (
          <FilterDropdown
            title={'Zone'}
            dataIndex={'zoneName'}
            dataList={zoneOptions}
            filterValues={zoneFilterValues}
            setFilterValues={setZoneFilterValues}
            confirm={confirm}
          />
        ),
      },
      {
        title: 'Region',
        dataIndex: 'regionName',
        key: 'regionName',
        ellipsis: true,
        width: 100,
        filteredValue: regionFilterValues.length ? regionFilterValues : null,
        filterDropdown: ({ confirm }) => (
          <FilterDropdown
            title={'Region'}
            dataIndex={'regionName'}
            dataList={regionOptions}
            filterValues={regionFilterValues}
            setFilterValues={setRegionFilterValues}
            confirm={confirm}
          />
        ),
      },
      {
        title: 'Cluster',
        dataIndex: 'clusterName',
        key: 'clusterName',
        ellipsis: true,
        width: 100,
        filteredValue: clusterFilterValues.length ? clusterFilterValues : null,
        filterDropdown: ({ confirm }) => (
          <FilterDropdown
            title={'Cluster'}
            dataIndex={'clusterName'}
            dataList={clusterOptions}
            filterValues={setClusterFilterValues ? clusterFilterValues : []}
            setFilterValues={setClusterFilterValues}
            confirm={confirm}
          />
        ),
      },
      {
        title: 'St Code',
        dataIndex: 'stCode',
        key: 'stCode',
        width: 100,
        ellipsis: true,
        filteredValue: storeCodeFilterValues.length ? storeCodeFilterValues : null,
        filterDropdown: ({ confirm }) => (
          <FilterDropdown
            title="St Code"
            dataIndex="stCode"
            dataList={storeCodeOptions}
            filterValues={storeCodeFilterValues}
            setFilterValues={setStoreCodeFilterValues}
            confirm={confirm}
          />
        ),
      },
      {
        title: 'St Loc',
        dataIndex: 'locationName',
        key: 'locationName',
        width: 120,
        ellipsis: true,
        filteredValue: locationNameFilterValues.length ? locationNameFilterValues : null,
        filterDropdown: ({ confirm }) => (
          <FilterDropdown
            title="St Loc"
            dataIndex="locationName"
            dataList={locationOptions}
            filterValues={setLocationNameFilterValues ? locationNameFilterValues : []}
            setFilterValues={setLocationNameFilterValues}
            confirm={confirm}
          />
        ),
      },
      {
        title: 'Loc Emp Code',
        dataIndex: 'locBasedECode',
        key: 'locBasedECode',
        width: 160,
        ellipsis: true,
        ...getColumnSearchProps('locBasedECode', 'Loc Emp Code'),
      },
      {
        title: 'Emp Code',
        dataIndex: 'ecode',
        key: 'ecode',
        width: 120,
        ellipsis: true,
        ...getColumnSearchProps('ecode', 'Emp Code'),
      },
      {
        title: 'Emp Name',
        dataIndex: 'fullName',
        key: 'fullName',
        width: 130,
        ellipsis: true,
        ...getColumnSearchProps('fullName', 'Emp Name'),
      },
      {
        title: 'Gender',
        dataIndex: 'gender',
        key: 'gender',
        width: 90,
        ellipsis: true,
      },
      {
        title: 'D.O.B.',
        dataIndex: 'dob',
        key: 'dob',
        width: 110,
        ellipsis: true,
        render: (date) => (date === null ? null : String(date).trim().split('T')[0]),
      },
      {
        title: 'Age',
        dataIndex: 'ageInYears',
        key: 'ageInYears',
        width: 80,
        ellipsis: true,
      },
      {
        title: 'Department',
        dataIndex: 'departmentName',
        key: 'departmentName',
        width: 140,
        ellipsis: true,
        filteredValue: deptFilterValues.length ? deptFilterValues : null,
        filterDropdown: ({ confirm }) => (
          <FilterDropdown
            title={'Department'}
            dataIndex={'departmentName'}
            dataList={deptOptions}
            filterValues={deptFilterValues}
            setFilterValues={setDeptFilterValues}
            confirm={confirm}
          />
        ),
      },
      {
        title: 'Current Desg',
        dataIndex: 'designationName',
        key: 'designationName',
        width: 150,
        ellipsis: true,
        filteredValue: desgFilterValues.length ? desgFilterValues : null,
        filterDropdown: ({ confirm }) => (
          <FilterDropdown
            title={'Designation'}
            dataIndex={'designationName'}
            dataList={desgOptions}
            filterValues={desgFilterValues}
            setFilterValues={setDesgFilterValues}
            confirm={confirm}
          />
        ),
      },
      {
        title: 'D.O.J.',
        dataIndex: 'dateOfJoining',
        key: 'dateOfJoining',
        width: 110,
        ellipsis: true,
        render: (date) => (date === null ? null : String(date).trim().split('T')[0]),
        ...getColumnSearchProps('dateOfJoining', 'D.O.J.'),
      },
      {
        title: 'Emp Status',
        dataIndex: 'isActive',
        key: 'isActive',
        width: 100,
        ellipsis: true,
        render: (value, record) =>
          String(record?.resignationTypeName).trim() !== ''
            ? record?.resignationTypeName
            : record?.isActive
              ? 'Active'
              : 'Left',
      },
      {
        title: 'D.O.L.',
        dataIndex: 'dateOfLeft',
        key: 'dateOfLeft',
        width: 110,
        ellipsis: true,
        render: (date) => (date === null ? null : String(date).trim().split('T')[0]),
        ...getColumnSearchProps('dateOfLeft', 'D.O.L.'),
      },
      {
        title: 'Abscond Reason',
        dataIndex: 'abscondingReasonName',
        key: 'abscondingReasonName',
        width: 150,
        ellipsis: true,
        render: (text) => text || '-',
        filteredValue: textFilters.abscondingReasonName ? [textFilters.abscondingReasonName] : null,
        ...getColumnSearchProps('abscondingReasonName', 'Abscond Reason'),
      },
      {
        title: 'Created By',
        key: 'createdBy',
        dataIndex: 'createdBy',
        width: 125,
        ellipsis: true,
      },
      {
        title: 'Created On',
        key: 'createdOn',
        dataIndex: 'createdOn',
        width: 150,
        ellipsis: true,
        render: (datetime) => {
          const date = String(datetime).split('T')[0]
          const time = String(datetime).split('T')[1]
          return `${date} - ${time}`
        },
      },
      {
        title: 'Updated By',
        key: 'updatedBy',
        dataIndex: 'updatedBy',
        width: 125,
        ellipsis: true,
      },
      {
        title: 'Updated On',
        key: 'updatedOn',
        dataIndex: 'updatedOn',
        width: 150,
        ellipsis: true,
        render: (datetime) => {
          const date = String(datetime).split('T')[0]
          const time = String(datetime).split('T')[1]
          return `${date} - ${time}`
        },
      },
      {
        title: 'Action',
        fixed: 'right',
        key: 'id',
        width: 200,
        render: (_, record, index) => (
          <Space size="middle">
            {actionsMap?.resetpassword?.actionStatus && (
              <Popconfirm
                title="Password reset"
                description="Are you sure want to reset password?"
                onConfirm={() => resetPassword(record)}
                onCancel={cancel}
                okText="Yes"
                cancelText="No"
              >
                <UnlockOutlined style={{ fontSize: 18 }} />
              </Popconfirm>
            )}

            {actionsMap?.refresh?.actionStatus && (
              <Link>
                <Tooltip placement="top" title={'Refresh'}>
                  <IoIosRefresh
                    style={{ fontSize: 18 }}
                    onClick={() => refreshPage(record?.ecode)}
                  />
                </Tooltip>
              </Link>
            )}

            {actionsMap?.view?.actionStatus && (
              <Tooltip placement="top" title={'View'}>
                <EyeOutlined
                  style={{ fontSize: 18 }}
                  onClick={() => handleViewClick(record?.employeeId)}
                />
              </Tooltip>
            )}

            {actionsMap?.edit?.actionStatus && (
              <Tooltip placement="top" title={'Edit'}>
                <EditOutlined
                  style={{ fontSize: 18 }}
                  onClick={() => handleEditClick(record?.employeeId)}
                />
              </Tooltip>
            )}

            {actionsMap?.active?.actionStatus && record?.isActive && (
              <Switch
                checked={record.isActive}
                onChange={(checked) => {
                  const data = {
                    id: record.employeeId,
                    checked: record.isActive,
                    index,
                    name: record.fullName,
                    dateOfJoining: record?.dateOfJoining,
                    ecode: record?.ecode || '',
                  }
                  setselectedEmployeeName(data)

                  if (activeTab === 'abscond') {
                    if (!checked) {
                      openChecklistThenInactiveModal(record?.ecode, record?.employeeId)
                    } else {
                      setModalVisibleAbscond(true)
                    }
                    return
                  }

                  if (!checked) {
                    openChecklistThenInactiveModal(record?.ecode, record?.employeeId)
                  } else {
                    setIsEmployeeInactiveModalOpen(true)
                    setSelectedEmpId(record?.employeeId)
                    setSelectedEmpName(record?.fullName || '')
                  }
                }}
                size="small"
              />
            )}

            {actionsMap?.inactive?.actionStatus && !record?.isActive && (
              <Switch
                checked={record.isActive}
                onChange={(checked) => {
                  const data = {
                    id: record.employeeId,
                    checked: record.isActive,
                    index,
                    name: record.fullName,
                    dateOfJoining: record?.dateOfJoining,
                    ecode: record?.ecode || '',
                  }
                  setselectedEmployeeName(data)

                  if (activeTab === 'abscond') {
                    if (!checked) {
                      openChecklistThenInactiveModal(record?.ecode, record?.employeeId)
                    } else {
                      setModalVisibleAbscond(true)
                    }
                    return
                  }

                  if (!checked) {
                    openChecklistThenInactiveModal(record?.ecode, record?.employeeId)
                  } else {
                    setIsEmployeeInactiveModalOpen(true)
                    setSelectedEmpId(record?.employeeId)
                    setSelectedEmpName(record?.fullName || '')
                  }
                }}
                size="small"
              />
            )}
          </Space>
        ),
      },
    ]
  }, [
    zoneFilterValues,
    regionFilterValues,
    clusterFilterValues,
    storeCodeFilterValues,
    locationNameFilterValues,
    deptFilterValues,
    desgFilterValues,
    textFilters,
    actionsMap,
    activeTab,
    zoneOptions,
    regionOptions,
    clusterOptions,
    storeCodeOptions,
    locationOptions,
    deptOptions,
    desgOptions,
    openChecklistThenInactiveModal,
  ])

  const tableColumns = useMemo(() => {
    if (activeTab !== 'inactive') return columns

    const keep = new Set([
      'stCode',
      'locationName',
      'locBasedECode',
      'ecode',
      'fullName',
      'departmentName',
      'designationName',
      'dateOfJoining',
      'createdBy',
      'createdOn',
      'updatedBy',
      'updatedOn',
    ])

    return columns.filter((col) => col.key === 'id' || keep.has(col.dataIndex))
  }, [columns, activeTab])

  const totalWidth = useMemo(
    () => tableColumns.reduce((sum, col) => sum + (col.width || 150), 0),
    [tableColumns],
  )

  const handleSearchChange = (e) => setSearch(e.target.value)

  const handleClearFilters = () => {
    setZoneFilterValues([])
    setRegionFilterValues([])
    setClusterFilterValues([])
    setStoreCodeFilterValues([])
    setLocationNameFilterValues([])
    setDeptFilterValues([])
    setDesgFilterValues([])
    setTextFilters({})
    setSearch('')
    setCurrentPage(1)
  }

  const exportableColumns = useMemo(
    () =>
      (columns || [])
        .filter((c) => !!c.dataIndex)
        .map((c) => ({
          title: c.title,
          dataIndex: c.dataIndex,
        })),
    [columns],
  )

  const getCellValue = (row, colKey) => {
    const v = row?.[colKey]
    if (v == null) return ''
    if (
      colKey === 'createdOn' ||
      colKey === 'updatedOn' ||
      colKey === 'dob' ||
      colKey === 'dateOfJoining' ||
      colKey === 'dateOfLeft'
    ) {
      return String(v).includes('T') ? String(v).split('T')[0] : String(v)
    }
    if (colKey === 'isActive') {
      return v === true ? 'Active' : 'Left'
    }
    return String(v)
  }

  const csvEscape = (val) => {
    const s = String(val ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }

  const rowsToCommaSeparatedValues = (rows, cols) => {
    const header = cols.map((c) => csvEscape(c.title)).join(',')
    const body = rows
      .map((r) => cols.map((c) => csvEscape(getCellValue(r, c.dataIndex))).join(','))
      .join('\n')
    return `${header}\n${body}`
  }

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  const handleDownloadFiltered = () => {
    const filteredRows = displayData || []
    if (!filteredRows.length) {
      message.info('No rows to export for the current view.')
      return
    }

    const csv = rowsToCommaSeparatedValues(filteredRows, exportableColumns)

    const tabNameMap = {
      ho: 'HO',
      stores: 'Stores',
      upc: 'UPC',
      hubdc: 'HUBDC',
      naps: 'NAPS',
      abscond: 'Absconded',
    }
    const tabName = tabNameMap[activeTab] || 'All'

    const ts = new Date().toISOString().replace(/[:]/g, '-')
    const filename = `Employees_${tabName}_${ts}.csv`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    downloadBlob(blob, filename)
  }

  if (!ecode) {
    return (
      <>
        <Pageheading title="Employees Master" />
        <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
          <Spin />
        </div>
      </>
    )
  }

  return (
    <>
      <Pageheading title="Employees Master" />

      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key)
          setZoneFilterValues([])
          setRegionFilterValues([])
          setClusterFilterValues([])
          setStoreCodeFilterValues([])
          setLocationNameFilterValues([])
          setTextFilters({})
        }}
        items={
          role === 'NapsHR'
            ? [{ key: 'naps', label: 'NAPS' }]
            : [
                { key: 'ho', label: 'HO' },
                { key: 'stores', label: 'Active Stores' },
                { key: 'upc', label: 'UPC Stores' },
                { key: 'hubdc', label: 'HUB/DC' },
                { key: 'naps', label: 'NAPS' },
                { key: 'inactive', label: 'Inactive' },
                { key: 'abscond', label: 'Abscond' },
              ]
        }
        style={{ marginBottom: 8 }}
        tabBarExtraContent={
          <Button onClick={handleDownloadFiltered} icon={<ExportOutlined />}>
            Download (Filtered)
          </Button>
        }
      />

      {activeTab !== 'inactive' && activeTab !== 'abscond' && <CardInRow data={subCardData} />}

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      <EmployeeInactiveModal
        isModalOpen={isEmployeeInactiveModalOpen}
        setIsModalOpen={setIsEmployeeInactiveModalOpen}
        empID={selectedEmpId}
        empName={selectedEmpName}
        fetchData={fetchData}
      />

      <InactiveChecklistModal
        open={inactiveChecklistOpen}
        onClose={() => setInactiveChecklistOpen(false)}
        onSubmit={handleChecklistSubmit}
        loading={inactiveChecklistLoading}
        ecode={currentEcode}
        employeeId={currentEmployeeId}
      />

      <div className="def" style={{ paddingBottom: 10 }}>
        <TableBulkActionIcons
          totalRecords={displayData.length}
          selectedRowKeys={selectedRowKeys}
          handleSearch={handleSearchChange}
          lodingLocal={lodingLocal}
          setlodingLocal={setlodingLocal}
          refreshData={fetchData}
          empData={empData}
          search={search}
          cardsData={subCardData}
          actionsMap={actionsMap}
          ecode={ecode}
          handleClearFilters={handleClearFilters}
        />

        {!isMobile ? (
          <Table
            rowKey="employeeId"
            columns={tableColumns}
            dataSource={displayData}
            bordered
            scroll={{ x: totalWidth, y: 'calc(100vh - 160px)' }}
            style={{ whiteSpace: 'nowrap' }}
            className={theme === 'dark' ? 'dark-theme' : ''}
            pagination={{
              current: currentPage,
              position: ['bottomRight'],
              total: displayData.length,
              pageSize,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50, 100],
              onChange: handleTableChange,
            }}
          />
        ) : (
          <div>
            <div
              style={{
                backgroundColor: '#fafafa',
                borderRadius: '8px 8px 0 0',
                border: '1px solid #d9d9d9',
                borderBottom: '2px solid #1890ff',
                position: 'sticky',
                top: 0,
                zIndex: 100,
              }}
            >
              <table
                style={{
                  width: '100%',
                  tableLayout: 'fixed',
                  borderCollapse: 'collapse',
                  fontSize: 11,
                }}
              >
                <colgroup>
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      St Code
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Emp Code
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Name
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Gender
                    </th>
                    <th style={{ padding: '10px 4px', textAlign: 'center', fontWeight: 600 }}>
                      Action
                    </th>
                  </tr>
                </thead>
              </table>
            </div>

            {displayData
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((record) => {
                const isExpanded = expandedCards[record.employeeId]

                return (
                  <div
                    key={record.employeeId}
                    style={{
                      border: '1px solid #d9d9d9',
                      borderTop: 'none',
                      background: '#fff',
                    }}
                  >
                    <table
                      style={{
                        width: '100%',
                        tableLayout: 'fixed',
                        borderCollapse: 'collapse',
                        fontSize: 11,
                      }}
                    >
                      <colgroup>
                        <col style={{ width: '15%' }} />
                        <col style={{ width: '25%' }} />
                        <col style={{ width: '25%' }} />
                        <col style={{ width: '15%' }} />
                        <col style={{ width: '20%' }} />
                      </colgroup>
                      <tbody>
                        <tr>
                          <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                            {record.stCode || '-'}
                          </td>
                          <td
                            style={{
                              padding: '8px 4px',
                              textAlign: 'center',
                              color: '#1890ff',
                              fontWeight: 500,
                            }}
                          >
                            {record.ecode || '-'}
                          </td>
                          <td style={{ padding: '8px 4px', textAlign: 'center', fontSize: 10 }}>
                            {record.fullName || '-'}
                          </td>
                          <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                            {record.gender || '-'}
                          </td>
                          <td
                            style={{
                              padding: '8px 4px',
                              textAlign: 'center',
                              display: 'flex',
                              gap: 4,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            {actionsMap?.refresh?.actionStatus && (
                              <Tooltip title="Refresh">
                                <IoIosRefresh
                                  style={{ fontSize: 16 }}
                                  onClick={() => refreshPage(record?.ecode)}
                                />
                              </Tooltip>
                            )}
                            {actionsMap?.view?.actionStatus && (
                              <Link
                                to={`/employee/update/view/${record?.employeeId}`}
                                state={{ furtherParts: actionsMap?.view?.furtherParts || [] }}
                              >
                                <EyeOutlined style={{ fontSize: 14 }} />
                              </Link>
                            )}
                            {actionsMap?.edit?.actionStatus && (
                              <Link
                                to={`/employee/update/${record?.employeeId}`}
                                state={{ furtherParts: actionsMap?.edit?.furtherParts || [] }}
                              >
                                <EditOutlined style={{ fontSize: 14 }} />
                              </Link>
                            )}
                            <Button
                              type="text"
                              size="small"
                              icon={isExpanded ? <MinusOutlined /> : <PlusOutlined />}
                              onClick={() => handleToggleCard(record.employeeId)}
                              style={{ padding: '2px 4px', fontSize: 10 }}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {isExpanded && (
                      <div
                        style={{
                          padding: 8,
                          background: '#fafafa',
                          borderTop: '1px solid #e8e8e8',
                          fontSize: 10,
                        }}
                      >
                        <Row gutter={[4, 6]}>
                          <Col span={8}>
                            <div style={{ color: '#8c8c8c', marginBottom: 2, fontSize: 9 }}>
                              DOB
                            </div>
                            <div style={{ fontWeight: 500, fontSize: 9 }}>
                              {record.dob ? String(record.dob).split('T')[0] : '-'}
                            </div>
                          </Col>
                          <Col span={8}>
                            <div style={{ color: '#8c8c8c', marginBottom: 2, fontSize: 9 }}>
                              DOJ
                            </div>
                            <div style={{ fontWeight: 500, fontSize: 9 }}>
                              {record.dateOfJoining
                                ? String(record.dateOfJoining).split('T')[0]
                                : '-'}
                            </div>
                          </Col>
                          <Col span={8}>
                            <div style={{ color: '#8c8c8c', marginBottom: 2, fontSize: 9 }}>
                              Loc Code
                            </div>
                            <div style={{ fontWeight: 500, fontSize: 9 }}>
                              {record.locBasedECode || '-'}
                            </div>
                          </Col>

                          <Col span={8}>
                            <div style={{ color: '#8c8c8c', marginBottom: 2, fontSize: 9 }}>
                              Zone
                            </div>
                            <div
                              style={{
                                fontWeight: 500,
                                fontSize: 9,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {record.zoneName || '-'}
                            </div>
                          </Col>
                          <Col span={8}>
                            <div style={{ color: '#8c8c8c', marginBottom: 2, fontSize: 9 }}>
                              Region
                            </div>
                            <div
                              style={{
                                fontWeight: 500,
                                fontSize: 9,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {record.regionName || '-'}
                            </div>
                          </Col>
                          <Col span={8}>
                            <div style={{ color: '#8c8c8c', marginBottom: 2, fontSize: 9 }}>
                              Location
                            </div>
                            <div
                              style={{
                                fontWeight: 500,
                                fontSize: 9,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {record.locationName || '-'}
                            </div>
                          </Col>

                          <Col span={8}>
                            <div style={{ color: '#8c8c8c', marginBottom: 2, fontSize: 9 }}>
                              Dept
                            </div>
                            <div
                              style={{
                                fontWeight: 500,
                                fontSize: 9,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {record.departmentName || '-'}
                            </div>
                          </Col>
                          <Col span={8}>
                            <div style={{ color: '#8c8c8c', marginBottom: 2, fontSize: 9 }}>
                              Desig
                            </div>
                            <div
                              style={{
                                fontWeight: 500,
                                fontSize: 9,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {record.designationName || '-'}
                            </div>
                          </Col>

                          {actionsMap?.activeinactive?.actionStatus && (
                            <Col span={8}>
                              <div style={{ color: '#8c8c8c', marginBottom: 2, fontSize: 9 }}>
                                Status
                              </div>
                              <Switch
                                checked={record.isActive}
                                onChange={(checked) => {
                                  const data = {
                                    id: record.employeeId,
                                    checked: record.isActive,
                                    name: record.fullName,
                                    dateOfJoining: record?.dateOfJoining,
                                    ecode: record?.ecode || '',
                                  }
                                  setselectedEmployeeName(data)

                                  if (activeTab === 'abscond') {
                                    if (!checked) {
                                      openChecklistThenInactiveModal(
                                        record?.ecode,
                                        record?.employeeId,
                                      )
                                    } else {
                                      setModalVisibleAbscond(true)
                                    }
                                    return
                                  }

                                  if (!checked) {
                                    openChecklistThenInactiveModal(
                                      record?.ecode,
                                      record?.employeeId,
                                    )
                                  } else {
                                    setIsEmployeeInactiveModalOpen(true)
                                    setSelectedEmpId(record?.employeeId)
                                    setSelectedEmpName(record?.fullName || '')
                                  }
                                }}
                                size="small"
                              />
                            </Col>
                          )}

                          {activeTab === 'abscond' && (
                            <Col span={24}>
                              <div style={{ color: '#8c8c8c', marginBottom: 2, fontSize: 9 }}>
                                Abscond Reason
                              </div>
                              <div style={{ fontWeight: 500, fontSize: 9 }}>
                                {record.abscondingReasonName || '-'}
                              </div>
                            </Col>
                          )}
                        </Row>
                      </div>
                    )}
                  </div>
                )
              })}

            <div
              style={{
                marginTop: 16,
                textAlign: 'center',
                padding: 12,
                background: '#fafafa',
                border: '1px solid #d9d9d9',
                borderRadius: 4,
              }}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ fontSize: 12 }}>
                  Showing {(currentPage - 1) * pageSize + 1} -{' '}
                  {Math.min(currentPage * pageSize, displayData.length)} of {displayData.length}{' '}
                  items
                </div>
                <Space>
                  <Button
                    size="small"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span style={{ fontSize: 12 }}>
                    Page {currentPage} of {Math.ceil(displayData.length / pageSize)}
                  </span>
                  <Button
                    size="small"
                    disabled={currentPage >= Math.ceil(displayData.length / pageSize)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </Space>
              </Space>
            </div>
          </div>
        )}
      </div>

      <ExcelImportModal
        importExelModal={importExelModal}
        setimportExelModal={setimportExelModal}
        title_fields={[]}
      />

      <EmployeeActiveInactiveModal
        selectedEmployeeName={selectedEmployeeName}
        abscondingList={abscondingList}
        blackList={blackList}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={async (data) => {
          try {
            await handleToggle(
              data.id,
              data.leavingDate,
              data.remarks,
              data.status,
              data?.attachments || [],
              data?.reason,
              data?.abscondingReasonId,
              data?.blackListReasonId,
            )
            setModalVisible(false)
          } catch (e) {}
        }}
      />

      <EmployeeActiveInactiveModalAbscond
        selectedEmployeeName={selectedEmployeeName}
        abscondingList={abscondingList}
        blackList={blackList}
        visible={modalVisibleAbscond}
        onClose={() => setModalVisibleAbscond(false)}
        onSubmit={async (data) => {
          try {
            await handleToggle(
              data.id,
              data.leavingDate,
              data.remarks,
              data.status,
              data?.attachments || [],
              data?.reason,
              data?.abscondingReasonId,
              data?.blackListReasonId,
            )
            setModalVisibleAbscond(false)
          } catch (e) {}
        }}
      />
    </>
  )
}

const TableBulkActionIcons = ({
  totalRecords,
  selectedRowKeys,
  handleSearch,
  search,
  lodingLocal,
  setlodingLocal,
  refreshData,
  cardsData,
  actionsMap,
  ecode,
  handleClearFilters,
}) => {
  const theme = useSelector((state) => state?.ui?.theme)
  const [isEmpUploadVisible, setIsEmpUploadVisible] = useState(false)
  const [isBulkInactiveOpen, setIsBulkInactiveOpen] = useState(false)

  const [statusSummary, setstatusSummary] = useState([
    { name: 'ActiveEmployees', label: 'Active Employees', count: 0, color: 'green', id: [1] },
    { name: 'LeftEmployees', label: 'Left Employees', count: 0, color: 'blue', id: [7] },
    { name: 'TotalEmployees', label: 'Total Employees', count: 0, color: 'blue', id: [7] },
  ])

  const [isAbscondReportModalOpen, setIsAbscondReportModalOpen] = useState(false)
  const [abscondDateRange, setAbscondDateRange] = useState([])

  useEffect(() => {
    const activeVal = cardsData.find((i) => i.label === 'Active')?.value || 0
    const leftVal =
      cardsData.find((i) => i.label === 'Left')?.value ??
      cardsData.find((i) => i.label === 'Inactive')?.value ??
      0
    const totalVal = cardsData.find((i) => i.label === 'Total')?.value || 0

    setstatusSummary([
      {
        name: 'Active Employees',
        label: 'Active Employees',
        count: activeVal,
        color: 'green',
        id: [1],
      },
      { name: 'Left Employees', label: 'Left Employees', count: leftVal, color: 'blue', id: [7] },
      {
        name: 'Total Employees',
        label: 'Total Employees',
        count: totalVal,
        color: 'blue',
        id: [7],
      },
    ])
  }, [selectedRowKeys, totalRecords, cardsData])

  const downloadStoreDataAsExcel = async ({ isActive, allEmployee, companyId }) => {
    try {
      setlodingLocal(true)
      toast.info('Export is in queue, you will get an alert once the download is completed')
      const { data, status } = await exportEmployeeMaster({ isActive, allEmployee, companyId })
      if (status === 200) {
        const blob = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = window.URL.createObjectURL(blob)
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `Employee_${new Date().toISOString()}.xlsx`
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Export initiated successfully')
      }
    } catch (error) {
      console.error('api error', error)
      message.error('Export failed')
    } finally {
      setlodingLocal(false)
    }
  }

  // const downloadAbscondReportAsExcel = async () => {
  //   try {
  //     if (!abscondDateRange || abscondDateRange.length !== 2) {
  //       message.error('Please select From Date and To Date')
  //       return
  //     }

  //     const [fromDateObj, toDateObj] = abscondDateRange
  //     const fromDate = fromDateObj.format('YYYY-MM-DD')
  //     const toDate = toDateObj.format('YYYY-MM-DD')

  //     setlodingLocal(true)

  //     const response = await axiosInstance.get('/api/EmployeeNew/GetAbscondReport', {
  //       params: {
  //         pageNumber: 1,
  //         pageSize: 10,
  //         asExcel: true,
  //         fromDate,
  //         toDate,
  //       },
  //       responseType: 'blob',
  //     })

  //     const blob = new Blob([response.data], {
  //       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //     })

  //     const url = window.URL.createObjectURL(blob)
  //     const anchor = document.createElement('a')
  //     anchor.href = url
  //     anchor.download = `Abscond_Report_${fromDate}_to_${toDate}.xlsx`
  //     document.body.appendChild(anchor)
  //     anchor.click()
  //     anchor.remove()
  //     window.URL.revokeObjectURL(url)

  //     message.success('Abscond report downloaded successfully')
  //     setIsAbscondReportModalOpen(false)
  //     setAbscondDateRange([])
  //   } catch (error) {
  //     console.error('Abscond report download failed:', error)
  //     message.error(error?.response?.data?.message || 'Failed to download abscond report')
  //   } finally {
  //     setlodingLocal(false)
  //   }
  // }
const downloadAbscondReportAsExcel = async () => {
  try {
    setlodingLocal(true)

    const hasDateRange = Array.isArray(abscondDateRange) && abscondDateRange.length === 2

    const params = {
      pageNumber: 1,
      pageSize: 10,
      asExcel: true,
    }

    if (hasDateRange) {
      const [fromDateObj, toDateObj] = abscondDateRange
      params.fromDate = fromDateObj.format('YYYY-MM-DD')
      params.toDate = toDateObj.format('YYYY-MM-DD')
    }

    const response = await axiosInstance.get('/api/EmployeeNew/GetAbscondReport', {
      params,
      responseType: 'blob',
    })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url

    if (hasDateRange) {
      anchor.download = `Abscond_Report_${params.fromDate}_to_${params.toDate}.xlsx`
    } else {
      anchor.download = `Abscond_Report_${new Date().toISOString().split('T')[0]}.xlsx`
    }

    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.URL.revokeObjectURL(url)

    message.success('Abscond report downloaded successfully')
    setIsAbscondReportModalOpen(false)
    setAbscondDateRange([])
  } catch (error) {
    console.error('Abscond report download failed:', error)
    message.error(error?.response?.data?.message || 'Failed to download abscond report')
  } finally {
    setlodingLocal(false)
  }
}


  const items = [
    {
      key: '11',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: true, allEmployee: true, companyId: 0 })
          }
        >
          Export All Employees
        </div>
      ),
    },
    {
      key: '12',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: true, allEmployee: false, companyId: 0 })
          }
        >
          Export All Active Employees
        </div>
      ),
    },
    {
      key: '13',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: false, allEmployee: false, companyId: 0 })
          }
        >
          Export All InActive Employees
        </div>
      ),
    },
    {
      key: '1',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: true, allEmployee: true, companyId: 1 })
          }
        >
          Export All V2R Employees
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: true, allEmployee: true, companyId: 2 })
          }
        >
          Export All V2S Employees
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: true, allEmployee: true, companyId: 3 })
          }
        >
          Export All PT Employees
        </div>
      ),
    },
    {
      key: '4',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: true, allEmployee: false, companyId: 1 })
          }
        >
          Export Active V2R Employees
        </div>
      ),
    },
    {
      key: '5',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: false, allEmployee: false, companyId: 1 })
          }
        >
          Export InActive V2R Employees
        </div>
      ),
    },
    {
      key: '6',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: true, allEmployee: false, companyId: 2 })
          }
        >
          Export Active V2S Employees
        </div>
      ),
    },
    {
      key: '7',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: false, allEmployee: false, companyId: 2 })
          }
        >
          Export InActive V2S Employees
        </div>
      ),
    },
    {
      key: '8',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: true, allEmployee: false, companyId: 3 })
          }
        >
          Export Active PT Employees
        </div>
      ),
    },
    {
      key: '9',
      label: (
        <div
          onClick={() =>
            downloadStoreDataAsExcel({ isActive: false, allEmployee: false, companyId: 3 })
          }
        >
          Export InActive PT Employees
        </div>
      ),
    },
    {
      key: '14',
      label: <div onClick={() => setIsAbscondReportModalOpen(true)}>Export Abscond Report</div>,
    },
  ]

  const handleOnBlur = () => {
    sessionStorage.setItem('employeeListSearch', search)
  }

  const isRetailHierarchy = String(ecode).trim().toLowerCase() === 'v00362'

  return (
    <>
      {isEmpUploadVisible && (
        <EmployeesUploadModal
          isVisible={isEmpUploadVisible}
          setIsVisible={setIsEmpUploadVisible}
          refreshData={refreshData}
        />
      )}

      <BulkInactivateModal
        open={isBulkInactiveOpen}
        onClose={() => setIsBulkInactiveOpen(false)}
        preselectedEmployees={[]}
        onSuccess={refreshData}
      />

      <Modal
        title="Export Abscond Report"
        open={isAbscondReportModalOpen}
        onCancel={() => {
          setIsAbscondReportModalOpen(false)
          setAbscondDateRange([])
        }}
        onOk={downloadAbscondReportAsExcel}
        okText="Download"
        confirmLoading={lodingLocal}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label>Select From Date and To Date</label>
          <RangePicker
            style={{ width: '100%' }}
            value={abscondDateRange}
            format="YYYY-MM-DD"
            onChange={(dates) => setAbscondDateRange(dates || [])}
          />
        </div>
      </Modal>


      <div
        style={{
          padding: 5,
          display: 'flex',
          justifyContent: isRetailHierarchy ? 'end' : 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        {!isRetailHierarchy && (
          <Space wrap>
            {statusSummary.map(({ name, label, count }, index) => (
              <div
                key={index}
                style={{
                  border: '2px solid #ccc',
                  padding: 3,
                  borderRadius: 10,
                  display: 'flex',
                  justifyContent: 'center',
                }}
                className={theme === 'dark' ? 'dark-theme' : ''}
              >
                <Tooltip placement="top" title={label}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 100,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      fontSize: 12,
                      padding: '0 8px',
                    }}
                  >
                    {count} {name}
                  </span>
                </Tooltip>
              </div>
            ))}
          </Space>
        )}

        <Row>
          <Col style={{ display: 'flex', alignItems: 'center' }}>
            <Button onClick={handleClearFilters}>Clear Filters</Button>

            {actionsMap?.upload_employees?.actionStatus && (
              <Tooltip placement="top" title={'Upload Employees'}>
                <Button style={{ marginLeft: 5 }} onClick={() => setIsEmpUploadVisible(true)}>
                  <UploadOutlined />
                </Button>
              </Tooltip>
            )}

            <Tooltip placement="top" title={'Bulk Inactivate Employees'}>
              <Button style={{ marginLeft: 5 }} danger onClick={() => setIsBulkInactiveOpen(true)}>
                Bulk Inactive
              </Button>
            </Tooltip>

            {actionsMap?.export?.actionStatus && (
              <Tooltip placement="top" title={'Export'}>
                <Dropdown menu={{ items }} trigger={['click']}>
                  <Button style={{ marginLeft: 5 }} loading={lodingLocal}>
                    <ExportOutlined />
                  </Button>
                </Dropdown>
              </Tooltip>
            )}
          </Col>

          <Search
            placeholder="Search in table..."
            allowClear
            onChange={handleSearch}
            className={styles.tableSearch}
            value={search}
            onBlur={handleOnBlur}
          />
        </Row>
      </div>
    </>
  )
}

export default EmployeesList