import axiosInstance from '../api/axiosConfig';

export const fetchClientsApi = async (params = {}) => {
  const response = await axiosInstance.get('/api/clients/', { params });
  return response.data;
};

export const fetchClientByIdApi = async (id) => {
  const response = await axiosInstance.get(`/api/clients/${id}/`);
  return response.data;
};