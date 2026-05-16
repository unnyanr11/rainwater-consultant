import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatRow from '../../components/admin/AdminStatRow'
import PageTransition from '../../components/motion/PageTransition'

export default function AdminReports() {
  const [orders, setOrders] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [oRes, pRes] = await Promise.all([
        supabase.from('design_orders').select('id, status, created_at, project_type'),
        supabase.from('order_payments').select('id, amount, status, created_at'),
      ])
      setOrders(oRes.data || [])
      setPayments(pRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0)
  const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` : `₹${(n / 1000).toFixed(1)}K`

  // Monthly revenue (last 6 months)
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return {
      label: d.toLocaleDateString('en-IN', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
    }
  })

  const monthlyRevenue = months.map(m => ({
    ...m,
    amount: payments
      .filter(p => {
        const d = new Date(p.created_at)
        return p.status === 'paid' && d.getMonth() === m.month && d.getFullYear() === m.year
      })
      .reduce((s, p) => s + (p.amount || 0), 0),
  }))

  const maxMonthly = Math.max(...monthlyRevenue.map(m => m.amount), 1)

  // Project type distribution
  const typeMap = {}
  orders.forEach(o => { typeMap[o.project_type || 'Other'] = (typeMap[o.project_type || 'Other'] || 0) + 1 })
  const typeData = Object.entries(typeMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const stats = [
    { label: 'Total revenue', value: fmt(totalRevenue), sub: 'Collected payments', trend: 12 },
    { label: 'Total orders', value: String(orders.length).padStart(2, '0'), sub: 'All time', trend: 6 },
    { label: 'Avg order value', value: orders.length ? fmt(totalRevenue / orders.length) : '—', sub: 'Per project' },
    { label: 'Completion rate', value: orders.length ? `${Math.round((orders.filter(o => o.status === 'completed').length / orders.length) * 100)}%` : '—', sub: 'Projects closed', trend: 3 },
  ]

  if (loading) return (
    <div className="admin-shell"><AdminSidebar /><main className="admin-main"><div className="admin-skeleton-page"><div className="admin-skeleton admin-skeleton-heading" /><div className="admin-skeleton admin-skeleton-block" /></div></main></div>
  )

  return (
    <PageTransition>
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">
          <AdminPageHeader
            eyebrow="Reports"
            title={<>Business intelligence<br />and analytics.</>}
            subtitle="Revenue trends, project distribution, and performance metrics across all operations."
            actions={<>
              <button className="admin-btn secondary">Export PDF</button>
              <button className="admin-btn primary">Schedule report</button>
            </>}
          />

          <AdminStatRow stats={stats} />

          <div className="admin-hero-grid">
            {/* Monthly revenue chart */}
            <article className="admin-card admin-panel admin-stagger-in">
              <div className="admin-section-head">
                <div><h3>Monthly revenue</h3><p>Last 6 months collection trend.</p></div>
                <span className="admin-status paid">Live</span>
              </div>
              <div className="admin-bar-chart">
                {monthlyRevenue.map((m, i) => (
                  <div key={i} className="admin-bar-chart-col">
                    <span className="admin-bar-chart-value">{m.amount > 0 ? fmt(m.amount) : '—'}</span>
                    <div className="admin-bar-chart-bar">
                      <div
                        className="admin-bar-chart-fill"
                        style={{
                          height: `${(m.amount / maxMonthly) * 100}%`,
                          '--bar-delay': `${i * 80}ms`,
                        }}
                      />
                    </div>
                    <span className="admin-bar-chart-label">{m.label}</span>
                  </div>
                ))}
              </div>
            </article>

            {/* Project type breakdown */}
            <article className="admin-card admin-panel admin-stagger-in">
              <div className="admin-section-head">
                <div><h3>Project distribution</h3><p>By type, all time.</p></div>
              </div>
              <div className="admin-donut-container">
                {typeData.length === 0 ? (
                  <p style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>No data yet.</p>
                ) : (
                  <>
                    <div className="admin-type-list">
                      {typeData.map(([type, count], i) => (
                        <div key={i} className="admin-type-row">
                          <div className="admin-type-info">
                            <span className={`admin-type-dot color-${i}`} />
                            <span>{type}</span>
                          </div>
                          <div className="admin-bar" style={{ flex: 1, maxWidth: '60%' }}>
                            <span style={{ width: `${(count / orders.length) * 100}%` }} />
                          </div>
                          <strong>{count}</strong>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </article>
          </div>

          {/* Status pipeline overview */}
          <article className="admin-card admin-panel admin-stagger-in">
            <div className="admin-section-head">
              <div><h3>Pipeline overview</h3><p>Order counts at each stage.</p></div>
            </div>
            <div className="admin-pipeline-overview">
              {[
                { label: 'Leads', status: 'pending', color: 'lead' },
                { label: 'Visit scheduled', status: 'visit_scheduled', color: 'visit' },
                { label: 'Visit done', status: 'visit_complete', color: 'partial' },
                { label: 'Measured', status: 'measurement_done', color: 'lead' },
                { label: 'Drawing', status: 'drawing_in_progress', color: 'visit' },
                { label: 'Review', status: 'drawing_review', color: 'partial' },
                { label: 'Ready', status: 'drawing_ready', color: 'design' },
                { label: 'Completed', status: 'completed', color: 'paid' },
              ].map((s, i) => {
                const count = orders.filter(o => o.status === s.status).length
                return (
                  <div key={i} className="admin-pipeline-overview-step">
                    <span className={`admin-tag admin-tag-${s.color}`}>{s.label}</span>
                    <strong className="admin-pipeline-count">{count}</strong>
                  </div>
                )
              })}
            </div>
          </article>

        </main>
      </div>
    </PageTransition>
  )
}
