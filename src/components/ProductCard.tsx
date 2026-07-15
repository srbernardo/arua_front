import { useState } from 'react'
import { Heart, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product } from '../types'
import { useCart } from '../context/CartContext'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imgIndex, setImgIndex] = useState(0)
  const { addItem, setCartOpen } = useCart()

  function prevImage(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    setImgIndex((i) => (i === 0 ? product.images.length - 1 : i - 1))
  }

  function nextImage(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    setImgIndex((i) => (i === product.images.length - 1 ? 0 : i + 1))
  }

  return (
    <div className="w-full flex flex-col bg-card overflow-hidden">
      <div className="w-full aspect-[4/5] relative overflow-hidden group">
        <button className="w-full h-full cursor-pointer overflow-hidden">
          <div
            className="flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${imgIndex * 100}%)` }}
          >
            {product.images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={product.name}
                className="w-full h-full object-cover shrink-0"
              />
            ))}
          </div>
        </button>

        {product.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md hover:bg-white z-10"
            >
              <ChevronLeft size={18} className="text-foreground-primary" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md hover:bg-white z-10"
            >
              <ChevronRight size={18} className="text-foreground-primary" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {product.images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); setImgIndex(i) }}
                  className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                    i === imgIndex ? 'bg-white w-3' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); addItem(product); setCartOpen(true) }}
          className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-95 cursor-pointer shadow-md hover:bg-primary group/btn transition-colors z-10"
        >
          <Plus size={20} className="text-foreground-primary group-hover/btn:text-white transition-colors" />
        </button>
      </div>

      <div className="flex flex-col gap-2 md:gap-3 p-3 md:p-4">
        <div className="flex justify-between items-center w-full">
          <span className="font-heading text-base font-semibold text-foreground-primary leading-tight">
            {product.name}
          </span>
          <button className="w-6 h-6 flex items-center justify-center opacity-95 cursor-pointer hover:opacity-60 transition-opacity group/heart">
            <Heart size={18} className="text-foreground-secondary group-hover/heart:text-red-500 transition-colors" />
          </button>
        </div>

        <span className="text-primary font-heading text-lg font-bold leading-tight">
          ${product.price.toFixed(2)}
        </span>

        <div className="flex items-center gap-2 h-6">
          {product.colors.map((color, i) => (
            <button
              key={i}
              className="w-5 h-5 rounded-sm cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={`Color ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
