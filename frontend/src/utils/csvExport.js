/**
 * Convert array of objects to CSV string.
 * - columns: [{ key: 'name', label: 'Product Name' }, ...]
 * - rows: array of objects matching keys
 */
export function generateCsv(columns, rows) {
  const escape = (val) => {
    if (val === null || val === undefined) return ''
    const str = String(val)
    // Wrap in quotes if value contains comma, newline, or double-quote
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const header = columns.map(c => escape(c.label)).join(',')
  const body = rows.map(row =>
    columns.map(c => escape(row[c.key])).join(',')
  ).join('\n')

  return header + '\n' + body
}

/**
 * Trigger browser download of CSV content.
 * Filename should NOT include .csv extension — added automatically.
 */
export function downloadCsv(filename, csvContent) {
  // Add UTF-8 BOM so Excel reads ₹ symbol correctly
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Convenience: build CSV and download in one call.
 */
export function exportToCsv(filename, columns, rows) {
  const csv = generateCsv(columns, rows)
  downloadCsv(filename, csv)
}