import { useState, useMemo } from 'react'
import OrderTypeSelector from '../components/pos/OrderTypeSelector'
import TablePicker from '../components/pos/TablePicker'
import CategorySidebar from '../components/pos/CategorySidebar'
import ProductGrid from '../components/pos/ProductGrid'
import CartPanel from '../components/pos/CartPanel'
import CustomerForm from '../components/pos/CustomerForm'
import useCategories from '../hooks/useCategories'
import useProducts from '../hooks/useProducts'
import useTables from '../hooks/useTables'
import useCart from '../hooks/useCart'
import { createOrder } from '../services/orderService'
import { validateOrder } from '../utils/orderValidation'

const EMPTY_CUSTOMER = { name: '', phone: '', address: '' }

export default function POS() {
  const [orderType, setOrderType] = useState('DINE_IN')
  const [tableId, setTableId] = useState(null)
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER)
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCustomerFormForDineIn, setShowCustomerFormForDineIn] = useState(false)

  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [customerErrors, setCustomerErrors] = useState({})

  const { categories, loading: catLoading } = useCategories()
  const { products, loading: prodLoading } = useProducts()
  const { refetch: refetchTables } = useTables()
  const cart = useCart()

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000)
  }

  const handleOrderTypeChange = (newType) => {
    setOrderType(newType)
    if (newType !== 'DINE_IN') {
      setTableId(null)
    }
    setCustomerErrors({})
    setShowCustomerFormForDineIn(false)
  }

  const handleCustomerChange = (newCustomer) => {
    setCustomer(newCustomer)
    if (Object.keys(customerErrors).length > 0) {
      setCustomerErrors({})
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategoryId === 'all' || p.categoryId === selectedCategoryId
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [products, selectedCategoryId, searchTerm])

  // Reset everything except orderType (keeps user's last choice)
  const resetForNextOrder = () => {
    cart.clearCart()
    setTableId(null)
    setCustomer(EMPTY_CUSTOMER)
    setCustomerErrors({})
    setSearchTerm('')
    setSelectedCategoryId('all')
    setShowCustomerFormForDineIn(false)
  }

  const handleSaveOrder = async () => {
    const validation = validateOrder({
      orderType,
      tableId,
      items: cart.items,
      customer,
    })

    if (!validation.valid) {
      showFeedback('error', validation.error)
      if (validation.customerErrors) {
        setCustomerErrors(validation.customerErrors)
      }
      return
    }

    const payload = {
      orderType,
      tableId: orderType === 'DINE_IN' ? tableId : null,
      customerName: customer.name?.trim() || null,
      customerPhone: customer.phone?.trim() || null,
      customerAddress: orderType === 'DELIVERY' ? customer.address?.trim() : null,
      items: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        variantId: null,
        addonIds: [],
        notes: null,
        isCustom: false,
      })),
    }

    setSaving(true)
    try {
      const res = await createOrder(payload)
      if (res.success) {
        showFeedback('success', `Order ${res.data.orderNumber} created`)
        resetForNextOrder()
        refetchTables()
      } else {
        showFeedback('error', res.message || 'Failed to save order')
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Server error')
    } finally {
      setSaving(false)
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
  }

  const showCustomerForm =
    orderType === 'TAKEAWAY' ||
    orderType === 'DELIVERY' ||
    (orderType === 'DINE_IN' && showCustomerFormForDineIn)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Take Order</h1>
        <p className="text-gray-500 text-sm">
          Create a new order for dine-in, takeaway, or delivery.
        </p>
      </div>

      {/* Feedback toast */}
      {feedback.message && (
        <div
          className={`px-4 py-2 rounded-lg text-sm border ${feedbackStyle[feedback.type]}`}
        >
          {feedback.message}
        </div>
      )}

      {/* Order Type */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <label className="block text-sm font-semibold text-gray-800 mb-3">
          Order Type
        </label>
        <OrderTypeSelector value={orderType} onChange={handleOrderTypeChange} />
      </div>

      {/* Table Picker */}
      {orderType === 'DINE_IN' && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Select Table
          </label>
          <TablePicker
            selectedTableId={tableId}
            onSelect={setTableId}
          />
        </div>
      )}

      {/* Customer Form */}
      {showCustomerForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Customer Details
          </label>
          <CustomerForm
            orderType={orderType}
            customer={customer}
            onChange={handleCustomerChange}
            errors={customerErrors}
          />
        </div>
      )}

      {/* Optional: show "Add Customer" button for DINE_IN */}
      {orderType === 'DINE_IN' && !showCustomerFormForDineIn && (
        <button
          type="button"
          onClick={() => setShowCustomerFormForDineIn(true)}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          + Add Customer Details (optional)
        </button>
      )}

      {/* MENU + CART — 3-column layout */}
      <div className="grid grid-cols-12 gap-3" style={{ minHeight: '500px' }}>
        <div className="col-span-2">
          <CategorySidebar
            categories={categories}
            products={products}
            selectedCategoryId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />
        </div>

        <div className="col-span-7">
          <div className="bg-white border border-gray-200 rounded-xl p-2 mb-2">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <ProductGrid products={filteredProducts} onAdd={cart.addItem} />
        </div>

        <div className="col-span-3">
          <CartPanel
            items={cart.items}
            orderType={orderType}
            tableId={tableId}
            onIncrement={cart.updateQuantity}
            onDecrement={cart.updateQuantity}
            onRemove={cart.removeItem}
            onClear={cart.clearCart}
            onSaveOrder={handleSaveOrder}
            saving={saving}
          />
        </div>
      </div>
    </div>
  )
}