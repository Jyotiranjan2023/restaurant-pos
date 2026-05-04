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

  if (tables.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-sm text-yellow-800 font-medium">No tables configured</p>
        <p className="text-xs text-yellow-700 mt-1">
          Add tables from the Tables page first.
        </p>
      </div>
    )
  }

  const availableCount = tables.filter((t) => t.status === 'AVAILABLE').length

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {tables.map((table) => {
          const isAvailable = table.status === 'AVAILABLE'
          const isSelected = selectedTableId === table.id

          let buttonClass = 'p-3 rounded-lg border-2 text-center transition-all '
          if (!isAvailable) {
            buttonClass += 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'
          } else if (isSelected) {
            buttonClass += 'border-orange-500 bg-orange-50'
          } else {
            buttonClass += 'border-gray-200 bg-white hover:border-gray-300'
          }

          return (
            <button
              key={table.id}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelect(table.id)}
              title={!isAvailable ? `Table ${table.tableNumber} has a running order` : ''}
              className={buttonClass}
            >
              <p className="text-xs text-gray-500">Table</p>
              <p className={`text-xl font-bold ${
                !isAvailable ? 'text-gray-400' :
                isSelected ? 'text-orange-600' : 'text-gray-800'
              }`}>
                {table.tableNumber}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Seats {table.capacity}
              </p>
              {!isAvailable && (
                <p className="text-[10px] text-red-500 font-semibold mt-1">
                  Occupied
                </p>
              )}
            </button>
          )
        })}
      </div>

      {availableCount === 0 && (
        <p className="mt-3 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
          All tables are occupied. Wait for one to be cleared, or use Takeaway.
        </p>
      )}
    </div>
  )
}