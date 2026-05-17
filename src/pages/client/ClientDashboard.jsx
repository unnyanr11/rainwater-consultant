import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
<<<<<<< HEAD
  LayoutDashboard, Calculator as CalculatorIcon, ClipboardList, CreditCard,
  UserCircle, LogOut, Droplets, LifeBuoy
} from 'lucide-react'

const NAV = [
  { to: '/client',                label: 'Overview',        icon: LayoutDashboard, end: true },
  { to: '/client/calculator',     label: 'Calculator',      icon: CalculatorIcon },
  { to: '/client/orders',         label: 'My Orders',       icon: ClipboardList },
  { to: '/client/payments',       label: 'Payments',        icon: CreditCard },
  { to: '/client/profile',        label: 'Profile',         icon: UserCircle },
  { to: '/client/request-lecture',label: 'Request Lecture', icon: Droplets },
  { to: '/client/support',        label: 'Support',         icon: LifeBuoy },
=======
  LayoutDashboard, ClipboardList, CreditCard,
  UserCircle, LogOut, Droplets, Calculator, BookOpen
} from 'lucide-react'

const NAV = [
  { to: '/client',                  label: 'Overview',          icon: LayoutDashboard, end: true },
  { to: '/client/orders',           label: 'My Orders',         icon: ClipboardList },
  { to: '/client/payments',         label: 'Payments',          icon: CreditCard },
  { to: '/client/calculator',       label: 'Calculator',        icon: Calculator },
  { to: '/client/request-lecture',  label: 'Request a Lecture', icon: BookOpen },
  { to: '/client/profile',          label: 'Profile',           icon: UserCircle },
>>>>>>> ac353a5455730e56e2e74dcdd33da75755af363c
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

<<<<<<< HEAD
=======
      {/* ── Sidebar ── */}
>>>>>>> ac353a5455730e56e2e74dcdd33da75755af363c
      <aside style={{
        width: 240, flexShrink: 0,
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100dvh',
      }}>
<<<<<<< HEAD
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

        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
            {profile?.full_name || 'My Account'}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
            {profile?.email}
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
=======
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Droplets size={22} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--color-text)' }}>RainHarvest</span>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 2 }}>Client Portal</div>
        </div>

        {/* User pill */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{profile?.full_name || 'My Account'}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{profile?.email}</div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
>>>>>>> ac353a5455730e56e2e74dcdd33da75755af363c
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)', fontWeight: 600,
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

<<<<<<< HEAD
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              width: '100%', padding: '0.6rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)', fontWeight: 600,
              color: 'var(--color-text-muted)',
              background: 'none', border: 'none', cursor: 'pointer',
              transition: 'all 150ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-offset)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <LogOut size={16} />
            Sign Out
=======
        {/* Sign out */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={handleSignOut}
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 150ms' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-offset)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <LogOut size={16} /> Sign Out
>>>>>>> ac353a5455730e56e2e74dcdd33da75755af363c
          </button>
        </div>
      </aside>

<<<<<<< HEAD
=======
      {/* ── Main content ── */}
>>>>>>> ac353a5455730e56e2e74dcdd33da75755af363c
      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  )
}
