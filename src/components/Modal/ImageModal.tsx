import { useEffect, useRef, useCallback } from 'react'
import type { ImageData } from '../../types'

interface Props {
  isOpen: boolean
  currentImage: ImageData
  currentIndex: number
  total: number
  scale: number
  pan: { x: number; y: number }
  onClose: () => void
  onNavigate: (dir: number) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoom: (delta: number) => void
  onResetZoom: () => void
  onPan: (x: number, y: number) => void
}

export function ImageModal({
  isOpen, currentImage, currentIndex, total, scale, pan,
  onClose, onNavigate, onZoomIn, onZoomOut, onZoom, onResetZoom, onPan,
}: Props) {
  const isDragging = useRef(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const panRef = useRef(pan)
  panRef.current = pan

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') onNavigate(-1)
      else if (e.key === 'ArrowRight') onNavigate(1)
    },
    [onClose, onNavigate]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

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
      if (!isDragging.current) return
      onPan(e.pageX - startX.current, e.pageY - startY.current)
    },
    [onPan]
  )

  const handleMouseUp = useCallback(() => { isDragging.current = false }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const step = Math.max(0.01, Math.min(Math.abs(e.deltaY) * 0.0004225, 0.0845))
    onZoom(e.deltaY > 0 ? -step : step)
  }, [onZoom])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/92 backdrop-blur-[30px]" onClick={onClose} />

      <button onClick={onClose} className="fixed top-6 right-6 z-[2002] w-11 h-11 rounded-full bg-white/10 text-white border-none flex items-center justify-center cursor-pointer backdrop-blur-md transition-all duration-300 hover:bg-white/15 hover:rotate-90">
        <i className="fas fa-times text-lg" />
      </button>

      <div className="fixed top-6 left-6 z-[2002] flex gap-2">
        <button onClick={onZoomIn} className="zoom-btn"><i className="fas fa-search-plus" /></button>
        <button onClick={onZoomOut} className="zoom-btn"><i className="fas fa-search-minus" /></button>
        <button onClick={onResetZoom} className="zoom-btn"><i className="fas fa-sync-alt" /></button>
      </div>

      <button onClick={() => onNavigate(-1)} className="fixed top-1/2 -translate-y-1/2 left-6 z-[2002] w-12 h-12 rounded-full bg-white/[0.06] text-white border-none flex items-center justify-center cursor-pointer backdrop-blur-md transition-all duration-300 hover:bg-white/[0.12] hover:scale-105">
        <i className="fas fa-chevron-left text-lg" />
      </button>
      <button onClick={() => onNavigate(1)} className="fixed top-1/2 -translate-y-1/2 right-6 z-[2002] w-12 h-12 rounded-full bg-white/[0.06] text-white border-none flex items-center justify-center cursor-pointer backdrop-blur-md transition-all duration-300 hover:bg-white/[0.12] hover:scale-105">
        <i className="fas fa-chevron-right text-lg" />
      </button>

      <div className="relative z-10 max-w-[92vw] max-h-[88vh]">
        <img
          src={currentImage.src}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-transform duration-100 ease-out select-none"
          style={{
            transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`,
            cursor: scale > 1 ? (isDragging.current ? 'grabbing' : 'grab') : '',
          }}
          alt=""
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          draggable={false}
        />
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2002] text-xs text-[#999] tracking-[2px]">
        {currentIndex + 1} / {total}
      </div>
    </div>
  )
}
