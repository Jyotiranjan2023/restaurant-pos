import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import ImageUpload from './ImageUpload'
import Modal from './Modal'
import CategoryQuickCreate from './CategoryQuickCreate'

export default function ProductForm({
  initialData,
  categories,
  onCategoryCreated,
  onSubmit,
  onCancel,
  loading,
}) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [removeExistingImage, setRemoveExistingImage] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      name: '',
      price: '',
      gstPercent: 5,
      categoryId: '',
      description: '',
      available: true,
    },
  })

  useEffect(() => {
    if (initialData) reset(initialData)
    setSelectedFile(null)
    setRemoveExistingImage(false)
  }, [initialData, reset])

  const handleFormSubmit = (data) => {
    onSubmit(data, { file: selectedFile, removeImage: removeExistingImage })
  }

  const handleCategoryCreated = (newCategory) => {
    onCategoryCreated(newCategory)
    setValue('categoryId', newCategory.id)
    setShowCategoryModal(false)
  }

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Paneer Tikka"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 2, message: 'At least 2 characters' },
            })}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Price + GST */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              {...register('price', {
                required: 'Price is required',
                min: { value: 0, message: 'Must be positive' },
                valueAsNumber: true,
              })}
            />
            {errors.price && (
              <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST (%) <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              {...register('gstPercent', {
                required: 'GST is required',
                valueAsNumber: true,
              })}
            >
              <option value={0}>0%</option>
              <option value={5}>5%</option>
              <option value={12}>12%</option>
              <option value={18}>18%</option>
              <option value={28}>28%</option>
            </select>
          </div>
        </div>

        {/* Category — with inline create */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className="text-xs text-orange-600 hover:text-orange-700 font-medium"
            >
              + New Category
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="border-2 border-dashed border-orange-300 bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-700 mb-2">
                No categories yet. Create your first one.
              </p>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md font-medium"
              >
                + Create Category
              </button>
            </div>
          ) : (
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              {...register('categoryId', {
                required: 'Category is required',
                valueAsNumber: true,
              })}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}

          {errors.categoryId && (
            <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Optional product description"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            {...register('description')}
          />
        </div>

        {/* Available */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="available"
            className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
            {...register('available')}
          />
          <label htmlFor="available" className="text-sm text-gray-700">
            Available for ordering
          </label>
        </div>

        {/* Image */}
        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image
          </label>
          <ImageUpload
            currentImageUrl={removeExistingImage ? null : initialData?.imageUrl}
            onFileSelect={(file) => {
              setSelectedFile(file)
              setRemoveExistingImage(false)
            }}
            onRemove={() => {
              setSelectedFile(null)
              setRemoveExistingImage(true)
            }}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-2">
            Image upload happens after saving product details.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || categories.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
            title={categories.length === 0 ? 'Create a category first' : ''}
          >
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>

      {/* Quick Create Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Create New Category"
        size="sm"
      >
        <CategoryQuickCreate
          onCreated={handleCategoryCreated}
          onCancel={() => setShowCategoryModal(false)}
        />
      </Modal>
    </>
  )
}