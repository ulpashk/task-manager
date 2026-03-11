import axiosInstance from '../api/axiosConfig';

export const fetchOrganizationsApi = async () => {
  const response = await axiosInstance.get('/api/platform/organizations/');
  return response.data;
};