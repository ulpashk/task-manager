import axiosInstance from '../api/axiosConfig';

export const fetchUsersApi = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/api/users/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Error fetching users';
  }
};

// export const fetchUsersListApi = async () => {
//   const response = await axiosInstance.get('/api/users/?page_size=100');
//   return response.data.results;
// };
export const fetchUsersListApi = async (params = {}) => {
  const response = await axiosInstance.get('/api/users/', { params });
  return response.data.results;
};