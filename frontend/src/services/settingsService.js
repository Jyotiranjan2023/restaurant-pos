import api from './api'

export const fetchSettings = async () => {
  const response = await api.get('/api/settings')
  return response.data
}

export const updateProfile = async (data) => {
  const response = await api.put('/api/settings/profile', data)
  return response.data
}

export const updateTax = async (data) => {
  const response = await api.put('/api/settings/tax', data)
  return response.data
}

export const updateBill = async (data) => {
  const response = await api.put('/api/settings/bill', data)
  return response.data
}

export const updateOrder = async (data) => {
  const response = await api.put('/api/settings/order', data)
  return response.data
}

export const uploadLogo = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/api/settings/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const removeLogo = async () => {
  const response = await api.delete('/api/settings/logo')
  return response.data
}