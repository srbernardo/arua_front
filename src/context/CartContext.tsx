import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef, type ReactNode, type Dispatch, type SetStateAction } from 'react'
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
  addItem: (product: Product, variant: Variant, quantity?: number) => void
  removeItem: (cartItemId: number) => void
  updateQuantity: (cartItemId: number, quantity: number) => void
  clearCart: () => void
  syncCart: () => Promise<void>
  resetCart: () => void
  replaceItems: (items: CartItem[]) => void
  totalItems: number
  totalPrice: number
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  selectedIds: Set<number>
  setSelectedIds: Dispatch<SetStateAction<Set<number>>>
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const itemsRef = useRef<CartItem[]>([])

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    setSelectedIds((prev) => {
      const ids = new Set(items.map((i) => i.id))
      const pruned = [...prev].filter((id) => ids.has(id))
      return pruned.length === prev.size ? prev : new Set(pruned)
    })
  }, [items])

  useEffect(() => {
    const token = localStorage.getItem('arua-cart-token')
    const phone = localStorage.getItem('arua-phone')
    if (phone && !token) {
      api.cart.attach()
        .then((data) => setItems(data.items.map(mapCartItem)))
        .catch(() => {})
    } else if (token) {
      api.cart.show()
        .then((data) => setItems(data.items.map(mapCartItem)))
        .catch(() => {})
    }
  }, [])

  const addItem = useCallback(async (product: Product, variant: Variant, quantity = 1) => {
    const prevItems = itemsRef.current
    const existingId = prevItems.find(
      (i) => i.product.id === product.id && i.variant.size === variant.size && i.variant.color === variant.color
    )?.id

    const markSelected = (id: number | undefined) => {
      if (id == null) return
      setSelectedIds((prev) => {
        if (prev.has(id)) return prev
        const next = new Set(prev)
        next.add(id)
        return next
      })
    }

    try {
      const data = await api.cart.addItem(variant.id, quantity)
      const next = data.items.map(mapCartItem)
      setItems(next)
      const addedId = next.find((i: CartItem) => !prevItems.some((p) => p.id === i.id))?.id ?? existingId
      markSelected(addedId)
    } catch {
      if (existingId != null) {
        markSelected(existingId)
        setItems((prev) =>
          prev.map((i) =>
            i.product.id === product.id && i.variant.size === variant.size && i.variant.color === variant.color
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )
        )
      } else {
        const newItem = { id: Date.now(), product, variant: { size: variant.size, color: variant.color, sku: variant.sku }, quantity }
        markSelected(newItem.id)
        setItems((prev) => [...prev, newItem])
      }
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

  const syncCart = useCallback(async () => {
    const data = await api.cart.attach()
    setItems(data.items.map(mapCartItem))
  }, [])

  const resetCart = useCallback(() => {
    setItems([])
    localStorage.removeItem("arua-cart-token")
  }, [])

  const replaceItems = useCallback((next: CartItem[]) => {
    setItems(next)
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
      value={{ items, addItem, removeItem, updateQuantity, clearCart, syncCart, resetCart, replaceItems, totalItems, totalPrice, cartOpen, setCartOpen, selectedIds, setSelectedIds }}
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
