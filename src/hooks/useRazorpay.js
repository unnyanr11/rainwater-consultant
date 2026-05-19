import { useEffect, useState } from 'react'

/**
 * Loads the Razorpay checkout script once and reports readiness.
 * Usage:
 *   const { ready } = useRazorpay()
 *   // When ready === true, window.Razorpay is available.
 */
export function useRazorpay() {
  const [ready, setReady] = useState(() => typeof window !== 'undefined' && !!window.Razorpay)

  useEffect(() => {
    if (ready) return
    const existing = document.getElementById('razorpay-sdk')
    if (existing) {
      existing.addEventListener('load', () => setReady(true))
      return
    }
    const script = document.createElement('script')
    script.id  = 'razorpay-sdk'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setReady(true)
    script.onerror = () => console.error('Failed to load Razorpay SDK')
    document.head.appendChild(script)
  }, [ready])

  return { ready }
}
