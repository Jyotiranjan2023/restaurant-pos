const orderTypes = [
  {
    value: 'DINE_IN',
    label: 'Dine In',
    icon: '🪑',
    description: 'Customer eats in restaurant',
  },
  {
    value: 'TAKEAWAY',
    label: 'Takeaway',
    icon: '🥡',
    description: 'Customer picks up order',
  },
  {
    value: 'DELIVERY',
    label: 'Delivery',
    icon: '🛵',
    description: 'Send to customer address',
  },
]

export default function OrderTypeSelector({ value, onChange }) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {orderTypes.map((type) => {
          const isSelected = value === type.value
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange(type.value)}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                isSelected
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{type.icon}</div>
              <div className="text-sm font-semibold">{type.label}</div>
            </button>
          )
        })}
      </div>

      {/* Helper text below */}
      <p className="text-xs text-gray-500 mt-2">
        {value === 'DINE_IN' && 'Select a table next, then add items.'}
        {value === 'TAKEAWAY' && 'Add items, then collect customer details.'}
        {value === 'DELIVERY' && 'Customer details required for delivery.'}
      </p>
    </div>
  )
}