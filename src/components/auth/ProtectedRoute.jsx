import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  // Wait for both session AND profile (role) to load
  if (loading || (user && !profile)) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--color-primary-highlight)', borderTop: '3px solid var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  // Not logged in → send to login
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  const role = profile?.role

  // If a specific role is required and user doesn't have it → redirect to their correct dashboard
  if (requiredRole && role !== requiredRole) {
    const dest = role === 'admin' ? '/admin' : '/client'
    return <Navigate to={dest} replace />
  }

  return children
}
