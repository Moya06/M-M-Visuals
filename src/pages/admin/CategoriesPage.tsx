import { useState } from 'react'
import { useCategories } from '../../hooks/useCategories'
import type { Category } from '../../types'

export function CategoriesPage() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories()
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

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
    const { error } = await createCategory(newName.trim())
    if (error) showFeedback('err', `Error al crear: ${(error as { message?: string })?.message ?? 'desconocido'}`)
    else { showFeedback('ok', '¡Categoría creada con éxito!'); setNewName('') }
    setSubmitting(false)
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditName(cat.name)
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    setSubmitting(true)
    const { error } = await updateCategory(id, editName.trim())
    if (error) showFeedback('err', `Error al actualizar: ${(error as { message?: string })?.message ?? 'desconocido'}`)
    else { showFeedback('ok', 'Categoría actualizada'); setEditingId(null) }
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
        <div className={`mb-5 px-4 py-3 rounded-xl text-sm border ${
          feedback.type === 'ok'
            ? 'bg-green-500/10 border-green-500/30 text-green-500 font-medium'
            : 'bg-red-500/10 border-red-500/30 text-red-500 font-medium'
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Formulario crear */}
      <form onSubmit={handleCreate} className="flex gap-3 mb-8">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Escribe el nombre aquí (ej. Bodas, Callejera...)"
          className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent)] transition-colors shadow-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-[var(--accent)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--accent-hover)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
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
          {categories.map((cat) => (
            <li key={cat.id} className="flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl px-4 py-3 shadow-sm">
              {editingId === cat.id ? (
                <>
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate(cat.id); if (e.key === 'Escape') setEditingId(null) }}
                    className="flex-1 bg-[var(--bg-primary)] border border-[var(--accent)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-main)] focus:outline-none"
                  />
                  <button
                    onClick={() => handleUpdate(cat.id)}
                    disabled={submitting}
                    className="text-xs px-3 py-1.5 bg-[var(--accent)] text-white rounded-lg font-semibold hover:bg-[var(--accent-hover)] disabled:opacity-40 cursor-pointer"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs px-3 py-1.5 bg-[var(--border-color)] text-[var(--text-muted)] rounded-lg hover:text-[var(--text-main)] cursor-pointer"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <span className="text-sm text-[var(--text-main)] font-medium">{cat.name}</span>
                    <span className="ml-2 text-[11px] text-[var(--text-muted)] font-mono opacity-70">{cat.slug}</span>
                  </div>
                  <button
                    onClick={() => startEdit(cat)}
                    className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors p-1.5 cursor-pointer"
                    title="Editar"
                  >
                    <i className="fas fa-pen text-xs" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-1.5 cursor-pointer"
                    title="Eliminar"
                  >
                    <i className="fas fa-trash text-xs" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
