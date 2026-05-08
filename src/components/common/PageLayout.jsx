import Navbar from '../home/Navbar'
import CalculatorCTA from '../home/CalculatorCTA'

export default function PageLayout({ title, subtitle, children }) {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '64px' }}>
        {/* Page hero banner */}
        <section style={{
          background: 'linear-gradient(135deg, #01696f 0%, #0c4e54 100%)',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          color: '#fff'
        }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.2 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', opacity: 0.85, maxWidth: '560px', margin: '0 auto' }}>
              {subtitle}
            </p>
          )}
        </section>

        {/* Page content */}
        {children}

        {/* Single shared CTA at the bottom */}
        <CalculatorCTA />
      </div>
    </>
  )
}
