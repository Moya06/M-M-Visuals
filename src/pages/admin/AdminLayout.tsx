import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Logo } from '../../components/Logo'

const navItems = [
  { to: '/admin/dashboard', icon: 'fa-gauge-high', label: 'Dashboard' },
  { to: '/admin/photos', icon: 'fa-images', label: 'Fotos' },
  { to: '/admin/categories', icon: 'fa-tags', label: 'Categorías' },
]

export function AdminLayout() {
  const { user, signOut } = useAuthContext()
  const { theme, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex flex-col md:flex-row transition-colors duration-300">
      {/* ── BARRA SUPERIOR PARA MÓVILES (md:hidden) ── */}
      <header className="md:hidden sticky top-0 z-40 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            className="w-9 h-9 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-main)] hover:border-[var(--accent)] transition-colors cursor-pointer"
          >
            <i className="fas fa-bars text-sm" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <Logo className="w-full h-full" />
            </div>
            <div>
              <span className="font-serif text-sm font-bold text-[var(--text-main)] block leading-tight">M&M Visuals</span>
              <span className="text-[9px] tracking-[1.5px] uppercase text-[var(--accent)] font-semibold block">CMS Admin</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="relative overflow-hidden w-8 h-8 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] flex items-center justify-center cursor-pointer hover:border-[var(--accent)] transition-colors"
            title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
          >
            <i
              className={`fas fa-sun text-xs text-[var(--accent)] absolute transition-all duration-500 transform ${
                theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
              }`}
            />
            <i
              className={`fas fa-moon text-xs absolute transition-all duration-500 transform ${
                theme === 'light' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
              }`}
            />
          </button>
          <Link
            to="/"
            title="Ver sitio web"
            className="w-8 h-8 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center justify-center text-xs"
          >
            <i className="fas fa-external-link-alt" />
          </Link>
        </div>
      </header>

      {/* ── BACKDROP MÓVIL ── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* ── SIDEBAR (ESCRITORIO + DRAWER MÓVIL) ── */}
      <aside
        className={`fixed md:static top-0 bottom-0 left-0 z-50 w-72 md:w-64 shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Encabezado del sidebar */}
        <div className="px-6 py-5 border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 flex items-center justify-center shrink-0">
              <Logo className="w-full h-full" />
            </div>
            <div>
              <div className="font-serif text-[18px] font-bold text-[var(--text-main)] leading-tight">M&M Visuals</div>
              <div className="text-[10px] tracking-[2px] uppercase text-[var(--accent)] mt-0.5 font-semibold">CMS Admin</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              className="hidden md:flex relative overflow-hidden w-8 h-8 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] items-center justify-center cursor-pointer hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
              title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
            >
              <i
                className={`fas fa-sun text-xs text-[var(--accent)] absolute transition-all duration-500 transform ${
                  theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
                }`}
              />
              <i
                className={`fas fa-moon text-xs absolute transition-all duration-500 transform ${
                  theme === 'light' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                }`}
              />
            </button>
            {/* Botón cerrar en móvil */}
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar menú"
              className="md:hidden w-8 h-8 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center justify-center cursor-pointer"
            >
              <i className="fas fa-times text-xs" />
            </button>
          </div>
        </div>

        {/* Enlaces de navegación */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 active:scale-95 ${
                  isActive
                    ? 'bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/30 scale-[1.02]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-color)]/30 hover:translate-x-1'
                }`
              }
            >
              <i className={`fas ${item.icon} w-4 text-center text-sm`} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="pt-4 mt-4 border-t border-[var(--border-color)]/60">
            <Link
              to="/"
              className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--border-color)]/20 active:scale-95 hover:translate-x-1 transition-all"
            >
              <i className="fas fa-arrow-left w-4 text-center text-xs" />
              <span>Ver portafolio web</span>
            </Link>
          </div>
        </nav>

        {/* Footer del sidebar */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-card)]/40">
          <div className="text-[11px] text-[var(--text-muted)] mb-3 truncate font-medium">
            <i className="fas fa-user-circle mr-1.5 text-[var(--accent)]" />
            {user?.email || 'Administrador'}
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <i className="fas fa-right-from-bracket text-xs" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL RESPONSIVO CON ANIMACIÓN DE PÁGINA ── */}
      <main ref={mainRef} className="flex-1 min-w-0 overflow-y-auto">
        <div key={location.pathname} className="animate-page-enter w-full min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
