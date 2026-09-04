import { useScrollReveal } from '../hooks/useScrollReveal'

export function About() {
  const { ref: leftRef, isVisible: leftVisible } = useScrollReveal<HTMLDivElement>()
  const { ref: rightRef, isVisible: rightVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section className="py-[120px] bg-[var(--bg-secondary)] border-t border-[var(--border-color)] scroll-mt-20" id="sobre-mi">
      <div className="max-w-[1300px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div
            ref={leftRef}
            className={`rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative transition-all duration-800 border border-[var(--border-color)] ${leftVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-[50px]'}`}
          >
            <img src="fotos/fotografo.jpeg" alt="Sobre Mí" className="w-full h-auto block scale-[1.01]" width={600} height={400} loading="lazy" decoding="async" />
          </div>
          <div ref={rightRef} className={`transition-all duration-800 ${rightVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[50px]'}`}>
            <h2 className="font-serif text-[clamp(1.8rem,3vw,2.5rem)] mb-6 text-[var(--text-main)] font-bold">
              Detrás del <span className="text-[var(--accent)] italic">lente</span>
            </h2>
            <p className="text-[var(--text-muted)] mb-5 text-[15px] leading-relaxed">
              ¡Hola! Soy un fotógrafo apasionado por la narrativa visual y los detalles que marcan la diferencia. En <strong className="text-[var(--text-main)] font-semibold">M&M Visuals</strong> nos enfocamos en capturar la esencia de cada historia a través de una mirada artística y auténtica.
            </p>
            <p className="text-[var(--text-muted)] mb-5 text-[15px] leading-relaxed">
              Cada sesión es una colaboración única: trabajamos la luz, los tonos y el ritmo natural para entregar piezas visuales con identidad propia y atemporal.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--accent)]/50 text-[var(--accent)] text-xs tracking-[1px] uppercase font-semibold">
                <i className="fas fa-camera" /> Costa Rica · Sesiones Disponibles
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
