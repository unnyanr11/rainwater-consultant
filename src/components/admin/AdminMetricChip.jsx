import { useEffect, useRef, useState } from 'react'

export default function AdminMetricChip({ label, value, sub, trend, delay = 0 }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      ref={ref}
      className={`admin-metric-chip ${visible ? 'chip-visible' : ''}`}
      style={{ '--chip-delay': `${delay}ms` }}
    >
      <small>{label}</small>
      <strong>{value}</strong>
      {sub && <span className="chip-sub">{sub}</span>}
      {trend !== undefined && (
        <span className={`chip-trend ${trend >= 0 ? 'up' : 'down'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
  )
}
