import React, { useState } from 'react'
import { Modal, Button, Card } from 'antd'
import FullFinalSettlement from './Full&FinalTemplate'
import logo from '/V2logo.png'
import stamp from '/stamp.png'
import { Form, Input, Row, Col } from 'antd'

const FullFinalSettlementModal = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  // Mock functions for PDF actions (replace with actual implementations)
  const savePDFOnly = () => {
    // console.log('Save PDF Only triggered')
    // Implement PDF saving logic here
  }

  const downloadPDF = () => {
    // console.log('Download PDF triggered')
    // Implement PDF download logic here
  }

  const setshowTemplate = (value) => {
    // console.log('Show Template:', value)
    // Implement template toggle logic if needed
  }

  // const FullFinalSettlement = ({
  //   logo,
  //   stamp,
  //   setshowTemplate,
  //   savePDFOnly,
  //   downloadPDF,
  // })

  return (
    <>
      <Card title=" Full & Final Settlement">
        <div>
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={7}>
                <Form.Item label="Last Credited Salary" name="employeeName">
                  <Input placeholder="" />
                </Form.Item>
              </Col>
              <Col span={7}>
                <Form.Item label="Last Salary processing date" name="ecode">
                  <Input placeholder="" />
                </Form.Item>
              </Col>
            </Row>
            {/* More rows/fields can go here */}
          </Form>

          <Card title="F&F Calculation">
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={7}>
                  <Form.Item label="" name="">
                    <Input placeholder="" />
                  </Form.Item>
                </Col>
                <Col span={7}>
                  <Form.Item label="" name="">
                    <Input placeholder="" />
                  </Form.Item>
                </Col>
              </Row>
              {/* More rows/fields can go here */}
            </Form>

            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <Button type="primary" onClick={showModal} style={{ marginRight: 8 }}>
                View
              </Button>
              <Button type="primary" onClick={downloadPDF} style={{ marginRight: 8 }}>
                Download PDF
              </Button>
              <Button type="primary" onClick={downloadPDF}>
                Email PDF
              </Button>
            </div>
          </Card>
          <Modal
            isModalVisible={true}
            visible={isModalVisible}
            onCancel={handleCancel}
            footer={null} // Remove default footer to use custom buttons inside FullFinalSettlement
            width={900} // Adjust width to fit the content
            style={{ top: 20 }}
          >
            <FullFinalSettlement
              logo={logo}
              stamp={stamp}
              setshowTemplate={setshowTemplate}
              savePDFOnly={savePDFOnly}
              downloadPDF={downloadPDF}
            />
          </Modal>
        </div>
      </Card>
    </>
  )
}

export default FullFinalSettlementModal
