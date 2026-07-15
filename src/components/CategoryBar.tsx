import { categories as initialCategories } from '../data/products'
import { cn } from '../lib/utils'

interface CategoryBarProps {
  activeCategory: string
  onCategoryChange: (id: string) => void
}

export default function CategoryBar({ activeCategory, onCategoryChange }: CategoryBarProps) {
  return (
    <nav className="w-full h-14 flex items-center gap-4 px-4 md:px-10 py-2 overflow-x-auto scrollbar-hide">
      {initialCategories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className="relative h-9 flex items-center shrink-0 cursor-pointer"
        >
          <span
            className={cn(
              'font-body text-sm leading-tight transition-colors',
              cat.id === activeCategory
                ? 'text-foreground-primary font-semibold'
                : 'text-foreground-secondary font-medium hover:text-foreground-primary'
            )}
          >
            {cat.name}
          </span>
          {cat.id === activeCategory && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60px] h-[3px] bg-primary rounded-full" />
          )}
        </button>
      ))}
    </nav>
  )
}
