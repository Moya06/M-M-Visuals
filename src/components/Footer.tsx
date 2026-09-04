import { useTheme } from '../context/ThemeContext'

export function Footer() {
  const { theme } = useTheme()

  return (
    <footer className="py-16 pb-[30px] border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
      <div className="max-w-[1300px] mx-auto px-6">
        <div className="flex justify-between items-start mb-[40px] gap-10 flex-wrap">
          <div className="max-w-[360px]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 flex items-center justify-center shrink-0">
                <img
                  src={theme === 'light' ? '/logo-circle-light.png' : '/logo-circle-dark.png'}
                  alt="M&M Visuals"
                  className={`w-full h-full object-contain ${
                    theme === 'dark' ? 'logo-dark-mode' : 'logo-light-mode'
                  }`}
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-serif text-[24px] font-bold text-[var(--text-main)] leading-tight">
                  M&M <span className="text-[var(--accent)] font-serif italic text-2xl">Visuals</span>
                </span>
                <span className="text-[10px] tracking-[3px] uppercase text-[var(--text-muted)] font-semibold mt-1">
                  Studio Fotográfico
                </span>
              </div>
            </div>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              Fotografía con esencia y narrativa. Capturando historias únicas a través de una perspectiva moderna y atemporal.
            </p>
          </div>
          <div>
            <h3 className="text-xs tracking-[2px] uppercase text-[var(--text-main)] font-semibold mb-4">Navegación</h3>
            <ul className="list-none p-0 m-0">
              {[
                { href: '#inicio', label: 'Inicio' },
                { href: '#portfolio', label: 'Portafolio' },
                { href: '#sobre-mi', label: 'Sobre Mí' },
                { href: '/admin', label: 'Panel CMS' },
              ].map((link) => (
                <li key={link.href} className="mb-2.5">
                  <a href={link.href} className="text-[var(--text-muted)] no-underline text-sm transition-colors duration-300 hover:text-[var(--accent)]">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs tracking-[2px] uppercase text-[var(--text-main)] font-semibold mb-4">Síguenos</h3>
            <div className="flex gap-3">
              {['instagram', 'facebook-f', 'tiktok'].map((icon) => (
                <a key={icon} href="#" className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] flex items-center justify-center no-underline text-base transition-all duration-300 hover:bg-[var(--accent)] hover:text-white hover:-translate-y-1 shadow-sm" aria-label={icon}>
                  <i className={`fab fa-${icon}`} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="text-center pt-[25px] border-t border-[var(--border-color)] text-[var(--text-muted)] text-[12px] tracking-[1px]">
          <p>&copy; {new Date().getFullYear()} M&M Visuals. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
