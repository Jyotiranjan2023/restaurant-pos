import { useState, useEffect } from 'react'
import { fetchAllBills } from '../services/billService'

export default function useBills() {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchAllBills(0, 100)
      if (res.success) {
        setBills(res.data.content)
      } else {
        setError(res.message || 'Failed to load bills')
      }
    } catch (err) {
      setError('Server error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  return { bills, loading, error, refetch: fetchData }
}