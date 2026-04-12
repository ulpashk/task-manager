import axiosInstance from '../api/axiosConfig';

export const profileService = {
  getProfile: async () => {
    const res = await axiosInstance.get('/api/users/me/');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await axiosInstance.patch('/api/users/me/', data);
    return res.data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await axiosInstance.patch('/api/users/me/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  removeAvatar: async () => {
    const res = await axiosInstance.patch('/api/users/me/', { avatar: null });
    return res.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const res = await axiosInstance.patch('/api/users/me/', {
      current_password: currentPassword,
      password: newPassword
    });
    return res.data;
  }
};