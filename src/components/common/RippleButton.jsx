import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function RippleButton({
  children, to, href, variant = 'primary',
  icon, onClick, style, disabled
}) {
  const [ripples, setRipples] = useState([])

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()
    setRipples(r => [...r, { x, y, id }])
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700)
    onClick?.()
  }

  const base = {
    position: 'relative', overflow: 'hidden',
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '13px 26px', borderRadius: 'var(--radius-full)',
    fontWeight: 600, fontSize: 'var(--text-sm)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none', textDecoration: 'none',
    transition: 'transform 150ms ease, box-shadow 150ms ease',
    opacity: disabled ? 0.5 : 1,
  }

  const variantStyles = variant === 'primary'
    ? { background: 'var(--color-primary)', color: '#fff', boxShadow: '0 4px 18px rgba(11,111,184,0.28)' }
    : { background: 'transparent', color: 'var(--color-primary)', border: '1.5px solid var(--color-primary)' }

  const merged = { ...base, ...variantStyles, ...style }

  const hoverIn  = e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(11,111,184,0.32)' }
  const hoverOut = e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = variantStyles.boxShadow ?? '' }

  const Tag = to ? Link : href ? 'a' : 'button'
  const extraProps = to
    ? { to }
    : href
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : { disabled }

  return (
    <Tag {...extraProps} style={merged}
      onClick={handleClick} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
      {ripples.map(r => (
        <span key={r.id} style={{
          position: 'absolute',
          left: r.x - 60, top: r.y - 60,
          width: 120, height: 120,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.3)',
          pointerEvents: 'none',
          animation: 'rippleAnim 0.65s ease-out forwards',
        }} />
      ))}
      {children}
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
    </Tag>
  )
}