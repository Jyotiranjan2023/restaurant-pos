import api from './api'

export const fetchTables = async () => {
  const response = await api.get('/api/tables')
  return response.data
}

export const updateTableStatus = async (tableId, status) => {
  const response = await api.patch(`/api/tables/${tableId}/status`, { status })
  return response.data
}