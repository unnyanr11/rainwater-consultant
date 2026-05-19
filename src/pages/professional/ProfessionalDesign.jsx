import { useState, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../../components/home/Navbar'
import {
  MapPin, Building2, FileUp, Calendar,
  CheckCircle2, ArrowRight, ArrowLeft, Loader2,
  Layers, Home, Factory, TreePine, ShoppingBag, Star, Search
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext' 

// ─── Blue palette (replaces all teal/green hardcodes) ────────────
const BLUE_DARK   = '#074a7e'
const BLUE_MID    = '#0b6fb8'
const BLUE_BG     = 'rgba(11,111,184,0.07)'
const BLUE_BORDER = 'rgba(11,111,184,0.20)'

// ─── constants ────────────────────────────────────────────────
const SOIL_TYPES = [
  { id: 'sandy',      label: 'Sandy',        desc: 'High permeability, fast drainage',  icon: '🏜️' },
  { id: 'loamy',      label: 'Loamy',        desc: 'Balanced retention & drainage',      icon: '🌱' },
  { id: 'clay',       label: 'Clay',         desc: 'Low permeability, slow drainage',   icon: '🧱' },
  { id: 'silty',      label: 'Silty',        desc: 'Medium retention, moderate runoff', icon: '🌊' },
  { id: 'rocky',      label: 'Rocky / Hard', desc: 'Very low absorption, high runoff',  icon: '⛰️' },
  { id: 'black',      label: 'Black Cotton', desc: 'Expands when wet, common in Deccan', icon: '🖤' },
]

const WEATHER_ZONES = [
  { id: 'semi_arid',  label: 'Semi-Arid',   desc: '< 600 mm/yr — Rajasthan, Deccan',  icon: '☀️' },
  { id: 'tropical',   label: 'Tropical',    desc: '600–1200 mm/yr — Most of India',   icon: '🌤️' },
  { id: 'humid',      label: 'Humid',       desc: '1200–2500 mm/yr — Coastal/NE',     icon: '🌧️' },
  { id: 'very_humid', label: 'Very Humid',  desc: '> 2500 mm/yr — Western Ghats, NE', icon: '⛈️' },
  { id: 'hilly',      label: 'Hilly / Mountain', desc: 'Variable, seasonal snow/rain', icon: '🏔️' },
]

const BUILDING_TYPES = [
  { id: 'residential_villa',  label: 'Residential Villa',   icon: Home,        desc: 'Independent house / bungalow' },
  { id: 'apartment',          label: 'Apartment Complex',   icon: Building2,   desc: 'Multi-storey housing society' },
  { id: 'commercial_office',  label: 'Commercial / Office', icon: ShoppingBag, desc: 'Office, mall, retail space' },
  { id: 'industrial',         label: 'Industrial / Factory',icon: Factory,     desc: 'Factory, warehouse, plant' },
  { id: 'institutional',      label: 'Institutional',       icon: Layers,      desc: 'School, hospital, govt. building' },
  { id: 'farmland',           label: 'Farmland / Open Area',icon: TreePine,    desc: 'Agricultural or open land' },
]

const STEPS = [
  { id: 'location',   label: 'Location',      icon: MapPin },
  { id: 'site',       label: 'Site Details',  icon: Layers },
  { id: 'blueprint',  label: 'Blueprint',     icon: FileUp },
  { id: 'contact',    label: 'Contact',       icon: Calendar },
]

const inputStyle = {
  width: '100%',
  padding: '0.7rem 1rem',
  fontSize: 'var(--text-sm)',
  border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  outline: 'none',
  transition: 'border-color 180ms, box-shadow 180ms',
}

const labelStyle = {
  display: 'block',
  fontSize: 'var(--text-xs)',
  fontWeight: 700,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: '0.4rem',
}

// ─── Field — defined OUTSIDE the page component so it is stable ──
// (defining it inside causes re-mount on every keystroke → focus loss)
function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 4 }}>{hint}</p>}
    </div>
  )
}

