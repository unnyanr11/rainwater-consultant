import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/admin',          label: 'Command Center',  badge: null,  exact: true },
  { to: '/admin/visits',   label: 'Site Visits',     badge: '14'              },
  { to: '/admin/payments', label: 'Payments',        badge: '09'              },
  { to: '/admin/designs',  label: 'Design Queue',    badge: '07'              },
  { to: '/admin/customers',label: 'Customers',       badge: '28'              },
]

export default function AdminSidebar() {
  const { signOut } = useAuth()

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-brand-mark">RC</div>
        <span className="admin-brand-eyebrow">Ops Console</span>
        <h2 className="admin-brand-name">Rainwater<br />Consultant</h2>
      </div>

      <nav className="admin-nav">
        <span className="admin-nav-label">Navigation</span>
        {navItems.map(({ to, label, badge, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              'admin-nav-link' + (isActive ? ' active' : '')
            }
          >
            <span>{label}</span>
            {badge && <span className="admin-nav-badge">{badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <h4>Field-first design</h4>
        <p>Every page follows your real workflow: lead → visit → drawing → payment → execution.</p>
        <button
          onClick={signOut}
          className="btn btn-ghost btn-sm"
          style={{ marginTop: '0.75rem', width: '100%' }}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}