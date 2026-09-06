import { useEffect, useRef, useState } from 'react'
import type { ImageData } from '../../types'

interface Props {
  image: ImageData
  index: number
  onOpen: (index: number) => void
}

export function PortfolioItem({ image, index, onOpen }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true)
      return
    }

    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight + 100 && rect.bottom > -100) {
      // Pequeño retardo de frame (35ms) para que el navegador registre el estado inicial (opacity-0)
      // y la transición CSS se reproduzca con total suavidad desde la primera imagen (index 0)
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 35)
      return () => clearTimeout(timer)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.02, rootMargin: '120px 0px 120px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`relative cursor-pointer bg-[#1a1a1a] break-inside-avoid mb-6 rounded-xl overflow-hidden transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(0,0,0,0.35)] group ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-[0.98]'
      }`}
      style={{ transitionDelay: `${(index % 4) * 80}ms` }}
      onClick={() => onOpen(index)}
    >
      <img
        src={image.src}
        className="w-full h-auto block transition-transform duration-800 group-hover:scale-105"
        alt=""
        loading="lazy"
        decoding="async"
        fetchPriority={index < 6 ? 'high' : undefined}
        onError={(e) => {
          e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%23222" width="400" height="300"/><text x="50%" y="50%" fill="%23555" text-anchor="middle" dy=".3em" font-family="sans-serif">Sin imagen</text></svg>'
        }}
      />
      {image.is_private && (
        <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-400 text-[10px] font-semibold flex items-center gap-1 shadow-md">
          <i className="fas fa-lock text-[9px]" />
          <span>Privada</span>
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <i className="fas fa-eye text-white text-2xl" />
      </div>
    </div>
  )
}
