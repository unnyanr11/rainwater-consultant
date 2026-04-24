/**
 * useCitySearch
 * Debounced city autocomplete using Open-Meteo geocoding.
 * Returns suggestions as the user types.
 */
import { useState, useEffect, useRef } from 'react'
import { searchCities } from '../lib/rainfallApi'

export function useCitySearch() {
  const [query,       setQuery]       = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading,     setLoading]     = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    // Clear immediately on short input
    if (query.trim().length < 2) {
      setSuggestions([])
      setLoading(false)
      return
    }

    setLoading(true)

    // Debounce: wait 320ms after user stops typing
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchCities(query)
        setSuggestions(results)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 320)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  const clear = () => {
    setQuery('')
    setSuggestions([])
  }

  return { query, setQuery, suggestions, loading, clear }
}