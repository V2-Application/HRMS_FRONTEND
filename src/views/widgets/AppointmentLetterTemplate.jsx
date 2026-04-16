import React, { useEffect, useRef, useState } from 'react'
import { Typography, Divider, Button, Table, Descriptions, message, Tooltip } from 'antd'
import html2pdf from 'html2pdf.js'
import logo from '../../assets/images/V2-Logo-1.png'
import Abhishek_kumar from '../../assets/images/sign_new/abhishek_kumar.png'
import khushboo from '../../assets/images/sign_new/khushboo.png'
import nadad_sah from '../../assets/images/sign_new/nadad_sah.png'
import ruchi from '../../assets/images/sign_new/ruchi.png'
import sakshi from '../../assets/images/sign_new/sakshi.png'

import arun_nardia from '../../assets/images/sign_new/arun_nardia.png'
import khushal from '../../assets/images/sign_new/khushal.png'
import mohit_singhal from '../../assets/images/sign_new/mohit_singhal.png'

import stamp from '../../assets/images/stamp.png'
import { toWords } from 'number-to-words'
import numberToWords from '@jstb/num-to-words-indian'
import { useDispatch, useSelector } from 'react-redux'
import { uploadOfferLetter } from '../../services/Services'
import { set } from '../../redux/uiSlice'
import { DownOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

const AppointmentLetterTemplate = ({
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
    ecode,
    reportingManager,
    offerLetterData,
    locationName,
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
  } = offerData

  const [referenceDate, setReferenceDate] = useState('')

  useEffect(() => {
    if (offerDate) {
      const date = new Date(offerDate)

      // Get day and month with leading zeros
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')

      // Combine in dd/mm format
      const formatted = `${day}/${month}`
      setReferenceDate(formatted)
    }
  }, [offerDate])

  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.ui)
  let hrimage = null
  let zonalhead = null
  if (hrName === 'Ruchi Dubey') {
    hrimage = ruchi
  } else if (hrName === 'Abhishek Kumar') {
    hrimage = Abhishek_kumar
  } else if (hrName === 'Khushboo Jha') {
    hrimage = khushboo
  } else if (hrName === 'Narad Sah') {
    hrimage = nadad_sah
  } else if (hrName === 'Sakshi') {
    hrimage = sakshi
  } else {
    hrimage = null
  }

  if (reportingManager === 'Arun Nardia') {
    zonalhead = arun_nardia
  } else if (reportingManager === 'Mohit Singhal') {
    zonalhead = mohit_singhal
  } else if (reportingManager === 'Khushal Kumar') {
    zonalhead = khushal
  } else {
    zonalhead = null
  }

  const letterRef = useRef()

  const downloadPDF = () => {
    document.body.style.zoom = '100%'

    const element = letterRef.current

    html2pdf()
      .set({
        margin: 0.5,
        filename: `${candidateName}_Appointment_Letter.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      })
      .from(element)
      .save()
      .then(() => {
        // Restore original zoom after saving
        document.body.style.zoom = '80%'
      })
      .catch(() => {
        // Restore even if something fails
        document.body.style.zoom = '80%'
      })
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

  const uploadPDFToAPI = async (pdfBlob, fileName) => {
    const formData = new FormData()
    formData.append('OfferLetterAttachment', pdfBlob, fileName)
    // formData.append('candidateName', candidateName);
    formData.append('ApplicantId', id)
    formData.append('Email', email)

    try {
      const response = await uploadOfferLetter(formData)

      if (!response.ok) throw new Error('Upload failed')
      const data = await response.json()
      message.success('Upload successful')
      setshowTemplate(false)
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  const columns = [
    {
      title: 'Particulars',
      dataIndex: 'particulars',
      key: 'particulars',
    },
    {
      title: 'Amount (P.M)',
      dataIndex: 'amountPM',
      key: 'amountPM',
    },
    {
      title: 'Amount (P.A)',
      dataIndex: 'amountPA',
      key: 'amountPA',
    },
  ]

  const keyMatching = {
    basicPay: 'Basic Pay',
    hra: 'House Rent Allowances',
    specialAllowances: 'Special Allowances',
    grossSalary: 'Gross Salary',
    deducation: 'Deducation',
    epf: 'EPF',
    esic: 'ESIC',
    bonus: 'BONUS/Ex-Gratia',
    gratuity: 'Gratuity as per Act*',
    grossBenefits: 'Gross benefits',
    cost_to_company: 'CTC',
    // ctc: 'CTC (Cost to the Company)',
  }

  const salaryData = Object.entries(salaryDetails)
    .filter(([key, value]) => key !== 'salary') // Skip 'salary'
    .map(([key, value], index) => {
      const amountPM = typeof value === 'string' ? parseInt(value.replace(/,/g, ''), 10) : value
      const amountPA = amountPM === null ? null : amountPM * 12

      return {
        key: `${index + 1}`,
        particulars: keyMatching[key],
        amountPM,
        amountPA,
      }
    })

  const formatNumber = (val) =>
    parseFloat(val).toLocaleString('en-IN', { maximumFractionDigits: 0 })

  function formatDate(offerDate, ecode) {
    // Extract day, month, year from the offerDate
    const date = new Date(offerDate)
    const day = String(date.getDate()).padStart(2, '0') // 01
    const month = String(date.getMonth() + 1).padStart(2, '0') // 08

    // Extract numeric part from ecode
    const yearCode = ecode.replace(/\D/g, '') // removes non-digits → "32805"

    return `${day}/${month}/${yearCode}`
  }

  return (
    <div>
      <div style={{ textAlign: 'right', marginBottom: 20 }}>
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
        {/* <Tooltip title="Save Template">
          <Button type="primary" onClick={savePDFOnly} style={{ marginRight: 10 }} disabled>
            <SaveOutlined />
          </Button>
        </Tooltip> */}
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
        {/* /////////////////////////////first page ////////////////////////////// */}
        <div>
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
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                {/* Logo - replace the src with your logo path */}
                <img src={logo} alt="Logo" style={{ height: 60 }} />

                {/* Title */}
                <Title level={2} style={{ margin: 0, textAlign: 'end', flex: 1 }}>
                  V2 Retails Ltd.
                </Title>
              </div>
              <Divider style={{ borderTop: '2px solid black', marginTop: 8, marginBottom: 16 }} />

              <div>
                <Paragraph
                  style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
                >
                  <Text strong style={{ textAlign: 'left', flex: 1 }}>
                    Ref.No-
                    {/* {formatDate(
                      new Date().toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      }),
                      ecode,
                    )}{' '} */}
                    {`${referenceDate}/${ecode?.slice(1)}`}
                  </Text>
                  <Text
                    strong
                    style={{
                      textAlign: 'center',
                      flex: 1,
                      fontSize: '20px', // Increase size (adjust as needed)
                      textDecoration: 'underline', // Add underline
                    }}
                  >
                    APPOINTMENT LETTER
                  </Text>
                  <Text strong style={{ textAlign: 'right', flex: 1 }}>
                    {/* {new Date().toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })} */}
                    {offerDate}
                  </Text>
                </Paragraph>
                <div>
                  <Paragraph>
                    <Text strong>
                      {candidateName},<br />
                      {ecode}
                    </Text>
                  </Paragraph>

                  <Paragraph>
                    <Text strong>Dear {candidateName},</Text>
                  </Paragraph>

                  <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                    Further to our letter of offer dated {offerLetterData}, we are pleased to inform
                    you that you are hereby appointed as <Text strong>{position}</Text> in the{' '}
                    <Text strong>{department} Department</Text> of our Organization to be based at{' '}
                    <Text strong>{locationName}</Text> as per terms and conditions discussed and
                    agreed upon as under. Please note that the employment conditions detailed
                    hereunder are subject to the Policies of V2 Retail Ltd. (“the Company”), which
                    may be modified and/or amended from time to time and the same shall be binding
                    on you:
                  </Paragraph>

                  <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                    1. This appointment is effective from <Text strong>{offerDate}</Text> i.e. the
                    date of your joining our Organization. You shall indicate your
                    acceptance/consent to the same by signing and returning in duplicate a copy of
                    this Letter of Appointment to us within seven (7) days from the date of this
                    Letter of Appointment, failing which this Letter of Appointment shall stand
                    revoked/rescinded. Further, on acceptance of this Letter of Appointment in the
                    manner described hereinabove, the provisions of this Letter of Appointment shall
                    be binding on you. The date of Appointment shall not be changed except if so
                    intimated by the Company in writing.
                  </Paragraph>

                  <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                    2. Your appointment is based on the information supplied by you to us in your
                    application/personal data form and otherwise, and will be considered null and
                    void if any material error is discovered therein at any time, and your
                    employment shall terminate without any notice irrespective of all other relevant
                    documents.
                  </Paragraph>

                  <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                    3. Your salary and other allowances shall be as per enclosed statement.
                  </Paragraph>

                  <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                    4. You will be placed on probation for a period of six months w.e.f. the date of
                    appointment and the period of probation can be extended by another three months
                    based upon your performance and at the sole discretion of the Company. On the
                    expiry of the period, unless it is confirmed in writing by the Management, you
                    shall be deemed to be confirmed.
                  </Paragraph>

                  <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                    5. After confirmation, the notice period required shall be one month from either
                    side.
                  </Paragraph>

                  <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                    6. You shall be liable to pay to the Company one month salary in case you resign
                    from the company without serving the prior notice as specified in clause (5) of
                    this agreement. The amount to be paid by you shall be calculated proportionately
                    for the days for which the notice is not served.
                  </Paragraph>

                  <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                    7. After successful completion of your probation, you will be confirmed in
                    writing as a permanent employee of the Company. You will be entitled to
                    statutory and service benefits and be governed by discipline and other rules
                    existing or may come into existence from time to time, as and when applicable as
                    per rules of the Company and such other benefits as applicable to employees in
                    force from time to time to the location/place wherever you are working.
                    <br />
                  </Paragraph>

                  {/* <Paragraph>
                                        Please acknowledge this letter of intent in writing to confirm the date on which you shall be joining our organization. This offer shall stand automatically withdrawn if not accepted in writing within 24 hrs of its receipt.
                                    </Paragraph>

                                    <Paragraph>
                                        A detailed letter of employment would be issued to you after you join the services of the Company.
                                    </Paragraph> */}
                </div>

                {/* <Paragraph>
                                <Text strong>For V2 Retail Ltd.</Text>,
                                <br />
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                    <img src={stamp} alt="Stamp" style={{ height: 60 }} />
                                    {hrimage && <img src={hrimage} alt="Signature" style={{ height: 100, position: 'relative', right: 50 }} />}
                                    {zonalhead && <img src={zonalhead} alt="Signature" style={{ height: 100, position: 'relative', top: 20 }} />}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'row', gap: 100 }}>
                                    <div>
                                        <Text strong>{hrName}</Text>
                                        <br />
                                        Human Resources
                                        <br />
                                        <Text>V2 Retail Ltd.</Text>
                                    </div>
                                    <div>
                                        {reportingManager !== 'none' && <Text strong>{reportingManager}</Text>}
                                        <br />
                                        <Text>{zonalhead && 'Zonal Retail Head'}</Text>
                                        <br />
                                        <Text>{zonalhead && 'V2 Retail Ltd.'}</Text>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text></Text>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ width: '200px', borderTop: '1px solid black', marginBottom: '4px' }}></div>
                                        <Text strong>Signature of the candidate</Text>
                                    </div>
                                </div>
                            </Paragraph> */}
              </div>
            </Typography>
          </div>

          <Divider style={{ borderTop: '2px solid black', marginTop: 2, marginBottom: 5 }} />
          <div>
            <Paragraph
              style={{
                fontSize: '12px',
                lineHeight: 1.5,
                // marginTop: '5px',
                textAlign: 'center', // centers the entire block
              }}
            >
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

        {/* /////////////////////////////2nd page ////////////////////////////// */}
        <div>
          <br />
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
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                {/* Logo - replace the src with your logo path */}
                <img src={logo} alt="Logo" style={{ height: 60 }} />

                {/* Title */}
                <Title level={2} style={{ margin: 0, textAlign: 'end', flex: 1 }}>
                  V2 Retails Ltd.
                </Title>
              </div>
              <Divider style={{ borderTop: '2px solid black', marginTop: 8, marginBottom: 16 }} />

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                8. Your future increments, promotions, or any other salary increases shall be based
                on merit, considering your periodic and consistent overall performance, business
                conditions, and other parameters fixed from time to time at the sole discretion of
                the management. You shall not claim annual increments, promotions to higher cadre,
                or interim increases in salary as a matter of right.
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                9. The office working hours shall be 8.00 hours per day, including a 40-minute lunch
                break and two 10-minute tea breaks. These timings may be adjusted at the discretion
                of your immediate reporting officer to meet business deadlines. Failure to
                accomplish assigned targets due to time constraints or any other reason may result
                in disciplinary action. Work hours and weekly holidays are governed by Company
                policies which may be amended from time to time with proper notification.
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                10. Your employment includes the following statutory benefits and leave
                entitlements:
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                (a) Leaves:
                <br />
                (i) 7 days of Casual Leave per calendar year
                <br />
                (ii) 15 days of Privileged Leave per calendar year
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                (b) Statutory Benefits:
                <br />
                (i) Provident Fund contributions as per EPF Act, 1952
                <br />
                (ii) ESIC coverage under ESIC Act, 1948
                <br />
                (iii) Leave encashment according to Company policy
                <br />
                (iv) Gratuity benefits under Payment of Gratuity Act
                <br />
                (v) Annual Bonus as per applicable laws
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                11. All leaves must be approved in advance by your reporting officer or department
                head. The Company reserves the right to recall approved leaves in case of business
                emergencies or if work commitments are unmet. Unauthorized absences will be treated
                as misconduct and may lead to disciplinary action up to and including termination.
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                12. As a member of management staff, you are prohibited from participating in or
                forming any employee associations or councils that could compromise the Company's
                interests. Violation of this condition will be considered a breach of your
                employment terms and subject to disciplinary proceedings.
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                13. Your employment with the Company will cease automatically upon reaching the
                retirement age of 58 years.
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                14. You agree to dedicate your full working time and attention to Company business.
                Outside employment or service of any kind (paid or unpaid) requires prior written
                approval from management. Breach of this condition will result in immediate
                termination.
              </Paragraph>
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
            </Typography>
          </div>

          <Divider style={{ borderTop: '2px solid black', marginTop: 2, marginBottom: 5 }} />
          <div>
            <Paragraph
              style={{
                fontSize: '12px',
                lineHeight: 1.5,
                // marginTop: '5px',
                textAlign: 'center', // centers the entire block
              }}
            >
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

        {/* /////////////////////////////3rd page ////////////////////////////// */}
        <div>
          <br />
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
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                {/* Logo - replace the src with your logo path */}
                <img src={logo} alt="Logo" style={{ height: 60 }} />

                {/* Title */}
                <Title level={2} style={{ margin: 0, textAlign: 'end', flex: 1 }}>
                  V2 Retails Ltd.
                </Title>
              </div>
              <Divider style={{ borderTop: '2px solid black', marginTop: 8, marginBottom: 16 }} />

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                15. (a) Your services are liable to be transferred, loaned, or assigned, wholly or
                partially, from one department to another or from one office/branch to another
                office/branch of an associate company, whether existing or to be established in the
                future, or any of the Company's branch offices or locations anywhere in India or
                abroad, or any other concern where the Company has any interest. In such cases, you
                will abide by the responsibilities expressly vested, implied, or communicated and
                shall follow the rules and regulations of the department/office, establishment,
                jointly or separately, without any compensation, extra remuneration, or provision of
                accommodation. You may then be governed by the service conditions and other terms of
                the said concern as may be applicable.
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                (b) The aforementioned Clause (a) does not grant you any right to claim employment
                in any associate or sister concern, nor does it entitle you in any manner to a
                common seniority with the employees of the borrowing sister/associate concern.
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                (c) Furthermore, you shall not, under any circumstances, either directly or
                indirectly, receive or accept for your own benefit any commission, rebate, discount,
                gratuity, or profit from any person, company, or firm having business transactions
                with the Company or any of its sister/associate concerns.
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                (d) During your employment, you shall not introduce any person, firm, company, or
                organization to the Company for business of any kind without first disclosing such
                interests or benefits to the Company and obtaining their approval. You will not have
                financial or other benefits from contracts or transactions made by the Company with
                any such third party without prior disclosure and approval.
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                16. In the event you are absent from duty without informing or obtaining permission
                for leave, or if you overstay your sanctioned leave, the Management will forfeit
                your salary for the entire period of absence and treat you as having voluntarily
                abandoned your services with the Company. If you are absent from duty without
                information or permission for a period exceeding 7 days, your services may be
                terminated from the Company with immediate effect.
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                17. Your services are liable to be terminated without notice at any time:
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                (a) During probation or after confirmation, if you are found to be medically unfit
                by the Company's Authorized Medical Practitioner upon examination;
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                (b) If the Company becomes aware of any conviction by a Court of Law during your
                tenure of service with us, or if there is any conviction and/or bad record in the
                past under a previous employer, or if you provided false information at the time of
                your appointment, concealed any material information, or provided false details in
                the application form or otherwise regarding age, educational qualifications,
                experience, salary, etc.;
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                (c) On account of any integrity issues, gross default, misconduct, or indiscipline,
                contravening the express provisions and implied conditions of your employment.
              </Paragraph>

              <br />
              <br />
              <br />
            </Typography>
          </div>

          <Divider style={{ borderTop: '2px solid black', marginTop: 2, marginBottom: 5 }} />
          <div>
            <Paragraph
              style={{
                fontSize: '12px',
                lineHeight: 1.5,
                // marginTop: '5px',
                textAlign: 'center', // centers the entire block
              }}
            >
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

        {/* /////////////////////////////4th page ////////////////////////////// */}
        <div>
          <br />
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
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                {/* Logo - replace the src with your logo path */}
                <img src={logo} alt="Logo" style={{ height: 60 }} />

                {/* Title */}
                <Title level={2} style={{ margin: 0, textAlign: 'end', flex: 1 }}>
                  V2 Retails Ltd.
                </Title>
              </div>
              <Divider style={{ borderTop: '2px solid black', marginTop: 8, marginBottom: 16 }} />

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                18. You will keep the Company informed regarding any changes in your personal
                particulars provided to the Company at the time of joining, such as your permanent
                address, residential/correspondence address, phone numbers, and contact persons in
                case of emergency, along with their relevant details.
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                19. All documents, plans, drawings, prints, trade secrets, technical information,
                reports, statements, correspondence, etc., whether written or unwritten, as well as
                any information and instructions that pass through you or come to your knowledge,
                shall be treated as confidential. You shall not utilize them for your own use or to
                the detriment or prejudice of the Company, nor disclose them to other persons during
                or after your employment. During your employment with the Company, you will acquire,
                gain, generate, gather, and develop knowledge of and be given access to business
                information about products, activities, know-how, methods or refinements, business
                plans, and business secrets, collectively referred to as the "SECRETS." You will be
                liable for prosecution for damages for divulging, sharing, or parting with any such
                information during your employment and for at least a period of 2 years after
                cessation of employment. You agree and acknowledge that the Company is and shall
                remain the exclusive owner of the Confidential Information. Nothing in this
                Appointment letter is intended or implied to grant any right, title, interest, or
                license under any trade secret belonging to the Company, nor shall this Appointment
                letter grant or convey to you any right, title, interest, or license in or to the
                Confidential Information, except for the limited right to use such Confidential
                Information to enable you to carry out your employment/work with the Company. All
                intellectual property and proprietary rights resulting from the use of the
                Confidential Information by you shall be owned by the Company. You agree to perform
                any further acts and execute and deliver to the Company such instruments as may be
                required to perfect, register, or enforce the Company’s ownership of the rights
                conveyed under this Appointment letter or to carry out the intended purpose of this
                Appointment letter.
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                20. You shall faithfully and to the best of your ability perform your duties that
                may be entrusted to you from time to time by the management. During your tenure of
                service, you will be bound by the service rules, regulations, policies, practices,
                and orders of the Company in force in relation to conduct, discipline, and policy
                matters, or as introduced or amended from time to time. You will not seek membership
                in any local or public bodies without first obtaining specific written permission
                from the management. In the event of your becoming a member without following the
                due process as mentioned herein, it shall amount to a contravention of the
                provisions of your employment conditions, and the management reserves the right to
                take appropriate action, including termination of your services, as it may deem fit.
                You will not disclose to anyone, by word of mouth or otherwise, particulars of our
                business or administrative or organizational matters of a confidential nature which
                may be your privilege to know by virtue of your employment.
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                21. While you are employed by the Company, you may be given or handed over Company
                property and/or equipment for official use, and you shall take care of them,
                including their upkeep. Upon cessation of your employment with the Company, you
                shall return all documents, books, and papers relating to the affairs of the
                Company, purchased with the Company's money, which may have come into your
                possession, as well as any property of the Company in your possession. You undertake
                that you will not remove, photocopy, or make any other copy of any such information
                for your personal or subsequent use in any manner.
              </Paragraph>
              <br />
            </Typography>
          </div>

          <Divider style={{ borderTop: '2px solid black', marginTop: 2, marginBottom: 5 }} />
          <div>
            <Paragraph
              style={{
                fontSize: '12px',
                lineHeight: 1.5,
                // marginTop: '5px',
                textAlign: 'center', // centers the entire block
              }}
            >
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

        {/* /////////////////////////////5th page ////////////////////////////// */}
        <div>
          <br />
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
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                {/* Logo - replace the src with your logo path */}
                <img src={logo} alt="Logo" style={{ height: 60 }} />

                {/* Title */}
                <Title level={2} style={{ margin: 0, textAlign: 'end', flex: 1 }}>
                  V2 Retails Ltd.
                </Title>
              </div>
              <Divider style={{ borderTop: '2px solid black', marginTop: 8, marginBottom: 16 }} />
              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                22. Any balance of advance or loan taken by you from the Company shall be fully
                recovered from your salary and any other legal dues, including Gratuity, at the time
                of your departure from the services of the Company.
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                23. While working as an employee, if you enter into any business transaction with
                any party on behalf of the Company within your permissible limits, it shall be your
                responsibility to ensure the recovery of outstanding amounts. If any outstanding
                remains at the time of leaving the services of the Company, it shall be your
                responsibility to recover the amounts for remittance to the Company before you
                proceed to settle your legal dues in full and final settlement of your account.
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                24. The Company is obliged to deduct Income Tax at source as per the provisions of
                the Income Tax Act/Rules. Accordingly, you are required to submit all necessary
                proof of permitted savings/investments and other details from time to time to enable
                the Company to comply with the provisions of law. In the event of noncompliance by
                you, if the Company is required to pay any interest or payment under the Income Tax
                Act, it shall deduct the amount as may be paid or payable from your salary or other
                payments, and you shall allow the Company to comply with these requirements without
                objection.
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                25. All disputes arising out of this letter will be subject to the jurisdiction of
                the Delhi Court. The Courts, tribunals, and/or authorities at Delhi only shall have
                jurisdiction to entertain, try, and decide such disputes or differences arising out
                of or pertaining to this contract of employment, irrespective of your working
                headquarters being elsewhere at those times.
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                You are requested to return the enclosed copy duly signed as a token of your
                acceptance of the terms and conditions of your employment.
              </Paragraph>

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                We hope that this will be the beginning of your long and successful career with us.
              </Paragraph>

              <Paragraph style={{ lineHeight: 1.3 }}>
                {/* <br /> */}
                <Text strong>Yours Faithfully,</Text>,
                <br />
                <Text strong>For V2 Retails Limited</Text>,
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
                {/* <br /> */}
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

              <Paragraph style={{ textAlign: 'justify', lineHeight: 1.3 }}>
                I have read and understood the Company Rules & Policies. I agree with all Company
                Rules & Policies and the terms & conditions contained in the Appointment Letter.
              </Paragraph>

              <Paragraph style={{ lineHeight: 1.3 }}>
                Accepted: _________________
                <br />
                {candidateName}
                <br />
                (Signature of Employee)
              </Paragraph>
            </Typography>
          </div>

          <Divider style={{ borderTop: '2px solid black', marginTop: 2, marginBottom: 5 }} />
          <div>
            <Paragraph
              style={{
                fontSize: '12px',
                lineHeight: 1.5,
                // marginTop: '5px',
                textAlign: 'center', // centers the entire block
              }}
            >
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

        {/* ////////////////////////// 6th last page///////////////////////////////////////////// */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <br />
          <Typography>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Logo - replace the src with your logo path */}
              <img src={logo} alt="Logo" style={{ height: 60 }} />

              {/* Title */}
              <Title level={2} style={{ margin: 0, textAlign: 'end', flex: 1 }}>
                V2 Retails Ltd.
              </Title>
            </div>
            <Divider style={{ borderTop: '2px solid black', marginTop: 8, marginBottom: 16 }} />

            {/* <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Name">{candidateName}</Descriptions.Item>
                            <Descriptions.Item label="Designation">{position}</Descriptions.Item>
                            <Descriptions.Item label="Department"></Descriptions.Item>
                            <Descriptions.Item label="Date of Joining">{joiningDate}</Descriptions.Item>
                        </Descriptions> */}

            <div
              style={{
                padding: '40px 80px 10px 80px',
                fontFamily: 'Segoe UI, sans-serif',
                color: '#333',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text strong style={{ textAlign: 'center' }}>
                  Annexure to Appointment Letter dated{' '}
                  {new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  <br />
                  Of MR. {candidateName}
                </Text>
              </div>
              <br />
              <Text strong style={{ textAlign: 'center' }}>
                Salary Breakup
              </Text>
              <Table
                dataSource={salaryData}
                columns={columns}
                pagination={false}
                // rowClassName={() => 'custom-row'}
                bordered
                rowClassName={(record, index) => {
                  let baseClass = index % 2 === 0 ? 'custom-row even-row' : 'custom-row odd-row'

                  // Check if the row's key is either 'grossSalary' or 'grossBenefits'
                  if (
                    record.key === '4' ||
                    record.key === '5' ||
                    record.key === '10' ||
                    record.key === '11'
                  ) {
                    baseClass += ' highlight-bold-row'
                  }

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
              <Text style={{ margin: '4px 0', lineHeight: '1.3', textAlign: 'justify' }}>
                * Payment of perquisites, allowances and reimbursements shall be subject to
                provisions of Income Tax Act and other provisions, as applicable from time to time.
              </Text>
              {/* <p style={{ margin: '4px 0', lineHeight: '1.2' }}>
                                * Income Tax applicable as per Income Tax Rules
                            </p>
                            <p style={{ margin: '4px 0', lineHeight: '1.2' }}>
                                * Bonus/Ex-Gratia amount calculated on actual paid days basis during Deepawali or final settlement
                            </p>
                            <p style={{ margin: '4px 0', lineHeight: '1.2' }}>
                                * Gratuity amount payable after successful completion of five (5) years
                            </p>
                            <p style={{ margin: '4px 0', lineHeight: '1.2' }}>
                                * Variable amount will be calculated and paid as per the structure
                            </p> */}
            </div>
            <br />
            <br />

            <Paragraph style={{ lineHeight: 1.3 }}>
              {/* <br /> */}
              <Text strong>Yours Faithfully,</Text>,
              <br />
              <Text strong>For V2 Retails Limited</Text>,
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
              {/* <br /> */}
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
          <Paragraph
            style={{
              fontSize: '12px',
              lineHeight: 1.5,
              textAlign: 'center', // centers the entire block
            }}
          >
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

export default AppointmentLetterTemplate
