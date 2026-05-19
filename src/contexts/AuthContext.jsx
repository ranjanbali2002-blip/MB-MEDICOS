import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      // Timeout after 8s so the app doesn't hang if backend is sleeping (Render free tier)
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 8000)
      )
      const { data } = await Promise.race([authApi.me(), timeout])
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Wake up Render backend immediately (free tier sleeps after inactivity)
    if (import.meta.env.VITE_API_URL) {
      fetch(`${import.meta.env.VITE_API_URL}/api/health`).catch(() => {})
    }
    fetchMe()
    const handleLogout = () => setUser(null)
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [fetchMe])

  const login = async (identifier, password) => {
    const { data } = await authApi.login({ identifier, password })
    if (data.accessToken) localStorage.setItem('accessToken', data.accessToken)
    setUser(data.user)
    return data.user
  }

  const register = async (payload) => {
    const { data } = await authApi.register(payload)
    if (data.accessToken) localStorage.setItem('accessToken', data.accessToken)
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    try { await authApi.logout() } catch {}
    localStorage.removeItem('accessToken')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refetch: fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
