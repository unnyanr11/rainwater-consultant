import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { ClipboardList, ArrowRight, MapPin, Calendar } from 'lucide-react'

const STATUS_COLOR = {
  pending:             { bg: '#fef3c7', text: '#92400e' },
  visit_negotiating:   { bg: '#ede9fe', text: '#5b21b6' },
  visit_confirmed:     { bg: '#dbeafe', text: '#1e40af' },
  visit_payment_due:   { bg: '#fee2e2', text: '#991b1b' },
  visit_paid:          { bg: '#d1fae5', text: '#065f46' },
  visit_scheduled:     { bg: '#dbeafe', text: '#1e40af' },
  visit_complete:      { bg: '#d1fae5', text: '#065f46' },
  measurement_done:    { bg: '#d1fae5', text: '#065f46' },
  drawing_in_progress: { bg: '#dbeafe', text: '#1e40af' },
  drawing_review:      { bg: '#ede9fe', text: '#5b21b6' },
  drawing_ready:       { bg: '#d1fae5', text: '#065f46' },
  completed:           { bg: '#d1fae5', text: '#065f46' },
}

function OrderStatusBadge({ status }) {
  const c = STATUS_COLOR[status] || { bg: 'var(--color-surface-offset)', text: 'var(--color-text-muted)' }
  return (
    <span style={{
      fontSize: 'var(--text-xs)', fontWeight: 700,
      padding: '3px 10px', borderRadius: 'var(--radius-full)',
      background: c.bg, color: c.text,
      whiteSpace: 'nowrap',
    }}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

function fmtDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtTime(timeStr) {
  if (!timeStr) return null
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour % 12 || 12}:${m} ${ampm}`
}

export default function ClientOrders() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('design_orders')
      .select('id, status, city, state, building_type, created_at, quoted_amount, confirmed_visit_date, confirmed_visit_time, visit_preferred, visit_date')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false) })
  }, [user])

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)' }}>My Orders</h1>
        <button onClick={() => navigate('/get-professional-design')} style={{ padding: '0.55rem 1.1rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
          + New Order
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Loading…</p>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <ClipboardList size={36} style={{ color: 'var(--color-text-faint)', margin: '0 auto 1rem' }} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>No design orders yet. Start one today!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {orders.map(o => (
            <div key={o.id} onClick={() => navigate(`/client/orders/${o.id}`)}
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', transition: 'box-shadow 150ms' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 4 }}>
                  <MapPin size={13} style={{ color: 'var(--color-text-faint)', flexShrink: 0 }} />
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)' }}>{o.city}, {o.state}</span>
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {o.building_type?.replace(/_/g, ' ')} · {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                {o.quoted_amount && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 700, marginTop: 4 }}>
                    Quote: ₹{Number(o.quoted_amount).toLocaleString('en-IN')}
                  </div>
                )}
                {/* Confirmed visit date — shown with priority over preferred date */}
                {o.confirmed_visit_date ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
                    <Calendar size={11} style={{ color: '#2980b9', flexShrink: 0 }} />
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#2980b9' }}>
                      Visit: {fmtDate(o.confirmed_visit_date)}
                      {o.confirmed_visit_time && ` · ${fmtTime(o.confirmed_visit_time)}`}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', background: 'rgba(41,128,185,0.10)', color: '#2980b9', padding: '1px 6px', borderRadius: 99, fontWeight: 700 }}>Confirmed</span>
                  </div>
                ) : o.visit_preferred && o.visit_date ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
                    <Calendar size={11} style={{ color: 'var(--color-text-faint)', flexShrink: 0 }} />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      Preferred: {fmtDate(o.visit_date)}
                    </span>
                  </div>
                ) : null}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                <OrderStatusBadge status={o.status} />
                <ArrowRight size={14} style={{ color: 'var(--color-text-faint)' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
