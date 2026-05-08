import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

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
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(30,58,95,0.08)',
      boxShadow: '0 1px 16px rgba(30,58,95,0.07)',
    }}>

      {/* ── Logo ── */}
      <Link to="/" style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        fontWeight: 800, fontSize: '1.15rem',
        color: '#1e3a5f', textDecoration: 'none', letterSpacing: '-0.02em'
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
          { label: 'Home',        href: '/'            },
          { label: 'Services',    href: '/services'    },
          { label: 'How It Works',href: '/how-it-works'},
          { label: 'Pricing',     href: '/pricing'     },
          { label: 'Calculator',  href: '/calculator'  },
        ].map(({ label, href }) => (
          <Link key={label} to={href} style={{
            color: '#475569', fontWeight: 500,
            fontSize: '0.92rem', textDecoration: 'none',
            transition: 'color 0.18s ease',
          }}
            onMouseEnter={e => e.target.style.color = '#1e3a5f'}
            onMouseLeave={e => e.target.style.color = '#475569'}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* ── Auth Buttons ── */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {user ? (
          <>
            <Link
              to={role === 'admin' ? '/admin' : '/client'}
              style={{
                padding: '0.48rem 1.2rem', borderRadius: '9999px',
                border: '1.5px solid #1e3a5f', color: '#1e3a5f',
                fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none',
              }}
            >
              Dashboard
            </Link>
            <button onClick={handleLogout} style={{
              padding: '0.48rem 1.2rem', borderRadius: '9999px',
              background: 'transparent', border: '1.5px solid #e2e8f0',
              color: '#64748b', fontWeight: 600, fontSize: '0.88rem',
              cursor: 'pointer',
            }}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              padding: '0.48rem 1.3rem', borderRadius: '9999px',
              border: '1.5px solid #1e3a5f', color: '#1e3a5f',
              fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none',
            }}>
              Log In
            </Link>
            <Link to="/signup" style={{
              padding: '0.48rem 1.4rem', borderRadius: '9999px',
              background: '#1e3a5f', color: '#fff',
              fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none',
              boxShadow: '0 2px 12px rgba(30,58,95,0.28)',
            }}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
