import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api } from '../lib/api'

interface User {
  name: string
  phone: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const PHONE_KEY = 'arua-phone'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const phone = localStorage.getItem(PHONE_KEY)
    if (!phone) {
      setLoading(false)
      return
    }

    api.users.lookup(phone)
      .then((data) => {
        if (data.exists) {
          setUser(data.user)
        } else {
          localStorage.removeItem(PHONE_KEY)
        }
      })
      .catch(() => {
        localStorage.removeItem(PHONE_KEY)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback((user: User) => {
    localStorage.setItem(PHONE_KEY, user.phone)
    setUser(user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(PHONE_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
