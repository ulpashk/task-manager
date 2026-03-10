import axiosInstance from '../api/axiosConfig';

export const loginUserApi = async (email, password) => {
  try {
    const response = await axiosInstance.post('/api/auth/token/', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'An error occurred during login';
  }
};