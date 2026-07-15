import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CartDrawer() {
  const { items, cartOpen, setCartOpen, removeItem, updateQuantity, totalItems, totalPrice } = useCart()

  return (
    <>
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setCartOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <span className="font-heading text-lg font-semibold text-foreground-primary">
            Carrinho ({totalItems})
          </span>
          <button onClick={() => setCartOpen(false)} className="cursor-pointer hover:opacity-70 transition-opacity">
            <X size={20} className="text-foreground-secondary" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <ShoppingCart size={48} className="text-foreground-secondary/20 mb-4" />
            <span className="font-body text-sm text-foreground-secondary/60">
              Seu carrinho está vazio
            </span>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                  <div className="w-20 h-24 shrink-0 rounded-lg overflow-hidden bg-surface">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-body text-sm font-medium text-foreground-primary truncate">
                        {product.name}
                      </span>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
                      >
                        <Trash2 size={16} className="text-foreground-secondary/60 hover:text-destructive transition-colors" />
                      </button>
                    </div>
                    <span className="font-heading text-sm font-semibold text-primary">
                      ${(product.price * quantity).toFixed(2)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-surface hover:bg-surface/80 transition-colors cursor-pointer"
                      >
                        <Minus size={14} className="text-foreground-secondary" />
                      </button>
                      <span className="font-body text-sm font-medium text-foreground-primary w-6 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-surface hover:bg-surface/80 transition-colors cursor-pointer"
                      >
                        <Plus size={14} className="text-foreground-secondary" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-4 md:p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="font-body text-sm text-foreground-secondary">Subtotal</span>
                <span className="font-heading text-lg font-bold text-foreground-primary">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <button className="w-full h-12 bg-primary text-white font-body text-sm font-semibold rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                Finalizar Pedido
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

function ShoppingCart({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}
