import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

export default function RippleButton({
  children,
  onClick,
  className = '',
  variant = 'primary',
  type = 'button',
  disabled = false,
  icon,
}) {
  const [ripples, setRipples] = useState([])
  const btnRef = useRef(null)

  const handleClick = (e) => {
    const rect = btnRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()
    setRipples((prev) => [...prev, { id, x, y }])
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 750)
    onClick?.(e)
  }

  return (
    <motion.button
      ref={btnRef}
      type={type}
      disabled={disabled}
      onClick={handleClick}
      whileHover={{ y: -2, scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className={cn('water-button', variant === 'secondary' && 'secondary', className)}
      style={{ position: 'relative', overflow: 'hidden', isolation: 'isolate' }}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ripple-ring"
          style={{
            left: r.x,
            top: r.y,
            inset: 'unset',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </motion.button>
  )
}