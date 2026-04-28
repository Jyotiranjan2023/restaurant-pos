import { useParams, useNavigate } from 'react-router-dom'
import useBill from '../hooks/useBill'
import BillStatusBadge from '../components/bills/BillStatusBadge'
import { timeAgo, formatTime } from '../utils/timeFormat'

import { useState } from 'react'
import Modal from '../components/Modal'
import PaymentForm from '../components/bills/PaymentForm'
import { fetchBillPrintHtml } from '../services/billService'

export default function BillDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { bill, loading, error, refetch } = useBill(id)

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [printingBill, setPrintingBill] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

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
    
    // Open new window and write the HTML directly
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (!printWindow) {
      showFeedback('error', 'Popup blocked. Please allow popups for this site.')
      return
    }
    
    printWindow.document.write(html)
    printWindow.document.close()
    
    // Auto-trigger print dialog after content loads
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

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-800">
                {bill.billNumber}
              </h1>
              <BillStatusBadge status={bill.status} />
              {isSettled && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  Settled
                </span>
              )}
            </div>
            <p
              className="text-xs text-gray-500 mt-1"
              title={formatTime(bill.createdAt)}
            >
              Generated {timeAgo(bill.createdAt)} by {bill.generatedByUsername}
            </p>
            {bill.settledAt && (
              <p
                className="text-xs text-gray-500"
                title={formatTime(bill.settledAt)}
              >
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
          <p className="text-sm text-gray-400 italic">
            No items recorded on this bill.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {bill.items.map((item) => (
              <div key={item.id} className="py-2 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {item.itemName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Qty: {item.quantity} × ₹{Number(item.itemPrice).toFixed(2)} ·
                    GST {item.gstPercent}%
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
            <span className="text-gray-800">
              ₹{Number(bill.subtotal).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">GST</span>
            <span className="text-gray-800">
              ₹{Number(bill.gstAmount).toFixed(2)}
            </span>
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
            <span className="text-gray-800">
              ₹{Number(bill.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">
          Payment Status
        </h2>

        <div className="space-y-2 text-sm mb-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Total</span>
            <span className="text-gray-800">
              ₹{Number(bill.totalAmount).toFixed(2)}
            </span>
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
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Payment History
            </p>
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
                    <p
                      className="text-gray-500"
                      title={formatTime(payment.createdAt)}
                    >
                      {timeAgo(payment.createdAt)}
                    </p>
                    {payment.notes && (
                      <p className="text-gray-600 italic mt-0.5">
                        Note: {payment.notes}
                      </p>
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

     
{!isCancelled && (
  <div className="bg-white border border-gray-200 rounded-xl p-4">
    <div className="flex gap-2">
      {/* Add Payment — show when due > 0 AND not settled */}
      {!isFullyPaid && !isSettled && (
        <button
          type="button"
          onClick={() => setShowPaymentModal(true)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm"
        >
          + Add Payment
        </button>
      )}

      {/* Print Bill — show when bill is settled (auto-settled by backend) */}
      {isSettled && (
        <button
          type="button"
          onClick={handlePrintBill}
          disabled={printingBill}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-60"
        >
          {printingBill ? 'Loading...' : '🖨️ Print Bill'}
        </button>
      )}
    </div>

    {/* Helpful info text */}
    {isFullyPaid && !isSettled && (
      <p className="text-xs text-yellow-700 mt-2 italic">
        Bill is fully paid but not yet settled by backend. Refresh to update.
      </p>
    )}
  </div>
)}


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
    </div>
  )
}