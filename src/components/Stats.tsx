import { useScrollReveal } from '../hooks/useScrollReveal'
import { useCounter } from '../hooks/useCounter'

interface Props {
  photosCount?: number
}

function StatItem({ target, label }: { target: number; label: string }) {
  const { count, ref } = useCounter(target)

  return (
    <div ref={ref} className="text-center">
      <div className="font-serif text-[clamp(2.5rem,5vw,3.5rem)] font-bold text-[var(--accent)]">
        {count}
      </div>
      <div className="text-[13px] text-[var(--text-muted)] tracking-[1px] uppercase mt-1.5">{label}</div>
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
    <section className="py-[100px] bg-[var(--bg-secondary)] border-y border-[var(--border-color)]">
      <div className="max-w-[800px] mx-auto px-6">
        <div ref={ref} className={`grid grid-cols-3 gap-10 text-center transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[50px]'}`}>
          {stats.map((s) => <StatItem key={s.label} target={s.target} label={s.label} />)}
        </div>
      </div>
    </section>
  )
}
