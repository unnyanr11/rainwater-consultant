import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { ClipboardList, Calculator, ArrowRight, Calendar } from 'lucide-react'

const STATUS_COLOR = {
  pending:          { bg: '#fef3c7', text: '#92400e' },
  reviewed:         { bg: '#dbeafe', text: '#1e40af' },
  quote_sent:       { bg: '#ede9fe', text: '#5b21b6' },
  deposit_paid:     { bg: '#d1fae5', text: '#065f46' },
  in_progress:      { bg: '#dbeafe', text: '#1e40af' },
  drawings_ready:   { bg: '#d1fae5', text: '#065f46' },
  completed:        { bg: '#d1fae5', text: '#065f46' },
  cancelled:        { bg: '#fee2e2', text: '#991b1b' },
  visit_confirmed:  { bg: '#dbeafe', text: '#1e40af' },
  visit_scheduled:  { bg: '#fef3c7', text: '#92400e' },
  visit_complete:   { bg: '#dbeafe', text: '#1e40af' },
  drawing_in_progress: { bg: '#dbeafe', text: '#1e40af' },
  drawing_ready:    { bg: '#d1fae5', text: '#065f46' },
}

function BadgeCheck({ status }) {
  const c = STATUS_COLOR[status] || { bg: 'var(--color-surface-offset)', text: 'var(--color-text-muted)' }
  return (
    <span style={{
      fontSize: 'var(--text-xs)', fontWeight: 700,
      padding: '3px 10px', borderRadius: 'var(--radius-full)',
      background: c.bg, color: c.text,
      textTransform: 'capitalize',
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
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}

export default function ClientOverview() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [sessions, setSessions] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase
        .from('design_orders')
        .select('id, status, city, state, created_at, confirmed_visit_date, confirmed_visit_time')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('calculator_sessions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]).then(([o, s]) => {
      setOrders(o.data || [])
      setSessions(s.count || 0)
      setLoading(false)
    })
  }, [user])

  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status))

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Greeting */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>
          Welcome back, {profile?.full_name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Here's a summary of your account activity.
        </p>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Orders',    value: orders.length,        icon: ClipboardList, action: () => navigate('/client/orders') },
          { label: 'Active Orders',   value: activeOrders.length,  icon: ClipboardList, action: () => navigate('/client/orders') },
          { label: 'Calculator Uses', value: sessions,              icon: Calculator,    action: () => navigate('/calculator') },
        ].map(({ label, value, icon: Icon, action }) => (
          <button key={label} onClick={action} style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)', padding: '1.25rem',
            textAlign: 'left', cursor: 'pointer', transition: 'box-shadow 150ms',
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <Icon size={18} style={{ color: 'var(--color-primary)', marginBottom: '0.6rem' }} />
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>
              {loading ? '—' : value}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{label}</div>
          </button>
        ))}
      </div>

      {/* Recent orders */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)' }}>Recent Orders</h2>
          <button onClick={() => navigate('/client/orders')} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ArrowRight size={13} />
          </button>
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Loading…</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center' }}>
            <ClipboardList size={32} style={{ color: 'var(--color-text-faint)', margin: '0 auto 0.75rem' }} />
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>No orders yet</p>
            <button onClick={() => navigate('/get-professional-design')} style={{ padding: '0.55rem 1.25rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
              Request a Design
            </button>
          </div>
        ) : orders.slice(0, 5).map(o => (
          <div key={o.id} onClick={() => navigate(`/client/orders/${o.id}`)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--color-border)', cursor: 'pointer', transition: 'background 120ms', gap: '0.75rem' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-offset)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>{o.city}, {o.state}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 2 }}>
                {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              {o.confirmed_visit_date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Calendar size={10} style={{ color: '#2980b9', flexShrink: 0 }} />
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#2980b9' }}>
                    Visit: {fmtDate(o.confirmed_visit_date)}
                    {o.confirmed_visit_time && ` · ${fmtTime(o.confirmed_visit_time)}`}
                  </span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <BadgeCheck status={o.status} />
              <ArrowRight size={14} style={{ color: 'var(--color-text-faint)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
