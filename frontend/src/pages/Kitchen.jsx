import { useState, useEffect, useCallback } from 'react'
import { fetchKitchenItems, updateItemStatus } from '../services/kitchenService'
import { timeAgo } from '../utils/timeFormat'

const STATUS_FLOW = {
  NEW: { next: 'PREPARING', label: 'Start Preparing', color: 'bg-blue-500 hover:bg-blue-600' },
  PREPARING: { next: 'READY', label: 'Mark Ready', color: 'bg-green-500 hover:bg-green-600' },
  READY: { next: 'SERVED', label: 'Mark Served', color: 'bg-purple-500 hover:bg-purple-600' },
  SERVED: { next: null, label: 'Served', color: 'bg-gray-300' },
  CANCELLED: { next: null, label: 'Cancelled', color: 'bg-red-300' },
}

const STATUS_STYLES = {
  NEW: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  PREPARING: 'bg-blue-50 text-blue-700 border-blue-300',
  READY: 'bg-green-50 text-green-700 border-green-300',
  SERVED: 'bg-gray-100 text-gray-500 border-gray-300',
  CANCELLED: 'bg-red-50 text-red-400 border-red-200',
}

const STATUS_ICONS = {
  NEW: '🆕',
  PREPARING: '👨‍🍳',
  READY: '✅',
  SERVED: '🍽️',
  CANCELLED: '❌',
}

const ORDER_TYPE_STYLES = {
  DINE_IN: 'bg-orange-50 text-orange-700 border-orange-200',
  TAKEAWAY: 'bg-blue-50 text-blue-700 border-blue-200',
  DELIVERY: 'bg-purple-50 text-purple-700 border-purple-200',
}

const TABS = ['ALL', 'NEW', 'PREPARING', 'READY']

export default function Kitchen() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('ALL')
  const [updatingId, setUpdatingId] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  const loadItems = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError('')
    try {
      const res = await fetchKitchenItems()
      if (res.success) {
        setItems(res.data)
        setLastRefresh(new Date())
      } else {
        setError(res.message || 'Failed to load kitchen items')
      }
    } catch {
      setError('Server error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadItems() }, [loadItems])

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => loadItems(true), 30000)
    return () => clearInterval(interval)
  }, [autoRefresh, loadItems])

  const handleStatusUpdate = async (item) => {
    const nextStatus = STATUS_FLOW[item.status]?.next
    if (!nextStatus) return

    setUpdatingId(item.itemId)
    try {
      const res = await updateItemStatus(item.itemId, nextStatus)
      if (res.success) {
        setItems(prev =>
          prev.map(i => i.itemId === item.itemId ? { ...i, status: nextStatus } : i)
        )
      } else {
        alert(res.message || 'Update failed')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Server error')
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = items.filter(item => {
    if (activeTab === 'ALL') return ['NEW', 'PREPARING', 'READY'].includes(item.status)
    return item.status === activeTab
  })

  const counts = {
    ALL: items.filter(i => ['NEW', 'PREPARING', 'READY'].includes(i.status)).length,
    NEW: items.filter(i => i.status === 'NEW').length,
    PREPARING: items.filter(i => i.status === 'PREPARING').length,
    READY: items.filter(i => i.status === 'READY').length,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kitchen Display</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Last refreshed: {timeAgo(lastRefresh.toISOString())}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Auto refresh toggle */}
          <button
            type="button"
            onClick={() => setAutoRefresh(p => !p)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              autoRefresh
                ? 'bg-green-50 border-green-400 text-green-700'
                : 'bg-white border-gray-300 text-gray-500'
            }`}
          >
            {autoRefresh ? '🔄 Auto ON' : '🔄 Auto OFF'}
          </button>
          <button
            type="button"
            onClick={() => loadItems()}
            disabled={loading}
            className="text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg font-medium disabled:opacity-60"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all
              ${activeTab === tab
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
          >
            {STATUS_ICONS[tab] || '📋'} {tab} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">
          {error}
          <button onClick={() => loadItems()} className="ml-3 underline">Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Loading kitchen items...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">👨‍🍳</p>
          <p className="text-gray-500 text-sm">
            {activeTab === 'ALL'
              ? 'No active items in kitchen'
              : `No items with status "${activeTab}"`
            }
          </p>
        </div>
      )}

      {/* Kitchen Items Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item) => {
            const flow = STATUS_FLOW[item.status]
            const isUpdating = updatingId === item.itemId

            return (
              <div
                key={item.itemId}
                className={`bg-white border-2 rounded-xl p-4 flex flex-col gap-3 transition-all ${
                  item.status === 'NEW' ? 'border-yellow-300' :
                  item.status === 'PREPARING' ? 'border-blue-300' :
                  item.status === 'READY' ? 'border-green-400' :
                  'border-gray-200'
                }`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-gray-800">
                      {item.itemName}
                      {item.isCustom && (
                        <span className="ml-1 text-xs text-purple-600 font-normal">(custom)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.orderNumber}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${STATUS_STYLES[item.status]}`}>
                      {STATUS_ICONS[item.status]} {item.status}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${ORDER_TYPE_STYLES[item.orderType]}`}>
                    {item.orderType === 'DINE_IN' ? '🪑 Dine In' :
                     item.orderType === 'TAKEAWAY' ? '🥡 Takeaway' : '🚴 Delivery'}
                  </span>
                  {item.tableNumber && (
                    <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-50 text-gray-600 border-gray-200 font-semibold">
                      Table {item.tableNumber}
                    </span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-full border bg-orange-50 text-orange-700 border-orange-200 font-bold">
                    Qty: {item.quantity}
                  </span>
                </div>

                {/* Notes */}
                {item.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                    <p className="text-xs text-yellow-800">
                      📝 {item.notes}
                    </p>
                  </div>
                )}

                {/* Time */}
                <p className="text-xs text-gray-400">
                  Ordered {timeAgo(item.orderedAt)}
                </p>

                {/* Action Button */}
                {flow.next && (
                  <button
                    type="button"
                    onClick={() => handleStatusUpdate(item)}
                    disabled={isUpdating}
                    className={`w-full py-2 text-sm font-bold text-white rounded-lg transition-all disabled:opacity-60 ${flow.color}`}
                  >
                    {isUpdating ? 'Updating...' : flow.label}
                  </button>
                )}

                {!flow.next && (
                  <div className={`w-full py-2 text-sm font-bold text-center rounded-lg ${flow.color} text-white`}>
                    {flow.label}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}