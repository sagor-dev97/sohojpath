import axios from 'axios'
import { getAccessToken } from './auth'

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_APP_URL
const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname)
const defaultApiUrl = configuredApiUrl
  ? (configuredApiUrl.replace(/\/$/, '').endsWith('/api/v1')
      ? configuredApiUrl
      : `${configuredApiUrl.replace(/\/$/, '')}/api/v1`)
  : window.location.hostname.endsWith('.test') || !isLocalHost
    ? `${window.location.origin}/api/v1`
    : 'http://localhost:8000/api/v1'

const http = axios.create({
  baseURL: defaultApiUrl.replace(/\/$/, ''),
  headers: { Accept: 'application/json' },
  timeout: 15000,
})

export default http

http.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
})
