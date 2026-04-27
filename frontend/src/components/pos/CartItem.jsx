import { calculateItemSubtotal } from '../../utils/cartCalculations'

export default function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  const subtotal = calculateItemSubtotal(item.price, item.quantity)

  return (
    <div className="border-b border-gray-100 py-2 last:border-b-0">
      {/* Top row: name + remove button */}
      <div className="flex items-start justify-between mb-1">
        <p className="text-sm font-medium text-gray-800 leading-tight pr-2">
          {item.name}
        </p>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 text-lg leading-none"
          title="Remove from cart"
        >
          ×
        </button>
      </div>

      {/* Bottom row: qty controls + price */}
      <div className="flex items-center justify-between">
        {/* Qty controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDecrement}
            className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold"
          >
            −
          </button>
          <span className="text-sm font-semibold w-6 text-center">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={onIncrement}
            className="w-6 h-6 rounded bg-orange-100 hover:bg-orange-200 text-orange-700 text-sm font-bold"
          >
            +
          </button>
        </div>

        {/* Price */}
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800">₹{subtotal}</p>
          <p className="text-[10px] text-gray-400">
            ₹{item.price} × {item.quantity}
          </p>
        </div>
      </div>
    </div>
  )
}