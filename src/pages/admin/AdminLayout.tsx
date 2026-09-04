import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'

const navItems = [
  { to: '/admin/dashboard', icon: 'fa-gauge-high', label: 'Dashboard' },
  { to: '/admin/photos', icon: 'fa-images', label: 'Fotos' },
  { to: '/admin/categories', icon: 'fa-tags', label: 'Categorías' },
]

import { useTheme } from '../../context/ThemeContext'

export function AdminLayout() {
  const { user, signOut } = useAuthContext()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col">
        {/* Logo M&M Visuals */}
        <div className="px-6 py-6 border-b border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <img
                src={theme === 'light' ? '/logo-circle-light.png' : '/logo-circle-dark.png'}
                alt="M&M Visuals"
                className={`w-full h-full object-contain ${
                  theme === 'dark' ? 'logo-dark-mode' : 'logo-light-mode'
                }`}
              />
            </div>
            <div>
              <div className="font-serif text-[19px] font-bold text-[var(--text-main)] leading-none">M&M Visuals</div>
              <div className="text-[10px] tracking-[2px] uppercase text-[var(--accent)] mt-1 font-semibold">CMS Admin</div>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="w-8 h-8 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] flex items-center justify-center cursor-pointer hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
            title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
          >
            {theme === 'light' ? <i className="fas fa-moon text-xs" /> : <i className="fas fa-sun text-xs text-[var(--accent)]" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#c9a84c]/10 text-[#c9a84c]'
                    : 'text-[#888] hover:text-white hover:bg-white/[0.04]'
                }`
              }
            >
              <i className={`fas ${item.icon} w-4 text-center`} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer del sidebar */}
        <div className="px-6 py-5 border-t border-white/[0.06]">
          <div className="text-[11px] text-[#555] mb-3 truncate">{user?.email}</div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-[#888] hover:text-red-400 transition-colors duration-200"
          >
            <i className="fas fa-right-from-bracket" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
