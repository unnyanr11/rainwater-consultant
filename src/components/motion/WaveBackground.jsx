export default function WaveBackground({
  height = 180,
  color1 = 'rgba(82,181,232,0.18)',
  color2 = 'rgba(11,111,184,0.10)',
  color3 = 'rgba(125,211,252,0.08)',
  className = '',
}) {
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <svg
        className="wave-layer three"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, height: '100%', width: '120%' }}
        aria-hidden="true"
      >
        <path
          d="M0,80 C200,140 400,20 600,80 C800,140 1000,20 1200,80 C1320,120 1400,60 1440,80 L1440,160 L0,160 Z"
          fill={color3}
        />
      </svg>

      <svg
        className="wave-layer two"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, height: '85%', width: '120%' }}
        aria-hidden="true"
      >
        <path
          d="M0,60 C180,110 360,10 540,60 C720,110 900,10 1080,60 C1260,110 1380,30 1440,60 L1440,160 L0,160 Z"
          fill={color2}
        />
      </svg>

      <svg
        className="wave-layer one"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, height: '70%', width: '120%' }}
        aria-hidden="true"
      >
        <path
          d="M0,40 C160,90 320,0 480,40 C640,80 800,0 960,40 C1120,80 1280,20 1440,40 L1440,160 L0,160 Z"
          fill={color1}
        />
      </svg>
    </div>
  )
}