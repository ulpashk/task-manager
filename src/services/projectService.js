import axiosInstance from '../api/axiosConfig';

export const fetchProjectsApi = async (params = {}) => {
  const response = await axiosInstance.get('/api/projects/', { params });
  return response.data;
};

export const fetchProjectEpicsApi = async (projectId) => {
  const response = await axiosInstance.get(`/api/projects/${projectId}/epics/`);
  return response.data;
};

export const fetchProjectByIdApi = async (projectId) => {
  const response = await axiosInstance.get(`/api/projects/${projectId}/`);
  return response.data;
};