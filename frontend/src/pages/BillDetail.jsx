import { useParams, useNavigate } from 'react-router-dom'
import useBill from '../hooks/useBill'
import BillStatusBadge from '../components/bills/BillStatusBadge'
import { timeAgo, formatTime } from '../utils/timeFormat'
import { useState } from 'react'
import Modal from '../components/Modal'
import PaymentForm from '../components/bills/PaymentForm'
import { fetchBillPrintHtml, applyCoupon, applyDiscount, cancelBill } from '../services/billService'

export default function BillDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { bill, loading, error, refetch } = useBill(id)

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [printingBill, setPrintingBill] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  const [discountType, setDiscountType] = useState('PERCENT')
  const [discountValue, setDiscountValue] = useState('')
  const [discountLoading, setDiscountLoading] = useState(false)

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000)
  }

  const handlePaymentAdded = (updatedBill) => {
    setShowPaymentModal(false)
    showFeedback(
      'success',
      Number(updatedBill.dueAmount) === 0
        ? 'Payment recorded — bill fully paid'
        : `Payment recorded — ₹${Number(updatedBill.dueAmount).toFixed(2)} still due`
    )
    refetch()
  }

  const handlePrintBill = async () => {
    setPrintingBill(true)
    try {
      const html = await fetchBillPrintHtml(bill.id)
      const printWindow = window.open('', '_blank', 'width=400,height=600')
      if (!printWindow) {
        showFeedback('error', 'Popup blocked. Please allow popups for this site.')
        return
      }
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.onload = () => {
        printWindow.focus()
        printWindow.print()
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Failed to load bill HTML')
    } finally {
      setPrintingBill(false)
    }
  }

  const handleCancelBill = async () => {
    if (!cancelReason.trim() || cancelReason.trim().length < 5) return
    setCancelLoading(true)
    try {
      const res = await cancelBill(bill.id, cancelReason.trim())
      if (res.success) {
        navigate('/orders', { state: { message: `Bill ${bill.billNumber} cancelled` } })
      } else {
        showFeedback('error', res.message || 'Cancel failed')
        setShowCancelModal(false)
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Cancel failed')
      setShowCancelModal(false)
    } finally {
      setCancelLoading(false)
    }
  }

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
          <p className="text-gray-500">Loading bill...</p>
        </div>
      </div>
    )
  }

  if (error || !bill) {
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
          <p className="text-red-700 font-medium">{error || 'Bill not found'}</p>
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

  const isSettled = bill.settledAt !== null
  const isCancelled = bill.status === 'CANCELLED'
  const isFullyPaid = Number(bill.dueAmount) === 0

  return (
    <div className="max-w-3xl">

      {/* Top: back + refresh */}
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

      {/* Feedback Toast */}
      {feedback.message && (
        <div
          className={`mb-3 px-4 py-2 rounded-lg text-sm border ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚫</span>
            <div>
              <p className="text-sm font-bold text-red-700">Bill Cancelled</p>
              {bill.cancellationReason && (
                <p className="text-sm text-red-600 mt-0.5">
                  Reason: {bill.cancellationReason}
                </p>
              )}
              {bill.cancelledAt && (
                <p className="text-xs text-red-400 mt-1">
                  Cancelled {timeAgo(bill.cancelledAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-800">{bill.billNumber}</h1>
              <BillStatusBadge status={bill.status} />
              {isSettled && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  Settled
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1" title={formatTime(bill.createdAt)}>
              Generated {timeAgo(bill.createdAt)} by {bill.generatedByUsername}
            </p>
            {bill.settledAt && (
              <p className="text-xs text-gray-500" title={formatTime(bill.settledAt)}>
                Settled {timeAgo(bill.settledAt)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => navigate(`/orders/${bill.orderId}`)}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            View Order →
          </button>
        </div>
      </div>

      {/* Customer / Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">
          {bill.tableNumber ? 'Table' : 'Customer'}
        </h2>
        <div className="text-sm text-gray-700 space-y-1">
          {bill.tableNumber && (
            <p>
              <span className="text-gray-500">Table:</span>{' '}
              <span className="font-semibold">Table {bill.tableNumber}</span>
            </p>
          )}
          {bill.customerName && (
            <p>
              <span className="text-gray-500">Name:</span>{' '}
              <span className="font-medium">{bill.customerName}</span>
            </p>
          )}
          {bill.customerPhone && (
            <p>
              <span className="text-gray-500">Phone:</span>{' '}
              <span className="font-medium">{bill.customerPhone}</span>
            </p>
          )}
          {!bill.tableNumber && !bill.customerName && !bill.customerPhone && (
            <p className="text-gray-400 italic">Walk-in (no customer details)</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">
          Items ({bill.items?.length || 0})
        </h2>
        {!bill.items || bill.items.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No items recorded on this bill.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {bill.items.map((item) => (
              <div key={item.id} className="py-2 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{item.itemName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Qty: {item.quantity} × ₹{Number(item.itemPrice).toFixed(2)} · GST {item.gstPercent}%
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-800 ml-3">
                  ₹{Number(item.subtotal).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bill Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Bill Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-800">₹{Number(bill.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">GST</span>
            <span className="text-gray-800">₹{Number(bill.gstAmount).toFixed(2)}</span>
          </div>
          {Number(bill.discountAmount) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">
                Discount {bill.couponCode && `(${bill.couponCode})`}
              </span>
              <span className="text-green-600">
                −₹{Number(bill.discountAmount).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
            <span className="text-gray-800">Total</span>
            <span className="text-gray-800">₹{Number(bill.totalAmount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Offers & Discounts — only for PENDING bills */}
      {!isCancelled && !isSettled && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">Offers & Discounts</h2>

          {/* Coupon */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1.5">Coupon Code</p>
            {bill.couponCode ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-300 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                  🎟️ {bill.couponCode} applied
                </span>
                <span className="text-xs text-gray-500">
                  −₹{Number(bill.discountAmount).toFixed(2)} saved
                </span>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={couponLoading}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 uppercase"
                />
                <button
                  type="button"
                  disabled={couponLoading || !couponCode.trim()}
                  onClick={async () => {
                    setCouponLoading(true)
                    try {
                      const res = await applyCoupon(bill.id, couponCode.trim())
                      if (res.success) {
                        setCouponCode('')
                        showFeedback('success', `Coupon "${res.data.couponCode}" applied — ₹${Number(res.data.discountAmount).toFixed(2)} off`)
                        refetch()
                      } else {
                        showFeedback('error', res.message || 'Invalid coupon')
                      }
                    } catch (err) {
                      showFeedback('error', err.response?.data?.message || 'Coupon apply failed')
                    } finally {
                      setCouponLoading(false)
                    }
                  }}
                  className="px-4 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50"
                >
                  {couponLoading ? 'Applying...' : 'Apply'}
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100" />

          {/* Manual Discount */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1.5">Manual Discount</p>
            {Number(bill.discountAmount) > 0 && !bill.couponCode ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-300 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                  🏷️ {bill.discountType === 'PERCENT'
                    ? `${Number(bill.discountValue).toFixed(0)}% off`
                    : `₹${Number(bill.discountValue).toFixed(2)} flat off`
                  } applied
                </span>
                <span className="text-xs text-gray-500">
                  −₹{Number(bill.discountAmount).toFixed(2)} saved
                </span>
              </div>
            ) : bill.couponCode ? (
              <p className="text-xs text-gray-400 italic">
                Remove coupon first to apply manual discount
              </p>
            ) : (
              <div className="space-y-2">
                {/* Type toggle */}
                <div className="flex gap-1.5">
                  {['PERCENT', 'FLAT'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDiscountType(t)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all
                        ${discountType === t
                          ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-400'
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {t === 'PERCENT' ? '% Percent' : '₹ Flat'}
                    </button>
                  ))}
                </div>

                {/* Quick percent presets */}
                {discountType === 'PERCENT' && (
                  <div className="flex gap-1.5 flex-wrap">
                    {[5, 10, 15, 20].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setDiscountValue(String(p))}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all
                          ${discountValue === String(p)
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                )}

                {/* Value input + Apply */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      {discountType === 'PERCENT' ? '%' : '₹'}
                    </span>
                    <input
                      type="number"
                      min="0"
                      max={discountType === 'PERCENT' ? 100 : undefined}
                      step="0.01"
                      placeholder={discountType === 'PERCENT' ? 'e.g. 10' : 'e.g. 50'}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      disabled={discountLoading}
                      className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={discountLoading || !discountValue || Number(discountValue) <= 0}
                    onClick={async () => {
                      if (discountType === 'PERCENT' && Number(discountValue) > 100) {
                        showFeedback('error', 'Percent cannot exceed 100')
                        return
                      }
                      setDiscountLoading(true)
                      try {
                        const res = await applyDiscount(bill.id, discountType, discountValue)
                        if (res.success) {
                          setDiscountValue('')
                          showFeedback('success', `Discount applied — ₹${Number(res.data.discountAmount).toFixed(2)} off`)
                          refetch()
                        } else {
                          showFeedback('error', res.message || 'Discount apply failed')
                        }
                      } catch (err) {
                        showFeedback('error', err.response?.data?.message || 'Discount apply failed')
                      } finally {
                        setDiscountLoading(false)
                      }
                    }}
                    className="px-4 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50"
                  >
                    {discountLoading ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Status */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Payment Status</h2>
        <div className="space-y-2 text-sm mb-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Total</span>
            <span className="text-gray-800">₹{Number(bill.totalAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Paid</span>
            <span className="text-green-600 font-semibold">
              ₹{Number(bill.paidAmount).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
            <span className="text-gray-800">Due</span>
            <span className={isFullyPaid ? 'text-green-600' : 'text-orange-600'}>
              ₹{Number(bill.dueAmount).toFixed(2)}
            </span>
          </div>
        </div>

        {bill.payments && bill.payments.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-700 mb-2">Payment History</p>
            <div className="space-y-1.5">
              {bill.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-start justify-between text-xs bg-gray-50 rounded-md p-2"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {payment.method}{' '}
                      <span className="text-gray-500 font-normal">
                        by {payment.receivedByUsername}
                      </span>
                    </p>
                    <p className="text-gray-500" title={formatTime(payment.createdAt)}>
                      {timeAgo(payment.createdAt)}
                    </p>
                    {payment.reference && (
                      <p className="text-gray-600 mt-0.5">Ref: {payment.reference}</p>
                    )}
                    {payment.notes && (
                      <p className="text-gray-600 italic mt-0.5">Note: {payment.notes}</p>
                    )}
                  </div>
                  <p className="font-semibold text-green-700">
                    ₹{Number(payment.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex gap-2">

          {!isCancelled && !isFullyPaid && !isSettled && (
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm"
            >
              + Add Payment
            </button>
          )}

          {!isCancelled && isSettled && (
            <button
              type="button"
              onClick={handlePrintBill}
              disabled={printingBill}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-60"
            >
              {printingBill ? 'Loading...' : '🖨️ Print Bill'}
            </button>
          )}

          {!isCancelled && !isSettled && (
            <button
              type="button"
              onClick={() => { setCancelReason(''); setShowCancelModal(true) }}
              className="px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-300 rounded-lg"
            >
              Cancel Bill
            </button>
          )}

        </div>

        {isFullyPaid && !isSettled && (
          <p className="text-xs text-yellow-700 mt-2 italic">
            Bill fully paid but not yet settled. Refresh to update.
          </p>
        )}
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Add Payment"
        size="md"
      >
        {bill && (
          <PaymentForm
            bill={bill}
            onPaymentAdded={handlePaymentAdded}
            onCancel={() => setShowPaymentModal(false)}
          />
        )}
      </Modal>

      {/* Cancel Bill Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => !cancelLoading && setShowCancelModal(false)}
        title="Cancel Bill"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-red-700">
              ⚠️ This will permanently cancel {bill?.billNumber}
            </p>
            <p className="text-xs text-red-500 mt-1">
              This action cannot be undone. The order will be released.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cancellation Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Customer changed mind, Wrong items ordered..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              disabled={cancelLoading}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
            {cancelReason.trim().length > 0 && cancelReason.trim().length < 5 && (
              <p className="text-xs text-red-500 mt-1">
                Reason must be at least 5 characters
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              'Customer cancelled order',
              'Wrong items ordered',
              'Duplicate bill',
              'Payment issue',
            ].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setCancelReason(r)}
                disabled={cancelLoading}
                className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-all
                  ${cancelReason === r
                    ? 'bg-red-100 border-red-400 text-red-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowCancelModal(false)}
              disabled={cancelLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60"
            >
              Keep Bill
            </button>
            <button
              type="button"
              onClick={handleCancelBill}
              disabled={cancelLoading || cancelReason.trim().length < 5}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
            >
              {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Bill'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  )
}