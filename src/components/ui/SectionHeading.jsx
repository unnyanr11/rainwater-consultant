import RevealBlock from '../motion/RevealBlock'

export default function SectionHeading({ eyebrow, title, subtitle, center = false, delay = 0 }) {
  return (
    <RevealBlock delay={delay}>
      <div style={{ textAlign: center ? 'center' : 'left', marginBottom: 'var(--space-10)' }}>
        {eyebrow && (
          <span className="eyebrow" style={{ marginBottom: 'var(--space-4)', display: 'inline-flex' }}>
            {eyebrow}
          </span>
        )}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            color: 'var(--color-text)',
            letterSpacing: '-0.03em',
            lineHeight: 1.06,
            marginBottom: subtitle ? 'var(--space-4)' : 0,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-muted)',
              maxWidth: center ? '52ch' : '60ch',
              margin: center ? '0 auto' : 0,
              lineHeight: 1.7,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </RevealBlock>
  )
}