import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { ProtectedRoute } from './router/ProtectedRoute'
import { PublicPage } from './pages/PublicPage'
import { LoginPage } from './pages/admin/LoginPage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { DashboardPage } from './pages/admin/DashboardPage'
import { PhotosPage } from './pages/admin/PhotosPage'
import { CategoriesPage } from './pages/admin/CategoriesPage'

function AppRoutes() {
  const location = useLocation()
  return (
    <div key={location.pathname.startsWith('/admin') ? 'admin-zone' : 'public-zone'} className="animate-fade-in w-full min-h-screen">
      <Routes location={location}>
        {/* ── Vista pública ──────────────────────────── */}
        <Route path="/" element={<PublicPage />} />

        {/* ── Login (acceso público) ─────────────────── */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* ── Panel de admin (protegido) ─────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/photos" element={<PhotosPage />} />
            <Route path="/admin/categories" element={<CategoriesPage />} />
          </Route>
        </Route>

        {/* ── Catch-all ─────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

import { ThemeProvider } from './context/ThemeContext'

export default function App() {
  const auth = useAuth()

  return (
    <ThemeProvider>
      <AuthContext.Provider value={auth}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthContext.Provider>
    </ThemeProvider>
  )
}
