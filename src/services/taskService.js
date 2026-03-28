import axiosInstance from '../api/axiosConfig';

export const fetchTasksApi = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/api/tasks/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Error fetching tasks';
  }
};

export const fetchTasksListApi = async () => {
  const response = await axiosInstance.get('/api/tasks/?page_size=100');
  return response.data.results;
};

export const fetchProjectsListApi = async () => {
  const response = await axiosInstance.get('/api/projects/?page_size=100');
  return response.data.results;
};

export const fetchEpicsListApi = async () => {
  const res = await axiosInstance.get('/api/epics/?page_size=100');
  return res.data.results;
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

export const createProjectApi = async (taskData) => {
  try {
    const response = await axiosInstance.post('/api/projects/', taskData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createEpicApi = async (taskData) => {
  try {
    const response = await axiosInstance.post('/api/epics/', taskData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};