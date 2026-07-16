import { useState, useMemo, useCallback } from 'react'
import TopBar from './components/TopBar'
import CategoryBar from './components/CategoryBar'
import FilterBar from './components/FilterBar'
import ProductGrid from './components/ProductGrid'
import LoadMoreButton from './components/LoadMoreButton'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'
import CartDrawer from './components/CartDrawer'
import { useProducts } from './context/ProductsContext'

const PAGE_SIZE = 12

export default function App() {
  const { categories, products, loading, error } = useProducts()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState('default')
  const [activeCategory, setActiveCategory] = useState('ver-todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const searchOnly = useMemo(() => {
    if (!searchQuery) return null
    const q = searchQuery.toLowerCase()
    return products.filter((p) => p.name.toLowerCase().includes(q))
  }, [products, searchQuery])

  const visibleCategories = useMemo(() => {
    if (!searchOnly) return categories
    const catIds = new Set(searchOnly.map((p) => p.category_id))
    return categories.filter((c) => catIds.has(c.id))
  }, [categories, searchOnly])

  const filtered = useMemo(() => {
    let result = searchOnly ?? [...products]

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
  }, [products, activeCategory, sortBy, searchQuery, searchOnly])

  const categoryName = useMemo(
    () => categories.find((c) => c.id === activeCategory)?.name ?? 'Ver Todos',
    [activeCategory, categories]
  )

  const heading = searchQuery ? `Resultados para "${searchQuery}"` : categoryName

  function handleCategoryChange(id: string) {
    setActiveCategory(id)
    setVisibleCount(PAGE_SIZE)
  }

  function handleSortChange(value: string) {
    setSortBy(value)
    setVisibleCount(PAGE_SIZE)
  }

  const handleHome = useCallback(() => {
    setActiveCategory('ver-todos')
    setSearchQuery('')
    setSortBy('default')
    setVisibleCount(PAGE_SIZE)
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setVisibleCount(PAGE_SIZE)
  }, [])

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE)
  }, [])

  const hasMore = visibleCount < filtered.length

  return (
    <>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onHome={handleHome}
      />
      <CartDrawer />
      <div className="w-full bg-card min-h-screen flex flex-col">
        <TopBar onMenuClick={() => setSidebarOpen(true)} onSearch={handleSearch} onLogoClick={handleHome} />
        <div className="w-full max-w-[1440px] mx-auto flex flex-col flex-1">
          <CategoryBar
            categories={visibleCategories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
          <FilterBar
            open={filterOpen}
            onToggle={() => setFilterOpen(!filterOpen)}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            activeFilters={sortBy !== 'default' ? 1 : 0}
          />
          <main className="flex flex-col px-4 md:px-6 py-6 pb-16 md:pb-20">
            <h1 key={heading} className="font-heading text-[28px] font-semibold text-foreground-primary leading-tight pb-3 animate-fade-in">
              {heading}
            </h1>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-20">
                <span className="font-body text-sm text-destructive">{error}</span>
              </div>
            ) : (
              <>
                <ProductGrid products={filtered.slice(0, visibleCount)} />
                {hasMore && <LoadMoreButton onLoadMore={handleLoadMore} />}
              </>
            )}
          </main>
        </div>
        <Footer />
      </div>
    </>
  )
}
