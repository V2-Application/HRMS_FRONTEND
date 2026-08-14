const FIELDS = Object.freeze({
  ECODE: 'eCode',
  FULL_NAME: 'fullName',
  FATHER_SPOUSE_NAME: 'fatherOrSpouseName',
  DATE_OF_BIRTH: 'dateOfBirth',
  GENDER: 'gender',
  MOBILE_NUMBER: 'mobileNumber',
  EMAIL: 'email',
  ADDRESS: 'address',
  RELATION_TYPE: 'relationType',
  AADHAAR_NUMBER: 'aadhaarNumber',
  PAN: 'pan',
  PF_UAN: 'pfUAN',
  ESIC_IP_NUMBER: 'esicIpNumber',
  // CONTRACTOR_NAME: 'contractorName',
  WORK_LOCATION: 'workLocation',
  DEPARTMENT: 'department',
  SUB_DEPARTMENT_1: 'subDepartment1',
  SUB_DEPARTMENT_2: 'subDepartment2',
  SUB_DEPARTMENT_3: 'subDepartment3',
  DESIGNATION: 'designation',
  NATURE_OF_JOB: 'natureOfJob',
  DATE_OF_JOINING: 'dateOfJoining',
  CONTRACT_END_DATE: 'contractEndDate',
  SHIFT_DETAILS: 'shiftDetails',
  PF_APPLICABLE: 'pfApplicable',
  ESIC_APPLICABLE: 'esicApplicable',
  BASIC_SALARY: 'basicSalary',
  GROSS_SALARY: 'grossSalary',
  HRA: 'hra',
  CCA: 'cca',
  DA: 'da',
  EXTRA_ALLOWANCE: 'extraAllowance',
  SPECIAL_ALLOWANCE: 'specialAllowance',
  MONTHLY_GROSS_CTC: 'monthlyGrossCTC',
  ANNUAL_NET_CTC: 'annualNetCTC',
  RATE: 'rate'
})

export const {
  ECODE,
  FULL_NAME,
  FATHER_SPOUSE_NAME,
  DATE_OF_BIRTH,
  GENDER,
  MOBILE_NUMBER,
  EMAIL,
  ADDRESS,
  RELATION_TYPE,
  AADHAAR_NUMBER,
  PAN,
  PF_UAN,
  ESIC_IP_NUMBER,
  // CONTRACTOR_NAME,
  WORK_LOCATION,
  DEPARTMENT,
  SUB_DEPARTMENT_1,
  SUB_DEPARTMENT_2,
  SUB_DEPARTMENT_3,
  DESIGNATION,
  NATURE_OF_JOB,
  DATE_OF_JOINING,
  CONTRACT_END_DATE,
  SHIFT_DETAILS,
  PF_APPLICABLE,
  ESIC_APPLICABLE,
  BASIC_SALARY,
  GROSS_SALARY,
  HRA,
  CCA,
  DA,
  EXTRA_ALLOWANCE,
  SPECIAL_ALLOWANCE,
  MONTHLY_GROSS_CTC,
  ANNUAL_NET_CTC,
  RATE
} = FIELDS

export const basicDetailsRequiredFields = [
  'contractorName',
  'contractorCode',
  'serviceCategory',
  'contractStartDate',
  'contractEndDate',
  'contractStatus',
]

export const contactDetailsRequiredFields = [
  'registeredAddress',
  'siteAddress',
  'contactPersonName',
  'mobileNumber',
  'emailId',
]

export const statCompDetailsRequiredFields = ['pan', 'gstin', 'labourLicenseNumber']

export const bankPaymentDetails = [
  'bankName',
  'branchName',
  'accountHolderName',
  'accountNumber',
  'ifscCode',
  'accountType',
  'paymentMode',
  'beneficiaryName',
  'gstApplicability',
]

export const personalDetailsRequiredFields = [
  FULL_NAME,
  // FATHER_SPOUSE_NAME,
  DATE_OF_BIRTH,
  GENDER,
  // MOBILE_NUMBER,
  // ADDRESS,
  // EMAIL,
]

export const identityKYCRequiredFields = [
  // AADHAAR_NUMBER, PAN
]

export const employeementDetailsRequiredFields = [
  // CONTRACTOR_NAME,
  WORK_LOCATION,
  DEPARTMENT,
  DESIGNATION,
  // NATURE_OF_JOB,
  DATE_OF_JOINING,
  // CONTRACT_END_DATE,
  SHIFT_DETAILS,
  // PF_APPLICABLE,
  // ESIC_APPLICABLE,
]

export const salaryDetailsRequiredFields = [
  BASIC_SALARY,
  GROSS_SALARY,
  HRA,
  CCA,
  DA,
  EXTRA_ALLOWANCE,
  SPECIAL_ALLOWANCE,
  MONTHLY_GROSS_CTC,
  ANNUAL_NET_CTC,
  RATE
]

export const presets = [
  'magenta',
  'red',
  'volcano',
  'orange',
  'gold',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
]

export const month_num_to_name = {
  '01': 'Jan',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Apr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Aug',
  '09': 'Sep',
  10: 'Oct',
  11: 'Nov',
  12: 'Dec',
}

const currentYear = new Date().getFullYear()
const isLeapYear = Number(currentYear) % 4 === 0

export const maxDaysInMonth = {
  Jan: 31,
  Feb: isLeapYear ? 29 : 28,
  Mar: 31,
  Apr: 30,
  May: 31,
  Jun: 30,
  Jul: 31,
  Aug: 31,
  Sep: 30,
  Oct: 31,
  Nov: 30,
  Dec: 31,
}

export const punchKeyMap = {
  punch1: 'Office In',
  punch2: 'Lunch Out',
  punch3: 'Lunch In',
  punch4: 'Office Out',
  punch5: 'E1',
  punch6: 'E2',
  punch7: 'E3',
  punch8: 'E4',
  punch9: 'E5',
  punch10: 'E6',
  punch11: 'E7',
  punch12: 'E8',
}

export const hrNames = [
  { label: 'Nikhil Chhokra', value: 'Nikhil Chhokra' },
  { label: 'Narad Sah', value: 'Narad Sah' },
  { label: 'Abhishek Kumar', value: 'Abhishek Kumar' },
  { label: 'Khusboo Jha', value: 'Khusboo Jha' },
  { label: 'Ruchi Dubey', value: 'Ruchi Dubey' },
  { label: 'Sakshi', value: 'Sakshi' },
]

export const validDecimalPattern = {
  pattern: /^(?:\d+|\d*\.\d{1,2})$/,
  message: 'Enter a valid amount (up to 2 decimal places)',
}
