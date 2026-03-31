class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Set();
  }

  connect(token) {
    if (this.socket) return;

    const wsUrl = `wss://taskmanager.w0nsdoof.com/ws/kanban/?token=${token}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Уведомляем всех подписчиков (Context)
      this.listeners.forEach(callback => callback(data));
    };

    this.socket.onclose = () => {
      this.socket = null;
      // Реконнект через 3 секунды
      setTimeout(() => this.connect(token), 3000);
    };
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const wsService = new WebSocketService();