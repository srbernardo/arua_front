import { useState, useMemo } from 'react'
import { ChevronLeft, Smartphone, Banknote, Check, MapPin, Truck, Package } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { api } from '../lib/api'

interface CheckoutPageProps {
  onBack: () => void
  checkoutItemIds: Set<number>
}

type Step = 'address' | 'review'
type PaymentMethod = 'mbway' | 'dinheiro'

export default function CheckoutPage({ onBack, checkoutItemIds }: CheckoutPageProps) {
  const { items: allItems, clearCart } = useCart()
  const items = useMemo(() => allItems.filter((i) => checkoutItemIds.has(i.id)), [allItems, checkoutItemIds])
  const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0), [items])
  const [step, setStep] = useState<Step>('address')

  const [address, setAddress] = useState({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zip: '',
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [placing, setPlacing] = useState(false)
  const [done, setDone] = useState(false)

  const shipping = 7.99
  const total = totalPrice + shipping

  const addressComplete = useMemo(
    () => [address.street, address.city, address.state, address.zip].every((v) => v.trim()),
    [address],
  )

  function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (addressComplete) setStep('review')
  }

  async function handlePlaceOrder() {
    if (!paymentMethod) return
    setPlacing(true)
    try {
      await api.orders.create({
        address,
        payment_method: paymentMethod,
        item_ids: items.map((i) => i.id),
      })
      await clearCart()
      setDone(true)
    } catch {
      setPlacing(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="font-heading text-xl font-semibold text-black mb-2">
            Pedido Confirmado!
          </h2>
          <p className="font-body text-sm text-neutral-500 mb-6">
            Seu pedido foi realizado com sucesso. Você receberá atualizações do status por aqui.
          </p>
          <button
            onClick={onBack}
            className="w-full h-12 bg-black text-white font-body text-sm font-semibold rounded-full cursor-pointer hover:bg-black/80 transition-colors"
          >
            Continuar Comprando
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center gap-3 px-4 md:px-8 h-16 md:h-20 border-b border-neutral-200 shrink-0">
        <button
          onClick={step === 'address' ? onBack : () => setStep('address')}
          className="w-10 h-10 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={22} className="text-neutral-600" />
        </button>
        <span className="font-heading text-lg font-semibold text-black">
          Finalizar Pedido
        </span>
      </div>

      <div className="flex items-center gap-2 px-4 md:px-8 py-4 border-b border-neutral-200 bg-neutral-50">
        {(['address', 'review'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold font-body transition-colors ${
                step === s
                  ? 'bg-black text-white'
                  : i === 0 && step === 'review'
                    ? 'bg-green-500 text-white'
                    : 'bg-neutral-100 text-neutral-400'
              }`}
            >
              {i === 0 && step === 'review' ? <Check size={14} /> : i + 1}
            </div>
            <span
              className={`font-body text-xs hidden sm:inline ${
                step === s ? 'text-black font-medium' : 'text-neutral-400'
              }`}
            >
              {s === 'address' ? 'Endereço' : 'Revisão'}
            </span>
            {i < 1 && (
              <div className={`w-6 h-px mx-1 ${step === 'review' ? 'bg-green-500' : 'bg-neutral-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {step === 'address' && (
            <form onSubmit={handleAddressSubmit} autoComplete="on">
              <div className="max-w-lg">
                <h3 className="font-heading text-base font-semibold text-black mb-1 flex items-center gap-2">
                  <MapPin size={18} className="text-neutral-500" />
                  Endereço de Entrega
                </h3>
                <p className="font-body text-xs text-neutral-400 mb-5">
                  Informe onde você deseja receber seu pedido
                </p>

                <div className="mb-3">
                  <label className="block font-body text-xs font-medium text-neutral-600 mb-1.5" htmlFor="morada">Morada</label>
                  <input
                    id="morada"
                    name="morada"
                    autoComplete="street-address"
                    value={address.street}
                    onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                    placeholder="Rua, número"
                    className="w-full h-11 px-4 rounded-xl bg-neutral-100 border border-neutral-300 text-sm font-body text-black placeholder-neutral-400 outline-none focus:border-black transition-colors"
                  />
                </div>

                <div className="mb-3">
                  <label className="block font-body text-xs font-medium text-neutral-600 mb-1.5" htmlFor="apto">Apto, conjunto, unidade, piso, etc.</label>
                  <input
                    id="apto"
                    name="apto"
                    autoComplete="address-line2"
                    value={address.neighborhood}
                    onChange={(e) => setAddress((a) => ({ ...a, neighborhood: e.target.value }))}
                    placeholder="Ex: Apt 4B"
                    className="w-full h-11 px-4 rounded-xl bg-neutral-100 border border-neutral-300 text-sm font-body text-black placeholder-neutral-400 outline-none focus:border-black transition-colors"
                  />
                </div>

                <div className="flex gap-3 mb-3">
                  <div className="flex-[2]">
                    <label className="block font-body text-xs font-medium text-neutral-600 mb-1.5" htmlFor="concelho">Concelho</label>
                    <input
                      id="concelho"
                      name="concelho"
                      autoComplete="address-level2"
                      value={address.city}
                      onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                      placeholder="Concelho"
                      className="w-full h-11 px-4 rounded-xl bg-neutral-100 border border-neutral-300 text-sm font-body text-black placeholder-neutral-400 outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block font-body text-xs font-medium text-neutral-600 mb-1.5" htmlFor="distrito">Distrito</label>
                    <input
                      id="distrito"
                      name="distrito"
                      autoComplete="address-level1"
                      value={address.state}
                      onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                      placeholder="Ex: Lisboa"
                      className="w-full h-11 px-4 rounded-xl bg-neutral-100 border border-neutral-300 text-sm font-body text-black placeholder-neutral-400 outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block font-body text-xs font-medium text-neutral-600 mb-1.5" htmlFor="codigo-postal">Código Postal</label>
                  <input
                    id="codigo-postal"
                    name="codigo-postal"
                    autoComplete="postal-code"
                    value={address.zip}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 7)
                        const formatted = digits.length > 4 ? digits.slice(0, 4) + '-' + digits.slice(4) : digits
                        setAddress((a) => ({ ...a, zip: formatted }))
                      }}
                      placeholder="0000-000"
                      maxLength={8}
                    className="w-full h-11 px-4 rounded-xl bg-neutral-100 border border-neutral-300 text-sm font-body text-black placeholder-neutral-400 outline-none focus:border-black transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!addressComplete}
                  className="w-full h-12 bg-black text-white font-body text-sm font-semibold rounded-full cursor-pointer hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continuar para Revisão
                </button>
              </div>
            </form>
          )}

          {step === 'review' && (
            <div className="max-w-lg">
              <h3 className="font-heading text-base font-semibold text-black mb-1 flex items-center gap-2">
                <Package size={18} className="text-neutral-500" />
                Revisão do Pedido
              </h3>
              <p className="font-body text-xs text-neutral-400 mb-5">
                Confira os detalhes antes de confirmar
              </p>

              <div className="rounded-xl bg-neutral-50 p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={16} className="text-neutral-500" />
                  <span className="font-body text-sm font-semibold text-black">Endereço</span>
                  <button
                    onClick={() => setStep('address')}
                    className="ml-auto font-body text-xs text-neutral-500 underline cursor-pointer hover:text-black transition-colors"
                  >
                    Editar
                  </button>
                </div>
                <p className="font-body text-sm text-neutral-600 ml-6">
                  {address.street}
                </p>
                {address.neighborhood && (
                  <p className="font-body text-sm text-neutral-600 ml-6">
                    {address.neighborhood}
                  </p>
                )}
                <p className="font-body text-sm text-neutral-600 ml-6">
                  {address.city}/{address.state}
                </p>
                <p className="font-body text-sm text-neutral-600 ml-6">
                  Código Postal {address.zip}
                </p>
              </div>

              <h4 className="font-heading text-sm font-semibold text-black mb-3 flex items-center gap-2">
                <Smartphone size={16} className="text-neutral-500" />
                Forma de Pagamento
              </h4>

              <div className="flex flex-col gap-2 mb-6">
                <button
                  onClick={() => setPaymentMethod('mbway')}
                  className={`flex items-center gap-4 w-full p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                    paymentMethod === 'mbway'
                      ? 'border-black bg-neutral-50'
                      : 'border-neutral-200 bg-white hover:border-neutral-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      paymentMethod === 'mbway' ? 'bg-black' : 'bg-neutral-100'
                    }`}
                  >
                    <Smartphone size={20} className={paymentMethod === 'mbway' ? 'text-white' : 'text-neutral-600'} />
                  </div>
                  <div className="flex-1">
                    <span className="block font-body text-sm font-semibold text-black">MB Way</span>
                    <span className="block font-body text-xs text-neutral-400 mt-0.5">
                      Pagamento rápido e seguro pelo telemóvel
                    </span>
                  </div>
                  {paymentMethod === 'mbway' && (
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setPaymentMethod('dinheiro')}
                  className={`flex items-center gap-4 w-full p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                    paymentMethod === 'dinheiro'
                      ? 'border-black bg-neutral-50'
                      : 'border-neutral-200 bg-white hover:border-neutral-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      paymentMethod === 'dinheiro' ? 'bg-black' : 'bg-neutral-100'
                    }`}
                  >
                    <Banknote size={20} className={paymentMethod === 'dinheiro' ? 'text-white' : 'text-neutral-600'} />
                  </div>
                  <div className="flex-1">
                    <span className="block font-body text-sm font-semibold text-black">Dinheiro</span>
                    <span className="block font-body text-xs text-neutral-400 mt-0.5">
                      Pagamento no momento da entrega
                    </span>
                  </div>
                  {paymentMethod === 'dinheiro' && (
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              </div>

              <div className="rounded-xl bg-neutral-50 p-4 mb-2">
                <div className="flex items-center gap-2 mb-3">
                  <Truck size={16} className="text-neutral-500" />
                  <span className="font-body text-sm font-semibold text-black">Frete</span>
                </div>
                <p className="font-body text-sm text-neutral-600 ml-6">
                  ${shipping.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full md:w-80 lg:w-96 bg-neutral-50 border-t md:border-t-0 md:border-l border-neutral-200 flex flex-col shrink-0">
          <div className="px-4 md:px-6 py-4 md:py-5 border-b border-neutral-200">
            <span className="font-heading text-sm font-semibold text-black">Resumo do Pedido</span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-14 h-16 shrink-0 rounded-lg overflow-hidden bg-white">
                  <img
                    src={item.product.images_by_color[0]?.images[0]?.url ?? ''}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium text-black truncate">
                    {item.product.name}
                  </p>
                  <p className="font-body text-xs text-neutral-400">
                    {item.variant.size} {item.variant.color && <span className="inline-block w-2.5 h-2.5 rounded-sm align-middle ml-1" style={{ backgroundColor: item.variant.color }} />}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-body text-xs text-neutral-400">Qtd: {item.quantity}</span>
                    <span className="font-heading text-sm font-semibold text-black">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 md:px-6 py-4 border-t border-neutral-200 flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="font-body text-sm text-neutral-600">Subtotal</span>
              <span className="font-body text-sm text-black">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-body text-sm text-neutral-600">Frete</span>
              <span className="font-body text-sm text-black">${shipping.toFixed(2)}</span>
            </div>
            <div className="border-t border-neutral-200 pt-2.5 mt-1 flex justify-between items-center">
              <span className="font-heading text-sm font-semibold text-black">Total</span>
              <span className="font-heading text-lg font-bold text-black">${total.toFixed(2)}</span>
            </div>

            {step === 'review' && (
              <button
                onClick={handlePlaceOrder}
                disabled={placing || !paymentMethod}
                className="w-full h-12 bg-black text-white font-body text-sm font-semibold rounded-full cursor-pointer hover:bg-black/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {placing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Confirmar Pedido'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
