import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AdminSidebar from '../../components/admin/AdminSidebar'
import PageTransition from '../../components/motion/PageTransition'
import {
  ArrowLeft, MapPin, Layers, FileText,
  Download, Calendar, CheckCircle2,
  MessageSquare, User, RefreshCw, CreditCard
} from 'lucide-react'

const STATUS_LABEL = {
  pending:                    'New Lead',
  visit_negotiating:          'Negotiating Visit',
  visit_confirmed:            'Visit Confirmed',
  visit_payment_due:          'Awaiting Payment',
  visit_paid:                 'Visit Paid',
  visit_scheduled:            'Visit Scheduled',
  visit_scheduled_confirmed:  'Visit Confirmed',
  visit_complete:             'Visit Complete',
  measurement_done:           'Measured',
  drawing_in_progress:        'In Progress',
  drawing_review:             'Under Review',
  drawing_ready:              'Ready',
  completed:                  'Completed',
}

const STATUS_COLOR = {
  pending:                    '#e67e22',
  visit_negotiating:          '#8e44ad',
  visit_confirmed:            '#2980b9',
  visit_payment_due:          '#c0392b',
  visit_paid:                 '#27ae60',
  visit_scheduled:            '#2980b9',
  visit_scheduled_confirmed:  '#2980b9',
  visit_complete:             '#27ae60',
  measurement_done:           '#16a085',
  drawing_in_progress:        '#f39c12',
  drawing_review:             '#8e44ad',
  drawing_ready:              '#27ae60',
  completed:                  '#2ecc71',
}

const TIMES = [
  '8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM',
  '1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM',
]

const BUILDING_LABELS = {
  residential_villa:  'Residential Villa',
  apartment:          'Apartment Complex',
  commercial_office:  'Commercial / Office',
  industrial:         'Industrial / Factory',
  institutional:      'Institutional',
  farmland:           'Farmland / Open Area',
}

const SOIL_LABELS = {
  sandy: 'Sandy', loamy: 'Loamy', clay: 'Clay',
  silty: 'Silty', rocky: 'Rocky / Hard', black: 'Black Cotton',
}

const WEATHER_LABELS = {
  semi_arid: 'Semi-Arid', tropical: 'Tropical',
  humid: 'Humid', very_humid: 'Very Humid', hilly: 'Hilly / Mountain',
}

function Badge({ status }) {
  const color = STATUS_COLOR[status] || '#999'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '0.3rem 0.8rem', borderRadius: 99,
      background: color + '18', color,
      fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.04em',
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {STATUS_LABEL[status] || status}
    </span>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <section style={{
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)', padding: '1.35rem', marginBottom: '1.1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        {Icon && <Icon size={15} style={{ color: 'var(--color-primary)' }} />}
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text)' }}>{title}</h3>
      </div>
      {children}
    </section>
  )
}

