import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Droplets } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'
import RippleButton from '../motion/RippleButton'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Calculator', to: '/calculator' },
  { label: 'Projects', to: '/gallery' },
  { label: 'Compliance', to: '/compliance' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
]

export default function PublicHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'background 0.3s, box-shadow 0.3s, backdrop-filter 0.3s',
        background: scrolled
          ? 'var(--glass-bg)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(18px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(18px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
        boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 68,
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            textDecoration: 'none',
          }}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 5 }}
          >
            <Droplets
              size={28}
              style={{ color: 'var(--color-primary)' }}
              strokeWidth={2.2}
            />
          </motion.div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-lg)',
              fontWeight: 700,
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
            }}
          >
            Aqua<span style={{ color: 'var(--color-primary)' }}>Consult</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}
          className="desktop-nav"
          aria-label="Primary navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color:
                  location.pathname === link.to
                    ? 'var(--color-primary)'
                    : 'var(--color-text-muted)',
                textDecoration: 'none',
                position: 'relative',
                padding: '0.25rem 0',
                transition: 'color var(--transition-fast)',
              }}
            >
              {link.label}
              {location.pathname === link.to && (
                <motion.span
                  layoutId="nav-indicator"
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    left: 0,
                    right: 0,
                    height: 2,
                    borderRadius: 99,
                    background: 'var(--gradient-water)',
                  }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <ThemeToggle />
          <RippleButton
            className="desktop-nav"
            onClick={() => (window.location.href = '/client')}
          >
            Client Portal
          </RippleButton>

          {/* Mobile menu toggle */}
          <motion.button
            className="mobile-only"
            onClick={() => setMenuOpen((o) => !o)}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle menu"
            style={{
              display: 'none',
              padding: 'var(--space-2)',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            style={{
              overflow: 'hidden',
              background: 'var(--glass-bg)',
              borderTop: '1px solid var(--color-border)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <nav
              style={{ padding: 'var(--space-4) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
              aria-label="Mobile navigation"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 500,
                    color: location.pathname === link.to ? 'var(--color-primary)' : 'var(--color-text)',
                    padding: 'var(--space-2) 0',
                    borderBottom: '1px solid var(--color-divider)',
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <RippleButton onClick={() => (window.location.href = '/client')} style={{ marginTop: 'var(--space-2)' }}>
                Client Portal
              </RippleButton>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 820px) {
          .desktop-nav { display: none !important; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </motion.header>
  )
}