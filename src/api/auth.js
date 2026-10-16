import { ref } from 'vue'

const TOKEN_KEY = 'sohojpath_access_token'
export const isAuthenticated = ref(Boolean(localStorage.getItem(TOKEN_KEY)))

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function saveSession(data) {
  localStorage.setItem(TOKEN_KEY, data.access_token)
  isAuthenticated.value = true
  localStorage.setItem('sohojpath_user', JSON.stringify(data.user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  isAuthenticated.value = false
  localStorage.removeItem('sohojpath_user')
  sessionStorage.removeItem('sohojpath_active_exam')
}


