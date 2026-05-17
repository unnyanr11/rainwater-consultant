import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, ClipboardList, CreditCard,
  UserCircle, LogOut, Droplets
} from 'lucide-react'

const NAV = [
  { to: '/client',          label: 'Overview',  icon: LayoutDashboard, end: true },
  { to: '/client/orders',   label: 'My Orders', icon: ClipboardList },
  { to: '/client/payments', label: 'Payments',  icon: CreditCard },
  { to: '/client/profile',  label: 'Profile',   icon: UserCircle },
]

export default function ClientDashboard() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: 'var(--color-bg)' }}>

      {/* Sidebar */}
      <aside style={{
        width: 240,
        flexShrink: 0,
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100dvh',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Droplets size={22} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--color-text)' }}>
              RainHarvest
            </span>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 2 }}>
            Client Portal
          </div>
        </div>

        {/* User pill */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
            {profile?.full_name || 'My Account'}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
            {profile?.email}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                textDecoration: 'none',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                background: isActive ? 'var(--color-primary-highlight)' : 'transparent',
                transition: 'all 150ms',
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              width: '100%',
              padding: '0.6rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-offset)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  )
}
