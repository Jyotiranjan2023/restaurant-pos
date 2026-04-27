import { useState, useMemo } from 'react'
import useCategories from '../hooks/useCategories'
import useProducts from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'
import Modal from '../components/Modal'
import ProductForm from '../components/ProductForm'
import ConfirmDialog from '../components/ConfirmDialog'
import {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  uploadProductImage,
  removeProductImage,
} from '../services/productService'

export default function Menu() {
 const { categories, loading: catLoading, refetch: refetchCategories } = useCategories()
  const { products, loading: prodLoading, refetch } = useProducts()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [saving, setSaving] = useState(false)

  const [productToDelete, setProductToDelete] = useState(null)

  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategoryId === 'all' || p.categoryId === Number(selectedCategoryId)
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [products, selectedCategoryId, searchTerm])

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000)
  }

  const handleAddNew = () => {
    setEditingProduct(null)
    setIsFormOpen(true)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  // Main submit handler — handles 4 cases:
  // 1. Create + no image → just create
  // 2. Create + image → create, then upload (don't fail product if upload fails)
  // 3. Update + new image → update, then upload
  // 4. Update + remove image → update, then delete image
  const handleSubmit = async (formData, imageInfo) => {
    setSaving(true)
    const { file, removeImage } = imageInfo

    try {
      let savedProduct

      // Step 1: Save product fields
      if (editingProduct) {
        const res = await updateProduct(editingProduct.id, formData)
        if (!res.success) {
          showFeedback('error', res.message || 'Update failed')
          setSaving(false)
          return
        }
        savedProduct = res.data
      } else {
        const res = await createProduct(formData)
        if (!res.success) {
          showFeedback('error', res.message || 'Create failed')
          setSaving(false)
          return
        }
        savedProduct = res.data
      }

      // Step 2: Handle image
      if (file) {
        // Upload new image
        try {
          const imgRes = await uploadProductImage(savedProduct.id, file)
          if (imgRes.success) {
            showFeedback(
              'success',
              editingProduct ? 'Product updated with image' : 'Product created with image'
            )
          } else {
            showFeedback(
              'warning',
              `Product saved but image upload failed: ${imgRes.message}. You can retry from the card.`
            )
          }
        } catch (err) {
          showFeedback(
            'warning',
            `Product saved but image upload failed: ${err.response?.data?.message || 'Server error'}. You can retry from the card.`
          )
        }
      } else if (removeImage && editingProduct?.imageUrl) {
        // Remove existing image
        try {
          await removeProductImage(savedProduct.id)
          showFeedback('success', 'Product updated and image removed')
        } catch (err) {
          showFeedback(
            'warning',
            `Product saved but image removal failed: ${err.response?.data?.message || 'Server error'}.`
          )
        }
      } else {
        // No image change
        showFeedback(
          'success',
          editingProduct ? 'Product updated' : 'Product created'
        )
      }

      setIsFormOpen(false)
      refetch()
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Server error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!productToDelete) return
    try {
      const res = await deleteProduct(productToDelete.id)
      if (res.success) {
        showFeedback('success', 'Product deleted')
        refetch()
      } else {
        showFeedback('error', res.message || 'Delete failed')
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Server error')
    } finally {
      setProductToDelete(null)
    }
  }

  const handleToggle = async (product) => {
    try {
      const res = await toggleAvailability(product.id, !product.available)
      if (res.success) {
        refetch()
      } else {
        showFeedback('error', res.message || 'Toggle failed')
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Server error')
    }
  }

  // Quick image upload from card camera icon
  const handleQuickImageUpload = async (product, file) => {
    try {
      const res = await uploadProductImage(product.id, file)
      if (res.success) {
        showFeedback('success', `Image updated for ${product.name}`)
        refetch()
      } else {
        showFeedback('error', res.message || 'Image upload failed')
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Upload failed')
    }
  }

  if (catLoading || prodLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Loading menu...</p>
      </div>
    )
  }

  const feedbackStyle = {
    success: 'bg-green-50 text-green-700 border-green-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
          <p className="text-gray-500 text-sm">
            Manage your restaurant's products and pricing.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Add Product
        </button>
      </div>

      {/* Feedback toast */}
      {feedback.message && (
        <div
          className={`mb-4 px-4 py-2 rounded-lg text-sm border ${
            feedbackStyle[feedback.type] || feedbackStyle.success
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Search + filter */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
              selectedCategoryId === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium ${
                  selectedCategoryId === cat.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={setProductToDelete}
              onToggleAvailability={handleToggle}
              onQuickImageUpload={handleQuickImageUpload}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="md"
      >
        <ProductForm
  initialData={editingProduct}
  categories={categories}
  onCategoryCreated={() => {
    refetchCategories()
    showFeedback('success', 'Category created')
  }}
  onSubmit={handleSubmit}
  onCancel={() => setIsFormOpen(false)}
  loading={saving}
/>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Delete "${productToDelete?.name}"? This cannot be undone.`}
        confirmText="Yes, Delete"
        danger
      />
    </div>
  )
}