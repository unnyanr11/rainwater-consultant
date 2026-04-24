import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function LiquidMeter({
  value = 0,
  max = 100,
  label = '',
  unit = '%',
  size = 120,
  color = '#0b6fb8',
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.6rem',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: size,
          height: size * 1.25,
          borderRadius: `${size * 0.16}px ${size * 0.16}px ${size * 0.2}px ${size * 0.2}px`,
          border: `2px solid ${color}33`,
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.45)',
          boxShadow: `0 4px 24px ${color}18`,
        }}
      >
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${pct}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: `linear-gradient(180deg, ${color}88 0%, ${color}cc 100%)`,
          }}
        >
          <svg
            viewBox="0 0 60 10"
            preserveAspectRatio="none"
            style={{ position: 'absolute', top: -5, width: '100%', height: 10 }}
            aria-hidden="true"
          >
            <path
              d="M0,5 C10,0 20,10 30,5 C40,0 50,10 60,5 L60,10 L0,10 Z"
              fill={`${color}66`}
              className="wave-layer one"
            />
          </svg>
        </motion.div>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: size * 0.22,
              fontWeight: 700,
              color: pct > 50 ? 'white' : color,
              lineHeight: 1,
            }}
          >
            {Math.round(pct)}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: size * 0.12,
              fontWeight: 600,
              color: pct > 50 ? 'rgba(255,255,255,0.8)' : `${color}88`,
            }}
          >
            {unit}
          </span>
        </div>
      </div>

      {label && (
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          {label}
        </span>
      )}
    </div>
  )
}