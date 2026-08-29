import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationMeta } from '../../lib/adminApi'

interface PaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

export default function Pagination({ meta, onPageChange }: PaginationProps) {
  if (meta.total_pages <= 1) return null

  const { page, total_pages, total } = meta
  const from = total === 0 ? 0 : (page - 1) * meta.per_page + 1
  const to = Math.min(page * meta.per_page, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-4 pb-1">
      <p className="font-body text-xs text-gray-500">
        {from}–{to} de {total}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-8 px-2.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>
        {page > 2 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="h-8 px-2.5 rounded-lg font-body text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              1
            </button>
            {page > 3 && <span className="font-body text-xs text-gray-400 px-0.5">…</span>}
          </>
        )}
        {Array.from({ length: total_pages }, (_, i) => i + 1)
          .filter((p) => Math.abs(p - page) <= 1)
          .map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`h-8 px-3 rounded-lg font-body text-xs font-medium transition-colors cursor-pointer ${
                p === page
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          ))}
        {page < total_pages - 1 && (
          <>
            {page < total_pages - 2 && <span className="font-body text-xs text-gray-400 px-0.5">…</span>}
            <button
              onClick={() => onPageChange(total_pages)}
              className="h-8 px-2.5 rounded-lg font-body text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {total_pages}
            </button>
          </>
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= total_pages}
          className="h-8 px-2.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Página seguinte"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}