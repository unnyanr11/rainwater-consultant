import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudRain, Droplets, ArrowRight, RotateCcw, Loader2 } from 'lucide-react'

import Navbar              from '../../components/home/Navbar'
import WaveBackground      from '../../components/motion/WaveBackground'
import RippleButton        from '../../components/motion/RippleButton'
import LiquidMeter         from '../../components/motion/LiquidMeter'
import RainfallTrendChart  from '../../components/charts/RainfallTrendChart'
import ScenarioPicker      from '../../components/charts/ScenarioPicker'
import CitySearchInput     from './CitySearchInput'

import { useRoofTypes }             from '../../hooks/useRoofTypes'
import { useCityRainfallBreakdown } from '../../hooks/useCityRainfallBreakdown'

const CO2_PER_LITRE     = 0.0003
const WATER_RATE_PER_KL = 45
const SQFT_TO_SQM       = 0.0929

function AnimatedNumber({ value, unit = '' }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!value) { setDisplay(0); return }
    let start = null, rafId = null
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / 1200, 1)
      setDisplay(Math.floor((1 - Math.pow(1 - p, 3)) * value))
      if (p < 1) rafId = requestAnimationFrame(step)
      else setDisplay(value)
    }
    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [value])
  return <span>{display.toLocaleString('en-IN')}{unit}</span>
}

const inputStyle = {
  width: '100%',
  padding: 'var(--space-3) var(--space-4)',
  borderRadius: 'var(--radius-md)',
  border: '1.5px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  fontSize: 'var(--text-sm)',
  outline: 'none',
  transition: 'border-color 180ms, box-shadow 180ms',
}

const labelStyle = {
  display: 'block',
  fontSize: 'var(--text-xs)',
  fontWeight: 700,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: 'var(--space-2)',
}

