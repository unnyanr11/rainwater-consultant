import Navbar from '../../components/home/Navbar'
import HeroSection          from '../../components/home/HeroSection'
import StatsBar             from '../../components/home/StatsBar'
import ServicesSection      from '../../components/home/ServicesSection'
import HowItWorks           from '../../components/home/HowItWorks'
import CalculatorCTA        from '../../components/home/CalculatorCTA'
import PricingSection       from '../../components/home/PricingSection'
import TestimonialsSection  from '../../components/home/TestimonialsSection'
import FinalCTA             from '../../components/home/FinalCTA'

// Global keyframes needed by HeroSection animations
const globalStyles = `
  @keyframes rippleAnim {
    from { transform: scale(0); opacity: 1; }
    to   { transform: scale(2.8); opacity: 0; }
  }
  @keyframes floatDrop {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-10px); }
  }
  @keyframes waveFlow {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
`

export default function Home() {
  return (
    <>
      <style>{globalStyles}</style>
      <Navbar />                                      {/* ← add */}
      <div style={{ paddingTop: '64px' }}>            {/* ← push hero down */}
        <HeroSection />
        <StatsBar />
        <ServicesSection />
        <HowItWorks />
        <CalculatorCTA />
        <PricingSection />
        <TestimonialsSection />
        <FinalCTA />
      </div>
    </>
  )
}