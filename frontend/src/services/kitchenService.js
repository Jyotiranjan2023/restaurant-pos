import api from './api'

export const fetchKitchenItems = async () => {
  const response = await api.get('/api/kitchen/items')
  return response.data
}

export const fetchReadyItems = async () => {
  const response = await api.get('/api/kitchen/items/ready')
  return response.data
}

export const updateItemStatus = async (itemId, status) => {
  const response = await api.patch(`/api/kitchen/items/${itemId}/status`, { status })
  return response.data
}