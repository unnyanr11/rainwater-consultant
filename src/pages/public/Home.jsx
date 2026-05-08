import Navbar from '../../components/home/Navbar'
import HeroSection         from '../../components/home/HeroSection'
import StatsBar            from '../../components/home/StatsBar'
import CalculatorCTA       from '../../components/home/CalculatorCTA'
import TestimonialsSection from '../../components/home/TestimonialsSection'
import FinalCTA            from '../../components/home/FinalCTA'

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
      <Navbar />
      <div style={{ paddingTop: '64px' }}>
        <HeroSection />
        <StatsBar />
        <CalculatorCTA />
        <TestimonialsSection />
        <FinalCTA />
      </div>
    </>
  )
}
