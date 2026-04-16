// RelievingModalTemplate.jsx

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

const ordinal = (n) => {
  const num = Number(n)
  if (!Number.isFinite(num)) return ''
  const mod100 = num % 100
  if (mod100 >= 11 && mod100 <= 13) return 'th'
  switch (num % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

// 13th Jan, 2026 (matches photo style)
const fmtDateWithOrdinal = (d) => {
  if (!d) return '-'
  const dt = dayjs(d)
  if (!dt.isValid()) return String(d)
  const day = dt.date()
  return `${day}${ordinal(day)} ${dt.format('MMM, YYYY')}`
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

const Bold = ({ children }) => <span style={{ fontWeight: 700 }}>{children}</span>

const RelievingModalTemplate = ({
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
  const designation = safe(details?.designation)
  const generationDate = fmtDateWithOrdinal(details?.expGenerationDate)

  const lastWorkingDayRaw =
    details?.lastWorkingDay ||
    details?.lastWorkingDate ||
    details?.lastWorking ||
    details?.effectiveDate

  const lastWorkingDay =
    lastWorkingDayRaw && dayjs(lastWorkingDayRaw).isValid()
      ? dayjs(lastWorkingDayRaw).format('DD-MM-YYYY')
      : safe(lastWorkingDayRaw, '[Last Working Day]')

  const empCode = safe(details?.empCode)

  const fileName = useMemo(() => {
    const code = empCode !== '-' ? empCode : 'EMP'
    const name = employeeName !== '-' ? employeeName.replace(/\s+/g, '_') : 'NAME'
    return `Relieving_Letter_${code}_${name}.pdf`
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
      title="Relieving Letter"
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
            fontFamily: 'Times New Roman, Times, serif',
            color: '#111',
            minHeight: '940px', // helps match the photo spacing
          }}
        >
          {/* ✅ KEEP SAME HEADER */}
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

          {/* ✅ TOP LINE LIKE PHOTO: left label + right date */}
          <div style={{ display: 'flex', justifyContent: 'end', fontSize: 14, marginTop: 2 }}>
            <div>{generationDate}</div>
          </div>

          {/* ✅ TITLE CENTER UNDERLINED */}
          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <div style={{ fontSize: 28, fontWeight: 700, textDecoration: 'underline' }}>
              Relieving Letter
            </div>
          </div>

          {/* ✅ BODY (center block, similar spacing) */}
          <div
            style={{
              marginTop: 68,
              fontSize: 16,
              lineHeight: '30px',
              paddingLeft: 32,
              paddingRight: 32,
            }}
          >
            <p style={{ margin: 0 }}>
              This is to inform that{' '}
              <Bold>
                Mr./Ms.&nbsp; {employeeName} ({designation})
              </Bold>{' '}
              has been relieved from the services of <Bold>V2 Retail Ltd.</Bold> with effect from{' '}
              <Bold>[{lastWorkingDay}]</Bold>, pursuant to his/her resignation.
            </p>

            <p style={{ margin: '22px 0 0 0' }}>
              He/She has completed the handover of duties and responsibilities as per company
              policy.
            </p>

            <p style={{ margin: '18px 0 0 0' }}>
              We wish him/her all the best for future endeavors.
            </p>

            {/* ✅ SIGN-OFF placement like photo */}
            <div style={{ marginTop: 64 }}>
              <div style={{ fontWeight: 700 }}>For V2 RETAIL LTD</div>
            </div>

            {/* signature gap */}
            <div style={{ height: 88 }} />

            <div style={{ minWidth: 260 }}>
              {signConfig?.img ? (
                <img
                  src={signConfig.img}
                  alt="Signature"
                  style={{ height: 56, objectFit: 'contain', display: 'block' }}
                />
              ) : (
                <div style={{ height: 56 }} />
              )}

              <div style={{ marginTop: 8 }}>(Authorized Signatory)</div>
              <div style={{ fontSize: 12, marginTop: 4, color: '#444' }}>
                {signConfig?.label || safe(details?.hrName, '')}
              </div>
            </div>
          </div>

          {/* bottom padding */}
          <div style={{ height: 12 }} />
        </div>
      </div>
    </Modal>
  )
}

export default RelievingModalTemplate
