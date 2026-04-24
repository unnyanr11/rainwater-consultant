/**
 * ScenarioPicker
 * 4-button grid for choosing a rainfall design scenario.
 * Animated selection indicator, recommended badge, value + description.
 *
 * Props:
 *   scenarios        – { minimum, average, maximum, optimistic } from fetchRainfallBreakdown()
 *   selectedScenario – active key string
 *   onChange         – (key: string) => void
 *   recommended      – key of recommended scenario (default: 'average')
 */
import { motion } from 'framer-motion'

const SCENARIO_ORDER  = ['minimum', 'average', 'maximum', 'optimistic']

const SCENARIO_META = {
  minimum:    { color: '#e8993a', bg: 'rgba(232,153,58,0.08)',  border: 'rgba(232,153,58,0.35)', icon: '☁' },
  average:    { color: '#0b6fb8', bg: 'rgba(11,111,184,0.08)', border: 'rgba(11,111,184,0.35)', icon: '🌧' },
  maximum:    { color: '#11a36a', bg: 'rgba(17,163,106,0.08)', border: 'rgba(17,163,106,0.35)', icon: '💧' },
  optimistic: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.35)', icon: '📈' },
}

export default function ScenarioPicker({ scenarios, selectedScenario, onChange, recommended = 'average' }) {
  if (!scenarios) return null

  return (
    <div>
      {/* Label */}
      <div style={{
        fontSize: 11, fontWeight: 700,
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: 10,
      }}>
        Choose Design Scenario
      </div>

      {/* Button grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {SCENARIO_ORDER.map((key, i) => {
          const s      = scenarios[key]
          const active = selectedScenario === key
          const meta   = SCENARIO_META[key]
          const isRec  = key === recommended

          return (
            <motion.button
              key={key}
              onClick={() => onChange(key)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              whileTap={{ scale: 0.97 }}
              style={{
                position:    'relative',
                padding:     '10px 12px',
                borderRadius: 'var(--radius-md)',
                border:      `1.5px solid ${active ? meta.border : 'var(--color-border)'}`,
                background:   active ? meta.bg : 'var(--color-surface)',
                textAlign:   'left',
                cursor:      'pointer',
                transition:  'border-color 180ms, background 180ms, box-shadow 180ms',
                boxShadow:   active ? `0 0 0 3px ${meta.bg}` : 'none',
              }}
            >
              {/* Recommended badge */}
              {isRec && (
                <span style={{
                  position:    'absolute',
                  top:         -8,
                  right:       8,
                  fontSize:    9,
                  fontWeight:  700,
                  color:       '#fff',
                  background:  meta.color,
                  borderRadius: 'var(--radius-full)',
                  padding:     '2px 7px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  Recommended
                </span>
              )}

              {/* Icon + label row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <span style={{ fontSize: 14, lineHeight: 1 }}>{meta.icon}</span>
                <span style={{
                  fontSize:   'var(--text-xs)',
                  fontWeight: 700,
                  color:      active ? meta.color : 'var(--color-text)',
                  transition: 'color 180ms',
                }}>
                  {s.label}
                </span>
              </div>

              {/* Value */}
              <div style={{
                fontSize:           20,
                fontWeight:         800,
                color:              active ? meta.color : 'var(--color-text-muted)',
                fontVariantNumeric: 'tabular-nums',
                lineHeight:         1,
                marginBottom:       3,
                transition:         'color 180ms',
              }}>
                {s.value?.toLocaleString('en-IN')}
                <span style={{ fontSize: 11, fontWeight: 600, marginLeft: 3 }}>mm</span>
              </div>

              {/* Description */}
              <div style={{
                fontSize:   10,
                color:      'var(--color-text-faint)',
                lineHeight: 1.4,
              }}>
                {s.desc}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Summary line */}
      {selectedScenario && scenarios[selectedScenario] && (
        <motion.div
          key={selectedScenario}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            marginTop:    10,
            padding:      '8px 12px',
            borderRadius: 'var(--radius-md)',
            background:   SCENARIO_META[selectedScenario].bg,
            border:       `1px solid ${SCENARIO_META[selectedScenario].border}`,
            fontSize:     12,
            color:        SCENARIO_META[selectedScenario].color,
            fontWeight:   600,
          }}
        >
          Using <strong>{scenarios[selectedScenario].label}</strong> — {scenarios[selectedScenario].value?.toLocaleString('en-IN')}mm/year for calculation
        </motion.div>
      )}
    </div>
  )
}