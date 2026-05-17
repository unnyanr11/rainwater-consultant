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
<<<<<<< HEAD
      const { data } = await supabase
        .from('design_orders')
        .select('id, contact_name, contact_email, contact_phone, building_type, status, message, created_at')
        .order('created_at', { ascending: false })
      // Deduplicate by contact_email (more reliable than name)
      const seen = new Set()
      const unique = (data || []).filter(d => {
        const key = d.contact_email || d.contact_name
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      })
=======
      // FIX: join profiles table via user_id to get canonical client data
      // for logged-in clients. Falls back to contact_* fields for guest orders.
      const { data } = await supabase
        .from('design_orders')
        .select('id, contact_name, contact_email, contact_phone, building_type, status, message, created_at, user_id, profiles(full_name, email, phone, city, avatar_url)')
        .order('created_at', { ascending: false })

      // Deduplicate: prefer user_id grouping for authenticated clients,
      // fall back to contact_email for guest submissions
      const seenUserIds = new Set()
      const seenEmails = new Set()
      const unique = (data || []).filter(d => {
        if (d.user_id) {
          if (seenUserIds.has(d.user_id)) return false
          seenUserIds.add(d.user_id)
          return true
        }
        const key = d.contact_email || d.contact_name
        if (!key || seenEmails.has(key)) return false
        seenEmails.add(key)
        return true
      })

>>>>>>> ac353a5455730e56e2e74dcdd33da75755af363c
      setCustomers(unique)
      setLoading(false)
    }
    load()
  }, [])

<<<<<<< HEAD
  const active = customers.filter(c => !['completed', 'cancelled'].includes(c.status)).length
  const completed = customers.filter(c => c.status === 'completed').length

=======
  // Helper: resolve display name — prefer linked profile, fall back to contact fields
  const getName = (c) => c.profiles?.full_name || c.contact_name || 'Unknown'
  const getEmail = (c) => c.profiles?.email || c.contact_email || ''
  const getPhone = (c) => c.profiles?.phone || c.contact_phone || ''

  const active = customers.filter(c => !['completed', 'cancelled'].includes(c.status)).length
  const completed = customers.filter(c => c.status === 'completed').length

>>>>>>> ac353a5455730e56e2e74dcdd33da75755af363c
  const stats = [
    { label: 'Total clients', value: String(customers.length).padStart(2, '0'), sub: 'Unique accounts' },
    { label: 'Active', value: String(active).padStart(2, '0'), sub: 'Open files', trend: 4 },
    { label: 'Completed', value: String(completed).padStart(2, '0'), sub: 'Closed projects' },
    { label: 'Avg projects', value: customers.length ? '1.2' : '—', sub: 'Per client' },
  ]

  const filtered = search
    ? customers.filter(c =>
<<<<<<< HEAD
        c.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.contact_email?.toLowerCase().includes(search.toLowerCase()) ||
=======
        getName(c).toLowerCase().includes(search.toLowerCase()) ||
        getEmail(c).toLowerCase().includes(search.toLowerCase()) ||
>>>>>>> ac353a5455730e56e2e74dcdd33da75755af363c
        c.building_type?.toLowerCase().includes(search.toLowerCase())
      )
    : customers

  const STATUS_COLOR = {
    pending: 'pending', visit_scheduled: 'visit', visit_complete: 'partial',
    measurement_done: 'lead', drawing_in_progress: 'visit', drawing_review: 'partial',
    drawing_ready: 'design', completed: 'paid', cancelled: 'pending',
  }

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
              placeholder="Search by name, email or project type…"
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
<<<<<<< HEAD
                    {(c.contact_name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="admin-customer-info">
                    <strong>{c.contact_name || 'Unknown'}</strong>
                    <span>{c.building_type?.replace(/_/g, ' ') || '—'}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>{c.contact_phone || c.contact_email || ''}</span>
=======
                    {c.profiles?.avatar_url
                      ? <img src={c.profiles.avatar_url} alt={getName(c)} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      : (getName(c)).charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="admin-customer-info">
                    <strong>{getName(c)}</strong>
                    <span>{c.building_type?.replace(/_/g, ' ') || '—'}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
                      {getPhone(c) || getEmail(c)}
                    </span>
>>>>>>> ac353a5455730e56e2e74dcdd33da75755af363c
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
