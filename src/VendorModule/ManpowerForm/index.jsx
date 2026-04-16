import { Button, Form, message, Tabs } from 'antd'
import Pageheading from '../../components/shared/Pageheading'
import PersonalDetails from './Tabs/PersonalDetails'
import IdentityKYC from './Tabs/IdentityKYC'
import EmployeementDetails from './Tabs/EmployeementDetails'
import { useEffect, useState } from 'react'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  AADHAAR_NUMBER,
  ADDRESS,
  ANNUAL_NET_CTC,
  BASIC_SALARY,
  CCA,
  CONTRACT_END_DATE,
  // CONTRACTOR_NAME,
  DA,
  DATE_OF_BIRTH,
  DATE_OF_JOINING,
  DEPARTMENT,
  DESIGNATION,
  ECODE,
  EMAIL,
  employeementDetailsRequiredFields,
  ESIC_APPLICABLE,
  ESIC_IP_NUMBER,
  EXTRA_ALLOWANCE,
  FATHER_SPOUSE_NAME,
  FULL_NAME,
  GENDER,
  GROSS_SALARY,
  HRA,
  identityKYCRequiredFields,
  MOBILE_NUMBER,
  MONTHLY_GROSS_CTC,
  NATURE_OF_JOB,
  PAN,
  personalDetailsRequiredFields,
  PF_APPLICABLE,
  PF_UAN,
  RELATION_TYPE,
  salaryDetailsRequiredFields,
  SHIFT_DETAILS,
  SPECIAL_ALLOWANCE,
  WORK_LOCATION,
} from '../constants'
import { getApiError, validateFieldsOrShow } from '../helpers'
import {
  checkECodeExists,
  getResourceDetailsByVCodeEcode,
  submitVendorResource,
  updateVendorResource,
} from '../../services/Services'
import dayjs from 'dayjs'
import SalaryDetails from './Tabs/SalaryDetails'

