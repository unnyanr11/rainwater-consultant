export default function WaveDivider({ flip, color = 'var(--color-bg)' }) {
  return (
    <div style={{ overflow: 'hidden', lineHeight: 0, transform: flip ? 'scaleY(-1)' : undefined }}>
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none"
        style={{ display: 'block', width: '100%', height: 60 }}>
        <path
          d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
          fill={color}
        />
      </svg>
    </div>
  )
}