import axiosInstance from './axiosInstance'
import axiosInstance2 from './axiosInstance2'

// Backend-enforced page access check. Pass the React Router route PATTERN
// (e.g. "/employee/update/:id"), not the resolved URL. Returns
// { allowed, reason, routePath, subModuleId, roleName }.
export const checkPageAccess = async (path) => {
  const response = await axiosInstance.get('/api/Rbac/CheckPageAccess', {
    params: { path },
  })
  return response.data
}

export const Login_api = async (data) => {
  try {
    // const response = await axiosInstance.post(`api/Auth/login`, data, {
    const response = await axiosInstance.post(`api/Auth/loginnew`, data, {
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error('Login API error:', error)
    throw error
  }
}

export const Logout_api = async () => {
  try {
    const response = await axiosInstance.post(
      'api/Auth/logout',
      {},
      {
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Logout API error:', error)
    throw error
  }
}

export const getApplicantList = async (currentPage, pageSize, searchText) => {
  if (currentPage && pageSize) {
    try {
      const response = await axiosInstance.get(`/api/Applicant/Applicantlist`, {
        params: {
          pageNumber: currentPage,
          pageSize: pageSize,
          searchTerm: searchText,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return response?.data?.data?.candidates
    } catch (error) {
      console.error('Error fetching applicant list:', error)
      throw error
    }
  }
}

export const searchEmployeeDropdown = async (searchText, designation = '') => {
  const normalizedDesignation = designation.trim()

  const url = normalizedDesignation
    ? `api/Employee/SearchEmployee?searchTerm=${encodeURIComponent(searchText)}&designation=${normalizedDesignation}`
    : `api/Employee/SearchEmployee?searchTerm=${encodeURIComponent(searchText)}`

  try {
    const response = await axiosInstance.get(url)
    return response
  } catch (error) {
    console.error('search api error:', error)
    return []
  }
}

export const employeeAttandanceData = async (attendaceBody) => {
  try {
    const response = await axiosInstance.post(
      'api/EmpAttendance/GetMonthlyAttendance',
      attendaceBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    return response
  } catch (error) {
    console.error('Error fetching employee attendance data:', error)
    throw error
  }
}

export const AttendanceRegularization = async (formData) => {
  try {
    const response = await axiosInstance.post('api/EmpAttendance/regularization', formData, {
      headers: {},
    })
    return response
  } catch (error) {
    console.error(error)
    const err = error?.response?.data?.message
    return error
  }
}

export const exportAttendance = async (requestBody) => {
  try {
    const response = await axiosInstance.post(
      'api/EmpAttendance/DownloadMonthlyAttendanceExcel',
      requestBody,
      {
        headers: {
          // 'Content-Type': 'application/json',
          Accept: '*',
        },
        responseType: 'blob',
      },
    )

    return response
  } catch (error) {
    console.error('Error exporting attendance:', error)
  }
}

export const exportEmployeeMaster = async ({ isActive, allEmployee, companyId }) => {
  // console.log('ppppppppppppppppp', isActive, allEmployee, companyId)

  try {
    const response = await axiosInstance.get(
      `api/Employee/download-excel?isActive=${isActive}&allEmployee=${allEmployee}&companyId=${companyId}`,
      {
        headers: {
          // 'Content-Type': 'application/json', // Optional
          Accept: '*/*',
        },
        responseType: 'blob',
      },
    )

    return response
  } catch (error) {
    console.error('Error exporting employee master:', error)
    throw error // rethrow if you want to handle it in calling function
  }
}

export const exportEmpAttendanceFormatToExcel = async () => {
  try {
    const response = await axiosInstance.get(`/api/View/GetEmpAttendanceFormat?asExcel=${true}`, {
      headers: {
        Accept: '*/*',
      },
      responseType: 'blob',
    })
    // console.log('response: ', response)

    return response
  } catch (error) {
    console.error('Error exporting employee master:', error)
    throw error // rethrow if you want to handle it in calling function
  }
}

// ---- Gap Reports ----
// List of available gap reports (for the dropdown on the Gap Reports page).
export const getGapReportsList = async () => {
  const response = await axiosInstance.get('/api/GapReports/List')
  return response.data
}

// Download a gap report as an Excel file. `report` is the key ('location' | 'employee').
export const exportGapReport = async (report, asOfDate = null) => {
  const params = { report }
  if (asOfDate) params.asOfDate = asOfDate
  const response = await axiosInstance.get('/api/GapReports/Export', {
    params,
    headers: { Accept: '*/*' },
    responseType: 'blob',
  })
  return response
}

export const exportBgtSalaryStructureWithEmpDetailsToExcel = async () => {
  try {
    const response = await axiosInstance.get(
      `/api/View/GetBgtSalaryWithEmpDetails?asExcel=${true}`,
      {
        headers: {
          Accept: '*/*',
        },
        responseType: 'blob',
      },
    )
    // console.log('response: ', response)

    return response
  } catch (error) {
    console.error('Error exporting employee master:', error)
    throw error // rethrow if you want to handle it in calling function
  }
}

export const exportLeaveMasterToExcel = async () => {
  try {
    const response = await axiosInstance.get(`/api/View/GetLeaveMaster?asExcel=${true}`, {
      headers: {
        Accept: '*/*',
      },
      responseType: 'blob',
    })
    // console.log('response: ', response)

    return response
  } catch (error) {
    console.error('Error exporting employee master:', error)
    throw error // rethrow if you want to handle it in calling function
  }
}

export const exportPfMasterToExcel = async () => {
  try {
    const response = await axiosInstance.get(`/api/View/GetPfMaster?asExcel=${true}`, {
      headers: {
        Accept: '*/*',
      },
      responseType: 'blob',
    })
    // console.log('response: ', response)

    return response
  } catch (error) {
    console.error('Error exporting employee master:', error)
    throw error // rethrow if you want to handle it in calling function
  }
}

export const exportEsiMasterToExcel = async () => {
  try {
    const response = await axiosInstance.get(`/api/View/GetEsicMaster?asExcel=${true}`, {
      headers: {
        Accept: '*/*',
      },
      responseType: 'blob',
    })
    // console.log('response: ', response)

    return response
  } catch (error) {
    console.error('Error exporting employee master:', error)
    throw error // rethrow if you want to handle it in calling function
  }
}

export const exportNetPayableToExcel = async () => {
  try {
    const response = await axiosInstance.get(`/api/View/GetNetPaybleList?asExcel=${true}`, {
      headers: {
        Accept: '*/*',
      },
      responseType: 'blob',
    })
    // console.log('response: ', response)

    return response
  } catch (error) {
    console.error('Error exporting employee master:', error)
    throw error // rethrow if you want to handle it in calling function
  }
}

export const exportTotalDeductionToExcel = async () => {
  try {
    const response = await axiosInstance.get(`/api/View/GetTotalDeductionList?asExcel=${true}`, {
      headers: {
        Accept: '*/*',
      },
      responseType: 'blob',
    })
    // console.log('response: ', response)

    return response
  } catch (error) {
    console.error('Error exporting employee master:', error)
    throw error // rethrow if you want to handle it in calling function
  }
}

export const candidateApproval = async (requestBody) => {
  try {
    const response = await axiosInstance.post('api/Candidate/CandidateApproval', requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    console.log('initialize response:', response)
    return response.data
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

// export const applicantApproval = async (requestBody) => {
//   try {
//     const response = await axiosInstance.post('api/Applicant/updateapplicantstatus', requestBody, {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     })
//     console.log('response', response)
//     return response.data
//   } catch (error) {
//     console.error('Error approving candidate:', error)
//     throw error
//   }
// }

export const regularizeSubmit = async (id, requestBody, role) => {
  const isAudit = String(role).toLowerCase().trim() === 'audit'
  // const url = isAudit
  //   ? `/api/EmpAttendance/regularize/lp/${Number(id)}`
  //   : `/api/EmpAttendance/regularize/manager/${Number(id)}`

  const url = `/api/EmpAttendance/regularize/approve/${Number(id)}`

  try {
    const response = await axiosInstance.post(
      // `api/EmpAttendance/UpdateRegularizeRequestStatus/${Number(id)}`,
      url,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    return response
  } catch (error) {
    console.error('Error submitting regularize:', error)
    throw error
  }
}

export const geoFenceSubmit = async (requestbody, managerId) => {
  try {
    const response = await axiosInstance.post(
      `/api/EmpAttendance/geo/attendance/status/${Number(managerId)}`,
      requestbody,
    )
    return response
  } catch (error) {
    return error
  }
}

export const getVendorEmployeesByContractorCode = async (
  contractorCode,
  searchTerm,
  isActiveFilter,
  pageNumber = 1,
  pageSize = 10,
  contractStartDate,
  contractEndDate,
) => {
  try {
    const response = await axiosInstance.get('/api/Vendor/GetVendorEmployeesByContractorCode', {
      params: {
        contractorCode,
        searchTerm: searchTerm || '',
        isActiveFilter: isActiveFilter ?? undefined,
        contractStartDate: contractStartDate ?? undefined,
        contractEndDate: contractEndDate ?? undefined,
        pageNumber,
        pageSize,
      },
    })

    return response
  } catch (error) {
    throw error
  }
}

//('api/EmpAttendance/RegularizeRequestsformanager/1?pageNumber=1&pageSize=10')
export const regularizeLists = async (employeeId, pageNumber, pageSize, searchText, statusId) => {
  try {
    const response = await axiosInstance.get(
      `api/EmpAttendance/RegularizeRequestsformanager/${employeeId}?statusId=${statusId}&pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchText}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    return response
  } catch (error) {
    console.error('Error fetching regularize list:', error)
    throw error
  }
}

export const GeofenceLists = async (employeeId, pageNumber, pageSize, searchText, statusId) => {
  try {
    const response = await axiosInstance.get(
      `api/EmpAttendance/daily-summary-geo/${employeeId}?statusId=${statusId}&pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchText}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    return response
  } catch (error) {
    console.error('Error fetching Geofence list:', error)
    throw error
  }
}

export const submitBudgetData = async (result) => {
  try {
    const response = await axiosInstance.post('api/StoreLocations/StoreBudget', result, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response
  } catch (error) {
    console.error('Error submitting budget data:', error)
    throw error
  }
}

// - emp list old api
// export const getEmployeeList = async ({ currentPage, pageSize, search }) => {
//   try {
//     const response = await axiosInstance.get(`api/EmployeeNew/GetEmployee`, {
//       params: {
//         pageNumber: currentPage,
//         pageSize: pageSize,
//         searchTerm: search,
//       },
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     })
//     return response.data // Return the actual data from the response
//   } catch (error) {
//     console.error('Error fetching employee list:', error)
//     throw error // Optionally re-throw the error to handle it further up
//   }
// }

export const getEmployeeListOld = async ({ currentPage, pageSize, search, mode = 'all' }) => {
  // console.log('search in api: ', search)
  try {
    const response = await axiosInstance.get(`api/EmployeeNew/GetEmployeeDetailsWithCards`, {
      params: {
        pageNumber: currentPage,
        pageSize: pageSize,
        searchTerm: search,
        mode,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data // Return the actual data from the response
  } catch (error) {
    console.error('Error fetching employee list:', error)
    throw error // Optionally re-throw the error to handle it further up
  }
}

export const getEmployeeList = async ({ currentPage, pageSize, search, mode = 'all' }) => {
  try {
    const response = await axiosInstance.get(`api/EmployeeNew/GetEmployeeDetailsWithCards_test`, {
      params: {
        pageNumber: currentPage,
        pageSize: 1000000,
        searchTerm: search,
        mode,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data // Return the actual data from the response
  } catch (error) {
    console.error('Error fetching employee list:', error)
    throw error // Optionally re-throw the error to handle it further up
  }
}

export const getEmployeeList_DC = async ({ currentPage, pageSize, search, mode = 'all' }) => {
  try {
    const response = await axiosInstance.get(`api/EmployeeNew/GetEmployeeDetailsWithCards_test`, {
      params: {
        pageNumber: currentPage,
        pageSize: pageSize,
        searchTerm: search,
        mode,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data // Return the actual data from the response
  } catch (error) {
    console.error('Error fetching employee list:', error)
    throw error // Optionally re-throw the error to handle it further up
  }
}

export const getCandidateList = async ({ currentPage, pageSize, search }) => {
  try {
    const response = await axiosInstance.get(`api/Candidate/GetCandidateList`, {
      params: {
        pageNumber: currentPage,
        pageSize: pageSize,
        searchTerm: search,
      },
      headers: {
        Accept: '*/*',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching candidate list:', error)
    throw error
  }
}

export const getStoreLocationMaster = async (pageNumber = 1) => {
  try {
    const response = await axiosInstance.get(`api/StoreLocations`, {
      headers: {
        Accept: '*/*',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error fetching store locations:', error)
    throw error
  }
}

export const getDropdownLocDesDep = async (val) => {
  try {
    const response = await axiosInstance.get(`api/Dropdown/GetDropdownData?type=${val}`, {
      headers: {
        Accept: '*/*',
      },
    })
    return response?.data // or handle the data as needed
  } catch (error) {
    console.error('Error fetching dropdown data:', error)
    throw error // or handle error appropriately
  }
}

export const getDropdownComp = async (val) => {
  try {
    const response = await axiosInstance.get(`api/Dropdown/GetCompany?type=${val}`, {
      headers: {
        Accept: '*/*',
      },
    })
    return response?.data // or handle the data as needed
  } catch (error) {
    console.error('Error fetching dropdown data:', error)
    throw error // or handle error appropriately
  }
}

export const getLocations = () => {
  return axiosInstance.get('/api/DropDown/GetLocation')
}

export const applyLeave = async (leaveRequest) => {
  try {
    const response = await axiosInstance.post('api/Leave/ApplyLeave', leaveRequest, {
      headers: {},
    })
    return response
  } catch (error) {
    console.error('Error applying leave:', error)
    throw error
  }
}

export const fetchEmpLeaveData = async (employeeId) => {
  try {
    const response = await axiosInstance.get(
      `api/Leave/GetEmployeeLeaveBalanceById/${employeeId}`,
      {
        headers: {},
      },
    )
    return response
  } catch (error) {
    console.error('Error fetching leave data:', error)
    // Handle error as needed
    throw error
  }
}

export const postGeoFencingdata = async (payload) => {
  try {
    const response = await axiosInstance.post('api/Location/UpdateLocationGeo', payload, {
      headers: {},
    })
    return response
  } catch (error) {
    console.error('Error geofencing Data:', error)
    // Handle error as needed
    throw error
  }
}

export const leaveTypeDropdowndata = async () => {
  try {
    const response = await axiosInstance.get('api/DropDown/GetLeaveType', {
      headers: {},
    })
    return response
  } catch (error) {
    console.error('Error fetching leave data:', error)
    throw error
  }
}

export const storeUpdate = async ({ updateId, requestBody }) => {
  try {
    const payload = {
      storeLocationDto: requestBody,
    }

    const response = await axiosInstance.post(`api/StoreLocations/${updateId}`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return response
  } catch (error) {
    console.error('Store update failed:', error.response?.data || error.message)
    throw error
  }
}

export const fetch_store_data = async (id) => {
  try {
    const response = await axiosInstance.get(`api/StoreLocations/${Number(id)}`, {
      headers: {},
    })
    return response
  } catch (error) {
    console.error('Error in fetch data', error)
    throw error
  }
}

export const fetch_countries_list = async () => {
  try {
    const response = await axiosInstance.get('api/DropDown/countries', {
      headers: {},
    })
    return response
  } catch (error) {
    console.error('Error in fetch Countries List', error)
    throw error
  }
}

export const getStateFromCountryValue = async (value) => {
  try {
    const response = await axiosInstance.get(`api/DropDown/states/${value}`, {
      headers: {},
    })
    return response
  } catch (error) {
    console.error('Error in fetch Countries List ', error)
    throw error
  }
}

export const getStoreData = async (id) => {
  try {
    const response = await axiosInstance.get(
      `api/StoreLocations/${id}`, // Replace with actual endpoint
      {
        headers: {},
      },
    )

    return response
  } catch (error) {
    console.error('Error in Fetching Store Data ', error)
    throw error
  }
}

export const getCandidateListData = async () => {
  try {
    const response = await axiosInstance.get(
      `api/Candidate/GetCandidateList?pageNumber=${1}&pageSize=${100000}`,
      {
        headers: {},
      },
    )

    return response
  } catch (error) {
    console.error('Error in fetching Candidate List')
    throw error
  }
}

export const getCandidateById = async (id) => {
  try {
    const response = await axiosInstance.get(
      `api/Candidate/GetCandidateDetails?candidateid=${id}`,
      {
        headers: {},
      },
    )
    return response
  } catch (error) {
    console.error('Error in fetching Candidate By id', error)
    throw error
  }
}

export const createUpdateCandidate = async ({ ef, id, pathname }) => {
  try {
    const create_url = 'api/Candidate/Insertnewcandidate'
    const update_url = 'api/Candidate/Updatecandidate'
    // const emp_update_url = `api/Employee/upsert`
    const emp_update_url = `api/EmployeeNew/UpdateEmployee`

    let url

    if (pathname && pathname.includes('/employee/update')) {
      url = id ? emp_update_url : 'wrong_path'
    } else if (pathname && pathname?.includes('/profile/my-profile')) {
      url = emp_update_url
    } else {
      url = id ? update_url : create_url
    }

    const response = await axiosInstance.post(url, ef, {
      headers: {
        'Content-Type': 'multipart/form-data',
        accept: '*/*',
      },
    })
    return response
  } catch (error) {
    console.error('Error in fetching Candidate Data')
    throw error
  }
}

export const candidateApprove = async (requestBody) => {
  try {
    const response = await axiosInstance.post('api/Candidate/CandidateApproval', requestBody, {
      headers: {},
    })
    return response
  } catch (error) {
    console.error('Error in Approving Candidate ', error)
    throw error
  }
}

export const getMasterData = async ({ pathname }) => {
  try {
    let url = ''

    switch (pathname) {
      case '/master/designations':
        url = 'api/DropDown/GetDesignation'
        break
      case '/master/departments':
        url = 'api/DropDown/GetDepartment'
        break
      default:
        throw new Error(`Unsupported pathname: ${pathname}`)
    }

    const res = await axiosInstance.get(url)
    return res // return only the response data
  } catch (error) {
    console.error('Error in fetching Master Data:', error)
    throw error
  }
}

export const storeLocationMasterList = async ({ currentPage, pageSize }) => {
  try {
    const response = await axiosInstance.get(
      `api/StoreLocations?pageNumber=${currentPage}&pageSize=${pageSize}`,
      {
        headers: {
          accept: '*/*',
        },
      },
    )
    return response
  } catch (error) {
    console.error('Error in fetching Store Locations ', error)
    throw error
  }
}

export const candidateFilter = async (payload) => {
  try {
    const response = await axiosInstance.post(`api/Candidate/search`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response
  } catch (error) {
    console.error('Error in fetching Candidate Data')
    throw error
  }
}

export const getApplicantListData = async ({ currentPage, pageSize, searchTextt, activeKey }) => {
  try {
    const response = await axiosInstance.get(
      `api/Applicant/GetApplicantListByStatus?pageNumber=${currentPage}&pageSize=${pageSize}&searchTerm=${searchTextt}&StatusId=${activeKey}`,
      {
        headers: {
          accept: '*/*',
        },
      },
    )
    return response
  } catch (error) {
    console.error('Error in fetching SApplicant List Data ', error)
    throw error
  }
}

export const getApplicantById = async (id) => {
  try {
    const response = await axiosInstance.get(`api/Applicant/applicantdetails/${id}`, {
      headers: {},
    })
    return response
  } catch (error) {
    console.error('Error in fetching Candidate By id', error)
    throw error
  }
}

export const applicantApproval = async (requestBody) => {
  try {
    const response = await axiosInstance.post('api/Applicant/updateapplicantstatus', requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchJobOpenings = async () => {
  try {
    // const response = await axiosInstance.get('api/JobOpening')
    const response = await axiosInstance.get('api/JobOpening/proc-openings')
    return response.data
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}
export const fetchGeoFencingData = async () => {
  try {
    // const response = await axiosInstance.get('api/JobOpening')
    const response = await axiosInstance.get('api/Location/GetLocationDataWithGeo')
    return response.data
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchPayroll = async ({ pageNumber, pageSize, search }) => {
  try {
    const response = await axiosInstance.get(
      `/api/Payroll/list?page=${parseInt(pageNumber)}&pageSize=${parseInt(pageSize)}&searchTerm=${search}`,
    )
    return response.data
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchGivenToBankDetails = async ({ pageNumber, pageSize, search }) => {
  try {
    const response = await axiosInstance.get(
      `/api/BankTransfer?page=${parseInt(pageNumber)}&pageSize=${pageSize}&searchTerm=${search}`,
    )
    return response.data
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchPaidByBank = async ({
  pageNumber,
  pageSize,
  eCode,
  search,
  monthYear,
  isExcel = false,
}) => {
  try {
    const response = await axiosInstance.get(
      `/api/PaidByBank?page=${parseInt(pageNumber)}&pageSize=${parseInt(pageSize)}&searchTerm=${search}&monthYear=${monthYear}&asExcel=${isExcel}`,
      {
        responseType: isExcel ? 'blob' : 'json',
      },
    )
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchWeeklyOffHolidays = async ({ pageNumber, pageSize, eCode, search }) => {
  try {
    const response = await axiosInstance.get(
      `/api/LocationDesignationWeeklyOffHolidayMaster?page=${parseInt(pageNumber)}&pageSize=${parseInt(pageSize)}&searchTerm=${search}`,
    )
    return response.data
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchWeeklyOffPolicy = async ({ pageNumber, pageSize, eCode, search }) => {
  try {
    const response = await axiosInstance.get(
      `/api/LocationDesignationPolicy?page=${parseInt(pageNumber)}&pageSize=${parseInt(pageSize)}&searchTerm=${search}`,
    )
    return response.data
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchPayableDays = async ({ pageNumber, pageSize, search }) => {
  try {
    const response = await axiosInstance.get(
      `/api/View/GetPaybleDays?page=${parseInt(pageNumber)}&pageSize=${parseInt(pageSize)}&searchTerm=${search}`,
    )
    return response.data
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchLocationMaster = async () => {
  try {
    const response = await axiosInstance.get(`/api/Location/GetAll`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchBgtSalaryMaster = async ({ search }) => {
  try {
    const new_search = String(search).trim()
    const search_to_send = new_search.length > 0 ? new_search : ''

    const response = await axiosInstance.get(
      `/api/View/GetBgtSalaryWithEmpDetails?ecode=${search_to_send}`,
    )
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchEmpAttendanceMaster = async () => {
  try {
    const response = await axiosInstance.get(`/api/Uploader/GetAllEmpAttendanceMaster`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const bonusPolicyName = async () => {
  try {
    const response = await axiosInstance.get(
      `/api/EcodeWiseBonusProvisioningPolicyMapping/bonus-policies`,
    )
    return response
  } catch (error) {
    console.error('Error fetching Bonus Policies:', error)
    throw error
  }
}

export const getBonusPolicyNameTable = async () => {
  try {
    const response = await axiosInstance.get(`/api/EcodeWiseBonusProvisioningPolicyMapping`)
    return response
  } catch (error) {
    console.error('Error fetching Bonus Policies:', error)
    throw error
  }
}

export const fetchEmpStatutoryDetails = async () => {
  try {
    const response = await axiosInstance.get(`/api/Uploader/GetAllEmpStatutoryDetails`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchEmpPastExperience = async () => {
  try {
    const response = await axiosInstance.get(`/api/Uploader/GetAllEmpPastExperienceDetails`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchCompOff = async () => {
  try {
    const response = await axiosInstance.get(`/api/Uploader/GetCompOffList`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchEmpBonus = async () => {
  try {
    const response = await axiosInstance.get(`/api/Uploader/GetEMPBonusList`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchEmpDegreeQualification = async () => {
  try {
    const response = await axiosInstance.get(`/api/Uploader/GetAllEmpDegreeQualification`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchEmpJoiningReleavingDetails = async () => {
  try {
    const response = await axiosInstance.get(`/api/Uploader/GetAllEmpJoiningReleavingDetails`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchEmpRevisedDeptDesgLocDetails = async () => {
  try {
    const response = await axiosInstance.get(`/api/Uploader/GetAllEmpRevisedDeptDesgLocDetails`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchEmpTDSMaster = async () => {
  try {
    const response = await axiosInstance.get(`/api/Uploader/GetAllEmpTDSTable`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchEmpSalaryStatus = async () => {
  try {
    const response = await axiosInstance.get(`/api/Uploader/GetEmpSalaryStatus`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchBonusAndGratuityOpening = async () => {
  try {
    const response = await axiosInstance.get(`/api/Uploader/GetBonusAndGratutityOpening`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const GetAllEcodeZoneRegionClusterMapping = async (isExcel = false) => {
  try {
    const response = await axiosInstance.get(
      `/api/Uploader/GetAllEcodeZoneRegionClusterMapping?ixExcel=${isExcel}`,
    )
    return response
  } catch (error) {
    return error
  }
}

export const GetAllEcodeZoneRegionClusterMappingExcel = async (isExcel = true) => {
  try {
    const response = await axiosInstance.get(
      `/api/Uploader/GetAllEcodeZoneRegionClusterMapping?ixExcel=${isExcel}`,
      {
        responseType: 'blob',
      },
    )
    return response
  } catch (error) {
    return error
  }
}

export const fetchPaymentMaster = async () => {
  try {
    const response = await axiosInstance.get(`/api/Uploader/GetAllUploadPaymentDetails`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchShiftAlignmentMaster = async ({
  pageNumber = 1,
  pageSize = 10,
  searchTerm = '',
}) => {
  try {
    const response = await axiosInstance.get(
      `/api/ShiftMap?page=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchTerm}`,
    )
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchPaidByCashMaster = async ({ pageNumber = 1, pageSize = 10, searchTerm = '' }) => {
  try {
    const response = await axiosInstance.get(
      `/api/PaidInCash?page=${pageNumber}&pageSize=${pageSize}&searchTerm=${searchTerm}`,
    )
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchApplicabilityMaster = async () => {
  try {
    const response = await axiosInstance.get(`/api/Uploader/GetAllApplicabilityMaster`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchEmpSalaryStructure = async ({ pageNumber, pageSize, eCode, search }) => {
  try {
    const response = await axiosInstance.get(`/api/Uploader/GetAllEmpSalaryStructure`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchEmpPersonalDetails = async () => {
  try {
    const response = await axiosInstance.get(`/api/Uploader/GetAllEmpPersonalDetails`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchGrossEarningMaster = async () => {
  try {
    const response = await axiosInstance.get(`/api/View/GetEmpAttendanceFormat`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchLeaveOpeningBal = async () => {
  try {
    const response = await axiosInstance.get(`/api/Uploader/GetAllLeaveOpeningBalTable`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchEmpCodeSeatMaster = async () => {
  try {
    const response = await axiosInstance.get(`/api/BgtSeatAssignment/GetAll`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchLeaveMaster = async () => {
  try {
    const response = await axiosInstance.get(`/api/View/GetLeaveMaster`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchSalarySlipDetails = async ({ month, pageNumber, pageSize, search }) => {
  try {
    const new_search = String(search).trim()
    const search_to_send = new_search.length > 0 ? new_search : ''

    const response = await axiosInstance.get(
      `/api/Employee/GetAllSalarySlipsDetail?month=${month}&pageNumber=${parseInt(pageNumber)}&pageSize=${parseInt(pageSize)}&searchTerm=${search_to_send}`,
    )
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchBgtSeatMaster = async () => {
  try {
    const response = await axiosInstance.get(`/api/BgtSeatMaster/GetAll`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchDeductionList = async ({ search }) => {
  try {
    const new_search = String(search).trim()
    const search_to_send = new_search.length > 0 ? new_search : ''

    const response = await axiosInstance.get(
      `/api/View/GetTotalDeductionList?ecode=${search_to_send}`,
    )
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchPFList = async ({ search, pageSize = 10, pageNumber = 1, monthYear }) => {
  try {
    const new_search = String(search || '').trim()
    const searchTerm = new_search.length > 0 ? new_search : ''

    return await axiosInstance.get('/api/Uploader/GetEmployeePayroll', {
      params: {
        monthYear,
        pageNumber,
        pageSize,
        searchTerm,
      },
    })
  } catch (error) {
    console.error('Error fetching PF list:', error)
    throw error
  }
}

export const fetchESICList = async ({ pageNumber, pageSize, eCode, search }) => {
  try {
    const response = await axiosInstance.get(`/api/View/GetEsicMaster`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchESICListNew = async ({ pageNumber, pageSize, search }) => {
  try {
    const response = await axiosInstance.get('/api/Uploader/GetEmployeeESIC', {
      params: {
        searchTerm: search,
        pageNumber,
        pageSize,
      },
    })
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchNetPayableCList = async () => {
  try {
    const response = await axiosInstance.get(`/api/View/GetNetPaybleList`)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const fetchNetPayableBatchList = async (isExcel = false) => {
  try {
    const response = await axiosInstance.get(
      `/api/NetPaybleBatch/GetNetPaybleBatchList?asExcel=${isExcel}`,
      {
        responseType: isExcel ? 'blob' : 'json',
      },
    )
    return response
  } catch (error) {
    console.error('Error fetching net payable batch list:', error)
    throw error
  }
}

export const fetchReturnByBank = async ({ pageNumber, pageSize, eCode, search }) => {
  try {
    const response = await axiosInstance.get(
      `/api/ReturnByBank?page=${parseInt(pageNumber)}&pageSize=${parseInt(pageSize)}&searchTerm=${search}`,
    )
    return response.data
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const markEmployeeActiveStatus = async (requestBody) => {
  try {
    const response = await axiosInstance.post(
      `api/EmployeeNew/UpdateEmployeeStatusWithAttachment`,
      requestBody,
      {
        headers: {
          accept: '*/*',
        },
      },
    )
    // console.log('inactive api res: ', response)
    return response.data
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
  // try {
  //   const response = await axiosInstance.post(`api/EmployeeNew/UpdateEmployeeStatus`, requestBody, {
  //     headers: {
  //       accept: '*/*',
  //     },
  //   })
  //   console.log('inactive api res: ', response)
  //   return response.data
  // } catch (error) {
  //   console.error('Error approving candidate:', error)
  //   throw error
  // }
}

export const bulkInactivateEmployees = async (formData) => {
  try {
    const response = await axiosInstance.post(
      `api/EmployeeNew/BulkInactivateEmployees`,
      formData,
      { headers: { accept: '*/*' } },
    )
    return response.data
  } catch (error) {
    console.error('Bulk inactivate error:', error)
    throw error
  }
}

export const getEmployeeById = async (id) => {
  try {
    const response = await axiosInstance.get(
      `api/EmployeeNew/GetEmployeeOrCandidateById?candidateId=${id}&isCandidate=false`,
      {
        headers: {},
      },
    )
    return response
  } catch (error) {
    console.error('Error in fetching Employee By id', error)
    throw error
  }
}

export const myregularizeRequestStatusLists = async (employeeId) => {
  try {
    const response = await axiosInstance.get(`api/EmpAttendance/GetRegularizationRequestsself`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response
  } catch (error) {
    console.error('Error fetching regularize list:', error)
    throw error
  }
}

export const mygeofenceRequestStatusLists = async (employeeId, date) => {
  let url
  date !== null && date !== undefined
    ? (url = `api/EmpAttendance/employee-attendance-requests/${employeeId}?date=${date}`)
    : (url = `api/EmpAttendance/employee-attendance-requests/${employeeId}`)

  try {
    const response = await axiosInstance.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response
  } catch (error) {
    console.error('Error fetching Geofence list:', error)
    throw error
  }
}

export const downloadPayrollExcel = async () => {
  try {
    const response = await axiosInstance.get('/api/Payroll/download-excel', {
      responseType: 'blob',
    })
    return response
  } catch (error) {
    console.error('error downloading payroll excel: ', error)
    throw error
  }
}

export const downloadPaidByBankExcel = async () => {
  try {
    const response = await axiosInstance.get('/api/url_path', {
      responseType: 'blob',
    })
    return response
  } catch (error) {
    console.error('error downloading paid by bank excel: ', error)
    throw error
  }
}

export const downloadGivenToBankExcel = async () => {
  try {
    const response = await axiosInstance.get('/api/url_path', {
      responseType: 'blob',
    })
    return response
  } catch (error) {
    console.error('error downloading given to bank excel: ', error)
    throw error
  }
}

export const resignationLists = async (m_id, pageSize, currentPage, searchText, role) => {
  const url =
    String(role || '')
      .trim()
      .toLowerCase() === 'superadmin'
      ? `api/EmployeeSeparation/GetResignedEmployee?pageNumber=${currentPage}&pageSize=${pageSize}&searchTerm=${searchText}`
      : `api/EmployeeSeparation/GetResignedEmployee?managerId=${m_id}&pageNumber=${currentPage}&pageSize=${pageSize}&searchTerm=${searchText}`

  try {
    const response = await axiosInstance.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response
  } catch (error) {
    console.error('Error fetching regularize list:', error)
    throw error
  }
}

export const resignationListsExcel = async (m_id, role) => {
  const url =
    String(role || '')
      .trim()
      .toLowerCase() === 'superadmin'
      ? `api/EmployeeSeparation/GetResignedEmployee`
      : `api/EmployeeSeparation/GetResignedEmployee?managerId=${m_id}`

  try {
    const response = await axiosInstance.get(url, {
      responseType: 'blob',
      params: { isExcel: true },
    })
    return response
  } catch (error) {
    console.error('Error fetching regularize list:', error)
    throw error
  }
}

export const insertInterviewFormData = async (requestBody) => {
  try {
    const response = await axiosInstance.post(`api/Candidate/InsertInterviewForm`, requestBody, {
      headers: {
        accept: '*/*',
      },
    })
    // console.log('inactive api res: ', response)
    return response.data
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const postResignation = async (requestBody) => {
  try {
    const response = await axiosInstance.post(`api/EmployeeSeparation`, requestBody, {
      headers: {
        accept: '*/*',
      },
    })
    // console.log('inactive api res: ', response)
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const resignationTypesList = async () => {
  try {
    const response = await axiosInstance.get(`api/DropDown/GetResignationType`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response
  } catch (error) {
    console.error('Error fetching regularize list:', error)
    throw error
  }
}

export const getApplicantByIdForInterewform = async (id) => {
  try {
    const response = await axiosInstance.get(`api/Candidate/GetApplicantById?applicantId=${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response
  } catch (error) {
    console.error('error downloading given to bank excel: ', error)
    throw error
  }
}

export const GetInterviewFormDataById = async (id) => {
  try {
    const response = await axiosInstance.get(
      `api/Candidate/GetInterviewFormDataById?applicantId=${id}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    return response
  } catch (error) {
    console.error('error downloading given to bank excel: ', error)
    throw error
  }
}

export const getReasonForLeaving = async () => {
  try {
    const response = await axiosInstance.get('/api/Dropdown/GetReasonForLeaving')
    return response
  } catch (error) {
    console.error('error fetching reason list for leaving employee: ', error)
    throw error
  }
}

export const getReporteeList = async (pageNumber, pageSize, search, id) => {
  try {
    const response = await axiosInstance.get(
      `api/EmployeeNew/employeesbymanager?managerId=${id}&pageNumber=${pageNumber}&pageSize=${pageSize}&searchTerm=${search}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    return response
  } catch (error) {
    console.error('error downloading given to bank excel: ', error)
    throw error
  }
}

export const employeeResignationApprove = async (requestBody) => {
  try {
    const response = await axiosInstance.post('api/EmployeeSeparation/action', requestBody, {
      headers: {},
    })
    return response
  } catch (error) {
    console.error('Error in Approving Candidate ', error)
    throw error
  }
}

export const getMyResignationStatus = async (id) => {
  try {
    const response = await axiosInstance.get(`api/EmployeeSeparation?empId=${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response
  } catch (error) {
    console.error('error downloading given to bank excel: ', error)
    throw error
  }
}

export const getDetailbySeprationId = async (id) => {
  try {
    const response = await axiosInstance.get(`api/EmployeeSeparation/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response
  } catch (error) {
    console.error('error downloading given to bank excel: ', error)
    throw error
  }
}

export const viewSalarySlip = async (ecode, payload) => {
  // console.log('in view salary api: ', ecode)
  try {
    const response = await axiosInstance.get(
      `api/Employee/GetSalaryDetailsByEcode_Web?ecode=${ecode}&month=${payload}`,
      {
        headers: {},
      },
    )
    return response
  } catch (error) {
    console.error('Error in Approving Candidate ', error)
    throw error
  }
}

export const uploadOfferLetter = async (formData) => {
  try {
    const response = await axiosInstance.post('api/Candidate/InsertOfferLetter', formData, {
      headers: {},
    })
    return response
  } catch (error) {
    // console.error(error?.response?.data?.message)
    const err = error?.response?.data?.message
    return error
  }
}

export const getAbscondingReasonList = async () => {
  try {
    const response = await axiosInstance.get(`api/DropDown/AbscondingReason/10`, {
      headers: {
        Accept: '*/*',
      },
    })
    return response?.data // or handle the data as needed
  } catch (error) {
    console.error('Error fetching dropdown data:', error)
    throw error // or handle error appropriately
  }
}

export const changePassword = async (requestBody) => {
  try {
    const response = await axiosInstance.post('api/Auth/ChangePassword', requestBody, {
      headers: {},
    })
    return response
  } catch (error) {
    console.error('Error in Approving Candidate ', error)
    throw error
  }
}

export const changePasswordByForForgot = async (requestBody) => {
  try {
    const response = await axiosInstance.post('api/Auth/ResetPassword', requestBody, {
      headers: {},
    })
    return response
  } catch (error) {
    console.error('Error in Approving Candidate ', error)
    throw error
  }
}

export const fetchLeaveStatusList = async (employeeId) => {
  try {
    const response = await axiosInstance.get(`/api/Leave/GetLeave/${parseInt(employeeId)}`)
    return response
  } catch (error) {
    return error
  }
}

export const forgotPassword = async (requestBody) => {
  try {
    const response = await axiosInstance.post('api/Auth/ForgotPassword', requestBody, {
      headers: {},
    })
    return response
  } catch (error) {
    console.error('Error in Approving Candidate ', error)
    throw error
  }
}

export const sendMailOfferLetter = async (employeeIds) => {
  try {
    const queryParam = Array.isArray(employeeIds)
      ? employeeIds.map((id) => encodeURIComponent(id)).join(',')
      : encodeURIComponent(employeeIds)

    const response = await axiosInstance.post(
      `api/Employee/SendOfferLetters?employeeIds=${queryParam}`,
      {}, // POST body is empty
      {
        headers: {
          'Content-Type': 'application/json', // Optional: depending on backend
        },
      },
    )
    return response
  } catch (error) {
    console.error('Error in sending offer letters:', error)
    throw error
  }
}

export const getBlacklistReasonList = async () => {
  try {
    const response = await axiosInstance.get(`api/DropDown/BlackListReason?resignationTypeId=10`, {
      headers: {
        Accept: '*/*',
      },
    })
    return response?.data // or handle the data as needed
  } catch (error) {
    console.error('Error fetching dropdown data:', error)
    throw error // or handle error appropriately
  }
}

export const fetchSalarySummery = async ({ search, currentPage, pageSize }) => {
  try {
    const new_search = String(search).trim()
    const search_to_send = new_search.length > 0 ? new_search : ''

    const response = await axiosInstance.get(
      `api/View/GetSalaryFormat?ecode=${search_to_send}&asExcel=false&page=${currentPage}&pageSize=${pageSize}`,
    )
    return response
  } catch (error) {
    console.error('Error approving candidate:', error)
    throw error
  }
}

export const exportSalarySummeryToExcel = async () => {
  try {
    const response = await axiosInstance.get(`api/View/GetSalaryFormat?asExcel=true`, {
      headers: {
        Accept: '*/*',
      },
      responseType: 'blob',
    })

    return response
  } catch (error) {
    console.error('Error exporting employee master:', error)
    throw error // rethrow if you want to handle it in calling function
  }
}

export const exportPayableDaysToExcel = async () => {
  try {
    const response = await axiosInstance.get(`/api/View/GetPaybleDays?asExcel=true`, {
      headers: {
        Accept: '*/*',
      },
      responseType: 'blob',
    })

    return response
  } catch (error) {
    console.error('Error exporting employee master:', error)
    throw error // rethrow if you want to handle it in calling function
  }
}

export const fetchStates = async () => {
  try {
    const response = axiosInstance.get(`/api/DropDown/states/${1}`)
    return response
  } catch (error) {
    console.error('Error fetching state list: ', error)
  }
}

export const fetchCities = async (stateId) => {
  try {
    const response = axiosInstance.get(`/api/DropDown/cities/${parseInt(stateId)}`)
    return response
  } catch (error) {
    console.error('Error fetching city list: ', error)
  }
}

export const getEmployeeTransferList = async (employeeId, role) => {
  // console.log('role: ', role)
  const url =
    role === 'HR'
      ? `/api/AssignLocation/GetLocationAssignments?employeeId=0&isHR=true`
      : `/api/AssignLocation/GetLocationAssignments?employeeId=${employeeId}&activeOnly=${true}&isHR=false`
  try {
    const response = await axiosInstance.get(url)
    return response
  } catch (error) {
    console.error('Error fetching city list: ', error)
  }
}

export const updateApplicantStatusById = async (payload) => {
  try {
    const response = await axiosInstance.post(`api/Candidate/UpdateApplicantStatus`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response
  } catch (error) {
    console.error('Error in fetching Candidate Data')
    throw error
  }
}

export const interViewSchedule = async (payload) => {
  try {
    const response = await axiosInstance.post(`api/Candidate/InsertInterviewSchedule`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response
  } catch (error) {
    console.error('Error in fetching Candidate Data')
    throw error
  }
}

export const uploadAnyDocument = async (formData) => {
  try {
    const response = await axiosInstance.post('api/documents/upload-any-document', formData, {
      headers: {},
    })
    return response
  } catch (error) {
    console.error(error)
    const err = error?.response?.data?.message
    return error
  }
}

export const UpdateMyProfile = async (payload) => {
  try {
    const response = await axiosInstance.post(`api/EmployeeNew/UpdateEmployeeDetails`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response
  } catch (error) {
    console.error('Error in fetching Candidate Data')
    throw error
  }
}

export const getProfileUpdateApplications = async (employeeId) => {
  try {
    const response = await axiosInstance.get(`api/EmployeeNew/GetPendingUpdateEmployees`)
    return response
  } catch (error) {
    console.error('Error fetching city list: ', error)
  }
}

export const profileUpdateDifferenceView = async (employeeId) => {
  try {
    const response = await axiosInstance.get(
      `api/EmployeeNew/GetEmployeeDetailsUpdateView?EmployeeId=${employeeId}`,
    )
    return response
  } catch (error) {
    console.error('Error fetching city list: ', error)
  }
}

export const insertScheduleInterviewData = async (payload) => {
  try {
    const response = await axiosInstance.post(`api/Candidate/InsertInterviewSchedule`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response
  } catch (error) {
    console.error('Error in fetching Candidate Data')
    throw error
  }
}

export const interviewerApprovalforApplicantInterview = async (payload) => {
  try {
    const response = await axiosInstance.post(`api/Candidate/UpdateInterviewerFeedBack`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    // console.log('response in interviewer approval: >>>>>> ', response)

    return response
  } catch (error) {
    console.error('Error in fetching Candidate Data-----> ', error)
    throw error
  }
}

export const newStoreGetList = async (month, records) => {
  console.log('records: ', records)
  const recordsInInt = Number(records)
  try {
    // const response = await axiosInstance.get(`/api/StoreLocations/GetByRecords/${records}`)
    let url

    recordsInInt > 0
      ? // ? (url = `/api/StoreLocations/GetStoresByMonth?monthYear=${month}&records=${recordsInInt}`)
        (url = `/api/StoreLocations/GetStoresByMonth?records=${recordsInInt}`)
      : (url = `/api/StoreLocations/GetStoresByMonth`)

    const response = await axiosInstance.get(url)
    return response
  } catch (error) {
    console.error('Error in fetching Store List', error)
    throw error
  }
}

export const storeRoutingList = async (locationId) => {
  try {
    const response = await axiosInstance.get(`/api/StoreRouting?locationId=${locationId}`)
    return response
  } catch (error) {
    console.error('Error in fetching Store List', error)
    throw error
  }
}

export const salaryRecalculate = async (payload) => {
  try {
    // const response = await axiosInstance.post(`api/SalaryRecalculate/recalculate`, payload, {
    const response = await axiosInstance.post(`/api/SalaryRecalculate/recalculate-new`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response
  } catch (error) {
    console.error('Error in fetching Candidate Data-----> ', error)
    throw error
  }
}

export const fetchFullandFinal = async ({ search = '', pageNumber = 1, pageSize = 100 }) => {
  try {
    const search_to_send = search.trim() || ''

    const response = await axiosInstance.get(
      `/api/Employee/GetEmployee_HoldList?pageNumber=${parseInt(pageNumber)}&pageSize=${parseInt(pageSize)}&searchTerm=${search_to_send}`,
    )

    return response
  } catch (error) {
    console.error('Error fetching Full and Final list:', error)
    throw error
  }
}

export const fetchRBACPermissions = async (roleId = null) => {
  try {
    const response = await axiosInstance.get(`/api/Auth/RBAC/permissions`)
    return response
  } catch (error) {
    console.error('Error submitting RBAC data: ', error)
    return error
  }
}

export const saveRBACPermissions = async (data) => {
  try {
    const response = await axiosInstance.post('/api/Auth/RBAC/permissions', data)
    return response
  } catch (error) {
    console.error('Error submitting RBAC data: ', error)
    return error
  }
}

export const fetchRoles = async () => {
  try {
    const response = await axiosInstance.get('/api/Auth/Roles')
    return response
  } catch (error) {
    return error
  }
}

export const getRBACHierarchy = async () => {
  try {
    const response = await axiosInstance.get('/api/RBAC/hierarchy')
    return response
  } catch (error) {
    console.error('Error fetching Full and Final list:', error)
    throw error
  }
}

export const createNewGroup = async (id, groupName) => {
  const requestBody = { id, groupName }
  console.log('request body: ', requestBody)
  // return
  try {
    const response = await axiosInstance.post('/api/Group/upsert', requestBody)
    return response
  } catch (error) {
    console.error('Error submitting group name: ', error)
  }
}

export const createEditNewGroupStore = async (id, groupId, storecode) => {
  const requestBody = { id, groupId, sT_CD: storecode }
  console.log('request body: ', requestBody)
  // return
  try {
    const response = await axiosInstance.post('/api/GroupWiseStoreCodeMapping/upsert', requestBody)
    return response
  } catch (error) {
    console.error('Error submitting group name: ', error)
  }
}

export const getGroupList = async () => {
  try {
    const response = await axiosInstance.get('/api/Group/all')
    return response
  } catch (error) {
    console.error('Error fetching data: ', error)
  }
}

export const getGroupWiseStoreCodeMapping = async (groupId) => {
  try {
    const response = await axiosInstance.get(
      `/api/GroupWiseStoreCodeMapping/GroupStores?id=${groupId}`,
    )
    return response
  } catch (error) {
    console.error('Error fetching data: ', error)
  }
}

export const getHolidayList = async () => {
  try {
    const response = await axiosInstance.get('/api/HolidayMaster/all')
    return response
  } catch (error) {
    console.error('Error fetching data: ', error)
    return error
  }
}

export const upsertHoliday = async (requestBody) => {
  try {
    const response = await axiosInstance.post('/api/HolidayMaster/upsert', requestBody)
    return response
  } catch (error) {
    return error
  }
}

export const getStoreStateLinkings = async () => {
  try {
    const response = await axiosInstance.get('/api/Uploader/GetAllStoreStateLinking')
    return response
  } catch (error) {
    return error
  }
}

export const getStatesList = async (isExcel) => {
  try {
    const response = await axiosInstance.get(
      `/api/Uploader/GetStoreWhichCanAdd?isExcel=${isExcel}`,
      {
        responseType: 'blob',
      },
    )
    return response
  } catch (error) {
    return error
  }
}

export const fetchJDs = async () => {
  try {
    const response = await axiosInstance.get('/api/JD')
    return response
  } catch (error) {
    return error
  }
}

export const upsertJDForm = async (body) => {
  try {
    const response = await axiosInstance.post('/api/JD/upsert', body)
    return response
  } catch (error) {
    return error
  }
}

export const deleteJD = async (id) => {
  try {
    const response = await axiosInstance.post(`/api/JD/delete?jdId=${id}`)
    return response
  } catch (error) {
    return error
  }
}

export const postEmpRoleMap = async (data) => {
  try {
    const response = await axiosInstance.post('/api/EmployeeRole/bulk-upsert', data)
    return response
  } catch (error) {
    return error
  }
}

export const getEmpRole = async () => {
  try {
    const response = await axiosInstance.get('/api/EmployeeRole/get-all')
    return response
  } catch (error) {
    return error
  }
}

// FNF APIS
export const fetchLeftEmployees = async (ecode = null) => {
  const url =
    ecode === null || ecode === undefined || String(ecode).trim() === ''
      ? '/api/Fnf/FetchEmployeesForFNF'
      : `/api/Fnf/FetchEmployeesForFNF?ecode=${ecode}`
  try {
    const response = await axiosInstance.get(url)
    return response
  } catch (error) {
    return error
  }
}

export const submitFNFAddDed = async (requestBody) => {
  try {
    const response = await axiosInstance.post('/api/Fnf/save', requestBody)
    return response
  } catch (error) {
    return error
  }
}

export const calculateBonus = async (requestBody) => {
  try {
    const response = await axiosInstance.post('/api/Fnf/bonus', requestBody)
    return response
  } catch (error) {
    return error
  }
}

export const calculateEL = async (requestBody) => {
  try {
    const response = await axiosInstance.post('/api/Fnf/leave-encashment', requestBody)
    return response
  } catch (error) {
    return error
  }
}

export const fnfDoneList = async ({ page = 1, pageSize = 10, search }) => {
  const new_search = search === undefined || search === null || search?.trim() === '' ? false : true

  const url = new_search
    ? `/api/Fnf/FNFDoneList?page=${page}&pageSize=${pageSize}&search=${search}`
    : `/api/Fnf/FNFDoneList?page=${page}&pageSize=${pageSize}`

  try {
    const response = await axiosInstance.get(url)
    return response
  } catch (error) {
    return error
  }
}

export const fnfProcessedList = async ({ page = 1, pageSize = 10, search }) => {
  const new_search = search === undefined || search === null || search?.trim() === '' ? false : true

  const url = new_search
    ? `/api/Fnf/FNFProcessedList?page=${page}&pageSize=${pageSize}&search=${search}`
    : `/api/Fnf/FNFProcessedList?page=${page}&pageSize=${pageSize}`

  try {
    const response = await axiosInstance.get(url)
    return response
  } catch (error) {
    return error
  }
}

export const getGratuity = async (empId) => {
  try {
    const response = await axiosInstance.get(`/api/Fnf/gratuity?employeeId=${Number(empId)}`)
    return response
  } catch (error) {
    return error
  }
}

export const reopenApplicant = (payload) => {
  return axiosInstance.post('api/Applicant/reopen', payload)
}

export const getAllMappings = async () => {
  try {
    const response = await axiosInstance.get('/api/EmployeeStoreVisibilityMapping/GetAllMappings')
    return response
  } catch (error) {
    return error
  }
}

export const upsertMappings = async (requestBody) => {
  try {
    const response = await axiosInstance.post(
      '/api/EmployeeStoreVisibilityMapping/UpsertMappings',
      requestBody,
    )

    return response
  } catch (error) {
    return error
  }
}

export const empStoreList = async (ecode) => {
  try {
    const response = await axiosInstance.get(
      `/api/EmployeeStoreVisibilityMapping/GetStoreState?eCode=${ecode}`,
    )
    return response
  } catch (error) {
    return error
  }
}

export const getDeptState = async ({ eCode, stCode }) => {
  try {
    const response = await axiosInstance.get(
      `/api/EmployeeStoreVisibilityMapping/GetDeptState?eCode=${eCode}&stCode=${stCode}`,
    )

    return response
  } catch (error) {
    return error
  }
}

export const upsertDeptState = async (payload) => {
  try {
    const response = await axiosInstance.post(
      '/api/EmployeeStoreVisibilityMapping/SetDeptExceptionsForStore',
      payload,
    )

    return response
  } catch (error) {
    return error
  }
}

export const getDesigState = async ({ eCode, stCode, deptId }) => {
  try {
    const response = await axiosInstance.get(
      `/api/EmployeeStoreVisibilityMapping/GetDesigState?eCode=${eCode}&stCode=${stCode}&deptId=${deptId}`,
    )
    return response
  } catch (error) {
    return error
  }
}

export const setDesigExceptionsForStoreDept = async (payload) => {
  try {
    const response = await axiosInstance.post(
      '/api/EmployeeStoreVisibilityMapping/SetDesigExceptionsForStoreDept',
      payload,
    )
    return response
  } catch (error) {
    return error
  }
}

export const filterBgtSeatMaster = async ({ eCode, stCode, deptId }) => {
  try {
    const paramsObj = {
      eCode,
      // , stCode, deptId
    }

    const response = await axiosInstance.get(
      `/api/EmployeeStoreVisibilityMapping/GetPermissionIndexForECode?eCode=${eCode}`,
    )
    return response
  } catch (error) {
    return error
  }
}

//Incentives
export const searchEmployees = async ({ searchTerm }) => {
  const token = localStorage.getItem('token')
  const { data } = await axiosInstance.get('/api/employee/searchemployee', {
    params: { searchTerm },
    headers: { Authorization: `Bearer ${token}` },
  })
  // Expected to return { records: [...] , totalRecords?: number }
  return data
}

export const createIncentive = async (formData) => {
  const token = localStorage.getItem('token')
  const { data } = await axiosInstance.post('/api/incentives/upsert', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export const listIncentives = async (params) =>
  axiosInstance
    .get('/api/incentives/list', {
      params,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    .then((r) => r.data)

export const getIncentive = async (id) =>
  axiosInstance
    .get(`/api/incentives/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    .then((r) => r.data)

export const submitIncentive = async (id) =>
  axiosInstance
    .post(`/api/incentives/${id}/submit`, null, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    .then((r) => r.data)

// export const cmdDecision = async (id, payload) =>
//   axiosInstance
//     .post(`/api/incentives/${id}/cmd-decision`, payload, {
//       headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//     })
//     .then((r) => r.data)

// export const hrDecision = async (id, payload) =>
//   axiosInstance
//     .post(`/api/incentives/${id}/hr-decision`, payload, {
//       headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//     })
//     .then((r) => r.data)

export const uploadIncentivesBulk = async (formData) => {
  const token = localStorage.getItem('token')
  const { data } = await axiosInstance.post('/api/incentives/bulk-upload', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

// export const fetchGeoFencingData = async () => {
//   try {
//     // const response = await axiosInstance.get('api/JobOpening')
//     const response = await axiosInstance2.get('api/Location/GetLocationDataWithGeo')
//     return response.data
//   } catch (error) {
//     console.error('Error approving candidate:', error)
//     throw error
//   }
// }

// export const postGeoFencingdata = async (payload) => {
//   try {
//     const response = await axiosInstance2.post('api/Location/UpdateLocationGeo', payload, {
//       headers: {},
//     })
//     return response
//   } catch (error) {
//     console.error('Error geofencing Data:', error)
//     // Handle error as needed
//     throw error
//   }
// }

export const deleteLocation = async ({ locationId }) => {
  try {
    const response = await axiosInstance.get(`/api/Location/Delete/${locationId}`)
    return response
  } catch (error) {
    return error
  }
}

export const toggleLocation = async ({ locationId }) => {
  try {
    const response = await axiosInstance.get(`/api/Location/ToggleStatus/${locationId}`)
    return response
  } catch (error) {
    return error
  }
}

export const getDesignationByDepartment = async (deptId) => {
  const formatDeptId =
    deptId === null || deptId === undefined || String(deptId).trim() === '' ? 0 : deptId
  try {
    const response = await axiosInstance.get(
      `/api/Dropdown/GetDesignationsByDepartment?deptId=${Number(formatDeptId)}`,
    )
    return response
  } catch (error) {
    throw error
  }
}

export const deleteDocument = async (requestBody) => {
  try {
    const response = await axiosInstance.post('/api/Candidate/candidate-doc/delete', requestBody)
    return response
  } catch (error) {
    return error
  }
}

export const fetchEmpFinalData = async () => {
  try {
    const response = await axiosInstance.get('/api/EmpAttendance/attendance-snapshot')
    return response
  } catch (error) {
    return error
  }
}

export const fetchPFMasterData = async ({ currentPage, pageSize, searchQuery }) => {
  try {
    const response = await axiosInstance.get(
      `/api/PFMaster?page=${currentPage}&pageSize=${pageSize}&searchTerm=${searchQuery}`,
    )
    return response
  } catch (error) {
    return error
  }
}

export const fetchAttendanceViewSnapshot = async (month, batchId) => {
  const url =
    batchId !== undefined && batchId !== null && typeof batchId === 'string'
      ? `/api/EmpAttendanceViewSnapshot/get-snapshots?month=${month}&batch=${batchId}`
      : `/api/EmpAttendanceViewSnapshot/get-snapshots?month=${month}`

  try {
    const response = await axiosInstance.get(url)
    return response
  } catch (error) {
    return error
  }
}

export const fetchSalaryStatusList = async (statusId, month) => {
  try {
    const response = await axiosInstance.get(
      `/api/EmpAttendanceViewSnapshot/get-salary-status-list?status=${statusId}&month=${month}`,
    )
    return response
  } catch (error) {
    return error
  }
}

export const updateGivenToBankorPaidByCash = async (payload) => {
  try {
    const response = await axiosInstance.post(
      '/api/EmpAttendanceViewSnapshot/salary-process-to-given-to-bank-or-paid-by-cash',
      payload,
    )

    return response
  } catch (error) {
    return error
  }
}

export const updatePaidByBankorReturnByBank = async (payload) => {
  try {
    const response = await axiosInstance.post(
      '/api/EmpAttendanceViewSnapshot/given-to-bank-to-paid-by-bank-or-return-from-bank',
      payload,
    )

    return response
  } catch (error) {
    return error
  }
}

export const getLocationNameWithCode = async () => {
  try {
    const response = await axiosInstance.get('/api/DropDown/GetStoreLocation')
    return response
  } catch (error) {
    return error
  }
}

export const fetchEligibleEmpForSalaryProcess = async (stCode, month) => {
  try {
    const response = await axiosInstance.get(
      `/api/EmpAttendanceViewSnapshot/eligible-employees?stCode=${stCode}&month=${month}`,
    )
    return response
  } catch (error) {
    return error
  }
}

export const validateMinwage = async (payload) => {
  try {
    const response = await axiosInstance.post('/api/MinWage/validate', payload)
    return response
  } catch (error) {
    throw error
  }
}

export const fetchMinWages = async () => {
  try {
    const response = await axiosInstance.get('/api/MinWage/states')
    return response
  } catch (error) {
    throw error
  }
}

export const submitNewMinWage = async (payload) => {
  try {
    const response = await axiosInstance.post('/api/MinWage/update', payload)
    return response
  } catch (error) {
    throw error
  }
}

export const getEmployeeChangeLog = async (empCode) => {
  try {
    const response = await axiosInstance.get(
      `/api/EmployeeChangeLog/GetEmployeeChangeLog?ecode=${empCode}`,
    )
    return response
  } catch (error) {
    throw error
  }
}

export const getDesignations = async () => {
  try {
    const response = await axiosInstance.get('/api/Dropdown/GetDesignation')
    return response
  } catch (error) {
    throw error
  }
}

export const resetEmployeePsd = async (payload) => {
  try {
    const response = await axiosInstance.post('/api/Auth/AdminResetPassword', payload)
    return response
  } catch (error) {
    throw error
  }
}

export const GetAllShifts = async () => {
  try {
    const response = await axiosInstance.get('/api/ShiftMaster/GetAll')
    return response
  } catch (error) {
    throw error
  }
}

export const createShift = async (payload) => {
  try {
    const response = await axiosInstance.post('/api/ShiftMaster/Create', payload)
    return response
  } catch (error) {
    throw error
  }
}

export const updateShift = async (payload, shiftId) => {
  try {
    const response = await axiosInstance.put(`/api/ShiftMaster/Update/${shiftId}`, payload)
    return response
  } catch (error) {
    throw error
  }
}

export const deleteShift = async (shiftID) => {
  try {
    const response = axiosInstance.delete(`/api/ShiftMaster/Delete/${shiftID}`)
    return response
  } catch (error) {
    throw error
  }
}

export const toggleShift = async (shiftID) => {
  try {
    const response = axiosInstance.get(`/api/ShiftMaster/ToggleStatus/${shiftID}`)
    return response
  } catch (error) {
    throw error
  }
}

export const bulkAssignShift = async (formData) => {
  try {
    const response = await axiosInstance.post('/api/ShiftMap/assign-shift-bulk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response
  } catch (error) {
    throw error
  }
}

export const getEmployeeMultiPunchesChangeLog = (ecode, month) => {
  return axiosInstance.get('/api/EmployeeMultiPunchesChangeLog/GetEmployeeMultiPunchesChangeLog', {
    params: {
      ecode,
      month,
    },
  })
}

export const getContractorByCode = async (contractorCode) => {
  try {
    const response = await axiosInstance.get('/api/Vendor/GetContractorByCode', {
      params: {
        contractorCode,
      },
    })
    return response
  } catch (error) {
    throw error
  }
}

export const exportApplicantDataByStatus = async (statusId = 0) => {
  try {
    const response = await axiosInstance.get(
      `/api/Applicant/ExportToExcelApplicant?StatusId=${statusId}`,
      { responseType: 'blob' },
    )
    return response
  } catch (error) {
    throw error
  }
}

export const submitPFChallan = async (payload) => {
  try {
    const response = await axiosInstance.post('/api/Payroll/upsertPFApproval', payload)
    return response
  } catch (error) {
    throw error
  }
}

export const fetchLocationBasedEmployees = async (payload) => {
  try {
    const response = await axiosInstance.post(`/api/Location/GetActiveEmployeesByLocation`, payload)
    return response
  } catch (error) {
    throw error
  }
}

export const checkLeaveLockStatus = async () => {
  try {
    const response = await axiosInstance.get('/api/LeaveLock/CheckLeaveLockStatus')
    return response
  } catch (error) {
    throw error
  }
}

export const fetchFNFEmployeeDetails = async (ecode) => {
  try {
    const response = await axiosInstance.get(`/api/FnfDetails/GetFnfDetailsByEcode/${ecode}`)
    return response
  } catch (error) {
    throw error
  }
}

export const getEmployeeShiftHistory = async (employeeId) => {
  try {
    const response = await axiosInstance.get(`/api/ShiftMap/employee-shift-history`, {
      params: { employeeId },
    })
    return response
  } catch (error) {
    throw error
  }
}

export const assignShift = async (payload) => {
  try {
    const response = await axiosInstance.post('/api/ShiftMap/assign-shift', payload)
    return response
  } catch (error) {
    throw error
  }
}

export const getChecklistItems = async (ecode) => {
  try {
    const response = await axiosInstance.get(
      `api/Employee/GetEmployeeResignationChecklistByECode?ECode=${ecode}`,
    )
    return response
  } catch (error) {
    throw error
  }
}

export const uploadPayrollWithChallan = async (monthYear, payload) => {
  try {
    const response = await axiosInstance.post('/api/Uploader/UploadPayrollWithChallan', payload, {
      params: { monthYear },
    })
    return response
  } catch (error) {
    throw error
  }
}

export const getDepartments = async () => {
  try {
    const response = await axiosInstance.get('/api/DropDown/GetDepartment')
    return response
  } catch (error) {
    throw error
  }
}

export const getAllVendors = async (page, pageSize, startDate, endDate, search) => {
  try {
    const response = await axiosInstance.get('/api/Vendor/GetAll', {
      params: {
        pageNumber: page,
        pageSize,
        contractStartDate: startDate,
        contractEndDate: endDate,
        searchTerm: search,
      },
    })
    return response
  } catch (error) {
    throw error
  }
}

// export const getContractorsList = async ({
//   contractorCode,
//   contractorName,
//   searchTerm,
//   pageNumber = 1,
//   pageSize = 10,
// } = {}) => {
//   try {
//     const response = await axiosInstance.get('/api/Vendor/GetContractors', {
//       params: { contractorCode, contractorName, searchTerm, pageNumber, pageSize },
//     })
//     return response
//   } catch (error) {
//     throw error
//   }
// }

// Services.js
export const getContractorsList = async (searchTerm, pageNumber, pageSize) => {
  return axiosInstance.get('/api/Vendor/GetContractors', {
    params: { searchTerm, pageNumber, pageSize },
  })
}

export const getVendorById = async (vendorId) => {
  try {
    const response = await axiosInstance.get('/api/Vendor/GetById', {
      params: {
        id: vendorId,
      },
    })
    return response
  } catch (error) {
    throw error
  }
}

export const getResourceListByVendorCode = async (vendorCode, search, mode, page, pageSize) => {
  const isModeAvailable = mode !== undefined && mode !== null

  try {
    const response = await axiosInstance.get('/api/Vendor/GetVendorEmployees', {
      params: {
        contractorCode: vendorCode,
        searchTerm: search,
        isActiveFilter: mode,
        pageNumber: page,
        pageSize,
      },
    })

    return response
  } catch (error) {
    throw error
  }
}

export const submitVendorResource = async (payload) => {
  try {
    const response = await axiosInstance.post('/api/Vendor/InsertVendorEmployee', payload)
    return response
  } catch (error) {
    throw error
  }
}

export const updateVendorResource = async (payload, vendorCode, employeeCode) => {
  try {
    const response = await axiosInstance.post('/api/Vendor/UpdateVendorEmployee', payload, {
      params: {
        ecode: employeeCode,
        contractorCode: vendorCode,
      },
    })
    return response
  } catch (error) {
    throw error
  }
}

export const getNatureOfWorkList = async () => {
  try {
    const response = await axiosInstance.get('/api/Vendor/GetNatureOfWorkList')
    return response
  } catch (error) {
    throw error
  }
}

export const getResourceDetailsByVCodeEcode = async (vendorCode, employeeCode) => {
  try {
    const response = await axiosInstance.get('/api/Vendor/GetEmployeesByEcode', {
      params: {
        ecode: employeeCode,
        contractorCode: vendorCode,
      },
    })

    return response
  } catch (error) {
    throw error
  }
}

export const getRetentionData = async ({ pageNumber, pageSize, searchTerm, isExcel = false }) => {
  try {
    const response = await axiosInstance.get('/api/Uploader/GetRetention', {
      responseType: isExcel ? 'blob' : 'json',
      params: { pageNumber, pageSize, searchTerm, isExcel },
    })

    return response
  } catch (error) {
    throw error
  }
}

export const getLastMonthSalaryList = async ({ page, pageSize, searchTerm }) => {
  try {
    const response = await axiosInstance.get('/api/Payroll/process-salary-list', {
      params: { page, pageSize, searchTerm },
    })

    return response
  } catch (error) {
    throw error
  }
}

export const exportProcessedSalary = async (searchTerm) => {
  try {
    const response = await axiosInstance.get('/api/Payroll/ExportProcessedSalary', {
      responseType: 'blob',
      params: { searchTerm },
    })
    return response
  } catch (error) {
    throw error
  }
}

export const getAllLocations = async () => {
  try {
    const response = await axiosInstance.get('/api/DropDown/GetLocation')
    return response
  } catch (error) {
    throw error
  }
}

export const getWeeklyOffByMonthYear = async ({ pageNumber, pageSize, searchTerm, monthYear }) => {
  try {
    const response = await axiosInstance.get('/api/HolidayMaster/GetPolicyDesignationByMonthYear', {
      params: { pageNumber, pageSize, searchTerm, monthYear },
    })
    return response
  } catch (error) {
    throw error
  }
}

export const upsertPolicyDesignation = async (payload) => {
  try {
    const response = await axiosInstance.post('/api/HolidayMaster/UpsertPolicyDesignation', payload)
    return response
  } catch (error) {
    throw error
  }
}

export const toggleActive = async (payload) => {
  try {
    const response = await axiosInstance.put('/api/HolidayMaster/ToggleActive', payload)
    return response
  } catch (error) {
    throw error
  }
}

export const getOcrKey = async () => {
  try {
    const response = await axiosInstance.get('/api/OCRKey/GetOCRMaster')
    return response
  } catch (error) {
    throw error
  }
}

export const getLocDesgPolicyCat = async () => {
  try {
    const response = await axiosInstance.get('/api/DropDown/GetLocationDesignationPolicyCategory')
    return response
  } catch (error) {
    throw error
  }
}

export const checkECodeExists = async (payload) => {
  try {
    const response = await axiosInstance.post('/api/Employee/CheckEcodeExists', payload)
    return response
  } catch (error) {
    throw error
  }
}

// ===== Department master =====
export const getAllDepartments = async ({ onlyInactive = false, searchTerm = '' } = {}) => {
  try {
    const response = await axiosInstance.get('/api/Department/All', {
      params: { onlyInactive, searchTerm: searchTerm || undefined },
    })
    return response
  } catch (error) {
    throw error
  }
}

export const upsertDepartment = async (payload) => {
  try {
    const response = await axiosInstance.post('/api/Department/Upsert', payload)
    return response
  } catch (error) {
    throw error
  }
}

export const toggleDepartmentActive = async (payload) => {
  try {
    const response = await axiosInstance.put('/api/Department/ToggleActive', payload)
    return response
  } catch (error) {
    throw error
  }
}

export const uploadDepartmentsExcel = async (file) => {
  const form = new FormData()
  form.append('file', file)
  try {
    const response = await axiosInstance.post('/api/Department/Upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response
  } catch (error) {
    throw error
  }
}

// ===== Sub-Department master (3-level hierarchy under a department) =====
// Children at one level under one parent (department for L1, sub-dept for L2/L3).
export const getSubDepartments = async ({
  departmentId,
  parentSubDepartmentId = null,
  depthLevel = 1,
  onlyInactive = false,
  searchTerm = '',
} = {}) => {
  try {
    const response = await axiosInstance.get('/api/SubDepartment/All', {
      params: {
        departmentId,
        parentSubDepartmentId: parentSubDepartmentId ?? undefined,
        depthLevel,
        onlyInactive,
        searchTerm: searchTerm || undefined,
      },
    })
    return response
  } catch (error) {
    throw error
  }
}

export const upsertSubDepartment = async (payload) => {
  try {
    const response = await axiosInstance.post('/api/SubDepartment/Upsert', payload)
    return response
  } catch (error) {
    throw error
  }
}

export const toggleSubDepartmentActive = async (payload) => {
  try {
    const response = await axiosInstance.put('/api/SubDepartment/ToggleActive', payload)
    return response
  } catch (error) {
    throw error
  }
}

export const uploadSubDepartmentsExcel = async (file) => {
  const form = new FormData()
  form.append('file', file)
  try {
    const response = await axiosInstance.post('/api/SubDepartment/Upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response
  } catch (error) {
    throw error
  }
}

// ===== Designation master =====
export const getAllDesignations = async ({ onlyInactive = false, searchTerm = '' } = {}) => {
  try {
    const response = await axiosInstance.get('/api/Designation/All', {
      params: { onlyInactive, searchTerm: searchTerm || undefined },
    })
    return response
  } catch (error) {
    throw error
  }
}

export const upsertDesignation = async (payload) => {
  try {
    const response = await axiosInstance.post('/api/Designation/Upsert', payload)
    return response
  } catch (error) {
    throw error
  }
}

export const toggleDesignationActive = async (payload) => {
  try {
    const response = await axiosInstance.put('/api/Designation/ToggleActive', payload)
    return response
  } catch (error) {
    throw error
  }
}

export const uploadDesignationsExcel = async (file) => {
  const form = new FormData()
  form.append('file', file)
  try {
    const response = await axiosInstance.post('/api/Designation/Upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response
  } catch (error) {
    throw error
  }
}
