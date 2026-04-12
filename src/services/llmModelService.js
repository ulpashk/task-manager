import axiosInstance from '../api/axiosConfig';

export const llmModelService = {
  list: async () => {
    const res = await axiosInstance.get('/api/llm-models/');
    return res.data;
  },

  getOrgDefault: async () => {
    const res = await axiosInstance.get('/api/llm-models/org-default/');
    return res.data;
  },

  setOrgDefault: async (modelId) => {
    const res = await axiosInstance.patch('/api/llm-models/org-default/', {
      default_llm_model_id: modelId
    });
    return res.data;
  }
};
