import Navbar from '../../components/home/Navbar'
import PricingSection from '../../components/home/PricingSection'
import FinalCTA from '../../components/home/FinalCTA'

export default function Pricing() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '64px' }}>
        <PricingSection />
        <FinalCTA />
      </div>
    </>
  )
}
