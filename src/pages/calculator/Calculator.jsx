/**
 * Calculator.jsx
 * Rainwater harvesting calculator.
 * Rainfall data: Open-Meteo 10-year historical via useCityRainfallBreakdown
 *
 * Changes from original:
 * - City selection replaced with CitySearchInput (search + detect location)
 * - useRainfallData removed from city flow — CitySearchInput owns city selection
 * - selectedCity is now direct object state, not derived from cities array
 * - useEffect deps fixed (no missing dependency warnings)
 * - reset() also clears selectedCity breakdown
 * - Results subtitle shows city name from selectedCity object
 */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudRain, Droplets, ArrowRight, RotateCcw, Loader2 } from 'lucide-react'

import PageTransition from '../../components/motion/PageTransition'
import WaveBackground from '../../components/motion/WaveBackground'
import RainOverlay    from '../../components/motion/RainOverlay'
import RippleButton   from '../../components/motion/RippleButton'
import RevealBlock    from '../../components/motion/RevealBlock'
import LiquidMeter    from '../../components/motion/LiquidMeter'

import RainfallTrendChart from '../../components/charts/RainfallTrendChart'
import ScenarioPicker     from '../../components/charts/ScenarioPicker'
import CitySearchInput    from './CitySearchInput'

import { useRoofTypes }             from '../../hooks/useRoofTypes'
import { usePropertyTypes }         from '../../hooks/usePropertyTypes'
import { useCityRainfallBreakdown } from '../../hooks/useCityRainfallBreakdown'

const CO2_PER_LITRE     = 0.0003
const WATER_RATE_PER_KL = 45

// ─── AnimatedNumber ────────────────────────────────────────────────────────────

function AnimatedNumber({ value, unit = '' }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!value) { setDisplay(0); return }
    let start  = null
    let rafId  = null
    const duration = 1200
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(eased * value))
      if (progress < 1) rafId = requestAnimationFrame(step)
      else              setDisplay(value)
    }
    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [value])

  return <span>{display.toLocaleString('en-IN')}{unit}</span>
}

// ─── Shared styles ─────────────────────────────────────────────────────────────

const inputStyle = {
  width:        '100%',
  padding:      'var(--space-3) var(--space-4)',
  borderRadius: 'var(--radius-md)',
  border:       '1.5px solid var(--color-border)',
  background:   'var(--color-surface)',
  color:        'var(--color-text)',
  fontFamily:   'var(--font-body)',
  fontSize:     'var(--text-sm)',
  outline:      'none',
  transition:   'border-color 180ms, box-shadow 180ms',
}

const labelStyle = {
  display:       'block',
  fontFamily:    'var(--font-body)',
  fontSize:      'var(--text-xs)',
  fontWeight:    700,
  color:         'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom:  'var(--space-2)',
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ height = 44, borderRadius = 'var(--radius-md)' }) {
  return (
    <div style={{
      height,
      borderRadius,
      background:     'linear-gradient(90deg, var(--color-surface-offset) 25%, var(--color-surface-dynamic) 50%, var(--color-surface-offset) 75%)',
      backgroundSize: '200% 100%',
      animation:      'shimmer 1.5s ease-in-out infinite',
    }} />
  )
}

// ─── Calculator ────────────────────────────────────────────────────────────────

