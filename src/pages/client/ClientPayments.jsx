import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { CreditCard } from 'lucide-react'

const PAY_STATUS = { paid: '#065f46', pending: '#92400e', failed: '#991b1b', refunded: '#1e40af' }

export default function ClientPayments() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('order_payments')
      .select('*, design_orders(city, state)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setPayments(data || []); setLoading(false) })
  }, [user])

  return (
    <div style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1.5rem' }}>Payments</h1>

      {loading ? <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Loading…</p>
      : payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <CreditCard size={36} style={{ color: 'var(--color-text-faint)', margin: '0 auto 1rem' }} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>No payment records yet.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {payments.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)' }}>
                  {p.design_orders?.city}, {p.design_orders?.state}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {p.payment_type} · {p.gateway || 'Manual'} · {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>
                  ₹{Number(p.amount_inr).toLocaleString('en-IN')}
                </div>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: PAY_STATUS[p.payment_status] || 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                  {p.payment_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}