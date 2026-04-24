import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function RevealBlock({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const dirMap = {
    up: { y: 36, x: 0 },
    down: { y: -36, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  }
  const from = dirMap[direction] || dirMap.up

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...from }}
      animate={visible ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  )
}