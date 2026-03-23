import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { api } from '../api'
import useToast from './useToast'

const useAuth = () => {
  const { user, token, isAuthenticated, setUser, setToken, logout: storeLogout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const { showError, showSuccess } = useToast()
  const navigate = useNavigate()

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await api.login({ email, password })
      const { access_token: newToken, user: userData } = res.data
      setToken(newToken)
      if (userData) {
        setUser(userData)
      } else {
        // Fetch user profile after login
        try {
          const meRes = await api.getMe()
          setUser(meRes.data)
        } catch {
          // non-fatal
        }
      }
      navigate('/dashboard')
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Login failed. Please check your credentials.'
      showError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (username, email, password) => {
    setLoading(true)
    try {
      await api.register({ username, email, password })
      showSuccess('Account created successfully! Please sign in.')
      navigate('/login')
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.'
      showError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch {
      // ignore server errors on logout
    }
    storeLogout()
    navigate('/login')
  }

  return {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  }
}

export default useAuth
