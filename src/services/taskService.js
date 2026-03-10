import axiosInstance from '../api/axiosConfig';

export const fetchTasksApi = async () => {
  try {
    const response = await axiosInstance.get('/api/tasks/');
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Error fetching tasks';
  }
};