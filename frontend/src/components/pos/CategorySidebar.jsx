export default function CategorySidebar({
  categories,
  products,
  selectedCategoryId,
  onSelect,
}) {
  // Count products per category
  const getCount = (catId) => {
    if (catId === 'all') return products.length
    return products.filter((p) => p.categoryId === catId).length
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-2 h-full overflow-y-auto">
      <button
        type="button"
        onClick={() => onSelect('all')}
        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors ${
          selectedCategoryId === 'all'
            ? 'bg-orange-100 text-orange-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center justify-between">
          <span>All Items</span>
          <span className="text-xs text-gray-400">{getCount('all')}</span>
        </div>
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.id)}
          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors ${
            selectedCategoryId === cat.id
              ? 'bg-orange-100 text-orange-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="truncate">{cat.name}</span>
            <span className="text-xs text-gray-400 ml-2">{getCount(cat.id)}</span>
          </div>
        </button>
      ))}
    </div>
  )
}