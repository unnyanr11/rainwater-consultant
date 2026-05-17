import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatRow from '../../components/admin/AdminStatRow'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import PageTransition from '../../components/motion/PageTransition'

const STAGE_COLORS = {
  deposit_paid:   'lead',
  in_progress:    'visit',
  drawings_ready: 'paid',
  completed:      'paid',
}

const STAGE_LABELS = {
  deposit_paid:   'Ready to draft',
  in_progress:    'In progress',
  drawings_ready: 'Ready to release',
  completed:      'Completed',
}

export default function AdminDesigns() {
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('board')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('design_orders')
        .select('id, contact_name, building_type, status, admin_notes, visit_note, quoted_amount, city, created_at')
        .in('status', ['deposit_paid', 'in_progress', 'drawings_ready', 'completed'])
        .order('created_at', { ascending: false })
      setDesigns(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const byStage = (s) => designs.filter(d => d.status === s)

  const stats = [
    { label: 'In queue',          value: String(byStage('deposit_paid').length).padStart(2,'0'),   sub: 'Ready to draft' },
    { label: 'In progress',       value: String(byStage('in_progress').length).padStart(2,'0'),    sub: 'Active drawing' },
    { label: 'Ready to release',  value: String(byStage('drawings_ready').length).padStart(2,'0'), sub: 'Final approved', trend: 3 },
    { label: 'Completed',         value: String(byStage('completed').length).padStart(2,'0'),      sub: 'Archived' },
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
            eyebrow="Design Queue"
            title={<>Drawings, revisions<br />and approvals.</>}
            subtitle="Every design file tracked from first draft to final client release."
            actions={<>
              <div className="admin-view-toggle">
                <button className={`admin-view-btn ${view === 'board' ? 'active' : ''}`} onClick={() => setView('board')}>Board</button>
                <button className={`admin-view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>List</button>
              </div>
              <button className="admin-btn primary">New design file</button>
            </>}
          />

          <AdminStatRow stats={stats} />

          {view === 'board' ? (
            <div className="admin-design-board admin-stagger-in">
              {Object.entries(STAGE_LABELS).map(([status, label]) => (
                <div key={status} className="admin-design-column">
                  <div className="admin-design-col-header">
                    <span className={`admin-status-dot-lg ${STAGE_COLORS[status]}`} />
                    <h4>{label}</h4>
                    <span className="admin-kanban-count">{byStage(status).length}</span>
                  </div>
                  <div className="admin-design-cards">
                    {byStage(status).length === 0 && <div className="admin-design-empty">Empty lane</div>}
                    {byStage(status).map((d, i) => (
                      <div key={d.id} className="admin-design-card" style={{ '--card-delay': `${i * 60}ms` }}>
                        <strong>{d.contact_name || 'Client'}</strong>
                        <span>{(d.building_type || '—').replace(/_/g, ' ')}</span>
                        {d.city && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{d.city}</span>}
                        {d.quoted_amount && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>₹{Number(d.quoted_amount).toLocaleString('en-IN')}</span>}
                        {(d.admin_notes || d.visit_note) && <p className="admin-design-note">{d.admin_notes || d.visit_note}</p>}
                        <small>{new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</small>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <article className="admin-card admin-table-card admin-stagger-in">
              {designs.length === 0 ? (
                <AdminEmptyState icon="✏️" title="No designs in queue" body="Start by marking an order as deposit paid." />
              ) : (
                <table className="admin-table">
                  <thead><tr><th>Client</th><th>Building type</th><th>City</th><th>Quoted</th><th>Stage</th><th>Date</th></tr></thead>
                  <tbody>
                    {designs.map((d, i) => (
                      <tr key={d.id} className="admin-table-row" style={{ '--row-delay': `${i * 40}ms` }}>
                        <td><strong>{d.contact_name || '—'}</strong></td>
                        <td><span>{(d.building_type || '—').replace(/_/g, ' ')}</span></td>
                        <td><span>{d.city || '—'}</span></td>
                        <td><strong>{d.quoted_amount ? `₹${Number(d.quoted_amount).toLocaleString('en-IN')}` : '—'}</strong></td>
                        <td><span className={`admin-status ${STAGE_COLORS[d.status] || 'pending'}`}>{STAGE_LABELS[d.status] || d.status}</span></td>
                        <td><span>{new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </article>
          )}
        </main>
      </div>
    </PageTransition>
  )
}
