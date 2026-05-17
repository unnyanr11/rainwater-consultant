import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ui/ThemeToggle'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const role = user?.user_metadata?.role ?? user?.role ?? null

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2.5rem', height: '64px',
      background: 'var(--color-surface)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'background 200ms, border-color 200ms',
    }}>

      {/* ── Logo ── */}
      <Link to="/" style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        fontWeight: 800, fontSize: '1.15rem',
        color: 'var(--color-text)', textDecoration: 'none', letterSpacing: '-0.02em'
      }}>
        <svg width="28" height="34" viewBox="0 0 28 34" fill="none">
          <path d="M14 1C14 1 2 14 2 21a12 12 0 0024 0C26 14 14 1 14 1Z"
            fill="url(#ng)" />
          <defs>
            <linearGradient id="ng" x1="14" y1="1" x2="14" y2="33" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8"/>
              <stop offset="100%" stopColor="#1e3a5f"/>
            </linearGradient>
          </defs>
        </svg>
        RainFlow
      </Link>

      {/* ── Nav Links ── */}
      <div style={{ display: 'flex', gap: '2rem' }}>
        {[
          { label: 'Home',         href: '/'            },
          { label: 'Services',     href: '/services'    },
          { label: 'How It Works', href: '/how-it-works'},
          { label: 'Calculator',   href: '/calculator'  },
        ].map(({ label, href }) => (
          <Link key={label} to={href} style={{
            color: 'var(--color-text-muted)', fontWeight: 500,
            fontSize: '0.92rem', textDecoration: 'none',
            transition: 'color 0.18s ease',
          }}
            onMouseEnter={e => e.target.style.color = 'var(--color-text)'}
            onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* ── Right side: Theme Toggle + Auth ── */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <ThemeToggle size="sm" />

        {user ? (
          <>
            <Link
              to={role === 'admin' ? '/admin' : '/client'}
              style={{
                padding: '0.48rem 1.2rem', borderRadius: '9999px',
                border: '1.5px solid var(--color-primary)', color: 'var(--color-primary)',
                fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none',
                transition: 'background 180ms, color 180ms',
              }}
            >
              Dashboard
            </Link>
            <button onClick={handleLogout} style={{
              padding: '0.48rem 1.2rem', borderRadius: '9999px',
              background: 'transparent', border: '1.5px solid var(--color-border)',
              color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'background 180ms, color 180ms',
            }}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              padding: '0.48rem 1.3rem', borderRadius: '9999px',
              border: '1.5px solid var(--color-primary)', color: 'var(--color-primary)',
              fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none',
              transition: 'background 180ms, color 180ms',
            }}>
              Log In
            </Link>
            <Link to="/signup" style={{
              padding: '0.48rem 1.4rem', borderRadius: '9999px',
              background: 'var(--color-primary)', color: '#fff',
              fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none',
              boxShadow: '0 2px 12px rgba(30,58,95,0.28)',
              transition: 'background 180ms',
            }}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
