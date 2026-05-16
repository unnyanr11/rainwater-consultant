import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const STAGES = ['draft','drawing_in_progress','revision_requested','approved','released']

export default function AdminDesigns() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('design_orders')
          .select('id, status, created_at, property_type, roof_type, profiles(full_name)')
          .in('status', STAGES)
          .order('created_at', { ascending: false })
        setOrders(data || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const byStage = (stage) => orders.filter(o => o.status === stage)

  const badgeMap = { draft:'badge-draft', drawing_in_progress:'badge-review', revision_requested:'badge-pending', approved:'badge-approved', released:'badge-released' }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Admin • Design Queue</p>
          <h1 className="admin-page-title">Drawing desk</h1>
          <p className="admin-page-subtitle">All rainwater design orders across every production stage. Move items through draft, drawing, revision, approval, and release.</p>
        </div>
        <div className="admin-actions">
          <button className="btn btn-secondary">Upload drawing</button>
          <button className="btn btn-primary">+ New design brief</button>
        </div>
      </div>

      {/* Design KPIs */}
      <div className="admin-grid-4">
        {[['In draft','draft'],['Drawing','drawing_in_progress'],['Revision','revision_requested'],['Released','released']].map(([label, stage]) => (
          <div key={stage} className={`kpi-chip ${stage==='released' ? 'accent' : ''}`}>
            <span className="kpi-chip-label">{label}</span>
            <span className="kpi-chip-value">{loading ? '…' : byStage(stage).length}</span>
            <span className="kpi-chip-sub">Orders at this stage</span>
          </div>
        ))}
      </div>

      {/* Kanban lanes */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Design kanban</h3>
            <p className="admin-card-subtitle">Drag-ready workflow view of every drawing in production</p>
          </div>
        </div>
        <div className="lanes-grid">
          {[['Needs work',['draft','revision_requested']],['In progress',['drawing_in_progress']],['Done',['approved','released']]].map(([title, stages]) => {
            const items = orders.filter(o => stages.includes(o.status))
            return (
              <div className="lane" key={title}>
                <div className="lane-header">
                  <span className="lane-title">{title}</span>
                  <span className="lane-count">{items.length}</span>
                </div>
                {loading ? <p style={{color:'#8aa098',fontSize:'0.8rem'}}>Loading…</p> :
                items.length === 0 ? <p style={{color:'#8aa098',fontSize:'0.8rem'}}>No items here</p> :
                items.map(o => (
                  <div className="lane-card" key={o.id}>
                    <h5>{o.profiles?.full_name || 'Unknown client'}</h5>
                    <p>{o.property_type || 'Property type unset'} • {o.roof_type || 'Roof type unset'}</p>
                    <div style={{marginTop:'0.25rem'}}>
                      <span className={`badge ${badgeMap[o.status] || 'badge-draft'}`}>{o.status.replace(/_/g,' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Full table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">All design orders</h3>
            <p className="admin-card-subtitle">Complete list with client, type, and drawing status</p>
          </div>
          <button className="btn btn-ghost btn-sm">Filter by stage</button>
        </div>
        {loading ? (
          <p style={{color:'#8aa098',fontSize:'0.875rem'}}>Loading…</p>
        ) : orders.length === 0 ? (
          <div className="admin-empty"><h3>No designs in queue</h3><p>Design orders will appear here once clients complete their brief.</p></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Client</th><th>Property type</th><th>Roof type</th><th>Status</th><th>Created</th><th>Action</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td><span className="td-primary">{o.profiles?.full_name || '—'}</span></td>
                    <td><span style={{fontSize:'0.82rem',color:'#5f766f'}}>{o.property_type || '—'}</span></td>
                    <td><span style={{fontSize:'0.82rem',color:'#5f766f'}}>{o.roof_type || '—'}</span></td>
                    <td><span className={`badge ${badgeMap[o.status] || 'badge-draft'}`}>{o.status.replace(/_/g,' ')}</span></td>
                    <td><span className="td-secondary">{new Date(o.created_at).toLocaleDateString('en-IN')}</span></td>
                    <td><button className="btn btn-ghost btn-sm">Open</button></td>
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