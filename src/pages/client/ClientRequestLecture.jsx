import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Users, MapPin, Calendar,
  CheckCircle2, ArrowRight, ArrowLeft, Loader2,
  GraduationCap, Building2, Home, Layers, TreePine, Mic
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'

const BLUE_DARK   = '#074a7e'
const BLUE_MID    = '#0b6fb8'
const BLUE_BG     = 'rgba(11,111,184,0.07)'
const BLUE_BORDER = 'rgba(11,111,184,0.20)'

const TOPICS = [
  { id: 'rainwater_basics',    label: 'Rainwater Harvesting Basics',   icon: '💧', desc: 'Introduction to RWH concepts & benefits' },
  { id: 'rooftop_systems',     label: 'Rooftop Collection Systems',     icon: '🏠', desc: 'Design and setup of rooftop systems' },
  { id: 'groundwater_recharge',label: 'Groundwater Recharge',          icon: '🌱', desc: 'Recharge pits, percolation tanks' },
  { id: 'urban_water_mgmt',    label: 'Urban Water Management',        icon: '🏙️', desc: 'Large-scale urban RWH strategies' },
  { id: 'policy_regulations',  label: 'Policy & Regulations',          icon: '📜', desc: 'Government mandates and compliance' },
  { id: 'case_studies',        label: 'Case Studies & Success Stories', icon: '📊', desc: 'Real-world implementations and results' },
]

const AUDIENCE_TYPES = [
  { id: 'school',        label: 'School Students',    icon: GraduationCap, desc: 'Classes 6–12' },
  { id: 'college',       label: 'College / University', icon: BookOpen,      desc: 'Undergraduate / postgraduate' },
  { id: 'corporate',     label: 'Corporate / Office',  icon: Building2,     desc: 'Employees and management' },
  { id: 'community',     label: 'Community / RWA',     icon: Home,          desc: 'Resident welfare associations' },
  { id: 'ngo',           label: 'NGO / Non-profit',    icon: TreePine,      desc: 'Social and environmental orgs' },
  { id: 'government',    label: 'Government Body',     icon: Layers,        desc: 'Municipal or govt. departments' },
]

const FORMATS = [
  { id: 'in_person', label: 'In-Person',   icon: '🏛️', desc: 'On-site at your venue' },
  { id: 'online',    label: 'Online / Virtual', icon: '💻', desc: 'Zoom, Meet, or Teams' },
  { id: 'hybrid',    label: 'Hybrid',      icon: '🔀', desc: 'Mix of in-person and online' },
]

const STEPS = [
  { id: 'topic',    label: 'Topic',    icon: BookOpen },
  { id: 'audience', label: 'Audience', icon: Users },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'contact',  label: 'Contact',  icon: Mic },
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
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        padding: '0.9rem 1rem',
        borderRadius: 'var(--radius-md)',
        border: `1.5px solid ${selected ? BLUE_MID : 'var(--color-border)'}`,
        background: selected ? BLUE_BG : 'var(--color-bg)',
        cursor: 'pointer', textAlign: 'left', width: '100%',
        transition: 'all 150ms',
      }}
    >
      <span style={{ fontSize: '1.25rem', lineHeight: 1.2, flexShrink: 0 }}>
        {iconEmoji || (Icon && <Icon size={18} color={selected ? BLUE_MID : 'var(--color-text-muted)'} />)}
      </span>
      <span>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: selected ? BLUE_MID : 'var(--color-text)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{desc}</div>
      </span>
    </button>
  )
}

