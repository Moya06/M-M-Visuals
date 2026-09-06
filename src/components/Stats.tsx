import { useScrollReveal } from '../hooks/useScrollReveal'
import { useCounter } from '../hooks/useCounter'

interface Props {
  photosCount?: number
}

function StatItem({ target, label }: { target: number; label: string }) {
  const { count, ref } = useCounter(target)

  return (
    <div ref={ref} className="text-center px-1">
      <div className="font-serif text-[clamp(2rem,4.5vw,3.5rem)] font-bold text-[var(--accent)] leading-none mb-1.5">
        {count}
      </div>
      <div className="text-[10px] sm:text-xs md:text-[13px] text-[var(--text-muted)] tracking-wider uppercase font-medium leading-tight">
        {label}
      </div>
    </div>
  )
}

export function Stats({ photosCount }: Props) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  const stats = [
    { target: photosCount ?? 0, label: 'Fotos capturadas' },
    { target: 3, label: 'Lugares visitados' },
    { target: 1, label: 'Años de pasión' },
  ]

  return (
    <section className="py-12 sm:py-16 md:py-[100px] bg-[var(--bg-secondary)] border-y border-[var(--border-color)]">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6">
        <div
          ref={ref}
          className={`grid grid-cols-3 gap-2 sm:gap-6 md:gap-10 text-center transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[50px]'
          }`}
        >
          {stats.map((s) => (
            <StatItem key={s.label} target={s.target} label={s.label} />
          ))}
        </div>
      </div>
    </section>
  )
}
