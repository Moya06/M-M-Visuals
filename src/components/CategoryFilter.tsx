import type { Category } from '../types'

interface Props {
  categories: Category[]
  activeId: string | null
  onSelect: (id: string | null) => void
}

export function CategoryFilter({ categories, activeId, onSelect }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-12">
      <button
        onClick={() => onSelect(null)}
        className={`px-5 py-2 rounded-full text-xs tracking-[2px] uppercase font-semibold transition-all duration-300 border cursor-pointer ${
          activeId === null
            ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm'
            : 'bg-transparent border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
        }`}
      >
        Todas
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`px-5 py-2 rounded-full text-xs tracking-[2px] uppercase font-semibold transition-all duration-300 border cursor-pointer ${
            activeId === cat.id
              ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm'
              : 'bg-transparent border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
