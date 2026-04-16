import React, { useRef } from 'react'
import { Typography, Divider, Button, Table, Descriptions, message, Tooltip } from 'antd'
import html2pdf from 'html2pdf.js'
import logo from '../../../assets/images/V2-Logo-1.png'
import aquatica_logo from '../../../assets/images/aquatica_logo.jpg'
import Abhishek_kumar from '../../../assets/images/sign_new/abhishek_kumar.png'
import khushboo from '../../../assets/images/sign_new/khushboo.png'
import nadad_sah from '../../../assets/images/sign_new/nadad_sah.png'
import ruchi from '../../../assets/images/sign_new/ruchi.png'
import sakshi from '../../../assets/images/sign_new/sakshi.png'
import nikhil_chhokra from '../../../assets/images/sign_new/nikhil_chhokra.png'

import arun_nardia from '../../../assets/images/sign_new/arun_nardia.png'
import khushal from '../../../assets/images/sign_new/khushal.png'
import mohit_singhal from '../../../assets/images/sign_new/mohit_singhal.png'
import dinesh_prasad from '../../../assets/images/sign_new/dinesh_prasad.png'
import sadanand_yadav from '../../../assets/images/sign_new/sadanand_sign.png'
import narad_shah_sign from '../../../assets/images/sign_new/narad_shah_sign.png'

