import { useImageModal } from '../hooks/useImageModal'
import { useProgressBar } from '../hooks/useProgressBar'
import { usePhotos } from '../hooks/usePhotos'
import { useCategories } from '../hooks/useCategories'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { Stats } from '../components/Stats'
import { PortfolioGrid } from '../components/Portfolio/PortfolioGrid'
import { ImageModal } from '../components/Modal/ImageModal'
import { About } from '../components/About'
import { Footer } from '../components/Footer'
import type { ImageData } from '../types'

export function PublicPage() {
  const progress = useProgressBar()
  const { photos, loading: photosLoading } = usePhotos()
  const { categories } = useCategories()

  // Adaptar foto a ImageData para el visor con todos sus metadatos
  const mapPhotoToImageData = (p: Photo): ImageData => ({
    src: p.url,
    title: p.title,
    description: p.description,
    categoryName: p.category?.name,
    thumbnailSrc: p.thumbnail_url || p.url,
    width: p.width,
    height: p.height,
    date: p.created_at,
  })

  const initialImages: ImageData[] = photos.map(mapPhotoToImageData)
  const modal = useImageModal(initialImages)

  const handleOpenImage = (index: number, currentList: Photo[]) => {
    const list = currentList.map(mapPhotoToImageData)
    modal.open(index, list)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans antialiased transition-colors duration-300">
      {/* Barra de progreso de scroll */}
      <div
        className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-[#c9a84c] to-[#e8c95a] z-[9999] transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />
      <Header />
      <Hero />
      <Stats photosCount={photos.length} />
      <PortfolioGrid
        photos={photos}
        categories={categories}
        loading={photosLoading}
        onOpenImage={handleOpenImage}
      />
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
