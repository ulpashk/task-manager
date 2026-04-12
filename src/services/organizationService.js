import axiosInstance from '../api/axiosConfig';

export const fetchOrganizationsApi = async (params = {}) => {
  const response = await axiosInstance.get('/api/platform/organizations/', { params });
  return response.data;
};

export const fetchOrganizationByIdApi = async (id) => {
  const response = await axiosInstance.get(`/api/platform/organizations/${id}/`);
  return response.data;
};

export const createOrganizationApi = async (data) => {
  const response = await axiosInstance.post('/api/platform/organizations/', data);
  return response.data;
};

export const updateOrganizationApi = async (id, data) => {
  const response = await axiosInstance.patch(`/api/platform/organizations/${id}/`, data);
  return response.data;
};

export const fetchOrgManagersApi = async (id, params = {}) => {
  const response = await axiosInstance.get(`/api/platform/organizations/${id}/managers/`, { params });
  return response.data;
};

export const createOrgManagerApi = async (id, data) => {
  const response = await axiosInstance.post(`/api/platform/organizations/${id}/managers/`, data);
  return response.data;
};