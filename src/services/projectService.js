import axiosInstance from '../api/axiosConfig';

export const fetchProjectsApi = async (params = {}) => {
  const response = await axiosInstance.get('/api/projects/', { params });
  return response.data;
};

export const fetchProjectEpicsApi = async (projectId, params = {}) => {
  const response = await axiosInstance.get(`/api/projects/${projectId}/epics/`, { params });
  return response.data;
};

export const fetchProjectByIdApi = async (projectId) => {
  const response = await axiosInstance.get(`/api/projects/${projectId}/`);
  return response.data;
};

export const deleteProjectApi = async (projectId) => {
  await axiosInstance.delete(`/api/projects/${projectId}/`);
};

export const updateProjectApi = async (id, data) => {
  const response = await axiosInstance.patch(`/api/projects/${id}/`, data);
  return response.data;
};

export const updateEpicApi = async (id, data) => {
  const response = await axiosInstance.patch(`/api/epics/${id}/`, data);
  return response.data;
};

export const deleteEpicApi = async (id) => {
  await axiosInstance.delete(`/api/epics/${id}/`);
};

export const fetchEpicByIdApi = async (id) => {
  const response = await axiosInstance.get(`/api/epics/${id}/`);
  return response.data;
};

export const generateEpicTasksApi = async (epicId) => {
  const res = await axiosInstance.post(`/api/epics/${epicId}/generate-tasks/`);
  return res.data;
};

export const pollGenerationStatusApi = async (epicId, taskId) => {
  const res = await axiosInstance.get(`/api/epics/${epicId}/generate-tasks/status/`, {
    params: { task_id: taskId }
  });
  return res.data;
};

export const confirmEpicTasksApi = async (epicId, tasks) => {
  const res = await axiosInstance.post(`/api/epics/${epicId}/confirm-tasks/`, { tasks });
  return res.data;
};