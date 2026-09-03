import { useState, useEffect } from 'react'
import { ChevronLeft, MapPin, Smartphone, MessageCircle, Package } from 'lucide-react'
import { api } from '../lib/api'
import { STATUS_LABELS } from './OrdersModal'

interface OrderDetailsPageProps {
  orderId: number
  onBack: () => void
}

interface OrderDetail {
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
  whatsapp_url: string | null
  observation: string | null
  created_at: string
  items: Array<{
    id: number
    product_id: number
    product_name: string
    image_url: string | null
    variant_size: string
    variant_color: string
    quantity: number
    unit_price: number
  }>
}

export default function OrderDetailsPage({ orderId, onBack }: OrderDetailsPageProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.orders.show(orderId)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center gap-3 px-4 md:px-8 h-16 md:h-20 border-b border-neutral-200 shrink-0">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity">
          <ChevronLeft size={22} className="text-neutral-600" />
        </button>
        <span className="font-heading text-lg font-semibold text-black">
          Detalhes do Pedido
        </span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !order ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <Package size={40} className="text-neutral-300 mb-4" />
          <span className="font-body text-sm text-neutral-400">Pedido não encontrado</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-lg mx-auto w-full">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-heading text-base font-semibold text-black">
                Pedido #{order.order_number}
              </h3>
              <span
                className={`font-body text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                  order.status === 'cancelled'
                    ? 'bg-red-50 text-red-600'
                    : order.status === 'delivered'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <p className="font-body text-xs text-neutral-400 mb-6">
              {formatDate(order.created_at)}
            </p>

            {order.status === 'cancelled' && order.observation && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-4 mb-6">
                <p className="font-body text-sm font-semibold text-red-700 mb-1">
                  Motivo do cancelamento
                </p>
                <p className="font-body text-sm text-red-600">{order.observation}</p>
              </div>
            )}

            <h4 className="font-heading text-sm font-semibold text-black mb-3">
              Itens
            </h4>
            <div className="flex flex-col gap-4 mb-6">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-14 h-16 shrink-0 rounded-lg overflow-hidden bg-neutral-100 flex items-center justify-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={20} className="text-neutral-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-black truncate">{item.product_name}</p>
                    <p className="font-body text-xs text-neutral-400">
                      {item.variant_size} {item.variant_color && <span className="inline-block w-2.5 h-2.5 rounded-sm align-middle ml-1" style={{ backgroundColor: item.variant_color }} />}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-body text-xs text-neutral-400">
                        Qtd: {item.quantity} × {item.unit_price.toFixed(2)} €
                      </span>
                      <span className="font-heading text-sm font-semibold text-black">
                        {(item.unit_price * item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-neutral-50 p-4 mb-6 flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="font-body text-sm text-neutral-600">Subtotal</span>
                <span className="font-body text-sm text-black">{order.subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body text-sm text-neutral-600">Frete</span>
                <span className="font-body text-sm text-black">{order.shipping.toFixed(2)} €</span>
              </div>
              <div className="border-t border-neutral-200 pt-2.5 mt-1 flex justify-between items-center">
                <span className="font-heading text-sm font-semibold text-black">Total</span>
                <span className="font-heading text-lg font-bold text-black">{order.total.toFixed(2)} €</span>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 p-4 mb-4">
              <p className="font-body text-sm font-semibold text-black mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-neutral-500" />
                Morada de Entrega
              </p>
              <p className="font-body text-sm text-neutral-600">{order.address.street}</p>
              {order.address.neighborhood && (
                <p className="font-body text-sm text-neutral-600">{order.address.neighborhood}</p>
              )}
              <p className="font-body text-sm text-neutral-600">
                {order.address.city}, {order.address.state} · {order.address.zip}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200 p-4 mb-6">
              <p className="font-body text-sm font-semibold text-black mb-3 flex items-center gap-2">
                <Smartphone size={16} className="text-neutral-500" />
                Forma de Pagamento
              </p>
              <p className="font-body text-sm text-neutral-600">
                {order.payment_method === 'mbway' ? 'MB Way' : 'Dinheiro'}
              </p>
            </div>

            {order.whatsapp_url && (
              <a
                href={order.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-12 bg-green-600 text-white font-body text-sm font-semibold rounded-full cursor-pointer hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                Enviar detalhes por WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </div>
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
