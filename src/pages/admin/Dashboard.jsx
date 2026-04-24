import PageTransition from '../../components/motion/PageTransition'
import SectionHeading from '../../components/ui/SectionHeading'
import Card from '../../components/ui/Card'
import RevealBlock from '../../components/motion/RevealBlock'
import LiquidMeter from '../../components/motion/LiquidMeter'

export default function AdminDashboard() {
  return (
    <PageTransition>
      <div style={{ padding: 'var(--space-8)' }}>
        <SectionHeading eyebrow="Admin" title="Dashboard" subtitle="Manage projects, drawings, payments, and clients." />
        <div className="grid grid-3">
          <RevealBlock delay={0}>
            <Card>
              <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-faint)', marginBottom: 'var(--space-2)' }}>Active Projects</p>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-primary)' }}>12</div>
            </Card>
          </RevealBlock>
          <RevealBlock delay={0.1}>
            <Card>
              <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-faint)', marginBottom: 'var(--space-2)' }}>Pending Payments</p>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-warning)' }}>4</div>
            </Card>
          </RevealBlock>
          <RevealBlock delay={0.2}>
            <Card>
              <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-faint)', marginBottom: 'var(--space-2)' }}>Drawings Unlocked</p>
              <LiquidMeter value={8} max={12} label="of 12" size={72} color="#0b6fb8" />
            </Card>
          </RevealBlock>
        </div>
      </div>
    </PageTransition>
  )
}