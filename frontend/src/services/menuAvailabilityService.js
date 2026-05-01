import api from './api'

export const fetchAllProducts = async () => {
  const response = await api.get('/api/products')
  return response.data
}

export const updateAvailability = async (productId, available) => {
  const response = await api.patch(`/api/products/${productId}/availability`, { available })
  return response.data
}