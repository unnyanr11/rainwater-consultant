import { motion } from 'framer-motion'
import Counter from '../common/Counter'
import { stats } from '../../data/stats'

export default function StatsBar() {
  return (
    <section style={{ background: 'var(--color-primary)', padding: 'var(--space-12) 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-8)', textAlign: 'center' }}>
          {stats.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
              <div style={{ fontSize: 'clamp(1.8rem,3vw,2.8rem)', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                <Counter target={s.value} suffix={s.suffix} prefix={s.prefix} />
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.75)', marginTop: 6, fontWeight: 500, letterSpacing: '0.05em' }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}