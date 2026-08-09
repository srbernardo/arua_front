import { useMemo } from 'react'
import { X, Minus, Plus, Trash2, ShoppingCart, Check } from 'lucide-react'
import { useCart } from '../context/CartContext'
import type { Product } from '../types'

interface CartDrawerProps {
  onCheckout?: (selectedIds: Set<number>) => void
  onProductClick?: (product: Product) => void
}

export default function CartDrawer({ onCheckout, onProductClick }: CartDrawerProps) {
  const { items, cartOpen, setCartOpen, removeItem, updateQuantity, selectedIds, setSelectedIds } = useCart()

  const allSelected = items.length > 0 && items.every((i) => selectedIds.has(i.id))

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)))
    }
  }

  function removeSelected() {
    for (const id of selectedIds) {
      removeItem(id)
    }
    setSelectedIds(new Set())
  }

  const selectedTotal = useMemo(
    () => items.filter((i) => selectedIds.has(i.id)).reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items, selectedIds]
  )

  const selectedCount = useMemo(
    () => items.filter((i) => selectedIds.has(i.id)).reduce((sum, i) => sum + i.quantity, 0),
    [items, selectedIds]
  )

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
            Carrinho ({items.reduce((sum, i) => sum + i.quantity, 0)})
          </span>
          <button onClick={() => setCartOpen(false)} className="cursor-pointer hover:opacity-70 transition-opacity">
            <X size={20} className="text-foreground-secondary" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-6 py-3 border-b border-border">
          <button
            onClick={toggleSelectAll}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all cursor-pointer ${
              allSelected
                ? 'bg-foreground-primary text-white'
                : 'bg-white text-foreground-primary border border-border hover:bg-neutral-50'
            }`}
          >
            {allSelected && <Check size={13} className="text-white" />}
            {allSelected ? 'Desmarcar' : 'Selecionar tudo'}
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={removeSelected}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all cursor-pointer"
            >
              <Trash2 size={13} />
              Remover ({selectedIds.size})
            </button>
          )}
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
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors cursor-pointer ${
                        selectedIds.has(item.id) ? 'bg-foreground-primary border-foreground-primary' : 'border-foreground-secondary/40'
                      }`}
                    >
                      {selectedIds.has(item.id) && <Check size={12} className="text-white" />}
                    </button>
                  </div>
                  <div className="w-20 h-24 shrink-0 rounded-lg overflow-hidden bg-surface">
                    <img
                      src={item.product.images_by_color[0]?.images[0]?.url ?? ''}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-col min-w-0">
                        <span
                          onClick={() => { setCartOpen(false); onProductClick?.(item.product) }}
                          className="font-body text-sm font-medium text-foreground-primary truncate cursor-pointer hover:underline"
                        >
                          {item.product.name}
                        </span>
                        <span className="font-body text-xs text-foreground-secondary/70 mt-0.5 flex items-center gap-1.5">
                          {item.variant.size}
                          <span
                            className="inline-block w-3.5 h-3.5 rounded-sm shrink-0"
                            style={{ backgroundColor: item.variant.color }}
                          />
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
                      >
                        <Trash2 size={16} className="text-foreground-secondary/60 hover:text-destructive transition-colors" />
                      </button>
                    </div>
                    <span className="font-heading text-sm font-semibold text-black">
                      {(item.product.price * item.quantity).toFixed(2)} €
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-surface hover:bg-surface/80 transition-colors cursor-pointer"
                      >
                        <Minus size={14} className="text-foreground-secondary" />
                      </button>
                      <span className="font-body text-sm font-medium text-foreground-primary w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
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
                <span className="font-body text-sm text-foreground-secondary">
                  Subtotal{selectedCount > 0 && ` (${selectedCount} ${selectedCount === 1 ? 'item' : 'itens'})`}
                </span>
                <span className="font-heading text-lg font-bold text-foreground-primary">
                  {(selectedCount > 0 ? selectedTotal : items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)).toFixed(2)} €
                </span>
              </div>
              <button
                disabled={selectedCount === 0}
                onClick={() => {
                  setCartOpen(false)
                  onCheckout?.(selectedIds)
                }}
                className="w-full h-12 bg-black text-white font-body text-sm font-semibold rounded-full cursor-pointer hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {selectedCount > 0 ? `Finalizar Pedido (${selectedCount})` : 'Selecione itens para continuar'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
