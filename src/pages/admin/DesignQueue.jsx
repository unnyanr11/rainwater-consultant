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
<<<<<<< HEAD
      const { data } = await supabase
        .from('design_orders')
        .select('id, contact_name, building_type, city, status, admin_notes, created_at')
=======
      // FIX: include order_files to show drawing file count and unlock status per order
      const { data } = await supabase
        .from('design_orders')
        .select('id, contact_name, building_type, city, status, admin_notes, created_at, order_files(id, is_drawing, is_unlocked)')
>>>>>>> ac353a5455730e56e2e74dcdd33da75755af363c
        .in('status', ['measurement_done', 'drawing_in_progress', 'drawing_review', 'drawing_ready', 'completed'])
        .order('created_at', { ascending: false })
      setDesigns(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const byStage = (s) => designs.filter(d => d.status === s)

<<<<<<< HEAD
=======
  // Helper: drawing file summary for a design order
  const getFileInfo = (d) => {
    const files = d.order_files || []
    const drawings = files.filter(f => f.is_drawing)
    const unlocked = drawings.filter(f => f.is_unlocked)
    return { total: drawings.length, unlocked: unlocked.length }
  }

>>>>>>> ac353a5455730e56e2e74dcdd33da75755af363c
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
<<<<<<< HEAD
                    {byStage(status).map((d, i) => (
                      <div key={d.id} className="admin-design-card" style={{ '--card-delay': `${i * 60}ms` }}>
                        <strong>{d.contact_name || 'Client'}</strong>
                        <span>{d.building_type?.replace(/_/g, ' ') || '—'}</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>{d.city || ''}</span>
                        {d.admin_notes && <p className="admin-design-note">{d.admin_notes}</p>}
                        <small>{new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</small>
                      </div>
                    ))}
=======
                    {byStage(status).map((d, i) => {
                      const { total, unlocked } = getFileInfo(d)
                      return (
                        <div key={d.id} className="admin-design-card" style={{ '--card-delay': `${i * 60}ms` }}>
                          <strong>{d.contact_name || 'Client'}</strong>
                          <span>{d.building_type?.replace(/_/g, ' ') || '—'}</span>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>{d.city || ''}</span>
                          {d.admin_notes && <p className="admin-design-note">{d.admin_notes}</p>}
                          {/* FIX: show drawing file count and unlock status from order_files */}
                          {total > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                              <span style={{ fontSize: 'var(--text-xs)', color: unlocked === total ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                                {unlocked}/{total} drawing{total !== 1 ? 's' : ''} {unlocked === total ? 'unlocked' : 'locked'}
                              </span>
                            </div>
                          )}
                          <small>{new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</small>
                        </div>
                      )
                    })}
>>>>>>> ac353a5455730e56e2e74dcdd33da75755af363c
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
<<<<<<< HEAD
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
=======
                  <thead><tr><th>Client</th><th>Project</th><th>City</th><th>Stage</th><th>Files</th><th>Admin notes</th><th>Date</th></tr></thead>
                  <tbody>
                    {designs.map((d, i) => {
                      const { total, unlocked } = getFileInfo(d)
                      return (
                        <tr key={d.id} className="admin-table-row" style={{ '--row-delay': `${i * 40}ms` }}>
                          <td><strong>{d.contact_name || '—'}</strong></td>
                          <td><span>{d.building_type?.replace(/_/g, ' ') || '—'}</span></td>
                          <td><span>{d.city || '—'}</span></td>
                          <td><span className={`admin-status ${STAGE_COLORS[d.status] || 'pending'}`}>{STAGE_LABELS[d.status] || d.status}</span></td>
                          {/* FIX: show drawing file count from order_files */}
                          <td>
                            <span style={{ fontSize: 'var(--text-xs)', color: total === 0 ? 'var(--color-text-faint)' : unlocked === total ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                              {total === 0 ? 'No files' : `${unlocked}/${total} unlocked`}
                            </span>
                          </td>
                          <td><span style={{ maxWidth: '22ch', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.admin_notes || '—'}</span></td>
                          <td><span>{new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></td>
                        </tr>
                      )
                    })}
>>>>>>> ac353a5455730e56e2e74dcdd33da75755af363c
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
