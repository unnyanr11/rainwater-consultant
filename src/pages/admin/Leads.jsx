import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/admin/AdminSidebar'
import PageTransition from '../../components/motion/PageTransition'
import { Search, Filter, ArrowUpRight } from 'lucide-react'

const STATUS_LABEL = {
  pending:             'New Lead',
  visit_negotiating:   'Negotiating',
  visit_confirmed:     'Visit Confirmed',
  visit_payment_due:   'Awaiting Payment',
  visit_paid:          'Visit Paid',
  visit_scheduled:     'Visit Scheduled',
  visit_complete:      'Visit Complete',
  measurement_done:    'Measured',
  drawing_in_progress: 'In Progress',
  drawing_review:      'Under Review',
  drawing_ready:       'Drawing Ready',
  completed:           'Completed',
}

const STATUS_COLOR = {
  pending:             '#e67e22',
  visit_negotiating:   '#8e44ad',
  visit_confirmed:     '#2980b9',
  visit_payment_due:   '#c0392b',
  visit_paid:          '#27ae60',
  visit_scheduled:     '#2980b9',
  visit_complete:      '#27ae60',
  measurement_done:    '#16a085',
  drawing_in_progress: '#f39c12',
  drawing_review:      '#8e44ad',
  drawing_ready:       '#27ae60',
  completed:           '#2ecc71',
}

const BUILDING_LABELS = {
  residential_villa:  'Villa',
  apartment:          'Apartment',
  commercial_office:  'Commercial',
  industrial:         'Industrial',
  institutional:      'Institutional',
  farmland:           'Farmland',
}

const ALL_STATUSES = Object.keys(STATUS_LABEL)

function StatusBadge({ status }) {
  const color = STATUS_COLOR[status] || '#999'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '0.22rem 0.65rem',
      borderRadius: 99,
      background: color + '18',
      color,
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
      {STATUS_LABEL[status] || status}
    </span>
  )
}

export default function Leads() {
  const navigate = useNavigate()
  const [leads, setLeads]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [search, setSearch]   = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('design_orders')
        .select(
          'id, user_id, city, state, pincode, address, roof_area_sqm, soil_type, weather_zone, ' +
          'building_type, storeys, occupants, daily_usage_lpd, visit_preferred, visit_date, visit_note, ' +
          'contact_name, contact_email, contact_phone, message, status, admin_notes, quoted_amount, ' +
          'assigned_to, created_at, updated_at, confirmed_visit_date, confirmed_visit_time, visit_payment_status'
        )
        .order('created_at', { ascending: false })

      if (err) {
        console.error('Leads fetch error:', err)
        setError(err.message)
      } else {
        setLeads(data || [])
      }
      setLoading(false)
    }
    fetchLeads()
  }, [])

  const filtered = leads.filter(l => {
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      l.contact_name?.toLowerCase().includes(q) ||
      l.contact_email?.toLowerCase().includes(q) ||
      l.contact_phone?.includes(q) ||
      l.city?.toLowerCase().includes(q) ||
      l.state?.toLowerCase().includes(q) ||
      l.pincode?.includes(q)
    return matchStatus && matchSearch
  })

  return (
    <PageTransition>
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1 }}>All Leads</h1>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                {loading ? 'Loading…' : `${filtered.length} of ${leads.length} orders`}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
              <Search size={14} style={{
                position: 'absolute', left: '0.75rem', top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-faint)', pointerEvents: 'none',
              }} />
              <input
                type="text"
                placeholder="Search name, email, phone, city…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--text-sm)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Status filter */}
            <div style={{ position: 'relative' }}>
              <Filter size={13} style={{
                position: 'absolute', left: '0.7rem', top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-faint)', pointerEvents: 'none',
              }} />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.55rem 0.75rem 0.55rem 2.1rem',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--text-sm)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Statuses</option>
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(161,44,123,0.08)',
              border: '1px solid rgba(161,44,123,0.25)',
              color: 'var(--color-error)',
              fontSize: 'var(--text-sm)',
              marginBottom: '1rem',
            }}>
              ⚠ Failed to fetch leads: {error}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="admin-skeleton" style={{ height: 56, borderRadius: 'var(--radius-md)' }} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              textAlign: 'center', padding: 'var(--space-16) var(--space-8)',
              color: 'var(--color-text-muted)',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--color-text-faint)', marginBottom: '1rem' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <h3 style={{ color: 'var(--color-text)', marginBottom: '0.4rem' }}>
                {leads.length === 0 ? 'No leads yet' : 'No matches found'}
              </h3>
              <p style={{ maxWidth: '32ch', fontSize: 'var(--text-sm)' }}>
                {leads.length === 0
                  ? 'New leads will appear here when clients submit design orders.'
                  : 'Try a different search term or status filter.'}
              </p>
            </div>
          )}

          {/* Table */}
          {!loading && !error && filtered.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                    {['Contact', 'Location', 'Building', 'Roof Area', 'Visit', 'Status', 'Submitted', ''].map(h => (
                      <th key={h} style={{
                        padding: '0.5rem 0.85rem',
                        textAlign: 'left',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, i) => (
                    <tr
                      key={lead.id}
                      onClick={() => navigate(`/admin/leads/${lead.id}`)}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        transition: 'background 140ms',
                        '--row-delay': `${i * 30}ms`,
                        animationDelay: 'var(--row-delay)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-offset)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Contact */}
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                          {lead.contact_name || '—'}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                          {lead.contact_phone || lead.contact_email || '—'}
                        </div>
                      </td>

                      {/* Location */}
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                          {lead.city || '—'}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                          {lead.state}{lead.pincode ? ` · ${lead.pincode}` : ''}
                        </div>
                      </td>

                      {/* Building */}
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                          {BUILDING_LABELS[lead.building_type] || lead.building_type || '—'}
                        </span>
                        {lead.storeys ? (
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                            {lead.storeys} {lead.storeys === 1 ? 'storey' : 'storeys'}
                          </div>
                        ) : null}
                      </td>

                      {/* Roof area */}
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>
                          {lead.roof_area_sqm ? `${Number(lead.roof_area_sqm).toLocaleString('en-IN')} m²` : '—'}
                        </span>
                      </td>

                      {/* Visit */}
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        {lead.visit_preferred ? (
                          <span style={{
                            fontSize: 'var(--text-xs)', fontWeight: 700,
                            color: 'var(--color-success)',
                            background: 'rgba(67,122,34,0.1)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: 99,
                          }}>Requested</span>
                        ) : (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>—</span>
                        )}
                        {lead.visit_date && (
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 3 }}>
                            {new Date(lead.visit_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <StatusBadge status={lead.status} />
                      </td>

                      {/* Submitted */}
                      <td style={{ padding: '0.75rem 0.85rem' }}>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                          {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>

                      {/* Arrow */}
                      <td style={{ padding: '0.75rem 0.65rem', textAlign: 'right' }}>
                        <ArrowUpRight size={14} style={{ color: 'var(--color-text-faint)' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </main>
      </div>
    </PageTransition>
  )
}
