import React from 'react'
import EmployeeAddNew from './employees/CandidateAdd_New'
import BonusMapping from './Ecodewisebonus/BonusMapping'
import AttendanceRegularizationPage from './components/Attandence/AttendanceRegularizationPage'
import { element } from 'prop-types'
import { FNFDetail } from './components/FullAndFinal/FNFDetail'

const SalaryRecalculate = React.lazy(() => import('./components/payroll/SalaryRecalculate'))
const ProcessSalary = React.lazy(() => import('./components/payroll/ProcessSalary'))
// const ProcessedSalaryRequest = React.lazy(() => import('./components/payroll/ProcessSalaryRequest'))
const ProcessedSalaryRequest1 = React.lazy(
  () => import('./components/payroll/ProcessSalaryRequest1'),
)
const DocumentGenerate = React.lazy(() => import('./components/payroll/DocumentGenerate'))
const ApplicationForm = React.lazy(() => import('./employees/ApplicationForm'))
const InterviewForm = React.lazy(() => import('./components/form/InterviewForm '))

const ProfessionalTax = React.lazy(() => import('./ProfessionalTax/ProfessonalTax'))
const GeofenceAssignment = React.lazy(
  () => import('../src/components/roleManagement/RBAC/GeofencingAssignment'),
)

const RegisterCandidate = React.lazy(() => import('./employees/RegisterCandidate'))
const jd_upload = React.lazy(() => import('./components/jd_upload/Jd_upload'))
const Attendance = React.lazy(() => import('./components/Attandence/Attendance'))
const RegularizeRequestTable = React.lazy(
  () => import('./components/Attandence/RegularizeRequestTable'),
)
const ApplicantResumeAcceptance = React.lazy(
  () => import('./components/applicant/ApplicantResumeAcceptance/ApplicantResumeAcceptance'),
)
const GeofenceRequestTable = React.lazy(
  () => import('./components/Geotagging/GeofenceRequesttable'),
)
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const EmployeeDashboard = React.lazy(() => import('./views/dashboard/EmployeeDashboard'))
const EmployeeProfile = React.lazy(() => import('./employees/EmployeeProfile'))
const EmployeeProfileViewOnly = React.lazy(() => import('./employees/EmployeeProfileViewOnly'))
const MyProfile = React.lazy(() => import('./components/profile/MyProfile'))
const ProfileUpdateReview = React.lazy(() => import('./components/profile/ProfileUpdateReview'))
const FormCandidateList = React.lazy(() => import('./employees/CandidateList'))
const EmployeeLeaveApply = React.lazy(() => import('./views/pages/employeeLeave/EmloyeeLeave'))
const EmployeeLeaveStatusList = React.lazy(
  () => import('./views/pages/employeeLeave/EmployeeLeaveStatusList'),
)
const ManagerEmpLeaveList = React.lazy(
  () => import('./views/pages/employeeLeave/ManagerEmpLeaveList'),
)
const EmployeesList = React.lazy(() => import('./employees/EmployeesList'))
const GapReports = React.lazy(() => import('./views/reports/GapReports'))
const PtaxPolicy = React.lazy(() => import('./uploaders/PolicyMaster/PtaxPolicy'))
const LwfPolicy = React.lazy(() => import('./uploaders/PolicyMaster/LwfPolicy'))
const StoreReportingManager = React.lazy(() => import('./views/admin/StoreReportingManager'))
const DeptDesignationMap = React.lazy(() => import('./views/masters/DeptDesignationMap'))
const EmployeesTransferList = React.lazy(() => import('./employees/EmployeeTansferApprovals'))
const MasterData = React.lazy(() => import('./views/pages/Masters/Master'))
const PFMaster = React.lazy(() => import('./views/pages/Masters/PFMaster'))
const LWFMaster = React.lazy(() => import('./views/pages/Masters/LWFMaster'))
const PTMaster = React.lazy(() => import('./views/pages/Masters/PTMaster'))
const ESICEmpMaster = React.lazy(() => import('./views/pages/Masters/ESICEmpMaster'))
const GratuityMaster = React.lazy(() => import('./views/pages/Masters/GratuityMaster'))
const ShiftMaster = React.lazy(() => import('./views/pages/Masters/ShiftMaster'))
const MachineMaster = React.lazy(() => import('./views/pages/Masters/MachineMaster'))
const LeavesMaster = React.lazy(() => import('./views/pages/Masters/LeaveMaster'))
const StoreAdd = React.lazy(() => import('../src/components/store/StoreAdd'))
const StoreList = React.lazy(() => import('../src/components/store/StoreList'))
const ApplicantList = React.lazy(() => import('../src/components/applicant/ApplicantList'))
const AddNewEmploye = React.lazy(() => import('../src/employees/AddNewEmployee'))
const Interviews = React.lazy(() => import('./views/pages/Interviewer/InterviewsList'))
const StoreLocations = React.lazy(() => import('./views/pages/Masters/SeatMaster'))
const DepartmentMaster = React.lazy(() => import('./views/pages/Masters/DepartmentMaster'))
const SubDepartmentMaster = React.lazy(() => import('./views/pages/Masters/SubDepartmentMaster'))
const DesignationMaster = React.lazy(() => import('./views/pages/Masters/DesignationMaster'))
const AddApplicant = React.lazy(() => import('./components/applicant/AddApplicantInner'))
// const AddApplicant = React.lazy(() => import('./employees/ApplicationForm'))
const record_resignation = React.lazy(() => import('../src/components/sepration/RecordResignation'))
const RecordResignationOthers = React.lazy(
  () => import('../src/components/sepration/RecordResignationOthers'),
)
const resignation_applications = React.lazy(
  () => import('../src/components/sepration/ResignationApplications'),
)
const resignation_status = React.lazy(() => import('../src/components/sepration/ResignationStatus'))
const Openings = React.lazy(() => import('./views/pages/Openings/Openings'))
const RolePermissionManager = React.lazy(
  () => import('../src/components/roleManagement/RolePermissionManager'),
)
const RoleAssignmentManager = React.lazy(
  () => import('../src/components/roleManagement/RoleAssignmentManager '),
)
const RBACPanel = React.lazy(() => import('../src/components/roleManagement/RBAC/RBAC'))
const RoleAssignment = React.lazy(
  () => import('../src/components/roleManagement/RBAC/NewRoleassign'),
)
const EmployeeRoleList = React.lazy(
  () => import('../src/components/roleManagement/RBAC/EmployeeRoleList'),
)
const ModulesCatalog = React.lazy(
  () => import('../src/components/roleManagement/RBAC/ModulesCatalog'),
)
const OpeningsListView = React.lazy(() => import('../src/components/common/CommonTable'))
const JDList = React.lazy(() => import('../src/components/JD/JDList'))
const Payroll = React.lazy(() => import('../src/components/common/Payroll'))

