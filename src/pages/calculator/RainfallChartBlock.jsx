/**
 * RainfallChartBlock
 * Wraps the trend chart + scenario picker.
 * Shows loading state, error state, and the chart when ready.
 *
 * Props:
 *   selectedCity     – { name, latitude, longitude } or null
 *   selectedScenario – string key
 *   onScenarioChange – (key) => void
 */
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CloudOff } from 'lucide-react'
import RainfallTrendChart from '../charts/RainfallTrendChart'
import ScenarioPicker from '../charts/ScenarioPicker'
import { useCityRainfallBreakdown } from '../../hooks/useCityRainfallBreakdown'

export default function RainfallChartBlock({ selectedCity, selectedScenario, onScenarioChange }) {
  const {
    breakdown,
    loading,
    error,
  } = useCityRainfallBreakdown(selectedCity?.latitude, selectedCity?.longitude)

  return (
    <AnimatePresence mode="wait">

      {/* Not yet selected */}
      {!selectedCity && (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            padding:      'var(--space-6)',
            borderRadius: 'var(--radius-lg)',
            background:   'var(--color-surface-offset)',
            border:       '1px dashed var(--color-border)',
            textAlign:    'center',
            color:        'var(--color-text-faint)',
            fontSize:     'var(--text-sm)',
          }}
        >
          Search for a city above to see its 10-year rainfall trend.
        </motion.div>
      )}

      {/* Loading */}
      {selectedCity && loading && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          10,
            padding:      'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            background:   'var(--color-surface-offset)',
            border:       '1px solid var(--color-border)',
            color:        'var(--color-text-muted)',
            fontSize:     'var(--text-sm)',
          }}
        >
          <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          Fetching 10-year rainfall data for {selectedCity.name}…
        </motion.div>
      )}

      {/* Error */}
      {selectedCity && !loading && error && (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          10,
            padding:      'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            background:   'var(--color-error-highlight)',
            border:       '1px solid var(--color-error)',
            color:        'var(--color-error)',
            fontSize:     'var(--text-sm)',
          }}
        >
          <CloudOff size={14} style={{ flexShrink: 0 }} />
          Could not load rainfall data. Check your connection and try again.
        </motion.div>
      )}

      {/* Chart + picker */}
      {selectedCity && !loading && !error && breakdown && (
        <motion.div
          key={`chart-${selectedCity.id}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background:   'var(--color-surface-offset)',
            borderRadius: 'var(--radius-lg)',
            padding:      'var(--space-5)',
            border:       '1px solid var(--color-border)',
          }}
        >
          <RainfallTrendChart
            data={breakdown.yearly}
            selectedScenario={selectedScenario}
            scenarios={breakdown.scenarios}
            dataRange={breakdown.dataRange}
          />

          <div style={{ marginTop: 'var(--space-5)' }}>
            <ScenarioPicker
              scenarios={breakdown.scenarios}
              selectedScenario={selectedScenario}
              onChange={onScenarioChange}
              recommended={breakdown.recommended}
            />
          </div>
        </motion.div>
      )}

    </AnimatePresence>
  )
}