import { useState, useCallback, useEffect } from 'react'
import type { ImageData } from '../types'

export function useImageModal(initialImages: ImageData[] = []) {
  const [images, setImages] = useState<ImageData[]>(initialImages)
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showThumbnails, setShowThumbnails] = useState(true)

  // Sincronizar si cambia initialImages y no está abierto (con verificación para evitar ciclos infinitos)
  useEffect(() => {
    if (!isOpen && initialImages.length > 0) {
      setImages((prev) => {
        if (
          prev.length === initialImages.length &&
          prev.every((img, i) => img.src === initialImages[i]?.src && img.title === initialImages[i]?.title)
        ) {
          return prev
        }
        return initialImages
      })
    }
  }, [initialImages, isOpen])

  const open = useCallback((index: number, newImages?: ImageData[]) => {
    if (newImages && newImages.length > 0) {
      setImages(newImages)
    }
    setCurrentIndex(index)
    setScale(1)
    setPan({ x: 0, y: 0 })
    setIsOpen(true)
    document.body.style.overflow = 'hidden'
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    document.body.style.overflow = ''
    setScale(1)
    setPan({ x: 0, y: 0 })
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
    setIsFullscreen(false)
  }, [])

  const goTo = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index)
      setScale(1)
      setPan({ x: 0, y: 0 })
    }
  }, [images.length])

  const navigate = useCallback(
    (direction: number) => {
      setCurrentIndex((prev) => {
        if (images.length === 0) return 0
        const next = (prev + direction + images.length) % images.length
        setScale(1)
        setPan({ x: 0, y: 0 })
        return next
      })
    },
    [images.length]
  )

  const zoomIn = useCallback(() => setScale((s) => Math.min(s + 0.25, 5)), [])
  const zoomOut = useCallback(() => {
    setScale((s) => {
      const next = Math.max(s - 0.25, 1)
      if (next <= 1) setPan({ x: 0, y: 0 })
      return next
    })
  }, [])

  const zoom = useCallback((delta: number) => {
    setScale((s) => {
      const next = Math.max(1, Math.min(5, s + delta))
      if (next <= 1) setPan({ x: 0, y: 0 })
      return next
    })
  }, [])

  const toggleZoom = useCallback(() => {
    setScale((s) => {
      if (s > 1) {
        setPan({ x: 0, y: 0 })
        return 1
      }
      return 2
    })
  }, [])

  const resetZoom = useCallback(() => {
    setScale(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const handlePan = useCallback((x: number, y: number) => setPan({ x, y }), [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch(() => {})
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
      }).catch(() => {})
    }
  }, [])

  const toggleInfo = useCallback(() => setShowInfo((prev) => !prev), [])
  const toggleThumbnails = useCallback(() => setShowThumbnails((prev) => !prev), [])

  return {
    isOpen,
    images,
    currentIndex,
    scale,
    pan,
    isFullscreen,
    showInfo,
    showThumbnails,
    currentImage: images[currentIndex],
    open,
    close,
    goTo,
    navigate,
    zoomIn,
    zoomOut,
    zoom,
    toggleZoom,
    resetZoom,
    handlePan,
    toggleFullscreen,
    toggleInfo,
    toggleThumbnails,
  }
}
