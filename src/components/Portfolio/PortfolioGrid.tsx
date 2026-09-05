import { useEffect, useRef, useState } from 'react'
import type { Photo, Category } from '../../types'
import { PortfolioItem } from './PortfolioItem'
import { CategoryFilter } from '../CategoryFilter'

interface Props {
  photos: Photo[]
  categories: Category[]
  loading?: boolean
  onOpenImage: (index: number, currentList: Photo[]) => void
}

export function PortfolioGrid({ photos, categories, loading = false, onOpenImage }: Props) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

  // Filtrado en cliente (sin re-fetch)
  const filtered = activeCategoryId
    ? photos.filter((p) => {
        if (p.category_id === activeCategoryId) return true
        // Si la categoría seleccionada es un padre, incluir fotos de sus subcategorías
        const subcatIds = categories
          .filter((c) => c.parent_id === activeCategoryId)
          .map((c) => c.id)
        return p.category_id ? subcatIds.includes(p.category_id) : false
      })
    : photos

  return (
    <section className="py-[120px] scroll-mt-20" id="portfolio">
      <div className="max-w-[1300px] mx-auto px-6">
        <div className="text-center mb-[60px]">
          <div className="text-[11px] tracking-[4px] uppercase text-[#c9a84c] mb-3">Galería</div>
          <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] relative inline-block after:block after:w-10 after:h-[2px] after:bg-[#c9a84c] after:mx-auto after:mt-4">
            Mi Portafolio
          </h2>
        </div>

        {/* Filtro de categorías */}
        {categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            activeId={activeCategoryId}
            onSelect={setActiveCategoryId}
          />
        )}

        {/* Estado de carga */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Grilla */}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-[#555] py-20">No hay fotos en esta categoría.</p>
        )}

        <div ref={gridRef} className="columns-3 gap-6 max-sm:columns-1 max-md:columns-2">
          {filtered.map((photo, i) => (
            <PortfolioItem
              key={photo.id}
              image={{ src: photo.thumbnail_url ?? photo.url }}
              index={i}
              onOpen={() => onOpenImage(i, filtered)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
