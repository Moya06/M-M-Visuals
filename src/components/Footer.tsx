import { Link } from 'react-router-dom'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="py-12 sm:py-16 pb-[30px] border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-[40px] gap-8 sm:gap-10 flex-wrap">
          <div className="max-w-[360px]">
            <div className="flex items-center gap-3.5 sm:gap-4 mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center shrink-0">
                <Logo className="w-full h-full" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-serif text-[20px] sm:text-[24px] font-bold text-[var(--text-main)] leading-tight">
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
                  {link.href.startsWith('/') ? (
                    <Link
                      to={link.href}
                      className="text-[var(--text-muted)] no-underline text-sm transition-colors duration-300 hover:text-[var(--accent)] active:scale-95 inline-block"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-[var(--text-muted)] no-underline text-sm transition-colors duration-300 hover:text-[var(--accent)] active:scale-95 inline-block"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs tracking-[2px] uppercase text-[var(--text-main)] font-semibold mb-4">Síguenos</h3>
            <div className="flex gap-3 items-center">
              <a
                href="https://www.instagram.com/mym.visuals/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] flex items-center justify-center no-underline text-base transition-all duration-300 hover:bg-[var(--accent)] hover:text-white hover:-translate-y-1 shadow-sm"
                aria-label="Instagram @mym.visuals"
                title="Instagram: @mym.visuals"
              >
                <i className="fab fa-instagram" />
              </a>
              <a
                href="https://www.facebook.com/mym.visuals"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] flex items-center justify-center no-underline text-base transition-all duration-300 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] hover:-translate-y-1 shadow-sm"
                aria-label="Facebook Mym Visuals"
                title="Facebook: Mym Visuals"
              >
                <i className="fab fa-facebook-f" />
              </a>
              <span
                className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)]/40 flex items-center justify-center text-base cursor-not-allowed shadow-sm"
                aria-label="TikTok (Próximamente)"
                title="TikTok: Próximamente"
              >
                <i className="fab fa-tiktok" />
              </span>
            </div>
            <p className="text-[12px] text-[var(--text-muted)] mt-3 tracking-wide">
              @mym.visuals
            </p>
          </div>
        </div>
        <div className="text-center pt-[25px] border-t border-[var(--border-color)] text-[var(--text-muted)] text-[12px] tracking-[1px]">
          <p>&copy; {new Date().getFullYear()} M&M Visuals. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
