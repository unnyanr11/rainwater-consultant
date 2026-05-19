import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatRow from '../../components/admin/AdminStatRow'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import PageTransition from '../../components/motion/PageTransition'

const STATUS_LABELS = {
  pending:                    'New Lead',
  visit_negotiating:          'Negotiating',
  visit_payment_due:          'Awaiting Payment',
  visit_paid:                 'Visit Paid',
  visit_scheduled:            'Scheduled',
  visit_scheduled_confirmed:  'Confirmed',
  visit_complete:             'Completed',
  measurement_done:           'Measured',
}

const STATUS_COLORS = {
  pending:                    'lead',
  visit_negotiating:          'partial',
  visit_payment_due:          'overdue',
  visit_paid:                 'paid',
  visit_scheduled:            'visit',
  visit_scheduled_confirmed:  'visit',
  visit_complete:             'paid',
  measurement_done:           'design',
}

const VISIT_STATUSES = [
  'pending',
  'visit_negotiating',
  'visit_payment_due',
  'visit_paid',
  'visit_scheduled',
  'visit_scheduled_confirmed',
  'visit_complete',
  'measurement_done',
]

const FILTER_STATUSES = ['all', ...VISIT_STATUSES]

export default function AdminVisits() {
  const [visits, setVisits]         = useState([])
  const [visitFees, setVisitFees]   = useState({}) // map of order_id -> payment record
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      const [visitsRes, feesRes] = await Promise.all([
        supabase
          .from('design_orders')
          .select('id, contact_name, contact_phone, building_type, city, state, status, visit_note, visit_date, confirmed_visit_date, confirmed_visit_time, visit_payment_status, created_at')
          .in('status', VISIT_STATUSES)
          .order('created_at', { ascending: false }),
        // Read visit fees from canonical order_payments table
        supabase
          .from('order_payments')
          .select('order_id, amount_inr, payment_status')
          .eq('payment_type', 'visit_fee'),
      ])

      setVisits(visitsRes.data || [])

      // Build a map: order_id -> fee record for O(1) lookup in the table
      const feeMap = {}
      ;(feesRes.data || []).forEach(f => { feeMap[f.order_id] = f })
      setVisitFees(feeMap)

      setLoading(false)
    }
    load()
  }, [])

  const scheduled   = visits.filter(v => v.status === 'visit_scheduled' || v.status === 'visit_scheduled_confirmed').length
  const completed   = visits.filter(v => v.status === 'visit_complete' || v.status === 'measurement_done').length
  const pending     = visits.filter(v => v.status === 'pending').length
  const negotiating = visits.filter(v => v.status === 'visit_negotiating' || v.status === 'visit_payment_due').length

  const filtered = filter === 'all' ? visits : visits.filter(v => v.status === filter)

  const stats = [
    { label: 'New leads',   value: String(pending).padStart(2,'0'),     sub: 'Awaiting action' },
    { label: 'Negotiating', value: String(negotiating).padStart(2,'0'), sub: 'Counter-offer flow', trend: 0 },
    { label: 'Scheduled',   value: String(scheduled).padStart(2,'0'),   sub: 'Confirmed visits' },
    { label: 'Completed',   value: String(completed).padStart(2,'0'),   sub: 'Field + measured', trend: 12 },
  ]

  if (loading) return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-skeleton-page">
          <div className="admin-skeleton admin-skeleton-heading" />
          <div className="admin-skeleton admin-skeleton-block" />
          <div className="admin-skeleton admin-skeleton-block" />
        </div>
      </main>
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
            subtitle="Click any row to open the lead, view details, and manage the visit negotiation."
            actions={<>
              <button className="admin-btn secondary">Export list</button>
            </>}
          />

          <AdminStatRow stats={stats} />

          <div className="admin-filter-tabs">
            {FILTER_STATUSES.map(f => (
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
              <div><h3>Visit records</h3><p>{filtered.length} entries · click a row to open lead</p></div>
            </div>
            {filtered.length === 0 ? (
              <AdminEmptyState icon="🏗️" title="No visits found" body="No records match this filter." />
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Project type</th>
                    <th>City</th>
                    <th>Status</th>
                    <th>Visit date</th>
                    <th>Payment</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v, i) => {
                    const fee = visitFees[v.id]
                    return (
                      <tr
                        key={v.id}
                        className="admin-table-row"
                        style={{ '--row-delay': `${i * 40}ms`, cursor: 'pointer' }}
                        onClick={() => navigate(`/admin/visits/${v.id}`)}
                      >
                        <td>
                          <strong>{v.contact_name || '—'}</strong>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', display: 'block' }}>{v.contact_phone || ''}</span>
                        </td>
                        <td><span>{v.building_type?.replace(/_/g, ' ') || '—'}</span></td>
                        <td><span>{v.city || '—'}{v.state ? `, ${v.state}` : ''}</span></td>
                        <td>
                          <span className={`admin-status ${STATUS_COLORS[v.status] || 'lead'}`}>
                            {STATUS_LABELS[v.status] || v.status}
                          </span>
                        </td>
                        <td>
                          <span>
                            {v.confirmed_visit_date
                              ? new Date(v.confirmed_visit_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + (v.confirmed_visit_time ? ` · ${v.confirmed_visit_time}` : '')
                              : v.visit_date
                              ? new Date(v.visit_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' (requested)'
                              : '—'
                            }
                          </span>
                        </td>
                        <td>
                          {fee ? (
                            <span className={`admin-status ${fee.payment_status === 'paid' ? 'paid' : 'overdue'}`}>
                              {fee.payment_status === 'paid'
                                ? `₹${fee.amount_inr.toLocaleString('en-IN')} Paid`
                                : `₹${fee.amount_inr.toLocaleString('en-IN')} Due`}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-xs)' }}>—</span>
                          )}
                        </td>
                        <td><span>{new Date(v.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </article>

          <div className="admin-hero-grid">
            <article className="admin-card admin-panel admin-stagger-in">
              <div className="admin-section-head"><div><h3>Conversion funnel</h3><p>Lead to field completion rates.</p></div></div>
              <div className="admin-funnel">
                {[
                  { label: 'Leads',     count: pending,   color: '#d8edf2' },
                  { label: 'Scheduled', count: scheduled, color: '#f8ead8' },
                  { label: 'Completed', count: completed, color: '#daefdf' },
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
              <div className="admin-section-head"><div><h3>Visit efficiency</h3><p>Field-to-completion rate.</p></div></div>
              <div className="admin-ring" style={{ '--pct': `${visits.length ? Math.round((completed / visits.length) * 100) : 0}%` }}>
                <div className="admin-ring-content">
                  <strong>{visits.length ? Math.round((completed / visits.length) * 100) : 0}%</strong>
                  <span>completion</span>
                </div>
              </div>
              <ul className="admin-visit-list">
                <li><span>Total records</span><strong>{visits.length}</strong></li>
                <li><span>Awaiting field</span><strong>{scheduled}</strong></li>
                <li><span>Measured & done</span><strong>{completed}</strong></li>
              </ul>
            </article>
          </div>

        </main>
      </div>
    </PageTransition>
  )
}