function Row({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div style={{
      display: 'flex', gap: '1rem', padding: '0.55rem 0',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <span style={{
        fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
        width: 160, flexShrink: 0,
      }}>{label}</span>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{value}</span>
    </div>
  )
}

export default function AdminLeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [order, setOrder]       = useState(null)
  const [files, setFiles]       = useState([])
  const [negotiations, setNeg]  = useState([])
  const [payment, setPayment]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)

  // counter-offer form
  const [offerDate, setOfferDate] = useState('')
  const [offerTime, setOfferTime] = useState('10:00 AM')
  const [offerNote, setOfferNote] = useState('')
  const [showOffer, setShowOffer] = useState(false)

  const load = useCallback(async () => {
    const [o, f, n, p] = await Promise.all([
      supabase.from('design_orders').select('*').eq('id', id).single(),
      supabase.from('order_files').select('*').eq('order_id', id).order('created_at'),
      supabase.from('visit_negotiations').select('*').eq('order_id', id).order('created_at', { ascending: false }),
      // Use canonical order_payments table, filter for visit-fee type
      supabase.from('order_payments')
        .select('*')
        .eq('order_id', id)
        .eq('payment_type', 'visit_fee')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])
    setOrder(o.data)
    setFiles(f.data || [])
    setNeg(n.data || [])
    setPayment(p.data || null)
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const getFileUrl = async (path) => {
    const { data } = await supabase.storage.from('order-files').createSignedUrl(path, 120)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const latestNeg = negotiations[0]
  const pendingClientOffer = latestNeg?.status === 'pending' && latestNeg?.proposed_by === 'client'

  // Admin sends a counter-offer
  const sendOffer = async () => {
    if (!offerDate || !offerTime) return
    setSaving(true)
    try {
      await supabase.from('visit_negotiations')
        .update({ status: 'superseded' })
        .eq('order_id', id).eq('status', 'pending')

      await supabase.from('visit_negotiations').insert({
        order_id: id,
        proposed_by: 'admin',
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

  // Admin accepts client's offer — creates record in canonical order_payments
  const acceptClientOffer = async () => {
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

      // Insert into canonical order_payments table with correct column names
      await supabase.from('order_payments').insert({
        order_id: id,
        amount_inr: 999,
        payment_status: 'pending',
        payment_type: 'visit_fee',
        note: 'Visit fee — adjustable against consultancy services',
      })

      await load()
    } finally { setSaving(false) }
  }

  // Admin marks payment as received (manual confirmation)
  const markPaid = async () => {
    if (!payment) return
    const ref = window.prompt('Enter payment reference / UPI transaction ID (optional):')
    if (ref === null) return
    setSaving(true)
    try {
      await supabase.from('order_payments').update({
        payment_status: 'paid',
        payment_ref: ref || null,
        paid_at: new Date().toISOString(),
      }).eq('id', payment.id)

      await supabase.from('design_orders').update({
        status: 'visit_scheduled',
        visit_payment_status: 'paid',
      }).eq('id', id)

      await load()
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-skeleton-page">
          <div className="admin-skeleton admin-skeleton-heading" />
          <div className="admin-skeleton admin-skeleton-block" />
        </div>
      </main>
    </div>
  )

  if (!order) return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">
        <p style={{ color: 'var(--color-error)', padding: '2rem' }}>Order not found.</p>
      </main>
    </div>
  )

  const minDate = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]

  return (
    <PageTransition>
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main" style={{ maxWidth: 860 }}>

          {/* Back — goes to previous page regardless of where user came from */}
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'none', border: 'none', color: 'var(--color-text-muted)',
              fontSize: 'var(--text-sm)', cursor: 'pointer',
              fontWeight: 600, marginBottom: '1.25rem', padding: 0,
            }}
          >
            <ArrowLeft size={15} /> Back
          </button>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1 }}>
                {order.city || '—'}{order.state ? `, ${order.state}` : ''}
              </h1>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 4 }}>
                Lead #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <Badge status={order.status} />
          </div>

          {/* Contact */}
          <Section title="Contact Details" icon={User}>
            <Row label="Name"    value={order.contact_name} />
            <Row label="Phone"   value={order.contact_phone} />
            <Row label="Email"   value={order.contact_email} />
            {order.message && <Row label="Message" value={order.message} />}
          </Section>

          {/* Site Details */}
          <Section title="Site Details" icon={Layers}>
            <Row label="Building Type"   value={BUILDING_LABELS[order.building_type] || order.building_type} />
            <Row label="Soil Type"       value={SOIL_LABELS[order.soil_type]         || order.soil_type} />
            <Row label="Weather Zone"    value={WEATHER_LABELS[order.weather_zone]   || order.weather_zone} />
            <Row label="Roof Area"       value={order.roof_area_sqm ? `${order.roof_area_sqm} m²` : null} />
            <Row label="Storeys"         value={order.storeys} />
            <Row label="Occupants"       value={order.occupants} />
            <Row label="Daily Water Use" value={order.daily_usage_lpd ? `${order.daily_usage_lpd} L/day` : null} />
            <Row label="Address"         value={order.address} />
          </Section>

          {/* Location */}
          <Section title="Location" icon={MapPin}>
            <Row label="City"    value={order.city} />
            <Row label="State"   value={order.state} />
            <Row label="Pincode" value={order.pincode} />
          </Section>

          {/* Uploaded Files */}
          <Section title="Uploaded Files" icon={FileText}>
            {files.filter(f => !f.is_drawing).length === 0 ? (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>No files uploaded by client.</p>
            ) : files.filter(f => !f.is_drawing).map(f => (
              <div key={f.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.55rem 0', borderBottom: '1px solid var(--color-border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={13} style={{ color: 'var(--color-text-faint)' }} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{f.file_name}</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--color-text-faint)' }}>
                    {f.file_size_bytes > 1e6 ? `${(f.file_size_bytes/1e6).toFixed(1)} MB` : `${Math.round(f.file_size_bytes/1024)} KB`}
                  </span>
                </div>
                <button
                  onClick={() => getFileUrl(f.storage_path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: 'none', border: 'none',
                    color: 'var(--color-primary)', fontSize: 'var(--text-xs)',
                    fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  <Download size={12} /> View
                </button>
              </div>
            ))}
          </Section>

          {/* Site Visit */}
          {(order.visit_preferred || [
            'visit_negotiating','visit_confirmed','visit_payment_due',
            'visit_paid','visit_scheduled','visit_scheduled_confirmed',
          ].includes(order.status)) && (
            <Section title="Site Visit" icon={Calendar}>
              <Row label="Requested"      value={order.visit_preferred ? 'Yes' : 'No'} />
              {order.visit_date && <Row label="Client's Date" value={new Date(order.visit_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} />}
              {order.visit_note && <Row label="Client's Note" value={order.visit_note} />}
              {order.confirmed_visit_date && <Row label="Confirmed Date" value={new Date(order.confirmed_visit_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} />}
              {order.confirmed_visit_time && <Row label="Confirmed Time" value={order.confirmed_visit_time} />}

              {/* Payment status from order_payments */}
              {payment && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: payment.payment_status === 'paid' ? 'rgba(39,174,96,0.08)' : 'rgba(192,57,43,0.08)',
                  border: `1px solid ${payment.payment_status === 'paid' ? 'rgba(39,174,96,0.25)' : 'rgba(192,57,43,0.25)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CreditCard size={14} style={{ color: payment.payment_status === 'paid' ? '#27ae60' : '#c0392b' }} />
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: payment.payment_status === 'paid' ? '#27ae60' : '#c0392b' }}>
                      Visit Fee ₹{Number(payment.amount_inr).toLocaleString('en-IN')} —{' '}
                      {payment.payment_status === 'paid'
                        ? `Paid${payment.payment_ref ? ` · Ref: ${payment.payment_ref}` : ''}`
                        : 'Awaiting payment from client'}
                    </span>
                  </div>
                  {payment.payment_status !== 'paid' && (
                    <button
                      onClick={markPaid}
                      disabled={saving}
                      style={{
                        padding: '0.35rem 0.85rem',
                        background: '#27ae60', color: '#fff',
                        border: 'none', borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-xs)', fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      Mark as Paid
                    </button>
                  )}
                </div>
              )}

              {/* Negotiation timeline */}
              {negotiations.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>Offer History</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {negotiations.map((n) => (
                      <div key={n.id} style={{
                        padding: '0.65rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        background: n.proposed_by === 'admin' ? 'rgba(11,111,184,0.06)' : 'rgba(142,68,173,0.06)',
                        border: `1px solid ${n.proposed_by === 'admin' ? 'rgba(11,111,184,0.18)' : 'rgba(142,68,173,0.18)'}`,
                        opacity: n.status === 'superseded' ? 0.45 : 1,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: n.proposed_by === 'admin' ? '#0b6fb8' : '#8e44ad' }}>
                            {n.proposed_by === 'admin' ? '🔵 You (Admin)' : '🟣 Client'}
                          </span>
                          <span style={{ fontSize: '0.6rem', color: 'var(--color-text-faint)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                            {n.status}
                          </span>
                        </div>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)', margin: '0.25rem 0 0' }}>
                          {new Date(n.proposed_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} · {n.proposed_time}
                        </p>
                        {n.note && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 3 }}>{n.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {!['visit_scheduled','visit_scheduled_confirmed','visit_complete','completed'].includes(order.status) && (
                <div style={{ marginTop: '1.1rem', display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {pendingClientOffer && (
                    <button
                      onClick={acceptClientOffer}
                      disabled={saving}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.55rem 1.1rem',
                        background: '#27ae60', color: '#fff',
                        border: 'none', borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)', fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      <CheckCircle2 size={14} />
                      Accept Client's Offer & Request Payment
                    </button>
                  )}

                  {order.visit_preferred && !['visit_payment_due','visit_paid'].includes(order.status) && (
                    <button
                      onClick={() => setShowOffer(v => !v)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.55rem 1.1rem',
                        background: showOffer ? 'var(--color-surface-offset)' : 'var(--color-primary)',
                        color: showOffer ? 'var(--color-text)' : '#fff',
                        border: `1.5px solid ${showOffer ? 'var(--color-border)' : 'var(--color-primary)'}`,
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)', fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      <RefreshCw size={13} />
                      {pendingClientOffer ? 'Send Counter-Offer Instead' : 'Propose Visit Date & Time'}
                    </button>
                  )}
                </div>
              )}

              {/* Counter-offer form */}
              {showOffer && (
                <div style={{
                  marginTop: '1rem', padding: '1.1rem 1.2rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid var(--color-primary)',
                  background: 'rgba(11,111,184,0.04)',
                }}>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.85rem' }}>Propose a Visit Date & Time</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.3rem' }}>Date *</label>
                      <input
                        type="date" min={minDate}
                        value={offerDate} onChange={e => setOfferDate(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 'var(--text-sm)', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.3rem' }}>Time *</label>
                      <select
                        value={offerTime} onChange={e => setOfferTime(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 'var(--text-sm)', outline: 'none' }}
                      >
                        {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.3rem' }}>Note (optional)</label>
                    <textarea
                      rows={2} value={offerNote} onChange={e => setOfferNote(e.target.value)}
                      placeholder="Any special instructions for the client…"
                      style={{ width: '100%', padding: '0.6rem 0.8rem', resize: 'vertical', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 'var(--text-sm)', outline: 'none', fontFamily: 'inherit' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={sendOffer} disabled={saving || !offerDate || !offerTime}
                      style={{ padding: '0.55rem 1.25rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 700, cursor: 'pointer', opacity: (!offerDate || !offerTime) ? 0.45 : 1 }}
                    >
                      {saving ? 'Sending…' : 'Send Offer to Client'}
                    </button>
                    <button
                      onClick={() => setShowOffer(false)}
                      style={{ padding: '0.55rem 1rem', background: 'none', border: '1.5px solid var(--color-border)', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Admin Notes */}
          <Section title="Admin Notes" icon={MessageSquare}>
            <AdminNoteEditor orderId={id} initialNote={order.admin_notes} onSaved={load} />
          </Section>

        </main>
      </div>
    </PageTransition>
  )
}

function AdminNoteEditor({ orderId, initialNote, onSaved }) {
  const [note, setNote]     = useState(initialNote || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  const save = async () => {
    setSaving(true)
    await supabase.from('design_orders').update({ admin_notes: note }).eq('id', orderId)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2200)
    onSaved()
  }

  return (
    <div>
      <textarea
        rows={4} value={note} onChange={e => setNote(e.target.value)}
        placeholder="Internal notes visible only to admin…"
        style={{ width: '100%', padding: '0.7rem 0.9rem', resize: 'vertical', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)', color: 'var(--color-text)', fontSize: 'var(--text-sm)', outline: 'none', fontFamily: 'inherit', marginBottom: '0.6rem' }}
      />
      <button
        onClick={save} disabled={saving}
        style={{ padding: '0.45rem 1.1rem', background: saved ? '#27ae60' : 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 700, cursor: 'pointer', transition: 'background 200ms' }}
      >
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Notes'}
      </button>
    </div>
  )
}
