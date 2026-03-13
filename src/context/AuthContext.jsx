// import { createContext, useState, useContext, useEffect } from 'react';
// import axiosInstance, { setAuthToken } from '../api/axiosConfig';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [token, setToken] = useState(null); 
//   const [isInitializing, setIsInitializing] = useState(true);

//   const decodeToken = (token) => {
//     try {
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       return {
//         name: `${payload.first_name} ${payload.last_name}`,
//         role: payload.role,
//       };
//     } catch (e) { return null; }
//   };

//   const login = (access) => {
//     const userInfo = decodeToken(access);
//     if (userInfo) {
//       setAuthToken(access);
//       setToken(access);
//       setUser(userInfo);
//       // We only store UI info in localStorage, NOT the token
//       localStorage.setItem('user_info', JSON.stringify(userInfo));
//     }
//   };

//   const logout = async () => {
//     try {
//       await axiosInstance.post('/api/auth/logout/');
//     } catch (e) { /* ignore */ }
//     setAuthToken(null);
//     setToken(null);
//     setUser(null);
//     localStorage.removeItem('user_info');
//   };

//   useEffect(() => {
//     const restoreSession = async () => {
//       try {
//         // We send an empty object. The REFRESH cookie is sent automatically by the browser
//         const response = await axiosInstance.post('/api/auth/token/refresh/', {});
//         const { access } = response.data;
//         login(access);
//       } catch (err) {
//         console.warn("No active session found via cookies");
//         // Don't logout here, just ensure token is null
//         setToken(null);
//       } finally {
//         setIsInitializing(false);
//       }
//     };
//     restoreSession();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, token, login, logout, isInitializing }}>
//       {isInitializing ? (
//         <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-400">Загрузка...</div>
//       ) : (
//         children
//       )}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

import { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance, { setAuthToken } from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Match Angular: getStoredUser() from localStorage for UI display
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user_info');
    return stored ? JSON.parse(stored) : null;
  });
  
  const [token, setToken] = useState(null); // In memory only
  const [isInitializing, setIsInitializing] = useState(true);

  // Exact replica of Angular's decodeAndStoreUser
  const login = (access) => {
    try {
      const payload = JSON.parse(atob(access.split('.')[1]));
      const userInfo = {
        id: payload.user_id,
        email: payload.email || '',
        name: `${payload.first_name || ''} ${payload.last_name || ''}`,
        role: payload.role || 'engineer',
        organization_id: payload.organization_id ?? null,
      };

      setAuthToken(access); // Axios memory
      setToken(access);     // React memory
      setUser(userInfo);    // React memory
      
      localStorage.setItem('user_info', JSON.stringify(userInfo));
    } catch (e) {
      console.error("Token decoding failed", e);
    }
  };

  const logout = () => {
    axiosInstance.post('/api/auth/logout/').finally(() => {
      setAuthToken(null);
      setToken(null);
      setUser(null);
      localStorage.removeItem('user_info');
    });
  };

  // Exact replica of Angular's tryRestoreSession
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Send empty body, browser attaches HttpOnly cookie
        const res = await axiosInstance.post('/api/auth/token/refresh/', {});
        if (res.data.access) {
          login(res.data.access);
        }
      } catch (err) {
        console.warn("Session restoration failed (No valid cookie)");
        // Don't call logout() here, just ensure token is null
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
        <div className="h-screen flex items-center justify-center bg-[#f9f9f9] text-gray-400">
           {/* Add a spinner here if you want to match Angular */}
           Загрузка...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);