import Navbar from '../../components/home/Navbar'
import HowItWorks from '../../components/home/HowItWorks'
import CalculatorCTA from '../../components/home/CalculatorCTA'

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '64px' }}>
        <HowItWorks />
        <CalculatorCTA />
      </div>
    </>
  )
}