const Incentive = React.lazy(() => import('../src/components/incentive/create/CreateIncentive'))
const MyRequestsIncentive = React.lazy(
  () => import('../src/components/incentive/requests/MyRequests'),
)
const CMDApprovalsIncentive = React.lazy(
  () => import('../src/components/incentive/approvals/cmdApprovals/CMDApprovals'),
)
const HRApprovalsIncentive = React.lazy(
  () => import('../src/components/incentive/approvals/hrApprovals/HRApprovals'),
)

const GivenToBank = React.lazy(() => import('../src/employees/GivenToBank'))

const PaidByBank = React.lazy(() => import('../src/employees/PaidByBank'))
const WeeklyOffHoliday = React.lazy(
  () => import('../src/components/payroll/WeeklyOffHolidayMaster'),
)
const WeeklyOffPolicy = React.lazy(() => import('../src/components/payroll/WeeklyOffPolicyMaster'))
const UpdateEmployeeDocs = React.lazy(() => import('./employees/UpdateEmployeeDocs'))
const EmployeeSalaryAddOnsMaster = React.lazy(
  () => import('./components/payroll/EmployeeSalaryAddOnsMaster'),
)
const EmployeeDeduction = React.lazy(() => import('./components/payroll/EmployeeDeduction'))
const EmployeeLeavesMaster = React.lazy(() => import('./components/payroll/EmployeeLeavesMaster'))
const ReturnByBank = React.lazy(() => import('./components/payroll/ReturnByBank'))
const PaidByCash = React.lazy(() => import('./uploaders/PaidByCash/PaidByCashMaster'))
const PayrollSummary = React.lazy(() => import('./components/payroll/Summary/Summary'))
const LocationCodeMaster = React.lazy(
  () => import('./uploaders/LocationCodeMaster/LocationCodeMaster'),
)
const EmpZoneRegionClusterMapping = React.lazy(
  () => import('./uploaders/EmpZoneRegionClusterMapping/index'),
)
const StoreStateLinkingMaster = React.lazy(
  () => import('./uploaders/StoreStateLinkingMaster/StoreStateLinkingMaster'),
)
const BgtSeatMaster = React.lazy(() => import('./uploaders/BgtSeatMaster/BgtSeatMaster'))
const EmpTDSMaster = React.lazy(() => import('./uploaders/EmpTDSMaster/EmpTDSMaster'))
const EmpSalaryStatusMaster = React.lazy(
  () => import('./uploaders/EmpSalaryStatus/EmpSalaryStatus'),
)
const CompOffMaster = React.lazy(() => import('./uploaders/CompOffMaster/CompOffMaster'))
const ECodeSeatMappingMaster = React.lazy(
  () => import('./uploaders/ECodeSeatMapping/ECodeSeatMappingMaster'),
)
const EmpAttendanceMaster = React.lazy(
  () => import('./uploaders/EmpAttendanceMaster/EmpAttendanceMaster'),
)
const EmpAttendanceList = React.lazy(() => import('./components/Attandence/AttendanceEmpList'))
const StoreTeamAttendanceList = React.lazy(
  () => import('./components/Attandence/StoreTeamAttendance'),
)
const ApplicabilityMaster = React.lazy(
  () => import('./uploaders/ApplicabilityMaster/ApplicabilityMaster'),
)
const EmpSalaryStructureMaster = React.lazy(
  () => import('./uploaders/EmpSalaryStructure/EmpSalaryStructureMaster'),
)
const LeaveOpeningBalMaster = React.lazy(
  () => import('./uploaders/LeaveOpeningBalMaster/LeaveOpeningBalMaster'),
)
const EmpPersonalDetailsMaster = React.lazy(
  () => import('./uploaders/EmpPersonalDetailsMaster/EmpPersonalDetailsMaster'),
)
const EmpStatutoryDetailsMaster = React.lazy(
  () => import('./uploaders/EmployeeSatutoryDetailsMaster/EmployeeSatutoryDetailsMaster'),
)
const EmpDegreeQualificationMaster = React.lazy(
  () => import('./uploaders/EmpDegreeQualification/EmpDegreeQualificationMaster'),
)
const EmpPastExperience = React.lazy(
  () => import('./uploaders/EmpPastExperience/EmpPastExperience'),
)
const EmpRevisedDeptDesgLocMaster = React.lazy(
  () => import('./uploaders/EmpRevisedDeptDesgLocMaster/EmpRevisedDeptDesgLocMaster'),
)
const EmpJoiningReleavingMaster = React.lazy(
  () => import('./uploaders/EmpJoiningReleavingMaster/EmpJoiningReleavingMaster'),
)
const ShiftAlignmentMaster = React.lazy(
  () => import('./uploaders/ShiftAlignmentMaster/ShiftAlignmentMaster'),
)
const EmpBonusUploader = React.lazy(() => import('./uploaders/BonusUploader/BonusList'))
const EmpShiftAlignment = React.lazy(() => import('./uploaders/EmpShiftAlignment'))
const ProcessedSalaryMaster = React.lazy(
  () => import('./uploaders/ProcessedSalary/ProcessedSalaryMaster'),
)
const LocationMasterView = React.lazy(() => import('./uploaders_views/LocationMasterView'))
const BgtSeatMasterView = React.lazy(() => import('./uploaders_views/BgtSeatMasterView'))
const EmpCodeSeatMasterView = React.lazy(() => import('./uploaders_views/EmpCodeSeatMasterView'))
const PaymentMaster = React.lazy(() => import('./uploaders/Payment/PaymentMaster'))
const GratuityBonusMaster = React.lazy(() => import('./uploaders/GratuityBonus/GratuityBonus'))
const SalaryMaster = React.lazy(() => import('./SalaryMasters/Salary'))
const SalarySummery = React.lazy(() => import('./SalaryMasters/SalarySummery'))
const MonthMaster = React.lazy(() => import('./SalaryMasters/Month'))
const MinWages = React.lazy(() => import('./SalaryMasters/MinWages/MinWages'))
const EmpFinalData = React.lazy(() => import('./SalaryMasters/EmpFinalData'))
const MonthSalaryMaster = React.lazy(() => import('./SalaryMasters/MonthSalary'))
const PayableDays = React.lazy(() => import('./SalaryMasters/PayableDays'))
const LeaveMaster = React.lazy(() => import('./SalaryMasters/Leave'))
const CompOff = React.lazy(() => import('./SalaryMasters/CompOff'))
const EarnedLeaves = React.lazy(() => import('./SalaryMasters/EarnedLeaves'))
const CasualLeaves = React.lazy(() => import('./SalaryMasters/CasualLeaves'))
const GrossEarning = React.lazy(() => import('./SalaryMasters/GrossEarning'))
const Deduction = React.lazy(() => import('./SalaryMasters/Deduction'))
const PF = React.lazy(() => import('./SalaryMasters/Pf'))
const ESI = React.lazy(() => import('./SalaryMasters/ESI'))
const GratuityBonus = React.lazy(() => import('./SalaryMasters/GratuityBonus'))

