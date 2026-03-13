import axiosInstance from '../api/axiosConfig';

export const fetchTagsApi = async (params = {}) => {
  const response = await axiosInstance.get('/api/tags/', { params });
  return response.data;
};