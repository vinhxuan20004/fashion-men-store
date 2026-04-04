import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch {
      // ignore errors on logout
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }, [])

  const fetchProfile = useCallback(async () => {
    try {
      const response = await authAPI.getProfile()
      const userData = response.data.data.user
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return userData
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null)
        setToken(null)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
      return null
    }
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        try {
          // Try fetching profile with current token
          const response = await authAPI.getProfile()
          const userData = response.data.data.user
          setUser(userData)
          setToken(savedToken)
          localStorage.setItem('user', JSON.stringify(userData))
        } catch (error) {
          if (error.response?.status === 401) {
            // Access token expired — try refresh via HttpOnly cookie
            try {
              const refreshRes = await authAPI.refreshToken()
              const newToken = refreshRes.data.data.accessToken
              localStorage.setItem('token', newToken)
              setToken(newToken)
              // Retry profile with new token
              const profileRes = await authAPI.getProfile()
              const userData = profileRes.data.data.user
              setUser(userData)
              localStorage.setItem('user', JSON.stringify(userData))
            } catch {
              // Refresh also failed — truly logged out
              setUser(null)
              setToken(null)
              localStorage.removeItem('token')
              localStorage.removeItem('user')
            }
          }
        }
      } else {
        // No token in storage, try to restore from saved user (guest state)
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          try { setUser(JSON.parse(savedUser)) } catch { localStorage.removeItem('user') }
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { accessToken: newToken, user: userData } = response.data.data
      setToken(newToken)
      setUser(userData)
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userData))
      toast.success(`Chào mừng ${userData.name}!`)
      return { success: true, user: userData }
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      const { accessToken: newToken, user: newUser } = response.data.data
      setToken(newToken)
      setUser(newUser)
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))
      toast.success('Đăng ký thành công!')
      return { success: true, user: newUser }
    } catch (error) {
      if (error.response?.status === 422 && error.response.data.errors) {
        const validationErrors = error.response.data.errors
        validationErrors.forEach((err) => toast.error(err.message))
        return { success: false, errors: validationErrors }
      }
      const message = error.response?.data?.message || 'Đăng ký thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const updateUser = async (data) => {
    try {
      const response = await authAPI.updateProfile(data)
      const updatedUser = response.data.data.user
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      toast.success('Cập nhật thông tin thành công!')
      return { success: true, user: updatedUser }
    } catch (error) {
      const message = error.response?.data?.message || 'Cập nhật thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const isAdmin = user?.role === 'ADMIN'
  const isAuthenticated = !!token && !!user

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    updateUser,
    fetchProfile,
    isAdmin,
    isAuthenticated
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
