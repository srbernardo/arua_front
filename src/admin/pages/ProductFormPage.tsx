import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, Upload, RefreshCw, ArrowLeft } from 'lucide-react'
import { adminApi, isApiError, errorMessage } from '../../lib/adminApi'
import { useToast } from '../../lib/toast'
import Spinner from '../components/Spinner'

interface AdminProduct {
  id: number
  name: string
  price: number
  sizes: string[]
  colors: string[]
  image_colors: Record<string, number[]>
  category: { slug: string; name: string }
  category_id: number
  variants: { id: number; size: string; color: string; stock: number; sku: string }[]
  images: { id: number; url: string; filename: string }[]
}

interface AdminCategory {
  id: number
  slug: string
  name: string
}

interface VariantDraft {
  key: string
  id?: number
  size: string
  color: string
  stock: string
  sku: string
}

type LoadState = 'loading' | 'ready' | 'error'

const COLOR_OPTIONS = ['#D4916E', '#F3EBE2', '#C4CFDE', '#000000', '#FFFFFF', '#7A7A7A']

export default function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [variants, setVariants] = useState<VariantDraft[]>([])
  const [existingImages, setExistingImages] = useState<AdminProduct['images']>([])
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([])
  const [newFiles, setNewFiles] = useState<{ key: string; file: File }[]>([])
  const [colorByKey, setColorByKey] = useState<Record<string, string>>({})
  const [state, setState] = useState<LoadState>(isEdit ? 'loading' : 'ready')
  const [errorMsg, setErrorMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [variantError, setVariantError] = useState('')

  const load = useCallback(async () => {
    try {
      const [categoryRes, productRes] = await Promise.all([
        adminApi.get<AdminCategory[]>('/admin/categories'),
        isEdit ? adminApi.get<AdminProduct>(`/admin/products/${id}`) : Promise.resolve(null),
      ])
      setCategories(categoryRes)

      if (productRes) {
        setName(productRes.name)
        setPrice(String(productRes.price))
        setCategoryId(String(productRes.category_id))
        setVariants(
          productRes.variants.map((v) => ({
            key: crypto.randomUUID(),
            id: v.id,
            size: v.size,
            color: v.color,
            stock: String(v.stock),
            sku: v.sku,
          }))
        )
        setExistingImages(productRes.images)
        setColorByKey(buildInitialMapping(productRes))
      }
      setState('ready')
    } catch (err) {
      if (isApiError(err) && err.status === 401) return
      setErrorMsg(errorMessage(err, 'Não foi possível carregar o produto.'))
      setState('error')
    }
  }, [id, isEdit])

  useEffect(() => {
    load()
  }, [load])

  const availableColors = useMemo(() => {
    const fromVariants = new Set(variants.map((v) => v.color.trim()).filter(Boolean))
    return Array.from(new Set([...fromVariants, ...COLOR_OPTIONS]))
  }, [variants])

  function buildInitialMapping(product: AdminProduct): Record<string, string> {
    const mapping: Record<string, string> = {}
    if (product.image_colors && typeof product.image_colors === 'object') {
      for (const [color, indices] of Object.entries(product.image_colors)) {
        for (const index of indices) {
          const image = product.images[index]
          if (image) mapping[`existing:${image.id}`] = color
        }
      }
    }
    return mapping
  }

  function handleAddVariant() {
    setVariantError('')
    setVariants((prev) => [
      ...prev,
      { key: crypto.randomUUID(), size: '', color: '', stock: '0', sku: '' },
    ])
  }

  function handleUpdateVariant(key: string, field: keyof VariantDraft, value: string) {
    setVariantError('')
    setVariants((prev) => prev.map((v) => (v.key === key ? { ...v, [field]: value } : v)))
  }

  function handleRemoveVariant(key: string) {
    setVariantError('')
    setVariants((prev) => prev.filter((v) => v.key !== key))
  }

  function validateVariants(): string | null {
    const seen = new Set<string>()
    for (const v of variants) {
      if (!v.size.trim() || !v.color.trim()) return 'Cada variante precisa de tamanho e cor.'
      if (Number(v.stock) < 0 || Number.isNaN(Number(v.stock))) return 'O stock deve ser um número igual ou superior a 0.'
      const combo = `${v.size.trim().toLowerCase()}|${v.color.trim().toLowerCase()}`
      if (seen.has(combo)) return `Variante duplicada: ${v.size.trim()} / ${v.color.trim()}.`
      seen.add(combo)
    }
    return null
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setNewFiles((prev) => [...prev, ...files.map((file) => ({ key: crypto.randomUUID(), file }))])
    e.target.value = ''
  }

  function handleRemoveNewFile(key: string) {
    setNewFiles((prev) => prev.filter((f) => f.key !== key))
  }

  function handleRemoveExistingImage(imgId: number) {
    setRemovedImageIds((prev) => (prev.includes(imgId) ? prev : [...prev, imgId]))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const duplicateError = validateVariants()
    if (duplicateError) {
      setVariantError(duplicateError)
      return
    }
    if (!name.trim()) {
      toast('Indique o nome do produto.', 'error')
      return
    }
    if (!price || Number(price) <= 0) {
      toast('Indique um preço válido.', 'error')
      return
    }
    if (!categoryId) {
      toast('Selecione uma categoria.', 'error')
      return
    }

    // Every remaining image must be mapped to a color (backend enforces the
    // same rule on save).
    const keptImages = existingImages.filter((img) => !removedImageIds.includes(img.id))
    const orderedKeys = [
      ...keptImages.map((img) => `existing:${img.id}`),
      ...newFiles.map((f) => f.key),
    ]
    const unmapped = orderedKeys.filter((key) => !colorByKey[key])
    if (unmapped.length > 0) {
      toast('Atribua uma cor a cada imagem antes de guardar.', 'error')
      return
    }

    const imageColors: Record<string, number[]> = {}
    orderedKeys.forEach((key, index) => {
      const color = colorByKey[key]
      if (!color) return
      imageColors[color] = imageColors[color] ? [...imageColors[color], index] : [index]
    })

    const formData = new FormData()
    formData.append('product[name]', name.trim())
    formData.append('product[price]', price)
    formData.append('product[category_id]', categoryId)
    formData.append('product[variants]', JSON.stringify(variants.map(cleanVariant)))
    formData.append('product[image_colors]', JSON.stringify(imageColors))
    newFiles.forEach((f) => formData.append('product[images][]', f.file))
    removedImageIds.forEach((imgId) => formData.append('product[remove_image_ids][]', String(imgId)))

    setSubmitting(true)
    try {
      if (isEdit) {
        await adminApi.upload(`/admin/products/${id}`, formData, 'PATCH')
        toast('Produto atualizado.')
      } else {
        await adminApi.upload('/admin/products', formData, 'POST')
        toast('Produto criado.')
      }
      navigate('/admin/produtos')
    } catch (err) {
      toast(errorMessage(err, 'Não foi possível guardar o produto.'), 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (state === 'loading') return <Spinner label="A carregar produto…" />

  if (state === 'error') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
        <p className="font-body text-sm text-red-600">{errorMsg}</p>
        <button
          onClick={load}
          className="mt-4 inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-gray-900 text-white font-body text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} /> Tentar novamente
        </button>
      </div>
    )
  }

  const keptImages = existingImages.filter((img) => !removedImageIds.includes(img.id))
  const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/produtos')}
            className="inline-flex items-center gap-1.5 font-body text-xs text-gray-500 hover:text-gray-900 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft size={14} /> Voltar aos produtos
          </button>
          <h1 className="font-heading text-2xl font-semibold text-gray-900">
            {isEdit ? `Editar produto #${id}` : 'Novo produto'}
          </h1>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="h-10 px-5 rounded-lg bg-gray-900 text-white font-body text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'A guardar…' : isEdit ? 'Guardar alterações' : 'Criar produto'}
        </button>
      </div>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
        <h2 className="font-body text-sm font-semibold text-gray-900">Informação base</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-xs font-medium text-gray-600">Nome</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Classic High-Waisted"
              className="h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm font-body text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-body text-xs font-medium text-gray-600">Preço (€)</span>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm font-body text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
            />
          </label>
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="font-body text-xs font-medium text-gray-600">Categoria</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-sm font-body text-gray-900 outline-none focus:border-gray-400 transition-colors cursor-pointer"
            >
              <option value="">Selecionar categoria…</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-body text-sm font-semibold text-gray-900">Variantes</h2>
            <p className="font-body text-xs text-gray-500 mt-0.5">
              {variants.length} variante{variants.length === 1 ? '' : 's'} · stock total {totalStock}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddVariant}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 text-gray-700 font-body text-xs font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Plus size={14} /> Adicionar variante
          </button>
        </div>

        {variantError && <p className="font-body text-xs text-red-600">{variantError}</p>}

        {variants.length === 0 ? (
          <p className="font-body text-sm text-gray-400 text-center py-6">
            Ainda sem variantes. Adicione tamanho, cor e stock.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {variants.map((variant) => (
              <div
                key={variant.key}
                className="grid grid-cols-2 lg:grid-cols-[1fr_1fr_0.8fr_1.2fr_auto] gap-3 items-end border border-gray-100 rounded-lg p-3 min-w-0"
              >
                <label className="flex flex-col gap-1 min-w-0">
                  <span className="font-body text-[11px] font-medium text-gray-500">Tamanho</span>
                  <input
                    value={variant.size}
                    onChange={(e) => handleUpdateVariant(variant.key, 'size', e.target.value)}
                    placeholder="Ex.: M"
                    className="h-9 w-full min-w-0 px-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm font-body text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
                  />
                </label>
                <label className="flex flex-col gap-1 min-w-0">
                  <span className="font-body text-[11px] font-medium text-gray-500">Cor</span>
                  <div className="flex gap-1.5 min-w-0">
                    <input
                      value={variant.color}
                      onChange={(e) => handleUpdateVariant(variant.key, 'color', e.target.value)}
                      placeholder="#D4916E"
                      className="h-9 w-full flex-1 min-w-0 px-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-body text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
                    />
                    <input
                      type="color"
                      value={/^#[0-9a-fA-F]{6}$/.test(variant.color) ? variant.color : '#000000'}
                      onChange={(e) => handleUpdateVariant(variant.key, 'color', e.target.value)}
                      className="h-9 w-9 shrink-0 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer"
                      aria-label="Escolher cor"
                    />
                  </div>
                </label>
                <label className="flex flex-col gap-1 min-w-0">
                  <span className="font-body text-[11px] font-medium text-gray-500">Stock</span>
                  <input
                    value={variant.stock}
                    onChange={(e) => handleUpdateVariant(variant.key, 'stock', e.target.value)}
                    type="number"
                    min="0"
                    className="h-9 w-full min-w-0 px-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm font-body text-gray-900 outline-none focus:border-gray-400 transition-colors"
                  />
                </label>
                <label className="flex flex-col gap-1 min-w-0">
                  <span className="font-body text-[11px] font-medium text-gray-500">SKU</span>
                  <input
                    value={variant.sku}
                    onChange={(e) => handleUpdateVariant(variant.key, 'sku', e.target.value)}
                    placeholder="Opcional"
                    className="h-9 w-full min-w-0 px-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm font-body text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 transition-colors"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(variant.key)}
                  disabled={variants.length === 1}
                  className="col-span-2 lg:col-span-1 h-9 w-9 justify-self-end flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title={variants.length === 1 ? 'É preciso pelo menos uma variante' : 'Remover variante'}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
        <h2 className="font-body text-sm font-semibold text-gray-900">Imagens</h2>
        <p className="font-body text-xs text-gray-500">
          Associe cada imagem a uma cor — o mesmo mapeamento usado na loja para agrupar fotos por cor.
        </p>

        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-8 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer">
          <Upload size={20} className="text-gray-400" />
          <span className="font-body text-sm text-gray-600">Adicionar imagens</span>
          <span className="font-body text-xs text-gray-400">PNG ou JPG · pode selecionar várias</span>
          <input type="file" accept="image/*" multiple onChange={handleFilesSelected} className="hidden" />
        </label>

        {keptImages.length + newFiles.length === 0 ? (
          <p className="font-body text-sm text-gray-400 text-center py-4">Sem imagens.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {keptImages.map((img) => (
              <div
                key={img.id}
                className="flex flex-col gap-2 border border-gray-100 rounded-lg p-2 bg-gray-50/50"
              >
                <div className="relative">
                  <img src={img.url} alt={img.filename} className="w-full aspect-[4/5] object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(img.id)}
                    className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-white/90 shadow-sm text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
                    title="Remover imagem"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <select
                  value={colorByKey[`existing:${img.id}`] ?? ''}
                  onChange={(e) =>
                    setColorByKey((prev) => ({ ...prev, [`existing:${img.id}`]: e.target.value }))
                  }
                  className="h-8 px-2 rounded-lg bg-white border border-gray-200 text-xs font-body text-gray-900 outline-none focus:border-gray-400 transition-colors cursor-pointer"
                >
                  <option value="">Cor…</option>
                  {availableColors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {newFiles.map(({ key, file }) => (
              <div
                key={key}
                className="flex flex-col gap-2 border border-gray-100 rounded-lg p-2 bg-gray-50/50"
              >
                <div className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full aspect-[4/5] object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewFile(key)}
                    className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-white/90 shadow-sm text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
                    title="Remover imagem"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <select
                  value={colorByKey[key] ?? ''}
                  onChange={(e) => setColorByKey((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="h-8 px-2 rounded-lg bg-white border border-gray-200 text-xs font-body text-gray-900 outline-none focus:border-gray-400 transition-colors cursor-pointer"
                >
                  <option value="">Cor…</option>
                  {availableColors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="h-10 px-5 rounded-lg bg-gray-900 text-white font-body text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'A guardar…' : isEdit ? 'Guardar alterações' : 'Criar produto'}
        </button>
      </div>
    </form>
  )
}

function cleanVariant(v: VariantDraft) {
  const cleaned: Record<string, string | number> = {
    size: v.size.trim(),
    color: v.color.trim(),
    stock: Number(v.stock),
    sku: v.sku.trim(),
  }
  if (v.id) cleaned.id = v.id
  return cleaned
}