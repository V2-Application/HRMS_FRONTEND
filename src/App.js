import React, { Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch, Provider } from 'react-redux'
import { message, Spin } from 'antd'
import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
// import CandidateForm from './employees/EmployeeProfile'
import ApplicantList from './components/applicant/ApplicantList'
import { fetchDropDown } from './redux/dataSlice'
import { set } from './redux/uiSlice'
import { logoutUser } from './redux/authSlice'
const IdleLogoutHandler = React.lazy(() => import('./components/modals/IdleLogoutHandler '))
const InterviewForm = React.lazy(() => import('./components/form/InterviewForm '))
const ApplicantForm = React.lazy(() => import('./components/applicant/AddApplicant'))
const CandidateForm = React.lazy(() => import('./employees/EmployeeProfile'))

// Lazy-loaded components
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const AdminLayout = React.lazy(() => import('./layout/AdminLayout'))
const EmployeeProfile = React.lazy(() => import('./employees/EmployeeProfile'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const RegisterCandidate = React.lazy(() => import('./employees/RegisterCandidate'))
const ApplicationForm = React.lazy(() => import('./employees/ApplicationForm'))
// const OuterApplicantForm = React.lazy(() => import('../components/applicant/AddApplicant'))
const OuterApplicantForm = React.lazy(() => import('./components/applicant/AddApplicant'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const ForgotPassword = React.lazy(() => import('./views/pages/forgot_password/ForgotPassword'))
const ChangePassword = React.lazy(() => import('./views/pages/forgot_password/ChangePassword'))
const TableList = React.lazy(() => import('./components/shared/UploaderModule/SamplePage'))
import UI from './UI'
import OuterCandidateForm from './employees/OuterCandidateForm'
import EmployeeAddNew from './employees/CandidateAdd_New'

const App = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state?.ui.theme)
  const dispatch = useDispatch()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { loading } = useSelector((state) => state.ui)
  const [userdata, setuserdata] = useState({ firstName: '', role: '' })

  window.addEventListener('error', (event) => {
    if (event?.message?.includes('Failed to fetch dynamically imported module')) {
      window.location.reload()
    }
  })

  window.addEventListener('unhandledrejection', (event) => {
    if (event?.message?.includes('Failed to fetch dynamically imported module')) {
      window.location.reload()
    }
  })

  useEffect(() => {
    const templateTheme = localStorage.getItem('coreui-free-react-admin-template-theme')
    if (templateTheme) {
      dispatch(set({ theme: templateTheme }))
    }
    const data = localStorage.getItem('data')
    if (data) {
      setIsAuthenticated(true)
      const localdata = JSON.parse(data)
      setuserdata(localdata)
    } else {
      setIsAuthenticated(false)
    }

    dispatch(fetchDropDown('department,designation,location'))
  }, [])

  return (
    <>
      {contextHolder}
      <Spin spinning={loading}>
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="pt-3 text-center">
                <CSpinner color="primary" variant="grow" />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/upload-list" element={<TableList />} />
              <Route path="/ui" element={<UI />} />
              <Route
                path="/login"
                element={
                  <Login
                    loading={loading}
                    setuserdata={setuserdata}
                    setIsAuthenticated={setIsAuthenticated}
                  />
                }
              />
              <Route path="/recover_password" element={<ForgotPassword />} />
              <Route path="/change_password/:id" element={<ChangePassword />} />
              <Route path="/register" element={<ApplicationForm />} />
              <Route path="/employee-form" element={<EmployeeProfile />} />
              <Route path="/test" element={<ApplicantList />} />
              <Route path="/404" element={<Page404 />} />
              <Route path="/500" element={<Page500 />} />
              <Route path="/candidate-form" element={<OuterCandidateForm />} />
              <Route path="/interview-form" element={<InterviewForm />} />
              <Route path="/interview-form/:id" element={<InterviewForm />} />
              <Route path="/applicant-form" element={<ApplicantForm />} />
              <Route path="/appform" element={<OuterApplicantForm />} />
              <Route path="/appform/:designationId" element={<OuterApplicantForm />} />
              <Route path="/appform/:designationId/:departmentId" element={<OuterApplicantForm />} />
              {/* <Route path="/candidateform" element={<OuterCandidateForm />} /> */}
              <Route path="/candidate/add_new" element={<EmployeeAddNew />} />

              <Route
                path="/*"
                element={
                  isAuthenticated ? (
                    <DefaultLayout menus={[]} userdata={userdata} auth={setIsAuthenticated} />
                  ) : (
                    <Login setuserdata={setuserdata} setIsAuthenticated={setIsAuthenticated} />
                  )
                }
              />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </Spin>
    </>
  )
}

export default App
