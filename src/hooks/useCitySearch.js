/**
 * useCitySearch
 * Debounced city autocomplete using Open-Meteo geocoding.
 * Returns suggestions as the user types.
 */
import { useState, useEffect, useRef } from 'react'
import { searchCities } from '../lib/rainfallApi'

export function useCitySearch() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const debounceRef = useRef(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const trimmed = query.trim()

    clearTimeout(debounceRef.current)

    if (trimmed.length < 2) {
      setSuggestions([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    const currentRequestId = ++requestIdRef.current

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchCities(trimmed)

        if (requestIdRef.current !== currentRequestId) return
        setSuggestions(results)
      } catch (err) {
        if (requestIdRef.current !== currentRequestId) return
        setSuggestions([])
        setError(err?.message || 'Failed to fetch city suggestions')
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setLoading(false)
        }
      }
    }, 320)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  const clear = () => {
    clearTimeout(debounceRef.current)
    requestIdRef.current += 1
    setQuery('')
    setSuggestions([])
    setLoading(false)
    setError(null)
  }

  return {
    query,
    setQuery,
    suggestions,
    loading,
    error,
    clear,
  }
}