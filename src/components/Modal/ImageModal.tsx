import { useEffect, useRef, useCallback, useState } from 'react'
import imageCompression from 'browser-image-compression'
import type { ImageData } from '../../types'
import { useTheme } from '../../context/ThemeContext'
import { useAuthContext } from '../../context/AuthContext'

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
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const { user, session } = useAuthContext()
  const isAuthenticated = Boolean(user || session)

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

  const [downloading, setDownloading] = useState(false)
  const [downloadToast, setDownloadToast] = useState<string | null>(null)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const downloadMenuRef = useRef<HTMLDivElement>(null)

  // Cerrar menú de descarga al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target as Node)) {
        setShowDownloadMenu(false)
      }
    }
    if (showDownloadMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDownloadMenu])

  // Descarga inteligente de alta fidelidad (Solo para el fotógrafo con sesión iniciada)
  const executeDownload = useCallback(
    async (mode: 'auto' | 'mobile' | 'original' = 'auto') => {
      if (!isAuthenticated || !currentImage || downloading) return

      setDownloading(true)
      setShowDownloadMenu(false)

      const isMobileDevice =
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768
      const targetMode = mode === 'auto' ? (isMobileDevice ? 'mobile' : 'original') : mode

      const baseName = (currentImage.title || 'mm-visuals-foto')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      setDownloadToast(
        targetMode === 'mobile'
          ? 'Preparando foto para celular (~2 MB · Ultra HD)...'
          : 'Descargando archivo original en máxima calidad...'
      )

      try {
        const res = await fetch(currentImage.src)
        const rawBlob = await res.blob()

        let finalBlob: Blob = rawBlob

        // En modo móvil, si la foto pesa más de 2.2 MB, se optimiza a ~2.0 MB con resolución 3200px (calidad 0.93)
        // Esto mantiene nitidez Retina/4K absoluta en teléfonos sin sobrecargar la memoria ni ralentizar la descarga.
        if (targetMode === 'mobile' && rawBlob.size > 2.2 * 1024 * 1024) {
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
            console.warn('Fallback a imagen original:', err)
            finalBlob = rawBlob
          }
        }

        const blobUrl = URL.createObjectURL(finalBlob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.target = '_self'
        const suffix = targetMode === 'mobile' ? '-mobile-hd' : '-original'
        a.download = `${baseName || 'foto'}${suffix}.jpg`
        document.body.appendChild(a)
        a.click()

        const finalMB = (finalBlob.size / (1024 * 1024)).toFixed(1)
        setDownloadToast(`¡Descarga lista! (${finalMB} MB)`)
        setTimeout(() => setDownloadToast(null), 3500)

        // Limpieza diferida para compatibilidad con iOS Safari y Chrome Mobile
        setTimeout(() => {
          if (document.body.contains(a)) document.body.removeChild(a)
          URL.revokeObjectURL(blobUrl)
        }, 12000)
      } catch {
        const a = document.createElement('a')
        a.href = currentImage.src
        a.download = `${baseName || 'foto'}.jpg`
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setDownloadToast('Iniciando descarga...')
        setTimeout(() => setDownloadToast(null), 2500)
      } finally {
        setDownloading(false)
      }
    },
    [isAuthenticated, currentImage, downloading]
  )

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
      else if ((e.key === 'd' || e.key === 'D') && isAuthenticated) executeDownload('auto')
    },
    [onClose, onNavigate, onZoomIn, onZoomOut, onResetZoom, onToggleFullscreen, onToggleInfo, onToggleThumbnails, isAuthenticated, executeDownload]
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

      if (elapsed < 600) { // Mayor tiempo para gestos
        if (Math.abs(deltaX) > 40 && Math.abs(deltaY) < 100) {
          if (deltaX < 0) onNavigate(1)
          else onNavigate(-1)
        } else if (deltaY > 60 && Math.abs(deltaX) < 100) {
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
      className="fixed inset-0 z-[2000] flex flex-col select-none overflow-hidden"
      onMouseMove={resetControlsTimer}
    >
      {/* Fondo cinematográfico adaptativo con desenfoque de cristal */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${isLight
          ? 'bg-[#f7f4ed]/97 backdrop-blur-2xl'
          : 'bg-[#070707]/94 backdrop-blur-2xl'
          }`}
        onClick={() => {
          if (scale > 1) onResetZoom()
          else onClose()
        }}
      />

      {/* ── BARRA SUPERIOR (HEADER ESTUDIO) ── */}
      <header
        className={`relative z-20 w-full px-3 md:px-5 py-3 md:py-3.5 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
      >
        {/* Lado izquierdo: Título, categoría y contador */}
        <div className="flex items-center gap-3.5 min-w-0 justify-center md:justify-start w-full md:w-auto">
          <div className="flex flex-col min-w-0 items-center md:items-start text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              <h3 className={`font-serif text-sm md:text-lg font-semibold truncate ${isLight ? 'text-[#25201b]' : 'text-white drop-shadow-sm'
                }`}>
                {displayTitle}
              </h3>
              {displayCategory && (
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] text-[9px] md:text-[10px] font-semibold tracking-[1px] uppercase">
                  {displayCategory}
                </span>
              )}
            </div>
            <span className={`text-[9px] md:text-[11px] tracking-[1.5px] md:tracking-[2px] uppercase mt-1 md:mt-0.5 ${isLight ? 'text-[#746b62]' : 'text-white/50'
              }`}>
              M&M Visuals · {currentIndex + 1} de {total}
            </span>
          </div>
        </div>

        {/* Lado derecho: Barra de herramientas en píldora de cristal */}
        <div className={`flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full backdrop-blur-xl transition-colors max-w-full overflow-x-auto ${isLight
          ? 'bg-black/[0.05] border border-black/10 shadow-[0_8px_25px_rgba(0,0,0,0.06)]'
          : 'bg-white/[0.08] border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)]'
          }`}>
          {/* Zoom Out */}
          <button
            onClick={onZoomOut}
            disabled={scale <= 1}
            aria-label="Reducir zoom"
            title="Reducir (-) [Zoom]"
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer ${isLight
              ? 'text-[#25201b]/80 hover:text-[#25201b] hover:bg-black/10'
              : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
          >
            <i className="fas fa-search-minus text-xs" />
          </button>

          {/* Porcentaje de zoom / Reset */}
          <button
            onClick={onResetZoom}
            aria-label="Restablecer zoom"
            title="Doble clic o clic aquí para restablecer"
            className={`px-2 sm:px-2.5 h-6 sm:h-7 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wider flex items-center justify-center hover:bg-[var(--accent)] hover:text-black transition-all cursor-pointer ${isLight
              ? 'bg-black/10 text-[#25201b]'
              : 'bg-white/10 text-white'
              }`}
          >
            {zoomPercentage}%
          </button>

          {/* Zoom In */}
          <button
            onClick={onZoomIn}
            disabled={scale >= 5}
            aria-label="Aumentar zoom"
            title="Aumentar (+) [Zoom]"
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer ${isLight
              ? 'text-[#25201b]/80 hover:text-[#25201b] hover:bg-black/10'
              : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
          >
            <i className="fas fa-search-plus text-xs" />
          </button>

          <div className={`w-px h-4 mx-0.5 ${isLight ? 'bg-black/15' : 'bg-white/15'}`} />

          {/* Tira de miniaturas toggle */}
          <button
            onClick={onToggleThumbnails}
            aria-label="Mostrar/ocultar miniaturas"
            title="Miniaturas (T)"
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${showThumbnails
              ? 'bg-[var(--accent)]/25 text-[var(--accent)]'
              : isLight
                ? 'text-[#25201b]/80 hover:text-[#25201b] hover:bg-black/10'
                : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
          >
            <i className="fas fa-table-cells text-xs" />
          </button>

          {/* Info toggle (Datos) */}
          <button
            onClick={onToggleInfo}
            aria-label="Ver datos y detalles"
            title="Datos y detalles de la foto (I)"
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${showInfo
              ? 'bg-[var(--accent)]/25 text-[var(--accent)]'
              : isLight
                ? 'text-[#25201b]/80 hover:text-[#25201b] hover:bg-black/10'
                : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
          >
            <i className="fas fa-circle-info text-xs" />
          </button>

          {/* Pantalla completa */}
          <button
            onClick={onToggleFullscreen}
            aria-label="Pantalla completa"
            title="Pantalla completa (F)"
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full hidden sm:flex items-center justify-center transition-all cursor-pointer ${isLight
              ? 'text-[#25201b]/80 hover:text-[#25201b] hover:bg-black/10'
              : 'text-white/80 hover:text-white hover:bg-white/15'
              }`}
          >
            <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-xs`} />
          </button>

          {/* Descarga inteligente exclusiva para cuenta iniciada (Admin) */}
          {isAuthenticated && (
            <div className="relative" ref={downloadMenuRef}>
              <button
                onClick={() => setShowDownloadMenu((v) => !v)}
                disabled={downloading}
                aria-label="Descargar foto"
                title="Descargar foto (Elegir: Celular ~2 MB o Calidad Original)"
                className={`px-2.5 h-8 sm:h-9 rounded-full flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${isLight
                  ? 'bg-emerald-500/15 hover:bg-emerald-500 text-emerald-700 hover:text-white'
                  : 'bg-emerald-500/25 hover:bg-emerald-500 text-emerald-300 hover:text-white'
                  }`}
              >
                {downloading ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <i className="fas fa-download text-xs" />
                )}
                <span className="text-[11px] font-semibold hidden min-[480px]:inline">Descargar</span>
                <i className={`fas fa-caret-down text-[10px] transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Menú flotante de calidad */}
              {showDownloadMenu && (
                <div
                  className={`absolute right-0 mt-2 w-72 rounded-2xl p-2.5 z-50 backdrop-blur-2xl shadow-2xl border animate-[fadeUp_0.15s_ease-out] ${isLight
                    ? 'bg-white/95 border-[var(--border-color)] text-[#25201b]'
                    : 'bg-[#141414]/95 border-white/15 text-white'
                    }`}
                >
                  <div className="px-3 py-1.5 border-b border-black/5 dark:border-white/10 mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] tracking-[1.5px] uppercase font-bold text-[var(--accent)]">
                      Opciones de descarga
                    </span>
                    <button
                      onClick={() => setShowDownloadMenu(false)}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                    >
                      <i className="fas fa-xmark" />
                    </button>
                  </div>
                  <button
                    onClick={() => executeDownload('mobile')}
                    className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center gap-3 cursor-pointer ${isLight ? 'hover:bg-black/5' : 'hover:bg-white/10'
                      }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0">
                      <i className="fas fa-mobile-screen text-sm" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-xs">Para Celular (~2 MB)</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-semibold uppercase">Recomendada</span>
                      </div>
                      <p className={`text-[10px] mt-0.5 leading-snug ${isLight ? 'text-[#746b62]' : 'text-white/60'}`}>
                        Ultra HD optimizada para WhatsApp y teléfono
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => executeDownload('original')}
                    className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center gap-3 cursor-pointer ${isLight ? 'hover:bg-black/5' : 'hover:bg-white/10'
                      }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                      <i className="fas fa-camera text-sm" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-xs">Calidad Original Completa</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent)]/15 text-[var(--accent)] font-semibold uppercase">Máx</span>
                      </div>
                      <p className={`text-[10px] mt-0.5 leading-snug ${isLight ? 'text-[#746b62]' : 'text-white/60'}`}>
                        Archivo nativo de cámara sin compresión
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          <div className={`w-px h-4 mx-0.5 ${isLight ? 'bg-black/15' : 'bg-white/15'}`} />

          {/* Cerrar */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            aria-label="Cerrar visor"
            title="Cerrar (Esc)"
            className={`w-11 h-11 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${isLight
              ? 'bg-red-500/15 hover:bg-red-500 text-red-600 hover:text-white'
              : 'bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white'
              }`}
          >
            <i className="fas fa-times text-base sm:text-sm" />
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
        {/* Notificación flotante de estado de descarga */}
        {downloadToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-black/85 text-white text-xs font-medium shadow-2xl backdrop-blur-xl border border-white/20 flex items-center gap-2.5 animate-[fadeUp_0.2s_ease-out]">
            {downloading ? (
              <div className="w-3.5 h-3.5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <i className="fas fa-check-circle text-emerald-400 shrink-0" />
            )}
            <span>{downloadToast}</span>
          </div>
        )}

        {/* Botón Anterior Flotante */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(-1)
          }}
          aria-label="Foto anterior"
          title="Anterior (←)"
          className={`fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full backdrop-blur-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${isLight
            ? 'bg-black/[0.06] hover:bg-black/15 text-[#25201b] border border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.08)]'
            : 'bg-white/[0.08] hover:bg-white/20 text-white border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
            } ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
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
          className={`fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full backdrop-blur-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ${isLight
            ? 'bg-black/[0.06] hover:bg-black/15 text-[#25201b] border border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.08)]'
            : 'bg-white/[0.08] hover:bg-white/20 text-white border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
            } ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
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
            className={`max-w-[92vw] max-h-[78vh] object-contain rounded-xl select-none transition-transform ${isDragging.current ? 'duration-0' : 'duration-200'
              } ease-out ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              } ${isLight
                ? 'shadow-[0_20px_70px_rgba(0,0,0,0.18)]'
                : 'shadow-[0_25px_80px_rgba(0,0,0,0.8)]'
              } transition-opacity`}
            style={{
              transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`,
              cursor: scale > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'zoom-in',
            }}
          />

          {/* Panel Flotante de Información / Narrativa */}
          {showInfo && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute bottom-2 left-2 right-2 md:bottom-6 md:left-auto md:right-6 w-auto md:max-w-sm z-50 p-4 shrink-0 rounded-2xl backdrop-blur-3xl shadow-[0_10px_40px_rgba(0,0,0,0.4)] animate-[fadeUp_0.2s_ease-out] ${isLight
                ? 'bg-white/95 border border-[var(--border-color)] text-[#25201b]'
                : 'bg-[#111111]/95 border border-white/15 text-white'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] tracking-[2px] uppercase text-[var(--accent)] font-semibold">
                  Detalles de la Fotografía
                </span>
                <button
                  onClick={onToggleInfo}
                  className={`text-xs cursor-pointer p-1 ${isLight ? 'text-[#746b62] hover:text-[#25201b]' : 'text-white/50 hover:text-white'
                    }`}
                >
                  <i className="fas fa-times" />
                </button>
              </div>
              <h4 className="font-serif text-sm md:text-base font-bold mb-1.5">{displayTitle}</h4>
              <p className={`text-[11px] md:text-xs leading-relaxed mb-3 ${isLight ? 'text-[#746b62]' : 'text-white/80'
                }`}>
                {currentImage.description?.trim() || 'Fotografía profesional en alta resolución de M&M Visuals.'}
              </p>
              <div className={`text-[10px] md:text-[11px] flex flex-col gap-1.5 border-t pt-2.5 ${isLight ? 'text-[#746b62] border-black/10' : 'text-white/50 border-white/10'}`}>
                {currentImage.categoryName && (
                  <div className="flex items-center gap-1.5">
                    <i className="fas fa-tag text-[var(--accent)] text-[10px]" />
                    <span>Categoría: <strong>{currentImage.categoryName}</strong></span>
                  </div>
                )}
                {currentImage.width && currentImage.height && (
                  <div className="flex items-center gap-1.5">
                    <i className="fas fa-expand text-[var(--accent)] text-[10px]" />
                    <span>Resolución: {currentImage.width} × {currentImage.height} px</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── BARRA INFERIOR (FILMSTRIP / TIRA DE MINIATURAS) ── */}
      {showThumbnails && images.length > 1 && (
        <footer
          className={`relative z-20 w-full pb-4 px-4 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
        >
          <div className={`max-w-4xl mx-auto p-2 rounded-2xl backdrop-blur-2xl transition-colors ${isLight
            ? 'bg-black/[0.05] border border-black/10 shadow-[0_10px_35px_rgba(0,0,0,0.08)]'
            : 'bg-white/[0.06] border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.6)]'
            }`}>
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
                    className={`relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer p-0 border-2 ${isActive
                      ? 'border-[var(--accent)] scale-105 shadow-[0_0_15px_rgba(201,168,76,0.6)] ring-2 ring-[var(--accent)]/30'
                      : isLight
                        ? 'border-transparent opacity-60 hover:opacity-100 hover:scale-100'
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

