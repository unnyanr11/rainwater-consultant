/**
 * useRainfallData
 * Fetches city list from Supabase, geocodes + fetches 10yr rainfall from Open-Meteo.
 * Caches result back to Supabase (30-day TTL) to avoid repeated API calls.
 */
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getRainfallForCity } from '../lib/rainfallApi'

export function useRainfallData() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const { data: cities, error: dbErr } = await supabase
          .from('rainfall_data')
          .select('id, city, state, active, cached_avg_mm, cached_lat, cached_lon, cache_updated_at')
          .eq('active', true)
          .order('sort_order', { ascending: true })

        if (dbErr) throw dbErr
        if (!cities?.length) { setData([]); setLoading(false); return }

        const enriched = await Promise.all(
          cities.map(async (row) => {
            // Check cache freshness — 30 days
            const cacheAge = row.cache_updated_at
              ? (Date.now() - new Date(row.cache_updated_at)) / (1000 * 60 * 60 * 24)
              : Infinity

            if (row.cached_avg_mm && cacheAge < 30) {
              return {
                ...row,
                annual_avg_mm: row.cached_avg_mm,
                latitude:      row.cached_lat,
                longitude:     row.cached_lon,
                displayLabel:  row.state ? `${row.city}, ${row.state}` : row.city,
                from_cache:    true,
              }
            }

            // Cache miss — fetch live from Open-Meteo
            try {
              const fresh = await getRainfallForCity(row.city)

              // Write back to Supabase cache
              await supabase
                .from('rainfall_data')
                .update({
                  cached_avg_mm:    fresh.annual_avg_mm,
                  cached_lat:       fresh.latitude,
                  cached_lon:       fresh.longitude,
                  cache_updated_at: new Date().toISOString(),
                })
                .eq('id', row.id)

              return {
                ...row,
                ...fresh,
                displayLabel: fresh.state
                  ? `${fresh.city}, ${fresh.state}`
                  : fresh.city,
                from_cache: false,
              }
            } catch {
              return { ...row, annual_avg_mm: null, error: true }
            }
          })
        )

        setData(enriched)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { data, loading, error }
}