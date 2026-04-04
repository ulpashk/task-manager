import axiosInstance from '../api/axiosConfig';

export const fetchUsersApi = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/api/users/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Error fetching users';
  }
};

export const fetchUsersListApi = async (params = {}) => {
  const response = await axiosInstance.get('/api/users/', { params });
  return response.data.results;
};

export const createUserApi = async (data) => {
  const response = await axiosInstance.post('/api/users/', data);
  return response.data;
};

export const updateUserApi = async (id, data) => {
  const response = await axiosInstance.patch(`/api/users/${id}/`, data);
  return response.data;
};

export const deleteUserApi = async (id) => {
  await axiosInstance.delete(`/api/users/${id}/`);
};