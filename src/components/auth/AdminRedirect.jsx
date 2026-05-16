import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Wraps public/marketing pages.
 * If an admin is logged in they never see the public site — redirect to /admin.
 * Clients and guests see the page normally.
 */
export default function AdminRedirect({ children }) {
  const { user, profile, loading } = useAuth()

  // While auth is resolving, render nothing (avoids flash of public page)
  if (loading) return null

  // Admin logged in → kick to admin dashboard
  if (user && profile?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return children
}
