import { timeAgo, formatTime } from '../../utils/timeFormat'

const orderTypeStyles = {
  DINE_IN: 'bg-blue-100 text-blue-700',
  TAKEAWAY: 'bg-orange-100 text-orange-700',
  DELIVERY: 'bg-purple-100 text-purple-700',
}

const orderTypeLabels = {
  DINE_IN: 'Dine In',
  TAKEAWAY: 'Takeaway',
  DELIVERY: 'Delivery',
}

export default function OrderCard({ order, onClick }) {
  const typeStyle = orderTypeStyles[order.orderType] || 'bg-gray-100 text-gray-700'
  const typeLabel = orderTypeLabels[order.orderType] || order.orderType

  const STALE_THRESHOLD_MS = 4 * 60 * 60 * 1000
const ageMs = Date.now() - new Date(order.createdAt).getTime()
const isStale = ageMs > STALE_THRESHOLD_MS

  const previewItems = order.items.slice(0, 3)
  const remainingCount = order.items.length - previewItems.length

  // Count ready items
  const readyCount = order.items.filter(i => i.status === 'READY').length
  const preparingCount = order.items.filter(i => i.status === 'PREPARING').length

  return (
    <button
      type="button"
      onClick={() => onClick(order)}
      className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-orange-400 hover:shadow-md transition-all w-full"
    >
      {/* Top row: order number + type badge */}
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-800 text-sm truncate">
            {order.orderNumber}
          </p>
         <p
  className={`text-xs ${isStale ? 'text-amber-600 font-semibold' : 'text-gray-500'}`}
  title={formatTime(order.createdAt)}
>
  {isStale && '⚠ '}{timeAgo(order.createdAt)}
</p>
        </div>
        <div className="flex items-center gap-1.5 ml-2 flex-wrap justify-end">
          {/* Ready badge */}
          {readyCount > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-100 text-green-700 border border-green-300 animate-pulse">
              ✅ {readyCount} Ready
            </span>
          )}
          {/* Preparing badge */}
          {preparingCount > 0 && readyCount === 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-600 border border-blue-200">
              👨‍🍳 {preparingCount} Preparing
            </span>
          )}
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${typeStyle}`}>
            {typeLabel}
          </span>
        </div>
      </div>

      {/* Customer / Table row */}
      <div className="text-sm text-gray-700 mb-3">
        {order.orderType === 'DINE_IN' ? (
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">🪑</span>
            <span className="font-semibold">
              Table {order.tableNumber || `#${order.tableId}`}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">👤</span>
            <span className="truncate">
              {order.customerName || 'Walk-in'}
              {order.customerPhone && (
                <span className="text-gray-500 font-normal">
                  {' · '}{order.customerPhone}
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Items preview */}
      <div className="bg-gray-50 rounded-lg p-2 mb-3 space-y-1">
        {previewItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-gray-700 truncate flex-1">
              {item.quantity}× {item.itemName}
            </span>
            {item.status === 'READY' && (
              <span className="text-green-600 text-[10px] font-bold ml-1">
                ✅ READY
              </span>
            )}
            {item.status === 'PREPARING' && (
              <span className="text-blue-500 text-[10px] font-medium ml-1">
                👨‍🍳 PREPARING
              </span>
            )}
            {item.status === 'CANCELLED' && (
              <span className="text-red-500 text-[10px] font-medium ml-1">
                CANCELLED
              </span>
            )}
          </div>
        ))}
        {remainingCount > 0 && (
          <p className="text-[10px] text-gray-500 italic">
            +{remainingCount} more {remainingCount === 1 ? 'item' : 'items'}
          </p>
        )}
      </div>

      {/* Footer: total + view arrow */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div>
          <p className="text-[10px] text-gray-500 leading-tight">Total</p>
          <p className="text-base font-bold text-orange-600 leading-tight">
            ₹{Number(order.totalAmount).toFixed(2)}
          </p>
        </div>
        <span className="text-xs text-gray-400 font-medium">View →</span>
      </div>
    </button>
  )
}