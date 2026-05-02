const statusConfig = {
  AVAILABLE: {
    card: 'border-green-300 bg-green-50 hover:bg-green-100 hover:shadow-md',
    dot: 'bg-green-500',
    label: 'Available',
    labelStyle: 'bg-green-100 text-green-700',
  },
  RUNNING: {
    card: 'border-red-300 bg-red-50 hover:bg-red-100 hover:shadow-md',
    dot: 'bg-red-500',
    label: 'Running',
    labelStyle: 'bg-red-100 text-red-700',
  },
  PAID: {
    card: 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100 hover:shadow-md',
    dot: 'bg-yellow-500',
    label: 'Paid',
    labelStyle: 'bg-yellow-100 text-yellow-700',
  },
}

export default function TableCard({ table, onClick }) {
  const config = statusConfig[table.status] || {
    card: 'border-gray-200 bg-white',
    dot: 'bg-gray-400',
    label: table.status,
    labelStyle: 'bg-gray-100 text-gray-600',
  }

  return (
    <button
      onClick={() => onClick?.(table)}
      className={`relative border-2 rounded-xl p-3 sm:p-4 text-left transition-all duration-200 w-full ${config.card} ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      {/* Status dot */}
      <div className="absolute top-2.5 right-2.5">
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${config.dot} shadow-sm`} />
      </div>

      {/* Table number */}
      <div className="mb-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
          Table
        </p>
        <p className="text-3xl font-black text-gray-800 leading-none mt-0.5">
          {table.tableNumber}
        </p>
      </div>

      {/* Table name if exists */}
      {table.tableName && table.tableName !== `Table ${table.tableNumber}` && (
        <p className="text-xs text-gray-500 truncate mb-1.5">
          {table.tableName}
        </p>
      )}

      {/* Seats */}
      <p className="text-xs text-gray-500 mb-2">
        🪑 {table.capacity} seats
      </p>

      {/* Status badge */}
      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${config.labelStyle}`}>
        {config.label}
      </span>
    </button>
  )
}