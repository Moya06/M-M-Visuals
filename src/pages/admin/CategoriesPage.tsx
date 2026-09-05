import { useState } from 'react'
import { useCategories } from '../../hooks/useCategories'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { ToastNotification } from '../../components/ui/ToastNotification'
import type { Category } from '../../types'

export function CategoriesPage() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories()
  
  // Modo de creación: 'main' = Categoría Principal, 'sub' = Subcategoría
  const [createMode, setCreateMode] = useState<'main' | 'sub'>('main')
  const [newName, setNewName] = useState('')
  const [selectedParentId, setSelectedParentId] = useState<string>('')

  // Edición
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editParentId, setEditParentId] = useState<string | null>(null)

  // Creación rápida inline en una categoría específica
  const [quickSubParentId, setQuickSubParentId] = useState<string | null>(null)
  const [quickSubName, setQuickSubName] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<{ category: Category; message: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' | 'loading' } | null>(null)

  // Categorías principales (sin padre)
  const parentCategories = categories.filter((c) => !c.parent_id)

  const showToast = (message: string, type: 'success' | 'info' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Crear categoría principal o subcategoría desde el formulario superior
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) {
      showToast('Por favor escribe el nombre de la categoría.', 'error')
      return
    }

    if (createMode === 'sub' && !selectedParentId) {
      showToast('Por favor selecciona a cuál categoría principal pertenece esta subcategoría.', 'error')
      return
    }

    setSubmitting(true)
    const parentId = createMode === 'sub' ? selectedParentId : null
    const { error } = await createCategory(newName.trim(), parentId)

    if (error) {
      showToast(`Error al crear: ${(error as { message?: string })?.message ?? 'desconocido'}`, 'error')
    } else {
      showToast(createMode === 'sub' ? '¡Subcategoría creada con éxito!' : '¡Categoría principal creada con éxito!', 'success')
      setNewName('')
    }
    setSubmitting(false)
  }

  // Creación rápida de subcategoría directamente en la tarjeta del padre
  const handleQuickCreateSub = async (parentId: string) => {
    if (!quickSubName.trim()) return
    setSubmitting(true)
    const { error } = await createCategory(quickSubName.trim(), parentId)
    if (error) {
      showToast(`Error al crear subcategoría: ${(error as { message?: string })?.message ?? 'desconocido'}`, 'error')
    } else {
      showToast('¡Subcategoría agregada con éxito!', 'success')
      setQuickSubParentId(null)
      setQuickSubName('')
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
    if (error) {
      showToast(`Error al actualizar: ${(error as { message?: string })?.message ?? 'desconocido'}`, 'error')
    } else {
      showToast('Categoría actualizada correctamente', 'success')
      setEditingId(null)
    }
    setSubmitting(false)
  }

  const handleDeleteClick = (cat: Category) => {
    const isParent = !cat.parent_id
    const childCount = categories.filter((c) => c.parent_id === cat.id).length
    const promptMsg = isParent && childCount > 0
      ? `Esta categoría contiene ${childCount} subcategoría(s) asociada(s). Si la eliminas, sus subcategorías y fotos quedarán desvinculadas.`
      : `Las fotos asociadas a esta categoría quedarán sin categoría asignada.`

    setCategoryToDelete({ category: cat, message: promptMsg })
  }

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return
    setDeletingId(categoryToDelete.category.id)
    const { error } = await deleteCategory(categoryToDelete.category.id)
    if (error) {
      showToast(`Error al eliminar: ${(error as { message?: string })?.message ?? 'desconocido'}`, 'error')
    } else {
      showToast(`Categoría "${categoryToDelete.category.name}" eliminada`, 'success')
    }
    setCategoryToDelete(null)
    setDeletingId(null)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-xl sm:text-2xl font-serif text-[var(--text-main)] mb-1 font-bold">
          Categorías y Subcategorías
        </h1>
        <p className="text-[var(--text-muted)] text-xs sm:text-sm">
          Organiza tu portafolio fotográfico en categorías principales y sus respectivas especialidades.
        </p>
      </div>

      {/* ── PANEL DE CREACIÓN CON PESTAÑAS CLARAS ── */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 border-b border-[var(--border-color)]/60 pb-3">
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-[1px] mr-2">
            Crear:
          </span>
          <button
            type="button"
            onClick={() => {
              setCreateMode('main')
              setSelectedParentId('')
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              createMode === 'main'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
            }`}
          >
            <i className="fas fa-folder text-xs" />
            <span>Categoría Principal</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCreateMode('sub')
              if (!selectedParentId && parentCategories.length > 0) {
                setSelectedParentId(parentCategories[0].id)
              }
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              createMode === 'sub'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
            }`}
          >
            <i className="fas fa-turn-down text-xs rotate-[-90deg] scale-y-[-1]" />
            <span>Subcategoría</span>
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          {createMode === 'sub' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-[0.5px] mb-1.5">
                ¿A cuál categoría principal pertenece?
              </label>
              {parentCategories.length === 0 ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-600 dark:text-amber-400">
                  Primero debes crear al menos una categoría principal arriba para poder asignarle subcategorías.
                </div>
              ) : (
                <select
                  value={selectedParentId}
                  onChange={(e) => setSelectedParentId(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
                >
                  <option value="">-- Selecciona una categoría principal --</option>
                  {parentCategories.map((p) => (
                    <option key={p.id} value={p.id}>
                      📁 {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={
                createMode === 'main'
                  ? 'Nombre de la categoría principal (ej. Bodas, Retratos, Fauna...)'
                  : 'Nombre de la subcategoría (ej. Casual, Civil, Aves, Estudio...)'
              }
              className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
            <button
              type="submit"
              disabled={submitting || (createMode === 'sub' && parentCategories.length === 0)}
              className="px-6 py-2.5 bg-[var(--accent)] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[var(--accent-hover)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xs shrink-0"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <i className="fas fa-plus" />
              )}
              <span>{createMode === 'main' ? 'Crear Principal' : 'Crear Subcategoría'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── LISTADO ESTRUCTURADO DE CATEGORÍAS Y SUBCATEGORÍAS ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-[1.5px]">
            Estructura de Categorías ({parentCategories.length} principales)
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-3 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : parentCategories.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[var(--bg-card)] border border-dashed border-[var(--border-color)] rounded-2xl">
            <i className="fas fa-tags text-3xl text-[var(--text-muted)]/40 mb-3 block" />
            <p className="text-sm font-medium text-[var(--text-main)] mb-1">Aún no hay categorías creadas</p>
            <p className="text-xs text-[var(--text-muted)]">
              Crea tu primera categoría principal arriba (por ejemplo: Retratos, Bodas o Paisajes).
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {parentCategories.map((parent) => {
              const subcategories = categories.filter((c) => c.parent_id === parent.id)
              const isEditingParent = editingId === parent.id
              const isAddingQuickSub = quickSubParentId === parent.id

              return (
                <div
                  key={parent.id}
                  className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  {/* Encabezado de la Categoría Principal */}
                  <div className="p-4 sm:p-5 bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)]">
                    {isEditingParent ? (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                        <input
                          autoFocus
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdate(parent.id)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          className="flex-1 bg-[var(--bg-primary)] border border-[var(--accent)] rounded-xl px-3.5 py-2 text-sm text-[var(--text-main)] focus:outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdate(parent.id)}
                            disabled={submitting}
                            className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-semibold rounded-xl hover:bg-[var(--accent-hover)] cursor-pointer"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-muted)] text-xs font-semibold rounded-xl hover:text-[var(--text-main)] cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0">
                            <i className="fas fa-folder text-sm" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-bold text-[var(--text-main)]">{parent.name}</h3>
                              <span className="px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-semibold uppercase tracking-wider">
                                Principal
                              </span>
                              <span className="text-xs text-[var(--text-muted)]">
                                ({subcategories.length} {subcategories.length === 1 ? 'subcategoría' : 'subcategorías'})
                              </span>
                            </div>
                            <span className="text-[11px] text-[var(--text-muted)] font-mono">
                              slug: {parent.slug}
                            </span>
                          </div>
                        </div>

                        {/* Botones de acción para la categoría principal */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            onClick={() => {
                              setQuickSubParentId(parent.id)
                              setQuickSubName('')
                            }}
                            className="px-3 py-1.5 rounded-xl border border-[var(--accent)]/60 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                            title={`Añadir subcategoría a ${parent.name}`}
                          >
                            <i className="fas fa-plus text-[10px]" />
                            <span>Añadir Subcategoría</span>
                          </button>
                          <button
                            onClick={() => startEdit(parent)}
                            className="w-8 h-8 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--accent)] flex items-center justify-center text-xs transition-colors cursor-pointer"
                            title="Editar nombre"
                          >
                            <i className="fas fa-pen" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(parent)}
                            className="w-8 h-8 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:text-red-500 hover:border-red-500/40 flex items-center justify-center text-xs transition-colors cursor-pointer"
                            title="Eliminar categoría principal"
                          >
                            <i className="fas fa-trash" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Formulario rápido para añadir subcategoría a este padre */}
                  {isAddingQuickSub && (
                    <div className="p-4 bg-[var(--accent)]/5 border-b border-[var(--accent)]/20 animate-[fadeUp_0.2s_ease-out]">
                      <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[var(--accent)]">
                        <i className="fas fa-turn-down rotate-[-90deg] scale-y-[-1]" />
                        <span>Nueva subcategoría para "{parent.name}":</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={quickSubName}
                          onChange={(e) => setQuickSubName(e.target.value)}
                          placeholder="Nombre (ej. Casual, Civil, En Estudio...)"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleQuickCreateSub(parent.id)
                            if (e.key === 'Escape') setQuickSubParentId(null)
                          }}
                          className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] focus:border-[var(--accent)] rounded-xl px-3.5 py-2 text-sm text-[var(--text-main)] focus:outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuickCreateSub(parent.id)}
                            disabled={submitting}
                            className="px-4 py-2 bg-[var(--accent)] text-white text-xs font-semibold rounded-xl hover:bg-[var(--accent-hover)] cursor-pointer"
                          >
                            Crear Subcategoría
                          </button>
                          <button
                            onClick={() => setQuickSubParentId(null)}
                            className="px-3.5 py-2 border border-[var(--border-color)] text-[var(--text-muted)] text-xs font-semibold rounded-xl hover:text-[var(--text-main)] cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lista de Subcategorías hijas */}
                  <div className="p-4 sm:p-5">
                    {subcategories.length === 0 ? (
                      <div className="text-xs text-[var(--text-muted)] italic py-2 flex items-center justify-between">
                        <span>Sin subcategorías todavía. Pulsa "+ Añadir Subcategoría" arriba para agregarle especialidades.</span>
                      </div>
                    ) : (
                      <ul className="space-y-2.5 p-0 m-0 list-none">
                        {subcategories.map((sub) => {
                          const isEditingSub = editingId === sub.id

                          return (
                            <li
                              key={sub.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]/70 hover:border-[var(--border-color)] transition-colors"
                            >
                              {isEditingSub ? (
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                                  <input
                                    autoFocus
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleUpdate(sub.id)
                                      if (e.key === 'Escape') setEditingId(null)
                                    }}
                                    className="flex-1 bg-[var(--bg-card)] border border-[var(--accent)] rounded-lg px-3 py-1.5 text-xs sm:text-sm text-[var(--text-main)] focus:outline-none"
                                  />
                                  <select
                                    value={editParentId || ''}
                                    onChange={(e) => setEditParentId(e.target.value || null)}
                                    className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:outline-none"
                                  >
                                    <option value="">Convertir en Principal (Sin padre)</option>
                                    {parentCategories.map((p) => (
                                      <option key={p.id} value={p.id}>
                                        Mover a: {p.name}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleUpdate(sub.id)}
                                      disabled={submitting}
                                      className="px-3 py-1.5 bg-[var(--accent)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--accent-hover)] cursor-pointer"
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      onClick={() => setEditingId(null)}
                                      className="px-3 py-1.5 border border-[var(--border-color)] text-[var(--text-muted)] text-xs font-semibold rounded-lg hover:text-[var(--text-main)] cursor-pointer"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2.5">
                                    <i className="fas fa-turn-down rotate-[-90deg] scale-y-[-1] text-[var(--accent)] text-xs ml-1" />
                                    <div>
                                      <span className="text-xs sm:text-sm font-semibold text-[var(--text-main)]">
                                        {sub.name}
                                      </span>
                                      <span className="ml-2 text-[10px] text-[var(--text-muted)] font-mono">
                                        {sub.slug}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                    <button
                                      onClick={() => startEdit(sub)}
                                      className="w-7 h-7 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] flex items-center justify-center text-xs transition-colors cursor-pointer"
                                      title="Editar o mover subcategoría"
                                    >
                                      <i className="fas fa-pen text-[10px]" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteClick(sub)}
                                      className="w-7 h-7 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-red-500 hover:border-red-500/40 flex items-center justify-center text-xs transition-colors cursor-pointer"
                                      title="Eliminar subcategoría"
                                    >
                                      <i className="fas fa-trash text-[10px]" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Diálogo de confirmación para eliminar categoría */}
      <ConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        title={categoryToDelete?.category.parent_id ? '¿Eliminar subcategoría?' : '¿Eliminar categoría principal?'}
        message={categoryToDelete?.message || '¿Estás seguro de eliminar esta categoría?'}
        itemName={categoryToDelete?.category.name}
        confirmText="Eliminar categoría"
        cancelText="Cancelar"
        isDanger={true}
        loading={Boolean(deletingId)}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!deletingId) setCategoryToDelete(null)
        }}
      />

      {/* Toast Notification Minimalista */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
