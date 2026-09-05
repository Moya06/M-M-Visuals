import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { usePhotos } from '../../hooks/usePhotos'
import { useCategories } from '../../hooks/useCategories'
import { UploadForm } from './UploadForm'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { ToastNotification } from '../../components/ui/ToastNotification'
import type { Photo } from '../../types'

export function PhotosPage() {
  const { photos, loading, deletePhoto, setPhotos } = usePhotos()
  const { categories } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadModalPhoto, setDownloadModalPhoto] = useState<Photo | null>(null)
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' | 'loading' } | null>(null)

  const handleSuccess = (photo: Photo) => {
    setPhotos((prev) => [photo, ...prev])
    setShowForm(false)
    setToast({ message: '¡Fotografía agregada con éxito al portafolio!', type: 'success' })
    setTimeout(() => setToast(null), 3500)
  }

  const handleDownload = async (photo: Photo, mode: 'original' | 'mobile' = 'original', e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (downloadingId) return
    setDownloadingId(photo.id)

    setToast({
      message: mode === 'mobile' ? 'Preparando foto para celular (~2 MB · Ultra HD)…' : 'Descargando archivo original en máxima calidad…',
      type: 'loading',
    })

    try {
      const res = await fetch(photo.url)
      const rawBlob = await res.blob()

      let finalBlob: Blob = rawBlob

      // Modo móvil: si la foto pesa más de 2.0 MB, se optimiza a ~2.0 MB en 3200px
      if (mode === 'mobile' && rawBlob.size > 2.0 * 1024 * 1024) {
        try {
          const tempFile = new File([rawBlob], 'image.jpg', {
            type: rawBlob.type || 'image/jpeg',
          })
          finalBlob = await imageCompression(tempFile, {
            maxSizeMB: 2.0,
            maxWidthOrHeight: 3200,
            initialQuality: 0.93,
            useWebWorker: true,
            fileType: 'image/jpeg',
          })
        } catch (err) {
          console.warn('Fallback a foto original:', err)
          finalBlob = rawBlob
        }
      }

      const blobUrl = URL.createObjectURL(finalBlob)

      let ext = 'jpg'
      if (finalBlob.type === 'image/png' || (mode === 'original' && photo.url.toLowerCase().includes('.png'))) ext = 'png'
      else if (finalBlob.type === 'image/webp' || (mode === 'original' && photo.url.toLowerCase().includes('.webp'))) ext = 'webp'
      else ext = 'jpg'

      const rawName = photo.title?.trim() || 'foto-mm-visuals'
      const cleanName = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'foto'
      const suffix = mode === 'mobile' ? '-celular-2mb' : '-original'

      const a = document.createElement('a')
      a.href = blobUrl
      a.target = '_self'
      a.download = `${cleanName}${suffix}.${ext}`
      document.body.appendChild(a)
      a.click()

      const finalMB = (finalBlob.size / (1024 * 1024)).toFixed(1)
      setToast({ message: `¡Descarga lista! (${finalMB} MB)`, type: 'success' })
      setTimeout(() => setToast(null), 3500)

      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a)
        URL.revokeObjectURL(blobUrl)
      }, 12000)
    } catch (err) {
      console.warn('Fallback a descarga directa:', err)
      const a = document.createElement('a')
      a.href = photo.url
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.download = `${photo.title || 'foto-mm-visuals'}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setToast({ message: 'Iniciando descarga directa...', type: 'info' })
      setTimeout(() => setToast(null), 2500)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!photoToDelete) return
    setDeletingId(photoToDelete.id)
    const { error } = await deletePhoto(photoToDelete)
    if (error) {
      setToast({ message: `Error al eliminar: ${(error as { message?: string })?.message ?? 'desconocido'}`, type: 'error' })
    } else {
      setToast({ message: 'Fotografía eliminada del portafolio', type: 'success' })
    }
    setTimeout(() => setToast(null), 3500)
    if (selectedPhoto?.id === photoToDelete.id) {
      setSelectedPhoto(null)
    }
    setPhotoToDelete(null)
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDownloadModalPhoto(photo)
                    }}
                    disabled={downloadingId === photo.id}
                    className="flex-1 py-1.5 px-2 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    title="Opciones de descarga (Celular 2MB o Calidad Original)"
                  >
                    {downloadingId === photo.id ? (
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <i className="fas fa-download text-[11px]" />
                    )}
                    <span>Descargar</span>
                  </button>

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
                    onClick={() => setPhotoToDelete(photo)}
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

            {/* Opciones de Descarga dentro del Modal de Datos */}
            <div className="space-y-2 pt-3 border-t border-[var(--border-color)]">
              <span className="block text-[11px] uppercase tracking-[1.5px] text-[var(--accent)] font-bold">
                Opciones de Descarga
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Opción Celular 2MB */}
                <button
                  type="button"
                  onClick={() => handleDownload(selectedPhoto, 'mobile')}
                  disabled={downloadingId === selectedPhoto.id}
                  className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent)] rounded-xl text-left transition-all cursor-pointer flex items-center gap-3 group disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {downloadingId === selectedPhoto.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <i className="fas fa-mobile-screen text-base" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[var(--text-main)]">Para Celular (~2 MB)</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-semibold uppercase">Recomendada</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-snug">
                      Ultra HD adaptada para WhatsApp y celular
                    </p>
                  </div>
                </button>

                {/* Opción Calidad Original */}
                <button
                  type="button"
                  onClick={() => handleDownload(selectedPhoto, 'original')}
                  disabled={downloadingId === selectedPhoto.id}
                  className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-emerald-500 rounded-xl text-left transition-all cursor-pointer flex items-center gap-3 group disabled:opacity-50"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {downloadingId === selectedPhoto.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <i className="fas fa-camera text-base" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[var(--text-main)]">Calidad Original Completa</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent)] font-semibold uppercase">Máx</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-snug">
                      Archivo de cámara sin compresión
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Botón Eliminar en el Modal */}
            <div className="pt-2 border-t border-[var(--border-color)] flex justify-end">
              <button
                type="button"
                onClick={() => setPhotoToDelete(selectedPhoto)}
                disabled={deletingId === selectedPhoto.id}
                className="w-full sm:w-auto py-2.5 px-4 bg-red-500/15 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {deletingId === selectedPhoto.id ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <i className="fas fa-trash" />
                    <span>Eliminar fotografía</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL FLOTANTE DE OPCIONES DE DESCARGA RÁPIDA ── */}
      {downloadModalPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
          onClick={() => setDownloadModalPhoto(null)}
        >
          <div
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <i className="fas fa-download text-[var(--accent)]" />
                <h3 className="font-serif font-bold text-base text-[var(--text-main)]">
                  Descargar Fotografía
                </h3>
              </div>
              <button
                onClick={() => setDownloadModalPhoto(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)] transition-colors cursor-pointer"
              >
                <i className="fas fa-xmark text-sm" />
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              {downloadModalPhoto.title?.trim() || 'Fotografía M&M Visuals'}
            </p>

            <div className="space-y-2.5">
              {/* Opción Celular 2MB */}
              <button
                type="button"
                onClick={() => {
                  handleDownload(downloadModalPhoto, 'mobile')
                  setDownloadModalPhoto(null)
                }}
                disabled={downloadingId === downloadModalPhoto.id}
                className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent)] rounded-xl text-left transition-all cursor-pointer flex items-center gap-3 group disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <i className="fas fa-mobile-screen text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[var(--text-main)]">Para Celular (~2 MB)</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-semibold uppercase">Recomendada</span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-snug">
                    Ultra HD adaptada para WhatsApp y celular
                  </p>
                </div>
              </button>

              {/* Opción Original */}
              <button
                type="button"
                onClick={() => {
                  handleDownload(downloadModalPhoto, 'original')
                  setDownloadModalPhoto(null)
                }}
                disabled={downloadingId === downloadModalPhoto.id}
                className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-emerald-500 rounded-xl text-left transition-all cursor-pointer flex items-center gap-3 group disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <i className="fas fa-camera text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[var(--text-main)]">Calidad Original Completa</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent)] font-semibold uppercase">Máx</span>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-snug">
                    Archivo de cámara sin compresión
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación para eliminar foto */}
      <ConfirmDialog
        isOpen={Boolean(photoToDelete)}
        title="¿Eliminar fotografía?"
        message="Esta acción no se puede deshacer y borrará la imagen de forma permanente del almacenamiento."
        itemName={photoToDelete?.title || undefined}
        confirmText="Eliminar foto"
        cancelText="Cancelar"
        isDanger={true}
        loading={Boolean(deletingId)}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!deletingId) setPhotoToDelete(null)
        }}
      />

      {/* Notificación flotante minimalista */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
