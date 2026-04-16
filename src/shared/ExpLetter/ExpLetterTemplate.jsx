// import { Modal, Divider, Button, Space, message } from 'antd'
// import { DownloadOutlined, EditOutlined } from '@ant-design/icons'
// import { useMemo, useRef } from 'react'
// import { toPng } from 'html-to-image'
// import jsPDF from 'jspdf'
// import dayjs from 'dayjs'
// import './style.css'

// import company_logo from '../../assets/images/V2-Logo-1.png'
// import company_stamp from '../../assets/brand/comapny_stamp.png'

// import abhishek_kumar_sign from '../../assets/images/sign_new/abhishek_kumar.png'
// import khushboo_sign from '../../assets/images/sign_new/khushboo.png'
// import narad_sah_sign from '../../assets/images/sign_new/nadad_sah.png'
// import ruchi_sign from '../../assets/images/sign_new/ruchi.png'
// import sakshi_sign from '../../assets/images/sign_new/sakshi.png'
// import nikhil_chhokra_sign from '../../assets/images/sign_new/nikhil_chhokra.png'

// // ✅ Map HR value -> signature
// const SIGNATURE_BY_HR = {
//   abhishek_kumar: { label: 'Abhishek Kumar', img: abhishek_kumar_sign },
//   khushboo: { label: 'Khusboo Jha', img: khushboo_sign },
//   narad_sah: { label: 'Narad Sah', img: narad_sah_sign },
//   ruchi: { label: 'Ruchi Dubey', img: ruchi_sign },
//   sakshi: { label: 'Sakshi', img: sakshi_sign },
//   nikhil_chhokra: { label: 'Nikhil Chhokra', img: nikhil_chhokra_sign },
// }

// // If details.hrName comes as label text
// const HR_KEY_BY_LABEL = {
//   'Abhishek Kumar': 'abhishek_kumar',
//   'Khusboo Jha': 'khushboo',
//   'Narad Sah': 'narad_sah',
//   'Ruchi Dubey': 'ruchi',
//   Sakshi: 'sakshi',
//   'Nikhil Chhokra': 'nikhil_chhokra',
// }

// const safe = (v, fallback = '-') => (v === null || v === undefined || v === '' ? fallback : v)

// const fmtDate = (d) => {
//   if (!d) return '-'
//   const parsed = dayjs(d)
//   return parsed.isValid() ? parsed.format('DD-MM-YYYY') : String(d)
// }

// const fmtLongDate = (d) => {
//   if (!d) return '-'
//   const parsed = dayjs(d)
//   return parsed.isValid() ? parsed.format('DD MMM, YYYY') : String(d)
// }

// const Highlight = ({ children }) => (
//   <span
//     style={{
//       background: '#fff59d',
//       padding: '0 4px',
//       borderRadius: 2,
//       fontWeight: 700,
//       display: 'inline-block',
//     }}
//   >
//     {children}
//   </span>
// )

// // Clone helper for Download PDF (do not touch UI)
// const createHiddenClone = (node) => {
//   const clone = node.cloneNode(true)

//   const wrapper = document.createElement('div')
//   wrapper.style.position = 'fixed'
//   wrapper.style.left = '-99999px'
//   wrapper.style.top = '0'
//   wrapper.style.background = '#fff'
//   wrapper.style.width = '210mm'

//   // A4 page container (NO outer padding)
//   clone.style.width = '210mm'
//   clone.style.height = '297mm'
//   clone.style.minHeight = 'unset'
//   clone.style.margin = '0'
//   clone.style.padding = '0'              // ✅ add
//   clone.style.boxShadow = 'none'
//   clone.style.borderRadius = '0'
//   clone.style.background = '#fff'
//   clone.style.boxSizing = 'border-box'   // ✅ add
//   clone.style.overflow = 'hidden'        // ✅ add (prevents extra white area)

//   // ✅ kill any default print margins if your template uses them
//   clone.querySelectorAll('*').forEach((el) => {
//     el.style.boxSizing = 'border-box'
//   })

//   wrapper.appendChild(clone)
//   document.body.appendChild(wrapper)

//   return { wrapper, clone }
// }

// const removeHiddenClone = (wrapper) => {
//   try {
//     if (wrapper?.parentNode) wrapper.parentNode.removeChild(wrapper)
//   } catch {}
// }

