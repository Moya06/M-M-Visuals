import { useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'

export function Hero() {
  const bgRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    function onScroll() {
      if (bgRef.current) {
        const offset = window.scrollY * 0.35
        bgRef.current.style.transform = `translateY(${offset}px) scale(1.1)`
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center text-center overflow-hidden bg-[var(--bg-primary)] scroll-mt-20 pt-24 pb-16"
    >
      {/* Imagen fotográfica de fondo restaurada */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center will-change-transform scale-105 transition-opacity duration-500"
        style={{ backgroundImage: "url('fotos/DSC01428-2.PNG')" }}
      />

      {/* Capas de iluminación adaptativas según el tema activo */}
      {theme === 'dark' ? (
        <>
          {/* En modo oscuro: viñeta y gradiente nocturno elegante */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-[var(--bg-primary)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,black_85%)]" />
        </>
      ) : (
        <>
          {/* En modo claro: luz cálida y nítida que deja ver la fotografía y da máxima legibilidad al texto */}
          <div className="absolute inset-0 bg-[rgba(247,244,237,0.68)] backdrop-blur-[0.5px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(247,244,237,0.92)] via-[rgba(247,244,237,0.4)] to-[var(--bg-primary)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(247,244,237,0.7)_85%)]" />
        </>
      )}

      <div className="relative z-10 max-w-[800px] px-5">
        <p className="animate-fade-up [animation-delay:200ms] text-[13px] tracking-[4px] uppercase text-[var(--accent)] font-semibold mb-5 opacity-0">
          M&M Visuals · Fotografía
        </p>
        <h1 className="animate-fade-up [animation-delay:400ms] font-serif text-[clamp(2.8rem,7vw,5.5rem)] font-bold leading-[1.1] mb-6 opacity-0 text-[var(--text-main)]">
          Cada imagen<br />
          cuenta una <span className="text-[var(--accent)] italic">historia</span>
        </h1>
        <p className="animate-fade-up [animation-delay:600ms] text-[clamp(1rem,1.4vw,1.15rem)] text-[var(--text-muted)] mb-8 max-w-[580px] mx-auto opacity-0 leading-relaxed">
          Capturando momentos con autenticidad y elegancia. Cada disparo es una oportunidad para inmortalizar lo irrepetible.
        </p>
        <a
          href="#portfolio"
          className="animate-fade-up [animation-delay:800ms] inline-flex items-center gap-2.5 px-9 py-3.5 rounded-full bg-[var(--accent)] text-white no-underline font-semibold text-sm tracking-[1px] uppercase transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(142,108,56,0.35)] hover:bg-[var(--accent-hover)] opacity-0 shadow-md"
        >
          Ver mi trabajo <i className="fas fa-arrow-right" />
        </a>
      </div>

      <div className="animate-fade-up [animation-delay:1200ms] absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-0">
        <span className="text-[10px] tracking-[3px] uppercase text-[var(--text-muted)]">Descubre</span>
        <div className="w-px h-10 bg-gradient-to-b from-[var(--accent)] to-transparent animate-[scrollPulse_2s_ease-in-out_infinite]" />
      </div>
    </section>
  )
}
