// IncrementLetterTemplate.jsx

import { Modal, Divider, Button, Space, message } from 'antd'
import { DownloadOutlined, EditOutlined } from '@ant-design/icons'
import { useMemo, useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'
import dayjs from 'dayjs'

import company_logo from '../../assets/images/V2-Logo-1.png'

import abhishek_kumar_sign from '../../assets/images/sign_new/abhishek_kumar.png'
import khushboo_sign from '../../assets/images/sign_new/khushboo.png'
import narad_sah_sign from '../../assets/images/sign_new/nadad_sah.png'
import ruchi_sign from '../../assets/images/sign_new/ruchi.png'
import sakshi_sign from '../../assets/images/sign_new/sakshi.png'
import nikhil_chhokra_sign from '../../assets/images/sign_new/nikhil_chhokra.png'

// ✅ Map HR value -> signature
const SIGNATURE_BY_HR = {
  abhishek_kumar: { label: 'Abhishek Kumar', img: abhishek_kumar_sign },
  khushboo: { label: 'Khusboo Jha', img: khushboo_sign },
  narad_sah: { label: 'Narad Sah', img: narad_sah_sign },
  ruchi: { label: 'Ruchi Dubey', img: ruchi_sign },
  sakshi: { label: 'Sakshi', img: sakshi_sign },
  nikhil_chhokra: { label: 'Nikhil Chhokra', img: nikhil_chhokra_sign },
}

// If details.hrName comes as label text
const HR_KEY_BY_LABEL = {
  'Abhishek Kumar': 'abhishek_kumar',
  'Khusboo Jha': 'khushboo',
  'Narad Sah': 'narad_sah',
  'Ruchi Dubey': 'ruchi',
  Sakshi: 'sakshi',
  'Nikhil Chhokra': 'nikhil_chhokra',
}

const safe = (v, fallback = '-') => (v === null || v === undefined || v === '' ? fallback : v)

const fmtDateDMY = (d) => {
  if (!d) return '-'
  const parsed = dayjs(d)
  return parsed.isValid() ? parsed.format('DD-MM-YYYY') : String(d)
}

// Ref format in image: generated date/month/ecode (only numbers) => DD/MM/EmpCodeDigits
// If empCode has letters, we strip non-digits to keep only numbers
const buildRefNumber = ({ expGenerationDate, empCode }) => {
  const dt = dayjs(expGenerationDate)
  const ddmm = dt.isValid() ? dt.format('DD/MM') : '--/--'
  const onlyDigits = String(empCode ?? '').replace(/\D+/g, '') || '0'
  return `${ddmm}/${onlyDigits}`
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

const underlineText = (t) => (
  <span style={{ fontWeight: 700, textDecoration: 'underline' }}>{t}</span>
)

const IncrementLetterTemplate = ({
  isModalOpen,
  handleCancel,
  details = {},
  setIsIncrementModalOpen,
}) => {
  const paperRef = useRef(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const hrKey =
    details?.hrName && SIGNATURE_BY_HR[details.hrName]
      ? details.hrName
      : HR_KEY_BY_LABEL[details?.hrName] || null

  const signConfig = hrKey ? SIGNATURE_BY_HR[hrKey] : null

  const employeeName = safe(details?.empName)
  const empCode = safe(details?.empCode)
  const generationDate = fmtDateDMY(details?.expGenerationDate)
  const effectiveDate = fmtDateDMY(details?.effectiveDate)
  const incrementAmount = details?.incrementAmount ?? '-'

  const refNo = buildRefNumber({ expGenerationDate: details?.expGenerationDate, empCode })

  const fileName = useMemo(() => {
    const code = empCode !== '-' ? empCode : 'EMP'
    const name = employeeName !== '-' ? employeeName.replace(/\s+/g, '_') : 'NAME'
    return `Increment_Letter_${code}_${name}.pdf`
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

      const imgWidthPx = img.width
      const imgHeightPx = img.height

      const imgWidthMm = printableWidth
      const imgHeightMm = (imgHeightPx * imgWidthMm) / imgWidthPx

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

  const handleOpenIncModal = () => {
    handleCancel()
    setIsIncrementModalOpen(true)
  }

  return (
    <Modal
      title="Increment Letter"
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
      centered
      destroyOnClose={false}
      width="min(1020px, 96vw)"
      bodyStyle={{ background: '#f5f5f5', padding: 12 }}
    >
      <Space
        style={{ width: '100%', justifyContent: 'flex-end', marginBottom: 12, flexWrap: 'wrap' }}
      >
        <Button icon={<EditOutlined />} onClick={handleOpenIncModal} />
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
            width: 'min(780px, 100%)',
            margin: '0 auto',
            background: '#fff',
            padding: 'clamp(14px, 3vw, 36px) clamp(12px, 4vw, 48px)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
            borderRadius: 6,
            fontFamily: 'Times New Roman, Times, serif', // closer to the photo
            color: '#111',
          }}
        >
          {/* HEADER (keep same logo + company name like your current component) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <img
              src={company_logo}
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
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: 0.3,
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

          {/* TOP REF + DATED (as in photo) */}
          <div style={{ fontSize: 13, lineHeight: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: 320 }}>
                <span style={{ fontWeight: 600 }}>Ref.:</span>{' '}
                <span style={{ fontWeight: 700 }}>{refNo}</span>
              </div>

              <div style={{ whiteSpace: 'nowrap' }}>
                <span style={{ fontWeight: 600 }}>Dated:</span> <span>{generationDate}</span>
              </div>
            </div>
          </div>

          {/* BODY like photo */}
          <div style={{ marginTop: 28, fontSize: 14, lineHeight: '24px' }}>
            <div>To,</div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>{employeeName}</div>
              <div>Emp. Code – {empCode}</div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div>
                <span style={{ fontWeight: 600 }}>Sub:</span> {underlineText('Letter of Increment')}
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div>Dear {employeeName},</div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div>
                With reference to the assessment, we are pleased to increase Rs.&nbsp;
                <span style={{ fontWeight: 700 }}>{safe(incrementAmount, '_____')}</span>
                &nbsp;in your monthly gross salary with effect from&nbsp;
                <span style={{ fontWeight: 700 }}>{safe(effectiveDate, '_____')}</span>.
              </div>

              <div style={{ marginTop: 16 }}>
                We hope that you will strive to give your best by enhancing your skills to meet
                organizations goals.
              </div>

              <div style={{ marginTop: 16 }}>
                You are requested to keep your salary matters highly confidential.
              </div>
            </div>

            {/* SIGN-OFF (as in photo) */}
            <div style={{ marginTop: 34 }}>
              <div style={{ fontWeight: 700 }}>For V2 RETAIL LTD</div>

              <div style={{ height: 48 }} />

              <div style={{ minWidth: 240 }}>
                {signConfig?.img ? (
                  <img
                    src={signConfig.img}
                    alt="Signature"
                    style={{ height: 56, objectFit: 'contain', display: 'block' }}
                  />
                ) : (
                  <div style={{ height: 56 }} />
                )}

                <div style={{ fontSize: 12, marginTop: 6 }}>(Authorized Signatory)</div>
                <div style={{ fontSize: 12, marginTop: 2, color: '#444' }}>
                  {signConfig?.label || safe(details?.hrName, '')}
                </div>
              </div>
            </div>
          </div>

          {/* bottom padding for PDF */}
          <div style={{ height: 10 }} />
        </div>
      </div>
    </Modal>
  )
}

export default IncrementLetterTemplate
