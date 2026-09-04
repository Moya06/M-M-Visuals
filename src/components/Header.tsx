import { useHeaderScroll } from '../hooks/useHeaderScroll'
import { useActiveSection } from '../hooks/useActiveSection'
import { useTheme } from '../context/ThemeContext'

const navLinks = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#portfolio', label: 'Portafolio' },
  { href: '#sobre-mi', label: 'Sobre Mí' },
]

export function Header() {
  const { scrolled, hidden } = useHeaderScroll()
  const active = useActiveSection(['inicio', 'portfolio', 'sobre-mi'])
  const { theme, toggleTheme } = useTheme()

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-400 ${
        scrolled
          ? theme === 'light'
            ? 'bg-[rgba(247,244,237,0.95)] backdrop-blur-xl shadow-[0_2px_25px_rgba(0,0,0,0.06)] border-b border-[var(--border-color)]'
            : 'bg-[rgba(13,13,13,0.92)] backdrop-blur-xl shadow-[0_1px_30px_rgba(0,0,0,0.5)] border-b border-white/[0.05]'
          : theme === 'light'
          ? 'bg-gradient-to-b from-[rgba(247,244,237,0.92)] via-[rgba(247,244,237,0.55)] to-transparent'
          : 'bg-gradient-to-b from-black/85 via-black/40 to-transparent'
      } ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="max-w-[1300px] mx-auto px-6">
        <nav className="flex justify-between items-center py-2.5">
          {/* Logo en la esquina: grande, transparente por defecto, aro sutil solo en hover */}
          <a href="https://mymvisuals.vercel.app/" className="flex items-center gap-4 no-underline group py-1">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-0.5 transition-transform duration-300 group-hover:scale-105 shrink-0">
              {/* Aro dorado centrado geométricamente con todo el emblema y sus salientes */}
              <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-[var(--accent)] group-hover:shadow-[0_0_20px_rgba(201,168,76,0.4)] transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none" />
              <img
                src={theme === 'light' ? '/logo-circle-light.png' : '/logo-circle-dark.png'}
                alt="M&M Visuals"
                className={`w-full h-full object-contain ${
                  theme === 'dark' ? 'logo-dark-mode' : 'logo-light-mode'
                }`}
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-serif text-[28px] font-bold tracking-[2px] text-[var(--text-main)] leading-none transition-colors duration-300 group-hover:text-[var(--accent)]">
                M&M <span className="text-[var(--accent)] font-serif italic text-[26px]">Visuals</span>
              </span>
              <span className="text-[10px] tracking-[4px] uppercase text-[var(--text-muted)] font-semibold mt-1.5">
                Photography Studio
              </span>
            </div>
          </a>

          <div className="flex items-center gap-6">
            <ul className="flex list-none gap-7 items-center m-0 p-0">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`text-xs font-semibold tracking-[1.5px] uppercase no-underline transition-colors duration-300 relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-[var(--accent)] after:transition-all after:duration-300 hover:after:w-full ${
                      active === link.href.slice(1)
                        ? 'text-[var(--text-main)] after:w-full'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/admin"
                  className="text-[11px] font-semibold tracking-[1.5px] uppercase px-3.5 py-1.5 rounded-full border border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-300 flex items-center gap-1.5"
                >
                  <i className="fas fa-lock text-[9px] text-[var(--accent)]" />
                  Admin
                </a>
              </li>
            </ul>

            {/* Toggle de tema tipo pastilla / switch minimalista */}
            <button
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              className="relative w-14 h-7 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-0.5 cursor-pointer transition-colors duration-300 focus:outline-none flex items-center shadow-inner"
              title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            >
              <div
                className={`w-6 h-6 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm flex items-center justify-center text-[10px] text-[var(--accent)] transform transition-transform duration-300 ${
                  theme === 'light' ? 'translate-x-7' : 'translate-x-0'
                }`}
              >
                {theme === 'light' ? (
                  <i className="fas fa-sun text-[11px] text-amber-600" />
                ) : (
                  <i className="fas fa-moon text-[10px]" />
                )}
              </div>
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}
