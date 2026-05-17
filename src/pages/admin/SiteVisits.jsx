import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatRow from '../../components/admin/AdminStatRow'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import PageTransition from '../../components/motion/PageTransition'

const STATUS_LABELS = {
  pending:      'New Lead',
  reviewed:     'Reviewed',
  quote_sent:   'Visit Scheduled',
  deposit_paid: 'Deposit Paid',
}

const STATUS_COLORS = {
  pending:      'lead',
  reviewed:     'visit',
  quote_sent:   'partial',
  deposit_paid: 'paid',
}

export default function AdminVisits() {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('design_orders')
        .select('id, contact_name, contact_phone, building_type, status, visit_date, visit_note, city, state, admin_notes, created_at')
        .in('status', ['pending', 'reviewed', 'quote_sent', 'deposit_paid'])
        .order('created_at', { ascending: false })
      setVisits(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const scheduled  = visits.filter(v => v.status === 'quote_sent').length
  const completed  = visits.filter(v => v.status === 'deposit_paid').length
  const pending    = visits.filter(v => v.status === 'pending').length
  const reviewed   = visits.filter(v => v.status === 'reviewed').length

  const filtered = filter === 'all' ? visits : visits.filter(v => v.status === filter)

  const stats = [
    { label: 'Total visits', value: String(visits.length).padStart(2, '0'), sub: 'All time' },
    { label: 'Scheduled', value: String(scheduled).padStart(2, '0'), sub: 'Awaiting field', trend: 0 },
    { label: 'Deposit paid', value: String(completed).padStart(2, '0'), sub: 'Field + confirmed', trend: 12 },
    { label: 'Leads pending', value: String(pending).padStart(2, '0'), sub: 'Need qualification' },
  ]

  if (loading) return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main"><div className="admin-skeleton-page"><div className="admin-skeleton admin-skeleton-heading" /><div className="admin-skeleton admin-skeleton-block" /><div className="admin-skeleton admin-skeleton-block" /></div></main>
    </div>
  )

  return (
    <PageTransition>
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">
          <AdminPageHeader
            eyebrow="Site Visits"
            title={<>Field visits & site<br />inspections.</>}
            subtitle="Track every consultation request from lead to deposit confirmation."
            actions={<>
              <button className="admin-btn secondary">Export list</button>
              <button className="admin-btn primary">Schedule visit</button>
            </>}
          />

          <AdminStatRow stats={stats} />

          <div className="admin-filter-tabs">
            {['all', 'pending', 'reviewed', 'quote_sent', 'deposit_paid'].map(f => (
              <button
                key={f}
                className={`admin-filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : STATUS_LABELS[f] || f}
                <span className="admin-filter-count">
                  {f === 'all' ? visits.length : visits.filter(v => v.status === f).length}
                </span>
              </button>
            ))}
          </div>

          <article className="admin-card admin-table-card admin-stagger-in">
            <div className="admin-section-head">
              <div><h3>Visit records</h3><p>{filtered.length} entries</p></div>
            </div>
            {filtered.length === 0 ? (
              <AdminEmptyState icon="🏗️" title="No visits found" body="No records match this filter. Try scheduling a site visit." />
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Building type</th>
                    <th>Location</th>
                    <th>Visit date</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v, i) => (
                    <tr key={v.id} className="admin-table-row" style={{ '--row-delay': `${i * 40}ms` }}>
                      <td>
                        <strong>{v.contact_name || '—'}</strong>
                        <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{v.contact_phone || ''}</span>
                      </td>
                      <td><span>{(v.building_type || '—').replace(/_/g, ' ')}</span></td>
                      <td><span>{v.city ? `${v.city}, ${v.state}` : '—'}</span></td>
                      <td><span>{v.visit_date ? new Date(v.visit_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span></td>
                      <td>
                        <span className={`admin-status ${STATUS_COLORS[v.status] || 'pending'}`}>
                          {STATUS_LABELS[v.status] || v.status}
                        </span>
                      </td>
                      <td><span style={{ maxWidth: '24ch', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.visit_note || v.admin_notes || '—'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </article>

          <div className="admin-hero-grid">
            <article className="admin-card admin-panel admin-stagger-in">
              <div className="admin-section-head"><div><h3>Conversion funnel</h3><p>Lead to field completion rates.</p></div></div>
              <div className="admin-funnel">
                {[
                  { label: 'New Leads', count: pending, color: '#d8edf2' },
                  { label: 'Reviewed', count: reviewed, color: '#f8ead8' },
                  { label: 'Scheduled', count: scheduled, color: '#fde8c0' },
                  { label: 'Deposit Paid', count: completed, color: '#daefdf' },
                ].map((step, i) => (
                  <div key={i} className="admin-funnel-step">
                    <div className="admin-funnel-label">
                      <span>{step.label}</span>
                      <strong>{step.count}</strong>
                    </div>
                    <div className="admin-bar">
                      <span style={{ width: `${visits.length ? (step.count / visits.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="admin-card admin-visit-panel admin-stagger-in">
              <div className="admin-section-head"><div><h3>Visit efficiency</h3><p>Field-to-deposit rate.</p></div></div>
              <div className="admin-ring" style={{ '--pct': `${visits.length ? Math.round((completed / visits.length) * 100) : 0}%` }}>
                <div className="admin-ring-content">
                  <strong>{visits.length ? Math.round((completed / visits.length) * 100) : 0}%</strong>
                  <span>completion</span>
                </div>
              </div>
              <ul className="admin-visit-list">
                <li><span>Total records</span><strong>{visits.length}</strong></li>
                <li><span>Awaiting visit</span><strong>{scheduled}</strong></li>
                <li><span>Deposit confirmed</span><strong>{completed}</strong></li>
              </ul>
            </article>
          </div>
        </main>
      </div>
    </PageTransition>
  )
}
