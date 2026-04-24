/**
 * CitySearchInput
 * Searchable city input with autocomplete dropdown.
 * On selection → calls onSelect({ name, state, latitude, longitude })
 *
 * Props:
 *   onSelect     – (cityObj) => void   called when user picks a city
 *   selectedCity – current city object or null
 *   inputStyle   – shared input style object
 *   labelStyle   – shared label style object
 */
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, MapPin, X } from 'lucide-react'
import { useCitySearch } from '../../hooks/useCitySearch'

export default function CitySearchInput({ onSelect, selectedCity, inputStyle, labelStyle }) {
  const { query, setQuery, suggestions, loading, clear } = useCitySearch()
  const [open,    setOpen]    = useState(false)
  const [focused, setFocused] = useState(false)
  const wrapperRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Open dropdown when suggestions arrive
  useEffect(() => {
    if (suggestions.length > 0) setOpen(true)
    else setOpen(false)
  }, [suggestions])

  const handleSelect = (city) => {
    onSelect(city)
    clear()
    setOpen(false)
  }

  const handleClear = () => {
    onSelect(null)
    clear()
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <label style={labelStyle}>City / Location</label>

      {/* Input wrapper */}
      <div style={{
        position:     'relative',
        display:      'flex',
        alignItems:   'center',
      }}>
        {/* Search icon */}
        <div style={{
          position:  'absolute',
          left:      12,
          color:     focused ? 'var(--color-primary)' : 'var(--color-text-faint)',
          display:   'flex',
          transition: 'color 180ms',
          pointerEvents: 'none',
        }}>
          {loading
            ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
            : <Search size={15} />
          }
        </div>

        <input
          type="text"
          value={selectedCity && !query ? selectedCity.displayLabel || selectedCity.name : query}
          onChange={(e) => {
            if (selectedCity) onSelect(null)   // clear selection on new typing
            setQuery(e.target.value)
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Type city name…"
          autoComplete="off"
          style={{
            ...inputStyle,
            paddingLeft:  36,
            paddingRight: selectedCity ? 36 : 12,
            borderColor:  focused ? 'var(--color-primary)' : 'var(--color-border)',
            boxShadow:    focused ? '0 0 0 3px var(--color-primary-highlight)' : 'none',
          }}
        />

        {/* Clear button — shown when a city is selected */}
        {selectedCity && (
          <button
            onClick={handleClear}
            aria-label="Clear city"
            style={{
              position:   'absolute',
              right:      10,
              display:    'flex',
              padding:    4,
              color:      'var(--color-text-faint)',
              borderRadius: 'var(--radius-full)',
              transition: 'color 180ms',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-faint)'}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Selected city badge */}
      {selectedCity && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        6,
            marginTop:  6,
            fontSize:   'var(--text-xs)',
            color:      'var(--color-primary)',
            fontWeight: 600,
          }}
        >
          <MapPin size={11} />
          {selectedCity.displayLabel || selectedCity.name}
          {selectedCity.latitude && (
            <span style={{ color: 'var(--color-text-faint)', fontWeight: 400 }}>
              · {Number(selectedCity.latitude).toFixed(2)}°N, {Number(selectedCity.longitude).toFixed(2)}°E
            </span>
          )}
        </motion.div>
      )}

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position:    'absolute',
              top:         'calc(100% + 4px)',
              left:        0,
              right:       0,
              zIndex:      50,
              background:  'var(--color-surface-2)',
              border:      '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow:   'var(--shadow-lg)',
              overflow:    'hidden',
              transformOrigin: 'top center',
            }}
          >
            {suggestions.map((city, i) => (
              <motion.button
                key={city.id}
                onClick={() => handleSelect(city)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          10,
                  width:        '100%',
                  padding:      '10px 14px',
                  textAlign:    'left',
                  background:   'transparent',
                  borderBottom: i < suggestions.length - 1
                    ? '1px solid var(--color-divider)'
                    : 'none',
                  transition:   'background 120ms',
                  cursor:       'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-offset)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <MapPin
                  size={13}
                  style={{
                    color:    city.countryCode === 'IN' ? 'var(--color-primary)' : 'var(--color-text-faint)',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {city.name}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 1 }}>
                    {[city.state, city.country].filter(Boolean).join(', ')}
                  </div>
                </div>
                <div style={{ fontSize: 10, color: 'var(--color-text-faint)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                  {Number(city.latitude).toFixed(2)}°N
                </div>
              </motion.button>
            ))}

            <div style={{
              padding:    '7px 14px',
              fontSize:   10,
              color:      'var(--color-text-faint)',
              background: 'var(--color-surface-offset)',
              display:    'flex',
              alignItems: 'center',
              gap:        5,
            }}>
              <Search size={9} />
              Powered by Open-Meteo Geocoding · {suggestions.length} results
            </div>
          </motion.div>
        )}

        {/* No results state */}
        {open && !loading && query.length >= 2 && suggestions.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position:    'absolute',
              top:         'calc(100% + 4px)',
              left:        0, right: 0,
              zIndex:      50,
              background:  'var(--color-surface-2)',
              border:      '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding:     '14px',
              fontSize:    'var(--text-sm)',
              color:       'var(--color-text-muted)',
              textAlign:   'center',
              boxShadow:   'var(--shadow-md)',
            }}
          >
            No cities found for "{query}". Try a different spelling.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}