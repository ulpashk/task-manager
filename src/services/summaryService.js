import axiosInstance from '../api/axiosConfig';

export const summaryService = {
  // 1. Получить последние сводки (Daily/Weekly)
  getLatest: async () => {
    const res = await axiosInstance.get('/api/summaries/latest/');
    return res.data;
  },

  // 2. Генерация новой ИИ сводки (On-demand)
  generateAI: async (startDate, endDate) => {
    const res = await axiosInstance.post('/api/summaries/generate/', {
      period_start: startDate,
      period_end: endDate
    });
    return res.data;
  },

  // 3. Получить агрегированную статистику (Цифры для грида)
  getStats: async (dateFrom, dateTo, clientId = null) => {
    const params = { date_from: dateFrom, date_to: dateTo };
    if (clientId) params.client_id = clientId;
    const res = await axiosInstance.get('/api/reports/summary/', { params });
    return res.data;
  },

  // 4. Список всех сводок (История)
  list: async (page = 1, periodType = '') => {
    const params = { page, page_size: 10 };
    if (periodType) params.period_type = periodType;
    const res = await axiosInstance.get('/api/summaries/', { params });
    return res.data;
  },

  // 5. Экспорт файлов
  exportFile: async (type, dateFrom, dateTo) => {
    const params = { date_from: dateFrom, date_to: dateTo };
    const res = await axiosInstance.get(`/api/reports/export/${type}/`, { 
      params, 
      responseType: 'blob' 
    });
    return res.data;
  }
};