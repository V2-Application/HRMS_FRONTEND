import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilPuzzle,
  cilCursor,
  cilNotes,
  cilChartPie,
  cilStar,
  cilExternalLink,
  cilApplications,
  cilDoor,
  cilAsteriskCircle,
  cilSettings,
  cilArrowThickTop,
  cilCloudUpload,
  cilLibrary,
  cilBank,
  cilMoney,
  cilCalendarCheck,
  cilCash,
  cilGift,
} from '@coreui/icons'
import { CNavItem, CNavTitle, CNavGroup } from '@coreui/react'
import { useSelector } from 'react-redux'

// const dashboardItem = {
//   component: CNavItem,
//   name: 'Dashboard',
//   to: '/dashboard',
//   icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
//   badge: { color: 'info', text: 'NEW' },
// }

// const employeeGroup = {
//   component: CNavGroup,
//   name: 'Employee',
//   to: '/employee',
//   icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
//   items: [
//     {
//       component: CNavItem,
//       name: 'Employees Master',
//       to: '/employees/list',
//     },
//   ],
// }

// const openingsGroup = {
//   component: CNavGroup,
//   name: 'Openings',
//   to: '/openings',
//   icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
//   items: [
//     {
//       component: CNavItem,
//       name: 'Openings',
//       to: '/openings',
//       style: { paddingLeft: ' 3.5rem' },
//     },
//   ],
// }

// const interviewsGroup = {
//   component: CNavGroup,
//   name: 'Interviews',
//   to: '/interviews',
//   icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
//   items: [
//     {
//       component: CNavItem,
//       name: 'Interviews',
//       to: '/interviews',
//     },
//   ],
// }

// const applicantGroup = {
//   component: CNavGroup,
//   name: 'Applicant',
//   to: '/applicant',
//   icon: <CIcon icon={cilApplications} customClassName="nav-icon" />,
//   items: [
//     {
//       component: CNavItem,
//       name: 'OnBoard Form',
//       to: '/applicant/add_new',
//     },
//   ],
// }

// const applicantListGroup = {
//   component: CNavGroup,
//   name: 'Applicant',
//   to: '/applicant',
//   icon: <CIcon icon={cilApplications} customClassName="nav-icon" />,
//   items: [
//     {
//       component: CNavItem,
//       name: 'Applicant List',
//       to: '/applicant/list',
//     },
//     // {
//     //   component: CNavItem,
//     //   name: 'Add Applicant',
//     //   to: '/applicant/add',
//     // },
//   ],
// }

// const candidateGroup = {
//   component: CNavGroup,
//   name: 'Candidate',
//   to: '/candidate',
//   icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
//   items: [
//     {
//       component: CNavItem,
//       name: 'Candidate List',
//       to: '/candidate/form_list',
//     },
//   ],
// }

// const leaveGroup = {
//   component: CNavGroup,
//   name: 'Leave',
//   to: '/leave',
//   icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
//   items: [
//     {
//       component: CNavItem,
//       name: 'Leave Tracker',
//       to: '/employee-leave-list',
//     },
//     {
//       component: CNavItem,
//       name: 'Leave Apply',
//       to: '/apply-leave',
//     },
//   ],
// }

// const leaveGroupApplicant = {
//   component: CNavGroup,
//   name: 'Leave',
//   to: '/leave',
//   icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
//   items: [
//     {
//       component: CNavItem,
//       name: 'Leave Apply',
//       to: '/apply-leave',
//     },
//   ],
// }

// const attendanceGroup = {
//   component: CNavGroup,
//   name: 'Attendance',
//   to: '/attandance',
//   icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
//   items: [
//     {
//       component: CNavItem,
//       name: 'Attendance',
//       to: '/attandance/track',
//     },
//     // {
//     //   component: CNavItem,
//     //   name: 'Regularize Request',
//     //   to: '/regularize-request',
//     // },
//   ],
// }

// const locationGroup = {
//   component: CNavGroup,
//   name: 'Location',
//   to: '/store',
//   icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
//   items: [
//     // {
//     //   component: CNavItem,
//     //   name: 'Add Location',
//     //   to: '/store/add_new',
//     // },
//     {
//       component: CNavItem,
//       name: 'Locations',
//       to: '/store-list/all',
//     },
//   ],
// }

// const masterGroup = {
//   component: CNavGroup,
//   name: 'Masters',
//   to: '/master',
//   icon: <CIcon icon={cilExternalLink} customClassName="nav-icon" />,
//   items: [
//     // {
//     //   component: CNavItem,
//     //   name: 'Employees',
//     //   to: '/employees/list',
//     // },
//     {
//       component: CNavItem,
//       name: 'Designations',
//       to: '/master/designations',
//     },
//     {
//       component: CNavItem,
//       name: 'Departments',
//       to: '/master/departments',
//     },
//     {
//       component: CNavItem,
//       name: 'Seat',
//       to: '/master/seat',
//     },
//   ],
// }
// const Separation = {
//   component: CNavGroup,
//   name: 'Separation',
//   to: '/sepration',
//   icon: <CIcon icon={cilDoor} customClassName="nav-icon" />,
//   items: [
//     {
//       component: CNavItem,
//       name: 'Resignation',
//       to: '/sepration/record_resignation',
//     },
//     {
//       component: CNavItem,
//       name: 'Resignation Applications',
//       to: '/sepration/resignation_applications',
//     },
//   ],
// }

