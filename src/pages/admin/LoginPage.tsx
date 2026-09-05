import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export function LoginPage() {
  const { session, signIn, loading } = useAuthContext()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/admin/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Si ya hay sesión, redirigir
  if (!loading && session) return <Navigate to={from} replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signIn(email, password)
    if (error) {
      setError('Credenciales incorrectas. Verifica tu usuario y contraseña.')
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex items-center justify-center px-4 relative transition-colors duration-300">
      <button
        onClick={toggleTheme}
        aria-label="Cambiar tema"
        className="absolute top-6 right-6 w-10 h-10 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] flex items-center justify-center cursor-pointer hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all shadow-sm"
        title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
      >
        {theme === 'light' ? <i className="fas fa-moon text-sm" /> : <i className="fas fa-sun text-sm text-[var(--accent)]" />}
      </button>

      <div className="w-full max-w-sm">
        {/* Logo M&M Visuals */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-36 h-36 flex items-center justify-center mb-4">
            <img
              src={theme === 'light' ? '/logo-circle-light.png' : '/logo-circle-dark.png'}
              alt="M&M Visuals"
              className={`w-full h-full object-contain ${
                theme === 'dark' ? 'logo-dark-mode' : 'logo-light-mode'
              }`}
            />
          </div>
          <div className="font-serif text-[30px] font-bold text-[var(--text-main)] tracking-[2px] leading-tight">M&M Visuals</div>
          <div className="text-[11px] tracking-[4px] uppercase text-[var(--accent)] font-semibold mt-1">Panel de Administración</div>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-8 space-y-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div>
            <label className="block text-xs text-[var(--text-muted)] font-medium tracking-[1px] uppercase mb-2">Usuario o Email</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="fabianmoya353"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] font-medium tracking-[1px] uppercase mb-2">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-xs sm:text-sm text-red-500 flex items-center gap-2.5">
              <i className="fas fa-circle-exclamation shrink-0 text-base" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[var(--accent)] text-white rounded-lg font-semibold text-sm tracking-[1px] uppercase transition-all duration-300 hover:bg-[var(--accent-hover)] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Iniciando…</>
              : 'Iniciar sesión'
            }
          </button>
        </form>

        <p className="text-center text-[var(--text-muted)] text-xs mt-6">
          Acceso exclusivo para administrador · M&M Visuals
        </p>
      </div>
    </div>
  )
}
