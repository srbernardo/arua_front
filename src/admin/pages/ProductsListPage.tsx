import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search, RefreshCw, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import {
  adminApi,
  type Paginated,
  type PaginationMeta,
  errorMessage,
} from '../../lib/adminApi'
import { useToast } from '../../lib/toast'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import Spinner from '../components/Spinner'

interface AdminProduct {
  id: number
  name: string
  price: number
  category: { slug: string; name: string }
  variants: { id: number; size: string; color: string; stock: number; sku: string }[]
  images: { id: number; url: string; filename: string }[]
}

interface AdminCategory {
  id: number
  slug: string
  name: string
}

type LoadState = 'loading' | 'ready' | 'error'

type SortField = 'name' | 'price' | 'category' | 'stock' | 'variants_count'

interface SortState {
  field: SortField
  direction: 'asc' | 'desc'
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value)
}

const EMPTY_META: PaginationMeta = { page: 1, per_page: 20, total: 0, total_pages: 0 }

const SORTABLE_COLUMNS: { field: SortField; label: string; align?: 'right' }[] = [
  { field: 'name', label: 'Produto' },
  { field: 'category', label: 'Categoria' },
  { field: 'price', label: 'Preço', align: 'right' },
  { field: 'stock', label: 'Stock total', align: 'right' },
  { field: 'variants_count', label: 'Variantes', align: 'right' },
]

export default function ProductsListPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META)
  const [state, setState] = useState<LoadState>('loading')
  const [refreshing, setRefreshing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const hasLoaded = useRef(false)

  const [query, setQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<SortState>({ field: 'name', direction: 'asc' })

  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    const isFirst = !hasLoaded.current
    if (isFirst) setState('loading')
    else setRefreshing(true)
    try {
      const [productRes, categoryRes] = await Promise.all([
        adminApi.get<Paginated<AdminProduct>>('/admin/products', {
          page,
          per_page: 20,
          q: query || undefined,
          category: categoryFilter || undefined,
          sort: sort.field,
          direction: sort.direction,
        }),
        adminApi.get<AdminCategory[]>('/admin/categories'),
      ])
      setProducts(productRes.data)
      setMeta(productRes.meta)
      setCategories(categoryRes)
      hasLoaded.current = true
      setState('ready')
    } catch (err) {
      setErrorMsg(errorMessage(err, 'Não foi possível carregar os produtos.'))
      if (isFirst) {
        setState('error')
      } else {
        toast(errorMessage(err, 'Não foi possível atualizar os produtos.'), 'error')
      }
    } finally {
      setRefreshing(false)
    }
  }, [page, query, categoryFilter, sort, toast])

  useEffect(() => {
    load()
  }, [load])

  function handleSortChange(field: SortField) {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
    setPage(1)
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setQuery(searchInput.trim())
    setPage(1)
  }

  function handleCategoryChange(value: string) {
    setCategoryFilter(value)
    setPage(1)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminApi.delete(`/admin/products/${deleteTarget.id}`)
      toast('Produto eliminado.')
      setDeleteTarget(null)
      if (products.length === 1 && page > 1) setPage(page - 1)
      else load()
    } catch (err) {
      toast(errorMessage(err, 'Não foi possível eliminar o produto.'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-5xl flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-gray-900">Produtos</h1>
          <p className="font-body text-sm text-gray-500 mt-1">
            {meta.total} produto{meta.total === 1 ? '' : 's'} no catálogo
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/produtos/novo')}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-gray-900 text-white font-body text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <Plus size={16} /> Novo produto
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-52">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Procurar por nome…"
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-white border border-gray-200 text-sm font-body text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
          />
        </form>
        <select
          value={categoryFilter}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="h-10 px-3 rounded-lg bg-white border border-gray-200 text-sm font-body text-gray-900 outline-none focus:border-gray-400 transition-colors cursor-pointer"
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {state === 'loading' && <Spinner label="A carregar produtos…" />}

      {state === 'error' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
          <p className="font-body text-sm text-red-600">{errorMsg}</p>
          <button
            onClick={load}
            className="mt-4 inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-gray-900 text-white font-body text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} /> Tentar novamente
          </button>
        </div>
      )}

      {state === 'ready' &&
        (products.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <EmptyState
              title="Nenhum produto encontrado"
              description="Ajuste a pesquisa ou os filtros, ou crie um novo produto."
            />
          </div>
        ) : (
          <div
            aria-busy={refreshing}
            className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto transition-opacity ${
              refreshing ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  {SORTABLE_COLUMNS.map(({ field, label, align }) => {
                    const active = sort.field === field
                    return (
                      <th
                        key={field}
                        className={`px-5 py-3 font-body text-xs font-semibold text-gray-500 ${
                          align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <button
                          onClick={() => handleSortChange(field)}
                          className={`inline-flex items-center gap-1 hover:text-gray-900 transition-colors cursor-pointer ${
                            align === 'right' ? 'flex-row-reverse' : ''
                          } ${active ? 'text-gray-900' : ''}`}
                          title={`Ordenar por ${label.toLowerCase()}`}
                        >
                          {label}
                          {active ? (
                            sort.direction === 'asc' ? (
                              <ChevronUp size={13} className="text-gray-500" />
                            ) : (
                              <ChevronDown size={13} className="text-gray-500" />
                            )
                          ) : (
                            <ChevronsUpDown size={12} className="text-gray-300" />
                          )}
                        </button>
                      </th>
                    )
                  })}
                  <th className="px-5 py-3 font-body text-xs font-semibold text-gray-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => {
                  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {product.images[0] ? (
                            <img
                              src={product.images[0].url}
                              alt=""
                              className="w-10 h-12 rounded-lg object-cover border border-gray-100 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-12 rounded-lg bg-gray-100 border border-gray-100 shrink-0" />
                          )}
                          <button
                            onClick={() => navigate(`/admin/produtos/${product.id}/editar`)}
                            className="font-body text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors text-left cursor-pointer"
                          >
                            {product.name}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-body text-xs text-gray-500">{product.category.name}</td>
                      <td className="px-5 py-3 font-body text-sm text-gray-900 text-right whitespace-nowrap">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-5 py-3 font-body text-sm text-gray-900 text-right">{totalStock}</td>
                      <td className="px-5 py-3 font-body text-sm text-gray-900 text-right">
                        {product.variants.length}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/admin/produtos/${product.id}/editar`)}
                            title="Editar"
                            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            title="Eliminar"
                            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="px-4">
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          </div>
        ))}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar produto"
        message={
          deleteTarget
            ? `Tem a certeza de que pretende eliminar "${deleteTarget.name}"? Esta ação não pode ser desfeita.`
            : ''
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}