import { useCallback, useEffect, useState } from 'react'
import { Search, RefreshCw, Phone } from 'lucide-react'
import {
  adminApi,
  type Paginated,
  type PaginationMeta,
  errorMessage,
} from '../../lib/adminApi'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'

interface AdminUser {
  id: number
  name: string
  phone: string
  orders_count: number
  total_spent: number
  created_at: string
}

type LoadState = 'loading' | 'ready' | 'error'

const EMPTY_META: PaginationMeta = { page: 1, per_page: 20, total: 0, total_pages: 0 }

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value)
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META)
  const [state, setState] = useState<LoadState>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  const [query, setQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    setState('loading')
    try {
      const res = await adminApi.get<Paginated<AdminUser>>('/admin/users', {
        page,
        per_page: 20,
        q: query || undefined,
      })
      setUsers(res.data)
      setMeta(res.meta)
      setState('ready')
    } catch (err) {
      setErrorMsg(errorMessage(err, 'Não foi possível carregar os utilizadores.'))
      setState('error')
    }
  }, [page, query])

  useEffect(() => {
    load()
  }, [load])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setQuery(searchInput.trim())
    setPage(1)
  }

  return (
    <div className="max-w-4xl flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-gray-900">Utilizadores</h1>
        <p className="font-body text-sm text-gray-500 mt-1">
          {meta.total} utilizador{meta.total === 1 ? '' : 'es'} registados
        </p>
      </div>

      <form onSubmit={handleSearchSubmit} className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Procurar por nome ou telefone…"
          className="w-full h-10 pl-9 pr-3 rounded-lg bg-white border border-gray-200 text-sm font-body text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
        />
      </form>

      {state === 'loading' && <Spinner label="A carregar utilizadores…" />}

      {state === 'error' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
          <p className="font-body text-sm text-red-600">{errorMsg}</p>
          <button
            onClick={load}
            className="mt-4 inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-gray-900 text-white font-body text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} /> Tentar novamente
          </button>
        </div>
      )}

      {state === 'ready' &&
        (users.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <EmptyState
              title="Nenhum utilizador encontrado"
              description="Ajuste a pesquisa ou volte mais tarde."
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 font-body text-xs font-semibold text-gray-500">Utilizador</th>
                  <th className="px-5 py-3 font-body text-xs font-semibold text-gray-500 text-right">Pedidos</th>
                  <th className="px-5 py-3 font-body text-xs font-semibold text-gray-500 text-right">Total gasto</th>
                  <th className="px-5 py-3 font-body text-xs font-semibold text-gray-500 text-right">Registo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          <span className="font-body text-sm font-semibold text-gray-500">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-body text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="font-body text-xs text-gray-400 flex items-center gap-1">
                            <Phone size={11} /> {user.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-gray-900 text-right">{user.orders_count}</td>
                    <td className="px-5 py-3 font-body text-sm text-gray-900 text-right whitespace-nowrap">
                      {formatCurrency(user.total_spent)}
                    </td>
                    <td className="px-5 py-3 font-body text-xs text-gray-500 text-right whitespace-nowrap">
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4">
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          </div>
        ))}
    </div>
  )
}