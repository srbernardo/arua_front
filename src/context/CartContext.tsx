import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react'
import type { Product, Variant } from '../types'
import { api } from '../lib/api'

export interface CartItem {
  id: number
  product: Product
  variant: {
    size: string
    color: string
    sku: string
  }
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, variant: Variant) => void
  removeItem: (cartItemId: number) => void
  updateQuantity: (cartItemId: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('arua-cart-token')
    if (!token) return
    api.cart.show()
      .then((data) => {
        setItems(data.items.map(mapCartItem))
      })
      .catch(() => {})
  }, [])

  const addItem = useCallback(async (product: Product, variant: Variant) => {
    try {
      const data = await api.cart.addItem(variant.id, 1)
      setItems(data.items.map(mapCartItem))
    } catch {
      setItems((prev) => {
        const existing = prev.find(
          (i) => i.product.id === product.id && i.variant.size === variant.size && i.variant.color === variant.color
        )
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id && i.variant.size === variant.size && i.variant.color === variant.color
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        }
        return [...prev, { id: Date.now(), product, variant: { size: variant.size, color: variant.color, sku: variant.sku }, quantity: 1 }]
      })
    }
  }, [])

  const removeItem = useCallback(async (cartItemId: number) => {
    try {
      const data = await api.cart.removeItem(cartItemId)
      setItems(data.items.map(mapCartItem))
    } catch {
      setItems((prev) => prev.filter((i) => i.id !== cartItemId))
    }
  }, [])

  const updateQuantity = useCallback(async (cartItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartItemId)
      return
    }
    try {
      const data = await api.cart.updateItem(cartItemId, quantity)
      setItems(data.items.map(mapCartItem))
    } catch {
      setItems((prev) =>
        prev.map((i) =>
          i.id === cartItemId ? { ...i, quantity } : i
        )
      )
    }
  }, [items, removeItem])

  const clearCart = useCallback(async () => {
    try {
      const data = await api.cart.clear()
      setItems(data.items.map(mapCartItem))
    } catch {
      setItems([])
    }
  }, [])

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  )

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  )

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, cartOpen, setCartOpen }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

function mapCartItem(item: any): CartItem {
  return {
    id: item.id,
    product: item.product,
    variant: item.variant,
    quantity: item.quantity,
  }
}
