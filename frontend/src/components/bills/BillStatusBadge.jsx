const styles = {
  PENDING: 'bg-orange-50 text-orange-700 border-orange-200',
  PARTIALLY_PAID: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  PAID: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
}

const labels = {
  PENDING: 'Pending Payment',
  PARTIALLY_PAID: 'Partially Paid',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
}

export default function BillStatusBadge({ status }) {
  const style = styles[status] || styles.PENDING
  const label = labels[status] || status

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${style}`}
    >
      {label}
    </span>
  )
}