function StepBar({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
      {STEPS.map((s, i) => {
        const done   = i < current
        const active = i === current
        const SIcon  = s.icon
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
              transition: 'all 250ms', whiteSpace: 'nowrap',
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

export default function ClientRequestLecture() {
  const navigate = useNavigate()
  const { user }  = useAuth()

  const [step,  setStep]  = useState(0)
  const [done,  setDone]  = useState(false)
  const [busy,  setBusy]  = useState(false)
  const [error, setError] = useState('')

  const [topic, setTopic] = useState({
    topic_id:    '',
    custom_topic: '',
    duration:    '60',
    format:      '',
  })

  const [audience, setAudience] = useState({
    audience_type: '',
    org_name:      '',
    city:          '',
    attendees:     '',
  })

  const [schedule, setSchedule] = useState({
    preferred_date:  '',
    alternate_date:  '',
    preferred_time:  '',
    venue:           '',
    online_platform: '',
  })

  const [contact, setContact] = useState({
    name:      user?.user_metadata?.full_name || '',
    phone:     '',
    email:     user?.email || '',
    message:   '',
  })

  const canNext = [
    topic.topic_id && topic.format,
    audience.audience_type && audience.org_name && audience.city,
    schedule.preferred_date && schedule.preferred_time,
    contact.name && contact.phone && contact.email,
  ]

  const handleSubmit = async () => {
    setBusy(true); setError('')
    try {
      const payload = {
        user_id:          user?.id ?? null,
        topic_id:         topic.topic_id,
        custom_topic:     topic.custom_topic,
        duration_mins:    parseInt(topic.duration),
        format:           topic.format,
        audience_type:    audience.audience_type,
        org_name:         audience.org_name,
        city:             audience.city,
        attendees:        audience.attendees ? parseInt(audience.attendees) : null,
        preferred_date:   schedule.preferred_date,
        alternate_date:   schedule.alternate_date || null,
        preferred_time:   schedule.preferred_time,
        venue:            schedule.venue,
        online_platform:  schedule.online_platform,
        contact_name:     contact.name,
        contact_phone:    contact.phone,
        contact_email:    contact.email,
        message:          contact.message,
        status:           'pending',
      }
      const { error: dbErr } = await supabase.from('lecture_requests').insert([payload])
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
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', maxWidth: 480 }}
        >
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: BLUE_BG, border: `2px solid ${BLUE_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)' }}>
            <CheckCircle2 size={36} color={BLUE_MID} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--space-3)', color: 'var(--color-text)' }}>Lecture Request Submitted!</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 'var(--space-6)' }}>
            Our team will review your request and get back to you within <strong>2–3 business days</strong> to confirm availability and details.
          </p>
          <button
            onClick={() => navigate('/client')}
            style={{ padding: '0.75rem 2rem', borderRadius: 'var(--radius-md)', background: BLUE_MID, color: '#fff', border: 'none', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer' }}
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
        .rl-input:focus { border-color: ${BLUE_MID} !important; box-shadow: 0 0 0 3px rgba(11,111,184,0.14); }
        .rl-input::placeholder { color: var(--color-text-faint); }
        .rl-next:hover:not(:disabled) { opacity: 0.88; }
        .rl-next:disabled { opacity: 0.45; cursor: not-allowed; }
        .rl-prev:hover { background: var(--color-surface-offset) !important; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @media (max-width: 600px) { .rl-grid2 { grid-template-columns: 1fr !important; } }
      `}</style>

      <div>
        {/* Hero */}
        <div style={{
          background: `linear-gradient(135deg, ${BLUE_MID} 0%, ${BLUE_DARK} 100%)`,
          padding: 'clamp(2rem,4vw,3rem) 1.5rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-8)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: 280, height: 280, borderRadius: '50%', border: '40px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 640, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', fontSize: 'var(--text-xs)', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
              <Mic size={11} /> Expert-led · Free Consultation
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: '0.75rem' }}>
              Request a Lecture
            </h1>
            <p style={{ fontSize: 'var(--text-base)', color: 'rgba(255,255,255,0.80)', maxWidth: '52ch', lineHeight: 1.7 }}>
              Book an expert session on rainwater harvesting for your school, college, organisation, or community — in-person or online.
            </p>
          </div>
        </div>

        {/* Form */}
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: 'clamp(1.5rem,4vw,2.5rem)', boxShadow: 'var(--shadow-md)' }}>
            <StepBar current={step} />

            <AnimatePresence mode="wait">

              {/* STEP 0 — Topic */}
              {step === 0 && (
                <motion.div key="topic" initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-24 }} transition={{ duration:0.25 }}>
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text)' }}>What topic do you need?</h2>

                  <label style={{ ...labelStyle, marginBottom: '0.75rem' }}>Select a Topic *</label>
                  <div className="rl-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    {TOPICS.map(t => (
                      <SelectCard key={t.id} selected={topic.topic_id === t.id} onClick={() => setTopic(p => ({ ...p, topic_id: t.id }))} iconEmoji={t.icon} label={t.label} desc={t.desc} />
                    ))}
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={labelStyle}>Custom Topic / Specific Focus</label>
                    <input className="rl-input" style={inputStyle} placeholder="e.g. Rooftop RWH for apartments in Chennai…" value={topic.custom_topic} onChange={e => setTopic(p => ({ ...p, custom_topic: e.target.value }))} />
                  </div>

                  <div className="rl-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div>
                      <label style={labelStyle}>Duration *</label>
                      <select className="rl-input" style={inputStyle} value={topic.duration} onChange={e => setTopic(p => ({ ...p, duration: e.target.value }))}>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                        <option value="180">Half day (3 hrs)</option>
                        <option value="360">Full day (6 hrs)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ ...labelStyle, marginBottom: '0.75rem' }}>Format *</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {FORMATS.map(f => (
                          <button key={f.id} onClick={() => setTopic(p => ({ ...p, format: f.id }))} style={{ flex: 1, padding: '0.55rem 0.4rem', borderRadius: 'var(--radius-md)', border: `1.5px solid ${topic.format === f.id ? BLUE_MID : 'var(--color-border)'}`, background: topic.format === f.id ? BLUE_BG : 'var(--color-bg)', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 700, color: topic.format === f.id ? BLUE_MID : 'var(--color-text-muted)', transition: 'all 150ms', textAlign: 'center' }}>
                            <div style={{ fontSize: '1rem', marginBottom: 2 }}>{f.icon}</div>
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 1 — Audience */}
              {step === 1 && (
                <motion.div key="audience" initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-24 }} transition={{ duration:0.25 }}>
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text)' }}>Who is the audience?</h2>

                  <label style={{ ...labelStyle, marginBottom: '0.75rem' }}>Audience Type *</label>
                  <div className="rl-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    {AUDIENCE_TYPES.map(a => (
                      <SelectCard key={a.id} selected={audience.audience_type === a.id} onClick={() => setAudience(p => ({ ...p, audience_type: a.id }))} icon={a.icon} label={a.label} desc={a.desc} />
                    ))}
                  </div>

                  <div className="rl-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Organisation / Institution Name *</label>
                      <input className="rl-input" style={inputStyle} placeholder="e.g. St. Joseph's College" value={audience.org_name} onChange={e => setAudience(p => ({ ...p, org_name: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>City *</label>
                      <input className="rl-input" style={inputStyle} placeholder="e.g. Bengaluru" value={audience.city} onChange={e => setAudience(p => ({ ...p, city: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Expected Attendees</label>
                      <input className="rl-input" type="number" min="1" style={inputStyle} placeholder="e.g. 80" value={audience.attendees} onChange={e => setAudience(p => ({ ...p, attendees: e.target.value }))} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 — Schedule */}
              {step === 2 && (
                <motion.div key="schedule" initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-24 }} transition={{ duration:0.25 }}>
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text)' }}>When & Where?</h2>

                  <div className="rl-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Preferred Date *</label>
                      <input className="rl-input" type="date" style={inputStyle} value={schedule.preferred_date} onChange={e => setSchedule(p => ({ ...p, preferred_date: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Alternate Date</label>
                      <input className="rl-input" type="date" style={inputStyle} value={schedule.alternate_date} onChange={e => setSchedule(p => ({ ...p, alternate_date: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Preferred Time *</label>
                      <input className="rl-input" type="time" style={inputStyle} value={schedule.preferred_time} onChange={e => setSchedule(p => ({ ...p, preferred_time: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Venue / Address</label>
                      <input className="rl-input" style={inputStyle} placeholder="Hall name, building, address" value={schedule.venue} onChange={e => setSchedule(p => ({ ...p, venue: e.target.value }))} />
                    </div>
                  </div>

                  {(topic.format === 'online' || topic.format === 'hybrid') && (
                    <div>
                      <label style={labelStyle}>Online Platform</label>
                      <select className="rl-input" style={inputStyle} value={schedule.online_platform} onChange={e => setSchedule(p => ({ ...p, online_platform: e.target.value }))}>
                        <option value="">Select platform…</option>
                        <option value="zoom">Zoom</option>
                        <option value="google_meet">Google Meet</option>
                        <option value="ms_teams">Microsoft Teams</option>
                        <option value="webex">Webex</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 3 — Contact */}
              {step === 3 && (
                <motion.div key="contact" initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-24 }} transition={{ duration:0.25 }}>
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text)' }}>Your Contact Details</h2>

                  <div className="rl-grid2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input className="rl-input" style={inputStyle} placeholder="Your name" value={contact.name} onChange={e => setContact(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone *</label>
                      <input className="rl-input" type="tel" style={inputStyle} placeholder="+91 98765 43210" value={contact.phone} onChange={e => setContact(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Email *</label>
                      <input className="rl-input" type="email" style={inputStyle} placeholder="you@email.com" value={contact.email} onChange={e => setContact(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Additional Message</label>
                      <textarea className="rl-input" style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Any specific requirements, questions, or context…" value={contact.message} onChange={e => setContact(p => ({ ...p, message: e.target.value }))} />
                    </div>
                  </div>

                  {error && <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)', marginBottom: '0.75rem' }}>{error}</p>}
                </motion.div>
              )}

            </AnimatePresence>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '1rem' }}>
              {step > 0
                ? <button className="rl-prev" onClick={() => setStep(s => s - 1)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-offset)', border: '1px solid var(--color-border)', fontSize: 'var(--text-sm)', fontWeight: 700, cursor: 'pointer', color: 'var(--color-text-muted)', transition: 'all 150ms' }}><ArrowLeft size={14} /> Back</button>
                : <div />
              }
              {step < STEPS.length - 1
                ? <button className="rl-next" disabled={!canNext[step]} onClick={() => setStep(s => s + 1)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.65rem 1.5rem', borderRadius: 'var(--radius-md)', background: canNext[step] ? BLUE_MID : 'var(--color-surface-offset)', border: 'none', color: canNext[step] ? '#fff' : 'var(--color-text-faint)', fontSize: 'var(--text-sm)', fontWeight: 700, cursor: canNext[step] ? 'pointer' : 'not-allowed', transition: 'all 150ms' }}>Next <ArrowRight size={14} /></button>
                : <button className="rl-next" disabled={!canNext[step] || busy} onClick={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.65rem 1.75rem', borderRadius: 'var(--radius-md)', background: canNext[step] ? BLUE_MID : 'var(--color-surface-offset)', border: 'none', color: canNext[step] ? '#fff' : 'var(--color-text-faint)', fontSize: 'var(--text-sm)', fontWeight: 700, cursor: canNext[step] ? 'pointer' : 'not-allowed', transition: 'all 150ms' }}>
                    {busy ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</> : <>Submit Request <ArrowRight size={14} /></>}
                  </button>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
