import PageTransition from '../../components/motion/PageTransition'
import SectionHeading from '../../components/ui/SectionHeading'
import Card from '../../components/ui/Card'
import LiquidMeter from '../../components/motion/LiquidMeter'
import RevealBlock from '../../components/motion/RevealBlock'
import { Lock, CheckCircle, Clock, FileText } from 'lucide-react'

export default function ClientDashboard() {
  return (
    <PageTransition>
      <div style={{ padding: 'var(--space-8)' }}>
        <SectionHeading
          eyebrow="Client Portal"
          title="Your Project"
          subtitle="Track your project status, make payments, and access your drawings here."
        />
        <div className="grid grid-3">
          <RevealBlock delay={0}>
            <Card>
              <Clock size={22} style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>Site Visit Scheduled</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Visit confirmed for 28 Apr 2026. You will receive a confirmation SMS.</p>
            </Card>
          </RevealBlock>
          <RevealBlock delay={0.1}>
            <Card>
              <CheckCircle size={22} style={{ color: 'var(--color-success)', marginBottom: 'var(--space-3)' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>Deposit Paid</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>70% advance received. Drawings are being prepared.</p>
              <LiquidMeter value={70} max={100} label="Paid" size={64} color="#11a36a" />
            </Card>
          </RevealBlock>
          <RevealBlock delay={0.2}>
            <Card>
              <Lock size={22} style={{ color: 'var(--color-error)', marginBottom: 'var(--space-3)' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>Drawings Locked</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Pay remaining 30% to unlock and download your final drawings.</p>
            </Card>
          </RevealBlock>
        </div>
      </div>
    </PageTransition>
  )
}