export default function Calculator() {
  const navigate = useNavigate()
  const location = useLocation()
  const resultsRef = useRef(null)

  const isClientRoute = location.pathname.startsWith('/client')

  const [selectedCity, setSelectedCity] = useState(null)
  const { data: roofTypes } = useRoofTypes()
  const [form,             setForm]         = useState({ roofArea: '', roofTypeId: '', areaUnit: 'sqm' })
  const [selectedScenario, setSelectedScenario] = useState('average')
  const [result,           setResult]       = useState(null)
  const [calculated,       setCalculated]   = useState(false)

  const { breakdown, loading: loadingBreakdown } =
    useCityRainfallBreakdown(selectedCity?.cached_lat, selectedCity?.cached_lon)

  const update = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), [])

  useEffect(() => {
    if (roofTypes.length && !form.roofTypeId) update('roofTypeId', roofTypes[0].id)
  }, [roofTypes, form.roofTypeId, update])

  useEffect(() => {
    setSelectedScenario('average'); setResult(null); setCalculated(false)
  }, [selectedCity?.id])

  const calculate = useCallback(() => {
    if (!selectedCity) return
    const rainfall     = breakdown ? breakdown.scenarios[selectedScenario].value : (selectedCity?.cached_avg_mm ?? 800)
    const selectedRoof = roofTypes.find(r => r.id === form.roofTypeId)
    const coeff        = selectedRoof?.runoff_coefficient ?? 0.80
    const rawArea      = parseFloat(form.roofArea) || 0
    if (rawArea <= 0) return
    const areaSqM       = form.areaUnit === 'sqft' ? rawArea * SQFT_TO_SQM : rawArea
    const grossYield    = Math.round(areaSqM * rainfall)
    const annualHarvest = Math.round(grossYield * coeff)
    const dailyAvg      = Math.round(annualHarvest / 365)
    const tankSize      = Math.round(dailyAvg * 15)
    const annualSaving  = Math.round((annualHarvest / 1000) * WATER_RATE_PER_KL)
    const co2Saved      = Math.round(annualHarvest * CO2_PER_LITRE)
    setResult({
      grossYield, annualHarvest, dailyAvg, tankSize,
      annualSaving, co2Saved, rainfall, coeff,
      areaSqM: Math.round(areaSqM),
      scenario: selectedScenario,
    })
    setCalculated(true)
    // Scroll results into view on mobile after a short paint delay
    setTimeout(() => {
      if (window.innerWidth < 768 && resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 120)
  }, [selectedCity, breakdown, selectedScenario, roofTypes, form])

  const reset = useCallback(() => { setResult(null); setCalculated(false); setSelectedScenario('average') }, [])
  const cityDisplayName = selectedCity?.city || selectedCity?.name || null

  const goToProfessionalDesign = useCallback(() => {
    navigate('/get-professional-design', {
      state: {
        city:     cityDisplayName || '',
        state:    selectedCity?.state || '',
        roofArea: result?.areaSqM ? String(result.areaSqM) : form.roofArea,
      },
    })
  }, [navigate, cityDisplayName, selectedCity, result, form.roofArea])

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        input:focus, select:focus { border-color: var(--color-primary) !important; box-shadow: 0 0 0 3px var(--color-primary-highlight); }
        .calc-eyebrow { display:inline-flex; align-items:center; gap:6px; font-size:var(--text-xs); font-weight:700; text-transform:uppercase; letter-spacing:0.12em; color:var(--color-primary); margin-bottom:var(--space-3); }
        .calc-gradient { background:var(--gradient-water); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .unit-toggle button { padding:4px 12px; border:1.5px solid var(--color-border); background:transparent; color:var(--color-text-muted); font-size:var(--text-xs); font-weight:600; cursor:pointer; transition:all 150ms; }
        .unit-toggle button.active { background:var(--color-primary); border-color:var(--color-primary); color:#fff; }
        .unit-toggle button:first-child { border-radius:var(--radius-md) 0 0 var(--radius-md); border-right:none; }
        .unit-toggle button:last-child  { border-radius:0 var(--radius-md) var(--radius-md) 0; }

        /* Layout grid — side-by-side on desktop, single column on mobile */
        .calc-grid {
          display: grid;
          gap: var(--space-8);
          align-items: start;
        }
        .calc-grid.has-results {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 767px) {
          .calc-grid,
          .calc-grid.has-results {
            grid-template-columns: 1fr !important;
          }
          /* Remove sticky on mobile — results just flow below */
          .calc-results-sticky {
            position: static !important;
          }
        }
      `}</style>

      {!isClientRoute && <Navbar />}

      <div style={{ paddingTop: isClientRoute ? '0' : '64px' }}>

        {/* Hero */}
        <section style={{
          paddingTop:    'var(--space-8)',
          paddingBottom: 'var(--space-6)',
          position:      'relative',
          background:    'linear-gradient(160deg,#e8f4fd 0%,#f0f8ff 40%,#dff0ff 100%)',
          overflow:      'hidden',
        }}>
          <WaveBackground height={100} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <span className="calc-eyebrow">
              <CloudRain size={13} /> Rainwater Calculator
            </span>
            <h1 style={{
              fontFamily:    'var(--font-display)',
              fontSize:      'var(--text-3xl)',
              fontWeight:    700,
              letterSpacing: '-0.03em',
              color:         '#0a2540',
              maxWidth:      '16ch',
              marginBottom:  'var(--space-4)',
              lineHeight:    1.05,
            }}>
              How much rain{' '}
              <span className="calc-gradient">can you harvest?</span>
            </h1>
            <p style={{ fontSize:'var(--text-base)', color:'#3a5a7a', maxWidth:'52ch', lineHeight:1.7 }}>
              Enter your roof details and city. We pull 10 years of real rainfall data
              and let you choose your design scenario before calculating your system.
            </p>
          </div>
        </section>

        {/* Form + Results */}
        <section style={{ paddingTop:'var(--space-8)', paddingBottom:'var(--space-20)' }}>
          <div className="container">
            <div className={`calc-grid${calculated ? ' has-results' : ''}`}>

              {/* ── Form card ── */}
              <div style={{
                background:   'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                border:       '1px solid var(--color-border)',
                padding:      'var(--space-8)',
                boxShadow:    'var(--shadow-md)',
              }}>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'var(--text-xl)', fontWeight:700, color:'var(--color-text)', marginBottom:'var(--space-6)' }}>
                  Your Site Details
                </h2>

                <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-5)' }}>
                  <CitySearchInput
                    onSelect={setSelectedCity}
                    selectedCity={selectedCity}
                    inputStyle={inputStyle}
                    labelStyle={labelStyle}
                  />

                  <AnimatePresence mode="wait">
                    {selectedCity && loadingBreakdown && (
                      <motion.div key="loading"
                        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                        style={{ display:'flex', alignItems:'center', gap:8, color:'var(--color-text-muted)', fontSize:'var(--text-sm)', padding:'var(--space-4)', background:'var(--color-surface-offset)', borderRadius:'var(--radius-md)' }}>
                        <Loader2 size={14} style={{ animation:'spin 0.8s linear infinite' }} />
                        Fetching 10-year rainfall data for {cityDisplayName}…
                      </motion.div>
                    )}
                    {selectedCity && !loadingBreakdown && breakdown && (
                      <motion.div key="chart"
                        initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                        transition={{ duration:0.45, ease:[0.16,1,0.3,1] }}
                        style={{ background:'var(--color-surface-offset)', borderRadius:'var(--radius-lg)', padding:'var(--space-5)', border:'1px solid var(--color-border)' }}>
                        <RainfallTrendChart
                          data={breakdown.yearly}
                          selectedScenario={selectedScenario}
                          scenarios={breakdown.scenarios}
                          dataRange={breakdown.dataRange}
                        />
                        <div style={{ marginTop:'var(--space-5)' }}>
                          <ScenarioPicker
                            scenarios={breakdown.scenarios}
                            selectedScenario={selectedScenario}
                            onChange={setSelectedScenario}
                            recommended={breakdown.recommended}
                          />
                        </div>
                      </motion.div>
                    )}
                    {!selectedCity && (
                      <motion.div key="no-city"
                        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                        style={{ padding:'var(--space-5)', borderRadius:'var(--radius-md)', background:'var(--color-surface-offset)', border:'1px dashed var(--color-border)', textAlign:'center', fontSize:'var(--text-sm)', color:'var(--color-text-faint)' }}>
                        Search a city or use current location to load rainfall data
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Roof area with unit toggle ── */}
                  <div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'var(--space-2)' }}>
                      <label style={{ ...labelStyle, marginBottom:0 }}>Rooftop / Catchment Area</label>
                      <div className="unit-toggle" style={{ display:'flex' }}>
                        <button className={form.areaUnit === 'sqm'  ? 'active' : ''} onClick={() => update('areaUnit','sqm')}>sq.m</button>
                        <button className={form.areaUnit === 'sqft' ? 'active' : ''} onClick={() => update('areaUnit','sqft')}>sq.ft</button>
                      </div>
                    </div>
                    <input
                      type="number" value={form.roofArea} min={0}
                      onChange={e => update('roofArea', e.target.value)}
                      placeholder={form.areaUnit === 'sqm' ? 'e.g. 100 sq.m' : 'e.g. 1000 sq.ft'}
                      style={inputStyle}
                    />
                    {form.roofArea && form.areaUnit === 'sqft' && (
                      <p style={{ fontSize:'var(--text-xs)', color:'var(--color-text-faint)', marginTop:4 }}>
                        ≈ {Math.round(parseFloat(form.roofArea) * SQFT_TO_SQM)} sq.m
                      </p>
                    )}
                  </div>

                  <div style={{ display:'flex', gap:'var(--space-3)', flexWrap:'wrap' }}>
                    <RippleButton
                      onClick={calculate}
                      icon={<ArrowRight size={15} />}
                      disabled={!selectedCity || !form.roofArea || loadingBreakdown}
                    >
                      {!selectedCity ? 'Select a city first' : loadingBreakdown ? 'Loading data…' : 'Calculate Now'}
                    </RippleButton>
                    {calculated && (
                      <RippleButton variant="secondary" onClick={reset} icon={<RotateCcw size={15} />}>
                        Reset
                      </RippleButton>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Results panel ── */}
              <AnimatePresence>
                {calculated && result && (
                  <motion.div
                    key="results"
                    ref={resultsRef}
                    initial={{ opacity:0, y: 32 }}
                    animate={{ opacity:1, y: 0 }}
                    exit={{ opacity:0, y: 32 }}
                    transition={{ duration:0.55, ease:[0.16,1,0.3,1] }}
                  >
                    <div className="calc-results-sticky" style={{ background:'var(--color-surface)', borderRadius:'var(--radius-xl)', border:'1px solid var(--color-border)', padding:'var(--space-8)', boxShadow:'var(--shadow-md)', position:'sticky', top:80 }}>
                      <div style={{ marginBottom:'var(--space-6)' }}>
                        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'var(--text-xl)', fontWeight:700, color:'var(--color-text)', marginBottom:4 }}>Your Rainwater Potential</h2>
                        <p style={{ fontSize:'var(--text-xs)', color:'var(--color-text-faint)' }}>
                          Based on {breakdown?.scenarios[result.scenario]?.label ?? result.scenario} · {result.rainfall}mm/yr{cityDisplayName && ` · ${cityDisplayName}`}
                        </p>
                      </div>

                      {/* Formula breakdown */}
                      <div style={{ padding:'var(--space-4)', borderRadius:'var(--radius-lg)', background:'var(--color-surface-offset)', border:'1px solid var(--color-border)', marginBottom:'var(--space-5)', fontSize:'var(--text-xs)', color:'var(--color-text-muted)', lineHeight:1.8 }}>
                        <div style={{ fontWeight:700, color:'var(--color-text)', marginBottom:4 }}>How this was calculated</div>
                        <div>Gross Yield = {result.areaSqM} m² × {result.rainfall} mm = <strong style={{ color:'var(--color-primary)' }}>{result.grossYield.toLocaleString('en-IN')} L/yr</strong></div>
                        <div>Net Yield = {result.grossYield.toLocaleString('en-IN')} × {(result.coeff * 100).toFixed(0)}% runoff = <strong style={{ color:'var(--color-primary)' }}>{result.annualHarvest.toLocaleString('en-IN')} L/yr</strong></div>
                      </div>

                      <div style={{ display:'flex', justifyContent:'center', gap:'var(--space-8)', marginBottom:'var(--space-8)', flexWrap:'wrap' }}>
                        <LiquidMeter value={Math.min(100,Math.round((result.annualHarvest/500000)*100))} max={100} label="Harvest Level" color="#52b5e8" size={112} />
                      </div>

                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--space-3)', marginBottom:'var(--space-5)' }}>
                        {[
                          { label:'Gross Yield',        value:result.grossYield,    unit:' L',     color:'#3a7fbf' },
                          { label:'Net Annual Harvest',  value:result.annualHarvest, unit:' L',     color:'#0b6fb8' },
                          { label:'Daily Average',       value:result.dailyAvg,      unit:' L/day', color:'#52b5e8' },
                          { label:'Recommended Tank',    value:result.tankSize,      unit:' L',     color:'#11a36a' },
                          { label:'Est. Annual Saving',  value:result.annualSaving,  unit:' ₹',     color:'#d98c11' },
                        ].map((stat, i) => (
                          <motion.div key={stat.label}
                            initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                            transition={{ delay:i*0.07, duration:0.4 }}
                            style={{ padding:'var(--space-4)', borderRadius:'var(--radius-lg)', background:'var(--color-surface-offset)', border:'1px solid var(--color-border)' }}>
                            <div style={{ fontFamily:'var(--font-display)', fontSize:'var(--text-xl)', fontWeight:700, color:stat.color, lineHeight:1, fontVariantNumeric:'tabular-nums' }}>
                              <AnimatedNumber value={stat.value} unit={stat.unit} />
                            </div>
                            <div style={{ fontSize:'var(--text-xs)', color:'var(--color-text-faint)', marginTop:'var(--space-1)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em' }}>{stat.label}</div>
                          </motion.div>
                        ))}
                      </div>

                      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
                        style={{ display:'flex', alignItems:'center', gap:8, padding:'var(--space-4)', borderRadius:'var(--radius-lg)', background:'rgba(17,163,106,0.07)', border:'1px solid rgba(17,163,106,0.18)', marginBottom:'var(--space-6)' }}>
                        <Droplets size={16} style={{ color:'#11a36a', flexShrink:0 }} />
                        <span style={{ fontSize:'var(--text-sm)', color:'var(--color-text-muted)' }}>
                          Saves approximately <strong style={{ color:'#11a36a' }}>{result.co2Saved} kg CO₂</strong> equivalent per year
                        </span>
                      </motion.div>

                      {/* ── Professional Design CTA ── */}
                      <button
                        onClick={goToProfessionalDesign}
                        style={{
                          width: '100%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          padding: 'var(--space-4) var(--space-6)',
                          borderRadius: 'var(--radius-md)',
                          background: 'linear-gradient(135deg,#01696f 0%,#0f3638 100%)',
                          color: '#fff',
                          fontWeight: 700, fontSize: 'var(--text-sm)',
                          border: 'none', cursor: 'pointer',
                          boxShadow: '0 4px 14px oklch(from var(--color-primary) l c h / 0.35)',
                          transition: 'opacity 180ms, transform 180ms',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.92'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
                      >
                        <span style={{ fontSize: '1rem' }}>⭐</span>
                        Get Professional Design for This System
                        <ArrowRight size={15} />
                      </button>
                      <p style={{ fontSize:'var(--text-xs)', color:'var(--color-text-faint)', textAlign:'center', marginTop:'var(--space-2)' }}>Paid service · Expert engineers · Custom drawings</p>

                      <p style={{ fontSize:'var(--text-xs)', color:'var(--color-text-faint)', marginTop:'var(--space-3)', lineHeight:1.5 }}>
                        * Estimates based on Open-Meteo historical data ({breakdown?.dataRange}). Actual harvest depends on site conditions, first-flush losses, and seasonal variation.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
