import CartItem from './CartItem'
import { calculateCartTotals } from '../../utils/cartCalculations'

export default function CartPanel({
  items,
  orderType,
  tableId,
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
  onSaveOrder,
  saving,
}) {
  const totals = calculateCartTotals(items)
  const isEmpty = items.length === 0

  // Validation: can we save the order?
  const canSave =
    !isEmpty &&
    (orderType !== 'DINE_IN' || tableId !== null)

  // Show why save is disabled (helpful for staff)
  let blockerMessage = ''
  if (isEmpty) blockerMessage = 'Add items to cart'
  else if (orderType === 'DINE_IN' && !tableId) blockerMessage = 'Select a table first'

  return (
    <div className="bg-white border border-gray-200 rounded-xl flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-800">Current Order</p>
          <p className="text-xs text-gray-500">
            {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
        {!isEmpty && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Items list — scrollable middle section */}
      <div className="flex-1 overflow-y-auto px-4 py-2 min-h-[200px]">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <span className="text-4xl mb-2">🛒</span>
            <p className="text-sm text-gray-500">Cart is empty</p>
            <p className="text-xs text-gray-400 mt-1">
              Click products to add them
            </p>
          </div>
        ) : (
          items.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onIncrement={() => onIncrement(item.productId, item.quantity + 1)}
              onDecrement={() => onDecrement(item.productId, item.quantity - 1)}
              onRemove={() => onRemove(item.productId)}
            />
          ))
        )}
      </div>

      {/* Totals + Save button */}
      {!isEmpty && (
        <div className="border-t border-gray-200 px-4 py-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-800">₹{totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">GST</span>
            <span className="text-gray-800">₹{totals.gstAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
            <span className="text-gray-800">Total</span>
            <span className="text-orange-600">₹{totals.totalAmount.toFixed(2)}</span>
          </div>

          {/* Blocker message */}
          {blockerMessage && (
            <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1.5 mt-2">
              ⚠️ {blockerMessage}
            </p>
          )}

         <button
  type="button"
  onClick={onSaveOrder}
  disabled={!canSave || saving}
  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {saving ? 'Saving...' : 'Save Order'}
</button>
        </div>
      )}
    </div>
  )
}