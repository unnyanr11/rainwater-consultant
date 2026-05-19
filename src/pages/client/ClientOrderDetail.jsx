import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  ArrowLeft, FileText, Download, Calendar,
  CheckCircle2, XCircle, RefreshCw, CreditCard, Clock, AlertCircle
} from 'lucide-react'

const STATUS_LABEL = {
  pending:             'New — Under Review',
  visit_negotiating:   'Visit Date Being Finalised',
  visit_confirmed:     'Visit Date Confirmed',
  visit_payment_due:   'Action Required: Pay Visit Fee',
  visit_paid:          'Visit Fee Paid',
  visit_scheduled:     'Visit Scheduled',
  visit_complete:      'Visit Completed',
  measurement_done:    'Site Measured',
  drawing_in_progress: 'Design In Progress',
  drawing_review:      'Design Under Review',
  drawing_ready:       'Design Ready',
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

const TIMES = [
  '8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM',
  '1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM',
]

function StatusBadge({ status }) {
  const color = STATUS_COLOR[status] || '#999'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '0.35rem 0.9rem', borderRadius: 99,
      background: color + '18', color,
      fontSize: 'var(--text-xs)', fontWeight: 700,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {STATUS_LABEL[status] || status}
    </span>
  )
}

function Row({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div style={{ display: 'flex', gap: '1rem', padding: '0.6rem 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{
        fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.06em', width: 140, flexShrink: 0,
      }}>{label}</span>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{value}</span>
    </div>
  )
}

function Card({ children, style }) {
  return (
    <section style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      marginBottom: '1.1rem',
      ...style,
    }}>
      {children}
    </section>
  )
}

