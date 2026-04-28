import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
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
import { createOrder, addItemsToOrder, fetchOrderById } from '../services/orderService'
import { validateOrder } from '../utils/orderValidation'

const EMPTY_CUSTOMER = { name: '', phone: '', address: '' }

export default function POS() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Add mode detection
  const addToOrderId = searchParams.get('addToOrder')
  const isAddMode = !!addToOrderId

  // Existing order data (only loaded in add mode)
  const [existingOrder, setExistingOrder] = useState(null)
  const [loadingExisting, setLoadingExisting] = useState(false)
  const [existingOrderError, setExistingOrderError] = useState('')

  // Form state (used only in new-order mode)
  const [orderType, setOrderType] = useState('DINE_IN')
  const [tableId, setTableId] = useState(null)
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER)
  const [showCustomerFormForDineIn, setShowCustomerFormForDineIn] = useState(false)
  const [customerErrors, setCustomerErrors] = useState({})

  // Common state
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const { categories, loading: catLoading } = useCategories()
  const { products, loading: prodLoading } = useProducts()
  const { refetch: refetchTables } = useTables()
  const cart = useCart()

  // Load existing order when in add mode
  useEffect(() => {
    if (!isAddMode) return

    const loadOrder = async () => {
      setLoadingExisting(true)
      setExistingOrderError('')
      try {
        const res = await fetchOrderById(addToOrderId)
        if (res.success) {
          setExistingOrder(res.data)
        } else {
          setExistingOrderError(res.message || 'Failed to load order')
        }
      } catch (err) {
        setExistingOrderError(err.response?.data?.message || 'Server error')
      } finally {
        setLoadingExisting(false)
      }
    }

    loadOrder()
  }, [isAddMode, addToOrderId])

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

  const resetForNextOrder = () => {
    cart.clearCart()
    setTableId(null)
    setCustomer(EMPTY_CUSTOMER)
    setCustomerErrors({})
    setSearchTerm('')
    setSelectedCategoryId('all')
    setShowCustomerFormForDineIn(false)
  }

  // Two save paths — branch based on mode
  const handleSaveOrder = async () => {
    if (cart.items.length === 0) {
      showFeedback('error', 'Cart is empty. Add items first.')
      return
    }

    if (isAddMode) {
      await handleAddToExistingOrder()
    } else {
      await handleCreateNewOrder()
    }
  }

  const handleAddToExistingOrder = async () => {
    const items = cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      variantId: null,
      addonIds: [],
      notes: null,
      isCustom: false,
    }))

    setSaving(true)
    try {
      const res = await addItemsToOrder(addToOrderId, items)
      if (res.success) {
        showFeedback('success', `Items added to ${existingOrder.orderNumber}`)
        cart.clearCart()
        // Redirect back to detail page after short delay so user sees toast
        setTimeout(() => {
          navigate(`/orders/${addToOrderId}`)
        }, 1000)
      } else {
        showFeedback('error', res.message || 'Failed to add items')
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Server error')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateNewOrder = async () => {
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

  // Loading existing order in add mode
  if (isAddMode && loadingExisting) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Loading order...</p>
      </div>
    )
  }

  // Error loading existing order in add mode
  if (isAddMode && existingOrderError) {
    return (
      <div>
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium mb-3"
        >
          ← Back to Running Orders
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-700 font-medium">
            Failed to load order: {existingOrderError}
          </p>
        </div>
      </div>
    )
  }

  // Loading menu data
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
    !isAddMode && (
      orderType === 'TAKEAWAY' ||
      orderType === 'DELIVERY' ||
      (orderType === 'DINE_IN' && showCustomerFormForDineIn)
    )

  return (
    <div className="space-y-4">
      {/* Header — different for new vs add mode */}
      {isAddMode ? (
        <div>
          <button
            type="button"
            onClick={() => navigate(`/orders/${addToOrderId}`)}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium mb-2"
          >
            ← Cancel and back to order
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Add Items to Order</h1>
          <p className="text-gray-500 text-sm">
            Items selected here will be added to existing order.
          </p>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Take Order</h1>
          <p className="text-gray-500 text-sm">
            Create a new order for dine-in, takeaway, or delivery.
          </p>
        </div>
      )}

      {/* Add mode banner showing existing order info */}
      {isAddMode && existingOrder && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm font-bold text-blue-900">
                {existingOrder.orderNumber}
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                {existingOrder.orderType === 'DINE_IN'
                  ? `Table ${existingOrder.tableNumber || '#' + existingOrder.tableId}`
                  : existingOrder.customerName || 'Walk-in'}
                {' · '}
                {existingOrder.items.length} existing items
              </p>
            </div>
            <span className="text-xs text-blue-700 font-medium">
              Current Total: ₹{Number(existingOrder.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Feedback toast */}
      {feedback.message && (
        <div
          className={`px-4 py-2 rounded-lg text-sm border ${feedbackStyle[feedback.type]}`}
        >
          {feedback.message}
        </div>
      )}

      {/* Order Type — hidden in add mode */}
      {!isAddMode && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Order Type
          </label>
          <OrderTypeSelector value={orderType} onChange={handleOrderTypeChange} />
        </div>
      )}

      {/* Table Picker — hidden in add mode */}
      {!isAddMode && orderType === 'DINE_IN' && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Select Table
          </label>
          <TablePicker selectedTableId={tableId} onSelect={setTableId} />
        </div>
      )}

      {/* Customer Form — hidden in add mode */}
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

      {/* Add Customer Details optional link — hidden in add mode */}
      {!isAddMode && orderType === 'DINE_IN' && !showCustomerFormForDineIn && (
        <button
          type="button"
          onClick={() => setShowCustomerFormForDineIn(true)}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          + Add Customer Details (optional)
        </button>
      )}

      {/* MENU + CART */}
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
            isAddMode={isAddMode}
          />
        </div>
      </div>
    </div>
  )
}