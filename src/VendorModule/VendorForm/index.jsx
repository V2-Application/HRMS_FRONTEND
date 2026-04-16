import { Button, Form, message, Space, Spin, Tabs, Typography } from 'antd'
import Pageheading from '../../components/shared/Pageheading'
import BasicDetails from './Tabs/BasicDetails'
import ContactDetails from './Tabs/ContactDetails'
import StatCompDetails from './Tabs/StatCompDetails'
import BankPaymentDetails from './Tabs/BankPaymentDetails'
import { useEffect, useState } from 'react'
import {
  bankPaymentDetails,
  basicDetailsRequiredFields,
  contactDetailsRequiredFields,
  statCompDetailsRequiredFields,
} from '../constants'
import {
  getApiError,
  normalizeString,
  normalizeStringToUpper,
  validateFieldsOrShow,
} from '../helpers'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'

const { Title } = Typography

const index = () => {
  const navigate = useNavigate()
  const { vendorId } = useParams()
  const isVendorId = !!vendorId
  const [form] = Form.useForm()

  const [activeKey, setActiveKey] = useState('1')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const requiredFieldsByTab = {
    1: basicDetailsRequiredFields,
    2: contactDetailsRequiredFields,
    3: statCompDetailsRequiredFields,
    4: bankPaymentDetails,
  }

  const items = [
    {
      key: '1',
      label: 'Basic Details',
      children: (
        <BasicDetails form={form} isActive={activeKey === '1'} onNext={() => goNext('1')} />
      ),
    },
    {
      key: '2',
      label: 'Contact Details',
      children: (
        <ContactDetails
          form={form}
          isActive={activeKey === '2'}
          onNext={() => goNext('2')}
          onPrev={goPrev}
        />
      ),
    },
    {
      key: '3',
      label: 'Statutory & Compliance Details',
      children: (
        <StatCompDetails
          form={form}
          isActive={activeKey === '3'}
          onNext={() => goNext('3')}
          onPrev={goPrev}
        />
      ),
    },
    {
      key: '4',
      label: 'Bank & Payment Details',
      children: (
        <BankPaymentDetails
          form={form}
          isActive={activeKey === '4'}
          onPrev={goPrev}
          isSubmitting={isSubmitting}
        />
      ),
    },
  ]

  const tabKeys = items.map((t) => t.key)

  const handleBack = () => navigate(-1)

  function goPrev() {
    setActiveKey((prev) => String(parseInt(prev) - 1))
  }

  async function goNext(currentKey) {
    const ok = await validateFieldsOrShow(form, requiredFieldsByTab[currentKey])
    if (!ok) return

    const idx = tabKeys.indexOf(currentKey)
    const nextKey = tabKeys[idx + 1]
    if (nextKey) setActiveKey(nextKey)
  }

  async function handleTabChange(targetKey) {
    const ok = await validateFieldsOrShow(form, requiredFieldsByTab[activeKey])
    if (!ok) return

    setActiveKey(targetKey)
  }

  const onFinish = (values) => {
    try {
      const vendorBankDetails = [
        {
          bankName: normalizeString(values.bankName),
          branchName: normalizeString(values.branchName),
          accountHolderName: normalizeString(values.accountHolderName),
          accountNumber: normalizeString(values.accountNumber),
          ifscCode: normalizeString(values.ifscCode),
          accountType: normalizeString(values.accountType),
          paymentMode: normalizeString(values.paymentMode),
          beneficiaryName: normalizeString(values.beneficiaryName),
          gstApplicability: values.gstApplicability,
          bankVerificationStatus: normalizeString(values.bankVerficationStatus),
        },
      ]

      const vendorContactDetails = [
        {
          registeredAddress: normalizeString(values.registeredAddress),
          siteAddress: normalizeString(values.siteAddress),
          contactPersonName: normalizeString(values.contactPersonName),
          mobileNumber: parseInt(normalizeString(values.mobileNumber)),
          email: normalizeString(normalizeString(values.emailId)),
        },
      ]

      const vendorComplianceDetails = [
        {
          pan: normalizeStringToUpper(values.pan),
          gstin: normalizeString(values.gstin),
          pfRegistrationNumber: normalizeStringToUpper(values.pfNumber),
          esicRegistrationNumber: parseInt(normalizeString(values.esicNumber)),
          labourLicenseNumber: normalizeString(values.labourLicenseNumber),
        },
      ]

      const payload = {
        contractorName: normalizeString(values.contractStatus),
        contractorCode: normalizeString(values.contractorCode),
        serviceCategory: normalizeString(values.serviceCategory),
        contractStartDate: values.contractStartDate
          ? values.contractStartDate.format('YYYY-MM-DD')
          : null,
        contractEndDate: values.contractEndDate
          ? values.contractEndDate.format('YYYY-MM-DD')
          : null,
        contractStatus: normalizeString(values.contractStatus),
        vendorBankDetails,
        vendorContactDetails,
        vendorComplianceDetails,
      }

      setIsSubmitting(true)
    } catch (error) {
      const errMsg = getApiError(error, 'Submission error')
      message.error(errMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (vendorId) {
      form.setFieldsValue({
        contractorName: 'Rohit Khatri',
      })
    } else {
      form.resetFields()
    }
  }, [vendorId])

  return (
    <div>
      {vendorId && (
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          size="small"
          style={{ marginBottom: 16 }}
        >
          Back
        </Button>
      )}

      <Pageheading
        title="Vendor Master Form"
        marginBottom="0px"
        marginTop={isVendorId ? '0px' : '-13px'}
        fontSize={isVendorId ? '2rem' : '27px'}
      />

      {vendorId && isLoading ? (
        <div style={{ textAlign: 'center' }}>
          <Spin />
        </div>
      ) : (
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Tabs activeKey={activeKey} onChange={handleTabChange} items={items} />
        </Form>
      )}
    </div>
  )
}

export default index
