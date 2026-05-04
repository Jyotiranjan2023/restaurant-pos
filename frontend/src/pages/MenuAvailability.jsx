import { useState, useEffect } from 'react'
import { fetchAllProducts, updateAvailability } from '../services/menuAvailabilityService'

export default function MenuAvailability() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [updatingId, setUpdatingId] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback({ type: '', message: '' }), 3000)
  }

  const loadProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchAllProducts()
      if (res.success) {
        setProducts(res.data)
      } else {
        setError(res.message || 'Failed to load products')
      }
    } catch {
      setError('Server error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProducts() }, [])

  const handleToggle = async (product) => {
    setUpdatingId(product.id)
    const newAvailable = !product.available
    try {
      const res = await updateAvailability(product.id, newAvailable)
      if (res.success) {
        setProducts(prev =>
          prev.map(p => p.id === product.id ? { ...p, available: newAvailable } : p)
        )
        showFeedback('success',
          `${product.name} marked as ${newAvailable ? 'Available' : 'Sold Out'}`
        )
      } else {
        showFeedback('error', res.message || 'Update failed')
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Server error')
    } finally {
      setUpdatingId(null)
    }
  }

  // Group by category
  const filtered = products.filter(p => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'ALL' ||
      (filter === 'AVAILABLE' && p.available) ||
      (filter === 'SOLD_OUT' && !p.available)
    return matchSearch && matchFilter
  })

  const grouped = filtered.reduce((acc, product) => {
    const cat = product.categoryName || 'Uncategorized'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(product)
    return acc
  }, {})

  const availableCount = products.filter(p => p.available).length
  const soldOutCount = products.filter(p => !p.available).length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Menu Availability</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Toggle items available or sold out in real time
          </p>
        </div>
        <button
          type="button"
          onClick={loadProducts}
          disabled={loading}
          className="text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg font-medium disabled:opacity-60"
        >
          Refresh
        </button>
      </div>

      {/* Feedback */}
      {feedback.message && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm border ${
          feedback.type === 'success'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">{products.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Items</p>
          </div>
          <div className="bg-white border border-green-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{availableCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Available</p>
          </div>
          <div className="bg-white border border-red-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-500">{soldOutCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Sold Out</p>
          </div>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search items or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <div className="flex gap-1.5">
          {['ALL', 'AVAILABLE', 'SOLD_OUT'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all
                ${filter === f
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
            >
              {f === 'ALL' ? 'All' : f === 'AVAILABLE' ? '✅ Available' : '❌ Sold Out'}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Loading menu items...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
          <button onClick={loadProducts} className="ml-3 underline">Retry</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No items found</p>
        </div>
      )}

      {/* Grouped product list */}
      {!loading && !error && Object.keys(grouped).length > 0 && (
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Category header */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-700">{category}</h2>
                <span className="text-xs text-gray-400">
                  {items.filter(i => i.available).length}/{items.length} available
                </span>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-100">
                {items.map((product) => {
                  const isUpdating = updatingId === product.id
                  return (
                    <div
                      key={product.id}
                      className={`flex items-center gap-3 px-4 py-3 transition-all ${
                        !product.available ? 'bg-red-50/30' : ''
                      }`}
                    >
                      {/* Image */}
                      {product.imageUrl ? (
                        <img
                          src={`http://localhost:8080${product.imageUrl}`}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <span className="text-xl">🍽️</span>
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${
                          product.available ? 'text-gray-800' : 'text-gray-400 line-through'
                        }`}>
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ₹{Number(product.price).toFixed(2)}
                        </p>
                      </div>

                   {/* Status text + toggle */}
<div className="flex items-center gap-2 shrink-0">
  <span className={`text-xs font-semibold w-16 text-right ${
    product.available ? 'text-green-700' : 'text-gray-400'
  }`}>
    {product.available ? 'Available' : 'Sold Out'}
  </span>
  <button
    type="button"
    role="switch"
    aria-checked={product.available}
    onClick={() => handleToggle(product)}
    disabled={isUpdating}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
      product.available ? 'bg-green-500' : 'bg-gray-300'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        product.available ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
</div>


                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}