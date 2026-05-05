/**
 * rainfallApi.js
 * Open-Meteo Geocoding + Historical Weather API utilities.
 * Zero API key required. Free forever.
 *
 * Exports:
 *   searchCities(query)                        → autocomplete results
 *   geocodeCity(cityName)                      → coordinates for a city name
 *   fetchRainfallBreakdown(lat, lon)           → 10yr yearly breakdown + scenarios
 *   getRainfallBreakdownForCity(cityName)      → geocode + breakdown combined
 *   getRainfallForCity(cityName)               → single avg mm value (for cache)
 *   getCurrentCoordinates()                    → browser geolocation Promise
 *   reverseGeocodeCity(lat, lon)               → coordinates → city name
 */

// ─── API base URLs ────────────────────────────────────────────────────────────

const GEO_API     = 'https://geocoding-api.open-meteo.com/v1/search'
const HISTORY_API = 'https://archive-api.open-meteo.com/v1/archive'

// ─── searchCities ─────────────────────────────────────────────────────────────
/**
 * Autocomplete: partial city name → top 6 results, India first.
 * Used by useCitySearch hook → CitySearchInput component.
 */
export async function searchCities(query) {
  if (!query || query.trim().length < 2) return []

  const url = new URL(GEO_API)
  url.searchParams.set('name',     query.trim())
  url.searchParams.set('count',    '10')
  url.searchParams.set('language', 'en')
  url.searchParams.set('format',   'json')

  const res = await fetch(url.toString())
  if (!res.ok) return []
  const json = await res.json()
  if (!json.results?.length) return []

  // India results first, then others, capped at 6
  const sorted = [
    ...json.results.filter((r) => r.country_code === 'IN'),
    ...json.results.filter((r) => r.country_code !== 'IN'),
  ].slice(0, 6)

  return sorted.map((r) => ({
    id:          `${r.latitude},${r.longitude}`,
    name:        r.name,
    city:        r.name,
    state:       r.admin1  || null,
    country:     r.country || null,
    countryCode: r.country_code,
    latitude:    r.latitude,
    longitude:   r.longitude,
    // Aliases for useCityRainfallBreakdown compatibility
    cached_lat:  r.latitude,
    cached_lon:  r.longitude,
    displayLabel: r.admin1
      ? `${r.name}, ${r.admin1}${r.country_code !== 'IN' ? `, ${r.country}` : ''}`
      : `${r.name}${r.country_code !== 'IN' ? `, ${r.country}` : ''}`,
  }))
}

// ─── geocodeCity ──────────────────────────────────────────────────────────────
/**
 * Single city name → best match coordinates.
 * Prefers India results. Used by getRainfallForCity.
 */
