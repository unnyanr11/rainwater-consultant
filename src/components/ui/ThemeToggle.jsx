import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme')
    setDark(current === 'dark')
  }, [])

  const toggle = () => {
    const next = dark ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    setDark(!dark)
  }

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.88 }}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: 40,
        height: 40,
        borderRadius: 'var(--radius-full)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-surface-offset)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-muted)',
        transition: 'background var(--transition-fast), color var(--transition-fast)',
      }}
    >
      <motion.div
        key={dark ? 'moon' : 'sun'}
        initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
        transition={{ duration: 0.26 }}
      >
        {dark ? <Sun size={17} /> : <Moon size={17} />}
      </motion.div>
    </motion.button>
  )
}