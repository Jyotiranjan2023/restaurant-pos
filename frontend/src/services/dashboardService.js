import api from './api';

export const fetchDashboardSummary = async () => {
  const response = await api.get('/api/admin/dashboard/summary');
  return response.data.data;
};