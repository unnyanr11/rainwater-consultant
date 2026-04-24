import { motion } from 'framer-motion'
import { CloudRain, FileText, Calculator, ShieldCheck, Waves, CheckCircle2 } from 'lucide-react'
import SectionHeading from '../common/SectionHeading'
import { services } from '../../data/services'

const iconMap = { CloudRain, FileText, Calculator, ShieldCheck, Waves, CheckCircle2 }

export default function ServicesSection() {
  return (
    <section className="section" style={{ background: 'var(--color-bg)' }}>
      <div className="container">
        <SectionHeading
          eyebrow="What We Do"
          title="End-to-end rainwater harvesting services"
          subtitle="From the first site visit to the final completion certificate — we handle everything so you get a system that actually works."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
          {services.map((s, i) => {
            const Icon = iconMap[s.icon]
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                style={{
                  background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-8)',
                  border: '1px solid oklch(from var(--color-text) l c h / 0.07)',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                <div style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
                  {Icon && <Icon size={24} />}
                </div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--color-text)' }}>{s.title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.65, maxWidth: '100%' }}>{s.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}