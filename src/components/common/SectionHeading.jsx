import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Droplets } from 'lucide-react'

const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay } },
})

export default function SectionHeading({ eyebrow, title, subtitle, center }) {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      style={{
        textAlign: center ? 'center' : 'left',
        marginBottom: 'var(--space-12)',
      }}
    >
      {eyebrow && (
        <motion.span variants={stagger(0)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 'var(--text-xs)', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.12em',
          color: 'var(--color-primary)', marginBottom: 'var(--space-3)',
        }}>
          <Droplets size={13} /> {eyebrow}
        </motion.span>
      )}

      <motion.h2 variants={stagger(0.08)} style={{
        fontSize: 'var(--text-xl)',
        fontFamily: 'var(--font-display)',
        color: 'var(--color-text)',
        marginBottom: subtitle ? 'var(--space-4)' : 0,
      }}>
        {title}
      </motion.h2>

      {subtitle && (
        <motion.p variants={stagger(0.16)} style={{
          fontSize: 'var(--text-base)',
          color: 'var(--color-text-muted)',
          maxWidth: '56ch',
          marginInline: center ? 'auto' : undefined,
        }}>
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  )
}