// export const adminNav = [
//   dashboardItem,
//   { component: CNavTitle, name: 'Admin Panel' },
//   openingsGroup,
//   interviewsGroup,
//   applicantListGroup,
//   candidateGroup,
//   employeeGroup,
//   leaveGroup,
//   attendanceGroup,
//   locationGroup,
//   masterGroup,
//   Separation,
// ]

// export const clusterNav = [
//   dashboardItem,
//   { component: CNavTitle, name: 'Cluster Panel' },
//   openingsGroup,
//   interviewsGroup,
//   applicantListGroup,
//   candidateGroup,
//   employeeGroup,
//   leaveGroup,
//   attendanceGroup,
//   locationGroup,
//   masterGroup,
//   Separation,
// ]

// export const hrNav = [
//   dashboardItem,
//   { component: CNavTitle, name: 'HR Panel' },
//   openingsGroup,
//   interviewsGroup,
//   applicantListGroup,
//   candidateGroup,
//   employeeGroup,
//   leaveGroup,
//   attendanceGroup,
//   locationGroup,
//   masterGroup,
//   Separation,
// ]

// export const employeeNav = [
//   dashboardItem,
//   { component: CNavTitle, name: 'Employee Section' },
//   leaveGroupApplicant,
//   attendanceGroup,
//   interviewsGroup,
//   Separation,
// ]

// export const userNav = [{ component: CNavTitle, name: 'User Access' }, applicantGroup]

