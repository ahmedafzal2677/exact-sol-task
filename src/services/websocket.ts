
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws';

type WebSocketCallback = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private taskUpdateCallbacks: WebSocketCallback[] = [];
  private taskCreateCallbacks: WebSocketCallback[] = [];
  private taskDeleteCallbacks: WebSocketCallback[] = [];

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'TASK_UPDATE':
        this.taskUpdateCallbacks.forEach(callback => callback(data.task));
        break;
      case 'TASK_CREATE':
        this.taskCreateCallbacks.forEach(callback => callback(data.task));
        break;
      case 'TASK_DELETE':
        this.taskDeleteCallbacks.forEach(callback => callback(data.taskId));
        break;
    }
  }

  subscribeToTaskUpdates(callback: WebSocketCallback) {
    this.taskUpdateCallbacks.push(callback);
    return () => {
      this.taskUpdateCallbacks = this.taskUpdateCallbacks.filter(cb => cb !== callback);
    };
  }

  subscribeToTaskCreation(callback: WebSocketCallback) {
    this.taskCreateCallbacks.push(callback);
    return () => {
      this.taskCreateCallbacks = this.taskCreateCallbacks.filter(cb => cb !== callback);
    };
  }

  subscribeToTaskDeletion(callback: WebSocketCallback) {
    this.taskDeleteCallbacks.push(callback);
    return () => {
      this.taskDeleteCallbacks = this.taskDeleteCallbacks.filter(cb => cb !== callback);
    };
  }
}

export const websocketService = new WebSocketService(); 