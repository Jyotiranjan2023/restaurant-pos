import api from './api';

export const fetchIngredients = async () => {
  const res = await api.get('/api/ingredients');
  return res.data.data;
};

export const fetchLowStockIngredients = async () => {
  const res = await api.get('/api/ingredients/low-stock');
  return res.data.data;
};

export const fetchUsageLogs = async () => {
  const res = await api.get('/api/inventory/usage-logs');
  return res.data.data;
};

export const fetchTodayUsageLogs = async () => {
  const res = await api.get('/api/inventory/usage-logs/today');
  return res.data.data;
};

export const createIngredient = async (payload) => {
  const res = await api.post('/api/ingredients', payload);
  return res.data.data;
};

export const updateIngredient = async (id, payload) => {
  const res = await api.put(`/api/ingredients/${id}`, payload);
  return res.data.data;
};

export const deleteIngredient = async (id) => {
  const res = await api.delete(`/api/ingredients/${id}`);
  return res.data;
};

export const restockIngredient = async (id, payload) => {
  // payload: { quantity, notes }
  const res = await api.post(`/api/ingredients/${id}/restock`, payload);
  return res.data.data;
};