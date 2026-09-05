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

  const handleSuccess = (photo: Photo) => {
    setPhotos((prev) => [photo, ...prev])
    setShowForm(false)
  }

  const handleDelete = async (photo: Photo) => {
    if (!confirm(`¿Eliminar la foto "${photo.title ?? photo.id}"? Esta acción no se puede deshacer.`)) return
    setDeletingId(photo.id)
    await deletePhoto(photo)
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm"
            >
              {/* Thumbnail */}
              <div className="aspect-square overflow-hidden">
                <img
                  src={photo.thumbnail_url ?? photo.url}
                  alt={photo.title ?? ''}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Overlay con info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end">
                {photo.title && (
                  <p className="text-xs text-white font-medium truncate">{photo.title}</p>
                )}
                {photo.category && (
                  <p className="text-[10px] text-[#c9a84c] mt-0.5">{photo.category.name}</p>
                )}
              </div>

              {/* Botón descargar foto original (Admin) */}
              <a
                href={photo.url}
                target="_blank"
                rel="noopener noreferrer"
                download={photo.title || 'foto-mm-visuals'}
                className="absolute top-2 left-2 w-7 h-7 bg-black/60 backdrop-blur-sm text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-600/90 flex items-center justify-center cursor-pointer shadow-sm"
                title="Descargar foto original"
              >
                <i className="fas fa-arrow-down-to-bracket text-[10px]" />
              </a>

              {/* Botón eliminar */}
              <button
                onClick={() => handleDelete(photo)}
                disabled={deletingId === photo.id}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 backdrop-blur-sm text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80 flex items-center justify-center"
                title="Eliminar foto"
              >
                {deletingId === photo.id
                  ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  : <i className="fas fa-trash text-[10px]" />
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
