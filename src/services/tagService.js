import axiosInstance from '../api/axiosConfig';

export const fetchTagsApi = async (params = {}) => {
  const response = await axiosInstance.get('/api/tags/', { params });
  return response.data;
};

export const fetchTagsListApi = async () => {
  const res = await axiosInstance.get('/api/tags/?page_size=100');
  return res.data.results;
};