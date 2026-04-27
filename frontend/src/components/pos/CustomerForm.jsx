export default function CustomerForm({ orderType, customer, onChange, errors }) {
  // Define which fields are required based on order type
  const isPhoneRequired = orderType === 'TAKEAWAY' || orderType === 'DELIVERY'
  const isNameRequired = orderType === 'TAKEAWAY' || orderType === 'DELIVERY'
  const isAddressRequired = orderType === 'DELIVERY'
  const showAddress = orderType === 'DELIVERY'

  // For DINE_IN, the entire form is optional
  const isOptional = orderType === 'DINE_IN'

  const handleFieldChange = (field, value) => {
    onChange({ ...customer, [field]: value })
  }

  return (
    <div className="space-y-3">
      {isOptional && (
        <p className="text-xs text-gray-500 italic">
          Customer details are optional for dine-in orders.
        </p>
      )}

      {/* Phone — usually first because backend uses it to lookup existing customer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone {isPhoneRequired && <span className="text-red-500">*</span>}
        </label>
        <input
          type="tel"
          placeholder="10-digit mobile number"
          value={customer.phone || ''}
          onChange={(e) => handleFieldChange('phone', e.target.value)}
          maxLength={10}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        {errors?.phone && (
          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Customer Name {isNameRequired && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          placeholder="e.g., Rahul Kumar"
          value={customer.name || ''}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        {errors?.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      {/* Address — only for DELIVERY */}
      {showAddress && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Address {isAddressRequired && <span className="text-red-500">*</span>}
          </label>
          <textarea
            rows={2}
            placeholder="Full delivery address with landmark"
            value={customer.address || ''}
            onChange={(e) => handleFieldChange('address', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          {errors?.address && (
            <p className="text-red-500 text-xs mt-1">{errors.address}</p>
          )}
        </div>
      )}
    </div>
  )
}