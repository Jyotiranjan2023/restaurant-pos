import { useRef } from 'react'
import { getImageUrl, validateImageFile } from '../utils/fileValidation'

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  onToggleAvailability,
  onQuickImageUpload,
}) {
  const fileInputRef = useRef(null)
  const imageSrc = getImageUrl(product.imageUrl)

  const handleQuickUploadClick = (e) => {
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      alert(validation.error) // simple feedback for quick upload; full handling in modal
      e.target.value = ''
      return
    }

    onQuickImageUpload(product, file)
    e.target.value = ''
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      {/* Hidden file input for quick upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image area with overlay */}
      <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-3 group">
        {imageSrc ? (
          <>
            <img
              src={imageSrc}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            {/* Hover camera icon for change */}
            <button
              onClick={handleQuickUploadClick}
              className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
              title="Change image"
            >
              <span className="text-sm">📷</span>
            </button>
          </>
        ) : (
          // No image: entire area clickable to upload
          <button
            onClick={handleQuickUploadClick}
            className="w-full h-full flex flex-col items-center justify-center hover:bg-gray-200 transition-colors"
            title="Upload image"
          >
            <span className="text-2xl mb-1">📷</span>
            <span className="text-xs text-gray-500">Add Image</span>
          </button>
        )}
      </div>

      {/* Name + price */}
      <div className="mb-2">
        <h3 className="font-semibold text-gray-800 text-sm truncate">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <p className="text-orange-600 font-bold text-base">₹{product.price}</p>
          <p className="text-xs text-gray-400">GST {product.gstPercent}%</p>
        </div>
      </div>

      {product.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {product.description}
        </p>
      )}

      <p className="text-xs text-gray-400 mb-2">{product.categoryName}</p>

      {/* Availability */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => onToggleAvailability(product)}
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            product.available
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {product.available ? 'Available' : 'Sold Out'}
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => onEdit(product)}
          className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-md font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(product)}
          className="flex-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 py-1.5 rounded-md font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  )
}