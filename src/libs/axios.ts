import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => {
    if (response.data && (response.data.error === true || response.data.statusCode >= 400)) {
      const error = new Error(response.data.message || 'Error del servidor')

      ;(error as any).response = {
        status: response.data.statusCode,
        data: response.data
      }

      return Promise.reject(error)
    }

    return response
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      window.location.href = '/login'
    }

    console.error('API Error:', error)

    return Promise.reject(error)
  }
)