// const ExpLetterTemplate = ({ isModalOpen, handleCancel, details = {}, setIsExpModalOpen }) => {
//   const paperRef = useRef(null)
//   const PRINT_ID = 'exp-letter-print-area'

//   const hrKey =
//     details?.hrName && SIGNATURE_BY_HR[details.hrName]
//       ? details.hrName
//       : HR_KEY_BY_LABEL[details?.hrName] || null

//   const signConfig = hrKey ? SIGNATURE_BY_HR[hrKey] : null

//   const employeeName = safe(details?.empName)
//   const empCode = safe(details?.empCode)
//   const department = safe(details?.department)
//   const designation = safe(details?.designation)

//   const joiningDate = fmtDate(details?.joiningDate)
//   const lastWorkingDay = fmtDate(details?.lastWorkingDay || details?.lastWorkingDate)
//   const generationDate = fmtLongDate(details?.expGenerationDate)

//   const fileName = useMemo(() => {
//     const code = empCode !== '-' ? empCode : 'EMP'
//     const name = employeeName !== '-' ? employeeName.replace(/\s+/g, '_') : 'NAME'
//     return `Experience_Letter_${code}_${name}.pdf`
//   }, [empCode, employeeName])

//   const handleDownloadPdf = async () => {
//     let wrapper
//     try {
//       if (!paperRef.current) return
//       if (document.fonts?.ready) await document.fonts.ready

//       const { wrapper: w, clone } = createHiddenClone(paperRef.current)
//       wrapper = w

//       await new Promise((r) => requestAnimationFrame(r))

//       const dataUrl = await toPng(clone, {
//         cacheBust: true,
//         pixelRatio: 2,
//         backgroundColor: '#ffffff',
//       })

//       const pdf = new jsPDF('p', 'mm', 'a4')
//       const pageWidth = pdf.internal.pageSize.getWidth()
//       const pageHeight = pdf.internal.pageSize.getHeight()

//       const margin = 0
//       const printableWidth = pageWidth - margin * 2
//       const printableHeight = pageHeight - margin * 2

//       const img = new Image()
//       img.src = dataUrl
//       await new Promise((res, rej) => {
//         img.onload = res
//         img.onerror = rej
//       })

//       const imgWidthMm = printableWidth
//       const imgHeightMm = (img.height * imgWidthMm) / img.width

//       // ✅ If it fits in 1 page (with tiny tolerance), DO NOT add page 2
//       const EPS = 0.8 // mm tolerance to kill rounding-based blank pages
//       if (imgHeightMm <= printableHeight + EPS) {
//         pdf.addImage(dataUrl, 'PNG', margin, margin, imgWidthMm, imgHeightMm)
//         pdf.save(fileName)
//         return
//       }

//       // ✅ Multi-page only when truly needed
//       let heightLeft = imgHeightMm
//       let position = margin

//       pdf.addImage(dataUrl, 'PNG', margin, position, imgWidthMm, imgHeightMm)
//       heightLeft -= printableHeight

//       while (heightLeft > EPS) {
//         pdf.addPage()
//         position = margin - (imgHeightMm - heightLeft)
//         pdf.addImage(dataUrl, 'PNG', margin, position, imgWidthMm, imgHeightMm)
//         heightLeft -= printableHeight
//       }

//       pdf.save(fileName)
//     } catch (err) {
//       console.error(err)
//       message.error('Failed to generate PDF')
//     } finally {
//       removeHiddenClone(wrapper)
//     }
//   }

//   const handleOpenExpModal = () => {
//     handleCancel()
//     setIsExpModalOpen(true)
//   }

//   return (
//     <Modal
//       title="Experience Letter"
//       open={isModalOpen}
//       footer={null}
//       onCancel={handleCancel}
//       centered
//       destroyOnClose={false}
//       width="min(1020px, 96vw)"
//       bodyStyle={{ background: '#f5f5f5', padding: 12 }}
//     >
//       {/* ✅ Print CSS: prevents “congested” printing */}
//       <style>
//         {`
//           @page { size: A4; margin: 0; }
//           @media print {
//             body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//             body * { visibility: hidden !important; }
//             #${PRINT_ID}, #${PRINT_ID} * { visibility: visible !important; }
//             #${PRINT_ID} {
//               position: absolute !important;
//               left: 0 !important;
//               top: 0 !important;
//               width: 210mm !important;
//               min-height: 297mm !important;
//               box-shadow: none !important;
//               border-radius: 0 !important;
//               margin: 0 !important;
//             }
//           }
//         `}
//       </style>

