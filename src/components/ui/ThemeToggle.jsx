import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle({ size = 'md' }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  const iconSize = size === 'sm' ? 14 : 16

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: size === 'sm' ? '5px 8px' : '7px 11px',
        borderRadius: 'var(--radius-full)',
        border: '1.5px solid var(--color-border)',
        background: 'var(--color-surface-offset)',
        color: 'var(--color-text-muted)',
        cursor: 'pointer',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        lineHeight: 1,
        flexShrink: 0,
        transition: 'background 180ms, color 180ms, border-color 180ms',
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
      {isDark ? <Sun size={iconSize} /> : <Moon size={iconSize} />}
      {size !== 'sm' && <span>{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  )
}
