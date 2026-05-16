import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Wraps public-only pages (/, /login, /signup, etc.)
 * If the user is already authenticated, redirect them to their dashboard
 * so pressing Back after login never drops them back on a public page.
 */
export default function PublicOnlyRoute({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid var(--color-primary-highlight)', borderTop: '3px solid var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (user) {
    // profile may still be loading — default to /client if role unknown yet
    const dest = profile?.role === 'admin' ? '/admin' : '/client'
    return <Navigate to={dest} replace />
  }

  return children
}
