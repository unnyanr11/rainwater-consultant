import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const STATUS_FILTERS = ['all', 'scheduled', 'completed', 'cancelled']

export default function AdminVisits() {
  const [visits, setVisits] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('design_orders')
          .select('id, status, created_at, property_address, visit_date, profiles(full_name, phone)')
          .order('visit_date', { ascending: true })
        setVisits(data || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = filter === 'all' ? visits : visits.filter(v => v.status === filter)
  const counts = { scheduled: visits.filter(v => v.status==='visit_scheduled').length, completed: visits.filter(v => v.status==='completed').length, cancelled: visits.filter(v => v.status==='cancelled').length }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <p className="admin-page-eyebrow">Admin • Site Visits</p>
          <h1 className="admin-page-title">Visit board</h1>
          <p className="admin-page-subtitle">All scheduled, completed, and pending field inspections. Each visit is tied to a client order and payment stage.</p>
        </div>
        <div className="admin-actions">
          <button className="btn btn-secondary">Export schedule</button>
          <button className="btn btn-primary">+ Log new visit</button>
        </div>
      </div>

      {/* Visit KPIs */}
      <div className="admin-grid-3">
        <div className="kpi-chip accent">
          <span className="kpi-chip-label">Scheduled today</span>
          <span className="kpi-chip-value">{loading ? '…' : counts.scheduled}</span>
          <span className="kpi-chip-sub">Visits confirmed for today’s field schedule</span>
        </div>
        <div className="kpi-chip">
          <span className="kpi-chip-label">Completed (all time)</span>
          <span className="kpi-chip-value">{loading ? '…' : counts.completed}</span>
          <span className="kpi-chip-sub">Successfully measured and filed</span>
        </div>
        <div className="kpi-chip">
          <span className="kpi-chip-label">Cancelled</span>
          <span className="kpi-chip-value">{loading ? '…' : counts.cancelled}</span>
          <span className="kpi-chip-sub">Client no-show or rescheduled</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            className={filter === f ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Visit cards grid */}
      <div className="admin-grid-3">
        {loading ? (
          <p style={{color:'#8aa098',fontSize:'0.875rem',gridColumn:'1/-1'}}>Loading visits…</p>
        ) : filtered.length === 0 ? (
          <div className="admin-card" style={{gridColumn:'1/-1'}}>
            <div className="admin-empty">
              <h3>No visits found</h3>
              <p>No visits match the selected filter. Try a different status or create a new visit entry.</p>
            </div>
          </div>
        ) : filtered.map(v => (
          <div className="visit-card" key={v.id}>
            <div className="visit-card-header">
              <div>
                <div className="visit-card-client">{v.profiles?.full_name || 'Unknown client'}</div>
                <div className="visit-card-address">{v.property_address || 'Address not provided'}</div>
              </div>
              <span className={`badge badge-${v.status === 'visit_scheduled' ? 'scheduled' : v.status === 'completed' ? 'completed' : v.status === 'cancelled' ? 'cancelled' : 'pending'}`}>
                {v.status}
              </span>
            </div>
            <div className="visit-card-meta">
              <span>📅 {v.visit_date ? new Date(v.visit_date).toLocaleDateString('en-IN') : 'Date TBD'}</span>
              <span>📞 {v.profiles?.phone || '—'}</span>
            </div>
            <div className="visit-card-actions">
              <button className="btn btn-ghost btn-sm">View order</button>
              <button className="btn btn-secondary btn-sm">Mark complete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Visit conversion insight */}
      <div className="admin-layout-60-40">
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Visit to design conversion</h3>
              <p className="admin-card-subtitle">How many site visits progressed to a paid design order</p>
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            {[['Visits completed', counts.completed, 100],['Progressed to design', Math.round(counts.completed * 0.58), 58],['Converted to full package', Math.round(counts.completed * 0.34), 34]].map(([label, val, pct]) => (
              <div key={label}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.4rem'}}>
                  <span style={{fontSize:'0.875rem',color:'#18342d',fontWeight:600}}>{label}</span>
                  <span style={{fontSize:'0.875rem',color:'#8aa098'}}>{val} ({pct}%)</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Field notes</h3>
              <p className="admin-card-subtitle">Quick reminders for today’s schedule</p>
            </div>
          </div>
          <div className="admin-timeline">
            {[
              { time: 'Morning', title: 'Confirm location pins', detail: 'Send WhatsApp links to all morning visit clients before leaving.' },
              { time: 'Before visit', title: 'Check for pending advance', detail: 'Do not proceed with measurement if advance fee not received.' },
              { time: 'On-site', title: 'Capture terrace/roof photos', detail: 'Minimum 4 photos needed before returning for drawing work.' },
            ].map(({ time, title, detail }) => (
              <div className="timeline-entry" key={title}>
                <span className="timeline-time">{time}</span>
                <div><h4>{title}</h4><p>{detail}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}