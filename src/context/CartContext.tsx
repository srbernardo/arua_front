import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react'
import type { Product } from '../types'
import { api } from '../lib/api'

export interface CartItem {
  id: number
  product: Product
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
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

  const addItem = useCallback(async (product: Product) => {
    try {
      const data = await api.cart.addItem(product.id, 1)
      setItems(data.items.map(mapCartItem))
    } catch {
      setItems((prev) => {
        const existing = prev.find((i) => i.product.id === product.id)
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        }
        return [...prev, { id: Date.now(), product, quantity: 1 }]
      })
    }
  }, [])

  const removeItem = useCallback(async (productId: number) => {
    const item = items.find((i) => i.product.id === productId)
    if (item) {
      try {
        const data = await api.cart.removeItem(item.id)
        setItems(data.items.map(mapCartItem))
      } catch {
        setItems((prev) => prev.filter((i) => i.product.id !== productId))
      }
    }
  }, [items])

  const updateQuantity = useCallback(async (productId: number, quantity: number) => {
    const item = items.find((i) => i.product.id === productId)
    if (!item) return
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    try {
      const data = await api.cart.updateItem(item.id, quantity)
      setItems(data.items.map(mapCartItem))
    } catch {
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
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
    quantity: item.quantity,
  }
}
