import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useBills from '../hooks/useBills'
import { timeAgo } from '../utils/timeFormat'

const STATUS_TABS = ['ALL', 'PENDING', 'PAID', 'CANCELLED']

const statusStyles = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  PAID: 'bg-green-50 text-green-700 border-green-300',
  CANCELLED: 'bg-red-50 text-red-700 border-red-300',
}

export default function Bills() {
  const navigate = useNavigate()
  const { bills, loading, error, refetch } = useBills()
  const [activeTab, setActiveTab] = useState('ALL')
  const [search, setSearch] = useState('')

  const filtered = bills.filter((b) => {
    const matchStatus = activeTab === 'ALL' || b.status === activeTab
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      b.billNumber.toLowerCase().includes(q) ||
      (b.customerName && b.customerName.toLowerCase().includes(q)) ||
      (b.orderNumber && b.orderNumber.toLowerCase().includes(q))
    return matchStatus && matchSearch
  })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bills</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            All generated bills across orders
          </p>
        </div>
        <button
          type="button"
          onClick={refetch}
          className="text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by bill number, order number or customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_TABS.map((tab) => {
          const count = tab === 'ALL'
            ? bills.length
            : bills.filter(b => b.status === tab).length
          return (
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
              {tab} ({count})
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Loading bills...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
          <button onClick={refetch} className="ml-3 underline">Retry</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No bills found</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((bill) => (
            <div
              key={bill.id}
              onClick={() => navigate(`/bills/${bill.id}`)}
              className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-orange-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-800">
                      {bill.billNumber}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${statusStyles[bill.status]}`}>
                      {bill.status}
                    </span>
                    {bill.couponCode && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        🎟️ {bill.couponCode}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {bill.orderNumber} ·{' '}
                    {bill.tableNumber
                      ? `Table ${bill.tableNumber}`
                      : bill.customerName || 'Walk-in'
                    }
                    {bill.customerName && bill.tableNumber && ` · ${bill.customerName}`}
                  </p>

                  <p className="text-xs text-gray-400 mt-0.5">
                    {timeAgo(bill.createdAt)}
                    {bill.status === 'CANCELLED' && bill.cancellationReason &&
                      ` · Reason: ${bill.cancellationReason}`
                    }
                  </p>
                </div>

                {/* Right */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-800">
                    ₹{Number(bill.totalAmount).toFixed(2)}
                  </p>
                  {Number(bill.discountAmount) > 0 && (
                    <p className="text-xs text-green-600">
                      −₹{Number(bill.discountAmount).toFixed(2)} off
                    </p>
                  )}
                  {bill.status === 'PENDING' && (
                    <p className="text-xs text-orange-600 font-medium">
                      Due ₹{Number(bill.dueAmount).toFixed(2)}
                    </p>
                  )}
                  {bill.status === 'PAID' && (
                    <p className="text-xs text-green-600 font-medium">Paid ✓</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}