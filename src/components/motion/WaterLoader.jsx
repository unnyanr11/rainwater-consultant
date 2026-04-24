import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function WaterLoader({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const steps = [15, 35, 58, 74, 88, 96, 100]
    let i = 0
    const interval = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i])
        i++
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setDone(true)
          setTimeout(() => onComplete?.(), 500)
        }, 300)
      }
    }, 260)
    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(160deg, #e8f6ff 0%, #d0ecfa 40%, #bde4f8 100%)',
          }}
        >
          {/* Rain drops */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="rain-drop"
                style={{
                  left: `${(i / 18) * 100 + 2}%`,
                  animationDuration: `${1.1 + (i % 5) * 0.32}s`,
                  animationDelay: `${(i * 0.17) % 2}s`,
                  opacity: 0.5 + (i % 3) * 0.12,
                }}
              />
            ))}
          </div>

          {/* Cloud SVG */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ marginBottom: '1.5rem' }}
          >
            <svg width="80" height="52" viewBox="0 0 80 52" fill="none" aria-label="Rain cloud">
              <ellipse cx="40" cy="34" rx="32" ry="18" fill="rgba(11,111,184,0.18)" />
              <ellipse cx="28" cy="30" rx="20" ry="16" fill="rgba(11,111,184,0.25)" />
              <ellipse cx="54" cy="32" rx="16" ry="13" fill="rgba(11,111,184,0.22)" />
              <ellipse cx="40" cy="26" rx="22" ry="18" fill="rgba(82,181,232,0.55)" />
              <ellipse cx="28" cy="26" rx="16" ry="14" fill="rgba(82,181,232,0.65)" />
              <ellipse cx="54" cy="26" rx="14" ry="12" fill="rgba(82,181,232,0.6)" />
            </svg>
          </motion.div>

          {/* Tank */}
          <div
            style={{
              position: 'relative',
              width: 72,
              height: 100,
              borderRadius: '10px 10px 14px 14px',
              border: '2.5px solid rgba(11,111,184,0.4)',
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.55)',
              boxShadow: '0 8px 32px rgba(11,111,184,0.14)',
              marginBottom: '1.6rem',
            }}
          >
            <motion.div
              animate={{ height: `${progress}%` }}
              initial={{ height: '0%' }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(180deg, rgba(82,181,232,0.72) 0%, rgba(11,111,184,0.85) 100%)',
              }}
            >
              {/* water surface wave inside tank */}
              <svg
                viewBox="0 0 72 10"
                preserveAspectRatio="none"
                style={{ position: 'absolute', top: -6, width: '100%', height: 12 }}
                aria-hidden="true"
              >
                <path
                  d="M0,5 C12,0 24,10 36,5 C48,0 60,10 72,5 L72,10 L0,10 Z"
                  fill="rgba(125,211,252,0.7)"
                  className="wave-layer one"
                />
              </svg>
            </motion.div>
            {/* shimmer */}
            <div className="liquid-shimmer" style={{ position: 'absolute', inset: 0 }} />
          </div>

          {/* Logo text */}
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: '#0b6fb8', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            AquaConsult
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'rgba(11,111,184,0.62)', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Harvesting every drop
          </div>

          {/* Progress bar */}
          <div
            style={{
              marginTop: '1.8rem',
              width: 160,
              height: 4,
              borderRadius: 99,
              background: 'rgba(11,111,184,0.14)',
              overflow: 'hidden',
            }}
          >
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{
                height: '100%',
                borderRadius: 99,
                background: 'linear-gradient(90deg, #52b5e8, #0b6fb8)',
                position: 'relative',
              }}
            >
              <div className="liquid-shimmer" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }} />
            </motion.div>
          </div>
          <div style={{ marginTop: '0.6rem', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'rgba(11,111,184,0.5)', fontWeight: 600 }}>
            {progress}%
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}