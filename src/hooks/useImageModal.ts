import { useState, useCallback } from 'react'
import type { ImageData } from '../types'

export function useImageModal(images: ImageData[]) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })

  const open = useCallback((index: number) => {
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
  }, [])

  const navigate = useCallback(
    (direction: number) => {
      setCurrentIndex((prev) => {
        const next = (prev + direction + images.length) % images.length
        setScale(1)
        setPan({ x: 0, y: 0 })
        return next
      })
    },
    [images.length]
  )

  const zoomIn = useCallback(() => setScale((s) => Math.min(s + 0.15, 15)), [])
  const zoomOut = useCallback(() => {
    setScale((s) => {
      const next = Math.max(s - 0.15, 1)
      if (next <= 1) setPan({ x: 0, y: 0 })
      return next
    })
  }, [])
  const zoom = useCallback((delta: number) => {
    setScale((s) => {
      const next = Math.max(1, Math.min(15, s + delta))
      if (next <= 1) setPan({ x: 0, y: 0 })
      return next
    })
  }, [])
  const resetZoom = useCallback(() => { setScale(1); setPan({ x: 0, y: 0 }) }, [])
  const handlePan = useCallback((x: number, y: number) => setPan({ x, y }), [])

  return {
    isOpen, currentIndex, scale, pan,
    currentImage: images[currentIndex],
    open, close, navigate, zoomIn, zoomOut, zoom, resetZoom, handlePan,
  }
}
