import { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance, { setAuthToken } from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user_info');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [token, setToken] = useState(null); 
  const [isInitializing, setIsInitializing] = useState(true);

  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.user_id,
        email: payload.email,
        name: `${payload.first_name} ${payload.last_name}`,
        role: payload.role,
        organizationId: payload.organization_id
      };
    } catch (e) {
      return null;
    }
  };

  const login = (access) => {
    const userInfo = decodeToken(access);
    if (userInfo) {
      setAuthToken(access);
      setToken(access);
      setUser(userInfo);
      localStorage.setItem('user_info', JSON.stringify(userInfo));
    }
  };

  const logout = async () => {
    try {
      // Optional: Tell backend to blacklist the refresh token/cookie
      await axiosInstance.post('/api/auth/logout/'); 
    } catch (e) {
      console.error("Logout failed on server", e);
    } finally {
      // ALWAYS clear local state even if server call fails
      setAuthToken(null);
      setToken(null);
      setUser(null);
      localStorage.removeItem('user_info');
      // DO NOT use window.location.href. Let the Router handle it.
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await axiosInstance.post('/api/auth/token/refresh/');
        const { access } = response.data;
        login(access);
      } catch (err) {
        setToken(null);
        // If refresh fails, clear user info as well
        localStorage.removeItem('user_info');
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };
    restoreSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isInitializing }}>
      {!isInitializing && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);