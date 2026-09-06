import { useHeaderScroll } from '../hooks/useHeaderScroll'
import { useActiveSection } from '../hooks/useActiveSection'
import { useTheme } from '../context/ThemeContext'
import { useAuthContext } from '../context/AuthContext'
import { Logo } from './Logo'

export function Header() {
  const { session, user } = useAuthContext()
  const isAdmin = Boolean(session || user)
  const { scrolled, hidden } = useHeaderScroll()
  const active = useActiveSection(['inicio', 'portfolio', 'privadas', 'sobre-mi'])
  const { theme, toggleTheme } = useTheme()

  const navLinks = [
    { href: '#inicio', label: 'Inicio' },
    { href: '#portfolio', label: 'Portafolio' },
    ...(isAdmin ? [{ href: '#privadas', label: '🔒 Privadas' }] : []),
    { href: '#sobre-mi', label: 'Sobre Mí' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-400 ${scrolled
        ? theme === 'light'
          ? 'bg-[rgba(247,244,237,0.95)] backdrop-blur-xl shadow-[0_2px_25px_rgba(0,0,0,0.06)] border-b border-[var(--border-color)]'
          : 'bg-[rgba(13,13,13,0.92)] backdrop-blur-xl shadow-[0_1px_30px_rgba(0,0,0,0.5)] border-b border-white/[0.05]'
        : theme === 'light'
          ? 'bg-gradient-to-b from-[rgba(247,244,237,0.55)] via-[rgba(247,244,237,0.15)] to-transparent'
          : 'bg-gradient-to-b from-black/50 via-black/15 to-transparent'
        } ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="max-w-[1300px] mx-auto px-6">
        <nav className="flex flex-col md:flex-row justify-between items-center flex-wrap py-2 md:py-2.5 gap-3 md:gap-0">
          {/* Logo en la esquina: grande, animado con transición suave */}
          <a href="#inicio" className="flex items-center gap-3.5 md:gap-4 no-underline group py-1">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center p-0.5 transition-transform duration-300 group-hover:scale-105 shrink-0">
              {/* Aro dorado centrado geométricamente con todo el emblema y sus salientes */}
              <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-[var(--accent)] group-hover:shadow-[0_0_20px_rgba(201,168,76,0.4)] transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none" />
              <Logo className="w-full h-full" />
            </div>
            <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left">
              <span className="font-serif text-[26px] md:text-[32px] font-bold tracking-[1.5px] md:tracking-[2px] text-[var(--text-main)] leading-none transition-colors duration-300 group-hover:text-[var(--accent)]">
                M&M <span className="text-[var(--accent)] font-serif italic text-[22px] md:text-[30px]">Visuals</span>
              </span>
              <span className="text-[9.5px] md:text-[11px] tracking-[3.5px] md:tracking-[4.5px] uppercase text-[var(--text-muted)] font-semibold mt-1">
                Photography Studio
              </span>
            </div>
          </a>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mt-1 md:mt-0 w-full md:w-auto">
            <ul className="flex list-none gap-4 md:gap-7 items-center m-0 p-0 flex-wrap justify-center w-full md:w-auto">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`text-[10px] md:text-xs font-semibold tracking-[1px] md:tracking-[1.5px] uppercase no-underline transition-colors duration-300 relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px] after:bg-[var(--accent)] after:transition-all after:duration-300 hover:after:w-full ${active === link.href.slice(1)
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
                  className="text-[10px] md:text-[11px] font-semibold tracking-[1.5px] uppercase px-3.5 py-1.5 rounded-full border border-[var(--border-color)] text-[var(--text-main)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all duration-300 flex items-center gap-1.5"
                >
                  <i className="fas fa-lock text-[9px] text-[var(--accent)]" />
                  Admin
                </a>
              </li>
            </ul>

            {/* Toggle de tema tipo pastilla / switch minimalista con animación */}
            <button
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              className="relative w-14 h-7 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] p-0.5 cursor-pointer transition-colors duration-300 focus:outline-none flex items-center shadow-inner hover:border-[var(--accent)]"
              title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            >
              <div
                className={`w-6 h-6 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm flex items-center justify-center text-[10px] text-[var(--accent)] transform transition-transform duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)] relative overflow-hidden ${
                  theme === 'light' ? 'translate-x-7' : 'translate-x-0'
                }`}
              >
                <i
                  className={`fas fa-sun text-[11px] text-amber-500 absolute transition-all duration-500 transform ${
                    theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
                  }`}
                />
                <i
                  className={`fas fa-moon text-[10px] absolute transition-all duration-500 transform ${
                    theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                  }`}
                />
              </div>
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}
