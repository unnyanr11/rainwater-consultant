import { NavLink } from 'react-router-dom'

const NAV = [
  { label: 'Command Center', to: '/admin', badge: '01' },
  { label: 'Site Visits', to: '/admin/visits', badge: null },
  { label: 'Payments', to: '/admin/payments', badge: null },
  { label: 'Design Queue', to: '/admin/designs', badge: null },
  { label: 'Customers', to: '/admin/customers', badge: null },
  { label: 'Reports', to: '/admin/reports', badge: null },
]

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-brand-mark">RC</div>
        <small>Ops Console</small>
        <h1>Field-first<br />Admin</h1>
      </div>
      <nav className="admin-nav">
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} end={n.to === '/admin'} className={({ isActive }) => isActive ? 'active' : ''}>
            <span>{n.label}</span>
            {n.badge && <span>{n.badge}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="admin-sidebar-hint">
        <h3>Workflow-driven layout</h3>
        <p>Lead → site visit → drawing → payment → execution. Every section reflects a real handoff in your consulting work.</p>
      </div>
    </aside>
  )
}