//       <Space
//         style={{ width: '100%', justifyContent: 'flex-end', marginBottom: 12, flexWrap: 'wrap' }}
//       >
//         <Button icon={<EditOutlined />} onClick={handleOpenExpModal} />
//         <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadPdf}>
//           Download PDF
//         </Button>
//       </Space>

//       <div style={{ overflowX: 'auto' }}>
//         {/* ✅ A4 page container */}
//         <div
//           id={PRINT_ID}
//           ref={paperRef}
//           // style={{
//           //   width: 'min(780px, 100%)',
//           //   margin: '0 auto',
//           //   background: '#fff',
//           //   boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
//           //   borderRadius: 6,
//           //   fontFamily: 'Arial, sans-serif',
//           //   color: '#111',
//           //   position: 'relative',
//           //   boxSizing: 'border-box',
//           //   minHeight: '297mm',
//           //   paddingTop: '14mm',
//           //   paddingInline: '16mm',
//           //   paddingBottom: '55mm',
//           // }}
//           className='exp-page'
//         >
//           {/* HEADER */}
//           <div
//             // style={{
//             //   display: 'flex',
//             //   justifyContent: 'space-between',
//             //   alignItems: 'center',
//             //   gap: 12,
//             // }}
//             className='exp-header'
//           >
//             <img
//               src={company_logo}
//               alt="Company Logo"
//               style={{
//                 width: 'clamp(96px, 22vw, 140px)',
//                 height: 'clamp(34px, 6vw, 48px)',
//                 objectFit: 'contain',
//                 maxWidth: '45%',
//               }}
//             />

//             <div style={{ textAlign: 'right', maxWidth: '55%' }}>
//               <div
//                 style={{
//                   fontSize: 'clamp(16px, 4vw, 22px)',
//                   fontWeight: 500,
//                   lineHeight: 1.1,
//                   whiteSpace: 'nowrap',
//                 }}
//               >
//                 V2 Retail Limited
//               </div>
//             </div>
//           </div>

//           {/* ✅ bolder divider */}
//           <Divider style={{ borderTopWidth: 1.6, borderTopColor: '#111', margin: '10px 0' }} />

//           {/* DATE */}
//           <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 12 }}>
//             {generationDate}
//           </div>

//           {/* TITLE */}
//           <div style={{ textAlign: 'center', marginTop: 18 }}>
//             <div
//               style={{
//                 fontSize: 15,
//                 fontWeight: 800,
//                 textTransform: 'uppercase',
//                 textDecoration: 'underline',
//                 letterSpacing: 0.5,
//               }}
//             >
//               TO WHOMSOEVER IT MAY CONCERN
//             </div>
//           </div>

//           {/* BODY */}
//           <div style={{ marginTop: 18, fontSize: 13, lineHeight: '22px' }}>
//             <p style={{ margin: '0 0 10px 0' }}>
//               This is to certify that{' '}
//               <b>
//                 {employeeName} ({empCode})
//               </b>{' '}
//               was working in this organization as{' '}
//               <b>
//                 {designation} ({department})
//               </b>
//               . She joined us on <b>{joiningDate}</b> (joining date) and served till{' '}
//               <b>{lastWorkingDay}</b> (last working day).
//             </p>

//             <p style={{ margin: '0 0 10px 0' }}>She is sincere, Dedicated, Hardworking person.</p>

//             <p style={{ margin: '0 0 10px 0' }}>
//               We take this opportunity to express our sincere appreciation for the valuable
//               contribution during the association with our organization and we wish her all the best
//               in her future endeavors.
//             </p>

//             <p style={{ margin: '0 0 10px 0' }}>
//               She has resigned from the service and relieved from all duties and responsibilities
//               with effect from <b>{lastWorkingDay}</b> (last working day).
//             </p>

//             <p style={{ margin: 0 }}>We wish her all the very best for a bright future.</p>
//           </div>

