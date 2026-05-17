import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, FileText, Download, Clock } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'

const Row = ({ label, value }) => {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: '1rem', padding: '0.6rem 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', width: 160, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{value}</span>
    </div>
  )
}

export default function ClientOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder]     = useState(null)
  const [files, setFiles]     = useState([])
  const [log, setLog]         = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('design_orders').select('*').eq('id', id).single(),
      supabase.from('order_files').select('*').eq('order_id', id).order('created_at'),
      supabase.from('order_status_log').select('*').eq('order_id', id).order('created_at'),
    ]).then(([o, f, l]) => {
      setOrder(o.data)
      setFiles(f.data || [])
      setLog(l.data || [])
      setLoading(false)
    })
  }, [id])

  const openFile = async (path) => {
    const { data } = await supabase.storage.from('order-files').createSignedUrl(path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  if (loading) return <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Loading...</p>
  if (!order)  return <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)' }}>Order not found.</p>

  return (
    <div style={{ maxWidth: 720 }}>
      <button
        onClick={() => navigate('/client/orders')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', cursor: 'pointer', marginBottom: '1.5rem', fontWeight: 600 }}
      >
        <ArrowLeft size={15} /> Back to Orders
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)' }}>
            {order.city}, {order.state}
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 4 }}>
            Order #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Details */}
      <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.75rem' }}>Order Details</h2>
        <Row label="Building Type"  value={order.building_type?.replace(/_/g, ' ')} />
        <Row label="Roof Area"       value={order.roof_area_sqft ? `${order.roof_area_sqft} sq ft` : null} />
        <Row label="Water Demand"    value={order.daily_demand_liters ? `${order.daily_demand_liters} L/day` : null} />
        <Row label="Quote"           value={order.quoted_amount ? `Rs.${Number(order.quoted_amount).toLocaleString('en-IN')}` : null} />
        <Row label="Submitted"       value={new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
        {order.notes && <Row label="Notes" value={order.notes} />}
      </section>

      {/* Files */}
      {files.length > 0 && (
        <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.75rem' }}>Files</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {files.map(f => (
              <div
                key={f.id}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'var(--color-surface-offset)', borderRadius: 'var(--radius-md)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={14} style={{ color: 'var(--color-text-muted)' }} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                    {f.file_name || f.file_path?.split('/').pop()}
                  </span>
                </div>
                <button
                  onClick={() => openFile(f.file_path)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', fontWeight: 600 }}
                >
                  <Download size={13} /> Download
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Status timeline */}
      {log.length > 0 && (
        <section style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem' }}>Status History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {log.map((entry, i) => (
              <div key={entry.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: i === log.length - 1 ? 'var(--color-primary)' : 'var(--color-border)',
                  flexShrink: 0, marginTop: 5
                }} />
                <div>
                  <StatusBadge status={entry.status} />
                  {entry.note && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>{entry.note}</p>
                  )}
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} />
                    {new Date(entry.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
