import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Building2, FileUp, Calendar,
  CheckCircle2, ArrowRight, ArrowLeft, Loader2,
  Layers, Home, Factory, TreePine, ShoppingBag, Star
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

// ─── Blue palette ────────────────────────────────────────────────
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

function SelectCard({ selected, onClick, icon: Icon, iconEmoji, label, desc }) {
  const isActive = selected
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        padding: '0.9rem 1rem',
        borderRadius: 'var(--radius-md)',
        border: `1.5px solid ${isActive ? BLUE_MID : 'var(--color-border)'}`,
        background: isActive ? BLUE_BG : 'var(--color-bg)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 150ms',
        width: '100%',
      }}
    >
      <span style={{ fontSize: '1.25rem', lineHeight: 1.2, flexShrink: 0 }}>
        {iconEmoji || (Icon && <Icon size={18} color={isActive ? BLUE_MID : 'var(--color-text-muted)'} />)}
      </span>
      <span>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: isActive ? BLUE_MID : 'var(--color-text)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{desc}</div>
      </span>
    </button>
  )
}

function StepBar({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
      {STEPS.map((s, i) => {
        const done    = i < current
        const active  = i === current
        const SIcon   = s.icon
        return (
          <>
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: active ? BLUE_MID : done ? BLUE_BG : 'var(--color-surface-offset)',
              border: `1.5px solid ${active ? BLUE_MID : done ? BLUE_BORDER : 'var(--color-border)'}`,
              fontSize: 'var(--text-xs)', fontWeight: 700,
              color: active ? '#fff' : done ? BLUE_MID : 'var(--color-text-faint)',
              transition: 'all 250ms',
              whiteSpace: 'nowrap',
            }}>
              <SIcon size={12} /> {s.label}
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 1.5, background: done ? BLUE_BORDER : 'var(--color-border)', transition: 'background 250ms' }} />
            )}
          </>
        )
      })}
    </div>
  )
}

function PricingBadge() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
      padding: '0.3rem 0.75rem',
      borderRadius: 'var(--radius-full)',
      background: 'rgba(255,255,255,0.15)',
      border: '1px solid rgba(255,255,255,0.25)',
      fontSize: 'var(--text-xs)', fontWeight: 700, color: '#fff',
    }}>
      <Star size={11} fill="#ffd700" color="#ffd700" /> Professional Design · ₹4,999
    </div>
  )
}

