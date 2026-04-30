import api from './api';

export const fetchCustomers = async (page = 0, size = 20) => {
  const res = await api.get(`/api/customers?page=${page}&size=${size}&sortBy=createdAt&direction=desc`);
  return res.data.data;
};

export const searchCustomers = async (query) => {
  const res = await api.get(`/api/customers/search?query=${encodeURIComponent(query)}`);
  return res.data.data;
};

export const fetchTopSpenders = async () => {
  const res = await api.get('/api/customers/top-spenders');
  return res.data.data;
};

export const fetchCustomerById = async (id) => {
  const res = await api.get(`/api/customers/${id}`);
  return res.data.data;
};

export const fetchCustomerOrders = async (id) => {
  const res = await api.get(`/api/customers/${id}/orders`);
  return res.data.data;
};

export const createCustomer = async (payload) => {
  const res = await api.post('/api/customers', payload);
  return res.data.data;
};

export const updateCustomer = async (id, payload) => {
  const res = await api.put(`/api/customers/${id}`, payload);
  return res.data.data;
};

export const deleteCustomer = async (id) => {
  const res = await api.delete(`/api/customers/${id}`);
  return res.data;
};