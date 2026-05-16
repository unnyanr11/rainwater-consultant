import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, created_at, design_orders(id, status, total_price)')
          .order('created_at', { ascending: false })
        setCustomers(data || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = customers.filter(c =>
    !search ||
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const getInitials = (name) => name ? name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : '?'
  const fmt = (n) => n >= 100000 ? `\u20B9${(n/100000).toFixed(2)}L` : n >= 1000 ? `\u20B9${(n/1000).toFixed(1)}K` : `\u20B9${n||0}`
  const activeOrders = (c) => c.design_orders?.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length || 0
  const totalSpent = (c) => c.design_orders?.reduce((s,o) => s + (o.total_price||0), 0) || 0

  return (
    <>
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Admin • Customers</p>
          <h1 className="admin-page-title">Client roster</h1>
          <p className="admin-page-subtitle">Every registered client with their project history, active orders, and total business value.</p>
        </div>
        <div className="admin-actions">
          <button className="btn btn-secondary">Export list</button>
        </div>
      </div>

      {/* Customer KPIs */}
      <div className="admin-grid-3">
        <div className="kpi-chip accent">
          <span className="kpi-chip-label">Total clients</span>
          <span className="kpi-chip-value">{loading ? '…' : customers.length}</span>
          <span className="kpi-chip-sub">All registered accounts</span>
        </div>
        <div className="kpi-chip">
          <span className="kpi-chip-label">With active orders</span>
          <span className="kpi-chip-value">{loading ? '…' : customers.filter(c => activeOrders(c) > 0).length}</span>
          <span className="kpi-chip-sub">Clients with ongoing work</span>
        </div>
        <div className="kpi-chip">
          <span className="kpi-chip-label">Total order value</span>
          <span className="kpi-chip-value">{loading ? '…' : fmt(customers.reduce((s,c) => s + totalSpent(c), 0))}</span>
          <span className="kpi-chip-sub">Across all clients and orders</span>
        </div>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding:'0.85rem 1.25rem', borderRadius:'999px', border:'1px solid #dbe8e2', background:'white', fontSize:'0.875rem', width:'100%', maxWidth:'420px', outline:'none', fontFamily:'inherit', color:'#18342d' }}
        />
      </div>

      {/* Customer table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">All customers</h3>
            <p className="admin-card-subtitle">Click a row to see full order history</p>
          </div>
        </div>
        {loading ? (
          <p style={{color:'#8aa098',fontSize:'0.875rem'}}>Loading customers…</p>
        ) : filtered.length === 0 ? (
          <div className="admin-empty"><h3>No customers found</h3><p>No clients match your search. Try a different name or email.</p></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Client</th><th>Contact</th><th>Orders</th><th>Active</th><th>Total value</th><th>Joined</th></tr></thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} style={{cursor:'pointer'}}>
                    <td>
                      <div className="customer-row">
                        <div className="customer-avatar">{getInitials(c.full_name)}</div>
                        <div>
                          <span className="td-primary">{c.full_name || 'Unnamed'}</span>
                          <span className="td-secondary">{c.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="td-secondary">{c.phone || '—'}</span></td>
                    <td><span style={{fontWeight:700,color:'#18342d'}}>{c.design_orders?.length || 0}</span></td>
                    <td>
                      {activeOrders(c) > 0
                        ? <span className="badge badge-review">{activeOrders(c)} active</span>
                        : <span className="badge badge-completed">All done</span>}
                    </td>
                    <td><span style={{fontWeight:700,color:'#0d7a5f'}}>{fmt(totalSpent(c))}</span></td>
                    <td><span className="td-secondary">{new Date(c.created_at).toLocaleDateString('en-IN')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}