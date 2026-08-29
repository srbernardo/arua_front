import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2, RefreshCw } from 'lucide-react'
import { adminApi, errorMessage } from '../../lib/adminApi'
import { useToast } from '../../lib/toast'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import Spinner from '../components/Spinner'

interface AdminCategory {
  id: number
  slug: string
  name: string
  product_count: number
}

type LoadState = 'loading' | 'ready' | 'error'

export default function CategoriesPage() {
  const { toast } = useToast()

  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminCategory | null>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setState('loading')
    try {
      const data = await adminApi.get<AdminCategory[]>('/admin/categories')
      setCategories(data)
      setState('ready')
    } catch (err) {
      setErrorMsg(errorMessage(err, 'Não foi possível carregar as categorias.'))
      setState('error')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setEditing(null)
    setName('')
    setModalOpen(true)
  }

  function openEdit(category: AdminCategory) {
    setEditing(category)
    setName(category.name)
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast('Indique o nome da categoria.', 'error')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await adminApi.patch(`/admin/categories/${editing.slug}`, { category: { name: name.trim() } })
        toast('Categoria atualizada.')
      } else {
        const slug = name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        await adminApi.post('/admin/categories', { category: { name: name.trim(), slug } })
        toast('Categoria criada.')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast(errorMessage(err, 'Não foi possível guardar a categoria.'), 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminApi.delete(`/admin/categories/${deleteTarget.slug}`)
      toast('Categoria eliminada.')
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast(errorMessage(err, 'Não foi possível eliminar a categoria.'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-3xl flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-gray-900">Categorias</h1>
          <p className="font-body text-sm text-gray-500 mt-1">
            {categories.length} categoria{categories.length === 1 ? '' : 's'}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-gray-900 text-white font-body text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <Plus size={16} /> Nova categoria
        </button>
      </div>

      {state === 'loading' && <Spinner label="A carregar categorias…" />}

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
        (categories.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <EmptyState title="Sem categorias" description="Crie a primeira categoria da loja." />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-50">
              {categories.map((category) => (
                <li key={category.slug} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="font-body text-sm font-medium text-gray-900 truncate">{category.name}</p>
                    <p className="font-body text-xs text-gray-400">{category.slug}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-body text-xs text-gray-500">
                      {category.product_count} produto{category.product_count === 1 ? '' : 's'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEdit(category)}
                        title="Editar"
                        className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(category)}
                        title="Eliminar"
                        className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}

      <Modal open={modalOpen} title={editing ? 'Editar categoria' : 'Nova categoria'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-xs font-medium text-gray-600">Nome</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="Ex.: Biquínis"
              className="h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm font-body text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="h-9 px-4 rounded-lg font-body text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-4 rounded-lg font-body text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? 'A guardar…' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar categoria"
        message={
          deleteTarget
            ? `Tem a certeza de que pretende eliminar "${deleteTarget.name}"?`
            : ''
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}