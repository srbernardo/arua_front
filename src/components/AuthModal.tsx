import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { api } from '../lib/api'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { login } = useAuth()
  const { syncCart } = useCart()
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [phoneExists, setPhoneExists] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const rawDigits = phone.replace(/\s/g, '')

  function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 9)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhone(formatPhone(e.target.value))
    setPhoneExists(null)
    setName('')
    setError('')
  }

  useEffect(() => {
    if (rawDigits.length !== 9) return

    setLoading(true)
    setPhoneExists(null)
    setError('')

    api.users.lookup(rawDigits)
      .then((data) => {
        setPhoneExists(data.exists)
        if (data.exists) {
          setName(data.user.name)
        }
      })
      .catch(() => setError('Erro ao verificar telefone'))
      .finally(() => setLoading(false))
  }, [rawDigits])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (phoneExists) {
        login({ name, phone: rawDigits })
        await syncCart()
        onSuccess?.()
        onClose()
      } else {
        if (!name.trim()) {
          setError('Insere o teu nome')
          setSubmitting(false)
          return
        }
        const data = await api.users.register(name.trim(), rawDigits)
        login(data.user)
        await syncCart()
        onSuccess?.()
        onClose()
      }
    } catch {
      setError('Erro ao processar. Tenta novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    setPhone('')
    setName('')
    setPhoneExists(null)
    setError('')
    onClose()
  }

  if (!isOpen) return null

  const isLookupDone = phoneExists !== null && !loading

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-card w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-5 animate-slide-up">
        <div className="flex items-center justify-between">
          <span className="font-heading text-lg font-semibold text-foreground-primary">
            {phoneExists === null ? 'Entrar ou Criar Conta' : phoneExists ? 'Bem-vindo de volta' : 'Criar Conta'}
          </span>
          <button onClick={handleClose} className="cursor-pointer hover:opacity-70 transition-opacity">
            <X size={20} className="text-foreground-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-body text-xs font-medium text-foreground-secondary uppercase tracking-wider">
              Telefone
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="912 345 678"
              maxLength={11}
              className="w-full h-11 px-4 rounded-lg bg-surface text-foreground-primary font-body text-sm placeholder:text-foreground-secondary/40 outline-none focus:ring-2 focus:ring-foreground-primary/20 transition-all"
              required
            />
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-foreground-secondary">
              <Loader2 size={16} className="animate-spin" />
              <span className="font-body text-xs">A verificar...</span>
            </div>
          )}

          {isLookupDone && !phoneExists && (
            <div className="flex flex-col gap-2 animate-slide-up">
              <label className="font-body text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError('') }}
                placeholder="Como te chamas?"
                className="w-full h-11 px-4 rounded-lg bg-surface text-foreground-primary font-body text-sm placeholder:text-foreground-secondary/40 outline-none focus:ring-2 focus:ring-foreground-primary/20 transition-all"
                required
              />
            </div>
          )}

          {isLookupDone && phoneExists && name && (
            <div className="flex flex-col gap-1 animate-slide-up">
              <span className="font-body text-sm text-foreground-secondary">Olá,</span>
              <span className="font-heading text-base font-semibold text-foreground-primary">{name}</span>
            </div>
          )}

          {error && (
            <span className="font-body text-xs text-destructive">{error}</span>
          )}

          <button
            type="submit"
            disabled={!isLookupDone || submitting}
            className="w-full h-12 bg-black text-white font-body text-sm font-semibold rounded-full cursor-pointer hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting
              ? 'A processar...'
              : phoneExists === null
                ? 'Continuar'
                : phoneExists
                  ? 'Entrar'
                  : 'Criar Conta'}
          </button>
        </form>
      </div>
    </div>
  )
}
