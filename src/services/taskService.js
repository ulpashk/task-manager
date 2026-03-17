import axiosInstance from '../api/axiosConfig';

export const fetchTasksApi = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/api/tasks/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Error fetching tasks';
  }
};

export const fetchTasksByDateRange = async (start, end) => {
  const deadline_from = start.toISOString();
  const deadline_to = end.toISOString();
  
  const response = await axiosInstance.get(`/api/tasks/`, {
    params: {
      deadline_from,
      deadline_to,
      page_size: 100
    }
  });
  return response.data;
};

export const createTaskApi = async (taskData) => {
  try {
    const response = await axiosInstance.post('/api/tasks/', taskData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};