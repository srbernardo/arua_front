import { useState, useMemo, useCallback, type ReactNode } from 'react'
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import CartDrawer from './components/CartDrawer'
import CheckoutPage from './components/CheckoutPage'
import AddressesModal from './components/AddressesModal'
import AuthModal from './components/AuthModal'
import FavoritesDrawer from './components/FavoritesDrawer'
import OrdersModal from './components/OrdersModal'
import OrderDetailsPage from './components/OrderDetailsPage'
import ProductPage from './components/ProductPage'
import AboutPage from './components/AboutPage'
import CustomerServicePage from './components/CustomerServicePage'
import LegalPage, { type LegalSection } from './components/LegalPage'
import HomePage from './pages/HomePage'
import ScrollToTop from './components/ScrollToTop'
import AdminLoginPage from './admin/AdminLoginPage'
import AdminLayout from './admin/AdminLayout'
import RequireAdmin from './admin/RequireAdmin'
import DashboardPage from './admin/pages/DashboardPage'
import ProductsListPage from './admin/pages/ProductsListPage'
import ProductFormPage from './admin/pages/ProductFormPage'
import CategoriesPage from './admin/pages/CategoriesPage'
import OrdersPage from './admin/pages/OrdersPage'
import AdminOrderDetailPage from './admin/pages/OrderDetailPage'
import UsersPage from './admin/pages/UsersPage'
import { useProducts } from './context/ProductsContext'
import { useAuth } from './context/AuthContext'
import { useCart } from './context/CartContext'
import { useToast } from './lib/toast'

const PAGE_SIZE = 12

