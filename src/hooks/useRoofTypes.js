/**
 * useRoofTypes
 * Fetches roof surface options from Supabase.
 * Each row has: id, label, runoff_coefficient, notes, sort_order, active
 *
 * Supabase table: roof_types
 * Columns:
 *   id                  uuid PK
 *   label               text          e.g. "RCC / Concrete Flat"
 *   runoff_coefficient  numeric       0.70 – 0.95
 *   notes               text nullable e.g. "Best for urban rooftops"
 *   sort_order          int           1, 2, 3 ...
 *   active              bool
 */
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useRoofTypes() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    supabase
      .from('roof_types')
      .select('id, label, runoff_coefficient, notes')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data: rows, error: err }) => {
        if (err) setError(err.message)
        else     setData(rows || [])
        setLoading(false)
      })
  }, [])

  return { data, loading, error }
}