import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ leads: 0, visits: 0, designs: 0, pendingPayments: 0, collectedAmount: 0, blockedDrawings: 0 })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, paymentsRes] = await Promise.all([
          supabase.from('design_orders').select('id, status, created_at, profiles(full_name)').order('created_at', { ascending: false }).limit(20),
          supabase.from('order_payments').select('amount, status').eq('status', 'confirmed'),
        ])

        const orders = ordersRes.data || []
        const payments = paymentsRes.data || []
        const collected = payments.reduce((s, p) => s + (p.amount || 0), 0)

        setStats({
          leads: orders.filter(o => o.status === 'pending').length,
          visits: orders.filter(o => o.status === 'visit_scheduled').length,
          designs: orders.filter(o => ['drawing_in_progress','revision_requested'].includes(o.status)).length,
          pendingPayments: orders.filter(o => o.status === 'payment_pending').length,
          collectedAmount: collected,
          blockedDrawings: orders.filter(o => o.status === 'payment_pending').length,
        })

        setRecentActivity(orders.slice(0, 5))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const fmt = (n) => n >= 100000
    ? `\u20B9${(n / 100000).toFixed(2)}L`
    : n >= 1000
    ? `\u20B9${(n / 1000).toFixed(1)}K`
    : `\u20B9${n}`

  return (
    <>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Admin • Command Center</p>
          <h1 className="admin-page-title">Operations<br />at a glance</h1>
          <p className="admin-page-subtitle">Payments, visits, design progress, and client movement — grouped by how work actually happens on-ground.</p>
        </div>
        <div className="admin-actions">
          <Link to="/admin/visits"><button className="btn btn-secondary">View all visits</button></Link>
          <Link to="/admin/payments"><button className="btn btn-primary">Manage payments</button></Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="admin-grid-3">
        <div className="kpi-chip accent">
          <span className="kpi-chip-label">Cash collected</span>
          <span className="kpi-chip-value">{loading ? '…' : fmt(stats.collectedAmount)}</span>
          <span className="kpi-chip-sub">Across confirmed payment entries</span>
        </div>
        <div className="kpi-chip">
          <span className="kpi-chip-label">Visits pending</span>
          <span className="kpi-chip-value">{loading ? '…' : String(stats.visits).padStart(2,'0')}</span>
          <span className="kpi-chip-sub">Need scheduling or follow-up</span>
        </div>
        <div className="kpi-chip">
          <span className="kpi-chip-label">Drawings blocked</span>
          <span className="kpi-chip-value">{loading ? '…' : String(stats.blockedDrawings).padStart(2,'0')}</span>
          <span className="kpi-chip-sub">Waiting on measurement or payment</span>
        </div>
      </div>

      {/* Pipeline */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Work pipeline</h3>
            <p className="admin-card-subtitle">Every stage in your rainwater consulting workflow</p>
          </div>
          <span className="badge badge-partial">Live counts</span>
        </div>
        <div className="pipeline-grid">
          <div className="pipeline-step">
            <span className="badge badge-partial">Leads</span>
            <span className="pipeline-step-count">{loading ? '…' : stats.leads}</span>
            <span className="pipeline-step-label">Fresh consultation requests needing qualification</span>
          </div>
          <div className="pipeline-step">
            <span className="badge badge-scheduled">Visits</span>
            <span className="pipeline-step-count">{loading ? '…' : stats.visits}</span>
            <span className="pipeline-step-label">Physical inspections scheduled or overdue</span>
          </div>
          <div className="pipeline-step">
            <span className="badge badge-review">Designs</span>
            <span className="pipeline-step-count">{loading ? '…' : stats.designs}</span>
            <span className="pipeline-step-label">Drawings in progress, revision, or approval</span>
          </div>
          <div className="pipeline-step">
            <span className="badge badge-pending">Payments</span>
            <span className="pipeline-step-count">{loading ? '…' : stats.pendingPayments}</span>
            <span className="pipeline-step-label">Pending collection blocking next delivery</span>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="admin-layout-65-35">
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Recent orders</h3>
              <p className="admin-card-subtitle">Latest client activity across all stages</p>
            </div>
            <Link to="/admin/customers"><button className="btn btn-ghost btn-sm">View all</button></Link>
          </div>
          {loading ? (
            <p style={{color:'#8aa098',fontSize:'0.875rem'}}>Loading…</p>
          ) : recentActivity.length === 0 ? (
            <div className="admin-empty"><h3>No orders yet</h3><p>New client orders will appear here once submitted.</p></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Client</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {recentActivity.map(o => (
                    <tr key={o.id}>
                      <td><span className="td-primary">{o.profiles?.full_name || 'Unknown'}</span></td>
                      <td><span className="badge badge-review">{o.status}</span></td>
                      <td><span className="td-secondary">{new Date(o.created_at).toLocaleDateString('en-IN')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Quick links</h3>
              <p className="admin-card-subtitle">Jump to work in progress</p>
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            {[
              { to: '/admin/visits',    label: 'Site visits board',    sub: 'See pending and completed visits' },
              { to: '/admin/payments',  label: 'Payment tracker',      sub: 'Dues, partial, and fully paid' },
              { to: '/admin/designs',   label: 'Design queue',         sub: 'Drawings in all stages' },
              { to: '/admin/customers', label: 'Customer list',        sub: 'All clients with project status' },
            ].map(({ to, label, sub }) => (
              <Link key={to} to={to} style={{textDecoration:'none'}}>
                <div className="lane-card" style={{cursor:'pointer'}}>
                  <h5>{label}</h5>
                  <p>{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}