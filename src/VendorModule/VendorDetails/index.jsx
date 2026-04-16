import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Button, Col, Divider, message, Row, Space, Spin, Tooltip, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DetailItem from './DetailItem'
import EmployeesList from './EmployeesList'
import Pageheading from '../../components/shared/Pageheading'
import { getContractorByCode } from '../../services/Services'

const { Title, Text } = Typography

const Index = () => {
  const { contractorCode } = useParams()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(false)
  const [vendor, setVendor] = useState({})
  const [isDetailsVisible, setIsDetailsVisible] = useState(false)

  const handleBack = () => navigate(-1)
  const toggleDetails = () => setIsDetailsVisible((prev) => !prev)

  const fetchVendorByCode = async (code) => {
    try {
      setIsLoading(true)

      const response = await getContractorByCode(code)

      if (response?.status === 200) {
        // ✅ API returns: { data: [ { ...vendor } ] }
        const list = response.data?.data || []
        setVendor(list?.[0] || {})
      }
    } catch (error) {
      const errMsg = error?.response?.data?.message || 'Error fetching vendor data'
      message.error(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (contractorCode) fetchVendorByCode(contractorCode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractorCode])

  return (
    <div style={{ padding: '0px 16px' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={handleBack} size="small">
        Back
      </Button>

      <Pageheading title="Vendor Details" marginTop="0.4rem" />
      <Divider style={{ margin: '8px 0 16px' }} />

      {isLoading ? (
        <div style={{ textAlign: 'center' }}>
          <Spin />
        </div>
      ) : (
        <>
          <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
            <Button onClick={toggleDetails} type={isDetailsVisible ? 'default' : 'primary'}>
              {isDetailsVisible ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>

          {/* Header card */}
          <Row gutter={[24, 16]} align="middle" style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8}>
              <Space align="center">
                <Avatar size={48} icon={<UserOutlined />} />

                <div style={{ minWidth: 0 }}>
                  <Text type="secondary">Vendor</Text>
                  <br />

                  <Tooltip title={vendor.contractorName}>
                    <Text strong ellipsis style={{ display: 'block', maxWidth: 260 }}>
                      {vendor.contractorName || '-'}
                    </Text>
                  </Tooltip>
                </div>
              </Space>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <DetailItem label={'Email Id'} value={vendor?.emailID || '-'} />
            </Col>

            <Col xs={24} sm={12} md={4}>
              <DetailItem label="Phone No" value={vendor?.mobileNumber || '-'} />
            </Col>

            <Col xs={24} sm={12} md={4}>
              <DetailItem label="Location" value={vendor?.registeredAddress || '-'} />
            </Col>
          </Row>

          <Divider />

          {isDetailsVisible ? (
            <>
              {/* Contract Information */}
              <Title level={5} style={{ marginTop: 0 }}>
                Contract Information
              </Title>

              <Row gutter={[24, 12]}>
                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="Contractor Name" value={vendor.contractorName || '-'} />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="Contractor Code" value={vendor.contractorCode || '-'} />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="Service Category" value={vendor.serviceCategory || '-'} />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="Nature Of Work" value={vendor.natureOfWork || '-'} />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem
                    label="Contract Start Date"
                    value={
                      vendor.contractStartDate
                        ? String(vendor.contractStartDate).split('T')[0]
                        : '-'
                    }
                  />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem
                    label="Contract End Date"
                    value={
                      vendor.contractEndDate ? String(vendor.contractEndDate).split('T')[0] : '-'
                    }
                  />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="Contract Status" value={vendor.contractStatus || '-'} />
                </Col>
              </Row>

              <Divider />

              {/* Contact Details */}
              <Title level={5}>Contact Details</Title>

              <Row gutter={[24, 12]}>
                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="Registered Address" value={vendor.registeredAddress || '-'} />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="Site Address" value={vendor.siteAddress || '-'} />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="Contact Person Name" value={vendor.contactPersonName || '-'} />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="Mobile Number" value={vendor.mobileNumber || '-'} />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="Email Id" value={vendor.emailID || '-'} />
                </Col>
              </Row>

              <Divider />

              {/* Statutory & Compliance Details */}
              <Title level={5}>Statutory &amp; Compliance Details</Title>

              <Row gutter={[24, 12]}>
                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="PAN No." value={vendor.pan || '-'} />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="GSTIN" value={vendor.gstin || '-'} />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="PF Number" value={vendor.pfRegistrationNumber || '-'} />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="ESIC Number" value={vendor.esicRegistrationNumber || '-'} />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem
                    label="Labour License No."
                    value={vendor.labourLicenseNumber || '-'}
                  />
                </Col>
              </Row>

              <Divider />

              {/* Bank & Payment Details */}
              <Title level={5}>Bank &amp; Payment Details</Title>

              <Row gutter={[24, 12]}>
                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="Bank Name" value={vendor.bankName || '-'} />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="Branch Name" value={vendor.branchName || '-'} />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="Account Holder Name" value={vendor.accountHolderName || '-'} />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="Account Number" value={vendor.accountNumber || '-'} />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="IFSC Code" value={vendor.ifscCode || '-'} />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="Account Type" value={vendor.accountType || '-'} />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="Payment Mode" value={vendor.paymentMode || '-'} />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem label="Beneficiary Name" value={vendor.beneficiaryName || '-'} />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem
                    label="GST Applicability"
                    value={vendor.gstApplicability ? 'Yes' : 'No'}
                  />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <DetailItem
                    label="Bank Verification Status"
                    value={vendor.bankVerificationStatus ? 'Yes' : 'No'}
                  />
                </Col>
              </Row>
            </>
          ) : (
            // ⚠️ EmployeesList currently expects vendorId. If you need employees by contractorCode,
            // update EmployeesList to use contractorCode API.
            <EmployeesList vendorId={0} />
          )}
        </>
      )}
    </div>
  )
}

export default Index
