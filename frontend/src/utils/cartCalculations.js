// Round to 2 decimal places, half-up (matches backend BigDecimal rounding)
function roundHalfUp(num) {
  return Math.round(num * 100) / 100
}

// Per-item GST amount: subtotal × (gstPercent / 100)
export function calculateItemGst(price, quantity, gstPercent) {
  const subtotal = price * quantity
  const gst = subtotal * (gstPercent / 100)
  return roundHalfUp(gst)
}

// Per-item subtotal: price × quantity
export function calculateItemSubtotal(price, quantity) {
  return roundHalfUp(price * quantity)
}

// Cart totals — sums across all items
export function calculateCartTotals(items) {
  let subtotal = 0
  let gstAmount = 0

  items.forEach((item) => {
    const itemSubtotal = calculateItemSubtotal(item.price, item.quantity)
    const itemGst = calculateItemGst(item.price, item.quantity, item.gstPercent)
    subtotal += itemSubtotal
    gstAmount += itemGst
  })

  return {
    subtotal: roundHalfUp(subtotal),
    gstAmount: roundHalfUp(gstAmount),
    totalAmount: roundHalfUp(subtotal + gstAmount),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  }
}