import api from './api'

export const fetchAllCoupons = async () => {
  const response = await api.get('/api/coupons')
  return response.data
}

export const createCoupon = async (data) => {
  const response = await api.post('/api/coupons', data)
  return response.data
}

export const updateCoupon = async (id, data) => {
  const response = await api.put(`/api/coupons/${id}`, data)
  return response.data
}

export const updateCouponStatus = async (id, active) => {
  const response = await api.patch(`/api/coupons/${id}/status`, { active })
  return response.data
}

export const deleteCoupon = async (id) => {
  const response = await api.delete(`/api/coupons/${id}`)
  return response.data
}