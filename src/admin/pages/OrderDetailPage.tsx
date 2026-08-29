import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, RefreshCw, MapPin, CreditCard, User } from 'lucide-react'
import { adminApi, isApiError, errorMessage } from '../../lib/adminApi'
import { useToast } from '../../lib/toast'
import Badge, { orderStatusLabel } from '../components/Badge'
import Spinner from '../components/Spinner'

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  image_url: string | null
  variant_size: string
  variant_color: string
  quantity: number
  unit_price: number
}

interface AdminOrder {
  id: number
  order_number: string
  status: string
  payment_method: string
  address: {
    street: string
    neighborhood: string | null
    city: string
    state: string
    zip: string
  }
  subtotal: number
  shipping: number
  total: number
  items: OrderItem[]
  user: { id: number; name: string; phone: string }
  created_at: string
}

type LoadState = 'loading' | 'ready' | 'error'

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value)
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [order, setOrder] = useState<AdminOrder | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [updating, setUpdating] = useState(false)

  const load = useCallback(async () => {
    setState('loading')
    try {
      const data = await adminApi.get<AdminOrder>(`/admin/orders/${id}`)
      setOrder(data)
      setState('ready')
    } catch (err) {
      if (isApiError(err) && err.status === 401) return
      setErrorMsg(errorMessage(err, 'Não foi possível carregar o pedido.'))
      setState('error')
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function handleStatusChange(status: string) {
    if (!order) return
    setUpdating(true)
    try {
      await adminApi.patch(`/admin/orders/${order.id}`, { order: { status } })
      setOrder((prev) => (prev ? { ...prev, status } : prev))
      toast(`Pedido marcado como ${orderStatusLabel(status)}.`)
    } catch (err) {
      toast(errorMessage(err, 'Não foi possível atualizar o estado do pedido.'), 'error')
    } finally {
      setUpdating(false)
    }
  }

  if (state === 'loading') return <Spinner label="A carregar pedido…" />

  if (state === 'error' || !order) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
        <p className="font-body text-sm text-red-600">{errorMsg}</p>
        <button
          onClick={load}
          className="mt-4 inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-gray-900 text-white font-body text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} /> Tentar novamente
        </button>
      </div>
    )
  }

  const itemTotal = order.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      <div>
        <button
          onClick={() => navigate('/admin/pedidos')}
          className="inline-flex items-center gap-1.5 font-body text-xs text-gray-500 hover:text-gray-900 transition-colors mb-2 cursor-pointer"
        >
          <ArrowLeft size={14} /> Voltar aos pedidos
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-gray-900">{order.order_number}</h1>
            <p className="font-body text-sm text-gray-500 mt-1">{formatDate(order.created_at)}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge status={order.status} />
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="h-9 px-2.5 rounded-lg bg-white border border-gray-200 text-xs font-body text-gray-900 outline-none focus:border-gray-400 transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Alterar estado do pedido"
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {orderStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <User size={15} className="text-gray-400" />
            <h2 className="font-body text-sm font-semibold text-gray-900">Cliente</h2>
          </div>
          <p className="font-body text-sm text-gray-900">{order.user.name}</p>
          <p className="font-body text-xs text-gray-500 mt-0.5">{order.user.phone}</p>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={15} className="text-gray-400" />
            <h2 className="font-body text-sm font-semibold text-gray-900">Morada</h2>
          </div>
          <p className="font-body text-sm text-gray-900">{order.address.street}</p>
          {order.address.neighborhood && (
            <p className="font-body text-xs text-gray-500">{order.address.neighborhood}</p>
          )}
          <p className="font-body text-xs text-gray-500">
            {order.address.zip} · {order.address.city}, {order.address.state}
          </p>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={15} className="text-gray-400" />
            <h2 className="font-body text-sm font-semibold text-gray-900">Pagamento</h2>
          </div>
          <p className="font-body text-sm text-gray-900 capitalize">
            {order.payment_method === 'mbway' ? 'MB Way' : order.payment_method}
          </p>
          <p className="font-body text-xs text-gray-500 mt-0.5">Subtotal {formatCurrency(order.subtotal)}</p>
          <p className="font-body text-xs text-gray-500">Envio {formatCurrency(order.shipping)}</p>
        </section>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-body text-sm font-semibold text-gray-900">
            Itens ({order.items.length})
          </h2>
        </div>
        {order.items.length === 0 ? (
          <p className="font-body text-sm text-gray-400 text-center py-8">Sem itens neste pedido.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt=""
                    className="w-12 h-14 rounded-lg object-cover border border-gray-100 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-14 rounded-lg bg-gray-100 border border-gray-100 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => navigate(`/admin/produtos/${item.product_id}/editar`)}
                    className="font-body text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors text-left cursor-pointer"
                  >
                    {item.product_name}
                  </button>
                  <p className="font-body text-xs text-gray-500 mt-0.5">
                    {item.variant_size} · {item.variant_color} · ×{item.quantity}
                  </p>
                </div>
                <span className="font-body text-sm text-gray-900 whitespace-nowrap">
                  {formatCurrency(item.unit_price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="font-body text-sm text-gray-500">
            {order.items.reduce((sum, item) => sum + item.quantity, 0)} artigo
            {order.items.reduce((sum, item) => sum + item.quantity, 0) === 1 ? '' : 's'}
          </div>
          <div className="flex items-center gap-8">
            <span className="font-body text-sm text-gray-500">
              Subtotal {formatCurrency(itemTotal)}
            </span>
            <span className="font-heading text-lg font-semibold text-gray-900">
              Total {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}