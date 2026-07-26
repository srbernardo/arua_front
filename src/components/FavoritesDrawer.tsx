import { useState } from 'react'
import { X, Heart, Trash2, ShoppingBag } from 'lucide-react'
import { useFavorites } from '../context/FavoritesContext'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../context/ProductsContext'
import AddToCartModal from './AddToCartModal'
import type { Product } from '../types'

interface FavoritesDrawerProps {
  open: boolean
  onClose: () => void
}

export default function FavoritesDrawer({ open, onClose }: FavoritesDrawerProps) {
  const { favorites, loading, toggleFavorite } = useFavorites()
  const { user } = useAuth()
  const { products } = useProducts()
  const [modalProduct, setModalProduct] = useState<Product | null>(null)

  const fullProducts = favorites
    .map((fav) => {
      const full = products.find((p) => p.id === fav.product.id)
      if (full) return { favorite: fav, product: full }
      return null
    })
    .filter(Boolean) as { favorite: typeof favorites[0]; product: Product }[]

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 transition-opacity" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-semibold text-black">Os Meus Favoritos</span>
            {favorites.length > 0 && (
              <span className="px-2 py-0.5 bg-neutral-100 rounded-full font-body text-xs font-medium text-neutral-500">
                {favorites.length}
              </span>
            )}
          </div>
          <button onClick={onClose} className="cursor-pointer hover:opacity-70 transition-opacity">
            <X size={20} className="text-neutral-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !user ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center mb-4">
                <Heart size={24} className="text-foreground-secondary/30" />
              </div>
              <span className="font-body text-sm text-foreground-secondary/60">
                Inicie sessão para ver os seus favoritos
              </span>
            </div>
          ) : favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center mb-4">
                <Heart size={24} className="text-foreground-secondary/30" />
              </div>
              <span className="font-body text-sm text-foreground-secondary/60">
                Ainda não tem favoritos
              </span>
              <span className="font-body text-xs text-foreground-secondary/40 mt-1">
                Toque no coração nos produtos para guardar
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {fullProducts.map(({ favorite, product }) => (
                <div
                  key={favorite.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-neutral-200 bg-white"
                >
                  <button
                    onClick={() => { setModalProduct(product); onClose() }}
                    className="w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-surface cursor-pointer"
                  >
                    <img
                      src={favorite.product.image_url ?? product.images_by_color[0]?.images[0]?.url ?? ''}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="font-body text-[10px] text-neutral-400 uppercase tracking-wider">
                      {favorite.product.category}
                    </span>
                    <p className="font-body text-sm font-medium text-black truncate">{product.name}</p>
                    <span className="font-heading text-sm font-semibold text-black">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <button
                      onClick={() => setModalProduct(product)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-surface hover:bg-foreground-primary hover:text-white transition-colors cursor-pointer"
                      title="Adicionar ao carrinho"
                    >
                      <ShoppingBag size={14} />
                    </button>
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-surface hover:bg-red-50 transition-colors cursor-pointer group"
                      title="Remover dos favoritos"
                    >
                      <Trash2 size={14} className="text-neutral-400 group-hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modalProduct && (
        <AddToCartModal
          product={modalProduct}
          isOpen={!!modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}
    </>
  )
}
