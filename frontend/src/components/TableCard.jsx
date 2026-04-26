const cardStyles = {
  AVAILABLE: 'border-green-300 bg-green-50 hover:bg-green-100',
  RUNNING: 'border-red-300 bg-red-50 hover:bg-red-100',
  PAID: 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100',
}

export default function TableCard({ table, onClick }) {
  const cardStyle = cardStyles[table.status] || 'border-gray-300 bg-white'

  return (
    <button
      onClick={() => onClick?.(table)}
      className={`relative border-2 rounded-xl p-4 text-left transition-all duration-200 ${cardStyle} ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      {/* Status indicator dot */}
      <div className="absolute top-3 right-3">
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${
          table.status === 'AVAILABLE' ? 'bg-green-500' :
          table.status === 'RUNNING' ? 'bg-red-500' :
          'bg-yellow-500'
        }`}></span>
      </div>

      {/* Table info */}
      <div>
        <p className="text-xs text-gray-500 mb-1">Table</p>
        <p className="text-2xl font-bold text-gray-800">{table.tableNumber}</p>
        <p className="text-xs text-gray-500 mt-2">
          Seats {table.capacity}
        </p>
      </div>
    </button>
  )
}