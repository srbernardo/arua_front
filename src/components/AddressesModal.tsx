import { useState, useEffect } from 'react'
import { X, MapPin, Plus, Check, Pencil, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { useToast } from '../lib/toast'

interface AddressesModalProps {
  open: boolean
  onClose: () => void
}

interface SavedAddress {
  id: number
  street: string
  neighborhood: string | null
  city: string
  state: string
  zip: string
  default: boolean
}

export default function AddressesModal({ open, onClose }: AddressesModalProps) {
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()

  const [form, setForm] = useState({ street: '', neighborhood: '', city: '', state: '', zip: '' })

  function resetForm() {
    setForm({ street: '', neighborhood: '', city: '', state: '', zip: '' })
  }

  function loadAddresses() {
    setLoading(true)
    api.addresses.list()
      .then(setAddresses)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { if (open) loadAddresses() }, [open])

  function openEdit(a: SavedAddress) {
    setEditingId(a.id)
    setForm({ street: a.street, neighborhood: a.neighborhood ?? '', city: a.city, state: a.state, zip: a.zip })
    setShowForm(true)
  }

  function openNew() {
    setEditingId(null)
    resetForm()
    setShowForm(true)
  }

  async function handleSave() {
    try {
      if (editingId) {
        await api.addresses.update(editingId, form)
        toast('Morada atualizada')
      } else {
        await api.addresses.create(form)
        toast('Morada adicionada')
      }
      setShowForm(false)
      setEditingId(null)
      resetForm()
      loadAddresses()
    } catch {
      toast('Erro ao guardar morada', 'error')
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.addresses.destroy(id)
      toast('Morada removida')
      loadAddresses()
    } catch {
      toast('Erro ao remover morada', 'error')
    }
  }

  async function handleSetDefault(id: number) {
    try {
      await api.addresses.update(id, { default: true })
      toast('Morada definida como padrão')
      loadAddresses()
    } catch {
      toast('Erro ao definir morada padrão', 'error')
    }
  }

  function handleClose() {
    setShowForm(false)
    setEditingId(null)
    resetForm()
    onClose()
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 transition-opacity" onClick={handleClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <span className="font-heading text-lg font-semibold text-black">Os Meus Endereços</span>
          <button onClick={handleClose} className="cursor-pointer hover:opacity-70 transition-opacity">
            <X size={20} className="text-neutral-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {showForm ? (
                <form autoComplete="on" onSubmit={(e) => { e.preventDefault(); handleSave() }}>
                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50">
                  <h4 className="font-body text-sm font-semibold text-black mb-4">
                    {editingId ? 'Editar Morada' : 'Nova Morada'}
                  </h4>
                  <div className="mb-3">
                    <label className="block font-body text-xs font-medium text-neutral-600 mb-1.5" htmlFor="modal-morada">Morada</label>
                    <input
                      id="modal-morada"
                      name="morada"
                      autoComplete="street-address"
                      value={form.street}
                      onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                      placeholder="Rua, número"
                      className="w-full h-11 px-4 rounded-xl bg-white border border-neutral-300 text-sm outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block font-body text-xs font-medium text-neutral-600 mb-1.5" htmlFor="modal-apto">Apto, conjunto, unidade, piso, etc.</label>
                    <input
                      id="modal-apto"
                      name="apto"
                      autoComplete="address-line2"
                      value={form.neighborhood}
                      onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))}
                      placeholder="Ex: Apt 4B"
                      className="w-full h-11 px-4 rounded-xl bg-white border border-neutral-300 text-sm outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div className="flex gap-3 mb-3">
                    <div className="flex-[2]">
                      <label className="block font-body text-xs font-medium text-neutral-600 mb-1.5" htmlFor="modal-concelho">Concelho</label>
                      <input
                        id="modal-concelho"
                        name="concelho"
                        autoComplete="address-level2"
                        value={form.city}
                        onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                        placeholder="Concelho"
                        className="w-full h-11 px-4 rounded-xl bg-white border border-neutral-300 text-sm outline-none focus:border-black transition-colors"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block font-body text-xs font-medium text-neutral-600 mb-1.5" htmlFor="modal-distrito">Distrito</label>
                      <input
                        id="modal-distrito"
                        name="distrito"
                        autoComplete="address-level1"
                        value={form.state}
                        onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                        placeholder="Ex: Lisboa"
                        className="w-full h-11 px-4 rounded-xl bg-white border border-neutral-300 text-sm outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block font-body text-xs font-medium text-neutral-600 mb-1.5" htmlFor="modal-codigo-postal">Código Postal</label>
                    <input
                      id="modal-codigo-postal"
                      name="codigo-postal"
                      autoComplete="postal-code"
                      value={form.zip}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 7)
                        const formatted = digits.length > 4 ? digits.slice(0, 4) + '-' + digits.slice(4) : digits
                        setForm((f) => ({ ...f, zip: formatted }))
                      }}
                      placeholder="0000-000"
                      maxLength={8}
                      className="w-full h-11 px-4 rounded-xl bg-white border border-neutral-300 text-sm outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={!form.street || !form.city || !form.state || !form.zip}
                      className="h-11 px-6 bg-black text-white font-body text-sm font-semibold rounded-full cursor-pointer hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {editingId ? 'Guardar' : 'Adicionar'}
                    </button>
                    <button
                      onClick={() => { setShowForm(false); setEditingId(null); resetForm() }}
                      className="h-11 px-6 bg-neutral-100 text-neutral-600 font-body text-sm font-semibold rounded-full cursor-pointer hover:bg-neutral-200 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
                </form>
              ) : (
                <>
                  {addresses.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-start justify-between p-4 rounded-xl border border-neutral-200 bg-white"
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin size={16} className="text-neutral-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-body text-sm font-medium text-black">{a.street}</p>
                          {a.neighborhood && <p className="font-body text-xs text-neutral-500">{a.neighborhood}</p>}
                          <p className="font-body text-xs text-neutral-500">{a.city}, {a.state}</p>
                          <p className="font-body text-xs text-neutral-500">{a.zip}</p>
                          {a.default && (
                            <span className="inline-block font-body text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full mt-1">
                              PADRÃO
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-4">
                        {!a.default && (
                          <button
                            onClick={() => handleSetDefault(a.id)}
                            title="Definir como padrão"
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                          >
                            <Check size={15} className="text-neutral-400 hover:text-black transition-colors" />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(a)}
                          title="Editar"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                        >
                          <Pencil size={15} className="text-neutral-400 hover:text-black transition-colors" />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          title="Remover"
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} className="text-neutral-400 hover:text-red-500 transition-colors" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={openNew}
                    className="w-full h-12 border-2 border-dashed border-neutral-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:border-neutral-400 transition-colors"
                  >
                    <Plus size={18} className="text-neutral-500" />
                    <span className="font-body text-sm font-medium text-neutral-600">Adicionar Morada</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
