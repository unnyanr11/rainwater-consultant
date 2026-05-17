import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Building2, FileUp, Calendar,
  CheckCircle2, ArrowRight, ArrowLeft, Loader2,
  Layers, Home, Factory, TreePine, ShoppingBag, Star
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'

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

// ─── selector card ─────────────────────────────────────────────
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

// ─── step indicator ────────────────────────────────────────────
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

// ─── pricing badge ─────────────────────────────────────────────
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

  // ── validation per step ──
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
        const { error: upErr } = await supabase.storage.from('designs').upload(path, blueprint.file)
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('designs').getPublicUrl(path)
        blueprint_url = urlData.publicUrl
      }

      const payload = {
        user_id:        user?.id ?? null,
        city:           loc.city,
        state:          loc.state,
        pincode:        loc.pincode,
        address:        loc.address,
        building_type:  site.building_type,
        roof_area:      parseFloat(site.roof_area),
        roof_area_unit: site.roof_area_unit,
        soil_type:      site.soil_type,
        weather_zone:   site.weather_zone,
        storeys:        site.storeys ? parseInt(site.storeys) : null,
        notes:          site.notes,
        blueprint_url,
        contact_name:   contact.name,
        contact_phone:  contact.phone,
        contact_email:  contact.email,
        preferred_contact: contact.preferred,
        status:         'pending',
      }

      const { error: dbErr } = await supabase.from('design_requests').insert([payload])
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
      <div style={{ minHeight: '60dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingInline: '1rem' }}>
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
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}>
            <CheckCircle2 size={56} color={BLUE_MID} style={{ margin: '0 auto 1.5rem' }} />
          </motion.div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            Request Submitted!
          </h2>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Our engineers will review your site details and send a custom rainwater harvesting design within <strong>3–5 business days</strong>.
          </p>
          <button
            onClick={() => navigate('/client')}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: 'var(--radius-md)',
              background: BLUE_MID, color: '#fff', border: 'none',
              fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer',
            }}
          >
            Back to Dashboard
          </button>
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
        @media (max-width: 600px) { .pd-grid2 { grid-template-columns: 1fr !important; } }
      `}</style>

      <div>
        {/* ── Hero banner ── */}
        <div style={{
          background: `linear-gradient(135deg, ${BLUE_MID} 0%, ${BLUE_DARK} 100%)`,
          padding: 'clamp(2rem,4vw,3rem) 1.5rem',
          position: 'relative', overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-8)',
        }}>
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: 280, height: 280, borderRadius: '50%',
            border: '40px solid rgba(255,255,255,0.04)', pointerEvents: 'none',
          }} />
          <div style={{ maxWidth: 700, position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: '0.75rem' }}><PricingBadge /></div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,3vw,2.25rem)',
              fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: '0.75rem',
            }}>
              Request a Professional Design
            </h1>
            <p style={{ fontSize: 'var(--text-base)', color: 'rgba(255,255,255,0.80)', maxWidth: '52ch', lineHeight: 1.7 }}>
              Tell us about your site — our engineers will create a custom system design with drawings, tank sizing, and installation guidance.
            </p>
          </div>
        </div>

        {/* ── Form card ── */}
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            padding: 'clamp(1.5rem,4vw,2.5rem)',
            boxShadow: 'var(--shadow-md)',
          }}>
            <StepBar current={step} />

            <AnimatePresence mode="wait">
              {/* ── STEP 0: Location ── */}
              {step === 0 && (
                <motion.div key="loc" initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-24 }} transition={{ duration:0.25 }}>
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text)' }}>Where is your site?</h2>
                  <div className="pd-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                    <div>
                      <label style={labelStyle}>City *</label>
                      <input className="pd-input" style={inputStyle} placeholder="e.g. Bengaluru" value={loc.city} onChange={e => setLoc(l=>({...l,city:e.target.value}))} />
                    </div>
                    <div>
                      <label style={labelStyle}>State *</label>
                      <input className="pd-input" style={inputStyle} placeholder="e.g. Karnataka" value={loc.state} onChange={e => setLoc(l=>({...l,state:e.target.value}))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Pincode *</label>
                      <input className="pd-input" style={inputStyle} placeholder="560001" value={loc.pincode} onChange={e => setLoc(l=>({...l,pincode:e.target.value}))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Full Address</label>
                      <input className="pd-input" style={inputStyle} placeholder="Street, locality…" value={loc.address} onChange={e => setLoc(l=>({...l,address:e.target.value}))} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 1: Site Details ── */}
              {step === 1 && (
                <motion.div key="site" initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-24 }} transition={{ duration:0.25 }}>
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text)' }}>Tell us about your site</h2>

                  <label style={{ ...labelStyle, marginBottom:'0.75rem' }}>Building Type *</label>
                  <div className="pd-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem', marginBottom:'1.25rem' }}>
                    {BUILDING_TYPES.map(b => (
                      <SelectCard key={b.id} selected={site.building_type===b.id} onClick={()=>setSite(s=>({...s,building_type:b.id}))} icon={b.icon} label={b.label} desc={b.desc} />
                    ))}
                  </div>

                  <div className="pd-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.25rem' }}>
                    <div>
                      <label style={labelStyle}>Roof / Catchment Area *</label>
                      <div style={{ display:'flex', gap:8 }}>
                        <input className="pd-input" type="number" min="0" style={{...inputStyle,flex:1}} placeholder="e.g. 2000" value={site.roof_area} onChange={e=>setSite(s=>({...s,roof_area:e.target.value}))} />
                        <select className="pd-input" style={{...inputStyle,width:'auto'}} value={site.roof_area_unit} onChange={e=>setSite(s=>({...s,roof_area_unit:e.target.value}))}>
                          <option value="sqft">sq ft</option>
                          <option value="sqm">sq m</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>No. of Storeys</label>
                      <input className="pd-input" type="number" min="1" style={inputStyle} placeholder="e.g. 2" value={site.storeys} onChange={e=>setSite(s=>({...s,storeys:e.target.value}))} />
                    </div>
                  </div>

                  <label style={{ ...labelStyle, marginBottom:'0.75rem' }}>Soil Type *</label>
                  <div className="pd-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem', marginBottom:'1.25rem' }}>
                    {SOIL_TYPES.map(t=>(
                      <SelectCard key={t.id} selected={site.soil_type===t.id} onClick={()=>setSite(s=>({...s,soil_type:t.id}))} iconEmoji={t.icon} label={t.label} desc={t.desc} />
                    ))}
                  </div>

                  <label style={{ ...labelStyle, marginBottom:'0.75rem' }}>Weather Zone *</label>
                  <div className="pd-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem', marginBottom:'1.25rem' }}>
                    {WEATHER_ZONES.map(z=>(
                      <SelectCard key={z.id} selected={site.weather_zone===z.id} onClick={()=>setSite(s=>({...s,weather_zone:z.id}))} iconEmoji={z.icon} label={z.label} desc={z.desc} />
                    ))}
                  </div>

                  <div>
                    <label style={labelStyle}>Additional Notes</label>
                    <textarea className="pd-input" style={{...inputStyle,minHeight:80,resize:'vertical'}} placeholder="Existing water source, rainwater pit, specific requirements…" value={site.notes} onChange={e=>setSite(s=>({...s,notes:e.target.value}))} />
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: Blueprint ── */}
              {step === 2 && (
                <motion.div key="bp" initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-24 }} transition={{ duration:0.25 }}>
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text)' }}>Upload a Blueprint</h2>
                  <p style={{ fontSize:'var(--text-sm)', color:'var(--color-text-muted)', marginBottom:'1.5rem' }}>Optional but recommended. PDF, DWG, or image of your site plan.</p>
                  <input ref={fileRef} type="file" accept=".pdf,.dwg,.jpg,.jpeg,.png" style={{ display:'none' }} onChange={handleFile} />
                  <button
                    onClick={()=>fileRef.current?.click()}
                    style={{
                      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                      gap:'0.75rem', width:'100%', minHeight:160,
                      border:`2px dashed ${blueprint.file ? BLUE_MID : 'var(--color-border)'}`,
                      borderRadius:'var(--radius-lg)',
                      background: blueprint.file ? BLUE_BG : 'var(--color-surface-offset)',
                      cursor:'pointer', transition:'all 150ms',
                    }}
                  >
                    <FileUp size={28} color={blueprint.file ? BLUE_MID : 'var(--color-text-faint)'} />
                    <span style={{ fontSize:'var(--text-sm)', fontWeight:600, color: blueprint.file ? BLUE_MID : 'var(--color-text-muted)' }}>
                      {blueprint.fileName || 'Click to upload site plan / blueprint'}
                    </span>
                    {!blueprint.file && <span style={{ fontSize:'var(--text-xs)', color:'var(--color-text-faint)' }}>PDF · DWG · JPG · PNG — max 20 MB</span>}
                  </button>
                </motion.div>
              )}

              {/* ── STEP 3: Contact ── */}
              {step === 3 && (
                <motion.div key="contact" initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-24 }} transition={{ duration:0.25 }}>
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text)' }}>Contact Details</h2>
                  <div className="pd-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input className="pd-input" style={inputStyle} placeholder="Your name" value={contact.name} onChange={e=>setContact(c=>({...c,name:e.target.value}))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone *</label>
                      <input className="pd-input" type="tel" style={inputStyle} placeholder="+91 98765 43210" value={contact.phone} onChange={e=>setContact(c=>({...c,phone:e.target.value}))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Email *</label>
                      <input className="pd-input" type="email" style={inputStyle} placeholder="you@email.com" value={contact.email} onChange={e=>setContact(c=>({...c,email:e.target.value}))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Preferred Contact</label>
                      <select className="pd-input" style={inputStyle} value={contact.preferred} onChange={e=>setContact(c=>({...c,preferred:e.target.value}))}>
                        <option value="">Any</option>
                        <option value="phone">Phone call</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="email">Email</option>
                      </select>
                    </div>
                  </div>
                  {error && <p style={{ color:'var(--color-error)', fontSize:'var(--text-sm)', marginBottom:'0.75rem' }}>{error}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Navigation buttons ── */}
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:'2rem', gap:'1rem' }}>
              {step > 0
                ? <button className="pd-prev" onClick={()=>setStep(s=>s-1)} style={{ display:'flex', alignItems:'center', gap:6, padding:'0.65rem 1.25rem', borderRadius:'var(--radius-md)', background:'var(--color-surface-offset)', border:'1px solid var(--color-border)', fontSize:'var(--text-sm)', fontWeight:700, cursor:'pointer', color:'var(--color-text-muted)', transition:'all 150ms' }}><ArrowLeft size={14}/> Back</button>
                : <div />
              }
              {step < STEPS.length - 1
                ? <button className="pd-next" disabled={!canNext[step]} onClick={()=>setStep(s=>s+1)} style={{ display:'flex', alignItems:'center', gap:6, padding:'0.65rem 1.5rem', borderRadius:'var(--radius-md)', background: canNext[step] ? BLUE_MID : 'var(--color-surface-offset)', border:'none', color: canNext[step] ? '#fff' : 'var(--color-text-faint)', fontSize:'var(--text-sm)', fontWeight:700, cursor: canNext[step] ? 'pointer' : 'not-allowed', transition:'all 150ms' }}>Next <ArrowRight size={14}/></button>
                : <button className="pd-next" disabled={!canNext[step] || busy} onClick={handleSubmit} style={{ display:'flex', alignItems:'center', gap:6, padding:'0.65rem 1.75rem', borderRadius:'var(--radius-md)', background: canNext[step] ? BLUE_MID : 'var(--color-surface-offset)', border:'none', color: canNext[step] ? '#fff' : 'var(--color-text-faint)', fontSize:'var(--text-sm)', fontWeight:700, cursor: canNext[step] ? 'pointer' : 'not-allowed', transition:'all 150ms' }}>
                    {busy ? <><Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/> Submitting…</> : <>Submit Request <ArrowRight size={14}/></>}
                  </button>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
