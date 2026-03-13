import axiosInstance from '../api/axiosConfig';
import { formatISO } from 'date-fns';

export const fetchTasksApi = async () => {
  try {
    const response = await axiosInstance.get('/api/tasks/');
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Error fetching tasks';
  }
};

export const fetchTasksByDateRange = async (start, end) => {
  // .toISOString() produces: 2026-02-22T19:00:00.000Z
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