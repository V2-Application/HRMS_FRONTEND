import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { Typography, Divider, Descriptions, Table, Button } from 'antd'
import logo from '/V2logo.png'
import stamp from '/stamp.png'

const { Title, Paragraph, Text } = Typography

const FullFinalSettlement = ({ logo, stamp, setshowTemplate, savePDFOnly, downloadPDF }) => {
  const letterRef = useRef(null)

  // Data for table
  const earnings = [
    { key: 'e1', description: 'Net Salary of March 2025', amount: 7983 },
    { key: 'e2', description: 'Bonus (From 01-10-2024 to 18-03-2025)', amount: 5360 },
    { key: 'e3', description: 'Gratuity', amount: 33262 },
    { key: 'e4', description: 'Leave Encashment (65.0 Days)', amount: 28828 },
  ]

  const deductions = [
    { key: 'd1', description: 'Professional Tax', amount: 200 },
    { key: 'd2', description: 'Notice Pay Recovery', amount: 1000 },
  ]

  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0)
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0)
  const netPayable = totalEarnings - totalDeductions

  const combinedData = [
    { key: 'head-earn', description: <Text strong>Earnings</Text>, amount: '' },
    ...earnings.map((item) => ({
      ...item,
      amount: item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
    })),
    { key: 'head-deduct', description: <Text strong>Deductions</Text>, amount: '' },
    ...deductions.map((item) => ({
      ...item,
      amount: item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
    })),
  ]

  return (
    <div>
      {/* <div style={{ textAlign: 'right', marginBottom: 20 }}>
        <Button type="primary" onClick={() => setshowTemplate?.(false)} style={{ marginRight: 10 }}>
          Edit
        </Button>
        <Button type="primary" onClick={savePDFOnly} style={{ marginRight: 10 }}>
          Save
        </Button>
        <Button type="primary" onClick={downloadPDF}>
          Generate and Download PDF
        </Button>
      </div> */}

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
        {logo && (
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
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Typography>
            {/* <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {logo && <img src={logo} alt="Logo" style={{ height: 60 }} />}
              <Title level={2} style={{ margin: 0, textAlign: 'end', flex: 1 }}>
                V2 RETAIL LTD
              </Title>
            </div>
            <Text>
              SHARAN TOWER, OPPOSITE RAM JANKI MANDIR, ALLAHABAD-FAIZABAD ROAD, PRATAPGARH, UP
            </Text> */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              {logo && (
                <img src={logo} alt="Company Logo" style={{ height: 60, objectFit: 'contain' }} />
              )}
              <div style={{ textAlign: 'right', flex: 1 }}>
                <Title level={2} style={{ margin: 0 }}>
                  V2 RETAIL LTD
                </Title>
                <Text style={{ fontSize: 13 }}>
                  SHARAN TOWER, OPPOSITE RAM JANKI MANDIR,
                  <br />
                  ALLAHABAD-FAIZABAD ROAD, PRATAPGARH, UP
                </Text>
              </div>
            </div>

            <Divider style={{ borderTop: '2px solid black', marginTop: 8, marginBottom: 16 }} />

            <Title level={4} style={{ textAlign: 'center', textDecoration: 'underline' }}>
              Full and Final Settlement
            </Title>

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Name of Employee">MR. RAM SINGH</Descriptions.Item>
              <Descriptions.Item label="Employee Code">V15060</Descriptions.Item>
              <Descriptions.Item label="Designation">HEAD CASHIER</Descriptions.Item>
              <Descriptions.Item label="Date of Joining">13-03-2020</Descriptions.Item>
              <Descriptions.Item label="Last Working Day">18-03-2025</Descriptions.Item>
              <Descriptions.Item label="Department">RETAIL OPERATIONS</Descriptions.Item>
              <Descriptions.Item label="Location">S/R - PRATAPGARH</Descriptions.Item>
              <Descriptions.Item label="Bank Details">
                BANK OF BARODA, A/c: 5126810003639, IFSC: BARB0PUREYP
              </Descriptions.Item>
            </Descriptions>

            <Paragraph style={{ marginTop: 20 }}>
              <Text strong>Details of Full & Final Amount</Text>
            </Paragraph>

            <Table
              bordered
              pagination={false}
              dataSource={combinedData}
              columns={[
                {
                  title: 'Earnings / Deductions',
                  dataIndex: 'description',
                  key: 'description',
                },
                {
                  title: 'Amount (Rs.)',
                  dataIndex: 'amount',
                  key: 'amount',
                },
              ]}
              summary={() => (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell>Total Earnings</Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text>
                        {totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell>Total Deductions</Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text>
                        {totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell>
                      <Text strong>Net Payable</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <Text strong>
                        {netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              )}
            />

            <Paragraph style={{ marginTop: 20 }}>
              <Text strong>Net Payable: Rs. {netPayable.toLocaleString('en-IN')}</Text> (In Words:
              Rupees Seventy Five Thousand Four Hundred Thirty Three Only)
            </Paragraph>

            <Divider />
            <div style={{ marginTop: 40, marginBottom: 40 }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}
              >
                <div style={{ flex: 1 }}>
                  <Text>Prepared By: __________________</Text>
                </div>

                <div style={{ flex: 1 }}>
                  <Text>Checked By: __________________</Text>
                </div>

                <div style={{ flex: 1 }}>
                  <Text>Authorised By: __________________</Text>
                </div>
              </div>
            </div>

            <Paragraph style={{ fontSize: '14px' }}>
              <Text underline strong>
                DECLARATION
              </Text>
              <br />
              <br />
              I, Mr. Ram Singh s/o Ram Ajor r/o Paiknagar Rakha Pratapgarh do hereby certify that I
              have willingly and voluntarily resigned from the post of HEAD CASHIER w.e.f.
              18-03-2025 from M/s. V2 RETAIL LTD
              <br />
              <br />I certify that I have received Rs. {netPayable.toLocaleString('en-IN')}/- for
              Full & Final settlement of my account from the company.
              <br />
              <br />I further certify that nothing more is due from the company on any account
              whatsoever.
            </Paragraph>

            <Paragraph style={{ marginTop: 60 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <Text strong>Name of Employee:</Text> MR. RAM SINGH
                </div>
                <div>
                  <Text>Sign: ______________________</Text>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <div>
                  <Text strong>Address:</Text> PAIKNAGAR, RAKHA, PRATAPGARH
                </div>
                <div>
                  <Text>Date: ______________________</Text>
                </div>
              </div>
            </Paragraph>
          </Typography>
        </div>
      </div>
    </div>
  )
}

FullFinalSettlement.propTypes = {
  logo: PropTypes.string,
  stamp: PropTypes.string,
  setshowTemplate: PropTypes.func,
  savePDFOnly: PropTypes.func,
  downloadPDF: PropTypes.func,
}

FullFinalSettlement.defaultProps = {
  logo: logo,
  stamp: stamp,
  setshowTemplate: () => {},
  savePDFOnly: () => {},
  downloadPDF: () => {},
}

export default FullFinalSettlement
