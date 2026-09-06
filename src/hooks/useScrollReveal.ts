import { useEffect, useRef, useState } from 'react'

export function useScrollReveal<T extends HTMLElement>(threshold = 0.08) {
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true)
      return
    }

    // Si ya está dentro del viewport visible en el momento de montar, activar de inmediato
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight + 50 && rect.bottom > -50) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold, rootMargin: '50px 0px 50px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}