const fullMenuList = [
  // {
  //   component: CNavGroup,
  //   name: 'Dashboard',
  //   to: '/dashboard',
  //   icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  //   items: [{ component: CNavItem, name: 'Dashboard', to: '/dashboard' }],
  // },
  // {
  //   component: CNavGroup,
  //   name: 'Dashboard',
  //   to: '/dashboard',
  //   icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  //   // badge: { color: 'info', text: 'NEW' },
  //   items: [{ component: CNavItem, name: 'Dashboard', to: '/dashboard' }],
  // },
  {
    component: CNavGroup,
    name: 'Employee',
    to: '/employee',
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Details',
        to: '/employee/details',
      },
      {
        component: CNavItem,
        name: 'Employees Master',
        to: '/employees/list',
      },
      {
        component: CNavItem,
        name: 'Employees Transfer',
        to: '/employees/emp-transfer',
      },
      {
        component: CNavItem,
        name: 'Profile Update Application',
        to: '/profile/profile-update-applications',
      },
      {
        component: CNavItem,
        name: 'Document Generate',
        to: '/employees/document_generate',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Vendor',
    to: '/vendor',
    icon: <CIcon icon={cilApplications} customClassName="nav-icon" />,
    items: [
      // {
      //   component: CNavItem,
      //   name: 'Vendor Form',
      //   to: '/vendor/master-form',
      // },
      {
        component: CNavItem,
        name: 'Vendor List',
        to: '/vendor/master-list',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Openings',
    to: '/openings',
    icon: <CIcon icon={cilAsteriskCircle} customClassName="nav-icon" />,
    items: [
      // {
      //   component: CNavItem,
      //   name: 'Openings',
      //   to: '/openings',
      //   style: { paddingLeft: ' 3.5rem' },
      // },
      {
        component: CNavItem,
        name: 'Openings List View',
        to: '/openingsListView',
        // style: { paddingLeft: ' 3.5rem' },
      },
      {
        component: CNavItem,
        name: 'JD',
        to: '/jd-list',
      },
    ],
  },
  // {
  //   component: CNavGroup,
  //   name: 'Interviews',
  //   to: '/interviews',
  //   icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'Interviews',
  //       to: '/interviews',
  //     },
  //   ],
  // },
  {
    component: CNavGroup,
    name: 'Applicant',
    to: '/applicant',
    icon: <CIcon icon={cilApplications} customClassName="nav-icon" />,
    items: [
      // {
      //   component: CNavItem,
      //   name: 'OnBoard Form',
      //   to: '/applicant/add_new',
      // },
      // {
      //   component: CNavItem,
      //   name: 'Interview Form',
      //   to: '/applicant/interview_form',
      // },
      {
        component: CNavItem,
        name: 'Applicant List',
        to: '/applicant/list',
      },
      {
        component: CNavItem,
        name: 'Add Applicant',
        to: '/applicant/add',
      },
    ],
  },
  // {
  //   component: CNavGroup,
  //   name: 'Applicant',
  //   to: '/applicant',
  //   icon: <CIcon icon={cilApplications} customClassName="nav-icon" />,
  //   items: [
  //     // {
  //     //   component: CNavItem,
  //     //   name: 'OnBoard Form',
  //     //   to: '/applicant/add_new',
  //     // },
  //     // {
  //     //   component: CNavItem,
  //     //   name: 'Interview Form',
  //     //   to: '/applicant/interview_form',
  //     // },
  //     {
  //       component: CNavItem,
  //       name: 'Applicant List',
  //       to: '/applicant/list',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Add Applicant',
  //       to: '/applicant/add',
  //     },
  //   ],
  // },
  {
    component: CNavGroup,
    name: 'Resume Acceptance',
    to: '/resume-acceptance',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Applicant Resume Acceptance',
        to: '/applicant-resume-acceptance',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Candidate',
    to: '/candidate',
    icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Candidate List',
        to: '/candidate/form_list',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'BGV',
    to: '/bgv',
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'BGV',
        to: '/bgv',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Leave',
    to: '/leave',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Requested Leaves',
        to: '/employee-leave-list',
      },
      {
        component: CNavItem,
        name: 'My Leaves',
        to: '/apply-leave',
      },
      {
        component: CNavItem,
        name: 'Leaves Status',
        to: '/emp-leave-status',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Attendance',
    to: '/attandance',
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'View Attendance',
        to: '/attandance/track',
        // to: '/emp-attandance-list',
      },
      {
        component: CNavItem,
        name: 'Team Attendance',
        // to: '/attandance/track',
        to: '/emp-attandance-list',
      },
      // {
      //   component: CNavItem,
      //   name: 'Store Team Attendance',
      //   to: '/store-attendance-list',
      // },
      {
        component: CNavItem,
        name: 'Regularize Request',
        to: '/regularize-request',
      },
      {
        component: CNavItem,
        name: 'GeoFence Request',
        to: '/geofence-request',
      },
      {
        component: CNavItem,
        name: 'Shift Master',
        to: '/overall-shift-master',
      },
      {
        component: CNavItem,
        name: 'Attendance Regularization',
        to: '/attendance-regularization',
      },
      {
        component: CNavItem,
        name: 'Emp Shift Alignment',
        to: '/emp-shift-alignment',
      },
      {
        component: CNavItem,
        name: 'Add Weekly-Off',
        to: '/attendance-add-weekly-off',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Location',
    to: '/store',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    items: [
      // {
      //   component: CNavItem,
      //   name: 'Add Location',
      //   to: '/store/add_new',
      // },
      {
        component: CNavItem,
        name: 'Locations',
        to: '/store-list/all',
      },
      {
        component: CNavItem,
        name: 'Geofence',
        to: '/Geo-fence',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'NSO Routing',
    to: '/nso-routing',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'New Stores',
        to: '/new-stores',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Masters',
    to: '/master',
    icon: <CIcon icon={cilExternalLink} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Designations',
        to: '/master/designations',
      },
      {
        component: CNavItem,
        name: 'Departments',
        to: '/master/departments',
      },
      {
        component: CNavItem,
        name: 'Sub-Departments',
        to: '/master/sub-departments',
      },
      {
        component: CNavItem,
        name: 'Designation Mapping',
        to: '/master/designation-mapping',
      },
      {
        component: CNavItem,
        name: 'Seat',
        to: '/master/seat',
      },
      {
        component: CNavItem,
        name: 'PF',
        to: '/master/pf',
      },
      {
        component: CNavItem,
        name: 'LWF',
        to: '/master/lwf',
      },
      {
        component: CNavItem,
        name: 'PT',
        to: '/master/pt',
      },
      {
        component: CNavItem,
        name: 'ESIC Emp',
        to: '/master/esic-emp',
      },
      {
        component: CNavItem,
        name: 'Gratuity',
        to: '/master/gratuity',
      },
      {
        component: CNavItem,
        name: 'Shift',
        to: '/master/shift',
      },
      {
        component: CNavItem,
        name: 'Machine',
        to: '/master/machine',
      },
      {
        component: CNavItem,
        name: 'Leave Master',
        to: '/master/leave',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Holiday Master',
    to: '/holiday-master',
    icon: <CIcon icon={cilCalendarCheck} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Groups',
        to: '/holiday-master/groups',
      },
      {
        component: CNavItem,
        name: 'Holidays',
        to: '/holiday-master/holidays',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Uploaders',
    to: '/uploaders',
    icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Additional Payment',
        to: '/payment-uploader',
      },
      {
        component: CNavItem,
        name: 'Emp-Zone-Region-Cluster',
        to: '/emp-zone-region-cluster-map-uploader',
      },
      {
        component: CNavItem,
        name: 'Location Master',
        to: '/location-uploader',
      },
      {
        component: CNavItem,
        name: 'Store-State Linking',
        to: '/uploader/store-state_linking',
      },
      {
        component: CNavItem,
        name: 'Emp-Store Assignment',
        to: '/emp-store-assignment',
      },
      {
        component: CNavItem,
        name: 'Bgt Seat Master',
        to: '/bgt-seat-uploader',
      },
      {
        component: CNavItem,
        name: 'EmpCode Seat Master',
        to: '/ecode-seat-uploader',
      },
      {
        component: CNavItem,
        name: 'Emp Attendnace',
        to: '/emp-attendance-uploader',
      },
      {
        component: CNavItem,
        name: 'Emp Deduction',
        to: '/emp-tds-uploader',
      },
      {
        component: CNavItem,
        name: 'Applicability',
        to: '/applicability-uploader',
      },
      {
        component: CNavItem,
        name: 'Emp Salary Structure',
        to: '/salary-structure-uploader',
      },
      {
        component: CNavItem,
        name: 'Leave Opening Balance',
        to: '/leave-opening-balance-uploader',
      },
      {
        component: CNavItem,
        name: 'Emp Personal Details',
        to: '/emp-personal-details-uploader',
      },
      {
        component: CNavItem,
        name: 'Emp Statutory Details',
        to: '/emp-statutory-details-uploader',
      },
      {
        component: CNavItem,
        name: 'Emp Degree Qualifications',
        to: '/emp-degree-qualifications-uploader',
      },
      {
        component: CNavItem,
        name: 'Emp Past Experience',
        to: '/emp-past-experience-uploader',
      },
      {
        component: CNavItem,
        name: 'Emp Joining Releaving',
        to: '/emp-joining-releaving-uploader',
      },
      {
        component: CNavItem,
        name: 'Emp Revised Dept-Desg-Loc',
        to: '/emp-revised-dept-desg-loc-uploader',
      },
      {
        component: CNavItem,
        name: 'Gratutiy & Bonus',
        to: '/grauity-bonus-uploader',
      },
      {
        component: CNavItem,
        name: 'Emp Salary Status',
        to: '/emp-salary-status-uploader',
      },
      {
        component: CNavItem,
        name: 'Comp Off',
        to: '/comp-off-uploader',
      },
      {
        component: CNavItem,
        name: 'Shift Alignment',
        to: '/shift-alignment-uploader',
      },

      {
        component: CNavItem,
        name: 'Bonus',
        to: '/emp-bonus-uploader',
      },
      {
        component: CNavItem,
        name: 'Retention Bonus',
        to: '/uploaders/retention-bonus',
      },
      {
        component: CNavItem,
        name: 'Medical Card',
        to: '/medical-card',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Views',
    to: '/views',
    icon: <CIcon icon={cilLibrary} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Location Master View',
        to: '/location-master-view',
      },
      {
        component: CNavItem,
        name: 'Bgt Seat Master View',
        to: '/bgt_seat-master-view',
      },
      {
        component: CNavItem,
        name: 'Emp Code Seat Master',
        to: '/emp_code-seat_master-view',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Finance',
    to: '/financial',
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Processed Salary',
        to: '/finance/process-salary',
      },
      {
        component: CNavItem,
        name: 'Given To Bank',
        to: '/finance/given-to-bank',
      },
      {
        component: CNavItem,
        name: 'Paid By Bank',
        to: '/finance/paid-by-bank',
      },
      {
        component: CNavItem,
        name: 'Return By Bank',
        to: '/finance/return-by-bank',
      },
      {
        component: CNavItem,
        name: 'Paid By Cash',
        to: '/finance/paid-by-cash',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Salary Master',
    to: '/salary-master',
    icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
    items: [
      // {
      //   component: CNavItem,
      //   name: 'F&F',
      //   to: '/fnf',
      // },
      {
        component: CNavItem,
        name: 'Salary Summary',
        to: '/salary_summery',
      },
      {
        component: CNavItem,
        name: 'Salary',
        to: '/salary',
      },
      {
        component: CNavItem,
        name: 'Min Wages',
        to: '/salary/min-wages',
      },
      // {
      //   component: CNavItem,
      //   name: 'Month Salary',
      //   to: '/month-salary',
      // },
      {
        component: CNavItem,
        name: 'Net Payable',
        to: '/month',
      },
      {
        component: CNavItem,
        name: 'Emp Final Data',
        to: '/emp-final-data',
      },
      {
        component: CNavItem,
        name: 'Payable Days',
        to: '/payable-days',
      },
      {
        component: CNavItem,
        name: 'Leave',
        to: '/leave-l',
      },
      // {
      //   component: CNavItem,
      //   name: 'Comp Off',
      //   to: '/comp-off',
      // },
      // {
      //   component: CNavItem,
      //   name: 'Earned Leaves',
      //   to: '/earned-leaves',
      // },
      // {
      //   component: CNavItem,
      //   name: 'Casual Leaves',
      //   to: '/casual-leaves',
      // },
      {
        component: CNavItem,
        name: 'Gross Earning',
        to: '/gross-earning',
      },
      {
        component: CNavItem,
        name: 'Deduction',
        to: '/deduction',
      },
      {
        component: CNavItem,
        name: 'PF',
        to: '/pf',
      },
      {
        component: CNavItem,
        name: 'ESI',
        to: '/esi',
      },
      // {
      //   component: CNavItem,
      //   name: 'Gratuity & Bonus',
      //   to: '/gratuity-bonus',
      // },
    ],
  },
  // {
  //   component: CNavGroup,
  //   name: 'Salary New',
  //   to: '/salary-new',
  //   icon: <CIcon icon={cilDoor} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'LOC & EMP',
  //       to: '/loc-emp',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Salary Paid Status',
  //       to: '/salary-status',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Leave Master',
  //       to: '/leave-master',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Bgt Salary Structure',
  //       to: '/bgt-salary-structure',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Gross Earning Details',
  //       to: '/gross-earning-details',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Deduction Details',
  //       to: '/deduction-details',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Gratuity & Bonus',
  //       to: '/gratuitybonus',
  //     },
  //   ],
  // },
  {
    component: CNavGroup,
    name: 'Payroll',
    to: '/payroll',
    icon: <CIcon icon={cilBank} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Summary',
        to: '/payroll-summary',
      },
      {
        component: CNavItem,
        name: 'Processed Salary',
        to: '/processed-salary',
      },
      {
        component: CNavItem,
        name: 'Last-Month Salary',
        to: '/last-month-salary',
      },
      {
        component: CNavItem,
        name: 'Payroll',
        to: '/payroll',
      },
      {
        component: CNavItem,
        name: 'Paid By Bank',
        to: '/bank-paid',
      },
      {
        component: CNavItem,
        name: 'Given To Bank',
        to: '/given-to-bank',
      },
      {
        component: CNavItem,
        name: 'Return By Bank',
        to: '/return-by-bank',
      },
      {
        component: CNavItem,
        name: 'Paid By Cash',
        to: '/paid-by-cash',
      },
      {
        component: CNavItem,
        name: 'Weekly-off Holiday',
        to: '/weekly-off-holiday',
      },
      {
        component: CNavItem,
        name: 'Weekly-off Policy',
        to: '/weekly-off-policy',
      },
      {
        component: CNavItem,
        name: 'Salary Slips',
        to: '/sldetails-view-downlasf1oad-salary-slips',
      },
      // {
      //   component: CNavItem,
      //   name: 'Salary Recalculate',
      //   to: '/salary-control-panel',
      // },
      // {
      //   component: CNavItem,
      //   name: 'Employee Salary Add-ons',
      //   to: '/salary-addons',
      // },
      // {
      //   component: CNavItem,
      //   name: 'Employee Deduction',
      //   to: '/emp-deduction',
      // },
      // {
      //   component: CNavItem,
      //   name: 'Employee Leaves',
      //   to: '/emp-leaves',
      // },
      {
        component: CNavItem,
        name: 'Salary Recalculate',
        to: '/salary_recal',
      },
      {
        component: CNavItem,
        name: 'Process Salary',
        to: '/process-salary',
      },
      {
        component: CNavItem,
        name: 'Processed Salary Request',
        to: '/processed-salary-request',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Incentive',
    icon: <CIcon icon={cilGift} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Create',
        to: '/incentive/create',
      },
      { component: CNavItem, name: 'My Requests', to: '/incentive/requests' },
      { component: CNavItem, name: 'CMD Approvals', to: '/incentive/cmd' },
      { component: CNavItem, name: 'HR Approvals', to: '/incentive/hr' },
    ],
  },
  // {
  //   component: CNavGroup,
  //   name: 'Paid By Bank',
  //   to: '/bank-paid',
  //   icon: <CIcon icon={cilExternalLink} customClassName="nav-icon" />,
  //   items: [

  //   ],
  // },Record Resignation Others
  {
    component: CNavGroup,
    name: 'Separation',
    to: '/sepration',
    icon: <CIcon icon={cilDoor} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Resignation (Self)',
        to: '/sepration/record_resignation',
      },
      {
        component: CNavItem,
        name: 'Resignation (Others)',
        to: '/sepration/record_resignation_others',
      },
      {
        component: CNavItem,
        name: 'Resignation Status',
        to: '/sepration/resignation_status',
      },
      {
        component: CNavItem,
        name: 'Resignation Applications',
        to: '/sepration/resignation_applications',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Full And Final',
    to: '/fnf',
    icon: <CIcon icon={cilDoor} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'F&F',
        to: '/fnf',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Settings',
    to: '/settings',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'RBAC Panel',
        to: '/rbac-panel',
      },
      {
        component: CNavItem,
        name: 'Modules Catalog',
        to: '/settings/modules-catalog',
      },
      {
        component: CNavItem,
        name: 'Employee-Role List',
        to: '/employee-role_list',
      },
      {
        component: CNavItem,
        name: 'Role Assignment',
        to: '/role-assign',
      },
      {
        component: CNavItem,
        name: 'Employee Logs',
        to: '/employee-logs',
      },
      {
        component: CNavItem,
        name: 'Attendance Logs',
        to: '/attendance-logs',
      },
      // {
      //   component: CNavItem,
      //   name: 'Geo Assignment',
      //   to: '/Geofence-Assignment',
      // },
    ],
  },
  {
    component: CNavGroup,
    name: 'Gap Reports',
    to: '/gap-reports',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Gap Reports',
        to: '/gap-reports',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Store Reporting Manager',
    to: '/store-reporting-manager',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Store Reporting Manager',
        to: '/store-reporting-manager',
      },
    ],
  },
]

