import { useState } from 'react'
import { usePhotos } from '../../hooks/usePhotos'
import { useCategories } from '../../hooks/useCategories'
import { UploadForm } from './UploadForm'
import type { Photo } from '../../types'

export function PhotosPage() {
  const { photos, loading, deletePhoto, setPhotos } = usePhotos()
  const { categories } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

  const handleSuccess = (photo: Photo) => {
    setPhotos((prev) => [photo, ...prev])
    setShowForm(false)
  }

  const handleDelete = async (photo: Photo) => {
    if (!confirm(`¿Eliminar la foto "${photo.title ?? photo.id}"? Esta acción no se puede deshacer.`)) return
    setDeletingId(photo.id)
    await deletePhoto(photo)
    if (selectedPhoto?.id === photo.id) {
      setSelectedPhoto(null)
    }
    setDeletingId(null)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif text-[var(--text-main)] mb-1 font-bold">Fotos</h1>
          <p className="text-[var(--text-muted)] text-xs sm:text-sm">{photos.length} foto{photos.length !== 1 ? 's' : ''} en el portafolio</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <i className={`fas ${showForm ? 'fa-xmark' : 'fa-upload'}`} />
          {showForm ? 'Cancelar' : 'Subir foto'}
        </button>
      </div>

      {/* Formulario de subida */}
      {showForm && (
        <div className="mb-8 max-w-2xl">
          <UploadForm categories={categories} onSuccess={handleSuccess} />
        </div>
      )}

      {/* Grid de fotos */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-20 text-[var(--text-muted)]">
          <i className="fas fa-images text-4xl mb-4 block text-[var(--text-muted)]/50" />
          <p className="text-sm">Aún no hay fotos. Sube la primera.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group flex flex-col bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm hover:border-[var(--accent)]/60 transition-all duration-200"
            >
              {/* Contenedor de imagen */}
              <div
                className="relative aspect-square overflow-hidden bg-black/10 cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.thumbnail_url ?? photo.url}
                  alt={photo.title ?? ''}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Insignia de categoría flotante */}
                {photo.category && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[var(--accent)] text-[10px] font-semibold tracking-wide truncate max-w-[85%]">
                    {photo.category.name}
                  </span>
                )}
              </div>

              {/* Contenido / Datos de la foto */}
              <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <h3
                    onClick={() => setSelectedPhoto(photo)}
                    className="text-xs sm:text-sm font-semibold text-[var(--text-main)] truncate cursor-pointer hover:text-[var(--accent)] transition-colors"
                    title={photo.title ?? 'Sin título'}
                  >
                    {photo.title?.trim() || 'Sin título'}
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                    {photo.category ? photo.category.name : 'General'}
                    {photo.width && photo.height ? ` · ${photo.width}×${photo.height}` : ''}
                  </p>
                </div>

                {/* Barra de botones de acción 100% visible en móvil y responsive */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-[var(--border-color)]">
                  {/* Botón Descargar */}
                  <a
                    href={photo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={photo.title || 'foto-mm-visuals'}
                    className="flex-1 py-1.5 px-2 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Descargar archivo en máxima calidad"
                  >
                    <i className="fas fa-download text-[11px]" />
                    <span>Descargar</span>
                  </a>

                  {/* Botón Datos */}
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(photo)}
                    className="py-1.5 px-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--accent)] hover:text-[var(--accent)] rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Ver datos y detalles"
                  >
                    <i className="fas fa-circle-info text-[11px] text-[var(--accent)]" />
                    <span>Datos</span>
                  </button>

                  {/* Botón Delete */}
                  <button
                    type="button"
                    onClick={() => handleDelete(photo)}
                    disabled={deletingId === photo.id}
                    className="py-1.5 px-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-xs font-medium flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                    title="Eliminar foto"
                  >
                    {deletingId === photo.id ? (
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <i className="fas fa-trash text-[11px]" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL DETALLADO DE DATOS DE LA FOTO ── */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <i className="fas fa-circle-info text-[var(--accent)] text-base" />
                <h3 className="font-serif font-bold text-base text-[var(--text-main)]">
                  Datos de la Foto
                </h3>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)] transition-colors cursor-pointer"
              >
                <i className="fas fa-xmark text-sm" />
              </button>
            </div>

            {/* Previsualización grande */}
            <div className="rounded-xl overflow-hidden bg-black/20 max-h-64 flex items-center justify-center border border-[var(--border-color)]">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title ?? ''}
                className="max-h-64 w-auto object-contain"
              />
            </div>

            {/* Metadatos y Datos */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="block text-[10px] uppercase tracking-[1px] text-[var(--text-muted)] font-semibold mb-0.5">
                  Título
                </span>
                <p className="font-semibold text-[var(--text-main)] text-sm sm:text-base">
                  {selectedPhoto.title?.trim() || 'Sin título'}
                </p>
              </div>

              <div>
                <span className="block text-[10px] uppercase tracking-[1px] text-[var(--text-muted)] font-semibold mb-0.5">
                  Categoría
                </span>
                <span className="inline-block px-2.5 py-1 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-semibold">
                  {selectedPhoto.category ? selectedPhoto.category.name : 'Sin categoría (General)'}
                </span>
              </div>

              <div>
                <span className="block text-[10px] uppercase tracking-[1px] text-[var(--text-muted)] font-semibold mb-0.5">
                  Descripción
                </span>
                <p className="text-[var(--text-muted)] bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--border-color)] leading-relaxed">
                  {selectedPhoto.description?.trim() || 'Sin descripción registrada para esta fotografía.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-color)]">
                  <span className="block text-[10px] uppercase tracking-[1px] text-[var(--text-muted)] font-semibold mb-0.5">
                    Dimensiones
                  </span>
                  <p className="font-mono text-xs text-[var(--text-main)] font-medium">
                    {selectedPhoto.width && selectedPhoto.height
                      ? `${selectedPhoto.width} × ${selectedPhoto.height} px`
                      : 'Nativo original'}
                  </p>
                </div>

                <div className="bg-[var(--bg-primary)] p-2.5 rounded-xl border border-[var(--border-color)]">
                  <span className="block text-[10px] uppercase tracking-[1px] text-[var(--text-muted)] font-semibold mb-0.5">
                    Fecha de subida
                  </span>
                  <p className="text-xs text-[var(--text-main)] font-medium">
                    {new Date(selectedPhoto.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones del Modal */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-3 border-t border-[var(--border-color)]">
              <a
                href={selectedPhoto.url}
                target="_blank"
                rel="noopener noreferrer"
                download={selectedPhoto.title || 'foto-mm-visuals'}
                className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <i className="fas fa-download" />
                <span>Descargar en alta calidad</span>
              </a>

              <button
                type="button"
                onClick={() => handleDelete(selectedPhoto)}
                disabled={deletingId === selectedPhoto.id}
                className="w-full sm:w-auto py-2.5 px-4 bg-red-500/15 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {deletingId === selectedPhoto.id ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <i className="fas fa-trash" />
                    <span>Eliminar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
