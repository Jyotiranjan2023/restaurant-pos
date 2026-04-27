import useTables from '../../hooks/useTables'

export default function TablePicker({ selectedTableId, onSelect }) {
  const { tables, loading, error } = useTables()

  if (loading) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">Loading tables...</p>
    )
  }

  if (error) {
    return (
      <p className="text-sm text-red-600 text-center py-4">
        Failed to load tables: {error}
      </p>
    )
  }

  // Only show tables that are available for new orders
  const availableTables = tables.filter((t) => t.status === 'AVAILABLE')

  if (availableTables.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-sm text-yellow-800 font-medium">
          No tables available
        </p>
        <p className="text-xs text-yellow-700 mt-1">
          All tables are currently running orders. Wait for one to be cleared,
          or use Takeaway instead.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
      {availableTables.map((table) => {
        const isSelected = selectedTableId === table.id
        return (
          <button
            key={table.id}
            type="button"
            onClick={() => onSelect(table.id)}
            className={`p-3 rounded-lg border-2 text-center transition-all ${
              isSelected
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-xs text-gray-500">Table</p>
            <p className={`text-xl font-bold ${
              isSelected ? 'text-orange-600' : 'text-gray-800'
            }`}>
              {table.tableNumber}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Seats {table.capacity}
            </p>
          </button>
        )
      })}
    </div>
  )
}