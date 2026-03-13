import axiosInstance from '../api/axiosConfig';

export const fetchUsersApi = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/api/users/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Error fetching users';
  }
};