//           {/* SIGNATURE + STAMP */}
//           <div style={{ marginTop: 50 }}>
//             <div style={{ fontWeight: 700, fontSize: 13 }}>For V2 RETAIL LIMITED</div>

//             <div style={{ height: 58 }} />

//             <div style={{ position: 'relative', width: 320 }}>
//               {/* ✅ Stamp (top-right of signature area) */}
//               <img
//                 src={company_stamp}
//                 alt="Company Stamp"
//                 style={{
//                   position: 'absolute',
//                   right: 200,
//                   top: -16,
//                   height: 76,
//                   width: 'auto',
//                   opacity: 0.95,
//                   pointerEvents: 'none',
//                   userSelect: 'none',
//                 }}
//               />

//               {signConfig?.img ? (
//                 <img
//                   src={signConfig.img}
//                   alt="Signature"
//                   style={{ height: 56, objectFit: 'contain', display: 'block' }}
//                 />
//               ) : (
//                 <div style={{ height: 56 }} />
//               )}

//               <div style={{ fontSize: 12, marginTop: 6 }}>(Authorized Signatory)</div>
//               <div style={{ fontSize: 12, marginTop: 2, color: '#666' }}>
//                 {signConfig?.label || safe(details?.hrName, '')}
//               </div>
//             </div>
//           </div>

//           {/* ✅ Footer fixed to bottom of page */}
//           <div
//             style={{
//               position: 'absolute',
//               left: '16mm',
//               right: '16mm',
//               bottom: '14mm',
//               textAlign: 'center',
//               fontSize: 11,
//               lineHeight: '16px',
//             }}
//           >
//             <div style={{ borderTop: '2px solid #333', marginBottom: 8 }} />

//             <div>
//               <b>Reg. Off.</b> Khasra No. 928, Extended Lal Dora Abadi Village Kapashera, Tehsil
//               Vasant Vihar, South West Delhi, Delhi - 110037
//             </div>
//             <div>
//               <b>Corporate Off.</b> 2nd Floor, 13, Sub. Major Laxmi Chand Rd, Maruti Udyog, Sector
//               18, Gurugram, Sarhol, Haryana 122015
//             </div>

//             <div style={{ marginTop: 4 }}>
//               <b>Email:</b>{' '}
//               <span style={{ textDecoration: 'underline' }}>customercare@vrl.net.in</span>
//               &nbsp;&nbsp; <b>Website:</b>{' '}
//               <span style={{ textDecoration: 'underline' }}>www.v2retail.com</span>
//             </div>

//             <div style={{ marginTop: 2 }}>
//               <b>CIN:</b> L74999DL2001PLC147724 &nbsp;&nbsp; <b>Tel:</b> 011-41771850
//             </div>
//           </div>
//         </div>
//       </div>
//     </Modal>
//   )
// }

// export default ExpLetterTemplate

// ExpLetterTemplate.jsx
// Complete page (template + CSS + download logic) that produces "Image 1" style:
// - Divider lines touch left/right edges (full-bleed)
// - Text has nice inner padding
// - Footer sits near bottom with small padding
// - PDF has NO extra margins / no bottom white gap

