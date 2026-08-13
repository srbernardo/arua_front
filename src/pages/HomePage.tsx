import CategoryBar from '../components/CategoryBar'
import FilterBar from '../components/FilterBar'
import ProductGrid from '../components/ProductGrid'
import LoadMoreButton from '../components/LoadMoreButton'
import Footer from '../components/Footer'
import type { Category, Product } from '../types'

interface HomePageProps {
  loading: boolean
  error: string | null
  visibleCategories: Category[]
  activeCategory: string
  onCategoryChange: (id: string) => void
  filterOpen: boolean
  onToggleFilter: () => void
  sortBy: string
  onSortChange: (value: string) => void
  activeFilters: number
  heading: string
  colors: string[]
  activeColor: string
  onColorChange: (color: string) => void
  sizes: string[]
  activeSize: string[]
  onSizeChange: (size: string) => void
  onClearFilters: () => void
  filtered: Product[]
  visibleCount: number
  hasMore: boolean
  onLoadMore: () => void
  onProductClick: (product: Product) => void
  onNavigate: (target: string, anchor?: string) => void
}

export default function HomePage({
  loading,
  error,
  visibleCategories,
  activeCategory,
  onCategoryChange,
  filterOpen,
  onToggleFilter,
  sortBy,
  onSortChange,
  activeFilters,
  heading,
  colors,
  activeColor,
  onColorChange,
  sizes,
  activeSize,
  onSizeChange,
  onClearFilters,
  filtered,
  visibleCount,
  hasMore,
  onLoadMore,
  onProductClick,
  onNavigate,
}: HomePageProps) {
  return (
    <>
      <div className="w-full flex flex-col flex-1 pt-16 md:pt-20">
        <CategoryBar
          categories={visibleCategories}
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
        />
        <FilterBar
          open={filterOpen}
          onToggle={onToggleFilter}
          sortBy={sortBy}
          onSortChange={onSortChange}
          activeFilters={activeFilters}
          heading={heading}
          colors={colors}
          activeColor={activeColor}
          onColorChange={onColorChange}
          sizes={sizes}
          activeSize={activeSize}
          onSizeChange={onSizeChange}
          onClearFilters={onClearFilters}
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
              <ProductGrid products={filtered.slice(0, visibleCount)} defaultColor={activeColor} onProductClick={onProductClick} />
              {hasMore && <LoadMoreButton onLoadMore={onLoadMore} />}
            </>
          )}
        </main>
      </div>
      <Footer onNavigate={onNavigate} />
    </>
  )
}