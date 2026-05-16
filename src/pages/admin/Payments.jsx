import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function load() {
      try {
        const [pRes, oRes] = await Promise.all([
          supabase.from('order_payments').select('id, amount, status, payment_date, milestone, design_orders(id, profiles(full_name))').order('payment_date', { ascending: false }),
          supabase.from('design_orders').select('id, status, total_price, profiles(full_name)').in('status', ['payment_pending','partial_payment','completed'])
        ])
        setPayments(pRes.data || [])
        setOrders(oRes.data || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const confirmed = payments.filter(p => p.status === 'confirmed')
  const pending = payments.filter(p => p.status === 'pending')
  const totalCollected = confirmed.reduce((s, p) => s + (p.amount || 0), 0)
  const totalPending = pending.reduce((s, p) => s + (p.amount || 0), 0)

  const fmt = (n) => n >= 100000 ? `\u20B9${(n/100000).toFixed(2)}L` : n >= 1000 ? `\u20B9${(n/1000).toFixed(1)}K` : `\u20B9${n}`

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter)

  return (
    <>
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Admin • Payments</p>
          <h1 className="admin-page-title">Payment tracker</h1>
          <p className="admin-page-subtitle">Every rupee collected and outstanding. Filter by status to find dues that are blocking design delivery.</p>
        </div>
        <div className="admin-actions">
          <button className="btn btn-secondary">Export CSV</button>
          <button className="btn btn-primary">+ Record payment</button>
        </div>
      </div>

      {/* Revenue KPIs */}
      <div className="admin-grid-4">
        <div className="kpi-chip accent">
          <span className="kpi-chip-label">Total collected</span>
          <span className="kpi-chip-value">{loading ? '…' : fmt(totalCollected)}</span>
          <span className="kpi-chip-sub">{confirmed.length} confirmed payments</span>
        </div>
        <div className="kpi-chip">
          <span className="kpi-chip-label">Outstanding</span>
          <span className="kpi-chip-value">{loading ? '…' : fmt(totalPending)}</span>
          <span className="kpi-chip-sub">{pending.length} payments pending</span>
        </div>
        <div className="kpi-chip">
          <span className="kpi-chip-label">Collection ratio</span>
          <span className="kpi-chip-value">{loading || (totalCollected + totalPending) === 0 ? '…' : `${Math.round(totalCollected / (totalCollected + totalPending) * 100)}%`}</span>
          <span className="kpi-chip-sub">Collected vs total raised</span>
        </div>
        <div className="kpi-chip">
          <span className="kpi-chip-label">Blocking deliveries</span>
          <span className="kpi-chip-value">{loading ? '…' : orders.filter(o => o.status === 'payment_pending').length}</span>
          <span className="kpi-chip-sub">Orders held for payment</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
        {['all','confirmed','pending','failed'].map(f => (
          <button key={f} className={filter===f ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="admin-layout-65-35">
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Payment ledger</h3>
              <p className="admin-card-subtitle">Each entry shows client, amount, milestone and current status</p>
            </div>
          </div>
          {loading ? (
            <p style={{color:'#8aa098',fontSize:'0.875rem'}}>Loading payments…</p>
          ) : filtered.length === 0 ? (
            <div className="admin-empty"><h3>No payments found</h3><p>No payment entries match the selected filter.</p></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Client</th><th>Milestone</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td><span className="td-primary">{p.design_orders?.profiles?.full_name || '—'}</span></td>
                      <td><span style={{fontSize:'0.82rem',color:'#5f766f'}}>{p.milestone || 'General'}</span></td>
                      <td><span className="td-primary">{fmt(p.amount || 0)}</span></td>
                      <td><span className="td-secondary">{p.payment_date ? new Date(p.payment_date).toLocaleDateString('en-IN') : '—'}</span></td>
                      <td><span className={`badge badge-${p.status === 'confirmed' ? 'paid' : p.status === 'pending' ? 'pending' : 'overdue'}`}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
          {/* Ring chart */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title">Collection health</h3>
                <p className="admin-card-subtitle">Collected vs outstanding</p>
              </div>
            </div>
            <div className="ring-chart-wrap">
              {loading ? <p style={{color:'#8aa098'}}>Loading…</p> : (
                <>
                  <div
                    className="ring-chart"
                    style={{
                      background: `conic-gradient(#0d7a5f 0 ${Math.round(totalCollected/(totalCollected+totalPending||1)*100)}%, #eaf1ee ${Math.round(totalCollected/(totalCollected+totalPending||1)*100)}% 100%)`
                    }}
                  >
                    <div className="ring-chart-center">
                      <span className="ring-chart-value">{Math.round(totalCollected/(totalCollected+totalPending||1)*100)}%</span>
                      <span className="ring-chart-label">collected</span>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'1.5rem',justifyContent:'center'}}>
                    <div style={{textAlign:'center'}}><div style={{fontWeight:800,fontSize:'1rem',color:'#0d7a5f'}}>{fmt(totalCollected)}</div><div style={{fontSize:'0.72rem',color:'#8aa098',textTransform:'uppercase',letterSpacing:'0.1em'}}>Collected</div></div>
                    <div style={{textAlign:'center'}}><div style={{fontWeight:800,fontSize:'1rem',color:'#a05a00'}}>{fmt(totalPending)}</div><div style={{fontSize:'0.72rem',color:'#8aa098',textTransform:'uppercase',letterSpacing:'0.1em'}}>Pending</div></div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Orders pending payment */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title">Blocking deliveries</h3>
                <p className="admin-card-subtitle">Orders held due to unpaid milestones</p>
              </div>
            </div>
            {loading ? <p style={{color:'#8aa098',fontSize:'0.875rem'}}>Loading…</p> : (
              <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                {orders.filter(o => o.status==='payment_pending').slice(0,5).map(o => (
                  <div className="lane-card" key={o.id}>
                    <h5>{o.profiles?.full_name || 'Unknown'}</h5>
                    <p>Total: {fmt(o.total_price || 0)} — Payment pending</p>
                  </div>
                ))}
                {orders.filter(o => o.status==='payment_pending').length === 0 && (
                  <p style={{color:'#8aa098',fontSize:'0.875rem'}}>No orders blocked. All payments up to date.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}