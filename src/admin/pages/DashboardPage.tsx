import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Euro, ShoppingCart, Clock, Package, AlertTriangle, RefreshCw } from 'lucide-react'
import { adminApi, isApiError } from '../../lib/adminApi'
import Badge from '../components/Badge'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'

interface DashboardData {
  counts: {
    products: number
    categories: number
    orders: number
    pending_orders: number
    users: number
    low_stock_variants: number
  }
  revenue: {
    total: number
    pending: number
  }
  low_stock: { product_id: number; name: string; min_stock: number }[]
  recent_orders: {
    id: number
    order_number: string
    status: string
    total: number
    user: { id: number; name: string }
    created_at: string
  }[]
}

type LoadState = 'loading' | 'ready' | 'error'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value)
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [state, setState] = useState<LoadState>('loading')

  const load = useCallback(async () => {
    setState('loading')
    try {
      const data = await adminApi.get<DashboardData>('/admin/dashboard')
      setData(data)
      setState('ready')
    } catch (err) {
      if (isApiError(err) && err.status === 401) return
      setState('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (state === 'loading') return <Spinner label="A carregar estatísticas…" />

  if (state === 'error' || !data) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
        <p className="font-body text-sm text-gray-500">Não foi possível carregar o dashboard.</p>
        <button
          onClick={load}
          className="mt-4 inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-gray-900 text-white font-body text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} /> Tentar novamente
        </button>
      </div>
    )
  }

  const cards = [
    {
      label: 'Receita',
      value: formatCurrency(data.revenue.total),
      sub: `${formatCurrency(data.revenue.pending)} em pedidos pendentes`,
      icon: Euro,
      accent: 'bg-green-50 text-green-700',
    },
    {
      label: 'Pedidos',
      value: String(data.counts.orders),
      sub: 'Total de pedidos',
      icon: ShoppingCart,
      accent: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Pedidos pendentes',
      value: String(data.counts.pending_orders),
      sub: 'A aguardar confirmação',
      icon: Clock,
      accent: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Produtos',
      value: String(data.counts.products),
      sub: `${data.counts.categories} categorias`,
      icon: Package,
      accent: 'bg-violet-50 text-violet-700',
    },
    {
      label: 'Stock baixo',
      value: String(data.counts.low_stock_variants),
      sub: 'Variantes com stock ≤ 5',
      icon: AlertTriangle,
      accent: 'bg-red-50 text-red-700',
    },
  ]

  return (
    <div className="max-w-5xl flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="font-body text-sm text-gray-500 mt-1">Resumo da atividade da loja</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map(({ label, value, sub, icon: Icon, accent }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="font-heading text-xl font-semibold text-gray-900 leading-tight">{value}</p>
              <p className="font-body text-xs font-medium text-gray-600 mt-0.5">{label}</p>
              <p className="font-body text-[11px] text-gray-400 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-body text-sm font-semibold text-gray-900">Últimos pedidos</h2>
            <button
              onClick={() => navigate('/admin/pedidos')}
              className="font-body text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Ver todos
            </button>
          </div>
          {data.recent_orders.length === 0 ? (
            <EmptyState title="Sem pedidos ainda" description="Os pedidos recentes aparecem aqui." />
          ) : (
            <ul className="divide-y divide-gray-50">
              {data.recent_orders.map((order) => (
                <li key={order.id}>
                  <button
                    onClick={() => navigate(`/admin/pedidos/${order.id}`)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="font-body text-sm font-medium text-gray-900 truncate">{order.order_number}</p>
                      <p className="font-body text-xs text-gray-500 truncate">
                        {order.user.name} · {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge status={order.status} />
                      <span className="font-body text-sm font-semibold text-gray-900">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-body text-sm font-semibold text-gray-900">Stock baixo</h2>
          </div>
          {data.low_stock.length === 0 ? (
            <EmptyState title="Stock saudável" description="Nenhum produto com stock igual ou inferior a 5." />
          ) : (
            <ul className="divide-y divide-gray-50">
              {data.low_stock.map((item) => (
                <li key={item.product_id}>
                  <button
                    onClick={() => navigate(`/admin/produtos/${item.product_id}/editar`)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                  >
                    <span className="font-body text-sm text-gray-900 truncate">{item.name}</span>
                    <span className="font-body text-xs font-medium text-red-600 shrink-0">
                      mínimo {item.min_stock} un.
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}