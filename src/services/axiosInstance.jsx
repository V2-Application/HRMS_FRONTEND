// src/api/axiosInstance.js
import axios from 'axios'

const baseUrl = import.meta.env.VITE_API_URL

const axiosInstance = axios.create({
  baseURL: baseUrl,
  // Do not set global Content-Type; set it per request
  headers: {
    Accept: '*/*',
  },
})

axiosInstance.interceptors.request.use((config) => {
  let data = localStorage.getItem('data')
  data = JSON.parse(data)
  const token = data?.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Paths the user can land on without being logged in. A 401 from a background
// API call on these pages must NOT kick the user back to /login (otherwise the
// public applicant/candidate/interview/register forms become unusable —
// dropdown fetches that require auth return 401 and the user gets bounced).
const PUBLIC_FORM_PATHS = [
  '/login',
  '/recover_password',
  '/change_password',
  '/register',
  '/appform',
  '/candidate-form',
  '/interview-form',
  '/applicant-form',
]
const isOnPublicFormPath = () => {
  const path = window.location.pathname || ''
  return PUBLIC_FORM_PATHS.some((p) => path === p || path.startsWith(p + '/'))
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('401 error-------------->', error)
    if (error.response?.status === 401) {
      if (!isOnPublicFormPath()) {
        localStorage.removeItem('data')
        window.location.href = '/login'
      }
    }
    // RoutePermissionGuard owns user-visible "page denied" UX. A 403 from a
    // background API gated by [RequirePageAccess] would surface its generic
    // backend message as a misleading toast on whatever page is currently
    // visible, so blank the message here and let callers fall back to their
    // default text.
    if (
      error.response?.status === 403 &&
      error.response?.data?.message === 'You do not have access to this page.'
    ) {
      error.response.data.message = ''
    }
    const ret = Promise.reject(error)
    // console.log('ret-------------->', ret)

    return ret
  },
)

export default axiosInstance
