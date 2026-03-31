import axiosInstance from '../api/axiosConfig';

export const notificationService = {
  // Получить список уведомлений
  list: async (isRead, page = 1) => {
    const params = { page };
    if (isRead !== undefined) params.is_read = isRead;
    const res = await axiosInstance.get('/api/notifications/', { params });
    return res.data;
  },

  // Отметить как прочитанное
  markAsRead: async (id) => {
    const res = await axiosInstance.patch(`/api/notifications/${id}/read/`, {});
    return res.data;
  },

  // Отметить все как прочитанные
  markAllAsRead: async () => {
    const res = await axiosInstance.post('/api/notifications/read-all/', {});
    return res.data;
  }
};