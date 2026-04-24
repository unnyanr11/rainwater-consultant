/**
 * usePropertyTypes
 * Fetches property type options from Supabase.
 * Each row drives the daily water demand calculation in the calculator.
 *
 * Supabase table: property_types
 * Columns:
 *   id                       uuid PK
 *   name                     text    e.g. "Residential"
 *   daily_water_demand_lpcd  int     litres per capita per day (BIS standard)
 *   sort_order               int
 *   active                   bool
 *
 * BIS IS:1172 reference values:
 *   Residential         135 lpcd
 *   Apartment           110 lpcd
 *   Commercial office   45 lpcd
 *   School / college    45 lpcd
 *   Hospital            450 lpcd (per bed)
 *   Factory / industry  30 lpcd
 */
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePropertyTypes() {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    supabase
      .from('property_types')
      .select('id, name, daily_water_demand_lpcd')
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