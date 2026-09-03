import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../lib/adminApi'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    adminApi.getCurrentAdmin().then((admin) => {
      if (!cancelled && admin) navigate('/admin', { replace: true })
    })
    return () => {
      cancelled = true
    }
  }, [navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await adminApi.login(email, password)
      navigate('/admin', { replace: true })
    } catch (err) {
      const status = (err as { status?: number }).status
      if (status === 401) {
        setError(err instanceof Error ? err.message : 'Email ou senha incorretos.')
      } else {
        setError(err instanceof Error ? err.message : 'Não foi possível ligar ao servidor.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="text-center mb-8">
          <span className="font-heading text-2xl font-semibold text-gray-900">ARUA Admin</span>
          <p className="font-body text-sm text-gray-500 mt-1">Acesso restrito ao painel administrativo</p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-gray-600">Email</label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@arua.pt"
              className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm font-body text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-gray-600">Senha</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm font-body text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
            />
          </div>
          {error && (
            <p className="font-body text-xs text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gray-900 text-white font-body text-sm font-semibold rounded-full cursor-pointer hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'A entrar…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}