export default function ClientRequestDesign() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user }  = useAuth()
  const fileRef   = useRef(null)

  const prefill = location.state?.prefill || {}

  const [step, setStep]   = useState(0)
  const [done, setDone]   = useState(false)
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState('')

  const [loc, setLoc] = useState({
    city:     prefill.city || '',
    state:    '',
    pincode:  '',
    address:  '',
  })

  const [site, setSite] = useState({
    building_type:  '',
    roof_area:      prefill.area  || '',
    roof_area_unit: prefill.unit  || 'sqft',
    soil_type:      '',
    weather_zone:   '',
    storeys:        '',
    notes:          '',
  })

  const [blueprint, setBlueprint] = useState({ file: null, fileName: '' })

  const [contact, setContact] = useState({
    name:       user?.user_metadata?.full_name || '',
    phone:      '',
    email:      user?.email || '',
    preferred:  '',
  })

  const canNext = [
    loc.city && loc.state && loc.pincode,
    site.building_type && site.roof_area && site.soil_type && site.weather_zone,
    true,
    contact.name && contact.phone && contact.email,
  ]

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setBlueprint({ file: f, fileName: f.name })
  }

  const handleSubmit = async () => {
    setBusy(true); setError('')
    try {
      let blueprint_url = null
      if (blueprint.file) {
        const ext  = blueprint.file.name.split('.').pop()
        const path = `blueprints/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const { error: upErr } = await supabase.storage.from('order-files').upload(path, blueprint.file)
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('order-files').getPublicUrl(path)
        blueprint_url = urlData.publicUrl
      }

      const payload = {
        user_id:           user?.id ?? null,
        city:              loc.city,
        state:             loc.state,
        pincode:           loc.pincode,
        address:           loc.address,
        building_type:     site.building_type,
        roof_area:         parseFloat(site.roof_area),
        roof_area_unit:    site.roof_area_unit,
        soil_type:         site.soil_type,
        weather_zone:      site.weather_zone,
        storeys:           site.storeys ? parseInt(site.storeys) : null,
        notes:             site.notes,
        blueprint_url,
        contact_name:      contact.name,
        contact_phone:     contact.phone,
        contact_email:     contact.email,
        preferred_contact: contact.preferred,
        status:            'pending',
      }

      const { error: dbErr } = await supabase.from('design_orders').insert([payload])
      if (dbErr) throw dbErr

      setDone(true)
    } catch (e) {
      setError(e.message || 'Submission failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (done) return (
    <>
      <style>{`
        .pd-input:focus { border-color: var(--color-primary) !important; box-shadow: 0 0 0 3px rgba(11,111,184,0.14); }
        .pd-input::placeholder { color: var(--color-text-faint); }
        .pd-next:hover:not(:disabled) { background: var(--color-primary-hover) !important; }
        .pd-next:disabled { opacity: 0.45; cursor: not-allowed; }
        .pd-prev:hover { background: var(--color-surface-offset) !important; }
        @media (max-width: 600px) { .pd-grid2 { grid-template-columns: 1fr !important; } }
      `}</style>
      <div style={{
        minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
      }}>
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 2.5rem',
            maxWidth: 480,
            width: '100%',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(11,111,184,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <CheckCircle2 size={32} color={BLUE_MID} />
          </div>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
            Request submitted!
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
            Our team will review your project details and get back to you within 24–48 hours.
          </p>
          <button
            onClick={() => navigate('/client')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 2rem',
              background: BLUE_MID, color: '#fff',
              border: 'none', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)', fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Go to dashboard <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    </>
  )

  return (
    <>
      <style>{`
        .pd-input:focus { border-color: ${BLUE_MID} !important; box-shadow: 0 0 0 3px rgba(11,111,184,0.14); }
        .pd-input::placeholder { color: var(--color-text-faint); }
        .pd-next:hover:not(:disabled) { background: var(--color-primary-hover) !important; }
        .pd-next:disabled { opacity: 0.45; cursor: not-allowed; }
        .pd-prev:hover { background: var(--color-surface-offset) !important; }
        @media (max-width: 600px) { .pd-grid2 { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ── header banner ── */}
      <div style={{
        background: `linear-gradient(135deg, ${BLUE_DARK} 0%, ${BLUE_MID} 100%)`,
        padding: '2.5rem 2rem 2rem',
        marginBottom: '2rem',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <PricingBadge />
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: '#fff', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
            Request a professional design
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
            Fill in your site details and our engineers will prepare a custom rainwater harvesting plan for you.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <StepBar current={step} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
            {/* ── Step 0: Location ── */}
            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>Where is your site?</h2>
                <div className="pd-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { key: 'city',    label: 'City',         placeholder: 'e.g. Pune' },
                    { key: 'state',   label: 'State',        placeholder: 'e.g. Maharashtra' },
                    { key: 'pincode', label: 'Pincode',      placeholder: '6-digit code' },
                    { key: 'address', label: 'Address (opt)',placeholder: 'Street / area' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <input
                        className="pd-input"
                        style={inputStyle}
                        placeholder={placeholder}
                        value={loc[key]}
                        onChange={e => setLoc(p => ({ ...p, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 1: Site Details ── */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>Tell us about your site</h2>

                <div>
                  <label style={labelStyle}>Building type</label>
                  <div className="pd-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    {BUILDING_TYPES.map(bt => (
                      <SelectCard
                        key={bt.id}
                        selected={site.building_type === bt.id}
                        onClick={() => setSite(p => ({ ...p, building_type: bt.id }))}
                        icon={bt.icon}
                        label={bt.label}
                        desc={bt.desc}
                      />
                    ))}
                  </div>
                </div>

                <div className="pd-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Roof area</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        className="pd-input"
                        style={{ ...inputStyle, flex: 1 }}
                        type="number"
                        placeholder="e.g. 200"
                        value={site.roof_area}
                        onChange={e => setSite(p => ({ ...p, roof_area: e.target.value }))}
                      />
                      <select
                        className="pd-input"
                        style={{ ...inputStyle, width: 'auto' }}
                        value={site.roof_area_unit}
                        onChange={e => setSite(p => ({ ...p, roof_area_unit: e.target.value }))}
                      >
                        <option value="sqft">sqft</option>
                        <option value="sqm">sqm</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>No. of floors (opt)</label>
                    <input
                      className="pd-input"
                      style={inputStyle}
                      type="number"
                      placeholder="e.g. 2"
                      value={site.storeys}
                      onChange={e => setSite(p => ({ ...p, storeys: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Soil type</label>
                  <div className="pd-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
                    {SOIL_TYPES.map(st => (
                      <SelectCard
                        key={st.id}
                        selected={site.soil_type === st.id}
                        onClick={() => setSite(p => ({ ...p, soil_type: st.id }))}
                        iconEmoji={st.icon}
                        label={st.label}
                        desc={st.desc}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Rainfall / weather zone</label>
                  <div className="pd-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                    {WEATHER_ZONES.map(wz => (
                      <SelectCard
                        key={wz.id}
                        selected={site.weather_zone === wz.id}
                        onClick={() => setSite(p => ({ ...p, weather_zone: wz.id }))}
                        iconEmoji={wz.icon}
                        label={wz.label}
                        desc={wz.desc}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Additional notes (opt)</label>
                  <textarea
                    className="pd-input"
                    style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                    placeholder="Any special requirements, existing infrastructure, etc."
                    value={site.notes}
                    onChange={e => setSite(p => ({ ...p, notes: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* ── Step 2: Blueprint ── */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>Upload blueprint (optional)</h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  Upload a floor plan or site layout to help our engineers plan more accurately.
                  Accepted formats: PDF, PNG, JPG, DWG.
                </p>
                <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.dwg" style={{ display: 'none' }} onChange={handleFile} />
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                    padding: '2.5rem',
                    border: `2px dashed ${blueprint.file ? BLUE_MID : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    background: blueprint.file ? BLUE_BG : 'var(--color-surface)',
                    cursor: 'pointer',
                    transition: 'all 200ms',
                    width: '100%',
                  }}
                >
                  <FileUp size={32} color={blueprint.file ? BLUE_MID : 'var(--color-text-faint)'} />
                  {blueprint.file
                    ? <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: BLUE_MID }}>{blueprint.fileName}</span>
                    : <>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)' }}>Click to upload a file</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>PDF, PNG, JPG, DWG — max 20 MB</span>
                      </>
                  }
                </button>
                {blueprint.file && (
                  <button
                    onClick={() => setBlueprint({ file: null, fileName: '' })}
                    style={{ alignSelf: 'flex-start', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Remove file
                  </button>
                )}
              </div>
            )}

            {/* ── Step 3: Contact ── */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>Your contact details</h2>
                <div className="pd-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { key: 'name',  label: 'Full name',  placeholder: 'Your name', type: 'text' },
                    { key: 'phone', label: 'Phone',      placeholder: '+91 98765 43210', type: 'tel' },
                    { key: 'email', label: 'Email',      placeholder: 'you@email.com', type: 'email' },
                  ].map(({ key, label, placeholder, type }) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <input
                        className="pd-input"
                        style={inputStyle}
                        type={type}
                        placeholder={placeholder}
                        value={contact[key]}
                        onChange={e => setContact(p => ({ ...p, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={labelStyle}>Preferred contact (opt)</label>
                    <select
                      className="pd-input"
                      style={inputStyle}
                      value={contact.preferred}
                      onChange={e => setContact(p => ({ ...p, preferred: e.target.value }))}
                    >
                      <option value="">Any</option>
                      <option value="phone">Phone call</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── error ── */}
        {error && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: 'var(--color-error-highlight)',
            border: '1px solid var(--color-error)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-error)',
          }}>
            {error}
          </div>
        )}

        {/* ── nav buttons ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '1rem' }}>
          {step > 0 ? (
            <button
              className="pd-prev"
              onClick={() => setStep(s => s - 1)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.7rem 1.5rem',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface)',
                fontSize: 'var(--text-sm)', fontWeight: 600,
                color: 'var(--color-text)',
                cursor: 'pointer',
                transition: 'background 150ms',
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button
              className="pd-next"
              disabled={!canNext[step]}
              onClick={() => setStep(s => s + 1)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.7rem 2rem',
                background: BLUE_MID, color: '#fff',
                border: 'none', borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)', fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 150ms',
              }}
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="pd-next"
              disabled={!canNext[step] || busy}
              onClick={handleSubmit}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 2rem',
                background: BLUE_MID, color: '#fff',
                border: 'none', borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)', fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 150ms',
              }}
            >
              {busy ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</> : <>Submit request <ArrowRight size={16} /></>}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
