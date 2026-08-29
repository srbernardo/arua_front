import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import {
  adminApi,
  type Paginated,
  type PaginationMeta,
  errorMessage,
} from '../../lib/adminApi'
import { useToast } from '../../lib/toast'
import { orderStatusLabel } from '../components/Badge'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'

interface AdminOrder {
  id: number
  order_number: string
  status: string
  payment_method: string
  total: number
  item_count: number
  user: { id: number; name: string; phone: string }
  image_url: string | null
  created_at: string
}

type LoadState = 'loading' | 'ready' | 'error'

const STATUS_FILTERS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

const EMPTY_META: PaginationMeta = { page: 1, per_page: 20, total: 0, total_pages: 0 }

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value)
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META)
  const [state, setState] = useState<LoadState>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setState('loading')
    try {
      const res = await adminApi.get<Paginated<AdminOrder>>('/admin/orders', {
        page,
        per_page: 20,
        status: statusFilter || undefined,
      })
      setOrders(res.data)
      setMeta(res.meta)
      setState('ready')
    } catch (err) {
      setErrorMsg(errorMessage(err, 'Não foi possível carregar os pedidos.'))
      setState('error')
    }
  }, [page, statusFilter])

  useEffect(() => {
    load()
  }, [load])

  async function handleStatusChange(orderId: number, status: string) {
    setUpdatingId(orderId)
    try {
      await adminApi.patch(`/admin/orders/${orderId}`, { order: { status } })
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
      toast(`Pedido #${orderId} marcado como ${orderStatusLabel(status)}.`)
    } catch (err) {
      toast(errorMessage(err, 'Não foi possível atualizar o estado do pedido.'), 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="max-w-5xl flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-gray-900">Pedidos</h1>
        <p className="font-body text-sm text-gray-500 mt-1">{meta.total} pedido{meta.total === 1 ? '' : 's'}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setStatusFilter('')
            setPage(1)
          }}
          className={`h-9 px-3.5 rounded-full border font-body text-xs font-medium transition-colors cursor-pointer ${
            statusFilter === ''
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Todos
        </button>
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status)
              setPage(1)
            }}
            className={`h-9 px-3.5 rounded-full border font-body text-xs font-medium transition-colors cursor-pointer ${
              statusFilter === status
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {orderStatusLabel(status)}
          </button>
        ))}
      </div>

      {state === 'loading' && <Spinner label="A carregar pedidos…" />}

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
        (orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <EmptyState
              title="Nenhum pedido encontrado"
              description="Altere o filtro de estado ou volte mais tarde."
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 font-body text-xs font-semibold text-gray-500">Pedido</th>
                  <th className="px-5 py-3 font-body text-xs font-semibold text-gray-500">Cliente</th>
                  <th className="px-5 py-3 font-body text-xs font-semibold text-gray-500 text-right">Total</th>
                  <th className="px-5 py-3 font-body text-xs font-semibold text-gray-500">Estado</th>
                  <th className="px-5 py-3 font-body text-xs font-semibold text-gray-500 text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <button
                        onClick={() => navigate(`/admin/pedidos/${order.id}`)}
                        className="flex items-center gap-3 text-left cursor-pointer group"
                      >
                        {order.image_url ? (
                          <img
                            src={order.image_url}
                            alt=""
                            className="w-10 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-12 rounded-lg bg-gray-100 border border-gray-100 shrink-0" />
                        )}
                        <span className="font-body text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                          {order.order_number}
                        </span>
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-body text-sm text-gray-900">{order.user.name}</p>
                      <p className="font-body text-xs text-gray-400">{order.user.phone}</p>
                    </td>
                    <td className="px-5 py-3 font-body text-sm text-gray-900 text-right whitespace-nowrap">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className="h-8 px-2 rounded-lg bg-white border border-gray-200 text-xs font-body text-gray-900 outline-none focus:border-gray-400 transition-colors cursor-pointer disabled:opacity-50"
                        aria-label={`Estado do pedido ${order.order_number}`}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {orderStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 font-body text-xs text-gray-500 text-right whitespace-nowrap">
                      {formatDate(order.created_at)}
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