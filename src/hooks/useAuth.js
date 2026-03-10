import { useState } from 'react';
import { loginUser } from '../services/authService';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (identifier, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(identifier, password);
      setUser(data);
      localStorage.setItem('token', data.access); 
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { login, user, loading, error };
};