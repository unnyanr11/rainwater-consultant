import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatRow from '../../components/admin/AdminStatRow'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import PageTransition from '../../components/motion/PageTransition'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('design_orders')
        .select('id, client_name, project_type, status, notes, created_at')
        .order('created_at', { ascending: false })
      // Deduplicate by client_name
      const seen = new Set()
      const unique = (data || []).filter(d => {
        if (!d.client_name || seen.has(d.client_name)) return false
        seen.add(d.client_name)
        return true
      })
      setCustomers(unique)
      setLoading(false)
    }
    load()
  }, [])

  const active = customers.filter(c => !['completed'].includes(c.status)).length
  const completed = customers.filter(c => c.status === 'completed').length

  const stats = [
    { label: 'Total clients', value: String(customers.length).padStart(2, '0'), sub: 'Unique accounts' },
    { label: 'Active', value: String(active).padStart(2, '0'), sub: 'Open files', trend: 4 },
    { label: 'Completed', value: String(completed).padStart(2, '0'), sub: 'Closed projects' },
    { label: 'Avg projects', value: customers.length ? '1.2' : '—', sub: 'Per client' },
  ]

  const filtered = search
    ? customers.filter(c => c.client_name?.toLowerCase().includes(search.toLowerCase()) || c.project_type?.toLowerCase().includes(search.toLowerCase()))
    : customers

  const STATUS_COLOR = { pending: 'pending', visit_scheduled: 'visit', visit_complete: 'partial', measurement_done: 'lead', drawing_in_progress: 'visit', drawing_review: 'partial', drawing_ready: 'design', completed: 'paid' }

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

          {/* Search bar */}
          <div className="admin-search-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Search by client name or project type…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="admin-search-input"
            />
            {search && <button className="admin-search-clear" onClick={() => setSearch('')}>✕</button>}
          </div>

          {/* Customer grid */}
          {filtered.length === 0 ? (
            <AdminEmptyState icon="👤" title="No clients found" body={search ? 'Try a different name or project type.' : 'No customers yet.'} />
          ) : (
            <div className="admin-customer-grid admin-stagger-in">
              {filtered.map((c, i) => (
                <div key={c.id} className="admin-customer-card" style={{ '--card-delay': `${i * 50}ms` }}>
                  <div className="admin-customer-avatar">
                    {(c.client_name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="admin-customer-info">
                    <strong>{c.client_name || 'Unknown'}</strong>
                    <span>{c.project_type || '—'}</span>
                  </div>
                  <span className={`admin-status ${STATUS_COLOR[c.status] || 'pending'}`}>
                    {(c.status || '').replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  )
}