import React, { useMemo, useRef } from 'react'
import { Modal, Button, Space, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'

/** ---- helpers: hidden A4 clone ---- **/
const createHiddenClone = (node) => {
  const clone = node.cloneNode(true)

  const wrapper = document.createElement('div')
  wrapper.style.position = 'fixed'
  wrapper.style.left = '-99999px'
  wrapper.style.top = '0'
  wrapper.style.background = '#fff'
  wrapper.style.width = '210mm'
  wrapper.style.height = '297mm'
  wrapper.style.overflow = 'hidden'
  wrapper.style.zIndex = '-1'

  // Force exact A4, no padding/margins on outer page
  clone.style.width = '210mm'
  clone.style.height = '297mm'
  clone.style.minHeight = 'unset'
  clone.style.margin = '0'
  clone.style.padding = '0'
  clone.style.boxShadow = 'none'
  clone.style.borderRadius = '0'
  clone.style.background = '#fff'
  clone.style.boxSizing = 'border-box'
  clone.style.overflow = 'hidden'

  // Make box sizing consistent (prevents layout growth in clone)
  clone.querySelectorAll('*').forEach((el) => {
    el.style.boxSizing = 'border-box'
  })

  wrapper.appendChild(clone)
  document.body.appendChild(wrapper)

  return { wrapper, clone }
}

const removeHiddenClone = (wrapper) => {
  try {
    if (wrapper?.parentNode) wrapper.parentNode.removeChild(wrapper)
  } catch {}
}

/** ---- Component ---- **/
const ExpLetterTemplate = ({ isModalOpen, handleCancel, details = {}, setIsExpModalOpen }) => {
  const paperRef = useRef(null)

  const fileName = useMemo(() => {
    const emp = (details?.empName || 'employee').replace(/\s+/g, '_')
    return `Experience_Letter_${emp}.pdf`
  }, [details?.empName])

  const handleDownloadPdf = async () => {
    let wrapper
    try {
      if (!paperRef.current) return
      if (document.fonts?.ready) await document.fonts.ready

      const { wrapper: w, clone } = createHiddenClone(paperRef.current)
      wrapper = w

      // wait one frame to ensure layout
      await new Promise((r) => requestAnimationFrame(r))

      // render DOM -> PNG
      const dataUrl = await toPng(clone, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      })

      // Create A4 PDF with 0 margins and render image EXACTLY to full page
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // ✅ Key fix: no proportional scaling math; fill whole A4
      pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, pageHeight)
      pdf.save(fileName)
    } catch (err) {
      console.error(err)
      message.error('Failed to generate PDF')
    } finally {
      removeHiddenClone(wrapper)
      setIsExpModalOpen?.(false)
    }
  }

  return (
    <Modal
      title="Experience Letter Preview"
      open={isModalOpen}
      onCancel={handleCancel}
      centered
      width={900}
      footer={null}
      destroyOnClose
    >
      {/* CSS in-page so clone gets same styling */}
      <style>{`
        /* Outer page: full-bleed (dividers touch edges) */
        .exp-page {
          width: 210mm;
          height: 297mm;
          background: #fff;
          padding: 0;
          margin: 0;
          position: relative;
          overflow: hidden;
          font-family: Arial, sans-serif;
          color: #000;
          box-sizing: border-box;
        }

        /* Inner padding for text blocks */
        .exp-inner {
          padding: 0 12mm;
        }

        /* Header divider should touch edges */
        .exp-header {
          width: 100%;
          padding-top: 8mm;
          border-bottom: 1px solid #000;
        }

        .exp-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10mm;
          padding-bottom: 6mm;
        }

        .exp-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 14px;
        }

        .exp-logo {
          width: 42px;
          height: 42px;
          border: 1px solid #ddd;
          display: grid;
          place-items: center;
          font-size: 12px;
          font-weight: 700;
        }

        .exp-company {
          font-size: 18px;
          font-weight: 700;
          text-align: right;
        }

        /* Body area: leave space for footer */
        .exp-body {
          padding-top: 8mm;
          padding-bottom: 24mm; /* reserve for footer */
          font-size: 12px;
          line-height: 1.45;
        }

        .exp-title {
          font-weight: 700;
          text-align: center;
          letter-spacing: 0.4px;
          margin: 0 0 10mm 0;
          text-transform: uppercase;
          text-decoration: underline;
        }

        .exp-date {
          text-align: right;
          margin-bottom: 6mm;
          font-size: 12px;
        }

        .exp-paragraph {
          margin: 0 0 4mm 0;
        }

        .exp-sign {
          margin-top: 18mm;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 12mm;
        }

        .exp-sign-block {
          min-width: 70mm;
        }

        .exp-sign-label {
          margin-top: 14mm;
          border-top: 1px solid #000;
          padding-top: 2mm;
          font-size: 11px;
          font-weight: 600;
        }

        /* Footer divider should touch edges and be close to bottom */
        .exp-footer {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          border-top: 1px solid #000; /* full-bleed divider */
          padding-bottom: 4mm;        /* small bottom margin like image 1 */
          padding-top: 3mm;
          font-size: 10px;
          line-height: 1.35;
        }

        .exp-footer-row {
          display: flex;
          justify-content: space-between;
          gap: 10mm;
          flex-wrap: wrap;
        }

        /* Preview container (optional) */
        .preview-wrap {
          display: flex;
          justify-content: center;
          padding: 12px 0 0;
        }

        .preview-shadow {
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          border-radius: 8px;
          overflow: hidden;
        }
      `}</style>

      <Space style={{ width: '100%', justifyContent: 'end', marginBottom: 12 }}>
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadPdf}>
          Download PDF
        </Button>
      </Space>

      <div className="preview-wrap">
        <div className="preview-shadow">
          {/* ---- A4 PAGE ---- */}
          <div ref={paperRef} className="exp-page">
            {/* HEADER (full bleed divider) */}
            <div className="exp-header">
              <div className="exp-inner">
                <div className="exp-header-row">
                  <div className="exp-brand">
                    <div className="exp-logo">v2</div>
                    <div>Value & Variety</div>
                  </div>
                  <div className="exp-company">V2 Retail Limited</div>
                </div>
              </div>
            </div>

            {/* BODY */}
            <div className="exp-body exp-inner">
              <div className="exp-date">{details?.expGenerationDate || '19 Feb, 2026'}</div>

              <div className="exp-title">TO WHOMSOEVER IT MAY CONCERN</div>

              <p className="exp-paragraph">
                This is to certify that{' '}
                <b>
                  {details?.empName || 'Employee Name'} ({details?.empCode || 'CT0000'})
                </b>{' '}
                was working in this organization as <b>{details?.designation || 'Designation'}</b> (
                {details?.department || 'Department'}).{' '}
                {details?.gender === 'Female' ? 'She' : 'He'} joined us on{' '}
                <b>{details?.joiningDate || 'DD-MM-YYYY'}</b> and served till{' '}
                <b>{details?.lastWorkingDate || 'DD-MM-YYYY'}</b> (last working day).
              </p>

              <p className="exp-paragraph">
                {details?.gender === 'Female' ? 'She' : 'He'} is sincere, dedicated and hardworking
                person.
              </p>

              <p className="exp-paragraph">
                We take this opportunity to express our sincere appreciation for the valuable
                contribution during the association with our organization and we wish{' '}
                {details?.gender === 'Female' ? 'her' : 'him'} all the best in the future endeavors.
              </p>

              <p className="exp-paragraph">
                {details?.gender === 'Female' ? 'She' : 'He'} has resigned from the service and
                relieved from all duties and responsibilities with effect from (last working day).
              </p>

              <p className="exp-paragraph">
                We wish {details?.gender === 'Female' ? 'her' : 'him'} all the very best for a
                bright future.
              </p>

              <div style={{ marginTop: '10mm', fontWeight: 700 }}>For V2 Retail Limited</div>

              {/* SIGNATURES */}
              <div className="exp-sign">
                <div className="exp-sign-block">
                  {/* optional stamp/sign image area */}
                  <div style={{ height: '20mm' }} />
                  <div className="exp-sign-label">(Authorized Signatory)</div>
                  <div style={{ fontSize: 11, marginTop: 2 }}>{details?.hrName || 'HR Name'}</div>
                </div>

                <div className="exp-sign-block" style={{ textAlign: 'right' }}>
                  <div style={{ height: '20mm' }} />
                  <div className="exp-sign-label">Signature of the candidate</div>
                </div>
              </div>
            </div>

            {/* FOOTER (full bleed divider, small bottom padding) */}
            <div className="exp-footer">
              <div className="exp-inner">
                <div className="exp-footer-row">
                  <div>
                    <b>Reg. off.:</b> Khasra No. 928, Extended Lal Dora Abadi Village Kapashera,
                    Tehsil Vasant Vihar, South West Delhi, Delhi - 110037
                  </div>
                  <div>
                    <b>Corporate Off.:</b> 2nd Floor, 13, Sub. Major Laxmi Chand Rd, Maruti Udyog,
                    Sector 18, Gurugram, Sarhol, Haryana 122015
                  </div>
                </div>
                <div style={{ marginTop: '2mm' }}>
                  <b>E-mail:</b> customercare@vrl.net.in &nbsp;&nbsp; <b>Website:</b>{' '}
                  www.v2retail.com &nbsp;&nbsp; <b>Tel:</b> 011-41771850
                </div>
              </div>
            </div>
          </div>
          {/* ---- /A4 PAGE ---- */}
        </div>
      </div>
    </Modal>
  )
}

export default ExpLetterTemplate
