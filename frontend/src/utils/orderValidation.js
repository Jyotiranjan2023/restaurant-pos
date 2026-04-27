export function validateCustomer(customer, orderType) {
  const errors = {}

  // DINE_IN: customer info is fully optional
  if (orderType === 'DINE_IN') {
    return { valid: true, errors: {} }
  }

  // TAKEAWAY and DELIVERY require name + phone
  if (!customer.name || customer.name.trim().length < 2) {
    errors.name = 'Customer name is required (min 2 characters)'
  }

  if (!customer.phone || !/^\d{10}$/.test(customer.phone.trim())) {
    errors.phone = 'Valid 10-digit phone number required'
  }

  // DELIVERY also requires address
  if (orderType === 'DELIVERY') {
    if (!customer.address || customer.address.trim().length < 5) {
      errors.address = 'Delivery address is required (min 5 characters)'
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateOrder({ orderType, tableId, items, customer }) {
  // Items required
  if (!items || items.length === 0) {
    return { valid: false, error: 'Cart is empty. Add items to save order.' }
  }

  // DINE_IN requires table
  if (orderType === 'DINE_IN' && !tableId) {
    return { valid: false, error: 'Select a table for dine-in order.' }
  }

  // Customer validation
  const customerCheck = validateCustomer(customer, orderType)
  if (!customerCheck.valid) {
    const firstError = Object.values(customerCheck.errors)[0]
    return { valid: false, error: firstError, customerErrors: customerCheck.errors }
  }

  return { valid: true }
}