const SalarySlips = React.lazy(() => import('./components/payroll/SalarySlips'))

const LocEmp = React.lazy(() => import('./SalaryNew/LocEmp'))
const SalaryStatus = React.lazy(() => import('./SalaryNew/SalaryStatus'))
const LeaveMasterSalaryNew = React.lazy(() => import('./SalaryNew/LeaveMaster'))
const BgtSalary = React.lazy(() => import('./SalaryNew/BgtSalary'))
const GrossEarningDetails = React.lazy(() => import('./SalaryNew/GrossEarning'))
const DeductionDetails = React.lazy(() => import('./SalaryNew/Deduction'))
const GratuityAndBonus = React.lazy(() => import('./SalaryNew/GratuityAndBonus'))
const ChangePassword = React.lazy(() => import('./components/passwordChange/ChangePasswordForm'))
const salaryControl = React.lazy(
  () => import('./components/payroll/salaryControlPanal/SalaryControlHome'),
)
const RequestedLeaveForManager = React.lazy(
  () => import('./views/pages/employeeLeave/RequestedLeaveForManager/RequestedLeaveForManager'),
)

const FNF = React.lazy(() => import('./components/FullAndFinal/FNF'))

// --- NSO Routing module files
const NSONewStoresList = React.lazy(() => import('./NSORouting/NewStoresList'))
const NSONewStoreRouting = React.lazy(() => import('./NSORouting/NewStoreRouting'))
const NSONewStoreRoutingView = React.lazy(() => import('./NSORouting/NewStoreRoutingView'))

// --- Holiday Master files
const HolidayMasterGroupsList = React.lazy(() => import('./HolidayMaster/Group/GroupList'))
const HolidayMasterGroupWiseStoreCodeMapping = React.lazy(
  () => import('./HolidayMaster/Uploader/GroupWiseStoreCodeMapping'),
)
const HolidaysList = React.lazy(() => import('./HolidayMaster/Holiday/Holiday'))
const Geofence = React.lazy(() => import('../src/components/Geotagging/Geofence'))
const EmpStoreAssignment = React.lazy(() => import('./uploaders/BgtSeatMaster/EmpStoreAssignment'))
const ProcessedSalary = React.lazy(
  () => import('./components/Finance/ProcessedSalary/ProcessedSalary'),
)
const FinanceGivenToBank = React.lazy(() => import('./components/Finance/GivenToBank/GivenToBank'))
const FinancePaidByCash = React.lazy(() => import('./components/Finance/PaidByCash/PaidByCash'))
const FinancePaidByBank = React.lazy(() => import('./components/Finance/PaidByBank/PaidByBank'))
const FinanceReturnByBank = React.lazy(
  () => import('./components/Finance/ReturnByBank/ReturnByBank'),
)
const EmployeeChangeLogs = React.lazy(
  () => import('./components/EmployeeChangeLog/EmployeeChangeLog'),
)
const AttendanceChangeLogs = React.lazy(
  () => import('./components/AttendanceChangeLog/AttendanceChangeLog'),
)
const ShiftMasterCrud = React.lazy(() => import('./ShiftMaster/ShiftMasterCrud'))
const VendorForm = React.lazy(() => import('./VendorModule/VendorForm'))
const ManpowerForm = React.lazy(() => import('./VendorModule/ManpowerForm'))
const VendorList = React.lazy(() => import('./VendorModule/VendorList'))
const VendorDetails = React.lazy(() => import('./VendorModule/VendorDetails'))
const ManpowerViewDetails = React.lazy(
  () => import('./VendorModule/VendorDetails/EmployeesList/ViewDetails'),
)
const RetentionBonus = React.lazy(() => import('./uploaders/RetentionBonus'))
const LastMonthSalary = React.lazy(() => import('./uploaders/LastMonthSalary'))
const AddWeeklyOff = React.lazy(() => import('./components/Attandence/WeeklyOff'))

const BvgForm = React.lazy(() => import('./BGV/BvgForm'));
const BvgCandidateList =  React.lazy(() => import('./BGV/BvgCandidateList'));

const MedicalCardAdmin = React.lazy(() => import('./MedicalCard'))

