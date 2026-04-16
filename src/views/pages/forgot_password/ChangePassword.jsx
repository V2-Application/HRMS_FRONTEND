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
  CLink
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked } from '@coreui/icons'
import { message, Image } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import logo_new_bada from '../../../assets/images/V2-Logo-1.png'
import { changePasswordByForForgot } from '../../../services/Services'


const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { id } = useParams();

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      message.warning('Please fill in all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      message.warning('Passwords do not match')
      return
    }

    try {
      setLoading(true)

        const bodyRequest ={
          token:id,
          newPassword
        }
      console.log('body----',bodyRequest );
      
        const res = await changePasswordByForForgot(bodyRequest)

        message.success("Password Changed Successfully")
        navigate('/login')

      if (true) {
        message.success('Password changed successfully')
        navigate('/login')
      } else {
        message.error(data.message || 'Failed to change password')
      }
    } catch (error) {
     message.error(error?.response?.data?.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary d-flex flex-row align-items-center" style={{ minHeight: '125vh' }}>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
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
                    <p className="text-body-secondary">Change Your Password</p>

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </CInputGroup>

                    <CRow className="align-items-center">
                      <CCol xs={12} md={6}>
                        <CButton
                          color="primary"
                          className="px-4"
                          onClick={handleChangePassword}
                          disabled={loading}
                          block
                        >
                          {loading ? 'Updating...' : 'Update Password'}
                        </CButton>
                      </CCol>
                      <CCol xs={12} md={6} className="text-end">
                        <CLink href="/login" className="text-body-secondary">
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

export default ChangePassword
