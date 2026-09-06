import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Photo } from '../../types'

interface Props {
  photos: Photo[]
  onOpenImage: (index: number, currentList: Photo[]) => void
  onDownload?: (photo: Photo) => void
}

export function PrivatePortfolioSection({ photos, onOpenImage, onDownload }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (photos.length === 0) {
    return (
      <section className="py-20 scroll-mt-20 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30" id="privadas">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <i className="fas fa-lock text-[11px]" />
            <span>Apartado Exclusivo · Solo visible para ti como Super Admin</span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[var(--text-main)] mb-3">
            Colección Privada & Crónicas
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
            Aún no tienes fotos marcadas como privadas. Puedes marcar fotos como privadas desde el panel de administración para que aparezcan aquí con sus descripciones amplias.
          </p>
          <Link
            to="/admin/photos"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-xs font-semibold hover:bg-[var(--accent-hover)] transition-all active:scale-95 shadow-sm"
          >
            <i className="fas fa-images" />
            <span>Gestionar fotos en Admin</span>
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-[100px] scroll-mt-20 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/35" id="privadas">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
        {/* Encabezado del apartado exclusivo */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-500 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <i className="fas fa-lock text-xs shrink-0" />
            <span>Apartado Exclusivo · Solo visible para ti como Super Admin</span>
          </div>
          <h2 className="font-serif text-[clamp(2rem,4.5vw,3rem)] text-[var(--text-main)] font-bold relative pb-4 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-12 after:h-[2px] after:bg-amber-500">
            Colección Privada & Crónicas
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl mx-auto mt-4 leading-relaxed">
            Fotografías reservadas con descripciones narrativas amplias y detalles extendidos. Ningún visitante público sin credenciales de super admin puede ver este apartado.
          </p>
          <span className="inline-block mt-3 text-[11px] font-semibold text-[var(--accent)] tracking-widest uppercase">
            {photos.length} fotografía{photos.length !== 1 ? 's' : ''} privada{photos.length !== 1 ? 's' : ''} registrada{photos.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Lista de fotos en formato editorial / storytelling */}
        <div className="space-y-8 sm:space-y-10 md:space-y-12">
          {photos.map((photo, index) => {
            const hasLongDesc = (photo.description?.length ?? 0) > 300
            const isExpanded = expandedId === photo.id

            return (
              <article
                key={photo.id}
                className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] grid grid-cols-1 lg:grid-cols-12 group/card"
              >
                {/* Columna de la Foto (Click para abrir visor completo) */}
                <div
                  className="lg:col-span-5 relative group cursor-pointer bg-black/20 flex items-center justify-center overflow-hidden min-h-[240px] sm:min-h-[380px] lg:min-h-full aspect-[4/3] sm:aspect-auto"
                  onClick={() => onOpenImage(index, photos)}
                >
                  <img
                    src={photo.url}
                    alt={photo.title ?? 'Fotografía privada'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Insignia flotante */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-amber-500/50 text-amber-400 text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <i className="fas fa-lock text-[10px]" />
                    <span>Privada</span>
                  </div>

                  {/* Overlay en hover para ampliar */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 text-white">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shadow-xl group-hover:scale-110 transition-transform">
                      <i className="fas fa-expand" />
                    </div>
                    <span className="text-xs font-semibold tracking-wider uppercase">Ver en pantalla completa</span>
                  </div>
                </div>

                {/* Columna de Contenido Editorial (Diseñada para descripciones amplias) */}
                <div className="lg:col-span-7 p-4 sm:p-7 md:p-10 flex flex-col justify-between gap-5 sm:gap-6">
                  <div className="space-y-4">
                    {/* Metadatos superiores */}
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                      {photo.category && (
                        <span className="px-2.5 sm:px-3 py-1 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-semibold tracking-wide">
                          {photo.category.name}
                        </span>
                      )}
                      {photo.width && photo.height && (
                        <span className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1">
                          <i className="fas fa-vector-square text-[10px] opacity-70" />
                          {photo.width} × {photo.height} px
                        </span>
                      )}
                      <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                        <i className="fas fa-calendar-alt text-[10px] opacity-70" />
                        {new Date(photo.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Título de la obra */}
                    <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[var(--text-main)] leading-snug break-words">
                      {photo.title?.trim() || 'Fotografía de la Colección Privada'}
                    </h3>

                    {/* Contenedor de la descripción amplia */}
                    <div className="bg-[var(--bg-primary)]/80 border border-[var(--border-color)] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-inner">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--border-color)]/60 text-amber-500 text-xs font-bold uppercase tracking-wider">
                        <i className="fas fa-align-left text-[11px]" />
                        <span>Descripción & Narrativa Extendida</span>
                      </div>

                      <div
                        className={`text-sm sm:text-base text-[var(--text-main)]/90 leading-relaxed font-sans whitespace-pre-line break-words ${
                          hasLongDesc && !isExpanded ? 'line-clamp-6' : ''
                        }`}
                      >
                        {photo.description?.trim() || (
                          <span className="italic text-[var(--text-muted)]">
                            Esta fotografía no tiene una descripción asignada aún. Puedes agregar una descripción amplia desde el panel de administración.
                          </span>
                        )}
                      </div>

                      {hasLongDesc && (
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : photo.id)}
                          className="mt-3 text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px]`} />
                          <span>{isExpanded ? 'Mostrar menos' : 'Leer descripción completa…'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Barra de herramientas / Acciones de la foto */}
                  <div className="pt-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenImage(index, photos)}
                      className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--accent)] text-[var(--text-main)] hover:text-[var(--accent)] active:scale-95 rounded-xl text-xs font-semibold transition-all duration-250 cursor-pointer w-full sm:w-auto shadow-sm"
                    >
                      <i className="fas fa-expand text-xs text-[var(--accent)]" />
                      <span>Ver en pantalla completa</span>
                    </button>

                    <div className="flex items-center justify-end sm:justify-start gap-2">
                      <Link
                        to="/admin/photos"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/15 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-white active:scale-95 rounded-xl text-xs font-semibold transition-all duration-250 cursor-pointer flex-1 sm:flex-initial shadow-sm"
                        title="Editar esta foto en el panel"
                      >
                        <i className="fas fa-pen-to-square text-xs" />
                        <span>Editar en Admin</span>
                      </Link>

                      {onDownload && (
                        <button
                          type="button"
                          onClick={() => onDownload(photo)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white active:scale-95 rounded-xl text-xs font-semibold transition-all duration-250 cursor-pointer flex-1 sm:flex-initial shadow-sm"
                          title="Descargar fotografía"
                        >
                          <i className="fas fa-download text-xs" />
                          <span>Descargar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

