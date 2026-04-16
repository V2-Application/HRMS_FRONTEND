import React, { useRef } from 'react'
import { Typography, Divider, Button, Table, Descriptions, message, Tooltip } from 'antd'
import html2pdf from 'html2pdf.js'
import logo from '../../assets/images/V2-Logo-1.png'
import Abhishek_kumar from '../../assets/images/sign_new/abhishek_kumar.png'
import khushboo from '../../assets/images/sign_new/khushboo.png'
import nadad_sah from '../../assets/images/sign_new/nadad_sah.png'
import ruchi from '../../assets/images/sign_new/ruchi.png'
import sakshi from '../../assets/images/sign_new/sakshi.png'
import nikhil_chhokra from '../../assets/images/sign_new/nikhil_chhokra.png'

import arun_nardia from '../../assets/images/sign_new/arun_nardia.png'
import khushal from '../../assets/images/sign_new/khushal.png'
import mohit_singhal from '../../assets/images/sign_new/mohit_singhal.png'

import stamp from '../../assets/images/stamp.png'
import numberToWords from '@jstb/num-to-words-indian'
import { useDispatch, useSelector } from 'react-redux'
import { uploadOfferLetter } from '../../services/Services'
import { set } from '../../redux/uiSlice'
import { DownOutlined, EditOutlined, SaveOutlined, PrinterOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

const OfferLetterTemplate = ({
  offerData,
  setshowTemplate,
  setofferLetterModels,
  ApplicationListData,
}) => {
  const {
    candidateName,
    position,
    email,
    joiningDate,
    offerDate,
    id,
    hrName,
    reportingManager,
    salaryDetails,
    department,
    isBonusApplicable, // ✅ IMPORTANT (boolean)
  } = offerData || {}

  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.ui)

  let hrimage = null
  let zonalhead = null

  if (hrName === 'Nikhil Chhokra') hrimage = nikhil_chhokra
  else if (hrName === 'Ruchi Dubey') hrimage = ruchi
  else if (hrName === 'Abhishek Kumar') hrimage = Abhishek_kumar
  else if (hrName === 'Khushboo Jha') hrimage = khushboo
  else if (hrName === 'Narad Sah') hrimage = nadad_sah
  else if (hrName === 'Sakshi') hrimage = sakshi

  if (reportingManager === 'Arun Nardia') zonalhead = arun_nardia
  else if (reportingManager === 'Mohit Singhal') zonalhead = mohit_singhal
  else if (reportingManager === 'Khushal Kumar') zonalhead = khushal

  const letterRef = useRef(null)

  const downloadPDF = () => {
    document.body.style.zoom = '100%'

    const element = letterRef.current

    html2pdf()
      .set({
        margin: 0.5,
        filename: `${candidateName}_OfferLetter.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      })
      .from(element)
      .save()
      .then(() => {
        document.body.style.zoom = '80%'
      })
      .catch(() => {
        document.body.style.zoom = '80%'
      })
  }

  const uploadPDFToAPI = async (pdfBlob, fileName) => {
    const formData = new FormData()
    formData.append('OfferLetterAttachment', pdfBlob, fileName)
    formData.append('ApplicantId', id)
    formData.append('Email', email)

    try {
      const response = await uploadOfferLetter(formData)
      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      console.log('Upload successful:', data)

      message.success('Upload successful')
      setshowTemplate(false)
    } catch (error) {
      console.error('Upload error:', error)
      message.error('Upload failed')
    }
  }

  const savePDFOnly = async () => {
    await dispatch(set({ loading: true }))

    document.body.style.zoom = '100%'
    const element = letterRef.current

    const options = {
      margin: 0.5,
      filename: `${candidateName}_OfferLetter.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    }

    const worker = html2pdf().set(options).from(element)
    document.body.style.zoom = '80%'

    try {
      const pdfBlob = await worker.outputPdf('blob')
      await uploadPDFToAPI(pdfBlob, options.filename)
      await ApplicationListData()
      message.success('Offer Letter Saved Successfully')
    } catch (error) {
      console.error('Error generating or uploading PDF:', error)
      message.error('Some Issue In Saving Offer Letter')
    } finally {
      setshowTemplate(false)
      setofferLetterModels(false)
      await dispatch(set({ loading: false }))
    }
  }

  // ✅ PRINT FUNCTION (prints ONLY template content)
  const handlePrint = () => {
    try {
      if (!letterRef.current) return

      const printContents = letterRef.current.innerHTML
      const originalContents = document.body.innerHTML

      document.body.innerHTML = `
        <html>
          <head>
            <title>${candidateName}_OfferLetter</title>
            <style>
              @page { size: A4; margin: 12mm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #fff; }
              img { max-width: 100%; }
              .ant-table { font-size: 12px; }
              .ant-table-wrapper { width: 100%; }
              .ant-table-cell { padding: 6px 8px !important; }
              a { color: #000; text-decoration: none; }
            </style>
          </head>
          <body>${printContents}</body>
        </html>
      `

      window.print()

      document.body.innerHTML = originalContents
      window.location.reload()
    } catch (e) {
      console.error('Print error:', e)
      message.error('Unable to print. Please try again.')
    }
  }

  const columns = [
    { title: 'Particulars', dataIndex: 'particulars', key: 'particulars' },
    { title: 'Amount (P.M)', dataIndex: 'amountPM', key: 'amountPM' },
    { title: 'Amount (P.A)', dataIndex: 'amountPA', key: 'amountPA' },
  ]

  const keyMatching = {
    basicPay: 'Basic Pay',
    hra: 'House Rent Allowances',
    specialAllowances: 'Special Allowances',
    grossSalary: 'Gross Salary',
    epf: 'EPF',
    esic: 'ESIC',
    bonus: `BONUS/Ex-Gratia${isBonusApplicable ? '*' : ''}`, // ✅ star only when bonus true
    gratuity: 'Gratuity as per Act*',
    grossBenefits: 'Gross benefits',
    cost_to_company: 'CTC',
  }

  // ✅ FORCE TABLE ORDER (grossSalary after specialAllowances)
  const salaryRowOrder = [
    'basicPay',
    'hra',
    'specialAllowances',
    'grossSalary', // ✅ after specialAllowances
    'epf',
    'esic',
    'bonus',
    'gratuity',
    'grossBenefits',
    'cost_to_company',
  ]

  const salaryDetailsObj = salaryDetails || {}

  const salaryData = [
    // 1) ordered keys first
    ...salaryRowOrder
      .filter((k) => k in salaryDetailsObj)
      .map((key) => {
        const rawValue = salaryDetailsObj[key]

        const amountPM =
          rawValue == null
            ? null
            : typeof rawValue === 'string'
              ? Math.round(parseInt(String(rawValue).replace(/,/g, ''), 10))
              : Math.round(parseInt(rawValue, 10))

        const amountPA = amountPM == null ? null : Math.round(amountPM * 12)

        return {
          key,
          particulars: keyMatching[key] || key,
          amountPM,
          amountPA,
          isBold: key === 'grossSalary' || key === 'cost_to_company',
        }
      }),

    // 2) any remaining keys (if backend sends extra fields)
    ...Object.keys(salaryDetailsObj)
      .filter((k) => k !== 'salary' && !salaryRowOrder.includes(k))
      .map((key) => {
        const rawValue = salaryDetailsObj[key]

        const amountPM =
          rawValue == null
            ? null
            : typeof rawValue === 'string'
              ? Math.round(parseInt(String(rawValue).replace(/,/g, ''), 10))
              : Math.round(parseInt(rawValue, 10))

        const amountPA = amountPM == null ? null : Math.round(amountPM * 12)

        return {
          key,
          particulars: keyMatching[key] || key,
          amountPM,
          amountPA,
          isBold: key === 'grossSalary' || key === 'cost_to_company',
        }
      }),
  ]

  // ✅ FIX: Use SAME CTC as table (prevents mismatch like 157890 vs 157884)
  const ctcRow = salaryData.find((r) => r.key === 'cost_to_company')
  const ctcPAForLetter = ctcRow?.amountPA ?? 0

  const formatNumber = (val) =>
    parseFloat(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })

  const safeCandidateName =
    (candidateName || '')
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ') || ''

  const salaryBreakupAsOnDate = offerDate || ''

  return (
    <div>
      <div style={{ textAlign: 'right', marginBottom: 20 }}>
        <Tooltip title="Save Offer Letter">
          <Button
            type="primary"
            loading={loading}
            style={{ marginRight: 10 }}
            onClick={savePDFOnly}
          >
            <SaveOutlined />
          </Button>
        </Tooltip>

        <Tooltip title="Edit Template">
          <Button
            type="primary"
            onClick={() => setshowTemplate(false)}
            style={{ marginRight: 10 }}
            loading={loading}
          >
            <EditOutlined />
          </Button>
        </Tooltip>

        <Tooltip title="Print">
          <Button
            type="primary"
            onClick={handlePrint}
            style={{ marginRight: 10 }}
            loading={loading}
          >
            <PrinterOutlined />
          </Button>
        </Tooltip>

        <Tooltip title="Download PDF">
          <Button type="primary" onClick={downloadPDF} loading={loading}>
            <DownOutlined />
          </Button>
        </Tooltip>
      </div>

      <div
        ref={letterRef}
        style={{
          padding: '20px',
          fontFamily: 'serif',
          background: '#fff',
          maxWidth: '800px',
          margin: 'auto',
          position: 'relative',
        }}
      >
        <img
          src={logo}
          alt="Company Logo"
          style={{
            position: 'absolute',
            marginTop: '50%',
            marginLeft: '10%',
            opacity: 0.07,
            width: '70%',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Typography>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <img src={logo} alt="Logo" style={{ height: 60 }} />
              <Title level={2} style={{ margin: 0, textAlign: 'end', flex: 1 }}>
                V2 Retails Ltd.
              </Title>
            </div>

            <Divider style={{ borderTop: '2px solid black', marginTop: 8, marginBottom: 16 }} />

            <Paragraph style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Text style={{ textAlign: 'left', flex: 1 }}> </Text>
              <Text
                strong
                style={{
                  textAlign: 'center',
                  flex: 1,
                  fontSize: '20px',
                  textDecoration: 'underline',
                }}
              >
                Offer of Employment
              </Text>
              <Text strong style={{ textAlign: 'right', flex: 1 }}>
                {offerDate}
              </Text>
            </Paragraph>

            <Paragraph>
              <Text strong>Dear Mr. {safeCandidateName},</Text>
            </Paragraph>

            <Paragraph>
              This is with reference to your application and discussions you had with us; we are
              pleased to offer you the position of <Text strong>{position}</Text> in Deparment{' '}
              <Text strong>{department}</Text> with an annual CTC of ₹{' '}
              {/* ✅ CHANGED: show same annual CTC as the salary breakup table */}
              <Text strong>{formatNumber(ctcPAForLetter)}</Text> (Rupees{' '}
              {numberToWords(ctcPAForLetter).replace(/\b\w/g, (char) => char.toUpperCase())} Only)
              as per the terms discussed with you personally. You will report for your duties on or
              before <Text strong>{joiningDate}</Text> at our Corporate Office, address mentioned
              below.
            </Paragraph>

            <Paragraph>
              <Text strong>
                • 2nd Floor, 13, Sub. Major Laxmi Chand Rd, Maruti Udyog, Sector 18, Gurugram,
                Sarhol, Haryana-122015
              </Text>
            </Paragraph>

            <Paragraph>
              You will have to submit the copy of resignation to us within 24 hrs of this letter
              along with the following documents to be submitted at the time of joining.
              <br />
              1. Copy of relieving letter from your present employer.
              <br />
              2. Education & Employment Certificates.
              <br />
              3. Proof of age (10th Certificate).
              <br />
              4. Copy of Pan, Voter ID, Passport and License.
              <br />
              5. Passport size photograph 4 (self) & family photograph 2 each.
              <br />
              6. Bank statement, duly stamped by Bank.
              <br />
              7. Three month’s salary slip and breakup of current CTC.
              <br />
              8. Medical fitness certificate from MBBS or equivalent Doctor.
              <br />
              9. Affidavit on non-judicial stamp paper of Rs. 10, stating non-criminal case against
              you.
              <br />
              10. Form 16/12B from last employer (Those Salary More than Rs.20000/- per month).
            </Paragraph>

            <Paragraph>
              Please acknowledge this letter of intent in writing to confirm the date on which you
              shall be joining our organization. This offer shall stand automatically withdrawn if
              not accepted in writing within 24 hrs of its receipt.
            </Paragraph>

            <Paragraph>
              A detailed letter of employment would be issued to you after you join the services of
              the Company.
            </Paragraph>

            <Paragraph>
              <Text strong>For V2 Retail Ltd.</Text>,
              <br />
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <img src={stamp} alt="Stamp" style={{ height: 60 }} />
                {hrimage && (
                  <img
                    src={hrimage}
                    alt="Signature"
                    style={{ height: 100, position: 'relative', right: 50 }}
                  />
                )}
                {zonalhead && (
                  <img
                    src={zonalhead}
                    alt="Signature"
                    style={{ height: 100, position: 'relative', top: 20 }}
                  />
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 100 }}>
                <div>
                  <Text strong>{hrName}</Text>
                  <br />
                  Human Resources
                  <br />
                  <Text>V2 Retails Ltd.</Text>
                </div>
                <div>
                  {reportingManager !== 'none' && <Text strong>{reportingManager}</Text>}
                  <br />
                  <Text>{zonalhead && 'Zonal Retail Head'}</Text>
                  <br />
                  <Text>{zonalhead && 'V2 Retails Ltd.'}</Text>
                </div>
              </div>
              <div
                style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
              >
                <Text></Text>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{ width: '200px', borderTop: '1px solid black', marginBottom: '4px' }}
                  />
                  <Text strong>Signature of the candidate</Text>
                </div>
              </div>
            </Paragraph>
          </Typography>
        </div>

        <Divider style={{ borderTop: '2px solid black', marginTop: 2, marginBottom: 5 }} />

        <div>
          <Paragraph style={{ fontSize: '12px', lineHeight: 1.5, textAlign: 'center' }}>
            <Text strong>Reg. Off.:</Text> Khasra No. 928, Extended Lal Dora Abadi Village
            Kapashera, Tehsil Vasant Vihar, South West Delhi, Delhi-110037
            <br />
            <Text strong>Corporate Off.:</Text> 2nd Floor, 13, Sub. Major Laxmi Chand Rd, Maruti
            Udyog, Sector 18, Gurugram, Sarhol, Haryana 122015
            <br />
            <Text strong>E-mail:</Text>{' '}
            <a href="mailto:customercare@vrl.net.in">customercare@vrl.net.in</a>{' '}
            <Text strong>Website:</Text>{' '}
            <a href="http://www.v2retail.com" target="_blank" rel="noopener noreferrer">
              www.v2retail.com
            </a>
            <br />
            <Text strong>CIN:</Text> L74999DL2001PLC147724 <Text strong>Tel.:</Text> 011-41771850
          </Paragraph>
        </div>

        {/* ================= SALARY BREAKUP PAGE ================= */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Typography>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <img src={logo} alt="Logo" style={{ height: 60 }} />
              <Title level={2} style={{ margin: 0, textAlign: 'end', flex: 1 }}>
                V2 Retails Ltd.
              </Title>
            </div>

            <Divider style={{ borderTop: '2px solid black', marginTop: 8, marginBottom: 16 }} />

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Name">{candidateName}</Descriptions.Item>
              <Descriptions.Item label="Designation">{position}</Descriptions.Item>
              <Descriptions.Item label="Department">{department}</Descriptions.Item>
              <Descriptions.Item label="Date of Joining">{joiningDate}</Descriptions.Item>
            </Descriptions>

            <div
              style={{
                padding: '40px 80px 10px 80px',
                fontFamily: 'Segoe UI, sans-serif',
                color: '#333',
                borderRadius: '12px',
              }}
            >
              <Text strong style={{ textAlign: 'center' }}>
                Salary Breakup as on {offerDate || ''}
              </Text>

              <Table
                dataSource={salaryData}
                columns={columns}
                pagination={false}
                bordered
                rowClassName={(record, index) => {
                  let baseClass = index % 2 === 0 ? 'custom-row even-row' : 'custom-row odd-row'
                  if (record.isBold) baseClass += ' highlight-bold-row'
                  return baseClass
                }}
                style={{
                  marginTop: '10px',
                  marginBottom: '10px',
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}
              />
            </div>

            <div style={{ borderTop: '1px dashed #ccc' }}>
              <p style={{ margin: '4px 0', lineHeight: '1.2' }}>
                * Group Medical policy as per Company Policy
              </p>
              <p style={{ margin: '4px 0', lineHeight: '1.2' }}>
                * Income Tax applicable as per Income Tax Rules
              </p>

              {isBonusApplicable && (
                <p style={{ margin: '4px 0', lineHeight: '1.2' }}>
                  * Bonus/Ex-Gratia amount calculated on actual paid days basis during Deepawali or
                  final settlement
                </p>
              )}

              <p style={{ margin: '4px 0', lineHeight: '1.2' }}>
                * Gratuity amount payable after successful completion of five (5) years
              </p>
              <p style={{ margin: '4px 0', lineHeight: '1.2' }}>
                * Variable amount will be calculated and paid as per the structure
              </p>
            </div>

            <Paragraph>
              <Text strong>For V2 Retail Ltd.</Text>,
              <br />
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <img src={stamp} alt="Stamp" style={{ height: 60 }} />
                {hrimage && (
                  <img
                    src={hrimage}
                    alt="Signature"
                    style={{ height: 100, position: 'relative', right: 50, top: 30 }}
                  />
                )}
                {zonalhead && (
                  <img
                    src={zonalhead}
                    alt="Signature"
                    style={{ height: 100, position: 'relative', top: 20 }}
                  />
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 100 }}>
                <div>
                  {hrName && <Text strong>{hrName}</Text>}
                  <br />
                  Human Resources
                  <br />
                  <Text>V2 Retails Ltd.</Text>
                </div>
                <div>
                  {reportingManager !== 'none' && <Text strong>{reportingManager}</Text>}
                  <br />
                  <Text>{zonalhead && 'Zonal Retail Head'}</Text>
                  <br />
                  <Text>{zonalhead && 'V2 Retails Ltd.'}</Text>
                </div>
              </div>
            </Paragraph>
          </Typography>
        </div>

        <Divider style={{ borderTop: '2px solid black', marginTop: 8, marginBottom: 16 }} />

        <div>
          <Paragraph style={{ fontSize: '12px', lineHeight: 1.5, textAlign: 'center' }}>
            <Text strong>Reg. Off.:</Text> Khasra No. 928, Extended Lal Dora Abadi Village
            Kapashera, Tehsil Vasant Vihar, South West Delhi, Delhi-110037
            <br />
            <Text strong>Corporate Off.:</Text> 2nd Floor, 13, Sub. Major Laxmi Chand Rd, Maruti
            Udyog, Sector 18, Gurugram, Sarhol, Haryana 122015
            <br />
            <Text strong>E-mail:</Text>{' '}
            <a href="mailto:customercare@vrl.net.in">customercare@vrl.net.in</a>{' '}
            <Text strong>Website:</Text>{' '}
            <a href="http://www.v2retail.com" target="_blank" rel="noopener noreferrer">
              www.v2retail.com
            </a>
            <br />
            <Text strong>CIN:</Text> L74999DL2001PLC147724 <Text strong>Tel.:</Text> 011-41771850
          </Paragraph>
        </div>
      </div>
    </div>
  )
}

export default OfferLetterTemplate
