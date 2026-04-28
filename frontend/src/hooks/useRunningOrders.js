import { useState, useEffect, useCallback } from 'react'
import { fetchRunningOrders } from '../services/orderService'

export default function useRunningOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchRunningOrders()
      if (res.success) {
        setOrders(res.data || [])
      } else {
        setError(res.message || 'Failed to load orders')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { orders, loading, error, refetch: load }
}