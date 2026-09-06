import type { Category } from '../types'

interface Props {
  categories: Category[]
  activeId: string | null
  onSelect: (id: string | null) => void
}

export function CategoryFilter({ categories, activeId, onSelect }: Props) {
  // Categorías principales (sin padre)
  const parents = categories.filter((c) => !c.parent_id)

  // Determinar padre activo
  const activeCategory = categories.find((c) => c.id === activeId)
  const activeParentId = activeCategory
    ? (activeCategory.parent_id || activeCategory.id)
    : null

  // Subcategorías del padre activo (si tiene)
  const activeSubcategories = activeParentId
    ? categories.filter((c) => c.parent_id === activeParentId)
    : []

  return (
    <div className="mb-12 space-y-3">
      {/* Nivel 1: Categorías Principales */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
        <button
          onClick={() => onSelect(null)}
          className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs tracking-[1px] sm:tracking-[2px] uppercase font-semibold transition-all duration-300 border cursor-pointer ${
            activeId === null
              ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm'
              : 'bg-transparent border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
          }`}
        >
          Todas
        </button>
        {parents.map((cat) => {
          const isSelected = activeParentId === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs tracking-[1px] sm:tracking-[2px] uppercase font-semibold transition-all duration-300 border cursor-pointer ${
                isSelected
                  ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm'
                  : 'bg-transparent border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
              }`}
            >
              {cat.name}
            </button>
          )
        })}
      </div>

      {/* Nivel 2: Subcategorías (si la categoría activa tiene hijas) */}
      {activeSubcategories.length > 0 && (
        <div className="flex flex-wrap justify-center items-center gap-2 pt-1">
          <button
            onClick={() => onSelect(activeParentId)}
            className={`px-3.5 py-1 rounded-full text-[11px] tracking-[1px] uppercase transition-all duration-200 border cursor-pointer ${
              activeId === activeParentId
                ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)] font-bold'
                : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text-main)]'
            }`}
          >
            Todo {categories.find((c) => c.id === activeParentId)?.name}
          </button>
          {activeSubcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => onSelect(sub.id)}
              className={`px-3.5 py-1 rounded-full text-[11px] tracking-[1px] uppercase transition-all duration-200 border cursor-pointer ${
                activeId === sub.id
                  ? 'bg-[var(--accent)] border-[var(--accent)] text-white font-bold shadow-sm'
                  : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text-main)]'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
