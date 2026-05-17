import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
<<<<<<< HEAD
import { CreditCard } from 'lucide-react'

const PAY_STATUS = { paid: '#065f46', pending: '#92400e', failed: '#991b1b', refunded: '#1e40af' }
=======
import { CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react'

const PAYMENT_STATUS_ICON = {
  paid:    { icon: CheckCircle, color: 'var(--color-success)' },
  pending: { icon: Clock,       color: 'var(--color-warning)' },
  failed:  { icon: XCircle,     color: 'var(--color-error)' },
}
>>>>>>> ac353a5455730e56e2e74dcdd33da75755af363c

export default function ClientPayments() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
<<<<<<< HEAD
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('order_payments')
=======
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('order_payments')
>>>>>>> ac353a5455730e56e2e74dcdd33da75755af363c
      .select('*, design_orders(city, state)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setPayments(data || []); setLoading(false) })
  }, [user])

<<<<<<< HEAD
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
=======
  const total = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)' }}>Payments</h1>
      </div>

      {/* Total card */}
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <CreditCard size={24} style={{ color: 'var(--color-primary)' }} />
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Paid</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>
            Rs.{total.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Loading...</p>
      ) : payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <CreditCard size={36} style={{ color: 'var(--color-text-faint)', margin: '0 auto 1rem' }} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>No payment records found.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {payments.map((p, i) => {
            const statusInfo = PAYMENT_STATUS_ICON[p.status] || PAYMENT_STATUS_ICON.pending
            const Icon = statusInfo.icon
            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 1.25rem',
                  borderBottom: i < payments.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={16} style={{ color: statusInfo.color }} />
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                      {p.payment_type?.replace(/_/g, ' ') || 'Payment'}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {p.design_orders?.city}, {p.design_orders?.state} &middot; {new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>
                    Rs.{Number(p.amount).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: statusInfo.color, fontWeight: 600, marginTop: 2, textTransform: 'capitalize' }}>
                    {p.status}
                  </div>
                </div>
              </div>
            )
          })}
>>>>>>> ac353a5455730e56e2e74dcdd33da75755af363c
        </div>
      )}
    </div>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> ac353a5455730e56e2e74dcdd33da75755af363c
