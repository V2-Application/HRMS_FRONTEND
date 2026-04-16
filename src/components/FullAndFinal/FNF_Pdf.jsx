import { Modal, Divider, Button, Space, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { useMemo, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'
import dayjs from 'dayjs'

import compnay_logo from '../../assets/images/V2-Logo-1.png'

const safe = (v, fallback = '-') => {
  // treat " " as empty too
  if (v === null || v === undefined) return fallback
  if (typeof v === 'string' && v.trim() === '') return fallback
  return v
}

const fmtDate = (d) => {
  if (!d) return '-'
  const dt = dayjs(d)
  return dt.isValid() ? dt.format('DD-MM-YYYY') : String(d)
}

const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const fmtMoney = (n) => {
  const num = Number(n)
  if (!Number.isFinite(num)) return '-'
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const amountInWordsFallback = (n) => {
  const num = Number(n)
  if (!Number.isFinite(num)) return ''
  return '(In Words: Amount in words not configured)'
}

// Clone helper for Download PDF (do not touch UI)
const createHiddenClone = (node) => {
  const clone = node.cloneNode(true)

  const wrapper = document.createElement('div')
  wrapper.style.position = 'fixed'
  wrapper.style.left = '-99999px'
  wrapper.style.top = '0'
  wrapper.style.background = '#fff'
  wrapper.style.width = '210mm'

  // A4-friendly sizing only on clone
  clone.style.width = '190mm'
  clone.style.margin = '0'
  clone.style.boxShadow = 'none'
  clone.style.borderRadius = '0'
  clone.style.background = '#fff'

  wrapper.appendChild(clone)
  document.body.appendChild(wrapper)

  return { wrapper, clone }
}

const removeHiddenClone = (wrapper) => {
  try {
    if (wrapper?.parentNode) wrapper.parentNode.removeChild(wrapper)
  } catch {}
}

const Label = ({ children }) => (
  <div style={{ fontSize: 12, color: '#111', fontWeight: 600 }}>{children}</div>
)

const Value = ({ children, style = {} }) => (
  <div style={{ fontSize: 12, color: '#111', ...style }}>{children}</div>
)

const Cell = ({ children, align = 'left', bold = false, style = {} }) => (
  <div
    style={{
      padding: '6px 8px',
      fontSize: 12,
      textAlign: align,
      fontWeight: bold ? 700 : 400,
      ...style,
    }}
  >
    {children}
  </div>
)

const RowLine = () => <div style={{ height: 1, background: '#111', opacity: 0.35 }} />

// Builds Earning rows from your current keys.
// If you want exact labels like your paper, change labels here.
const buildEarningsFromDetails = (details) => {
  console.log('Details:', details)
  const rows = []

  const lastMonth = safe(details?.lastMonth, null) // e.g. "Aug-2025"
  const rate = toNum(details?.rate)
  const payableDays = safe(details?.payableDays, null)

  if (rate > 0) {
    rows.push({
      label: lastMonth ? `Earnings of ${lastMonth}` : 'Earnings',
      amount: rate,
    })

    if (payableDays !== null && payableDays !== '-' && payableDays !== '') {
      rows.push({
        label: `Rate: ${fmtMoney(rate)} Payable Days: ${safe(payableDays, '-')}`,
        amount: 0,
        isInfo: true,
      })
    }
  }

  if (toNum(details?.unPaidSalary) > 0)
    rows.push({ label: 'Unpaid Salary', amount: toNum(details?.unPaidSalary) })

  toNum(details?.rate) > 0 && rows.push({ label: 'Rate', amount: details?.rate })
  toNum(details?.payableDays) > 0 &&
    rows.push({ label: 'Payable Days', amount: toNum(details?.payableDays) })

  toNum(details?.bonus) > 0 &&
    rows.push({
      label: `Bonus (${details?.bonusPeriodFrom?.split('T')[0]} - ${details?.bonusPeriodTill?.split('T')[0]})`,
      amount: details?.bonus,
    })

  if (toNum(details?.gratuity) > 0)
    rows.push({ label: 'Gratuity', amount: toNum(details?.gratuity) })

  if (toNum(details?.noticeSalary) > 0)
    rows.push({ label: 'Notice Salary', amount: toNum(details?.noticeSalary) })

  if (toNum(details?.advanceBalance) > 0)
    rows.push({ label: 'Advance Balance (Adjustment)', amount: toNum(details?.advanceBalance) })

  // If nothing exists but totalAdditions exists, show single row
  // if (rows.length === 0 && toNum(details?.totalAdditions) > 0) {
  //   rows.push({ label: 'Total Additions', amount: toNum(details?.totalAdditions) })
  // }

  return rows
}

const buildDeductionsFromDetails = (details) => {
  const rows = []

  // pTax/pf could be null in payload; handle
  if (toNum(details?.pTax) > 0) rows.push({ label: 'P.TAX', amount: toNum(details?.pTax) })
  if (toNum(details?.pf) > 0) rows.push({ label: 'PF', amount: toNum(details?.pf) })
  if (toNum(details?.tds) > 0) rows.push({ label: 'TDS', amount: toNum(details?.tds) })

  // If your system uses "advanceBalance" as deduction instead of addition, move it here instead.
  // if (toNum(details?.advanceBalance) > 0) rows.push({ label: 'Advance Recovery', amount: toNum(details?.advanceBalance) })

  // if (rows.length === 0 && toNum(details?.totalDeductions) > 0) {
  //   rows.push({ label: 'Total Deductions', amount: toNum(details?.totalDeductions) })
  // }

  toNum(details?.esic > 0) && rows.push({ label: 'ESIC', amount: toNum(details?.esic) })
  toNum(details?.pf > 0) && rows.push({ label: 'PF', amount: toNum(details?.pf) })
  toNum(details?.advanceBalance > 0) &&
    rows.push({ label: 'Advance', amount: toNum(details?.advanceBalance) })
  toNum(details?.tds > 0) && rows.push({ label: 'TDS', amount: toNum(details?.tds) })

  return rows
}

const sumRows = (rows = []) => rows.reduce((acc, r) => acc + (toNum(r?.amount) || 0), 0)

const FNF_Pdf = ({ isModalOpen, handleCancel, details = {} }) => {
  const paperRef = useRef(null)
  const [isDownloading, setIsDownloading] = useState(false)

  // --- Details (your keys) ---
  const employeeName = safe(details?.employeeName)
  const empCode = safe(details?.ecode)
  const designation = safe(details?.designation)
  const panNo = safe(details?.panNo)
  const esic = safe(details?.esic)

  const doj = fmtDate(details?.dateOfJoining)
  const dol = fmtDate(details?.dateOfLeaving)
  const department = safe(details?.department)
  const location = safe(details?.location)

  const bankName = safe(details?.bankName)
  const bankAcc = safe(details?.accountNo)
  const ifsc = safe(details?.ifsc)

  // usually fnfDate is the document date
  const fnfDate = fmtDate(details?.fnfDate)

  // --- Build rows from your payload fields ---
  const earnings = buildEarningsFromDetails(details)
  const deductions = buildDeductionsFromDetails(details)

  // Prefer backend totals if present (because you already have totalAdditions/totalDeductions/netAmount)
  const totalEarnings = sumRows(earnings)
  const totalDeductions = sumRows(deductions)
  const netPayable =
    toNum(details?.netAmount) > 0 ? toNum(details?.netAmount) : totalEarnings - totalDeductions

  const netPayableWords = safe(details?.netPayableWords, '') || amountInWordsFallback(netPayable)

  const fileName = useMemo(() => {
    const code = empCode !== '-' ? empCode : 'EMP'
    const name = employeeName !== '-' ? String(employeeName).replace(/\s+/g, '_') : 'NAME'
    return `Full_Final_Settlement_${code}_${name}.pdf`
  }, [empCode, employeeName])

  const handleDownloadPdf = async () => {
    let wrapper
    try {
      setIsDownloading(true)
      if (!paperRef.current) return
      if (document.fonts?.ready) await document.fonts.ready

      const { wrapper: w, clone } = createHiddenClone(paperRef.current)
      wrapper = w

      await new Promise((r) => requestAnimationFrame(r))

      const dataUrl = await toPng(clone, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      })

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      const margin = 10
      const printableWidth = pageWidth - margin * 2
      const printableHeight = pageHeight - margin * 2

      const img = new Image()
      img.src = dataUrl
      await new Promise((res, rej) => {
        img.onload = res
        img.onerror = rej
      })

      const imgWidthMm = printableWidth
      const imgHeightMm = (img.height * imgWidthMm) / img.width

      let heightLeft = imgHeightMm
      let position = margin

      pdf.addImage(dataUrl, 'PNG', margin, position, imgWidthMm, imgHeightMm)
      heightLeft -= printableHeight

      while (heightLeft > 0) {
        pdf.addPage()
        position = margin - (imgHeightMm - heightLeft)
        pdf.addImage(dataUrl, 'PNG', margin, position, imgWidthMm, imgHeightMm)
        heightLeft -= printableHeight
      }

      pdf.save(fileName)
    } catch (err) {
      console.error(err)
      message.error('Failed to generate PDF')
    } finally {
      removeHiddenClone(wrapper)
      setIsDownloading(false)
    }
  }

  return (
    <Modal
      title="Full and Final Settlement"
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      centered
      destroyOnClose={false}
      width="min(1120px, 96vw)"
      bodyStyle={{ background: '#f5f5f5', padding: 12 }}
    >
      <Space
        style={{ width: '100%', justifyContent: 'flex-end', marginBottom: 12, flexWrap: 'wrap' }}
      >
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          loading={isDownloading}
        >
          Download PDF
        </Button>
      </Space>

      <div style={{ overflowX: 'auto' }}>
        <div
          ref={paperRef}
          style={{
            width: 'min(820px, 100%)',
            margin: '0 auto',
            background: '#fff',
            padding: 'clamp(14px, 3vw, 34px) clamp(12px, 4vw, 46px)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
            borderRadius: 6,
            fontFamily: 'Times New Roman, Times, serif',
            color: '#111',
          }}
        >
          {/* ✅ SAME HEADER */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <img
              src={compnay_logo}
              alt="Company Logo"
              style={{
                width: 'clamp(96px, 22vw, 140px)',
                height: 'clamp(34px, 6vw, 48px)',
                objectFit: 'contain',
                maxWidth: '45%',
              }}
            />

            <div style={{ textAlign: 'right', maxWidth: '55%', fontFamily: 'Arial, sans-serif' }}>
              <div
                style={{
                  fontSize: 'clamp(16px, 4vw, 22px)',
                  fontWeight: 500,
                  lineHeight: 1.1,
                  // letterSpacing: 0.3,
                  whiteSpace: 'nowrap',
                }}
              >
                V2 RETAIL LTD
              </div>
              <div style={{ fontSize: 'clamp(10px, 2.6vw, 12px)', color: '#666', marginTop: 4 }}>
                (Value &amp; Variety)
              </div>
            </div>
          </div>

          <Divider style={{ margin: '12px 0' }} />

          {/* TITLE + DATE */}
          <div style={{ textAlign: 'center', marginTop: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Full and Final Settlement</div>
          </div>

          {/* <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6, fontSize: 12 }}>
            <span style={{ color: '#333' }}>{fnfDate}</span>
          </div> */}

          {/* TOP DETAILS */}
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr',
                rowGap: 6,
                columnGap: 10,
              }}
            >
              <Label>Name of Employee</Label>
              <Value style={{ fontWeight: 700 }}>{employeeName}</Value>

              <Label>Employee Code</Label>
              <Value>{empCode}</Value>

              <Label>Designation</Label>
              <Value>{designation}</Value>

              <Label>PAN No.</Label>
              <Value>{panNo}</Value>

              <Label>ESIC</Label>
              <Value>{esic}</Value>

              <Label>Date of joining</Label>
              <Value>{doj}</Value>

              <Label>Date of leaving</Label>
              <Value>{dol}</Value>

              <Label>Department</Label>
              <Value>{department}</Value>

              <Label>Location</Label>
              <Value>{location}</Value>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr',
                rowGap: 6,
                columnGap: 10,
              }}
            >
              {/* <Label>Bank Details</Label> */}
              <Value>
                <div style={{ lineHeight: '18px' }}>
                  <div>
                    Bank Name: <b>{bankName}</b>
                  </div>
                  <div>
                    A/c: <b>{bankAcc}</b>
                  </div>
                  <div>
                    IFSC: <b>{ifsc}</b>
                  </div>
                </div>
              </Value>
              <div style={{ height: 10 }} />
            </div>
          </div>

          <Divider style={{ margin: '14px 0 10px 0' }} />

          {/* TABLE TITLE */}
          <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 13 }}>
            Details of Full &amp; Final Amount
          </div>

          <div style={{ marginTop: 8, border: '1px solid rgba(0,0,0,0.35)' }}>
            {/* header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1px 1fr 120px' }}>
              <Cell bold align="center" style={{ borderBottom: '1px solid rgba(0,0,0,0.35)' }}>
                Earnings &amp; Other Additions
              </Cell>
              <Cell bold align="center" style={{ borderBottom: '1px solid rgba(0,0,0,0.35)' }}>
                Rs.
              </Cell>

              <div style={{ background: 'rgba(0,0,0,0.35)' }} />

              <Cell bold align="center" style={{ borderBottom: '1px solid rgba(0,0,0,0.35)' }}>
                Deductions
              </Cell>
              <Cell bold align="center" style={{ borderBottom: '1px solid rgba(0,0,0,0.35)' }}>
                Rs.
              </Cell>
            </div>

            {/* rows (keep 10 minimum like paper) */}
            {Array.from({ length: Math.max(earnings.length, deductions.length, 10) }).map(
              (_, idx) => {
                const e = earnings[idx]
                const d = deductions[idx]

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 120px 1px 1fr 120px',
                      borderTop: idx === 0 ? 'none' : '1px solid rgba(0,0,0,0.15)',
                      minHeight: 26,
                    }}
                  >
                    <Cell style={e?.isInfo ? { color: '#333', fontStyle: 'italic' } : {}}>
                      {safe(e?.label, '')}
                    </Cell>
                    <Cell align="right">{e ? fmtMoney(e.amount) : ''}</Cell>

                    <div style={{ background: 'rgba(0,0,0,0.35)' }} />

                    <Cell>{safe(d?.label, '')}</Cell>
                    <Cell align="right">{d ? fmtMoney(d.amount) : ''}</Cell>
                  </div>
                )
              },
            )}

            {/* totals */}
            <RowLine />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1px 1fr 120px' }}>
              <Cell bold>Total</Cell>
              <Cell bold align="right">
                {fmtMoney(totalEarnings)}
              </Cell>

              <div style={{ background: 'rgba(0,0,0,0.35)' }} />

              <Cell bold>Total</Cell>
              <Cell bold align="right">
                {fmtMoney(totalDeductions)}
              </Cell>
            </div>
          </div>

          {/* Net payable */}
          <div style={{ marginTop: 10, fontSize: 12, lineHeight: '18px' }}>
            <div>
              <b>Net Payable</b> : Rs.&nbsp; <b>{fmtMoney(netPayable)}</b>&nbsp; {netPayableWords}
            </div>
          </div>

          {/* Prepared/Checked/Authorised */}
          <div
            style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}
          >
            <div style={{ fontSize: 12 }}>
              <span>Prepared by</span>
              <span
                style={{
                  display: 'inline-block',
                  marginTop: 18,
                  borderBottom: '1px solid rgba(0,0,0,0.55)',
                  width: '60%',
                  marginLeft: '0.3rem',
                }}
              />
            </div>

            <div style={{ fontSize: 12, textAlign: 'center' }}>
              <span>Checked by</span>
              <span
                style={{
                  // margin: '18px auto 0 auto',
                  borderBottom: '1px solid rgba(0,0,0,0.55)',
                  width: '60%',
                  marginTop: 18,
                  marginLeft: '0.3rem',
                  display: 'inline-block',
                }}
              />
            </div>

            <div style={{ fontSize: 12 }}>
              <span>Authorised by</span>
              <span
                style={{
                  marginTop: 18,
                  // marginLeft: 'auto',
                  borderBottom: '1px solid rgba(0,0,0,0.55)',
                  width: '60%',
                  display: 'inline-block',
                  marginLeft: '0.3rem',
                }}
              />
            </div>
          </div>

          {/* Declaration */}
          <div style={{ marginTop: 14 }}>
            <div
              style={{
                textAlign: 'center',
                fontWeight: 700,
                fontSize: 12,
                textDecoration: 'underline',
              }}
            >
              DECLARATION
            </div>

            <div style={{ marginTop: 10, fontSize: 12, lineHeight: '18px' }}>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {safe(
                  details?.declarationText,
                  `I, ${employeeName} do hereby certify that I have willingly and voluntarily resigned from the post of ${designation} w.e.f. ${fmtDate(
                    details?.dateOfLeaving,
                  )} and have received the full & final settlement of my account from the company.\nI further certify that nothing is due from the company on any account whatsoever.`,
                )}
              </div>
            </div>

            {/* Signature + date */}
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 260, fontSize: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <div style={{ width: 46 }}>Sign.</div>
                  <div style={{ flex: 1, borderBottom: '1px solid rgba(0,0,0,0.55)' }} />
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginTop: 10 }}>
                  <div style={{ width: 46 }}>Date</div>
                  <div style={{ flex: 1, borderBottom: '1px solid rgba(0,0,0,0.55)' }} />
                </div>
              </div>
            </div>

            {/* Name + Address */}
            <div style={{ marginTop: 14, fontSize: 12 }}>
              <div
                style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 10, width: '60%' }}
              >
                <div>Name of Employee</div>
                <div>{employeeName}</div>
                <div>Address</div>
                <div>{safe(details?.address, '')}</div>
              </div>
            </div>
          </div>

          <div style={{ height: 10 }} />
        </div>
      </div>
    </Modal>
  )
}

export default FNF_Pdf
