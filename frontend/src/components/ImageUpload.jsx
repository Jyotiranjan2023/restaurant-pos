import { useState, useRef } from 'react'
import { validateImageFile, getImageUrl } from '../utils/fileValidation'

export default function ImageUpload({
  currentImageUrl,
  onFileSelect,
  onRemove,
  disabled = false,
}) {
  const fileInputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState('')

  // Determine which image to show: new preview > existing > none
  const displayImage = previewUrl || getImageUrl(currentImageUrl)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error)
      e.target.value = '' // Reset input
      return
    }

    setError('')

    // Create preview URL
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Pass file up to parent
    onFileSelect(file)
  }

  const handleChooseClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveClick = () => {
    setPreviewUrl(null)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    onRemove?.()
  }

  return (
    <div>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Preview area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        {displayImage ? (
          <div className="space-y-3">
            <img
              src={displayImage}
              alt="Product preview"
              className="mx-auto max-h-40 rounded-lg object-contain"
            />
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={handleChooseClick}
                disabled={disabled}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium disabled:opacity-50"
              >
                Change Image
              </button>
              {(previewUrl || currentImageUrl) && (
                <button
                  type="button"
                  onClick={handleRemoveClick}
                  disabled={disabled}
                  className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md font-medium disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-3xl">📷</div>
            <p className="text-sm text-gray-600">No image uploaded</p>
            <button
              type="button"
              onClick={handleChooseClick}
              disabled={disabled}
              className="text-xs px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md font-medium disabled:opacity-50"
            >
              Choose File
            </button>
            <p className="text-xs text-gray-400">JPG, PNG, WEBP — Max 5MB</p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-500 text-xs mt-2">{error}</p>
      )}
    </div>
  )
}