// permissions: the array you get from backend (role → modules → subModules → actions)
// fullMenuList: your static nav config

// function buildMenuFromPermissions(fullMenuList = [], permissions = []) {
//   if (!Array.isArray(permissions) || permissions.length === 0) return []

//   // 1) Build fast lookup from permissions by Module/SubModule names
//   const role = permissions[0] // assuming single role context for a user
//   const modMap = new Map() // moduleName -> { moduleStatus, subMap: Map(subModuleName -> { subModuleStatus }) }

//   for (const mod of role.modules || []) {
//     const subMap = new Map()
//     for (const sm of mod.subModules || []) {
//       subMap.set((sm.subModuleName || '').trim().toLowerCase(), {
//         subModuleStatus: !!sm.subModuleStatus,
//       })
//     }
//     modMap.set((mod.moduleName || '').trim().toLowerCase(), {
//       moduleStatus: !!mod.moduleStatus,
//       subMap,
//     })
//   }

//   // 2) Filter fullMenuList against permission map while preserving structure
//   const filtered = []
//   for (const group of fullMenuList) {
//     if (group.component !== CNavGroup) continue

//     const moduleKey = (group.name || '').trim().toLowerCase()
//     const permModule = modMap.get(moduleKey)
//     if (!permModule || !permModule.moduleStatus) continue

