import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import SectionHeading from '../common/SectionHeading'
import { testimonials } from '../../data/testimonials'

export default function TestimonialsSection() {
  return (
    <section className="section" style={{ background: '#e8f4fd' }}>
      <div className="container">
        <SectionHeading center eyebrow="Testimonials" title="What our clients say" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
          {testimonials.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)', boxShadow: '0 2px 16px rgba(11,111,184,0.08)' }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 'var(--space-4)' }}>
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} size={14} fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: '#3a5a7a', lineHeight: 1.7, marginBottom: 'var(--space-6)', fontStyle: 'italic', maxWidth: '100%' }}>"{t.text}"</p>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: '#0a2540' }}>{t.name}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}