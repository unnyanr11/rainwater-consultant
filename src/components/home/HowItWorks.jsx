import { motion } from 'framer-motion'
import SectionHeading from '../common/SectionHeading'
import { steps } from '../../data/steps'

export default function HowItWorks() {
  return (
    <section className="section" style={{ background: 'var(--color-bg)' }}>
      <div className="container">
        <SectionHeading
          eyebrow="Our Process"
          title="How we work — no free drawings, ever"
          subtitle="Every drawing we produce is the result of a paid, structured process. Here's how you go from inquiry to a fully working system."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-6)' }}>
          {steps.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.55 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'var(--color-primary)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-sm)',
                marginBottom: 'var(--space-4)', boxShadow: '0 4px 16px rgba(11,111,184,0.3)',
              }}>{s.n}</div>
              <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>{s.title}</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.65, maxWidth: '100%' }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}