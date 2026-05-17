import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle({ size = 'md' }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  const dim = size === 'sm' ? 14 : 16
  const pad = size === 'sm' ? '6px 8px' : '8px 10px'

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: pad,
        borderRadius: 'var(--radius-full)',
        border: '1.5px solid var(--color-border)',
        background: 'var(--color-surface-offset)',
        color: 'var(--color-text-muted)',
        cursor: 'pointer',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        transition: 'all 180ms cubic-bezier(0.16,1,0.3,1)',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--color-surface-dynamic)'
        e.currentTarget.style.color = 'var(--color-text)'
        e.currentTarget.style.borderColor = 'var(--color-text-faint)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--color-surface-offset)'
        e.currentTarget.style.color = 'var(--color-text-muted)'
        e.currentTarget.style.borderColor = 'var(--color-border)'
      }}
    >
      {isDark
        ? <><Sun size={dim} /><span>{size !== 'sm' && 'Light'}</span></>
        : <><Moon size={dim} /><span>{size !== 'sm' && 'Dark'}</span></>}
    </button>
  )
}
