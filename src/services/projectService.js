import axiosInstance from '../api/axiosConfig';

export const fetchProjectsApi = async (params = {}) => {
  const response = await axiosInstance.get('/api/projects/', { params });
  return response.data;
};