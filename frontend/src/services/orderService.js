import api from './api'

export const createOrder = async (orderData) => {
  const response = await api.post('/api/orders', orderData)
  return response.data
}

export const fetchRunningOrders = async () => {
  const response = await api.get('/api/orders/running')
  return response.data
}

export const fetchOrderById = async (orderId) => {
  const response = await api.get(`/api/orders/${orderId}`)
  return response.data
}
export const addItemsToOrder = async (orderId, items) => {
  const response = await api.post(`/api/orders/${orderId}/items`, { items })
  return response.data
}

export const cancelOrderItem = async (orderId, itemId) => {
  const response = await api.patch(
    `/api/orders/${orderId}/items/${itemId}/cancel`
  )
  return response.data
}
export const cancelOrder = async (orderId) => {
  const response = await api.patch(`/api/orders/${orderId}/cancel`)
  return response.data
}