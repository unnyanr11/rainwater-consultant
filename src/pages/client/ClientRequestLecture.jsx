import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Users, Calendar, User,
  CheckCircle2, ArrowRight, ArrowLeft, Loader2,
  Mic, GraduationCap, Building2, Leaf, Droplets, Wrench
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'

// ─── Blue palette ────────────────────────────────────────────────
const BLUE_DARK   = '#074a7e'
const BLUE_MID    = '#0b6fb8'
const BLUE_BG     = 'rgba(11,111,184,0.07)'
const BLUE_BORDER = 'rgba(11,111,184,0.20)'

// ─── constants ────────────────────────────────────────────────
const LECTURE_TOPICS = [
  { id: 'basics',       label: 'Rainwater Harvesting Basics',    icon: Droplets,     desc: 'Introduction to RWH principles & benefits' },
  { id: 'design',       label: 'System Design & Sizing',         icon: Wrench,       desc: 'How to design a system for your property' },
  { id: 'sustainability', label: 'Sustainability & Environment', icon: Leaf,         desc: 'Ecological impact and sustainable practices' },
  { id: 'urban',        label: 'Urban Water Management',         icon: Building2,    desc: 'RWH in cities, apartments & commercial spaces' },
  { id: 'policy',       label: 'Policy & Regulations',           icon: BookOpen,     desc: 'Government guidelines, incentives & compliance' },
  { id: 'custom',       label: 'Custom / Other Topic',           icon: Mic,          desc: 'Specify your own topic or combination' },
]

const AUDIENCE_TYPES = [
  { id: 'students',     label: 'Students',          icon: '🎓', desc: 'School, college or university students' },
  { id: 'residents',    label: 'Residents / RWA',   icon: '🏘️', desc: 'Apartment society or residential community' },
  { id: 'corporate',    label: 'Corporate Team',    icon: '🏢', desc: 'Office or company employees' },
  { id: 'ngo',          label: 'NGO / Community',   icon: '🤝', desc: 'Non-profit, village or community group' },
  { id: 'government',   label: 'Government Body',   icon: '🏛️', desc: 'Municipal, panchayat or govt. dept.' },
  { id: 'other',        label: 'Other',             icon: '👥', desc: 'Any other type of audience' },
]

const FORMAT_OPTIONS = [
  { id: 'in_person',  label: 'In-Person',   icon: '🏫', desc: 'At your venue or our training centre' },
  { id: 'online',     label: 'Online',      icon: '💻', desc: 'Video call — Zoom, Google Meet, Teams' },
  { id: 'hybrid',     label: 'Hybrid',      icon: '🔀', desc: 'Partial in-person, partial online' },
]

const STEPS = [
  { id: 'topic',    label: 'Topic',    icon: BookOpen },
  { id: 'audience', label: 'Audience', icon: Users },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'contact',  label: 'Contact',  icon: User },
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

