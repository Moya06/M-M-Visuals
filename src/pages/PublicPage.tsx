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

  // Adaptar fotos a ImageData para el modal (usa la URL full-res)
  const imageList: ImageData[] = photos.map((p) => ({ src: p.url }))
  const modal = useImageModal(imageList)

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
        onOpenImage={modal.open}
      />
      <ImageModal
        isOpen={modal.isOpen}
        currentImage={modal.currentImage ?? { src: '' }}
        currentIndex={modal.currentIndex}
        total={imageList.length}
        scale={modal.scale}
        pan={modal.pan}
        onClose={modal.close}
        onNavigate={modal.navigate}
        onZoomIn={modal.zoomIn}
        onZoomOut={modal.zoomOut}
        onZoom={modal.zoom}
        onResetZoom={modal.resetZoom}
        onPan={modal.handlePan}
      />
      <About />
      <Footer />
    </div>
  )
}
