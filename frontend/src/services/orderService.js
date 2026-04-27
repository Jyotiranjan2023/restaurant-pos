import api from './api'

export const createOrder = async (orderData) => {
  const response = await api.post('/api/orders', orderData)
  return response.data
}

export const fetchRunningOrders = async () => {
  const response = await api.get('/api/orders/running')
  return response.data
}

export const addItemsToOrder = async (orderId, items) => {
  const response = await api.post(`/api/orders/${orderId}/add-items`, { items })
  return response.data
}