const routes = [
  {
    path: '/',
    exact: true,
    name: 'Home',
    element: Dashboard,
    roles: [
      'Audit',
      'Applicant',
      'HR',
      'Employee',
      'RetailHead',
      'ClusterManager',
      'StoreHR',
      'SuperAdmin',
      'Master',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/BGV',
    exact: true,
    name: "BGV",
    element: BvgCandidateList,
    roles: [
      'HR',
      'IT Superadmin'
    ],
  },
  {
    path: '/BGV/verify/:id',
    exact: true,
    name: "BGV",
    element: BvgForm,
    roles: [
      'Audit',
      'IT Superadmin'
    ],
  },
  {
    path: '/openings',
    exact: true,
    name: 'Openings',
    element: ApplicationForm,
    roles: ['Audit', 'HR', 'SuperAdmin', 'Master'],
  },
  {
    path: '/openingslistView',
    exact: true,
    name: 'Openings List View',
    element: OpeningsListView,
    roles: ['Audit', 'HR', 'SuperAdmin', 'Master'],
  },
  {
    path: '/jd-list',
    exact: true,
    name: 'JD',
    element: JDList,
    roles: ['Audit', 'HR', 'SuperAdmin', 'Master'],
  },
  {
    path: '/payroll-summary',
    exact: true,
    name: 'Summary',
    element: PayrollSummary,
    roles: ['Master'],
  },
  {
    path: '/processed-salary',
    exact: true,
    name: 'Processed Salary',
    element: ProcessedSalaryMaster,
    roles: ['Master'],
  },
  {
    path: '/payroll',
    exact: true,
    name: 'Payroll',
    element: Payroll,
    roles: ['Master'],
  },
  {
    path: '/incentive/create',
    exact: true,
    name: 'Incentive',
    element: Incentive,
    roles: ['SuperAdmin'],
  },
  {
    path: '/incentive/requests',
    exact: true,
    name: 'Incentive Requests',
    element: MyRequestsIncentive,
    roles: ['SuperAdmin'],
  },
  {
    path: '/incentive/cmd',
    exact: true,
    name: 'CMD Approvals',
    element: CMDApprovalsIncentive,
    roles: ['SuperAdmin'],
  },
  {
    path: '/incentive/hr',
    exact: true,
    name: 'HR Approvals',
    element: HRApprovalsIncentive,
    roles: ['SuperAdmin'],
  },
  {
    path: '/salary_recal',
    exact: true,
    name: 'Salary Recalculate',
    element: SalaryRecalculate,
    roles: ['Master'],
  },
  {
    path: '/process-salary',
    exact: true,
    name: 'Process Salary',
    element: ProcessSalary,
    roles: ['Master'],
  },
  // {
  //   path: '/processed-salary-request',
  //   exact: true,
  //   name: 'Processed Salary Request',
  //   element: ProcessedSalaryRequest,
  //   roles: ['Master'],
  // },
  {
    path: '/processed-salary-request',
    exact: true,
    name: 'Processed Salary Request',
    element: ProcessedSalaryRequest1,
    roles: ['Master'],
  },

  {
    path: '/employees/document_generate',
    exact: true,
    name: 'Document Generate',
    element: DocumentGenerate,
    roles: ['Master', 'HR'],
  },
  {
    path: '/bank-paid',
    exact: true,
    name: 'Paid By Bank',
    element: PaidByBank,
    roles: ['Finance', 'Master'],
  },
  {
    path: '/given-to-bank',
    exact: true,
    name: 'Given To Bank',
    element: GivenToBank,
    roles: ['Finance', 'Master'],
  },
  {
    path: '/return-by-bank',
    exact: true,
    name: 'Return By Bank',
    element: ReturnByBank,
    roles: ['Finance', 'Master'],
  },
  {
    path: '/paid-by-cash',
    exact: true,
    name: 'Paid By Cash',
    element: PaidByCash,
    roles: ['Finance', 'Master'],
  },
  {
    path: '/weekly-off-holiday',
    exact: true,
    name: 'Weekly-off Holiday',
    element: WeeklyOffHoliday,
    roles: ['Master'],
  },
  {
    path: '/weekly-off-policy',
    exact: true,
    name: 'Weekly-off Policy',
    element: WeeklyOffPolicy,
    roles: ['Master'],
  },
  {
    path: '/sldetails-view-downlasf1oad-salary-slips',
    exact: true,
    name: 'Salary Slips',
    element: SalarySlips,
    roles: [
      'Audit',
      'HR',
      'Employee',
      'RetailHead',
      'ClusterManager',
      'StoreHR',
      'SuperAdmin',
      'Master',
      'Finance',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/salary-control-panel',
    exact: true,
    name: 'Salary Controll Panel',
    element: salaryControl,
    roles: ['HR', 'Master'],
  },
  {
    path: '/password-change',
    exact: true,
    name: 'Password Change',
    element: ChangePassword,
    roles: [
      'Audit',
      'HR',
      'Employee',
      'RetailHead',
      'ClusterManager',
      'StoreHR',
      'SuperAdmin',
      'Master',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/salary-addons',
    exact: true,
    name: 'Employee Salary Add-ons',
    element: EmployeeSalaryAddOnsMaster,
    roles: ['Master'],
  },
  {
    path: '/emp-deduction',
    exact: true,
    name: 'Employee Deduction',
    element: EmployeeDeduction,
    roles: ['Master'],
  },
  {
    path: '/emp-leaves',
    exact: true,
    name: 'Employee Leaves',
    element: EmployeeLeavesMaster,
    roles: ['Master'],
  },
  {
    path: 'opening/job_update',
    exact: true,
    name: 'update Job',
    element: jd_upload,
    roles: ['Audit', 'HR', 'SuperAdmin', 'Master'],
  },
  {
    path: '/dashboard',
    // name: 'Dashboard',
    name: 'Dashboard',
    element: EmployeeDashboard,
    roles: [
      'Audit',
      'Applicant',
      'HR',
      'Employee',
      'ClusterManager',
      'StoreHR',
      'SuperAdmin',
      'Master',
      'RetailHead',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/interviews',
    name: 'Interviews',
    element: Interviews,
    roles: [
      'Audit',
      'HR',
      'Employee',
      'ClusterManager',
      'StoreHR',
      'SuperAdmin',
      'Master',
      'RetailHead',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/master/designations',
    name: 'Designation Master',
    element: DesignationMaster,
    roles: ['Audit', 'HR', 'Employee', 'ClusterManager', 'StoreHR', 'SuperAdmin', 'Master'],
  },
  {
    path: '/master/departments',
    name: 'Department Master',
    element: DepartmentMaster,
    roles: ['Audit', 'HR', 'Employee', 'ClusterManager', 'StoreHR', 'SuperAdmin', 'Master'],
  },
  {
    path: '/master/sub-departments',
    name: 'Sub-Department Master',
    element: SubDepartmentMaster,
    roles: ['Audit', 'HR', 'Employee', 'ClusterManager', 'StoreHR', 'SuperAdmin', 'Master'],
  },
  {
    path: '/master/pf',
    name: 'PF',
    element: PFMaster,
    roles: ['Master'],
  },
  {
    path: '/master/lwf',
    name: 'LWF',
    element: LWFMaster,
    roles: ['Master'],
  },
  {
    path: '/master/pt',
    name: 'PT',
    element: PTMaster,
    roles: ['Master'],
  },
  {
    path: '/master/esic-emp',
    name: 'ESIC Emp',
    element: ESICEmpMaster,
    roles: ['Master'],
  },
  {
    path: '/master/gratuity',
    name: 'Gratuity',
    element: GratuityMaster,
    roles: ['Master'],
  },
  {
    path: '/master/shift',
    name: 'Shift',
    element: ShiftMaster,
    roles: ['Master'],
  },
  {
    path: '/master/machine',
    name: 'Machine',
    element: MachineMaster,
    roles: ['Master'],
  },
  {
    path: '/master/leave',
    name: 'Leave Master',
    element: LeavesMaster,
    roles: ['Master'],
  },
  {
    path: '/employee/add_new',
    name: 'New Employee',
    element: EmployeeAddNew,
    roles: [
      'Audit',
      'HR',
      'Employee',
      'ClusterManager',
      'StoreHR',
      'SuperAdmin',
      'Master',
      'RetailHead',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/update-docs/:empId',
    name: 'Update Employee Docs',
    element: UpdateEmployeeDocs,
    roles: ['StoreHR'],
  },
  {
    path: '/employee/add_new/:id',
    name: 'New Employee',
    element: EmployeeProfile,
    roles: [
      'Audit',
      'HR',
      'Employee',
      'ClusterManager',
      'StoreHR',
      'SuperAdmin',
      'Master',
      'RetailHead',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/employee/update/:id',
    name: 'New Employee',
    element: EmployeeProfile,
    roles: ['Master', 'HR', 'StoreHR'],
  },
  {
    path: '/employee/details',
    name: 'Details',
    element: EmployeeProfileViewOnly,
    roles: ['Employee'],
  },
  {
    path: '/employee/update/view/:id',
    name: 'New Employee',
    element: EmployeeProfileViewOnly,
    roles: [
      'Audit',
      'HR',
      'Employee',
      'ClusterManager',
      'StoreHR',
      'SuperAdmin',
      'Master',
      'RetailHead',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/employee/add_new/view/:id',
    name: 'New Employee',
    element: EmployeeProfileViewOnly,
    roles: [
      'Audit',
      'HR',
      'Employee',
      'ClusterManager',
      'StoreHR',
      'SuperAdmin',
      'Master',
      'RetailHead',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/applicant/add',
    name: 'Add Applicant',
    element: AddApplicant,
    roles: ['Audit', 'HR', 'Employee', 'ClusterManager', 'StoreHR', 'SuperAdmin', 'Master'],
  },
  {
    path: '/applicant/update/:id',
    name: 'Edit Applicant',
    element: AddApplicant,
    roles: ['Audit', 'HR', 'Employee', 'ClusterManager', 'StoreHR', 'SuperAdmin', 'Master'],
  },
  {
    path: '/applicant/list',
    name: 'Applicant List',
    element: ApplicantList,
    roles: ['Audit', 'HR', 'Employee', 'ClusterManager', 'StoreHR', 'SuperAdmin', 'Master'],
  },
  {
    path: '/applicant/add_new/:id',
    name: 'Update Employee',
    element: EmployeeProfile,
    roles: ['Applicant', 'SuperAdmin', 'Master'],
  },
  {
    path: '/applicant/interview_form',
    name: 'Interview Form',
    element: InterviewForm,
    roles: ['Applicant', 'SuperAdmin', 'Master'],
  },
  {
    path: '/applicant/view_interview_form/:id',
    name: 'View Interview Form',
    element: InterviewForm,
    roles: [
      'Applicant',
      'SuperAdmin',
      'Master',
      'Audit',
      'HR',
      'Employee',
      'ClusterManager',
      'StoreHR',
      'SuperAdmin',
      'Master',
    ],
  },

  {
    path: '/candidate/register',
    name: 'New Employee',
    element: RegisterCandidate,
    roles: ['Audit', 'HR', 'Employee', 'ClusterManager', 'StoreHR', 'SuperAdmin', 'Master'],
  },
  {
    path: '/candidate/form_list',
    name: 'New Employee',
    element: FormCandidateList,
    roles: [
      'Audit',
      'HR',
      'Employee',
      'ClusterManager',
      'StoreHR',
      'SuperAdmin',
      'Master',
      'RetailHead',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/employees/list',
    name: 'Employees',
    element: EmployeesList,
    roles: [
      'Audit',
      'HR',
      'Employee',
      'ClusterManager',
      'StoreHR',
      'SuperAdmin',
      'Master',
      'StoreHR',
      'RetailHead',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/gap-reports',
    name: 'Gap Reports',
    element: GapReports,
  },
  {
    path: '/ptax-policy',
    name: 'PTax Policy',
    element: PtaxPolicy,
  },
  {
    path: '/lwf-policy',
    name: 'LWF Policy',
    element: LwfPolicy,
  },
  {
    path: '/store-reporting-manager',
    name: 'Store Reporting Manager',
    element: StoreReportingManager,
  },
  {
    path: '/master/designation-mapping',
    name: 'Designation Mapping',
    element: DeptDesignationMap,
  },
  {
    path: '/employees/emp-transfer',
    name: 'Employees Transfer',
    element: EmployeesTransferList,
    roles: [
      // 'Audit',
      'HR',
      // 'Employee',
      'ClusterManager',
      'SuperAdmin',
      'Master',
      'Employee',
      'StoreHR',
      'RetailHead',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/employee-leave-list',
    name: 'Requested Leaves',
    element: ManagerEmpLeaveList,
    // element: RequestedLeaveForManager,
    roles: [
      'Audit',
      'HR',
      'Employee',
      'ClusterManager',
      'StoreHR',
      'SuperAdmin',
      'Master',
      'RetailHead',
      'Finance',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/attandance/track',
    // path: '/emp-attandance-list',
    name: 'View Attendance',
    element: Attendance,
    // element: EmpAttendanceList,
    roles: [
      'Audit',
      'HR',
      'Employee',
      'ClusterManager',
      'StoreHR',
      'SuperAdmin',
      'Master',
      'RetailHead',
      'Finance',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/emp-attandance-list',
    name: 'Team Attendance',
    element: EmpAttendanceList,
    roles: [
      'Audit',
      'HR',
      'Employee',
      'ClusterManager',
      'StoreHR',
      'SuperAdmin',
      'Master',
      'RetailHead',
      'Finance',
      'RegionalManager',
      'Zone',
    ],
  },
  // {
  //   path: '/store-attendance-list',
  //   name: 'Store Team Attendance',
  //   element: StoreTeamAttendanceList,
  //   roles: ['Audit'],
  // },
  // {
  //   path: '/attandance/track',
  //   name: 'Attendance Data',
  //   element: Attendance,
  //   roles: [
  //     'Audit',
  //     'HR',
  //     'Employee',
  //     'ClusterManager',
  //     'StoreHR',
  //     'SuperAdmin',
  //     'Master',
  //     'RetailHead',
  //     'Finance',
  //     'RegionalManager',
  //     'Zone',
  //   ],
  // },
  {
    path: '/store/add_new',
    name: 'Store Add',
    element: StoreAdd,
    roles: ['SuperAdmin', 'Master'],
  },
  {
    path: '/store-list/all',
    name: 'Stores List',
    element: StoreList,
    roles: ['Audit', 'HR', 'Employee', 'ClusterManager', 'StoreHR', 'SuperAdmin', 'Master'],
  },
  {
    path: '/Geo-fence',
    name: 'Geofence',
    element: Geofence,
    roles: ['Audit', 'HR', 'Employee', 'ClusterManager', 'StoreHR', 'SuperAdmin', 'Master'],
  },

  {
    path: `/store/add_new/:id`,
    name: 'Store Update',
    element: StoreAdd,
    roles: ['Audit', 'HR', 'ClusterManager', 'StoreHR', 'SuperAdmin', 'Master'],
  },
  {
    path: '/master/seat',
    name: 'Store Locations',
    element: StoreLocations,
    roles: ['Audit', 'HR', 'ClusterManager', 'StoreHR', 'SuperAdmin', 'Master'],
  },
  {
    path: '/apply-leave',
    name: 'My Leaves',
    element: EmployeeLeaveApply,
    roles: [
      'Audit',
      'HR',
      'Employee',
      'ClusterManager',
      'StoreHR',
      'SuperAdmin',
      'Master',
      'RetailHead',
      'Finance',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/regularize-request',
    name: 'Regularize Request',
    element: RegularizeRequestTable,
    roles: [
      'Audit',
      'HR',
      'ClusterManager',
      'StoreHR',
      'SuperAdmin',
      'Employee',
      'Master',
      'RetailHead',
      'Finance',
      'RegionalManager',
      'Zone',
    ],
  },

  {
    path: '/geofence-request',
    name: 'Geofence Request',
    element: GeofenceRequestTable,
    roles: [
      'Audit',
      'HR',
      'ClusterManager',
      'StoreHR',
      'SuperAdmin',
      'Employee',
      'Master',
      'RetailHead',
      'Finance',
      'RegionalManager',
      'Zone',
    ],
  },

  {
    path: '/sepration/record_resignation',
    name: 'Resignation (Self)',
    element: record_resignation,
    roles: [
      'Audit',
      'HR',
      'ClusterManager',
      'StoreHR',
      'Employee',
      'SuperAdmin',
      'Master',
      'RetailHead',
      'Finance',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/sepration/record_resignation/:id',
    name: 'Resignation (Self)',
    element: record_resignation,
    roles: [
      'Audit',
      'HR',
      'ClusterManager',
      'StoreHR',
      'Employee',
      'SuperAdmin',
      'Master',
      'RetailHead',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/sepration/record_resignation_others',
    name: 'Record Resignation Others',
    element: RecordResignationOthers,
    roles: [
      'Audit',
      'HR',
      'ClusterManager',
      'StoreHR',
      'Employee',
      'SuperAdmin',
      'Master',
      'RetailHead',
      'Finance',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/sepration/resignation_status',
    name: 'Resignation Status',
    element: resignation_status,
    roles: [
      'Audit',
      'HR',
      'ClusterManager',
      'Employee',
      'StoreHR',
      'SuperAdmin',
      'Master',
      'RetailHead',
      'Finance',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/sepration/resignation_applications',
    name: 'Resignation Applications',
    // element: resignation_applications,
    element: resignation_status,
    roles: ['Audit', 'HR', 'ClusterManager', 'Employee', 'StoreHR', 'SuperAdmin', 'Master'],
  },
  {
    path: '/settings/role_management',
    name: 'Access Management',
    element: RolePermissionManager,
    roles: ['Audit', 'HR', 'ClusterManager', 'Employee', 'StoreHR', 'SuperAdmin', 'Master'],
  },
  {
    path: '/settings/role_assignment',
    name: 'Role Assignment',
    element: RoleAssignmentManager,
    roles: ['Audit', 'HR', 'ClusterManager', 'Employee', 'StoreHR', 'SuperAdmin', 'Master'],
  },
  {
    path: '/rbac-panel',
    name: 'RBAC Panel',
    element: RBACPanel,
    roles: ['Master'],
  },
  {
    path: '/role-assign',
    name: 'Role Assignment',
    element: RoleAssignment,
    roles: ['Master'],
  },
  {
    path: '/employee-role_list',
    name: 'Employee-Role List',
    element: EmployeeRoleList,
    roles: ['Master'],
  },
  {
    path: '/settings/modules-catalog',
    name: 'Modules Catalog',
    element: ModulesCatalog,
    roles: ['Master'],
  },
  {
    path: '/setting/role_manage',
    name: 'Role Manager',
    element: resignation_applications,
    roles: ['Audit', 'HR', 'ClusterManager', 'Employee', 'StoreHR', 'SuperAdmin', 'Master'],
  },
  {
    path: '/emp-zone-region-cluster-map-uploader',
    name: 'Emp-Zone-Region-Cluster',
    element: EmpZoneRegionClusterMapping,
    roles: ['Master'],
  },
  {
    path: '/location-uploader',
    name: 'Location Master',
    element: LocationCodeMaster,
    roles: ['Master'],
  },
  {
    path: '/uploader/store-state_linking',
    name: 'Store-State Linking',
    element: StoreStateLinkingMaster,
    roles: ['Master'],
  },
  {
    path: '/emp-store-assignment',
    name: 'Emp-Store Assignment',
    element: EmpStoreAssignment,
    roles: ['Master'],
  },
  {
    path: '/bgt-seat-uploader',
    name: 'Bgt Seat Master',
    element: BgtSeatMaster,
    roles: ['Master'],
  },
  {
    path: '/ecode-seat-uploader',
    name: 'EmpCode Seat Master',
    element: ECodeSeatMappingMaster,
    roles: ['Master'],
  },
  {
    path: '/emp-attendance-uploader',
    name: 'Emp Attendnace',
    element: EmpAttendanceMaster,
    roles: ['Master'],
  },
  {
    path: '/emp-tds-uploader',
    name: 'Emp Deduction',
    element: EmpTDSMaster,
    roles: ['Master'],
  },
  {
    path: '/applicability-uploader',
    name: 'Applicability',
    element: ApplicabilityMaster,
    roles: ['Master'],
  },
  {
    path: '/salary-structure-uploader',
    name: 'Emp Salary Structure',
    element: EmpSalaryStructureMaster,
    roles: ['Master'],
  },
  {
    path: '/location-master-view',
    name: 'Location Master View',
    element: LocationMasterView,
    roles: ['Master'],
  },
  {
    path: '/bgt_seat-master-view',
    name: 'Bgt Seat Master View',
    element: BgtSeatMasterView,
    roles: ['Master'],
  },
  {
    path: '/emp_code-seat_master-view',
    name: 'Emp Code Seat Master',
    element: EmpCodeSeatMasterView,
    roles: ['Master'],
  },
  {
    path: '/salary',
    name: 'Salary',
    element: SalaryMaster,
    roles: ['Master'],
  },
  {
    path: '/salary_summery',
    name: 'Salary Summary',
    element: SalarySummery,
    roles: ['Master'],
  },
  {
    path: '/month-salary',
    name: 'Month Salary',
    element: MonthSalaryMaster,
    roles: ['Master'],
  },
  {
    path: '/payable-days',
    name: 'Payable Days',
    element: PayableDays,
    roles: ['Master'],
  },
  {
    path: '/leave-l',
    name: 'Leave',
    element: LeaveMaster,
    roles: ['Master'],
  },
  {
    path: '/comp-off',
    name: 'Comp Off',
    element: CompOff,
    roles: ['Master'],
  },
  {
    path: '/shift-alignment-uploader',
    name: 'Shift Alignment',
    element: ShiftAlignmentMaster,
    roles: ['Master'],
  },
  {
    path: '/emp-bonus-uploader',
    name: 'Bonus',
    element: EmpBonusUploader,
    roles: ['Master'],
  },
  {
    path: '/earned-leaves',
    name: 'Earned Leaves',
    element: EarnedLeaves,
    roles: ['Master'],
  },
  {
    path: '/casual-leaves',
    name: 'Casual Leaves',
    element: CasualLeaves,
    roles: ['Master'],
  },
  {
    path: '/gross-earning',
    name: 'Gross Earning',
    element: GrossEarning,
    roles: ['Master'],
  },
  {
    path: '/deduction',
    name: 'Deduction',
    element: Deduction,
    roles: ['Master'],
  },
  {
    path: '/pf',
    name: 'PF',
    element: PF,
    roles: ['Master'],
  },
  {
    path: '/esi',
    name: 'ESI',
    element: ESI,
    roles: ['Master'],
  },
  {
    path: '/gratuity-bonus',
    name: 'Gratuity & Bonus',
    element: GratuityBonus,
    roles: ['Master'],
  },
  {
    path: '/leave-opening-balance-uploader',
    name: 'Leave Opening Balance',
    element: LeaveOpeningBalMaster,
    roles: ['Master'],
  },
  {
    path: '/emp-personal-details-uploader',
    name: 'Emp Personal Details',
    element: EmpPersonalDetailsMaster,
    roles: ['Master'],
  },
  {
    path: '/emp-statutory-details-uploader',
    name: 'Emp Statutory Details',
    element: EmpStatutoryDetailsMaster,
    roles: ['Master'],
  },
  {
    path: '/emp-degree-qualifications-uploader',
    name: 'Emp Degree Qualifications',
    element: EmpDegreeQualificationMaster,
    roles: ['Master'],
  },
  {
    path: '/emp-past-experience-uploader',
    name: 'Emp Past Experience',
    element: EmpPastExperience,
    roles: ['Master'],
  },
  {
    path: '/emp-joining-releaving-uploader',
    name: 'Emp Joining Releaving',
    element: EmpJoiningReleavingMaster,
    roles: ['Master'],
  },
  {
    path: '/emp-revised-dept-desg-loc-uploader',
    name: 'Emp Revised Dept-Desg-Loc',
    element: EmpRevisedDeptDesgLocMaster,
    roles: ['Master'],
  },
  {
    path: '/loc-emp',
    name: 'LOC & EMP',
    element: LocEmp,
    roles: ['Master'],
  },
  {
    path: '/salary-status',
    name: 'Salary Paid Status',
    element: SalaryStatus,
    roles: ['Master'],
  },
  {
    path: '/leave-master',
    name: 'Leave Master',
    element: LeaveMasterSalaryNew,
    roles: ['Master'],
  },
  {
    path: '/bgt-salary-structure',
    name: 'Bgt Salary Structure',
    element: BgtSalary,
    roles: ['Master'],
  },
  {
    path: '/comp-off-uploader',
    name: 'Comp Off',
    element: CompOffMaster,
    roles: ['Master'],
  },
  {
    path: '/gross-earning-details',
    name: 'Gross Earning Details',
    element: GrossEarningDetails,
    roles: ['Master'],
  },
  {
    path: '/deduction-details',
    name: 'Deduction Details',
    element: DeductionDetails,
    roles: ['Master'],
  },
  {
    path: '/gratuitybonus',
    name: 'Gratuity & Bonus',
    element: GratuityAndBonus,
    roles: ['Master'],
  },
  {
    path: '/payment-uploader',
    name: 'Additional Payment',
    element: PaymentMaster,
    roles: ['Master'],
  },
  {
    path: '/month',
    name: 'Net Payable',
    element: MonthMaster,
    roles: ['Master'],
  },
  {
    path: '/salary/min-wages',
    name: 'Min Wages',
    element: MinWages,
    roles: ['Master'],
  },
  {
    path: '/emp-final-data',
    name: 'Emp Final Data',
    element: EmpFinalData,
    roles: ['Master'],
  },
  {
    path: '/grauity-bonus-uploader',
    name: 'Gratuity & Bonus',
    element: GratuityBonusMaster,
    roles: ['Master'],
  },
  {
    path: '/emp-salary-status-uploader',
    name: 'Emp Salary Status',
    element: EmpSalaryStatusMaster,
    roles: ['Master'],
  },
  {
    path: '/emp-leave-status',
    name: 'Leaves Status',
    element: EmployeeLeaveStatusList,
    roles: [
      'Audit',
      'HR',
      'ClusterManager',
      'Employee',
      'StoreHR',
      'SuperAdmin',
      'Master',
      'RetailHead',
      'Finance',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/profile/profile-update-applications',
    name: 'Profile Update Application',
    element: ProfileUpdateReview,
    roles: [
      'Audit',
      'HR',
      'ClusterManager',
      'Employee',
      'StoreHR',
      'SuperAdmin',
      'Master',
      'RetailHead',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/profile/my-profile',
    name: 'My Profile',
    element: MyProfile,
    roles: [
      'Audit',
      'HR',
      'ClusterManager',
      'Employee',
      'StoreHR',
      'SuperAdmin',
      'Master',
      'RetailHead',
      'RegionalManager',
      'Zone',
    ],
  },
  {
    path: '/new-stores',
    name: 'New Stores',
    element: NSONewStoresList,
    roles: [
      'Master',
      'NSO HR-EXE',
      'LP',
      'L&D',
      'HR-HEAD',
      'RETAIL ZM',
      'NSO-HR Mgr',
      'NSO HR HEAD',
      'RETAIL CM/RM',
      'Master',
      'HR',
      'SuperAdmin',
    ],
  },
  {
    path: '/store-details/:locationId',
    name: 'Store Routing',
    element: NSONewStoreRouting,
    roles: [
      'Master',
      'NSO HR-EXE',
      'LP',
      'L&D',
      'HR-HEAD',
      'RETAIL ZM',
      'NSO-HR Mgr',
      'NSO HR HEAD',
      'RETAIL CM/RM',
      'Master',
      'HR',
      'SuperAdmin',
    ],
  },
  {
    path: '/view-store-details/:locationId',
    name: 'Store Routing View',
    element: NSONewStoreRoutingView,
    roles: [
      'Master',
      'NSO HR-EXE',
      'LP',
      'L&D',
      'HR-HEAD',
      'RETAIL ZM',
      'NSO-HR Mgr',
      'NSO HR HEAD',
      'RETAIL CM/RM',
      'Master',
      'HR',
      'SuperAdmin',
    ],
  },
  {
    path: '/fnf',
    name: 'F&F',
    element: FNF,
    roles: ['Master'],
  },
  {
    path: '/fnf/detail/:id',
    naem: "F&F Detail",
    element: FNFDetail,
    roles: ['Master']
  },
  {
    path: '/holiday-master/groups',
    name: 'Groups',
    element: HolidayMasterGroupsList,
    roles: ['Master'],
  },
  {
    path: '/holiday-master/groups/groupwisestorecodemapping/:groupId',
    name: 'Groups',
    element: HolidayMasterGroupWiseStoreCodeMapping,
    roles: ['Master'],
  },
  {
    path: '/holiday-master/holidays',
    name: 'Holidays',
    element: HolidaysList,
    roles: ['Master'],
  },
  {
    path: '/Geo-fence',
    name: 'Geofence',
    element: Geofence,
    roles: ['Audit', 'HR', 'Employee', 'ClusterManager', 'StoreHR', 'SuperAdmin', 'Master'],
  },
  {
    path: 'applicant-resume-acceptance',
    name: 'Resume Acceptance',
    element: ApplicantResumeAcceptance,
    roles: ['Applicant', 'IT Superadmin'],
  },
  {
    path: '/finance/process-salary',
    name: 'Processed Salary',
    element: ProcessedSalary,
    roles: ['Finance'],
  },
  {
    path: '/finance/given-to-bank',
    name: 'Given To Bank',
    element: FinanceGivenToBank,
    roles: ['Finance'],
  },
  {
    path: '/finance/paid-by-cash',
    name: 'Paid By Cash',
    element: FinancePaidByCash,
    roles: ['Finance'],
  },
  {
    path: '/finance/paid-by-bank',
    name: 'Paid By Bank',
    element: FinancePaidByBank,
    roles: ['Finance'],
  },
  {
    path: '/finance/return-by-bank',
    name: 'Return By Bank',
    element: FinanceReturnByBank,
    roles: ['Finance'],
  },
  {
    path: '/Professional-Tax',
    name: 'Professional Tax',
    element: ProfessionalTax,
    roles: ['Applicant', 'IT Superadmin'],
  },
  {
    path: '/Geofence-Assignment',
    name: 'Geofence Assignment',
    element: GeofenceAssignment,
    roles: ['Applicant', 'IT Superadmin'],
  },
  {
    path: '/employee-logs',
    name: 'Employee Logs',
    element: EmployeeChangeLogs,
    roles: ['IT Superadmin'],
  },
  {
    path: '/attendance-logs',
    name: 'Attendance Logs',
    element: AttendanceChangeLogs,
    roles: ['IT Superadmin'],
  },
  {
    path: '/Bonus-Mapping',
    name: 'Bonus Mapping',
    element: BonusMapping,
    roles: ['IT Superadmin'],
  },
  {
    path: '/overall-shift-master',
    name: 'Shift Master',
    element: ShiftMasterCrud,
    roles: ['IT Superadmin'],
  },
  {
    path: '/attendance-regularization',
    element: AttendanceRegularizationPage,
  },
  {
    path: '/emp-shift-alignment',
    name: 'Emp Shift Alignment',
    element: EmpShiftAlignment,
  },
  {
    path: '/vendor/master-form',
    name: 'Vendor Form',
    element: VendorForm,
  },
  {
    path: '/vendor/manpower/master-form/:vendorCode',
    name: 'Manpower Form',
    element: ManpowerForm,
  },
  {
    path: '/vendor/master-form/update/:vendorCode',
    name: 'Vendor Update',
    element: VendorForm,
  },
  // {
  //   path: '/details/vendor/master-form/:vendorId?/:vendorCode?',
  //   name: 'Vendor Details View',
  //   element: VendorDetails,
  // },

  {
    path: '/details/vendor/master-form/:contractorCode',
    name: 'Vendor Details View',
    element: VendorDetails,
  },

  {
    path: '/vendor/master-list',
    name: 'Vendor List',
    element: VendorList,
  },
  {
    path: '/vendor/manpower/master-form/update/:vendorCode/:employeeCode',
    name: 'Manpower Form Update',
    element: ManpowerForm,
  },
  {
    path: '/vendor/manpower/master-form/view/:vendorCode/:employeeCode',
    name: 'Manpower Form View',
    element: ManpowerViewDetails,
  },
  {
    path: '/uploaders/retention-bonus',
    name: 'Retention Bonus',
    element: RetentionBonus,
  },
  {
    path: '/last-month-salary',
    name: 'Last-Month Salary',
    element: LastMonthSalary,
  },
  {
    path: '/attendance-add-weekly-off',
    name: 'Add Weekly-Off',
    element: AddWeeklyOff,
  },
  {
    path: '/medical-card',
    name: 'Medical Cards',
    element: MedicalCardAdmin,
  },
]

export default routes
