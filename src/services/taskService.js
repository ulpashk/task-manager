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

export const fetchProjectEpicsApi = async (projectId) => {
  const response = await axiosInstance.get(`/api/projects/${projectId}/epics/`);
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

export const fetchTaskByIdApi = async (id) => {
  const response = await axiosInstance.get(`/api/tasks/${id}/`);
  return response.data;
};

export const fetchTaskAttachmentsApi = async (taskId) => {
  const response = await axiosInstance.get(`/api/tasks/${taskId}/attachments/`);
  return response.data.results;
};

export const fetchTaskCommentsApi = async (taskId) => {
  const response = await axiosInstance.get(`/api/tasks/${taskId}/comments/`);
  return response.data.results;
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

export const addTaskCommentApi = async (taskId, content) => {
  const response = await axiosInstance.post(`/api/tasks/${taskId}/comments/`, {
    content,
    is_public: true
  });
  return response.data;
};

export const uploadAttachmentApi = async (taskId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post(`/api/tasks/${taskId}/attachments/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteAttachmentApi = async (taskId, attachmentId) => {
  await axiosInstance.delete(`/api/tasks/${taskId}/attachments/${attachmentId}/`);
};

export const downloadAttachmentApi = async (taskId, attachmentId) => {
  const response = await axiosInstance.get(`/api/tasks/${taskId}/attachments/${attachmentId}/`, {
    responseType: 'blob', // Важно для работы с бинарными данными (файлами)
  });
  return response.data;
};

export const deleteTaskApi = async (taskId) => {
  await axiosInstance.delete(`/api/tasks/${taskId}/`);
};

export const updateTaskApi = async (id, data) => {
  const response = await axiosInstance.patch(`/api/tasks/${id}/`, data);
  return response.data;
};