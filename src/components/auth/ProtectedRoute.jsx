import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const spinStyle = `
  @keyframes spin { to { transform: rotate(360deg); } }
`

export default function ProtectedRoute({ children, role }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  // Still resolving auth session
  if (loading) return <Spinner />

  // Not logged in → send to login
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  // Logged in but profile not yet fetched → keep waiting
  // (prevents premature redirect before role is known)
  if (!profile) return <Spinner />

  // Role mismatch → send to their correct dashboard
  if (role && profile.role !== role) {
    const dest = profile.role === 'admin' ? '/admin' : '/client'
    return <Navigate to={dest} replace />
  }

  return children
}

function Spinner() {
  return (
    <>
      <style>{spinStyle}</style>
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid var(--color-primary-highlight)',
          borderTop: '3px solid var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    </>
  )
}
