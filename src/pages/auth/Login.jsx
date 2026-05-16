import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { Droplets, Mail, Lock, Eye, EyeOff } from 'lucide-react'

const inputStyle = {
  width: '100%', padding: '11px 14px 11px 40px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-surface)',
  fontSize: 'var(--text-sm)', color: 'var(--color-text)', outline: 'none',
}

export default function Login() {
  const { signIn, user, profile } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || null

  const [form,     setForm]     = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Redirect once profile loads after sign-in (role comes from DB, not metadata)
  useEffect(() => {
    if (!user || !profile) return
    const dest = from || (profile.role === 'admin' ? '/admin' : '/client')
    navigate(dest, { replace: true })
  }, [user, profile,from, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Please fill in all fields'); return }
    setLoading(true)
    const { error: err } = await signIn(form)
    setLoading(false)
    if (err) setError(err.message)
    // navigation is handled by useEffect above once profile loads
  }

  return (
      
<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #e8f4fd, #f0f8ff)', padding: 'var(--space-6)', position: 'relative' }}>

  {/* ← Back to Home button */}
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
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 420, background: 'var(--color-surface-2)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-10)', boxShadow: 'var(--shadow-lg)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-8)' }}>
          <Droplets size={26} color="var(--color-primary)" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--color-text)' }}>RainFlow</span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--space-2)', color: 'var(--color-text)' }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign up free</Link>
        </p>

        {error && (
          <div style={{ background: 'var(--color-error-highlight)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-error)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)', pointerEvents: 'none' }} />
              <input type="email" style={inputStyle} placeholder="you@example.com"
                value={form.email} onChange={e => set('email', e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>Forgot password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)', pointerEvents: 'none' }} />
              <input type={showPass ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: 40 }}
                placeholder="Your password" value={form.password}
                onChange={e => set('password', e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px',
            background: loading ? 'var(--color-primary-highlight)' : 'var(--color-primary)',
            color: loading ? 'var(--color-primary)' : '#fff',
            border: 'none', borderRadius: 'var(--radius-full)',
            fontWeight: 700, fontSize: 'var(--text-sm)',
            cursor: loading ? 'not-allowed' : 'pointer', marginTop: 'var(--space-2)',
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}