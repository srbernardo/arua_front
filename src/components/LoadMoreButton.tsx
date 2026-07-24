import { ChevronDown } from 'lucide-react'

interface LoadMoreButtonProps {
  onLoadMore: () => void
}

export default function LoadMoreButton({ onLoadMore }: LoadMoreButtonProps) {
  return (
    <div className="w-full flex items-center justify-center h-20 pt-8">
      <button
        onClick={onLoadMore}
        className="flex items-center justify-center gap-2 h-13 w-[280px] rounded-full border-2 border-foreground-primary bg-transparent cursor-pointer hover:bg-foreground-primary hover:text-white transition-colors group"
      >
        <span className="font-body text-sm font-semibold text-foreground-primary group-hover:text-white transition-colors">
          Carregar mais produtos
        </span>
        <ChevronDown size={18} className="text-foreground-primary group-hover:text-white transition-colors" />
      </button>
    </div>
  )
}