//     const allowedItems = []
//     for (const item of group.items || []) {
//       if (item.component !== CNavItem) continue

//       const subKey = (item.name || '').trim().toLowerCase()
//       const permSub = permModule.subMap.get(subKey)

//       // Keep item only when submodule is permitted true
//       if (permSub && permSub.subModuleStatus) {
//         allowedItems.push(item)
//       }
//     }

//     if (allowedItems.length > 0) {
//       filtered.push({
//         ...group,
//         items: allowedItems,
//       })
//     }
//   }

//   return filtered
// }

// old function
// function buildMenuFromPermissions(fullMenuList, permissions) {
//   console.log('=== buildMenuFromPermissions Debug ===')
//   console.log('fullMenuList:', fullMenuList)
//   console.log('permissions:', permissions)

//   if (!Array.isArray(permissions) || permissions.length === 0) {
//     console.log('No permissions array or empty, returning empty array')
//     return []
//   }

//   // Build permission lookup
//   const role = permissions[0]
//   console.log('Role:', role)
//   const modMap = new Map()

//   for (const mod of role.modules || []) {
//     const subMap = new Map()
//     for (const sm of mod.subModules || []) {
//       subMap.set((sm.subModuleName || '').trim().toLowerCase(), {
//         subModuleStatus: !!sm.subModuleStatus,
//       })
//     }
//     modMap.set((mod.moduleName || '').trim().toLowerCase(), {
//       moduleStatus: !!mod.moduleStatus,
//       subMap,
//     })
//   }

