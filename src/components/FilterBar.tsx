import { SlidersHorizontal, X } from 'lucide-react'
import { cn } from '../lib/utils'

interface FilterBarProps {
  open: boolean
  onToggle: () => void
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
}

const sortOptions = [
  { value: 'default', label: 'Padrão' },
  { value: 'price-asc', label: 'Preço: Menor para Maior' },
  { value: 'price-desc', label: 'Preço: Maior para Menor' },
  { value: 'name-asc', label: 'Nome: A-Z' },
  { value: 'name-desc', label: 'Nome: Z-A' },
]

export default function FilterBar({ open, onToggle, sortBy, onSortChange, activeFilters, heading, colors, activeColor, onColorChange, sizes, activeSize, onSizeChange, onClearFilters }: FilterBarProps) {
  return (
    <div className="w-full bg-card">
      <div className="flex items-center justify-between h-15 px-4 md:px-6">
        <h1 key={heading} className="font-heading text-[28px] font-semibold text-foreground-primary leading-tight animate-fade-in">
          {heading}
        </h1>
        <button
          onClick={onToggle}
          className="flex items-center gap-2 h-11 rounded-full px-6 cursor-pointer hover:opacity-70 transition-opacity relative"
        >
          <SlidersHorizontal size={20} className="text-foreground-secondary" />
          <span className="font-body text-sm font-medium text-foreground-secondary">
            Filtros
          </span>
          {activeFilters > 0 && (
            <span className="w-5 h-5 bg-foreground-primary text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={onToggle}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 bg-card shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <span className="font-heading text-lg font-semibold text-foreground-primary">Ordenar por</span>
          <button onClick={onToggle} className="cursor-pointer hover:opacity-70 transition-opacity">
            <X size={20} className="text-foreground-secondary" />
          </button>
        </div>

        {colors.length > 0 && (
          <div className="flex flex-col px-4 pt-4 pb-2">
            <span className="font-body text-xs font-semibold text-foreground-secondary/60 uppercase tracking-wider mb-2">
              Cor
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => onColorChange(color)}
                  className={`w-7 h-7 rounded-full cursor-pointer hover:scale-110 transition-transform ${
                    color === activeColor ? 'ring-2 ring-foreground-primary ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
        {sizes.length > 0 && (
          <div className="flex flex-col px-4 pt-4 pb-2 border-t border-border">
            <span className="font-body text-xs font-semibold text-foreground-secondary/60 uppercase tracking-wider mb-2">
              Tamanho
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => onSizeChange(size)}
                  className={`px-3 py-1 rounded-full text-sm font-body cursor-pointer hover:scale-105 transition-transform text-black ${
                    activeSize.includes(size)
                      ? 'bg-neutral-400'
                      : 'bg-neutral-100'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col px-4 pb-4 pt-2 gap-1 border-t border-border">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => { onSortChange(option.value); onToggle(); }}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg font-body text-sm transition-colors cursor-pointer',
                sortBy === option.value
                  ? 'bg-foreground-primary/10 text-foreground-primary font-semibold'
                  : 'text-foreground-secondary hover:bg-surface hover:text-foreground-primary'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        {activeFilters > 0 && (
          <div className="px-4 pb-4">
            <button
              onClick={() => { onClearFilters(); onToggle(); }}
              className="w-full text-center px-4 py-3 rounded-lg font-body text-sm font-semibold text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
            >
              Remover filtros
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
