import axiosInstance from '../api/axiosConfig';

export const profileService = {
  getProfile: async () => {
    const res = await axiosInstance.get('/api/users/me/');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await axiosInstance.patch('/api/users/me/', data);
    return res.data;
  }
};