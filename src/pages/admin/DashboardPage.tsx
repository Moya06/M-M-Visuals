import { Link } from 'react-router-dom'
import { usePhotos } from '../../hooks/usePhotos'
import { useCategories } from '../../hooks/useCategories'

export function DashboardPage() {
  const { photos, loading: photosLoading } = usePhotos()
  const { categories, loading: catsLoading } = useCategories()

  const stats = [
    { label: 'Fotos subidas', value: photos.length, icon: 'fa-images', link: '/admin/photos', color: 'text-[#c9a84c]' },
    { label: 'Categorías', value: categories.length, icon: 'fa-tags', link: '/admin/categories', color: 'text-blue-400' },
  ]

  // Las 6 fotos más recientes para previsualización
  const recent = photos.slice(0, 6)

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-serif text-[var(--text-main)] mb-1 font-bold">Dashboard</h1>
        <p className="text-[var(--text-muted)] text-xs sm:text-sm">Resumen general de tu portafolio M&M Visuals</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.link}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 sm:p-6 hover:border-[var(--accent)] transition-all shadow-sm group"
          >
            <div className={`text-2xl sm:text-3xl mb-2 sm:mb-3 text-[var(--accent)]`}>
              <i className={`fas ${s.icon}`} />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--text-main)] mb-1">
              {photosLoading || catsLoading ? (
                <div className="w-8 h-6 bg-[var(--border-color)] rounded animate-pulse" />
              ) : s.value}
            </div>
            <div className="text-[var(--text-muted)] text-xs tracking-[1px] uppercase font-semibold">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-8">
        <Link
          to="/admin/photos"
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
        >
          <i className="fas fa-upload text-xs" /> Subir foto
        </Link>
        <Link
          to="/admin/categories"
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] rounded-xl text-xs sm:text-sm font-semibold hover:border-[var(--accent)] transition-colors shadow-sm"
        >
          <i className="fas fa-plus text-xs text-[var(--accent)]" /> Gestionar categorías
        </Link>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl text-xs sm:text-sm font-semibold hover:border-[var(--accent)] transition-colors"
        >
          <i className="fas fa-arrow-up-right-from-square text-xs" /> Ver portafolio
        </a>
      </div>

      {/* Recent photos preview */}
      {recent.length > 0 && (
        <div>
          <h2 className="text-xs sm:text-sm text-[var(--text-muted)] tracking-[2px] uppercase mb-3 font-semibold">Fotos recientes</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3">
            {recent.map((photo) => (
              <div key={photo.id} className="aspect-square rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs">
                <img
                  src={photo.thumbnail_url ?? photo.url}
                  alt={photo.title ?? ''}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
