import axiosInstance from '../api/axiosConfig';

export const fetchTasksApi = async () => {
  try {
    const response = await axiosInstance.get('/api/tasks/');
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