import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  Select,
  Button,
  Modal,
  Row,
  Col,
  Card,
  message,
  Spin,
  Grid,
  DatePicker,
  Checkbox,
  Divider,
  Space,
  Progress,
  Upload,
  Tag,
} from 'antd'
import dayjs from 'dayjs'
import {
  EyeOutlined,
  DownloadOutlined,
  ExportOutlined,
  UploadOutlined,
  FileExcelOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import html2pdf from 'html2pdf.js'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import logo from '../../assets/images/V2-Logo-1.png'
import vwwLogo from '../../assets/images/aquatica_logo_v2.png'
import {
  viewSalarySlip,
  searchEmployeeDropdown,
  getLocationNameWithCode,
  fetchLocationBasedEmployees,
} from '../../services/Services'
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../../redux/uiSlice'
import numberToWords from '@jstb/num-to-words-indian'
import { useLocation } from 'react-router-dom'
import SalaryControlPanelModal from '../modals/SalaryControlPanelModal'
import { formatDateInDDMMMYYYY } from '../../VendorModule/helpers'

const { Option } = Select

// Reusable EmployeeSearch Component
const EmployeeSearch = ({
  value,
  onChange,
  defaultECode,
  defaultName,
  loading: parentLoading,
  disabled = false,
}) => {
  const [employees, setEmployees] = useState([])
  const [searchText, setSearchText] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const { role, storeCode } = useSelector((state) => state?.auth?.data || {})

  useEffect(() => {
    if (searchText.length >= 2) {
      setSearchLoading(true)
      const debounceTimer = setTimeout(async () => {
        try {
          const res = await searchEmployeeDropdown(searchText)
          if (res?.data?.employees?.length > 0) {
            setEmployees(res.data.employees)
          } else {
            setEmployees([])
          }
        } catch (error) {
          console.error('Error fetching employee data:', error)
          setEmployees([])
        } finally {
          setSearchLoading(false)
        }
      }, 800)

      return () => clearTimeout(debounceTimer)
    } else {
      setEmployees([])
    }
  }, [searchText])

  return (
    <Select
      showSearch
      style={{ minWidth: 320 }}
      placeholder="Employee"
      value={value}
      onChange={onChange}
      onSearch={setSearchText}
      filterOption={false}
      allowClear
      loading={parentLoading || searchLoading}
      disabled={disabled}
      notFoundContent={
        searchLoading ? (
          <div style={{ textAlign: 'center' }}>
            <Spin size="small" />
          </div>
        ) : (
          'No employees found'
        )
      }
    >
      {defaultECode && (
        <Select.Option value={defaultECode}>{`${defaultECode} - ${defaultName}`}</Select.Option>
      )}
      {!searchLoading
        ? employees.map((emp) => (
            <Select.Option key={emp.ecode} value={emp.ecode}>
              {`${emp.ecode} - ${emp.fullName}`}
            </Select.Option>
          ))
        : [
            <div key="spinner" style={{ textAlign: 'center' }}>
              <Spin size="small" />
            </div>,
          ]}
    </Select>
  )
}

const SalarySlips = ({
  emp_pro,
  ecodes,
  empCodeReadOnly = false,
  hideEmployeeSelect = false,
  ...props
}) => {
  const [year, setYear] = useState(null)
  const [month, setMonth] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const slipRef = useRef()
  // const isYear2026OrAbove = dayjs(String(year), 'YYYY').format('YYYY') >= 2026
  const isYear2026OrAbove = Number(year) >= 2026

  const { ecode, firstName, role, storeCode } = useSelector((state) => state.auth.data) || {}
  const disabledMonths = [
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const [salarySlipData, setSalarySlipData] = useState({})
  const [salarySlipControlPanal, setsalarySlipControlPanal] = useState(false)

  // local selected employee for admin / HR view
  const [selectedEmpCode, setSelectedEmpCode] = useState(
    role === 'Master' || role === 'HR' || role === 'IT Superadmin' ? null : ecode,
  )

  const viewportRef = useRef(null)
  const [fitToScreen, setFitToScreen] = useState(false)
  const [scale, setScale] = useState(1)
  const [contentHeight, setContentHeight] = useState(null)

  // ===== Export-to-ZIP modal state =====
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [exportLocations, setExportLocations] = useState([])
  const [exportLocationsLoading, setExportLocationsLoading] = useState(false)
  const [exportSelectedLocations, setExportSelectedLocations] = useState([]) // array of stCodes
  const [exportEmployees, setExportEmployees] = useState([])
  const [exportEmployeesLoading, setExportEmployeesLoading] = useState(false)
  const [exportSelectedEmps, setExportSelectedEmps] = useState([])
  const locReqTokenRef = useRef(0)
  const [exportExcelEcodes, setExportExcelEcodes] = useState([]) // ecodes parsed from uploaded sheet
  const [exportExcelFileName, setExportExcelFileName] = useState('')
  const [exportYear, setExportYear] = useState(null)
  const [exportMonth, setExportMonth] = useState(null)
  const [exportDownloading, setExportDownloading] = useState(false)
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 })

  const dispatch = useDispatch()
  const loc = useLocation()

  const { useBreakpoint } = Grid
  const screens = useBreakpoint()
  const showOnPhoneOrTablet = !screens.lg

  useEffect(() => {
    setFitToScreen(window.innerWidth <= 576)
  }, [])

  useEffect(() => {
    if (!fitToScreen) return

    const elViewport = viewportRef.current
    const elContent = slipRef.current
    if (!elViewport || !elContent) return

    const calc = () => {
      const viewportWidth = elViewport.clientWidth
      const contentWidth = 900
      const s = Math.min(1, viewportWidth / contentWidth)
      setScale(s)

      const h = elContent.scrollHeight
      setContentHeight(h)
    }

    calc()

    const ro = new ResizeObserver(calc)
    ro.observe(elViewport)
    return () => ro.disconnect()
  }, [fitToScreen, isModalOpen])

  // Sync local selectedEmpCode with ecodes prop when it comes from parent
  useEffect(() => {
    if (ecodes) {
      setSelectedEmpCode(ecodes)
    } else if (!ecodes && role !== 'Master' && role !== 'HR' && role !== 'IT Superadmin') {
      setSelectedEmpCode(ecode || null)
    }
  }, [ecodes, ecode, role])

  // Single source of truth for which ecode to use for API
  const effectiveEcode = useMemo(() => {
    // If parent passes a specific ecode, always prefer that
    if (ecodes) return ecodes

    // For admin / HR screen, use dropdown-selected ecode first
    if (!emp_pro && selectedEmpCode) return selectedEmpCode

    // Fallback to logged-in user ecode
    return ecode || null
  }, [emp_pro, ecodes, selectedEmpCode, ecode])

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const formatNumber = (val) =>
    parseFloat(val || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  const toTitleCase = (s) =>
    String(s || '')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())

  const handleView = async () => {
    // alert('Salary view is not available for now!')
    // return
    if (!year || !month) {
      message.warning('Please select both year and month')
      return
    }

    if (!effectiveEcode) {
      message.warning('Please select an employee')
      return
    }

    await dispatch(set({ loading: true }))
    const shortMonth = month.slice(0, 3)
    const payload = `${shortMonth}-${year.slice(-2)}`

    try {
      const result = await viewSalarySlip(effectiveEcode, payload)
      setSalarySlipData(result.data || {})
      if (year && month) setIsModalOpen(true)
    } catch (error) {
      console.error('error salary slip', error.response?.data?.message)
      message.info(error.response?.data?.message || 'Failed to load salary slip')
    } finally {
      await dispatch(set({ loading: false }))
    }
  }

  const handleDownload = async () => {
    const prevFitToScreen = fitToScreen
    setFitToScreen(false)
    await new Promise((r) => setTimeout(r, 50))

    document.body.style.zoom = '100%'
    if (slipRef.current) {
      const element = slipRef.current
      const opt = {
        margin: [0, 0],
        filename: `SalarySlip-${month}-${year}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
        },
        jsPDF: {
          unit: 'in',
          format: 'a4',
          orientation: 'portrait',
        },
        pagebreak: {
          mode: ['avoid-all', 'css', 'legacy'],
        },
      }

      html2pdf()
        .set(opt)
        .from(element)
        .toPdf()
        .get('pdf')
        .then((pdf) => {
          pdf.save(`SalarySlip-${month}-${year}.pdf`)
          document.body.style.zoom = '80%'
        })
        .catch((error) => {
          console.error('Error during PDF generation:', error)
          message.error('Failed to generate PDF')
          document.body.style.zoom = '80%'
        })
    } else {
      console.error('slipRef.current is null or undefined')
      message.error('Content not available for download')
    }
  }

  // ===== Reusable salary slip markup (same JSX, no tables removed) =====
  const renderSlipMarkup = (data, slipMonth, slipYear) => (
    <>
      <style>{`
        .slip-table { width: 100%; border-collapse: collapse; }
        .slip-table th, .slip-table td {
          border: 1px solid #000; padding: 4px 7px; font-size: 13px; text-align: left;
        }
        .text-center { text-align: center; }
        .text-right  { text-align: end; }
        .italic { margin-top: 10px; font-style: italic; }
        .section-title { margin-top: 16px; font-weight: bold; font-size: 14px; }
      `}</style>

      {(() => {
        const isVww = (data?.locationName || '').trim().toUpperCase() === 'VISHAL WATER WORLD'
        const headerLogo = isVww ? vwwLogo : logo
        const companyName = isVww ? 'VISHAL WATER WORLD PRIVATE LIMITED' : 'V2 RETAIL LTD'
        const addressLine1 = isVww
          ? 'KOCHPUKUR, POST OFFICE HATGACHIA,'
          : 'V2 Retail Limited, Incuzpace, 2nd Floor, 13, Sub. Major Laxmi Chand Road'
        const addressLine2 = isVww
          ? '24 PARGANAS (S), KOLKATA, PIN- 700156'
          : 'Maruti Udyog, Sector 18, Gurgaon'
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ maxWidth: '100px' }}>
              <img
                src={headerLogo}
                alt="Company Logo"
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div>
              <h5 className="text-right" style={{ margin: 0 }}>
                <strong>{companyName}</strong>
              </h5>
              <p
                className="text-right"
                style={{
                  maxWidth: '500px',
                  marginLeft: 'auto',
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  fontSize: 13,
                  lineHeight: 1.4,
                }}
              >
                {addressLine1}
                <br />
                {addressLine2}
              </p>
            </div>
          </div>
        )
      })()}

      <p
        style={{
          marginTop: 10,
          marginBottom: 10,
          fontWeight: 'bold',
          fontSize: '13px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          backgroundColor: '#f0f0f0',
          padding: '5px 8px',
        }}
      >
        Payslip for the month of {slipMonth}, {slipYear}
      </p>

      <table className="slip-table">
        <tbody>
          <tr>
            <td>Employee Code</td>
            <td>{data?.eCode}</td>
            <td>Employee Name</td>
            <td>{data?.employeeName}</td>
          </tr>
          <tr>
            <td>Designation</td>
            <td>{data?.designation}</td>
            <td>Date of Joining</td>
            <td>{formatDateInDDMMMYYYY(data?.dateofJoining)}</td>
          </tr>
          <tr>
            <td>Location</td>
            <td>{data?.locationName}</td>
            <td>Department</td>
            <td>{data?.department}</td>
          </tr>
          <tr>
            <td>Bank Account No.</td>
            <td>{data?.bankAccountNo}</td>
            <td>PAN No.</td>
            <td>{data?.paN_NO}</td>
          </tr>
          <tr>
            <td>Universal Account Number</td>
            <td>{data?.universalAccountNumber}</td>
            <td>Bank Name</td>
            <td>{data?.bankName}</td>
          </tr>
          <tr>
            <td>No of Days</td>
            <td>{data?.noofDays}</td>
            <td>IFSC Code</td>
            <td>{data?.ifscCode}</td>
          </tr>
          <tr>
            <td>ESIC No.</td>
            <td>
              {data?.esicNo && String(data.esicNo).trim() !== '' ? data.esicNo : '-'}
            </td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ width: '48%' }}>
          <p className="section-title">Earnings</p>
          <table className="slip-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>Description</th>
                <th style={{ textAlign: 'center' }}>CTC Reference</th>
                <th style={{ textAlign: 'center' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {(data?.basicSalaryBud > 0 || data?.basicSalary > 0) && (
                <tr>
                  <td>Basic Pay</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(data?.basicSalaryBud)}</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(data?.basicSalary)}</td>
                </tr>
              )}
              {(data?.ccaBud > 0 || data?.ccaBud > 0) && (
                <tr>
                  <td>C.C.A</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(data?.ccaBud)}</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(data?.cca)}</td>
                </tr>
              )}
              {(data?.daBud > 0 || data?.daBud > 0) && (
                <tr>
                  <td>D.A</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(data?.daBud)}</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(data?.da)}</td>
                </tr>
              )}
              {(data?.hraBud > 0 || data?.hraBud > 0) && (
                <tr>
                  <td>H.R.A.</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(data?.hraBud)}</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(data?.hra)}</td>
                </tr>
              )}
              {parseFloat(data?.incentive || 0) > 0 && (
                <tr>
                  <td>Incentive</td>
                  <td style={{ textAlign: 'right' }}>-</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(data?.incentive)}</td>
                </tr>
              )}
              {(data?.specialAllowanceBud > 0 || data?.specialAllowance > 0) && (
                <tr>
                  <td>Special Allowance</td>
                  <td style={{ textAlign: 'right' }}>
                    {formatNumber(data?.specialAllowanceBud)}
                  </td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(data?.specialAllowance)}</td>
                </tr>
              )}
              {parseFloat(data?.extraAllowance || 0) > 0 && (
                <tr>
                  <td>Extra Allowance</td>
                  <td style={{ textAlign: 'right' }}>-</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(data?.extraAllowance)}</td>
                </tr>
              )}
              <tr>
                <td>
                  <strong>Gross Earnings</strong>
                </td>
                <td style={{ textAlign: 'right' }}>{formatNumber(data?.grossEarningsCTCRef)}</td>
                <td style={{ textAlign: 'right' }}>{formatNumber(data?.grossEarningsAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ width: '48%' }}>
          <p className="section-title">Deductions</p>
          <table className="slip-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>Description</th>
                <th style={{ textAlign: 'center' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {data?.epf > 0 && (
                <tr>
                  <td>E.P.F.</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(data.epf)}</td>
                </tr>
              )}
              {parseFloat(data?.tds || 0) > 0 && (
                <tr>
                  <td>TDS</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(data?.tds)}</td>
                </tr>
              )}
              {data?.esic > 0 && (
                <tr>
                  <td>ESIC.</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(data.esic)}</td>
                </tr>
              )}
              {data?.loan > 0 && (
                <tr>
                  <td>Loan.</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(data.loan)}</td>
                </tr>
              )}
              {parseInt(data?.pTax || 0) > 0 && (
                <tr>
                  <td>PTAX</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(data?.pTax)}</td>
                </tr>
              )}
              {parseInt(data?.cashShort || 0) > 0 && (
                <tr>
                  <td>Cash Short</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(data?.cashShort)}</td>
                </tr>
              )}
              {parseInt(data?.dieselDeduction || 0) > 0 && (
                <tr>
                  <td>Diesel Deduction</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(data?.dieselDeduction)}</td>
                </tr>
              )}
              {parseInt(data?.penality || 0) > 0 && (
                <tr>
                  <td>Penality Deduction</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(data?.penality)}</td>
                </tr>
              )}
              {parseInt(data?.lwf || 0) > 0 && (
                <tr>
                  <td>L.W.F</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(data?.lwf)}</td>
                </tr>
              )}
              <tr>
                <td>
                  <strong>Gross Deductions</strong>
                </td>
                <td style={{ textAlign: 'right' }}>{formatNumber(data?.grossDeduction)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <table className="slip-table" style={{ marginTop: 8 }}>
        <tbody>
          <tr>
            <td style={{ width: '50%' }}>
              <strong>Gross Pay</strong>
            </td>
            <td colSpan={2} style={{ textAlign: 'right' }}>
              <strong>{formatNumber(data?.grossNetPay)}</strong>
            </td>
          </tr>
          <tr>
            <td colSpan={3}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <strong>Gross Pay In Words:</strong>
                <span style={{ textAlign: 'right' }}>
                  {`Rupees ${toTitleCase(numberToWords(data?.grossNetPay || 0))} Only`}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <p className="section-title">Reimbursement Component</p>
      <table className="slip-table">
        <thead>
          <tr>
            <th style={{ textAlign: 'center' }}>Description</th>
            <th style={{ textAlign: 'center' }}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Fuel & Maintenance</td>
            <td style={{ textAlign: 'right' }}>{formatNumber(data?.fuel_and_Maintenance)}</td>
          </tr>
          {parseFloat(data?.books_and_Periodicals || 0) > 0 && (
            <tr>
              <td>Books & Periodicals</td>
              <td style={{ textAlign: 'right' }}>
                {formatNumber(data?.books_and_Periodicals)}
              </td>
            </tr>
          )}
          {parseFloat(data?.professional_Attire || 0) > 0 && (
            <tr>
              <td>Professional Attire</td>
              <td style={{ textAlign: 'right' }}>{formatNumber(data?.professional_Attire)}</td>
            </tr>
          )}
          {parseFloat(data?.driver_Wages || 0) > 0 && (
            <tr>
              <td>Driver Wages</td>
              <td style={{ textAlign: 'right' }}>{formatNumber(data?.driver_Wages)}</td>
            </tr>
          )}
          {parseFloat(data?.mobile_Bill || 0) > 0 && (
            <tr>
              <td>Mobile Bill</td>
              <td style={{ textAlign: 'right' }}>{formatNumber(data?.mobile_Bill)}</td>
            </tr>
          )}
          {parseFloat(data?.meal_Voucher || 0) > 0 && (
            <tr>
              <td>Meal Voucher</td>
              <td style={{ textAlign: 'right' }}>{formatNumber(data?.meal_Voucher)}</td>
            </tr>
          )}
        </tbody>
      </table>

      <table className="slip-table" style={{ marginTop: 8 }}>
        <tbody>
          <tr>
            <td style={{ width: '50%' }}>
              <strong>Net Pay</strong>
            </td>
            <td colSpan={2} style={{ textAlign: 'right' }}>
              <strong>{formatNumber(data?.finalGrossEarnings_Netpay)}</strong>
            </td>
          </tr>
          <tr>
            <td colSpan={3}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <strong>Net Pay In Words:</strong>
                <span style={{ textAlign: 'right' }}>
                  {`Rupees ${toTitleCase(numberToWords(data?.finalGrossEarnings_Netpay || 0))} Only`}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ width: '48%' }}>
          <p className="section-title">Provident Fund(PF) Details</p>
          <table className="slip-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>Description</th>
                <th style={{ textAlign: 'center' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Employer Contribution to PF</td>
                <td style={{ textAlign: 'right' }}>{formatNumber(data?.eC_PF)}</td>
              </tr>
              <tr>
                <td>Employee VPF Contribution</td>
                <td style={{ textAlign: 'right' }}>{formatNumber(data?.e_VPF)}</td>
              </tr>
              <tr>
                <td>Employee Contribution to EPS</td>
                <td style={{ textAlign: 'right' }}>{formatNumber(data?.eC_EPS)}</td>
              </tr>
              <tr>
                <td>Employer Contribution to PF</td>
                <td style={{ textAlign: 'right' }}>{formatNumber(data?.erC_PF)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ width: '48%' }}>
          <p className="section-title">Leave Record</p>
          <table className="slip-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>Description</th>
                <th style={{ textAlign: 'center' }}>Taken</th>
                <th style={{ textAlign: 'center' }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Present Days</td>
                <td style={{ textAlign: 'right' }}>{data?.payble_Days}</td>
                <td></td>
              </tr>
              <tr>
                <td>Comp. Off</td>
                <td style={{ textAlign: 'right' }}>{data?.compoOffUsed}</td>
                <td style={{ textAlign: 'right' }}>{data?.compoOffBalance}</td>
              </tr>
              <tr>
                <td>E.L.</td>
                <td style={{ textAlign: 'right' }}>{data?.earnedLeaveUsed}</td>
                <td style={{ textAlign: 'right' }}>{data?.earnedLeaveBalance}</td>
              </tr>
              <tr>
                <td>C.L.</td>
                <td style={{ textAlign: 'right' }}>{data?.casualLeaveUsed}</td>
                <td style={{ textAlign: 'right' }}>{data?.casualLeaveBalance}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p className="italic">
        Remarks: This is a computer-generated payslip and does not require authentication.
      </p>
    </>
  )

  // ===== Export-to-ZIP handlers =====
  const fetchExportLocations = async () => {
    if (exportLocations.length > 0) return
    setExportLocationsLoading(true)
    try {
      const res = await getLocationNameWithCode()
      const list = res?.data?.data || res?.data || []
      setExportLocations(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('locations fetch err', err)
      message.error(err?.response?.data?.message || 'Failed to load locations')
    } finally {
      setExportLocationsLoading(false)
    }
  }

  const handleOpenExport = () => {
    setIsExportModalOpen(true)
    setExportYear(year || null)
    setExportMonth(month || null)
    fetchExportLocations()
  }

  const handleCloseExport = () => {
    if (exportDownloading) return
    setIsExportModalOpen(false)
    setExportSelectedLocations([])
    setExportEmployees([])
    setExportSelectedEmps([])
    setExportExcelEcodes([])
    setExportExcelFileName('')
    setExportProgress({ current: 0, total: 0 })
  }

  // Fetch employees for every selected store sequentially, merge & dedupe by ecode.
  // Uses a request token so a stale earlier call (e.g. the user just had 1 store
  // selected) can't overwrite the result of the latest selection.
  const handleExportLocationsChange = async (values) => {
    const next = values || []
    setExportSelectedLocations(next)
    setExportSelectedEmps([])

    if (next.length === 0) {
      setExportEmployees([])
      return
    }

    const myToken = ++locReqTokenRef.current
    setExportEmployeesLoading(true)

    const seen = new Set()
    const merged = []
    const failedStores = []

    try {
      for (const stCode of next) {
        // Bail out if a newer selection-change has superseded this one
        if (myToken !== locReqTokenRef.current) return

        // Option `value` IS the raw stCode (e.g. "HO-NEW", "STR-001"). Do NOT split
        // on '-' — that mangles legitimate codes containing hyphens and the backend
        // location lookup silently returns 0 employees for the wrong code.
        const stcode = String(stCode || '').trim()
        if (!stcode) continue
        try {
          const fd = new FormData()
          fd.append('stcode', stcode)
          const res = await fetchLocationBasedEmployees(fd)
          const list = Array.isArray(res?.data?.data) ? res.data.data : []
          list.forEach((emp) => {
            if (emp?.ecode && !seen.has(emp.ecode)) {
              seen.add(emp.ecode)
              merged.push({ ...emp, stcode: emp?.stcode || stcode })
            }
          })
        } catch (err) {
          console.error(`employees fetch err for ${stcode}`, err)
          failedStores.push(stcode)
        }
      }

      // Apply only if still the latest call
      if (myToken === locReqTokenRef.current) {
        setExportEmployees(merged)
        if (failedStores.length > 0) {
          message.warning(
            `Could not load employees for: ${failedStores.join(', ')}`,
          )
        }
      }
    } finally {
      if (myToken === locReqTokenRef.current) {
        setExportEmployeesLoading(false)
      }
    }
  }

  // ===== Excel upload (parse ecodes from a sheet) =====
  const parseEcodesFromWorkbook = (wb) => {
    const sheet = wb?.Sheets?.[wb?.SheetNames?.[0]]
    if (!sheet) return []
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
    if (!rows.length) return []

    // Detect ecode column from header row (case-insensitive)
    let col = 0
    let startRow = 0
    const header = (rows[0] || []).map((h) => String(h || '').trim().toLowerCase())
    const headerAliases = ['ecode', 'e code', 'e-code', 'employee code', 'employeecode', 'emp code', 'empcode']
    const matchedIdx = header.findIndex((h) => headerAliases.includes(h))
    if (matchedIdx >= 0) {
      col = matchedIdx
      startRow = 1
    }

    const ecodes = []
    for (let i = startRow; i < rows.length; i++) {
      const v = String(rows[i]?.[col] ?? '').trim()
      if (v) ecodes.push(v)
    }
    return Array.from(new Set(ecodes))
  }

  const handleExcelUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const wb = XLSX.read(data, { type: 'array' })
        const ecodes = parseEcodesFromWorkbook(wb)
        if (ecodes.length === 0) {
          message.warning('No ecodes found in the uploaded file')
          setExportExcelEcodes([])
          setExportExcelFileName('')
          return
        }
        setExportExcelEcodes(ecodes)
        setExportExcelFileName(file.name)
        message.success(`Loaded ${ecodes.length} ecode(s) from ${file.name}`)
      } catch (err) {
        console.error('excel parse err', err)
        message.error('Failed to read Excel file')
      }
    }
    reader.onerror = () => {
      message.error('Failed to read Excel file')
    }
    reader.readAsArrayBuffer(file)
    return false // prevent AntD Upload from posting
  }

  const handleClearExcel = () => {
    setExportExcelEcodes([])
    setExportExcelFileName('')
  }

  const handleDownloadExcelTemplate = () => {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([
      ['ecode'],
      ['V12345'],
      ['V12346'],
      ['V12347'],
    ])
    XLSX.utils.book_append_sheet(wb, ws, 'Employees')
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(
      new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      'SalarySlip_Ecodes_Template.xlsx',
    )
  }

  const waitForNextFrame = () =>
    new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    )

  const sanitizeFilenamePart = (s) =>
    String(s || '')
      .replace(/[\\/:*?"<>|]/g, '_')
      .replace(/\s+/g, '_')
      .slice(0, 60)

  const handleExportDownload = async () => {
    if (!exportYear || !exportMonth) {
      message.warning('Please select year and month')
      return
    }

    // Final ecode list = union of employees picked from locations + ecodes uploaded via excel.
    const fromLocation = Array.isArray(exportSelectedEmps) ? exportSelectedEmps : []
    const fromExcel = Array.isArray(exportExcelEcodes) ? exportExcelEcodes : []
    const allEcodesSet = new Set()
    fromLocation.forEach((c) => c && allEcodesSet.add(String(c).trim()))
    fromExcel.forEach((c) => c && allEcodesSet.add(String(c).trim()))
    const ecodesToExport = Array.from(allEcodesSet)

    if (ecodesToExport.length === 0) {
      message.warning('Select employees from a location or upload an Excel of ecodes')
      return
    }

    const shortMonth = exportMonth.slice(0, 3)
    const monthPayload = `${shortMonth}-${String(exportYear).slice(-2)}`

    setExportDownloading(true)
    setExportProgress({ current: 0, total: ecodesToExport.length })

    const zip = new JSZip()
    const failed = [] // [{ ecode, name, reason }]

    const empByEcode = (exportEmployees || []).reduce((acc, e) => {
      if (e?.ecode) acc[e.ecode] = e?.fulL_NAME || e?.fullName || ''
      return acc
    }, {})

    // ===== Snapshot current view state so we can restore after export =====
    const prevSalaryData = salarySlipData
    const prevMonth = month
    const prevYear = year
    const prevModalOpen = isModalOpen
    const prevZoom = document.body.style.zoom
    const prevFit = fitToScreen

    // Set view to export selection; open View modal so slipRef is mounted
    // (rendered exactly like the working single-Download path).
    setMonth(exportMonth)
    setYear(exportYear)
    setIsModalOpen(true)
    document.body.style.zoom = '100%'
    setFitToScreen(false)
    // Give the modal time to mount and lay out
    await new Promise((r) => setTimeout(r, 250))

    const pdfOpt = {
      margin: [0, 0],
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    }

    try {
      for (let i = 0; i < ecodesToExport.length; i++) {
        const ecodeItem = ecodesToExport[i]
        const fallbackName = empByEcode[ecodeItem] || ''
        try {
          let slipData = {}
          try {
            const resp = await viewSalarySlip(ecodeItem, monthPayload)
            slipData = resp?.data || {}
          } catch (apiErr) {
            const apiMsg =
              apiErr?.response?.data?.message ||
              apiErr?.response?.data?.Message ||
              apiErr?.message ||
              'API request failed'
            failed.push({ ecode: ecodeItem, name: fallbackName, reason: apiMsg })
            setExportProgress({ current: i + 1, total: ecodesToExport.length })
            continue
          }

          if (!slipData || !slipData.eCode) {
            failed.push({
              ecode: ecodeItem,
              name: fallbackName,
              reason: 'No salary data available for this month',
            })
            setExportProgress({ current: i + 1, total: ecodesToExport.length })
            continue
          }

          // Push this employee's data into the View modal — slipRef now shows them.
          setSalarySlipData(slipData)
          await waitForNextFrame()
          await waitForNextFrame()
          await new Promise((r) => setTimeout(r, 80))

          if (!slipRef.current) {
            failed.push({
              ecode: ecodeItem,
              name: slipData?.employeeName || fallbackName,
              reason: 'Render target unavailable',
            })
            setExportProgress({ current: i + 1, total: ecodesToExport.length })
            continue
          }

          let blob = null
          try {
            blob = await html2pdf()
              .set(pdfOpt)
              .from(slipRef.current)
              .toPdf()
              .output('blob')
          } catch (pdfErr) {
            console.error(`pdf gen failed for ${ecodeItem}`, pdfErr)
            failed.push({
              ecode: ecodeItem,
              name: slipData?.employeeName || fallbackName,
              reason: 'PDF generation failed',
            })
            setExportProgress({ current: i + 1, total: ecodesToExport.length })
            continue
          }

          if (blob && blob.size > 0) {
            const name = sanitizeFilenamePart(slipData?.employeeName || '')
            const fname = `SalarySlip-${ecodeItem}${name ? `-${name}` : ''}-${exportMonth}-${exportYear}.pdf`
            zip.file(fname, blob)
          } else {
            failed.push({
              ecode: ecodeItem,
              name: slipData?.employeeName || fallbackName,
              reason: 'Empty PDF returned',
            })
          }
        } catch (err) {
          console.error(`slip failed for ${ecodeItem}`, err)
          failed.push({
            ecode: ecodeItem,
            name: fallbackName,
            reason: err?.message || 'Unexpected error',
          })
        }
        setExportProgress({ current: i + 1, total: ecodesToExport.length })
      }

      const filesInZip = Object.keys(zip.files).length
      if (filesInZip === 0) {
        message.error('No salary slips could be generated')
      } else {
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        let tag = 'Custom'
        if (exportSelectedLocations.length > 0 && exportExcelEcodes.length === 0) {
          tag =
            exportSelectedLocations.length === 1
              ? sanitizeFilenamePart(exportSelectedLocations[0])
              : `${exportSelectedLocations.length}_stores`
        } else if (exportSelectedLocations.length === 0 && exportExcelEcodes.length > 0) {
          tag = 'Excel'
        } else if (exportSelectedLocations.length > 0 && exportExcelEcodes.length > 0) {
          tag = 'Mixed'
        }
        saveAs(zipBlob, `SalarySlips-${tag}-${exportMonth}-${exportYear}.zip`)
        if (failed.length === 0) {
          message.success(`Downloaded ${filesInZip} salary slip(s) as ZIP`)
        }
      }

      if (failed.length > 0) {
        Modal.warning({
          title: `${failed.length} salary slip(s) could not be generated`,
          width: 560,
          content: (
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              <p style={{ marginTop: 0 }}>
                {filesInZip > 0
                  ? `Downloaded ${filesInZip} slip(s) successfully. The following could not be generated:`
                  : 'No slips were generated. Details below:'}
              </p>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ background: '#fafafa' }}>
                    <th style={{ border: '1px solid #eee', padding: 6, textAlign: 'left' }}>
                      Employee
                    </th>
                    <th style={{ border: '1px solid #eee', padding: 6, textAlign: 'left' }}>
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {failed.map((f, idx) => (
                    <tr key={`${f.ecode}-${idx}`}>
                      <td style={{ border: '1px solid #eee', padding: 6 }}>
                        {f.ecode}
                        {f.name ? ` - ${f.name}` : ''}
                      </td>
                      <td style={{ border: '1px solid #eee', padding: 6 }}>{f.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
        })
      }
    } catch (err) {
      console.error('zip export failed', err)
      message.error('Failed to generate ZIP')
    } finally {
      // Restore everything we changed for the export
      setIsModalOpen(prevModalOpen)
      setSalarySlipData(prevSalaryData)
      setMonth(prevMonth)
      setYear(prevYear)
      setExportDownloading(false)
      document.body.style.zoom = prevZoom || '80%'
      setFitToScreen(prevFit)
    }
  }

  return (
    <div className="">
      <Card title="Salary Slips">
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            gap: 16,
            paddingBottom: 4,
            overflowX: screens.xs ? 'auto' : 'visible',
            WebkitOverflowScrolling: screens.xs ? 'touch' : 'auto',
          }}
        >
          {!hideEmployeeSelect &&
            (role === 'Master' || role === 'HR' || role === 'IT Superadmin') &&
            !emp_pro && (
              <div
                style={{
                  flex: '1 1 280px',
                  minWidth: 280,
                  maxWidth: 460,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <label style={{ marginBottom: 4, fontWeight: 500 }}>Select Employee</label>
                <EmployeeSearch
                  value={selectedEmpCode}
                  onChange={setSelectedEmpCode}
                  defaultECode={ecode}
                  defaultName={firstName}
                  loading={false}
                  disabled={empCodeReadOnly}
                />
              </div>
            )}

          <div
            style={{
              flex: '0 0 140px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <label style={{ marginBottom: 4, fontWeight: 500, whiteSpace: 'nowrap' }}>
              Select Year
            </label>
            <DatePicker
              picker="year"
              style={{ width: '100%' }}
              value={year ? dayjs(String(year), 'YYYY') : null}
              onChange={(v) => {
                setYear(v ? String(v.year()) : null)
                setMonth(null)
              }}
              format="YYYY"
              allowClear
              placeholder="Year"
            />
          </div>

          <div
            style={{
              flex: '0 0 170px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <label style={{ marginBottom: 4, fontWeight: 500 }}>Select Month</label>
            <Select
              style={{ width: '100%' }}
              value={month}
              onChange={setMonth}
              placeholder="Month"
              disabled={!year}
            >
              {months.map((m) => (
                <Option
                  key={m}
                  value={m}
                  disabled={
                    isYear2026OrAbove &&
                    m !== 'January' &&
                    m !== 'February' &&
                    m !== 'March' &&
                    m !== 'April'&&
                    m !== 'May' &&
                    m !== 'June' &&
                    m !== 'July'

                  }
                >
                  {m}
                </Option>
              ))}
            </Select>
          </div>

          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              flexDirection: 'row',
              gap: 8,
            }}
          >
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={handleView}
              disabled={!year || !month}
            >
              View
            </Button>
            <Button
              type="default"
              disabled={!year || !month}
              icon={<DownloadOutlined />}
              onClick={handleDownload}
            >
              Download
            </Button>
            {role === 'IT Superadmin' && !emp_pro && (
              <Button
                type="primary"
                ghost
                icon={<ExportOutlined />}
                onClick={handleOpenExport}
              >
                Export
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Modal
        centered
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width="min(950px, 100vw - 24px)"
        rootClassName="salary-slip-modal"
        title={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {showOnPhoneOrTablet && (
                <Button size="small" onClick={() => setFitToScreen((v) => !v)}>
                  {fitToScreen ? 'Actual size' : 'Fit to screen'}
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div
          ref={viewportRef}
          style={{
            position: 'relative',
            overflow: 'auto',
            width: '100%',
            ...(fitToScreen && contentHeight ? { height: contentHeight * scale + 1 } : {}),
          }}
        >
          <div
            style={{
              width: 900,
              transform: fitToScreen ? `scale(${scale})` : 'none',
              transformOrigin: 'top left',
              position: fitToScreen ? 'absolute' : 'static',
              left: 0,
              top: 0,
              boxSizing: 'border-box',
            }}
          >
            <div
              ref={slipRef}
              style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: 13,
                color: '#000',
                padding: '24px',
                paddingTop: '12px',
              }}
            >
              {renderSlipMarkup(salarySlipData, month, year)}
            </div>
          </div>
        </div>
      </Modal>


      {/* ===== Export Salary Slips Modal ===== */}
      <Modal
        title="Export Salary Slips"
        open={isExportModalOpen}
        onCancel={handleCloseExport}
        maskClosable={!exportDownloading}
        closable={!exportDownloading}
        width={720}
        footer={[
          <Button key="cancel" onClick={handleCloseExport} disabled={exportDownloading}>
            Cancel
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            loading={exportDownloading}
            onClick={handleExportDownload}
            disabled={
              !exportYear ||
              !exportMonth ||
              exportSelectedEmps.length + exportExcelEcodes.length === 0
            }
          >
            Download ZIP
            {exportSelectedEmps.length + exportExcelEcodes.length > 0 && (
              <span>
                {' '}
                (
                {new Set(
                  [...exportSelectedEmps, ...exportExcelEcodes].map((c) => String(c).trim()),
                ).size}
                )
              </span>
            )}
          </Button>,
        ]}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <label style={{ fontWeight: 500 }}>Year</label>
            <DatePicker
              picker="year"
              style={{ width: '100%' }}
              value={exportYear ? dayjs(String(exportYear), 'YYYY') : null}
              onChange={(v) => {
                setExportYear(v ? String(v.year()) : null)
                setExportMonth(null)
              }}
              format="YYYY"
              allowClear
              placeholder="Year"
              disabled={exportDownloading}
            />
          </Col>
          <Col xs={24} sm={12}>
            <label style={{ fontWeight: 500 }}>Month</label>
            <Select
              style={{ width: '100%' }}
              value={exportMonth}
              onChange={setExportMonth}
              placeholder="Month"
              disabled={!exportYear || exportDownloading}
            >
              {months.map((m) => (
                <Option
                  key={m}
                  value={m}
                  disabled={
                    Number(exportYear) >= 2026 &&
                    m !== 'January' &&
                    m !== 'February' &&
                    m !== 'March' &&
                    m !== 'April'&&
                    m !== 'May' &&
                     m !== 'June' &&
                     m !== 'July'
                  }
                >
                  {m}
                </Option>
              ))}
            </Select>
          </Col>

          <Col span={24}>
            <label style={{ fontWeight: 500 }}>
              Location{exportSelectedLocations.length > 0 ? `s (${exportSelectedLocations.length})` : ''}
            </label>
            <Select
              mode="multiple"
              showSearch
              allowClear
              style={{ width: '100%' }}
              placeholder="Select one or more locations"
              value={exportSelectedLocations}
              onChange={handleExportLocationsChange}
              loading={exportLocationsLoading}
              optionFilterProp="children"
              disabled={exportDownloading}
              maxTagCount={6}
              maxTagPlaceholder={(omitted) => `+${omitted.length} more`}
              filterOption={(input, option) =>
                String(option?.children || '')
                  .toLowerCase()
                  .includes(String(input).toLowerCase())
              }
            >
              {exportLocations.map((l) => (
                <Option key={l?.stCode} value={l?.stCode}>
                  {`${l?.storeLocationName || l?.locationName || ''} (${l?.stCode})`}
                </Option>
              ))}
            </Select>
          </Col>

          {exportSelectedLocations.length > 0 && (
            <Col span={24}>
              <label style={{ fontWeight: 500 }}>
                Employees
                {exportEmployees.length > 0 && (
                  <span style={{ color: '#999', fontWeight: 400 }}>
                    {' '}
                    ({exportSelectedEmps.length}/{exportEmployees.length} selected)
                  </span>
                )}
              </label>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder={
                  exportEmployeesLoading
                    ? 'Loading employees...'
                    : 'Select employees from the chosen location(s)'
                }
                value={exportSelectedEmps}
                onChange={setExportSelectedEmps}
                loading={exportEmployeesLoading}
                showSearch
                allowClear
                optionFilterProp="children"
                maxTagCount={5}
                maxTagPlaceholder={(omitted) => `+${omitted.length} more`}
                disabled={exportDownloading}
                filterOption={(input, option) =>
                  String(option?.children || '')
                    .toLowerCase()
                    .includes(String(input).toLowerCase())
                }
                dropdownRender={(menu) => {
                  const allEcodes = (exportEmployees || [])
                    .map((e) => e?.ecode)
                    .filter(Boolean)
                  const isAllSelected =
                    allEcodes.length > 0 && exportSelectedEmps.length === allEcodes.length
                  const isIndeterminate =
                    exportSelectedEmps.length > 0 &&
                    exportSelectedEmps.length < allEcodes.length
                  return (
                    <>
                      <div style={{ padding: 8 }}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Checkbox
                            indeterminate={isIndeterminate}
                            checked={isAllSelected}
                            onChange={(e) =>
                              setExportSelectedEmps(e.target.checked ? allEcodes : [])
                            }
                          >
                            Select all ({allEcodes.length})
                          </Checkbox>
                          <Button size="small" onClick={() => setExportSelectedEmps([])}>
                            Clear
                          </Button>
                        </Space>
                      </div>
                      <Divider style={{ margin: 0 }} />
                      {menu}
                    </>
                  )
                }}
              >
                {exportEmployees.map((emp) => (
                  <Select.Option key={emp?.ecode} value={emp?.ecode}>
                    {`${emp?.stcode ? emp.stcode + ' - ' : ''}${emp?.ecode || '-'} - ${
                      emp?.fulL_NAME || emp?.fullName || ''
                    }`}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          )}

          {/* ===== OR — Upload Excel of ecodes ===== */}
          <Col span={24}>
            <Divider style={{ margin: '4px 0' }}>OR</Divider>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <label style={{ fontWeight: 500 }}>
                Upload Excel of ecodes
                {exportExcelEcodes.length > 0 && (
                  <span style={{ color: '#999', fontWeight: 400 }}>
                    {' '}
                    ({exportExcelEcodes.length} loaded)
                  </span>
                )}
              </label>
              <Button
                size="small"
                type="link"
                icon={<DownloadOutlined />}
                onClick={handleDownloadExcelTemplate}
                disabled={exportDownloading}
              >
                Sample template
              </Button>
            </div>
            <Upload.Dragger
              name="file"
              accept=".xlsx,.xls"
              multiple={false}
              showUploadList={false}
              beforeUpload={handleExcelUpload}
              disabled={exportDownloading}
              style={{ padding: '6px 0' }}
            >
              <p style={{ fontSize: 28, marginBottom: 4, color: '#1677ff' }}>
                <FileExcelOutlined />
              </p>
              <p style={{ marginBottom: 4 }}>
                Click or drag an Excel file (.xlsx, .xls) here
              </p>
              <p style={{ color: '#999', fontSize: 12, marginBottom: 0 }}>
                First column should be <code>ecode</code> (header row recognised)
              </p>
            </Upload.Dragger>
            {exportExcelFileName && (
              <div
                style={{
                  marginTop: 8,
                  padding: '6px 10px',
                  background: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileExcelOutlined style={{ color: '#52c41a' }} />
                  <span style={{ fontWeight: 500 }}>{exportExcelFileName}</span>
                  <Tag color="green">{exportExcelEcodes.length} ecodes</Tag>
                </span>
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={handleClearExcel}
                  disabled={exportDownloading}
                  danger
                >
                  Remove
                </Button>
              </div>
            )}
          </Col>

          {/* Combined total preview */}
          {exportSelectedEmps.length + exportExcelEcodes.length > 0 && (
            <Col span={24}>
              <div
                style={{
                  padding: '8px 12px',
                  background: '#e6f4ff',
                  border: '1px solid #91caff',
                  borderRadius: 4,
                  fontSize: 13,
                }}
              >
                <strong>Total to download:</strong>{' '}
                {
                  new Set(
                    [...exportSelectedEmps, ...exportExcelEcodes].map((c) => String(c).trim()),
                  ).size
                }{' '}
                unique employee(s)
                {exportSelectedEmps.length > 0 && exportExcelEcodes.length > 0 && (
                  <span style={{ color: '#666' }}>
                    {' '}
                    ({exportSelectedEmps.length} from location + {exportExcelEcodes.length}{' '}
                    from Excel, deduped)
                  </span>
                )}
              </div>
            </Col>
          )}

          {exportDownloading && exportProgress.total > 0 && (
            <Col span={24}>
              <div style={{ marginTop: 8 }}>
                <Progress
                  percent={Math.round(
                    (exportProgress.current / exportProgress.total) * 100,
                  )}
                  status="active"
                />
                <div style={{ textAlign: 'center', color: '#666', fontSize: 12 }}>
                  Generating {exportProgress.current} of {exportProgress.total} salary slip(s)...
                </div>
              </div>
            </Col>
          )}
        </Row>
      </Modal>

      {/* ===== Export-in-progress overlay (covers the View modal cycling behind) ===== */}
      {exportDownloading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: '28px 32px',
              borderRadius: 8,
              minWidth: 420,
              maxWidth: 480,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              textAlign: 'center',
            }}
          >
            <Spin size="large" />
            <h3 style={{ marginTop: 16, marginBottom: 6 }}>
              Generating Salary Slips
            </h3>
            <p style={{ color: '#666', marginBottom: 16 }}>
              Please wait while your ZIP file is being prepared. Do not close the
              window.
            </p>
            <Progress
              percent={
                exportProgress.total > 0
                  ? Math.round((exportProgress.current / exportProgress.total) * 100)
                  : 0
              }
              status="active"
            />
            <div style={{ marginTop: 8, color: '#333', fontWeight: 500 }}>
              {exportProgress.current} of {exportProgress.total} slip(s) processed
            </div>
          </div>
        </div>
      )}

      <SalaryControlPanelModal
        salarySlipControlPanal={salarySlipControlPanal}
        setsalarySlipControlPanal={setsalarySlipControlPanal}
      />
    </div>
  )
}

export default SalarySlips
