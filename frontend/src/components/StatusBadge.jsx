const statusStyles = {
  AVAILABLE: 'bg-green-100 text-green-700 border-green-200',
  RUNNING: 'bg-red-100 text-red-700 border-red-200',
  PAID: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

const statusLabels = {
  AVAILABLE: 'Available',
  RUNNING: 'Running',
  PAID: 'Paid',
}

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-700 border-gray-200'
  const label = statusLabels[status] || status

  return (
    <span
      className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${style}`}
    >
      {label}
    </span>
  )
}