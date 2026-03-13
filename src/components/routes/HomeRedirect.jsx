import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const HomeRedirect = () => {
  const { user } = useAuth();

  if (user?.role === 'superadmin') {
    return <Navigate to="/organizations" replace />;
  }
  
  if (user?.role === 'client') {
    return <Navigate to="/portal" replace />;
  }

  return <Navigate to="/tasks" replace />;
};