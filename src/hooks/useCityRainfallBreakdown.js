/**
 * useCityRainfallBreakdown
 * Given lat/lon, fetches 10-year rainfall breakdown from Open-Meteo.
 * Cancels stale requests when coordinates change (city switches quickly).
 * Returns breakdown, loading, error.
 */
import { useState, useEffect, useRef } from 'react'
import { fetchRainfallBreakdown } from '../lib/rainfallApi'

export function useCityRainfallBreakdown(latitude, longitude) {
  const [breakdown, setBreakdown] = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const activeRef = useRef(true)

  useEffect(() => {
    if (!latitude || !longitude) {
      setBreakdown(null)
      setLoading(false)
      setError(null)
      return
    }

    let active = true
    activeRef.current = true

    setLoading(true)
    setBreakdown(null)
    setError(null)

    fetchRainfallBreakdown(latitude, longitude)
      .then((data) => {
        if (!active) return
        setBreakdown(data)
      })
      .catch((err) => {
        if (!active) return
        setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [latitude, longitude])

  return { breakdown, loading, error }
}