export default function Calculator() {
  // City is now owned as a direct object — not derived from a Supabase list
  const [selectedCity, setSelectedCity] = useState(null)

  const { data: roofTypes,     loading: loadingRoofs } = useRoofTypes()
  const { data: propertyTypes, loading: loadingProps } = usePropertyTypes()

  const [form, setForm] = useState({
    roofArea:     '',
    roofTypeId:   '',
    propertyType: '',
    persons:      '',
  })

  const [selectedScenario, setSelectedScenario] = useState('average')
  const [result,           setResult]           = useState(null)
  const [calculated,       setCalculated]       = useState(false)

  // Feed coordinates from whichever source provided selectedCity
  // (Supabase cache, Open-Meteo search result, or detected location)
  const { breakdown, loading: loadingBreakdown } =
    useCityRainfallBreakdown(selectedCity?.cached_lat, selectedCity?.cached_lon)

  const update = useCallback((k, v) => setForm((f) => ({ ...f, [k]: v })), [])

  // ── Default roof/property type on first load ──────────────────────────────
  useEffect(() => {
    if (roofTypes.length && !form.roofTypeId) {
      update('roofTypeId', roofTypes[0].id)
    }
  }, [roofTypes, form.roofTypeId, update])

  useEffect(() => {
    if (propertyTypes.length && !form.propertyType) {
      update('propertyType', propertyTypes[0].name)
    }
  }, [propertyTypes, form.propertyType, update])

  // ── Reset results when city changes ──────────────────────────────────────
  useEffect(() => {
    setSelectedScenario('average')
    setResult(null)
    setCalculated(false)
  }, [selectedCity?.id])

  // ── City selection handler ────────────────────────────────────────────────
  const handleCitySelect = useCallback((city) => {
    setSelectedCity(city)
    // If city carries a pre-cached avg, no need to wait for breakdown
    // useCityRainfallBreakdown will fetch fresh data automatically
  }, [])

  // ── Calculate ─────────────────────────────────────────────────────────────

  const calculate = useCallback(() => {
    if (!selectedCity) return

    const rainfall = breakdown
      ? breakdown.scenarios[selectedScenario].value
      : (selectedCity?.cached_avg_mm ?? 800)

    const selectedRoof = roofTypes.find((r) => r.id === form.roofTypeId)
    const selectedProp = propertyTypes.find((p) => p.name === form.propertyType)

    const coeff           = selectedRoof?.runoff_coefficient ?? 0.80
    const area            = parseFloat(form.roofArea) || 0
    const persons         = parseInt(form.persons, 10) || 1
    const demandPerPerson = selectedProp?.daily_water_demand_lpcd ?? 135

    if (area <= 0) return

    const annualHarvest   = Math.round(area * (rainfall / 1000) * coeff * 1000)
    const dailyAvg        = Math.round(annualHarvest / 365)
    const dailyDemand     = persons * demandPerPerson
    const selfSufficiency = Math.min(100, Math.round((dailyAvg / dailyDemand) * 100))
    const tankSize        = Math.round(dailyAvg * 15)
    const annualSaving    = Math.round((annualHarvest / 1000) * WATER_RATE_PER_KL)
    const co2Saved        = Math.round(annualHarvest * CO2_PER_LITRE)

    setResult({
      annualHarvest, dailyAvg, selfSufficiency,
      tankSize, annualSaving, co2Saved,
      rainfall, scenario: selectedScenario,
    })
    setCalculated(true)
  }, [
    selectedCity, breakdown, selectedScenario,
    roofTypes, propertyTypes, form,
  ])

  const reset = useCallback(() => {
    setResult(null)
    setCalculated(false)
    setSelectedScenario('average')
  }, [])

  // ── Derived city display name ─────────────────────────────────────────────
  const cityDisplayName = selectedCity?.city || selectedCity?.name || null

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        input:focus, select:focus {
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 3px var(--color-primary-highlight);
        }
      `}</style>

      <PageTransition>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <RainOverlay count={16} opacity={0.3} />

          {/* ── Hero ── */}
          <section style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-16)', position: 'relative' }}>
            <div className="container">
              <RevealBlock>
                <span className="eyebrow" style={{ marginBottom: 'var(--space-4)' }}>
                  <CloudRain size={13} /> Rainwater Calculator
                </span>
              </RevealBlock>
              <RevealBlock delay={0.08}>
                <h1 style={{
                  fontFamily:    'var(--font-display)',
                  fontSize:      'var(--text-3xl)',
                  fontWeight:    700,
                  letterSpacing: '-0.04em',
                  color:         'var(--color-text)',
                  maxWidth:      '18ch',
                  marginBottom:  'var(--space-4)',
                  lineHeight:    1,
                }}>
                  How much rain <span className="text-gradient">can you harvest?</span>
                </h1>
              </RevealBlock>
              <RevealBlock delay={0.14}>
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', maxWidth: '50ch', lineHeight: 1.7 }}>
                  Enter your roof details and city. We pull 10 years of real rainfall data
                  and let you choose your design scenario before calculating your system.
                </p>
              </RevealBlock>
            </div>
            <WaveBackground height={100} />
          </section>

          {/* ── Calculator section ── */}
          <section className="section" style={{ paddingTop: 'var(--space-6)' }}>
            <div className="container">
              <div style={{
                display:             'grid',
                gridTemplateColumns: calculated ? '1fr 1fr' : '1fr',
                gap:                 'var(--space-8)',
                alignItems:          'start',
              }}>

                {/* ── Left: Form ── */}
                <RevealBlock>
                  <div style={{
                    background:   'var(--color-surface)',
                    borderRadius: 'var(--radius-xl)',
                    border:       '1px solid var(--color-border)',
                    padding:      'var(--space-8)',
                    boxShadow:    'var(--shadow-md)',
                  }}>
                    <h2 style={{
                      fontFamily:   'var(--font-display)',
                      fontSize:     'var(--text-xl)',
                      fontWeight:   700,
                      color:        'var(--color-text)',
                      marginBottom: 'var(--space-6)',
                    }}>
                      Your Site Details
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

                      {/* ── City — replaced static select with CitySearchInput ── */}
                      <CitySearchInput
                        onSelect={handleCitySelect}
                        selectedCity={selectedCity}
                        inputStyle={inputStyle}
                        labelStyle={labelStyle}
                      />

                      {/* ── 10-year rainfall chart ── */}
                      <AnimatePresence mode="wait">
                        {selectedCity && loadingBreakdown && (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                              display:      'flex',
                              alignItems:   'center',
                              gap:          8,
                              color:        'var(--color-text-muted)',
                              fontSize:     'var(--text-sm)',
                              padding:      'var(--space-4)',
                              background:   'var(--color-surface-offset)',
                              borderRadius: 'var(--radius-md)',
                            }}
                          >
                            <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                            Fetching 10-year rainfall data for {cityDisplayName}…
                          </motion.div>
                        )}

                        {selectedCity && !loadingBreakdown && breakdown && (
                          <motion.div
                            key="chart"
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
                                onChange={setSelectedScenario}
                                recommended={breakdown.recommended}
                              />
                            </div>
                          </motion.div>
                        )}

                        {/* No city selected yet — prompt */}
                        {!selectedCity && (
                          <motion.div
                            key="no-city"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                              padding:      'var(--space-5)',
                              borderRadius: 'var(--radius-md)',
                              background:   'var(--color-surface-offset)',
                              border:       '1px dashed var(--color-border)',
                              textAlign:    'center',
                              fontSize:     'var(--text-sm)',
                              color:        'var(--color-text-faint)',
                            }}
                          >
                            Search a city or use current location to load rainfall data
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* ── Roof area ── */}
                      <div>
                        <label style={labelStyle}>Rooftop / Catchment Area (sq.m)</label>
                        <input
                          type="number"
                          value={form.roofArea}
                          onChange={(e) => update('roofArea', e.target.value)}
                          placeholder="e.g. 200"
                          style={inputStyle}
                          min={0}
                        />
                      </div>

                      {/* ── Roof type ── */}
                      <div>
                        <label style={labelStyle}>Roof Surface Type</label>
                        {loadingRoofs ? <Skeleton height={140} /> : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {roofTypes.map((rt) => {
                              const active = form.roofTypeId === rt.id
                              return (
                                <label
                                  key={rt.id}
                                  style={{
                                    display:      'flex',
                                    alignItems:   'center',
                                    gap:          'var(--space-3)',
                                    padding:      'var(--space-3) var(--space-4)',
                                    borderRadius: 'var(--radius-md)',
                                    border:       `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                    background:   active ? 'var(--color-primary-highlight)' : 'var(--color-surface)',
                                    cursor:       'pointer',
                                    transition:   'all 180ms',
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name="roofType"
                                    checked={active}
                                    onChange={() => update('roofTypeId', rt.id)}
                                    style={{ accentColor: 'var(--color-primary)' }}
                                  />
                                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', flex: 1 }}>
                                    {rt.label}
                                    <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-xs)', marginLeft: 6 }}>
                                      ({(rt.runoff_coefficient * 100).toFixed(0)}% runoff efficiency)
                                    </span>
                                  </span>
                                  {rt.notes && (
                                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
                                      {rt.notes}
                                    </span>
                                  )}
                                </label>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* ── Property type ── */}
                      <div>
                        <label style={labelStyle}>Property Type</label>
                        {loadingProps ? <Skeleton /> : (
                          <select
                            value={form.propertyType}
                            onChange={(e) => update('propertyType', e.target.value)}
                            style={inputStyle}
                          >
                            {propertyTypes.map((p) => (
                              <option key={p.id} value={p.name}>
                                {p.name} — {p.daily_water_demand_lpcd}L/person/day
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* ── Persons ── */}
                      <div>
                        <label style={labelStyle}>Number of Persons / Occupants</label>
                        <input
                          type="number"
                          value={form.persons}
                          onChange={(e) => update('persons', e.target.value)}
                          placeholder="e.g. 4"
                          style={inputStyle}
                          min={1}
                        />
                      </div>

                      {/* ── Buttons ── */}
                      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                        <RippleButton
                          onClick={calculate}
                          icon={<ArrowRight size={15} />}
                          disabled={
                            !selectedCity      ||
                            !form.roofArea     ||
                            !form.persons      ||
                            loadingBreakdown
                          }
                        >
                          {!selectedCity
                            ? 'Select a city first'
                            : loadingBreakdown
                              ? 'Loading rainfall data…'
                              : 'Calculate Now'
                          }
                        </RippleButton>
                        {calculated && (
                          <RippleButton variant="secondary" onClick={reset} icon={<RotateCcw size={15} />}>
                            Reset
                          </RippleButton>
                        )}
                      </div>

                    </div>
                  </div>
                </RevealBlock>

                {/* ── Right: Results ── */}
                <AnimatePresence>
                  {calculated && result && (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div style={{
                        background:   'var(--color-surface)',
                        borderRadius: 'var(--radius-xl)',
                        border:       '1px solid var(--color-border)',
                        padding:      'var(--space-8)',
                        boxShadow:    'var(--shadow-md)',
                        position:     'sticky',
                        top:          80,
                      }}>

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
                            Based on {breakdown?.scenarios[result.scenario]?.label ?? result.scenario} scenario
                            · {result.rainfall}mm/yr
                            {cityDisplayName && ` · ${cityDisplayName}`}
                          </p>
                        </div>

                        {/* Liquid meters */}
                        <div style={{
                          display:        'flex',
                          justifyContent: 'center',
                          gap:            'var(--space-8)',
                          marginBottom:   'var(--space-8)',
                          flexWrap:       'wrap',
                        }}>
                          <LiquidMeter
                            value={result.selfSufficiency}
                            max={100}
                            label="Self Sufficiency"
                            color="#0b6fb8"
                            size={96}
                          />
                          <LiquidMeter
                            value={Math.min(100, Math.round((result.annualHarvest / 500000) * 100))}
                            max={100}
                            label="Harvest Level"
                            color="#52b5e8"
                            size={96}
                          />
                        </div>

                        {/* Stats grid */}
                        <div style={{
                          display:             'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap:                 'var(--space-3)',
                          marginBottom:        'var(--space-5)',
                        }}>
                          {[
                            { label: 'Annual Harvest',     value: result.annualHarvest, unit: ' L',     color: '#0b6fb8' },
                            { label: 'Daily Average',      value: result.dailyAvg,      unit: ' L/day', color: '#52b5e8' },
                            { label: 'Recommended Tank',   value: result.tankSize,      unit: ' L',     color: '#11a36a' },
                            { label: 'Est. Annual Saving', value: result.annualSaving,  unit: ' ₹',     color: '#d98c11' },
                          ].map((stat, i) => (
                            <motion.div
                              key={stat.label}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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
                            <strong style={{ color: '#11a36a' }}>{result.co2Saved} kg CO₂</strong>{' '}
                            equivalent per year
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
                          * Estimates based on Open-Meteo historical data ({breakdown?.dataRange}).
                          Actual harvest depends on site conditions, first-flush losses, and seasonal
                          variation. A site assessment by a consultant is recommended before system design.
                        </p>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          </section>
        </div>
      </PageTransition>
    </>
  )
}