import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { Mail, Droplets, CheckCircle2 } from 'lucide-react'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.includes('@')) { setError('Enter a valid email'); return }
    setLoading(true)
    const { error: err } = await resetPassword(email)
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg,#e8f4fd,#f0f8ff)', padding: 'var(--space-6)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 400, background: 'var(--color-surface-2)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-10)', boxShadow: 'var(--shadow-lg)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-8)' }}>
          <Droplets size={24} color="var(--color-primary)" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-text)' }}>RainFlow</span>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={48} color="var(--color-success)" style={{ margin: '0 auto var(--space-4)' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 800, marginBottom: 'var(--space-3)', color: 'var(--color-text)' }}>Reset link sent</h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)', maxWidth: '100%' }}>
              Check your inbox for a password reset link. It expires in 1 hour.
            </p>
            <Link to="/login" style={{ color: 'var(--color-primary)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>← Back to Sign In</Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--space-2)', color: 'var(--color-text)' }}>
              Forgot password?
            </h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>
              Enter your email and we'll send a reset link.
            </p>

            {error && (
              <div style={{ background: 'var(--color-error-highlight)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', marginBottom: 'var(--space-5)', fontSize: 'var(--text-sm)', color: 'var(--color-error)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)', pointerEvents: 'none' }} />
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                  style={{ width: '100%', padding: '11px 14px 11px 40px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', fontSize: 'var(--text-sm)', color: 'var(--color-text)', outline: 'none' }} />
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px',
                background: loading ? 'var(--color-primary-highlight)' : 'var(--color-primary)',
                color: loading ? 'var(--color-primary)' : '#fff',
                border: 'none', borderRadius: 'var(--radius-full)',
                fontWeight: 700, fontSize: 'var(--text-sm)', cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <Link to="/login" style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                ← Back to Sign In
              </Link>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}