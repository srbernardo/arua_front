import { useMemo } from 'react'
import ProductCard from './ProductCard'
import { useProducts } from '../context/ProductsContext'

interface ProductGridProps {
  activeCategory: string
  sortBy: string
  searchQuery: string
}

export default function ProductGrid({ activeCategory, sortBy, searchQuery }: ProductGridProps) {
  const { products, loading, error } = useProducts()

  const filtered = useMemo(() => {
    let result = [...products]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q))
    }

    if (activeCategory !== 'ver-todos') {
      result = result.filter((p) => p.category_id === activeCategory)
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
    }

    return result
  }, [products, activeCategory, sortBy, searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="font-body text-sm text-destructive">{error}</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 w-full">
      {filtered.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
