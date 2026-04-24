import { Link } from 'react-router-dom'
import { Droplets, Phone, Mail, MapPin } from 'lucide-react'
import WaveBackground from '../motion/WaveBackground'

export default function Footer() {
  return (
    <footer
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, var(--color-surface-offset) 0%, var(--color-surface-2) 100%)',
        borderTop: '1px solid var(--color-border)',
        paddingTop: 'var(--space-16)',
        paddingBottom: 'var(--space-8)',
        overflow: 'hidden',
      }}
    >
      <WaveBackground
        height={100}
        color1="rgba(11,111,184,0.07)"
        color2="rgba(82,181,232,0.05)"
        color3="rgba(125,211,252,0.04)"
        style={{ top: 0, bottom: 'unset', transform: 'rotate(180deg)' }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-10)',
            marginBottom: 'var(--space-10)',
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-3)' }}>
              <Droplets size={22} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text)' }}>
                Aqua<span style={{ color: 'var(--color-primary)' }}>Consult</span>
              </span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', maxWidth: '26ch', lineHeight: 1.65 }}>
              Expert rainwater harvesting consultant. Every drop harvested, every drawing delivered.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Services</h4>
            {['Site Survey', 'System Design', 'Technical Drawings', 'BOQ Report', 'Implementation Support'].map((s) => (
              <div key={s} style={{ marginBottom: 'var(--space-2)' }}>
                <Link to="/services" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', transition: 'color var(--transition-fast)' }}>{s}</Link>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Explore</h4>
            {[['Calculator', '/calculator'], ['Compliance', '/compliance'], ['Blog', '/blog'], ['Projects', '/gallery'], ['Client Portal', '/client']].map(([label, to]) => (
              <div key={to} style={{ marginBottom: 'var(--space-2)' }}>
                <Link to={to} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{label}</Link>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Contact</h4>
            {[
              { icon: <Phone size={14} />, text: '+91 98765 43210' },
              { icon: <Mail size={14} />, text: 'info@aquaconsult.in' },
              { icon: <MapPin size={14} />, text: 'Kanpur, Uttar Pradesh' },
            ].map((item) => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--color-primary)' }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 'var(--space-6)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
            © {new Date().getFullYear()} AquaConsult. All rights reserved.
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
            Drawings released only after payment confirmation.
          </p>
        </div>
      </div>
    </footer>
  )
}