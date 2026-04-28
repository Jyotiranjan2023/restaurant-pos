import { useNavigate } from 'react-router-dom'
import useRunningOrders from '../hooks/useRunningOrders'
import OrderCard from '../components/orders/OrderCard'

export default function RunningOrders() {
  const navigate = useNavigate()
  const { orders, loading, error, refetch } = useRunningOrders()

  const handleOrderClick = (order) => {
    navigate(`/orders/${order.id}`)
  }

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Running Orders</h1>
        <p className="text-gray-500 text-sm">
          {loading
            ? 'Loading...'
            : `${orders.length} active ${orders.length === 1 ? 'order' : 'orders'}`}
        </p>
      </div>
      <button
        type="button"
        onClick={refetch}
        disabled={loading}
        className="text-sm bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium disabled:opacity-60"
      >
        {loading ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>
  )

  if (loading && orders.length === 0) {
    return (
      <div>
        {renderHeader()}
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        {renderHeader()}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-700 font-medium">Failed to load orders</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={refetch}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div>
        {renderHeader()}
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <span className="text-5xl mb-3 inline-block">📋</span>
          <p className="text-gray-700 font-medium">No running orders</p>
          <p className="text-gray-500 text-sm mt-1">
            New orders from POS will appear here automatically.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {renderHeader()}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onClick={handleOrderClick}
          />
        ))}
      </div>
    </div>
  )
}