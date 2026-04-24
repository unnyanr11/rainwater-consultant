import { motion } from 'framer-motion'
import { Calculator } from 'lucide-react'
import RainCanvas from '../common/RainCanvas'
import RippleButton from '../common/RippleButton'

export default function CalculatorCTA() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #0a2540 0%, #0b6fb8 100%)',
      padding: 'var(--space-20) 0', position: 'relative', overflow: 'hidden',
    }}>
      <RainCanvas count={20} />
      <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div style={{ fontSize: 48, marginBottom: 'var(--space-4)' }}>🧮</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: '#fff', marginBottom: 'var(--space-4)' }}>
            How much rainwater can your roof harvest?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', marginBottom: 'var(--space-8)', maxWidth: '44ch', marginInline: 'auto', fontSize: 'var(--text-base)' }}>
            Enter your city and roof area — get your annual potential, tank size, and estimated savings in 30 seconds. Free, no sign-up needed.
          </p>
          <RippleButton to="/calculator" icon={<Calculator size={16} />}
            style={{ background: '#fff', color: 'var(--color-primary)', boxShadow: '0 6px 24px rgba(0,0,0,0.18)' }}>
            Open Free Calculator
          </RippleButton>
        </motion.div>
      </div>
    </section>
  )
}