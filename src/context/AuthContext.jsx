import { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance, { setAuthToken } from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); 
  const [isInitializing, setIsInitializing] = useState(true);

  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        name: `${payload.first_name} ${payload.last_name}`,
        role: payload.role,
      };
    } catch (e) { return null; }
  };

  const login = (access) => {
    const userInfo = decodeToken(access);
    if (userInfo) {
      setAuthToken(access);
      setToken(access);
      setUser(userInfo);
      // We only store UI info in localStorage, NOT the token
      localStorage.setItem('user_info', JSON.stringify(userInfo));
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout/');
    } catch (e) { /* ignore */ }
    setAuthToken(null);
    setToken(null);
    setUser(null);
    localStorage.removeItem('user_info');
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // We send an empty object. The REFRESH cookie is sent automatically by the browser
        const response = await axiosInstance.post('/api/auth/token/refresh/', {});
        const { access } = response.data;
        login(access);
      } catch (err) {
        console.warn("No active session found via cookies");
        // Don't logout here, just ensure token is null
        setToken(null);
      } finally {
        setIsInitializing(false);
      }
    };
    restoreSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isInitializing }}>
      {isInitializing ? (
        <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-400">Загрузка...</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);