import api from './api'

export const loginUser = async (tenantId, username, password) => {
  const response = await api.post('/api/auth/login', {
    tenantId: Number(tenantId),
    username,
    password,
  })
  return response.data
}