import stamp from '../../../assets/images/stamp.png'
import numberToWords from '@jstb/num-to-words-indian'
import { useDispatch, useSelector } from 'react-redux'
import { uploadOfferLetter } from '../../../services/Services'
import { set } from '../../../redux/uiSlice'
import { DownOutlined, EditOutlined, SaveOutlined, PrinterOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

const ApplicantOfferLetterTemplate = ({
  offerData,
  setshowTemplate,
  setofferLetterModels,
  ApplicationListData,
  ...props
}) => {
  const {
    candidateName,
    employeeId,
    position,
    salary,
    email,
    joiningDate,
    offerDate,
    id,
    location,
    hrName,
    reportingManager,
    workHours,
    grossSalary,
    basicPay,
    hra,
    specialAllowances,
    epf,
    bonus,
    gratuity,
    grossBenefits,
    variableBenefit,
    ctc,
    salaryDetails,
    department,
    isBonusApplicable,
  } = offerData

  console.log("offerdata", offerData);

  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.ui)

  let hrimage = null
  let zonalhead = null

  if (hrName === 'Nikhil Chhokra') hrimage = nikhil_chhokra
  else if (hrName === 'Ruchi Dubey') hrimage = ruchi
  else if (hrName === 'Abhishek Kumar') hrimage = Abhishek_kumar
  else if (hrName === 'Khushboo Jha') hrimage = khushboo
  else if (hrName === 'Narad Sah') hrimage = narad_shah_sign
  else if (hrName === 'Sakshi') hrimage = sakshi
  else if (hrName === 'Sadanand') hrimage = sadanand_yadav
  else hrimage = null

  if (reportingManager === 'Arun Nardia') zonalhead = arun_nardia
  else if (reportingManager === 'Mohit Singhal') zonalhead = mohit_singhal
  else if (reportingManager === 'Khushal Kumar') zonalhead = khushal
  else if (reportingManager === 'Dinesh Prasad') zonalhead = dinesh_prasad
  else zonalhead = null

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
      .then(() => (document.body.style.zoom = '80%'))
      .catch(() => (document.body.style.zoom = '80%'))
  }

  const uploadPDFToAPI = async (pdfBlob, fileName) => {
    const formData = new FormData()
    formData.append('OfferLetterAttachment', pdfBlob, fileName)
    formData.append('ApplicantId', id)
    formData.append('Email', email)

    try {
      const response = await uploadOfferLetter(formData)
      if (!response.ok) throw new Error('Upload failed')
      await response.json()
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
      html2canvas: { scale: 1.2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    }

    const worker = html2pdf().set(options).from(element)
    document.body.style.zoom = '100%'

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
              .ant-table-cell { padding: 6px 8px !important; border: 1px solid black !important; }
              .ant-table,
              .ant-table-thead > tr > th,
              .ant-table-tbody > tr > td {
                border-color: #000 !important;
              }
              a { color: #000; text-decoration: none; }
              @media print {<div class="page-break"></div>}
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
    deducation: 'Deducation',
    epf: 'EPF',
    esic: 'ESIC',
    bonus: `BONUS/Ex-Gratia${isBonusApplicable ? '*' : ''}`,
    gratuity: 'Gratuity as per Act*',
    grossBenefits: 'Gross benefits',
    cost_to_company: 'CTC (Cost to Company)',
    Benefits: '',
  }

  // ✅ FORCE TABLE ORDER (Gross Salary after Special Allowances)
  const salaryRowOrder = [
    'basicPay',
    'hra',
    'specialAllowances',
    'grossSalary',
    'epf',
    'esic',
    'bonus',
    'gratuity',
    'grossBenefits',
    'cost_to_company',
  ]

  // ✅ helper to safely convert string numbers with commas
  const toNumber = (v) => {
    if (v == null) return null
    if (typeof v === 'string') {
      const n = Number(String(v).replace(/,/g, ''))
      return Number.isFinite(n) ? n : null
    }
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }

  const salaryDetailsObj = salaryDetails || {}

  // ✅ ordered rows first (as per salaryRowOrder), then remaining keys
  const salaryData = [
    ...salaryRowOrder
      .filter((k) => k in salaryDetailsObj && k !== 'salary')
      .map((key) => {
        const rawValue = salaryDetailsObj[key]
        const n = toNumber(rawValue)

        const amountPM = n == null ? null : Math.round(n)
        const amountPA = amountPM == null ? null : Math.round(amountPM * 12)

        return {
          key,
          particulars: keyMatching[key] || key,
          amountPM,
          amountPA,
          isBold: key === 'grossSalary' || key === 'cost_to_company',
        }
      }),

    ...Object.keys(salaryDetailsObj)
      .filter((k) => k !== 'salary' && !salaryRowOrder.includes(k))
      .map((key) => {
        const rawValue = salaryDetailsObj[key]
        const n = toNumber(rawValue)

        const amountPM = n == null ? null : Math.round(n)
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

  // ✅ IMPORTANT: Use table CTC P.A for letter paragraph (same value as table)
  const ctcRow = salaryData.find((r) => r.key === 'cost_to_company')
  const ctcPAForLetter = ctcRow?.amountPA ?? 0

  const formatNumber = (val) => parseFloat(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })

  return (
    <div>
      <div style={{ textAlign: 'right', marginBottom: 20 }}>
        <Tooltip title="Save Offer Letter">
          <Button type="primary" loading={loading} style={{ marginRight: 10 }} onClick={savePDFOnly}>
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
          <Button type="primary" onClick={handlePrint} style={{ marginRight: 10 }} loading={loading}>
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
          paddingTop: "0px",
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
              <img
                src={offerData?.officeType === 'Aquatica' ? aquatica_logo : logo}
                alt="Logo"
                style={{ height: offerData?.officeType === 'Aquatica' ? 100 : 60 }}
              />

              <div style={{ width: '24rem', textAlign: 'right' }}>
                <Title level={2} style={{ margin: 0, textAlign: 'end', flex: 1 }}>
                  {offerData?.officeType === 'Aquatica' ? offerData?.officeAddress : 'V2 Retail Ltd.'}
                </Title>
                {offerData?.officeType === 'Aquatica' &&
                  'Kouchpukur, P.O. Hathgachia, P.S. K.L.C. Thakdari Road, Township, Near Rajarhat, Kolkata, West Bengal 700156'}
              </div>
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
              <Text strong>
                Dear Mr.{' '}
                {(candidateName || '')
                  .split(' ')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ')}
                ,
              </Text>
            </Paragraph>

            {/* ✅ FIXED: show annual CTC exactly as per table CTC (P.A) */}
            <Paragraph>
              This is with reference to your application and discussions you had with us; we are
              pleased to offer you the position of <Text strong>{position}</Text> in Deparment{' '}
              <Text strong>{department}</Text> with an annual CTC of ₹{' '}
              <Text strong>{formatNumber(ctcPAForLetter)}</Text> (Rupees{' '}
              {numberToWords(ctcPAForLetter).replace(/\b\w/g, (char) => char.toUpperCase())} Only) as
              per the terms discussed with you personally. You will report for your duties on or
              before <Text strong>{joiningDate}</Text> at our{' '}
              {offerData?.officeType === 'Head Office' ? 'Corporate Office' : 'Warehouse'}, address
              mentioned below.
            </Paragraph>

            <Paragraph>
              <Text strong>{offerData?.officeAddress}</Text>
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
                {/* <img src={stamp} alt="Stamp" style={{ height: 60 }} /> */}

                {hrimage && (
                  <img
                    src={hrimage}
                    alt="Signature"
                    style={{ height: 100, position: 'relative', right: 0, top: 0 }}
                  />
                )}

                {zonalhead && (
                  <img
                    src={zonalhead}
                    alt="Signature"
                    style={{ height: 100, position: 'relative', top: 0, left: 110 }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'row', gap: 100 }}>
                <div>
                  <Text strong>{hrName}</Text>
                  <br />
                  Human Resources
                  <br />
                  {/* <Text>V2 Retail Ltd.</Text> */}
                </div>
                <div>
                  {reportingManager !== 'none' && <Text strong>{reportingManager}</Text>}
                  <br />
                  <Text>{zonalhead && 'NSO HR Head'}</Text>
                  <br />
                  {/* <Text>{zonalhead && 'V2 Retail Ltd.'}</Text> */}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text></Text>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '200px', borderTop: '1px solid black', marginBottom: '4px' }} />
                  <Text strong>Signature of the candidate</Text>
                </div>
              </div>
            </Paragraph>
          </Typography>
        </div>

        <Divider style={{ borderTop: '2px solid black', marginTop: 2, marginBottom: 5 }} />

        <div>
          <Paragraph style={{ fontSize: '12px', lineHeight: 1.5, textAlign: 'center' }}>
            <Text strong>Reg. Off.:</Text> Khasra No. 928, Extended Lal Dora Abadi Village Kapashera,
            Tehsil Vasant Vihar, South West Delhi, Delhi-110037
            <br />
            <Text strong>Corporate Off.:</Text> 2nd Floor, 13, Sub. Major Laxmi Chand Rd, Maruti Udyog,
            Sector 18, Gurugram, Sarhol, Haryana 122015
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
        <div class="page-break"></div>
        {/* ////////////////////////// Salary breakup///////////////////////////////////////////// */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Typography>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <img src={logo} alt="Logo" style={{ height: 60 }} />
              <Title level={2} style={{ margin: 0, textAlign: 'end', flex: 1 }}>
                V2 Retail Ltd.
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
                padding: '20px 80px 10px 80px',
                fontFamily: 'Segoe UI, sans-serif',
                color: '#333',
                borderRadius: '12px',
              }}
            >
              <Text strong style={{ textAlign: 'center' }}>
                Salary Breakup
              </Text>

              <Table
                dataSource={salaryData}
                columns={columns}
                pagination={false}
                components={{
                  header: {
                    cell: (props) => (
                      <th
                        {...props}
                        style={{
                          ...props.style,
                          border: '1px solid black',
                          borderRadius: "0px",
                          borderCollapse: "collapse"
                        }}
                      />
                    ),
                  },
                  body: {
                    cell: (props) => (
                      <td
                        {...props}
                        style={{
                          ...props.style,
                          border: '1px solid black',
                          borderRadius: "0px",
                          borderCollapse: "collapse"
                        }}
                      />
                    ),
                  },
                }}
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
                  borderRadius: '0px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  borderColor: "black",
                  borderCollapse: "collapse"
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
            </div>

            <Paragraph>
              <Text strong style={{ marginBottom: "1rem" }}>For V2 Retail Ltd.</Text>,
              <br />
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                {/* <img src={stamp} alt="Stamp" style={{ height: 60 }} /> */}

                {hrimage && (
                  <img
                    src={hrimage}
                    alt="Signature"
                    style={{ height: 100, position: 'relative', right: 0, top: 0 }}
                  />
                )}

                {zonalhead && (
                  <img
                    src={zonalhead}
                    alt="Signature"
                    style={{ height: 100, position: 'relative', top: 0, left: 110 }}
                  />
                )}
              </div>



              <div style={{ display: 'flex', flexDirection: 'row', gap: 100 }}>
                <div>
                  {hrName && <Text strong>{hrName}</Text>}
                  <br />
                  Human Resources
                  <br />
                  {/* <Text>V2 Retail Ltd.</Text> */}
                </div>
                <div>
                  {reportingManager !== 'none' && <Text strong>{reportingManager}</Text>}
                  <br />
                  <Text>{zonalhead && 'NSO HR Head'}</Text>
                  <br />
                  {/* <Text>{zonalhead && 'V2 Retail Ltd.'}</Text> */}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text></Text>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '200px', borderTop: '1px solid black', marginBottom: '4px' }} />
                  <Text strong>Signature of the candidate</Text>
                </div>
              </div>
            </Paragraph>
          </Typography>
        </div>

        <Divider style={{ borderTop: '2px solid black', marginTop: 8, marginBottom: 16 }} />

        <div>
          <Paragraph style={{ fontSize: '12px', lineHeight: 1.5, textAlign: 'center' }}>
            <Text strong>Reg. Off.:</Text> Khasra No. 928, Extended Lal Dora Abadi Village Kapashera,
            Tehsil Vasant Vihar, South West Delhi, Delhi-110037
            <br />
            <Text strong>Corporate Off.:</Text> 2nd Floor, 13, Sub. Major Laxmi Chand Rd, Maruti Udyog,
            Sector 18, Gurugram, Sarhol, Haryana 122015
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

export default ApplicantOfferLetterTemplate
