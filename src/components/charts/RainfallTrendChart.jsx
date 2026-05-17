import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer
} from 'recharts'
import { motion } from 'framer-motion'

// Map scenario key → dashed line color
const SCENARIO_COLORS = {
  minimum:    '#e8993a',
  average:    '#0b6fb8',
  maximum:    '#11a36a',
  optimistic: '#8b5cf6',
}

// Custom animated dot — normal dots are blue, min/max are highlighted
function CustomDot({ cx, cy, payload, scenarios, selectedScenario }) {
  const isMin = payload.mm === scenarios.minimum.value
  const isMax = payload.mm === scenarios.maximum.value
  const highlight = isMin || isMax

  return (
    <motion.circle
      key={`dot-${payload.year}`}
      cx={cx}
      cy={cy}
      r={highlight ? 7 : 5}
      fill={isMin ? '#e8993a' : isMax ? '#11a36a' : '#52b5e8'}
      stroke="#fff"
      strokeWidth={2}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.05 * (payload.index || 0), ease: [0.16, 1, 0.3, 1] }}
      style={{ filter: highlight ? 'drop-shadow(0 0 4px currentColor)' : 'none' }}
    />
  )
}

// Custom tooltip card
function CustomTooltip({ active, payload, label, scenarios }) {
  if (!active || !payload?.length) return null
  const mm = payload[0]?.value
  const isMin = mm === scenarios.minimum.value
  const isMax = mm === scenarios.maximum.value

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3) var(--space-4)',
        boxShadow: 'var(--shadow-md)',
        fontFamily: 'var(--font-body)',
        minWidth: 120,
      }}
    >
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{
        fontSize: 'var(--text-lg)',
        fontWeight: 800,
        color: isMin ? '#e8993a' : isMax ? '#11a36a' : '#0b6fb8',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {mm?.toLocaleString('en-IN')} mm
      </div>
      {isMin && (
        <div style={{ fontSize: 'var(--text-xs)', color: '#e8993a', marginTop: 2 }}>Driest year</div>
      )}
      {isMax && (
        <div style={{ fontSize: 'var(--text-xs)', color: '#11a36a', marginTop: 2 }}>Wettest year</div>
      )}
    </motion.div>
  )
}

export default function RainfallTrendChart({ data, selectedScenario, scenarios }) {
  const [animated, setAnimated] = useState(false)

  // Recharts line draw animation triggers on mount
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80)
    return () => clearTimeout(t)
  }, [data])

  const scenarioColor = SCENARIO_COLORS[selectedScenario]
  const scenarioVal = scenarios[selectedScenario]?.value

  // Add index to each data point for dot stagger
  const chartData = data.map((d, i) => ({ ...d, index: i }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ marginBottom: 'var(--space-4)' }}
    >
      {/* Chart header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-3)',
      }}>
        <div>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Annual Rainfall Trend
          </span>
          <span style={{ marginLeft: 8, fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
            {data[0]?.year}–{data[data.length - 1]?.year} · Open-Meteo historical data
          </span>
        </div>

        {/* Legend dots */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
          {[
            { color: '#e8993a', label: 'Driest' },
            { color: '#11a36a', label: 'Wettest' },
            { color: '#52b5e8', label: 'Other years' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 16, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="oklch(from var(--color-text, #28251d) l c h / 0.07)"
            vertical={false}
          />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fontFamily: 'var(--font-body)', fill: 'var(--color-text-muted)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fontFamily: 'var(--font-body)', fill: 'var(--color-text-muted)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}mm`}
            width={52}
          />
          <Tooltip
            content={<CustomTooltip scenarios={scenarios} />}
            cursor={{ stroke: 'var(--color-border)', strokeWidth: 1, strokeDasharray: '4 4' }}
          />

          {/* Selected scenario reference line */}
          <ReferenceLine
            y={scenarioVal}
            stroke={scenarioColor}
            strokeWidth={2}
            strokeDasharray="8 5"
            label={{
              value: `${scenarios[selectedScenario].label}: ${scenarioVal}mm`,
              position: 'insideTopRight',
              fontSize: 11,
              fontFamily: 'var(--font-body)',
              fill: scenarioColor,
              fontWeight: 700,
            }}
          />

          {/* The line itself */}
          <Line
            type="monotone"
            dataKey="mm"
            stroke="#52b5e8"
            strokeWidth={2.5}
            dot={(props) => (
              <CustomDot
                key={props.payload.year}
                {...props}
                scenarios={scenarios}
                selectedScenario={selectedScenario}
              />
            )}
            activeDot={{ r: 8, fill: '#0b6fb8', stroke: '#fff', strokeWidth: 2 }}
            // Recharts built-in line draw animation
            isAnimationActive={animated}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Area under the line — subtle fill via gradient */}
      <style>{`
        .recharts-line-curve {
          filter: drop-shadow(0 2px 6px rgba(11, 111, 184, 0.2));
        }
      `}</style>
    </motion.div>
  )
}