// ─── selector card ─────────────────────────────────────────────
function SelectCard({ selected, onClick, icon: Icon, iconEmoji, label, desc }) {
  const isActive = selected
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        padding: '0.85rem 1rem',
        borderRadius: 'var(--radius-lg)',
        border: `1.5px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
        background: isActive ? 'var(--color-primary-highlight)' : 'var(--color-surface)',
        cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'all 160ms',
        boxShadow: isActive ? '0 0 0 3px oklch(from var(--color-primary) l c h / 0.12)' : 'none',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 'var(--radius-md)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isActive ? 'var(--color-primary)' : 'var(--color-surface-offset)',
        color: isActive ? '#fff' : 'var(--color-text-muted)',
        fontSize: '1rem',
        transition: 'all 160ms',
      }}>
        {iconEmoji ? iconEmoji : Icon ? <Icon size={16} /> : null}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: isActive ? 'var(--color-primary)' : 'var(--color-text)' }}>{label}</div>
        {desc && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2, lineHeight: 1.4 }}>{desc}</div>}
      </div>
      {isActive && <CheckCircle2 size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />}
    </button>
  )
}

// ─── step progress ─────────────────────────────────────────────
function StepBar({ current, steps }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '2rem' }}>
      {steps.map((step, i) => {
        const done   = i < current
        const active = i === current
        const Icon   = step.icon
        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? 'var(--color-primary)' : active ? 'var(--color-primary)' : 'var(--color-surface-offset)',
                border: `2px solid ${done || active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                color: done || active ? '#fff' : 'var(--color-text-faint)',
                transition: 'all 250ms',
                flexShrink: 0,
              }}>
                {done ? <CheckCircle2 size={16} /> : <Icon size={15} />}
              </div>
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: active ? 'var(--color-primary)' : done ? 'var(--color-text-muted)' : 'var(--color-text-faint)',
                whiteSpace: 'nowrap',
              }}>{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, marginBottom: 20, marginInline: 4,
                background: done ? 'var(--color-primary)' : 'var(--color-border)',
                transition: 'background 300ms',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── file upload zone ──────────────────────────────────────────
function FileDropzone({ files, onChange }) {
  const inputRef = useRef()
  const [dragOver, setDragOver] = useState(false)

  const accept = '.pdf,.jpg,.jpeg,.png,.dwg,.dxf'

  const addFiles = (incoming) => {
    const arr = Array.from(incoming)
    onChange(prev => {
      const existing = new Set(prev.map(f => f.name + f.size))
      const novel = arr.filter(f => !existing.has(f.name + f.size))
      return [...prev, ...novel].slice(0, 5)
    })
  }

  const remove = (name) => onChange(prev => prev.filter(f => f.name !== name))

  const fmtSize = (b) => b > 1e6 ? `${(b/1e6).toFixed(1)} MB` : `${Math.round(b/1024)} KB`

  const ext = (name) => name.split('.').pop()?.toUpperCase()

  const extColor = (name) => ({
    PDF: '#e74c3c', PNG: '#0b6fb8', JPG: '#095d9c', JPEG: '#095d9c',
    DWG: '#e67e22', DXF: '#52b5e8',
  })[ext(name)] || 'var(--color-text-muted)'

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
        style={{
          border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-lg)', padding: '2rem 1.5rem',
          background: dragOver ? 'var(--color-primary-highlight)' : 'var(--color-surface-offset)',
          textAlign: 'center', cursor: 'pointer',
          transition: 'all 160ms',
        }}
      >
        <FileUp size={28} style={{ color: 'var(--color-text-faint)', margin: '0 auto 0.75rem' }} />
        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>
          {dragOver ? 'Drop files here' : 'Upload map, blueprint, or site plan'}
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          PDF, JPG, PNG, DWG, DXF · Max 5 files · Up to 20 MB each
        </p>
        <input ref={inputRef} type="file" multiple accept={accept} style={{ display: 'none' }}
          onChange={e => addFiles(e.target.files)} />
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {files.map(f => (
            <div key={f.name} style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.55rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}>
              <span style={{
                fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.04em',
                color: extColor(f.name), background: `${extColor(f.name)}18`,
                padding: '2px 6px', borderRadius: 4, flexShrink: 0,
              }}>{ext(f.name)}</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', flexShrink: 0 }}>{fmtSize(f.size)}</span>
              <button type="button" onClick={() => remove(f.name)}
                style={{ color: 'var(--color-text-faint)', fontSize: '1rem', lineHeight: 1, padding: '0 2px', cursor: 'pointer', background: 'none', border: 'none', flexShrink: 0 }}
                aria-label={`Remove ${f.name}`}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── pricing pill ──────────────────────────────────────────────
function PricingBadge() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.4rem 0.9rem',
      borderRadius: 'var(--radius-full)',
      background: `linear-gradient(135deg, ${BLUE_MID} 0%, ${BLUE_DARK} 100%)`,
      color: '#fff',
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      letterSpacing: '0.04em',
      boxShadow: '0 2px 8px rgba(11,111,184,0.35)',
    }}>
      <Star size={11} fill="#ffd700" color="#ffd700" />
      Paid Service — Expert Review Included
    </div>
  )
}

