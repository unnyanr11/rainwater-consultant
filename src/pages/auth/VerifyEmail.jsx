import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Mail, Droplets } from 'lucide-react'

export default function VerifyEmail() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg,#e8f4fd,#f0f8ff)', padding: 'var(--space-6)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: 'center', maxWidth: 420, background: 'var(--color-surface-2)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-12)', boxShadow: 'var(--shadow-lg)' }}
      >
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-primary-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)' }}>
          <Mail size={28} color="var(--color-primary)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 'var(--space-4)' }}>
          <Droplets size={18} color="var(--color-primary)" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-text)' }}>RainFlow</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--space-4)', color: 'var(--color-text)' }}>
          Check your inbox
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.7, marginBottom: 'var(--space-8)', maxWidth: '100%' }}>
          We've sent you a verification link. Click it to activate your account, then sign in to access your client dashboard.
        </p>
        <Link to="/login" style={{
          display: 'inline-flex', alignItems: 'center', padding: '12px 28px',
          background: 'var(--color-primary)', color: '#fff',
          borderRadius: 'var(--radius-full)', fontWeight: 700,
          fontSize: 'var(--text-sm)', textDecoration: 'none',
        }}>
          Go to Sign In
        </Link>
      </motion.div>
    </div>
  )
}