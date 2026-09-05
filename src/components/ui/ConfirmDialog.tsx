import { useEffect } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  detail?: string
  itemName?: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning'
  isDanger?: boolean
  loading?: boolean
  onConfirm: () => void | Promise<void>
  onClose?: () => void
  onCancel?: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  detail: propDetail,
  itemName,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  type: propType,
  isDanger: propIsDanger = true,
  loading = false,
  onConfirm,
  onClose: propOnClose,
  onCancel,
}: ConfirmDialogProps) {
  const detail = itemName ?? propDetail
  const type = propType ?? (propIsDanger ? 'danger' : 'warning')
  const handleClose = () => {
    if (propOnClose) propOnClose()
    else if (onCancel) onCancel()
  }

  // Cerrar con tecla Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen && !loading) {
        handleClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, loading])

  if (!isOpen) return null

  const isDanger = type === 'danger'

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onClick={() => !loading && handleClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm sm:max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 animate-[fadeUp_0.2s_ease-out] text-[var(--text-main)]"
      >
        <div className="flex items-start gap-3.5">
          {/* Icono temático */}
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 border ${
              isDanger
                ? 'bg-red-500/15 border-red-500/30 text-red-500'
                : 'bg-[var(--accent)]/15 border-[var(--accent)]/30 text-[var(--accent)]'
            }`}
          >
            <i className={`fas ${isDanger ? 'fa-trash-can' : 'fa-triangle-exclamation'}`} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-serif font-bold text-base sm:text-lg leading-snug">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Detalle adicional si aplica */}
        {detail && (
          <div className="bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--border-color)] text-xs text-[var(--text-muted)] flex items-start gap-2">
            <i className="fas fa-circle-info text-[var(--accent)] text-xs mt-0.5 shrink-0" />
            <span className="leading-relaxed">{detail}</span>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border-color)]">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="py-2.5 px-4 rounded-xl border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-primary)] text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`py-2.5 px-5 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]'
            }`}
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Procesando…</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
