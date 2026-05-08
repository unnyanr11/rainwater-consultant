import { useState } from 'react'
import RevealBlock from '../motion/RevealBlock'

const AUDIENCE = [
  'School / College',
  'Corporate / Industry',
  'Residential Society',
  'NGO / Government Body',
  'Other',
]

export default function BookLectureSection() {
  const [form, setForm] = useState({
    name: '', org: '', email: '', phone: '',
    audience: '', date: '', message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); setSubmitted(true) }, 1200)
  }

  const sectionStyle = {
    padding: 'clamp(3rem, 6vw, 6rem) clamp(1rem, 4vw, 2rem)',
    background: 'var(--color-surface)',
    borderTop: '1px solid var(--color-border)',
  }

  const innerStyle = {
    maxWidth: '960px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(420px, 100%), 1fr))',
    gap: 'clamp(2rem, 4vw, 4rem)',
    alignItems: 'start',
  }

  const labelStyle = {
    display: 'block',
    fontSize: 'var(--text-sm)',
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: '0.35rem',
  }

  const inputStyle = {
    width: '100%',
    padding: '0.65rem 0.85rem',
    fontSize: 'var(--text-sm)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
    outline: 'none',
    transition: 'border-color 180ms ease, box-shadow 180ms ease',
  }

  const fieldStyle = { marginBottom: '1.1rem' }

  const noticeStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    padding: '0.75rem 1rem',
    background: 'var(--color-primary-highlight)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '1.25rem',
  }

  return (
    <section id="book-lecture" style={sectionStyle}>
      <style>{`
        .lecture-input:focus {
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 3px oklch(from var(--color-primary) l c h / 0.15);
        }
        .lecture-input::placeholder { color: var(--color-text-faint); }
        .lecture-submit:hover { background: var(--color-primary-hover) !important; }
        .lecture-submit:active { background: var(--color-primary-active) !important; }
        .lecture-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        @media (max-width: 600px) {
          .lecture-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={innerStyle}>

        {/* Left — info panel */}
        <RevealBlock>
          <div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: 'var(--color-primary)',
              marginBottom: '1rem',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
              Book a Lecture
            </span>

            <h2 style={{
              fontSize: 'var(--text-2xl)', fontWeight: 800,
              lineHeight: 1.15, color: 'var(--color-text)',
              marginBottom: '1rem',
            }}>
              Bring rainwater expertise<br />
              <span style={{ color: 'var(--color-primary)' }}>to your audience</span>
            </h2>

            <p style={{
              fontSize: 'var(--text-base)', color: 'var(--color-text-muted)',
              lineHeight: 1.7, maxWidth: '42ch', marginBottom: '1.8rem',
            }}>
              We conduct awareness sessions, technical workshops, and hands-on training
              on rainwater harvesting — for schools, colleges, corporates, RWAs, and government bodies.
            </p>

            {/* Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.6rem' }}>
              {[
                { icon: '🎓', text: 'Tailored for all audiences — beginner to expert' },
                { icon: '📍', text: 'On-site or virtual delivery available' },
                { icon: '📋', text: 'Certificate of participation on request' },
                { icon: '🌧️', text: 'Live demos with real calculation walkthroughs' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.1rem', marginTop: '0.05rem' }}>{icon}</span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Travel & Arrangements notice */}
            <div style={{
              padding: '1rem 1.1rem',
              background: 'var(--color-surface-offset)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
            }}>
              <p style={{
                fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: 'var(--color-text-muted)',
                marginBottom: '0.6rem',
              }}>Please note</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { icon: '✈️', text: 'Travel expenses to and from the venue are to be borne by the hosting organisation or individual.' },
                  { icon: '🏛️', text: 'The host is responsible for arranging the venue, seating, projection equipment, and any other logistics required for the session.' },
                ].map(({ icon, text }) => (
                  <div key={icon} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem' }}>
                    <span style={{ fontSize: '1rem', marginTop: '0.05rem', flexShrink: 0 }}>{icon}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealBlock>

        {/* Right — form */}
        <RevealBlock delay={0.1}>
          {submitted ? (
            <div style={{
              textAlign: 'center', padding: '3rem 2rem',
              background: 'var(--color-bg)', borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-primary-highlight)',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                Request received!
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', maxWidth: '34ch', margin: '0 auto' }}>
                We'll review your request and get back to you within 24 hours to confirm the date and details.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                background: 'var(--color-bg)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                padding: 'clamp(1.5rem, 3vw, 2rem)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {/* Row: Name + Org */}
              <div className="lecture-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <div style={fieldStyle}>
                  <label style={labelStyle} htmlFor="lec-name">Your Name *</label>
                  <input id="lec-name" name="name" required className="lecture-input"
                    placeholder="Ramesh Kumar" value={form.name} onChange={handleChange} style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle} htmlFor="lec-org">Organisation *</label>
                  <input id="lec-org" name="org" required className="lecture-input"
                    placeholder="Green Valley School" value={form.org} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              {/* Row: Email + Phone */}
              <div className="lecture-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <div style={fieldStyle}>
                  <label style={labelStyle} htmlFor="lec-email">Email *</label>
                  <input id="lec-email" name="email" type="email" required className="lecture-input"
                    placeholder="you@example.com" value={form.email} onChange={handleChange} style={inputStyle} />
                </div>
                <div style={fieldStyle}>
                  <label style={labelStyle} htmlFor="lec-phone">Phone</label>
                  <input id="lec-phone" name="phone" type="tel" className="lecture-input"
                    placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              {/* Audience — full width */}
              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor="lec-audience">Audience Type *</label>
                <select id="lec-audience" name="audience" required className="lecture-input"
                  value={form.audience} onChange={handleChange} style={inputStyle}>
                  <option value="">Select…</option>
                  {AUDIENCE.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              {/* Preferred date — full width */}
              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor="lec-date">Preferred Date</label>
                <input id="lec-date" name="date" type="date" className="lecture-input"
                  value={form.date} onChange={handleChange} style={inputStyle}
                  min={new Date().toISOString().split('T')[0]} />
              </div>

              {/* Message */}
              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor="lec-msg">Additional Notes</label>
                <textarea id="lec-msg" name="message" rows={3} className="lecture-input"
                  placeholder="Estimated audience size, specific focus areas, venue details…"
                  value={form.message} onChange={handleChange}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} />
              </div>

              {/* Inline notice before submit */}
              <div style={noticeStyle}>
                <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '0.05rem' }}>ℹ️</span>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
                  By submitting, you acknowledge that <strong>travel expenses</strong> and all <strong>venue arrangements</strong> (hall, seating, equipment) are the responsibility of the hosting organisation.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="lecture-submit"
                style={{
                  width: '100%',
                  padding: '0.8rem 1.5rem',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 'var(--text-sm)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'background 180ms ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                {loading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                      style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                    </svg>
                    Sending…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                    Request a Lecture
                  </>
                )}
              </button>

              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </form>
          )}
        </RevealBlock>
      </div>
    </section>
  )
}
