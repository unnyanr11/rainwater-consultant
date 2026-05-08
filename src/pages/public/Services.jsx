import Navbar from '../../components/home/Navbar'
import ServicesSection from '../../components/home/ServicesSection'
import FinalCTA from '../../components/home/FinalCTA'

export default function Services() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '64px' }}>
        <ServicesSection />
        <FinalCTA />
      </div>
    </>
  )
}
