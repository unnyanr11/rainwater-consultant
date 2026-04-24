import { motion } from 'framer-motion'
import { ArrowRight, Calculator, Phone, Mail, MapPin } from 'lucide-react'
import SectionHeading from '../common/SectionHeading'
import RippleButton from '../common/RippleButton'

const contacts = [
  { icon: <Phone size={16} />,  label: '+91 98765 43210' },
  { icon: <Mail size={16} />,   label: 'hello@rainflowconsult.in' },
  { icon: <MapPin size={16} />, label: 'Serving all India' },
]

export default function FinalCTA() {
  return (
    <section className="section" style={{ background: 'var(--color-bg)' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <SectionHeading center
          eyebrow="Get Started"
          title="Ready to harvest rainwater?"
          subtitle="Book a paid site consultation and get a fixed-price proposal with technical drawings in 3 working days."
        />
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <RippleButton to="/contact" icon={<ArrowRight size={16} />}>
              Book Consultation — ₹999
            </RippleButton>
            <RippleButton to="/calculator" variant="secondary" icon={<Calculator size={16} />}>
              Try Calculator First
            </RippleButton>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-8)', marginTop: 'var(--space-12)', flexWrap: 'wrap' }}>
            {contacts.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--color-primary)' }}>{c.icon}</span>
                {c.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}