export default function ClientRequestLecture() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [step, setStep]   = useState(0)
  const [done, setDone]   = useState(false)
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState('')

  const [topic, setTopic] = useState({
    topic_id:    '',
    custom_topic: '',
    description: '',
  })

  const [audience, setAudience] = useState({
    audience_type: '',
    audience_size: '',
    format:        '',
    organisation:  '',
  })

  const [schedule, setSchedule] = useState({
    preferred_date:  '',
    alt_date:        '',
    duration:        '',
    location:        '',
    online_platform: '',
  })

  const [contact, setContact] = useState({
    name:      user?.user_metadata?.full_name || '',
    phone:     '',
    email:     user?.email || '',
    preferred: '',
  })

  // ── validation per step ──
  const canNext = [
    !!topic.topic_id && (topic.topic_id !== 'custom' || topic.custom_topic.trim()),
    !!audience.audience_type && !!audience.format,
    !!schedule.preferred_date && !!schedule.duration,
    !!(contact.name && contact.phone && contact.email),
  ]

  const handleSubmit = async () => {
    setBusy(true); setError('')
    try {
      const payload = {
        user_id:          user?.id ?? null,
        topic_id:         topic.topic_id,
        custom_topic:     topic.custom_topic || null,
        description:      topic.description || null,
        audience_type:    audience.audience_type,
        audience_size:    audience.audience_size ? parseInt(audience.audience_size) : null,
        format:           audience.format,
        organisation:     audience.organisation || null,
        preferred_date:   schedule.preferred_date,
        alt_date:         schedule.alt_date || null,
        duration:         schedule.duration,
        location:         schedule.location || null,
        online_platform:  schedule.online_platform || null,
        contact_name:     contact.name,
        contact_phone:    contact.phone,
        contact_email:    contact.email,
        preferred_contact: contact.preferred || null,
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
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .rl-input:focus { border-color: ${BLUE_MID} !important; box-shadow: 0 0 0 3px rgba(11,111,184,0.14); }
        .rl-input::placeholder { color: var(--color-text-faint); }
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
            Lecture Request Submitted!
          </h2>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
            Our team will review your request and get back to you within <strong>2–3 business days</strong> to confirm the details.
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
        @keyframes spin { to { transform: rotate(360deg); } }
        .rl-input:focus { border-color: ${BLUE_MID} !important; box-shadow: 0 0 0 3px rgba(11,111,184,0.14); }
        .rl-input::placeholder { color: var(--color-text-faint); }
        .rl-next:hover:not(:disabled) { opacity: 0.88; }
        .rl-next:disabled { opacity: 0.45; cursor: not-allowed; }
        .rl-prev:hover { background: var(--color-surface-offset) !important; }
        @media (max-width: 600px) { .rl-grid2 { grid-template-columns: 1fr !important; } }
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
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                fontSize: 'var(--text-xs)', fontWeight: 700, color: '#fff',
              }}>
                <GraduationCap size={12} /> Expert-Led Lecture · Free Consultation
              </div>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,3vw,2.25rem)',
              fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: '0.75rem',
            }}>
              Request a Lecture
            </h1>
            <p style={{ fontSize: 'var(--text-base)', color: 'rgba(255,255,255,0.80)', maxWidth: '52ch', lineHeight: 1.7 }}>
              Book an expert-led session on rainwater harvesting for your school, community, workplace, or organisation.
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

              {/* ── STEP 0: Topic ── */}
              {step === 0 && (
                <motion.div key="topic" initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-24 }} transition={{ duration:0.25 }}>
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text)' }}>What topic would you like covered?</h2>

                  <div className="rl-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem', marginBottom:'1.25rem' }}>
                    {LECTURE_TOPICS.map(t => (
                      <SelectCard
                        key={t.id}
                        selected={topic.topic_id === t.id}
                        onClick={() => setTopic(v => ({ ...v, topic_id: t.id }))}
                        icon={t.icon}
                        label={t.label}
                        desc={t.desc}
                      />
                    ))}
                  </div>

                  {topic.topic_id === 'custom' && (
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={labelStyle}>Your Topic *</label>
                      <input
                        className="rl-input"
                        style={inputStyle}
                        placeholder="e.g. Rooftop harvesting for apartments"
                        value={topic.custom_topic}
                        onChange={e => setTopic(v => ({ ...v, custom_topic: e.target.value }))}
                      />
                    </div>
                  )}

                  <div>
                    <label style={labelStyle}>Additional Details / Specific Questions</label>
                    <textarea
                      className="rl-input"
                      style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                      placeholder="Any specific subtopics, questions, or learning goals you'd like addressed…"
                      value={topic.description}
                      onChange={e => setTopic(v => ({ ...v, description: e.target.value }))}
                    />
                  </div>
                </motion.div>
              )}

              {/* ── STEP 1: Audience ── */}
              {step === 1 && (
                <motion.div key="audience" initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-24 }} transition={{ duration:0.25 }}>
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text)' }}>Tell us about your audience</h2>

                  <label style={{ ...labelStyle, marginBottom: '0.75rem' }}>Audience Type *</label>
                  <div className="rl-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem', marginBottom:'1.25rem' }}>
                    {AUDIENCE_TYPES.map(a => (
                      <SelectCard
                        key={a.id}
                        selected={audience.audience_type === a.id}
                        onClick={() => setAudience(v => ({ ...v, audience_type: a.id }))}
                        iconEmoji={a.icon}
                        label={a.label}
                        desc={a.desc}
                      />
                    ))}
                  </div>

                  <label style={{ ...labelStyle, marginBottom: '0.75rem' }}>Preferred Format *</label>
                  <div className="rl-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem', marginBottom:'1.25rem' }}>
                    {FORMAT_OPTIONS.map(f => (
                      <SelectCard
                        key={f.id}
                        selected={audience.format === f.id}
                        onClick={() => setAudience(v => ({ ...v, format: f.id }))}
                        iconEmoji={f.icon}
                        label={f.label}
                        desc={f.desc}
                      />
                    ))}
                  </div>

                  <div className="rl-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                    <div>
                      <label style={labelStyle}>Expected Audience Size</label>
                      <input
                        className="rl-input"
                        type="number" min="1"
                        style={inputStyle}
                        placeholder="e.g. 50"
                        value={audience.audience_size}
                        onChange={e => setAudience(v => ({ ...v, audience_size: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Organisation / Institution Name</label>
                      <input
                        className="rl-input"
                        style={inputStyle}
                        placeholder="e.g. Green Valley School"
                        value={audience.organisation}
                        onChange={e => setAudience(v => ({ ...v, organisation: e.target.value }))}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: Schedule ── */}
              {step === 2 && (
                <motion.div key="schedule" initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-24 }} transition={{ duration:0.25 }}>
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text)' }}>When and where?</h2>

                  <div className="rl-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                    <div>
                      <label style={labelStyle}>Preferred Date *</label>
                      <input
                        className="rl-input"
                        type="date"
                        style={inputStyle}
                        value={schedule.preferred_date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setSchedule(v => ({ ...v, preferred_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Alternate Date</label>
                      <input
                        className="rl-input"
                        type="date"
                        style={inputStyle}
                        value={schedule.alt_date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setSchedule(v => ({ ...v, alt_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Duration *</label>
                      <select
                        className="rl-input"
                        style={inputStyle}
                        value={schedule.duration}
                        onChange={e => setSchedule(v => ({ ...v, duration: e.target.value }))}
                      >
                        <option value="">Select duration</option>
                        <option value="30min">30 minutes</option>
                        <option value="1hr">1 hour</option>
                        <option value="1.5hr">1.5 hours</option>
                        <option value="2hr">2 hours</option>
                        <option value="half_day">Half day (3–4 hrs)</option>
                        <option value="full_day">Full day workshop</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>
                        {audience.format === 'online' || audience.format === 'hybrid' ? 'Preferred Online Platform' : 'Venue / Location'}
                      </label>
                      <input
                        className="rl-input"
                        style={inputStyle}
                        placeholder={audience.format === 'online' ? 'e.g. Zoom, Google Meet' : 'e.g. Conference Hall, Bengaluru'}
                        value={audience.format === 'online' ? schedule.online_platform : schedule.location}
                        onChange={e =>
                          audience.format === 'online'
                            ? setSchedule(v => ({ ...v, online_platform: e.target.value }))
                            : setSchedule(v => ({ ...v, location: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Contact ── */}
              {step === 3 && (
                <motion.div key="contact" initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-24 }} transition={{ duration:0.25 }}>
                  <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--color-text)' }}>Your Contact Details</h2>
                  <div className="rl-grid2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input className="rl-input" style={inputStyle} placeholder="Your name" value={contact.name} onChange={e => setContact(c => ({ ...c, name: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone *</label>
                      <input className="rl-input" type="tel" style={inputStyle} placeholder="+91 98765 43210" value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Email *</label>
                      <input className="rl-input" type="email" style={inputStyle} placeholder="you@email.com" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} />
                    </div>
                    <div>
                      <label style={labelStyle}>Preferred Contact Method</label>
                      <select className="rl-input" style={inputStyle} value={contact.preferred} onChange={e => setContact(c => ({ ...c, preferred: e.target.value }))}>
                        <option value="">Any</option>
                        <option value="phone">Phone call</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="email">Email</option>
                      </select>
                    </div>
                  </div>
                  {error && <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)', marginBottom: '0.75rem' }}>{error}</p>}
                </motion.div>
              )}

            </AnimatePresence>

            {/* ── Navigation buttons ── */}
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:'2rem', gap:'1rem' }}>
              {step > 0
                ? <button className="rl-prev" onClick={() => setStep(s => s - 1)} style={{ display:'flex', alignItems:'center', gap:6, padding:'0.65rem 1.25rem', borderRadius:'var(--radius-md)', background:'var(--color-surface-offset)', border:'1px solid var(--color-border)', fontSize:'var(--text-sm)', fontWeight:700, cursor:'pointer', color:'var(--color-text-muted)', transition:'all 150ms' }}><ArrowLeft size={14}/> Back</button>
                : <div />
              }
              {step < STEPS.length - 1
                ? <button className="rl-next" disabled={!canNext[step]} onClick={() => setStep(s => s + 1)} style={{ display:'flex', alignItems:'center', gap:6, padding:'0.65rem 1.5rem', borderRadius:'var(--radius-md)', background: canNext[step] ? BLUE_MID : 'var(--color-surface-offset)', border:'none', color: canNext[step] ? '#fff' : 'var(--color-text-faint)', fontSize:'var(--text-sm)', fontWeight:700, cursor: canNext[step] ? 'pointer' : 'not-allowed', transition:'all 150ms' }}>Next <ArrowRight size={14}/></button>
                : <button className="rl-next" disabled={!canNext[step] || busy} onClick={handleSubmit} style={{ display:'flex', alignItems:'center', gap:6, padding:'0.65rem 1.75rem', borderRadius:'var(--radius-md)', background: canNext[step] ? BLUE_MID : 'var(--color-surface-offset)', border:'none', color: canNext[step] ? '#fff' : 'var(--color-text-faint)', fontSize:'var(--text-sm)', fontWeight:700, cursor: canNext[step] ? 'pointer' : 'not-allowed', transition:'all 150ms' }}>
                    {busy ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/> Submitting…</> : <>Submit Request <ArrowRight size={14}/></>}
                  </button>
              }
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
