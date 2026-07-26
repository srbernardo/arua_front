import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api } from '../lib/api'
import { useAuth } from './AuthContext'

export interface FavoriteItem {
  id: number
  product: {
    id: number
    name: string
    price: number
    category: string
    image_url: string | null
  }
  created_at: string
}

interface FavoritesContextType {
  favorites: FavoriteItem[]
  favoriteIds: Set<number>
  loading: boolean
  toggleFavorite: (productId: number) => Promise<void>
  isFavorite: (productId: number) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(false)

  const favoriteIds = new Set(favorites.map((f) => f.product.id))

  useEffect(() => {
    if (!user) {
      setFavorites([])
      return
    }

    setLoading(true)
    api.favorites.list()
      .then((data) => {
        setFavorites(data)
      })
      .catch(() => {
        setFavorites([])
      })
      .finally(() => setLoading(false))
  }, [user])

  const toggleFavorite = useCallback(async (productId: number) => {
    if (!user) return

    const wasFavorite = favoriteIds.has(productId)

    setFavorites((prev) => {
      if (wasFavorite) {
        return prev.filter((f) => f.product.id !== productId)
      }
      return prev
    })

    try {
      if (wasFavorite) {
        await api.favorites.remove(productId)
      } else {
        await api.favorites.add(productId)
        const data = await api.favorites.list()
        setFavorites(data)
      }
    } catch {
      if (wasFavorite) {
        const data = await api.favorites.list()
        setFavorites(data)
      }
    }
  }, [user, favoriteIds])

  const isFavorite = useCallback((productId: number) => {
    return favoriteIds.has(productId)
  }, [favoriteIds])

  return (
    <FavoritesContext.Provider value={{ favorites, favoriteIds, loading, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}
