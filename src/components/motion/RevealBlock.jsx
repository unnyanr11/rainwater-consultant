import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function RevealBlock({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}) {
  const ref = useRef(null)
  // Start visible=true so above-fold content never flashes blank.
  // Below-fold content is handled by IntersectionObserver.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const check = () => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setVisible(true)
        return true
      }
      return false
    }

    // Check immediately — works for above-fold content
    if (check()) return

    // Small rAF retry in case layout isn't settled yet (e.g. inside PageTransition)
    const rafId = requestAnimationFrame(() => {
      if (check()) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        },
        { threshold: 0.01, rootMargin: '0px 0px -40px 0px' }
      )
      observer.observe(el)
    })

    return () => cancelAnimationFrame(rafId)
  }, [])

  const dirMap = {
    up:    { y: 24, x: 0 },
    down:  { y: -24, x: 0 },
    left:  { x: 32, y: 0 },
    right: { x: -32, y: 0 },
  }
  const from = dirMap[direction] || dirMap.up

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...from }}
      animate={visible ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
