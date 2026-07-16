import { useState, useMemo } from 'react'
import TopBar from './components/TopBar'
import CategoryBar from './components/CategoryBar'
import FilterBar from './components/FilterBar'
import ProductGrid from './components/ProductGrid'
import LoadMoreButton from './components/LoadMoreButton'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'
import CartDrawer from './components/CartDrawer'
import { useProducts } from './context/ProductsContext'

export default function App() {
  const { categories, loading } = useProducts()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState('default')
  const [activeCategory, setActiveCategory] = useState('ver-todos')

  const categoryName = useMemo(
    () => categories.find((c) => c.id === activeCategory)?.name ?? 'Ver Todos',
    [activeCategory, categories]
  )

  return (
    <>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <CartDrawer />
      <div className="w-full bg-card min-h-screen flex flex-col">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <div className="w-full max-w-[1440px] mx-auto flex flex-col flex-1">
          <CategoryBar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
          <FilterBar
            open={filterOpen}
            onToggle={() => setFilterOpen(!filterOpen)}
            sortBy={sortBy}
            onSortChange={setSortBy}
            activeFilters={sortBy !== 'default' ? 1 : 0}
          />
          <main className="flex flex-col px-4 md:px-6 py-6">
            <h1 key={categoryName} className="font-heading text-[28px] font-semibold text-foreground-primary leading-tight pb-3 animate-fade-in">
              {categoryName}
            </h1>
            <ProductGrid
              activeCategory={activeCategory}
              sortBy={sortBy}
            />
            <LoadMoreButton />
          </main>
          <Footer />
        </div>
      </div>
    </>
  )
}
