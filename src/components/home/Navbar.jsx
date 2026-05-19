import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ui/ThemeToggle'

const NAV_LINKS = [
  { label: 'Home',         href: '/'             },
  { label: 'Services',     href: '/services'     },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Calculator',   href: '/calculator'   },
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const drawerRef = useRef(null)

  const role = user?.user_metadata?.role ?? user?.role ?? null

  const handleLogout = async () => {
    setMenuOpen(false)
    await signOut()
    navigate('/')
  }

  // Close drawer on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  // Prevent body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <style>{`
        /* ── Hamburger button ── */
        .nav-hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          width: 40px;
          height: 40px;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: var(--radius-md);
          padding: 6px;
          transition: background 180ms;
          -webkit-tap-highlight-color: transparent;
        }
        .nav-hamburger:hover { background: var(--color-surface-offset); }
        .nav-hamburger span {
          display: block;
          width: 22px;
          height: 2px;
          background: var(--color-text);
          border-radius: 2px;
          transition: transform 280ms cubic-bezier(0.16,1,0.3,1),
                      opacity 180ms,
                      width 180ms;
          transform-origin: center;
        }
        .nav-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .nav-hamburger.open span:nth-child(2) { opacity: 0; width: 0; }
        .nav-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* ── Mobile drawer ── */
        .nav-drawer {
          display: none;
          position: fixed;
          top: 64px;
          left: 0; right: 0;
          z-index: 999;
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          max-height: 0;
          transition: max-height 380ms cubic-bezier(0.16,1,0.3,1),
                      opacity 280ms ease;
          opacity: 0;
        }
        .nav-drawer.open {
          max-height: 520px;
          opacity: 1;
        }
        .nav-drawer-inner {
          padding: 1rem 1.5rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .nav-drawer-link {
          display: block;
          padding: 0.75rem 0.75rem;
          border-radius: var(--radius-md);
          color: var(--color-text-muted);
          font-weight: 500;
          font-size: 1rem;
          text-decoration: none;
          transition: background 150ms, color 150ms;
        }
        .nav-drawer-link:hover,
        .nav-drawer-link.active {
          background: var(--color-surface-offset);
          color: var(--color-text);
        }
        .nav-drawer-divider {
          height: 1px;
          background: var(--color-divider);
          margin: 0.75rem 0;
        }
        .nav-drawer-auth {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }
        .nav-drawer-btn {
          display: block;
          width: 100%;
          text-align: center;
          padding: 0.6rem 1rem;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 0.92rem;
          text-decoration: none;
          cursor: pointer;
          transition: background 180ms, color 180ms, opacity 180ms;
        }
        .nav-drawer-btn-outline {
          border: 1.5px solid var(--color-primary);
          color: var(--color-primary);
          background: transparent;
        }
        .nav-drawer-btn-outline:hover { background: var(--color-primary-highlight); }
        .nav-drawer-btn-solid {
          background: var(--color-primary);
          color: #fff;
          border: none;
          box-shadow: 0 2px 10px rgba(30,58,95,0.22);
        }
        .nav-drawer-btn-solid:hover { opacity: 0.88; }
        .nav-drawer-btn-ghost {
          border: 1.5px solid var(--color-border);
          color: var(--color-text-muted);
          background: transparent;
        }
        .nav-drawer-btn-ghost:hover { background: var(--color-surface-offset); }
        .nav-mobile-row {
          display: none;
          align-items: center;
          gap: 8px;
        }
        /* ── Backdrop ── */
        .nav-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          top: 64px;
          background: oklch(0 0 0 / 0.35);
          z-index: 998;
          animation: fadeIn 200ms ease;
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .nav-links-desktop  { display: none !important; }
          .nav-auth-desktop   { display: none !important; }
          .nav-hamburger      { display: flex !important; }
          .nav-drawer         { display: block; }
          .nav-backdrop       { display: block; }
          .nav-mobile-row     { display: flex !important; }
        }
      `}</style>

      {/* ── Backdrop (mobile only, shown when open) ── */}
      {menuOpen && (
        <div
          className="nav-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

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

        {/* ── Desktop nav links ── */}
        <div className="nav-links-desktop" style={{ display: 'flex', gap: '2rem' }}>
          {NAV_LINKS.map(({ label, href }) => (
            <Link key={label} to={href} style={{
              color: location.pathname === href ? 'var(--color-text)' : 'var(--color-text-muted)',
              fontWeight: location.pathname === href ? 600 : 500,
              fontSize: '0.92rem', textDecoration: 'none',
              transition: 'color 0.18s ease',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--color-text)'}
              onMouseLeave={e => e.target.style.color = location.pathname === href ? 'var(--color-text)' : 'var(--color-text-muted)'}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* ── Desktop right side: Theme Toggle + Auth ── */}
        <div className="nav-auth-desktop" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                cursor: 'pointer', transition: 'background 180ms, color 180ms',
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

        {/* ── Mobile right: theme toggle + hamburger ── */}
        <div className="nav-mobile-row" style={{ display: 'none' }}>
          <ThemeToggle size="sm" />
          <button
            ref={drawerRef}
            className={`nav-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* ── Mobile slide-down drawer ── */}
      <div
        id="mobile-nav-drawer"
        className={`nav-drawer${menuOpen ? ' open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className="nav-drawer-inner">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              to={href}
              className={`nav-drawer-link${location.pathname === href ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}

          <div className="nav-drawer-divider" />

          <div className="nav-drawer-auth">
            {user ? (
              <>
                <Link
                  to={role === 'admin' ? '/admin' : '/client'}
                  className="nav-drawer-btn nav-drawer-btn-outline"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  className="nav-drawer-btn nav-drawer-btn-ghost"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="nav-drawer-btn nav-drawer-btn-outline"
                  onClick={() => setMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="nav-drawer-btn nav-drawer-btn-solid"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
