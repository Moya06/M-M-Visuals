import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

/**
 * Protege todas las rutas bajo /admin.
 * Si no hay sesión activa, redirige a /admin/login conservando la URL de destino.
 * Muestra un spinner mientras se comprueba el estado de auth.
 */
export function ProtectedRoute() {
  const { session, loading } = useAuthContext()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
