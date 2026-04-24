import { motion } from 'framer-motion'
import { CheckCircle2, ShieldCheck } from 'lucide-react'
import SectionHeading from '../common/SectionHeading'
import RippleButton from '../common/RippleButton'
import { packages } from '../../data/packages'

export default function PricingSection() {
  return (
    <section className="section" style={{ background: 'var(--color-bg)' }}>
      <div className="container">
        <SectionHeading center
          eyebrow="Pricing"
          title="Transparent packages. No free work."
          subtitle="Every package requires payment before drawings or reports are released. What you see is exactly what you pay."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)', alignItems: 'start' }}>
          {packages.map((pkg, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              style={{
                background: pkg.highlight ? 'var(--color-primary)' : 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)',
                border: pkg.highlight ? 'none' : '1px solid oklch(from var(--color-text) l c h / 0.07)',
                boxShadow: pkg.highlight ? '0 12px 40px rgba(11,111,184,0.32)' : 'var(--shadow-sm)',
                position: 'relative',
              }}>
              {pkg.highlight && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: '#fbbf24', color: '#78350f', fontSize: 11, fontWeight: 800,
                  padding: '3px 14px', borderRadius: 'var(--radius-full)', letterSpacing: '0.06em',
                }}>MOST POPULAR</div>
              )}
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 'var(--space-2)', color: pkg.highlight ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)' }}>{pkg.tag}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'var(--text-xl)', color: pkg.highlight ? '#fff' : 'var(--color-text)', marginBottom: 'var(--space-1)' }}>{pkg.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 'var(--space-6)' }}>
                <span style={{ fontSize: 14, color: pkg.highlight ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)' }}>₹</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,3vw,2.8rem)', fontWeight: 800, color: pkg.highlight ? '#fff' : 'var(--color-text)' }}>{pkg.price}</span>
              </div>
              <ul style={{ listStyle: 'none', marginBottom: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {pkg.features.map((f, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 'var(--text-sm)', color: pkg.highlight ? 'rgba(255,255,255,0.88)' : 'var(--color-text-muted)' }}>
                    <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 2, color: pkg.highlight ? 'rgba(255,255,255,0.7)' : 'var(--color-success)' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <RippleButton to="/contact"
                style={pkg.highlight
                  ? { background: '#fff', color: 'var(--color-primary)', width: '100%', justifyContent: 'center' }
                  : { width: '100%', justifyContent: 'center' }}
                variant={pkg.highlight ? 'custom' : 'secondary'}>
                {pkg.cta}
              </RippleButton>
            </motion.div>
          ))}
        </div>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ textAlign: 'center', marginTop: 'var(--space-8)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <ShieldCheck size={14} />
          Drawings and reports are released only after 70% advance payment is confirmed. No exceptions.
        </motion.p>
      </div>
    </section>
  )
}