import { createContext, useState, useContext, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { wsService } from '../services/websocketService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Загрузка начальных данных
  // const refreshNotifications = async () => {
  //   if (!token) return;
  //   try {
  //     const data = await notificationService.list(false);
  //     setUnreadCount(data.count);
  //     setNotifications(data.results);
  //   } catch (err) { console.error(err); }
  // };

  const refreshNotifications = async () => {
    if (!token) return;
    try {
      const data = await notificationService.list(undefined, 1); 
      setUnreadCount(data.results.filter(n => !n.is_read).length);
      setNotifications(data.results.slice(0, 20));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (token) {
      refreshNotifications();
      wsService.connect(token);
      
      const unsubscribe = wsService.subscribe((msg) => {
        if (msg.type === 'new_notification' || msg.type === 'task_created') {
          refreshNotifications();
        }
      });

      return () => {
        unsubscribe();
        wsService.disconnect();
      };
    }
  }, [token]);

  return (
    <NotificationContext.Provider value={{ unreadCount, notifications, refreshNotifications, setUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};