const ManpowerForm = () => {
  const navigate = useNavigate()
  const { vendorCode, employeeCode } = useParams()
  const { pathname } = useLocation()
  const [form] = Form.useForm()
  const isForUpdate = String(pathname || '').includes('/vendor/manpower/master-form/update')

  const [activeKey, setActiveKey] = useState('1')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const watch_ecode = Form.useWatch(ECODE, form)

  const fieldTabMap = {
    // tab 1
    // [CONTRACTOR_NAME]: '1',
    [WORK_LOCATION]: '1',
    [DEPARTMENT]: '1',
    [DESIGNATION]: '1',
    [DATE_OF_JOINING]: '1',
    [CONTRACT_END_DATE]: '1',
    [SHIFT_DETAILS]: '1',
    [PF_APPLICABLE]: '1',
    [ESIC_APPLICABLE]: '1',

    // tab 2
    [FULL_NAME]: '2',
    [FATHER_SPOUSE_NAME]: '2',
    [DATE_OF_BIRTH]: '2',
    [GENDER]: '2',
    [MOBILE_NUMBER]: '2',
    [EMAIL]: '2',
    [ADDRESS]: '2',
    [RELATION_TYPE]: '2',

    // tab 3
    [AADHAAR_NUMBER]: '3',
    [PAN]: '3',
    [PF_UAN]: '3',
    [ESIC_IP_NUMBER]: '3',
  }

  const items = [
    {
      key: '1',
      label: 'Employeement Details',
      forceRender: true,
      children: (
        <EmployeementDetails
          form={form}
          Form={Form}
          isActive={activeKey === '1'}
          vendorCode={vendorCode}
          vcode={vendorCode}
          ecode={employeeCode}
          onNext={() => goNext('1')}
          isForUpdate={isForUpdate}
          checkIfEcodeExists={checkIfEcodeExists}
          watch_ecode={watch_ecode}
        />
      ),
    },
    {
      key: '2',
      label: 'Personal Details',
      forceRender: true,
      children: (
        <PersonalDetails
          form={form}
          isActive={activeKey === '2'}
          onNext={() => goNext('2')}
          onPrev={goPrev}
        />
      ),
    },
    {
      key: '3',
      label: 'Identity & KYC',
      forceRender: true,
      children: (
        <IdentityKYC
          form={form}
          isActive={activeKey === '3'}
          onPrev={goPrev}
          onNext={() => goNext('3')}
          isForUpdate={isForUpdate}
        />
      ),
    },
    {
      key: '4',
      label: 'Salary Details',
      forceRender: true,
      children: (
        <SalaryDetails
          form={form}
          Form={Form}
          isActive={activeKey === '4'}
          onPrev={goPrev}
          isForUpdate={isForUpdate}
          loading={isSubmitting}
        />
      ),
    },
  ]

  const tabKeys = items.map((t) => t.key)

  const requiredFieldsByTab = {
    1: employeementDetailsRequiredFields,
    2: personalDetailsRequiredFields,
    3: identityKYCRequiredFields,
    4: salaryDetailsRequiredFields,
  }

  const handleBack = () => navigate(-1)

  async function checkIfEcodeExists() {
    if (isForUpdate) return false // prevent checking ecode in edit case

    try {
      const fd = new FormData()
      fd.append('ecode', watch_ecode)

      const response = await checkECodeExists(fd)
      console.log('ecode res:', response)

      const exists = response?.data?.exists === true
      if (exists) {
        message.error(response?.data?.message || 'Ecode already exists')
        return true // block proceed
      }

      return false // ok to proceed
    } catch (error) {
      let msg = getApiError(error, 'Error checking if ecode exists')
      message.error(msg)
    }
  }

  const manualFieldsValidations = (fieldsToValidate = [], currentKey = '') => {
    if (currentKey === '3') {
      const pfUANValue = form.getFieldValue('pfUAN')
      const esicIpNumberValue = form.getFieldValue('esicIpNumber')

      if (pfUANValue) {
        fieldsToValidate.push('pfUAN')
      }

      if (esicIpNumberValue) {
        fieldsToValidate.push('esicIpNumber')
      }
    }
  }

  function goPrev() {
    setActiveKey((prev) => String(parseInt(prev) - 1))
  }

  async function goNext(currentKey) {
    if (currentKey === '1' && watch_ecode !== '') {
      const shouldBlock = await checkIfEcodeExists()
      if (shouldBlock) return
    }

    let fieldsToValidate = [...(requiredFieldsByTab[currentKey] || [])]
    manualFieldsValidations(fieldsToValidate, currentKey)

    const ok = await validateFieldsOrShow(form, fieldsToValidate)

    if (!ok) return

    const idx = tabKeys.indexOf(currentKey)
    const nexKey = tabKeys[idx + 1]
    if (nexKey) setActiveKey(nexKey)
  }

  async function handleTabChange(targetKey) {
    if (targetKey > activeKey) {
      if (activeKey === '1' && watch_ecode !== '') {
        const shouldBlock = await checkIfEcodeExists()
        if (shouldBlock) return
      }

      const ok = await validateFieldsOrShow(form, requiredFieldsByTab[activeKey])
      if (!ok) return
    }

    setActiveKey(targetKey)
  }

  const fetchEmpDetails = async (vendorCode, employeeCode) => {
    try {
      const response = await getResourceDetailsByVCodeEcode(vendorCode, employeeCode)

      if (response.status === 200) {
        const data = response.data?.data ? response.data?.data[0] : {}

        form.setFieldsValue({
          [FULL_NAME]: data?.fullName || '',
          [FATHER_SPOUSE_NAME]: data?.fatherName ?? data?.husbandName ?? '',
          [DATE_OF_BIRTH]: dayjs(data?.dob) || '',
          [GENDER]: data?.gender || '',
          [MOBILE_NUMBER]: data?.mobile || '',
          [EMAIL]: data?.email || '',
          [ADDRESS]: data?.presentAddress || '',
          [AADHAAR_NUMBER]: data?.aadhar || '',
          [PAN]: data?.pan || '',
          [PF_UAN]: data?.uan || '',
          [ESIC_IP_NUMBER]: data?.esicno || '',
          // [CONTRACTOR_NAME]: data?.contractorName || '',
          [WORK_LOCATION]: data?.locationId,
          [DEPARTMENT]: data?.departmentId,
          [DESIGNATION]: data?.designationId,
          // [NATURE_OF_JOB]
          [DATE_OF_JOINING]: dayjs(data?.doj),
          [CONTRACT_END_DATE]: dayjs(data?.contractEndDate),
          [SHIFT_DETAILS]: data?.shiftID,
          [PF_APPLICABLE]: data?.pfApplicable ?? false,
          [ESIC_APPLICABLE]: data?.esicApplicable ?? false,
          [ECODE]: data?.ecode,
          [BASIC_SALARY]: data?.basicSalary || 0,
          [GROSS_SALARY]: data?.grosS_SALARY || 0,
          [HRA]: data?.hra || 0,
          [CCA]: data?.cca || 0,
          [DA]: data?.da || 0,
          [EXTRA_ALLOWANCE]: data?.extraAllowance || 0,
          [SPECIAL_ALLOWANCE]: data?.specialAllowance || 0,
          [MONTHLY_GROSS_CTC]: data?.monthlyGrossCTC || 0,
          [ANNUAL_NET_CTC]: data?.annuallyNetCTC || 0,
        })
      }
    } catch (error) {
      const errMsg = getApiError(error, 'Error fetching employee details')
      message.error(errMsg)
    }
  }

  const onFinishFailed = ({ errorFields }) => {
    if (!errorFields?.length) return

    // show a top toast
    message.error('Please fix the highlighted errors before submitting.')

    // jump to first invalid field's tab
    const firstNamePath = errorFields[0]?.name?.[0]
    const tabKey = fieldTabMap[firstNamePath]

    if (tabKey) setActiveKey(tabKey)

    // scroll to first error field
    form.scrollToField(firstNamePath, {
      behavior: 'smooth',
      block: 'center',
    })
  }

  const onFinish = async (values) => {
    const fullName = String(values.fullName || '').split(' ')
    const firstName = fullName?.[0] || ''
    const middleName = fullName?.[1] || ''
    const lastName = fullName.slice(2).join(' ') || ''

    const isFatherName = values.relationType === 'father'
    const isSpouseName = values.relationType === 'spouse'

    const formattedDOJ = values.dateOfJoining ? values.dateOfJoining.format('YYYY-MM-DD') : null
    const formattedEndDate = values.contractEndDate
      ? values.contractEndDate.format('YYYY-MM-DD')
      : null
    const formattedDOB = values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null
    const pinCode = String(values.address || '').slice(-6)

    const payload = {
      ...(isForUpdate && { ecode: employeeCode, isActive: true }),
      contractorCode: vendorCode,
      firstName,
      middleName,
      lastName,
      fatherName: isFatherName ? values.fatherOrSpouseName : '',
      email: values.email || '',
      mobile: values.mobileNumber || '',
      departmentId: values.department || 0,
      designationId: values.designation || 0,
      locationId: values.workLocation || 0,
      doj: formattedDOJ,
      dob: formattedDOB,
      gender: values.gender || '',
      uanNo: values.pfUAN || '',
      panNo: values.pan || '',
      aadharNo: values.aadhaarNumber || '',
      permanentAddress: values.address || '',
      permanentAddressPinCode: pinCode,
      pfApplicable: values.pfApplicable,
      esicApplicable: values.esicApplicable,
      esicNo: values.esicIpNumber,
      husbandName: isSpouseName ? values.fatherOrSpouseName : '',
      shiftId: values.shiftDetails || 0,
      contractStartDate: formattedDOJ,
      contractEndDate: formattedEndDate,
      ecode: values.eCode,
      basicSalary: parseInt(values?.basicSalary || 0),
      cca: parseInt(values?.cca || 0),
      da: parseInt(values?.da || 0),
      extraAllowance: parseInt(values?.extraAllowance || 0),
      specialAllowance: parseInt(values?.specialAllowance || 0),
      hra: parseInt(values?.hra || 0),
      grosS_SALARY: parseInt(values?.grossSalary || 0),
      monthlyGrossCTC: parseInt(values?.monthlyGrossCTC || 0),
      annuallyNetCTC: parseInt(values?.annualNetCTC || 0),
      contractorRatePerDay: parseInt(values?.rate || 0)
    }

    try {
      setIsSubmitting(true)

      const response = isForUpdate
        ? await updateVendorResource(payload, vendorCode, employeeCode)
        : await submitVendorResource(payload)

      if (response.status === 200) {
        message.success(
          response.data?.message || `Resource ${isForUpdate ? 'updated' : 'added'} successfully`,
        )
        form.resetFields()
        handleBack()
      }
    } catch (error) {
      const err = getApiError(error, 'Error submitting resource data')
      message.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (vendorCode && employeeCode) fetchEmpDetails(vendorCode, employeeCode)
  }, [vendorCode, employeeCode])

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        size="small"
        style={{ marginBottom: 16 }}
      >
        Back
      </Button>

      <Pageheading title="Resource Form" />
      <Form layout="vertical" form={form} onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <Tabs activeKey={activeKey} items={items} onChange={handleTabChange} />
      </Form>
    </div>
  )
}

export default ManpowerForm
