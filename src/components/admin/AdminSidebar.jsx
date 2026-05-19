import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ui/ThemeToggle'

const NAV = [
  {
    label: 'Command Center',
    to: '/admin',
    badge: '01',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    )
  },
  {
    label: 'Site Visits',
    to: '/admin/visits',
    badge: null,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5"/>
      </svg>
    )
  },
  {
    label: 'Payments',
    to: '/admin/payments',
    badge: null,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    )
  },
  {
    label: 'Design Queue',
    to: '/admin/designs',
    badge: null,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    )
  },
  {
    label: 'Customers',
    to: '/admin/customers',
    badge: null,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )
  },
  {
    label: 'Reports',
    to: '/admin/reports',
    badge: null,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    )
  },
]

export default function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut, profile } = useAuth()
  const indicatorRef = useRef(null)
  const navRef = useRef(null)

  useEffect(() => {
    const active = navRef.current?.querySelector('a.active')
    const indicator = indicatorRef.current
    if (active && indicator) {
      const { offsetTop, offsetHeight } = active
      indicator.style.top = `${offsetTop}px`
      indicator.style.height = `${offsetHeight}px`
      indicator.style.opacity = '1'
    }
  }, [location.pathname])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div className="admin-brand-mark">
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <path d="M16 3 C16 3 6 14 6 20 a10 10 0 0 0 20 0 C26 14 16 3 16 3Z" fill="white" opacity="0.9"/>
              <path d="M16 12 C16 12 11 18 11 22 a5 5 0 0 0 10 0 C21 18 16 12 16 12Z" fill="white" opacity="0.4"/>
            </svg>
          </div>
          <div className="admin-brand-text">
            <small>Ops Console</small>
            <h1>Field-first<br />Admin</h1>
          </div>
        </div>
        <ThemeToggle size="sm" />
      </div>

      <nav className="admin-nav" ref={navRef}>
        <div className="admin-nav-indicator" ref={indicatorRef} />
        {NAV.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/admin'}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <span className="admin-nav-icon">{n.icon}</span>
            <span className="admin-nav-label">{n.label}</span>
            {n.badge && <span className="admin-nav-badge">{n.badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-hint">
        <span className="admin-hint-dot" />
        <div>
          <h3>Workflow-driven layout</h3>
          <p>Lead → visit → drawing → payment → execution. Each section mirrors a real field handoff.</p>
        </div>
      </div>

      <button className="admin-signout-btn" onClick={handleSignOut} aria-label="Sign out">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>Sign Out{profile?.full_name ? ` (${profile.full_name.split(' ')[0]})` : ''}</span>
      </button>
    </aside>
  )
}
