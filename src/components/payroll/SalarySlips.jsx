import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Select, Button, Modal, Row, Col, Card, message, Spin, Grid, DatePicker } from 'antd'
import dayjs from 'dayjs'
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons'
import html2pdf from 'html2pdf.js'
import logo from '../../assets/images/V2-Logo-1.png'
import { viewSalarySlip, searchEmployeeDropdown } from '../../services/Services'
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

  return (
    <div className="">
      <Card title="Salary Slips">
        <Row
          gutter={[16, 16]}
          align="bottom"
          style={{
            justifyContent: 'space-between',
            overflowX: screens.xs ? 'auto' : 'visible',
            WebkitOverflowScrolling: screens.xs ? 'touch' : 'auto',
            paddingBottom: 10,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            {/* Hide employee dropdown when hideEmployeeSelect is true */}
            {!hideEmployeeSelect &&
              (role === 'Master' || role === 'HR' || role === 'IT Superadmin') &&
              !emp_pro && (
                <Col span={9}>
                  <label>Select Employee</label>
                  <EmployeeSearch
                    value={selectedEmpCode}
                    onChange={setSelectedEmpCode}
                    defaultECode={ecode}
                    defaultName={firstName}
                    loading={false}
                    disabled={empCodeReadOnly}
                  />
                </Col>
              )}

            <Col
              span={loc?.pathname?.includes('/employee/update') ? 8 : 4}
              style={{ paddingLeft: 0 }}
            >
              <label style={{ textWrap: 'nowrap' }}>Select Year</label>
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
            </Col>

            <Col span={loc?.pathname?.includes('/employee/update') ? 8 : 6}>
              <label>Select Month</label>
              <Select
                style={{ width: '100%' }}
                value={month}
                onChange={setMonth}
                placeholder="Month"
                // disabled={isYear2026OrAbove && disabledMonths.includes(month)}
                disabled={!year}
              >
                {months.map((m) => (
                  <Option
                    key={m}
                    value={m}
                    disabled={isYear2026OrAbove && m !== 'January' && m !== 'February' && m !== 'March'  && m !== 'April'}
                  >
                    {m}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col span={8}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 5,
                  alignItems: 'center',
                  marginTop: 20,
                }}
              >
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={handleView}
                  disabled={!year || !month}
                  style={{ marginRight: 8 }}
                >
                  View
                </Button>
                <Button
                  type="default"
                  disabled={!year || !month}
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                  style={{ marginRight: 8 }}
                >
                  Download
                </Button>
              </div>
            </Col>
          </div>
        </Row>
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

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ maxWidth: '100px' }}>
                  <img
                    src={logo}
                    alt="Company Logo"
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  />
                </div>
                <div>
                  <h5 className="text-right" style={{ margin: 0 }}>
                    <strong>V2 RETAIL LTD</strong>
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
                    V2 Retail Limited, Incuzpace, 2nd Floor, 13, Sub. Major Laxmi Chand Road
                    <br />
                    Maruti Udyog, Sector 18, Gurgaon
                  </p>
                </div>
              </div>

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
                Payslip for the month of {month}, {year}
              </p>

              <table className="slip-table">
                <tbody>
                  <tr>
                    <td>Employee Code</td>
                    <td>{salarySlipData?.eCode}</td>
                    <td>Employee Name</td>
                    <td>{salarySlipData?.employeeName}</td>
                  </tr>
                  <tr>
                    <td>Designation</td>
                    <td>{salarySlipData?.designation}</td>
                    <td>Date of Joining</td>
                    <td>{formatDateInDDMMMYYYY(salarySlipData?.dateofJoining)}</td>
                  </tr>
                  <tr>
                    <td>Location</td>
                    <td>{salarySlipData?.locationName}</td>
                    <td>Department</td>
                    <td>{salarySlipData?.department}</td>
                  </tr>
                  <tr>
                    <td>Bank Account No.</td>
                    <td>{salarySlipData?.bankAccountNo}</td>
                    <td>PAN No.</td>
                    <td>{salarySlipData?.paN_NO}</td>
                  </tr>
                  <tr>
                    <td>Universal Account Number</td>
                    <td>{salarySlipData?.universalAccountNumber}</td>
                    <td>Bank Name</td>
                    <td>{salarySlipData?.bankName}</td>
                  </tr>
                  <tr>
                    <td>No of Days</td>
                    <td>{salarySlipData?.noofDays}</td>
                    <td>IFSC Code</td>
                    <td>{salarySlipData?.ifscCode}</td>
                  </tr>
                  <tr>
                    <td>ESIC No.</td>
                    <td>
                      {salarySlipData?.esicNo && String(salarySlipData.esicNo).trim() !== ''
                        ? salarySlipData.esicNo
                        : '-'}
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
                      {(salarySlipData?.basicSalaryBud > 0 || salarySlipData?.basicSalary > 0) && (
                        <tr>
                          <td>Basic Pay</td>
                          <td style={{ textAlign: 'right' }}>
                            {formatNumber(salarySlipData?.basicSalaryBud)}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {formatNumber(salarySlipData?.basicSalary)}
                          </td>
                        </tr>
                      )}
                      {(salarySlipData?.ccaBud > 0 || salarySlipData?.ccaBud > 0) && (
                        <tr>
                          <td>C.C.A</td>
                          <td style={{ textAlign: 'right' }}>
                            {formatNumber(salarySlipData?.ccaBud)}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {formatNumber(salarySlipData?.cca)}
                          </td>
                        </tr>
                      )}
                      {(salarySlipData?.daBud > 0 || salarySlipData?.daBud > 0) && (
                        <tr>
                          <td>D.A</td>
                          <td style={{ textAlign: 'right' }}>
                            {formatNumber(salarySlipData?.daBud)}
                          </td>
                          <td style={{ textAlign: 'right' }}>{formatNumber(salarySlipData?.da)}</td>
                        </tr>
                      )}
                      {(salarySlipData?.hraBud > 0 || salarySlipData?.hraBud > 0) && (
                        <tr>
                          <td>H.R.A.</td>
                          <td style={{ textAlign: 'right' }}>
                            {formatNumber(salarySlipData?.hraBud)}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {formatNumber(salarySlipData?.hra)}
                          </td>
                        </tr>
                      )}
                      {parseFloat(salarySlipData?.incentive || 0) > 0 && (
                        <tr>
                          <td>Incentive</td>
                          <td style={{ textAlign: 'right' }}>-</td>
                          <td style={{ textAlign: 'right' }}>
                            {formatNumber(salarySlipData?.incentive)}
                          </td>
                        </tr>
                      )}

                      {(salarySlipData?.specialAllowanceBud > 0 ||
                        salarySlipData?.specialAllowance > 0) && (
                        <tr>
                          <td>Special Allowance</td>
                          <td style={{ textAlign: 'right' }}>
                            {formatNumber(salarySlipData?.specialAllowanceBud)}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {formatNumber(salarySlipData?.specialAllowance)}
                          </td>
                        </tr>
                      )}
                      {parseFloat(salarySlipData?.extraAllowance || 0) > 0 && (
                        <tr>
                          <td>Extra Allowance</td>
                          <td style={{ textAlign: 'right' }}>-</td>
                          <td style={{ textAlign: 'right' }}>
                            {formatNumber(salarySlipData?.extraAllowance)}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td>
                          <strong>Gross Earnings</strong>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {formatNumber(salarySlipData?.grossEarningsCTCRef)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {formatNumber(salarySlipData?.grossEarningsAmount)}
                        </td>
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
                      {salarySlipData?.epf > 0 && (
                        <tr>
                          <td>E.P.F.</td>
                          <td style={{ textAlign: 'right' }}>{formatNumber(salarySlipData.epf)}</td>
                        </tr>
                      )}
                      {parseFloat(salarySlipData?.tds || 0) > 0 && (
                        <tr>
                          <td>TDS</td>
                          <td style={{ textAlign: 'right' }}>
                            {formatNumber(salarySlipData?.tds)}
                          </td>
                        </tr>
                      )}
                      {salarySlipData?.esic > 0 && (
                        <tr>
                          <td>ESIC.</td>
                          <td style={{ textAlign: 'right' }}>
                            {formatNumber(salarySlipData.esic)}
                          </td>
                        </tr>
                      )}
                      {salarySlipData?.loan > 0 && (
                        <tr>
                          <td>Loan.</td>
                          <td style={{ textAlign: 'right' }}>
                            {formatNumber(salarySlipData.loan)}
                          </td>
                        </tr>
                      )}
                      {parseInt(salarySlipData?.pTax || 0) > 0 && (
                        <tr>
                          <td>PTAX</td>
                          <td style={{ textAlign: 'right' }}>
                            {formatNumber(salarySlipData?.pTax)}
                          </td>
                        </tr>
                      )}
                      {parseInt(salarySlipData?.cashShort || 0) > 0 && (
                        <tr>
                          <td>Cash Short</td>
                          <td style={{ textAlign: 'right' }}>
                            {formatNumber(salarySlipData?.cashShort)}
                          </td>
                        </tr>
                      )}
                      {parseInt(salarySlipData?.dieselDeduction || 0) > 0 && (
                        <tr>
                          <td>Diesel Deduction</td>
                          <td style={{ textAlign: 'right' }}>
                            {formatNumber(salarySlipData?.dieselDeduction)}
                          </td>
                        </tr>
                      )}
                      {parseInt(salarySlipData?.penality || 0) > 0 && (
                        <tr>
                          <td>Penality Deduction</td>
                          <td style={{ textAlign: 'right' }}>
                            {formatNumber(salarySlipData?.penality)}
                          </td>
                        </tr>
                      )}
                      {parseInt(salarySlipData?.lwf || 0) > 0 && (
                        <tr>
                          <td>L.W.F</td>
                          <td style={{ textAlign: 'right' }}>
                            {formatNumber(salarySlipData?.lwf)}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td>
                          <strong>Gross Deductions</strong>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {formatNumber(salarySlipData?.grossDeduction)}
                        </td>
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
                      <strong>{formatNumber(salarySlipData?.grossNetPay)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>Gross Pay In Words:</strong> Rupees{' '}
                        {numberToWords(salarySlipData?.grossNetPay || 0)} Only
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
                    <td style={{ textAlign: 'right' }}>
                      {formatNumber(salarySlipData?.fuel_and_Maintenance)}
                    </td>
                  </tr>
                  {parseFloat(salarySlipData?.books_and_Periodicals || 0) > 0 && (
                    <tr>
                      <td>Books & Periodicals</td>
                      <td style={{ textAlign: 'right' }}>
                        {formatNumber(salarySlipData?.books_and_Periodicals)}
                      </td>
                    </tr>
                  )}

                  {parseFloat(salarySlipData?.professional_Attire || 0) > 0 && (
                    <tr>
                      <td>Professional Attire</td>
                      <td style={{ textAlign: 'right' }}>
                        {formatNumber(salarySlipData?.professional_Attire)}
                      </td>
                    </tr>
                  )}

                  {parseFloat(salarySlipData?.driver_Wages || 0) > 0 && (
                    <tr>
                      <td>Driver Wages</td>
                      <td style={{ textAlign: 'right' }}>
                        {formatNumber(salarySlipData?.driver_Wages)}
                      </td>
                    </tr>
                  )}

                  {parseFloat(salarySlipData?.mobile_Bill || 0) > 0 && (
                    <tr>
                      <td>Mobile Bill</td>
                      <td style={{ textAlign: 'right' }}>
                        {formatNumber(salarySlipData?.mobile_Bill)}
                      </td>
                    </tr>
                  )}

                  {parseFloat(salarySlipData?.meal_Voucher || 0) > 0 && (
                    <tr>
                      <td>Meal Voucher</td>
                      <td style={{ textAlign: 'right' }}>
                        {formatNumber(salarySlipData?.meal_Voucher)}
                      </td>
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
                      <strong>{formatNumber(salarySlipData?.finalGrossEarnings_Netpay)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>Net Pay In Words:</strong> Rupees{' '}
                        {numberToWords(salarySlipData?.finalGrossEarnings_Netpay || 0)} Only
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
                        <td style={{ textAlign: 'right' }}>
                          {formatNumber(salarySlipData?.eC_PF)}
                        </td>
                      </tr>
                      <tr>
                        <td>Employee VPF Contribution</td>
                        <td style={{ textAlign: 'right' }}>
                          {formatNumber(salarySlipData?.e_VPF)}
                        </td>
                      </tr>
                      <tr>
                        <td>Employee Contribution to EPS</td>
                        <td style={{ textAlign: 'right' }}>
                          {formatNumber(salarySlipData?.eC_EPS)}
                        </td>
                      </tr>
                      <tr>
                        <td>Employer Contribution to PF</td>
                        <td style={{ textAlign: 'right' }}>
                          {formatNumber(salarySlipData?.erC_PF)}
                        </td>
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
                        <td style={{ textAlign: 'right' }}>{salarySlipData?.payble_Days}</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Comp. Off</td>
                        <td style={{ textAlign: 'right' }}>{salarySlipData?.compoOffUsed}</td>
                        <td style={{ textAlign: 'right' }}>{salarySlipData?.compoOffBalance}</td>
                      </tr>
                      <tr>
                        <td>E.L.</td>
                        <td style={{ textAlign: 'right' }}>{salarySlipData?.earnedLeaveUsed}</td>
                        <td style={{ textAlign: 'right' }}>{salarySlipData?.earnedLeaveBalance}</td>
                      </tr>
                      <tr>
                        <td>C.L.</td>
                        <td style={{ textAlign: 'right' }}>{salarySlipData?.casualLeaveUsed}</td>
                        <td style={{ textAlign: 'right' }}>{salarySlipData?.casualLeaveBalance}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="italic">
                Remarks: This is a computer-generated payslip and does not require authentication.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      <SalaryControlPanelModal
        salarySlipControlPanal={salarySlipControlPanal}
        setsalarySlipControlPanal={setsalarySlipControlPanal}
      />
    </div>
  )
}

export default SalarySlips
