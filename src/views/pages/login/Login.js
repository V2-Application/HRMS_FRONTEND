import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CFormCheck,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilLockUnlocked } from '@coreui/icons'
import { Image, message, Tooltip } from 'antd'
import logo_new_bada from '../../../assets/images/V2-Logo-1.png'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, setFilteredSideMenu, setPermissions } from '../../../redux/authSlice'
import { set } from '../../../redux/uiSlice'
import { buildMenuFromPermissions, fullMenuList } from '../../../_nav'

// custom hook to evaluate a media query
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const media = window.matchMedia(query)
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

const Login = (props) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { loading } = useSelector((state) => state.ui)

  // responsive breakpoints
  const isWide = useMediaQuery('(min-width: 768px)')
  const isSmallMobile = useMediaQuery('(max-width: 400px)')

  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    const savedUsername = localStorage.getItem('username')
    const savedPassword = localStorage.getItem('password')
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true'

    if (savedRememberMe) {
      setUsername(savedUsername || '')
      setPassword(savedPassword || '')
      setRememberMe(savedRememberMe)
    }
  }, [])

  const handleLogin = async () => {
    await dispatch(set({ loading: true }))

    if (rememberMe) {
      localStorage.setItem('username', username)
      localStorage.setItem('password', password)
      localStorage.setItem('rememberMe', true)
    } else {
      localStorage.removeItem('username')
      localStorage.removeItem('password')
      localStorage.setItem('rememberMe', false)
    }

    try {
      const red_res = await dispatch(loginUser({ username, password }))
      // console.log('red_res: ', red_res)

      const permissions = red_res?.payload?.data?.permissions || []
      console.log('permissions: ', permissions)
      console.log('permissions type:', typeof permissions)
      console.log('permissions length:', permissions.length)
      console.log('permissions[0]:', permissions[0])

      // Build filtered menu from permissions
      const filteredSideList = buildMenuFromPermissions(fullMenuList, permissions)
      // console.log('filteredSideList: ', filteredSideList)
      // console.log('filteredSideList length:', filteredSideList.length)

      // Dispatch the filtered menu to Redux state
      dispatch(setFilteredSideMenu(filteredSideList))
      // console.log('Dispatched setFilteredSideMenu with:', filteredSideList)

      // Dispatch permissions to Redux state
      dispatch(setPermissions(permissions))
      // console.log('Dispatched setPermissions with:', permissions)

      if (loginUser.fulfilled.match(red_res)) {
        const userData = red_res.payload?.data
        // console.log('userData', userData)
        // return

        // if (userData?.role === 'Applicant') {
        //   navigate(`/applicant/add_new/${userData?.employeeId}`)
        // } else {
        //   // userData?.hasReports === true
        //   //   ? navigate('/emp-attandance-list')
        //   navigate('/attandance/track')
        // }

        if (userData?.role === 'Applicant') {
  navigate(`/applicant/add_new/${userData?.employeeId}`)
} else if (userData?.role === 'NapsHR') {
  // 👇 New condition for NapsHR
  navigate('/candidate/form_list')
} else {
  // Default navigation for other roles
  // userData?.hasReports === true
  //   ? navigate('/emp-attandance-list')
  navigate('/attandance/track')
}


        props.setIsAuthenticated(true)
        message.success(red_res?.payload?.message)
      } else if (loginUser.rejected.match(red_res)) {
        const errorMessage = red_res.payload || red_res.error?.message || 'Login failed'
        message.error(errorMessage)
      }
    } catch (error) {
      console.error('Login error:', error)
      message.error('An error occurred during login')
    }

    await dispatch(set({ loading: false }))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && username && password) {
      handleLogin()
    }
  }

  return (
    <div
      className="bg-body-tertiary d-flex flex-row align-items-center"
      style={{ minHeight: '125vh' }}
    >
      <CContainer>
        <CRow className="justify-content-center">
          <CCol sm={12} xl={isWide ? 8 : 12}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={(e) => e.preventDefault()}>
                    <div className="d-flex align-items-end mb-4">
                      <Image
                        src={logo_new_bada}
                        width={150}
                        style={{ backgroundColor: '#fff', borderRadius: 5, paddingBottom: 2 }}
                        preview={false}
                      />
                    </div>
                    <p className="text-body-secondary mb-3">Sign In to your account</p>

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Username"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-4">
                      <CInputGroupText onClick={() => setShowPassword(!showPassword)}>
                        <CIcon icon={showPassword ? cilLockUnlocked : cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                      />
                    </CInputGroup>

                    <CRow className="mb-3">
                      <CCol xs={isSmallMobile ? 12 : 6} className="d-flex align-items-center">
                        <CFormCheck
                          type="checkbox"
                          id="rememberMe"
                          label="Remember me"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          disabled={loading}
                        />
                      </CCol>
                      <CCol xs={6} className="text-end">
                        {!isSmallMobile && (
                          <Link to="/recover_password" className="text-decoration-none">
                            Forgot password?
                          </Link>
                        )}
                      </CCol>
                    </CRow>

                    <div className="d-flex justify-content-between align-items-center gap-2 mb-4">
                      <CButton
                        color="primary"
                        className={`w-100 ${isSmallMobile} ? 'w-100 btn-small' : 'px-4'`}
                        onClick={handleLogin}
                        disabled={loading}
                        style={isSmallMobile ? { flex: 1 } : null}
                      >
                        {loading ? 'Logging in...' : 'Login'}
                      </CButton>
                      {isSmallMobile && (
                        <Link
                          to="/recover_password"
                          className="text-decoration-none"
                          style={{ flex: 1, fontSize: '0.8rem' }}
                        >
                          Forgot password?
                        </Link>
                      )}
                    </div>

                    {!isWide && (
                      <div
                        className="d-flex flex-column align-items-center"
                        style={{ borderTop: '1px solid #dfdfdf', paddingTop: 15 }}
                      >
                        <p className="mb-2">New here?</p>
                        <div className="d-flex flex-column gap-2 w-100 justify-content-start">
                          <Link to="/register" className="w-100">
                            <CButton color="primary" className="w-100" disabled={loading}>
                              Job Openings
                            </CButton>
                          </Link>
                          <Link to="/appform" className="w-100">
                            <CButton color="primary" className="w-100" disabled={loading}>
                              Register Applicant
                            </CButton>
                          </Link>

                          <Link to="/candidate-registration" className="w-100">
                            <CButton color="primary" className="w-100" disabled={loading}>
                              V2 Pathshala Registration
                            </CButton>
                          </Link>

                          <Link to="/candidate-form" className="w-100">
                            <CButton color="primary" className="w-100" disabled={loading}>
                              Candidate Form
                            </CButton>
                          </Link>

                          <Link to="/interview-form" className="w-100">
                            <CButton color="primary" className="w-100" disabled={loading}>
                              Interview Form
                            </CButton>
                          </Link>
                        </div>
                      </div>
                    )}
                  </CForm>
                </CCardBody>
              </CCard>

              {isWide && (
                <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                  <CCardBody className="text-center">
                    <h2>Sign up</h2>
                    <p>
                      Welcome to HRMS – Secure Employee Login. Please enter your credentials to
                      access your account and manage your workplace activities efficiently.
                    </p>
                    <div className="d-flex align-items-center justify-content-center mt-3 gap-2">
                      <Link to="/register">
                        <Tooltip title="Job Openings">
                          <CButton color="primary" disabled={loading}>
                            <i class="fas fa-briefcase"></i>
                          </CButton>
                        </Tooltip>
                      </Link>
                      <Link to="/appform">
                        <Tooltip title="Register Applicant">
                          <CButton color="primary" disabled={loading}>
                            <i className="fas fa-user-plus fa-lg" />
                          </CButton>
                        </Tooltip>
                      </Link>
                      <Link to="/candidate-registration">
                        <Tooltip title="V2 Pathshala Registration">
                          <CButton color="primary" disabled={loading}>
                            <i className="fas fa-graduation-cap fa-lg" />
                          </CButton>
                        </Tooltip>
                      </Link>
                      <Link to="/candidate-form">
                        <Tooltip title="Candidate Form">
                          <CButton color="primary" disabled={loading}>
                            <i className="fas fa-file-alt fa-lg" />
                          </CButton>
                        </Tooltip>
                      </Link>
                      <Link to="/interview-form">
                        <Tooltip title="Interview Form">
                          <CButton color="primary" disabled={loading}>
                            <i className="fas fa-user-check fa-lg" />
                          </CButton>
                        </Tooltip>
                      </Link>
                    </div>
                  </CCardBody>
                </CCard>
              )}
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login

// import React, { useState, useEffect } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import {
//   CButton,
//   CCard,
//   CCardBody,
//   CCardGroup,
//   CCol,
//   CContainer,
//   CForm,
//   CFormInput,
//   CInputGroup,
//   CInputGroupText,
//   CRow,
//   CFormCheck,
// } from '@coreui/react'
// import CIcon from '@coreui/icons-react'
// import { cilLockLocked, cilUser, cilLockUnlocked } from '@coreui/icons'
// import { Image, message, Radio, Tooltip } from 'antd'
// import logo from '../../../assets/images/v2logo.jpg'
// import logo_new_bada from '../../../assets/images/V2-Logo-1.png'
// import logo_new_bada_new from '../../../assets/images/V2-Logo-2.png'
// import { useDispatch, useSelector } from 'react-redux'
// import { loginUser } from '../../../redux/authSlice'
// import { set } from '../../../redux/uiSlice'
// import { useMediaQuery } from 'react-responsive'

// const Login = (props) => {
//   // console.log('props', props) V23375 V2@123
//   const [username, setUsername] = useState('')
//   const [password, setPassword] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [rememberMe, setRememberMe] = useState(false)
//   // const [loading, setloading] = useState(false)
//   const { loading } = useSelector((state) => state.ui)

//   // determine if viewport is at least 768px wide
//   // const isWide = useMediaQuery('(min-width: 768px)')
//   // const isSmallMobile = useMediaQuery('(max-width: 400px)')

//   const navigate = useNavigate()
//   const dispatch = useDispatch()

//   useEffect(() => {
//     const savedUsername = localStorage.getItem('username')
//     const savedPassword = localStorage.getItem('password')
//     const savedRememberMe = localStorage.getItem('rememberMe') === 'true'

//     if (savedRememberMe) {
//       setUsername(savedUsername || '')
//       setPassword(savedPassword || '')
//       setRememberMe(savedRememberMe)
//     }
//   }, [])

//   const handleLogin = async (e) => {
//     // e.preventDefault()
//     await dispatch(set({ loading: true }))

//     // Handle remember me logic
//     if (rememberMe) {
//       localStorage.setItem('username', username)
//       localStorage.setItem('password', password)
//       localStorage.setItem('rememberMe', true)
//     } else {
//       localStorage.removeItem('username')
//       localStorage.removeItem('password')
//       localStorage.setItem('rememberMe', false)
//     }

//     try {
//       // Dispatch login action
//       const red_res = await dispatch(loginUser({ username, password }))
//       // console.log('res:res', red_res)

//       // Check if login was successful
//       if (loginUser.fulfilled.match(red_res)) {
//         const userData = red_res.payload?.data

//         if (userData?.role === 'Applicant') {
//           navigate(`/applicant/add_new/${userData?.employeeId}`)
//         } else {
//           navigate('/attandance/track')
//         }

//         props.setIsAuthenticated(true)
//         message.success(red_res?.payload?.message)
//       } else if (loginUser.rejected.match(red_res)) {
//         // This is a rejected thunk
//         const errorMessage = red_res.payload || red_res.error?.message || 'Login failed'
//         message.error(errorMessage)
//       }

//       // else {
//       //   message.error(red_res?.payload || 'Login failed')
//       // }
//     } catch (error) {
//       console.error('Login error:', error)
//       message.error('An error occurred during login')
//     }

//     await dispatch(set({ loading: false }))
//   }

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter' && username !== '' && password !== '') {
//       handleLogin()
//     }
//   }

//   return (
//     <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
//       <CContainer>
//         <CRow className="justify-content-center">
//           <CCol md={8}>
//             <CCardGroup>
//               <CCard className="p-4">
//                 <CCardBody>
//                   <CForm onSubmit={(e) => e.preventDefault()}>
//                     <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
//                       <Image
//                         src={logo_new_bada}
//                         width={150}
//                         style={{ backgroundColor: '#fff', borderRadius: 5, paddingBottom: 2 }}
//                         preview={false}
//                       />
//                     </div>
//                     <p className="text-body-secondary">Sign In to your account</p>

//                     <CInputGroup className="mb-3">
//                       <CInputGroupText>
//                         <CIcon icon={cilUser} />
//                       </CInputGroupText>
//                       <CFormInput
//                         placeholder="Username"
//                         autoComplete="username"
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         onKeyDown={handleKeyDown}
//                       />
//                     </CInputGroup>

//                     <CInputGroup className="mb-4">
//                       <CInputGroupText>
//                         <CIcon
//                           icon={showPassword ? cilLockUnlocked : cilLockLocked}
//                           onClick={() => setShowPassword(!showPassword)}
//                         />
//                       </CInputGroupText>
//                       <CFormInput
//                         type={showPassword ? 'text' : 'password'}
//                         placeholder="Password"
//                         autoComplete="current-password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         onKeyDown={handleKeyDown}
//                       />
//                     </CInputGroup>

//                     <CRow className="mb-3">
//                       <CCol xs={6}>
//                         <CInputGroup>
//                           <CFormCheck
//                             type="checkbox"
//                             id="rememberMe"
//                             label="Remember me"
//                             checked={rememberMe}
//                             onChange={(e) => setRememberMe(e.target.checked)}
//                           />
//                         </CInputGroup>
//                       </CCol>
//                       <CCol xs={6} className="text-right">
//                         <Link to="/recover_password" className="px-0">
//                           Forgot password?
//                         </Link>
//                       </CCol>
//                     </CRow>

//                     <CRow>
//                       <CCol xs={6}>
//                         <CButton
//                           color="primary"
//                           className="px-4"
//                           onClick={handleLogin}
//                           type="button"
//                           disabled={loading}
//                         >
//                           {loading ? 'Logging in...' : 'Login'}
//                         </CButton>
//                       </CCol>
//                     </CRow>
//                   </CForm>
//                 </CCardBody>
//               </CCard>
//               <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
//                 <CCardBody className="text-center">
//                   <div>
//                     <h2>Sign up</h2>
//                     <p>
//                       Welcome to HRMS – Secure Employee Login. Please enter your credentials to
//                       access your account and manage your workplace activities efficiently.
//                     </p>

//                     <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//                       <p>---- Imp Links -----</p>
//                       <div
//                         style={{
//                           display: 'flex',
//                           flexDirection: 'row',
//                           gap: 20,
//                           justifyContent: 'center',
//                           alignItems: 'center',
//                         }}
//                       >
//                         <Link
//                           to="/register"
//                           style={{
//                             color: '#fff',
//                             textDecoration: 'none',
//                             fontWeight: 'bold',
//                             gap: '10px',
//                             cursor: 'pointer',
//                           }}
//                         >
//                           <Tooltip title="Register Applicant">
//                             <i className="fas fa-user-plus" style={{ fontSize: 26 }}></i>
//                           </Tooltip>

//                           {/* Register Applicant */}
//                         </Link>

//                         <Link
//                           to="/candidate-form"
//                           style={{
//                             color: '#fff',
//                             textDecoration: 'none',
//                             fontWeight: 'bold',
//                             gap: '10px',
//                             cursor: 'pointer',
//                           }}
//                         >
//                           <Tooltip title="Candidate Form">
//                             <i className="fas fa-file-alt" style={{ fontSize: 26 }}></i>
//                           </Tooltip>

//                           {/* Candidate Form */}
//                         </Link>

//                         <Link
//                           to="/interview-form"
//                           style={{
//                             color: '#fff',
//                             textDecoration: 'none',
//                             fontWeight: 'bold',
//                             gap: '10px',
//                             cursor: 'pointer',
//                           }}
//                         >
//                           <Tooltip title="Applicant Form">
//                             <i className="fas fa-user-check" style={{ fontSize: 26 }}></i>
//                           </Tooltip>

//                           {/* Applicant Form */}
//                         </Link>
//                       </div>
//                     </div>
//                   </div>
//                 </CCardBody>
//               </CCard>
//             </CCardGroup>
//           </CCol>
//         </CRow>
//       </CContainer>
//     </div>
//   )
// }

// export default Login
