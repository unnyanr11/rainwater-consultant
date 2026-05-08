import Navbar from '../home/Navbar'

export default function PageLayout({ children }) {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '64px' }}>
        {children}
      </div>
    </>
  )
}
