import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Product, Category } from '../types'
import { api } from '../lib/api'

interface ProductsContextType {
  categories: Category[]
  products: Product[]
  loading: boolean
  error: string | null
}

const ProductsContext = createContext<ProductsContextType | null>(null)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([api.categories.list(), api.products.list()])
      .then(([cats, prods]) => {
        setCategories(cats)
        setProducts(prods)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <ProductsContext.Provider value={{ categories, products, loading, error }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider')
  return ctx
}
