import axiosInstance from '../api/axiosConfig';

export const fetchClientsApi = async (params = {}) => {
  const response = await axiosInstance.get('/api/clients/', { params });
  return response.data;
};

export const fetchClientByIdApi = async (id) => {
  const response = await axiosInstance.get(`/api/clients/${id}/`);
  return response.data;
};

export const createClientApi = async (clientData) => {
  const response = await axiosInstance.post('/api/clients/', clientData);
  return response.data;
};

export const updateClientApi = async (id, data) => {
  const response = await axiosInstance.patch(`/api/clients/${id}/`, data);
  return response.data;
};