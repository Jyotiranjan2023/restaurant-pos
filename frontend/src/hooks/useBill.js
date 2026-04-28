import { useState, useEffect, useCallback } from 'react'
import { fetchBillById } from '../services/billService'

export default function useBill(billId) {
  const [bill, setBill] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!billId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetchBillById(billId)
      if (res.success) {
        setBill(res.data)
      } else {
        setError(res.message || 'Failed to load bill')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error')
    } finally {
      setLoading(false)
    }
  }, [billId])

  useEffect(() => {
    load()
  }, [load])

  return { bill, loading, error, refetch: load }
}