export default function App() {
  const { categories, products, loading, error } = useProducts()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [pendingCheckoutIds, setPendingCheckoutIds] = useState<Set<number> | null>(null)
  const [addressesOpen, setAddressesOpen] = useState(false)
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const [ordersOpen, setOrdersOpen] = useState(false)
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

  function handleAuthSuccess() {
    if (pendingCheckoutIds) {
      const ids = pendingCheckoutIds
      setPendingCheckoutIds(null)
      navigate('/checkout', { state: { ids } })
    }
  }

  function handleOrderSelect(orderId: number) {
    setOrdersOpen(false)
    navigate('/pedido/' + orderId)
  }

  function handleCheckout(ids: Set<number>) {
    if (user) {
      navigate('/checkout', { state: { ids } })
    } else {
      setPendingCheckoutIds(ids)
      setAuthOpen(true)
    }
  }

  const handleHome = useCallback(() => {
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    navigate('/')
    setActiveCategory('ver-todos')
    setSearchQuery('')
    setActiveColor('')
    setActiveSize([])
    setSortBy('default')
    setVisibleCount(PAGE_SIZE)
  }, [navigate])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setVisibleCount(PAGE_SIZE)
  }, [])

  const handleNavigate = useCallback((target: string, anchor?: string) => {
    let dest = ''
    if (target === 'about') dest = '/sobre'
    else if (target === 'service') dest = '/atendimento'
    else dest = '/legal/' + target
    if (anchor) dest += '#' + anchor
    navigate(dest)
    if (anchor) {
      setTimeout(() => {
        const el = document.getElementById(anchor)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [navigate])

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE)
  }, [])

  const hasMore = visibleCount < filtered.length

  const topBarProps = {
    onMenuClick: () => setSidebarOpen(true),
    onSearch: handleSearch,
    onLogoClick: handleHome,
    onAddresses: () => setAddressesOpen(true),
    onFavorites: () => setFavoritesOpen(true),
    onLoginClick: () => setAuthOpen(true),
    onOrders: () => setOrdersOpen(true),
  }

  return (
    <>
      <ScrollToTop />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onHome={handleHome}
        onFavorites={() => { setSidebarOpen(false); setFavoritesOpen(true) }}
        onNavigate={handleNavigate}
      />
      <AddressesModal open={addressesOpen} onClose={() => setAddressesOpen(false)} />
      <AuthModal isOpen={authOpen} onClose={() => { setAuthOpen(false); setPendingCheckoutIds(null) }} onSuccess={handleAuthSuccess} />
      <FavoritesDrawer open={favoritesOpen} onClose={() => setFavoritesOpen(false)} />
      <OrdersModal open={ordersOpen} onClose={() => setOrdersOpen(false)} onSelect={handleOrderSelect} />
      <CartDrawer onCheckout={handleCheckout} onProductClick={(p) => navigate('/produto/' + p.id)} />

      <Routes>
        <Route path="/" element={
          <StoreChrome {...topBarProps}>
            <HomePage
              loading={loading}
              error={error}
              visibleCategories={visibleCategories}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              filterOpen={filterOpen}
              onToggleFilter={() => setFilterOpen(!filterOpen)}
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
              filtered={filtered}
              visibleCount={visibleCount}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              onProductClick={(p) => navigate('/produto/' + p.id)}
              onNavigate={handleNavigate}
            />
          </StoreChrome>
        } />

        <Route path="/produto/:id" element={
          <ProductRoute topBarProps={topBarProps} />
        } />

        <Route path="/checkout" element={
          <CheckoutRoute />
        } />

        <Route path="/pedido/:id" element={
          <OrderRoute />
        } />

        <Route path="/sobre" element={
          <AboutPage onBack={() => navigate('/')} onNavigate={handleNavigate} />
        } />

        <Route path="/atendimento" element={
          <CustomerServicePage onBack={() => navigate('/')} onNavigate={handleNavigate} />
        } />

        <Route path="/legal/:section" element={
          <LegalRoute onNavigate={handleNavigate} />
        } />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="produtos" element={<ProductsListPage />} />
          <Route path="produtos/novo" element={<ProductFormPage />} />
          <Route path="produtos/:id/editar" element={<ProductFormPage />} />
          <Route path="categorias" element={<CategoriesPage />} />
          <Route path="pedidos" element={<OrdersPage />} />
          <Route path="pedidos/:id" element={<AdminOrderDetailPage />} />
          <Route path="utilizadores" element={<UsersPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

function ProductRoute({ topBarProps }: { topBarProps: TopBarProps }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const productId = Number(id)
  if (!Number.isInteger(productId) || productId <= 0) {
    return <Navigate to="/" replace />
  }
  return (
    <StoreChrome {...topBarProps}>
      <ProductPage productId={productId} onBack={() => navigate('/')} />
    </StoreChrome>
  )
}

function CheckoutRoute() {
  const location = useLocation()
  const navigate = useNavigate()
  const { selectedIds, setCartOpen } = useCart()
  const { toast } = useToast()

  const checkoutItemIds = useMemo(
    () => (location.state?.ids instanceof Set ? location.state.ids : selectedIds),
    [location.state, selectedIds]
  )

  return (
    <CheckoutPage
      onBack={() => navigate('/')}
      onItemsUnavailable={(message) => {
        toast(message, 'error')
        navigate('/')
        setCartOpen(true)
      }}
      checkoutItemIds={checkoutItemIds}
    />
  )
}

function OrderRoute() {
  const { id } = useParams()
  const navigate = useNavigate()
  const orderId = Number(id)
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return <Navigate to="/" replace />
  }
  return <OrderDetailsPage orderId={orderId} onBack={() => navigate('/')} />
}

function LegalRoute({ onNavigate }: { onNavigate: (target: string, anchor?: string) => void }) {
  const { section } = useParams()
  const navigate = useNavigate()
  const valid: LegalSection[] = ['cookies-definitions', 'cookies', 'privacy', 'terms']
  const current = valid.includes(section as LegalSection) ? (section as LegalSection) : 'cookies'
  return <LegalPage section={current} onBack={() => navigate('/')} onNavigate={onNavigate} />
}

interface TopBarProps {
  onMenuClick: () => void
  onSearch: (query: string) => void
  onLogoClick: () => void
  onAddresses?: () => void
  onFavorites?: () => void
  onLoginClick: () => void
  onOrders?: () => void
}

interface StoreChromeProps extends TopBarProps {
  children: ReactNode
}

function StoreChrome({ children, ...topBar }: StoreChromeProps) {
  return (
    <div className="w-full bg-card min-h-screen flex flex-col">
      <TopBar {...topBar} />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}