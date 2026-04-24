import PageTransition from '../../components/motion/PageTransition'
import SectionHeading from '../../components/ui/SectionHeading'
import Card from '../../components/ui/Card'
import RevealBlock from '../../components/motion/RevealBlock'
import WaveBackground from '../../components/motion/WaveBackground'
import RippleButton from '../../components/motion/RippleButton'
import { CloudRain, Ruler, FileText, Wrench, BarChart2, CheckCircle } from 'lucide-react'

const SERVICES = [
  { icon: <CloudRain size={28} />, title: 'Site Survey', desc: 'Thorough assessment of rooftop area, surface conditions, drainage patterns, and recharge potential.', items: ['Rooftop measurement', 'Drainage analysis', 'Soil percolation test', 'Catchment assessment'] },
  { icon: <Ruler size={28} />, title: 'System Design', desc: 'Custom rainwater harvesting system tailored to your site, usage, and local rainfall data.', items: ['Demand-supply calculation', 'Tank sizing', 'Filter selection', 'Recharge design'] },
  { icon: <FileText size={28} />, title: 'Technical Drawings', desc: 'Detailed CAD drawings and PDFs. Released only after deposit confirmation — no free previews.', items: ['Plan & elevation drawings', 'Pipe layout', 'BOQ document', 'Compliance certificates'] },
  { icon: <Wrench size={28} />, title: 'Implementation Support', desc: 'On-site and remote guidance during construction and commissioning.', items: ['Contractor briefing', 'Quality checks', 'Testing & commissioning', 'Handover documentation'] },
  { icon: <BarChart2 size={28} />, title: 'Performance Audit', desc: 'Post-installation monitoring and efficiency assessment.', items: ['Water level monitoring', 'Filter maintenance plan', 'Annual efficiency report', 'Optimization suggestions'] },
  { icon: <CheckCircle size={28} />, title: 'Compliance Filing', desc: 'Assistance with municipal and state rainwater harvesting mandates.', items: ['State regulation review', 'Application drafting', 'Document submission support', 'Certificate follow-up'] },
]

export default function Services() {
  return (
    <PageTransition>
      <section style={{ paddingTop: 120, position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ paddingBottom: 'var(--space-16)' }}>
          <SectionHeading
            eyebrow="Services"
            title="Structured from survey to installation"
            subtitle="Every engagement starts with site data and ends with verified, paid drawings. No drawings given free."
            center
          />
          <div className="grid grid-3" style={{ gap: 'var(--space-6)' }}>
            {SERVICES.map((svc, i) => (
              <RevealBlock key={svc.title} delay={i * 0.08}>
                <Card>
                  <div style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>{svc.icon}</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>{svc.title}</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>{svc.desc}</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {svc.items.map((item) => (
                      <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0 }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </RevealBlock>
            ))}
          </div>

          <RevealBlock delay={0.3}>
            <div style={{ textAlign: 'center', marginTop: 'var(--space-16)' }}>
              <RippleButton>Book a Consultation</RippleButton>
            </div>
          </RevealBlock>
        </div>
        <WaveBackground height={140} />
      </section>
    </PageTransition>
  )
}