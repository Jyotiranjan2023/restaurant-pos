import ItemStatusBadge from './ItemStatusBadge'

export default function OrderItemRow({ item, onCancel, canCancel }) {
  const isCancelled = item.status === 'CANCELLED'

  return (
    <div
      className={`flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0 ${
        isCancelled ? 'opacity-60' : ''
      }`}
    >
      {/* Left: name, qty, status */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={`text-sm font-medium ${
              isCancelled ? 'text-gray-500 line-through' : 'text-gray-800'
            }`}
          >
            {item.itemName}
          </p>
          <ItemStatusBadge status={item.status} />
          {item.isCustom && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium">
              Custom
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          <span>Qty: {item.quantity}</span>
          <span>₹{Number(item.itemPrice).toFixed(2)} each</span>
          <span>GST {item.gstPercent}%</span>
        </div>

        {item.variantName && (
          <p className="text-xs text-gray-500 mt-1">
            Variant: {item.variantName}
          </p>
        )}

        {item.addons && item.addons.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Addons: {item.addons.map((a) => a.name).join(', ')}
          </p>
        )}

        {item.notes && (
          <p className="text-xs text-gray-600 italic mt-1">
            Note: {item.notes}
          </p>
        )}
      </div>

      {/* Right: subtotal + cancel button */}
      <div className="text-right ml-3">
        <p
          className={`text-sm font-semibold ${
            isCancelled ? 'text-gray-400 line-through' : 'text-gray-800'
          }`}
        >
          ₹{Number(item.subtotal).toFixed(2)}
        </p>
        {canCancel && !isCancelled && (
          <button
            type="button"
            onClick={() => onCancel(item)}
            className="text-xs text-red-600 hover:text-red-700 font-medium mt-1"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}