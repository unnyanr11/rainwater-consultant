import { useMemo } from 'react'

export default function RainOverlay({ count = 22, opacity = 0.55 }) {
  const drops = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${(i / count) * 100 + Math.random() * (100 / count)}%`,
      delay: `${(Math.random() * 4).toFixed(2)}s`,
      duration: `${(1.2 + Math.random() * 1.4).toFixed(2)}s`,
      height: `${55 + Math.floor(Math.random() * 40)}px`,
      opacity: (0.35 + Math.random() * 0.45).toFixed(2),
    })), [count]
  )

  return (
    <div
      className="rain-column"
      style={{ opacity, pointerEvents: 'none', zIndex: 0 }}
      aria-hidden="true"
    >
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="rain-drop"
          style={{
            left: drop.left,
            height: drop.height,
            animationDuration: drop.duration,
            animationDelay: drop.delay,
            opacity: drop.opacity,
          }}
        />
      ))}
    </div>
  )
}