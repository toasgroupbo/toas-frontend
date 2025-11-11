import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token')
    const actingAsCompany = localStorage.getItem('acting_as_company')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (actingAsCompany) {
      try {
        const company = JSON.parse(actingAsCompany)

        config.headers['companyUUID'] = company.id
      } catch (error) {
        console.error('Error parsing acting_as_company:', error)
      }
    }

    if (config.data instanceof FormData) {
      const newHeaders = { ...config.headers }
      delete newHeaders['Content-Type']

      config.headers = newHeaders as any
      config.transformRequest = []
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)
