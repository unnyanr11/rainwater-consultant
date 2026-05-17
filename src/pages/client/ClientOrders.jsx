import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { ClipboardList, ArrowRight, MapPin } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'

export default function ClientOrders() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('design_orders')
      .select('id, status, city, state, building_type, created_at, quoted_amount')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false) })
  }, [user])

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)' }}>My Orders</h1>
        <button
          onClick={() => navigate('/get-professional-design')}
          style={{ padding: '0.55rem 1.1rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer' }}
        >
          + New Order
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Loading...</p>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <ClipboardList size={36} style={{ color: 'var(--color-text-faint)', margin: '0 auto 1rem' }} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>No design orders yet. Start one today!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {orders.map(o => (
            <div
              key={o.id}
              onClick={() => navigate(`/client/orders/${o.id}`)}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.25rem',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'box-shadow 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 4 }}>
                  <MapPin size={13} style={{ color: 'var(--color-text-faint)' }} />
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)' }}>{o.city}, {o.state}</span>
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {o.building_type?.replace(/_/g, ' ')} &middot; {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                {o.quoted_amount && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 700, marginTop: 4 }}>
                    Quote: Rs.{Number(o.quoted_amount).toLocaleString('en-IN')}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <StatusBadge status={o.status} />
                <ArrowRight size={14} style={{ color: 'var(--color-text-faint)' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
