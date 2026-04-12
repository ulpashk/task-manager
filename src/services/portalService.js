import axiosInstance from '../api/axiosConfig';

export const portalService = {
  listTickets: async (page = 1) => {
    const res = await axiosInstance.get('/api/portal/tickets/', { params: { page } });
    return res.data;
  },

  getTicket: async (id) => {
    const res = await axiosInstance.get(`/api/portal/tickets/${id}/`);
    return res.data;
  }
};
