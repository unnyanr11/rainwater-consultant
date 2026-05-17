import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudRain, Droplets, ArrowRight, RotateCcw, Loader2 } from 'lucide-react'

import RippleButton        from '../../../components/motion/RippleButton'
import LiquidMeter         from '../../../components/motion/LiquidMeter'
import RainfallTrendChart  from '../../../components/charts/RainfallTrendChart'
import ScenarioPicker      from '../../../components/charts/ScenarioPicker'
import CitySearchInput     from '../../calculator/CitySearchInput'

import { useRoofTypes }             from '../../../hooks/useRoofTypes'
import { useCityRainfallBreakdown } from '../../../hooks/useCityRainfallBreakdown'

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

export default function ClientCalculator() {
  const navigate  = useNavigate()
  const { roofTypes, loading: roofLoading } = useRoofTypes()

  /* ── form state ── */
  const [form, setForm] = useState({ roofType: '', roofArea: '', unit: 'sqft' })
  const [selectedCity,     setSelectedCity]     = useState(null)
  const [cityDisplayName,  setCityDisplayName]  = useState('')
  const [result,           setResult]           = useState(null)
  const [calculating,      setCalculating]      = useState(false)

  /* ── rainfall data ── */
  const {
    breakdown, annualMm,
    loading: rainfallLoading, error: rainfallError,
  } = useCityRainfallBreakdown(selectedCity?.id ?? null)

  /* ── set default roof type once loaded ── */
  useEffect(() => {
    if (roofTypes.length && !form.roofType)
      setForm(f => ({ ...f, roofType: roofTypes[0].id }))
  }, [roofTypes, form.roofType])

  /* ── calculate ── */
  const calculate = useCallback(() => {
    const raw   = parseFloat(form.roofArea)
    if (!raw || !selectedCity || !annualMm) return
    const areaSqm   = form.unit === 'sqft' ? raw * SQFT_TO_SQM : raw
    const roof      = roofTypes.find(r => r.id === form.roofType)
    const runoff    = roof?.runoff_coefficient ?? 0.85
    const litres    = areaSqm * (annualMm / 1000) * runoff * 1000
    const costSaved = (litres / 1000) * WATER_RATE_PER_KL
    const co2Saved  = litres * CO2_PER_LITRE
    setResult({ litres: Math.round(litres), costSaved: Math.round(costSaved), co2Saved: Math.round(co2Saved * 10) / 10 })
  }, [form, selectedCity, annualMm, roofTypes])

  const handleCalculate = async () => {
    setCalculating(true)
    await new Promise(r => setTimeout(r, 600))
    calculate()
    setCalculating(false)
  }

  const handleReset = () => {
    setForm({ roofType: roofTypes[0]?.id || '', roofArea: '', unit: 'sqft' })
    setSelectedCity(null)
    setCityDisplayName('')
    setResult(null)
  }

  const handleGetDesign = useCallback(() => {
    if (!cityDisplayName && !selectedCity && !result) return navigate('/client/request-design')
    navigate('/client/request-design', {
      state: {
        prefill: {
          city:    cityDisplayName,
          area:    form.roofArea,
          unit:    form.unit,
          litres:  result?.litres,
        },
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
      `}</style>

      <div>

        {/* Hero */}
        <section style={{
          paddingTop:    'var(--space-8)',
          paddingBottom: 'var(--space-6)',
          position:      'relative',
          background:    'linear-gradient(160deg,#e8f4fd 0%,#f0f8ff 40%,#dff0ff 100%)',
          overflow:      'hidden',
          borderRadius:  'var(--radius-lg)',
          marginBottom:  'var(--space-6)',
        }}>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <span className="calc-eyebrow">
              <CloudRain size={13} /> Rainwater Calculator
            </span>
            <h1 style={{
              fontFamily:    'var(--font-display)',
              fontSize:      'var(--text-2xl)',
              fontWeight:    700,
              letterSpacing: '-0.03em',
              color:         '#0a2540',
              maxWidth:      '16ch',
              marginBottom:  'var(--space-4)',
            }}>
              How much rain can your roof <em style={{ fontStyle: 'italic' }}>actually</em> harvest?
            </h1>
            <p style={{ fontSize: 'var(--text-base)', color: '#3a5a7a', maxWidth: '52ch', lineHeight: 1.7 }}>
              Enter your city and roof area to get a personalised annual harvest estimate — with seasonal charts and savings projections.
            </p>
          </div>
        </section>

        {/* ── Main content ── */}
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.5fr)',
            gap: 'var(--space-8)',
            alignItems: 'start',
          }}>

            {/* ─ Left: Inputs ─ */}
            <div style={{
              background: 'var(--color-surface)',
              border:     '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding:    'var(--space-6)',
              boxShadow:  'var(--shadow-sm)',
              display:    'flex', flexDirection: 'column', gap: 'var(--space-5)',
            }}>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 0 }}>
                Your details
              </h2>

              {/* City */}
              <div>
                <label style={labelStyle}>City / Location</label>
                <CitySearchInput
                  value={cityDisplayName}
                  onChange={setCityDisplayName}
                  onSelect={setSelectedCity}
                  inputStyle={inputStyle}
                />
                {rainfallError && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', marginTop: 4 }}>
                    Couldn't load rainfall data — try another city.
                  </p>
                )}
                {selectedCity && !rainfallLoading && annualMm && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', marginTop: 4, fontWeight: 600 }}>
                    ✓ {annualMm} mm annual average
                  </p>
                )}
              </div>

              {/* Roof type */}
              <div>
                <label style={labelStyle}>Roof Type</label>
                {roofLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Loading…
                  </div>
                ) : (
                  <select
                    style={inputStyle}
                    value={form.roofType}
                    onChange={e => setForm(f => ({ ...f, roofType: e.target.value }))}
                  >
                    {roofTypes.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({Math.round(r.runoff_coefficient * 100)}% runoff)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Roof area */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <label style={{ ...labelStyle, margin: 0 }}>Roof / Catchment Area</label>
                  <div className="unit-toggle">
                    <button className={form.unit === 'sqft' ? 'active' : ''} onClick={() => setForm(f => ({ ...f, unit: 'sqft' }))}>sq ft</button>
                    <button className={form.unit === 'sqm'  ? 'active' : ''} onClick={() => setForm(f => ({ ...f, unit: 'sqm'  }))}>sq m</button>
                  </div>
                </div>
                <input
                  type="number" min="0" placeholder={`e.g. ${form.unit === 'sqft' ? '1500' : '140'}`}
                  value={form.roofArea}
                  onChange={e => setForm(f => ({ ...f, roofArea: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <RippleButton
                  onClick={handleCalculate}
                  disabled={!form.roofArea || !selectedCity || calculating}
                  style={{
                    flex: 1, padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    background: (!form.roofArea || !selectedCity) ? 'var(--color-surface-offset)' : 'var(--color-primary)',
                    color: (!form.roofArea || !selectedCity) ? 'var(--color-text-muted)' : '#fff',
                    border: 'none', fontWeight: 700, fontSize: 'var(--text-sm)',
                    cursor: (!form.roofArea || !selectedCity) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {calculating
                    ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Calculating…</>
                    : <><CloudRain size={15} /> Calculate</>}
                </RippleButton>
                {result && (
                  <button onClick={handleReset} style={{
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface-offset)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)', cursor: 'pointer',
                  }}>
                    <RotateCcw size={15} />
                  </button>
                )}
              </div>

              {/* Liquid meter */}
              {result && (
                <div style={{ marginTop: 'var(--space-2)' }}>
                  <LiquidMeter percent={Math.min(100, Math.round(result.litres / 10000))} />
                </div>
              )}
            </div>

            {/* ─ Right: Results ─ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <AnimatePresence mode="wait">
                {!result && (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{
                      background: 'var(--color-surface)',
                      border: '1.5px dashed var(--color-border)',
                      borderRadius: 'var(--radius-xl)',
                      padding: 'var(--space-12) var(--space-8)',
                      textAlign: 'center',
                    }}
                  >
                    <Droplets size={36} style={{ color: 'var(--color-primary)', margin: '0 auto var(--space-4)' }} />
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                      Enter your city and roof area, then click <strong>Calculate</strong>.
                    </p>
                  </motion.div>
                )}

                {result && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
                  >
                    {/* Stat cards */}
                    {[
                      { label: 'Annual Harvest',  value: result.litres,   unit: ' L', color: 'var(--color-primary)',  bg: '#e8f4fd' },
                      { label: 'Cost Saved/yr',   value: result.costSaved, unit: '',  color: '#1a7a3a',             bg: '#e6f7ee', prefix: '₹' },
                      { label: 'CO₂ Offset',      value: result.co2Saved,  unit: ' kg', color: '#7a5c1a',           bg: '#fdf6e3' },
                    ].map(({ label, value, unit, color, bg, prefix = '' }) => (
                      <div key={label} style={{
                        background: bg,
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-5) var(--space-6)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color }}>{label}</span>
                        <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color }}>
                          {prefix}<AnimatedNumber value={value} unit={unit} />
                        </span>
                      </div>
                    ))}

                    {/* CTA */}
                    <button
                      onClick={handleGetDesign}
                      style={{
                        marginTop: 'var(--space-2)',
                        padding: 'var(--space-3) var(--space-6)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-primary)',
                        color: '#fff', border: 'none', fontWeight: 700,
                        fontSize: 'var(--text-sm)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                      }}
                    >
                      Get a Professional Design <ArrowRight size={15} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scenario picker */}
              {selectedCity && (
                <ScenarioPicker cityId={selectedCity.id} />
              )}

              {/* Rainfall chart */}
              {breakdown && breakdown.length > 0 && (
                <RainfallTrendChart data={breakdown} cityName={cityDisplayName} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}