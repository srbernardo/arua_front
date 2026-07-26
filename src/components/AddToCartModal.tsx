import { useState, useMemo } from 'react'
import { X, Minus, Plus, Check } from 'lucide-react'
import type { Product } from '../types'
import { useCart } from '../context/CartContext'

interface AddToCartModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

export default function AddToCartModal({ product, isOpen, onClose }: AddToCartModalProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? '')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const { addItem, setCartOpen } = useCart()

  const availableColors = useMemo(() => {
    const colors = product.variants
      .filter((v) => v.size === selectedSize)
      .map((v) => v.color)
    return [...new Set(colors)]
  }, [product.variants, selectedSize])

  const availableSizes = useMemo(() => {
    if (!selectedColor) return product.sizes
    const sizes = product.variants
      .filter((v) => v.color === selectedColor)
      .map((v) => v.size)
    return product.sizes.filter((s) => sizes.includes(s))
  }, [product.variants, product.sizes, selectedColor])

  if (selectedColor === '' && availableColors.length > 0) {
    setSelectedColor(availableColors[0])
  }

  if (selectedSize && !availableSizes.includes(selectedSize) && availableSizes.length > 0) {
    setSelectedSize(availableSizes[0])
  }

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.size === selectedSize && v.color === selectedColor),
    [product.variants, selectedSize, selectedColor]
  )

  const currentGroup = product.images_by_color.find((g) => g.color === selectedColor)
  const currentImage = currentGroup?.images[0]?.url ?? ''

  function handleAdd() {
    if (!selectedVariant) return
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedVariant)
    }
    onClose()
    setCartOpen(true)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-5 animate-slide-up">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <img src={currentImage} alt={product.name} className="w-20 h-24 object-cover rounded-lg shrink-0" />
            <div className="flex flex-col gap-1">
              <span className="font-heading text-sm font-semibold text-foreground-primary">{product.name}</span>
              <span className="font-heading text-lg font-bold text-black">{product.price.toFixed(2)} €</span>
            </div>
          </div>
          <button onClick={onClose} className="cursor-pointer hover:opacity-70 transition-opacity shrink-0">
            <X size={20} className="text-foreground-secondary" />
          </button>
        </div>

        {product.sizes.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="font-body text-xs font-medium text-foreground-secondary uppercase tracking-wider">Tamanho</span>
            <div className="flex items-center gap-2">
              {availableSizes.map((size) => {
                const hasStock = product.variants.some((v) => v.size === size && v.color === selectedColor && v.stock > 0)
                return (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setQuantity(1) }}
                    disabled={!hasStock}
                    className={`min-w-[40px] h-9 px-3 rounded-lg text-xs font-body font-semibold transition-all cursor-pointer ${
                      size === selectedSize
                        ? 'bg-foreground-primary text-white'
                        : 'bg-surface text-foreground-secondary hover:bg-neutral-200'
                    } ${!hasStock ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {availableColors.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="font-body text-xs font-medium text-foreground-secondary uppercase tracking-wider">Cor</span>
            <div className="flex items-center gap-2">
              {availableColors.map((color) => {
                const variant = product.variants.find((v) => v.size === selectedSize && v.color === color)
                const outOfStock = variant && variant.stock <= 0
                return (
                  <button
                    key={color}
                    onClick={() => { setSelectedColor(color); setQuantity(1) }}
                    disabled={outOfStock}
                    className={`w-8 h-8 rounded-lg cursor-pointer hover:scale-110 transition-all flex items-center justify-center ${
                      outOfStock ? 'opacity-30 cursor-not-allowed' : ''
                    } ${color === selectedColor ? 'ring-2 ring-foreground-primary ring-offset-2' : ''}`}
                    style={{ backgroundColor: color }}
                  >
                    {color === selectedColor && <Check size={16} className={isLightColor(color) ? 'text-black' : 'text-white'} />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <span className="font-body text-xs font-medium text-foreground-secondary uppercase tracking-wider">Quantidade</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <Minus size={16} className="text-foreground-secondary" />
            </button>
            <span className="font-body text-base font-semibold text-foreground-primary w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock ?? 10, q + 1))}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <Plus size={16} className="text-foreground-secondary" />
            </button>
            {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
              <span className="font-body text-xs text-orange-500">Últimas {selectedVariant.stock} unidades</span>
            )}
            {selectedVariant && selectedVariant.stock === 0 && (
              <span className="font-body text-xs text-red-500">Sem stock</span>
            )}
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={!selectedVariant || selectedVariant.stock === 0}
          className="w-full h-12 bg-black text-white font-body text-sm font-semibold rounded-full cursor-pointer hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {selectedVariant && selectedVariant.stock > 0
            ? `Adicionar ao Carrinho — ${(product.price * quantity).toFixed(2)} €`
            : 'Indisponível'}
        </button>
      </div>
    </div>
  )
}

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 186
}
