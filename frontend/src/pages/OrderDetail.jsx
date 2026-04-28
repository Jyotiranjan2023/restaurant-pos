import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { generateBill, fetchBillByOrderId } from '../services/billService'
import useOrder from '../hooks/useOrder'
import OrderItemRow from '../components/orders/OrderItemRow'
import ConfirmDialog from '../components/ConfirmDialog'
import { timeAgo, formatTime } from '../utils/timeFormat'
import { cancelOrderItem, cancelOrder } from '../services/orderService'

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

const orderStatusStyles = {
  RUNNING: 'bg-orange-100 text-orange-700 border-orange-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { order, loading, error, refetch } = useOrder(id)
   
  const [itemToCancel, setItemToCancel] = useState(null)
  const [showCancelOrderDialog, setShowCancelOrderDialog] = useState(false)
  const [actionInProgress, setActionInProgress] = useState(false)
  const [generatingBill, setGeneratingBill] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000)
  }

  // Loading state
  if (loading) {
    return (
      <div>
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium mb-3"
        >
          ← Back to Running Orders
        </button>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Loading order...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !order) {
    return (
      <div>
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium mb-3"
        >
          ← Back to Running Orders
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-700 font-medium">{error || 'Order not found'}</p>
          <button
            onClick={refetch}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const typeStyle = orderTypeStyles[order.orderType] || 'bg-gray-100 text-gray-700'
  const typeLabel = orderTypeLabels[order.orderType] || order.orderType
  const statusStyle = orderStatusStyles[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'

  const canModify = order.status === 'RUNNING'

  const activeItems = order.items.filter((i) => i.status !== 'CANCELLED')
  const cancelledCount = order.items.length - activeItems.length

  const handleAddItems = () => {
    navigate(`/pos?addToOrder=${order.id}`)
  }

  // When user clicks Cancel on an item row
  const handleCancelItemClick = (item) => {
    // Edge case: cancelling the LAST active item
    if (activeItems.length === 1) {
      // Switch to "cancel whole order" flow instead
      setShowCancelOrderDialog(true)
      return
    }
    setItemToCancel(item)
  }

  const handleGenerateBill = async () => {
  setGeneratingBill(true)
  try {
    // Try to fetch existing bill first (one-bill-per-order design)
    const existingRes = await fetchBillByOrderId(order.id).catch(() => null)
    
    if (existingRes?.success && existingRes.data) {
      // Bill already exists — go straight to it
      navigate(`/bills/${existingRes.data.id}`)
      return
    }
    
    // No existing bill — generate new one
    const res = await generateBill(order.id)
    if (res.success) {
      showFeedback('success', `Bill ${res.data.billNumber} generated`)
      navigate(`/bills/${res.data.id}`)
    } else {
      showFeedback('error', res.message || 'Failed to generate bill')
    }
  } catch (err) {
    showFeedback('error', err.response?.data?.message || 'Server error')
  } finally {
    setGeneratingBill(false)
  }
}

  // Confirm cancel single item
  const confirmCancelItem = async () => {
    if (!itemToCancel) return
    setActionInProgress(true)
    try {
      const res = await cancelOrderItem(order.id, itemToCancel.id)
      if (res.success) {
        showFeedback('success', `${itemToCancel.itemName} cancelled`)
        refetch()
      } else {
        showFeedback('error', res.message || 'Failed to cancel item')
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Server error')
    } finally {
      setActionInProgress(false)
      setItemToCancel(null)
    }
  }

  // Confirm cancel entire order
  const confirmCancelOrder = async () => {
    setActionInProgress(true)
    try {
      const res = await cancelOrder(order.id)
      if (res.success) {
        showFeedback('success', `Order ${order.orderNumber} cancelled`)
        // Redirect back to list since order no longer running
        setTimeout(() => navigate('/orders'), 1000)
      } else {
        showFeedback('error', res.message || 'Failed to cancel order')
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Server error')
    } finally {
      setActionInProgress(false)
      setShowCancelOrderDialog(false)
    }
  }

  const feedbackStyle = {
    success: 'bg-green-50 text-green-700 border-green-200',
    error: 'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <div>
      {/* Top: back button + refresh */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          ← Back to Running Orders
        </button>
        <button
          type="button"
          onClick={refetch}
          className="text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Feedback toast */}
      {feedback.message && (
        <div
          className={`mb-3 px-4 py-2 rounded-lg text-sm border ${feedbackStyle[feedback.type]}`}
        >
          {feedback.message}
        </div>
      )}

      {/* Header card */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-800">
                {order.orderNumber}
              </h1>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${statusStyle}`}
              >
                {order.status}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${typeStyle}`}
              >
                {typeLabel}
              </span>
            </div>
            <p
              className="text-xs text-gray-500 mt-1"
              title={formatTime(order.createdAt)}
            >
              Created {timeAgo(order.createdAt)} by {order.createdByUsername}
            </p>
          </div>

          {/* Cancel Order button — only for RUNNING orders, only ADMIN */}
          {canModify && (
            <button
              type="button"
              onClick={() => setShowCancelOrderDialog(true)}
              className="text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Customer / Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">
          {order.orderType === 'DINE_IN' ? 'Table Information' : 'Customer Information'}
        </h2>

        {order.orderType === 'DINE_IN' ? (
          <div className="text-sm text-gray-700">
            <p>
              <span className="text-gray-500">Table:</span>{' '}
              <span className="font-semibold">
                {order.tableNumber || `#${order.tableId}`}
              </span>
            </p>
            {order.customerName && (
              <p className="mt-1">
                <span className="text-gray-500">Guest name:</span>{' '}
                <span className="font-medium">{order.customerName}</span>
              </p>
            )}
            {order.customerPhone && (
              <p className="mt-1">
                <span className="text-gray-500">Phone:</span>{' '}
                <span className="font-medium">{order.customerPhone}</span>
              </p>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              <span className="text-gray-500">Name:</span>{' '}
              <span className="font-medium">
                {order.customerName || 'Walk-in'}
              </span>
            </p>
            {order.customerPhone && (
              <p>
                <span className="text-gray-500">Phone:</span>{' '}
                <span className="font-medium">{order.customerPhone}</span>
              </p>
            )}
            {order.customerAddress && (
              <p>
                <span className="text-gray-500">Address:</span>{' '}
                <span className="font-medium">{order.customerAddress}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Items list */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-800">
            Items ({activeItems.length})
            {cancelledCount > 0 && (
              <span className="text-xs text-red-500 font-normal ml-2">
                {cancelledCount} cancelled
              </span>
            )}
          </h2>
          {canModify && (
            <button
              type="button"
              onClick={handleAddItems}
              className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-medium"
            >
              + Add Items
            </button>
          )}
        </div>

        <div>
          {order.items.map((item) => (
            <OrderItemRow
              key={item.id}
              item={item}
              onCancel={handleCancelItemClick}
              canCancel={canModify}
            />
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Bill Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-800">
              ₹{Number(order.subtotal).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">GST</span>
            <span className="text-gray-800">
              ₹{Number(order.gstAmount).toFixed(2)}
            </span>
          </div>
          {Number(order.discount) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Discount</span>
              <span className="text-green-600">
                −₹{Number(order.discount).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
            <span className="text-gray-800">Total</span>
            <span className="text-orange-600">
              ₹{Number(order.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>

        {canModify && (
  <div className="mt-4 pt-4 border-t border-gray-200">
    <button
      type="button"
      onClick={handleGenerateBill}
      disabled={generatingBill}
      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {generatingBill ? 'Generating...' : 'Generate Bill'}
    </button>
  </div>
)}
      </div>

      {/* Cancel single item dialog */}
      <ConfirmDialog
        isOpen={!!itemToCancel}
        onClose={() => setItemToCancel(null)}
        onConfirm={confirmCancelItem}
        title="Cancel Item?"
        message={
          itemToCancel
            ? `Cancel "${itemToCancel.itemName}" (qty ${itemToCancel.quantity})? This cannot be undone.`
            : ''
        }
        confirmText={actionInProgress ? 'Cancelling...' : 'Yes, Cancel Item'}
        cancelText="Keep Item"
        danger
      />

      {/* Cancel entire order dialog */}
      <ConfirmDialog
        isOpen={showCancelOrderDialog}
        onClose={() => setShowCancelOrderDialog(false)}
        onConfirm={confirmCancelOrder}
        title="Cancel Entire Order?"
        message={
          activeItems.length === 1
            ? `This is the last active item. Cancelling it will cancel the entire order ${order.orderNumber}. ${order.orderType === 'DINE_IN' ? 'Table will be freed.' : ''} This cannot be undone.`
            : `Cancel order ${order.orderNumber}? All ${activeItems.length} active items will be cancelled. ${order.orderType === 'DINE_IN' ? 'Table will be freed.' : ''} This cannot be undone.`
        }
        confirmText={actionInProgress ? 'Cancelling...' : 'Yes, Cancel Order'}
        cancelText="Keep Order"
        danger
      />
    </div>
  )
}