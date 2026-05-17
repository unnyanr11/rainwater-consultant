import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatRow from '../../components/admin/AdminStatRow'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import PageTransition from '../../components/motion/PageTransition'

const STATUS_COLOR = {
  pending:       'pending',
  reviewed:      'visit',
  quote_sent:    'partial',
  deposit_paid:  'lead',
  in_progress:   'visit',
  drawings_ready:'design',
  completed:     'paid',
  cancelled:     'lead',
}

const STATUS_LABEL = {
  pending:       'New Lead',
  reviewed:      'Reviewed',
  quote_sent:    'Quote Sent',
  deposit_paid:  'Deposit Paid',
  in_progress:   'In Progress',
  drawings_ready:'Drawings Ready',
  completed:     'Completed',
  cancelled:     'Cancelled',
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('design_orders')
        .select('id, user_id, contact_name, contact_email, contact_phone, building_type, status, city, state, created_at, quoted_amount')
        .order('created_at', { ascending: false })

      // Deduplicate by user_id (preferred) or contact_email
      const seen = new Set()
      const unique = (data || []).filter(d => {
        const key = d.user_id || d.contact_email
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      })
      setCustomers(unique)
      setLoading(false)
    }
    load()
  }, [])

  const active    = customers.filter(c => !['completed', 'cancelled'].includes(c.status)).length
  const completed = customers.filter(c => c.status === 'completed').length

  const stats = [
    { label: 'Total clients',  value: String(customers.length).padStart(2, '0'), sub: 'Unique accounts' },
    { label: 'Active',         value: String(active).padStart(2, '0'),           sub: 'Open files', trend: 4 },
    { label: 'Completed',      value: String(completed).padStart(2, '0'),        sub: 'Closed projects' },
    { label: 'Avg projects',   value: customers.length ? '1.0' : '—',           sub: 'Per client' },
  ]

  const filtered = search
    ? customers.filter(c =>
        c.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.contact_email?.toLowerCase().includes(search.toLowerCase()) ||
        c.building_type?.toLowerCase().includes(search.toLowerCase()) ||
        c.city?.toLowerCase().includes(search.toLowerCase())
      )
    : customers

  if (loading) return (
    <div className="admin-shell"><AdminSidebar /><main className="admin-main"><div className="admin-skeleton-page"><div className="admin-skeleton admin-skeleton-heading" /><div className="admin-skeleton admin-skeleton-block" /></div></main></div>
  )

  return (
    <PageTransition>
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">
          <AdminPageHeader
            eyebrow="Customers"
            title={<>Client accounts &amp;<br />project history.</>}
            subtitle="Every client, their project type, current stage, and engagement history."
            actions={<>
              <button className="admin-btn secondary">Export clients</button>
              <button className="admin-btn primary">Add client</button>
            </>}
          />

          <AdminStatRow stats={stats} />

          <div className="admin-search-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Search by name, email, building type or city…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="admin-search-input"
            />
            {search && <button className="admin-search-clear" onClick={() => setSearch('')}>✕</button>}
          </div>

          {filtered.length === 0 ? (
            <AdminEmptyState icon="👤" title="No clients found" body={search ? 'Try a different name or project type.' : 'No customers yet.'} />
          ) : (
            <div className="admin-customer-grid admin-stagger-in">
              {filtered.map((c, i) => (
                <div key={c.id} className="admin-customer-card" style={{ '--card-delay': `${i * 50}ms` }}>
                  <div className="admin-customer-avatar">
                    {(c.contact_name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="admin-customer-info">
                    <strong>{c.contact_name || 'Unknown'}</strong>
                    <span>{(c.building_type || '—').replace(/_/g, ' ')}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>{c.city ? `${c.city}, ${c.state}` : ''}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-1)' }}>
                    <span className={`admin-status ${STATUS_COLOR[c.status] || 'pending'}`}>
                      {STATUS_LABEL[c.status] || c.status}
                    </span>
                    {c.quoted_amount && <small style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>₹{Number(c.quoted_amount).toLocaleString('en-IN')}</small>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  )
}
