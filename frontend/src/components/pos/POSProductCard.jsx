import { getImageUrl } from '../../utils/fileValidation'

export default function POSProductCard({ product, onAdd }) {
  const imageSrc = getImageUrl(product.imageUrl)
  const isAvailable = product.available

  return (
    <button
      type="button"
      disabled={!isAvailable}
      onClick={() => onAdd(product)}
      className={`bg-white border border-gray-200 rounded-lg p-2 text-left transition-all ${
        isAvailable
          ? 'hover:border-orange-400 hover:shadow-md cursor-pointer'
          : 'opacity-50 cursor-not-allowed'
      }`}
    >
      {/* Image */}
      <div className="w-full h-20 bg-gray-100 rounded-md overflow-hidden mb-2">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            🍽️
          </div>
        )}
      </div>

      {/* Name + price */}
      <div>
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">
          {product.name}
        </p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm font-bold text-orange-600">₹{product.price}</p>
          {!isAvailable && (
            <span className="text-[10px] text-red-600 font-semibold">
              SOLD OUT
            </span>
          )}
        </div>
      </div>
    </button>
  )
}