import api from './api'

export const fetchTables = async () => {
  const response = await api.get('/api/tables')
  return response.data
}

export const createTable = async (data) => {
  const response = await api.post('/api/tables', data)
  return response.data
}

export const updateTable = async (id, data) => {
  const response = await api.put(`/api/tables/${id}`, data)
  return response.data
}

export const updateTableStatus = async (tableId, status) => {
  const response = await api.patch(`/api/tables/${tableId}/status`, { status })
  return response.data
}

export const deleteTable = async (id) => {
  const response = await api.delete(`/api/tables/${id}`)
  return response.data
}