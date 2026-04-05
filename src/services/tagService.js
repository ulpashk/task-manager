import axiosInstance from '../api/axiosConfig';

export const fetchTagsApi = async (params = {}) => {
  const response = await axiosInstance.get('/api/tags/', { params });
  return response.data;
};

export const fetchTagsListApi = async () => {
  const res = await axiosInstance.get('/api/tags/?page_size=100');
  return res.data.results;
};

export const createTagApi = async (data) => {
  const response = await axiosInstance.post('/api/tags/', data);
  return response.data;
};

export const updateTagApi = async (id, data) => {
  const response = await axiosInstance.patch(`/api/tags/${id}/`, data);
  return response.data;
};

export const deleteTagApi = async (id) => {
  await axiosInstance.delete(`/api/tags/${id}/`);
};