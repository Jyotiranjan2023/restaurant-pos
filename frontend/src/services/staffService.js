import api from './api'

export const fetchAllStaff = async () => {
  const response = await api.get('/api/admin/staff')
  return response.data
}

export const createStaff = async (data) => {
  const response = await api.post('/api/admin/staff', data)
  return response.data
}

export const updateStaffRole = async (id, role) => {
  const response = await api.patch(`/api/admin/staff/${id}/role`, { role })
  return response.data
}

export const updateStaffStatus = async (id, active) => {
  const response = await api.patch(`/api/admin/staff/${id}/status`, { active })
  return response.data
}

export const resetStaffPassword = async (id, newPassword) => {
  const response = await api.patch(`/api/admin/staff/${id}/password`, { newPassword })
  return response.data
}

export const deleteStaff = async (id) => {
  const response = await api.delete(`/api/admin/staff/${id}`)
  return response.data
}