import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatRow from '../../components/admin/AdminStatRow'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import PageTransition from '../../components/motion/PageTransition'

const STAGE_COLORS = {
  measurement_done: 'lead',
  drawing_in_progress: 'visit',
  drawing_review: 'partial',
  drawing_ready: 'paid',
  completed: 'paid',
}

const STAGE_LABELS = {
  measurement_done: 'Ready to draft',
  drawing_in_progress: 'In progress',
  drawing_review: 'Under review',
  drawing_ready: 'Ready',
  completed: 'Completed',
}

export default function AdminDesigns() {
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('board')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('design_orders')
        .select('id, contact_name, building_type, city, status, admin_notes, created_at')
        .in('status', ['measurement_done', 'drawing_in_progress', 'drawing_review', 'drawing_ready', 'completed'])
        .order('created_at', { ascending: false })
      setDesigns(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const byStage = (s) => designs.filter(d => d.status === s)

  const stats = [
    { label: 'In queue', value: String(designs.filter(d => d.status === 'measurement_done').length).padStart(2,'0'), sub: 'Ready to draft' },
    { label: 'In progress', value: String(designs.filter(d => d.status === 'drawing_in_progress').length).padStart(2,'0'), sub: 'Active drawing' },
    { label: 'Under review', value: String(designs.filter(d => d.status === 'drawing_review').length).padStart(2,'0'), sub: 'Awaiting approval' },
    { label: 'Ready to release', value: String(designs.filter(d => d.status === 'drawing_ready').length).padStart(2,'0'), sub: 'Final approved', trend: 3 },
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
                    {byStage(status).length === 0 && (
                      <div className="admin-design-empty">Empty lane</div>
                    )}
                    {byStage(status).map((d, i) => (
                      <div key={d.id} className="admin-design-card" style={{ '--card-delay': `${i * 60}ms` }}>
                        <strong>{d.contact_name || 'Client'}</strong>
                        <span>{d.building_type?.replace(/_/g, ' ') || '—'}</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>{d.city || ''}</span>
                        {d.admin_notes && <p className="admin-design-note">{d.admin_notes}</p>}
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
                <AdminEmptyState icon="✏️" title="No designs in queue" body="Start by adding a measurement-done order." />
              ) : (
                <table className="admin-table">
                  <thead><tr><th>Client</th><th>Project</th><th>City</th><th>Stage</th><th>Admin notes</th><th>Date</th></tr></thead>
                  <tbody>
                    {designs.map((d, i) => (
                      <tr key={d.id} className="admin-table-row" style={{ '--row-delay': `${i * 40}ms` }}>
                        <td><strong>{d.contact_name || '—'}</strong></td>
                        <td><span>{d.building_type?.replace(/_/g, ' ') || '—'}</span></td>
                        <td><span>{d.city || '—'}</span></td>
                        <td><span className={`admin-status ${STAGE_COLORS[d.status] || 'pending'}`}>{STAGE_LABELS[d.status] || d.status}</span></td>
                        <td><span style={{ maxWidth: '22ch', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.admin_notes || '—'}</span></td>
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
