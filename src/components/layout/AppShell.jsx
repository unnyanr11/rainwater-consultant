import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import PublicHeader from './PublicHeader'
import Footer from './Footer'
import WaterLoader from '../motion/WaterLoader'

const PUBLIC_PATHS = ['/', '/services', '/pricing', '/about', '/contact', '/calculator', '/blog', '/gallery']
const CLIENT_PATHS = ['/client']
const ADMIN_PATHS = ['/admin']

export default function AppShell({ children }) {
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const path = location.pathname

  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + '/'))
  const isClient = CLIENT_PATHS.some((p) => path.startsWith(p))
  const isAdmin = ADMIN_PATHS.some((p) => path.startsWith(p))

  if (loading) {
    return <WaterLoader onComplete={() => setLoading(false)} />
  }

  return (
    <div className="app-shell">
      {isPublic && <PublicHeader />}
      <main className="page-main" id="main-content">
        {children}
      </main>
      {isPublic && <Footer />}
    </div>
  )
}