// src/api/axiosInstance.js
import axios from 'axios'

const baseUrl = import.meta.env.VITE_API_URL_2

const axiosInstance2 = axios.create({
  baseURL: baseUrl,
  // Do not set global Content-Type; set it per request
  headers: {
    Accept: '*/*',
  },
})

axiosInstance2.interceptors.request.use((config) => {
  let data = localStorage.getItem('data')
  data = JSON.parse(data)
  const token = data?.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosInstance2.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('401 error-------------->', error)
    if (error.response?.status === 401) {
      localStorage.removeItem('data')
      const currentPath = window.location.pathname
      if (currentPath !== '/login') {
        window.location.href = '/login'
      }
    }
    const ret = Promise.reject(error)
    // console.log('ret-------------->', ret)

    return ret
  },
)

export default axiosInstance2
