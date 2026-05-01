import { useState, useEffect } from 'react'
import {
  fetchAllCoupons,
  createCoupon,
  updateCoupon,
  updateCouponStatus,
  deleteCoupon,
} from '../services/couponService'
import Modal from '../components/Modal'

const EMPTY_FORM = {
  code: '',
  description: '',
  type: 'PERCENT',
  value: '',
  maxDiscount: '',
  minOrderValue: '',
  maxUsage: '',
  maxPerCustomer: '',
  validFrom: '',
  validUntil: '',
  active: true,
}

function CouponForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!initial?.id

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.code.trim()) { setError('Code is required'); return }
    if (!form.description.trim()) { setError('Description is required'); return }
    if (!form.value || Number(form.value) <= 0) { setError('Value must be greater than 0'); return }
    if (form.type === 'PERCENT' && Number(form.value) > 100) { setError('Percent cannot exceed 100'); return }

    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      type: form.type,
      value: Number(form.value),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : null,
      maxUsage: form.maxUsage ? Number(form.maxUsage) : null,
      maxPerCustomer: form.maxPerCustomer ? Number(form.maxPerCustomer) : null,
      validFrom: form.validFrom || null,
      validUntil: form.validUntil || null,
      active: form.active,
    }

    setLoading(true)
    try {
      const res = isEdit
        ? await updateCoupon(initial.id, payload)
        : await createCoupon(payload)
      if (res.success) {
        onSave()
      } else {
        setError(res.message || 'Save failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Code + Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Coupon Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => set('code', e.target.value.toUpperCase())}
            placeholder="e.g. WELCOME50"
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 uppercase"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {['PERCENT', 'FLAT'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set('type', t)}
                disabled={loading}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all
                  ${form.type === t
                    ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-400'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {t === 'PERCENT' ? '% Percent' : '₹ Flat'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="e.g. Flat 50% discount on first order"
          disabled={loading}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* Value + Max Discount */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {form.type === 'PERCENT' ? 'Discount %' : 'Flat Amount (₹)'}
            <span className="text-red-500"> *</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              {form.type === 'PERCENT' ? '%' : '₹'}
            </span>
            <input
              type="number"
              min="0"
              max={form.type === 'PERCENT' ? 100 : undefined}
              step="0.01"
              value={form.value}
              onChange={(e) => set('value', e.target.value)}
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Max Discount (₹) <span className="text-gray-400">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.maxDiscount}
              onChange={(e) => set('maxDiscount', e.target.value)}
              placeholder="No limit"
              disabled={loading || form.type === 'FLAT'}
              className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
          {form.type === 'FLAT' && (
            <p className="text-xs text-gray-400 mt-1">Not applicable for flat discount</p>
          )}
        </div>
      </div>

      {/* Min Order + Max Usage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Min Order Value (₹) <span className="text-gray-400">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.minOrderValue}
              onChange={(e) => set('minOrderValue', e.target.value)}
              placeholder="No minimum"
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Max Usage <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="number"
            min="0"
            value={form.maxUsage}
            onChange={(e) => set('maxUsage', e.target.value)}
            placeholder="Unlimited"
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>

      {/* Max Per Customer + Active */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Max Per Customer <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="number"
            min="0"
            value={form.maxPerCustomer}
            onChange={(e) => set('maxPerCustomer', e.target.value)}
            placeholder="Unlimited"
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <div className="flex gap-2">
            {[true, false].map((val) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => set('active', val)}
                disabled={loading}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all
                  ${form.active === val
                    ? val
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-red-50 border-red-400 text-red-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {val ? 'Active' : 'Inactive'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Valid From + Until */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Valid From <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="datetime-local"
            value={form.validFrom}
            onChange={(e) => set('validFrom', e.target.value)}
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Valid Until <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="datetime-local"
            value={form.validUntil}
            onChange={(e) => set('validUntil', e.target.value)}
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
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
          className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-60"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Coupon' : 'Create Coupon'}
        </button>
      </div>
    </form>
  )
}

export default function Coupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000)
  }

  const loadCoupons = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchAllCoupons()
      if (res.success) {
        setCoupons(res.data)
      } else {
        setError(res.message || 'Failed to load coupons')
      }
    } catch {
      setError('Server error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCoupons() }, [])

  const handleToggleStatus = async (coupon) => {
    try {
      const res = await updateCouponStatus(coupon.id, !coupon.active)
      if (res.success) {
        showFeedback('success', `Coupon ${!coupon.active ? 'activated' : 'deactivated'}`)
        loadCoupons()
      } else {
        showFeedback('error', res.message || 'Status update failed')
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Server error')
    }
  }
 const handleDelete = async () => {
  if (!deleteTarget) return
  setDeleteLoading(true)
  const targetId = deleteTarget.id
  const targetCode = deleteTarget.code
  try {
    const res = await deleteCoupon(targetId)
    if (res.success) {
      setDeleteTarget(null)
      setCoupons(prev => prev.filter(c => c.id !== targetId))
      showFeedback('success', `Coupon "${targetCode}" deleted`)
      await loadCoupons()
      // NO loadCoupons() here — backend bug, deleted coupon returns in GET
    } else {
      showFeedback('error', res.message || 'Delete failed')
      setDeleteTarget(null)
    }
  } catch (err) {
    showFeedback('error', err.response?.data?.message || 'Server error')
    setDeleteTarget(null)
  } finally {
    setDeleteLoading(false)
  }
}

  const handleSaved = () => {
    setShowForm(false)
    setEditTarget(null)
    showFeedback('success', editTarget ? 'Coupon updated' : 'Coupon created')
    loadCoupons()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Coupons</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage discount coupons for your restaurant
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setEditTarget(null); setShowForm(true) }}
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          + Add Coupon
        </button>
      </div>

      {/* Feedback */}
      {feedback.message && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm border ${
          feedback.type === 'success'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Loading coupons...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
          <button onClick={loadCoupons} className="ml-3 underline">Retry</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && coupons.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">🎟️</p>
          <p className="text-gray-500 text-sm">No coupons yet</p>
          <button
            onClick={() => { setEditTarget(null); setShowForm(true) }}
            className="mt-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            Create First Coupon
          </button>
        </div>
      )}

      {/* Coupon Cards */}
      {!loading && !error && coupons.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className={`bg-white border rounded-xl p-4 flex flex-col gap-3 ${
                coupon.active ? 'border-gray-200' : 'border-gray-200 opacity-60'
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-800 tracking-wide">
                      {coupon.code}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${
                      coupon.active
                        ? 'bg-green-50 text-green-700 border-green-300'
                        : 'bg-gray-100 text-gray-500 border-gray-300'
                    }`}>
                      {coupon.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {coupon.description}
                  </p>
                </div>

                {/* Discount badge */}
                <div className="shrink-0 bg-orange-50 border border-orange-200 rounded-lg px-2 py-1 text-center">
                  <p className="text-base font-bold text-orange-600">
                    {coupon.type === 'PERCENT'
                      ? `${Number(coupon.value).toFixed(0)}%`
                      : `₹${Number(coupon.value).toFixed(0)}`
                    }
                  </p>
                  <p className="text-xs text-orange-500">
                    {coupon.type === 'PERCENT' ? 'off' : 'flat'}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="text-xs text-gray-500 space-y-1 border-t border-gray-100 pt-2">
                {coupon.maxDiscount && (
                  <p>Max discount: <span className="font-medium text-gray-700">₹{Number(coupon.maxDiscount).toFixed(0)}</span></p>
                )}
                {coupon.minOrderValue > 0 && (
                  <p>Min order: <span className="font-medium text-gray-700">₹{Number(coupon.minOrderValue).toFixed(0)}</span></p>
                )}
                {coupon.maxUsage && (
                  <p>Usage: <span className="font-medium text-gray-700">{coupon.currentUsage}/{coupon.maxUsage}</span></p>
                )}
                {!coupon.maxUsage && (
                  <p>Usage: <span className="font-medium text-gray-700">{coupon.currentUsage} times used</span></p>
                )}
                {coupon.validUntil && (
                  <p>Expires: <span className="font-medium text-gray-700">
                    {new Date(coupon.validUntil).toLocaleDateString()}
                  </span></p>
                )}
              </div>

            {/* Actions */}
<div className="flex gap-2 pt-1">
  <button
    type="button"
    onClick={() => handleToggleStatus(coupon)}
    className={`flex-1 text-xs font-semibold py-1.5 rounded-lg border transition-all ${
      coupon.active
        ? 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
        : 'bg-green-500 border-green-500 text-white hover:bg-green-600'
    }`}
  >
    {coupon.active ? 'Deactivate' : 'Activate'}
  </button>
  <button
    type="button"
    onClick={() => { setEditTarget(coupon); setShowForm(true) }}
    className="flex-1 text-xs font-semibold py-1.5 rounded-lg border border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100"
  >
    Edit
  </button>
  <button
    type="button"
    onClick={() => setDeleteTarget(coupon)}
    className="flex-1 text-xs font-semibold py-1.5 rounded-lg border border-red-300 bg-red-500 text-white hover:bg-red-600"
  >
    Delete
  </button>
</div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditTarget(null) }}
        title={editTarget ? `Edit ${editTarget.code}` : 'Create Coupon'}
        size="lg"
      >
        <CouponForm
          initial={editTarget}
          onSave={handleSaved}
          onCancel={() => { setShowForm(false); setEditTarget(null) }}
        />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        title="Delete Coupon"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete coupon{' '}
            <span className="font-bold text-gray-900">{deleteTarget?.code}</span>?
            This cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
            >
              {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}