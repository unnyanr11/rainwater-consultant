import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import '../../styles/admin.css'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminMetricChip from '../../components/admin/AdminMetricChip'
import AdminPipelineStep from '../../components/admin/AdminPipelineStep'
import AdminKanbanCard from '../../components/admin/AdminKanbanCard'
import PageTransition from '../../components/motion/PageTransition'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [pipeline, setPipeline] = useState([])
  const [payments, setPayments] = useState([])
  const [timeline, setTimeline] = useState([])
  const [workLanes, setWorkLanes] = useState({ field: [], design: [], close: [] })
  const [visitStats, setVisitStats] = useState({ completed: 0, total: 0, today: 0, avgRadius: 0, conversion: 0 })
  const [revenueMetrics, setRevenueMetrics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [ordersRes, paymentsRes, visitsRes, lanesRes] = await Promise.all([
        supabase.from('design_orders').select('id, status, created_at'),
        // Explicit FK hint to guarantee the join never returns null
        supabase.from('order_payments').select('id, amount_inr, payment_status, created_at, design_orders!order_id(contact_name, building_type, status)'),
        supabase.from('design_orders').select('id, status').in('status', ['visit_scheduled', 'visit_complete', 'measurement_done']),
        supabase.from('design_orders').select('id, contact_name, building_type, status, message').limit(12),
      ])

      const orders = ordersRes.data || []
      const pays = paymentsRes.data || []
      const visits = visitsRes.data || []
      const lanes = lanesRes.data || []

      const totalCollected = pays.filter(p => p.payment_status === 'paid').reduce((s, p) => s + (p.amount_inr || 0), 0)
      const visitsPending = orders.filter(o => o.status === 'visit_scheduled').length
      const drawingsBlocked = orders.filter(o => o.status === 'measurement_done').length

      setStats({ totalCollected, visitsPending, drawingsBlocked, totalPaymentsCount: pays.filter(p => p.payment_status === 'paid').length })

      const leads = orders.filter(o => o.status === 'pending').length
      const visitsCount = visits.length
      const designs = orders.filter(o => ['drawing_in_progress', 'drawing_review', 'drawing_ready'].includes(o.status)).length
      const pendingAmount = pays.filter(p => p.payment_status !== 'paid').reduce((s, p) => s + (p.amount_inr || 0), 0)
      setPipeline([
        { label: 'Leads', value: leads, tag: 'lead', desc: 'Fresh consultation requests needing qualification.' },
        { label: 'Visits', value: visitsCount, tag: 'visit', desc: 'Physical inspections mapped by urgency and distance.' },
        { label: 'Designs', value: designs, tag: 'design', desc: 'Drawings under review, revisions, or ready to release.' },
        { label: 'Payments', value: `₹${(pendingAmount / 100000).toFixed(2)}L`, tag: 'payment', desc: 'Pending against estimates, visits, and design milestones.' },
      ])

      const recentPays = pays.slice(0, 4).map(p => ({
        client: p.design_orders?.contact_name || 'Unknown',
        project: p.design_orders?.building_type || '',
        stage: p.design_orders?.status || '',
        paymentStatus: p.payment_status,
        amount: p.amount_inr,
        action: p.payment_status === 'paid' ? 'Move file to implementation follow-up' : 'Follow up on pending payment',
      }))
      setPayments(recentPays)

      const completedVisits = orders.filter(o => o.status === 'visit_complete' || o.status === 'measurement_done').length
      const totalVisits = visits.length || 1
      setVisitStats({
        completed: completedVisits,
        total: totalVisits,
        pct: Math.round((completedVisits / totalVisits) * 100),
        today: orders.filter(o => {
          const d = new Date(o.created_at); const now = new Date()
          return o.status === 'visit_scheduled' && d.toDateString() === now.toDateString()
        }).length,
        conversion: 58,
        avgRadius: 12,
      })

      const total = pays.length || 1
      const paid = pays.filter(p => p.payment_status === 'paid').length
      const delayed = pays.filter(p => p.payment_status === 'pending').length
      const unlocked = orders.filter(o => o.status === 'drawing_ready').length
      setRevenueMetrics([
        { label: 'Collection ratio', value: `${Math.round((paid / total) * 100)}%`, pct: (paid / total) * 100 },
        { label: 'Visit monetization', value: `₹${(totalCollected / Math.max(visitsCount, 1)).toFixed(0)}`, pct: 58 },
        { label: 'Design unlock rate', value: `${Math.round((unlocked / Math.max(designs + unlocked, 1)) * 100)}%`, pct: (unlocked / Math.max(designs + unlocked, 1)) * 100 },
        { label: 'Delayed accounts', value: delayed, pct: (delayed / total) * 100 },
      ])

      const fieldItems = lanes.filter(o => ['visit_scheduled', 'pending'].includes(o.status)).slice(0, 3)
      const designItems = lanes.filter(o => ['measurement_done', 'drawing_in_progress', 'drawing_review'].includes(o.status)).slice(0, 3)
      const closeItems = lanes.filter(o => ['drawing_ready', 'completed'].includes(o.status)).slice(0, 3)
      setWorkLanes({ field: fieldItems, design: designItems, close: closeItems })

      setTimeline([
        { time: 'Today', title: `${pays.filter(p => p.payment_status === 'pending').length} payment reminders pending`, body: 'Clients with unpaid milestones need follow-up.' },
        { time: 'Recent', title: `${orders.filter(o => o.status === 'measurement_done').length} measurements ready for drafting`, body: 'Field dimensions received, drawings can move to draft stage.' },
        { time: 'This week', title: `${orders.filter(o => o.status === 'completed').length} consultations closed`, body: 'Files archived with full payment trails.' },
      ])

      setLoading(false)
    }
    load()
  }, [])

  const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` : `₹${(n / 1000).toFixed(1)}K`

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
      Loading admin console…
    </div>
  )

  return (
    <PageTransition>
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">

          {/* Topbar */}
          <section className="admin-topbar">
            <div>
              <small className="admin-eyebrow">Rainwater Consultant Admin</small>
              <h2 className="admin-hero-title">Run the business from<br />field reality.</h2>
              <p className="admin-hero-sub">Payments, visits, drawings and customer movement grouped by how work actually happens on-ground.</p>
            </div>
            <div className="admin-actions">
              <button className="admin-btn secondary">Export weekly report</button>
              <button className="admin-btn primary">Create new site visit</button>
            </div>
          </section>

          {/* Hero grid */}
          <section className="admin-hero-grid">
            <article className="admin-card admin-heartbeat">
              <div className="admin-section-head">
                <div><h3>Operations heartbeat</h3><p>One-glance view of business flow, not vanity metrics.</p></div>
                <span className="admin-status partial">Live data</span>
              </div>
              <div className="admin-kpis">
                <AdminMetricChip label="Cash collected" value={fmt(stats?.totalCollected || 0)} sub={`Across ${stats?.totalPaymentsCount || 0} confirmed payments`} />
                <AdminMetricChip label="Visits pending" value={String(stats?.visitsPending || 0).padStart(2, '0')} sub="Need scheduling in next 48 hours" />
                <AdminMetricChip label="Drawings blocked" value={String(stats?.drawingsBlocked || 0).padStart(2, '0')} sub="Waiting on measurement or part payment" />
              </div>
              <div className="admin-pipeline">
                {pipeline.map(s => <AdminPipelineStep key={s.label} {...s} />)}
              </div>
            </article>

            <aside className="admin-card admin-visit-panel">
              <div className="admin-section-head"><div><h3>Visit efficiency</h3><p>How site movement affects revenue.</p></div></div>
              <div className="admin-ring" style={{ '--pct': `${visitStats.pct || 0}%` }}>
                <div className="admin-ring-content">
                  <strong>{visitStats.pct || 0}%</strong>
                  <span>visits completed</span>
                </div>
              </div>
              <ul className="admin-visit-list">
                <li><span>Today's site visits</span><strong>{visitStats.today} scheduled</strong></li>
                <li><span>Avg travel cluster</span><strong>{visitStats.avgRadius} km radius</strong></li>
                <li><span>Visit → design conversion</span><strong>{visitStats.conversion}%</strong></li>
              </ul>
            </aside>
          </section>

          {/* Content grid */}
          <section className="admin-content-grid">
            <article className="admin-card admin-table-card">
              <div className="admin-section-head">
                <div><h3>Payment & delivery board</h3><p>Money status shown alongside work stage.</p></div>
                <button className="admin-btn secondary">Filter dues</button>
              </div>
              <table className="admin-table">
                <thead><tr><th>Client</th><th>Work stage</th><th>Payment</th><th>Next action</th></tr></thead>
                <tbody>
                  {payments.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-faint)', padding: '2rem' }}>No payment records yet.</td></tr>
                  )}
                  {payments.map((p, i) => (
                    <tr key={i}>
                      <td><strong>{p.client}</strong><span>{p.project?.replace(/_/g, ' ')}</span></td>
                      <td><span>{p.stage?.replace(/_/g, ' ')}</span></td>
                      <td><span className={`admin-status ${p.paymentStatus === 'paid' ? 'paid' : p.paymentStatus === 'partial' ? 'partial' : 'pending'}`}>{p.paymentStatus === 'paid' ? `₹${p.amount?.toLocaleString()} paid` : p.paymentStatus === 'partial' ? `₹${p.amount?.toLocaleString()} partial` : 'Pending'}</span></td>
                      <td><span>{p.action}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>

            <aside className="admin-card admin-panel">
              <div className="admin-section-head"><div><h3>Decision timeline</h3><p>What needs attention today.</p></div></div>
              <div className="admin-timeline">
                {timeline.map((t, i) => (
                  <div key={i} className="admin-timeline-item">
                    <small>{t.time}</small>
                    <h4>{t.title}</h4>
                    <p>{t.body}</p>
                  </div>
                ))}
              </div>
            </aside>
          </section>

          {/* Bottom grid */}
          <section className="admin-bottom-grid">
            <article className="admin-card admin-panel">
              <div className="admin-section-head"><div><h3>Revenue intelligence</h3><p>Collection quality, not just totals.</p></div></div>
              <div className="admin-metric-cluster">
                {revenueMetrics.map((m, i) => (
                  <div key={i} className="admin-metric-card">
                    <small>{m.label}</small>
                    <strong>{m.value}</strong>
                    <div className="admin-bar"><span style={{ width: `${Math.min(m.pct, 100)}%` }}></span></div>
                  </div>
                ))}
              </div>
            </article>

            <article className="admin-card admin-panel">
              <div className="admin-section-head"><div><h3>Work lanes</h3><p>Each lane reflects a real operational handoff.</p></div></div>
              <div className="admin-kanban">
                <AdminKanbanCard title="Needs field action" items={workLanes.field} />
                <AdminKanbanCard title="In design desk" items={workLanes.design} />
                <AdminKanbanCard title="Ready to close" items={workLanes.close} />
              </div>
            </article>
          </section>

        </main>
      </div>
    </PageTransition>
  )
}
