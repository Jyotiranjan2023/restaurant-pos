import { useState, useEffect, useCallback } from 'react'
import { fetchOrderById } from '../services/orderService'

export default function useOrder(orderId) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetchOrderById(orderId)
      if (res.success) {
        setOrder(res.data)
      } else {
        setError(res.message || 'Failed to load order')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    load()
  }, [load])

  return { order, loading, error, refetch: load }
}