/**
 * useRainfallData
 * Fetches city list from Supabase, geocodes + fetches 10yr rainfall from Open-Meteo.
 * Caches result back to Supabase (30-day TTL) to avoid repeated API calls.
 *
 * Changes from original:
 * - Promise.allSettled instead of Promise.all (partial results on failure)
 * - Concurrency limit: max 3 parallel cache-miss fetches
 * - Unmount guard to prevent setState after unmount
 * - Cache age absolute value guard (clock skew)
 * - Preserves Supabase city/state name over geocoder name for display
 * - Skips write-back if update returns an error (logs warning)
 * - Normalized output shape with cached_lat/cached_lon for useCityRainfallBreakdown
 */
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getRainfallForCity } from '../lib/rainfallApi'

const CACHE_TTL_DAYS   = 30
const MAX_CONCURRENCY  = 3

// Runs async tasks with a max concurrency limit
async function pLimit(tasks, limit) {
  const results = []
  let i = 0

  async function runNext() {
    if (i >= tasks.length) return
    const index = i++
    results[index] = await tasks[index]().catch((err) => ({ __error: err }))
    await runNext()
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, runNext)
  await Promise.all(workers)
  return results
}

export function useRainfallData() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        const { data: cities, error: dbErr } = await supabase
          .from('rainfall_data')
          .select('id, city, state, active, cached_avg_mm, cached_lat, cached_lon, cache_updated_at')
          .eq('active', true)
          .order('sort_order', { ascending: true })

        if (dbErr) throw dbErr
        if (!cities?.length) {
          if (isMounted) { setData([]); setLoading(false) }
          return
        }

        const tasks = cities.map((row) => async () => {
          // Guard against clock skew with Math.abs
          const cacheAge = row.cache_updated_at
            ? Math.abs(Date.now() - new Date(row.cache_updated_at)) / (1000 * 60 * 60 * 24)
            : Infinity

          // ── Cache hit ──────────────────────────────────────────────────────
          if (row.cached_avg_mm && row.cached_lat && row.cached_lon && cacheAge < CACHE_TTL_DAYS) {
            return {
              ...row,
              // Preserve Supabase city/state name for display consistency
              city:         row.city,
              state:        row.state,
              // Normalize field names for useCityRainfallBreakdown compatibility
              cached_lat:   row.cached_lat,
              cached_lon:   row.cached_lon,
              latitude:     row.cached_lat,
              longitude:    row.cached_lon,
              annual_avg_mm: row.cached_avg_mm,
              displayLabel: row.state ? `${row.city}, ${row.state}` : row.city,
              from_cache:   true,
            }
          }

          // ── Cache miss — fetch live ────────────────────────────────────────
          try {
            const fresh = await getRainfallForCity(row.city)

            // Write-back to Supabase cache
            const { error: updateErr } = await supabase
              .from('rainfall_data')
              .update({
                cached_avg_mm:    fresh.annual_avg_mm,
                cached_lat:       fresh.latitude,
                cached_lon:       fresh.longitude,
                cache_updated_at: new Date().toISOString(),
              })
              .eq('id', row.id)

            if (updateErr) {
              console.warn(`[useRainfallData] Cache write-back failed for "${row.city}":`, updateErr.message)
            }

            return {
              ...row,
              // Preserve Supabase display name, use fresh coordinates
              city:          row.city,
              state:         row.state,
              cached_lat:    fresh.latitude,
              cached_lon:    fresh.longitude,
              latitude:      fresh.latitude,
              longitude:     fresh.longitude,
              annual_avg_mm: fresh.annual_avg_mm,
              displayLabel:  row.state ? `${row.city}, ${row.state}` : row.city,
              from_cache:    false,
            }
          } catch (fetchErr) {
            console.warn(`[useRainfallData] Live fetch failed for "${row.city}":`, fetchErr.message)
            // Return row as-is with null rainfall — calculator falls back to cached_avg_mm ?? 800
            return {
              ...row,
              latitude:     row.cached_lat ?? null,
              longitude:    row.cached_lon ?? null,
              cached_lat:   row.cached_lat ?? null,
              cached_lon:   row.cached_lon ?? null,
              annual_avg_mm: row.cached_avg_mm ?? null,
              displayLabel: row.state ? `${row.city}, ${row.state}` : row.city,
              error:        true,
            }
          }
        })

        // Run with concurrency limit instead of all-at-once
        const rawResults = await pLimit(tasks, MAX_CONCURRENCY)

        // Unwrap pLimit error wrapper — keeps rows that succeeded, uses fallback for failed ones
        const enriched = rawResults.map((r, i) =>
          r?.__error
            ? { ...cities[i], error: true, displayLabel: cities[i].state ? `${cities[i].city}, ${cities[i].state}` : cities[i].city }
            : r
        )

        if (isMounted) setData(enriched)

      } catch (err) {
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()
    return () => { isMounted = false }
  }, [])

  return { data, loading, error }
}