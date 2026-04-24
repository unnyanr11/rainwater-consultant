import PageTransition from '../../components/motion/PageTransition'
import SectionHeading from '../../components/ui/SectionHeading'
import Card from '../../components/ui/Card'
import RevealBlock from '../../components/motion/RevealBlock'
import RippleButton from '../../components/motion/RippleButton'
import WaveBackground from '../../components/motion/WaveBackground'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

const PLANS = [
  {
    name: 'Basic Consultation',
    price: '₹1,500',
    desc: 'One-time online or phone review of your site requirements.',
    items: ['45-min consultation call', 'Site feasibility overview', 'System type recommendation', 'Follow-up summary report'],
    cta: 'Book Now',
    highlight: false,
  },
  {
    name: 'Design Package',
    price: '₹8,500',
    desc: 'Full system design with drawings released after 70% deposit.',
    items: ['Site survey visit', 'Custom system design', 'CAD technical drawings', 'BOQ & materials list', '2 revision rounds'],
    cta: 'Get Started',
    highlight: true,
  },
  {
    name: 'Full Project Support',
    price: '₹22,000',
    desc: 'Design + drawings + implementation guidance from start to finish.',
    items: ['Everything in Design Package', 'Contractor coordination', 'Site visit during installation', 'Commissioning report', 'Compliance documentation', '1-year support calls'],
    cta: 'Talk to Us',
    highlight: false,
  },
]

export default function Pricing() {
  return (
    <PageTransition>
      <section style={{ paddingTop: 120, position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ paddingBottom: 'var(--space-16)' }}>
          <SectionHeading
            eyebrow="Pricing"
            title="Transparent. Structured. No free drawings."
            subtitle="Every package requires upfront payment before drawings are released. Drawings are gated until deposit is confirmed."
            center
          />

          <div className="grid grid-3" style={{ alignItems: 'start', gap: 'var(--space-6)' }}>
            {PLANS.map((plan, i) => (
              <RevealBlock key={plan.name} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    border: plan.highlight
                      ? '2px solid var(--color-primary)'
                      : '1px solid var(--color-border)',
                    background: plan.highlight ? 'var(--gradient-water)' : 'var(--color-surface)',
                    boxShadow: plan.highlight ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                  }}
                >
                  {plan.highlight && (
                    <div style={{ background: 'rgba(255,255,255,0.18)', textAlign: 'center', padding: 'var(--space-2)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'white', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      Most Popular
                    </div>
                  )}
                  <div style={{ padding: 'var(--space-8)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: plan.highlight ? 'white' : 'var(--color-text)', marginBottom: 'var(--space-2)' }}>{plan.name}</h3>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: plan.highlight ? 'white' : 'var(--color-primary)', marginBottom: 'var(--space-2)', letterSpacing: '-0.03em' }}>{plan.price}</div>
                    <p style={{ fontSize: 'var(--text-sm)', color: plan.highlight ? 'rgba(255,255,255,0.8)' : 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>{plan.desc}</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      {plan.items.map((item) => (
                        <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: plan.highlight ? 'rgba(255,255,255,0.9)' : 'var(--color-text-muted)' }}>
                          <Check size={14} style={{ color: plan.highlight ? 'white' : 'var(--color-success)', flexShrink: 0, marginTop: 3 }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <RippleButton
                      variant={plan.highlight ? 'primary' : 'secondary'}
                      className={plan.highlight ? '' : ''}
                      style={{ width: '100%' }}
                    >
                      {plan.cta}
                    </RippleButton>
                  </div>
                </motion.div>
              </RevealBlock>
            ))}
          </div>
        </div>
        <WaveBackground height={140} />
      </section>
    </PageTransition>
  )
}