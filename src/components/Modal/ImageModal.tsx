import { useEffect, useRef, useCallback, useState } from 'react'
import type { ImageData } from '../../types'

interface Props {
  isOpen: boolean
  currentImage?: ImageData
  images: ImageData[]
  currentIndex: number
  total: number
  scale: number
  pan: { x: number; y: number }
  isFullscreen: boolean
  showInfo: boolean
  showThumbnails: boolean
  onClose: () => void
  onNavigate: (dir: number) => void
  onGoTo: (index: number) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoom: (delta: number) => void
  onToggleZoom: () => void
  onResetZoom: () => void
  onPan: (x: number, y: number) => void
  onToggleFullscreen: () => void
  onToggleInfo: () => void
  onToggleThumbnails: () => void
}

export function ImageModal({
  isOpen,
  currentImage,
  images,
  currentIndex,
  total,
  scale,
  pan,
  isFullscreen,
  showInfo,
  showThumbnails,
  onClose,
  onNavigate,
  onGoTo,
  onZoomIn,
  onZoomOut,
  onZoom,
  onToggleZoom,
  onResetZoom,
  onPan,
  onToggleFullscreen,
  onToggleInfo,
  onToggleThumbnails,
}: Props) {
  const isDragging = useRef(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const panRef = useRef(pan)
  panRef.current = pan

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)

  const filmstripRef = useRef<HTMLDivElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reiniciar estado de carga al cambiar foto
  useEffect(() => {
    setImageLoaded(false)
  }, [currentIndex])

  // Scroll automático del filmstrip hacia la foto activa
  useEffect(() => {
    if (filmstripRef.current && showThumbnails) {
      const activeEl = filmstripRef.current.children[currentIndex] as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [currentIndex, showThumbnails])

  // Auto-gestión de controles en reposo
  const resetControlsTimer = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (scale <= 1 && !showInfo) {
        setShowControls(true)
      }
    }, 4000)
  }, [scale, showInfo])

  // Atajos de teclado profesionales
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') onNavigate(-1)
      else if (e.key === 'ArrowRight') onNavigate(1)
      else if (e.key === '+' || e.key === '=') onZoomIn()
      else if (e.key === '-' || e.key === '_') onZoomOut()
      else if (e.key === '0') onResetZoom()
      else if (e.key === 'f' || e.key === 'F') onToggleFullscreen()
      else if (e.key === 'i' || e.key === 'I') onToggleInfo()
      else if (e.key === 't' || e.key === 'T') onToggleThumbnails()
    },
    [onClose, onNavigate, onZoomIn, onZoomOut, onResetZoom, onToggleFullscreen, onToggleInfo, onToggleThumbnails]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  // Arrastre con mouse cuando hay zoom
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (scale <= 1) return
      isDragging.current = true
      startX.current = e.pageX - panRef.current.x
      startY.current = e.pageY - panRef.current.y
      e.preventDefault()
    },
    [scale]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      resetControlsTimer()
      if (!isDragging.current) return
      onPan(e.pageX - startX.current, e.pageY - startY.current)
    },
    [onPan, resetControlsTimer]
  )

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  // Zoom con rueda del mouse
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const step = Math.max(0.05, Math.min(Math.abs(e.deltaY) * 0.001, 0.2))
      onZoom(e.deltaY > 0 ? -step : step)
    },
    [onZoom]
  )

  // Gestos táctiles para móviles (Swipe para navegar, deslizar abajo para cerrar)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
      touchStartTime.current = Date.now()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length === 1 && scale <= 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current
      const deltaY = e.changedTouches[0].clientY - touchStartY.current
      const elapsed = Date.now() - touchStartTime.current

      if (elapsed < 400) {
        if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 60) {
          if (deltaX < 0) onNavigate(1)
          else onNavigate(-1)
        } else if (deltaY > 90 && Math.abs(deltaX) < 60) {
          onClose()
        }
      }
    }
  }


  if (!isOpen || !currentImage) return null

  const displayTitle = currentImage.title?.trim() || 'Fotografía de Autor'
  const displayCategory = currentImage.categoryName?.trim()
  const zoomPercentage = Math.round(scale * 100)

  return (
    <div
      className="fixed inset-0 z-[2000] flex flex-col justify-between select-none overflow-hidden"
      onMouseMove={resetControlsTimer}
    >
      {/* Fondo cinematográfico con desenfoque de cristal oscuro */}
      <div
        className="absolute inset-0 bg-[#070707]/94 backdrop-blur-2xl transition-opacity duration-300"
        onClick={() => {
          if (scale > 1) onResetZoom()
          else onClose()
        }}
      />

      {/* ── BARRA SUPERIOR (HEADER ESTUDIO) ── */}
      <header
        className={`relative z-20 w-full px-5 py-3.5 flex items-center justify-between gap-4 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        {/* Lado izquierdo: Título, categoría y contador */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-white text-base sm:text-lg font-semibold truncate drop-shadow-sm">
                {displayTitle}
              </h3>
              {displayCategory && (
                <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/40 text-[var(--accent)] text-[10px] font-semibold tracking-[1px] uppercase">
                  {displayCategory}
                </span>
              )}
            </div>
            <span className="text-[11px] tracking-[2px] text-white/50 uppercase mt-0.5">
              M&M Visuals · {currentIndex + 1} de {total}
            </span>
          </div>
        </div>

        {/* Lado derecho: Barra de herramientas en píldora de cristal */}
        <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          {/* Zoom Out */}
          <button
            onClick={onZoomOut}
            disabled={scale <= 1}
            aria-label="Reducir zoom"
            title="Reducir (-) [Zoom]"
            className="w-9 h-9 rounded-full text-white/80 hover:text-white hover:bg-white/15 flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            <i className="fas fa-search-minus text-xs" />
          </button>

          {/* Porcentaje de zoom / Reset */}
          <button
            onClick={onResetZoom}
            aria-label="Restablecer zoom"
            title="Doble clic o clic aquí para restablecer"
            className="px-2.5 h-7 rounded-full bg-white/10 text-white text-[11px] font-semibold tracking-wider flex items-center justify-center hover:bg-[var(--accent)] hover:text-black transition-all cursor-pointer"
          >
            {zoomPercentage}%
          </button>

          {/* Zoom In */}
          <button
            onClick={onZoomIn}
            disabled={scale >= 5}
            aria-label="Aumentar zoom"
            title="Aumentar (+) [Zoom]"
            className="w-9 h-9 rounded-full text-white/80 hover:text-white hover:bg-white/15 flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
          >
            <i className="fas fa-search-plus text-xs" />
          </button>

          <div className="w-px h-4 bg-white/15 mx-0.5" />

          {/* Tira de miniaturas toggle */}
          <button
            onClick={onToggleThumbnails}
            aria-label="Mostrar/ocultar miniaturas"
            title="Miniaturas (T)"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              showThumbnails
                ? 'bg-[var(--accent)]/25 text-[var(--accent)]'
                : 'text-white/80 hover:text-white hover:bg-white/15'
            }`}
          >
            <i className="fas fa-table-cells text-xs" />
          </button>

          {/* Info toggle */}
          {currentImage.description && (
            <button
              onClick={onToggleInfo}
              aria-label="Ver detalles"
              title="Información de la obra (I)"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                showInfo
                  ? 'bg-[var(--accent)]/25 text-[var(--accent)]'
                  : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
            >
              <i className="fas fa-circle-info text-xs" />
            </button>
          )}


          {/* Pantalla completa */}
          <button
            onClick={onToggleFullscreen}
            aria-label="Pantalla completa"
            title="Pantalla completa (F)"
            className="w-9 h-9 rounded-full text-white/80 hover:text-white hover:bg-white/15 hidden sm:flex items-center justify-center transition-all cursor-pointer"
          >
            <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-xs`} />
          </button>

          <div className="w-px h-4 bg-white/15 mx-0.5" />

          {/* Cerrar */}
          <button
            onClick={onClose}
            aria-label="Cerrar visor"
            title="Cerrar (Esc)"
            className="w-9 h-9 rounded-full bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <i className="fas fa-times text-sm" />
          </button>
        </div>
      </header>

      {/* ── ESCENARIO CENTRAL (FOTO) ── */}
      <main
        className="relative z-10 flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Botón Anterior Flotante */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(-1)
          }}
          aria-label="Foto anterior"
          title="Anterior (←)"
          className={`fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/[0.08] hover:bg-white/20 text-white/80 hover:text-white border border-white/10 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <i className="fas fa-chevron-left text-base" />
        </button>

        {/* Botón Siguiente Flotante */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(1)
          }}
          aria-label="Foto siguiente"
          title="Siguiente (→)"
          className={`fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/[0.08] hover:bg-white/20 text-white/80 hover:text-white border border-white/10 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <i className="fas fa-chevron-right text-base" />
        </button>

        {/* Contenedor y Foto */}
        <div className="relative max-w-[94vw] max-h-[82vh] flex items-center justify-center">
          {/* Spinner de carga si es imagen pesada */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <div className="w-10 h-10 border-3 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <img
            src={currentImage.src}
            alt={displayTitle}
            draggable={false}
            onLoad={() => setImageLoaded(true)}
            onDoubleClick={onToggleZoom}
            className={`max-w-[92vw] max-h-[78vh] object-contain rounded-xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] select-none transition-transform ${
              isDragging.current ? 'duration-0' : 'duration-200'
            } ease-out ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} transition-opacity`}
            style={{
              transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`,
              cursor: scale > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'zoom-in',
            }}
          />

          {/* Panel Flotante de Información / Narrativa */}
          {showInfo && currentImage.description && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-6 right-6 max-w-sm z-30 p-5 rounded-2xl bg-black/85 backdrop-blur-2xl border border-white/15 text-white shadow-2xl animate-[fadeUp_0.2s_ease-out]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] tracking-[2px] uppercase text-[var(--accent)] font-semibold">
                  Detalles de la Toma
                </span>
                <button
                  onClick={onToggleInfo}
                  className="text-white/50 hover:text-white text-xs cursor-pointer p-1"
                >
                  <i className="fas fa-times" />
                </button>
              </div>
              <h4 className="font-serif text-base font-bold mb-1.5">{displayTitle}</h4>
              <p className="text-white/80 text-xs leading-relaxed mb-3">
                {currentImage.description}
              </p>
              {currentImage.categoryName && (
                <div className="text-[11px] text-white/50 flex items-center gap-1.5 border-t border-white/10 pt-2.5">
                  <i className="fas fa-tag text-[var(--accent)] text-[10px]" />
                  <span>Categoría: {currentImage.categoryName}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── BARRA INFERIOR (FILMSTRIP / TIRA DE MINIATURAS) ── */}
      {showThumbnails && images.length > 1 && (
        <footer
          className={`relative z-20 w-full pb-4 px-4 transition-all duration-300 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <div className="max-w-4xl mx-auto p-2 rounded-2xl bg-white/[0.06] backdrop-blur-2xl border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
            <div
              ref={filmstripRef}
              className="flex items-center gap-2 overflow-x-auto py-1 px-1 scroll-smooth"
              style={{ scrollbarWidth: 'none' }}
            >
              {images.map((img, idx) => {
                const isActive = idx === currentIndex
                return (
                  <button
                    key={idx}
                    onClick={() => onGoTo(idx)}
                    aria-label={`Ver foto ${idx + 1}`}
                    className={`relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer p-0 border-2 ${
                      isActive
                        ? 'border-[var(--accent)] scale-105 shadow-[0_0_15px_rgba(201,168,76,0.6)] ring-2 ring-[var(--accent)]/30'
                        : 'border-transparent opacity-50 hover:opacity-100 hover:scale-100'
                    }`}
                  >
                    <img
                      src={img.thumbnailSrc || img.src}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {isActive && (
                      <div className="absolute inset-0 bg-[var(--accent)]/15 pointer-events-none" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
