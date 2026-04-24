import { motion } from 'framer-motion'

function RainDrop({ style }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        width: 2,
        borderRadius: 9999,
        background: 'linear-gradient(to bottom, transparent, rgba(11,111,184,0.35))',
        ...style,
      }}
      animate={{ y: ['0%', '100vh'], opacity: [0, 0.7, 0] }}
      transition={{
        duration: style.duration ?? 1.4,
        repeat: Infinity,
        delay: style.delay ?? 0,
        ease: 'linear',
      }}
    />
  )
}

export default function RainCanvas({ count = 28 }) {
  const drops = Array.from({ length: count }, (_, i) => ({
    left: `${(i * 3.7) % 100}%`,
    top: `-${Math.random() * 60}px`,
    height: Math.random() * 24 + 14,
    delay: Math.random() * 2.5,
    duration: Math.random() * 0.8 + 1.1,
  }))

  return (
    <div style={{
      position: 'absolute', inset: 0,
      overflow: 'hidden', pointerEvents: 'none', zIndex: 1,
    }}>
      {drops.map((d, i) => <RainDrop key={i} style={d} />)}
    </div>
  )
}