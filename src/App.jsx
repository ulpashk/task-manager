import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { PublicRoute } from './components/routes/PublicRoute';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { MainLayout } from './components/HomePage/MainLayout';
import { KanbanPage } from './pages/KanbanPage';

const NotFoundRedirect = () => {
  const { token } = useAuth();
  return <Navigate to={token ? "/" : "/login"} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/kanban" element={<KanbanPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundRedirect />} />
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;