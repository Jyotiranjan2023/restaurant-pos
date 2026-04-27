import api from './api'

export const fetchProducts = async () => {
  const response = await api.get('/api/products')
  return response.data
}

export const fetchProductById = async (id) => {
  const response = await api.get(`/api/products/${id}`)
  return response.data
}

export const createProduct = async (data) => {
  const response = await api.post('/api/products', data)
  return response.data
}

export const updateProduct = async (id, data) => {
  const response = await api.put(`/api/products/${id}`, data)
  return response.data
}

export const deleteProduct = async (id) => {
  const response = await api.delete(`/api/products/${id}`)
  return response.data
}

export const toggleAvailability = async (id, available) => {
  const response = await api.patch(`/api/products/${id}/availability`, {
    isAvailable: available,   // backend expects this name in request body
  })
  return response.data
}
export const uploadProductImage = async (productId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  // Don't set Content-Type — axios sets multipart boundary automatically
  const response = await api.post(`/api/products/${productId}/image`, formData)
  return response.data
}

export const removeProductImage = async (productId) => {
  const response = await api.delete(`/api/products/${productId}/image`)
  return response.data
}