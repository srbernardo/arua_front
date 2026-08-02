import { useState, useEffect } from 'react'
import { X, Package, ChevronRight } from 'lucide-react'
import { api } from '../lib/api'

interface OrdersModalProps {
  open: boolean
  onClose: () => void
  onSelect: (orderId: number) => void
}

interface OrderSummary {
  id: number
  order_number: string
  status: string
  total: number
  created_at: string
  item_count: number
  image_url: string | null
}

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

export default function OrdersModal({ open, onClose, onSelect }: OrdersModalProps) {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)

  function loadOrders() {
    setLoading(true)
    api.orders.list()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (open) loadOrders()
  }, [open])

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 transition-opacity" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <span className="font-heading text-lg font-semibold text-black">Os Meus Pedidos</span>
          <button onClick={onClose} className="cursor-pointer hover:opacity-70 transition-opacity">
            <X size={20} className="text-neutral-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package size={40} className="text-neutral-300 mb-4" />
              <span className="font-body text-sm text-neutral-400">
                Ainda não tens pedidos
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => onSelect(o.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-neutral-200 bg-white text-left hover:border-neutral-400 transition-colors cursor-pointer"
                >
                  <div className="w-14 h-16 shrink-0 rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center">
                    {o.image_url ? (
                      <img src={o.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package size={20} className="text-neutral-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-body text-sm font-semibold text-black truncate">
                        Pedido #{o.order_number}
                      </span>
                      <ChevronRight size={16} className="text-neutral-300 shrink-0" />
                    </div>
                    <p className="font-body text-xs text-neutral-500 mt-0.5">
                      {formatDate(o.created_at)} · {o.item_count} {o.item_count === 1 ? 'item' : 'itens'}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span
                        className={`font-body text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          o.status === 'cancelled'
                            ? 'bg-red-50 text-red-600'
                            : o.status === 'delivered'
                              ? 'bg-green-50 text-green-600'
                              : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {STATUS_LABELS[o.status] ?? o.status}
                      </span>
                      <span className="font-heading text-sm font-bold text-black">
                        {o.total.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()} ${hh}:${min}`
}
