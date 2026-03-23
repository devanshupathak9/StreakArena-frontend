import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Auto-add JWT token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 errors (token expired)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const api = {
  // Auth
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  logout: () => client.post('/auth/logout'),
  resetPassword: (email) => client.post('/auth/reset-password', { email }),

  // User
  getMe: () => client.get('/users/me'),
  getDashboard: () => client.get('/users/dashboard'),

  // Groups
  getGroups: () => client.get('/groups'),
  getGroup: (id) => client.get(`/groups/${id}`),
  createGroup: (data) => client.post('/groups', data),
  joinGroup: (id, token) => client.post(`/groups/${id}/join`, { invite_token: token }),
  getInvite: (id) => client.post(`/groups/${id}/invite`),

  // Tasks
  getTodaysTasks: () => client.get('/tasks/today'),
  completeTask: (id) => client.post(`/tasks/${id}/complete`),
}

export default client
