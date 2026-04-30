import api from './api'

export const generateBill = async (orderId) => {
  const response = await api.post(`/api/bills/generate/${orderId}`)
  return response.data
}

export const fetchBillById = async (billId) => {
  const response = await api.get(`/api/bills/${billId}`)
  return response.data
}

export const fetchBillByOrderId = async (orderId) => {
  const response = await api.get(`/api/bills/order/${orderId}`)
  return response.data
}

export const addPayment = async (billId, payment) => {
  const response = await api.post(`/api/bills/${billId}/payments`, payment)
  return response.data
}

export const settleBill = async (billId) => {
  const response = await api.post(`/api/bills/${billId}/settle`)
  return response.data
}

export const fetchBillPrintHtml = async (billId) => {
  const response = await api.get(`/api/bills/${billId}/print-html`, {
    responseType: 'text',
  })
  return response.data
}

export const applyCoupon = async (billId, couponCode) => {
  const response = await api.post(`/api/bills/${billId}/apply-coupon`, { code: couponCode })
  return response.data
}

export const applyDiscount = async (billId, discountType, discountValue) => {
  const response = await api.patch(`/api/bills/${billId}/discount`, {
    discountType,
    discountValue: Number(discountValue),
  })
  return response.data
}

export const cancelBill = async (billId, reason) => {
  const response = await api.patch(`/api/bills/${billId}/cancel`, { reason })
  return response.data
}

export const fetchAllBills = async (page = 0, size = 20) => {
  const response = await api.get(`/api/bills?page=${page}&size=${size}`)
  return response.data
}