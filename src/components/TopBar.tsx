import { useState, useRef, useEffect, useMemo } from 'react'
import { Menu, Search, CircleUser, User, Heart, ShoppingCart, X, ArrowLeft, Clock, Trash2, LogOut, Package, MapPin } from 'lucide-react'
import { useProducts } from '../context/ProductsContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

interface TopBarProps {
  onMenuClick: () => void
  onSearch: (query: string) => void
  onLogoClick: () => void
  onAddresses?: () => void
  onFavorites?: () => void
  onLoginClick: () => void
}

const HISTORY_KEY = 'arua-search-history'
const MAX_HISTORY = 5

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(history: string[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export default function TopBar({ onMenuClick, onSearch, onLogoClick, onAddresses, onFavorites, onLoginClick }: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const { totalItems, setCartOpen, resetCart } = useCart()
  const { products } = useProducts()
  const { user, logout } = useAuth()
  const [query, setQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>(loadHistory)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [searchOpen])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  const suggestions = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return products
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 3)
  }, [query, products])

  function addToHistory(term: string) {
    const trimmed = term.trim()
    if (!trimmed) return
    const next = [trimmed, ...searchHistory.filter((h) => h !== trimmed)].slice(0, MAX_HISTORY)
    setSearchHistory(next)
    saveHistory(next)
  }

  function removeFromHistory(term: string) {
    const next = searchHistory.filter((h) => h !== term)
    setSearchHistory(next)
    saveHistory(next)
  }

  function handleSubmit(term: string) {
    addToHistory(term)
    setSearchOpen(false)
    setQuery('')
    onSearch(term)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 w-full h-16 md:h-20 flex flex-row justify-between items-center bg-card border-b-2 border-neutral-400 px-4 md:px-6">
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center h-12 px-2 md:px-6 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <Menu size={24} className="text-foreground-primary" />
          </div>
        </button>

        <button onClick={onLogoClick} className="flex items-center justify-center h-12 cursor-pointer">
          <span className="text-primary font-heading text-xl md:text-[28px] font-semibold leading-tight">
            Bikini Store
          </span>
        </button>

        <div className="flex items-center h-12 gap-0 md:gap-1">
          <button
            onClick={() => {
              if (searchOpen) onSearch('')
              setSearchOpen(!searchOpen)
            }}
            className="w-11 h-11 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
          >
            <Search size={24} className="text-foreground-secondary" />
          </button>
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-11 h-11 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
              >
                <CircleUser size={24} className="text-foreground-primary" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-card rounded-xl shadow-lg border border-border py-2 animate-slide-up">
                  <div className="px-4 py-2 border-b border-border">
                    <span className="font-body text-xs text-foreground-secondary">Olá,</span>
                    <p className="font-body text-sm font-semibold text-foreground-primary truncate">{user.name}</p>
                  </div>
                  <button
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-foreground-primary hover:bg-surface transition-colors cursor-pointer"
                  >
                    <Package size={16} className="text-foreground-secondary" />
                    Meus Pedidos
                  </button>
                  <button
                    onClick={() => { onAddresses?.(); setUserMenuOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-foreground-primary hover:bg-surface transition-colors cursor-pointer"
                  >
                    <MapPin size={16} className="text-foreground-secondary" />
                    Os Meus Endereços
                  </button>
                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={() => { logout(); resetCart(); setUserMenuOpen(false) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-destructive hover:bg-surface transition-colors cursor-pointer"
                    >
                      <LogOut size={16} className="text-destructive" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="w-11 h-11 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
            >
              <User size={24} className="text-foreground-secondary" />
            </button>
          )}
          <button
            onClick={onFavorites}
            className="w-11 h-11 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
          >
            <Heart size={24} className="text-foreground-secondary" />
          </button>
          <button
            onClick={() => setCartOpen(true)}
            className="w-12 h-11 flex items-center justify-center relative cursor-pointer hover:opacity-70 transition-opacity"
          >
            <ShoppingCart size={24} className="text-foreground-secondary" />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 w-[18px] h-[18px] bg-destructive text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {searchOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => { setSearchOpen(false); onSearch('') }}
        />
      )}

      <div
        className={`fixed top-0 left-0 w-full bg-card shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          searchOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center h-16 md:h-20 px-4 md:px-6 border-b border-border">
          <button
            onClick={() => { setSearchOpen(false); onSearch('') }}
            className="flex items-center justify-center w-11 h-11 cursor-pointer hover:opacity-70 transition-opacity shrink-0"
          >
            <ArrowLeft size={20} className="text-foreground-secondary" />
          </button>
          <div className="flex items-center flex-1 bg-surface rounded-full px-4 h-11 mx-3">
            <Search size={18} className="text-foreground-secondary shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit(query)
              }}
              placeholder="Buscar produtos..."
              className="flex-1 bg-transparent border-none outline-none font-body text-sm text-foreground-primary placeholder-foreground-secondary/60 px-3"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="cursor-pointer hover:opacity-70 transition-opacity shrink-0"
              >
                <X size={18} className="text-foreground-secondary" />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-4 md:px-6 py-4">
          {query.trim() ? (
            suggestions.length > 0 ? (
              <div>
                <span className="font-body text-xs font-semibold text-foreground-secondary/60 uppercase tracking-wider">
                  Sugestões
                </span>
                <div className="flex flex-col mt-2 gap-1">
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSubmit(p.name)}
                      className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-surface transition-colors text-left cursor-pointer"
                    >
                      <Search size={16} className="text-foreground-secondary shrink-0" />
                      <span className="font-body text-sm text-foreground-primary">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Search size={32} className="text-foreground-secondary/30 mb-3" />
                <span className="font-body text-sm text-foreground-secondary/60">
                  Nenhum resultado para &ldquo;{query}&rdquo;
                </span>
              </div>
            )
          ) : searchHistory.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-body text-xs font-semibold text-foreground-secondary/60 uppercase tracking-wider">
                  Pesquisas recentes
                </span>
                <button
                  onClick={() => { setSearchHistory([]); localStorage.removeItem(HISTORY_KEY) }}
                  className="font-body text-xs text-foreground-secondary/60 hover:text-destructive transition-colors cursor-pointer"
                >
                  Limpar
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {searchHistory.map((term) => (
                  <div
                    key={term}
                    className="flex items-center gap-3 w-full px-3 py-3 rounded-lg hover:bg-surface transition-colors group"
                  >
                    <Clock size={16} className="text-foreground-secondary shrink-0" />
                    <button
                      onClick={() => handleSubmit(term)}
                      className="flex-1 text-left font-body text-sm text-foreground-primary cursor-pointer"
                    >
                      {term}
                    </button>
                    <button
                      onClick={() => removeFromHistory(term)}
                      className="opacity-0 group-hover:opacity-100 cursor-pointer hover:opacity-70 transition-opacity shrink-0"
                    >
                      <Trash2 size={16} className="text-foreground-secondary/60 hover:text-destructive transition-colors" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Search size={32} className="text-foreground-secondary/30 mb-3" />
              <span className="font-body text-sm text-foreground-secondary/60">
                Digite algo para buscar produtos
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
