import { useState, useEffect, useCallback } from 'react'
import { fetchCategories } from '../services/categoryService'

export default function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchCategories()
      if (res.success) setCategories(res.data)
      else setError(res.message || 'Failed to load categories')
    } catch (err) {
      setError(err.response?.data?.message || 'Server error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { categories, loading, error, refetch: load }
}