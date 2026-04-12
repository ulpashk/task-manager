import axiosInstance from '../api/axiosConfig';

class GenerationWsService {
  constructor() {
    this.socket = null;
    this.listeners = new Set();
    this.token = null;
  }

  connect(token) {
    this.token = token;
    if (this.socket) return;

    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    const wsUrl = `${proto}://${host}/ws/generation/?token=${token}`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.listeners.forEach(cb => cb(data));
    };

    this.socket.onclose = () => {
      this.socket = null;
    };

    this.socket.onerror = () => {
      this.socket = null;
    };
  }

  subscribe(generationType, generationId, callback) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'subscribe',
        generation_type: generationType,
        generation_id: generationId
      }));
    }
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
  }
}

export const generationWsService = new GenerationWsService();

// HTTP polling fallback
export const pollEpicGenerationStatus = async (epicId, taskId) => {
  const res = await axiosInstance.get(`/api/epics/${epicId}/generate-tasks/status/`, {
    params: { task_id: taskId }
  });
  return res.data;
};

export const pollSummaryGenerationStatus = async (summaryId) => {
  const res = await axiosInstance.get(`/api/summaries/${summaryId}/generation-status/`);
  return res.data;
};
