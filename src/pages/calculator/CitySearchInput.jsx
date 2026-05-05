/**
 * CitySearchInput
 * Searchable city input with autocomplete dropdown + "Use current location".
 * On selection → calls onSelect({ city, state, latitude, longitude, displayLabel, countryCode })
 *
 * Props:
 *   onSelect     – (cityObj | null) => void
 *   selectedCity – current city object or null
 *   inputStyle   – shared input style object
 *   labelStyle   – shared label style object
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, MapPin, X, Navigation } from 'lucide-react'
import { useCitySearch } from '../../hooks/useCitySearch'
import { getCurrentCoordinates, reverseGeocodeCity } from '../../lib/rainfallApi'

export default function CitySearchInput({ onSelect, selectedCity, inputStyle, labelStyle }) {
  const { query, setQuery, suggestions, loading, error, clear } = useCitySearch()
  const [focused,           setFocused]           = useState(false)
  const [activeIndex,       setActiveIndex]       = useState(-1)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [locationError,     setLocationError]     = useState(null)

  const wrapperRef  = useRef(null)
  const inputRef    = useRef(null)
  const dropdownRef = useRef(null)

  const isOpen = suggestions.length > 0 && !selectedCity

  // ── Close on outside click ───────────────────────────────────────────────
  useEffect(() => {
    function handler(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        // don't call clear() — preserve query so user can see what they typed
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Reset active index when suggestions change
  useEffect(() => { setActiveIndex(-1) }, [suggestions])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSelect = useCallback((city) => {
    onSelect(city)
    clear()
    setActiveIndex(-1)
    setLocationError(null)
    inputRef.current?.blur()
  }, [onSelect, clear])

  const handleClear = useCallback(() => {
    onSelect(null)
    clear()
    setActiveIndex(-1)
    setLocationError(null)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [onSelect, clear])

  const handleChange = useCallback((e) => {
    if (selectedCity) onSelect(null)   // clear selection as soon as user types
    setQuery(e.target.value)
    setLocationError(null)
  }, [selectedCity, onSelect, setQuery])

  // ── Keyboard navigation ───────────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      clear()
      setActiveIndex(-1)
      inputRef.current?.blur()
    }
  }, [isOpen, suggestions, activeIndex, handleSelect, clear])

  // ── Current location ─────────────────────────────────────────────────────
  const handleDetectLocation = async () => {
    if (detectingLocation) return
    setDetectingLocation(true)
    setLocationError(null)
    clear()
    if (selectedCity) onSelect(null)

    try {
      const coords = await getCurrentCoordinates()
      const place  = await reverseGeocodeCity(coords.latitude, coords.longitude)

      onSelect({
        id:           `geo:${coords.latitude},${coords.longitude}`,
        city:         place.city,
        name:         place.city,
        state:        place.state,
        country:      place.country,
        countryCode:  'detected',
        latitude:     coords.latitude,
        longitude:    coords.longitude,
        cached_lat:   coords.latitude,
        cached_lon:   coords.longitude,
        displayLabel: place.displayLabel,
        fromGeo:      true,
      })
    } catch (err) {
      setLocationError(err?.message || 'Could not detect location. Please allow location access.')
    } finally {
      setDetectingLocation(false)
    }
  }

  // ── Input display value ───────────────────────────────────────────────────
  // Only show selectedCity label when nothing is being typed
  const inputValue = selectedCity && query === ''
    ? (selectedCity.displayLabel || selectedCity.city || selectedCity.name)
    : query

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <label style={labelStyle}>City / Location</label>

      {/* ── Input row ── */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Search icon */}
        <div style={{
          position:      'absolute',
          left:          12,
          color:         focused ? 'var(--color-primary)' : 'var(--color-text-faint)',
          display:       'flex',
          transition:    'color 180ms',
          pointerEvents: 'none',
          zIndex:        1,
        }}>
          {loading
            ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
            : <Search size={15} />
          }
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Type city name…"
          autoComplete="off"
          aria-label="Search city"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `city-option-${activeIndex}` : undefined}
          role="combobox"
          style={{
            ...inputStyle,
            flex:         1,
            paddingLeft:  36,
            paddingRight: selectedCity ? 36 : 12,
            borderColor:  focused ? 'var(--color-primary)' : 'var(--color-border)',
            boxShadow:    focused ? '0 0 0 3px var(--color-primary-highlight)' : 'none',
          }}
        />

        {/* Clear button */}
        {selectedCity && (
          <button
            onClick={handleClear}
            aria-label="Clear city selection"
            style={{
              position:     'absolute',
              right:        10,
              display:      'flex',
              padding:      4,
              color:        'var(--color-text-faint)',
              borderRadius: 'var(--radius-full)',
              transition:   'color 180ms',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-faint)'}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Use current location button ── */}
      <button
        onClick={handleDetectLocation}
        disabled={detectingLocation}
        aria-label="Use current location"
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          6,
          marginTop:    8,
          padding:      '6px 10px',
          borderRadius: 'var(--radius-md)',
          border:       '1px dashed var(--color-border)',
          background:   'transparent',
          color:        detectingLocation ? 'var(--color-text-faint)' : 'var(--color-primary)',
          fontSize:     'var(--text-xs)',
          fontWeight:   600,
          cursor:       detectingLocation ? 'not-allowed' : 'pointer',
          transition:   'background 180ms, border-color 180ms',
          width:        '100%',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          if (!detectingLocation) e.currentTarget.style.background = 'var(--color-primary-highlight)'
        }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        {detectingLocation
          ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} />
          : <Navigation size={13} />
        }
        {detectingLocation ? 'Detecting your location…' : 'Use current location'}
      </button>

      {/* ── Location error ── */}
      <AnimatePresence>
        {locationError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop:    6,
              fontSize:     'var(--text-xs)',
              color:        'var(--color-error)',
              display:      'flex',
              alignItems:   'center',
              gap:          5,
            }}
          >
            {locationError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Selected city badge ── */}
      <AnimatePresence>
        {selectedCity && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
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
            {selectedCity.fromGeo ? <Navigation size={11} /> : <MapPin size={11} />}
            {selectedCity.displayLabel || selectedCity.city || selectedCity.name}
            {selectedCity.latitude && (
              <span style={{ color: 'var(--color-text-faint)', fontWeight: 400 }}>
                · {Number(selectedCity.latitude).toFixed(2)}°N, {Number(selectedCity.longitude).toFixed(2)}°E
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── API search error ── */}
      <AnimatePresence>
        {error && !isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 6,
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-faint)',
            }}
          >
            Search unavailable. Check your connection.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Suggestions dropdown ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="dropdown"
            ref={dropdownRef}
            role="listbox"
            aria-label="City suggestions"
            initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position:        'absolute',
              top:             'calc(100% + 4px)',
              left:            0,
              right:           0,
              zIndex:          50,
              background:      'var(--color-surface-2)',
              border:          '1px solid var(--color-border)',
              borderRadius:    'var(--radius-lg)',
              boxShadow:       'var(--shadow-lg)',
              overflow:        'hidden',
              transformOrigin: 'top center',
            }}
          >
            {suggestions.map((city, i) => (
              <motion.button
                key={city.id}
                id={`city-option-${i}`}
                role="option"
                aria-selected={i === activeIndex}
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
                  background:   i === activeIndex
                    ? 'var(--color-primary-highlight)'
                    : 'transparent',
                  borderBottom: i < suggestions.length - 1
                    ? '1px solid var(--color-divider)'
                    : 'none',
                  transition:   'background 120ms',
                  cursor:       'pointer',
                }}
                onMouseEnter={(e) => {
                  if (i !== activeIndex)
                    e.currentTarget.style.background = 'var(--color-surface-offset)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = i === activeIndex
                    ? 'var(--color-primary-highlight)'
                    : 'transparent'
                }}
              >
                <MapPin
                  size={13}
                  style={{
                    color:      city.countryCode === 'IN'
                      ? 'var(--color-primary)'
                      : 'var(--color-text-faint)',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize:     'var(--text-sm)',
                    fontWeight:   600,
                    color:        'var(--color-text)',
                    overflow:     'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace:   'nowrap',
                  }}>
                    {city.name}
                  </div>
                  <div style={{
                    fontSize:  'var(--text-xs)',
                    color:     'var(--color-text-faint)',
                    marginTop: 1,
                  }}>
                    {[city.state, city.country].filter(Boolean).join(', ')}
                  </div>
                </div>
                <div style={{
                  fontSize:           10,
                  color:              'var(--color-text-faint)',
                  fontVariantNumeric: 'tabular-nums',
                  flexShrink:         0,
                }}>
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

        {/* No results */}
        {!isOpen && !loading && !selectedCity && query.trim().length >= 2 && suggestions.length === 0 && !error && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position:     'absolute',
              top:          'calc(100% + 4px)',
              left:         0,
              right:        0,
              zIndex:       50,
              background:   'var(--color-surface-2)',
              border:       '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding:      '14px',
              fontSize:     'var(--text-sm)',
              color:        'var(--color-text-muted)',
              textAlign:    'center',
              boxShadow:    'var(--shadow-md)',
            }}
          >
            No cities found for "{query}". Try a different spelling.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}