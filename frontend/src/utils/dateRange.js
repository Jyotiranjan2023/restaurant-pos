/**
 * Generates an array of YYYY-MM-DD date strings from start to end (inclusive).
 */
export function generateDateRange(startDate, endDate) {
  const dates = []
  const current = new Date(startDate)
  const end = new Date(endDate)
  
  // Normalize to start of day to avoid timezone issues
  current.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  
  while (current <= end) {
  const yyyy = current.getFullYear()
  const mm = String(current.getMonth() + 1).padStart(2, '0')
  const dd = String(current.getDate()).padStart(2, '0')
  dates.push(`${yyyy}-${mm}-${dd}`)
  current.setDate(current.getDate() + 1)
}
  
  return dates
}

/**
 * Fills gaps in date-keyed data with zero entries.
 *
 * @param {Array} data - Existing data, e.g. [{ date: "2026-04-28", revenue: 2061.15, orderCount: 6 }]
 * @param {string|Date} startDate - Range start (inclusive)
 * @param {string|Date} endDate - Range end (inclusive)
 * @param {string} dateField - Name of date field, default "date"
 * @param {Object} fillValues - Default values for missing days, e.g. { revenue: 0, orderCount: 0 }
 * @returns {Array} - Complete array with no date gaps, sorted ascending by date
 */
export function fillDateGaps(data, startDate, endDate, dateField = 'date', fillValues = {}) {
  // Build lookup map of existing data
  const existingMap = new Map()
  data.forEach(item => {
    // Normalize date — backend may send "2026-04-28" or "2026-04-28T00:00:00"
    const dateKey = String(item[dateField]).slice(0, 10)
    existingMap.set(dateKey, item)
  })
  
  const fullRange = generateDateRange(startDate, endDate)
  
  return fullRange.map(date => {
    if (existingMap.has(date)) {
      return existingMap.get(date)
    }
    // Day missing — return zero entry
    return {
      [dateField]: date,
      ...fillValues,
      _isEmpty: true,  // Internal marker for UI to style differently
    }
  })
}