//   console.log('Permission map built:', modMap)

//   // Filter the menu based on permissions
//   const filtered = []
//   for (const group of fullMenuList) {
//     console.log('group: ', group)
//     if (group.component !== CNavGroup) continue

//     // Always include Dashboard
//     if (group.name === 'Dashboard') {
//       console.log('Adding Dashboard (always allowed)')
//       filtered.push({
//         ...group,
//         component: group.component,
//         name: group.name,
//         to: group.to,
//         icon: group.icon,
//         items: group.items,
//       })
//       continue
//     }

//     // Always include Settings for role management
//     if (group.name === 'Settings') {
//       console.log('Adding Settings (always allowed)')
//       filtered.push({
//         ...group,
//         component: group.component,
//         name: group.name,
//         to: group.to,
//         icon: group.icon,
//         items: group.items,
//       })
//       continue
//     }

//     const moduleKey = (group.name || '').trim().toLowerCase()
//     const permModule = modMap.get(moduleKey)
//     console.log(
//       `Checking module: "${group.name}" -> key: "${moduleKey}" -> permission:`,
//       permModule,
//     )

//     if (!permModule || !permModule.moduleStatus) {
//       console.log(`Module "${group.name}" not allowed or not found in permissions`)
//       continue
//     }

//     console.log(`Module "${group.name}" is allowed, checking submodules...`)

//     const allowedItems = []
//     for (const item of group.items || []) {
//       if (item.component !== CNavItem) continue

//       const subKey = (item.name || '').trim().toLowerCase()
//       const permSub = permModule.subMap.get(subKey)
//       console.log(`  Submodule: "${item.name}" -> key: "${subKey}" -> permission:`, permSub)

//       if (permSub && permSub.subModuleStatus) {
//         console.log(`  Submodule "${item.name}" is allowed`)
//         // Keep the complete item object with all properties
//         allowedItems.push({
//           ...item,
//           component: item.component,
//           name: item.name,
//           to: item.to,
//           icon: item.icon,
//           style: item.style,
//         })
//       } else {
//         console.log(`  Submodule "${item.name}" is NOT allowed`)
//       }
//     }

//     if (allowedItems.length > 0) {
//       console.log(`Adding module "${group.name}" with ${allowedItems.length} allowed submodules`)
//       // Keep the complete group object with all properties
//       filtered.push({
//         ...group,
//         component: group.component,
//         name: group.name,
//         to: group.to,
//         icon: group.icon,
//         items: allowedItems,
//       })
//     } else {
//       console.log(`Module "${group.name}" has no allowed submodules, skipping`)
//     }
//   }

//   console.log('Final filtered menu:', filtered)
//   console.log('=== End Debug ===')
//   return filtered
// }

// new function - without furtherParts
// function buildMenuFromPermissions(fullMenuList, permissions) {
//   // console.log('=== buildMenuFromPermissions Debug ===')
//   // console.log('fullMenuList:', fullMenuList)
//   console.log('permissions:', permissions)

//   if (!Array.isArray(permissions) || permissions.length === 0) {
//     // console.log('No permissions array or empty, returning empty array')
//     return []
//   }

//   // Build merged permission map for all roles
//   const modMap = new Map()

//   for (const role of permissions) {
//     for (const mod of role.modules || []) {
//       const moduleKey = (mod.moduleName || '').trim().toLowerCase()
//       if (!modMap.has(moduleKey)) {
//         modMap.set(moduleKey, {
//           moduleStatus: false,
//           subMap: new Map(),
//         })
//       }

//       const existingModule = modMap.get(moduleKey)
//       existingModule.moduleStatus = existingModule.moduleStatus || !!mod.moduleStatus

