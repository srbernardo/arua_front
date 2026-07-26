import { useState, useMemo, useCallback } from 'react'
import TopBar from './components/TopBar'
import CategoryBar from './components/CategoryBar'
import FilterBar from './components/FilterBar'
import ProductGrid from './components/ProductGrid'
import LoadMoreButton from './components/LoadMoreButton'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'
import CartDrawer from './components/CartDrawer'
import CheckoutPage from './components/CheckoutPage'
import AddressesModal from './components/AddressesModal'
import FavoritesDrawer from './components/FavoritesDrawer'
import { useProducts } from './context/ProductsContext'

const PAGE_SIZE = 12

export default function App() {
  const { categories, products, loading, error } = useProducts()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [page, setPage] = useState<'home' | 'checkout'>('home')
  const [checkoutItemIds, setCheckoutItemIds] = useState<Set<number>>(new Set())
  const [addressesOpen, setAddressesOpen] = useState(false)
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const [sortBy, setSortBy] = useState('default')
  const [activeCategory, setActiveCategory] = useState('ver-todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeColor, setActiveColor] = useState('')
  const [activeSize, setActiveSize] = useState<string[]>([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const allColors = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => p.colors.forEach((c) => set.add(c)))
    return Array.from(set)
  }, [products])

  const allSizes = useMemo(() => {
    const order = ["XS", "S", "M", "L", "XL", "Tamanho Único"]
    const set = new Set<string>()
    products.forEach((p) => p.sizes?.forEach((s) => set.add(s)))
    return Array.from(set).sort((a, b) => order.indexOf(a) - order.indexOf(b))
  }, [products])

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

    if (activeColor) {
      result = result.filter((p) => p.colors.includes(activeColor))
    }

    if (activeSize.length > 0) {
      result = result.filter((p) => p.sizes && p.sizes.some((s) => activeSize.includes(s)))
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
  }, [products, activeCategory, sortBy, searchQuery, searchOnly, activeColor, activeSize])

  const categoryName = useMemo(
    () => categories.find((c) => c.id === activeCategory)?.name ?? 'Biquínis e Fatos de Banho',
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

  function handleColorChange(color: string) {
    setActiveColor((prev) => (prev === color ? '' : color))
    setVisibleCount(PAGE_SIZE)
  }

  function handleSizeChange(size: string) {
    setActiveSize((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
    setVisibleCount(PAGE_SIZE)
  }

  function handleClearFilters() {
    setSortBy('default')
    setActiveColor('')
    setActiveSize([])
    setVisibleCount(PAGE_SIZE)
  }

  const handleHome = useCallback(() => {
    setActiveCategory('ver-todos')
    setSearchQuery('')
    setActiveColor('')
    setActiveSize([])
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

  if (page === 'checkout') {
    return <CheckoutPage onBack={() => setPage('home')} checkoutItemIds={checkoutItemIds} />
  }

  return (
    <>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onHome={handleHome}
        onFavorites={() => { setSidebarOpen(false); setFavoritesOpen(true) }}
      />
      <AddressesModal open={addressesOpen} onClose={() => setAddressesOpen(false)} />
      <FavoritesDrawer open={favoritesOpen} onClose={() => setFavoritesOpen(false)} />
      <CartDrawer onCheckout={(ids) => { setCheckoutItemIds(ids); setPage('checkout') }} />
      <div className="w-full bg-card min-h-screen flex flex-col">
        <TopBar onMenuClick={() => setSidebarOpen(true)} onSearch={handleSearch} onLogoClick={handleHome} onAddresses={() => setAddressesOpen(true)} onFavorites={() => setFavoritesOpen(true)} />
        <div className="w-full flex flex-col flex-1 pt-16 md:pt-20">
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
            activeFilters={(sortBy !== 'default' ? 1 : 0) + (activeColor ? 1 : 0) + (activeSize.length > 0 ? 1 : 0)}
            heading={heading}
            colors={allColors}
            activeColor={activeColor}
            onColorChange={handleColorChange}
            sizes={allSizes}
            activeSize={activeSize}
            onSizeChange={handleSizeChange}
            onClearFilters={handleClearFilters}
          />
          <main className="flex flex-col px-4 md:px-6 py-6 pb-16 md:pb-20">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-foreground-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-20">
                <span className="font-body text-sm text-destructive">{error}</span>
              </div>
            ) : (
              <>
                <ProductGrid products={filtered.slice(0, visibleCount)} defaultColor={activeColor} />
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
