import axiosInstance from '../api/axiosConfig';

export const telegramService = {
  generateLink: async () => {
    const res = await axiosInstance.post('/api/telegram/link/');
    return res.data;
  },
  getStatus: async () => {
    const res = await axiosInstance.get('/api/telegram/status/');
    return res.data;
  },
  toggleNotifications: async (enabled) => {
    const res = await axiosInstance.patch('/api/telegram/notifications/', { enabled });
    return res.data;
  },
  unlink: async () => {
    await axiosInstance.post('/api/telegram/unlink/');
  }
};