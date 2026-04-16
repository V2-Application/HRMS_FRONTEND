import React, { useState } from 'react'
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
  CLink,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilEnvelopeClosed, cilCalendar } from '@coreui/icons'
import { Image, message } from 'antd'
import logo_new_bada from '../../../assets/images/V2-Logo-1.png'
import { useNavigate } from 'react-router-dom'
import { forgotPassword } from '../../../services/Services'
import { useDispatch, useSelector } from 'react-redux'
import { set } from '../../../redux/uiSlice'

const ForgotPassword = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  // const [loading, setLoading] = useState(false)
  const [dob, setDob] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.ui)

  const handleResetPassword = async () => {
    if (!emailOrUsername) {
      message.warning('Please enter your email or username')
      return
    }

    try {
      await dispatch(set({ loading: true }))
      console.log(emailOrUsername, dob)
      const requestBody = {
        eCode: emailOrUsername,
        dob,
      }

      const result = await forgotPassword(requestBody)
      message.success('Link Send on Your Registered email')
      setEmailOrUsername('')
      setDob('')
      navigate('/login')

      // Replace this with your real API call
      //   const res = await fetch('/api/forgot-password', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ identifier: emailOrUsername }),
      //   })

      //   const data = await res.json()

      //   if (res.ok) {
      //     message.success('Password reset instructions have been sent to your email.')
      //     setEmailOrUsername('')
      //   } else {
      //     message.error(data.message || 'Failed to send reset instructions.')
      //   }
    } catch (error) {
      message.error(error?.response?.data?.message)
    } finally {
      await dispatch(set({ loading: false }))
    }
  }

  return (
    <div className="bg-body-tertiary d-flex flex-row align-items-center" style={{minHeight: '125vh'}}>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={(e) => e.preventDefault()}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
                      <Image
                        src={logo_new_bada}
                        width={150}
                        style={{ backgroundColor: '#fff', borderRadius: 5, paddingBottom: 2 }}
                      />
                    </div>
                    <p className="text-body-secondary">Reset your password</p>

                    {/* Email or Username Field */}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilEnvelopeClosed} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Enter your e-code"
                        autoComplete="username"
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                      />
                    </CInputGroup>

                    <CRow className="mb-3">
                      {/* Date of Birth Field with Half Width */}
                      <CCol sm={12}>
                        <CInputGroup>
                          <CInputGroupText>
                            <CIcon icon={cilCalendar} />
                          </CInputGroupText>
                          <CFormInput
                            type="date"
                            placeholder="Enter date of birth"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                          />
                        </CInputGroup>
                      </CCol>
                    </CRow>

                    <CRow className="align-items-center">
                      <CCol xs={12} md={6}>
                        <CButton
                          color="primary"
                          className="px-3"
                          style={{ fontSize: '0.9rem' }}
                          onClick={handleResetPassword}
                          disabled={loading}
                          block
                        >
                          {loading ? 'Sending...' : 'Send Reset Instructions'}
                        </CButton>
                      </CCol>
                      <CCol xs={12} md={6} className="text-end">
                        <CLink
                          href="/login"
                          className="text-body-secondary"
                          style={{ fontSize: '0.9rem' }}
                        >
                          Go to Login
                        </CLink>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default ForgotPassword
