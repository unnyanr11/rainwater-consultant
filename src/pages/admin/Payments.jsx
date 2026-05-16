import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatRow from '../../components/admin/AdminStatRow'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import PageTransition from '../../components/motion/PageTransition'

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('order_payments')
        .select('id, amount, status, created_at, design_orders(client_name, project_type, status)')
        .order('created_at', { ascending: false })
      setPayments(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const totalCollected = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0)
  const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0)
  const totalPartial = payments.filter(p => p.status === 'partial').reduce((s, p) => s + (p.amount || 0), 0)
  const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(2)}L` : `₹${(n / 1000).toFixed(1)}K`

  const stats = [
    { label: 'Total collected', value: fmt(totalCollected), sub: `${payments.filter(p => p.status === 'paid').length} payments`, trend: 8 },
    { label: 'Pending recovery', value: fmt(totalPending), sub: `${payments.filter(p => p.status === 'pending').length} accounts` },
    { label: 'Partial payments', value: fmt(totalPartial), sub: `${payments.filter(p => p.status === 'partial').length} accounts` },
    { label: 'Collection ratio', value: payments.length ? `${Math.round((payments.filter(p => p.status === 'paid').length / payments.length) * 100)}%` : '—', sub: 'Paid / total', trend: 5 },
  ]

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter)

  const collectionPct = payments.length ? (payments.filter(p => p.status === 'paid').length / payments.length) * 100 : 0

  if (loading) return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main"><div className="admin-skeleton-page"><div className="admin-skeleton admin-skeleton-heading" /><div className="admin-skeleton admin-skeleton-block" /></div></main>
    </div>
  )

  return (
    <PageTransition>
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">
          <AdminPageHeader
            eyebrow="Payments"
            title={<>Revenue &amp; payment<br />tracking.</>}
            subtitle="Monitor collections, pending dues, and partial payments across all client accounts."
            actions={<>
              <button className="admin-btn secondary">Download statement</button>
              <button className="admin-btn primary">Record payment</button>
            </>}
          />

          <AdminStatRow stats={stats} />

          {/* Collection progress bar */}
          <article className="admin-card admin-panel admin-stagger-in">
            <div className="admin-section-head">
              <div><h3>Collection health</h3><p>Breakdown by payment status.</p></div>
              <span className={`admin-status ${collectionPct >= 70 ? 'paid' : collectionPct >= 40 ? 'partial' : 'pending'}`}>
                {collectionPct.toFixed(0)}% collected
              </span>
            </div>
            <div className="admin-health-bars">
              {[
                { label: 'Paid', count: payments.filter(p => p.status === 'paid').length, cls: 'paid', pct: collectionPct },
                { label: 'Partial', count: payments.filter(p => p.status === 'partial').length, cls: 'partial', pct: payments.length ? (payments.filter(p => p.status === 'partial').length / payments.length) * 100 : 0 },
                { label: 'Pending', count: payments.filter(p => p.status === 'pending').length, cls: 'pending', pct: payments.length ? (payments.filter(p => p.status === 'pending').length / payments.length) * 100 : 0 },
              ].map((b, i) => (
                <div key={i} className="admin-health-bar-row">
                  <div className="admin-health-label">
                    <span className={`admin-status-pill ${b.cls}`}>{b.label}</span>
                    <strong>{b.count} records</strong>
                  </div>
                  <div className="admin-bar admin-bar-lg">
                    <span className={`admin-bar-fill-${b.cls}`} style={{ width: `${b.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Filter tabs */}
          <div className="admin-filter-tabs">
            {['all', 'paid', 'partial', 'pending'].map(f => (
              <button
                key={f}
                className={`admin-filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="admin-filter-count">
                  {f === 'all' ? payments.length : payments.filter(p => p.status === f).length}
                </span>
              </button>
            ))}
          </div>

          {/* Payments table */}
          <article className="admin-card admin-table-card admin-stagger-in">
            <div className="admin-section-head">
              <div><h3>Payment register</h3><p>{filtered.length} records</p></div>
            </div>
            {filtered.length === 0 ? (
              <AdminEmptyState icon="💳" title="No payments found" body="No payment records match this filter." />
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Project</th>
                    <th>Work stage</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.id} className="admin-table-row" style={{ '--row-delay': `${i * 40}ms` }}>
                      <td><strong>{p.design_orders?.client_name || '—'}</strong></td>
                      <td><span>{p.design_orders?.project_type || '—'}</span></td>
                      <td><span>{(p.design_orders?.status || '—').replace(/_/g, ' ')}</span></td>
                      <td><strong>₹{(p.amount || 0).toLocaleString('en-IN')}</strong></td>
                      <td>
                        <span className={`admin-status ${p.status === 'paid' ? 'paid' : p.status === 'partial' ? 'partial' : 'pending'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td><span>{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </article>
        </main>
      </div>
    </PageTransition>
  )
}