export default function ClientOrderDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()

  const [order, setOrder]       = useState(null)
  const [files, setFiles]       = useState([])
  const [log, setLog]           = useState([])
  const [negotiations, setNeg]  = useState([])
  const [payment, setPayment]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)

  // counter-offer form
  const [offerDate, setOfferDate] = useState('')
  const [offerTime, setOfferTime] = useState('10:00 AM')
  const [offerNote, setOfferNote] = useState('')
  const [showOffer, setShowOffer] = useState(false)

  // mock payment state
  const [payRef, setPayRef]     = useState('')
  const [payStep, setPayStep]   = useState('idle') // idle | form | done

  const load = useCallback(async () => {
    const [o, f, l, n, p] = await Promise.all([
      supabase.from('design_orders').select('*').eq('id', id).single(),
      supabase.from('order_files').select('*').eq('order_id', id).order('created_at'),
      supabase.from('order_status_log').select('*').eq('order_id', id).order('created_at'),
      supabase.from('visit_negotiations').select('*').eq('order_id', id).order('created_at', { ascending: false }),
      supabase.from('visit_payments').select('*').eq('order_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ])
    setOrder(o.data)
    setFiles(f.data || [])
    setLog(l.data || [])
    setNeg(n.data || [])
    setPayment(p.data || null)
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const getFileUrl = async (path) => {
    const { data } = await supabase.storage.from('order-files').createSignedUrl(path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const latestNeg           = negotiations[0]
  const pendingAdminOffer   = latestNeg?.status === 'pending' && latestNeg?.proposed_by === 'admin'
  const pendingClientOffer  = latestNeg?.status === 'pending' && latestNeg?.proposed_by === 'client'

  // Client accepts admin's offer
  const acceptAdminOffer = async () => {
    if (!latestNeg) return
    setSaving(true)
    try {
      await supabase.from('visit_negotiations')
        .update({ status: 'accepted' })
        .eq('id', latestNeg.id)

      await supabase.from('design_orders').update({
        status: 'visit_payment_due',
        confirmed_visit_date: latestNeg.proposed_date,
        confirmed_visit_time: latestNeg.proposed_time,
        visit_payment_status: 'pending_payment',
      }).eq('id', id)

      await supabase.from('visit_payments').insert({
        order_id: id,
        amount: 999,
        status: 'pending',
        note: 'Visit fee — adjustable against consultancy services',
      })

      await load()
    } finally { setSaving(false) }
  }

  // Client sends counter-offer
  const sendCounterOffer = async () => {
    if (!offerDate || !offerTime) return
    setSaving(true)
    try {
      await supabase.from('visit_negotiations')
        .update({ status: 'superseded' })
        .eq('order_id', id).eq('status', 'pending')

      await supabase.from('visit_negotiations').insert({
        order_id: id,
        proposed_by: 'client',
        proposed_date: offerDate,
        proposed_time: offerTime,
        note: offerNote.trim() || null,
        status: 'pending',
      })

      await supabase.from('design_orders')
        .update({ status: 'visit_negotiating' })
        .eq('id', id)

      setOfferDate(''); setOfferTime('10:00 AM'); setOfferNote('')
      setShowOffer(false)
      await load()
    } finally { setSaving(false) }
  }

  // Client submits payment reference
  const submitPayment = async () => {
    if (!payment) return
    setSaving(true)
    try {
      await supabase.from('visit_payments').update({
        payment_ref: payRef.trim() || null,
        status: 'paid',
        paid_at: new Date().toISOString(),
      }).eq('id', payment.id)

      await supabase.from('design_orders').update({
        status: 'visit_paid',
        visit_payment_status: 'paid',
      }).eq('id', id)

      setPayStep('done')
      await load()
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div style={{ padding: '2rem', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Loading…</div>
  )
  if (!order) return (
    <div style={{ padding: '2rem', color: 'var(--color-error)', fontSize: 'var(--text-sm)' }}>Order not found.</div>
  )

  const minDate = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
  const paymentDue = order.status === 'visit_payment_due' && payment && payment.status === 'pending'

  return (
    <div style={{ maxWidth: 720 }}>

      <button
        onClick={() => navigate('/client/orders')}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: 'none', border: 'none', color: 'var(--color-text-muted)',
          fontSize: 'var(--text-sm)', cursor: 'pointer',
          marginBottom: '1.5rem', fontWeight: 600, padding: 0,
        }}
      >
        <ArrowLeft size={15} /> Back to Orders
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)' }}>
            {order.city}{order.state ? `, ${order.state}` : ''}
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 4 }}>
            Order #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* ── Payment CTA — highest priority ── */}
      {paymentDue && payStep === 'idle' && (
        <Card style={{
          border: '2px solid #c0392b',
          background: 'rgba(192,57,43,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <AlertCircle size={20} style={{ color: '#c0392b', flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.35rem' }}>
                Action Required: Pay Visit Fee
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                Your site visit has been confirmed for{' '}
                <strong>{order.confirmed_visit_date ? new Date(order.confirmed_visit_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</strong>
                {order.confirmed_visit_time ? ` at ${order.confirmed_visit_time}` : ''}.
              </p>
              <div style={{
                padding: '0.85rem 1rem',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                marginBottom: '0.85rem',
              }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>Visit Fee: ₹999</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  💡 This amount will be fully adjusted if you proceed with our consultancy services.
                </p>
              </div>
              <button
                onClick={() => setPayStep('form')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.65rem 1.4rem',
                  background: '#c0392b', color: '#fff',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)', fontWeight: 700, cursor: 'pointer',
                }}
              >
                <CreditCard size={15} /> Pay ₹999 Now
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Payment form ── */}
      {paymentDue && payStep === 'form' && (
        <Card style={{ border: '2px solid var(--color-primary)' }}>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>Complete Payment — ₹999</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
            Please transfer <strong>₹999</strong> to the UPI ID or bank account below, then enter your UPI transaction reference to confirm.
          </p>

          <div style={{
            padding: '0.85rem 1rem',
            background: 'var(--color-surface-offset)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            marginBottom: '1rem',
          }}>
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Pay via UPI</p>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-primary)' }}>rainwaterconsultant@upi</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 3 }}>Amount: ₹999 · Reference: Visit Fee</p>
          </div>

          <div style={{ marginBottom: '0.85rem' }}>
            <label style={{
              display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700,
              color: 'var(--color-text-muted)', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '0.35rem',
            }}>UPI Transaction ID / Reference</label>
            <input
              type="text"
              value={payRef}
              onChange={e => setPayRef(e.target.value)}
              placeholder="e.g. 407398571234"
              style={{
                width: '100%', padding: '0.65rem 0.9rem',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg)', color: 'var(--color-text)',
                fontSize: 'var(--text-sm)', outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              onClick={submitPayment}
              disabled={saving}
              style={{
                padding: '0.6rem 1.4rem',
                background: 'var(--color-primary)', color: '#fff',
                border: 'none', borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)', fontWeight: 700, cursor: 'pointer',
              }}
            >
              {saving ? 'Confirming…' : 'Confirm Payment'}
            </button>
            <button
              onClick={() => setPayStep('idle')}
              style={{
                padding: '0.6rem 1rem',
                background: 'none', border: '1.5px solid var(--color-border)',
                color: 'var(--color-text-muted)', borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Back
            </button>
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: '0.75rem', lineHeight: 1.6 }}>
            💡 Once submitted, our team will verify the payment and confirm your visit within a few hours.
            This amount is fully adjustable against consultancy services.
          </p>
        </Card>
      )}

      {/* Payment confirmed */}
      {(payStep === 'done' || (payment?.status === 'paid')) && order.status !== 'pending' && (
        <Card style={{ border: '1.5px solid #27ae60', background: 'rgba(39,174,96,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={18} style={{ color: '#27ae60' }} />
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: '#27ae60' }}>Visit Fee Paid — ₹999</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                Our engineer will visit on{' '}
                <strong>{order.confirmed_visit_date ? new Date(order.confirmed_visit_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' }) : '—'}</strong>
                {order.confirmed_visit_time ? ` at ${order.confirmed_visit_time}` : ''}.
                {payment?.payment_ref ? ` Ref: ${payment.payment_ref}` : ''}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ── Visit Negotiation Card ── */}
      {order.visit_preferred && (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Calendar size={15} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text)' }}>Site Visit Scheduling</h2>
          </div>

          {/* Confirmed */}
          {(order.status === 'visit_scheduled' || order.status === 'visit_complete' || order.status === 'visit_paid' || order.status === 'visit_payment_due') && order.confirmed_visit_date && (
            <div style={{
              padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)',
              background: 'rgba(41,128,185,0.07)', border: '1px solid rgba(41,128,185,0.2)',
              marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
            }}>
              <CheckCircle2 size={15} style={{ color: '#2980b9' }} />
              <div>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: '#2980b9' }}>Confirmed</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {new Date(order.confirmed_visit_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  {order.confirmed_visit_time ? ` · ${order.confirmed_visit_time}` : ''}
                </p>
              </div>
            </div>
          )}

          {/* Latest pending admin offer — show Accept / Counter */}
          {pendingAdminOffer && order.status !== 'visit_payment_due' && (
            <div style={{
              padding: '1rem 1.1rem', borderRadius: 'var(--radius-lg)',
              border: '1.5px solid rgba(11,111,184,0.3)',
              background: 'rgba(11,111,184,0.06)', marginBottom: '1rem',
            }}>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#0b6fb8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Admin proposed a visit</p>
              <p style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                {new Date(latestNeg.proposed_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {latestNeg.proposed_time}
              </p>
              {latestNeg.note && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>{latestNeg.note}</p>
              )}
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  onClick={acceptAdminOffer}
                  disabled={saving}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.5rem 1.1rem',
                    background: '#27ae60', color: '#fff',
                    border: 'none', borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  <CheckCircle2 size={14} /> Accept this date
                </button>
                <button
                  onClick={() => setShowOffer(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.5rem 1rem',
                    background: showOffer ? 'var(--color-surface-offset)' : 'none',
                    border: '1.5px solid var(--color-border)',
                    color: 'var(--color-text-muted)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={13} /> Suggest different date
                </button>
              </div>
            </div>
          )}

          {/* Client already has a pending offer out */}
          {pendingClientOffer && (
            <div style={{
              padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)',
              background: 'rgba(142,68,173,0.06)', border: '1px solid rgba(142,68,173,0.2)',
              marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem',
            }}>
              <Clock size={14} style={{ color: '#8e44ad' }} />
              <p style={{ fontSize: 'var(--text-sm)', color: '#8e44ad', fontWeight: 600 }}>
                Your offer sent — waiting for admin to respond.
                <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', display: 'block', fontSize: 'var(--text-xs)', marginTop: 2 }}>
                  {new Date(latestNeg.proposed_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · {latestNeg.proposed_time}
                </span>
              </p>
            </div>
          )}

          {/* No offers yet — client can propose first */}
          {negotiations.length === 0 && order.status === 'pending' && (
            <div style={{
              padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-offset)', border: '1px solid var(--color-border)',
              marginBottom: '1rem',
            }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Your visit request is under review. The admin will propose a date soon, or you can suggest one below.
              </p>
            </div>
          )}

          {/* Counter-offer form */}
          {(showOffer || (negotiations.length === 0 && order.visit_preferred && order.status === 'pending')) && order.status !== 'visit_payment_due' && order.status !== 'visit_paid' && order.status !== 'visit_scheduled' && order.status !== 'visit_complete' && (
            <div style={{
              padding: '1rem 1.1rem',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--color-primary)',
              background: 'rgba(11,111,184,0.04)',
              marginTop: showOffer ? '0.75rem' : 0,
            }}>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.85rem' }}>
                {showOffer ? 'Suggest a different date' : 'Propose a visit date'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{
                    fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    display: 'block', marginBottom: '0.3rem',
                  }}>Date *</label>
                  <input
                    type="date" min={minDate}
                    value={offerDate} onChange={e => setOfferDate(e.target.value)}
                    style={{
                      width: '100%', padding: '0.6rem 0.8rem',
                      border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                      background: 'var(--color-bg)', color: 'var(--color-text)',
                      fontSize: 'var(--text-sm)', outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    display: 'block', marginBottom: '0.3rem',
                  }}>Time *</label>
                  <select
                    value={offerTime} onChange={e => setOfferTime(e.target.value)}
                    style={{
                      width: '100%', padding: '0.6rem 0.8rem',
                      border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                      background: 'var(--color-bg)', color: 'var(--color-text)',
                      fontSize: 'var(--text-sm)', outline: 'none',
                    }}
                  >
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{
                  fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  display: 'block', marginBottom: '0.3rem',
                }}>Note (optional)</label>
                <textarea
                  rows={2} value={offerNote} onChange={e => setOfferNote(e.target.value)}
                  placeholder="Any special availability notes…"
                  style={{
                    width: '100%', padding: '0.6rem 0.8rem', resize: 'vertical',
                    border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg)', color: 'var(--color-text)',
                    fontSize: 'var(--text-sm)', outline: 'none', fontFamily: 'inherit',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={sendCounterOffer}
                  disabled={saving || !offerDate || !offerTime}
                  style={{
                    padding: '0.55rem 1.2rem',
                    background: 'var(--color-primary)', color: '#fff',
                    border: 'none', borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)', fontWeight: 700, cursor: 'pointer',
                    opacity: (!offerDate || !offerTime) ? 0.45 : 1,
                  }}
                >
                  {saving ? 'Sending…' : 'Send Proposal'}
                </button>
                {showOffer && (
                  <button
                    onClick={() => setShowOffer(false)}
                    style={{
                      padding: '0.55rem 1rem',
                      background: 'none', border: '1.5px solid var(--color-border)',
                      color: 'var(--color-text-muted)', borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Offer history */}
          {negotiations.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Offer History</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {negotiations.map(n => (
                  <div key={n.id} style={{
                    padding: '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: n.proposed_by === 'admin' ? 'rgba(11,111,184,0.05)' : 'rgba(142,68,173,0.05)',
                    border: `1px solid ${n.proposed_by === 'admin' ? 'rgba(11,111,184,0.15)' : 'rgba(142,68,173,0.15)'}`,
                    opacity: n.status === 'superseded' ? 0.45 : 1,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: n.proposed_by === 'admin' ? '#0b6fb8' : '#8e44ad' }}>
                        {n.proposed_by === 'admin' ? 'Admin' : 'You'}
                      </span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>{n.status}</span>
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                      {new Date(n.proposed_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · {n.proposed_time}
                    </p>
                    {n.note && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{n.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ── Site Details ── */}
      <Card>
        <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.75rem' }}>Site Details</h2>
        <Row label="Building Type" value={order.building_type?.replace(/_/g, ' ')} />
        <Row label="Soil Type"     value={order.soil_type?.replace(/_/g, ' ')} />
        <Row label="Weather Zone"  value={order.weather_zone?.replace(/_/g, ' ')} />
        <Row label="Roof Area"     value={order.roof_area_sqm ? `${order.roof_area_sqm} m²` : null} />
        <Row label="Storeys"       value={order.storeys} />
        <Row label="Occupants"     value={order.occupants} />
        {order.quoted_amount && <Row label="Quoted Amount" value={`₹${Number(order.quoted_amount).toLocaleString('en-IN')}`} />}
        {order.admin_notes && <Row label="Admin Notes" value={order.admin_notes} />}
      </Card>

      {/* ── Files ── */}
      <Card>
        <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.75rem' }}>Files</h2>
        {files.length === 0 ? (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>No files attached yet.</p>
        ) : files.map(f => (
          <div key={f.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.55rem 0', borderBottom: '1px solid var(--color-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={14} style={{ color: f.is_drawing ? 'var(--color-primary)' : 'var(--color-text-faint)' }} />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{f.file_name}</span>
              {f.is_drawing && !f.is_unlocked && (
                <span style={{
                  fontSize: '0.6rem', fontWeight: 700,
                  background: 'var(--color-warning-highlight)', color: 'var(--color-warning)',
                  padding: '2px 6px', borderRadius: 4,
                }}>LOCKED</span>
              )}
            </div>
            {(!f.is_drawing || f.is_unlocked) && (
              <button
                onClick={() => getFileUrl(f.storage_path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none', color: 'var(--color-primary)',
                  fontSize: 'var(--text-xs)', fontWeight: 700, cursor: 'pointer',
                }}
              >
                <Download size={13} /> Download
              </button>
            )}
          </div>
        ))}
      </Card>

      {/* ── Status log ── */}
      {log.length > 0 && (
        <Card>
          <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.75rem' }}>Status History</h2>
          {log.map(l => (
            <div key={l.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', width: 110, flexShrink: 0 }}>
                {new Date(l.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>
                <StatusBadge status={l.new_status} />
                {l.note && <span style={{ color: 'var(--color-text-muted)', marginLeft: 8 }}>{l.note}</span>}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
