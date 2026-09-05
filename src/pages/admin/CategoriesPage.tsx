import { useState } from 'react'
import { useCategories } from '../../hooks/useCategories'
import type { Category } from '../../types'

export function CategoriesPage() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories()
  const [newName, setNewName] = useState('')
  const [newParentId, setNewParentId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editParentId, setEditParentId] = useState<string | null>(null)

  const [addingSubToId, setAddingSubToId] = useState<string | null>(null)
  const [subName, setSubName] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  // Computados
  const parentCategories = categories.filter((c) => !c.parent_id)

  const getSortedCategories = () => {
    const parents = categories.filter(c => !c.parent_id)
    const sorted: Category[] = []
    parents.forEach(p => {
      sorted.push(p)
      const children = categories.filter(c => c.parent_id === p.id)
      sorted.push(...children)
    })
    return sorted
  }

  const showFeedback = (type: 'ok' | 'err', msg: string) => {
    setFeedback({ type, msg })
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) {
      showFeedback('err', 'Por favor escribe el nombre de la categoría antes de presionar Crear.')
      return
    }
    setSubmitting(true)
    const { error } = await createCategory(newName.trim(), newParentId)
    if (error) showFeedback('err', `Error al crear: ${(error as { message?: string })?.message ?? 'desconocido'}`)
    else {
      showFeedback('ok', '¡Categoría creada con éxito!')
      setNewName('')
      setNewParentId(null)
    }
    setSubmitting(false)
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditParentId(cat.parent_id || null)
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    setSubmitting(true)
    const { error } = await updateCategory(id, editName.trim(), editParentId)
    if (error) showFeedback('err', `Error al actualizar: ${(error as { message?: string })?.message ?? 'desconocido'}`)
    else { showFeedback('ok', 'Categoría actualizada'); setEditingId(null) }
    setSubmitting(false)
  }

  const handleCreateSub = async (parentId: string) => {
    if (!subName.trim()) return
    setSubmitting(true)
    const { error } = await createCategory(subName.trim(), parentId)
    if (error) showFeedback('err', `Error al crear subcategoría: ${(error as { message?: string })?.message ?? 'desconocido'}`)
    else {
      showFeedback('ok', 'Subcategoría agregada')
      setAddingSubToId(null)
      setSubName('')
    }
    setSubmitting(false)
  }

  const handleDelete = async (cat: Category) => {
    if (!confirm(`¿Eliminar la categoría "${cat.name}"? Las fotos asociadas perderán su categoría.`)) return
    const { error } = await deleteCategory(cat.id)
    if (error) showFeedback('err', `Error al eliminar: ${(error as { message?: string })?.message ?? 'desconocido'}`)
    else showFeedback('ok', 'Categoría eliminada')
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-[var(--text-main)] mb-1 font-bold">Categorías</h1>
        <p className="text-[var(--text-muted)] text-sm">Crea y gestiona las categorías de tu portafolio M&M Visuals</p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`mb-5 px-4 py-3 rounded-xl text-sm border ${feedback.type === 'ok'
          ? 'bg-green-500/10 border-green-500/30 text-green-500 font-medium'
          : 'bg-red-500/10 border-red-500/30 text-red-500 font-medium'
          }`}>
          {feedback.msg}
        </div>
      )}

      {/* Formulario crear */}
      <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 mb-8 bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)]">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre (ej. Sesión Casual)"
            className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <select
            value={newParentId || ''}
            onChange={(e) => setNewParentId(e.target.value || null)}
            className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="">Principal (Sin padre)</option>
            {parentCategories.map(p => (
              <option key={p.id} value={p.id}>Sub de: {p.name}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--accent-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <i className="fas fa-plus" />
          )}
          Crear
        </button>
      </form>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <p className="text-[var(--text-muted)] text-sm text-center py-10">Aún no hay categorías. Crea la primera arriba.</p>
      ) : (
        <ul className="space-y-2 p-0 m-0 list-none">
          {getSortedCategories().map((cat) => (
            <li key={cat.id} className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[var(--bg-card)] border ${cat.parent_id ? 'border-dashed border-[var(--border-color)] ml-6 sm:ml-10' : 'border-[var(--border-color)]'} rounded-xl px-4 py-3 shadow-sm`}>
              {editingId === cat.id ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate(cat.id); if (e.key === 'Escape') setEditingId(null) }}
                    className="flex-1 bg-[var(--bg-primary)] border border-[var(--accent)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-main)] focus:outline-none"
                  />
                  {!cat.parent_id && categories.some(c => c.parent_id === cat.id) ? (
                    <span className="text-[10px] text-[var(--text-muted)] italic">Tiene subcategorías</span>
                  ) : (
                    <select
                      value={editParentId || ''}
                      onChange={(e) => setEditParentId(e.target.value || null)}
                      className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-main)] focus:outline-none"
                    >
                      <option value="">Principal</option>
                      {parentCategories.filter(p => p.id !== cat.id).map(p => (
                        <option key={p.id} value={p.id}>Sub de: {p.name}</option>
                      ))}
                    </select>
                  )}
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button onClick={() => handleUpdate(cat.id)} disabled={submitting} className="text-xs px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg font-semibold hover:bg-[var(--accent-hover)]">Guardar</button>
                    <button onClick={() => setEditingId(null)} className="text-xs px-3 py-1.5 bg-transparent border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg hover:text-[var(--text-main)]">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col w-full gap-2">
                  <div className="flex items-center gap-3 w-full">
                    {cat.parent_id && <i className="fas fa-level-up-alt rotate-90 text-[var(--text-muted)]/50 mr-1" />}
                    <div className="flex-1">
                      <span className="text-sm text-[var(--text-main)] font-medium">{cat.name}</span>
                      <span className="ml-2 text-[10px] text-[var(--text-muted)] font-mono opacity-60">
                        {cat.slug}
                      </span>
                    </div>
                    {!cat.parent_id && (
                      <button onClick={() => { setAddingSubToId(cat.id); setSubName(''); }} className="text-[var(--text-muted)] hover:text-green-500 transition-colors p-1.5 cursor-pointer" title="Agregar subcategoría">
                        <i className="fas fa-folder-plus text-xs" />
                      </button>
                    )}
                    <button onClick={() => startEdit(cat)} className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors p-1.5 cursor-pointer" title="Editar"><i className="fas fa-pen text-xs" /></button>
                    <button onClick={() => handleDelete(cat)} className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-1.5 cursor-pointer" title="Eliminar"><i className="fas fa-trash text-xs" /></button>
                  </div>

                  {addingSubToId === cat.id && (
                    <div className="flex items-center gap-2 mt-2 ml-4">
                      <i className="fas fa-level-up-alt rotate-90 text-[var(--text-muted)]/50" />
                      <input
                        autoFocus
                        type="text"
                        value={subName}
                        onChange={(e) => setSubName(e.target.value)}
                        placeholder="Nombre de subcategoría..."
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCreateSub(cat.id); if (e.key === 'Escape') setAddingSubToId(null) }}
                        className="flex-1 bg-[var(--bg-primary)] border border-[var(--accent)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-main)] focus:outline-none"
                      />
                      <button onClick={() => handleCreateSub(cat.id)} disabled={submitting} className="text-xs px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg font-semibold hover:bg-[var(--accent-hover)]">Crear</button>
                      <button onClick={() => setAddingSubToId(null)} className="text-xs px-3 py-1.5 bg-transparent border border-[var(--border-color)] text-[var(--text-muted)] rounded-lg hover:text-[var(--text-main)]">Cancelar</button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
