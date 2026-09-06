import { useCallback, useMemo } from 'react'
import { useAuthContext } from '../context/AuthContext'
import { useImageModal } from '../hooks/useImageModal'
import { useProgressBar } from '../hooks/useProgressBar'
import { usePhotos } from '../hooks/usePhotos'
import { useCategories } from '../hooks/useCategories'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { Stats } from '../components/Stats'
import { PortfolioGrid } from '../components/Portfolio/PortfolioGrid'
import { PrivatePortfolioSection } from '../components/Portfolio/PrivatePortfolioSection'
import { ImageModal } from '../components/Modal/ImageModal'
import { About } from '../components/About'
import { Footer } from '../components/Footer'
import type { ImageData, Photo } from '../types'

export function PublicPage() {
  const progress = useProgressBar()
  const { isSuperAdmin } = useAuthContext()
  const { photos: allPhotos, loading: photosLoading } = usePhotos()
  const { categories } = useCategories()

  // Separar fotografías públicas y privadas
  const publicPhotos = useMemo(() => allPhotos.filter((p) => !p.is_private), [allPhotos])
  const privatePhotos = useMemo(() => allPhotos.filter((p) => Boolean(p.is_private)), [allPhotos])

  // Adaptar foto a ImageData para el visor con todos sus metadatos
  const mapPhotoToImageData = useCallback((p: Photo): ImageData => ({
    src: p.url,
    title: p.title,
    description: p.description,
    categoryName: p.category?.name,
    thumbnailSrc: p.thumbnail_url || p.url,
    width: p.width,
    height: p.height,
    date: p.created_at,
    is_private: p.is_private,
  }), [])

  const initialImages: ImageData[] = useMemo(() => {
    return (isSuperAdmin ? allPhotos : publicPhotos).map(mapPhotoToImageData)
  }, [isSuperAdmin, allPhotos, publicPhotos, mapPhotoToImageData])

  const modal = useImageModal(initialImages)

  const handleOpenImage = useCallback((index: number, currentList: Photo[]) => {
    const list = currentList.map(mapPhotoToImageData)
    modal.open(index, list)
  }, [mapPhotoToImageData, modal.open])

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans antialiased transition-colors duration-300 animate-fade-in">
      {/* Barra de progreso de scroll */}
      <div
        className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-[#c9a84c] to-[#e8c95a] z-[9999] transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />
      <Header />
      <Hero />
      <Stats photosCount={isSuperAdmin ? allPhotos.length : publicPhotos.length} />
      
      {/* Galería Pública Principal */}
      <PortfolioGrid
        photos={publicPhotos}
        categories={categories}
        loading={photosLoading}
        onOpenImage={handleOpenImage}
      />

      {/* Apartado Diferente Exclusivo para Fotos Privadas (Solo visible con sesión de Super Admin) */}
      {isSuperAdmin && (
        <PrivatePortfolioSection
          photos={privatePhotos}
          onOpenImage={handleOpenImage}
        />
      )}

      <ImageModal
        isOpen={modal.isOpen}
        currentImage={modal.currentImage}
        images={modal.images}
        currentIndex={modal.currentIndex}
        total={modal.images.length}
        scale={modal.scale}
        pan={modal.pan}
        isFullscreen={modal.isFullscreen}
        showInfo={modal.showInfo}
        showThumbnails={modal.showThumbnails}
        onClose={modal.close}
        onNavigate={modal.navigate}
        onGoTo={modal.goTo}
        onZoomIn={modal.zoomIn}
        onZoomOut={modal.zoomOut}
        onZoom={modal.zoom}
        onToggleZoom={modal.toggleZoom}
        onResetZoom={modal.resetZoom}
        onPan={modal.handlePan}
        onToggleFullscreen={modal.toggleFullscreen}
        onToggleInfo={modal.toggleInfo}
        onToggleThumbnails={modal.toggleThumbnails}
      />
      <About />
      <Footer />
    </div>
  )
}