export async function geocodeCity(cityName) {
  const url = new URL(GEO_API)
  url.searchParams.set('name',     cityName.trim())
  url.searchParams.set('count',    '5')
  url.searchParams.set('language', 'en')
  url.searchParams.set('format',   'json')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Geocoding failed for "${cityName}"`)
  const json = await res.json()
  if (!json.results?.length) throw new Error(`City "${cityName}" not found`)

  return json.results.find((r) => r.country_code === 'IN') ?? json.results[0]
}

// ─── fetchRainfallBreakdown ───────────────────────────────────────────────────
/**
 * lat/lon → 10-year yearly breakdown + 4 scenarios.
 * Called by useCityRainfallBreakdown hook.
 */
export async function fetchRainfallBreakdown(latitude, longitude) {
  const endYear   = new Date().getFullYear() - 1
  const startYear = endYear - 9

  const url = new URL(HISTORY_API)
  url.searchParams.set('latitude',   latitude)
  url.searchParams.set('longitude',  longitude)
  url.searchParams.set('start_date', `${startYear}-01-01`)
  url.searchParams.set('end_date',   `${endYear}-12-31`)
  url.searchParams.set('daily',      'precipitation_sum')
  url.searchParams.set('timezone',   'Asia/Kolkata')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch historical rainfall from Open-Meteo')
  const json = await res.json()

  const daily = json.daily?.precipitation_sum ?? []
  const dates = json.daily?.time ?? []

  // Aggregate daily → yearly totals
  const yearMap = {}
  dates.forEach((date, i) => {
    const yr = date.slice(0, 4)
    if (daily[i] != null) yearMap[yr] = (yearMap[yr] ?? 0) + daily[i]
  })

  const yearly = Object.entries(yearMap)
    .map(([year, mm]) => ({ year, mm: Math.round(mm) }))
    .sort((a, b) => a.year.localeCompare(b.year))

  const values     = yearly.map((y) => y.mm)
  const avg        = Math.round(values.reduce((a, b) => a + b, 0) / values.length)
  const min        = Math.min(...values)
  const max        = Math.max(...values)
  const optimistic = Math.round(avg * 1.10)

  const driest  = yearly.find((y) => y.mm === min)
  const wettest = yearly.find((y) => y.mm === max)

  return {
    yearly,
    scenarios: {
      minimum: {
        value: min,
        label: 'Drought Year',
        desc:  `Driest year was ${driest?.year} at ${min}mm. Conservative sizing.`,
      },
      average: {
        value: avg,
        label: '10-Year Average',
        desc:  'Recommended for most residential and commercial projects.',
      },
      maximum: {
        value: max,
        label: 'Flood Year',
        desc:  `Wettest year was ${wettest?.year} at ${max}mm. Max recharge capacity.`,
      },
      optimistic: {
        value: optimistic,
        label: '+10% Above Avg',
        desc:  'Future-proofed estimate for climate variability.',
      },
    },
    recommended: 'average',
    dataRange:   `${yearly[0]?.year}–${yearly[yearly.length - 1]?.year}`,
    dryYear:     driest?.year,
    wetYear:     wettest?.year,
  }
}

// ─── getRainfallBreakdownForCity ──────────────────────────────────────────────
/**
 * City name string → full breakdown (geocode + historical fetch combined).
 */
export async function getRainfallBreakdownForCity(cityName) {
  const geo  = await geocodeCity(cityName)
  const data = await fetchRainfallBreakdown(geo.latitude, geo.longitude)
  return {
    ...data,
    city:      geo.name,
    state:     geo.admin1 || null,
    latitude:  geo.latitude,
    longitude: geo.longitude,
  }
}

// ─── getRainfallForCity ───────────────────────────────────────────────────────
/**
 * City name → single average mm value.
 * Used by useRainfallData for Supabase city list enrichment + cache write-back.
 */
export async function getRainfallForCity(cityName) {
  const breakdown = await getRainfallBreakdownForCity(cityName)
  return {
    city:           breakdown.city,
    state:          breakdown.state,
    latitude:       breakdown.latitude,
    longitude:      breakdown.longitude,
    annual_avg_mm:  breakdown.scenarios.average.value,
    years_averaged: 10,
    data_from:      new Date().getFullYear() - 10,
    data_to:        new Date().getFullYear() - 1,
  }
}

// ─── getCurrentCoordinates ────────────────────────────────────────────────────
/**
 * Wraps navigator.geolocation in a Promise.
 * Requires HTTPS + explicit user permission.
 * Rejects with a user-readable message on denial or timeout.
 */
export function getCurrentCoordinates() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        latitude:  pos.coords.latitude,
        longitude: pos.coords.longitude,
      }),
      (err) => {
        const messages = {
          1: 'Location access denied. Please allow location permission and try again.',
          2: 'Location unavailable. Check your device GPS or network.',
          3: 'Location request timed out. Please try again.',
        }
        reject(new Error(messages[err.code] || 'Unable to detect location.'))
      },
      {
        enableHighAccuracy: true,
        timeout:            10000,
        maximumAge:         300000,  // reuse GPS fix for up to 5 min
      }
    )
  })
}

// ─── reverseGeocodeCity ───────────────────────────────────────────────────────
/**
 * lat/lon → city name + state + country.
 * Uses BigDataCloud free reverse geocoding — no API key needed.
 * Called by CitySearchInput after getCurrentCoordinates() resolves.
 *
 * Returned shape matches the city object expected by Calculator.jsx:
 *   { city, name, state, country, countryCode,
 *     latitude, longitude, cached_lat, cached_lon, displayLabel }
 */
export async function reverseGeocodeCity(latitude, longitude) {
  const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client')
  url.searchParams.set('latitude',         latitude)
  url.searchParams.set('longitude',        longitude)
  url.searchParams.set('localityLanguage', 'en')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Reverse geocoding failed. Please search your city manually.')

  const json = await res.json()

  const city  = json.city || json.locality || ''
  const state = json.principalSubdivision || ''

  return {
    city,
    name:        city,
    state,
    country:     json.countryName || '',
    countryCode: json.countryCode || '',
    latitude,
    longitude,
    // Aliases required by useCityRainfallBreakdown
    cached_lat:  latitude,
    cached_lon:  longitude,
    displayLabel: city
      ? `${city}${state ? `, ${state}` : ''}`
      : (json.locality || 'Current location'),
  }
}