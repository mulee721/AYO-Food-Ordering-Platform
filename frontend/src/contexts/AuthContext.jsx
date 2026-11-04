import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('mira_token')
    const saved = localStorage.getItem('mira_user')
    if (token && saved) {
      try { setUser(JSON.parse(saved)) } catch {}
      // Verify token is still valid
      authAPI.me()
        .then(r => { setUser(r.data); localStorage.setItem('mira_user', JSON.stringify(r.data)) })
        .catch(() => { localStorage.removeItem('mira_token'); localStorage.removeItem('mira_user'); setUser(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login(email, password)
    localStorage.setItem('mira_token', data.token)
    localStorage.setItem('mira_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (name, email, password, phone) => {
    const { data } = await authAPI.register(name, email, password, phone)
    localStorage.setItem('mira_token', data.token)
    localStorage.setItem('mira_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('mira_token')
    localStorage.removeItem('mira_user')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const { data } = await authAPI.me()
    setUser(data)
    localStorage.setItem('mira_user', JSON.stringify(data))
    return data
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
