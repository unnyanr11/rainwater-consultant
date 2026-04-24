import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Droplets, ShieldCheck, Clock, CheckCircle2, ChevronDown, Calculator, ArrowRight } from 'lucide-react'
import RainCanvas from '../common/RainCanvas'
import RippleButton from '../common/RippleButton'

const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay } },
})
const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }

const trustBadges = [
  { icon: <ShieldCheck size={15} />, text: '70% advance, balance on delivery' },
  { icon: <Clock size={15} />,       text: 'Drawings in 3 business days' },
  { icon: <CheckCircle2 size={15} />,text: 'Municipal compliance included' },
]

function HeroDrop() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <div style={{ position: 'relative', width: 360, height: 360, animation: 'floatDrop 4s ease-in-out infinite' }}>
        <div style={{
          position: 'absolute', inset: -24, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(11,111,184,0.12) 0%, transparent 70%)',
        }} />
        <svg viewBox="0 0 300 340" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 16px 48px rgba(11,111,184,0.25))' }}>
          <defs>
            <linearGradient id="dropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#5bc8f5" />
              <stop offset="60%"  stopColor="#0b6fb8" />
              <stop offset="100%" stopColor="#04457a" />
            </linearGradient>
            <linearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="rgba(255,255,255,0.55)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <clipPath id="dropClip">
              <path d="M150,20 C150,20 30,130 30,210 C30,272 84,320 150,320 C216,320 270,272 270,210 C270,130 150,20 150,20 Z" />
            </clipPath>
          </defs>
          <path d="M150,20 C150,20 30,130 30,210 C30,272 84,320 150,320 C216,320 270,272 270,210 C270,130 150,20 150,20 Z" fill="url(#dropGrad)" />
          <g clipPath="url(#dropClip)">
            <rect x="0" y="220" width="300" height="100" fill="rgba(255,255,255,0.12)" />
          </g>
          <ellipse cx="105" cy="130" rx="28" ry="48" fill="url(#shineGrad)" transform="rotate(-20,105,130)" opacity="0.7" />
          <text x="150" y="230" textAnchor="middle" fontSize="64" fill="rgba(255,255,255,0.9)">💧</text>
          <text x="150" y="278" textAnchor="middle" fontSize="13"
            fill="rgba(255,255,255,0.75)" fontFamily="sans-serif"
            fontWeight="600" letterSpacing="1">EVERY DROP COUNTS</text>
        </svg>

        {[
          { label: '40K L/yr',     angle: -40,  color: '#0b6fb8' },
          { label: '60% saving',   angle: 120,  color: '#437a22' },
          { label: '3-day deliver',angle: 240,  color: '#964219' },
        ].map(({ label, angle, color }, i) => {
          const rad = (angle * Math.PI) / 180
          const cx = 180 + 180 * Math.cos(rad)
          const cy = 180 + 180 * Math.sin(rad)
          return (
            <motion.div key={i}
              animate={{ scale: [1, 1.07, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8 }}
              style={{
                position: 'absolute', left: cx, top: cy,
                transform: 'translate(-50%,-50%)',
                background: '#fff', borderRadius: 'var(--radius-full)',
                padding: '5px 12px', fontSize: 11, fontWeight: 700, color,
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)', whiteSpace: 'nowrap',
              }}>
              {label}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default function HeroSection() {
  const heroRef = useRef()
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY       = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section ref={heroRef} style={{
      position: 'relative', minHeight: '100vh',
      display: 'flex', alignItems: 'center', overflow: 'hidden',
      background: 'linear-gradient(160deg, #e8f4fd 0%, #f0f8ff 40%, #dff0ff 100%)',
    }}>
      <RainCanvas />

      {/* animated bottom wave */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2 }}>
        <div style={{ overflow: 'hidden', height: 90 }}>
          <div style={{ display: 'flex', width: '200%', animation: 'waveFlow 7s linear infinite' }}>
            {[0, 1].map(k => (
              <svg key={k} viewBox="0 0 1440 90" style={{ width: '50%', height: 90 }} preserveAspectRatio="none">
                <path d="M0,45 C360,90 720,0 1080,45 C1260,67 1380,56 1440,45 L1440,90 L0,90 Z" fill="var(--color-bg)" />
              </svg>
            ))}
          </div>
        </div>
      </div>

      <motion.div style={{ y: heroY, opacity: heroOpacity, position: 'relative', zIndex: 3, width: '100%' }}>
        <div className="container" style={{ paddingBlock: 'var(--space-32)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
            gap: 'var(--space-16)', alignItems: 'center',
          }}>
            {/* Left copy */}
            <motion.div variants={containerVariants} initial="hidden" animate="show">
              <motion.div variants={stagger(0)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(11,111,184,0.1)', borderRadius: 'var(--radius-full)',
                padding: '6px 14px', marginBottom: 'var(--space-6)',
              }}>
                <Droplets size={14} color="var(--color-primary)" />
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Rainwater Harvesting Consultants
                </span>
              </motion.div>

              <motion.h1 variants={stagger(0.08)} style={{
                fontSize: 'clamp(2.4rem,5vw,4rem)', fontFamily: 'var(--font-display)',
                fontWeight: 800, lineHeight: 1.1, color: '#0a2540',
                marginBottom: 'var(--space-6)',
              }}>
                Every Drop of Rain <br />
                <span style={{
                  background: 'linear-gradient(120deg,#0b6fb8,#38b6f0)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  is a Resource.
                </span>
              </motion.h1>

              <motion.p variants={stagger(0.16)} style={{
                fontSize: 'var(--text-base)', color: '#3a5a7a',
                maxWidth: '46ch', marginBottom: 'var(--space-8)', lineHeight: 1.7,
              }}>
                Professional rainwater harvesting design, technical drawings, and end-to-end
                implementation support — for homes, apartments, industries, and institutions across India.
              </motion.p>

              <motion.div variants={stagger(0.24)} style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <RippleButton to="/contact" icon={<ArrowRight size={16} />}>
                  Book Site Visit — ₹999
                </RippleButton>
                <RippleButton to="/calculator" variant="secondary" icon={<Calculator size={16} />}>
                  Free Calculator
                </RippleButton>
              </motion.div>

              <motion.div variants={stagger(0.32)} style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-8)', flexWrap: 'wrap' }}>
                {trustBadges.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3a5a7a', fontSize: 'var(--text-xs)' }}>
                    <span style={{ color: 'var(--color-primary)' }}>{f.icon}</span>
                    {f.text}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <HeroDrop />
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{ position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)', zIndex: 4, color: '#3a5a7a', opacity: 0.6 }}>
        <ChevronDown size={22} />
      </motion.div>
    </section>
  )
}