// ─── main page ─────────────────────────────────────────────────
export default function ProfessionalDesign() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const prefill    = location.state || {}
  const { user }  = useAuth()

  const [step, setStep]     = useState(0)
  const [loading, setLoading] = useState(false)
  const [done, setDone]     = useState(false)
  const [files, setFiles]   = useState([])

  // Pincode lookup state
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const [pincodeError, setPincodeError]     = useState('')
  const [pincodeFilled, setPincodeFilled]   = useState(false)

  const [form, setForm] = useState({
    city:    prefill.city    || '',
    state:   prefill.state   || '',
    pincode: prefill.pincode || '',
    address: '',
    soilType:     '',
    weatherZone:  '',
    buildingType: '',
    roofArea:     prefill.roofArea || '',
    storeys:      '',
    occupants:    '',
    usage:        '',
    visitPreferred: false,
    visitDate: '',
    visitNote: '',
    name:    '',
    email:   '',
    phone:   '',
    message: '',
  })

  const set = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), [])

  // ─── Pincode lookup via India Post API ────────────────────────
  const lookupPincode = useCallback(async (pin) => {
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setPincodeError('')
      setPincodeFilled(false)
      return
    }
    setPincodeLoading(true)
    setPincodeError('')
    setPincodeFilled(false)
    try {
      const res  = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
      const data = await res.json()
      if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
        const po    = data[0].PostOffice[0]
        const city  = po.District || po.Division || po.Name || ''
        const state = po.State || ''
        setForm(f => ({
          ...f,
          city:  f.city.trim()  === '' ? city  : f.city,
          state: f.state.trim() === '' ? state : f.state,
        }))
        setPincodeFilled(true)
        setPincodeError('')
      } else {
        setPincodeError('No location found for this PIN code')
      }
    } catch {
      setPincodeError('Could not fetch location — check your connection')
    } finally {
      setPincodeLoading(false)
    }
  }, [])

  const handlePincodeChange = useCallback((e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    set('pincode', val)
    setPincodeFilled(false)
    setPincodeError('')
    if (val.length === 6) lookupPincode(val)
  }, [set, lookupPincode])

  const canProceed = [
    form.city.trim() && form.state.trim(),
    form.soilType && form.weatherZone && form.buildingType,
    true,
    form.name.trim() && /^[^@]+@[^@]+\.[^@]+$/.test(form.email) && form.phone.trim(),
  ][step]

  const next = () => { if (canProceed) setStep(s => Math.min(s + 1, STEPS.length - 1)) }
  const prev = () => setStep(s => Math.max(s - 1, 0))

  const submit = async () => {
    if (!canProceed) return
    setLoading(true)

    try {
      const { data: order, error: orderErr } = await supabase
        .from('design_orders')
        .insert({
          user_id:       user?.id ?? null,
          city:          form.city.trim(),
          state:         form.state.trim(),
          pincode:       form.pincode.trim() || null,
          address:       form.address.trim() || null,
          soil_type:     form.soilType,
          weather_zone:  form.weatherZone,
          building_type: form.buildingType,
          roof_area_sqm: form.roofArea ? Number(form.roofArea) : null,
          storeys:       form.storeys   ? Number(form.storeys)   : null,
          occupants:     form.occupants ? Number(form.occupants) : null,
          daily_usage_lpd: form.usage   ? Number(form.usage)     : null,
          visit_preferred: form.visitPreferred,
          visit_date:    form.visitPreferred && form.visitDate ? form.visitDate : null,
          visit_note:    form.visitNote.trim() || null,
          contact_name:  form.name.trim(),
          contact_email: form.email.trim(),
          contact_phone: form.phone.trim(),
          message:       form.message.trim() || null,
          status:        'pending',
        })
        .select('id')
        .single()

      if (orderErr) throw orderErr

      if (files.length > 0) {
        for (const file of files) {
          const ext      = file.name.split('.').pop()
          const safeName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
          const path     = `${order.id}/${safeName}`

          const { error: uploadErr } = await supabase.storage
            .from('order-files')
            .upload(path, file, { contentType: file.type, upsert: false })

          if (uploadErr) throw uploadErr

          const { error: fileErr } = await supabase
            .from('order_files')
            .insert({
              order_id:        order.id,
              uploaded_by:     user?.id ?? null,
              file_name:       file.name,
              file_size_bytes: file.size,
              mime_type:       file.type,
              storage_path:    path,
              bucket:          'order-files',
              is_drawing:      false,
              is_unlocked:     false,
            })

          if (fileErr) throw fileErr
        }
      }

      setDone(true)

    } catch (err) {
      console.error('Submission failed:', err)
      alert('Something went wrong: ' + (err.message || 'Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <>
      <Navbar />
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingInline: '1rem' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            maxWidth: 480, width: '100%', textAlign: 'center',
            padding: '3rem 2rem',
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            Request Received!
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7, maxWidth: '36ch', margin: '0 auto 1.5rem' }}>
            Our expert team will review your site details and get back to you within <strong>24–48 hours</strong> with a tailored design proposal and quote.
          </p>
          <div style={{
            padding: '0.85rem 1.1rem',
            background: 'var(--color-primary-highlight)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)', color: 'var(--color-primary)',
            fontWeight: 600, marginBottom: '1.5rem',
          }}>
            📩 Confirmation sent to {form.email}
          </div>
          <button
            onClick={() => navigate('/calculator')}
            style={{
              padding: '0.7rem 1.75rem',
              background: 'var(--color-primary)', color: '#fff',
              border: 'none', borderRadius: 'var(--radius-md)',
              fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer',
            }}
          >Back to Calculator</button>
        </motion.div>
      </div>
    </>
  )

  return (
    <>
      <style>{`
        .pd-input:focus { border-color: var(--color-primary) !important; box-shadow: 0 0 0 3px rgba(11,111,184,0.14); }
        .pd-input::placeholder { color: var(--color-text-faint); }
        .pd-next:hover:not(:disabled) { background: var(--color-primary-hover) !important; }
        .pd-next:disabled { opacity: 0.45; cursor: not-allowed; }
        .pd-prev:hover { background: var(--color-surface-offset) !important; }
        .pd-pincode-wrap { position: relative; }
        .pd-pincode-wrap .pd-pin-icon { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); pointer-events: none; }
        @media (max-width: 600px) {
          .pd-grid2 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Navbar />

      <div style={{ paddingTop: 64 }}>
        {/* ── Hero banner ── */}
        <div style={{
          background: `linear-gradient(135deg, ${BLUE_MID} 0%, ${BLUE_DARK} 100%)`,
          padding: 'clamp(2.5rem,5vw,4rem) 1.5rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: 280, height: 280, borderRadius: '50%',
            border: '40px solid rgba(255,255,255,0.04)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-80px', left: '-40px',
            width: 220, height: 220, borderRadius: '50%',
            border: '30px solid rgba(255,255,255,0.04)', pointerEvents: 'none',
          }} />
          <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: '0.75rem' }}><PricingBadge /></div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem,4vw,2.75rem)',
              fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: '0.75rem',
            }}>
              Get a Professional Rainwater<br />Harvesting Design
            </h1>
            <p style={{
              fontSize: 'var(--text-base)', color: 'rgba(255,255,255,0.80)',
              maxWidth: '52ch', lineHeight: 1.7,
            }}>
              Tell us about your site — soil, weather zone, building type, and more.
              Our engineers will create a custom system design with drawings, tank sizing, and installation guidance.
            </p>
          </div>
        </div>

        {/* ── What you get strip ── */}
        <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '1rem 1.5rem' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '1.2rem', justifyContent: 'center' }}>
            {[
              '📐 Custom System Drawings',
              '🔧 Component Specifications',
              '💧 Pipe & Tank Sizing',
              '📊 ROI Analysis Report',
              '📞 1 Expert Consultation Call',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                <span>{item.split(' ')[0]}</span>
                <span>{item.split(' ').slice(1).join(' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Form wrapper ── */}
        <div style={{ maxWidth: 700, margin: '0 auto', padding: 'clamp(2rem,4vw,3rem) 1.25rem clamp(3rem,6vw,5rem)' }}>
          <StepBar current={step} steps={STEPS} />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                padding: 'clamp(1.5rem,3vw,2.25rem)',
                boxShadow: 'var(--shadow-md)',
              }}>

                {/* ══ STEP 0 — Location ══════════════════════════════════ */}
                {step === 0 && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MapPin size={17} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1 }}>Site Location</h2>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Where is the property located?</p>
                      </div>
                    </div>

                    {/* PIN code first — auto-fills city & state */}
                    <Field label="PIN Code" hint="Enter your 6-digit PIN code to auto-fill city and state">
                      <div className="pd-pincode-wrap">
                        <input
                          className="pd-input"
                          style={{
                            ...inputStyle,
                            paddingRight: '2.5rem',
                            borderColor: pincodeFilled
                              ? 'var(--color-success)'
                              : pincodeError
                              ? 'var(--color-error)'
                              : undefined,
                          }}
                          placeholder="e.g. 411001"
                          value={form.pincode}
                          onChange={handlePincodeChange}
                          maxLength={6}
                          inputMode="numeric"
                        />
                        <span className="pd-pin-icon">
                          {pincodeLoading
                            ? <Loader2 size={15} style={{ color: 'var(--color-text-faint)', animation: 'spin 0.9s linear infinite' }} />
                            : pincodeFilled
                            ? <CheckCircle2 size={15} style={{ color: 'var(--color-success)' }} />
                            : <Search size={15} style={{ color: 'var(--color-text-faint)' }} />
                          }
                        </span>
                      </div>
                      {pincodeError && (
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', marginTop: 4 }}>{pincodeError}</p>
                      )}
                      {pincodeFilled && (
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success)', marginTop: 4 }}>✓ City and state filled from PIN code</p>
                      )}
                    </Field>

                    <div className="pd-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                      <Field label="City / Town *">
                        <input className="pd-input" style={inputStyle} placeholder="e.g. Pune" value={form.city} onChange={e => set('city', e.target.value)} />
                      </Field>
                      <Field label="State *">
                        <input className="pd-input" style={inputStyle} placeholder="e.g. Maharashtra" value={form.state} onChange={e => set('state', e.target.value)} />
                      </Field>
                    </div>

                    <Field label="Approximate Roof Area (sq.m)">
                      <input className="pd-input" style={inputStyle} type="number" min={0} placeholder="e.g. 150" value={form.roofArea} onChange={e => set('roofArea', e.target.value)} />
                    </Field>

                    <Field label="Full Address (optional)">
                      <textarea className="pd-input" style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
                        placeholder="Plot no., street, landmark…" value={form.address} onChange={e => set('address', e.target.value)} />
                    </Field>
                  </>
                )}

                {/* ══ STEP 1 — Site Details ══════════════════════════════ */}
                {step === 1 && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Layers size={17} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1 }}>Site Details</h2>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Soil, climate and building information</p>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ ...labelStyle, marginBottom: '0.6rem' }}>Soil Type *</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(200px,100%),1fr))', gap: '0.5rem' }}>
                        {SOIL_TYPES.map(s => (
                          <SelectCard key={s.id} selected={form.soilType === s.id} onClick={() => set('soilType', s.id)}
                            iconEmoji={s.icon} label={s.label} desc={s.desc} />
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ ...labelStyle, marginBottom: '0.6rem' }}>Weather / Rainfall Zone *</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(200px,100%),1fr))', gap: '0.5rem' }}>
                        {WEATHER_ZONES.map(w => (
                          <SelectCard key={w.id} selected={form.weatherZone === w.id} onClick={() => set('weatherZone', w.id)}
                            iconEmoji={w.icon} label={w.label} desc={w.desc} />
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ ...labelStyle, marginBottom: '0.6rem' }}>Building Type *</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(200px,100%),1fr))', gap: '0.5rem' }}>
                        {BUILDING_TYPES.map(b => (
                          <SelectCard key={b.id} selected={form.buildingType === b.id} onClick={() => set('buildingType', b.id)}
                            icon={b.icon} label={b.label} desc={b.desc} />
                        ))}
                      </div>
                    </div>

                    <div className="pd-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 1rem', marginTop: '1.25rem' }}>
                      <Field label="Storeys">
                        <input className="pd-input" style={inputStyle} type="number" min={1} placeholder="e.g. 2" value={form.storeys} onChange={e => set('storeys', e.target.value)} />
                      </Field>
                      <Field label="Occupants">
                        <input className="pd-input" style={inputStyle} type="number" min={1} placeholder="e.g. 8" value={form.occupants} onChange={e => set('occupants', e.target.value)} />
                      </Field>
                      <Field label="Daily Water Use (L)">
                        <input className="pd-input" style={inputStyle} type="number" min={0} placeholder="e.g. 500" value={form.usage} onChange={e => set('usage', e.target.value)} />
                      </Field>
                    </div>
                  </>
                )}

                {/* ══ STEP 2 — Blueprint ════════════════════════════════ */}
                {step === 2 && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileUp size={17} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1 }}>Upload Blueprint or Plan a Visit</h2>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Both options are available — choose one or both</p>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Upload Map / Blueprint / Site Plan <span style={{ color: 'var(--color-text-faint)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                      <FileDropzone files={files} onChange={setFiles} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
                      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>or</span>
                      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                    </div>

                    <div style={{
                      padding: '1.1rem 1.2rem',
                      borderRadius: 'var(--radius-lg)',
                      border: `1.5px solid ${form.visitPreferred ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: form.visitPreferred ? 'var(--color-primary-highlight)' : 'var(--color-surface-offset)',
                      transition: 'all 160ms', marginBottom: '0.75rem',
                    }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ marginTop: 3, accentColor: 'var(--color-primary)', width: 16, height: 16, flexShrink: 0 }}
                          checked={form.visitPreferred} onChange={e => set('visitPreferred', e.target.checked)} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-text)', marginBottom: 2 }}>
                            📍 I'd prefer a site visit by the engineer
                          </div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                            Our engineer will visit your location, assess the site in person, and provide recommendations. Travel costs are billed separately.
                          </div>
                        </div>
                      </label>
                    </div>

                    {form.visitPreferred && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '0.25rem' }}
                      >
                        <Field label="Preferred Visit Date">
                          <input className="pd-input" style={inputStyle} type="date"
                            min={new Date(Date.now() + 2*86400000).toISOString().split('T')[0]}
                            value={form.visitDate} onChange={e => set('visitDate', e.target.value)} />
                        </Field>
                        <Field label="Any specific timing or access notes?">
                          <textarea className="pd-input" style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
                            placeholder="e.g. Available only on weekends, gate code is 1234…"
                            value={form.visitNote} onChange={e => set('visitNote', e.target.value)} />
                        </Field>
                      </motion.div>
                    )}

                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                      padding: '0.75rem 1rem', marginTop: '1rem',
                      background: BLUE_BG,
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${BLUE_BORDER}`,
                    }}>
                      <span style={{ flexShrink: 0, fontSize: '0.95rem', marginTop: 1 }}>ℹ️</span>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
                        Uploading a blueprint helps our team design more accurately. If you don't have one yet, our engineer can create a basic layout sketch during the site visit.
                      </p>
                    </div>
                  </>
                )}

                {/* ══ STEP 3 — Contact ══════════════════════════════════ */}
                {step === 3 && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={17} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1 }}>Your Contact Details</h2>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>We'll send the proposal and invoice here</p>
                      </div>
                    </div>

                    <div className="pd-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                      <Field label="Full Name *">
                        <input className="pd-input" style={inputStyle} placeholder="Ramesh Kumar" value={form.name} onChange={e => set('name', e.target.value)} />
                      </Field>
                      <Field label="Phone *">
                        <input className="pd-input" style={inputStyle} type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
                      </Field>
                    </div>

                    <Field label="Email Address *">
                      <input className="pd-input" style={inputStyle} type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                    </Field>

                    <Field label="Additional Requirements (optional)" hint="Special materials, budget constraints, timeline, certifications needed, etc.">
                      <textarea className="pd-input" style={{ ...inputStyle, resize: 'vertical', minHeight: 88 }}
                        placeholder="e.g. Need IGBC-compliant design, budget under ₹2 lakh, complete by June…"
                        value={form.message} onChange={e => set('message', e.target.value)} />
                    </Field>

                    <div style={{
                      padding: '1rem 1.2rem', borderRadius: 'var(--radius-lg)',
                      background: 'var(--color-surface-offset)', border: '1px solid var(--color-border)',
                      marginTop: '0.5rem',
                    }}>
                      <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>Order Summary</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {[
                          ['📍 Location', `${form.city}${form.state ? ', ' + form.state : ''}${form.pincode ? ' – ' + form.pincode : ''}`],
                          ['🏗️ Building', BUILDING_TYPES.find(b => b.id === form.buildingType)?.label || '—'],
                          ['🌱 Soil', SOIL_TYPES.find(s => s.id === form.soilType)?.label || '—'],
                          ['🌧️ Climate', WEATHER_ZONES.find(w => w.id === form.weatherZone)?.label || '—'],
                          ['📁 Files', files.length ? `${files.length} file${files.length > 1 ? 's' : ''} attached` : 'None'],
                          ['📍 Site Visit', form.visitPreferred ? (form.visitDate || 'Date TBD') : 'Not requested'],
                        ].map(([k, v]) => (
                          <div key={k} style={{ display: 'flex', gap: '0.5rem', fontSize: 'var(--text-xs)' }}>
                            <span style={{ color: 'var(--color-text-faint)', flexShrink: 0, minWidth: 110 }}>{k}</span>
                            <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{v || '—'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                      padding: '0.85rem 1rem', marginTop: '1rem',
                      borderRadius: 'var(--radius-md)',
                      background: BLUE_BG,
                      border: `1px solid ${BLUE_BORDER}`,
                    }}>
                      <Star size={14} fill="#ffd700" color="#ffd700" style={{ flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
                        This is a <strong style={{ color: 'var(--color-primary)' }}>paid professional service</strong>. After reviewing your submission, we'll send a detailed proposal with pricing. No charge until you approve.
                      </p>
                    </div>
                  </>
                )}

              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── Navigation buttons ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={step === 0 ? () => navigate(-1) : prev}
              className="pd-prev"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.7rem 1.25rem',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface)',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
                transition: 'background 160ms',
              }}
            >
              <ArrowLeft size={15} />
              {step === 0 ? 'Back' : 'Previous'}
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                disabled={!canProceed}
                className="pd-next"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.7rem 1.75rem',
                  background: 'var(--color-primary)', color: '#fff',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)', fontWeight: 700, cursor: 'pointer',
                  transition: 'background 160ms',
                }}
              >
                Continue <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!canProceed || loading}
                className="pd-next"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.7rem 1.75rem',
                  background: 'var(--color-primary)', color: '#fff',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)', fontWeight: 700, cursor: 'pointer',
                  transition: 'background 160ms', minWidth: 180, justifyContent: 'center',
                }}
              >
                {loading ? (
                  <><Loader2 size={15} style={{ animation: 'spin 0.9s linear infinite' }} /> Submitting…</>
                ) : (
                  <><Star size={14} /> Submit Request</>
                )}
              </button>
            )}
          </div>

          <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: '0.75rem' }}>
            Step {step + 1} of {STEPS.length}
            {step < 2 && ' — All fields marked * are required to continue'}
            {step === 2 && ' — Both upload and site visit are optional'}
            {step === 3 && ' — Review your details before submitting'}
          </p>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </>
  )
}
