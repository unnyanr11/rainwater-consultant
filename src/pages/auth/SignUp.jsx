import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, Droplets, User, Mail, Lock, Phone, MapPin, Building2, CheckCircle2 } from 'lucide-react'

const propertyTypes = [
  { value: 'residential', label: 'Residential Home' },
  { value: 'apartment',   label: 'Apartment / Society' },
  { value: 'commercial',  label: 'Commercial Building' },
  { value: 'industrial',  label: 'Industrial / Factory' },
  { value: 'institution', label: 'School / Institution' },
]

const steps = [
  { label: 'Account', fields: ['full_name', 'email', 'password', 'confirm_password'] },
  { label: 'Details', fields: ['phone', 'city', 'property_type'] },
]

const inputStyle = {
  width: '100%', padding: '11px 14px 11px 40px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-surface)',
  fontSize: 'var(--text-sm)', color: 'var(--color-text)',
  outline: 'none', transition: 'border-color 180ms',
}

function Field({ icon: Icon, label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Icon size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)', pointerEvents: 'none' }} />
        {children}
      </div>
      {error && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>{error}</span>}
    </div>
  )
}

export default function SignUp() {
  const { signUp } = useAuth()
  const navigate   = useNavigate()

  const [step,     setStep]     = useState(0)
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [errors,   setErrors]   = useState({})
  const [form,     setForm]     = useState({
    full_name: '', email: '', password: '', confirm_password: '',
    phone: '', city: '', property_type: '',
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const validate = () => {
    const e = {}
    if (step === 0) {
      if (!form.full_name.trim())                  e.full_name        = 'Name is required'
      if (!form.email.includes('@'))               e.email            = 'Enter a valid email'
      if (form.password.length < 8)                e.password         = 'Minimum 8 characters'
      if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match'
    }
    if (step === 1) {
      if (!form.phone.trim())  e.phone         = 'Phone is required'
      if (!form.city.trim())   e.city          = 'City is required'
      if (!form.property_type) e.property_type = 'Select a property type'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => { if (validate()) setStep(1) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    const { confirm_password, ...payload } = form
    const { error } = await signUp(payload)
    setLoading(false)
    if (error) { setErrors({ submit: error.message }); return }
    navigate('/verify-email')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(160deg, #e8f4fd, #f0f8ff)' }}>

      {/* ── Left panel ── */}
      <div style={{
        flex: '0 0 420px', background: 'linear-gradient(160deg, #0a2540, #0b6fb8)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: 'var(--space-12)', color: '#fff',
      }} className="auth-panel-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-12)' }}>
          <Droplets size={28} color="#5bc8f5" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-lg)' }}>RainFlow</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 'var(--space-6)' }}>
          Start harvesting rainwater the right way
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 'var(--text-sm)', lineHeight: 1.7, marginBottom: 'var(--space-10)' }}>
          Create your account to book site visits, track your project, and access your technical drawings securely.
        </p>
        {[
          'Fixed-price proposals, no surprises',
          'Drawings released only after payment',
          'Track every stage of your project',
          'Municipal compliance docs included',
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-3)', color: 'rgba(255,255,255,0.85)', fontSize: 'var(--text-sm)' }}>
            <CheckCircle2 size={15} color="#5bc8f5" style={{ flexShrink: 0 }} />
            {t}
          </div>
        ))}
      </div>

      {/* ── Right panel ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'var(--space-8)', position: 'relative',   // ← relative added
      }}>

        {/* ← Back to Home */}
        <Link to="/" style={{
          position: 'absolute', top: '20px', left: '24px',
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          color: 'var(--color-text-muted)', fontWeight: 600,
          fontSize: 'var(--text-sm)', textDecoration: 'none',
          padding: '0.45rem 1rem', borderRadius: 'var(--radius-full)',
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'color 0.18s, box-shadow 0.18s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
        >
          ← Back to Home
        </Link>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%', maxWidth: 440 }}
        >
          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-8)' }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: i <= step ? 'var(--color-primary)' : 'var(--color-surface-dynamic)',
                  color: i <= step ? '#fff' : 'var(--color-text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, transition: 'background 300ms',
                }}>
                  {i < step ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: i === step ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div style={{ width: 32, height: 1, background: 'var(--color-border)' }} />
                )}
              </div>
            ))}
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
            {step === 0 ? 'Create your account' : 'Property details'}
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>
            {step === 0
              ? <> Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</Link> </>
              : 'Tell us about your property so we can tailor the consultation.'}
          </p>

          {errors.submit && (
            <div style={{ background: 'var(--color-error-highlight)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-error)' }}>
              {errors.submit}
            </div>
          )}

          <form
            onSubmit={step === 0 ? (e) => { e.preventDefault(); handleNext() } : handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}
          >
            {step === 0 && <>
              <Field icon={User} label="Full Name" error={errors.full_name}>
                <input style={inputStyle} placeholder="Rajesh Sharma" value={form.full_name}
                  onChange={e => set('full_name', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
              </Field>

              <Field icon={Mail} label="Email Address" error={errors.email}>
                <input type="email" style={inputStyle} placeholder="you@example.com" value={form.email}
                  onChange={e => set('email', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
              </Field>

              <Field icon={Lock} label="Password" error={errors.password}>
                <input type={showPass ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: 40 }}
                  placeholder="Min. 8 characters" value={form.password}
                  onChange={e => set('password', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </Field>

              <Field icon={Lock} label="Confirm Password" error={errors.confirm_password}>
                <input type="password" style={inputStyle} placeholder="Repeat password" value={form.confirm_password}
                  onChange={e => set('confirm_password', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
              </Field>
            </>}

            {step === 1 && <>
              <Field icon={Phone} label="Phone Number" error={errors.phone}>
                <input type="tel" style={inputStyle} placeholder="+91 98765 43210" value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
              </Field>

              <Field icon={MapPin} label="City" error={errors.city}>
                <input style={inputStyle} placeholder="Bengaluru" value={form.city}
                  onChange={e => set('city', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
              </Field>

              <Field icon={Building2} label="Property Type" error={errors.property_type}>
                <select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                  value={form.property_type} onChange={e => set('property_type', e.target.value)}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}>
                  <option value="">Select type...</option>
                  {propertyTypes.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </Field>
            </>}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? 'var(--color-primary-highlight)' : 'var(--color-primary)',
              color: loading ? 'var(--color-primary)' : '#fff',
              border: 'none', borderRadius: 'var(--radius-full)',
              fontWeight: 700, fontSize: 'var(--text-sm)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 180ms', marginTop: 'var(--space-2)',
            }}>
              {loading ? 'Creating account...' : step === 0 ? 'Continue →' : 'Create Account'}
            </button>

            {step === 1 && (
              <button type="button" onClick={() => setStep(0)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', cursor: 'pointer', textAlign: 'center' }}>
                ← Back
              </button>
            )}
          </form>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-panel-left { display: none !important; }
        }
      `}</style>
    </div>
  )
}