import { useState } from 'react'
import { addPayment } from '../../services/billService'

const PAYMENT_METHODS = [
  { value: 'CASH',   label: 'Cash',   icon: '💵', showRef: false },
  { value: 'CARD',   label: 'Card',   icon: '💳', showRef: true,  refLabel: 'Card / Approval Ref No.' },
  { value: 'UPI',    label: 'UPI',    icon: '📱', showRef: true,  refLabel: 'UPI Transaction ID / UTR' },
  { value: 'WALLET', label: 'Wallet', icon: '👛', showRef: true,  refLabel: 'Wallet Ref No. (optional)' },
  { value: 'OTHER',  label: 'Other',  icon: '🔖', showRef: true,  refLabel: 'Reference (optional)' },
]

export default function PaymentForm({ bill, onPaymentAdded, onCancel }) {
  const [method, setMethod]   = useState('CASH')
  const [amount, setAmount]   = useState(Number(bill.dueAmount).toFixed(2))
  const [reference, setReference] = useState('')
  const [notes, setNotes]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const dueAmount = Number(bill.dueAmount)
  const selectedMethod = PAYMENT_METHODS.find(m => m.value === method)

  const validateAmount = (val) => {
    const num = Number(val)
    if (isNaN(num) || val === '') return 'Enter a valid number'
    if (num <= 0) return 'Amount must be greater than zero'
    if (num > dueAmount) return `Amount cannot exceed due (₹${dueAmount.toFixed(2)})`
    return null
  }

  const handleMethodChange = (val) => {
    setMethod(val)
    setReference('')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const validationError = validateAmount(amount)
    if (validationError) { setError(validationError); return }

    setLoading(true)
    try {
      const payload = {
        method,
        amount: Number(amount),
        reference: reference.trim() || null,
        notes: notes.trim() || null,
      }

      const res = await addPayment(bill.id, payload)
      if (res.success) {
        onPaymentAdded(res.data)
      } else {
        setError(res.message || 'Failed to add payment')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickFill = (value) => {
    setAmount(value.toFixed(2))
    setError('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Bill summary */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
        <div className="flex justify-between text-gray-700">
          <span>Bill total:</span>
          <span className="font-medium">₹{Number(bill.totalAmount).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Already paid:</span>
          <span className="font-medium">₹{Number(bill.paidAmount).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-bold pt-1 mt-1 border-t border-orange-200">
          <span>Amount due:</span>
          <span className="text-orange-700">₹{dueAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => handleMethodChange(m.value)}
              disabled={loading}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg border text-xs font-medium transition-all
                ${method === m.value
                  ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-400'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
            >
              <span className="text-lg">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reference field — only for CARD, UPI, WALLET, OTHER */}
      {selectedMethod?.showRef && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {selectedMethod.refLabel}
          </label>
          <input
            type="text"
            placeholder={selectedMethod.refLabel}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      )}

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount Received <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
          <input
            type="number"
            step="0.01"
            min="0"
            max={dueAmount}
            value={amount}
            onChange={(e) => { setAmount(e.target.value); if (error) setError('') }}
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            autoFocus
          />
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleQuickFill(dueAmount)}
            disabled={loading}
            className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium"
          >
            Full Due (₹{dueAmount.toFixed(2)})
          </button>
          {dueAmount >= 100 && (
            <button
              type="button"
              onClick={() => handleQuickFill(Math.floor(dueAmount / 2))}
              disabled={loading}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium"
            >
              Half (₹{Math.floor(dueAmount / 2).toFixed(2)})
            </button>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <input
          type="text"
          placeholder="e.g., Paid in 500 + 100 notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={loading}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-60"
        >
          {loading ? 'Recording...' : `Record ${selectedMethod?.label} Payment`}
        </button>
      </div>

    </form>
  )
}