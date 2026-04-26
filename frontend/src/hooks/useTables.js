import { useState, useEffect, useCallback } from 'react'
import { fetchTables } from '../services/tableService'

export default function useTables() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadTables = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchTables()
      if (res.success) {
        setTables(res.data)
      } else {
        setError(res.message || 'Failed to load tables')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTables()
  }, [loadTables])

  return { tables, loading, error, refetch: loadTables }
}