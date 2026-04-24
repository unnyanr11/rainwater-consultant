import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

export default function Card({ children, className = '', hover = true, glass = false, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -4, boxShadow: '0 16px 48px rgba(11,111,184,0.13)' } : {}}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className={cn(glass ? 'glass-panel' : 'surface-card', className)}
      style={{
        padding: 'var(--space-6)',
        borderRadius: 'var(--radius-xl)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {children}
    </motion.div>
  )
}