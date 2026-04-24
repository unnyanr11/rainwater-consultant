/**
 * ResultsPanel
 * Displays calculation results: liquid meters, stat grid, CO2 strip, CTA.
 *
 * Props:
 *   result       – result object from calculate()
 *   breakdown    – breakdown object from useCityRainfallBreakdown
 *   selectedCity – city object
 */
import { motion } from 'framer-motion'
import { Droplets, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import LiquidMeter from '../motion/LiquidMeter'
import RippleButton from '../motion/RippleButton'

function AnimatedNumber({ value, unit = '' }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!value) { setDisplay(0); return }
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / 1200, 1)
      setDisplay(Math.floor((1 - Math.pow(1 - p, 3)) * value))
      if (p < 1) requestAnimationFrame(step)
      else setDisplay(value)
    }
    requestAnimationFrame(step)
  }, [value])
  return <span>{display.toLocaleString('en-IN')}{unit}</span>
}

const STATS = (r) => [
  { label: 'Annual Harvest',     value: r.annualHarvest, unit: ' L',     color: '#0b6fb8' },
  { label: 'Daily Average',      value: r.dailyAvg,      unit: ' L/day', color: '#52b5e8' },
  { label: 'Recommended Tank',   value: r.tankSize,      unit: ' L',     color: '#11a36a' },
  { label: 'Est. Annual Saving', value: r.annualSaving,  unit: ' ₹',     color: '#d98c11' },
]

export default function ResultsPanel({ result, breakdown, selectedCity }) {
  if (!result) return null

  return (
    <div style={{
      background:   'var(--color-surface)',
      borderRadius: 'var(--radius-xl)',
      border:       '1px solid var(--color-border)',
      padding:      'var(--space-8)',
      boxShadow:    'var(--shadow-md)',
      position:     'sticky',
      top:          90,
    }}>

      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{
          fontFamily:   'var(--font-display)',
          fontSize:     'var(--text-xl)',
          fontWeight:   700,
          color:        'var(--color-text)',
          marginBottom: 4,
        }}>
          Your Rainwater Potential
        </h2>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
          {breakdown?.scenarios[result.scenario]?.label ?? result.scenario} scenario
          {' · '}{result.rainfall}mm/yr
          {selectedCity ? ` · ${selectedCity.name}` : ''}
        </p>
      </div>

      {/* Liquid meters */}
      <div style={{
        display:         'flex',
        justifyContent:  'center',
        gap:             'var(--space-8)',
        marginBottom:    'var(--space-8)',
        flexWrap:        'wrap',
      }}>
        <LiquidMeter value={result.selfSufficiency} max={100} label="Self Sufficiency" color="#0b6fb8" size={96} />
        <LiquidMeter value={Math.min(100, Math.round((result.annualHarvest / 500000) * 100))} max={100} label="Harvest Level" color="#52b5e8" size={96} />
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        {STATS(result).map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            style={{
              padding:      'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              background:   'var(--color-surface-offset)',
              border:       '1px solid var(--color-border)',
            }}
          >
            <div style={{
              fontFamily:         'var(--font-display)',
              fontSize:           'var(--text-xl)',
              fontWeight:         700,
              color:              stat.color,
              lineHeight:         1,
              fontVariantNumeric: 'tabular-nums',
            }}>
              <AnimatedNumber value={stat.value} unit={stat.unit} />
            </div>
            <div style={{
              fontSize:      'var(--text-xs)',
              color:         'var(--color-text-faint)',
              marginTop:     'var(--space-1)',
              fontWeight:    600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* CO2 strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          8,
          padding:      'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          background:   'rgba(17,163,106,0.07)',
          border:       '1px solid rgba(17,163,106,0.18)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <Droplets size={16} style={{ color: '#11a36a', flexShrink: 0 }} />
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Saves approximately{' '}
          <strong style={{ color: '#11a36a' }}>{result.co2Saved} kg CO₂</strong>
          {' '}equivalent per year
        </span>
      </motion.div>

      <RippleButton icon={<ArrowRight size={15} />} style={{ width: '100%' }}>
        Get Professional Design for This System
      </RippleButton>

      <p style={{
        fontSize:   'var(--text-xs)',
        color:      'var(--color-text-faint)',
        marginTop:  'var(--space-3)',
        lineHeight: 1.5,
      }}>
        * Estimates based on Open-Meteo historical data
        {breakdown?.dataRange ? ` (${breakdown.dataRange})` : ''}.
        Actual harvest depends on site conditions, first-flush losses,
        and seasonal variation.
      </p>
    </div>
  )
}