//       for (const sm of mod.subModules || []) {
//         const subKey = (sm.subModuleName || '').trim().toLowerCase()
//         if (!existingModule.subMap.has(subKey)) {
//           existingModule.subMap.set(subKey, {
//             subModuleStatus: false,
//             // actionsMap: key -> merged action object meta
//             actionsMap: new Map(),
//           })
//         }

//         const existingSub = existingModule.subMap.get(subKey)
//         existingSub.subModuleStatus = existingSub.subModuleStatus || !!sm.subModuleStatus

//         for (const act of sm.actions || []) {
//           const actionKey = (act.actionName || '').trim().toLowerCase()
//           if (!existingSub.actionsMap.has(actionKey)) {
//             // initialize merged action record
//             existingSub.actionsMap.set(actionKey, {
//               actionName: act.actionName || '',
//               actionIds: new Set(), // collect ids from multiple roles
//               actionStatus: false, // OR across roles
//               furtherParts: new Set(), // union of furtherParts
//             })
//           }

//           const existingAction = existingSub.actionsMap.get(actionKey)
//           if (act.actionId !== undefined && act.actionId !== null) {
//             existingAction.actionIds.add(act.actionId)
//           }
//           existingAction.actionStatus = existingAction.actionStatus || !!act.actionStatus

//           for (const fp of act.furtherParts || []) {
//             // furtherParts may be objects/strings; store as-is but avoid duplicates by stringifying if necessary
//             // Here we assume they are primitive or stable objects; we store JSON strings for uniqueness then parse later if needed
//             try {
//               const key = typeof fp === 'string' ? fp : JSON.stringify(fp)
//               existingAction.furtherParts.add(key)
//             } catch (e) {
//               // fallback: push the raw value as string
//               existingAction.furtherParts.add(String(fp))
//             }
//           }
//         }
//       }
//     }
//   }

//   // console.log('Permission map built:', modMap)

//   // Filter the menu based on permissions and attach merged actions
//   const filtered = []
//   for (const group of fullMenuList) {
//     // console.log('group: ', group)
//     if (group.component !== CNavGroup) continue

//     // Always include Dashboard
//     if (group.name === 'Dashboard') {
//       // console.log('Adding Dashboard (always allowed)')
//       filtered.push({ ...group })
//       continue
//     }

//     // Always include Settings for role management
//     if (group.name === 'Settings') {
//       // console.log('Adding Settings (always allowed)')
//       filtered.push({ ...group })
//       continue
//     }

//     const moduleKey = (group.name || '').trim().toLowerCase()
//     const permModule = modMap.get(moduleKey)
//     // console.log(
//     //   `Checking module: "${group.name}" -> key: "${moduleKey}" -> permission:`,
//     //   permModule,
//     // )

//     if (!permModule || !permModule.moduleStatus) {
//       // console.log(`Module "${group.name}" not allowed or not found in permissions`)
//       continue
//     }

//     // console.log(`Module "${group.name}" is allowed, checking submodules...`)

//     const allowedItems = []
//     for (const item of group.items || []) {
//       if (item.component !== CNavItem) continue

//       const subKey = (item.name || '').trim().toLowerCase()
//       const permSub = permModule.subMap.get(subKey)
//       // console.log(`  Submodule: "${item.name}" -> key: "${subKey}" -> permission:`, permSub)

//       if (permSub && permSub.subModuleStatus) {
//         // console.log(`  Submodule "${item.name}" is allowed`)

//         // Build actions array from actionsMap
//         const actions = []
//         for (const [_, a] of permSub.actionsMap) {
//           // We include only actions that are allowed (actionStatus true).
//           if (!a.actionStatus) continue

//           const furtherPartsArray = []
//           for (const fpKey of a.furtherParts) {
//             // try to parse json keys back to objects if possible
//             try {
//               const parsed = JSON.parse(fpKey)
//               furtherPartsArray.push(parsed)
//             } catch (e) {
//               furtherPartsArray.push(fpKey)
//             }
//           }

//           actions.push({
//             // merged action object
//             actionName: a.actionName,
//             actionIds: Array.from(a.actionIds),
//             actionStatus: true,
//             furtherParts: furtherPartsArray,
//           })
//         }

//         allowedItems.push({
//           ...item,
//           actions, // attach merged & allowed actions
//         })
//       } else {
//         // console.log(`  Submodule "${item.name}" is NOT allowed`)
//       }
//     }

//     if (allowedItems.length > 0) {
//       // console.log(`Adding module "${group.name}" with ${allowedItems.length} allowed submodules`)
//       filtered.push({
//         ...group,
//         items: allowedItems,
//       })
//     } else {
//       // console.log(`Module "${group.name}" has no allowed submodules, skipping`)
//     }
//   }

//   // console.log('Final filtered menu:', filtered)
//   // console.log('=== End Debug ===')
//   return filtered
// }

