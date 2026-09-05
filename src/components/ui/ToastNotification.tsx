export interface ToastState {
  message: string
  type?: 'success' | 'info' | 'error' | 'loading'
}

interface ToastNotificationProps {
  toast?: ToastState | null
  message?: string | null
  type?: 'success' | 'info' | 'error' | 'loading'
  onClose?: () => void
}

export function ToastNotification({
  toast,
  message: propMessage,
  type: propType,
  onClose,
}: ToastNotificationProps) {
  const message = toast?.message ?? propMessage
  const type = toast?.type ?? propType ?? 'success'

  if (!message) return null

  const icons = {
    success: 'fa-circle-check text-emerald-400',
    info: 'fa-circle-info text-[var(--accent)]',
    error: 'fa-circle-exclamation text-red-400',
    loading: 'fa-circle-notch fa-spin text-[var(--accent)]',
  }

  const borderColors = {
    success: 'border-emerald-500/30',
    info: 'border-[var(--accent)]/30',
    error: 'border-red-500/30',
    loading: 'border-[var(--accent)]/30',
  }

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[3500] pointer-events-none animate-[fadeUp_0.2s_ease-out]">
      <div
        className={`pointer-events-auto px-4 sm:px-5 py-2.5 rounded-full shadow-2xl backdrop-blur-2xl border flex items-center gap-2.5 text-xs sm:text-sm font-medium transition-all ${borderColors[type]} bg-[#111111]/90 text-white dark:bg-[#111111]/90 dark:text-white border-white/15`}
      >
        <i className={`fas ${icons[type]} text-sm shrink-0`} />
        <span className="leading-snug">{message}</span>
        {onClose && type !== 'loading' && (
          <button
            onClick={onClose}
            className="ml-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer p-0.5"
            aria-label="Cerrar notificación"
          >
            <i className="fas fa-xmark text-xs" />
          </button>
        )}
      </div>
    </div>
  )
}
