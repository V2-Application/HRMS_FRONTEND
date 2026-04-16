// ManpowerDetails.jsx
import { Row, Col, Typography, Space, Button, Avatar, Divider, message, Spin } from 'antd'
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons'
import DetailItem from '../../DetailItem'
import { useNavigate, useParams } from 'react-router-dom'
import Pageheading from '../../../../components/shared/Pageheading'
import { useEffect, useState } from 'react'
import { getResourceDetailsByVCodeEcode } from '../../../../services/Services'
import { getApiError } from '../../../helpers'

const { Title } = Typography

const Section = ({ title, children }) => (
  <div style={{ padding: '16px 0' }}>
    <Title level={5} style={{ marginBottom: 16 }}>
      {title}
    </Title>
    {children}
    <Divider style={{ margin: '16px 0' }} />
  </div>
)

const ViewDetails = () => {
  const navigate = useNavigate()
  const { vendorCode, employeeCode } = useParams()
  const [resource, setResource] = useState({})
  const [isResourceLoading, setIsResourceLoading] = useState(false)

  const onBack = () => navigate(-1)

  const fetchResource = async (vcode, ecode) => {
    try {
      setIsResourceLoading(true)
      const response = await getResourceDetailsByVCodeEcode(vcode, ecode)
      if (response.status === 200) {
        const data = response.data?.data[0] || {}
        setResource(data)
      }
    } catch (error) {
      const errMsg = getApiError(error, 'Error fetching resource')
      message.error(errMsg)
    } finally {
      setIsResourceLoading(false)
    }
  }

  useEffect(() => {
    if (vendorCode && employeeCode) fetchResource(vendorCode, employeeCode)
  }, [vendorCode, employeeCode])

  return (
    <div style={{ padding: '0px 16px', background: '#fff' }}>
      {/* Page header (like Vendor Details) */}
      <Space align="center" size={24} style={{ width: '100%', marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={onBack} size="small">
          Back
        </Button>
      </Space>

      <Pageheading title="Resource Details" />

      {isResourceLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Spin />
        </div>
      ) : (
        <>
          {/* Top summary row (avatar + a few key fields) */}
          <Row gutter={48} style={{ paddingBottom: 24, borderBottom: '1px solid #f0f0f0' }}>
            <Col span={6}>
              <Space align="center">
                <Avatar size={48} icon={<UserOutlined />} />
                <div style={{ minWidth: 0 }}>
                  <Typography.Text type="secondary">Employee</Typography.Text>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    {resource?.fullName || '-'}
                  </Typography.Title>
                </div>
              </Space>
            </Col>

            <Col span={6}>
              <DetailItem label="Mobile Number" value={resource?.mobile} />
            </Col>

            <Col span={6}>
              <DetailItem label="Department" value={resource?.departmentName} />
            </Col>

            <Col span={6}>
              <DetailItem label="Work Location" value={resource?.locationName} />
            </Col>
          </Row>

          {/* Sections – mirror your 3 form tabs */}

          {/* Personal Details */}
          <Section title="Personal Details">
            <Row gutter={[48, 16]}>
              <Col span={8}>
                <DetailItem label="Full Name" value={resource?.fullName} />
              </Col>
              <Col span={8}>
                <DetailItem
                  label="Father/Spouse Name"
                  value={resource?.fatherName ?? resource?.husbandName}
                />
              </Col>
              <Col span={8}>
                <DetailItem
                  label="Date of Birth"
                  value={String(resource?.dob || '').split('T')[0]}
                />
              </Col>

              <Col span={8}>
                <DetailItem label="Gender" value={resource?.gender} />
              </Col>
              <Col span={8}>
                <DetailItem label="Mobile Number" value={resource?.mobile} />
              </Col>
              <Col span={8}>
                <DetailItem label="Address" value={resource?.presentAddress} />
              </Col>
            </Row>
          </Section>

          {/* Identity & KYC */}
          <Section title="Identity & KYC">
            <Row gutter={[48, 16]}>
              <Col span={8}>
                <DetailItem label="Aadhaar Number" value={resource?.aadhar} />
              </Col>
              <Col span={8}>
                <DetailItem label="PAN" value={resource?.pan} />
              </Col>
              <Col span={8}>
                <DetailItem label="PF UAN" value={resource?.uan} />
              </Col>

              <Col span={8}>
                <DetailItem label="ESIC IP No." value={resource?.esicno} />
              </Col>
            </Row>
          </Section>

          {/* Employment Details */}
          <Section title="Employment Details">
            <Row gutter={[48, 16]}>
              <Col span={8}>
                <DetailItem label="Contractor Name" value={resource?.contractorName} />
              </Col>
              <Col span={8}>
                <DetailItem label="Work Location" value={resource?.locationName} />
              </Col>
              <Col span={8}>
                <DetailItem label="Department" value={resource?.departmentName} />
              </Col>

              <Col span={8}>
                <DetailItem label="Designation" value={resource?.designationName} />
              </Col>

              {/* <Col span={8}>
            <DetailItem label="Nature of Job" value={natureOfJob} />
          </Col> */}

              <Col span={8}>
                <DetailItem label="Date of Joining" value={resource?.contractStartDate} />
              </Col>

              <Col span={8}>
                <DetailItem label="Contract End Date" value={resource?.contractEndDate} />
              </Col>

              <Col span={8}>
                <DetailItem label="Shift" value={resource?.shiftName} />
              </Col>

              <Col span={8}>
                <DetailItem label="PF Applicable" value={resource?.pfApplicable ? 'Yes' : 'No'} />
              </Col>

              <Col span={8}>
                <DetailItem
                  label="ESIC Applicable"
                  value={resource?.esicApplicable ? 'Yes' : 'No'}
                />
              </Col>
            </Row>
          </Section>
        </>
      )}
    </div>
  )
}

export default ViewDetails
