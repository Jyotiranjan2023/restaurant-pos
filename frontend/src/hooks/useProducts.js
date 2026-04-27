import { useState, useEffect, useCallback } from 'react'
import { fetchProducts } from '../services/productService'

export default function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchProducts()
      if (res.success) setProducts(res.data)
      else setError(res.message || 'Failed to load products')
    } catch (err) {
      setError(err.response?.data?.message || 'Server error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { products, loading, error, refetch: load }
}