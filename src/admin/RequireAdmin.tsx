import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { adminApi, setOnUnauthorized } from '../lib/adminApi'

type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

/**
 * Guards the /admin section. On mount it verifies the session with the
 * server (GET /api/admin/me). Unauthenticated users are redirected to
 * /admin/login; when the session expires mid-usage (any 401), the user is
 * also redirected to the login page.
 */
export default function RequireAdmin({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>('loading')

  useEffect(() => {
    let cancelled = false

    setOnUnauthorized(() => {
      if (!cancelled) setState('unauthenticated')
    })

    adminApi
      .getCurrentAdmin()
      .then((admin) => {
        if (!cancelled) setState(admin ? 'authenticated' : 'unauthenticated')
      })
      .catch(() => {
        if (!cancelled) setState('unauthenticated')
      })

    return () => {
      cancelled = true
      setOnUnauthorized(null)
    }
  }, [])

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="font-body text-sm text-gray-500">A verificar sessão…</p>
      </div>
    )
  }

  if (state === 'unauthenticated') {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
