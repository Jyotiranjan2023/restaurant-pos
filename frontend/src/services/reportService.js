import api from './api'

const formatDate = (date) => date.toISOString().split('T')[0]

export const fetchSalesReport = async (from, to) => {
  const response = await api.get(`/api/admin/reports/sales?from=${from}&to=${to}`)
  return response.data
}

export const fetchProductReport = async (from, to) => {
  const response = await api.get(`/api/admin/reports/products?from=${from}&to=${to}`)
  return response.data
}

export const fetchStaffReport = async (from, to) => {
  const response = await api.get(`/api/admin/reports/staff?from=${from}&to=${to}`)
  return response.data
}

export const fetchGstReport = async (from, to) => {
  const response = await api.get(`/api/admin/reports/gst?from=${from}&to=${to}`)
  return response.data
}

export const fetchPaymentMethodReport = async (from, to) => {
  const response = await api.get(`/api/admin/reports/payment-methods?from=${from}&to=${to}`)
  return response.data
}

export { formatDate }