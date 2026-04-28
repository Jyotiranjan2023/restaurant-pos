const styles = {
  NEW: 'bg-blue-50 text-blue-700 border-blue-200',
  PREPARING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  READY: 'bg-green-50 text-green-700 border-green-200',
  SERVED: 'bg-gray-50 text-gray-700 border-gray-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
}

const labels = {
  NEW: 'New',
  PREPARING: 'Preparing',
  READY: 'Ready',
  SERVED: 'Served',
  CANCELLED: 'Cancelled',
}

export default function ItemStatusBadge({ status }) {
  const style = styles[status] || styles.NEW
  const label = labels[status] || status

  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${style}`}
    >
      {label}
    </span>
  )
}