// new function - with furtherParts
function buildMenuFromPermissions(fullMenuList, permissions) {
  // debugger
  // console.log('=== buildMenuFromPermissions Debug ===')
  // console.log('fullMenuList:', fullMenuList)
  // console.log('permissions:', permissions)

  if (!Array.isArray(permissions) || permissions.length === 0) {
    // console.log('No permissions array or empty, returning empty array')
    return []
  }

  // helper to normalize action keys (case-insensitive)
  const norm = (s = '') => (s + '').trim().toLowerCase()

  // merged permission map for modules -> submodules -> actions
  const modMap = new Map()

  for (const role of permissions) {
    for (const mod of role.modules || []) {
      const moduleKey = (mod.moduleName || '').trim().toLowerCase()
      if (!modMap.has(moduleKey)) {
        modMap.set(moduleKey, {
          moduleStatus: false,
          subMap: new Map(),
        })
      }

      const existingModule = modMap.get(moduleKey)
      existingModule.moduleStatus = existingModule.moduleStatus || !!mod.moduleStatus

      for (const sm of mod.subModules || []) {
        const subKey = (sm.subModuleName || '').trim().toLowerCase()
        if (!existingModule.subMap.has(subKey)) {
          existingModule.subMap.set(subKey, {
            subModuleStatus: false,
            actionsMap: new Map(), // actionNameKey -> merged action meta
          })
        }

        const existingSub = existingModule.subMap.get(subKey)
        existingSub.subModuleStatus = existingSub.subModuleStatus || !!sm.subModuleStatus

        for (const act of sm.actions || []) {
          const actionKey = norm(act.actionName || String(act.actionId || ''))
          if (!existingSub.actionsMap.has(actionKey)) {
            existingSub.actionsMap.set(actionKey, {
              actionName: act.actionName || '',
              actionIds: new Set(),
              actionStatus: false,
              furtherPartsMap: new Map(), // actionFurtherPartId/name -> object
            })
          }

          const existingAction = existingSub.actionsMap.get(actionKey)

          // collect action ids if present
          if (act.actionId !== undefined && act.actionId !== null) {
            existingAction.actionIds.add(act.actionId)
          }

          // OR combine actionStatus
          existingAction.actionStatus = existingAction.actionStatus || !!act.actionStatus

          // merge furtherParts (preserve objects)
          for (const fp of act.furtherParts || []) {
            // try prefer id key if available, else name
            const fpId = fp?.actionFurtherPartId ?? null
            const fpName = fp?.actionFurtherPartName ?? (typeof fp === 'string' ? fp : null)
            const fpKey =
              fpId !== null
                ? String(fpId)
                : fpName
                  ? String(fpName).trim().toLowerCase()
                  : JSON.stringify(fp)

            if (!existingAction.furtherPartsMap.has(fpKey)) {
              // store a shallow copy to avoid mutating frozen objects
              existingAction.furtherPartsMap.set(fpKey, { ...(fp || {}) })
            } else {
              // If same key already present you could OR statuses if it exists:
              const existingFp = existingAction.furtherPartsMap.get(fpKey)
              // if it has a status field, OR it
              if (
                existingFp &&
                typeof existingFp.furtherPartStatus !== 'undefined' &&
                typeof fp.furtherPartStatus !== 'undefined'
              ) {
                const merged = {
                  ...existingFp,
                  furtherPartStatus: existingFp.furtherPartStatus || fp.furtherPartStatus,
                }
                existingAction.furtherPartsMap.set(fpKey, merged)
              }
            }
          }
        }
      }
    }
  }

  console.log('Permission map built:', modMap)

  // Build filtered menu and attach merged actions (array of objects with furtherParts array)
  const filtered = []
  for (const group of fullMenuList) {
    if (group.component !== CNavGroup) continue

    // Always include Dashboard & Settings unchanged
    // if (group.name === 'Dashboard' || group.name === 'Settings') {
    //   filtered.push({ ...group })
    //   continue
    // }

    const moduleKey = (group.name || '').trim().toLowerCase()
    const permModule = modMap.get(moduleKey)
    if (!permModule || !permModule.moduleStatus) continue

    const allowedItems = []
    for (const item of group.items || []) {
      if (item.component !== CNavItem) continue

      const subKey = (item.name || '').trim().toLowerCase()
      const permSub = permModule.subMap.get(subKey)
      if (permSub && permSub.subModuleStatus) {
        // convert actionsMap -> actions array preserving structure
        const actions = []
        for (const [_, ma] of permSub.actionsMap) {
          // include both enabled and disabled actions if you want; here we include all but preserve actionStatus
          const furtherPartsArray = Array.from(ma.furtherPartsMap.values())
          actions.push({
            actionName: ma.actionName,
            actionIds: Array.from(ma.actionIds),
            actionStatus: !!ma.actionStatus,
            furtherParts: furtherPartsArray,
          })
        }

        allowedItems.push({
          ...item,
          actions,
        })
      }
    }

    if (allowedItems.length > 0) {
      filtered.push({
        ...group,
        items: allowedItems,
      })
    }
  }

  console.log('Final filtered menu:', filtered)
  console.log('=== End Debug ===')
  return filtered
}

// Remove the helper function as it's no longer needed
// function getIconType(icon) {
//   if (!icon) return null

//   // If it's a React component, try to get the icon name
//   if (icon.props && icon.props.icon) {
//     // Extract icon identifier from props
//     return Array.isArray(icon.props.icon) ? icon.props.icon[1] : icon.props.icon
//   }

//   // If it's a component type, return the name
//   if (icon.type && icon.type.name) {
//     return icon.type.name
//   }

//   return null
// }

// const getRouteList = () => {
//   const { permissions } = useSelector((state) => state?.auth?.data || {})
//   const result = buildMenuFromPermissions(fullMenuList, permissions)
//   console.log('result in getRouteList: ', result)
// }

// getRouteList()

export { fullMenuList, buildMenuFromPermissions }
