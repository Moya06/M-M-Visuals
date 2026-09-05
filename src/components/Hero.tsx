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
      {/* Imagen fotográfica de fondo nítida y protagonista */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center will-change-transform scale-105 transition-transform duration-500"
        style={{ backgroundImage: "url('/fotos/DSC01428-2.PNG')" }}
      />

      {/* Capas de iluminación translúcidas que permiten apreciar la foto con total nitidez */}
      {theme === 'dark' ? (
        <>
          {/* En modo oscuro: suave viñeta y transición progresiva en el tercio inferior */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.45)_100%)] pointer-events-none" />
          <div
            className="absolute bottom-0 left-0 right-0 h-64 sm:h-80 md:h-[340px] pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, var(--bg-primary) 0%, color-mix(in srgb, var(--bg-primary) 65%, transparent) 32%, color-mix(in srgb, var(--bg-primary) 20%, transparent) 68%, transparent 100%)',
            }}
          />
        </>
      ) : (
        <>
          {/* En modo claro: sutil tinte cinematográfico para contraste del texto blanco, y difuminado progresivo hacia el fondo */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-transparent pointer-events-none" />
          <div
            className="absolute bottom-0 left-0 right-0 h-64 sm:h-80 md:h-[340px] pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, var(--bg-primary) 0%, color-mix(in srgb, var(--bg-primary) 65%, transparent) 30%, color-mix(in srgb, var(--bg-primary) 20%, transparent) 65%, transparent 100%)',
            }}
          />
        </>
      )}

      <div className="relative z-10 max-w-[820px] px-5 py-4">
        <p className="animate-fade-up [animation-delay:200ms] text-[13px] tracking-[4px] uppercase text-[#e8c872] font-semibold mb-5 opacity-0 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          M&M Visuals · Fotografía
        </p>
        <h1 className="animate-fade-up [animation-delay:400ms] font-serif text-[clamp(2.8rem,7vw,5.5rem)] font-bold leading-[1.1] mb-6 opacity-0 text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
          Cada imagen<br />
          cuenta una <span className="text-[#e8c872] italic drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">historia</span>
        </h1>
        <p className="animate-fade-up [animation-delay:600ms] text-[clamp(1rem,1.4vw,1.18rem)] text-white/95 mb-8 max-w-[580px] mx-auto opacity-0 leading-relaxed font-medium drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
          Capturando momentos con autenticidad y elegancia. Cada disparo es una oportunidad para inmortalizar lo irrepetible.
        </p>
        <a
          href="#portfolio"
          className="animate-fade-up [animation-delay:800ms] inline-flex items-center gap-2.5 px-9 py-3.5 rounded-full bg-[var(--accent)] text-white no-underline font-semibold text-sm tracking-[1px] uppercase transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(201,168,76,0.45)] hover:bg-[var(--accent-hover)] opacity-0 shadow-[0_10px_25px_rgba(0,0,0,0.4)]"
        >
          Ver mi trabajo <i className="fas fa-arrow-right" />
        </a>
      </div>

      <div
        className={`animate-fade-up [animation-delay:1200ms] absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden [@media(min-height:650px)]:flex flex-col items-center gap-2 opacity-0 transition-all duration-300 ${
          theme === 'light'
            ? 'text-[#2e2924]'
            : 'text-neutral-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]'
        }`}
      >
        <span className="text-[10px] tracking-[3px] uppercase font-semibold">Descubre</span>
        <div
          className={`w-px h-8 bg-gradient-to-b animate-[scrollPulse_2s_ease-in-out_infinite] ${
            theme === 'light'
              ? 'from-[#2e2924] to-transparent'
              : 'from-[#e8c872] to-transparent'
          }`}
        />
      </div>
    </section>
  )
}
