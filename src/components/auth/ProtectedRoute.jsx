import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: 36, height: 36, border: '3px solid var(--color-primary-highlight)', borderTop: '3px solid var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  // Not logged in → send to login
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  // Wait for profile to load before role check
  if (!profile) return null

  // Role mismatch
  if (requiredRole && profile.role !== requiredRole) {
    if (profile.role === 'admin') return <Navigate to="/admin" replace />
    return <Navigate to="/client" replace />
  }

  return children
}
